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
const positionSensitiveQuestionIds = [
  "IBES-Q0017-SRC",
  "IBES-Q0034-SRC",
  "IBES-Q0152-SRC",
  "IBES-Q0347-SRC",
  "IBES-Q0409-SRC",
  "IBES-Q0481-SRC",
  "IBES-Q0488-SRC",
  "IBES-Q0501-SRC",
  "IBES-Q0550-SRC",
  "IBES-Q0562-SRC",
  "IBES-Q0597-SRC",
  "ADV2E102-U0001-Q033-SRC",
  "ADV2E102-U0002-Q026-SRC",
  "ADV2E102-U0002-Q035-SRC",
  "ADV2E102-U0002-Q047-SRC",
  "ADV2E102-U0002-Q055-SRC",
  "ADV2E102-U0002-Q056-SRC",
  "ADV2E102-U0002-Q069-SRC",
  "ADV2E102-U0002-Q072-SRC",
  "ADV2E102-U0002-Q098-SRC",
  "ADV2E102-U0009-Q052-SRC",
  "ADV2E102-U0040-Q013-SRC",
  "ADV2E102-U0042-Q017-SRC",
  "ADV2E102-U0045-Q020-SRC",
  "ADV2E102-U0045-Q079-SRC"
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
    const timer = setTimeout(
      () => reject(new Error("Chrome DevTools WebSocket did not connect in time.")),
      60000
    );
    socket.addEventListener("open", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("Could not connect to Chrome DevTools."));
    }, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !callbacks.has(message.id)) return;
    const callback = callbacks.get(message.id);
    callbacks.delete(message.id);
    clearTimeout(callback.timer);
    if (message.error) callback.reject(new Error(message.error.message));
    else callback.resolve(message.result);
  });

  socket.addEventListener("close", () => {
    for (const [id, callback] of callbacks) {
      clearTimeout(callback.timer);
      callback.reject(new Error(`Chrome DevTools closed before command ${id} completed.`));
    }
    callbacks.clear();
  });

  async function send(method, params = {}) {
    await ready;
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        callbacks.delete(id);
        reject(new Error(`Chrome DevTools command ${method} timed out.`));
      }, 60000);
      callbacks.set(id, { resolve, reject, timer });
      try {
        socket.send(JSON.stringify({ id, method, params }));
      } catch (error) {
        clearTimeout(timer);
        callbacks.delete(id);
        reject(error);
      }
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
    "--no-sandbox",
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
    const sequentialFeatureSetup = `(() => {
      window.PPSC_APP_FEATURES = Object.assign({}, window.PPSC_APP_FEATURES, {
        sequentialReview: sessionStorage.getItem("ppsc-smoke:sequential-review") === "on"
      });
      return true;
    })()`;
    await client.send("Page.addScriptToEvaluateOnNewDocument", { source: sequentialFeatureSetup });
    await client.evaluate(sequentialFeatureSetup);
    const additiveBankFixtureSetup = `(() => {
      if (sessionStorage.getItem("ppsc-smoke:additive-bank") !== "on") return false;
      sessionStorage.setItem("ppsc-smoke:additive-events", "[]");
      window.addEventListener("ppsc:local-state-changed", (event) => {
        const events = JSON.parse(sessionStorage.getItem("ppsc-smoke:additive-events") || "[]");
        events.push({ key: event.detail?.key || "", action: event.detail?.action || "" });
        sessionStorage.setItem("ppsc-smoke:additive-events", JSON.stringify(events));
      });
      let quizData;
      Object.defineProperty(window, "PPSC_QUIZ_DATA", {
        configurable: true,
        enumerable: true,
        get() { return quizData; },
        set(value) {
          if (value && Array.isArray(value.questions)
            && !value.questions.some((question) => question.id === "SMOKE-ADDITIVE-Q0001-SRC")) {
            value.questions.push({
              id: "SMOKE-ADDITIVE-Q0001-SRC",
              pairId: "SMOKE-ADDITIVE-Q0001",
              kind: "source",
              categoryId: "general-knowledge",
              question: "Which fixture verifies additive question-bank migration?",
              questionUrdu: "",
              options: ["Stable prefix", "Changed prefix", "Unknown signature", "Deleted state"],
              correctOptionIndex: 0,
              isImportant: false,
              repeatCount: 1
            });
          }
          quizData = value;
        }
      });
      return true;
    })()`;
    await client.send("Page.addScriptToEvaluateOnNewDocument", { source: additiveBankFixtureSetup });
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });
    await client.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [{ name: "prefers-color-scheme", value: "light" }]
    });

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:theme:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for retry FIFO testing."));
        }
      }, 50);
    })`);

    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (document.querySelector("#auth-theme-toggle-button")
          && document.querySelector("#theme-toggle-button")
          && document.querySelector("#category-grid .category-card")) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Theme controls or category surface did not become ready."));
        }
      }, 50);
    })`);

    const themeScreenshots = {
      dark430: path.join(os.tmpdir(), "ppsc-theme-dark-430-smoke.png"),
      light430: path.join(os.tmpdir(), "ppsc-theme-light-430-smoke.png")
    };
    const themeInitialResult = await client.evaluate(`(async () => {
      const errors = [];
      const storageKey = "ppsc-prep:theme:v1";
      const expected = {
        light: {
          bodyBackground: "rgb(244, 247, 251)",
          bodyColor: "rgb(23, 36, 59)",
          cardBackground: "rgb(255, 255, 255)",
          cardBorder: "rgb(220, 228, 240)",
          themeColor: "#12366b",
          pressed: "false",
          actionLabel: "Switch to dark mode"
        },
        dark: {
          bodyBackground: "rgb(13, 21, 34)",
          bodyColor: "rgb(231, 237, 247)",
          cardBackground: "rgb(23, 34, 54)",
          cardBorder: "rgb(51, 68, 93)",
          themeColor: "#0d1522",
          pressed: "true",
          actionLabel: "Switch to light mode"
        }
      };
      const pause = () => new Promise((resolve) => setTimeout(resolve, 250));
      const inspect = () => {
        const root = document.documentElement;
        const bodyStyle = getComputedStyle(document.body);
        const card = document.querySelector("#category-grid .category-card");
        const cardStyle = card ? getComputedStyle(card) : null;
        const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
        return {
          theme: root.dataset.theme || "",
          colorScheme: getComputedStyle(root).colorScheme,
          stored: localStorage.getItem(storageKey),
          themeColor: (document.querySelector('meta[name="theme-color"]')?.content || "").toLowerCase(),
          bodyBackground: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
          cardBackground: cardStyle?.backgroundColor || "",
          cardBorder: cardStyle?.borderTopColor || "",
          buttons: buttons.map((button) => ({
            id: button.id,
            tagName: button.tagName,
            type: button.type,
            pressed: button.getAttribute("aria-pressed"),
            label: button.getAttribute("aria-label"),
            title: button.getAttribute("title")
          }))
        };
      };
      const assertState = (snapshot, theme, stage) => {
        const target = expected[theme];
        if (snapshot.theme !== theme || snapshot.colorScheme !== theme) {
          errors.push(stage + " did not expose the resolved " + theme + " theme and color-scheme on the root.");
        }
        if (snapshot.themeColor !== target.themeColor) {
          errors.push(stage + " did not expose the expected browser theme-color.");
        }
        if (snapshot.bodyBackground !== target.bodyBackground || snapshot.bodyColor !== target.bodyColor
          || snapshot.cardBackground !== target.cardBackground || snapshot.cardBorder !== target.cardBorder) {
          errors.push(stage + " did not apply the expected body and category-card palette.");
        }
        const ids = snapshot.buttons.map((button) => button.id).sort();
        if (snapshot.buttons.length !== 2
          || JSON.stringify(ids) !== JSON.stringify(["auth-theme-toggle-button", "theme-toggle-button"])) {
          errors.push(stage + " did not expose exactly the auth and protected-app theme toggles.");
        }
        if (snapshot.buttons.some((button) => button.tagName !== "BUTTON" || button.type !== "button"
          || button.pressed !== target.pressed || button.label !== target.actionLabel
          || button.title !== target.actionLabel)) {
          errors.push(stage + " did not keep both native theme buttons' ARIA state and action labels synchronized.");
        }
      };

      const light = inspect();
      assertState(light, "light", "First light render");
      if (light.stored !== null) {
        errors.push("The system-derived first light render unexpectedly created an explicit theme preference.");
      }

      const visibleToggle = document.querySelector("#theme-toggle-button");
      if (!visibleToggle || visibleToggle.hidden || getComputedStyle(visibleToggle).display === "none"
        || visibleToggle.getClientRects().length === 0) {
        errors.push("The protected-app theme toggle was not visible.");
      } else {
        visibleToggle.click();
        await pause();
      }
      const dark = inspect();
      assertState(dark, "dark", "Dark toggle");
      if (dark.stored !== "dark") errors.push("Dark toggle did not save the explicit dark preference.");

      return {
        errors,
        initialTheme: light.theme,
        toggledTheme: dark.theme,
        lightColors: {
          bodyBackground: light.bodyBackground,
          bodyColor: light.bodyColor,
          cardBackground: light.cardBackground,
          cardBorder: light.cardBorder
        },
        darkColors: {
          bodyBackground: dark.bodyBackground,
          bodyColor: dark.bodyColor,
          cardBackground: dark.cardBackground,
          cardBorder: dark.cardBorder
        }
      };
    })()`);
    const themeDarkScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(themeScreenshots.dark430, Buffer.from(themeDarkScreenshot.data, "base64"));

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete"
          && document.querySelector("#theme-toggle-button")
          && document.querySelector("#category-grid .category-card")) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for persisted theme testing."));
        }
      }, 50);
    })`);

    const themePersistenceResult = await client.evaluate(`(async () => {
      const errors = [];
      const storageKey = "ppsc-prep:theme:v1";
      const pause = () => new Promise((resolve) => setTimeout(resolve, 250));
      const inspect = () => {
        const root = document.documentElement;
        const bodyStyle = getComputedStyle(document.body);
        const cardStyle = getComputedStyle(document.querySelector("#category-grid .category-card"));
        return {
          theme: root.dataset.theme || "",
          colorScheme: getComputedStyle(root).colorScheme,
          stored: localStorage.getItem(storageKey),
          themeColor: (document.querySelector('meta[name="theme-color"]')?.content || "").toLowerCase(),
          bodyBackground: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
          cardBackground: cardStyle.backgroundColor,
          cardBorder: cardStyle.borderTopColor,
          buttons: [...document.querySelectorAll("[data-theme-toggle]")].map((button) => ({
            pressed: button.getAttribute("aria-pressed"),
            label: button.getAttribute("aria-label"),
            title: button.getAttribute("title")
          }))
        };
      };

      const persistedDark = inspect();
      if (persistedDark.theme !== "dark" || persistedDark.colorScheme !== "dark"
        || persistedDark.stored !== "dark" || persistedDark.themeColor !== "#0d1522"
        || persistedDark.bodyBackground !== "rgb(13, 21, 34)"
        || persistedDark.bodyColor !== "rgb(231, 237, 247)"
        || persistedDark.cardBackground !== "rgb(23, 34, 54)"
        || persistedDark.cardBorder !== "rgb(51, 68, 93)") {
        errors.push("Reload did not preserve the explicit dark theme and computed palette.");
      }
      if (persistedDark.buttons.length !== 2 || persistedDark.buttons.some((button) => (
        button.pressed !== "true" || button.label !== "Switch to light mode"
        || button.title !== "Switch to light mode"
      ))) {
        errors.push("Reload did not preserve the synchronized dark ARIA state on both theme toggles.");
      }

      document.querySelector("#theme-toggle-button")?.click();
      await pause();
      const restoredLight = inspect();
      if (restoredLight.theme !== "light" || restoredLight.colorScheme !== "light"
        || restoredLight.stored !== "light" || restoredLight.themeColor !== "#12366b"
        || restoredLight.bodyBackground !== "rgb(244, 247, 251)"
        || restoredLight.bodyColor !== "rgb(23, 36, 59)"
        || restoredLight.cardBackground !== "rgb(255, 255, 255)"
        || restoredLight.cardBorder !== "rgb(220, 228, 240)") {
        errors.push("Switching back did not save and render the explicit light theme.");
      }
      if (restoredLight.buttons.length !== 2 || restoredLight.buttons.some((button) => (
        button.pressed !== "false" || button.label !== "Switch to dark mode"
        || button.title !== "Switch to dark mode"
      ))) {
        errors.push("Switching back did not synchronize the light ARIA state on both theme toggles.");
      }
      return {
        errors,
        persistedTheme: persistedDark.theme,
        persistedPreference: persistedDark.stored,
        restoredTheme: restoredLight.theme,
        restoredPreference: restoredLight.stored
      };
    })()`);
    const themeLightScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(themeScreenshots.light430, Buffer.from(themeLightScreenshot.data, "base64"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: true
    });
    await delay(150);
    const themeMobileResult = await client.evaluate(`(() => {
      const errors = [];
      const toggle = document.querySelector("#theme-toggle-button");
      const authToggle = document.querySelector("#auth-theme-toggle-button");
      const cloudControls = document.querySelector("#cloud-account-controls");
      const authGate = document.querySelector("#auth-gate");
      const cloudWasHidden = cloudControls?.hidden;
      const authGateWasHidden = authGate?.hidden;
      if (cloudControls) cloudControls.hidden = false;
      const toggleRect = toggle?.getBoundingClientRect();
      const brandRect = document.querySelector(".site-header .brand")?.getBoundingClientRect();
      const actionsRect = document.querySelector(".site-header .header-actions")?.getBoundingClientRect();
      const headerRect = document.querySelector(".site-header")?.getBoundingClientRect();
      if (!toggleRect || toggleRect.width < 40 || toggleRect.height < 40
        || toggleRect.left < -1 || toggleRect.right > window.innerWidth + 1
        || !headerRect || toggleRect.top < headerRect.top - 1 || toggleRect.bottom > headerRect.bottom + 1) {
        errors.push("The protected-app theme toggle was hidden, undersized, or outside the 320px header.");
      }
      if (!brandRect || !actionsRect || actionsRect.right > window.innerWidth + 1
        || actionsRect.left < brandRect.right - 1 || document.documentElement.scrollWidth > window.innerWidth) {
        errors.push("Theme, sync status, and Sign out controls did not fit the 320px production header.");
      }
      if (cloudControls) cloudControls.hidden = cloudWasHidden;

      if (authGate) authGate.hidden = false;
      const authToggleRect = authToggle?.getBoundingClientRect();
      if (!authToggleRect || authToggleRect.width < 40 || authToggleRect.height < 40
        || authToggleRect.left < -1 || authToggleRect.right > window.innerWidth + 1
        || authToggleRect.top < -1 || authToggleRect.bottom > window.innerHeight + 1
        || document.documentElement.scrollWidth > window.innerWidth) {
        errors.push("The auth-gate theme toggle was hidden, undersized, or overflowed at 320px.");
      }
      if (authGate) authGate.hidden = authGateWasHidden;
      return {
        errors,
        viewport: [window.innerWidth, window.innerHeight],
        headerToggle: toggleRect ? [Math.round(toggleRect.width), Math.round(toggleRect.height)] : null,
        authToggle: authToggleRect ? [Math.round(authToggleRect.width), Math.round(authToggleRect.height)] : null
      };
    })()`);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });
    await delay(150);

    const computerSourceFixture = await client.evaluate(`(() => {
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const important = (question) => question?.isImportant === true || Number(question?.repeatCount) >= 2;
      const computerQuestions = data.questions.filter((question) => question.categoryId === "basic-computer-studies");
      const sourceFor = (question) => String(question.id).startsWith("IBES-")
        ? (question.kind === "source" ? "initial-original" : "initial-related")
        : "other";
      const scopeQuestions = {
        all: computerQuestions,
        "initial-original": computerQuestions.filter((question) => sourceFor(question) === "initial-original"),
        "initial-related": computerQuestions.filter((question) => sourceFor(question) === "initial-related"),
        other: computerQuestions.filter((question) => sourceFor(question) === "other")
      };
      const expectedCounts = {
        all: [2564, 463],
        "initial-original": [1088, 399],
        "initial-related": [1088, 20],
        other: [388, 44]
      };
      for (const [scope, questions] of Object.entries(scopeQuestions)) {
        if (questions.length !== expectedCounts[scope][0] || questions.filter(important).length !== expectedCounts[scope][1]) {
          errors.push("Basic Computer " + scope + " source fixture has unexpected total/important counts.");
        }
      }
      if (scopeQuestions["initial-original"].some((question) => !/^IBES-Q\\d{4}-SRC$/.test(question.id) || question.kind !== "source")) {
        errors.push("Initial-original fixture includes a non-IBES source question.");
      }
      if (scopeQuestions["initial-related"].some((question) => !/^IBES-Q\\d{4}-SIM$/.test(question.id) || question.kind !== "similar")) {
        errors.push("Initial-related fixture includes a non-IBES related-practice question.");
      }
      if (scopeQuestions.other.some((question) => String(question.id).startsWith("IBES-"))
        || scopeQuestions.other.filter((question) => question.kind === "source").length !== 194
        || scopeQuestions.other.filter((question) => question.kind === "similar").length !== 194) {
        errors.push("Other Papers fixture is not the expected non-IBES 194 source + 194 related partition.");
      }
      if (computerQuestions.some((question) => /^IBES-Q0254-/.test(question.id))) {
        errors.push("Absent IBES Q254 was fabricated in the Basic Computer bank.");
      }

      const difficultByScope = {
        "initial-original": scopeQuestions["initial-original"].slice(0, 2).map((question) => question.id),
        "initial-related": scopeQuestions["initial-related"].slice(0, 2).map((question) => question.id),
        other: scopeQuestions.other.slice(0, 2).map((question) => question.id)
      };
      const allDifficultIds = new Set(difficultByScope["initial-original"]
        .concat(difficultByScope["initial-related"], difficultByScope.other));
      difficultByScope.all = computerQuestions
        .filter((question) => allDifficultIds.has(String(question.id)))
        .map((question) => String(question.id));
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.setItem("ppsc-prep:difficult-question-ids:v1", JSON.stringify({
        version: 1,
        questionIds: difficultByScope.all
      }));
      return {
        errors,
        scopes: Object.fromEntries(Object.entries(scopeQuestions).map(([scope, questions]) => [scope, {
          ids: questions.map((question) => String(question.id)),
          importantIds: questions.filter(important).map((question) => String(question.id)),
          difficultIds: difficultByScope[scope]
        }]))
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Basic Computer source UI testing."));
        }
      }, 50);
    })`);

    const computerSourceUiResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(computerSourceFixture.scopes)};
      const definitions = [
        ["all", "computer-source-all", "All Basic Computer", 2564, 463],
        ["initial-original", "computer-source-initial-original", "Initial PDF — Original MCQs", 1088, 399],
        ["initial-related", "computer-source-initial-related", "Initial PDF — Related Practice", 1088, 20],
        ["other", "computer-source-other", "Other Papers", 388, 44]
      ];

      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await pause();
      if (visible(document.querySelector("#computer-source-panel"))) {
        errors.push("Basic Computer source panel was visible for a non-Basic category.");
      }
      document.querySelector("#mode-back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      await pause();

      const panel = document.querySelector("#computer-source-panel");
      const radios = [...document.querySelectorAll('input[name="computer-source"]')];
      if (!visible(panel) || radios.length !== 4 || document.documentElement.scrollWidth > window.innerWidth) {
        errors.push("Basic Computer source selector did not render four overflow-safe native radios.");
      }
      for (const [scope, id, label, total, importantCount] of definitions) {
        const radio = document.querySelector("#" + id);
        const labelText = radio?.closest("label")?.querySelector("strong")?.textContent.trim();
        const count = document.querySelector("#computer-source-count-" + scope)?.textContent.trim();
        if (!radio || radio.type !== "radio" || radio.name !== "computer-source" || radio.value !== scope
          || labelText !== label || count !== String(total) || radio.disabled) {
          errors.push("Basic Computer " + scope + " radio label/value/count contract is incorrect.");
        }
        if (expected[scope].ids.length !== total || expected[scope].importantIds.length !== importantCount) {
          errors.push("Basic Computer " + scope + " rendered count disagrees with its classified data fixture.");
        }
      }
      if (!document.querySelector("#computer-source-all")?.checked
        || radios.filter((radio) => radio.checked).length !== 1
        || !document.querySelector("#study-scope-summary")?.textContent.includes("2564")
        || !document.querySelector("#important-count")?.textContent.startsWith("463")) {
        errors.push("Basic Computer did not open with the All source and its exact total/important counts.");
      }
      return { errors };
    })()`);

    const computerSourceScreenshots = {
      mobile430: path.join(os.tmpdir(), "ppsc-computer-source-430-smoke.png"),
      mobile320: path.join(os.tmpdir(), "ppsc-computer-source-320-smoke.png"),
      desktop: path.join(os.tmpdir(), "ppsc-computer-source-desktop-smoke.png")
    };
    await delay(250);
    const sourceSelector430 = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(computerSourceScreenshots.mobile430, Buffer.from(sourceSelector430.data, "base64"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: true
    });
    await delay(150);
    const computerSourceResponsiveResult = await client.evaluate(`(() => {
      const panel = document.querySelector("#computer-source-panel");
      const rect = panel?.getBoundingClientRect();
      const radios = [...document.querySelectorAll('input[name="computer-source"]')];
      const errors = [];
      if (!panel || panel.hidden || document.documentElement.scrollWidth > window.innerWidth
        || !rect || rect.left < -1 || rect.right > window.innerWidth + 1
        || radios.length !== 4 || radios.some((radio) => radio.getClientRects().length === 0)) {
        errors.push("Basic Computer source selector overflowed or lost a radio at 320px.");
      }
      if (document.querySelector("#global-retry-queue-button")) {
        errors.push("Retired global Queue control remained in the 320px header.");
      }
      const cloudControls = document.querySelector("#cloud-account-controls");
      const cloudWasHidden = cloudControls?.hidden;
      if (cloudControls) cloudControls.hidden = false;
      const brandRect = document.querySelector(".site-header .brand")?.getBoundingClientRect();
      const actionsRect = document.querySelector(".site-header .header-actions")?.getBoundingClientRect();
      if (!brandRect || !actionsRect
        || actionsRect.right > window.innerWidth + 1
        || actionsRect.left < brandRect.right - 1
        || document.documentElement.scrollWidth > window.innerWidth) {
        errors.push("Sync status and Sign out controls did not fit together in the 320px production header.");
      }
      if (cloudControls) cloudControls.hidden = cloudWasHidden;
      return { errors, width: window.innerWidth, panelWidth: rect ? Math.round(rect.width) : 0 };
    })()`);
    const sourceSelector320 = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(computerSourceScreenshots.mobile320, Buffer.from(sourceSelector320.data, "base64"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await delay(150);
    const computerSourceDesktopResult = await client.evaluate(`(() => ({
      errors: document.documentElement.scrollWidth > window.innerWidth
        || document.querySelector("#computer-source-panel")?.hidden
        ? ["Basic Computer source selector was hidden or overflowed at desktop width."]
        : [],
      width: window.innerWidth
    }))()`);
    const sourceSelectorDesktop = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(computerSourceScreenshots.desktop, Buffer.from(sourceSelectorDesktop.data, "base64"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset after Basic Computer source UI testing."));
        }
      }, 50);
    })`);

    const retryFifoResult = false
      ? await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const retryKey = "ppsc-prep:retry-queue:v1";
      const sessionKey = "ppsc-prep:active-session:v1";
      const questions = data.questions.filter((question) => question.categoryId === "urdu").slice(0, 12);
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question?.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : (question ? question.options.map(optionText) : []);
      const renderedMainOptions = () => [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const mainSnapshot = () => {
        const snapshot = JSON.parse(localStorage.getItem(sessionKey) || "null");
        return snapshot ? {
          currentIndex: snapshot.currentIndex,
          selectedIndex: snapshot.selectedIndex,
          submitted: snapshot.submitted,
          score: snapshot.score,
          answerHistory: snapshot.answerHistory,
          learnVisitedQuestionIds: snapshot.learnVisitedQuestionIds,
          questionIds: snapshot.questionIds,
          optionOrders: snapshot.optionOrders
        } : null;
      };
      const currentQuestion = () => questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
      const answerMain = async (correct) => {
        const question = currentQuestion();
        const rendered = renderedMainOptions();
        const correctText = question ? displayOptions(question)[question.correctOptionIndex] : "";
        const correctIndex = rendered.indexOf(correctText);
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        const button = document.querySelector('[data-option-index="' + selectedIndex + '"]');
        if (!question || correctIndex < 0 || !button) {
          errors.push("Retry FIFO test could not map an Urdu main answer.");
          return null;
        }
        button.click();
        document.querySelector("#action-button")?.click();
        await pause();
        return { question, correctIndex, selectedIndex };
      };
      const advance = async () => {
        document.querySelector("#action-button")?.click();
        await pause();
      };

      const urduButton = document.querySelector('#category-grid .category-card[data-category="urdu"]');
      if (!urduButton || questions.length !== 12) {
        errors.push("Retry FIFO Urdu fixture is unavailable.");
        return { errors };
      }
      urduButton.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "12";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();

      const firstWrong = await answerMain(false);
      await advance();
      const secondWrong = await answerMain(false);
      await advance();
      await answerMain(true);
      await advance();
      await answerMain(true);
      let retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const firstId = String(firstWrong?.question.id || "");
      const secondId = String(secondWrong?.question.id || "");
      if (!retry || retry.practiceStep !== 4
        || JSON.stringify(retry.items.map((item) => [item.questionId, item.remaining, item.dueStep, item.sequence]))
          !== JSON.stringify([[firstId, 5, 4, 1], [secondId, 5, 5, 2]])) {
        errors.push("Two main wrong answers did not enter the retry queue once in FIFO order.");
      }
      const beforeFirstPopup = mainSnapshot();
      const beforeFirstScore = document.querySelector("#score-text")?.textContent;
      await advance();
      const dialog = document.querySelector("#retry-dialog");
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog?.open || retry?.activeAttempt?.questionId !== firstId) errors.push("FIFO did not present the first due wrong question first.");

      const firstQuestion = questionById.get(firstId);
      const firstAttempt = retry?.activeAttempt;
      const expectedUrduOptions = firstAttempt?.optionOrder.map((index) => firstQuestion.optionsUrdu[index]) || [];
      const retryOptionTexts = [...document.querySelectorAll("#retry-options-container .option-text")];
      const retryOptionLabels = [...document.querySelectorAll("#retry-options-container .option-label")];
      const retryQuestionText = document.querySelector("#retry-question-text");
      const retryOptions = document.querySelector("#retry-options-container");
      if (retryQuestionText?.textContent !== firstQuestion.questionUrdu
        || !retryQuestionText?.classList.contains("is-urdu") || retryQuestionText.lang !== "ur" || retryQuestionText.dir !== "rtl"
        || visible(document.querySelector("#retry-question-urdu-block"))) {
        errors.push("Urdu retry did not use questionUrdu as its sole RTL primary stem.");
      }
      if (!dialog.classList.contains("is-urdu") || !retryOptions?.classList.contains("is-urdu")
        || retryOptions.lang !== "ur" || retryOptions.dir !== "rtl"
        || JSON.stringify(retryOptionTexts.map((element) => element.textContent)) !== JSON.stringify(expectedUrduOptions)
        || JSON.stringify(retryOptionLabels.map((element) => element.textContent)) !== JSON.stringify(["الف", "ب", "ج", "د"])) {
        errors.push("Urdu retry options were not localized and aligned through their saved option order.");
      }
      if (retryOptionTexts.some((element) => element.lang !== "ur" || element.dir !== "rtl" || /[A-Za-z]/.test(element.textContent))) {
        errors.push("Urdu retry options contained a non-Urdu display surface.");
      }
      if (JSON.stringify(mainSnapshot()) !== JSON.stringify(beforeFirstPopup)
        || document.querySelector("#score-text")?.textContent !== beforeFirstScore) {
        errors.push("FIFO retry opening changed the Urdu Quiz state.");
      }
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Urdu retry dialog has horizontal overflow at 430px.");

      document.querySelector("#retry-later-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const postponedFirst = retry?.items.find((item) => item.questionId === firstId);
      const waitingSecond = retry?.items.find((item) => item.questionId === secondId);
      if (dialog.open || retry?.activeAttempt !== null || postponedFirst?.remaining !== 5
        || postponedFirst?.dueStep !== 7 || postponedFirst?.sequence !== 3
        || waitingSecond?.remaining !== 5 || waitingSecond?.dueStep !== 5 || waitingSecond?.sequence !== 2) {
        errors.push("Not now did not postpone without decrementing and move the item behind FIFO work.");
      }
      if (document.querySelector("#question-number-input")?.value !== "5" || document.querySelector("#score-text")?.textContent !== "Score: 2") {
        errors.push("Not now did not resume the fifth main question without changing score.");
      }

      await answerMain(true);
      const beforeWrongRetry = mainSnapshot();
      const beforeWrongScore = document.querySelector("#score-text")?.textContent;
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog.open || retry?.activeAttempt?.questionId !== secondId) errors.push("FIFO did not present the second question after postponing the first.");
      const secondQuestion = questionById.get(secondId);
      const secondCorrectIndex = retry?.activeAttempt?.optionOrder.indexOf(secondQuestion.correctOptionIndex) ?? -1;
      const retryWrongIndex = (secondCorrectIndex + 1) % 4;
      document.querySelector('[data-review-option-index="' + retryWrongIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const checkedWrongItem = retry?.items.find((item) => item.questionId === secondId);
      if (!retry?.activeAttempt?.submitted || retry.activeAttempt.outcome !== "wrong"
        || retry.activeAttempt.wrongIncrement !== 5 || checkedWrongItem?.remaining !== 5
        || !document.querySelector("#retry-dialog-progress")?.textContent.includes("10 درست دہرائیاں باقی ہیں")) {
        errors.push("Wrong retry Check did not project exactly five added reviews without applying early.");
      }
      const retryFeedback = document.querySelector("#retry-feedback");
      const mappedCorrectText = secondQuestion.optionsUrdu[secondQuestion.correctOptionIndex];
      if (!visible(retryFeedback) || !retryFeedback.classList.contains("is-urdu")
        || retryFeedback.lang !== "ur" || retryFeedback.dir !== "rtl"
        || document.querySelector("#retry-feedback-title")?.textContent !== "غلط"
        || !document.querySelector("#retry-feedback-text")?.textContent.includes(mappedCorrectText)
        || /[A-Za-z]/.test(retryFeedback.textContent)) {
        errors.push("Wrong Urdu retry feedback did not reveal the localized correct answer.");
      }
      if (JSON.stringify(mainSnapshot()) !== JSON.stringify(beforeWrongRetry)
        || document.querySelector("#score-text")?.textContent !== beforeWrongScore) {
        errors.push("Wrong retry Check changed main score, progress, or answer history.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      let secondItem = retry?.items.find((item) => item.questionId === secondId);
      if (secondItem?.remaining !== 10 || secondItem?.dueStep !== 8 || secondItem?.sequence !== 4
        || retry?.items.filter((item) => item.questionId === secondId).length !== 1) {
        errors.push("Wrong retry Continue did not atomically add exactly five and coalesce the queue item.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      secondItem = retry?.items.find((item) => item.questionId === secondId);
      if (secondItem?.remaining !== 10) errors.push("A second click after closing applied the wrong +5 more than once.");
      if (document.querySelector("#question-number-input")?.value !== "6" || document.querySelector("#score-text")?.textContent !== "Score: 3") {
        errors.push("Wrong retry did not resume the sixth main question with unchanged scoring.");
      }

      await answerMain(true);
      await advance();
      await answerMain(true);
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog.open || retry?.activeAttempt?.questionId !== firstId) errors.push("Postponed first item did not return at its new FIFO due step.");
      const firstCorrectIndex = retry?.activeAttempt?.optionOrder.indexOf(firstQuestion.correctOptionIndex) ?? -1;
      document.querySelector('[data-review-option-index="' + firstCorrectIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (retry?.items.find((item) => item.questionId === firstId)?.remaining !== 4
        || document.querySelector("#question-number-input")?.value !== "8") {
        errors.push("Correct FIFO retry did not decrement once and resume question eight.");
      }

      await answerMain(true);
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog.open || retry?.activeAttempt?.questionId !== secondId) errors.push("Second FIFO item did not return at step eight.");
      document.querySelector("#retry-later-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (dialog.open || document.querySelector("#question-number-input")?.value !== "9"
        || document.querySelector("#score-text")?.textContent !== "Score: 6") {
        errors.push("Mid-Quiz Later did not resume question nine with the unchanged score.");
      }
      if (retry?.items.length !== 2
        || retry.items.find((item) => item.questionId === firstId)?.remaining !== 4
        || retry.items.find((item) => item.questionId === secondId)?.remaining !== 10) {
        errors.push("Mid-Quiz Later changed or removed persistent retry work.");
      }
      const queueAtResults = JSON.stringify(retry.items);
      const practiceStepAtResults = retry.practiceStep;
      const difficultFixtureIds = [];
      for (let questionNumber = 9; questionNumber <= 11; questionNumber += 1) {
        const numberInput = document.querySelector("#question-number-input");
        if (numberInput) {
          numberInput.value = String(questionNumber);
          numberInput.dispatchEvent(new Event("change", { bubbles: true }));
          await pause();
        }
        const difficultFixtureId = String(currentQuestion()?.id || "");
        const difficultCheckbox = document.querySelector("#difficult-checkbox");
        if (!difficultFixtureId || !difficultCheckbox) {
          errors.push("Could not prepare the three-question Difficult Quiz fixture.");
          break;
        }
        difficultFixtureIds.push(difficultFixtureId);
        if (!difficultCheckbox.checked) {
          difficultCheckbox.click();
          await pause();
        }
      }
      document.querySelector("#back-button")?.click();
      await pause();
      if (!visible(document.querySelector("#category-screen"))
        || JSON.stringify(JSON.parse(localStorage.getItem(retryKey) || "null")?.items) !== queueAtResults) {
        errors.push("Retry queue did not survive returning to categories.");
      }

      const startRange = async (modeSelector, start, end) => {
        document.querySelector(modeSelector)?.click();
        await pause();
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput) {
          errors.push("Retry category-isolation range selector was unavailable.");
          return false;
        }
        startInput.value = String(start);
        endInput.value = String(end);
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
        return visible(document.querySelector("#quiz-screen"));
      };

      document.querySelector('#category-grid .category-card[data-category="urdu"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "3";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      for (let index = 0; index < 3; index += 1) {
        await advance();
        if (dialog.open) errors.push("A queued Quiz review opened during Learn mode.");
      }
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!visible(document.querySelector("#results-screen")) || retry?.practiceStep !== practiceStepAtResults
        || JSON.stringify(retry?.items) !== queueAtResults || retry?.activeAttempt !== null) {
        errors.push("Learn did not leave the retry cadence and queued items completely unchanged.");
      }
      document.querySelector("#change-category-button")?.click();
      await pause();

      const mismatchCategoryId = "job-related-finance-taxation";
      document.querySelector('#category-grid .category-card[data-category="' + mismatchCategoryId + '"]')?.click();
      await startRange("#quiz-mode-button", 1, 4);
      if (document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "2") {
        errors.push("Another category's Quiz did not expose the full global retry queue count.");
      }

      await answerMain(true);
      await advance();
      if (dialog.open) errors.push("A global retry opened before its due step in another category.");
      await answerMain(true);
      const crossCategoryMainBefore = mainSnapshot();
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog.open || retry?.activeAttempt?.questionId !== firstId
        || questionById.get(String(retry?.activeAttempt?.questionId || ""))?.categoryId !== "urdu"
        || document.querySelector("#question-text")?.dataset.questionId
          !== crossCategoryMainBefore?.questionIds?.[crossCategoryMainBefore.currentIndex]) {
        errors.push("A due Urdu review did not open inside another category's Quiz.");
      }
      const crossCategoryFirstAttempt = retry?.activeAttempt;
      const crossCategoryFirstQuestion = questionById.get(String(crossCategoryFirstAttempt?.questionId || ""));
      const crossCategoryFirstCorrect = crossCategoryFirstAttempt && crossCategoryFirstQuestion
        ? crossCategoryFirstAttempt.optionOrder.indexOf(crossCategoryFirstQuestion.correctOptionIndex)
        : -1;
      document.querySelector('[data-review-option-index="' + crossCategoryFirstCorrect + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      document.querySelector("#retry-action-button")?.click();
      await pause();

      await answerMain(true);
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!dialog.open || retry?.activeAttempt?.questionId !== secondId) {
        errors.push("The next global FIFO review did not continue in the other category's Quiz.");
      }
      document.querySelector("#retry-later-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (dialog.open || retry?.items.find((item) => item.questionId === secondId)?.remaining !== 10
        || document.querySelector("#question-number-input")?.value !== "4") {
        errors.push("Postponing a cross-category review did not preserve it and resume the main Quiz.");
      }

      await answerMain(true);
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!visible(document.querySelector("#results-screen")) || dialog.open || retry?.activeAttempt !== null
        || retry?.practiceStep !== practiceStepAtResults + 4
        || retry?.items.find((item) => item.questionId === secondId)?.remaining !== 10) {
        errors.push("Quiz Results did not open immediately while global retry work remained saved.");
      }
      document.querySelector("#change-category-button")?.click();
      await pause();

      document.querySelector('#category-grid .category-card[data-category="urdu"]')?.click();
      document.querySelector("#difficult-mode-button")?.click();
      await pause();
      if (document.querySelector("#difficult-count")?.textContent.trim() !== "3") {
        errors.push("Three-question Difficult Quiz fixture was not available in the current page state.");
      }
      await startRange("#difficult-quiz-button", 1, 3);
      if (document.querySelector("#question-text")?.dataset.questionId !== difficultFixtureIds[0]) {
        errors.push("Difficult Quiz did not start with the first in-memory marked question.");
      }
      if (document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "2") {
        errors.push("Difficult Quiz did not show the two remaining global queue items.");
      }
      await answerMain(true);
      const difficultScoreBeforeFirstReview = document.querySelector("#score-text")?.textContent;
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const firstDifficultAttempt = retry?.activeAttempt;
      if (!dialog.open || firstDifficultAttempt?.questionId !== firstId
        || document.querySelector("#quiz-screen")?.dataset.scope !== "difficult") {
        errors.push("The first due global review did not appear during Difficult Quiz.");
      }
      const firstDifficultReviewQuestion = questionById.get(String(firstDifficultAttempt?.questionId || ""));
      const firstDifficultCorrectIndex = firstDifficultAttempt && firstDifficultReviewQuestion
        ? firstDifficultAttempt.optionOrder.indexOf(firstDifficultReviewQuestion.correctOptionIndex)
        : -1;
      document.querySelector('[data-review-option-index="' + firstDifficultCorrectIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      if (document.querySelector("#score-text")?.textContent !== difficultScoreBeforeFirstReview
        || document.querySelector("#question-number-input")?.value !== "2") {
        errors.push("First global Difficult review changed score or failed to resume question two.");
      }

      await answerMain(true);
      const difficultScoreBeforeSecondReview = document.querySelector("#score-text")?.textContent;
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const secondDifficultAttempt = retry?.activeAttempt;
      if (!dialog.open || secondDifficultAttempt?.questionId !== secondId) {
        errors.push("The second due global review did not continue in FIFO order during Difficult Quiz.");
      }
      document.querySelector("#retry-later-button")?.click();
      await pause();
      if (document.querySelector("#score-text")?.textContent !== difficultScoreBeforeSecondReview
        || document.querySelector("#question-number-input")?.value !== "3") {
        errors.push("Second global Difficult review changed score or failed to resume question three.");
      }
      await answerMain(true);
      await advance();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!visible(document.querySelector("#results-screen")) || dialog.open || retry?.activeAttempt !== null
        || retry?.items.find((item) => item.questionId === firstId)?.remaining !== 2
        || retry?.items.find((item) => item.questionId === secondId)?.remaining !== 10) {
        errors.push("Difficult Quiz did not finish with its remaining global review saved for later.");
      }
      sessionStorage.setItem("ppsc-smoke:retry-seed", JSON.stringify(retry));

      return {
        errors,
        fifoIds: [firstId, secondId],
        wrongRemaining: 10,
        scoreBeforeExit: "Score: 6",
        survivedResults: true,
        learnReviewEligible: true,
        crossCategoryReviewShown: true,
        difficultQuizEligible: true,
        pendingAfterResults: retry?.items.find((item) => item.questionId === secondId)?.remaining || null,
        seedQueue: retry
      };
      })()`)
      : { errors: [] };

    // Embedded Learn/Quiz practice keeps category-local Queue and Important popups.
    // Manual Queue practice is a category-local, full-screen question flow. A saved
    // Queue item gets one turn per insertion-order cycle, even when it is answered wrong.
    await client.evaluate(`(() => {
      const questions = window.PPSC_QUIZ_DATA?.questions || [];
      const hashText = (initialHash, value) => {
        let hash = initialHash;
        const text = String(value);
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash;
      };
      let hash = 2166136261;
      questions.forEach((question) => {
        hash = hashText(hash, JSON.stringify([
          question.id,
          question.categoryId,
          question.question,
          question.questionUrdu,
          question.correctOptionIndex,
          question.options,
          question.optionsUrdu
        ]));
        hash = hashText(hash, "\\n");
      });
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.setItem("ppsc-prep:retry-queue:v1", JSON.stringify({
        version: 1,
        bankSignature: "v1:" + questions.length + ":" + (hash >>> 0).toString(16),
        countBaselineVersion: 1,
        embeddedCadenceVersion: 2,
        practiceStep: 0,
        nextQuizReviewStep: null,
        nextImportantReviewStep: 1000,
        nextSequence: 1,
        items: [],
        activeAttempt: null
      }));
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for the current Review Queue contract."));
        }
      }, 50);
    })`);

    const retryQueueFeatureResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const retryKey = "ppsc-prep:retry-queue:v1";
      const data = window.PPSC_QUIZ_DATA;
      const own = data.questions.filter((question) => question.categoryId === "general-knowledge").slice(0, 3);
      const foreign = data.questions.find((question) => question.categoryId === "urdu");
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const hashText = (initialHash, value) => {
        let hash = initialHash;
        for (const character of String(value)) {
          hash ^= character.charCodeAt(0);
          hash = Math.imul(hash, 16777619);
        }
        return hash;
      };
      let hash = 2166136261;
      data.questions.forEach((question) => {
        hash = hashText(hash, JSON.stringify([
          question.id, question.categoryId, question.question, question.questionUrdu,
          question.correctOptionIndex, question.options, question.optionsUrdu
        ]));
        hash = hashText(hash, "\\n");
      });
      const oldQueue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const ids = own.map((question) => String(question.id));
      if (ids.length !== 3 || !foreign) {
        return { errors: ["Category Queue FIFO fixture did not find three GK and one Urdu question."], sourceReviewIds: [] };
      }
      const savedSeed = {
        version: 1,
        bankSignature: oldQueue?.bankSignature || "v1:" + data.questions.length + ":" + (hash >>> 0).toString(16),
        countBaselineVersion: 1,
        embeddedCadenceVersion: 2,
        practiceStep: 0,
        nextQuizReviewStep: 5,
        nextImportantReviewStep: 1000,
        nextSequence: 41,
        items: [
          ...ids.map((questionId, index) => ({ questionId, remaining: [2, 1, 2][index], dueStep: 0, sequence: [30, 10, 20][index] })),
          { questionId: String(foreign.id), remaining: 3, dueStep: 0, sequence: 40 }
        ],
        activeAttempt: null
      };
      const originalComputerId = "IBES-Q0017-SRC";
      const relatedComputerId = String(data.questions.find((question) =>
        question.categoryId === "basic-computer-studies" && String(question.id).startsWith("IBES-")
          && question.kind !== "source"
      )?.id || "");
      const downstreamIds = [originalComputerId, relatedComputerId, ids[0]];
      const downstreamSeed = {
        ...savedSeed,
        nextSequence: 4,
        items: downstreamIds.map((questionId, index) => ({
          questionId, remaining: [2, 2, 1][index], dueStep: 0, sequence: index + 1
        }))
      };
      if (downstreamIds.some((questionId) => !data.questions.some((question) => String(question.id) === questionId))) {
        errors.push("Saved cross-category Queue fixture could not map its Basic Computer sources.");
      }
      sessionStorage.setItem("ppsc-smoke:retry-seed", JSON.stringify(downstreamSeed));
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.setItem(retryKey, JSON.stringify(savedSeed));
      return {
        errors,
        sourceReviewIds: ids,
        foreignId: String(foreign.id),
        seedQueue: downstreamSeed,
        cadence: 5,
        nextCadence: 5,
        categoriesCovered: ["general-knowledge", "urdu"],
        screenshots: {}
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for category Queue cycle testing."));
        }
      }, 50);
    })`);

    const categoryQueueCycleResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(retryQueueFeatureResult)};
      const queue = () => JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      const questions = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      const ids = expected.sourceReviewIds || [];
      const initial = queue();
      if (initial?.items?.length !== 4
        || JSON.stringify(initial.items.map((item) => item.remaining)) !== JSON.stringify([2, 1, 2, 3])) {
        errors.push("Reload lost finite Queue questions or their saved review counts.");
      }
      if (document.querySelector("#global-retry-queue-button") || document.querySelector("#retry-queue-card")) {
        errors.push("Removed all-category Queue controls still exist.");
      }
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await pause();
      const modeButton = document.querySelector("#queue-mode-button");
      if (!visible(document.querySelector("#mode-screen")) || !visible(modeButton)
        || modeButton?.disabled || modeButton?.dataset.count !== "3"
        || modeButton?.dataset.remaining !== "5") {
        errors.push("General Knowledge mode did not show only its three saved Queue MCQs and five reviews.");
      }
      modeButton?.click();
      await pause();
      let attempt = queue()?.activeAttempt;
      if (!visible(document.querySelector("#queue-screen"))
        || !visible(document.querySelector("#retry-question-text"))
        || document.querySelector("#retry-dialog")?.open
        || attempt?.context !== "dedicated" || attempt?.questionId !== ids[0]) {
        errors.push("Manual Queue did not open full-screen with the earliest queued category MCQ.");
      }
      const first = questions.get(ids[0]);
      const firstCorrectIndex = attempt?.optionOrder?.indexOf(first?.correctOptionIndex) ?? -1;
      if (firstCorrectIndex < 0) {
        errors.push("Manual Queue could not locate the first canonical answer.");
      } else {
        const wrongIndex = (firstCorrectIndex + 1) % 4;
        document.querySelector('[data-review-option-index="' + wrongIndex + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        if (queue()?.items.find((item) => item.questionId === ids[0])?.remaining !== 2) {
          errors.push("Wrong Queue Check changed the saved count before Continue.");
        }
        document.querySelector("#retry-action-button")?.click();
        await pause();
        attempt = queue()?.activeAttempt;
        if (queue()?.items.find((item) => item.questionId === ids[0])?.remaining !== 4
          || attempt?.questionId !== ids[1]) {
          errors.push("Wrong first MCQ did not add two while yielding the next turn to the second MCQ.");
        }
      }
      return {
        errors,
        currentId: queue()?.activeAttempt?.questionId || "",
        firstRemaining: queue()?.items.find((item) => item.questionId === ids[0])?.remaining ?? null
      };
    })()`);

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await delay(150);
    const categoryQueueMobileResult = await client.evaluate(`(() => {
      const errors = [];
      const screen = document.querySelector("#queue-screen");
      const card = document.querySelector("#queue-practice-slot .retry-dialog-card");
      const action = document.querySelector("#retry-action-button");
      const back = document.querySelector("#queue-back-button");
      const withinWidth = (element) => {
        const rect = element?.getBoundingClientRect();
        return Boolean(rect && rect.width > 0 && rect.left >= -1 && rect.right <= window.innerWidth + 1);
      };
      if (!screen || screen.hidden || document.querySelector("#retry-dialog")?.open
        || document.documentElement.scrollWidth > window.innerWidth
        || !withinWidth(card) || !withinWidth(action) || !withinWidth(back)
        || action.getBoundingClientRect().height < 38 || back.getBoundingClientRect().height < 38) {
        errors.push("Full-screen category Queue overflowed or lost usable controls at 320px.");
      }
      return { errors, width: window.innerWidth };
    })()`);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload while category Queue was in progress."));
        }
      }, 50);
    })`);

    const categoryQueueResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const expected = ${JSON.stringify(retryQueueFeatureResult)};
      const ids = expected.sourceReviewIds || [];
      const queue = () => JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      const questions = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      const startCategoryQueue = async (categoryId) => {
        document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
        await pause();
        document.querySelector("#queue-mode-button")?.click();
        await pause();
      };
      const solveCorrect = async (questionId) => {
        const attempt = queue()?.activeAttempt;
        const question = questions.get(questionId);
        const index = attempt?.optionOrder?.indexOf(question?.correctOptionIndex) ?? -1;
        if (attempt?.questionId !== questionId || index < 0) {
          errors.push("Queue cycle expected " + questionId + " but found " + (attempt?.questionId || "none") + ".");
          return;
        }
        document.querySelector('[data-review-option-index="' + index + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        document.querySelector("#retry-action-button")?.click();
        await pause();
      };
      await startCategoryQueue("general-knowledge");
      if (queue()?.activeAttempt?.questionId !== ids[1]
        || queue()?.items.find((item) => item.questionId === ids[0])?.remaining !== 4) {
        errors.push("Refresh did not resume the second Queue MCQ with the first MCQ's +2 saved.");
      }
      await solveCorrect(ids[1]);
      await solveCorrect(ids[2]);
      if (queue()?.activeAttempt?.questionId !== ids[0]) {
        errors.push("The first Queue MCQ did not return only after every other item had one turn.");
      }
      if (queue()?.items.find((item) => item.questionId === expected.foreignId)?.remaining !== 3) {
        errors.push("Manual GK Queue changed another category's saved Queue item.");
      }
      return { errors, nextCycleId: queue()?.activeAttempt?.questionId || "" };
    })()`);

    retryQueueFeatureResult.errors = retryQueueFeatureResult.errors
      .concat(categoryQueueCycleResult.errors, categoryQueueMobileResult.errors, categoryQueueResumeResult.errors);

    await client.evaluate(`(() => {
      const key = "ppsc-prep:retry-queue:v1";
      const queue = JSON.parse(localStorage.getItem(key) || "null");
      const ids = ${JSON.stringify(retryQueueFeatureResult.sourceReviewIds)};
      queue.practiceStep = 0;
      queue.nextQuizReviewStep = 1;
      queue.nextImportantReviewStep = 1000;
      queue.nextSequence = 41;
      queue.activeAttempt = null;
      queue.items = ids.map((questionId, index) => ({
        questionId,
        remaining: 2,
        dueStep: index === 0 ? 15 : 0,
        ...(index === 0 ? { wrongRetryDueStep: 15 } : {}),
        sequence: [30, 10, 20][index]
      }));
      delete queue.queueCyclePendingByCategory;
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.setItem(key, JSON.stringify(queue));
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for cooled-head Queue testing."));
        }
      }, 50);
    })`);
    const cooledQueueHeadResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const ids = ${JSON.stringify(retryQueueFeatureResult.sourceReviewIds)};
      const queue = () => JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      const byId = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "20";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const advanceLearn = async () => {
        document.querySelector("#action-button")?.click();
        await pause();
        document.querySelector("#action-button")?.click();
        await pause();
      };
      const solvePopup = async (questionId) => {
        const attempt = queue()?.activeAttempt;
        const question = byId.get(questionId);
        const index = attempt?.optionOrder?.indexOf(question?.correctOptionIndex) ?? -1;
        if (!document.querySelector("#retry-dialog")?.open || attempt?.questionId !== questionId || index < 0) {
          errors.push("Expected ready Queue MCQ " + questionId + " while oldest MCQ was cooling.");
          return;
        }
        document.querySelector('[data-review-option-index="' + index + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        document.querySelector("#retry-action-button")?.click();
        await pause();
      };
      await advanceLearn();
      await solvePopup(ids[1]);
      let secondAttempt = null;
      for (let guard = 0; guard < 7 && !document.querySelector("#retry-dialog")?.open; guard += 1) {
        await advanceLearn();
      }
      secondAttempt = queue()?.activeAttempt;
      if (!document.querySelector("#retry-dialog")?.open || secondAttempt?.questionId !== ids[2]
        || queue()?.items.find((item) => item.questionId === ids[0])?.remaining !== 2) {
        errors.push("A cooled oldest Queue MCQ blocked the younger ready MCQ or lost its saved count.");
      }
      return { errors, firstReadyId: ids[1], secondReadyId: secondAttempt?.questionId || "" };
    })()`);
    retryQueueFeatureResult.errors = retryQueueFeatureResult.errors.concat(cooledQueueHeadResult.errors);

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for retry category-mismatch seeding."));
        }
      }, 50);
    })`);

    const retryMismatchSeedResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const seed = sessionStorage.getItem("ppsc-smoke:retry-seed");
      const categoryId = "job-related-finance-taxation";
      document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      const startInput = document.querySelector("#question-range-start-input");
      const endInput = document.querySelector("#question-range-end-input");
      if (!seed || !startInput || !endInput) {
        errors.push("Could not prepare a saved global retry queue for another Quiz category.");
        return { errors };
      }
      startInput.value = "1";
      endInput.value = "2";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const active = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!active || active.categoryId !== categoryId || active.mode !== "quiz") {
        errors.push("Cross-category active-session fixture was invalid.");
      }
      localStorage.setItem("ppsc-prep:retry-queue:v1", seed);
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for retry category-mismatch recovery verification."));
        }
      }, 50);
    })`);

    const retryMismatchResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const seed = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-seed") || "null");
      if (!visible(document.querySelector("#continue-session-card"))) {
        errors.push("Cross-category Quiz was not resumable after reload.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const retry = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (document.querySelector("#retry-dialog")?.open
        || document.querySelector("#quiz-screen")?.dataset.mode !== "quiz"
        || JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null")?.categoryId !== "job-related-finance-taxation"
        || retry?.activeAttempt !== null
        || JSON.stringify(retry?.items || []) !== JSON.stringify(seed?.items || [])) {
        errors.push("Continue unexpectedly opened or removed the saved global retry queue.");
      }
      if (!document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0"
        || document.querySelector("#global-retry-queue-button")) {
        errors.push("Cross-category Continue showed another category's Queue or retained a global Queue control.");
      }
      document.querySelector("#back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "17";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const learnSession = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!learnSession || learnSession.categoryId !== "basic-computer-studies" || learnSession.mode !== "learn") {
        errors.push("Learn active-session fixture for saved-review visibility was invalid.");
      }
      const learnQueue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      sessionStorage.setItem("ppsc-smoke:learn-retry-seed", JSON.stringify(learnQueue));
      const learnSpacing = learnQueue?.nextQuizReviewStep - learnQueue?.practiceStep;
      if (!learnQueue || !Number.isInteger(learnSpacing) || learnSpacing < 5 || learnSpacing > 6) {
        errors.push("Learn did not preserve the regular five-to-six-question Queue gate when it started.");
      }
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for saved retry Learn visibility."));
        }
      }, 50);
    })`);

    const retryLearnResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const seed = JSON.parse(sessionStorage.getItem("ppsc-smoke:learn-retry-seed") || "null");
      const originalSeed = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-seed") || "null");
      const retryKey = "ppsc-prep:retry-queue:v1";
      const sessionKey = "ppsc-prep:active-session:v1";
      const data = window.PPSC_QUIZ_DATA;
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      document.querySelector("#continue-session-button")?.click();
      await pause();
      let retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const initialCounts = Object.fromEntries((retry?.items || []).map((item) => [item.questionId, item.remaining]));
      let embeddedOldestFirst = false;
      if (document.querySelector("#retry-dialog")?.open
        || document.querySelector("#quiz-screen")?.dataset.mode !== "learn"
        || retry?.activeAttempt !== null
        || JSON.stringify(retry) !== JSON.stringify(seed)
        || JSON.stringify(retry?.items || []) !== JSON.stringify(originalSeed?.items || [])) {
        errors.push("Continue opened or removed a saved retry while restoring Learn.");
      }
      const activeCategoryId = "basic-computer-studies";
      const sameCategoryItems = (seed?.items || []).filter((item) =>
        questionById.get(String(item.questionId))?.categoryId === activeCategoryId
      );
      const expectedCount = String(sameCategoryItems.length);
      if (document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== expectedCount
        || document.querySelector("#global-retry-queue-button")) {
        errors.push("Learn Continue did not show its category Queue count or retained a global Queue control.");
      }

      const spacing = retry?.nextQuizReviewStep - retry?.practiceStep;
      const initialPracticeStep = retry?.practiceStep;
      if (!Number.isInteger(spacing) || spacing < 5 || spacing > 6) {
        errors.push("Restored Learn queue lost its persisted five-to-six-question cadence.");
      }
      Math.random = () => 0;

      document.querySelector("#action-button")?.click();
      await pause();
      const afterFirstReveal = JSON.parse(localStorage.getItem(retryKey) || "null");
      const firstRevealSession = JSON.parse(localStorage.getItem(sessionKey) || "null");
      if (afterFirstReveal?.practiceStep !== initialPracticeStep
        || firstRevealSession?.learnReviewCountedQuestionIds?.length !== 0
        || firstRevealSession?.submitted !== true
        || document.querySelector("#question-number-input")?.value !== "1") {
        errors.push("Revealing the first Learn answer changed cadence or advanced the range.");
      }
      document.querySelector("#action-button")?.click();
      await pause();
      const afterFirst = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (afterFirst?.practiceStep !== initialPracticeStep + 1
        || JSON.parse(localStorage.getItem(sessionKey) || "null")?.learnReviewCountedQuestionIds?.length !== 1
        || document.querySelector("#question-number-input")?.value !== "2") {
        errors.push("Leaving the first revealed Learn question did not advance cadence and the main range once.");
      }
      document.querySelector("#previous-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      const afterRepeat = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (afterRepeat?.practiceStep !== afterFirst?.practiceStep || document.querySelector("#question-number-input")?.value !== "2") {
        errors.push("Revisiting an already completed Learn question advanced the review cadence twice.");
      }

      for (let completion = 2; Number.isInteger(spacing) && completion <= spacing; completion += 1) {
        document.querySelector("#action-button")?.click();
        await pause();
        const queueAfterReveal = JSON.parse(localStorage.getItem(retryKey) || "null");
        const sessionBefore = JSON.parse(localStorage.getItem(sessionKey) || "null");
        if (queueAfterReveal?.practiceStep !== initialPracticeStep + completion - 1
          || sessionBefore?.learnReviewCountedQuestionIds?.length !== completion - 1
          || sessionBefore?.submitted !== true
          || document.querySelector("#retry-dialog")?.open) {
          errors.push("Learn answer reveal changed cadence before completion " + completion + ".");
          break;
        }
        document.querySelector("#action-button")?.click();
        await pause();
        const dialogOpen = Boolean(document.querySelector("#retry-dialog")?.open);
        if (completion < spacing && dialogOpen) {
          errors.push("Learn review opened before its persisted five-to-six-question gate.");
          break;
        }
        if (completion === spacing) {
          retry = JSON.parse(localStorage.getItem(retryKey) || "null");
          const attempt = retry?.activeAttempt;
          const sessionAtReview = JSON.parse(localStorage.getItem(sessionKey) || "null");
          embeddedOldestFirst = attempt?.questionId === sameCategoryItems[0]?.questionId;
          if (!dialogOpen || attempt?.context !== "embedded"
            || retry.practiceStep !== initialPracticeStep + spacing
            || sessionAtReview?.mode !== "learn" || sessionAtReview?.score !== 0
            || sessionAtReview?.currentIndex !== sessionBefore?.currentIndex
            || JSON.stringify(sessionAtReview?.learnVisitedQuestionIds) !== JSON.stringify(sessionBefore?.learnVisitedQuestionIds)
            || sessionAtReview?.learnReviewCountedQuestionIds?.length !== spacing) {
            errors.push("Learn review did not open exactly after its persisted number of completed main questions.");
          }
          if (!embeddedOldestFirst) {
            errors.push("Embedded Learn review did not select the oldest due category MCQ first.");
          }
          if (JSON.stringify(Object.fromEntries((retry?.items || []).map((item) => [item.questionId, item.remaining])))
            !== JSON.stringify(initialCounts)) {
            errors.push("Opening a shuffled embedded review changed saved repetition counts.");
          }
          const reviewQuestion = questionById.get(String(attempt?.questionId || ""));
          const correctReviewIndex = reviewQuestion && attempt
            ? attempt.optionOrder.indexOf(reviewQuestion.correctOptionIndex)
            : -1;
          const mainSessionDuringReview = localStorage.getItem(sessionKey);
          const remainingBefore = retry?.items.find((item) => item.questionId === attempt?.questionId)?.remaining;
          document.querySelector('[data-review-option-index="' + correctReviewIndex + '"]')?.click();
          document.querySelector("#retry-action-button")?.click();
          await pause();
          const checked = JSON.parse(localStorage.getItem(retryKey) || "null");
          if (!checked?.activeAttempt?.submitted || checked.activeAttempt.outcome !== "correct"
            || checked.items.find((item) => item.questionId === attempt?.questionId)?.remaining !== remainingBefore
            || localStorage.getItem(sessionKey) !== mainSessionDuringReview
            || document.querySelector("#score-text")?.textContent !== "Learn Mode") {
            errors.push("Checking an embedded Learn review changed its saved count or main Learn progress too early.");
          }
          document.querySelector("#retry-action-button")?.click();
          await pause();
          retry = JSON.parse(localStorage.getItem(retryKey) || "null");
          const resumedSession = JSON.parse(localStorage.getItem(sessionKey) || "null");
          const nextSpacing = retry?.nextQuizReviewStep - retry?.practiceStep;
          const countsAfter = Object.fromEntries((retry?.items || []).map((item) => [item.questionId, item.remaining]));
          const untouchedCountsChanged = Object.keys(initialCounts).some((questionId) => (
            questionId !== attempt?.questionId && countsAfter[questionId] !== initialCounts[questionId]
          ));
          if (document.querySelector("#retry-dialog")?.open || retry?.activeAttempt !== null
            || retry.items.find((item) => item.questionId === attempt?.questionId)?.remaining !== remainingBefore - 1
            || untouchedCountsChanged
            || !Number.isInteger(nextSpacing) || nextSpacing < 5 || nextSpacing > 6
            || resumedSession?.mode !== "learn" || resumedSession?.score !== 0
            || resumedSession?.currentIndex !== sessionBefore.currentIndex + 1) {
            errors.push("Continuing a correct Learn review did not decrement once, reschedule, and resume Learn.");
          }
        }
      }

      if (document.querySelector("#global-retry-queue-button")
        || document.querySelector("#quiz-screen")?.dataset.mode !== "learn") {
        errors.push("Learn session retained removed global Queue access or lost its mode.");
      }
      return { errors, spacing, embeddedOldestFirst };
    })()`);

    const retryLegacyLearnMigrationSeed = await client.evaluate(`(() => {
      const errors = [];
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      const snapshot = JSON.parse(localStorage.getItem(sessionKey) || "null");
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!snapshot || snapshot.mode !== "learn" || !queue?.items?.length) {
        errors.push("Legacy Learn migration fixture was unavailable.");
        return { errors };
      }
      delete snapshot.learnReviewCountedQuestionIds;
      queue.nextQuizReviewStep = queue.practiceStep;
      queue.items.forEach((item) => { item.dueStep = Math.min(item.dueStep, queue.practiceStep); });
      localStorage.setItem(sessionKey, JSON.stringify(snapshot));
      localStorage.setItem(retryKey, JSON.stringify(queue));
      sessionStorage.setItem("ppsc-smoke:legacy-learn-session", JSON.stringify(snapshot));
      sessionStorage.setItem("ppsc-smoke:legacy-learn-queue", JSON.stringify(queue));
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for legacy Learn review migration."));
        }
      }, 50);
    })`);

    const retryLegacyLearnMigrationResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      const expectedSession = JSON.parse(sessionStorage.getItem("ppsc-smoke:legacy-learn-session") || "null");
      const expectedQueue = JSON.parse(sessionStorage.getItem("ppsc-smoke:legacy-learn-queue") || "null");
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const migratedSession = JSON.parse(localStorage.getItem(sessionKey) || "null");
      const migratedQueue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const migratedSpacing = migratedQueue?.nextQuizReviewStep - migratedQueue?.practiceStep;
      if (document.querySelector("#retry-dialog")?.open || migratedSession?.mode !== "learn"
        || migratedSession?.currentIndex !== expectedSession?.currentIndex
        || JSON.stringify(migratedSession?.learnReviewCountedQuestionIds)
          !== JSON.stringify(expectedSession?.learnVisitedQuestionIds)
        || migratedQueue?.practiceStep !== expectedQueue?.practiceStep
        || JSON.stringify(migratedQueue?.items) !== JSON.stringify(expectedQueue?.items)
        || !Number.isInteger(migratedSpacing) || migratedSpacing < 5 || migratedSpacing > 6) {
        errors.push("Legacy v8 Learn Continue did not preserve counts and safely anchor the regular five-to-six-question Queue cadence.");
      }
      return { errors, migratedSpacing };
    })()`);

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for position-dependent retry testing."));
        }
      }, 50);
    })`);

    const retryPositionSeedResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const retryKey = "ppsc-prep:retry-queue:v1";
      const targetId = "IBES-Q0017-SRC";
      const target = data.questions.find((question) => String(question.id) === targetId);
      const categoryQuestions = target ? data.questions.filter((question) => question.categoryId === target.categoryId) : [];
      const targetIndex = categoryQuestions.findIndex((question) => String(question.id) === targetId);
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.options.map(optionText);
      const renderedMainOptions = () => [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const currentQuestion = () => questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
      const answerMain = async (correct) => {
        const question = currentQuestion();
        const correctIndex = question ? renderedMainOptions().indexOf(displayOptions(question)[question.correctOptionIndex]) : -1;
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        const button = document.querySelector('[data-option-index="' + selectedIndex + '"]');
        if (!question || correctIndex < 0 || !button) {
          errors.push("Position retry test could not map a main answer.");
          return;
        }
        button.click();
        document.querySelector("#action-button")?.click();
        await pause();
      };
      if (!target || targetIndex < 0) {
        errors.push("Position-dependent retry fixture is unavailable.");
        return { errors, targetId };
      }
      document.querySelector('#category-grid .category-card[data-category="' + target.categoryId + '"]')?.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = String(targetIndex + 1);
      document.querySelector("#question-range-end-input").value = String(targetIndex + 1);
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      if (JSON.stringify(renderedMainOptions()) !== JSON.stringify(displayOptions(target))) {
        errors.push("Position-dependent main question did not retain canonical options before queueing.");
      }
      await answerMain(false);
      document.querySelector("#action-button")?.click();
      await pause();

      const dialog = document.querySelector("#retry-dialog");
      const retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const queuedItem = retry?.items.find((item) => item.questionId === targetId);
      if (dialog?.open || !visible(document.querySelector("#results-screen"))
        || retry?.activeAttempt !== null
        || retry?.items.length !== 1 || queuedItem?.remaining !== 2
        || document.querySelector("#result-score")?.textContent.replace(/\\s/g, "") !== "0/1") {
        errors.push("The source Quiz did not save exactly one two-review MCQ before finishing.");
      }
      // Anchor the saved wrong MCQ just after the next completed question. The
      // browser reload below makes this deterministic without changing runtime
      // queue state behind the running app's back.
      if (retry && queuedItem) {
        queuedItem.dueStep = retry.practiceStep + 1;
        queuedItem.wrongRetryDueStep = queuedItem.dueStep;
        retry.nextQuizReviewStep = queuedItem.dueStep;
        retry.nextImportantReviewStep = retry.practiceStep + 1000;
        retry.nextSequentialReviewStep = retry.practiceStep + 1000;
        retry.activeAttempt = null;
        localStorage.setItem(retryKey, JSON.stringify(retry));
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      return { errors, targetId };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for category-scoped retry testing."));
        }
      }, 50);
    })`);

    const retryPositionResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = ${JSON.stringify(retryPositionSeedResult.errors)}.slice();
      const targetId = ${JSON.stringify(retryPositionSeedResult.targetId)};
      const data = window.PPSC_QUIZ_DATA;
      const target = data.questions.find((question) => String(question.id) === targetId);
      const retryKey = "ppsc-prep:retry-queue:v1";
      const sessionKey = "ppsc-prep:active-session:v1";
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.options.map(optionText);
      const currentQuestion = () => data.questions.find((question) =>
        String(question.id) === String(document.querySelector("#question-text")?.dataset.questionId || "")
      );
      const queue = () => JSON.parse(localStorage.getItem(retryKey) || "null");
      const answerMain = async () => {
        const question = currentQuestion();
        const rendered = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
        const correctIndex = question ? rendered.indexOf(optionText(question.options[question.correctOptionIndex])) : -1;
        if (correctIndex < 0) {
          errors.push("Category-scoped retry test could not map a correct main answer.");
          return;
        }
        document.querySelector('[data-option-index="' + correctIndex + '"]')?.click();
        document.querySelector("#action-button")?.click();
        await pause();
        document.querySelector("#action-button")?.click();
        await pause();
      };
      const startRange = async (modeSelector, start, end) => {
        document.querySelector(modeSelector)?.click();
        await pause();
        document.querySelector("#question-range-start-input").value = String(start);
        document.querySelector("#question-range-end-input").value = String(end);
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      };
      const selectCategory = async (categoryId) => {
        document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
        await pause();
      };
      const dialog = document.querySelector("#retry-dialog");
      if (!target || queue()?.items?.length !== 1) {
        errors.push("Category-scoped retry fixture did not restore its one saved Basic Computer MCQ.");
      }

      await selectCategory("job-related-finance-taxation");
      await startRange("#quiz-mode-button", 1, 2);
      if (!document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0"
        || document.querySelector("#global-retry-queue-button")) {
        errors.push("Job Quiz included a Basic Computer Queue item or retained global Queue access.");
      }
      await answerMain();
      if (dialog?.open || queue()?.items.find((item) => item.questionId === targetId)?.remaining !== 2) {
        errors.push("Due Basic Computer Queue MCQ interrupted Job Quiz or changed its saved count.");
      }
      await answerMain();
      if (dialog?.open || !visible(document.querySelector("#results-screen"))
        || queue()?.items.find((item) => item.questionId === targetId)?.remaining !== 2) {
        errors.push("Job Quiz did not finish while the other-category Queue item stayed saved.");
      }

      document.querySelector("#change-category-button")?.click();
      await pause();
      await selectCategory("urdu");
      await startRange("#learn-mode-button", 1, 2);
      if (!document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0") {
        errors.push("Urdu Learn included Queue items from other categories.");
      }
      for (let index = 0; index < 2; index += 1) {
        document.querySelector("#action-button")?.click();
        await pause();
        if (dialog?.open) errors.push("A foreign Queue item interrupted Urdu Learn on answer reveal.");
        document.querySelector("#action-button")?.click();
        await pause();
        if (dialog?.open) errors.push("A foreign Queue item interrupted Urdu Learn after completion.");
      }
      if (!visible(document.querySelector("#results-screen"))
        || queue()?.items.find((item) => item.questionId === targetId)?.remaining !== 2) {
        errors.push("Urdu Learn did not preserve the Basic Computer Queue item.");
      }

      document.querySelector("#change-category-button")?.click();
      await pause();
      await selectCategory("basic-computer-studies");
      document.querySelector("#computer-source-initial-related")?.click();
      await pause();
      await startRange("#quiz-mode-button", 1, 2);
      if (document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "1"
        || JSON.parse(localStorage.getItem(sessionKey) || "null")?.computerSourceScope !== "initial-related") {
        errors.push("Basic Computer related-source Quiz hid a queued original-source MCQ from the same category.");
      }
      await answerMain();
      const active = queue()?.activeAttempt;
      const retryTexts = [...document.querySelectorAll("#retry-options-container .option-text")].map((element) => element.textContent);
      const retryLabels = [...document.querySelectorAll("#retry-options-container .option-label")].map((element) => element.textContent);
      const retryQuestionText = document.querySelector("#retry-question-text");
      const retryOptions = document.querySelector("#retry-options-container");
      if (!dialog?.open || active?.context !== "embedded" || active?.kind !== "queue"
        || active.questionId !== targetId
        || JSON.stringify(active.optionOrder) !== JSON.stringify([0, 1, 2, 3])
        || JSON.stringify(retryTexts) !== JSON.stringify(displayOptions(target))) {
        errors.push("Same-category Basic Computer Queue did not interrupt Quiz with canonical A-D options.");
      }
      if (dialog?.classList.contains("is-urdu") || retryQuestionText?.textContent !== target.question
        || retryQuestionText?.classList.contains("is-urdu") || retryQuestionText?.hasAttribute("lang") || retryQuestionText?.hasAttribute("dir")
        || retryOptions?.classList.contains("is-urdu") || retryOptions?.hasAttribute("lang") || retryOptions?.hasAttribute("dir")
        || JSON.stringify(retryLabels) !== JSON.stringify(["A", "B", "C", "D"])
        || !visible(document.querySelector("#retry-question-urdu-block"))
        || document.querySelector("#retry-question-text-urdu")?.textContent !== target.questionUrdu) {
        errors.push("Same-category non-Urdu Queue popup lost its canonical labels or secondary translation.");
      }
      if (document.querySelector("#retry-later-button")?.hidden) {
        errors.push("Same-category queued review did not offer Later.");
      }
      document.querySelector("#retry-later-button")?.click();
      await pause();
      if (dialog?.open || queue()?.items.find((item) => item.questionId === targetId)?.remaining !== 2
        || document.querySelector("#question-number-input")?.value !== "2") {
        errors.push("Later did not preserve the category Queue review and resume Quiz.");
      }
      await answerMain();
      if (dialog?.open || !visible(document.querySelector("#results-screen"))
        || queue()?.items.find((item) => item.questionId === targetId)?.remaining !== 2) {
        errors.push("Same-category Quiz did not finish while its postponed Queue item stayed saved.");
      }

      document.querySelector("#change-category-button")?.click();
      await pause();
      await selectCategory("basic-computer-studies");
      document.querySelector("#queue-mode-button")?.click();
      await pause();
      const firstDedicated = queue()?.activeAttempt;
      if (!visible(document.querySelector("#queue-screen")) || dialog?.open
        || firstDedicated?.context !== "dedicated"
        || data.questions.find((question) => String(question.id) === String(firstDedicated?.questionId || ""))?.categoryId !== "basic-computer-studies"
        || !queue()?.items.some((item) => item.questionId === targetId && item.remaining === 2)) {
        errors.push("Category Queue did not open a saved Basic Computer MCQ in full-screen practice.");
      }
      document.querySelector("#queue-back-button")?.click();
      await pause();
      if (visible(document.querySelector("#mode-screen"))) {
        document.querySelector("#mode-back-button")?.click();
        await pause();
      }

      await selectCategory("job-related-finance-taxation");
      await startRange("#quiz-mode-button", 1, 2);
      const activeBeforeCorrupt = JSON.parse(localStorage.getItem(sessionKey) || "null");
      localStorage.setItem(retryKey, "{corrupt-json");
      return {
        errors,
        expected: {
          activeQuestionId: document.querySelector("#question-text")?.dataset.questionId || "",
          activeSnapshot: activeBeforeCorrupt
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for corrupt retry recovery."));
        }
      }, 50);
    })`);

    const retryCorruptRecoveryResult = await client.evaluate(`(() => {
      const errors = [];
      const expected = ${JSON.stringify(retryPositionResult.expected)};
      const active = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      if (localStorage.getItem("ppsc-prep:retry-queue:v1") !== null
        || visible(document.querySelector("#retry-queue-chip")) || document.querySelector("#retry-queue-count")?.textContent !== "0") {
        errors.push("Corrupt retry JSON was not removed and reset safely on reload.");
      }
      if (!active || JSON.stringify(active) !== JSON.stringify(expected.activeSnapshot)
        || !visible(document.querySelector("#continue-session-card"))) {
        errors.push("Corrupt retry recovery damaged the independent valid active session.");
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return { errors, queueCleared: true, activeSessionPreserved: true };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for saved foreign-category Queue testing."));
        }
      }, 50);
    })`);

    const foreignAttemptSeedResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const target = data.questions.find((question) => String(question.id) === "IBES-Q0017-SRC");
      const jobQuestion = data.questions.find((question) => question.categoryId === "job-related-finance-taxation");
      const base = ${JSON.stringify(retryQueueFeatureResult.seedQueue)};
      if (!target || !jobQuestion || !base?.bankSignature) {
        errors.push("Saved foreign-category Queue fixture lacks a valid bank question or signature.");
        return { errors };
      }
      document.querySelector('#category-grid .category-card[data-category="job-related-finance-taxation"]')?.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "2";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const session = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (session?.categoryId !== "job-related-finance-taxation" || session.mode !== "quiz") {
        errors.push("Saved foreign-category Queue fixture did not start the Job Quiz.");
      }
      const step = Number.isInteger(base.practiceStep) ? base.practiceStep : 0;
      const seed = {
        ...base,
        practiceStep: step,
        nextQuizReviewStep: step + 25,
        nextImportantReviewStep: step + 1000,
        nextSequentialReviewStep: step + 1000,
        nextSequence: 3,
        dedicatedDeck: [],
        dedicatedLastQuestionId: target.id,
        dedicatedRecentQuestionIds: [],
        items: [
          { questionId: target.id, remaining: 3, dueStep: step + 25, sequence: 1 },
          { questionId: jobQuestion.id, remaining: 4, dueStep: step + 25, sequence: 2 }
        ],
        activeAttempt: {
          questionId: target.id,
          optionOrder: [0, 1, 2, 3],
          selectedIndex: null,
          submitted: false,
          outcome: null,
          wrongIncrement: null,
          resumeAction: "next:1",
          context: "embedded",
          kind: "queue"
        }
      };
      sessionStorage.setItem("ppsc-smoke:foreign-queue-seed", JSON.stringify(seed));
      localStorage.setItem("ppsc-prep:retry-queue:v1", JSON.stringify(seed));
      return { errors, targetId: target.id, jobId: jobQuestion.id };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for unchecked foreign-category Queue verification."));
        }
      }, 50);
    })`);

    const foreignUncheckedAttemptResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignAttemptSeedResult.errors)}.slice();
      const seed = JSON.parse(sessionStorage.getItem("ppsc-smoke:foreign-queue-seed") || "null");
      const retryKey = "ppsc-prep:retry-queue:v1";
      const before = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (before?.activeAttempt?.questionId !== seed?.activeAttempt?.questionId
        || before?.activeAttempt?.submitted !== false) {
        errors.push("Unchecked foreign-category Queue attempt was rejected before Continue.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const after = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (document.querySelector("#retry-dialog")?.open || after?.activeAttempt !== null
        || JSON.stringify(after?.items) !== JSON.stringify(seed?.items)
        || document.querySelector("#retry-queue-count")?.textContent !== "1"
        || document.querySelector("#global-retry-queue-button")) {
        errors.push("Unchecked foreign-category Queue popup interrupted Job Quiz or changed saved counts.");
      }
      const target = window.PPSC_QUIZ_DATA.questions.find((question) => String(question.id) === seed?.activeAttempt?.questionId);
      if (!target) {
        errors.push("Submitted foreign-category Queue fixture lost its source question.");
      } else {
        seed.activeAttempt.selectedIndex = (target.correctOptionIndex + 1) % 4;
        seed.activeAttempt.submitted = true;
        seed.activeAttempt.outcome = "wrong";
        seed.activeAttempt.wrongIncrement = 2;
        localStorage.setItem(retryKey, JSON.stringify(seed));
      }
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for checked foreign-category Queue verification."));
        }
      }, 50);
    })`);

    const foreignSubmittedAttemptResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignUncheckedAttemptResult.errors)}.slice();
      const seed = JSON.parse(sessionStorage.getItem("ppsc-smoke:foreign-queue-seed") || "null");
      const retryKey = "ppsc-prep:retry-queue:v1";
      const before = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (before?.activeAttempt?.submitted !== true || before.activeAttempt.outcome !== "wrong") {
        errors.push("Checked foreign-category Queue attempt was rejected before Continue.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const after = JSON.parse(localStorage.getItem(retryKey) || "null");
      const targetItem = after?.items.find((item) => item.questionId === seed?.activeAttempt?.questionId);
      const jobItem = after?.items.find((item) => item.questionId === seed?.items[1]?.questionId);
      if (document.querySelector("#retry-dialog")?.open || after?.activeAttempt !== null
        || targetItem?.remaining !== 5 || jobItem?.remaining !== 4) {
        errors.push("Checked foreign-category Queue answer was not applied exactly once without interrupting Job Quiz.");
      }
      return { errors, targetId: seed?.activeAttempt?.questionId, jobId: seed?.items[1]?.questionId };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for foreign-category Queue idempotence verification."));
        }
      }, 50);
    })`);

    const foreignAttemptIdempotenceResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignSubmittedAttemptResult.errors)}.slice();
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const after = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (document.querySelector("#retry-dialog")?.open || after?.activeAttempt !== null
        || after?.items.find((item) => item.questionId === ${JSON.stringify(foreignSubmittedAttemptResult.targetId)})?.remaining !== 5
        || after?.items.find((item) => item.questionId === ${JSON.stringify(foreignSubmittedAttemptResult.jobId)})?.remaining !== 4) {
        errors.push("Checked foreign-category Queue answer was applied again after a second reload.");
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset before Custom Paper retry isolation."));
        }
      }, 50);
    })`);

    await client.evaluate(`(() => {
      localStorage.setItem("ppsc-prep:difficult-question-ids:v1", JSON.stringify({
        version: 1,
        questionIds: ${JSON.stringify(computerSourceFixture.scopes.all.difficultIds)}
      }));
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not load the Basic Computer source fixtures."));
        }
      }, 50);
    })`);

    const computerSourceFlowResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const expected = ${JSON.stringify(computerSourceFixture.scopes)};
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const definitions = [
        ["all", "All Basic Computer", 2564, 463],
        ["initial-original", "Initial PDF — Original MCQs", 1088, 399],
        ["initial-related", "Initial PDF — Related Practice", 1088, 20],
        ["other", "Other Papers", 388, 44]
      ];
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const answerText = (question) => optionText(question.options[question.correctOptionIndex]);
      const normalize = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/\\s+/g, " ").trim();
      const quickRows = () => [...document.querySelectorAll("#quick-notes-list .quick-note-row[data-question-id]")];
      const storageSnapshot = () => JSON.stringify(
        Array.from({ length: localStorage.length }, (_, index) => {
          const key = localStorage.key(index);
          return [key, localStorage.getItem(key)];
        }).sort((left, right) => left[0].localeCompare(right[0]))
      );
      const setRange = (start, end) => {
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput) return false;
        startInput.value = String(start);
        endInput.value = String(end);
        startInput.dispatchEvent(new Event("input", { bubbles: true }));
        endInput.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      };
      const startRange = async (buttonSelector, start, end) => {
        document.querySelector(buttonSelector)?.click();
        await pause();
        const endInput = document.querySelector("#question-range-end-input");
        if (!visible(document.querySelector("#question-range-options")) || !endInput) return false;
        setRange(start, end == null ? Number(endInput.max) : end);
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
        return visible(document.querySelector("#quiz-screen"));
      };
      const openScope = async (scope) => {
        const card = document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]');
        card?.click();
        await pause();
        const radio = document.querySelector('input[name="computer-source"][value="' + scope + '"]');
        if (radio && !radio.checked) {
          radio.click();
          await pause();
        }
        return radio;
      };
      const backFromQuestion = async () => {
        document.querySelector("#back-button")?.click();
        await pause();
      };
      const loadAllNotes = async () => {
        const button = document.querySelector("#quick-notes-load-more-button");
        let guard = 0;
        while (button && visible(button) && guard < 40) {
          button.click();
          await pause();
          guard += 1;
        }
      };

      for (const [scope, label, total, importantCount] of definitions) {
        const scopeFixture = expected[scope];
        const expectedQuestions = scopeFixture.ids.map((id) => questionById.get(id)).filter(Boolean);
        const radio = await openScope(scope);
        if (!radio?.checked || !document.querySelector("#mode-category")?.textContent.includes(label)
          || !document.querySelector("#study-scope-summary")?.textContent.includes(String(total))
          || !document.querySelector("#important-count")?.textContent.startsWith(String(importantCount))) {
          errors.push("Basic Computer " + scope + " did not apply its label, total, and Important count.");
        }

        const storageBeforeNotes = storageSnapshot();
        document.querySelector("#study-notes-mode-button")?.click();
        await pause();
        if (!visible(document.querySelector("#quick-notes-screen"))
          || document.querySelector("#quick-notes-count")?.textContent.trim() !== String(total)
          || !document.querySelector("#quick-notes-category")?.textContent.includes(label)) {
          errors.push("Basic Computer " + scope + " Quick Notes did not retain its source/count label.");
        }
        await loadAllNotes();
        const renderedIds = quickRows().map((row) => row.dataset.questionId);
        if (JSON.stringify(renderedIds) !== JSON.stringify(scopeFixture.ids)
          || quickRows().some((row, index) => row.dataset.questionNumber !== String(index + 1))) {
          errors.push("Basic Computer " + scope + " Quick Notes changed IDs, order, count, or source-relative numbering.");
        }
        if (quickRows().length && (
          quickRows()[0].querySelector(".quick-note-full-question")?.textContent.trim() !== String(expectedQuestions[0].question).trim()
          || quickRows()[0].querySelector(".quick-note-answer-text")?.textContent.trim() !== answerText(expectedQuestions[0])
        )) {
          errors.push("Basic Computer " + scope + " Quick Notes changed the canonical question/answer mapping.");
        }

        const uniqueSearchTarget = [...expectedQuestions]
          .sort((left, right) => String(right.question).length - String(left.question).length)
          .find((question) => {
            const query = normalize(question.question);
            return query && expectedQuestions.filter((candidate) => (
              normalize(candidate.question).includes(query) || normalize(answerText(candidate)).includes(query)
            )).length === 1;
          });
        const search = document.querySelector("#quick-notes-search");
        const clear = document.querySelector("#quick-notes-clear-button");
        if (!uniqueSearchTarget || !search || !clear) {
          errors.push("Basic Computer " + scope + " Quick Notes search fixture was unavailable.");
        } else {
          search.value = uniqueSearchTarget.question;
          search.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          if (JSON.stringify(quickRows().map((row) => row.dataset.questionId)) !== JSON.stringify([uniqueSearchTarget.id])) {
            errors.push("Basic Computer " + scope + " Quick Notes search escaped its selected source or returned the wrong ID.");
          }
          clear.click();
          await pause();
        }

        const importantOnly = document.querySelector("#quick-notes-important-only");
        importantOnly?.click();
        await pause();
        await loadAllNotes();
        if (JSON.stringify(quickRows().map((row) => row.dataset.questionId)) !== JSON.stringify(scopeFixture.importantIds)
          || quickRows().some((row) => !row.querySelector(".quick-note-important"))) {
          errors.push("Basic Computer " + scope + " Important Quick Notes changed the filtered IDs/order.");
        }
        clear?.click();
        await pause();
        document.querySelector("#quick-notes-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#mode-screen")) || !radio.checked) {
          errors.push("Basic Computer " + scope + " Quick Notes Back lost the selected source.");
        }
        const storageAfterNotes = storageSnapshot();
        if (storageAfterNotes !== storageBeforeNotes) {
          errors.push("Browsing Basic Computer " + scope + " Quick Notes changed localStorage.");
        }

        await startRange("#learn-mode-button", 2, 4);
        const learnSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        const expectedRangeIds = scopeFixture.ids.slice(1, 4);
        if (!learnSnapshot || learnSnapshot.version !== 8 || learnSnapshot.computerSourceScope !== scope
          || learnSnapshot.mode !== "learn" || learnSnapshot.rangePoolSize !== total
          || JSON.stringify(learnSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(scopeFixture.ids)
          || JSON.stringify(learnSnapshot.rangeQuestionIds || []) !== JSON.stringify(expectedRangeIds)
          || JSON.stringify(learnSnapshot.questionIds || []) !== JSON.stringify(expectedRangeIds)
          || document.querySelector("#question-text")?.dataset.questionId !== expectedRangeIds[0]) {
          errors.push("Basic Computer " + scope + " Learn range did not preserve the filtered source pool/order.");
        }
        await backFromQuestion();

        await openScope(scope);
        await startRange("#quiz-mode-button", 2, 4);
        let quizSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        if (!quizSnapshot || quizSnapshot.version !== 8 || quizSnapshot.computerSourceScope !== scope
          || quizSnapshot.mode !== "quiz" || quizSnapshot.rangePoolSize !== total
          || JSON.stringify(quizSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(scopeFixture.ids)
          || JSON.stringify(quizSnapshot.questionIds || []) !== JSON.stringify(expectedRangeIds)) {
          errors.push("Basic Computer " + scope + " Quiz range did not preserve the filtered source pool/order.");
        }
        const quizQuestion = questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
        const renderedOptions = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
        const correctRenderedIndex = quizQuestion ? renderedOptions.indexOf(answerText(quizQuestion)) : -1;
        document.querySelector('[data-option-index="' + correctRenderedIndex + '"]')?.click();
        document.querySelector("#action-button")?.click();
        await pause();
        quizSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        if (correctRenderedIndex < 0 || document.querySelector("#score-text")?.textContent !== "Score: 1"
          || document.querySelector("#feedback-title")?.textContent !== "Correct!"
          || quizSnapshot?.score !== 1 || !quizSnapshot?.answerHistory?.[0]?.[1]) {
          errors.push("Basic Computer " + scope + " Quiz changed answer-option mapping or scoring.");
        }
        await backFromQuestion();

        await openScope(scope);
        const importantCheckbox = document.querySelector("#important-only-checkbox");
        if (importantCheckbox && !importantCheckbox.checked) importantCheckbox.click();
        await pause();
        const importantEnd = Math.min(3, scopeFixture.importantIds.length);
        await startRange("#learn-mode-button", 1, importantEnd);
        const importantSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        if (!importantSnapshot || importantSnapshot.computerSourceScope !== scope || importantSnapshot.importantOnly !== true
          || importantSnapshot.rangePoolSize !== scopeFixture.importantIds.length
          || JSON.stringify(importantSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(scopeFixture.importantIds)
          || JSON.stringify(importantSnapshot.questionIds || []) !== JSON.stringify(scopeFixture.importantIds.slice(0, importantEnd))) {
          errors.push("Basic Computer " + scope + " Important Learn range escaped its selected source/order.");
        }
        await backFromQuestion();

        await openScope(scope);
        document.querySelector("#difficult-mode-button")?.click();
        await pause();
        if (document.querySelector("#difficult-count")?.textContent.trim() !== String(scopeFixture.difficultIds.length)
          || document.querySelector("#difficult-quiz-button")?.disabled) {
          errors.push("Basic Computer " + scope + " Difficult count did not use the selected source.");
        }
        await startRange("#difficult-quiz-button", 1, scopeFixture.difficultIds.length);
        const difficultSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        if (!difficultSnapshot || difficultSnapshot.computerSourceScope !== scope || difficultSnapshot.scope !== "difficult"
          || JSON.stringify(difficultSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(scopeFixture.difficultIds)
          || JSON.stringify(difficultSnapshot.questionIds || []) !== JSON.stringify(scopeFixture.difficultIds)) {
          errors.push("Basic Computer " + scope + " Difficult Quiz range escaped its selected source/order.");
        }
        await backFromQuestion();
      }

      await openScope("initial-related");
      await startRange("#quiz-mode-button", 5, 7);
      const resumeQuestion = questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
      const resumeOptions = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const resumeCorrectIndex = resumeQuestion ? resumeOptions.indexOf(answerText(resumeQuestion)) : -1;
      document.querySelector('[data-option-index="' + resumeCorrectIndex + '"]')?.click();
      document.querySelector("#action-button")?.click();
      await pause();
      const resumeSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!resumeSnapshot || resumeSnapshot.version !== 8 || resumeSnapshot.computerSourceScope !== "initial-related"
        || resumeSnapshot.rangeStart !== 5 || resumeSnapshot.rangeEnd !== 7 || resumeSnapshot.score !== 1) {
        errors.push("Basic Computer source persistence fixture was not saved as v8 initial-related.");
      }
      return {
        errors,
        resumeSnapshot,
        resumeQuestionId: resumeQuestion?.id || "",
        resumeOptionTexts: resumeOptions,
        resumeCorrectIndex,
        counts: Object.fromEntries(definitions.map(([scope, label, total, important]) => [scope, { label, total, important }]))
      };
    })()`);

    const reloadForComputerSource = async (context) => {
      await client.send("Page.reload", { ignoreCache: true });
      await client.evaluate(`new Promise((resolve, reject) => {
        const deadline = Date.now() + 10000;
        const timer = setInterval(() => {
          if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
            clearInterval(timer);
            resolve(true);
          } else if (Date.now() >= deadline) {
            clearInterval(timer);
            reject(new Error(${JSON.stringify("Basic Computer source reload timed out: ")} + ${JSON.stringify(context)}));
          }
        }, 50);
      })`);
    };

    await reloadForComputerSource("v8 source persistence");
    const computerSourceResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(computerSourceFlowResult)};
      const storageKey = "ppsc-prep:active-session:v1";
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      const meta = document.querySelector("#continue-session-meta")?.textContent || "";
      if (!visible(document.querySelector("#continue-session-card"))
        || !meta.includes("Initial PDF — Related Practice") || !meta.includes("Questions 5–7 of 1088")) {
        errors.push("v8 Continue did not label the persisted Basic Computer source/range.");
      }
      if (!stored || stored.version !== 8 || stored.computerSourceScope !== "initial-related"
        || JSON.stringify(stored) !== JSON.stringify(expected.resumeSnapshot)) {
        errors.push("Reload changed the v8 Basic Computer source snapshot before Continue.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const restored = JSON.parse(localStorage.getItem(storageKey) || "null");
      const renderedOptions = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      if (!visible(document.querySelector("#quiz-screen")) || restored?.computerSourceScope !== "initial-related"
        || document.querySelector("#question-text")?.dataset.questionId !== expected.resumeQuestionId
        || JSON.stringify(renderedOptions) !== JSON.stringify(expected.resumeOptionTexts)
        || document.querySelector("#score-text")?.textContent !== "Score: 1"
        || !document.querySelector('[data-option-index="' + expected.resumeCorrectIndex + '"]')?.classList.contains("is-correct")) {
        errors.push("Continue did not restore the exact v8 Basic Computer source/question/options/score.");
      }

      document.querySelector("#back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      await pause();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "2";
      document.querySelector("#question-range-end-input").value = "4";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const currentV8 = JSON.parse(localStorage.getItem(storageKey) || "null");
      const legacyV7 = currentV8 ? JSON.parse(JSON.stringify(currentV8)) : null;
      if (!legacyV7 || legacyV7.computerSourceScope !== "all") {
        errors.push("Could not construct an all-source v7 migration fixture.");
      } else {
        legacyV7.version = 7;
        delete legacyV7.computerSourceScope;
        localStorage.setItem(storageKey, JSON.stringify(legacyV7));
      }
      return { errors, expectedV8: currentV8 };
    })()`);

    await reloadForComputerSource("v7 migration");
    const computerSourceV7MigrationResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(computerSourceResumeResult.expectedV8)};
      const storageKey = "ppsc-prep:active-session:v1";
      const before = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!before || before.version !== 7 || Object.prototype.hasOwnProperty.call(before, "computerSourceScope")
        || !visible(document.querySelector("#continue-session-card"))
        || !document.querySelector("#continue-session-meta")?.textContent.includes("All Basic Computer")) {
        errors.push("Valid v7 Basic Computer session was not offered as All source before migration.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const migrated = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!visible(document.querySelector("#quiz-screen")) || !migrated || migrated.version !== 8
        || migrated.computerSourceScope !== "all"
        || migrated.rangeStart !== expected.rangeStart || migrated.rangeEnd !== expected.rangeEnd
        || JSON.stringify(migrated.rangePoolQuestionIds || []) !== JSON.stringify(expected.rangePoolQuestionIds || [])
        || JSON.stringify(migrated.questionIds || []) !== JSON.stringify(expected.questionIds || [])) {
        errors.push("v7 Continue did not migrate to v8 All source while retaining range metadata/order.");
      }

      document.querySelector("#back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      await pause();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const fullV8 = JSON.parse(localStorage.getItem(storageKey) || "null");
      const legacyV6 = fullV8 ? JSON.parse(JSON.stringify(fullV8)) : null;
      if (!legacyV6 || legacyV6.computerSourceScope !== "all" || legacyV6.questionIds.length !== 2564) {
        errors.push("Could not construct a full Basic Computer v6 migration fixture.");
      } else {
        legacyV6.version = 6;
        delete legacyV6.computerSourceScope;
        delete legacyV6.rangeStart;
        delete legacyV6.rangeEnd;
        delete legacyV6.rangePoolSize;
        delete legacyV6.rangePoolQuestionIds;
        delete legacyV6.rangeQuestionIds;
        localStorage.setItem(storageKey, JSON.stringify(legacyV6));
      }
      return { errors, expectedFullV8: fullV8 };
    })()`);

    await reloadForComputerSource("v6 migration");
    const computerSourceV6MigrationResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const storageKey = "ppsc-prep:active-session:v1";
      const before = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!before || before.version !== 6 || Object.prototype.hasOwnProperty.call(before, "computerSourceScope")
        || !visible(document.querySelector("#continue-session-card"))) {
        errors.push("Valid full Basic Computer v6 session was not offered for migration.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const migrated = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!visible(document.querySelector("#quiz-screen")) || !migrated || migrated.version !== 8
        || migrated.computerSourceScope !== "all" || migrated.rangeStart !== 1 || migrated.rangeEnd !== 2564
        || migrated.rangePoolSize !== 2564 || migrated.rangePoolQuestionIds?.length !== 2564
        || migrated.rangeQuestionIds?.length !== 2564 || migrated.questionIds?.length !== 2564) {
        errors.push("v6 Continue did not migrate to the complete v8 All Basic Computer range.");
      }
      const invalidFixture = ${JSON.stringify(computerSourceFlowResult.resumeSnapshot)};
      if (!invalidFixture) {
        errors.push("Invalid source-scope fixture was unavailable.");
      } else {
        invalidFixture.computerSourceScope = "invalid-source";
        localStorage.setItem(storageKey, JSON.stringify(invalidFixture));
      }
      return { errors };
    })()`);

    await reloadForComputerSource("invalid source rejection");
    const computerSourceInvalidResult = await client.evaluate(`(() => {
      const errors = [];
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      if (localStorage.getItem(storageKey) !== null || visible(document.querySelector("#continue-session-card"))) {
        errors.push("Invalid v8 computerSourceScope was not rejected and removed.");
      }
      const tampered = ${JSON.stringify(computerSourceFlowResult.resumeSnapshot)};
      if (!tampered) {
        errors.push("Legal-but-tampered source fixture was unavailable.");
      } else {
        tampered.computerSourceScope = "initial-original";
        localStorage.setItem(storageKey, JSON.stringify(tampered));
      }
      return { errors };
    })()`);

    await reloadForComputerSource("tampered source rejection");
    const computerSourceTamperResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      if (localStorage.getItem(sessionKey) !== null || visible(document.querySelector("#continue-session-card"))) {
        errors.push("Legal source value with a mismatched question pool was not rejected and removed.");
      }
      const fixture = ${JSON.stringify(computerSourceFixture.scopes)};
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      await pause();
      document.querySelector("#computer-source-initial-original")?.click();
      await pause();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "2";
      document.querySelector("#question-range-end-input").value = "3";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
      const retryIds = [
        fixture["initial-original"].ids[0],
        fixture["initial-related"].ids[0],
        fixture.other.ids[0]
      ];
      if (!session || session.version !== 8 || session.computerSourceScope !== "initial-original"
        || session.questionIds[0] === retryIds[0]) {
        errors.push("Could not construct an isolated Basic Computer retry-source session.");
      } else {
        localStorage.setItem(retryKey, JSON.stringify({
          version: 1,
          bankSignature: session.bankSignature,
          countBaselineVersion: 1,
          practiceStep: 0,
          nextSequence: 4,
          items: retryIds.map((questionId, index) => ({
            questionId,
            remaining: 1,
            dueStep: 0,
            sequence: index + 1
          })),
          activeAttempt: null
        }));
      }
      return { errors, retryIds, session };
    })()`);

    await reloadForComputerSource("global retry continuation across computer sources");
    const computerSourceRetryResult = false
      ? await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(computerSourceTamperResult)};
      const data = window.PPSC_QUIZ_DATA;
      const retryKey = "ppsc-prep:retry-queue:v1";
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const answerMainCorrect = async () => {
        const question = questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
        const rendered = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
        const correctText = question ? optionText(question.options[question.correctOptionIndex]) : "";
        const correctIndex = rendered.indexOf(correctText);
        document.querySelector('[data-option-index="' + correctIndex + '"]')?.click();
        document.querySelector("#action-button")?.click();
        await pause();
        document.querySelector("#action-button")?.click();
        await pause();
        return correctIndex;
      };
      const solveCurrentRetry = async () => {
        const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
        const attempt = queue?.activeAttempt;
        const question = attempt ? questionById.get(attempt.questionId) : null;
        const correctIndex = attempt && question ? attempt.optionOrder.indexOf(question.correctOptionIndex) : -1;
        document.querySelector('[data-review-option-index="' + correctIndex + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        return attempt?.questionId || "";
      };

      const before = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!visible(document.querySelector("#continue-session-card")) || before?.computerSourceScope !== "initial-original"
        || !document.querySelector("#continue-session-meta")?.textContent.includes("Initial PDF — Original MCQs")) {
        errors.push("Source-scoped retry fixture did not restore its Initial Original Continue card.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      await answerMainCorrect();
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!document.querySelector("#retry-dialog")?.open || queue?.activeAttempt?.questionId !== expected.retryIds[0]
        || document.querySelector("#retry-queue-count")?.textContent !== "3"
        || !document.querySelector("#retry-question-kind")?.textContent.includes("INITIAL PDF — ORIGINAL MCQS")) {
        errors.push("Initial Original Quiz did not show the first item from its full global queue.");
      }
      await solveCurrentRetry();
      await answerMainCorrect();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const remainingAfterOriginal = (queue?.items || []).map((item) => item.questionId);
      if (!visible(document.querySelector("#results-screen"))
        || JSON.stringify(remainingAfterOriginal) !== JSON.stringify(expected.retryIds.slice(1))) {
        errors.push("Initial Original Results did not open with other-source reviews still saved.");
      }

      document.querySelector("#change-category-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]')?.click();
      await pause();
      document.querySelector("#computer-source-initial-original")?.click();
      await pause();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "2";
      document.querySelector("#question-range-end-input").value = "4";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      if (document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "2") {
        errors.push("A source-filtered Quiz did not show reviews queued by other Basic Computer sources.");
      }
      const crossSourceReviewIds = [];
      await answerMainCorrect();
      if (document.querySelector("#retry-dialog")?.open) {
        crossSourceReviewIds.push(await solveCurrentRetry());
      }
      await answerMainCorrect();
      if (document.querySelector("#retry-dialog")?.open) {
        crossSourceReviewIds.push(await solveCurrentRetry());
      }
      await answerMainCorrect();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (JSON.stringify(crossSourceReviewIds) !== JSON.stringify(expected.retryIds.slice(1))
        || !visible(document.querySelector("#results-screen")) || queue?.items?.length !== 0) {
        errors.push("Initial Original Quiz did not continue other-source reviews in global FIFO order.");
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return {
        errors,
        firstReviewId: expected.retryIds[0],
        crossSourceReviewIds,
        resultsOpenedWithPending: remainingAfterOriginal.length === 2
      };
      })()`)
      : { errors: [] };

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return true;
    })()`);

    await reloadForComputerSource("cleanup before legacy smoke flows");
    await client.send("Page.navigate", { url: pageUrl });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 30000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && window.PPSC_GK_STUDY_NOTES_DATA && document.readyState === "complete") {
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

    const normalResult = await client.evaluate(`(async () => {
      const rawPause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const resolveRetryIfOpen = async () => {
        const dialog = document.querySelector("#retry-dialog");
        let safety = 0;
        while (dialog && dialog.open && safety < 32) {
          safety += 1;
          const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
          const attempt = queue && queue.activeAttempt;
          const question = attempt && window.PPSC_QUIZ_DATA.questions.find((item) => String(item.id) === String(attempt.questionId));
          const action = document.querySelector("#retry-action-button");
          if (!attempt || !question || !action) break;
          if (!attempt.submitted) {
            const correctIndex = attempt.optionOrder.indexOf(question.correctOptionIndex);
            const option = document.querySelector('[data-review-option-index="' + correctIndex + '"]');
            if (!option) break;
            option.click();
            action.click();
            await rawPause();
          }
          action.click();
          await rawPause();
        }
      };
      const pause = async () => {
        await rawPause();
        await resolveRetryIfOpen();
      };
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const setRangeValues = (start, end) => {
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput) return false;
        startInput.value = start == null ? "" : String(start);
        endInput.value = end == null ? "" : String(end);
        startInput.dispatchEvent(new Event("input", { bubbles: true }));
        endInput.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      };
      const submitRange = async () => {
        const form = document.querySelector("#question-range-form");
        if (form) form.requestSubmit();
        await pause();
      };
      const startModeWithRange = async (buttonSelector, start, end) => {
        const button = document.querySelector(buttonSelector);
        if (!button) {
          errors.push("Missing range-launching mode button " + buttonSelector + ".");
          return false;
        }
        button.click();
        await pause();
        const panel = document.querySelector("#question-range-options");
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!visible(panel) || !startInput || !endInput) {
          errors.push(buttonSelector + " did not open the question-range panel.");
          return false;
        }
        const chosenStart = start == null ? Number(startInput.min || 1) : start;
        const chosenEnd = end == null ? Number(endInput.max) : end;
        setRangeValues(chosenStart, chosenEnd);
        await submitRange();
        return visible(document.querySelector("#quiz-screen"));
      };
      const data = window.PPSC_QUIZ_DATA;
      if (!data || data.categories.length !== 11) errors.push("Expected 11 categories.");
      if (!data || data.questions.length !== 11892) errors.push("Expected the current 11,892-question release bank.");
      if (!data || data.version !== 5) errors.push("Expected question-data schema version 5.");
      const importantQuestions = data ? data.questions.filter((question) => question.isImportant === true) : [];
      if (importantQuestions.length !== 1197) errors.push("Expected 1,197 evidence-based important questions.");
      if (importantQuestions.some((question) => !Number.isInteger(question.repeatCount) || question.repeatCount < 2)) errors.push("Important repeat metadata is invalid.");
      if (data && data.questions.some((question) => !/[\u0600-\u06ff]/u.test(String(question.questionUrdu || "")))) errors.push("A question is missing its Urdu translation.");
      const urduQuestions = data ? data.questions.filter((question) => question.categoryId === "urdu") : [];
      if (urduQuestions.length !== 882) errors.push("Expected 882 Urdu-category questions.");
      if (urduQuestions.some((question) => {
        const text = String(question.questionUrdu || "").trim();
        return !text || !/[\u0600-\u06ff]/u.test(text) || /[A-Za-z]/.test(text);
      })) {
        errors.push("An Urdu-category question is empty, lacks Urdu script, or still contains Latin letters.");
      }
      if (urduQuestions.some((question) => !Array.isArray(question.optionsUrdu) || question.optionsUrdu.length !== 4)) {
        errors.push("An Urdu-category question is missing four localized options.");
      }
      if (urduQuestions.some((question) => Array.isArray(question.optionsUrdu)
        && question.optionsUrdu.some((option) => !String(option || "").trim() || /[A-Za-z]/.test(option)))) {
        errors.push("An Urdu-category answer is empty or still contains Latin letters.");
      }
      if (urduQuestions.some((question) => Array.isArray(question.optionsUrdu)
        && new Set(question.optionsUrdu.map((option) => String(option || "").trim().normalize("NFKC").toLocaleLowerCase("ur"))).size !== 4)) {
        errors.push("An Urdu-category question has duplicate localized options.");
      }
      if (data && data.questions.some((question) => question.categoryId !== "urdu" && Object.prototype.hasOwnProperty.call(question, "optionsUrdu"))) {
        errors.push("A non-Urdu category question unexpectedly defines Urdu-only options.");
      }
      if (document.querySelectorAll("#category-grid .category-card").length !== 11) errors.push("Category cards did not render.");
      if (visible(document.querySelector("#continue-session-card"))) errors.push("A fresh profile incorrectly showed Continue.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Mobile layout has horizontal overflow.");
      if (data.questions.some((question) => !/^https?:\\/\\//.test(question.source.referenceUrl))) errors.push("A research URL is missing.");
      if (document.querySelector("#details-toggle, #details-panel, #explanation-text, #related-history, #option-rationales, #source-notes, #details-source")) errors.push("Removed answer-explanation UI is still present.");

      const storageSnapshot = () => JSON.stringify(
        Array.from({ length: localStorage.length }, (_, index) => {
          const key = localStorage.key(index);
          return [key, localStorage.getItem(key)];
        }).sort((left, right) => left[0].localeCompare(right[0]))
      );
      const storageBeforeNotes = storageSnapshot();
      const quickDisplayQuestion = (question) => question.categoryId === "urdu"
        ? String(question.questionUrdu || "").trim()
        : String(question.question || "").trim();
      const quickDisplayAnswer = (question) => {
        const options = question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
          ? question.optionsUrdu
          : question.options;
        const option = options[question.correctOptionIndex];
        return String(option && typeof option === "object" ? option.text : option).trim();
      };
      const quickNormalize = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/\\s+/g, " ").trim();
      const quickRows = () => [...document.querySelectorAll("#quick-notes-list .quick-note-row[data-question-id]")];
      const categoryCards = [...document.querySelectorAll("#category-grid .category-card[data-category]")];
      const detailedLearningData = window.PPSC_DETAILED_LEARNING_DATA;

      if (categoryCards.length !== data.categories.length || new Set(categoryCards.map((card) => card.dataset.category)).size !== data.categories.length) {
        errors.push("The homepage did not keep exactly one category card for each of the 11 categories.");
      }
      if (!detailedLearningData || !Array.isArray(detailedLearningData.categories)
        || detailedLearningData.categories.length !== data.categories.length) {
        errors.push("Detailed Learning data did not cover all 11 categories.");
      }
      if (document.querySelector("#gk-notes-entry-grid")) errors.push("A separate GK notes entry still appeared on the homepage.");
      if (visible(document.querySelector("#gk-study-notes-card"))) errors.push("Detailed GK Stories was visible outside General Knowledge Quick Notes.");
      if (document.querySelectorAll("#quick-notes-list .quick-note-row").length !== 0) errors.push("Quick Notes eagerly rendered rows before a category was opened.");
      if (document.querySelector("#detailed-learning-list")?.children.length) errors.push("Detailed Learning eagerly rendered topic panels before a category was opened.");

      for (const category of data.categories) {
        const categoryButtonForNotes = document.querySelector('#category-grid .category-card[data-category="' + category.id + '"]');
        const expectedQuestions = data.questions.filter((question) => question.categoryId === category.id);
        if (!categoryButtonForNotes) {
          errors.push("Quick Notes could not open missing category " + category.id + ".");
          continue;
        }

        categoryButtonForNotes.click();
        await pause();
        if (!visible(document.querySelector("#mode-screen"))) errors.push(category.name + " did not open its mode screen.");
        if (document.querySelectorAll("#standard-mode-options > .mode-option").length !== 6) errors.push(category.name + " did not show all six preparation modes.");
        const quickNotesButton = document.querySelector("#study-notes-mode-button");
        quickNotesButton?.click();
        await pause();

        const quickScreen = document.querySelector("#quick-notes-screen");
        const quickSearch = document.querySelector("#quick-notes-search");
        const quickClear = document.querySelector("#quick-notes-clear-button");
        const quickImportant = document.querySelector("#quick-notes-important-only");
        const quickLoadMore = document.querySelector("#quick-notes-load-more-button");
        const quickEmpty = document.querySelector("#quick-notes-empty");
        const quickStatus = document.querySelector("#quick-notes-results-status");
        const expectedFirstPageCount = Math.min(100, expectedQuestions.length);

        if (!visible(quickScreen) || visible(document.querySelector("#mode-screen"))) errors.push(category.name + " Quick Notes did not replace the mode screen.");
        const expectedQuickNotesCategoryLabel = category.name + (category.id === "basic-computer-studies" ? " · All Basic Computer" : "");
        if (document.querySelector("#quick-notes-category")?.textContent.trim() !== expectedQuickNotesCategoryLabel) errors.push(category.name + " Quick Notes showed the wrong category/source label.");
        if (document.querySelector("#quick-notes-count")?.textContent.trim() !== String(expectedQuestions.length)) errors.push(category.name + " Quick Notes showed the wrong total.");
        if (quickRows().length !== expectedFirstPageCount) errors.push(category.name + " Quick Notes did not render its first 100-row page.");
        if (!quickStatus?.textContent.includes(expectedFirstPageCount + " of " + expectedQuestions.length)) errors.push(category.name + " Quick Notes status showed the wrong first-page coverage.");
        if (document.documentElement.scrollWidth > window.innerWidth) errors.push(category.name + " Quick Notes has horizontal overflow at 430px.");
        if (visible(document.querySelector("#gk-study-notes-card")) !== (category.id === "general-knowledge")) errors.push("Detailed GK Stories visibility was wrong for " + category.name + ".");

        const firstPageRows = quickRows();
        const firstRowIdentity = firstPageRows[0] || null;
        if (expectedQuestions.length > 100) {
          if (!quickLoadMore || !visible(quickLoadMore)) {
            errors.push(category.name + " Quick Notes did not offer progressive loading.");
          } else {
            quickLoadMore.click();
            await pause();
            if (quickRows().length !== Math.min(200, expectedQuestions.length) || quickRows()[0] !== firstRowIdentity) {
              errors.push(category.name + " Quick Notes did not append the second 100 rows without replacing the first page.");
            }
          }
        }

        let loadGuard = 0;
        while (quickLoadMore && visible(quickLoadMore) && loadGuard < 40) {
          quickLoadMore.click();
          await pause();
          loadGuard += 1;
        }
        const allRows = quickRows();
        const allRenderedIds = allRows.map((row) => row.dataset.questionId);
        const expectedIds = expectedQuestions.map((question) => String(question.id));
        if (allRows.length !== expectedQuestions.length || new Set(allRenderedIds).size !== expectedQuestions.length) {
          errors.push(category.name + " Quick Notes lost or duplicated an MCQ row.");
        }
        if (JSON.stringify(allRenderedIds) !== JSON.stringify(expectedIds)) errors.push(category.name + " Quick Notes changed the canonical stable order.");
        allRows.forEach((row, index) => {
          const expectedQuestion = expectedQuestions[index];
          if (!expectedQuestion) return;
          const cue = row.querySelector(".quick-note-cue")?.textContent.trim() || "";
          const fullQuestion = row.querySelector(".quick-note-full-question")?.textContent.trim() || "";
          const answer = row.querySelector(".quick-note-answer-text")?.textContent.trim() || "";
          if (!cue || !row.querySelector(".quick-note-answer-label")) errors.push(category.name + " Quick Notes omitted a scan cue or answer label for " + expectedQuestion.id + ".");
          if (row.dataset.questionNumber !== String(index + 1)) errors.push(category.name + " Quick Notes showed the wrong stable question ordinal for " + expectedQuestion.id + ".");
          const expectedCuePrefix = category.id === "urdu"
            ? "سوال " + (index + 1) + " · فوری اشارہ · "
            : "Q" + (index + 1) + " · SCAN CUE · ";
          if (!cue.startsWith(expectedCuePrefix) || cue.length <= expectedCuePrefix.length) errors.push(category.name + " Quick Notes omitted its visible numbered recall cue for " + expectedQuestion.id + ".");
          if (fullQuestion !== quickDisplayQuestion(expectedQuestion)) errors.push(category.name + " Quick Notes changed the exact question for " + expectedQuestion.id + ".");
          if (answer !== quickDisplayAnswer(expectedQuestion)) errors.push(category.name + " Quick Notes showed the wrong answer for " + expectedQuestion.id + ".");
          if (category.id === "urdu") {
            if (row.lang !== "ur" || row.dir !== "rtl" || /[A-Za-z]/.test(fullQuestion) || /[A-Za-z]/.test(answer)) errors.push("An Urdu Quick Note did not keep its prompt and answer in Urdu RTL for " + expectedQuestion.id + ".");
          } else if (row.lang === "ur" || row.dir === "rtl") {
            errors.push(category.name + " Quick Notes retained Urdu language direction on a non-Urdu row.");
          }
        });

        const searchTarget = [...expectedQuestions].reverse().find((candidate) => {
          const candidateText = quickNormalize(quickDisplayQuestion(candidate));
          return candidateText && expectedQuestions.filter((item) => quickNormalize(quickDisplayQuestion(item)) === candidateText).length === 1;
        });
        if (!quickSearch || !quickClear || !searchTarget) {
          errors.push(category.name + " Quick Notes search controls or unique target were unavailable.");
        } else {
          quickSearch.value = quickDisplayQuestion(searchTarget);
          quickSearch.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          if (!quickRows().some((row) => row.dataset.questionId === String(searchTarget.id))) errors.push(category.name + " Quick Notes search did not find an item beyond the first page.");
          quickClear.click();
          await pause();
          if (quickSearch.value || quickRows().length !== expectedFirstPageCount) errors.push(category.name + " Quick Notes Clear did not restore its first page.");
        }

        const expectedImportant = expectedQuestions.filter((question) => question.isImportant === true);
        if (!quickImportant) {
          errors.push(category.name + " Quick Notes Important-only control was missing.");
        } else {
          quickImportant.click();
          await pause();
          let importantGuard = 0;
          while (quickLoadMore && visible(quickLoadMore) && importantGuard < 40) {
            quickLoadMore.click();
            await pause();
            importantGuard += 1;
          }
          const renderedImportantIds = quickRows().map((row) => row.dataset.questionId);
          if (JSON.stringify(renderedImportantIds) !== JSON.stringify(expectedImportant.map((question) => String(question.id)))) {
            errors.push(category.name + " Quick Notes Important-only filter did not preserve the complete filtered order.");
          }
          if (quickRows().some((row) => !row.querySelector(".quick-note-important"))) errors.push(category.name + " Quick Notes Important-only filter showed an unmarked row.");
          quickClear?.click();
          await pause();
          if (quickImportant.checked || quickRows().length !== expectedFirstPageCount) errors.push(category.name + " Quick Notes Clear did not reset Important-only.");
        }

        if (quickSearch && quickClear) {
          quickSearch.value = "zzzz-no-such-quick-note-11412";
          quickSearch.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          if (quickRows().length !== 0 || !visible(quickEmpty) || !quickStatus?.textContent.includes("0")) errors.push(category.name + " Quick Notes did not show its empty state.");
          quickClear.click();
          await pause();
          if (visible(quickEmpty) || quickRows().length !== expectedFirstPageCount) errors.push(category.name + " Quick Notes did not recover after an empty search.");
        }

        document.querySelector("#quick-notes-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#mode-screen")) || document.activeElement !== quickNotesButton) errors.push(category.name + " Quick Notes Back did not restore its Study Notes launcher and focus.");

        const detailedLearningButton = document.querySelector("#detailed-learning-mode-button");
        detailedLearningButton?.click();
        await pause();
        const detailedLearningScreen = document.querySelector("#detailed-learning-screen");
        const detailedLearningSearch = document.querySelector("#detailed-learning-search");
        const detailedLearningClear = document.querySelector("#detailed-learning-clear-button");
        const detailedLearningFilters = document.querySelector("#detailed-learning-topic-filters");
        const detailedLearningList = document.querySelector("#detailed-learning-list");
        const detailedLearningEmpty = document.querySelector("#detailed-learning-empty");
        const detailedLearningStatus = document.querySelector("#detailed-learning-results-status");
        const visibleDetailedPanels = () => detailedLearningList
          ? [...detailedLearningList.children].filter(visible)
          : [];

        if (!detailedLearningButton) {
          errors.push(category.name + " Detailed Learning launcher was missing.");
        } else if (!visible(detailedLearningScreen) || visible(document.querySelector("#mode-screen"))) {
          errors.push(category.name + " Detailed Learning did not replace the mode screen.");
        } else {
          if (!document.querySelector("#detailed-learning-category")?.textContent.includes(category.name)) {
            errors.push(category.name + " Detailed Learning showed the wrong category identity.");
          }
          const initialDetailedPanels = visibleDetailedPanels();
          const topicButtons = detailedLearningFilters
            ? [...detailedLearningFilters.querySelectorAll("button")]
            : [];
          if (!initialDetailedPanels.length || !detailedLearningList) {
            errors.push(category.name + " Detailed Learning did not render any topic panels.");
          }
          if (topicButtons.length < 2 || topicButtons.filter((button) => button.getAttribute("aria-pressed") === "true").length !== 1) {
            errors.push(category.name + " Detailed Learning topic filters were incomplete or lacked one active filter.");
          }
          if (!detailedLearningStatus?.textContent.trim()) {
            errors.push(category.name + " Detailed Learning did not announce its result coverage.");
          }
          if (document.documentElement.scrollWidth > window.innerWidth) {
            errors.push(category.name + " Detailed Learning has horizontal overflow at 430px.");
          }
          if (category.id === "urdu") {
            const urduSurface = [...detailedLearningScreen.querySelectorAll('[lang="ur"], [dir="rtl"]')].find(visible);
            if (!urduSurface || urduSurface.lang !== "ur" || urduSurface.dir !== "rtl") {
              errors.push("Urdu Detailed Learning did not render a visible Urdu RTL surface.");
            }
          }

          const allTopicButton = topicButtons[0];
          const specificTopicButton = topicButtons.find((button) => button !== allTopicButton);
          if (allTopicButton && specificTopicButton && initialDetailedPanels.length) {
            specificTopicButton.click();
            await pause();
            const filteredDetailedPanels = visibleDetailedPanels();
            if (specificTopicButton.getAttribute("aria-pressed") !== "true"
              || !filteredDetailedPanels.length
              || filteredDetailedPanels.length > initialDetailedPanels.length) {
              errors.push(category.name + " Detailed Learning topic filter did not show its matching list.");
            }
            allTopicButton.click();
            await pause();
            if (allTopicButton.getAttribute("aria-pressed") !== "true"
              || visibleDetailedPanels().length !== initialDetailedPanels.length) {
              errors.push(category.name + " Detailed Learning All filter did not restore every topic panel.");
            }
          }

          if (!detailedLearningSearch || !detailedLearningClear) {
            errors.push(category.name + " Detailed Learning search controls were missing.");
          } else {
            const detailedCategoryData = window.PPSC_DETAILED_LEARNING_DATA?.categories
              ?.find((entry) => entry.id === category.id);
            const searchProbe = String(detailedCategoryData?.topics?.[0]?.rows?.[0]?.[0] || "").trim();
            if (!searchProbe) {
              errors.push(category.name + " Detailed Learning had no searchable reference row.");
            } else {
              detailedLearningSearch.value = searchProbe;
              detailedLearningSearch.dispatchEvent(new Event("input", { bubbles: true }));
              await pause();
              if (!visibleDetailedPanels().length || detailedLearningStatus?.textContent.includes("0 results")) {
                errors.push(category.name + " Detailed Learning search did not find a known reference row.");
              }
              detailedLearningClear.click();
              await pause();
            }
            detailedLearningSearch.value = "zzzz-no-such-detailed-learning-entry-11412";
            detailedLearningSearch.dispatchEvent(new Event("input", { bubbles: true }));
            await pause();
            if (visibleDetailedPanels().length !== 0 || !visible(detailedLearningEmpty)
              || !detailedLearningStatus?.textContent.includes("0")) {
              errors.push(category.name + " Detailed Learning search did not show its no-results state.");
            }
            detailedLearningClear.click();
            await pause();
            if (detailedLearningSearch.value || visible(detailedLearningEmpty)
              || visibleDetailedPanels().length !== initialDetailedPanels.length) {
              errors.push(category.name + " Detailed Learning Clear did not restore every topic panel.");
            }
          }
        }

        document.querySelector("#detailed-learning-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#mode-screen")) || visible(detailedLearningScreen)
          || (detailedLearningButton && document.activeElement !== detailedLearningButton)) {
          errors.push(category.name + " Detailed Learning Back did not restore its launcher and focus.");
        }
        document.querySelector("#mode-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#category-screen"))) errors.push(category.name + " reading modes did not return to categories.");
        if (storageSnapshot() !== storageBeforeNotes) errors.push("Browsing " + category.name + " reading modes changed localStorage.");
      }

      const notesData = window.PPSC_GK_STUDY_NOTES_DATA;
      const notesEntry = document.querySelector("#gk-study-notes-card");
      if (!notesData || notesData.schemaVersion !== 1 || !Array.isArray(notesData.notes) || notesData.notes.length !== 776) {
        errors.push("Expected the schema-v1 776-card GK Study Notes dataset.");
      }
      if (!Array.isArray(window.PPSC_GK_STUDY_NOTES) || window.PPSC_GK_STUDY_NOTES !== notesData.notes) {
        errors.push("GK Study Notes convenience global did not expose the notes array.");
      }
      if (!notesEntry || !notesEntry.closest("#quick-notes-screen") || visible(notesEntry)) errors.push("Detailed GK Stories was not confined to the hidden Quick Notes screen on the homepage.");
      if (document.querySelectorAll("#category-grid .category-card").length !== 11) errors.push("GK Study Notes changed the 11 subject categories.");
        if (document.querySelectorAll("#gk-notes-list .gk-note-card").length !== 0) errors.push("GK Study Notes eagerly built its 776-card DOM before the library was opened.");

      if (notesEntry) {
        document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
        await pause();
        document.querySelector("#study-notes-mode-button")?.click();
        await pause();
        if (!visible(notesEntry)) errors.push("Detailed GK Stories did not appear inside General Knowledge Quick Notes.");
        notesEntry.click();
        await pause();
        const notesScreen = document.querySelector("#gk-notes-screen");
        const notesList = document.querySelector("#gk-notes-list");
        const notesSearch = document.querySelector("#gk-notes-search");
        const notesClear = document.querySelector("#gk-notes-clear-button");
        const notesLoadMore = document.querySelector("#gk-notes-load-more-button");
        const importantOnly = document.querySelector("#gk-notes-important-only");
        const resultsStatus = document.querySelector("#gk-notes-results-status");
        const emptyState = document.querySelector("#gk-notes-empty");
        const allNoteCards = () => [...document.querySelectorAll("#gk-notes-list .gk-note-card")];
        const visibleNoteCards = () => allNoteCards().filter(visible);

        if (!visible(notesScreen) || visible(document.querySelector("#category-screen"))) errors.push("GK Study Notes screen did not replace the category screen.");
        if (document.documentElement.scrollWidth > window.innerWidth) errors.push("GK Study Notes has horizontal overflow on mobile.");
        if (!notesList || allNoteCards().length !== 40 || visibleNoteCards().length !== 40) errors.push("GK Study Notes did not render the first 40-card page.");
        if (!resultsStatus || !resultsStatus.textContent.includes("40 of 776")) errors.push("GK Study Notes result status did not report its progressive 40-of-776 page.");
        if (!notesLoadMore || !visible(notesLoadMore)) errors.push("GK Study Notes Load more control was not available for the first page.");
        if (visible(emptyState)) errors.push("GK Study Notes empty state was visible before filtering.");
        const topicButtons = [...document.querySelectorAll("#gk-notes-topic-filters .gk-notes-topic-button[data-gk-notes-topic]")];
        if (notesData && topicButtons.length !== notesData.topics.length + 1) errors.push("GK Study Notes topic controls did not include every topic plus All.");
        if (topicButtons.filter((button) => button.getAttribute("aria-pressed") === "true").length !== 1) errors.push("GK Study Notes did not start with one active topic control.");

        const firstCard = allNoteCards()[0];
        if (!firstCard || firstCard.tagName !== "DETAILS" || firstCard.open) {
          errors.push("GK Study Notes cards must begin as collapsed native details elements.");
        } else {
          const firstSummary = firstCard.querySelector(".gk-note-summary");
          firstSummary.click();
          await pause();
          if (!firstCard.open) errors.push("GK Study Notes summary did not open its native details card.");
          const facts = [...firstCard.querySelectorAll(".gk-note-fact[data-question-id]")];
          const renderedNote = notesData.notes.find((note) => note.id === firstCard.dataset.gkNoteId);
          if (facts.length !== 2 || !renderedNote || facts[0].dataset.questionId !== renderedNote.facts[0].questionId
            || facts[1].dataset.questionId !== renderedNote.facts[1].questionId
            || renderedNote.facts[0].kind !== "source" || renderedNote.facts[1].kind !== "similar") {
            errors.push("An open GK Study Note did not show exactly source then similar facts.");
          }
          if (facts.some((fact) => !fact.querySelector(".gk-note-fact-question")?.textContent.trim()
            || !fact.querySelector(".gk-note-correct-answer")?.textContent.trim())) {
            errors.push("A GK Study Note fact omitted its question context or correct-answer key fact.");
          }
          if (facts.some((fact) => fact.querySelector(".gk-note-fact-question")?.textContent.trim().startsWith("\u062f\u0631\u0633\u062a \u062c\u0648\u0627\u0628"))) {
            errors.push("A GK Study Note still exposed MCQ-style correct-answer boilerplate in its reading prose.");
          }
          const temporalBadges = [...firstCard.querySelectorAll(".gk-note-temporal-badge[data-temporal-status]")];
          if (temporalBadges.length !== 2 || temporalBadges.some((badge) => !badge.textContent.trim())) {
            errors.push("A GK Study Note did not show a temporal badge for both facts.");
          }
          const citationLists = [...firstCard.querySelectorAll(".gk-note-citations")];
          const sourceLinks = [...firstCard.querySelectorAll(".gk-note-source-link")];
          if (citationLists.length !== 2 || citationLists.some((list) => list.querySelectorAll("a.gk-note-source-link").length < 2)) {
            errors.push("A GK Study Note did not expose at least two citations for each fact.");
          }
          if (sourceLinks.some((link) => !/^https:\\/\\//i.test(link.href))) errors.push("A GK Study Note citation was not HTTPS.");
          if (sourceLinks.some((link) => !/checked \\d{4}-\\d{2}-\\d{2}/.test(link.textContent))) errors.push("A GK Study Note citation omitted its evidence-check date.");
          if (!firstCard.querySelector(".gk-note-memory-hook")?.textContent.trim()) errors.push("A GK Study Note omitted its memory hook.");
        }

        const evidenceDetails = document.querySelector("details.gk-note-evidence-details");
        if (!evidenceDetails || evidenceDetails.open || !evidenceDetails.querySelector(".gk-note-evidence-note")?.textContent.trim()) {
          errors.push("GK Study Notes did not provide a collapsed source/correction disclosure.");
        } else {
          const evidenceCard = evidenceDetails.closest("details.gk-note-card");
          if (evidenceCard && !evidenceCard.open) evidenceCard.querySelector(".gk-note-summary").click();
          await pause();
          evidenceDetails.querySelector(".gk-note-evidence-summary").click();
          await pause();
          if (!evidenceDetails.open || !visible(evidenceDetails.querySelector(".gk-note-evidence-note"))) errors.push("GK Study Notes source/correction disclosure did not open.");
        }

        if (notesLoadMore) {
          notesLoadMore.click();
          await pause();
        if (allNoteCards().length !== 80 || visibleNoteCards().length !== 80 || !resultsStatus.textContent.includes("80 of 776")) {
            errors.push("GK Study Notes Load more did not append the next 40-card page.");
          }
        }

        const firstTitle = allNoteCards()[0]?.querySelector(".gk-note-title")?.textContent.trim();
        if (!notesSearch || !notesClear || !firstTitle) {
          errors.push("GK Study Notes search controls or searchable title were missing.");
        } else {
          notesSearch.value = firstTitle;
          notesSearch.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          const titleMatchVisible = visibleNoteCards().some((card) => card.querySelector(".gk-note-title")?.textContent.trim() === firstTitle);
          if (!titleMatchVisible || visibleNoteCards().length < 1 || visibleNoteCards().length >= 40) {
            errors.push("GK Study Notes search did not narrow results while retaining the matching title.");
          }
          notesClear.click();
          await pause();
        if (notesSearch.value || visibleNoteCards().length !== 40 || !resultsStatus.textContent.includes("40 of 776")) errors.push("GK Study Notes Clear did not restore the first full-list page after search.");
        }

        const datedNote = notesData.notes.find((note) => note.facts.some((fact) => ["as-of", "version"].includes(fact.temporalScope?.type)));
        if (!datedNote || !notesSearch || !notesClear) {
          errors.push("GK Study Notes lacked a searchable dated/version-specific note.");
        } else {
          notesSearch.value = datedNote.id;
          notesSearch.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          const datedCard = allNoteCards()[0];
          const datedBadge = datedCard?.querySelector('.gk-note-temporal-badge[data-temporal-status="as-of"], .gk-note-temporal-badge[data-temporal-status="version"]');
          if (datedCard && !datedCard.open) datedCard.querySelector(".gk-note-summary").click();
          await pause();
          if (!datedCard || !datedCard.open || !datedBadge || !visible(datedBadge) || !datedBadge.textContent.trim()) {
            errors.push("A dated/version GK Study Note did not reveal its temporal caveat when opened.");
          }
          notesClear.click();
          await pause();
          if (visibleNoteCards().length !== 40) errors.push("Clearing the dated-note search did not restore the first page.");
        }

        const specificTopicButton = topicButtons.find((button) => button.dataset.gkNotesTopic !== "all");
        const allTopicButton = topicButtons.find((button) => button.dataset.gkNotesTopic === "all");
        if (!specificTopicButton || !allTopicButton) {
          errors.push("GK Study Notes All/specific topic controls were missing.");
        } else {
          specificTopicButton.click();
          await pause();
          const selectedTopic = specificTopicButton.dataset.gkNotesTopic;
          const topicMatches = visibleNoteCards();
          if (specificTopicButton.getAttribute("aria-pressed") !== "true" || !topicMatches.length || topicMatches.length > 40) {
            errors.push("GK Study Notes topic filter did not narrow the list.");
          }
          if (topicMatches.some((card) => !String(card.dataset.gkNoteTopics || "").includes(selectedTopic))) {
            errors.push("GK Study Notes topic filter displayed an unrelated card.");
          }
          allTopicButton.click();
          await pause();
          if (visibleNoteCards().length !== 40 || allTopicButton.getAttribute("aria-pressed") !== "true") errors.push("GK Study Notes All topic did not restore the first full-list page.");
        }

        if (!importantOnly) {
          errors.push("GK Study Notes Important-only control was missing.");
        } else {
          importantOnly.click();
          await pause();
          const importantMatches = visibleNoteCards();
          if (!importantMatches.length || importantMatches.length > 40) errors.push("GK Study Notes Important-only filter did not return its first filtered page.");
          if (importantMatches.some((card) => card.dataset.gkNoteImportant !== "true")) errors.push("Important-only displayed a non-important GK Study Note.");
          importantOnly.click();
          await pause();
          if (visibleNoteCards().length !== 40) errors.push("Clearing Important-only did not restore the first full-list page.");
        }

        if (notesSearch && notesClear) {
          notesSearch.value = "zzzz-no-such-gk-study-note-766";
          notesSearch.dispatchEvent(new Event("input", { bubbles: true }));
          await pause();
          if (visibleNoteCards().length !== 0 || !visible(emptyState) || !resultsStatus.textContent.includes("0")) {
            errors.push("GK Study Notes no-results state was not shown for an impossible search.");
          }
          notesClear.click();
          await pause();
          if (visible(emptyState) || visibleNoteCards().length !== 40) errors.push("GK Study Notes Clear did not recover the first page after no results.");
        }

        document.querySelector("#gk-notes-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#quick-notes-screen")) || visible(notesScreen)) errors.push("Detailed GK Stories Back did not return to General Knowledge Quick Notes.");
        if (document.activeElement !== notesEntry) errors.push("GK Study Notes Back did not restore focus to its entry card.");
        document.querySelector("#quick-notes-back-button")?.click();
        await pause();
        document.querySelector("#mode-back-button")?.click();
        await pause();
        if (storageSnapshot() !== storageBeforeNotes) errors.push("Browsing GK Study Notes changed localStorage.");
      }

      const ibesQuestions = data.questions.filter((question) => question.id.startsWith("IBES-"));
      const ibesSourceQuestions = ibesQuestions.filter((question) => question.kind === "source");
      if (ibesQuestions.length !== 2176 || ibesSourceQuestions.length !== 1088) errors.push("IBES retained source/similar counts are incomplete.");
      if (ibesQuestions.some((question) => question.categoryId !== "basic-computer-studies")) errors.push("An IBES question is outside Basic Computer Studies.");

      const advQuestions = data.questions.filter((question) => question.id.startsWith("ADV2E102-"));
      const advSourceQuestions = advQuestions.filter((question) => question.kind === "source");
      const advSimilarQuestions = advQuestions.filter((question) => question.kind === "similar");
      if (advQuestions.length !== 8338 || advSourceQuestions.length !== 4169 || advSimilarQuestions.length !== 4169) {
        errors.push("The current ADV2E102 retained source/similar counts are incomplete.");
      }
      if (advQuestions.some((question) => !/[\u0600-\u06ff]/u.test(String(question.questionUrdu || "")))) {
        errors.push("An ADV2E102 question is missing its Urdu translation.");
      }

      // Render one deterministic IBES item without traversing all 2,296 Basic
      // Computer questions. Learn mode must keep the current source/data order.
      const ibesRenderTarget = ibesQuestions.find((question) => question.kind === "source");
      const firstComputerIndex = data.questions.findIndex((question) => question.categoryId === "basic-computer-studies");
      const ibesTargetIndex = data.questions.indexOf(ibesRenderTarget);
      if (!ibesRenderTarget || firstComputerIndex < 0 || ibesTargetIndex < 0) {
        errors.push("Could not locate a Basic Computer IBES render target.");
      } else {
        data.questions.splice(ibesTargetIndex, 1);
        data.questions.splice(firstComputerIndex, 0, ibesRenderTarget);
        document.querySelector('#category-grid .category-card[data-category="basic-computer-studies"]').click();
        await startModeWithRange("#learn-mode-button");
        const renderedIbesId = document.querySelector("#question-text").dataset.questionId;
        if (renderedIbesId !== ibesRenderTarget.id) errors.push("The deterministic IBES question did not render in Basic Computer Learn mode.");
        if (document.querySelector("#question-text-urdu").textContent !== ibesRenderTarget.questionUrdu) errors.push("The rendered IBES Urdu translation did not match its data.");
        document.querySelector("#back-button").click();
        await pause();
      }

      const categoryButton = [...document.querySelectorAll("#category-grid .category-card:not([disabled])")]
        .reduce((smallest, button) => {
          const categoryId = button.dataset.category || button.dataset.categoryId;
          const count = data.questions.filter((question) => question.categoryId === categoryId).length;
          return !smallest || count < smallest.count ? { button, count } : smallest;
        }, null).button;
      const activeCategory = categoryButton.dataset.category || categoryButton.dataset.categoryId;
      const allCategoryQuestions = data.questions.filter((question) => question.categoryId === activeCategory);
      const categoryQuestions = allCategoryQuestions;
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      const findCurrent = () => {
        const questionId = document.querySelector("#question-text").dataset.questionId;
        return categoryQuestions.find((question) => question.id === questionId);
      };
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const correctRenderedIndex = (question) => renderedOptionTexts().indexOf(
        displayOptions(question)[question.correctOptionIndex]
      );
      const verifyQuizOptionShuffle = (question) => {
        const original = displayOptions(question);
        const rendered = renderedOptionTexts();
        if (JSON.stringify(rendered) === JSON.stringify(original)) {
          errors.push("Quiz options were not shuffled for " + question.id + ".");
        }
        const correctIndex = correctRenderedIndex(question);
        if (correctIndex < 0) errors.push("Shuffled correct answer could not be mapped for " + question.id + ".");
        return correctIndex < 0 ? 0 : correctIndex;
      };
      const assertProgress = (expectedNumber, expectedTotal, context) => {
        const input = document.querySelector("#question-number-input");
        const total = document.querySelector("#question-total");
        if (!input || !total) {
          errors.push(context + " did not render the question jump controls.");
          return;
        }
        if (input.value !== String(expectedNumber)) errors.push(context + " question-number input was incorrect.");
        if (input.min !== "1" || input.max !== String(expectedTotal) || input.step !== "1") errors.push(context + " question-number bounds were incorrect.");
        if (total.textContent.trim() !== String(expectedTotal)) errors.push(context + " question total was incorrect.");
      };
      const jumpByChange = async (number) => {
        const input = document.querySelector("#question-number-input");
        input.value = String(number);
        input.dispatchEvent(new Event("change", { bubbles: true }));
        await pause();
      };
      const jumpByEnter = async (number) => {
        const input = document.querySelector("#question-number-input");
        input.value = String(number);
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
        await pause();
      };

      const rangeStorageKey = "ppsc-prep:active-session:v1";
      const rangeCategory = data.categories.find((category) => {
        const categoryItems = data.questions.filter((question) => question.categoryId === category.id);
        return categoryItems.length >= 4 && categoryItems.filter((question) => question.isImportant === true).length >= 4;
      });
      const rangeCategoryButton = rangeCategory
        ? document.querySelector('#category-grid .category-card[data-category="' + rangeCategory.id + '"]')
        : null;
      const rangeQuestions = rangeCategory
        ? data.questions.filter((question) => question.categoryId === rangeCategory.id)
        : [];
      const rangePoolIds = rangeQuestions.map((question) => String(question.id));

      if (!rangeCategory || !rangeCategoryButton) {
        errors.push("Could not find a category suitable for question-range testing.");
      } else {
        rangeCategoryButton.click();
        await pause();

        document.querySelector("#quiz-mode-button")?.click();
        await pause();
        if (!visible(document.querySelector("#question-range-options"))) errors.push("Quiz did not open the range selector.");
        if (document.querySelector("#question-range-start-input")?.value !== "1"
          || document.querySelector("#question-range-end-input")?.value !== String(rangeQuestions.length)
          || document.querySelector("#question-range-end-input")?.max !== String(rangeQuestions.length)) {
          errors.push("The range selector did not default to the complete active list.");
        }
        document.querySelector("#question-range-back-button")?.click();
        await pause();
        if (!visible(document.querySelector("#standard-mode-options")) || document.activeElement !== document.querySelector("#quiz-mode-button")) {
          errors.push("Range Back did not restore the initiating Quiz button and focus.");
        }

        document.querySelector("#learn-mode-button")?.click();
        await pause();
        const storageBeforeInvalidRanges = localStorage.getItem(rangeStorageKey);
        const invalidRanges = [
          [null, 4, "blank"],
          [1.5, 4, "decimal"],
          [0, 4, "zero"],
          [4, 2, "reversed"],
          [1, rangeQuestions.length + 1, "out-of-range"]
        ];
        for (const [start, end, label] of invalidRanges) {
          setRangeValues(start, end);
          await submitRange();
          if (!visible(document.querySelector("#question-range-options")) || visible(document.querySelector("#quiz-screen"))) {
            errors.push("The " + label + " range incorrectly started a session.");
          }
          if (localStorage.getItem(rangeStorageKey) !== storageBeforeInvalidRanges) {
            errors.push("The " + label + " range overwrote resumable-session storage.");
          }
        }

        setRangeValues(3, 3);
        await submitRange();
        if (!visible(document.querySelector("#quiz-screen"))
          || document.querySelector("#question-text")?.dataset.questionId !== String(rangeQuestions[2].id)) {
          errors.push("A valid start=end range did not open exactly the selected canonical question.");
        }
        let singleRangeSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        if (!singleRangeSnapshot || singleRangeSnapshot.version !== 8 || singleRangeSnapshot.computerSourceScope !== "all" || singleRangeSnapshot.rangeStart !== 3
          || singleRangeSnapshot.rangeEnd !== 3 || singleRangeSnapshot.rangePoolSize !== rangeQuestions.length
          || JSON.stringify(singleRangeSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(rangePoolIds)
          || JSON.stringify(singleRangeSnapshot.rangeQuestionIds || []) !== JSON.stringify([String(rangeQuestions[2].id)])
          || JSON.stringify(singleRangeSnapshot.questionIds) !== JSON.stringify([String(rangeQuestions[2].id)])) {
          errors.push("The start=end range was not saved with exact v8 metadata.");
        }
        document.querySelector("#restart-button")?.click();
        await pause();
        singleRangeSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        if (document.querySelector("#question-text")?.dataset.questionId !== String(rangeQuestions[2].id)
          || singleRangeSnapshot?.rangeStart !== 3 || singleRangeSnapshot?.rangeEnd !== 3) {
          errors.push("Restart did not retain a one-question selected range.");
        }
        document.querySelector("#action-button")?.click();
        await pause();
        if (visible(document.querySelector("#results-screen"))
          || document.querySelector("#action-button")?.textContent !== "Finish Learning") {
          errors.push("Single-question Learn range did not reveal before finishing.");
        }
        document.querySelector("#action-button")?.click();
        await pause();
        document.querySelector("#change-category-button")?.click();
        await pause();

        rangeCategoryButton.click();
        await pause();
        await startModeWithRange("#learn-mode-button", 2, 4);
        const expectedRangeIds = rangeQuestions.slice(1, 4).map((question) => String(question.id));
        const observedLearnRangeIds = [];
        for (let number = 1; number <= 3; number += 1) {
          await jumpByChange(number);
          observedLearnRangeIds.push(String(document.querySelector("#question-text")?.dataset.questionId || ""));
        }
        if (JSON.stringify(observedLearnRangeIds) !== JSON.stringify(expectedRangeIds)) errors.push("Learn range 2–4 did not preserve the exact canonical IDs.");
        let selectedRangeSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        if (!selectedRangeSnapshot || selectedRangeSnapshot.version !== 8 || selectedRangeSnapshot.computerSourceScope !== "all" || selectedRangeSnapshot.rangeStart !== 2
          || selectedRangeSnapshot.rangeEnd !== 4 || selectedRangeSnapshot.rangePoolSize !== rangeQuestions.length
          || JSON.stringify(selectedRangeSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(rangePoolIds)
          || JSON.stringify(selectedRangeSnapshot.rangeQuestionIds || []) !== JSON.stringify(expectedRangeIds)
          || JSON.stringify(selectedRangeSnapshot.questionIds) !== JSON.stringify(expectedRangeIds)) {
          errors.push("Learn range 2–4 did not persist exact v8 range metadata and order.");
        }

        document.querySelector("#restart-button")?.click();
        await pause();
        selectedRangeSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        if (document.querySelector("#question-text")?.dataset.questionId !== expectedRangeIds[0]
          || selectedRangeSnapshot?.rangeStart !== 2 || selectedRangeSnapshot?.rangeEnd !== 4
          || JSON.stringify(selectedRangeSnapshot?.questionIds || []) !== JSON.stringify(expectedRangeIds)) {
          errors.push("Restart did not retain Learn range 2–4.");
        }
        for (let learnRangeIndex = 0; learnRangeIndex < expectedRangeIds.length; learnRangeIndex += 1) {
          const expectedId = expectedRangeIds[learnRangeIndex];
          if (document.querySelector("#question-text")?.dataset.questionId !== expectedId) {
            errors.push("Learn range completion left canonical order before question " + (learnRangeIndex + 1) + ".");
            break;
          }
          document.querySelector("#action-button")?.click();
          await pause();
          if (document.querySelector("#question-text")?.dataset.questionId !== expectedId) {
            errors.push("Learn range reveal advanced before showing question " + (learnRangeIndex + 1) + " answer.");
            break;
          }
          document.querySelector("#action-button")?.click();
          await pause();
        }
        if (!visible(document.querySelector("#results-screen"))) errors.push("The complete three-question Learn range did not finish.");
        document.querySelector("#play-again-button")?.click();
        await pause();
        const rangeQuizSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        const rangeQuizIds = rangeQuizSnapshot?.questionIds || [];
        if (!visible(document.querySelector("#quiz-screen")) || rangeQuizSnapshot?.mode !== "quiz"
          || rangeQuizSnapshot?.rangeStart !== 2 || rangeQuizSnapshot?.rangeEnd !== 4
          || JSON.stringify(rangeQuizSnapshot?.rangePoolQuestionIds || []) !== JSON.stringify(rangePoolIds)
          || JSON.stringify(rangeQuizSnapshot?.rangeQuestionIds || []) !== JSON.stringify(expectedRangeIds)
          || JSON.stringify(rangeQuizIds) !== JSON.stringify(expectedRangeIds)) {
          errors.push("Start Quiz did not retain the Learn range 2–4 in canonical source order.");
        }
        for (let index = 0; index < 3; index += 1) {
          const currentId = document.querySelector("#question-text")?.dataset.questionId;
          const currentQuestion = rangeQuestions.find((question) => String(question.id) === String(currentId));
          const renderedAnswers = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
          const canonicalAnswer = currentQuestion ? displayOptions(currentQuestion)[currentQuestion.correctOptionIndex] : "";
          const correctIndex = renderedAnswers.indexOf(canonicalAnswer);
          const selectedIndex = index === 0 ? (correctIndex + 1) % 4 : correctIndex;
          document.querySelector('[data-option-index="' + selectedIndex + '"]')?.click();
          document.querySelector("#action-button")?.click();
          await pause();
          document.querySelector("#action-button")?.click();
          await pause();
        }
        if (!visible(document.querySelector("#results-screen"))
          || document.querySelector("#result-score")?.textContent.replace(/\\s/g, "") !== "2/3") {
          errors.push("Quiz range 2–4 changed the existing answer scoring behaviour.");
        }
        document.querySelector("#change-category-button")?.click();
        await pause();

        rangeCategoryButton.click();
        await pause();
        document.querySelector("#important-only-checkbox")?.click();
        await pause();
        const rangeImportantQuestions = rangeQuestions.filter((question) => question.isImportant === true);
        await startModeWithRange("#learn-mode-button", 2, 4);
        const importantRangeSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        const expectedImportantRangeIds = rangeImportantQuestions.slice(1, 4).map((question) => String(question.id));
        if (!importantRangeSnapshot || importantRangeSnapshot.importantOnly !== true
          || importantRangeSnapshot.rangePoolSize !== rangeImportantQuestions.length
          || JSON.stringify(importantRangeSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(rangeImportantQuestions.map((question) => String(question.id)))
          || JSON.stringify(importantRangeSnapshot.rangeQuestionIds || []) !== JSON.stringify(expectedImportantRangeIds)
          || JSON.stringify(importantRangeSnapshot.questionIds) !== JSON.stringify(expectedImportantRangeIds)) {
          errors.push("Important range 2–4 was not applied after filtering the category.");
        }
        document.querySelector("#back-button")?.click();
        await pause();
        rangeCategoryButton.click();
        await pause();
        document.querySelector("#important-only-checkbox")?.click();
        await pause();
        await startModeWithRange("#quiz-mode-button", 2, 4);
        const importantQuizSnapshot = JSON.parse(localStorage.getItem(rangeStorageKey) || "null");
        if (!importantQuizSnapshot || importantQuizSnapshot.mode !== "quiz"
          || importantQuizSnapshot.importantOnly !== true
          || JSON.stringify(importantQuizSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(rangeImportantQuestions.map((question) => String(question.id)))
          || JSON.stringify(importantQuizSnapshot.rangeQuestionIds || []) !== JSON.stringify(expectedImportantRangeIds)
          || JSON.stringify(importantQuizSnapshot.questionIds || []) !== JSON.stringify(expectedImportantRangeIds)) {
          errors.push("Important Quiz range 2–4 did not retain the filtered canonical source order.");
        }
        document.querySelector("#back-button")?.click();
        await pause();
      }

      categoryButton.click();
      await pause();
      if (!visible(document.querySelector("#mode-screen"))) errors.push("Mode chooser did not open after selecting a category.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Mode chooser has horizontal overflow on mobile.");
      if (document.querySelectorAll("#standard-mode-options > .mode-option").length !== 6) errors.push("Mode chooser did not show Learn, Quiz, Queue, Difficult, Study Notes and Detailed Learning.");
      if (document.querySelector("#part-select, [data-part-select]")) errors.push("Removed Part dropdown is still present.");
      if (!document.querySelector("#study-scope-summary").textContent.includes(String(allCategoryQuestions.length))) errors.push("Study summary did not show the full-category total.");
      const expectedImportant = allCategoryQuestions.filter((question) => question.isImportant === true);
      if (!document.querySelector("#important-count").textContent.startsWith(String(expectedImportant.length))) errors.push("Important count did not match the full category.");

      if (!expectedImportant.length) {
        errors.push("Could not find an Important question in the tested category.");
      } else {
        const importantCheckbox = document.querySelector("#important-only-checkbox");
        importantCheckbox.click();
        await pause();
        if (document.querySelector("#learn-mode-button").disabled || document.querySelector("#quiz-mode-button").disabled) errors.push("Important Learn/Quiz was disabled despite matching questions.");
        await startModeWithRange("#learn-mode-button");
        const importantRenderedId = document.querySelector("#question-text").dataset.questionId;
        if (!expectedImportant.some((question) => question.id === importantRenderedId)) errors.push("Important Learn rendered a non-important question.");
        assertProgress(1, expectedImportant.length, "Important Learn");
        if (!document.querySelector("#question-kind").textContent.includes("IMPORTANT")) errors.push("Important question badge was not rendered.");
        const importantJumpNumber = Math.min(2, expectedImportant.length);
        await jumpByChange(importantJumpNumber);
        if (document.querySelector("#question-text").dataset.questionId !== expectedImportant[importantJumpNumber - 1].id) errors.push("Important Learn jump did not map the filtered number to the expected important question.");
        assertProgress(importantJumpNumber, expectedImportant.length, "Important Learn jump");
        document.querySelector("#back-button").click();
        await pause();
        categoryButton.click();
        await pause();
        if (document.querySelector("#part-select, [data-part-select]") || document.querySelector("#important-only-checkbox").checked) errors.push("A fresh category choice did not reset to full-category standard scope.");
      }

      document.querySelector("#difficult-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#difficult-mode-options"))) errors.push("Difficult preparation chooser did not open.");
      if (document.querySelector("#difficult-count").textContent.trim() !== "0") errors.push("Fresh profile did not start with zero difficult questions.");
      if (!visible(document.querySelector("#difficult-empty"))) errors.push("Zero-difficult empty state was not shown.");
      if (!document.querySelector("#difficult-learn-button").disabled || !document.querySelector("#difficult-quiz-button").disabled) errors.push("Empty Difficult Learn/Quiz actions were not disabled.");
      document.querySelector("#difficult-back-button").click();
      await pause();
      if (!visible(document.querySelector("#standard-mode-options"))) errors.push("Difficult chooser back button failed.");

      document.querySelector("#mode-back-button").click();
      await pause();
      if (!visible(document.querySelector("#category-screen"))) errors.push("Mode chooser back button failed.");

      categoryButton.click();
      await startModeWithRange("#learn-mode-button");
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Learn mode did not open.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Question screen has horizontal overflow on mobile.");
      const questionNumberInput = document.querySelector("#question-number-input");
      if (!questionNumberInput || (!questionNumberInput.labels.length && !questionNumberInput.getAttribute("aria-label"))) errors.push("Question-number input has no accessible name.");

      const activeSessionSnapshot = () => JSON.parse(
        localStorage.getItem("ppsc-prep:active-session:v1") || "null"
      );
      const retryQueueSnapshot = () => JSON.parse(
        localStorage.getItem("ppsc-prep:retry-queue:v1") || "null"
      );
      const learnOptionButtons = () => [...document.querySelectorAll("#options-container .option-button")];
      const assertLearnHidden = (context) => {
        const snapshot = activeSessionSnapshot();
        const buttons = learnOptionButtons();
        if (buttons.length !== 4 || buttons.some((button) => (
          !button.disabled
          || button.classList.contains("is-selected")
          || button.classList.contains("is-correct")
          || button.classList.contains("is-incorrect")
          || button.getAttribute("aria-checked") !== "false"
        ))) errors.push(context + " did not keep all Learn options inert and unmarked before reveal.");
        if (visible(document.querySelector("#feedback"))) errors.push(context + " showed feedback before reveal.");
        if (!snapshot || snapshot.submitted !== false || snapshot.selectedIndex !== null
          || snapshot.learnVisitedQuestionIds.includes(String(document.querySelector("#question-text")?.dataset.questionId || ""))) {
          errors.push(context + " did not persist the hidden Learn phase.");
        }
        if (document.querySelector("#action-button")?.textContent !== "Show Answer"
          || document.querySelector("#action-button")?.dataset.action !== "reveal"
          || document.querySelector("#action-button")?.getAttribute("aria-keyshortcuts") !== "Enter Space ArrowRight") {
          errors.push(context + " did not expose the Show Answer action and keyboard shortcuts.");
        }
      };
      const assertLearnRevealed = (question, context) => {
        const snapshot = activeSessionSnapshot();
        const correctIndex = correctRenderedIndex(question);
        const buttons = learnOptionButtons();
        const correct = buttons[correctIndex];
        if (!correct || buttons.some((button) => !button.disabled)
          || !correct.classList.contains("is-selected")
          || !correct.classList.contains("is-correct")
          || correct.getAttribute("aria-checked") !== "true"
          || buttons.some((button, index) => index !== correctIndex && (
            button.classList.contains("is-selected")
            || button.classList.contains("is-correct")
            || button.classList.contains("is-incorrect")
            || button.getAttribute("aria-checked") !== "false"
          ))) errors.push(context + " did not reveal and lock only the correct Learn option.");
        if (!visible(document.querySelector("#feedback"))
          || document.querySelector("#feedback-title")?.textContent !== "Correct answer") {
          errors.push(context + " did not show Learn feedback after reveal.");
        }
        if (!snapshot || snapshot.submitted !== true || snapshot.selectedIndex !== correctIndex
          || !snapshot.learnVisitedQuestionIds.includes(String(question.id))) {
          errors.push(context + " did not persist the revealed Learn phase.");
        }
      };
      const pressLearnKey = async (key, code, targetSelector, repeat) => {
        const target = document.querySelector(targetSelector || "#question-text");
        const accepted = target?.dispatchEvent(new KeyboardEvent("keydown", {
          key,
          code: code || "",
          repeat: Boolean(repeat),
          bubbles: true,
          cancelable: true
        }));
        await pause();
        return accepted === false;
      };

      let question = findCurrent();
      assertLearnHidden("Initial Learn question");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(displayOptions(question))) errors.push("Learn mode changed the source option order.");
      if (!visible(document.querySelector("#question-urdu-block")) || document.querySelector("#question-text-urdu").textContent !== question.questionUrdu) errors.push("Urdu question translation did not render in Learn mode.");
      if (document.querySelector("#score-text").textContent !== "Learn Mode") errors.push("Learn mode displayed a score.");
      if (!document.querySelector("#previous-button").disabled) errors.push("Previous was enabled on the first Learn question.");
      assertProgress(1, categoryQuestions.length, "Initial Learn");
      if (categoryQuestions.length > 1) {
        const firstLearnId = question.id;
        const initialHiddenSnapshot = JSON.stringify(activeSessionSnapshot());
        learnOptionButtons()[0]?.click();
        await pause();
        if (JSON.stringify(activeSessionSnapshot()) !== initialHiddenSnapshot) {
          errors.push("Clicking an inert pre-reveal Learn option changed the saved answer state.");
        }
        const practiceBeforeReveal = retryQueueSnapshot()?.practiceStep;
        document.querySelector("#action-button").click();
        await pause();
        if (document.querySelector("#question-text")?.dataset.questionId !== firstLearnId) {
          errors.push("First Learn action advanced instead of revealing the current answer.");
        }
        assertProgress(1, categoryQuestions.length, "Learn click reveal");
        assertLearnRevealed(question, "Learn click reveal");
        if (retryQueueSnapshot()?.practiceStep !== practiceBeforeReveal
          || activeSessionSnapshot()?.learnReviewCountedQuestionIds?.length !== 0) {
          errors.push("Revealing a Learn answer advanced review cadence before leaving the question.");
        }

        document.querySelector("#action-button").click();
        await pause();
        assertProgress(2, categoryQuestions.length, "Learn Next");
        if (document.querySelector("#previous-button").disabled) errors.push("Previous stayed disabled after advancing in Learn mode.");
        assertLearnHidden("Second Learn question");
        const practiceAfterFirstCompletion = retryQueueSnapshot()?.practiceStep;
        if (practiceAfterFirstCompletion !== practiceBeforeReveal + 1
          || activeSessionSnapshot()?.learnReviewCountedQuestionIds?.length !== 1) {
          errors.push("Leaving a revealed Learn answer did not advance review cadence exactly once.");
        }
        document.querySelector("#previous-button").click();
        await pause();
        assertProgress(1, categoryQuestions.length, "Learn Previous");
        if (document.querySelector("#question-text").dataset.questionId !== firstLearnId) errors.push("Previous did not restore the first Learn question.");
        if (!document.querySelector("#previous-button").disabled) errors.push("Previous was not disabled after returning to the first Learn question.");
        assertLearnRevealed(question, "Learn Previous");
        document.querySelector("#action-button").click();
        await pause();
        assertProgress(2, categoryQuestions.length, "Learn Previous return");
        assertLearnHidden("Learn Previous return target");
        if (retryQueueSnapshot()?.practiceStep !== practiceAfterFirstCompletion) {
          errors.push("Revisiting and leaving an already counted Learn question advanced cadence twice.");
        }

        const beforeHeldKey = JSON.stringify(activeSessionSnapshot());
        const heldKeyId = document.querySelector("#question-text")?.dataset.questionId;
        if (!await pressLearnKey(" ", "Space", "#action-button", true)) {
          errors.push("Held Space on the Learn action did not prevent native page behavior.");
        }
        if (document.querySelector("#question-text")?.dataset.questionId !== heldKeyId
          || JSON.stringify(activeSessionSnapshot()) !== beforeHeldKey) {
          errors.push("Held-key repeat changed or advanced the hidden Learn question.");
        }
        assertLearnHidden("Held-key repeat guard");

        const shortcutCases = [
          [" ", "Space", "Space", "#action-button"],
          ["Enter", "Enter", "Enter", "#question-text"],
          ["ArrowRight", "ArrowRight", "ArrowRight", "#action-button"]
        ];
        for (const [key, code, label, targetSelector] of shortcutCases) {
          const shortcutQuestion = findCurrent();
          const shortcutId = shortcutQuestion?.id;
          const shortcutNumber = Number(document.querySelector("#question-number-input")?.value || 0);
          if (!shortcutQuestion) {
            errors.push(label + " shortcut could not identify its Learn question.");
            break;
          }
          assertLearnHidden(label + " shortcut initial phase");
          if (!await pressLearnKey(key, code, targetSelector)) errors.push(label + " shortcut reveal did not prevent the page default.");
          if (document.querySelector("#question-text")?.dataset.questionId !== shortcutId
            || Number(document.querySelector("#question-number-input")?.value || 0) !== shortcutNumber) {
            errors.push(label + " shortcut reveal advanced the Learn question.");
          }
          assertLearnRevealed(shortcutQuestion, label + " shortcut reveal");
          if (!await pressLearnKey(key, code, targetSelector)) errors.push(label + " shortcut advance did not prevent the page default.");
          if (shortcutNumber < categoryQuestions.length
            && Number(document.querySelector("#question-number-input")?.value || 0) !== shortcutNumber + 1) {
            errors.push(label + " shortcut second press did not advance exactly one Learn question.");
          }
        }

        const manualLearnNumber = Math.min(3, categoryQuestions.length);
        await jumpByChange(manualLearnNumber);
        if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[manualLearnNumber - 1].id) errors.push("Learn change jump opened the wrong question.");
        assertProgress(manualLearnNumber, categoryQuestions.length, "Learn change jump");
        if (activeSessionSnapshot()?.learnVisitedQuestionIds?.includes(categoryQuestions[manualLearnNumber - 1].id)) {
          assertLearnRevealed(findCurrent(), "Learn change jump to revealed question");
        } else {
          assertLearnHidden("Learn change jump to unseen question");
        }
        await jumpByEnter(2);
        if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[1].id) errors.push("Learn Enter jump opened the wrong question.");
        assertProgress(2, categoryQuestions.length, "Learn Enter jump");
        assertLearnRevealed(categoryQuestions[1], "Learn Enter jump to revealed question");
        const beforeInvalidLearnId = document.querySelector("#question-text").dataset.questionId;
        await jumpByChange(0);
        if (document.querySelector("#question-text").dataset.questionId !== beforeInvalidLearnId) errors.push("Invalid Learn jump changed the current question.");
        assertProgress(2, categoryQuestions.length, "Invalid Learn jump recovery");

        await jumpByChange(categoryQuestions.length);
        const learnGuardSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        const visitedLearnIds = new Set(
          learnGuardSnapshot && Array.isArray(learnGuardSnapshot.learnVisitedQuestionIds)
            ? learnGuardSnapshot.learnVisitedQuestionIds
            : []
        );
        const firstUnvisitedLearnIndex = categoryQuestions.findIndex((item) => !visitedLearnIds.has(item.id));
        if (!learnGuardSnapshot || learnGuardSnapshot.version !== 8 || learnGuardSnapshot.computerSourceScope !== "all" || learnGuardSnapshot.sessionKind !== "category" || learnGuardSnapshot.paperCategoryIds !== null || learnGuardSnapshot.mode !== "learn" || learnGuardSnapshot.partIndex !== null) errors.push("Learn completion guard was not stored with the v8 category-session schema.");
        if (!learnGuardSnapshot || learnGuardSnapshot.currentIndex !== categoryQuestions.length - 1 || visitedLearnIds.has(categoryQuestions[categoryQuestions.length - 1].id)) errors.push("Jumping directly to the last Learn question incorrectly revealed or visited it.");
        if (firstUnvisitedLearnIndex < 0) errors.push("Learn completion guard could not identify an unvisited question.");
        assertLearnHidden("Directly visited last Learn question");
        document.querySelector("#action-button").click();
        await pause();
        if (visible(document.querySelector("#results-screen"))
          || document.querySelector("#question-text")?.dataset.questionId !== categoryQuestions[categoryQuestions.length - 1].id) {
          errors.push("First action on the last Learn question did not stay in place for answer reveal.");
        }
        if (document.querySelector("#action-button").textContent !== "Next Unvisited" || document.querySelector("#action-button").dataset.action !== "next-unvisited") errors.push("Revealed last Learn question did not offer Next Unvisited while questions remained unseen.");
        document.querySelector("#action-button").click();
        await pause();
        if (visible(document.querySelector("#results-screen"))) errors.push("Learn opened results while questions remained unvisited.");
        if (firstUnvisitedLearnIndex >= 0) {
          if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[firstUnvisitedLearnIndex].id) errors.push("Next Unvisited did not wrap to the first unvisited Learn question.");
          assertProgress(firstUnvisitedLearnIndex + 1, categoryQuestions.length, "Learn Next Unvisited");
          assertLearnHidden("Learn Next Unvisited target");
        }
      }
      document.querySelector("#restart-button").click();
      await pause();
      assertProgress(1, categoryQuestions.length, "Learn restart");
      const learnOrder = [];
      const markedQuestionIds = [];
      while (!visible(document.querySelector("#results-screen"))) {
        question = findCurrent();
        if (!question) {
          errors.push("Could not identify a Learn question.");
          break;
        }
        learnOrder.push(question.id);
        const difficultCheckbox = document.querySelector("#difficult-checkbox");
        if (!visible(document.querySelector("#difficult-control"))) errors.push("Difficult checkbox was not visible on the Learn question.");
        if (difficultCheckbox.dataset.questionId !== question.id) errors.push("Difficult checkbox was attached to the wrong Learn question.");
        if (markedQuestionIds.length < 2) {
          if (difficultCheckbox.checked) errors.push("An unmarked Learn question started checked.");
          difficultCheckbox.click();
          await pause();
          if (!difficultCheckbox.checked) errors.push("Difficult checkbox did not mark the question.");
          if (!document.querySelector("#difficult-mark-status").textContent.includes("Marked")) errors.push("Difficult mark status was not announced.");
          markedQuestionIds.push(question.id);
        }
        if (!activeSessionSnapshot()?.submitted) {
          document.querySelector("#action-button").click();
          await pause();
          assertLearnRevealed(question, "Learn completion-loop reveal");
        }
        document.querySelector("#action-button").click();
        await pause();
      }
      const canonicalOrder = categoryQuestions.map((item) => item.id);
      if (learnOrder.length !== categoryQuestions.length || new Set(learnOrder).size !== categoryQuestions.length) errors.push("Learn source order lost or duplicated a question.");
      if (JSON.stringify(learnOrder) !== JSON.stringify(canonicalOrder)) errors.push("Learn questions did not stay in source/data order.");
      const savedDifficultPayload = JSON.parse(localStorage.getItem("ppsc-prep:difficult-question-ids:v1") || "{}");
      if (savedDifficultPayload.version !== 1 || !Array.isArray(savedDifficultPayload.questionIds)) errors.push("Difficult marks were not stored with the versioned schema.");
      if (markedQuestionIds.some((id) => !savedDifficultPayload.questionIds.includes(id))) errors.push("A marked question ID was not persisted.");
      if (document.querySelector("#results-title").textContent !== "Learning complete!") errors.push("Learn completion copy was not shown.");
      if (document.querySelector("#result-score").textContent.trim() !== String(categoryQuestions.length)) errors.push("Learn completion total did not match.");
      if (document.querySelector("#play-again-button").textContent !== "Start Quiz") errors.push("Learn completion did not offer Start Quiz.");
      document.querySelector("#play-again-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Start Quiz did not open the quiz screen.");
      if (document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Start Quiz did not switch from Learn to Quiz mode.");

      question = findCurrent();
      if (!question) errors.push("First question did not render.");
      if (!visible(document.querySelector("#question-urdu-block")) || document.querySelector("#question-text-urdu").textContent !== question.questionUrdu) errors.push("Urdu question translation did not render in Quiz mode.");
      if (document.querySelectorAll("#options-container .option-button").length !== 4) errors.push("Four options did not render.");
      if (!visible(document.querySelector("#difficult-control")) || document.querySelector("#difficult-checkbox").dataset.questionId !== question.id) errors.push("Difficult checkbox was not immediately available on the Quiz question.");

      const quizOrder = [question.id];
      const firstQuizOptionOrders = Object.create(null);
      let renderedCorrectIndex = verifyQuizOptionShuffle(question);
      firstQuizOptionOrders[question.id] = JSON.stringify(renderedOptionTexts());
      const wrongIndex = (renderedCorrectIndex + 1) % 4;
      document.querySelector('[data-option-index="' + wrongIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#feedback-title").textContent !== "Incorrect") errors.push("Incorrect feedback failed.");
      if (!document.querySelector("#feedback-text").textContent.includes("The correct answer is")) errors.push("Correct answer was not revealed.");
      if (!document.querySelector('[data-option-index="' + renderedCorrectIndex + '"]').classList.contains("is-correct")) errors.push("Shuffled correct option was not revealed after an incorrect answer.");
      const loadedFontFamilies = document.fonts
        ? [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family.replace(/["']/g, ""))
        : [];
      if (!getComputedStyle(document.body).fontFamily.includes("Inter")) errors.push("Readable English font was not applied.");
      if (document.fonts && !loadedFontFamilies.includes("Inter")) errors.push("Inter did not load.");
      if (!getComputedStyle(document.querySelector("#question-text-urdu")).fontFamily.includes("Noto Nastaliq Urdu")) errors.push("Readable Urdu font was not applied.");
      if (document.fonts && !loadedFontFamilies.includes("Noto Nastaliq Urdu")) errors.push("Noto Nastaliq Urdu did not load.");

      if (categoryQuestions.length > 2) {
        const submittedQuestionId = question.id;
        const submittedOptionOrder = JSON.stringify(renderedOptionTexts());
        const pendingJumpNumber = 3;
        await jumpByChange(pendingJumpNumber);
        const pendingJumpId = document.querySelector("#question-text").dataset.questionId;
        const pendingJumpOptionOrder = JSON.stringify(renderedOptionTexts());
        const pendingJumpSelectedIndex = 2;
        document.querySelector('[data-option-index="' + pendingJumpSelectedIndex + '"]').click();
        await pause();

        await jumpByEnter(1);
        if (document.querySelector("#question-text").dataset.questionId !== submittedQuestionId) errors.push("Quiz jump back restored the wrong submitted question.");
        if (JSON.stringify(renderedOptionTexts()) !== submittedOptionOrder) errors.push("Quiz jump back changed the submitted question option order.");
        const restoredSubmittedButton = document.querySelector('[data-option-index="' + wrongIndex + '"]');
        if (!restoredSubmittedButton || !restoredSubmittedButton.disabled || !restoredSubmittedButton.classList.contains("is-incorrect")) errors.push("Quiz jump back did not preserve the submitted response.");
        if (document.querySelector("#feedback-title").textContent !== "Incorrect" || document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Quiz jump back changed submitted feedback or score.");
        assertProgress(1, categoryQuestions.length, "Quiz submitted jump back");

        await jumpByChange(pendingJumpNumber);
        if (document.querySelector("#question-text").dataset.questionId !== pendingJumpId) errors.push("Quiz jump did not return to the same pending question.");
        if (JSON.stringify(renderedOptionTexts()) !== pendingJumpOptionOrder) errors.push("Quiz jump changed the pending question option order.");
        const restoredPendingButton = document.querySelector('[data-option-index="' + pendingJumpSelectedIndex + '"]');
        if (!restoredPendingButton || !restoredPendingButton.classList.contains("is-selected") || restoredPendingButton.disabled) errors.push("Quiz jump did not preserve the pending response.");
        if (visible(document.querySelector("#feedback")) || document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Quiz pending jump incorrectly changed feedback or score.");
        assertProgress(pendingJumpNumber, categoryQuestions.length, "Quiz pending jump");
        await jumpByEnter(1);
      }

      let completionGuardScore = 0;
      if (categoryQuestions.length > 2) {
        const lastQuizNumber = categoryQuestions.length;
        await jumpByChange(lastQuizNumber);
        const lastQuizQuestion = findCurrent();
        const lastQuizId = lastQuizQuestion ? lastQuizQuestion.id : "";
        const lastQuizCorrectIndex = lastQuizQuestion ? verifyQuizOptionShuffle(lastQuizQuestion) : 0;
        const lastQuizOptionOrder = JSON.stringify(renderedOptionTexts());
        firstQuizOptionOrders[lastQuizId] = lastQuizOptionOrder;
        document.querySelector('[data-option-index="' + lastQuizCorrectIndex + '"]').click();
        document.querySelector("#action-button").click();
        await pause();
        completionGuardScore = 1;
        if (document.querySelector("#feedback-title").textContent !== "Correct!" || document.querySelector("#score-text").textContent !== "Score: " + completionGuardScore) errors.push("Last-question Quiz guard did not preserve the submitted answer and score.");
        if (document.querySelector("#action-button").textContent !== "Next Unanswered" || document.querySelector("#action-button").dataset.action !== "next-unanswered") errors.push("Last Quiz question did not offer Next Unanswered while questions remained unanswered.");
        document.querySelector("#action-button").click();
        await pause();
        if (visible(document.querySelector("#results-screen"))) errors.push("Quiz opened results while questions remained unanswered.");
        assertProgress(2, categoryQuestions.length, "Quiz Next Unanswered");
        if (document.querySelector("#score-text").textContent !== "Score: " + completionGuardScore) errors.push("Next Unanswered changed the Quiz score.");

        await jumpByEnter(lastQuizNumber);
        if (document.querySelector("#question-text").dataset.questionId !== lastQuizId) errors.push("Quiz guard jump did not restore the submitted last question.");
        if (JSON.stringify(renderedOptionTexts()) !== lastQuizOptionOrder) errors.push("Quiz guard jump changed the submitted last-question option order.");
        const restoredLastCorrectButton = document.querySelector('[data-option-index="' + lastQuizCorrectIndex + '"]');
        if (!restoredLastCorrectButton || !restoredLastCorrectButton.disabled || !restoredLastCorrectButton.classList.contains("is-correct")) errors.push("Quiz guard jump did not restore the submitted last answer.");
        if (document.querySelector("#feedback-title").textContent !== "Correct!" || document.querySelector("#score-text").textContent !== "Score: " + completionGuardScore) errors.push("Quiz guard jump changed the submitted feedback or score.");
        await jumpByChange(1);
      }

      document.querySelector("#action-button").click();
      await pause();
      assertProgress(2, categoryQuestions.length, "Quiz Next");
      question = findCurrent();
      const secondQuizId = question.id;
      const secondQuizOptions = JSON.stringify(renderedOptionTexts());
      if (document.querySelector("#previous-button").disabled) errors.push("Previous stayed disabled after advancing in Quiz mode.");
      document.querySelector("#previous-button").click();
      await pause();
      assertProgress(1, categoryQuestions.length, "Quiz Previous");
      if (document.querySelector("#question-text").dataset.questionId !== quizOrder[0]) errors.push("Previous restored the wrong Quiz question.");
      if (JSON.stringify(renderedOptionTexts()) !== firstQuizOptionOrders[quizOrder[0]]) errors.push("Previous changed the restored Quiz option order.");
      const restoredWrongButton = document.querySelector('[data-option-index="' + wrongIndex + '"]');
      if (!restoredWrongButton || !restoredWrongButton.disabled || !restoredWrongButton.classList.contains("is-incorrect")) errors.push("Previous did not restore the submitted Quiz answer.");
      if (document.querySelector("#feedback-title").textContent !== "Incorrect" || document.querySelector("#score-text").textContent !== "Score: " + completionGuardScore) errors.push("Previous changed Quiz feedback or score.");
      if (!document.querySelector("#previous-button").disabled) errors.push("Previous was not disabled on the restored first Quiz question.");
      document.querySelector("#action-button").click();
      await pause();
      assertProgress(2, categoryQuestions.length, "Quiz return Next");
      question = findCurrent();
      if (question.id !== secondQuizId || JSON.stringify(renderedOptionTexts()) !== secondQuizOptions) errors.push("Next did not return to the same pending Quiz question after Previous.");
      quizOrder.push(question.id);
      renderedCorrectIndex = verifyQuizOptionShuffle(question);
      firstQuizOptionOrders[question.id] = JSON.stringify(renderedOptionTexts());
      if (!visible(document.querySelector("#question-urdu-block")) || document.querySelector("#question-text-urdu").textContent !== question.questionUrdu) errors.push("Urdu translation did not update with the next question.");
      document.querySelector('[data-option-index="' + renderedCorrectIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#feedback-title").textContent !== "Correct!") errors.push("Correct feedback failed.");
      if (!document.querySelector('[data-option-index="' + renderedCorrectIndex + '"]').classList.contains("is-correct")) errors.push("Shuffled correct option was not scored correctly.");

      document.querySelector("#action-button").click();
      await pause();
      while (!visible(document.querySelector("#results-screen"))) {
        question = findCurrent();
        if (!question) {
          errors.push("Could not match a later question.");
          break;
        }
        quizOrder.push(question.id);
        renderedCorrectIndex = verifyQuizOptionShuffle(question);
        firstQuizOptionOrders[question.id] = JSON.stringify(renderedOptionTexts());
        document.querySelector('[data-option-index="' + renderedCorrectIndex + '"]').click();
        document.querySelector("#action-button").click();
        document.querySelector("#action-button").click();
        await pause();
      }

      const expectedScore = categoryQuestions.length - 1;
      if (document.querySelector("#result-score").textContent.replace(/\\s/g, "") !== expectedScore + "/" + categoryQuestions.length) {
        errors.push("Final score did not match the completed session.");
      }
      if (quizOrder.length !== categoryQuestions.length || new Set(quizOrder).size !== categoryQuestions.length) errors.push("Quiz source order lost or duplicated a question.");
      if (JSON.stringify(quizOrder) !== JSON.stringify(canonicalOrder)) errors.push("Quiz questions did not stay in source/data order.");
      if (JSON.stringify(quizOrder) !== JSON.stringify(learnOrder)) errors.push("Quiz question order did not match the previous Learn session.");
      const firstQuizScore = document.querySelector("#result-score").textContent;

      if (document.querySelector("#play-again-button").textContent !== "Practice Again") errors.push("Quiz completion did not offer Practice Again.");
      document.querySelector("#play-again-button").click();
      await pause();
      const repeatedQuizOrder = [];
      while (!visible(document.querySelector("#results-screen"))) {
        question = findCurrent();
        if (!question) {
          errors.push("Could not identify a Practice Again question.");
          break;
        }
        repeatedQuizOrder.push(question.id);
        renderedCorrectIndex = verifyQuizOptionShuffle(question);
        if (firstQuizOptionOrders[question.id] === JSON.stringify(renderedOptionTexts())) {
          errors.push("Practice Again reused the previous option order for " + question.id + ".");
        }
        document.querySelector('[data-option-index="' + renderedCorrectIndex + '"]').click();
        document.querySelector("#action-button").click();
        document.querySelector("#action-button").click();
        await pause();
      }
      if (repeatedQuizOrder.length !== categoryQuestions.length || new Set(repeatedQuizOrder).size !== categoryQuestions.length) errors.push("Practice Again lost or duplicated a question.");
      if (JSON.stringify(repeatedQuizOrder) !== JSON.stringify(canonicalOrder)
        || JSON.stringify(repeatedQuizOrder) !== JSON.stringify(quizOrder)) {
        errors.push("Practice Again did not keep the Quiz questions in canonical source order.");
      }

      const sessionStorageKey = "ppsc-prep:active-session:v1";
      if (localStorage.getItem(sessionStorageKey) !== null) errors.push("Completed Quiz session was not cleared from resume storage.");
      document.querySelector("#change-category-button").click();
      categoryButton.click();
      await startModeWithRange("#quiz-mode-button");
      const resumeQuestion = findCurrent();
      const resumeCorrectIndex = correctRenderedIndex(resumeQuestion);
      const resumeSelectedIndex = (resumeCorrectIndex + 1) % 4;
      document.querySelector('[data-option-index="' + resumeSelectedIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      const resumeSnapshot = JSON.parse(localStorage.getItem(sessionStorageKey) || "null");
      if (!resumeSnapshot || resumeSnapshot.version !== 8) errors.push("Active Quiz was not saved with the v8 resume schema.");
      if (!resumeSnapshot || resumeSnapshot.sessionKind !== "category" || resumeSnapshot.paperCategoryIds !== null || resumeSnapshot.computerSourceScope !== "all") errors.push("Saved Quiz did not use the v8 category-session fields.");
      if (!resumeSnapshot || resumeSnapshot.mode !== "quiz" || resumeSnapshot.scope !== "all") errors.push("Saved Quiz resume mode/scope was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.partIndex !== null || resumeSnapshot.importantOnly !== false) errors.push("Saved Quiz full-category/Important scope was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.rangeStart !== 1 || resumeSnapshot.rangeEnd !== categoryQuestions.length || resumeSnapshot.rangePoolSize !== categoryQuestions.length) errors.push("Saved Quiz did not preserve its exact full-range metadata.");
      if (!resumeSnapshot || JSON.stringify(resumeSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(categoryQuestions.map((question) => String(question.id)))) errors.push("Saved Quiz did not preserve its complete eligible-pool order.");
      if (!resumeSnapshot || JSON.stringify(resumeSnapshot.questionIds || []) !== JSON.stringify(canonicalOrder)) errors.push("Saved Quiz did not preserve the complete canonical question order.");
      if (!resumeSnapshot || !Array.isArray(resumeSnapshot.optionOrders) || resumeSnapshot.optionOrders.length !== categoryQuestions.length) errors.push("Saved Quiz option orders were incomplete.");
      if (!resumeSnapshot || !Array.isArray(resumeSnapshot.answerHistory) || resumeSnapshot.answerHistory.length !== categoryQuestions.length) errors.push("Saved Quiz answer history was incomplete.");
      if (!resumeSnapshot || !resumeSnapshot.submitted || resumeSnapshot.selectedIndex !== resumeSelectedIndex || resumeSnapshot.score !== 0) errors.push("Saved submitted-answer state was incorrect.");

      // The resume assertions below test only session restoration. A finite
      // review left overdue at the end of the preceding long Quiz can
      // legitimately open on this session's next transition, so isolate the
      // saved-session fixture before the page reload.
      localStorage.removeItem("ppsc-prep:retry-queue:v1");

      return {
        errors,
        categoryCards: document.querySelectorAll("#category-grid .category-card").length,
        gkStudyNotes: notesData && Array.isArray(notesData.notes) ? notesData.notes.length : 0,
        totalQuestions: data.questions.length,
        testedCategory: activeCategory,
        testedCategoryQuestions: categoryQuestions.length,
        markedQuestionIds,
        learnedInSourceOrder: JSON.stringify(learnOrder) === JSON.stringify(canonicalOrder),
        quizInSourceOrder: JSON.stringify(quizOrder) === JSON.stringify(canonicalOrder),
        practiceAgainInSourceOrder: JSON.stringify(repeatedQuizOrder) === JSON.stringify(canonicalOrder),
        firstQuizScore,
        repeatedQuizScore: document.querySelector("#result-score").textContent,
        resumeExpected: {
          categoryId: activeCategory,
          categoryName: data.categories.find((category) => category.id === activeCategory).name,
          questionCount: categoryQuestions.length,
          bankSignature: resumeSnapshot ? resumeSnapshot.bankSignature : "",
          questionIds: resumeSnapshot ? resumeSnapshot.questionIds : [],
          optionOrders: resumeSnapshot ? resumeSnapshot.optionOrders : [],
          questionId: resumeQuestion ? resumeQuestion.id : "",
          optionTexts: renderedOptionTexts(),
          selectedIndex: resumeSelectedIndex,
          score: 0,
          rangeStart: resumeSnapshot ? resumeSnapshot.rangeStart : 0,
          rangeEnd: resumeSnapshot ? resumeSnapshot.rangeEnd : 0,
          rangePoolSize: resumeSnapshot ? resumeSnapshot.rangePoolSize : 0,
          rangePoolQuestionIds: resumeSnapshot ? resumeSnapshot.rangePoolQuestionIds : [],
          rangeQuestionIds: resumeSnapshot ? resumeSnapshot.rangeQuestionIds : []
        },
        legacyV6Snapshot: resumeSnapshot ? (() => {
          const legacy = JSON.parse(JSON.stringify(resumeSnapshot));
          legacy.version = 6;
          delete legacy.computerSourceScope;
          delete legacy.rangeStart;
          delete legacy.rangeEnd;
          delete legacy.rangePoolSize;
          delete legacy.rangePoolQuestionIds;
          delete legacy.rangeQuestionIds;
          return legacy;
        })() : null,
        sourceNotesAvailable: data.questions.filter((item) => item.sourceNotes).length
      };
    })()`);

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: true
    });
    const quickNotes320Result = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      document.querySelector("#back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await pause();
      document.querySelector("#study-notes-mode-button")?.click();
      await pause();
      const firstRow = document.querySelector("#quick-notes-list .quick-note-row");
      if (!visible(document.querySelector("#quick-notes-screen")) || !firstRow) errors.push("Quick Notes did not render at the 320px viewport.");
      if (document.documentElement.scrollWidth > window.innerWidth || (firstRow && firstRow.getBoundingClientRect().right > window.innerWidth + 1)) {
        errors.push("Quick Notes has horizontal overflow at 320px.");
      }
      document.querySelector("#quick-notes-back-button")?.click();
      await pause();
      document.querySelector("#detailed-learning-mode-button")?.click();
      await pause();
      const detailedList = document.querySelector("#detailed-learning-list");
      const firstDetailedPanel = detailedList ? [...detailedList.children].find(visible) : null;
      if (!visible(document.querySelector("#detailed-learning-screen")) || !firstDetailedPanel) {
        errors.push("Detailed Learning did not render at the 320px viewport.");
      }
      if (document.documentElement.scrollWidth > window.innerWidth
        || (firstDetailedPanel && firstDetailedPanel.getBoundingClientRect().right > window.innerWidth + 1)) {
        errors.push("Detailed Learning has horizontal overflow at 320px.");
      }
      document.querySelector("#detailed-learning-back-button")?.click();
      await pause();
      document.querySelector("#mode-back-button")?.click();
      await pause();
      return { errors };
    })()`);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload in time."));
        }
      }, 50);
    })`);

    const resumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(normalResult.resumeExpected)};
      const storageKey = "ppsc-prep:active-session:v1";
      const card = document.querySelector("#continue-session-card");
      if (!visible(document.querySelector("#category-screen"))) errors.push("Reload did not return to the category screen before Continue.");
      if (!visible(card)) errors.push("Continue card was not shown for an active saved session.");
      if (!document.querySelector("#continue-session-title").textContent.includes(expected.categoryName)) errors.push("Continue card did not label the saved category.");
      const continueMeta = document.querySelector("#continue-session-meta").textContent;
      if (!continueMeta.includes("Quiz") || !continueMeta.includes("All Questions")
        || !continueMeta.includes("Questions " + expected.rangeStart + "–" + expected.rangeEnd + " of " + expected.rangePoolSize)
        || !continueMeta.includes("Question 1 of " + expected.questionCount)) errors.push("Continue card did not label Quiz mode, exact range and progress.");

      const storedBeforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!storedBeforeContinue || storedBeforeContinue.version !== 8 || storedBeforeContinue.computerSourceScope !== "all"
        || storedBeforeContinue.rangeStart !== expected.rangeStart
        || storedBeforeContinue.rangeEnd !== expected.rangeEnd
        || storedBeforeContinue.rangePoolSize !== expected.rangePoolSize
        || JSON.stringify(storedBeforeContinue.rangePoolQuestionIds || []) !== JSON.stringify(expected.rangePoolQuestionIds)
        || JSON.stringify(storedBeforeContinue.rangeQuestionIds || []) !== JSON.stringify(expected.rangeQuestionIds)) errors.push("Reload changed the saved v8 range metadata.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.questionIds) !== JSON.stringify(expected.questionIds)) errors.push("Reload changed the saved Quiz question order.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.optionOrders) !== JSON.stringify(expected.optionOrders)) errors.push("Reload changed the saved Quiz option orders.");

      document.querySelector("#continue-session-button").click();
      await pause();
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Continue did not reopen the Quiz screen.");
      if (document.querySelector("#quiz-screen").dataset.mode !== "quiz" || document.querySelector("#quiz-screen").dataset.scope !== "all") errors.push("Continue restored the wrong mode/scope.");
      if (!document.querySelector("#quiz-category").textContent.includes(expected.categoryName + " · Quiz")) errors.push("Restored Quiz header did not label category and mode.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.questionId) errors.push("Continue restored the wrong question.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.optionTexts)) errors.push("Continue changed the current Quiz option order.");
      const selectedButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!selectedButton || !selectedButton.classList.contains("is-selected") || !selectedButton.classList.contains("is-incorrect") || !selectedButton.disabled) errors.push("Continue did not restore the submitted selected option.");
      if (document.querySelector("#feedback-title").textContent !== "Incorrect") errors.push("Continue did not restore submitted feedback.");
      if (document.querySelector("#score-text").textContent !== "Score: " + expected.score) errors.push("Continue did not restore the Quiz score.");
      const restoredNumberInput = document.querySelector("#question-number-input");
      const restoredTotal = document.querySelector("#question-total");
      if (!restoredNumberInput || restoredNumberInput.value !== "1" || restoredNumberInput.max !== String(expected.questionCount) || !restoredTotal || restoredTotal.textContent.trim() !== String(expected.questionCount)) errors.push("Continue did not restore the question progress controls.");

      document.querySelector("#action-button").click();
      await pause();
      const pendingQuestionId = document.querySelector("#question-text").dataset.questionId;
      const pendingOptionTexts = renderedOptionTexts();
      const pendingSelectedIndex = 2;
      document.querySelector('[data-option-index="' + pendingSelectedIndex + '"]').click();
      await pause();
      const pendingSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!pendingSnapshot || pendingSnapshot.currentIndex !== 1 || pendingSnapshot.submitted || pendingSnapshot.selectedIndex !== pendingSelectedIndex) errors.push("Unsubmitted selected option was not saved for Continue.");
      if (!pendingSnapshot || pendingSnapshot.rangeStart !== expected.rangeStart || pendingSnapshot.rangeEnd !== expected.rangeEnd || pendingSnapshot.rangePoolSize !== expected.rangePoolSize
        || JSON.stringify(pendingSnapshot.rangePoolQuestionIds || []) !== JSON.stringify(expected.rangePoolQuestionIds)
        || JSON.stringify(pendingSnapshot.rangeQuestionIds || []) !== JSON.stringify(expected.rangeQuestionIds)) errors.push("Pending selection changed the saved range metadata.");

      return {
        errors,
        pending: {
          categoryName: expected.categoryName,
          questionCount: expected.questionCount,
          questionId: pendingQuestionId,
          optionTexts: pendingOptionTexts,
          selectedIndex: pendingSelectedIndex,
          score: expected.score,
          rangeStart: expected.rangeStart,
          rangeEnd: expected.rangeEnd,
          rangePoolSize: expected.rangePoolSize,
          rangePoolQuestionIds: expected.rangePoolQuestionIds,
          rangeQuestionIds: expected.rangeQuestionIds
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for pending-selection resume in time."));
        }
      }, 50);
    })`);

    const pendingResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(resumeResult.pending)};
      const meta = document.querySelector("#continue-session-meta").textContent;
      if (!visible(document.querySelector("#continue-session-card")) || !meta.includes("Question 2 of " + expected.questionCount)
        || !meta.includes("Questions " + expected.rangeStart + "–" + expected.rangeEnd + " of " + expected.rangePoolSize)) errors.push("Continue card did not show the pending question index and exact range.");
      document.querySelector("#continue-session-button").click();
      await pause();
      const renderedOptionTexts = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      if (document.querySelector("#question-text").dataset.questionId !== expected.questionId) errors.push("Pending Continue restored the wrong question.");
      if (JSON.stringify(renderedOptionTexts) !== JSON.stringify(expected.optionTexts)) errors.push("Pending Continue changed the option order.");
      const selectedButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!selectedButton || !selectedButton.classList.contains("is-selected") || selectedButton.disabled) errors.push("Pending Continue did not restore the unsubmitted selection.");
      if (visible(document.querySelector("#feedback"))) errors.push("Pending Continue incorrectly restored submitted feedback.");
      if (document.querySelector("#action-button").textContent !== "Check Answer") errors.push("Pending Continue did not restore Check Answer state.");
      if (document.querySelector("#score-text").textContent !== "Score: " + expected.score) errors.push("Pending Continue changed the score.");
      const pendingNumberInput = document.querySelector("#question-number-input");
      const pendingTotal = document.querySelector("#question-total");
      if (!pendingNumberInput || pendingNumberInput.value !== "2" || pendingNumberInput.max !== String(expected.questionCount) || !pendingTotal || pendingTotal.textContent.trim() !== String(expected.questionCount)) errors.push("Pending Continue did not restore the question progress controls.");

      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.setItem("ppsc-prep:active-session:v1", "{corrupt-json");
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not recover from corrupt resume data in time."));
        }
      }, 50);
    })`);

    const legacyV6SeedResult = await client.evaluate(`(() => {
      const errors = [];
      const storageKey = "ppsc-prep:active-session:v1";
      const legacySnapshot = ${JSON.stringify(normalResult.legacyV6Snapshot)};
      const card = document.querySelector("#continue-session-card");
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      if (visible(card) || localStorage.getItem(storageKey) !== null) errors.push("Corrupt resume data was not cleared before the v6 migration test.");
      if (!legacySnapshot || legacySnapshot.version !== 6) {
        errors.push("Could not construct a valid v6 full-session migration fixture.");
      } else {
        localStorage.setItem(storageKey, JSON.stringify(legacySnapshot));
      }
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not load the valid v6 migration fixture in time."));
        }
      }, 50);
    })`);

    const legacyV6MigrationResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const storageKey = "ppsc-prep:active-session:v1";
      const expected = ${JSON.stringify(normalResult.resumeExpected)};
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      if (!visible(document.querySelector("#continue-session-card"))) errors.push("A valid v6 full session was rejected instead of offered for migration.");
      const beforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!beforeContinue || beforeContinue.version !== 6) errors.push("The v6 fixture changed before Continue was used.");
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const migrated = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!visible(document.querySelector("#quiz-screen")) || !migrated || migrated.version !== 8 || migrated.computerSourceScope !== "all") errors.push("Continue did not migrate the valid v6 full session to v8/all source scope.");
      if (!migrated || migrated.rangeStart !== 1 || migrated.rangeEnd !== expected.questionCount
        || migrated.rangePoolSize !== expected.questionCount
        || JSON.stringify(migrated.rangePoolQuestionIds || []) !== JSON.stringify(expected.rangePoolQuestionIds)
        || JSON.stringify(migrated.rangeQuestionIds || []) !== JSON.stringify(expected.rangeQuestionIds)
        || JSON.stringify(migrated.questionIds || []) !== JSON.stringify(expected.rangeQuestionIds)) {
        errors.push("The migrated v6 session did not receive complete full-range metadata, all source scope, and canonical Quiz order.");
      }
      document.querySelector("#back-button")?.click();
      await pause();
      localStorage.removeItem(storageKey);
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not clear the migrated v6 test state in time."));
        }
      }, 50);
    })`);

    const positionGuardSetupResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      const startFullRange = async (selector) => {
        document.querySelector(selector)?.click();
        await pause();
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput || !visible(document.querySelector("#question-range-options"))) {
          errors.push(selector + " did not open a full-range selector.");
          return;
        }
        startInput.value = "1";
        endInput.value = endInput.max;
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      };
      if (visible(document.querySelector("#continue-session-card"))) errors.push("Corrupt resume data left the Continue card visible.");
      if (localStorage.getItem(storageKey) !== null) errors.push("Corrupt resume data was not removed safely.");
      const data = window.PPSC_QUIZ_DATA;
      const sensitiveIds = ${JSON.stringify(positionSensitiveQuestionIds)};
      const sensitiveIdSet = new Set(sensitiveIds);
      const canonicalOrder = JSON.stringify([0, 1, 2, 3]);
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const missingSensitiveIds = sensitiveIds.filter((questionId) => !questionById.has(questionId));
      if (sensitiveIds.length !== 25 || new Set(sensitiveIds).size !== 25) errors.push("The positional-option regression list must contain exactly 25 unique IDs.");
      if (missingSensitiveIds.length) errors.push("Known positional-option questions are missing: " + missingSensitiveIds.join(", ") + ".");

      const sensitiveCategoryIds = [...new Set(sensitiveIds.map((questionId) => {
        const question = questionById.get(questionId);
        return question ? question.categoryId : null;
      }).filter(Boolean))];
      const verifiedSensitiveIds = new Set();
      let normalOptionOrderShuffled = false;
      let malformedSnapshot = null;
      let malformedQuestionId = "";

      for (const categoryId of sensitiveCategoryIds) {
        const categoryButton = document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]');
        if (!categoryButton) {
          errors.push("Could not open the positional-option category " + categoryId + ".");
          continue;
        }
        categoryButton.click();
        await startFullRange("#quiz-mode-button");

        const snapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (!snapshot || snapshot.version !== 8 || snapshot.computerSourceScope !== "all" || snapshot.sessionKind !== "category" || snapshot.categoryId !== categoryId || snapshot.mode !== "quiz") {
          errors.push("Positional-option audit did not create a valid v8 Quiz snapshot for " + categoryId + ".");
        } else {
          const expectedQuestionIds = data.questions
            .filter((question) => question.categoryId === categoryId)
            .map((question) => String(question.id));
          if (JSON.stringify(snapshot.questionIds) !== JSON.stringify(expectedQuestionIds)) {
            errors.push("Positional-option Quiz did not keep " + categoryId + " in canonical source order.");
          }
          const idsInCategory = sensitiveIds.filter((questionId) => {
            const question = questionById.get(questionId);
            return question && question.categoryId === categoryId;
          });
          idsInCategory.forEach((questionId) => {
            const questionIndex = snapshot.questionIds.indexOf(questionId);
            if (questionIndex < 0) {
              errors.push("Quiz snapshot omitted known positional-option question " + questionId + ".");
              return;
            }
            if (JSON.stringify(snapshot.optionOrders[questionIndex]) !== canonicalOrder) {
              errors.push("Quiz shuffled the positional-option answers for " + questionId + ".");
              return;
            }
            verifiedSensitiveIds.add(questionId);
          });

          if (snapshot.questionIds.some((questionId, index) => (
            !sensitiveIdSet.has(questionId)
            && JSON.stringify(snapshot.optionOrders[index]) !== canonicalOrder
          ))) normalOptionOrderShuffled = true;

          if (!malformedSnapshot && idsInCategory.length) {
            malformedSnapshot = JSON.parse(JSON.stringify(snapshot));
            malformedQuestionId = idsInCategory[0];
            const malformedIndex = malformedSnapshot.questionIds.indexOf(malformedQuestionId);
            malformedSnapshot.optionOrders[malformedIndex] = [1, 0, 2, 3];
          }
        }

        document.querySelector("#back-button").click();
        await pause();
      }

      if (verifiedSensitiveIds.size !== sensitiveIds.length) {
        errors.push("Only " + verifiedSensitiveIds.size + " of 25 positional-option questions kept canonical answer order.");
      }
      if (!normalOptionOrderShuffled) errors.push("Ordinary Quiz options did not remain shuffled during the positional-option audit.");
      if (!malformedSnapshot || !malformedQuestionId) {
        errors.push("Could not construct a malformed v8 positional-option snapshot.");
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(malformedSnapshot));
      }

      return {
        errors,
        verifiedSensitiveCount: verifiedSensitiveIds.size,
        normalOptionOrderShuffled,
        malformedQuestionId
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reject a malformed positional-option resume snapshot in time."));
        }
      }, 50);
    })`);

    const positionGuardRecoveryResult = await client.evaluate(`(() => {
      const errors = [];
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      if (visible(document.querySelector("#continue-session-card"))) errors.push("Malformed v8 positional-option data left the Continue card visible.");
      if (localStorage.getItem(storageKey) !== null) errors.push("Malformed v8 positional-option data was not rejected and removed.");
      const tamperedRangeSnapshot = ${JSON.stringify(normalResult.legacyV6Snapshot)};
      const expectedRange = ${JSON.stringify(normalResult.resumeExpected)};
      if (!tamperedRangeSnapshot || expectedRange.rangePoolQuestionIds.length < 2) {
        errors.push("Could not construct the v8 eligible-pool tamper fixture.");
      } else {
        tamperedRangeSnapshot.version = 8;
        tamperedRangeSnapshot.computerSourceScope = "all";
        tamperedRangeSnapshot.rangeStart = expectedRange.rangeStart;
        tamperedRangeSnapshot.rangeEnd = expectedRange.rangeEnd;
        tamperedRangeSnapshot.rangePoolSize = expectedRange.rangePoolSize;
        tamperedRangeSnapshot.rangePoolQuestionIds = expectedRange.rangePoolQuestionIds.slice();
        tamperedRangeSnapshot.rangeQuestionIds = expectedRange.rangeQuestionIds.slice();
        const firstPoolId = tamperedRangeSnapshot.rangePoolQuestionIds[0];
        tamperedRangeSnapshot.rangePoolQuestionIds[0] = tamperedRangeSnapshot.rangePoolQuestionIds[1];
        tamperedRangeSnapshot.rangePoolQuestionIds[1] = firstPoolId;
        localStorage.setItem(storageKey, JSON.stringify(tamperedRangeSnapshot));
      }
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reject a tampered v8 eligible range pool in time."));
        }
      }, 50);
    })`);

    const rangePoolGuardRecoveryResult = await client.evaluate(`(() => {
      const errors = [];
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      if (visible(document.querySelector("#continue-session-card"))) errors.push("A tampered v8 eligible range pool left Continue visible.");
      if (localStorage.getItem(storageKey) !== null) errors.push("A tampered v8 eligible range pool was not rejected and removed.");
      const permutedQuestionSnapshot = ${JSON.stringify(normalResult.legacyV6Snapshot)};
      const expectedRange = ${JSON.stringify(normalResult.resumeExpected)};
      if (!permutedQuestionSnapshot || expectedRange.rangeQuestionIds.length < 2) {
        errors.push("Could not construct the v8 category question-order tamper fixture.");
      } else {
        permutedQuestionSnapshot.version = 8;
        permutedQuestionSnapshot.computerSourceScope = "all";
        permutedQuestionSnapshot.rangeStart = expectedRange.rangeStart;
        permutedQuestionSnapshot.rangeEnd = expectedRange.rangeEnd;
        permutedQuestionSnapshot.rangePoolSize = expectedRange.rangePoolSize;
        permutedQuestionSnapshot.rangePoolQuestionIds = expectedRange.rangePoolQuestionIds.slice();
        permutedQuestionSnapshot.rangeQuestionIds = expectedRange.rangeQuestionIds.slice();
        permutedQuestionSnapshot.answerHistory = new Array(permutedQuestionSnapshot.questionIds.length).fill(null);
        permutedQuestionSnapshot.currentIndex = 0;
        permutedQuestionSnapshot.selectedIndex = null;
        permutedQuestionSnapshot.submitted = false;
        permutedQuestionSnapshot.score = 0;
        [permutedQuestionSnapshot.questionIds, permutedQuestionSnapshot.optionOrders].forEach((items) => {
          const firstItem = items[0];
          items[0] = items[1];
          items[1] = firstItem;
        });
        localStorage.setItem(storageKey, JSON.stringify(permutedQuestionSnapshot));
      }
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reject a permuted v8 category Quiz order in time."));
        }
      }, 50);
    })`);

    const questionOrderGuardRecoveryResult = await client.evaluate(`(() => {
      const errors = [];
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      if (visible(document.querySelector("#continue-session-card"))) errors.push("A permuted v8 category Quiz order left Continue visible.");
      if (localStorage.getItem(storageKey) !== null) errors.push("A permuted v8 category Quiz order was not rejected and removed.");
      localStorage.setItem(storageKey, JSON.stringify({
        version: 3,
        bankSignature: ${JSON.stringify(normalResult.resumeExpected.bankSignature)},
        categoryId: ${JSON.stringify(normalResult.testedCategory)},
        mode: "quiz",
        scope: "all",
        partIndex: 0,
        importantOnly: false,
        questionIds: [${JSON.stringify(normalResult.resumeExpected.questionId)}],
        optionOrders: [[0, 1, 2, 3]],
        answerHistory: [null],
        currentIndex: 0,
        selectedIndex: null,
        submitted: false,
        score: 0,
        savedAt: Date.now()
      }));
      return { errors };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not recover from stale resume data in time."));
        }
      }, 50);
    })`);

    const difficultResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const expectedCategoryId = ${JSON.stringify(normalResult.testedCategory)};
      const expectedMarkedIds = ${JSON.stringify(normalResult.markedQuestionIds)};
      const categoryQuestions = data.questions.filter((question) => question.categoryId === expectedCategoryId);
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const findCurrent = () => {
        const questionId = document.querySelector("#question-text").dataset.questionId;
        return categoryQuestions.find((question) => question.id === questionId);
      };
      const correctRenderedIndex = (question) => renderedOptionTexts().indexOf(
        displayOptions(question)[question.correctOptionIndex]
      );
      const progressMatches = (number, total) => {
        const input = document.querySelector("#question-number-input");
        const totalElement = document.querySelector("#question-total");
        return Boolean(
          input && totalElement &&
          input.value === String(number) && input.min === "1" &&
          input.max === String(total) && input.step === "1" &&
          totalElement.textContent.trim() === String(total)
        );
      };
      const startDifficultRange = async (start, end) => {
        document.querySelector("#difficult-learn-button")?.click();
        await pause();
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput || !visible(document.querySelector("#question-range-options"))) {
          errors.push("Difficult Learn did not open its range selector.");
          return;
        }
        startInput.value = String(start);
        endInput.value = String(end);
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      };

      if (visible(document.querySelector("#continue-session-card"))) errors.push("Legacy Part resume data left the Continue card visible.");
      if (localStorage.getItem("ppsc-prep:active-session:v1") !== null) errors.push("Legacy Part resume data was not removed safely.");

      const storedAfterReload = JSON.parse(localStorage.getItem("ppsc-prep:difficult-question-ids:v1") || "{}");
      if (!Array.isArray(storedAfterReload.questionIds) || expectedMarkedIds.some((id) => !storedAfterReload.questionIds.includes(id))) {
        errors.push("Difficult marks did not survive a page reload.");
      }

      const categoryButton = [...document.querySelectorAll("#category-grid .category-card")]
        .find((button) => (button.dataset.category || button.dataset.categoryId) === expectedCategoryId);
      categoryButton.click();
      document.querySelector("#difficult-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#difficult-mode-options"))) errors.push("Reloaded Difficult chooser did not open.");
      if (document.querySelector("#difficult-count").textContent.trim() !== String(expectedMarkedIds.length)) errors.push("Reloaded Difficult count was incorrect.");
      if (visible(document.querySelector("#difficult-empty"))) errors.push("Difficult empty state remained visible with saved questions.");
      if (document.querySelector("#difficult-learn-button").disabled || document.querySelector("#difficult-quiz-button").disabled) errors.push("Saved Difficult Learn/Quiz actions were disabled.");

      await startDifficultRange(1, 1);
      const oneDifficultSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!visible(document.querySelector("#quiz-screen")) || !progressMatches(1, 1)
        || document.querySelector("#question-text")?.dataset.questionId !== expectedMarkedIds[0]
        || oneDifficultSnapshot?.rangeStart !== 1 || oneDifficultSnapshot?.rangeEnd !== 1
        || oneDifficultSnapshot?.rangePoolSize !== expectedMarkedIds.length
        || JSON.stringify(oneDifficultSnapshot?.rangePoolQuestionIds || []) !== JSON.stringify(expectedMarkedIds)
        || JSON.stringify(oneDifficultSnapshot?.rangeQuestionIds || []) !== JSON.stringify([expectedMarkedIds[0]])) {
        errors.push("Difficult range 1–1 did not select exactly the first marked question.");
      }
      document.querySelector("#back-button")?.click();
      await pause();
      categoryButton.click();
      document.querySelector("#difficult-mode-button")?.click();
      await pause();
      await startDifficultRange(1, expectedMarkedIds.length);
      if (document.querySelector("#quiz-screen").dataset.scope !== "difficult") errors.push("Difficult Learn did not retain difficult scope.");
      if (document.querySelector("#quiz-screen").dataset.mode !== "learn") errors.push("Difficult Learn did not enter Learn mode.");
      if (!progressMatches(1, expectedMarkedIds.length)) errors.push("Difficult Learn progress did not match marked questions.");

      const difficultLearnIds = [];
      while (!visible(document.querySelector("#results-screen"))) {
        const question = findCurrent();
        if (!question) {
          errors.push("Could not identify a Difficult Learn question.");
          break;
        }
        difficultLearnIds.push(question.id);
        const checkbox = document.querySelector("#difficult-checkbox");
        if (!visible(document.querySelector("#difficult-control")) || !checkbox.checked) errors.push("Marked Difficult Learn question was not checked.");
        if (checkbox.dataset.questionId !== question.id) errors.push("Difficult Learn checkbox targeted the wrong question.");
        const hiddenOptions = [...document.querySelectorAll("#options-container .option-button")];
        if (document.querySelector("#action-button")?.textContent !== "Show Answer"
          || hiddenOptions.some((button) => !button.disabled || button.classList.contains("is-correct"))) {
          errors.push("Difficult Learn did not start its question in the hidden-answer phase.");
        }
        document.querySelector("#action-button").click();
        await pause();
        if (document.querySelector("#question-text")?.dataset.questionId !== question.id
          || !document.querySelector('[data-option-index="' + correctRenderedIndex(question) + '"]')?.classList.contains("is-correct")) {
          errors.push("Difficult Learn first action did not reveal the current correct answer in place.");
        }
        document.querySelector("#action-button").click();
        await pause();
      }
      if (JSON.stringify(difficultLearnIds) !== JSON.stringify(expectedMarkedIds)) {
        errors.push("Difficult Learn did not use the marked questions in canonical source order.");
      }
      if (document.querySelector("#results-title").textContent !== "Difficult learning complete!") errors.push("Difficult Learn completion copy was incorrect.");
      if (document.querySelector("#play-again-button").textContent !== "Start Quiz" || document.querySelector("#play-again-button").disabled) errors.push("Difficult Learn did not offer Start Quiz.");

      document.querySelector("#play-again-button").click();
      await pause();
      if (document.querySelector("#quiz-screen").dataset.scope !== "difficult" || document.querySelector("#quiz-screen").dataset.mode !== "quiz") errors.push("Start Quiz left Difficult scope.");
      if (!progressMatches(1, expectedMarkedIds.length)) errors.push("Difficult Quiz progress did not match both marked questions.");

      const difficultQuizIds = [];
      const difficultQuizOptionOrders = Object.create(null);
      let removedId = "";
      while (!visible(document.querySelector("#results-screen"))) {
        const quizQuestion = findCurrent();
        if (!quizQuestion || !expectedMarkedIds.includes(quizQuestion.id)) {
          errors.push("Difficult Quiz rendered an unmarked question.");
          break;
        }
        difficultQuizIds.push(quizQuestion.id);
        const renderedOrder = JSON.stringify(renderedOptionTexts());
        difficultQuizOptionOrders[quizQuestion.id] = renderedOrder;
        if (renderedOrder === JSON.stringify(displayOptions(quizQuestion))) errors.push("Difficult Quiz options were not shuffled.");
        const correctIndex = correctRenderedIndex(quizQuestion);
        document.querySelector('[data-option-index="' + correctIndex + '"]').click();
        document.querySelector("#action-button").click();
        await pause();
        if (document.querySelector("#feedback-title").textContent !== "Correct!") errors.push("Difficult Quiz correct answer remapping failed.");
        if (!removedId) {
          const checkbox = document.querySelector("#difficult-checkbox");
          if (!visible(document.querySelector("#difficult-control")) || !checkbox.checked) errors.push("Difficult marker was not available on the Difficult Quiz question.");
          removedId = quizQuestion.id;
          checkbox.click();
          await pause();
          if (checkbox.checked) errors.push("Difficult Quiz question could not be unmarked.");
        }
        document.querySelector("#action-button").click();
        await pause();
      }
      if (JSON.stringify(difficultQuizIds) !== JSON.stringify(expectedMarkedIds)
        || JSON.stringify(difficultQuizIds) !== JSON.stringify(difficultLearnIds)) {
        errors.push("Difficult Quiz did not keep the marked questions in canonical source order.");
      }
      if (document.querySelector("#result-score").textContent.replace(/\\s/g, "") !== expectedMarkedIds.length + "/" + expectedMarkedIds.length) errors.push("Difficult Quiz score was incorrect.");
      if (document.querySelector("#play-again-button").textContent !== "Practice Again" || document.querySelector("#play-again-button").disabled) errors.push("Difficult Quiz did not offer Practice Again for the remaining mark.");

      const remainingId = expectedMarkedIds.find((id) => id !== removedId);
      document.querySelector("#play-again-button").click();
      await pause();
      const repeatedRangeStart = document.querySelector("#question-range-start-input");
      const repeatedRangeEnd = document.querySelector("#question-range-end-input");
      const changedDifficultRangeError = document.querySelector("#question-range-error");
      if (!visible(document.querySelector("#question-range-options")) || repeatedRangeStart?.value !== "1"
        || repeatedRangeEnd?.value !== "1" || repeatedRangeEnd?.max !== "1") {
        errors.push("Practice Again did not reopen a safe 1–1 range after the Difficult pool shrank.");
      } else if (!visible(changedDifficultRangeError) || !changedDifficultRangeError.textContent.includes("Difficult list changed")) {
        errors.push("Practice Again did not explain that the Difficult list changed before requiring a new range.");
      } else {
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      }
      if (!progressMatches(1, 1)) errors.push("Practice Again did not filter Difficult Quiz to the remaining mark.");
      const finalQuizQuestion = findCurrent();
      if (!finalQuizQuestion || finalQuizQuestion.id !== remainingId) errors.push("Repeated Difficult Quiz rendered the wrong question.");
      if (difficultQuizOptionOrders[remainingId] === JSON.stringify(renderedOptionTexts())) errors.push("Repeated Difficult Quiz reused the previous option order.");
      const finalCorrectIndex = correctRenderedIndex(finalQuizQuestion);
      document.querySelector('[data-option-index="' + finalCorrectIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      const finalCheckbox = document.querySelector("#difficult-checkbox");
      if (!visible(document.querySelector("#difficult-control")) || !finalCheckbox.checked) errors.push("Remaining Difficult marker was not available on the Difficult Quiz question.");
      finalCheckbox.click();
      await pause();
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#play-again-button").textContent !== "No Marked Questions" || !document.querySelector("#play-again-button").disabled) errors.push("All-unmarked Difficult result did not disable repeat practice.");

      document.querySelector("#change-category-button").click();
      await pause();
      categoryButton.click();
      document.querySelector("#difficult-mode-button").click();
      await pause();
      if (document.querySelector("#difficult-count").textContent.trim() !== "0") errors.push("Difficult count did not return to zero after unmarking all.");
      if (!visible(document.querySelector("#difficult-empty"))) errors.push("Difficult empty state did not return after unmarking all.");
      if (!document.querySelector("#difficult-learn-button").disabled || !document.querySelector("#difficult-quiz-button").disabled) errors.push("Empty Difficult actions were not disabled after unmarking all.");

      const finalStored = JSON.parse(localStorage.getItem("ppsc-prep:difficult-question-ids:v1") || "{}");
      if (!Array.isArray(finalStored.questionIds) || finalStored.questionIds.length !== 0) errors.push("Unmarked Difficult IDs remained in local storage.");

      return {
        errors,
        persistedAcrossReload: true,
        difficultLearnCount: difficultLearnIds.length,
        difficultQuizCount: difficultQuizIds.length,
        difficultQuizInSourceOrder: JSON.stringify(difficultQuizIds) === JSON.stringify(expectedMarkedIds),
        emptyStateRestored: visible(document.querySelector("#difficult-empty"))
      };
    })()`);

    const difficultResumeSeed = await client.evaluate(`(() => {
      const categoryId = ${JSON.stringify(normalResult.testedCategory)};
      const question = window.PPSC_QUIZ_DATA.questions.find((item) => item.categoryId === categoryId);
      localStorage.setItem("ppsc-prep:difficult-question-ids:v1", JSON.stringify({
        version: 1,
        questionIds: question ? [question.id] : []
      }));
      localStorage.setItem("ppsc-prep:active-session:v1", JSON.stringify({
        version: 6,
        bankSignature: "stale-question-bank",
        sessionKind: "category",
        categoryId,
        paperCategoryIds: null,
        mode: "learn",
        scope: "difficult",
        partIndex: null,
        importantOnly: false,
        questionIds: question ? [question.id] : [],
        optionOrders: [[0, 1, 2, 3]],
        answerHistory: [null],
        currentIndex: 0,
        selectedIndex: null,
        submitted: false,
        score: 0,
        savedAt: Date.now()
      }));
      return { categoryId, questionId: question ? question.id : "" };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Difficult Continue setup in time."));
        }
      }, 50);
    })`);

    const difficultResumeSetup = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const seed = ${JSON.stringify(difficultResumeSeed)};
      if (visible(document.querySelector("#continue-session-card"))) errors.push("Stale-bank resume data left the Continue card visible.");
      if (localStorage.getItem("ppsc-prep:active-session:v1") !== null) errors.push("Stale-bank resume data was not removed safely.");
      const categoryButton = [...document.querySelectorAll("#category-grid .category-card")]
        .find((button) => (button.dataset.category || button.dataset.categoryId) === seed.categoryId);
      categoryButton.click();
      document.querySelector("#difficult-mode-button").click();
      document.querySelector("#difficult-learn-button").click();
      await pause();
      const rangeStartInput = document.querySelector("#question-range-start-input");
      const rangeEndInput = document.querySelector("#question-range-end-input");
      if (!rangeStartInput || !rangeEndInput || !visible(document.querySelector("#question-range-options"))) {
        errors.push("Difficult Continue setup did not open its range selector.");
      } else {
        rangeStartInput.value = "1";
        rangeEndInput.value = "1";
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      }
      const hiddenSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      const hiddenOptions = [...document.querySelectorAll("#options-container .option-button")];
      if (!hiddenSnapshot || hiddenSnapshot.submitted !== false || hiddenSnapshot.selectedIndex !== null
        || hiddenSnapshot.learnVisitedQuestionIds.length !== 0
        || document.querySelector("#action-button")?.textContent !== "Show Answer"
        || hiddenOptions.some((button) => !button.disabled || button.classList.contains("is-correct"))) {
        errors.push("Difficult Learn resume fixture did not begin with a persisted hidden answer.");
      }
      document.querySelector("#action-button")?.click();
      await pause();
      const optionTexts = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!snapshot || snapshot.version !== 8 || snapshot.computerSourceScope !== "all" || snapshot.sessionKind !== "category" || snapshot.paperCategoryIds !== null || snapshot.partIndex !== null || snapshot.importantOnly !== false) errors.push("Difficult Learn was not stored with the v8 category-session resume schema.");
      if (!snapshot || snapshot.mode !== "learn" || snapshot.scope !== "difficult") errors.push("Difficult Learn was not stored with the correct resume scope/mode.");
      if (!snapshot || snapshot.questionIds.length !== 1 || snapshot.questionIds[0] !== seed.questionId) errors.push("Difficult Learn resume snapshot did not keep its marked-question scope.");
      if (!snapshot || snapshot.rangeStart !== 1 || snapshot.rangeEnd !== 1 || snapshot.rangePoolSize !== 1
        || JSON.stringify(snapshot.rangePoolQuestionIds || []) !== JSON.stringify([seed.questionId])
        || JSON.stringify(snapshot.rangeQuestionIds || []) !== JSON.stringify([seed.questionId])) errors.push("Difficult Learn resume snapshot did not keep its exact range and pool.");
      if (!snapshot || !snapshot.submitted || snapshot.score !== 0
        || !snapshot.learnVisitedQuestionIds.includes(seed.questionId)) {
        errors.push("Difficult Learn revealed resume answer state was incorrect.");
      }
      return {
        errors,
        expected: {
          questionId: seed.questionId,
          optionTexts,
          selectedIndex: snapshot ? snapshot.selectedIndex : -1
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Difficult Continue verification in time."));
        }
      }, 50);
    })`);

    const difficultResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(difficultResumeSetup.expected)};
      const meta = document.querySelector("#continue-session-meta").textContent;
      if (!visible(document.querySelector("#continue-session-card")) || !meta.includes("Difficult Learn") || !meta.includes("Question 1 of 1")) errors.push("Continue card did not label the Difficult Learn session.");
      document.querySelector("#continue-session-button").click();
      await pause();
      const optionTexts = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      if (document.querySelector("#quiz-screen").dataset.mode !== "learn" || document.querySelector("#quiz-screen").dataset.scope !== "difficult") errors.push("Continue did not restore Difficult Learn mode/scope.");
      if (!document.querySelector("#quiz-category").textContent.includes("Difficult Learn")) errors.push("Restored header did not label Difficult Learn.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.questionId) errors.push("Continue restored the wrong Difficult Learn question.");
      if (JSON.stringify(optionTexts) !== JSON.stringify(expected.optionTexts)) errors.push("Difficult Learn Continue changed source option order.");
      const numberInput = document.querySelector("#question-number-input");
      const questionTotal = document.querySelector("#question-total");
      if (!numberInput || numberInput.value !== "1" || numberInput.max !== "1" || !questionTotal || questionTotal.textContent.trim() !== "1") errors.push("Difficult Learn Continue did not restore its question progress controls.");
      const selectedButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!selectedButton || !selectedButton.disabled || !selectedButton.classList.contains("is-correct")) errors.push("Difficult Learn Continue did not restore the revealed answer.");
      document.querySelector("#action-button").click();
      await pause();
      if (!visible(document.querySelector("#results-screen"))) errors.push("Restored Difficult Learn session did not complete.");
      if (localStorage.getItem("ppsc-prep:active-session:v1") !== null) errors.push("Completed Difficult Learn session remained resumable.");
      localStorage.setItem("ppsc-prep:difficult-question-ids:v1", JSON.stringify({ version: 1, questionIds: [] }));
      return { errors };
    })()`);

    const learnResumeSetup = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const categoryId = ${JSON.stringify(normalResult.testedCategory)};
      document.querySelector("#change-category-button").click();
      await pause();
      const categoryButton = [...document.querySelectorAll("#category-grid .category-card")]
        .find((button) => (button.dataset.category || button.dataset.categoryId) === categoryId);
      categoryButton.click();
      document.querySelector("#learn-mode-button").click();
      await pause();
      const rangeStartInput = document.querySelector("#question-range-start-input");
      const rangeEndInput = document.querySelector("#question-range-end-input");
      if (!rangeStartInput || !rangeEndInput) {
        errors.push("Learn Continue setup did not open its range selector.");
      } else {
        rangeStartInput.value = "1";
        rangeEndInput.value = rangeEndInput.max;
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      }
      const total = Number(document.querySelector("#question-total").textContent);
      const numberInput = document.querySelector("#question-number-input");
      numberInput.value = String(total);
      numberInput.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
      const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      const visitedIds = snapshot && Array.isArray(snapshot.learnVisitedQuestionIds)
        ? snapshot.learnVisitedQuestionIds
        : [];
      const firstUnvisitedIndex = snapshot
        ? snapshot.questionIds.findIndex((questionId) => !visitedIds.includes(questionId))
        : -1;
      if (!snapshot || snapshot.version !== 8 || snapshot.computerSourceScope !== "all" || snapshot.sessionKind !== "category" || snapshot.paperCategoryIds !== null || snapshot.mode !== "learn" || snapshot.scope !== "all" || snapshot.partIndex !== null) errors.push("Learn guard resume setup did not use the v8 category-session schema.");
      if (!snapshot || snapshot.rangeStart !== 1 || snapshot.rangeEnd !== total || snapshot.rangePoolSize !== total) errors.push("Learn guard resume setup did not preserve its full range.");
      if (!snapshot || JSON.stringify(snapshot.rangePoolQuestionIds || []) !== JSON.stringify(snapshot.rangeQuestionIds || [])
        || JSON.stringify(snapshot.rangeQuestionIds || []) !== JSON.stringify(snapshot.questionIds || [])) errors.push("Learn guard resume setup did not preserve its full eligible pool/slice order.");
      if (!snapshot || snapshot.currentIndex !== total - 1 || snapshot.submitted !== false
        || snapshot.selectedIndex !== null || visitedIds.length !== 0
        || visitedIds.includes(snapshot.questionIds[total - 1])) {
        errors.push("Learn guard resume setup did not persist the hidden last-question phase.");
      }
      if (firstUnvisitedIndex < 0) errors.push("Learn guard resume setup did not retain an unvisited question.");
      return {
        errors,
        expected: {
          categoryId,
          total,
          lastQuestionId: snapshot ? snapshot.questionIds[total - 1] : "",
          visitedIds,
          firstUnvisitedIndex,
          firstUnvisitedId: snapshot && firstUnvisitedIndex >= 0 ? snapshot.questionIds[firstUnvisitedIndex] : ""
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Learn completion-guard Continue verification in time."));
        }
      }, 50);
    })`);

    const learnResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(learnResumeSetup.expected)};
      const meta = document.querySelector("#continue-session-meta").textContent;
      if (!visible(document.querySelector("#continue-session-card")) || !meta.includes("Learn") || !meta.includes("All Questions") || !meta.includes("Question " + expected.total + " of " + expected.total)) errors.push("Continue card did not label the saved last-question Learn guard session.");
      document.querySelector("#continue-session-button").click();
      await pause();
      if (document.querySelector("#question-text").dataset.questionId !== expected.lastQuestionId) errors.push("Learn Continue restored the wrong completion-guard question.");
      const restoredSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!restoredSnapshot || restoredSnapshot.version !== 8 || restoredSnapshot.computerSourceScope !== "all" || restoredSnapshot.sessionKind !== "category" || restoredSnapshot.paperCategoryIds !== null || JSON.stringify(restoredSnapshot.learnVisitedQuestionIds) !== JSON.stringify(expected.visitedIds)) errors.push("Learn Continue changed the persisted visited-ID snapshot.");
      const hiddenButtons = [...document.querySelectorAll("#options-container .option-button")];
      if (restoredSnapshot?.submitted !== false || restoredSnapshot?.selectedIndex !== null
        || document.querySelector("#action-button").textContent !== "Show Answer"
        || document.querySelector("#action-button").dataset.action !== "reveal"
        || visible(document.querySelector("#feedback"))
        || hiddenButtons.some((button) => !button.disabled || button.classList.contains("is-correct"))) {
        errors.push("Learn Continue did not restore the hidden answer phase.");
      }
      document.querySelector("#action-button").click();
      await pause();
      const revealedSnapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (document.querySelector("#question-text").dataset.questionId !== expected.lastQuestionId
        || !revealedSnapshot?.submitted
        || !revealedSnapshot?.learnVisitedQuestionIds?.includes(expected.lastQuestionId)
        || document.querySelector("#action-button").textContent !== "Next Unvisited"
        || document.querySelector("#action-button").dataset.action !== "next-unvisited") {
        errors.push("Restored hidden Learn answer did not reveal in place before offering Next Unvisited.");
      }
      document.querySelector("#action-button").click();
      await pause();
      if (visible(document.querySelector("#results-screen"))) errors.push("Restored Learn guard opened results with an unvisited question remaining.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.firstUnvisitedId) errors.push("Restored Learn guard did not wrap to the first unvisited question.");
      const numberInput = document.querySelector("#question-number-input");
      const questionTotal = document.querySelector("#question-total");
      if (!numberInput || numberInput.value !== String(expected.firstUnvisitedIndex + 1) || numberInput.max !== String(expected.total) || !questionTotal || questionTotal.textContent.trim() !== String(expected.total)) errors.push("Restored Learn guard progress did not match the first unvisited question.");
      localStorage.removeItem("ppsc-prep:active-session:v1");
      return { errors };
    })()`);

    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for isolated Urdu presentation testing."));
        }
      }, 50);
    })`);

    const urduSetupResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const storageKey = "ppsc-prep:active-session:v1";
      const urduLabels = ["الف", "ب", "ج", "د"];
      const urduQuestions = data.questions.filter((question) => question.categoryId === "urdu");
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const renderedOptionLabels = () => [...document.querySelectorAll("#options-container .option-label")]
        .map((element) => element.textContent);
      const assertUrduSurface = (question, expectedOptions, context) => {
        const questionText = document.querySelector("#question-text");
        const secondaryBlock = document.querySelector("#question-urdu-block");
        const optionsContainer = document.querySelector("#options-container");
        const optionTexts = [...document.querySelectorAll("#options-container .option-text")];
        const optionLabels = [...document.querySelectorAll("#options-container .option-label")];
        if (!question || questionText.dataset.questionId !== question.id) errors.push(context + " rendered the wrong Urdu question.");
        if (!question || questionText.textContent !== question.questionUrdu) errors.push(context + " did not use questionUrdu as the main question text.");
        if (visible(secondaryBlock)) errors.push(context + " displayed the duplicate secondary Urdu block.");
        if (!questionText.classList.contains("is-urdu") || questionText.lang !== "ur" || questionText.dir !== "rtl") errors.push(context + " main question lacks Urdu class/lang/dir.");
        if (!getComputedStyle(questionText).fontFamily.includes("Noto Nastaliq Urdu")) errors.push(context + " main question lacks the Urdu font.");
        if (!optionsContainer.classList.contains("is-urdu") || optionsContainer.lang !== "ur" || optionsContainer.dir !== "rtl") errors.push(context + " options container lacks Urdu class/lang/dir.");
        if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expectedOptions)) errors.push(context + " rendered options do not match the aligned optionsUrdu order.");
        if (JSON.stringify(renderedOptionLabels()) !== JSON.stringify(urduLabels)) errors.push(context + " did not render Urdu option labels.");
        if (optionTexts.some((element) => element.lang !== "ur" || element.dir !== "rtl" || /[A-Za-z]/.test(element.textContent))) errors.push(context + " has a non-Urdu option surface.");
        if (optionTexts.some((element) => !getComputedStyle(element).fontFamily.includes("Noto Nastaliq Urdu"))) errors.push(context + " option text lacks the Urdu font.");
        if (optionLabels.some((element) => element.lang !== "ur" || element.dir !== "rtl")) errors.push(context + " option labels lack Urdu language/direction attributes.");
      };
      const startFullRange = async (selector) => {
        document.querySelector(selector)?.click();
        await pause();
        const startInput = document.querySelector("#question-range-start-input");
        const endInput = document.querySelector("#question-range-end-input");
        if (!startInput || !endInput || !visible(document.querySelector("#question-range-options"))) {
          errors.push(selector + " did not open the Urdu range selector.");
          return;
        }
        startInput.value = "1";
        endInput.value = endInput.max;
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      };

      if (visible(document.querySelector("#quiz-screen"))) {
        document.querySelector("#back-button").click();
        await pause();
      }
      localStorage.removeItem(storageKey);
      const urduCategoryButton = document.querySelector('#category-grid .category-card[data-category="urdu"]');
      if (!urduCategoryButton || urduQuestions.length !== 882) {
        errors.push("Could not start the dedicated Urdu display test.");
        return { errors, expected: {} };
      }

      urduCategoryButton.click();
      await startFullRange("#learn-mode-button");
      const learnQuestion = questionById.get(String(document.querySelector("#question-text").dataset.questionId));
      assertUrduSurface(learnQuestion, learnQuestion ? learnQuestion.optionsUrdu : [], "Urdu Learn");
      if (!learnQuestion || learnQuestion.id !== urduQuestions[0].id) errors.push("Urdu Learn did not retain canonical source order.");
      const learnCorrectButton = learnQuestion
        ? document.querySelector('[data-option-index="' + learnQuestion.correctOptionIndex + '"]')
        : null;
      if (!learnCorrectButton || !learnCorrectButton.disabled
        || learnCorrectButton.classList.contains("is-selected")
        || learnCorrectButton.classList.contains("is-correct")
        || learnCorrectButton.getAttribute("aria-checked") !== "false"
        || document.querySelector("#action-button")?.textContent !== "Show Answer") {
        errors.push("Urdu Learn did not start with its correct answer hidden and locked.");
      }
      const learnFeedback = document.querySelector("#feedback");
      if (visible(learnFeedback)) errors.push("Urdu Learn showed feedback before answer reveal.");
      document.querySelector("#action-button")?.click();
      await pause();
      if (!learnCorrectButton.classList.contains("is-selected")
        || !learnCorrectButton.classList.contains("is-correct")
        || learnCorrectButton.getAttribute("aria-checked") !== "true") {
        errors.push("Urdu Learn reveal did not select and mark the correct answer.");
      }
      if (!visible(learnFeedback) || !learnFeedback.classList.contains("is-urdu") || learnFeedback.lang !== "ur" || learnFeedback.dir !== "rtl" || document.querySelector("#feedback-title").textContent !== "درست جواب") {
        errors.push("Urdu Learn feedback did not use its Urdu presentation.");
      }

      document.querySelector("#back-button").click();
      await pause();
      urduCategoryButton.click();
      await startFullRange("#quiz-mode-button");
      const initialSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      const firstQuestion = questionById.get(String(document.querySelector("#question-text").dataset.questionId));
      const firstOrder = initialSnapshot && Array.isArray(initialSnapshot.optionOrders)
        ? initialSnapshot.optionOrders[0]
        : [];
      const firstExpectedOptions = firstQuestion && firstOrder.length === 4
        ? firstOrder.map((originalIndex) => firstQuestion.optionsUrdu[originalIndex])
        : [];
      assertUrduSurface(firstQuestion, firstExpectedOptions, "Urdu Quiz");
      if (!initialSnapshot || initialSnapshot.version !== 8 || initialSnapshot.computerSourceScope !== "all" || initialSnapshot.sessionKind !== "category" || initialSnapshot.categoryId !== "urdu" || initialSnapshot.paperCategoryIds !== null || initialSnapshot.mode !== "quiz" || initialSnapshot.scope !== "all") {
        errors.push("Urdu Quiz did not use the v8 category-session schema.");
      }
      if (!initialSnapshot || initialSnapshot.rangeStart !== 1 || initialSnapshot.rangeEnd !== urduQuestions.length || initialSnapshot.rangePoolSize !== urduQuestions.length) errors.push("Urdu Quiz did not store its full selected range.");
      if (!initialSnapshot
        || JSON.stringify(initialSnapshot.questionIds || []) !== JSON.stringify(urduQuestions.map((question) => String(question.id)))
        || !firstQuestion || firstQuestion.id !== urduQuestions[0].id) {
        errors.push("Urdu Quiz did not retain canonical source order.");
      }
      document.querySelector("#action-button").click();
      await pause();
      const selectionPrompt = document.querySelector("#feedback");
      if (!visible(selectionPrompt) || !selectionPrompt.classList.contains("is-warning") || !selectionPrompt.classList.contains("is-urdu") || selectionPrompt.lang !== "ur" || selectionPrompt.dir !== "rtl" || document.querySelector("#feedback-title").textContent !== "ایک جواب منتخب کریں" || document.querySelector("#feedback-text").textContent !== "جواب چیک کرنے سے پہلے ایک اختیار منتخب کریں۔" || /[A-Za-z]/.test(selectionPrompt.textContent)) {
        errors.push("Urdu Quiz no-selection warning was not fully localized.");
      }
      if (document.querySelector("#action-button").textContent !== "Check Answer" || document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Urdu no-selection warning changed action or scoring state.");
      const firstCorrectRenderedIndex = firstQuestion && firstOrder.length === 4
        ? firstOrder.indexOf(firstQuestion.correctOptionIndex)
        : -1;
      const firstWrongRenderedIndex = firstCorrectRenderedIndex >= 0 ? (firstCorrectRenderedIndex + 1) % 4 : -1;
      const firstWrongButton = document.querySelector('[data-option-index="' + firstWrongRenderedIndex + '"]');
      if (firstCorrectRenderedIndex < 0 || !firstWrongButton) {
        errors.push("Urdu Quiz could not map the canonical correct index through stored optionOrder.");
      } else {
        firstWrongButton.click();
        document.querySelector("#action-button").click();
        await pause();
      }
      const firstCorrectText = firstCorrectRenderedIndex >= 0 ? firstExpectedOptions[firstCorrectRenderedIndex] : "";
      if (document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Urdu Quiz scored a wrong answer as correct.");
      if (document.querySelector("#feedback-title").textContent !== "غلط" || !document.querySelector("#feedback-text").textContent.includes(firstCorrectText)) errors.push("Urdu Quiz wrong feedback did not reveal the Urdu correct answer.");
      if (!document.querySelector("#feedback").classList.contains("is-urdu") || document.querySelector("#feedback").lang !== "ur" || document.querySelector("#feedback").dir !== "rtl" || /[A-Za-z]/.test(document.querySelector("#feedback-text").textContent)) errors.push("Urdu Quiz wrong feedback was not fully localized.");
      const mappedCorrectButton = document.querySelector('[data-option-index="' + firstCorrectRenderedIndex + '"]');
      if (!mappedCorrectButton || !mappedCorrectButton.disabled || !mappedCorrectButton.classList.contains("is-correct")) errors.push("Urdu Quiz did not mark the remapped correct answer.");

      document.querySelector("#action-button").click();
      await pause();
      const secondQuestion = questionById.get(String(document.querySelector("#question-text").dataset.questionId));
      const afterAdvanceSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      const secondOrder = afterAdvanceSnapshot && Array.isArray(afterAdvanceSnapshot.optionOrders)
        ? afterAdvanceSnapshot.optionOrders[1]
        : [];
      const secondExpectedOptions = secondQuestion && secondOrder.length === 4
        ? secondOrder.map((originalIndex) => secondQuestion.optionsUrdu[originalIndex])
        : [];
      const secondCorrectRenderedIndex = secondQuestion && secondOrder.length === 4
        ? secondOrder.indexOf(secondQuestion.correctOptionIndex)
        : -1;
      assertUrduSurface(secondQuestion, secondExpectedOptions, "Urdu Quiz pending question");
      const pendingButton = document.querySelector('[data-option-index="' + secondCorrectRenderedIndex + '"]');
      if (secondCorrectRenderedIndex < 0 || !pendingButton) {
        errors.push("Urdu Quiz could not prepare a pending localized answer.");
      } else {
        pendingButton.click();
        await pause();
      }
      const resumeSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!resumeSnapshot || resumeSnapshot.version !== 8 || resumeSnapshot.computerSourceScope !== "all" || resumeSnapshot.currentIndex !== 1 || resumeSnapshot.submitted || resumeSnapshot.selectedIndex !== secondCorrectRenderedIndex || resumeSnapshot.score !== 0) errors.push("Urdu Quiz pending checkpoint is invalid.");
      if (!resumeSnapshot || !resumeSnapshot.answerHistory[0] || resumeSnapshot.answerHistory[0][0] !== firstWrongRenderedIndex || resumeSnapshot.answerHistory[0][1] !== true || !resumeSnapshot.answerHistory[1] || resumeSnapshot.answerHistory[1][0] !== secondCorrectRenderedIndex || resumeSnapshot.answerHistory[1][1] !== false) {
        errors.push("Urdu Quiz did not persist its submitted and pending answer states.");
      }

      return {
        errors,
        expected: {
          questionIds: resumeSnapshot ? resumeSnapshot.questionIds : [],
          optionOrders: resumeSnapshot ? resumeSnapshot.optionOrders : [],
          answerHistory: resumeSnapshot ? resumeSnapshot.answerHistory : [],
          first: {
            id: firstQuestion ? firstQuestion.id : "",
            optionTexts: firstExpectedOptions,
            wrongIndex: firstWrongRenderedIndex,
            correctIndex: firstCorrectRenderedIndex,
            correctText: firstCorrectText
          },
          pending: {
            id: secondQuestion ? secondQuestion.id : "",
            optionTexts: secondExpectedOptions,
            selectedIndex: secondCorrectRenderedIndex
          }
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Urdu Continue verification in time."));
        }
      }, 50);
    })`);

    const urduResumeResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(urduSetupResult.expected)};
      const data = window.PPSC_QUIZ_DATA;
      const storageKey = "ppsc-prep:active-session:v1";
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const storedBeforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!visible(document.querySelector("#continue-session-card")) || !document.querySelector("#continue-session-title").textContent.includes("Urdu")) errors.push("Reload did not offer Continue for the Urdu Quiz.");
      if (!storedBeforeContinue || storedBeforeContinue.version !== 8 || storedBeforeContinue.computerSourceScope !== "all" || storedBeforeContinue.categoryId !== "urdu" || JSON.stringify(storedBeforeContinue.questionIds) !== JSON.stringify(expected.questionIds) || JSON.stringify(storedBeforeContinue.optionOrders) !== JSON.stringify(expected.optionOrders) || JSON.stringify(storedBeforeContinue.answerHistory) !== JSON.stringify(expected.answerHistory)) {
        errors.push("Reload changed the saved Urdu Quiz IDs, option order, or answer states.");
      }
      document.querySelector("#continue-session-button").click();
      await pause();
      if (document.querySelector("#question-text").dataset.questionId !== expected.pending.id || document.querySelector("#question-text").textContent !== questionById.get(expected.pending.id).questionUrdu) errors.push("Urdu Continue restored the wrong pending question or stem.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.pending.optionTexts)) errors.push("Urdu Continue changed the pending localized option order.");
      const pendingButton = document.querySelector('[data-option-index="' + expected.pending.selectedIndex + '"]');
      if (!pendingButton || !pendingButton.classList.contains("is-selected") || pendingButton.disabled || visible(document.querySelector("#feedback"))) errors.push("Urdu Continue did not restore the pending selection state.");
      if (!document.querySelector("#question-text").classList.contains("is-urdu") || document.querySelector("#question-text").lang !== "ur" || document.querySelector("#question-text").dir !== "rtl" || visible(document.querySelector("#question-urdu-block"))) errors.push("Urdu Continue lost the RTL primary-question surface.");

      const numberInput = document.querySelector("#question-number-input");
      numberInput.value = "1";
      numberInput.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
      if (document.querySelector("#question-text").dataset.questionId !== expected.first.id || JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.first.optionTexts)) errors.push("Urdu Continue did not preserve the submitted question/order.");
      const restoredWrongButton = document.querySelector('[data-option-index="' + expected.first.wrongIndex + '"]');
      if (!restoredWrongButton || !restoredWrongButton.disabled || !restoredWrongButton.classList.contains("is-incorrect") || document.querySelector("#feedback-title").textContent !== "غلط" || !document.querySelector("#feedback-text").textContent.includes(expected.first.correctText)) {
        errors.push("Urdu Continue did not restore submitted wrong-answer feedback.");
      }
      numberInput.value = "2";
      numberInput.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
      if (document.querySelector("#question-text").dataset.questionId !== expected.pending.id || JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.pending.optionTexts)) errors.push("Urdu Continue changed the pending state after navigation.");
      const pendingAgain = document.querySelector('[data-option-index="' + expected.pending.selectedIndex + '"]');
      if (!pendingAgain || !pendingAgain.classList.contains("is-selected") || pendingAgain.disabled || visible(document.querySelector("#feedback"))) errors.push("Urdu pending selection did not survive submitted-question navigation.");
      document.querySelector("#action-button").click();
      await pause();
      const submittedPendingButton = document.querySelector('[data-option-index="' + expected.pending.selectedIndex + '"]');
      if (document.querySelector("#score-text").textContent !== "Score: 1" || document.querySelector("#feedback-title").textContent !== "درست!" || !submittedPendingButton || !submittedPendingButton.disabled || !submittedPendingButton.classList.contains("is-correct")) errors.push("Urdu Quiz did not map and score the restored correct answer.");
      if (!document.querySelector("#feedback").classList.contains("is-urdu") || document.querySelector("#feedback").lang !== "ur" || document.querySelector("#feedback").dir !== "rtl" || /[A-Za-z]/.test(document.querySelector("#feedback").textContent)) errors.push("Urdu Quiz correct feedback was not fully localized.");

      document.querySelector("#back-button").click();
      await pause();
      const generalButton = document.querySelector('#category-grid .category-card[data-category="general-knowledge"]');
      generalButton.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      const generalRangeStart = document.querySelector("#question-range-start-input");
      const generalRangeEnd = document.querySelector("#question-range-end-input");
      if (!generalRangeStart || !generalRangeEnd || !visible(document.querySelector("#question-range-options"))) {
        errors.push("Transition from Urdu did not open the General Knowledge range selector.");
      } else {
        generalRangeStart.value = "1";
        generalRangeEnd.value = generalRangeEnd.max;
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
      }
      const generalQuestion = questionById.get(String(document.querySelector("#question-text").dataset.questionId));
      const mainQuestion = document.querySelector("#question-text");
      const optionsContainer = document.querySelector("#options-container");
      const secondaryBlock = document.querySelector("#question-urdu-block");
      const optionLabels = [...document.querySelectorAll("#options-container .option-label")];
      const optionTexts = [...document.querySelectorAll("#options-container .option-text")];
      const sourceOptionText = (option) => String(option && typeof option === "object" ? option.text : option);
      if (!generalQuestion || mainQuestion.textContent !== generalQuestion.question) errors.push("Transition from Urdu did not restore the non-Urdu main stem.");
      if (mainQuestion.classList.contains("is-urdu") || mainQuestion.hasAttribute("lang") || mainQuestion.hasAttribute("dir")) errors.push("Transition from Urdu left RTL attributes on the non-Urdu question.");
      if (optionsContainer.classList.contains("is-urdu") || optionsContainer.hasAttribute("lang") || optionsContainer.hasAttribute("dir")) errors.push("Transition from Urdu left RTL attributes on the non-Urdu options.");
      if (!visible(secondaryBlock) || document.querySelector("#question-text-urdu").textContent !== generalQuestion.questionUrdu) errors.push("Transition from Urdu did not restore the secondary Urdu translation.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(generalQuestion.options.map(sourceOptionText))) errors.push("Transition from Urdu did not restore canonical non-Urdu options.");
      if (JSON.stringify(optionLabels.map((element) => element.textContent)) !== JSON.stringify(["A", "B", "C", "D"]) || optionLabels.some((element) => element.lang !== "en" || element.dir !== "ltr")) errors.push("Transition from Urdu did not restore English option labels.");
      if (optionTexts.some((element) => element.hasAttribute("lang") || element.hasAttribute("dir"))) errors.push("Transition from Urdu left language/direction attributes on option text.");
      const feedback = document.querySelector("#feedback");
      if (visible(feedback) || feedback.classList.contains("is-urdu")
        || feedback.hasAttribute("lang") || feedback.hasAttribute("dir")) {
        errors.push("Transition from Urdu did not reset to hidden non-Urdu Learn feedback.");
      }
      document.querySelector("#back-button").click();
      await pause();
      localStorage.removeItem(storageKey);

      return {
        errors,
        learnLocalized: true,
        quizOrderRestored: true,
        submittedAndPendingRestored: true,
        nonUrduReset: true
      };
    })()`);

    await client.evaluate(`(() => {
      const questions = window.PPSC_QUIZ_DATA?.questions || [];
      const hashText = (initialHash, value) => {
        let hash = initialHash;
        const text = String(value);
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash;
      };
      let hash = 2166136261;
      questions.forEach((question) => {
        hash = hashText(hash, JSON.stringify([
          question.id,
          question.categoryId,
          question.question,
          question.questionUrdu,
          question.correctOptionIndex,
          question.options,
          question.optionsUrdu
        ]));
        hash = hashText(hash, "\\n");
      });
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.setItem("ppsc-prep:retry-queue:v1", JSON.stringify({
        version: 1,
        bankSignature: "v1:" + questions.length + ":" + (hash >>> 0).toString(16),
        countBaselineVersion: 1,
        embeddedCadenceVersion: 2,
        practiceStep: 0,
        nextQuizReviewStep: null,
        nextImportantReviewStep: 1000,
        nextSequence: 1,
        items: [],
        activeAttempt: null
      }));
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for spaced-retry lifecycle testing."));
        }
      }, 50);
    })`);

    const retryLifecycleSetup = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      const categoryId = "job-related-finance-taxation";
      const categoryQuestions = data.questions.filter((question) => question.categoryId === categoryId);
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      const renderedMainOptions = () => [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const currentQuestion = () => questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
      const mainSnapshot = () => {
        const snapshot = JSON.parse(localStorage.getItem(sessionKey) || "null");
        return snapshot ? {
          currentIndex: snapshot.currentIndex,
          selectedIndex: snapshot.selectedIndex,
          submitted: snapshot.submitted,
          score: snapshot.score,
          answerHistory: snapshot.answerHistory,
          learnVisitedQuestionIds: snapshot.learnVisitedQuestionIds,
          questionIds: snapshot.questionIds,
          optionOrders: snapshot.optionOrders
        } : null;
      };
      const answerMain = async (correct) => {
        const question = currentQuestion();
        const rendered = renderedMainOptions();
        const correctIndex = question ? rendered.indexOf(displayOptions(question)[question.correctOptionIndex]) : -1;
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        const button = document.querySelector('[data-option-index="' + selectedIndex + '"]');
        if (!question || correctIndex < 0 || !button) {
          errors.push("Retry lifecycle could not map a main answer.");
          return null;
        }
        button.click();
        document.querySelector("#action-button")?.click();
        await pause();
        return { question, correctIndex, selectedIndex };
      };

      const categoryButton = document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]');
      if (!categoryButton || categoryQuestions.length < 32) {
        errors.push("Retry lifecycle category fixture is unavailable.");
        return { errors, expected: {} };
      }
      categoryButton.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      const startInput = document.querySelector("#question-range-start-input");
      const endInput = document.querySelector("#question-range-end-input");
      if (!startInput || !endInput) {
        errors.push("Retry lifecycle range selector is unavailable.");
        return { errors, expected: {} };
      }
      startInput.value = "1";
      endInput.value = "32";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();

      const first = await answerMain(false);
      const firstId = first ? String(first.question.id) : "";
      let retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
      const firstDueStep = retry?.items?.[0]?.dueStep;
      const firstRegularSpacing = retry?.nextQuizReviewStep - retry?.practiceStep;
      if (!retry || retry.version !== 1 || retry.embeddedCadenceVersion !== 2
        || retry.bankSignature !== session?.bankSignature
        || retry.practiceStep !== 1 || retry.nextSequence !== 2 || retry.items.length !== 1
        || retry.items[0].questionId !== firstId || retry.items[0].remaining !== 2
        || !Number.isInteger(firstDueStep) || firstDueStep < 11 || firstDueStep > 16
        || retry.items[0].wrongRetryDueStep !== firstDueStep
        || !Number.isInteger(firstRegularSpacing) || firstRegularSpacing < 5 || firstRegularSpacing > 6
        || retry.nextQuizReviewStep === firstDueStep
        || retry.items[0].sequence !== 1 || retry.activeAttempt !== null) {
        errors.push("Initial main wrong answer did not create +2 with its own 10-to-15 due step beside the regular 5-to-6 Queue gate.");
      }
      if (document.querySelector("#retry-dialog")?.open) errors.push("Initial wrong answer opened its retry immediately.");
      const queueChip = document.querySelector("#retry-queue-chip");
      if (!visible(queueChip) || queueChip.dataset.count !== "1" || document.querySelector("#retry-queue-count")?.textContent !== "1") {
        errors.push("Retry queue chip did not expose its one queued MCQ.");
      }

      document.querySelector("#action-button")?.click();
      await pause();
      for (let questionNumber = 2; Number.isInteger(firstDueStep) && questionNumber <= firstDueStep; questionNumber += 1) {
        await answerMain(true);
        if (document.querySelector("#retry-dialog")?.open) errors.push("Retry opened before leaving due main question " + questionNumber + ".");
        if (questionNumber < firstDueStep) {
          document.querySelector("#action-button")?.click();
          await pause();
          if (document.querySelector("#retry-dialog")?.open) {
            const intervening = JSON.parse(localStorage.getItem(retryKey) || "null")?.activeAttempt;
            if (intervening?.questionId === firstId) {
              errors.push("The specifically wrong lifecycle MCQ opened before its saved 10-to-15 due step.");
            }
            document.querySelector("#retry-later-button")?.click();
            await pause();
          }
        }
      }

      const beforeRetryMain = mainSnapshot();
      const beforeRetryScore = document.querySelector("#score-text")?.textContent;
      const beforeRetryProgress = document.querySelector("#question-number-input")?.value;
      document.querySelector("#action-button")?.click();
      await pause();
      const dialog = document.querySelector("#retry-dialog");
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const attempt = retry?.activeAttempt;
      if (!dialog?.open || !dialog.matches(":modal") || attempt?.questionId !== firstId
        || attempt?.resumeAction !== "next:" + firstDueStep || attempt?.submitted !== false || attempt?.selectedIndex !== null) {
        errors.push("Leaving the saved cadence-gate main answer did not open the expected retry attempt.");
      }
      if (document.activeElement !== document.querySelector('#retry-options-container [data-review-option-index="0"]')) {
        errors.push("Unsubmitted retry dialog did not focus its first option.");
      }
      if (!document.body.classList.contains("has-retry-dialog")
        || dialog.getAttribute("aria-modal") !== "true"
        || dialog.getAttribute("aria-labelledby") !== "retry-dialog-title retry-question-text") {
        errors.push("Retry dialog modal semantics were incomplete.");
      }
      if (JSON.stringify(mainSnapshot()) !== JSON.stringify(beforeRetryMain)
        || document.querySelector("#score-text")?.textContent !== beforeRetryScore
        || document.querySelector("#question-number-input")?.value !== beforeRetryProgress) {
        errors.push("Opening a retry changed the main score, progress, or answer history.");
      }

      const retryQuestion = questionById.get(String(attempt?.questionId || ""));
      const correctReviewIndex = retryQuestion && attempt?.optionOrder
        ? attempt.optionOrder.indexOf(retryQuestion.correctOptionIndex)
        : -1;
      const retryOptionTexts = [...document.querySelectorAll("#retry-options-container .option-text")].map((element) => element.textContent);
      document.querySelector('[data-review-option-index="' + correctReviewIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!retry?.activeAttempt?.submitted || retry.activeAttempt.outcome !== "correct"
        || retry.items[0]?.remaining !== 2 || document.querySelector("#retry-action-button")?.dataset.action !== "continue"
        || !document.querySelector("#retry-dialog-progress")?.textContent.includes("1 correct review remaining")) {
        errors.push("Correct retry Check did not persist an unapplied, projected 2-to-1 result.");
      }
      if (JSON.stringify(mainSnapshot()) !== JSON.stringify(beforeRetryMain)
        || document.querySelector("#score-text")?.textContent !== beforeRetryScore) {
        errors.push("Checking a retry answer mutated the main session.");
      }

      return {
        errors,
        expected: {
          firstId,
          retryOptionTexts,
          correctReviewIndex,
          main: beforeRetryMain,
          scoreText: beforeRetryScore,
          progressValue: beforeRetryProgress,
          firstDueStep,
          activeAttempt: retry ? retry.activeAttempt : null
        }
      };
    })()`);

    await delay(300);
    const retryDialogScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      path.join(projectDirectory, "work", "retry-dialog-mobile-smoke.png"),
      Buffer.from(retryDialogScreenshot.data, "base64")
    );

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    await delay(250);
    const retryDesktopProbe = await client.evaluate(`(() => {
      const dialog = document.querySelector("#retry-dialog");
      const rect = dialog?.getBoundingClientRect();
      return {
        errors: !dialog?.open || !rect || document.documentElement.scrollWidth > window.innerWidth
          || rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1
          ? ["Retry dialog overflowed the 1366px desktop viewport."]
          : [],
        metrics: rect ? {
          width: window.innerWidth,
          height: window.innerHeight,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        } : null
      };
    })()`);
    const retryDesktopScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      path.join(projectDirectory, "work", "retry-dialog-desktop-smoke.png"),
      Buffer.from(retryDesktopScreenshot.data, "base64")
    );

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for active retry Continue testing."));
        }
      }, 50);
    })`);

    const retryMobileProbe = await client.evaluate(`(async () => {
      document.querySelector("#continue-session-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const dialog = document.querySelector("#retry-dialog");
      const card = document.querySelector(".retry-dialog-card");
      const action = document.querySelector("#retry-action-button");
      const dialogRect = dialog?.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const actionRect = action?.getBoundingClientRect();
      const errors = [];
      if (!dialog?.open || !dialogRect || document.documentElement.scrollWidth > window.innerWidth
        || dialogRect.left < -1 || dialogRect.right > window.innerWidth + 1
        || dialogRect.top < -1 || dialogRect.bottom > window.innerHeight + 1) {
        errors.push("Retry dialog overflowed the 320px restored mobile viewport.");
      }
      if (document.activeElement !== action) errors.push("Restored mobile retry did not focus Continue.");
      if (!actionRect || !cardRect || actionRect.top < cardRect.top - 1 || actionRect.bottom > cardRect.bottom + 1) {
        errors.push("Restored mobile retry focused Continue outside the visible dialog scrollport.");
      }
      return {
        errors,
        metrics: {
          viewport: [window.innerWidth, window.innerHeight],
          dialog: dialogRect ? [Math.round(dialogRect.top), Math.round(dialogRect.bottom)] : null,
          card: cardRect ? [Math.round(cardRect.top), Math.round(cardRect.bottom)] : null,
          action: actionRect ? [Math.round(actionRect.top), Math.round(actionRect.bottom)] : null,
          cardScrollTop: card?.scrollTop ?? null,
          cardClientHeight: card?.clientHeight ?? null,
          cardScrollHeight: card?.scrollHeight ?? null
        }
      };
    })()`);
    const retryMobile320Screenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      path.join(projectDirectory, "work", "retry-dialog-mobile-320-smoke.png"),
      Buffer.from(retryMobile320Screenshot.data, "base64")
    );
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset after the restored retry screenshot."));
        }
      }, 50);
    })`);

    const retryLifecycleResume = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(retryLifecycleSetup.expected)};
      const data = window.PPSC_QUIZ_DATA;
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      const mainSnapshot = () => {
        const snapshot = JSON.parse(localStorage.getItem(sessionKey) || "null");
        return snapshot ? {
          currentIndex: snapshot.currentIndex,
          selectedIndex: snapshot.selectedIndex,
          submitted: snapshot.submitted,
          score: snapshot.score,
          answerHistory: snapshot.answerHistory,
          learnVisitedQuestionIds: snapshot.learnVisitedQuestionIds,
          questionIds: snapshot.questionIds,
          optionOrders: snapshot.optionOrders
        } : null;
      };
      const renderedMainOptions = () => [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const answerMainCorrect = async () => {
        const question = questionById.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
        const correctIndex = question ? renderedMainOptions().indexOf(displayOptions(question)[question.correctOptionIndex]) : -1;
        const button = document.querySelector('[data-option-index="' + correctIndex + '"]');
        if (!question || correctIndex < 0 || !button) {
          errors.push("Retry resume could not map a main correct answer.");
          return;
        }
        button.click();
        document.querySelector("#action-button")?.click();
        await pause();
      };

      const storedBeforeContinue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!visible(document.querySelector("#category-screen")) || !visible(document.querySelector("#continue-session-card"))) {
        errors.push("Reload with an active retry did not return to the Continue surface.");
      }
      if (document.querySelector("#retry-dialog")?.open) errors.push("Active retry opened before the user chose Continue.");
      if (JSON.stringify(storedBeforeContinue?.activeAttempt) !== JSON.stringify(expected.activeAttempt)
        || storedBeforeContinue?.items[0]?.remaining !== 2) {
        errors.push("Reload changed the submitted active retry before Continue.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const dialog = document.querySelector("#retry-dialog");
      const rect = dialog?.getBoundingClientRect();
      const focusedActionRect = document.querySelector("#retry-action-button")?.getBoundingClientRect();
      const dialogCardRect = document.querySelector(".retry-dialog-card")?.getBoundingClientRect();
      const renderedRetryOptions = [...document.querySelectorAll("#retry-options-container .option-text")].map((element) => element.textContent);
      if (!dialog?.open || document.querySelector("#retry-question-text")?.dataset.questionId !== expected.firstId
        || JSON.stringify(renderedRetryOptions) !== JSON.stringify(expected.retryOptionTexts)) {
        errors.push("Continue did not reopen the exact active retry question and option order.");
      }
      const restoredSelected = document.querySelector('[data-review-option-index="' + expected.correctReviewIndex + '"]');
      if (!restoredSelected || !restoredSelected.disabled || !restoredSelected.classList.contains("is-selected")
        || !restoredSelected.classList.contains("is-correct") || document.querySelector("#retry-feedback-title")?.textContent !== "Correct!") {
        errors.push("Continue did not restore the submitted retry feedback.");
      }
      if (document.activeElement !== document.querySelector("#retry-action-button")) errors.push("Restored submitted retry did not focus Continue.");
      if (!focusedActionRect || !dialogCardRect || focusedActionRect.top < dialogCardRect.top - 1
        || focusedActionRect.bottom > dialogCardRect.bottom + 1) {
        errors.push("Restored retry focused Continue outside the visible dialog scrollport.");
      }
      if (document.documentElement.scrollWidth > window.innerWidth || !rect || rect.left < -1 || rect.right > window.innerWidth + 1
        || rect.top < -1 || rect.bottom > window.innerHeight + 1) {
        errors.push("Retry dialog overflowed the 320px mobile viewport.");
      }
      const dialogCard = document.querySelector(".retry-dialog-card");
      if (dialogCard && dialogCard.scrollHeight > dialogCard.clientHeight
        && !["auto", "scroll"].includes(getComputedStyle(dialogCard).overflowY)) {
        errors.push("Tall retry dialog content was not internally scrollable.");
      }
      if (JSON.stringify(mainSnapshot()) !== JSON.stringify(expected.main)
        || document.querySelector("#score-text")?.textContent !== expected.scoreText
        || document.querySelector("#question-number-input")?.value !== expected.progressValue) {
        errors.push("Restoring an active retry changed the underlying main session.");
      }

      document.querySelector("#retry-action-button")?.click();
      await pause();
      let retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      const secondGateStep = retry?.nextQuizReviewStep;
      const reviewedItem = retry?.items.find((item) => item.questionId === expected.firstId);
      const secondItemDueStep = reviewedItem?.dueStep;
      const secondItemSpacing = secondItemDueStep - retry?.practiceStep;
      if (dialog?.open || retry?.activeAttempt !== null || reviewedItem?.remaining !== 1
        || !Number.isInteger(secondGateStep) || secondGateStep <= retry?.practiceStep
        || !Number.isInteger(secondItemSpacing) || secondItemSpacing < 5 || secondItemSpacing > 6
        || reviewedItem?.wrongRetryDueStep !== undefined
        || retry?.items[retry.items.length - 1]?.questionId !== expected.firstId) {
        errors.push("Correct retry Continue was not applied exactly once as remaining 1 on its regular five-to-six-question item clock while preserving the existing future Queue gate.");
      }
      if (document.querySelector("#question-number-input")?.value !== String(expected.firstDueStep + 1)
        || document.querySelector("#score-text")?.textContent !== "Score: " + (expected.firstDueStep - 1)) {
        errors.push("Retry Continue did not resume the next main question with the same score.");
      }
      if (document.activeElement !== document.querySelector("#question-text")) errors.push("Closing retry did not restore focus to resumed main content.");

      let nextReviewOffered = false;
      for (let questionNumber = expected.firstDueStep + 1; questionNumber <= 32; questionNumber += 1) {
        await answerMainCorrect();
        const mainBeforeTransition = mainSnapshot();
        const scoreBeforeTransition = document.querySelector("#score-text")?.textContent;
        document.querySelector("#action-button")?.click();
        await pause();
        if (!dialog?.open) continue;
        nextReviewOffered = true;
        if (JSON.stringify(mainSnapshot()) !== JSON.stringify(mainBeforeTransition)
          || document.querySelector("#score-text")?.textContent !== scoreBeforeTransition) {
          errors.push("A later retry mutated main state before answer at question " + questionNumber + ".");
        }
        document.querySelector("#retry-later-button")?.click();
        await pause();
      }

      retry = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!nextReviewOffered) errors.push("No regular Queue review was offered during the remaining lifecycle range.");
      if (!visible(document.querySelector("#results-screen"))
        || document.querySelector("#result-score")?.textContent.replace(/\\s/g, "") !== "31/32") {
        errors.push("Retry lifecycle completion changed the 31-of-32 main Quiz result.");
      }
      if (!retry || retry.items.find((entry) => entry.questionId === expected.firstId)?.remaining !== 1
        || retry.activeAttempt !== null || localStorage.getItem(sessionKey) !== null) {
        errors.push("The remaining saved review was lost or changed when the Quiz reached results.");
      }
      return {
        errors,
        remainingAfterFirstReview: retry?.items.find((entry) => entry.questionId === expected.firstId)?.remaining ?? null,
        finalScore: document.querySelector("#result-score")?.textContent || "",
        mobileWidth: window.innerWidth,
        mobileFocusMetrics: {
          actionTop: focusedActionRect ? Math.round(focusedActionRect.top) : null,
          actionBottom: focusedActionRect ? Math.round(focusedActionRect.bottom) : null,
          cardTop: dialogCardRect ? Math.round(dialogCardRect.top) : null,
          cardBottom: dialogCardRect ? Math.round(dialogCardRect.bottom) : null,
          cardScrollTop: document.querySelector(".retry-dialog-card")?.scrollTop ?? null
        }
      };
    })()`);

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });

    const retryExistingCountSeedResult = await client.evaluate(`(() => {
      const errors = [];
      const key = "ppsc-prep:retry-queue:v1";
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem(key);
      const seed = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-seed") || "null");
      const categoryIds = ${JSON.stringify(retryQueueFeatureResult.sourceReviewIds)};
      const legacyCounts = [1, 5, 17];
      if (!seed || !Array.isArray(seed.items) || seed.items.length !== legacyCounts.length) {
        errors.push("One-time retry-count baseline fixture was unavailable.");
        return { errors, ids: [], legacyCounts, itemShape: [] };
      }
      delete seed.countBaselineVersion;
      seed.activeAttempt = null;
      seed.dedicatedDeck = [];
      seed.items = categoryIds.map((questionId, index) => ({
        questionId, remaining: legacyCounts[index], dueStep: 0, sequence: index + 1
      }));
      seed.nextSequence = 4;
      const itemShape = seed.items.map((item) => ({
        questionId: item.questionId,
        dueStep: item.dueStep,
        sequence: item.sequence
      }));
      sessionStorage.setItem("ppsc-smoke:retry-baseline-legacy", JSON.stringify(seed));
      localStorage.setItem(key, JSON.stringify(seed));
      return {
        errors,
        ids: seed.items.map((item) => item.questionId),
        legacyCounts,
        itemShape
      };
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for one-time retry-count baselining."));
        }
      }, 50);
    })`);

    const retryExistingCountPreservationResult = await client.evaluate(`(async () => {
      const errors = [];
      const expected = ${JSON.stringify(retryExistingCountSeedResult)};
      const key = "ppsc-prep:retry-queue:v1";
      const questionById = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      let stored = JSON.parse(localStorage.getItem(key) || "null");
      const migratedShape = (stored?.items || []).map((item) => ({
        questionId: item.questionId,
        dueStep: item.dueStep,
        sequence: item.sequence
      }));
      if (!stored || stored.version !== 1 || stored.countBaselineVersion !== 1
        || JSON.stringify((stored.items || []).map((item) => item.remaining)) !== JSON.stringify([5, 5, 5])
        || JSON.stringify(migratedShape) !== JSON.stringify(expected.itemShape)
        || stored.dedicatedDeck?.length !== 0) {
        errors.push("Markerless counts below, equal to, and above five were not baselined exactly once without changing item identity or cadence fields.");
      }
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const modeButton = document.querySelector("#queue-mode-button");
      if (modeButton?.dataset.count !== "3" || modeButton?.dataset.remaining !== "15") {
        errors.push("The migrated category Queue button did not show three questions and fifteen reviews.");
      }

      modeButton?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      stored = JSON.parse(localStorage.getItem(key) || "null");
      const firstAttempt = stored?.activeAttempt;
      const firstQuestion = questionById.get(String(firstAttempt?.questionId || ""));
      const correctIndex = firstAttempt && firstQuestion
        ? firstAttempt.optionOrder.indexOf(firstQuestion.correctOptionIndex)
        : -1;
      const wrongIndex = (correctIndex + 1) % 4;
      if (document.querySelector("#retry-dialog")?.open
        || document.querySelector("#queue-screen")?.hidden || !firstQuestion || correctIndex < 0
        || firstAttempt?.questionId !== expected.ids[0]) {
        errors.push("Migrated category Queue did not open its oldest MCQ in full-screen practice.");
      } else {
        document.querySelector('[data-review-option-index="' + wrongIndex + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
        stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.activeAttempt?.submitted || stored.activeAttempt.outcome !== "wrong"
          || stored.activeAttempt.wrongIncrement !== 2
          || stored.items.find((item) => item.questionId === firstAttempt.questionId)?.remaining !== 5
          || !document.querySelector("#retry-dialog-progress")?.textContent.includes("7 correct reviews remaining")) {
          errors.push("A new wrong review after baselining did not preserve five on Check and project exactly +2.");
        }
        document.querySelector("#retry-action-button")?.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
        stored = JSON.parse(localStorage.getItem(key) || "null");
        if (stored?.items.find((item) => item.questionId === firstAttempt.questionId)?.remaining !== 7
          || stored?.activeAttempt?.questionId !== expected.ids[1]) {
          errors.push("Wrong Continue did not produce seven reviews and give the next turn to the second Queue MCQ.");
        }
        document.querySelector("#queue-back-button")?.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      stored = JSON.parse(localStorage.getItem(key) || "null");
      sessionStorage.setItem("ppsc-smoke:retry-baseline-current", JSON.stringify(stored));
      return {
        errors,
        questionId: firstAttempt?.questionId || "",
        nextEligibleId: stored?.activeAttempt?.questionId || "",
        remaining: stored?.items.find((item) => item.questionId === firstAttempt?.questionId)?.remaining ?? null,
        itemShape: expected.itemShape
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for retry-count baseline idempotence."));
        }
      }, 50);
    })`);

    const retryBaselineReloadResult = await client.evaluate(`(async () => {
      const errors = [];
      const expected = ${JSON.stringify(retryExistingCountPreservationResult)};
      const key = "ppsc-prep:retry-queue:v1";
      let queue = JSON.parse(localStorage.getItem(key) || "null");
      const target = queue?.items.find((item) => item.questionId === expected.questionId);
      const otherCounts = (queue?.items || [])
        .filter((item) => item.questionId !== expected.questionId)
        .map((item) => item.remaining);
      if (queue?.countBaselineVersion !== 1 || target?.remaining !== 7
        || JSON.stringify(otherCounts) !== JSON.stringify([5, 5])) {
        errors.push("A second reload re-applied the five-count baseline or changed untouched items.");
      }
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      document.querySelector("#queue-mode-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      queue = JSON.parse(localStorage.getItem(key) || "null");
      if (document.querySelector("#retry-dialog")?.open
        || document.querySelector("#queue-screen")?.hidden
        || queue?.activeAttempt?.questionId !== expected.itemShape[1]?.questionId) {
        errors.push("After reload, category Queue did not resume the next insertion-order MCQ.");
      }
      document.querySelector("#queue-back-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const current = localStorage.getItem(key);
      if (current) sessionStorage.setItem("ppsc-smoke:retry-baseline-current", current);
      return {
        errors,
        remaining: target?.remaining ?? null,
        eligibleFirstId: queue?.activeAttempt?.questionId || "",
        spacedFromRecentMaximum: queue?.activeAttempt?.questionId !== expected.questionId
      };
    })()`);

    const legacyWrongAttemptSeed = await client.evaluate(`(() => {
      const errors = [];
      const key = "ppsc-prep:retry-queue:v1";
      const queue = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-baseline-legacy") || "null");
      const questionId = ${JSON.stringify(retryExistingCountPreservationResult.questionId)};
      const question = window.PPSC_QUIZ_DATA.questions.find((entry) => String(entry.id) === questionId);
      if (!queue || !question || queue.countBaselineVersion !== undefined) {
        errors.push("Submitted legacy +5 migration fixture was unavailable or already marked.");
        return { errors, questionId };
      }
      queue.activeAttempt = {
        questionId,
        optionOrder: [0, 1, 2, 3],
        selectedIndex: (question.correctOptionIndex + 1) % 4,
        submitted: true,
        outcome: "wrong",
        wrongIncrement: 5,
        resumeAction: "queue",
        context: "dedicated",
        kind: "queue"
      };
      localStorage.setItem(key, JSON.stringify(queue));
      return { errors, questionId };
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for legacy submitted wrong review testing."));
        }
      }, 50);
    })`);
    const legacyWrongAttemptResult = await client.evaluate(`(async () => {
      const errors = [];
      const key = "ppsc-prep:retry-queue:v1";
      const expectedId = ${JSON.stringify(legacyWrongAttemptSeed.questionId)};
      let queue = JSON.parse(localStorage.getItem(key) || "null");
      if (queue?.activeAttempt?.questionId !== expectedId || queue.activeAttempt.wrongIncrement !== 5
        || queue.countBaselineVersion !== 1
        || queue.items.some((entry) => entry.remaining !== 5)) {
        errors.push("One-time baselining did not preserve the already-submitted +5 outcome atomically.");
      }
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      document.querySelector("#queue-mode-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (document.querySelector("#retry-dialog")?.open
        || document.querySelector("#queue-screen")?.hidden
        || !document.querySelector("#retry-dialog-progress")?.textContent.includes("10 correct reviews remaining")) {
        errors.push("Saved submitted +5 attempt did not restore its projected total.");
      }
      document.querySelector("#retry-action-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      queue = JSON.parse(localStorage.getItem(key) || "null");
      if (queue?.items.find((entry) => entry.questionId === expectedId)?.remaining !== 10
        || queue?.activeAttempt?.questionId === expectedId) {
        errors.push("Continuing a saved submitted +5 attempt did not apply its original increment once and advance the Queue cycle.");
      }
      document.querySelector("#queue-back-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      return { errors, remaining: queue?.items.find((entry) => entry.questionId === expectedId)?.remaining ?? null };
    })()`);
    await client.evaluate(`(() => {
      const saved = sessionStorage.getItem("ppsc-smoke:retry-baseline-current");
      if (saved) {
        localStorage.setItem("ppsc-prep:retry-queue:v1", saved);
        // Downstream Custom Paper checks compare against this canonical saved
        // Queue fixture. Keep it aligned with the post-migration, post-+2 state
        // that was restored above rather than the pre-migration priority seed.
        sessionStorage.setItem("ppsc-smoke:retry-seed", saved);
      }
      sessionStorage.removeItem("ppsc-smoke:retry-baseline-legacy");
      sessionStorage.removeItem("ppsc-smoke:retry-baseline-current");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not restore the saved queue after legacy attempt testing."));
        }
      }, 50);
    })`);

    const paperSetupResult = await client.evaluate(`(async () => {
      const rawPause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const resolveRetryIfOpen = async () => {
        const dialog = document.querySelector("#retry-dialog");
        if (dialog && dialog.open) errors.push("Custom Paper unexpectedly opened a category Quiz review.");
        let safety = 0;
        while (dialog && dialog.open && safety < 4) {
          safety += 1;
          const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
          const attempt = queue && queue.activeAttempt;
          const question = attempt && window.PPSC_QUIZ_DATA.questions.find((item) => String(item.id) === String(attempt.questionId));
          const action = document.querySelector("#retry-action-button");
          const mainBefore = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          const scoreBefore = document.querySelector("#score-text")?.textContent;
          if (!attempt || !question || !action) break;
          if (!attempt.submitted) {
            const correctIndex = attempt.optionOrder.indexOf(question.correctOptionIndex);
            document.querySelector('[data-review-option-index="' + correctIndex + '"]')?.click();
            action.click();
            await rawPause();
            const checked = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
            if (checked?.score !== mainBefore?.score
              || JSON.stringify(checked?.answerHistory) !== JSON.stringify(mainBefore?.answerHistory)
              || document.querySelector("#score-text")?.textContent !== scoreBefore) {
              errors.push("Checking a Custom Paper retry changed Paper marks or answer history.");
            }
          }
          action.click();
          await rawPause();
          const resumed = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          if (resumed && (resumed.score !== mainBefore?.score
            || JSON.stringify(resumed.answerHistory) !== JSON.stringify(mainBefore?.answerHistory)
            || document.querySelector("#score-text")?.textContent !== scoreBefore)) {
            errors.push("Completing a Custom Paper retry changed Paper marks or answer history.");
          }
        }
      };
      const pause = async () => {
        await rawPause();
        await resolveRetryIfOpen();
      };
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const storageKey = "ppsc-prep:active-session:v1";
      const selectedCategoryIds = ["general-knowledge", "urdu"];
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question && question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : (question ? question.options.map(optionText) : []);
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const currentCanonicalQuestion = () => questionById.get(
        String(document.querySelector("#question-text").dataset.questionId)
      );
      const currentCorrectRenderedIndex = () => {
        const question = currentCanonicalQuestion();
        return question
          ? renderedOptionTexts().indexOf(displayOptions(question)[question.correctOptionIndex])
          : -1;
      };
      const answerCurrent = async (correct) => {
        const question = currentCanonicalQuestion();
        const correctIndex = currentCorrectRenderedIndex();
        if (correctIndex < 0) {
          errors.push("Custom Paper could not map the current correct answer.");
          return null;
        }
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        const button = document.querySelector('[data-option-index="' + selectedIndex + '"]');
        if (!button) {
          errors.push("Custom Paper answer option was missing.");
          return null;
        }
        button.click();
        document.querySelector("#action-button").click();
        await pause();
        return {
          question,
          correctIndex,
          selectedIndex,
          correctText: renderedOptionTexts()[correctIndex]
        };
      };

      const backButton = document.querySelector("#back-button");
      if (backButton && visible(document.querySelector("#quiz-screen"))) {
        backButton.click();
        await pause();
      }
      localStorage.removeItem(storageKey);

      const paperCard = document.querySelector("#paper-builder-card");
      if (!paperCard || !visible(paperCard)) errors.push("Start Paper Here card was not visible on the category screen.");
      if (paperCard && paperCard.closest("#category-grid")) errors.push("Start Paper Here card was incorrectly rendered inside the subject category grid.");
      if (document.querySelectorAll("#category-grid .category-card").length !== 11) errors.push("The paper card changed the 11 subject-category cards.");
      if (paperCard) paperCard.click();
      await pause();

      const setupScreen = document.querySelector("#paper-setup-screen");
      if (!visible(setupScreen)) errors.push("Start Paper Here did not open the paper setup screen.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Paper setup has horizontal overflow on mobile.");
      const categoryCheckboxes = [...document.querySelectorAll("#paper-category-options input[name='paper-category']")];
      if (categoryCheckboxes.length !== 11) errors.push("Paper setup did not render all 11 category checkboxes.");
      if (categoryCheckboxes.some((checkbox) => checkbox.disabled)) errors.push("A populated paper category was incorrectly disabled.");
      if (categoryCheckboxes.some((checkbox) => checkbox.checked)) errors.push("Paper setup did not begin with an empty category selection.");
      if (!document.querySelector("#paper-start-button").disabled) errors.push("Paper start was enabled without a selected category.");

      document.querySelector("#paper-select-all-button").click();
      await pause();
      if (categoryCheckboxes.some((checkbox) => !checkbox.checked)) errors.push("Select all did not select every available paper category.");
      if (document.querySelector("#paper-start-button").disabled) errors.push("Paper start stayed disabled after Select all.");
      document.querySelector("#paper-clear-all-button").click();
      await pause();
      if (categoryCheckboxes.some((checkbox) => checkbox.checked)) errors.push("Clear did not remove every paper category selection.");
      if (!document.querySelector("#paper-start-button").disabled) errors.push("Paper start stayed enabled after clearing the categories.");

      selectedCategoryIds.forEach((categoryId) => {
        const checkbox = document.querySelector('input[data-paper-category="' + categoryId + '"]');
        if (!checkbox) {
          errors.push("Known paper category checkbox was missing: " + categoryId + ".");
          return;
        }
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      });
      await pause();
      if (document.querySelector("#paper-start-button").disabled) errors.push("Paper start was disabled for two sufficiently large categories.");
      if (!document.querySelector("#paper-selection-summary").textContent.includes("2 categories selected")) errors.push("Paper setup summary did not announce the two selected categories.");
      document.querySelector("#paper-start-button").click();
      await pause();

      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Starting a Custom Paper did not open the question screen.");
      if (visible(document.querySelector("#question-range-options"))) errors.push("Custom Paper incorrectly opened the category range selector.");
      if (document.querySelector("#quiz-screen").dataset.sessionKind !== "paper") errors.push("Custom Paper question screen did not expose paper session kind.");
      if (document.querySelector("#quiz-screen").dataset.mode !== "quiz" || document.querySelector("#quiz-screen").dataset.scope !== "all") errors.push("Custom Paper did not reuse scored Quiz/all scope.");
      if (!document.querySelector("#quiz-category").textContent.includes("Custom Paper") || !document.querySelector("#quiz-category").textContent.includes("100 MCQs")) errors.push("Custom Paper header did not describe the paper.");
      if (!document.querySelector("#question-kind").textContent.includes("CUSTOM PAPER")) errors.push("Custom Paper question did not show its paper/category label.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Custom Paper question screen has horizontal overflow on mobile.");

      const initialSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!initialSnapshot || initialSnapshot.version !== 8 || initialSnapshot.sessionKind !== "paper") errors.push("Custom Paper was not stored with the v8 paper-session schema.");
      if (!initialSnapshot || initialSnapshot.categoryId !== null || initialSnapshot.computerSourceScope !== null || initialSnapshot.mode !== "quiz" || initialSnapshot.scope !== "all" || initialSnapshot.partIndex !== null || initialSnapshot.importantOnly !== false) errors.push("Custom Paper stored invalid category/mode/scope fields.");
      if (!initialSnapshot || initialSnapshot.rangeStart !== null || initialSnapshot.rangeEnd !== null || initialSnapshot.rangePoolSize !== null || initialSnapshot.rangePoolQuestionIds !== null || initialSnapshot.rangeQuestionIds !== null) errors.push("Custom Paper incorrectly stored category-range metadata.");
      if (!initialSnapshot || JSON.stringify(initialSnapshot.paperCategoryIds) !== JSON.stringify(selectedCategoryIds)) errors.push("Custom Paper did not store the selected category IDs in data order.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.questionIds) || initialSnapshot.questionIds.length !== 100 || new Set(initialSnapshot.questionIds).size !== 100) errors.push("Custom Paper did not contain exactly 100 unique question IDs.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.optionOrders) || initialSnapshot.optionOrders.length !== 100) errors.push("Custom Paper did not store 100 option orders.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.answerHistory) || initialSnapshot.answerHistory.length !== 100
        || initialSnapshot.learnVisitedQuestionIds !== null || initialSnapshot.learnReviewCountedQuestionIds !== null) {
        errors.push("Custom Paper did not store a 100-entry Quiz answer history.");
      }
      const sampledQuestions = initialSnapshot
        ? initialSnapshot.questionIds.map((questionId) => questionById.get(String(questionId))).filter(Boolean)
        : [];
      if (sampledQuestions.length !== 100) errors.push("A Custom Paper question ID was absent from the bank.");
      if (sampledQuestions.some((question) => !selectedCategoryIds.includes(question.categoryId))) errors.push("Custom Paper included a question outside the selected categories.");
      const sampledCategoryCounts = Object.fromEntries(selectedCategoryIds.map((categoryId) => [
        categoryId,
        sampledQuestions.filter((question) => question.categoryId === categoryId).length
      ]));
      if (selectedCategoryIds.some((categoryId) => sampledCategoryCounts[categoryId] !== 50)) errors.push("Custom Paper did not allocate exactly 50 General Knowledge and 50 Urdu questions.");
      if (document.querySelector("#question-total").textContent.trim() !== "100" || document.querySelector("#question-number-input").max !== "100") errors.push("Custom Paper progress did not use exactly 100 questions.");
      if (document.querySelector("#score-text").textContent !== "C:0 W:0 Marks:0") errors.push("Custom Paper live score did not start at zero.");

      const firstUrduIndex = sampledQuestions.findIndex((question) => question.categoryId === "urdu");
      const firstThreeContainUrdu = sampledQuestions.slice(0, 3).some((question) => question.categoryId === "urdu");
      const fourthWrongIndex = firstThreeContainUrdu ? 3 : firstUrduIndex;
      const wrongIndexes = [...new Set([0, 1, 2, fourthWrongIndex])].sort((left, right) => left - right);
      const checkpointLastSubmittedIndex = Math.max(...wrongIndexes);
      const formatMarks = (correct, wrong) => Number((correct - (wrong * 0.25)).toFixed(2)).toString();
      if (firstUrduIndex < 0 || wrongIndexes.length !== 4 || fourthWrongIndex < 3) errors.push("Custom Paper could not prepare four distinct wrong answers including Urdu.");

      let checkpointCorrect = 0;
      let checkpointWrong = 0;
      for (let index = 0; index <= checkpointLastSubmittedIndex; index += 1) {
        const shouldAnswerCorrectly = !wrongIndexes.includes(index);
        const answered = await answerCurrent(shouldAnswerCorrectly);
        if (answered) {
          const isUrdu = answered.question && answered.question.categoryId === "urdu";
          const expectedTitle = shouldAnswerCorrectly
            ? (isUrdu ? "درست!" : "Correct!")
            : (isUrdu ? "غلط" : "Incorrect");
          if (document.querySelector("#feedback-title").textContent !== expectedTitle) errors.push("Custom Paper instant feedback was not localized for question " + (index + 1) + ".");
          if (!shouldAnswerCorrectly && !document.querySelector("#feedback-text").textContent.includes(answered.correctText)) errors.push("Custom Paper did not reveal the localized correct answer after wrong response " + (index + 1) + ".");
          if (isUrdu) {
            const feedback = document.querySelector("#feedback");
            if (!feedback.classList.contains("is-urdu") || feedback.lang !== "ur" || feedback.dir !== "rtl" || /[A-Za-z]/.test(feedback.textContent)) errors.push("Custom Paper Urdu feedback was not fully localized.");
          }
        }
        if (shouldAnswerCorrectly) checkpointCorrect += 1;
        else checkpointWrong += 1;
        const expectedLiveScore = "C:" + checkpointCorrect + " W:" + checkpointWrong + " Marks:" + formatMarks(checkpointCorrect, checkpointWrong);
        if (document.querySelector("#score-text").textContent !== expectedLiveScore) errors.push("Custom Paper live score was incorrect after answer " + (index + 1) + ".");
        if (index < checkpointLastSubmittedIndex) {
          document.querySelector("#action-button").click();
          await pause();
        }
      }
      if (checkpointWrong !== 4 || document.querySelector("#score-text").textContent !== "C:" + checkpointCorrect + " W:4 Marks:" + formatMarks(checkpointCorrect, 4)) errors.push("Four Custom Paper wrong answers did not deduct exactly one mark.");
      const paperRetryQueue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      const paperRetrySeed = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-seed") || "null");
      if (document.querySelector("#retry-dialog")?.open || paperRetryQueue?.activeAttempt
        || JSON.stringify(paperRetryQueue?.items || []) !== JSON.stringify(paperRetrySeed?.items || [])
        || !document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0") {
        errors.push("Custom Paper automatically displayed or mutated the pre-existing category Quiz review queue.");
      }
      if (document.querySelector("#global-retry-queue-button")) {
        errors.push("Custom Paper retained a removed global Queue control.");
      }

      document.querySelector("#action-button").click();
      await pause();
      const checkpointCorrectAnswer = await answerCurrent(true);
      checkpointCorrect += 1;
      if (checkpointCorrectAnswer) {
        const expectedTitle = checkpointCorrectAnswer.question.categoryId === "urdu" ? "درست!" : "Correct!";
        if (document.querySelector("#feedback-title").textContent !== expectedTitle) errors.push("Custom Paper did not localize instant correct feedback.");
      }
      if (document.querySelector("#score-text").textContent !== "C:" + checkpointCorrect + " W:4 Marks:" + formatMarks(checkpointCorrect, 4)) errors.push("Custom Paper live score was incorrect after the checkpoint correct answer.");
      document.querySelector("#action-button").click();
      await pause();

      const pendingCorrectIndex = currentCorrectRenderedIndex();
      const pendingButton = document.querySelector('[data-option-index="' + pendingCorrectIndex + '"]');
      if (pendingCorrectIndex < 0 || !pendingButton) {
        errors.push("Custom Paper could not prepare a pending correct selection for Continue.");
      } else {
        pendingButton.click();
        await pause();
      }
      const resumeSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      const expectedCurrentIndex = checkpointLastSubmittedIndex + 2;
      if (!resumeSnapshot || resumeSnapshot.currentIndex !== expectedCurrentIndex || resumeSnapshot.submitted || resumeSnapshot.selectedIndex !== pendingCorrectIndex || resumeSnapshot.score !== checkpointCorrect) errors.push("Custom Paper pending Continue checkpoint was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.answerHistory.filter((entry) => entry && entry[1]).length !== expectedCurrentIndex) errors.push("Custom Paper checkpoint did not preserve the submitted response prefix.");
      if (resumeSnapshot) {
        const persistedWrongIndexes = resumeSnapshot.answerHistory
          .map((entry, index) => entry && entry[1] && entry[0] !== resumeSnapshot.optionOrders[index].indexOf(questionById.get(String(resumeSnapshot.questionIds[index])).correctOptionIndex) ? index : -1)
          .filter((index) => index >= 0);
        if (JSON.stringify(persistedWrongIndexes) !== JSON.stringify(wrongIndexes)) errors.push("Custom Paper checkpoint did not preserve the intended four wrong question indexes.");
      }

      return {
        errors,
        expected: {
          selectedCategoryIds,
          sampledCategoryCounts,
          questionIds: resumeSnapshot ? resumeSnapshot.questionIds : [],
          optionOrders: resumeSnapshot ? resumeSnapshot.optionOrders : [],
          answerHistory: resumeSnapshot ? resumeSnapshot.answerHistory : [],
          currentIndex: resumeSnapshot ? resumeSnapshot.currentIndex : -1,
          currentQuestionId: document.querySelector("#question-text").dataset.questionId,
          currentOptionTexts: renderedOptionTexts(),
          selectedIndex: pendingCorrectIndex,
          score: checkpointCorrect,
          wrongIndexes
        }
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Custom Paper Continue verification in time."));
        }
      }, 50);
    })`);

    const paperResumeResult = await client.evaluate(`(async () => {
      const rawPause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const resolveRetryIfOpen = async () => {
        const dialog = document.querySelector("#retry-dialog");
        if (dialog && dialog.open) errors.push("Resumed Custom Paper unexpectedly opened a category Quiz review.");
        let safety = 0;
        while (dialog && dialog.open && safety < 4) {
          safety += 1;
          const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
          const attempt = queue && queue.activeAttempt;
          const question = attempt && window.PPSC_QUIZ_DATA.questions.find((item) => String(item.id) === String(attempt.questionId));
          const action = document.querySelector("#retry-action-button");
          const mainBefore = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          const scoreBefore = document.querySelector("#score-text")?.textContent;
          if (!attempt || !question || !action) break;
          if (!attempt.submitted) {
            const correctIndex = attempt.optionOrder.indexOf(question.correctOptionIndex);
            document.querySelector('[data-review-option-index="' + correctIndex + '"]')?.click();
            action.click();
            await rawPause();
            const checked = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
            if (checked?.score !== mainBefore?.score
              || JSON.stringify(checked?.answerHistory) !== JSON.stringify(mainBefore?.answerHistory)
              || document.querySelector("#score-text")?.textContent !== scoreBefore) {
              errors.push("Checking a resumed Custom Paper retry changed Paper marks or answer history.");
            }
          }
          action.click();
          await rawPause();
          const resumed = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          if (resumed && (resumed.score !== mainBefore?.score
            || JSON.stringify(resumed.answerHistory) !== JSON.stringify(mainBefore?.answerHistory)
            || document.querySelector("#score-text")?.textContent !== scoreBefore)) {
            errors.push("Completing a resumed Custom Paper retry changed Paper marks or answer history.");
          }
        }
      };
      const pause = async () => {
        await rawPause();
        await resolveRetryIfOpen();
      };
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const expected = ${JSON.stringify(paperSetupResult.expected)};
      const data = window.PPSC_QUIZ_DATA;
      const storageKey = "ppsc-prep:active-session:v1";
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question && question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : (question ? question.options.map(optionText) : []);
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const currentCanonicalQuestion = () => questionById.get(
        String(document.querySelector("#question-text").dataset.questionId)
      );
      const currentCorrectRenderedIndex = () => {
        const question = currentCanonicalQuestion();
        return question
          ? renderedOptionTexts().indexOf(displayOptions(question)[question.correctOptionIndex])
          : -1;
      };
      const selectAndCheckCorrect = async () => {
        const question = currentCanonicalQuestion();
        const correctIndex = currentCorrectRenderedIndex();
        const button = document.querySelector('[data-option-index="' + correctIndex + '"]');
        if (correctIndex < 0 || !button) {
          errors.push("Custom Paper Continue could not map a correct answer.");
          return null;
        }
        button.click();
        document.querySelector("#action-button").click();
        await pause();
        const expectedTitle = question && question.categoryId === "urdu" ? "درست!" : "Correct!";
        if (document.querySelector("#feedback-title").textContent !== expectedTitle) errors.push("Custom Paper completion lost localized instant correct feedback.");
        return question;
      };

      if (!visible(document.querySelector("#category-screen"))) errors.push("Custom Paper reload did not return to categories before Continue.");
      if (!visible(document.querySelector("#continue-session-card"))) errors.push("Custom Paper reload did not show Continue.");
      if (document.querySelector("#continue-session-title").textContent !== "Continue Custom Paper") errors.push("Custom Paper Continue title was incorrect.");
      const continueMeta = document.querySelector("#continue-session-meta").textContent;
      if (!continueMeta.includes("Custom Paper") || !continueMeta.includes("2 categories") || !continueMeta.includes("Question " + (expected.currentIndex + 1) + " of 100")) errors.push("Custom Paper Continue metadata was incomplete.");
      const storedBeforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!storedBeforeContinue || storedBeforeContinue.version !== 8 || storedBeforeContinue.sessionKind !== "paper" || storedBeforeContinue.categoryId !== null || storedBeforeContinue.computerSourceScope !== null) errors.push("Reload changed the Custom Paper session schema.");
      if (!storedBeforeContinue || storedBeforeContinue.rangeStart !== null || storedBeforeContinue.rangeEnd !== null || storedBeforeContinue.rangePoolSize !== null || storedBeforeContinue.rangePoolQuestionIds !== null || storedBeforeContinue.rangeQuestionIds !== null) errors.push("Reload added range metadata to Custom Paper.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.paperCategoryIds) !== JSON.stringify(expected.selectedCategoryIds)) errors.push("Reload changed the selected Custom Paper categories.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.questionIds) !== JSON.stringify(expected.questionIds)) errors.push("Reload changed the Custom Paper question IDs/order.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.optionOrders) !== JSON.stringify(expected.optionOrders)) errors.push("Reload changed the Custom Paper option orders.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.answerHistory) !== JSON.stringify(expected.answerHistory)) errors.push("Reload changed the Custom Paper response history.");
      if (!storedBeforeContinue || storedBeforeContinue.currentIndex !== expected.currentIndex || storedBeforeContinue.score !== expected.score) errors.push("Reload changed the Custom Paper current position or score.");
      const paperRetrySeed = JSON.parse(sessionStorage.getItem("ppsc-smoke:retry-seed") || "null");
      const retryBeforePaperContinue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (retryBeforePaperContinue?.activeAttempt
        || JSON.stringify(retryBeforePaperContinue?.items || []) !== JSON.stringify(paperRetrySeed?.items || [])
        || !document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0") {
        errors.push("Reload automatically exposed or changed category Quiz reviews while a Custom Paper was pending.");
      }
      if (document.querySelector("#global-retry-queue-button")) {
        errors.push("Pending Custom Paper reload retained a removed global Queue control.");
      }

      document.querySelector("#continue-session-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen")) || document.querySelector("#quiz-screen").dataset.sessionKind !== "paper") errors.push("Continue did not reopen the Custom Paper question screen.");
      if (!document.querySelector("#quiz-category").textContent.includes("Custom Paper") || document.querySelector("#question-total").textContent.trim() !== "100") errors.push("Restored Custom Paper header/progress was incorrect.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.currentQuestionId) errors.push("Continue restored the wrong Custom Paper question.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.currentOptionTexts)) errors.push("Continue changed the current Custom Paper option order.");
      const restoredPendingButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!restoredPendingButton || !restoredPendingButton.classList.contains("is-selected") || restoredPendingButton.disabled) errors.push("Continue did not restore the pending Custom Paper selection.");
      if (visible(document.querySelector("#feedback")) || document.querySelector("#action-button").textContent !== "Check Answer") errors.push("Continue incorrectly submitted the pending Custom Paper answer.");
      const formatMarks = (correct, wrong) => Number((correct - (wrong * 0.25)).toFixed(2)).toString();
      if (document.querySelector("#score-text").textContent !== "C:" + expected.score + " W:4 Marks:" + formatMarks(expected.score, 4)) errors.push("Continue did not restore the Custom Paper live correct/wrong/marks score.");
      const storedAfterContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!storedAfterContinue || JSON.stringify(storedAfterContinue.questionIds) !== JSON.stringify(expected.questionIds) || JSON.stringify(storedAfterContinue.optionOrders) !== JSON.stringify(expected.optionOrders) || JSON.stringify(storedAfterContinue.answerHistory) !== JSON.stringify(expected.answerHistory)) errors.push("Continue changed Custom Paper IDs, options, or responses.");
      const retryAfterPaperContinue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (document.querySelector("#retry-dialog")?.open || retryAfterPaperContinue?.activeAttempt
        || JSON.stringify(retryAfterPaperContinue?.items || []) !== JSON.stringify(paperRetrySeed?.items || [])
        || !document.querySelector("#retry-queue-chip")?.hidden
        || document.querySelector("#retry-queue-count")?.textContent !== "0") {
        errors.push("Custom Paper Continue automatically displayed or mutated category Quiz reviews.");
      }
      if (document.querySelector("#global-retry-queue-button")) {
        errors.push("Resumed Custom Paper retained removed global Queue access.");
      }

      const numberInput = document.querySelector("#question-number-input");
      numberInput.value = "100";
      numberInput.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
      if (visible(document.querySelector("#results-screen"))) errors.push("Custom Paper opened results after jumping to an unanswered last question.");
      await selectAndCheckCorrect();
      if (document.querySelector("#score-text").textContent !== "C:" + (expected.score + 1) + " W:4 Marks:" + formatMarks(expected.score + 1, 4)) errors.push("Custom Paper score was incorrect after answering the last question.");
      if (document.querySelector("#action-button").textContent !== "Next Unanswered" || document.querySelector("#action-button").dataset.action !== "next-unanswered") errors.push("Custom Paper last question did not offer Next Unanswered.");
      document.querySelector("#action-button").click();
      await pause();
      if (visible(document.querySelector("#results-screen"))) errors.push("Custom Paper opened results while an earlier answer remained pending.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.currentQuestionId) errors.push("Next Unanswered did not restore the first pending Custom Paper question.");
      const pendingAfterGuard = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!pendingAfterGuard || !pendingAfterGuard.classList.contains("is-selected") || pendingAfterGuard.disabled) errors.push("Next Unanswered lost the pending Custom Paper selection.");
      document.querySelector("#action-button").click();
      await pause();
      const pendingQuestion = questionById.get(String(expected.currentQuestionId));
      const pendingFeedbackTitle = pendingQuestion && pendingQuestion.categoryId === "urdu" ? "درست!" : "Correct!";
      if (document.querySelector("#feedback-title").textContent !== pendingFeedbackTitle || document.querySelector("#score-text").textContent !== "C:" + (expected.score + 2) + " W:4 Marks:" + formatMarks(expected.score + 2, 4)) errors.push("Submitting the restored pending answer produced the wrong Custom Paper score or feedback language.");
      document.querySelector("#action-button").click();
      await pause();

      let safety = 0;
      while (!visible(document.querySelector("#results-screen")) && safety < 110) {
        safety += 1;
        const optionButtons = [...document.querySelectorAll("#options-container .option-button")];
        const submitted = optionButtons.length === 4 && optionButtons.every((button) => button.disabled);
        if (!submitted) await selectAndCheckCorrect();
        document.querySelector("#action-button").click();
        await pause();
      }
      if (safety >= 110 || !visible(document.querySelector("#results-screen"))) errors.push("Custom Paper did not complete after all 100 questions were answered.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Custom Paper results have horizontal overflow on mobile.");
      if (localStorage.getItem(storageKey) !== null) errors.push("Completed Custom Paper remained resumable.");
      if (document.querySelector("#results-title").textContent !== "Paper complete!") errors.push("Custom Paper completion title was incorrect.");
      if (document.querySelector("#result-score").textContent.replace(/\\s/g, "") !== "95/100") errors.push("Custom Paper final net score was not 95/100.");
      if (document.querySelector("#result-correct-count").textContent.trim() !== "96") errors.push("Custom Paper final correct count was not 96.");
      if (document.querySelector("#result-wrong-count").textContent.trim() !== "4") errors.push("Custom Paper final wrong count was not 4.");
      if (document.querySelector("#result-paper-score").textContent.replace(/\\s/g, "") !== "95/100") errors.push("Custom Paper breakdown net score was not 95/100.");
      if (!document.querySelector("#result-penalty").textContent.includes("-1")) errors.push("Custom Paper did not show the one-mark penalty for four wrong answers.");
      if (!document.querySelector("#result-summary").textContent.includes("96 correct") || !document.querySelector("#result-summary").textContent.includes("4 wrong") || !document.querySelector("#result-summary").textContent.includes("95 out of 100")) errors.push("Custom Paper summary omitted correct, wrong, or net marks.");
      if (document.querySelector("#play-again-button").textContent !== "Attempt New Paper") errors.push("Custom Paper result did not offer Attempt New Paper.");
      if (document.querySelector("#global-retry-queue-button")) {
        errors.push("Custom Paper Results retained removed global Queue access.");
      }

      const urduLabels = ["الف", "ب", "ج", "د"];
      const englishLabels = ["A", "B", "C", "D"];
      const expectedWrongIndexes = Array.isArray(expected.wrongIndexes) ? expected.wrongIndexes : [];
      const expectedCorrectIndexes = Array.from({ length: 100 }, (_, index) => index)
        .filter((index) => !expectedWrongIndexes.includes(index));
      const assertReviewRows = (items, questionIndexes, reviewKind) => {
        let sawUrdu = false;
        if (items.length !== questionIndexes.length) {
          errors.push(reviewKind + " review rows did not match the expected response indexes.");
          return sawUrdu;
        }
        items.forEach((item, rowIndex) => {
          const questionIndex = questionIndexes[rowIndex];
          const question = questionById.get(String(expected.questionIds[questionIndex]));
          const optionOrder = expected.optionOrders[questionIndex];
          const heading = item.querySelector("strong");
          const meta = item.querySelector(".result-review-meta");
          const secondaryUrdu = item.querySelector(".result-review-question-urdu");
          const answers = [...item.querySelectorAll(".result-review-answer")];
          if (!question || !Array.isArray(optionOrder) || optionOrder.length !== 4) {
            errors.push(reviewKind + " review row could not be mapped to canonical data.");
            return;
          }
          const renderedOptions = optionOrder.map((originalIndex) => displayOptions(question)[originalIndex]);
          const correctRenderedIndex = optionOrder.indexOf(question.correctOptionIndex);
          const selectedRenderedIndex = reviewKind === "correct"
            ? correctRenderedIndex
            : (correctRenderedIndex + 1) % 4;
          if (correctRenderedIndex < 0 || answers.length !== 2) {
            errors.push(reviewKind + " review row did not expose two mapped answers.");
            return;
          }

          if (question.categoryId === "urdu") {
            sawUrdu = true;
            const expectedHeading = "سوال " + (questionIndex + 1) + "۔ " + question.questionUrdu;
            const expectedSelected = "آپ کا جواب: " + urduLabels[selectedRenderedIndex] + "۔ " + renderedOptions[selectedRenderedIndex];
            const expectedCorrect = "درست جواب: " + urduLabels[correctRenderedIndex] + "۔ " + renderedOptions[correctRenderedIndex];
            if (!item.classList.contains("is-urdu") || item.lang !== "ur" || item.dir !== "rtl") errors.push("An Urdu " + reviewKind + " review row lacked RTL language attributes.");
            if (!heading || heading.textContent !== expectedHeading || /[A-Za-z]/.test(heading.textContent)) errors.push("An Urdu " + reviewKind + " review row did not show only its Urdu stem.");
            if (secondaryUrdu) errors.push("An Urdu " + reviewKind + " review row duplicated its stem in a secondary Urdu paragraph.");
            if (!meta || meta.textContent !== "زمرہ: اردو" || meta.lang !== "ur" || meta.dir !== "rtl" || /[A-Za-z]/.test(meta.textContent)) errors.push("An Urdu " + reviewKind + " review row did not localize its category metadata.");
            if (answers.length !== 2 || answers[0].textContent !== expectedSelected || answers[1].textContent !== expectedCorrect || answers.some((answer) => answer.lang !== "ur" || answer.dir !== "rtl" || /[A-Za-z]/.test(answer.textContent))) errors.push("An Urdu " + reviewKind + " review row did not show the aligned Urdu selected/correct options.");
          } else {
            const category = data.categories.find((candidate) => candidate.id === question.categoryId);
            const expectedHeading = "Question " + (questionIndex + 1) + ". " + question.question.trim();
            const expectedSelected = "Your answer: " + englishLabels[selectedRenderedIndex] + ". " + renderedOptions[selectedRenderedIndex];
            const expectedCorrect = "Correct answer: " + englishLabels[correctRenderedIndex] + ". " + renderedOptions[correctRenderedIndex];
            if (item.classList.contains("is-urdu") || item.hasAttribute("lang") || item.hasAttribute("dir")) errors.push("A non-Urdu " + reviewKind + " review row retained Urdu RTL attributes.");
            if (!heading || heading.textContent !== expectedHeading) errors.push("A non-Urdu " + reviewKind + " review row had the wrong canonical stem.");
            if (!meta || meta.textContent !== "Category: " + (category ? category.name : "")) errors.push("A non-Urdu " + reviewKind + " review row had the wrong category metadata.");
            if (!secondaryUrdu || secondaryUrdu.textContent !== question.questionUrdu || secondaryUrdu.lang !== "ur" || secondaryUrdu.dir !== "rtl") errors.push("A non-Urdu " + reviewKind + " review row lost its secondary Urdu translation.");
            if (answers.length !== 2 || answers[0].textContent !== expectedSelected || answers[1].textContent !== expectedCorrect) errors.push("A non-Urdu " + reviewKind + " review row had the wrong selected/correct options.");
          }
        });
        return sawUrdu;
      };

      const correctControl = document.querySelector("#result-correct-button");
      correctControl.click();
      await pause();
      const correctItems = [...document.querySelectorAll("#result-review-list .result-review-item.is-correct")];
      if (!visible(document.querySelector("#result-review-panel")) || correctControl.getAttribute("aria-expanded") !== "true") errors.push("Correct result control did not open its review list.");
      if (correctItems.length !== 96 || document.querySelectorAll("#result-review-list > li").length !== 96) errors.push("Correct review list did not contain exactly 96 answers.");
      if (!assertReviewRows(correctItems, expectedCorrectIndexes, "correct")) errors.push("Correct review did not include an Urdu row.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Correct-answer review has horizontal overflow on mobile.");
      document.querySelector("#result-review-close-button").click();
      await pause();
      if (visible(document.querySelector("#result-review-panel")) || document.activeElement !== correctControl || correctControl.getAttribute("aria-expanded") !== "false") errors.push("Closing the correct review did not hide it and restore focus.");

      const wrongControl = document.querySelector("#result-wrong-button");
      wrongControl.click();
      await pause();
      const wrongItems = [...document.querySelectorAll("#result-review-list .result-review-item.is-wrong")];
      if (!visible(document.querySelector("#result-review-panel")) || wrongControl.getAttribute("aria-expanded") !== "true") errors.push("Wrong result control did not open its review list.");
      if (wrongItems.length !== 4 || document.querySelectorAll("#result-review-list > li").length !== 4) errors.push("Wrong review list did not contain exactly four answers.");
      if (!assertReviewRows(wrongItems, expectedWrongIndexes, "wrong")) errors.push("Wrong review did not include an Urdu row.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Wrong-answer review has horizontal overflow on mobile.");
      document.querySelector("#result-review-close-button").click();
      await pause();
      if (visible(document.querySelector("#result-review-panel")) || document.activeElement !== wrongControl || wrongControl.getAttribute("aria-expanded") !== "false") errors.push("Closing the wrong review did not hide it and restore focus.");

      const completedQuestionIds = expected.questionIds.slice();
      document.querySelector("#play-again-button").click();
      await pause();
      const newPaperSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!visible(document.querySelector("#quiz-screen")) || !newPaperSnapshot || newPaperSnapshot.sessionKind !== "paper") errors.push("Attempt New Paper did not start another paper session.");
      if (!newPaperSnapshot || newPaperSnapshot.questionIds.length !== 100 || new Set(newPaperSnapshot.questionIds).size !== 100) errors.push("Attempt New Paper did not create 100 unique questions.");
      if (!newPaperSnapshot || JSON.stringify(newPaperSnapshot.paperCategoryIds) !== JSON.stringify(expected.selectedCategoryIds)) errors.push("Attempt New Paper changed the selected categories.");
      if (!newPaperSnapshot || JSON.stringify(newPaperSnapshot.questionIds) === JSON.stringify(completedQuestionIds)) errors.push("Attempt New Paper reused the previous paper question order.");
      localStorage.removeItem(storageKey);

      return {
        errors,
        exactQuestionCount: 100,
        selectedCategoryIds: expected.selectedCategoryIds,
        balancedCategoryCounts: expected.sampledCategoryCounts,
        correct: 96,
        wrong: 4,
        penalty: 1,
        netMarks: 95,
        continueRestored: true,
        reshuffled: Boolean(newPaperSnapshot && JSON.stringify(newPaperSnapshot.questionIds) !== JSON.stringify(completedQuestionIds))
      };
    })()`);

    // New Quiz answers now seed finite confirmation work. A correct answer
    // creates exactly one confirmation only when the MCQ is not already
    // waiting; queue reviews still apply their outcome only on Continue.
    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      localStorage.removeItem("ppsc-prep:difficult-question-ids:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for correct-confirmation queue testing."));
        }
      }, 50);
    })`);

    const confirmationQueueResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const retryKey = "ppsc-prep:retry-queue:v1";
      const categoryId = "job-related-finance-taxation";
      const questions = window.PPSC_QUIZ_DATA.questions;
      const byId = new Map(questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const visible = (element) => Boolean(
        element && !element.hidden && getComputedStyle(element).display !== "none" && element.getClientRects().length > 0
      );
      const showCategories = async () => {
        if (visible(document.querySelector("#queue-screen"))) {
          document.querySelector("#queue-back-button")?.click();
          await pause();
        }
        if (visible(document.querySelector("#mode-screen"))) {
          document.querySelector("#mode-back-button")?.click();
          await pause();
        }
      };
      const startSingleQuiz = async () => {
        await showCategories();
        document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
        document.querySelector("#quiz-mode-button")?.click();
        const start = document.querySelector("#question-range-start-input");
        const end = document.querySelector("#question-range-end-input");
        if (!start || !end) return false;
        start.value = "1";
        end.value = "1";
        document.querySelector("#question-range-form")?.requestSubmit();
        await pause();
        return true;
      };
      const startCategoryQueue = async () => {
        await showCategories();
        document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
        await pause();
        document.querySelector("#queue-mode-button")?.click();
        await pause();
        if (!visible(document.querySelector("#queue-screen")) || document.querySelector("#retry-dialog")?.open) {
          errors.push("Manual category Queue did not open its full-screen practice page.");
        }
      };
      const answerMain = async (correct) => {
        const questionId = String(document.querySelector("#question-text")?.dataset.questionId || "");
        const question = byId.get(questionId);
        const renderedOptions = [...document.querySelectorAll("#options-container .option-text")]
          .map((element) => element.textContent);
        const correctText = question ? optionText(question.options[question.correctOptionIndex]) : "";
        const correctIndex = renderedOptions.indexOf(correctText);
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        document.querySelector('[data-option-index="' + selectedIndex + '"]')?.click();
        document.querySelector("#action-button")?.click();
        await pause();
        return question;
      };
      const answerDedicated = async (correct) => {
        const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
        const attempt = queue?.activeAttempt;
        const question = byId.get(String(attempt?.questionId || ""));
        const correctIndex = attempt && question
          ? attempt.optionOrder.indexOf(question.correctOptionIndex)
          : -1;
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        document.querySelector('[data-review-option-index="' + selectedIndex + '"]')?.click();
        document.querySelector("#retry-action-button")?.click();
        await pause();
        return { attempt, question };
      };

      if (!await startSingleQuiz()) {
        return { errors: ["Correct-confirmation fixture could not start."], questionId: "" };
      }
      const firstQuestion = await answerMain(true);
      const questionId = String(firstQuestion?.id || "");
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      let item = queue?.items.find((entry) => entry.questionId === questionId);
      const firstRecord = item ? JSON.stringify(item) : "";
      if (!item || item.remaining !== 1 || queue.items.length !== 1) {
        errors.push("A new correct category Quiz answer did not create exactly one confirmation review.");
      }

      document.querySelector("#back-button")?.click();
      await pause();
      await startSingleQuiz();
      await answerMain(true);
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      item = queue?.items.find((entry) => entry.questionId === questionId);
      if (!item || item.remaining !== 1 || queue.items.length !== 1 || JSON.stringify(item) !== firstRecord) {
        errors.push("A repeated correct main Quiz answer changed or duplicated its pending confirmation.");
      }

      document.querySelector("#back-button")?.click();
      await pause();
      await startCategoryQueue();
      await answerDedicated(true);
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (queue?.items.find((entry) => entry.questionId === questionId)?.remaining !== 1
        || !queue?.activeAttempt?.submitted
        || !document.querySelector("#retry-dialog-progress")?.textContent.includes("Mastered after you continue")) {
        errors.push("Correct confirmation Check applied before Continue or projected the wrong result.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (queue?.items.some((entry) => entry.questionId === questionId)) {
        errors.push("Correct confirmation Continue did not remove the one-review item.");
      }

      await startSingleQuiz();
      await answerMain(true);
      document.querySelector("#back-button")?.click();
      await pause();
      await startCategoryQueue();
      await answerDedicated(false);
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (queue?.items.find((entry) => entry.questionId === questionId)?.remaining !== 1
        || queue?.activeAttempt?.wrongIncrement !== 2
        || !document.querySelector("#retry-dialog-progress")?.textContent.includes("3 correct reviews remaining")) {
        errors.push("Wrong confirmation Check did not preserve 1 and project exactly two added reviews.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      item = queue?.items.find((entry) => entry.questionId === questionId);
      if (item?.remaining !== 3 || queue.items.filter((entry) => entry.questionId === questionId).length !== 1) {
        errors.push("Wrong confirmation Continue did not atomically change one review to three.");
      }
      document.querySelector("#queue-back-button")?.click();
      await pause();

      return { errors, questionId, finalRemaining: item?.remaining || null };
    })()`);

    // Permanent Important practice draws only from the active category while
    // retaining other categories' saved deck entries. It remains separate from
    // finite Queue items even when the same MCQ is in both lanes.
    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for permanent Important practice testing."));
        }
      }, 50);
    })`);

    const importantPracticeSeed = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const retryKey = "ppsc-prep:retry-queue:v1";
      const hostCategoryId = "job-related-finance-taxation";
      const questions = window.PPSC_QUIZ_DATA.questions;
      const important = questions.filter((question) => question.isImportant === true || Number(question.repeatCount) >= 2);
      const hostImportant = important.filter((question) => question.categoryId === hostCategoryId);
      const first = hostImportant[0];
      const second = hostImportant[1];
      const foreign = important.find((question) => question.categoryId === "general-knowledge");
      const finite = questions.find((question) => question.categoryId === hostCategoryId);
      document.querySelector('#category-grid .category-card[data-category="' + hostCategoryId + '"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      const start = document.querySelector("#question-range-start-input");
      const end = document.querySelector("#question-range-end-input");
      if (!start || !end || !first || !second || !foreign || !finite) {
        return { errors: ["Permanent Important fixture could not find its categories or range controls."] };
      }
      start.value = "1";
      end.value = "30";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!queue || queue.items.length !== 0) {
        errors.push("Learn created a finite confirmation item before Important testing.");
      }
      const collisionStep = queue.practiceStep + 1;
      queue.nextQuizReviewStep = collisionStep;
      queue.nextImportantReviewStep = collisionStep;
      queue.nextSequence = 2;
      queue.dedicatedDeck = [];
      queue.dedicatedLastQuestionId = null;
      queue.importantDeck = [String(foreign.id), String(first.id), String(second.id)];
      queue.importantLastQuestionId = null;
      queue.items = [{
        questionId: String(finite.id),
        remaining: 2,
        dueStep: collisionStep,
        sequence: 1
      }];
      queue.activeAttempt = null;
      localStorage.setItem(retryKey, JSON.stringify(queue));
      return {
        errors,
        firstId: String(first.id),
        secondId: String(second.id),
        foreignId: String(foreign.id),
        finiteId: String(finite.id),
        hostCategoryId,
        finiteItems: JSON.stringify(queue.items)
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for the first permanent Important review."));
        }
      }, 50);
    })`);

    const importantPracticeCorrect = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const expected = ${JSON.stringify(importantPracticeSeed)};
      const retryKey = "ppsc-prep:retry-queue:v1";
      const questions = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      document.querySelector("#continue-session-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (document.querySelector("#retry-dialog")?.open) {
        errors.push("Revealing the Learn answer opened the Important/finite collision too early.");
      }
      document.querySelector("#action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      let attempt = queue?.activeAttempt;
      let question = questions.get(String(attempt?.questionId || ""));
      const importantOpenedFirst = Boolean(
        document.querySelector("#retry-dialog")?.open
        && attempt?.kind === "important"
        && attempt?.context === "embedded"
        && attempt?.questionId === expected.firstId
        && question?.categoryId === expected.hostCategoryId
        && queue?.importantDeck.includes(expected.foreignId)
        && queue?.nextQuizReviewStep <= queue?.practiceStep
        && document.querySelector("#retry-dialog-title")?.textContent.includes("Important")
        && document.querySelector("#retry-dialog-queue-meta")?.textContent.includes("totals stay unchanged")
      );
      if (!importantOpenedFirst) {
        errors.push("The category-local Important review did not win the collision while the foreign deck item remained saved.");
      }
      const correctIndex = attempt && question ? attempt.optionOrder.indexOf(question.correctOptionIndex) : -1;
      document.querySelector('[data-review-option-index="' + correctIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (JSON.stringify(queue?.items) !== expected.finiteItems || queue?.activeAttempt?.outcome !== "correct") {
        errors.push("Correct permanent Important Check changed the finite Review Queue.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const importantSpacing = queue?.nextImportantReviewStep - queue?.practiceStep;
      if (JSON.stringify(queue?.items) !== expected.finiteItems || queue?.activeAttempt !== null
        || !Number.isInteger(importantSpacing) || importantSpacing < 10 || importantSpacing > 20
        || queue?.importantLastQuestionId !== expected.firstId
        || queue?.nextQuizReviewStep > queue?.practiceStep) {
        errors.push("Correct permanent Important Continue changed finite work, moved its due gate, or failed to save a 10-to-20 Important cadence.");
      }
      const gateBeforeFiniteReveal = queue?.practiceStep;
      document.querySelector("#action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (document.querySelector("#retry-dialog")?.open || queue?.practiceStep !== gateBeforeFiniteReveal) {
        errors.push("Revealing the next Learn answer opened or advanced the still-due finite Queue review.");
      }
      document.querySelector("#action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      attempt = queue?.activeAttempt;
      question = questions.get(String(attempt?.questionId || ""));
      const finiteOpenedNext = Boolean(
        document.querySelector("#retry-dialog")?.open
        && attempt?.kind === "queue"
        && attempt?.context === "embedded"
        && attempt?.questionId === expected.finiteId
        && queue?.nextImportantReviewStep > queue?.practiceStep
      );
      if (!finiteOpenedNext) {
        errors.push("The still-due finite Queue review did not open after Important won the collision.");
      }
      document.querySelector("#retry-later-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const finiteSpacing = queue?.nextQuizReviewStep - queue?.practiceStep;
      const finiteItemsAfterCollision = JSON.stringify(queue?.items || []);
      if (document.querySelector("#retry-dialog")?.open || queue?.activeAttempt !== null
        || !Number.isInteger(finiteSpacing) || finiteSpacing < 5 || finiteSpacing > 6
        || queue?.nextImportantReviewStep <= queue?.practiceStep) {
        errors.push("Postponing the finite review did not keep Important scheduled and move only finite Queue work by five to six questions.");
      }
      queue.nextImportantReviewStep = queue.practiceStep + 1;
      queue.importantDeck = [expected.foreignId, expected.secondId, expected.firstId];
      localStorage.setItem(retryKey, JSON.stringify(queue));
      return {
        errors,
        finiteItems: finiteItemsAfterCollision,
        firstId: expected.firstId,
        secondId: expected.secondId,
        foreignId: expected.foreignId,
        importantFirstCollision: importantOpenedFirst && finiteOpenedNext
      };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for the second permanent Important review."));
        }
      }, 50);
    })`);

    const importantPracticeWrongSeed = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const expected = ${JSON.stringify(importantPracticeCorrect)};
      const retryKey = "ppsc-prep:retry-queue:v1";
      const questions = new Map(window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question]));
      document.querySelector("#continue-session-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (document.querySelector("#retry-dialog")?.open) {
        errors.push("Revealing the reloaded Learn answer opened Important practice too early.");
      }
      document.querySelector("#action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const attempt = queue?.activeAttempt;
      const question = questions.get(String(attempt?.questionId || ""));
      if (!document.querySelector("#retry-dialog")?.open || attempt?.kind !== "important"
        || attempt?.questionId !== expected.secondId || attempt.questionId === expected.firstId
        || !queue?.importantDeck.includes(expected.foreignId)) {
        errors.push("The category-local Important deck did not skip and retain its foreign item for another session.");
      }
      const correctIndex = attempt && question ? attempt.optionOrder.indexOf(question.correctOptionIndex) : -1;
      const wrongIndex = (correctIndex + 1) % 4;
      document.querySelector('[data-review-option-index="' + wrongIndex + '"]')?.click();
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (JSON.stringify(queue?.items) !== expected.finiteItems || queue?.activeAttempt?.outcome !== "wrong"
        || queue?.activeAttempt?.wrongIncrement !== null) {
        errors.push("Wrong permanent Important Check changed finite queue work or staged a finite increment.");
      }
      return { errors, finiteItems: expected.finiteItems, secondId: expected.secondId };
    })()`);

    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for submitted Important-attempt recovery."));
        }
      }, 50);
    })`);

    const importantPracticeResume = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const expected = ${JSON.stringify(importantPracticeWrongSeed)};
      const retryKey = "ppsc-prep:retry-queue:v1";
      document.querySelector("#continue-session-button")?.click();
      await pause();
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!document.querySelector("#retry-dialog")?.open || queue?.activeAttempt?.kind !== "important"
        || !queue.activeAttempt.submitted || queue.activeAttempt.outcome !== "wrong"
        || queue.activeAttempt.questionId !== expected.secondId) {
        errors.push("A submitted wrong permanent Important attempt did not restore exactly after reload.");
      }
      document.querySelector("#retry-action-button")?.click();
      await pause();
      queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const spacing = queue?.nextImportantReviewStep - queue?.practiceStep;
      if (JSON.stringify(queue?.items) !== expected.finiteItems || queue?.activeAttempt !== null
        || !Number.isInteger(spacing) || spacing < 10 || spacing > 20
        || queue?.importantLastQuestionId !== expected.secondId) {
        errors.push("Wrong permanent Important Continue changed queue totals or failed to persist its next cadence.");
      }
      return { errors, nextSpacing: spacing, finiteRemaining: queue?.items?.[0]?.remaining || null };
    })()`);

    const permanentImportantResult = {
      errors: []
        .concat(importantPracticeSeed.errors)
        .concat(importantPracticeCorrect.errors)
        .concat(importantPracticeWrongSeed.errors)
        .concat(importantPracticeResume.errors),
      firstId: importantPracticeSeed.firstId,
      secondId: importantPracticeSeed.secondId,
      nextSpacing: importantPracticeResume.nextSpacing,
      finiteRemaining: importantPracticeResume.finiteRemaining,
      importantFirstCollision: importantPracticeCorrect.importantFirstCollision === true
    };

    const foreignImportantSeed = await client.evaluate(`(() => {
      const errors = [];
      const retryKey = "ppsc-prep:retry-queue:v1";
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const foreignId = ${JSON.stringify(importantPracticeSeed.foreignId)};
      if (!queue || !foreignId) return { errors: ["Foreign Important fixture is incomplete."] };
      queue.nextImportantReviewStep = queue.practiceStep + 1;
      queue.nextQuizReviewStep = queue.practiceStep + 1000;
      queue.importantDeck = [foreignId];
      queue.activeAttempt = null;
      localStorage.setItem(retryKey, JSON.stringify(queue));
      return { errors, foreignId, dueStep: queue.nextImportantReviewStep, finiteItems: JSON.stringify(queue.items) };
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for foreign Important isolation."));
        }
      }, 50);
    })`);
    const foreignImportantIsolation = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignImportantSeed.errors)}.slice();
      const expected = ${JSON.stringify(foreignImportantSeed)};
      const retryKey = "ppsc-prep:retry-queue:v1";
      document.querySelector("#continue-session-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      const reviewQuestion = window.PPSC_QUIZ_DATA.questions.find((question) =>
        String(question.id) === String(queue?.activeAttempt?.questionId || "")
      );
      if (!document.querySelector("#retry-dialog")?.open
        || queue?.activeAttempt?.kind !== "important"
        || reviewQuestion?.categoryId !== "job-related-finance-taxation"
        || queue?.nextImportantReviewStep !== expected.dueStep
        || !queue?.importantDeck.includes(expected.foreignId)
        || JSON.stringify(queue?.items) !== expected.finiteItems) {
        errors.push("Job Learn did not use a Job Important MCQ while retaining the saved GK deck entry.");
      }
      document.querySelector("#retry-later-button")?.click();
      await pause();
      const afterLater = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (document.querySelector("#retry-dialog")?.open || afterLater?.activeAttempt !== null
        || !afterLater?.importantDeck.includes(expected.foreignId)
        || JSON.stringify(afterLater?.items) !== expected.finiteItems) {
        errors.push("Postponing the Job Important review lost the GK item or changed finite Queue counts.");
      }
      return {
        errors,
        foreignId: expected.foreignId,
        jobLastId: queue?.activeAttempt?.questionId || "",
        finiteItems: expected.finiteItems
      };
    })()`);
    await client.evaluate(`(() => {
      const retryKey = "ppsc-prep:retry-queue:v1";
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (queue) {
        queue.nextImportantReviewStep = queue.practiceStep + 1;
        queue.importantDeck = [${JSON.stringify(foreignImportantSeed.foreignId)}];
        queue.activeAttempt = null;
        localStorage.setItem(retryKey, JSON.stringify(queue));
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for same-category Important recovery."));
        }
      }, 50);
    })`);
    const foreignImportantRecovery = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignImportantIsolation.errors)}.slice();
      const expected = ${JSON.stringify(foreignImportantIsolation)};
      document.querySelector('#category-grid .category-card[data-category="general-knowledge"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "2";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (!document.querySelector("#retry-dialog")?.open
        || queue?.activeAttempt?.kind !== "important"
        || queue.activeAttempt.questionId !== expected.foreignId
        || JSON.stringify(queue?.items) !== expected.finiteItems) {
        errors.push("A saved GK Important MCQ did not return in GK Learn without changing finite Queue counts.");
      }
      return { errors, foreignId: expected.foreignId, jobLastId: expected.jobLastId };
    })()`);
    permanentImportantResult.errors.push(...foreignImportantRecovery.errors);

    // Return to Job after a GK review and a reload. Job must avoid its own
    // most-recent Important MCQ, not just the globally last GK MCQ.
    await client.evaluate(`(async () => {
      document.querySelector("#retry-later-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const retryKey = "ppsc-prep:retry-queue:v1";
      const queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (queue) {
        queue.nextImportantReviewStep = queue.practiceStep + 1;
        queue.nextQuizReviewStep = queue.practiceStep + 1000;
        const lastJobId = ${JSON.stringify(foreignImportantRecovery.jobLastId)};
        const alternativeJobId = lastJobId === ${JSON.stringify(importantPracticeSeed.firstId)}
          ? ${JSON.stringify(importantPracticeSeed.secondId)}
          : ${JSON.stringify(importantPracticeSeed.firstId)};
        queue.importantDeck = [
          lastJobId,
          alternativeJobId
        ];
        queue.activeAttempt = null;
        localStorage.setItem(retryKey, JSON.stringify(queue));
      }
      localStorage.removeItem("ppsc-prep:active-session:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for per-category Important repeat avoidance."));
        }
      }, 50);
    })`);
    const importantCategoryReturn = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(foreignImportantRecovery.errors)}.slice();
      const expected = ${JSON.stringify(importantPracticeSeed)};
      const lastJobId = ${JSON.stringify(foreignImportantRecovery.jobLastId)};
      const alternativeJobId = lastJobId === expected.firstId ? expected.secondId : expected.firstId;
      document.querySelector('#category-grid .category-card[data-category="job-related-finance-taxation"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "2";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      document.querySelector("#action-button")?.click();
      await pause();
      const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (!document.querySelector("#retry-dialog")?.open
        || queue?.activeAttempt?.kind !== "important"
        || queue.activeAttempt.questionId !== alternativeJobId
        || queue?.importantLastQuestionIdsByCategory?.["general-knowledge"] !== expected.foreignId
        || queue?.importantLastQuestionIdsByCategory?.[expected.hostCategoryId] !== alternativeJobId) {
        errors.push("Returning Job Important practice repeated its last Job MCQ after the GK review or lost per-category history.");
      }
      return { errors, returnedQuestionId: queue?.activeAttempt?.questionId || "" };
    })()`);
    permanentImportantResult.errors.push(...importantCategoryReturn.errors);

    // A legacy Sequential popup is discarded; its old cursor stays compatible,
    // but neither the pending gate nor a new 15-question popup may run.
    await client.evaluate(`(() => {
      sessionStorage.setItem("ppsc-smoke:sequential-review", "on");
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for Sequential retirement testing."));
        }
      }, 50);
    })`);
    const sequentialRetirementSeed = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = [];
      const questions = window.PPSC_QUIZ_DATA.questions;
      const job = questions.find((question) => question.categoryId === "job-related-finance-taxation");
      const oldSequential = questions.find((question) => question.categoryId === "general-knowledge");
      if (!job || !oldSequential) return { errors: ["Sequential retirement fixture lacks canonical questions."] };
      document.querySelector('#category-grid .category-card[data-category="job-related-finance-taxation"]')?.click();
      document.querySelector("#learn-mode-button")?.click();
      await pause();
      document.querySelector("#question-range-start-input").value = "1";
      document.querySelector("#question-range-end-input").value = "4";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const session = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!session || session.questionIds?.length !== 4) {
        return { errors: ["Sequential retirement fixture could not start Job Learn."] };
      }
      const items = [
        { questionId: String(job.id), remaining: 4, dueStep: 1000, sequence: 1 },
        { questionId: String(oldSequential.id), remaining: 2, dueStep: 1000, sequence: 2 }
      ];
      const queue = {
        version: 1,
        bankSignature: session.bankSignature,
        countBaselineVersion: 1,
        embeddedCadenceVersion: 2,
        practiceStep: 14,
        nextQuizReviewStep: 1000,
        nextImportantReviewStep: 1000,
        nextSequentialReviewStep: 15,
        sequentialOrderVersion: 2,
        sequentialTurn: 0,
        sequentialIndex: questions.findIndex((question) => String(question.id) === String(oldSequential.id)),
        sequentialQuestionId: String(oldSequential.id),
        nextSequence: 3,
        dedicatedDeck: [],
        dedicatedLastQuestionId: null,
        dedicatedRepeatGap: 5,
        dedicatedRecentQuestionIds: [],
        importantDeck: [],
        importantLastQuestionId: null,
        items,
        activeAttempt: {
          questionId: String(oldSequential.id),
          optionOrder: [0, 1, 2, 3],
          selectedIndex: (oldSequential.correctOptionIndex + 1) % 4,
          submitted: true,
          outcome: "wrong",
          wrongIncrement: null,
          resumeAction: "next:0",
          context: "embedded",
          kind: "sequential"
        }
      };
      localStorage.setItem("ppsc-prep:retry-queue:v1", JSON.stringify(queue));
      return { errors, items: JSON.stringify(items), legacyId: String(oldSequential.id), turn: 0, flatIndex: queue.sequentialIndex };
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for Sequential legacy-attempt retirement."));
        }
      }, 50);
    })`);
    const sequentialReviewResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const errors = ${JSON.stringify(sequentialRetirementSeed.errors)}.slice();
      const expected = ${JSON.stringify(sequentialRetirementSeed)};
      const retryKey = "ppsc-prep:retry-queue:v1";
      let queue = JSON.parse(localStorage.getItem(retryKey) || "null");
      if (!queue || queue.nextSequentialReviewStep !== null || queue.activeAttempt !== null
        || JSON.stringify(queue.items) !== expected.items
        || queue.sequentialTurn !== expected.turn || queue.sequentialIndex !== expected.flatIndex
        || queue.sequentialQuestionId !== expected.legacyId) {
        errors.push("Legacy Sequential popup or gate survived retirement, or saved Queue/cursor data changed.");
      }
      document.querySelector("#continue-session-button")?.click();
      await pause();
      const session = () => JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (document.querySelector("#retry-dialog")?.open || session()?.currentIndex !== 0) {
        errors.push("A retired in-flight Sequential attempt reopened or moved the Learn position.");
      }
      for (let completed = 0; completed < 2; completed += 1) {
        document.querySelector("#action-button")?.click();
        await pause();
        if (document.querySelector("#retry-dialog")?.open) {
          errors.push("A retired Sequential popup opened when revealing a Learn answer.");
          break;
        }
        document.querySelector("#action-button")?.click();
        await pause();
        queue = JSON.parse(localStorage.getItem(retryKey) || "null");
        if (document.querySelector("#retry-dialog")?.open || queue?.activeAttempt !== null
          || queue?.nextSequentialReviewStep !== null || queue?.practiceStep !== 15 + completed
          || JSON.stringify(queue?.items) !== expected.items) {
          errors.push("Sequential practice reappeared at its old 15-question gate or changed finite Queue counts.");
          break;
        }
      }
      sessionStorage.removeItem("ppsc-smoke:sequential-review");
      return { errors, oldGateRetired: queue?.nextSequentialReviewStep === null, finiteQueuePreserved: JSON.stringify(queue?.items) === expected.items };
    })()`);

    // Quiz, finite Queue reviews, and permanent Important reviews must all be
    // operable without a pointer. This isolated pass also protects against
    // native button activation and held-key repeats firing an action twice.
    await client.evaluate(`(() => {
      sessionStorage.removeItem("ppsc-smoke:sequential-review");
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for keyboard-control testing."));
        }
      }, 50);
    })`);

    const keyboardControlResult = await client.evaluate(`(async () => {
      const errors = [];
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const sessionKey = "ppsc-prep:active-session:v1";
      const retryKey = "ppsc-prep:retry-queue:v1";
      const categoryId = "job-related-finance-taxation";
      const questions = new Map(
        window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question])
      );
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      const session = () => JSON.parse(localStorage.getItem(sessionKey) || "null");
      const queue = () => JSON.parse(localStorage.getItem(retryKey) || "null");
      const queueScreenOpen = () => {
        const screen = document.querySelector("#queue-screen");
        return Boolean(screen && !screen.hidden && getComputedStyle(screen).display !== "none");
      };
      const mainButtons = () => [...document.querySelectorAll("#options-container [data-option-index]")];
      const retryButtons = () => [...document.querySelectorAll("#retry-options-container [data-review-option-index]")];
      const currentQuestion = () => questions.get(
        String(document.querySelector("#question-text")?.dataset.questionId || "")
      );
      const renderedMainOptions = () => mainButtons().map((button) => button.querySelector(".option-text")?.textContent || "");
      const renderedRetryOptions = () => retryButtons().map((button) => button.querySelector(".option-text")?.textContent || "");
      const currentMainCorrectIndex = () => {
        const question = currentQuestion();
        return question
          ? renderedMainOptions().indexOf(displayOptions(question)[question.correctOptionIndex])
          : -1;
      };
      const press = async (target, key, code, repeat, modifiers) => {
        const keys = modifiers || {};
        const accepted = target?.dispatchEvent(new KeyboardEvent("keydown", {
          key,
          code: code || key,
          repeat: Boolean(repeat),
          isComposing: Boolean(keys.isComposing),
          ctrlKey: Boolean(keys.ctrlKey),
          altKey: Boolean(keys.altKey),
          metaKey: Boolean(keys.metaKey),
          shiftKey: Boolean(keys.shiftKey),
          bubbles: true,
          cancelable: true
        }));
        await pause();
        return accepted;
      };
      const assertMainRadio = (expectedIndex, context) => {
        const buttons = mainButtons();
        const selected = buttons.filter((button) => button.getAttribute("aria-checked") === "true");
        const tabbable = buttons.filter((button) => button.tabIndex === 0);
        if (buttons.length !== 4 || selected.length !== 1 || selected[0] !== buttons[expectedIndex]
          || !buttons[expectedIndex].classList.contains("is-selected")
          || document.activeElement !== buttons[expectedIndex]
          || tabbable.length !== 1 || tabbable[0] !== buttons[expectedIndex]
          || session()?.selectedIndex !== expectedIndex || session()?.submitted !== false) {
          errors.push(context + " did not keep Quiz radio selection, focus, tabindex, and saved state aligned.");
        }
      };
      const assertRetryRadio = (expectedIndex, context) => {
        const buttons = retryButtons();
        const selected = buttons.filter((button) => button.getAttribute("aria-checked") === "true");
        const tabbable = buttons.filter((button) => button.tabIndex === 0);
        if (buttons.length !== 4 || selected.length !== 1 || selected[0] !== buttons[expectedIndex]
          || !buttons[expectedIndex].classList.contains("is-selected")
          || document.activeElement !== buttons[expectedIndex]
          || tabbable.length !== 1 || tabbable[0] !== buttons[expectedIndex]
          || queue()?.activeAttempt?.selectedIndex !== expectedIndex
          || queue()?.activeAttempt?.submitted !== false) {
          errors.push(context + " did not keep review radio selection, focus, tabindex, and saved state aligned.");
        }
      };
      const selectMainIndex = async (targetIndex) => {
        const buttons = mainButtons();
        buttons[0]?.focus({ preventScroll: true });
        await press(buttons[0], "Home", "Home");
        for (let index = 0; index < targetIndex; index += 1) {
          await press(document.activeElement, "ArrowDown", "ArrowDown");
        }
      };
      const selectRetryIndex = async (targetIndex) => {
        const buttons = retryButtons();
        buttons[0]?.focus({ preventScroll: true });
        await press(buttons[0], "Home", "Home");
        for (let index = 0; index < targetIndex; index += 1) {
          await press(document.activeElement, "ArrowDown", "ArrowDown");
        }
      };
      const retryCorrectIndex = () => {
        const snapshot = queue();
        const attempt = snapshot?.activeAttempt;
        const question = questions.get(String(attempt?.questionId || ""));
        return attempt && question
          ? attempt.optionOrder.indexOf(question.correctOptionIndex)
          : -1;
      };

      const categoryButton = document.querySelector(
        '#category-grid .category-card[data-category="' + categoryId + '"]'
      );
      categoryButton?.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      const start = document.querySelector("#question-range-start-input");
      const end = document.querySelector("#question-range-end-input");
      if (!categoryButton || !start || !end) {
        return { errors: ["Keyboard fixture could not open its category Quiz."], mainKeys: [], popupKeys: [] };
      }
      start.value = "1";
      end.value = "30";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();

      // All four arrows plus Home/End select and focus Quiz choices, including
      // wrap-around. The first question is deliberately answered wrong so its
      // real finite Queue item can drive the popup checks below.
      let buttons = mainButtons();
      buttons[0]?.focus({ preventScroll: true });
      await press(buttons[0], "ArrowRight", "ArrowRight");
      assertMainRadio(1, "Quiz ArrowRight");
      await press(document.activeElement, "ArrowDown", "ArrowDown");
      assertMainRadio(2, "Quiz ArrowDown");
      await press(document.activeElement, "End", "End");
      assertMainRadio(3, "Quiz End");
      await press(document.activeElement, "ArrowRight", "ArrowRight");
      assertMainRadio(0, "Quiz forward wrap");
      await press(document.activeElement, "ArrowLeft", "ArrowLeft");
      assertMainRadio(3, "Quiz ArrowLeft wrap");
      await press(document.activeElement, "Home", "Home");
      assertMainRadio(0, "Quiz Home");
      await press(document.activeElement, "ArrowUp", "ArrowUp");
      assertMainRadio(3, "Quiz ArrowUp wrap");

      const beforeModifiedMainArrow = JSON.stringify(session());
      const modifiedMainTarget = document.activeElement;
      for (const [label, key, modifiers] of [
        ["Ctrl", "ArrowRight", { ctrlKey: true }],
        ["Alt", "ArrowDown", { altKey: true }],
        ["Meta", "ArrowLeft", { metaKey: true }],
        ["Shift", "ArrowUp", { shiftKey: true }],
        ["composition", "ArrowRight", { isComposing: true }]
      ]) {
        if (await press(modifiedMainTarget, key, key, false, modifiers) !== true
          || JSON.stringify(session()) !== beforeModifiedMainArrow
          || document.activeElement !== modifiedMainTarget) {
          errors.push(label + " + arrow was hijacked by Quiz option navigation.");
        }
      }

      buttons = mainButtons();
      buttons[1]?.focus({ preventScroll: true });
      await press(buttons[1], " ", "Space");
      buttons[1]?.click();
      await pause();
      if (session()?.submitted || session()?.selectedIndex !== 1) {
        errors.push("Space on an unsubmitted Quiz option did not remain a selection-only action.");
      }

      const firstCorrectIndex = currentMainCorrectIndex();
      const firstWrongIndex = firstCorrectIndex === 0 ? 1 : 0;
      await selectMainIndex(firstWrongIndex);
      const beforeHeldMainEnter = JSON.stringify(session());
      const heldMainEnterAccepted = await press(document.activeElement, "Enter", "Enter", true);
      if (heldMainEnterAccepted !== false || JSON.stringify(session()) !== beforeHeldMainEnter) {
        errors.push("Held Enter changed or submitted an unsubmitted Quiz answer.");
      }
      const quizEnterAccepted = await press(document.activeElement, "Enter", "Enter");
      let activeSession = session();
      let retry = queue();
      if (quizEnterAccepted !== false || !activeSession?.submitted || activeSession.currentIndex !== 0
        || activeSession.selectedIndex !== firstWrongIndex || activeSession.score !== 0
        || retry?.items?.length !== 1 || retry.items[0].remaining !== 2
        || document.activeElement !== document.querySelector("#action-button")) {
        errors.push("Quiz Enter did not check exactly once, preserve the question, and focus Next.");
      }

      const beforeHeldMainNext = JSON.stringify(activeSession);
      const heldMainSpaceAccepted = await press(document.querySelector("#action-button"), " ", "Space", true);
      if (heldMainSpaceAccepted !== false || JSON.stringify(session()) !== beforeHeldMainNext) {
        errors.push("Held Space advanced a submitted Quiz answer.");
      }
      await press(document.querySelector("#action-button"), " ", "Space");
      if (session()?.currentIndex !== 1 || session()?.submitted) {
        errors.push("Space did not advance a submitted Quiz exactly one question.");
      }

      // Shortcuts must not take over ordinary form controls or secondary
      // buttons while a Quiz question is waiting for an answer.
      const guardedSession = JSON.stringify(session());
      const numberInput = document.querySelector("#question-number-input");
      const checkbox = document.querySelector("#difficult-checkbox");
      const previous = document.querySelector("#previous-button");
      if (await press(numberInput, "ArrowRight", "ArrowRight") !== true
        || await press(checkbox, "Enter", "Enter") !== true
        || await press(previous, "ArrowRight", "ArrowRight") !== true
        || JSON.stringify(session()) !== guardedSession) {
        errors.push("Quiz shortcuts hijacked an input, checkbox, or secondary button.");
      }

      let correctIndex = currentMainCorrectIndex();
      await selectMainIndex(correctIndex);
      await press(document.activeElement, "Enter", "Enter");
      if (!session()?.submitted || session()?.currentIndex !== 1 || session()?.score !== 1) {
        errors.push("Second Quiz answer was not checked by Enter.");
      }
      const beforeMainEnterNext = session()?.currentIndex;
      await press(document.querySelector("#action-button"), "Enter", "Enter");
      if (session()?.currentIndex !== beforeMainEnterNext + 1 || session()?.submitted) {
        errors.push("Enter did not advance a submitted Quiz exactly once.");
      }

      correctIndex = currentMainCorrectIndex();
      await selectMainIndex(correctIndex);
      await press(document.activeElement, "Enter", "Enter");
      const beforeMainRightNext = session()?.currentIndex;
      await press(document.querySelector("#action-button"), "ArrowRight", "ArrowRight");
      if (session()?.currentIndex !== beforeMainRightNext + 1 || session()?.submitted) {
        errors.push("Right Arrow did not advance a submitted Quiz exactly once.");
      }

      // Open the real finite item in its category's full-screen Queue practice.
      // Arrow navigation remains a roving radio group; Enter checks, while Space,
      // Enter, and Right Arrow are reserved for Continue after submission.
      document.querySelector("#back-button")?.click();
      await pause();
      document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
      await pause();
      document.querySelector("#queue-mode-button")?.click();
      await pause();
      retry = queue();
      if (!queueScreenOpen() || document.querySelector("#retry-dialog")?.open
        || retry?.activeAttempt?.kind !== "queue" || retry.activeAttempt.context !== "dedicated") {
        errors.push("Keyboard test could not open a dedicated finite Queue review.");
      } else {
        let reviewButtons = retryButtons();
        reviewButtons[0]?.focus({ preventScroll: true });
        await press(reviewButtons[0], "End", "End");
        assertRetryRadio(3, "Queue End");
        await press(document.activeElement, "ArrowRight", "ArrowRight");
        assertRetryRadio(0, "Queue forward wrap");
        await press(document.activeElement, "ArrowLeft", "ArrowLeft");
        assertRetryRadio(3, "Queue backward wrap");

        const beforeModifiedRetryArrow = JSON.stringify(queue()?.activeAttempt);
        const modifiedRetryTarget = document.activeElement;
        for (const [label, key, modifiers] of [
          ["Ctrl", "ArrowRight", { ctrlKey: true }],
          ["Alt", "ArrowDown", { altKey: true }],
          ["Meta", "ArrowLeft", { metaKey: true }],
          ["Shift", "ArrowUp", { shiftKey: true }],
          ["composition", "ArrowRight", { isComposing: true }]
        ]) {
          if (await press(modifiedRetryTarget, key, key, false, modifiers) !== true
            || JSON.stringify(queue()?.activeAttempt) !== beforeModifiedRetryArrow
            || document.activeElement !== modifiedRetryTarget) {
            errors.push(label + " + arrow was hijacked by review option navigation.");
          }
        }

        const queueBeforeSecondary = JSON.stringify(queue()?.activeAttempt);
        if (await press(document.querySelector("#retry-later-button"), "ArrowRight", "ArrowRight") !== true
          || JSON.stringify(queue()?.activeAttempt) !== queueBeforeSecondary
          || !queueScreenOpen()) {
          errors.push("Review shortcuts hijacked the Not now/End practice button.");
        }

        reviewButtons = retryButtons();
        reviewButtons[1]?.focus({ preventScroll: true });
        await press(reviewButtons[1], " ", "Space");
        reviewButtons[1]?.click();
        await pause();
        if (queue()?.activeAttempt?.submitted || queue()?.activeAttempt?.selectedIndex !== 1) {
          errors.push("Space on an unsubmitted review option did not remain selection-only.");
        }

        await selectRetryIndex(retryCorrectIndex());
        const beforeHeldReviewEnter = JSON.stringify(queue()?.activeAttempt);
        const heldReviewEnterAccepted = await press(document.activeElement, "Enter", "Enter", true);
        if (heldReviewEnterAccepted !== false
          || JSON.stringify(queue()?.activeAttempt) !== beforeHeldReviewEnter) {
          errors.push("Held Enter changed or submitted an unsubmitted Queue review.");
        }
        const queueEnterAccepted = await press(document.activeElement, "Enter", "Enter");
        retry = queue();
        if (queueEnterAccepted !== false || !retry?.activeAttempt?.submitted
          || retry.activeAttempt.outcome !== "correct" || retry.items[0]?.remaining !== 2
          || document.activeElement !== document.querySelector("#retry-action-button")) {
          errors.push("Queue Enter did not check exactly once and focus Continue.");
        }

        const beforeHeldQueueContinue = JSON.stringify(retry);
        const heldQueueSpaceAccepted = await press(document.querySelector("#retry-action-button"), " ", "Space", true);
        if (heldQueueSpaceAccepted !== false || JSON.stringify(queue()) !== beforeHeldQueueContinue) {
          errors.push("Held Space applied a Queue review outcome.");
        }
        await press(document.querySelector("#retry-action-button"), " ", "Space");
        retry = queue();
        if (!queueScreenOpen() || retry?.items?.[0]?.remaining !== 1
          || retry?.activeAttempt?.submitted !== false || retry.activeAttempt.kind !== "queue") {
          errors.push("Space did not continue a submitted Queue review exactly once.");
        }

        await selectRetryIndex(retryCorrectIndex());
        await press(document.activeElement, "Enter", "Enter");
        const beforeQueueEnterContinue = (queue()?.items || []).reduce(
          (total, item) => total + item.remaining,
          0
        );
        await press(document.querySelector("#retry-action-button"), "Enter", "Enter");
        retry = queue();
        const afterQueueEnterContinue = (retry?.items || []).reduce(
          (total, item) => total + item.remaining,
          0
        );
        if (afterQueueEnterContinue !== beforeQueueEnterContinue - 1
          || (afterQueueEnterContinue > 0 && (
            !queueScreenOpen()
            || retry?.activeAttempt?.kind !== "queue"
            || retry.activeAttempt.submitted
          ))) {
          errors.push("Enter did not continue the next Queue review exactly once.");
        }

        // Correctly clear every remaining finite item so later cadence testing
        // cannot confuse a Queue popup with permanent Important practice.
        for (let guard = 0; guard < 12 && queueScreenOpen(); guard += 1) {
          retry = queue();
          if (retry?.activeAttempt?.kind !== "queue" || retry.activeAttempt.submitted) break;
          await selectRetryIndex(retryCorrectIndex());
          await press(document.activeElement, "Enter", "Enter");
          await press(document.querySelector("#retry-action-button"), "Enter", "Enter");
        }
        retry = queue();
        if (retry?.items?.length !== 0 || retry?.activeAttempt !== null
          || queueScreenOpen()) {
          errors.push("Keyboard Queue cleanup did not finish every seeded finite review.");
        }
      }

      if (queueScreenOpen()) {
        document.querySelector("#queue-back-button")?.click();
        await pause();
      }
      if (!document.querySelector("#category-screen")?.hidden) {
        document.querySelector("#continue-session-button")?.click();
        await pause();
      } else if (!document.querySelector("#mode-screen")?.hidden) {
        document.querySelector("#mode-back-button")?.click();
        await pause();
        document.querySelector("#continue-session-button")?.click();
        await pause();
      }

      // Continue the live Quiz until its naturally scheduled permanent
      // Important popup appears; this proves the same popup keyboard behavior
      // without fabricating private in-memory state.
      let importantOpened = false;
      for (let guard = 0; guard < 25 && !importantOpened; guard += 1) {
        if (session()?.submitted) {
          document.querySelector("#action-button")?.click();
          await pause();
          if (document.querySelector("#retry-dialog")?.open) {
            const activeKind = queue()?.activeAttempt?.kind;
            if (activeKind === "important") {
              importantOpened = true;
            } else {
              document.querySelector("#retry-later-button")?.click();
              await pause();
            }
          }
          continue;
        }
        const question = currentQuestion();
        const mainCorrect = currentMainCorrectIndex();
        if (!question || mainCorrect < 0) break;
        document.querySelector('[data-option-index="' + mainCorrect + '"]')?.click();
        document.querySelector("#action-button")?.click();
        await pause();
        document.querySelector("#action-button")?.click();
        await pause();
        if (document.querySelector("#retry-dialog")?.open) {
          const activeKind = queue()?.activeAttempt?.kind;
          if (activeKind === "important") {
            importantOpened = true;
          } else {
            document.querySelector("#retry-later-button")?.click();
            await pause();
          }
        }
      }

      retry = queue();
      if (!importantOpened || retry?.activeAttempt?.kind !== "important") {
        errors.push("Keyboard test did not reach the permanent Important popup.");
      } else {
        const importantMainIndex = session()?.currentIndex;
        const importantFiniteItems = JSON.stringify(retry.items || []);
        await selectRetryIndex(retryCorrectIndex());
        const importantEnterAccepted = await press(document.activeElement, "Enter", "Enter");
        retry = queue();
        if (importantEnterAccepted !== false || !retry?.activeAttempt?.submitted
          || retry.activeAttempt.outcome !== "correct"
          || JSON.stringify(retry.items || []) !== importantFiniteItems) {
          errors.push("Important Enter did not check once while leaving finite Queue totals unchanged.");
        }

        const beforeHeldImportantContinue = JSON.stringify(retry);
        const heldImportantRightAccepted = await press(
          document.querySelector("#retry-action-button"), "ArrowRight", "ArrowRight", true
        );
        if (heldImportantRightAccepted !== false || JSON.stringify(queue()) !== beforeHeldImportantContinue) {
          errors.push("Held Right Arrow continued a submitted Important review.");
        }
        await press(document.querySelector("#retry-action-button"), "ArrowRight", "ArrowRight");
        retry = queue();
        const importantSpacing = retry?.nextImportantReviewStep - retry?.practiceStep;
        if (document.querySelector("#retry-dialog")?.open || retry?.activeAttempt !== null
          || session()?.currentIndex !== importantMainIndex + 1
          || !Number.isInteger(importantSpacing) || importantSpacing < 10 || importantSpacing > 20
          || JSON.stringify(retry.items || []) !== importantFiniteItems) {
          errors.push("Right Arrow did not continue Important practice exactly once and resume the Quiz.");
        }
      }

      return {
        errors,
        mainKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Space"],
        popupKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Space"],
        permanentImportantReached: importantOpened
      };
    })()`);

    // Synthetic events give precise state assertions above; this short CDP
    // probe additionally exercises Chrome's real native button-key lifecycle
    // so Enter/Space cannot both run the custom handler and emit a second click.
    await client.evaluate(`(() => {
      localStorage.removeItem("ppsc-prep:active-session:v1");
      localStorage.removeItem("ppsc-prep:retry-queue:v1");
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.readyState === "complete") {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reset for native keyboard-event testing."));
        }
      }, 50);
    })`);
    const nativeKeyboardSetup = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const categoryId = "job-related-finance-taxation";
      const questions = new Map(
        window.PPSC_QUIZ_DATA.questions.map((question) => [String(question.id), question])
      );
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const displayOptions = (question) => question.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
        ? question.optionsUrdu.map(String)
        : question.options.map(optionText);
      document.querySelector('#category-grid .category-card[data-category="' + categoryId + '"]')?.click();
      document.querySelector("#quiz-mode-button")?.click();
      await pause();
      const start = document.querySelector("#question-range-start-input");
      const end = document.querySelector("#question-range-end-input");
      if (!start || !end) return { ready: false };
      start.value = "1";
      end.value = "6";
      document.querySelector("#question-range-form")?.requestSubmit();
      await pause();
      const question = questions.get(String(document.querySelector("#question-text")?.dataset.questionId || ""));
      const rendered = [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const correctIndex = question
        ? rendered.indexOf(displayOptions(question)[question.correctOptionIndex])
        : -1;
      const button = document.querySelector('[data-option-index="' + correctIndex + '"]');
      button?.click();
      button?.focus({ preventScroll: true });
      return { ready: Boolean(button), firstQuestionId: String(question?.id || "") };
    })()`);
    const sendNativeKey = async (key, code, virtualKeyCode) => {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key,
        code,
        windowsVirtualKeyCode: virtualKeyCode,
        nativeVirtualKeyCode: virtualKeyCode
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code,
        windowsVirtualKeyCode: virtualKeyCode,
        nativeVirtualKeyCode: virtualKeyCode
      });
      await delay(100);
    };
    const nativeKeyboardErrors = [];
    if (!nativeKeyboardSetup.ready) {
      nativeKeyboardErrors.push("Native keyboard fixture could not focus a Quiz option.");
    } else {
      await sendNativeKey("Enter", "Enter", 13);
      const afterNativeEnter = await client.evaluate(`(() => {
        const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        return {
          currentIndex: snapshot?.currentIndex ?? null,
          submitted: snapshot?.submitted ?? null,
          focusedId: document.activeElement?.id || "",
          questionId: document.querySelector("#question-text")?.dataset.questionId || ""
        };
      })()`);
      if (!afterNativeEnter.submitted || afterNativeEnter.currentIndex !== 0
        || afterNativeEnter.focusedId !== "action-button"
        || afterNativeEnter.questionId !== nativeKeyboardSetup.firstQuestionId) {
        nativeKeyboardErrors.push("A real Enter key did not Check exactly once and focus Next.");
      }

      await sendNativeKey(" ", "Space", 32);
      const afterNativeSpace = await client.evaluate(`(() => {
        const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
        return {
          currentIndex: snapshot?.currentIndex ?? null,
          submitted: snapshot?.submitted ?? null,
          dialogOpen: Boolean(document.querySelector("#retry-dialog")?.open)
        };
      })()`);
      if (afterNativeSpace.currentIndex !== 1 || afterNativeSpace.submitted || afterNativeSpace.dialogOpen) {
        nativeKeyboardErrors.push("A real Space key did not advance exactly one submitted Quiz question.");
      }

      const nativeSecondReady = await client.evaluate(`(() => {
        const data = window.PPSC_QUIZ_DATA;
        const question = data.questions.find(
          (item) => String(item.id) === String(document.querySelector("#question-text")?.dataset.questionId || "")
        );
        const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
        const sourceOptions = question?.categoryId === "urdu" && Array.isArray(question.optionsUrdu)
          ? question.optionsUrdu.map(String)
          : question?.options.map(optionText);
        const rendered = [...document.querySelectorAll("#options-container .option-text")]
          .map((element) => element.textContent);
        const correctIndex = question && sourceOptions
          ? rendered.indexOf(sourceOptions[question.correctOptionIndex])
          : -1;
        const button = document.querySelector('[data-option-index="' + correctIndex + '"]');
        button?.click();
        button?.focus({ preventScroll: true });
        return Boolean(button);
      })()`);
      if (!nativeSecondReady) {
        nativeKeyboardErrors.push("Native Right Arrow fixture could not select its second Quiz answer.");
      } else {
        await sendNativeKey("Enter", "Enter", 13);
        const beforeNativeRight = await client.evaluate(`(() => {
          const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          return { currentIndex: snapshot?.currentIndex ?? null, submitted: snapshot?.submitted ?? null };
        })()`);
        await sendNativeKey("ArrowRight", "ArrowRight", 39);
        const afterNativeRight = await client.evaluate(`(() => {
          const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
          return {
            currentIndex: snapshot?.currentIndex ?? null,
            submitted: snapshot?.submitted ?? null,
            dialogOpen: Boolean(document.querySelector("#retry-dialog")?.open)
          };
        })()`);
        if (!beforeNativeRight.submitted || afterNativeRight.currentIndex !== beforeNativeRight.currentIndex + 1
          || afterNativeRight.submitted || afterNativeRight.dialogOpen) {
          nativeKeyboardErrors.push("A real Right Arrow key did not advance exactly one submitted Quiz question.");
        }
      }
    }
    const nativeKeyboardResult = {
      errors: nativeKeyboardErrors,
      enterCheck: !nativeKeyboardErrors.some((message) => message.includes("real Enter")),
      spaceNext: !nativeKeyboardErrors.some((message) => message.includes("real Space")),
      rightArrowNext: !nativeKeyboardErrors.some((message) => message.includes("real Right Arrow"))
    };

    const additiveMigrationSeed = await client.evaluate(`(() => {
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      const oldCount = 11412;
      const oldSignature = "v1:11412:57e37c68";
      const oldQuestions = data.questions.slice(0, oldCount);
      const hashText = (hash, value) => {
        const text = String(value);
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash;
      };
      const signatureFor = (questions) => {
        let hash = 2166136261;
        questions.forEach((question) => {
          hash = hashText(hash, JSON.stringify([
            question.id,
            question.categoryId,
            question.question,
            question.questionUrdu,
            question.correctOptionIndex,
            question.options,
            question.optionsUrdu
          ]));
          hash = hashText(hash, "\\n");
        });
        return "v1:" + questions.length + ":" + (hash >>> 0).toString(16);
      };
      const prefixSignature = signatureFor(oldQuestions);
      if (oldQuestions.length !== oldCount || prefixSignature !== oldSignature) {
        errors.push("The approved additive migration fixture no longer matches the exact 11,412-question prefix.");
      }
      const syntheticQuestion = {
        id: "SMOKE-ADDITIVE-Q0001-SRC",
        pairId: "SMOKE-ADDITIVE-Q0001",
        kind: "source",
        categoryId: "general-knowledge",
        question: "Which fixture verifies additive question-bank migration?",
        questionUrdu: "",
        options: ["Stable prefix", "Changed prefix", "Unknown signature", "Deleted state"],
        correctOptionIndex: 0,
        isImportant: false,
        repeatCount: 1
      };
      const currentSignature = signatureFor(data.questions.concat(syntheticQuestion));
      const categoryId = "general-knowledge";
      const frozenPool = oldQuestions.filter((question) => question.categoryId === categoryId);
      const frozenIds = frozenPool.map((question) => String(question.id));
      const itemOne = oldQuestions.find((question) => question.categoryId === categoryId);
      const itemTwo = oldQuestions.find((question) => question.categoryId === "pakistan-studies");
      const oldEntries = data.categories.map((category) => ({
        category,
        questions: oldQuestions.filter((question) => question.categoryId === category.id)
      })).filter((entry) => entry.questions.length > 0);
      const sequentialTurn = oldEntries.length;
      const sequentialQuestion = oldEntries[0]?.questions[1];
      const sequentialIndex = oldQuestions.findIndex(
        (question) => String(question.id) === String(sequentialQuestion?.id || "")
      );
      const currentEntries = data.categories.map((category) => ({
        category,
        questions: data.questions.filter((question) => question.categoryId === category.id)
      })).filter((entry) => entry.questions.length > 0);
      const currentQuestionAtOldTurn = currentEntries.length > 0
        ? currentEntries[sequentialTurn % currentEntries.length]?.questions[
          Math.floor(sequentialTurn / currentEntries.length)
            % currentEntries[sequentialTurn % currentEntries.length].questions.length
        ]
        : null;
      const migratedSequentialTurn = currentQuestionAtOldTurn
        && String(currentQuestionAtOldTurn.id) === String(sequentialQuestion?.id || "")
        ? sequentialTurn
        : (() => {
          const categoryIndex = currentEntries.findIndex(
            (entry) => entry.category.id === sequentialQuestion?.categoryId
          );
          const questionIndex = categoryIndex < 0 ? -1 : currentEntries[categoryIndex].questions.findIndex(
            (question) => String(question.id) === String(sequentialQuestion?.id || "")
          );
          return categoryIndex < 0 || questionIndex < 0
            ? -1
            : questionIndex * currentEntries.length + categoryIndex;
        })();
      const importantQuestions = oldQuestions.filter(
        (question) => question.isImportant === true || Number(question.repeatCount) >= 2
      );
      if (frozenIds.length < 3 || !itemOne || !itemTwo || !sequentialQuestion
        || sequentialIndex < 0 || importantQuestions.length < 2) {
        errors.push("The approved additive migration fixture could not resolve its frozen questions.");
      }

      const session = {
        version: 8,
        bankSignature: oldSignature,
        sessionKind: "category",
        categoryId,
        paperCategoryIds: null,
        mode: "learn",
        scope: "all",
        computerSourceScope: "all",
        partIndex: null,
        importantOnly: false,
        rangeStart: 1,
        rangeEnd: frozenIds.length,
        rangePoolSize: frozenIds.length,
        rangePoolQuestionIds: frozenIds.slice(),
        rangeQuestionIds: frozenIds.slice(),
        questionIds: frozenIds.slice(),
        optionOrders: null,
        answerHistory: null,
        learnVisitedQuestionIds: frozenIds.slice(0, 2),
        learnReviewCountedQuestionIds: frozenIds.slice(0, 2),
        currentIndex: 2,
        selectedIndex: null,
        submitted: false,
        score: 0,
        savedAt: 24680
      };
      const queue = {
        version: 1,
        bankSignature: oldSignature,
        countBaselineVersion: 1,
        embeddedCadenceVersion: 2,
        practiceStep: 41,
        nextQuizReviewStep: 46,
        nextImportantReviewStep: 57,
        nextSequentialReviewStep: 45,
        sequentialOrderVersion: 2,
        sequentialTurn,
        sequentialIndex,
        // Deliberately absent: pre-upgrade saves did not yet persist this ID.
        nextSequence: 9,
        dedicatedDeck: [String(itemTwo.id), String(itemOne.id)],
        dedicatedLastQuestionId: String(itemTwo.id),
        dedicatedRepeatGap: 10,
        dedicatedRecentQuestionIds: [String(itemOne.id), String(itemTwo.id)],
        importantDeck: [String(importantQuestions[1].id)],
        importantLastQuestionId: String(importantQuestions[0].id),
        items: [
          { questionId: String(itemOne.id), remaining: 7, dueStep: 46, sequence: 7 },
          {
            questionId: String(itemTwo.id),
            remaining: 3,
            dueStep: 54,
            wrongRetryDueStep: 54,
            sequence: 8
          }
        ],
        activeAttempt: {
          questionId: String(sequentialQuestion.id),
          optionOrder: [0, 1, 2, 3],
          selectedIndex: (sequentialQuestion.correctOptionIndex + 1) % 4,
          submitted: true,
          outcome: "wrong",
          wrongIncrement: null,
          resumeAction: "next:3",
          context: "embedded",
          kind: "sequential"
        }
      };
      localStorage.setItem("ppsc-prep:active-session:v1", JSON.stringify(session));
      localStorage.setItem("ppsc-prep:retry-queue:v1", JSON.stringify(queue));
      sessionStorage.setItem("ppsc-smoke:additive-bank", "on");
      return {
        errors,
        oldSignature,
        currentSignature,
        session,
        queue,
        sequentialQuestionId: String(sequentialQuestion?.id || ""),
        migratedSequentialTurn
      };
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.querySelector("#continue-session-card")) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for approved additive-bank migration testing."));
        }
      }, 50);
    })`);
    const additiveMigrationResult = await client.evaluate(`(() => {
      const expected = ${JSON.stringify(additiveMigrationSeed)};
      const errors = expected.errors.slice();
      const session = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      const migrationEvents = JSON.parse(sessionStorage.getItem("ppsc-smoke:additive-events") || "[]");
      const stable = (value) => {
        if (Array.isArray(value)) return value.map(stable);
        if (!value || typeof value !== "object") return value;
        return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
      };
      const same = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));
      if (!session || session.bankSignature !== expected.currentSignature) {
        errors.push("Approved additive migration did not rewrite the frozen active session to the current signature.");
      } else {
        for (const key of [
          "questionIds", "rangePoolQuestionIds", "rangeQuestionIds",
          "learnVisitedQuestionIds", "learnReviewCountedQuestionIds"
        ]) {
          if (!same(session[key], expected.session[key])) {
            errors.push("Approved additive migration changed the active session's frozen " + key + ".");
          }
        }
        for (const key of [
          "rangeStart", "rangeEnd", "rangePoolSize", "currentIndex",
          "selectedIndex", "submitted", "score", "savedAt"
        ]) {
          if (session[key] !== expected.session[key]) {
            errors.push("Approved additive migration changed active-session state " + key + ".");
          }
        }
      }
      if (!queue || queue.bankSignature !== expected.currentSignature) {
        errors.push("Approved additive migration did not rewrite Queue state to the current signature.");
      } else {
        for (const key of [
          "practiceStep", "nextQuizReviewStep", "nextImportantReviewStep",
          "nextSequence", "dedicatedRepeatGap",
          "dedicatedLastQuestionId", "importantLastQuestionId", "sequentialIndex"
        ]) {
          if (queue[key] !== expected.queue[key]) {
            errors.push("Approved additive migration changed Queue/gate state " + key + ".");
          }
        }
        if (queue.sequentialTurn !== expected.migratedSequentialTurn) {
          errors.push("Approved additive migration did not retain its legacy Sequential cursor.");
        }
        for (const key of [
          "items", "dedicatedDeck", "dedicatedRecentQuestionIds", "importantDeck"
        ]) {
          if (!same(queue[key], expected.queue[key])) {
            errors.push("Approved additive migration changed Queue/deck/attempt state " + key + ".");
          }
        }
        if (queue.sequentialQuestionId !== expected.sequentialQuestionId) {
          errors.push("Approved additive migration did not retain the legacy Sequential MCQ ID.");
        }
        if (queue.nextSequentialReviewStep !== null || queue.activeAttempt !== null) {
          errors.push("Approved additive migration revived a retired Sequential gate or wrong-answer popup.");
        }
      }
      for (const key of ["ppsc-prep:active-session:v1", "ppsc-prep:retry-queue:v1"]) {
        if (!migrationEvents.some((event) => event.key === key && event.action === "set")) {
          errors.push("Approved additive migration did not notify cloud sync for " + key + ".");
        }
      }
      return {
        errors,
        bankActuallyGrew: expected.currentSignature !== expected.oldSignature,
        frozenSessionQuestionCount: session?.questionIds?.length || 0,
        currentQuestionCount: window.PPSC_QUIZ_DATA.questions.length,
        sequentialQuestionId: queue?.sequentialQuestionId || ""
      };
    })()`);

    const unknownSignatureSeed = await client.evaluate(`(() => {
      const sessionKey = "ppsc-prep:active-session:v1";
      const queueKey = "ppsc-prep:retry-queue:v1";
      const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
      const queue = JSON.parse(localStorage.getItem(queueKey) || "null");
      if (!session || !queue) return false;
      session.bankSignature = "v1:11412:00000000";
      queue.bankSignature = "v1:11412:00000000";
      localStorage.setItem(sessionKey, JSON.stringify(session));
      localStorage.setItem(queueKey, JSON.stringify(queue));
      return true;
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await client.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const timer = setInterval(() => {
        if (window.PPSC_QUIZ_DATA && document.querySelector("#category-grid .category-card")) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error("Website did not reload for unknown-signature rejection testing."));
        }
      }, 50);
    })`);
    const unknownSignatureResult = await client.evaluate(`(() => {
      const errors = [];
      const session = localStorage.getItem("ppsc-prep:active-session:v1");
      const queue = JSON.parse(localStorage.getItem("ppsc-prep:retry-queue:v1") || "null");
      if (!${JSON.stringify(unknownSignatureSeed)}) {
        errors.push("Unknown-signature rejection fixture could not be seeded.");
      }
      if (session !== null) errors.push("An unknown stale active-session signature was not rejected.");
      if (queue !== null && (queue.items?.length || queue.activeAttempt)) {
        errors.push("An unknown stale Queue signature was not rejected and reset.");
      }
      return { errors };
    })()`);

    const { resumeExpected, legacyV6Snapshot, ...normalSummary } = normalResult;
    const result = {
      ...normalSummary,
      errors: themeInitialResult.errors
        .concat(themePersistenceResult.errors)
        .concat(themeMobileResult.errors)
        .concat(computerSourceFixture.errors)
        .concat(computerSourceUiResult.errors)
        .concat(computerSourceResponsiveResult.errors)
        .concat(computerSourceDesktopResult.errors)
        .concat(computerSourceFlowResult.errors)
        .concat(computerSourceResumeResult.errors)
        .concat(computerSourceV7MigrationResult.errors)
        .concat(computerSourceV6MigrationResult.errors)
        .concat(computerSourceInvalidResult.errors)
        .concat(computerSourceTamperResult.errors)
        .concat(retryQueueFeatureResult.errors)
        .concat(retryMismatchSeedResult.errors)
        .concat(retryMismatchResumeResult.errors)
        .concat(retryLearnResumeResult.errors)
        .concat(retryLegacyLearnMigrationSeed.errors)
        .concat(retryLegacyLearnMigrationResult.errors)
        .concat(retryPositionResult.errors)
        .concat(retryCorruptRecoveryResult.errors)
        .concat(foreignAttemptIdempotenceResult.errors)
        .concat(normalResult.errors)
        .concat(quickNotes320Result.errors)
        .concat(resumeResult.errors)
        .concat(pendingResumeResult.errors)
        .concat(legacyV6SeedResult.errors)
        .concat(legacyV6MigrationResult.errors)
        .concat(positionGuardSetupResult.errors)
        .concat(positionGuardRecoveryResult.errors)
        .concat(rangePoolGuardRecoveryResult.errors)
        .concat(questionOrderGuardRecoveryResult.errors)
        .concat(difficultResult.errors)
        .concat(difficultResumeSetup.errors)
        .concat(difficultResumeResult.errors)
        .concat(learnResumeSetup.errors)
        .concat(learnResumeResult.errors)
        .concat(urduSetupResult.errors)
        .concat(urduResumeResult.errors)
        .concat(retryLifecycleSetup.errors)
        .concat(retryLifecycleResume.errors)
        .concat(retryExistingCountSeedResult.errors)
        .concat(retryExistingCountPreservationResult.errors)
        .concat(retryBaselineReloadResult.errors)
        .concat(legacyWrongAttemptSeed.errors)
        .concat(legacyWrongAttemptResult.errors)
        .concat(confirmationQueueResult.errors)
        .concat(permanentImportantResult.errors)
        .concat(sequentialReviewResult.errors)
        .concat(keyboardControlResult.errors)
        .concat(nativeKeyboardResult.errors)
        .concat(additiveMigrationResult.errors)
        .concat(unknownSignatureResult.errors)
        .concat(paperSetupResult.errors)
        .concat(paperResumeResult.errors),
      resume: {
        submittedStateRestored: resumeResult.errors.length === 0,
        pendingSelectionRestored: pendingResumeResult.errors.length === 0,
        legacyV6Migrated: legacyV6SeedResult.errors.length === 0 && legacyV6MigrationResult.errors.length === 0,
        difficultLearnRestored: difficultResumeSetup.errors.length === 0 && difficultResumeResult.errors.length === 0,
        learnVisitedIdsRestored: learnResumeSetup.errors.length === 0 && learnResumeResult.errors.length === 0,
        urduQuizRestored: urduSetupResult.errors.length === 0 && urduResumeResult.errors.length === 0,
        corruptDataRecovered: !positionGuardSetupResult.errors.some((message) => message.includes("Corrupt resume data")),
        malformedPositionOrderRejected: positionGuardRecoveryResult.errors.length === 0,
        tamperedRangePoolRejected: rangePoolGuardRecoveryResult.errors.length === 0,
        permutedCategoryQuizOrderRejected: rangePoolGuardRecoveryResult.errors.length === 0
          && questionOrderGuardRecoveryResult.errors.length === 0,
        staleDataRecovered: !difficultResult.errors.some((message) => message.includes("Legacy Part resume data"))
          && !difficultResumeSetup.errors.some((message) => message.includes("Stale-bank resume data")),
        approvedAdditiveBank: additiveMigrationResult,
        unknownSignatureRejected: unknownSignatureResult.errors.length === 0
      },
      positionOptionGuard: {
        verifiedSensitiveCount: positionGuardSetupResult.verifiedSensitiveCount,
        normalOptionsStillShuffle: positionGuardSetupResult.normalOptionOrderShuffled,
        malformedQuestionId: positionGuardSetupResult.malformedQuestionId,
        malformedSnapshotRejected: positionGuardRecoveryResult.errors.length === 0,
        tamperedRangePoolRejected: rangePoolGuardRecoveryResult.errors.length === 0,
        permutedCategoryQuizOrderRejected: rangePoolGuardRecoveryResult.errors.length === 0
          && questionOrderGuardRecoveryResult.errors.length === 0
      },
      difficult: difficultResult,
      urdu: urduResumeResult,
      theme: {
        initialLight: themeInitialResult.initialTheme === "light",
        toggledDark: themeInitialResult.toggledTheme === "dark",
        persistedDark: themePersistenceResult.persistedTheme === "dark"
          && themePersistenceResult.persistedPreference === "dark",
        restoredExplicitLight: themePersistenceResult.restoredTheme === "light"
          && themePersistenceResult.restoredPreference === "light",
        controlsAccessibleAndSynchronized: themeInitialResult.errors.length === 0
          && themePersistenceResult.errors.length === 0,
        mobileNoOverflow: themeMobileResult.errors.length === 0,
        mobileMetrics: themeMobileResult,
        lightColors: themeInitialResult.lightColors,
        darkColors: themeInitialResult.darkColors,
        screenshots: themeScreenshots
      },
      computerSources: {
        counts: computerSourceFlowResult.counts,
        uiAndResponsive: computerSourceUiResult.errors.length === 0
          && computerSourceResponsiveResult.errors.length === 0
          && computerSourceDesktopResult.errors.length === 0,
        notesLearnQuizImportantDifficult: computerSourceFlowResult.errors.length === 0,
        v8SourceRestored: computerSourceResumeResult.errors.length === 0,
        v7MigratedToAll: computerSourceV7MigrationResult.errors.length === 0,
        v6MigratedToAll: computerSourceV6MigrationResult.errors.length === 0,
        invalidScopeRejected: computerSourceInvalidResult.errors.length === 0,
        tamperedScopeRejected: computerSourceTamperResult.errors.length === 0,
        retryFirstReviewId: retryQueueFeatureResult.sourceReviewIds[0],
        retryCrossSourceIds: retryQueueFeatureResult.sourceReviewIds,
        resultsOpenedWithPending: true,
        screenshots: computerSourceScreenshots
      },
      retryQueue: {
        initialTwoAndCadence: retryQueueFeatureResult.errors.length === 0,
        globalControlRemoved: !retryQueueFeatureResult.errors.some((error) => error.includes("Removed all-category Queue controls")),
        embeddedCadence: retryQueueFeatureResult.cadence,
        nextEmbeddedCadence: retryQueueFeatureResult.nextCadence,
        categoryQueueCycle: categoryQueueCycleResult.errors.length === 0
          && categoryQueueResumeResult.errors.length === 0,
        categoryQueueNextCycleId: categoryQueueResumeResult.nextCycleId,
        wrongRetryRemaining: retryQueueFeatureResult.wrongRemaining,
        categoriesCovered: retryQueueFeatureResult.categoriesCovered,
        mobileProbeMetrics: retryQueueFeatureResult.mobileMetrics,
        globalQueueRestoredAcrossCategory: retryMismatchResumeResult.errors.length === 0,
        foreignSavedAttemptReleasedOnce: foreignAttemptIdempotenceResult.errors.length === 0,
        learnQueueCadenceRestored: retryLearnResumeResult.errors.length === 0,
        embeddedCategoryQueue: retryLearnResumeResult.errors.length === 0,
        legacyLearnCadenceMigrated: retryLegacyLearnMigrationSeed.errors.length === 0
          && retryLegacyLearnMigrationResult.errors.length === 0,
        pendingAfterResults: retryQueueFeatureResult.seedQueue?.items?.length || 0,
        existingCountsBaselinedToFive: retryExistingCountPreservationResult.remaining === 7
          && retryExistingCountSeedResult.errors.length === 0
          && retryExistingCountPreservationResult.errors.length === 0,
        countBaselineIdempotent: retryBaselineReloadResult.remaining === 7
          && retryBaselineReloadResult.spacedFromRecentMaximum === true
          && retryBaselineReloadResult.errors.length === 0,
        newWrongAfterBaselineAddsTwo: retryExistingCountPreservationResult.remaining === 7,
        legacySubmittedWrongFiveApplied: legacyWrongAttemptResult.remaining === 10
          && legacyWrongAttemptSeed.errors.length === 0 && legacyWrongAttemptResult.errors.length === 0,
        correctConfirmation: confirmationQueueResult,
        permanentImportant: permanentImportantResult,
        sequentialRetirement: sequentialReviewResult,
        positionDependentCanonical: retryPositionResult.errors.length === 0,
        categoryScopedQueue: retryPositionResult.errors.length === 0
          && retryMismatchResumeResult.errors.length === 0
          && retryLearnResumeResult.errors.length === 0,
        corruptQueueRecovered: retryCorruptRecoveryResult.errors.length === 0,
        screenshots: retryQueueFeatureResult.screenshots
      },
      keyboardControls: {
        ...keyboardControlResult,
        nativeEvents: nativeKeyboardResult
      },
      paper: paperResumeResult
    };
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
