"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const dataPath = path.join(projectDirectory, "data", "questions.js");
const releaseRepeatEvidencePath = path.join(projectDirectory, "data", "release-repeat-evidence.json");
const htmlPath = path.join(projectDirectory, "index.html");
const stylesPath = path.join(projectDirectory, "styles.css");
const fontPaths = [
  path.join(projectDirectory, "assets", "fonts", "inter-latin.woff2"),
  path.join(projectDirectory, "assets", "fonts", "noto-nastaliq-urdu-arabic.woff2")
];
const errors = [];
const warnings = [];
const repeatDecisionFilePatterns = [
  { corpus: "IBES", pattern: /^ibes-dedup-decisions-p\d{3}-\d{3,4}\.json$/i },
  { corpus: "ADV2E102", pattern: /^adv2e102-dedup-decisions-pdf\d{4}-\d{4}\.json$/i }
];
const repeatSourceIdentityPatterns = {
  IBES: /^Q\d{4}$/,
  ADV2E102: /^ADV2E102-U\d{4}-Q\d{3}$/
};
const verifyWorkRepeatEvidence = process.argv.includes("--verify-work-repeat-evidence");
const productionItemIdPattern = /^(?:(?:P23[4-9]-Q\d{3}|IBES-Q\d{4})-(?:SRC|SIM)|ADV2E102-U\d{4}-Q\d{3}-(?:SRC|SIM))$/;
const canonicalPairIdPattern = /^(?:IBES-Q\d{4}|ADV2E102-U\d{4}-Q\d{3})$/;

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

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function loadReleaseRepeatEvidence() {
  try {
    return JSON.parse(fs.readFileSync(releaseRepeatEvidencePath, "utf8"));
  } catch (reason) {
    error(`release repeat evidence could not be loaded: ${reason.message}`);
    return null;
  }
}

function canonicalRepeatTargetId(duplicateOf) {
  const target = String(duplicateOf || "").trim();
  if (productionItemIdPattern.test(target)) return target;
  if (canonicalPairIdPattern.test(target)) return `${target}-SRC`;
  return "";
}

