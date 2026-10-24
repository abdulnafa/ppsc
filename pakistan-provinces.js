(function () {
  "use strict";

  var SECTION_LABELS = {
    mountains: "Mountains & plateaus",
    rivers: "Rivers",
    barrages: "Barrages & dams",
    lakes: "Lakes & wetlands"
  };
  var SECTION_KEYS = Object.keys(SECTION_LABELS);
  var DATA_URL = "data/pakistan-provinces-geography.json?v=20261024-1";
  var state = {
    initialized: false,
    data: null,
    loading: null,
    provinceId: "punjab",
    query: "",
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
  function setHidden(element, hidden) {
    if (element) element.hidden = !!hidden;
  }
  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }
  function getProvince() {
    if (!state.data) return null;
    for (var i = 0; i < state.data.provinces.length; i += 1) {
      if (state.data.provinces[i].id === state.provinceId) return state.data.provinces[i];
    }
    return null;
  }
  function isValidData(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.provinces) || data.provinces.length !== 4) return false;
    var ids = data.provinces.map(function (province) { return province.id; }).sort().join(",");
    if (ids !== "balochistan,kpk,punjab,sindh") return false;
    return data.provinces.every(function (province) {
      return province.sections && SECTION_KEYS.every(function (key) { return Array.isArray(province.sections[key]); });
    });
  }
  function setStatus(message) {
    state.elements.status.textContent = message;
  }
  function updateTabs() {
    var tabs = state.elements.tabs.querySelectorAll("[data-province-id]");
    for (var i = 0; i < tabs.length; i += 1) {
      var active = tabs[i].getAttribute("data-province-id") === state.provinceId;
      tabs[i].setAttribute("aria-pressed", active ? "true" : "false");
    }
  }
  function getLinkedQuestions(entry) {
    var found = [];
    var seen = {};
    (entry.questionIds || []).forEach(function (id) {
      var question = state.questionsById[id];
      if (question && !seen[id]) {
        found.push(question);
        seen[id] = true;
      }
    });
    return found;
  }
  function matchesQuery(entry) {
    if (!state.query) return true;
    var searchable = [entry.name, entry.kind, entry.detail, entry.provinceNote];
    getLinkedQuestions(entry).forEach(function (question) {
      searchable.push(question.question, question.questionUrdu);
      if (Array.isArray(question.options)) searchable.push(question.options[question.correctOptionIndex]);
    });
    return normalize(searchable.join(" ")).indexOf(state.query) !== -1;
  }
  function renderQuestion(question) {
    var card = node("article", "pakistan-provinces-mcq");
    card.setAttribute("data-question-id", question.id);
    var label = node("span", "pakistan-provinces-mcq-category", state.categoryNames[question.categoryId] || "MCQ");
    var useUrdu = question.categoryId === "urdu" && question.questionUrdu;
    var prompt = node("p", "pakistan-provinces-mcq-question", useUrdu ? question.questionUrdu : question.question);
    var answers = useUrdu && Array.isArray(question.optionsUrdu) ? question.optionsUrdu : question.options;
    var answerText = Array.isArray(answers) ? answers[question.correctOptionIndex] : "";
    var answer = node("p", "pakistan-provinces-mcq-answer", (useUrdu ? "جواب: " : "Answer: ") + (answerText || "Answer unavailable"));
    if (useUrdu) {
      prompt.lang = "ur";
      prompt.dir = "rtl";
      answer.lang = "ur";
      answer.dir = "rtl";
    }
    card.appendChild(label);
    card.appendChild(prompt);
    card.appendChild(answer);
    return card;
  }
  function renderEntry(entry) {
    var details = node("details", "pakistan-provinces-item");
    details.setAttribute("data-entry-id", entry.id);
    var summary = node("summary", "pakistan-provinces-item-summary");
    var title = node("strong", "", entry.name);
    var count = getLinkedQuestions(entry).length;
    var badge = node("span", "pakistan-provinces-item-badge", entry.kind + (count ? " · " + count + " MCQ" + (count === 1 ? "" : "s") : " · Extra revision"));
    summary.appendChild(title);
    summary.appendChild(badge);
    details.appendChild(summary);
    var body = node("div", "pakistan-provinces-item-body");
    body.appendChild(node("p", "pakistan-provinces-detail", entry.detail));
    if (entry.provinceNote) body.appendChild(node("p", "pakistan-provinces-note", entry.provinceNote));
    var source = node("a", "pakistan-provinces-source", "Official source ↗");
    source.href = entry.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    body.appendChild(source);
    var linked = getLinkedQuestions(entry);
    if (linked.length) {
      var heading = node("h3", "pakistan-provinces-linked-heading", "Related MCQs already in your bank");
      body.appendChild(heading);
      linked.forEach(function (question) { body.appendChild(renderQuestion(question)); });
    } else {
      body.appendChild(node("p", "pakistan-provinces-no-mcq", "Extra related revision; no direct saved MCQ is linked yet."));
    }
    details.appendChild(body);
    return details;
  }
  function renderGroup(province, key) {
    var entries = province.sections[key].filter(matchesQuery);
    var details = node("details", "pakistan-provinces-group");
    details.setAttribute("data-kind", key);
    details.open = state.openGroups[key] !== false;
    details.addEventListener("toggle", function () { state.openGroups[key] = details.open; });
    var summary = node("summary", "pakistan-provinces-group-summary");
    summary.appendChild(node("strong", "", SECTION_LABELS[key]));
    summary.appendChild(node("span", "pakistan-provinces-group-count", entries.length + " topic" + (entries.length === 1 ? "" : "s")));
    details.appendChild(summary);
    var list = node("div", "pakistan-provinces-group-list");
    if (entries.length) {
      entries.forEach(function (entry) { list.appendChild(renderEntry(entry)); });
    } else {
      list.appendChild(node("p", "pakistan-provinces-empty", state.query ? "Is search se yahan koi topic nahi mila." : "Is section mein abhi koi verified topic nahi hai."));
    }
    details.appendChild(list);
    return { node: details, count: entries.length };
  }
  function render() {
    updateTabs();
    state.elements.clear.disabled = !state.query;
    var province = getProvince();
    if (!province) return;
    state.elements.overview.textContent = province.overview;
    state.elements.sections.replaceChildren();
    var total = 0;
    SECTION_KEYS.forEach(function (key) {
      var group = renderGroup(province, key);
      state.elements.sections.appendChild(group.node);
      total += group.count;
    });
    setStatus(province.name + ": " + total + " topic" + (total === 1 ? "" : "s") + (state.query ? " matching your search." : " across four sections."));
  }
  function showError() {
    state.elements.sections.replaceChildren();
    state.elements.overview.textContent = "";
    setHidden(state.elements.error, false);
    setHidden(state.elements.retry, false);
    setStatus("Study list unavailable.");
  }
  function loadData() {
    if (state.data) return Promise.resolve(state.data);
    if (state.loading) return state.loading;
    setStatus("Verified province topics load ho rahe hain...");
    setHidden(state.elements.error, true);
    setHidden(state.elements.retry, true);
    state.loading = fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }).then(function (data) {
      if (!isValidData(data)) throw new Error("Invalid province data");
      state.data = data;
      var total = 0;
      data.provinces.forEach(function (province) {
        SECTION_KEYS.forEach(function (key) { total += province.sections[key].length; });
      });
      state.elements.coverage.textContent = "4 provinces · " + total + " verified study topics · official references and linked bank MCQs";
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
    loadData().catch(function () { /* Error is shown in the screen, with a retry button. */ });
  }
  function selectProvince(id) {
    if (id === state.provinceId) return;
    state.provinceId = id;
    state.query = "";
    state.elements.search.value = "";
    state.openGroups = {};
    render();
  }
  function init(config) {
    if (state.initialized) return;
    state.config = config;
    state.elements = {
      card: byId("pakistan-provinces-card"),
      back: byId("pakistan-provinces-back"),
      tabs: byId("pakistan-provinces-tabs"),
      search: byId("pakistan-provinces-search"),
      clear: byId("pakistan-provinces-clear"),
      coverage: byId("pakistan-provinces-coverage"),
      overview: byId("pakistan-provinces-overview"),
      status: byId("pakistan-provinces-status"),
      error: byId("pakistan-provinces-error"),
      retry: byId("pakistan-provinces-retry"),
      sections: byId("pakistan-provinces-sections")
    };
    if (!state.elements.card || !state.elements.sections) return;
    (config.questions || []).forEach(function (question) { state.questionsById[question.id] = question; });
    (config.categories || []).forEach(function (category) { state.categoryNames[category.id] = category.name; });
    state.elements.card.addEventListener("click", open);
    state.elements.back.addEventListener("click", function () {
      config.close();
      state.elements.card.focus({ preventScroll: true });
    });
    state.elements.tabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-province-id]");
      if (button && state.elements.tabs.contains(button)) selectProvince(button.getAttribute("data-province-id"));
    });
    state.elements.search.addEventListener("input", function () {
      state.query = normalize(state.elements.search.value);
      render();
    });
    state.elements.clear.addEventListener("click", function () {
      state.query = "";
      state.elements.search.value = "";
      state.elements.search.focus();
      render();
    });
    state.elements.retry.addEventListener("click", function () {
      loadData().catch(function () { /* Screen already shows the error. */ });
    });
    state.initialized = true;
  }

  window.PPSC_PROVINCES = { init: init };
}());
