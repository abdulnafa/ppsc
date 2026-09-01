"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  decisionFilePattern: adv2e102DecisionFilePattern,
  enrichedFilePattern: adv2e102EnrichedFilePattern,
  isDirectHttpsUrl,
  itemIdPattern: adv2e102ItemIdPattern,
  pairIdPattern: adv2e102PairIdPattern,
  readArrayFiles,
  validateReferences,
  validateTemporalScope
} = require("./adv2e102-common");

const projectDirectory = path.resolve(__dirname, "..");
const workspaceDirectory = path.resolve(projectDirectory, "..");
const workDirectory = path.join(projectDirectory, "work");
const outputFile = path.join(projectDirectory, "data", "questions.js");
const releaseRepeatEvidencePath = path.join(projectDirectory, "data", "release-repeat-evidence.json");

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
const expectedIbesSourceCount = 1088;
const expectedAdv2e102SourceCount = 4169;
const categoryIds = new Set(categories.map((category) => category.id));
const optionLabels = ["A", "B", "C", "D"];
const ibesDecisionFilePattern = /^ibes-dedup-decisions-p\d{3}-\d{3,4}\.json$/i;
const productionItemIdPattern = /^(?:(?:P23[4-9]-Q\d{3}|IBES-Q\d{4})-(?:SRC|SIM)|ADV2E102-U\d{4}-Q\d{3}-(?:SRC|SIM))$/;
const canonicalPairIdPattern = /^(?:IBES-Q\d{4}|ADV2E102-U\d{4}-Q\d{3})$/;

function fail(message) {
  throw new Error(message);
}

