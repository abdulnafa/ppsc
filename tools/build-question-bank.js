"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectDirectory = path.resolve(__dirname, "..");
const workspaceDirectory = path.resolve(projectDirectory, "..");
const workDirectory = path.join(projectDirectory, "work");
const outputFile = path.join(projectDirectory, "data", "questions.js");

const categories = [
  { id: "general-knowledge", name: "General Knowledge", shortLabel: "GK", description: "World facts, organizations, personalities and important events." },
  { id: "pakistan-studies", name: "Pakistan Studies", shortLabel: "PK", description: "History, constitution, culture and geography of Pakistan." },
  { id: "current-affairs", name: "Current Affairs", shortLabel: "CA", description: "Date-aware national and international developments." },
  { id: "islamic-studies", name: "Islamic Studies", shortLabel: "IS", description: "Core Islamic history, beliefs and general knowledge." },
  { id: "geography", name: "Geography", shortLabel: "GEO", description: "Countries, physical features, maps and world geography." },
  { id: "basic-mathematics", name: "Basic Mathematics", shortLabel: "MATH", description: "Arithmetic, percentages, ratios and everyday calculations." },
  { id: "english", name: "English", shortLabel: "ENG", description: "Grammar, vocabulary, sentence correction and comprehension." },
  { id: "urdu", name: "Urdu", shortLabel: "UR", description: "Urdu grammar, vocabulary, literature and comprehension." },
  { id: "everyday-science", name: "Every-day Science", shortLabel: "SCI", description: "Daily-life concepts from biology, chemistry and physics." },
  { id: "basic-computer-studies", name: "Basic Computer Studies", shortLabel: "IT", description: "Computer fundamentals, internet and Microsoft Office basics." },
  { id: "job-related-finance-taxation", name: "Finance, Taxation & Job-related", shortLabel: "JOB", description: "Extra questions found in the supplied papers; outside the advertised ten-subject syllabus." }
];

const markdownFiles = {
  "general-knowledge": "01_general_knowledge.md",
  "pakistan-studies": "02_pakistan_studies.md",
  "current-affairs": "03_current_affairs.md",
  "islamic-studies": "04_islamic_studies.md",
  geography: "05_geography.md",
  "basic-mathematics": "06_basic_mathematics.md",
  english: "07_english.md",
  urdu: "08_urdu.md",
  "everyday-science": "09_everyday_science.md",
  "basic-computer-studies": "10_basic_computer_studies.md",
  "job-related-finance-taxation": "11_job_related_finance_taxation.md"
};

const expectedPaperCounts = { 234: 20, 235: 100, 236: 78, 237: 76, 238: 89, 239: 86 };
const categoryIds = new Set(categories.map((category) => category.id));
const optionLabels = ["A", "B", "C", "D"];

function fail(message) {
  throw new Error(message);
}

function loadBatches() {
  const files = fs.readdirSync(workDirectory)
    .filter((name) => /^enriched-paper-23[4-9]\.json$/i.test(name))
    .sort();

  if (files.length !== 6) {
    fail(`Expected 6 enriched paper files, found ${files.length}: ${files.join(", ") || "none"}`);
  }

  const paperQuestions = files.flatMap((name) => {
    const value = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    if (!Array.isArray(value)) fail(`${name} must contain a JSON array.`);
    return value;
  });

  const customPath = path.join(workDirectory, "custom-questions.json");
  if (!fs.existsSync(customPath)) return paperQuestions;
  const customQuestions = JSON.parse(fs.readFileSync(customPath, "utf8"));
  if (!Array.isArray(customQuestions)) fail("custom-questions.json must contain a JSON array.");
  return paperQuestions.concat(customQuestions);
}

