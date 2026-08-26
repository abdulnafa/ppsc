"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const extractionPattern = /^ibes-extracted-p\d{3}-\d{3}\.json$/i;
const outputPath = path.join(workDirectory, "ocr", "ibes-2025", "dedup-report.json");

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "by", "can", "called",
  "did", "do", "does", "following", "for", "from", "has", "have", "how", "in",
  "is", "it", "its", "known", "of", "on", "or", "that", "the", "their", "these",
  "this", "to", "used", "uses", "was", "were", "what", "when", "where", "which",
  "who", "why", "with", "would"
]);

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option || "").trim();
}

function normalizeAliases(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bmicrosoft\b/g, "ms")
    .replace(/\bpower[\s-]*point\b/g, "powerpoint")
    .replace(/\be[\s-]*mail\b/g, "email")
    .replace(/\bworld\s+wide\s+web\b/g, "www")
    .replace(/\bcentral\s+processing\s+unit\b/g, "cpu")
    .replace(/\brandom\s+access\s+memory\b/g, "ram")
    .replace(/\bread\s+only\s+memory\b/g, "rom")
    .replace(/\boperating\s+system\b/g, "os")
    .replace(/\bgraphical\s+user\s+interface\b/g, "gui")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stemToken(token) {
  if (token.length > 6 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 5 && token.endsWith("ied")) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 5 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokens(value) {
  return [...new Set(normalizeAliases(value)
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !stopWords.has(token))
    .map(stemToken))];
}

function grams(value) {
  const normalized = normalizeAliases(value).replace(/\s+/g, " ");
  if (normalized.length < 3) return [normalized];
  const result = [];
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    result.push(normalized.slice(index, index + 3));
  }
  return result;
}

function intersectionSize(left, right) {
  const rightSet = new Set(right);
  return left.reduce((count, item) => count + (rightSet.has(item) ? 1 : 0), 0);
}

function dice(left, right) {
  if (!left.length || !right.length) return 0;
  return (2 * intersectionSize(left, right)) / (left.length + right.length);
}

function fingerprint(question) {
  const correctIndex = Number(question.correctOptionIndex ?? question.verifiedCorrectIndex ?? question.printedCorrectIndex);
  const correctAnswer = Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < (question.options || []).length
    ? tokens(optionText(question.options[correctIndex])).sort().join(" ")
    : "";
  return {
    normalized: normalizeAliases(question.question),
    tokens: tokens(question.question),
    grams: grams(question.question),
    optionTokens: (question.options || []).flatMap((option) => tokens(optionText(option))),
    correctAnswer
  };
}

function prepare(question) {
  return { ...question, _fingerprint: fingerprint(question) };
}

function scoreQuestions(left, right) {
  const leftFingerprint = left._fingerprint || fingerprint(left);
  const rightFingerprint = right._fingerprint || fingerprint(right);
  const leftNormalized = leftFingerprint.normalized;
  const rightNormalized = rightFingerprint.normalized;
  const leftTokens = leftFingerprint.tokens;
  const rightTokens = rightFingerprint.tokens;
  const shared = intersectionSize(leftTokens, rightTokens);
  const tokenDice = leftTokens.length && rightTokens.length
    ? (2 * shared) / (leftTokens.length + rightTokens.length)
    : 0;
  const containment = leftTokens.length && rightTokens.length
    ? shared / Math.min(leftTokens.length, rightTokens.length)
    : 0;
  const trigramDice = dice(leftFingerprint.grams, rightFingerprint.grams);
  const optionDice = dice(leftFingerprint.optionTokens, rightFingerprint.optionTokens);
  const genericAnswers = new Set(["all these", "above all", "none these", "above none"]);
  const answerExact = Boolean(
    leftFingerprint.correctAnswer &&
    rightFingerprint.correctAnswer &&
    !genericAnswers.has(leftFingerprint.correctAnswer) &&
    leftFingerprint.correctAnswer === rightFingerprint.correctAnswer
  );
  const answerConflict = Boolean(
    leftFingerprint.correctAnswer &&
    rightFingerprint.correctAnswer &&
    !genericAnswers.has(leftFingerprint.correctAnswer) &&
    !genericAnswers.has(rightFingerprint.correctAnswer) &&
    leftFingerprint.correctAnswer !== rightFingerprint.correctAnswer
  );
  const exact = Boolean(leftNormalized && leftNormalized === rightNormalized);
  let combined = exact
    ? 1
    : Math.min(1, (tokenDice * 0.52) + (containment * 0.23) + (trigramDice * 0.18) + (optionDice * 0.07));
  if (!exact && answerExact) combined = Math.min(1, combined + 0.12);
  if (!exact && answerConflict) combined *= 0.62;
  return { exact, combined, tokenDice, containment, trigramDice, optionDice, answerExact, answerConflict };
}

function loadExistingQuestions() {
  const code = fs.readFileSync(path.join(projectDirectory, "data", "questions.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/questions.js" });
  const data = sandbox.window.PPSC_QUIZ_DATA;
  if (!data || !Array.isArray(data.questions)) throw new Error("Could not load PPSC_QUIZ_DATA questions.");
  return data.questions.map((question) => prepare({
    id: question.id,
    question: question.question,
    options: question.options || [],
    correctOptionIndex: question.correctOptionIndex,
    categoryId: question.categoryId,
    source: "existing"
  }));
}

