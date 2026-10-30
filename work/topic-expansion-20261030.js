"use strict";

// Append-only, researched topic coverage. Each SRC/SIM pair tests two distinct
// facts or operations within one topic; neither is a paraphrase of the other.
// These are practice additions, not claims that a question appeared in a paper.
const accessedOn = "2026-10-30";

const evidence = {
  education: [
    ["https://pakistancode.gov.pk/pdffiles/administrator7f0dbe8685623b719ab97d92804b108b.pdf", "Constitution (Eighteenth Amendment) Act, 2010, section 9", "Pakistan Code, Ministry of Law and Justice", "pakistan-code", "official", "The 2010 amendment inserted Article 25A and states the five-to-sixteen-year education guarantee."],
    ["https://www.unicef.org/pakistan/media/5301/file/Situation%20Analysis%20Update%202020%3A%20Children%20in%20Pakistan.pdf", "Situation Analysis Update: Children in Pakistan (2020)", "UNICEF Pakistan", "unicef-pakistan", "authoritative-secondary", "Identifies Article 25A as introduced by the 18th Amendment and the ages five to sixteen."]
  ],
  heritage: [
    ["https://www.unesco.org/en/legal-affairs/convention-concerning-protection-world-cultural-and-natural-heritage", "World Heritage Convention, legal text", "UNESCO", "unesco", "primary", "UNESCO records adoption on 16 November 1972 and entry into force on 17 December 1975."],
    ["https://treaties.un.org/pages/showDetails.aspx?objid=08000002800fece0", "UN Treaty Collection: World Heritage Convention", "United Nations Treaty Collection", "un-treaty-collection", "official", "The UN treaty record gives the 1972 conclusion and 17 December 1975 entry-into-force dates."]
  ],
  sanguine: [
    ["https://dictionary.cambridge.org/dictionary/english/sanguine", "Cambridge Dictionary: sanguine", "Cambridge University Press", "cambridge-dictionary", "primary", "In the hopeful sense, sanguine means positive and hoping for good things."],
    ["https://www.merriam-webster.com/dictionary/sanguine", "Merriam-Webster Dictionary: sanguine", "Merriam-Webster", "merriam-webster", "primary", "The first adjective sense is confidently optimistic."]
  ],
  laconic: [
    ["https://dictionary.cambridge.org/us/dictionary/english/laconic", "Cambridge Dictionary: laconic", "Cambridge University Press", "cambridge-dictionary", "primary", "Cambridge lists terse as a synonym of laconic in the few-words sense."],
    ["https://www.merriam-webster.com/dictionary/laconic", "Merriam-Webster Dictionary: laconic", "Merriam-Webster", "merriam-webster", "primary", "Merriam-Webster describes laconic as terse or concise in speech."]
  ],
  dateline: [
    ["https://oceanservice.noaa.gov/facts/international-date-line.html", "NOAA: International Date Line", "National Oceanic and Atmospheric Administration", "noaa", "official", "The date line roughly follows 180 degrees longitude; crossing west advances the calendar by one day."],
    ["https://education.nationalgeographic.org/resource/date-line/", "National Geographic Education: Date Line", "National Geographic Society", "national-geographic", "authoritative-secondary", "The date line is near 180 degrees longitude; west is one calendar day ahead of east."]
  ],
  sets: [
    ["https://openstax.org/books/contemporary-mathematics/pages/1-4-set-operations-with-two-sets", "OpenStax: Set Operations with Two Sets", "OpenStax, Rice University", "openstax", "primary", "For overlapping sets, union equals first count plus second count minus the intersection."],
    ["https://math.libretexts.org/Bookshelves/Combinatorics_and_Discrete_Mathematics/Combinatorics_%28Morris%29/02%253A_Enumeration/10%253A_Other_Basic_Counting_Techniques/10.02%253A_Inclusion-Exclusion", "LibreTexts: Inclusion-Exclusion", "Mathematics LibreTexts", "libretexts", "authoritative-secondary", "The two-set inclusion-exclusion formula subtracts members counted in both sets once."]
  ],
  altText: [
    ["https://support.microsoft.com/en-us/accessibility/office-accessibility/add-alternative-text-to-a-shape-picture-chart-smartart-graphic-or-other-object", "Microsoft Support: Add alternative text", "Microsoft", "microsoft", "primary", "Alt text helps screen-reader users understand meaningful pictures; purely decorative visuals can be marked decorative."],
    ["https://www.w3.org/WAI/tutorials/images/", "W3C WAI: Images Tutorial", "World Wide Web Consortium", "w3c", "primary", "Text alternatives convey image meaning to screen readers, while decorative images should use a null alternative."]
  ],
  acidification: [
    ["https://oceanservice.noaa.gov/facts/acidification.html", "NOAA: What is Ocean Acidification?", "National Oceanic and Atmospheric Administration", "noaa", "official", "CO2 uptake lowers ocean pH and makes carbonate ions less available for shell formation."],
    ["https://www.whoi.edu/ocean-learning-hub/ocean-topics/how-the-ocean-works/ocean-chemistry/ocean-acidification/", "WHOI: Ocean Acidification", "Woods Hole Oceanographic Institution", "whoi", "primary", "Absorbed CO2 produces carbonic acid, reduces pH and reduces carbonate ions needed for shells."]
  ],
  zakatRecipients: [
    ["https://quran.com/at-tawbah/60", "Quran.com: Surah At-Tawbah 9:60", "Quran.com", "quran-com", "primary", "Verse 9:60 lists debtors and needy travellers among the Zakat recipient categories."],
    ["https://corpus.quran.com/translation.jsp?chapter=9&verse=60", "Quranic Arabic Corpus: 9:60 translations", "Quranic Arabic Corpus, University of Leeds", "quranic-corpus", "primary", "Parallel translations of 9:60 include those burdened by debt and the wayfarer."]
  ],
  inventory: [
    ["https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/", "IFRS Foundation: IAS 2 Inventories", "IFRS Foundation", "ifrs-foundation", "primary", "IAS 2 measures inventories at lower of cost and net realisable value; NRV deducts completion and sale costs from estimated selling price."],
    ["https://www.accaglobal.com/gb/en/technical-activities/technical-resources-search/2019/january/costing-property-development-inventories.html", "ACCA: Costing property development inventories under IAS 2", "Association of Chartered Certified Accountants", "acca", "authoritative-secondary", "The ACCA IAS 2 explanation confirms lower-of-cost-and-NRV measurement and selling price less completion and sale costs."]
  ],
  urduRhetoric: [
    ["https://www.rekhtadictionary.com/meaning-of-majaaz-e-mursal?lang=ur", "Rekhta Dictionary: مجازِ مرسل", "Rekhta Dictionary", "rekhta-dictionary", "primary", "Defines مجازِ مرسل as figurative usage linked by something other than resemblance, with cloud for rain as an example."],
    ["https://dde.manuu.edu.in/sites/default/files/DDE/DDE-SelfLearnmaterial/ma-urdu-2nd-sem-1st-draft/11-Jul-2023/Paper-6-Urdu-Ghazal.pdf", "Maulana Azad National Urdu University, MA Urdu self-learning material: مجازِ مرسل", "Maulana Azad National Urdu University", "manuu", "primary", "The university's MA Urdu material, section 2.3.2.3, defines مجازِ مرسل by a figurative connection other than resemblance and explains its types."]
  ]
};

