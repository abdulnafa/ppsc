"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { restoreLegacyAnswerOptions } = require("./answer-text-corrections");
const { exactFingerprint, hasMojibake } = require("./adv2e102-common");
const {
  assertCompleteReleaseDecisions,
  corpusId,
  decisionActions,
  getReleaseTarget,
  itemIdPattern,
  loadExtraction,
  loadManifest,
  pairIdPattern,
  readReviewFiles,
  retainedQuestions,
  sourceRecordId,
  validateQuestion,
  verificationDateFor,
  projectDirectory
} = require("./wgi-common");

const expectedBaselineSignature = "v1:11412:57e37c68";
const expectedSourceSha256 = "6E207E4B526594241137EAE2A2B7B5CEE055C2A9C936939690CCFBF877472E4B";
const verificationDate = "2026-10-12";
const dedupePath = path.join(projectDirectory, "work", "wgi-dedupe-agent.json");
const evidencePath = path.join(projectDirectory, "work", "wgi-authoritative-sources-agent.json");
const complete = process.argv.includes("--complete");
const errors = [];
const warnings = [];
const addError = (message) => errors.push(message);

function loadCurrentBank() {
  const code = fs.readFileSync(path.join(projectDirectory, "data", "questions.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/questions.js", timeout: 10000 });
  const questions = sandbox.window.PPSC_QUIZ_DATA && sandbox.window.PPSC_QUIZ_DATA.questions;
  if (!Array.isArray(questions)) throw new Error("Could not load current question bank.");
  return questions;
}

function stableQuestionSignature(questions) {
  let hash = 2166136261;
  const hashText = (value) => {
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
  };
  for (const question of questions) {
    hashText(JSON.stringify([
      question.id,
      question.categoryId,
      question.question,
      question.questionUrdu,
      question.correctOptionIndex,
      question.options,
      question.optionsUrdu
    ]));
    hashText("\n");
  }
  return `v1:${questions.length}:${(hash >>> 0).toString(16)}`;
}

let manifest;
let target;
let extraction;
let reviewData;
let currentBank;
let dedupe;
let evidence;
try {
  manifest = loadManifest();
  target = getReleaseTarget(manifest);
  extraction = loadExtraction();
  reviewData = readReviewFiles();
  currentBank = loadCurrentBank();
  dedupe = JSON.parse(fs.readFileSync(dedupePath, "utf8"));
  evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exit(1);
}

if (manifest.schemaVersion !== 1) addError("manifest schemaVersion must be 1");
if (manifest.corpusId !== corpusId) addError(`manifest corpusId must be ${corpusId}`);
if (manifest.sourceSha256 !== expectedSourceSha256) addError("manifest sourceSha256 does not match the supplied PDF");
if (manifest.sourcePageCount !== 30) addError("manifest sourcePageCount must be 30");
if (manifest.numberedEntryCount !== 671) addError("manifest numberedEntryCount must be 671");
if (manifest.firstQuestionNumber !== 1 || manifest.lastQuestionNumber !== 671) addError("manifest question range must be 1..671");
if (!manifest.approvedBaseline
  || manifest.approvedBaseline.questionCount !== 11412
  || manifest.approvedBaseline.stableSignature !== expectedBaselineSignature) {
  addError("manifest approvedBaseline must pin the unchanged 11,412-question release signature");
}
for (const [field, expected] of Object.entries({
  extraction: "work/wgi-extracted-q0001-0671.json",
  semanticDedupe: "work/wgi-dedupe-agent.json",
  correctionEvidence: "work/wgi-authoritative-sources-agent.json",
  reviewPattern: "work/wgi-reviewed-q####-####.json"
})) {
  if (!manifest.auditArtifacts || manifest.auditArtifacts[field] !== expected) {
    addError(`manifest auditArtifacts.${field} must be ${expected}`);
  }
}

