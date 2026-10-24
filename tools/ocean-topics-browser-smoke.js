"use strict";

// Study Tools -> Oceans & Seas. Native Chrome/CDP; no browser dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");

const root = path.resolve(__dirname, "..");
const dataFile = path.join(root, "data/ocean-topics.json");
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  const fixture = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  assert.equal(fixture.schemaVersion, 1);
  assert(Array.isArray(fixture.groups) && fixture.groups.length > 0, "Ocean data needs groups");
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-oceans-test-"));
  let dataRequests = 0;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/data/ocean-topics.json") dataRequests += 1;
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
  const port = 32000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
    "--disable-extensions", "--no-proxy-server", `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, "about:blank"
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
    const snapshot = () => client.evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])))`);
    const capture = async (label, width, dark, selector) => {
      await client.evaluate("document.activeElement?.blur()");
      await client.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await client.evaluate(`(() => {
        document.documentElement.dataset.theme = ${JSON.stringify(dark ? "dark" : "light")};
        document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ behavior: "instant", block: "start" });
      })()`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), label + ": horizontal overflow");
      const screenshot = path.join(os.tmpdir(), `ppsc-oceans-${label}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
    };

    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url, "Unexpected page URL");
    assert.match(await client.evaluate("document.title"), /PPSC Prep/, "Unexpected page title");
    assert.equal(dataRequests, 0, "Ocean data should load only when its tab opens");
    assert(await client.evaluate(`(() => {
      const card = document.getElementById("ocean-topics-card");
      return card?.parentElement.id === "study-tools-options"
        && card.getAttribute("aria-controls") === "ocean-topics-screen"
        && document.getElementById("ocean-topics-screen").hidden
        && document.querySelectorAll("#category-grid .category-card").length === 11
        && !document.querySelector("vite-error-overlay, nextjs-portal");
    })()`), "Study Tools launcher, first screen, or framework state is incorrect");

    // Seed a real in-progress quiz and retry item before opening this read-only library.
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
    assert(await client.evaluate(`JSON.parse(localStorage.getItem('ppsc-prep:retry-queue:v1')).items.length > 0`), "Expected a genuine saved retry item");
    const savedBefore = await snapshot();
    await client.evaluate(`(() => {
      if (!document.getElementById("study-tools-box").open) document.getElementById("study-tools-summary").click();
      document.getElementById("ocean-topics-card").click();
    })()`);
    await wait('!document.getElementById("ocean-topics-screen").hidden && document.querySelectorAll("#ocean-topics-list details.ocean-topics-group[data-group-id]").length > 0');
    assert.equal(dataRequests, 1, "Opening must fetch ocean data exactly once");

    const checks = await client.evaluate(`(async () => {
      const groups = ${JSON.stringify(fixture.groups)};
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const screen = document.getElementById('ocean-topics-screen');
      const list = document.getElementById('ocean-topics-list');
      const search = document.getElementById('ocean-topics-search');
      const bank = new Map(window.PPSC_QUIZ_DATA.questions.map(question => [question.id, question]));
      const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\\s+/g, ' ').trim();
      check(document.getElementById('category-screen').hidden && !screen.hidden, 'Ocean screen navigation failed');
      check(document.getElementById('ocean-topics-status').textContent.trim().length > 0, 'Status is empty');
      check(!/Â·|Ø¬|â†/.test(screen.textContent), 'Visible text contains encoding artifacts');
      check(!document.querySelector('vite-error-overlay, nextjs-portal'), 'Framework overlay shown');
      const groupNodes = [...list.querySelectorAll('details.ocean-topics-group[data-group-id]')];
      check(JSON.stringify(groupNodes.map(node => node.dataset.groupId)) === JSON.stringify(groups.map(group => group.id)), 'Group order or IDs differ from data');
      let topicCount = 0, linkedMcqCount = 0;
      for (const group of groups) {
        const groupNode = groupNodes.find(node => node.dataset.groupId === group.id);
        check(!!groupNode?.querySelector(':scope > summary'), group.id + ': native group accordion missing');
        if (!groupNode) continue;
        groupNode.open = true;
        await new Promise(resolve => setTimeout(resolve, 20));
        const topicNodes = [...groupNode.querySelectorAll('details.ocean-topics-item[data-topic-id]')];
        check(JSON.stringify(topicNodes.map(node => node.dataset.topicId)) === JSON.stringify(group.topics.map(topic => topic.id)), group.id + ': topic order or IDs differ from data');
        for (const topic of group.topics) {
          topicCount += 1;
          const topicNode = topicNodes.find(node => node.dataset.topicId === topic.id);
          if (!topicNode) continue;
          check(!!topicNode.querySelector(':scope > summary'), topic.id + ': native topic accordion missing');
          check(normalize(topicNode.querySelector(':scope > summary')?.textContent).includes(normalize(topic.name)), topic.id + ': name missing');
          topicNode.open = true;
          await new Promise(resolve => setTimeout(resolve, 10));
          check(normalize(topicNode.textContent).includes(normalize(topic.detail)), topic.id + ': detail missing');
          const link = topicNode.querySelector('a.ocean-topics-source[href]');
          check(link?.href === topic.sourceUrl && link.protocol === 'https:' && link.target === '_blank' && link.rel.includes('noopener'), topic.id + ': primary-source link missing or unsafe');
          const cards = [...topicNode.querySelectorAll('.ocean-topics-mcq[data-question-id]')];
          check(cards.length === topic.questionIds.length, topic.id + ': linked MCQ count differs from data');
          for (const questionId of topic.questionIds) {
            const question = bank.get(questionId);
            check(!!question, topic.id + ': unknown MCQ ' + questionId);
            if (!question) continue;
            const card = cards.find(item => item.dataset.questionId === questionId);
            check(!!card, topic.id + ': MCQ card missing for ' + questionId);
            if (card) {
              const useUrdu = question.categoryId === 'urdu' && question.questionUrdu;
              const prompt = useUrdu ? question.questionUrdu : question.question;
              const options = useUrdu && Array.isArray(question.optionsUrdu) ? question.optionsUrdu : question.options;
              check(normalize(card.textContent).includes(normalize(prompt)), topic.id + ': canonical question missing for ' + questionId);
              check(normalize(card.textContent).includes(normalize(options[question.correctOptionIndex])), topic.id + ': correct answer missing for ' + questionId);
            }
            linkedMcqCount += 1;
          }
        }
      }
      const first = groups.flatMap(group => group.topics)[0];
      check(!!first, 'No topics available for search test');
      if (first) {
        search.value = first.name;
        search.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 40));
        check([...list.querySelectorAll('.ocean-topics-item')].some(node => node.dataset.topicId === first.id), 'Search failed to find topic by name');
      }
      const linked = groups.flatMap(group => group.topics).find(topic => topic.questionIds.length > 0);
      const linkedQuestion = linked && bank.get(linked.questionIds[0]);
      if (linkedQuestion) {
        for (const term of [linkedQuestion.question, linkedQuestion.options[linkedQuestion.correctOptionIndex]]) {
          search.value = term;
          search.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, 40));
          check([...list.querySelectorAll('.ocean-topics-item')].some(node => node.dataset.topicId === linked.id), 'Search failed for canonical question or correct answer');
        }
      }
      search.value = '___no_ocean_topic_733___';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 40));
      check(list.querySelectorAll('.ocean-topics-item').length === 0, 'Impossible search did not empty results');
      document.getElementById('ocean-topics-clear').click();
      await new Promise(resolve => setTimeout(resolve, 40));
      check(search.value === '' && list.querySelectorAll('.ocean-topics-item').length === topicCount, 'Clear search did not restore all topics');
      const view = document.getElementById('ocean-topics-view');
      for (const choice of ['linked', 'extra']) {
        view.value = choice;
        view.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 40));
        const expected = groups.flatMap(group => group.topics)
          .filter(topic => choice === 'linked' ? topic.questionIds.length > 0 : topic.questionIds.length === 0)
          .map(topic => topic.id).sort();
        const actual = [...list.querySelectorAll('.ocean-topics-item')].map(node => node.dataset.topicId).sort();
        check(JSON.stringify(actual) === JSON.stringify(expected), choice + ': topic filter mismatch');
      }
      document.getElementById('ocean-topics-clear').click();
      await new Promise(resolve => setTimeout(resolve, 40));
      check(view.value === 'all' && list.querySelectorAll('.ocean-topics-item').length === topicCount, 'Clear filters did not restore All topics');
      return { errors, groupCount: groups.length, topicCount, linkedMcqCount };
    })()`);
    assert.deepEqual(checks.errors, []);
    assert.equal(await snapshot(), savedBefore, "Ocean library changed saved quiz or retry queue");
    await capture("desktop", 1366, false, "#ocean-topics-screen");
    await capture("mobile-dark", 320, true, "#ocean-topics-list");
    const sampleTopic = fixture.groups.flatMap(group => group.topics).find(topic => topic.questionIds.length > 0);
    assert(sampleTopic, "Need at least one topic with a linked MCQ for expanded screenshot");
    await client.evaluate(`(() => {
      const item = document.querySelector('.ocean-topics-item[data-topic-id="${sampleTopic.id}"]');
      item.closest('.ocean-topics-group').open = true;
      item.open = true;
    })()`);
    await wait(`document.querySelector('.ocean-topics-item[data-topic-id="${sampleTopic.id}"][open] .ocean-topics-mcq')`);
    await capture("mobile-dark-topic", 320, true, `.ocean-topics-item[data-topic-id="${sampleTopic.id}"]`);
    await client.evaluate(`document.getElementById('ocean-topics-back').click()`);
    assert(await client.evaluate('document.getElementById("ocean-topics-screen").hidden'), "Back did not close ocean library");
    assert.equal(await snapshot(), savedBefore, "Back navigation changed saved progress");
    await client.evaluate(`document.getElementById('ocean-topics-card').click()`);
    await wait('!document.getElementById("ocean-topics-screen").hidden && document.querySelectorAll("#ocean-topics-list .ocean-topics-item").length > 0');
    assert.equal(dataRequests, 1, "Reopening should reuse loaded ocean data");
    assert.equal(await snapshot(), savedBefore, "Reopening changed saved progress");
    await client.evaluate(`document.getElementById('ocean-topics-map').click()`);
    await wait('!document.getElementById("world-map-screen").hidden && document.getElementById("world-map-layer").value === "marine"');
    assert(await client.evaluate('document.getElementById("ocean-topics-screen").hidden'), "Map navigation left ocean screen visible");
    assert.equal(await snapshot(), savedBefore, "Map navigation changed saved progress");
    assert.deepEqual(runtimeErrors, [], "Browser console/runtime errors");
    console.log(JSON.stringify({
      ok: true, url, ...checks, lazyLoaded: true, progressPreserved: true,
      desktopAndMobile: true, mapMarineLayer: true, runtimeErrors, screenshots,
      browser: "Browser plugin unavailable; isolated native Chrome/CDP harness"
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-oceans-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
