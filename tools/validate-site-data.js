"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const dataPath = path.join(projectDirectory, "data", "questions.js");
const htmlPath = path.join(projectDirectory, "index.html");
const stylesPath = path.join(projectDirectory, "styles.css");
const fontPaths = [
  path.join(projectDirectory, "assets", "fonts", "inter-latin.woff2"),
  path.join(projectDirectory, "assets", "fonts", "noto-nastaliq-urdu-arabic.woff2")
];
const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(fs.readFileSync(dataPath, "utf8"), sandbox, { filename: dataPath });
  } catch (reason) {
    error(`questions.js could not be evaluated: ${reason.message}`);
    return { categories: [], questions: [] };
  }
  return sandbox.window.PPSC_QUIZ_DATA || { categories: [], questions: [] };
}

function validateData(data) {
  if (!Array.isArray(data.categories)) error("categories must be an array");
  if (!Array.isArray(data.questions)) error("questions must be an array");
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const categoryIds = new Set();
  const questionIds = new Set();

  for (const category of categories) {
    if (!category || !String(category.id || "").trim()) error("category has no id");
    if (categoryIds.has(category.id)) error(`duplicate category id ${category.id}`);
    categoryIds.add(category.id);
    if (!String(category.name || "").trim()) error(`${category.id}: category has no name`);
  }

  for (const [offset, question] of questions.entries()) {
    const location = question && question.id ? question.id : `question ${offset + 1}`;
    if (!question || typeof question !== "object") {
      error(`${location}: must be an object`);
      continue;
    }
    if (/[ÃÂâØÙÛ]/u.test(JSON.stringify(question))) error(`${location}: contains likely UTF-8 mojibake`);
    if (!String(question.id || "").trim()) error(`${location}: missing id`);
    if (questionIds.has(question.id)) error(`${location}: duplicate id`);
    questionIds.add(question.id);
    if (!categoryIds.has(question.categoryId)) error(`${location}: unknown category ${question.categoryId}`);
    if (!String(question.question || "").trim()) error(`${location}: missing question text`);
    if (String(question.question || "").trim() && !/[A-Za-z]/.test(question.question)) {
      error(`${location}: question needs an English instruction`);
    }
    if (!/[\u0600-\u06ff]/u.test(String(question.questionUrdu || ""))) {
      error(`${location}: questionUrdu must contain an Urdu translation`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      error(`${location}: must have exactly four options`);
    } else if (question.options.some((option) => !String(typeof option === "object" ? option.text : option).trim())) {
      error(`${location}: has an empty option`);
    }
    if (!Number.isInteger(question.correctOptionIndex) || question.correctOptionIndex < 0 || question.correctOptionIndex > 3) {
      error(`${location}: invalid correctOptionIndex`);
    }
    if (!/[\u0600-\u06ff]/u.test(String(question.explanationUrdu || ""))) {
      error(`${location}: explanationUrdu must contain Urdu script`);
    }
    const relatedHistory = String(question.relatedHistoryUrdu || "").trim();
    if (relatedHistory.length < 80 || !/[\u0600-\u06ff]/u.test(relatedHistory)) {
      error(`${location}: relatedHistoryUrdu must contain useful factual Urdu background`);
    }
    const correctOption = Array.isArray(question.options) && Number.isInteger(question.correctOptionIndex)
      ? question.options[question.correctOptionIndex]
      : "";
    const correctText = String(typeof correctOption === "object" ? correctOption.text : correctOption).trim();
    if (correctText && !relatedHistory.includes(correctText)) {
      error(`${location}: relatedHistoryUrdu must associate the correct answer`);
    }
    if (!/^https?:\/\//i.test(question.relatedHistorySource || "")) {
      error(`${location}: relatedHistorySource must contain a direct research URL`);
    }
    if (!question.source || !/^https?:\/\//i.test(question.source.referenceUrl || "")) {
      error(`${location}: missing direct research URL`);
    }
  }

  const expectedArgument = process.argv.find((argument) => /^--expected=\d+$/.test(argument));
  if (expectedArgument) {
    const expected = Number(expectedArgument.split("=")[1]);
    if (questions.length !== expected) error(`question count is ${questions.length}; expected ${expected}`);
  }

  for (const category of categories) {
    const count = questions.filter((question) => question.categoryId === category.id).length;
    if (count === 0) warnings.push(`${category.id}: category has no questions`);
  }

  return { categories, questions };
}

function validateKnownCorrections(questions) {
  const expectedAnswers = {
    "P234-Q019-SRC": "32",
    "P235-Q025-SRC": "Mianwali (Kalabagh)",
    "P235-Q043-SRC": "Needn't",
    "P235-Q044-SRC": "Does Ahsan play football?",
    "P235-Q084-SRC": "Financial manager",
    "P235-Q092-SRC": "Net sales",
    "P236-Q001-SRC": "Australia",
    "P236-Q004-SRC": "Fatima Fertilizer",
    "P236-Q018-SRC": "Arif Habib",
    "P236-Q076-SIM": "ختمہ",
    "P238-Q014-SRC": "Improving maritime safety and protecting shipping routes",
    "P238-Q067-SRC": "Nothing",
    "P238-Q068-SRC": "at",
    "P238-Q075-SRC": "Diwan al-Kharaj",
    "P238-Q081-SRC": "محنت زیادہ مگر فائدہ کم",
    "P239-Q015-SRC": "25"
  };

  for (const [id, expectedAnswer] of Object.entries(expectedAnswers)) {
    const question = questions.find((item) => item.id === id);
    if (!question) {
      error(`${id}: known-correction regression item is missing`);
      continue;
    }
    const option = question.options[question.correctOptionIndex];
    const actualAnswer = String(typeof option === "object" ? option.text : option);
    if (actualAnswer !== expectedAnswer) {
      error(`${id}: corrected answer regressed to ${JSON.stringify(actualAnswer)}; expected ${JSON.stringify(expectedAnswer)}`);
    }
    if (!String(question.sourceNotes || "").trim() && id !== "P236-Q076-SIM") {
      error(`${id}: known correction must retain its sourceNotes disclosure`);
    }
  }
}

function validateIbesBank(questions) {
  const ibesQuestions = questions.filter((question) => String(question.id || "").startsWith("IBES-"));
  const sourceQuestions = ibesQuestions.filter((question) => question.kind === "source");
  const similarQuestions = ibesQuestions.filter((question) => question.kind === "similar");
  if (sourceQuestions.length !== 1088) error(`IBES source count is ${sourceQuestions.length}; expected 1088`);
  if (similarQuestions.length !== 1088) error(`IBES similar count is ${similarQuestions.length}; expected 1088`);
  if (ibesQuestions.some((question) => question.categoryId !== "basic-computer-studies")) {
    error("every IBES question must use the Basic Computer Studies category");
  }
  if (ibesQuestions.some((question) => /^IBES-Q0254-/i.test(question.id))) {
    error("IBES Q254 must not exist because it is absent from the supplied scan");
  }

  if (sourceQuestions.some((question) => question.id === "IBES-Q1218-SRC")) {
    error("IBES-Q1218-SRC must remain excluded as a semantic duplicate of IBES-Q0901-SRC");
  }
  const formatPainter = sourceQuestions.find((question) => question.id === "IBES-Q0901-SRC");
  if (!formatPainter) {
    error("IBES-Q0901-SRC Format Painter canonical item is missing");
  } else {
    const option = formatPainter.options[formatPainter.correctOptionIndex];
    const answer = String(typeof option === "object" ? option.text : option);
    if (answer !== "Format Painter") {
      error(`IBES-Q0901-SRC corrected answer regressed to ${JSON.stringify(answer)}`);
    }
  }
}

function validateAdv2e102Bank(questions) {
  const advQuestions = questions.filter((question) => String(question.id || "").startsWith("ADV2E102-"));
  const sourceQuestions = advQuestions.filter((question) => question.kind === "source");
  const similarQuestions = advQuestions.filter((question) => question.kind === "similar");
  if (sourceQuestions.length !== 1982) error(`ADV2E102 source count is ${sourceQuestions.length}; expected 1982`);
  if (similarQuestions.length !== 1982) error(`ADV2E102 similar count is ${similarQuestions.length}; expected 1982`);

  const pairs = new Map();
  for (const question of advQuestions) {
    if (question.verificationStatus !== "verified") error(`${question.id}: ADV2E102 website item is not verified`);
    if (!question.temporalScope || typeof question.temporalScope !== "object") {
      error(`${question.id}: ADV2E102 website item is missing temporalScope`);
    }
    const answerAuthorities = new Set((Array.isArray(question.references) ? question.references : [])
      .filter((reference) => Array.isArray(reference.supports) && reference.supports.includes("answer"))
      .map((reference) => String(reference.authorityId || "").trim())
      .filter(Boolean));
    if (answerAuthorities.size < 2) error(`${question.id}: ADV2E102 website item needs two answer authorities`);
    const pair = pairs.get(question.pairId) || [];
    pair.push(question);
    pairs.set(question.pairId, pair);
  }
  for (const [pairId, pair] of pairs) {
    const kinds = pair.map((question) => question.kind).sort().join(",");
    if (pair.length !== 2 || kinds !== "similar,source") {
      error(`${pairId}: ADV2E102 website pair must contain one source and one similar item`);
    }
  }
}

function validateHtml() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const requiredIds = [
    "category-screen", "mode-screen", "quiz-screen", "results-screen", "category-grid",
    "continue-session-card", "continue-session-button", "continue-session-title", "continue-session-meta",
    "mode-category", "standard-mode-options", "learn-mode-button", "quiz-mode-button",
    "difficult-mode-button", "difficult-mode-options", "difficult-back-button",
    "difficult-count", "difficult-empty", "difficult-learn-button", "difficult-quiz-button",
    "mode-back-button",
    "question-kind", "question-text", "question-urdu-block", "question-text-urdu",
    "options-container", "action-button", "feedback",
    "difficult-control", "difficult-checkbox",
    "difficult-mark-help", "difficult-mark-status",
    "question-counter", "progress-fill",
    "score-text", "result-score", "back-button", "restart-button",
    "play-again-button", "change-category-button"
  ];
  for (const id of requiredIds) {
    const matches = html.match(new RegExp(`\\bid=["']${id}["']`, "g")) || [];
    if (matches.length !== 1) error(`index.html: expected one #${id}, found ${matches.length}`);
  }
  const removedDetailIds = [
    "details-toggle", "details-panel", "explanation-text", "related-history",
    "related-history-text", "related-history-source-link", "option-rationales",
    "source-notes", "details-source", "source-label", "source-link"
  ];
  for (const id of removedDetailIds) {
    if (new RegExp(`\\bid=["']${id}["']`).test(html)) {
      error(`index.html: removed answer-detail control #${id} must not be present`);
    }
  }
  const dataScript = html.search(/src=["']data\/questions\.js(?:\?[^"']*)?["']/);
  const appScript = html.search(/src=["']app\.js(?:\?[^"']*)?["']/);
  if (dataScript < 0 || appScript < 0 || dataScript > appScript) {
    error("index.html: data/questions.js must load before app.js");
  }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html)) {
    error("index.html: fonts must be self-hosted instead of loaded from Google Fonts");
  }
}