function loadBatches() {
  const allNames = fs.readdirSync(workDirectory);
  const files = allNames
    .filter((name) => /^enriched-paper-23[4-9]\.json$/i.test(name))
    .sort();

  if (files.length !== 6) {
    fail(`Expected 6 enriched paper files, found ${files.length}: ${files.join(", ") || "none"}`);
  }

  const ibesFiles = allNames
    .filter((name) => /^enriched-ibes-[a-z0-9-]+\.json$/i.test(name))
    .sort();
  const adv2e102Files = allNames
    .filter((name) => adv2e102EnrichedFilePattern.test(name))
    .sort();
  const batchFiles = files.concat(ibesFiles, adv2e102Files);
  const paperQuestions = batchFiles.flatMap((name) => {
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

function canonicalRepeatTargetId(duplicateOf) {
  const target = String(duplicateOf || "").trim();
  if (productionItemIdPattern.test(target)) return target;
  if (canonicalPairIdPattern.test(target)) return `${target}-SRC`;
  return "";
}

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function loadRepeatEvidence() {
  const ibesDecisionData = readArrayFiles(ibesDecisionFilePattern);
  const adv2e102DecisionData = readArrayFiles(adv2e102DecisionFilePattern);
  const decisionSets = [
    { corpus: "IBES", ...ibesDecisionData },
    { corpus: "ADV2E102", ...adv2e102DecisionData }
  ];
  const decisionSources = [];
  const verifiedSkips = [];
  const seenDecisions = new Set();
  const skipCountsByTargetId = new Map();
  let verifiedSkipCount = 0;

  for (const { corpus, files, records } of decisionSets) {
    for (const file of files) {
      const parsed = JSON.parse(fs.readFileSync(path.join(workDirectory, file), "utf8"));
      decisionSources.push({
        corpus,
        file,
        recordCount: parsed.length,
        recordsSha256: sha256Json(parsed)
      });
    }
    for (const decision of records) {
      const sourceIdentity = String(decision.sourceRecordId || (
        Number.isInteger(Number(decision.sourceQuestionNumber))
          ? `Q${String(Number(decision.sourceQuestionNumber)).padStart(4, "0")}`
          : ""
      ));
      const evidenceId = `${corpus}:${sourceIdentity}`;
      if (!sourceIdentity) fail(`${decision._file || corpus}: decision has no stable source identity.`);
      if (seenDecisions.has(evidenceId)) fail(`${evidenceId} appears in more than one decision file.`);
      seenDecisions.add(evidenceId);

      if (decision.action !== "skip" || decision.reviewStatus !== "verified") continue;
      const targetId = canonicalRepeatTargetId(decision.duplicateOf);
      if (!targetId) {
        fail(`${evidenceId} is a verified skip but duplicateOf does not resolve to a production question ID.`);
      }
      verifiedSkips.push({
        corpus,
        sourceIdentity,
        targetId,
        sourceFile: decision._file
      });
      verifiedSkipCount += 1;
      skipCountsByTargetId.set(targetId, (skipCountsByTargetId.get(targetId) || 0) + 1);
    }
  }

  decisionSources.sort((left, right) => `${left.corpus}:${left.file}`.localeCompare(`${right.corpus}:${right.file}`));
  verifiedSkips.sort((left, right) => (
    `${left.corpus}:${left.sourceIdentity}`.localeCompare(`${right.corpus}:${right.sourceIdentity}`)
  ));
  return { decisionSources, verifiedSkips, skipCountsByTargetId, verifiedSkipCount };
}

function validateRepeatEvidence(questions, repeatEvidence) {
  const questionIds = new Set(questions.map((question) => question.id));
  for (const [targetId, skipCount] of repeatEvidence.skipCountsByTargetId) {
    if (!questionIds.has(targetId)) fail(`Verified skip target ${targetId} does not resolve to a retained production question.`);
    if (!Number.isInteger(skipCount) || skipCount < 1) fail(`${targetId} has invalid verified skip evidence count ${skipCount}.`);
  }
}

function loadQuestionTranslations(questions) {
  const files = fs.readdirSync(workDirectory)
    .filter((name) => /^question-translations-ur(?:-[a-z0-9-]+)?\.json$/i.test(name))
    .sort();
  const questionIds = new Set(questions.map((question) => question.id));
  const translations = new Map();

  for (const name of files) {
    const value = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    if (!value || Array.isArray(value) || typeof value !== "object") {
      fail(`${name} must contain a JSON object keyed by question ID.`);
    }
    for (const [id, translation] of Object.entries(value)) {
      if (!questionIds.has(id)) fail(`${name} contains unknown question ID ${id}.`);
      if (translations.has(id)) fail(`${id} has duplicate Urdu translations.`);
      const text = String(translation || "").trim();
      if (text.length < 5 || !/[\u0600-\u06ff]/u.test(text)) {
        fail(`${id} needs a useful Urdu question translation.`);
      }
      if (/[ÃƒÃ‚Ã¢Ã˜Ã™Ã›�]/u.test(text)) fail(`${id} Urdu translation contains likely mojibake.`);
      translations.set(id, text);
    }
  }

  for (const question of questions) {
    const embedded = String(question.questionUrdu || "").trim();
    if (embedded) {
      if (!/[\u0600-\u06ff]/u.test(embedded)) fail(`${question.id} embedded questionUrdu needs Urdu script.`);
      translations.set(question.id, embedded);
    }
    if (!translations.has(question.id)) fail(`${question.id} is missing its Urdu question translation.`);

    const translation = translations.get(question.id);
    const numericTokens = [...new Set(String(question.question).match(/\d+(?:[.,]\d+)*/g) || [])];
    for (const token of numericTokens) {
      if (!translation.includes(token)) {
        fail(`${question.id} Urdu translation must preserve the numeric token ${token}.`);
      }
    }
    if (
      String(question.question).includes("____") &&
      !translation.includes("____") &&
      !/[؟?]/u.test(translation)
    ) {
      fail(`${question.id} Urdu translation must preserve the blank or render it as a direct question.`);
    }
  }
  return translations;
}

function validate(questions) {
  const ids = new Set();
  const pairs = new Map();
  const sourcePaperCounts = {};
  const adv2e102Decisions = new Map();
  for (const decision of readArrayFiles(adv2e102DecisionFilePattern).records) {
    if (adv2e102Decisions.has(decision.sourceRecordId)) fail(`${decision.sourceRecordId} has duplicate ADV2E102 decisions.`);
    adv2e102Decisions.set(decision.sourceRecordId, decision);
  }

  for (const [index, question] of questions.entries()) {
    const location = `question index ${index}`;
    if (!question || typeof question !== "object") fail(`${location} is not an object.`);
    // Standalone accented letters such as â are valid in names (for example,
    // Mâlik). Treat â as mojibake only when it begins a malformed UTF-8
    // punctuation sequence; the other lead characters are never expected in
    // canonical question data.
    if (/(?:[ÃÂØÙÛ]|â(?![\p{L}\p{M}]))/u.test(JSON.stringify(question))) {
      fail(`${question.id || location} contains likely UTF-8 mojibake.`);
    }
    if (!question.id || ids.has(question.id)) fail(`${location} has a missing/duplicate id: ${question.id}`);
    ids.add(question.id);
    if (!/^(?:P23[4-9]-Q\d{3}|IBES-Q\d{4}|USR-Q\d{4})-(SRC|SIM)$/.test(question.id) &&
        !adv2e102ItemIdPattern.test(question.id)) fail(`${question.id} has an invalid id format.`);
    if (!/^(?:P23[4-9]-Q\d{3}|IBES-Q\d{4}|USR-Q\d{4})$/.test(question.pairId || "") &&
        !adv2e102PairIdPattern.test(question.pairId || "")) fail(`${question.id} has an invalid pairId.`);
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
    if (question.kind === "source" && /^(?:P23|IBES-|ADV2E102-)/.test(question.id) && question.source.type !== "book") {
      fail(`${question.id} PDF source item must use source.type book.`);
    }
    if (question.kind === "source" && question.id.startsWith("USR-") && question.source.type !== "user") {
      fail(`${question.id} user-supplied source item must use source.type user.`);
    }
    if (adv2e102PairIdPattern.test(question.pairId || "")) {
      if (question.verificationStatus !== "verified") fail(`${question.id} cannot build unresolved or disputed ADV2E102 content.`);
      const referenceResult = validateReferences(question.references, question.id, fail, 2);
      validateTemporalScope(question.temporalScope, question.question, question.id, fail);
      if (!isDirectHttpsUrl(question.source.referenceUrl)) fail(`${question.id} ADV2E102 canonical source URL must be direct HTTPS.`);
      if (!referenceResult.answerUrls.has(question.source.referenceUrl)) {
        fail(`${question.id} ADV2E102 canonical source URL must be one of its answer-supporting references.`);
      }
      const decision = adv2e102Decisions.get(question.pairId);
      if (!decision || decision.action !== "keep" || decision.reviewStatus !== "verified") {
        fail(`${question.id} requires a verified keep decision before build.`);
      }
    }

    const pair = pairs.get(question.pairId) || [];
    pair.push(question);
    pairs.set(question.pairId, pair);

    if (question.kind === "source") {
      const match = question.id.match(/^P(23[4-9])-/);
      if (match) sourcePaperCounts[match[1]] = (sourcePaperCounts[match[1]] || 0) + 1;
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

  const ibesSourceCount = questions.filter((question) => question.kind === "source" && question.id.startsWith("IBES-")).length;
  if (ibesSourceCount !== expectedIbesSourceCount) {
    fail(`IBES bank has ${ibesSourceCount} retained source items; expected ${expectedIbesSourceCount}.`);
  }

  const adv2e102SourceCount = questions.filter((question) => (
    question.kind === "source" && question.id.startsWith("ADV2E102-")
  )).length;
  if (adv2e102SourceCount !== expectedAdv2e102SourceCount) {
    fail(`ADV2E102 release has ${adv2e102SourceCount} retained source items; expected ${expectedAdv2e102SourceCount}.`);
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
  const letterReference = /(?:\b(?:option|answer|jawab)\s*[A-D](?=\s*(?:is\b|was\b|would\b|[.):,\-–—]|$))|(?:جواب|آپشن)\s*[A-D](?=\s*(?:ہے|تھا|ہوگا|درست|[۔،:)\-–—]|$)))/iu;

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

function websiteQuestion(question, pairsById, translations, repeatEvidence) {
  const pair = pairsById.get(question.pairId) || [];
  const relatedQuestion = pair.find((item) => item.id !== question.id);
  if (!relatedQuestion) fail(`${question.id} has no related pair for background history.`);
  const verifiedSkipCount = repeatEvidence.skipCountsByTargetId.get(question.id) || 0;

  return {
    id: question.id,
    pairId: question.pairId,
    kind: question.kind,
    categoryId: question.categoryId,
    question: question.question,
    questionUrdu: translations.get(question.id),
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    explanationUrdu: question.explanationUrdu,
    relatedHistoryUrdu: buildRelatedHistory(question, relatedQuestion),
    relatedHistorySource: relatedQuestion.source.referenceUrl,
    relatedHistoryAccessedOn: relatedQuestion.source.accessedOn,
    source: question.source,
    tags: Array.isArray(question.tags) ? question.tags : [],
    verificationStatus: question.verificationStatus || "verified",
    sourceNotes: question.sourceNotes || "",
    ...(verifiedSkipCount ? {
      repeatCount: verifiedSkipCount + 1,
      isImportant: true
    } : {}),
    ...(adv2e102PairIdPattern.test(question.pairId) ? {
      references: question.references,
      temporalScope: question.temporalScope
    } : {})
  };
}

function conciseBackground(explanation) {
  const clean = String(explanation || "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[۔.!?؟])\s+/u).filter(Boolean);
  const usefulContext = sentences.slice(0, 2).join(" ") || clean;
  if (usefulContext.length <= 420) return usefulContext;
  const shortened = usefulContext.slice(0, 417).replace(/\s+\S*$/u, "").trim();
  return `${shortened}…`;
}

function buildRelatedHistory(question, relatedQuestion) {
  const correctAnswer = optionText(question.options[question.correctOptionIndex]);
  const relatedAnswer = optionText(relatedQuestion.options[relatedQuestion.correctOptionIndex]);
  const background = conciseBackground(relatedQuestion.explanationUrdu);
  return `${background} موجودہ سوال کے جواب ”${correctAnswer}“ کو اس متعلقہ مستند حقیقت ”${relatedAnswer}“ کے ساتھ جوڑ کر یاد رکھیں۔`;
}

function validateGeneratedRepeatMetadata(questions, repeatEvidence) {
  let importantCount = 0;
  let representedSkipCount = 0;
  for (const question of questions) {
    const verifiedSkipCount = repeatEvidence.skipCountsByTargetId.get(question.id) || 0;
    const hasRepeatCount = Object.prototype.hasOwnProperty.call(question, "repeatCount");
    const hasImportant = Object.prototype.hasOwnProperty.call(question, "isImportant");
    if (!verifiedSkipCount) {
      if (hasRepeatCount || hasImportant) fail(`${question.id} has repeat metadata without verified skip evidence.`);
      continue;
    }
    const expectedRepeatCount = verifiedSkipCount + 1;
    if (question.repeatCount !== expectedRepeatCount) {
      fail(`${question.id} repeatCount is ${question.repeatCount}; expected ${expectedRepeatCount} from verified skip evidence.`);
    }
    if (question.isImportant !== true) fail(`${question.id} must use isImportant=true when repeatCount is at least 2.`);
    importantCount += 1;
    representedSkipCount += verifiedSkipCount;
  }
  if (importantCount !== repeatEvidence.skipCountsByTargetId.size) {
    fail(`Generated repeat metadata marks ${importantCount} questions; expected ${repeatEvidence.skipCountsByTargetId.size}.`);
  }
  if (representedSkipCount !== repeatEvidence.verifiedSkipCount) {
    fail(`Generated repeat metadata represents ${representedSkipCount} verified skips; expected ${repeatEvidence.verifiedSkipCount}.`);
  }
}

function buildJavaScript(questions, translations, repeatEvidence) {
  const generatedOn = questions
    .map((question) => question.source.accessedOn)
    .sort()
    .at(-1) || "2026-08-22";
  const pairsById = new Map();
  questions.forEach((question) => {
    const pair = pairsById.get(question.pairId) || [];
    pair.push(question);
    pairsById.set(question.pairId, pair);
  });
  const websiteQuestions = questions.map((question) => websiteQuestion(question, pairsById, translations, repeatEvidence));
  validateGeneratedRepeatMetadata(websiteQuestions, repeatEvidence);
  const releaseData = {
    version: 5,
    generatedOn,
    categories,
    questions: websiteQuestions
  };
  const javascript = `(function () {\n  "use strict";\n\n  var categories = ${JSON.stringify(categories, null, 2)};\n\n  var questions = ${JSON.stringify(websiteQuestions, null, 2)};\n\n  window.PPSC_QUIZ_DATA = {\n    version: 5,\n    generatedOn: ${JSON.stringify(generatedOn)},\n    categories: categories,\n    questions: questions\n  };\n  window.PPSC_CATEGORIES = categories;\n  window.PPSC_QUESTIONS = questions;\n})();\n`;
  return { javascript, releaseData };
}

function buildReleaseRepeatEvidence(releaseData, repeatEvidence) {
  return {
    schemaVersion: 1,
    questionBank: {
      dataVersion: releaseData.version,
      questionCount: releaseData.questions.length,
      payloadSha256: sha256Json(releaseData)
    },
    summary: {
      decisionSourceCount: repeatEvidence.decisionSources.length,
      verifiedSkipCount: repeatEvidence.verifiedSkips.length,
      targetCount: repeatEvidence.skipCountsByTargetId.size
    },
    decisionSources: repeatEvidence.decisionSources,
    verifiedSkips: repeatEvidence.verifiedSkips
  };
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
    `This generated bank contains ${practiceQuestions.length} original practice MCQs, one for each retained source question in the supplied study PDFs. Questions/options are in English; explanations are in Urdu.`,
    "",
    ...practiceQuestions.map(renderPracticeItem)
  ].join("\n");
  fs.writeFileSync(path.join(workspaceDirectory, "ppsc_mcqs.md"), master, "utf8");

  for (const category of categories) {
    const items = practiceQuestions.filter((question) => question.categoryId === category.id);
    const content = [
      `# ${category.name} — Similar Practice MCQs`,
      "",
      `${items.length} original practice questions generated from the supplied PPSC study sources.`,
      "",
      ...items.map(renderPracticeItem)
    ].join("\n");
    fs.writeFileSync(path.join(workspaceDirectory, markdownFiles[category.id]), content, "utf8");
  }
}

const questions = rebalanceSimilarOptions(loadBatches());
validate(questions);
const repeatEvidence = loadRepeatEvidence();
validateRepeatEvidence(questions, repeatEvidence);
const translations = loadQuestionTranslations(questions);
const { javascript: generatedJavaScript, releaseData } = buildJavaScript(questions, translations, repeatEvidence);
const releaseRepeatEvidence = buildReleaseRepeatEvidence(releaseData, repeatEvidence);
const validateOnly = process.argv.includes("--validate-only");
if (!validateOnly) {
  fs.writeFileSync(outputFile, generatedJavaScript, "utf8");
  fs.writeFileSync(releaseRepeatEvidencePath, `${JSON.stringify(releaseRepeatEvidence, null, 2)}\n`, "utf8");
  writeMarkdown(questions);
}

const counts = Object.fromEntries(categories.map((category) => [
  category.name,
  questions.filter((question) => question.categoryId === category.id).length
]));
const repeatDistribution = {};
for (const skipCount of repeatEvidence.skipCountsByTargetId.values()) {
  const repeatCount = skipCount + 1;
  repeatDistribution[repeatCount] = (repeatDistribution[repeatCount] || 0) + 1;
}
console.log(`${validateOnly ? "Validated" : "Built"} ${questions.length} website MCQs (${questions.length / 2} source + ${questions.length / 2} similar).`);
console.log(`Repeat metadata: ${repeatEvidence.skipCountsByTargetId.size} important questions from ${repeatEvidence.verifiedSkipCount} verified skip decisions; repeatCount distribution ${JSON.stringify(repeatDistribution)}.`);
console.log(counts);
