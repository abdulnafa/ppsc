"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const QUEUE_KEY = "ppsc-prep:retry-queue:v1";
const SESSION_KEY = "ppsc-prep:active-session:v1";
const SOURCE = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const DATA = {
  categories: [
    { id: "general-knowledge", name: "General Knowledge" },
    { id: "pakistan-studies", name: "Pakistan Studies" },
    { id: "basic-computer-studies", name: "Basic Computer Studies" }
  ],
  questions: Array.from({ length: 8 }, (_value, index) => ({
    id: index === 6 ? "IBES-Q0001-SRC" : index === 7 ? "WGI-Q0001-SRC" : "WRONG-Q" + (index + 1),
    categoryId: index < 4 ? "general-knowledge" : index < 6 ? "pakistan-studies" : "basic-computer-studies",
    kind: "source", question: "Wrong Quiz test question " + (index + 1), questionUrdu: "",
    options: ["Wrong", "Correct", "Another wrong", "Last wrong"], correctOptionIndex: 1,
    isImportant: index === 0 || index === 2, repeatCount: index === 0 || index === 2 ? 2 : 1
  }))
};

function plain(value) { return JSON.parse(JSON.stringify(value)); }
function ids(questions) { return Array.from(questions, (question) => question.id); }
function element() {
  return {
    hidden: false, open: false, dataset: {}, parentElement: null,
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(name) { if (name === "open") this.open = true; },
    removeAttribute(name) { if (name === "open") this.open = false; },
    appendChild(child) { child.parentElement = this; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    showModal() { this.open = true; }, close() { this.open = false; }, focus() {}
  };
}

function harness(saved = {}) {
  const storage = new Map(Object.entries(saved));
  const nodes = { quizScreen: element(), resultsScreen: element(), queueScreen: element(), retryDialog: element(),
    retryDialogCard: element(), queuePracticeSlot: element(), actionButton: element() };
  nodes.retryDialogCard.parentElement = nodes.retryDialog;
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  const window = {
    PPSC_QUIZ_DATA: DATA, CustomEvent, __TEST_NODES__: nodes,
    location: { protocol: "https:", hostname: "wrong-quiz.invalid" },
    addEventListener() {}, dispatchEvent() {},
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    }
  };
  const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
  assert.equal(SOURCE.split(marker).length - 1, 1);
  const seam = `
  Object.assign(elements, window.__TEST_NODES__);
  state.category = categories[0]; state.mode = "quiz";
  window.__TEST__ = {
    empty: createEmptyRetryQueueState, normalizeQueue: normalizeRetryQueue,
    queue: function () { return retryQueueState; }, state: function () { return state; },
    seed: function (value) {
      window.localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(value)); loadRetryQueue();
    },
    wrong: wrongQuestionsForCategory, normalizeSession: normalizeStoredSession,
    restore: restoreActiveSession, save: saveActiveSession,
    start: function (categoryId, scope) { return startQuiz(categoryId, "quiz", scope || "all", null, "all"); },
    startWrong: function (categoryId, computerScope) {
      state.category = findCategory(categoryId || "general-knowledge");
      state.sessionKind = "category";
      state.computerSourceScope = computerScope || "all";
      return startWrongQuiz();
    },
    answer: function (correct) {
      var question = currentQuestion();
      selectOption(correct ? question.correctOptionIndex : (question.correctOptionIndex + 1) % 4);
      submitAnswer();
    },
    next: handleAction, releaseReview: releaseActiveRetryAttempt,
    record: function (index, wrong, mode, sessionKind, scope) {
      state.category = findCategory(allQuestions[index].categoryId);
      state.mode = mode || "quiz"; state.sessionKind = sessionKind || "category";
      state.scope = scope || "all"; state.computerSourceScope = "all";
      return recordMainPractice(allQuestions[index], wrong);
    }
  };
  loadRetryQueue();
`;
  const document = { readyState: "loading", body: element(), addEventListener() {},
    querySelector() { return null; }, contains() { return true; } };
  vm.runInNewContext(SOURCE.replace(marker, seam + marker), { window, document, CustomEvent, console });
  const api = window.__TEST__;
  return { api, nodes, queue() { return plain(api.queue()); }, snapshot() { return JSON.parse(storage.get(SESSION_KEY)); },
    saved() { return Object.fromEntries(storage); } };
}

function fixture(app, wrongQuestionIds = []) {
  return { ...plain(app.api.empty()), embeddedPopupsEnabled: false, wrongQuestionIds };
}
function remaining(app, id) { return app.queue().items.find((item) => item.questionId === id)?.remaining || 0; }

