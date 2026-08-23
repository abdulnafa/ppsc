"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");

const projectDirectory = path.resolve(__dirname, "..");
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/list`;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const targets = await fetch(endpoint).then((response) => response.json());
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Chrome may need a moment to expose the debugging endpoint.
    }
    await delay(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready.");
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const callbacks = new Map();
  let sequence = 0;

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("Could not connect to Chrome DevTools.")), { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !callbacks.has(message.id)) return;
    const callback = callbacks.get(message.id);
    callbacks.delete(message.id);
    if (message.error) callback.reject(new Error(message.error.message));
    else callback.resolve(message.result);
  });

  async function send(method, params = {}) {
    await ready;
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      callbacks.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    }
    return response.result.value;
  }

  return { socket, send, evaluate };
}

async function main() {
  const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));
  if (!chromePath) throw new Error("Chrome or Edge was not found.");

  const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ppsc-smoke-"));
  const port = 19000 + (process.pid % 10000);
  const pageUrl = pathToFileURL(path.join(projectDirectory, "index.html")).href;
  const browser = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--allow-file-access-from-files",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    pageUrl
  ], { stdio: "ignore", windowsHide: true });

  let client;
  try {
    const target = await waitForTarget(port);
    client = connect(target.webSocketDebuggerUrl);
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });
    await client.send("Page.navigate", { url: pageUrl });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website data did not load in time."));
        }
      }, 50);
    })`);
    await client.evaluate("window.scrollTo(0, 0)");
    await client.evaluate("document.fonts.ready.then(() => true)");
    await delay(500);
    const screenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      path.join(projectDirectory, "work", "site-home-mobile-smoke.png"),
      Buffer.from(screenshot.data, "base64")
    );

    const result = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(element && !element.hidden);
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      if (!data || data.categories.length !== 11) errors.push("Expected 11 categories.");
      if (!data || data.questions.length < 898) errors.push("Expected at least the 898-question PDF bank.");
      if (document.querySelectorAll("#category-grid .category-card").length !== 11) errors.push("Category cards did not render.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Mobile layout has horizontal overflow.");
      if (data.questions.some((question) => !/^https?:\\/\\//.test(question.source.referenceUrl))) errors.push("A research URL is missing.");

      const categoryButton = document.querySelector("#category-grid .category-card:not([disabled])");
      const activeCategory = categoryButton.dataset.category || categoryButton.dataset.categoryId;
      const categoryQuestions = data.questions.filter((question) => question.categoryId === activeCategory);
      const findCurrent = () => categoryQuestions.find((question) => question.question === document.querySelector("#question-text").textContent);

      categoryButton.click();
      await pause();
      if (!visible(document.querySelector("#mode-screen"))) errors.push("Mode chooser did not open after selecting a category.");

      document.querySelector("#mode-back-button").click();
      await pause();
      if (!visible(document.querySelector("#category-screen"))) errors.push("Mode chooser back button failed.");

      categoryButton.click();
      document.querySelector("#learn-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Learn mode did not open.");

      let question = findCurrent();
      let correctButton = document.querySelector('[data-option-index="' + question.correctOptionIndex + '"]');
      if (!correctButton.disabled || !correctButton.classList.contains("is-correct")) errors.push("Learn mode did not reveal and lock the correct answer.");
      if (document.querySelector("#score-text").textContent !== "Learn Mode") errors.push("Learn mode displayed a score.");
      if (document.querySelector("#action-button").textContent !== "Next Question" && categoryQuestions.length > 1) errors.push("Learn mode did not offer the next question immediately.");
      if (!visible(document.querySelector("#details-panel"))) errors.push("Learn details did not open automatically.");
      if (!visible(document.querySelector("#memory-story"))) errors.push("Learn memory story did not open automatically.");
      if (!/[\u0600-\u06ff]/u.test(document.querySelector("#memory-story-text").textContent)) errors.push("Urdu memory story did not render.");

      document.querySelector("#restart-button").click();
      await pause();
      if (!document.querySelector("#question-counter").textContent.startsWith("Question 1 ")) errors.push("Learn restart failed.");
      while (!visible(document.querySelector("#results-screen"))) {
        document.querySelector("#action-button").click();
        await pause();
      }
      if (document.querySelector("#results-title").textContent !== "Learning complete!") errors.push("Learn completion copy was not shown.");
      if (document.querySelector("#result-score").textContent.trim() !== String(categoryQuestions.length)) errors.push("Learn completion total did not match.");

      document.querySelector("#change-category-button").click();
      categoryButton.click();
      document.querySelector("#quiz-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Quiz screen did not open.");

      question = findCurrent();
      if (!question) errors.push("First question did not render.");
      if (document.querySelectorAll("#options-container .option-button").length !== 4) errors.push("Four options did not render.");

      const wrongIndex = (question.correctOptionIndex + 1) % 4;
      document.querySelector('[data-option-index="' + wrongIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#feedback-title").textContent !== "Incorrect") errors.push("Incorrect feedback failed.");
      if (!document.querySelector("#feedback-text").textContent.includes("The correct answer is")) errors.push("Correct answer was not revealed.");
      document.querySelector("#details-toggle").click();
      await pause();
      if (!/[\\u0600-\\u06ff]/u.test(document.querySelector("#explanation-text").textContent)) errors.push("Urdu detail did not render after an incorrect answer.");
      const loadedFontFamilies = document.fonts
        ? [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family.replace(/["']/g, ""))
        : [];
      if (!getComputedStyle(document.body).fontFamily.includes("Inter")) errors.push("Readable English font was not applied.");
      if (document.fonts && !loadedFontFamilies.includes("Inter")) errors.push("Inter did not load.");
      if (!getComputedStyle(document.querySelector("#explanation-text")).fontFamily.includes("Noto Nastaliq Urdu")) errors.push("Readable Urdu font was not applied.");
      if (document.fonts && !loadedFontFamilies.includes("Noto Nastaliq Urdu")) errors.push("Noto Nastaliq Urdu did not load.");
      if (!/^https?:\\/\\//.test(document.querySelector("#source-link").href)) errors.push("Research link did not render.");

      document.querySelector("#action-button").click();
      await pause();
      question = findCurrent();
      document.querySelector('[data-option-index="' + question.correctOptionIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#feedback-title").textContent !== "Correct!") errors.push("Correct feedback failed.");
      document.querySelector("#details-toggle").click();
      await pause();
      if (!/[\\u0600-\\u06ff]/u.test(document.querySelector("#explanation-text").textContent)) errors.push("Urdu detail did not render after a correct answer.");

      document.querySelector("#action-button").click();
      await pause();
      while (!visible(document.querySelector("#results-screen"))) {
        question = findCurrent();
        if (!question) {
          errors.push("Could not match a later question.");
          break;
        }
        document.querySelector('[data-option-index="' + question.correctOptionIndex + '"]').click();
        document.querySelector("#action-button").click();
        document.querySelector("#action-button").click();
        await pause();
      }

      const expectedScore = categoryQuestions.length - 1;
      if (document.querySelector("#result-score").textContent.replace(/\\s/g, "") !== expectedScore + "/" + categoryQuestions.length) {
        errors.push("Final score did not match the completed session.");
      }

      return {
        errors,
        categoryCards: document.querySelectorAll("#category-grid .category-card").length,
        totalQuestions: data.questions.length,
        testedCategory: activeCategory,
        testedCategoryQuestions: categoryQuestions.length,
        finalScore: document.querySelector("#result-score").textContent,
        sourceNotesAvailable: data.questions.filter((item) => item.sourceNotes).length
      };
    })()`);

    console.log(JSON.stringify(result, null, 2));
    if (result.errors.length) process.exitCode = 1;
  } finally {
    if (client && client.socket.readyState < WebSocket.CLOSING) client.socket.close();
    browser.kill();
    await delay(250);
    const resolvedTemp = path.resolve(os.tmpdir()) + path.sep;
    const resolvedProfile = path.resolve(profileDirectory);
    if (!resolvedProfile.startsWith(resolvedTemp) || !path.basename(resolvedProfile).startsWith("ppsc-smoke-")) {
      throw new Error(`Refusing to remove unexpected browser profile: ${resolvedProfile}`);
    }
    fs.rmSync(resolvedProfile, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