if (!extraction || typeof extraction !== "object" || Array.isArray(extraction)) {
  addError("extraction root must be an object");
} else {
  if (extraction.pages !== 30) addError("extraction pages must be 30");
  if (extraction.entryCount !== 671) addError("extraction entryCount must be 671");
  if (!Array.isArray(extraction.entries) || extraction.entries.length !== 671) {
    addError("extraction must contain exactly 671 entries");
  } else {
    extraction.entries.forEach((entry, index) => {
      const expectedNumber = index + 1;
      const location = `extraction entry ${expectedNumber}`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return addError(`${location} must be an object`);
      if (entry.number !== expectedNumber) addError(`${location} has number ${entry.number}`);
      if (!Number.isInteger(entry.page) || entry.page < 1 || entry.page > 30) addError(`${location} has invalid page`);
      if (String(entry.raw || "").trim().length < 5) addError(`${location} has no raw text`);
      if (String(entry.body || "").trim().length < 3) addError(`${location} has no cleaned body`);
      if (hasMojibake(entry)) addError(`${location} contains likely mojibake`);
    });
  }
}

if (!dedupe || !Array.isArray(dedupe.entries) || dedupe.entries.length !== 671) {
  addError("dedupe audit must classify exactly 671 entries");
} else {
  const allowedDedupeStatuses = new Set([
    "unique_candidate",
    "existing_duplicate",
    "factually_suspect_or_time_sensitive",
    "malformed_ambiguous"
  ]);
  const seenDedupeNumbers = new Set();
  dedupe.entries.forEach((entry) => {
    if (!Number.isInteger(entry.number) || entry.number < 1 || entry.number > 671) {
      addError("dedupe audit contains an invalid item number");
      return;
    }
    if (seenDedupeNumbers.has(entry.number)) addError(`dedupe audit repeats WGI item ${entry.number}`);
    seenDedupeNumbers.add(entry.number);
    if (!allowedDedupeStatuses.has(entry.status)) addError(`dedupe item ${entry.number} has invalid status ${entry.status}`);
    if (entry.status === "existing_duplicate"
      && !(entry.matchedExisting && entry.matchedExisting.id)
      && !(entry.matchedEarlierWgi && Number.isInteger(entry.matchedEarlierWgi.number))) {
      addError(`dedupe item ${entry.number} has no canonical duplicate target`);
    }
  });
  if (dedupe.sourceEntryCount !== 671 || dedupe.bankQuestionCount !== 11412) {
    addError("dedupe audit does not describe the approved extraction and baseline bank");
  }
}

if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
  addError("authoritative evidence audit must be an object");
} else {
  if (evidence.sourcePdfSha256 !== expectedSourceSha256) addError("authoritative evidence audit has the wrong PDF hash");
  if (evidence.accessedOn !== verificationDate) addError(`authoritative evidence accessedOn must be ${verificationDate}`);
  if (!Array.isArray(evidence.items) || !evidence.items.length) {
    addError("authoritative evidence audit must contain item groups");
  } else {
    const evidenceNumbers = new Set();
    evidence.items.forEach((group, groupIndex) => {
      const location = `authoritative evidence group ${groupIndex + 1}`;
      if (!Array.isArray(group.itemNumbers) || !group.itemNumbers.length) addError(`${location} has no itemNumbers`);
      (group.itemNumbers || []).forEach((number) => {
        if (!Number.isInteger(number) || number < 1 || number > 671) addError(`${location} has invalid item number ${number}`);
        if (evidenceNumbers.has(number)) addError(`${location} repeats evidence for WGI item ${number}`);
        evidenceNumbers.add(number);
      });
      if (String(group.verifiedFinding || "").trim().length < 20) addError(`${location} needs a clear verifiedFinding`);
      if (!Array.isArray(group.sources)) addError(`${location} sources must be an array`);
      if (Array.isArray(group.sources) && group.sources.length === 0
        && String(group.reasonNoExternalUrl || "").trim().length < 20) {
        addError(`${location} needs sources or an explicit reasonNoExternalUrl`);
      }
      const urls = new Set();
      (group.sources || []).forEach((source, sourceIndex) => {
        const sourceLocation = `${location}.sources[${sourceIndex}]`;
        if (!String(source.url || "").startsWith("https://")) addError(`${sourceLocation} URL must be direct HTTPS`);
        if (urls.has(source.url)) addError(`${sourceLocation} repeats a URL within the evidence group`);
        urls.add(source.url);
        if (!String(source.authority || "").trim()) addError(`${sourceLocation} authority is required`);
        if (String(source.supports || "").trim().length < 12) addError(`${sourceLocation} support summary is too short`);
      });
    });
  }
}

