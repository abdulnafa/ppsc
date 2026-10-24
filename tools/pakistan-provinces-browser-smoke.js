"use strict";

// Native Chrome/CDP check: Study Tools -> four provincial geography libraries.
// The library is read-only and must preserve an unfinished quiz and retry queue.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");

const root = path.resolve(__dirname, "..");
const dataFile = path.join(root, "data/pakistan-provinces-geography.json");
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  const fixture = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const provinces = fixture.provinces;
  const kinds = ["mountains", "rivers", "barrages", "lakes"];
  assert.deepEqual(provinces.map(province => province.id).sort(), ["balochistan", "kpk", "punjab", "sindh"]);
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-provinces-test-"));
  let dataRequests = 0;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/data/pakistan-provinces-geography.json") dataRequests += 1;
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
  const port = 31000 + process.pid % 10000;
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
      const screenshot = path.join(os.tmpdir(), `ppsc-provinces-${label}.png`);
      fs.writeFileSync(screenshot, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(screenshot);
    };

    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(await client.evaluate("location.href"), url);
    assert.match(await client.evaluate("document.title"), /PPSC Prep/);
    assert.equal(dataRequests, 0, "Provincial data should load only when the library opens");
    assert(await client.evaluate(`(() => {
      const card = document.getElementById("pakistan-provinces-card");
      return card?.parentElement.id === "study-tools-options"
        && card.getAttribute("aria-controls") === "pakistan-provinces-screen"
        && document.getElementById("pakistan-provinces-screen").hidden
        && document.querySelectorAll("#category-grid .category-card").length === 11
        && !document.querySelector("vite-error-overlay, nextjs-portal");
    })()`), "Study Tools launcher or first screen is incorrect");

    // Create a genuine saved wrong answer and unfinished quiz before opening the read-only library.
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
    assert(await client.evaluate(`JSON.parse(localStorage.getItem('ppsc-prep:retry-queue:v1')).items.length > 0`), "Expected a saved retry queue");
    const savedBefore = await snapshot();
    await client.evaluate(`document.getElementById("study-tools-summary").click();document.getElementById("pakistan-provinces-card").click();`);
    await wait('!document.getElementById("pakistan-provinces-screen").hidden && document.querySelectorAll("#pakistan-provinces-tabs [data-province-id]").length === 4');
    await wait('document.querySelectorAll("#pakistan-provinces-sections details.pakistan-provinces-group[data-kind]").length === 4');
    assert.equal(dataRequests, 1, "First open must fetch provincial data once");

    const checks = await client.evaluate(`(async () => {
      const provinces = ${JSON.stringify(provinces)};
      const kinds = ${JSON.stringify(kinds)};
      const errors = [], check = (value, message) => { if (!value) errors.push(message); };
      const screen = document.getElementById('pakistan-provinces-screen');
      const sections = document.getElementById('pakistan-provinces-sections');
      const search = document.getElementById('pakistan-provinces-search');
      const bank = new Map(window.PPSC_QUIZ_DATA.questions.map(question => [question.id, question]));
      const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\\s+/g, ' ').trim();
      const counts = {};
      check(document.getElementById('category-screen').hidden && !screen.hidden, 'Library navigation failed');
      check(document.getElementById('pakistan-provinces-status').textContent.trim().length > 0, 'Status missing');
      check(!document.querySelector('vite-error-overlay, nextjs-portal'), 'Framework overlay shown');
      const tabIds = [...document.querySelectorAll('#pakistan-provinces-tabs [data-province-id]')].map(node => node.dataset.provinceId);
      check(JSON.stringify(tabIds.sort()) === JSON.stringify(provinces.map(province => province.id).sort()), 'Province tabs mismatch');
      for (const province of provinces) {
        search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('#pakistan-provinces-tabs [data-province-id="' + province.id + '"]').click();
        await new Promise(resolve => setTimeout(resolve, 30));
        const groups = [...sections.querySelectorAll('details.pakistan-provinces-group[data-kind]')];
        check(groups.length === 4, province.id + ': expected four sections');
        check(JSON.stringify(groups.map(group => group.dataset.kind).sort()) === JSON.stringify([...kinds].sort()), province.id + ': feature-type sections mismatch');
        counts[province.id] = {};
        for (const kind of kinds) {
          const group = groups.find(node => node.dataset.kind === kind);
          const entries = province.sections[kind];
          counts[province.id][kind] = entries.length;
          check(!!group && group.querySelector(':scope > summary'), province.id + '/' + kind + ': native accordion missing');
          check(entries.length > 0, province.id + '/' + kind + ': no study entries');
          if (!group) continue;
          group.open = true;
          await new Promise(resolve => setTimeout(resolve, 20));
          const nodes = [...group.querySelectorAll('details.pakistan-provinces-item[data-entry-id]')];
          check(JSON.stringify(nodes.map(node => node.dataset.entryId).sort()) === JSON.stringify(entries.map(entry => entry.id).sort()), province.id + '/' + kind + ': entry IDs mismatch');
          for (const entry of entries) {
            const node = nodes.find(item => item.dataset.entryId === entry.id);
            if (!node) continue;
            check(normalize(node.querySelector(':scope > summary')?.textContent).includes(normalize(entry.name)), entry.id + ': title missing');
            node.open = true;
            await new Promise(resolve => setTimeout(resolve, 10));
            check(normalize(node.textContent).includes(normalize(entry.detail)), entry.id + ': study detail missing');
            const link = node.querySelector('a.pakistan-provinces-source[href]');
            check(link?.href === entry.sourceUrl && link.protocol === 'https:' && link.target === '_blank' && link.rel.includes('noopener'), entry.id + ': official source link missing/unsafe (' + JSON.stringify({ actual: link?.href, expected: entry.sourceUrl, target: link?.target, rel: link?.rel }) + ')');
            const cards = [...node.querySelectorAll('.pakistan-provinces-mcq')];
            check(cards.length === entry.questionIds.length, entry.id + ': linked MCQ count mismatch');
            for (const questionId of entry.questionIds) {
              const question = bank.get(questionId);
              check(!!question, entry.id + ': unknown linked MCQ ' + questionId);
              if (!question) continue;
              const card = cards.find(item => item.dataset.questionId === questionId)
                || cards.find(item => normalize(item.textContent).includes(normalize(question.question)));
              check(!!card, entry.id + ': linked MCQ text missing: ' + questionId);
              if (card) check(normalize(card.textContent).includes(normalize(question.options[question.correctOptionIndex])), entry.id + ': correct answer missing: ' + questionId);
            }
          }
        }
      }
      const punjab = provinces.find(province => province.id === 'punjab');
      document.querySelector('#pakistan-provinces-tabs [data-province-id="punjab"]').click();
      const needle = punjab.sections.rivers[0].name;
      search.value = needle; search.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 50));
      check([...sections.querySelectorAll('.pakistan-provinces-item')].some(node => normalize(node.textContent).includes(normalize(needle))), 'Search did not find an entry');
      search.value = '___no_province_geography___'; search.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 30));
      check(sections.querySelectorAll('.pakistan-provinces-item').length === 0, 'Impossible search did not empty results');
      search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 30));
      check(sections.querySelectorAll('.pakistan-provinces-item').length > 0, 'Clearing search did not restore entries');
      return { errors, counts, linkedMcqCards: [...screen.querySelectorAll('.pakistan-provinces-mcq')].length };
    })()`);
    assert.deepEqual(checks.errors, []);
    assert.equal(await snapshot(), savedBefore, "Provincial library changed saved quiz/queue progress");
    await capture("desktop", 1366, false, "#pakistan-provinces-screen");
    await capture("mobile-dark", 320, true, "#pakistan-provinces-tabs");
    await client.evaluate(`(() => {
      const entry = document.querySelector('.pakistan-provinces-item');
      entry.closest('.pakistan-provinces-group').open = true;
      entry.open = true;
    })()`);
    await wait('document.querySelector(".pakistan-provinces-item[open] .pakistan-provinces-mcq")');
    await capture("mobile-dark-entry", 320, true, ".pakistan-provinces-item");
    await client.evaluate(`document.getElementById('pakistan-provinces-back').click()`);
    assert(await client.evaluate('document.getElementById("pakistan-provinces-screen").hidden'), "Back did not close province library");
    assert.equal(await snapshot(), savedBefore, "Back navigation changed saved progress");
    await client.evaluate(`document.getElementById('pakistan-provinces-card').click()`);
    await wait('!document.getElementById("pakistan-provinces-screen").hidden && document.querySelectorAll("#pakistan-provinces-sections .pakistan-provinces-item").length > 0');
    assert.equal(dataRequests, 1, "Reopening should reuse loaded province data");
    assert.equal(await snapshot(), savedBefore, "Reopening changed saved progress");
    assert.deepEqual(runtimeErrors, [], "Browser console/runtime errors");
    console.log(JSON.stringify({
      ok: true, url, provinceCount: provinces.length, ...checks, lazyLoaded: true,
      progressPreserved: true, desktopAndMobile: true, runtimeErrors, screenshots,
      browser: "Browser plugin unavailable; isolated native Chrome/CDP harness"
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("ppsc-provinces-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
