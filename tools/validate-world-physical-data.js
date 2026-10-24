#!/usr/bin/env node
"use strict";

/** Check the curated physical-geography map layers and their MCQ links. */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const validKinds = new Set([
  "ocean", "sea", "gulf", "strait", "river", "lake", "dam", "barrage",
  "reservoir", "canal", "mountain", "peak", "range", "plateau", "desert", "pass", "glacier"
]);
const layers = [
  {
    file: "data/world-physical-water.json",
    label: "water"
  },
  {
    file: "data/world-physical-terrain.json",
    label: "terrain and marine"
  }
];

const questionScope = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "data/questions.js"), "utf8"),
  questionScope,
  { timeout: 20000 }
);
const questions = questionScope.window.PPSC_QUESTIONS;
if (!Array.isArray(questions) || !questions.length) {
  throw new Error("Question bank did not load for physical-map validation.");
}
const questionsById = new Map(questions.map((question) => [question.id, question]));
if (questionsById.size !== questions.length) {
  throw new Error("Question bank contains duplicate IDs.");
}

function normalizedName(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function validPoint(point) {
  return Array.isArray(point) && point.length === 2 &&
    Number.isFinite(point[0]) && Number.isFinite(point[1]) &&
    point[0] >= -180 && point[0] <= 180 &&
    point[1] >= -90 && point[1] <= 90;
}

function validSourceUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname.includes(".") &&
      !["example.com", "example.org", "localhost"].includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function aliasMatcher(alias) {
  const normalizedAlias = normalizedName(alias);
  const latinToken = /^[a-z0-9 .'-]+$/i.test(normalizedAlias);
  if (!latinToken) return (haystack) => haystack.includes(normalizedAlias);
  const escaped = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp("(^|[^a-z0-9])" + escaped + "(?=$|[^a-z0-9])", "i");
  return (haystack) => pattern.test(haystack);
}

function questionSearchText(question) {
  const answer = question.options && question.options[question.correctOptionIndex];
  return normalizedName([question.question, question.questionUrdu, answer]
    .filter((part) => typeof part === "string")
    .join(" "));
}

const errors = [];
const features = [];
const seenIds = new Set();
const seenNames = new Set();
const layerCounts = {};
const kindCounts = new Map();
const explicitIds = new Set();

for (const layer of layers) {
  let document;
  try {
    document = JSON.parse(fs.readFileSync(path.join(root, layer.file), "utf8"));
  } catch (error) {
    errors.push(`${layer.file}: cannot read JSON (${error.message}).`);
    continue;
  }
  if (document.schemaVersion !== 1 || !Array.isArray(document.features) || !document.features.length) {
    errors.push(`${layer.file}: expected schemaVersion 1 and a nonempty features array.`);
    continue;
  }
  layerCounts[layer.label] = document.features.length;

  for (const [index, feature] of document.features.entries()) {
    const context = `${layer.file} feature ${index + 1}`;
    if (!feature || typeof feature !== "object" || Array.isArray(feature)) {
      errors.push(`${context}: must be an object.`);
      continue;
    }
    const { id, kind, name, aliases, point, sourceUrl, path: line, geoNote, questionIds } = feature;
    if (typeof id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
      errors.push(`${context}: invalid id.`);
    } else if (seenIds.has(id)) {
      errors.push(`${context}: duplicate id ${id}.`);
    } else {
      seenIds.add(id);
    }
    if (!validKinds.has(kind)) {
      errors.push(`${context}: invalid ${layer.label} kind ${String(kind)}.`);
    } else {
      kindCounts.set(kind, (kindCounts.get(kind) || 0) + 1);
    }
    if (typeof name !== "string" || !name.trim()) {
      errors.push(`${context}: name must be nonempty.`);
    } else {
      const key = normalizedName(name);
      if (seenNames.has(key)) errors.push(`${context}: duplicate name ${name}.`);
      seenNames.add(key);
    }
    if (!Array.isArray(aliases) ||
        aliases.some((alias) => typeof alias !== "string" || !alias.trim()) ||
        new Set(aliases.filter((alias) => typeof alias === "string").map(normalizedName)).size !== aliases.length) {
      errors.push(`${context}: aliases must be an array of distinct, nonempty strings.`);
    }
    if (!validPoint(point)) errors.push(`${context}: invalid [longitude, latitude] point.`);
    if (line !== undefined) {
      if (!Array.isArray(line) || line.length < 2 || line.some((vertex) => !validPoint(vertex)) ||
          new Set(line.map((vertex) => JSON.stringify(vertex))).size < 2) {
        errors.push(`${context}: path must contain at least two distinct valid coordinates.`);
      }
    }
    if (!validSourceUrl(sourceUrl)) errors.push(`${context}: sourceUrl must be a nonempty HTTPS source.`);
    if (geoNote !== undefined && (typeof geoNote !== "string" || !geoNote.trim())) {
      errors.push(`${context}: geoNote must be a nonempty string when supplied.`);
    }
    if (questionIds !== undefined) {
      if (!Array.isArray(questionIds) || !questionIds.length ||
          questionIds.some((questionId) => typeof questionId !== "string" || !questionId.trim()) ||
          new Set(questionIds).size !== questionIds.length) {
        errors.push(`${context}: questionIds must be a nonempty array of distinct IDs when supplied.`);
      } else {
        for (const questionId of questionIds) {
          if (!questionsById.has(questionId)) {
            errors.push(`${context}: unknown question ID ${questionId}.`);
          } else {
            explicitIds.add(questionId);
          }
        }
      }
    }
    if (typeof name === "string" && name.trim() && Array.isArray(aliases)) {
      features.push(feature);
    }
  }
}

let geometryCount = 0;
const geometryFile = "assets/maps/world-physical-geometry.json";
try {
  const document = JSON.parse(fs.readFileSync(path.join(root, geometryFile), "utf8"));
  if (document.type !== "FeatureCollection" || document.schemaVersion !== 1 ||
      !Array.isArray(document.features) || !document.features.length ||
      !Array.isArray(document.unmappedFeatureIds) ||
      document.source?.revision !== "f1890d9f152c896d250a77557a5751a93d494776") {
    errors.push(`${geometryFile}: invalid collection or source revision.`);
  } else {
    const shapeIds = new Set();
    for (const [index, shape] of document.features.entries()) {
      const label = `${geometryFile} feature ${index + 1}`;
      const id = shape?.properties?.id;
      const curated = features.find((feature) => feature.id === id);
      if (!curated || shapeIds.has(id)) errors.push(`${label}: missing or duplicate curated ID ${id}.`);
      shapeIds.add(id);
      if (shape?.properties?.kind !== curated?.kind || !validSourceUrl(shape?.properties?.sourceUrl)) {
        errors.push(`${label}: kind or source URL mismatch.`);
      }
      const geometry = shape?.geometry;
      if (!geometry || !["MultiLineString", "MultiPolygon"].includes(geometry.type)) {
        errors.push(`${label}: expected verified line or polygon geometry.`);
        continue;
      }
      const parts = geometry.coordinates;
      const isLine = geometry.type === "MultiLineString";
      const valid = Array.isArray(parts) && parts.length && parts.every((part) =>
        isLine
          ? Array.isArray(part) && part.length >= 2 && part.every(validPoint)
          : Array.isArray(part) && part.length && part.every((ring) =>
            Array.isArray(ring) && ring.length >= 4 && ring.every(validPoint) &&
            JSON.stringify(ring[0]) === JSON.stringify(ring[ring.length - 1])));
      if (!valid || (isLine ? curated?.kind !== "river" : !["ocean", "sea"].includes(curated?.kind))) {
        errors.push(`${label}: invalid coordinates or geometry type for ${id}.`);
      }
    }
    if (document.unmappedFeatureIds.some((id) => !seenIds.has(id) || shapeIds.has(id))) {
      errors.push(`${geometryFile}: invalid unmapped feature IDs.`);
    }
    geometryCount = document.features.length;
  }
} catch (error) {
  errors.push(`${geometryFile}: cannot read JSON (${error.message}).`);
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  const searchableQuestions = questions.map((question) => [question.id, questionSearchText(question)]);
  const aliasMatchesIds = new Set();
  const matchers = [...new Set(features.flatMap((feature) => [feature.name, ...feature.aliases])
    .map(normalizedName))].map(aliasMatcher);
  for (const [questionId, text] of searchableQuestions) {
    if (matchers.some((matcher) => matcher(text))) {
      aliasMatchesIds.add(questionId);
    }
  }
  const combinedIds = new Set([...explicitIds, ...aliasMatchesIds]);
  console.log(`Physical map valid: ${features.length} features (${layers.map((layer) =>
    `${layer.label}: ${layerCounts[layer.label]}`).join(", ")}).`);
  console.log(`Kinds: ${[...kindCounts].sort(([a], [b]) => a.localeCompare(b))
    .map(([kind, count]) => `${kind} ${count}`).join(", ")}.`);
  console.log(`Verified Natural Earth geometries: ${geometryCount}.`);
  console.log(`Approximate MCQ coverage: ${explicitIds.size} explicit IDs; ` +
    `${aliasMatchesIds.size} stem/correct-answer name matches; ` +
    `${combinedIds.size} unique MCQs combined (of ${questions.length}).`);
}
