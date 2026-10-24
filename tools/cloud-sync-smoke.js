"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SYNC_SOURCE_PATH = path.join(PROJECT_ROOT, "firebase-sync.js");
const ACTIVE_SESSION_KEY = "ppsc-prep:active-session:v1";
const RETRY_QUEUE_KEY = "ppsc-prep:retry-queue:v1";
const DIFFICULT_IDS_KEY = "ppsc-prep:difficult-question-ids:v1";
const CATEGORY_SESSIONS_KEY = "ppsc-prep:category-sessions:v1";
const CONFLICT_BACKUP_KEY = "ppsc-prep:cloud-conflict-backup:v1";
const ACCESS_MODE_KEY = "ppsc-prep:access-mode:v1";
const ALLOWED_EMAIL = "developerabdulnafa@gmail.com";
const TEST_UID = "owner-uid";
const BANK_SIGNATURE = "v1:11412:57e37c68";
const SAMPLE_QUESTION_ID = "P234-Q003-SRC";
const SECOND_QUESTION_ID = "P234-Q003-SIM";

const SAMPLE_SESSION_RAW = JSON.stringify({
  version: 8,
  bankSignature: BANK_SIGNATURE,
  sessionKind: "category",
  categoryId: "general-knowledge",
  paperCategoryIds: null,
  mode: "learn",
  scope: "difficult",
  computerSourceScope: "all",
  partIndex: null,
  importantOnly: false,
  rangeStart: 1,
  rangeEnd: 1,
  rangePoolSize: 1,
  rangePoolQuestionIds: [SAMPLE_QUESTION_ID],
  rangeQuestionIds: [SAMPLE_QUESTION_ID],
  questionIds: [SAMPLE_QUESTION_ID],
  optionOrders: null,
  answerHistory: null,
  learnVisitedQuestionIds: [SAMPLE_QUESTION_ID],
  currentIndex: 0,
  selectedIndex: 1,
  submitted: true,
  score: 0,
  savedAt: 1
});
const SAMPLE_CATEGORY_SESSIONS_RAW = JSON.stringify({
  version: 1,
  sessions: {
    "general-knowledge:learn:difficult:all:all": JSON.parse(SAMPLE_SESSION_RAW),
    "general-knowledge:quiz:all:all:all": {
      ...JSON.parse(SAMPLE_SESSION_RAW), mode: "quiz", scope: "all",
      questionIds: [SAMPLE_QUESTION_ID, SECOND_QUESTION_ID],
      rangeQuestionIds: [SAMPLE_QUESTION_ID, SECOND_QUESTION_ID],
      rangePoolQuestionIds: [SAMPLE_QUESTION_ID, SECOND_QUESTION_ID],
      rangePoolSize: 2, rangeEnd: 2, currentIndex: 1,
      optionOrders: [[0, 1, 2, 3], [3, 1, 0, 2]],
      answerHistory: [{ questionId: SAMPLE_QUESTION_ID, selectedIndex: 1, correct: true }],
      selectedIndex: 2, submitted: false, score: 1, savedAt: 2
    }
  }
});
const LEGACY_TWO_REVIEW_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  practiceStep: 0,
  nextSequence: 2,
  items: [{ questionId: SAMPLE_QUESTION_ID, remaining: 2, dueStep: 0, sequence: 1 }],
  activeAttempt: null
});
const BASELINED_FIVE_REVIEW_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  countBaselineVersion: 1,
  embeddedCadenceVersion: 2,
  practiceStep: 0,
  nextQuizReviewStep: 5,
  nextImportantReviewStep: 14,
  nextSequence: 2,
  dedicatedDeck: [],
  dedicatedLastQuestionId: null,
  importantDeck: [],
  importantLastQuestionId: null,
  items: [{ questionId: SAMPLE_QUESTION_ID, remaining: 5, dueStep: 0, sequence: 1 }],
  activeAttempt: null
});
const DEDICATED_ATTEMPT_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  countBaselineVersion: 1,
  embeddedCadenceVersion: 2,
  practiceStep: 9,
  nextQuizReviewStep: 14,
  nextSequence: 9,
  dedicatedDeck: [SECOND_QUESTION_ID],
  dedicatedLastQuestionId: SAMPLE_QUESTION_ID,
  dedicatedRepeatGap: 10,
  dedicatedRecentQuestionIds: [SECOND_QUESTION_ID, SAMPLE_QUESTION_ID],
  queueCyclePendingByCategory: { "general-knowledge": [SECOND_QUESTION_ID] },
  items: [
    {
      questionId: SAMPLE_QUESTION_ID,
      remaining: 4,
      dueStep: 23,
      wrongRetryDueStep: 23,
      sequence: 7
    },
    { questionId: SECOND_QUESTION_ID, remaining: 2, dueStep: 14, sequence: 8 }
  ],
  activeAttempt: {
    questionId: SAMPLE_QUESTION_ID,
    optionOrder: [2, 0, 3, 1],
    selectedIndex: 3,
    submitted: true,
    outcome: "correct",
    wrongIncrement: null,
    resumeAction: "queue",
    context: "dedicated"
  }
});
const IMPORTANT_ATTEMPT_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  countBaselineVersion: 1,
  embeddedCadenceVersion: 2,
  practiceStep: 20,
  nextQuizReviewStep: null,
  nextImportantReviewStep: 34,
  nextSequence: 1,
  dedicatedDeck: [],
  dedicatedLastQuestionId: null,
  importantDeck: [SECOND_QUESTION_ID],
  importantLastQuestionId: SAMPLE_QUESTION_ID,
  items: [],
  activeAttempt: {
    questionId: SAMPLE_QUESTION_ID,
    optionOrder: [2, 0, 3, 1],
    selectedIndex: 3,
    submitted: true,
    outcome: "wrong",
    wrongIncrement: null,
    resumeAction: "next:4",
    context: "embedded",
    kind: "important"
  }
});
const RETIRED_SEQUENTIAL_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  countBaselineVersion: 1,
  embeddedCadenceVersion: 2,
  practiceStep: 30,
  nextQuizReviewStep: 35,
  nextImportantReviewStep: 44,
  nextSequentialReviewStep: null,
  sequentialOrderVersion: 2,
  // Keep old cursor fields readable for v1 compatibility, but they must not
  // turn the retired Sequential popup back on after cloud restoration.
  sequentialTurn: 11,
  sequentialIndex: 5,
  sequentialQuestionId: SECOND_QUESTION_ID,
  nextSequence: 2,
  dedicatedDeck: [],
  dedicatedLastQuestionId: null,
  importantDeck: [],
  importantLastQuestionId: null,
  items: [{ questionId: SAMPLE_QUESTION_ID, remaining: 5, dueStep: 35, sequence: 1 }],
  activeAttempt: null
});
const SAMPLE_DIFFICULT_RAW = JSON.stringify({
  version: 1,
  questionIds: [SAMPLE_QUESTION_ID]
});

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial).filter((entry) => entry[1] !== null));
  }

  getItem(key) {
    return this.values.has(String(key)) ? this.values.get(String(key)) : null;
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  removeItem(key) {
    this.values.delete(String(key));
  }

  clear() {
    this.values.clear();
  }
}

class MiniEventTarget {
  constructor() {
    this.listeners = new Map();
    this.events = [];
  }

  addEventListener(type, listener, options) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, once: Boolean(options && options.once) });
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((entry) => entry.listener !== listener));
  }

  dispatchEvent(event) {
    const normalized = event || {};
    const type = normalized.type;
    this.events.push(normalized);
    const listeners = (this.listeners.get(type) || []).slice();
    listeners.forEach((entry) => {
      entry.listener.call(this, normalized);
      if (entry.once) this.removeEventListener(type, entry.listener);
    });
    return true;
  }
}

class MiniCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

function createDocument() {
  const document = new MiniEventTarget();
  const classes = new Set();
  document.readyState = "complete";
  document.visibilityState = "visible";
  document.getElementById = () => null;
  document.documentElement = {
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name)
    }
  };
  return document;
}

function makeSnapshot(store, reference) {
  const exists = store.has(reference.path);
  const value = exists ? clone(store.get(reference.path)) : undefined;
  return {
    exists: () => exists,
    data: () => clone(value)
  };
}

function createFirebaseSdk({ store, initialUser, deferInitialAuth = false }) {
  const auth = {
    currentUser: initialUser || null,
    observers: []
  };
  const metrics = {
    firestoreReads: 0,
    signOuts: 0,
    transactions: 0,
    batchCommits: 0
  };
  const apps = [];
  const controls = { beforeTransaction: null, beforeRead: null };

  const app = {
    getApps: () => apps.slice(),
    initializeApp: (_config, name) => {
      const instance = { name };
      apps.push(instance);
      return instance;
    }
  };

  function notifyAuthObservers() {
    auth.observers.slice().forEach((observer) => {
      queueMicrotask(() => observer.next(auth.currentUser));
    });
  }

  class GoogleAuthProvider {
    setCustomParameters(parameters) {
      this.parameters = parameters;
    }
  }

  const authModule = {
    browserLocalPersistence: { type: "LOCAL" },
    GoogleAuthProvider,
    getAuth: () => auth,
    setPersistence: async () => undefined,
    onAuthStateChanged: (_auth, next, error) => {
      const observer = { next, error };
      auth.observers.push(observer);
      if (!deferInitialAuth) queueMicrotask(() => next(auth.currentUser));
      return () => {
        auth.observers = auth.observers.filter((candidate) => candidate !== observer);
      };
    },
    signInWithPopup: async () => {
      auth.currentUser = allowedUser();
      notifyAuthObservers();
      return { user: auth.currentUser };
    },
    signOut: async () => {
      metrics.signOuts += 1;
      auth.currentUser = null;
      notifyAuthObservers();
    }
  };

  const readDocument = async (reference) => {
    metrics.firestoreReads += 1;
    if (typeof controls.beforeRead === "function") {
      const hook = controls.beforeRead;
      controls.beforeRead = null;
      await hook(reference);
    }
    return makeSnapshot(store, reference);
  };

  const firestore = {
    getFirestore: () => ({ kind: "fake-firestore" }),
    doc: (_db, ...segments) => ({ path: segments.join("/") }),
    serverTimestamp: () => ({ __serverTimestamp: true }),
    getDoc: readDocument,
    getDocFromServer: readDocument,
    writeBatch: () => {
      const writes = [];
      return {
        set: (reference, value) => writes.push({ type: "set", reference, value: clone(value) }),
        delete: (reference) => writes.push({ type: "delete", reference }),
        commit: async () => {
          metrics.batchCommits += 1;
          writes.forEach((write) => {
            if (write.type === "delete") store.delete(write.reference.path);
            else store.set(write.reference.path, clone(write.value));
          });
        }
      };
    },
    runTransaction: async (_db, update) => {
      metrics.transactions += 1;
      if (typeof controls.beforeTransaction === "function") {
        const hook = controls.beforeTransaction;
        controls.beforeTransaction = null;
        await hook();
      }
      const writes = [];
      const transaction = {
        get: async (reference) => makeSnapshot(store, reference),
        set: (reference, value) => writes.push({ reference, value: clone(value) })
      };
      const result = await update(transaction);
      writes.forEach((write) => store.set(write.reference.path, clone(write.value)));
      return result;
    }
  };

  return {
    sdk: { app, auth: authModule, firestore },
    auth,
    metrics,
    controls
  };
}

