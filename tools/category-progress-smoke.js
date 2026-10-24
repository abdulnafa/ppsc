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
const bankSignatures = new Map([[data, signatureProbe.api.signature], [oldData, oldSignatureProbe.api.signature]]);
function fixture(categoryId, mode, bank = data, important = false, scope = "all") {
  if (!bankSignatures.has(bank)) bankSignatures.set(bank, harness({}, bank).api.signature);
  const pool = bank.questions.filter(q => q.categoryId === categoryId && (!important || q.isImportant || q.repeatCount >= 2));
  const ids = pool.slice(0, 5).map(q => q.id), currentIndex = Math.min(2, ids.length - 1);
  const selectedIndex = mode === "quiz" ? pool[currentIndex].correctOptionIndex : null;
  return {
    version: 8, bankSignature: bankSignatures.get(bank), sessionKind: "category",
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
function shuffledFixture(categoryId, mode) {
  const saved = fixture(categoryId, mode);
  const canonicalIds = saved.rangeQuestionIds;
  saved.questionIds = [canonicalIds[2], canonicalIds[4], canonicalIds[0], canonicalIds[3], canonicalIds[1]];
  if (mode === "learn") {
    saved.learnVisitedQuestionIds = saved.questionIds.slice(0, saved.currentIndex);
    saved.learnReviewCountedQuestionIds = saved.learnVisitedQuestionIds.slice();
  } else {
    const first = data.questions.find(question => question.id === saved.questionIds[0]);
    const current = data.questions.find(question => question.id === saved.questionIds[saved.currentIndex]);
    saved.selectedIndex = current.correctOptionIndex;
    saved.answerHistory = saved.questionIds.map((_id, index) => index === 0
      ? [first.correctOptionIndex, true]
      : index === saved.currentIndex ? [current.correctOptionIndex, false] : null);
  }
  return saved;
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

// Newly shuffled rounds preserve canonical range metadata but freeze their
// actual question order through category switches, saving and reloads.
for (const mode of ["learn", "quiz"]) {
  const shuffled = shuffledFixture("general-knowledge", mode);
  assert.notDeepEqual(shuffled.questionIds, shuffled.rangeQuestionIds);
  const normalized = signatureProbe.api.normalize(shuffled);
  assert(normalized, mode + " shuffled session must validate");
  assert.deepEqual(plain(normalized.snapshot.questionIds), shuffled.questionIds);
  assert.deepEqual(plain(normalized.snapshot.rangeQuestionIds), shuffled.rangeQuestionIds);
  const shuffledApp = harness({ [SESSION]: JSON.stringify(shuffled) });
  shuffledApp.api.load();
  assert(shuffledApp.api.restore(), mode + " shuffled session must Continue");
  shuffledApp.api.save();
  equalSession(shuffledApp.read(SESSION), shuffled);
  const reloadedShuffled = harness(shuffledApp.raw());
  reloadedShuffled.api.load();
  assert(reloadedShuffled.api.restore(), mode + " shuffled session must survive reload");
  equalSession(reloadedShuffled.read(SESSION), shuffled);
  for (const invalidIds of [
    [shuffled.questionIds[0], shuffled.questionIds[0], ...shuffled.questionIds.slice(2)],
    ["missing-question-id", ...shuffled.questionIds.slice(1)],
    shuffled.questionIds.slice(1)
  ]) {
    assert.equal(signatureProbe.api.normalize({ ...shuffled, questionIds: invalidIds }), null,
      "Shuffled session must reject IDs that are not an exact permutation of the selected range");
  }
}

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
// The user is currently studying the 11,932-question release. Exercise that
// exact signature too, including entries from its 40-question supplement.
// A synthetic append keeps this migration test useful before/after the next
// researched batch is ready, without changing any production questions.
const recentData = { ...data, questions: data.questions.slice(0, 11932) };
const recentProbe = harness({}, recentData);
bankSignatures.set(recentData, recentProbe.api.signature);
assert.equal(recentProbe.api.signature, "v1:11932:27bcab12", "Approved Current Affairs prefix changed");
const appendedData = data.questions.length > 11932 ? data : {
  ...data,
  questions: data.questions.concat([0, 1].map(index => ({
    ...data.questions[11930 + index], id: "USR-Q9999-" + (index ? "SIM" : "SRC"), pairId: "USR-Q9999"
  })))
};
const recentSessions = {};
for (const category of recentData.categories) {
  for (const mode of ["learn", "quiz"]) {
    const saved = fixture(category.id, mode, recentData);
    if (category.id === "current-affairs") {
      const tail = recentData.questions.filter(question => question.categoryId === category.id).slice(-5);
      const ids = tail.map(question => question.id);
      Object.assign(saved, {
        rangeStart: 646, rangeEnd: 650, rangeQuestionIds: ids, questionIds: ids,
        selectedIndex: mode === "quiz" ? tail[saved.currentIndex].correctOptionIndex : null,
        answerHistory: mode === "quiz" ? tail.map((question, index) => index === saved.currentIndex
          ? [question.correctOptionIndex, false] : index === 0 ? [question.correctOptionIndex, true] : null) : null,
        learnVisitedQuestionIds: mode === "learn" ? ids.slice(0, saved.currentIndex) : null,
        learnReviewCountedQuestionIds: mode === "learn" ? ids.slice(0, saved.currentIndex) : null
      });
    }
    recentSessions[recentProbe.api.key(saved)] = saved;
  }
}
const recentQuiz = recentSessions["current-affairs:quiz:all:all:all"];
const recentQueueQuestionId = recentData.questions[11930].id;
let recentQueue = plain(recentProbe.api.emptyQueue());
Object.assign(recentQueue, {
  practiceStep: 43, nextSequence: 8,
  items: [
    { questionId: recentQuiz.questionIds[0], remaining: 13, dueStep: 51, sequence: 1 },
    { questionId: recentQueueQuestionId, remaining: 7, dueStep: 54, sequence: 7 }
  ],
  queueCyclePendingByCategory: { "current-affairs": [recentQueueQuestionId, recentQuiz.questionIds[0]] }
});
recentQueue = plain(recentProbe.api.normalizeQueue(recentQueue));
assert.deepEqual(recentQueue.items.map(item => item.remaining), [13, 7]);
const recentRaw = {
  [SESSION]: JSON.stringify(recentQuiz),
  [ARCHIVE]: JSON.stringify({ version: 1, sessions: recentSessions }),
  [QUEUE]: JSON.stringify(recentQueue)
};
let recentMigration = harness(recentRaw, appendedData);
recentMigration.api.loadQueue(); recentMigration.api.load();
const expectedRecentQueue = { ...recentQueue, bankSignature: recentMigration.api.signature };
assert.notEqual(recentMigration.api.signature, recentProbe.api.signature);
assert.deepEqual(plain(recentMigration.api.queue()), expectedRecentQueue,
  "11,932 append changed queue counts/order/cooldowns/category cycle/popup settings");
for (let round = 0; round < 3; round++) {
  for (const [key, saved] of Object.entries(recentSessions)) {
    assert(recentMigration.api.resume(key), "11,932 session must resume: " + key);
    equalSession(recentMigration.read(SESSION), { ...saved,
      bankSignature: recentMigration.api.signature,
      ...(saved.categoryId === "current-affairs" ? { rangePoolBankSignature: recentProbe.api.signature } : {}) });
    if (saved.categoryId === "current-affairs") {
      assert.equal(recentMigration.read(SESSION).rangePoolSize, 650,
        "New MCQs must not be inserted into an unfinished 650-question CA pool");
    }
    migrationCases++;
  }
  assert.equal(Object.keys(recentMigration.read(ARCHIVE).sessions).length, 22);
  assert.deepEqual(plain(recentMigration.api.queue()), expectedRecentQueue);
  recentMigration = harness(recentMigration.raw(), appendedData);
  recentMigration.api.loadQueue(); recentMigration.api.load();
}
assert(recentMigration.events.some(event => event.detail?.key === SESSION)
  || recentMigration.read(SESSION).bankSignature === recentMigration.api.signature);
const notified = harness(recentRaw, appendedData);
notified.api.loadQueue(); notified.api.load(); notified.api.restore();
for (const key of [SESSION, ARCHIVE, QUEUE]) {
  assert(notified.events.some(event => event.detail?.key === key), "Migration must notify cloud for " + key);
}
for (const mutate of [
  bank => { bank.questions[11931].question += " changed"; },
  bank => { [bank.questions[11930], bank.questions[11931]] = [bank.questions[11931], bank.questions[11930]]; },
  bank => { bank.questions[11930].options.reverse(); }
]) {
  const brokenBank = plain(appendedData); mutate(brokenBank);
  const broken = harness({}, brokenBank);
  assert.equal(broken.api.normalize(recentQuiz), null, "Edited 11,932 prefix must not authorize session migration");
  assert.equal(broken.api.normalizeQueue(recentQueue), null, "Edited 11,932 prefix must not authorize queue migration");
}
const unknown = { ...recentQuiz, bankSignature: "v1:11932:00000000" };
assert.equal(harness({}, appendedData).api.normalize(unknown), null, "Unknown signature must stay rejected");
assert.equal(harness({}, appendedData).api.normalizeQueue({ ...recentQueue, bankSignature: unknown.bankSignature }), null);
assert.equal(recentProbe.api.normalize({ ...recentQuiz, bankSignature: "v1:11932:00000000" }), null);

console.log(JSON.stringify({ ok: true, categoryModes: 22, migrationCases,
  checks: ["legacy active save copied without replacing it", "newer same-profile archive survives a partial active-slot write", "all categories and Learn/Quiz separately survive switches/reload",
    "shuffled Learn/Quiz rounds preserve frozen order and reject invalid membership", "completion deletes only its own save", "filter/source keys distinct", "quota failure preserves previous storage",
    "malformed archive fails closed without erasing raw data", "append-only CA update freezes old pool/answers/order and queue counts",
    "11,932 release resumes all 22 category/mode saves without changing its 650-question CA pool",
    "11,932 migration preserves supplementary queue items and notifies cloud; altered prefixes and unknown signatures rejected"] }, null, 2));
