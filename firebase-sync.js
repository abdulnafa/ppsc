(function (window, document) {
  "use strict";

  var STORAGE_SLOTS = Object.freeze([
    Object.freeze({ id: "active-session", key: "ppsc-prep:active-session:v1" }),
    Object.freeze({ id: "retry-queue", key: "ppsc-prep:retry-queue:v1" }),
    Object.freeze({ id: "difficult-questions", key: "ppsc-prep:difficult-question-ids:v1" })
  ]);
  var SLOT_BY_KEY = new Map(STORAGE_SLOTS.map(function (slot) { return [slot.key, slot]; }));
  var CLOUD_SCHEMA_VERSION = 1;
  var LOCAL_CONFLICT_BACKUP_KEY = "ppsc-prep:cloud-conflict-backup:v1";
  var MAX_INLINE_BYTES = 700 * 1024;
  var MAX_CHUNK_BYTES = 500 * 1024;
  var MAX_CHUNKS_PER_SLOT = 64;
  var SYNC_DEBOUNCE_MS = 650;
  var SDK_BASE_URL = "https://www.gstatic.com/firebasejs/12.18.0/";

  var config = window.PPSC_FIREBASE_CONFIG || null;
  var listeners = new Set();
  var status = {
    phase: "loading",
    ready: false,
    authRequired: !isDevelopmentRuntime(),
    message: "Preparing secure sign-in…",
    error: "",
    user: null,
    localSummary: null,
    cloudSummary: null,
    decision: null,
    revision: null
  };
  var runtime = {
    started: false,
    startPromise: null,
    sdk: null,
    auth: null,
    db: null,
    user: null,
    authSequence: 0,
    deniedEmail: "",
    pendingDecision: null,
    cloudRaw: emptyRawSnapshot(),
    cloudManifests: Object.create(null),
    knownRevision: null,
    syncTimer: null,
    reconnectTimer: null,
    pendingKeys: new Set(),
    syncChain: Promise.resolve(),
    syncPaused: false,
    retryDelay: 5000,
    uiBound: false,
    readySerial: 0
  };

  var api = Object.freeze({
    start: start,
    signIn: signIn,
    signOut: signOutUser,
    chooseLocal: chooseLocalProgress,
    chooseCloud: chooseCloudProgress,
    notifyLocalChange: notifyLocalChange,
    getStatus: getPublicStatus,
    subscribe: subscribe
  });
  window.PPSC_CLOUD = api;

  function isDevelopmentRuntime() {
    var hostname = String(window.location.hostname || "").toLowerCase();
    return window.location.protocol === "file:"
      || hostname === "localhost"
      || hostname === "127.0.0.1"
      || hostname === "[::1]"
      || hostname.endsWith(".localhost");
  }

  function emptyRawSnapshot() {
    var snapshot = Object.create(null);
    STORAGE_SLOTS.forEach(function (slot) { snapshot[slot.key] = null; });
    return snapshot;
  }

  function cloneRawSnapshot(snapshot) {
    var clone = emptyRawSnapshot();
    STORAGE_SLOTS.forEach(function (slot) {
      clone[slot.key] = typeof snapshot[slot.key] === "string" ? snapshot[slot.key] : null;
    });
    return clone;
  }

  function getPublicStatus() {
    return {
      phase: status.phase,
      ready: status.ready,
      authRequired: status.authRequired,
      message: status.message,
      error: status.error,
      user: status.user ? Object.assign({}, status.user) : null,
      localSummary: status.localSummary ? Object.assign({}, status.localSummary) : null,
      cloudSummary: status.cloudSummary ? Object.assign({}, status.cloudSummary) : null,
      decision: status.decision,
      revision: status.revision
    };
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return function () {};
    listeners.add(listener);
    listener(getPublicStatus());
    return function () { listeners.delete(listener); };
  }

  function updateStatus(changes) {
    Object.keys(changes || {}).forEach(function (key) { status[key] = changes[key]; });
    var publicStatus = getPublicStatus();
    renderStatus(publicStatus);
    listeners.forEach(function (listener) {
      try { listener(publicStatus); } catch (error) { /* A UI listener cannot stop sync. */ }
    });
    if (typeof window.CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("ppsc:cloud-status", { detail: publicStatus }));
    }
  }

  function emitReady(mode) {
    window.PPSC_CLOUD_READY = true;
    runtime.readySerial += 1;
    if (typeof window.CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent("ppsc:cloud-ready", {
      detail: {
        mode: mode,
        serial: runtime.readySerial,
        revision: runtime.knownRevision,
        user: status.user ? Object.assign({}, status.user) : null
      }
    }));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = Boolean(hidden);
  }

  function protectApp() {
    var protectedApp = byId("protected-app");
    var gate = byId("auth-gate");
    window.PPSC_CLOUD_READY = false;
    document.documentElement.classList.add("auth-pending");
    if (protectedApp) {
      protectedApp.hidden = true;
      protectedApp.inert = true;
      protectedApp.setAttribute("inert", "");
      protectedApp.setAttribute("aria-hidden", "true");
    }
    if (gate) {
      gate.hidden = false;
      gate.removeAttribute("aria-hidden");
    }
  }

  function revealApp() {
    var protectedApp = byId("protected-app");
    var gate = byId("auth-gate");
    document.documentElement.classList.remove("auth-pending");
    if (protectedApp) {
      protectedApp.hidden = false;
      protectedApp.inert = false;
      protectedApp.removeAttribute("inert");
      protectedApp.removeAttribute("aria-hidden");
    }
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
  }

  function phaseMessage(publicStatus) {
    if (publicStatus.message) return publicStatus.message;
    switch (publicStatus.phase) {
      case "auth-required": return "Sign in with the approved Google account to open PPSC Prep.";
      case "authenticating": return "Opening secure Google sign-in…";
      case "checking": return "Checking your saved progress…";
      case "migration-choice": return "Upload this device's existing progress before using another device.";
      case "conflict": return "Choose which saved progress should be kept.";
      case "syncing": return "Saving progress…";
      case "synced": return "Progress synced.";
      case "dev-ready": return "Local development mode.";
      default: return "Preparing PPSC Prep…";
    }
  }

  function renderStatus(publicStatus) {
    var gate = byId("auth-gate");
    var gateStatus = byId("auth-gate-status");
    var gateError = byId("auth-gate-error");
    var signInButton = byId("google-sign-in-button");
    var choicePanel = byId("progress-choice-panel");
    var useDeviceButton = byId("use-device-progress-button");
    var useCloudButton = byId("use-cloud-progress-button");
    var choiceSummary = byId("progress-choice-summary");
    var deviceSummary = byId("device-progress-summary");
    var cloudSummary = byId("cloud-progress-summary");
    var choiceWarning = byId("progress-choice-warning");
    var accountControls = byId("cloud-account-controls");
    var syncStatus = byId("cloud-sync-status");
    var syncStatusText = byId("cloud-sync-status-text");
    var userEmail = byId("cloud-user-email");
    var syncWarning = byId("cloud-sync-warning");
    var syncWarningText = byId("cloud-sync-warning-text");

    if (gate) gate.dataset.authPhase = publicStatus.phase;
    if (gateStatus) gateStatus.textContent = phaseMessage(publicStatus);
    if (gateError) {
      gateError.textContent = publicStatus.error || "";
      setHidden(gateError, !publicStatus.error);
    }

    var choosing = publicStatus.phase === "migration-choice" || publicStatus.phase === "conflict";
    var busy = ["loading", "authenticating", "checking", "uploading", "downloading"].includes(publicStatus.phase);
    if (signInButton) {
      signInButton.disabled = busy;
      setHidden(signInButton, choosing || (Boolean(publicStatus.user) && !publicStatus.error));
      var signInLabel = signInButton.querySelector("span");
      if (signInLabel) signInLabel.textContent = publicStatus.user && publicStatus.error
        ? "Retry cloud check" : "Continue with Google";
    }
    setHidden(choicePanel, !choosing);
    if (choiceSummary && choosing) {
      choiceSummary.textContent = publicStatus.phase === "migration-choice"
        ? "Cloud progress is empty. Upload this device first so nothing is lost."
        : "This device and the cloud contain different progress.";
    }
    if (deviceSummary && publicStatus.localSummary) {
      deviceSummary.textContent = formatSummary(publicStatus.localSummary);
    }
    if (cloudSummary && publicStatus.cloudSummary) {
      cloudSummary.textContent = formatSummary(publicStatus.cloudSummary);
    }
    if (choiceWarning) {
      choiceWarning.textContent = publicStatus.phase === "migration-choice"
        ? publicStatus.localSummary && publicStatus.localSummary.hasProgress
          ? "Important: confirm that this is the mobile browser containing your queue and session."
          : "Nothing will be created here. Open the same website on the mobile browser containing your saved progress first."
        : "Choosing one side replaces the other side. Nothing is changed until you choose.";
    }
    if (useDeviceButton) {
      var emptyFirstDevice = publicStatus.phase === "migration-choice"
        && publicStatus.localSummary && !publicStatus.localSummary.hasProgress;
      useDeviceButton.disabled = busy || Boolean(emptyFirstDevice);
      useDeviceButton.textContent = emptyFirstDevice
        ? "Open this page on your progress device"
        : publicStatus.phase === "migration-choice"
        ? "Upload this device's progress"
        : "Use this device's progress";
    }
    if (useCloudButton) {
      useCloudButton.disabled = busy || publicStatus.phase === "migration-choice";
      setHidden(useCloudButton, publicStatus.phase === "migration-choice");
    }

    setHidden(accountControls, !publicStatus.user || !publicStatus.ready);
    if (userEmail) userEmail.textContent = publicStatus.user ? publicStatus.user.email : "";
    if (syncStatus) syncStatus.dataset.syncState = publicStatus.phase;
    if (syncStatusText) {
      syncStatusText.textContent = publicStatus.phase === "syncing" ? "Saving…"
        : publicStatus.phase === "error" && publicStatus.ready ? "Not synced"
          : publicStatus.phase === "offline" ? "Saved locally"
          : publicStatus.phase === "dev-ready" ? "Local only"
            : publicStatus.ready ? "Synced" : "Waiting";
    }
    var showSyncWarning = publicStatus.ready && publicStatus.phase === "error";
    setHidden(syncWarning, !showSyncWarning);
    if (syncWarningText && showSyncWarning) {
      syncWarningText.textContent = [publicStatus.message, publicStatus.error].filter(Boolean).join(" ");
    }

    if (publicStatus.ready) revealApp();
    else protectApp();
  }

  function bindUi() {
    if (runtime.uiBound) return;
    runtime.uiBound = true;
    var signInButton = byId("google-sign-in-button");
    var signOutButton = byId("sign-out-button");
    var useDeviceButton = byId("use-device-progress-button");
    var useCloudButton = byId("use-cloud-progress-button");
    var syncRefreshButton = byId("cloud-sync-refresh-button");
    if (signInButton) signInButton.addEventListener("click", signIn);
    if (signOutButton) signOutButton.addEventListener("click", signOutUser);
    if (useDeviceButton) useDeviceButton.addEventListener("click", chooseLocalProgress);
    if (useCloudButton) useCloudButton.addEventListener("click", chooseCloudProgress);
    if (syncRefreshButton) syncRefreshButton.addEventListener("click", function () {
      window.location.reload();
    });
    renderStatus(getPublicStatus());
  }

  function safeJson(rawValue) {
    if (typeof rawValue !== "string") return null;
    try { return JSON.parse(rawValue); } catch (error) { return undefined; }
  }

  function summarizeSnapshot(snapshot) {
    var sessionRaw = snapshot[STORAGE_SLOTS[0].key];
    var queueRaw = snapshot[STORAGE_SLOTS[1].key];
    var difficultRaw = snapshot[STORAGE_SLOTS[2].key];
    var session = safeJson(sessionRaw);
    var queue = safeJson(queueRaw);
    var difficult = safeJson(difficultRaw);
    var malformed = [sessionRaw !== null && session === undefined, queueRaw !== null && queue === undefined,
      difficultRaw !== null && difficult === undefined].some(Boolean);
    var sessionCount = session && Array.isArray(session.questionIds) ? session.questionIds.length : 0;
    var sessionPosition = sessionCount && Number.isInteger(session.currentIndex)
      ? Math.min(session.currentIndex + 1, sessionCount) : 0;
    var retryCount = queue && Array.isArray(queue.items) ? queue.items.length : 0;
    var retryReviews = queue && Array.isArray(queue.items)
      ? queue.items.reduce(function (total, item) {
          return total + (item && Number.isFinite(item.remaining) ? item.remaining : 0);
        }, 0) : 0;
    var difficultIds = Array.isArray(difficult) ? difficult
      : difficult && Array.isArray(difficult.questionIds) ? difficult.questionIds
        : difficult && Array.isArray(difficult.ids) ? difficult.ids : [];
    var hasProgress = malformed || sessionCount > 0 || retryCount > 0
      || Boolean(queue && queue.activeAttempt) || difficultIds.length > 0;
    var totalBytes = STORAGE_SLOTS.reduce(function (total, slot) {
      return total + (typeof snapshot[slot.key] === "string" ? utf8Length(snapshot[slot.key]) : 0);
    }, 0);
    return {
      hasProgress: hasProgress,
      malformed: malformed,
      sessionMode: session && typeof session.mode === "string" ? session.mode : "",
      sessionCategory: session && typeof session.categoryId === "string" ? session.categoryId : "",
      sessionPosition: sessionPosition,
      sessionCount: sessionCount,
      retryCount: retryCount,
      retryReviews: retryReviews,
      difficultCount: difficultIds.length,
      totalBytes: totalBytes
    };
  }

  function formatSummary(summary) {
    if (!summary) return "No saved progress found.";
    if (summary.malformed) return "Saved browser data found (it will be checked before use).";
    var parts = [];
    if (summary.sessionCount) {
      parts.push((summary.sessionMode === "learn" ? "Learn" : "Quiz") + " "
        + summary.sessionPosition + "/" + summary.sessionCount
        + (summary.sessionCategory ? " · " + summary.sessionCategory : ""));
    }
    if (summary.retryCount) parts.push(summary.retryCount + " queued · " + summary.retryReviews + " reviews left");
    if (summary.difficultCount) parts.push(summary.difficultCount + " difficult questions");
    return parts.length ? parts.join("; ") : "No active session, review queue or difficult marks.";
  }

  function readLocalSnapshot() {
    var snapshot = emptyRawSnapshot();
    STORAGE_SLOTS.forEach(function (slot) {
      try { snapshot[slot.key] = window.localStorage.getItem(slot.key); }
      catch (error) { snapshot[slot.key] = null; }
    });
    return snapshot;
  }

  function backupSnapshotLocally(snapshot, reason) {
    if (!snapshot || !summarizeSnapshot(snapshot).hasProgress) return true;
    var values = {};
    STORAGE_SLOTS.forEach(function (slot) {
      values[slot.key] = typeof snapshot[slot.key] === "string" ? snapshot[slot.key] : null;
    });
    try {
      window.localStorage.setItem(LOCAL_CONFLICT_BACKUP_KEY, JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        reason: String(reason || "progress-choice"),
        values: values
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  function applySnapshotToLocal(snapshot) {
    var previous = readLocalSnapshot();
    window.PPSC_CLOUD_APPLYING = true;
    try {
      STORAGE_SLOTS.forEach(function (slot) {
        var rawValue = snapshot[slot.key];
        if (typeof rawValue === "string") window.localStorage.setItem(slot.key, rawValue);
        else window.localStorage.removeItem(slot.key);
      });
    } catch (error) {
      try {
        STORAGE_SLOTS.forEach(function (slot) {
          var previousValue = previous[slot.key];
          if (typeof previousValue === "string") window.localStorage.setItem(slot.key, previousValue);
          else window.localStorage.removeItem(slot.key);
        });
      } catch (restoreError) {
        // A conflict backup is created before destructive choices, when required.
      }
      throw new Error("Cloud progress was downloaded, but this browser blocked local storage.");
    } finally {
      window.PPSC_CLOUD_APPLYING = false;
    }
  }

  function snapshotsEqual(first, second) {
    return STORAGE_SLOTS.every(function (slot) { return first[slot.key] === second[slot.key]; });
  }

  function utf8Length(value) {
    return new TextEncoder().encode(String(value)).length;
  }

  function hashValue(value) {
    var text = String(value);
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function safeChunkEnd(value, start, proposedEnd) {
    var end = proposedEnd;
    if (end > start && end < value.length) {
      var previous = value.charCodeAt(end - 1);
      var next = value.charCodeAt(end);
      if (previous >= 0xD800 && previous <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) end -= 1;
    }
    return Math.max(start + 1, end);
  }

  function splitUtf8(value) {
    if (!value.length) return [];
    var chunks = [];
    var start = 0;
    while (start < value.length) {
      var low = start + 1;
      var high = Math.min(value.length, start + MAX_CHUNK_BYTES);
      var best = low;
      while (low <= high) {
        var middle = safeChunkEnd(value, start, Math.floor((low + high) / 2));
        var size = utf8Length(value.slice(start, middle));
        if (size <= MAX_CHUNK_BYTES) {
          best = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      best = safeChunkEnd(value, start, best);
      var chunk = value.slice(start, best);
      if (utf8Length(chunk) > MAX_CHUNK_BYTES) {
        throw new Error("A saved progress value could not be split safely for Firestore.");
      }
      chunks.push(chunk);
      start = best;
    }
    if (chunks.length > MAX_CHUNKS_PER_SLOT) {
      throw new Error("Saved progress is too large to sync safely. It is still preserved on this device.");
    }
    return chunks;
  }

  function makeGenerationId() {
    var randomPart = "";
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var values = new Uint32Array(2);
      window.crypto.getRandomValues(values);
      randomPart = values[0].toString(36) + values[1].toString(36);
    } else {
      randomPart = Math.random().toString(36).slice(2);
    }
    return Date.now().toString(36) + "-" + randomPart;
  }

  function chunkId(index) {
    return String(index).padStart(6, "0");
  }

  function metaReference() {
    return runtime.sdk.firestore.doc(runtime.db, "users", runtime.user.uid, "syncState", "meta");
  }

  function slotReference(slot) {
    return runtime.sdk.firestore.doc(runtime.db, "users", runtime.user.uid, "syncState", slot.id);
  }

  function chunkReference(slot, generation, index) {
    return runtime.sdk.firestore.doc(runtime.db, "users", runtime.user.uid, "syncState", slot.id,
      "generations", generation, "chunks", chunkId(index));
  }

  function getCloudDoc(reference) {
    return runtime.sdk.firestore.getDocFromServer(reference);
  }

  function prepareSlot(slot, rawValue) {
    var present = typeof rawValue === "string";
    var byteLength = present ? utf8Length(rawValue) : 0;
    var inlineData = present && byteLength <= MAX_INLINE_BYTES ? rawValue : null;
    var generation = present && inlineData === null ? makeGenerationId() : "";
    var chunks = present && inlineData === null ? splitUtf8(rawValue) : [];
    return {
      slot: slot,
      rawValue: present ? rawValue : null,
      chunks: chunks,
      manifest: {
        schemaVersion: CLOUD_SCHEMA_VERSION,
        storageKey: slot.key,
        present: present,
        inlineData: inlineData,
        generation: generation,
        chunkCount: chunks.length,
        byteLength: byteLength,
        hash: present ? hashValue(rawValue) : "",
        updatedAt: runtime.sdk.firestore.serverTimestamp()
      }
    };
  }

  async function writePreparedChunks(preparedSlots) {
    var writes = [];
    preparedSlots.forEach(function (prepared) {
      prepared.chunks.forEach(function (chunk, index) {
        writes.push({
          reference: chunkReference(prepared.slot, prepared.manifest.generation, index),
          value: {
            schemaVersion: CLOUD_SCHEMA_VERSION,
            index: index,
            data: chunk,
            byteLength: utf8Length(chunk),
            hash: hashValue(chunk)
          }
        });
      });
    });
    for (var offset = 0; offset < writes.length; offset += 400) {
      var batch = runtime.sdk.firestore.writeBatch(runtime.db);
      writes.slice(offset, offset + 400).forEach(function (write) {
        batch.set(write.reference, write.value);
      });
      await batch.commit();
    }
  }

  function cloudConflictError() {
    var error = new Error("Cloud progress changed on another device. Refresh before choosing which progress to keep.");
    error.code = "ppsc/cloud-conflict";
    return error;
  }

  async function commitPreparedSlots(preparedSlots, expectedRevision) {
    await writePreparedChunks(preparedSlots);
    var newRevision = await runtime.sdk.firestore.runTransaction(runtime.db, async function (transaction) {
      var metaRef = metaReference();
      var metaSnapshot = await transaction.get(metaRef);
      var actualRevision = metaSnapshot.exists() && Number.isSafeInteger(metaSnapshot.data().revision)
        ? metaSnapshot.data().revision : null;
      if ((expectedRevision === null && metaSnapshot.exists())
        || (expectedRevision !== null && actualRevision !== expectedRevision)) {
        throw cloudConflictError();
      }
      var nextRevision = (actualRevision || 0) + 1;
      preparedSlots.forEach(function (prepared) {
        transaction.set(slotReference(prepared.slot), prepared.manifest);
      });
      transaction.set(metaRef, {
        schemaVersion: CLOUD_SCHEMA_VERSION,
        initialized: true,
        revision: nextRevision,
        lastWriter: runtimeDeviceId(),
        updatedAt: runtime.sdk.firestore.serverTimestamp()
      });
      return nextRevision;
    });
    return newRevision;
  }

  function runtimeDeviceId() {
    var key = "ppsc-prep-cloud-device";
    try {
      var existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      var value = makeGenerationId();
      window.sessionStorage.setItem(key, value);
      return value;
    } catch (error) {
      return makeGenerationId();
    }
  }

  async function cleanupOldGeneration(slot, manifest) {
    if (!manifest || !manifest.generation || !Number.isInteger(manifest.chunkCount)) return;
    for (var offset = 0; offset < manifest.chunkCount; offset += 400) {
      var batch = runtime.sdk.firestore.writeBatch(runtime.db);
      var end = Math.min(manifest.chunkCount, offset + 400);
      for (var index = offset; index < end; index += 1) {
        batch.delete(chunkReference(slot, manifest.generation, index));
      }
      await batch.commit();
    }
  }

  async function uploadSnapshot(rawSnapshot, slots, expectedRevision) {
    var prepared = slots.map(function (slot) { return prepareSlot(slot, rawSnapshot[slot.key]); });
    var oldManifests = slots.map(function (slot) { return runtime.cloudManifests[slot.id] || null; });
    var newRevision = await commitPreparedSlots(prepared, expectedRevision);
    prepared.forEach(function (item) {
      runtime.cloudRaw[item.slot.key] = item.rawValue;
      runtime.cloudManifests[item.slot.id] = Object.assign({}, item.manifest, { updatedAt: null });
    });
    runtime.knownRevision = newRevision;
    Promise.all(oldManifests.map(function (manifest, index) {
      return cleanupOldGeneration(slots[index], manifest);
    })).catch(function () { /* Old unreferenced chunks do not affect the current snapshot. */ });
    return newRevision;
  }

  async function readSlot(slot, manifestSnapshot) {
    if (!manifestSnapshot.exists()) {
      throw new Error("Cloud progress is incomplete: a storage manifest is missing.");
    }
    var manifest = manifestSnapshot.data() || {};
    if (manifest.schemaVersion !== CLOUD_SCHEMA_VERSION || manifest.storageKey !== slot.key
      || typeof manifest.present !== "boolean") {
      throw new Error("Cloud progress uses an unsupported format.");
    }
    if (!manifest.present) return { rawValue: null, manifest: manifest };
    if (typeof manifest.inlineData === "string") {
      if (manifest.inlineData.length > 0 && utf8Length(manifest.inlineData) > MAX_INLINE_BYTES) {
        throw new Error("Inline cloud progress is unexpectedly large.");
      }
      if (manifest.byteLength !== utf8Length(manifest.inlineData)
        || manifest.hash !== hashValue(manifest.inlineData)) {
        throw new Error("Inline cloud progress did not pass its integrity check.");
      }
      return { rawValue: manifest.inlineData, manifest: manifest };
    }
    if (typeof manifest.generation !== "string" || !manifest.generation
      || !Number.isInteger(manifest.chunkCount) || manifest.chunkCount < 0
      || manifest.chunkCount > MAX_CHUNKS_PER_SLOT) {
      throw new Error("Cloud progress is incomplete or invalid.");
    }
    var chunks = new Array(manifest.chunkCount);
    for (var offset = 0; offset < manifest.chunkCount; offset += 20) {
      var indexes = [];
      for (var index = offset; index < Math.min(manifest.chunkCount, offset + 20); index += 1) indexes.push(index);
      var snapshots = await Promise.all(indexes.map(function (chunkIndex) {
        return getCloudDoc(chunkReference(slot, manifest.generation, chunkIndex));
      }));
      snapshots.forEach(function (chunkSnapshot, resultIndex) {
        var expectedIndex = indexes[resultIndex];
        var data = chunkSnapshot.exists() ? chunkSnapshot.data() : null;
        if (!data || data.schemaVersion !== CLOUD_SCHEMA_VERSION || data.index !== expectedIndex
          || typeof data.data !== "string" || data.byteLength !== utf8Length(data.data)
          || data.hash !== hashValue(data.data)) {
          throw new Error("A cloud progress chunk is missing or damaged.");
        }
        chunks[expectedIndex] = data.data;
      });
    }
    var rawValue = chunks.join("");
    if (manifest.byteLength !== utf8Length(rawValue) || manifest.hash !== hashValue(rawValue)) {
      throw new Error("Cloud progress did not pass its integrity check.");
    }
    return { rawValue: rawValue, manifest: manifest };
  }

  function validatedMetaRevision(metaSnapshot) {
    if (!metaSnapshot.exists()) return null;
    var meta = metaSnapshot.data() || {};
    if (meta.schemaVersion !== CLOUD_SCHEMA_VERSION || meta.initialized !== true
      || !Number.isSafeInteger(meta.revision) || meta.revision < 1) {
      throw new Error("Cloud progress metadata is invalid or unsupported.");
    }
    return meta.revision;
  }

  async function readCloudSnapshot(attempt) {
    var readAttempt = Number.isInteger(attempt) ? attempt : 0;
    var metaSnapshot = await getCloudDoc(metaReference());
    var revision = validatedMetaRevision(metaSnapshot);
    if (revision === null) {
      var absentConfirmation = await getCloudDoc(metaReference());
      if (validatedMetaRevision(absentConfirmation) !== null) {
        if (readAttempt < 2) return readCloudSnapshot(readAttempt + 1);
        throw new Error("Cloud progress changed repeatedly while it was being checked. Try again.");
      }
      return { exists: false, revision: null, raw: emptyRawSnapshot(), manifests: Object.create(null) };
    }

    try {
      var manifestSnapshots = await Promise.all(STORAGE_SLOTS.map(function (slot) {
        return getCloudDoc(slotReference(slot));
      }));
      var slotValues = await Promise.all(STORAGE_SLOTS.map(function (slot, index) {
        return readSlot(slot, manifestSnapshots[index]);
      }));
      var confirmationSnapshot = await getCloudDoc(metaReference());
      var confirmedRevision = validatedMetaRevision(confirmationSnapshot);
      if (confirmedRevision !== revision) {
        if (readAttempt < 2) return readCloudSnapshot(readAttempt + 1);
        throw new Error("Cloud progress changed repeatedly while it was being checked. Try again.");
      }
      var raw = emptyRawSnapshot();
      var manifests = Object.create(null);
      slotValues.forEach(function (value, index) {
        raw[STORAGE_SLOTS[index].key] = value.rawValue;
        manifests[STORAGE_SLOTS[index].id] = value.manifest;
      });
      return { exists: true, revision: revision, raw: raw, manifests: manifests };
    } catch (error) {
      var errorConfirmation = await getCloudDoc(metaReference());
      var errorRevision = validatedMetaRevision(errorConfirmation);
      if (errorRevision !== revision && readAttempt < 2) return readCloudSnapshot(readAttempt + 1);
      throw error;
    }
  }

  function allowedUser(user) {
    var allowedEmail = config && String(config.allowedEmail || "").trim().toLowerCase();
    return Boolean(user && user.emailVerified && String(user.email || "").trim().toLowerCase() === allowedEmail);
  }

  function userForStatus(user) {
    return user ? { uid: user.uid, email: user.email || "", displayName: user.displayName || "" } : null;
  }

  async function loadFirebaseSdk() {
    var modules = await Promise.all([
      import(SDK_BASE_URL + "firebase-app.js"),
      import(SDK_BASE_URL + "firebase-auth.js"),
      import(SDK_BASE_URL + "firebase-firestore.js")
    ]);
    return { app: modules[0], auth: modules[1], firestore: modules[2] };
  }

  async function start() {
    if (runtime.startPromise) return runtime.startPromise;
    runtime.started = true;
    runtime.startPromise = startInternal().catch(function (error) {
      failBeforeReady(error, "Firebase could not start.");
      runtime.startPromise = null;
      throw error;
    });
    return runtime.startPromise;
  }

  async function startInternal() {
    bindUi();
    installStorageListeners();
    if (isDevelopmentRuntime()) {
      updateStatus({
        phase: "dev-ready",
        ready: true,
        authRequired: false,
        message: "Local development mode: Firebase sign-in and cloud writes are disabled.",
        error: "",
        decision: null
      });
      emitReady("development");
      return;
    }
    if (!config || !config.firebase || !config.allowedEmail) {
      throw new Error("Firebase configuration is missing.");
    }
    updateStatus({ phase: "loading", ready: false, message: "Loading secure sign-in…", error: "" });
    runtime.sdk = await loadFirebaseSdk();
    var existingApp = runtime.sdk.app.getApps().find(function (app) { return app.name === "ppsc-prep-cloud"; });
    var firebaseApp = existingApp || runtime.sdk.app.initializeApp(config.firebase, "ppsc-prep-cloud");
    runtime.auth = runtime.sdk.auth.getAuth(firebaseApp);
    runtime.db = runtime.sdk.firestore.getFirestore(firebaseApp);
    try {
      await runtime.sdk.auth.setPersistence(runtime.auth, runtime.sdk.auth.browserLocalPersistence);
    } catch (error) {
      // Auth already uses local persistence in supported browsers. Continue if an old
      // embedded browser refuses the explicit persistence call.
    }
    runtime.sdk.auth.onAuthStateChanged(runtime.auth, function (user) {
      handleAuthState(user).catch(function (error) { failBeforeReady(error, "Progress could not be checked."); });
    }, function (error) {
      failBeforeReady(error, "Google sign-in state could not be read.");
    });
  }

  async function handleAuthState(user) {
    var sequence = ++runtime.authSequence;
    runtime.pendingDecision = null;
    runtime.syncPaused = false;
    if (!user) {
      runtime.user = null;
      runtime.knownRevision = null;
      var deniedEmail = runtime.deniedEmail;
      runtime.deniedEmail = "";
      updateStatus({
        phase: deniedEmail ? "unauthorized" : "auth-required",
        ready: false,
        message: deniedEmail
          ? "Access denied for " + deniedEmail + ". Use " + config.allowedEmail + "."
          : "Sign in with " + config.allowedEmail + " to open PPSC Prep.",
        error: deniedEmail ? "This Google account is not allowed." : "",
        user: null,
        localSummary: null,
        cloudSummary: null,
        decision: null,
        revision: null
      });
      return;
    }
    if (!allowedUser(user)) {
      runtime.deniedEmail = user.email || "this account";
      await runtime.sdk.auth.signOut(runtime.auth);
      return;
    }
    runtime.user = user;
    updateStatus({
      phase: "checking",
      ready: false,
      message: "Signed in. Checking this device and cloud progress…",
      error: "",
      user: userForStatus(user),
      decision: null
    });
    var cloud = await readCloudSnapshot();
    if (sequence !== runtime.authSequence || !runtime.user) return;
    var local = readLocalSnapshot();
    runtime.cloudRaw = cloneRawSnapshot(cloud.raw);
    runtime.cloudManifests = cloud.manifests;
    runtime.knownRevision = cloud.revision;
    var localSummary = summarizeSnapshot(local);
    var cloudSummary = summarizeSnapshot(cloud.raw);
    updateStatus({ localSummary: localSummary, cloudSummary: cloudSummary, revision: cloud.revision });

    if (!cloud.exists) {
      runtime.pendingDecision = { local: local, cloud: cloud };
      updateStatus({
        phase: "migration-choice",
        ready: false,
        message: localSummary.hasProgress
          ? "Existing progress was found on this device. Upload it before continuing."
          : "No cloud backup exists yet. First open this page on the device that holds your progress.",
        error: "",
        decision: localSummary.hasProgress ? "device-upload" : "confirm-empty-device"
      });
      return;
    }

    if (snapshotsEqual(local, cloud.raw)) {
      finishReady("already-current", cloud.raw);
      return;
    }
    if (!localSummary.hasProgress) {
      updateStatus({ phase: "downloading", ready: false, message: "Restoring your cloud progress on this device…" });
      applySnapshotToLocal(cloud.raw);
      finishReady("cloud-restored", cloud.raw);
      return;
    }
    runtime.pendingDecision = { local: local, cloud: cloud };
    updateStatus({
      phase: "conflict",
      ready: false,
      message: "This device and cloud have different saved progress. Choose the copy to keep.",
      error: "",
      decision: "device-or-cloud"
    });
  }

  function finishReady(mode, rawSnapshot) {
    runtime.cloudRaw = cloneRawSnapshot(rawSnapshot);
    runtime.pendingDecision = null;
    runtime.syncPaused = false;
    updateStatus({
      phase: "synced",
      ready: true,
      message: "Progress is synced. You can safely continue.",
      error: "",
      localSummary: summarizeSnapshot(readLocalSnapshot()),
      cloudSummary: summarizeSnapshot(runtime.cloudRaw),
      decision: null,
      revision: runtime.knownRevision
    });
    emitReady(mode);
  }

  async function signIn() {
    if (isDevelopmentRuntime()) return;
    try {
      await start();
      if (runtime.user && allowedUser(runtime.user)) {
        await handleAuthState(runtime.user);
        return;
      }
      updateStatus({ phase: "authenticating", ready: false, message: "Opening Google sign-in…", error: "" });
      var provider = new runtime.sdk.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account", login_hint: config.allowedEmail });
      await runtime.sdk.auth.signInWithPopup(runtime.auth, provider);
    } catch (error) {
      var code = String(error && error.code || "");
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        updateStatus({
          phase: "auth-required",
          ready: false,
          message: "Sign-in was cancelled. Try again when you are ready.",
          error: ""
        });
        return;
      }
      var hint = code === "auth/popup-blocked"
        ? "The browser blocked the Google window. Allow pop-ups for this site and try again."
        : "Google sign-in failed.";
      failBeforeReady(error, hint);
    }
  }

  async function signOutUser() {
    if (!runtime.auth || isDevelopmentRuntime()) return;
    runtime.syncPaused = true;
    protectApp();
    try {
      await runtime.sdk.auth.signOut(runtime.auth);
      window.location.reload();
    } catch (error) {
      failBeforeReady(error, "Sign-out failed.");
    }
  }

  async function chooseLocalProgress() {
    var decision = runtime.pendingDecision;
    if (!decision || !runtime.user) return;
    try {
      var currentLocal = readLocalSnapshot();
      if (!decision.cloud.exists && !summarizeSnapshot(currentLocal).hasProgress) {
        updateStatus({
          phase: "migration-choice",
          ready: false,
          message: "Open this page on the mobile browser that already contains your saved progress.",
          error: "An empty device cannot initialize the cloud backup."
        });
        return;
      }
      if (decision.cloud.exists && !backupSnapshotLocally(decision.cloud.raw, "cloud-before-device-choice")) {
        throw new Error("A safety backup could not be created, so the cloud copy was not replaced.");
      }
      updateStatus({
        phase: "uploading",
        ready: false,
        message: decision.cloud.exists ? "Replacing cloud progress with this device…" : "Uploading this device's progress…",
        error: ""
      });
      await uploadSnapshot(currentLocal, STORAGE_SLOTS, decision.cloud.exists ? decision.cloud.revision : null);
      finishReady(decision.cloud.exists ? "device-replaced-cloud" : "device-imported", currentLocal);
      if (!snapshotsEqual(readLocalSnapshot(), currentLocal)) notifyLocalChange(null);
    } catch (error) {
      if (error && error.code === "ppsc/cloud-conflict"
        && await acceptEquivalentCloudConflict("equivalent-device-upload")) return;
      runtime.syncPaused = error && error.code === "ppsc/cloud-conflict";
      failBeforeReady(error, "This device's progress was not uploaded; it is still safe in this browser.");
    }
  }

  async function chooseCloudProgress() {
    var decision = runtime.pendingDecision;
    if (!decision || !decision.cloud || !decision.cloud.exists) return;
    try {
      updateStatus({ phase: "downloading", ready: false, message: "Restoring cloud progress…", error: "" });
      var latestCloud = await readCloudSnapshot();
      if (!latestCloud.exists) throw new Error("The cloud copy is no longer available. Refresh and compare again.");
      var currentLocal = readLocalSnapshot();
      if (!snapshotsEqual(currentLocal, latestCloud.raw)
        && !backupSnapshotLocally(currentLocal, "device-before-cloud-choice")) {
        throw new Error("A safety backup could not be created, so this device's progress was not replaced.");
      }
      applySnapshotToLocal(latestCloud.raw);
      rememberCloudSnapshot(latestCloud);
      finishReady("cloud-chosen", latestCloud.raw);
    } catch (error) {
      failBeforeReady(error, "Cloud progress could not be applied. This device's copy was not uploaded.");
    }
  }

  function installStorageListeners() {
    if (installStorageListeners.installed) return;
    installStorageListeners.installed = true;
    window.addEventListener("ppsc:local-state-changed", function (event) {
      notifyLocalChange(event && event.detail ? event.detail.key : null);
    });
    window.addEventListener("storage", function (event) {
      if (event && SLOT_BY_KEY.has(event.key)) notifyLocalChange(event.key);
    });
    window.addEventListener("offline", function () {
      if (!status.ready || !runtime.user) return;
      updateStatus({
        phase: "offline",
        ready: true,
        message: "Internet is offline. Progress is still being saved safely in this browser.",
        error: ""
      });
    });
    window.addEventListener("online", function () {
      if (runtime.syncPaused) return;
      if (!status.ready) {
        if (runtime.user && allowedUser(runtime.user)) {
          handleAuthState(runtime.user).catch(function (error) {
            failBeforeReady(error, "Progress could not be checked after reconnecting.");
          });
        } else if (!runtime.auth) {
          start().catch(function () { /* The gate displays the retry error. */ });
        }
        return;
      }
      if (!runtime.user) return;
      runtime.retryDelay = 5000;
      scheduleReconnectCheck(0);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && runtime.pendingKeys.size) queueFlush(0);
    });
  }

  function notifyLocalChange(storageKey) {
    if (window.PPSC_CLOUD_APPLYING === true || !status.ready || !runtime.user || runtime.syncPaused) return;
    if (storageKey && SLOT_BY_KEY.has(storageKey)) runtime.pendingKeys.add(storageKey);
    else STORAGE_SLOTS.forEach(function (slot) { runtime.pendingKeys.add(slot.key); });
    if (window.navigator && window.navigator.onLine === false) {
      updateStatus({
        phase: "offline",
        ready: true,
        message: "Internet is offline. This change is saved in this browser and will sync when the connection returns.",
        error: ""
      });
      return;
    }
    queueFlush(SYNC_DEBOUNCE_MS);
  }

  function queueFlush(delay) {
    if (runtime.syncTimer) window.clearTimeout(runtime.syncTimer);
    runtime.syncTimer = window.setTimeout(function () {
      runtime.syncTimer = null;
      var keys = Array.from(runtime.pendingKeys);
      runtime.pendingKeys.clear();
      if (!keys.length) return;
      runtime.syncChain = runtime.syncChain.then(function () { return syncKeys(keys); });
    }, delay);
  }

  function scheduleReconnectCheck(delay) {
    if (runtime.reconnectTimer) window.clearTimeout(runtime.reconnectTimer);
    runtime.reconnectTimer = window.setTimeout(function () {
      runtime.reconnectTimer = null;
      runtime.syncChain = runtime.syncChain.then(reconcileAfterReconnect);
    }, delay);
  }

  function rememberCloudSnapshot(cloud) {
    runtime.cloudRaw = cloneRawSnapshot(cloud.raw);
    runtime.cloudManifests = cloud.manifests;
    runtime.knownRevision = cloud.revision;
  }

  async function acceptEquivalentCloudConflict(mode) {
    try {
      var latestCloud = await readCloudSnapshot();
      var currentLocal = readLocalSnapshot();
      if (!latestCloud.exists || !snapshotsEqual(currentLocal, latestCloud.raw)) return false;
      rememberCloudSnapshot(latestCloud);
      finishReady(mode || "equivalent-cloud-update", latestCloud.raw);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function reconcileAfterReconnect() {
    if (!status.ready || !runtime.user || runtime.syncPaused) return;
    if (window.navigator && window.navigator.onLine === false) {
      updateStatus({
        phase: "offline",
        ready: true,
        message: "Internet is offline. Progress remains saved in this browser.",
        error: ""
      });
      return;
    }

    updateStatus({
      phase: "syncing",
      ready: true,
      message: "Internet is back. Comparing browser and cloud progress...",
      error: ""
    });
    try {
      var cloud = await readCloudSnapshot();
      if (!cloud.exists) throw cloudConflictError();
      var current = readLocalSnapshot();

      var cloudChanged = cloud.revision !== runtime.knownRevision;
      var localChanged = !snapshotsEqual(current, runtime.cloudRaw);
      if (!cloudChanged || snapshotsEqual(cloud.raw, runtime.cloudRaw)) {
        if (cloudChanged) rememberCloudSnapshot(cloud);
        STORAGE_SLOTS.forEach(function (slot) { runtime.pendingKeys.add(slot.key); });
        var pendingKeys = Array.from(runtime.pendingKeys);
        runtime.pendingKeys.clear();
        await syncKeys(pendingKeys);
        return;
      }

      if (snapshotsEqual(current, cloud.raw)) {
        rememberCloudSnapshot(cloud);
        updateStatus({
          phase: "synced",
          ready: true,
          message: "Progress is already synced.",
          error: "",
          localSummary: summarizeSnapshot(current),
          cloudSummary: summarizeSnapshot(cloud.raw),
          revision: cloud.revision
        });
        return;
      }

      if (!localChanged) {
        applySnapshotToLocal(cloud.raw);
        rememberCloudSnapshot(cloud);
        updateStatus({
          phase: "synced",
          ready: true,
          message: "New cloud progress was restored. Reloading...",
          error: "",
          localSummary: summarizeSnapshot(cloud.raw),
          cloudSummary: summarizeSnapshot(cloud.raw),
          revision: cloud.revision
        });
        window.location.reload();
        return;
      }

      runtime.syncPaused = true;
      STORAGE_SLOTS.forEach(function (slot) { runtime.pendingKeys.add(slot.key); });
      updateStatus({
        phase: "error",
        ready: true,
        message: "Both this browser and another device changed while offline. Both copies are still safe.",
        error: "Refresh this page to compare the two copies before syncing again."
      });
    } catch (error) {
      if (error && error.code === "ppsc/cloud-conflict") {
        runtime.syncPaused = true;
        updateStatus({
          phase: "error",
          ready: true,
          message: "Cloud progress changed while this browser was offline. Local progress is still safe.",
          error: "Refresh this page to compare the two copies before syncing again."
        });
        return;
      }
      updateStatus({
        phase: "error",
        ready: true,
        message: "Internet returned, but the cloud check is still waiting. Local progress remains safe.",
        error: friendlyError(error)
      });
      var reconnectDelay = runtime.retryDelay;
      runtime.retryDelay = Math.min(runtime.retryDelay * 2, 60000);
      scheduleReconnectCheck(reconnectDelay);
    }
  }

  async function syncKeys(keys) {
    if (!status.ready || !runtime.user || runtime.syncPaused) return;
    if (window.navigator && window.navigator.onLine === false) {
      keys.forEach(function (key) { runtime.pendingKeys.add(key); });
      updateStatus({
        phase: "offline",
        ready: true,
        message: "Internet is offline. Pending progress remains saved in this browser.",
        error: ""
      });
      return;
    }
    var current = readLocalSnapshot();
    var slots = keys.map(function (key) { return SLOT_BY_KEY.get(key); }).filter(Boolean)
      .filter(function (slot, index, list) { return list.indexOf(slot) === index; })
      .filter(function (slot) { return current[slot.key] !== runtime.cloudRaw[slot.key]; });
    if (!slots.length) {
      if (status.phase === "offline" || status.phase === "syncing") {
        updateStatus({
          phase: "synced",
          ready: true,
          message: "Progress is already synced.",
          error: "",
          localSummary: summarizeSnapshot(current),
          cloudSummary: summarizeSnapshot(runtime.cloudRaw)
        });
      }
      return;
    }
    try {
      updateStatus({ phase: "syncing", ready: true, message: "Saving progress to the cloud…", error: "" });
      await uploadSnapshot(current, slots, runtime.knownRevision);
      runtime.retryDelay = 5000;
      updateStatus({
        phase: "synced",
        ready: true,
        message: "Progress synced.",
        error: "",
        localSummary: summarizeSnapshot(current),
        cloudSummary: summarizeSnapshot(runtime.cloudRaw),
        revision: runtime.knownRevision
      });
    } catch (error) {
      if (error && error.code === "ppsc/cloud-conflict") {
        if (await acceptEquivalentCloudConflict("equivalent-background-sync")) return;
        slots.forEach(function (slot) { runtime.pendingKeys.add(slot.key); });
        runtime.syncPaused = true;
        updateStatus({
          phase: "error",
          ready: true,
          message: "Cloud progress changed on another device. Your current device progress is still safe.",
          error: "Refresh this page to compare the two copies before syncing again."
        });
        return;
      }
      slots.forEach(function (slot) { runtime.pendingKeys.add(slot.key); });
      updateStatus({
        phase: "error",
        ready: true,
        message: "This device still has your progress, but cloud sync is waiting.",
        error: friendlyError(error)
      });
      var retryDelay = runtime.retryDelay;
      runtime.retryDelay = Math.min(runtime.retryDelay * 2, 60000);
      queueFlush(retryDelay);
    }
  }

  function friendlyError(error) {
    var code = String(error && error.code || "");
    if (code === "permission-denied" || code === "firestore/permission-denied") {
      return "Firestore denied access. Check that the published rules use the approved Gmail address.";
    }
    if (code === "unavailable" || code === "firestore/unavailable") {
      return "Cloud sync is offline. Keep this tab open or reconnect; local progress is still safe.";
    }
    return error && error.message ? error.message : "An unknown cloud sync error occurred.";
  }

  function failBeforeReady(error, context) {
    updateStatus({
      phase: "error",
      ready: status.ready,
      message: context,
      error: friendlyError(error)
    });
  }

  function onDomReady() {
    bindUi();
    start().catch(function () { /* The gate already contains the actionable error. */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
  else onDomReady();
})(window, document);
