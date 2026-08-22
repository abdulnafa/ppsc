"use strict";

const fs = require("fs");
const path = require("path");

const workDirectory = path.resolve(__dirname, "..", "work");
const expectedQuestionCounts = {
  "234": 20,
  "235": 100,
  "236": 78,
  "237": 76,
  "238": 89,
  "239": 86
};

function readItems(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.questions)) return parsed.questions;
  throw new Error(`${path.basename(filePath)} must contain an array or a questions array.`);
}

function paperNumber(item) {
  const candidates = [item.paperNumber, item.paperTitle, item.paper, item.sourcePaper];
  for (const candidate of candidates) {
    const match = String(candidate || "").match(/(?:Paper\s*)?(23[4-9])/i);
    if (match) return match[1];
  }
  return "unknown";
}

function questionNumber(item) {
  const value = item.sourceQuestionNumber ?? item.questionNumber ?? item.number;
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

const files = fs.existsSync(workDirectory)
  ? fs.readdirSync(workDirectory)
      .filter((name) => /^extracted-pages-.*\.json$/i.test(name))
      .sort()
  : [];

if (!files.length) {
  console.error("No extracted-pages-*.json files found in ppsc-project/work.");
  process.exitCode = 1;
  return;
}

const records = [];
let structuralErrors = 0;
let sourceOptionWarnings = 0;

for (const file of files) {
  const filePath = path.join(workDirectory, file);
  const items = readItems(filePath);
  for (const [index, item] of items.entries()) {
    const paper = paperNumber(item);
    const number = questionNumber(item);
    const options = Array.isArray(item.options) ? item.options : [];
    const correct = item.printedOrInferredCorrectIndex;
    const question = item.questionEnglish || item.questionUrdu || item.question;
    const problems = [];

    if (!question || !String(question).trim()) problems.push("missing question text");
    if (options.length < 2 || options.length > 4) problems.push(`has ${options.length} options`);
    if (options.length === 2 || options.length === 3) {
      sourceOptionWarnings += 1;
      if (!/only|sirf|visible|scan|cut/i.test(String(item.notes || ""))) {
        problems.push(`has ${options.length} options without a scan note`);
      }
    }
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) {
      problems.push("invalid correct index");
    }
    if (paper === "unknown") problems.push("unknown paper");
    if (!Number.isInteger(number) || number < 1) problems.push("invalid question number");

    if (problems.length) {
      structuralErrors += 1;
      console.error(`${file}[${index}]: ${problems.join(", ")}`);
    }
    records.push({ file, item, paper, number });
  }
}

const seen = new Map();
let coverageErrors = 0;

for (const record of records) {
  if (record.paper === "unknown" || !Number.isInteger(record.number)) continue;
  const key = `${record.paper}-${record.number}`;
  const group = seen.get(key) || [];
  group.push(record.file);
  seen.set(key, group);
}

for (const [paper, expectedCount] of Object.entries(expectedQuestionCounts)) {
  const missing = [];
  const duplicates = [];
  for (let number = 1; number <= expectedCount; number += 1) {
    const group = seen.get(`${paper}-${number}`) || [];
    if (!group.length) missing.push(number);
    if (group.length > 1) duplicates.push(`${number} (${group.join(", ")})`);
  }

  const found = Array.from(seen.keys()).filter((key) => key.startsWith(`${paper}-`)).length;
  console.log(`Paper ${paper}: ${found}/${expectedCount} unique questions`);
  if (missing.length) {
    coverageErrors += missing.length;
    console.error(`  Missing: ${missing.join(", ")}`);
  }
  if (duplicates.length) {
    coverageErrors += duplicates.length;
    console.error(`  Duplicates: ${duplicates.join("; ")}`);
  }
}

const expectedTotal = Object.values(expectedQuestionCounts).reduce((sum, count) => sum + count, 0);
console.log(`Total records: ${records.length}; expected unique source questions: ${expectedTotal}`);
console.log(`Structural errors: ${structuralErrors}; coverage errors: ${coverageErrors}; source option warnings: ${sourceOptionWarnings}`);

if (structuralErrors || coverageErrors) process.exitCode = 1;
