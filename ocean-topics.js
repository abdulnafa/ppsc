(function () {
  "use strict";

  var DATA_URL = "data/ocean-topics.json?v=20261024-1";
  var state = {
    initialized: false,
    data: null,
    loading: null,
    query: "",
    view: "all",
    openGroups: {},
    questionsById: {},
    categoryNames: {},
    config: null,
    elements: {}
  };

  function byId(id) { return document.getElementById(id); }
  function node(tag, className, value) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  }
  function normalize(value) { return String(value || "").normalize("NFKC").toLocaleLowerCase().trim(); }
  function setHidden(element, hidden) { if (element) element.hidden = !!hidden; }
  function setStatus(message) { state.elements.status.textContent = message; }
  function questionFor(id) { return state.questionsById[id] || null; }
  function linkedQuestions(topic) {
    var seen = {};
    return (topic.questionIds || []).map(questionFor).filter(function (question) {
      if (!question || seen[question.id]) return false;
      seen[question.id] = true;
      return true;
    });
  }
  function matches(topic) {
    var count = linkedQuestions(topic).length;
    if (state.view === "linked" && !count) return false;
    if (state.view === "extra" && count) return false;
    if (!state.query) return true;
    var values = [topic.name, topic.kind, topic.detail, topic.note];
    linkedQuestions(topic).forEach(function (question) {
      values.push(question.question, question.questionUrdu);
      if (Array.isArray(question.options)) values.push(question.options[question.correctOptionIndex]);
      if (Array.isArray(question.optionsUrdu)) values.push(question.optionsUrdu[question.correctOptionIndex]);
    });
    return normalize(values.join(" ")).indexOf(state.query) !== -1;
  }
  function validData(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.groups) || !data.groups.length) return false;
    return data.groups.every(function (group) {
      return group.id && group.label && Array.isArray(group.topics) && group.topics.every(function (topic) {
        return topic.id && topic.name && topic.detail && Array.isArray(topic.questionIds) && /^https:\/\//.test(topic.sourceUrl);
      });
    });
  }
  function renderQuestion(question) {
    var card = node("article", "pakistan-provinces-mcq ocean-topics-mcq");
    card.setAttribute("data-question-id", question.id);
    var useUrdu = question.categoryId === "urdu" && question.questionUrdu;
    var options = useUrdu && Array.isArray(question.optionsUrdu) ? question.optionsUrdu : question.options;
    var correct = Array.isArray(options) ? options[question.correctOptionIndex] : "";
    var sourceType = question.kind === "source" ? "Source paper" : question.kind === "similar" ? "Related practice" : "MCQ";
    card.appendChild(node("span", "pakistan-provinces-mcq-category", (state.categoryNames[question.categoryId] || "MCQ") + " · " + sourceType));
    var prompt = node("p", "pakistan-provinces-mcq-question", useUrdu ? question.questionUrdu : question.question);
    var answer = node("p", "pakistan-provinces-mcq-answer", (useUrdu ? "جواب: " : "Answer: ") + (correct || "Answer unavailable"));
    if (useUrdu) {
      prompt.lang = "ur";
      prompt.dir = "rtl";
      answer.lang = "ur";
      answer.dir = "rtl";
    }
    card.appendChild(prompt);
    card.appendChild(answer);
    return card;
  }
  function renderTopic(topic) {
    var details = node("details", "pakistan-provinces-item ocean-topics-item");
    details.setAttribute("data-topic-id", topic.id);
    var summary = node("summary", "pakistan-provinces-item-summary");
    var questions = linkedQuestions(topic);
    summary.appendChild(node("strong", "", topic.name));
    summary.appendChild(node("span", "pakistan-provinces-item-badge", topic.kind + " · " + (questions.length ? questions.length + " MCQ" + (questions.length === 1 ? "" : "s") : "Extra revision")));
    details.appendChild(summary);
    var body = node("div", "pakistan-provinces-item-body");
    body.appendChild(node("p", "pakistan-provinces-detail", topic.detail));
    if (topic.note) body.appendChild(node("p", "pakistan-provinces-note", topic.note));
    var link = node("a", "pakistan-provinces-source ocean-topics-source", "Source ↗");
    link.href = topic.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    body.appendChild(link);
    if (questions.length) {
      body.appendChild(node("h3", "pakistan-provinces-linked-heading", "Related MCQs already in your bank"));
      questions.forEach(function (question) { body.appendChild(renderQuestion(question)); });
    } else {
      body.appendChild(node("p", "pakistan-provinces-no-mcq", "Extra related revision; no direct saved MCQ is linked yet."));
    }
    details.appendChild(body);
    return details;
  }
  function renderGroup(group, index) {
    var topics = group.topics.filter(matches);
    var details = node("details", "pakistan-provinces-group ocean-topics-group");
    details.setAttribute("data-group-id", group.id);
    details.open = state.query ? topics.length > 0 : state.openGroups[group.id] !== undefined ? state.openGroups[group.id] : index === 0;
    details.addEventListener("toggle", function () { state.openGroups[group.id] = details.open; });
    var summary = node("summary", "pakistan-provinces-group-summary");
    summary.appendChild(node("strong", "", group.label));
    summary.appendChild(node("span", "pakistan-provinces-group-count", topics.length + " topic" + (topics.length === 1 ? "" : "s")));
    details.appendChild(summary);
    var list = node("div", "pakistan-provinces-group-list");
    if (topics.length) {
      topics.forEach(function (topic) { list.appendChild(renderTopic(topic)); });
    } else {
      list.appendChild(node("p", "pakistan-provinces-empty", "Is filter se yahan koi topic nahi mila."));
    }
    details.appendChild(list);
    return { node: details, count: topics.length };
  }
  function render() {
    if (!state.data) return;
    state.elements.clear.disabled = !state.query && state.view === "all";
    state.elements.list.replaceChildren();
    var visible = 0;
    state.data.groups.forEach(function (group, index) {
      var rendered = renderGroup(group, index);
      state.elements.list.appendChild(rendered.node);
      visible += rendered.count;
    });
    setStatus(visible + " topic" + (visible === 1 ? "" : "s") + " shown across " + state.data.groups.length + " sections.");
  }
  function showError() {
    state.elements.list.replaceChildren();
    setHidden(state.elements.error, false);
    setHidden(state.elements.retry, false);
    setStatus("Ocean topics unavailable.");
  }
  function loadData() {
    if (state.data) return Promise.resolve(state.data);
    if (state.loading) return state.loading;
    setStatus("Ocean topics load ho rahe hain...");
    setHidden(state.elements.error, true);
    setHidden(state.elements.retry, true);
    state.loading = fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }).then(function (data) {
      if (!validData(data)) throw new Error("Invalid ocean topic data");
      state.data = data;
      var topics = 0;
      var questionIds = new Set();
      data.groups.forEach(function (group) {
        topics += group.topics.length;
        group.topics.forEach(function (topic) { topic.questionIds.forEach(function (id) { questionIds.add(id); }); });
      });
      state.elements.coverage.textContent = topics + " study topics · " + questionIds.size + " linked MCQs · source-backed notes";
      render();
      return data;
    }).catch(function (error) {
      showError();
      throw error;
    }).finally(function () { state.loading = null; });
    return state.loading;
  }
  function open() {
    state.config.open();
    loadData().catch(function () { /* Visible error and retry are handled above. */ });
  }
  function openMap() {
    var card = byId("world-map-card");
    var layer = byId("world-map-layer");
    if (!card || !layer) return;
    card.click();
    layer.value = "marine";
    layer.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function init(config) {
    if (state.initialized) return;
    state.config = config;
    state.elements = {
      card: byId("ocean-topics-card"),
      back: byId("ocean-topics-back"),
      map: byId("ocean-topics-map"),
      search: byId("ocean-topics-search"),
      view: byId("ocean-topics-view"),
      clear: byId("ocean-topics-clear"),
      coverage: byId("ocean-topics-coverage"),
      status: byId("ocean-topics-status"),
      error: byId("ocean-topics-error"),
      retry: byId("ocean-topics-retry"),
      list: byId("ocean-topics-list")
    };
    if (!state.elements.card || !state.elements.list) return;
    (config.questions || []).forEach(function (question) { state.questionsById[question.id] = question; });
    (config.categories || []).forEach(function (category) { state.categoryNames[category.id] = category.name; });
    state.elements.card.addEventListener("click", open);
    state.elements.back.addEventListener("click", function () {
      config.close();
      state.elements.card.focus({ preventScroll: true });
    });
    state.elements.map.addEventListener("click", openMap);
    state.elements.search.addEventListener("input", function () {
      state.query = normalize(state.elements.search.value);
      render();
    });
    state.elements.view.addEventListener("change", function () {
      state.view = state.elements.view.value;
      render();
    });
    state.elements.clear.addEventListener("click", function () {
      state.query = "";
      state.view = "all";
      state.elements.search.value = "";
      state.elements.view.value = "all";
      state.elements.search.focus();
      render();
    });
    state.elements.retry.addEventListener("click", function () {
      loadData().catch(function () { /* Visible error and retry are handled above. */ });
    });
    state.initialized = true;
  }

  window.PPSC_OCEAN_TOPICS = { init: init };
}());
