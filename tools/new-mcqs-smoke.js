"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const MANIFEST = fs.readFileSync(path.join(ROOT, "data/new-question-ids.js"), "utf8");
const MANIFEST_CONTEXT = { window: {} };
vm.runInNewContext(MANIFEST, MANIFEST_CONTEXT);
const manifestIds = Array.from(MANIFEST_CONTEXT.window.PPSC_NEW_QUESTION_IDS);
assert.equal(new Set(manifestIds).size, manifestIds.length, "New MCQ manifest IDs must be unique");
const bankContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data/questions.js"), "utf8"), bankContext);
const bankIds = new Set(bankContext.window.PPSC_QUIZ_DATA.questions.map(question => String(question.id)));
assert(manifestIds.every(id => bankIds.has(id)), "Every New MCQ manifest ID must exist in the bank");
const frozenBaseline = 11952;
assert.deepEqual(
  Array.from(bankContext.window.PPSC_QUIZ_DATA.questions.slice(frozenBaseline),
    question => String(question.id)).sort(),
  manifestIds.slice().sort(),
  "Every post-baseline addition must appear in the New MCQs manifest"
);

const SEEN_KEY = "ppsc-prep:seen-new-question-ids:v1";
const QUEUE_KEY = "ppsc-prep:retry-queue:v1";
const SESSION_KEY = "ppsc-prep:active-session:v1";
const ARCHIVE_KEY = "ppsc-prep:category-sessions:v1";
const DATA = {
  categories: [
    { id: "general-knowledge", name: "General Knowledge" },
    { id: "pakistan-studies", name: "Pakistan Studies" }
  ],
  questions: [
    { id: "OLD-GK", categoryId: "general-knowledge", kind: "source", question: "Old GK?",
      options: ["A", "B", "C", "D"], correctOptionIndex: 0 },
    { id: "NEW-GK", categoryId: "general-knowledge", kind: "source", question: "New GK?",
      options: ["A", "B", "C", "D"], correctOptionIndex: 0 },
    { id: "NEW-PK", categoryId: "pakistan-studies", kind: "source", question: "New Pakistan?",
      options: ["A", "B", "C", "D"], correctOptionIndex: 0 }
  ]
};

function element() {
  return { hidden: false, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, removeAttribute() {}, focus() {}, querySelector() { return null; },
    querySelectorAll() { return []; } };
}

function harness(initial = {}) {
  const storage = new Map(Object.entries(initial));
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  const window = {
    PPSC_QUIZ_DATA: DATA, PPSC_NEW_QUESTION_IDS: ["NEW-GK", "NEW-PK"], CustomEvent,
    location: { protocol: "https:", hostname: "new-mcqs-smoke.invalid" },
    addEventListener() {}, dispatchEvent() {},
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    }
  };
  const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
  assert.equal(SOURCE.split(marker).length, 2);
  const seam = `
    elements.modeScreen = { hidden: true, dataset: {}, classList: { toggle() {} }, setAttribute() {}, querySelector() { return null; } };
    elements.quizScreen = { hidden: true, dataset: {}, classList: { toggle() {} }, setAttribute() {}, querySelector() { return null; } };
    elements.actionButton = { hidden: false, dataset: {}, classList: { toggle() {} }, setAttribute() {}, focus() {} };
    window.__TEST__ = {
      loadSeen: loadSeenNewQuestionIds, loadQueue: loadRetryQueue,
      choose: chooseMode, start: startQuiz, startWrong: startWrongQuiz,
      count: questionCount, wrong: wrongQuestionsForCategory,
      question: currentQuestion, state: function () { return state; },
      answer: function (correct) {
        var question = currentQuestion();
        selectOption(correct ? question.correctOptionIndex : (question.correctOptionIndex + 1) % 4);
        submitAnswer();
      },
      reveal: function () { return revealLearnAnswer(currentQuestion()); },
      normalize: normalizeStoredSession,
      retry: function () { return retryQueueState; },
      go: function (index) { state.currentIndex = index; renderQuestion(); },
      select: selectOption,
      loadArchive: loadCategorySessions,
      loadActive: loadActiveSession,
      restore: restoreCategorySession,
      archives: function () { return categorySessions; }
    };
  `;
  const document = { readyState: "loading", addEventListener() {}, querySelector() { return null; } };
  vm.runInNewContext(SOURCE.replace(marker, seam + marker), { window, document, CustomEvent, console });
  return { api: window.__TEST__, storage };
}

