"use strict";

const {
  exactFingerprint,
  isDirectHttpsUrl,
  itemIdPattern,
  loadCurrentBank,
  loadManifest,
  pairIdPattern,
  validDate,
  validateReferences,
  validateTemporalScope
} = require("./adv2e102-common");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const references = [
  {
    url: "https://authority-a.example/fact",
    label: "Authority A fact sheet",
    publisher: "Authority A",
    authorityId: "authority-a",
    role: "answer-primary",
    sourceClass: "official",
    accessedOn: "2026-08-26",
    supports: ["answer"],
    claimSummary: "Directly supports the tested answer."
  },
  {
    url: "https://authority-b.example/fact",
    label: "Authority B reference",
    publisher: "Authority B",
    authorityId: "authority-b",
    role: "answer-secondary",
    sourceClass: "authoritative-secondary",
    accessedOn: "2026-08-26",
    supports: ["answer"],
    claimSummary: "Independently confirms the tested answer."
  }
];

let findings = [];
validateReferences(references, "valid", (message) => findings.push(message), 2);
assert(findings.length === 0, `valid independent references failed: ${findings.join(" | ")}`);

findings = [];
validateReferences(references.slice(0, 1), "single", (message) => findings.push(message), 2);
assert(findings.some((message) => message.includes("independent authorities")), "single authority was accepted");

findings = [];
validateReferences([
  references[0],
  { ...references[1], publisher: references[0].publisher }
], "publisher", (message) => findings.push(message), 2);
assert(findings.some((message) => message.includes("distinct publishers")), "same publisher was accepted as independent");

findings = [];
validateTemporalScope({
  type: "static",
  sourcePaperDate: "2019",
  asOf: null,
  eventDate: null,
  version: null,
  reverifyAfter: null
}, "Who is the current officeholder?", "dynamic", (message) => findings.push(message));
assert(findings.some((message) => message.includes("dynamic wording")), "dynamic wording passed as static");

findings = [];
validateTemporalScope({
  type: "as-of",
  sourcePaperDate: "2019",
  asOf: "2026-08-26",
  eventDate: null,
  version: null,
  reverifyAfter: "2027-02-26"
}, "As of 2026, which option is correct?", "scoped", (message) => findings.push(message));
assert(findings.length === 0, `valid as-of scope failed: ${findings.join(" | ")}`);

assert(pairIdPattern.test("ADV2E102-U0021-Q001"), "valid pair ID failed");
assert(itemIdPattern.test("ADV2E102-U0021-Q001-SRC"), "valid source ID failed");
assert(!pairIdPattern.test("ADV2E102-P021-Q001"), "invalid pair ID passed");
assert(isDirectHttpsUrl("https://example.org/fact"), "direct HTTPS URL failed");
assert(!isDirectHttpsUrl("http://example.org/fact"), "HTTP URL passed");
assert(!isDirectHttpsUrl("https://google.com/search?q=fact"), "search-results URL passed");
assert(validDate("2026-08-26"), "valid calendar date failed");
assert(!validDate("2026-02-31"), "invalid calendar date passed");
assert(exactFingerprint("Cell A1") !== exactFingerprint("Cell $A1"), "absolute-reference marker was lost");
assert(exactFingerprint("file .ppt") !== exactFingerprint("file .pptx"), "file extension was lost");
assert(exactFingerprint("NOT correct") !== exactFingerprint("correct"), "negation was lost");

const manifest = loadManifest();
assert(manifest.inventoryStatus === "pending" || manifest.inventoryStatus === "complete", "invalid manifest inventoryStatus");
assert(Array.isArray(manifest.sourceUnits), "manifest sourceUnits is not an array");
assert(loadCurrentBank({ includeAdv2e102: false }).length >= 3074, "baseline bank is unexpectedly incomplete");

console.log("ADV2E102 scaffolding contract tests passed.");
