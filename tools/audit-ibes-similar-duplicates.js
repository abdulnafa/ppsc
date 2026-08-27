"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "does", "for", "from",
  "how", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "used",
  "uses", "was", "what", "when", "where", "which", "who", "with"
]);

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option || "").trim();
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bmicrosoft\b/g, "ms")
    .replace(/\bpower[\s-]*point\b/g, "powerpoint")
    .replace(/\be[\s-]*mail\b/g, "email")
    .replace(/\bworld\s+wide\s+web\b/g, "www")
    .replace(/\bcentral\s+processing\s+unit\b/g, "cpu")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stem(token) {
  if (token.length > 6 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 5 && token.endsWith("ied")) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 5 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokens(value) {
  return [...new Set(normalize(value).split(/\s+/).filter(Boolean).filter((token) => !stopWords.has(token)).map(stem))];
}

function prepare(item) {
  const questionTokens = tokens(item.question);
  const answerTokens = tokens(optionText(item.options[item.correctOptionIndex])).sort().join(" ");
  return {
    ...item,
    _questionTokens: questionTokens,
    _questionTokenSet: new Set(questionTokens),
    _normalizedQuestion: normalize(item.question),
    _answerTokens: answerTokens
  };
}

function score(left, right) {
  const leftTokens = left._questionTokens;
  const rightTokens = right._questionTokens;
  const shared = leftTokens.reduce(
    (count, item) => count + (right._questionTokenSet.has(item) ? 1 : 0),
    0
  );
  const dice = leftTokens.length && rightTokens.length ? (2 * shared) / (leftTokens.length + rightTokens.length) : 0;
  const containment = leftTokens.length && rightTokens.length ? shared / Math.min(leftTokens.length, rightTokens.length) : 0;
  const leftAnswer = left._answerTokens;
  const rightAnswer = right._answerTokens;
  const generic = new Set(["above all", "all these", "above none", "none these"]);
  const answerExact = Boolean(leftAnswer && rightAnswer && leftAnswer === rightAnswer && !generic.has(leftAnswer));
  const exact = left._normalizedQuestion === right._normalizedQuestion;
  const likely = exact || (answerExact && dice >= 0.48 && containment >= 0.62) || (dice >= 0.8 && containment >= 0.85);
  return { exact, likely, answerExact, dice, containment };
}

function loadDecisions() {
  const decisions = new Map();
  for (const name of fs.readdirSync(workDirectory).filter((file) => /^ibes-dedup-decisions-p\d{3}-\d{3,4}\.json$/i.test(file))) {
    for (const item of JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"))) {
      decisions.set(item.sourceQuestionNumber, item.action);
    }
  }
  return decisions;
}

function loadVerification(decisions) {
  return fs.readdirSync(workDirectory)
    .filter((name) => /^ibes-verification-p\d{3}-\d{3,4}\.json$/i.test(name))
    .sort()
    .flatMap((name) => JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8")))
    .filter((item) => decisions.get(item.sourceQuestionNumber) !== "skip")
    .map((item) => prepare({
      id: `IBES-Q${String(item.sourceQuestionNumber).padStart(4, "0")}`,
      sourceQuestionNumber: item.sourceQuestionNumber,
      question: item.question,
      options: item.options,
      correctOptionIndex: item.verifiedCorrectIndex,
      kind: "verified-source"
    }));
}

function loadExisting() {
  const code = fs.readFileSync(path.join(projectDirectory, "data", "questions.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/questions.js" });
  return sandbox.window.PPSC_QUIZ_DATA.questions
    .filter((item) => !/^IBES-/i.test(String(item.id || "")))
    .map((item) => prepare({
      id: item.id,
      question: item.question,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      kind: "existing"
    }));
}

function loadEnrichedSimilar() {
  return fs.readdirSync(workDirectory)
    .filter((name) => /^enriched-ibes-[a-z0-9-]+\.json$/i.test(name))
    .sort()
    .flatMap((name) => JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8")))
    .filter((item) => item.kind === "similar")
    .map(prepare);
}

const decisions = loadDecisions();
const verification = loadVerification(decisions);
const existing = loadExisting();
const similar = loadEnrichedSimilar();
const priorSimilar = [];
const findings = [];

for (const item of similar) {
  const ownNumber = Number((String(item.pairId).match(/^IBES-Q(\d{4})$/) || [])[1]);
  const comparisons = existing.concat(verification.filter((candidate) => candidate.sourceQuestionNumber !== ownNumber), priorSimilar);
  const candidates = comparisons
    .map((candidate) => ({ candidate, scores: score(item, candidate) }))
    .filter(({ scores }) => scores.likely)
    .sort((left, right) => Number(right.scores.exact) - Number(left.scores.exact) || right.scores.dice - left.scores.dice)
    .slice(0, 8)
    .map(({ candidate, scores }) => ({
      id: candidate.id,
      question: candidate.question,
      exact: scores.exact,
      answerExact: scores.answerExact,
      dice: Number(scores.dice.toFixed(4)),
      containment: Number(scores.containment.toFixed(4))
    }));
  if (candidates.length) findings.push({ id: item.id, question: item.question, candidates });
  priorSimilar.push(item);
}

const outputPath = path.join(workDirectory, "ocr", "ibes-2025", "similar-duplicate-audit.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(findings, null, 2)}\n`, "utf8");
const exactCount = findings.filter((finding) => finding.candidates.some((candidate) => candidate.exact)).length;
console.log(`IBES similar duplicate audit: ${similar.length} similar items; ${findings.length} review findings; ${exactCount} exact-wording findings.`);
console.log(`Report: ${outputPath}`);
if (exactCount) process.exitCode = 1;