const app = harness();
app.api.loadSeen();
app.api.loadQueue();
assert.equal(app.api.count("new-mcqs"), 2);
app.api.choose("new-mcqs");
assert(app.api.start("new-mcqs", "quiz", "all"));
assert.equal(app.api.state().questions.length, 2);
assert.equal(app.api.question().id, "NEW-GK");
app.api.answer(false);
assert.deepEqual(JSON.parse(app.storage.get(SEEN_KEY)).questionIds, ["NEW-GK"]);
assert.equal(app.api.count("new-mcqs"), 1, "Checked wrong answer leaves unread New list");
assert.equal(app.api.wrong("new-mcqs", "all").length, 1);
assert.equal(app.api.wrong("general-knowledge", "all").length, 1,
  "Wrong MCQ stays indexed under its real category");
assert.equal(app.api.retry().items.some(item => item.questionId === "NEW-GK"), true,
  "Wrong answer enters the existing Queue under its real question ID");
const frozen = JSON.parse(app.storage.get(SESSION_KEY));
assert.equal(frozen.categoryId, "new-mcqs");
assert(app.api.normalize(frozen), "New aggregate session restores after a question becomes seen");

app.api.choose("pakistan-studies");
assert(app.api.start("pakistan-studies", "learn", "all"));
assert.equal(app.api.question().id, "NEW-PK");
assert.equal(app.api.count("new-mcqs"), 1, "Merely displaying a question does not mark it read");
assert(app.api.reveal());
assert.equal(app.api.count("new-mcqs"), 0,
  "Reveal in the original category removes that question from New MCQs");
assert.equal(app.api.count("pakistan-studies"), 1, "Original category keeps the question");

const reloaded = harness(Object.fromEntries(app.storage));
reloaded.api.loadSeen();
reloaded.api.loadQueue();
assert.equal(reloaded.api.count("new-mcqs"), 0, "Seen state survives reload");
reloaded.api.choose("new-mcqs");
assert(reloaded.api.startWrong(), "New MCQs Wrong Quiz includes the checked wrong addition");
assert.equal(reloaded.api.question().id, "NEW-GK");
reloaded.api.answer(true);
assert.equal(reloaded.api.wrong("new-mcqs", "all").length, 0,
  "Correct Wrong Quiz answer clears the New and original category wrong lists");
assert.equal(reloaded.api.wrong("general-knowledge", "all").length, 0);

// A saved New Quiz must follow first-read state even when the first read
// happens in the question's original category on another visit/device.
const crossCategory = harness();
crossCategory.api.loadSeen();
crossCategory.api.loadQueue();
crossCategory.api.choose("new-mcqs");
assert(crossCategory.api.start("new-mcqs", "quiz", "all"));
crossCategory.api.go(1);
assert.equal(crossCategory.api.question().id, "NEW-PK");
crossCategory.api.select(2);
const newQuizKey = Object.keys(JSON.parse(crossCategory.storage.get(ARCHIVE_KEY)).sessions)
  .find(key => key.startsWith("new-mcqs:quiz:all:"));
assert(newQuizKey);
crossCategory.api.choose("general-knowledge");
assert(crossCategory.api.start("general-knowledge", "quiz", "all", { start: 2, end: 2 }));
assert.equal(crossCategory.api.question().id, "NEW-GK");
crossCategory.api.answer(false);
assert.equal(crossCategory.api.retry().items.some(item => item.questionId === "NEW-GK"), true);

const partialReload = harness(Object.fromEntries(crossCategory.storage));
partialReload.api.loadSeen();
partialReload.api.loadQueue();
partialReload.api.loadArchive();
const partial = partialReload.api.archives()[newQuizKey];
assert(partial, "Unanswered New Quiz session remains available");
assert.deepEqual(Array.from(partial.questionIds), ["NEW-PK"],
  "Archived New Quiz retains exactly its unread membership");
assert.deepEqual(Array.from(partial.rangeQuestionIds), ["NEW-PK"]);
assert.deepEqual(Array.from(partial.rangePoolQuestionIds), ["NEW-PK"]);
assert.equal(partial.currentIndex, 0);
assert.equal(partial.selectedIndex, 2, "Unanswered option survives pruning and reload");
assert.equal(partial.submitted, false);
assert.equal(partial.optionOrders.length, 1);
assert.equal(partial.answerHistory.length, 1);
assert.equal(partialReload.api.loadActive().snapshot.categoryId, "general-knowledge",
  "Reconciliation does not replace the active original-category session");
