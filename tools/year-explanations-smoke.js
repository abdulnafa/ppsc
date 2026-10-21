"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
execFileSync(process.execPath, ["tools/build-year-topics.js", "--check"], { cwd: root, stdio: "pipe", windowsHide: true });
const context = { window: {} };
for (const file of ["data/questions.js", "data/year-topics.js"]) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const bank = context.window.PPSC_QUIZ_DATA;
const entries = context.window.PPSC_YEAR_TOPICS_DATA.entries;
const plain = value => JSON.parse(JSON.stringify(value));
const original = entries.map(({ id, year, era, title, description, dateLabel, questionIds, categoryIds }) =>
  ({ id, year, era, title, description, dateLabel, questionIds, categoryIds }));
assert.equal(crypto.createHash("sha256").update(JSON.stringify(original)).digest("hex"),
  "d6c22534da20ebb45fbbd67762eee487b762548de19f4ef044defd05c713f3bf",
  "The existing timeline IDs, dates, order, titles, summaries and MCQ links must not change");
assert.equal(entries.length, 914);
assert.equal(new Set(entries.map(e => e.era + ":" + e.year)).size, 273);
const byId = new Map(entries.map(e => [e.id, e]));
const questions = new Map(bank.questions.map(q => [q.id, q]));
const rank = new Map(entries.map((entry, index) => [entry.id, index]));
for (const entry of entries) {
  assert(entry.explanation && entry.explanation !== entry.description, entry.id + ": missing explanatory content");
  assert(!/[\u0600-\u06ff]/.test(entry.explanation), entry.id + ": not Roman Urdu");
  assert(entry.explanationQuestionIds.length > 0);
  const pairs = new Set(entry.questionIds.map(id => questions.get(id).pairId));
  const expected = entries.filter(other => other.id !== entry.id && other.era === entry.era
    && other.year !== entry.year && other.questionIds.some(id => pairs.has(questions.get(id).pairId))).map(e => e.id);
  assert.deepEqual(plain(entry.relatedTopicIds), plain(expected), entry.id + ": context must use explicit shared MCQ pairs only");
  assert(entry.relatedTopicIds.every((id, index, ids) => !index || rank.get(ids[index - 1]) < rank.get(id)), "Related dates out of order");
  for (const id of entry.relatedTopicIds) assert(byId.get(id).era === entry.era, "Do not guess AH/CE conversions");
}
for (const [first, second] of [
  ["pakistan-khilji-start-1290", "pakistan-khilji-end-1320"],
  ["pakistan-sir-syed-birth-1817", "pakistan-sir-syed-death-1898"],
  ["other-ghalib-birth-1797", "other-ghalib-death-1869"]
]) {
  assert(byId.get(first).relatedTopicIds.includes(second), first + ": missing start/end or birth/death context");
  assert(byId.get(second).relatedTopicIds.includes(first), second + ": missing reciprocal context");
}
const controller = fs.readFileSync(path.join(root, "years-topics.js"), "utf8");
assert(!/localStorage|sessionStorage|firestore|notifyLocalStateChanged/.test(controller), "Reading view must not mutate practice storage");
console.log(JSON.stringify({ ok: true, unchangedExistingTopics: entries.length,
  romanUrduExplanations: entries.length, yearGroups: 273,
  topicsWithRelatedDates: entries.filter(e => e.relatedTopicIds.length).length,
  canonicalQuestions: bank.questions.length,
  checks: ["original timeline preserved", "every topic explained", "existing evidence IDs and dates validated",
    "explicit-pair chronology only", "birth/death and dynasty start/end linked", "AH calendar kept separate", "read-only controller"] }, null, 2));
