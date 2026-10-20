(function () {
  "use strict";

  // Read-only reference library. Never touches quiz, queue or cloud storage.
  var initialized = false;
  var loading = null;
  var entries = null;
  var nodes = {};
  var categoryNames = new Map();
  var questionsById = new Map();
  var questionNumbers = new Map();
  var openedYears = new Set();

  function text(value) {
    return String(value == null ? "" : value).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function make(tag, className, value) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = value;
    return element;
  }

  function loadData() {
    if (entries) return Promise.resolve(entries);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      var timer;
      function finish(error) {
        window.clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        if (error) {
          script.remove();
          reject(error);
          return;
        }
        var bundle = window.PPSC_YEAR_TOPICS_DATA;
        if (!bundle || bundle.schemaVersion !== 1 || !Array.isArray(bundle.entries) || !bundle.entries.length) {
          script.remove();
          reject(new Error("Invalid year topics data"));
          return;
        }
        entries = bundle.entries;
        resolve(entries);
      }
      script.src = "data/year-topics.js?v=20261020-1";
      script.onload = function () { finish(); };
      script.onerror = function () { finish(new Error("Year topics could not load")); };
      timer = window.setTimeout(function () { finish(new Error("Year topics load timeout")); }, 20000);
      document.head.appendChild(script);
    }).catch(function (error) {
      loading = null;
      throw error;
    });
    return loading;
  }

  function renderSources(entry, container) {
    var details = make("details", "year-topic-sources");
    details.appendChild(make("summary", "", "MCQ hawala (" + entry.questionIds.length + ")"));
    var list = make("ul", "year-topic-source-list");
    entry.questionIds.forEach(function (id) {
      var question = questionsById.get(id);
      if (!question) return;
      var row = make("li");
      row.appendChild(make("small", "", categoryNames.get(question.categoryId)
        + " · MCQ " + questionNumbers.get(id)));
      row.appendChild(make("p", "", question.question));
      row.appendChild(make("p", "", "Answer: " + question.options[question.correctOptionIndex]));
      list.appendChild(row);
    });
    details.appendChild(list);
    container.appendChild(details);
  }

  function renderYearTopics(group, details) {
    if (details.dataset.rendered === "true") return;
    details.dataset.rendered = "true";
    var list = make("ol", "year-topics-numbered");
    list.lang = "ur-Latn";
    group.entries.forEach(function (entry) {
      var row = make("li", "year-topic-row");
      row.dataset.topicId = entry.id;
      row.appendChild(make("h3", "", entry.title));
      if (entry.dateLabel) row.appendChild(make("p", "year-topic-date", entry.dateLabel));
      row.appendChild(make("p", "year-topic-description", entry.description));
      row.appendChild(make("p", "year-topic-category", entry.categoryIds.map(function (id) {
        return categoryNames.get(id) || id;
      }).join(" · ")));
      renderSources(entry, row);
      list.appendChild(row);
    });
    details.appendChild(list);
  }

  function render() {
    if (!entries) return;
    var query = text(nodes.search.value);
    var yearQuery = /^\d{1,4}$/.test(query) ? Number(query) : null;
    var categoryId = nodes.category.value;
    var era = nodes.calendar.value;
    var filtered = entries.filter(function (entry) {
      return (categoryId === "all" || entry.categoryIds.includes(categoryId))
        && (era === "all" || entry.era === era)
        && (!query || (yearQuery !== null ? entry.year === yearQuery
          : text([entry.year, entry.era, entry.dateLabel, entry.title, entry.description,
            entry.categoryIds.map(function (id) { return categoryNames.get(id); }).join(" ")].join(" ")).includes(query)));
    });
    var groups = new Map();
    filtered.forEach(function (entry) {
      var key = entry.era + ":" + entry.year;
      if (!groups.has(key)) groups.set(key, { key: key, year: entry.year, era: entry.era, entries: [] });
      groups.get(key).entries.push(entry);
    });
    nodes.list.textContent = "";
    var fragment = document.createDocumentFragment();
    var lastSection = "";
    groups.forEach(function (group) {
      var section = group.era === "AH" ? "AH" : "historical";
      if (lastSection !== section) {
        fragment.appendChild(make("h2", "years-topics-era-heading", section === "AH"
          ? "Hijri years (AH) — alag taqweem" : "Historical years (BCE / CE)"));
        if (section === "AH") {
          fragment.appendChild(make("p", "years-topics-note",
            "Hijri saal alag calendar ke hain; inhein CE years ke saath number ki bunyaad par mix nahi kiya gaya."));
        }
        lastSection = section;
      }
      var details = make("details", "year-topics-year");
      details.dataset.yearKey = group.key;
      var summary = make("summary", "year-topics-year-heading");
      summary.appendChild(make("span", "year-topics-year-label", group.year + " " + group.era));
      summary.appendChild(make("span", "year-topics-year-count", group.entries.length + (group.entries.length === 1 ? " topic" : " topics")));
      details.appendChild(summary);
      details.open = openedYears.has(group.key);
      if (details.open) renderYearTopics(group, details);
      details.addEventListener("toggle", function () {
        if (details.open) {
          openedYears.add(group.key);
          renderYearTopics(group, details);
        } else {
          openedYears.delete(group.key);
        }
      });
      fragment.appendChild(details);
    });
    nodes.list.appendChild(fragment);
    nodes.empty.hidden = filtered.length !== 0;
    nodes.collapse.disabled = !filtered.length;
    nodes.clear.disabled = !query && categoryId === "all" && era === "all";
    nodes.status.textContent = groups.size + " saal · " + filtered.length + " topics nazar aa rahe hain";
    nodes.coverage.textContent = entries.length
      + " muntakhib MCQ topics. Har date ka mukammal index nahi.";
  }

  function show() {
    nodes.error.hidden = true;
    nodes.retry.hidden = true;
    nodes.empty.hidden = true;
    nodes.status.textContent = "Topics load ho rahe hain...";
    nodes.screen.setAttribute("aria-busy", "true");
    return loadData().then(function () {
      render();
    }).catch(function () {
      nodes.error.hidden = false;
      nodes.retry.hidden = false;
      nodes.status.textContent = "Topics abhi load nahi hue.";
    }).finally(function () {
      nodes.screen.removeAttribute("aria-busy");
    });
  }

  function init(options) {
    if (initialized) return;
    initialized = true;
    ["screen", "card", "back", "search", "category", "calendar", "clear", "collapse", "status",
      "coverage", "error", "retry", "empty", "list"].forEach(function (name) {
      nodes[name] = document.getElementById("years-topics-" + name);
    });
    options.categories.forEach(function (category) {
      categoryNames.set(category.id, category.name);
      var option = make("option", "", category.name);
      option.value = category.id;
      nodes.category.appendChild(option);
    });
    var ordinals = new Map();
    options.questions.forEach(function (question) {
      var number = (ordinals.get(question.categoryId) || 0) + 1;
      ordinals.set(question.categoryId, number);
      questionsById.set(question.id, question);
      questionNumbers.set(question.id, number);
    });
    nodes.card.addEventListener("click", function () {
      options.open();
      show();
    });
    nodes.back.addEventListener("click", function () {
      options.close();
      nodes.card.focus({ preventScroll: true });
    });
    nodes.retry.addEventListener("click", show);
    nodes.search.addEventListener("input", render);
    nodes.category.addEventListener("change", render);
    nodes.calendar.addEventListener("change", render);
    nodes.clear.addEventListener("click", function () {
      nodes.search.value = "";
      nodes.category.value = "all";
      nodes.calendar.value = "all";
      render();
      nodes.search.focus();
    });
    nodes.collapse.addEventListener("click", function () {
      openedYears.clear();
      nodes.list.querySelectorAll(".year-topics-year[open]").forEach(function (details) { details.open = false; });
    });
  }

  window.PPSC_YEAR_TOPICS = Object.freeze({ init: init });
})();
