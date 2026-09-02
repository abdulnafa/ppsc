(function () {
  "use strict";

  var OPTION_LABELS = ["A", "B", "C", "D"];
  var URDU_OPTION_LABELS = ["الف", "ب", "ج", "د"];
  var CANONICAL_OPTION_ORDER = [0, 1, 2, 3];
  var POSITION_DEPENDENT_OPTION_PATTERN = /(?:\b(?:both|either|neither)\s+\(?\s*(?:(?:options?|choices?|answers?)\s*)?[A-D]\s*(?:and|or|&|\+)\s*(?:(?:options?|choices?|answers?)\s*)?[A-D]\s*\)?(?=\s|[.,;:)\]-]|$)|\bboth\s+of\s+(?:the\s+)?(?:above|below|these|them)\b|\b(?:all|none)\s+of\s+(?:the\s+)?(?:above|below)\b|\b(?:options?|choices?|answers?)\s*\(?[A-D]\)?(?=\s|[.,;:)\]-]|$))/i;
  var PAPER_QUESTION_COUNT = 100;
  var PAPER_WRONG_PENALTY = 0.25;
  var DIFFICULT_STORAGE_KEY = "ppsc-prep:difficult-question-ids:v1";
  var SESSION_STORAGE_KEY = "ppsc-prep:active-session:v1";
  var SESSION_STORAGE_VERSION = 6;
  var data = window.PPSC_QUIZ_DATA || {};
  var categories = Array.isArray(data.categories) ? data.categories : [];
  var allQuestions = Array.isArray(data.questions) ? data.questions : [];
  var knownQuestionIds = new Set(allQuestions.map(function (question) {
    return String(question.id);
  }));
  var questionsById = new Map(allQuestions.map(function (question) {
    return [String(question.id), question];
  }));
  var questionBankSignature = buildQuestionBankSignature();
  var difficultQuestionIds = new Set();
  var activeSessionSnapshot = null;
  var previousQuestionOrders = Object.create(null);
  var previousOptionOrders = Object.create(null);

  var state = {
    category: null,
    sessionKind: "category",
    paperCategoryIds: [],
    questions: [],
    mode: null,
    scope: "all",
    partIndex: null,
    importantOnly: false,
    responses: [],
    learnVisitedQuestionIds: new Set(),
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
    elements.paperSetupScreen = firstElement(["#paper-setup-screen", "[data-screen='paper-setup']"]);
    elements.modeScreen = firstElement(["#mode-screen", "[data-screen='mode']"]);
    elements.quizScreen = firstElement(["#quiz-screen", "[data-screen='quiz']"]);
    elements.resultScreen = firstElement(["#result-screen", "#results-screen", "[data-screen='results']"]);
    elements.categoryGrid = firstElement(["#category-grid", "[data-category-grid]"]);
    elements.paperBuilderCard = firstElement(["#paper-builder-card", "[data-paper-builder]"]);
    elements.paperSetupBackButton = firstElement(["#paper-setup-back-button", "[data-paper-setup-back]"]);
    elements.paperCategoryOptions = firstElement(["#paper-category-options", "[data-paper-category-options]"]);
    elements.paperSelectAllButton = firstElement(["#paper-select-all-button", "[data-paper-select-all]"]);
    elements.paperClearAllButton = firstElement(["#paper-clear-all-button", "[data-paper-clear-all]"]);
    elements.paperSelectionSummary = firstElement(["#paper-selection-summary", "[data-paper-selection-summary]"]);
    elements.paperStartButton = firstElement(["#paper-start-button", "[data-paper-start]"]);
    elements.paperSetupStatus = firstElement(["#paper-setup-status", "[data-paper-setup-status]"]);
    elements.continueSessionCard = firstElement(["#continue-session-card", "[data-continue-session-card]"]);
    elements.continueSessionButton = firstElement(["#continue-session-button", "[data-continue-session]"]);
    elements.continueSessionTitle = firstElement(["#continue-session-title", "[data-continue-session-title]"]);
    elements.continueSessionMeta = firstElement(["#continue-session-meta", "[data-continue-session-meta]"]);
    elements.modeCategory = firstElement(["#mode-category", "[data-mode-category]"]);
    elements.importantOnlyCheckbox = firstElement(["#important-only-checkbox", "[data-important-only]"]);
    elements.importantCount = firstElement(["#important-count", "[data-important-count]"]);
    elements.studyScopeSummary = firstElement(["#study-scope-summary", "[data-study-scope-summary]"]);
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
    elements.previousButton = firstElement(["#previous-button", "[data-previous-question]"]);
    elements.actionButton = firstElement(["#action-button", "#next-button", "[data-quiz-action]"]);
    elements.feedback = firstElement(["#feedback", "[data-feedback]"]);
    elements.feedbackTitle = firstElement(["#feedback-title", "[data-feedback-title]"]);
    elements.feedbackText = firstElement(["#feedback-text", "[data-feedback-text]"]);
    elements.difficultControl = firstElement(["#difficult-control", "[data-difficult-control]"]);
    elements.difficultCheckbox = firstElement(["#difficult-checkbox", "[data-difficult-checkbox]"]);
    elements.difficultStatus = firstElement(["#difficult-mark-status", "#difficult-status", "[data-difficult-status]"]);
    elements.questionCounter = firstElement(["#question-counter", "[data-question-counter]"]);
    elements.questionNumberInput = firstElement(["#question-number-input", "[data-question-number-input]"]);
    elements.questionTotal = firstElement(["#question-total", "[data-question-total]"]);
    elements.progressText = firstElement(["#progress-text", "[data-progress-text]"]);
    elements.progressBar = firstElement(["#progress-bar", "#progress-fill", "[data-progress-bar]"]);
    elements.scoreText = firstElement(["#score-text", "[data-score-text]"]);
    elements.resultScore = firstElement(["#result-score", "[data-result-score]"]);
    elements.resultSummary = firstElement(["#result-summary", "#result-message", "[data-result-summary]"]);
    elements.resultTitle = firstElement(["#results-title", "[data-result-title]"]);
    elements.resultBreakdown = firstElement(["#result-breakdown", "[data-result-breakdown]"]);
    elements.resultCorrectButton = firstElement(["#result-correct-button", "[data-result-correct]"]);
    elements.resultWrongButton = firstElement(["#result-wrong-button", "[data-result-wrong]"]);
    elements.resultCorrectCount = firstElement(["#result-correct-count", "[data-result-correct-count]"]);
    elements.resultWrongCount = firstElement(["#result-wrong-count", "[data-result-wrong-count]"]);
    elements.resultPaperScore = firstElement(["#result-paper-score", "[data-result-paper-score]"]);
    elements.resultPenalty = firstElement(["#result-penalty", "[data-result-penalty]"]);
    elements.resultReviewPanel = firstElement(["#result-review-panel", "[data-result-review-panel]"]);
    elements.resultReviewTitle = firstElement(["#result-review-title", "[data-result-review-title]"]);
    elements.resultReviewSummary = firstElement(["#result-review-summary", "[data-result-review-summary]"]);
    elements.resultReviewList = firstElement(["#result-review-list", "[data-result-review-list]"]);
    elements.resultReviewCloseButton = firstElement(["#result-review-close-button", "[data-result-review-close]"]);
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

  function hashText(hash, value) {
    var text = String(value);
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash;
  }

  function buildQuestionBankSignature() {
    var hash = 2166136261;
    allQuestions.forEach(function (question) {
      hash = hashText(hash, JSON.stringify([
        question.id,
        question.categoryId,
        question.question,
        question.questionUrdu,
        question.correctOptionIndex,
        question.options,
        question.optionsUrdu
      ]));
      hash = hashText(hash, "\n");
    });
    return "v1:" + allQuestions.length + ":" + (hash >>> 0).toString(16);
  }

  function isIndexPermutation(value) {
    return Array.isArray(value)
      && value.length === OPTION_LABELS.length
      && value.every(function (index) {
        return Number.isInteger(index) && index >= 0 && index < OPTION_LABELS.length;
      })
      && new Set(value).size === OPTION_LABELS.length;
  }

  function isCanonicalOptionOrder(value) {
    return isIndexPermutation(value) && value.every(function (originalIndex, index) {
      return originalIndex === CANONICAL_OPTION_ORDER[index];
    });
  }

  function hasPositionDependentOptionWording(question) {
    return Boolean(question) && Array.isArray(question.options) && question.options.some(function (option) {
      var text = option && typeof option === "object" ? option.text : option;
      return POSITION_DEPENDENT_OPTION_PATTERN.test(String(text || ""));
    });
  }

  function sessionModeLabel(mode, scope) {
    var modeName = mode === "learn" ? "Learn" : "Quiz";
    return scope === "difficult" ? "Difficult " + modeName : modeName;
  }

  function sessionSelectionLabel(partIndex, importantOnly) {
    return importantOnly ? "All Important Questions" : "All Questions";
  }

  function scoreForResponses(responses, questions) {
    return responses.reduce(function (score, response, index) {
      return score + (response && response.submitted
        && response.selectedIndex === questions[index].correctOptionIndex ? 1 : 0);
    }, 0);
  }

  function isPaperSession(value) {
    var session = value || state;
    return session.sessionKind === "paper";
  }

  function paperStats(responses, questions) {
    var correct = 0;
    var wrong = 0;
    (Array.isArray(responses) ? responses : []).forEach(function (response, index) {
      if (!response || !response.submitted || !questions[index]) return;
      if (response.selectedIndex === questions[index].correctOptionIndex) correct += 1;
      else wrong += 1;
    });
    return {
      correct: correct,
      wrong: wrong,
      answered: correct + wrong,
      net: correct - (wrong * PAPER_WRONG_PENALTY)
    };
  }

  function formatPaperMark(mark) {
    return Number(mark.toFixed(2)).toString();
  }

  function updateContinueSessionUI() {
    var snapshot = activeSessionSnapshot;
    var paperSession = snapshot && isPaperSession(snapshot);
    var category = snapshot && !paperSession ? findCategory(snapshot.categoryId) : null;
    if (!snapshot || (!paperSession && !category)) {
      setHidden(elements.continueSessionCard, true);
      return;
    }

    var currentNumber = Math.min(snapshot.currentIndex + 1, snapshot.questionIds.length);
    var modeLabel = paperSession ? "Custom Paper" : sessionModeLabel(snapshot.mode, snapshot.scope);
    var selectionLabel = paperSession
      ? snapshot.paperCategoryIds.length + (snapshot.paperCategoryIds.length === 1 ? " category" : " categories")
      : sessionSelectionLabel(snapshot.partIndex, snapshot.importantOnly);
    if (elements.continueSessionTitle) {
      elements.continueSessionTitle.textContent = paperSession ? "Continue Custom Paper" : "Continue " + category.name;
    }
    if (elements.continueSessionMeta) {
      elements.continueSessionMeta.textContent = modeLabel + " \u00b7 " + selectionLabel + " \u00b7 Question "
        + currentNumber + " of " + snapshot.questionIds.length;
    }
    if (elements.continueSessionButton) {
      elements.continueSessionButton.setAttribute(
        "aria-label",
        "Continue " + (paperSession ? "Custom Paper" : category.name) + " " + modeLabel + ", " + selectionLabel + ", question "
          + currentNumber + " of " + snapshot.questionIds.length
      );
    }
    setHidden(elements.continueSessionCard, false);
  }

  function removeStoredActiveSession() {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      // Storage can be unavailable. The in-memory state is still cleared.
    }
    activeSessionSnapshot = null;
    updateContinueSessionUI();
  }

  function normalizeStoredSession(savedValue) {
    if (!savedValue || typeof savedValue !== "object" || Array.isArray(savedValue)) return null;
    if (savedValue.version !== SESSION_STORAGE_VERSION) return null;
    if (savedValue.bankSignature !== questionBankSignature) return null;
    if (savedValue.sessionKind !== "category" && savedValue.sessionKind !== "paper") return null;
    if (savedValue.mode !== "learn" && savedValue.mode !== "quiz") return null;
    var paperSession = savedValue.sessionKind === "paper";
    if (paperSession && (savedValue.mode !== "quiz" || savedValue.scope !== "all")) return null;
    if (!paperSession && savedValue.scope !== "all" && savedValue.scope !== "difficult") return null;

    var category = paperSession ? null : findCategory(String(savedValue.categoryId || ""));
    if (paperSession && savedValue.categoryId !== null) return null;
    if (!paperSession && !category) return null;
    if (savedValue.partIndex !== null) return null;
    var partIndex = null;
    if (typeof savedValue.importantOnly !== "boolean") return null;
    var importantOnly = savedValue.importantOnly;
    if (paperSession && importantOnly) return null;

    var paperCategoryIds = null;
    if (paperSession) {
      if (!Array.isArray(savedValue.paperCategoryIds) || savedValue.paperCategoryIds.length === 0) return null;
      paperCategoryIds = savedValue.paperCategoryIds.map(String);
      if (new Set(paperCategoryIds).size !== paperCategoryIds.length) return null;
      if (paperCategoryIds.some(function (categoryId) {
        return !findCategory(categoryId) || questionCount(categoryId) === 0;
      })) return null;
      var availablePaperQuestionCount = paperCategoryIds.reduce(function (count, categoryId) {
        return count + questionCount(categoryId);
      }, 0);
      if (availablePaperQuestionCount < PAPER_QUESTION_COUNT) return null;
    } else if (savedValue.paperCategoryIds !== null) {
      return null;
    }

    if (!Array.isArray(savedValue.questionIds) || savedValue.questionIds.length === 0) return null;

    var questionIds = savedValue.questionIds.map(String);
    if (new Set(questionIds).size !== questionIds.length) return null;
    if (paperSession && questionIds.length !== PAPER_QUESTION_COUNT) return null;
    var canonicalQuestions = questionIds.map(function (questionId) {
      return questionsById.get(questionId) || null;
    });
    if (canonicalQuestions.some(function (question) { return !question; })) return null;

    var selectedQuestionIds = [];
    if (paperSession) {
      if (canonicalQuestions.some(function (question) {
        return !paperCategoryIds.includes(String(question.categoryId));
      })) return null;
      if (paperCategoryIds.some(function (categoryId) {
        return !canonicalQuestions.some(function (question) { return question.categoryId === categoryId; });
      })) return null;
    } else {
      if (canonicalQuestions.some(function (question) {
        return question.categoryId !== category.id;
      })) return null;
      selectedQuestionIds = questionsForSelection(category.id, partIndex, importantOnly).map(function (question) {
        return String(question.id);
      });
      if (savedValue.scope === "all") {
        var savedIdSet = new Set(questionIds);
        if (
          questionIds.length !== selectedQuestionIds.length
          || selectedQuestionIds.some(function (questionId) { return !savedIdSet.has(questionId); })
        ) return null;
      } else if (questionIds.some(function (questionId) { return !selectedQuestionIds.includes(questionId); })) {
        return null;
      }

      if (savedValue.mode === "learn") {
        var includedIds = new Set(questionIds);
        var expectedLearnOrder = selectedQuestionIds.filter(function (questionId) {
          return includedIds.has(questionId);
        });
        if (orderKey(questionIds, function (questionId) { return questionId; })
          !== orderKey(expectedLearnOrder, function (questionId) { return questionId; })) return null;
      }
    }

    var sessionQuestions = canonicalQuestions;
    var optionOrders = null;
    if (savedValue.mode === "quiz") {
      if (!Array.isArray(savedValue.optionOrders) || savedValue.optionOrders.length !== questionIds.length) return null;
      optionOrders = savedValue.optionOrders.map(function (optionOrder) {
        return Array.isArray(optionOrder) ? optionOrder.slice() : optionOrder;
      });
      if (optionOrders.some(function (optionOrder) { return !isIndexPermutation(optionOrder); })) return null;
      if (optionOrders.some(function (optionOrder, index) {
        return hasPositionDependentOptionWording(canonicalQuestions[index])
          && !isCanonicalOptionOrder(optionOrder);
      })) return null;
      sessionQuestions = canonicalQuestions.map(function (question, index) {
        return quizQuestionWithOrder(question, optionOrders[index]);
      });
    }

    var currentIndex = savedValue.currentIndex;
    var selectedIndex = savedValue.selectedIndex;
    var submitted = savedValue.submitted;
    var score = savedValue.score;
    if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= sessionQuestions.length) return null;
    if (selectedIndex !== null && (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= OPTION_LABELS.length)) return null;
    if (typeof submitted !== "boolean") return null;
    if (!Number.isInteger(score) || score < 0) return null;

    var responses = new Array(sessionQuestions.length).fill(null);
    var learnVisitedQuestionIds = new Set();
    if (savedValue.mode === "learn") {
      if (!Array.isArray(savedValue.learnVisitedQuestionIds)) return null;
      var visitedQuestionIds = savedValue.learnVisitedQuestionIds.map(String);
      if (new Set(visitedQuestionIds).size !== visitedQuestionIds.length) return null;
      if (visitedQuestionIds.some(function (questionId) { return !questionIds.includes(questionId); })) return null;
      if (!visitedQuestionIds.includes(questionIds[currentIndex])) return null;
      learnVisitedQuestionIds = new Set(visitedQuestionIds);
      if (!submitted || score !== 0 || selectedIndex !== sessionQuestions[currentIndex].correctOptionIndex) return null;
    } else {
      if (savedValue.learnVisitedQuestionIds !== null) return null;
      if (!Array.isArray(savedValue.answerHistory) || savedValue.answerHistory.length !== sessionQuestions.length) return null;
      responses = savedValue.answerHistory.map(function (entry) {
        if (entry === null) return null;
        if (!Array.isArray(entry) || entry.length !== 2) return false;
        if (!Number.isInteger(entry[0]) || entry[0] < 0 || entry[0] >= OPTION_LABELS.length) return false;
        if (typeof entry[1] !== "boolean") return false;
        return { selectedIndex: entry[0], submitted: entry[1] };
      });
      if (responses.some(function (response) { return response === false; })) return null;
      var currentResponse = responses[currentIndex];
      if (currentResponse) {
        if (selectedIndex !== currentResponse.selectedIndex || submitted !== currentResponse.submitted) return null;
      } else if (selectedIndex !== null || submitted) {
        return null;
      }
      if (score !== scoreForResponses(responses, sessionQuestions)) return null;
    }

    var snapshot = {
      version: SESSION_STORAGE_VERSION,
      bankSignature: questionBankSignature,
      sessionKind: savedValue.sessionKind,
      categoryId: paperSession ? null : category.id,
      paperCategoryIds: paperSession ? paperCategoryIds.slice() : null,
      mode: savedValue.mode,
      scope: savedValue.scope,
      partIndex: partIndex,
      importantOnly: importantOnly,
      questionIds: questionIds,
      optionOrders: optionOrders,
      answerHistory: savedValue.mode === "quiz" ? responses.map(function (response) {
        return response ? [response.selectedIndex, response.submitted] : null;
      }) : null,
      learnVisitedQuestionIds: savedValue.mode === "learn" ? Array.from(learnVisitedQuestionIds) : null,
      currentIndex: currentIndex,
      selectedIndex: selectedIndex,
      submitted: submitted,
      score: score,
      savedAt: Number.isFinite(savedValue.savedAt) ? savedValue.savedAt : 0
    };

    return {
      snapshot: snapshot,
      category: category,
      questions: sessionQuestions,
      responses: responses,
      learnVisitedQuestionIds: learnVisitedQuestionIds
    };
  }

  function loadActiveSession() {
    try {
      var rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!rawValue) {
        activeSessionSnapshot = null;
        return null;
      }
      var normalized = normalizeStoredSession(JSON.parse(rawValue));
      if (!normalized) {
        removeStoredActiveSession();
        return null;
      }
      activeSessionSnapshot = normalized.snapshot;
      return normalized;
    } catch (error) {
      removeStoredActiveSession();
      return null;
    }
  }

  function storeCurrentResponse() {
    if (state.mode !== "quiz" || !state.questions.length) return;
    if (!Array.isArray(state.responses) || state.responses.length !== state.questions.length) {
      state.responses = new Array(state.questions.length).fill(null);
    }
    state.responses[state.currentIndex] = state.selectedIndex === null
      ? null
      : { selectedIndex: state.selectedIndex, submitted: state.submitted };
    state.score = scoreForResponses(state.responses, state.questions);
  }

  function loadCurrentResponse() {
    if (state.mode !== "quiz") {
      state.selectedIndex = null;
      state.submitted = false;
      return;
    }
    var response = Array.isArray(state.responses) ? state.responses[state.currentIndex] : null;
    state.selectedIndex = response ? response.selectedIndex : null;
    state.submitted = response ? response.submitted : false;
  }

  function saveActiveSession() {
    if (!state.mode || state.questions.length === 0) return false;
    if (!isPaperSession() && !state.category) return false;
    if (isPaperSession() && (
      state.mode !== "quiz"
      || state.questions.length !== PAPER_QUESTION_COUNT
      || !Array.isArray(state.paperCategoryIds)
      || state.paperCategoryIds.length === 0
    )) return false;

    storeCurrentResponse();

    var optionOrders = null;
    if (state.mode === "quiz") {
      optionOrders = state.questions.map(function (question) {
        return Array.isArray(question._sessionOptionOrder)
          ? question._sessionOptionOrder.slice()
          : null;
      });
      if (optionOrders.some(function (optionOrder) { return !isIndexPermutation(optionOrder); })) {
        removeStoredActiveSession();
        return false;
      }
    }

    var snapshot = {
      version: SESSION_STORAGE_VERSION,
      bankSignature: questionBankSignature,
      sessionKind: state.sessionKind,
      categoryId: isPaperSession() ? null : state.category.id,
      paperCategoryIds: isPaperSession() ? state.paperCategoryIds.slice() : null,
      mode: state.mode,
      scope: state.scope,
      partIndex: null,
      importantOnly: state.importantOnly,
      questionIds: state.questions.map(function (question) { return String(question.id); }),
      optionOrders: optionOrders,
      answerHistory: state.mode === "quiz" ? state.responses.map(function (response) {
        return response ? [response.selectedIndex, response.submitted] : null;
      }) : null,
      learnVisitedQuestionIds: state.mode === "learn" ? state.questions.filter(function (question) {
        return state.learnVisitedQuestionIds.has(String(question.id));
      }).map(function (question) {
        return String(question.id);
      }) : null,
      currentIndex: state.currentIndex,
      selectedIndex: state.selectedIndex,
      submitted: state.submitted,
      score: state.score,
      savedAt: Date.now()
    };

    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
      activeSessionSnapshot = snapshot;
      updateContinueSessionUI();
      return true;
    } catch (error) {
      activeSessionSnapshot = null;
      updateContinueSessionUI();
      return false;
    }
  }

  function restoreActiveSession() {
    var normalized = loadActiveSession();
    if (!normalized) {
      showScreen("categories");
      updateContinueSessionUI();
      return false;
    }

    state.category = normalized.category;
    state.sessionKind = normalized.snapshot.sessionKind;
    state.paperCategoryIds = normalized.snapshot.paperCategoryIds
      ? normalized.snapshot.paperCategoryIds.slice()
      : [];
    state.questions = normalized.questions;
    state.mode = normalized.snapshot.mode;
    state.scope = normalized.snapshot.scope;
    state.partIndex = normalized.snapshot.partIndex;
    state.importantOnly = normalized.snapshot.importantOnly;
    state.responses = normalized.responses;
    state.learnVisitedQuestionIds = normalized.learnVisitedQuestionIds;
    state.currentIndex = normalized.snapshot.currentIndex;
    state.selectedIndex = normalized.snapshot.selectedIndex;
    state.submitted = normalized.snapshot.submitted;
    state.score = normalized.snapshot.score;

    setQuizSessionLabel();
    showScreen("quiz");
    renderQuestion();
    return true;
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

  function isImportantQuestion(question) {
    return Boolean(question && (question.isImportant === true || Number(question.repeatCount) >= 2));
  }

  function categoryQuestions(categoryId) {
    return allQuestions.filter(function (question) {
      return question.categoryId === categoryId;
    });
  }

  function baseQuestionsForSelection(categoryId, partIndex) {
    return categoryQuestions(categoryId);
  }

  function questionsForSelection(categoryId, partIndex, importantOnly) {
    return baseQuestionsForSelection(categoryId, partIndex).filter(function (question) {
      return !importantOnly || isImportantQuestion(question);
    });
  }

  function difficultQuestionCount(categoryId, partIndex, importantOnly) {
    var selectedPart = arguments.length >= 2 ? partIndex : state.partIndex;
    var selectedImportantOnly = arguments.length >= 3 ? importantOnly : state.importantOnly;
    return questionsForSelection(categoryId, selectedPart, selectedImportantOnly).filter(function (question) {
      return difficultQuestionIds.has(String(question.id));
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
      elements.difficultEmpty.textContent = "No difficult questions marked yet. Start Learn or Quiz and mark questions below each MCQ.";

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
    if (!elements.difficultControl) {
      var questionCard = firstElement([".question-card"], elements.quizScreen);
      if (!questionCard) return;

      var control = document.createElement("div");
      control.id = "difficult-control";
      control.className = "difficult-control";
      control.dataset.difficultControl = "";

      elements.difficultCheckbox = document.createElement("input");
      elements.difficultCheckbox.id = "difficult-checkbox";
      elements.difficultCheckbox.type = "checkbox";
      elements.difficultCheckbox.className = "difficult-checkbox";
      elements.difficultCheckbox.dataset.difficultCheckbox = "";

      var label = document.createElement("label");
      label.className = "difficult-mark-label";
      label.setAttribute("for", elements.difficultCheckbox.id);
      var labelText = document.createElement("strong");
      labelText.textContent = "Mark as difficult";
      label.appendChild(labelText);

      var help = document.createElement("small");
      help.id = "difficult-mark-help";
      help.className = "difficult-mark-help";
      help.textContent = "Save this question for focused practice later.";
      label.appendChild(help);

      elements.difficultStatus = document.createElement("span");
      elements.difficultStatus.id = "difficult-mark-status";
      elements.difficultStatus.className = "difficult-mark-status";
      elements.difficultStatus.dataset.difficultStatus = "";
      elements.difficultStatus.setAttribute("aria-live", "polite");
      elements.difficultCheckbox.setAttribute("aria-describedby", "difficult-mark-help difficult-mark-status");

      control.appendChild(elements.difficultCheckbox);
      control.appendChild(label);
      control.appendChild(elements.difficultStatus);
      questionCard.appendChild(control);
      elements.difficultControl = control;
    }

    if (!elements.difficultCheckbox && elements.difficultControl) {
      elements.difficultCheckbox = firstElement(["input[type='checkbox']"], elements.difficultControl);
    }
  }

  function showScreen(screenName) {
    setHidden(elements.categoryScreen, screenName !== "categories");
    setHidden(elements.paperSetupScreen, screenName !== "paper-setup");
    setHidden(elements.modeScreen, screenName !== "mode");
    setHidden(elements.quizScreen, screenName !== "quiz");
    setHidden(elements.resultScreen, screenName !== "results");

    var activeScreen = screenName === "paper-setup"
      ? elements.paperSetupScreen
      : screenName === "quiz"
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
    return categoryQuestions(categoryId).length;
  }

  function importantQuestionCount(categoryId) {
    return categoryQuestions(categoryId).filter(isImportantQuestion).length;
  }

  function populateStudyScopeUI(categoryId) {
    if (elements.importantOnlyCheckbox) {
      elements.importantOnlyCheckbox.checked = state.importantOnly;
      elements.importantOnlyCheckbox.disabled = importantQuestionCount(categoryId) === 0;
    }
    updateStudyScopeUI();
  }

  function updateStudyScopeUI() {
    if (!state.category) return;

    var categoryId = state.category.id;
    var allInCategory = categoryQuestions(categoryId);
    var importantInSelection = allInCategory.filter(isImportantQuestion).length;
    var selectedQuestions = questionsForSelection(categoryId, null, state.importantOnly);
    var selectionLabel = sessionSelectionLabel(state.partIndex, state.importantOnly);

    if (elements.modeCategory) {
      elements.modeCategory.textContent = state.category.name + " · " + selectionLabel;
    }
    if (elements.importantCount) {
      elements.importantCount.textContent = importantInSelection + (importantInSelection === 1
        ? " repeated MCQ in this category"
        : " repeated MCQs in this category");
    }
    if (elements.studyScopeSummary) {
      elements.studyScopeSummary.textContent = state.importantOnly
        ? "All " + selectedQuestions.length + " important questions selected"
        : "All " + allInCategory.length + " questions selected";
    }

    var hasSelectedQuestions = selectedQuestions.length > 0;
    if (elements.learnModeButton) elements.learnModeButton.disabled = !hasSelectedQuestions;
    if (elements.quizModeButton) elements.quizModeButton.disabled = !hasSelectedQuestions;
    updateDifficultModeUI();
  }

  function updateDifficultModeUI() {
    var categoryId = state.category ? state.category.id : "";
    var count = categoryId ? difficultQuestionCount(categoryId, state.partIndex, state.importantOnly) : 0;
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
          + ", " + sessionSelectionLabel(state.partIndex, state.importantOnly)
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

    var count = difficultQuestionCount(state.category.id, state.partIndex, state.importantOnly);
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
    saveActiveSession();
  }

  function renderCategories() {
    if (!elements.categoryGrid) return;
    elements.categoryGrid.textContent = "";

    categories.forEach(function (category) {
      var count = questionCount(category.id);
      var importantCount = importantQuestionCount(category.id);
      var card = document.createElement("button");
      card.type = "button";
      card.className = "category-card" + (count === 0 ? " is-empty" : "");
      card.dataset.category = category.id;
      card.dataset.categoryId = category.id;
      card.disabled = count === 0;
      card.setAttribute(
        "aria-label",
        category.name + ", " + count + (count === 1 ? " question" : " questions")
          + (importantCount ? ", " + importantCount + " important repeated" : "")
      );

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
          + (importantCount ? " · " + importantCount + " important" : "")
        : "Coming soon";

      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(meta);
      card.appendChild(badge);
      card.appendChild(content);
      elements.categoryGrid.appendChild(card);
    });
  }

  function renderPaperCategoryOptions() {
    if (!elements.paperCategoryOptions) return;
    elements.paperCategoryOptions.textContent = "";

    categories.forEach(function (category) {
      var count = questionCount(category.id);
      var label = document.createElement("label");
      label.className = "paper-category-option";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "paper-category";
      checkbox.value = category.id;
      checkbox.dataset.paperCategory = category.id;
      checkbox.disabled = count === 0;

      var copy = document.createElement("span");
      copy.className = "paper-category-option-copy";
      var name = document.createElement("strong");
      name.textContent = category.name;
      var description = document.createElement("small");
      description.textContent = category.description || "PPSC practice questions";
      copy.appendChild(name);
      copy.appendChild(description);

      var countLabel = document.createElement("span");
      countLabel.className = "paper-category-option-count";
      countLabel.textContent = count > 0 ? count + " MCQs" : "Unavailable";

      label.appendChild(checkbox);
      label.appendChild(copy);
      label.appendChild(countLabel);
      elements.paperCategoryOptions.appendChild(label);
    });
  }

  function selectedPaperCategoryIds() {
    if (!elements.paperCategoryOptions) return [];
    var selectedIds = Array.from(
      elements.paperCategoryOptions.querySelectorAll("input[name='paper-category']:checked:not(:disabled)")
    ).map(function (checkbox) {
      return String(checkbox.value);
    });
    return categories.map(function (category) { return category.id; }).filter(function (categoryId) {
      return selectedIds.includes(categoryId);
    });
  }

  function paperPoolSize(categoryIds) {
    return categoryIds.reduce(function (total, categoryId) {
      return total + questionCount(categoryId);
    }, 0);
  }

  function updatePaperSelectionUI() {
    var selectedIds = selectedPaperCategoryIds();
    var available = paperPoolSize(selectedIds);
    var canStart = selectedIds.length > 0 && available >= PAPER_QUESTION_COUNT;

    if (elements.paperSelectionSummary) {
      if (selectedIds.length === 0) {
        elements.paperSelectionSummary.textContent = "No categories selected";
      } else {
        elements.paperSelectionSummary.textContent = selectedIds.length
          + (selectedIds.length === 1 ? " category selected" : " categories selected")
          + " · " + available + " MCQs available";
      }
    }
    if (elements.paperStartButton) elements.paperStartButton.disabled = !canStart;
    if (elements.paperSetupStatus) {
      elements.paperSetupStatus.textContent = selectedIds.length > 0 && !canStart
        ? "Select categories containing at least " + PAPER_QUESTION_COUNT + " questions in total."
        : "";
    }
    return canStart;
  }

  function openPaperSetup() {
    if (!elements.paperSetupScreen) return;
    if (elements.paperCategoryOptions) {
      elements.paperCategoryOptions.querySelectorAll("input[name='paper-category']").forEach(function (checkbox) {
        checkbox.checked = false;
      });
    }
    updatePaperSelectionUI();
    showScreen("paper-setup");
  }

  function setAllPaperCategories(selected) {
    if (!elements.paperCategoryOptions) return;
    elements.paperCategoryOptions.querySelectorAll("input[name='paper-category']").forEach(function (checkbox) {
      checkbox.checked = Boolean(selected) && !checkbox.disabled;
    });
    updatePaperSelectionUI();
  }

  function paperPairKey(question) {
    var pairId = String(question && question.pairId || "").trim();
    return pairId || "question:" + String(question.id);
  }

  function balancedPaperSample(categoryIds) {
    var pools = fisherYates(categoryIds).map(function (categoryId) {
      return {
        categoryId: categoryId,
        questions: fisherYates(categoryQuestions(categoryId))
      };
    });
    var selected = [];
    var usedPairIds = new Set();

    while (selected.length < PAPER_QUESTION_COUNT) {
      var availablePools = pools.filter(function (pool) { return pool.questions.length > 0; });
      if (availablePools.length === 0) break;
      var madeProgress = false;

      fisherYates(availablePools).forEach(function (pool) {
        if (selected.length >= PAPER_QUESTION_COUNT || pool.questions.length === 0) return;
        var preferredIndex = pool.questions.findIndex(function (question) {
          return !usedPairIds.has(paperPairKey(question));
        });
        var questionIndex = preferredIndex >= 0 ? preferredIndex : 0;
        var question = pool.questions.splice(questionIndex, 1)[0];
        selected.push(question);
        usedPairIds.add(paperPairKey(question));
        madeProgress = true;
      });

      if (!madeProgress) break;
    }

    return selected.length === PAPER_QUESTION_COUNT ? fisherYates(selected) : [];
  }

  function startPaper(categoryIds) {
    var selectedIds = Array.isArray(categoryIds) ? categoryIds.map(String) : [];
    selectedIds = categories.map(function (category) { return category.id; }).filter(function (categoryId) {
      return selectedIds.includes(categoryId) && questionCount(categoryId) > 0;
    });

    if (selectedIds.length === 0 || paperPoolSize(selectedIds) < PAPER_QUESTION_COUNT) {
      if (elements.paperSetupStatus) {
        elements.paperSetupStatus.textContent = "Choose categories with at least "
          + PAPER_QUESTION_COUNT + " available questions.";
      }
      return false;
    }

    var sampledQuestions = balancedPaperSample(selectedIds);
    if (sampledQuestions.length !== PAPER_QUESTION_COUNT) {
      if (elements.paperSetupStatus) {
        elements.paperSetupStatus.textContent = "A 100-question paper could not be prepared from this selection.";
      }
      return false;
    }

    var sessionQuestions = sampledQuestions.map(shuffledQuizQuestion);
    state.category = null;
    state.sessionKind = "paper";
    state.paperCategoryIds = selectedIds.slice();
    state.questions = sessionQuestions;
    state.mode = "quiz";
    state.scope = "all";
    state.partIndex = null;
    state.importantOnly = false;
    state.responses = new Array(PAPER_QUESTION_COUNT).fill(null);
    state.learnVisitedQuestionIds = new Set();
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    closePaperReview();
    setQuizSessionLabel();
    showScreen("quiz");
    renderQuestion();
    return true;
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
    state.sessionKind = "category";
    state.paperCategoryIds = [];
    state.questions = [];
    state.mode = null;
    state.scope = "all";
    state.partIndex = null;
    state.importantOnly = false;
    state.responses = [];
    state.learnVisitedQuestionIds = new Set();
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    populateStudyScopeUI(category.id);
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

  function quizQuestionWithOrder(question, optionOrder) {
    if (!isIndexPermutation(optionOrder)) return null;
    var shuffledOptions = optionOrder.map(function (originalIndex, index) {
      var option = question.options[originalIndex];
      if (!option || typeof option !== "object") return option;
      return Object.assign({}, option, { label: OPTION_LABELS[index] });
    });
    var shuffledCorrectIndex = optionOrder.indexOf(question.correctOptionIndex);
    var shuffledOptionsUrdu = Array.isArray(question.optionsUrdu)
      ? optionOrder.map(function (originalIndex) { return question.optionsUrdu[originalIndex]; })
      : null;

    return Object.assign({}, question, {
      options: shuffledOptions,
      ...(shuffledOptionsUrdu ? { optionsUrdu: shuffledOptionsUrdu } : {}),
      correctOptionIndex: shuffledCorrectIndex,
      _sessionOptionOrder: optionOrder.slice()
    });
  }

  function shuffledQuizQuestion(question) {
    if (hasPositionDependentOptionWording(question)) {
      previousOptionOrders[question.id] = orderKey(CANONICAL_OPTION_ORDER, function (originalIndex) {
        return originalIndex;
      });
      return quizQuestionWithOrder(question, CANONICAL_OPTION_ORDER);
    }

    var optionEntries = question.options.map(function (option, originalIndex) {
      return { option: option, originalIndex: originalIndex };
    });
    var shuffledEntries = shuffledOrder(
      optionEntries,
      function (entry) { return entry.originalIndex; },
      previousOptionOrders[question.id]
    );
    var optionOrder = shuffledEntries.map(function (entry) {
      return entry.originalIndex;
    });
    previousOptionOrders[question.id] = orderKey(optionOrder, function (originalIndex) {
      return originalIndex;
    });

    return quizQuestionWithOrder(question, optionOrder);
  }

  function setQuizSessionLabel() {
    if (elements.quizCategory) {
      if (isPaperSession()) {
        elements.quizCategory.textContent = "Custom Paper · 100 MCQs";
      } else if (state.category) {
        elements.quizCategory.textContent = state.category.name + " \u00b7 "
          + sessionModeLabel(state.mode, state.scope) + " \u00b7 "
          + sessionSelectionLabel(state.partIndex, state.importantOnly);
      }
    }
    if (elements.quizScreen) {
      elements.quizScreen.dataset.mode = state.mode || "";
      elements.quizScreen.dataset.scope = state.scope || "all";
      elements.quizScreen.dataset.sessionKind = state.sessionKind || "category";
    }
  }

  function startQuiz(categoryId, mode, scope) {
    var category = findCategory(categoryId);
    var selectedScope = scope === "difficult" ? "difficult" : "all";
    state.partIndex = null;
    var filteredQuestions = questionsForSelection(categoryId, null, state.importantOnly).filter(function (question) {
      return selectedScope !== "difficult" || difficultQuestionIds.has(String(question.id));
    });

    if (!category) return false;
    if (filteredQuestions.length === 0) {
      if (selectedScope === "difficult") {
        state.category = category;
        state.sessionKind = "category";
        state.paperCategoryIds = [];
        state.questions = [];
        state.mode = null;
        state.scope = "difficult";
        state.responses = [];
        state.learnVisitedQuestionIds = new Set();
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
    var sessionQuestions = filteredQuestions.slice();
    if (selectedMode === "quiz") {
      var sessionOrderKey = categoryId + "::" + selectedScope + "::"
        + (state.partIndex === null ? "all" : state.partIndex) + "::"
        + (state.importantOnly ? "important" : "standard");
      sessionQuestions = shuffledOrder(
        filteredQuestions,
        function (question) { return question.id; },
        previousQuestionOrders[sessionOrderKey]
      );
      previousQuestionOrders[sessionOrderKey] = orderKey(sessionQuestions, function (question) {
        return question.id;
      });
      sessionQuestions = sessionQuestions.map(shuffledQuizQuestion);
    }

    state.category = category;
    state.sessionKind = "category";
    state.paperCategoryIds = [];
    state.questions = sessionQuestions;
    state.mode = selectedMode;
    state.scope = selectedScope;
    state.responses = new Array(sessionQuestions.length).fill(null);
    state.learnVisitedQuestionIds = new Set();
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;

    setQuizSessionLabel();
    showScreen("quiz");
    renderQuestion();
    return true;
  }

  function currentQuestion() {
    return state.questions[state.currentIndex] || null;
  }

  function firstUnvisitedLearnQuestionIndex() {
    for (var index = 0; index < state.questions.length; index += 1) {
      if (!state.learnVisitedQuestionIds.has(String(state.questions[index].id))) return index;
    }
    return -1;
  }

  function firstUnansweredQuizQuestionIndex() {
    for (var index = 0; index < state.questions.length; index += 1) {
      var response = Array.isArray(state.responses) ? state.responses[index] : null;
      if (!response || !response.submitted) return index;
    }
    return -1;
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

  function isUrduCategoryQuestion(question) {
    return Boolean(question) && question.categoryId === "urdu";
  }

  function displayQuestionText(question) {
    if (isUrduCategoryQuestion(question)) return String(question.questionUrdu || question.question || "").trim();
    return String(question.question || "").trim();
  }

  function displayOption(question, index) {
    var option = normalizeOption(question.options[index], index);
    if (isUrduCategoryQuestion(question) && Array.isArray(question.optionsUrdu)) {
      option.label = URDU_OPTION_LABELS[index];
      option.text = String(question.optionsUrdu[index] || option.text).trim();
    }
    return option;
  }

  function renderQuestion() {
    var question = currentQuestion();
    if (!question) {
      showResults();
      return;
    }

    if (state.mode === "quiz") {
      loadCurrentResponse();
    } else {
      state.selectedIndex = null;
      state.submitted = false;
    }

    if (elements.questionKind) {
      var paperQuestionCategory = isPaperSession() ? findCategory(question.categoryId) : null;
      var kindLabel = paperQuestionCategory
        ? "CUSTOM PAPER · " + paperQuestionCategory.name.toUpperCase()
        : (question.kind === "similar" ? "SIMILAR PRACTICE" : "SOURCE PAPER");
      if (isImportantQuestion(question)) {
        kindLabel += " · IMPORTANT · REPEATED " + question.repeatCount + "x";
      }
      elements.questionKind.textContent = kindLabel;
      elements.questionKind.classList.toggle("is-important", isImportantQuestion(question));
    }
    var urduCategoryQuestion = isUrduCategoryQuestion(question);
    if (elements.questionText) {
      elements.questionText.textContent = displayQuestionText(question);
      elements.questionText.dataset.questionId = question.id;
      elements.questionText.classList.toggle("is-urdu", urduCategoryQuestion);
      if (urduCategoryQuestion) {
        elements.questionText.lang = "ur";
        elements.questionText.dir = "rtl";
      } else {
        elements.questionText.removeAttribute("lang");
        elements.questionText.removeAttribute("dir");
      }
    }
    var questionUrdu = String(question.questionUrdu || "").trim();
    if (elements.questionTextUrdu) elements.questionTextUrdu.textContent = questionUrdu;
    if (elements.questionUrduBlock) setHidden(elements.questionUrduBlock, urduCategoryQuestion || !questionUrdu);
    if (elements.optionsList) {
      elements.optionsList.setAttribute(
        "aria-labelledby",
        !urduCategoryQuestion && questionUrdu ? "question-text question-text-urdu" : "question-text"
      );
      elements.optionsList.classList.toggle("is-urdu", urduCategoryQuestion);
      if (urduCategoryQuestion) {
        elements.optionsList.lang = "ur";
        elements.optionsList.dir = "rtl";
      } else {
        elements.optionsList.removeAttribute("lang");
        elements.optionsList.removeAttribute("dir");
      }
    }
    renderOptions(question);
    updateProgress();
    if (elements.previousButton) {
      elements.previousButton.disabled = state.currentIndex === 0;
      elements.previousButton.setAttribute(
        "aria-label",
        state.currentIndex === 0 ? "Previous question unavailable" : "Go to previous question"
      );
    }
    resetFeedback();
    if (isPaperSession()) {
      setHidden(elements.difficultControl, true);
    } else {
      syncDifficultCheckbox(question);
      setHidden(elements.difficultControl, false);
    }

    if (state.mode === "learn") {
      prepareLearnQuestion(question);
    } else {
      if (state.selectedIndex !== null) markSelectedOption(state.selectedIndex);
      if (state.submitted) {
        markSubmittedOptions(question);
        showFeedback(question, state.selectedIndex === question.correctOptionIndex);
      }
      if (elements.actionButton) {
        var isLast = state.currentIndex === state.questions.length - 1;
        var nextUnansweredIndex = isLast && state.submitted
          ? firstUnansweredQuizQuestionIndex()
          : -1;
        setHidden(elements.actionButton, false);
        elements.actionButton.textContent = state.submitted
          ? (isLast
            ? (nextUnansweredIndex >= 0 ? "Next Unanswered" : "View Results")
            : "Next Question")
          : "Check Answer";
        elements.actionButton.disabled = false;
        elements.actionButton.dataset.action = state.submitted
          ? (isLast
            ? (nextUnansweredIndex >= 0 ? "next-unanswered" : "results")
            : "next")
          : "check";
      }
    }

    saveActiveSession();

    if (elements.questionText && typeof elements.questionText.focus === "function") {
      elements.questionText.setAttribute("tabindex", "-1");
      elements.questionText.focus({ preventScroll: true });
    }
  }

  function renderOptions(question) {
    if (!elements.optionsList) return;
    elements.optionsList.textContent = "";
    elements.optionsList.setAttribute("role", "radiogroup");
    elements.optionsList.setAttribute(
      "aria-label",
      isUrduCategoryQuestion(question) ? "جواب کے اختیارات" : "Answer options"
    );

    question.options.forEach(function (rawOption, index) {
      var option = displayOption(question, index);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.optionIndex = String(index);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");

      var label = document.createElement("span");
      label.className = "option-label";
      label.textContent = option.label;
      label.lang = isUrduCategoryQuestion(question) ? "ur" : "en";
      label.dir = isUrduCategoryQuestion(question) ? "rtl" : "ltr";

      var text = document.createElement("span");
      text.className = "option-text";
      text.textContent = option.text;
      if (isUrduCategoryQuestion(question)) {
        text.lang = "ur";
        text.dir = "rtl";
      }

      button.appendChild(label);
      button.appendChild(text);
      elements.optionsList.appendChild(button);
    });
  }

  function markSelectedOption(index) {
    var buttons = elements.optionsList
      ? elements.optionsList.querySelectorAll(".option-button, [data-option-index]")
      : [];
    buttons.forEach(function (button) {
      var isSelected = Number(button.dataset.optionIndex) === index;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", isSelected ? "true" : "false");
    });
  }

  function prepareLearnQuestion(question) {
    if (!(state.learnVisitedQuestionIds instanceof Set)) {
      state.learnVisitedQuestionIds = new Set();
    }
    state.learnVisitedQuestionIds.add(String(question.id));
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
    showLearnFeedback(question);

    if (elements.actionButton) {
      var isLast = state.currentIndex === state.questions.length - 1;
      var nextUnvisitedIndex = isLast ? firstUnvisitedLearnQuestionIndex() : -1;
      setHidden(elements.actionButton, false);
      elements.actionButton.textContent = isLast
        ? (nextUnvisitedIndex >= 0 ? "Next Unvisited" : "Finish Learning")
        : "Next Question";
      elements.actionButton.disabled = false;
      elements.actionButton.dataset.action = isLast
        ? (nextUnvisitedIndex >= 0 ? "next-unvisited" : "results")
        : "next";
    }
  }

  function selectOption(index) {
    var question = currentQuestion();
    if (!question || state.submitted || index < 0 || index >= question.options.length) return;

    state.selectedIndex = index;
    markSelectedOption(index);

    clearSelectionPrompt();
    saveActiveSession();
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

    storeCurrentResponse();
    if (state.currentIndex >= state.questions.length - 1) {
      var pendingIndex = state.mode === "learn"
        ? firstUnvisitedLearnQuestionIndex()
        : firstUnansweredQuizQuestionIndex();
      if (pendingIndex >= 0) {
        state.currentIndex = pendingIndex;
        renderQuestion();
        return;
      }
      showResults();
      return;
    }

    state.currentIndex += 1;
    renderQuestion();
  }

  function handlePrevious() {
    if (!currentQuestion() || state.currentIndex === 0) return;
    storeCurrentResponse();
    state.currentIndex -= 1;
    renderQuestion();
  }

  function handleQuestionNumberJump() {
    if (!elements.questionNumberInput || state.questions.length === 0) return false;

    var rawValue = String(elements.questionNumberInput.value || "").trim();
    var requestedNumber = Number(rawValue);
    var isValid = /^\d+$/.test(rawValue)
      && Number.isInteger(requestedNumber)
      && requestedNumber >= 1
      && requestedNumber <= state.questions.length;

    if (!isValid) {
      elements.questionNumberInput.value = String(state.currentIndex + 1);
      if (typeof elements.questionNumberInput.setCustomValidity === "function") {
        elements.questionNumberInput.setCustomValidity(
          "Enter a whole number from 1 to " + state.questions.length + "."
        );
      }
      if (typeof elements.questionNumberInput.reportValidity === "function") {
        elements.questionNumberInput.reportValidity();
      }
      return false;
    }

    if (typeof elements.questionNumberInput.setCustomValidity === "function") {
      elements.questionNumberInput.setCustomValidity("");
    }
    storeCurrentResponse();
    state.currentIndex = requestedNumber - 1;
    renderQuestion();
    return true;
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
    storeCurrentResponse();

    markSubmittedOptions(question);
    showFeedback(question, isCorrect);
    updateProgress();

    if (elements.actionButton) {
      var isLast = state.currentIndex === state.questions.length - 1;
      var nextUnansweredIndex = isLast ? firstUnansweredQuizQuestionIndex() : -1;
      elements.actionButton.textContent = isLast
        ? (nextUnansweredIndex >= 0 ? "Next Unanswered" : "View Results")
        : "Next Question";
      elements.actionButton.dataset.action = isLast
        ? (nextUnansweredIndex >= 0 ? "next-unanswered" : "results")
        : "next";
      elements.actionButton.focus({ preventScroll: true });
    }
    saveActiveSession();
  }

  function showSelectionPrompt() {
    if (!elements.feedback) return;
    ensureFeedbackChildren();
    var urduCategoryQuestion = isUrduCategoryQuestion(currentQuestion());
    elements.feedback.classList.remove("is-correct", "is-incorrect");
    elements.feedback.classList.add("feedback", "is-warning");
    elements.feedback.classList.toggle("is-urdu", urduCategoryQuestion);
    elements.feedback.lang = urduCategoryQuestion ? "ur" : "en";
    elements.feedback.dir = urduCategoryQuestion ? "rtl" : "ltr";
    setHidden(elements.feedback, false);
    elements.feedbackTitle.textContent = urduCategoryQuestion ? "ایک جواب منتخب کریں" : "Select an option";
    elements.feedbackText.textContent = urduCategoryQuestion
      ? "جواب چیک کرنے سے پہلے ایک اختیار منتخب کریں۔"
      : "Please choose one answer before checking.";
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

    var correctOption = displayOption(question, question.correctOptionIndex);
    var urduCategoryQuestion = isUrduCategoryQuestion(question);
    elements.feedback.classList.remove("is-warning", "is-correct", "is-incorrect");
    elements.feedback.classList.add("feedback", isCorrect ? "is-correct" : "is-incorrect");
    elements.feedback.classList.toggle("is-urdu", urduCategoryQuestion);
    elements.feedback.setAttribute("role", "status");
    elements.feedback.setAttribute("aria-live", "polite");
    elements.feedback.lang = urduCategoryQuestion ? "ur" : "en";
    elements.feedback.dir = urduCategoryQuestion ? "rtl" : "ltr";
    setHidden(elements.feedback, false);

    elements.feedbackTitle.textContent = urduCategoryQuestion
      ? (isCorrect ? "درست!" : "غلط")
      : (isCorrect ? "Correct!" : "Incorrect");
    elements.feedbackText.textContent = urduCategoryQuestion
      ? (isCorrect
        ? "بہت خوب — آپ نے صحیح جواب منتخب کیا۔"
        : "درست جواب " + correctOption.label + "۔ " + correctOption.text + " ہے۔")
      : (isCorrect
        ? "Well done — you selected the right answer."
        : "The correct answer is " + correctOption.label + ". " + correctOption.text + ".");
  }

  function showLearnFeedback(question) {
    if (!elements.feedback) return;
    ensureFeedbackChildren();

    var urduCategoryQuestion = isUrduCategoryQuestion(question);
    elements.feedback.classList.remove("is-warning", "is-incorrect");
    elements.feedback.classList.add("feedback", "is-correct");
    elements.feedback.classList.toggle("is-urdu", urduCategoryQuestion);
    elements.feedback.setAttribute("role", "status");
    elements.feedback.setAttribute("aria-live", "polite");
    elements.feedback.lang = urduCategoryQuestion ? "ur" : "en";
    elements.feedback.dir = urduCategoryQuestion ? "rtl" : "ltr";
    setHidden(elements.feedback, false);
    elements.feedbackTitle.textContent = urduCategoryQuestion ? "درست جواب" : "Correct answer";
    elements.feedbackText.textContent = urduCategoryQuestion
      ? "درست جواب منتخب ہے۔ ضرورت ہو تو اسے مشکل نشان زد کریں، پھر آگے بڑھیں۔"
      : "The correct option is selected. Mark it as difficult if needed, then continue.";
  }

  function resetFeedback() {
    if (elements.feedback) {
      elements.feedback.classList.remove("is-warning", "is-correct", "is-incorrect");
      elements.feedback.classList.remove("is-urdu");
      elements.feedback.classList.add("feedback");
      setHidden(elements.feedback, true);
      elements.feedback.removeAttribute("lang");
      elements.feedback.removeAttribute("dir");
    }
    if (elements.feedbackTitle) elements.feedbackTitle.textContent = "";
    if (elements.feedbackText) elements.feedbackText.textContent = "";
  }

  function updateProgress() {
    var total = state.questions.length;
    var number = Math.min(state.currentIndex + 1, total);
    var percent = total > 0 ? Math.round((number / total) * 100) : 0;

    if (elements.questionCounter && !elements.questionNumberInput) {
      elements.questionCounter.textContent = "Question " + number + " of " + total;
    }
    if (elements.questionNumberInput) {
      if (typeof elements.questionNumberInput.setCustomValidity === "function") {
        elements.questionNumberInput.setCustomValidity("");
      }
      elements.questionNumberInput.value = String(number);
      elements.questionNumberInput.min = "1";
      elements.questionNumberInput.max = String(total);
      elements.questionNumberInput.step = "1";
      elements.questionNumberInput.disabled = total === 0;
      elements.questionNumberInput.setAttribute(
        "aria-label",
        "Go to question " + number + " of " + total
      );
    }
    if (elements.questionTotal) {
      elements.questionTotal.textContent = String(total);
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
      if (isPaperSession()) {
        var livePaperStats = paperStats(state.responses, state.questions);
        elements.scoreText.textContent = "C:" + livePaperStats.correct + " W:" + livePaperStats.wrong
          + " Marks:" + formatPaperMark(livePaperStats.net);
        elements.scoreText.setAttribute(
          "aria-label",
          livePaperStats.correct + " correct, " + livePaperStats.wrong + " wrong, "
            + formatPaperMark(livePaperStats.net) + " marks"
        );
      } else {
        elements.scoreText.textContent = state.mode === "learn" ? "Learn Mode" : "Score: " + state.score;
        elements.scoreText.removeAttribute("aria-label");
      }
    }
  }

  function closePaperReview() {
    setHidden(elements.resultReviewPanel, true);
    if (elements.resultCorrectButton) elements.resultCorrectButton.setAttribute("aria-expanded", "false");
    if (elements.resultWrongButton) elements.resultWrongButton.setAttribute("aria-expanded", "false");
  }

  function appendPaperReviewText(item, className, text, language) {
    if (!text) return;
    var paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    if (language === "ur") {
      paragraph.lang = "ur";
      paragraph.dir = "rtl";
    }
    item.appendChild(paragraph);
  }

  function showPaperReview(reviewKind) {
    if (!isPaperSession() || !elements.resultReviewPanel || !elements.resultReviewList) return;
    var showCorrect = reviewKind === "correct";
    var matchingIndexes = [];
    state.responses.forEach(function (response, index) {
      if (!response || !response.submitted || !state.questions[index]) return;
      var correct = response.selectedIndex === state.questions[index].correctOptionIndex;
      if (correct === showCorrect) matchingIndexes.push(index);
    });

    elements.resultReviewList.textContent = "";
    matchingIndexes.forEach(function (questionIndex) {
      var question = state.questions[questionIndex];
      var response = state.responses[questionIndex];
      var category = findCategory(question.categoryId);
      var selectedOption = displayOption(question, response.selectedIndex);
      var correctOption = displayOption(question, question.correctOptionIndex);
      var urduCategoryQuestion = isUrduCategoryQuestion(question);

      var item = document.createElement("li");
      item.className = "result-review-item " + (showCorrect ? "is-correct" : "is-wrong");
      item.classList.toggle("is-urdu", urduCategoryQuestion);
      if (urduCategoryQuestion) {
        item.lang = "ur";
        item.dir = "rtl";
      }
      var heading = document.createElement("strong");
      heading.textContent = urduCategoryQuestion
        ? "سوال " + (questionIndex + 1) + "۔ " + displayQuestionText(question)
        : "Question " + (questionIndex + 1) + ". " + displayQuestionText(question);
      item.appendChild(heading);
      appendPaperReviewText(
        item,
        "result-review-meta",
        category ? (urduCategoryQuestion ? "زمرہ: اردو" : "Category: " + category.name) : "",
        urduCategoryQuestion ? "ur" : ""
      );
      if (!urduCategoryQuestion) {
        appendPaperReviewText(item, "result-review-question-urdu", String(question.questionUrdu || "").trim(), "ur");
      }
      appendPaperReviewText(
        item,
        "result-review-answer",
        (urduCategoryQuestion ? "آپ کا جواب: " : "Your answer: ")
          + selectedOption.label + (urduCategoryQuestion ? "۔ " : ". ") + selectedOption.text,
        urduCategoryQuestion ? "ur" : ""
      );
      appendPaperReviewText(
        item,
        "result-review-answer",
        (urduCategoryQuestion ? "درست جواب: " : "Correct answer: ")
          + correctOption.label + (urduCategoryQuestion ? "۔ " : ". ") + correctOption.text,
        urduCategoryQuestion ? "ur" : ""
      );
      appendPaperReviewText(
        item,
        "result-review-explanation-urdu",
        String(question.explanationUrdu || "").trim(),
        "ur"
      );
      elements.resultReviewList.appendChild(item);
    });

    if (matchingIndexes.length === 0) {
      var emptyItem = document.createElement("li");
      emptyItem.className = "result-review-empty";
      emptyItem.textContent = showCorrect
        ? "There are no correct answers in this paper."
        : "There are no wrong answers in this paper.";
      elements.resultReviewList.appendChild(emptyItem);
    }

    var label = showCorrect ? "Correct answers" : "Wrong answers";
    if (elements.resultReviewTitle) elements.resultReviewTitle.textContent = label;
    if (elements.resultReviewSummary) {
      elements.resultReviewSummary.textContent = matchingIndexes.length + " "
        + (matchingIndexes.length === 1 ? "answer" : "answers") + " in this list.";
    }
    if (elements.resultCorrectButton) {
      elements.resultCorrectButton.setAttribute("aria-expanded", showCorrect ? "true" : "false");
    }
    if (elements.resultWrongButton) {
      elements.resultWrongButton.setAttribute("aria-expanded", showCorrect ? "false" : "true");
    }
    setHidden(elements.resultReviewPanel, false);
    if (elements.resultReviewTitle && typeof elements.resultReviewTitle.focus === "function") {
      elements.resultReviewTitle.setAttribute("tabindex", "-1");
      elements.resultReviewTitle.focus({ preventScroll: true });
    }
    if (typeof elements.resultReviewPanel.scrollIntoView === "function") {
      elements.resultReviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function showResults() {
    storeCurrentResponse();
    var pendingIndex = state.mode === "learn"
      ? firstUnvisitedLearnQuestionIndex()
      : firstUnansweredQuizQuestionIndex();
    if (state.questions.length > 0 && pendingIndex >= 0) {
      state.currentIndex = pendingIndex;
      showScreen("quiz");
      renderQuestion();
      return;
    }

    var total = state.questions.length;
    var percent = total > 0 ? Math.round((state.score / total) * 100) : 0;
    var remainingInScope = state.category && state.scope === "difficult"
      ? difficultQuestionCount(state.category.id, state.partIndex, state.importantOnly)
      : total;
    var canRepeatScope = state.scope !== "difficult" || remainingInScope > 0;
    removeStoredActiveSession();
    showScreen("results");

    if (isPaperSession()) {
      var completedPaperStats = paperStats(state.responses, state.questions);
      var penalty = completedPaperStats.wrong * PAPER_WRONG_PENALTY;
      if (elements.resultScore) elements.resultScore.textContent = formatPaperMark(completedPaperStats.net) + "/100";
      var paperScoreCaption = elements.resultScore && elements.resultScore.parentElement
        ? elements.resultScore.parentElement.querySelector("span")
        : null;
      if (paperScoreCaption) paperScoreCaption.textContent = "Marks";
      if (elements.resultScore && elements.resultScore.parentElement) {
        elements.resultScore.parentElement.setAttribute(
          "aria-label",
          "Final paper score " + formatPaperMark(completedPaperStats.net) + " out of 100"
        );
      }
      if (elements.resultCorrectCount) elements.resultCorrectCount.textContent = String(completedPaperStats.correct);
      if (elements.resultWrongCount) elements.resultWrongCount.textContent = String(completedPaperStats.wrong);
      if (elements.resultPaperScore) {
        elements.resultPaperScore.textContent = formatPaperMark(completedPaperStats.net) + " / 100";
      }
      if (elements.resultPenalty) {
        elements.resultPenalty.textContent = penalty > 0
          ? "Negative marking: -" + formatPaperMark(penalty)
          : "Negative marking: 0";
      }
      setHidden(elements.resultBreakdown, false);
      closePaperReview();
      if (elements.playAgainButton) {
        elements.playAgainButton.textContent = "Attempt New Paper";
        elements.playAgainButton.disabled = false;
      }
      if (elements.resultTitle) elements.resultTitle.textContent = "Paper complete!";
      if (elements.resultSummary) {
        elements.resultSummary.textContent = completedPaperStats.correct + " correct, "
          + completedPaperStats.wrong + " wrong. Final score after negative marking: "
          + formatPaperMark(completedPaperStats.net) + " out of 100.";
      }
      return;
    }

    setHidden(elements.resultBreakdown, true);
    closePaperReview();

    var scoreOutput = elements.resultScore || elements.scoreText;
    if (scoreOutput && state.mode === "learn") {
      scoreOutput.textContent = String(total);
    } else if (scoreOutput) {
      scoreOutput.textContent = state.score + " / " + total;
    }

    var scoreCaption = elements.resultScore && elements.resultScore.parentElement
      ? elements.resultScore.parentElement.querySelector("span")
      : null;
    if (scoreCaption) scoreCaption.textContent = state.mode === "learn" ? "Questions" : "Correct";
    if (elements.resultScore && elements.resultScore.parentElement) {
      elements.resultScore.parentElement.setAttribute(
        "aria-label",
        state.mode === "learn" ? "Questions in learning set" : "Final score"
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
      elements.resultSummary.textContent = "This difficult learning set contains " + total + " questions. The quiz will use "
        + remainingInScope + (remainingInScope === 1 ? " question" : " questions") + " still marked difficult.";
    } else if (elements.resultSummary && state.mode === "learn") {
      elements.resultSummary.textContent = "This learning set contains " + total + " questions in "
        + sessionSelectionLabel(state.partIndex, state.importantOnly) + ". Now test yourself with the quiz.";
    } else if (elements.resultSummary) {
      elements.resultSummary.textContent = resultMessage(percent);
    }
  }

  function resultMessage(percent) {
    if (percent === 100) return "Excellent — a perfect score!";
    if (percent >= 70) return "Great work. Keep practising to make the facts stick.";
    if (percent >= 50) return "Good attempt. Mark difficult questions and practise them again.";
    return "Keep going. Mark difficult questions and try this category again.";
  }

  function restartQuiz() {
    if (isPaperSession()) {
      startPaper(state.paperCategoryIds);
      return;
    }
    if (!state.category) {
      returnToCategories();
      return;
    }
    startQuiz(state.category.id, state.mode, state.scope);
  }

  function handlePlayAgain() {
    if (isPaperSession()) {
      startPaper(state.paperCategoryIds);
      return;
    }
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
    state.sessionKind = "category";
    state.paperCategoryIds = [];
    state.questions = [];
    state.mode = null;
    state.scope = "all";
    state.partIndex = null;
    state.importantOnly = false;
    state.responses = [];
    state.learnVisitedQuestionIds = new Set();
    state.currentIndex = 0;
    state.selectedIndex = null;
    state.submitted = false;
    state.score = 0;
    setHidden(elements.resultBreakdown, true);
    closePaperReview();
    showScreen("categories");
    updateContinueSessionUI();
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
    if (elements.paperBuilderCard) elements.paperBuilderCard.addEventListener("click", openPaperSetup);
    if (elements.paperSetupBackButton) elements.paperSetupBackButton.addEventListener("click", returnToCategories);
    if (elements.paperCategoryOptions) {
      elements.paperCategoryOptions.addEventListener("change", function (event) {
        if (event.target.matches("input[name='paper-category']")) updatePaperSelectionUI();
      });
    }
    if (elements.paperSelectAllButton) {
      elements.paperSelectAllButton.addEventListener("click", function () { setAllPaperCategories(true); });
    }
    if (elements.paperClearAllButton) {
      elements.paperClearAllButton.addEventListener("click", function () { setAllPaperCategories(false); });
    }
    if (elements.paperStartButton) {
      elements.paperStartButton.addEventListener("click", function () {
        startPaper(selectedPaperCategoryIds());
      });
    }
    if (elements.importantOnlyCheckbox) {
      elements.importantOnlyCheckbox.addEventListener("change", function () {
        state.importantOnly = elements.importantOnlyCheckbox.checked;
        updateStudyScopeUI();
      });
    }
    if (elements.continueSessionButton) {
      elements.continueSessionButton.addEventListener("click", restoreActiveSession);
    }
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
    if (elements.previousButton) elements.previousButton.addEventListener("click", handlePrevious);
    if (elements.questionNumberInput) {
      elements.questionNumberInput.addEventListener("input", function () {
        if (typeof elements.questionNumberInput.setCustomValidity === "function") {
          elements.questionNumberInput.setCustomValidity("");
        }
      });
      elements.questionNumberInput.addEventListener("change", handleQuestionNumberJump);
      elements.questionNumberInput.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        handleQuestionNumberJump();
      });
    }
    if (elements.actionButton) elements.actionButton.addEventListener("click", handleAction);
    if (elements.backButton) elements.backButton.addEventListener("click", returnToCategories);
    if (elements.restartButton) elements.restartButton.addEventListener("click", restartQuiz);
    if (elements.playAgainButton) elements.playAgainButton.addEventListener("click", handlePlayAgain);
    if (elements.changeCategoryButton) elements.changeCategoryButton.addEventListener("click", returnToCategories);
    if (elements.resultCorrectButton) {
      elements.resultCorrectButton.addEventListener("click", function () { showPaperReview("correct"); });
    }
    if (elements.resultWrongButton) {
      elements.resultWrongButton.addEventListener("click", function () { showPaperReview("wrong"); });
    }
    if (elements.resultReviewCloseButton) {
      elements.resultReviewCloseButton.addEventListener("click", function () {
        var returnTarget = elements.resultCorrectButton
          && elements.resultCorrectButton.getAttribute("aria-expanded") === "true"
          ? elements.resultCorrectButton
          : elements.resultWrongButton;
        closePaperReview();
        if (returnTarget && typeof returnTarget.focus === "function") returnTarget.focus({ preventScroll: true });
      });
    }
    if (elements.difficultCheckbox) {
      elements.difficultCheckbox.addEventListener("change", handleDifficultCheckboxChange);
    }
  }

  function init() {
    collectElements();
    ensureDifficultModeUI();
    ensureDifficultControl();
    difficultQuestionIds = loadDifficultQuestionIds();
    loadActiveSession();
    renderCategories();
    renderPaperCategoryOptions();
    bindEvents();
    resetFeedback();
    updateDifficultModeUI();
    updatePaperSelectionUI();
    setHidden(elements.resultBreakdown, true);
    closePaperReview();
    showScreen("categories");
    updateContinueSessionUI();

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
