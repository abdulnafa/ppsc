"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDirectory = path.resolve(__dirname, "..");
const questionBankPath = path.join(projectDirectory, "data", "questions.js");
const outputPath = path.join(projectDirectory, "data", "gk-study-notes.js");
const generatedOn = "2026-09-02";

const topicDefinitions = [
  {
    id: "dates-timelines",
    label: "Dates & Timelines",
    labelUrdu: "تاریخیں اور زمانی سلسلے",
    description: "Years, dates, milestones and chronological links.",
    descriptionUrdu: "سال، تاریخیں، سنگِ میل اور واقعات کا زمانی ربط۔",
    pattern: /\b(?:when|date|year|month|century|decade|founded|established|began|ended|signed|held|launched|independence|anniversary|day|week|timeline)\b|\b(?:1[0-9]{3}|20[0-9]{2})\b/i
  },
  {
    id: "people-offices",
    label: "People, Leaders & Offices",
    labelUrdu: "شخصیات، رہنما اور عہدے",
    description: "People, leaders, office-holders, writers and notable figures.",
    descriptionUrdu: "اہم شخصیات، رہنما، عہدے دار، مصنف اور معروف افراد۔",
    pattern: /\b(?:who|whose|person|president|prime minister|minister|king|queen|emperor|leader|founder|author|poet|writer|scientist|inventor|player|athlete|winner|secretary|chairman|governor|commander|director|judge|chief|diplomat|statesman|philosopher|thinker|scholar|explorer|physician|artist|composer|actor|actress|singer|born|died|assassinated|awardee)\b|\b(?:given|proposed|developed|invented|discovered|founded|written|painted|composed)\s+by\b/i
  },
  {
    id: "organizations-agencies",
    label: "Organizations & Agencies",
    labelUrdu: "ادارے اور ایجنسیاں",
    description: "Organizations, agencies, abbreviations, headquarters and roles.",
    descriptionUrdu: "ادارے، ایجنسیاں، مخففات، صدر دفاتر اور ان کے فرائض۔",
    pattern: /\b(?:organization|organisation|agency|commission|council|committee|court|bank|fund|secretariat|headquarters|institution|institute|university|union|association|programme|program|abbreviation|stands? for|full form|nato|united nations|saarc|oic|wto|imf|unesco|unicef|fao|ilo|icj)\b/i,
    casePattern: /\bWHO\b/
  },
  {
    id: "countries-places",
    label: "Countries & Places",
    labelUrdu: "ممالک اور مقامات",
    description: "Countries, capitals, currencies, cities and physical places.",
    descriptionUrdu: "ممالک، دارالحکومت، کرنسیاں، شہر اور جغرافیائی مقامات۔",
    pattern: /\b(?:country|countries|city|capital|currency|continent|region|located|where|place|river|mountain|sea|ocean|island|border|canal|lake|desert|coast|headquarters|province|state|territory|emirate|gulf|strait|port)\b|\b(?:is|are|was|were)\s+(?:in|at|on)(?=\s|:|\?|$)/i
  },
  {
    id: "events-history",
    label: "Events & History",
    labelUrdu: "واقعات اور تاریخ",
    description: "Wars, treaties, conferences, movements and historical events.",
    descriptionUrdu: "جنگیں، معاہدے، کانفرنسیں، تحریکیں اور تاریخی واقعات۔",
    pattern: /\b(?:war|battle|treaty|agreement|conference|movement|revolution|independence|operation|crisis|famine|summit|incident|attack|invasion|annex|partition|empire|dynasty|civilization|election|referendum|event)\b/i
  },
  {
    id: "sports-records",
    label: "Sports & Competitions",
    labelUrdu: "کھیل اور مقابلے",
    description: "Sports, tournaments, players, rules, medals and records.",
    descriptionUrdu: "کھیل، ٹورنامنٹ، کھلاڑی، قواعد، تمغے اور ریکارڈ۔",
    pattern: /\b(?:sport|olympic|cricket|football|hockey|tennis|badminton|squash|athlete|player|tournament|cup|championship|medal|goal|wicket|game|match|javelin|stadium|fifa|icc)\b/i
  },
  {
    id: "books-awards-culture",
    label: "Books, Awards & Culture",
    labelUrdu: "کتابیں، اعزازات اور ثقافت",
    description: "Books, authors, awards, arts, languages and cultural facts.",
    descriptionUrdu: "کتابیں، مصنف، اعزازات، فنون، زبانیں اور ثقافتی حقائق۔",
    pattern: /\b(?:book|novel|poem|poet|author|writer|literature|art|painting|music|film|award|prize|nobel|culture|language|religion|mosque|temple|church|heritage|museum)\b/i
  },
  {
    id: "records-firsts",
    label: "First, Largest & Records",
    labelUrdu: "اولین، سب سے بڑے اور ریکارڈ",
    description: "Firsts, largest, longest, highest and other record facts.",
    descriptionUrdu: "اولین، سب سے بڑے، طویل، بلند اور دوسرے ریکارڈ حقائق۔",
    pattern: /\b(?:first|last|largest|smallest|longest|shortest|highest|lowest|most|least|oldest|youngest|record|top|ranked)\b/i
  },
  {
    id: "general-world-facts",
    label: "General World Facts",
    labelUrdu: "عمومی عالمی حقائق",
    description: "Connected facts that do not belong to one narrower study type.",
    descriptionUrdu: "وہ مربوط حقائق جو کسی ایک محدود مطالعہ قسم میں شامل نہیں ہوتے۔",
    fallback: true
  }
];

