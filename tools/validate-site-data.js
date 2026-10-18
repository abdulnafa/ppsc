"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { corrections, isNoneOfTheseAnswer, restoreLegacyAnswerOptions } = require("./answer-text-corrections");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const dataPath = path.join(projectDirectory, "data", "questions.js");
const gkStudyNotesPath = path.join(projectDirectory, "data", "gk-study-notes.js");
const detailedLearningPath = path.join(projectDirectory, "data", "detailed-learning.js");
const releaseRepeatEvidencePath = path.join(projectDirectory, "data", "release-repeat-evidence.json");
const htmlPath = path.join(projectDirectory, "index.html");
const appPath = path.join(projectDirectory, "app.js");
const themePath = path.join(projectDirectory, "theme.js");
const stylesPath = path.join(projectDirectory, "styles.css");
const firebaseConfigPath = path.join(projectDirectory, "firebase-config.js");
const firebaseSyncPath = path.join(projectDirectory, "firebase-sync.js");
const firestoreRulesPath = path.join(projectDirectory, "firestore.rules");
const pagesWorkflowPath = path.join(projectDirectory, ".github", "workflows", "pages.yml");
const cloudSyncSmokePath = path.join(projectDirectory, "tools", "cloud-sync-smoke.js");
const fontPaths = [
  path.join(projectDirectory, "assets", "fonts", "inter-latin.woff2"),
  path.join(projectDirectory, "assets", "fonts", "noto-nastaliq-urdu-arabic.woff2")
];
const errors = [];
const warnings = [];
const repeatDecisionFilePatterns = [
  { corpus: "IBES", pattern: /^ibes-dedup-decisions-p\d{3}-\d{3,4}\.json$/i },
  { corpus: "ADV2E102", pattern: /^adv2e102-dedup-decisions-pdf\d{4}-\d{4}\.json$/i },
  { corpus: "WGI", pattern: /^wgi-reviewed-q\d{4}-\d{4}\.json$/i }
];
const repeatSourceIdentityPatterns = {
  IBES: /^Q\d{4}$/,
  ADV2E102: /^ADV2E102-U\d{4}-Q\d{3}$/,
  WGI: /^WGI-Q\d{4}$/
};
const verifyWorkRepeatEvidence = process.argv.includes("--verify-work-repeat-evidence");
const productionItemIdPattern = /^(?:(?:P23[4-9]-Q\d{3}|IBES-Q\d{4}|WGI-Q\d{4})-(?:SRC|SIM)|ADV2E102-U\d{4}-Q\d{3}-(?:SRC|SIM))$/;
const canonicalPairIdPattern = /^(?:IBES-Q\d{4}|WGI-Q\d{4}|ADV2E102-U\d{4}-Q\d{3})$/;

function error(message) {
  errors.push(message);
}

function containsCharactersInOrder(displayText, sourceText) {
  const sourceCharacters = [...String(sourceText).replace(/\s+/g, "")];
  let displayOffset = 0;
  for (const character of sourceCharacters) {
    displayOffset = String(displayText).indexOf(character, displayOffset);
    if (displayOffset < 0) return false;
    displayOffset += character.length;
  }
  return true;
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

function loadGkStudyNotes() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(fs.readFileSync(gkStudyNotesPath, "utf8"), sandbox, { filename: gkStudyNotesPath });
  } catch (reason) {
    error(`gk-study-notes.js could not be evaluated: ${reason.message}`);
    return { data: null, aliasIsNotes: false };
  }
  const data = sandbox.window.PPSC_GK_STUDY_NOTES_DATA || null;
  return {
    data,
    aliasIsNotes: Boolean(data && sandbox.window.PPSC_GK_STUDY_NOTES === data.notes)
  };
}

