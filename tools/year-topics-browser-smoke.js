"use strict";

// Uses the repository's existing native Chrome smoke harness; no new dependencies.
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
  const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-year-test-"));
  let dataRequests = 0;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/data/year-topics.js" && ++dataRequests === 1) {
      response.writeHead(503); response.end("Intentional first-load failure for retry test"); return;
    }
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader("Content-Type", ({ ".js": "application/javascript", ".html": "text/html", ".css": "text/css", ".woff2": "font/woff2" })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const port = 30000 + process.pid % 10000;
  const browser = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, url], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [];
  const screenshots = [];
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        runtimeErrors.push(JSON.stringify(message.params.args));
      }
    });
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    const wait = async (condition) => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(dataRequests, 0, "Data must not load on home screen");
    const studyToolsChecks = await client.evaluate(`(() => {
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const box = document.getElementById('study-tools-box');
      const options = document.getElementById('study-tools-options');
      const visible = node => !!node && node.checkVisibility({ checkVisibilityCSS: true });
      check(document.querySelectorAll('#study-tools-box').length === 1, 'Expected one Study Tools box');
      check(box?.tagName === 'DETAILS' && !box.open, 'Study Tools must initially be a closed native accordion');
      check(document.getElementById('study-tools-summary')?.parentElement === box, 'Study Tools summary missing');
      check(options?.parentElement === box, 'Study Tools options outside the box');
      for (const id of ['paper-builder-card', 'years-topics-card']) {
        const card = document.getElementById(id);
        check(document.querySelectorAll('#' + id).length === 1, id + ' duplicated');
        check(card?.parentElement === options, id + ' outside Study Tools options');
        check(!visible(card), id + ' visible before expanding Study Tools');
      }
      check(document.querySelectorAll('#category-grid .category-card').length === 11, 'Subject category count changed');
      check(!box?.contains(document.getElementById('category-grid')), 'Subject categories moved inside Study Tools');
      document.getElementById('study-tools-summary').focus();
      return { errors };
    })()`);
    assert.deepEqual(studyToolsChecks.errors, []);
    // Real key input exercises the browser's native details/summary behavior.
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await wait('document.getElementById("study-tools-box").open');
    assert(await client.evaluate(`['paper-builder-card','years-topics-card'].every(id => document.getElementById(id).checkVisibility({ checkVisibilityCSS: true }))`), "Expanded Study Tools buttons not visible");
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await wait('!document.getElementById("study-tools-box").open');
    for (const [name, width, height, dark] of [["desktop", 1366, 900, false], ["mobile-dark", 320, 900, true]]) {
      await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
      for (const [state, open] of [["collapsed", false], ["open", true]]) {
        await client.evaluate(`(() => {
          document.documentElement.setAttribute('data-theme', ${JSON.stringify(dark ? "dark" : "light")});
          const box = document.getElementById('study-tools-box');
          if (box.open !== ${open}) document.getElementById('study-tools-summary').click();
          box.scrollIntoView({ behavior: 'instant', block: 'start' });
        })()`);
        await pause(150);
        assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), `Study Tools ${name} ${state} horizontal overflow`);
        const screenshot = path.join(os.tmpdir(), `ppsc-study-tools-${name}-${state}.png`);
        fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
        screenshots.push(screenshot);
      }
    }
    await client.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    await client.evaluate(`document.documentElement.setAttribute('data-theme', 'light');window.scrollTo(0,0);`);
    // Seed a genuine unfinished quiz and finite queue via the public UI.
    await client.evaluate(`(() => {
      document.querySelector('[data-category="general-knowledge"]').click();
      document.getElementById('quiz-mode-button').click();
      document.getElementById('question-range-end-input').value = '5';
      document.getElementById('question-range-submit-button').click();
      document.querySelector('[data-option-index="0"]').click();
      document.getElementById('action-button').click();
      document.getElementById('back-button').click();
      window.__yearSaved = Object.fromEntries(Object.keys(localStorage).map(key => [key,localStorage.getItem(key)]));
      document.getElementById('paper-builder-card').click();
    })()`);
    assert(await client.evaluate('!document.getElementById("paper-setup-screen").hidden && document.getElementById("category-screen").hidden'), "Study Tools paper button did not open setup");
    await client.evaluate('document.getElementById("paper-setup-back-button").click()');
    assert(await client.evaluate('!document.getElementById("category-screen").hidden && !document.getElementById("continue-session-card").hidden'), "Paper back did not restore home and Continue");
    assert(await client.evaluate('JSON.stringify(window.__yearSaved) === JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(key => [key,localStorage.getItem(key)])))'), "Paper setup/back changed saved progress");
    assert.equal(dataRequests, 0, "Paper navigation must not load timeline data");
    await client.evaluate(`(() => {
      if (!document.getElementById('study-tools-box').open) document.getElementById('study-tools-summary').click();
      document.getElementById('years-topics-card').click();
    })()`);
    await wait('!document.getElementById("years-topics-error").hidden');
    assert.equal(dataRequests, 1);
    await client.evaluate('document.getElementById("years-topics-retry").click()');
    await wait('document.querySelectorAll(".year-topics-year").length > 0');
    assert.equal(dataRequests, 2);
    const checks = await client.evaluate(`(async () => {
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const el = id => document.getElementById('years-topics-' + id);
      const entries = window.PPSC_YEAR_TOPICS_DATA.entries;
      check(document.getElementById('category-screen').hidden, 'Home still visible');
      check(!el('screen').hidden, 'Timeline hidden');
      check(!document.querySelector('.year-topic-row'), 'Closed accordions eagerly rendered topics');
      const years = [...document.querySelectorAll('.year-topics-year')].map(n => n.dataset.yearKey);
      check(new Set(years).size === years.length, 'Duplicate year accordion');
      for (const era of ['BCE', 'CE', 'AH']) {
        const values = years.filter(key => key.startsWith(era + ':')).map(key => +key.split(':')[1]);
        check(values.every((year,i) => !i || (era === 'BCE' ? year < values[i-1] : year > values[i-1])), 'Incorrect ' + era + ' order');
      }
      const search = (value) => { el('search').value = value; el('search').dispatchEvent(new Event('input')); };
      search('___no_timeline_topic___');
      check(!el('empty').hidden && !el('list').children.length, 'Empty search state wrong');
      el('clear').click();
      el('calendar').value = 'AH'; el('calendar').dispatchEvent(new Event('change'));
      check([...el('list').querySelectorAll('[data-year-key]')].every(n => n.dataset.yearKey.startsWith('AH:')), 'AH mixed with CE');
      check(el('list').textContent.includes('alag taqweem'), 'Hijri separation label missing');
      el('clear').click();
      el('category').value = 'pakistan-studies'; el('category').dispatchEvent(new Event('change'));
      const expected = entries.filter(e => e.categoryIds.includes('pakistan-studies'));
      check(el('status').textContent.includes(expected.length + ' topics'), 'Category topic count incorrect');
      el('clear').click(); search('1930');
      check([...el('list').querySelectorAll('[data-year-key]')].every(n => n.dataset.yearKey.endsWith(':1930')), 'Year-only search matched unrelated headings');
      const year = el('list').querySelector('[data-year-key="CE:1930"]');
      check(!!year, '1930 missing');
      year.open = true;
      await new Promise(resolve => setTimeout(resolve, 30));
      check(year.querySelectorAll('ol > li').length > 0, 'Accordion did not render numbered topics');
      check([...year.querySelectorAll('.year-topic-description')].every(n => !/[\\u0600-\\u06ff]/.test(n.textContent)), 'Description not Roman Urdu');
      check(year.querySelector('ol').lang === 'ur-Latn', 'Roman Urdu language label missing');
      const sources = year.querySelector('.year-topic-sources'); sources.open = true;
      check(sources.textContent.includes('MCQ') && sources.textContent.includes('Answer:'), 'Evidence missing');
      sources.open = false;
      check(JSON.stringify(window.__yearSaved) === JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(key => [key,localStorage.getItem(key)]))), 'Timeline changed saved progress');
      return { errors, topicCount: entries.length, yearCount: years.length };
    })()`);
    assert.deepEqual(checks.errors, []);
    for (const [name, width, height, dark] of [["desktop", 1366, 900, false], ["mobile-dark", 320, 900, true]]) {
      await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
      await client.evaluate(`document.documentElement.setAttribute('data-theme', ${JSON.stringify(dark ? "dark" : "light")});window.scrollTo(0,0);`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), name + " horizontal overflow");
      const screenshot = path.join(os.tmpdir(), `ppsc-years-${name}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
      await client.evaluate(`document.querySelector('[data-year-key="CE:1930"]').scrollIntoView({ behavior: 'instant', block: 'start' });`);
      const topicsShot = path.join(os.tmpdir(), `ppsc-years-${name}-topics.png`);
      fs.writeFileSync(topicsShot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(topicsShot);
    }
    await client.evaluate(`document.getElementById('years-topics-collapse').click();document.querySelector('.year-topics-year > summary').focus();`);
    await pause(50);
    assert.equal(await client.evaluate('document.querySelectorAll(".year-topics-year[open]").length'), 0);
    assert.equal(await client.evaluate('document.activeElement.tagName'), 'SUMMARY', 'Accordion not focused');
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await wait('document.querySelectorAll(".year-topics-year[open]").length === 1');
    await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await wait('document.querySelectorAll(".year-topics-year[open]").length === 0');
    await client.evaluate(`document.getElementById('years-topics-back').click();document.getElementById('years-topics-card').click();`);
    assert.equal(dataRequests, 2, "Reopening should reuse loaded data");
    await client.evaluate(`document.getElementById('years-topics-back').click();document.getElementById('continue-session-button').click();`);
    assert(await client.evaluate('!document.getElementById("quiz-screen").hidden && document.getElementById("years-topics-screen").hidden'), "Continue failed after timeline");
    assert.deepEqual(runtimeErrors, []);
    console.log(JSON.stringify({ ok: true, url, ...checks, lazyLoadRetry: true, progressPreserved: true, keyboard: true,
      studyTools: { defaultCollapsed: true, singleBox: true, keyboard: true, paperAndTimelineNavigation: true, subjectsUnchanged: true },
      runtimeErrors, screenshots, browser: "Browser plugin not available; existing native Chrome test harness used" }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-year-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
