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
const CONFLICT_BACKUP_KEY = "ppsc-prep:cloud-conflict-backup:v1";
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
const LEGACY_TWO_REVIEW_QUEUE_RAW = JSON.stringify({
  version: 1,
  bankSignature: BANK_SIGNATURE,
  practiceStep: 0,
  nextSequence: 2,
  items: [{ questionId: SAMPLE_QUESTION_ID, remaining: 2, dueStep: 0, sequence: 1 }],
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

function createFirebaseSdk({ store, initialUser }) {
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
  const controls = { beforeTransaction: null };

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
      queueMicrotask(() => next(auth.currentUser));
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
    `${marker}\n    if (window.__PPSC_TEST_SDK__) return window.__PPSC_TEST_SDK__;`
  );
}

function createBrowser({
  protocol = "https:",
  hostname = "abdulnafa.github.io",
  local = {},
  store = new Map(),
  user = allowedUser(),
  injectSdk = true
} = {}) {
  const window = new MiniEventTarget();
  const document = createDocument();
  const localStorage = new MemoryStorage(local);
  const sessionStorage = new MemoryStorage();
  const fake = createFirebaseSdk({ store, initialUser: user });
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
  if (injectSdk) window.__PPSC_TEST_SDK__ = fake.sdk;

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

  return { window, document, localStorage, sessionStorage, store, fake };
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

function localProgress() {
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
    practiceStep: 0,
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
  const local = localProgress();
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

async function testConflictWaitsForChoice(seedStore) {
  const cloudQueue = rawCloudValue(seedStore, "retry-queue");
  const localQueue = JSON.stringify({
    version: 1,
    bankSignature: BANK_SIGNATURE,
    practiceStep: 0,
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
  const browser = createBrowser({ store: new Map(), local: localProgress(), user: wrongUser });
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
    practiceStep: 0,
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

async function testFirstUploadQueuesConcurrentLocalChange() {
  const store = new Map();
  const browser = createBrowser({ store, local: localProgress() });
  await waitFor(browser, (candidate) => candidate.phase === "migration-choice", "concurrent first upload setup");
  const newestQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 9);
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
}

async function testEquivalentConcurrentSyncConflictReconciles(seedStore) {
  const store = cloneStore(seedStore);
  const loser = createBrowser({ store, local: {} });
  const winner = createBrowser({ store, local: {} });
  await waitFor(loser, (candidate) => candidate.ready, "race loser initial restore");
  await waitFor(winner, (candidate) => candidate.ready, "race winner initial restore");

  const sameFinalQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 10);
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

  const followUpQueue = retryQueueRaw(SAMPLE_QUESTION_ID, 11);
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

async function main() {
  assert.ok(fs.existsSync(SYNC_SOURCE_PATH), "firebase-sync.js is required");
  await testDevelopmentBypassNeedsNoSdk();
  const seedStore = await testFirstDeviceMigrationPreservesLegacyRemaining();
  await testEmptyFirstDeviceNeedsConfirmation();
  await testCloudRestoreOnEmptyLaptop(cloneStore(seedStore));
  await testConflictWaitsForChoice(cloneStore(seedStore));
  await testAllowedEmailIsEnforcedBeforeFirestore();
  await testStaleRevisionCannotOverwriteCloud(cloneStore(seedStore));
  await testLargeProgressUsesIntegrityCheckedChunks();
  await testOfflineChangeSyncsWhenConnectionReturns(seedStore);
  await testReconnectPullsRemoteOnlyChange(seedStore);
  await testFirstUploadQueuesConcurrentLocalChange();
  await testEquivalentConcurrentSyncConflictReconciles(seedStore);

  console.log(JSON.stringify({
    ok: true,
    scenarios: [
      "development bypass without Firebase SDK",
      "first-device migration waits for explicit upload",
      "empty first device cannot initialize or overwrite cloud progress",
      "empty laptop restores cloud progress",
      "different local/cloud progress waits for owner choice",
      "unapproved Google account is rejected before Firestore",
      "legacy retry remaining=2 survives upload and restore",
      "stale revision cannot overwrite newer cloud progress",
      "large progress round-trips through integrity-checked chunks",
      "offline local changes upload when the connection returns",
      "remote-only reconnect changes pull safely before reload",
      "a local change during first upload is queued and synced",
      "equivalent concurrent writes reconcile without pausing the losing client"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
