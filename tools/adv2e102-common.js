"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
const corpusId = "ADV2-2025-V2-E102";
const corpusPrefix = "ADV2E102";
const pairIdPattern = /^ADV2E102-U(\d{4})-Q(\d{3})$/;
const itemIdPattern = /^ADV2E102-U(\d{4})-Q(\d{3})-(SRC|SIM)$/;
const extractionFilePattern = /^adv2e102-extracted-pdf\d{4}-\d{4}\.json$/i;
const verificationFilePattern = /^adv2e102-verification-pdf\d{4}-\d{4}\.json$/i;
const decisionFilePattern = /^adv2e102-dedup-decisions-pdf\d{4}-\d{4}\.json$/i;
const enrichedFilePattern = /^enriched-adv2e102-[a-z0-9-]+\.json$/i;
const manifestPath = path.join(workDirectory, "adv2e102-source-units.json");

const allowedCategories = new Set([
  "general-knowledge",
  "pakistan-studies",
  "current-affairs",
  "islamic-studies",
  "geography",
  "basic-mathematics",
  "english",
  "urdu",
  "everyday-science",
  "basic-computer-studies",
  "job-related-finance-taxation"
]);

const referenceRoles = new Set([
  "answer-primary",
  "answer-secondary",
  "temporal-context",
  "version-scope"
]);
const referenceClasses = new Set(["primary", "official", "authoritative-secondary"]);
const referenceSupports = new Set(["answer", "wording", "temporal-scope", "version-scope", "related-fact"]);
const temporalTypes = new Set(["static", "event-date", "as-of", "version"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readArrayFiles(pattern) {
  const files = fs.existsSync(workDirectory)
    ? fs.readdirSync(workDirectory).filter((name) => pattern.test(name)).sort()
    : [];
  const records = [];
  for (const name of files) {
    const parsed = readJson(path.join(workDirectory, name));
    if (!Array.isArray(parsed)) throw new Error(`${name} must contain a JSON array.`);
    records.push(...parsed.map((record) => ({ ...record, _file: name })));
  }
  return { files, records };
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${path.basename(manifestPath)}.`);
  return readJson(manifestPath);
}

function loadCurrentBank({ includeAdv2e102 = true } = {}) {
  const dataPath = path.join(projectDirectory, "data", "questions.js");
  const code = fs.readFileSync(dataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/questions.js" });
  const questions = sandbox.window.PPSC_QUIZ_DATA && sandbox.window.PPSC_QUIZ_DATA.questions;
  if (!Array.isArray(questions)) throw new Error("Could not load PPSC_QUIZ_DATA.questions.");
  return includeAdv2e102
    ? questions
    : questions.filter((question) => !String(question.id || "").startsWith(`${corpusPrefix}-`));
}

function bankSnapshot(questions) {
  const stable = questions.map((question) => ({
    id: question.id,
    pairId: question.pairId,
    kind: question.kind,
    question: question.question,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex
  }));
  return {
    questionCount: questions.length,
    sha256: crypto.createHash("sha256").update(JSON.stringify(stable)).digest("hex").toUpperCase()
  };
}

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option || "").trim();
}

function optionIdentity(option) {
  return optionText(option).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeAliases(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/\bmicrosoft\b/g, "ms")
    .replace(/\bpower[\s-]*point\b/g, "powerpoint")
    .replace(/\be[\s-]*mail\b/g, "email")
    .replace(/\bworld\s+wide\s+web\b/g, "www")
    .replace(/\bcentral\s+processing\s+unit\b/g, "cpu")
    .replace(/\brandom\s+access\s+memory\b/g, "ram")
    .replace(/\bread\s+only\s+memory\b/g, "rom")
    .replace(/\boperating\s+system\b/g, "os")
    .replace(/\bgraphical\s+user\s+interface\b/g, "gui");
}

// Sentence punctuation is ignored, while symbols that can change a formula,
// cell reference, unit, percentage, file extension, or keyboard answer remain.
function exactFingerprint(value) {
  return normalizeAliases(value)
    .replace(/[^\p{L}\p{N}$%#@+*/=<>._\\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasMojibake(value) {
  return /[\uFFFD]|Ãƒ.|Ã‚.|Ã¢[â‚¬-â„¢]/u.test(JSON.stringify(value));
}

function validDate(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validPartialDate(value) {
  const text = String(value || "");
  if (/^\d{4}$/.test(text)) return true;
  if (/^\d{4}-\d{2}$/.test(text)) {
    const month = Number(text.slice(5));
    return month >= 1 && month <= 12;
  }
  return validDate(text);
}

function isDirectHttpsUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return !/google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com\/|search\.yahoo\.com\/search/i.test(url.href);
}

function validateReferences(references, location, addError, minimumAnswerAuthorities = 2) {
  if (!Array.isArray(references)) {
    addError(`${location}: references must be an array`);
    return { answerAuthorities: new Set(), answerUrls: new Set() };
  }

  const urls = new Set();
  const answerAuthorities = new Set();
  const answerPublishers = new Set();
  const answerUrls = new Set();
  for (const [index, reference] of references.entries()) {
    const referenceLocation = `${location}.references[${index}]`;
    if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
      addError(`${referenceLocation}: must be an object`);
      continue;
    }
    if (!isDirectHttpsUrl(reference.url)) addError(`${referenceLocation}: url must be a direct HTTPS page, not a search result`);
    if (urls.has(reference.url)) addError(`${referenceLocation}: duplicate reference URL`);
    urls.add(reference.url);
    if (!String(reference.label || "").trim()) addError(`${referenceLocation}: missing label`);
    if (!String(reference.publisher || "").trim()) addError(`${referenceLocation}: missing publisher`);
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(String(reference.authorityId || ""))) {
      addError(`${referenceLocation}: authorityId must be a stable lowercase authority slug`);
    }
    if (!referenceRoles.has(reference.role)) addError(`${referenceLocation}: invalid role`);
    if (!referenceClasses.has(reference.sourceClass)) addError(`${referenceLocation}: invalid sourceClass`);
    if (!validDate(reference.accessedOn)) addError(`${referenceLocation}: accessedOn must be a valid YYYY-MM-DD date`);
    if (!Array.isArray(reference.supports) || !reference.supports.length) {
      addError(`${referenceLocation}: supports must be a nonempty array`);
    } else if (reference.supports.some((claim) => !referenceSupports.has(claim))) {
      addError(`${referenceLocation}: supports contains an unsupported claim type`);
    }
    if (String(reference.claimSummary || "").trim().length < 12) {
      addError(`${referenceLocation}: claimSummary is too short to audit`);
    }
    if (Array.isArray(reference.supports) && reference.supports.includes("answer")) {
      answerAuthorities.add(String(reference.authorityId || "").toLowerCase());
      answerPublishers.add(String(reference.publisher || "").trim().toLowerCase());
      answerUrls.add(reference.url);
    }
  }
  if (answerAuthorities.size < minimumAnswerAuthorities) {
    addError(`${location}: needs at least ${minimumAnswerAuthorities} independent authorities supporting the answer`);
  }
  if (answerPublishers.size < minimumAnswerAuthorities) {
    addError(`${location}: answer references must name at least ${minimumAnswerAuthorities} distinct publishers`);
  }
  if (answerUrls.size < minimumAnswerAuthorities) {
    addError(`${location}: needs at least ${minimumAnswerAuthorities} distinct answer-supporting HTTPS pages`);
  }
  return { answerAuthorities, answerUrls };
}

function validateTemporalScope(scope, question, location, addError) {
  if (!scope || typeof scope !== "object" || Array.isArray(scope)) {
    addError(`${location}: temporalScope must be an object`);
    return;
  }
  if (!temporalTypes.has(scope.type)) addError(`${location}: temporalScope.type is invalid`);
  const nullableFields = ["sourcePaperDate", "asOf", "eventDate", "version", "reverifyAfter"];
  for (const field of nullableFields) {
    if (!Object.prototype.hasOwnProperty.call(scope, field)) addError(`${location}: temporalScope.${field} is required (use null when not applicable)`);
  }
  if (scope.sourcePaperDate !== null && !validPartialDate(scope.sourcePaperDate)) {
    addError(`${location}: temporalScope.sourcePaperDate must be null, YYYY, YYYY-MM, or YYYY-MM-DD`);
  }
  if (scope.type === "static") {
    if (scope.asOf !== null || scope.eventDate !== null || scope.version !== null || scope.reverifyAfter !== null) {
      addError(`${location}: static scope must use null for asOf, eventDate, version, and reverifyAfter`);
    }
    if (/\b(?:current|currently|present|latest|today|now|as\s+of)\b/i.test(String(question || ""))) {
      addError(`${location}: current/dynamic wording cannot use static temporalScope`);
    }
  } else if (scope.type === "event-date") {
    if (!validPartialDate(scope.eventDate)) addError(`${location}: event-date scope needs eventDate`);
    if (scope.asOf !== null || scope.version !== null || scope.reverifyAfter !== null) {
      addError(`${location}: event-date scope must use null for asOf, version, and reverifyAfter`);
    }
  } else if (scope.type === "as-of") {
    if (!validDate(scope.asOf)) addError(`${location}: as-of scope needs a full asOf date`);
    if (!validDate(scope.reverifyAfter)) addError(`${location}: as-of scope needs a full reverifyAfter date`);
    if (validDate(scope.asOf) && validDate(scope.reverifyAfter) && scope.reverifyAfter <= scope.asOf) {
      addError(`${location}: reverifyAfter must be later than asOf`);
    }
    if (scope.eventDate !== null || scope.version !== null) {
      addError(`${location}: as-of scope must use null for eventDate and version`);
    }
  } else if (scope.type === "version") {
    if (!String(scope.version || "").trim()) addError(`${location}: version scope needs a version value`);
    if (scope.asOf !== null || scope.eventDate !== null || scope.reverifyAfter !== null) {
      addError(`${location}: version scope must use null for asOf, eventDate, and reverifyAfter`);
    }
  }
  const requiredScopeToken = scope.type === "event-date" && scope.eventDate
    ? String(scope.eventDate).slice(0, 4)
    : scope.type === "as-of" && scope.asOf
      ? String(scope.asOf).slice(0, 4)
      : scope.type === "version" && scope.version
        ? String(scope.version)
        : "";
  if (requiredScopeToken && !String(question || "").toLowerCase().includes(requiredScopeToken.toLowerCase())) {
    addError(`${location}: question must explicitly state temporal/version scope ${requiredScopeToken}`);
  }
}

function sourceOrderKey(sourceRecordId, unitOrder = new Map()) {
  const match = String(sourceRecordId || "").match(pairIdPattern);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const unitId = `U${match[1]}`;
  const unitIndex = unitOrder.has(unitId) ? unitOrder.get(unitId) : Number(match[1]);
  return (unitIndex * 1000) + Number(match[2]);
}

module.exports = {
  allowedCategories,
  bankSnapshot,
  corpusId,
  corpusPrefix,
  decisionFilePattern,
  enrichedFilePattern,
  exactFingerprint,
  extractionFilePattern,
  hasMojibake,
  isDirectHttpsUrl,
  itemIdPattern,
  loadCurrentBank,
  loadManifest,
  manifestPath,
  normalizeAliases,
  optionIdentity,
  optionText,
  pairIdPattern,
  projectDirectory,
  readArrayFiles,
  readJson,
  sourceOrderKey,
  validDate,
  validPartialDate,
  validateReferences,
  validateTemporalScope,
  verificationFilePattern,
  workDirectory
};
