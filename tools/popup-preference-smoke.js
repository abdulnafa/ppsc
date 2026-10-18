"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const QUEUE_KEY = "ppsc-prep:retry-queue:v1";
const SOURCE = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const DATA = {
  categories: [{ id: "general-knowledge", name: "General Knowledge" }, { id: "pakistan-studies", name: "Pakistan Studies" }],
  questions: Array.from({ length: 6 }, (_value, index) => ({
    id: "PREF-Q" + (index + 1), categoryId: index < 4 ? "general-knowledge" : "pakistan-studies",
    question: "Preference test question " + (index + 1), questionUrdu: "",
    options: ["Wrong", "Correct", "Another wrong", "Last wrong"], correctOptionIndex: 1,
    isImportant: index === 0 || index === 1 || index === 4, repeatCount: index < 2 || index === 4 ? 2 : 1
  }))
};

function plain(value) { return JSON.parse(JSON.stringify(value)); }

function element() {
  return {
    hidden: false, open: false, dataset: {}, parentElement: null,
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(name) { if (name === "open") this.open = true; },
    removeAttribute(name) { if (name === "open") this.open = false; },
    appendChild(child) { child.parentElement = this; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    showModal() { this.open = true; }, close() { this.open = false; }, focus() {}
  };
}

function harness(raw) {
  const storage = new Map(raw ? [[QUEUE_KEY, raw]] : []);
  const events = [];
  const nodes = { quizScreen: element(), queueScreen: element(), retryDialog: element(), retryDialogCard: element(), queuePracticeSlot: element() };
  nodes.queueScreen.hidden = true;
  nodes.retryDialogCard.parentElement = nodes.retryDialog;
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  const window = {
    PPSC_QUIZ_DATA: DATA, CustomEvent, __TEST_NODES__: nodes,
    location: { protocol: "https:", hostname: "popup-preference.invalid" },
    addEventListener() {}, dispatchEvent(event) { events.push(plain(event)); },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    }
  };
  const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
  assert.equal(SOURCE.split(marker).length - 1, 1);
  const expose = `
  Object.assign(elements, window.__TEST_NODES__);
  state.category = categories[0]; state.mode = "quiz";
  state.questions = allQuestions.slice(0, 4);
  window.__TEST__ = {
    empty: createEmptyRetryQueueState, normalize: normalizeRetryQueue,
    get: function () { return retryQueueState; }, load: loadRetryQueue,
    seed: function (value) {
      window.localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(value));
      loadRetryQueue();
    },
    preference: embeddedPopupsEnabled, setPreference: setEmbeddedPopupsEnabled,
    mode: function (value) { state.mode = value; elements.quizScreen.hidden = false; },
    record: function (index, wrong) { return recordMainPractice(allQuestions[index], wrong); },
    due: function () { return beginDueEmbeddedReview("next:1", null); },
    queueLane: function () { return beginDueRetryAttempt("next:1", null, true); },
    importantLane: function () { return beginDueImportantAttempt("next:1", null, true); },
    restore: restoreActiveRetryAttempt, complete: completeRetryAttempt,
    open: openRetryDialog,
    manual: function () {
      retryQueuePractice.active = true; retryQueuePractice.categoryId = categories[0].id;
      return beginDedicatedRetryAttempt();
    }
  };
`;
  const document = { readyState: "loading", body: element(), addEventListener() {}, querySelector() { return null; }, contains() { return true; } };
  vm.runInNewContext(SOURCE.replace(marker, expose + marker), { window, document, CustomEvent, console });
  const api = window.__TEST__;
  if (raw) api.load();
  return { api, nodes, events, raw() { return storage.get(QUEUE_KEY); }, queue() { return plain(api.get()); } };
}

