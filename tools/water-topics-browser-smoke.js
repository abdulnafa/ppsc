"use strict";

// Reuses the repository's native Chrome/CDP harness without new dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");
const root = path.resolve(__dirname, "..");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-water-test-"));
  let dataRequests = 0;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/data/pakistan-water-topics.js" && ++dataRequests === 1) {
      response.writeHead(503); response.end("Intentional first-load failure for retry test"); return;
    }
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
  const url = `http://127.0.0.1:${server.address().port}/`;
  const guestUrl = `http://ppsc-water.test:${server.address().port}/`;
  const port = 30000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
    "--disable-extensions", "--no-proxy-server", "--host-resolver-rules=MAP ppsc-water.test 127.0.0.1",
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [], cloudRequests = [], screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        runtimeErrors.push(message.params.args.map(arg => arg.value || arg.description || "").join(" "));
      }
      if (message.method === "Network.requestWillBeSent"
        && /firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/.test(message.params.request.url)) {
        cloudRequests.push(message.params.request.url);
      }
    });
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Network.enable");
    await client.send("Network.setBlockedURLs", { urls: ["https://www.gstatic.com/firebasejs/*"] });
    await client.send("Page.navigate", { url });
    const wait = async (condition) => {
      for (let attempt = 0; attempt < 150; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const snapshot = () => client.evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])))`);
    const capture = async (name, width, dark, scrollSelector) => {
      await client.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await client.evaluate(`(() => {
        document.documentElement.setAttribute('data-theme', ${JSON.stringify(dark ? "dark" : "light")});
        ${scrollSelector ? `document.querySelector(${JSON.stringify(scrollSelector)}).scrollIntoView({ behavior: 'instant', block: 'start' });` : "window.scrollTo(0,0);"}
      })()`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), name + " has horizontal overflow");
      const screenshot = path.join(os.tmpdir(), `ppsc-water-${name}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
    };
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(dataRequests, 0, "Water data must not load on home");
    assert(await client.evaluate(`(() => {
      const card = document.getElementById('water-topics-card');
      return card?.parentElement.id === 'study-tools-options'
        && document.querySelectorAll('#water-topics-card').length === 1
        && document.querySelectorAll('#study-tools-options > button').length === 3
        && document.querySelectorAll('#category-grid .category-card').length === 11
        && !document.getElementById('study-tools-box').contains(document.getElementById('category-grid'));
    })()`), "Water library must be the third Study Tools launcher without changing subjects");
    await client.evaluate(`document.getElementById('study-tools-summary').click()`);
    await capture("home-desktop", 1366, false, "#study-tools-box");
    await capture("home-mobile-dark", 320, true, "#water-topics-card");
    // Seed a real wrong answer and unfinished Quiz, without manufacturing storage.
    await client.evaluate(`(() => {
      document.querySelector('#category-grid [data-category="general-knowledge"]').click();
      document.getElementById('quiz-mode-button').click();
      document.getElementById('question-range-start-input').value = '1';
      document.getElementById('question-range-end-input').value = '5';
      document.getElementById('question-range-form').requestSubmit();
      const saved = JSON.parse(localStorage.getItem('ppsc-prep:active-session:v1'));
      const question = window.PPSC_QUIZ_DATA.questions.find(item => item.id === saved.questionIds[0]);
      const wrong = saved.optionOrders[0].findIndex(index => index !== question.correctOptionIndex);
      document.querySelector('#options-container [data-option-index="' + wrong + '"]').click();
      document.getElementById('action-button').click();
      document.getElementById('back-button').click();
    })()`);
    assert(await client.evaluate(`JSON.parse(localStorage.getItem('ppsc-prep:retry-queue:v1')).items.length > 0`), "Expected genuine queued wrong answer");
    const savedBefore = await snapshot();
    await client.evaluate(`document.getElementById('water-topics-card').click()`);
    await wait('!document.getElementById("water-topics-error").hidden');
    assert.equal(dataRequests, 1);
    await client.evaluate('document.getElementById("water-topics-retry").click()');
    await wait('document.querySelectorAll(".water-topic").length > 0');
    assert.equal(dataRequests, 2);
    const checks = await client.evaluate(`(async () => {
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const el = id => document.getElementById('water-topics-' + id);
      const topics = window.PPSC_WATER_TOPICS_DATA.topics;
      const bank = new Map(window.PPSC_QUIZ_DATA.questions.map(q => [q.id, q]));
      const normal = value => String(value || '').toLowerCase().replace(/\\s+/g, ' ').trim();
      const answer = question => question.options[question.correctOptionIndex];
      const search = value => { el('search').value = value; el('search').dispatchEvent(new Event('input')); };
      const openAll = async () => {
        [...el('list').querySelectorAll('.water-topic')].forEach(topic => { topic.open = true; });
        await new Promise(resolve => setTimeout(resolve, 50));
      };
      check(document.getElementById('category-screen').hidden && !el('screen').hidden, 'Library navigation failed');
      check(!document.querySelector('.water-topic-questions'), 'Closed accordions eagerly rendered MCQs');
      check(el('coverage').textContent.trim().length > 0, 'Coverage note missing');
      check(el('status').textContent.trim().length > 0, 'Status missing');
      const topicNodes = [...el('list').querySelectorAll('.water-topic')];
      check(topicNodes.length === topics.length, 'Not all water topics rendered');
      check(new Set(topicNodes.map(n => n.dataset.topicId)).size === topics.length, 'Duplicate topic accordion');
      check(topicNodes.every(n => n.tagName === 'DETAILS' && n.querySelector(':scope > summary')), 'Native accordion structure missing');
      await openAll();
      let renderedQuestions = 0;
      for (const topic of topics) {
        const node = topicNodes.find(n => n.dataset.topicId === topic.id);
        const rows = [...node.querySelectorAll('ol.water-topic-questions li[data-question-id]')];
        check(rows.length === topic.questionIds.length, topic.id + ': linked MCQ count mismatch');
        check(JSON.stringify(rows.map(n => n.dataset.questionId)) === JSON.stringify(topic.questionIds), topic.id + ': canonical MCQ order changed');
        for (const row of rows) {
          const question = bank.get(row.dataset.questionId);
          check(!!question, 'Rendered unknown MCQ ' + row.dataset.questionId);
          if (!question) continue;
          check(normal(row.textContent).includes(normal(question.question)), question.id + ': question text missing');
          check(normal(row.querySelector('.water-topic-answer')?.textContent).includes(normal(answer(question))), question.id + ': correct answer mismatch');
          if (question.sourceNotes) check([...row.querySelectorAll('.water-topic-context')].some(context => normal(context.textContent).includes(normal(question.sourceNotes))), question.id + ': source context missing');
          if (topic.questionNotes?.[question.id]) check([...row.querySelectorAll('.water-topic-context')].some(context => context.lang === 'ur-Latn' && normal(context.textContent).includes(normal(topic.questionNotes[question.id]))), question.id + ': dated/contextual Roman Urdu note missing');
          renderedQuestions += 1;
        }
        for (const reference of topic.references || []) {
          check([...node.querySelectorAll('a[href]')].some(link => link.href === reference.url && link.rel.includes('noopener')), topic.id + ': official source link missing/unsafe');
        }
      }
      search('___no_water_topic___');
      check(!el('empty').hidden && !el('list').querySelector('.water-topic'), 'Empty state failed');
      el('clear').click();
      for (const section of ['dams', 'rivers', 'barrages', 'treaties']) {
        el('section').value = section; el('section').dispatchEvent(new Event('change'));
        const expected = topics.filter(topic => topic.section === section).map(topic => topic.id).sort();
        check(JSON.stringify([...el('list').querySelectorAll('.water-topic')].map(n => n.dataset.topicId).sort()) === JSON.stringify(expected), section + ': filter mismatch');
      }
      el('clear').click();
      check(el('search').value === '' && el('section').value === 'all', 'Clear did not reset controls');
      const candidate = topics.flatMap(topic => topic.questionIds.map(id => bank.get(id))).find(q => q && q.question.length > 20);
      check(!!candidate, 'No question available to test question-only search');
      if (candidate) {
        search(candidate.question);
        await openAll();
        const query = normal(candidate.question);
        for (const node of el('list').querySelectorAll('.water-topic')) {
          const topic = topics.find(item => item.id === node.dataset.topicId);
          const topicMatch = normal(topic.title + ' ' + topic.summary).includes(query);
          const expected = topic.questionIds.filter(id => {
            const q = bank.get(id);
            return topicMatch || normal(q.question + ' ' + answer(q)).includes(query);
          });
          check(expected.length > 0, 'Unrelated topic returned for question-only search');
          check(JSON.stringify([...node.querySelectorAll('li[data-question-id]')].map(n => n.dataset.questionId)) === JSON.stringify(expected), 'Question-only search showed unrelated MCQs');
        }
        check([...el('list').querySelectorAll('li[data-question-id]')].some(n => n.dataset.questionId === candidate.id), 'Search did not find MCQ by its question');
        search(answer(candidate));
        await openAll();
        check([...el('list').querySelectorAll('li[data-question-id]')].some(n => n.dataset.questionId === candidate.id), 'Search did not find MCQ by its correct answer');
      }
      el('clear').click(); search('Tarbela');
      check(!!el('list').querySelector('.water-topic'), 'Tarbela search returned no topics');
      await openAll();
      check([...el('list').querySelectorAll('.water-topic')].some(n => /Tarbela/i.test(n.textContent)), 'Tarbela content missing');
      return { errors, topicCount: topics.length, linkedQuestionCount: renderedQuestions };
    })()`);
    assert.deepEqual(checks.errors, []);
    assert.equal(await snapshot(), savedBefore, "Water library changed saved progress");
    await capture("desktop", 1366, false);
    await capture("desktop-topic", 1366, false, ".water-topic");
    await capture("mobile-dark", 320, true);
    await capture("mobile-dark-topic", 320, true, ".water-topic");
    await client.evaluate(`document.getElementById('water-topics-collapse').click();document.querySelector('.water-topic > summary').focus();`);
    await pause(50);
    assert.equal(await client.evaluate('document.querySelectorAll(".water-topic[open]").length'), 0);
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await wait('document.querySelectorAll(".water-topic[open]").length === 1');
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await wait('document.querySelectorAll(".water-topic[open]").length === 0');
    await client.evaluate(`document.getElementById('water-topics-back').click();document.getElementById('water-topics-card').click();`);
    assert.equal(dataRequests, 2, "Reopening should reuse water data");
    assert.equal(await snapshot(), savedBefore, "Back/reopen changed saved progress");
    await client.evaluate(`document.getElementById('water-topics-back').click();document.getElementById('continue-session-button').click();`);
    assert(await client.evaluate('!document.getElementById("quiz-screen").hidden && document.getElementById("water-topics-screen").hidden'), "Continue failed after water library");
    // A mapped non-development host checks real guest access without live Firebase.
    const ownerKey = "ppsc-prep:active-session:v1";
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `if (location.hostname === 'ppsc-water.test') localStorage.setItem(${JSON.stringify(ownerKey)}, 'PRIVATE-OWNER-SENTINEL');`
    });
    await client.send("Page.navigate", { url: guestUrl });
    await wait('document.readyState === "complete" && !document.getElementById("auth-gate").hidden && window.PPSC_CLOUD?.getStatus().phase === "error"');
    assert.equal(dataRequests, 2, "Guest login screen loaded water data");
    await client.evaluate('document.getElementById("guest-continue-button").click()');
    await wait('window.PPSC_CLOUD?.getStatus().phase === "guest-ready" && !document.getElementById("protected-app").hidden');
    const guestBefore = await snapshot();
    await client.evaluate(`document.getElementById('study-tools-summary').click();document.getElementById('water-topics-card').click();`);
    await wait('document.querySelectorAll(".water-topic").length > 0 && !document.getElementById("water-topics-screen").hidden');
    await client.evaluate(`document.querySelector('.water-topic').open = true;`);
    await wait('document.querySelectorAll(".water-topic-questions li[data-question-id]").length > 0');
    await client.evaluate('document.getElementById("water-topics-back").click()');
    assert.equal(await snapshot(), guestBefore, "Guest water library changed local progress");
    assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(ownerKey)})`), "PRIVATE-OWNER-SENTINEL", "Guest touched owner progress");
    assert.deepEqual(cloudRequests, [], "Water library/guest attempted cloud account access");
    assert.deepEqual(runtimeErrors, []);
    console.log(JSON.stringify({
      ok: true, url, ...checks, lazyLoadRetry: true, progressPreserved: true, keyboard: true,
      guestAccess: true, guestOwnerIsolation: true, runtimeErrors, cloudRequests, screenshots,
      browser: "Browser plugin unavailable; isolated native Chrome/CDP harness"
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-water-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
