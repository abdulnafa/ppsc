(function () {
  "use strict";

  function createOrganizationsLibrary() {
    var initialized = false;
    var loading = null;
    var bundle = null;
    var nodes = {};
    var openedGroups = new Set();
    var openedQuestions = new Set();

    function normalize(value) {
      return String(value == null ? "" : value).normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
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
          var data = window.PPSC_ORGANIZATIONS_TOPICS_DATA;
          if (!error && (!data || data.schemaVersion !== 1 || !Array.isArray(data.sections)
            || !data.sections.length || !Array.isArray(data.importantQuestions))) {
            error = new Error("Invalid organizations topics data");
          }
          if (error) {
            script.remove();
            reject(error);
            return;
          }
          bundle = data;
          resolve(bundle);
        }
        script.src = "data/organizations-topics.js?v=20261021-1";
        script.onload = function () { finish(); };
        script.onerror = function () { finish(new Error("Organizations topics could not load")); };
        timer = window.setTimeout(function () { finish(new Error("Organizations topics load timeout")); }, 20000);
        document.head.appendChild(script);
      }).catch(function (error) {
        loading = null;
        throw error;
      });
      return loading;
    }

    function renderOrganizationBody(organizations, details) {
      details.replaceChildren(details.querySelector("summary"));
      var list = make("ul", "organizations-name-list");
      organizations.forEach(function (name) { list.appendChild(make("li", "", name)); });
      details.appendChild(list);
      details.dataset.rendered = "true";
      details.dataset.renderedQuery = normalize(nodes.search.value);
    }

    function renderQuestionBody(question, details) {
      details.replaceChildren(details.querySelector("summary"));
      var answer = make("p", "water-topic-answer");
      answer.appendChild(make("strong", "", "Answer: "));
      answer.appendChild(document.createTextNode(question.answer));
      details.appendChild(answer);
      details.dataset.rendered = "true";
    }

    function render() {
      if (!bundle) return;
      var query = normalize(nodes.search.value);
      var view = nodes.view.value;
      var organizationCount = 0;
      var questionCount = 0;
      var fragment = document.createDocumentFragment();

      if (view !== "questions") {
        bundle.sections.forEach(function (section) {
          var matchingNames = section.organizations.filter(function (name) {
            return !query || normalize(name).includes(query);
          });
          if (!matchingNames.length) return;
          organizationCount += matchingNames.length;
          var details = make("details", "water-topic organizations-group");
          details.dataset.sectionId = section.id;
          var summary = make("summary");
          summary.appendChild(make("span", "water-topic-title", section.label));
          summary.appendChild(make("span", "water-topic-count", matchingNames.length + " names"));
          details.appendChild(summary);
          details.open = openedGroups.has(section.id);
          if (details.open) renderOrganizationBody(matchingNames, details);
          details.addEventListener("toggle", function () {
            if (!details.isConnected) return;
            if (details.open) {
              openedGroups.add(section.id);
              if (details.dataset.rendered !== "true" || details.dataset.renderedQuery !== query) {
                renderOrganizationBody(matchingNames, details);
              }
            } else {
              openedGroups.delete(section.id);
            }
          });
          fragment.appendChild(details);
        });
      }

      if (view !== "organizations") {
        var matchingQuestions = bundle.importantQuestions.filter(function (question) {
          return !query || normalize(question.question + " " + question.answer).includes(query);
        });
        if (matchingQuestions.length) {
          fragment.appendChild(make("h2", "water-topics-section-title organizations-important-heading", "Important MCQ questions"));
          matchingQuestions.forEach(function (question) {
            questionCount += 1;
            var questionId = question.question;
            var details = make("details", "water-topic organizations-question");
            details.dataset.questionId = questionId;
            var summary = make("summary");
            summary.appendChild(make("span", "water-topic-title", question.question));
            summary.appendChild(make("span", "water-topic-count", "Show answer"));
            details.appendChild(summary);
            details.open = openedQuestions.has(questionId);
            if (details.open) renderQuestionBody(question, details);
            details.addEventListener("toggle", function () {
              if (!details.isConnected) return;
              if (details.open) {
                openedQuestions.add(questionId);
                if (details.dataset.rendered !== "true") renderQuestionBody(question, details);
              } else {
                openedQuestions.delete(questionId);
              }
            });
            fragment.appendChild(details);
          });
        }
      }

      nodes.list.replaceChildren(fragment);
      nodes.empty.hidden = organizationCount + questionCount !== 0;
      nodes.collapse.disabled = organizationCount + questionCount === 0;
      nodes.clear.disabled = !query && view === "all";
      nodes.status.textContent = organizationCount + " organizations · " + questionCount + " important questions";
      nodes.coverage.textContent = "Question text aur tamam options se jama kiye gaye real organization names. Option mein naam hona us fact ko correct nahi banata. Yeh reading list quiz, queue ya saved progress nahi badalti.";
    }

    function show() {
      nodes.error.hidden = true;
      nodes.retry.hidden = true;
      nodes.empty.hidden = true;
      nodes.status.textContent = "Organizations load ho rahi hain...";
      nodes.screen.setAttribute("aria-busy", "true");
      return loadData().then(render).catch(function () {
        nodes.error.hidden = false;
        nodes.retry.hidden = false;
        nodes.status.textContent = "Organizations abhi load nahi hui.";
      }).finally(function () { nodes.screen.removeAttribute("aria-busy"); });
    }

    function init(options) {
      if (initialized) return;
      initialized = true;
      ["screen", "card", "back", "search", "view", "clear", "collapse", "status",
        "coverage", "error", "retry", "empty", "list"].forEach(function (key) {
        nodes[key] = document.getElementById("organizations-topics-" + key);
      });
      nodes.card.addEventListener("click", function () { options.open(); show(); });
      nodes.back.addEventListener("click", function () {
        options.close();
        nodes.card.focus({ preventScroll: true });
      });
      nodes.retry.addEventListener("click", show);
      nodes.search.addEventListener("input", render);
      nodes.view.addEventListener("change", render);
      nodes.clear.addEventListener("click", function () {
        nodes.search.value = "";
        nodes.view.value = "all";
        render();
        nodes.search.focus();
      });
      nodes.collapse.addEventListener("click", function () {
        openedGroups.clear();
        openedQuestions.clear();
        nodes.list.querySelectorAll(".organizations-group[open], .organizations-question[open]").forEach(function (details) {
          details.open = false;
        });
      });
    }

    return Object.freeze({ init: init });
  }

  window.PPSC_ORGANIZATIONS_TOPICS = createOrganizationsLibrary();
})();