function validate(questions) {
  const ids = new Set();
  const pairs = new Map();
  const sourcePaperCounts = {};

  for (const [index, question] of questions.entries()) {
    const location = `question index ${index}`;
    if (!question || typeof question !== "object") fail(`${location} is not an object.`);
    if (/[ÃÂâØÙÛ]/u.test(JSON.stringify(question))) fail(`${question.id || location} contains likely UTF-8 mojibake.`);
    if (!question.id || ids.has(question.id)) fail(`${location} has a missing/duplicate id: ${question.id}`);
    ids.add(question.id);
    if (!/^(?:P23[4-9]-Q\d{3}|USR-Q\d{4})-(SRC|SIM)$/.test(question.id)) fail(`${question.id} has an invalid id format.`);
    if (!/^(?:P23[4-9]-Q\d{3}|USR-Q\d{4})$/.test(question.pairId || "")) fail(`${question.id} has an invalid pairId.`);
    if (!categoryIds.has(question.categoryId)) fail(`${question.id} has unknown category ${question.categoryId}.`);
    if (!question.question || !String(question.question).trim()) fail(`${question.id} has no question text.`);
    if (question.question && !/[A-Za-z]/.test(question.question)) {
      fail(`${question.id} needs an English instruction; keep only essential Urdu test text.`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) fail(`${question.id} must have exactly four options.`);
    if (question.options.some((option) => !String(typeof option === "object" ? option.text : option).trim())) {
      fail(`${question.id} has an empty option.`);
    }
    if (!Number.isInteger(question.correctOptionIndex) || question.correctOptionIndex < 0 || question.correctOptionIndex > 3) {
      fail(`${question.id} has an invalid correctOptionIndex.`);
    }
    if (!question.explanationUrdu || String(question.explanationUrdu).trim().length < 20) {
      fail(`${question.id} needs a useful Urdu explanation.`);
    }
    if (!question.source || !/^https?:\/\//.test(question.source.referenceUrl || "")) {
      fail(`${question.id} needs a researched HTTP(S) referenceUrl.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(question.source.accessedOn || "") || Number.isNaN(Date.parse(`${question.source.accessedOn}T00:00:00Z`))) {
      fail(`${question.id} needs a valid accessedOn date in YYYY-MM-DD format.`);
    }
    if (!['source', 'similar'].includes(question.kind)) fail(`${question.id} has invalid kind ${question.kind}.`);
    if (question.kind === "similar" && question.source.type !== "practice") {
      fail(`${question.id} similar item must use source.type practice.`);
    }
    if (question.kind === "source" && question.id.startsWith("P") && question.source.type !== "book") {
      fail(`${question.id} PDF source item must use source.type book.`);
    }
    if (question.kind === "source" && question.id.startsWith("USR-") && question.source.type !== "user") {
      fail(`${question.id} user-supplied source item must use source.type user.`);
    }

    const pair = pairs.get(question.pairId) || [];
    pair.push(question);
    pairs.set(question.pairId, pair);

    if (question.kind === "source") {
      const match = question.id.match(/^P(23[4-9])-/);
      sourcePaperCounts[match[1]] = (sourcePaperCounts[match[1]] || 0) + 1;
    }
  }

  for (const [pairId, pair] of pairs.entries()) {
    if (pair.length !== 2) fail(`${pairId} has ${pair.length} items instead of source + similar.`);
    const kinds = pair.map((question) => question.kind).sort().join(",");
    if (kinds !== "similar,source") fail(`${pairId} does not contain one source and one similar item.`);
    if (pair[0].categoryId !== pair[1].categoryId) fail(`${pairId} source and similar items use different categories.`);
  }

  for (const [paper, expected] of Object.entries(expectedPaperCounts)) {
    const actual = sourcePaperCounts[paper] || 0;
    if (actual !== expected) fail(`Paper ${paper} has ${actual} source items; expected ${expected}.`);
  }

  const expectedSourceCount = Object.values(expectedPaperCounts).reduce((sum, count) => sum + count, 0);
  const pdfQuestionCount = questions.filter((question) => question.id.startsWith("P23")).length;
  if (pdfQuestionCount !== expectedSourceCount * 2) {
    fail(`PDF question bank has ${pdfQuestionCount} items; expected ${expectedSourceCount * 2}.`);
  }
}

function desiredSimilarAnswerIndex(questionId) {
  const digest = crypto
    .createHash("sha256")
    .update(`ppsc-sim-answer-v1:${questionId}`)
    .digest();
  return digest[0] % optionLabels.length;
}

function rebalanceSimilarOptions(questions) {
  const letterReference = /(?:\b(?:option|answer|jawab)\s*[A-D]\b|جواب\s*[A-D]|آپشن\s*[A-D])/iu;

  return questions.map((question) => {
    if (question.kind !== "similar") return question;

    const explanatoryText = `${question.explanationUrdu || ""} ${question.sourceNotes || ""}`;
    if (letterReference.test(explanatoryText)) {
      fail(`${question.id} refers to a fixed answer letter, so its similar-question options cannot be safely balanced.`);
    }

    const desiredIndex = desiredSimilarAnswerIndex(question.id);
    if (desiredIndex === question.correctOptionIndex) return question;

    const options = question.options.map((option) => (
      option && typeof option === "object" ? { ...option } : option
    ));
    [options[question.correctOptionIndex], options[desiredIndex]] = [
      options[desiredIndex],
      options[question.correctOptionIndex]
    ];
    options.forEach((option, index) => {
      if (option && typeof option === "object" && Object.prototype.hasOwnProperty.call(option, "label")) {
        option.label = optionLabels[index];
      }
    });

    return {
      ...question,
      options,
      correctOptionIndex: desiredIndex
    };
  });
}

function websiteQuestion(question) {
  return {
    id: question.id,
    pairId: question.pairId,
    kind: question.kind,
    categoryId: question.categoryId,
    question: question.question,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    explanationUrdu: question.explanationUrdu,
    source: question.source,
    tags: Array.isArray(question.tags) ? question.tags : [],
    verificationStatus: question.verificationStatus || "verified",
    sourceNotes: question.sourceNotes || ""
  };
}

function buildJavaScript(questions) {
  const generatedOn = questions
    .map((question) => question.source.accessedOn)
    .sort()
    .at(-1) || "2026-08-22";
  return `(function () {\n  "use strict";\n\n  var categories = ${JSON.stringify(categories, null, 2)};\n\n  var questions = ${JSON.stringify(questions.map(websiteQuestion), null, 2)};\n\n  window.PPSC_QUIZ_DATA = {\n    version: 2,\n    generatedOn: ${JSON.stringify(generatedOn)},\n    categories: categories,\n    questions: questions\n  };\n  window.PPSC_CATEGORIES = categories;\n  window.PPSC_QUESTIONS = questions;\n})();\n`;
}

function optionText(option) {
  return String(typeof option === "object" ? option.text : option);
}

function renderPracticeItem(question) {
  const answer = optionLabels[question.correctOptionIndex];
  const options = question.options
    .map((option, index) => `${optionLabels[index]}. ${optionText(option)}`)
    .join("\n");
  return `## ${question.id} — ${question.question}\n\n${options}\n\n**Correct answer:** ${answer}. ${optionText(question.options[question.correctOptionIndex])}\n\n**Explanation:** ${question.explanationUrdu}\n\n**Evidence:** ${question.source.referenceUrl} (accessed ${question.source.accessedOn})\n`;
}

function writeMarkdown(questions) {
  const practiceQuestions = questions.filter((question) => question.kind === "similar");
  const master = [
    "# PPSC Similar Practice MCQs",
    "",
    `This generated bank contains ${practiceQuestions.length} original practice MCQs, one for each source question in the supplied PDF. Questions/options are in English; explanations are in Urdu.`,
    "",
    ...practiceQuestions.map(renderPracticeItem)
  ].join("\n");
  fs.writeFileSync(path.join(workspaceDirectory, "ppsc_mcqs.md"), master, "utf8");

  for (const category of categories) {
    const items = practiceQuestions.filter((question) => question.categoryId === category.id);
    const content = [
      `# ${category.name} — Similar Practice MCQs`,
      "",
      `${items.length} original practice questions generated from the supplied PPSC papers.`,
      "",
      ...items.map(renderPracticeItem)
    ].join("\n");
    fs.writeFileSync(path.join(workspaceDirectory, markdownFiles[category.id]), content, "utf8");
  }
}

const questions = rebalanceSimilarOptions(loadBatches());
validate(questions);
fs.writeFileSync(outputFile, buildJavaScript(questions), "utf8");
writeMarkdown(questions);

const counts = Object.fromEntries(categories.map((category) => [
  category.name,
  questions.filter((question) => question.categoryId === category.id).length
]));
console.log(`Built ${questions.length} website MCQs (${questions.length / 2} source + ${questions.length / 2} similar).`);
console.log(counts);
