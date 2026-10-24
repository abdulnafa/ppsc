#!/usr/bin/env node
"use strict";

/**
 * Build a small, locally hosted Natural Earth geometry layer for curated
 * physical-map features. Natural Earth 1:50m is public-domain cartographic
 * data, not a surveyed watercourse or a legal maritime-boundary source.
 *
 * Sources (pinned to the same revision as world-countries-50m.geojson):
 * https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_rivers_lake_centerlines.geojson
 * https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_geography_marine_polys.geojson
 * https://www.naturalearthdata.com/about/terms-of-use/
 *
 * Usage:
 *   node tools/build-world-physical-geometry.js
 *   node tools/build-world-physical-geometry.js rivers.geojson marine.geojson [output.json]
 *
 * The first form fetches the pinned files. The second form is fully offline.
 * Unlike an interpolated line between a river's endpoints, only actual named
 * source geometries are emitted. Unmatched features retain their point labels.
 */

const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

const revision = "f1890d9f152c896d250a77557a5751a93d494776";
const baseUrl = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${revision}/geojson/`;
const sourceUrls = {
  river: `${baseUrl}ne_50m_rivers_lake_centerlines.geojson`,
  marine: `${baseUrl}ne_50m_geography_marine_polys.geojson`
};
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
if (args.length !== 0 && (args.length < 2 || args.length > 3)) {
  console.error("Usage: node tools/build-world-physical-geometry.js [rivers.geojson marine.geojson [output.json]]");
  process.exit(1);
}
const outputPath = args[2]
  ? path.resolve(args[2])
  : path.join(root, "assets/maps/world-physical-geometry.json");

const normalized = (value) => String(value || "")
  .normalize("NFKC")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "ppsc-physical-map-builder" } }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`${url}: HTTP ${response.statusCode}`));
        return;
      }
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
      response.on("error", reject);
    }).on("error", reject);
  });
}

function expectCollection(collection, label) {
  if (collection?.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new Error(`${label}: expected a GeoJSON FeatureCollection.`);
  }
  return collection.features;
}

function roundCoordinates(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Non-finite Natural Earth coordinate.");
    return Number(value.toFixed(3));
  }
  if (!Array.isArray(value)) throw new Error("Unexpected Natural Earth coordinate nesting.");
  return value.map(roundCoordinates);
}

function validPair(pair) {
  return Array.isArray(pair) && pair.length === 2 &&
    Number.isFinite(pair[0]) && Number.isFinite(pair[1]) &&
    pair[0] >= -180 && pair[0] <= 180 && pair[1] >= -90 && pair[1] <= 90;
}

function validateGeometry(geometry) {
  const { type, coordinates } = geometry;
  const lines = type === "MultiLineString" ? coordinates :
    type === "LineString" ? [coordinates] : null;
  const polygons = type === "MultiPolygon" ? coordinates :
    type === "Polygon" ? [coordinates] : null;
  if (lines) {
    if (!lines.length || lines.some((line) => line.length < 2 || line.some((pair) => !validPair(pair)))) {
      throw new Error(`Invalid ${type} coordinates.`);
    }
    return;
  }
  if (polygons) {
    if (!polygons.length || polygons.some((polygon) => !polygon.length || polygon.some((ring) =>
      ring.length < 4 || ring.some((pair) => !validPair(pair)) ||
      JSON.stringify(ring[0]) !== JSON.stringify(ring[ring.length - 1])))) {
      throw new Error(`Invalid ${type} coordinates.`);
    }
    return;
  }
  throw new Error(`Unsupported Natural Earth geometry: ${type}`);
}

function sourceName(feature) {
  // Raw names distinguish the northern and southern ocean polygons; NAME_EN
  // intentionally folds both into the same translation, so it cannot match
  // an ocean part by itself.
  return String(feature.properties?.name || feature.properties?.name_en || "").trim();
}

function sourcePieces(sourceFeatures, names, allowedTypes) {
  const keys = new Set(names.map(normalized));
  return sourceFeatures.filter((feature) =>
    keys.has(normalized(sourceName(feature))) && allowedTypes.has(feature.geometry?.type));
}

function joinedGeometry(pieces, family) {
  const coordinates = [];
  for (const feature of pieces) {
    const geometry = feature.geometry;
    if (family === "line") {
      coordinates.push(...(geometry.type === "LineString"
        ? [geometry.coordinates] : geometry.coordinates));
    } else {
      coordinates.push(...(geometry.type === "Polygon"
        ? [geometry.coordinates] : geometry.coordinates));
    }
  }
  const geometry = {
    type: family === "line" ? "MultiLineString" : "MultiPolygon",
    coordinates: roundCoordinates(coordinates)
  };
  validateGeometry(geometry);
  return geometry;
}

async function main() {
  const [riverSource, marineSource] = args.length
    ? [JSON.parse(fs.readFileSync(path.resolve(args[0]), "utf8")),
       JSON.parse(fs.readFileSync(path.resolve(args[1]), "utf8"))]
    : await Promise.all([getJson(sourceUrls.river), getJson(sourceUrls.marine)]);
  const rivers = expectCollection(riverSource, "rivers");
  const marine = expectCollection(marineSource, "marine areas");
  const curated = [
    ...JSON.parse(fs.readFileSync(path.join(root, "data/world-physical-water.json"), "utf8")).features,
    ...JSON.parse(fs.readFileSync(path.join(root, "data/world-physical-terrain.json"), "utf8")).features
  ];
  const marineNameOverrides = {
    "ocean-atlantic": ["North Atlantic Ocean", "South Atlantic Ocean"],
    "ocean-pacific": ["North Pacific Ocean", "South Pacific Ocean"],
    "sea-bohai": ["Bo Hai"]
  };
  const features = [];
  const unmappedFeatureIds = [];
  for (const item of curated) {
    let pieces;
    let sourceUrl;
    let family;
    if (item.kind === "river") {
      // Natural Earth uses bare river names, e.g. "Indus", not "Indus River".
      const bareName = item.name.replace(/\s+River$/i, "");
      pieces = sourcePieces(rivers, [bareName], new Set(["LineString", "MultiLineString"]));
      sourceUrl = sourceUrls.river;
      family = "line";
    } else if (item.kind === "ocean" || item.kind === "sea") {
      pieces = sourcePieces(marine, marineNameOverrides[item.id] || [item.name],
        new Set(["Polygon", "MultiPolygon"]));
      sourceUrl = sourceUrls.marine;
      family = "polygon";
    } else {
      continue;
    }
    if (!pieces.length) {
      unmappedFeatureIds.push(item.id);
      continue;
    }
    features.push({
      type: "Feature",
      properties: {
        id: item.id,
        kind: item.kind,
        name: item.name,
        sourceNames: [...new Set(pieces.map(sourceName))].sort((a, b) => a.localeCompare(b, "en")),
        sourceUrl
      },
      geometry: joinedGeometry(pieces, family)
    });
  }
  features.sort((a, b) => a.properties.id.localeCompare(b.properties.id, "en"));
  unmappedFeatureIds.sort((a, b) => a.localeCompare(b, "en"));
  for (const required of ["river-indus", "river-chenab", "river-sutlej",
    "ocean-atlantic", "ocean-pacific", "ocean-indian", "ocean-arctic", "ocean-southern"]) {
    if (!features.some((feature) => feature.properties.id === required)) {
      throw new Error(`Expected Natural Earth geometry missing: ${required}`);
    }
  }
  const output = {
    type: "FeatureCollection",
    schemaVersion: 1,
    source: {
      name: "Natural Earth 1:50m physical vectors",
      revision,
      termsUrl: "https://www.naturalearthdata.com/about/terms-of-use/",
      note: "Generalized cartographic geometry, not surveyed river courses or legal maritime boundaries."
    },
    unmappedFeatureIds,
    features
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`, "utf8");
  console.log(`Wrote ${features.length} geometries (${unmappedFeatureIds.length} curated river/marine labels remain point-only) to ${outputPath} (${fs.statSync(outputPath).size} bytes).`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