function allowedUser() {
  return {
    uid: TEST_UID,
    email: ALLOWED_EMAIL,
    emailVerified: true,
    displayName: "PPSC Owner"
  };
}

function syncSourceWithSdkSeam() {
  const source = fs.readFileSync(SYNC_SOURCE_PATH, "utf8");
  const marker = "async function loadFirebaseSdk() {";
  const occurrences = source.split(marker).length - 1;
  assert.equal(occurrences, 1, "firebase-sync.js must contain one SDK loader seam");
  return source.replace(
    marker,
    `${marker}\n    window.__PPSC_TEST_SDK_LOADS__ = (window.__PPSC_TEST_SDK_LOADS__ || 0) + 1;\n    if (window.__PPSC_TEST_SDK__) return window.__PPSC_TEST_SDK__;`
  );
}

function createBrowser({
  protocol = "https:",
  hostname = "abdulnafa.github.io",
  local = {},
  session = {},
  store = new Map(),
  user = allowedUser(),
  injectSdk = true,
  deferSdk = false,
  deferInitialAuth = false,
  omitConfig = false,
  setupFirebase = null
} = {}) {
  const window = new MiniEventTarget();
  const document = createDocument();
  const localStorage = new MemoryStorage(local);
  const sessionStorage = new MemoryStorage(session);
  const fake = createFirebaseSdk({ store, initialUser: user, deferInitialAuth });
  if (setupFirebase) setupFirebase(fake);
  const sdkGate = deferSdk ? deferred() : null;
  let randomSeed = 100;

  Object.assign(window, {
    window,
    document,
    localStorage,
    sessionStorage,
    CustomEvent: MiniCustomEvent,
    TextEncoder,
    Uint32Array,
    setTimeout,
    clearTimeout,
    navigator: { onLine: true },
    crypto: {
      getRandomValues(values) {
        for (let index = 0; index < values.length; index += 1) {
          values[index] = randomSeed;
          randomSeed += 1;
        }
        return values;
      }
    },
    location: {
      protocol,
      hostname,
      reloadCalled: false,
      reload() { this.reloadCalled = true; }
    },
    PPSC_FIREBASE_CONFIG: {
      firebase: {
        apiKey: "test-public-key",
        authDomain: "test.firebaseapp.com",
        projectId: "test"
      },
      allowedEmail: ALLOWED_EMAIL
    }
  });
  if (omitConfig) delete window.PPSC_FIREBASE_CONFIG;
  if (injectSdk) window.__PPSC_TEST_SDK__ = sdkGate ? sdkGate.promise : fake.sdk;

  const context = vm.createContext({
    window,
    document,
    CustomEvent: MiniCustomEvent,
    TextEncoder,
    Uint32Array,
    console,
    setTimeout,
    clearTimeout,
    queueMicrotask
  });
  const script = new vm.Script(syncSourceWithSdkSeam(), { filename: SYNC_SOURCE_PATH });
  script.runInContext(context);

  return { window, document, localStorage, sessionStorage, store, fake, sdkGate };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function waitFor(browser, predicate, description, timeoutMs = 1500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const status = browser.window.PPSC_CLOUD.getStatus();
    if (predicate(status)) return status;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  assert.fail(`Timed out waiting for ${description}; last status: ${JSON.stringify(browser.window.PPSC_CLOUD.getStatus())}`);
}

function readyEventMode(browser) {
  const event = browser.window.events.filter((candidate) => candidate.type === "ppsc:cloud-ready").at(-1);
  return event && event.detail ? event.detail.mode : null;
}

function metaPath() {
  return `users/${TEST_UID}/syncState/meta`;
}

function slotPath(slotId) {
  return `users/${TEST_UID}/syncState/${slotId}`;
}

function rawCloudValue(store, slotId) {
  const manifest = store.get(slotPath(slotId));
  assert.ok(manifest, `missing ${slotId} manifest`);
  if (!manifest.present) return null;
  if (typeof manifest.inlineData === "string") return manifest.inlineData;
  const chunks = [];
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    const chunkPath = `${slotPath(slotId)}/generations/${manifest.generation}/chunks/${String(index).padStart(6, "0")}`;
    const chunk = store.get(chunkPath);
    assert.ok(chunk, `missing ${slotId} chunk ${index}`);
    chunks.push(chunk.data);
  }
  return chunks.join("");
}

function legacyLocalProgress() {
  return {
    [ACTIVE_SESSION_KEY]: SAMPLE_SESSION_RAW,
    [RETRY_QUEUE_KEY]: LEGACY_TWO_REVIEW_QUEUE_RAW,
    [DIFFICULT_IDS_KEY]: SAMPLE_DIFFICULT_RAW
  };
}

function retryQueueRaw(questionId, remaining, padding = "") {
  const queue = {
    version: 1,
    bankSignature: BANK_SIGNATURE,
    countBaselineVersion: 1,
    embeddedCadenceVersion: 2,
    practiceStep: 0,
    nextQuizReviewStep: 5,
    nextSequence: 2,
    items: [{ questionId, remaining, dueStep: 0, sequence: 1 }],
    activeAttempt: null
  };
  if (padding) queue.transportPadding = padding;
  return JSON.stringify(queue);
}

function cloneStore(store) {
  return new Map(Array.from(store.entries(), ([key, value]) => [key, clone(value)]));
}

async function testDevelopmentBypassNeedsNoSdk() {
  const browser = createBrowser({
    protocol: "file:",
    hostname: "",
    injectSdk: false,
    user: null
  });
  const status = await waitFor(browser, (candidate) => candidate.phase === "dev-ready", "development mode");
  assert.equal(status.ready, true);
  assert.equal(status.authRequired, false);
  assert.equal(browser.window.PPSC_CLOUD_READY, true);
  assert.equal(browser.fake.metrics.firestoreReads, 0, "development mode must not touch Firestore");
  assert.equal(readyEventMode(browser), "development");
}

async function testFirstDeviceMigrationPreservesLegacyRemaining() {
  const store = new Map();
  const local = legacyLocalProgress();
  const browser = createBrowser({ store, local });
  const choice = await waitFor(
    browser,
    (candidate) => candidate.phase === "migration-choice",
    "first-device migration choice"
  );
  assert.equal(choice.ready, false);
  assert.equal(choice.decision, "device-upload");
  assert.equal(choice.localSummary.retryReviews, 2);
  assert.equal(store.size, 0, "no cloud data may be written before the owner chooses");
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);

  await browser.window.PPSC_CLOUD.chooseLocal();
  const synced = await waitFor(browser, (candidate) => candidate.phase === "synced", "first upload");
  assert.equal(synced.ready, true);
  assert.equal(store.get(metaPath()).revision, 1);
  assert.equal(rawCloudValue(store, "retry-queue"), LEGACY_TWO_REVIEW_QUEUE_RAW);
  assert.equal(JSON.parse(rawCloudValue(store, "retry-queue")).items[0].remaining, 2);
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);
  assert.equal(readyEventMode(browser), "device-imported");
  return store;
}

async function testEmptyFirstDeviceNeedsConfirmation() {
  const store = new Map();
  const browser = createBrowser({ store, local: {} });
  const choice = await waitFor(
    browser,
    (candidate) => candidate.phase === "migration-choice",
    "empty-device confirmation"
  );
  assert.equal(choice.ready, false);
  assert.equal(choice.decision, "confirm-empty-device");
  assert.equal(choice.localSummary.hasProgress, false);
  assert.equal(store.size, 0, "an empty browser must not silently initialize the cloud");

  browser.window.PPSC_CLOUD.chooseCloud();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(browser.window.PPSC_CLOUD.getStatus().phase, "migration-choice");
  assert.equal(store.size, 0);

  await browser.window.PPSC_CLOUD.chooseLocal();
  await new Promise((resolve) => setTimeout(resolve, 5));
  const refused = browser.window.PPSC_CLOUD.getStatus();
  assert.equal(refused.phase, "migration-choice");
  assert.match(refused.error, /empty device/i);
  assert.equal(store.size, 0, "an empty browser must never initialize the first cloud copy");
}

async function testCloudRestoreOnEmptyLaptop(seedStore) {
  const browser = createBrowser({ store: seedStore, local: {} });
  const status = await waitFor(browser, (candidate) => candidate.ready, "empty laptop cloud restore");
  assert.equal(status.phase, "synced");
  assert.equal(browser.localStorage.getItem(ACTIVE_SESSION_KEY), SAMPLE_SESSION_RAW);
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);
  assert.equal(browser.localStorage.getItem(DIFFICULT_IDS_KEY), SAMPLE_DIFFICULT_RAW);
  assert.equal(JSON.parse(browser.localStorage.getItem(RETRY_QUEUE_KEY)).items[0].remaining, 2);
  assert.equal(readyEventMode(browser), "cloud-restored");
}

async function testRestoredLegacyQueueUploadsAppBaselineAndRestoresExactly(seedStore) {
  const store = cloneStore(seedStore);
  const first = createBrowser({ store, local: {} });
  await waitFor(first, (candidate) => candidate.ready, "legacy queue restore before app baseline");
  assert.equal(first.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);

  first.localStorage.setItem(RETRY_QUEUE_KEY, BASELINED_FIVE_REVIEW_QUEUE_RAW);
  first.window.dispatchEvent(new MiniCustomEvent("ppsc:local-state-changed", {
    detail: { key: RETRY_QUEUE_KEY, action: "set", value: BASELINED_FIVE_REVIEW_QUEUE_RAW }
  }));
  const synced = await waitFor(
    first,
    (candidate) => candidate.phase === "synced"
      && candidate.revision === 2
      && rawCloudValue(store, "retry-queue") === BASELINED_FIVE_REVIEW_QUEUE_RAW,
    "post-restore app baseline upload",
    3000
  );
  assert.equal(synced.localSummary.retryReviews, 5);
  assert.equal(synced.cloudSummary.retryReviews, 5);
  const uploadedQueue = JSON.parse(rawCloudValue(store, "retry-queue"));
  assert.equal(uploadedQueue.countBaselineVersion, 1);
  assert.equal(uploadedQueue.embeddedCadenceVersion, 2);
  assert.ok(
    uploadedQueue.nextQuizReviewStep - uploadedQueue.practiceStep >= 5
      && uploadedQueue.nextQuizReviewStep - uploadedQueue.practiceStep <= 6,
    "the migrated finite Queue cadence must remain between five and six main questions"
  );
  assert.equal(uploadedQueue.items[0].remaining, 5);

  const second = createBrowser({ store, local: {} });
  const restored = await waitFor(second, (candidate) => candidate.ready, "marked queue second-device restore");
  assert.equal(restored.revision, 2);
  assert.equal(restored.localSummary.retryReviews, 5);
  assert.equal(second.localStorage.getItem(RETRY_QUEUE_KEY), BASELINED_FIVE_REVIEW_QUEUE_RAW);
  assert.equal(readyEventMode(second), "cloud-restored");
}

