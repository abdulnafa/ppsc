"use strict";

// Home -> Study Tools -> Presidents -> Back -> exact saved Quiz Continue.
// Browser plugin unavailable: use the repository's isolated native Chrome/CDP harness.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");
const root = path.resolve(__dirname, "..");
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-presidents-test-"));
  let presidentRequests = 0, pmRequests = 0;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/data/prime-ministers.js") pmRequests += 1;
    if (pathname === "/data/presidents.js" && ++presidentRequests === 1) {
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
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const guestUrl = `http://ppsc-presidents.test:${server.address().port}/`;
  const port = 42000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-extensions",
    "--no-proxy-server", "--host-resolver-rules=MAP ppsc-presidents.test 127.0.0.1",
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [], cloudRequests = [], screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", event => {
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
    const wait = async condition => {
      for (let attempt = 0; attempt < 150; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const snapshot = () => client.evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])))`);
    const viewState = prefix => client.evaluate(`(() => ({
      search: document.getElementById(${JSON.stringify(prefix + "-search")}).value,
      section: document.getElementById(${JSON.stringify(prefix + "-section")}).value,
      ids: [...document.querySelectorAll(${JSON.stringify("#" + prefix + "-list .pm-entry")})].map(n => n.dataset.entryId),
      open: [...document.querySelectorAll(${JSON.stringify("#" + prefix + "-list .pm-entry[open]")})].map(n => n.dataset.entryId)
    }))()`);
    const capture = async (name, width, dark, scrollSelector) => {
      await client.evaluate("document.activeElement?.blur()");
      await client.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await client.evaluate(`(() => {
        document.documentElement.setAttribute('data-theme', ${JSON.stringify(dark ? "dark" : "light")});
        ${scrollSelector ? `document.querySelector(${JSON.stringify(scrollSelector)}).scrollIntoView({ behavior: 'instant', block: 'start' });` : "window.scrollTo({ top: 0, left: 0, behavior: 'instant' });"}
      })()`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), name + " has horizontal overflow");
      const screenshot = path.join(os.tmpdir(), `ppsc-presidents-${name}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
    };
    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(presidentRequests, 0, "Presidents data loaded on home");
    assert.equal(pmRequests, 0, "PM data loaded on home");
    assert(await client.evaluate(`(() => {
      const card = document.getElementById('presidents-card');
      return card?.parentElement.id === 'study-tools-options'
        && document.querySelectorAll('#presidents-card').length === 1
        && document.querySelectorAll('#study-tools-options > button').length === 6
        && document.querySelectorAll('#study-tools-options > button')[5] === card
        && document.querySelectorAll('#category-grid .category-card').length === 11
        && !document.getElementById('study-tools-box').contains(document.getElementById('category-grid'))
        && document.getElementById('presidents-screen').hidden;
    })()`), "Presidents must be the sixth Study Tools launcher without changing subjects");
    await client.evaluate("document.getElementById('study-tools-summary').click()");
    await capture("home-desktop", 1366, false, "#study-tools-box");
    await capture("home-mobile-dark", 320, true, "#presidents-card");
    // Seed a genuine unfinished Quiz and wrong-answer queue via app controls.
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
    const quizBefore = await client.evaluate("localStorage.getItem('ppsc-prep:active-session:v1')");
    // The shared controller must retain fully independent filters and accordions.
    await client.evaluate("document.getElementById('prime-ministers-card').click()");
    await wait('document.querySelectorAll("#prime-ministers-list .pm-entry").length > 0');
    await client.evaluate(`(() => {
      const search = document.getElementById('prime-ministers-search');
      search.value = 'Liaquat'; search.dispatchEvent(new Event('input'));
      document.querySelector('#prime-ministers-list .pm-entry').open = true;
    })()`);
    await wait('document.querySelectorAll("#prime-ministers-list .pm-entry-body .pm-facts li").length > 0');
    const pmBefore = await viewState("prime-ministers");
    assert.equal(presidentRequests, 0, "Opening PMs loaded Presidents data");
    await client.evaluate("document.getElementById('prime-ministers-back').click();document.getElementById('presidents-card').click()");
    await wait('!document.getElementById("presidents-error").hidden');
    assert.equal(presidentRequests, 1);
    await client.evaluate('document.getElementById("presidents-retry").click()');
    await wait('document.querySelectorAll("#presidents-list .pm-entry").length > 0');
    assert.equal(presidentRequests, 2);
    const checks = await client.evaluate(`(async () => {
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const el = id => document.getElementById('presidents-' + id);
      const data = window.PPSC_PRESIDENTS_DATA;
      const entries = data.entries, sources = new Map(data.sources.map(source => [source.id, source]));
      const normal = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\\s+/g, ' ').trim();
      const search = value => { el('search').value = value; el('search').dispatchEvent(new Event('input')); };
      const ids = () => [...el('list').querySelectorAll('.pm-entry')].map(n => n.dataset.entryId).sort();
      const openAll = async () => {
        [...el('list').querySelectorAll('.pm-entry')].forEach(entry => { entry.open = true; });
        await new Promise(resolve => setTimeout(resolve, 50));
      };
      check(document.getElementById('category-screen').hidden && !el('screen').hidden, 'Presidents navigation failed');
      check(['prime-ministers', 'water-topics', 'articles-topics', 'years-topics'].every(prefix => document.getElementById(prefix + '-screen').hidden), 'Multiple study screens visible');
      check(el('coverage').textContent.trim().length > 0, 'Coverage note missing');
      check(el('status').textContent.trim().length > 0, 'Status missing');
      check(!document.querySelector('vite-error-overlay, nextjs-portal'), 'Framework error overlay present');
      const nodes = [...el('list').querySelectorAll('.pm-entry')];
      check(nodes.length === entries.length && entries.length > 0, 'Not all entries rendered');
      check(new Set(nodes.map(n => n.dataset.entryId)).size === entries.length, 'Duplicate President accordion');
      check(nodes.every(n => n.tagName === 'DETAILS' && n.querySelector(':scope > summary')), 'Native accordion missing');
      for (const entry of entries) {
        const node = nodes.find(n => n.dataset.entryId === entry.id);
        if (!node) continue;
        const summary = node.querySelector(':scope > summary');
        check(node.dataset.section === entry.section, entry.id + ': section mismatch');
        check(normal(summary.textContent).includes(normal(entry.name)), entry.id + ': collapsed name missing');
        check(normal(summary.textContent).includes(normal(entry.country)), entry.id + ': collapsed country missing');
        const tenures = node.querySelector('.pm-tenures');
        check(!!tenures && tenures.getBoundingClientRect().height > 0, entry.id + ': collapsed tenure missing');
        for (const term of entry.tenures) {
          check(tenures && tenures.textContent.includes(String(term.start).slice(0, 4)), entry.id + ': start year missing');
          if (term.end) check(tenures && tenures.textContent.includes(String(term.end).slice(0, 4)), entry.id + ': end year missing');
        }
      }
      await openAll();
      for (const entry of entries) {
        const node = nodes.find(n => n.dataset.entryId === entry.id);
        if (!node) continue;
        check(!!node.querySelector('.pm-entry-body'), entry.id + ': expanded body missing');
        check(normal(node.textContent).includes(normal(entry.summary)), entry.id + ': summary missing');
        const facts = [...node.querySelectorAll('.pm-facts li')].map(item => normal(item.textContent));
        check(entry.facts.every(fact => facts.some(text => text.includes(normal(fact)))), entry.id + ': exam fact missing');
        for (const sourceId of entry.sourceIds) {
          const source = sources.get(sourceId);
          check(!!source, entry.id + ': unknown source ' + sourceId);
          if (source) check([...node.querySelectorAll('a[href]')].some(link => link.href === new URL(source.url).href
            && link.protocol === 'https:' && link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')), entry.id + ': missing/unsafe official source');
        }
      }
      search('___no_president___');
      check(!el('empty').hidden && !el('list').querySelector('.pm-entry'), 'Empty state failed');
      el('clear').click();
      const sectionCounts = {};
      for (const section of ['pakistan', 'acting', 'world']) {
        el('section').value = section; el('section').dispatchEvent(new Event('change'));
        const expected = entries.filter(entry => entry.section === section).map(entry => entry.id).sort();
        sectionCounts[section] = expected.length;
        check(expected.length > 0, section + ': required section empty');
        check(JSON.stringify(ids()) === JSON.stringify(expected), section + ': filter mismatch');
      }
      el('clear').click();
      check(el('search').value === '' && el('section').value === 'all', 'Clear did not reset controls');
      for (const term of ['Iskander', 'Wasim']) {
        search(term);
        const expected = entries.filter(entry => normal(entry.name).includes(normal(term))).map(entry => entry.id);
        check(expected.length > 0, term + ': required President missing');
        check(expected.every(id => ids().includes(id)), term + ': name search missed President');
      }
      const world = entries.find(entry => entry.section === 'world');
      if (world) {
        search(world.country);
        check(ids().includes(world.id), 'Country search missed foreign President');
        search(world.facts[0]);
        check(ids().includes(world.id), 'Exam-fact text search failed');
      }
      search('1956');
      const first = entries.find(entry => /Iskander/i.test(entry.name));
      check(first && ids().includes(first.id), 'Tenure-year search missed Iskander Mirza');
      el('clear').click();
      search('Iskander');
      await openAll();
      return { errors, entryCount: entries.length, sectionCounts, sourceCount: sources.size, verifiedOn: data.verifiedOn };
    })()`);
    assert.deepEqual(checks.errors, []);
    assert.equal(await snapshot(), savedBefore, "Presidents changed saved progress");
    assert.deepEqual(await viewState("prime-ministers"), pmBefore, "Presidents changed hidden PM state");
    await capture("desktop", 1366, false);
    await capture("desktop-entry", 1366, false, "#presidents-list .pm-entry");
    await capture("mobile-dark", 320, true);
    await capture("mobile-dark-entry", 320, true, "#presidents-list .pm-entry");
    await client.evaluate("document.getElementById('presidents-collapse').click();document.querySelector('#presidents-list .pm-entry > summary').focus()");
    await pause(50);
    assert.equal(await client.evaluate('document.querySelectorAll("#presidents-list .pm-entry[open]").length'), 0);
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await wait('document.querySelectorAll("#presidents-list .pm-entry[open]").length === 1');
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await wait('document.querySelectorAll("#presidents-list .pm-entry[open]").length === 0');
    const presidentsBefore = await viewState("presidents");
    await client.evaluate("document.getElementById('presidents-back').click();document.getElementById('prime-ministers-card').click()");
    await wait('!document.getElementById("prime-ministers-screen").hidden');
    assert.deepEqual(await viewState("prime-ministers"), pmBefore, "PM state not independently restored");
    await client.evaluate("document.getElementById('prime-ministers-back').click();document.getElementById('presidents-card').click()");
    await wait('!document.getElementById("presidents-screen").hidden');
    assert.deepEqual(await viewState("presidents"), presidentsBefore, "Presidents filter/open state not retained");
    assert.equal(presidentRequests, 2, "Reopening Presidents must reuse data");
    assert.equal(pmRequests, 1, "Reopening PMs must reuse data");
    assert.equal(await snapshot(), savedBefore, "Library switching changed saved progress");
    await client.evaluate("document.getElementById('presidents-back').click();document.getElementById('continue-session-button').click()");
    assert(await client.evaluate('!document.getElementById("quiz-screen").hidden && document.getElementById("presidents-screen").hidden'), "Continue failed after Presidents");
    const resumed = await client.evaluate("JSON.parse(localStorage.getItem('ppsc-prep:active-session:v1'))");
    const expected = JSON.parse(quizBefore);
    // Resume intentionally refreshes savedAt, but not the question, answers or ordering.
    delete resumed.savedAt; delete expected.savedAt;
    assert.deepEqual(resumed, expected, "Continue did not restore exact quiz");
    assert.equal(await client.evaluate("document.getElementById('question-text').dataset.questionId"), expected.questionIds[expected.currentIndex], "Continue rendered a different question");
    const ownerKey = "ppsc-prep:active-session:v1";
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `if (location.hostname === 'ppsc-presidents.test') localStorage.setItem(${JSON.stringify(ownerKey)}, 'PRIVATE-OWNER-SENTINEL');`
    });
    await client.send("Page.navigate", { url: guestUrl });
    await wait('document.readyState === "complete" && !document.getElementById("auth-gate").hidden && window.PPSC_CLOUD?.getStatus().phase === "error"');
    assert.equal(presidentRequests, 2, "Guest login screen loaded Presidents data");
    await client.evaluate('document.getElementById("guest-continue-button").click()');
    await wait('window.PPSC_CLOUD?.getStatus().phase === "guest-ready" && !document.getElementById("protected-app").hidden');
    const guestBefore = await snapshot();
    await client.evaluate("document.getElementById('study-tools-summary').click();document.getElementById('presidents-card').click()");
    await wait('document.querySelectorAll("#presidents-list .pm-entry").length > 0 && !document.getElementById("presidents-screen").hidden');
    await client.evaluate("document.querySelector('#presidents-list .pm-entry').open = true");
    await wait('document.querySelectorAll("#presidents-list .pm-entry-body .pm-facts li").length > 0');
    await client.evaluate('document.getElementById("presidents-back").click()');
    assert.equal(await snapshot(), guestBefore, "Guest Presidents changed local progress");
    assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(ownerKey)})`), "PRIVATE-OWNER-SENTINEL", "Guest touched owner progress");
    assert.deepEqual(cloudRequests, [], "Presidents/guest attempted cloud account access");
    assert.deepEqual(runtimeErrors, []);
    console.log(JSON.stringify({
      ok: true, url, ...checks, nameCountryYearFactSearch: true, independentPmState: true,
      lazyLoadRetry: true, progressPreserved: true, exactQuizContinue: true, keyboard: true,
      guestAccess: true, guestOwnerIsolation: true, runtimeErrors, cloudRequests, screenshots,
      browser: "Browser plugin unavailable; isolated native Chrome/CDP harness"
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-presidents-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
