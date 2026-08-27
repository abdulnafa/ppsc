"use strict";

const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(__dirname, "../work/adv2e102-extracted-pdf0881-0888.json");
const errors = [];
const fail = (message) => errors.push(message);

function expectedPage(number) {
  if (number <= 4) return 881;
  if (number <= 18) return 882;
  if (number <= 35) return 883;
  if (number <= 52) return 884;
  if (number <= 66) return 885;
  if (number <= 84) return 886;
  return 887;
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing extraction file: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
if (raw.charCodeAt(0) === 0xfeff) fail("File must not contain a UTF-8 BOM.");
if (/\uFFFD|ÃƒÆ’|Ãƒâ€š|ÃƒÂ¢Ã¢â€šÂ¬|ÃƒÂ°Ã…Â¸|ÃƒËœ|Ãƒâ„¢|Ãƒâ€º/.test(raw)) fail("File contains replacement characters or likely mojibake.");

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
  const label = `Q${String(number).padStart(3, "0")}`;
  const expectedId = `ADV2E102-U0121-${label}`;
  const page = expectedPage(number);
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail(`${label}: record must be an object.`);
    continue;
  }
  if (record.sourceRecordId !== expectedId) fail(`${label}: expected id ${expectedId}, found ${record.sourceRecordId}.`);
  if (seenIds.has(record.sourceRecordId)) fail(`${label}: duplicate id ${record.sourceRecordId}.`);
  seenIds.add(record.sourceRecordId);
  if (record.corpusId !== "ADV2-2025-V2-E102" || record.sourceUnitId !== "U0121") fail(`${label}: invalid corpus/unit metadata.`);
  if (record.sourceUnitTitle !== "Formal Paper 121" || record.sourcePaperNumber !== 121 || record.sourceYear !== 2023) fail(`${label}: invalid title/paper/year metadata.`);
  if (JSON.stringify(record.sourcePdfPageRange) !== "[881,888]") fail(`${label}: invalid actual sourcePdfPageRange.`);
  if (JSON.stringify(record.sourceBodyPdfPageRange) !== "[881,887]") fail(`${label}: invalid actual sourceBodyPdfPageRange.`);
  if (JSON.stringify(record.sourceBookPageRange) !== "[882,888]") fail(`${label}: invalid sourceBookPageRange.`);
  if (record.sourceQuestionNumber !== number) fail(`${label}: non-contiguous sourceQuestionNumber.`);
  if (record.sourcePdfPage !== page || record.sourceBookPage !== page + 1) fail(`${label}: invalid source page mapping.`);
  if (typeof record.question !== "string" || !record.question.trim()) fail(`${label}: question is empty.`);
  if (/\b(?:unreadable|unknown|placeholder|ocr text)\b/i.test(record.question || "")) fail(`${label}: question contains a placeholder.`);
  if (!Array.isArray(record.options) || record.options.length !== 4 || record.options.some((option) => typeof option !== "string" || !option.trim())) {
    fail(`${label}: must contain exactly four nonempty options.`);
  } else {
    const normalized = record.options.map((option) => option.trim().toLowerCase());
    if (new Set(normalized).size !== 4 && !String(record.notes || "").trim()) fail(`${label}: duplicate source options require a note.`);
  }
  if (!Array.isArray(record.answerEvidence) || record.answerEvidence.length !== 1) {
    fail(`${label}: expected one answer-evidence record.`);
  } else {
    const evidence = record.answerEvidence[0];
    if (evidence.kind !== "printed-answer-key" || evidence.sourcePdfPage !== 888) fail(`${label}: invalid printed-key evidence page.`);
    if (!Number.isInteger(evidence.optionIndex) || evidence.optionIndex < 0 || evidence.optionIndex > 3) fail(`${label}: invalid printed option index.`);
    if (!/final answer requires independent verification/i.test(evidence.notes || "")) fail(`${label}: evidence disclaimer is missing.`);
  }
  if (!allowedConfidence.has(record.confidence)) fail(`${label}: invalid confidence ${record.confidence}.`);
  if (typeof record.notes !== "string") fail(`${label}: notes must be a string.`);
}

if (errors.length) {
  console.error(`ADV2E102 U0121 extraction validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const counts = records.reduce((result, record) => {
  result[record.confidence] = (result[record.confidence] || 0) + 1;
  return result;
}, {});
const noted = records.filter((record) => record.notes).map((record) => record.sourceQuestionNumber);
const urdu = records.filter((record) => /[\u0600-\u06FF]/u.test(`${record.question} ${record.options.join(" ")}`)).length;
console.log(`ADV2E102 U0121 extraction passed: ${records.length}/100 records, Q001-Q100 contiguous.`);
console.log("Actual envelope: PDF 881-888; body PDF 881-887 / book 882-888; key PDF 888.");
console.log(`Confidence: high=${counts.high || 0}, medium=${counts.medium || 0}, low=${counts.low || 0}. Urdu-script source items=${urdu}.`);
console.log(`Transcription/source notes: ${noted.length} question(s): ${noted.join(", ") || "none"}.`);
