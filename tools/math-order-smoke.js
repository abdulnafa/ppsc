"use strict";

// Categories -> Math Learn/Quiz -> exact source/similar bank order. A previously
// saved shuffled Math Quiz must still Continue in its frozen order and position.
// Browser plugin is unavailable; reuse the repository's Chrome/CDP e2e harness.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const vm = require("node:vm");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");

const root = path.resolve(__dirname, "..");
const ACTIVE = "ppsc-prep:active-session:v1";
const ARCHIVE = "ppsc-prep:category-sessions:v1";
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function readBank() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "data/questions.js"), "utf8"), context);
  return context.window.PPSC_QUIZ_DATA.questions;
}

async function main() {
  const bank = Array.from(readBank());
  const math = bank.filter(question => question.categoryId === "basic-mathematics");
  const general = bank.filter(question => question.categoryId === "general-knowledge");
  assert(math.length >= 12 && general.length >= 12, "Both category fixtures need at least 12 MCQs");
  for (let index = 0; index < 12; index += 2) {
    assert.equal(math[index].kind, "source", "Math source must precede its similar question");
    assert.equal(math[index + 1].kind, "similar", "Math similar must follow its source");
    assert.equal(math[index].pairId, math[index + 1].pairId, "Math source and similar pair must match");
  }

  const chrome = [
    process.env.PPSC_TEST_CHROME,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
  ].find(candidate => candidate && fs.existsSync(candidate));
  assert(chrome, "Chrome or Edge is required for the Math order browser smoke test");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-math-order-test-"));
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", ({
      ".js": "application/javascript", ".html": "text/html", ".css": "text/css",
      ".json": "application/json", ".woff2": "font/woff2"
    })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const port = 35000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-extensions",
    "--no-proxy-server", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [], screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", event => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        runtimeErrors.push(message.params.args.map(argument => argument.value || argument.description || "").join(" "));
      }
    });
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Network.enable");
    await client.send("Network.setBlockedURLs", { urls: ["https://www.gstatic.com/firebasejs/*"] });
    const wait = async condition => {
      for (let attempt = 0; attempt < 180; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const click = selector => client.evaluate(`(() => {
      const control = document.querySelector(${JSON.stringify(selector)});
      if (!control || control.disabled) throw new Error("Missing or disabled control: " + ${JSON.stringify(selector)});
      control.click();
    })()`);
    const active = async () => JSON.parse(await client.evaluate(`localStorage.getItem(${JSON.stringify(ACTIVE)})`));
    const toCategories = async () => {
      if (await client.evaluate('!document.getElementById("quiz-screen").hidden')) await click("#back-button");
      if (await client.evaluate('!document.getElementById("mode-screen").hidden')) await click("#mode-back-button");
      await wait('!document.getElementById("category-screen").hidden');
    };
    const openRange = async (category, mode) => {
      await toCategories();
      await click(`#category-grid [data-category="${category}"]`);
      await click(`#${mode}-mode-button`);
      await wait('!document.getElementById("question-range-options").hidden');
    };
    const start = async (category, mode, first, last) => {
      await openRange(category, mode);
      await client.evaluate(`(() => {
        document.getElementById("question-range-start-input").value = ${JSON.stringify(String(first))};
        document.getElementById("question-range-end-input").value = ${JSON.stringify(String(last))};
        document.getElementById("question-range-form").requestSubmit();
      })()`);
      await wait('!document.getElementById("quiz-screen").hidden');
      return active();
    };
    const capture = async (label, width, selector) => {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width, height: 900, deviceScaleFactor: 1, mobile: width < 500
      });
      await client.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:"instant",block:"start"})`);
      await pause(120);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), label + ": horizontal overflow");
      const screenshot = path.join(os.tmpdir(), `ppsc-math-order-${label}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
    };

    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(await client.evaluate('Boolean(document.querySelector("vite-error-overlay,nextjs-portal"))'), false);

    // A range is still positional: starting at item 2 deliberately starts
    // with a similar question; the app must not silently widen the range.
    await openRange("basic-mathematics", "learn");
    assert.match(await client.evaluate('document.getElementById("question-range-help").textContent'), /original source-to-similar order/);
    await capture("range-desktop", 1366, "#question-range-options");
    await client.evaluate(`(() => {
      document.getElementById("question-range-start-input").value = "2";
      document.getElementById("question-range-end-input").value = "7";
      document.getElementById("question-range-form").requestSubmit();
    })()`);
    await wait('!document.getElementById("quiz-screen").hidden');
    const partialMathLearn = await active();
    assert.deepEqual(partialMathLearn.questionIds, math.slice(1, 7).map(question => question.id));
    assert.deepEqual(partialMathLearn.rangeQuestionIds, partialMathLearn.questionIds);
    assert.equal(partialMathLearn.rangeStart, 2);
    assert.equal(partialMathLearn.rangeEnd, 7);

    const mathLearn = await start("basic-mathematics", "learn", 1, 12);
    assert.deepEqual(mathLearn.questionIds, math.slice(0, 12).map(question => question.id));
    assert.equal(mathLearn.mode, "learn");
    const secondMathLearn = await start("basic-mathematics", "learn", 1, 12);
    assert.deepEqual(secondMathLearn.questionIds, mathLearn.questionIds, "New Math Learn must repeat canonical order");
    const mathQuiz = await start("basic-mathematics", "quiz", 1, 12);
    assert.deepEqual(mathQuiz.questionIds, mathLearn.questionIds, "Math Quiz must match canonical Learn order");
    assert.equal(mathQuiz.mode, "quiz");
    await capture("quiz-mobile", 375, "#quiz-screen");

    const generalLearn = await start("general-knowledge", "learn", 1, 12);
    assert.deepEqual([...generalLearn.questionIds].sort(), general.slice(0, 12).map(question => question.id).sort());
    assert.notDeepEqual(generalLearn.questionIds, general.slice(0, 12).map(question => question.id),
      "Non-Math Learn should still shuffle");
    const generalQuiz = await start("general-knowledge", "quiz", 1, 12);
    assert.deepEqual([...generalQuiz.questionIds].sort(), general.slice(0, 12).map(question => question.id).sort());
    assert.notDeepEqual(generalQuiz.questionIds, general.slice(0, 12).map(question => question.id),
      "Non-Math Quiz should still shuffle");

    // Simulate an older in-progress Math Quiz: its first answer and current
    // position are real, while later MCQs have a frozen noncanonical shuffle.
    await start("basic-mathematics", "quiz", 1, 12);
    await client.evaluate(`(() => {
      const saved = JSON.parse(localStorage.getItem(${JSON.stringify(ACTIVE)}));
      const question = window.PPSC_QUIZ_DATA.questions.find(item => item.id === saved.questionIds[0]);
      const correct = saved.optionOrders[0].indexOf(question.correctOptionIndex);
      document.querySelector('#options-container [data-option-index="' + correct + '"]').click();
      document.getElementById('action-button').click();
      document.getElementById('action-button').click();
    })()`);
    const answered = await active();
    assert.equal(answered.currentIndex, 1);
    assert.equal(answered.score, 1);
    assert.deepEqual(answered.answerHistory[0], [answered.optionOrders[0].indexOf(math[0].correctOptionIndex), true]);
    const legacyOrder = [0, 1, 4, 5, 2, 3, 8, 9, 6, 7, 10, 11];
    const frozen = JSON.parse(JSON.stringify(answered));
    for (const field of ["questionIds", "optionOrders", "answerHistory"]) {
      frozen[field] = legacyOrder.map(index => answered[field][index]);
    }
    frozen.savedAt = answered.savedAt + 1000;
    assert.notDeepEqual(frozen.questionIds, math.slice(0, 12).map(question => question.id));
    await client.evaluate(`(() => {
      const frozen = ${JSON.stringify(frozen)};
      localStorage.setItem(${JSON.stringify(ACTIVE)}, JSON.stringify(frozen));
      const archive = JSON.parse(localStorage.getItem(${JSON.stringify(ARCHIVE)}));
      const key = Object.keys(archive.sessions).find(key => key.startsWith('basic-mathematics:quiz:all:all:all'));
      if (!key) throw new Error('Missing archived Math Quiz');
      archive.sessions[key] = frozen;
      localStorage.setItem(${JSON.stringify(ARCHIVE)}, JSON.stringify(archive));
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    await click("#continue-session-button");
    await wait('!document.getElementById("quiz-screen").hidden');
    const resumed = await active();
    assert.deepEqual(resumed.questionIds, frozen.questionIds, "Continue must preserve the older shuffled order");
    assert.deepEqual(resumed.optionOrders, frozen.optionOrders, "Continue must preserve shuffled options");
    assert.equal(resumed.currentIndex, 1, "Continue must preserve position");
    assert.equal(resumed.score, 1, "Continue must preserve score");
    assert.deepEqual(resumed.answerHistory, frozen.answerHistory, "Continue must preserve answer history");
    assert.equal(await client.evaluate('document.getElementById("question-text").dataset.questionId'), frozen.questionIds[1]);
    assert.deepEqual(runtimeErrors, [], "Browser runtime/console errors");

    console.log(JSON.stringify({
      ok: true, url, mathRange: [1, 12], mathLearnAndQuizCanonical: true,
      nonMathLearnAndQuizShuffled: true, oldMathQuizResumePreserved: true,
      runtimeErrors, screenshots,
      browser: "Browser plugin unavailable; isolated native Chrome/CDP harness"
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep)
      && path.basename(resolved).startsWith("ppsc-math-order-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
