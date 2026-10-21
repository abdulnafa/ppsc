"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const SESSION = "ppsc-prep:active-session:v1";
const ARCHIVE = "ppsc-prep:category-sessions:v1";
const QUEUE = "ppsc-prep:retry-queue:v1";
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data/questions.js"), "utf8"), context);
const plain = value => JSON.parse(JSON.stringify(value));
const data = plain(context.window.PPSC_QUIZ_DATA);
const oldData = { ...data, questions: data.questions.slice(0, 11892) };
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
function harness(initial = {}, bank = data) {
  const values = new Map(Object.entries(initial)), events = [];
  let failWrites = false;
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  const window = {
    PPSC_QUIZ_DATA: bank, CustomEvent,
    location: { protocol: "https:", hostname: "archive-test.invalid" },
    addEventListener() {}, dispatchEvent(event) { events.push(event); },
    localStorage: {
      getItem(key) { return values.get(key) || null; },
      setItem(key, value) { if (failWrites) throw new Error("QuotaExceededError"); values.set(key, String(value)); },
      removeItem(key) { if (failWrites) throw new Error("QuotaExceededError"); values.delete(key); }
    }
  };
  const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
  assert.equal(source.split(marker).length, 2);
  const seam = `
  window.test = {
    signature: questionBankSignature, key: categorySessionKey,
    normalize: normalizeStoredSession, normalizeQueue: normalizeRetryQueue,
    load: loadActiveSession, loadArchive: loadCategorySessions,
    archive: function () { return categorySessions; },
    restored: function () { return activeSessionSnapshot; },
    restore: restoreActiveSession, save: saveActiveSession,
    resume: function (key) { state.category = findCategory(key.split(':')[0]); return restoreCategorySession(key); },
    complete: function () { removeStoredActiveSession(true); },
    emptyQueue: createEmptyRetryQueueState,
    loadQueue: loadRetryQueue, queue: function () { return retryQueueState; },
    persistOk: function () { return categorySessionsPersisted; }
  };`;
  const document = { readyState: "loading", addEventListener() {}, querySelector() { return null; } };
  vm.runInNewContext(source.replace(marker, seam + marker), { window, document, CustomEvent, console });
  return {
    api: window.test, events, values,
    raw() { return Object.fromEntries(values); },
    read(key) { return values.has(key) ? JSON.parse(values.get(key)) : null; },
    failWrites() { failWrites = true; }
  };
}
const signatureProbe = harness();
const oldSignatureProbe = harness({}, oldData);
function fixture(categoryId, mode, bank = data, important = false, scope = "all") {
  const pool = bank.questions.filter(q => q.categoryId === categoryId && (!important || q.isImportant || q.repeatCount >= 2));
  const ids = pool.slice(0, 5).map(q => q.id), currentIndex = Math.min(2, ids.length - 1);
  const selectedIndex = mode === "quiz" ? pool[currentIndex].correctOptionIndex : null;
  return {
    version: 8, bankSignature: (bank === oldData ? oldSignatureProbe : signatureProbe).api.signature, sessionKind: "category",
    categoryId, paperCategoryIds: null, mode, scope, computerSourceScope: "all", partIndex: null,
    importantOnly: important, rangeStart: 1, rangeEnd: ids.length,
    rangePoolSize: pool.length, rangePoolQuestionIds: pool.map(q => q.id), rangeQuestionIds: ids,
    questionIds: ids, optionOrders: mode === "quiz" ? ids.map(() => [0, 1, 2, 3]) : null,
    answerHistory: mode === "quiz" ? ids.map((_id, i) => i === currentIndex ? [selectedIndex, false]
      : i === 0 ? [pool[i].correctOptionIndex, true] : null) : null,
    learnVisitedQuestionIds: mode === "learn" ? ids.slice(0, currentIndex) : null,
    learnReviewCountedQuestionIds: mode === "learn" ? ids.slice(0, currentIndex) : null,
    currentIndex, selectedIndex, submitted: false, score: mode === "quiz" ? 1 : 0, savedAt: 12345
  };
}
function equalSession(actual, expected) {
  const left = plain(actual), right = plain(expected);
  delete left.savedAt; delete right.savedAt;
  assert.deepEqual(left, right);
}

