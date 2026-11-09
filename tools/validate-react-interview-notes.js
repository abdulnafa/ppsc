#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "data", "react-interview-notes.json");
const scriptPath = path.join(root, "react-interview-notes.js");
const htmlPath = path.join(root, "index.html");
const pagesPath = path.join(root, ".github", "workflows", "pages.yml");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const errors = [];
const seenGroups = new Set();
const seenNotes = new Set();
let noteCount = 0;
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const fail = (message) => errors.push(message);

if (data.schemaVersion !== 1) fail("schemaVersion must be 1");
if (!nonempty(data.title)) fail("title required");
if (!Array.isArray(data.groups) || !data.groups.length) fail("at least one topic group required");

for (const group of data.groups || []) {
  if (!nonempty(group.id) || !nonempty(group.label)) fail("group id/label required");
  if (seenGroups.has(group.id)) fail(`duplicate group ${group.id}`);
  seenGroups.add(group.id);
  if (!Array.isArray(group.notes) || !group.notes.length) {
    fail(`${group.id}: at least one note required`);
    continue;
  }
  for (const note of group.notes) {
    noteCount += 1;
    const label = `${group.id}/${note.id}`;
    if (!nonempty(note.id) || !nonempty(note.question) || !nonempty(note.answer)) {
      fail(`${label}: id/question/answer required`);
    }
    if (seenNotes.has(note.id)) fail(`${label}: note ID must be globally unique`);
    seenNotes.add(note.id);
    if (note.syntax != null && typeof note.syntax !== "string") {
      fail(`${label}: syntax must be a string when present`);
    }
    if (typeof note.syntax === "string" && !note.syntax.trim()) {
      fail(`${label}: syntax must not be blank; omit the field instead`);
    }
  }
}

if (noteCount < 20) fail("React interview coverage is unexpectedly small");
if (!seenGroups.has("basics") || !seenGroups.has("hooks")) {
  fail("basics and hooks groups are required for the starter set");
}

const html = fs.readFileSync(htmlPath, "utf8");
const pages = fs.readFileSync(pagesPath, "utf8");
const script = fs.readFileSync(scriptPath, "utf8");
[
  "react-interview-notes-card",
  "react-interview-notes-screen",
  "react-interview-notes.js"
].forEach((needle) => {
  if (!html.includes(needle)) fail(`index.html missing ${needle}`);
});
if (!script.includes("PPSC_REACT_INTERVIEW_NOTES")) {
  fail("react-interview-notes.js must export PPSC_REACT_INTERVIEW_NOTES");
}
if (!script.includes("data/react-interview-notes.json")) {
  fail("react-interview-notes.js must load data/react-interview-notes.json");
}
if (!html.includes("PPSC_REACT_INTERVIEW_NOTES") && !fs.readFileSync(path.join(root, "app.js"), "utf8").includes("PPSC_REACT_INTERVIEW_NOTES")) {
  fail("app.js must initialize PPSC_REACT_INTERVIEW_NOTES");
}
if (!pages.includes("react-interview-notes.js") || !pages.includes("react-interview-notes.json")) {
  fail("pages.yml must deploy React interview notes assets");
}
if (!pages.includes("validate-react-interview-notes.js")) {
  fail("pages.yml must validate React interview notes");
}

if (errors.length) {
  console.error(`React interview notes: ${errors.length} error(s)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `React interview notes OK: ${seenGroups.size} topics, ${noteCount} notes.`
  );
}
