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
      const deadline = Date.now() + 30000;
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

    const normalResult = await client.evaluate(`(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const errors = [];
      const data = window.PPSC_QUIZ_DATA;
      if (!data || data.categories.length !== 11) errors.push("Expected 11 categories.");
      if (!data || data.questions.length !== 9340) errors.push("Expected the current 9,340-question release bank.");
      if (!data || data.version !== 5) errors.push("Expected question-data schema version 5.");
      const importantQuestions = data ? data.questions.filter((question) => question.isImportant === true) : [];
      if (importantQuestions.length !== 704) errors.push("Expected 704 evidence-based important questions.");
      if (importantQuestions.some((question) => !Number.isInteger(question.repeatCount) || question.repeatCount < 2)) errors.push("Important repeat metadata is invalid.");
      if (data && data.questions.some((question) => !/[\u0600-\u06ff]/u.test(String(question.questionUrdu || "")))) errors.push("A question is missing its Urdu translation.");
      if (document.querySelectorAll("#category-grid .category-card").length !== 11) errors.push("Category cards did not render.");
      if (visible(document.querySelector("#continue-session-card"))) errors.push("A fresh profile incorrectly showed Continue.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Mobile layout has horizontal overflow.");
      if (data.questions.some((question) => !/^https?:\\/\\//.test(question.source.referenceUrl))) errors.push("A research URL is missing.");
      if (document.querySelector("#details-toggle, #details-panel, #explanation-text, #related-history, #option-rationales, #source-notes, #details-source")) errors.push("Removed answer-explanation UI is still present.");

      const ibesQuestions = data.questions.filter((question) => question.id.startsWith("IBES-"));
      const ibesSourceQuestions = ibesQuestions.filter((question) => question.kind === "source");
      if (ibesQuestions.length !== 2176 || ibesSourceQuestions.length !== 1088) errors.push("IBES retained source/similar counts are incomplete.");
      if (ibesQuestions.some((question) => question.categoryId !== "basic-computer-studies")) errors.push("An IBES question is outside Basic Computer Studies.");

      const advQuestions = data.questions.filter((question) => question.id.startsWith("ADV2E102-"));
      const advSourceQuestions = advQuestions.filter((question) => question.kind === "source");
      const advSimilarQuestions = advQuestions.filter((question) => question.kind === "similar");
      if (advQuestions.length !== 6266 || advSourceQuestions.length !== 3133 || advSimilarQuestions.length !== 3133) {
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
        document.querySelector("#learn-mode-button").click();
        await pause();
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
      const categoryQuestions = allCategoryQuestions.slice(0, 50);
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const findCurrent = () => {
        const questionId = document.querySelector("#question-text").dataset.questionId;
        return categoryQuestions.find((question) => question.id === questionId);
      };
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const correctRenderedIndex = (question) => renderedOptionTexts().indexOf(
        optionText(question.options[question.correctOptionIndex])
      );
      const verifyQuizOptionShuffle = (question) => {
        const original = question.options.map(optionText);
        const rendered = renderedOptionTexts();
        if (JSON.stringify(rendered) === JSON.stringify(original)) {
          errors.push("Quiz options were not shuffled for " + question.id + ".");
        }
        const correctIndex = correctRenderedIndex(question);
        if (correctIndex < 0) errors.push("Shuffled correct answer could not be mapped for " + question.id + ".");
        return correctIndex < 0 ? 0 : correctIndex;
      };

      categoryButton.click();
      await pause();
      if (!visible(document.querySelector("#mode-screen"))) errors.push("Mode chooser did not open after selecting a category.");
      if (document.querySelectorAll("#standard-mode-options > .mode-option").length !== 3) errors.push("Mode chooser did not show Learn, Quiz and Difficult.");
      const partSelect = document.querySelector("#part-select");
      if (!partSelect || partSelect.value !== "0") errors.push("The first 50-question Part was not selected by default.");
      if (!partSelect || partSelect.options.length !== Math.ceil(allCategoryQuestions.length / 50) + 1) errors.push("Part selector count is incorrect.");
      if (!document.querySelector("#study-scope-summary").textContent.includes("questions 1–50")) errors.push("Part summary did not show the first 50-question range.");
      const firstPartImportantCount = categoryQuestions.filter((question) => question.isImportant === true).length;
      if (!document.querySelector("#important-count").textContent.startsWith(String(firstPartImportantCount))) errors.push("Important count did not match the selected Part.");

      const importantPartIndex = Array.from(
        { length: Math.ceil(allCategoryQuestions.length / 50) },
        (_, index) => index
      ).find((index) => allCategoryQuestions.slice(index * 50, (index + 1) * 50).some((question) => question.isImportant === true));
      if (!Number.isInteger(importantPartIndex)) {
        errors.push("Could not find an Important Part in the tested category.");
      } else {
        partSelect.value = String(importantPartIndex);
        partSelect.dispatchEvent(new Event("change", { bubbles: true }));
        const expectedImportant = allCategoryQuestions
          .slice(importantPartIndex * 50, (importantPartIndex + 1) * 50)
          .filter((question) => question.isImportant === true);
        const importantCheckbox = document.querySelector("#important-only-checkbox");
        importantCheckbox.click();
        await pause();
        if (document.querySelector("#learn-mode-button").disabled || document.querySelector("#quiz-mode-button").disabled) errors.push("Important Learn/Quiz was disabled despite matching questions.");
        document.querySelector("#learn-mode-button").click();
        await pause();
        const importantRenderedId = document.querySelector("#question-text").dataset.questionId;
        if (!expectedImportant.some((question) => question.id === importantRenderedId)) errors.push("Important Learn rendered a non-important question.");
        if (!document.querySelector("#question-counter").textContent.endsWith("of " + expectedImportant.length)) errors.push("Important Learn total was incorrect.");
        if (!document.querySelector("#question-kind").textContent.includes("IMPORTANT")) errors.push("Important question badge was not rendered.");
        document.querySelector("#back-button").click();
        await pause();
        categoryButton.click();
        await pause();
        if (document.querySelector("#part-select").value !== "0" || document.querySelector("#important-only-checkbox").checked) errors.push("A fresh category choice did not reset to standard Part 1.");
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
      document.querySelector("#learn-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Learn mode did not open.");

      let question = findCurrent();
      let correctButton = document.querySelector('[data-option-index="' + correctRenderedIndex(question) + '"]');
      if (!correctButton.disabled || !correctButton.classList.contains("is-correct")) errors.push("Learn mode did not reveal and lock the correct answer.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(question.options.map(optionText))) errors.push("Learn mode changed the source option order.");
      if (!visible(document.querySelector("#question-urdu-block")) || document.querySelector("#question-text-urdu").textContent !== question.questionUrdu) errors.push("Urdu question translation did not render in Learn mode.");
      if (document.querySelector("#score-text").textContent !== "Learn Mode") errors.push("Learn mode displayed a score.");
      if (document.querySelector("#action-button").textContent !== "Next Question" && categoryQuestions.length > 1) errors.push("Learn mode did not offer the next question immediately.");
      if (!document.querySelector("#previous-button").disabled) errors.push("Previous was enabled on the first Learn question.");
      if (categoryQuestions.length > 1) {
        const firstLearnId = question.id;
        document.querySelector("#action-button").click();
        await pause();
        if (document.querySelector("#previous-button").disabled) errors.push("Previous stayed disabled after advancing in Learn mode.");
        document.querySelector("#previous-button").click();
        await pause();
        if (document.querySelector("#question-text").dataset.questionId !== firstLearnId) errors.push("Previous did not restore the first Learn question.");
        if (!document.querySelector("#previous-button").disabled) errors.push("Previous was not disabled after returning to the first Learn question.");
      }
      document.querySelector("#restart-button").click();
      await pause();
      if (!document.querySelector("#question-counter").textContent.startsWith("Question 1 ")) errors.push("Learn restart failed.");
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

      document.querySelector("#action-button").click();
      await pause();
      question = findCurrent();
      const secondQuizId = question.id;
      const secondQuizOptions = JSON.stringify(renderedOptionTexts());
      if (document.querySelector("#previous-button").disabled) errors.push("Previous stayed disabled after advancing in Quiz mode.");
      document.querySelector("#previous-button").click();
      await pause();
      if (document.querySelector("#question-text").dataset.questionId !== quizOrder[0]) errors.push("Previous restored the wrong Quiz question.");
      if (JSON.stringify(renderedOptionTexts()) !== firstQuizOptionOrders[quizOrder[0]]) errors.push("Previous changed the restored Quiz option order.");
      const restoredWrongButton = document.querySelector('[data-option-index="' + wrongIndex + '"]');
      if (!restoredWrongButton || !restoredWrongButton.disabled || !restoredWrongButton.classList.contains("is-incorrect")) errors.push("Previous did not restore the submitted Quiz answer.");
      if (document.querySelector("#feedback-title").textContent !== "Incorrect" || document.querySelector("#score-text").textContent !== "Score: 0") errors.push("Previous changed Quiz feedback or score.");
      if (!document.querySelector("#previous-button").disabled) errors.push("Previous was not disabled on the restored first Quiz question.");
      document.querySelector("#action-button").click();
      await pause();
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
      if (quizOrder.length !== categoryQuestions.length || new Set(quizOrder).size !== categoryQuestions.length) errors.push("Quiz question shuffle lost or duplicated a question.");
      if (JSON.stringify(quizOrder) === JSON.stringify(canonicalOrder)) errors.push("Quiz questions remained in source order.");
      if (JSON.stringify(quizOrder) === JSON.stringify(learnOrder)) errors.push("Quiz reused the previous Learn question order.");
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
      if (JSON.stringify(repeatedQuizOrder) === JSON.stringify(quizOrder)) errors.push("Practice Again reused the previous question order.");

      const sessionStorageKey = "ppsc-prep:active-session:v1";
      if (localStorage.getItem(sessionStorageKey) !== null) errors.push("Completed Quiz session was not cleared from resume storage.");
      document.querySelector("#change-category-button").click();
      categoryButton.click();
      document.querySelector("#quiz-mode-button").click();
      await pause();
      const resumeQuestion = findCurrent();
      const resumeCorrectIndex = correctRenderedIndex(resumeQuestion);
      const resumeSelectedIndex = (resumeCorrectIndex + 1) % 4;
      document.querySelector('[data-option-index="' + resumeSelectedIndex + '"]').click();
      document.querySelector("#action-button").click();
      await pause();
      const resumeSnapshot = JSON.parse(localStorage.getItem(sessionStorageKey) || "null");
      if (!resumeSnapshot || resumeSnapshot.version !== 3) errors.push("Active Quiz was not saved with the versioned resume schema.");
      if (!resumeSnapshot || resumeSnapshot.mode !== "quiz" || resumeSnapshot.scope !== "all") errors.push("Saved Quiz resume mode/scope was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.partIndex !== 0 || resumeSnapshot.importantOnly !== false) errors.push("Saved Quiz Part/Important scope was incorrect.");
      if (!resumeSnapshot || !Array.isArray(resumeSnapshot.questionIds) || resumeSnapshot.questionIds.length !== categoryQuestions.length) errors.push("Saved Quiz question order was incomplete.");
      if (!resumeSnapshot || !Array.isArray(resumeSnapshot.optionOrders) || resumeSnapshot.optionOrders.length !== categoryQuestions.length) errors.push("Saved Quiz option orders were incomplete.");
      if (!resumeSnapshot || !Array.isArray(resumeSnapshot.answerHistory) || resumeSnapshot.answerHistory.length !== categoryQuestions.length) errors.push("Saved Quiz answer history was incomplete.");
      if (!resumeSnapshot || !resumeSnapshot.submitted || resumeSnapshot.selectedIndex !== resumeSelectedIndex || resumeSnapshot.score !== 0) errors.push("Saved submitted-answer state was incorrect.");

      return {
        errors,
        categoryCards: document.querySelectorAll("#category-grid .category-card").length,
        totalQuestions: data.questions.length,
        testedCategory: activeCategory,
        testedCategoryQuestions: categoryQuestions.length,
        markedQuestionIds,
        learnedInSourceOrder: JSON.stringify(learnOrder) === JSON.stringify(canonicalOrder),
        quizOrderShuffledAgain: JSON.stringify(quizOrder) !== JSON.stringify(learnOrder),
        practiceAgainShuffled: JSON.stringify(repeatedQuizOrder) !== JSON.stringify(quizOrder),
        firstQuizScore,
        repeatedQuizScore: document.querySelector("#result-score").textContent,
        resumeExpected: {
          categoryId: activeCategory,
          categoryName: data.categories.find((category) => category.id === activeCategory).name,
          questionCount: categoryQuestions.length,
          questionIds: resumeSnapshot ? resumeSnapshot.questionIds : [],
          optionOrders: resumeSnapshot ? resumeSnapshot.optionOrders : [],
          questionId: resumeQuestion ? resumeQuestion.id : "",
          optionTexts: renderedOptionTexts(),
          selectedIndex: resumeSelectedIndex,
          score: 0
        },
        sourceNotesAvailable: data.questions.filter((item) => item.sourceNotes).length
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
      if (!continueMeta.includes("Quiz") || !continueMeta.includes("Part 1") || !continueMeta.includes("Question 1 of " + expected.questionCount)) errors.push("Continue card did not label Quiz mode, Part and progress.");

      const storedBeforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
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
      if (!document.querySelector("#question-counter").textContent.startsWith("Question 1 ")) errors.push("Continue did not restore the question index.");

      document.querySelector("#action-button").click();
      await pause();
      const pendingQuestionId = document.querySelector("#question-text").dataset.questionId;
      const pendingOptionTexts = renderedOptionTexts();
      const pendingSelectedIndex = 2;
      document.querySelector('[data-option-index="' + pendingSelectedIndex + '"]').click();
      await pause();
      const pendingSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!pendingSnapshot || pendingSnapshot.currentIndex !== 1 || pendingSnapshot.submitted || pendingSnapshot.selectedIndex !== pendingSelectedIndex) errors.push("Unsubmitted selected option was not saved for Continue.");

      return {
        errors,
        pending: {
          categoryName: expected.categoryName,
          questionCount: expected.questionCount,
          questionId: pendingQuestionId,
          optionTexts: pendingOptionTexts,
          selectedIndex: pendingSelectedIndex,
          score: expected.score
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
      if (!visible(document.querySelector("#continue-session-card")) || !meta.includes("Question 2 of " + expected.questionCount)) errors.push("Continue card did not show the pending question index.");
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

    const corruptRecoveryResult = await client.evaluate(`(() => {
      const errors = [];
      const visible = (element) => Boolean(
        element &&
        !element.hidden &&
        getComputedStyle(element).display !== "none" &&
        element.getClientRects().length > 0
      );
      const storageKey = "ppsc-prep:active-session:v1";
      if (visible(document.querySelector("#continue-session-card"))) errors.push("Corrupt resume data left the Continue card visible.");
      if (localStorage.getItem(storageKey) !== null) errors.push("Corrupt resume data was not removed safely.");
      localStorage.setItem(storageKey, JSON.stringify({
        version: 1,
        bankSignature: "stale-question-bank",
        categoryId: ${JSON.stringify(normalResult.testedCategory)},
        mode: "quiz",
        scope: "all",
        questionIds: [${JSON.stringify(normalResult.resumeExpected.questionId)}],
        optionOrders: [[0, 1, 2, 3]],
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
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const findCurrent = () => {
        const questionId = document.querySelector("#question-text").dataset.questionId;
        return categoryQuestions.find((question) => question.id === questionId);
      };
      const correctRenderedIndex = (question) => renderedOptionTexts().indexOf(
        optionText(question.options[question.correctOptionIndex])
      );

      if (visible(document.querySelector("#continue-session-card"))) errors.push("Stale resume data left the Continue card visible.");
      if (localStorage.getItem("ppsc-prep:active-session:v1") !== null) errors.push("Stale resume data was not removed safely.");

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

      document.querySelector("#difficult-learn-button").click();
      await pause();
      if (document.querySelector("#quiz-screen").dataset.scope !== "difficult") errors.push("Difficult Learn did not retain difficult scope.");
      if (document.querySelector("#quiz-screen").dataset.mode !== "learn") errors.push("Difficult Learn did not enter Learn mode.");
      if (!document.querySelector("#question-counter").textContent.endsWith("of " + expectedMarkedIds.length)) errors.push("Difficult Learn total did not match marked questions.");

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
        document.querySelector("#action-button").click();
        await pause();
      }
      if (difficultLearnIds.length !== expectedMarkedIds.length || expectedMarkedIds.some((id) => !difficultLearnIds.includes(id))) {
        errors.push("Difficult Learn did not use a stable marked-question snapshot.");
      }
      if (document.querySelector("#results-title").textContent !== "Difficult learning complete!") errors.push("Difficult Learn completion copy was incorrect.");
      if (document.querySelector("#play-again-button").textContent !== "Start Quiz" || document.querySelector("#play-again-button").disabled) errors.push("Difficult Learn did not offer Start Quiz.");

      document.querySelector("#play-again-button").click();
      await pause();
      if (document.querySelector("#quiz-screen").dataset.scope !== "difficult" || document.querySelector("#quiz-screen").dataset.mode !== "quiz") errors.push("Start Quiz left Difficult scope.");
      if (!document.querySelector("#question-counter").textContent.endsWith("of " + expectedMarkedIds.length)) errors.push("Difficult Quiz total did not match both marked questions.");

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
        if (renderedOrder === JSON.stringify(quizQuestion.options.map(optionText))) errors.push("Difficult Quiz options were not shuffled.");
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
      if (difficultQuizIds.length !== expectedMarkedIds.length || expectedMarkedIds.some((id) => !difficultQuizIds.includes(id))) errors.push("Difficult Quiz did not keep its two-question session snapshot.");
      if (JSON.stringify(difficultQuizIds) === JSON.stringify(difficultLearnIds)) errors.push("Two-question Difficult Quiz reused the Difficult Learn order.");
      if (document.querySelector("#result-score").textContent.replace(/\\s/g, "") !== expectedMarkedIds.length + "/" + expectedMarkedIds.length) errors.push("Difficult Quiz score was incorrect.");
      if (document.querySelector("#play-again-button").textContent !== "Practice Again" || document.querySelector("#play-again-button").disabled) errors.push("Difficult Quiz did not offer Practice Again for the remaining mark.");

      const remainingId = expectedMarkedIds.find((id) => id !== removedId);
      document.querySelector("#play-again-button").click();
      await pause();
      if (!document.querySelector("#question-counter").textContent.endsWith("of 1")) errors.push("Practice Again did not filter Difficult Quiz to the remaining mark.");
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
        twoQuestionOrderChanged: JSON.stringify(difficultQuizIds) !== JSON.stringify(difficultLearnIds),
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
      const errors = [];
      const seed = ${JSON.stringify(difficultResumeSeed)};
      const categoryButton = [...document.querySelectorAll("#category-grid .category-card")]
        .find((button) => (button.dataset.category || button.dataset.categoryId) === seed.categoryId);
      categoryButton.click();
      document.querySelector("#difficult-mode-button").click();
      document.querySelector("#difficult-learn-button").click();
      await pause();
      const optionTexts = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!snapshot || snapshot.mode !== "learn" || snapshot.scope !== "difficult") errors.push("Difficult Learn was not stored with the correct resume scope/mode.");
      if (!snapshot || snapshot.questionIds.length !== 1 || snapshot.questionIds[0] !== seed.questionId) errors.push("Difficult Learn resume snapshot did not keep its marked-question scope.");
      if (!snapshot || !snapshot.submitted || snapshot.score !== 0) errors.push("Difficult Learn resume answer state was incorrect.");
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
      const selectedButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!selectedButton || !selectedButton.disabled || !selectedButton.classList.contains("is-correct")) errors.push("Difficult Learn Continue did not restore the revealed answer.");
      document.querySelector("#action-button").click();
      await pause();
      if (!visible(document.querySelector("#results-screen"))) errors.push("Restored Difficult Learn session did not complete.");
      if (localStorage.getItem("ppsc-prep:active-session:v1") !== null) errors.push("Completed Difficult Learn session remained resumable.");
      localStorage.setItem("ppsc-prep:difficult-question-ids:v1", JSON.stringify({ version: 1, questionIds: [] }));
      return { errors };
    })()`);

    const { resumeExpected, ...normalSummary } = normalResult;
    const result = {
      ...normalSummary,
      errors: normalResult.errors
        .concat(resumeResult.errors)
        .concat(pendingResumeResult.errors)
        .concat(corruptRecoveryResult.errors)
        .concat(difficultResult.errors)
        .concat(difficultResumeSetup.errors)
        .concat(difficultResumeResult.errors),
      resume: {
        submittedStateRestored: resumeResult.errors.length === 0,
        pendingSelectionRestored: pendingResumeResult.errors.length === 0,
        difficultLearnRestored: difficultResumeSetup.errors.length === 0 && difficultResumeResult.errors.length === 0,
        corruptDataRecovered: corruptRecoveryResult.errors.length === 0,
        staleDataRecovered: !difficultResult.errors.some((message) => message.includes("Stale resume data"))
      },
      difficult: difficultResult
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