function fixture(app, enabled = true) {
  const value = plain(app.api.empty());
  Object.assign(value, {
    embeddedPopupsEnabled: enabled, practiceStep: 4, nextEmbeddedReviewStep: 10, nextEmbeddedReviewKind: "queue",
    nextQuizReviewStep: 10, nextImportantReviewStep: 20, nextSequence: 4,
    items: [
      { questionId: "PREF-Q1", remaining: 4, dueStep: 4, sequence: 1 },
      { questionId: "PREF-Q2", remaining: 8, dueStep: 4, sequence: 2 },
      { questionId: "PREF-Q5", remaining: 9, dueStep: 4, sequence: 3 }
    ],
    queueCyclePendingByCategory: { "general-knowledge": ["PREF-Q1", "PREF-Q2"], "pakistan-studies": ["PREF-Q5"] },
    importantDeck: ["PREF-Q2", "PREF-Q5"], importantLastQuestionId: "PREF-Q1",
    importantLastQuestionIdsByCategory: { "general-knowledge": "PREF-Q1" },
    activeAttempt: null
  });
  return value;
}

function attempt(kind = "queue", outcome = null, context = "embedded") {
  return {
    questionId: "PREF-Q1", optionOrder: [0, 1, 2, 3], selectedIndex: outcome === "correct" ? 1 : outcome === "wrong" ? 0 : null,
    submitted: outcome !== null, outcome,
    wrongIncrement: kind === "queue" && outcome === "wrong" ? 2 : null,
    resumeAction: context === "dedicated" ? "queue" : "next:1", context, kind
  };
}

function remaining(app, id = "PREF-Q1") { return app.queue().items.find((item) => item.questionId === id)?.remaining || 0; }
function gap(app) { const queue = app.queue(); return queue.nextEmbeddedReviewStep - queue.practiceStep; }

