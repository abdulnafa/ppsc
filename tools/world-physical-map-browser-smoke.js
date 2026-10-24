"use strict";

// Isolated native Chrome/CDP browser check for the physical-geography map.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const vm = require("node:vm");
const { spawn } = require("node:child_process");
const { connect, waitForTarget } = require("./browser-smoke");

const root = path.resolve(__dirname, "..");
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const water = JSON.parse(fs.readFileSync(path.join(root, "data/world-physical-water.json"), "utf8"));
const terrain = JSON.parse(fs.readFileSync(path.join(root, "data/world-physical-terrain.json"), "utf8"));
const allFeatures = new Map([...water.features, ...terrain.features].map((feature) => [feature.id, feature]));
const featureLayer = (kind) => ["ocean", "sea", "gulf", "strait", "lake"].includes(kind) ? "marine"
  : ["peak", "mountain", "range", "plateau", "glacier", "desert", "pass"].includes(kind) ? "terrain"
    : ["river", "canal"].includes(kind) ? "rivers" : "waterworks";
const questionScope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data/questions.js"), "utf8"), questionScope, { timeout: 20000 });
const questions = new Map(questionScope.window.PPSC_QUESTIONS.map((question) => [question.id, question]));

async function main() {
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find(fs.existsSync);
  assert(chrome, "Chrome or Edge required");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-physical-map-test-"));
  const requests = [];
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (/world-physical-(water|terrain|geometry)\.json$/.test(pathname)) requests.push(pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", ({
      ".js": "application/javascript", ".html": "text/html", ".css": "text/css",
      ".json": "application/json", ".geojson": "application/geo+json", ".woff2": "font/woff2"
    })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const port = 35000 + process.pid % 10000;
  const browser = spawn(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
    "--disable-extensions", "--no-proxy-server", `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  let client;
  const runtimeErrors = [];
  const screenshots = [];
  let topicOnlyChecked = false;
  try {
    client = connect((await waitForTarget(port)).webSocketDebuggerUrl);
    client.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        runtimeErrors.push(message.params.args.map((argument) => argument.value || argument.description || "").join(" "));
      }
    });
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Network.enable");
    await client.send("Network.setBlockedURLs", { urls: ["https://www.gstatic.com/firebasejs/*"] });
    const wait = async (condition) => {
      for (let attempt = 0; attempt < 200; attempt += 1) {
        if (await client.evaluate(condition)) return;
        await pause(100);
      }
      throw new Error("Timed out: " + condition);
    };
    const click = (selector) => client.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) throw new Error("Missing control: " + ${JSON.stringify(selector)});
      if (typeof node.click === "function") node.click();
      else node.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    })()`);
    const chooseLayer = async (value) => {
      await client.evaluate(`(() => {
        const select = document.getElementById("world-map-layer");
        select.value = ${JSON.stringify(value)};
        select.dispatchEvent(new Event("change", { bubbles: true }));
      })()`);
      await wait(`document.getElementById("world-map-layer").value === ${JSON.stringify(value)}
        && document.querySelectorAll(${JSON.stringify(value === "countries"
          ? "#world-map-svg [data-iso3]" : "#world-map-svg [data-physical-id]")}).length > 0`);
    };
    const checkUnmatched = async () => {
      const hasTopicOnlyQuestions = await client.evaluate(`(() => {
        const details = document.getElementById("world-map-physical-unmatched");
        const count = Number(details?.querySelector("summary")?.textContent.match(/^[0-9]+/)?.[0] || 0);
        return details && !details.hidden && count > 0;
      })()`);
      if (!hasTopicOnlyQuestions) return;
      await client.evaluate(`document.getElementById("world-map-physical-unmatched").open = true`);
      await wait('document.querySelectorAll("#world-map-physical-unmatched-list .world-map-question").length > 0');
      assert(await client.evaluate(`(() => {
        const details = document.getElementById("world-map-physical-unmatched");
        return /without a verified map pin|un-?pinned|topic-only/i.test(details.textContent)
          && details.querySelectorAll(".world-map-question .world-map-question-answer").length > 0;
      })()`), "Topic-only MCQ list needs answer cards and an unpinned-location explanation");
      topicOnlyChecked = true;
    };
    const chooseFeature = async (id) => {
      await click(`#world-map-svg .world-map-physical-marker[data-physical-id="${id}"]`);
      await wait(`document.getElementById("world-map-detail-title").textContent.trim() === ${JSON.stringify(allFeatures.get(id).name)}
        && !document.getElementById("world-map-physical-meta").hidden`);
      const feature = allFeatures.get(id);
      assert.equal(await client.evaluate("document.getElementById('world-map-physical-source').href"), feature.sourceUrl);
      assert(await client.evaluate(`document.getElementById("world-map-physical-note").textContent.trim().length > 0`),
        `${id}: location caveat missing`);
      assert(await client.evaluate(`document.getElementById("world-map-country-map").hidden`),
        `${id}: country mini-map should not replace physical-feature detail`);
      if (feature.questionIds && feature.questionIds.length) {
        await wait('document.querySelectorAll("#world-map-question-list .world-map-question").length > 0');
        const cardText = await client.evaluate(`document.getElementById("world-map-question-list").textContent`);
        assert(feature.questionIds.some((questionId) => {
          const question = questions.get(questionId);
          return question && cardText.includes(question.question)
            && cardText.includes(question.options[question.correctOptionIndex]);
        }), `${id}: linked MCQ question/answer card missing`);
      }
      await checkUnmatched();
    };
    const capture = async (label, width, mobile, dark) => {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width, height: 900, deviceScaleFactor: 1, mobile
      });
      await client.evaluate(`(() => {
        document.documentElement.dataset.theme = ${JSON.stringify(dark ? "dark" : "light")};
        document.getElementById("world-map-stage").scrollIntoView({ behavior: "instant", block: "start" });
      })()`);
      await pause(150);
      assert(await client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
        `${label}: horizontal overflow`);
      assert(await client.evaluate(`(() => {
        const select = document.getElementById("world-map-layer");
        const stage = document.getElementById("world-map-stage");
        return select.getBoundingClientRect().width > 0 && stage.getBoundingClientRect().width > 0;
      })()`), `${label}: layer control or map stage collapsed`);
      const filename = path.join(os.tmpdir(), `ppsc-physical-map-${label}.png`);
      fs.writeFileSync(filename, Buffer.from((await client.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
      screenshots.push(filename);
    };

    await client.send("Page.navigate", { url });
    await wait('document.readyState === "complete" && !document.getElementById("protected-app").hidden');
    assert.equal(requests.length, 0, "Physical-map data should not load on the home screen");
    const storageBefore = await client.evaluate("JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))");
    await click("#world-map-card");
    await wait('!document.getElementById("world-map-screen").hidden && document.querySelectorAll("#world-map-svg [data-iso3]").length > 100');
    assert.equal(await client.evaluate('document.getElementById("world-map-layer").value'), "countries");
    assert(await client.evaluate('document.getElementById("world-map-physical-meta").hidden'));
    assert.equal(requests.length, 0, "Physical map data and geometry must remain lazy in country view");

    for (const [layer, id] of [
      ["marine", "ocean-pacific"], ["terrain", "peak-k2"],
      ["rivers", "river-indus"], ["waterworks", "barrage-sukkur"]
    ]) {
      await chooseLayer(layer);
      const renderedCount = await client.evaluate('document.querySelectorAll("#world-map-svg .world-map-physical-marker[data-physical-id]").length');
      const expectedCount = [...allFeatures.values()].filter((feature) => featureLayer(feature.kind) === layer).length;
      assert.equal(renderedCount, expectedCount, `${layer}: missing or duplicate map markers`);
      assert.equal(await client.evaluate('document.querySelectorAll("#world-map-country-index-list button[data-physical-id]").length'),
        expectedCount, `${layer}: feature index is incomplete`);
      assert(await client.evaluate(`document.querySelector(${JSON.stringify(`#world-map-svg .world-map-physical-marker[data-physical-id="${id}"]`)}) !== null`),
        `${layer}: expected feature ${id} not rendered`);
      await chooseFeature(id);
    }
    assert(requests.some((request) => request.endsWith("world-physical-water.json")) &&
      requests.some((request) => request.endsWith("world-physical-terrain.json")),
      "Both physical data layers must be fetched when requested");
    assert(topicOnlyChecked, "No topic-only/unpinned MCQ list was available on physical layers");

    await chooseLayer("marine");
    await wait('document.querySelectorAll("#world-map-marine-geometry .world-map-marine-area").length > 0');
    const pacificArea = '#world-map-marine-geometry .world-map-marine-area[data-physical-id="ocean-pacific"]';
    assert(await client.evaluate(`document.querySelector(${JSON.stringify(pacificArea)})?.getAttribute("d")?.length > 10`),
      "Pacific Ocean polygon geometry missing");
    await click(pacificArea);
    await wait('document.getElementById("world-map-detail-title").textContent.trim() === "Pacific Ocean"');
    await chooseLayer("rivers");
    await wait('document.querySelectorAll("#world-map-physical-layer .world-map-physical-river").length > 0');
    const indusLine = '#world-map-physical-layer .world-map-physical-river[data-physical-id="river-indus"]';
    assert(await client.evaluate(`document.querySelector(${JSON.stringify(indusLine)})?.getAttribute("d")?.length > 10`),
      "Indus River line geometry missing");
    await click(indusLine);
    await wait('document.getElementById("world-map-detail-title").textContent.trim() === "Indus River"');
    assert(requests.some((request) => request.endsWith("world-physical-geometry.json")),
      "Optional Natural Earth geometry must lazy-load when physical layers open");

    await chooseLayer("waterworks");
    await chooseFeature("barrage-sukkur");
    await capture("desktop-waterworks", 1366, false, false);
    await capture("mobile-waterworks-dark", 320, true, true);
    await chooseLayer("rivers");
    await chooseFeature("river-indus");
    await capture("mobile-river-dark", 320, true, true);
    await chooseLayer("countries");
    await wait('document.querySelectorAll("#world-map-svg [data-iso3]").length > 100');
    assert(await client.evaluate('document.getElementById("world-map-physical-meta").hidden'),
      "Returning to countries must hide physical-feature metadata");
    const storageAfter = await client.evaluate("JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))");
    assert.equal(storageAfter, storageBefore, "Map study must not mutate quiz/queue progress");
    assert.deepEqual(runtimeErrors, [], "Browser reported runtime or console errors");
    console.log(JSON.stringify({
      ok: true, featureCount: allFeatures.size, layersChecked: ["marine", "terrain", "rivers", "waterworks"],
      linkedMcqCards: true, topicOnlyChecked, geometryClicks: true,
      progressPreserved: true, runtimeErrors, screenshots
    }, null, 2));
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await new Promise((resolve) => server.close(resolve));
    await pause(500);
    const resolved = path.resolve(profile);
    assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep)
      && path.basename(resolved).startsWith("ppsc-physical-map-test-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
