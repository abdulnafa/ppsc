"use strict";

const fs = require("fs");
const path = require("path");
const {
  corpusId,
  extractionFilePattern,
  hasMojibake,
  loadManifest,
  optionIdentity,
  pairIdPattern,
  workDirectory
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

let manifest;
try {
  manifest = loadManifest();
} catch (caught) {
  error(caught.message);
  manifest = { sourceUnits: [] };
}

if (manifest.schemaVersion !== 1) error("manifest: schemaVersion must be 1");
if (manifest.corpusId !== corpusId) error(`manifest: corpusId must be ${corpusId}`);
if (manifest.idPrefix !== "ADV2E102") error("manifest: idPrefix must be ADV2E102");
if (!Number.isInteger(manifest.pdfPageCount) || manifest.pdfPageCount < 1) error("manifest: invalid pdfPageCount");
if (!/^[A-F0-9]{64}$/.test(String(manifest.sourceSha256 || ""))) error("manifest: sourceSha256 must be uppercase SHA-256");
if (!Number.isInteger(manifest.sourceFileSize) || manifest.sourceFileSize < 1) error("manifest: invalid sourceFileSize");
if (!['pending', 'complete'].includes(manifest.inventoryStatus)) error("manifest: inventoryStatus must be pending or complete");
if (!Array.isArray(manifest.sourceUnits)) error("manifest: sourceUnits must be an array");
if (complete && manifest.inventoryStatus !== "complete") error("manifest: --complete requires inventoryStatus=complete");
if (complete && (!Array.isArray(manifest.sourceUnits) || !manifest.sourceUnits.length)) error("manifest: --complete requires at least one source unit");

const unitById = new Map();
const expectedIds = new Set();
for (const [index, unit] of (Array.isArray(manifest.sourceUnits) ? manifest.sourceUnits : []).entries()) {
  const location = `manifest.sourceUnits[${index}]`;
  if (!unit || typeof unit !== "object" || Array.isArray(unit)) {
    error(`${location}: must be an object`);
    continue;
  }
  if (!/^U\d{4}$/.test(String(unit.sourceUnitId || ""))) error(`${location}: invalid sourceUnitId`);
  if (unitById.has(unit.sourceUnitId)) error(`${location}: duplicate sourceUnitId ${unit.sourceUnitId}`);
  unitById.set(unit.sourceUnitId, unit);
  if (!['paper', 'unnumbered-section'].includes(unit.kind)) error(`${location}: kind must be paper or unnumbered-section`);
  if (!String(unit.title || "").trim()) error(`${location}: missing title`);
  if (unit.sourcePaperNumber !== null && (!Number.isInteger(unit.sourcePaperNumber) || unit.sourcePaperNumber < 1)) {
    error(`${location}: sourcePaperNumber must be null or a positive integer`);
  }
  if (unit.sourceYear !== null && (!Number.isInteger(unit.sourceYear) || unit.sourceYear < 1800 || unit.sourceYear > 2100)) {
    error(`${location}: sourceYear must be null or a plausible year`);
  }
  if (!Number.isInteger(unit.pdfPageStart) || !Number.isInteger(unit.pdfPageEnd) ||
      unit.pdfPageStart < 1 || unit.pdfPageEnd < unit.pdfPageStart || unit.pdfPageEnd > manifest.pdfPageCount) {
    error(`${location}: invalid PDF page range`);
  }
  const hasBookStart = Number.isInteger(unit.bookPageStart);
  const hasBookEnd = Number.isInteger(unit.bookPageEnd);
  if (!((unit.bookPageStart === null && unit.bookPageEnd === null) || (hasBookStart && hasBookEnd && unit.bookPageEnd >= unit.bookPageStart))) {
    error(`${location}: book page range must be two integers or two nulls`);
  }
  if (!Array.isArray(unit.expectedQuestionNumbers)) {
    error(`${location}: expectedQuestionNumbers must be an array`);
  } else {
    const seenNumbers = new Set();
    for (const number of unit.expectedQuestionNumbers) {
      if (!Number.isInteger(number) || number < 1 || number > 999) error(`${location}: invalid expected question number ${number}`);
      if (seenNumbers.has(number)) error(`${location}: duplicate expected question number ${number}`);
      seenNumbers.add(number);
      expectedIds.add(`ADV2E102-${unit.sourceUnitId}-Q${String(number).padStart(3, "0")}`);
    }
    if (!Number.isInteger(unit.visibleQuestionCount) || unit.visibleQuestionCount < 0) {
      error(`${location}: visibleQuestionCount must be a nonnegative integer`);
    } else if (unit.visibleQuestionCount !== unit.expectedQuestionNumbers.length) {
      error(`${location}: visibleQuestionCount differs from expectedQuestionNumbers length`);
    }
    if (complete && !unit.expectedQuestionNumbers.length &&
        (unit.visibleQuestionCount !== 0 || String(unit.notes || "").trim().length < 12)) {
      error(`${location}: an empty complete-inventory unit must be explicitly documented as absent`);
    }
  }
}

const files = fs.readdirSync(workDirectory).filter((name) => extractionFilePattern.test(name)).sort();
const extractedById = new Map();
for (const name of files) {
  const fileMatch = name.match(/pdf(\d{4})-(\d{4})/i);
  const filePageStart = fileMatch ? Number(fileMatch[1]) : 0;
  const filePageEnd = fileMatch ? Number(fileMatch[2]) : 0;
  if (!fileMatch || filePageStart < 1 || filePageEnd < filePageStart || filePageEnd > manifest.pdfPageCount) {
    error(`${name}: invalid physical PDF page range in filename`);
  }
  let items;
  try {
    items = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
  } catch (caught) {
    error(`${name}: cannot parse JSON (${caught.message})`);
    continue;
  }
  if (!Array.isArray(items)) {
    error(`${name}: top-level value must be an array`);
    continue;
  }
  for (const [offset, item] of items.entries()) {
    const location = `${name}[${offset}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      error(`${location}: item must be an object`);
      continue;
    }
    const idMatch = String(item.sourceRecordId || "").match(pairIdPattern);
    if (!idMatch) error(`${location}: invalid sourceRecordId`);
    if (item.corpusId !== corpusId) error(`${location}: corpusId must be ${corpusId}`);
    if (!/^U\d{4}$/.test(String(item.sourceUnitId || ""))) error(`${location}: invalid sourceUnitId`);
    if (idMatch && item.sourceUnitId !== `U${idMatch[1]}`) error(`${location}: sourceRecordId and sourceUnitId disagree`);
    if (!Number.isInteger(item.sourceQuestionNumber) || item.sourceQuestionNumber < 1 || item.sourceQuestionNumber > 999) {
      error(`${location}: sourceQuestionNumber must be an integer from 1 to 999`);
    } else if (idMatch && item.sourceQuestionNumber !== Number(idMatch[2])) {
      error(`${location}: sourceRecordId and sourceQuestionNumber disagree`);
    }
    if (Object.prototype.hasOwnProperty.call(item, "sourcePrintedQuestionNumber")) {
      if (!Number.isInteger(item.sourcePrintedQuestionNumber) || item.sourcePrintedQuestionNumber < 1 || item.sourcePrintedQuestionNumber > 999) {
        error(`${location}: sourcePrintedQuestionNumber must be an integer from 1 to 999 when provided`);
      } else if (item.sourcePrintedQuestionNumber !== item.sourceQuestionNumber &&
          !String(item.notes || unitById.get(item.sourceUnitId)?.notes || "").trim()) {
        error(`${location}: a normalized source number requires notes explaining the printed-number defect`);
      }
    }
    const unit = unitById.get(item.sourceUnitId);
    if (!unit) {
      error(`${location}: sourceUnitId is absent from the manifest`);
    } else {
      if (!Number.isInteger(item.sourcePdfPage) || item.sourcePdfPage < unit.pdfPageStart || item.sourcePdfPage > unit.pdfPageEnd) {
        error(`${location}: sourcePdfPage is outside its manifest unit`);
      }
      if (Array.isArray(unit.expectedQuestionNumbers) && unit.expectedQuestionNumbers.length &&
          !unit.expectedQuestionNumbers.includes(item.sourceQuestionNumber)) {
        error(`${location}: sourceQuestionNumber is not in the unit inventory`);
      }
    }
    if (!Number.isInteger(item.sourcePdfPage) || item.sourcePdfPage < filePageStart || item.sourcePdfPage > filePageEnd) {
      error(`${location}: sourcePdfPage is outside the batch filename range`);
    }
    if (item.sourceBookPage !== null && (!Number.isInteger(item.sourceBookPage) || item.sourceBookPage < 1)) {
      error(`${location}: sourceBookPage must be null or a positive integer`);
    }
    if (unit && Number.isInteger(item.sourceBookPage) && Number.isInteger(unit.bookPageStart) &&
        (item.sourceBookPage < unit.bookPageStart || item.sourceBookPage > unit.bookPageEnd)) {
      error(`${location}: sourceBookPage is outside its manifest unit`);
    }
    if (!String(item.question || "").trim()) error(`${location}: missing question`);
    if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => !String(option || "").trim())) {
      error(`${location}: must contain exactly four nonempty source options`);
    } else {
      const normalized = item.options.map(optionIdentity);
      if (new Set(normalized).size !== 4 && !String(item.notes || "").trim()) {
        warning(`${location}: duplicate source options need a transcription note`);
      }
    }
    if (!Array.isArray(item.answerEvidence)) {
      error(`${location}: answerEvidence must be an array`);
    } else {
      for (const [evidenceIndex, evidence] of item.answerEvidence.entries()) {
        const evidenceLocation = `${location}.answerEvidence[${evidenceIndex}]`;
        if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
          error(`${evidenceLocation}: must be an object`);
          continue;
        }
        if (!['scan-mark', 'printed-answer-key', 'associated-information'].includes(evidence.kind)) {
          error(`${evidenceLocation}: invalid kind`);
        }
        if (evidence.optionIndex !== null && (!Number.isInteger(evidence.optionIndex) || evidence.optionIndex < 0 || evidence.optionIndex > 3)) {
          error(`${evidenceLocation}: optionIndex must be null or zero-based 0..3`);
        }
        if (!Number.isInteger(evidence.sourcePdfPage) || evidence.sourcePdfPage < 1 || evidence.sourcePdfPage > manifest.pdfPageCount) {
          error(`${evidenceLocation}: invalid sourcePdfPage`);
        }
        if (!['high', 'medium', 'low'].includes(evidence.confidence)) error(`${evidenceLocation}: invalid confidence`);
        if (evidence.optionIndex === null && !String(evidence.notes || "").trim()) {
          error(`${evidenceLocation}: null optionIndex requires notes`);
        }
      }
    }
    if (!['high', 'medium', 'low'].includes(item.confidence)) error(`${location}: invalid confidence`);
    if (hasMojibake(item)) error(`${location}: contains likely mojibake`);
    if (extractedById.has(item.sourceRecordId)) error(`${location}: duplicate sourceRecordId (also in ${extractedById.get(item.sourceRecordId)._file})`);
    extractedById.set(item.sourceRecordId, { ...item, _file: name });
  }
  console.log(`${name}: ${items.length} extraction records`);
}

if (complete) {
  for (const expectedId of expectedIds) {
    if (!extractedById.has(expectedId)) error(`${expectedId}: missing extraction record`);
  }
  if (extractedById.size !== expectedIds.size) {
    error(`extraction coverage is ${extractedById.size}/${expectedIds.size}`);
  }
}

console.log(`ADV2E102 extraction: ${extractedById.size}/${expectedIds.size || "pending"} records; ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