function run() {
  const app = harness();
  assert.deepEqual(plain(app.api.empty().wrongQuestionIds), []);
  const legacy = fixture(app);
  delete legacy.wrongQuestionIds;
  legacy.items = [{ questionId: "WRONG-Q3", remaining: 7, dueStep: 0, sequence: 1 }];
  legacy.nextSequence = 2;
  const normalizedLegacy = app.api.normalizeQueue(legacy);
  assert.ok(normalizedLegacy);
  assert.deepEqual(plain(normalizedLegacy.wrongQuestionIds), [], "legacy finite Queue entries must not be inferred as wrong answers");
  assert.equal(normalizedLegacy.items[0].remaining, 7);
  for (const malformed of [null, false, "WRONG-Q1", {}]) {
    const normalized = app.api.normalizeQueue({ ...legacy, wrongQuestionIds: malformed });
    assert.ok(normalized, "malformed optional Wrong list must not delete otherwise valid queue state");
    assert.deepEqual(plain(normalized.wrongQuestionIds), []);
    assert.equal(normalized.items[0].remaining, 7);
  }
  const clean = app.api.normalizeQueue({ ...legacy,
    wrongQuestionIds: ["WRONG-Q2", "WRONG-Q2", "missing-id", null, {}, "WRONG-Q1"] });
  assert.ok(clean);
  assert.deepEqual(Array.from(clean.wrongQuestionIds).sort(), ["WRONG-Q1", "WRONG-Q2"]);

  app.api.seed(fixture(app));
  app.api.record(1, true);
  app.api.record(1, true);
  app.api.record(0, true);
  app.api.record(1, false);
  app.api.record(2, false);
  assert.deepEqual(app.queue().wrongQuestionIds.slice().sort(), ["WRONG-Q1", "WRONG-Q2"]);
  assert.equal(remaining(app, "WRONG-Q2"), 4, "repeat ordinary wrong answers retain existing +2 queue behavior");
  assert.equal(remaining(app, "WRONG-Q3"), 1, "ordinary correct answer still receives its finite confirmation review");
  const beforeExcluded = app.queue().wrongQuestionIds;
  app.api.record(3, true, "learn");
  app.api.record(4, true, "quiz", "paper");
  assert.deepEqual(app.queue().wrongQuestionIds, beforeExcluded, "Learn and Paper must not enter Wrong Quiz");
  for (const kind of ["queue", "important"]) {
    for (const outcome of ["correct", "wrong"]) {
      const saved = app.queue();
      saved.activeAttempt = {
        questionId: "WRONG-Q1", optionOrder: [0, 1, 2, 3], selectedIndex: outcome === "correct" ? 1 : 0,
        submitted: true, outcome, wrongIncrement: kind === "queue" && outcome === "wrong" ? 2 : null,
        resumeAction: "next:1", context: "embedded", kind
      };
      app.api.seed(saved);
      app.api.releaseReview();
      assert.deepEqual(app.queue().wrongQuestionIds, beforeExcluded, "review outcome must not add or remove Wrong Quiz membership");
    }
  }

  const ordered = fixture(app, ["WGI-Q0001-SRC", "WRONG-Q5", "WRONG-Q2", "IBES-Q0001-SRC", "WRONG-Q1"]);
  app.api.seed(ordered);
  assert.deepEqual(ids(app.api.wrong("general-knowledge", "all")), ["WRONG-Q1", "WRONG-Q2"]);
  assert.deepEqual(ids(app.api.wrong("pakistan-studies", "all")), ["WRONG-Q5"]);
  assert.deepEqual(ids(app.api.wrong("basic-computer-studies", "initial-original")), ["IBES-Q0001-SRC"]);
  assert.deepEqual(ids(app.api.wrong("basic-computer-studies", "other")), ["WGI-Q0001-SRC"]);
  const repeat = harness();
  repeat.api.seed(fixture(repeat, ["WRONG-Q1", "WRONG-Q2", "WRONG-Q3", "WRONG-Q4"]));
  assert(repeat.api.startWrong("general-knowledge"));
  const firstRound = ids(repeat.api.state().questions);
  assert.deepEqual(firstRound.slice().sort(), ["WRONG-Q1", "WRONG-Q2", "WRONG-Q3", "WRONG-Q4"]);
  assert(repeat.api.startWrong("general-knowledge"));
  const secondRound = ids(repeat.api.state().questions);
  assert.deepEqual(secondRound.slice().sort(), firstRound.slice().sort());
  assert.notDeepEqual(secondRound, firstRound, "A new Wrong Quiz round must reshuffle its MCQs");
  app.api.state().importantOnly = true;
  assert.equal(app.api.startWrong("general-knowledge"), true);
  assert.equal(app.api.state().scope, "wrong");
  assert.equal(app.api.state().mode, "quiz");
  assert.equal(app.api.state().importantOnly, false);
  assert.deepEqual(ids(app.api.state().questions).sort(), ["WRONG-Q1", "WRONG-Q2"],
    "Wrong round must shuffle only its own members and ignore Important-only filter");
  const firstWrongId = app.api.state().questions[0].id;
  const secondWrongId = app.api.state().questions[1].id;
  app.api.answer(true);
  const checked = app.snapshot();
  assert.equal(checked.submitted, true);
  assert.equal(checked.score, 1);
  assert.equal(app.queue().wrongQuestionIds.includes(firstWrongId), false);
  assert.equal(remaining(app, firstWrongId), 1, "removing Wrong membership must not erase its ordinary confirmation review");
  assert.deepEqual(checked.questionIds, [firstWrongId, secondWrongId]);
  assert.deepEqual(checked.rangePoolQuestionIds, ["WRONG-Q1", "WRONG-Q2"],
    "canonical range metadata must remain stable while the active round is shuffled");
  assert.deepEqual(checked.rangeQuestionIds, checked.rangePoolQuestionIds);
  const countedOnce = app.queue();

  let reloaded = app;
  for (let reload = 0; reload < 2; reload += 1) {
    reloaded = harness(reloaded.saved());
    assert.equal(reloaded.api.restore(), true, "frozen Wrong Quiz must restore after correct answers have left its live list");
    assert.equal(reloaded.api.state().scope, "wrong");
    assert.equal(reloaded.api.state().submitted, true);
    assert.equal(reloaded.api.state().score, 1);
    assert.deepEqual(reloaded.snapshot().optionOrders, checked.optionOrders);
    assert.deepEqual(reloaded.snapshot().answerHistory, checked.answerHistory);
    assert.deepEqual(reloaded.queue(), countedOnce);
  }
  reloaded.api.next();
  assert.equal(reloaded.api.state().currentIndex, 1);
  reloaded.api.answer(false);
  assert.equal(reloaded.queue().wrongQuestionIds.includes(secondWrongId), true);
  assert.equal(remaining(reloaded, secondWrongId), 2, "Wrong Quiz mistakes retain the existing finite +2 behavior");
  reloaded.api.next();
  assert.equal(reloaded.api.startWrong("general-knowledge"), true);
  assert.deepEqual(ids(reloaded.api.state().questions), [secondWrongId], "next round must include only remaining wrong answers");
  reloaded.api.answer(true);
  reloaded.api.next();
  assert.deepEqual(ids(reloaded.api.wrong("general-knowledge", "all")), []);
  assert.equal(reloaded.api.startWrong("general-knowledge"), false, "an empty Wrong list cannot start a fake round");
  assert.deepEqual(ids(reloaded.api.wrong("pakistan-studies", "all")), ["WRONG-Q5"], "other category Wrong lists remain untouched");

  for (const change of [
    { bankSignature: "unknown-bank" }, { mode: "learn" }, { importantOnly: true }, { sessionKind: "paper" },
    { categoryId: "pakistan-studies" }, { rangePoolQuestionIds: ["WRONG-Q2", "WRONG-Q1"] },
    { questionIds: [firstWrongId, firstWrongId] }, { questionIds: [firstWrongId, "WRONG-Q3"] },
    { optionOrders: [[0, 0, 2, 3], [0, 1, 2, 3]] }
  ]) assert.equal(app.api.normalizeSession({ ...checked, ...change }), null,
    "Wrong scope must retain strict bank, category, mode, ordering and option permutation validation");

  const oldSession = harness();
  oldSession.api.seed(fixture(oldSession));
  assert.equal(oldSession.api.start("general-knowledge"), true);
  const firstOldSessionId = oldSession.api.state().questions[0].id;
  oldSession.api.answer(false);
  oldSession.api.next();
  for (let index = 1; index < 4; index += 1) {
    oldSession.api.answer(true);
    if (index < 3) oldSession.api.next();
  }
  // Simulate an in-progress pre-feature Quiz whose checked responses exist,
  // but whose saved retry state has no Wrong Quiz field yet.
  const oldQueue = oldSession.queue();
  delete oldQueue.wrongQuestionIds;
  oldSession.api.seed(oldQueue);
  assert.deepEqual(oldSession.queue().wrongQuestionIds, []);
  oldSession.api.next();
  assert.deepEqual(oldSession.queue().wrongQuestionIds, [firstOldSessionId],
    "finishing an existing ordinary Quiz must harvest its actual checked wrong response");

  console.log(JSON.stringify({ ok: true, checks: [
    "optional Wrong membership normalizes without inferring finite Queue entries",
    "only category main Quiz answers add distinct wrong IDs; only Wrong Quiz correct answers remove them",
    "category and Computer source filtering preserve exact membership and ignore Important-only filter; each new Wrong round reshuffles",
    "checked frozen Wrong sessions survive two reloads after live-list removals",
    "remaining Wrong answers repeat next round; empty and other-category lists remain safe",
    "strict session validation remains in force; old in-progress wrong answers are harvested at results"
  ] }, null, 2));
}

run();