const bankWithoutWgi = currentBank.filter((question) => !String(question.id || "").startsWith("WGI-"));
if (bankWithoutWgi.length < 11412) addError("current bank is missing the approved 11,412-question baseline");
const baselineQuestions = bankWithoutWgi.slice(0, 11412);
// Reconstruct only the seven reviewed option-D wording edits. Every other
// signature-relevant field must still match the original WGI audit baseline.
try {
  if (stableQuestionSignature(restoreLegacyAnswerOptions(baselineQuestions)) !== expectedBaselineSignature) {
    addError("the approved 11,412-question stable prefix changed outside the reviewed answer-text corrections");
  }
} catch (reason) {
  addError(reason.message);
}

const recordsByNumber = new Map();
const dedupeByNumber = new Map((dedupe.entries || []).map((entry) => [entry.number, entry]));
const evidenceByNumber = new Map();
(evidence.items || []).forEach((group) => {
  (group.itemNumbers || []).forEach((number) => evidenceByNumber.set(number, group));
});
function canonicalDedupeTarget(entry, trail = new Set()) {
  if (entry && entry.matchedExisting && entry.matchedExisting.id) return String(entry.matchedExisting.id);
  const earlierNumber = entry && entry.matchedEarlierWgi && entry.matchedEarlierWgi.number;
  if (!Number.isInteger(earlierNumber) || earlierNumber >= entry.number || trail.has(earlierNumber)) return null;
  const earlier = dedupeByNumber.get(earlierNumber);
  if (!earlier) return null;
  if (earlier.status !== "existing_duplicate") return `${sourceRecordId(earlierNumber)}-SRC`;
  const nextTrail = new Set(trail);
  nextTrail.add(earlierNumber);
  return canonicalDedupeTarget(earlier, nextTrail);
}
for (const record of reviewData.records) {
  const location = `${record._file || "review"}:${record.sourceRecordId || "unknown"}`;
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    addError(`${location}: record must be an object`);
    continue;
  }
  if (!pairIdPattern.test(String(record.sourceRecordId || ""))) addError(`${location}: invalid sourceRecordId`);
  if (!Number.isInteger(record.sourceQuestionNumber)
    || record.sourceQuestionNumber < target.firstQuestionNumber
    || record.sourceQuestionNumber > target.lastQuestionNumber) {
    addError(`${location}: sourceQuestionNumber must be within release target ${target.firstQuestionNumber}..${target.lastQuestionNumber}`);
    continue;
  }
  if (record.sourceRecordId !== sourceRecordId(record.sourceQuestionNumber)) {
    addError(`${location}: sourceRecordId does not match sourceQuestionNumber`);
  }
  if (recordsByNumber.has(record.sourceQuestionNumber)) addError(`${location}: duplicate review record`);
  recordsByNumber.set(record.sourceQuestionNumber, record);
  const fileMatch = String(record._file || "").match(/^wgi-reviewed-q(\d{4})-(\d{4})\.json$/i);
  if (!fileMatch
    || record.sourceQuestionNumber < Number(fileMatch[1])
    || record.sourceQuestionNumber > Number(fileMatch[2])) {
    addError(`${location}: sourceQuestionNumber falls outside the review file range`);
  }
  if (record.corpusId !== corpusId) addError(`${location}: corpusId must be ${corpusId}`);
  const extracted = extraction.entries && extraction.entries[record.sourceQuestionNumber - 1];
  if (!extracted || record.sourcePdfPage !== extracted.page) addError(`${location}: sourcePdfPage does not match extraction`);
  if (record.rawTextSha256 !== crypto.createHash("sha256").update(String(extracted ? extracted.raw : "")).digest("hex").toUpperCase()) {
    addError(`${location}: rawTextSha256 does not match extracted source line`);
  }
  if (!decisionActions.has(record.action)) addError(`${location}: action must be keep, skip or reject`);
  if (record.reviewStatus !== "verified") addError(`${location}: reviewStatus must be verified`);
  const expectedVerificationDate = verificationDateFor(record.sourceQuestionNumber);
  if (record.verifiedOn !== expectedVerificationDate) addError(`${location}: verifiedOn must be ${expectedVerificationDate}`);
  if (String(record.reason || "").trim().length < 20) addError(`${location}: a clear decision reason is required`);
  if (!new Set(["confirmed", "corrected", "not-applicable"]).has(record.printedAnswerAssessment)) {
    addError(`${location}: invalid printedAnswerAssessment`);
  }
  const dedupeEntry = dedupeByNumber.get(record.sourceQuestionNumber);
  if (!dedupeEntry) {
    addError(`${location}: matching dedupe audit entry is missing`);
  } else {
    if (dedupeEntry.status === "existing_duplicate" && record.action !== "skip") {
      addError(`${location}: the line-by-line audit identified an existing duplicate and it must be skipped`);
    }
    if (dedupeEntry.status === "malformed_ambiguous" && record.action !== "reject") {
      addError(`${location}: the line-by-line audit identified unrecoverable ambiguity and it must be rejected`);
    }
    if (record.action === "skip" && dedupeEntry.status === "existing_duplicate") {
      const expectedDuplicateOf = canonicalDedupeTarget(dedupeEntry);
      if (!expectedDuplicateOf || record.duplicateOf !== expectedDuplicateOf) {
        addError(`${location}: duplicateOf must use audited canonical target ${expectedDuplicateOf || "(missing)"}`);
      }
    }
  }
  const evidenceGroup = evidenceByNumber.get(record.sourceQuestionNumber);
  if (record.action === "keep" && evidenceGroup && /^(?:correction|internal-text-defect)/.test(evidenceGroup.auditClass)) {
    if (record.printedAnswerAssessment !== "corrected") {
      addError(`${location}: audited correction must use printedAnswerAssessment corrected`);
    }
    if (String(record.sourceQuestion && record.sourceQuestion.sourceNotes || "").trim().length < 30) {
      addError(`${location}: audited correction needs transparent sourceNotes`);
    }
  }

  if (record.action === "keep") {
    validateQuestion(record.sourceQuestion, record.sourceRecordId, "source", `${location}.sourceQuestion`, addError);
    validateQuestion(record.similarQuestion, record.sourceRecordId, "similar", `${location}.similarQuestion`, addError);
    if (record.sourceQuestion && record.similarQuestion && record.sourceQuestion.categoryId !== record.similarQuestion.categoryId) {
      addError(`${location}: source and similar question categories must match`);
    }
    if (record.sourceQuestion) {
      const expectedLabel = `Mastering One-Paper with WGI, PDF p.${record.sourcePdfPage}, item ${record.sourceQuestionNumber}`;
      if (record.sourceQuestion.source && record.sourceQuestion.source.label !== expectedLabel) {
        addError(`${location}.sourceQuestion: source.label must be ${expectedLabel}`);
      }
      if (!Array.isArray(record.sourceQuestion.tags)
        || !record.sourceQuestion.tags.includes("wgi")
        || !record.sourceQuestion.tags.includes(record.sourceRecordId.toLowerCase())) {
        addError(`${location}.sourceQuestion: tags must include wgi and ${record.sourceRecordId.toLowerCase()}`);
      }
    }
    if (record.similarQuestion) {
      if (!Array.isArray(record.similarQuestion.tags)
        || !record.similarQuestion.tags.includes("wgi")
        || !record.similarQuestion.tags.includes(record.sourceRecordId.toLowerCase())) {
        addError(`${location}.similarQuestion: tags must include wgi and ${record.sourceRecordId.toLowerCase()}`);
      }
    }
    if (record.sourceQuestion && record.similarQuestion
      && exactFingerprint(record.sourceQuestion.question) === exactFingerprint(record.similarQuestion.question)) {
      addError(`${location}: related question repeats the source question`);
    }
    if (record.duplicateOf) addError(`${location}: keep decision cannot set duplicateOf`);
  } else if (record.action === "skip") {
    if (!itemIdPattern.test(String(record.duplicateOf || ""))
      && !/^(?:(?:P23[4-9]-Q\d{3}|IBES-Q\d{4}|ADV2E102-U\d{4}-Q\d{3})-(?:SRC|SIM))$/.test(String(record.duplicateOf || ""))) {
      addError(`${location}: skip decision needs a valid canonical duplicateOf item ID`);
    }
    if (record.sourceQuestion || record.similarQuestion) addError(`${location}: skip decision must not add question objects`);
    if (record.printedAnswerAssessment !== "not-applicable") addError(`${location}: skip decision must use printedAnswerAssessment not-applicable`);
  } else if (record.action === "reject") {
    if (record.duplicateOf) addError(`${location}: reject decision cannot set duplicateOf`);
    if (record.sourceQuestion || record.similarQuestion) addError(`${location}: reject decision must not add question objects`);
    if (record.printedAnswerAssessment !== "not-applicable") addError(`${location}: reject decision must use printedAnswerAssessment not-applicable`);
  }
}