function references(key) {
  return evidence[key].map(([url, label, publisher, authorityId, sourceClass, claimSummary], index) => ({
    url, label, publisher, authorityId,
    role: index === 0 ? "answer-primary" : "answer-secondary",
    sourceClass,
    accessedOn,
    supports: ["answer"],
    claimSummary
  }));
}

function scope(type, fields = {}) {
  return {
    type,
    sourcePaperDate: null,
    asOf: null,
    eventDate: null,
    version: null,
    reverifyAfter: null,
    ...fields
  };
}

const pairs = [
  {
    categoryId: "pakistan-studies", topic: "constitution-articles",
    source: {
      question: "Which article on free and compulsory education was inserted into Pakistan's Constitution by the Eighteenth Amendment in 2010?",
      questionUrdu: "2010 کی اٹھارویں آئینی ترمیم کے ذریعے پاکستان کے آئین میں مفت اور لازمی تعلیم کا کون سا آرٹیکل شامل کیا گیا؟",
      options: ["Article 19A", "Article 25A", "Article 28", "Article 37"], correctOptionIndex: 1,
      explanationUrdu: "اٹھارویں آئینی ترمیم 2010 کی دفعہ 9 نے آئین میں آرٹیکل 25A شامل کیا۔ یہ بچوں کی مفت اور لازمی تعلیم کا حق بیان کرتا ہے؛ آرٹیکل 19A معلومات تک رسائی سے متعلق ہے۔",
      referenceKey: "education", temporalScope: scope("event-date", { eventDate: "2010-04-20" })
    },
    similar: {
      question: "Under Article 25A as inserted in 2010, which age group must receive free and compulsory education in Pakistan?",
      questionUrdu: "2010 میں شامل کیے گئے آرٹیکل 25A کے تحت پاکستان میں کس عمر کے بچوں کو مفت اور لازمی تعلیم فراہم کرنا ریاست کی ذمہ داری ہے؟",
      options: ["3 to 12 years", "5 to 16 years", "6 to 14 years", "8 to 18 years"], correctOptionIndex: 1,
      explanationUrdu: "آرٹیکل 25A ریاست کو پانچ سے سولہ سال کی عمر کے تمام بچوں کے لیے مفت اور لازمی تعلیم فراہم کرنے کا پابند کرتا ہے۔ یہ عمر کی حد ترمیم کے متن میں واضح ہے۔",
      referenceKey: "education", temporalScope: scope("event-date", { eventDate: "2010-04-20" })
    }
  },
  {
    categoryId: "general-knowledge", topic: "united-nations",
    source: {
      question: "In which year did UNESCO adopt the World Heritage Convention protecting cultural and natural heritage?",
      questionUrdu: "یونیسکو نے ثقافتی اور قدرتی ورثے کے تحفظ کا عالمی ورثہ کنونشن کس سال منظور کیا؟",
      options: ["1965", "1972", "1975", "1984"], correctOptionIndex: 1,
      explanationUrdu: "یونیسکو کی جنرل کانفرنس نے عالمی ثقافتی اور قدرتی ورثے کے تحفظ کا کنونشن 16 نومبر 1972 کو منظور کیا۔ منظور ہونے اور نافذ ہونے کی تاریخیں الگ ہیں۔",
      referenceKey: "heritage", temporalScope: scope("static")
    },
    similar: {
      question: "In which year did the 1972 UNESCO World Heritage Convention enter into force?",
      questionUrdu: "1972 کا یونیسکو عالمی ورثہ کنونشن کس سال نافذ ہوا؟",
      options: ["1972", "1975", "1978", "1984"], correctOptionIndex: 1,
      explanationUrdu: "یہ کنونشن 16 نومبر 1972 کو منظور ہوا لیکن ضروری توثیق کے بعد 17 دسمبر 1975 کو نافذ ہوا۔ امتحان میں منظوری اور نفاذ کے سال میں فرق یاد رکھیں۔",
      referenceKey: "heritage", temporalScope: scope("static")
    }
  },
  {
    categoryId: "english", topic: "synonyms",
    source: {
      question: "In the sense of a hopeful outlook, which word is the closest synonym of 'sanguine'?",
      questionUrdu: "امید بھرا نقطۂ نظر بیان کرتے وقت 'sanguine' کا قریب ترین مترادف کون سا ہے؟",
      options: ["Pessimistic", "Optimistic", "Indifferent", "Suspicious"], correctOptionIndex: 1,
      explanationUrdu: "اس سیاق میں sanguine کا مطلب پُرامید یا optimistic ہے۔ لفظ کے دوسرے معنی سرخی سے متعلق بھی ہو سکتے ہیں، اس لیے سوال میں hopeful outlook کی وضاحت دی گئی ہے۔",
      referenceKey: "sanguine", temporalScope: scope("static")
    },
    similar: {
      question: "Which word is the closest synonym of 'laconic' when it describes a person's speech?",
      questionUrdu: "جب 'laconic' کسی شخص کے بولنے کے انداز کو بیان کرے تو اس کا قریب ترین مترادف کون سا لفظ ہے؟",
      options: ["Wordy", "Verbose", "Terse", "Rambling"], correctOptionIndex: 2,
      explanationUrdu: "Laconic ایسے انداز کو کہتے ہیں جس میں بہت کم الفاظ استعمال ہوں۔ Terse اسی معنی میں اس کا قریب ترین مترادف ہے؛ باقی الفاظ زیادہ بولنے یا غیر ضروری طوالت کو ظاہر کرتے ہیں۔",
      referenceKey: "laconic", temporalScope: scope("static")
    }
  },
  {
    categoryId: "geography", topic: "climate-earth",
    source: {
      question: "The International Date Line roughly follows which meridian of longitude?",
      questionUrdu: "بین الاقوامی خطِ تاریخ تقریباً کس طول البلد کے خط کے ساتھ چلتا ہے؟",
      options: ["0 degrees", "90 degrees east", "180 degrees", "23.5 degrees south"], correctOptionIndex: 2,
      explanationUrdu: "بین الاقوامی خطِ تاریخ عموماً 180 درجے طول البلد کے قریب بحرالکاہل سے گزرتا ہے، مگر سیاسی سرحدوں اور جزیروں کے گرد مڑتا ہے؛ یہ پوری طرح سیدھی لکیر نہیں۔",
      referenceKey: "dateline", temporalScope: scope("static")
    },
    similar: {
      question: "If a traveller crosses the International Date Line westward, what happens to the calendar date?",
      questionUrdu: "اگر کوئی مسافر بین الاقوامی خطِ تاریخ کو مغرب کی طرف عبور کرے تو کیلنڈر کی تاریخ میں کیا تبدیلی آتی ہے؟",
      options: ["It moves back one day", "It moves forward one day", "It stays unchanged", "It moves forward one month"], correctOptionIndex: 1,
      explanationUrdu: "خطِ تاریخ کو مغرب کی طرف عبور کرنے پر کیلنڈر میں ایک دن بڑھ جاتا ہے؛ مشرق کی طرف عبور کرنے پر ایک دن کم ہوتا ہے۔",
      referenceKey: "dateline", temporalScope: scope("static")
    }
  },
  {
    categoryId: "basic-mathematics", topic: "sets-logic",
    source: {
      question: "In a class, 22 students study science, 18 study mathematics and 7 study both. How many study at least one of the two subjects?",
      questionUrdu: "ایک جماعت میں 22 طلبہ سائنس، 18 ریاضی اور 7 دونوں مضامین پڑھتے ہیں۔ کم از کم ایک مضمون پڑھنے والے طلبہ کتنے ہیں؟",
      options: ["29", "33", "40", "47"], correctOptionIndex: 1,
      explanationUrdu: "دونوں مضامین پڑھنے والے 7 طلبہ دو بار گنے گئے ہیں، اس لیے ایک بار منہا کریں: 22 + 18 - 7 = 33۔ یہی دو مجموعوں کے اتحاد کا اصول ہے۔",
      referenceKey: "sets", temporalScope: scope("static")
    },
    similar: {
      question: "Of 50 candidates, 30 know English, 25 know Urdu and 10 know neither language. How many know both languages?",
      questionUrdu: "50 امیدواروں میں سے 30 انگریزی، 25 اردو جانتے ہیں اور 10 دونوں میں سے کوئی زبان نہیں جانتے۔ دونوں زبانیں جاننے والے کتنے ہیں؟",
      options: ["5", "10", "15", "25"], correctOptionIndex: 2,
      explanationUrdu: "کم از کم ایک زبان جاننے والے 50 - 10 = 40 ہیں۔ مشترک حصہ = 30 + 25 - 40 = 15۔ پہلے مکمل جماعت میں سے 'کوئی نہیں' والے نکالیں۔",
      referenceKey: "sets", temporalScope: scope("static")
    }
  },
  {
    categoryId: "basic-computer-studies", topic: "internet-web",
    source: {
      question: "What is the main accessibility purpose of adding alt text to an informative image in a document?",
      questionUrdu: "کسی دستاویز کی معلوماتی تصویر میں متبادل متن شامل کرنے کا بنیادی مقصد کیا ہے؟",
      options: ["To compress the image file", "To help screen-reader users understand the image", "To change the image colours", "To prevent copying"], correctOptionIndex: 1,
      explanationUrdu: "متبادل متن تصویر کا ضروری مفہوم بیان کرتا ہے تاکہ اسکرین ریڈر استعمال کرنے والا شخص اس کی معلومات سمجھ سکے۔ یہ تصویر کو کمپریس یا کاپی سے محفوظ نہیں کرتا۔",
      referenceKey: "altText", temporalScope: scope("static")
    },
    similar: {
      question: "For a purely decorative image that conveys no information, what is the recommended accessibility treatment?",
      questionUrdu: "ایسی خالص آرائشی تصویر جو کوئی معلومات نہیں دیتی، اس کے لیے رسائی کے لحاظ سے کیا طریقہ بہتر ہے؟",
      options: ["Write a long description of its colours", "Mark it as decorative or use empty alt text", "Remove all document text", "Turn it into a password-protected image"], correctOptionIndex: 1,
      explanationUrdu: "اگر تصویر صرف آرائش کے لیے ہو تو اسے decorative نشان زد کیا جاتا ہے یا ویب میں خالی alt متن دیا جاتا ہے۔ اس طرح اسکرین ریڈر غیرضروری وضاحت نہیں پڑھتا۔",
      referenceKey: "altText", temporalScope: scope("static")
    }
  },
  {
    categoryId: "everyday-science", topic: "earth-atmosphere",
    source: {
      question: "When seawater absorbs additional atmospheric carbon dioxide, what generally happens to its pH?",
      questionUrdu: "جب سمندری پانی فضا سے مزید کاربن ڈائی آکسائیڈ جذب کرتا ہے تو عموماً اس کے پی ایچ میں کیا تبدیلی آتی ہے؟",
      options: ["It decreases", "It increases", "It remains exactly the same", "It becomes zero"], correctOptionIndex: 0,
      explanationUrdu: "کاربن ڈائی آکسائیڈ پانی میں شامل ہو کر تیزابی عمل بڑھاتی ہے، لہٰذا سمندری پانی کا پی ایچ کم ہوتا ہے۔ کم پی ایچ کا مطلب یہ نہیں کہ سمندر لازماً پی ایچ 7 سے نیچے آ جاتا ہے۔",
      referenceKey: "acidification", temporalScope: scope("static")
    },
    similar: {
      question: "Which seawater ions become less available to shell-building organisms as ocean acidification increases?",
      questionUrdu: "سمندری تیزابیت بڑھنے پر خول بنانے والے جانداروں کے لیے کون سے آئن کم دستیاب ہوتے ہیں؟",
      options: ["Carbonate ions", "Sodium ions", "Chloride ions", "Potassium ions"], correctOptionIndex: 0,
      explanationUrdu: "تیزابیت بڑھنے پر کاربونیٹ آئن کم دستیاب ہوتے ہیں، جبکہ سیپیوں اور مرجان کے خول اور ڈھانچے بنانے کے لیے کیلشیم کاربونیٹ ضروری ہے۔",
      referenceKey: "acidification", temporalScope: scope("static")
    }
  },
  {
    categoryId: "islamic-studies", topic: "zakat-charity",
    source: {
      question: "In Quran 9:60, which group is represented by 'al-gharimin' among Zakat recipients?",
      questionUrdu: "قرآن کی سورۂ توبہ 9:60 میں زکوٰۃ کے مستحقین میں 'الغارمین' کس گروہ کو کہا گیا ہے؟",
      options: ["Those in debt", "Zakat collectors", "Needy travellers", "The poor"], correctOptionIndex: 0,
      explanationUrdu: "سورۂ توبہ کی آیت 9:60 میں الغارمین سے مراد قرض کے بوجھ تلے دبے ہوئے لوگ ہیں۔ یہ زکوٰۃ کے مستحقین کی ایک مستقل قسم ہے۔",
      referenceKey: "zakatRecipients", temporalScope: scope("static")
    },
    similar: {
      question: "In Quran 9:60, which Zakat-recipient group is expressed by 'ibn al-sabil'?",
      questionUrdu: "قرآن کی سورۂ توبہ 9:60 میں زکوٰۃ کے مستحقین کے لیے 'ابن السبیل' سے کون مراد ہے؟",
      options: ["Zakat administrators", "Needy or stranded travellers", "Owners of livestock", "Only orphans"], correctOptionIndex: 1,
      explanationUrdu: "ابن السبیل کا مطلب راستے میں محتاج یا وسائل سے محروم مسافر ہے۔ سورۂ توبہ 9:60 میں اسے زکوٰۃ کے مستحق گروہوں میں شمار کیا گیا ہے۔",
      referenceKey: "zakatRecipients", temporalScope: scope("static")
    }
  },
  {
    categoryId: "job-related-finance-taxation", topic: "accounting",
    source: {
      question: "As of 2026, under IAS 2 Inventories, at which amount are inventories normally measured?",
      questionUrdu: "2026 تک بین الاقوامی حسابداری معیار آئی اے ایس 2 کے تحت عموماً انوینٹری کس رقم پر ناپی جاتی ہے؟",
      options: ["The higher of cost and net realisable value", "The lower of cost and net realisable value", "Historical cost plus expected profit", "Estimated selling price without deductions"], correctOptionIndex: 1,
      explanationUrdu: "آئی اے ایس 2 کے تحت انوینٹری کو لاگت اور خالص قابلِ وصول قدر میں سے کم رقم پر ظاہر کیا جاتا ہے۔ اس سے متوقع فروخت کی رقم سے زیادہ اثاثہ دکھانے سے بچا جاتا ہے۔",
      referenceKey: "inventory", temporalScope: scope("as-of", { asOf: accessedOn, reverifyAfter: "2027-04-30" })
    },
    similar: {
      question: "As of 2026, under IAS 2, how is an inventory item's net realisable value calculated?",
      questionUrdu: "2026 تک آئی اے ایس 2 کے تحت انوینٹری کی خالص قابلِ وصول قدر کیسے نکالی جاتی ہے؟",
      options: ["Cost plus expected profit", "Estimated selling price less completion and selling costs", "Selling price plus selling costs", "Purchase price less tax only"], correctOptionIndex: 1,
      explanationUrdu: "خالص قابلِ وصول قدر، معمول کی تجارت میں متوقع فروخت قیمت میں سے تکمیل کے اخراجات اور فروخت کے لیے ضروری اخراجات منہا کرنے سے حاصل ہوتی ہے۔",
      referenceKey: "inventory", temporalScope: scope("as-of", { asOf: accessedOn, reverifyAfter: "2027-04-30" })
    }
  },
  {
    categoryId: "urdu", topic: "urdu-rhetoric",
    source: {
      question: "In Urdu rhetoric, which figure of speech uses 'بادل برس رہا ہے' to mean that rain is falling?",
      questionUrdu: "علمِ بیان میں 'بادل برس رہا ہے' سے بارش مراد لی جائے تو یہ کس صنعت کی مثال ہے؟",
      options: ["استعارہ", "مجازِ مرسل", "تشبیہ", "کنایہ"], correctOptionIndex: 1,
      explanationUrdu: "اس مثال میں بادل سبب اور بارش نتیجہ ہے۔ بادل کہہ کر بارش مراد لینا سبب اور مسبب کا تعلق ہے، تشبیہ کا نہیں؛ اس لیے یہ مجازِ مرسل ہے۔",
      referenceKey: "urduRhetoric", temporalScope: scope("static")
    },
    similar: {
      question: "In Urdu rhetoric, what relationship between literal and figurative meanings defines مجازِ مرسل?",
      questionUrdu: "مجازِ مرسل میں لفظ کے حقیقی اور مجازی معنوں کے درمیان کون سا تعلق ہوتا ہے؟",
      options: ["ہم آواز الفاظ کا تعلق", "واضح تشبیہ کا تعلق", "صرف ردیف کا تعلق", "تشبیہ کے علاوہ کوئی معنوی تعلق"], correctOptionIndex: 3,
      explanationUrdu: "مجازِ مرسل میں لفظ اپنے حقیقی معنی کے بجائے مجازی معنی میں استعمال ہوتا ہے، مگر دونوں معنوں کا رشتہ تشبیہ نہیں ہوتا۔ یہ سبب و نتیجہ، کل و جزو یا ظرف و مظروف کا رشتہ ہو سکتا ہے۔",
      referenceKey: "urduRhetoric", temporalScope: scope("static")
    }
  }
];

module.exports = pairs.flatMap(({ categoryId, topic, source, similar }, index) => {
  const pairId = `USR-Q${String(31 + index).padStart(4, "0")}`;
  return [source, similar].map((item, itemIndex) => {
    const kind = itemIndex === 0 ? "source" : "similar";
    const itemReferences = references(item.referenceKey);
    return {
      id: `${pairId}-${kind === "source" ? "SRC" : "SIM"}`,
      pairId,
      kind,
      categoryId,
      question: item.question,
      questionUrdu: item.questionUrdu,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      explanationUrdu: item.explanationUrdu,
      source: {
        type: kind === "source" ? "user" : "practice",
        file: "topic-expansion-20261030.js",
        label: "User-requested verified topic coverage, 30 October 2026",
        referenceUrl: itemReferences[0].url,
        accessedOn
      },
      tags: ["topic-expansion-20261030", `topic:${topic}`],
      verificationStatus: "verified",
      sourceNotes: "Research-based topic coverage; distinct from its paired item. No past-paper repeat claim.",
      references: itemReferences,
      temporalScope: item.temporalScope
    };
  });
});
