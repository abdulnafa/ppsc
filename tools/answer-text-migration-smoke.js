"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const SESSION_KEY = "ppsc-prep:active-session:v1";
const QUEUE_KEY = "ppsc-prep:retry-queue:v1";
const OLD_FULL = "v1:11892:9437487f";
const OLD_PREFIX = "v1:11412:57e37c68";
const NEW_FULL = "v1:11892:57530f77";
const NEW_PREFIX = "v1:11412:40563d50";
const HISTORICAL_IMPORTANT_FINGERPRINTS = {
  "general-knowledge:all": "v1:118:8839676c",
  "pakistan-studies:all": "v1:145:381aabf",
  "current-affairs:all": "v1:33:690ec77",
  "islamic-studies:all": "v1:56:c2127588",
  "geography:all": "v1:74:48ae5ee6",
  "basic-mathematics:all": "v1:27:9980098",
  "english:all": "v1:44:4c00b23b",
  "urdu:all": "v1:49:306ddee1",
  "everyday-science:all": "v1:64:3e696f62",
  "basic-computer-studies:all": "v1:458:584049ec",
  "basic-computer-studies:initial-original": "v1:397:4decb387",
  "basic-computer-studies:initial-related": "v1:19:5d3bd5d1",
  "basic-computer-studies:other": "v1:42:33938932",
  "job-related-finance-taxation:all": "v1:3:26d5ddb"
};
const CORRECTIONS = [
  ["ADV2E102-U0003-Q015-SRC", "Sir Cyril Radcliffe"],
  ["ADV2E102-U0036-Q036-SRC", "1919"],
  ["ADV2E102-U0043-Q089-SRC", "Talib Ansari", "طالب انصاری"],
  ["ADV2E102-U0045-Q056-SRC", "Nasal (supraorbital) salt glands"],
  ["ADV2E102-U0045-Q081-SRC", "چوتھے مصرعے کو", "چوتھے مصرعے کو"],
  ["ADV2E102-U0045-Q098-SRC", "Al-Baqarah"],
  ["ADV2E102-U0131-Q003-SRC", "1914"]
];
const dataContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data/questions.js"), "utf8"), dataContext);
const DATA = JSON.parse(JSON.stringify(dataContext.window.PPSC_QUIZ_DATA));
// This suite replays the exact 2026-10-18 answer-text migration. Later append-only
// releases are checked separately; never let new questions rewrite this fixture.
DATA.questions = DATA.questions.slice(0, 11892);
const APP_SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
let emptyQueueFixture;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
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
  return "v1:" + questions.length + ":" + (hash >>> 0).toString(16);
}