async function testDedicatedAttemptQueueRoundTrip() {
  const store = new Map();
  const source = createBrowser({
    store,
    local: { [RETRY_QUEUE_KEY]: DEDICATED_ATTEMPT_QUEUE_RAW }
  });
  const sourceQueue = JSON.parse(source.localStorage.getItem(RETRY_QUEUE_KEY));
  assert.equal(sourceQueue.embeddedCadenceVersion, 2);
  assert.ok(
    sourceQueue.nextQuizReviewStep - sourceQueue.practiceStep >= 5
      && sourceQueue.nextQuizReviewStep - sourceQueue.practiceStep <= 6,
    "dedicated practice must preserve the independent embedded five-to-six cadence marker"
  );
  assert.equal(sourceQueue.dedicatedRepeatGap, 10);
  assert.deepEqual(sourceQueue.dedicatedRecentQuestionIds, [SECOND_QUESTION_ID, SAMPLE_QUESTION_ID]);
  assert.deepEqual(sourceQueue.queueCyclePendingByCategory["general-knowledge"], [SECOND_QUESTION_ID]);
  assert.equal(sourceQueue.items[0].wrongRetryDueStep, sourceQueue.items[0].dueStep);
  assert.ok(
    sourceQueue.items[0].wrongRetryDueStep - sourceQueue.practiceStep >= 10
      && sourceQueue.items[0].wrongRetryDueStep - sourceQueue.practiceStep <= 15,
    "the per-item wrong-answer cooldown must remain independent from the regular Queue gate"
  );
  const choice = await waitFor(
    source,
    (candidate) => candidate.phase === "migration-choice",
    "dedicated queue upload choice"
  );
  assert.equal(choice.decision, "device-upload");

  await source.window.PPSC_CLOUD.chooseLocal();
  await waitFor(
    source,
    (candidate) => candidate.phase === "synced",
    "dedicated queue upload"
  );
  assert.equal(
    rawCloudValue(store, "retry-queue"),
    DEDICATED_ATTEMPT_QUEUE_RAW,
    "queue cadence, per-item wrong cooldown, repeat-spacing history, priority-tie deck, and dedicated-attempt fields must upload byte-for-byte"
  );
  const uploadedQueue = JSON.parse(rawCloudValue(store, "retry-queue"));
  assert.equal(uploadedQueue.embeddedCadenceVersion, 2);
  assert.equal(uploadedQueue.dedicatedRepeatGap, 10);
  assert.deepEqual(uploadedQueue.dedicatedRecentQuestionIds, [SECOND_QUESTION_ID, SAMPLE_QUESTION_ID]);
  assert.deepEqual(uploadedQueue.queueCyclePendingByCategory["general-knowledge"], [SECOND_QUESTION_ID]);
  assert.equal(uploadedQueue.items[0].wrongRetryDueStep, 23);

  const restored = createBrowser({ store: cloneStore(store), local: {} });
  await waitFor(restored, (candidate) => candidate.ready, "dedicated queue empty-device restore");
  assert.equal(
    restored.localStorage.getItem(RETRY_QUEUE_KEY),
    DEDICATED_ATTEMPT_QUEUE_RAW,
    "queue cadence, per-item wrong cooldown, repeat-spacing history, priority-tie deck, and dedicated-attempt fields must restore byte-for-byte"
  );
  const restoredQueue = JSON.parse(restored.localStorage.getItem(RETRY_QUEUE_KEY));
  assert.equal(restoredQueue.embeddedCadenceVersion, 2);
  assert.equal(restoredQueue.dedicatedRepeatGap, 10);
  assert.deepEqual(restoredQueue.dedicatedRecentQuestionIds, [SECOND_QUESTION_ID, SAMPLE_QUESTION_ID]);
  assert.deepEqual(restoredQueue.queueCyclePendingByCategory["general-knowledge"], [SECOND_QUESTION_ID]);
  assert.equal(restoredQueue.items[0].wrongRetryDueStep, 23);
}

async function testImportantPracticeRoundTrip() {
  const store = new Map();
  const source = createBrowser({
    store,
    local: { [RETRY_QUEUE_KEY]: IMPORTANT_ATTEMPT_QUEUE_RAW }
  });
  const choice = await waitFor(
    source,
    (candidate) => candidate.phase === "migration-choice",
    "Important practice upload choice"
  );
  assert.equal(choice.decision, "device-upload");
  assert.equal(choice.localSummary.hasProgress, true);
  assert.equal(choice.localSummary.importantPractice, true);
  assert.equal(choice.localSummary.retryCount, 0);
  assert.equal(
    JSON.parse(source.localStorage.getItem(RETRY_QUEUE_KEY)).embeddedCadenceVersion,
    2
  );

  await source.window.PPSC_CLOUD.chooseLocal();
  await waitFor(source, (candidate) => candidate.phase === "synced", "Important practice upload");
  assert.equal(
    rawCloudValue(store, "retry-queue"),
    IMPORTANT_ATTEMPT_QUEUE_RAW,
    "permanent Important cadence, deck, marker, and active attempt must upload byte-for-byte"
  );

  const restored = createBrowser({ store: cloneStore(store), local: {} });
  const restoredStatus = await waitFor(restored, (candidate) => candidate.ready, "Important practice restore");
  assert.equal(restoredStatus.localSummary.importantPractice, true);
  assert.equal(
    restored.localStorage.getItem(RETRY_QUEUE_KEY),
    IMPORTANT_ATTEMPT_QUEUE_RAW,
    "permanent Important state must restore byte-for-byte on another device"
  );
}

async function testAlternatingPopupCadenceRoundTripAndOfflineReconnect() {
  // The sync layer transports app-owned state; it must not independently
  // recalculate the shared popup gate or reset a saved dedicated attempt.
  const initialQueue = {
    ...JSON.parse(DEDICATED_ATTEMPT_QUEUE_RAW),
    embeddedCadenceVersion: 4,
    embeddedPopupsEnabled: false,
    wrongQuestionIds: [SAMPLE_QUESTION_ID, SECOND_QUESTION_ID],
    practiceStep: 30,
    nextEmbeddedReviewStep: 40,
    nextEmbeddedReviewKind: "important",
    nextQuizReviewStep: 50,
    nextImportantReviewStep: 40
  };
  const initialRaw = JSON.stringify(initialQueue);
  const store = new Map();
  const source = createBrowser({
    store,
    local: {
      [ACTIVE_SESSION_KEY]: SAMPLE_SESSION_RAW,
      [RETRY_QUEUE_KEY]: initialRaw
    }
  });
  await waitFor(source, (candidate) => candidate.phase === "migration-choice", "alternating cadence upload choice");
  await source.window.PPSC_CLOUD.chooseLocal();
  await waitFor(source, (candidate) => candidate.phase === "synced", "alternating cadence initial upload");
  assert.equal(rawCloudValue(store, "retry-queue"), initialRaw);

  const second = createBrowser({ store, local: {} });
  await waitFor(second, (candidate) => candidate.ready, "alternating cadence second-device restore");
  assert.equal(second.localStorage.getItem(RETRY_QUEUE_KEY), initialRaw);
  assert.equal(JSON.parse(second.localStorage.getItem(RETRY_QUEUE_KEY)).embeddedPopupsEnabled, false,
    "automatic popups OFF must restore on another device without enabling them");
  assert.equal(second.localStorage.getItem(ACTIVE_SESSION_KEY), SAMPLE_SESSION_RAW);

  source.window.navigator.onLine = false;
  source.window.dispatchEvent({ type: "offline" });
  second.window.navigator.onLine = false;
  second.window.dispatchEvent({ type: "offline" });
  const updatedQueue = {
    ...initialQueue,
    embeddedPopupsEnabled: true,
    wrongQuestionIds: [SECOND_QUESTION_ID],
    practiceStep: 43,
    nextEmbeddedReviewStep: 50,
    nextEmbeddedReviewKind: "queue",
    nextQuizReviewStep: 50,
    nextImportantReviewStep: 60
  };
  const updatedRaw = JSON.stringify(updatedQueue);
  second.localStorage.setItem(RETRY_QUEUE_KEY, updatedRaw);
  second.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  assert.equal(second.window.PPSC_CLOUD.getStatus().phase, "offline");
  assert.equal(rawCloudValue(store, "retry-queue"), initialRaw, "offline changes must stay local until reconnect");

  second.window.navigator.onLine = true;
  second.window.dispatchEvent({ type: "online" });
  await waitFor(
    second,
    (candidate) => candidate.phase === "synced" && rawCloudValue(store, "retry-queue") === updatedRaw,
    "offline alternating cadence upload after reconnect",
    3000
  );
  assert.equal(second.localStorage.getItem(RETRY_QUEUE_KEY), updatedRaw);

  source.window.navigator.onLine = true;
  source.window.dispatchEvent({ type: "online" });
  await waitFor(source, () => source.window.location.reloadCalled, "alternating cadence remote reconnect pull", 3000);
  assert.equal(source.localStorage.getItem(RETRY_QUEUE_KEY), updatedRaw);
  assert.equal(source.localStorage.getItem(ACTIVE_SESSION_KEY), SAMPLE_SESSION_RAW);
  const restoredQueue = JSON.parse(source.localStorage.getItem(RETRY_QUEUE_KEY));
  assert.equal(restoredQueue.embeddedCadenceVersion, 4);
  assert.equal(restoredQueue.embeddedPopupsEnabled, true,
    "offline popup-preference changes must upload and reach the other device on reconnect");
  assert.equal(restoredQueue.nextEmbeddedReviewKind, "queue");
  assert.equal(restoredQueue.nextEmbeddedReviewStep - restoredQueue.practiceStep, 7, "remaining shared countdown must not restart on another device");
  assert.deepEqual(restoredQueue.items, initialQueue.items, "finite counts and saved Queue items must remain untouched");
  assert.deepEqual(restoredQueue.wrongQuestionIds, [SECOND_QUESTION_ID],
    "Wrong-list removal must sync independently of existing finite counts and a pending review");
  assert.deepEqual(restoredQueue.queueCyclePendingByCategory, initialQueue.queueCyclePendingByCategory);
  assert.deepEqual(restoredQueue.activeAttempt, initialQueue.activeAttempt, "pending answer must survive the cadence round trip exactly");
}

