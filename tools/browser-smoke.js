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
      if (!data || data.questions.length !== 11412) errors.push("Expected the current 11,412-question release bank.");
      if (!data || data.version !== 5) errors.push("Expected question-data schema version 5.");
      const importantQuestions = data ? data.questions.filter((question) => question.isImportant === true) : [];
      if (importantQuestions.length !== 1071) errors.push("Expected 1,071 evidence-based important questions.");
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
      const categoryQuestions = allCategoryQuestions;
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

      categoryButton.click();
      await pause();
      if (!visible(document.querySelector("#mode-screen"))) errors.push("Mode chooser did not open after selecting a category.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Mode chooser has horizontal overflow on mobile.");
      if (document.querySelectorAll("#standard-mode-options > .mode-option").length !== 3) errors.push("Mode chooser did not show Learn, Quiz and Difficult.");
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
        document.querySelector("#learn-mode-button").click();
        await pause();
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
      document.querySelector("#learn-mode-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen"))) errors.push("Learn mode did not open.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Question screen has horizontal overflow on mobile.");
      const questionNumberInput = document.querySelector("#question-number-input");
      if (!questionNumberInput || (!questionNumberInput.labels.length && !questionNumberInput.getAttribute("aria-label"))) errors.push("Question-number input has no accessible name.");

      let question = findCurrent();
      let correctButton = document.querySelector('[data-option-index="' + correctRenderedIndex(question) + '"]');
      if (!correctButton.disabled || !correctButton.classList.contains("is-correct")) errors.push("Learn mode did not reveal and lock the correct answer.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(question.options.map(optionText))) errors.push("Learn mode changed the source option order.");
      if (!visible(document.querySelector("#question-urdu-block")) || document.querySelector("#question-text-urdu").textContent !== question.questionUrdu) errors.push("Urdu question translation did not render in Learn mode.");
      if (document.querySelector("#score-text").textContent !== "Learn Mode") errors.push("Learn mode displayed a score.");
      if (document.querySelector("#action-button").textContent !== "Next Question" && categoryQuestions.length > 1) errors.push("Learn mode did not offer the next question immediately.");
      if (!document.querySelector("#previous-button").disabled) errors.push("Previous was enabled on the first Learn question.");
      assertProgress(1, categoryQuestions.length, "Initial Learn");
      if (categoryQuestions.length > 1) {
        const firstLearnId = question.id;
        document.querySelector("#action-button").click();
        await pause();
        assertProgress(2, categoryQuestions.length, "Learn Next");
        if (document.querySelector("#previous-button").disabled) errors.push("Previous stayed disabled after advancing in Learn mode.");
        document.querySelector("#previous-button").click();
        await pause();
        assertProgress(1, categoryQuestions.length, "Learn Previous");
        if (document.querySelector("#question-text").dataset.questionId !== firstLearnId) errors.push("Previous did not restore the first Learn question.");
        if (!document.querySelector("#previous-button").disabled) errors.push("Previous was not disabled after returning to the first Learn question.");

        const manualLearnNumber = Math.min(3, categoryQuestions.length);
        await jumpByChange(manualLearnNumber);
        if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[manualLearnNumber - 1].id) errors.push("Learn change jump opened the wrong question.");
        assertProgress(manualLearnNumber, categoryQuestions.length, "Learn change jump");
        await jumpByEnter(2);
        if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[1].id) errors.push("Learn Enter jump opened the wrong question.");
        assertProgress(2, categoryQuestions.length, "Learn Enter jump");
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
        if (!learnGuardSnapshot || learnGuardSnapshot.version !== 5 || learnGuardSnapshot.sessionKind !== "category" || learnGuardSnapshot.paperCategoryIds !== null || learnGuardSnapshot.mode !== "learn" || learnGuardSnapshot.partIndex !== null) errors.push("Learn completion guard was not stored with the v5 category-session schema.");
        if (!learnGuardSnapshot || learnGuardSnapshot.currentIndex !== categoryQuestions.length - 1 || !visitedLearnIds.has(categoryQuestions[categoryQuestions.length - 1].id)) errors.push("Learn visited IDs did not persist the directly visited last question.");
        if (firstUnvisitedLearnIndex < 0) errors.push("Learn completion guard could not identify an unvisited question.");
        if (document.querySelector("#action-button").textContent !== "Next Unvisited" || document.querySelector("#action-button").dataset.action !== "next-unvisited") errors.push("Last Learn question did not offer Next Unvisited while questions remained unseen.");
        document.querySelector("#action-button").click();
        await pause();
        if (visible(document.querySelector("#results-screen"))) errors.push("Learn opened results while questions remained unvisited.");
        if (firstUnvisitedLearnIndex >= 0) {
          if (document.querySelector("#question-text").dataset.questionId !== categoryQuestions[firstUnvisitedLearnIndex].id) errors.push("Next Unvisited did not wrap to the first unvisited Learn question.");
          assertProgress(firstUnvisitedLearnIndex + 1, categoryQuestions.length, "Learn Next Unvisited");
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
      if (!resumeSnapshot || resumeSnapshot.version !== 5) errors.push("Active Quiz was not saved with the versioned resume schema.");
      if (!resumeSnapshot || resumeSnapshot.sessionKind !== "category" || resumeSnapshot.paperCategoryIds !== null) errors.push("Saved Quiz did not use the v5 category-session fields.");
      if (!resumeSnapshot || resumeSnapshot.mode !== "quiz" || resumeSnapshot.scope !== "all") errors.push("Saved Quiz resume mode/scope was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.partIndex !== null || resumeSnapshot.importantOnly !== false) errors.push("Saved Quiz full-category/Important scope was incorrect.");
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
          bankSignature: resumeSnapshot ? resumeSnapshot.bankSignature : "",
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
      if (!continueMeta.includes("Quiz") || !continueMeta.includes("All Questions") || !continueMeta.includes("Question 1 of " + expected.questionCount)) errors.push("Continue card did not label Quiz mode, All Questions and progress.");

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
      const pendingNumberInput = document.querySelector("#question-number-input");
      const pendingTotal = document.querySelector("#question-total");
      if (!pendingNumberInput || pendingNumberInput.value !== "2" || pendingNumberInput.max !== String(expected.questionCount) || !pendingTotal || pendingTotal.textContent.trim() !== String(expected.questionCount)) errors.push("Pending Continue did not restore the question progress controls.");

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
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const findCurrent = () => {
        const questionId = document.querySelector("#question-text").dataset.questionId;
        return categoryQuestions.find((question) => question.id === questionId);
      };
      const correctRenderedIndex = (question) => renderedOptionTexts().indexOf(
        optionText(question.options[question.correctOptionIndex])
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

      document.querySelector("#difficult-learn-button").click();
      await pause();
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
      localStorage.setItem("ppsc-prep:active-session:v1", JSON.stringify({
        version: 5,
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
      const optionTexts = [...document.querySelectorAll("#options-container .option-text")].map((element) => element.textContent);
      const snapshot = JSON.parse(localStorage.getItem("ppsc-prep:active-session:v1") || "null");
      if (!snapshot || snapshot.version !== 5 || snapshot.sessionKind !== "category" || snapshot.paperCategoryIds !== null || snapshot.partIndex !== null || snapshot.importantOnly !== false) errors.push("Difficult Learn was not stored with the v5 category-session resume schema.");
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
      if (!snapshot || snapshot.version !== 5 || snapshot.sessionKind !== "category" || snapshot.paperCategoryIds !== null || snapshot.mode !== "learn" || snapshot.scope !== "all" || snapshot.partIndex !== null) errors.push("Learn guard resume setup did not use the v5 category-session schema.");
      if (!snapshot || snapshot.currentIndex !== total - 1 || visitedIds.length !== 2 || !visitedIds.includes(snapshot.questionIds[0]) || !visitedIds.includes(snapshot.questionIds[total - 1])) errors.push("Learn guard resume setup did not persist the first and directly visited last IDs.");
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
      if (!restoredSnapshot || restoredSnapshot.version !== 5 || restoredSnapshot.sessionKind !== "category" || restoredSnapshot.paperCategoryIds !== null || JSON.stringify(restoredSnapshot.learnVisitedQuestionIds) !== JSON.stringify(expected.visitedIds)) errors.push("Learn Continue changed the persisted visited-ID snapshot.");
      if (document.querySelector("#action-button").textContent !== "Next Unvisited" || document.querySelector("#action-button").dataset.action !== "next-unvisited") errors.push("Restored Learn guard did not offer Next Unvisited.");
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

    const paperSetupResult = await client.evaluate(`(async () => {
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
      const selectedCategoryIds = ["general-knowledge", "pakistan-studies"];
      const questionById = new Map(data.questions.map((question) => [String(question.id), question]));
      const optionText = (option) => String(option && typeof option === "object" ? option.text : option);
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const currentCanonicalQuestion = () => questionById.get(
        String(document.querySelector("#question-text").dataset.questionId)
      );
      const currentCorrectRenderedIndex = () => {
        const question = currentCanonicalQuestion();
        return question
          ? renderedOptionTexts().indexOf(optionText(question.options[question.correctOptionIndex]))
          : -1;
      };
      const answerCurrent = async (correct) => {
        const correctIndex = currentCorrectRenderedIndex();
        if (correctIndex < 0) {
          errors.push("Custom Paper could not map the current correct answer.");
          return;
        }
        const selectedIndex = correct ? correctIndex : (correctIndex + 1) % 4;
        const button = document.querySelector('[data-option-index="' + selectedIndex + '"]');
        if (!button) {
          errors.push("Custom Paper answer option was missing.");
          return;
        }
        button.click();
        document.querySelector("#action-button").click();
        await pause();
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
      if (document.querySelector("#quiz-screen").dataset.sessionKind !== "paper") errors.push("Custom Paper question screen did not expose paper session kind.");
      if (document.querySelector("#quiz-screen").dataset.mode !== "quiz" || document.querySelector("#quiz-screen").dataset.scope !== "all") errors.push("Custom Paper did not reuse scored Quiz/all scope.");
      if (!document.querySelector("#quiz-category").textContent.includes("Custom Paper") || !document.querySelector("#quiz-category").textContent.includes("100 MCQs")) errors.push("Custom Paper header did not describe the paper.");
      if (!document.querySelector("#question-kind").textContent.includes("CUSTOM PAPER")) errors.push("Custom Paper question did not show its paper/category label.");
      if (document.documentElement.scrollWidth > window.innerWidth) errors.push("Custom Paper question screen has horizontal overflow on mobile.");

      const initialSnapshot = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!initialSnapshot || initialSnapshot.version !== 5 || initialSnapshot.sessionKind !== "paper") errors.push("Custom Paper was not stored with the v5 paper-session schema.");
      if (!initialSnapshot || initialSnapshot.categoryId !== null || initialSnapshot.mode !== "quiz" || initialSnapshot.scope !== "all" || initialSnapshot.partIndex !== null || initialSnapshot.importantOnly !== false) errors.push("Custom Paper stored invalid category/mode/scope fields.");
      if (!initialSnapshot || JSON.stringify(initialSnapshot.paperCategoryIds) !== JSON.stringify(selectedCategoryIds)) errors.push("Custom Paper did not store the selected category IDs in data order.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.questionIds) || initialSnapshot.questionIds.length !== 100 || new Set(initialSnapshot.questionIds).size !== 100) errors.push("Custom Paper did not contain exactly 100 unique question IDs.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.optionOrders) || initialSnapshot.optionOrders.length !== 100) errors.push("Custom Paper did not store 100 option orders.");
      if (!initialSnapshot || !Array.isArray(initialSnapshot.answerHistory) || initialSnapshot.answerHistory.length !== 100 || initialSnapshot.learnVisitedQuestionIds !== null) errors.push("Custom Paper did not store a 100-entry Quiz answer history.");
      const sampledQuestions = initialSnapshot
        ? initialSnapshot.questionIds.map((questionId) => questionById.get(String(questionId))).filter(Boolean)
        : [];
      if (sampledQuestions.length !== 100) errors.push("A Custom Paper question ID was absent from the bank.");
      if (sampledQuestions.some((question) => !selectedCategoryIds.includes(question.categoryId))) errors.push("Custom Paper included a question outside the selected categories.");
      const sampledCategoryCounts = Object.fromEntries(selectedCategoryIds.map((categoryId) => [
        categoryId,
        sampledQuestions.filter((question) => question.categoryId === categoryId).length
      ]));
      if (selectedCategoryIds.some((categoryId) => sampledCategoryCounts[categoryId] < 1)) errors.push("A selected category was omitted from the Custom Paper.");
      if (Math.max(...Object.values(sampledCategoryCounts)) - Math.min(...Object.values(sampledCategoryCounts)) > 1) errors.push("Custom Paper category allocation was not balanced within one question.");
      if (document.querySelector("#question-total").textContent.trim() !== "100" || document.querySelector("#question-number-input").max !== "100") errors.push("Custom Paper progress did not use exactly 100 questions.");
      if (document.querySelector("#score-text").textContent !== "C:0 W:0 Marks:0") errors.push("Custom Paper live score did not start at zero.");

      for (let index = 0; index < 4; index += 1) {
        await answerCurrent(false);
        const expectedMark = String(-0.25 * (index + 1));
        if (document.querySelector("#feedback-title").textContent !== "Incorrect") errors.push("Custom Paper did not show instant Incorrect feedback.");
        if (!document.querySelector("#feedback-text").textContent.includes("The correct answer is")) errors.push("Custom Paper did not reveal the correct answer after a wrong response.");
        if (document.querySelector("#score-text").textContent !== "C:0 W:" + (index + 1) + " Marks:" + expectedMark) errors.push("Custom Paper live wrong count/negative mark was incorrect after answer " + (index + 1) + ".");
        if (index < 3) {
          document.querySelector("#action-button").click();
          await pause();
        }
      }
      if (document.querySelector("#score-text").textContent !== "C:0 W:4 Marks:-1") errors.push("Four Custom Paper wrong answers did not deduct exactly one mark.");

      document.querySelector("#action-button").click();
      await pause();
      await answerCurrent(true);
      if (document.querySelector("#feedback-title").textContent !== "Correct!") errors.push("Custom Paper did not show instant Correct feedback.");
      if (document.querySelector("#score-text").textContent !== "C:1 W:4 Marks:0") errors.push("Custom Paper live correct/wrong/net score was incorrect after the first correct answer.");
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
      if (!resumeSnapshot || resumeSnapshot.currentIndex !== 5 || resumeSnapshot.submitted || resumeSnapshot.selectedIndex !== pendingCorrectIndex || resumeSnapshot.score !== 1) errors.push("Custom Paper pending Continue checkpoint was incorrect.");
      if (!resumeSnapshot || resumeSnapshot.answerHistory.filter((entry) => entry && entry[1]).length !== 5) errors.push("Custom Paper checkpoint did not preserve four wrong and one correct submitted response.");

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
          score: 1
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
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
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
      const renderedOptionTexts = () => [...document.querySelectorAll("#options-container .option-text")]
        .map((element) => element.textContent);
      const currentCanonicalQuestion = () => questionById.get(
        String(document.querySelector("#question-text").dataset.questionId)
      );
      const currentCorrectRenderedIndex = () => {
        const question = currentCanonicalQuestion();
        return question
          ? renderedOptionTexts().indexOf(optionText(question.options[question.correctOptionIndex]))
          : -1;
      };
      const selectAndCheckCorrect = async () => {
        const correctIndex = currentCorrectRenderedIndex();
        const button = document.querySelector('[data-option-index="' + correctIndex + '"]');
        if (correctIndex < 0 || !button) {
          errors.push("Custom Paper Continue could not map a correct answer.");
          return false;
        }
        button.click();
        document.querySelector("#action-button").click();
        await pause();
        if (document.querySelector("#feedback-title").textContent !== "Correct!") errors.push("Custom Paper completion lost instant Correct feedback.");
        return true;
      };

      if (!visible(document.querySelector("#category-screen"))) errors.push("Custom Paper reload did not return to categories before Continue.");
      if (!visible(document.querySelector("#continue-session-card"))) errors.push("Custom Paper reload did not show Continue.");
      if (document.querySelector("#continue-session-title").textContent !== "Continue Custom Paper") errors.push("Custom Paper Continue title was incorrect.");
      const continueMeta = document.querySelector("#continue-session-meta").textContent;
      if (!continueMeta.includes("Custom Paper") || !continueMeta.includes("2 categories") || !continueMeta.includes("Question 6 of 100")) errors.push("Custom Paper Continue metadata was incomplete.");
      const storedBeforeContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!storedBeforeContinue || storedBeforeContinue.version !== 5 || storedBeforeContinue.sessionKind !== "paper" || storedBeforeContinue.categoryId !== null) errors.push("Reload changed the Custom Paper session schema.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.paperCategoryIds) !== JSON.stringify(expected.selectedCategoryIds)) errors.push("Reload changed the selected Custom Paper categories.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.questionIds) !== JSON.stringify(expected.questionIds)) errors.push("Reload changed the Custom Paper question IDs/order.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.optionOrders) !== JSON.stringify(expected.optionOrders)) errors.push("Reload changed the Custom Paper option orders.");
      if (!storedBeforeContinue || JSON.stringify(storedBeforeContinue.answerHistory) !== JSON.stringify(expected.answerHistory)) errors.push("Reload changed the Custom Paper response history.");
      if (!storedBeforeContinue || storedBeforeContinue.currentIndex !== expected.currentIndex || storedBeforeContinue.score !== expected.score) errors.push("Reload changed the Custom Paper current position or score.");

      document.querySelector("#continue-session-button").click();
      await pause();
      if (!visible(document.querySelector("#quiz-screen")) || document.querySelector("#quiz-screen").dataset.sessionKind !== "paper") errors.push("Continue did not reopen the Custom Paper question screen.");
      if (!document.querySelector("#quiz-category").textContent.includes("Custom Paper") || document.querySelector("#question-total").textContent.trim() !== "100") errors.push("Restored Custom Paper header/progress was incorrect.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.currentQuestionId) errors.push("Continue restored the wrong Custom Paper question.");
      if (JSON.stringify(renderedOptionTexts()) !== JSON.stringify(expected.currentOptionTexts)) errors.push("Continue changed the current Custom Paper option order.");
      const restoredPendingButton = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!restoredPendingButton || !restoredPendingButton.classList.contains("is-selected") || restoredPendingButton.disabled) errors.push("Continue did not restore the pending Custom Paper selection.");
      if (visible(document.querySelector("#feedback")) || document.querySelector("#action-button").textContent !== "Check Answer") errors.push("Continue incorrectly submitted the pending Custom Paper answer.");
      if (document.querySelector("#score-text").textContent !== "C:1 W:4 Marks:0") errors.push("Continue did not restore the Custom Paper live correct/wrong/marks score.");
      const storedAfterContinue = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!storedAfterContinue || JSON.stringify(storedAfterContinue.questionIds) !== JSON.stringify(expected.questionIds) || JSON.stringify(storedAfterContinue.optionOrders) !== JSON.stringify(expected.optionOrders) || JSON.stringify(storedAfterContinue.answerHistory) !== JSON.stringify(expected.answerHistory)) errors.push("Continue changed Custom Paper IDs, options, or responses.");

      const numberInput = document.querySelector("#question-number-input");
      numberInput.value = "100";
      numberInput.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
      if (visible(document.querySelector("#results-screen"))) errors.push("Custom Paper opened results after jumping to an unanswered last question.");
      await selectAndCheckCorrect();
      if (document.querySelector("#score-text").textContent !== "C:2 W:4 Marks:1") errors.push("Custom Paper score was incorrect after answering the last question.");
      if (document.querySelector("#action-button").textContent !== "Next Unanswered" || document.querySelector("#action-button").dataset.action !== "next-unanswered") errors.push("Custom Paper last question did not offer Next Unanswered.");
      document.querySelector("#action-button").click();
      await pause();
      if (visible(document.querySelector("#results-screen"))) errors.push("Custom Paper opened results while an earlier answer remained pending.");
      if (document.querySelector("#question-text").dataset.questionId !== expected.currentQuestionId) errors.push("Next Unanswered did not restore the first pending Custom Paper question.");
      const pendingAfterGuard = document.querySelector('[data-option-index="' + expected.selectedIndex + '"]');
      if (!pendingAfterGuard || !pendingAfterGuard.classList.contains("is-selected") || pendingAfterGuard.disabled) errors.push("Next Unanswered lost the pending Custom Paper selection.");
      document.querySelector("#action-button").click();
      await pause();
      if (document.querySelector("#feedback-title").textContent !== "Correct!" || document.querySelector("#score-text").textContent !== "C:3 W:4 Marks:2") errors.push("Submitting the restored pending answer produced the wrong Custom Paper score.");
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

      const correctControl = document.querySelector("#result-correct-button");
      correctControl.click();
      await pause();
      const correctItems = [...document.querySelectorAll("#result-review-list .result-review-item.is-correct")];
      if (!visible(document.querySelector("#result-review-panel")) || correctControl.getAttribute("aria-expanded") !== "true") errors.push("Correct result control did not open its review list.");
      if (correctItems.length !== 96 || document.querySelectorAll("#result-review-list > li").length !== 96) errors.push("Correct review list did not contain exactly 96 answers.");
      if (correctItems.some((item) => !item.textContent.includes("Question ") || !item.textContent.includes("Category:") || !item.textContent.includes("Your answer:") || !item.textContent.includes("Correct answer:"))) errors.push("A correct review row was missing question/category/answer content.");
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
      if (wrongItems.some((item) => !item.textContent.includes("Question ") || !item.textContent.includes("Category:") || !item.textContent.includes("Your answer:") || !item.textContent.includes("Correct answer:"))) errors.push("A wrong review row was missing question/category/answer content.");
      if (wrongItems.some((item) => {
        const answers = item.querySelectorAll(".result-review-answer");
        return answers.length !== 2 || answers[0].textContent.replace(/^Your answer:\s*/, "") === answers[1].textContent.replace(/^Correct answer:\s*/, "");
      })) errors.push("A wrong review row did not distinguish the selected and correct answers.");
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

    const { resumeExpected, ...normalSummary } = normalResult;
    const result = {
      ...normalSummary,
      errors: normalResult.errors
        .concat(resumeResult.errors)
        .concat(pendingResumeResult.errors)
        .concat(corruptRecoveryResult.errors)
        .concat(difficultResult.errors)
        .concat(difficultResumeSetup.errors)
        .concat(difficultResumeResult.errors)
        .concat(learnResumeSetup.errors)
        .concat(learnResumeResult.errors)
        .concat(paperSetupResult.errors)
        .concat(paperResumeResult.errors),
      resume: {
        submittedStateRestored: resumeResult.errors.length === 0,
        pendingSelectionRestored: pendingResumeResult.errors.length === 0,
        difficultLearnRestored: difficultResumeSetup.errors.length === 0 && difficultResumeResult.errors.length === 0,
        learnVisitedIdsRestored: learnResumeSetup.errors.length === 0 && learnResumeResult.errors.length === 0,
        corruptDataRecovered: corruptRecoveryResult.errors.length === 0,
        staleDataRecovered: !difficultResult.errors.some((message) => message.includes("Legacy Part resume data"))
          && !difficultResumeSetup.errors.some((message) => message.includes("Stale-bank resume data"))
      },
      difficult: difficultResult,
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
