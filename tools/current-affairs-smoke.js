"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const {
  BASELINE_COUNT, BASELINE_SIGNATURE, BASELINE_SHA256, RELEASE_COUNT,
  SOURCE_FILE, validateSupplement, sha256
} = require("./current-affairs-common");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data/questions.js"), "utf8"), context);
const bank = JSON.parse(JSON.stringify(context.window.PPSC_QUIZ_DATA));
const additions = validateSupplement(bank);
const source = JSON.parse(fs.readFileSync(path.join(root, "work", SOURCE_FILE), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(root, "work", "current-affairs-20261021-audit.json"), "utf8"));
assert.equal(source.length, additions.length);
assert.equal(audit.baseline.questionCount, BASELINE_COUNT);
assert.equal(audit.addedQuestionCount, additions.length);
assert.equal(audit.addedPairCount, additions.length / 2);
assert.equal(audit.baselineCurrentAffairsCount, 610);
assert.equal(audit.expectedCurrentAffairsCountAfterAppend, 650);
assert.equal(audit.uniqueReferenceUrlCount, new Set(additions.flatMap((question) => question.references.map((reference) => reference.url))).size);
assert.equal(audit.independentAuthorityCount, new Set(additions.flatMap((question) => question.references.map((reference) => reference.authorityId))).size);
const oldQuestionIds = new Set(bank.questions.slice(0, BASELINE_COUNT).map((question) => question.id));
assert.deepEqual(audit.semanticReview.map((entry) => entry.pairId), additions.filter((question) => question.kind === "source").map((question) => question.pairId));
for (const review of audit.semanticReview) {
  assert.equal(review.action, "keep");
  assert.ok(review.decision.length >= 20, `${review.pairId}: missing duplicate-review rationale`);
  assert.ok(review.comparedExistingIds.every((id) => oldQuestionIds.has(id)), `${review.pairId}: unknown comparison ID`);
}
for (const skipped of audit.skippedCandidates) {
  assert.ok(skipped.existingIds.length > 0 && skipped.existingIds.every((id) => oldQuestionIds.has(id)), "Skipped duplicate must identify an actual original MCQ");
}
for (let index = 0; index < additions.length; index += 1) {
  const actual = additions[index];
  const expected = source[index];
  // Similar-option balancing may change slots, but never the answer or content.
  assert.equal(actual.id, expected.id);
  assert.equal(actual.question, expected.question);
  assert.equal(actual.questionUrdu, expected.questionUrdu);
  assert.equal(actual.explanationUrdu, expected.explanationUrdu);
  assert.equal(actual.options[actual.correctOptionIndex], expected.options[expected.correctOptionIndex]);
  assert.deepEqual(actual.references, expected.references);
  assert.deepEqual(actual.temporalScope, expected.temporalScope);
}

function signature(questions) {
  let hash = 2166136261;
  for (const question of questions) {
    const text = JSON.stringify([
      question.id, question.categoryId, question.question, question.questionUrdu,
      question.correctOptionIndex, question.options, question.optionsUrdu
    ]) + "\n";
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
  }
  return `v1:${questions.length}:${(hash >>> 0).toString(16)}`;
}

assert.equal(signature(bank.questions.slice(0, BASELINE_COUNT)), BASELINE_SIGNATURE);
const prefix = bank.questions.slice(0, BASELINE_COUNT);
const oldImportantIds = prefix.filter((question) => question.isImportant || Number(question.repeatCount) >= 2).map((question) => question.id);
const allImportantIds = bank.questions.filter((question) => question.isImportant || Number(question.repeatCount) >= 2).map((question) => question.id);
assert.deepEqual(allImportantIds, oldImportantIds, "Important deck must not silently change without repeat evidence");
assert.equal(oldImportantIds.length, 1197);
// Ensure guards reject actual corruption, not merely that the happy path passes.
function changedQuestion(index, patch) {
  const copy = { ...bank, questions: bank.questions.slice() };
  copy.questions[index] = { ...copy.questions[index], ...patch };
  return copy;
}
const changed = changedQuestion(0, { explanationUrdu: bank.questions[0].explanationUrdu + " changed" });
assert.throws(() => validateSupplement(changed), /original question/);
const reordered = { ...bank, questions: bank.questions.slice() };
[reordered.questions[0], reordered.questions[1]] = [reordered.questions[1], reordered.questions[0]];
assert.throws(() => validateSupplement(reordered), /original question/);
const fabricated = changedQuestion(bank.questions.length - 1, { repeatCount: 5 });
assert.throws(() => validateSupplement(fabricated), /fabricate repeat/);
const duplicate = changedQuestion(bank.questions.length - 1, { question: bank.questions[0].question });
assert.throws(() => validateSupplement(duplicate), /repeated question wording/);

execFileSync(process.execPath, ["tools/build-question-bank.js", "--check"], { cwd: root, stdio: "pipe", windowsHide: true });
console.log(JSON.stringify({
  ok: true, originalQuestionsUnchanged: BASELINE_COUNT,
  baselineSha256: BASELINE_SHA256, observedPrefixSha256: sha256(prefix),
  baselineSignature: BASELINE_SIGNATURE, releaseSignature: signature(bank.questions),
  addedQuestions: additions.length, totalQuestions: RELEASE_COUNT,
  currentAffairsQuestions: bank.questions.filter((question) => question.categoryId === "current-affairs").length,
  importantQuestionsUnchanged: oldImportantIds.length,
  checks: ["complete original objects/order/answers/repeat counts preserved", "stable append-only IDs", "two answer authorities per MCQ", "explicit temporal scope", "Urdu text", "duplicate stems/options rejected", "deterministic rebuild", "corruption guards reject changes"]
}, null, 2));
