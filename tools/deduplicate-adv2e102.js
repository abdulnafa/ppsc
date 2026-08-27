"use strict";

const fs = require("fs");
const path = require("path");
const {
  bankSnapshot,
  corpusId,
  enrichedFilePattern,
  exactFingerprint,
  loadCurrentBank,
  loadManifest,
  normalizeAliases,
  optionText,
  readArrayFiles,
  sourceOrderKey,
  verificationFilePattern,
  workDirectory
} = require("./adv2e102-common");

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "by", "can", "called",
  "did", "do", "does", "following", "for", "from", "has", "have", "how", "in",
  "is", "it", "its", "known", "of", "on", "or", "that", "the", "their", "these",
  "this", "to", "used", "uses", "was", "were", "what", "when", "where", "which",
  "who", "why", "with", "would"
]);
const discriminatorWords = new Set([
  "not", "except", "incorrect", "false", "least", "first", "last", "largest", "smallest",
  "highest", "lowest", "maximum", "minimum", "previous", "next", "before", "after", "more",
  "less", "increase", "decrease", "up", "down", "left", "right", "source", "destination",
  "insert", "delete", "open", "close", "enable", "disable", "input", "output"
]);

function stemToken(token) {
  if (token.length > 6 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 5 && token.endsWith("ied")) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 5 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function semanticTokens(value) {
  return [...new Set(normalizeAliases(value)
    .replace(/[^\p{L}\p{N}$%#@+*/=<>._\\-]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !stopWords.has(token))
    .map(stemToken))];
}

function trigrams(value) {
  const normalized = semanticTokens(value).join(" ");
  if (normalized.length < 3) return normalized ? [normalized] : [];
  const result = [];
  for (let index = 0; index <= normalized.length - 3; index += 1) result.push(normalized.slice(index, index + 3));
  return result;
}

function discriminators(value) {
  const normalized = normalizeAliases(value);
  const words = normalized.match(/[a-z]+/g) || [];
  const numbersAndSymbols = normalized.match(/(?:\d+(?:[.,]\d+)*(?:%|st|nd|rd|th)?|\.[a-z0-9]+|[$%#@+*/=<>]+)/g) || [];
  return [...new Set([
    ...words.filter((word) => discriminatorWords.has(word)),
    ...numbersAndSymbols
  ])].sort();
}

function intersectionSize(left, right) {
  const rightSet = new Set(right);
  return left.reduce((count, item) => count + (rightSet.has(item) ? 1 : 0), 0);
}

function dice(left, right) {
  if (!left.length || !right.length) return 0;
  return (2 * intersectionSize(left, right)) / (left.length + right.length);
}

function fingerprint(item) {
  const correctIndex = Number(item.correctOptionIndex ?? item.verifiedCorrectIndex);
  const answer = Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < (item.options || []).length
    ? exactFingerprint(optionText(item.options[correctIndex]))
    : "";
  return {
    exact: exactFingerprint(item.question),
    tokens: semanticTokens(item.question),
    trigrams: trigrams(item.question),
    optionTokens: (item.options || []).flatMap((option) => semanticTokens(optionText(option))),
    discriminators: discriminators(item.question),
    answer
  };
}

function prepare(item) {
  return { ...item, _fingerprint: fingerprint(item) };
}

function score(left, right) {
  const a = left._fingerprint;
  const b = right._fingerprint;
  const shared = intersectionSize(a.tokens, b.tokens);
  const tokenDice = a.tokens.length && b.tokens.length ? (2 * shared) / (a.tokens.length + b.tokens.length) : 0;
  const containment = a.tokens.length && b.tokens.length ? shared / Math.min(a.tokens.length, b.tokens.length) : 0;
  const trigramDice = dice(a.trigrams, b.trigrams);
  const optionDice = dice(a.optionTokens, b.optionTokens);
  const exact = Boolean(a.exact && a.exact === b.exact);
  const answerExact = Boolean(a.answer && b.answer && a.answer === b.answer);
  const answerConflict = Boolean(a.answer && b.answer && a.answer !== b.answer);
  const discriminatorConflict = a.discriminators.length || b.discriminators.length
    ? a.discriminators.join("|") !== b.discriminators.join("|")
    : false;
  let combined = exact ? 1 : Math.min(1, (tokenDice * 0.53) + (containment * 0.25) + (trigramDice * 0.17) + (optionDice * 0.05));
  if (!exact && answerExact) combined = Math.min(1, combined + 0.1);
  // Preserve high-surface candidates but label opposite dates, units, directions,
  // negations, and versions as confusable instead of silently treating them as repeats.
  return { exact, combined, tokenDice, containment, trigramDice, optionDice, answerExact, answerConflict, discriminatorConflict };
}

function round(value) {
  return Number(value.toFixed(4));
}

function candidateSummary(candidate, scores) {
  return {
    id: candidate.id,
    pairId: candidate.pairId,
    kind: candidate.kind,
    question: candidate.question,
    correctAnswer: candidate._fingerprint.answer,
    exact: scores.exact,
    combined: round(scores.combined),
    tokenDice: round(scores.tokenDice),
    containment: round(scores.containment),
    trigramDice: round(scores.trigramDice),
    optionDice: round(scores.optionDice),
    answerExact: scores.answerExact,
    answerConflict: scores.answerConflict,
    discriminatorConflict: scores.discriminatorConflict,
    discriminators: candidate._fingerprint.discriminators
  };
}

function isCandidate(scores) {
  return scores.exact || scores.combined >= 0.56 ||
    (scores.containment >= 0.78 && scores.tokenDice >= 0.52) ||
    (scores.answerExact && scores.containment >= 0.5 && scores.tokenDice >= 0.4);
}

function bestCandidates(question, pool, limit = 8) {
  return pool
    .map((candidate) => ({ candidate, scores: score(question, candidate) }))
    .filter(({ scores }) => isCandidate(scores))
    .sort((left, right) => right.scores.combined - left.scores.combined)
    .slice(0, limit)
    .map(({ candidate, scores }) => candidateSummary(candidate, scores));
}

let manifest = { sourceUnits: [] };
try {
  manifest = loadManifest();
} catch (caught) {
  console.error(`ERROR ${caught.message}`);
  process.exitCode = 1;
}
const unitOrder = new Map((manifest.sourceUnits || []).map((unit, index) => [unit.sourceUnitId, index + 1]));
let baselineQuestions;
let verificationData;
let enrichedData;
try {
  baselineQuestions = loadCurrentBank({ includeAdv2e102: false });
  verificationData = readArrayFiles(verificationFilePattern);
  enrichedData = readArrayFiles(enrichedFilePattern);
} catch (caught) {
  console.error(`ERROR ${caught.message}`);
  process.exit(1);
}

const existing = baselineQuestions.map((item) => prepare({
  id: item.id,
  pairId: item.pairId,
  kind: item.kind,
  question: item.question,
  options: item.options,
  correctOptionIndex: item.correctOptionIndex
}));
const sourceCandidates = verificationData.records
  .filter((item) => item.verificationStatus === "verified")
  .map((item) => prepare({
    id: `${item.sourceRecordId}-SRC`,
    pairId: item.sourceRecordId,
    sourceRecordId: item.sourceRecordId,
    kind: "source",
    question: item.question,
    options: item.options,
    correctOptionIndex: item.verifiedCorrectIndex
  }));
const similarCandidates = enrichedData.records
  .filter((item) => item.kind === "similar")
  .map((item) => prepare(item));
const candidates = [...sourceCandidates, ...similarCandidates].sort((left, right) => {
  const orderDifference = sourceOrderKey(left.pairId, unitOrder) - sourceOrderKey(right.pairId, unitOrder);
  if (orderDifference) return orderDifference;
  return left.kind === right.kind ? 0 : left.kind === "source" ? -1 : 1;
});

const report = [];
for (let index = 0; index < candidates.length; index += 1) {
  const question = candidates[index];
  const existingCandidates = bestCandidates(question, existing);
  const earlierAdv2e102Candidates = bestCandidates(question, candidates.slice(0, index));
  const all = [...existingCandidates, ...earlierAdv2e102Candidates];
  const exactConflict = all.some((candidate) => candidate.exact && candidate.answerConflict);
  const exactRepeat = all.some((candidate) => candidate.exact && !candidate.answerConflict);
  const likelySemantic = all.some((candidate) => candidate.combined >= 0.78 && !candidate.discriminatorConflict && !candidate.answerConflict);
  const confusable = all.some((candidate) => candidate.discriminatorConflict || candidate.answerConflict);
  report.push({
    id: question.id,
    pairId: question.pairId,
    kind: question.kind,
    question: question.question,
    correctAnswer: question._fingerprint.answer,
    discriminators: question._fingerprint.discriminators,
    recommendation: exactConflict
      ? "review-answer-conflict"
      : exactRepeat
        ? "skip-exact"
        : likelySemantic
          ? "review-likely-semantic-duplicate"
          : confusable
            ? "review-confusable-distinct-fact"
            : all.length
              ? "review-semantic"
              : "no-candidate",
    existingCandidates,
    earlierAdv2e102Candidates
  });
}

const output = {
  schemaVersion: 1,
  corpusId,
  baseline: bankSnapshot(baselineQuestions),
  candidateCount: candidates.length,
  policy: "Candidate scores never make final skip decisions. Negation, date/version, number/unit, direction, ordinal, and answer conflicts require manual proposition review.",
  candidates: report
};
const stdoutOnly = process.argv.includes("--stdout");
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));
const outputPath = outputArgument
  ? path.resolve(outputArgument.slice("--output=".length))
  : path.join(workDirectory, "adv2e102-dedup-candidates.json");
if (stdoutOnly) {
  console.log(JSON.stringify(output, null, 2));
} else {
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`ADV2E102 candidates: ${candidates.length}; existing bank: ${baselineQuestions.length}; report: ${outputPath}`);
}