function run() {
  const app = harness();
  assert.equal(app.api.empty().embeddedPopupsEnabled, true);
  for (const invalidOrMissing of [undefined, null, "false", 0, {}, []]) {
    const saved = fixture(app);
    if (invalidOrMissing === undefined) delete saved.embeddedPopupsEnabled;
    else saved.embeddedPopupsEnabled = invalidOrMissing;
    const normalized = app.api.normalize(saved);
    assert.ok(normalized, "an absent/malformed preference must not delete a valid queue");
    assert.equal(normalized.embeddedPopupsEnabled, true);
    assert.deepEqual(plain(normalized.items), saved.items);
    assert.deepEqual(plain(normalized.queueCyclePendingByCategory), saved.queueCyclePendingByCategory);
  }

  const saved = fixture(app);
  saved.queueCyclePendingByCategory["general-knowledge"] = ["PREF-Q2"];
  app.api.seed(saved);
  app.api.setPreference(false);
  assert.equal(app.api.preference(), false);
  assert.equal(app.queue().embeddedPopupsEnabled, false);
  assert.deepEqual(app.queue().items, saved.items);
  assert.deepEqual(app.queue().queueCyclePendingByCategory, saved.queueCyclePendingByCategory);
  const countdown = gap(app);
  app.api.mode("learn");
  for (let index = 0; index < 12; index += 1) {
    app.api.record(0, false);
    assert.equal(gap(app), countdown, "Learn while OFF must pause the automatic countdown");
    assert.equal(app.api.due(), false);
  }
  assert.deepEqual(app.queue().items, saved.items, "Learn while OFF must preserve queue counts");
  app.api.mode("quiz");
  app.api.record(0, true);
  app.api.record(2, false);
  app.api.record(3, true);
  assert.equal(remaining(app), 6, "wrong main answer must still add two while OFF");
  assert.equal(remaining(app, "PREF-Q3"), 1, "correct main answer must still add its confirmation review while OFF");
  assert.equal(remaining(app, "PREF-Q4"), 2);
  assert.equal(remaining(app, "PREF-Q5"), 9, "foreign-category saved reviews must remain untouched");
  assert.deepEqual(app.queue().items.map((item) => item.questionId), ["PREF-Q1", "PREF-Q2", "PREF-Q5", "PREF-Q3", "PREF-Q4"]);
  assert.deepEqual(app.queue().queueCyclePendingByCategory["general-knowledge"], ["PREF-Q2", "PREF-Q3", "PREF-Q4"]);
  assert.equal(gap(app), countdown);
  assert.equal(app.api.queueLane(), false);
  assert.equal(app.api.importantLane(), false);
  assert.equal(app.nodes.retryDialog.open, false);
  const restored = harness(app.raw());
  assert.equal(restored.api.preference(), false);
  assert.deepEqual(restored.queue(), app.queue(), "OFF preference and paused clock must survive reload exactly");
  restored.api.setPreference(true);
  assert.equal(gap(restored), countdown, "ON must resume remaining work rather than restart the clock");
  for (let index = 1; index <= countdown; index += 1) {
    restored.api.record(0, false);
    assert.equal(restored.api.due(), index === countdown, "popup must resume at its original remaining checkpoint");
  }
  assert.equal(restored.queue().activeAttempt.questionId, "PREF-Q2", "OFF/ON must not change the pending FIFO head");
  assert.equal(restored.queue().nextEmbeddedReviewKind, "important");
  assert.ok(app.events.some((event) => event.detail?.key === QUEUE_KEY && event.detail.action === "set"));

  let embeddedCases = 0;
  for (const kind of ["queue", "important"]) {
    for (const outcome of [null, "correct", "wrong"]) {
      for (const via of ["toggle", "restore"]) {
        const trial = harness();
        const seed = fixture(trial, via === "toggle");
        seed.activeAttempt = attempt(kind, outcome);
        trial.api.seed(seed);
        if (via === "toggle") trial.api.setPreference(false);
        else assert.equal(trial.api.restore(), false);
        const expected = kind === "queue" && outcome === "correct" ? 3 : kind === "queue" && outcome === "wrong" ? 6 : 4;
        assert.equal(remaining(trial), expected, "checked embedded outcome must apply once when disabled");
        assert.equal(trial.queue().activeAttempt, null);
        assert.equal(trial.nodes.retryDialog.open, false);
        assert.equal(trial.api.due(), false);
        assert.equal(trial.api.restore(), false);
        trial.api.setPreference(false);
        assert.equal(remaining(trial), expected, "repeated OFF/restore must not apply an answer twice");
        if (kind === "queue" && outcome === null) {
          assert.deepEqual(trial.queue().queueCyclePendingByCategory, seed.queueCyclePendingByCategory);
          assert.deepEqual(trial.queue().items, seed.items);
        }
        if (kind === "important") assert.deepEqual(trial.queue().items, seed.items);
        const again = harness(trial.raw());
        assert.equal(again.api.preference(), false);
        assert.equal(remaining(again), expected);
        assert.equal(again.queue().activeAttempt, null);
        embeddedCases += 1;
      }
    }
  }

  for (const outcome of [null, "correct", "wrong"]) {
    const manual = harness();
    const seed = fixture(manual);
    seed.activeAttempt = attempt("queue", outcome, "dedicated");
    seed.dedicatedLastQuestionId = "PREF-Q1";
    manual.api.seed(seed);
    manual.api.setPreference(false);
    assert.deepEqual(manual.queue().activeAttempt, seed.activeAttempt, "OFF must not release manual practice");
    assert.equal(manual.api.manual(), true, "manual category Queue must stay available while OFF");
    assert.equal(manual.nodes.retryDialog.open, false, "manual Queue stays full-screen rather than opening a popup");
    assert.equal(manual.nodes.queueScreen.hidden, false);
    const manualClock = manual.queue().nextEmbeddedReviewStep;
    if (outcome !== null) {
      manual.api.complete();
      assert.equal(remaining(manual), outcome === "correct" ? 3 : 6);
      assert.equal(manual.queue().activeAttempt.questionId, "PREF-Q2", "manual practice must continue the same FIFO round");
      assert.equal(manual.queue().nextEmbeddedReviewStep, manualClock);
    }
  }

  console.log(JSON.stringify({ ok: true, embeddedToggleAndRestoreCases: embeddedCases,
    checks: ["legacy and malformed preferences default ON without losing progress", "OFF pauses the remaining cadence but still records main Quiz answers",
      "OFF/ON and reload preserve the pending FIFO round", "both automatic lanes are suppressed",
      "submitted embedded outcomes apply exactly once; unanswered work stays pending", "manual full-screen category Queue remains available",
      "preference saves notify cloud synchronization"] }, null, 2));
}

run();
