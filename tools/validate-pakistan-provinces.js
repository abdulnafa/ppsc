#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "data", "pakistan-provinces-geography.json");
const bankFile = path.join(root, "data", "questions.js");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(bankFile, "utf8"), context, { filename: bankFile });
const bank = new Map(context.window.PPSC_QUIZ_DATA.questions.map(question => [question.id, question]));

const expected = ["punjab", "sindh", "kpk", "balochistan"];
const sections = ["mountains", "rivers", "barrages", "lakes"];
const allowedKinds = {
  mountains: new Set(["mountain", "range", "peak", "plateau"]),
  rivers: new Set(["river"]),
  barrages: new Set(["barrage", "headworks", "dam"]),
  lakes: new Set(["lake", "saltpan", "wetland"])
};
const errors = [];
const seen = new Map();
let count = 0;
let linked = 0;
const fail = message => errors.push(message);
const nonempty = value => typeof value === "string" && value.trim().length > 0;

if (data.schemaVersion !== 1) fail("schemaVersion must be 1");
if (!Array.isArray(data.provinces) || data.provinces.length !== 4) fail("exactly four provinces required");
const actual = (data.provinces || []).map(province => province.id);
if (actual.join(",") !== expected.join(",")) fail(`province order/IDs must be ${expected.join(", ")}`);

for (const province of data.provinces || []) {
  if (!nonempty(province.name) || !nonempty(province.overview)) fail(`${province.id}: name and overview required`);
  if (!province.sections || Object.keys(province.sections).sort().join(",") !== [...sections].sort().join(",")) {
    fail(`${province.id}: exactly four section keys required`);
    continue;
  }
  for (const section of sections) {
    const entries = province.sections[section];
    if (!Array.isArray(entries) || entries.length === 0) {
      fail(`${province.id}/${section}: at least one entry required`);
      continue;
    }
    const localIds = new Set();
    for (const entry of entries) {
      count += 1;
      const label = `${province.id}/${section}/${entry.id}`;
      if (!nonempty(entry.id) || !nonempty(entry.name) || !nonempty(entry.detail)) fail(`${label}: id/name/detail required`);
      if (!allowedKinds[section].has(entry.kind)) fail(`${label}: invalid kind ${entry.kind}`);
      if (!/^https:\/\//.test(entry.sourceUrl || "")) fail(`${label}: HTTPS source URL required`);
      if (!Array.isArray(entry.questionIds)) fail(`${label}: questionIds array required`);
      if (localIds.has(entry.id)) fail(`${label}: repeated within section`);
      localIds.add(entry.id);
      const previous = seen.get(entry.id);
      if (previous && (previous.name !== entry.name || previous.kind !== entry.kind)) fail(`${label}: shared feature identity mismatch`);
      if (previous && (!nonempty(previous.provinceNote) || !nonempty(entry.provinceNote))) fail(`${label}: shared feature needs province notes in every province`);
      if (!previous) seen.set(entry.id, entry);
      const idSet = new Set();
      for (const id of entry.questionIds || []) {
        linked += 1;
        if (!bank.has(id)) fail(`${label}: unknown MCQ ID ${id}`);
        if (idSet.has(id)) fail(`${label}: duplicate MCQ ID ${id}`);
        idSet.add(id);
      }
    }
  }
}

const forbidden = /\b(?:K2|Nanga\s+Parbat|Attabad|Satpara|Skardu|Banjosa|Rawal\s+Lake|Simly\s+Dam|Mangla\s+Dam)\b/i;
for (const province of data.provinces || []) {
  for (const section of sections) {
    for (const entry of province.sections?.[section] || []) {
      if (forbidden.test(entry.name)) fail(`${province.id}/${entry.id}: GB/AJK/ICT feature must not be assigned to a province`);
    }
  }
}

if (errors.length) {
  console.error(`Pakistan provinces data: ${errors.length} error(s)`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Pakistan provinces data OK: 4 provinces, ${count} topics, ${linked} valid MCQ links.`);
}