if (complete) {
  try {
    assertCompleteReleaseDecisions(reviewData.records, target);
  } catch (error) {
    addError(error.message);
  }
}

// The production bank now contains the retained WGI questions themselves.  For
// duplicate checks, treat the pre-WGI bank as the existing baseline so a newly
// released WGI question is not reported as a duplicate of its own output.
const existingBankQuestions = bankWithoutWgi;
const currentIds = new Set(existingBankQuestions.map((question) => String(question.id)));
const keepIds = new Set(retainedQuestions(reviewData.records).map((question) => String(question.id)));
const availableIds = new Set([...currentIds, ...keepIds]);
function isAuditedRejectedWgiTarget(id) {
  const match = String(id || "").match(/^WGI-Q(\d{4})-SRC$/);
  if (!match) return false;
  const audited = dedupeByNumber.get(Number(match[1]));
  return Boolean(audited && (audited.status === "malformed_ambiguous" || audited.status === "factually_suspect_or_time_sensitive"));
}
for (const record of reviewData.records.filter((item) => item.action === "skip")) {
  if (!availableIds.has(String(record.duplicateOf || "")) && !isAuditedRejectedWgiTarget(record.duplicateOf)) {
    addError(`${record.sourceRecordId}: duplicateOf target ${record.duplicateOf} does not exist`);
  }
  const match = String(record.duplicateOf || "").match(/^WGI-Q(\d{4})-/);
  if (match && Number(match[1]) >= record.sourceQuestionNumber) {
    addError(`${record.sourceRecordId}: WGI duplicate must target an earlier retained WGI item`);
  }
}

