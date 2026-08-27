"use strict";

const {
  corpusId,
  extractionFilePattern,
  hasMojibake,
  isDirectHttpsUrl,
  loadManifest,
  optionIdentity,
  pairIdPattern,
  readArrayFiles,
  validDate,
  validateReferences,
  validateTemporalScope,
  verificationFilePattern
} = require("./adv2e102-common");

const complete = process.argv.includes("--complete");
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

function safeRead(pattern, label) {
  try {
    return readArrayFiles(pattern);
  } catch (caught) {
    error(`${label}: ${caught.message}`);
    return { files: [], records: [] };
  }
}

function sameOptions(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length &&
    left.every((option, index) => String(option) === String(right[index]));
}

if (complete) {
  try {
    const manifest = loadManifest();
    if (manifest.inventoryStatus !== "complete" || !Array.isArray(manifest.sourceUnits) || !manifest.sourceUnits.length) {
      error("manifest: complete verification requires a completed, nonempty source-unit inventory");
    }
  } catch (caught) {
    error(caught.message);
  }
}

const extractionData = safeRead(extractionFilePattern, "extraction");
const verificationData = safeRead(verificationFilePattern, "verification");
const extractedById = new Map();
for (const item of extractionData.records) {
  if (!pairIdPattern.test(String(item.sourceRecordId || ""))) {
    error(`${item._file}: extraction has invalid sourceRecordId`);
    continue;
  }
  if (extractedById.has(item.sourceRecordId)) error(`${item.sourceRecordId}: duplicate extraction record`);
  extractedById.set(item.sourceRecordId, item);
}

const verifiedById = new Map();
for (const item of verificationData.records) {
  const location = pairIdPattern.test(String(item.sourceRecordId || "")) ? item.sourceRecordId : item._file;
  const source = extractedById.get(item.sourceRecordId);
  if (!source) {
    error(`${location}: sourceRecordId is absent from extraction inventory`);
    continue;
  }
  if (verifiedById.has(item.sourceRecordId)) error(`${location}: duplicate verification record`);
  verifiedById.set(item.sourceRecordId, item);
  if (item.corpusId !== corpusId) error(`${location}: corpusId must be ${corpusId}`);
  if (item.sourceUnitId !== source.sourceUnitId || item.sourceQuestionNumber !== source.sourceQuestionNumber ||
      item.sourcePdfPage !== source.sourcePdfPage || item.sourceBookPage !== source.sourceBookPage) {
    error(`${location}: source identity/page metadata differs from extraction`);
  }
  const question = String(item.question || "").trim();
  if (question.length < 8 || !/[A-Za-z]/.test(question)) error(`${location}: needs a complete English question`);
  if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => !String(option || "").trim())) {
    error(`${location}: must contain exactly four nonempty options`);
  } else if (new Set(item.options.map(optionIdentity)).size !== 4) {
    error(`${location}: verified options must be distinct`);
  }
  if (!['verified', 'disputed', 'unresolved'].includes(item.verificationStatus)) {
    error(`${location}: verificationStatus must be verified, disputed, or unresolved`);
  }
  if (item.verificationStatus === "verified") {
    if (!Number.isInteger(item.verifiedCorrectIndex) || item.verifiedCorrectIndex < 0 || item.verifiedCorrectIndex > 3) {
      error(`${location}: verified item needs zero-based verifiedCorrectIndex 0..3`);
    }
  } else if (item.verifiedCorrectIndex !== null) {
    error(`${location}: disputed/unresolved item must use verifiedCorrectIndex=null`);
  }
  const referenceResult = validateReferences(
    item.references,
    location,
    error,
    item.verificationStatus === "verified" ? 2 : 0
  );
  if (item.verificationStatus === "verified") {
    if (!isDirectHttpsUrl(item.referenceUrl)) error(`${location}: referenceUrl must be a direct canonical HTTPS page`);
    if (!referenceResult.answerUrls.has(item.referenceUrl)) error(`${location}: referenceUrl must be one of the answer-supporting references`);
    const canonicalReference = Array.isArray(item.references)
      ? item.references.find((reference) => reference && reference.url === item.referenceUrl)
      : null;
    if (!canonicalReference || item.referenceLabel !== canonicalReference.label || item.accessedOn !== canonicalReference.accessedOn) {
      error(`${location}: canonical referenceLabel/accessedOn must match referenceUrl in references`);
    }
  } else if (item.referenceUrl !== null || item.referenceLabel !== null || item.accessedOn !== null) {
    error(`${location}: unresolved canonical reference fields must be null`);
  }
  if (item.accessedOn !== null && !validDate(item.accessedOn)) error(`${location}: invalid accessedOn`);
  if (!['high', 'medium', 'low'].includes(item.confidence)) error(`${location}: invalid confidence`);
  validateTemporalScope(item.temporalScope, item.question, location, error);
  if (hasMojibake(item)) error(`${location}: contains likely mojibake`);

  const printedIndexes = new Set((Array.isArray(source.answerEvidence) ? source.answerEvidence : [])
    .filter((evidence) => evidence && evidence.kind === "printed-answer-key" && Number.isInteger(evidence.optionIndex))
    .map((evidence) => evidence.optionIndex));
  const changed = String(item.question) !== String(source.question) || !sameOptions(item.options, source.options) ||
    (item.verificationStatus === "verified" && printedIndexes.size === 1 && !printedIndexes.has(item.verifiedCorrectIndex));
  if ((changed || item.verificationStatus !== "verified") && !String(item.sourceNotes || "").trim()) {
    error(`${location}: sourceNotes must explain every repair, key change, dispute, or unresolved item`);
  }
  if (printedIndexes.size > 1 && item.verificationStatus === "verified" && !String(item.sourceNotes || "").trim()) {
    warning(`${location}: conflicting printed keys should be disclosed in sourceNotes`);
  }
}

if (complete) {
  if (!extractedById.size) error("complete verification requires extracted source records");
  for (const sourceRecordId of extractedById.keys()) {
    if (!verifiedById.has(sourceRecordId)) error(`${sourceRecordId}: missing verification record`);
  }
  for (const item of verifiedById.values()) {
    if (item.verificationStatus !== "verified") error(`${item.sourceRecordId}: complete mode cannot contain disputed/unresolved verification`);
  }
}

console.log(`ADV2E102 verification: ${verifiedById.size}/${extractedById.size || "pending"} records; ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