function validateFonts() {
  const styles = fs.readFileSync(stylesPath, "utf8");
  for (const fontPath of fontPaths) {
    if (!fs.existsSync(fontPath)) {
      error(`${path.relative(projectDirectory, fontPath)}: font file is missing`);
      continue;
    }
    if (fs.statSync(fontPath).size < 1000) {
      error(`${path.relative(projectDirectory, fontPath)}: font file is unexpectedly small`);
    }
    const cssReference = path.relative(projectDirectory, fontPath).replace(/\\/g, "/");
    if (!styles.includes(cssReference)) {
      error(`styles.css: missing reference to ${cssReference}`);
    }
  }
}

const data = loadData();
const result = validateData(data);
validateKnownCorrections(result.questions);
validateIbesBank(result.questions);
validateAdv2e102Bank(result.questions);
validateHtml();
validateFonts();

console.log(`Site data: ${result.categories.length} categories, ${result.questions.length} questions.`);
const counts = Object.fromEntries(result.categories.map((category) => [
  category.name,
  result.questions.filter((question) => question.categoryId === category.id).length
]));
console.log(counts);
warnings.forEach((message) => console.warn(`WARN  ${message}`));
errors.forEach((message) => console.error(`ERROR ${message}`));
console.log(`Site validation: ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) process.exitCode = 1;