function loadIbesQuestions() {
  const files = fs.readdirSync(workDirectory).filter((name) => extractionPattern.test(name)).sort();
  if (!files.length) throw new Error("No IBES extraction files found.");
  const verificationByNumber = new Map();
  const verificationFiles = fs.readdirSync(workDirectory)
    .filter((name) => /^ibes-verification-p\d{3}-\d{3,4}\.json$/i.test(name))
    .sort();
  for (const name of verificationFiles) {
    const items = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    if (!Array.isArray(items)) throw new Error(`${name} must contain a JSON array.`);
    for (const item of items) {
      const number = Number(item.sourceQuestionNumber);
      if (!Number.isInteger(number)) continue;
      if (verificationByNumber.has(number)) throw new Error(`Duplicate IBES verification for Q${number}.`);
      verificationByNumber.set(number, item);
    }
  }
  const records = files.flatMap((name) => {
    const parsed = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    if (!Array.isArray(parsed)) throw new Error(`${name} must contain a JSON array.`);
    return parsed.map((question) => {
      const verified = verificationByNumber.get(question.sourceQuestionNumber);
      return prepare({
        ...question,
        ...(verified ? {
          question: verified.question,
          options: verified.options,
          correctOptionIndex: verified.verifiedCorrectIndex,
          verificationFile: name
        } : { correctOptionIndex: question.printedCorrectIndex }),
        extractionFile: name
      });
    });
  });
  return records.sort((left, right) => left.sourceQuestionNumber - right.sourceQuestionNumber);
}

function candidateSummary(candidate, scores) {
  const correctIndex = Number(candidate.correctOptionIndex ?? candidate.verifiedCorrectIndex ?? candidate.printedCorrectIndex);
  return {
    id: candidate.id || `IBES-Q${String(candidate.sourceQuestionNumber).padStart(4, "0")}`,
    question: candidate.question,
    sourceQuestionNumber: candidate.sourceQuestionNumber,
    correctAnswer: Number.isInteger(correctIndex) ? optionText(candidate.options[correctIndex]) : "",
    combined: Number(scores.combined.toFixed(4)),
    exact: scores.exact,
    tokenDice: Number(scores.tokenDice.toFixed(4)),
    containment: Number(scores.containment.toFixed(4)),
    trigramDice: Number(scores.trigramDice.toFixed(4)),
    optionDice: Number(scores.optionDice.toFixed(4)),
    answerExact: scores.answerExact,
    answerConflict: scores.answerConflict
  };
}

const existing = loadExistingQuestions();
const ibes = loadIbesQuestions();
const report = [];

for (let index = 0; index < ibes.length; index += 1) {
  const question = ibes[index];
  const existingCandidates = existing
    .map((candidate) => ({ candidate, scores: scoreQuestions(question, candidate) }))
    .filter(({ scores }) => (
      scores.exact ||
      scores.combined >= 0.54 ||
      (scores.containment >= 0.8 && scores.tokenDice >= 0.55) ||
      (scores.answerExact && scores.containment >= 0.5 && scores.tokenDice >= 0.4)
    ))
    .sort((left, right) => right.scores.combined - left.scores.combined)
    .slice(0, 5)
    .map(({ candidate, scores }) => candidateSummary(candidate, scores));

  const earlierCandidates = ibes.slice(0, index)
    .map((candidate) => ({ candidate, scores: scoreQuestions(question, candidate) }))
    .filter(({ scores }) => (
      scores.exact ||
      scores.combined >= 0.57 ||
      (scores.containment >= 0.82 && scores.tokenDice >= 0.58) ||
      (scores.answerExact && scores.containment >= 0.5 && scores.tokenDice >= 0.4)
    ))
    .sort((left, right) => right.scores.combined - left.scores.combined)
    .slice(0, 5)
    .map(({ candidate, scores }) => candidateSummary(candidate, scores));

  const bestScore = Math.max(
    existingCandidates[0] ? existingCandidates[0].combined : 0,
    earlierCandidates[0] ? earlierCandidates[0].combined : 0
  );
  const allCandidates = [...existingCandidates, ...earlierCandidates];
  const exact = allCandidates.some((candidate) => candidate.exact);
  const answerMatchedFact = allCandidates.some((candidate) => (
    candidate.answerExact && candidate.containment >= 0.5 && candidate.tokenDice >= 0.4
  ));
  report.push({
    sourceQuestionNumber: question.sourceQuestionNumber,
    sourcePdfPage: question.sourcePdfPage,
    question: question.question,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    recommendation: exact
      ? "skip-exact"
      : bestScore >= 0.78 || answerMatchedFact
        ? "review-likely-duplicate"
        : bestScore >= 0.54
          ? "review"
          : "keep",
    existingCandidates,
    earlierIbesCandidates: earlierCandidates
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const counts = report.reduce((totals, item) => {
  totals[item.recommendation] = (totals[item.recommendation] || 0) + 1;
  return totals;
}, {});
console.log(`IBES questions: ${ibes.length}; existing questions compared: ${existing.length}`);
console.log(counts);
console.log(`Report: ${outputPath}`);
