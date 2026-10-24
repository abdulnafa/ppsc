#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "ocean-topics.json"), "utf8"));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data", "questions.js"), "utf8"), context);
const bank = new Map(context.window.PPSC_QUIZ_DATA.questions.map(question => [question.id, question]));
const errors = [];
const seenGroups = new Set();
const seenTopics = new Set();
const linkedIds = new Set();
let count = 0;
let linkCount = 0;
const nonempty = value => typeof value === "string" && value.trim().length > 0;
const fail = message => errors.push(message);

if (data.schemaVersion !== 1) fail("schemaVersion must be 1");
if (!Array.isArray(data.groups) || !data.groups.length) fail("at least one topic group required");
for (const group of data.groups || []) {
  if (!nonempty(group.id) || !nonempty(group.label)) fail("group id/label required");
  if (seenGroups.has(group.id)) fail(`duplicate group ${group.id}`);
  seenGroups.add(group.id);
  if (!Array.isArray(group.topics) || !group.topics.length) {
    fail(`${group.id}: at least one topic required`);
    continue;
  }
  for (const topic of group.topics) {
    count += 1;
    const label = `${group.id}/${topic.id}`;
    if (!nonempty(topic.id) || !nonempty(topic.name) || !nonempty(topic.kind) || !nonempty(topic.detail)) fail(`${label}: id/name/kind/detail required`);
    if (seenTopics.has(topic.id)) fail(`${label}: topic ID must be globally unique`);
    seenTopics.add(topic.id);
    if (!/^https:\/\//.test(topic.sourceUrl || "")) fail(`${label}: HTTPS source URL required`);
    if (!Array.isArray(topic.questionIds)) {
      fail(`${label}: questionIds array required`);
      continue;
    }
    const localIds = new Set();
    for (const id of topic.questionIds) {
      linkCount += 1;
      linkedIds.add(id);
      if (!bank.has(id)) fail(`${label}: unknown MCQ ID ${id}`);
      if (localIds.has(id)) fail(`${label}: duplicate MCQ ID ${id}`);
      localIds.add(id);
    }
  }
}
if (!seenGroups.has("oceans") || !seenGroups.has("seas")) fail("both oceans and seas groups are required");
if (count < 10) fail("ocean/sea study coverage is unexpectedly small");
if (linkedIds.size < 10) fail("too few linked MCQs");

if (errors.length) {
  console.error(`Ocean topic data: ${errors.length} error(s)`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Ocean topic data OK: ${seenGroups.size} groups, ${count} topics, ${linkedIds.size} unique MCQs, ${linkCount} topic links.`);
}