function appHarness(initial = {}, bank = DATA) {
  const values = new Map(Object.entries(initial));
  const events = [];
  const window = {
    PPSC_QUIZ_DATA: bank,
    location: { protocol: "https:", hostname: "migration-test.invalid" },
    addEventListener() {},
    dispatchEvent(event) { events.push(plain(event)); },
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  window.CustomEvent = CustomEvent;
  const document = { readyState: "loading", addEventListener() {}, querySelector() { return null; } };
  const marker = "  window.PPSC_APP_START = startAppWhenDocumentIsReady;";
  assert.equal(APP_SOURCE.split(marker).length - 1, 1, "one app startup seam is required");
  const seam = `
  window.__MIGRATION_TEST__ = {
    signature: questionBankSignature,
    normalizeSession: normalizeStoredSession,
    normalizeQueue: normalizeRetryQueue,
    loadSession: loadActiveSession,
    loadQueue: loadRetryQueue,
    restoreSession: restoreActiveSession,
    saveSession: saveActiveSession,
    emptyQueue: createEmptyRetryQueueState,
    getQueue: function () { return retryQueueState; }
  };
`;
  vm.runInNewContext(APP_SOURCE.replace(marker, seam + marker), { window, document, CustomEvent, console });
  return {
    api: window.__MIGRATION_TEST__, events, values,
    read(key) { const value = values.get(key); return value ? JSON.parse(value) : null; },
    snapshot() { return Object.fromEntries(values); }
  };
}

function sessionFixture(questionId, { mode = "quiz", answer = "selected", bankSignature = OLD_FULL, poolCount = DATA.questions.length, paper = false } = {}) {
  const question = DATA.questions.find((candidate) => candidate.id === questionId);
  assert.ok(question);
  const pool = DATA.questions.slice(0, poolCount).filter((candidate) => candidate.categoryId === question.categoryId);
  const poolIds = pool.map((candidate) => candidate.id);
  const targetIndex = poolIds.indexOf(questionId);
  assert.ok(targetIndex >= 0);
  const questions = paper ? [question, ...pool.filter((candidate) => candidate.id !== questionId).slice(0, 99)] : [question];
  const questionIds = questions.map((candidate) => candidate.id);
  const correctDisplayIndex = [2, 3, 0, 1].indexOf(question.correctOptionIndex);
  const selectedIndex = answer === "hidden" ? null : mode === "learn" ? question.correctOptionIndex
    : answer === "wrong" ? (correctDisplayIndex + 1) % 4 : correctDisplayIndex;
  const submitted = answer === "correct" || answer === "wrong";
  const answerHistory = mode === "quiz" ? questions.map((_question, index) => index === 0 && selectedIndex !== null ? [selectedIndex, submitted] : null) : null;
  return {
    version: 8, bankSignature, sessionKind: paper ? "paper" : "category",
    categoryId: paper ? null : question.categoryId,
    paperCategoryIds: paper ? [question.categoryId] : null,
    mode, scope: "all", computerSourceScope: paper ? null : "all", partIndex: null, importantOnly: false,
    rangeStart: paper ? null : targetIndex + 1,
    rangeEnd: paper ? null : targetIndex + 1,
    rangePoolSize: paper ? null : poolIds.length,
    rangePoolQuestionIds: paper ? null : poolIds,
    rangeQuestionIds: paper ? null : questionIds,
    questionIds,
    optionOrders: mode === "quiz" ? questions.map((_question, index) => index === 0 ? [2, 3, 0, 1] : [0, 1, 2, 3]) : null,
    answerHistory,
    learnVisitedQuestionIds: mode === "learn" ? submitted ? questionIds : [] : null,
    learnReviewCountedQuestionIds: mode === "learn" ? [] : null,
    currentIndex: 0, selectedIndex, submitted,
    score: mode === "quiz" && answer === "correct" ? 1 : 0, savedAt: 12345
  };
}

function assertSessionUnchanged(actual, expected, { ignoreSavedAt = false } = {}) {
  assert.ok(actual);
  assert.equal(actual.bankSignature, NEW_FULL);
  for (const key of Object.keys(expected)) {
    if (key === "bankSignature" || (ignoreSavedAt && key === "savedAt")) continue;
    assert.deepEqual(plain(actual[key]), expected[key], "saved session field changed: " + key);
  }
}

function assertSessionReloads(fixture, origin = null) {
  let app = appHarness({ [SESSION_KEY]: JSON.stringify(fixture) });
  assert.ok(app.api.loadSession(), "first load must accept approved session");
  assertSessionUnchanged(app.read(SESSION_KEY), fixture);
  assert.equal(app.read(SESSION_KEY).rangePoolBankSignature || null, origin);
  if (fixture.bankSignature !== NEW_FULL || origin) {
    assert.ok(app.events.some((event) => event.detail?.key === SESSION_KEY && event.detail.action === "set"), "migration must notify cloud sync");
  }
  app = appHarness(app.snapshot());
  assert.ok(app.api.loadSession(), "second reload must retain approved frozen range");
  assertSessionUnchanged(app.read(SESSION_KEY), fixture);
  assert.equal(app.read(SESSION_KEY).rangePoolBankSignature || null, origin);
  assert.equal(app.api.restoreSession(), true, "Continue must restore the migrated session");
  assert.equal(app.api.saveSession(), true, "normal progress save must retain migration provenance");
  const continued = app.read(SESSION_KEY);
  assertSessionUnchanged(continued, fixture, { ignoreSavedAt: true });
  assert.equal(continued.rangePoolBankSignature || null, origin);
  const reloaded = appHarness(app.snapshot());
  assert.ok(reloaded.api.loadSession(), "reload after Continue/save must remain valid");
  return app;
}

function queueFixture({ bankSignature = OLD_FULL, kind = "queue", context = "dedicated", answer = "hidden" } = {}) {
  if (!emptyQueueFixture) emptyQueueFixture = plain(appHarness().api.emptyQueue());
  const queue = plain(emptyQueueFixture);
  queue.sequentialIndex = DATA.questions.findIndex((question) => question.id === queue.sequentialQuestionId);
  const first = DATA.questions.find((question) => question.id === CORRECTIONS[0][0]);
  const second = DATA.questions.find((question) => question.categoryId === first.categoryId && question.id !== first.id);
  const importantOther = DATA.questions.find((question) => question.id !== first.id && question.categoryId === first.categoryId && (question.isImportant || question.repeatCount >= 2));
  const selectedIndex = answer === "hidden" ? null : answer === "wrong" ? 0 : 1;
  const submitted = answer === "correct" || answer === "wrong";
  Object.assign(queue, {
    bankSignature, practiceStep: 41, nextEmbeddedReviewStep: 46, nextEmbeddedReviewKind: "queue",
    nextQuizReviewStep: 46, nextImportantReviewStep: 56, nextSequence: 3,
    items: [
      { questionId: first.id, remaining: 7, sequence: 1, dueStep: 99, wrongRetryDueStep: 99 },
      { questionId: second.id, remaining: 3, sequence: 2, dueStep: 48 }
    ],
    queueCyclePendingByCategory: { [first.categoryId]: [second.id] },
    dedicatedDeck: [second.id], dedicatedLastQuestionId: first.id,
    dedicatedRepeatGap: 5, dedicatedRecentQuestionIds: [second.id, first.id],
    importantDeck: [importantOther.id], importantLastQuestionId: first.id,
    importantLastQuestionIdsByCategory: { [first.categoryId]: first.id },
    activeAttempt: {
      questionId: first.id, optionOrder: [2, 3, 0, 1], selectedIndex, submitted,
      outcome: submitted ? answer : null,
      wrongIncrement: submitted && answer === "wrong" && kind === "queue" ? 2 : null,
      resumeAction: context === "dedicated" ? "queue" : "next:1", context, kind
    }
  });
  return queue;
}

function assertQueueReloads(fixture) {
  let app = appHarness({ [QUEUE_KEY]: JSON.stringify(fixture) });
  app.api.loadQueue();
  const updated = app.read(QUEUE_KEY);
  assert.ok(updated, "approved queue must not be deleted");
  assert.equal(updated.bankSignature, NEW_FULL);
  for (const key of Object.keys(fixture)) {
    if (key !== "bankSignature") assert.deepEqual(updated[key], fixture[key], "queue field changed: " + key);
  }
  assert.ok(app.events.some((event) => event.detail?.key === QUEUE_KEY && event.detail.action === "set"), "queue migration must notify cloud sync");
  app = appHarness(app.snapshot());
  app.api.loadQueue();
  assert.deepEqual(app.read(QUEUE_KEY), updated, "second reload must not reapply counts or change an active answer");
  assert.deepEqual(plain(app.api.getQueue()), updated);
}

function testHistoricalImportantPools() {
  const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, "data/release-repeat-evidence.json"), "utf8"));
  const historicalImportantIds = new Set(evidence.verifiedSkips.filter((entry) => entry.corpus !== "WGI").map((entry) => entry.targetId));
  const historicalQuestions = DATA.questions.slice(0, 11412).filter((question) => historicalImportantIds.has(question.id));
  assert.equal(historicalQuestions.length, 1071);
  const sourceScope = (question) => !question.id.startsWith("IBES-Q") ? "other"
    : question.kind === "source" ? "initial-original" : "initial-related";
  const poolFor = (questions, categoryId, scope) => questions.filter((question) => question.categoryId === categoryId
    && (scope === "all" || sourceScope(question) === scope)).map((question) => question.id);
  const fingerprint = (ids) => {
    let hash = 2166136261;
    const text = JSON.stringify(ids);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return "v1:" + ids.length + ":" + (hash >>> 0).toString(16);
  };
  for (const [key, expected] of Object.entries(HISTORICAL_IMPORTANT_FINGERPRINTS)) {
    const [categoryId, scope] = key.split(":");
    assert.equal(fingerprint(poolFor(historicalQuestions, categoryId, scope)), expected,
      "evidence must reconstruct the independently pinned historical Important pool");
  }

  const app = appHarness();
  let scenarios = 0;
  for (const [categoryId, scope] of [
    ["general-knowledge", "all"],
    ["basic-computer-studies", "all"],
    ["basic-computer-studies", "initial-original"],
    ["basic-computer-studies", "initial-related"],
    ["basic-computer-studies", "other"]
  ]) {
    const ids = poolFor(historicalQuestions, categoryId, scope);
    for (const bankSignature of [OLD_PREFIX, OLD_FULL, NEW_FULL]) {
      for (const mode of ["learn", "quiz"]) {
        const fixture = sessionFixture(ids[0], { bankSignature, poolCount: 11412, mode, answer: "hidden" });
        Object.assign(fixture, {
          importantOnly: true, computerSourceScope: scope,
          rangeStart: 1, rangeEnd: 1, rangePoolSize: ids.length,
          rangePoolQuestionIds: ids.slice(),
          optionOrders: mode === "quiz" ? [[0, 1, 2, 3]] : null
        });
        const normalized = app.api.normalizeSession(fixture);
        assert.ok(normalized, "historical Important pool must migrate: " + categoryId + "/" + scope + "/" + bankSignature);
        assertSessionUnchanged(plain(normalized.snapshot), fixture);
        assert.equal(normalized.snapshot.rangePoolBankSignature, OLD_PREFIX);
        const repeated = app.api.normalizeSession(plain(normalized.snapshot));
        assert.ok(repeated);
        assert.deepEqual(plain(repeated.snapshot), plain(normalized.snapshot));
        if (bankSignature === OLD_PREFIX && (mode === "quiz" || categoryId === "general-knowledge")) {
          assertSessionReloads(fixture, OLD_PREFIX);
        }
        scenarios += 1;
      }
    }
    const historical = sessionFixture(ids[0], { bankSignature: NEW_FULL, answer: "hidden" });
    Object.assign(historical, {
      importantOnly: true, computerSourceScope: scope,
      rangeStart: 1, rangeEnd: 1, rangePoolSize: ids.length,
      rangePoolQuestionIds: ids.slice(), optionOrders: [[0, 1, 2, 3]], rangePoolBankSignature: OLD_PREFIX
    });
    const forged = plain(historical);
    forged.rangePoolQuestionIds.pop();
    forged.rangePoolSize -= 1;
    assert.equal(app.api.normalizeSession(forged), null, "truncated historical Important pool must be rejected");
    delete forged.rangePoolBankSignature;
    assert.equal(app.api.normalizeSession(forged), null, "historical recovery must not accept arbitrary subsets");
    const unknownOrigin = { ...historical, rangePoolBankSignature: "v1:11412:00000000" };
    assert.equal(app.api.normalizeSession(unknownOrigin), null);
    const currentIds = poolFor(DATA.questions.filter((question) => question.isImportant === true || Number(question.repeatCount) >= 2), categoryId, scope);
    const currentTarget = currentIds.indexOf(ids[0]) + 1;
    const current = { ...historical, rangeStart: currentTarget, rangeEnd: currentTarget,
      rangePoolSize: currentIds.length, rangePoolQuestionIds: currentIds };
    delete current.rangePoolBankSignature;
    const normalizedCurrent = app.api.normalizeSession(current);
    assert.ok(normalizedCurrent, "current Important pools must keep ordinary schema validation");
    assert.equal(Object.hasOwn(normalizedCurrent.snapshot, "rangePoolBankSignature"), false);
  }
  return scenarios;
}