function loadVerifiedSkipCounts() {
  const decisionSources = [];
  const verifiedSkips = [];
  const skipCountsByTargetId = new Map();
  const seenDecisions = new Set();
  let verifiedSkipCount = 0;

  for (const { corpus, pattern } of repeatDecisionFilePatterns) {
    const files = fs.readdirSync(workDirectory).filter((name) => pattern.test(name)).sort();
    for (const name of files) {
      let decisions;
      try {
        decisions = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
      } catch (reason) {
        error(`${name}: cannot read repeat evidence (${reason.message})`);
        continue;
      }
      if (!Array.isArray(decisions)) {
        error(`${name}: repeat-evidence decision file must contain an array`);
        continue;
      }
      decisionSources.push({
        corpus,
        file: name,
        recordCount: decisions.length,
        recordsSha256: sha256Json(decisions)
      });
      for (const decision of decisions) {
        const sourceIdentity = String(decision.sourceRecordId || (
          Number.isInteger(Number(decision.sourceQuestionNumber))
            ? `Q${String(Number(decision.sourceQuestionNumber)).padStart(4, "0")}`
            : ""
        ));
        const evidenceId = `${corpus}:${sourceIdentity}`;
        if (!sourceIdentity) {
          error(`${name}: decision has no stable source identity`);
          continue;
        }
        if (seenDecisions.has(evidenceId)) {
          error(`${evidenceId}: duplicate decision evidence`);
          continue;
        }
        seenDecisions.add(evidenceId);
        if (decision.action !== "skip" || decision.reviewStatus !== "verified") continue;
        const targetId = canonicalRepeatTargetId(decision.duplicateOf);
        if (!targetId) {
          error(`${evidenceId}: verified skip does not resolve to a production question ID`);
          continue;
        }
        verifiedSkips.push({ corpus, sourceIdentity, targetId, sourceFile: name });
        verifiedSkipCount += 1;
        skipCountsByTargetId.set(targetId, (skipCountsByTargetId.get(targetId) || 0) + 1);
      }
    }
  }
  decisionSources.sort((left, right) => `${left.corpus}:${left.file}`.localeCompare(`${right.corpus}:${right.file}`));
  verifiedSkips.sort((left, right) => (
    `${left.corpus}:${left.sourceIdentity}`.localeCompare(`${right.corpus}:${right.sourceIdentity}`)
  ));
  return { decisionSources, verifiedSkips, skipCountsByTargetId, verifiedSkipCount };
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
    // Permit valid in-word diacritics such as Mâlik, while rejecting common
    // UTF-8-to-Windows-1252 lead characters and punctuation sequences.
    if (/(?:[ÃÂØÙÛ]|â(?![\p{L}\p{M}]))/u.test(JSON.stringify(question))) {
      error(`${location}: contains likely UTF-8 mojibake`);
    }
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

function validateQuestionsAgainstRepeatEvidence(questions, evidence, label) {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  let markedCount = 0;
  let representedSkipCount = 0;

  for (const [targetId, skipCount] of evidence.skipCountsByTargetId) {
    if (!questionsById.has(targetId)) error(`${targetId}: ${label} repeat target is absent from production questions`);
    if (!Number.isInteger(skipCount) || skipCount < 1) error(`${targetId}: invalid ${label} skip count ${skipCount}`);
  }

  for (const question of questions) {
    const skipCount = evidence.skipCountsByTargetId.get(question.id) || 0;
    const hasRepeatCount = Object.prototype.hasOwnProperty.call(question, "repeatCount");
    const hasImportant = Object.prototype.hasOwnProperty.call(question, "isImportant");
    if (!skipCount) {
      if (hasRepeatCount || hasImportant) error(`${question.id}: repeat metadata has no ${label} skip evidence`);
      continue;
    }
    const expectedRepeatCount = skipCount + 1;
    if (question.repeatCount !== expectedRepeatCount) {
      error(`${question.id}: repeatCount is ${question.repeatCount}; expected ${expectedRepeatCount} from ${label}`);
    }
    if (question.isImportant !== true) error(`${question.id}: repeated canonical question must use isImportant=true`);
    if (!Number.isInteger(question.repeatCount) || question.repeatCount < 2) {
      error(`${question.id}: repeatCount must be an integer of at least 2`);
    }
    markedCount += 1;
    representedSkipCount += skipCount;
  }

  if (markedCount !== evidence.skipCountsByTargetId.size) {
    error(`repeat metadata marks ${markedCount} questions; expected ${evidence.skipCountsByTargetId.size} from ${label}`);
  }
  if (representedSkipCount !== evidence.verifiedSkipCount) {
    error(`repeat metadata represents ${representedSkipCount} skips; expected ${evidence.verifiedSkipCount} from ${label}`);
  }
}

function validatePinnedRepeatEvidence(data, questions) {
  const snapshot = loadReleaseRepeatEvidence();
  if (!snapshot) return;
  if (snapshot.schemaVersion !== 1) error(`release repeat evidence schemaVersion is ${snapshot.schemaVersion}; expected 1`);

  const questionBank = snapshot.questionBank;
  if (!questionBank || typeof questionBank !== "object" || Array.isArray(questionBank)) {
    error("release repeat evidence questionBank must be an object");
  } else {
    if (questionBank.dataVersion !== data.version) {
      error(`release repeat evidence dataVersion is ${questionBank.dataVersion}; expected ${data.version}`);
    }
    if (questionBank.questionCount !== questions.length) {
      error(`release repeat evidence questionCount is ${questionBank.questionCount}; expected ${questions.length}`);
    }
    const payloadSha256 = sha256Json(data);
    if (!/^[a-f0-9]{64}$/.test(String(questionBank.payloadSha256 || ""))) {
      error("release repeat evidence payloadSha256 must be a lowercase SHA-256 digest");
    } else if (questionBank.payloadSha256 !== payloadSha256) {
      error(`release question-bank payload SHA-256 is ${payloadSha256}; expected ${questionBank.payloadSha256}`);
    }
  }

  const sourceKeys = new Set();
  const decisionSources = Array.isArray(snapshot.decisionSources) ? snapshot.decisionSources : [];
  if (!Array.isArray(snapshot.decisionSources) || !decisionSources.length) {
    error("release repeat evidence decisionSources must be a nonempty array");
  }
  for (const source of decisionSources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      error("release repeat evidence contains an invalid decisionSources entry");
      continue;
    }
    const rule = repeatDecisionFilePatterns.find((entry) => entry.corpus === source.corpus);
    const sourceKey = `${source.corpus}:${source.file}`;
    if (!rule || !rule.pattern.test(String(source.file || ""))) {
      error(`${sourceKey}: invalid release repeat-evidence source`);
    }
    if (sourceKeys.has(sourceKey)) error(`${sourceKey}: duplicate release repeat-evidence source`);
    sourceKeys.add(sourceKey);
    if (!Number.isInteger(source.recordCount) || source.recordCount < 1) {
      error(`${sourceKey}: recordCount must be a positive integer`);
    }
    if (!/^[a-f0-9]{64}$/.test(String(source.recordsSha256 || ""))) {
      error(`${sourceKey}: recordsSha256 must be a lowercase SHA-256 digest`);
    }
  }

  const skipCountsByTargetId = new Map();
  const seenEvidence = new Set();
  const verifiedSkips = Array.isArray(snapshot.verifiedSkips) ? snapshot.verifiedSkips : [];
  if (!Array.isArray(snapshot.verifiedSkips) || !verifiedSkips.length) {
    error("release repeat evidence verifiedSkips must be a nonempty array");
  }
  for (const entry of verifiedSkips) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      error("release repeat evidence contains an invalid verifiedSkips entry");
      continue;
    }
    const evidenceId = `${entry.corpus}:${entry.sourceIdentity}`;
    const sourceKey = `${entry.corpus}:${entry.sourceFile}`;
    const identityPattern = repeatSourceIdentityPatterns[entry.corpus];
    if (!identityPattern || !identityPattern.test(String(entry.sourceIdentity || ""))) {
      error(`${evidenceId}: sourceIdentity has an invalid format`);
    }
    if (seenEvidence.has(evidenceId)) error(`${evidenceId}: duplicate release repeat evidence`);
    seenEvidence.add(evidenceId);
    if (!sourceKeys.has(sourceKey)) error(`${evidenceId}: sourceFile is not listed in decisionSources`);
    if (!productionItemIdPattern.test(String(entry.targetId || ""))) {
      error(`${evidenceId}: targetId is not a production question ID`);
      continue;
    }
    skipCountsByTargetId.set(entry.targetId, (skipCountsByTargetId.get(entry.targetId) || 0) + 1);
  }

  const summary = snapshot.summary;
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    error("release repeat evidence summary must be an object");
  } else {
    if (summary.decisionSourceCount !== decisionSources.length) {
      error(`release repeat evidence decisionSourceCount is ${summary.decisionSourceCount}; expected ${decisionSources.length}`);
    }
    if (summary.verifiedSkipCount !== verifiedSkips.length) {
      error(`release repeat evidence verifiedSkipCount is ${summary.verifiedSkipCount}; expected ${verifiedSkips.length}`);
    }
    if (summary.targetCount !== skipCountsByTargetId.size) {
      error(`release repeat evidence targetCount is ${summary.targetCount}; expected ${skipCountsByTargetId.size}`);
    }
  }

  validateQuestionsAgainstRepeatEvidence(questions, {
    skipCountsByTargetId,
    verifiedSkipCount: verifiedSkips.length
  }, "pinned release");
  return { decisionSources, verifiedSkips };
}

