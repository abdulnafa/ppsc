#!/usr/bin/env node
/** Validate the committed, compact Natural Earth city overlay. */

const fs = require('node:fs');
const path = require('node:path');

const asset = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../assets/maps/world-major-cities.json'), 'utf8'
));
const countryMap = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../assets/maps/world-countries-50m.geojson'), 'utf8'
));
const countryCodes = new Set(countryMap.features.map((feature) => feature.properties.iso3));
const errors = [];
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');

if (!html.includes('id="world-map-country-svg"') || !html.includes('id="world-map-country-cities"')) {
  errors.push('Selected-country map panel is missing from the published HTML.');
}
if (!workflow.includes('node tools/validate-world-city-data.js')
    || !workflow.includes('cp assets/maps/world-major-cities.json _site/assets/maps/')) {
  errors.push('Pages workflow must validate and publish the city overlay.');
}

if (!asset.source.includes('/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_populated_places.geojson')) {
  errors.push('Natural Earth city source must be pinned to the country-map revision.');
}
if (asset.license !== 'https://www.naturalearthdata.com/about/terms-of-use/') {
  errors.push('Missing public-domain source terms.');
}
if (!Array.isArray(asset.cities) || asset.cities.length < 500) {
  errors.push('Expected a nonempty, globally useful city list.');
}

let previousCode = '';
const seen = new Set();
const nonCapitals = new Map();
for (const city of asset.cities || []) {
  const key = `${city.iso3}|${city.name}`;
  if (!countryCodes.has(city.iso3)) errors.push(`Unknown map country for ${key}.`);
  if (typeof city.name !== 'string' || !city.name.trim()) errors.push(`Missing city name for ${city.iso3}.`);
  if (typeof city.capital !== 'boolean') errors.push(`Invalid capital flag for ${key}.`);
  if (!Number.isFinite(city.lon) || city.lon < -180 || city.lon > 180
      || !Number.isFinite(city.lat) || city.lat < -90 || city.lat > 90) {
    errors.push(`Invalid point for ${key}.`);
  }
  if (city.iso3 < previousCode) errors.push(`Country order is not sorted at ${key}.`);
  if (seen.has(key)) errors.push(`Duplicate city ${key}.`);
  seen.add(key);
  previousCode = city.iso3;
  if (!city.capital) {
    nonCapitals.set(city.iso3, (nonCapitals.get(city.iso3) || 0) + 1);
    if (nonCapitals.get(city.iso3) > 7) errors.push(`Too many non-capital cities for ${city.iso3}.`);
  }
}

for (const key of ['PAK|Islamabad', 'PAK|Karachi', 'PAK|Lahore',
  'IND|New Delhi', 'IND|Mumbai', 'USA|Washington', 'USA|New York City']) {
  if (!seen.has(key)) errors.push(`Expected anchor city missing: ${key}.`);
}
for (const key of ['PAK|Islamabad', 'IND|New Delhi', 'USA|Washington']) {
  const [iso3, name] = key.split('|');
  if (!asset.cities.some((city) => city.iso3 === iso3 && city.name === name && city.capital)) {
    errors.push(`National capital flag missing: ${key}.`);
  }
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}
console.log(`Valid Natural Earth city overlay: ${asset.cities.length} cities across ${new Set(asset.cities.map((city) => city.iso3)).size} map countries.`);
