"use strict";

const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(__dirname, "../work/adv2e102-extracted-pdf0018-0033.json");
const errors = [];

function fail(message) {
  errors.push(message);
}

function expectedPage(questionNumber) {
  const ranges = [
    [1, 5, 18],
    [6, 10, 19],
    [11, 20, 20],
    [21, 29, 21],
    [30, 38, 22],
    [39, 43, 23],
    [44, 52, 24],
    [53, 60, 25],
    [61, 71, 26],
    [72, 85, 30],
    [86, 100, 31]
  ];
  const range = ranges.find(([first, last]) => questionNumber >= first && questionNumber <= last);
  return range && range[2];
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing extraction file: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
if (raw.charCodeAt(0) === 0xfeff) fail("File must not contain a UTF-8 BOM.");
if (/\uFFFD|Ã|Â|â€|ðŸ|Ø|Ù|Û/.test(raw)) fail("File contains replacement characters or likely mojibake.");
if (/\r(?!\n)/.test(raw)) fail("File contains bare carriage returns.");

let records;
try {
  records = JSON.parse(raw);
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(records)) {
  fail("Top-level JSON value must be an array.");
  records = [];
}
if (records.length !== 100) fail(`Expected 100 records, found ${records.length}.`);

const allowedConfidence = new Set(["high", "medium", "low"]);
const seenIds = new Set();

records.forEach((record, index) => {
  const q = index + 1;
  const prefix = `record ${index} / Q${q}`;
  const expectedId = `ADV2E102-U0001-Q${String(q).padStart(3, "0")}`;
  const page = expectedPage(q);

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail(`${prefix}: must be an object.`);
    return;
  }
  if (record.sourceRecordId !== expectedId) fail(`${prefix}: expected id ${expectedId}, found ${record.sourceRecordId}.`);
  if (seenIds.has(record.sourceRecordId)) fail(`${prefix}: duplicate id ${record.sourceRecordId}.`);
  seenIds.add(record.sourceRecordId);
  if (record.corpusId !== "ADV2-2025-V2-E102") fail(`${prefix}: invalid corpusId.`);
  if (record.sourceUnitId !== "U0001") fail(`${prefix}: invalid sourceUnitId.`);
  if (record.sourceQuestionNumber !== q) fail(`${prefix}: non-contiguous sourceQuestionNumber ${record.sourceQuestionNumber}.`);
  if (record.sourceUnitTitle !== "Provincial Management Service, Etc. BS-17 (2019)") fail(`${prefix}: invalid sourceUnitTitle.`);
  if (record.sourcePaperNumber !== 1 || record.sourceYear !== 2019) fail(`${prefix}: invalid paper/year metadata.`);
  if (JSON.stringify(record.sourcePdfPageRange) !== "[18,33]") fail(`${prefix}: invalid sourcePdfPageRange.`);
  if (JSON.stringify(record.sourceBodyPdfPageRange) !== "[18,32]") fail(`${prefix}: invalid sourceBodyPdfPageRange.`);
  if (JSON.stringify(record.sourceBookPageRange) !== "[23,37]") fail(`${prefix}: invalid sourceBookPageRange.`);
  if (record.sourcePdfPage !== page) fail(`${prefix}: expected source PDF page ${page}, found ${record.sourcePdfPage}.`);
  if (record.sourceBookPage !== page + 5) fail(`${prefix}: expected source book page ${page + 5}, found ${record.sourceBookPage}.`);
  if (typeof record.question !== "string" || !record.question.trim()) fail(`${prefix}: question must be nonempty.`);
  if (/\b(?:unreadable|unknown|placeholder|ocr text)\b/i.test(record.question || "")) fail(`${prefix}: question contains a placeholder token.`);
  if (!Array.isArray(record.options) || record.options.length !== 4) {
    fail(`${prefix}: must have exactly four options.`);
  } else {
    record.options.forEach((option, optionIndex) => {
      if (typeof option !== "string" || !option.trim()) fail(`${prefix}: option ${optionIndex} is empty.`);
      if (/\b(?:unreadable|unknown|placeholder|ocr text)\b/i.test(option || "")) fail(`${prefix}: option ${optionIndex} contains a placeholder token.`);
    });
    const normalized = record.options.map((option) => String(option).trim().toLowerCase());
    if (new Set(normalized).size !== 4) fail(`${prefix}: options are not distinct.`);
  }
  if (!Array.isArray(record.answerEvidence) || record.answerEvidence.length !== 1) {
    fail(`${prefix}: expected one printed-answer-key evidence object.`);
  } else {
    const evidence = record.answerEvidence[0];
    if (evidence.kind !== "printed-answer-key") fail(`${prefix}: invalid evidence kind.`);
    if (!Number.isInteger(evidence.optionIndex) || evidence.optionIndex < 0 || evidence.optionIndex > 3) fail(`${prefix}: invalid evidence optionIndex.`);
    if (evidence.sourcePdfPage !== 32) fail(`${prefix}: answer-key evidence must point to PDF page 32.`);
    if (!/final answer requires independent verification/i.test(evidence.notes || "")) fail(`${prefix}: evidence disclaimer is missing.`);
  }
  if (!allowedConfidence.has(record.confidence)) fail(`${prefix}: invalid confidence ${record.confidence}.`);
  if (typeof record.notes !== "string") fail(`${prefix}: notes must be a string.`);
});

if (errors.length) {
  console.error(`ADV2E102 U0001 validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const confidenceCounts = records.reduce((counts, record) => {
  counts[record.confidence] = (counts[record.confidence] || 0) + 1;
  return counts;
}, {});
const noted = records.filter((record) => record.notes).map((record) => record.sourceQuestionNumber);
console.log(`ADV2E102 U0001 validation passed: ${records.length}/100 records, Q001-Q100 contiguous.`);
console.log(`Confidence: high=${confidenceCounts.high || 0}, medium=${confidenceCounts.medium || 0}, low=${confidenceCounts.low || 0}.`);
console.log(`Source-defect notes: ${noted.length} question(s): ${noted.join(", ") || "none"}.`);
