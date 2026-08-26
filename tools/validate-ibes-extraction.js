"use strict";

const fs = require("fs");
const path = require("path");

const workDirectory = path.resolve(__dirname, "..", "work");
const highestPrintedQuestionNumber = 1296;
// The supplied scan jumps from Q253 (PDF p.20) to Q255 (PDF p.21).
// Q254 is not present in the source, so it must never be fabricated merely to
// make the printed numbering contiguous.
const documentedMissingQuestions = new Set([254]);
const expectedCount = highestPrintedQuestionNumber - documentedMissingQuestions.size;
const files = fs.readdirSync(workDirectory)
  .filter((name) => /^ibes-extracted-p\d{3}-\d{3}\.json$/i.test(name))
  .sort();

let errors = 0;
let warnings = 0;
const records = [];

function error(message) {
  errors += 1;
  console.error(`ERROR ${message}`);
}

function warning(message) {
  warnings += 1;
  console.warn(`WARN  ${message}`);
}

for (const name of files) {
  const filePath = path.join(workDirectory, name);
  let items;
  try {
    items = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (caught) {
    error(`${name}: cannot parse JSON: ${caught.message}`);
    continue;
  }
  if (!Array.isArray(items)) {
    error(`${name}: top-level value must be an array`);
    continue;
  }

  for (const [offset, item] of items.entries()) {
    const location = `${name}[${offset}]`;
    if (!item || typeof item !== "object") {
      error(`${location}: item must be an object`);
      continue;
    }
    if (/[ÃƒÃ‚Ã¢Ã˜Ã™Ã›�]/u.test(JSON.stringify(item))) error(`${location}: likely mojibake`);
    if (!Number.isInteger(item.sourcePdfPage) || item.sourcePdfPage < 11 || item.sourcePdfPage > 63) {
      error(`${location}: invalid sourcePdfPage ${item.sourcePdfPage}`);
    }
    if (!Number.isInteger(item.sourceBookPage) || item.sourceBookPage !== item.sourcePdfPage - 10) {
      error(`${location}: sourceBookPage must equal sourcePdfPage - 10`);
    }
    if (!Number.isInteger(item.sourceQuestionNumber) || item.sourceQuestionNumber < 1 || item.sourceQuestionNumber > highestPrintedQuestionNumber) {
      error(`${location}: invalid sourceQuestionNumber ${item.sourceQuestionNumber}`);
    }
    if (documentedMissingQuestions.has(item.sourceQuestionNumber)) {
      error(`${location}: Q${item.sourceQuestionNumber} is absent from the supplied scan and must not be fabricated`);
    }
    if (!String(item.question || "").trim()) error(`${location}: missing question`);
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      error(`${location}: expected exactly four options`);
    } else {
      if (item.options.some((option) => !String(option || "").trim())) error(`${location}: empty option`);
      const normalized = item.options.map((option) => String(option).trim().toLowerCase());
      if (new Set(normalized).size !== normalized.length && !String(item.notes || "").trim()) {
        warning(`${location}: duplicate source options without a note`);
      }
    }
    if (!Number.isInteger(item.printedCorrectIndex) || item.printedCorrectIndex < 0 || item.printedCorrectIndex > 3) {
      error(`${location}: invalid printedCorrectIndex`);
    }
    if (!["high", "medium", "low"].includes(item.confidence)) error(`${location}: invalid confidence`);
    records.push({ ...item, extractionFile: name });
  }
  console.log(`${name}: ${items.length} records`);
}

const byNumber = new Map();
for (const record of records) {
  const group = byNumber.get(record.sourceQuestionNumber) || [];
  group.push(record);
  byNumber.set(record.sourceQuestionNumber, group);
}
for (let number = 1; number <= highestPrintedQuestionNumber; number += 1) {
  if (documentedMissingQuestions.has(number)) continue;
  const group = byNumber.get(number) || [];
  if (!group.length) error(`Missing IBES question ${number}`);
  if (group.length > 1) error(`Duplicate IBES question ${number}: ${group.map((item) => item.extractionFile).join(", ")}`);
}
for (const number of byNumber.keys()) {
  if (number < 1 || number > highestPrintedQuestionNumber) error(`Out-of-range IBES question ${number}`);
}

const exactStems = new Map();
for (const record of records) {
  const normalized = String(record.question || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!normalized) continue;
  const group = exactStems.get(normalized) || [];
  group.push(record.sourceQuestionNumber);
  exactStems.set(normalized, group);
}
for (const [stem, numbers] of exactStems) {
  if (numbers.length > 1) warning(`Exact repeated stem at Q${numbers.join(", Q")}: ${stem}`);
}

console.log(`IBES extraction: ${records.length}/${expectedCount} source-present records; ${errors} errors; ${warnings} warnings.`);
if (errors) process.exitCode = 1;
