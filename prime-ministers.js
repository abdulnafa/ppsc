(function () {
  "use strict";

  // Read-only reference screen: independent of quiz, queue and cloud state.
  var initialized = false;
  var loading = null;
  var bundle = null;
  var nodes = {};
  var opened = new Set();
  var sources = new Map();
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function normalize(value) {
    return String(value == null ? "" : value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  }

  function make(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = value;
    return node;
  }

  function dateLabel(value) {
    var parts = value.split("-");
    if (parts.length === 1) return value;
    return (parts[2] ? Number(parts[2]) + " " : "") + months[Number(parts[1]) - 1] + " " + parts[0];
  }

  function tenureLabel(tenure) {
    return dateLabel(tenure.start) + " \u2013 " + (tenure.end ? dateLabel(tenure.end)
      : "Present (checked " + dateLabel(bundle.verifiedOn) + ")") + (tenure.label ? " \u00b7 " + tenure.label : "");
  }

  function loadData() {
    if (bundle) return Promise.resolve(bundle);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      var timer;
      var settled = false;
      function finish(error) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        var data = window.PPSC_PRIME_MINISTERS_DATA;
        if (!error && (!data || data.schemaVersion !== 1 || !Array.isArray(data.entries)
          || !data.entries.length || !Array.isArray(data.sections) || !Array.isArray(data.sources))) {
          error = new Error("Invalid prime ministers data");
        }
        if (error) {
          script.remove();
          reject(error);
          return;
        }
        bundle = data;
        data.sources.forEach(function (source) { sources.set(source.id, source); });
        resolve(bundle);
      }
      script.src = "data/prime-ministers.js?v=20261021-1";
      script.onload = function () { finish(); };
      script.onerror = function () { finish(new Error("Prime ministers could not load")); };
      timer = window.setTimeout(function () { finish(new Error("Prime ministers load timeout")); }, 20000);
      document.head.appendChild(script);
    }).catch(function (error) { loading = null; throw error; });
    return loading;
  }

  function renderBody(entry, details) {
    if (details.dataset.rendered === "true") return;
    details.dataset.rendered = "true";
    var body = make("div", "pm-entry-body");
    var intro = make("p", "", entry.summary);
    intro.lang = "ur-Latn";
    body.appendChild(intro);
    var facts = make("ol", "pm-facts");
    facts.lang = "ur-Latn";
    entry.facts.forEach(function (fact) { facts.appendChild(make("li", "", fact)); });
    body.appendChild(facts);
    var references = make("details", "water-topic-references");
    references.appendChild(make("summary", "", "Official references"));
    var list = make("ul");
    entry.sourceIds.forEach(function (id) {
      var source = sources.get(id);
      if (!source) return;
      var row = make("li");
      var link = make("a", "", source.title);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      row.appendChild(link);
      list.appendChild(row);
    });
    references.appendChild(list);
    body.appendChild(references);
    details.appendChild(body);
  }

  function render() {
    if (!bundle) return;
    var query = normalize(nodes.search.value);
    var sectionId = nodes.section.value;
    var count = 0;
    var fragment = document.createDocumentFragment();
    bundle.sections.forEach(function (section) {
      if (sectionId !== "all" && sectionId !== section.id) return;
      var matches = bundle.entries.filter(function (entry) {
        var text = [entry.name, entry.country, entry.summary, section.label].concat(entry.facts)
          .concat(entry.tenures.map(tenureLabel)).join(" ");
        return entry.section === section.id && (!query || normalize(text).includes(query));
      });
      if (!matches.length) return;
      fragment.appendChild(make("h2", "water-topics-section-title", section.label + " (" + matches.length + ")"));
      matches.forEach(function (entry) {
        count += 1;
        var details = make("details", "pm-entry");
        details.dataset.entryId = entry.id;
        details.dataset.section = entry.section;
        var summary = make("summary");
        summary.appendChild(make("span", "pm-name", entry.name));
        summary.appendChild(make("span", "pm-country", entry.country + (entry.section === "caretakers" ? " \u00b7 Caretaker" : "")));
        var tenures = make("span", "pm-tenures");
        entry.tenures.forEach(function (tenure) { tenures.appendChild(make("span", "", tenureLabel(tenure))); });
        summary.appendChild(tenures);
        details.appendChild(summary);
        details.open = opened.has(entry.id);
        if (details.open) renderBody(entry, details);
        details.addEventListener("toggle", function () {
          if (!details.isConnected) return;
          if (details.open) { opened.add(entry.id); renderBody(entry, details); }
          else opened.delete(entry.id);
        });
        fragment.appendChild(details);
      });
    });
    nodes.list.replaceChildren(fragment);
    nodes.empty.hidden = count !== 0;
    nodes.clear.disabled = !query && sectionId === "all";
    nodes.collapse.disabled = !count;
    nodes.status.textContent = count + " names shown \u00b7 " + bundle.entries.length + " total";
    var labels = { pakistan: "Pakistan regular", caretakers: "caretakers", world: "selected world PMs" };
    nodes.coverage.textContent = bundle.sections.map(function (section) {
      return bundle.entries.filter(function (entry) { return entry.section === section.id; }).length + " " + labels[section.id];
    }).join(" \u00b7 ") + ". Checked: " + dateLabel(bundle.verifiedOn)
      + ". Saved progress aur queue wohi hain.";
  }

  function show() {
    nodes.error.hidden = true;
    nodes.retry.hidden = true;
    nodes.empty.hidden = true;
    nodes.status.textContent = "List load ho rahi hai...";
    nodes.screen.setAttribute("aria-busy", "true");
    return loadData().then(render).catch(function () {
      nodes.error.hidden = false;
      nodes.retry.hidden = false;
      nodes.status.textContent = "List abhi load nahi hui.";
    }).finally(function () { nodes.screen.removeAttribute("aria-busy"); });
  }

  function init(options) {
    if (initialized) return;
    initialized = true;
    ["screen", "card", "back", "search", "section", "clear", "collapse", "status",
      "coverage", "error", "retry", "empty", "list"].forEach(function (key) {
      nodes[key] = document.getElementById("prime-ministers-" + key);
    });
    nodes.card.addEventListener("click", function () { options.open(); show(); });
    nodes.back.addEventListener("click", function () { options.close(); nodes.card.focus({ preventScroll: true }); });
    nodes.retry.addEventListener("click", show);
    nodes.search.addEventListener("input", render);
    nodes.section.addEventListener("change", render);
    nodes.clear.addEventListener("click", function () {
      nodes.search.value = "";
      nodes.section.value = "all";
      render();
      nodes.search.focus();
    });
    nodes.collapse.addEventListener("click", function () {
      opened.clear();
      nodes.list.querySelectorAll(".pm-entry[open]").forEach(function (details) { details.open = false; });
    });
  }

  window.PPSC_PRIME_MINISTERS = Object.freeze({ init: init });
})();
