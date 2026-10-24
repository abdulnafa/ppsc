(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var MAP_URL = "assets/maps/world-countries-50m.geojson?v=20261023-1";
  var CITIES_URL = "assets/maps/world-major-cities.json?v=20261023-1";
  var PHYSICAL_WATER_URL = "data/world-physical-water.json?v=20261024-1";
  var PHYSICAL_TERRAIN_URL = "data/world-physical-terrain.json?v=20261024-1";
  var PHYSICAL_GEOMETRY_URL = "assets/maps/world-physical-geometry.json?v=20261024-1";
  var WORLD_WIDTH = 1000;
  var WORLD_HEIGHT = 500;
  var MINI_WIDTH = 800;
  var MINI_HEIGHT = 420;
  var PAGE_SIZE = 20;
  var MIN_VIEW_WIDTH = WORLD_WIDTH / 8;
  // These IDs have been checked against the canonical question and its correct
  // answer. Do not infer an arrow from keywords such as "South Korea" or from
  // incorrect options: those are not relative-direction questions.
  var DIRECTION_LESSONS = Object.freeze({
    "ADV2E102-U0005-Q022-SRC": {
      from: "PAK", to: ["CHN"], title: "North-East / Shumal-Mashriq",
      points: { CHN: [76, 39.5] },
      explanation: "Pakistan (A) se China (B) ki taraf upar aur daein jaate hain. Is liye China Pakistan ke north-east mein hai."
    },
    "ADV2E102-U0008-Q046-SRC": {
      from: "PAK", to: ["IND"], title: "East / Mashriq",
      points: { IND: [75, 30.5] },
      explanation: "Pakistan (A) se India (B) ki taraf daein jaate hain. Is sawal mein India eastern neighbour hai."
    },
    "ADV2E102-U0008-Q046-SIM": {
      from: "PAK", to: ["AFG", "IRN"], title: "West side / Maghribi taraf",
      points: { IRN: [60.87, 29.5] },
      explanation: "Pakistan (A) se Afghanistan (B1) upar-baein aur Iran (B2) neeche-baein hain. Dono Pakistan ki western side par border karte hain."
    },
    "ADV2E102-U0014-Q054-SIM": {
      from: "AFG", to: ["IRN"], title: "West / Maghrib",
      explanation: "Afghanistan (A) se Iran (B) ki taraf baein jaate hain. Iran Afghanistan ka western neighbour hai."
    },
    "ADV2E102-U0033-Q006-SIM": {
      from: "PAK", to: ["AFG"], title: "Western neighbour",
      explanation: "Pakistan (A) se Afghanistan (B) ki taraf baein aur kuch upar jaate hain. Is liye Afghanistan western neighbour hai."
    },
    "ADV2E102-U0035-Q043-SIM": {
      from: "PAK", to: ["CHN"], title: "North-East / Shumal-Mashriq",
      points: { CHN: [76, 39.5] },
      explanation: "Pakistan (A) se China (B) ki taraf upar aur daein jaate hain. Yeh north-east direction hai."
    }
  });
  var PROMINENT_LABELS = Object.freeze({
    CAN: true, USA: true, MEX: true, BRA: true, ARG: true, COL: true,
    GBR: true, FRA: true, ESP: true, DEU: true, ITA: true, POL: true,
    UKR: true, RUS: true, TUR: true, KAZ: true, CHN: true, MNG: true,
    IND: true, PAK: true, AFG: true, IRN: true, SAU: true, EGY: true,
    DZA: true, LBY: true, SDN: true, ETH: true, NGA: true, COD: true,
    ZAF: true, IDN: true, AUS: true, NZL: true, JPN: true
  });
  var SHORT_MAP_LABELS = Object.freeze({
    CAF: "Central African Rep.", CHN: "China", COD: "DR Congo",
    FSM: "Micronesia", USA: "United States"
  });

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

  function svgNode(tag, attributes, content) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
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

  function lineGeometryPath(geometry) {
    var lines = geometry.type === "LineString" ? [geometry.coordinates] : geometry.coordinates;
    return lines.map(function (line) {
      return line.map(function (coordinate, index) {
        var point = project(coordinate);
        return (index ? "L" : "M") + point[0].toFixed(2) + " " + point[1].toFixed(2);
      }).join("");
    }).join("");
  }

  function levelForCount(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 9) return 2;
    if (count <= 29) return 3;
    if (count <= 99) return 4;
    return 5;
  }

  function outerRings(geometry) {
    var polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    return polygons.map(function (polygon) { return polygon[0] || []; }).filter(function (ring) { return ring.length >= 3; });
  }

  function boundsForRing(ring) {
    var bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    ring.forEach(function (coordinate) {
      var point = project(coordinate);
      bounds.left = Math.min(bounds.left, point[0]);
      bounds.right = Math.max(bounds.right, point[0]);
      bounds.top = Math.min(bounds.top, point[1]);
      bounds.bottom = Math.max(bounds.bottom, point[1]);
    });
    return bounds;
  }

  function boundsForGeometry(geometry) {
    return outerRings(geometry).reduce(function (whole, ring) {
      var part = boundsForRing(ring);
      whole.left = Math.min(whole.left, part.left);
      whole.right = Math.max(whole.right, part.right);
      whole.top = Math.min(whole.top, part.top);
      whole.bottom = Math.max(whole.bottom, part.bottom);
      return whole;
    }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
  }

  function ringContains(point, ring) {
    var inside = false;
    for (var index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
      var first = project(ring[index]);
      var second = project(ring[previous]);
      if ((first[1] > point[1]) !== (second[1] > point[1]) &&
        point[0] < (second[0] - first[0]) * (point[1] - first[1]) / (second[1] - first[1]) + first[0]) inside = !inside;
    }
    return inside;
  }

  function focusForCountry(feature, cities) {
    var capital = cities.find(function (city) { return city.capital; });
    var anchorCity = capital || cities[0];
    var anchor = anchorCity ? project([anchorCity.lon, anchorCity.lat]) : project(feature.properties.label);
    var candidates = outerRings(feature.geometry).map(function (ring) {
      return { ring: ring, bounds: boundsForRing(ring) };
    });
    var chosen = candidates.find(function (candidate) {
      var b = candidate.bounds;
      return anchor[0] >= b.left && anchor[0] <= b.right && anchor[1] >= b.top && anchor[1] <= b.bottom &&
        ringContains(anchor, candidate.ring);
    });
    if (!chosen) {
      chosen = candidates.sort(function (a, b) {
        function distance(candidate) {
          var box = candidate.bounds;
          var dx = Math.max(box.left - anchor[0], 0, anchor[0] - box.right);
          var dy = Math.max(box.top - anchor[1], 0, anchor[1] - box.bottom);
          return dx * dx + dy * dy;
        }
        return distance(a) - distance(b);
      })[0];
    }
    if (!chosen) return null;
    var ringWidth = chosen.bounds.right - chosen.bounds.left;
    var ringHeight = chosen.bounds.bottom - chosen.bounds.top;
    var box = Object.assign({}, chosen.bounds);
    // Include nearby city points from other islands without pulling distant
    // overseas territories into an unreadably small mainland map.
    cities.forEach(function (city) {
      var point = project([city.lon, city.lat]);
      if (Math.abs(point[0] - anchor[0]) > 100 || Math.abs(point[1] - anchor[1]) > 75) return;
      box.left = Math.min(box.left, point[0]);
      box.right = Math.max(box.right, point[0]);
      box.top = Math.min(box.top, point[1]);
      box.bottom = Math.max(box.bottom, point[1]);
      var cityRing = candidates.find(function (candidate) {
        var extent = candidate.bounds;
        return point[0] >= extent.left && point[0] <= extent.right &&
          point[1] >= extent.top && point[1] <= extent.bottom && ringContains(point, candidate.ring);
      });
      if (cityRing && cityRing.bounds.right - cityRing.bounds.left < 180 &&
        cityRing.bounds.bottom - cityRing.bounds.top < 110) {
        box.left = Math.min(box.left, cityRing.bounds.left);
        box.right = Math.max(box.right, cityRing.bounds.right);
        box.top = Math.min(box.top, cityRing.bounds.top);
        box.bottom = Math.max(box.bottom, cityRing.bounds.bottom);
      }
    });
    var rawWidth = box.right - box.left;
    var rawHeight = box.bottom - box.top;
    var width = Math.min(280, Math.max(26, rawWidth * 1.25));
    var height = Math.min(175, Math.max(16, rawHeight * 1.25));
    var ratio = MINI_WIDTH / MINI_HEIGHT;
    if (width / height < ratio) width = height * ratio;
    else height = width / ratio;
    var centerX = rawWidth > 280 ? anchor[0] : (box.left + box.right) / 2;
    var centerY = rawHeight > 175 ? anchor[1] : (box.top + box.bottom) / 2;
    return {
      x: centerX - width / 2,
      y: Math.max(0, Math.min(WORLD_HEIGHT - height, centerY - height / 2)),
      width: width, height: height,
      tiny: ringWidth < 1 || ringHeight < 1,
      anchor: anchor
    };
  }

  function boundsOverlap(first, second) {
    return first.left <= second.right && first.right >= second.left &&
      first.top <= second.bottom && first.bottom >= second.top;
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
    var activeDirectionId = null;
    var shown = PAGE_SIZE;
    var view = { x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT };
    var drag = null;
    var suppressClick = false;
    var tooltipIso3 = null;
    var countryFilter = "";
    var labelItems = [];
    var labelFrame = null;
    var labelCanvas = document.createElement("canvas").getContext("2d");
    var countryPaths = new Map();
    var countryBounds = new Map();
    var citiesByCountry = null;
    var cityLoading = null;
    var cityUnavailable = false;
    var physicalFeatures = null;
    var physicalById = new Map();
    var physicalLinked = new Map();
    var physicalLoading = null;
    var selectedPhysicalId = null;
    var physicalGeometry = null;
    var physicalGeometryLoading = null;

    function physicalLayerFor(kind) {
      if (["ocean", "sea", "gulf", "strait", "lake"].includes(kind)) return "marine";
      if (["peak", "mountain", "range", "plateau", "glacier", "desert", "pass"].includes(kind)) return "terrain";
      if (["river", "canal"].includes(kind)) return "rivers";
      return "waterworks";
    }

    function isPhysicalMode() { return nodes.layer && nodes.layer.value !== "countries"; }

    function physicalList() {
      return (physicalFeatures || []).filter(function (feature) {
        return physicalLayerFor(feature.kind) === nodes.layer.value;
      });
    }

    function physicalQuestionsFor(id) {
      var list = physicalLinked.get(id) || [];
      return nodes.category.value === "all" ? list : list.filter(function (question) {
        return question.categoryId === nodes.category.value;
      });
    }

    function aliasInText(alias, text) {
      var key = normalize(alias);
      if (["indian", "southern", "western", "eastern", "northern"].includes(key)) return false;
      if (!key || (key.length < 4 && key !== "k2")) return false;
      return (" " + text + " ").includes(" " + key + " ");
    }

    function indexPhysicalQuestions() {
      var questionById = new Map(options.questions.map(function (question) { return [question.id, question]; }));
      var searchTexts = options.questions.map(function (question) {
        var answer = Array.isArray(question.options) ? question.options[question.correctOptionIndex] : "";
        var urduAnswer = Array.isArray(question.optionsUrdu) ? question.optionsUrdu[question.correctOptionIndex] : "";
        return normalize([question.question, question.questionUrdu, answer, urduAnswer].filter(Boolean).join(" "));
      });
      physicalLinked.clear();
      physicalFeatures.forEach(function (feature) {
        var ids = new Set(feature.questionIds || []);
        var aliases = [feature.name].concat(feature.aliases || []);
        searchTexts.forEach(function (text, index) {
          if (aliases.some(function (alias) { return aliasInText(alias, text); })) ids.add(options.questions[index].id);
        });
        physicalLinked.set(feature.id, Array.from(ids).map(function (id) { return questionById.get(id); }).filter(Boolean));
      });
    }

    function unmatchedPhysicalQuestions() {
      var layer = nodes.layer.value;
      var pattern = {
        marine: /\b(ocean|sea|gulf|strait|bay|coast|island|marine)\b/i,
        terrain: /\b(mountain|peak|mount|range|plateau|glacier|hill|summit|pass)\b/i,
        rivers: /\b(river|tributary|canal|confluence|waterway|stream)\b/i,
        waterworks: /\b(dam|barrage|reservoir|headworks|hydropower|hydel)\b/i
      }[layer];
      if (!pattern) return [];
      var pinned = new Set();
      physicalList().forEach(function (feature) {
        physicalQuestionsFor(feature.id).forEach(function (question) { pinned.add(question.id); });
      });
      return options.questions.filter(function (question) {
        return !pinned.has(question.id)
          && (nodes.category.value === "all" || question.categoryId === nodes.category.value)
          && pattern.test(question.question || "");
      });
    }

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

    function renderCountryIndex() {
      if (isPhysicalMode()) { renderPhysicalIndex(); return; }
      if (!features) return;
      var previousScroll = nodes.countryIndexList.scrollTop;
      var aliasIso3 = countryNames.get(countryFilter);
      var matches = features.filter(function (feature) {
        return !countryFilter || normalize(feature.properties.name).includes(countryFilter)
          || feature.properties.iso3 === aliasIso3;
      }).sort(function (a, b) {
        var difference = questionsFor(b.properties.iso3).length - questionsFor(a.properties.iso3).length;
        return difference || a.properties.name.localeCompare(b.properties.name);
      });
      var fragment = document.createDocumentFragment();
      matches.forEach(function (feature) {
        var button = make("button", feature.properties.iso3 === selectedIso3 ? "is-selected" : "", feature.properties.name);
        button.type = "button";
        button.dataset.iso3 = feature.properties.iso3;
        button.title = questionsFor(feature.properties.iso3).length + " linked MCQs";
        button.setAttribute("aria-pressed", feature.properties.iso3 === selectedIso3 ? "true" : "false");
        fragment.appendChild(button);
      });
      nodes.countryIndexList.replaceChildren(fragment);
      nodes.countryIndexList.scrollTop = previousScroll;
      nodes.countryIndexCount.textContent = matches.length + " of " + features.length + " countries / regions";
    }

    function renderPhysicalIndex() {
      if (!physicalFeatures) return;
      var previousScroll = nodes.countryIndexList.scrollTop;
      var all = physicalList();
      var matches = all.filter(function (feature) {
        return !countryFilter || [feature.name].concat(feature.aliases || []).some(function (alias) {
          return normalize(alias).includes(countryFilter);
        });
      }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      var fragment = document.createDocumentFragment();
      matches.forEach(function (feature) {
        var count = physicalQuestionsFor(feature.id).length;
        var button = make("button", feature.id === selectedPhysicalId ? "is-selected" : "", feature.name + (count ? " · " + count : ""));
        button.type = "button";
        button.dataset.physicalId = feature.id;
        button.title = count + " linked MCQs";
        button.setAttribute("aria-pressed", feature.id === selectedPhysicalId ? "true" : "false");
        fragment.appendChild(button);
      });
      nodes.countryIndexList.replaceChildren(fragment);
      nodes.countryIndexList.scrollTop = previousScroll;
      nodes.countryIndexCount.textContent = matches.length + " of " + all.length + " mapped features";
    }

    function scheduleLabels() {
      if (labelFrame != null) return;
      labelFrame = window.requestAnimationFrame(function () {
        labelFrame = null;
        renderLabels();
      });
    }

    function labelArea(feature) {
      var polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      return polygons.reduce(function (largest, polygon) {
        var ring = polygon[0] || [];
        var twiceArea = 0;
        for (var index = 0; index < ring.length; index += 1) {
          var first = project(ring[index]);
          var second = project(ring[(index + 1) % ring.length]);
          twiceArea += first[0] * second[1] - second[0] * first[1];
        }
        return Math.max(largest, Math.abs(twiceArea) / 2);
      }, 0);
    }

    function buildLabels(fragment) {
      labelItems = [];
      var layer = document.createElementNS(SVG_NS, "g");
      layer.setAttribute("class", "world-map-labels");
      layer.setAttribute("aria-hidden", "true");
      layer.setAttribute("pointer-events", "none");
      features.forEach(function (feature) {
        if (!Array.isArray(feature.properties.label)) return;
        var position = project(feature.properties.label);
        var label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", position[0].toFixed(2));
        label.setAttribute("y", position[1].toFixed(2));
        label.setAttribute("class", "world-map-label");
        label.setAttribute("display", "none");
        var labelName = SHORT_MAP_LABELS[feature.properties.iso3] || feature.properties.name;
        label.textContent = labelName;
        layer.appendChild(label);
        labelItems.push({
          iso3: feature.properties.iso3,
          name: labelName,
          x: position[0], y: position[1], node: label,
          score: Math.log1p(labelArea(feature)) * 9 +
            Math.log1p((linked.get(feature.properties.iso3) || []).length) * 6 +
            (PROMINENT_LABELS[feature.properties.iso3] ? 60 : 0)
        });
      });
      fragment.appendChild(layer);
    }

    function renderLabels() {
      if (!features || !nodes.svg.isConnected || !labelItems.length) return;
      var matrix = nodes.svg.getScreenCTM();
      var rect = nodes.svg.getBoundingClientRect();
      if (!matrix || !rect.width || !rect.height) return;
      var scale = Math.abs(matrix.a);
      if (!scale) return;
      var mobile = rect.width < 480;
      var fontPixels = mobile ? 10 : 11;
      var boxes = [];
      var sorted = labelItems.slice().sort(function (a, b) {
        if (a.iso3 === selectedIso3) return -1;
        if (b.iso3 === selectedIso3) return 1;
        return b.score - a.score;
      });
      sorted.forEach(function (item) {
        item.node.setAttribute("display", "none");
        item.node.classList.toggle("is-selected", item.iso3 === selectedIso3);
      });
      sorted.forEach(function (item) {
        var chosen = item.iso3 === selectedIso3;
        var x = item.x * matrix.a + item.y * matrix.c + matrix.e - rect.left;
        var y = item.x * matrix.b + item.y * matrix.d + matrix.f - rect.top;
        if (x < -5 || x > rect.width + 5 || y < -5 || y > rect.height + 5) return;
        var size = fontPixels + (chosen ? 1.5 : 0);
        labelCanvas.font = "700 " + size + "px system-ui";
        var halfWidth = labelCanvas.measureText(item.name).width / 2 + 3;
        var halfHeight = size / 2 + 3;
        var box = { left: x - halfWidth, right: x + halfWidth, top: y - halfHeight, bottom: y + halfHeight };
        if (!chosen && (box.left < 0 || box.right > rect.width || box.top < 0 || box.bottom > rect.height)) return;
        if (!chosen && boxes.some(function (previous) {
          return box.left < previous.right && box.right > previous.left &&
            box.top < previous.bottom && box.bottom > previous.top;
        })) return;
        item.node.setAttribute("font-size", (size / scale).toFixed(3));
        item.node.setAttribute("stroke-width", (2.6 / scale).toFixed(3));
        item.node.setAttribute("display", "inline");
        boxes.push(box);
      });
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
      resizePhysicalMarkers();
      scheduleLabels();
    }

    function resizePhysicalMarkers() {
      var rect = nodes.svg.getBoundingClientRect();
      var radius = Math.max(0.8, Math.min(18, view.width / Math.max(300, rect.width || 800) * 5));
      nodes.svg.querySelectorAll(".world-map-physical-marker").forEach(function (marker) {
        marker.setAttribute("r", radius.toFixed(2));
      });
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
      if (isPhysicalMode()) {
        var physical = physicalList();
        var matched = physical.filter(function (feature) { return physicalQuestionsFor(feature.id).length; }).length;
        var links = physical.reduce(function (sum, feature) { return sum + physicalQuestionsFor(feature.id).length; }, 0);
        var category = nodes.category.value === "all" ? "All categories" : (categoryNames.get(nodes.category.value) || "Selected category");
        nodes.status.textContent = category + ": " + matched + " of " + physical.length + " mapped features with linked MCQs · " + links + " feature–MCQ links. Points for broad areas are representative, not exact boundaries.";
        return;
      }
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
      countryPaths.clear();
      countryBounds.clear();
      fragment.appendChild(svgNode("g", { "class": "world-map-marine-geometry", "id": "world-map-marine-geometry" }));
      features.forEach(function (feature) {
        var iso3 = feature.properties.iso3;
        var pathData = geometryPath(feature.geometry);
        countryPaths.set(iso3, pathData);
        countryBounds.set(iso3, boundsForGeometry(feature.geometry));
        var path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", pathData);
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
      fragment.appendChild(svgNode("g", { "class": "world-map-physical-layer", "id": "world-map-physical-layer" }));
      buildLabels(fragment);
      nodes.svg.replaceChildren(fragment);
      nodes.svg.setAttribute("role", "group");
      nodes.svg.setAttribute("aria-label", "Interactive world map of countries and regions with linked MCQs");
      setView({ x: 0, y: 0, width: WORLD_WIDTH });
      updateColors();
    }

    function renderPhysicalLayer() {
      var layer = document.getElementById("world-map-physical-layer");
      var marineLayer = document.getElementById("world-map-marine-geometry");
      if (!layer) return;
      layer.replaceChildren();
      if (marineLayer) marineLayer.replaceChildren();
      nodes.svg.classList.toggle("is-physical-mode", isPhysicalMode());
      if (!isPhysicalMode() || !physicalFeatures) return;
      var fragment = document.createDocumentFragment();
      if (physicalGeometry) {
        physicalGeometry.forEach(function (shape) {
          var item = physicalById.get(shape.properties.id);
          if (!item || physicalLayerFor(item.kind) !== nodes.layer.value) return;
          var polygon = shape.geometry.type === "Polygon" || shape.geometry.type === "MultiPolygon";
          var path = svgNode("path", {
            d: polygon ? geometryPath(shape.geometry) : lineGeometryPath(shape.geometry),
            "class": polygon ? "world-map-marine-area" : "world-map-physical-river",
            "data-physical-id": item.id, role: "button", tabindex: "0",
            "aria-label": item.name + " geographic outline, " + physicalQuestionsFor(item.id).length + " linked MCQs"
          });
          if (selectedPhysicalId === item.id) path.classList.add("is-selected");
          path.appendChild(svgNode("title", {}, item.name + " (generalized Natural Earth geometry)"));
          (polygon ? marineLayer : fragment).appendChild(path);
        });
      }
      physicalList().forEach(function (feature) {
        var point = project(feature.point);
        var marker = svgNode("circle", {
          cx: point[0].toFixed(2), cy: point[1].toFixed(2), r: "2.5",
          "class": "world-map-physical-marker" + (selectedPhysicalId === feature.id ? " is-selected" : ""),
          "data-kind": feature.kind, "data-physical-id": feature.id,
          role: "button", tabindex: "0", "aria-label": feature.name + ", " + physicalQuestionsFor(feature.id).length + " linked MCQs"
        });
        marker.appendChild(svgNode("title", {}, feature.name));
        fragment.appendChild(marker);
      });
      layer.appendChild(fragment);
      resizePhysicalMarkers();
    }

    function loadPhysicalGeometry() {
      if (physicalGeometry || physicalGeometryLoading) return physicalGeometryLoading || Promise.resolve();
      physicalGeometryLoading = fetch(PHYSICAL_GEOMETRY_URL).then(function (response) {
        if (!response.ok) throw new Error("Physical geometry request failed: " + response.status);
        return response.json();
      }).then(function (data) {
        if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
          physicalGeometry = data.features;
          if (isPhysicalMode()) renderPhysicalLayer();
        }
      }).catch(function () {
        // Curated points and MCQs remain usable if an optional outline fails.
        physicalGeometryLoading = null;
      });
      return physicalGeometryLoading;
    }

    function directionLessonFor(question) {
      var lesson = DIRECTION_LESSONS[question.id];
      return lesson && countries.has(lesson.from) && lesson.to.every(function (iso3) { return countries.has(iso3); })
        ? lesson : null;
    }

    function renderDirectionPanel(panel, lesson) {
      var codes = [lesson.from].concat(lesson.to);
      function markerPoint(iso3) {
        var lonLat = lesson.points && lesson.points[iso3] || countries.get(iso3).properties.label;
        return project(lonLat);
      }
      var box = codes.map(markerPoint).reduce(function (whole, point) {
        whole.left = Math.min(whole.left, point[0]);
        whole.right = Math.max(whole.right, point[0]);
        whole.top = Math.min(whole.top, point[1]);
        whole.bottom = Math.max(whole.bottom, point[1]);
        return whole;
      }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
      var width = Math.max(55, (box.right - box.left) * 1.6);
      var height = Math.max(30, (box.bottom - box.top) * 1.6);
      var ratio = MINI_WIDTH / MINI_HEIGHT;
      if (width / height < ratio) width = height * ratio;
      else height = width / ratio;
      var focus = {
        x: Math.max(0, Math.min(WORLD_WIDTH - width, (box.left + box.right - width) / 2)),
        y: Math.max(0, Math.min(WORLD_HEIGHT - height, (box.top + box.bottom - height) / 2)),
        width: width, height: height
      };
      var scale = MINI_WIDTH / focus.width;
      var viewport = { left: focus.x, right: focus.x + focus.width, top: focus.y, bottom: focus.y + focus.height };
      function displayName(iso3) { return SHORT_MAP_LABELS[iso3] || countries.get(iso3).properties.name; }
      var originName = displayName(lesson.from);
      var destinationNames = lesson.to.map(displayName);
      panel.replaceChildren();
      panel.appendChild(make("h3", "", lesson.title));
      var svg = svgNode("svg", {
        "class": "world-map-direction-svg", "viewBox": "0 0 " + MINI_WIDTH + " " + MINI_HEIGHT,
        "role": "img", "aria-label": "A " + originName + " se " + destinationNames.join(" aur ") + " tak direction map"
      });
      svg.appendChild(svgNode("title", {}, "A " + originName + " to " + destinationNames.join(" and ")));
      panel.appendChild(svg);
      var unitPerPixel = MINI_WIDTH / (svg.getBoundingClientRect().width || MINI_WIDTH);
      var radius = 12 * unitPerPixel;
      var group = svgNode("g", { transform: "translate(" + (-focus.x * scale).toFixed(3) + " " +
        (-focus.y * scale).toFixed(3) + ") scale(" + scale.toFixed(5) + ")" });
      features.forEach(function (feature) {
        var bounds = countryBounds.get(feature.properties.iso3);
        if (!boundsOverlap(bounds, viewport)) return;
        group.appendChild(svgNode("path", { d: countryPaths.get(feature.properties.iso3),
          "fill-rule": "evenodd", "class": "world-map-direction-basemap" }));
      });
      codes.forEach(function (iso3, index) {
        group.appendChild(svgNode("path", { d: countryPaths.get(iso3), "fill-rule": "evenodd",
          "class": index ? "world-map-direction-destination" : "world-map-direction-origin" }));
      });
      svg.appendChild(group);
      function screenPoint(iso3) {
        var point = markerPoint(iso3);
        return { x: (point[0] - focus.x) * scale, y: (point[1] - focus.y) * scale };
      }
      var start = screenPoint(lesson.from);
      lesson.to.forEach(function (iso3, index) {
        var end = screenPoint(iso3);
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var length = Math.hypot(dx, dy) || 1;
        var ux = dx / length;
        var uy = dy / length;
        var tipX = end.x - ux * (radius + 3 * unitPerPixel);
        var tipY = end.y - uy * (radius + 3 * unitPerPixel);
        var baseX = tipX - ux * (10 * unitPerPixel);
        var baseY = tipY - uy * (10 * unitPerPixel);
        var wing = 5 * unitPerPixel;
        svg.appendChild(svgNode("line", { x1: (start.x + ux * radius).toFixed(2),
          y1: (start.y + uy * radius).toFixed(2), x2: tipX.toFixed(2), y2: tipY.toFixed(2),
          "class": "world-map-direction-route" }));
        svg.appendChild(svgNode("path", { d: "M" + tipX.toFixed(2) + " " + tipY.toFixed(2) +
          "L" + (baseX - uy * wing).toFixed(2) + " " + (baseY + ux * wing).toFixed(2) +
          "M" + tipX.toFixed(2) + " " + tipY.toFixed(2) +
          "L" + (baseX + uy * wing).toFixed(2) + " " + (baseY - ux * wing).toFixed(2),
          "class": "world-map-direction-route" }));
        var badge = svgNode("g", {});
        badge.appendChild(svgNode("circle", { cx: end.x.toFixed(2), cy: end.y.toFixed(2),
          r: radius.toFixed(2), "class": "world-map-direction-marker-b" }));
        var text = svgNode("text", { x: end.x.toFixed(2), y: (end.y + 3.5 * unitPerPixel).toFixed(2),
          "text-anchor": "middle", style: "fill:#fff;stroke:none;font-size:" + (9 * unitPerPixel).toFixed(2) + "px" },
          lesson.to.length > 1 ? "B" + (index + 1) : "B");
        badge.appendChild(text);
        svg.appendChild(badge);
      });
      var originBadge = svgNode("g", {});
      originBadge.appendChild(svgNode("circle", { cx: start.x.toFixed(2), cy: start.y.toFixed(2),
        r: radius.toFixed(2), "class": "world-map-direction-marker-a" }));
      originBadge.appendChild(svgNode("text", { x: start.x.toFixed(2),
        y: (start.y + 3.5 * unitPerPixel).toFixed(2), "text-anchor": "middle",
        style: "fill:#fff;stroke:none;font-size:" + (10 * unitPerPixel).toFixed(2) + "px" }, "A"));
      svg.appendChild(originBadge);
      var legend = make("ul", "world-map-direction-legend");
      codes.forEach(function (iso3, index) {
        var item = make("li");
        var label = index ? (lesson.to.length > 1 ? "B" + index : "B") : "A";
        item.appendChild(make("span", index ? "world-map-direction-marker-b" : "world-map-direction-marker-a", label));
        item.appendChild(make("span", "", displayName(iso3)));
        legend.appendChild(item);
      });
      panel.appendChild(legend);
      var explanation = make("p", "world-map-direction-explanation", lesson.explanation);
      explanation.lang = "ur-Latn";
      panel.appendChild(explanation);
      panel.appendChild(make("p", "world-map-direction-explanation",
        "A aur B mulkon ke numayanda points hain; arrow direction samjhane ke liye hai, exact border line nahi."));
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
      var lesson = directionLessonFor(question);
      if (lesson && !isPhysicalMode()) {
        var panelId = "world-map-direction-" + question.id.replace(/[^a-z0-9-]/gi, "-");
        var toggle = make("button", "world-map-direction-toggle", "Map par samjhein");
        toggle.type = "button";
        toggle.dataset.directionId = question.id;
        toggle.setAttribute("aria-controls", panelId);
        toggle.setAttribute("aria-expanded", "false");
        card.appendChild(toggle);
        var panel = make("div", "world-map-direction-panel");
        panel.id = panelId;
        panel.hidden = true;
        card.appendChild(panel);
      }
      return card;
    }

    function loadCities() {
      if (citiesByCountry || cityLoading || cityUnavailable) return;
      cityLoading = fetch(CITIES_URL).then(function (response) {
        if (!response.ok) throw new Error("City data request failed: " + response.status);
        return response.json();
      }).then(function (data) {
        if (!data || !Array.isArray(data.cities)) throw new Error("City data invalid");
        var grouped = new Map();
        data.cities.forEach(function (city) {
          if (!countries.has(city.iso3) || !city.name || !Number.isFinite(city.lon) || !Number.isFinite(city.lat)) return;
          if (!grouped.has(city.iso3)) grouped.set(city.iso3, []);
          grouped.get(city.iso3).push(city);
        });
        citiesByCountry = grouped;
        cityLoading = null;
        if (selectedIso3) renderCountryMap();
      }).catch(function () {
        cityLoading = null;
        cityUnavailable = true;
        if (selectedIso3) renderCountryMap();
      });
    }

    function renderCountryMap() {
      if (!selectedIso3 || !countries.has(selectedIso3)) {
        nodes.countryMap.hidden = true;
        return;
      }
      var feature = countries.get(selectedIso3);
      var cities = citiesByCountry ? (citiesByCountry.get(selectedIso3) || []) : [];
      var focus = focusForCountry(feature, cities);
      nodes.countryMap.hidden = false;
      nodes.countryMapTitle.textContent = feature.properties.name + " map";
      nodes.countryMapEmpty.hidden = true;
      if (!focus) {
        nodes.countrySvg.replaceChildren();
        nodes.countryMapEmpty.textContent = "Is country ka map filhal available nahi hai.";
        nodes.countryMapEmpty.hidden = false;
        nodes.countryMapSummary.textContent = "Map data unavailable.";
        nodes.countryCities.replaceChildren();
        return;
      }
      var scale = MINI_WIDTH / focus.width;
      var transform = "translate(" + (-focus.x * scale).toFixed(3) + " " + (-focus.y * scale).toFixed(3) + ") scale(" + scale.toFixed(5) + ")";
      var viewport = { left: focus.x, right: focus.x + focus.width, top: focus.y, bottom: focus.y + focus.height };
      var fragment = document.createDocumentFragment();
      var land = document.createElementNS(SVG_NS, "g");
      land.setAttribute("transform", transform);
      var shifts = [0];
      if (viewport.left < 0) shifts.push(-WORLD_WIDTH);
      if (viewport.right > WORLD_WIDTH) shifts.push(WORLD_WIDTH);
      features.forEach(function (other) {
        var iso3 = other.properties.iso3;
        if (iso3 === selectedIso3) return;
        shifts.forEach(function (shift) {
          var bounds = countryBounds.get(iso3);
          if (!boundsOverlap({ left: bounds.left + shift, right: bounds.right + shift,
            top: bounds.top, bottom: bounds.bottom }, viewport)) return;
          var path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", countryPaths.get(iso3));
          path.setAttribute("fill-rule", "evenodd");
          path.setAttribute("class", "world-map-mini-neighbor");
          if (shift) path.setAttribute("transform", "translate(" + shift + " 0)");
          land.appendChild(path);
        });
      });
      shifts.forEach(function (shift) {
        var bounds = countryBounds.get(selectedIso3);
        if (!boundsOverlap({ left: bounds.left + shift, right: bounds.right + shift,
          top: bounds.top, bottom: bounds.bottom }, viewport)) return;
        var selectedPath = document.createElementNS(SVG_NS, "path");
        selectedPath.setAttribute("d", countryPaths.get(selectedIso3));
        selectedPath.setAttribute("fill-rule", "evenodd");
        selectedPath.setAttribute("class", "world-map-mini-selected");
        if (shift) selectedPath.setAttribute("transform", "translate(" + shift + " 0)");
        land.appendChild(selectedPath);
      });
      fragment.appendChild(land);
      if (focus.tiny) {
        var anchor = focus.anchor;
        var highlight = document.createElementNS(SVG_NS, "circle");
        highlight.setAttribute("cx", ((anchor[0] - focus.x) * scale).toFixed(2));
        highlight.setAttribute("cy", ((anchor[1] - focus.y) * scale).toFixed(2));
        highlight.setAttribute("r", "7");
        highlight.setAttribute("class", "world-map-mini-selected");
        fragment.appendChild(highlight);
      }
      var cityList = document.createDocumentFragment();
      var boxes = [];
      var cityCountOnMap = 0;
      var rect = nodes.countrySvg.getBoundingClientRect();
      var width = rect.width || MINI_WIDTH;
      var unitPerPixel = MINI_WIDTH / width;
      var labelSize = 11 * unitPerPixel;
      var dotRadius = 3.7 * unitPerPixel;
      var labelLimit = width < 480 ? 0 : 8;
      cities.forEach(function (city) {
        cityList.appendChild(make("li", "", city.name));
        var point = project([city.lon, city.lat]);
        if (viewport.left < 0 && point[0] > WORLD_WIDTH + viewport.left) point[0] -= WORLD_WIDTH;
        if (viewport.right > WORLD_WIDTH && point[0] < viewport.right - WORLD_WIDTH) point[0] += WORLD_WIDTH;
        var x = (point[0] - focus.x) * scale;
        var y = (point[1] - focus.y) * scale;
        if (x < dotRadius || x > MINI_WIDTH - dotRadius || y < dotRadius || y > MINI_HEIGHT - dotRadius) return;
        cityCountOnMap += 1;
        var marker = document.createElementNS(SVG_NS, "g");
        var title = document.createElementNS(SVG_NS, "title");
        title.textContent = city.name;
        marker.appendChild(title);
        var dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", x.toFixed(2));
        dot.setAttribute("cy", y.toFixed(2));
        dot.setAttribute("r", (dotRadius * (city.capital ? 1.35 : 1)).toFixed(2));
        dot.setAttribute("class", "world-map-mini-city-dot");
        marker.appendChild(dot);
        if (boxes.length < labelLimit) {
          labelCanvas.font = "700 11px system-ui";
          var textWidth = labelCanvas.measureText(city.name).width * unitPerPixel;
          var placements = [
            { x: x + dotRadius + 5, y: y - 5 * unitPerPixel, side: "start" },
            { x: x + dotRadius + 5, y: y + 13 * unitPerPixel, side: "start" },
            { x: x - dotRadius - 5, y: y - 5 * unitPerPixel, side: "end" },
            { x: x - dotRadius - 5, y: y + 13 * unitPerPixel, side: "end" }
          ];
          var placement = placements.find(function (candidate) {
            var box = {
              left: candidate.side === "start" ? candidate.x : candidate.x - textWidth,
              right: candidate.side === "start" ? candidate.x + textWidth : candidate.x,
              top: candidate.y - labelSize, bottom: candidate.y + 2 * unitPerPixel
            };
            if (box.left < 4 || box.right > MINI_WIDTH - 4 || box.top < 4 || box.bottom > MINI_HEIGHT - 4) return false;
            if (boxes.some(function (old) {
              return box.left < old.right + 3 && box.right > old.left - 3 &&
                box.top < old.bottom + 3 && box.bottom > old.top - 3;
            })) return false;
            boxes.push(box);
            return true;
          });
          if (placement) {
            var label = document.createElementNS(SVG_NS, "text");
            label.setAttribute("x", placement.x.toFixed(2));
            label.setAttribute("y", placement.y.toFixed(2));
            label.setAttribute("text-anchor", placement.side);
            label.setAttribute("class", "world-map-mini-city-label");
            label.style.fontSize = labelSize.toFixed(2) + "px";
            label.textContent = city.name;
            marker.appendChild(label);
          }
        }
        fragment.appendChild(marker);
      });
      nodes.countrySvg.replaceChildren(fragment);
      nodes.countrySvg.setAttribute("aria-label", "Focused map of " + feature.properties.name + " with " + cityCountOnMap + " major city markers");
      nodes.countryCities.replaceChildren(cityList);
      if (cityUnavailable) {
        nodes.countryMapSummary.textContent = "Country map ready; city data is unavailable right now.";
      } else if (!citiesByCountry) {
        nodes.countryMapSummary.textContent = "Country map ready. Major cities load ho rahi hain...";
        loadCities();
      } else if (cities.length) {
        nodes.countryMapSummary.textContent = cityCountOnMap + " of " + cities.length + " major cities on this focused map; remote areas may be outside the frame.";
      } else {
        nodes.countryMapSummary.textContent = "Selected country ka focused map.";
        nodes.countryMapEmpty.textContent = "Is region ke liye major city markers available nahi hain.";
        nodes.countryMapEmpty.hidden = false;
      }
    }

    function renderDetail() {
      if (isPhysicalMode()) { renderPhysicalDetail(); return; }
      nodes.physicalMeta.hidden = true;
      nodes.physicalUnmatched.hidden = true;
      nodes.compassGuide.hidden = false;
      nodes.directionFilter.hidden = false;
      if (!selectedIso3 || !countries.has(selectedIso3)) return;
      var feature = countries.get(selectedIso3);
      var list = questionsFor(selectedIso3);
      var directionList = list.filter(directionLessonFor);
      var displayList = nodes.directionOnly.checked ? directionList : list;
      nodes.detailTitle.textContent = feature.properties.name;
      nodes.detailCount.textContent = list.length + " linked MCQs in the selected category.";
      nodes.directionCount.textContent = directionList.length + " direction MCQ" + (directionList.length === 1 ? "" : "s") + " with map explanation.";
      renderCountryMap();
      var fragment = document.createDocumentFragment();
      if (!displayList.length) {
        fragment.appendChild(make("p", "world-map-no-questions", nodes.directionOnly.checked
          ? "Is country aur category mein verified direction MCQ nahi mila. Compass guide upar available hai."
          : "No linked MCQs for this country in this category yet."));
      } else {
        displayList.slice(0, shown).forEach(function (question) { fragment.appendChild(displayQuestion(question)); });
      }
      nodes.questionList.replaceChildren(fragment);
      nodes.more.hidden = shown >= displayList.length;
      nodes.more.textContent = "Show more MCQs (" + Math.min(PAGE_SIZE, Math.max(0, displayList.length - shown)) + ")";
      if (activeDirectionId) {
        var openButton = Array.from(nodes.questionList.querySelectorAll("button[data-direction-id]"))
          .find(function (button) { return button.dataset.directionId === activeDirectionId; });
        if (openButton) {
          var panel = document.getElementById(openButton.getAttribute("aria-controls"));
          var lesson = DIRECTION_LESSONS[activeDirectionId];
          panel.hidden = false;
          openButton.setAttribute("aria-expanded", "true");
          openButton.closest(".world-map-question").classList.add("is-direction-open");
          renderDirectionPanel(panel, lesson);
        } else {
          activeDirectionId = null;
        }
      }
    }

    function renderPhysicalDetail() {
      nodes.compassGuide.hidden = true;
      nodes.directionFilter.hidden = true;
      nodes.countryMap.hidden = true;
      activeDirectionId = null;
      var feature = selectedPhysicalId && physicalById.get(selectedPhysicalId);
      if (feature && physicalLayerFor(feature.kind) !== nodes.layer.value) feature = null;
      var list = feature ? physicalQuestionsFor(feature.id) : [];
      nodes.detailTitle.textContent = feature ? feature.name : "Select a map feature";
      nodes.detailCount.textContent = feature
        ? list.length + " linked MCQs in the selected category."
        : "Map marker ya upar list se koi ocean, mountain, river, barrage ya dam select karein.";
      nodes.physicalMeta.hidden = !feature;
      if (feature) {
        nodes.physicalNote.textContent = feature.geoNote || "Marker is a representative map location; it is not a surveyed boundary or full route.";
        nodes.physicalSource.href = feature.sourceUrl;
      }
      var fragment = document.createDocumentFragment();
      if (feature && !list.length) {
        fragment.appendChild(make("p", "world-map-no-questions", "Is feature ke liye selected category mein linked MCQ nahi mila. Location aur source upar available hain."));
      } else if (feature) {
        list.slice(0, shown).forEach(function (question) { fragment.appendChild(displayQuestion(question)); });
      }
      nodes.questionList.replaceChildren(fragment);
      nodes.more.hidden = !feature || shown >= list.length;
      nodes.more.textContent = "Show more MCQs (" + Math.min(PAGE_SIZE, Math.max(0, list.length - shown)) + ")";
      var unmatched = unmatchedPhysicalQuestions();
      nodes.physicalUnmatched.hidden = false;
      nodes.physicalUnmatchedSummary.textContent = unmatched.length + " related MCQs without a verified map pin";
      var extra = document.createDocumentFragment();
      unmatched.forEach(function (question) { extra.appendChild(displayQuestion(question)); });
      nodes.physicalUnmatchedList.replaceChildren(extra);
    }

    function zoomToPhysical(feature) {
      var point = project(feature.point);
      var width = Math.min(view.width, physicalLayerFor(feature.kind) === "marine" ? 310 : 110);
      var height = width * WORLD_HEIGHT / WORLD_WIDTH;
      setView({ x: point[0] - width / 2, y: point[1] - height / 2, width: width });
    }

    function selectPhysical(id, center) {
      var feature = physicalById.get(id);
      if (!feature || physicalLayerFor(feature.kind) !== nodes.layer.value) return;
      selectedPhysicalId = id;
      shown = PAGE_SIZE;
      nodes.svg.querySelectorAll("[data-physical-id].is-selected").forEach(function (node) { node.classList.remove("is-selected"); });
      nodes.svg.querySelectorAll("[data-physical-id]").forEach(function (node) {
        if (node.dataset.physicalId === id) node.classList.add("is-selected");
      });
      nodes.search.value = feature.name;
      countryFilter = normalize(feature.name);
      if (center) zoomToPhysical(feature);
      renderPhysicalIndex();
      renderPhysicalDetail();
      hideTooltip();
    }

    function selectCountry(iso3, center) {
      if (!countries.has(iso3)) return;
      selectedIso3 = iso3;
      if (cityUnavailable) cityUnavailable = false;
      shown = PAGE_SIZE;
      activeDirectionId = null;
      nodes.svg.querySelectorAll(".is-selected").forEach(function (shape) { shape.classList.remove("is-selected"); });
      nodes.svg.querySelectorAll('[data-iso3="' + iso3 + '"]').forEach(function (shape) { shape.classList.add("is-selected"); });
      nodes.search.value = countries.get(iso3).properties.name;
      if (center) zoomToCountry(iso3);
      countryFilter = normalize(nodes.search.value);
      renderCountryIndex();
      scheduleLabels();
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

    function showPhysicalTooltip(id, clientX, clientY) {
      var feature = physicalById.get(id);
      if (!feature || drag && drag.moved) return;
      if (tooltipIso3 !== "physical:" + id) {
        tooltipIso3 = "physical:" + id;
        var questions = physicalQuestionsFor(id);
        var fragment = document.createDocumentFragment();
        fragment.appendChild(make("strong", "", feature.name));
        fragment.appendChild(make("span", "", questions.length + " linked MCQs"));
        if (questions.length) fragment.appendChild(make("small", "", questions[0].question));
        nodes.tooltip.replaceChildren(fragment);
        nodes.tooltip.hidden = false;
      }
      var rect = nodes.stage.getBoundingClientRect();
      nodes.tooltip.style.left = Math.max(6, Math.min(rect.width - nodes.tooltip.offsetWidth - 6, clientX - rect.left + 12)) + "px";
      nodes.tooltip.style.top = Math.max(6, Math.min(rect.height - nodes.tooltip.offsetHeight - 6, clientY - rect.top + 12)) + "px";
    }

    function shapeFromEvent(event) {
      var target = event.target;
      var shape = target && typeof target.closest === "function" ? target.closest("[data-iso3], [data-physical-id]") : null;
      return shape && nodes.svg.contains(shape) ? shape : null;
    }

    function findCountry() {
      if (isPhysicalMode()) { findPhysical(); return; }
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

    function findPhysical() {
      if (!physicalFeatures) { nodes.status.textContent = "Topic map load hone ke baad search karein."; return; }
      var query = normalize(nodes.search.value);
      if (!query) { nodes.status.textContent = "Feature ka naam likhein, phir Find dabayein."; return; }
      var match = physicalList().find(function (feature) {
        return [feature.name].concat(feature.aliases || []).some(function (alias) { return normalize(alias) === query; });
      }) || physicalList().find(function (feature) { return normalize(feature.name).includes(query); });
      if (!match) { nodes.status.textContent = "Is topic mein feature nahi mila. Naam ya spelling check karein."; return; }
      selectPhysical(match.id, true);
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
        renderMap();
        applyLayer();
        return features;
      }).catch(function (error) {
        loading = null;
        features = null;
        countries.clear();
        linked.clear();
        placeAliases.clear();
        countryNames.clear();
        countryPaths.clear();
        countryBounds.clear();
        nodes.countryIndexList.replaceChildren();
        nodes.countryIndexCount.textContent = "Country names unavailable";
        throw error;
      });
      return loading;
    }

    function loadPhysical() {
      if (physicalFeatures) return Promise.resolve(physicalFeatures);
      if (physicalLoading) return physicalLoading;
      physicalLoading = Promise.all([PHYSICAL_WATER_URL, PHYSICAL_TERRAIN_URL].map(function (url) {
        return fetch(url).then(function (response) {
          if (!response.ok) throw new Error("Physical map data request failed: " + response.status);
          return response.json();
        });
      })).then(function (files) {
        if (files.some(function (file) { return !file || file.schemaVersion !== 1 || !Array.isArray(file.features); })) {
          throw new Error("Physical map data invalid");
        }
        physicalFeatures = files.flatMap(function (file) { return file.features; }).filter(function (feature) {
          return feature && feature.id && feature.name && feature.kind && Array.isArray(feature.point) && feature.point.length === 2;
        });
        physicalById = new Map(physicalFeatures.map(function (feature) { return [feature.id, feature]; }));
        indexPhysicalQuestions();
        nodes.error.hidden = true;
        nodes.retry.hidden = true;
        if (isPhysicalMode()) applyLayer();
        loadPhysicalGeometry();
        return physicalFeatures;
      }).catch(function (error) {
        physicalLoading = null;
        throw error;
      });
      return physicalLoading;
    }

    function renderSearchOptions() {
      var choices = document.createDocumentFragment();
      if (isPhysicalMode()) {
        physicalList().forEach(function (feature) {
          var choice = make("option"); choice.value = feature.name; choices.appendChild(choice);
        });
      } else if (features) {
        features.slice().sort(function (a, b) { return a.properties.name.localeCompare(b.properties.name); }).forEach(function (feature) {
          var choice = make("option"); choice.value = feature.properties.name; choices.appendChild(choice);
        });
      }
      nodes.countries.replaceChildren(choices);
    }

    function applyLayer() {
      if (!features) return;
      var physical = isPhysicalMode();
      var titles = { marine: "Oceans & seas", terrain: "Mountains & glaciers", rivers: "Rivers & canals", waterworks: "Barrages & dams" };
      nodes.searchLabel.textContent = physical ? "Search map feature" : "Search country";
      nodes.search.placeholder = physical ? "e.g. Indus River, K2, Arabian Sea" : "e.g. Pakistan, France";
      nodes.countryIndexTitle.textContent = physical ? titles[nodes.layer.value] : "Countries / regions";
      nodes.countryIndexDescription.textContent = physical
        ? "Naam select karein; map marker, source aur related MCQs neeche dikhenge. Unpinned topic MCQs bhi available hain."
        : "Search above or select a country to view its related MCQs. Clear search to show all names.";
      nodes.footnote.textContent = physical
        ? "Sirf verified feature names aur correct answers/curated MCQ IDs link hote hain; wrong options nahi. Ocean outlines aur kuch river centerlines generalized Natural Earth data se hain. Baqi points representative hain, exact boundaries ya complete routes nahi. Har feature ka source neeche diya hai."
        : "Linking question aur us ke correct answer mein country/city names se hoti hai; wrong options count nahi hoti. Yeh map fact-check ya border-status reference nahi. Boundary data: Natural Earth (public domain).";
      nodes.svg.classList.toggle("is-physical-mode", physical);
      nodes.countryIndexList.replaceChildren();
      nodes.search.value = "";
      countryFilter = "";
      shown = PAGE_SIZE;
      activeDirectionId = null;
      if (physical && !physicalFeatures) {
        nodes.status.textContent = "Topic map load ho raha hai...";
        nodes.countryIndexCount.textContent = "Loading features...";
        nodes.detailTitle.textContent = "Loading map features...";
        nodes.detailCount.textContent = "";
        nodes.questionList.replaceChildren();
        nodes.more.hidden = true;
        nodes.countryMap.hidden = true;
        nodes.compassGuide.hidden = true;
        nodes.directionFilter.hidden = true;
        loadPhysical().catch(function () {
          nodes.error.hidden = false;
          nodes.retry.hidden = false;
          nodes.status.textContent = "Topic map load nahi ho saka. Try again dabayein.";
        });
        return;
      }
      if (physical) selectedPhysicalId = null;
      renderSearchOptions();
      renderPhysicalLayer();
      updateColors();
      renderCountryIndex();
      if (physical || selectedIso3) renderDetail();
      else {
        nodes.detailTitle.textContent = "Select a country";
        nodes.detailCount.textContent = "Map par country select karein; us se linked MCQs yahan aayenge.";
        nodes.physicalMeta.hidden = true;
        nodes.physicalUnmatched.hidden = true;
        nodes.compassGuide.hidden = false;
        nodes.directionFilter.hidden = false;
        nodes.countryMap.hidden = true;
        nodes.questionList.replaceChildren();
      }
      if (physical && ["rivers", "waterworks"].includes(nodes.layer.value)) {
        var pakistan = project([70.7, 30.5]);
        setView({ x: pakistan[0] - 85, y: pakistan[1] - 42.5, width: 170 });
      } else setView({ x: 0, y: 0, width: WORLD_WIDTH });
      hideTooltip();
    }

    function show() {
      nodes.error.hidden = true;
      nodes.retry.hidden = true;
      if (features) {
        if (isPhysicalMode() && !physicalFeatures) return loadPhysical().catch(function () {
          nodes.error.hidden = false;
          nodes.retry.hidden = false;
          nodes.status.textContent = "Topic map load nahi ho saka.";
        });
        updateColors();
        scheduleLabels();
        if (selectedIso3 && !isPhysicalMode()) renderCountryMap();
        return Promise.resolve();
      }
      nodes.status.textContent = "Map load ho raha hai...";
      nodes.countryIndexCount.textContent = "Loading countries...";
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
      ["screen", "card", "back", "layer", "search", "search-label", "countries", "find", "category", "zoom-in", "zoom-out", "reset",
        "status", "error", "retry", "stage", "svg", "tooltip", "footnote", "detail", "detail-title", "detail-count",
        "question-list", "more", "direction-only", "direction-count", "direction-filter", "compass-guide",
        "country-index-list", "country-index-count", "country-index-title", "country-index-description", "country-map",
        "country-map-title", "country-map-summary", "country-svg", "country-cities", "country-map-empty",
        "physical-meta", "physical-note", "physical-source", "physical-unmatched", "physical-unmatched-summary",
        "physical-unmatched-list"].forEach(function (key) {
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
      nodes.layer.addEventListener("change", applyLayer);
      nodes.find.addEventListener("click", findCountry);
      nodes.search.addEventListener("keydown", function (event) {
        if (event.key === "Enter") { event.preventDefault(); findCountry(); }
      });
      nodes.search.addEventListener("input", function () {
        countryFilter = normalize(nodes.search.value);
        renderCountryIndex();
      });
      nodes.countryIndexList.addEventListener("click", function (event) {
        var physicalButton = event.target.closest("button[data-physical-id]");
        if (physicalButton && isPhysicalMode()) {
          selectPhysical(physicalButton.dataset.physicalId, true);
          var restoredPhysical = Array.from(nodes.countryIndexList.querySelectorAll("button[data-physical-id]"))
            .find(function (button) { return button.dataset.physicalId === physicalButton.dataset.physicalId; });
          if (restoredPhysical) restoredPhysical.focus({ preventScroll: true });
          return;
        }
        var button = event.target.closest("button[data-iso3]");
        if (!button) return;
        var iso3 = button.dataset.iso3;
        selectCountry(iso3, true);
        var selectedButton = nodes.countryIndexList.querySelector('[data-iso3="' + iso3 + '"]');
        if (selectedButton) selectedButton.focus({ preventScroll: true });
      });
      nodes.category.addEventListener("change", function () {
        if (!features) return;
        updateColors();
        renderCountryIndex();
        if (isPhysicalMode()) renderPhysicalLayer();
        scheduleLabels();
        if (selectedIso3 || isPhysicalMode()) { shown = PAGE_SIZE; renderDetail(); }
        hideTooltip();
      });
      nodes.directionOnly.addEventListener("change", function () {
        shown = PAGE_SIZE;
        activeDirectionId = null;
        if (selectedIso3) renderDetail();
      });
      nodes.questionList.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-direction-id]");
        if (!button || !nodes.questionList.contains(button)) return;
        var id = button.dataset.directionId;
        activeDirectionId = activeDirectionId === id ? null : id;
        renderDetail();
        var restored = nodes.questionList.querySelector('[data-direction-id="' + id + '"]');
        if (restored) restored.focus({ preventScroll: true });
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
          iso3: shape && !isPhysicalMode() ? shape.dataset.iso3 : null,
          physicalId: shape && isPhysicalMode() ? shape.dataset.physicalId : null,
          view: Object.assign({}, view), moved: false, captured: false };
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
        if (shape && event.pointerType !== "touch" && isPhysicalMode() && shape.dataset.physicalId) {
          showPhysicalTooltip(shape.dataset.physicalId, event.clientX, event.clientY);
        } else if (shape && event.pointerType !== "touch" && !isPhysicalMode() && shape.dataset.iso3) {
          showTooltip(shape.dataset.iso3, event.clientX, event.clientY);
        }
        else hideTooltip();
      });
      function endDrag(event) {
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (drag.moved || ((drag.iso3 || drag.physicalId) && event.type !== "pointercancel" && nodes.svg.contains(event.target))) {
          suppressClick = true;
          window.setTimeout(function () { suppressClick = false; }, 350);
        }
        if (!drag.moved && event.type !== "pointercancel" && nodes.svg.contains(event.target)) {
          if (drag.physicalId) selectPhysical(drag.physicalId, false);
          else if (drag.iso3) selectCountry(drag.iso3, false);
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
        if (shape && isPhysicalMode() && shape.dataset.physicalId) selectPhysical(shape.dataset.physicalId, false);
        else if (shape && !isPhysicalMode() && shape.dataset.iso3) selectCountry(shape.dataset.iso3, false);
      });
      nodes.svg.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        var shape = shapeFromEvent(event);
        if (!shape) return;
        event.preventDefault();
        if (isPhysicalMode() && shape.dataset.physicalId) selectPhysical(shape.dataset.physicalId, false);
        else if (!isPhysicalMode() && shape.dataset.iso3) selectCountry(shape.dataset.iso3, false);
        nodes.detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      window.addEventListener("resize", function () { scheduleLabels(); resizePhysicalMarkers(); });
      window.addEventListener("resize", function () { if (selectedIso3 && !nodes.screen.hidden) renderCountryMap(); });
      window.addEventListener("online", function () {
        if (!cityUnavailable || !selectedIso3 || nodes.screen.hidden) return;
        cityUnavailable = false;
        renderCountryMap();
      });
    }

    return Object.freeze({ init: init });
  }

  window.PPSC_WORLD_MAP = createWorldMap();
})();
