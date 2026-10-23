"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const filename = path.join(root, "assets", "maps", "world-countries-50m.geojson");
const data = JSON.parse(fs.readFileSync(filename, "utf8"));

if (data.type !== "FeatureCollection" || !Array.isArray(data.features) || data.features.length < 200) {
  throw new Error("World map must contain at least 200 country features.");
}

const codes = new Set();
let ringCount = 0;
for (const feature of data.features) {
  const { name, iso3, label } = feature.properties || {};
  if (!name || !/^[A-Z]{3}$/.test(iso3) || codes.has(iso3)) {
    throw new Error("Missing or duplicate map country code: " + iso3);
  }
  codes.add(iso3);
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

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "pages.yml"), "utf8");
for (const token of ["world-map.js", "world-countries-50m.geojson"]) {
  if (!workflow.includes(token)) throw new Error("Pages workflow omits " + token);
}
if (!html.includes("world-map.js") || !html.includes("id=\"world-map-screen\"")) {
  throw new Error("World map is not wired into the published HTML.");
}

console.log("World map data valid: " + codes.size + " map areas, " + ringCount + " rings.");
