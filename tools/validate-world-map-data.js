"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const filename = path.join(root, "assets", "maps", "world-countries-50m.geojson");
const data = JSON.parse(fs.readFileSync(filename, "utf8"));

if (data.type !== "FeatureCollection" || !Array.isArray(data.features) || data.features.length < 200) {
  throw new Error("World map must contain at least 200 country features.");
}

const codes = new Set();
const featuresByCode = new Map();
let ringCount = 0;
for (const feature of data.features) {
  const { name, iso3, label } = feature.properties || {};
  if (!name || !/^[A-Z]{3}$/.test(iso3) || codes.has(iso3)) {
    throw new Error("Missing or duplicate map country code: " + iso3);
  }
  codes.add(iso3);
  featuresByCode.set(iso3, feature);
  if (!Array.isArray(label) || label.length !== 2 ||
      !Number.isFinite(label[0]) || !Number.isFinite(label[1])) {
    throw new Error("Invalid map label for " + name);
  }
  const geometry = feature.geometry || {};
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
    throw new Error("Unsupported geometry for " + name);
  }
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      ringCount += 1;
      if (!Array.isArray(ring) || ring.length < 4 ||
          ring[0][0] !== ring[ring.length - 1][0] ||
          ring[0][1] !== ring[ring.length - 1][1]) {
        throw new Error("Invalid or unclosed ring for " + name);
      }
      for (const point of ring) {
        if (!Array.isArray(point) || point.length !== 2 ||
            !Number.isFinite(point[0]) || !Number.isFinite(point[1]) ||
            point[0] < -180 || point[0] > 180 || point[1] < -90 || point[1] > 90) {
          throw new Error("Invalid coordinate for " + name);
        }
      }
    }
  }
}

// Read the curated lesson manifest from the published script, rather than
// maintaining a second copy that could quietly drift out of sync with the UI.
const mapScript = fs.readFileSync(path.join(root, "world-map.js"), "utf8");
const manifestMatch = mapScript.match(/\bvar DIRECTION_LESSONS = Object\.freeze\((\{[\s\S]*?\})\);\s*var PROMINENT_LABELS/);
if (!manifestMatch) throw new Error("Direction lesson manifest is missing or malformed.");
const lessons = vm.runInNewContext("(" + manifestMatch[1] + ")", Object.create(null), { timeout: 1000 });

const questionScope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data", "questions.js"), "utf8"), questionScope, { timeout: 10000 });
const questions = questionScope.window.PPSC_QUESTIONS;
if (!Array.isArray(questions)) throw new Error("Question bank did not load for direction lesson validation.");
const questionsById = new Map(questions.map((question) => [question.id, question]));
if (questionsById.size !== questions.length) throw new Error("Question bank contains duplicate IDs.");

const expectedAnswers = {
  "ADV2E102-U0005-Q022-SRC": "China",
  "ADV2E102-U0008-Q046-SRC": "India",
  "ADV2E102-U0008-Q046-SIM": "Afghanistan and Iran",
  "ADV2E102-U0014-Q054-SIM": "Iran",
  "ADV2E102-U0033-Q006-SIM": "Afghanistan",
  "ADV2E102-U0035-Q043-SIM": "Northeast"
};

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const a = ring[i];
    const b = ring[j];
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
        point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function pointInGeometry(point, geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some((rings) => pointInRing(point, rings[0]) &&
    rings.slice(1).every((hole) => !pointInRing(point, hole)));
}

for (const [id, lesson] of Object.entries(lessons)) {
  const question = questionsById.get(id);
  if (!question) throw new Error("Direction lesson has unknown MCQ ID: " + id);
  const answer = question.options && question.options[question.correctOptionIndex];
  if (Object.hasOwn(expectedAnswers, id) && answer !== expectedAnswers[id]) {
    throw new Error("Direction lesson answer changed for " + id + ": " + answer);
  }
  if (!lesson || !codes.has(lesson.from) || !Array.isArray(lesson.to) || !lesson.to.length ||
      lesson.to.some((code) => !codes.has(code) || code === lesson.from) ||
      new Set(lesson.to).size !== lesson.to.length) {
    throw new Error("Direction lesson has invalid country codes: " + id);
  }
  if (typeof lesson.title !== "string" || !lesson.title.trim() ||
      typeof lesson.explanation !== "string" || !lesson.explanation.trim()) {
    throw new Error("Direction lesson needs a title and explanation: " + id);
  }
  for (const [code, point] of Object.entries(lesson.points || {})) {
    if (code !== lesson.from && !lesson.to.includes(code)) {
      throw new Error("Direction marker refers to an unrelated country: " + id + " / " + code);
    }
    if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) ||
        !pointInGeometry(point, featuresByCode.get(code).geometry)) {
      throw new Error("Direction marker lies outside its country: " + id + " / " + code);
    }
  }
}
for (const id of Object.keys(expectedAnswers)) {
  if (!Object.hasOwn(lessons, id)) throw new Error("Expected direction lesson missing: " + id);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "pages.yml"), "utf8");
for (const token of ["world-map.js", "world-countries-50m.geojson"]) {
  if (!workflow.includes(token)) throw new Error("Pages workflow omits " + token);
}
if (!html.includes("world-map.js") || !html.includes("id=\"world-map-screen\"")) {
  throw new Error("World map is not wired into the published HTML.");
}

console.log("World map data valid: " + codes.size + " map areas, " + ringCount + " rings, " + Object.keys(lessons).length + " direction lessons.");
