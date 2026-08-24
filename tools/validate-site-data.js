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

function validateHtml() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const requiredIds = [
    "category-screen", "mode-screen", "quiz-screen", "results-screen", "category-grid",
    "mode-category", "learn-mode-button", "quiz-mode-button", "mode-back-button",
    "question-kind", "question-text", "question-urdu-block", "question-text-urdu",
    "options-container", "action-button", "feedback",
    "details-toggle", "details-panel", "explanation-text", "related-history", "related-history-text",
    "related-history-source-link",
    "source-notes", "details-source",
    "source-label", "source-link", "question-counter", "progress-fill",
    "score-text", "result-score", "back-button", "restart-button",
    "play-again-button", "change-category-button"
  ];
  for (const id of requiredIds) {
    const matches = html.match(new RegExp(`\\bid=["']${id}["']`, "g")) || [];
    if (matches.length !== 1) error(`index.html: expected one #${id}, found ${matches.length}`);
  }
  const dataScript = html.indexOf('src="data/questions.js"');
  const appScript = html.indexOf('src="app.js"');
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