async function testRetiredSequentialStateRoundTrip() {
  const store = new Map();
  const source = createBrowser({
    store,
    local: { [RETRY_QUEUE_KEY]: RETIRED_SEQUENTIAL_QUEUE_RAW }
  });
  const choice = await waitFor(
    source,
    (candidate) => candidate.phase === "migration-choice",
    "retired Sequential state upload choice"
  );
  assert.equal(choice.decision, "device-upload");
  assert.equal(choice.localSummary.hasProgress, true);
  assert.equal(Object.hasOwn(choice.localSummary, "sequentialPractice"), false);
  assert.equal(choice.localSummary.retryCount, 1);

  await source.window.PPSC_CLOUD.chooseLocal();
  await waitFor(source, (candidate) => candidate.phase === "synced", "retired Sequential state upload");
  assert.equal(
    rawCloudValue(store, "retry-queue"),
    RETIRED_SEQUENTIAL_QUEUE_RAW,
    "retired Sequential state and finite Queue reviews must upload byte-for-byte"
  );
  const uploadedQueue = JSON.parse(rawCloudValue(store, "retry-queue"));
  assert.equal(uploadedQueue.nextSequentialReviewStep, null);
  assert.equal(uploadedQueue.sequentialOrderVersion, 2);
  assert.equal(uploadedQueue.sequentialTurn, 11);
  assert.equal(uploadedQueue.sequentialIndex, 5);
  assert.equal(uploadedQueue.sequentialQuestionId, SECOND_QUESTION_ID);
  assert.equal(uploadedQueue.activeAttempt, null);
  assert.equal(uploadedQueue.items[0].remaining, 5);

  const restored = createBrowser({ store: cloneStore(store), local: {} });
  const restoredStatus = await waitFor(
    restored,
    (candidate) => candidate.ready,
    "retired Sequential state restore"
  );
  assert.equal(Object.hasOwn(restoredStatus.localSummary, "sequentialPractice"), false);
  assert.equal(restoredStatus.localSummary.retryCount, 1);
  assert.equal(
    restored.localStorage.getItem(RETRY_QUEUE_KEY),
    RETIRED_SEQUENTIAL_QUEUE_RAW,
    "retired Sequential state and finite Queue reviews must restore byte-for-byte on another device"
  );
  const restoredQueue = JSON.parse(restored.localStorage.getItem(RETRY_QUEUE_KEY));
  assert.equal(restoredQueue.nextSequentialReviewStep, null);
  assert.equal(restoredQueue.sequentialOrderVersion, 2);
  assert.equal(restoredQueue.sequentialTurn, 11);
  assert.equal(restoredQueue.sequentialIndex, 5);
  assert.equal(restoredQueue.sequentialQuestionId, SECOND_QUESTION_ID);
  assert.equal(restoredQueue.activeAttempt, null);
  assert.equal(restoredQueue.items[0].remaining, 5);
}

async function testWrongQuizListRoundTripAndOfflineRemoval() {
  // Wrong Quiz membership is independent of finite retry counts and remains
  // progress even after the normal review queue has been cleared.
  const initialQueue = {
    ...JSON.parse(BASELINED_FIVE_REVIEW_QUEUE_RAW),
    embeddedCadenceVersion: 4,
    embeddedPopupsEnabled: false,
    nextEmbeddedReviewStep: 10,
    nextEmbeddedReviewKind: "queue",
    nextQuizReviewStep: null,
    nextImportantReviewStep: null,
    nextSequence: 1,
    queueCyclePendingByCategory: {},
    wrongQuestionIds: [SAMPLE_QUESTION_ID, SECOND_QUESTION_ID],
    items: []
  };
  const initialRaw = JSON.stringify(initialQueue);
  const store = new Map();
  const source = createBrowser({ store, local: { [RETRY_QUEUE_KEY]: initialRaw } });
  const choice = await waitFor(source, (candidate) => candidate.phase === "migration-choice", "wrong-only upload choice");
  assert.equal(choice.localSummary.hasProgress, true, "Wrong Quiz IDs alone must count as saved progress");
  assert.equal(choice.localSummary.wrongCount, 2);
  assert.equal(choice.localSummary.retryCount, 0);
  assert.equal(choice.decision, "device-upload");
  await source.window.PPSC_CLOUD.chooseLocal();
  await waitFor(source, (candidate) => candidate.phase === "synced", "wrong-only initial upload");
  assert.equal(rawCloudValue(store, "retry-queue"), initialRaw);

  const second = createBrowser({ store, local: {} });
  const restored = await waitFor(second, (candidate) => candidate.ready, "wrong-only second-device restore");
  assert.equal(second.localStorage.getItem(RETRY_QUEUE_KEY), initialRaw);
  assert.equal(restored.localSummary.wrongCount, 2);

  source.window.navigator.onLine = false;
  source.window.dispatchEvent({ type: "offline" });
  second.window.navigator.onLine = false;
  second.window.dispatchEvent({ type: "offline" });
  // The correct first answer is removed from the live Wrong list while its
  // checked result stays in the frozen, resumable Wrong Quiz session.
  const updatedQueue = { ...initialQueue, wrongQuestionIds: [SECOND_QUESTION_ID] };
  const updatedRaw = JSON.stringify(updatedQueue);
  const frozenSessionRaw = JSON.stringify({
    ...JSON.parse(SAMPLE_SESSION_RAW),
    mode: "quiz", scope: "wrong", importantOnly: false,
    rangeStart: 1, rangeEnd: 2, rangePoolSize: 2,
    rangePoolQuestionIds: initialQueue.wrongQuestionIds,
    rangeQuestionIds: initialQueue.wrongQuestionIds,
    questionIds: initialQueue.wrongQuestionIds,
    optionOrders: [[0, 1, 2, 3], [0, 1, 2, 3]],
    answerHistory: [[1, true], null],
    learnVisitedQuestionIds: null, learnReviewCountedQuestionIds: null,
    currentIndex: 0, selectedIndex: 1, submitted: true, score: 1
  });
  second.localStorage.setItem(RETRY_QUEUE_KEY, updatedRaw);
  second.localStorage.setItem(ACTIVE_SESSION_KEY, frozenSessionRaw);
  second.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  second.window.PPSC_CLOUD.notifyLocalChange(ACTIVE_SESSION_KEY);
  assert.equal(second.window.PPSC_CLOUD.getStatus().phase, "offline");
  assert.equal(rawCloudValue(store, "retry-queue"), initialRaw);

  second.window.navigator.onLine = true;
  second.window.dispatchEvent({ type: "online" });
  await waitFor(second, (candidate) => candidate.phase === "synced"
    && rawCloudValue(store, "retry-queue") === updatedRaw,
  "offline wrong-answer removal upload", 3000);
  source.window.navigator.onLine = true;
  source.window.dispatchEvent({ type: "online" });
  await waitFor(source, () => source.window.location.reloadCalled, "Wrong Quiz removal remote pull", 3000);
  assert.equal(source.localStorage.getItem(RETRY_QUEUE_KEY), updatedRaw);
  assert.equal(source.localStorage.getItem(ACTIVE_SESSION_KEY), frozenSessionRaw);
  const pulledQueue = JSON.parse(source.localStorage.getItem(RETRY_QUEUE_KEY));
  assert.deepEqual(pulledQueue.wrongQuestionIds, [SECOND_QUESTION_ID], "removed Wrong IDs must not resurrect on another device");
  assert.deepEqual({ ...pulledQueue, wrongQuestionIds: initialQueue.wrongQuestionIds }, initialQueue,
    "Wrong membership changes must preserve all unrelated retry state and the OFF preference");
  assert.deepEqual(JSON.parse(frozenSessionRaw).questionIds, initialQueue.wrongQuestionIds,
    "active Wrong Quiz must retain its frozen round including an already-correct question");

  const conflict = createBrowser({ store: cloneStore(store), local: { [RETRY_QUEUE_KEY]: initialRaw } });
  await waitFor(conflict, (candidate) => candidate.phase === "conflict", "Wrong Quiz-only local conflict");
  assert.equal(conflict.localStorage.getItem(RETRY_QUEUE_KEY), initialRaw,
    "Wrong Quiz-only local progress must not be silently replaced");
  await conflict.window.PPSC_CLOUD.chooseCloud();
  await waitFor(conflict, (candidate) => candidate.phase === "synced", "Wrong Quiz conflict choice");
  assert.equal(JSON.parse(conflict.localStorage.getItem(CONFLICT_BACKUP_KEY)).values[RETRY_QUEUE_KEY], initialRaw,
    "replaced Wrong Quiz-only progress must remain in the local conflict backup");
}

async function testConflictWaitsForChoice(seedStore) {
  const cloudQueue = rawCloudValue(seedStore, "retry-queue");
  const localQueue = JSON.stringify({
    version: 1,
    bankSignature: BANK_SIGNATURE,
    countBaselineVersion: 1,
    embeddedCadenceVersion: 2,
    practiceStep: 0,
    nextQuizReviewStep: 5,
    nextSequence: 2,
    items: [{ questionId: SECOND_QUESTION_ID, remaining: 5, dueStep: 0, sequence: 1 }],
    activeAttempt: null
  });
  const browser = createBrowser({
    store: seedStore,
    local: { [RETRY_QUEUE_KEY]: localQueue }
  });
  const status = await waitFor(browser, (candidate) => candidate.phase === "conflict", "progress conflict");
  assert.equal(status.ready, false);
  assert.equal(status.decision, "device-or-cloud");
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), localQueue, "local data must remain untouched before choice");
  assert.equal(rawCloudValue(seedStore, "retry-queue"), cloudQueue, "cloud data must remain untouched before choice");

  browser.window.PPSC_CLOUD.chooseCloud();
  await waitFor(browser, (candidate) => candidate.phase === "synced", "cloud conflict choice");
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), cloudQueue);
  const backup = JSON.parse(browser.localStorage.getItem(CONFLICT_BACKUP_KEY));
  assert.equal(backup.values[RETRY_QUEUE_KEY], localQueue, "the replaced device copy must remain in a local safety backup");
  assert.equal(readyEventMode(browser), "cloud-chosen");
}