const existingFingerprints = new Map();
for (const question of existingBankQuestions) {
  const fingerprint = exactFingerprint(question.question);
  if (fingerprint && !existingFingerprints.has(fingerprint)) existingFingerprints.set(fingerprint, question.id);
}
const retainedFingerprints = new Map();
for (const question of retainedQuestions(reviewData.records)) {
  const fingerprint = exactFingerprint(question.question);
  if (!fingerprint) continue;
  if (existingFingerprints.has(fingerprint)) {
    addError(`${question.id}: exact question duplicate of ${existingFingerprints.get(fingerprint)}`);
  }
  if (retainedFingerprints.has(fingerprint)) {
    addError(`${question.id}: exact question duplicate of ${retainedFingerprints.get(fingerprint)}`);
  }
  retainedFingerprints.set(fingerprint, question.id);
}

const counts = { keep: 0, skip: 0, reject: 0 };
for (const record of reviewData.records) {
  if (Object.prototype.hasOwnProperty.call(counts, record.action)) counts[record.action] += 1;
}
if (!complete && reviewData.records.length < target.decisionCount) {
  warnings.push(`review is partial: ${reviewData.records.length}/${target.decisionCount} release decisions are present`);
}

for (const message of errors) console.error(`ERROR ${message}`);
for (const message of warnings) console.warn(`WARN ${message}`);
console.log(JSON.stringify({
  corpusId,
  extractionEntries: Array.isArray(extraction.entries) ? extraction.entries.length : 0,
  releaseTarget: `${target.firstQuestionNumber}..${target.lastQuestionNumber}`,
  reviewFiles: reviewData.files.length,
  reviewedEntries: reviewData.records.length,
  decisions: counts,
  retainedWebsiteQuestions: counts.keep * 2,
  errors: errors.length,
  warnings: warnings.length
}, null, 2));

if (errors.length) process.exitCode = 1;
