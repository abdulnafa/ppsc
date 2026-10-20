(function () {
  "use strict";

  // Shared read-only renderer. Each library owns its filters, loading and open topics.
  // No session, queue or storage writes; existing water API stays compatible.
  function createReferenceLibrary(config) {
    var initialized = false;
    var loading = null;
    var bundle = null;
    var nodes = {};
    var questionsById = new Map();
    var categoryNames = new Map();
    var questionNumbers = new Map();
    var openedTopics = new Set();

    function normalize(value) {
      return String(value == null ? "" : value).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function make(tag, className, value) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (value != null) node.textContent = value;
      return node;
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
          var data = window[config.dataGlobal];
          if (!error && (!data || data.schemaVersion !== 1 || !Array.isArray(data.topics)
            || !data.topics.length || !Array.isArray(data.sections) || !data.sections.length)) {
            error = new Error("Invalid reference topics data");
          }
          if (error) {
            script.remove();
            reject(error);
            return;
          }
          bundle = data;
          resolve(bundle);
        }
        script.src = config.dataUrl;
        script.onload = function () { finish(); };
        script.onerror = function () { finish(new Error("Reference topics could not load")); };
        timer = window.setTimeout(function () { finish(new Error("Reference topics load timeout")); }, 20000);
        document.head.appendChild(script);
      }).catch(function (error) {
        loading = null;
        throw error;
      });
      return loading;
    }

    function renderBody(topic, questionIds, details) {
      if (details.dataset.rendered === "true") return;
      details.dataset.rendered = "true";
      var intro = make("p", "water-topic-intro", topic.summary);
      intro.lang = "ur-Latn";
      details.appendChild(intro);
      var sources = make("details", "water-topic-references");
      sources.appendChild(make("summary", "", "Official references"));
      var references = make("ul");
      topic.references.forEach(function (reference) {
        var row = make("li");
        var link = make("a", "", reference.title);
        link.href = reference.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        row.appendChild(link);
        references.appendChild(row);
      });
      sources.appendChild(references);
      details.appendChild(sources);
      var list = make("ol", "water-topic-questions");
      questionIds.forEach(function (id) {
        var question = questionsById.get(id);
        if (!question) return;
        var row = make("li");
        row.dataset.questionId = id;
        row.appendChild(make("p", "water-topic-question", question.question));
        var answer = make("p", "water-topic-answer");
        answer.appendChild(make("strong", "", "Answer: "));
        answer.appendChild(document.createTextNode(question.options[question.correctOptionIndex]));
        row.appendChild(answer);
        row.appendChild(make("small", "water-topic-source",
          (categoryNames.get(question.categoryId) || question.categoryId) + " \u00b7 MCQ " + questionNumbers.get(id)));
        if (topic.questionNotes && topic.questionNotes[id]) {
          var note = make("p", "water-topic-context", topic.questionNotes[id]);
          note.lang = "ur-Latn";
          row.appendChild(note);
        }
        if (question.sourceNotes) {
          var context = make("details", "water-topic-context");
          context.appendChild(make("summary", "", "Answer context"));
          context.appendChild(make("p", "", question.sourceNotes));
          row.appendChild(context);
        }
        list.appendChild(row);
      });
      details.appendChild(list);
    }

    function render() {
      if (!bundle) return;
      var query = normalize(nodes.search.value);
      var articleMatch = config.articleSearch && query.match(/^(?:article\s*)?(\d+[a-z]*)$/i);
      var sectionId = nodes.section.value;
      var topicCount = 0;
      var questionCount = 0;
      var fragment = document.createDocumentFragment();
      bundle.sections.forEach(function (section) {
        if (sectionId !== "all" && sectionId !== section.id) return;
        var matches = bundle.topics.filter(function (topic) { return topic.section === section.id; })
          .map(function (topic) {
            var wholeTopic = articleMatch
              ? (topic.articleNumbers || []).some(function (number) { return normalize(number) === articleMatch[1]; })
              : !query || normalize(topic.title + " " + topic.summary).includes(query);
            var questionIds = topic.questionIds.filter(function (id) {
              var question = questionsById.get(id);
              return question && (wholeTopic || (!articleMatch && normalize(question.question + " "
                + question.options[question.correctOptionIndex]).includes(query)));
            });
            return { topic: topic, questionIds: questionIds };
          }).filter(function (match) { return match.questionIds.length; });
        if (!matches.length) return;
        fragment.appendChild(make("h2", "water-topics-section-title", section.label));
        matches.forEach(function (match) {
          var topic = match.topic;
          topicCount += 1;
          questionCount += match.questionIds.length;
          var details = make("details", "water-topic");
          details.dataset.topicId = topic.id;
          details.dataset.section = topic.section;
          var summary = make("summary");
          summary.appendChild(make("span", "water-topic-title", topic.title));
          summary.appendChild(make("span", "water-topic-count", match.questionIds.length + " MCQs"));
          details.appendChild(summary);
          details.open = openedTopics.has(topic.id);
          if (details.open) renderBody(topic, match.questionIds, details);
          details.addEventListener("toggle", function () {
            // Detached accordions may have a queued toggle after a search rerender.
            if (!details.isConnected) return;
            if (details.open) {
              openedTopics.add(topic.id);
              renderBody(topic, match.questionIds, details);
            } else {
              openedTopics.delete(topic.id);
            }
          });
          fragment.appendChild(details);
        });
      });
      nodes.list.replaceChildren(fragment);
      nodes.empty.hidden = topicCount !== 0;
      nodes.collapse.disabled = !topicCount;
      nodes.clear.disabled = !query && sectionId === "all";
      nodes.status.textContent = topicCount + " topics \u00b7 " + questionCount + " MCQ references";
      nodes.coverage.textContent = bundle.topics.length + " topics aur "
        + bundle.topics.reduce(function (sum, topic) { return sum + topic.questionIds.length; }, 0)
        + " existing MCQ references. Naye quiz questions add nahi hue; saved progress aur queue wohi hain.";
    }

    function show() {
      nodes.error.hidden = true;
      nodes.retry.hidden = true;
      nodes.empty.hidden = true;
      nodes.status.textContent = "Topics load ho rahe hain...";
      nodes.screen.setAttribute("aria-busy", "true");
      return loadData().then(render).catch(function () {
        nodes.error.hidden = false;
        nodes.retry.hidden = false;
        nodes.status.textContent = "Topics abhi load nahi hue.";
      }).finally(function () { nodes.screen.removeAttribute("aria-busy"); });
    }

    function init(options) {
      if (initialized) return;
      initialized = true;
      ["screen", "card", "back", "search", "section", "clear", "collapse", "status",
        "coverage", "error", "retry", "empty", "list"].forEach(function (key) {
        nodes[key] = document.getElementById(config.prefix + "-" + key);
      });
      options.categories.forEach(function (category) { categoryNames.set(category.id, category.name); });
      var ordinals = new Map();
      options.questions.forEach(function (question) {
        var number = (ordinals.get(question.categoryId) || 0) + 1;
        ordinals.set(question.categoryId, number);
        questionNumbers.set(question.id, number);
        questionsById.set(question.id, question);
      });
      nodes.card.addEventListener("click", function () { options.open(); show(); });
      nodes.back.addEventListener("click", function () {
        options.close();
        nodes.card.focus({ preventScroll: true });
      });
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
        openedTopics.clear();
        nodes.list.querySelectorAll(".water-topic[open]").forEach(function (details) { details.open = false; });
      });
    }

    return Object.freeze({ init: init });
  }

  window.PPSC_WATER_TOPICS = createReferenceLibrary({
    prefix: "water-topics",
    dataGlobal: "PPSC_WATER_TOPICS_DATA",
    dataUrl: "data/pakistan-water-topics.js?v=20261020-1"
  });
  window.PPSC_ARTICLES_TOPICS = createReferenceLibrary({
    prefix: "articles-topics",
    dataGlobal: "PPSC_ARTICLES_TOPICS_DATA",
    dataUrl: "data/pakistan-articles-topics.js?v=20261020-1",
    articleSearch: true
  });
})();
