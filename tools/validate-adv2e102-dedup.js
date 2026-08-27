"use strict";

const {
  bankSnapshot,
  decisionFilePattern,
  extractionFilePattern,
  loadCurrentBank,
  loadManifest,
  pairIdPattern,
  readArrayFiles,
  sourceOrderKey,
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

let manifest = { sourceUnits: [] };
try {
  manifest = loadManifest();
} catch (caught) {
  error(caught.message);
}
if (complete && (manifest.inventoryStatus !== "complete" || !Array.isArray(manifest.sourceUnits) || !manifest.sourceUnits.length)) {
  error("manifest: complete dedup validation requires a completed, nonempty source-unit inventory");
}
const unitOrder = new Map((manifest.sourceUnits || []).map((unit, index) => [unit.sourceUnitId, index + 1]));
const extractionData = safeRead(extractionFilePattern, "extraction");
const verificationData = safeRead(verificationFilePattern, "verification");
const decisionData = safeRead(decisionFilePattern, "decision");
const extractedIds = new Set(extractionData.records.map((record) => record.sourceRecordId));
const verificationById = new Map();
for (const item of verificationData.records) {
  if (verificationById.has(item.sourceRecordId)) error(`${item.sourceRecordId}: duplicate verification record`);
  verificationById.set(item.sourceRecordId, item);
}

let baselineQuestions = [];
try {
  baselineQuestions = loadCurrentBank({ includeAdv2e102: false });
} catch (caught) {
  error(caught.message);
}
const baseline = bankSnapshot(baselineQuestions);
const baselineIds = new Set(baselineQuestions.map((question) => question.id));
const decisionById = new Map();
let keepCount = 0;
let skipCount = 0;
let holdCount = 0;

for (const decision of decisionData.records) {
  const location = pairIdPattern.test(String(decision.sourceRecordId || "")) ? decision.sourceRecordId : decision._file;
  if (decisionById.has(decision.sourceRecordId)) error(`${location}: duplicate decision record`);
  else decisionById.set(decision.sourceRecordId, decision);
}

for (const decision of decisionData.records) {
  const location = pairIdPattern.test(String(decision.sourceRecordId || "")) ? decision.sourceRecordId : decision._file;
  if (!extractedIds.has(decision.sourceRecordId)) error(`${location}: sourceRecordId is absent from extraction inventory`);
  if (!verificationById.has(decision.sourceRecordId)) error(`${location}: sourceRecordId has no verification record`);
  if (!['keep', 'skip', 'hold'].includes(decision.action)) error(`${location}: action must be keep, skip, or hold`);
  if (!['verified', 'pending'].includes(decision.reviewStatus)) error(`${location}: reviewStatus must be verified or pending`);
  if (String(decision.reason || "").trim().length < 12) error(`${location}: reason is too short`);
  if (String(decision.testedProposition || "").trim().length < 12) error(`${location}: testedProposition is too short`);

  const reviewed = decision.reviewedAgainst;
  if (!reviewed || typeof reviewed !== "object" || Array.isArray(reviewed)) {
    error(`${location}: reviewedAgainst must pin the baseline bank snapshot`);
  } else {
    if (reviewed.baselineQuestionCount !== baseline.questionCount) {
      error(`${location}: baselineQuestionCount must equal current non-ADV2E102 bank count ${baseline.questionCount}`);
    }
    if (reviewed.baselineSha256 !== baseline.sha256) error(`${location}: baselineSha256 does not match current non-ADV2E102 bank`);
    if (reviewed.includesSourceAndSimilar !== true) error(`${location}: reviewedAgainst must include existing source and similar items`);
    if (reviewed.includesEarlierAdv2e102 !== true) error(`${location}: reviewedAgainst must include earlier ADV2E102 items`);
    if (reviewed.candidateTool !== "tools/deduplicate-adv2e102.js") error(`${location}: candidateTool is incorrect`);
  }
  const signals = decision.similaritySignals;
  if (!signals || typeof signals !== "object" || Array.isArray(signals)) {
    error(`${location}: similaritySignals must be an object`);
  } else {
    if (typeof signals.exactFingerprintMatch !== "boolean") error(`${location}: exactFingerprintMatch must be boolean`);
    if (!Array.isArray(signals.semanticCandidateIds)) error(`${location}: semanticCandidateIds must be an array`);
    else {
      if (new Set(signals.semanticCandidateIds).size !== signals.semanticCandidateIds.length) error(`${location}: semanticCandidateIds contains duplicates`);
      for (const candidateId of signals.semanticCandidateIds) {
        const candidatePairId = String(candidateId || "").replace(/-(?:SRC|SIM)$/i, "");
        if (!baselineIds.has(candidateId) && !pairIdPattern.test(candidatePairId)) {
          error(`${location}: invalid semantic candidate ID ${candidateId}`);
        }
      }
    }
    if (typeof signals.answerConflictReviewed !== "boolean") error(`${location}: answerConflictReviewed must be boolean`);
    if (decision.reviewStatus === "verified" && signals.answerConflictReviewed !== true) {
      error(`${location}: verified review must explicitly confirm answer-conflict review`);
    }
  }

  const verification = verificationById.get(decision.sourceRecordId);
  if (verification && verification.verificationStatus !== "verified" && decision.action !== "hold") {
    error(`${location}: disputed/unresolved verification must remain on hold`);
  }
  if (decision.action === "keep") {
    keepCount += 1;
    if (decision.reviewStatus !== "verified") error(`${location}: keep requires reviewStatus=verified`);
    if (String(decision.duplicateOf || "").trim()) error(`${location}: keep must use duplicateOf=""`);
    if (signals && signals.exactFingerprintMatch) error(`${location}: exact duplicate cannot be kept without repairing the verified source first`);
    if (verification) {
      validateReferences(verification.references, location, error, 2);
      validateTemporalScope(verification.temporalScope, verification.question, location, error);
    }
  } else if (decision.action === "skip") {
    skipCount += 1;
    if (decision.reviewStatus !== "verified") error(`${location}: skip requires reviewStatus=verified`);
    const target = String(decision.duplicateOf || "");
    if (baselineIds.has(target)) {
      // Existing source or similar item is a valid canonical target.
    } else if (pairIdPattern.test(target)) {
      if (sourceOrderKey(target, unitOrder) >= sourceOrderKey(decision.sourceRecordId, unitOrder)) {
        error(`${location}: ADV2E102 duplicateOf must point to an earlier source record`);
      }
      const targetDecision = decisionById.get(target);
      if (!targetDecision || targetDecision.action !== "keep") error(`${location}: ADV2E102 duplicateOf must point to an earlier kept decision`);
    } else {
      error(`${location}: duplicateOf must be an existing bank item ID or earlier ADV2E102 sourceRecordId`);
    }
    if (signals && Array.isArray(signals.semanticCandidateIds) && !signals.semanticCandidateIds.includes(target)) {
      error(`${location}: duplicateOf must also appear in semanticCandidateIds`);
    }
  } else if (decision.action === "hold") {
    holdCount += 1;
    if (decision.reviewStatus !== "pending") error(`${location}: hold requires reviewStatus=pending`);
    if (String(decision.duplicateOf || "").trim()) error(`${location}: hold must use duplicateOf=""`);
  }
}

if (complete) {
  if (!extractedIds.size) error("complete dedup validation requires extracted source records");
  for (const sourceRecordId of extractedIds) {
    if (!decisionById.has(sourceRecordId)) error(`${sourceRecordId}: missing de-duplication decision`);
  }
  if (holdCount) error(`complete mode cannot contain ${holdCount} held decisions`);
}
for (const sourceRecordId of decisionById.keys()) {
  if (!extractedIds.has(sourceRecordId)) warning(`${sourceRecordId}: decision is outside current extraction inventory`);
}

console.log(`ADV2E102 dedup decisions: ${decisionById.size}/${extractedIds.size || "pending"}; keep ${keepCount}; skip ${skipCount}; hold ${holdCount}; baseline ${baseline.questionCount}; ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
