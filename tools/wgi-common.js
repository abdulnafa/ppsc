"use strict";

const fs = require("fs");
const path = require("path");
const {
  allowedCategories,
  hasMojibake,
  optionIdentity,
  optionText,
  validateReferences,
  validateTemporalScope
} = require("./adv2e102-common");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const corpusId = "WGI-ONE-PAPER-2026";
const corpusPrefix = "WGI";
const pairIdPattern = /^WGI-Q(\d{4})$/;
const itemIdPattern = /^WGI-Q(\d{4})-(SRC|SIM)$/;
const reviewFilePattern = /^wgi-reviewed-q(\d{4})-(\d{4})\.json$/i;
const extractionPath = path.join(workDirectory, "wgi-extracted-q0001-0671.json");
const manifestPath = path.join(workDirectory, "wgi-source-manifest.json");
const optionLabels = ["A", "B", "C", "D"];
const decisionActions = new Set(["keep", "skip", "reject"]);
const verificationDate = "2026-10-12";
const followupVerificationDate = "2026-10-14";
const releaseTarget = Object.freeze({ firstQuestionNumber: 1, lastQuestionNumber: 450, decisionCount: 450 });
const genericReferenceUrls = new Set([
  "https://openstax.org/books/biology-2e/pages/6-introduction",
  "https://www.britannica.com/science/biology",
  "https://openstax.org/books/chemistry-2e/pages/1-introduction",
  "https://www.britannica.com/science/chemistry",
  "https://www.britannica.com/place/Belgium",
  "https://education.nationalgeographic.org/resource/geography/",
  "https://na.gov.pk/en/constitution.php",
  "https://www.britannica.com/place/Pakistan",
  "https://www.britannica.com/topic/history-of-the-world",
  "https://www.history.com/topics",
  "https://www.worldbank.org/en/country/pakistan",
  "https://www.reuters.com/world/",
  "https://www.fifa.com/tournaments",
  "https://olympics.com/ioc/olympic-games",
  "https://openstax.org/subjects/math",
  "https://www.khanacademy.org/math",
  "https://support.microsoft.com/en-us/office",
  "https://learn.microsoft.com/en-us/office/",
  "https://www.who.int/health-topics",
  "https://www.ncbi.nlm.nih.gov/books/",
  "https://www.britannica.com/art/painting",
  "https://www.louvre.fr/en/explore"
]);