const sessions = {};
for (const category of data.categories) {
  for (const mode of ["learn", "quiz"]) {
    const saved = fixture(category.id, mode);
    sessions[signatureProbe.api.key(saved)] = saved;
  }
}
assert.equal(Object.keys(sessions).length, 22);
const active = sessions["general-knowledge:quiz:all:all:all"];
let app = harness({ [SESSION]: JSON.stringify(active) });
app.api.load();
assert.equal(app.read(SESSION).savedAt, active.savedAt, "Initial migration must not replace existing active state");
equalSession(app.read(ARCHIVE).sessions[app.api.key(active)], active);
assert(app.events.some(event => event.detail?.key === ARCHIVE), "Archive migration must notify cloud");

// Simulate archive write succeeding but the active-slot write failing. Global
// Continue must choose the newer same-profile record instead of rewinding it.
const newerActive = plain(active);
newerActive.currentIndex = 3;
newerActive.selectedIndex = null;
newerActive.answerHistory[2] = null;
newerActive.savedAt = active.savedAt + 1;
const partialSave = harness({ [SESSION]: JSON.stringify(active),
  [ARCHIVE]: JSON.stringify({ version: 1, sessions: { [signatureProbe.api.key(active)]: newerActive } }) });
partialSave.api.load();
equalSession(partialSave.read(SESSION), newerActive);
assert(partialSave.api.restore());
equalSession(partialSave.read(SESSION), newerActive);
equalSession(partialSave.read(ARCHIVE).sessions[signatureProbe.api.key(active)], newerActive);

app = harness({ [ARCHIVE]: JSON.stringify({ version: 1, sessions }), [SESSION]: JSON.stringify(active) });
app.api.load();
for (const [key, saved] of Object.entries(sessions)) {
  assert(app.api.resume(key), "Must resume " + key);
  equalSession(app.read(SESSION), saved);
  assert.equal(Object.keys(app.read(ARCHIVE).sessions).length, 22, "Switching must preserve all saved modes/categories");
}
app = harness(app.raw());
app.api.load();
assert.equal(Object.keys(app.api.archive()).length, 22, "Reload lost category saves");
assert(app.api.resume("general-knowledge:quiz:all:all:all"));
app.api.complete();
assert.equal(Object.keys(app.read(ARCHIVE).sessions).length, 21);
assert(!app.read(ARCHIVE).sessions["general-knowledge:quiz:all:all:all"]);
assert(app.read(ARCHIVE).sessions["general-knowledge:learn:all:all:all"]);
assert(app.read(ARCHIVE).sessions["pakistan-studies:quiz:all:all:all"]);
const reload = harness(app.raw()); reload.api.load();
assert(!reload.api.archive()["general-knowledge:quiz:all:all:all"], "Completed save resurrected on reload");

// Selected modes/filters are distinct, and a new range in the same mode is an intentional replacement only.
const important = fixture("general-knowledge", "quiz", data, true);
assert.notEqual(app.api.key(important), app.api.key(active));
assert.notEqual(app.api.key({ ...active, scope: "wrong" }), app.api.key(active));
assert.notEqual(app.api.key({ ...active, scope: "difficult" }), app.api.key(active));
assert.notEqual(app.api.key({ ...active, computerSourceScope: "initial-original" }), app.api.key(active));

const rawBeforeQuota = app.values.get(ARCHIVE);
app.api.resume("pakistan-studies:learn:all:all:all");
const goodArchive = app.values.get(ARCHIVE);
app.failWrites(); app.api.save();
assert.equal(app.values.get(ARCHIVE), goodArchive, "Quota failure must not erase previous saves");
assert.equal(app.api.persistOk(), false);
app.api.complete();
assert(!app.api.archive()["pakistan-studies:learn:all:all:all"], "Quota failure must not leave the completed session in memory");
assert.equal(app.values.get(ARCHIVE), goodArchive, "Failed storage writes must preserve the last persisted archive");
assert(rawBeforeQuota);