function fail(message) {
  throw new Error(message);
}

function loadQuestionBank() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(questionBankPath, "utf8"), sandbox, { filename: questionBankPath });
  const data = sandbox.window.PPSC_QUIZ_DATA;
  if (!data || !Array.isArray(data.questions)) fail("data/questions.js did not expose PPSC_QUIZ_DATA.questions");
  return data;
}

function optionText(option) {
  return String(option && typeof option === "object" ? option.text : option).trim();
}

function firstSentence(value) {
  const text = String(value || "").trim();
  const match = text.match(/^.*?[۔!?](?:\s|$)/u);
  return (match ? match[0] : text).trim();
}

function summarySentence(value) {
  const text = String(value || "").trim();
  const sentences = text.match(/[^۔!?]+[۔!?]?/gu) || [];
  const cleaned = sentences.map((sentence) => sentence.trim()).filter(Boolean);
  const contextual = cleaned.find((sentence) => !/^درست جواب(?:\s|[”"'’])/u.test(sentence));
  if (contextual) return contextual;
  return cleaned[0] || firstSentence(text);
}

function isGenericAnswer(value) {
  return /^(?:all|none|both|either|neither)(?:\b|\s)|^(?:a|b|c|d)\s*(?:and|or|&|\+)\s*(?:a|b|c|d)$/i.test(String(value || "").trim());
}

function normalizedAnswer(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[“”"'’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyPair(pair) {
  const searchable = pair.flatMap((question) => [
    question.question,
    question.questionUrdu,
    question.explanationUrdu,
    optionText(question.options[question.correctOptionIndex]),
    ...(Array.isArray(question.tags) ? question.tags : [])
  ]).filter(Boolean).join(" ");

  const topicIds = topicDefinitions.filter((topic) => {
    if (topic.fallback) return false;
    if (topic.id === "dates-timelines" && pair.some((question) => (
      question.temporalScope && ["event-date", "as-of", "version"].includes(question.temporalScope.type)
    ))) return true;
    return topic.pattern.test(searchable) || Boolean(topic.casePattern && topic.casePattern.test(searchable));
  }).map((topic) => topic.id);

  return topicIds.length ? topicIds : ["general-world-facts"];
}

function factFromQuestion(question) {
  const fact = {
    questionId: question.id,
    kind: question.kind,
    textUrdu: question.explanationUrdu,
    answer: optionText(question.options[question.correctOptionIndex]),
    source: question.source,
    references: question.references,
    temporalScope: question.temporalScope,
    sourceNotes: question.sourceNotes
  };
  return fact;
}

function createBundle(data) {
  const gkQuestions = data.questions.filter((question) => question.categoryId === "general-knowledge");
  const pairMap = new Map();
  gkQuestions.forEach((question) => {
    const pair = pairMap.get(question.pairId) || [];
    pair.push(question);
    pairMap.set(question.pairId, pair);
  });

  const eligiblePairs = [];
  const excludedPairs = [];
  for (const entry of pairMap.entries()) {
    const pair = entry[1];
    const structurallyComplete = pair.length === 2
      && pair[0].kind === "source"
      && pair[1].kind === "similar";
    const fullyReferenced = structurallyComplete && pair.every((question) => (
      question.temporalScope
      && typeof question.temporalScope === "object"
      && Array.isArray(question.references)
      && question.references.length >= 2
    ));
    (fullyReferenced ? eligiblePairs : excludedPairs).push(entry);
  }

  if (gkQuestions.length !== 1452 || pairMap.size !== 726) {
    fail(`Expected 1,452 GK questions/726 pairs; found ${gkQuestions.length}/${pairMap.size}`);
  }
  if (eligiblePairs.length !== 708 || excludedPairs.length !== 18) {
    fail(`Expected 708 eligible/18 excluded GK pairs; found ${eligiblePairs.length}/${excludedPairs.length}`);
  }

  const notes = eligiblePairs.map(([pairId, pair]) => {
    const source = pair[0];
    const similar = pair[1];
    const sourceAnswer = optionText(source.options[source.correctOptionIndex]);
    const similarAnswer = optionText(similar.options[similar.correctOptionIndex]);
    const sourceSummary = summarySentence(source.explanationUrdu);
    const answersMatch = normalizedAnswer(sourceAnswer) === normalizedAnswer(similarAnswer);
    return {
      id: `GKNOTE-${pairId}`,
      pairId,
      topicIds: classifyPair(pair),
      title: isGenericAnswer(sourceAnswer)
        ? sourceSummary
        : answersMatch
          ? sourceAnswer
          : `${sourceAnswer} ↔ ${similarAnswer}`,
      subtitleUrdu: sourceSummary,
      important: pair.some((question) => question.isImportant === true),
      repeatCount: Math.max(...pair.map((question) => (
        Number.isInteger(question.repeatCount) ? question.repeatCount : 1
      ))),
      memoryHookUrdu: answersMatch
        ? `یاد رکھنے کا مرکزی نکتہ: ${sourceAnswer}`
        : `یاد رکھنے کی جوڑی: ${sourceAnswer} ↔ ${similarAnswer}`,
      searchTerms: [
        pairId,
        source.question,
        source.questionUrdu,
        similar.question,
        similar.questionUrdu,
        sourceAnswer,
        similarAnswer,
        ...(Array.isArray(source.tags) ? source.tags : []),
        ...(Array.isArray(similar.tags) ? similar.tags : [])
      ].filter(Boolean),
      facts: pair.map(factFromQuestion)
    };
  });

  const topics = topicDefinitions.map((topic) => ({
    id: topic.id,
    label: topic.label,
    labelUrdu: topic.labelUrdu,
    description: topic.description,
    descriptionUrdu: topic.descriptionUrdu,
    noteCount: notes.filter((note) => note.topicIds.includes(topic.id)).length
  }));
  if (topics.some((topic) => topic.noteCount < 1)) {
    fail(`A GK Study Notes topic is empty: ${topics.filter((topic) => topic.noteCount < 1).map((topic) => topic.id).join(", ")}`);
  }

  const excludedPairIds = excludedPairs.map(([pairId]) => pairId);
  const excludedQuestionIds = excludedPairs.flatMap(([, pair]) => pair.map((question) => question.id));
  const questionBankSignature = crypto.createHash("sha256").update(fs.readFileSync(questionBankPath)).digest("hex");

  return {
    schemaVersion: 1,
    generatedOn,
    sourceBankVersion: data.version,
    sourceBankGeneratedOn: data.generatedOn,
    sourceBankQuestionCount: data.questions.length,
    sourceBankSignature: `sha256:${questionBankSignature}`,
    includedPairCount: eligiblePairs.length,
    includedQuestionCount: eligiblePairs.length * 2,
    excludedPairCount: excludedPairs.length,
    excludedQuestionCount: excludedQuestionIds.length,
    exclusions: [{
      reason: "legacy-gk-items-without-structured-references-or-temporal-scope",
      pairCount: excludedPairIds.length,
      questionCount: excludedQuestionIds.length,
      pairIds: excludedPairIds,
      questionIds: excludedQuestionIds
    }],
    topics,
    notes
  };
}

function validateBundle(bundle, data) {
  if (bundle.schemaVersion !== 1) fail("Unexpected GK Study Notes schema version");
  if (bundle.includedPairCount !== 708 || bundle.includedQuestionCount !== 1416) fail("Incorrect included GK Study Notes scope");
  if (bundle.excludedPairCount !== 18 || bundle.excludedQuestionCount !== 36) fail("Incorrect excluded legacy scope");
  if (!Array.isArray(bundle.notes) || bundle.notes.length !== 708) fail("Expected exactly 708 GK Study Notes");
  if (new Set(bundle.notes.map((note) => note.id)).size !== bundle.notes.length) fail("Duplicate GK Study Note IDs");
  if (new Set(bundle.notes.map((note) => note.pairId)).size !== bundle.notes.length) fail("Duplicate GK Study Note pair IDs");
  if (bundle.notes.some((note) => !Array.isArray(note.facts) || note.facts.length !== 2)) fail("Every GK Study Note must contain two facts");
  if (bundle.notes.some((note) => note.facts[0].kind !== "source" || note.facts[1].kind !== "similar")) fail("GK Study Note facts are not in source/similar order");
  if (bundle.notes.some((note) => !note.subtitleUrdu || !/[\u0600-\u06ff]/u.test(note.subtitleUrdu))) fail("A GK Study Note lacks an Urdu summary");
  if (bundle.notes.some((note) => !note.memoryHookUrdu || !/[\u0600-\u06ff]/u.test(note.memoryHookUrdu))) fail("A GK Study Note lacks an Urdu memory hook");
  if (bundle.notes.some((note) => note.facts.some((fact) => !Array.isArray(fact.references) || fact.references.length < 2))) fail("A GK Study Note fact lacks structured references");
  if (bundle.notes.some((note) => note.facts.some((fact) => fact.references.some((reference) => !/^https:\/\//i.test(String(reference.url || "")))))) fail("A GK Study Note reference is not HTTPS");
  if (bundle.notes.some((note) => note.facts.some((fact) => fact.temporalScope.type === "as-of" && fact.temporalScope.reverifyAfter < generatedOn))) {
    fail("A GK Study Note as-of fact is overdue for reverification");
  }
  const knownQuestionIds = new Set(data.questions.map((question) => question.id));
  if (bundle.notes.some((note) => note.facts.some((fact) => !knownQuestionIds.has(fact.questionId)))) fail("A GK Study Note references an unknown question");
  const serialized = JSON.stringify(bundle);
  if (/\uFFFD/u.test(serialized) || /(?:Ã[\u0080-\u00ff]|Â[\u0080-\u00ff])/u.test(serialized)) fail("GK Study Notes contain likely mojibake");
}

function serializeBundle(bundle) {
  const json = JSON.stringify(bundle, null, 2)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `(function () {\n  "use strict";\n\n  window.PPSC_GK_STUDY_NOTES_DATA = ${json};\n  window.PPSC_GK_STUDY_NOTES = window.PPSC_GK_STUDY_NOTES_DATA.notes;\n})();\n`;
}

function main() {
  const validateOnly = process.argv.includes("--validate-only");
  const checkOnly = process.argv.includes("--check");
  const data = loadQuestionBank();
  const bundle = createBundle(data);
  validateBundle(bundle, data);
  const output = serializeBundle(bundle);

  if (checkOnly) {
    if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== output) {
      fail("data/gk-study-notes.js is stale; run node tools/build-gk-study-notes.js");
    }
  } else if (!validateOnly) {
    fs.writeFileSync(outputPath, output, "utf8");
  }

  const topicSummary = bundle.topics.map((topic) => `${topic.id}=${topic.noteCount}`).join(", ");
  console.log(`GK Study Notes: ${bundle.notes.length} notes / ${bundle.includedQuestionCount} referenced MCQs; ${bundle.excludedPairCount} legacy pairs excluded.`);
  console.log(`Topics: ${topicSummary}`);
  if (validateOnly) console.log("Validate-only mode: no files written.");
  if (checkOnly) console.log("Generated GK Study Notes are current.");
}

try {
  main();
} catch (reason) {
  console.error(`GK Study Notes build failed: ${reason.message}`);
  process.exitCode = 1;
}
