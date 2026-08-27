"use strict";

const {
  allowedCategories,
  decisionFilePattern,
  enrichedFilePattern,
  exactFingerprint,
  hasMojibake,
  isDirectHttpsUrl,
  itemIdPattern,
  loadCurrentBank,
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

if (complete) {
  try {
    const manifest = loadManifest();
    if (manifest.inventoryStatus !== "complete" || !Array.isArray(manifest.sourceUnits) || !manifest.sourceUnits.length) {
      error("manifest: complete enrichment requires a completed, nonempty source-unit inventory");
    }
  } catch (caught) {
    error(caught.message);
  }
}

function numericTokens(value) {
  return [...new Set(String(value || "").match(/\d+(?:[.,]\d+)*/g) || [])];
}

function checkTemporalText(item, location) {
  const scope = item.temporalScope || {};
  let requiredToken = "";
  if (scope.type === "event-date" && scope.eventDate) requiredToken = String(scope.eventDate).slice(0, 4);
  if (scope.type === "as-of" && scope.asOf) requiredToken = String(scope.asOf).slice(0, 4);
  if (scope.type === "version" && scope.version) requiredToken = String(scope.version);
  if (requiredToken && !String(item.question || "").toLowerCase().includes(requiredToken.toLowerCase())) {
    error(`${location}: English question must state its date/version scope (${requiredToken})`);
  }
  if (requiredToken && !String(item.questionUrdu || "").toLowerCase().includes(requiredToken.toLowerCase())) {
    error(`${location}: Urdu question must preserve its date/version scope (${requiredToken})`);
  }
}

function sameTemporalScope(left, right) {
  const fields = ["type", "sourcePaperDate", "asOf", "eventDate", "version", "reverifyAfter"];
  return fields.every((field) => (left || {})[field] === (right || {})[field]);
}

const verificationData = safeRead(verificationFilePattern, "verification");
const decisionData = safeRead(decisionFilePattern, "decision");
const enrichedData = safeRead(enrichedFilePattern, "enriched");
const verificationById = new Map();
for (const item of verificationData.records) {
  if (verificationById.has(item.sourceRecordId)) error(`${item.sourceRecordId}: duplicate verification record`);
  verificationById.set(item.sourceRecordId, item);
}
const decisionById = new Map();
for (const item of decisionData.records) {
  if (decisionById.has(item.sourceRecordId)) error(`${item.sourceRecordId}: duplicate decision record`);
  decisionById.set(item.sourceRecordId, item);
}

let baselineQuestions = [];
try {
  baselineQuestions = loadCurrentBank({ includeAdv2e102: false });
} catch (caught) {
  error(caught.message);
}
const baselineByFingerprint = new Map();
for (const question of baselineQuestions) {
  const key = exactFingerprint(question.question);
  if (key && !baselineByFingerprint.has(key)) baselineByFingerprint.set(key, question.id);
}

const ids = new Set();
const pairs = new Map();
const newByFingerprint = new Map();
for (const item of enrichedData.records) {
  const location = String(item.id || item._file);
  const idMatch = String(item.id || "").match(itemIdPattern);
  if (!idMatch) error(`${location}: invalid ADV2E102 item id`);
  if (!pairIdPattern.test(String(item.pairId || ""))) error(`${location}: invalid ADV2E102 pairId`);
  if (idMatch && item.pairId !== item.id.replace(/-(?:SRC|SIM)$/, "")) error(`${location}: id and pairId disagree`);
  if (ids.has(item.id)) error(`${location}: duplicate item id`);
  ids.add(item.id);
  if (!['source', 'similar'].includes(item.kind)) error(`${location}: kind must be source or similar`);
  if (item.kind === "source" && !String(item.id || "").endsWith("-SRC")) error(`${location}: source id must end with -SRC`);
  if (item.kind === "similar" && !String(item.id || "").endsWith("-SIM")) error(`${location}: similar id must end with -SIM`);
  if (!allowedCategories.has(item.categoryId)) error(`${location}: unknown category ${item.categoryId}`);
  if (!String(item.question || "").trim() || !/[A-Za-z]/.test(String(item.question || ""))) {
    error(`${location}: missing English question`);
  }
  if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => !optionIdentity(option))) {
    error(`${location}: must contain exactly four nonempty options`);
  } else if (new Set(item.options.map(optionIdentity)).size !== 4) {
    error(`${location}: options must be distinct`);
  }
  if (!Number.isInteger(item.correctOptionIndex) || item.correctOptionIndex < 0 || item.correctOptionIndex > 3) {
    error(`${location}: invalid zero-based correctOptionIndex`);
  }
  const translation = String(item.questionUrdu || "").trim();
  if ((translation.match(/[\u0600-\u06ff]/gu) || []).length < 8) error(`${location}: needs a genuine Urdu question translation`);
  for (const token of numericTokens(item.question)) {
    if (!translation.includes(token)) error(`${location}: Urdu question must preserve numeric token ${token}`);
  }
  const explanation = String(item.explanationUrdu || "").trim();
  if (explanation.length < 40 || !/[\u0600-\u06ff]/u.test(explanation)) error(`${location}: needs a meaningful Urdu explanation`);
  if (!Array.isArray(item.tags) || !item.tags.length) warning(`${location}: no tags`);
  if (item.verificationStatus !== "verified") error(`${location}: only verificationStatus=verified can be enriched`);
  const referenceResult = validateReferences(item.references, location, error, 2);
  validateTemporalScope(item.temporalScope, item.question, location, error);
  checkTemporalText(item, location);
  if (hasMojibake(item)) error(`${location}: contains likely mojibake`);

  const source = item.source || {};
  if (item.kind === "source" && source.type !== "book") error(`${location}: source item must use source.type=book`);
  if (item.kind === "similar" && source.type !== "practice") error(`${location}: similar item must use source.type=practice`);
  if (!String(source.label || "").trim()) error(`${location}: missing source.label`);
  if (!isDirectHttpsUrl(source.referenceUrl)) error(`${location}: source.referenceUrl must be a direct canonical HTTPS URL`);
  if (!referenceResult.answerUrls.has(source.referenceUrl)) error(`${location}: source.referenceUrl must appear among answer-supporting references`);
  if (!validDate(source.accessedOn)) error(`${location}: source.accessedOn must be a valid date`);
  const canonicalReference = Array.isArray(item.references)
    ? item.references.find((reference) => reference && reference.url === source.referenceUrl)
    : null;
  if (!canonicalReference || canonicalReference.accessedOn !== source.accessedOn) {
    error(`${location}: source.accessedOn must match the canonical reference`);
  }
  if (!canonicalReference || canonicalReference.label !== source.label) {
    error(`${location}: source.label must match the canonical reference`);
  }

  const decision = decisionById.get(item.pairId);
  if (!decision) error(`${location}: pair has no de-duplication decision`);
  else if (decision.action !== "keep") error(`${location}: ${decision.action} decision must not have enriched records`);
  const verification = verificationById.get(item.pairId);
  if (!verification) error(`${location}: pair has no verification record`);
  if (item.kind === "source" && verification) {
    if (verification.verificationStatus !== "verified") error(`${location}: source verification is not resolved`);
    if (item.question !== verification.question) error(`${location}: source question differs from verification ledger`);
    if (JSON.stringify(item.options) !== JSON.stringify(verification.options)) error(`${location}: source options differ from verification ledger`);
    if (item.correctOptionIndex !== verification.verifiedCorrectIndex) error(`${location}: source answer differs from verification ledger`);
    if (source.referenceUrl !== verification.referenceUrl) error(`${location}: canonical source URL differs from verification ledger`);
    if (!sameTemporalScope(item.temporalScope, verification.temporalScope)) {
      error(`${location}: source temporalScope differs from verification ledger`);
    }
    const enrichedUrls = new Set((Array.isArray(item.references) ? item.references : []).map((reference) => reference && reference.url));
    const missingVerificationUrl = (Array.isArray(verification.references) ? verification.references : [])
      .filter((reference) => reference && Array.isArray(reference.supports) && reference.supports.includes("answer"))
      .some((reference) => !enrichedUrls.has(reference.url));
    if (missingVerificationUrl) error(`${location}: source references omit an answer authority from verification`);
  }

  const key = exactFingerprint(item.question);
  if (baselineByFingerprint.has(key)) error(`${location}: exact wording repeats existing ${baselineByFingerprint.get(key)}`);
  if (newByFingerprint.has(key)) error(`${location}: exact wording also used by ${newByFingerprint.get(key)}`);
  else if (key) newByFingerprint.set(key, item.id);

  const pair = pairs.get(item.pairId) || [];
  pair.push(item);
  pairs.set(item.pairId, pair);
}

