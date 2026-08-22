(function () {
  "use strict";

  var OPTION_LABELS = ["A", "B", "C", "D"];
  var data = window.PPSC_QUIZ_DATA || {};
  var categories = Array.isArray(data.categories) ? data.categories : [];
  var allQuestions = Array.isArray(data.questions) ? data.questions : [];

  var state = {
    category: null,
    questions: [],
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
    elements.quizScreen = firstElement(["#quiz-screen", "[data-screen='quiz']"]);
    elements.resultScreen = firstElement(["#result-screen", "#results-screen", "[data-screen='results']"]);
    elements.categoryGrid = firstElement(["#category-grid", "[data-category-grid]"]);
    elements.quizCategory = firstElement(["#quiz-category", "[data-quiz-category]"]);
    elements.questionKind = firstElement(["#question-kind", "[data-question-kind]"]);
    elements.questionText = firstElement(["#question-text", "[data-question-text]"]);
    elements.optionsList = firstElement(["#options-list", "#options-container", "[data-options-list]"]);
    elements.actionButton = firstElement(["#action-button", "#next-button", "[data-quiz-action]"]);
    elements.feedback = firstElement(["#feedback", "[data-feedback]"]);
    elements.feedbackTitle = firstElement(["#feedback-title", "[data-feedback-title]"]);
    elements.feedbackText = firstElement(["#feedback-text", "[data-feedback-text]"]);
    elements.detailsToggle = firstElement(["#details-toggle", "[data-details-toggle]"]);
    elements.detailsPanel = firstElement(["#details-panel", "[data-details-panel]"]);
    elements.explanationText = firstElement(["#explanation-text", "[data-explanation]"]);
    elements.optionRationales = firstElement(["#option-rationales", "[data-option-rationales]"]);
    elements.sourceNotes = firstElement(["#source-notes", "[data-source-notes]"]);
    elements.detailsSource = firstElement(["#details-source", "[data-details-source]"]);
    elements.sourceLabel = firstElement(["#source-label", "[data-source-label]"]);
    elements.sourceLink = firstElement(["#source-link", "[data-source-link]"]);
    elements.questionCounter = firstElement(["#question-counter", "[data-question-counter]"]);
    elements.progressText = firstElement(["#progress-text", "[data-progress-text]"]);
    elements.progressBar = firstElement(["#progress-bar", "#progress-fill", "[data-progress-bar]"]);
    elements.scoreText = firstElement(["#score-text", "[data-score-text]"]);
    elements.resultScore = firstElement(["#result-score", "[data-result-score]"]);
    elements.resultSummary = firstElement(["#result-summary", "#result-message", "[data-result-summary]"]);
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

  function showScreen(screenName) {
    setHidden(elements.categoryScreen, screenName !== "categories");
    setHidden(elements.quizScreen, screenName !== "quiz");
    setHidden(elements.resultScreen, screenName !== "results");

    var activeScreen = screenName === "quiz"
      ? elements.quizScreen
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

  function startQuiz(categoryId) {
    var category = findCategory(categoryId);
    var filteredQuestions = allQuestions.filter(function (question) {
      return question.categoryId === categoryId;
    });

    if (!category || filteredQuestions.length === 0) return;

    state.category = category;
    state.questions = filteredQuestions.slice();
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    if (elements.quizCategory) elements.quizCategory.textContent = category.name;
    showScreen("quiz");
    renderQuestion();
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
    if (elements.questionText) elements.questionText.textContent = question.question;
    renderOptions(question);
    updateProgress();
    resetFeedback();

    if (elements.actionButton) {
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

  function ensureDetailsToggle() {
    if (elements.detailsToggle || !elements.detailsPanel) return;
    var button = document.createElement("button");
    button.type = "button";
    button.id = "details-toggle";
    button.className = "details-toggle";
    button.dataset.detailsToggle = "";
    elements.detailsPanel.parentNode.insertBefore(button, elements.detailsPanel);
    elements.detailsToggle = button;
    elements.detailsToggle.addEventListener("click", toggleDetails);
  }

  function ensureDetailsContent() {
    if (!elements.detailsPanel) return;
    if (!elements.explanationText) {
      elements.explanationText = document.createElement("p");
      elements.explanationText.id = "explanation-text";
      elements.explanationText.className = "urdu-explanation";
      elements.detailsPanel.appendChild(elements.explanationText);
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

    elements.explanationText.textContent = question.explanationUrdu || "تفصیلی وضاحت جلد شامل کی جائے گی۔";
    elements.explanationText.lang = "ur";
    elements.explanationText.dir = "rtl";

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

    setHidden(elements.detailsToggle, false);
    elements.detailsToggle.textContent = "View details (Urdu)";
    elements.detailsToggle.setAttribute("aria-expanded", "false");
    if (elements.detailsPanel.id) {
      elements.detailsToggle.setAttribute("aria-controls", elements.detailsPanel.id);
    }
    setHidden(elements.detailsPanel, true);
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
      elements.scoreText.textContent = "Score: " + state.score;
    }
  }

  function showResults() {
    var total = state.questions.length;
    var percent = total > 0 ? Math.round((state.score / total) * 100) : 0;
    showScreen("results");

    var scoreOutput = elements.resultScore || elements.scoreText;
    if (scoreOutput) {
      scoreOutput.textContent = state.score + " / " + total;
    }
    if (elements.resultSummary) {
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
    startQuiz(state.category.id);
  }

  function returnToCategories() {
    state.category = null;
    state.questions = [];
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;
    showScreen("categories");
  }

  function onCategoryClick(event) {
    var card = event.target.closest("[data-category], [data-category-id]");
    if (!card || !elements.categoryGrid.contains(card) || card.disabled) return;
    startQuiz(card.dataset.category || card.dataset.categoryId);
  }

  function onOptionClick(event) {
    var button = event.target.closest("[data-option-index]");
    if (!button || !elements.optionsList.contains(button)) return;
    selectOption(Number(button.dataset.optionIndex));
  }

  function bindEvents() {
    if (elements.categoryGrid) elements.categoryGrid.addEventListener("click", onCategoryClick);
    if (elements.optionsList) elements.optionsList.addEventListener("click", onOptionClick);
    if (elements.actionButton) elements.actionButton.addEventListener("click", handleAction);
    if (elements.detailsToggle) elements.detailsToggle.addEventListener("click", toggleDetails);
    if (elements.backButton) elements.backButton.addEventListener("click", returnToCategories);
    if (elements.restartButton) elements.restartButton.addEventListener("click", restartQuiz);
    if (elements.playAgainButton) elements.playAgainButton.addEventListener("click", restartQuiz);
    if (elements.changeCategoryButton) elements.changeCategoryButton.addEventListener("click", returnToCategories);
  }

  function init() {
    collectElements();
    renderCategories();
    ensureDetailsToggle();
    bindEvents();
    resetFeedback();
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