function verificationDateFor(number) {
  return number > 350 ? followupVerificationDate : verificationDate;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${path.basename(manifestPath)}.`);
  return readJson(manifestPath);
}

function getReleaseTarget(manifest) {
  const actual = manifest && manifest.releaseTarget;
  if (!actual || Object.entries(releaseTarget).some(([field, expected]) => actual[field] !== expected)) {
    throw new Error("WGI manifest releaseTarget must pin exactly 450 contiguous decisions for items 1..450.");
  }
  return releaseTarget;
}

function assertCompleteReleaseDecisions(records, target = releaseTarget) {
  if (records.length !== target.decisionCount) {
    throw new Error(`WGI release requires ${target.decisionCount} decisions for items ${target.firstQuestionNumber}..${target.lastQuestionNumber}; found ${records.length}.`);
  }
  const byNumber = new Map();
  for (const record of records) {
    const number = record && record.sourceQuestionNumber;
    if (!Number.isInteger(number) || number < target.firstQuestionNumber || number > target.lastQuestionNumber) {
      throw new Error(`WGI release contains an invalid or over-target decision for item ${number}.`);
    }
    if (byNumber.has(number)) throw new Error(`WGI release repeats decision for item ${number}.`);
    if (record.sourceRecordId !== sourceRecordId(number) || record.corpusId !== corpusId
      || record.reviewStatus !== "verified" || !decisionActions.has(record.action)) {
      throw new Error(`WGI release item ${number} lacks a valid verified decision identity/action.`);
    }
    const fileMatch = String(record._file || "").match(reviewFilePattern);
    if (!fileMatch || number < Number(fileMatch[1]) || number > Number(fileMatch[2])) {
      throw new Error(`WGI release item ${number} is outside its review file range.`);
    }
    byNumber.set(number, record);
  }
  for (let number = target.firstQuestionNumber; number <= target.lastQuestionNumber; number += 1) {
    if (!byNumber.has(number)) throw new Error(`WGI release is missing decision for item ${number}.`);
  }
}

function loadExtraction() {
  if (!fs.existsSync(extractionPath)) throw new Error(`Missing ${path.basename(extractionPath)}.`);
  return readJson(extractionPath);
}

function readReviewFiles() {
  const files = fs.existsSync(workDirectory)
    ? fs.readdirSync(workDirectory).filter((name) => reviewFilePattern.test(name)).sort()
    : [];
  const records = [];
  for (const name of files) {
    let value;
    try {
      value = readJson(path.join(workDirectory, name));
    } catch (error) {
      throw new Error(`${name}: ${error.message}`);
    }
    if (!Array.isArray(value)) throw new Error(`${name} must contain a JSON array.`);
    records.push(...value.map((record) => ({ ...record, _file: name })));
  }
  return { files, records };
}

function sourceRecordId(number) {
  return `WGI-Q${String(number).padStart(4, "0")}`;
}

function validateQuestion(question, expectedPairId, expectedKind, location, addError) {
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    addError(`${location}: question must be an object`);
    return;
  }
  const expectedId = `${expectedPairId}-${expectedKind === "source" ? "SRC" : "SIM"}`;
  const questionNumber = Number((String(expectedPairId).match(pairIdPattern) || [])[1]);
  const expectedVerificationDate = verificationDateFor(questionNumber);
  if (question.id !== expectedId) addError(`${location}: id must be ${expectedId}`);
  if (question.pairId !== expectedPairId) addError(`${location}: pairId must be ${expectedPairId}`);
  if (question.kind !== expectedKind) addError(`${location}: kind must be ${expectedKind}`);
  if (!allowedCategories.has(question.categoryId)) addError(`${location}: invalid categoryId ${question.categoryId}`);
  if (String(question.question || "").trim().length < 8) addError(`${location}: question text is too short`);
  if (!/[A-Za-z\u0600-\u06ff]/u.test(String(question.question || ""))) addError(`${location}: question has no readable letters`);
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    addError(`${location}: exactly four options are required`);
  } else {
    const identities = question.options.map(optionIdentity);
    if (identities.some((value) => !value)) addError(`${location}: option text cannot be empty`);
    if (new Set(identities).size !== 4) addError(`${location}: options must be distinct`);
  }
  if (!Number.isInteger(question.correctOptionIndex) || question.correctOptionIndex < 0 || question.correctOptionIndex > 3) {
    addError(`${location}: correctOptionIndex must be 0..3`);
  }
  if (String(question.questionUrdu || "").trim().length < 5 || !/[\u0600-\u06ff]/u.test(String(question.questionUrdu || ""))) {
    addError(`${location}: useful Urdu question translation is required`);
  }
  if (String(question.explanationUrdu || "").trim().length < 20 || !/[\u0600-\u06ff]/u.test(String(question.explanationUrdu || ""))) {
    addError(`${location}: useful Urdu explanation is required`);
  }
  if (questionNumber > 350) {
    if (String(question.questionUrdu || "").startsWith("یہ سوال ")) {
      addError(`${location}: generic Urdu-question boilerplate is not a translation`);
    }
    if (String(question.explanationUrdu || "").includes("یہ حقیقت معتبر ذرائع سے تصدیق شدہ ہے")) {
      addError(`${location}: generic Urdu explanation must be replaced with a fact-specific explanation`);
    }
  }
  if (question.categoryId === "urdu") {
    if (!Array.isArray(question.optionsUrdu) || question.optionsUrdu.length !== 4) {
      addError(`${location}: Urdu-category MCQ needs four optionsUrdu values`);
    } else if (question.optionsUrdu.some((value) => !/[\u0600-\u06ff]/u.test(String(value || "")))) {
      addError(`${location}: every Urdu-category option must use Urdu script`);
    }
  }
  if (!question.source || typeof question.source !== "object" || Array.isArray(question.source)) {
    addError(`${location}: source metadata is required`);
  } else {
    const expectedType = expectedKind === "source" ? "book" : "practice";
    if (question.source.type !== expectedType) addError(`${location}: source.type must be ${expectedType}`);
    if (!String(question.source.label || "").trim()) addError(`${location}: source.label is required`);
    if (!String(question.source.referenceUrl || "").startsWith("https://")) addError(`${location}: source.referenceUrl must be HTTPS`);
    if (question.source.accessedOn !== expectedVerificationDate) addError(`${location}: source.accessedOn must be ${expectedVerificationDate}`);
  }
  const expectedTag = expectedPairId.toLowerCase();
  if (!Array.isArray(question.tags)
    || !question.tags.includes("wgi")
    || !question.tags.includes(expectedTag)) {
    addError(`${location}: tags must include wgi and ${expectedTag}`);
  }
  if (question.verificationStatus !== "verified") addError(`${location}: verificationStatus must be verified`);
  const referenceResult = validateReferences(question.references, location, addError, 2);
  if (questionNumber > 350 && Array.isArray(question.references)) {
    for (const [index, reference] of question.references.entries()) {
      if (reference && reference.accessedOn !== expectedVerificationDate) {
        addError(`${location}.references[${index}]: accessedOn must be ${expectedVerificationDate}`);
      }
      if (reference && genericReferenceUrls.has(reference.url)) {
        addError(`${location}.references[${index}]: broad category landing page is not question-level evidence`);
      }
      if (reference && /provides an independent (?:related-fact|answer) reference for/i.test(String(reference.claimSummary || ""))) {
        addError(`${location}.references[${index}]: generic evidence summary must be replaced with a supported claim`);
      }
    }
  }
  const answerHosts = new Set((Array.isArray(question.references) ? question.references : [])
    .filter((reference) => Array.isArray(reference && reference.supports) && reference.supports.includes("answer"))
    .map((reference) => {
      try {
        return new URL(String(reference.url || "")).hostname.toLowerCase().replace(/^www\./, "");
      } catch {
        return "";
      }
    })
    .filter(Boolean));
  if (answerHosts.size < 2) addError(`${location}: answer verification must use at least two different websites`);
  if (question.source && !referenceResult.answerUrls.has(question.source.referenceUrl)) {
    addError(`${location}: source.referenceUrl must be an answer-supporting reference`);
  }
  validateTemporalScope(question.temporalScope, question.question, location, addError);
  if (hasMojibake(question)) addError(`${location}: likely UTF-8 mojibake detected`);

  const numericTokens = [...new Set(String(question.question || "").match(/\d+(?:[.,]\d+)*/g) || [])];
  for (const token of numericTokens) {
    if (!String(question.questionUrdu || "").includes(token)) {
      addError(`${location}: questionUrdu must preserve numeric token ${token}`);
    }
  }
}

function retainedQuestions(records) {
  return records
    .filter((record) => record.action === "keep")
    .sort((left, right) => left.sourceQuestionNumber - right.sourceQuestionNumber)
    .flatMap((record) => [record.sourceQuestion, record.similarQuestion])
    .filter(Boolean);
}

module.exports = {
  assertCompleteReleaseDecisions,
  corpusId,
  corpusPrefix,
  decisionActions,
  getReleaseTarget,
  extractionPath,
  itemIdPattern,
  loadExtraction,
  loadManifest,
  manifestPath,
  optionLabels,
  optionText,
  pairIdPattern,
  projectDirectory,
  readReviewFiles,
  releaseTarget,
  retainedQuestions,
  reviewFilePattern,
  sourceRecordId,
  verificationDateFor,
  validateQuestion,
  workDirectory
};