for (const [pairId, pair] of pairs) {
  const kinds = pair.map((item) => item.kind).sort().join(",");
  if (pair.length !== 2 || kinds !== "similar,source") error(`${pairId}: must contain one source and one similar item`);
  if (pair.length === 2 && pair[0].categoryId !== pair[1].categoryId) error(`${pairId}: source and similar categories differ`);
  if (pair.length === 2 && exactFingerprint(pair[0].question) === exactFingerprint(pair[1].question)) {
    error(`${pairId}: similar item repeats source wording`);
  }
}

for (const [sourceRecordId, decision] of decisionById) {
  const pair = pairs.get(sourceRecordId) || [];
  if (decision.action === "keep" && complete && pair.length !== 2) error(`${sourceRecordId}: kept decision is missing its enriched pair`);
  if (decision.action !== "keep" && pair.length) error(`${sourceRecordId}: ${decision.action} decision has enriched records`);
}
if (complete) {
  if (!decisionById.size) error("complete enrichment requires de-duplication decisions");
  for (const sourceRecordId of verificationById.keys()) {
    if (!decisionById.has(sourceRecordId)) error(`${sourceRecordId}: verification has no de-duplication decision`);
  }
}
for (const pairId of pairs.keys()) {
  if (!decisionById.has(pairId)) error(`${pairId}: enriched pair is outside decision inventory`);
}

console.log(`ADV2E102 enriched: ${enrichedData.records.length} items (${pairs.size} pairs); ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
