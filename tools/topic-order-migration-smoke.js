"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const scripts = ["data/questions.js", "data/topic-taxonomy.js", "data/new-question-ids.js"];
const context = { window: {} };
for (const name of scripts) {
  vm.runInNewContext(fs.readFileSync(path.join(root, name), "utf8"), context);
}
const data = context.window.PPSC_QUIZ_DATA;
const original = data.questions.slice(0, 11952);
assert.equal(original.length, 11952);
assert(data.questions.length > original.length, "Test requires appended questions");

const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
assert.equal(appSource.split(marker).length, 2);
const seam = `
  window.TOPIC_MIGRATION_TEST = {
    signature: questionBankSignature,
    normalize: normalizeStoredSession,
    normalizeQueue: normalizeRetryQueue
  };`;
const testWindow = {
  PPSC_QUIZ_DATA: data,
  PPSC_TOPIC_DATA: context.window.PPSC_TOPIC_DATA,
  PPSC_NEW_QUESTION_IDS: context.window.PPSC_NEW_QUESTION_IDS,
  location: { protocol: "https:", hostname: "test.invalid" },
  addEventListener() {}, dispatchEvent() {},
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
};
const document = { readyState: "loading", addEventListener() {}, querySelector() { return null; } };
vm.runInNewContext(appSource.replace(marker, seam + marker), {
  window: testWindow, document, console
});
const api = testWindow.TOPIC_MIGRATION_TEST;
const oldPool = Array.from(original.filter(question => question.categoryId === "general-knowledge"));
const ids = Array.from(oldPool.slice(0, 5).map(question => question.id));
const saved = {
  version: 8,
  bankSignature: "v1:11952:b657229a",
  sessionKind: "category", categoryId: "general-knowledge", paperCategoryIds: null,
  mode: "learn", scope: "all", computerSourceScope: "all", partIndex: null,
  importantOnly: false,
  rangeStart: 1, rangeEnd: 5, rangePoolSize: oldPool.length,
  rangePoolQuestionIds: oldPool.map(question => question.id), rangeQuestionIds: ids,
  questionIds: ids, optionOrders: null, answerHistory: null,
  learnVisitedQuestionIds: ids.slice(0, 2),
  learnReviewCountedQuestionIds: ids.slice(0, 2),
  currentIndex: 2, selectedIndex: null, submitted: false, score: 0, savedAt: 12345
};
const normalized = api.normalize(saved);
assert(normalized, "Old bank-order session must migrate into topic-ordered release");
assert.deepEqual(Array.from(normalized.snapshot.questionIds), ids);
assert.equal(normalized.snapshot.currentIndex, 2);
assert.equal(normalized.snapshot.rangePoolBankSignature, saved.bankSignature);
const reloaded = api.normalize(normalized.snapshot);
assert(reloaded, "Migrated frozen bank-order pool must survive a later reload");
assert.deepEqual(Array.from(reloaded.snapshot.learnVisitedQuestionIds), ids.slice(0, 2));
const tampered = { ...saved, rangePoolQuestionIds: saved.rangePoolQuestionIds.slice() };
[tampered.rangePoolQuestionIds[0], tampered.rangePoolQuestionIds[10]] =
  [tampered.rangePoolQuestionIds[10], tampered.rangePoolQuestionIds[0]];
assert.equal(api.normalize(tampered), null, "Unknown pool permutation must stay invalid");

assert.equal(api.signature.startsWith("v1:" + data.questions.length + ":"), true);
console.log(JSON.stringify({
  ok: true, oldQuestionCount: original.length, currentQuestionCount: data.questions.length,
  oldBankOrderResume: true, subsequentReload: true, unknownOrderRejected: true
}));