assert.equal(partialReload.api.retry().items.some(item => item.questionId === "NEW-GK"), true,
  "Existing queue entry remains untouched");
partialReload.api.choose("new-mcqs");
assert(partialReload.api.restore(newQuizKey));
assert.deepEqual(Array.from(partialReload.api.state().questions, question => question.id), ["NEW-PK"]);
assert.equal(partialReload.api.state().selectedIndex, 2);
assert.equal(partialReload.api.state().submitted, false);
partialReload.api.answer(true);
assert.equal(partialReload.api.count("new-mcqs"), 0);

const completedReload = harness(Object.fromEntries(partialReload.storage));
completedReload.api.loadSeen();
completedReload.api.loadQueue();
completedReload.api.loadArchive();
assert.equal(completedReload.api.archives()[newQuizKey], undefined,
  "Only a fully seen New regular session is removed from archive");
assert(Object.values(completedReload.api.archives()).some(snapshot => snapshot.categoryId === "general-knowledge"),
  "Original-category archives remain available");
assert.equal(completedReload.api.loadActive(), null,
  "Fully seen New regular active slot is removed on reload");
assert.equal(completedReload.storage.has(SESSION_KEY), false);
assert.equal(completedReload.api.retry().items.some(item => item.questionId === "NEW-GK"), true);
completedReload.api.choose("new-mcqs");
assert(completedReload.api.startWrong(), "New Wrong Quiz remains available after regular New session cleanup");

// Cloud/offline sync can update the seen-ID set while the active slot is New.
// Continue must reconcile that slot too, not only the per-category archive.
const activeNew = harness();
activeNew.api.loadSeen();
activeNew.api.loadQueue();
activeNew.api.choose("new-mcqs");
assert(activeNew.api.start("new-mcqs", "quiz", "all"));
activeNew.api.go(1);
activeNew.api.select(2);
activeNew.storage.set(SEEN_KEY, JSON.stringify({ version: 1, questionIds: ["NEW-GK"] }));
const activeNewReload = harness(Object.fromEntries(activeNew.storage));
activeNewReload.api.loadSeen();
activeNewReload.api.loadQueue();
const continuedNew = activeNewReload.api.loadActive();
assert(continuedNew);
assert.deepEqual(Array.from(continuedNew.snapshot.questionIds), ["NEW-PK"]);
assert.equal(continuedNew.snapshot.selectedIndex, 2);
assert.deepEqual(JSON.parse(activeNewReload.storage.get(SESSION_KEY)).questionIds, ["NEW-PK"],
  "Reconciled active New slot is persisted for subsequent reloads");

const learnCrossCategory = harness();
learnCrossCategory.api.loadSeen();
learnCrossCategory.api.loadQueue();
learnCrossCategory.api.choose("new-mcqs");
assert(learnCrossCategory.api.start("new-mcqs", "learn", "all"));
const newLearnKey = Object.keys(JSON.parse(learnCrossCategory.storage.get(ARCHIVE_KEY)).sessions)
  .find(key => key.startsWith("new-mcqs:learn:all:"));
learnCrossCategory.api.choose("general-knowledge");
assert(learnCrossCategory.api.start("general-knowledge", "learn", "all", { start: 2, end: 2 }));
assert(learnCrossCategory.api.reveal());
const learnReload = harness(Object.fromEntries(learnCrossCategory.storage));
learnReload.api.loadSeen();
learnReload.api.loadQueue();
learnReload.api.loadArchive();
assert.deepEqual(Array.from(learnReload.api.archives()[newLearnKey].questionIds), ["NEW-PK"],
  "Saved New Learn session also drops questions revealed in their original category");
learnReload.api.choose("new-mcqs");
assert(learnReload.api.restore(newLearnKey));
assert.equal(learnReload.api.question().id, "NEW-PK");

console.log(JSON.stringify({ ok: true, newQuestionCount: manifestIds.length,
  scenarios: ["all additions accounted for", "first check/reveal only", "cross-category New session restore",
    "original category and queue preserved", "New Wrong Quiz clears shared wrong list", "seen state survives reload",
    "saved New Quiz/Learn pruned by cross-category first read", "unanswered choice preserved",
    "fully seen New session removed without touching other sessions or queue",
    "active New Continue reconciles externally seen IDs"] }));
