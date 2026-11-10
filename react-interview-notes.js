(function () {
  "use strict";

  var DATA_URL = "data/react-interview-notes.json?v=20261110-2";
  var state = {
    initialized: false,
    data: null,
    loading: null,
    query: "",
    topic: "all",
    openGroups: {},
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
  function normalize(value) {
    return String(value || "").normalize("NFKC").toLocaleLowerCase().trim();
  }
  function setHidden(element, hidden) {
    if (element) element.hidden = !!hidden;
  }
  function setStatus(message) {
    if (state.elements.status) state.elements.status.textContent = message;
  }

  function validData(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.groups) || !data.groups.length) {
      return false;
    }
    return data.groups.every(function (group) {
      return group.id && group.label && Array.isArray(group.notes) && group.notes.length > 0
        && group.notes.every(function (note) {
          return note.id && note.question && note.answer
            && (note.syntax === undefined || note.syntax === null || typeof note.syntax === "string");
        });
    });
  }

  function noteMatches(note, group) {
    if (state.topic !== "all" && group.id !== state.topic) return false;
    if (!state.query) return true;
    var haystack = [group.label, note.question, note.answer, note.syntax || ""].join(" ");
    return normalize(haystack).indexOf(state.query) !== -1;
  }

  function renderNote(note) {
    var details = node("details", "pakistan-provinces-item react-notes-item");
    details.setAttribute("data-note-id", note.id);
    var summary = node("summary", "pakistan-provinces-item-summary");
    summary.appendChild(node("strong", "react-notes-question", "Q: " + note.question));
    summary.appendChild(node("span", "pakistan-provinces-item-badge", note.syntax ? "Q + A + Syntax" : "Q + A"));
    details.appendChild(summary);

    var body = node("div", "pakistan-provinces-item-body react-notes-body");
    body.appendChild(node("p", "react-notes-answer", "A: " + note.answer));
    if (note.syntax) {
      body.appendChild(node("h3", "react-notes-syntax-label", "Syntax"));
      var pre = node("pre", "react-notes-syntax");
      pre.appendChild(node("code", "", note.syntax));
      body.appendChild(pre);
    }
    details.appendChild(body);
    return details;
  }

  function renderGroup(group, index) {
    var notes = group.notes.filter(function (note) { return noteMatches(note, group); });
    var details = node("details", "pakistan-provinces-group react-notes-group");
    details.setAttribute("data-group-id", group.id);
    details.open = state.query || state.topic !== "all"
      ? notes.length > 0
      : state.openGroups[group.id] !== undefined
        ? state.openGroups[group.id]
        : index === 0;
    details.addEventListener("toggle", function () {
      state.openGroups[group.id] = details.open;
    });

    var summary = node("summary", "pakistan-provinces-group-summary");
    summary.appendChild(node("strong", "", group.label));
    summary.appendChild(node(
      "span",
      "pakistan-provinces-group-count",
      notes.length + " note" + (notes.length === 1 ? "" : "s")
    ));
    details.appendChild(summary);

    var list = node("div", "pakistan-provinces-group-list");
    if (notes.length) {
      notes.forEach(function (note) { list.appendChild(renderNote(note)); });
    } else {
      list.appendChild(node("p", "pakistan-provinces-empty", "Is filter se yahan koi note nahi mila."));
    }
    details.appendChild(list);
    return { node: details, count: notes.length };
  }

  function fillTopicOptions() {
    if (!state.elements.topic || !state.data) return;
    var previous = state.elements.topic.value || "all";
    state.elements.topic.replaceChildren();
    var allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All topics";
    state.elements.topic.appendChild(allOption);
    state.data.groups.forEach(function (group) {
      var option = document.createElement("option");
      option.value = group.id;
      option.textContent = group.label;
      state.elements.topic.appendChild(option);
    });
    state.elements.topic.value = previous === "all" || state.data.groups.some(function (group) {
      return group.id === previous;
    })
      ? previous
      : "all";
    state.topic = state.elements.topic.value;
  }

  function render() {
    if (!state.data) return;
    state.elements.clear.disabled = !state.query && state.topic === "all";
    state.elements.list.replaceChildren();
    var visible = 0;
    state.data.groups.forEach(function (group, index) {
      var rendered = renderGroup(group, index);
      state.elements.list.appendChild(rendered.node);
      visible += rendered.count;
    });
    setStatus(
      visible + " note" + (visible === 1 ? "" : "s")
      + " shown across " + state.data.groups.length + " topics."
    );
  }

  function showError() {
    state.elements.list.replaceChildren();
    setHidden(state.elements.error, false);
    setHidden(state.elements.retry, false);
    setStatus("React notes unavailable.");
  }

  function loadData() {
    if (state.data) return Promise.resolve(state.data);
    if (state.loading) return state.loading;
    setStatus("React notes load ho rahe hain...");
    setHidden(state.elements.error, true);
    setHidden(state.elements.retry, true);
    state.loading = fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }).then(function (data) {
      if (!validData(data)) throw new Error("Invalid React interview notes data");
      state.data = data;
      var noteCount = data.groups.reduce(function (sum, group) {
        return sum + group.notes.length;
      }, 0);
      if (state.elements.coverage) {
        state.elements.coverage.textContent =
          noteCount + " revision notes · " + data.groups.length + " topics · read-only study";
      }
      fillTopicOptions();
      render();
      return data;
    }).catch(function (error) {
      showError();
      throw error;
    }).finally(function () {
      state.loading = null;
    });
    return state.loading;
  }

  function open() {
    state.config.open();
    loadData().catch(function () { /* Visible error/retry handled above. */ });
  }

  function init(config) {
    if (state.initialized) return;
    state.config = config;
    state.elements = {
      card: byId("react-interview-notes-card"),
      back: byId("react-interview-notes-back"),
      search: byId("react-interview-notes-search"),
      topic: byId("react-interview-notes-topic"),
      clear: byId("react-interview-notes-clear"),
      coverage: byId("react-interview-notes-coverage"),
      status: byId("react-interview-notes-status"),
      error: byId("react-interview-notes-error"),
      retry: byId("react-interview-notes-retry"),
      list: byId("react-interview-notes-list")
    };
    if (!state.elements.card || !state.elements.list) return;

    state.elements.card.addEventListener("click", open);
    state.elements.back.addEventListener("click", function () {
      config.close();
      state.elements.card.focus({ preventScroll: true });
    });
    state.elements.search.addEventListener("input", function () {
      state.query = normalize(state.elements.search.value);
      render();
    });
    state.elements.topic.addEventListener("change", function () {
      state.topic = state.elements.topic.value;
      render();
    });
    state.elements.clear.addEventListener("click", function () {
      state.query = "";
      state.topic = "all";
      state.elements.search.value = "";
      state.elements.topic.value = "all";
      state.elements.search.focus();
      render();
    });
    state.elements.retry.addEventListener("click", function () {
      loadData().catch(function () { /* Visible error/retry handled above. */ });
    });
    state.initialized = true;
  }

  window.PPSC_REACT_INTERVIEW_NOTES = { init: init };
}());