async function testAllowedEmailIsEnforcedBeforeFirestore() {
  const wrongUser = {
    uid: "wrong-uid",
    email: "someone@example.com",
    emailVerified: true,
    displayName: "Wrong User"
  };
  const browser = createBrowser({ store: new Map(), local: legacyLocalProgress(), user: wrongUser });
  const status = await waitFor(browser, (candidate) => candidate.phase === "unauthorized", "unauthorized sign-out");
  assert.equal(status.ready, false);
  assert.equal(status.user, null);
  assert.match(status.error, /not allowed/i);
  assert.equal(browser.fake.metrics.signOuts, 1);
  assert.equal(browser.fake.metrics.firestoreReads, 0, "wrong account must be rejected before any progress read");
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);
}

async function testStaleRevisionCannotOverwriteCloud(seedStore) {
  const originalManifest = clone(seedStore.get(slotPath("retry-queue")));
  const originalCloudQueue = rawCloudValue(seedStore, "retry-queue");
  const localQueue = JSON.stringify({
    version: 1,
    bankSignature: BANK_SIGNATURE,
    countBaselineVersion: 1,
    embeddedCadenceVersion: 2,
    practiceStep: 0,
    nextQuizReviewStep: 5,
    nextSequence: 2,
    items: [{ questionId: SECOND_QUESTION_ID, remaining: 99, dueStep: 0, sequence: 1 }],
    activeAttempt: null
  });
  const browser = createBrowser({
    store: seedStore,
    local: { [RETRY_QUEUE_KEY]: localQueue }
  });
  await waitFor(browser, (candidate) => candidate.phase === "conflict", "stale-revision setup");

  const externallyUpdatedMeta = clone(seedStore.get(metaPath()));
  externallyUpdatedMeta.revision += 1;
  externallyUpdatedMeta.lastWriter = "other-device";
  seedStore.set(metaPath(), externallyUpdatedMeta);

  await browser.window.PPSC_CLOUD.chooseLocal();
  const status = await waitFor(browser, (candidate) => candidate.phase === "error", "stale revision rejection");
  assert.equal(status.ready, false);
  assert.match(`${status.message} ${status.error}`, /changed on another device|refresh/i);
  assert.equal(seedStore.get(metaPath()).revision, 2);
  assert.deepEqual(seedStore.get(slotPath("retry-queue")), originalManifest);
  assert.equal(rawCloudValue(seedStore, "retry-queue"), originalCloudQueue);
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), localQueue, "failed upload must preserve browser data");
}

async function testLargeProgressUsesIntegrityCheckedChunks() {
  const largeQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 2, "x".repeat(730 * 1024));
  const store = new Map();
  const browser = createBrowser({ store, local: { [RETRY_QUEUE_KEY]: largeQueue } });
  await waitFor(browser, (candidate) => candidate.phase === "migration-choice", "large first-device choice");
  await browser.window.PPSC_CLOUD.chooseLocal();
  await waitFor(browser, (candidate) => candidate.phase === "synced", "large chunk upload", 3000);
  const manifest = store.get(slotPath("retry-queue"));
  assert.equal(manifest.inlineData, null);
  assert.ok(manifest.chunkCount >= 2, "large values must be split below Firestore's document limit");
  assert.equal(rawCloudValue(store, "retry-queue"), largeQueue);
}

async function testOfflineChangeSyncsWhenConnectionReturns(seedStore) {
  const store = cloneStore(seedStore);
  const browser = createBrowser({ store, local: {} });
  await waitFor(browser, (candidate) => candidate.ready, "offline test initial restore");
  const updatedQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 7);
  browser.window.navigator.onLine = false;
  browser.window.dispatchEvent({ type: "offline" });
  browser.localStorage.setItem(RETRY_QUEUE_KEY, updatedQueue);
  browser.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  assert.equal(browser.window.PPSC_CLOUD.getStatus().phase, "offline");
  assert.notEqual(rawCloudValue(store, "retry-queue"), updatedQueue);

  browser.window.navigator.onLine = true;
  browser.window.dispatchEvent({ type: "online" });
  await waitFor(
    browser,
    (candidate) => candidate.phase === "synced" && rawCloudValue(store, "retry-queue") === updatedQueue,
    "offline change upload after reconnect",
    3000
  );
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), updatedQueue);
}

async function testReconnectPullsRemoteOnlyChange(seedStore) {
  const store = cloneStore(seedStore);
  const first = createBrowser({ store, local: {} });
  const second = createBrowser({ store, local: {} });
  await waitFor(first, (candidate) => candidate.ready, "first reconnect device");
  await waitFor(second, (candidate) => candidate.ready, "second reconnect device");
  first.window.navigator.onLine = false;
  first.window.dispatchEvent({ type: "offline" });

  const remoteQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 8);
  second.localStorage.setItem(RETRY_QUEUE_KEY, remoteQueue);
  second.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  await waitFor(
    second,
    (candidate) => candidate.phase === "synced" && rawCloudValue(store, "retry-queue") === remoteQueue,
    "second-device cloud update",
    3000
  );

  first.window.navigator.onLine = true;
  first.window.dispatchEvent({ type: "online" });
  await waitFor(first, () => first.window.location.reloadCalled, "safe remote pull after reconnect", 3000);
  assert.equal(first.localStorage.getItem(RETRY_QUEUE_KEY), remoteQueue);
}