function validateRepeatMetadata(data, questions) {
  // This release always carries a pinned evidence snapshot. Validate it even
  // when the data version is malformed so a version downgrade cannot bypass
  // the evidence contract.
  const pinnedEvidence = validatePinnedRepeatEvidence(data, questions);
  if (verifyWorkRepeatEvidence) {
    const workEvidence = loadVerifiedSkipCounts();
    validateQuestionsAgainstRepeatEvidence(questions, workEvidence, "current work/");
    if (pinnedEvidence) {
      if (JSON.stringify(workEvidence.decisionSources) !== JSON.stringify(pinnedEvidence.decisionSources)) {
        error("current work/ decision-source descriptors differ from the pinned release snapshot");
      }
      if (JSON.stringify(workEvidence.verifiedSkips) !== JSON.stringify(pinnedEvidence.verifiedSkips)) {
        error("current work/ verified-skip evidence differs from the pinned release snapshot");
      }
    }
  }
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
  if (sourceQuestions.length !== 4169) error(`ADV2E102 source count is ${sourceQuestions.length}; expected 4169`);
  if (similarQuestions.length !== 4169) error(`ADV2E102 similar count is ${similarQuestions.length}; expected 4169`);

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
    "category-screen", "paper-builder-card", "paper-setup-screen", "paper-setup-back-button",
    "paper-category-options", "paper-select-all-button", "paper-clear-all-button",
    "paper-selection-summary", "paper-setup-status", "paper-start-button",
    "mode-screen", "quiz-screen", "results-screen", "category-grid",
    "continue-session-card", "continue-session-button", "continue-session-title", "continue-session-meta",
    "mode-category", "standard-mode-options", "learn-mode-button", "quiz-mode-button",
    "difficult-mode-button", "difficult-mode-options", "difficult-back-button",
    "difficult-count", "difficult-empty", "difficult-learn-button", "difficult-quiz-button",
    "mode-back-button",
    "question-kind", "question-text", "question-urdu-block", "question-text-urdu",
    "options-container", "action-button", "feedback",
    "difficult-control", "difficult-checkbox",
    "difficult-mark-help", "difficult-mark-status",
    "question-counter", "question-number-input", "question-total", "progress-fill",
    "score-text", "result-score", "result-breakdown", "result-correct-button",
    "result-correct-count", "result-wrong-button", "result-wrong-count",
    "result-paper-score", "result-penalty", "result-review-panel",
    "result-review-title", "result-review-summary", "result-review-list",
    "result-review-close-button", "back-button", "restart-button",
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
  if (/\bid=["']part-select["']|\bdata-part-select\b/i.test(html)) {
    error("index.html: the removed Study Part selector must not be present");
  }
  const questionNumberInput = html.match(/<input\b[^>]*\bid=["']question-number-input["'][^>]*>/i)?.[0] || "";
  for (const [attribute, expectedValue] of [["type", "number"], ["min", "1"], ["step", "1"], ["inputmode", "numeric"]]) {
    if (!new RegExp(`\\b${attribute}=["']${expectedValue}["']`, "i").test(questionNumberInput)) {
      error(`index.html: #question-number-input must use ${attribute}="${expectedValue}"`);
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
validateRepeatMetadata(data, result.questions);
validateKnownCorrections(result.questions);
validateIbesBank(result.questions);
validateAdv2e102Bank(result.questions);
validateHtml();
validateFonts();

console.log(`Site data: ${result.categories.length} categories, ${result.questions.length} questions.`);
console.log(`Repeat evidence: pinned release snapshot${verifyWorkRepeatEvidence ? " + strict current work/ cross-check" : ""}.`);
const counts = Object.fromEntries(result.categories.map((category) => [
  category.name,
  result.questions.filter((question) => question.categoryId === category.id).length
]));
console.log(counts);
warnings.forEach((message) => console.warn(`WARN  ${message}`));
errors.forEach((message) => console.error(`ERROR ${message}`));
console.log(`Site validation: ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) process.exitCode = 1;
