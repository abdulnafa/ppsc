"use strict";

// Native Chrome/CDP regression test. A mapped non-development hostname exercises
// the real access gate, while blocked Firebase imports prevent live account use.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");
const root = path.resolve(__dirname, "..");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ownerKeys = [
  "ppsc-prep:active-session:v1",
  "ppsc-prep:retry-queue:v1",
  "ppsc-prep:difficult-question-ids:v1"
];
const ownerValues = Object.fromEntries(ownerKeys.map((key, index) => [key, "OWNER-PRIVATE-SENTINEL-" + index]));
const guestKey = (key) => key.replace("ppsc-prep:", "ppsc-prep:guest:");

async function main() {
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge is required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-guest-test-"));
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://ppsc-guest.test").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader("Content-Type", ({
      ".js": "application/javascript", ".html": "text/html", ".css": "text/css", ".woff2": "font/woff2"
    })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://ppsc-guest.test:${server.address().port}/`;
  const port = 40000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--incognito", "--no-sandbox", "--disable-gpu", "--no-first-run",
    "--disable-extensions", "--no-proxy-server", "--host-resolver-rules=MAP ppsc-guest.test 127.0.0.1",
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [];
  const consoleErrors = [];
  const cloudRequests = [];
  const sdkRequests = [];
  const pendingSdkRequests = [];
  let failSdkImports = false;
  const screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description || "").join(" "));
      }
      if (message.method === "Network.requestWillBeSent") {
        const requested = message.params.request.url;
        if (/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/.test(requested)) {
          cloudRequests.push(requested);
        }
        if (requested.startsWith("https://www.gstatic.com/firebasejs/")) sdkRequests.push(requested);
      }
      if (message.method === "Fetch.requestPaused") {
        if (!failSdkImports) pendingSdkRequests.push(message.params.requestId);
        else client.send("Fetch.failRequest", {
          requestId: message.params.requestId, errorReason: "BlockedByClient"
        }).catch((error) => runtimeErrors.push("SDK interception: " + error.message));
      }
    });
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Network.enable");
    await client.send("Fetch.enable", {
      patterns: [{ urlPattern: "https://www.gstatic.com/firebasejs/*", requestStage: "Request" }]
    });
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `(() => {
        if (location.hostname !== "ppsc-guest.test" || sessionStorage.getItem("guest-smoke:seeded")) return;
        for (const [key, value] of Object.entries(${JSON.stringify(ownerValues)})) localStorage.setItem(key, value);
        sessionStorage.setItem("guest-smoke:seeded", "yes");
      })();`
    });
    await client.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    await client.send("Page.navigate", { url });
    const wait = async (condition) => {
      for (let attempt = 0; attempt < 150; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const assertOwners = async () => {
      const values = await client.evaluate(`Object.fromEntries(${JSON.stringify(ownerKeys)}.map(key => [key, localStorage.getItem(key)]))`);
      assert.deepEqual(values, ownerValues, "Guest mode touched the private owner's browser progress");
    };
    const readGuest = (key) => client.evaluate(`localStorage.getItem(${JSON.stringify(guestKey(key))})`);
    const currentGuestSession = async () => JSON.parse(await readGuest(ownerKeys[0]));
    const ready = 'window.PPSC_CLOUD?.getStatus().phase === "guest-ready" && !document.getElementById("protected-app").hidden';
    const pressEnter = async () => {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r"
      });
      await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    };
    const capture = async (name, width, height, dark) => {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile: width < 500
      });
      await client.evaluate(`(() => {
        if (document.documentElement.getAttribute("data-theme") !== ${JSON.stringify(dark ? "dark" : "light")}) {
          [...document.querySelectorAll("[data-theme-toggle]")].find(button => button.getClientRects().length).click();
        }
        window.scrollTo(0, 0);
      })()`);
      await pause(600);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), name + " has horizontal overflow");
      const file = path.join(os.tmpdir(), `ppsc-guest-${name}.png`);
      fs.writeFileSync(file, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(file);
    };

    // Hold imports long enough to capture the real entry UI, then deliberately
    // fail them. No Firebase script or remote account data is ever loaded.
    await wait('document.readyState === "complete" && window.PPSC_CLOUD?.getStatus().phase === "loading"');
    await capture("login-desktop", 1366, 900, false);
    await capture("login-mobile-dark", 320, 900, true);
    failSdkImports = true;
    await Promise.all(pendingSdkRequests.splice(0).map((requestId) => client.send("Fetch.failRequest", {
      requestId, errorReason: "BlockedByClient"
    })));
    await wait('window.PPSC_CLOUD?.getStatus().phase === "error"');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert(await client.evaluate('!document.getElementById("auth-gate").hidden && document.getElementById("protected-app").hidden'));
    assert(await client.evaluate('!document.getElementById("guest-continue-button").disabled'), "Guest must work when Firebase fails");
    assert(sdkRequests.length > 0, "The test accidentally bypassed the production Firebase gate");
    await assertOwners();

    // Activate the guest action with a real keyboard event, not an API bypass.
    await client.evaluate('document.getElementById("guest-continue-button").focus()');
    await pressEnter();
    await wait(ready);
    assert.equal(await client.evaluate('sessionStorage.getItem("ppsc-prep:access-mode:v1")'), "guest");
    assert(await client.evaluate('document.getElementById("auth-gate").hidden && !document.getElementById("guest-mode-note").hidden'));
    assert(await client.evaluate('!document.getElementById("guest-sign-in-button").hidden && document.getElementById("sign-out-button").hidden && document.getElementById("cloud-user-email").hidden'));
    assert.match(await client.evaluate('document.getElementById("cloud-sync-status-text").textContent'), /Guest.*local only/);
    assert(await client.evaluate('document.getElementById("continue-session-card").hidden'), "Guest showed the owner's Continue card");
    assert(await client.evaluate('document.querySelectorAll("#category-grid [data-category]").length >= 10'), "Categories did not load");
    await assertOwners();
    await capture("desktop", 1366, 900, false);
    await capture("mobile-dark", 320, 900, true);
    const sdkRequestsAfterEntry = sdkRequests.length;

    // Create all three types of guest progress via ordinary UI controls.
    await client.evaluate(`(() => {
      document.querySelector('#category-grid [data-category="general-knowledge"]').click();
      document.getElementById("quiz-mode-button").click();
      document.getElementById("question-range-start-input").value = "1";
      document.getElementById("question-range-end-input").value = "5";
      document.getElementById("question-range-form").requestSubmit();
    })()`);
    await wait('!document.getElementById("quiz-screen").hidden && !!document.getElementById("question-text").dataset.questionId');
    const quiz = await currentGuestSession();
    assert.equal(quiz.mode, "quiz");
    await client.evaluate(`(() => {
      const saved = JSON.parse(localStorage.getItem(${JSON.stringify(guestKey(ownerKeys[0]))}));
      const question = window.PPSC_QUIZ_DATA.questions.find(item => item.id === saved.questionIds[0]);
      const wrong = saved.optionOrders[0].findIndex(index => index !== question.correctOptionIndex);
      document.querySelector('#options-container [data-option-index="' + wrong + '"]').click();
      document.getElementById("action-button").click();
      document.getElementById("difficult-checkbox").click();
    })()`);
    assert(await client.evaluate('!document.getElementById("feedback").hidden'), "Quiz did not reveal feedback");
    const savedQueue = await readGuest(ownerKeys[1]);
    assert(savedQueue && savedQueue.includes(quiz.questionIds[0]), "Wrong answer did not enter the guest queue");
    assert((await readGuest(ownerKeys[2]))?.includes(quiz.questionIds[0]), "Difficult mark did not save in guest storage");
    await client.evaluate('document.getElementById("action-button").click()');
    const quizAtSecond = await currentGuestSession();
    assert.equal(quizAtSecond.currentIndex, 1);
    await assertOwners();
    await client.send("Page.reload");
    await wait(ready + ' && !document.getElementById("continue-session-card").hidden');
    await client.evaluate('document.getElementById("continue-session-button").click()');
    assert.equal(await client.evaluate('document.getElementById("question-text").dataset.questionId'), quizAtSecond.questionIds[1]);
    assert.equal((await currentGuestSession()).currentIndex, 1, "Guest quiz did not resume at the saved position");
    const queueAfterRefresh = JSON.parse(await readGuest(ownerKeys[1]));
    const queueBeforeRefresh = JSON.parse(savedQueue);
    assert.deepEqual(queueAfterRefresh.items, queueBeforeRefresh.items, "Guest queued attempts changed on refresh");
    assert.deepEqual(queueAfterRefresh.wrongQuestionIds, queueBeforeRefresh.wrongQuestionIds, "Guest wrong-question list changed on refresh");
    assert.deepEqual(queueAfterRefresh.queueCyclePendingByCategory, queueBeforeRefresh.queueCyclePendingByCategory, "Guest queue cycle changed on refresh");
    assert.equal(sdkRequests.length, sdkRequestsAfterEntry, "Guest refresh attempted to load Firebase");
    await assertOwners();

    // Learning remains a separate ordinary flow and its reveal/position resumes.
    await client.evaluate(`(() => {
      document.getElementById("back-button").click();
      document.querySelector('#category-grid [data-category="pakistan-studies"]').click();
      document.getElementById("learn-mode-button").click();
      document.getElementById("question-range-start-input").value = "1";
      document.getElementById("question-range-end-input").value = "4";
      document.getElementById("question-range-form").requestSubmit();
      document.getElementById("action-button").click();
    })()`);
    assert.equal((await currentGuestSession()).mode, "learn");
    assert.equal((await currentGuestSession()).submitted, true, "Learning reveal was not saved");
    await client.evaluate('document.getElementById("action-button").click()');
    const learnAtSecond = await currentGuestSession();
    assert.equal(learnAtSecond.currentIndex, 1);
    await client.send("Page.reload");
    await wait(ready + ' && !document.getElementById("continue-session-card").hidden');
    await client.evaluate('document.getElementById("continue-session-button").click()');
    assert.equal(await client.evaluate('document.getElementById("question-text").dataset.questionId'), learnAtSecond.questionIds[1]);
    assert.equal(await client.evaluate('document.getElementById("action-button").textContent.trim()'), "Show Answer");
    assert.equal(sdkRequests.length, sdkRequestsAfterEntry, "Learning refresh attempted to load Firebase");
    await assertOwners();
    await capture("learning-mobile-dark", 320, 900, true);

    // Returning to the login gate keeps the two data namespaces separate.
    const guestBeforeExit = await client.evaluate(`Object.fromEntries(${JSON.stringify(ownerKeys.map(guestKey))}.map(key => [key, localStorage.getItem(key)]))`);
    await client.evaluate('document.getElementById("guest-sign-in-button").click()');
    await wait('window.PPSC_CLOUD?.getStatus().phase === "error" && !document.getElementById("auth-gate").hidden');
    assert(await client.evaluate('document.getElementById("protected-app").hidden'), "Leaving guest failed to restore the login gate");
    assert.notEqual(await client.evaluate('sessionStorage.getItem("ppsc-prep:access-mode:v1")'), "guest");
    await assertOwners();
    assert.deepEqual(await client.evaluate(`Object.fromEntries(${JSON.stringify(ownerKeys.map(guestKey))}.map(key => [key, localStorage.getItem(key)]))`), guestBeforeExit);
    await client.evaluate('document.getElementById("guest-continue-button").click()');
    await wait(ready + ' && !document.getElementById("continue-session-card").hidden');
    await client.evaluate('document.getElementById("continue-session-button").click()');
    assert.equal((await currentGuestSession()).currentIndex, 1);
    assert.equal((await currentGuestSession()).mode, "learn");
    await assertOwners();

    assert.deepEqual(cloudRequests, [], "Guest browser attempted account/cloud data access");
    assert.deepEqual(runtimeErrors, []);
    assert.deepEqual(consoleErrors, []);
    console.log(JSON.stringify({
      ok: true, url, browser: "Isolated headless Chrome incognito; native CDP harness",
      realGate: true, firebaseSdkBlocked: true, guestKeyboardEntry: true,
      ownerStoragePreserved: true, guestQuizResume: true, guestLearnResume: true,
      guestQueuePreserved: true, guestExitAndReentry: true, cloudRequests,
      runtimeErrors, consoleErrors, screenshots
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise((resolve) => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-guest-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
