(function () {
  "use strict";

  var OPTION_LABELS = ["A", "B", "C", "D"];
  var DIFFICULT_STORAGE_KEY = "ppsc-prep:difficult-question-ids:v1";
  var data = window.PPSC_QUIZ_DATA || {};
  var categories = Array.isArray(data.categories) ? data.categories : [];
  var allQuestions = Array.isArray(data.questions) ? data.questions : [];
  var knownQuestionIds = new Set(allQuestions.map(function (question) {
    return String(question.id);
  }));
  var difficultQuestionIds = new Set();
  var previousQuestionOrders = Object.create(null);
  var previousOptionOrders = Object.create(null);

  var state = {
    category: null,
    questions: [],
    mode: null,
    scope: "all",
    currentIndex: 0,
    selectedIndex: null,
    submitted: false,
    score: 0
  };

  var elements = {};

  function firstElement(selectors, root) {
    var searchRoot = root || document;
    for (var i = 0; i < selectors.length; i += 1) {
      var match = searchRoot.querySelector(selectors[i]);
      if (match) return match;
    }
    return null;
  }

  function collectElements() {
    elements.categoryScreen = firstElement(["#category-screen", "[data-screen='categories']"]);
    elements.modeScreen = firstElement(["#mode-screen", "[data-screen='mode']"]);
    elements.quizScreen = firstElement(["#quiz-screen", "[data-screen='quiz']"]);
    elements.resultScreen = firstElement(["#result-screen", "#results-screen", "[data-screen='results']"]);
    elements.categoryGrid = firstElement(["#category-grid", "[data-category-grid]"]);
    elements.modeCategory = firstElement(["#mode-category", "[data-mode-category]"]);
    elements.learnModeButton = firstElement(["#learn-mode-button", "[data-start-learn]"]);
    elements.quizModeButton = firstElement(["#quiz-mode-button", "[data-start-quiz]"]);
    elements.standardModeOptions = firstElement(["#standard-mode-options", "[data-standard-mode-options]", ".mode-options"]);
    elements.difficultModeButton = firstElement(["#difficult-mode-button", "[data-open-difficult]", "[data-difficult-mode]"]);
    elements.difficultModeOptions = firstElement(["#difficult-mode-options", "[data-difficult-mode-options]"]);
    elements.difficultLearnButton = firstElement(["#difficult-learn-button", "[data-start-difficult-learn]"]);
    elements.difficultQuizButton = firstElement(["#difficult-quiz-button", "[data-start-difficult-quiz]"]);
    elements.difficultBackButton = firstElement(["#difficult-back-button", "[data-difficult-back]"]);
    elements.difficultCount = firstElement(["#difficult-count", "[data-difficult-count]"]);
    elements.difficultEmpty = firstElement(["#difficult-empty", "[data-difficult-empty]"]);
    elements.modeBackButton = firstElement(["#mode-back-button", "[data-mode-back]"]);
    elements.quizCategory = firstElement(["#quiz-category", "[data-quiz-category]"]);
    elements.questionKind = firstElement(["#question-kind", "[data-question-kind]"]);
    elements.questionText = firstElement(["#question-text", "[data-question-text]"]);
    elements.questionUrduBlock = firstElement(["#question-urdu-block", "[data-question-urdu-block]"]);
    elements.questionTextUrdu = firstElement(["#question-text-urdu", "[data-question-text-urdu]"]);
    elements.optionsList = firstElement(["#options-list", "#options-container", "[data-options-list]"]);
    elements.actionButton = firstElement(["#action-button", "#next-button", "[data-quiz-action]"]);
    elements.feedback = firstElement(["#feedback", "[data-feedback]"]);
    elements.feedbackTitle = firstElement(["#feedback-title", "[data-feedback-title]"]);
    elements.feedbackText = firstElement(["#feedback-text", "[data-feedback-text]"]);
    elements.detailsToggle = firstElement(["#details-toggle", "[data-details-toggle]"]);
    elements.detailsPanel = firstElement(["#details-panel", "[data-details-panel]"]);
    elements.explanationText = firstElement(["#explanation-text", "[data-explanation]"]);
    elements.relatedHistory = firstElement(["#related-history", "[data-related-history]"]);
    elements.relatedHistoryText = firstElement(["#related-history-text", "[data-related-history-text]"]);
    elements.relatedHistorySourceLink = firstElement(["#related-history-source-link", "[data-related-history-source-link]"]);
    elements.optionRationales = firstElement(["#option-rationales", "[data-option-rationales]"]);
    elements.sourceNotes = firstElement(["#source-notes", "[data-source-notes]"]);
    elements.detailsSource = firstElement(["#details-source", "[data-details-source]"]);
    elements.sourceLabel = firstElement(["#source-label", "[data-source-label]"]);
    elements.sourceLink = firstElement(["#source-link", "[data-source-link]"]);
    elements.difficultControl = firstElement(["#difficult-control", "[data-difficult-control]"]);
    elements.difficultCheckbox = firstElement(["#difficult-checkbox", "[data-difficult-checkbox]"]);
    elements.difficultStatus = firstElement(["#difficult-mark-status", "#difficult-status", "[data-difficult-status]"]);
    elements.questionCounter = firstElement(["#question-counter", "[data-question-counter]"]);
    elements.progressText = firstElement(["#progress-text", "[data-progress-text]"]);
    elements.progressBar = firstElement(["#progress-bar", "#progress-fill", "[data-progress-bar]"]);
    elements.scoreText = firstElement(["#score-text", "[data-score-text]"]);
    elements.resultScore = firstElement(["#result-score", "[data-result-score]"]);
    elements.resultSummary = firstElement(["#result-summary", "#result-message", "[data-result-summary]"]);
    elements.resultTitle = firstElement(["#results-title", "[data-result-title]"]);
    elements.backButton = firstElement(["#back-button", "[data-back-to-categories]"]);
    elements.restartButton = firstElement(["#restart-button", "[data-restart-quiz]"]);
    elements.playAgainButton = firstElement(["#play-again-button", "[data-play-again]"]);
    elements.changeCategoryButton = firstElement(["#change-category-button", "[data-change-category]"]);
  }

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = hidden;
    element.setAttribute("aria-hidden", hidden ? "true" : "false");
    element.classList.toggle("is-active", !hidden);
  }

  function loadDifficultQuestionIds() {
    try {
      var rawValue = window.localStorage.getItem(DIFFICULT_STORAGE_KEY);
      if (!rawValue) return new Set();

      var savedValue = JSON.parse(rawValue);
      var savedIds = Array.isArray(savedValue)
        ? savedValue
        : savedValue && Array.isArray(savedValue.questionIds)
          ? savedValue.questionIds
          : savedValue && Array.isArray(savedValue.ids)
            ? savedValue.ids
            : [];

      return new Set(savedIds.map(String).filter(function (questionId) {
        return knownQuestionIds.has(questionId);
      }));
    } catch (error) {
      // Browsers can block storage, and a user may have stale/corrupt data.
      // Difficult marking still works in memory for the current page visit.
      return new Set();
    }
  }

  function saveDifficultQuestionIds() {
    try {
      window.localStorage.setItem(DIFFICULT_STORAGE_KEY, JSON.stringify({
        version: 1,
        questionIds: Array.from(difficultQuestionIds)
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  function difficultQuestionCount(categoryId) {
    return allQuestions.filter(function (question) {
      return question.categoryId === categoryId && difficultQuestionIds.has(String(question.id));
    }).length;
  }

  function createModeOption(id, titleText, descriptionText) {
    var button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.className = "mode-option mode-option-difficult";

    var icon = document.createElement("span");
    icon.className = "mode-option-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = titleText.slice(0, 1);

    var copy = document.createElement("span");
    copy.className = "mode-option-copy";
    var title = document.createElement("strong");
    title.textContent = titleText;
    var description = document.createElement("small");
    description.textContent = descriptionText;
    copy.appendChild(title);
    copy.appendChild(description);

    var arrow = document.createElement("span");
    arrow.className = "mode-option-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "\u2192";

    button.appendChild(icon);
    button.appendChild(copy);
    button.appendChild(arrow);
    return button;
  }

  function ensureDifficultModeUI() {
    if (!elements.modeScreen) return;

    if (!elements.standardModeOptions) {
      elements.standardModeOptions = firstElement([".mode-options"], elements.modeScreen);
    }

    if (!elements.difficultModeButton && elements.standardModeOptions) {
      elements.difficultModeButton = createModeOption(
        "difficult-mode-button",
        "Difficult",
        "Practise only the questions you have marked as difficult."
      );
      elements.difficultModeButton.dataset.openDifficult = "";
      elements.standardModeOptions.appendChild(elements.difficultModeButton);
    }

    if (!elements.difficultModeOptions) {
      var difficultOptions = document.createElement("div");
      difficultOptions.id = "difficult-mode-options";
      difficultOptions.className = "difficult-mode-options";
      difficultOptions.dataset.difficultModeOptions = "";
      difficultOptions.hidden = true;

      var heading = document.createElement("h2");
      heading.textContent = "Difficult questions";
      var summary = document.createElement("p");
      summary.className = "difficult-mode-summary";
      elements.difficultCount = document.createElement("span");
      elements.difficultCount.id = "difficult-count";
      elements.difficultCount.dataset.difficultCount = "";
      summary.appendChild(elements.difficultCount);
      summary.appendChild(document.createTextNode(" marked in this category"));

      elements.difficultEmpty = document.createElement("p");
      elements.difficultEmpty.id = "difficult-empty";
      elements.difficultEmpty.className = "difficult-empty";
      elements.difficultEmpty.dataset.difficultEmpty = "";
      elements.difficultEmpty.setAttribute("role", "status");
      elements.difficultEmpty.textContent = "No difficult questions marked yet. Start Learn or Quiz and mark questions below their details.";

      elements.difficultLearnButton = createModeOption(
        "difficult-learn-button",
        "Learn",
        "Study only your marked difficult questions."
      );
      elements.difficultLearnButton.dataset.startDifficultLearn = "";
      elements.difficultQuizButton = createModeOption(
        "difficult-quiz-button",
        "Quiz",
        "Test yourself using only your marked difficult questions."
      );
      elements.difficultQuizButton.dataset.startDifficultQuiz = "";
      elements.difficultBackButton = document.createElement("button");
      elements.difficultBackButton.id = "difficult-back-button";
      elements.difficultBackButton.className = "text-button difficult-back-button";
      elements.difficultBackButton.type = "button";
      elements.difficultBackButton.dataset.difficultBack = "";
      elements.difficultBackButton.textContent = "\u2190 All modes";

      difficultOptions.appendChild(heading);
      difficultOptions.appendChild(summary);
      difficultOptions.appendChild(elements.difficultEmpty);
      difficultOptions.appendChild(elements.difficultLearnButton);
      difficultOptions.appendChild(elements.difficultQuizButton);
      difficultOptions.appendChild(elements.difficultBackButton);

      var modeCard = firstElement([".mode-card"], elements.modeScreen) || elements.modeScreen;
      modeCard.appendChild(difficultOptions);
      elements.difficultModeOptions = difficultOptions;
    }

    if (elements.difficultModeButton && elements.difficultModeOptions.id) {
      elements.difficultModeButton.setAttribute("aria-controls", elements.difficultModeOptions.id);
      elements.difficultModeButton.setAttribute("aria-expanded", "false");
    }
  }

  function ensureDifficultControl() {
    if (!elements.detailsPanel) return;

    if (!elements.difficultControl) {
      var control = document.createElement("div");
      control.id = "difficult-control";
      control.className = "difficult-control";
      control.dataset.difficultControl = "";

      var label = document.createElement("label");
      label.className = "difficult-checkbox-label";
      elements.difficultCheckbox = document.createElement("input");
      elements.difficultCheckbox.id = "difficult-checkbox";
      elements.difficultCheckbox.type = "checkbox";
      elements.difficultCheckbox.dataset.difficultCheckbox = "";
      var labelText = document.createElement("span");
      labelText.textContent = "Mark as difficult";
      label.appendChild(elements.difficultCheckbox);
      label.appendChild(labelText);

      elements.difficultStatus = document.createElement("span");
      elements.difficultStatus.id = "difficult-mark-status";
      elements.difficultStatus.className = "difficult-mark-status";
      elements.difficultStatus.dataset.difficultStatus = "";
      elements.difficultStatus.setAttribute("aria-live", "polite");

      control.appendChild(label);
      control.appendChild(elements.difficultStatus);
      elements.detailsPanel.appendChild(control);
      elements.difficultControl = control;
    }

    if (!elements.difficultCheckbox && elements.difficultControl) {
      elements.difficultCheckbox = firstElement(["input[type='checkbox']"], elements.difficultControl);
    }
  }

  function showScreen(screenName) {
    setHidden(elements.categoryScreen, screenName !== "categories");
    setHidden(elements.modeScreen, screenName !== "mode");
    setHidden(elements.quizScreen, screenName !== "quiz");
    setHidden(elements.resultScreen, screenName !== "results");

    var activeScreen = screenName === "quiz"
      ? elements.quizScreen
      : screenName === "mode"
        ? elements.modeScreen
      : screenName === "results"
        ? elements.resultScreen
        : elements.categoryScreen;

    if (activeScreen) {
      var heading = activeScreen.querySelector("h1, h2, [tabindex='-1']");
      if (heading && typeof heading.focus === "function") {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }

  function questionCount(categoryId) {
    return allQuestions.filter(function (question) {
      return question.categoryId === categoryId;
    }).length;
  }

  function updateDifficultModeUI() {
    var categoryId = state.category ? state.category.id : "";
    var count = categoryId ? difficultQuestionCount(categoryId) : 0;
    var hasQuestions = count > 0;

    if (elements.difficultCount) {
      elements.difficultCount.textContent = String(count);
      elements.difficultCount.dataset.count = String(count);
    }
    if (elements.difficultLearnButton) elements.difficultLearnButton.disabled = !hasQuestions;
    if (elements.difficultQuizButton) elements.difficultQuizButton.disabled = !hasQuestions;
    if (elements.difficultEmpty) setHidden(elements.difficultEmpty, hasQuestions);
    if (elements.difficultModeButton) {
      elements.difficultModeButton.dataset.difficultCount = String(count);
      elements.difficultModeButton.setAttribute(
        "aria-label",
        "Difficult questions, " + count + " marked in " + (state.category ? state.category.name : "this category")
      );
    }
  }

  function setDifficultModeChoiceOpen(open) {
    setHidden(elements.standardModeOptions, open);
    setHidden(elements.difficultModeOptions, !open);
    if (elements.difficultModeButton) {
      elements.difficultModeButton.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (open) updateDifficultModeUI();
  }

  function openDifficultModeChoice() {
    if (!state.category) return;
    setDifficultModeChoiceOpen(true);

    var count = difficultQuestionCount(state.category.id);
    var focusTarget = count > 0 ? elements.difficultLearnButton : elements.difficultEmpty;
    if (focusTarget && typeof focusTarget.focus === "function") {
      if (focusTarget === elements.difficultEmpty) focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
    }
  }

  function closeDifficultModeChoice() {
    setDifficultModeChoiceOpen(false);
    if (elements.difficultModeButton && typeof elements.difficultModeButton.focus === "function") {
      elements.difficultModeButton.focus({ preventScroll: true });
    }
  }

  function syncDifficultCheckbox(question) {
    if (!elements.difficultCheckbox) return;
    var questionId = question && question.id ? String(question.id) : "";
    elements.difficultCheckbox.checked = Boolean(questionId && difficultQuestionIds.has(questionId));
    elements.difficultCheckbox.disabled = !questionId;
    elements.difficultCheckbox.dataset.questionId = questionId;
    if (elements.difficultStatus) elements.difficultStatus.textContent = "";
  }

  function handleDifficultCheckboxChange() {
    var question = currentQuestion();
    if (!question || !elements.difficultCheckbox) return;

    var questionId = String(question.id);
    var isMarked = elements.difficultCheckbox.checked;
    if (isMarked) {
      difficultQuestionIds.add(questionId);
    } else {
      difficultQuestionIds.delete(questionId);
    }

    var persisted = saveDifficultQuestionIds();
    if (elements.difficultStatus) {
      elements.difficultStatus.textContent = isMarked
        ? (persisted ? "Marked as difficult." : "Marked for this visit only.")
        : (persisted ? "Removed from difficult questions." : "Removed for this visit only.");
    }
    updateDifficultModeUI();
  }

  function renderCategories() {
    if (!elements.categoryGrid) return;
    elements.categoryGrid.textContent = "";

    categories.forEach(function (category) {
      var count = questionCount(category.id);
      var card = document.createElement("button");
      card.type = "button";
      card.className = "category-card" + (count === 0 ? " is-empty" : "");
      card.dataset.category = category.id;
      card.dataset.categoryId = category.id;
      card.disabled = count === 0;
      card.setAttribute("aria-label", category.name + ", " + count + (count === 1 ? " question" : " questions"));

      var badge = document.createElement("span");
      badge.className = "category-card__icon category-icon";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = category.shortLabel || category.name.slice(0, 2).toUpperCase();

      var content = document.createElement("span");
      content.className = "category-card__content category-content";

      var title = document.createElement("strong");
      title.className = "category-card__title category-name";
      title.textContent = category.name;

      var description = document.createElement("span");
      description.className = "category-card__description category-description";
      description.textContent = category.description || "PPSC practice questions";

      var meta = document.createElement("span");
      meta.className = "category-card__count question-count";
      meta.textContent = count > 0
        ? count + (count === 1 ? " question" : " questions")
        : "Coming soon";

      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(meta);
      card.appendChild(badge);
      card.appendChild(content);
      elements.categoryGrid.appendChild(card);
    });
  }

  function findCategory(categoryId) {
    return categories.find(function (category) {
      return category.id === categoryId;
    }) || null;
  }

  function chooseMode(categoryId) {
    var category = findCategory(categoryId);
    var count = questionCount(categoryId);
    if (!category || count === 0) return;

    state.category = category;
    state.questions = [];
    state.mode = null;
    state.scope = "all";
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    if (elements.modeCategory) elements.modeCategory.textContent = category.name;
    setDifficultModeChoiceOpen(false);
    updateDifficultModeUI();

    // Keep the site usable if an older cached page does not yet contain the
    // mode chooser, while the current page always takes the explicit choice.
    if (!elements.modeScreen) {
      startQuiz(categoryId, "quiz", "all");
      return;
    }

    showScreen("mode");
  }

  function orderKey(items, itemKey) {
    return items.map(function (item) {
      return String(itemKey(item));
    }).join("|");
  }

  function fisherYates(items) {
    var result = items.slice();
    for (var index = result.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var temporary = result[index];
      result[index] = result[randomIndex];
      result[randomIndex] = temporary;
    }
    return result;
  }

  function shuffledOrder(items, itemKey, previousOrderKey) {
    var source = items.slice();
    if (source.length < 2) return source;

    var originalOrderKey = orderKey(source, itemKey);
    var canReuseOriginalOrder = source.length === 2 && Boolean(previousOrderKey);
    var candidate = source;
    var attempt;

    for (attempt = 0; attempt < 12; attempt += 1) {
      candidate = fisherYates(source);
      var candidateKey = orderKey(candidate, itemKey);
      if (
        candidateKey !== previousOrderKey &&
        (candidateKey !== originalOrderKey || canReuseOriginalOrder)
      ) {
        return candidate;
      }
    }

    if (canReuseOriginalOrder && originalOrderKey !== previousOrderKey) {
      return source;
    }

    for (var offset = 1; offset < source.length; offset += 1) {
      candidate = source.slice(offset).concat(source.slice(0, offset));
      var rotatedKey = orderKey(candidate, itemKey);
      if (
        rotatedKey !== previousOrderKey &&
        (rotatedKey !== originalOrderKey || canReuseOriginalOrder)
      ) {
        return candidate;
      }
    }

    return source.slice().reverse();
  }

  function shuffledQuizQuestion(question) {
    var optionEntries = question.options.map(function (option, originalIndex) {
      return { option: option, originalIndex: originalIndex };
    });
    var shuffledEntries = shuffledOrder(
      optionEntries,
      function (entry) { return entry.originalIndex; },
      previousOptionOrders[question.id]
    );
    previousOptionOrders[question.id] = orderKey(shuffledEntries, function (entry) {
      return entry.originalIndex;
    });

    var shuffledOptions = shuffledEntries.map(function (entry, index) {
      if (!entry.option || typeof entry.option !== "object") return entry.option;
      return Object.assign({}, entry.option, { label: OPTION_LABELS[index] });
    });
    var shuffledCorrectIndex = shuffledEntries.findIndex(function (entry) {
      return entry.originalIndex === question.correctOptionIndex;
    });

    return Object.assign({}, question, {
      options: shuffledOptions,
      correctOptionIndex: shuffledCorrectIndex
    });
  }

  function startQuiz(categoryId, mode, scope) {
    var category = findCategory(categoryId);
    var selectedScope = scope === "difficult" ? "difficult" : "all";
    var filteredQuestions = allQuestions.filter(function (question) {
      return question.categoryId === categoryId && (
        selectedScope !== "difficult" || difficultQuestionIds.has(String(question.id))
      );
    });

    if (!category) return false;
    if (filteredQuestions.length === 0) {
      if (selectedScope === "difficult") {
        state.category = category;
        state.questions = [];
        state.mode = null;
        state.scope = "difficult";
        state.currentIndex = 0;
        state.selectedIndex = null;
        state.submitted = false;
        state.score = 0;
        if (elements.modeScreen) {
          showScreen("mode");
          setDifficultModeChoiceOpen(true);
        }
        updateDifficultModeUI();
        if (elements.difficultEmpty) {
          setHidden(elements.difficultEmpty, false);
          elements.difficultEmpty.setAttribute("tabindex", "-1");
          if (typeof elements.difficultEmpty.focus === "function") {
            elements.difficultEmpty.focus({ preventScroll: true });
          }
        }
      }
      return false;
    }

    var selectedMode = mode === "learn" ? "learn" : "quiz";
    var sessionOrderKey = categoryId + "::" + selectedScope;
    var sessionQuestions = shuffledOrder(
      filteredQuestions,
      function (question) { return question.id; },
      previousQuestionOrders[sessionOrderKey]
    );
    previousQuestionOrders[sessionOrderKey] = orderKey(sessionQuestions, function (question) {
      return question.id;
    });
    if (selectedMode === "quiz") {
      sessionQuestions = sessionQuestions.map(shuffledQuizQuestion);
    }

    state.category = category;
    state.questions = sessionQuestions;
    state.mode = selectedMode;
    state.scope = selectedScope;
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    if (elements.quizCategory) {
      elements.quizCategory.textContent = category.name
        + (state.scope === "difficult" ? " · Difficult" : "")
        + (state.mode === "learn" ? " · Learn" : "");
    }
    if (elements.quizScreen) {
      elements.quizScreen.dataset.mode = state.mode;
      elements.quizScreen.dataset.scope = state.scope;
    }
    showScreen("quiz");
    renderQuestion();
    return true;
  }

  function currentQuestion() {
    return state.questions[state.currentIndex] || null;
  }

  function normalizeOption(option, index) {
    if (typeof option === "string") {
      return { label: OPTION_LABELS[index], text: option, rationaleUrdu: "" };
    }
    return {
      label: option.label || OPTION_LABELS[index],
      text: option.text || "",
      rationaleUrdu: option.rationaleUrdu || ""
    };
  }

  function renderQuestion() {
    var question = currentQuestion();
    if (!question) {
      showResults();
      return;
    }

    state.selectedIndex = null;
    state.submitted = false;

    if (elements.questionKind) {
      elements.questionKind.textContent = question.kind === "similar" ? "SIMILAR PRACTICE" : "SOURCE PAPER";
    }
    if (elements.questionText) {
      elements.questionText.textContent = question.question;
      elements.questionText.dataset.questionId = question.id;
    }
    var questionUrdu = String(question.questionUrdu || "").trim();
    if (elements.questionTextUrdu) elements.questionTextUrdu.textContent = questionUrdu;
    if (elements.questionUrduBlock) setHidden(elements.questionUrduBlock, !questionUrdu);
    if (elements.optionsList) {
      elements.optionsList.setAttribute(
        "aria-labelledby",
        questionUrdu ? "question-text question-text-urdu" : "question-text"
      );
    }
    renderOptions(question);
    updateProgress();
    resetFeedback();
    syncDifficultCheckbox(question);

    if (state.mode === "learn") {
      prepareLearnQuestion(question);
    } else if (elements.actionButton) {
      setHidden(elements.actionButton, false);
      elements.actionButton.textContent = "Check Answer";
      elements.actionButton.disabled = false;
      elements.actionButton.dataset.action = "check";
    }

    if (elements.questionText && typeof elements.questionText.focus === "function") {
      elements.questionText.setAttribute("tabindex", "-1");
      elements.questionText.focus({ preventScroll: true });
    }
  }

  function renderOptions(question) {
    if (!elements.optionsList) return;
    elements.optionsList.textContent = "";
    elements.optionsList.setAttribute("role", "radiogroup");
    elements.optionsList.setAttribute("aria-label", "Answer options");

    question.options.forEach(function (rawOption, index) {
      var option = normalizeOption(rawOption, index);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.optionIndex = String(index);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");

      var label = document.createElement("span");
      label.className = "option-label";
      label.textContent = option.label;

      var text = document.createElement("span");
      text.className = "option-text";
      text.textContent = option.text;

      button.appendChild(label);
      button.appendChild(text);
      elements.optionsList.appendChild(button);
    });
  }

  function prepareLearnQuestion(question) {
    state.selectedIndex = question.correctOptionIndex;

    if (elements.optionsList) {
      var buttons = elements.optionsList.querySelectorAll(".option-button, [data-option-index]");
      buttons.forEach(function (button) {
        var isCorrect = Number(button.dataset.optionIndex) === question.correctOptionIndex;
        button.disabled = true;
        button.classList.toggle("is-selected", isCorrect);
        button.classList.toggle("is-correct", isCorrect);
        button.setAttribute("aria-checked", isCorrect ? "true" : "false");
      });
    }

    state.submitted = true;
    showLearnFeedback();
    buildDetails(question);
    openDetails();

    if (elements.actionButton) {
      var isLast = state.currentIndex === state.questions.length - 1;
      setHidden(elements.actionButton, false);
      elements.actionButton.textContent = isLast ? "Finish Learning" : "Next Question";
      elements.actionButton.disabled = false;
      elements.actionButton.dataset.action = isLast ? "results" : "next";
    }
  }

  function selectOption(index) {
    var question = currentQuestion();
    if (!question || state.submitted || index < 0 || index >= question.options.length) return;

    state.selectedIndex = index;
    var buttons = elements.optionsList
      ? elements.optionsList.querySelectorAll(".option-button, [data-option-index]")
      : [];

    buttons.forEach(function (button) {
      var isSelected = Number(button.dataset.optionIndex) === index;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", isSelected ? "true" : "false");
    });

    clearSelectionPrompt();
  }

  function clearSelectionPrompt() {
    if (!elements.feedback || state.submitted) return;
    elements.feedback.classList.remove("is-warning");
    setHidden(elements.feedback, true);
  }

  function handleAction() {
    if (!currentQuestion()) return;
    if (!state.submitted) {
      submitAnswer();
      return;
    }

    if (state.currentIndex >= state.questions.length - 1) {
      showResults();
    } else {
      state.currentIndex += 1;
      renderQuestion();
    }
  }

  function submitAnswer() {
    var question = currentQuestion();
    if (!question) return;

    if (state.selectedIndex === null) {
      showSelectionPrompt();
      return;
    }

    state.submitted = true;
    var isCorrect = state.selectedIndex === question.correctOptionIndex;
    if (isCorrect) state.score += 1;

    markSubmittedOptions(question);
    showFeedback(question, isCorrect);
    buildDetails(question);
    updateProgress();

    if (elements.actionButton) {
      var isLast = state.currentIndex === state.questions.length - 1;
      elements.actionButton.textContent = isLast ? "View Results" : "Next Question";
      elements.actionButton.dataset.action = isLast ? "results" : "next";
      elements.actionButton.focus({ preventScroll: true });
    }
  }

  function showSelectionPrompt() {
    if (!elements.feedback) return;
    ensureFeedbackChildren();
    elements.feedback.classList.remove("is-correct", "is-incorrect");
    elements.feedback.classList.add("feedback", "is-warning");
    setHidden(elements.feedback, false);
    elements.feedbackTitle.textContent = "Select an option";
    elements.feedbackText.textContent = "Please choose one answer before checking.";
  }

  function markSubmittedOptions(question) {
    if (!elements.optionsList) return;
    var buttons = elements.optionsList.querySelectorAll(".option-button, [data-option-index]");

    buttons.forEach(function (button) {
      var index = Number(button.dataset.optionIndex);
      button.disabled = true;
      button.classList.remove("is-correct", "is-incorrect");

      if (index === question.correctOptionIndex) button.classList.add("is-correct");
      if (index === state.selectedIndex && index !== question.correctOptionIndex) {
        button.classList.add("is-incorrect");
      }
    });
  }

  function ensureFeedbackChildren() {
    if (!elements.feedback) return;
    if (!elements.feedbackTitle) {
      elements.feedbackTitle = document.createElement("strong");
      elements.feedbackTitle.id = "feedback-title";
      elements.feedback.appendChild(elements.feedbackTitle);
    }
    if (!elements.feedbackText) {
      elements.feedbackText = document.createElement("p");
      elements.feedbackText.id = "feedback-text";
      elements.feedback.appendChild(elements.feedbackText);
    }
  }

  function showFeedback(question, isCorrect) {
    if (!elements.feedback) return;
    ensureFeedbackChildren();

    var correctOption = normalizeOption(question.options[question.correctOptionIndex], question.correctOptionIndex);
    elements.feedback.classList.remove("is-warning", "is-correct", "is-incorrect");
    elements.feedback.classList.add("feedback", isCorrect ? "is-correct" : "is-incorrect");
    elements.feedback.setAttribute("role", "status");
    elements.feedback.setAttribute("aria-live", "polite");
    setHidden(elements.feedback, false);

    elements.feedbackTitle.textContent = isCorrect ? "Correct!" : "Incorrect";
    elements.feedbackText.textContent = isCorrect
      ? "Well done — you selected the right answer."
      : "The correct answer is " + correctOption.label + ". " + correctOption.text + ".";
  }

  function showLearnFeedback() {
    if (!elements.feedback) return;
    ensureFeedbackChildren();

    elements.feedback.classList.remove("is-warning", "is-incorrect");
    elements.feedback.classList.add("feedback", "is-correct");
    elements.feedback.setAttribute("role", "status");
    elements.feedback.setAttribute("aria-live", "polite");
    setHidden(elements.feedback, false);
    elements.feedbackTitle.textContent = "Correct answer";
    elements.feedbackText.textContent = "Read the explanation and related history, then continue when you are ready.";
  }

  function ensureDetailsToggle() {
    if (elements.detailsToggle || !elements.detailsPanel) return;
    var button = document.createElement("button");
    button.type = "button";
    button.id = "details-toggle";
    button.className = "details-toggle";
    button.dataset.detailsToggle = "";
    elements.detailsPanel.parentNode.insertBefore(button, elements.detailsPanel);
    elements.detailsToggle = button;
  }

  function ensureDetailsContent() {
    if (!elements.detailsPanel) return;
    if (!elements.explanationText) {
      elements.explanationText = document.createElement("p");
      elements.explanationText.id = "explanation-text";
      elements.explanationText.className = "urdu-explanation";
      elements.detailsPanel.appendChild(elements.explanationText);
    }
    if (elements.relatedHistory && !elements.relatedHistorySourceLink) {
      elements.relatedHistorySourceLink = document.createElement("a");
      elements.relatedHistorySourceLink.id = "related-history-source-link";
      elements.relatedHistorySourceLink.className = "related-history-source-link";
      elements.relatedHistorySourceLink.target = "_blank";
      elements.relatedHistorySourceLink.rel = "noopener noreferrer";
      elements.relatedHistorySourceLink.textContent = "Open background source";
      elements.relatedHistory.appendChild(elements.relatedHistorySourceLink);
    }
    if (!elements.optionRationales) {
      elements.optionRationales = document.createElement("ul");
      elements.optionRationales.id = "option-rationales";
      elements.optionRationales.className = "option-rationales";
      elements.detailsPanel.appendChild(elements.optionRationales);
    }
    if (!elements.sourceNotes) {
      elements.sourceNotes = document.createElement("p");
      elements.sourceNotes.id = "source-notes";
      elements.sourceNotes.className = "source-notes";
      elements.detailsPanel.appendChild(elements.sourceNotes);
    }
    if (!elements.detailsSource) {
      elements.detailsSource = document.createElement("div");
      elements.detailsSource.id = "details-source";
      elements.detailsSource.className = "details-source";
      elements.sourceLabel = document.createElement("span");
      elements.sourceLabel.id = "source-label";
      elements.sourceLink = document.createElement("a");
      elements.sourceLink.id = "source-link";
      elements.sourceLink.target = "_blank";
      elements.sourceLink.rel = "noopener noreferrer";
      elements.sourceLink.textContent = "Open research source";
      elements.detailsSource.appendChild(elements.sourceLabel);
      elements.detailsSource.appendChild(elements.sourceLink);
      elements.detailsPanel.appendChild(elements.detailsSource);
    }
  }

  function buildDetails(question) {
    if (!elements.detailsPanel) return;
    ensureDetailsToggle();
    ensureDetailsContent();
    ensureDifficultControl();

    elements.explanationText.textContent = question.explanationUrdu || "تفصیلی وضاحت جلد شامل کی جائے گی۔";
    elements.explanationText.lang = "ur";
    elements.explanationText.dir = "rtl";

    var relatedHistory = String(question.relatedHistoryUrdu || "").trim();
    if (elements.relatedHistoryText) {
      elements.relatedHistoryText.textContent = relatedHistory;
      elements.relatedHistoryText.lang = "ur";
      elements.relatedHistoryText.dir = "rtl";
    }
    if (elements.relatedHistory) {
      setHidden(elements.relatedHistory, state.mode !== "learn" || !relatedHistory);
    }
    var relatedHistorySource = String(question.relatedHistorySource || "").trim();
    var hasRelatedHistorySource = /^https?:\/\//i.test(relatedHistorySource);
    if (elements.relatedHistorySourceLink) {
      if (hasRelatedHistorySource) {
        elements.relatedHistorySourceLink.href = relatedHistorySource;
      } else {
        elements.relatedHistorySourceLink.removeAttribute("href");
      }
      setHidden(
        elements.relatedHistorySourceLink,
        state.mode !== "learn" || !relatedHistory || !hasRelatedHistorySource
      );
    }

    elements.optionRationales.textContent = "";
    var optionsWithRationales = question.options
      .map(function (rawOption, index) {
        return normalizeOption(rawOption, index);
      })
      .filter(function (option) {
        return Boolean(option.rationaleUrdu && option.rationaleUrdu.trim());
      });

    optionsWithRationales.forEach(function (option) {
      var item = document.createElement("li");
      item.lang = "ur";
      item.dir = "rtl";

      var prefix = document.createElement("strong");
      prefix.textContent = option.label + ". " + option.text + ": ";
      item.appendChild(prefix);
      item.appendChild(document.createTextNode(option.rationaleUrdu));
      elements.optionRationales.appendChild(item);
    });
    setHidden(elements.optionRationales, optionsWithRationales.length === 0);

    var sourceNotes = String(question.sourceNotes || "").trim();
    if (
      state.mode === "quiz" &&
      /(?:option|choice|answer|key)\s*[:=\-]?\s*[“”"']?[A-D]\b/i.test(sourceNotes)
    ) {
      sourceNotes += " Quiz options are shuffled; option letters in this source note refer to the original paper order.";
    }
    if (elements.sourceNotes) {
      elements.sourceNotes.textContent = sourceNotes ? "Source note: " + sourceNotes : "";
      setHidden(elements.sourceNotes, !sourceNotes);
    }

    var source = question.source || {};
    var hasSource = /^https?:\/\//.test(source.referenceUrl || "");
    if (elements.detailsSource) setHidden(elements.detailsSource, !hasSource);
    if (elements.sourceLabel) {
      elements.sourceLabel.textContent = source.label || "Answer research";
    }
    if (elements.sourceLink && hasSource) {
      elements.sourceLink.href = source.referenceUrl;
    }

    syncDifficultCheckbox(question);
    setHidden(elements.difficultControl, false);

    setHidden(elements.detailsToggle, false);
    elements.detailsToggle.textContent = "View details (Urdu)";
    elements.detailsToggle.setAttribute("aria-expanded", "false");
    if (elements.detailsPanel.id) {
      elements.detailsToggle.setAttribute("aria-controls", elements.detailsPanel.id);
    }
    setHidden(elements.detailsPanel, true);
  }

  function openDetails() {
    if (!elements.detailsPanel) return;
    setHidden(elements.detailsPanel, false);
    if (elements.detailsToggle) {
      setHidden(elements.detailsToggle, false);
      elements.detailsToggle.textContent = "Hide details";
      elements.detailsToggle.setAttribute("aria-expanded", "true");
    }
  }

  function toggleDetails() {
    if (!elements.detailsPanel || !state.submitted) return;
    var willOpen = elements.detailsPanel.hidden;
    setHidden(elements.detailsPanel, !willOpen);
    if (elements.detailsToggle) {
      elements.detailsToggle.textContent = willOpen ? "Hide details" : "View details (Urdu)";
      elements.detailsToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    }
  }

  function resetFeedback() {
    if (elements.feedback) {
      elements.feedback.classList.remove("is-warning", "is-correct", "is-incorrect");
      elements.feedback.classList.add("feedback");
      setHidden(elements.feedback, true);
    }
    if (elements.feedbackTitle) elements.feedbackTitle.textContent = "";
    if (elements.feedbackText) elements.feedbackText.textContent = "";
    if (elements.detailsToggle) {
      elements.detailsToggle.textContent = "View details (Urdu)";
      elements.detailsToggle.setAttribute("aria-expanded", "false");
      setHidden(elements.detailsToggle, true);
    }
    if (elements.detailsPanel) setHidden(elements.detailsPanel, true);
    if (elements.difficultControl) setHidden(elements.difficultControl, true);
    if (elements.relatedHistory) setHidden(elements.relatedHistory, true);
    if (elements.sourceNotes) setHidden(elements.sourceNotes, true);
  }

  function updateProgress() {
    var total = state.questions.length;
    var number = Math.min(state.currentIndex + 1, total);
    var percent = total > 0 ? Math.round((number / total) * 100) : 0;

    if (elements.questionCounter) {
      elements.questionCounter.textContent = "Question " + number + " of " + total;
    }
    if (elements.progressText) {
      elements.progressText.textContent = number + " / " + total;
    }
    if (elements.progressBar) {
      elements.progressBar.style.width = percent + "%";
      elements.progressBar.setAttribute("aria-valuemin", "0");
      elements.progressBar.setAttribute("aria-valuemax", "100");
      elements.progressBar.setAttribute("aria-valuenow", String(percent));
    }
    if (elements.scoreText) {
      elements.scoreText.textContent = state.mode === "learn" ? "Learn Mode" : "Score: " + state.score;
    }
  }

  function showResults() {
    var total = state.questions.length;
    var percent = total > 0 ? Math.round((state.score / total) * 100) : 0;
    var remainingInScope = state.category && state.scope === "difficult"
      ? difficultQuestionCount(state.category.id)
      : total;
    var canRepeatScope = state.scope !== "difficult" || remainingInScope > 0;
    showScreen("results");

    var scoreOutput = elements.resultScore || elements.scoreText;
    if (scoreOutput && state.mode === "learn") {
      scoreOutput.textContent = String(total);
    } else if (scoreOutput) {
      scoreOutput.textContent = state.score + " / " + total;
    }

    var scoreCaption = elements.resultScore && elements.resultScore.parentElement
      ? elements.resultScore.parentElement.querySelector("span")
      : null;
    if (scoreCaption) scoreCaption.textContent = state.mode === "learn" ? "Learned" : "Correct";
    if (elements.resultScore && elements.resultScore.parentElement) {
      elements.resultScore.parentElement.setAttribute(
        "aria-label",
        state.mode === "learn" ? "Questions learned" : "Final score"
      );
    }
    if (elements.playAgainButton) {
      elements.playAgainButton.textContent = canRepeatScope
        ? (state.mode === "learn" ? "Start Quiz" : "Practice Again")
        : "No Marked Questions";
      elements.playAgainButton.disabled = !canRepeatScope;
    }

    if (elements.resultTitle) {
      elements.resultTitle.textContent = state.mode === "learn"
        ? (state.scope === "difficult" ? "Difficult learning complete!" : "Learning complete!")
        : (state.scope === "difficult" ? "Difficult practice complete!" : "Practice complete!");
    }
    if (elements.resultSummary && !canRepeatScope) {
      elements.resultSummary.textContent = "You removed all difficult marks in this category. Mark a question again before starting another difficult session.";
    } else if (elements.resultSummary && state.mode === "learn" && state.scope === "difficult") {
      elements.resultSummary.textContent = "You studied " + total + " questions from this difficult session. The quiz will use "
        + remainingInScope + (remainingInScope === 1 ? " question" : " questions") + " still marked difficult.";
    } else if (elements.resultSummary && state.mode === "learn") {
      elements.resultSummary.textContent = "You studied all " + total + " questions in this category. Now test yourself with the quiz.";
    } else if (elements.resultSummary) {
      elements.resultSummary.textContent = resultMessage(percent);
    }
  }

  function resultMessage(percent) {
    if (percent === 100) return "Excellent — a perfect score!";
    if (percent >= 70) return "Great work. Review the details once and keep practising.";
    if (percent >= 50) return "Good attempt. A quick review will make these facts stick.";
    return "Keep going. Review the explanations and try this category again.";
  }

  function restartQuiz() {
    if (!state.category) {
      returnToCategories();
      return;
    }
    startQuiz(state.category.id, state.mode, state.scope);
  }

  function handlePlayAgain() {
    if (!state.category) {
      returnToCategories();
      return;
    }
    if (state.mode === "learn") {
      startQuiz(state.category.id, "quiz", state.scope);
      return;
    }
    restartQuiz();
  }

  function returnToCategories() {
    state.category = null;
    state.questions = [];
    state.mode = null;
    state.scope = "all";
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;
    showScreen("categories");
  }

  function onCategoryClick(event) {
    var card = event.target.closest("[data-category], [data-category-id]");
    if (!card || !elements.categoryGrid.contains(card) || card.disabled) return;
    chooseMode(card.dataset.category || card.dataset.categoryId);
  }

  function startSelectedMode(mode, scope) {
    if (!state.category) {
      returnToCategories();
      return;
    }
    startQuiz(state.category.id, mode, scope);
  }

  function onOptionClick(event) {
    var button = event.target.closest("[data-option-index]");
    if (!button || !elements.optionsList.contains(button)) return;
    selectOption(Number(button.dataset.optionIndex));
  }

  function bindEvents() {
    if (elements.categoryGrid) elements.categoryGrid.addEventListener("click", onCategoryClick);
    if (elements.learnModeButton) {
      elements.learnModeButton.addEventListener("click", function () {
        startSelectedMode("learn", "all");
      });
    }
    if (elements.quizModeButton) {
      elements.quizModeButton.addEventListener("click", function () {
        startSelectedMode("quiz", "all");
      });
    }
    if (elements.difficultModeButton) {
      elements.difficultModeButton.addEventListener("click", openDifficultModeChoice);
    }
    if (elements.difficultBackButton) {
      elements.difficultBackButton.addEventListener("click", closeDifficultModeChoice);
    }
    if (elements.difficultLearnButton) {
      elements.difficultLearnButton.addEventListener("click", function () {
        startSelectedMode("learn", "difficult");
      });
    }
    if (elements.difficultQuizButton) {
      elements.difficultQuizButton.addEventListener("click", function () {
        startSelectedMode("quiz", "difficult");
      });
    }
    if (elements.modeBackButton) elements.modeBackButton.addEventListener("click", returnToCategories);
    if (elements.optionsList) elements.optionsList.addEventListener("click", onOptionClick);
    if (elements.actionButton) elements.actionButton.addEventListener("click", handleAction);
    if (elements.detailsToggle) elements.detailsToggle.addEventListener("click", toggleDetails);
    if (elements.backButton) elements.backButton.addEventListener("click", returnToCategories);
    if (elements.restartButton) elements.restartButton.addEventListener("click", restartQuiz);
    if (elements.playAgainButton) elements.playAgainButton.addEventListener("click", handlePlayAgain);
    if (elements.changeCategoryButton) elements.changeCategoryButton.addEventListener("click", returnToCategories);
    if (elements.difficultCheckbox) {
      elements.difficultCheckbox.addEventListener("change", handleDifficultCheckboxChange);
    }
  }

  function init() {
    collectElements();
    ensureDifficultModeUI();
    ensureDifficultControl();
    difficultQuestionIds = loadDifficultQuestionIds();
    renderCategories();
    ensureDetailsToggle();
    bindEvents();
    resetFeedback();
    updateDifficultModeUI();
    showScreen("categories");

    if (categories.length === 0 || allQuestions.length === 0) {
      // This only appears if questions.js was not loaded before app.js.
      if (elements.categoryGrid) {
        elements.categoryGrid.textContent = "Question data could not be loaded.";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
