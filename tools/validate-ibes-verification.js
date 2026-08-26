"use strict";

const fs = require("fs");
const path = require("path");

const workDirectory = path.resolve(__dirname, "..", "work");
const complete = process.argv.includes("--complete");
const accessedOn = "2026-08-26";

const extractionFiles = fs.readdirSync(workDirectory)
  .filter((name) => /^ibes-extracted-p\d{3}-\d{3}\.json$/i.test(name))
  .sort();
const verificationFiles = fs.readdirSync(workDirectory)
  .filter((name) => /^ibes-verification-p\d{3}-\d{3,4}\.json$/i.test(name))
  .sort();

const extracted = new Map();
for (const name of extractionFiles) {
  const items = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
  for (const item of items) {
    if (extracted.has(item.sourceQuestionNumber)) throw new Error(`Duplicate extracted Q${item.sourceQuestionNumber}`);
    extracted.set(item.sourceQuestionNumber, item);
  }
}

let errors = 0;
let warnings = 0;
const verified = new Map();

function error(location, message) {
  errors += 1;
  console.error(`ERROR ${location}: ${message}`);
}

function warning(location, message) {
  warnings += 1;
  console.warn(`WARN  ${location}: ${message}`);
}

function sameOptions(left, right) {
  return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length && left.every((value, index) => String(value) === String(right[index]));
}

for (const name of verificationFiles) {
  let items;
  try {
    items = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
  } catch (caught) {
    error(name, `cannot parse JSON: ${caught.message}`);
    continue;
  }
  if (!Array.isArray(items)) {
    error(name, "top-level value must be an array");
    continue;
  }

  for (const [offset, item] of items.entries()) {
    const number = Number(item && item.sourceQuestionNumber);
    const location = Number.isInteger(number) ? `Q${number}` : `${name}[${offset}]`;
    if (!Number.isInteger(number) || !extracted.has(number)) {
      error(location, "sourceQuestionNumber is absent from the extracted source inventory");
      continue;
    }
    if (verified.has(number)) error(location, `duplicate verification record (also in ${verified.get(number)._file})`);
    verified.set(number, { ...item, _file: name });

    const source = extracted.get(number);
    if (item.sourcePdfPage !== source.sourcePdfPage || item.sourceBookPage !== source.sourceBookPage) {
      error(location, "source page metadata differs from extraction");
    }
    const questionText = String(item.question || "").trim();
    if (!questionText || !/[A-Za-z]/.test(questionText)) error(location, "missing English question");
    if (questionText.length < 6 || /^(?:refers?\s+to|is|are)\s*[:?]?$/iu.test(questionText)) {
      error(location, "question is too short to be a complete, uniquely answerable stem");
    }
    if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => !String(option || "").trim())) {
      error(location, "must contain four nonempty options");
    } else {
      const normalized = item.options.map((option) => String(option).trim().toLowerCase());
      if (new Set(normalized).size !== 4) error(location, "verified options must be distinct");
    }
    if (!Number.isInteger(item.verifiedCorrectIndex) || item.verifiedCorrectIndex < 0 || item.verifiedCorrectIndex > 3) {
      error(location, "invalid verifiedCorrectIndex");
    }
    if (!/^https?:\/\//i.test(item.referenceUrl || "")) error(location, "missing direct HTTP(S) referenceUrl");
    if (/google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com\//i.test(item.referenceUrl || "")) {
      error(location, "referenceUrl must not be a search-results page");
    }
    if (!String(item.referenceLabel || "").trim()) error(location, "missing referenceLabel");
    if (item.accessedOn !== accessedOn) error(location, `accessedOn must be ${accessedOn}`);
    if (!['high', 'medium', 'low'].includes(item.confidence)) error(location, "invalid confidence");
    if (/[\uFFFD]|Ã.|Â.|â[€-™]/u.test(JSON.stringify(item))) error(location, "contains likely mojibake");

    if (/\b(?:whicb|thc|zatcway|microsom|omce|stcrage|nslator|signsts)\b|extreme:y/iu.test(JSON.stringify({ question: item.question, options: item.options }))) {
      error(location, "contains a known OCR-corruption token that must be repaired");
    }

    const changed = String(item.question) !== String(source.question) ||
      !sameOptions(item.options, source.options) ||
      item.verifiedCorrectIndex !== source.printedCorrectIndex;
    if (changed && !String(item.sourceNotes || "").trim()) {
      error(location, "sourceNotes is required because wording/options/key changed");
    }
  }
  console.log(`${name}: ${items.length} verification records`);
}

if (complete) {
  for (const number of extracted.keys()) {
    if (!verified.has(number)) error(`Q${number}`, "missing verification record");
  }
}

console.log(`IBES verification: ${verified.size}/${extracted.size} records; ${errors} errors; ${warnings} warnings.${complete ? " Complete mode." : " Partial mode."}`);
if (errors) process.exitCode = 1;