const invalidArchive = JSON.stringify({ version: 1, sessions: { forged: active } });
const invalid = harness({ [ARCHIVE]: invalidArchive }); invalid.api.loadArchive();
assert.equal(Object.keys(invalid.api.archive()).length, 0);
assert.equal(invalid.values.get(ARCHIVE), invalidArchive, "Do not erase invalid stored archive on startup");
invalid.values.set(SESSION, JSON.stringify(active)); invalid.api.load(); invalid.api.restore();
assert.equal(invalid.values.get(ARCHIVE), invalidArchive, "New progress must not overwrite an unrecognized archive");

assert.equal(oldSignatureProbe.api.signature, "v1:11892:57530f77", "Protected bank prefix changed");
let migrationCases = 0;
if (data.questions.length > 11892) {
  const oldSessions = {};
  for (const mode of ["learn", "quiz"]) {
    const saved = fixture("current-affairs", mode, oldData);
    oldSessions[signatureProbe.api.key(saved)] = saved;
  }
  const oldQuiz = oldSessions["current-affairs:quiz:all:all:all"];
  let oldQueue = plain(oldSignatureProbe.api.emptyQueue());
  const questionId = oldQuiz.questionIds[0];
  Object.assign(oldQueue, { practiceStep: 7, nextSequence: 2,
    items: [{ questionId, remaining: 9, dueStep: 17, sequence: 1 }],
    queueCyclePendingByCategory: { "current-affairs": [questionId] } });
  // Compare a valid old-bank persisted state, including its existing canonical
  // cadence/retired-sequential fields, not an inconsistent hand-built fixture.
  oldQueue = plain(oldSignatureProbe.api.normalizeQueue(oldQueue));
  assert.equal(oldQueue.items[0].remaining, 9);
  assert.equal(oldQueue.items[0].sequence, 1);
  let migrated = harness({ [SESSION]: JSON.stringify(oldQuiz), [ARCHIVE]: JSON.stringify({ version: 1, sessions: oldSessions }), [QUEUE]: JSON.stringify(oldQueue) });
  migrated.api.loadQueue(); migrated.api.load();
  const expectedQueue = { ...oldQueue, bankSignature: migrated.api.signature };
  assert.deepEqual(plain(migrated.api.queue()), expectedQueue, "Append-only update changed queue content/counts/order");
  for (let round = 0; round < 3; round++) {
    for (const [key, previous] of Object.entries(oldSessions)) {
      assert(migrated.api.resume(key));
      equalSession(migrated.read(SESSION), { ...previous,
        bankSignature: migrated.api.signature, rangePoolBankSignature: "v1:11892:57530f77" });
      assert.equal(migrated.read(SESSION).rangePoolSize, 610, "New MCQs injected into ongoing CA practice");
      migrationCases++;
    }
    migrated = harness(migrated.raw()); migrated.api.loadQueue(); migrated.api.load();
  }
  assert.deepEqual(plain(migrated.api.queue()), expectedQueue);
  for (const mutate of [bank => { bank.questions[0].question += " drift"; }, bank => { [bank.questions[0], bank.questions[1]] = [bank.questions[1], bank.questions[0]]; }]) {
    const brokenBank = plain(data); mutate(brokenBank);
    const broken = harness({}, brokenBank);
    assert.equal(broken.api.normalize(oldQuiz), null);
    assert.equal(broken.api.normalizeQueue(oldQueue), null);
  }
}
console.log(JSON.stringify({ ok: true, categoryModes: 22, migrationCases,
  checks: ["legacy active save copied without replacing it", "newer same-profile archive survives a partial active-slot write", "all categories and Learn/Quiz separately survive switches/reload",
    "completion deletes only its own save", "filter/source keys distinct", "quota failure preserves previous storage",
    "malformed archive fails closed without erasing raw data", "append-only CA update freezes old pool/answers/order and queue counts"] }, null, 2));