async function testCategorySessionsRoundTripAndOfflineResume() {
  const store = new Map();
  const first = createBrowser({ store, local: { [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW } });
  const migration = await waitFor(first, (status) => status.phase === "migration-choice", "archive-only progress migration");
  assert.equal(migration.localSummary.hasProgress, true, "an archive alone is valuable progress");
  assert.equal(migration.localSummary.categorySessionCount, 2);
  await first.window.PPSC_CLOUD.chooseLocal();
  await waitFor(first, (status) => status.ready, "archive first upload");
  assert.equal(rawCloudValue(store, "category-sessions"), SAMPLE_CATEGORY_SESSIONS_RAW);

  const second = createBrowser({ store });
  await waitFor(second, (status) => status.ready, "archive empty-device restore");
  assert.equal(second.localStorage.getItem(CATEGORY_SESSIONS_KEY), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(second.window.PPSC_CLOUD.getStatus().cloudSummary.categorySessionCount, 2);
  assert.equal(second.localStorage.getItem(ACTIVE_SESSION_KEY), null);

  first.window.navigator.onLine = false;
  first.window.dispatchEvent({ type: "offline" });
  const updated = JSON.parse(SAMPLE_CATEGORY_SESSIONS_RAW);
  delete updated.sessions["general-knowledge:learn:difficult:all:all"];
  updated.sessions["general-knowledge:quiz:all:all:all"].submitted = true;
  updated.sessions["general-knowledge:quiz:all:all:all"].score = 2;
  updated.sessions["general-knowledge:quiz:all:all:all"].savedAt = 3;
  const updatedRaw = JSON.stringify(updated);
  first.window.PPSC_CLOUD.storage.setItem(CATEGORY_SESSIONS_KEY, updatedRaw);
  first.window.PPSC_CLOUD.notifyLocalChange(CATEGORY_SESSIONS_KEY);
  assert.equal(first.window.PPSC_CLOUD.getStatus().phase, "offline");
  assert.equal(rawCloudValue(store, "category-sessions"), SAMPLE_CATEGORY_SESSIONS_RAW);
  first.window.navigator.onLine = true;
  first.window.dispatchEvent({ type: "online" });
  await waitFor(first, (status) => status.phase === "synced"
    && rawCloudValue(store, "category-sessions") === updatedRaw, "archive offline upload", 3000);

  second.window.dispatchEvent({ type: "online" });
  await waitFor(second, () => second.window.location.reloadCalled, "archive remote-only reconnect reload", 3000);
  assert.equal(second.localStorage.getItem(CATEGORY_SESSIONS_KEY), updatedRaw);
  const reloaded = createBrowser({ store, local: Object.fromEntries(second.localStorage.values) });
  await waitFor(reloaded, (status) => status.ready, "archive reload resumes exact saved state");
  assert.equal(reloaded.localStorage.getItem(CATEGORY_SESSIONS_KEY), updatedRaw);
  assert.equal(Object.keys(JSON.parse(updatedRaw).sessions).length, 1, "completed Learn must not be resurrected");

  // Writing another known slot must not replace the untouched archive document.
  const archiveManifest = clone(store.get(slotPath("category-sessions")));
  reloaded.localStorage.setItem(RETRY_QUEUE_KEY, LEGACY_TWO_REVIEW_QUEUE_RAW);
  reloaded.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  await waitFor(reloaded, (status) => status.phase === "synced"
    && rawCloudValue(store, "retry-queue") === LEGACY_TWO_REVIEW_QUEUE_RAW, "queue-only slot upload", 3000);
  assert.deepEqual(store.get(slotPath("category-sessions")), archiveManifest);
  assert.equal(rawCloudValue(store, "category-sessions"), updatedRaw);
}

async function testLegacyThreeSlotCloudUpgradesWithoutLoss(seedStore) {
  const legacyStore = cloneStore(seedStore);
  legacyStore.delete(slotPath("category-sessions"));
  assert.equal(legacyStore.size, 4, "legacy fixture must contain only metadata and the original three slot documents");
  const restored = createBrowser({ store: cloneStore(legacyStore) });
  await waitFor(restored, (status) => status.ready, "three-slot cloud remains readable");
  assertOwnerValues(restored, legacyLocalProgress());
  assert.equal(restored.localStorage.getItem(CATEGORY_SESSIONS_KEY), null);

  const local = { ...legacyLocalProgress(), [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW };
  const upgrade = createBrowser({ store: legacyStore, local });
  await waitFor(upgrade, (status) => status.ready
    && legacyStore.has(slotPath("category-sessions"))
    && rawCloudValue(legacyStore, "category-sessions") === SAMPLE_CATEGORY_SESSIONS_RAW,
  "one-sided archive uploads without conflict or loss", 3000);
  assertOwnerValues(upgrade, local);
  assert.equal(readyEventMode(upgrade), "category-sessions-upgraded");

  const missingLocal = createBrowser({ store: legacyStore, local: legacyLocalProgress() });
  await waitFor(missingLocal, (status) => status.ready, "older device receives the existing archive");
  assertOwnerValues(missingLocal, local);
  assert.equal(missingLocal.fake.metrics.transactions, 0, "receiving an archive must not rewrite cloud progress");

  const brokenStore = cloneStore(legacyStore);
  brokenStore.delete(slotPath("retry-queue"));
  const broken = createBrowser({ store: brokenStore, local });
  await waitFor(broken, (status) => status.phase === "error", "required legacy manifest still fails closed");
  assert.equal(broken.window.PPSC_CLOUD.getStatus().ready, false);
  assert.match(broken.window.PPSC_CLOUD.getStatus().error, /manifest is missing/i);
  assertOwnerValues(broken, local);
  assert.equal(broken.fake.metrics.transactions, 0);
}

async function testCategorySessionsChoicesPreserveMissingButNotExplicitEmpty(seedStore) {
  const oldCloud = cloneStore(seedStore);
  oldCloud.delete(slotPath("category-sessions"));
  const local = {
    ...legacyLocalProgress(), [RETRY_QUEUE_KEY]: retryQueueRaw(SECOND_QUESTION_ID, 9),
    [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW
  };
  const cloudChoice = createBrowser({ store: oldCloud, local });
  await waitFor(cloudChoice, (status) => status.phase === "conflict", "old-cloud choice keeps independent local archive");
  await cloudChoice.window.PPSC_CLOUD.chooseCloud();
  await waitFor(cloudChoice, (status) => status.ready && oldCloud.has(slotPath("category-sessions"))
    && rawCloudValue(oldCloud, "category-sessions") === SAMPLE_CATEGORY_SESSIONS_RAW, "old-cloud choice archive follow-up", 3000);
  assert.equal(cloudChoice.localStorage.getItem(RETRY_QUEUE_KEY), LEGACY_TWO_REVIEW_QUEUE_RAW);
  assert.equal(cloudChoice.localStorage.getItem(CATEGORY_SESSIONS_KEY), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(JSON.parse(cloudChoice.localStorage.getItem(CONFLICT_BACKUP_KEY)).values[RETRY_QUEUE_KEY], local[RETRY_QUEUE_KEY]);

  const localChoice = createBrowser({ store: oldCloud,
    local: { ...legacyLocalProgress(), [RETRY_QUEUE_KEY]: retryQueueRaw(SECOND_QUESTION_ID, 11) } });
  await waitFor(localChoice, (status) => status.phase === "conflict", "older local-device choice");
  await localChoice.window.PPSC_CLOUD.chooseLocal();
  await waitFor(localChoice, (status) => status.ready, "older local-device choice retains cloud archive");
  assert.equal(localChoice.localStorage.getItem(CATEGORY_SESSIONS_KEY), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(rawCloudValue(oldCloud, "category-sessions"), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(rawCloudValue(oldCloud, "retry-queue"), retryQueueRaw(SECOND_QUESTION_ID, 11));

  const emptyArchive = JSON.stringify({ version: 1, sessions: {} });
  localChoice.localStorage.setItem(CATEGORY_SESSIONS_KEY, emptyArchive);
  localChoice.window.PPSC_CLOUD.notifyLocalChange(CATEGORY_SESSIONS_KEY);
  await waitFor(localChoice, (status) => status.phase === "synced"
    && rawCloudValue(oldCloud, "category-sessions") === emptyArchive, "explicit completed archive uploads", 3000);
  const stale = createBrowser({ store: oldCloud, local: {
    ...Object.fromEntries(localChoice.localStorage.values), [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW
  } });
  await waitFor(stale, (status) => status.phase === "conflict", "non-null conflicting archive requires choice");
  assert.equal(stale.localStorage.getItem(CATEGORY_SESSIONS_KEY), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(rawCloudValue(oldCloud, "category-sessions"), emptyArchive);
  await stale.window.PPSC_CLOUD.chooseCloud();
  await waitFor(stale, (status) => status.ready, "explicit empty archive remains authoritative");
  assert.equal(stale.localStorage.getItem(CATEGORY_SESSIONS_KEY), emptyArchive);
  assert.equal(rawCloudValue(oldCloud, "category-sessions"), emptyArchive);
  assert.equal(JSON.parse(stale.localStorage.getItem(CONFLICT_BACKUP_KEY)).values[CATEGORY_SESSIONS_KEY], SAMPLE_CATEGORY_SESSIONS_RAW);
}

async function testCategorySessionsConcurrentConflictAndChunks() {
  const store = new Map();
  const initial = createBrowser({ store, local: { [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW } });
  await waitFor(initial, (status) => status.phase === "migration-choice", "archive conflict seed");
  await initial.window.PPSC_CLOUD.chooseLocal();
  await waitFor(initial, (status) => status.ready, "archive conflict seed ready");
  const other = createBrowser({ store });
  await waitFor(other, (status) => status.ready, "archive conflict second device");
  initial.window.navigator.onLine = false;
  initial.window.dispatchEvent({ type: "offline" });
  const localValue = JSON.stringify({ ...JSON.parse(SAMPLE_CATEGORY_SESSIONS_RAW), localEdit: true });
  initial.localStorage.setItem(CATEGORY_SESSIONS_KEY, localValue);
  initial.window.PPSC_CLOUD.notifyLocalChange(CATEGORY_SESSIONS_KEY);
  const remoteValue = JSON.stringify({ version: 1, sessions: {} });
  other.localStorage.setItem(CATEGORY_SESSIONS_KEY, remoteValue);
  other.window.PPSC_CLOUD.notifyLocalChange(CATEGORY_SESSIONS_KEY);
  await waitFor(other, (status) => status.phase === "synced"
    && rawCloudValue(store, "category-sessions") === remoteValue, "remote archive completion", 3000);
  initial.window.navigator.onLine = true;
  initial.window.dispatchEvent({ type: "online" });
  await waitFor(initial, (status) => status.phase === "error", "two offline archives must not silently overwrite", 3000);
  assert.equal(initial.localStorage.getItem(CATEGORY_SESSIONS_KEY), localValue);
  assert.equal(rawCloudValue(store, "category-sessions"), remoteValue);
  assert.equal(initial.window.location.reloadCalled, false);

  const largeRaw = JSON.stringify({ ...JSON.parse(SAMPLE_CATEGORY_SESSIONS_RAW), transportPadding: "x".repeat(730 * 1024) });
  const largeStore = new Map();
  const large = createBrowser({ store: largeStore, local: { [CATEGORY_SESSIONS_KEY]: largeRaw } });
  await waitFor(large, (status) => status.phase === "migration-choice", "large archive migration");
  await large.window.PPSC_CLOUD.chooseLocal();
  await waitFor(large, (status) => status.ready, "large archive chunk upload", 3000);
  assert.ok(largeStore.get(slotPath("category-sessions")).chunkCount >= 2);
  assert.equal(rawCloudValue(largeStore, "category-sessions"), largeRaw);
  const restored = createBrowser({ store: largeStore });
  await waitFor(restored, (status) => status.ready, "large archive integrity checked restore", 3000);
  assert.equal(restored.localStorage.getItem(CATEGORY_SESSIONS_KEY), largeRaw);
}

async function testFirstUploadQueuesBaselineMigrationFollowUp() {
  const store = new Map();
  const browser = createBrowser({ store, local: legacyLocalProgress() });
  await waitFor(browser, (candidate) => candidate.phase === "migration-choice", "concurrent first upload setup");
  const newestQueue = BASELINED_FIVE_REVIEW_QUEUE_RAW;
  browser.fake.controls.beforeTransaction = async () => {
    browser.localStorage.setItem(RETRY_QUEUE_KEY, newestQueue);
  };
  await browser.window.PPSC_CLOUD.chooseLocal();
  await waitFor(
    browser,
    (candidate) => candidate.phase === "synced" && rawCloudValue(store, "retry-queue") === newestQueue,
    "concurrent local change follow-up sync",
    3000
  );
  assert.equal(browser.localStorage.getItem(RETRY_QUEUE_KEY), newestQueue);
  assert.equal(store.get(metaPath()).revision, 2);
  const uploadedQueue = JSON.parse(rawCloudValue(store, "retry-queue"));
  assert.equal(uploadedQueue.countBaselineVersion, 1);
  assert.equal(uploadedQueue.embeddedCadenceVersion, 2);
  assert.equal(uploadedQueue.items[0].remaining, 5);
}

async function testEquivalentConcurrentBaselineSyncConflictReconciles(seedStore) {
  const store = cloneStore(seedStore);
  const loser = createBrowser({ store, local: {} });
  const winner = createBrowser({ store, local: {} });
  await waitFor(loser, (candidate) => candidate.ready, "race loser initial restore");
  await waitFor(winner, (candidate) => candidate.ready, "race winner initial restore");

  const sameFinalQueue = BASELINED_FIVE_REVIEW_QUEUE_RAW;
  loser.localStorage.setItem(RETRY_QUEUE_KEY, sameFinalQueue);
  winner.localStorage.setItem(RETRY_QUEUE_KEY, sameFinalQueue);

  let releaseLosingTransaction;
  const losingTransactionGate = new Promise((resolve) => {
    releaseLosingTransaction = resolve;
  });
  loser.fake.controls.beforeTransaction = () => losingTransactionGate;
  loser.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  await waitFor(
    loser,
    () => loser.fake.metrics.transactions === 1,
    "losing transaction to reach its race gate",
    3000
  );

  winner.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  await waitFor(
    winner,
    (candidate) => candidate.phase === "synced"
      && candidate.revision === 2
      && rawCloudValue(store, "retry-queue") === sameFinalQueue,
    "winning equivalent update",
    3000
  );

  releaseLosingTransaction();
  const reconciled = await waitFor(
    loser,
    (candidate) => candidate.phase === "synced"
      && candidate.ready
      && candidate.revision === 2
      && readyEventMode(loser) === "equivalent-background-sync",
    "equivalent losing update reconciliation",
    3000
  );
  assert.equal(reconciled.error, "");
  assert.equal(loser.localStorage.getItem(RETRY_QUEUE_KEY), sameFinalQueue);
  assert.equal(rawCloudValue(store, "retry-queue"), sameFinalQueue);
  const reconciledQueue = JSON.parse(rawCloudValue(store, "retry-queue"));
  assert.equal(reconciledQueue.countBaselineVersion, 1);
  assert.equal(reconciledQueue.embeddedCadenceVersion, 2);
  assert.equal(reconciledQueue.items[0].remaining, 5);

  const followUpQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 7);
  loser.localStorage.setItem(RETRY_QUEUE_KEY, followUpQueue);
  loser.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  await waitFor(
    loser,
    (candidate) => candidate.phase === "synced"
      && candidate.revision === 3
      && rawCloudValue(store, "retry-queue") === followUpQueue,
    "post-reconciliation sync proving the loser was not paused",
    3000
  );
}

function guestKey(key) {
  return key.replace("ppsc-prep:", "ppsc-prep:guest:");
}

function assertGuestReady(browser) {
  const status = browser.window.PPSC_CLOUD.getStatus();
  assert.equal(status.phase, "guest-ready");
  assert.equal(status.ready, true);
  assert.equal(status.authRequired, false);
  assert.equal(status.user, null, "guest access must not expose an authenticated owner's identity");
  assert.equal(status.error, "");
  assert.equal(browser.window.PPSC_CLOUD_READY, true);
  assert.equal(browser.document.documentElement.classList.contains("auth-pending"), false);
}

function assertOwnerValues(browser, original) {
  for (const key of [ACTIVE_SESSION_KEY, RETRY_QUEUE_KEY, DIFFICULT_IDS_KEY, CATEGORY_SESSIONS_KEY]) {
    assert.equal(browser.localStorage.getItem(key), original[key] || null, `${key} must remain unchanged`);
  }
}

async function settleGuestCallbacks() {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

async function testGuestStorageIsolationAndReconnect() {
  const original = { ...legacyLocalProgress(), [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW };
  const browser = createBrowser({ local: original, user: null });
  await waitFor(browser, (candidate) => candidate.phase === "auth-required", "guest entry from sign-in screen");
  await browser.window.PPSC_CLOUD.continueAsGuest();
  assertGuestReady(browser);
  assert.equal(browser.sessionStorage.getItem(ACCESS_MODE_KEY), "guest");
  assert.equal(readyEventMode(browser), "guest");
  const storage = browser.window.PPSC_CLOUD.storage;
  assert.ok(storage, "the application must use the owner/guest-isolating storage facade");

  for (const key of [ACTIVE_SESSION_KEY, RETRY_QUEUE_KEY, DIFFICULT_IDS_KEY, CATEGORY_SESSIONS_KEY]) {
    assert.equal(storage.getItem(key), null, "a guest must not inherit the owner's saved progress");
    storage.setItem(key, `guest:${original[key]}`);
    assert.equal(storage.getItem(key), `guest:${original[key]}`);
    assert.equal(browser.localStorage.getItem(guestKey(key)), `guest:${original[key]}`);
    browser.window.PPSC_CLOUD.notifyLocalChange(key);
  }
  storage.removeItem(DIFFICULT_IDS_KEY);
  assert.equal(storage.getItem(DIFFICULT_IDS_KEY), null);
  assert.equal(browser.localStorage.getItem(guestKey(DIFFICULT_IDS_KEY)), null);
  assertOwnerValues(browser, original);

  const readsBefore = browser.fake.metrics.firestoreReads;
  browser.window.navigator.onLine = false;
  browser.window.dispatchEvent({ type: "offline" });
  storage.setItem(RETRY_QUEUE_KEY, retryQueueRaw(SECOND_QUESTION_ID, 4));
  browser.window.PPSC_CLOUD.notifyLocalChange(RETRY_QUEUE_KEY);
  browser.window.navigator.onLine = true;
  browser.window.dispatchEvent({ type: "online" });
  // Longer than the normal sync debounce: guest progress must not upload later.
  await new Promise((resolve) => setTimeout(resolve, 750));
  assertGuestReady(browser);
  assertOwnerValues(browser, original);
  assert.equal(browser.fake.metrics.firestoreReads, readsBefore, "guest reconnect must not read Firestore");
  assert.equal(browser.fake.metrics.batchCommits, 0);
  assert.equal(browser.fake.metrics.transactions, 0);
  assert.equal(browser.store.size, 0);
}

async function testRememberedGuestStartsWithoutSdkOrConfig() {
  const original = { ...legacyLocalProgress(), [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW };
  const guestQueue = retryQueueRaw(SECOND_QUESTION_ID, 7);
  const local = {
    ...original,
    [guestKey(ACTIVE_SESSION_KEY)]: SAMPLE_SESSION_RAW,
    [guestKey(RETRY_QUEUE_KEY)]: guestQueue,
    [guestKey(DIFFICULT_IDS_KEY)]: SAMPLE_DIFFICULT_RAW,
    [guestKey(CATEGORY_SESSIONS_KEY)]: JSON.stringify({ version: 1, sessions: {} })
  };
  const browser = createBrowser({
    local,
    session: { [ACCESS_MODE_KEY]: "guest" },
    injectSdk: false,
    omitConfig: true
  });
  await waitFor(browser, (candidate) => candidate.phase === "guest-ready", "remembered guest without Firebase");
  assertGuestReady(browser);
  assert.equal(browser.window.__PPSC_TEST_SDK_LOADS__ || 0, 0, "guest reload must bypass SDK loading entirely");
  assert.equal(browser.window.PPSC_CLOUD.storage.getItem(RETRY_QUEUE_KEY), guestQueue);
  assert.equal(browser.window.PPSC_CLOUD.storage.getItem(CATEGORY_SESSIONS_KEY), local[guestKey(CATEGORY_SESSIONS_KEY)]);
  assertOwnerValues(browser, original);
  assert.equal(browser.fake.metrics.firestoreReads, 0);
  assert.equal(browser.fake.metrics.batchCommits, 0);
  assert.equal(browser.fake.metrics.transactions, 0);
}

async function testGuestChoiceOutlivesDelayedSdk() {
  for (const rejectSdk of [false, true]) {
    const original = legacyLocalProgress();
    const browser = createBrowser({ local: original, deferSdk: true });
    assert.equal(browser.window.__PPSC_TEST_SDK_LOADS__, 1);
    await browser.window.PPSC_CLOUD.continueAsGuest();
    assertGuestReady(browser);
    if (rejectSdk) browser.sdkGate.reject(new Error("late SDK download failure"));
    else browser.sdkGate.resolve(browser.fake.sdk);
    await settleGuestCallbacks();
    assertGuestReady(browser);
    assertOwnerValues(browser, original);
    assert.equal(browser.fake.metrics.firestoreReads, 0, "SDK completion must not start cloud access after guest choice");
    assert.equal(browser.fake.metrics.transactions, 0);
    assert.equal(browser.fake.metrics.batchCommits, 0);
  }
}

async function testGuestChoiceOutlivesDelayedAuthCallbacks() {
  const original = legacyLocalProgress();
  const browser = createBrowser({ local: original, user: null, deferInitialAuth: true });
  await waitFor(browser, () => browser.fake.auth.observers.length === 1, "held authentication callback");
  const pendingObserver = browser.fake.auth.observers[0];
  await browser.window.PPSC_CLOUD.continueAsGuest();
  // These callbacks were already queued before unsubscribe and may still arrive.
  pendingObserver.next(allowedUser());
  await settleGuestCallbacks();
  pendingObserver.error(new Error("late authentication failure"));
  await settleGuestCallbacks();
  assertGuestReady(browser);
  assertOwnerValues(browser, original);
  assert.equal(browser.fake.metrics.firestoreReads, 0);
  assert.equal(browser.fake.metrics.transactions, 0);
  assert.equal(browser.fake.metrics.batchCommits, 0);
}

async function testGuestChoiceOutlivesDelayedCloudRead(seedStore) {
  for (const rejectRead of [false, true]) {
    const gate = deferred();
    const original = legacyLocalProgress();
    const store = cloneStore(seedStore);
    const cloudBefore = cloneStore(store);
    const browser = createBrowser({
      local: original,
      store,
      setupFirebase(fake) { fake.controls.beforeRead = () => gate.promise; }
    });
    await waitFor(browser, () => browser.fake.metrics.firestoreReads === 1, "held cloud read before guest selection");
    await browser.window.PPSC_CLOUD.continueAsGuest();
    const guestQueue = retryQueueRaw(SECOND_QUESTION_ID, 9);
    browser.window.PPSC_CLOUD.storage.setItem(RETRY_QUEUE_KEY, guestQueue);
    if (rejectRead) gate.reject(new Error("late Firestore permission failure"));
    else gate.resolve();
    await settleGuestCallbacks();
    assertGuestReady(browser);
    assertOwnerValues(browser, original);
    assert.equal(browser.window.PPSC_CLOUD.storage.getItem(RETRY_QUEUE_KEY), guestQueue);
    assert.equal(browser.fake.metrics.firestoreReads, 1, "an obsolete read must not trigger more Firestore reads");
    assert.equal(browser.fake.metrics.transactions, 0);
    assert.equal(browser.fake.metrics.batchCommits, 0);
    assert.deepEqual(store, cloudBefore);
  }
}

async function testGuestSignInReloadDoesNotMergeProgress() {
  const original = { ...legacyLocalProgress(), [CATEGORY_SESSIONS_KEY]: SAMPLE_CATEGORY_SESSIONS_RAW };
  const local = {
    ...original,
    [guestKey(ACTIVE_SESSION_KEY)]: SAMPLE_SESSION_RAW,
    [guestKey(RETRY_QUEUE_KEY)]: retryQueueRaw(SECOND_QUESTION_ID, 6),
    [guestKey(DIFFICULT_IDS_KEY)]: SAMPLE_DIFFICULT_RAW,
    [guestKey(CATEGORY_SESSIONS_KEY)]: JSON.stringify({ version: 1, sessions: {} })
  };
  const browser = createBrowser({ local, session: { [ACCESS_MODE_KEY]: "guest" } });
  await waitFor(browser, (candidate) => candidate.phase === "guest-ready", "guest before sign-in reload");
  const before = Array.from(browser.localStorage.values.entries());
  await browser.window.PPSC_CLOUD.leaveGuest();
  assert.equal(browser.sessionStorage.getItem(ACCESS_MODE_KEY), null);
  assert.equal(browser.window.location.reloadCalled, true, "switching namespaces requires a clean app initialization");
  assert.deepEqual(Array.from(browser.localStorage.values.entries()), before, "sign-in switch must not merge or erase guest/owner progress");
  assert.equal(browser.fake.metrics.firestoreReads, 0);
  assert.equal(browser.fake.metrics.transactions, 0);
  assert.equal(browser.fake.metrics.batchCommits, 0);

  const reloaded = createBrowser({
    local: Object.fromEntries(browser.localStorage.values),
    session: Object.fromEntries(browser.sessionStorage.values),
    user: null
  });
  await waitFor(reloaded, (candidate) => candidate.phase === "auth-required", "normal sign-in screen after leaving guest");
  assert.equal(reloaded.window.PPSC_CLOUD.storage.getItem(RETRY_QUEUE_KEY), original[RETRY_QUEUE_KEY]);
  assert.equal(reloaded.localStorage.getItem(guestKey(RETRY_QUEUE_KEY)), local[guestKey(RETRY_QUEUE_KEY)]);
  assert.equal(reloaded.window.PPSC_CLOUD.storage.getItem(CATEGORY_SESSIONS_KEY), SAMPLE_CATEGORY_SESSIONS_RAW);
  assert.equal(reloaded.localStorage.getItem(guestKey(CATEGORY_SESSIONS_KEY)), local[guestKey(CATEGORY_SESSIONS_KEY)]);
  assertOwnerValues(reloaded, original);
}

async function testOwnerInitializedGuestSwitchRequiresReload(seedStore) {
  const browser = createBrowser({ store: cloneStore(seedStore) });
  await waitFor(browser, (candidate) => candidate.ready, "owner initialized before guest namespace switch");
  const readyEventsBefore = browser.window.events.filter((event) => event.type === "ppsc:cloud-ready").length;
  const ownerBefore = Object.fromEntries(browser.localStorage.values);
  // A signed-in owner cannot switch the running app to a different namespace.
  await browser.window.PPSC_CLOUD.continueAsGuest();
  assert.equal(browser.sessionStorage.getItem(ACCESS_MODE_KEY), null);
  assert.notEqual(browser.window.PPSC_CLOUD.getStatus().phase, "guest-ready");

  const authObserver = browser.fake.auth.observers[0];
  browser.fake.auth.currentUser = null;
  authObserver.next(null);
  await waitFor(browser, (candidate) => candidate.phase === "auth-required", "external owner sign-out");
  await browser.window.PPSC_CLOUD.continueAsGuest();
  assert.equal(browser.sessionStorage.getItem(ACCESS_MODE_KEY), "guest");
  assert.equal(browser.window.location.reloadCalled, true);
  assert.notEqual(browser.window.PPSC_CLOUD.getStatus().phase, "guest-ready", "an app already holding owner data cannot be revealed as guest");
  assert.equal(browser.window.events.filter((event) => event.type === "ppsc:cloud-ready").length, readyEventsBefore);
  assertOwnerValues(browser, ownerBefore);

  const reloaded = createBrowser({
    local: Object.fromEntries(browser.localStorage.values),
    session: Object.fromEntries(browser.sessionStorage.values),
    injectSdk: false
  });
  await waitFor(reloaded, (candidate) => candidate.phase === "guest-ready", "clean guest initialization after owner sign-out");
  assert.equal(reloaded.window.PPSC_CLOUD.storage.getItem(RETRY_QUEUE_KEY), null);
  assertOwnerValues(reloaded, ownerBefore);
}

async function testGuestWithUnavailableSessionStorage(seedStore) {
  const original = legacyLocalProgress();
  const fresh = createBrowser({ local: original, deferSdk: true });
  fresh.sessionStorage.setItem = () => { throw new Error("sessionStorage blocked"); };
  await fresh.window.PPSC_CLOUD.continueAsGuest();
  assertGuestReady(fresh);
  assertOwnerValues(fresh, original);
  fresh.sdkGate.resolve(fresh.fake.sdk);
  await settleGuestCallbacks();
  assertGuestReady(fresh);
  assert.equal(fresh.fake.metrics.firestoreReads, 0, "fresh guest use remains available in memory");

  const owner = createBrowser({ store: cloneStore(seedStore) });
  await waitFor(owner, (candidate) => candidate.ready, "owner ready before blocked namespace switch");
  const ownerBefore = Object.fromEntries(owner.localStorage.values);
  owner.fake.auth.currentUser = null;
  owner.fake.auth.observers[0].next(null);
  await waitFor(owner, (candidate) => candidate.phase === "auth-required", "owner signed out before blocked guest marker");
  owner.sessionStorage.setItem = () => { throw new Error("sessionStorage blocked"); };
  await owner.window.PPSC_CLOUD.continueAsGuest();
  assert.equal(owner.window.PPSC_CLOUD.getStatus().ready, false, "failed namespace reload marker must keep an initialized owner app locked");
  assert.notEqual(owner.window.PPSC_CLOUD.getStatus().phase, "guest-ready");
  assert.equal(owner.window.location.reloadCalled, false);
  assertOwnerValues(owner, ownerBefore);

  const guest = createBrowser({
    local: { ...original, [guestKey(RETRY_QUEUE_KEY)]: retryQueueRaw(SECOND_QUESTION_ID, 3) },
    session: { [ACCESS_MODE_KEY]: "guest" }
  });
  await waitFor(guest, (candidate) => candidate.phase === "guest-ready", "guest before blocked sign-in switch");
  const guestValuesBefore = Array.from(guest.localStorage.values.entries());
  guest.sessionStorage.removeItem = () => { throw new Error("sessionStorage removal blocked"); };
  await guest.window.PPSC_CLOUD.leaveGuest();
  const blockedExit = guest.window.PPSC_CLOUD.getStatus();
  assert.equal(blockedExit.phase, "guest-ready", "blocked mode change must not switch the active namespace");
  assert.equal(blockedExit.ready, true, "guest practice remains usable after a blocked sign-in switch");
  assert.equal(blockedExit.authRequired, false);
  assert.match(blockedExit.error, /blocked switching modes|new tab/i);
  assert.equal(guest.window.location.reloadCalled, false);
  assert.equal(guest.sessionStorage.getItem(ACCESS_MODE_KEY), "guest");
  assert.deepEqual(Array.from(guest.localStorage.values.entries()), guestValuesBefore);
  assert.equal(guest.fake.metrics.firestoreReads, 0);
  assert.equal(guest.fake.metrics.transactions, 0);
  assert.equal(guest.fake.metrics.batchCommits, 0);
}

async function testGuestCannotInterruptOwnerUpload() {
  const gate = deferred();
  const original = legacyLocalProgress();
  const browser = createBrowser({ local: original });
  await waitFor(browser, (candidate) => candidate.phase === "migration-choice", "owner upload before guest guard");
  browser.fake.controls.beforeTransaction = () => gate.promise;
  const upload = browser.window.PPSC_CLOUD.chooseLocal();
  await waitFor(browser, () => browser.fake.metrics.transactions === 1, "owner upload already in flight");
  await browser.window.PPSC_CLOUD.continueAsGuest();
  assert.equal(browser.sessionStorage.getItem(ACCESS_MODE_KEY), null, "guest selection cannot pretend to cancel a committed cloud-write operation");
  assert.notEqual(browser.window.PPSC_CLOUD.getStatus().phase, "guest-ready");
  assert.equal(browser.window.location.reloadCalled, false);
  gate.resolve();
  await upload;
  await waitFor(browser, (candidate) => candidate.phase === "synced", "owner upload completes under original identity");
  assertOwnerValues(browser, original);
  assert.equal(rawCloudValue(browser.store, "retry-queue"), original[RETRY_QUEUE_KEY]);
}

async function main() {
  assert.ok(fs.existsSync(SYNC_SOURCE_PATH), "firebase-sync.js is required");
  await testDevelopmentBypassNeedsNoSdk();
  const seedStore = await testFirstDeviceMigrationPreservesLegacyRemaining();
  await testEmptyFirstDeviceNeedsConfirmation();
  await testCloudRestoreOnEmptyLaptop(cloneStore(seedStore));
  await testRestoredLegacyQueueUploadsAppBaselineAndRestoresExactly(seedStore);
  await testDedicatedAttemptQueueRoundTrip();
  await testImportantPracticeRoundTrip();
  await testAlternatingPopupCadenceRoundTripAndOfflineReconnect();
  await testWrongQuizListRoundTripAndOfflineRemoval();
  await testRetiredSequentialStateRoundTrip();
  await testConflictWaitsForChoice(cloneStore(seedStore));
  await testAllowedEmailIsEnforcedBeforeFirestore();
  await testStaleRevisionCannotOverwriteCloud(cloneStore(seedStore));
  await testLargeProgressUsesIntegrityCheckedChunks();
  await testOfflineChangeSyncsWhenConnectionReturns(seedStore);
  await testReconnectPullsRemoteOnlyChange(seedStore);
  await testCategorySessionsRoundTripAndOfflineResume();
  await testLegacyThreeSlotCloudUpgradesWithoutLoss(seedStore);
  await testCategorySessionsChoicesPreserveMissingButNotExplicitEmpty(seedStore);
  await testCategorySessionsConcurrentConflictAndChunks();
  await testFirstUploadQueuesBaselineMigrationFollowUp();
  await testEquivalentConcurrentBaselineSyncConflictReconciles(seedStore);
  await testGuestStorageIsolationAndReconnect();
  await testRememberedGuestStartsWithoutSdkOrConfig();
  await testGuestChoiceOutlivesDelayedSdk();
  await testGuestChoiceOutlivesDelayedAuthCallbacks();
  await testGuestChoiceOutlivesDelayedCloudRead(seedStore);
  await testGuestSignInReloadDoesNotMergeProgress();
  await testOwnerInitializedGuestSwitchRequiresReload(seedStore);
  await testGuestWithUnavailableSessionStorage(seedStore);
  await testGuestCannotInterruptOwnerUpload();

  console.log(JSON.stringify({
    ok: true,
    scenarios: [
      "development bypass without Firebase SDK",
      "first-device migration waits for explicit upload",
      "empty first device cannot initialize or overwrite cloud progress",
      "empty laptop restores cloud progress",
      "a restored legacy queue uploads cadence marker=2/count=5 and restores exactly on a second device",
      "different local/cloud progress waits for owner choice",
      "unapproved Google account is rejected before Firestore",
      "legacy retry remaining=2 survives upload and restore",
      "dedicated retry attempt, per-category saved Queue cycle, wrong cooldown, cadence, and legacy spacing fields round-trip byte-for-byte",
      "permanent Important cadence, count-baseline marker, shuffled deck, and active attempt round-trip byte-for-byte",
      "alternating popup cadence version=4, ON/OFF preference, next kind, and shared countdown survive device restore and offline reconnect without changing finite counts, saved Queue round, or active answer",
      "Wrong Quiz-only IDs count as progress; offline correct-answer removal syncs without resurrecting IDs or changing the frozen active round and unrelated retry state",
      "retired Sequential gate stays off while legacy cursor fields and finite Queue reviews round-trip byte-for-byte",
      "stale revision cannot overwrite newer cloud progress",
      "large progress round-trips through integrity-checked chunks",
      "offline local changes upload when the connection returns",
      "remote-only reconnect changes pull safely before reload",
      "category Learn/Quiz snapshots round-trip byte-for-byte with answers, option order and position; offline completion uploads and remote-only reconnect reloads without resurrecting completed sessions",
      "legacy three-slot cloud backups remain readable; one-sided category archives upgrade without conflict while missing required manifests still fail closed",
      "explicit local/cloud choice preserves an archive absent from the older side, but existing empty archives and non-null conflicts remain authoritative with safety backups",
      "concurrent offline category-archive changes retain both copies for explicit choice, and large archives use integrity-checked chunks",
      "the cadence marker=2/count=5 baseline change during first upload is queued and synced",
      "equivalent concurrent marked-five baseline writes reconcile without pausing the losing client",
      "guest session, queue, and difficult marks use isolated browser keys and never read or write cloud data on reconnect",
      "remembered guest access restores guest-only progress without loading Firebase SDK or requiring configuration",
      "late Firebase SDK success and failure cannot relock or cloud-initialize guest access",
      "late authentication success and failure cannot replace or relock guest access",
      "late cloud read success and failure cannot replace guest/owner progress or start further cloud reads",
      "guest-to-Google sign-in reloads into owner storage without merging or removing either namespace",
      "owner-ready to signed-out to guest switches only after a clean reload, never exposing initialized owner data as guest",
      "blocked sessionStorage still permits a fresh in-memory guest but fails closed when owner state has already initialized",
      "guest selection is refused while an explicit owner upload is already in flight"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
