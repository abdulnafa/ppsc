"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const project = path.resolve(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(project, "data", "questions.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(project, "data", "topic-taxonomy.js"), "utf8"), sandbox);

const { categories, questions } = sandbox.window.PPSC_QUIZ_DATA;
const taxonomy = sandbox.window.PPSC_TOPIC_DATA;
assert.ok(taxonomy, "Topic module must expose PPSC_TOPIC_DATA.");
assert.ok(questions.length > 10000, "Expected the complete existing question bank.");

const originalIds = questions.map((question) => question.id);
const summary = [];
let totalPairs = 0;
let crossPaperFocusGroups = 0;

for (const category of categories) {
  const selected = questions.filter((question) => question.categoryId === category.id);
  const sorted = taxonomy.sortQuestions(selected);
  const topics = taxonomy.getTopics(category.id);

  assert.equal(sorted.length, selected.length, category.id + ": sort changed question count");
  assert.equal(topics.reduce((sum, topic) => sum + topic.count, 0), selected.length,
    category.id + ": topic counts do not cover all questions");
  assert.deepEqual(new Set(sorted.map((question) => question.id)), new Set(selected.map((question) => question.id)),
    category.id + ": sort lost or duplicated questions");
  assert.ok(topics.length >= 8, category.id + ": taxonomy is too coarse");

  const positions = new Map(sorted.map((question, index) => [question.id, index]));
  const family = new Map();
  const focusGroups = new Map();
  let lastTopicOrder = -1;
  let lastTopicId = "";
  for (const question of sorted) {
    const topic = taxonomy.getTopic(question);
    assert.ok(topic && topic.id && topic.label, question.id + ": missing topic");
    assert.equal(topic.categoryId, category.id, question.id + ": wrong category topic");
    assert.ok(topic.order >= lastTopicOrder, category.id + ": topics are not in taxonomy order");
    if (topic.order === lastTopicOrder && lastTopicId) {
      assert.ok(topic.id >= lastTopicId, category.id + ": dynamic topics not sorted deterministically");
    }
    lastTopicOrder = topic.order;
    lastTopicId = topic.id;

    if (question.pairId) {
      if (!family.has(question.pairId)) family.set(question.pairId, []);
      family.get(question.pairId).push(question);
    }
    const focus = taxonomy.getFocusKey(question);
    if (focus) {
      const key = topic.id + "|" + focus;
      if (!focusGroups.has(key)) focusGroups.set(key, []);
      focusGroups.get(key).push(question);
    }
  }

  for (const [pairId, members] of family) {
    if (members.length < 2) continue;
    const first = positions.get(members[0].id);
    const second = positions.get(members[1].id);
    assert.equal(Math.abs(first - second), 1, category.id + "/" + pairId + ": source/similar pair split");
    assert.equal(taxonomy.getTopic(members[0]).id, taxonomy.getTopic(members[1]).id,
      category.id + "/" + pairId + ": source/similar topics differ");
    totalPairs += 1;
  }

  for (const group of focusGroups.values()) {
    const distinctPairs = new Set(group.map((question) => question.pairId || question.id));
    if (distinctPairs.size < 2) continue;
    const indexes = group.map((question) => positions.get(question.id));
    assert.equal(Math.max(...indexes) - Math.min(...indexes) + 1, indexes.length,
      category.id + ": same-subject questions are not contiguous");
    crossPaperFocusGroups += 1;
  }

  const fallback = topics.find((topic) => topic.id === "other");
  const fallbackPercentage = fallback ? 100 * fallback.count / selected.length : 0;
  assert.ok(fallbackPercentage < 10, category.id + ": generic fallback is " + fallbackPercentage.toFixed(1) + "%");
  summary.push({
    category: category.id,
    questions: selected.length,
    topics: topics.length,
    fallbackPercent: Number(fallbackPercentage.toFixed(1)),
    topTopics: [...topics].sort((left, right) => right.count - left.count).slice(0, 3)
      .map((topic) => topic.label + " (" + topic.count + ")")
  });
}

function findStem(text) {
  const question = questions.find((item) => item.question.includes(text));
  assert.ok(question, "Missing expected sample stem: " + text);
  return taxonomy.getTopic(question).id;
}

assert.equal(findStem("synonym of 'jealous'"), "synonyms");
assert.equal(findStem("antonym of 'profane'"), "antonyms");
assert.equal(findStem("Pakistan Peoples Party founded"), "political-parties");
assert.equal(findStem("Article 58(2)(b)"), "constitution-articles");
assert.equal(findStem("Sulu Sea is a marginal sea"), "oceans-seas");
assert.equal(findStem("Factorize: x² + 16x"), "factorization");
assert.equal(findStem("arithmetic progression starts at 5"), "sequences-patterns");
assert.equal(taxonomy.getTopic({
  id: "FUTURE-Q1-SRC",
  categoryId: "pakistan-studies",
  question: "A future editorial question",
  tags: ["topic:constitution-articles"]
}).id, "constitution-articles", "Future questions must respect explicit topic tags.");
assert.equal(taxonomy.getTopic({
  id: "FUTURE-Q2-SRC",
  categoryId: "general-knowledge",
  question: "A future editorial question",
  tags: ["topic:new-editorial-topic"]
}).label, "New Editorial Topic", "New editorial topic IDs must work without code changes.");

assert.deepEqual(questions.map((question) => question.id), originalIds,
  "Taxonomy must not mutate question bank order or IDs.");

console.log(JSON.stringify({
  questionCount: questions.length,
  categories: summary,
  adjacentPairs: totalPairs,
  crossPaperFocusGroups
}, null, 2));
