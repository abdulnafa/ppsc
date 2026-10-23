#!/usr/bin/env node
/**
 * Derive a small country-by-country city overlay from Natural Earth 1:50m.
 *
 * Pinned source (the same Natural Earth revision as the country map):
 * https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_populated_places.geojson
 * Natural Earth data are public domain:
 * https://www.naturalearthdata.com/about/terms-of-use/
 *
 * Usage: node tools/build-world-city-data.js path/to/original.geojson
 * The full source download is not committed. Only a ranked, compact extract
 * for countries on this site's map is written to assets/maps/.
 */

const fs = require('node:fs');
const path = require('node:path');

const SOURCE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_populated_places.geojson';
const LICENSE_URL = 'https://www.naturalearthdata.com/about/terms-of-use/';
const COUNTRY_PATH = path.resolve(__dirname, '../assets/maps/world-countries-50m.geojson');
const OUTPUT_PATH = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve(__dirname, '../assets/maps/world-major-cities.json');
const MAX_OTHER_CITIES = 7;

if (!process.argv[2]) {
  console.error('Usage: node tools/build-world-city-data.js path/to/original.geojson [output.json]');
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const countries = JSON.parse(fs.readFileSync(COUNTRY_PATH, 'utf8'));
if (source.type !== 'FeatureCollection' || !Array.isArray(source.features)) {
  throw new Error('Expected Natural Earth city GeoJSON FeatureCollection.');
}
if (countries.type !== 'FeatureCollection' || !Array.isArray(countries.features)) {
  throw new Error('Expected committed Natural Earth country GeoJSON FeatureCollection.');
}

const mappedCodes = new Set(countries.features.map((feature) => feature.properties.iso3));
const byCountry = new Map();
for (const feature of source.features) {
  const properties = feature.properties || {};
  const iso3 = properties.ADM0_A3;
  if (!mappedCodes.has(iso3)) continue;

  const name = String(properties.NAME_EN || properties.NAME || '').trim();
  const coordinates = feature.geometry?.coordinates;
  const lon = Number(coordinates?.[0]);
  const lat = Number(coordinates?.[1]);
  if (feature.geometry?.type !== 'Point' || !name
    || !Number.isFinite(lon) || lon < -180 || lon > 180
    || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid city record for ${iso3}: ${name || '<unnamed>'}`);
  }

  if (!byCountry.has(iso3)) byCountry.set(iso3, []);
  byCountry.get(iso3).push({
    iso3,
    name,
    lon,
    lat,
    capital: properties.ADM0CAP === 1,
    worldCity: properties.WORLDCITY === 1,
    scaleRank: Number.isFinite(Number(properties.SCALERANK))
      ? Number(properties.SCALERANK) : 99,
    population: Number(properties.POP_MAX) || 0,
  });
}

function compareImportance(a, b) {
  return Number(b.worldCity) - Number(a.worldCity)
    || a.scaleRank - b.scaleRank
    || b.population - a.population
    || a.name.localeCompare(b.name, 'en');
}

function nearby(a, b) {
  // The source has pairs such as Delhi/New Delhi and Guwahati/Dispur. Keep
  // the more important point so that nearby map markers remain readable.
  const meanLatitude = ((a.lat + b.lat) / 2) * Math.PI / 180;
  const deltaLon = Math.abs(a.lon - b.lon);
  const wrappedLon = Math.min(deltaLon, 360 - deltaLon);
  const eastWestKm = wrappedLon * 111.2 * Math.cos(meanLatitude);
  const northSouthKm = Math.abs(a.lat - b.lat) * 111.2;
  return Math.hypot(eastWestKm, northSouthKm) < 25;
}

const cities = [];
for (const iso3 of [...byCountry.keys()].sort()) {
  const group = byCountry.get(iso3);
  const capitals = group.filter((city) => city.capital).sort(compareImportance);
  const others = group.filter((city) => !city.capital).sort(compareImportance);
  const selected = [];
  let otherCount = 0;
  for (const city of [...capitals, ...others]) {
    if (selected.some((prior) => prior.name === city.name || nearby(prior, city))) continue;
    if (!city.capital && otherCount >= MAX_OTHER_CITIES) continue;
    selected.push(city);
    if (!city.capital) otherCount += 1;
  }
  cities.push(...selected.map(({ iso3: code, name, lon, lat, capital }) => ({
    iso3: code,
    name,
    lon: Number(lon.toFixed(4)),
    lat: Number(lat.toFixed(4)),
    capital,
  })));
}

const output = { source: SOURCE_URL, license: LICENSE_URL, cities };
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output)}\n`, 'utf8');
console.log(`Wrote ${cities.length} cities for ${byCountry.size} mapped countries to ${OUTPUT_PATH} (${fs.statSync(OUTPUT_PATH).size} bytes).`);
