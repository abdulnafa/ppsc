"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const complete = process.argv.includes("--complete");
const expectedNumbers = Array.from({ length: 1296 }, (_, index) => index + 1)
  .filter((number) => number !== 254);
const expectedSet = new Set(expectedNumbers);

let errors = 0;
let warnings = 0;

function error(message) {
  errors += 1;
  console.error(`ERROR ${message}`);
}

function warning(message) {
  warnings += 1;
  console.warn(`WARN  ${message}`);
}

function readArrays(pattern, label) {
  const files = fs.readdirSync(workDirectory).filter((name) => pattern.test(name)).sort();
  const records = [];
  for (const name of files) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    } catch (readError) {
      error(`${name}: cannot parse JSON (${readError.message})`);
      continue;
    }
    if (!Array.isArray(parsed)) {
      error(`${name}: ${label} file must contain an array`);
      continue;
    }
    records.push(...parsed.map((record) => ({ ...record, _file: name })));
  }
  return { files, records };
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bmicrosoft\b/g, "ms")
    .replace(/\bpower[\s-]*point\b/g, "powerpoint")
    .replace(/\be[\s-]*mail\b/g, "email")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option || "").trim();
}

// Options may legitimately consist only of symbols (for example $, *, or #)
// or differ through Excel-reference punctuation ($A1 versus A$1).  The broad
// question normalizer intentionally removes punctuation, so it must not be
// used to decide whether answer choices are empty or distinct.
function optionIdentity(option) {
  return optionText(option)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function loadExistingQuestions() {
  const code = fs.readFileSync(path.join(projectDirectory, "data", "questions.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/questions.js" });
  return sandbox.window.PPSC_QUIZ_DATA && Array.isArray(sandbox.window.PPSC_QUIZ_DATA.questions)
    ? sandbox.window.PPSC_QUIZ_DATA.questions.filter((question) => !/^IBES-/i.test(String(question.id || "")))
    : [];
}

function indexByNumber(records, label) {
  const index = new Map();
  for (const record of records) {
    const number = Number(record.sourceQuestionNumber);
    if (!expectedSet.has(number)) {
      error(`${record._file}: ${label} has invalid sourceQuestionNumber ${record.sourceQuestionNumber}`);
      continue;
    }
    if (index.has(number)) error(`Q${number}: duplicate ${label} records in ${index.get(number)._file} and ${record._file}`);
    index.set(number, record);
  }
  return index;
}

const verificationData = readArrays(/^ibes-verification-p\d{3}-\d{3,4}\.json$/i, "verification");
const decisionData = readArrays(/^ibes-dedup-decisions-p\d{3}-\d{3,4}\.json$/i, "decision");
const enrichedData = readArrays(/^enriched-ibes-[a-z0-9-]+\.json$/i, "enriched");
const verificationByNumber = indexByNumber(verificationData.records, "verification");
const decisionByNumber = indexByNumber(decisionData.records, "decision");

if (complete) {
  for (const number of expectedNumbers) {
    if (!verificationByNumber.has(number)) error(`Q${number}: missing verification record`);
    if (!decisionByNumber.has(number)) error(`Q${number}: missing de-duplication decision`);
  }
  if (verificationByNumber.size !== expectedNumbers.length) {
    error(`verification coverage is ${verificationByNumber.size}/${expectedNumbers.length}`);
  }
  if (decisionByNumber.size !== expectedNumbers.length) {
    error(`decision coverage is ${decisionByNumber.size}/${expectedNumbers.length}`);
  }
}

let keepCount = 0;
let skipCount = 0;
for (const [number, decision] of decisionByNumber) {
  if (!['keep', 'skip'].includes(decision.action)) {
    error(`Q${number}: decision action must be keep or skip`);
    continue;
  }
  if (decision.reviewStatus !== "verified") error(`Q${number}: decision must have reviewStatus=verified`);
  if (String(decision.reason || "").trim().length < 8) error(`Q${number}: decision needs a concise reason`);
  if (decision.action === "keep") {
    keepCount += 1;
    if (String(decision.duplicateOf || "").trim()) error(`Q${number}: keep decision must not set duplicateOf`);
  } else {
    skipCount += 1;
    if (!/^(?:P23[4-9]-Q\d{3}-(?:SRC|SIM)|IBES-Q\d{4})$/i.test(String(decision.duplicateOf || ""))) {
      error(`Q${number}: skip decision needs an existing question ID or canonical IBES pairId in duplicateOf`);
    } else {
      const ibesTarget = String(decision.duplicateOf).match(/^IBES-Q(\d{4})$/i);
      if (ibesTarget) {
        const targetNumber = Number(ibesTarget[1]);
        const targetDecision = decisionByNumber.get(targetNumber);
        if (targetNumber >= number) error(`Q${number}: duplicateOf must point to an earlier canonical IBES question`);
        if (targetDecision && targetDecision.action !== "keep") error(`Q${number}: duplicateOf points to skipped IBES Q${targetNumber}`);
      }
    }
  }
}

const enrichedIds = new Set();
const enrichedByPair = new Map();
for (const item of enrichedData.records) {
  if (!item || typeof item !== "object") {
    error(`${item && item._file}: invalid enriched item`);
    continue;
  }
  if (enrichedIds.has(item.id)) error(`${item.id}: duplicate enriched ID`);
  enrichedIds.add(item.id);
  const match = String(item.pairId || "").match(/^IBES-Q(\d{4})$/);
  if (!match) {
    error(`${item.id || item._file}: invalid IBES pairId`);
    continue;
  }
  const number = Number(match[1]);
  const pair = enrichedByPair.get(number) || [];
  pair.push(item);
  enrichedByPair.set(number, pair);
}

const existingQuestions = loadExistingQuestions();
const existingByNormalizedQuestion = new Map();
for (const question of existingQuestions) {
  const key = normalize(question.question);
  if (key && !existingByNormalizedQuestion.has(key)) existingByNormalizedQuestion.set(key, question.id);
}
const keptSourceByNormalizedQuestion = new Map();
const allNewByNormalizedQuestion = new Map();
const verificationByNormalizedQuestion = new Map();
for (const verification of verificationByNumber.values()) {
  const key = normalize(verification.question);
  const numbers = verificationByNormalizedQuestion.get(key) || [];
  numbers.push(verification.sourceQuestionNumber);
  verificationByNormalizedQuestion.set(key, numbers);
}

for (const number of expectedNumbers) {
  const decision = decisionByNumber.get(number);
  const pair = enrichedByPair.get(number) || [];
  if (!decision) continue;
  if (decision.action === "skip") {
    if (pair.length) error(`Q${number}: skipped duplicate still has ${pair.length} enriched items`);
    continue;
  }
  if (!pair.length && !complete) continue;
  if (pair.length !== 2) {
    error(`Q${number}: kept item has ${pair.length} enriched records instead of source + similar`);
    continue;
  }
  const source = pair.find((item) => item.kind === "source");
  const similar = pair.find((item) => item.kind === "similar");
  if (!source || !similar) {
    error(`Q${number}: enriched pair must contain one source and one similar item`);
    continue;
  }
  const verification = verificationByNumber.get(number);
  if (!verification) continue;
  if (source.id !== `IBES-Q${String(number).padStart(4, "0")}-SRC`) error(`Q${number}: source ID is incorrect`);
  if (similar.id !== `IBES-Q${String(number).padStart(4, "0")}-SIM`) error(`Q${number}: similar ID is incorrect`);
  if (source.question !== verification.question) error(`Q${number}: source question differs from verified ledger`);
  if (JSON.stringify(source.options) !== JSON.stringify(verification.options)) error(`Q${number}: source options differ from verified ledger`);
  if (source.correctOptionIndex !== verification.verifiedCorrectIndex) error(`Q${number}: source answer differs from verified ledger`);
  if (source.source && source.source.referenceUrl !== verification.referenceUrl) error(`Q${number}: source URL differs from verified ledger`);
  if (source.source && source.source.accessedOn !== verification.accessedOn) error(`Q${number}: source access date differs from verified ledger`);
  if (source.question === similar.question) error(`Q${number}: similar question repeats source wording exactly`);

  for (const item of [source, similar]) {
    if (!Array.isArray(item.options) || item.options.length !== 4) error(`${item.id}: must have exactly four options`);
    else {
      const options = item.options.map(optionIdentity);
      if (options.some((option) => !option)) error(`${item.id}: has an empty option`);
      if (new Set(options).size !== 4) error(`${item.id}: options are not distinct`);
    }
    if (!Number.isInteger(item.correctOptionIndex) || item.correctOptionIndex < 0 || item.correctOptionIndex > 3) {
      error(`${item.id}: invalid correctOptionIndex`);
    }
    const translation = String(item.questionUrdu || "").trim();
    const urduCharacters = (translation.match(/[\u0600-\u06ff]/gu) || []).length;
    if (urduCharacters < 8) error(`${item.id}: needs a genuine Urdu-script question translation`);
    if (/^(?:سوال|ترجمہ)\s*[:：-]?\s*[A-Za-z]/u.test(translation)) {
      error(`${item.id}: Urdu translation is only a label followed by English text`);
    }
    if (!/^https?:\/\//i.test((item.source || {}).referenceUrl || "")) error(`${item.id}: needs a direct research URL`);
  }

  const sourceKey = normalize(source.question);
  if (existingByNormalizedQuestion.has(sourceKey)) {
    error(`Q${number}: repeats existing ${existingByNormalizedQuestion.get(sourceKey)} but decision says keep`);
  }
  if (keptSourceByNormalizedQuestion.has(sourceKey)) {
    error(`Q${number}: exact source duplicate of IBES Q${keptSourceByNormalizedQuestion.get(sourceKey)}`);
  } else {
    keptSourceByNormalizedQuestion.set(sourceKey, number);
  }
  for (const item of [source, similar]) {
    const key = normalize(item.question);
    if (existingByNormalizedQuestion.has(key)) {
      error(`${item.id}: exact wording repeats existing ${existingByNormalizedQuestion.get(key)}`);
    }
    if (allNewByNormalizedQuestion.has(key)) error(`${item.id}: exact wording also used by ${allNewByNormalizedQuestion.get(key)}`);
    else allNewByNormalizedQuestion.set(key, item.id);
    if (item.kind === "similar") {
      const matchingSources = (verificationByNormalizedQuestion.get(key) || [])
        .filter((matchingNumber) => matchingNumber !== number);
      for (const matchingNumber of matchingSources) {
        const matchingDecision = decisionByNumber.get(matchingNumber);
        if (matchingDecision && matchingDecision.action === "keep") {
          error(`${item.id}: exact wording duplicates kept verified source Q${matchingNumber}`);
        }
      }
    }
  }
}

for (const number of enrichedByPair.keys()) {
  if (!expectedSet.has(number)) error(`IBES-Q${String(number).padStart(4, "0")}: enriched item is outside source inventory`);
  if (!decisionByNumber.has(number)) error(`IBES-Q${String(number).padStart(4, "0")}: enriched item has no decision`);
}

console.log(`IBES final: verification ${verificationByNumber.size}/${expectedNumbers.length}; decisions ${decisionByNumber.size}/${expectedNumbers.length}; keep ${keepCount}; skip ${skipCount}; enriched ${enrichedData.records.length} items (${enrichedByPair.size} pairs); ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