function run() {
  assert.equal(signature(DATA.questions), NEW_FULL, "exact reviewed full-bank fingerprint");
  assert.equal(signature(DATA.questions.slice(0, 11412)), NEW_PREFIX, "exact reviewed legacy-prefix fingerprint");
  const reconstructedOld = plain(DATA.questions);
  for (const [id, expected, expectedUrdu] of CORRECTIONS) {
    const question = DATA.questions.find((candidate) => candidate.id === id);
    assert.equal(question.correctOptionIndex, 3);
    assert.equal(question.options[3], expected);
    if (expectedUrdu) assert.equal(question.optionsUrdu[3], expectedUrdu);
    const old = reconstructedOld.find((candidate) => candidate.id === id);
    old.options[3] = id === "ADV2E102-U0045-Q081-SRC" ? "ان میں سے کوئی نہیں" : "None of these";
    if (old.optionsUrdu) old.optionsUrdu[3] = "ان میں سے کوئی نہیں";
  }
  assert.equal(signature(reconstructedOld), OLD_FULL, "only the seven approved option slots may differ");
  assert.equal(signature(reconstructedOld.slice(0, 11412)), OLD_PREFIX);

  if (process.argv.includes("--historical-important-only")) {
    console.log(JSON.stringify({ ok: true, historicalImportantScenarios: testHistoricalImportantPools(),
      checks: ["14 independently pinned historical pools", "GK and all four computer source scopes",
        "old-prefix, previous-full and current-signed frozen Important sessions",
        "repeated reload and Continue/save preserve approved origins", "forged subsets and unknown origins reject"] }, null, 2));
    return;
  }

  let scenarios = 0;
  const normalizationApp = appHarness();
  const checkSession = (id, fixture) => {
    // English and Urdu representatives exercise real reload/Continue/save;
    // every corrected MCQ also exercises both normalization passes below.
    if (id === CORRECTIONS[0][0] || id === CORRECTIONS[2][0]) {
      assertSessionReloads(fixture);
    } else {
      const first = normalizationApp.api.normalizeSession(fixture);
      assert.ok(first);
      assertSessionUnchanged(plain(first.snapshot), fixture);
      const second = normalizationApp.api.normalizeSession(plain(first.snapshot));
      assert.ok(second);
      assert.deepEqual(plain(second.snapshot), plain(first.snapshot));
    }
  };
  for (const [id] of CORRECTIONS) {
    for (const answer of ["hidden", "correct"]) {
      checkSession(id, sessionFixture(id, { mode: "learn", answer }));
      scenarios += 1;
    }
    for (const answer of ["hidden", "selected", "correct", "wrong"]) {
      checkSession(id, sessionFixture(id, { answer }));
      scenarios += 1;
    }
  }
  for (const answer of ["hidden", "selected", "correct", "wrong"]) {
    assertSessionReloads(sessionFixture(CORRECTIONS[0][0], { paper: true, answer }));
    scenarios += 1;
  }
  for (const bankSignature of [OLD_FULL, OLD_PREFIX]) {
    for (const context of ["dedicated", "embedded"]) {
      for (const answer of ["hidden", "selected", "correct", "wrong"]) {
        assertQueueReloads(queueFixture({ bankSignature, context, answer }));
        scenarios += 1;
      }
    }
    for (const answer of ["hidden", "selected", "correct", "wrong"]) {
      assertQueueReloads(queueFixture({ bankSignature, context: "embedded", kind: "important", answer }));
      scenarios += 1;
    }
  }
  for (const bankSignature of [OLD_PREFIX, OLD_FULL, NEW_FULL]) {
    for (const mode of ["learn", "quiz"]) {
      assertSessionReloads(sessionFixture(CORRECTIONS[6][0], {
        bankSignature, poolCount: 11412, mode, answer: "correct"
      }), OLD_PREFIX);
      scenarios += 1;
    }
  }

  const current = sessionFixture(CORRECTIONS[0][0], { bankSignature: NEW_FULL });
  assertSessionReloads(current);
  const app = appHarness();
  for (const invalidSignature of ["v1:11892:00000000", "v1:11412:00000000", "unknown-bank"]) {
    assert.equal(app.api.normalizeSession({ ...current, bankSignature: invalidSignature }), null);
    assert.equal(app.api.normalizeQueue({ ...queueFixture(), bankSignature: invalidSignature }), null);
  }
  assert.equal(app.api.normalizeSession({ ...current, rangePoolBankSignature: "unknown-origin" }), null);
  assert.equal(app.api.normalizeSession({ ...current, rangePoolBankSignature: 11412 }), null);
  const forged = sessionFixture(CORRECTIONS[6][0], { bankSignature: NEW_FULL, poolCount: 11412 });
  forged.rangePoolBankSignature = OLD_PREFIX;
  forged.rangePoolQuestionIds.shift();
  forged.rangePoolSize -= 1;
  forged.rangeStart -= 1;
  forged.rangeEnd -= 1;
  assert.equal(app.api.normalizeSession(forged), null, "a plausible subset is not an approved frozen prefix pool");
  delete forged.rangePoolBankSignature;
  assert.equal(app.api.normalizeSession(forged), null, "origin recovery must reject a forged subset");

  for (const mutate of [
    (bank) => { bank.questions[0].question += " drift"; },
    (bank) => { bank.questions.find((question) => question.id === CORRECTIONS[0][0]).options[3] = "Unreviewed answer"; },
    (bank) => { bank.questions.find((question) => question.id === CORRECTIONS[0][0]).correctOptionIndex = 2; },
    (bank) => { [bank.questions[0], bank.questions[1]] = [bank.questions[1], bank.questions[0]]; }
  ]) {
    const changedBank = plain(DATA);
    mutate(changedBank);
    const changed = appHarness({}, changedBank);
    for (const bankSignature of [OLD_FULL, OLD_PREFIX, NEW_FULL]) {
      assert.equal(changed.api.normalizeSession(sessionFixture(CORRECTIONS[0][0], { bankSignature })), null);
      assert.equal(changed.api.normalizeQueue(queueFixture({ bankSignature })), null);
    }
  }
  const historicalImportantScenarios = testHistoricalImportantPools();
  console.log(JSON.stringify({
    ok: true, sessionAndQueueScenarios: scenarios,
    historicalImportantScenarios,
    fullSignature: NEW_FULL, prefixSignature: NEW_PREFIX,
    checks: [
      "exact seven same-index answer replacements reconstruct both approved original bank fingerprints",
      "Learn, shuffled Quiz and Paper answers survive migration, repeated reload and Continue/save",
      "finite queue counts/order, saved rounds, Important decks, clocks and pending answers survive both old bank origins",
      "frozen additive pools retain validated origin across repeat reloads and normal saves",
      "historical Important-only membership survives exact pinned-pool migration without admitting arbitrary subsets",
      "unknown signatures, forged origins/pools and unreviewed bank changes remain rejected",
      "migration writes notify cloud sync without live external access"
    ]
  }, null, 2));
}

run();