function loadDetailedLearning() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(fs.readFileSync(detailedLearningPath, "utf8"), sandbox, { filename: detailedLearningPath });
  } catch (reason) {
    error(`detailed-learning.js could not be evaluated: ${reason.message}`);
    return null;
  }
  return sandbox.window.PPSC_DETAILED_LEARNING_DATA || null;
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
  const wgiDecisionsByNumber = new Map();
  for (const reviewName of fs.readdirSync(workDirectory).filter((name) => /^wgi-reviewed-q\d{4}-\d{4}\.json$/i.test(name))) {
    try {
      const reviewRecords = JSON.parse(fs.readFileSync(path.join(workDirectory, reviewName), "utf8"));
      if (Array.isArray(reviewRecords)) {
        for (const reviewRecord of reviewRecords) {
          if (Number.isInteger(Number(reviewRecord.sourceQuestionNumber))) {
            wgiDecisionsByNumber.set(Number(reviewRecord.sourceQuestionNumber), reviewRecord);
          }
        }
      }
    } catch {
      // The normal decision-file loop below reports malformed files.
    }
  }
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
        if (!repeatSourceIdentityPatterns[corpus].test(sourceIdentity)) {
          error(`${evidenceId}: source identity has an invalid format`);
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
        const targetWgiMatch = targetId.match(/^WGI-Q(\d{4})-(?:SRC|SIM)$/);
        if (corpus === "WGI" && targetWgiMatch) {
          const targetDecision = wgiDecisionsByNumber.get(Number(targetWgiMatch[1]));
          if (targetDecision && targetDecision.action !== "keep") continue;
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
    if (question.categoryId === "urdu") {
      const questionUrdu = String(question.questionUrdu || "").trim();
      if (!/\p{Script=Arabic}/u.test(questionUrdu) || /[A-Za-z\uFFFD]/u.test(questionUrdu)) {
        error(`${location}: Urdu-category questionUrdu must use Urdu script without Latin or replacement characters`);
      }
      const questionNumericTokens = [...new Set(String(question.question || "").match(/\d+(?:[.,]\d+)*/g) || [])];
      for (const token of questionNumericTokens) {
        if (!questionUrdu.includes(token)) error(`${location}: questionUrdu must preserve numeric token ${token}`);
      }
      if (!Array.isArray(question.optionsUrdu) || question.optionsUrdu.length !== 4) {
        error(`${location}: Urdu-category question must have exactly four optionsUrdu`);
      } else {
        const optionsUrdu = question.optionsUrdu.map((option) => String(option || "").trim());
        if (optionsUrdu.some((option) => !option)) error(`${location}: has an empty Urdu display option`);
        if (optionsUrdu.some((option) => /[A-Za-z\uFFFD]/u.test(option))) {
          error(`${location}: Urdu display options must not contain Latin or replacement characters`);
        }
        if (new Set(optionsUrdu.map((option) => option.normalize("NFKC").toLocaleLowerCase("ur"))).size !== 4) {
          error(`${location}: Urdu display options must remain distinct`);
        }
        if (Array.isArray(question.options) && question.options.length === 4) {
          question.options.forEach((option, optionIndex) => {
            const sourceText = String(typeof option === "object" ? option.text : option);
            const numericTokens = [...new Set(sourceText.match(/\d+(?:[.,]\d+)*/g) || [])];
            for (const token of numericTokens) {
              if (!optionsUrdu[optionIndex].includes(token)) {
                error(`${location}: Urdu option ${optionIndex + 1} must preserve numeric token ${token}`);
              }
            }
            if (/[A-Za-z]/.test(sourceText) && !/\p{Script=Arabic}/u.test(optionsUrdu[optionIndex])) {
              error(`${location}: translated option ${optionIndex + 1} needs Urdu script`);
            }
            if (!/[A-Za-z\p{Script=Arabic}]/u.test(sourceText)
              && !containsCharactersInOrder(optionsUrdu[optionIndex], sourceText)) {
              error(`${location}: symbol-only Urdu option ${optionIndex + 1} must preserve its characters in order`);
            }
          });
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(question, "optionsUrdu")) {
      error(`${location}: non-Urdu category must not define optionsUrdu`);
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

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option).trim();
}

function findForbiddenMcqFields(value, location = "GK Study Notes") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenMcqFields(item, `${location}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (["options", "optionsUrdu", "correctOptionIndex"].includes(key)) {
      error(`${location}: must not expose MCQ field ${key}`);
    }
    findForbiddenMcqFields(child, `${location}.${key}`);
  }
}

function validateGkStudyNotes(bundle, questionData, questions) {
  const notesData = bundle && bundle.data;
  if (!notesData || typeof notesData !== "object" || Array.isArray(notesData)) {
    error("gk-study-notes.js must expose window.PPSC_GK_STUDY_NOTES_DATA");
    return;
  }
  if (!bundle.aliasIsNotes) {
    error("gk-study-notes.js must expose window.PPSC_GK_STUDY_NOTES as the exact notes array");
  }
  if (notesData.schemaVersion !== 1) {
    error(`GK Study Notes schemaVersion is ${notesData.schemaVersion}; expected 1`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(notesData.generatedOn || ""))) {
    error("GK Study Notes generatedOn must use YYYY-MM-DD");
  }
  if (notesData.sourceBankVersion !== questionData.version) {
    error(`GK Study Notes sourceBankVersion is ${notesData.sourceBankVersion}; expected ${questionData.version}`);
  }
  if (notesData.sourceBankGeneratedOn !== questionData.generatedOn) {
    error(`GK Study Notes sourceBankGeneratedOn is ${notesData.sourceBankGeneratedOn}; expected ${questionData.generatedOn}`);
  }
  if (notesData.sourceBankQuestionCount !== questions.length) {
    error(`GK Study Notes sourceBankQuestionCount is ${notesData.sourceBankQuestionCount}; expected ${questions.length}`);
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(String(notesData.sourceBankSignature || ""))) {
    error("GK Study Notes sourceBankSignature must be a sha256: digest");
  } else {
    const expectedSignature = `sha256:${crypto.createHash("sha256").update(fs.readFileSync(dataPath)).digest("hex")}`;
    if (notesData.sourceBankSignature !== expectedSignature) {
      error(`GK Study Notes sourceBankSignature is ${notesData.sourceBankSignature}; expected ${expectedSignature}`);
    }
  }

  const topics = Array.isArray(notesData.topics) ? notesData.topics : [];
  const notes = Array.isArray(notesData.notes) ? notesData.notes : [];
  const exclusions = Array.isArray(notesData.exclusions) ? notesData.exclusions : [];
  if (!Array.isArray(notesData.topics) || !topics.length) error("GK Study Notes topics must be a nonempty array");
  if (!Array.isArray(notesData.notes)) error("GK Study Notes notes must be an array");
  if (!Array.isArray(notesData.exclusions) || !exclusions.length) {
    error("GK Study Notes exclusions must document the omitted legacy evidence");
  }

  const questionById = new Map(questions.map((question) => [question.id, question]));
  const gkQuestions = questions.filter((question) => question.categoryId === "general-knowledge");
  const gkPairs = new Map();
  for (const question of gkQuestions) {
    const pair = gkPairs.get(question.pairId) || [];
    pair.push(question);
    gkPairs.set(question.pairId, pair);
  }
  const validPair = (pair) => pair.length === 2
    && pair[0].kind === "source"
    && pair[1].kind === "similar";
  const hasStructuredEvidence = (question) => question.temporalScope
    && typeof question.temporalScope === "object"
    && !Array.isArray(question.temporalScope)
    && Array.isArray(question.references)
    && question.references.length >= 2;
  const eligiblePairs = [...gkPairs.entries()].filter(([, pair]) => (
    validPair(pair) && pair.every(hasStructuredEvidence)
  ));
  const excludedPairs = [...gkPairs.entries()].filter(([, pair]) => (
    !validPair(pair) || !pair.every(hasStructuredEvidence)
  ));
  const eligiblePairIds = eligiblePairs.map(([pairId]) => pairId);
  const excludedPairIds = excludedPairs.map(([pairId]) => pairId);
  const eligibleQuestionIds = eligiblePairs.flatMap(([, pair]) => pair.map((question) => question.id));
  const excludedQuestionIds = excludedPairs.flatMap(([, pair]) => pair.map((question) => question.id));

  if (gkQuestions.length !== gkPairs.size * 2) {
    error(`GK Study Notes source scope is not paired: ${gkQuestions.length} questions/${gkPairs.size} pairs`);
  }
  if (eligiblePairIds.length + excludedPairIds.length !== gkPairs.size) {
    error("GK Study Notes eligible and excluded scopes do not cover every GK pair");
  }
  if (excludedPairIds.length !== 18 || excludedQuestionIds.length !== 36) {
    error(`GK Study Notes legacy exclusion is ${excludedPairIds.length} pairs/${excludedQuestionIds.length} questions; expected 18/36`);
  }
  for (const [field, actual, expected] of [
    ["includedPairCount", notesData.includedPairCount, eligiblePairIds.length],
    ["includedQuestionCount", notesData.includedQuestionCount, eligibleQuestionIds.length],
    ["excludedPairCount", notesData.excludedPairCount, 18],
    ["excludedQuestionCount", notesData.excludedQuestionCount, 36]
  ]) {
    if (actual !== expected) error(`GK Study Notes ${field} is ${actual}; expected ${expected}`);
  }
  if (notes.length !== eligiblePairIds.length) error(`GK Study Notes contains ${notes.length} notes; expected ${eligiblePairIds.length}`);

  const documentedPairIds = exclusions.flatMap((entry) => Array.isArray(entry && entry.pairIds) ? entry.pairIds : []);
  const documentedQuestionIds = exclusions.flatMap((entry) => Array.isArray(entry && entry.questionIds) ? entry.questionIds : []);
  for (const [offset, exclusion] of exclusions.entries()) {
    const location = `GK Study Notes exclusion ${offset + 1}`;
    if (!exclusion || typeof exclusion !== "object" || Array.isArray(exclusion)) {
      error(`${location}: must be an object`);
      continue;
    }
    if (!String(exclusion.reason || "").trim()) error(`${location}: reason is missing`);
    const pairIds = Array.isArray(exclusion.pairIds) ? exclusion.pairIds : [];
    const questionIds = Array.isArray(exclusion.questionIds) ? exclusion.questionIds : [];
    if (exclusion.pairCount !== pairIds.length) error(`${location}: pairCount does not match pairIds`);
    if (exclusion.questionCount !== questionIds.length) error(`${location}: questionCount does not match questionIds`);
  }
  if (!jsonEqual(documentedPairIds, excludedPairIds)) {
    error(`GK Study Notes exclusions do not list the exact ${excludedPairIds.length} legacy pair IDs in bank order`);
  }
  if (!jsonEqual(documentedQuestionIds, excludedQuestionIds)) {
    error(`GK Study Notes exclusions do not list the exact ${excludedQuestionIds.length} legacy question IDs in bank order`);
  }
  if (new Set(documentedPairIds).size !== documentedPairIds.length
    || new Set(documentedQuestionIds).size !== documentedQuestionIds.length) {
    error("GK Study Notes exclusions contain duplicate IDs");
  }

  const topicIds = new Set();
  for (const [offset, topic] of topics.entries()) {
    const location = topic && topic.id ? `GK Study Notes topic ${topic.id}` : `GK Study Notes topic ${offset + 1}`;
    if (!topic || typeof topic !== "object" || Array.isArray(topic)) {
      error(`${location}: must be an object`);
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(topic.id || ""))) error(`${location}: invalid id`);
    if (topicIds.has(topic.id)) error(`${location}: duplicate id`);
    topicIds.add(topic.id);
    for (const field of ["label", "labelUrdu", "description", "descriptionUrdu"]) {
      if (!String(topic[field] || "").trim()) error(`${location}: ${field} is missing`);
    }
    if (!/[\u0600-\u06ff]/u.test(String(topic.labelUrdu || ""))
      || !/[\u0600-\u06ff]/u.test(String(topic.descriptionUrdu || ""))) {
      error(`${location}: Urdu label and description must contain Urdu script`);
    }
    if (!Number.isInteger(topic.noteCount) || topic.noteCount < 1) error(`${location}: noteCount must be positive`);
  }
  if (!topicIds.has("general-world-facts")) {
    error("GK Study Notes topics must include the general-world-facts fallback");
  }

  const noteIds = new Set();
  const representedPairIds = [];
  const representedQuestionIds = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const [offset, note] of notes.entries()) {
    const location = note && note.id ? note.id : `GK Study Note ${offset + 1}`;
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      error(`${location}: must be an object`);
      continue;
    }
    if (!String(note.id || "").trim()) error(`${location}: id is missing`);
    if (noteIds.has(note.id)) error(`${location}: duplicate id`);
    noteIds.add(note.id);
    if (note.id !== `GKNOTE-${note.pairId}`) error(`${location}: id must be derived from pairId`);
    representedPairIds.push(note.pairId);
    const pair = gkPairs.get(note.pairId);
    if (!pair || !eligiblePairIds.includes(note.pairId)) {
      error(`${location}: pairId is not an eligible General Knowledge pair`);
      continue;
    }
    if (!String(note.title || "").trim()) error(`${location}: title is missing`);
    if (!String(note.subtitleUrdu || "").trim() || !/[\u0600-\u06ff]/u.test(note.subtitleUrdu)) {
      error(`${location}: subtitleUrdu must contain a readable Urdu story summary`);
    }
    if (!String(note.memoryHookUrdu || "").trim() || !/[\u0600-\u06ff]/u.test(note.memoryHookUrdu)) {
      error(`${location}: memoryHookUrdu must contain Urdu text`);
    }
    if (!Array.isArray(note.topicIds) || !note.topicIds.length) {
      error(`${location}: topicIds must contain at least one topic or the fallback`);
    } else {
      if (new Set(note.topicIds).size !== note.topicIds.length) error(`${location}: topicIds contain duplicates`);
      for (const topicId of note.topicIds) {
        if (!topicIds.has(topicId)) error(`${location}: unknown topic ${topicId}`);
      }
    }
    const expectedImportant = pair.some((question) => question.isImportant === true);
    const expectedRepeatCount = Math.max(...pair.map((question) => (
      Number.isInteger(question.repeatCount) ? question.repeatCount : 1
    )));
    if (note.important !== expectedImportant) error(`${location}: important does not match its source pair`);
    if (note.repeatCount !== expectedRepeatCount) error(`${location}: repeatCount does not match its source pair`);
    if (!Array.isArray(note.facts) || note.facts.length !== 2) {
      error(`${location}: facts must contain exactly source then similar`);
      continue;
    }

    for (const [factOffset, fact] of note.facts.entries()) {
      const canonical = pair[factOffset];
      const factLocation = `${location} fact ${factOffset + 1}`;
      if (!fact || typeof fact !== "object" || Array.isArray(fact)) {
        error(`${factLocation}: must be an object`);
        continue;
      }
      representedQuestionIds.push(fact.questionId);
      if (!questionById.has(fact.questionId)) error(`${factLocation}: related question ID does not exist`);
      if (fact.questionId !== canonical.id) error(`${factLocation}: questionId must preserve source-then-similar order`);
      if (fact.kind !== canonical.kind) error(`${factLocation}: kind does not match canonical question`);
      if (fact.answer !== optionText(canonical.options[canonical.correctOptionIndex])) {
        error(`${factLocation}: answer does not match the canonical correct option`);
      }
      if (fact.textUrdu !== canonical.explanationUrdu) {
        error(`${factLocation}: textUrdu must exactly preserve canonical explanationUrdu`);
      }
      if (!jsonEqual(fact.source, canonical.source)) error(`${factLocation}: source differs from canonical evidence`);
      if (!jsonEqual(fact.references, canonical.references)) error(`${factLocation}: references differ from canonical evidence`);
      if (!jsonEqual(fact.temporalScope, canonical.temporalScope)) error(`${factLocation}: temporalScope differs from canonical evidence`);
      if (fact.sourceNotes !== canonical.sourceNotes) error(`${factLocation}: sourceNotes differs from canonical disclosure`);
      if (!Array.isArray(fact.references) || fact.references.length < 2) {
        error(`${factLocation}: needs at least two structured references`);
      } else if (fact.references.some((reference) => !/^https:\/\//i.test(String(reference && reference.url || "")))) {
        error(`${factLocation}: every structured reference URL must use HTTPS`);
      }
      if (!fact.source || !/^https:\/\//i.test(String(fact.source.referenceUrl || ""))) {
        error(`${factLocation}: canonical source URL must use HTTPS`);
      }
      const temporal = fact.temporalScope || {};
      if (!["static", "event-date", "as-of", "version"].includes(temporal.type)) {
        error(`${factLocation}: unsupported temporalScope type ${temporal.type}`);
      }
      if (temporal.type === "as-of") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(temporal.asOf || ""))) {
          error(`${factLocation}: as-of fact needs an exact asOf date`);
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(temporal.reverifyAfter || ""))) {
          error(`${factLocation}: as-of fact needs an exact reverifyAfter date`);
        } else if (temporal.reverifyAfter < today) {
          error(`${factLocation}: as-of evidence became overdue on ${temporal.reverifyAfter}`);
        }
      }
      if (temporal.type === "event-date" && !String(temporal.eventDate || "").trim()) {
        error(`${factLocation}: event-date fact needs eventDate`);
      }
      if (temporal.type === "version" && !String(temporal.version || "").trim()) {
        error(`${factLocation}: version fact needs its exact version label`);
      }
    }
  }

  if (!jsonEqual(representedPairIds, eligiblePairIds)) {
    error("GK Study Notes must represent each eligible GK pair exactly once in bank order");
  }
  if (!jsonEqual(representedQuestionIds, eligibleQuestionIds)) {
    error(`GK Study Notes must represent the exact ${eligibleQuestionIds.length} eligible GK question IDs in source/similar order`);
  }
  if (new Set(representedQuestionIds).size !== representedQuestionIds.length) {
    error("GK Study Notes repeat a related question ID");
  }
  for (const topic of topics) {
    const actualCount = notes.filter((note) => Array.isArray(note.topicIds) && note.topicIds.includes(topic.id)).length;
    if (topic.noteCount !== actualCount) {
      error(`GK Study Notes topic ${topic.id}: noteCount is ${topic.noteCount}; expected ${actualCount}`);
    }
  }
  findForbiddenMcqFields(notesData);
}

function validateDetailedLearning(library, questionData) {
  if (!library || typeof library !== "object") {
    error("detailed-learning.js must expose window.PPSC_DETAILED_LEARNING_DATA");
    return;
  }
  if (!Number.isInteger(library.schemaVersion) || library.schemaVersion < 1) {
    error("Detailed Learning schemaVersion must be a positive integer");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(library.generatedOn || ""))) {
    error("Detailed Learning generatedOn must use YYYY-MM-DD");
  }
  if (!Array.isArray(library.categories)) {
    error("Detailed Learning categories must be an array");
    return;
  }

  const expectedCategoryIds = (Array.isArray(questionData.categories) ? questionData.categories : [])
    .map((category) => String(category && category.id || "").trim())
    .filter(Boolean);
  const actualCategoryIds = library.categories
    .map((category) => String(category && category.id || "").trim())
    .filter(Boolean);
  if (!jsonEqual(actualCategoryIds, expectedCategoryIds)) {
    error("Detailed Learning must cover every question-bank category exactly once in canonical order");
  }
  if (new Set(actualCategoryIds).size !== actualCategoryIds.length) {
    error("Detailed Learning category IDs must be unique");
  }

  for (const [categoryOffset, category] of library.categories.entries()) {
    const categoryId = String(category && category.id || "").trim();
    const location = categoryId ? `Detailed Learning category ${categoryId}` : `Detailed Learning category ${categoryOffset + 1}`;
    if (!category || typeof category !== "object") {
      error(`${location} must be an object`);
      continue;
    }
    for (const field of ["id", "name", "title", "description"]) {
      if (!String(category[field] || "").trim()) error(`${location}: ${field} must be nonempty`);
    }
    if (!["en", "ur"].includes(category.language)) {
      error(`${location}: language must be en or ur`);
    }
    if (!["ltr", "rtl"].includes(category.direction)) {
      error(`${location}: direction must be ltr or rtl`);
    }
    if (categoryId === "urdu" && (category.language !== "ur" || category.direction !== "rtl")) {
      error(`${location}: Urdu content must use language ur and direction rtl`);
    }
    if (!Array.isArray(category.topics) || category.topics.length < 4 || category.topics.length > 6) {
      error(`${location}: topics must contain four to six reference lists`);
      continue;
    }
    const topicIds = category.topics.map((topic) => String(topic && topic.id || "").trim());
    if (topicIds.some((id) => !id) || new Set(topicIds).size !== topicIds.length) {
      error(`${location}: topic IDs must be nonempty and unique within the category`);
    }

    for (const [topicOffset, topic] of category.topics.entries()) {
      const topicId = String(topic && topic.id || "").trim();
      const topicLocation = `${location}, topic ${topicId || topicOffset + 1}`;
      if (!topic || typeof topic !== "object") {
        error(`${topicLocation} must be an object`);
        continue;
      }
      for (const field of ["title", "description", "coverage"]) {
        if (!String(topic[field] || "").trim()) error(`${topicLocation}: ${field} must be nonempty`);
      }
      if (!Array.isArray(topic.columns) || topic.columns.length < 2) {
        error(`${topicLocation}: columns must contain at least two labels`);
        continue;
      }
      const columnLabels = topic.columns.map((column) => String(column || "").trim());
      if (columnLabels.some((label) => !label) || new Set(columnLabels).size !== columnLabels.length) {
        error(`${topicLocation}: column labels must be nonempty and unique`);
      }
      if (!Array.isArray(topic.rows) || !topic.rows.length) {
        error(`${topicLocation}: rows must be a nonempty array`);
      } else {
        for (const [rowOffset, row] of topic.rows.entries()) {
          if (!Array.isArray(row)) {
            error(`${topicLocation}: row ${rowOffset + 1} must be an array`);
            continue;
          }
          if (row.length !== columnLabels.length) {
            error(`${topicLocation}: row ${rowOffset + 1} has ${row.length} cells; expected ${columnLabels.length}`);
          }
          for (const [cellOffset, cell] of row.entries()) {
            if (!String(cell ?? "").trim()) {
              error(`${topicLocation}: row ${rowOffset + 1}, cell ${cellOffset + 1} must be nonempty`);
            }
          }
        }
      }
      if (topic.asOf || topic.reverifyAfter) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(topic.asOf || ""))
          || !/^\d{4}-\d{2}-\d{2}$/.test(String(topic.reverifyAfter || ""))) {
          error(`${topicLocation}: asOf and reverifyAfter must both use YYYY-MM-DD when either is present`);
        }
      }
      if (topic.sources !== undefined && !Array.isArray(topic.sources)) {
        error(`${topicLocation}: sources must be an array when present`);
      } else if (Array.isArray(topic.sources)) {
        for (const [sourceOffset, source] of topic.sources.entries()) {
          if (!source || typeof source !== "object" || !String(source.label || "").trim()
            || !/^https:\/\//i.test(String(source.url || ""))) {
            error(`${topicLocation}: source ${sourceOffset + 1} needs a label and HTTPS URL`);
          }
        }
      }
    }
  }

  if (fs.existsSync(detailedLearningPath) && fs.statSync(detailedLearningPath).size > 512 * 1024) {
    error("data/detailed-learning.js must stay below 512 KiB for responsive static loading");
  }
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
  for (const correction of corrections) expectedAnswers[correction.id] = correction.answer;
  for (const question of questions) {
    if (isNoneOfTheseAnswer(question.options?.[question.correctOptionIndex])
      || isNoneOfTheseAnswer(question.optionsUrdu?.[question.correctOptionIndex])) {
      error(`${question.id}: correct answer must be explicit, not None of these`);
    }
  }

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

function validateComputerSourceScopes(questions) {
  const computerQuestions = questions.filter((question) => question.categoryId === "basic-computer-studies");
  const scopes = {
    all: computerQuestions,
    "initial-original": computerQuestions.filter((question) => (
      String(question.id || "").startsWith("IBES-") && question.kind === "source"
    )),
    "initial-related": computerQuestions.filter((question) => (
      String(question.id || "").startsWith("IBES-") && question.kind === "similar"
    )),
    other: computerQuestions.filter((question) => !String(question.id || "").startsWith("IBES-"))
  };
  const expected = {
    all: { total: 2564, important: 463 },
    "initial-original": { total: 1088, important: 399 },
    "initial-related": { total: 1088, important: 20 },
    other: { total: 388, important: 44 }
  };
  const isImportant = (question) => question.isImportant === true || Number(question.repeatCount) >= 2;

  for (const [scope, scopeQuestions] of Object.entries(scopes)) {
    const importantCount = scopeQuestions.filter(isImportant).length;
    if (scopeQuestions.length !== expected[scope].total) {
      error(`Basic Computer ${scope} scope count is ${scopeQuestions.length}; expected ${expected[scope].total}`);
    }
    if (importantCount !== expected[scope].important) {
      error(`Basic Computer ${scope} important count is ${importantCount}; expected ${expected[scope].important}`);
    }
  }

  if (scopes["initial-original"].some((question) => !/^IBES-Q\d{4}-SRC$/.test(String(question.id || "")))) {
    error("Basic Computer initial-original scope must contain only IBES source MCQs");
  }
  if (scopes["initial-related"].some((question) => !/^IBES-Q\d{4}-SIM$/.test(String(question.id || "")))) {
    error("Basic Computer initial-related scope must contain only IBES generated related-practice MCQs");
  }
  if (scopes.other.some((question) => !/^(?:P23[4-9]-Q\d{3}|ADV2E102-U\d{4}-Q\d{3}|WGI-Q\d{4})-(?:SRC|SIM)$/.test(String(question.id || "")))) {
    error("Basic Computer other scope must contain only PPSC 110 Edition, ADV2E102, or WGI MCQs");
  }
  if (scopes.other.filter((question) => question.kind === "source").length !== 194
        || scopes.other.filter((question) => question.kind === "similar").length !== 194) {
    error("Basic Computer other scope must contain exactly 194 source and 194 related-practice MCQs");
  }
  const scopedIds = scopes["initial-original"].concat(scopes["initial-related"], scopes.other)
    .map((question) => String(question.id));
  if (scopedIds.length !== computerQuestions.length || new Set(scopedIds).size !== computerQuestions.length) {
    error("Basic Computer source scopes must form one exclusive, complete partition of the category");
  }

  const repeatEvidence = loadReleaseRepeatEvidence();
  const ibesVerifiedSkips = repeatEvidence && Array.isArray(repeatEvidence.verifiedSkips)
    ? repeatEvidence.verifiedSkips.filter((entry) => entry.corpus === "IBES").length
    : 0;
  if (ibesVerifiedSkips !== 207 || scopes["initial-original"].length + ibesVerifiedSkips !== 1295) {
    error(`IBES source accounting is ${scopes["initial-original"].length} retained + ${ibesVerifiedSkips} repeats; expected 1,088 + 207 = 1,295 source-present MCQs`);
  }
  if (computerQuestions.some((question) => /^IBES-Q0254-(?:SRC|SIM)$/.test(String(question.id || "")))) {
    error("Basic Computer source scopes must not fabricate absent printed Q254");
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
    "category-screen", "paper-builder-card",
    "paper-setup-screen", "paper-setup-back-button",
    "quick-notes-screen", "quick-notes-back-button", "quick-notes-category",
    "quick-notes-title", "quick-notes-count", "quick-notes-language-note",
    "quick-notes-search", "quick-notes-clear-button", "quick-notes-important-only",
    "quick-notes-results-status", "quick-notes-list", "quick-notes-load-more-button",
    "quick-notes-empty",
    "gk-study-notes-card", "gk-notes-screen", "gk-notes-back-button",
    "gk-notes-search", "gk-notes-clear-button", "gk-notes-topic-filters",
    "gk-notes-important-only", "gk-notes-results-status", "gk-notes-list",
    "gk-notes-load-more-button", "gk-notes-empty",
    "detailed-learning-mode-button", "detailed-learning-screen", "detailed-learning-back-button",
    "detailed-learning-category", "detailed-learning-title", "detailed-learning-description",
    "detailed-learning-coverage", "detailed-learning-search", "detailed-learning-clear-button",
    "detailed-learning-topic-filters", "detailed-learning-results-status",
    "detailed-learning-list", "detailed-learning-empty",
    "paper-category-options", "paper-select-all-button", "paper-clear-all-button",
    "paper-selection-summary", "paper-setup-status", "paper-start-button",
    "mode-screen", "quiz-screen", "queue-screen", "results-screen", "category-grid",
    "continue-session-card", "continue-session-button", "continue-session-title", "continue-session-meta",
    "mode-category", "computer-source-panel", "computer-source-title", "computer-source-description",
    "computer-source-all", "computer-source-initial-original", "computer-source-initial-related",
    "computer-source-other", "computer-source-count-all", "computer-source-count-initial-original",
    "computer-source-count-initial-related", "computer-source-count-other",
    "study-scope-panel", "standard-mode-options", "learn-mode-button", "quiz-mode-button",
    "queue-mode-button", "queue-mode-meta", "queue-back-button",
    "queue-practice-title", "queue-practice-category", "queue-practice-status", "queue-practice-slot",
    "study-notes-mode-button", "question-range-options", "question-range-title",
    "question-range-context", "question-range-form", "question-range-start-input",
    "question-range-end-input", "question-range-help", "question-range-summary",
    "question-range-error", "question-range-submit-button", "question-range-back-button",
    "difficult-mode-button", "difficult-mode-options", "difficult-back-button",
    "difficult-count", "difficult-empty", "difficult-learn-button", "difficult-quiz-button",
    "mode-back-button",
    "question-kind", "question-text", "question-urdu-block", "question-text-urdu",
    "options-container", "action-button", "feedback",
    "retry-queue-chip", "retry-queue-count", "retry-queue-announcer",
    "retry-dialog", "retry-dialog-title", "retry-dialog-queue-meta", "retry-dialog-progress",
    "retry-question-kind", "retry-question-text", "retry-question-urdu-block",
    "retry-question-text-urdu", "retry-options-container", "retry-feedback",
    "retry-feedback-title", "retry-feedback-text", "retry-dialog-help",
    "retry-later-button", "retry-action-button",
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
  const headerStartIndex = html.search(/<header\b[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*>/i);
  const headerEndIndex = headerStartIndex < 0 ? -1 : html.indexOf("</header>", headerStartIndex);
  const retryQueueAnnouncerIndex = html.search(/\bid=["']retry-queue-announcer["']/i);
  const quizScreenIndex = html.search(/\bid=["']quiz-screen["']/i);
  if (headerStartIndex < 0 || headerEndIndex < 0) error("index.html: site header is missing");
  if (retryQueueAnnouncerIndex <= headerEndIndex || quizScreenIndex <= retryQueueAnnouncerIndex) {
    error("index.html: #retry-queue-announcer must stay globally available after the header and before the Quiz screen");
  }
  for (const removedId of [
    "global-retry-queue-button", "global-retry-queue-count", "retry-queue-card",
    "retry-queue-card-meta", "retry-repeat-gap-select", "retry-repeat-gap-status"
  ]) {
    if (new RegExp(`\\bid=["']${removedId}["']`, "i").test(html)) {
      error(`index.html: removed all-subject Queue control #${removedId} must not be present`);
    }
  }
  const queueModeButton = html.match(/<button\b[^>]*\bid=["']queue-mode-button["'][^>]*>/i)?.[0] || "";
  if (!/\btype=["']button["']/i.test(queueModeButton)
    || !/\baria-controls=["']queue-screen["']/i.test(queueModeButton)
    || /\baria-haspopup=["']dialog["']/i.test(queueModeButton)) {
    error("index.html: #queue-mode-button must open the category's full-screen Queue practice");
  }
  const queueScreen = html.match(/<section\b[^>]*\bid=["']queue-screen["'][^>]*>/i)?.[0] || "";
  if (!/\bhidden(?:\s|=|>)/i.test(queueScreen)
    || !/\baria-labelledby=["']queue-practice-title["']/i.test(queueScreen)) {
    error("index.html: #queue-screen must begin hidden and be labelled by its title");
  }
  const queueScreenStart = html.search(/<section\b[^>]*\bid=["']queue-screen["']/i);
  const queuePracticeSlotIndex = html.search(/\bid=["']queue-practice-slot["']/i);
  const queueScreenEnd = queueScreenStart < 0 ? -1 : html.indexOf("</section>", queueScreenStart);
  if (queueScreenStart < 0 || queuePracticeSlotIndex < queueScreenStart || queuePracticeSlotIndex >= queueScreenEnd) {
    error("index.html: #queue-practice-slot must be inside #queue-screen");
  }
  const computerSourcePanel = html.match(/<section\b[^>]*\bid=["']computer-source-panel["'][^>]*>/i)?.[0] || "";
  if (!/\bhidden(?:\s|=|>)/i.test(computerSourcePanel)
    || !/\baria-labelledby=["']computer-source-title["']/i.test(computerSourcePanel)) {
    error("index.html: #computer-source-panel must begin hidden and be labelled by #computer-source-title");
  }
  const computerSourceControls = [
    ["computer-source-all", "all", true],
    ["computer-source-initial-original", "initial-original", false],
    ["computer-source-initial-related", "initial-related", false],
    ["computer-source-other", "other", false]
  ];
  const computerSourceInputs = html.match(/<input\b[^>]*\bname=["']computer-source["'][^>]*>/gi) || [];
  if (computerSourceInputs.length !== 4) {
    error(`index.html: expected exactly four native computer-source radios, found ${computerSourceInputs.length}`);
  }
  for (const [id, value, checked] of computerSourceControls) {
    const input = html.match(new RegExp(`<input\\b(?=[^>]*\\bid=["']${id}["'])(?=[^>]*\\bname=["']computer-source["'])(?=[^>]*\\btype=["']radio["'])(?=[^>]*\\bvalue=["']${value}["'])[^>]*>`, "i"))?.[0] || "";
    if (!input) error(`index.html: #${id} must be a native radio named computer-source with value ${value}`);
    if (/\bchecked(?:\s|=|>)/i.test(input) !== checked) {
      error(`index.html: #${id} ${checked ? "must" : "must not"} be the default checked source scope`);
    }
    if (!new RegExp(`<label\\b[^>]*\\bfor=["']${id}["'][^>]*>`, "i").test(html)) {
      error(`index.html: #${id} must have an associated label`);
    }
  }
  const retryDialog = html.match(/<dialog\b[^>]*\bid=["']retry-dialog["'][^>]*>/i)?.[0] || "";
  if (!retryDialog) {
    error("index.html: #retry-dialog must use the native dialog element");
  } else {
    if (!/\baria-modal=["']true["']/i.test(retryDialog)) {
      error('index.html: #retry-dialog must use aria-modal="true"');
    }
    const labelledBy = retryDialog.match(/\baria-labelledby=["']([^"']+)["']/i)?.[1].trim().split(/\s+/) || [];
    if (labelledBy.join(" ") !== "retry-dialog-title retry-question-text") {
      error("index.html: #retry-dialog must be labelled by its dialog title and question text");
    }
    const describedBy = retryDialog.match(/\baria-describedby=["']([^"']+)["']/i)?.[1].trim().split(/\s+/) || [];
    if (describedBy.join(" ") !== "retry-dialog-progress retry-dialog-help") {
      error("index.html: #retry-dialog must be described by its progress and help text");
    }
    if (/\b(?:hidden|open)(?:\s|=|>)/i.test(retryDialog)) {
      error("index.html: #retry-dialog must begin closed without hidden/open attributes");
    }
  }
  const retryOptions = html.match(/<[^>]+\bid=["']retry-options-container["'][^>]*>/i)?.[0] || "";
  if (!/\brole=["']radiogroup["']/i.test(retryOptions)
    || !/\baria-labelledby=["']retry-question-text["']/i.test(retryOptions)) {
    error("index.html: #retry-options-container must be a radiogroup labelled by #retry-question-text");
  }
  const retryFeedback = html.match(/<[^>]+\bid=["']retry-feedback["'][^>]*>/i)?.[0] || "";
  if (!/\brole=["']status["']/i.test(retryFeedback)
    || !/\baria-live=["']polite["']/i.test(retryFeedback)
    || !/\bhidden(?:\s|=|>)/i.test(retryFeedback)) {
    error("index.html: #retry-feedback must begin hidden as a polite status region");
  }
  for (const id of ["retry-later-button", "retry-action-button"]) {
    const button = html.match(new RegExp(`<button\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i"))?.[0] || "";
    if (!/\btype=["']button["']/i.test(button)) {
      error(`index.html: #${id} must use type="button"`);
    }
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
  if (/\bid=["']gk-notes-entry-grid["']/i.test(html)) {
    error("index.html: Detailed GK Stories must not have a separate homepage entry");
  }
  const quickNotesStart = html.search(/<section\b[^>]*\bid=["']quick-notes-screen["']/i);
  const detailedNotesStart = html.search(/<section\b[^>]*\bid=["']gk-notes-screen["']/i);
  const detailedGkCard = html.search(/\bid=["']gk-study-notes-card["']/i);
  if (quickNotesStart < 0 || detailedNotesStart < 0 || detailedGkCard < quickNotesStart || detailedGkCard > detailedNotesStart) {
    error("index.html: #gk-study-notes-card must be nested in the Quick Notes screen, not on the homepage");
  }
  const standardModesStart = html.search(/\bid=["']standard-mode-options["']/i);
  const difficultModesStart = html.search(/<section\b[^>]*\bid=["']difficult-mode-options["']/i);
  const standardModesHtml = standardModesStart >= 0 && difficultModesStart > standardModesStart
    ? html.slice(standardModesStart, difficultModesStart)
    : "";
  if (!/\bid=["']queue-mode-button["']/i.test(standardModesHtml)) {
    error("index.html: category Queue option must appear with the standard study modes");
  }
  const standardModeButtons = standardModesHtml.match(/<button\b[^>]*\bclass=["'][^"']*\bmode-option\b[^"']*["']/gi) || [];
  if (standardModeButtons.length !== 6) {
    error(`index.html: expected six standard preparation mode buttons, found ${standardModeButtons.length}`);
  }
  const questionNumberInput = html.match(/<input\b[^>]*\bid=["']question-number-input["'][^>]*>/i)?.[0] || "";
  for (const [attribute, expectedValue] of [["type", "number"], ["min", "1"], ["step", "1"], ["inputmode", "numeric"]]) {
    if (!new RegExp(`\\b${attribute}=["']${expectedValue}["']`, "i").test(questionNumberInput)) {
      error(`index.html: #question-number-input must use ${attribute}="${expectedValue}"`);
    }
  }
  for (const id of ["question-range-start-input", "question-range-end-input"]) {
    const rangeInput = html.match(new RegExp(`<input\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i"))?.[0] || "";
    for (const [attribute, expectedValue] of [["type", "number"], ["min", "1"], ["step", "1"], ["inputmode", "numeric"]]) {
      if (!new RegExp(`\\b${attribute}=["']${expectedValue}["']`, "i").test(rangeInput)) {
        error(`index.html: #${id} must use ${attribute}="${expectedValue}"`);
      }
    }
  }
  const dataScript = html.search(/src=["']data\/questions\.js(?:\?[^"']*)?["']/);
  const gkNotesScript = html.search(/src=["']data\/gk-study-notes\.js(?:\?[^"']*)?["']/);
  const detailedLearningScript = html.search(/src=["']data\/detailed-learning\.js(?:\?[^"']*)?["']/);
  const appScript = html.search(/src=["']app\.js(?:\?[^"']*)?["']/);
  if (dataScript < 0 || gkNotesScript < 0 || detailedLearningScript < 0 || appScript < 0
    || dataScript > gkNotesScript || gkNotesScript > detailedLearningScript || detailedLearningScript > appScript) {
    error("index.html: questions.js, gk-study-notes.js and detailed-learning.js must load in that order before app.js");
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

function validateThemeContract() {
  if (!fs.existsSync(themePath)) {
    error("theme.js: required early theme bootstrap is missing");
    return;
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const theme = fs.readFileSync(themePath, "utf8");
  const styles = fs.readFileSync(stylesPath, "utf8");
  const themeScriptTag = html.match(/<script\b[^>]*\bsrc=["']theme\.js(?:\?[^"']*)?["'][^>]*><\/script>/i)?.[0] || "";
  const themeScriptIndex = themeScriptTag ? html.indexOf(themeScriptTag) : -1;
  const stylesIndex = html.search(/<link\b[^>]*\bhref=["']styles\.css(?:\?[^"']*)?["'][^>]*>/i);

  if (themeScriptIndex < 0) {
    error("index.html: theme.js must be loaded in the document head");
  } else {
    if (/\b(?:async|defer)\b/i.test(themeScriptTag)) {
      error("index.html: theme.js must load synchronously to prevent a light-theme flash");
    }
    if (stylesIndex < 0 || themeScriptIndex > stylesIndex) {
      error("index.html: theme.js must run before styles.css is requested");
    }
  }

  for (const id of ["auth-theme-toggle-button", "theme-toggle-button"]) {
    const button = html.match(new RegExp(`<button\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i"))?.[0] || "";
    if (!button || !/\bdata-theme-toggle\b/i.test(button) || !/\btype=["']button["']/i.test(button)) {
      error(`index.html: #${id} must be a safe data-theme-toggle button`);
    }
  }

  for (const requiredSnippet of [
    '"ppsc-prep:theme:v1"',
    "prefers-color-scheme: dark",
    'setAttribute("data-theme"',
    'querySelectorAll("[data-theme-toggle]")',
    'meta[name="theme-color"]',
    'window.addEventListener("storage"',
    'aria-pressed'
  ]) {
    if (!theme.includes(requiredSnippet)) {
      error(`theme.js: missing appearance contract snippet ${requiredSnippet}`);
    }
  }

  for (const requiredStyle of [
    ".theme-toggle",
    "#0d1522",
    "#172236",
    "#e7edf7",
    "#33445d"
  ]) {
    if (!styles.includes(requiredStyle)) {
      error(`styles.css: missing dark-theme contract token ${requiredStyle}`);
    }
  }
  if (!/html\[data-theme=["']dark["']\]/.test(styles)) {
    error("styles.css: missing html[data-theme=\"dark\"] overrides");
  }
}

function validateRetryQueueContract(data) {
  const app = fs.readFileSync(appPath, "utf8");
  const styles = fs.readFileSync(stylesPath, "utf8");
  const questions = Array.isArray(data && data.questions) ? data.questions : [];
  const approvedAdditiveQuestionCount = 11412;
  const approvedAdditiveSignature = "v1:11412:57e37c68";
  function appSection(startMarker, endMarker) {
    const startIndex = app.indexOf(startMarker);
    if (startIndex < 0) return null;
    const endIndex = app.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex < 0) return null;
    return app.slice(startIndex + startMarker.length, endIndex);
  }
  function appFunction(name) {
    const startIndex = app.indexOf("  function " + name + "(");
    if (startIndex < 0) return null;
    const endIndex = app.indexOf("\n  function ", startIndex + 2);
    return app.slice(startIndex, endIndex < 0 ? undefined : endIndex);
  }
  const requiredConstants = [
    ["RETRY_QUEUE_STORAGE_KEY", '"ppsc-prep:retry-queue:v1"'],
    ["RETRY_QUEUE_STORAGE_VERSION", "1"],
    ["RETRY_QUEUE_INCREMENT", "2"],
    ["LEGACY_RETRY_QUEUE_INCREMENT", "2"],
    ["PREVIOUS_RETRY_QUEUE_INCREMENT", "5"],
    ["RETRY_QUEUE_COUNT_BASELINE_VERSION", "1"],
    ["RETRY_QUEUE_COUNT_BASELINE", "5"],
    ["EMBEDDED_RETRY_CADENCE_VERSION", "4"],
    ["EMBEDDED_REVIEW_SPACING", "10"],
    ["RETRY_QUEUE_MIN_SPACING", "10"],
    ["RETRY_QUEUE_MAX_SPACING", "10"],
    ["WRONG_RETRY_MIN_SPACING", "10"],
    ["WRONG_RETRY_MAX_SPACING", "15"],
    ["DEDICATED_RETRY_DEFAULT_GAP", "5"],
    ["DEDICATED_RETRY_MAX_GAP", "10"],
    ["IMPORTANT_REVIEW_MIN_SPACING", "10"],
    ["IMPORTANT_REVIEW_MAX_SPACING", "10"],
    ["SEQUENTIAL_ORDER_VERSION", "2"],
    ["APPROVED_ADDITIVE_BANK_SIGNATURE", '"v1:11412:57e37c68"'],
    ["APPROVED_ADDITIVE_BANK_QUESTION_COUNT", "11412"],
    ["APPROVED_ADDITIVE_UPDATED_SIGNATURE", '"v1:11412:40563d50"'],
    ["APPROVED_ANSWER_TEXT_BANK_SIGNATURE", '"v1:11892:9437487f"'],
    ["APPROVED_ANSWER_TEXT_BANK_QUESTION_COUNT", "11892"],
    ["APPROVED_ANSWER_TEXT_UPDATED_SIGNATURE", '"v1:11892:57530f77"']
  ];
  for (const [name, value] of requiredConstants) {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`\\bvar\\s+${name}\\s*=\\s*${escapedValue}\\s*;`).test(app)) {
      error(`app.js: ${name} must remain ${value} for the documented spaced-retry contract`);
    }
  }
  let approvedPrefixHash = 2166136261;
  let legacyPrefix = [];
  try {
    legacyPrefix = restoreLegacyAnswerOptions(questions.slice(0, approvedAdditiveQuestionCount));
  } catch (reason) {
    error(reason.message);
  }
  legacyPrefix.forEach((question) => {
    const signatureText = JSON.stringify([
      question.id,
      question.categoryId,
      question.question,
      question.questionUrdu,
      question.correctOptionIndex,
      question.options,
      question.optionsUrdu
    ]) + "\n";
    for (let index = 0; index < signatureText.length; index += 1) {
      approvedPrefixHash ^= signatureText.charCodeAt(index);
      approvedPrefixHash = Math.imul(approvedPrefixHash, 16777619);
    }
  });
  const actualApprovedPrefixSignature = "v1:" + approvedAdditiveQuestionCount + ":"
    + (approvedPrefixHash >>> 0).toString(16);
  if (
    questions.length < approvedAdditiveQuestionCount
    || actualApprovedPrefixSignature !== approvedAdditiveSignature
  ) {
    error("question bank: approved additive migration prefix is " + actualApprovedPrefixSignature
      + "; expected " + approvedAdditiveSignature);
  }
  for (const requiredSnippet of [
    'return (state.mode === "quiz" || state.mode === "learn")',
    'learnReviewCountedQuestionIds',
    'if (state.mode === "learn") recordLearnReviewProgress(currentQuestion())',
    'function randomWrongRetrySpacing()',
    'entry.wrongRetryDueStep !== entry.dueStep',
    'wrongRetryDueStep: nextDueStep',
    'remaining: 1',
    'var DEDICATED_RETRY_GAP_OPTIONS = [3, 5, 10];',
    'dedicatedRepeatGap: DEDICATED_RETRY_DEFAULT_GAP',
    'dedicatedRecentQuestionIds: []',
    'var dedicatedSpacingApplied = Boolean(normalized)',
    'retryQueueState.dedicatedDeck = [];',
    'function nextRetrySequence()',
    'retryQueuePractice.categoryId',
    'remaining: applyCountBaseline ? RETRY_QUEUE_COUNT_BASELINE : entry.remaining',
    'countBaselineVersion: Math.max(',
    'embeddedCadenceVersion: EMBEDDED_RETRY_CADENCE_VERSION',
    'var applyEmbeddedCadence = savedEmbeddedCadenceVersion < EMBEDDED_RETRY_CADENCE_VERSION;',
    'savedValue.practiceStep + EMBEDDED_REVIEW_SPACING',
    'retryQueueState.practiceStep + randomWrongRetrySpacing()',
    'embeddedCadenceVersion: Math.max(',
    'retryQueueState.embeddedCadenceVersion = Math.max(',
    'kind: "important"',
    'scheduleNextImportantReview()',
    'importantQuestionIds'
  ]) {
    if (!app.includes(requiredSnippet)) {
      error(`app.js: missing category Queue/Important contract snippet ${requiredSnippet}`);
    }
  }
  const queueSelector = appSection(
    "function dueRetryQueueItem(",
    "function refillImportantReviewDeck(categoryId) {"
  );
  if (
    queueSelector === null
    || !/pendingQueueCycleItems\(categoryId\)/.test(queueSelector)
    || /item\.(?:dueStep|wrongRetryDueStep|remaining)/.test(queueSelector)
    || /\.sort\(/.test(queueSelector)
  ) {
    error("app.js: Queue selection must use the next pending insertion-order turn, without cooldown or count priority");
  }
  const completeRetry = appSection(
    "function completeRetryAttempt() {",
    "function postponeRetryAttempt() {"
  );
  const releaseRetry = appSection(
    "function releaseActiveRetryAttempt() {",
    "function loadDifficultQuestionIds() {"
  );
  for (const [name, section] of [["completeRetryAttempt", completeRetry], ["releaseActiveRetryAttempt", releaseRetry]]) {
    if (section === null || /moveRetryItemToTail\(item\)/.test(section)) {
      error(`app.js: ${name} must preserve Queue insertion order while completing a round turn`);
    }
  }
  if (
    completeRetry === null
    || !/beginDueImportantAttempt\([^;]*\btrue\s*\)/.test(completeRetry)
    || !/beginDueRetryAttempt\([^;]*\btrue\s*\)/.test(completeRetry)
    || /practiceStep\s*(?:\+\+|\+=)/.test(completeRetry)
  ) {
    error("app.js: correct popup answers must continue their own review type without incrementing regular-question progress");
  }
  const embeddedCoordinator = appFunction("beginDueEmbeddedReview");
  if (
    embeddedCoordinator === null
    || !/nextEmbeddedReviewStep/.test(embeddedCoordinator)
    || !/nextEmbeddedReviewKind/.test(embeddedCoordinator)
    || !/beginDueImportantAttempt\(/.test(embeddedCoordinator)
    || !/beginDueRetryAttempt\(/.test(embeddedCoordinator)
    || !/["']results["']/.test(embeddedCoordinator)
  ) {
    error("app.js: one alternating-popup coordinator must dispatch the due type and consume result-boundary turns without showing a popup");
  }
  for (const name of [
    "scheduleNextQuizReview", "scheduleNextImportantReview", "completeRetryAttempt",
    "postponeRetryAttempt", "releaseActiveRetryAttempt", "beginDedicatedRetryAttempt"
  ]) {
    const section = appFunction(name);
    if (section === null || /nextEmbeddedReview(?:Step|Kind)\s*=(?!=)/.test(section)) {
      error(`app.js: ${name} must not move the shared alternating popup checkpoint`);
    }
  }
  const emptyRetryState = appSection(
    "function createEmptyRetryQueueState() {",
    "function isSafeWholeNumber(value, minimum) {"
  );
  if (
    emptyRetryState === null
    || !/nextEmbeddedReviewStep\s*:\s*EMBEDDED_REVIEW_SPACING/.test(emptyRetryState)
    || !/nextEmbeddedReviewKind\s*:\s*["']queue["']/.test(emptyRetryState)
    || !/nextSequentialReviewStep\s*:\s*null/.test(emptyRetryState)
    || !/sequentialOrderVersion\s*:\s*SEQUENTIAL_ORDER_VERSION/.test(emptyRetryState)
    || !/sequentialTurn\s*:\s*0/.test(emptyRetryState)
    || !/sequentialIndex\s*:\s*0/.test(emptyRetryState)
    || !/sequentialQuestionId\s*:\s*allQuestions\.length\s*>\s*0/.test(emptyRetryState)
  ) {
    error("app.js: fresh Review Queue must start a Queue turn after ten main MCQs and disable Sequential while retaining v1 cursor fields");
  }

  const loadRetryState = appSection(
    "function loadRetryQueue() {",
    "function retryQueueItem(questionId) {"
  );
  if (
    loadRetryState === null
    || !/additiveBankMigrationApplied[\s\S]*?savedValue\.bankSignature\s*!==\s*questionBankSignature/.test(loadRetryState)
    || !/savedValue\.nextSequentialReviewStep\s*!==\s*null/.test(loadRetryState)
    || !/savedValue\.activeAttempt\s*&&\s*savedValue\.activeAttempt\.kind\s*===\s*["']sequential["']/.test(loadRetryState)
    || !/saveRetryQueue\(/.test(loadRetryState)
  ) {
    error("app.js: retired Sequential state and additive Queue migration must be saved for cloud/offline sync");
  }

  const normalizedRetryState = appSection(
    "function normalizeRetryQueue(savedValue) {",
    "function loadRetryQueue() {"
  );
  if (normalizedRetryState === null) {
    error("app.js: missing Review Queue normalization for retired Sequential state");
  } else {
    for (const requiredSnippet of [
      "savedValue.nextEmbeddedReviewStep",
      "savedValue.nextEmbeddedReviewKind",
      "nextEmbeddedReviewStep: nextEmbeddedReviewStep",
      "nextEmbeddedReviewKind: nextEmbeddedReviewKind",
      "savedValue.nextSequentialReviewStep",
      "savedValue.sequentialOrderVersion",
      "savedValue.sequentialTurn",
      "savedValue.sequentialIndex",
      "savedValue.sequentialQuestionId",
      "var nextSequentialReviewStep = null",
      "nextSequentialReviewStep: nextSequentialReviewStep",
      "sequentialOrderVersion: SEQUENTIAL_ORDER_VERSION",
      "sequentialTurn: sequentialTurn",
      "sequentialIndex: sequentialIndex",
      "sequentialQuestionId: sequentialQuestionId",
      "approvedAdditiveBankQuestionCount(savedValue.bankSignature)"
    ]) {
      if (!normalizedRetryState.includes(requiredSnippet)) {
        error(`app.js: retired Sequential state must preserve Queue/cursor compatibility and is missing ${requiredSnippet}`);
      }
    }
    if (!/\[\s*["']queue["']\s*,\s*["']important["']\s*,\s*["']sequential["']\s*\]\.includes\(attemptKind\)/.test(normalizedRetryState)) {
      error("app.js: legacy Sequential attempts must still be recognized for safe retirement");
    }
    if (!/savedValue\.activeAttempt\.kind\s*===\s*["']sequential["']/.test(normalizedRetryState)
      || !/savedValue\.activeAttempt\s*!==\s*null\s*&&\s*!retiredSequentialAttempt/.test(normalizedRetryState)) {
      error("app.js: saved Sequential attempts must be identified and retired without changing finite Queue counts");
    }
  }

  const saveRetryState = appSection(
    "function saveRetryQueue(announcement) {",
    "function loadRetryQueue() {"
  );
  if (
    saveRetryState === null
    || !/retryQueueState\.nextSequentialReviewStep\s*=\s*null/.test(saveRetryState)
    || !/isSequentialPracticeAttempt\(retryQueueState\.activeAttempt\)[\s\S]*?retryQueueState\.activeAttempt\s*=\s*null/.test(saveRetryState)
  ) {
    error("app.js: every Queue save must keep the retired Sequential gate and attempt disabled");
  }

  const importantSelector = appSection(
    "function nextImportantReviewQuestionId(excludedQuestionId, categoryId) {",
    "function isImportantReviewDue() {"
  );
  const activeAttemptMatcher = appSection(
    "function activeRetryAttemptMatchesSession() {",
    "function updateRetryQueueUI(announcement) {"
  );
  if (
    importantSelector === null
    || !/retryQuestionMatchesCategory\(questionId, categoryId\)/.test(importantSelector)
    || activeAttemptMatcher === null
    || !/retryQuestionMatchesCategory\(attempt\.questionId, categoryId\)/.test(activeAttemptMatcher)
  ) {
    error("app.js: Important and Queue popups must both match the active Learn/Quiz category");
  }

  const wrongQueueHelper = appSection(
    "function addWrongQuestionToRetryQueue(question) {",
    "function recordMainPractice(question, wrongAnswer) {"
  );
  if (
    wrongQueueHelper === null
    || !/item\.remaining\s*\+=\s*RETRY_QUEUE_INCREMENT/.test(wrongQueueHelper)
    || !/remaining\s*:\s*RETRY_QUEUE_INCREMENT/.test(wrongQueueHelper)
  ) {
    error("app.js: the shared wrong-answer helper must add RETRY_QUEUE_INCREMENT to old and new Queue items");
  }

  const normalizeSession = appSection(
    "function normalizeStoredSession(savedValue) {",
    "function loadActiveSession() {"
  );
  const loadSession = appSection(
    "function loadActiveSession() {",
    "function storeCurrentResponse() {"
  );
  if (
    normalizeSession === null
    || !/isApprovedAdditiveBankMigration\(savedValue\.bankSignature\)/.test(normalizeSession)
    || !/savedValue\.bankSignature\s*!==\s*questionBankSignature\s*&&\s*!additiveBankMigration/.test(normalizeSession)
    || !/rangePoolBankSignature/.test(normalizeSession)
    || loadSession === null
    || !/setItem\(SESSION_STORAGE_KEY,\s*JSON\.stringify\(activeSessionSnapshot\)\)/.test(loadSession)
    || !/notifyLocalStateChanged\(SESSION_STORAGE_KEY,\s*["']set["']\)/.test(loadSession)
  ) {
    error("app.js: approved additive session migration must freeze its saved range, rewrite the current signature and notify cloud sync");
  }
  if (
    !/function\s+approvedAdditiveBankQuestionCount\(savedSignature\)[\s\S]*?savedSignature\s*!==\s*APPROVED_ADDITIVE_BANK_SIGNATURE[\s\S]*?allQuestions\.length\s*<=\s*APPROVED_ADDITIVE_BANK_QUESTION_COUNT[\s\S]*?buildQuestionBankSignature\(APPROVED_ADDITIVE_BANK_QUESTION_COUNT\)/.test(app)
  ) {
    error("app.js: additive migration must accept only the approved signature behind an exact stable-prefix check");
  }

  const handleAction = appSection(
    "function handleAction() {",
    "function handleLearnAdvanceKeydown(event) {"
  );
  if (
    handleAction === null
    || !/if\s*\(\s*beginDueEmbeddedReview\([^)]*\)\s*\)\s*return\s*;/.test(handleAction)
    || /\bbeginDue(?:Sequential|Important|Retry)Attempt\s*\(/.test(handleAction)
  ) {
    error("app.js: main-session checkpoints must use only the shared alternating-popup coordinator");
  }
  const startQuiz = appFunction("startQuiz");
  if (startQuiz === null || !/releaseActiveRetryAttempt\(\)/.test(startQuiz)
    || /nextEmbeddedReview(?:Step|Kind)\s*=(?!=)/.test(startQuiz)) {
    error("app.js: starting another Learn or Quiz must preserve the shared popup clock while releasing its prior review safely");
  }
  if (!styles.includes(".queue-screen") && !styles.includes("#queue-screen")) {
    error("styles.css: category Queue screen needs its own full-screen layout");
  }
}

function validateLearnRevealContract() {
  const app = fs.readFileSync(appPath, "utf8");
  function appSection(startMarker, endMarker) {
    const startIndex = app.indexOf(startMarker);
    if (startIndex < 0) return null;
    const endIndex = app.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex < 0) return null;
    return app.slice(startIndex + startMarker.length, endIndex);
  }
  const prepareLearn = appSection(
    "function prepareLearnQuestion(question) {",
    "function revealLearnAnswer(question) {"
  );
  const revealLearn = appSection(
    "function revealLearnAnswer(question) {",
    "function selectOption(index) {"
  );
  const learnKeyboard = appSection(
    "function handleLearnAdvanceKeydown(event) {",
    "function handlePrevious() {"
  );

  if (!/var currentLearnAnswerRevealed = learnVisitedQuestionIds\.has\(currentLearnQuestionId\);[\s\S]*?if \(score !== 0\) return null;[\s\S]*?if \(submitted\) \{[\s\S]*?!currentLearnAnswerRevealed[\s\S]*?selectedIndex !== sessionQuestions\[currentIndex\]\.correctOptionIndex[\s\S]*?\} else if \(currentLearnAnswerRevealed \|\| selectedIndex !== null\) \{[\s\S]*?return null;[\s\S]*?\}/.test(app)) {
    error("app.js: stored Learn sessions must accept only matching hidden or revealed current-question state");
  }
  if (!/var learnAnswerRevealed = state\.learnVisitedQuestionIds instanceof Set\s*&& state\.learnVisitedQuestionIds\.has\(String\(question\.id\)\);\s*state\.selectedIndex = learnAnswerRevealed \? question\.correctOptionIndex : null;\s*state\.submitted = learnAnswerRevealed;/.test(app)) {
    error("app.js: rendering Learn must restore hidden/revealed state from learnVisitedQuestionIds");
  }

  if (prepareLearn === null) {
    error("app.js: missing two-stage prepareLearnQuestion/revealLearnAnswer flow");
  } else {
    for (const requiredSnippet of [
      "var answerRevealed = state.learnVisitedQuestionIds.has(String(question.id));",
      "state.selectedIndex = answerRevealed ? question.correctOptionIndex : null;",
      "state.submitted = answerRevealed;",
      "button.disabled = true;",
      'button.classList.toggle("is-selected", isCorrect);',
      'button.classList.toggle("is-correct", isCorrect);',
      'button.setAttribute("aria-checked", isCorrect ? "true" : "false");',
      "if (answerRevealed) showLearnFeedback(question);",
      ': "Show Answer";',
      ': "reveal";'
    ]) {
      if (!prepareLearn.includes(requiredSnippet)) {
        error(`app.js: Learn preparation is missing hidden/revealed contract snippet ${requiredSnippet}`);
      }
    }
    if (!/var isCorrect = answerRevealed\s*&& Number\(button\.dataset\.optionIndex\) === question\.correctOptionIndex;/.test(prepareLearn)) {
      error("app.js: Learn options must stay unmarked until the answer is revealed");
    }
    if (prepareLearn.includes("state.learnVisitedQuestionIds.add")) {
      error("app.js: preparing a Learn question must not mark its answer as revealed");
    }
  }

  if (revealLearn === null) {
    error("app.js: missing revealLearnAnswer for the first Learn action");
  } else {
    for (const requiredSnippet of [
      'state.mode !== "learn"',
      "state.learnVisitedQuestionIds.add(String(question.id));",
      "state.selectedIndex = question.correctOptionIndex;",
      "state.submitted = true;",
      "prepareLearnQuestion(question);",
      "saveActiveSession();"
    ]) {
      if (!revealLearn.includes(requiredSnippet)) {
        error(`app.js: revealLearnAnswer is missing contract snippet ${requiredSnippet}`);
      }
    }
    if (revealLearn.includes("recordLearnReviewProgress") || revealLearn.includes("recordMainPractice")) {
      error("app.js: revealing a Learn answer must not advance Queue/Important cadence before the next action");
    }
  }
  if (!/if \(!state\.submitted\) \{\s*if \(state\.mode === "learn"\) revealLearnAnswer\(currentQuestion\(\)\);\s*else submitAnswer\(\);\s*return;\s*\}/.test(app)) {
    error("app.js: the first Learn action must reveal while Quiz keeps its existing submit path");
  }

  if (learnKeyboard === null) {
    error("app.js: missing Learn Space/Enter/ArrowRight keyboard handler");
  } else {
    for (const requiredSnippet of [
      'event.key === "Enter"',
      'event.key === "ArrowRight"',
      'event.code === "Space"',
      "event.defaultPrevented",
      "event.repeat",
      "event.isComposing",
      "event.ctrlKey",
      "event.altKey",
      "event.metaKey",
      "event.shiftKey",
      'state.mode !== "learn"',
      "!currentQuestion()",
      "!elements.quizScreen",
      "elements.quizScreen.hidden",
      'document.querySelector("dialog[open]")',
      '"input, textarea, select, button, a[href], [contenteditable]:not([contenteditable=\'false\'])"',
      "if (interactiveControl && interactiveControl !== elements.actionButton) return;",
      "event.preventDefault();",
      "handleAction();"
    ]) {
      if (!learnKeyboard.includes(requiredSnippet)) {
        error(`app.js: Learn keyboard handler is missing safety/shortcut snippet ${requiredSnippet}`);
      }
    }
    if (!/event\.preventDefault\(\);\s*if \(event\.repeat\) return;\s*handleAction\(\);/.test(learnKeyboard)) {
      error("app.js: Learn shortcuts must prevent native action-button activation before suppressing held-key repeats");
    }
  }
  if (!app.includes('document.addEventListener("keydown", handleLearnAdvanceKeydown);')) {
    error("app.js: Learn keyboard handler must be bound once at document level");
  }
}

function validateKeyboardControlContract() {
  const app = fs.readFileSync(appPath, "utf8");
  function appSection(startMarker, endMarker) {
    const startIndex = app.indexOf(startMarker);
    if (startIndex < 0) return null;
    const endIndex = app.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex < 0) return null;
    return app.slice(startIndex + startMarker.length, endIndex);
  }

  const moveQuizOption = appSection(
    "function moveQuizOptionSelection(event) {",
    "function onOptionKeydown(event) {"
  );
  const quizOptionKeydown = appSection(
    "function onOptionKeydown(event) {",
    "function handleQuizKeyboardShortcut(event) {"
  );
  const quizShortcut = appSection(
    "function handleQuizKeyboardShortcut(event) {",
    "function handlePrevious() {"
  );
  const retryOptionKeydown = appSection(
    "function onRetryOptionKeydown(event) {",
    "function handleRetryKeyboardShortcut(event) {"
  );
  const retryShortcut = appSection(
    "function handleRetryKeyboardShortcut(event) {",
    "function handleRetryDialogCancel(event) {"
  );

  if (!app.includes("button.tabIndex = index === 0 ? 0 : -1;")
    || !app.includes("button.tabIndex = isSelected ? 0 : -1;")) {
    error("app.js: Quiz choices must use one roving tabindex that follows keyboard selection");
  }

  if (moveQuizOption === null) {
    error("app.js: missing Quiz arrow/Home/End option-selection helper");
  } else {
    for (const requiredSnippet of [
      'state.mode !== "quiz"',
      "state.submitted",
      'event.key === "Home"',
      'event.key === "End"',
      'event.key === "ArrowUp"',
      'event.key === "ArrowLeft"',
      'event.key === "ArrowDown"',
      'event.key === "ArrowRight"',
      "buttons.length - 1",
      "(currentIndex + 1) % buttons.length",
      "(currentIndex - 1 + buttons.length) % buttons.length",
      "event.preventDefault();",
      "selectOption(Number(buttons[nextIndex].dataset.optionIndex));",
      "buttons[nextIndex].focus({ preventScroll: true });"
    ]) {
      if (!moveQuizOption.includes(requiredSnippet)) {
        error(`app.js: Quiz option navigation is missing contract snippet ${requiredSnippet}`);
      }
    }
  }

  if (quizOptionKeydown === null) {
    error("app.js: missing Quiz option Enter/check handler");
  } else {
    for (const requiredSnippet of [
      'state.mode !== "quiz"',
      "state.submitted",
      "event.defaultPrevented",
      '"ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"',
      "moveQuizOptionSelection(event);",
      'event.key !== "Enter"',
      "event.isComposing",
      "event.ctrlKey",
      "event.altKey",
      "event.metaKey",
      "event.shiftKey",
      "event.preventDefault();",
      "event.repeat",
      "handleAction();"
    ]) {
      if (!quizOptionKeydown.includes(requiredSnippet)) {
        error(`app.js: Quiz option keyboard handler is missing contract snippet ${requiredSnippet}`);
      }
    }
    if (!/event\.preventDefault\(\);\s*if \(event\.repeat\) return;\s*handleAction\(\);/.test(quizOptionKeydown)) {
      error("app.js: Quiz option Enter must suppress native activation before held-key repeats and Check");
    }
    if (/Space|Spacebar|event\.code\s*===\s*["']Space["']/.test(quizOptionKeydown)) {
      error("app.js: Space on an unsubmitted Quiz option must remain selection-only, not Check");
    }
  }

  if (quizShortcut === null) {
    error("app.js: missing Quiz Check/Next document-level keyboard handler");
  } else {
    for (const requiredSnippet of [
      "event.defaultPrevented",
      "event.isComposing",
      "event.ctrlKey",
      "event.altKey",
      "event.metaKey",
      "event.shiftKey",
      'state.mode !== "quiz"',
      "!currentQuestion()",
      "!elements.quizScreen",
      "elements.quizScreen.hidden",
      'document.querySelector("dialog[open]")',
      '"input, textarea, select, button, a[href], [contenteditable]:not([contenteditable=\'false\'])"',
      "if (!state.submitted)",
      'event.key !== "Enter"',
      'event.key === "ArrowRight"',
      'event.code === "Space"',
      "if (interactiveControl && interactiveControl !== elements.actionButton) return;",
      "event.preventDefault();",
      "event.repeat",
      "handleAction();"
    ]) {
      if (!quizShortcut.includes(requiredSnippet)) {
        error(`app.js: Quiz global keyboard handler is missing safety/shortcut snippet ${requiredSnippet}`);
      }
    }
    if (!/event\.preventDefault\(\);\s*if \(event\.repeat\) return;\s*handleAction\(\);/.test(quizShortcut)) {
      error("app.js: Quiz Check/Next shortcuts must prevent native action before suppressing held-key repeats");
    }
  }

  if (retryOptionKeydown === null) {
    error("app.js: missing Queue/Important option arrow handler");
  } else {
    for (const requiredSnippet of [
      "event.defaultPrevented",
      "event.isComposing",
      "event.ctrlKey",
      "event.altKey",
      "event.metaKey",
      "event.shiftKey",
      '"ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"',
      "event.preventDefault();",
      "selectRetryOption(Number(buttons[nextIndex].dataset.reviewOptionIndex));",
      "buttons[nextIndex].focus({ preventScroll: true });"
    ]) {
      if (!retryOptionKeydown.includes(requiredSnippet)) {
        error(`app.js: Queue/Important option navigation is missing guard/selection snippet ${requiredSnippet}`);
      }
    }
  }

  if (retryShortcut === null) {
    error("app.js: missing shared Queue/Important popup keyboard handler");
  } else {
    for (const requiredSnippet of [
      "retryQueueState.activeAttempt",
      "elements.retryDialog.open",
      'elements.retryDialog.hasAttribute("open")',
      "event.defaultPrevented",
      "event.isComposing",
      "event.ctrlKey",
      "event.altKey",
      "event.metaKey",
      "event.shiftKey",
      'event.key === "Enter"',
      'event.key === "ArrowRight"',
      'event.code === "Space"',
      'target.closest("[data-review-option-index]")',
      "interactiveControl !== elements.retryActionButton",
      "!retryOption",
      "event.preventDefault();",
      "event.repeat",
      "handleRetryAction();"
    ]) {
      if (!retryShortcut.includes(requiredSnippet)) {
        error(`app.js: shared Queue/Important keyboard handler is missing contract snippet ${requiredSnippet}`);
      }
    }
    if (!/if \(attempt\.submitted \? !advanceKey : event\.key !== ["']Enter["']\) return;/.test(retryShortcut)) {
      error("app.js: Queue/Important Enter must Check before submission while Space/Enter/Right Arrow Continue afterward");
    }
    if (!/event\.preventDefault\(\);\s*if \(event\.repeat\) return;\s*handleRetryAction\(\);/.test(retryShortcut)) {
      error("app.js: Queue/Important shortcuts must prevent native activation before suppressing held-key repeats");
    }
    if (/attempt\.kind\s*===|attempt\.kind\s*!==/.test(retryShortcut)) {
      error("app.js: popup keyboard controls must remain shared by finite Queue and permanent Important attempts");
    }
  }

  for (const requiredBinding of [
    'elements.optionsList.addEventListener("keydown", onOptionKeydown);',
    'elements.retryOptionsList.addEventListener("keydown", onRetryOptionKeydown);',
    'elements.retryDialog.addEventListener("keydown", handleRetryKeyboardShortcut);',
    'document.addEventListener("keydown", handleQuizKeyboardShortcut);'
  ]) {
    if (!app.includes(requiredBinding)) {
      error(`app.js: missing keyboard binding ${requiredBinding}`);
    }
  }

  for (const requiredShortcutHint of [
    'state.submitted ? "Enter Space ArrowRight" : "Enter"',
    'attempt.submitted ? "Enter Space ArrowRight" : "Enter"',
    'elements.actionButton.setAttribute("aria-keyshortcuts", "Enter Space ArrowRight");',
    'elements.retryActionButton.setAttribute("aria-keyshortcuts", "Enter Space ArrowRight");'
  ]) {
    if (!app.includes(requiredShortcutHint)) {
      error(`app.js: missing dynamic keyboard shortcut hint ${requiredShortcutHint}`);
    }
  }
}

function validateComputerSourceAppContract() {
  const app = fs.readFileSync(appPath, "utf8");
  const requiredConstants = [
    ["SESSION_STORAGE_VERSION", "8"],
    ["RANGE_SESSION_STORAGE_VERSION", "7"],
    ["LEGACY_SESSION_STORAGE_VERSION", "6"],
    ["BASIC_COMPUTER_CATEGORY_ID", '"basic-computer-studies"']
  ];
  for (const [name, value] of requiredConstants) {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`\\bvar\\s+${name}\\s*=\\s*${escapedValue}\\s*;`).test(app)) {
      error(`app.js: ${name} must remain ${value} for the Basic Computer source/session contract`);
    }
  }
  if (!/\bvar\s+COMPUTER_SOURCE_SCOPES\s*=\s*\[\s*["']all["']\s*,\s*["']initial-original["']\s*,\s*["']initial-related["']\s*,\s*["']other["']\s*\]\s*;/.test(app)) {
    error("app.js: COMPUTER_SOURCE_SCOPES must preserve all four documented values in order");
  }
}

function validateCloudSyncContract() {
  const requiredFiles = [firebaseConfigPath, firebaseSyncPath, firestoreRulesPath, pagesWorkflowPath, cloudSyncSmokePath];
  for (const filePath of requiredFiles) {
    if (!fs.existsSync(filePath)) error(`${path.relative(projectDirectory, filePath)}: required cloud-sync file is missing`);
  }
  if (requiredFiles.some((filePath) => !fs.existsSync(filePath))) return;

  const configSource = fs.readFileSync(firebaseConfigPath, "utf8");
  const syncSource = fs.readFileSync(firebaseSyncPath, "utf8");
  const rulesSource = fs.readFileSync(firestoreRulesPath, "utf8");
  const workflowSource = fs.readFileSync(pagesWorkflowPath, "utf8");
  const html = fs.readFileSync(htmlPath, "utf8");
  const app = fs.readFileSync(appPath, "utf8");
  const allowedEmail = "developerabdulnafa@gmail.com";
  const storageKeys = [
    "ppsc-prep:active-session:v1",
    "ppsc-prep:retry-queue:v1",
    "ppsc-prep:difficult-question-ids:v1"
  ];

  for (const expected of [
    allowedEmail,
    "ppsc-prep-ffe86.firebaseapp.com",
    'projectId: "ppsc-prep-ffe86"',
    'appId: "1:46143324438:web:ed212ce2b4b3d75fa09037"',
    'sdkVersion: "12.18.0"'
  ]) {
    if (!configSource.includes(expected)) error(`firebase-config.js: missing pinned value ${expected}`);
  }
  if (/private[_-]?key|service[_-]?account|google[_-]?password/i.test(configSource)) {
    error("firebase-config.js: private credentials must never be committed");
  }

  for (const storageKey of storageKeys) {
    if (!syncSource.includes(storageKey) || !app.includes(storageKey)) {
      error(`cloud sync: ${storageKey} must match in firebase-sync.js and app.js`);
    }
  }
  for (const requiredSnippet of [
    "signInWithPopup",
    "onAuthStateChanged",
    "browserLocalPersistence",
    "runTransaction",
    "getDocFromServer",
    "MAX_INLINE_BYTES",
    "MAX_CHUNK_BYTES",
    'addEventListener("offline"',
    'addEventListener("online"',
    'window.PPSC_CLOUD_APPLYING = true',
    'window.PPSC_CLOUD_READY = true',
    'importantPractice'
  ]) {
    if (!syncSource.includes(requiredSnippet)) error(`firebase-sync.js: missing ${requiredSnippet}`);
  }
  if (/location\.(?:search|hash)|URLSearchParams/.test(syncSource)) {
    error("firebase-sync.js: production authentication must not have a query/hash bypass");
  }
  if (!syncSource.includes("https://www.gstatic.com/firebasejs/12.18.0/")) {
    error("firebase-sync.js: Firebase CDN version must stay pinned to 12.18.0");
  }

  if (!rulesSource.includes(`request.auth.token.email == "${allowedEmail}"`)
    || !rulesSource.includes("request.auth.token.email_verified == true")
    || !rulesSource.includes("request.auth.uid == userId")
    || !rulesSource.includes("allow read, write: if false")) {
    error("firestore.rules: owner email/verification/UID deny-by-default contract is incomplete");
  }

  const authIds = [
    "auth-gate", "google-sign-in-button", "progress-choice-panel", "protected-app",
    "use-device-progress-button", "use-cloud-progress-button", "cloud-sync-warning",
    "cloud-sync-refresh-button", "sign-out-button"
  ];
  for (const id of authIds) {
    const matches = html.match(new RegExp(`\\bid=["']${id}["']`, "g")) || [];
    if (matches.length !== 1) error(`index.html: expected one cloud/auth #${id}, found ${matches.length}`);
  }
  const protectedApp = html.match(/<div\b[^>]*\bid=["']protected-app["'][^>]*>/i)?.[0] || "";
  if (!/\bhidden(?:\s|=|>)/i.test(protectedApp)
    || !/\binert(?:\s|=|>)/i.test(protectedApp)
    || !/\baria-hidden=["']true["']/i.test(protectedApp)) {
    error("index.html: #protected-app must begin hidden, inert and aria-hidden");
  }
  const configScript = html.search(/src=["']firebase-config\.js(?:\?[^"']*)?["']/);
  const syncScript = html.search(/src=["']firebase-sync\.js(?:\?[^"']*)?["']/);
  const dataScript = html.search(/src=["']data\/questions\.js(?:\?[^"']*)?["']/);
  if (configScript < 0 || syncScript < 0 || dataScript < 0 || configScript > syncScript || syncScript > dataScript) {
    error("index.html: Firebase config and sync must load in order before question data");
  }

  if (!app.includes('new CustomEvent("ppsc:local-state-changed"')
    || !app.includes('window.addEventListener("ppsc:cloud-ready"')
    || !app.includes("window.PPSC_APP_START")) {
    error("app.js: cloud-ready startup and local-state notification hooks are incomplete");
  }
  for (const requiredWorkflowText of [
    "node tools/cloud-sync-smoke.js",
    "firebase-config.js firebase-sync.js",
    "node --check firebase-sync.js",
    "node --check data/detailed-learning.js",
    "data/detailed-learning.js _site/data/"
  ]) {
    if (!workflowSource.includes(requiredWorkflowText)) {
      error(`pages.yml: missing cloud-sync deployment guard ${requiredWorkflowText}`);
    }
  }
}

const data = loadData();
const result = validateData(data);
const gkStudyNotesBundle = loadGkStudyNotes();
validateGkStudyNotes(gkStudyNotesBundle, data, result.questions);
const detailedLearningLibrary = loadDetailedLearning();
validateDetailedLearning(detailedLearningLibrary, data);
validateRepeatMetadata(data, result.questions);
validateKnownCorrections(result.questions);
validateIbesBank(result.questions);
validateComputerSourceScopes(result.questions);
validateAdv2e102Bank(result.questions);
validateHtml();
validateFonts();
validateThemeContract();
validateRetryQueueContract(data);
validateLearnRevealContract();
validateKeyboardControlContract();
validateComputerSourceAppContract();
validateCloudSyncContract();

console.log(`Site data: ${result.categories.length} categories, ${result.questions.length} questions.`);
console.log(`GK Study Notes: ${gkStudyNotesBundle.data && Array.isArray(gkStudyNotesBundle.data.notes) ? gkStudyNotesBundle.data.notes.length : 0} notes.`);
console.log(`Detailed Learning: ${detailedLearningLibrary && Array.isArray(detailedLearningLibrary.categories) ? detailedLearningLibrary.categories.length : 0} categories.`);
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
