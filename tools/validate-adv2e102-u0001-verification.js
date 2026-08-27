"use strict";

const fs = require("fs");
const path = require("path");
const {
  hasMojibake,
  isDirectHttpsUrl,
  optionIdentity,
  validateReferences,
  validateTemporalScope
} = require("./adv2e102-common");

const extractionPath = path.resolve(__dirname, "../work/adv2e102-extracted-pdf0018-0033.json");
const verificationPath = path.resolve(__dirname, "../work/adv2e102-verification-pdf0018-0033.json");
let errors = 0;

function error(message) {
  errors += 1;
  console.error(`ERROR ${message}`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    error(`Missing ${filePath}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (caught) {
    error(`${path.basename(filePath)}: ${caught.message}`);
    return [];
  }
}

const source = readJson(extractionPath);
const records = readJson(verificationPath);
const sourceById = new Map(source.map((item) => [item.sourceRecordId, item]));

if (!Array.isArray(records) || records.length < 1 || records.length > 100) {
  error(`Expected a nonempty checkpoint of at most 100 records, found ${Array.isArray(records) ? records.length : "non-array"}.`);
}

records.forEach((item, index) => {
  const expectedQuestionNumber = index + 1;
  const location = item.sourceRecordId || `record ${index}`;
  const extracted = sourceById.get(item.sourceRecordId);
  if (!extracted) {
    error(`${location}: absent from U0001 extraction.`);
    return;
  }
  if (item.sourceQuestionNumber !== expectedQuestionNumber) error(`${location}: checkpoint must be contiguous from Q001.`);
  if (item.corpusId !== extracted.corpusId || item.sourceUnitId !== "U0001" ||
      item.sourceQuestionNumber !== extracted.sourceQuestionNumber || item.sourcePdfPage !== extracted.sourcePdfPage ||
      item.sourceBookPage !== extracted.sourceBookPage) {
    error(`${location}: source identity/page metadata differs from extraction.`);
  }
  if (item.verificationStatus !== "verified") error(`${location}: checkpoint accepts only verified records.`);
  if (!Number.isInteger(item.verifiedCorrectIndex) || item.verifiedCorrectIndex < 0 || item.verifiedCorrectIndex > 3) {
    error(`${location}: verifiedCorrectIndex must be 0..3.`);
  }
  if (typeof item.question !== "string" || item.question.trim().length < 8 || !/[A-Za-z]/.test(item.question)) {
    error(`${location}: incomplete English question.`);
  }
  if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => !String(option || "").trim())) {
    error(`${location}: must have four nonempty options.`);
  } else if (new Set(item.options.map(optionIdentity)).size !== 4) {
    error(`${location}: options are not distinct.`);
  }

  const referenceResult = validateReferences(item.references, location, error, 2);
  if (!isDirectHttpsUrl(item.referenceUrl)) error(`${location}: canonical referenceUrl must be direct HTTPS.`);
  if (!referenceResult.answerUrls.has(item.referenceUrl)) error(`${location}: canonical referenceUrl must support the answer.`);
  const canonical = Array.isArray(item.references)
    ? item.references.find((reference) => reference.url === item.referenceUrl)
    : null;
  if (!canonical || item.referenceLabel !== canonical.label || item.accessedOn !== canonical.accessedOn) {
    error(`${location}: canonical reference metadata is inconsistent.`);
  }
  validateTemporalScope(item.temporalScope, item.question, location, error);
  if (new Set((item.references || []).map((reference) => reference.authorityId)).size < 2) {
    error(`${location}: needs two independent authorities.`);
  }
  if (!["high", "medium", "low"].includes(item.confidence)) error(`${location}: invalid confidence.`);
  if (hasMojibake(item)) error(`${location}: likely mojibake.`);

  const changed = item.question !== extracted.question || JSON.stringify(item.options) !== JSON.stringify(extracted.options) ||
    !extracted.answerEvidence.some((evidence) => evidence.kind === "printed-answer-key" && evidence.optionIndex === item.verifiedCorrectIndex);
  if (changed && !String(item.sourceNotes || "").trim()) error(`${location}: repair/key change requires sourceNotes.`);
});

if (errors) {
  console.error(`ADV2E102 U0001 verification checkpoint failed: ${errors} error(s).`);
  process.exit(1);
}

console.log(`ADV2E102 U0001 verification checkpoint passed: ${records.length}/100 records (Q001-Q${String(records.length).padStart(3, "0")}).`);
