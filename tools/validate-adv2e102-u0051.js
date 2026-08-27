"use strict";

const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(__dirname, "../work/adv2e102-extracted-pdf0417-0423.json");
const errors = [];
const fail = (message) => errors.push(message);

function expectedPage(questionNumber) {
  if (questionNumber <= 26) return 418;
  if (questionNumber <= 55) return 419;
  if (questionNumber <= 81) return 420;
  return 421;
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing extraction file: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
if (raw.charCodeAt(0) === 0xfeff) fail("File must not contain a UTF-8 BOM.");
if (/\uFFFD|Ãƒ|Ã‚|Ã¢â‚¬|Ã°Å¸|Ã˜|Ã™|Ã›/.test(raw)) fail("File contains replacement characters or likely mojibake.");
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
for (let index = 0; index < records.length; index += 1) {
  const record = records[index];
  const number = index + 1;
  const location = `Q${String(number).padStart(3, "0")}`;
  const expectedId = `ADV2E102-U0051-${location}`;
  const page = expectedPage(number);
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail(`${location}: record must be an object.`);
    continue;
  }
  if (record.sourceRecordId !== expectedId) fail(`${location}: expected id ${expectedId}, found ${record.sourceRecordId}.`);
  if (seenIds.has(record.sourceRecordId)) fail(`${location}: duplicate id ${record.sourceRecordId}.`);
  seenIds.add(record.sourceRecordId);
  if (record.corpusId !== "ADV2-2025-V2-E102" || record.sourceUnitId !== "U0051") fail(`${location}: invalid corpus/unit metadata.`);
  if (record.sourceUnitTitle !== "Formal Paper 51" || record.sourcePaperNumber !== 51 || record.sourceYear !== 2020) fail(`${location}: invalid title/paper/year metadata.`);
  if (JSON.stringify(record.sourcePdfPageRange) !== "[417,423]") fail(`${location}: invalid sourcePdfPageRange.`);
  if (JSON.stringify(record.sourceBodyPdfPageRange) !== "[418,421]") fail(`${location}: invalid sourceBodyPdfPageRange.`);
  if (JSON.stringify(record.sourceBookPageRange) !== "[422,425]") fail(`${location}: invalid sourceBookPageRange.`);
  if (record.sourceQuestionNumber !== number) fail(`${location}: non-contiguous sourceQuestionNumber.`);
  if (record.sourcePdfPage !== page || record.sourceBookPage !== page + 4) fail(`${location}: invalid source page mapping.`);
  if (typeof record.question !== "string" || !record.question.trim()) fail(`${location}: question is empty.`);
  if (/\b(?:unreadable|unknown|placeholder|ocr text)\b/i.test(record.question || "")) fail(`${location}: question contains a placeholder.`);
  if (!Array.isArray(record.options) || record.options.length !== 4 || record.options.some((option) => typeof option !== "string" || !option.trim())) {
    fail(`${location}: must contain exactly four nonempty options.`);
  } else {
    const normalized = record.options.map((option) => option.trim().toLowerCase());
    if (new Set(normalized).size !== 4 && !String(record.notes || "").trim()) fail(`${location}: duplicate source options require a note.`);
  }
  if (!Array.isArray(record.answerEvidence) || record.answerEvidence.length !== 1) {
    fail(`${location}: expected one answer-evidence record.`);
  } else {
    const evidence = record.answerEvidence[0];
    if (evidence.kind !== "printed-answer-key" || evidence.sourcePdfPage !== 422) fail(`${location}: invalid printed-key evidence.`);
    if (!Number.isInteger(evidence.optionIndex) || evidence.optionIndex < 0 || evidence.optionIndex > 3) fail(`${location}: invalid printed option index.`);
    if (!/final answer requires independent verification/i.test(evidence.notes || "")) fail(`${location}: evidence disclaimer is missing.`);
  }
  if (!allowedConfidence.has(record.confidence)) fail(`${location}: invalid confidence ${record.confidence}.`);
  if (typeof record.notes !== "string") fail(`${location}: notes must be a string.`);
}

if (errors.length) {
  console.error(`ADV2E102 U0051 extraction validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const counts = records.reduce((result, record) => {
  result[record.confidence] = (result[record.confidence] || 0) + 1;
  return result;
}, {});
const noted = records.filter((record) => record.notes).map((record) => record.sourceQuestionNumber);
console.log(`ADV2E102 U0051 extraction passed: ${records.length}/100 records, Q001-Q100 contiguous.`);
console.log(`Pages: PDF 418-421 / book 422-425; answer key PDF 422.`);
console.log(`Confidence: high=${counts.high || 0}, medium=${counts.medium || 0}, low=${counts.low || 0}.`);
console.log(`Transcription/source notes: ${noted.length} question(s): ${noted.join(", ") || "none"}.`);
