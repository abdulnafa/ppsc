"use strict";

const fs = require("fs");
const path = require("path");

const projectDirectory = path.resolve(__dirname, "..");
const workDirectory = path.join(projectDirectory, "work");
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
const expectedPaperCounts = { 234: 20, 235: 100, 236: 78, 237: 76, 238: 89, 239: 86 };

function loadExtractionIndex() {
  const index = new Map();
  const files = fs.readdirSync(workDirectory).filter((name) => /^extracted-pages-.*\.json$/i.test(name));
  for (const name of files) {
    const records = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
    for (const record of records) {
      const titleMatch = String(record.paperTitle || "").match(/PAPER\s+(23[4-9])/i);
      const paper = Number(record.paper ?? record.paperNumber ?? (titleMatch && titleMatch[1]));
      const question = Number(record.sourceQuestionNumber ?? record.questionNumber ?? record.question);
      if (!Number.isInteger(paper) || !Number.isInteger(question)) continue;
      index.set(`P${paper}-Q${String(question).padStart(3, "0")}`, record);
    }
  }
  return index;
}

function fail(errors, location, message) {
  errors.push(`${location}: ${message}`);
}

function validateFile(filePath, extractionIndex) {
  const errors = [];
  const warnings = [];
  const absolutePath = path.resolve(filePath);
  let items;
  try {
    items = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    return { filePath: absolutePath, items: 0, errors: [`cannot parse JSON: ${error.message}`], warnings };
  }
  if (!Array.isArray(items)) {
    return { filePath: absolutePath, items: 0, errors: ["top-level value must be an array"], warnings };
  }

  const ids = new Set();
  const pairs = new Map();
  for (const [offset, item] of items.entries()) {
    const location = item && item.id ? item.id : `item ${offset + 1}`;
    if (!item || typeof item !== "object") {
      fail(errors, location, "must be an object");
      continue;
    }
    if (/[ÃÂâØÙÛ]/u.test(JSON.stringify(item))) fail(errors, location, "contains likely UTF-8 mojibake");
    if (!/^(?:P23[4-9]-Q\d{3}|USR-Q\d{4})-(SRC|SIM)$/.test(item.id || "")) fail(errors, location, "invalid id");
    if (ids.has(item.id)) fail(errors, location, "duplicate id");
    ids.add(item.id);
    if (!/^(?:P23[4-9]-Q\d{3}|USR-Q\d{4})$/.test(item.pairId || "")) fail(errors, location, "invalid pairId");
    if (item.id && item.pairId && !item.id.startsWith(`${item.pairId}-`)) fail(errors, location, "id and pairId disagree");
    if (!['source', 'similar'].includes(item.kind)) fail(errors, location, "kind must be source or similar");
    if (item.kind === "source" && !String(item.id).endsWith("-SRC")) fail(errors, location, "source id must end with -SRC");
    if (item.kind === "similar" && !String(item.id).endsWith("-SIM")) fail(errors, location, "similar id must end with -SIM");
    if (!allowedCategories.has(item.categoryId)) fail(errors, location, `unknown category ${item.categoryId}`);
    if (!String(item.question || "").trim()) fail(errors, location, "empty question");
    if (String(item.question || "").trim() && !/[A-Za-z]/.test(item.question)) {
      fail(errors, location, "question needs an English instruction; preserve only essential Urdu test text");
    }
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      fail(errors, location, "must have exactly four options");
    } else {
      if (item.options.some((option) => !String(typeof option === "object" ? option.text : option).trim())) {
        fail(errors, location, "has an empty option");
      }
      const normalized = item.options.map((option) => String(typeof option === "object" ? option.text : option).trim().toLowerCase());
      if (new Set(normalized).size !== normalized.length) fail(errors, location, "has duplicate options");
    }
    if (!Number.isInteger(item.correctOptionIndex) || item.correctOptionIndex < 0 || item.correctOptionIndex > 3) {
      fail(errors, location, "invalid zero-based correctOptionIndex");
    }
    const explanation = String(item.explanationUrdu || "").trim();
    if (explanation.length < 40) fail(errors, location, "Urdu explanation is too short");
    if (explanation && !/[\u0600-\u06ff]/u.test(explanation)) fail(errors, location, "explanation does not contain Urdu script");
    const source = item.source || {};
    if (!['book', 'practice', 'user'].includes(source.type)) fail(errors, location, "invalid source.type");
    if (item.kind === "source" && String(item.id).startsWith("P") && source.type !== "book") fail(errors, location, "PDF source item must use source.type book");
    if (item.kind === "source" && String(item.id).startsWith("USR-") && source.type !== "user") fail(errors, location, "user-supplied source item must use source.type user");
    if (item.kind === "similar" && source.type !== "practice") fail(errors, location, "similar item must use source.type practice");
    if (!String(source.label || "").trim()) fail(errors, location, "missing source.label");
    if (!/^https?:\/\//i.test(source.referenceUrl || "")) fail(errors, location, "missing researched HTTP(S) URL");
    if (/google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com\//i.test(source.referenceUrl || "")) {
      fail(errors, location, "referenceUrl must not be a search-results page");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.accessedOn || "") || Number.isNaN(Date.parse(`${source.accessedOn}T00:00:00Z`))) {
      fail(errors, location, "accessedOn must be a valid YYYY-MM-DD date");
    }
    if (!Array.isArray(item.tags) || item.tags.length === 0) warnings.push(`${location}: no tags`);
    if (!String(item.verificationStatus || "").trim()) fail(errors, location, "missing verificationStatus");
    const extracted = extractionIndex.get(item.pairId);
    if (String(item.pairId).startsWith("P") && !extracted) {
      fail(errors, location, "pairId not found in extracted PDF inventory");
    } else if (
      extracted &&
      item.kind === "source" &&
      Number.isInteger(extracted.printedOrInferredCorrectIndex) &&
      extracted.printedOrInferredCorrectIndex !== item.correctOptionIndex &&
      !String(item.sourceNotes || "").trim()
    ) {
      fail(errors, location, "verified answer differs from the printed key but sourceNotes does not explain why");
    }

    const pair = pairs.get(item.pairId) || [];
    pair.push(item);
    pairs.set(item.pairId, pair);
  }

  for (const [pairId, pair] of pairs) {
    const kinds = pair.map((item) => item.kind).sort().join(",");
    if (pair.length !== 2 || kinds !== "similar,source") fail(errors, pairId, "must contain one source and one similar item");
    if (pair.length === 2 && pair[0].categoryId !== pair[1].categoryId) fail(errors, pairId, "paired items must share a category");
    if (pair.length === 2 && pair[0].question.trim().toLowerCase() === pair[1].question.trim().toLowerCase()) {
      fail(errors, pairId, "similar question duplicates the source wording");
    }
  }

  const fullMatch = path.basename(absolutePath).match(/^enriched-paper-(23[4-9])\.json$/i);
  if (fullMatch) {
    const paper = Number(fullMatch[1]);
    const expectedPairs = expectedPaperCounts[paper];
    if (pairs.size !== expectedPairs) fail(errors, path.basename(absolutePath), `has ${pairs.size} pairs; expected ${expectedPairs}`);
    for (let question = 1; question <= expectedPairs; question += 1) {
      const pairId = `P${paper}-Q${String(question).padStart(3, "0")}`;
      if (!pairs.has(pairId)) fail(errors, path.basename(absolutePath), `missing ${pairId}`);
    }
  }

  return { filePath: absolutePath, items: items.length, pairs: pairs.size, errors, warnings };
}

const inputs = process.argv.slice(2);
const files = inputs.length
  ? inputs.map((input) => path.resolve(input))
  : fs.readdirSync(workDirectory)
    .filter((name) => /^enriched-paper-23[4-9](?:-q\d{3}-\d{3})?\.json$/i.test(name) || name === "custom-questions.json")
    .sort()
    .map((name) => path.join(workDirectory, name));

if (!files.length) {
  console.error("No enriched paper files found.");
  process.exitCode = 1;
} else {
  const extractionIndex = loadExtractionIndex();
  let errorCount = 0;
  let warningCount = 0;
  for (const file of files) {
    const result = validateFile(file, extractionIndex);
    errorCount += result.errors.length;
    warningCount += result.warnings.length;
    console.log(`${path.basename(result.filePath)}: ${result.items} items, ${result.pairs || 0} pairs, ${result.errors.length} errors, ${result.warnings.length} warnings`);
    result.errors.forEach((message) => console.error(`  ERROR ${message}`));
    result.warnings.forEach((message) => console.warn(`  WARN  ${message}`));
  }
  console.log(`Enriched validation: ${errorCount} errors, ${warningCount} warnings.`);
  if (errorCount) process.exitCode = 1;
}
