"use strict";

const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const cp1252Bytes = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]
]);
const decoder = new TextDecoder("utf-8", { fatal: true });
const suspicious = /[ÃÂâØÙÛÐÑ]/u;
const markerPattern = /[ÃÂâØÙÛÐÑ]/gu;

function markerCount(value) {
  return (value.match(markerPattern) || []).length;
}

function arabicCount(value) {
  return (value.match(/[\u0600-\u06ff]/gu) || []).length;
}

function decodeCp1252AsUtf8(value) {
  const bytes = [];
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint <= 0xff) {
      bytes.push(codePoint);
    } else if (cp1252Bytes.has(codePoint)) {
      bytes.push(cp1252Bytes.get(codePoint));
    } else {
      return null;
    }
  }
  try {
    return decoder.decode(Uint8Array.from(bytes));
  } catch {
    return null;
  }
}

function fixString(value) {
  let current = value;
  for (let pass = 0; pass < 3 && suspicious.test(current); pass += 1) {
    const decoded = decodeCp1252AsUtf8(current);
    if (!decoded) break;
    const improvesArabic = arabicCount(decoded) > arabicCount(current);
    const improvesMarkers = markerCount(decoded) < markerCount(current);
    if (!improvesArabic && !improvesMarkers) break;
    current = decoded;
  }
  return current;
}

function repair(value, stats) {
  if (typeof value === "string") {
    const repaired = fixString(value);
    if (repaired !== value) stats.changedStrings += 1;
    return repaired;
  }
  if (Array.isArray(value)) return value.map((item) => repair(item, stats));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repair(item, stats)]));
  }
  return value;
}

const inputs = process.argv.slice(2).filter((argument) => argument !== "--write");
const shouldWrite = process.argv.includes("--write");
if (!inputs.length) {
  console.error("Usage: node tools/fix-mojibake.js [--write] <json-file> [...]");
  process.exitCode = 1;
} else {
  for (const input of inputs) {
    const filePath = path.resolve(input);
    const raw = fs.readFileSync(filePath, "utf8");
    const value = JSON.parse(raw);
    const stats = { changedStrings: 0 };
    const repaired = repair(value, stats);
    const output = `${JSON.stringify(repaired, null, 2)}\n`;
    const residualMarkers = (output.match(markerPattern) || []).length;
    const arabicCharacters = (output.match(/[\u0600-\u06ff]/gu) || []).length;
    console.log(`${path.basename(filePath)}: ${stats.changedStrings} strings repaired; ${arabicCharacters} Arabic-script characters; ${residualMarkers} suspicious markers remain.`);
    if (shouldWrite && stats.changedStrings > 0) {
      const backupPath = `${filePath}.mojibake-backup`;
      if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw, "utf8");
      fs.writeFileSync(filePath, output, "utf8");
      console.log(`  wrote repaired UTF-8 JSON; backup: ${path.basename(backupPath)}`);
    }
    if (residualMarkers > 0) process.exitCode = 2;
  }
}
