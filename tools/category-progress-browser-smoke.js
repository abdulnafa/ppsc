"use strict";

// Learn/Quiz -> another category -> read-only preview -> exact Continue/reload.
// Browser plugin is unavailable; reuse the repository's Chrome/CDP e2e workflow.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const vm = require("node:vm");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");
const root = path.resolve(__dirname, "..");
const baselineOption = process.argv.find(argument => argument.startsWith("--baseline="));
const baselineCount = baselineOption ? Number(baselineOption.split("=")[1]) : 11892;
assert([11892, 11932].includes(baselineCount), "Use --baseline=11892 or --baseline=11932");
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ACTIVE = "ppsc-prep:active-session:v1";
const ARCHIVE = "ppsc-prep:category-sessions:v1";
const QUEUE = "ppsc-prep:retry-queue:v1";
const keyFor = (category, mode, scope = "all", source = "all", important = false) =>
  [category, mode, scope, source, important ? "important" : "all"].join(":");
const stable = snapshot => {
  const copy = JSON.parse(JSON.stringify(snapshot));
  delete copy.savedAt;
  return copy;
};

function readBank() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "data/questions.js"), "utf8"), context);
  return context.window.PPSC_QUIZ_DATA;
}

async function main() {
  const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
  assert(chrome, "Chrome or Edge is required");
  const baselineBank = readBank();
  if (baselineCount === 11932) assert(baselineBank.questions.length > baselineCount,
    "The 11,932 migration browser test requires the new appended release");
  baselineBank.questions = baselineBank.questions.slice(0, baselineCount);
  assert.equal(baselineBank.questions.length, baselineCount, "pre-release bank prefix is required");
  let releasedBank = false;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-category-progress-test-"));
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    response.setHeader("Cache-Control", "no-store");
    if (pathname === "/data/questions.js" && !releasedBank) {
      response.setHeader("Content-Type", "application/javascript");
      response.end("window.PPSC_QUIZ_DATA = " + JSON.stringify(baselineBank) + ";"); return;
    }
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader("Content-Type", ({ ".js": "application/javascript", ".html": "text/html",
      ".css": "text/css", ".woff2": "font/woff2" })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const guestUrl = `http://ppsc-category-progress.test:${server.address().port}/`;
  const port = 45000 + process.pid % 10000;
  const browser = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
    "--disable-extensions", "--no-proxy-server", "--host-resolver-rules=MAP ppsc-category-progress.test 127.0.0.1",
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
  let client;
  const errors = [], cloudRequests = [], screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", event => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        errors.push(message.params.args.map(arg => arg.value || arg.description || "").join(" "));
      }
      if (message.method === "Network.requestWillBeSent" && /firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/.test(message.params.request.url)) cloudRequests.push(message.params.request.url);
    });
    await client.send("Runtime.enable"); await client.send("Page.enable"); await client.send("Network.enable");
    await client.send("Network.setBlockedURLs", { urls: ["https://www.gstatic.com/firebasejs/*"] });
    const wait = async condition => {
      for (let attempt = 0; attempt < 150; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const click = selector => client.evaluate(`(() => { const n = document.querySelector(${JSON.stringify(selector)}); if (!n || n.disabled) throw new Error('Missing/disabled control: ' + ${JSON.stringify(selector)}); n.click(); })()`);
    const raw = storageKey => client.evaluate(`window.PPSC_CLOUD.storage.getItem(${JSON.stringify(storageKey)})`);
    const active = async () => JSON.parse(await raw(ACTIVE));
    const archive = async () => JSON.parse(await raw(ARCHIVE)).sessions;
    const allStorage = () => client.evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))`);
    const home = async () => {
      await client.evaluate(`(() => {
        for (const [screen, button] of [['quiz-screen','back-button'], ['mode-screen','mode-back-button'], ['results-screen','change-category-button']]) {
          if (!document.getElementById(screen).hidden) { document.getElementById(button).click(); break; }
        }
      })()`);
      await wait('!document.getElementById("category-screen").hidden');
    };
    const category = async id => { await home(); await click(`#category-grid [data-category="${id}"]`); };
    const start = async (id, mode, options = {}) => {
      await category(id);
      await client.evaluate(`(() => {
        const important = document.getElementById('important-only-checkbox');
        if (important.checked !== ${Boolean(options.important)}) important.click();
        ${id === "basic-computer-studies" ? `document.getElementById(${JSON.stringify("computer-source-" + (options.source || "all"))}).click();` : ""}
      })()`);
      if (options.difficult) await click("#difficult-mode-button");
      await click(options.wrong ? "#wrong-quiz-mode-button"
        : options.difficult ? `#difficult-${mode}-button` : `#${mode}-mode-button`);
      if (!options.wrong) {
        await client.evaluate(`document.getElementById('question-range-start-input').value='${options.begin || 1}'; document.getElementById('question-range-end-input').value='${options.end || 4}'; document.getElementById('question-range-form').requestSubmit()`);
      }
      await wait('!document.getElementById("quiz-screen").hidden');
      await client.evaluate("if (document.getElementById('practice-popups-toggle').checked) document.getElementById('practice-popups-toggle').click()");
    };
    const answer = async correct => {
      await client.evaluate(`(() => {
        const saved=JSON.parse(window.PPSC_CLOUD.storage.getItem(${JSON.stringify(ACTIVE)}));
        const q=window.PPSC_QUIZ_DATA.questions.find(q=>q.id===saved.questionIds[saved.currentIndex]);
        const displayed=saved.optionOrders[saved.currentIndex].findIndex(index=>${correct ? "index ===" : "index !=="}q.correctOptionIndex);
        document.querySelector('#options-container [data-option-index="'+displayed+'"]').click();
      })()`);
      await click("#action-button");
    };
    const resume = async (categoryId, key, expected) => {
      await category(categoryId);
      await click(`[data-continue-category-session="${key}"]`);
      await wait('!document.getElementById("quiz-screen").hidden');
      assert.deepEqual(stable(await active()), stable(expected), "Continue must restore exact session " + key);
      assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), expected.questionIds[expected.currentIndex]);
    };
    const capture = async (name, width, dark, selector = "#category-sessions-panel") => {
      await client.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await client.evaluate(`document.activeElement?.blur();document.documentElement.setAttribute('data-theme','${dark ? "dark" : "light"}');document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Preview layout overflows at " + width);
      const file = path.join(os.tmpdir(), `ppsc-category-progress-${baselineCount}-${name}.png`);
      fs.writeFileSync(file, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(file);
    };
    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(await client.evaluate("document.querySelectorAll('#category-grid .category-card').length"), 11);
    assert.equal(await client.evaluate("Boolean(document.querySelector('vite-error-overlay,nextjs-portal'))"), false);

    await start("general-knowledge", "learn");
    await click("#action-button"); await click("#action-button"); await click("#action-button");
    const staleLearn = await active();
    assert.equal(staleLearn.currentIndex, 1);
    assert.equal(staleLearn.learnVisitedQuestionIds.length, 2);
    await pause(10);
    await click("#action-button"); await click("#action-button");
    const gkLearn = await active();
    assert.equal(gkLearn.currentIndex, 2);
    assert(gkLearn.savedAt > staleLearn.savedAt, "split-write fixture needs a genuinely newer archive");
    assert.deepEqual((await archive())[keyFor("general-knowledge", "learn")], gkLearn);
    // Simulate archive write succeeding while the subsequent active-slot write
    // failed: only the active record is stale, and the newer archive is intact.
    await client.evaluate(`window.PPSC_CLOUD.storage.setItem(${JSON.stringify(ACTIVE)}, ${JSON.stringify(JSON.stringify(staleLearn))})`);
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.deepEqual(stable(await active()), stable(gkLearn), "startup must repair stale active from newer same-key archive");
    assert.deepEqual(stable((await archive())[keyFor("general-knowledge", "learn")]), stable(gkLearn), "startup must not rewind the newer archive");
    await click("#continue-session-button");
    assert.deepEqual(stable(await active()), stable(gkLearn), "global Continue must use the newer archived position after split-write recovery");
    assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), gkLearn.questionIds[2]);
    await start("general-knowledge", "quiz");
    await answer(false); await click("#action-button");
    await click('#options-container [data-option-index="1"]');
    const gkQuizPending = await active();
    assert.equal(gkQuizPending.currentIndex, 1);
    assert.equal(gkQuizPending.submitted, false);
    assert.equal(gkQuizPending.selectedIndex, 1);
    await start("pakistan-studies", "learn"); await click("#action-button");
    const pkLearn = await active();
    await start("pakistan-studies", "quiz"); await answer(true);
    const pkQuiz = await active();
    await home();
    assert.match(await client.evaluate(`document.querySelector('#category-grid [data-category="general-knowledge"] .category-saved-progress').textContent`), /2 saved sessions/);
    const beforePreview = await allStorage();
    await category("general-knowledge");
    assert.equal(await client.evaluate("document.querySelectorAll('#category-sessions-list .saved-category-session').length"), 2);
    await client.evaluate("document.querySelector('#category-sessions-list summary').focus()");
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await wait("document.querySelector('#category-sessions-list details').open");
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await wait("!document.querySelector('#category-sessions-list details').open");
    await click("#category-sessions-list summary");
    assert.equal(await allStorage(), beforePreview, "Viewing a preview must not write progress, score or queue");
    assert.match(await client.evaluate("document.querySelector('#category-sessions-list details').textContent"), /checked|answers revealed/);
    await capture("desktop", 1366, false); await capture("mobile-dark", 320, true);
    await resume("general-knowledge", keyFor("general-knowledge", "learn"), gkLearn);
    assert(await client.evaluate("document.querySelectorAll('#options-container .is-correct').length > 0"), "revealed Learn answer was hidden after Continue");
    await resume("general-knowledge", keyFor("general-knowledge", "quiz"), gkQuizPending);
    await answer(false);
    const gkQuizChecked = await active();
    await resume("pakistan-studies", keyFor("pakistan-studies", "learn"), pkLearn);
    await resume("pakistan-studies", keyFor("pakistan-studies", "quiz"), pkQuiz);
    await resume("general-knowledge", keyFor("general-knowledge", "quiz"), gkQuizChecked);
    assert.equal(await client.evaluate("document.getElementById('feedback').hidden"), false);
    await home();
    await click("#continue-session-button");
    assert.deepEqual(stable(await active()), stable(gkQuizChecked), "global Continue must remain intact");
    await home();
    const savedBeforeReload = await archive();
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    const afterReload = await archive();
    for (const [key, value] of Object.entries(savedBeforeReload)) assert.deepEqual(stable(afterReload[key]), stable(value), "reload changed " + key);
    await resume("general-knowledge", keyFor("general-knowledge", "learn"), gkLearn);

    // Normal Quiz and Wrong Quiz are independent; finishing Wrong clears only that slot.
    await start("general-knowledge", "quiz", { wrong: true });
    const wrongBefore = await active();
    assert.equal(wrongBefore.scope, "wrong");
    const normalBeforeWrong = (await archive())[keyFor("general-knowledge", "quiz")];
    await home();
    assert((await archive())[keyFor("general-knowledge", "quiz", "wrong")]);
    await resume("general-knowledge", keyFor("general-knowledge", "quiz", "wrong"), wrongBefore);
    for (let index = 0; index < wrongBefore.questionIds.length; index += 1) { await answer(true); await click("#action-button"); }
    await wait('!document.getElementById("results-screen").hidden');
    assert.equal((await archive())[keyFor("general-knowledge", "quiz", "wrong")], undefined);
    assert.deepEqual(stable((await archive())[keyFor("general-knowledge", "quiz")]), stable(normalBeforeWrong));
    assert.deepEqual(stable((await archive())[keyFor("pakistan-studies", "learn")]), stable(pkLearn));

    // A short finished Learn removes only the same category/mode/filter save.
    await start("pakistan-studies", "learn", { end: 1 });
    const beforeCompletion = await archive();
    await click("#action-button"); await click("#action-button");
    await wait('!document.getElementById("results-screen").hidden');
    const afterCompletion = await archive();
    assert.equal(afterCompletion[keyFor("pakistan-studies", "learn")], undefined);
    for (const [key, value] of Object.entries(beforeCompletion)) {
      if (key !== keyFor("pakistan-studies", "learn")) assert.deepEqual(stable(afterCompletion[key]), stable(value), "completion changed unrelated " + key);
    }

    const ids = await client.evaluate("window.PPSC_QUIZ_DATA.categories.map(category=>category.id)");
    for (const id of ids) {
      await start(id, "learn", { end: 2 });
      const saved = await active(); await home(); await resume(id, keyFor(id, "learn"), saved);
    }
    // Computer sources and Important are separate from the default Learn profile.
    await start("basic-computer-studies", "learn", { source: "initial-original", end: 2 });
    const computerOriginal = await active();
    await start("basic-computer-studies", "learn", { source: "other", end: 2 });
    const computerOther = await active();
    await resume("basic-computer-studies", keyFor("basic-computer-studies", "learn", "all", "initial-original"), computerOriginal);
    await resume("basic-computer-studies", keyFor("basic-computer-studies", "learn", "all", "other"), computerOther);
    await start("general-knowledge", "learn", { important: true, end: 2 });
    const important = await active();
    await resume("general-knowledge", keyFor("general-knowledge", "learn", "all", "all", true), important);
    await click("#difficult-checkbox");
    await start("general-knowledge", "learn", { difficult: true, end: 1 });
    const difficult = await active();
    assert.equal(difficult.scope, "difficult");
    await resume("general-knowledge", keyFor("general-knowledge", "learn", "difficult"), difficult);
    assert.deepEqual(stable((await archive())[keyFor("general-knowledge", "learn", "all", "all", true)]), stable(important));
    assert((await archive())[keyFor("general-knowledge", "learn")], "Difficult must not replace ordinary Learn");

    // Same-profile deployed bank refresh: frozen current-affairs sessions must not grow.
    const caRange = baselineCount === 11932 ? { begin: 646, end: 650 } : { begin: 1, end: 3 };
    await start("current-affairs", "learn", caRange); await click("#action-button");
    const caLearn = await active();
    await start("current-affairs", "quiz", caRange); await answer(false);
    if (baselineCount === 11932) {
      await click("#action-button");
      await click('#options-container [data-option-index="1"]');
    }
    const caQuiz = await active();
    const baselineCaIds = baselineBank.questions.filter(question => question.categoryId === "current-affairs")
      .slice(caRange.begin - 1, caRange.end).map(question => question.id);
    assert.deepEqual(caQuiz.questionIds, Array.from(baselineCaIds));
    assert.equal(caQuiz.rangePoolSize, baselineCount === 11932 ? 650 : 610);
    await capture("ca-before-release", 1366, false, "#quiz-screen");
    const queueBeforeRelease = JSON.parse(await raw(QUEUE));
    await home();
    const currentBankCount = readBank().questions.length;
    releasedBank = true;
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    const releaseStable = snapshot => {
      const copy = stable(snapshot); delete copy.bankSignature; delete copy.rangePoolBankSignature; return copy;
    };
    const releaseArchive = await archive();
    assert.deepEqual(releaseStable(releaseArchive[keyFor("current-affairs", "learn")]), releaseStable(caLearn));
    assert.deepEqual(releaseStable(releaseArchive[keyFor("current-affairs", "quiz")]), releaseStable(caQuiz));
    const afterReleaseQueue = JSON.parse(await raw(QUEUE));
    assert.deepEqual(afterReleaseQueue.items, queueBeforeRelease.items, "release changed existing queue counts/order/cooldown");
    assert.deepEqual(afterReleaseQueue.wrongQuestionIds, queueBeforeRelease.wrongQuestionIds, "release changed Wrong Quiz list");
    const queueState = snapshot => { const copy = JSON.parse(JSON.stringify(snapshot)); delete copy.bankSignature; return copy; };
    assert.deepEqual(queueState(afterReleaseQueue), queueState(queueBeforeRelease), "release changed queue cadence/decks/preferences/attempt state");
    await category("current-affairs");
    await click(`[data-continue-category-session="${keyFor("current-affairs", "quiz")}"]`);
    const migratedQuiz = await active();
    assert.deepEqual(releaseStable(migratedQuiz), releaseStable(caQuiz));
    assert.equal(migratedQuiz.questionIds.length, caRange.end - caRange.begin + 1);
    assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), caQuiz.questionIds[caQuiz.currentIndex]);
    if (baselineCount === 11932) {
      assert.equal(migratedQuiz.currentIndex, 1);
      assert.equal(migratedQuiz.submitted, false);
      assert.equal(migratedQuiz.selectedIndex, 1);
      assert.equal(migratedQuiz.rangePoolSize, 650);
    }
    await capture("ca-after-release-desktop", 1366, false, "#quiz-screen");
    await capture("ca-after-release-mobile-dark", 320, true, "#quiz-screen");
    if (currentBankCount > baselineCount) {
      assert.notEqual(migratedQuiz.bankSignature, caQuiz.bankSignature);
      assert.equal(migratedQuiz.rangePoolBankSignature, caQuiz.bankSignature,
        "the new bank must explicitly retain the frozen pool's original bank signature");
    }
    await category("current-affairs");
    await click(`[data-continue-category-session="${keyFor("current-affairs", "learn")}"]`);
    const migratedLearn = await active();
    assert.deepEqual(releaseStable(migratedLearn), releaseStable(caLearn));
    if (currentBankCount > baselineCount) {
      assert.notEqual(migratedLearn.bankSignature, caLearn.bankSignature);
      assert.equal(migratedLearn.rangePoolBankSignature, caLearn.bankSignature);
    }
    await home();
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    await resume("current-affairs", keyFor("current-affairs", "quiz"), migratedQuiz);
    await resume("current-affairs", keyFor("current-affairs", "learn"), migratedLearn);

    // Only after proving old progress survives, intentionally start a fresh
    // range containing the appended October questions and exercise its UI.
    let appendedCurrentAffairsTested = false;
    if (baselineCount === 11932) {
      const appendedQuestions = Array.from(readBank().questions.slice(baselineCount));
      assert.equal(appendedQuestions.length, 20);
      assert(appendedQuestions.every(question => question.categoryId === "current-affairs"));
      await start("current-affairs", "quiz", { begin: 651, end: 670 });
      const octoberQuiz = await active();
      assert.equal(octoberQuiz.rangePoolSize, 670);
      assert.deepEqual(octoberQuiz.questionIds, appendedQuestions.map(question => question.id));
      assert.equal(octoberQuiz.questionIds[0], "USR-Q0021-SRC");
      assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), "USR-Q0021-SRC");
      assert.match(await client.evaluate("document.title"), /PPSC Prep/);
      assert.equal(await client.evaluate("location.origin"), new URL(url).origin);
      assert(await client.evaluate("document.getElementById('question-text').textContent.trim().length > 20"),
        "New October quiz must render meaningful question content");
      assert.equal(await client.evaluate("Boolean(document.querySelector('vite-error-overlay,nextjs-portal'))"), false);
      await answer(true);
      const checkedOctober = await active();
      assert.equal(checkedOctober.submitted, true);
      assert.equal(checkedOctober.score, 1);
      assert.equal(await client.evaluate("document.getElementById('feedback').hidden"), false);
      await capture("october-new-question-desktop", 1366, false, "#quiz-screen");
      await click("#action-button");
      assert.equal((await active()).currentIndex, 1);
      assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), appendedQuestions[1].id);
      appendedCurrentAffairsTested = true;
    }

    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `if (location.hostname === 'ppsc-category-progress.test') {localStorage.setItem(${JSON.stringify(ARCHIVE)},'PRIVATE-OWNER-ARCHIVE');localStorage.setItem(${JSON.stringify(ACTIVE)},'PRIVATE-OWNER-ACTIVE');}`
    });
    await client.send("Page.navigate", { url: guestUrl });
    await wait('document.readyState === "complete" && !document.getElementById("auth-gate").hidden && window.PPSC_CLOUD?.getStatus().phase === "error"');
    await click("#guest-continue-button");
    await wait('window.PPSC_CLOUD?.getStatus().phase === "guest-ready" && !document.getElementById("protected-app").hidden');
    await start("general-knowledge", "learn", { end: 2 }); await click("#action-button");
    const guestLearn = await active();
    await start("pakistan-studies", "quiz", { end: 2 }); await answer(false);
    await resume("general-knowledge", keyFor("general-knowledge", "learn"), guestLearn);
    assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(ARCHIVE)})`), "PRIVATE-OWNER-ARCHIVE");
    assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(ACTIVE)})`), "PRIVATE-OWNER-ACTIVE");
    assert(await client.evaluate("localStorage.getItem('ppsc-prep:guest:category-sessions:v1') !== null"));
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && window.PPSC_CLOUD?.getStatus().phase === "guest-ready"');
    await resume("general-knowledge", keyFor("general-knowledge", "learn"), guestLearn);
    assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(ARCHIVE)})`), "PRIVATE-OWNER-ARCHIVE");
    assert.deepEqual(cloudRequests, [], "guest progress must not reach cloud endpoints");
    assert.deepEqual(errors, [], "no browser runtime/console errors are allowed");
    console.log(JSON.stringify({ ok: true, url, allCategories: ids.length, learnQuizSeparate: true,
      previewReadOnly: true, nativeKeyboard: true, checkedAndUncheckedQuizRestore: true,
      globalContinue: true, staleActiveSplitWriteRecovery: true, reload: true, isolatedCompletion: true, wrongQuizSeparate: true,
      sourceImportantAndDifficultProfiles: true, guestIsolation: true, guestReload: true,
      bankBefore: baselineCount, bankAfter: currentBankCount, additiveBankReleaseTested: currentBankCount > baselineCount,
      preservedCurrentAffairsRange: caRange,
      appendedCurrentAffairsTested,
      queuePreserved: true, errors, cloudRequests, screenshots,
      browser: "Browser plugin unavailable; repository native Chrome/CDP e2e harness" }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill(); await new Promise(resolve => server.close(resolve)); await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-category-progress-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
