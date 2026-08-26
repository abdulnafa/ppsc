"use strict";

const fs = require("fs");
const path = require("path");

const workDirectory = path.resolve(__dirname, "..", "work");
const files = fs.readdirSync(workDirectory)
  .filter((name) => /^ibes-extracted-p\d{3}-\d{3}\.json$/i.test(name))
  .sort();

// These mathematical/typographic symbols can legitimately occur in computer
// and spreadsheet MCQs. Other non-ASCII glyphs usually come from scan OCR and
// should be checked against the page image.
const allowedNonAscii = new Set([..."×÷±≤≥→←–—…²³°π√μΩ"]);
const suspiciousFragments = [
  /\b(?:com\s+uter|compü|automadc|locadon|rdless|bich|morne|inoping)\b/i,
  /\b(?:dme|dmeover|w\?tieh|doa|emac|bui|atananff)\b/i,
  /[•Üüöéæ«€�]/u,
  /(?:^|\s)[&?][a-z]{3,}/i,
  /\b(?!w3c\b)[a-z]+\d[a-z]+\b/i
];

let warningCount = 0;
const findings = [];

function add(item, field, reason, text) {
  warningCount += 1;
  findings.push({
    question: item.sourceQuestionNumber,
    page: item.sourcePdfPage,
    field,
    reason,
    text
  });
}

for (const name of files) {
  const items = JSON.parse(fs.readFileSync(path.join(workDirectory, name), "utf8"));
  for (const item of items) {
    const fields = [["question", item.question], ...(item.options || []).map((value, index) => [`option${index + 1}`, value])];
    for (const [field, raw] of fields) {
      const text = String(raw || "");
      const unexpected = [...new Set([...text].filter((character) => character.codePointAt(0) > 127 && !allowedNonAscii.has(character)))];
      if (unexpected.length) add(item, field, `unexpected glyphs: ${unexpected.join(" ")}`, text);
      if (suspiciousFragments.some((pattern) => pattern.test(text))) add(item, field, "likely OCR corruption", text);
      if (/\s{2,}/.test(text)) add(item, field, "repeated whitespace", text);
      if (/^["',.;:?\s]+$/.test(text)) add(item, field, "punctuation-only cell", text);
    }
  }
}

findings
  .sort((left, right) => left.question - right.question || left.field.localeCompare(right.field))
  .forEach((finding) => {
    console.warn(`WARN Q${finding.question} PDF p.${finding.page} ${finding.field}: ${finding.reason} — ${finding.text}`);
  });

console.log(`IBES text audit: ${files.length} files; ${warningCount} review findings.`);
