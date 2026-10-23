(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var MAP_URL = "assets/maps/world-countries-50m.geojson?v=20261023-1";
  var WORLD_WIDTH = 1000;
  var WORLD_HEIGHT = 500;
  var PAGE_SIZE = 20;
  var MIN_VIEW_WIDTH = WORLD_WIDTH / 8;

  // This is deliberately keyed by stable MCQ IDs. Add a place here only when
  // the stem/correct answer cannot identify it unambiguously. Never infer a
  // correct location from one of the incorrect options.
  var QUESTION_PLACE_OVERRIDES = Object.freeze({
    "P235-Q008-SRC": ["BEL"], // NATO headquarters: Brussels, Belgium.
    "ADV2E102-U0009-Q005-SRC": ["JOR"], // First king of Jordan.
    "ADV2E102-U0009-Q005-SIM": ["JOR"] // Jordan Independence Day.
  });

  var COUNTRY_ALIASES = Object.freeze({
    "usa": "USA", "u s a": "USA", "u s": "USA", "united states": "USA",
    "uk": "GBR", "u k": "GBR", "britain": "GBR", "great britain": "GBR", "england": "GBR", "scotland": "GBR", "wales": "GBR", "northern ireland": "GBR",
    "china": "CHN", "prc": "CHN", "p r c": "CHN", "chinese": "CHN",
    "uae": "ARE", "u a e": "ARE",
    "czechia": "CZE", "czech republic": "CZE",
    "timor leste": "TLS", "east timor": "TLS",
    "ivory coast": "CIV", "cote d ivoire": "CIV",
    "burma": "MMR", "myanmar": "MMR",
    "turkiye": "TUR", "turkey": "TUR",
    "swaziland": "SWZ", "eswatini": "SWZ",
    "the gambia": "GMB", "gambia": "GMB",
    "the bahamas": "BHS", "bahamas": "BHS",
    "north korea": "PRK", "south korea": "KOR", "republic of korea": "KOR",
    "russian federation": "RUS", "russia": "RUS",
    "vatican": "VAT", "holy see": "VAT",
    "micronesia": "FSM", "cape verde": "CPV", "cabo verde": "CPV",
    "bosnia": "BIH", "bosnia and herzegovina": "BIH",
    "macedonia": "MKD", "north macedonia": "MKD",
    "dr congo": "COD", "d r congo": "COD", "democratic republic of congo": "COD",
    "congo brazzaville": "COG", "republic of congo": "COG",
    "palestinian territories": "PSE",
    "pakistan": "PAK", "india": "IND", "nepal": "NPL", "bangladesh": "BGD", "afghanistan": "AFG",
    "پاکستان": "PAK", "بھارت": "IND", "ہندوستان": "IND", "چین": "CHN", "افغانستان": "AFG", "بنگلہ دیش": "BGD",
    "ایران": "IRN", "سعودی عرب": "SAU", "ترکی": "TUR", "عراق": "IRQ", "نیپال": "NPL"
  });

  // A small, conservative city list covers common capital/HQ answers while
  // preventing unrelated city names in wrong options from affecting the map.
  var CITY_ALIASES = Object.freeze({
    "islamabad": "PAK", "karachi": "PAK", "lahore": "PAK", "rawalpindi": "PAK", "peshawar": "PAK", "quetta": "PAK", "multan": "PAK", "faisalabad": "PAK",
    "new delhi": "IND", "delhi": "IND", "mumbai": "IND", "kolkata": "IND", "hyderabad india": "IND",
    "beijing": "CHN", "peking": "CHN", "shanghai": "CHN", "guangzhou": "CHN",
    "kabul": "AFG", "dhaka": "BGD", "kathmandu": "NPL", "colombo": "LKA", "kotte": "LKA",
    "riyadh": "SAU", "jeddah": "SAU", "mecca": "SAU", "makkah": "SAU", "medina": "SAU", "madinah": "SAU",
    "abu dhabi": "ARE", "dubai": "ARE", "doha": "QAT", "manama": "BHR", "muscat": "OMN", "kuwait city": "KWT",
    "tehran": "IRN", "baghdad": "IRQ", "ankara": "TUR", "istanbul": "TUR", "amman": "JOR", "tbilisi": "GEO", "n djamena": "TCD", "niamey": "NER", "conakry": "GIN", "tel aviv": "ISR",
    "london": "GBR", "belfast": "GBR", "paris": "FRA", "berlin": "DEU", "rome": "ITA", "madrid": "ESP", "lisbon": "PRT", "athens": "GRC",
    "brussels": "BEL", "geneva": "CHE", "bern": "CHE", "zurich": "CHE", "vienna": "AUT", "the hague": "NLD", "amsterdam": "NLD",
    "moscow": "RUS", "st petersburg": "RUS", "kyiv": "UKR", "kiev": "UKR", "oslo": "NOR", "stockholm": "SWE", "helsinki": "FIN",
    "copenhagen": "DNK", "reykjavik": "ISL", "warsaw": "POL", "prague": "CZE", "budapest": "HUN", "bucharest": "ROU",
    "washington dc": "USA", "washington d c": "USA", "new york city": "USA", "new york": "USA", "los angeles": "USA",
    "ottawa": "CAN", "toronto": "CAN", "mexico city": "MEX", "brasilia": "BRA", "buenos aires": "ARG", "santiago chile": "CHL", "lima": "PER",
    "cairo": "EGY", "alexandria egypt": "EGY", "addis ababa": "ETH", "nairobi": "KEN", "lagos": "NGA", "abuja": "NGA", "pretoria": "ZAF", "cape town": "ZAF",
    "tokyo": "JPN", "seoul": "KOR", "pyongyang": "PRK", "bangkok": "THA", "jakarta": "IDN", "kuala lumpur": "MYS", "manila": "PHL",
    "canberra": "AUS", "sydney": "AUS", "melbourne": "AUS", "wellington": "NZL", "auckland": "NZL"
  });

  var SMALL_COUNTRIES = Object.freeze({
    "BHR": true, "BRN": true, "KWT": true, "LBN": true, "LUX": true,
    "MDV": true, "MLT": true, "MCO": true, "QAT": true, "SGP": true,
    "VAT": true, "SMR": true, "LIE": true
  });

  // These also name people, rivers, regions or animals in the MCQ bank. A
  // capital/longer country name or an explicit question override is safer.
  var AMBIGUOUS_COUNTRY_NAMES = Object.freeze({
    "chad": true, "georgia": true, "guinea": true, "jordan": true,
    "niger": true, "turkey": true
  });

  function normalize(value) {
    return String(value == null ? "" : value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function make(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = content;
    return node;
  }

  function project(point) {
    return [((point[0] + 180) / 360) * WORLD_WIDTH, ((90 - point[1]) / 180) * WORLD_HEIGHT];
  }

  function ringPath(ring) {
    if (!Array.isArray(ring) || ring.length < 3) return "";
    return ring.map(function (point, index) {
      var xy = project(point);
      return (index ? "L" : "M") + xy[0].toFixed(2) + " " + xy[1].toFixed(2);
    }).join("") + "Z";
  }

  function geometryPath(geometry) {
    var polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    return polygons.map(function (polygon) { return polygon.map(ringPath).join(""); }).join("");
  }

  function levelForCount(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 9) return 2;
    if (count <= 29) return 3;
    if (count <= 99) return 4;
    return 5;
  }

  function createWorldMap() {
    var initialized = false;
    var loading = null;
    var features = null;
    var options = null;
    var nodes = {};
    var countries = new Map();
    var linked = new Map();
    var categoryNames = new Map();
    var countryNames = new Map();
    var placeAliases = new Map();
    var maxAliasWords = 1;
    var selectedIso3 = null;
    var shown = PAGE_SIZE;
    var view = { x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT };
    var drag = null;
    var suppressClick = false;
    var tooltipIso3 = null;

    function addAlias(alias, iso3, toQuestionMap) {
      var key = normalize(alias);
      if (!key || !countries.has(iso3)) return;
      if (toQuestionMap && AMBIGUOUS_COUNTRY_NAMES[key]) return;
      if (toQuestionMap) {
        // Ambiguous aliases are omitted, never assigned by iteration order.
        if (placeAliases.has(key) && placeAliases.get(key) !== iso3) {
          placeAliases.set(key, null);
        } else if (!placeAliases.has(key)) {
          placeAliases.set(key, iso3);
        }
        maxAliasWords = Math.max(maxAliasWords, key.split(" ").length);
      } else {
        countryNames.set(key, iso3);
      }
    }

    function buildAliases() {
      features.forEach(function (feature) {
        var props = feature.properties;
        addAlias(props.name, props.iso3, true);
        addAlias(props.name, props.iso3, false);
      });
      Object.keys(COUNTRY_ALIASES).forEach(function (alias) {
        addAlias(alias, COUNTRY_ALIASES[alias], true);
        addAlias(alias, COUNTRY_ALIASES[alias], false);
      });
      Object.keys(CITY_ALIASES).forEach(function (alias) {
        addAlias(alias, CITY_ALIASES[alias], true);
      });
    }

    function findPlaces(text) {
      var words = normalize(text).split(" ").filter(Boolean);
      var found = new Set();
      for (var start = 0; start < words.length; start += 1) {
        for (var length = Math.min(maxAliasWords, words.length - start); length >= 1; length -= 1) {
          var iso3 = placeAliases.get(words.slice(start, start + length).join(" "));
          if (iso3) {
            found.add(iso3);
            // A longer place name is one reference, not multiple countries:
            // South Sudan must not also count as Sudan, for example.
            start += length - 1;
            break;
          }
        }
      }
      return found;
    }

    function indexQuestions() {
      linked = new Map();
      countries.forEach(function (_, iso3) { linked.set(iso3, []); });
      options.questions.forEach(function (question) {
        if (!question || !Array.isArray(question.options)) return;
        var answer = question.options[question.correctOptionIndex];
        var places = findPlaces(question.question);
        findPlaces(answer).forEach(function (iso3) { places.add(iso3); });
        // One-word names such as Chad and Jordan are too ambiguous in a stem,
        // but are safe when the correct option is exactly that country and the
        // question explicitly asks for a country/nation.
        var answerName = normalize(answer);
        var stem = normalize(question.question);
        if (AMBIGUOUS_COUNTRY_NAMES[answerName]
          && /\b(?:country|nation)\b/.test(stem)) {
          var exactCountry = countryNames.get(answerName);
          if (exactCountry) places.add(exactCountry);
        }
        var overrides = QUESTION_PLACE_OVERRIDES[question.id] || [];
        overrides.forEach(function (iso3) { if (countries.has(iso3)) places.add(iso3); });
        places.forEach(function (iso3) { linked.get(iso3).push(question); });
      });
    }

    function questionsFor(iso3) {
      var list = linked.get(iso3) || [];
      var category = nodes.category.value;
      return category === "all" ? list : list.filter(function (question) { return question.categoryId === category; });
    }

    function setView(next) {
      var width = Math.max(MIN_VIEW_WIDTH, Math.min(WORLD_WIDTH, next.width));
      var height = width * WORLD_HEIGHT / WORLD_WIDTH;
      view = {
        x: Math.max(0, Math.min(WORLD_WIDTH - width, next.x)),
        y: Math.max(0, Math.min(WORLD_HEIGHT - height, next.y)),
        width: width,
        height: height
      };
      nodes.svg.setAttribute("viewBox", [view.x, view.y, view.width, view.height].join(" "));
      nodes.zoomIn.disabled = width <= MIN_VIEW_WIDTH + 0.1;
      nodes.zoomOut.disabled = width >= WORLD_WIDTH - 0.1;
    }

    function screenToWorld(clientX, clientY) {
      var point = nodes.svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      var ctm = nodes.svg.getScreenCTM();
      if (!ctm) return { x: view.x + view.width / 2, y: view.y + view.height / 2 };
      return point.matrixTransform(ctm.inverse());
    }

    function zoom(factor, clientX, clientY) {
      if (!features) return;
      var center = (clientX == null || clientY == null)
        ? { x: view.x + view.width / 2, y: view.y + view.height / 2 }
        : screenToWorld(clientX, clientY);
      var width = Math.max(MIN_VIEW_WIDTH, Math.min(WORLD_WIDTH, view.width * factor));
      var ratio = width / view.width;
      setView({
        x: center.x - (center.x - view.x) * ratio,
        y: center.y - (center.y - view.y) * ratio,
        width: width
      });
    }

    function zoomToCountry(iso3) {
      var feature = countries.get(iso3);
      if (!feature || !Array.isArray(feature.properties.label)) return;
      var point = project(feature.properties.label);
      var width = Math.min(view.width, 250);
      var height = width * WORLD_HEIGHT / WORLD_WIDTH;
      setView({ x: point[0] - width / 2, y: point[1] - height / 2, width: width });
    }

    function updateColors() {
      var matchedCountries = 0;
      var totalLinks = 0;
      nodes.svg.querySelectorAll("[data-iso3]").forEach(function (shape) {
        var count = questionsFor(shape.dataset.iso3).length;
        var level = levelForCount(count);
        shape.classList.remove("world-map-level-0", "world-map-level-1", "world-map-level-2", "world-map-level-3", "world-map-level-4", "world-map-level-5");
        shape.classList.add("world-map-level-" + level);
        shape.setAttribute("aria-label", countries.get(shape.dataset.iso3).properties.name + ", " + count + " linked MCQs");
        if (shape.tagName.toLowerCase() !== "circle") {
          if (count) matchedCountries += 1;
          totalLinks += count;
        }
      });
      var categoryText = nodes.category.value === "all"
        ? "All categories"
        : (categoryNames.get(nodes.category.value) || "Selected category");
      nodes.status.textContent = categoryText + ": " + matchedCountries + " countries/regions with linked MCQs · " + totalLinks + " place–MCQ links.";
    }

    function renderMap() {
      var fragment = document.createDocumentFragment();
      features.forEach(function (feature) {
        var iso3 = feature.properties.iso3;
        var path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", geometryPath(feature.geometry));
        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("class", "world-map-country world-map-level-0");
        path.setAttribute("role", "button");
        path.setAttribute("tabindex", "0");
        path.dataset.iso3 = iso3;
        fragment.appendChild(path);
      });
      features.forEach(function (feature) {
        var iso3 = feature.properties.iso3;
        if (!SMALL_COUNTRIES[iso3] || !Array.isArray(feature.properties.label)) return;
        var point = project(feature.properties.label);
        var marker = document.createElementNS(SVG_NS, "circle");
        marker.setAttribute("cx", point[0].toFixed(2));
        marker.setAttribute("cy", point[1].toFixed(2));
        marker.setAttribute("r", "3.5");
        marker.setAttribute("class", "world-map-country world-map-small-marker world-map-level-0");
        marker.setAttribute("role", "button");
        marker.setAttribute("tabindex", "0");
        marker.dataset.iso3 = iso3;
        fragment.appendChild(marker);
      });
      nodes.svg.replaceChildren(fragment);
      nodes.svg.setAttribute("role", "group");
      nodes.svg.setAttribute("aria-label", "Interactive world map of countries and regions with linked MCQs");
      setView({ x: 0, y: 0, width: WORLD_WIDTH });
      updateColors();
    }

    function displayQuestion(question) {
      var isUrdu = question.categoryId === "urdu";
      var card = make("article", "world-map-question");
      card.appendChild(make("span", "world-map-question-meta", categoryNames.get(question.categoryId) || "MCQ"));
      var text = make("p", "world-map-question-text", isUrdu ? (question.questionUrdu || question.question) : question.question);
      if (isUrdu) { text.lang = "ur"; text.dir = "rtl"; }
      card.appendChild(text);
      var answerOptions = isUrdu && Array.isArray(question.optionsUrdu) ? question.optionsUrdu : question.options;
      var answer = answerOptions[question.correctOptionIndex];
      var answerNode = make("p", "world-map-question-answer", "Answer: " + (answer == null ? "—" : answer));
      if (isUrdu) { answerNode.lang = "ur"; answerNode.dir = "rtl"; }
      card.appendChild(answerNode);
      return card;
    }

    function renderDetail() {
      if (!selectedIso3 || !countries.has(selectedIso3)) return;
      var feature = countries.get(selectedIso3);
      var list = questionsFor(selectedIso3);
      nodes.detailTitle.textContent = feature.properties.name;
      nodes.detailCount.textContent = list.length + " linked MCQs in the selected category.";
      var fragment = document.createDocumentFragment();
      if (!list.length) {
        fragment.appendChild(make("p", "world-map-no-questions", "No linked MCQs for this country in this category yet."));
      } else {
        list.slice(0, shown).forEach(function (question) { fragment.appendChild(displayQuestion(question)); });
      }
      nodes.questionList.replaceChildren(fragment);
      nodes.more.hidden = shown >= list.length;
      nodes.more.textContent = "Show more MCQs (" + Math.min(PAGE_SIZE, Math.max(0, list.length - shown)) + ")";
    }

    function selectCountry(iso3, center) {
      if (!countries.has(iso3)) return;
      selectedIso3 = iso3;
      shown = PAGE_SIZE;
      nodes.svg.querySelectorAll(".is-selected").forEach(function (shape) { shape.classList.remove("is-selected"); });
      nodes.svg.querySelectorAll('[data-iso3="' + iso3 + '"]').forEach(function (shape) { shape.classList.add("is-selected"); });
      nodes.search.value = countries.get(iso3).properties.name;
      if (center) zoomToCountry(iso3);
      renderDetail();
      hideTooltip();
    }

    function hideTooltip() {
      tooltipIso3 = null;
      nodes.tooltip.hidden = true;
    }

    function showTooltip(iso3, clientX, clientY) {
      if (!countries.has(iso3) || drag && drag.moved) return;
      if (tooltipIso3 !== iso3) {
        tooltipIso3 = iso3;
        var feature = countries.get(iso3);
        var questions = questionsFor(iso3);
        var fragment = document.createDocumentFragment();
        fragment.appendChild(make("strong", "", feature.properties.name));
        fragment.appendChild(make("span", "", questions.length + " linked MCQs"));
        if (questions.length) {
          var first = questions[0];
          fragment.appendChild(make("small", "", first.categoryId === "urdu" ? (first.questionUrdu || first.question) : first.question));
          var firstOptions = first.categoryId === "urdu" && Array.isArray(first.optionsUrdu) ? first.optionsUrdu : first.options;
          var firstAnswer = firstOptions[first.correctOptionIndex];
          if (firstAnswer != null) fragment.appendChild(make("small", "", "Answer: " + firstAnswer));
        }
        nodes.tooltip.replaceChildren(fragment);
        nodes.tooltip.hidden = false;
      }
      var rect = nodes.stage.getBoundingClientRect();
      var left = Math.min(rect.width - nodes.tooltip.offsetWidth - 6, Math.max(6, clientX - rect.left + 12));
      var top = Math.min(rect.height - nodes.tooltip.offsetHeight - 6, Math.max(6, clientY - rect.top + 12));
      nodes.tooltip.style.left = Math.max(6, left) + "px";
      nodes.tooltip.style.top = Math.max(6, top) + "px";
    }

    function shapeFromEvent(event) {
      var target = event.target;
      var shape = target && typeof target.closest === "function" ? target.closest("[data-iso3]") : null;
      return shape && nodes.svg.contains(shape) ? shape : null;
    }

    function findCountry() {
      if (!features) {
        nodes.status.textContent = "Map load hone ke baad country search karein.";
        return;
      }
      var query = normalize(nodes.search.value);
      if (!query) {
        nodes.status.textContent = "Country ka naam likhein, phir Find dabayein.";
        return;
      }
      var iso3 = countryNames.get(query);
      if (!iso3) {
        var match = features.find(function (feature) {
          return normalize(feature.properties.name).includes(query);
        });
        iso3 = match && match.properties.iso3;
      }
      if (!iso3) {
        nodes.status.textContent = "Country nahi mila. Naam ya spelling check karein.";
        return;
      }
      updateColors();
      selectCountry(iso3, true);
      nodes.detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function loadMap() {
      if (features) return Promise.resolve(features);
      if (loading) return loading;
      loading = fetch(MAP_URL).then(function (response) {
        if (!response.ok) throw new Error("Map request failed: " + response.status);
        return response.json();
      }).then(function (data) {
        if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features) || !data.features.length) {
          throw new Error("Map file invalid");
        }
        features = data.features.filter(function (feature) {
          return feature && feature.properties && feature.properties.iso3 && feature.properties.name
            && feature.geometry && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon");
        });
        if (!features.length) throw new Error("Map has no countries");
        features.forEach(function (feature) { countries.set(feature.properties.iso3, feature); });
        buildAliases();
        indexQuestions();
        var choices = document.createDocumentFragment();
        features.slice().sort(function (a, b) { return a.properties.name.localeCompare(b.properties.name); }).forEach(function (feature) {
          var choice = make("option");
          choice.value = feature.properties.name;
          choices.appendChild(choice);
        });
        nodes.countries.replaceChildren(choices);
        renderMap();
        return features;
      }).catch(function (error) {
        loading = null;
        features = null;
        countries.clear();
        linked.clear();
        placeAliases.clear();
        countryNames.clear();
        throw error;
      });
      return loading;
    }

    function show() {
      nodes.error.hidden = true;
      nodes.retry.hidden = true;
      if (features) {
        updateColors();
        return Promise.resolve();
      }
      nodes.status.textContent = "Map load ho raha hai...";
      nodes.screen.setAttribute("aria-busy", "true");
      return loadMap().catch(function () {
        nodes.error.hidden = false;
        nodes.retry.hidden = false;
        nodes.status.textContent = "Map abhi load nahi ho saka.";
      }).finally(function () { nodes.screen.removeAttribute("aria-busy"); });
    }

    function init(config) {
      if (initialized) return;
      initialized = true;
      options = config;
      ["screen", "card", "back", "search", "countries", "find", "category", "zoom-in", "zoom-out", "reset",
        "status", "error", "retry", "stage", "svg", "tooltip", "detail", "detail-title", "detail-count",
        "question-list", "more"].forEach(function (key) {
        var camel = key.replace(/-([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
        nodes[camel] = document.getElementById("world-map-" + key);
      });
      config.categories.forEach(function (category) {
        categoryNames.set(category.id, category.name);
        var option = make("option", "", category.name);
        option.value = category.id;
        nodes.category.appendChild(option);
      });
      nodes.card.addEventListener("click", function () { options.open(); show(); });
      nodes.back.addEventListener("click", function () {
        hideTooltip();
        options.close();
        nodes.card.focus({ preventScroll: true });
      });
      nodes.retry.addEventListener("click", show);
      nodes.find.addEventListener("click", findCountry);
      nodes.search.addEventListener("keydown", function (event) {
        if (event.key === "Enter") { event.preventDefault(); findCountry(); }
      });
      nodes.category.addEventListener("change", function () {
        if (!features) return;
        updateColors();
        if (selectedIso3) { shown = PAGE_SIZE; renderDetail(); }
        hideTooltip();
      });
      nodes.more.addEventListener("click", function () { shown += PAGE_SIZE; renderDetail(); });
      nodes.zoomIn.addEventListener("click", function () { zoom(1 / 1.5); });
      nodes.zoomOut.addEventListener("click", function () { zoom(1.5); });
      nodes.reset.addEventListener("click", function () { setView({ x: 0, y: 0, width: WORLD_WIDTH }); });
      nodes.svg.addEventListener("wheel", function (event) {
        if (!features) return;
        event.preventDefault();
        zoom(event.deltaY > 0 ? 1.22 : 1 / 1.22, event.clientX, event.clientY);
        hideTooltip();
      }, { passive: false });
      nodes.svg.addEventListener("pointerdown", function (event) {
        if (!features || event.button !== 0 || drag) return;
        var shape = shapeFromEvent(event);
        drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
          iso3: shape ? shape.dataset.iso3 : null, view: Object.assign({}, view), moved: false, captured: false };
      });
      nodes.svg.addEventListener("pointermove", function (event) {
        if (drag && drag.pointerId === event.pointerId) {
          var deltaX = event.clientX - drag.clientX;
          var deltaY = event.clientY - drag.clientY;
          if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.moved = true;
          if (drag.moved) {
            if (!drag.captured) {
              nodes.svg.setPointerCapture(event.pointerId);
              drag.captured = true;
            }
            var rect = nodes.svg.getBoundingClientRect();
            var pixelsPerUnit = Math.min(rect.width / drag.view.width, rect.height / (drag.view.width * WORLD_HEIGHT / WORLD_WIDTH));
            setView({ x: drag.view.x - deltaX / pixelsPerUnit, y: drag.view.y - deltaY / pixelsPerUnit, width: drag.view.width });
            hideTooltip();
          }
          return;
        }
        var shape = shapeFromEvent(event);
        if (shape && event.pointerType !== "touch") showTooltip(shape.dataset.iso3, event.clientX, event.clientY);
        else hideTooltip();
      });
      function endDrag(event) {
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (drag.moved || (drag.iso3 && event.type !== "pointercancel" && nodes.svg.contains(event.target))) {
          suppressClick = true;
          window.setTimeout(function () { suppressClick = false; }, 350);
        }
        if (!drag.moved && drag.iso3 && event.type !== "pointercancel" && nodes.svg.contains(event.target)) {
          selectCountry(drag.iso3, false);
        }
        drag = null;
      }
      nodes.svg.addEventListener("pointerup", endDrag);
      nodes.svg.addEventListener("pointercancel", endDrag);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
      nodes.svg.addEventListener("pointerleave", hideTooltip);
      nodes.svg.addEventListener("click", function (event) {
        if (suppressClick) { suppressClick = false; return; }
        var shape = shapeFromEvent(event);
        if (shape) selectCountry(shape.dataset.iso3, false);
      });
      nodes.svg.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        var shape = shapeFromEvent(event);
        if (!shape) return;
        event.preventDefault();
        selectCountry(shape.dataset.iso3, false);
        nodes.detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }

    return Object.freeze({ init: init });
  }

  window.PPSC_WORLD_MAP = createWorldMap();
})();
