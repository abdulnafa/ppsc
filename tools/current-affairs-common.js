"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { validateReferences, validateTemporalScope } = require("./adv2e102-common");

// Approved release before the 2026-10-21 supplement. Hash complete objects,
// including option order, explanations and important/repeat metadata, not just IDs.
const BASELINE_COUNT = 11892;
const BASELINE_SIGNATURE = "v1:11892:57530f77";
const BASELINE_SHA256 = "1c00a533c855daaf5d7f7547afa90e2f3361a909e5a2f1ac1754545879b3b9fc";
const CATEGORY_SHA256 = "1a851dee91fed2d537c8ce699266a6806d49a71593f0103e9f5c7b3186bac402";
const SUPPLEMENT_COUNT = 40;
const RELEASE_COUNT = BASELINE_COUNT + SUPPLEMENT_COUNT;
const VERIFIED_ON = "2026-10-21";
const SOURCE_FILE = "current-affairs-20261021.json";

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertApprovedPrefix(bank) {
  assert.equal(sha256(bank.categories), CATEGORY_SHA256, "Existing categories/order must remain unchanged");
  assert.ok(bank.questions.length >= BASELINE_COUNT, "Original question bank is incomplete");
  assert.equal(sha256(bank.questions.slice(0, BASELINE_COUNT)), BASELINE_SHA256,
    "Append-only release: an original question/object/order/repeat count changed");
}

function questionKey(text) {
  return String(text).normalize("NFKC").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function validateSupplement(bank) {
  assertApprovedPrefix(bank);
  assert.equal(bank.questions.length, RELEASE_COUNT, "Unexpected supplement release count");
  const oldIds = new Set(bank.questions.slice(0, BASELINE_COUNT).map((question) => question.id));
  const stems = new Set(bank.questions.slice(0, BASELINE_COUNT).map((question) => questionKey(question.question)));
  const additions = bank.questions.slice(BASELINE_COUNT);
  const fail = (message) => { throw new Error(message); };
  additions.forEach((question, index) => {
    const number = Math.floor(index / 2) + 1;
    const pairId = `USR-Q${String(number).padStart(4, "0")}`;
    const isSource = index % 2 === 0;
    assert.equal(question.id, `${pairId}-${isSource ? "SRC" : "SIM"}`, "Supplement IDs/order must be stable");
    assert.equal(question.pairId, pairId);
    assert.equal(question.kind, isSource ? "source" : "similar");
    assert.equal(question.source.type, isSource ? "user" : "practice");
    assert.equal(question.categoryId, "current-affairs");
    assert.equal(question.verificationStatus, "verified");
    assert.equal(oldIds.has(question.id), false, "Supplement overwrites an existing ID");
    const key = questionKey(question.question);
    assert.equal(stems.has(key), false, `${question.id}: repeated question wording`);
    stems.add(key);
    assert.equal(Object.hasOwn(question, "isImportant"), false, "New material has no repeated-paper evidence yet");
    assert.equal(Object.hasOwn(question, "repeatCount"), false, "Do not fabricate repeat counts for new material");
    assert.equal(question.source.accessedOn, VERIFIED_ON);
    assert.ok(/\p{Script=Arabic}/u.test(question.questionUrdu), `${question.id}: missing Urdu question`);
    assert.ok(/\p{Script=Arabic}/u.test(question.explanationUrdu), `${question.id}: missing Urdu explanation`);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map((option) => questionKey(typeof option === "object" ? option.text : option))).size, 4,
      `${question.id}: duplicate options`);
    assert.ok(Number.isInteger(question.correctOptionIndex) && question.correctOptionIndex >= 0 && question.correctOptionIndex < 4);
    const evidence = validateReferences(question.references, question.id, fail, 2);
    assert.ok(evidence.answerUrls.has(question.source.referenceUrl), `${question.id}: primary source must support the answer`);
    validateTemporalScope(question.temporalScope, question.question, question.id, fail);
    assert.ok(["event-date", "as-of"].includes(question.temporalScope.type), `${question.id}: date scope required`);
    question.references.forEach((reference) => assert.equal(reference.accessedOn, VERIFIED_ON));
  });
  assert.equal(bank.questions.filter((question) => question.categoryId === "current-affairs").length, 650);
  return additions;
}

module.exports = {
  BASELINE_COUNT, BASELINE_SIGNATURE, BASELINE_SHA256, CATEGORY_SHA256,
  SUPPLEMENT_COUNT, RELEASE_COUNT, VERIFIED_ON, SOURCE_FILE,
  assertApprovedPrefix, questionKey, sha256, validateSupplement
};
