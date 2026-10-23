#!/usr/bin/env node
/**
 * Create the small, locally hosted world-map asset from Natural Earth data.
 *
 * Source (Natural Earth 1:50m admin-0 countries, pinned revision):
 * https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_admin_0_countries.geojson
 * Natural Earth data are public domain:
 * https://www.naturalearthdata.com/about/terms-of-use/
 *
 * Usage: node tools/build-world-map-data.js path/to/original.geojson
 * The original download is intentionally not committed. The generated file
 * keeps country polygons and only the fields needed by the map UI.
 */

const fs = require('node:fs');
const path = require('node:path');

const sourcePath = process.argv[2];
const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve(__dirname, '../assets/maps/world-countries-50m.geojson');

if (!sourcePath) {
  console.error('Usage: node tools/build-world-map-data.js path/to/original.geojson');
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(path.resolve(sourcePath), 'utf8'));
if (source.type !== 'FeatureCollection' || !Array.isArray(source.features)) {
  throw new Error('Expected a GeoJSON FeatureCollection.');
}

const roundCoordinate = (value) => Number(value.toFixed(4));
const roundCoordinates = (coordinates) => coordinates.map((item) =>
  Array.isArray(item) ? roundCoordinates(item) : roundCoordinate(item)
);

const features = source.features.map((feature) => {
  const sourceProperties = feature.properties || {};
  const name = sourceProperties.NAME_EN || sourceProperties.NAME;
  const iso3 = [sourceProperties.ISO_A3, sourceProperties.ADM0_A3]
    .find((code) => /^[A-Z]{3}$/.test(code || ''));
  const longitude = Number(sourceProperties.LABEL_X);
  const latitude = Number(sourceProperties.LABEL_Y);

  if (!name || !iso3 || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    throw new Error(`Missing map label or country code: ${name || '<unknown>'}`);
  }
  if (!['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)) {
    throw new Error(`Unsupported geometry for ${name}: ${feature.geometry?.type}`);
  }

  return {
    type: 'Feature',
    properties: {
      name,
      iso3,
      label: [roundCoordinate(longitude), roundCoordinate(latitude)],
    },
    geometry: {
      type: feature.geometry.type,
      coordinates: roundCoordinates(feature.geometry.coordinates),
    },
  };
});

const duplicateCodes = features
  .map((feature) => feature.properties.iso3)
  .filter((code, index, codes) => codes.indexOf(code) !== index);
if (duplicateCodes.length) {
  throw new Error(`Duplicate country codes: ${[...new Set(duplicateCodes)].join(', ')}`);
}

features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'en'));
const output = {
  type: 'FeatureCollection',
  features,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`, 'utf8');
console.log(`Wrote ${features.length} countries to ${outputPath} (${fs.statSync(outputPath).size} bytes).`);
