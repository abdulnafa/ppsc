(function () {
  "use strict";

  var categories = [
  {
    "id": "general-knowledge",
    "name": "General Knowledge",
    "shortLabel": "GK",
    "description": "World facts, organizations, personalities and important events."
  },
  {
    "id": "pakistan-studies",
    "name": "Pakistan Studies",
    "shortLabel": "PK",
    "description": "History, constitution, culture and geography of Pakistan."
  },
  {
    "id": "current-affairs",
    "name": "Current Affairs",
    "shortLabel": "CA",
    "description": "Date-aware national and international developments."
  },
  {
    "id": "islamic-studies",
    "name": "Islamic Studies",
    "shortLabel": "IS",
    "description": "Core Islamic history, beliefs and general knowledge."
  },
  {
    "id": "geography",
    "name": "Geography",
    "shortLabel": "GEO",
    "description": "Countries, physical features, maps and world geography."
  },
  {
    "id": "basic-mathematics",
    "name": "Basic Mathematics",
    "shortLabel": "MATH",
    "description": "Arithmetic, percentages, ratios and everyday calculations."
  },
  {
    "id": "english",
    "name": "English",
    "shortLabel": "ENG",
    "description": "Grammar, vocabulary, sentence correction and comprehension."
  },
  {
    "id": "urdu",
    "name": "Urdu",
    "shortLabel": "UR",
    "description": "Urdu grammar, vocabulary, literature and comprehension."
  },
  {
    "id": "everyday-science",
    "name": "Every-day Science",
    "shortLabel": "SCI",
    "description": "Daily-life concepts from biology, chemistry and physics."
  },
  {
    "id": "basic-computer-studies",
    "name": "Basic Computer Studies",
    "shortLabel": "IT",
    "description": "Computer fundamentals, internet and Microsoft Office basics."
  },
  {
    "id": "job-related-finance-taxation",
    "name": "Finance, Taxation & Job-related",
    "shortLabel": "JOB",
    "description": "Extra questions found in the supplied papers; outside the advertised ten-subject syllabus."
  }
];

  var questions = [
  {
    "id": "P234-Q001-SRC",
    "pairId": "P234-Q001",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which is the smallest Muslim-majority country in the world by land area?",
    "options": [
      "Brunei",
      "Bahrain",
      "Maldives",
      "Qatar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مالدیپ کا خشکی کا رقبہ تقریباً 298 مربع کلومیٹر ہے، اس لیے دیے گئے مسلم اکثریتی ممالک میں یہ سب سے چھوٹا ہے۔ سوال میں کل سمندری حدود نہیں بلکہ زمینی رقبہ مراد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q1, PDF p.1",
      "referenceUrl": "https://sa.mdvmission.gov.mv/images/Visit-Maldives/destination-guide-2023-english.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "countries",
      "land-area",
      "maldives"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source wording says 'Muslim country'; the website clarifies that the comparison is by land area."
  },
  {
    "id": "P234-Q001-SIM",
    "pairId": "P234-Q001",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which is the smallest sovereign state in the world by territory?",
    "options": [
      "Monaco",
      "Nauru",
      "San Marino",
      "Vatican City"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ویٹیکن سٹی صرف تقریباً 0.44 مربع کلومیٹر پر مشتمل ہے، اس لیے یہ رقبے کے لحاظ سے دنیا کی سب سے چھوٹی خود مختار ریاست ہے۔ مالدیپ ایشیا اور مسلم اکثریتی ممالک میں سب سے چھوٹا ہے، مگر پوری دنیا میں ویٹیکن سٹی سب سے چھوٹا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.vaticanstate.va/en/state-and-government/history/vatican-city-today.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "countries",
      "territory",
      "vatican-city"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q002-SRC",
    "pairId": "P234-Q002",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was the first Law Minister of Pakistan?",
    "options": [
      "Liaquat Ali Khan",
      "Khawaja Nazimuddin",
      "Jogendra Nath Mandal",
      "Fazlur Rahman"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "جوگندر ناتھ منڈل قیامِ پاکستان کے بعد پہلی وفاقی کابینہ میں قانون اور محنت کے وزیر تھے۔ اسی بنا پر انہیں پاکستان کا پہلا وزیرِ قانون کہا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q2, PDF p.1",
      "referenceUrl": "https://na.gov.pk/uploads/documents/1438774406_350.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "first-cabinet",
      "law-minister",
      "jogendra-nath-mandal"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q002-SIM",
    "pairId": "P234-Q002",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Who served as Pakistan's first Foreign Minister?",
    "options": [
      "Muhammad Ali Bogra",
      "Sir Muhammad Zafarullah Khan",
      "Chaudhry Muhammad Ali",
      "Ghulam Muhammad"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سر محمد ظفر اللہ خان پاکستان کے پہلے وزیرِ خارجہ تھے اور ابتدائی برسوں میں ملک کی خارجہ پالیسی کی نمائندگی کرتے رہے۔ انہیں اقوامِ متحدہ اور دوسرے بین الاقوامی فورمز پر پاکستان کی ابتدائی سفارت کاری میں نمایاں مقام حاصل ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://mofa.gov.pk/profiles/sir-mohammad-zafarullah-khan",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "first-cabinet",
      "foreign-minister",
      "zafarullah-khan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q003-SRC",
    "pairId": "P234-Q003",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "How many Sustainable Development Goals are included in the UN 2030 Agenda?",
    "options": [
      "15",
      "17",
      "18",
      "20"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اقوامِ متحدہ کے 2030 ایجنڈا میں 17 پائیدار ترقیاتی اہداف شامل ہیں۔ یہ اہداف 2015 میں اپنائے گئے اور غربت، صحت، تعلیم، ماحول اور امن جیسے موضوعات کا احاطہ کرتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q3, PDF p.1",
      "referenceUrl": "https://sdgs.un.org/goals",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-nations",
      "sdgs",
      "2030-agenda"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q003-SIM",
    "pairId": "P234-Q003",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "How many targets are associated with the 17 Sustainable Development Goals?",
    "options": [
      "150",
      "169",
      "160",
      "175"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سترہ پائیدار ترقیاتی اہداف کے ساتھ مجموعی طور پر 169 اہداف منسلک ہیں۔ امتحان میں 17 Goals اور 169 Targets کی جوڑی اکثر پوچھی جاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://sdgs.un.org/2030agenda",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-nations",
      "sdg-targets",
      "169"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q004-SRC",
    "pairId": "P234-Q004",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which Mughal emperor rebuilt Lahore Fort in the form that established its major Mughal character?",
    "options": [
      "Babur",
      "Akbar",
      "Jahangir",
      "Shah Jahan"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "لاہور قلعہ کا مقام بہت قدیم ہے، لیکن موجودہ مغلیہ قلعے کی بنیادی تعمیر اور بڑی توسیع شہنشاہ اکبر کے دور میں ہوئی۔ بعد میں جہانگیر اور شاہجہان نے بھی اس میں اہم عمارتیں اور آرائش شامل کی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q4, PDF p.1",
      "referenceUrl": "https://whc.unesco.org/en/list/171/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "lahore-fort",
      "mughal",
      "akbar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The original asks who 'built' Lahore Fort; the wording is clarified because the site predates Akbar and was rebuilt repeatedly."
  },
  {
    "id": "P234-Q004-SIM",
    "pairId": "P234-Q004",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which year were Lahore Fort and the Shalamar Gardens inscribed together on the UNESCO World Heritage List?",
    "options": [
      "1975",
      "1990",
      "1984",
      "1981"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "لاہور قلعہ اور شالامار باغ کو 1981 میں ایک مشترک عالمی ثقافتی ورثہ کے طور پر یونیسکو فہرست میں شامل کیا گیا۔ دونوں مقامات مغلیہ فنِ تعمیر اور باغ سازی کی نمایاں مثالیں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://whc.unesco.org/en/list/171",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "unesco",
      "lahore-fort",
      "shalamar-gardens"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q005-SRC",
    "pairId": "P234-Q005",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which listed men's player has won the most Grand Slam singles titles?",
    "options": [
      "Roger Federer",
      "Novak Djokovic",
      "Rafael Nadal",
      "Pete Sampras"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "نوواک جوکووچ نے مردوں کے سنگلز میں ریکارڈ 24 گرینڈ سلیم ٹائٹل جیتے ہیں۔ دیے گئے دوسرے کھلاڑیوں میں رافیل نڈال کے 22، راجر فیڈرر کے 20 اور پیٹ سمپراس کے 14 ٹائٹل ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q5, PDF p.1",
      "referenceUrl": "https://www.atptour.com/en/news/grand-slams-tournaments-records-stats",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tennis",
      "grand-slam",
      "novak-djokovic"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source options are all men, so the website makes the men's-singles scope explicit. Verified as of 2026-08-22."
  },
  {
    "id": "P234-Q005-SIM",
    "pairId": "P234-Q005",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which of the four Grand Slam tennis tournaments is played on clay courts?",
    "options": [
      "Roland Garros",
      "Australian Open",
      "Wimbledon",
      "US Open"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "رولینڈ گیروس، جسے فرنچ اوپن بھی کہا جاتا ہے، مٹی کے کورٹ پر کھیلا جاتا ہے۔ آسٹریلین اوپن اور یو ایس اوپن ہارڈ کورٹ جبکہ ومبلڈن گھاس کے کورٹ پر ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.atptour.com/en/news/grand-slams-tournaments-records-stats",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tennis",
      "grand-slam",
      "roland-garros"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q006-SRC",
    "pairId": "P234-Q006",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which of the following is a non-renewable energy source?",
    "options": [
      "Wind energy",
      "Solar energy",
      "Fossil fuels",
      "Hydropower"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "فوسل فیولز یعنی کوئلہ، تیل اور قدرتی گیس بننے میں لاکھوں سال لیتے ہیں، اس لیے انسانی مدت میں دوبارہ پیدا نہیں ہوتے۔ ہوا، سورج اور بہتا پانی قدرتی طور پر تجدید ہونے والے ذرائع ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q6, PDF p.1",
      "referenceUrl": "https://www.eia.gov/energyexplained/what-is-energy/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "energy",
      "non-renewable",
      "fossil-fuels"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q006-SIM",
    "pairId": "P234-Q006",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which of the following is a renewable energy source?",
    "options": [
      "Wind",
      "Petroleum",
      "Natural gas",
      "Coal"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ہوا مسلسل قدرتی عمل سے دستیاب رہتی ہے، اس لیے ونڈ انرجی قابلِ تجدید ذریعہ ہے۔ کوئلہ، پٹرولیم اور قدرتی گیس فوسل فیولز ہیں اور محدود ذخائر رکھتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.eia.gov/energyexplained/wind/wind-energy-and-the-environment.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "energy",
      "renewable",
      "wind"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q007-SRC",
    "pairId": "P234-Q007",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Solar cells are mainly made from which semiconductor material?",
    "options": [
      "Copper",
      "Aluminium",
      "Silicon",
      "Iron"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سلیکون شمسی خلیوں میں سب سے زیادہ استعمال ہونے والا نیم موصل مادہ ہے۔ روشنی اس میں الیکٹرانوں کو توانائی دیتی ہے، جس سے برقی رو پیدا کی جا سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q7, PDF p.1",
      "referenceUrl": "https://www.energy.gov/cmei/systems/solar-photovoltaic-cell-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "solar-cell",
      "semiconductor",
      "silicon"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q007-SIM",
    "pairId": "P234-Q007",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which material is also the most common semiconductor used in computer chips?",
    "options": [
      "Silver",
      "Silicon",
      "Graphite",
      "Tin"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سلیکون شمسی خلیوں کے ساتھ کمپیوٹر چپس میں بھی سب سے عام نیم موصل ہے۔ اس کی برقی خصوصیات کو ڈوپنگ کے ذریعے قابو کیا جا سکتا ہے، اسی لیے الیکٹرانکس میں اس کا استعمال وسیع ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.energy.gov/cmei/systems/solar-photovoltaic-cell-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "computer-chips",
      "semiconductor",
      "silicon"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q008-SRC",
    "pairId": "P234-Q008",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best antonym of 'profane'.",
    "options": [
      "Irreligious",
      "Disrespectful",
      "Respectful",
      "Vulgar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Profane کا مطلب مقدس چیزوں کا احترام نہ کرنے والا یا غیر مقدس ہے۔ دیے گئے اختیارات میں Respectful اس کے برعکس مفہوم کے سب سے قریب ہے، جبکہ باقی الفاظ بے ادبی یا غیر مذہبی معنی رکھتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q8, PDF p.1",
      "referenceUrl": "https://www.merriam-webster.com/thesaurus/profane",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "vocabulary",
      "profane"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q008-SIM",
    "pairId": "P234-Q008",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the antonym of 'reverent'.",
    "options": [
      "Devout",
      "Respectful",
      "Admiring",
      "Irreverent"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Reverent کا مطلب بہت احترام ظاہر کرنے والا ہے، جبکہ Irreverent کا مطلب مطلوبہ احترام نہ دکھانا ہے۔ اس لیے دونوں ایک دوسرے کے متضاد ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/reverent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "vocabulary",
      "reverent"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q009-SRC",
    "pairId": "P234-Q009",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the synonym of 'jealous'.",
    "options": [
      "Kind",
      "Generous",
      "Honest",
      "Envious"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Jealous بعض سیاق میں Envious کے ہم معنی ہوتا ہے، یعنی دوسرے کی چیز یا کامیابی کی خواہش یا حسد محسوس کرنا۔ دیے گئے باقی الفاظ مثبت اوصاف ہیں اور اس معنی سے مطابقت نہیں رکھتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q9, PDF p.1",
      "referenceUrl": "https://dictionary.cambridge.org/us/dictionary/english/envious",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "vocabulary",
      "jealous"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q009-SIM",
    "pairId": "P234-Q009",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the synonym of 'diligent'.",
    "options": [
      "Careless",
      "Idle",
      "Industrious",
      "Hasty"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Diligent اور Industrious دونوں محنتی، باقاعدہ اور کام پر توجہ دینے والے شخص کے لیے آتے ہیں۔ Careless اور Idle اس کے الٹ مفہوم رکھتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/us/thesaurus/diligent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "vocabulary",
      "diligent"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q010-SRC",
    "pairId": "P234-Q010",
    "kind": "source",
    "categoryId": "english",
    "question": "Fill in the blank: Each of the boys ___ rewarded.",
    "options": [
      "were",
      "are",
      "was",
      "have"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Each ایک واحد distributive pronoun ہے، اس لیے اس کے ساتھ واحد فعل آتا ہے۔ ماضی کے passive جملے میں درست ساخت 'Each of the boys was rewarded' ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q10, PDF p.1",
      "referenceUrl": "https://owl.purdue.edu/owl/multilingual/multilingual_students/tips_for_writing_in_north_american_colleges/documents/20150331121830_self_editing_workshop.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "subject-verb-agreement",
      "each",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q010-SIM",
    "pairId": "P234-Q010",
    "kind": "similar",
    "categoryId": "english",
    "question": "Fill in the blank: Neither of the two candidates ___ absent.",
    "options": [
      "were",
      "was",
      "have",
      "are"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Neither جب دو افراد میں سے ایک بھی نہ ہونے کا مفہوم دے تو اسے واحد مانا جاتا ہے۔ اس لیے ماضی میں واحد فعل was درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://owl.purdue.edu/owl/multilingual/multilingual_students/tips_for_writing_in_north_american_colleges/documents/20150331121830_self_editing_workshop.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "subject-verb-agreement",
      "neither",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q011-SRC",
    "pairId": "P234-Q011",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the correct passive form of the imperative idea 'Let me do this.'",
    "options": [
      "This is done by me.",
      "Let this be done by me.",
      "Let me be done this.",
      "This should be done."
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اس ساخت میں کام کی چیز 'this' کو passive کا مرکز بنا کر 'Let + object + be + past participle' استعمال ہوتا ہے۔ اس لیے 'Let this be done by me' دیے گئے اختیارات میں درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q11, PDF p.1",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/passive-forms",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "passive-voice",
      "imperative",
      "grammar"
    ],
    "verificationStatus": "reconstructed",
    "sourceNotes": "The scan prints 'Select the best Passive voice option of given sentence' but omits the active sentence. The active idea is reconstructed from the keyed option and disclosed here."
  },
  {
    "id": "P234-Q011-SIM",
    "pairId": "P234-Q011",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the passive form of the command 'Close the door.'",
    "options": [
      "Let the door be closed.",
      "Let the door closed.",
      "The door let be closed.",
      "Let close the door."
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Imperative command کو passive بناتے وقت عمومی امتحانی ساخت 'Let + object + be + past participle' ہے۔ Close کی past participle closed ہے، اس لیے 'Let the door be closed' درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/passive-forms",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "passive-voice",
      "imperative",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q012-SRC",
    "pairId": "P234-Q012",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What did '.com' originally denote in the Internet domain-name system?",
    "options": [
      "Communication",
      "Commercial",
      "Community",
      "Computer"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ابتدائی انٹرنیٹ ڈومین نظام میں COM کو commercial یعنی تجارتی اداروں کے لیے متعین کیا گیا تھا۔ آج .com کی رجسٹریشن عمومی ہے، لیکن امتحانی سوال اس کے اصل زمرے کے بارے میں ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q12, PDF p.1",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc920.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "domain-name",
      "com",
      "internet"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q012-SIM",
    "pairId": "P234-Q012",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What did '.org' originally denote in the Internet domain-name system?",
    "options": [
      "Origin",
      "Oracle",
      "Organization",
      "Operational research group"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "RFC 920 میں ORG کو organization کے لیے رکھا گیا تھا، خصوصاً ایسے اداروں کے لیے جو دوسرے عمومی زمروں میں نہ آتے ہوں۔ اسی دستاویز میں COM، EDU، GOV اور MIL کے ابتدائی معنی بھی دیے گئے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc920.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "domain-name",
      "org",
      "internet"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q013-SRC",
    "pairId": "P234-Q013",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "What does NCOC stand for in Pakistan's COVID-19 response?",
    "options": [
      "National Command and Operation Centre",
      "National Council of Operations Committee",
      "National Command Office Council",
      "National Control and Operations Cell"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "NCOC کا مکمل نام National Command and Operation Centre ہے۔ اسے پاکستان میں کووڈ-19 کے خلاف وفاقی اور صوبائی اقدامات کو مربوط کرنے کے مرکزی فورم کے طور پر استعمال کیا گیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q13, PDF p.1",
      "referenceUrl": "https://pid.gov.pk/site/press_detail/13402",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "ncoc",
      "covid-19"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The book spells the last word 'Center'; official Pakistani usage is 'Centre'."
  },
  {
    "id": "P234-Q013-SIM",
    "pairId": "P234-Q013",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "What does NDMA stand for in Pakistan?",
    "options": [
      "National Disaster Management Authority",
      "National Development Monitoring Agency",
      "National Defence Management Authority",
      "Natural Disaster Mitigation Association"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "NDMA کا مکمل نام National Disaster Management Authority ہے۔ یہ قومی سطح پر آفات سے نمٹنے، تیاری، رابطہ کاری اور خطرات میں کمی کے انتظام سے متعلق ادارہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://ndma.gov.pk/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "ndma",
      "disaster-management"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q014-SRC",
    "pairId": "P234-Q014",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the default file extension for a modern Microsoft Word document?",
    "options": [
      ".xls",
      ".docx",
      ".ppt",
      ".txt"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": ".docx جدید Microsoft Word دستاویز کا بنیادی Open XML فارمیٹ ہے۔ .xls پرانا Excel فارمیٹ، .ppt پرانا PowerPoint فارمیٹ اور .txt سادہ متن کے لیے ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q14, PDF p.1",
      "referenceUrl": "https://support.microsoft.com/en-us/word/file-formats-for-saving-documents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "file-extension",
      "docx"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q014-SIM",
    "pairId": "P234-Q014",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What is the default file extension for a modern Microsoft Excel workbook?",
    "options": [
      ".accdb",
      ".docx",
      ".pptx",
      ".xlsx"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": ".xlsx جدید Microsoft Excel workbook کا عام Open XML فارمیٹ ہے۔ .docx Word اور .pptx PowerPoint کے لیے استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://support.microsoft.com/en-us/excel/file-formats-that-are-supported-in-excel",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-excel",
      "file-extension",
      "xlsx"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q015-SRC",
    "pairId": "P234-Q015",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which of the following barrages is not located in Punjab Province?",
    "options": [
      "Trimmu Barrage",
      "Balloki Barrage",
      "Sukkur Barrage",
      "Rasul Barrage"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سکھر بیراج دریائے سندھ پر صوبہ سندھ میں واقع ہے، اس لیے یہ پنجاب میں نہیں ہے۔ تریموں، بلوکی اور رسول بیراج پنجاب کے آبی نظام کا حصہ ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q15, PDF p.1",
      "referenceUrl": "https://irrigation.sindh.gov.pk/public",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "barrages",
      "sindh",
      "sukkur"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Standard spellings Trimmu and Balloki are used instead of the scan's Trimma/Bailoki variants."
  },
  {
    "id": "P234-Q015-SIM",
    "pairId": "P234-Q015",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Guddu Barrage is located on which river?",
    "options": [
      "Jhelum",
      "Indus",
      "Ravi",
      "Chenab"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "گڈو بیراج دریائے سندھ پر، کشمور کے قریب سندھ کی شمالی حد کے پاس واقع ہے۔ یہ سکھر بیراج سے اوپر کی جانب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://irrigation.sindh.gov.pk/public/guddubarrage",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "barrages",
      "indus-river",
      "guddu"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q016-SRC",
    "pairId": "P234-Q016",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year did Allama Iqbal deliver the Allahabad Address?",
    "options": [
      "1928",
      "1929",
      "1930",
      "1931"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "علامہ محمد اقبال نے 29 دسمبر 1930 کو آل انڈیا مسلم لیگ کے اجلاس میں الہ آباد کا صدارتی خطبہ دیا۔ اس خطاب میں انہوں نے شمال مغربی مسلم اکثریتی علاقوں کے لیے ایک سیاسی وحدت کا تصور پیش کیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q16, PDF p.1",
      "referenceUrl": "https://www.iqbal.com.pk/allama-iqbal-prose-works/stray-reflections-the-private-notebook-of-muham/991-prose-works/speeches-writings-and-statements-of-allama-iqba/1680-1930-presidential-address-allahabad-allama-iqbal",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "allama-iqbal",
      "allahabad-address",
      "1930"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q016-SIM",
    "pairId": "P234-Q016",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which year was the Lahore Resolution adopted?",
    "options": [
      "1930",
      "1940",
      "1935",
      "1946"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "قراردادِ لاہور 23 مارچ 1940 کو منٹو پارک لاہور میں منظور کی گئی۔ یہی قرارداد بعد میں قراردادِ پاکستان کے نام سے مشہور ہوئی اور تحریکِ پاکستان کو واضح سیاسی سمت ملی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "lahore-resolution",
      "pakistan-movement",
      "1940"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q017-SRC",
    "pairId": "P234-Q017",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the intended meaning of the Urdu proverb 'آگ نہ اُگل، پھول اُگل'?",
    "options": [
      "Spend wealth",
      "Remain completely silent",
      "Tell a lie",
      "Leave harsh words and speak kindly"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اس کا مفہوم یہ ہے کہ تلخ، غصے بھرے اور نقصان دہ الفاظ کے بجائے اچھی اور نرم بات کہنی چاہیے۔ معروف لغوی صورت 'آگ نہ اُگل، لعل اُگل' ہے، یعنی بری بات نہ نکالو بلکہ قیمتی اور اچھی بات کہو۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q17, PDF p.1",
      "referenceUrl": "https://www.rekhtadictionary.com/muhaware?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "speech",
      "meaning"
    ],
    "verificationStatus": "source-variant",
    "sourceNotes": "The blurred scan/book reads 'پھول اُگل'; Rekhta records the standard proverb as 'آگ نہ اُگل لعل اُگل'. The intended meaning and keyed option remain the same."
  },
  {
    "id": "P234-Q017-SIM",
    "pairId": "P234-Q017",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'مُنہ میں رام، بَغَل میں چُھری' describe?",
    "options": [
      "Open courage",
      "Generosity to a stranger",
      "Hidden hostility behind friendly words",
      "Speaking without thinking"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہ کہاوت ایسے شخص کے لیے آتی ہے جو ظاہر میں دوست اور میٹھی باتیں کرنے والا ہو مگر باطن میں دشمنی یا دھوکا رکھتا ہو۔ اس کا مرکزی مفہوم منافقت اور چھپی ہوئی بدخواہی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-munh-men-raam-bagal-men-chhurii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "hypocrisy",
      "meaning"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q018-SRC",
    "pairId": "P234-Q018",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu-Persian expression 'گوہرِ غلطاں' mean?",
    "options": [
      "Minerals",
      "A rolling or lustrous precious pearl",
      "Fragrance",
      "Adornment"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "گوہر کے بنیادی معنی موتی یا قیمتی پتھر کے ہیں اور 'غلطاں' لڑھکنے یا چمکنے کا تصور دیتا ہے۔ شعری استعمال میں گوہرِ غلطاں سے قیمتی، چمکتا یا ڈھلکتا ہوا موتی مراد لیا جاتا ہے، اس لیے قیمتی پتھر والا جواب قریب ترین ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q18, PDF p.1",
      "referenceUrl": "https://urdupub.com/d/%DA%AF%D9%88%DB%81%D8%B1",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-vocabulary",
      "gohar",
      "persian-expression"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q018-SIM",
    "pairId": "P234-Q018",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu expression 'دُرِ نایاب' mean?",
    "options": [
      "A common stone",
      "A rare or invaluable pearl",
      "A broken ornament",
      "A fragrant flower"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "دُر کے معنی موتی اور نایاب کے معنی بہت کم ملنے والا ہیں۔ اس لیے دُرِ نایاب کا مطلب بے مثل، نادر یا انتہائی قیمتی موتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-dur-e-naayaab?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-vocabulary",
      "dur-e-nayab",
      "persian-expression"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q019-SRC",
    "pairId": "P234-Q019",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "In a corrected consistent version of the printed exponent problem, if x²y² = 4 and x³y³ = 8, what is x⁵y⁵?",
    "options": [
      "16",
      "24",
      "32",
      "64"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دونوں مساوات کو ضرب دیں: (x²y²)(x³y³) = 4 × 8۔ یکساں bases کی powers جمع ہوتی ہیں، اس لیے بائیں طرف x⁵y⁵ اور دائیں طرف 32 آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q19, PDF p.1",
      "referenceUrl": "https://openstax.org/books/college-algebra-2e/pages/1-2-exponents-and-scientific-notation",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "product-rule",
      "algebra"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The scan prints x²y² = 10 and x³y³ = 8, but those premises are inconsistent: for t = xy, t² = 10 and t³ = 8 cannot both hold. The values were repaired to 4 and 8 so the intended exponent-product rule has a valid answer."
  },
  {
    "id": "P234-Q019-SIM",
    "pairId": "P234-Q019",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "If a²b² = 9 and a³b³ = 27, what is a⁵b⁵?",
    "options": [
      "243",
      "162",
      "81",
      "729"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "a²b² اور a³b³ کو ضرب دینے سے exponents 2 + 3 = 5 ہو جاتے ہیں۔ دوسری طرف 9 × 27 = 243، لہٰذا a⁵b⁵ = 243 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/college-algebra-2e/pages/1-2-exponents-and-scientific-notation",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "product-rule",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q020-SRC",
    "pairId": "P234-Q020",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "The area of a circle inscribed in an equilateral triangle is 154 cm². Using π = 22/7, find the triangle's perimeter to one decimal place.",
    "options": [
      "72.7 cm",
      "71.5 cm",
      "72.3 cm",
      "71.7 cm"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "πr² = 154 میں π = 22/7 رکھنے سے r = 7 cm ملتا ہے۔ متساوی الاضلاع مثلث کے لیے r = a√3/6، لہٰذا a = 14√3 اور perimeter = 3a = 42√3 ≈ 72.7 cm ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 234, Q20, PDF pp.1–2",
      "referenceUrl": "https://mathworld.wolfram.com/EquilateralTriangle.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "equilateral-triangle",
      "incircle",
      "perimeter"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P234-Q020-SIM",
    "pairId": "P234-Q020",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "An equilateral triangle has an inradius of 4 cm. What is its exact perimeter?",
    "options": [
      "12√3 cm",
      "18√3 cm",
      "24√3 cm",
      "36√3 cm"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "متساوی الاضلاع مثلث میں r = a√3/6 ہوتا ہے، اس لیے a = 2√3r۔ r = 4 رکھنے سے side = 8√3 اور perimeter = 3 × 8√3 = 24√3 cm بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://mathworld.wolfram.com/EquilateralTriangle.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "equilateral-triangle",
      "inradius",
      "perimeter"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q001-SRC",
    "pairId": "P235-Q001",
    "kind": "source",
    "categoryId": "geography",
    "question": "What is the capital of South Korea?",
    "options": [
      "Busan",
      "Seoul",
      "Incheon",
      "Daegu"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "جنوبی کوریا، جس کا سرکاری نام جمہوریۂ کوریا ہے، کا دارالحکومت سیول ہے۔ بوسان، انچیون اور ڈیگو اہم شہر ہیں مگر دارالحکومت نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q1, PDF p.2",
      "referenceUrl": "https://www.cia.gov/the-world-factbook/about/archives/2021/static/16d6ab257f7398b69aba4a4c656d251f/KS-summary.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "south-korea",
      "capital",
      "asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q001-SIM",
    "pairId": "P235-Q001",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which currency is used in South Korea?",
    "options": [
      "Yen",
      "Won",
      "Yuan",
      "Baht"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "جنوبی کوریا کی کرنسی ساؤتھ کورین وون ہے، جس کا بین الاقوامی کوڈ KRW ہے۔ ین جاپان، یوآن چین اور بھات تھائی لینڈ کی کرنسیاں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q1",
      "referenceUrl": "https://www.cia.gov/the-world-factbook/static/a923f48a78be9e23f7b52fd5f2289396/KS-travel-facts.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "south-korea",
      "currency",
      "asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q002-SRC",
    "pairId": "P235-Q002",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Who became President of the United States after Donald Trump's first term ended in January 2021?",
    "options": [
      "Barack Obama",
      "George W. Bush",
      "Joe Biden",
      "Kamala Harris"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ڈونلڈ ٹرمپ کی پہلی مدت 20 جنوری 2021 کو ختم ہوئی اور اسی روز جو بائیڈن نے 46ویں امریکی صدر کی حیثیت سے حلف اٹھایا۔ سوال میں پہلی مدت کا ذکر ضروری ہے کیونکہ ٹرمپ 20 جنوری 2025 کو دوبارہ صدر بنے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q2, PDF p.2",
      "referenceUrl": "https://www.archives.gov/presidential-records/vice-presidential-records/selected-vice-presidential-records/biden-records",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-states",
      "presidents",
      "succession"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's wording was date-ambiguous after Donald Trump returned to office in 2025; 'first term ended in January 2021' was added for a unique historical answer."
  },
  {
    "id": "P235-Q002-SIM",
    "pairId": "P235-Q002",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Who succeeded Joe Biden as U.S. President on January 20, 2025?",
    "options": [
      "Mike Pence",
      "Kamala Harris",
      "Barack Obama",
      "Donald Trump"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ڈونلڈ ٹرمپ نے 20 جنوری 2025 کو 47ویں امریکی صدر کے طور پر حلف اٹھایا اور جو بائیڈن کے جانشین بنے۔ یہ جواب 22 اگست 2026 کے سرکاری ریکارڈ کے مطابق ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q2",
      "referenceUrl": "https://www.usa.gov/presidents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-states",
      "presidents",
      "current-affairs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q003-SRC",
    "pairId": "P235-Q003",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was the Viceroy of India when the All-India Muslim League was established in 1906?",
    "options": [
      "Lord Curzon",
      "Lord Minto",
      "Lord Chelmsford",
      "Lord Hardinge"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آل انڈیا مسلم لیگ دسمبر 1906 میں قائم ہوئی اور اس وقت لارڈ منٹو وائسرائے ہند تھے۔ اسی سال اکتوبر میں شملہ وفد نے بھی لارڈ منٹو سے ملاقات کی تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q3, PDF p.2",
      "referenceUrl": "https://fromjinnahtoquaid.gov.pk/Detail/MTM3Yjk3ZDctZWM5YS00ZjQ4LTk4ZTItYzQzMWU2OGE5YjI0",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muslim-league",
      "lord-minto",
      "pakistan-movement"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q003-SIM",
    "pairId": "P235-Q003",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which city was the All-India Muslim League founded in December 1906?",
    "options": [
      "Lahore",
      "Aligarh",
      "Delhi",
      "Dacca"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "آل انڈیا مسلم لیگ 30 دسمبر 1906 کو ڈھاکہ، جسے اس دور کی انگریزی میں Dacca لکھا جاتا تھا، میں قائم ہوئی۔ اس جماعت کا بنیادی مقصد برصغیر کے مسلمانوں کے سیاسی حقوق کا تحفظ تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q3",
      "referenceUrl": "https://pakhcnewdelhi.org.pk/history/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muslim-league",
      "dacca",
      "pakistan-movement"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q004-SRC",
    "pairId": "P235-Q004",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year was the Nehru Report presented?",
    "options": [
      "1927",
      "1928",
      "1929",
      "1930"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "نہرو رپورٹ آل پارٹیز کانفرنس کی کمیٹی نے 1928 میں پیش کی تھی۔ برطانوی لائبریری کے آرکائیو ریکارڈ میں بھی اس رپورٹ کا سال 1928 درج ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q4, PDF p.2",
      "referenceUrl": "https://searcharchives.bl.uk/catalog/040-000142866",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nehru-report",
      "1928",
      "constitutional-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q004-SIM",
    "pairId": "P235-Q004",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which constitutional demands were formulated by Muhammad Ali Jinnah in response to the Nehru Report?",
    "options": [
      "Delhi Proposals",
      "Fourteen Points",
      "Lucknow Pact",
      "August Offer"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "نہرو رپورٹ کے جواب میں قائداعظم محمد علی جناح نے اپنے مشہور چودہ نکات پیش کیے۔ ان نکات میں مسلمانوں کے سیاسی اور آئینی تحفظات کو منظم صورت میں بیان کیا گیا تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q4",
      "referenceUrl": "https://fromjinnahtoquaid.gov.pk/Detail/MTM3Yjk3ZDctZWM5YS00ZjQ4LTk4ZTItYzQzMWU2OGE5YjI0",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "jinnah",
      "fourteen-points",
      "nehru-report"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q005-SRC",
    "pairId": "P235-Q005",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "What was the name of the Indian military operation used to annex Hyderabad in 1948?",
    "options": [
      "Operation Gibraltar",
      "Operation Polo",
      "Operation Blue Star",
      "Operation Meghdoot"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ستمبر 1948 میں ریاست حیدرآباد کے خلاف بھارتی فوجی کارروائی کا نام آپریشن پولو تھا۔ بھارتی سپریم کورٹ کے تاریخی پس منظر کے مطابق یہ کارروائی 13 ستمبر کو شروع ہوئی اور حیدرآباد بعد میں بھارتی یونین کا حصہ بنا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q5, PDF p.2",
      "referenceUrl": "https://api.sci.gov.in/supremecourt/2012/15716/15716_2012_41_1501_33183_Judgement_07-Feb-2022.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "operation-polo",
      "hyderabad",
      "india"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q005-SIM",
    "pairId": "P235-Q005",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which operation is officially associated with the liberation of Goa in 1961?",
    "options": [
      "Operation Trident",
      "Operation Shakti",
      "Operation Cactus",
      "Operation Vijay"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "1961 میں گوا اور دیگر پرتگالی نوآبادیوں کے حصول کی فوجی کارروائی آپریشن وجے کہلاتی ہے۔ بھارتی پریس انفارمیشن بیورو کی سرکاری عسکری تاریخوں کی فہرست بھی یہی نام درج کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q5",
      "referenceUrl": "https://www.pib.gov.in/newsite/PrintRelease.aspx?lang=2&reg=48&relid=177064",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "operation-vijay",
      "goa",
      "india"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q006-SRC",
    "pairId": "P235-Q006",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Whom did Muhammad bin Qasim defeat during the conquest of Sindh?",
    "options": [
      "Raja Porus",
      "Raja Jaipal",
      "Raja Dahir",
      "Raja Bhoj"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "محمد بن قاسم نے سندھ میں راجہ داہر کی حکومت کو شکست دی۔ پاکستان ہائی کمیشن کی تاریخی معلومات کے مطابق سندھ کی مہم 711 عیسوی میں راجہ داہر کی سلطنت کے خلاف ہوئی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q6, PDF p.2",
      "referenceUrl": "https://pakhcnewdelhi.org.pk/history/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muhammad-bin-qasim",
      "raja-dahir",
      "sindh"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q006-SIM",
    "pairId": "P235-Q006",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which region of the subcontinent was subdued by Muhammad bin Qasim in the early eighth century?",
    "options": [
      "Bengal",
      "Kashmir",
      "Sindh",
      "Malwa"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "محمد بن قاسم کی ابتدائی آٹھویں صدی کی مہم کا مرکزی خطہ سندھ تھا۔ اس فتح کے بعد علاقے میں نئی بستیاں قائم ہوئیں اور عربی کو سرکاری زبان کے طور پر متعارف کرایا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q6",
      "referenceUrl": "https://pakhcnewdelhi.org.pk/history/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muhammad-bin-qasim",
      "sindh",
      "early-islamic-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q007-SRC",
    "pairId": "P235-Q007",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which of the following is not an emirate of the United Arab Emirates?",
    "options": [
      "Abu Dhabi",
      "Dubai",
      "Bahrain",
      "Sharjah"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "متحدہ عرب امارات سات امارات پر مشتمل ہے اور بحرین ان میں شامل نہیں بلکہ ایک الگ خودمختار ملک ہے۔ ابوظبی، دبئی اور شارجہ تینوں متحدہ عرب امارات کی امارات ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q7, PDF p.2",
      "referenceUrl": "https://u.ae/en/about-the-uae/the-seven-emirates",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "uae",
      "emirates",
      "bahrain"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q007-SIM",
    "pairId": "P235-Q007",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which is the smallest of the seven emirates of the UAE?",
    "options": [
      "Fujairah",
      "Ajman",
      "Sharjah",
      "Umm Al Quwain"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "متحدہ عرب امارات کے سرکاری پورٹل کے مطابق عجمان رقبے کے لحاظ سے ساتوں امارات میں سب سے چھوٹی ہے۔ ام القوین دوسری سب سے چھوٹی اور سب سے کم آبادی والی امارت ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q7",
      "referenceUrl": "https://u.ae/en/about-the-uae/the-seven-emirates",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "uae",
      "ajman",
      "emirates"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q008-SRC",
    "pairId": "P235-Q008",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "In which city is NATO Headquarters located?",
    "options": [
      "Paris",
      "Geneva",
      "Brussels",
      "London"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نیٹو کا سیاسی اور انتظامی صدر دفتر برسلز، بیلجیم میں واقع ہے۔ یہ نارتھ اٹلانٹک کونسل اور رکن ممالک کے مستقل وفود کا مرکز ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q8, PDF p.2",
      "referenceUrl": "https://nato.int/en/about-us/organization/nato-structure/nato-headquarters",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nato",
      "brussels",
      "headquarters"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q008-SIM",
    "pairId": "P235-Q008",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "In which city was NATO's first headquarters established in 1949?",
    "options": [
      "Washington, D.C.",
      "Paris",
      "Brussels",
      "London"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "نیٹو کا پہلا صدر دفتر 1949 میں لندن کے 13 بیلگریو اسکوائر میں قائم ہوا تھا۔ اسے 1952 میں پیرس اور 1967 میں برسلز منتقل کیا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q8",
      "referenceUrl": "https://nato.int/en/about-us/organization/nato-structure/nato-headquarters",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nato",
      "london",
      "history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q009-SRC",
    "pairId": "P235-Q009",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which of the following countries does not use the euro as its currency?",
    "options": [
      "Germany",
      "France",
      "Italy",
      "United Kingdom"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "جرمنی، فرانس اور اٹلی یورو استعمال کرتے ہیں، جبکہ برطانیہ نے یورپی یونین کی رکنیت کے دوران بھی یورو اختیار نہیں کیا تھا۔ برطانیہ 2020 میں یورپی یونین سے نکل گیا اور اس کی کرنسی پاؤنڈ اسٹرلنگ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q9, PDF p.2",
      "referenceUrl": "https://www.ecb.europa.eu/euro/intro/html/index.en.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "euro",
      "united-kingdom",
      "currency"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q009-SIM",
    "pairId": "P235-Q009",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which EU country has a treaty opt-out from adopting the euro?",
    "options": [
      "Poland",
      "Sweden",
      "Denmark",
      "Romania"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ڈنمارک کو یورو اختیار کرنے سے باقاعدہ معاہداتی استثنا حاصل ہے۔ پولینڈ، سویڈن اور رومانیہ ابھی یورو زون میں شامل نہیں، مگر ان کی حیثیت ڈنمارک کے مستقل opt-out جیسی نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q9",
      "referenceUrl": "https://european-union.europa.eu/institutions-law-budget/euro/countries-using-euro_en",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "euro",
      "denmark",
      "european-union"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q010-SRC",
    "pairId": "P235-Q010",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which is the largest island in the world, excluding continents?",
    "options": [
      "New Guinea",
      "Borneo",
      "Greenland",
      "Madagascar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "براعظموں کو جزائر کی فہرست سے الگ رکھتے ہوئے گرین لینڈ دنیا کا سب سے بڑا جزیرہ ہے۔ اس کا کل رقبہ تقریباً 2.166 ملین مربع کلومیٹر ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q10, PDF p.2",
      "referenceUrl": "https://stat.gl/publ/da/GF/2017/pdf/Greenland%20in%20Figures%202017.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "greenland",
      "islands",
      "world-geography"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q010-SIM",
    "pairId": "P235-Q010",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Approximately what is the total area of Greenland?",
    "options": [
      "216,608 km²",
      "2,166,086 km²",
      "1,166,086 km²",
      "4,166,086 km²"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "گرین لینڈ کا کل رقبہ تقریباً 2,166,086 مربع کلومیٹر درج کیا جاتا ہے۔ اسی وسیع رقبے کی وجہ سے اسے دنیا کا سب سے بڑا جزیرہ کہا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q10",
      "referenceUrl": "https://stat.gl/publ/da/GF/2017/pdf/Greenland%20in%20Figures%202017.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "greenland",
      "area",
      "islands"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q011-SRC",
    "pairId": "P235-Q011",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was the third Prime Minister of Pakistan?",
    "options": [
      "Liaquat Ali Khan",
      "Khawaja Nazimuddin",
      "Mohammad Ali Bogra",
      "Chaudhry Muhammad Ali"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قومی اسمبلی کی سرکاری فہرست میں لیاقت علی خان پہلے، خواجہ ناظم الدین دوسرے اور محمد علی بوگرہ تیسرے وزیر اعظم درج ہیں۔ محمد علی بوگرہ نے 17 اپریل 1953 کو عہدہ سنبھالا تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q11, PDF p.2",
      "referenceUrl": "https://na.gov.pk/en/priminister_list.php/index.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prime-ministers",
      "mohammad-ali-bogra",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q011-SIM",
    "pairId": "P235-Q011",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Who was the second Prime Minister of Pakistan?",
    "options": [
      "Liaquat Ali Khan",
      "Mohammad Ali Bogra",
      "Khawaja Nazimuddin",
      "Huseyn Shaheed Suhrawardy"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "خواجہ ناظم الدین پاکستان کے دوسرے وزیر اعظم تھے اور انہوں نے اکتوبر 1951 میں عہدہ سنبھالا۔ ان سے پہلے لیاقت علی خان اور ان کے بعد محمد علی بوگرہ وزیر اعظم بنے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q11",
      "referenceUrl": "https://na.gov.pk/en/priminister_list.php/index.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prime-ministers",
      "khawaja-nazimuddin",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q012-SRC",
    "pairId": "P235-Q012",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Who won the Olympic gold medal for Pakistan in the men’s javelin throw at Paris 2024?",
    "options": [
      "Munir Sadiq",
      "Abdul Khaliq",
      "Arshad Nadeem",
      "Naseem Hameed"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ارشد ندیم نے پیرس اولمپکس 2024 کے مردوں کے جیولن تھرو فائنل میں 92.97 میٹر پھینک کر سونے کا تمغہ جیتا۔ اس کارکردگی سے نیا اولمپک ریکارڈ بھی قائم ہوا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q12, PDF p.2",
      "referenceUrl": "https://worldathletics.org/competitions/olympic-games/the-xxxiii-olympic-games-7153115/results/men/javelin-throw/final/result",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "arshad-nadeem",
      "olympics-2024",
      "javelin"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q012-SIM",
    "pairId": "P235-Q012",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "What distance did Arshad Nadeem throw to set the Olympic record at Paris 2024?",
    "options": [
      "89.45 m",
      "90.57 m",
      "91.97 m",
      "92.97 m"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ارشد ندیم کی ریکارڈ ساز تھرو 92.97 میٹر تھی۔ یہ فائنل میں ان کی دوسری کوشش تھی اور اسی نے انہیں طلائی تمغہ دلایا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q12",
      "referenceUrl": "https://worldathletics.org/competitions/olympic-games/the-xxxiii-olympic-games-7153115/news/article/paris-2024-olympics-report-men-javelin",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "arshad-nadeem",
      "olympic-record",
      "javelin"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q013-SRC",
    "pairId": "P235-Q013",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year was the first population census held in Pakistan?",
    "options": [
      "1949",
      "1951",
      "1956",
      "1961"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آزادی کے بعد پاکستان کی پہلی مردم شماری 1951 میں ہوئی تھی۔ پاکستان بیورو آف اسٹیٹسٹکس کی مردم شماری تاریخ بھی 1951 کو پہلا سال قرار دیتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q13, PDF p.2",
      "referenceUrl": "https://census.pbs.gov.pk/census-history/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "census",
      "1951",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q013-SIM",
    "pairId": "P235-Q013",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "The 2023 population census was which numbered census of Pakistan?",
    "options": [
      "Fifth",
      "Seventh",
      "Sixth",
      "Eighth"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پاکستان میں 2023 کی مردم شماری ساتویں قومی مردم شماری تھی اور پہلی مکمل ڈیجیٹل مردم شماری بھی قرار پائی۔ سرکاری رپورٹ 1951 سے 2023 تک سات مردم شماریوں کا ڈیٹا دیتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q13",
      "referenceUrl": "https://www.pbs.gov.pk/sites/default/files/population/2023/Key_Findings_Report.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "census-2023",
      "seventh-census",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q014-SRC",
    "pairId": "P235-Q014",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Under which Article of the Constitution of Pakistan is Urdu declared the national language?",
    "options": [
      "Article 240",
      "Article 251",
      "Article 270",
      "Article 62"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آئینِ پاکستان کا آرٹیکل 251(1) اردو کو پاکستان کی قومی زبان قرار دیتا ہے۔ اسی آرٹیکل میں سرکاری مقاصد کے لیے اردو کے استعمال کے انتظامات کا بھی ذکر ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q14, PDF p.2",
      "referenceUrl": "https://www.na.gov.pk/uploads/documents/1515056252_668.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "article-251",
      "urdu",
      "constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q014-SIM",
    "pairId": "P235-Q014",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Under Article 251(2), which language may be used for official purposes until arrangements are made to replace it with Urdu?",
    "options": [
      "Arabic",
      "Persian",
      "English",
      "Punjabi"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "آرٹیکل 251(2) کے مطابق اردو کے مکمل نفاذ کے انتظامات ہونے تک انگریزی سرکاری مقاصد کے لیے استعمال ہو سکتی ہے۔ یہ شق قومی زبان کی حیثیت کو تبدیل نہیں کرتی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q14",
      "referenceUrl": "https://www.na.gov.pk/uploads/documents/1515056252_668.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "article-251",
      "english",
      "constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q015-SRC",
    "pairId": "P235-Q015",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Pakistan served as a non-permanent member of which United Nations body during 2025–2026?",
    "options": [
      "UN General Assembly",
      "UN Human Rights Council",
      "UN Security Council",
      "International Court of Justice"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان 2025–2026 کی مدت کے لیے اقوام متحدہ کی سلامتی کونسل کا غیر مستقل رکن منتخب ہوا۔ یہ جواب اس مخصوص دو سالہ مدت کے تناظر میں ہے، کیونکہ رکنیت وقت کے ساتھ بدلتی رہتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q15, PDF p.2",
      "referenceUrl": "https://main.un.org/securitycouncil/en/content/countries-elected-members",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "un-security-council",
      "2025-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's phrase 'attended the non-permanent council sitting' was normalized to the accurate concept of serving as a non-permanent member for 2025–2026."
  },
  {
    "id": "P235-Q015-SIM",
    "pairId": "P235-Q015",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "For how long are elected non-permanent members of the UN Security Council normally chosen?",
    "options": [
      "One year",
      "Two years",
      "Three years",
      "Five years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سلامتی کونسل کے دس غیر مستقل ارکان جنرل اسمبلی کے ذریعے دو سالہ مدت کے لیے منتخب ہوتے ہیں۔ پانچ مستقل ارکان کی رکنیت اس انتخابی مدت سے مشروط نہیں ہوتی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q15",
      "referenceUrl": "https://main.un.org/securitycouncil/en/content/current-members",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "un-security-council",
      "membership",
      "two-year-term"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q016-SRC",
    "pairId": "P235-Q016",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which agreement did Pakistan and Saudi Arabia sign on September 17, 2025?",
    "options": [
      "Strategic Mutual Defence Agreement",
      "Trade Expansion Treaty",
      "Energy Security Agreement",
      "Economic Cooperation Pact"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان اور سعودی عرب نے 17 ستمبر 2025 کو اسٹریٹیجک میوچول ڈیفنس ایگریمنٹ پر دستخط کیے۔ معاہدے کے مطابق کسی ایک ملک کے خلاف جارحیت دونوں کے خلاف جارحیت سمجھی جائے گی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q16, PDF p.2",
      "referenceUrl": "https://www.app.com.pk/global/pakistan-ksa-sign-strategic-mutual-defence-agreement-stating-any-aggression-against-either-country-to-be-considered-against-both/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "saudi-arabia",
      "smda-2025"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q016-SIM",
    "pairId": "P235-Q016",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "In which city was the Pakistan–Saudi Strategic Mutual Defence Agreement signed in September 2025?",
    "options": [
      "Islamabad",
      "Jeddah",
      "Riyadh",
      "Mecca"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہ دفاعی معاہدہ سعودی دارالحکومت ریاض میں 17 ستمبر 2025 کو طے پایا۔ دستاویزات کا تبادلہ سعودی ولی عہد محمد بن سلمان اور پاکستانی وزیر اعظم شہباز شریف نے کیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q16",
      "referenceUrl": "https://www.app.com.pk/global/pakistan-ksa-sign-strategic-mutual-defence-agreement-stating-any-aggression-against-either-country-to-be-considered-against-both/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "riyadh",
      "pakistan-saudi-relations",
      "smda-2025"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q017-SRC",
    "pairId": "P235-Q017",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was the Federal Minister for Finance and Revenue of Pakistan on August 22, 2026?",
    "options": [
      "Ishaq Dar",
      "Asad Umar",
      "Muhammad Aurangzeb",
      "Abdul Hafeez Sheikh"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "22 اگست 2026 کو پاکستان کے وفاقی وزیر خزانہ و محصولات سینیٹر محمد اورنگزیب تھے۔ عہدہ تبدیل ہو سکتا ہے، اس لیے اس جواب کے ساتھ تاریخ یاد رکھنا ضروری ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q17, PDF p.2",
      "referenceUrl": "https://www.finance.gov.pk/profile_minister.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muhammad-aurangzeb",
      "finance-minister",
      "pakistan-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Date-qualified to the required access date because the officeholder can change."
  },
  {
    "id": "P235-Q017-SIM",
    "pairId": "P235-Q017",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "In which month and year was Muhammad Aurangzeb appointed Federal Minister for Finance and Revenue?",
    "options": [
      "January 2024",
      "March 2025",
      "June 2024",
      "March 2024"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "وزارتِ خزانہ کے سرکاری تعارف کے مطابق محمد اورنگزیب مارچ 2024 میں وفاقی وزیر خزانہ و محصولات مقرر ہوئے۔ اس سے پہلے وہ طویل عرصہ بینکاری کے شعبے میں کام کر چکے تھے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q17",
      "referenceUrl": "https://www.finance.gov.pk/profile_minister.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "muhammad-aurangzeb",
      "appointment",
      "march-2024"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q018-SRC",
    "pairId": "P235-Q018",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which club won the 2024–25 UEFA Champions League?",
    "options": [
      "Barcelona",
      "Real Madrid",
      "Inter",
      "Paris Saint-Germain"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پیرس سینٹ جرمین نے 2024–25 یوئیفا چیمپئنز لیگ جیتی۔ اس نے 31 مئی 2025 کے فائنل میں انٹر کو 5–0 سے شکست دے کر پہلی بار یہ ٹائٹل حاصل کیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q18, PDF p.2",
      "referenceUrl": "https://www.uefa.com/uefachampionsleague/news/0299-1de417608530-15b01ff7b150-1000--paris-win-champions-league-desire-doue-double-helps-secure/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "psg",
      "uefa-champions-league",
      "2024-25"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q018-SIM",
    "pairId": "P235-Q018",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Which club did Paris Saint-Germain defeat in the 2025 UEFA Champions League final?",
    "options": [
      "Arsenal",
      "Barcelona",
      "Inter",
      "Bayern Munich"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پیرس سینٹ جرمین نے 2025 کے چیمپئنز لیگ فائنل میں اطالوی کلب انٹر کو شکست دی۔ فائنل میونخ میں کھیلا گیا اور نتیجہ 5–0 رہا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q18",
      "referenceUrl": "https://www.uefa.com/uefachampionsleague/news/0299-1de417608530-15b01ff7b150-1000--paris-win-champions-league-desire-doue-double-helps-secure/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "psg",
      "inter",
      "champions-league-final"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q019-SRC",
    "pairId": "P235-Q019",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was the Governor of Punjab, Pakistan, on August 22, 2026?",
    "options": [
      "Baligh Ur Rehman",
      "Sardar Saleem Haider Khan",
      "Chaudhry Sarwar",
      "Rafique Rajwana"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "22 اگست 2026 کو سردار سلیم حیدر خان گورنر پنجاب تھے۔ پنجاب کے سرکاری پورٹل پر ان کی مدت مئی 2024 سے تاحال درج ہے، اس لیے جواب کو تاریخ کے ساتھ یاد کریں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q19, PDF p.2",
      "referenceUrl": "https://punjab.gov.pk/our_governors_pg",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punjab",
      "governor",
      "saleem-haider-khan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Date-qualified to August 22, 2026 because the officeholder can change."
  },
  {
    "id": "P235-Q019-SIM",
    "pairId": "P235-Q019",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "In which month and year did Sardar Saleem Haider Khan take oath as Governor of Punjab?",
    "options": [
      "March 2024",
      "January 2025",
      "August 2024",
      "May 2024"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سردار سلیم حیدر خان نے مئی 2024 میں گورنر پنجاب کا حلف اٹھایا۔ گورنر ہاؤس کے سرکاری تعارف میں حلف کی تاریخ 10 مئی 2024 درج ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q19",
      "referenceUrl": "https://governorhouse.punjab.gov.pk/the-governor",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punjab-governor",
      "oath",
      "may-2024"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q020-SRC",
    "pairId": "P235-Q020",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which radioactive isotope of hydrogen is used in nuclear studies?",
    "options": [
      "Protium",
      "Deuterium",
      "Tritium",
      "Helium-3"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ٹریٹیم، جسے ہائیڈروجن-3 بھی کہتے ہیں، ہائیڈروجن کا تابکار آئسوٹوپ ہے۔ پروٹیم اور ڈیوٹریم مستحکم ہائیڈروجن آئسوٹوپس ہیں، جبکہ ہیلیم-3 ہائیڈروجن نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q20, PDF p.3",
      "referenceUrl": "https://www.nrc.gov/reading-rm/basic-ref/glossary/tritium",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tritium",
      "hydrogen-isotopes",
      "radioactivity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q020-SIM",
    "pairId": "P235-Q020",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the approximate half-life of tritium?",
    "options": [
      "1.2 years",
      "12.3 years",
      "6.1 years",
      "24.6 years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ٹریٹیم کی نصف عمر تقریباً 12.3 سال ہے اور یہ کم توانائی والے بیٹا ذرات خارج کرتا ہے۔ نصف عمر سے مراد وہ وقت ہے جس میں تابکار مادے کے نصف ایٹم تحلیل ہو جائیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q20",
      "referenceUrl": "https://www.nrc.gov/reactors/operating/ops-experience/tritium/faqs",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tritium",
      "half-life",
      "radioactivity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q021-SRC",
    "pairId": "P235-Q021",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Who discovered the circulation of blood through the body?",
    "options": [
      "Louis Pasteur",
      "William Harvey",
      "Thomas Edison",
      "Robert Koch"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ولیم ہاروے نے خون کی گردش کے اصول کو سائنسی طور پر بیان کیا اور دل کو خون پمپ کرنے والا عضو ثابت کیا۔ ان کی تحقیق نے جدید فعلیات اور قلبی طب کی بنیاد مضبوط کی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q21, PDF p.3",
      "referenceUrl": "https://www.rcp.ac.uk/news-and-media/news-and-opinion/rcp-welcomes-leading-doctors-to-harveian-oration-and-dinner/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "william-harvey",
      "blood-circulation",
      "physiology"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q021-SIM",
    "pairId": "P235-Q021",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "In which year was William Harvey's work De Motu Cordis, explaining blood circulation, published?",
    "options": [
      "1518",
      "1628",
      "1728",
      "1828"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ولیم ہاروے نے اپنی مشہور کتاب De Motu Cordis سن 1628 میں شائع کی۔ اس کتاب میں انہوں نے تجربات کے ذریعے بتایا کہ دل خون کو مسلسل پورے جسم میں گردش دیتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q21",
      "referenceUrl": "https://history.rcp.ac.uk/exhibitions/past-exhibitions/ceaseless-motion-experimentations-circulation",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "william-harvey",
      "1628",
      "de-motu-cordis"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q022-SRC",
    "pairId": "P235-Q022",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which is the outermost main layer of the Earth?",
    "options": [
      "Mantle",
      "Crust",
      "Core",
      "Inner core"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "زمین کی سب سے بیرونی بنیادی تہہ قشرِ ارض یعنی crust ہے۔ یہ مینٹل اور کور کے مقابلے میں بہت پتلی اور سخت تہہ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q22, PDF p.3",
      "referenceUrl": "https://pubs.usgs.gov/gip/dynamic/inside.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "earth",
      "crust",
      "layers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q022-SIM",
    "pairId": "P235-Q022",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Approximately how thick is the Earth’s mantle?",
    "options": [
      "290 km",
      "2,900 km",
      "900 km",
      "6,400 km"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "زمین کا مینٹل قشرِ ارض کے نیچے تقریباً 2,900 کلومیٹر موٹی تہہ ہے۔ یہ گرم اور نسبتاً کثیف نیم ٹھوس چٹانوں پر مشتمل ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q22",
      "referenceUrl": "https://pubs.usgs.gov/gip/dynamic/inside.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "earth",
      "mantle",
      "layers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q023-SRC",
    "pairId": "P235-Q023",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "In which organ is urea formed in the human body?",
    "options": [
      "Kidney",
      "Liver",
      "Pancreas",
      "Spleen"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "یوریا جگر میں یوریا سائیکل کے ذریعے زہریلی امونیا کو تبدیل کر کے بنتا ہے۔ پھر خون اسے گردوں تک پہنچاتا ہے جہاں سے یہ پیشاب کے ذریعے خارج ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q23, PDF p.3",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK513323/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urea-cycle",
      "liver",
      "human-body"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q023-SIM",
    "pairId": "P235-Q023",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which organs excrete most of the urea produced by the liver?",
    "options": [
      "Lungs",
      "Skin",
      "Kidneys",
      "Intestines"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "جگر میں بننے والا زیادہ تر یوریا گردے خون سے فلٹر کر کے پیشاب میں خارج کرتے ہیں۔ اسی وجہ سے خون میں یوریا نائٹروجن کا ٹیسٹ گردوں کی کارکردگی جانچنے میں مدد دیتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q23",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK513323/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urea",
      "kidneys",
      "excretion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q024-SRC",
    "pairId": "P235-Q024",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Carbon monoxide has a particularly strong affinity for which substance in blood?",
    "options": [
      "Nitrogen",
      "Haemoglobin",
      "Oxygen",
      "Carbon dioxide"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کاربن مونو آکسائیڈ ہیموگلوبن کے ساتھ آکسیجن سے زیادہ مضبوطی سے جڑتی ہے۔ اس طرح خون کی آکسیجن لے جانے کی صلاحیت کم ہو جاتی ہے اور شدید زہر خورانی ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q24, PDF p.3",
      "referenceUrl": "https://stacks.cdc.gov/view/cdc/176456/cdc_176456_DS1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "carbon-monoxide",
      "haemoglobin",
      "poisoning"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q024-SIM",
    "pairId": "P235-Q024",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the compound formed when carbon monoxide binds with haemoglobin called?",
    "options": [
      "Oxyhaemoglobin",
      "Methaemoglobin",
      "Carboxyhaemoglobin",
      "Myoglobin"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کاربن مونو آکسائیڈ اور ہیموگلوبن کے مجموعے کو کاربوکسی ہیموگلوبن کہا جاتا ہے۔ اس کی تشکیل آکسیجن کی ترسیل گھٹا دیتی ہے، اسی لیے بند جگہ میں CO خطرناک ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q24",
      "referenceUrl": "https://stacks.cdc.gov/view/cdc/209258/cdc_209258_DS1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "carboxyhaemoglobin",
      "carbon-monoxide",
      "blood"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q025-SRC",
    "pairId": "P235-Q025",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which area of Pakistan are the largest known low-grade iron-ore deposits located?",
    "options": [
      "Swat",
      "Chiniot",
      "Ziarat",
      "Mianwali (Kalabagh)"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "محکمہ معدنیات پنجاب کے مطابق کَلا باغ کے ذخائر پاکستان کے سب سے بڑے معلوم کم درجے کے لوہے کے ذخائر ہیں اور یہ ضلع میانوالی میں واقع ہیں۔ چنیوٹ میں بھی بڑا اور نسبتاً اعلیٰ معیار کا ذخیرہ ہے، مگر اسے مطلق طور پر سب سے بڑا کہنا سرکاری اعداد سے درست نہیں بنتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q25, PDF p.3",
      "referenceUrl": "https://mnm.punjab.gov.pk/important_minerals_occurring_in_punjab",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "iron-ore",
      "kalabagh",
      "mianwali"
    ],
    "verificationStatus": "verified-with-correction",
    "sourceNotes": "Printed key selects Chiniot (option B). Official Punjab sources identify Kalabagh in District Mianwali as the largest known low-grade deposit, about 298–300 Mt, versus roughly 250–261 Mt currently estimated at Chiniot; scoring is corrected to option D."
  },
  {
    "id": "P235-Q025-SIM",
    "pairId": "P235-Q025",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Approximately how large are the historically estimated iron-ore reserves at Kalabagh?",
    "options": [
      "30 million tonnes",
      "298 million tonnes",
      "150 million tonnes",
      "750 million tonnes"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اقوام متحدہ کے خصوصی فنڈ، جیولوجیکل سروے آف پاکستان اور PIDC کی مطالعات کے مطابق کَلا باغ کے ذخائر تقریباً 298 ملین ٹن ہیں۔ بعض سرکاری صفحات اسے گول کر کے تقریباً 300 ملین ٹن بھی لکھتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q25",
      "referenceUrl": "https://pmc.punjab.gov.pk/kalabagh_iron_ore_resource-porject",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kalabagh",
      "iron-ore",
      "mineral-reserves"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q026-SRC",
    "pairId": "P235-Q026",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Caps Lock and Num Lock are examples of which type of keys?",
    "options": [
      "Function keys",
      "Toggle keys",
      "Navigation keys",
      "Control keys"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Caps Lock اور Num Lock دبانے سے ایک حالت آن یا آف رہتی ہے، اس لیے انہیں toggle keys کہا جاتا ہے۔ دوبارہ دبانے سے حالت واپس تبدیل ہو جاتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q26, PDF p.3",
      "referenceUrl": "https://support.microsoft.com/da-dk/topic/howto-toggle-the-num-lock-caps-lock-and-scroll-lock-keys-1718b9bd-5ebf-f3ab-c249-d5312c93d2d7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "keyboard",
      "toggle-keys",
      "caps-lock"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q026-SIM",
    "pairId": "P235-Q026",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is also commonly treated as a toggle key?",
    "options": [
      "Enter",
      "Backspace",
      "Scroll Lock",
      "Tab"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Scroll Lock بھی Caps Lock اور Num Lock کی طرح حالت کو آن اور آف کرتا ہے، اس لیے یہ toggle key ہے۔ Enter، Backspace اور Tab عموماً مسلسل آن یا آف حالت محفوظ نہیں رکھتے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q26",
      "referenceUrl": "https://support.microsoft.com/da-dk/topic/howto-toggle-the-num-lock-caps-lock-and-scroll-lock-keys-1718b9bd-5ebf-f3ab-c249-d5312c93d2d7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "keyboard",
      "scroll-lock",
      "toggle-keys"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q027-SRC",
    "pairId": "P235-Q027",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which term describes the rules that govern data transfer between computers?",
    "options": [
      "Cable",
      "Router",
      "Protocol",
      "Modem"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پروٹوکول قواعد کا مجموعہ ہے جو بتاتا ہے کہ نیٹ ورک پر ڈیٹا کس طرح بھیجا اور وصول کیا جائے۔ کیبل ذریعۂ ترسیل، روٹر راستہ متعین کرنے والا آلہ اور موڈیم سگنل تبدیل کرنے والا آلہ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q27, PDF p.3",
      "referenceUrl": "https://www.ibm.com/docs/en/informix-servers/12.10?topic=architecture-network-protocol",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "network-protocol",
      "data-transfer",
      "networking"
    ],
    "verificationStatus": "verified-after-clarification",
    "sourceNotes": "The scan's stem ('Data transfer between computers through which communication method') is vague because physical media and devices also participate. It was clarified to ask specifically for the governing rules, making Protocol uniquely correct."
  },
  {
    "id": "P235-Q027-SIM",
    "pairId": "P235-Q027",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol suite is used extensively for communication over the Internet?",
    "options": [
      "ASCII",
      "TCP/IP",
      "BIOS",
      "NTFS"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "TCP/IP ایسے پروٹوکولز کا مجموعہ ہے جو کمپیوٹروں کے درمیان رابطہ، ایڈریسنگ اور روٹنگ کے اصول فراہم کرتا ہے۔ انٹرنیٹ پر ڈیٹا مواصلات کی بنیادی بنیاد یہی suite ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q27",
      "referenceUrl": "https://www.ibm.com/docs/en/aix/7.1.0?topic=management-transmission-control-protocolinternet-protocol",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tcp-ip",
      "internet",
      "protocol-suite"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q028-SRC",
    "pairId": "P235-Q028",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the primary function of an operating system?",
    "options": [
      "To create documents and spreadsheets",
      "To manage hardware and software resources",
      "To browse the internet",
      "To design computer programs"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آپریٹنگ سسٹم کمپیوٹر کے ہارڈویئر اور سافٹ ویئر وسائل کو منظم اور باہم مربوط کرتا ہے۔ یہ میموری، پروسیس، فائل، ڈیوائس اور صارف کے تعامل کے لیے بنیادی خدمات دیتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q28, PDF p.3",
      "referenceUrl": "https://www.ibm.com/think/topics/operating-systems",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "operating-system",
      "resource-management",
      "computer-basics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q028-SIM",
    "pairId": "P235-Q028",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which component is the central core of an operating system?",
    "options": [
      "Compiler",
      "Browser",
      "Kernel",
      "Spreadsheet"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کرنل آپریٹنگ سسٹم کا مرکزی جز ہے جو سافٹ ویئر اور ہارڈویئر کے درمیان بنیادی رابطہ بناتا ہے۔ یہ CPU، میموری، ان پٹ آؤٹ پٹ اور ڈیوائس ڈرائیورز جیسے اہم وسائل سنبھالتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q28",
      "referenceUrl": "https://www.ibm.com/think/topics/operating-systems",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kernel",
      "operating-system",
      "computer-basics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q029-SRC",
    "pairId": "P235-Q029",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which keyboard shortcut centers a paragraph in Microsoft Word?",
    "options": [
      "Ctrl+L",
      "Ctrl+R",
      "Ctrl+J",
      "Ctrl+E"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Microsoft Word میں Ctrl+E موجودہ یا منتخب پیراگراف کو درمیان میں align کرتا ہے۔ Ctrl+L بائیں، Ctrl+R دائیں اور Ctrl+J دونوں کناروں سے justify کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q29, PDF p.3",
      "referenceUrl": "https://support.microsoft.com/en-us/accessibility/word/keyboard-shortcuts-in-word",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "ctrl-e",
      "keyboard-shortcuts"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q029-SIM",
    "pairId": "P235-Q029",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which keyboard shortcut justifies a paragraph in Microsoft Word?",
    "options": [
      "Ctrl+M",
      "Ctrl+K",
      "Ctrl+J",
      "Ctrl+Q"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Microsoft Word میں Ctrl+J پیراگراف کو justify کرتا ہے، یعنی متن کے بائیں اور دائیں کناروں کو برابر بناتا ہے۔ Ctrl+E صرف متن کو درمیان میں لاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q29",
      "referenceUrl": "https://support.microsoft.com/en-us/accessibility/word/keyboard-shortcuts-in-word",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "ctrl-j",
      "keyboard-shortcuts"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q030-SRC",
    "pairId": "P235-Q030",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Factorize: x² + 16x + 63.",
    "options": [
      "(x + 7)(x + 9)",
      "(x + 7)(x + 8)",
      "(x + 6)(x + 9)",
      "(x + 3)(x + 4)"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "63 کے دو عوامل 7 اور 9 ہیں اور ان کا مجموعہ 16 بنتا ہے۔ اس لیے x² + 16x + 63 = (x + 7)(x + 9)، جسے ضرب دے کر بھی جانچا جا سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q30, PDF p.3",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "factorization",
      "quadratic",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q030-SIM",
    "pairId": "P235-Q030",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Factorize: x² + 13x + 40.",
    "options": [
      "(x + 4)(x + 10)",
      "(x + 2)(x + 20)",
      "(x + 5)(x + 8)",
      "(x + 6)(x + 7)"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "40 کے ایسے دو عوامل درکار ہیں جن کا مجموعہ 13 ہو؛ یہ 5 اور 8 ہیں۔ لہٰذا x² + 13x + 40 = (x + 5)(x + 8)۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q30",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "factorization",
      "quadratic",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q031-SRC",
    "pairId": "P235-Q031",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A high-speed train travels at 200 km/h. It leaves Station A at 12:24 and reaches Station B at 14:12. What distance does it travel?",
    "options": [
      "320 km",
      "360 km",
      "400 km",
      "240 km"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "12:24 سے 14:12 تک وقت 1 گھنٹہ 48 منٹ، یعنی 1.8 گھنٹے ہے۔ فاصلہ = رفتار × وقت کے مطابق 200 × 1.8 = 360 کلومیٹر۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q31, PDF p.3",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-7-solve-a-formula-for-a-specific-variable",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "distance-rate-time",
      "speed",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q031-SIM",
    "pairId": "P235-Q031",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A bus moves at a constant speed of 90 km/h for 2.5 hours. How far does it travel?",
    "options": [
      "180 km",
      "225 km",
      "210 km",
      "250 km"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مستقل رفتار میں فاصلہ d = rt سے نکلتا ہے۔ 90 کلومیٹر فی گھنٹہ کو 2.5 گھنٹے سے ضرب دینے پر 225 کلومیٹر حاصل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q31",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-7-solve-a-formula-for-a-specific-variable",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "distance-rate-time",
      "speed",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q032-SRC",
    "pairId": "P235-Q032",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "If 30 workers make 3,000 units in 20 days at 8 hours per day, how many days will 32 workers need to make 2,000 units at 10 hours per day, assuming equal productivity?",
    "options": [
      "8 days",
      "10 days",
      "12 days",
      "15 days"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "فی مزدور فی گھنٹہ پیداوار 3000 ÷ (30×20×8) = 0.625 یونٹ ہے۔ مطلوبہ دن 2000 ÷ (32×10×0.625) = 10 بنتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q32, PDF p.3",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra/pages/7-5-solve-applications-with-rational-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "work-rate",
      "workers",
      "proportion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q032-SIM",
    "pairId": "P235-Q032",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Ten workers working 8 hours a day for 5 days produce 400 units. At the same rate, how many days will 20 workers working 10 hours a day need to produce 1,000 units?",
    "options": [
      "4 days",
      "5 days",
      "6 days",
      "8 days"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پہلی صورت میں فی مزدور فی گھنٹہ پیداوار 400 ÷ (10×8×5) = 1 یونٹ ہے۔ دوسری صورت میں روزانہ 20×10 = 200 یونٹ بنیں گے، اس لیے 1000 یونٹ کے لیے 5 دن درکار ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q32",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra/pages/7-5-solve-applications-with-rational-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "work-rate",
      "direct-variation",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q033-SRC",
    "pairId": "P235-Q033",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A bond has a $1,000 face value, a 5% annual coupon, a price of $950, and 10 years to maturity. Which offered rate is closest to its yield to maturity?",
    "options": [
      "4.53%",
      "5.53%",
      "7.53%",
      "6.53%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "YTM وہ discount rate ہے جس پر تمام coupon payments اور آخری اصل رقم کی موجودہ قدر $950 بنتی ہے۔ عددی حل تقریباً 5.67% آتا ہے، اس لیے دیے گئے اختیارات میں 5.53% سب سے قریب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q33, PDF p.4",
      "referenceUrl": "https://www.finra.org/investors/insights/bond-yield-return",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bond",
      "yield-to-maturity",
      "finance-math"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's stem ends awkwardly ('YTM can be complex to'). It was normalized to ask for the closest offered rate. Exact annual YTM is about 5.6687%; the printed 5.53% is only the nearest option, not the exact result."
  },
  {
    "id": "P235-Q033-SIM",
    "pairId": "P235-Q033",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "For an otherwise comparable bond trading below face value, how does yield generally move relative to price?",
    "options": [
      "Yield rises as price falls",
      "Yield falls as price falls",
      "Yield always equals the coupon rate",
      "Yield becomes zero"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بانڈ کی قیمت اور yield عموماً الٹی سمت میں چلتے ہیں؛ قیمت کم ہو تو yield بڑھتی ہے۔ اسی لیے face value سے کم قیمت پر خریدا گیا coupon bond عموماً coupon rate سے زیادہ YTM دیتا ہے، بشرطیکہ ادائیگیاں وقت پر ہوں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q33",
      "referenceUrl": "https://www.finra.org/investors/insights/bond-yield-return",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bond-price",
      "yield",
      "inverse-relationship"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q034-SRC",
    "pairId": "P235-Q034",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A rectangle is 58.7 m long and 23.2 m wide. What is its perimeter, rounded to the nearest metre?",
    "options": [
      "151 m",
      "161 m",
      "164 m",
      "189 m"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مستطیل کا محیط P = 2L + 2W ہوتا ہے۔ 2(58.7 + 23.2) = 163.8 میٹر، جو قریب ترین پورے میٹر میں 164 میٹر بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q34, PDF p.4",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-4-polygons-perimeter-and-circumference",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rectangle",
      "perimeter",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q034-SIM",
    "pairId": "P235-Q034",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the perimeter of a rectangle measuring 12.5 m by 7.5 m?",
    "options": [
      "20 m",
      "32.5 m",
      "40 m",
      "93.75 m"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "محیط کے لیے لمبائی اور چوڑائی کے مجموعے کو دو سے ضرب دیتے ہیں۔ 2(12.5 + 7.5) = 2×20 = 40 میٹر۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q34",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-4-polygons-perimeter-and-circumference",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rectangle",
      "perimeter",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q035-SRC",
    "pairId": "P235-Q035",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "If y = 2x and z = 5y, then x + 3y + z equals:",
    "options": [
      "17x",
      "5x",
      "10x",
      "20x"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "y = 2x ہونے سے 3y = 6x اور z = 5y = 10x ہے۔ اب x + 6x + 10x کو جمع کرنے سے 17x حاصل ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q35, PDF p.4",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/2-2-evaluate-simplify-and-translate-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "substitution",
      "algebraic-expression",
      "variables"
    ],
    "verificationStatus": "verified-after-clarification",
    "sourceNotes": "The printed stem is incomplete ('find x from x+3y+z='). It was repaired to ask what the expression equals; the printed answer 17x is then mathematically correct."
  },
  {
    "id": "P235-Q035-SIM",
    "pairId": "P235-Q035",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "If y = 3x and z = 2y, then x + 2y + z equals:",
    "options": [
      "13x",
      "10x",
      "12x",
      "7x"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "y = 3x ہونے پر 2y = 6x اور z = 2y = 6x ہے۔ لہٰذا x + 2y + z = x + 6x + 6x = 13x۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q35",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/2-2-evaluate-simplify-and-translate-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "substitution",
      "algebraic-expression",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q036-SRC",
    "pairId": "P235-Q036",
    "kind": "source",
    "categoryId": "english",
    "question": "Which of the following is a modal verb?",
    "options": [
      "Run",
      "Must",
      "Beautiful",
      "Quickly"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Must ایک modal verb ہے جو ضرورت، پابندی یا مضبوط نتیجہ ظاہر کر سکتا ہے۔ Run عام فعل، beautiful صفت اور quickly حالیہ صفت یعنی adverb ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q36, PDF p.4",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/modal-verbs?page=1%3Fpage%3D1",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "modal-verbs",
      "must",
      "english-grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q036-SIM",
    "pairId": "P235-Q036",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is a modal verb used to express ability?",
    "options": [
      "Able",
      "Ability",
      "Can",
      "Skillfully"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Can ایک modal verb ہے جو صلاحیت ظاہر کرتا ہے، جیسے “She can swim”۔ یہ امکان ظاہر کرنے کے لیے بھی آ سکتا ہے، جبکہ باقی اختیارات modal verbs نہیں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q36",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/modal-verbs?page=1%3Fpage%3D1",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "modal-verbs",
      "can",
      "ability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q037-SRC",
    "pairId": "P235-Q037",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the closest synonym of MELD.",
    "options": [
      "Blend",
      "Separate",
      "Break",
      "Scatter"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Meld کا مطلب چیزوں کو ملا کر ایک بنا دینا ہے، اس لیے blend قریب ترین مترادف ہے۔ Separate، break اور scatter علیحدگی یا بکھراؤ کے مفہوم دیتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q37, PDF p.4",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/meld",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "meld",
      "synonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q037-SIM",
    "pairId": "P235-Q037",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the closest antonym of MELD.",
    "options": [
      "Combine",
      "Integrate",
      "Blend",
      "Separate"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Meld کا مفہوم combine یا blend کرنا ہے، اس لیے اس کا قریب ترین متضاد separate ہے۔ باقی تینوں اختیارات کسی نہ کسی شکل میں ملانے کا معنی دیتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q37",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/meld",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "meld",
      "antonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q038-SRC",
    "pairId": "P235-Q038",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Moccasin : Snake :: ___ : Shoe",
    "options": [
      "Alligator",
      "Asp",
      "Loafer",
      "Wader"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Moccasin یہاں water moccasin یعنی سانپ کی ایک قسم کے معنوں میں ہے، جیسے loafer جوتے کی ایک قسم ہے۔ رشتہ “قسم اور اس کے بڑے زمرے” کا ہے، اس لیے loafer درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q38, PDF p.4",
      "referenceUrl": "https://elearning.shisu.edu.cn/pluginfile.php/36509/mod_resource/content/1/ANALOGIES.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "moccasin",
      "loafer"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q038-SIM",
    "pairId": "P235-Q038",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the analogy: Salmon : Fish :: Loafer : ___",
    "options": [
      "Shoe",
      "Hat",
      "Shirt",
      "Glove"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Salmon مچھلی کی ایک قسم ہے اور loafer جوتے کی ایک قسم ہے۔ دونوں طرف مخصوص شے اور اس کے عمومی زمرے کا تعلق قائم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q38",
      "referenceUrl": "https://www.ahdictionary.com/word/search.html?q=loafer",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "loafer",
      "category-relation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q039-SRC",
    "pairId": "P235-Q039",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best passive form of the imperative sentence: “Bring the chair into the room.”",
    "options": [
      "The chair be brought into the room.",
      "Let the chair be brought into the room.",
      "The chair is brought into the room.",
      "Bringing the chair into the room."
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "امریہ جملے کی روایتی passive ساخت “Let + object + be + past participle” ہوتی ہے۔ اس لیے “Let the chair be brought into the room” درست امتحانی جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q39, PDF p.4",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/passive-forms",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "passive-voice",
      "imperative",
      "english-grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The preposition was lightly corrected from 'in the room' to idiomatic 'into the room'; the tested passive construction and answer are unchanged."
  },
  {
    "id": "P235-Q039-SIM",
    "pairId": "P235-Q039",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the passive form of the imperative: “Close the window.”",
    "options": [
      "The window has close.",
      "The window closing.",
      "Let the window be closed.",
      "Let close the window."
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "امریہ جملے کو اس امتحانی pattern میں passive بنانے کے لیے Let کے بعد object، پھر be اور past participle آتا ہے۔ لہٰذا “Let the window be closed” درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q39",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/passive-forms",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "passive-voice",
      "imperative",
      "practice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q040-SRC",
    "pairId": "P235-Q040",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best antonym of IRASCIBLE.",
    "options": [
      "Angry",
      "Irritable",
      "Placid",
      "Moody"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Irascible ایسے شخص کو کہتے ہیں جو جلد غصہ ہو جائے، جبکہ placid پُرسکون اور آسانی سے نہ بھڑکنے والا ہوتا ہے۔ Angry اور irritable متضاد نہیں بلکہ اسی مفہوم کے قریب ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q40, PDF p.4",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/irascible",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "irascible",
      "antonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q040-SIM",
    "pairId": "P235-Q040",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the closest synonym of IRASCIBLE.",
    "options": [
      "Serene",
      "Irritable",
      "Placid",
      "Patient"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Irascible کا مطلب جلد غصہ ہونے والا یا easily irritated ہے، اس لیے irritable قریب ترین مترادف ہے۔ Serene، placid اور patient نسبتاً پُرسکون مزاج کو ظاہر کرتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q40",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/irascible",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "irascible",
      "synonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q041-SRC",
    "pairId": "P235-Q041",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: “A black plum is as sweet as a ___ one.”",
    "options": [
      "White",
      "Sugar",
      "Honey",
      "Salt"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "One یہاں پہلے مذکور countable noun “plum” کی جگہ آیا ہے اور اس سے پہلے صفت درکار ہے۔ White واحد ایسا اختیار ہے جو “a white one” کی درست noun phrase بناتا ہے؛ جملے کا حقیقی دنیا کا تقابل غیر معمولی ضرور ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q41, PDF p.4",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/one",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "noun-substitution",
      "one",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed sentence is semantically unusual. 'White' is retained because it is the only option that grammatically premodifies the substitute noun 'one'; the item tests form more than factual content."
  },
  {
    "id": "P235-Q041-SIM",
    "pairId": "P235-Q041",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the sentence: “I prefer the red shirt to the blue ___.”",
    "options": [
      "Some",
      "It",
      "One",
      "Any"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "One کسی پہلے مذکور واحد قابلِ شمار اسم کی تکرار سے بچنے کے لیے استعمال ہو سکتا ہے۔ یہاں “the blue one” کا مطلب “the blue shirt” ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q41",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/one",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "noun-substitution",
      "one",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q042-SRC",
    "pairId": "P235-Q042",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: “They picked them up ___ the airport.”",
    "options": [
      "to",
      "of",
      "by",
      "at"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کسی مخصوص مقام یا meeting point کے لیے عموماً preposition “at” آتا ہے، اس لیے “at the airport” درست ہے۔ Stem میں فطری phrasal verb بنانے کے لیے “picked them up” استعمال کیا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q42, PDF p.4",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/prepositions-place",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prepositions",
      "at",
      "airport"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan reads 'picked them ___ the airport'; 'up' was inserted to restore the idiomatic phrasal verb while preserving the tested answer 'at'."
  },
  {
    "id": "P235-Q042-SIM",
    "pairId": "P235-Q042",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the sentence: “Meet me ___ the station entrance.”",
    "options": [
      "on",
      "in",
      "at",
      "from"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Station entrance ایک مخصوص نقطہ ہے، اس لیے اس کے ساتھ “at” استعمال ہوتا ہے۔ “In” عموماً بڑی بند جگہ کے اندر ہونے اور “on” سطح کے لیے آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q42",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/prepositions-place",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prepositions",
      "at",
      "place"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q043-SRC",
    "pairId": "P235-Q043",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: “There is no need for us to disturb them; we ___ disturb them.”",
    "options": [
      "Should",
      "Must",
      "Will",
      "Needn't"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پہلے حصے میں صاف بتایا گیا ہے کہ انہیں پریشان کرنے کی ضرورت نہیں۔ Needn’t عدمِ ضرورت ظاہر کرتا ہے، اس لیے “we needn’t disturb them” واحد موزوں جواب بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q43, PDF p.4",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/need",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "neednt",
      "modal-meaning",
      "grammar"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed sentence did not supply enough context because all four modals could form grammatical sentences with different meanings. A no-necessity clause was added so the printed key Needn't is uniquely supported."
  },
  {
    "id": "P235-Q043-SIM",
    "pairId": "P235-Q043",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the sentence: “You ___ bring lunch; food will be provided.”",
    "options": [
      "needn't",
      "must",
      "should",
      "will"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کھانا پہلے سے فراہم ہونے کی وجہ سے lunch لانا ضروری نہیں، اس لیے needn’t درست ہے۔ Needn’t عدمِ ضرورت ظاہر کرتا ہے، جبکہ mustn’t کسی کام کی ممانعت بیان کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q43",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/need",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "neednt",
      "no-obligation",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q044-SRC",
    "pairId": "P235-Q044",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the correct present-simple question.",
    "options": [
      "Does Ahsan play football?",
      "Does Ahsan plays football?",
      "Did Ahsan play football?",
      "No correction needed"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Present simple میں third-person subject کے ساتھ سوال “Does + subject + base verb” سے بنتا ہے۔ اس لیے “Does Ahsan play football?” درست ہے؛ “plays” does کے بعد نہیں آتا اور did والا جملہ past simple ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q44, PDF p.4",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/do",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "questions",
      "does",
      "punctuation"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed stem did not specify a tense, making both A and the past-simple option C grammatical. The website explicitly asks for present simple so A is unique."
  },
  {
    "id": "P235-Q044-SIM",
    "pairId": "P235-Q044",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which sentence correctly asks about Sara's regular report-writing habit?",
    "options": [
      "Does Sara writes reports?",
      "Is Sara write reports?",
      "Did Sara writes reports?",
      "Does Sara write reports?"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Present simple سوال میں third-person singular کے لیے does آتا ہے اور اس کے بعد main verb کی base form استعمال ہوتی ہے۔ اسی لیے “Does Sara write reports?” درست ہے، نہ کہ “writes”۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q44",
      "referenceUrl": "https://dictionary.cambridge.org/us/grammar/british-grammar/present-simple-i-work",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "present-simple",
      "does",
      "questions"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q045-SRC",
    "pairId": "P235-Q045",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu tense is illustrated by “وہ آیا تھا”?",
    "options": [
      "ماضی قریب",
      "ماضی بعید",
      "ماضی شکیہ",
      "حال"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "“وہ آیا تھا” میں کام ماضی میں مکمل ہو چکا تھا، اس لیے یہ ماضی بعید کی مثال ہے۔ معاون فعل “تھا” اس ساخت میں گزرے ہوئے مکمل عمل کی نشان دہی کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q45, PDF p.4",
      "referenceUrl": "https://ebooks.ebalbharati.in/pdfs/1204020302.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اردو-قواعد",
      "ماضی-بعید",
      "فعل"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q045-SIM",
    "pairId": "P235-Q045",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which Urdu tense is illustrated by “میں نے کھانا کھایا تھا”?",
    "options": [
      "حال مطلق",
      "ماضی قریب",
      "ماضی بعید",
      "مستقبل"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "“میں نے کھانا کھایا تھا” ایک ایسے عمل کو ظاہر کرتا ہے جو ماضی میں پہلے مکمل ہو چکا تھا۔ “تھا” کی مدد سے بنی یہ ساخت ماضی بعید کہلاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q45",
      "referenceUrl": "https://ebooks.ebalbharati.in/pdfs/1204020302.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اردو-قواعد",
      "ماضی-بعید",
      "مشق"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q046-SRC",
    "pairId": "P235-Q046",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu punctuation mark is used for a short pause (مختصر وقفہ)?",
    "options": [
      "؛",
      "،",
      "-",
      ":"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مختصر وقفے یا سکتہ کے لیے اردو میں علامت “،” استعمال ہوتی ہے۔ یہ وہاں آتی ہے جہاں بات ابھی مکمل نہ ہوئی ہو مگر ہلکا سا توقف مطلوب ہو۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q46, PDF p.4",
      "referenceUrl": "https://urdunotes.com/lesson/%D8%B1%D9%85%D9%88%D8%B2-%D8%A7%D9%88%D9%82%D8%A7%D9%81-%DA%A9%D8%A7-%D9%85%D9%81%DB%81%D9%88%D9%85-%D8%A7%D9%88%D8%B1-%D9%85%D8%AB%D8%A7%D9%84%DB%8C%DA%BA/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "رموز-اوقاف",
      "سکتہ",
      "کاما"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q046-SIM",
    "pairId": "P235-Q046",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which Urdu punctuation mark normally ends a complete declarative sentence?",
    "options": [
      "۔",
      "،",
      "؛",
      "؟"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مکمل خبریہ جملے کے اختتام پر اردو کا ختمہ “۔” لگایا جاتا ہے۔ “،” مختصر وقفہ، “؛” نسبتاً بڑا درمیانی وقفہ اور “؟” سوال کے لیے ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q46",
      "referenceUrl": "https://urdunotes.com/lesson/%D8%B1%D9%85%D9%88%D8%B2-%D8%A7%D9%88%D9%82%D8%A7%D9%81-%DA%A9%D8%A7-%D9%85%D9%81%DB%81%D9%88%D9%85-%D8%A7%D9%88%D8%B1-%D9%85%D8%AB%D8%A7%D9%84%DB%8C%DA%BA/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "رموز-اوقاف",
      "ختمہ",
      "جملہ"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q047-SRC",
    "pairId": "P235-Q047",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Choose the closest Urdu synonym of “سکونت”.",
    "options": [
      "سفر",
      "حرکت",
      "جدائی",
      "قیام"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سکونت کے معنی بود و باش، رہائش، اقامت یا قیام ہیں۔ اس لیے دیے گئے اختیارات میں “قیام” سب سے قریب مترادف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q47, PDF p.5",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-sukuunat?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "مترادف",
      "سکونت",
      "قیام"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q047-SIM",
    "pairId": "P235-Q047",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Choose the closest Urdu synonym of “اقامت”.",
    "options": [
      "سکونت",
      "حرکت",
      "روانگی",
      "جدائی"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اقامت کے معنی کسی جگہ ٹھہرنا، قیام کرنا یا سکونت اختیار کرنا ہیں۔ لہٰذا “سکونت” اس کا قریب ترین مترادف ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q47",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-iqaamat?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "مترادف",
      "اقامت",
      "سکونت"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q048-SRC",
    "pairId": "P235-Q048",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In Urdu grammar, what is a noun derived from a مصدر but not used to derive further words called?",
    "options": [
      "اسم مشتق",
      "مصدر",
      "اسم جامد",
      "اسم فاعل"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اسم مشتق وہ اسم ہے جو کسی مصدر یا اصل لفظ سے بنایا گیا ہو، جیسے پڑھنا سے پڑھنے والا۔ سوال کی درسی تعریف میں اس سے مزید لفظ نہ بننے کی شرط بھی شامل کی گئی ہے، اس لیے درست جواب اسم مشتق ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q48, PDF p.5",
      "referenceUrl": "https://ur.wiktionary.org/wiki/%D9%85%D8%B4%D8%AA%D9%82",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اردو-قواعد",
      "اسم-مشتق",
      "مصدر"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q048-SIM",
    "pairId": "P235-Q048",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which Urdu grammatical term means a base noun, often ending in “نا”, from which verbs and other nouns may be formed?",
    "options": [
      "ضمیر",
      "صفت",
      "مصدر",
      "حرف"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مصدر ایسا اسم ہے جس میں زمانہ نہیں پایا جاتا اور اردو میں عموماً اس کے آخر میں “نا” آتا ہے، جیسے پڑھنا اور لکھنا۔ اسی بنیادی صورت سے مختلف افعال اور اسماء بن سکتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q48",
      "referenceUrl": "https://oup.com.pk/media/teaching-guides/Oxford%20Urdu%20Silsila/Shaheen%20%282nd%20Edition%29%20TG.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اردو-قواعد",
      "مصدر",
      "لفظ-سازی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q049-SRC",
    "pairId": "P235-Q049",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom “آپے سے باہر ہونا” mean?",
    "options": [
      "سخت غصہ آنا",
      "مل جل کر رہنا",
      "خوش ہونا",
      "پیار بڑھانا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "“آپے سے باہر ہونا” کا مطلب غصے میں اپنے اوپر قابو کھو دینا ہے۔ اس لیے “سخت غصہ آنا” دیے گئے اختیارات میں درست مفہوم ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q49, PDF p.5",
      "referenceUrl": "https://urdunotes.com/lesson/alif-se-muhavare-in-urdu-urdu-idioms/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "محاورہ",
      "آپے-سے-باہر",
      "اردو"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q049-SIM",
    "pairId": "P235-Q049",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom “آسمان سر پر ٹوٹنا” mean?",
    "options": [
      "خاموش رہنا",
      "بہت خوش ہونا",
      "تیز بارش ہونا",
      "سخت مصیبت آنا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "“آسمان سر پر ٹوٹنا” شدید مصیبت یا اچانک بڑے صدمے کے لیے بولا جاتا ہے۔ اس کا لفظی مطلب مراد نہیں لیا جاتا، کیونکہ یہ محاوراتی اظہار ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q49",
      "referenceUrl": "https://urdunotes.com/lesson/alif-se-muhavare-in-urdu-urdu-idioms/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "محاورہ",
      "آسمان-سر-پر-ٹوٹنا",
      "اردو"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q050-SRC",
    "pairId": "P235-Q050",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the literal meaning of the Urdu word “مطلع”?",
    "options": [
      "طلوع ہونے کی جگہ",
      "غروب ہونے کے بعد",
      "درمیان کی جگہ",
      "بلند جگہ"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مَطلع کا لغوی مطلب طلوع ہونے کی جگہ، یعنی سورج یا چاند کے نکلنے کا مقام ہے۔ شاعری میں غزل یا قصیدے کے پہلے ہم قافیہ شعر کو بھی مطلع کہتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q50, PDF p.5",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-matla?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "مطلع",
      "لغوی-معنی",
      "اردو"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q050-SIM",
    "pairId": "P235-Q050",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In Urdu poetry, what is the opening couplet of a ghazal, in which both lines rhyme, called?",
    "options": [
      "مقطع",
      "مطلع",
      "مصرع",
      "رباعی"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "غزل کے پہلے شعر کو، جس کے دونوں مصرعے ہم قافیہ ہوں، مطلع کہتے ہیں۔ مقطع عموماً غزل کا آخری شعر ہوتا ہے جس میں شاعر اپنا تخلص لا سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 235, Q50",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-matla?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "مطلع",
      "غزل",
      "شعری-اصطلاح"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P235-Q051-SRC",
    "pairId": "P235-Q051",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Hazrat Hafsa (R.A.) was the daughter of:",
    "options": [
      "Hazrat Abu Bakr (R.A.)",
      "Hazrat Umar (R.A.)",
      "Hazrat Uthman (R.A.)",
      "Hazrat Ali (R.A.)"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "حضرت حفصہ رضی اللہ عنہا، حضرت عمر بن خطاب رضی اللہ عنہ کی صاحبزادی تھیں۔ آپ امہات المؤمنین میں شامل ہیں کیونکہ آپ کا نکاح رسول اللہ ﷺ سے ہوا تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q51, PDF p.5",
      "referenceUrl": "https://www.dar-alifta.org/ar/ourreligion/details/5150/%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9-%D8%AD%D9%81%D8%B5%D8%A9-%D8%A8%D9%86%D8%AA-%D8%B9%D9%85%D8%B1-%D8%B1%D8%B6%D9%8A-%D8%A7%D9%84%D9%84%D9%87-%D8%B9%D9%86%D9%87%D9%85%D8%A7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hazrat-hafsa",
      "ummahat-ul-mumineen"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Spelling standardized from 'Bakar/Usman' to 'Bakr/Uthman'."
  },
  {
    "id": "P235-Q051-SIM",
    "pairId": "P235-Q051",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Who was the mother of Hazrat Hafsa (R.A.)?",
    "options": [
      "Zaynab bint Maz'un",
      "Asma bint Abi Bakr",
      "Umm Salama",
      "Safiyyah bint Huyayy"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "حضرت حفصہ رضی اللہ عنہا کی والدہ کا نام زینب بنت مظعون تھا۔ ان کے والد حضرت عمر رضی اللہ عنہ اور بھائی حضرت عبداللہ بن عمر رضی اللہ عنہ تھے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q51",
      "referenceUrl": "https://www.dar-alifta.org/ar/ourreligion/details/5150/%D8%A7%D9%84%D8%B3%D9%8a%D8%AF%D8%A9-%D8%AD%D9%81%D8%B5%D8%A9-%D8%A8%D9%86%D8%AA-%D8%B9%D9%85%D8%B1-%D8%B1%D8%B6%D9%8a-%D8%A7%D9%84%D9%84%D9%87-%D8%B9%D9%86%D9%87%D9%85%D8%A7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hazrat-hafsa",
      "islamic-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on the cited official biography."
  },
  {
    "id": "P235-Q052-SRC",
    "pairId": "P235-Q052",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "During the caliphate of Hazrat Abu Bakr (R.A.), Hazrat Zaid bin Thabit (R.A.) was given responsibility for:",
    "options": [
      "Compilation of the Quran",
      "Compilation of Hadith",
      "Administration of Bait-ul-Mal",
      "The judiciary"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جنگِ یمامہ میں بہت سے قراء کی شہادت کے بعد حضرت ابوبکر رضی اللہ عنہ نے قرآن کو ایک مجموعے میں جمع کرنے کا فیصلہ کیا۔ یہ اہم ذمہ داری حضرت زید بن ثابت رضی اللہ عنہ کو دی گئی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q52, PDF p.5",
      "referenceUrl": "https://sunnah.com/bukhari:4986",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "compilation-of-quran",
      "zaid-bin-thabit"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Roman term 'Tadween-e-Quran' rendered as the clear English equivalent."
  },
  {
    "id": "P235-Q052-SIM",
    "pairId": "P235-Q052",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which battle prompted Hazrat Umar (R.A.) to urge the collection of the Quran during Hazrat Abu Bakr's caliphate?",
    "options": [
      "Battle of Badr",
      "Battle of Uhud",
      "Battle of Khandaq",
      "Battle of Yamama"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "جنگِ یمامہ میں قراء کی بڑی تعداد شہید ہوئی تھی۔ اسی اندیشے کے باعث حضرت عمر رضی اللہ عنہ نے قرآن کو باقاعدہ جمع کرنے کی تجویز دی۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q52",
      "referenceUrl": "https://sunnah.com/bukhari:4986",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "battle-of-yamama",
      "compilation-of-quran"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item verified from Sahih al-Bukhari 4986."
  },
  {
    "id": "P235-Q053-SRC",
    "pairId": "P235-Q053",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which fort did Hazrat Ali (R.A.) conquer in the Battle of Khaybar?",
    "options": [
      "Al-Qamus Fort",
      "Khaybar Fort",
      "Uhud Fort",
      "Quba Fort"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "خیبر کے مضبوط قلعوں میں قلعۂ قموص نمایاں تھا اور اس کی فتح حضرت علی رضی اللہ عنہ سے منسوب ہے۔ سوال میں 'خیبر فورٹ' مقام کا عمومی نام ہے، مخصوص قلعے کا نام قموص ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q53, PDF p.5",
      "referenceUrl": "https://islamicportal.co.uk/wp-content/uploads/2018/01/Seerah-Part-26-The-Battle-of-Khaybar.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "battle-of-khaybar",
      "al-qamus"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Distractors cleaned to avoid the duplicated spellings 'Khyber Fort/Khaybar Fort'; the substantive keyed answer remains Al-Qamus."
  },
  {
    "id": "P235-Q053-SIM",
    "pairId": "P235-Q053",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "To whom did the Prophet Muhammad ﷺ give the banner before the decisive advance at Khaybar?",
    "options": [
      "Hazrat Ali (R.A.)",
      "Hazrat Khalid bin Walid (R.A.)",
      "Hazrat Zubair bin Awwam (R.A.)",
      "Hazrat Sa'd bin Abi Waqqas (R.A.)"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "صحیح بخاری کی روایت کے مطابق رسول اللہ ﷺ نے خیبر کے موقع پر جھنڈا حضرت علی رضی اللہ عنہ کو دیا۔ پھر اللہ تعالیٰ نے ان کے ہاتھ پر فتح عطا فرمائی۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q53",
      "referenceUrl": "https://sunnah.com/bukhari:4209",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "battle-of-khaybar",
      "hazrat-ali"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on Sahih al-Bukhari 4209."
  },
  {
    "id": "P235-Q054-SRC",
    "pairId": "P235-Q054",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "What are the isolated letters such as الم at the beginnings of certain Quranic surahs called?",
    "options": [
      "حروفِ مقطعات",
      "محکمات",
      "آیاتُ الاحکام",
      "متشابہات"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سورتوں کے آغاز میں آنے والے الگ الگ پڑھے جانے والے حروف کو حروفِ مقطعات کہتے ہیں۔ ان کے حتمی مفہوم کے بارے میں قطعی دعویٰ نہیں کیا جاتا اور مفسرین نے مختلف حکمتیں بیان کی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q54, PDF p.5",
      "referenceUrl": "https://quran.com/al-baqarah/1/tafsirs/en-tafisr-ibn-kathir",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "huruf-muqattaat",
      "quran"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Blurred Urdu stem was normalized into an English instruction while preserving the essential Urdu answer terms."
  },
  {
    "id": "P235-Q054-SIM",
    "pairId": "P235-Q054",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "How many surahs of the Quran begin with حروفِ مقطعات?",
    "options": [
      "14",
      "19",
      "29",
      "30"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قرآنِ مجید کی انتیس سورتیں حروفِ مقطعات سے شروع ہوتی ہیں۔ ان تراکیب میں مجموعی طور پر چودہ منفرد عربی حروف استعمال ہوئے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q54",
      "referenceUrl": "https://quran.com/al-baqarah/1/tafsirs/en-tafisr-ibn-kathir",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "huruf-muqattaat",
      "quran-facts"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item; count verified in the cited tafsir."
  },
  {
    "id": "P235-Q055-SRC",
    "pairId": "P235-Q055",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "In which of the following fields is machine learning widely used?",
    "options": [
      "Agriculture only",
      "Financial analytics",
      "Law only",
      "Manual accounting"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مالیاتی تجزیے میں مشین لرننگ کریڈٹ رسک، فراڈ کی شناخت اور پیش گوئی جیسے کاموں میں استعمال ہوتی ہے۔ 'Agriculture only' اور 'Law only' غلط ہیں کیونکہ مشین لرننگ کئی شعبوں میں استعمال ہوتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q55, PDF p.5",
      "referenceUrl": "https://www.imf.org/en/publications/wp/issues/2019/05/17/fintech-in-financial-inclusion-machine-learning-applications-in-assessing-credit-risk-46883",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "machine-learning",
      "financial-analytics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Option A clarified as 'Agriculture only' because machine learning is also used in agriculture; financial analytics is the intended answer among the printed choices."
  },
  {
    "id": "P235-Q055-SIM",
    "pairId": "P235-Q055",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which financial task is a well-established application of machine learning?",
    "options": [
      "Handwriting every ledger",
      "Assessing credit risk",
      "Eliminating every default",
      "Printing banknotes"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مشین لرننگ قرض لینے والے کے ڈیٹا سے کریڈٹ رسک کا اندازہ لگانے میں مدد دے سکتی ہے۔ یہ ماڈل خطرہ کم کرنے میں معاون ہیں مگر ہر ڈیفالٹ کو مکمل طور پر ختم نہیں کر سکتے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q55",
      "referenceUrl": "https://www.imf.org/en/publications/wp/issues/2019/05/17/fintech-in-financial-inclusion-machine-learning-applications-in-assessing-credit-risk-46883",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "machine-learning",
      "credit-risk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on the cited IMF working paper."
  },
  {
    "id": "P235-Q056-SRC",
    "pairId": "P235-Q056",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What does the zero-rating principle mean?",
    "options": [
      "The supply is fully exempt from tax",
      "The supply is taxable but charged at 0%",
      "The supply is taxed at the highest rate",
      "Tax is charged on imports only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "زیرو ریٹڈ سپلائی قانونی طور پر ٹیکس ایبل رہتی ہے لیکن اس پر شرح صفر فیصد لگتی ہے۔ یہ exemption سے مختلف ہے؛ پاکستان کے FBR مواد میں بھی زیرو ریٹنگ کو صفر فیصد پر ٹیکس ایبل سپلائی کہا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q56, PDF p.5",
      "referenceUrl": "https://download1.fbr.gov.pk/Docs/201012211412172902008stax.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zero-rating",
      "sales-tax"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Wording generalized from 'goods' to 'supply' so the tax principle also covers services where the law provides zero rating."
  },
  {
    "id": "P235-Q056-SIM",
    "pairId": "P235-Q056",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which statement correctly distinguishes a zero-rated supply from an exempt supply?",
    "options": [
      "A zero-rated supply remains taxable at 0%",
      "Both are always outside the tax system",
      "An exempt supply is taxed at 0%",
      "Zero rating always prohibits input-tax recovery"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "زیرو ریٹڈ سپلائی ٹیکس کے دائرے میں رہتے ہوئے صفر فیصد شرح برداشت کرتی ہے۔ اصولی طور پر متعلقہ input tax کی recovery زیرو ریٹنگ میں ممکن ہو سکتی ہے، جبکہ exemption کا قانونی اثر مختلف ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q56",
      "referenceUrl": "https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zero-rated-supply",
      "taxable-supply"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original conceptual practice item; jurisdiction-specific recovery restrictions can still apply."
  },
  {
    "id": "P235-Q057-SRC",
    "pairId": "P235-Q057",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Under Pakistan's Companies Act, what is meant by a company?",
    "options": [
      "A group of friends doing business",
      "A sole-trader business",
      "An entity formed and registered under company law",
      "A government department"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Companies Act, 2017 کے مطابق company وہ ہے جو اس ایکٹ یا سابقہ company law کے تحت تشکیل پا کر رجسٹر ہوئی ہو۔ صرف چند افراد کا غیر رسمی کاروباری گروہ خود بخود company نہیں بن جاتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q57, PDF p.5",
      "referenceUrl": "https://www.secp.gov.pk/document/the-companies-act-2017-updated-18-aug-2022/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "companies-act-2017",
      "company-definition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Printed broad phrase 'incorporated under any law' narrowed to the statutory Companies Act definition."
  },
  {
    "id": "P235-Q057-SIM",
    "pairId": "P235-Q057",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Under the Companies Act, 2017, how many or more persons may ordinarily form a private company other than a single-member company?",
    "options": [
      "One",
      "Two",
      "Three",
      "Seven"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "عام private company دو یا زیادہ افراد تشکیل دے سکتے ہیں۔ اگر صرف ایک فرد private company بنائے تو اسے single-member company کہا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q57",
      "referenceUrl": "https://www.secp.gov.pk/company-formation/registration-of-company/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "private-company",
      "company-incorporation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item explicitly excludes the single-member-company exception."
  },
  {
    "id": "P235-Q058-SRC",
    "pairId": "P235-Q058",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Under section 7 of the Punjab Sales Tax on Services Act, what is generally the value of a taxable service?",
    "options": [
      "Cost of production",
      "Market price only",
      "Consideration received from the service recipient, excluding the tax",
      "Profit earned"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دفعہ 7 کے تحت taxable service کی value عموماً وہ consideration، charges یا price ہے جو service provider وصول کرے۔ اس value میں خود Punjab sales tax کی رقم شامل نہیں ہوتی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q58, PDF p.5",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "taxable-service-value",
      "punjab-sales-tax"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Added the statutory qualification that the amount of the tax itself is excluded."
  },
  {
    "id": "P235-Q058-SIM",
    "pairId": "P235-Q058",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "If consideration for a taxable service is wholly or partly in kind, which value is generally used under section 7?",
    "options": [
      "Historical cost of the provider",
      "Zero value in every case",
      "Declared profit of the recipient",
      "Open-market price of the service excluding tax"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اگر consideration مکمل یا جزوی طور پر جنس کی صورت میں ہو تو service کی open-market price لی جاتی ہے۔ اس valuation سے بھی tax کی اپنی رقم خارج رکھی جاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q58",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "consideration-in-kind",
      "open-market-price"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on section 7(2)."
  },
  {
    "id": "P235-Q059-SRC",
    "pairId": "P235-Q059",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "On the paper date, 7 June 2026, what was the maximum input-tax adjustment allowed under section 16C of the Punjab Sales Tax on Services Act?",
    "options": [
      "50% of output tax",
      "75% of output tax",
      "90% of output tax",
      "100% of output tax"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "7 جون 2026 کو نافذ قانون کے مطابق input tax adjustment کی حد output tax کا نوّے فیصد تھی۔ یکم جولائی 2026 سے Punjab Finance Act, 2026 نے یہ حد اسی فیصد کر دی، اس لیے یہ جواب paper-date context میں درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q59, PDF p.5",
      "referenceUrl": "https://www.pwc.com.pk/en/assets/document/AFFs%20Memorandum%20on%20Federal%20and%20Provincial%20Finance%20Acts%202022.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "input-tax-adjustment",
      "section-16c",
      "dated-law"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Printed key 90% is historically correct for 2026-06-07. It became outdated on 2026-07-01, when the cap changed to 80%."
  },
  {
    "id": "P235-Q059-SIM",
    "pairId": "P235-Q059",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "From 1 July 2026, what is the maximum input-tax adjustment under amended section 16C of the Punjab Sales Tax on Services Act?",
    "options": [
      "70% of output tax",
      "90% of output tax",
      "80% of output tax",
      "100% of output tax"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Punjab Finance Act, 2026 نے یکم جولائی 2026 سے حد نوّے فیصد سے کم کر کے اسی فیصد کر دی۔ نتیجتاً عام صورت میں کم از کم بیس فیصد output tax نقد ادا کرنا پڑتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q59",
      "referenceUrl": "https://pkrevenue.com/punjab-finance-act-2026-tightens-input-tax-adjustment-rules/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punjab-finance-act-2026",
      "input-tax-cap"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original current-law practice item, dated from 2026-07-01."
  },
  {
    "id": "P235-Q060-SRC",
    "pairId": "P235-Q060",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "In a simplified unadjusted calculation, a bank has assets with a five-year duration and liabilities with a two-year duration. What is the duration gap?",
    "options": [
      "1 year",
      "2 years",
      "3 years",
      "6 years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سادہ سوال میں duration gap کو asset duration minus liability duration لیا گیا ہے، یعنی 5 − 2 = 3 سال۔ عملی بینکاری میں market values اور liabilities-to-assets ratio شامل کر کے leverage-adjusted duration gap بھی نکالا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q60, PDF p.5",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/912471495102395147/pdf/115108-WP-PUBLIC-ECA-CR-ALM-Toolkit-EN.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "duration-gap",
      "asset-liability-management"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Stem explicitly labels the printed arithmetic as simplified; the standard leverage-adjusted formula is DA − (L/A)DL."
  },
  {
    "id": "P235-Q060-SIM",
    "pairId": "P235-Q060",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A bank has an asset duration of 5 years, a liability duration of 3 years, and liabilities equal to 90% of assets. What is its leverage-adjusted duration gap?",
    "options": [
      "1.7 years",
      "2.0 years",
      "2.3 years",
      "2.7 years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "فارمولا DA − (L/A × DL) ہے۔ لہٰذا 5 − (0.90 × 3) = 5 − 2.7 = 2.3 سال بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q60",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/912471495102395147/pdf/115108-WP-PUBLIC-ECA-CR-ALM-Toolkit-EN.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "leverage-adjusted-duration-gap",
      "calculation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item using the World Bank ALM formula."
  },
  {
    "id": "P235-Q061-SRC",
    "pairId": "P235-Q061",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "If a U.S. firm has €3 million payable, which option should it buy to hedge a rise in the euro?",
    "options": [
      "Euro put option",
      "Euro call option",
      "Futures contract to sell euros",
      "Stock option"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "فرم کو مستقبل میں یورو خریدنے ہیں، اس لیے یورو مہنگا ہونے کا خطرہ ہے۔ یورو call option اسے مقررہ strike price پر یورو خریدنے کا حق دیتا ہے اور اس خطرے کو محدود کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q61, PDF p.5",
      "referenceUrl": "https://www.cftc.gov/filings/ptc/ptc02262516077.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "foreign-currency-payable",
      "call-option",
      "fx-hedge"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Added the hedging objective ('a rise in the euro') to make the call-option logic explicit."
  },
  {
    "id": "P235-Q061-SIM",
    "pairId": "P235-Q061",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A Pakistani exporter expects to receive U.S. dollars in three months and fears that the dollar will fall. Which option on dollars provides a suitable hedge?",
    "options": [
      "Buy a dollar put",
      "Buy a dollar call",
      "Sell a dollar put",
      "Buy an equity call"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ایکسپورٹر کو مستقبل میں ڈالر وصول ہوں گے، اس لیے ڈالر کی قیمت گرنے سے مقامی کرنسی میں آمدن کم ہو سکتی ہے۔ Dollar put اسے طے شدہ قیمت پر ڈالر فروخت کرنے کا حق دے کر downside risk محدود کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q61",
      "referenceUrl": "https://www.bis.org/publ/qtrpdf/r_qt1409y.htm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "foreign-currency-receivable",
      "put-option",
      "exporter-hedge"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original application of the standard exporter put-option hedge described by BIS."
  },
  {
    "id": "P235-Q062-SRC",
    "pairId": "P235-Q062",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "According to the G20/OECD Principles of Corporate Governance, what should institutional investors disclose?",
    "options": [
      "Personal income details",
      "Corporate-governance and voting policies, including management of material conflicts of interest",
      "Only trading profits",
      "Personal tax returns"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "G20/OECD اصول institutional investors سے corporate governance اور voting policies ظاہر کرنے کی توقع رکھتے ہیں۔ انہیں ایسے material conflicts of interest کے انتظام کا طریقہ بھی واضح کرنا چاہیے جو سرمایہ کاری کے حقوق پر اثر انداز ہوں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q62, PDF p.5",
      "referenceUrl": "https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en/full-report/component-6.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "oecd-principles",
      "institutional-investors",
      "voting-policy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Wording aligned with the 2023 G20/OECD Principles."
  },
  {
    "id": "P235-Q062-SIM",
    "pairId": "P235-Q062",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which disclosure is identified as good practice for institutional investors that exercise shareholder voting rights?",
    "options": [
      "Competitors' tax returns",
      "Employees' private bank statements",
      "Actual voting records",
      "Unpublished client passwords"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "OECD اصولوں میں actual voting records کا افشا اچھی practice سمجھا جاتا ہے، خصوصاً جب ادارہ دوسروں کی طرف سے ووٹ دے رہا ہو۔ اس سے stewardship اور accountability بہتر ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q62",
      "referenceUrl": "https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en/full-report/component-6.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "voting-records",
      "corporate-governance",
      "accountability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on the disclosure discussion in the cited OECD chapter."
  },
  {
    "id": "P235-Q063-SRC",
    "pairId": "P235-Q063",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What happens to unpaid dividends on non-cumulative preferred stock?",
    "options": [
      "They are carried forward",
      "They do not accumulate",
      "They automatically double next year",
      "They become common-stock dividends"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Non-cumulative preferred stock پر کسی مدت کا غیر اعلان شدہ dividend اگلی مدت کے لیے جمع نہیں ہوتا۔ کمپنی اس چھوٹے ہوئے dividend کو مستقبل میں ادا کرنے کی پابند نہیں ہوتی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q63, PDF p.5",
      "referenceUrl": "https://www.sec.gov/Archives/edgar/data/794323/000094018000000214/0000940180-00-000214-d2.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preferred-stock",
      "non-cumulative-dividends"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Rule verified against an SEC-filed preferred-stock prospectus."
  },
  {
    "id": "P235-Q063-SIM",
    "pairId": "P235-Q063",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which feature distinguishes cumulative preferred dividends from non-cumulative preferred dividends?",
    "options": [
      "Missed cumulative dividends accrue as arrears",
      "Cumulative shares never receive dividends",
      "Non-cumulative arrears must always be paid first",
      "Cumulative shares are debt instruments"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Cumulative preferred dividends ادا نہ ہوں تو arrears کی صورت میں جمع ہوتے رہتے ہیں۔ عموماً common shareholders کو dividend دینے سے پہلے یہ بقایا ادا کرنا ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q63",
      "referenceUrl": "https://www.sec.gov/Archives/edgar/data/1495825/000182126826000054/gug89745n2.htm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cumulative-dividends",
      "dividend-arrears"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original comparison item verified from an SEC-filed disclosure."
  },
  {
    "id": "P235-Q064-SRC",
    "pairId": "P235-Q064",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "In a variable-costing segment report, how is segment margin calculated?",
    "options": [
      "Sales minus all variable and fixed expenses",
      "Contribution margin minus traceable fixed costs",
      "Contribution margin minus common fixed costs",
      "Sales minus variable costs only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Segment margin کے لیے پہلے sales سے variable costs نکال کر contribution margin حاصل کیا جاتا ہے۔ پھر اسی segment کے traceable fixed costs منہا کیے جاتے ہیں؛ allocated common fixed costs اس حساب کا حصہ نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q64, PDF p.5",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/10-4-evaluate-and-determine-whether-to-keep-or-discontinue-a-segment-or-product",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "segment-margin",
      "traceable-fixed-costs",
      "variable-costing"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "OpenStax uses 'product margin' for the same contribution-margin-less-direct-fixed-cost structure."
  },
  {
    "id": "P235-Q064-SIM",
    "pairId": "P235-Q064",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A segment has a contribution margin of Rs. 800,000 and traceable fixed costs of Rs. 250,000. What is its segment margin?",
    "options": [
      "Rs. 250,000",
      "Rs. 1,050,000",
      "Rs. 800,000",
      "Rs. 550,000"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Segment margin = contribution margin − traceable fixed costs ہوتا ہے۔ اس لیے 800,000 − 250,000 = 550,000 روپے جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q64",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/10-4-evaluate-and-determine-whether-to-keep-or-discontinue-a-segment-or-product",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "segment-margin",
      "calculation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical application of the cited reporting structure."
  },
  {
    "id": "P235-Q065-SRC",
    "pairId": "P235-Q065",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is capital expenditure?",
    "options": [
      "A routine day-to-day expense",
      "Expenditure to acquire or improve a long-term asset",
      "A monthly salary payment",
      "Monthly office rent"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Capital expenditure ایسا خرچ ہے جس سے طویل مدتی asset خریدا یا اس کی صلاحیت اور مفید عمر بڑھائی جائے۔ اسے عموماً فوراً مکمل expense کرنے کے بجائے asset کے طور پر capitalize کیا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q65, PDF p.5",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/11-2-analyze-and-classify-capitalized-costs-versus-expenses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "capital-expenditure",
      "long-term-assets"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Definition expanded to include qualifying improvements as well as acquisition."
  },
  {
    "id": "P235-Q065-SIM",
    "pairId": "P235-Q065",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which of the following is normally treated as a current operating expense rather than capital expenditure?",
    "options": [
      "Routine repair that does not extend an asset's useful life",
      "Installing a new production line",
      "Buying a factory building",
      "Replacing an engine to extend useful life"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ایسی معمول کی repair جو asset کی عمر، capacity یا quality نہ بڑھائے موجودہ مدت کا expense ہوتی ہے۔ بڑی بہتری یا ایسا replacement جو مستقبل کا فائدہ بڑھائے عموماً capitalize کیا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q65",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/11-2-analyze-and-classify-capitalized-costs-versus-expenses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "operating-expense",
      "repairs",
      "capitalization"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original classification item based on OpenStax's repair-versus-improvement discussion."
  },
  {
    "id": "P235-Q066-SRC",
    "pairId": "P235-Q066",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the principal purpose of hedging?",
    "options": [
      "To guarantee profit without risk",
      "To eliminate every possible loss",
      "To reduce or manage risk from adverse price movements",
      "To avoid taxes"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Hedging کا مقصد کسی موجودہ یا متوقع exposure کے خلاف مخالف پوزیشن لے کر adverse price risk کم کرنا ہے۔ یہ ہر نقصان ختم یا منافع کی ضمانت نہیں دیتا اور hedge کی اپنی cost بھی ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q66, PDF p.5",
      "referenceUrl": "https://www.cftc.gov/About/CFTCReports/acag8.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hedging",
      "risk-management"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Absolute wording in distractors retained to test the distinction between risk reduction and risk elimination."
  },
  {
    "id": "P235-Q066-SIM",
    "pairId": "P235-Q066",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which statement best describes an options-based hedge?",
    "options": [
      "It converts every exposure into tax-free income",
      "It guarantees unlimited profit",
      "It removes the option premium",
      "It can protect against adverse prices while preserving some favorable-price potential"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Option hedge adverse move کے خلاف تحفظ دے سکتا ہے جبکہ موافق حرکت کا کچھ فائدہ برقرار رہتا ہے۔ اس flexibility کی قیمت option premium ہے، اس لیے hedge مفت نہیں ہوتا۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q66",
      "referenceUrl": "https://www.cftc.gov/About/CFTCReports/acag8.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "options-hedge",
      "option-premium"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on CFTC's description of option hedges."
  },
  {
    "id": "P235-Q067-SRC",
    "pairId": "P235-Q067",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is net working capital?",
    "options": [
      "Fixed assets minus current liabilities",
      "Current assets minus current liabilities",
      "Current liabilities minus current assets",
      "Total assets minus total liabilities"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Net working capital کا فارمولا current assets − current liabilities ہے۔ مثبت مقدار short-term obligations کے لیے ایک liquidity cushion کی نشاندہی کر سکتی ہے، اگرچہ بہت زیادہ رقم بھی غیر مؤثر استعمال دکھا سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q67, PDF p.5",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/19-1-what-is-working-capital",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "net-working-capital",
      "liquidity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Clarified that the printed formula refers specifically to net working capital."
  },
  {
    "id": "P235-Q067-SIM",
    "pairId": "P235-Q067",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A company has current assets of Rs. 1.20 million and current liabilities of Rs. 0.75 million. What is its net working capital?",
    "options": [
      "Rs. 0.45 million",
      "Rs. 0.75 million",
      "Rs. 1.20 million",
      "Rs. 1.95 million"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Current assets میں سے current liabilities منہا کی جاتی ہیں۔ 1.20 − 0.75 = 0.45 ملین روپے net working capital ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q67",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/19-1-what-is-working-capital",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "working-capital-calculation",
      "current-assets"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q068-SRC",
    "pairId": "P235-Q068",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Tangible resources expected to provide benefits for more than one period are commonly called:",
    "options": [
      "Current assets",
      "Fixed assets",
      "Liquid assets",
      "Current liabilities"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Fixed assets طویل مدتی tangible resources ہوتے ہیں جو کاروباری عملیات میں ایک سے زیادہ مدت تک استعمال ہوتے ہیں۔ زمین، عمارت اور مشینری عام مثالیں ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q68, PDF p.6",
      "referenceUrl": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fixed-assets",
      "property-plant-equipment"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Stem narrowed to tangible resources; some long-term-benefit resources can instead be intangible assets."
  },
  {
    "id": "P235-Q068-SIM",
    "pairId": "P235-Q068",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which item is normally classified as property, plant and equipment rather than a current asset?",
    "options": [
      "Cash in bank",
      "Production machinery used for five years",
      "Trade receivable due next month",
      "Inventory held for sale"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پانچ سال استعمال ہونے والی production machinery طویل مدتی tangible asset ہے، اس لیے PPE میں آتی ہے۔ Cash، receivable اور inventory عموماً current assets ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q68",
      "referenceUrl": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ppe",
      "asset-classification"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original classification item based on IAS 16."
  },
  {
    "id": "P235-Q069-SRC",
    "pairId": "P235-Q069",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the basic accounting equation?",
    "options": [
      "Assets = Liabilities + Equity",
      "Assets = Equity − Liabilities",
      "Liabilities = Assets + Equity",
      "Equity = Assets + Expenses"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بنیادی accounting equation ہے: Assets = Liabilities + Owner's Equity۔ ہر asset پر یا creditors کا claim ہوتا ہے یا owners کا، اسی لیے equation ہمیشہ balance رہتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q69, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/5-2-the-balance-sheet",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "accounting-equation",
      "assets-liabilities-equity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q069-SIM",
    "pairId": "P235-Q069",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "If total assets are Rs. 1.5 million and total liabilities are Rs. 0.9 million, what is owner's equity?",
    "options": [
      "Rs. 0.4 million",
      "Rs. 2.4 million",
      "Rs. 0.9 million",
      "Rs. 0.6 million"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Accounting equation کو بدل کر Equity = Assets − Liabilities لکھا جاتا ہے۔ 1.5 − 0.9 = 0.6 ملین روپے equity بنتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q69",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/5-2-the-balance-sheet",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "equity-calculation",
      "accounting-equation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q070-SRC",
    "pairId": "P235-Q070",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is contribution margin?",
    "options": [
      "Sales minus fixed cost",
      "Sales minus variable cost",
      "Profit minus expenses",
      "Revenue minus total cost"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Contribution margin = Sales − Variable Costs ہوتا ہے۔ یہ رقم پہلے fixed costs کو cover کرتی ہے اور باقی بچنے پر profit بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q70, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "contribution-margin",
      "variable-cost"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q070-SIM",
    "pairId": "P235-Q070",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A product sells for Rs. 100 per unit and has variable cost of Rs. 60 per unit. What is its unit contribution margin?",
    "options": [
      "Rs. 40",
      "Rs. 60",
      "Rs. 100",
      "Rs. 160"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Unit contribution margin selling price میں سے variable cost منہا کر کے ملتا ہے۔ 100 − 60 = 40 روپے فی یونٹ جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q70",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "unit-contribution-margin",
      "calculation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q071-SRC",
    "pairId": "P235-Q071",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is a contingent liability?",
    "options": [
      "A liability that is always recorded in the balance sheet",
      "An obligation that may or may not materialize",
      "A confirmed debt payable immediately",
      "A type of fixed asset"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Contingent liability ایک ممکنہ ذمہ داری ہوتی ہے جس کا وجود مستقبل کے غیر یقینی واقعے سے واضح ہوتا ہے۔ IAS 37 کے مطابق اسے عام طور پر تسلیم نہیں کیا جاتا بلکہ، جب اخراج کا امکان بعید نہ ہو، مالی بیانات میں افشا کیا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q71, PDF p.6",
      "referenceUrl": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "contingent-liability",
      "ias-37"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source. The option is a simplified description of a possible obligation under IAS 37."
  },
  {
    "id": "P235-Q071-SIM",
    "pairId": "P235-Q071",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Under IAS 37, how is a contingent liability normally treated when the possibility of an outflow is not remote?",
    "options": [
      "Disclosed in the notes but not recognized",
      "Recognized as a fixed asset",
      "Recorded as revenue",
      "Ignored in all circumstances"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Contingent liability کو عام طور پر balance sheet میں بطور liability تسلیم نہیں کیا جاتا۔ اگر وسائل کے اخراج کا امکان بعید نہ ہو تو اس کی نوعیت اور متعلقہ مالی اثرات notes میں افشا کیے جاتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q71",
      "referenceUrl": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "contingent-liability",
      "disclosure"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original practice item based on IAS 37 recognition and disclosure rules."
  },
  {
    "id": "P235-Q072-SRC",
    "pairId": "P235-Q072",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is treasury stock?",
    "options": [
      "Shares issued to the public and permanently outstanding",
      "Shares issued only to employees as a bonus",
      "Government-owned shares in a company",
      "Shares of a company repurchased and held by the company itself"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Treasury stock وہ shares ہیں جنہیں کمپنی جاری کرنے کے بعد خود دوبارہ خرید لیتی ہے۔ یہ shares کمپنی کے پاس رہتے ہیں اور عام طور پر outstanding shares میں شمار نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q72, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/14-1-explain-the-process-of-securing-equity-financing-through-the-issuance-of-stock",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "treasury-stock",
      "shareholders-equity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q072-SIM",
    "pairId": "P235-Q072",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which statement about treasury shares is correct?",
    "options": [
      "They are authorized but never issued",
      "They remain issued but are not outstanding while held by the company",
      "They are liabilities owed to employees",
      "They always carry voting rights while in treasury"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کمپنی کے دوبارہ خریدے گئے treasury shares issued رہتے ہیں مگر کمپنی کے پاس رہنے تک outstanding نہیں ہوتے۔ اسی وجہ سے وہ عام shareholders کی طرح voting یا dividend rights استعمال نہیں کرتے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q72",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/14-1-explain-the-process-of-securing-equity-financing-through-the-issuance-of-stock",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "treasury-shares",
      "outstanding-shares"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original conceptual practice item."
  },
  {
    "id": "P235-Q073-SRC",
    "pairId": "P235-Q073",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the time value of money (TVM)?",
    "options": [
      "Money today is worth more than the same amount in the future",
      "Money loses value over time due to inflation only",
      "Future money is always equal to present money",
      "Money has no time-based value"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Time value of money کے مطابق آج کا ایک روپیہ مستقبل کے ایک روپے سے زیادہ قیمتی ہے۔ آج دستیاب رقم کو invest کر کے return حاصل کیا جا سکتا ہے، اس لیے فرق صرف inflation کی وجہ سے نہیں ہوتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q73, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/7-2-time-value-of-money-tvm-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "time-value-of-money",
      "finance-basics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q073-SIM",
    "pairId": "P235-Q073",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the main financial reason Rs. 10,000 received today is preferable to Rs. 10,000 received one year later?",
    "options": [
      "All prices must fall over time",
      "Future money is legally invalid",
      "Today's amount can earn a return during the year",
      "Bank deposits never earn returns"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "آج ملنے والی رقم کو ایک سال کے لیے invest کیا جا سکتا ہے اور اس پر return کمایا جا سکتا ہے۔ یہی opportunity to earn time value of money کی بنیادی وجہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q73",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/7-2-time-value-of-money-tvm-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "time-value-of-money",
      "opportunity-cost"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original application item."
  },
  {
    "id": "P235-Q074-SRC",
    "pairId": "P235-Q074",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which of the following is a source of inherent risk?",
    "options": [
      "A strong internal audit system",
      "Human error",
      "External confirmation",
      "Audit planning procedures"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Inherent risk کسی assertion کے controls سے پہلے error یا fraud کے باعث materially misstated ہونے کے امکان کو کہتے ہیں۔ دیے گئے اختیارات میں human error اس risk کا ذریعہ بن سکتا ہے، جبکہ باقی audit یا control procedures ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q74, PDF p.6",
      "referenceUrl": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS1101",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "inherent-risk",
      "auditing"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The stem was lightly clarified. PCAOB AS 1101 defines inherent risk as susceptibility to material misstatement due to error or fraud before considering controls."
  },
  {
    "id": "P235-Q074-SIM",
    "pairId": "P235-Q074",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "In audit risk, what is control risk?",
    "options": [
      "The risk that the auditor charges a high fee",
      "The risk that internal control will not prevent or detect and correct a material misstatement",
      "The risk that every transaction is accurate",
      "The risk eliminated entirely by external confirmation"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Control risk یہ امکان ہے کہ entity کا internal control کسی material misstatement کو بروقت روک یا پکڑ کر درست نہ کر سکے۔ یہ inherent risk سے الگ ہے، کیونکہ inherent risk controls کو مدنظر رکھنے سے پہلے دیکھا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q74",
      "referenceUrl": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS1101",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "control-risk",
      "audit-risk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original comparison item based on PCAOB AS 1101."
  },
  {
    "id": "P235-Q075-SRC",
    "pairId": "P235-Q075",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is financial-statement manipulation commonly called?",
    "options": [
      "Financial analysis",
      "Financial reporting",
      "Creative accounting",
      "Budgeting"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Creative accounting میں accounting choices یا transactions کو اس طرح استعمال کیا جاتا ہے کہ financial statements مطلوبہ تاثر دیں۔ جب یہ جان بوجھ کر گمراہ کرے تو یہ manipulation اور ممکنہ fraud بن سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q75, PDF p.6",
      "referenceUrl": "https://www.accaglobal.com/uk/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/massaging-the-figures.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "creative-accounting",
      "financial-reporting"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source uses a broad exam-preparation label; the explanation distinguishes aggressive presentation from fraudulent misstatement."
  },
  {
    "id": "P235-Q075-SIM",
    "pairId": "P235-Q075",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which action is an example of earnings manipulation?",
    "options": [
      "Disclosing an accounting policy",
      "Reconciling the bank statement",
      "Recording fictitious sales to inflate profit",
      "Preparing a cash budget"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "فرضی sales record کرنے سے revenue اور profit دونوں مصنوعی طور پر بڑھ جاتے ہیں۔ یہ faithful financial reporting نہیں بلکہ واضح manipulation ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q75",
      "referenceUrl": "https://www.accaglobal.com/uk/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/massaging-the-figures.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "earnings-manipulation",
      "fictitious-sales"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original scenario-based practice item."
  },
  {
    "id": "P235-Q076-SRC",
    "pairId": "P235-Q076",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the cost of capital?",
    "options": [
      "Total profit earned by a business",
      "Required rate of return on investments",
      "Cost of producing goods only",
      "Dividend paid to shareholders"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Cost of capital وہ required return ہے جو سرمایہ فراہم کرنے والے اپنے funds کے بدلے چاہتے ہیں۔ کمپنی اسے investment projects کے لیے benchmark یا hurdle rate کے طور پر استعمال کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q76, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/17-2-the-costs-of-debt-and-equity-capital",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cost-of-capital",
      "required-return"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q076-SIM",
    "pairId": "P235-Q076",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A project is expected to return 11%, while the firm's appropriate cost of capital is 13%. Based only on this comparison, what should the firm do?",
    "options": [
      "Accept because 11% is positive",
      "Accept because cost of capital is irrelevant",
      "Reject because the return is below the required rate",
      "Reject only if sales decline"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Project کا expected return 11% ہے جبکہ investors کی required rate 13% ہے۔ چونکہ project required return پوری نہیں کرتا، صرف اس criterion کی بنیاد پر اسے reject کیا جائے گا۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q76",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/17-2-the-costs-of-debt-and-equity-capital",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hurdle-rate",
      "investment-decision"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical decision item."
  },
  {
    "id": "P235-Q077-SRC",
    "pairId": "P235-Q077",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is appreciation of a currency?",
    "options": [
      "A decrease in the value of the domestic currency",
      "An increase in the value of the domestic currency against a foreign currency",
      "An increase in the inflation rate",
      "A decrease in export prices"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Currency appreciation کا مطلب ہے کہ domestic currency کی قدر foreign currency کے مقابلے میں بڑھ جائے۔ اس صورت میں ایک unit foreign currency خریدنے کے لیے نسبتاً کم domestic currency درکار ہوتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q77, PDF p.6",
      "referenceUrl": "https://www.elibrary.imf.org/display/book/9781557753038/ch04.xml",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "currency-appreciation",
      "exchange-rate"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q077-SIM",
    "pairId": "P235-Q077",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "If the exchange rate changes from PKR 300 per US dollar to PKR 280 per US dollar, what has happened to the Pakistani rupee against the dollar?",
    "options": [
      "Its value is unchanged",
      "It has depreciated",
      "It has been demonetized",
      "It has appreciated"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اب ایک dollar خریدنے کے لیے 300 کے بجائے 280 روپے درکار ہیں۔ اس لیے dollar کے مقابلے میں پاکستانی روپیہ appreciate ہوا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q77",
      "referenceUrl": "https://www.elibrary.imf.org/display/book/9781557753038/ch04.xml",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exchange-rate",
      "appreciation-calculation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original exchange-rate interpretation item."
  },
  {
    "id": "P235-Q078-SRC",
    "pairId": "P235-Q078",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What does the Security Market Line (SML) represent?",
    "options": [
      "The relationship between risk and return for all possible portfolios",
      "The relationship between systematic risk (beta) and expected return",
      "The relationship between interest rates and inflation",
      "The relationship between dividends and earnings"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Security Market Line CAPM کے تحت expected return اور systematic risk کے تعلق کو دکھاتی ہے۔ اس میں systematic risk کو beta سے ناپا جاتا ہے، total risk سے نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q78, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/15-3-the-capital-asset-pricing-model-capm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "security-market-line",
      "capm"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Minor grammar and punctuation cleanup only."
  },
  {
    "id": "P235-Q078-SIM",
    "pairId": "P235-Q078",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "In the CAPM, which measure appears on the horizontal axis of the Security Market Line?",
    "options": [
      "Standard deviation of total return",
      "Beta",
      "Dividend payout ratio",
      "Current ratio"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "SML کے horizontal axis پر beta ہوتا ہے، جو asset کا systematic یا market risk ظاہر کرتا ہے۔ Vertical axis پر required یا expected return دکھایا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q78",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/15-3-the-capital-asset-pricing-model-capm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "beta",
      "security-market-line"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original CAPM interpretation item."
  },
  {
    "id": "P235-Q079-SRC",
    "pairId": "P235-Q079",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the risk-return trade-off?",
    "options": [
      "Higher risk leads to lower return",
      "Risk and return are unrelated",
      "Higher risk is associated with higher expected return",
      "Return is fixed regardless of risk"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Risk-return trade-off کے مطابق زیادہ risk قبول کرنے والا investor عموماً زیادہ expected return کا مطالبہ کرتا ہے۔ یہ guaranteed actual return نہیں بلکہ مطلوب یا متوقع معاوضہ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q79, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/1-1-what-is-finance",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "risk-return-tradeoff",
      "expected-return"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q079-SIM",
    "pairId": "P235-Q079",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which type of risk can a well-diversified investor largely reduce?",
    "options": [
      "Market-wide recession risk",
      "Systematic market risk",
      "Economy-wide interest-rate risk",
      "Firm-specific risk"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Diversification مختلف assets کو ملا کر firm-specific یا unsystematic risk کم کرتی ہے۔ پورے market کو متاثر کرنے والا systematic risk صرف diversification سے ختم نہیں ہوتا۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q79",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/15-3-the-capital-asset-pricing-model-capm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "diversification",
      "unsystematic-risk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original risk-classification practice item."
  },
  {
    "id": "P235-Q080-SRC",
    "pairId": "P235-Q080",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which authority collects sales tax on services in Punjab?",
    "options": [
      "Federal Board of Revenue (FBR)",
      "State Bank of Pakistan (SBP)",
      "Securities and Exchange Commission of Pakistan (SECP)",
      "Punjab Revenue Authority (PRA)"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Punjab میں taxable services پر sales tax پنجاب کے صوبائی قانون کے تحت عائد ہوتا ہے۔ اس tax کی administration اور collection Punjab Revenue Authority یعنی PRA کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q80, PDF p.6",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/PTMS/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pra",
      "sales-tax-on-services"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Abbreviations in the printed options were expanded for clarity."
  },
  {
    "id": "P235-Q080-SIM",
    "pairId": "P235-Q080",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which tax is administered by the Punjab Revenue Authority?",
    "options": [
      "Punjab sales tax on services",
      "Federal customs duty",
      "Federal income tax on salaries",
      "Capital gains tax on listed shares"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "PRA کا بنیادی دائرۂ کار Punjab Sales Tax on Services Act کے تحت services tax ہے۔ Federal customs اور income tax جیسے محصولات FBR کے دائرے میں آتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q80",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%202-%20SCOPE%20OF%20TAX.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pra",
      "provincial-tax"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original jurisdiction practice item."
  },
  {
    "id": "P235-Q081-SRC",
    "pairId": "P235-Q081",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Under the Punjab Sales Tax on Services Act, what happens when the tax rate changes during a tax period?",
    "options": [
      "No action is required",
      "A separate return is filed for each affected portion of the tax period",
      "Previous tax returns are cancelled",
      "Tax collection stops"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اگر ایک tax period کے دوران tax rate تبدیل ہو تو ہر مختلف rate والے حصے کے لیے الگ return furnish کیا جاتا ہے۔ Punjab Sales Tax on Services Act 2012 کی section 35(5) یہی طریقہ مقرر کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q81, PDF p.6",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%206-%20RETURNS.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pra-return",
      "tax-rate-change"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The answer was made more precise: section 35(5) requires a separate return for each portion of the tax period showing the different applicable rates."
  },
  {
    "id": "P235-Q081-SIM",
    "pairId": "P235-Q081",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "If the Punjab sales-tax rate changes, which rate applies to a taxable service?",
    "options": [
      "No rate applies during the transition",
      "The oldest rate ever notified",
      "The rate selected by the service provider",
      "The rate in force when the service is provided"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Punjab law کی section 13 کے مطابق وہ rate لاگو ہوتا ہے جو service فراہم کیے جانے کے وقت نافذ ہو۔ Return میں مختلف rates والے tax-period portions کو الگ دکھانے کی requirement بھی اسی تبدیلی کو درست طور پر report کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q81",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%202-%20SCOPE%20OF%20TAX.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "applicable-tax-rate",
      "pra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original statutory-rule practice item based on section 13."
  },
  {
    "id": "P235-Q082-SRC",
    "pairId": "P235-Q082",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which concept divides the continuous life of a business into equal time periods to measure performance?",
    "options": [
      "Going-concern concept",
      "Accounting-period concept",
      "Matching concept",
      "Cost concept"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Accounting-period concept کاروبار کی مسلسل زندگی کو مقررہ reporting periods میں تقسیم کرتا ہے۔ اس طرح ہر period کی performance اور financial position الگ ناپی اور report کی جا سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q82, PDF p.6",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/3-1-describe-principles-assumptions-and-concepts-of-accounting-and-their-relationship-to-financial-statements",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "accounting-period",
      "accounting-concepts"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Grammar was cleaned without changing the tested concept."
  },
  {
    "id": "P235-Q082-SIM",
    "pairId": "P235-Q082",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which is a valid reporting period under the accounting-period assumption?",
    "options": [
      "An unlimited period with no closing date",
      "Only the full life of the business",
      "Only the period after liquidation",
      "A month, quarter, or year"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Accounting information ماہانہ، quarterly یا annual periods کے لیے تیار کی جا سکتی ہے۔ مقصد indefinite business life کو مفید اور قابلِ موازنہ reporting intervals میں تقسیم کرنا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q82",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/3-1-describe-principles-assumptions-and-concepts-of-accounting-and-their-relationship-to-financial-statements",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "reporting-period",
      "periodicity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original application item."
  },
  {
    "id": "P235-Q083-SRC",
    "pairId": "P235-Q083",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is synergy?",
    "options": [
      "A decrease in company value after a merger",
      "The combined effect being greater than the sum of the individual effects",
      "Separation of business activities",
      "A reduction in production cost only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Synergy اس وقت ہوتی ہے جب دو businesses کا combined value یا benefit ان کی الگ الگ values کے مجموعے سے زیادہ ہو۔ اسے عام طور پر 1 + 1 > 2 کے تصور سے سمجھایا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q83, PDF p.6",
      "referenceUrl": "https://corporatefinanceinstitute.com/resources/valuation/synergy/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synergy",
      "mergers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q083-SIM",
    "pairId": "P235-Q083",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which situation is an example of cost synergy after a merger?",
    "options": [
      "Reducing revenue without reducing cost",
      "Paying twice for the same warehouse",
      "Maintaining two identical head offices indefinitely",
      "Eliminating duplicate administrative departments"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Duplicate departments ختم کرنے سے مشترکہ business کے administrative costs کم ہو سکتے ہیں۔ یہ cost synergy ہے کیونکہ merger کے بعد وہ efficiency حاصل ہوتی ہے جو الگ operations میں موجود نہیں تھی۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q83",
      "referenceUrl": "https://corporatefinanceinstitute.com/resources/valuation/synergy/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cost-synergy",
      "merger-benefits"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original scenario-based practice item."
  },
  {
    "id": "P235-Q084-SRC",
    "pairId": "P235-Q084",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which manager primarily makes financing and investment decisions rather than production decisions?",
    "options": [
      "Production manager",
      "Operations manager",
      "Marketing manager",
      "Financial manager"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Financial manager کے بنیادی کام financing، investment، cash-flow planning اور مالی risk کے فیصلے ہیں۔ Production manager اور operations manager پیداوار چلاتے ہیں، اس لیے دیے گئے فرق کے مطابق Financial manager درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q84, PDF p.6",
      "referenceUrl": "https://openstax.org/books/introduction-business/pages/16-1-the-role-of-finance-and-the-financial-manager",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "financial-manager",
      "business-functions"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed question merely asked who does not make production decisions, which also made Marketing manager defensible. The stem now tests the defining financing-and-investment role, making Financial manager unique."
  },
  {
    "id": "P235-Q084-SIM",
    "pairId": "P235-Q084",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which decision is a core responsibility of a financial manager?",
    "options": [
      "Inspecting every finished unit",
      "Scheduling factory workers for tomorrow's shift",
      "Selecting the firm's mix of debt and equity",
      "Designing the product's packaging artwork"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Debt اور equity کے مناسب mix کا فیصلہ capital structure یا financing decision ہے۔ یہ financial manager کی بنیادی ذمہ داریوں میں شامل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q84",
      "referenceUrl": "https://openstax.org/books/introduction-business/pages/16-1-the-role-of-finance-and-the-financial-manager",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "capital-structure",
      "financial-management"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original functional-responsibility practice item."
  },
  {
    "id": "P235-Q085-SRC",
    "pairId": "P235-Q085",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Under the general rule in Punjab, who is liable to pay sales tax on a locally provided taxable service?",
    "options": [
      "The buyer of the service",
      "The registered service provider",
      "The government",
      "An exporter only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Punjab Sales Tax on Services Act کی section 11(1) کے عام rule کے تحت registered service provider tax ادا کرنے کا ذمہ دار ہے۔ تاہم imported یا notified services میں recipient یا کوئی دوسرا شخص بھی liable ہو سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q85, PDF p.6",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%202-%20SCOPE%20OF%20TAX.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tax-liability",
      "service-provider"
    ],
    "verificationStatus": "verified-with-caveat",
    "sourceNotes": "The source stem was overly broad. It was narrowed to the general rule for a locally provided taxable service; sections 11(2)–(3) contain recipient and notified-person exceptions."
  },
  {
    "id": "P235-Q085-SIM",
    "pairId": "P235-Q085",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Who is liable for Punjab sales tax when a listed service is provided by a non-resident person to a resident person under section 3(2)?",
    "options": [
      "The State Bank of Pakistan",
      "The foreign provider in every case",
      "The recipient of the service",
      "No person is liable"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Section 3(2) والی service میں non-resident provider resident person کو service دیتا ہے۔ Section 11(2) کے مطابق ایسی صورت میں tax liability service recipient پر ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q85",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%202-%20SCOPE%20OF%20TAX.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "reverse-charge",
      "service-recipient"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original statutory-exception practice item based on sections 3(2) and 11(2)."
  },
  {
    "id": "P235-Q086-SRC",
    "pairId": "P235-Q086",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which activity is not considered an economic activity under the Punjab Sales Tax on Services Act?",
    "options": [
      "Farming",
      "Trading",
      "Manufacturing",
      "A private recreational pursuit or hobby"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "قانون کے مطابق private recreational pursuit یا hobby، جسے کاروباری مقصد سے نہ کیا جائے، economic activity میں شامل نہیں۔ Trading اور manufacturing جیسی مسلسل business activities اس تعریف میں آتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q86, PDF p.6",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "economic-activity",
      "pra-law"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed option 'Recreational activity' was made legally precise as a private recreational pursuit or hobby."
  },
  {
    "id": "P235-Q086-SIM",
    "pairId": "P235-Q086",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Can a one-time transaction be an economic activity under the Punjab Sales Tax on Services Act?",
    "options": [
      "Yes, if it is in the nature of trade or business",
      "No, because every activity must continue for five years",
      "Only if it is a private hobby",
      "Only if it makes a loss"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Economic activity کے لیے ہمیشہ مسلسل transactions ضروری نہیں ہوتے۔ اگر ایک isolated transaction بھی trade یا business کی نوعیت رکھتا ہو تو قانون کے تحت economic activity ہو سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q86",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "isolated-transaction",
      "economic-activity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original definition-based practice item."
  },
  {
    "id": "P235-Q087-SRC",
    "pairId": "P235-Q087",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Small and medium enterprises (SMEs) contribute to:",
    "options": [
      "Only large-scale exports",
      "Employment and economic growth",
      "Government borrowing",
      "An increase in foreign debt"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "SMEs روزگار پیدا کرنے، entrepreneurship بڑھانے اور economic growth میں اہم کردار ادا کرتے ہیں۔ ان کا اثر صرف large-scale exports تک محدود نہیں ہوتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q87, PDF p.6",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/157191468326714061/pdf/835080WP0IFC0J00Box382079B00PUBLIC0.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "smes",
      "employment"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q087-SIM",
    "pairId": "P235-Q087",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Why are SMEs especially important in many developing economies?",
    "options": [
      "They eliminate the need for all large firms",
      "They provide a large share of employment",
      "They can never fail",
      "They finance all government debt"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "بہت سی developing economies میں SMEs employment کا بڑا حصہ فراہم کرتے ہیں۔ اسی لیے بہتر SME finance اور business environment روزگار اور inclusive growth کے لیے اہم سمجھے جاتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q87",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/157191468326714061/pdf/835080WP0IFC0J00Box382079B00PUBLIC0.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sme-development",
      "job-creation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original development-finance practice item."
  },
  {
    "id": "P235-Q088-SRC",
    "pairId": "P235-Q088",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which expense may be tax-deductible when it is incurred for business purposes?",
    "options": [
      "Personal expenses",
      "Interest expense",
      "The capital cost of purchasing an asset",
      "Owner's drawings"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Pakistan Income Tax Ordinance کی section 28 کے تحت business میں استعمال ہونے والے debt پر profit یا interest عام طور پر deductible ہو سکتا ہے۔ Deduction صرف business-use حصے اور دوسری قانونی restrictions کے تابع ہے؛ personal expense یا drawings deductible نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q88, PDF p.6",
      "referenceUrl": "https://www.fbr.gov.pk/Categ/Income-Tax-Ordinance/326/1000",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tax-deduction",
      "interest-expense"
    ],
    "verificationStatus": "verified-with-caveat",
    "sourceNotes": "The printed question was too general. It was qualified because interest is not automatically deductible in every circumstance; section 28 requires business use and other provisions can restrict deduction."
  },
  {
    "id": "P235-Q088-SIM",
    "pairId": "P235-Q088",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which payment is generally not deductible in computing business income?",
    "options": [
      "Office rent incurred for the business",
      "Interest on debt used wholly in the business, subject to law",
      "Employee wages incurred for the business",
      "The proprietor's personal household expense"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Proprietor کا ذاتی household expense business income کمانے کے لیے incurred نہیں ہوتا۔ اس لیے اسے business deduction کے طور پر claim نہیں کیا جا سکتا، جبکہ حقیقی business expenses متعلقہ قانونی شرائط کے تحت deductible ہو سکتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q88",
      "referenceUrl": "https://www.fbr.gov.pk/Categ/Income-Tax-Ordinance/326/1000",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "personal-expense",
      "business-deduction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original qualification-based practice item."
  },
  {
    "id": "P235-Q089-SRC",
    "pairId": "P235-Q089",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Tax on salary is categorized under:",
    "options": [
      "Sales tax",
      "Excise duty",
      "Income tax",
      "Customs duty"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Salary ایک head of income ہے اور اس پر applicable levy income tax ہوتی ہے۔ Employer متعلقہ قانون کے مطابق salary payment سے tax withhold کر کے جمع کراتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q89, PDF p.6",
      "referenceUrl": "https://www.fbr.gov.pk/Categ/Income-Tax-Ordinance/326/1000",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "salary-income",
      "income-tax"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The options continued from PDF page 6 to page 7; all four were preserved."
  },
  {
    "id": "P235-Q089-SIM",
    "pairId": "P235-Q089",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Under Pakistan's Income Tax Ordinance, when is salary generally Pakistan-source income?",
    "options": [
      "Whenever the employee buys imported goods",
      "Only when paid in cash",
      "Only when the employer is a bank",
      "When the employment is exercised in Pakistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Employment پاکستان میں exercise کیا جائے تو اس سے حاصل salary عام طور پر Pakistan-source income ہوتی ہے۔ Payment کہاں یا کس form میں ہوئی، یہ اکیلا فیصلہ کن معیار نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q89",
      "referenceUrl": "https://www.fbr.gov.pk/section-101/152706",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan-source",
      "salary-tax"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original source-rule practice item based on section 101."
  },
  {
    "id": "P235-Q090-SRC",
    "pairId": "P235-Q090",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Net assets equal:",
    "options": [
      "Total liabilities minus total assets",
      "Total assets minus total liabilities",
      "Capital plus drawings",
      "Revenue minus expenses"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Accounting equation کے مطابق assets = liabilities + equity ہوتا ہے۔ اسے rearrange کرنے پر net assets یا equity = total assets − total liabilities ملتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q90, PDF p.7",
      "referenceUrl": "https://openstax.org/books/introduction-business/pages/14-3-basic-accounting-procedures",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "net-assets",
      "accounting-equation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q090-SIM",
    "pairId": "P235-Q090",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A business has total assets of Rs. 900,000 and total liabilities of Rs. 340,000. What are its net assets?",
    "options": [
      "Rs. 1,240,000",
      "Rs. 560,000",
      "Rs. 340,000",
      "Rs. 900,000"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Net assets نکالنے کے لیے liabilities کو assets سے منہا کیا جاتا ہے۔ Rs. 900,000 − Rs. 340,000 = Rs. 560,000 درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q90",
      "referenceUrl": "https://openstax.org/books/introduction-business/pages/14-3-basic-accounting-procedures",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "net-assets-calculation",
      "equity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q091-SRC",
    "pairId": "P235-Q091",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Prime cost consists of:",
    "options": [
      "Direct materials + direct labour + direct expenses",
      "Indirect materials + indirect labour",
      "Factory overhead only",
      "Selling and distribution cost"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Prime cost تمام direct costs کا مجموعہ ہے۔ ACCA کی استعمال کردہ تعریف کے مطابق اس میں direct materials، direct labour اور direct expenses شامل ہوتے ہیں، مگر production overhead شامل نہیں ہوتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q91, PDF p.7",
      "referenceUrl": "https://www.accaglobal.com/content/dam/acca/global/PDF-students/EC/2012-d/t7_2009_dec_q.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prime-cost",
      "direct-costs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source; the ACCA/UK convention explicitly includes direct expenses in prime cost."
  },
  {
    "id": "P235-Q091-SIM",
    "pairId": "P235-Q091",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A product has direct material cost of Rs. 40, direct labour cost of Rs. 25, and direct expenses of Rs. 5 per unit. What is its prime cost per unit?",
    "options": [
      "Rs. 70",
      "Rs. 65",
      "Rs. 45",
      "Rs. 30"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Prime cost = direct materials + direct labour + direct expenses ہوتا ہے۔ Rs. 40 + Rs. 25 + Rs. 5 = Rs. 70 فی unit درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q91",
      "referenceUrl": "https://www.accaglobal.com/content/dam/acca/global/PDF-students/EC/2012-d/t7_2009_dec_q.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prime-cost-calculation",
      "cost-accounting"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item using the ACCA convention."
  },
  {
    "id": "P235-Q092-SRC",
    "pairId": "P235-Q092",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "In a common-size income statement, each line item is normally expressed as a percentage of:",
    "options": [
      "Net sales",
      "Total liabilities",
      "Closing cash balance",
      "Prior-year profit"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Common-size income statement میں net sales کو 100 فیصد مانا جاتا ہے اور باقی line items اسی کے فیصد میں دکھائی جاتی ہیں۔ Vertical analysis کی تعریف کسی خاص سال تک محدود نہیں بلکہ statement کے اندر base item سے comparison ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q92, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/a-financial-statement-analysis",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vertical-analysis",
      "common-size-statements"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed question treated 'current-year figures' as the defining base of vertical analysis, but vertical analysis can be prepared for any period. The item was rebuilt around the defining income-statement base, net sales."
  },
  {
    "id": "P235-Q092-SIM",
    "pairId": "P235-Q092",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "In vertical analysis of a balance sheet, asset accounts are normally expressed as a percentage of:",
    "options": [
      "Closing cash only",
      "Net sales",
      "Prior-year net income",
      "Total assets"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Common-size balance sheet میں total assets کو 100 فیصد مان کر ہر asset account کو total assets کے فیصد میں دکھایا جاتا ہے۔ Net sales income statement کا عام base ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q92",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/a-financial-statement-analysis",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "common-size-balance-sheet",
      "total-assets"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original base-line practice item."
  },
  {
    "id": "P235-Q093-SRC",
    "pairId": "P235-Q093",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What does net profit margin indicate?",
    "options": [
      "Total sales",
      "Profitability",
      "Cash available",
      "Total-asset efficiency"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Net profit margin net income کو sales کے percentage کے طور پر ظاہر کرتا ہے۔ یہ profitability ratio بتاتا ہے کہ ہر rupee of sales میں سے تمام expenses کے بعد کتنا net profit بچا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q93, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/6-6-profitability-ratios-and-the-dupont-method",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "net-profit-margin",
      "profitability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q093-SIM",
    "pairId": "P235-Q093",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A company reports net income of Rs. 20,000 and net sales of Rs. 200,000. What is its net profit margin?",
    "options": [
      "10%",
      "5%",
      "20%",
      "90%"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Net profit margin = net income ÷ net sales × 100 ہوتا ہے۔ Rs. 20,000 ÷ Rs. 200,000 × 100 = 10% درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q93",
      "referenceUrl": "https://openstax.org/books/principles-finance/pages/6-6-profitability-ratios-and-the-dupont-method",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "profit-margin-calculation",
      "net-income"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q094-SRC",
    "pairId": "P235-Q094",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is short-paid tax?",
    "options": [
      "Tax paid in excess to the government",
      "Tax paid more than the liability",
      "Tax paid less than the actual tax liability",
      "Tax refunded by the government"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Short-paid tax اس وقت ہوتا ہے جب ادا کیا گیا tax اصل واجب الادا liability سے کم ہو۔ Punjab law کی definition میں miscalculation یا incorrect assessment کی وجہ سے کم payment بھی شامل ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q94, PDF p.7",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "short-paid-tax",
      "tax-liability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Minor grammar cleanup only."
  },
  {
    "id": "P235-Q094-SIM",
    "pairId": "P235-Q094",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A registered person has actual tax liability of Rs. 150,000 but pays Rs. 125,000 because of a miscalculation. How much tax is short-paid?",
    "options": [
      "Rs. 25,000",
      "Rs. 125,000",
      "Rs. 150,000",
      "Rs. 275,000"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Short-paid amount اصل liability اور paid amount کا فرق ہے۔ Rs. 150,000 − Rs. 125,000 = Rs. 25,000 short-paid tax بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q94",
      "referenceUrl": "https://reg.pra.punjab.gov.pk/ptms/SOP/Download/SalesTaxAct2012/Chapter%201-%20PRELIMINARY.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "short-payment-calculation",
      "pra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q095-SRC",
    "pairId": "P235-Q095",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What does a VaR of Rs. 5 million at 99% confidence mean for the stated holding period?",
    "options": [
      "The loss will always be Rs. 5 million",
      "The profit will be Rs. 5 million",
      "The loss is not expected to exceed Rs. 5 million with 99% confidence",
      "The loss will exceed Rs. 5 million with 99% confidence"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Model assumptions کے تحت 99% VaR کا مطلب ہے کہ stated holding period میں loss threshold Rs. 5 million سے تجاوز نہ کرنے کا 99% confidence ہے۔ تقریباً 1% tail میں loss اس حد سے زیادہ ہو سکتا ہے، اس لیے Rs. 5 million maximum possible loss نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q95, PDF p.7",
      "referenceUrl": "https://www.bis.org/basel_framework/chapter/MAR/30.htm?inforce=20191215&published=20191215&tldate=20190203",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "value-at-risk",
      "confidence-level"
    ],
    "verificationStatus": "verified-with-caveat",
    "sourceNotes": "The holding-period qualifier was added because a VaR figure is incomplete without a horizon. The printed answer is otherwise the standard simplified interpretation."
  },
  {
    "id": "P235-Q095-SIM",
    "pairId": "P235-Q095",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Under a correctly specified model, a one-day VaR of Rs. 2 million at 99% confidence leaves approximately what probability that the one-day loss will exceed Rs. 2 million?",
    "options": [
      "50%",
      "1%",
      "99%",
      "100%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "99% confidence threshold کے باہر تقریباً 1% tail باقی رہتی ہے۔ اس لیے model کے مطابق تقریباً 1% chance ہے کہ one-day loss Rs. 2 million سے بڑھ جائے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q95",
      "referenceUrl": "https://www.bis.org/basel_framework/chapter/MAR/30.htm?inforce=20191215&published=20191215&tldate=20190203",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "var-tail-probability",
      "market-risk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original probability-interpretation practice item."
  },
  {
    "id": "P235-Q096-SRC",
    "pairId": "P235-Q096",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "A company that does not want to dilute ownership may issue:",
    "options": [
      "Equity shares",
      "Preference shares",
      "Debentures",
      "Stock dividends"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Debentures debt financing ہیں، اس لیے ان کے issue سے existing owners کی voting ownership عام طور پر dilute نہیں ہوتی۔ اس کے بدلے کمپنی پر interest اور principal کی contractual payment obligations آتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q96, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/14-1-explain-the-process-of-securing-equity-financing-through-the-issuance-of-stock",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "debentures",
      "ownership-dilution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source. Preference shares can have varying rights, but they are still an equity-class security; debentures are the unambiguous debt answer."
  },
  {
    "id": "P235-Q096-SIM",
    "pairId": "P235-Q096",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "What is a key trade-off when a company uses debt instead of issuing new ordinary shares to avoid ownership dilution?",
    "options": [
      "It eliminates all financial risk",
      "It assumes fixed interest and repayment obligations",
      "It never has to repay investors",
      "It automatically increases voting shares"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Debt existing voting ownership کو dilute نہیں کرتا، مگر company کو interest اور principal ادا کرنا پڑتا ہے۔ زیادہ fixed obligations financial risk بڑھا سکتی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q96",
      "referenceUrl": "https://www.investor.gov/introduction-investing/investing-basics/glossary/bonds-corporate",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "debt-financing",
      "financial-risk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original financing trade-off practice item."
  },
  {
    "id": "P235-Q097-SRC",
    "pairId": "P235-Q097",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is capital budgeting?",
    "options": [
      "Day-to-day expense management",
      "Planning and evaluation of long-term investment projects",
      "Calculation of profit and loss",
      "Management of current assets only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Capital budgeting long-term investment proposals کی شناخت، evaluation اور selection کا عمل ہے۔ مثالوں میں نئی machinery، plant expansion اور بڑے projects شامل ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q97, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/11-1-describe-capital-investment-decisions-and-how-they-are-applied",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "capital-budgeting",
      "long-term-investment"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q097-SIM",
    "pairId": "P235-Q097",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which decision is a capital-budgeting decision?",
    "options": [
      "Whether to purchase a new production plant",
      "How much petty cash to keep today",
      "Which supplier invoice to pay this afternoon",
      "How to record this month's utility bill"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "نیا production plant خریدنا بڑا اور long-term capital investment ہے۔ Petty cash یا routine bill payment short-term operating یا working-capital matters ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q97",
      "referenceUrl": "https://openstax.org/books/principles-managerial-accounting/pages/11-1-describe-capital-investment-decisions-and-how-they-are-applied",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "capital-investment",
      "project-selection"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original classification practice item."
  },
  {
    "id": "P235-Q098-SRC",
    "pairId": "P235-Q098",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "Which business characteristic is cash-flow information especially useful for assessing?",
    "options": [
      "Profitability alone",
      "Liquidity",
      "Market share",
      "The historical cost of fixed assets"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Cash-flow information بتاتی ہے کہ business cash generate اور use کیسے کرتا ہے، اس لیے liquidity assessment میں خاص طور پر مفید ہے۔ Profit اور cash ایک چیز نہیں؛ profitable entity بھی short-term cash shortage کا شکار ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q98, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/16-5-use-information-from-the-statement-of-cash-flows-to-prepare-ratios-to-assess-liquidity-and-solvency",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cash-flow",
      "liquidity"
    ],
    "verificationStatus": "verified-with-caveat",
    "sourceNotes": "The vague printed stem 'What does Cash Flow measure' was clarified. Cash-flow information also supports solvency analysis, but liquidity is the best answer among the printed options."
  },
  {
    "id": "P235-Q098-SIM",
    "pairId": "P235-Q098",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Which three classifications appear in a statement of cash flows?",
    "options": [
      "Revenue, expense, and drawings",
      "Assets, liabilities, and equity",
      "Operating, investing, and financing",
      "Budgeted, standard, and actual"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Statement of cash flows cash movements کو operating، investing اور financing activities میں classify کرتی ہے۔ یہ categories cash کے ذرائع اور استعمال کو سمجھنے میں مدد دیتی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q98",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/16-5-use-information-from-the-statement-of-cash-flows-to-prepare-ratios-to-assess-liquidity-and-solvency",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cash-flow-statement",
      "cash-flow-classification"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original statement-structure practice item."
  },
  {
    "id": "P235-Q099-SRC",
    "pairId": "P235-Q099",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "What is the payback period?",
    "options": [
      "The time required to recover the initial investment cost from cash inflows",
      "The time required to earn profit after tax",
      "The time required to calculate depreciation",
      "The time required to double an investment"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Payback period وہ وقت ہے جس میں project کے cumulative cash inflows ابتدائی investment کو recover کر لیتے ہیں۔ سادہ payback method عموماً time value of money اور recovery کے بعد کے cash flows کو ignore کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q99, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/16-1-payback-period-method",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "payback-period",
      "capital-budgeting"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "No substantive change from the printed source."
  },
  {
    "id": "P235-Q099-SIM",
    "pairId": "P235-Q099",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "A project costs Rs. 100,000 and generates equal annual cash inflows of Rs. 25,000. What is its simple payback period?",
    "options": [
      "2 years",
      "4 years",
      "5 years",
      "25 years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Equal annual inflows کی صورت میں payback period = initial investment ÷ annual cash inflow ہوتا ہے۔ Rs. 100,000 ÷ Rs. 25,000 = 4 years درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q99",
      "referenceUrl": "https://openstax.org/books/principles-finance-2e/pages/16-1-payback-period-method",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "payback-calculation",
      "project-evaluation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original numerical practice item."
  },
  {
    "id": "P235-Q100-SRC",
    "pairId": "P235-Q100",
    "kind": "source",
    "categoryId": "job-related-finance-taxation",
    "question": "If an advance payment was initially recorded entirely as an expense, which adjusting entry recognizes the unexpired portion as a prepaid expense?",
    "options": [
      "Debit Expense Account and credit Cash Account",
      "Debit Prepaid Expense Account and credit Expense Account",
      "Debit Cash Account and credit Prepaid Expense Account",
      "Debit Expense Account and credit Prepaid Expense Account"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اگر advance payment پہلے مکمل طور پر expense debit کر دی گئی ہو تو unexpired حصہ asset میں منتقل کرنے کے لیے Prepaid Expense debit اور Expense credit کیا جاتا ہے۔ عام asset-first method میں initial payment پر Prepaid Expense debit اور Cash credit ہوتا ہے، اس لیے original generic stem کا ایک ہی درست جواب نہیں تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 235, Q100, PDF p.7",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/4-2-discuss-the-adjustment-process-and-illustrate-common-types-of-adjusting-entries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prepaid-expense",
      "adjusting-entry"
    ],
    "verificationStatus": "verified-with-reconstruction",
    "sourceNotes": "The printed stem was merely 'What is the journal entry for prepaid expenses' and keyed option B. That wording is ambiguous: an initial prepayment is debit Prepaid Expense/credit Cash, while expiry is debit Expense/credit Prepaid Expense. The stem was substantively reconstructed to the expense-first correcting adjustment for which printed option B is valid."
  },
  {
    "id": "P235-Q100-SIM",
    "pairId": "P235-Q100",
    "kind": "similar",
    "categoryId": "job-related-finance-taxation",
    "question": "Under the asset-first method, what adjusting entry records the portion of prepaid insurance that has expired?",
    "options": [
      "Debit Prepaid Insurance and credit Cash",
      "Debit Prepaid Insurance and credit Insurance Expense",
      "Debit Cash and credit Insurance Expense",
      "Debit Insurance Expense and credit Prepaid Insurance"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Insurance کے استعمال شدہ حصے کو asset سے expense میں transfer کیا جاتا ہے۔ اس لیے Insurance Expense debit اور Prepaid Insurance credit ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original practice question paired with Paper 235, Q100",
      "referenceUrl": "https://openstax.org/books/principles-financial-accounting/pages/4-2-discuss-the-adjustment-process-and-illustrate-common-types-of-adjusting-entries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "prepaid-insurance",
      "expense-recognition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Original adjusting-entry practice item."
  },
  {
    "id": "P236-Q001-SRC",
    "pairId": "P236-Q001",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "According to verified reporting after the December 2025 Bondi Beach attack, Naveed Akram was a citizen of which country?",
    "options": [
      "Pakistan",
      "India",
      "Morocco",
      "Australia"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "معتبر بعد کی تحقیق کے مطابق نوید اکرم آسٹریلیا میں پیدا ہونے والا آسٹریلوی شہری تھا اور اس نے آسٹریلوی پاسپورٹ استعمال کیا۔ اس کے والد ساجد اکرم بھارتی شہری تھے؛ دونوں کی شہریت کو آپس میں ملانا درست نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q1, PDF p.8",
      "referenceUrl": "https://www.aap.com.au/factcheck/false-claims-circulate-about-bondi-beach-shooters-nationality/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bondi-beach",
      "australia",
      "current-affairs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed key says India, apparently conflating Naveed with his father Sajid. AAP FactCheck reports that Naveed was an Australian-born citizen, while Sajid was the Indian citizen. Australia replaces one distractor and is scored as the corrected answer."
  },
  {
    "id": "P236-Q001-SIM",
    "pairId": "P236-Q001",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On which date did the Bondi Beach shootings connected with Operation Arques occur?",
    "options": [
      "14 December 2025",
      "17 December 2025",
      "10 June 2026",
      "12 August 2026"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "آسٹریلوی کامن ویلتھ ڈائریکٹر آف پبلک پراسیکیوشنز کے مطابق فائرنگ کا واقعہ اتوار 14 دسمبر 2025 کو ہوا۔ 17 دسمبر مقدمہ حوالے اور ابتدائی الزامات عائد کیے جانے کی تاریخ تھی، اس لیے اسے واقعے کی تاریخ نہ سمجھیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q1",
      "referenceUrl": "https://www.cdpp.gov.au/prosecution-naveed-akram",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bondi-beach",
      "operation-arques",
      "dates"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q002-SRC",
    "pairId": "P236-Q002",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which of the following countries belongs to both the Scandinavian and Nordic regions?",
    "options": [
      "Finland",
      "Uruguay",
      "Norway",
      "Estonia"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ناروے اسکینڈینیویا کے بنیادی ممالک میں بھی شامل ہے اور سرکاری نورڈک تعاون کے پانچ خود مختار ممالک میں بھی۔ فن لینڈ نورڈک ملک ہے مگر عام جغرافیائی استعمال میں اسکینڈینیویا کا حصہ نہیں، جبکہ یوراگوئے اور ایسٹونیا دونوں فہرستوں میں نہیں آتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q2, PDF p.8",
      "referenceUrl": "https://www.norden.org/en/information/facts-about-nordic-countries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "norway",
      "scandinavia",
      "nordic-region"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q002-SIM",
    "pairId": "P236-Q002",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "How many sovereign countries form the core Nordic group?",
    "options": [
      "Three",
      "Four",
      "Eight",
      "Five"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بنیادی نورڈک ممالک ڈنمارک، فن لینڈ، آئس لینڈ، ناروے اور سویڈن ہیں، یعنی کل پانچ خود مختار ممالک۔ گرین لینڈ، جزائر فارو اور آلاند بھی وسیع نورڈک خطے میں شامل ہیں، مگر وہ الگ خود مختار ریاستیں نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q2",
      "referenceUrl": "https://www.norden.org/en/information/facts-about-nordic-countries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nordic-countries",
      "regional-groups",
      "five"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q003-SRC",
    "pairId": "P236-Q003",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "In which country was the 1955 Bandung Conference held?",
    "options": [
      "Pakistan",
      "India",
      "Indonesia",
      "China"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ایشیا افریقہ کانفرنس 18 سے 24 اپریل 1955 تک انڈونیشیا کے شہر بانڈونگ میں منعقد ہوئی۔ انڈونیشیا میزبان ملک تھا اور صدر سوکارنو نے افتتاحی خطاب کیا، اس لیے درست جواب انڈونیشیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q3, PDF p.8",
      "referenceUrl": "https://mkaa.kemlu.go.id/halaman/KAA-1955",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bandung-conference",
      "indonesia",
      "1955"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q003-SIM",
    "pairId": "P236-Q003",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which city hosted the Asian-African Conference in April 1955?",
    "options": [
      "Jakarta",
      "Bandung",
      "Bogor",
      "Surabaya"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "انڈونیشیا نے کانفرنس کی میزبانی کی اور صدر سوکارنو نے بانڈونگ کو مقام کے طور پر منتخب کیا۔ اسی نسبت سے اسے بانڈونگ کانفرنس کہا جاتا ہے؛ جکارتہ ملک کا دارالحکومت ضرور ہے مگر اس کانفرنس کا میزبان شہر نہیں تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q3",
      "referenceUrl": "https://mkaa.kemlu.go.id/halaman/KAA-1955",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bandung",
      "asian-african-conference",
      "host-city"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q004-SRC",
    "pairId": "P236-Q004",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which listed Pakistani fertilizer group states that it is Pakistan's sole producer of ammonium nitrate crystal?",
    "options": [
      "Engro",
      "Fatima Fertilizer",
      "FFC",
      "Pakarab"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Fatima Group کے سرکاری fertilizer page پر اسے پاکستان میں Ammonium Nitrate Crystal کا واحد producer بتایا گیا ہے۔ اسی لیے دیے گئے اداروں میں Fatima Fertilizer درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q4, PDF p.8",
      "referenceUrl": "https://www.fatima-group.com/fertilizer/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fertilizer",
      "fatima-group",
      "nitrogen"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed key is Fatima Fertilizer, but its current official page does not support the scan's '34% nitrogen fertilizer' wording. The item is rebuilt around the directly stated fact that Fatima Group is Pakistan's sole producer of AN Crystal."
  },
  {
    "id": "P236-Q004-SIM",
    "pairId": "P236-Q004",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What nitrogen percentage is stated for Sarsabz Calcium Ammonium Nitrate (CAN)?",
    "options": [
      "22%",
      "46%",
      "34%",
      "26%"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Fatima Group کے سرکاری پروڈکٹ صفحے پر Sarsabz CAN میں کل 26 فیصد نائٹروجن درج ہے۔ اس میں 13 فیصد nitrate اور 13 فیصد ammoniacal nitrogen شامل ہیں، اس لیے دونوں حصوں کا مجموعہ 26 فیصد بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q4",
      "referenceUrl": "https://www.fatima-group.com/fertilizer/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sarsabz-can",
      "nitrogen",
      "fertilizer-products"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q005-SRC",
    "pairId": "P236-Q005",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Islam was declared the state religion of Pakistan in which Constitution?",
    "options": [
      "Constitution of 1956",
      "Constitution of 1973",
      "Constitution of 1962",
      "Constitutional amendment of 2010"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آئینِ پاکستان 1973 کے آرٹیکل 2 میں واضح ہے کہ اسلام پاکستان کا ریاستی مذہب ہوگا۔ 1956 میں ملک کا نام اسلامی جمہوریہ بنا، لیکن ریاستی مذہب کی یہ صریح آئینی شق 1973 کے آئین سے متعلق ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q5, PDF p.8",
      "referenceUrl": "https://na.gov.pk/uploads/documents/67b5658558e94_594.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution-1973",
      "article-2",
      "state-religion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q005-SIM",
    "pairId": "P236-Q005",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which article of Pakistan's 1973 Constitution declares Islam the state religion?",
    "options": [
      "Article 2",
      "Article 1",
      "Article 2A",
      "Article 31"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اسلام کو ریاستی مذہب قرار دینے والی مختصر اور واضح شق آرٹیکل 2 ہے۔ آرٹیکل 2A قراردادِ مقاصد کو آئین کا substantive حصہ بناتا ہے، اس لیے دونوں دفعات کو آپس میں خلط نہ کریں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q5",
      "referenceUrl": "https://na.gov.pk/uploads/documents/67b5658558e94_594.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "article-2",
      "constitution",
      "islam"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q006-SRC",
    "pairId": "P236-Q006",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "What official name did Pakistan adopt under the 1956 Constitution?",
    "options": [
      "Republic of Pakistan",
      "Islamic Republic of Pakistan",
      "Dominion of Pakistan",
      "State of Pakistan"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "1956 کے پہلے آئین کے نفاذ پر پاکستان اسلامی جمہوریہ بنا، لہٰذا درست سرکاری نام Islamic Republic of Pakistan ہے۔ قومی اسمبلی کی پارلیمانی تاریخ کے مطابق اسی وجہ سے 23 مارچ یومِ جمہوریہ بھی قرار پایا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q6, PDF p.8",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution-1956",
      "islamic-republic",
      "official-name"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q006-SIM",
    "pairId": "P236-Q006",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date did Pakistan's 1956 Constitution come into force?",
    "options": [
      "14 August 1947",
      "8 June 1962",
      "7 October 1958",
      "23 March 1956"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پاکستان کا پہلا آئین 23 مارچ 1956 کو نافذ ہوا۔ اسے 29 فروری کو منظور اور 2 مارچ کو گورنر جنرل کی منظوری ملی تھی، مگر نفاذ کی درست تاریخ 23 مارچ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q6",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution-1956",
      "23-march",
      "constitutional-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q007-SRC",
    "pairId": "P236-Q007",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year were Pakistan's non-party general elections held?",
    "options": [
      "1980",
      "1983",
      "1985",
      "1988"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان میں قومی اور صوبائی اسمبلیوں کے غیر جماعتی انتخابات 1985 میں ہوئے۔ قومی اسمبلی کی سرکاری تاریخ 25 فروری 1985 کو قومی انتخابات اور غیر جماعتی بنیاد کی تصدیق کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q7, PDF p.8",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "elections-1985",
      "non-party",
      "pakistan-politics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q007-SIM",
    "pairId": "P236-Q007",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On what date was polling held for Pakistan's 1985 National Assembly election?",
    "options": [
      "24 March 1985",
      "28 February 1985",
      "20 March 1985",
      "25 February 1985"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "الیکشن کمیشن کے سرکاری انتخابی جدول کے مطابق قومی اسمبلی کے لیے پولنگ 25 فروری 1985 کو ہوئی۔ صوبائی اسمبلیوں کی پولنگ 28 فروری کو ہوئی تھی، اس لیے دونوں تاریخیں الگ یاد رکھیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q7",
      "referenceUrl": "https://ecp.gov.pk/storage/files/2/Special%20Initiatives%202020-2025/AN%20INTRODUCTION%20BOOK%20Final-A.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "1985-election",
      "polling-date",
      "ecp"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q008-SRC",
    "pairId": "P236-Q008",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year were Pakistan's first direct general elections held?",
    "options": [
      "1970",
      "1985",
      "1988",
      "1990"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "الیکشن کمیشن کے مطابق قومی اور صوبائی اسمبلیوں کے پہلے براہِ راست عام انتخابات 1970 میں ہوئے۔ اس سے پہلے 1962 اور 1965 کے انتخابات بالواسطہ نوعیت کے تھے، اسی لیے 1970 درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q8, PDF p.8",
      "referenceUrl": "https://ecp.gov.pk/storage/files/1/ger-3.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "general-election-1970",
      "first-direct-election",
      "ecp"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q008-SIM",
    "pairId": "P236-Q008",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date was polling held for Pakistan's National Assembly in the 1970 general election?",
    "options": [
      "17 December 1970",
      "7 December 1970",
      "7 March 1977",
      "16 November 1988"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "الیکشن کمیشن کے زمانی جدول میں 1970 کی قومی اسمبلی کے لیے پولنگ 7 دسمبر درج ہے۔ صوبائی اسمبلیوں کی پولنگ 17 دسمبر 1970 کو ہوئی، اس لیے سوال میں اسمبلی کی سطح دیکھنا ضروری ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q8",
      "referenceUrl": "https://ecp.gov.pk/storage/files/2/Special%20Initiatives%202020-2025/AN%20INTRODUCTION%20BOOK%20Final-A.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "1970-election",
      "7-december",
      "national-assembly"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q009-SRC",
    "pairId": "P236-Q009",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "How many seats are in the Senate of Pakistan under the current post-merger composition?",
    "options": [
      "88",
      "92",
      "96",
      "104"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سینیٹ آف پاکستان کی سرکاری composition table کے مطابق کل نشستیں 96 ہیں۔ فاٹا کے انضمام کے بعد پرانی 104 والی تعداد مرحلہ وار کم ہوئی، اس لیے یہ جواب 22 اگست 2026 کی موجودہ ساخت کے مطابق ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q9, PDF p.8",
      "referenceUrl": "https://senate.gov.pk/en/essence.php?catid=4&cattitle=House+of++Federation&id=10&leftcatid=125&subcatid=138",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "96-seats",
      "parliament"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The website adds a date-sensitive post-merger qualifier because older references commonly give 104 seats. Verified for the composition published by the Senate and accessed 2026-08-22."
  },
  {
    "id": "P236-Q009-SIM",
    "pairId": "P236-Q009",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What is the constitutional term of a Senator in Pakistan?",
    "options": [
      "Three years",
      "Six years",
      "Five years",
      "Four years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پاکستان میں سینیٹر کی مدت چھ سال ہوتی ہے۔ ایوان تحلیل نہیں ہوتا، بلکہ ہر تین سال بعد تقریباً نصف ارکان ریٹائر ہوتے ہیں اور ان کی جگہ نئے ارکان منتخب کیے جاتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q9",
      "referenceUrl": "https://senate.gov.pk/en/current_members.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "six-year-term",
      "upper-house"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q010-SRC",
    "pairId": "P236-Q010",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year did Fatima Jinnah die?",
    "options": [
      "1965",
      "1966",
      "1967",
      "1968"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مادرِ ملت محترمہ فاطمہ جناح 9 جولائی 1967 کو کراچی میں وفات پا گئیں۔ لہٰذا دیے گئے سالوں میں 1967 درست انتخاب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q10, PDF p.8",
      "referenceUrl": "https://antiquities.sindhculture.gov.pk/tour/quaid-e-azam-house-flag-staff-house-karachi/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fatima-jinnah",
      "1967",
      "madar-e-millat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q010-SIM",
    "pairId": "P236-Q010",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date is Fatima Jinnah's death anniversary observed?",
    "options": [
      "31 July",
      "25 December",
      "11 September",
      "9 July"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "فاطمہ جناح کی وفات 9 جولائی 1967 کو ہوئی، اس لیے ان کی برسی ہر سال 9 جولائی کو منائی جاتی ہے۔ 31 جولائی ان کی تاریخِ پیدائش ہے، جبکہ 11 ستمبر قائداعظم کی وفات کی تاریخ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q10",
      "referenceUrl": "https://pid.gov.pk/site/press_detail/33185",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fatima-jinnah",
      "9-july",
      "death-anniversary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q011-SRC",
    "pairId": "P236-Q011",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which constitutional framework governed Pakistan at independence until a new constitution was adopted?",
    "options": [
      "Constitution of 1956",
      "Constitution of 1962",
      "Government of India Act 1935 as adapted in 1947",
      "Constitution of 1973"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قیامِ پاکستان کے وقت نیا ملکی آئین تیار نہیں تھا، اس لیے Government of India Act 1935 کو 1947 میں ضروری موافقت کے ساتھ عبوری آئینی ڈھانچے کے طور پر استعمال کیا گیا۔ 1956 کا آئین پاکستان کا پہلا باقاعدہ آئین تھا، لہٰذا وہ آزادی کے لمحے نافذ نہیں تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q11, PDF p.8",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "government-of-india-act-1935",
      "independence-1947",
      "interim-constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q011-SIM",
    "pairId": "P236-Q011",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Where did Pakistan's first Constituent Assembly hold its first session on 10 August 1947?",
    "options": [
      "Punjab Assembly Building, Lahore",
      "Governor House, Peshawar",
      "Parliament House, Islamabad",
      "Sindh Assembly Building, Karachi"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پاکستان کی پہلی دستور ساز اسمبلی کا پہلا اجلاس 10 اگست 1947 کو سندھ اسمبلی بلڈنگ کراچی میں ہوا۔ اسلام آباد اس وقت وفاقی دارالحکومت نہیں تھا، اس لیے Parliament House والا جواب درست نہیں ہوسکتا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q11",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constituent-assembly",
      "karachi",
      "10-august-1947"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q012-SRC",
    "pairId": "P236-Q012",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which country, working with Qatar, helped mediate the April 2026 de-escalation between the United States and Iran?",
    "options": [
      "Saudi Arabia",
      "Turkey",
      "China",
      "Pakistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "8 اپریل 2026 کے سرکاری پاکستانی بیان میں امریکہ اور ایران کے درمیان جنگ بندی اور کشیدگی کم کرانے میں پاکستان کے کردار کا ذکر ہے، جبکہ قطر بھی ثالثی میں شریک تھا۔ یہ جواب اسی اپریل 2026 کے تناظر کا ہے؛ بعد کی پیش رفت نے معاہدے کی نزاکت دکھائی، اس لیے اسے دائمی طور پر ختم شدہ تنازع نہ سمجھیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q12, PDF p.8",
      "referenceUrl": "https://pid.gov.pk/site/press_detail/32348",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "us-iran",
      "pakistan-mediation",
      "april-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source's vague word 'recent' is anchored to the 8 April 2026 ceasefire/de-escalation context and acknowledges Qatar's co-mediation."
  },
  {
    "id": "P236-Q012-SIM",
    "pairId": "P236-Q012",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Which city gave its name to the June 2026 memorandum used for U.S.-Iran technical talks?",
    "options": [
      "Islamabad",
      "Doha",
      "Istanbul",
      "Geneva"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جون 2026 کی تکنیکی بات چیت Islamabad Memorandum of Understanding کے تحت ہوئی، اس لیے درست شہر اسلام آباد ہے۔ وزارتِ خارجہ کے مطابق پاکستان اور قطر ثالث تھے؛ سوال نامِ معاہدہ پوچھتا ہے، مذاکرات کی ہر ممکنہ جگہ نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q12",
      "referenceUrl": "https://mofa.gov.pk/press-releases/technical-level-talks-under-the-islamabad-memorandum-of-understanding",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "islamabad-mou",
      "us-iran-talks",
      "mediation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q013-SRC",
    "pairId": "P236-Q013",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was President of the World Bank Group during the first official visit to Pakistan in February 2026?",
    "options": [
      "Kristalina Georgieva",
      "Ajay Banga",
      "David Malpass",
      "Jim Yong Kim"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "2 فروری 2026 کے سرکاری پاکستانی اعلامیے کے مطابق ورلڈ بینک گروپ کے صدر اجے بنگا نے اس حیثیت میں پاکستان کا پہلا سرکاری دورہ کیا۔ وہ 2 جون 2023 سے پانچ سالہ مدت کے لیے صدر ہیں، اس لیے 22 اگست 2026 کے تناظر میں بھی یہی جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q13, PDF p.8",
      "referenceUrl": "https://pid.gov.pk/site/press_detail/31782",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "world-bank",
      "ajay-banga",
      "pakistan-visit-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q013-SIM",
    "pairId": "P236-Q013",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On which date did Ajay Banga begin his five-year term as World Bank Group President?",
    "options": [
      "2 June 2023",
      "1 July 2023",
      "2 February 2026",
      "1 January 2024"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ورلڈ بینک کی سرکاری سوانح کے مطابق اجے بنگا نے 2 جون 2023 کو پانچ سالہ مدت شروع کی۔ 2 فروری 2026 ان کے پاکستان میں سرکاری ملاقات کی تاریخ تھی، منصب سنبھالنے کی نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q13",
      "referenceUrl": "https://www.worldbank.org/ext/en/who-we-are/leadership/ajay-banga",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ajay-banga",
      "world-bank-president",
      "term-date"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q014-SRC",
    "pairId": "P236-Q014",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who is the U.S. Secretary of State as of 22 August 2026?",
    "options": [
      "Antony Blinken",
      "Marco Rubio",
      "Mike Pompeo",
      "John Kerry"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "امریکی محکمہ خارجہ کے تاریخی ریکارڈ کے مطابق مارکو روبیو نے 21 جنوری 2025 کو سیکرٹری آف اسٹیٹ کا منصب سنبھالا۔ یہ جواب 22 اگست 2026 کے زمانی تناظر میں دیا گیا ہے، کیونکہ موجودہ عہدے دار مستقبل میں تبدیل ہوسکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q14, PDF p.8",
      "referenceUrl": "https://history.state.gov/departmenthistory/people/rubio-marco",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "marco-rubio",
      "secretary-of-state",
      "united-states"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q014-SIM",
    "pairId": "P236-Q014",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Whom did Marco Rubio succeed as U.S. Secretary of State in January 2025?",
    "options": [
      "Antony Blinken",
      "Mike Pompeo",
      "John Kerry",
      "Rex Tillerson"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "محکمہ خارجہ کی سرکاری فہرست میں Antony Blinken کی مدت 2021–2025 اور اس کے بعد Marco Rubio کا نام درج ہے۔ لہٰذا روبیو کے فوری پیش رو انٹونی بلنکن تھے، نہ کہ مائیک پومپیو جو اس سے پہلے 2018–2021 میں رہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q14",
      "referenceUrl": "https://history.state.gov/departmenthistory/people/principalofficers/secretary",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antony-blinken",
      "marco-rubio",
      "succession"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q015-SRC",
    "pairId": "P236-Q015",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Nicolás Maduro served as President of which country?",
    "options": [
      "Brazil",
      "Canada",
      "Venezuela",
      "Colombia"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نکولاس مادورو وینزویلا کے صدر تھے، اس لیے ملک کے بارے میں درست جواب Venezuela ہے۔ یہ سوال تاریخی انداز میں رکھا گیا ہے: اقوام متحدہ کے مطابق 3 جنوری 2026 کے واقعات کے بعد Delcy Rodríguez قائم مقام صدر بنیں، لہٰذا مادورو کو 22 اگست 2026 کا موجودہ صدر کہنا outdated ہوگا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q15, PDF p.9",
      "referenceUrl": "https://venezuela.un.org/es/307995-declaraciones-del-secretario-general-ante-el-consejo-de-seguridad-sobre-venezuela",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nicolas-maduro",
      "venezuela",
      "current-affairs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan uses past tense ('was'), which remains answerable. Current context added: the CIA listed Delcy Rodríguez as Acting President on 2026-07-30 after Maduro's January 2026 capture."
  },
  {
    "id": "P236-Q015-SIM",
    "pairId": "P236-Q015",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Who was listed as Acting President of Venezuela by the CIA World Leaders directory on 30 July 2026?",
    "options": [
      "Nicolás Maduro",
      "Delcy Rodríguez",
      "Edmundo González",
      "Diosdado Cabello"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "CIA World Leaders کی 30 جولائی 2026 کی تازہ فہرست میں Delcy Rodríguez Gómez کو وینزویلا کی قائم مقام صدر درج کیا گیا ہے۔ یہ تاریخ کے ساتھ بندھا ہوا موجودہ امور کا جواب ہے اور سیاسی حالات بدلنے پر اسے دوبارہ verify کرنا ہوگا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q15",
      "referenceUrl": "https://www.cia.gov/resources/world-leaders/foreign-governments/venezuela",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "delcy-rodriguez",
      "venezuela",
      "acting-president"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q016-SRC",
    "pairId": "P236-Q016",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which country hosted the G20 Leaders' Summit in 2023?",
    "options": [
      "China",
      "United States",
      "India",
      "Brazil"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "2023 کا اٹھارھواں G20 سربراہی اجلاس بھارت کی میزبانی میں نئی دہلی میں 9 اور 10 ستمبر کو ہوا۔ سرکاری اعلامیے میں شرکا نے بھارت کا کامیاب میزبانی پر شکریہ ادا کیا، اس لیے درست جواب India ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q16, PDF p.9",
      "referenceUrl": "https://g20.org/wp-content/uploads/2024/09/G20-2023_India_Declaracao-de-Lideres.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "g20",
      "india",
      "2023-summit"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q016-SIM",
    "pairId": "P236-Q016",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "In which city did G20 leaders meet on 9–10 September 2023?",
    "options": [
      "Mumbai",
      "New Delhi",
      "Bengaluru",
      "Kolkata"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "G20 New Delhi Leaders’ Declaration کے مطابق سربراہان 9–10 ستمبر 2023 کو نئی دہلی میں ملے۔ بھارت میزبان ملک اور New Delhi میزبان شہر تھا، اس لیے دونوں معلومات الگ الگ یاد رکھیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q16",
      "referenceUrl": "https://www.g20.org/wp-content/uploads/2024/10/G20-2023_India_Declaracao-de-Lideres.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "g20",
      "new-delhi",
      "summit-city"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q017-SRC",
    "pairId": "P236-Q017",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "According to Pakistan's 7th Population and Housing Census (2023), the population was approximately:",
    "options": [
      "220 million",
      "230 million",
      "241 million",
      "250 million"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان بیورو آف اسٹیٹسٹکس کے قومی مردم شماری رپورٹ میں 2023 کی آبادی 241,499,431، یعنی تقریباً 241.50 ملین درج ہے۔ اس لیے دیے گئے rounded options میں 241 million درست ترین جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q17, PDF p.9",
      "referenceUrl": "https://www.pbs.gov.pk/wp-content/uploads/2020/07/National-Census-Report-2023-1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "digital-census-2023",
      "population",
      "pbs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q017-SIM",
    "pairId": "P236-Q017",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "What annual population growth rate did Pakistan's 2023 Census report for 2017–2023?",
    "options": [
      "2.55%",
      "2.40%",
      "2.15%",
      "3.20%"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "قومی مردم شماری رپورٹ کے مطابق 2017 سے 2023 کے درمیان پاکستان کی اوسط سالانہ آبادی شرحِ نمو 2.55 فیصد رہی۔ 2.40 فیصد سابقہ 1998–2017 دور کی شرح تھی، اس لیے مدت کو غور سے پڑھنا ضروری ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q17",
      "referenceUrl": "https://www.pbs.gov.pk/wp-content/uploads/2020/07/National-Census-Report-2023-1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "census-2023",
      "growth-rate",
      "2.55-percent"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q018-SRC",
    "pairId": "P236-Q018",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who led the consortium whose Rs 135 billion bid for a 75% stake in PIA was recommended for approval in December 2025?",
    "options": [
      "Malik Riaz",
      "Mian Mansha",
      "Arif Habib",
      "Nasir Schon"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نجکاری کمیشن بورڈ نے دسمبر 2025 میں Arif Habib Consortium کی 75 فیصد حصص کے لیے 135 ارب روپے کی bid منظوری کے لیے recommend کی۔ اس وقت مکمل acquisition یا management transfer نہیں ہوا تھا، اس لیے Arif Habib درست اور تاریخ کے لحاظ سے درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q18, PDF p.9",
      "referenceUrl": "https://privatisation.gov.pk/NewsDetail/NzM2NmNhYjctNWZjYy00ZGFiLWI5OWMtY2ZmZmMyMDM3ZTlm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pia",
      "privatisation",
      "arif-habib"
    ],
    "verificationStatus": "verified-corrected",
    "sourceNotes": "The scan's acquisition wording is chronologically too strong. December 2025 produced a Rs 135 billion bid recommended for approval; the SPSA followed on 29 January 2026 and management control transferred only after first closing on 29 June 2026."
  },
  {
    "id": "P236-Q018-SIM",
    "pairId": "P236-Q018",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "What percentage of PIA's shares was covered by the successful December 2025 privatisation bid?",
    "options": [
      "51%",
      "60%",
      "75%",
      "100%"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نجکاری کمیشن کے سرکاری ریکارڈ میں کامیاب بولی 75 فیصد حصص کے لیے درج ہے۔ اس کے ساتھ management control بھی منتقل ہونا تھا، مگر سوال حصص کا تناسب پوچھتا ہے اور درست جواب 75 فیصد ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q18",
      "referenceUrl": "https://privatisation.gov.pk/NewsDetail/NzM2NmNhYjctNWZjYy00ZGFiLWI5OWMtY2ZmZmMyMDM3ZTlm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pia",
      "75-percent-stake",
      "privatisation-bid"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q019-SRC",
    "pairId": "P236-Q019",
    "kind": "source",
    "categoryId": "geography",
    "question": "Trimmu Barrage is built on which river?",
    "options": [
      "Indus",
      "Jhelum",
      "Ravi",
      "Chenab"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پنجاب حکومت کی ماحولیاتی دستاویز Chenab پر موجود barrages میں Marala، Khanki اور Trimmu کو شمار کرتی ہے۔ Trimmu دریائے جہلم اور چناب کے سنگم کے قریب ہے، مگر barrage کا دریا Chenab درج کیا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q19, PDF p.9",
      "referenceUrl": "https://epd.punjab.gov.pk/system/files/2025%2084.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trimmu-barrage",
      "chenab",
      "jhang"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q019-SIM",
    "pairId": "P236-Q019",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Trimmu Barrage lies just below the confluence of the Chenab with which river?",
    "options": [
      "Ravi",
      "Jhelum",
      "Sutlej",
      "Kabul"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ضلع جھنگ کے سرکاری صفحے کے مطابق Trimmu Barrage دریائے جہلم اور چناب کے مقامِ اتصال سے ذرا نیچے واقع ہے۔ لہٰذا چناب کے ساتھ یہاں ملنے والا دوسرا دریا Jhelum ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q19",
      "referenceUrl": "https://jhang.punjab.gov.pk/important-places",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trimmu",
      "jhelum",
      "river-confluence"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q020-SRC",
    "pairId": "P236-Q020",
    "kind": "source",
    "categoryId": "geography",
    "question": "In which year were Gwadar Port's first CPEC connectivity and opening of trade activities inaugurated?",
    "options": [
      "2014",
      "2016",
      "2015",
      "2017"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "13 نومبر 2016 کو Gwadar Port پر CPEC کی first connectivity اور trade activities کی افتتاحی تقریب ہوئی، اس لیے کتاب کے مطلوبہ تناظر میں جواب 2016 ہے۔ تاہم قومی اسمبلی کے ایک سرکاری جواب میں بندرگاہ کو 2008 سے operational کہا گیا ہے؛ اصل سوال میں یہ فرق واضح نہ ہونے کی وجہ سے wording مبہم تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q20, PDF p.9",
      "referenceUrl": "https://www.cophcgwadar.com/news.aspx",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gwadar-port",
      "cpec",
      "2016"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan simply asks when Gwadar Port became operational. An official National Assembly answer says 2008, while 2016 marks CPEC trade/connectivity inauguration. The website clarifies the intended 2016 event instead of presenting the ambiguous printed wording as universally correct."
  },
  {
    "id": "P236-Q020-SIM",
    "pairId": "P236-Q020",
    "kind": "similar",
    "categoryId": "geography",
    "question": "According to an official National Assembly record, in which year did Gwadar Port originally become operational?",
    "options": [
      "2002",
      "2007",
      "2008",
      "2013"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قومی اسمبلی کے سرکاری سوال و جواب میں واضح طور پر درج ہے کہ Gwadar Port 2008 میں operational ہوا تھا۔ 2016 CPEC کے تحت first connectivity اور trade opening کا نمایاں سال ہے، اس لیے امتحان میں سوال کے مخصوص تناظر کو ضرور دیکھیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q20",
      "referenceUrl": "https://na.gov.pk/uploads/documents/questions/1521011320_998.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gwadar-port",
      "2008",
      "operational-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q021-SRC",
    "pairId": "P236-Q021",
    "kind": "source",
    "categoryId": "geography",
    "question": "Hume Dam is located on which river?",
    "options": [
      "Darling River",
      "Murrumbidgee River",
      "Murray River",
      "Lachlan River"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "آسٹریلیا کا ہیوم ڈیم دریائے مرے پر، دریائے مِٹا مِٹا کے سنگم سے کچھ نیچے واقع ہے۔ اس لیے دیے گئے اختیارات میں Murray River درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q21, PDF p.9",
      "referenceUrl": "https://www.waternsw.com.au/nsw-dams/regional-nsw-dams/hume-dam",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hume-dam",
      "murray-river",
      "australia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q021-SIM",
    "pairId": "P236-Q021",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Hume Dam lies just downstream of the Murray River's confluence with which river?",
    "options": [
      "Mitta Mitta River",
      "Darling River",
      "Lachlan River",
      "Snowy River"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "WaterNSW کے مطابق ہیوم ڈیم مرے اور مِٹا مِٹا دریاؤں کے سنگم سے تقریباً 16 کلومیٹر نیچے ہے۔ لہٰذا درست معاون دریا Mitta Mitta River ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q21",
      "referenceUrl": "https://www.waternsw.com.au/nsw-dams/regional-nsw-dams/hume-dam",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hume-dam",
      "mitta-mitta",
      "confluence"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q022-SRC",
    "pairId": "P236-Q022",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which listed province shares the Hub Dam project with Sindh?",
    "options": [
      "Punjab",
      "Khyber Pakhtunkhwa",
      "Gilgit-Baltistan",
      "Balochistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "واپڈا کے مطابق حب ڈیم سندھ اور بلوچستان کا بین الصوبائی منصوبہ ہے اور دونوں اس سے پانی حاصل کرتے ہیں۔ اصل سوال صرف ایک صوبہ پوچھتا تھا، اس لیے اسے سندھ کے ساتھ شریک صوبے کی صورت میں واضح کیا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q22, PDF p.9",
      "referenceUrl": "https://wapda.gov.pk/?p=2489",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hub-dam",
      "balochistan",
      "sindh"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed stem asks which single province contains Hub Dam, while WAPDA describes it as an inter-provincial Sindh-Balochistan project. The stem was clarified without changing the keyed option, Balochistan."
  },
  {
    "id": "P236-Q022-SIM",
    "pairId": "P236-Q022",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Hub Dam is constructed across which river?",
    "options": [
      "Porali River",
      "Hingol River",
      "Dasht River",
      "Hub River"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "واپڈا حب ڈیم کو دریائے حب پر تعمیر شدہ کثیر المقاصد منصوبہ قرار دیتا ہے۔ Hingol، Dasht اور Porali بلوچستان کے دوسرے دریا ہیں مگر اس ڈیم کا دریا Hub ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q22",
      "referenceUrl": "https://wapda.gov.pk/?p=2489",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hub-dam",
      "hub-river",
      "wapda"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q023-SRC",
    "pairId": "P236-Q023",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which of the following countries is geographically nearest to Pakistan?",
    "options": [
      "Iraq",
      "Syria",
      "Tajikistan",
      "Uzbekistan"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستانی وزارتِ خارجہ کے مطابق تاجکستان پاکستان کا قریب ترین وسط ایشیائی ہمسایہ ہے اور درمیان میں افغانستان کی واخان پٹی کا تقریباً 14 کلومیٹر حصہ ہے۔ دیے گئے ممالک میں اس لیے Tajikistan درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q23, PDF p.9",
      "referenceUrl": "https://mofa.gov.pk/dushanbe-pakistan-tajikistan-relations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tajikistan",
      "pakistan",
      "nearest-country"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q023-SIM",
    "pairId": "P236-Q023",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which narrow Afghan region separates Pakistan from Tajikistan?",
    "options": [
      "Registan Desert",
      "Panjshir Valley",
      "Khyber Pass",
      "Wakhan Corridor"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پاکستان اور تاجکستان کے درمیان افغانستان کی باریک واخان پٹی واقع ہے۔ اسی جغرافیائی رکاوٹ کی وجہ سے دونوں ملک بہت قریب ہونے کے باوجود مشترک سرحد نہیں رکھتے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q23",
      "referenceUrl": "https://mofa.gov.pk/dushanbe-pakistan-tajikistan-relations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "wakhan-corridor",
      "tajikistan",
      "afghanistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q024-SRC",
    "pairId": "P236-Q024",
    "kind": "source",
    "categoryId": "geography",
    "question": "The Sor Range of Balochistan is associated with which mineral resource?",
    "options": [
      "Coal",
      "Gold",
      "Copper",
      "Iron ore"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان منرل ڈیولپمنٹ کارپوریشن Degari–Sor Range کوئلہ فیلڈ میں اپنی کانیں چلاتی ہے۔ اس بنا پر Sor Range کا مطلوبہ معدنی تعلق Coal سے ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q24, PDF p.9",
      "referenceUrl": "https://www.pmdc.gov.pk/mines/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sor-range",
      "coal",
      "balochistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q024-SIM",
    "pairId": "P236-Q024",
    "kind": "similar",
    "categoryId": "geography",
    "question": "The Degari–Sor Range coalfield is located in which province of Pakistan?",
    "options": [
      "Punjab",
      "Sindh",
      "Khyber Pakhtunkhwa",
      "Balochistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پی ایم ڈی سی کے کانوں کے ریکارڈ میں Degari Coal Mines، Quetta، Balochistan درج ہیں اور انہیں Degari–Sor Range coalfield کا حصہ بتایا گیا ہے۔ لہٰذا صوبہ بلوچستان درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q24",
      "referenceUrl": "https://www.pmdc.gov.pk/mines/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "degari",
      "sor-range",
      "balochistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q025-SRC",
    "pairId": "P236-Q025",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Who discovered cosmic rays?",
    "options": [
      "Ernest Rutherford",
      "Victor Hess",
      "Marie Curie",
      "Niels Bohr"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "وکٹر ہیس نے 1912 میں غبارے کے تجربات سے بلند فضا میں بڑھتی ہوئی شعاعوں کا ثبوت دیا، جنہیں بعد میں cosmic rays کہا گیا۔ اسی دریافت پر انہیں 1936 کا نوبیل انعامِ طبیعیات ملا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q25, PDF p.9",
      "referenceUrl": "https://www.nobelprize.org/prizes/physics/1936/hess/facts/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cosmic-rays",
      "victor-hess",
      "1912"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q025-SIM",
    "pairId": "P236-Q025",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Victor Hess received the Nobel Prize in Physics for the discovery of cosmic radiation in which year?",
    "options": [
      "1912",
      "1928",
      "1936",
      "1945"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نوبیل پرائز کے سرکاری ریکارڈ کے مطابق وکٹر ہیس کو cosmic radiation کی دریافت پر 1936 میں نصف انعام دیا گیا۔ 1912 دریافت کے تجربات کا سال تھا، نوبیل انعام کا نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q25",
      "referenceUrl": "https://www.nobelprize.org/prizes/physics/1936/hess/facts/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "victor-hess",
      "nobel-prize",
      "1936"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q026-SRC",
    "pairId": "P236-Q026",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "At constant volume and a fixed amount of gas, pressure increases when which quantity increases?",
    "options": [
      "Volume",
      "Absolute temperature",
      "Molar mass",
      "Container density"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مثالی گیس کے قانون کے مطابق حجم اور گیس کی مقدار مستقل ہوں تو دباؤ مطلق درجۂ حرارت کے براہِ راست متناسب ہوتا ہے۔ اس لیے Kelvin temperature بڑھنے پر pressure بھی بڑھتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q26, PDF p.9",
      "referenceUrl": "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gas-law",
      "pressure",
      "temperature"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q026-SIM",
    "pairId": "P236-Q026",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "If the Kelvin temperature of a fixed gas at constant volume doubles, its ideal pressure will approximately:",
    "options": [
      "Halve",
      "Double",
      "Remain unchanged",
      "Become four times"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مستقل حجم اور مقدار پر P/T مستقل رہتا ہے، یعنی دباؤ Kelvin temperature کے ساتھ سیدھا بدلتا ہے۔ درجۂ حرارت دوگنا کرنے سے مثالی دباؤ بھی تقریباً دوگنا ہو جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q26",
      "referenceUrl": "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ideal-gas",
      "kelvin",
      "direct-proportion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q027-SRC",
    "pairId": "P236-Q027",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which part of the brain chiefly coordinates balance and movement?",
    "options": [
      "Cerebrum",
      "Cerebellum",
      "Medulla oblongata",
      "Thalamus"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "cerebellum جسم کی ارادی حرکات، وضع اور توازن کو ہم آہنگ کرنے میں بنیادی کردار ادا کرتا ہے۔ اسی حصے کی خرابی سے چلنے اور coordination میں دشواری ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q27, PDF p.9",
      "referenceUrl": "https://www.ninds.nih.gov/health-information/disorders/cerebellar-degeneration",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cerebellum",
      "balance",
      "coordination"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q027-SIM",
    "pairId": "P236-Q027",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Damage to the cerebellum most directly impairs which ability?",
    "options": [
      "Coordinating voluntary movement",
      "Producing insulin",
      "Filtering blood",
      "Digesting protein"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "cerebellum پٹھوں کی ارادی حرکت اور توازن کو مربوط کرتا ہے، اس لیے اس کی خرابی سے ataxia اور بے ربط حرکت نمایاں ہوتی ہے۔ باقی اختیارات دوسرے اعضا کے افعال ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q27",
      "referenceUrl": "https://www.ninds.nih.gov/health-information/disorders/cerebellar-degeneration",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cerebellum",
      "ataxia",
      "movement"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q028-SRC",
    "pairId": "P236-Q028",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Diamond is best classified as:",
    "options": [
      "An isotope of carbon",
      "A carbon compound",
      "A mineral mixture",
      "An allotrope of carbon"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ہیرا خالص carbon کی ایک کرسٹل ساخت ہے، اس لیے اسے carbon کا allotrope کہا جاتا ہے۔ allotropes ایک ہی عنصر کی مختلف ساختی صورتیں ہوتی ہیں، نہ کہ الگ compounds یا isotopes۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q28, PDF p.9",
      "referenceUrl": "https://edu.rsc.org/resources/structure-and-bonding-diamond-and-graphite/4015367.article",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "diamond",
      "carbon",
      "allotrope"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q028-SIM",
    "pairId": "P236-Q028",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which carbon allotrope has a giant three-dimensional covalent lattice and is extremely hard?",
    "options": [
      "Graphite",
      "Fullerene C60",
      "Graphene",
      "Diamond"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "diamond میں ہر carbon atom چار دوسرے atoms کے ساتھ مضبوط covalent bonds بناتا ہے اور تین جہتی جال پیدا ہوتا ہے۔ یہی ساخت اسے بہت سخت بناتی ہے، جبکہ graphite کی تہیں نسبتاً آسانی سے سرکتی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q28",
      "referenceUrl": "https://edu.rsc.org/resources/structure-and-bonding-diamond-and-graphite/4015367.article",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "diamond",
      "covalent-lattice",
      "hardness"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q029-SRC",
    "pairId": "P236-Q029",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which substance forms the writing core of an ordinary pencil?",
    "options": [
      "Coal",
      "Graphite",
      "Sulfur",
      "Silicon"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "عام pencil کی نوک graphite اور clay کے آمیزے سے بنتی ہے؛ اسے روزمرہ میں lead کہہ دیا جاتا ہے مگر اس میں دھات lead نہیں ہوتی۔ درست بنیادی مادہ Graphite ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q29, PDF p.9",
      "referenceUrl": "https://www.britannica.com/technology/pencil-writing-implement",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pencil",
      "graphite",
      "carbon"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q029-SIM",
    "pairId": "P236-Q029",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Why can graphite leave a mark on paper?",
    "options": [
      "Its layers slide off easily",
      "It melts at room temperature",
      "It contains liquid ink",
      "It reacts strongly with paper"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "graphite میں carbon کی تہوں کے درمیان قوتیں کمزور ہوتی ہیں، اس لیے رگڑ پر باریک تہیں کاغذ پر منتقل ہو جاتی ہیں۔ یہی خصوصیت اسے pencil core کے لیے موزوں بناتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q29",
      "referenceUrl": "https://edu.rsc.org/resources/structure-and-bonding-diamond-and-graphite/4015367.article",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "graphite",
      "layers",
      "pencil-mark"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q030-SRC",
    "pairId": "P236-Q030",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Who is most closely associated with presenting the scientific theory of evolution by natural selection?",
    "options": [
      "Gregor Mendel",
      "Jean-Baptiste Lamarck",
      "Charles Darwin",
      "Louis Pasteur"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Charles Darwin نے natural selection کے ذریعے evolution کی جامع وضاحت پیش کی اور 1859 میں On the Origin of Species شائع کی۔ تاہم Alfred Russel Wallace نے بھی یہی بنیادی خیال آزادانہ طور پر اخذ کیا اور 1858 میں دونوں کے کام مشترک طور پر پیش ہوئے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q30, PDF p.9",
      "referenceUrl": "https://www.nhm.ac.uk/discover/what-is-natural-selection.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "evolution",
      "charles-darwin",
      "natural-selection"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The conventional keyed answer is Charles Darwin, but the explanation records Alfred Russel Wallace's independent co-discovery of natural selection."
  },
  {
    "id": "P236-Q030-SIM",
    "pairId": "P236-Q030",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which naturalist independently developed natural selection and presented work jointly with Darwin in 1858?",
    "options": [
      "Alfred Russel Wallace",
      "Gregor Mendel",
      "James Hutton",
      "Robert Hooke"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Alfred Russel Wallace نے Darwin سے الگ رہتے ہوئے natural selection کا نظریہ اخذ کیا۔ 1858 میں Wallace اور Darwin کے تحریری مواد کو Linnean Society میں مشترک طور پر پیش کیا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q30",
      "referenceUrl": "https://www.nhm.ac.uk/discover/what-is-natural-selection.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "alfred-russel-wallace",
      "natural-selection",
      "1858"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q031-SRC",
    "pairId": "P236-Q031",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which of the following substances dissolves readily in water?",
    "options": [
      "Ethanol",
      "Cooking oil",
      "Petrol",
      "Paraffin wax"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ethanol کا قطبی hydroxyl گروپ پانی کے ساتھ hydrogen bonding کرتا ہے، اس لیے ethanol پانی میں مکمل طور پر miscible ہے۔ oil، petrol اور paraffin نسبتاً غیر قطبی ہیں اور آسانی سے حل نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q31, PDF p.9",
      "referenceUrl": "https://openstax.org/books/chemistry-2e/pages/11-3-solubility",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ethanol",
      "water",
      "solubility"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says only 'alcohol'; the item specifies ethanol because solubility varies across the broad alcohol family."
  },
  {
    "id": "P236-Q031-SIM",
    "pairId": "P236-Q031",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which pair of liquids is normally immiscible?",
    "options": [
      "Ethanol and water",
      "Vinegar and water",
      "Acetone and water",
      "Cooking oil and water"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پانی قطبی اور cooking oil زیادہ تر غیر قطبی مادوں پر مشتمل ہوتا ہے، اس لیے دونوں الگ تہیں بناتے ہیں۔ 'like dissolves like' کے اصول کے تحت oil and water عام طور پر immiscible ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q31",
      "referenceUrl": "https://openstax.org/books/chemistry-2e/pages/11-3-solubility",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "immiscible",
      "oil",
      "water"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q032-SRC",
    "pairId": "P236-Q032",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Who discovered gamma rays?",
    "options": [
      "Wilhelm Röntgen",
      "Henri Becquerel",
      "Paul Villard",
      "Marie Curie"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "فرانسیسی طبیعیات دان Paul Villard نے 1900 میں radium سے نکلنے والی ایک زیادہ penetrative radiation شناخت کی۔ Rutherford نے بعد میں اسے gamma rays کا نام دیا، اس لیے دریافت کا جواب Villard ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q32, PDF p.9",
      "referenceUrl": "https://www.britannica.com/science/gamma-ray",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gamma-rays",
      "paul-villard",
      "1900"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q032-SIM",
    "pairId": "P236-Q032",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Who introduced the name 'gamma rays' for the highly penetrating radiation discovered by Paul Villard?",
    "options": [
      "Niels Bohr",
      "Ernest Rutherford",
      "Max Planck",
      "James Chadwick"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Paul Villard نے radiation دریافت کی، جبکہ Ernest Rutherford نے alpha اور beta کے بعد اس تیسرے اخراج کے لیے gamma نام رائج کیا۔ دریافت کرنے والے اور نام دینے والے سائنس دان کو الگ الگ یاد رکھنا چاہیے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q32",
      "referenceUrl": "https://www.britannica.com/science/gamma-ray",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gamma-rays",
      "ernest-rutherford",
      "naming"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q033-SRC",
    "pairId": "P236-Q033",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which type of volatile RAM is generally faster?",
    "options": [
      "DRAM",
      "SRAM",
      "EPROM",
      "Neither SRAM nor DRAM"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "SRAM ہر bit کو flip-flop میں محفوظ کرتی ہے اور اسے DRAM کی طرح بار بار refresh نہیں کرنا پڑتا، اس لیے یہ عموماً زیادہ تیز ہوتی ہے۔ دونوں RAM اقسام volatile ہیں، مگر EPROM non-volatile memory ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q33, PDF p.9",
      "referenceUrl": "https://www.techtarget.com/whatis/definition/SRAM-static-random-access-memory",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sram",
      "dram",
      "volatile-memory"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q033-SIM",
    "pairId": "P236-Q033",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "SRAM is most commonly used for which high-speed computer component?",
    "options": [
      "Optical disc",
      "CPU cache",
      "Magnetic tape",
      "Long-term file archive"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "SRAM تیز مگر مہنگی ہوتی ہے، اس لیے اسے عموماً processor cache میں استعمال کیا جاتا ہے جہاں کم latency اہم ہے۔ طویل مدتی storage کے لیے non-volatile media استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q33",
      "referenceUrl": "https://www.techtarget.com/whatis/definition/SRAM-static-random-access-memory",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sram",
      "cpu-cache",
      "memory"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q034-SRC",
    "pairId": "P236-Q034",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which network protocol automatically assigns IP configuration to devices?",
    "options": [
      "ISP",
      "ICANN",
      "DNS",
      "DHCP"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "DHCP یعنی Dynamic Host Configuration Protocol میزبانوں کو IP address اور دوسری configuration خودکار طور پر فراہم کرتا ہے۔ DNS نام کو IP سے ملاتا ہے، مگر address lease جاری کرنا DHCP کا کام ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q34, PDF p.9",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc2131",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "dhcp",
      "ip-address",
      "networking"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q034-SIM",
    "pairId": "P236-Q034",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which UDP ports are conventionally used by DHCP servers and clients, respectively?",
    "options": [
      "53 and 54",
      "20 and 21",
      "80 and 443",
      "67 and 68"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "DHCP specification میں server کے لیے UDP port 67 اور client کے لیے UDP port 68 مقرر ہیں۔ ترتیب اہم ہے: سوال server پہلے اور client بعد میں پوچھتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q34",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc2131",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "dhcp",
      "udp-67",
      "udp-68"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q035-SRC",
    "pairId": "P236-Q035",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the primary purpose of virtual memory?",
    "options": [
      "Increase CPU clock speed",
      "Store files permanently",
      "Extend usable memory by using disk space",
      "Reduce monitor power"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "virtual memory اور page file ایسے memory pages کو disk پر رکھ سکتے ہیں جو فی الحال physical RAM میں نہیں ہیں۔ اس سے programs کو RAM سے بڑی address space ملتی ہے، مگر disk RAM سے سست ہوتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q35, PDF p.9",
      "referenceUrl": "https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/introduction-to-the-page-file",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "virtual-memory",
      "page-file",
      "ram"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q035-SIM",
    "pairId": "P236-Q035",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In Windows, which disk-based file supports committed virtual memory?",
    "options": [
      "Cookie file",
      "Page file",
      "Font file",
      "Shortcut file"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Windows page file کو committed memory کے ایسے modified pages رکھنے کے لیے استعمال کرتا ہے جو RAM میں موجود نہیں رہتے۔ اسے paging file بھی کہا جاتا ہے اور یہ physical RAM کا تیز متبادل نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q35",
      "referenceUrl": "https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/introduction-to-the-page-file",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "windows",
      "page-file",
      "virtual-memory"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q036-SRC",
    "pairId": "P236-Q036",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "How many bits are in an IPv4 address?",
    "options": [
      "32",
      "24",
      "16",
      "64"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "IPv4 address چار octets پر مشتمل ہوتا ہے اور ہر octet آٹھ bits کا ہے۔ یوں مجموعی لمبائی 4 × 8 = 32 bits بنتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q36, PDF p.9",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc791",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ipv4",
      "32-bits",
      "internet-protocol"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q036-SIM",
    "pairId": "P236-Q036",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "An IPv4 address is conventionally written as how many decimal octets?",
    "options": [
      "Two",
      "Four",
      "Eight",
      "Sixteen"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "IPv4 کا 32-bit address dotted-decimal notation میں چار 8-bit octets کی صورت لکھا جاتا ہے، مثلاً 192.0.2.1۔ اس لیے درست تعداد Four ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q36",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc791",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ipv4",
      "octets",
      "dotted-decimal"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q037-SRC",
    "pairId": "P236-Q037",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "How many bits are in an IPv6 address?",
    "options": [
      "128",
      "64",
      "24",
      "256"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "IPv6 specification نے IP address کو IPv4 کے 32 bits سے بڑھا کر 128 bits کر دیا۔ اسی وسیع address space کی وجہ سے درست جواب 128 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q37, PDF p.9",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc8200",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ipv6",
      "128-bits",
      "internet-protocol"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q037-SIM",
    "pairId": "P236-Q037",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "IPv6 addresses are normally represented using which number system?",
    "options": [
      "Binary-only groups",
      "Hexadecimal groups",
      "Decimal dotted notation",
      "Octal groups"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "IPv6 addresses عام طور پر colon سے جدا hexadecimal groups میں لکھے جاتے ہیں، جیسے 2001:db8::1۔ یہ IPv4 کی dotted-decimal notation سے مختلف ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q37",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc4291",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ipv6",
      "hexadecimal",
      "address-format"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q038-SRC",
    "pairId": "P236-Q038",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which Microsoft Word feature creates many personalized letters from one template?",
    "options": [
      "Mail Merge",
      "Theme",
      "Macro recorder",
      "Document Inspector"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Mail Merge ایک main document کو ناموں اور پتوں کی data source کے ساتھ ملا کر متعدد ذاتی نوعیت کے خطوط بناتا ہے۔ ہر خط کا layout ایک رہتا ہے مگر recipient fields بدل جاتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q38, PDF p.9",
      "referenceUrl": "https://support.microsoft.com/en-us/office/use-mail-merge-to-personalize-letters-d7686bb1-3077-4af3-926b-8c825e9505a3",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "mail-merge",
      "letters"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q038-SIM",
    "pairId": "P236-Q038",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In a Word mail merge, where are recipient names and addresses normally stored?",
    "options": [
      "A video file",
      "The clipboard only",
      "A recipient list or data source",
      "The printer firmware"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Mail Merge میں variable معلومات recipient list یا data source سے آتی ہیں اور merge fields کے مقام پر داخل ہوتی ہیں۔ main document مستقل متن اور format محفوظ رکھتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q38",
      "referenceUrl": "https://support.microsoft.com/en-us/office/use-mail-merge-to-personalize-letters-d7686bb1-3077-4af3-926b-8c825e9505a3",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mail-merge",
      "recipient-list",
      "data-source"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q039-SRC",
    "pairId": "P236-Q039",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol is used for encrypted web data transfer?",
    "options": [
      "HTTP",
      "HTTPS",
      "SMTP",
      "FTP"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "HTTPS دراصل HTTP کو TLS/SSL کے محفوظ transport پر چلاتا ہے، جس سے browser اور server کے درمیان traffic encrypted ہوتا ہے۔ عام HTTP بذاتِ خود یہ encryption فراہم نہیں کرتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q39, PDF p.9",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc2818",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "https",
      "tls",
      "encryption"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan prints 'SMPT'; it has been corrected to the standard acronym SMTP."
  },
  {
    "id": "P236-Q039-SIM",
    "pairId": "P236-Q039",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What is the default TCP port associated with HTTPS?",
    "options": [
      "21",
      "25",
      "80",
      "443"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "HTTP over TLS کی standard port 443 ہے، جبکہ عام HTTP کے لیے port 80 معروف ہے۔ اس لیے encrypted web traffic کے default port کا جواب 443 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q39",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc2818",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "https",
      "port-443",
      "tls"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q040-SRC",
    "pairId": "P236-Q040",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the primary function of a network firewall?",
    "options": [
      "Increase processor speed",
      "Create user passwords",
      "Control traffic to protect against unauthorized access and threats",
      "Print network reports"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "firewall مقررہ security policy کے مطابق incoming اور outgoing network traffic کو allow یا block کرتا ہے۔ اس کا بنیادی مقصد غیر مجاز connectivity اور خطرناک traffic کو محدود کرنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q40, PDF p.9",
      "referenceUrl": "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "firewall",
      "network-security",
      "access-control"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q040-SIM",
    "pairId": "P236-Q040",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "A firewall primarily makes allow-or-block decisions by applying:",
    "options": [
      "Screen brightness levels",
      "Spreadsheet formulas",
      "Printer settings",
      "Network security policy rules"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "NIST کے مطابق firewall traffic flow کو تنظیم کی security policy کے مطابق کنٹرول کرتا ہے۔ rules میں addresses، ports، protocols اور connection state جیسے عوامل استعمال ہو سکتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q40",
      "referenceUrl": "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "firewall-rules",
      "security-policy",
      "traffic-filtering"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q041-SRC",
    "pairId": "P236-Q041",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is phishing in cybersecurity?",
    "options": [
      "A hardware virus scanner",
      "A social-engineering attack",
      "A disk-formatting fault",
      "A network cable error"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "phishing میں حملہ آور قابلِ اعتماد ادارہ یا شخص بن کر صارف کو link کھولنے، راز دینے یا نقصان دہ file چلانے پر آمادہ کرتا ہے۔ یہ بنیادی طور پر social engineering ہے، محض hardware fault نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q41, PDF p.9",
      "referenceUrl": "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "phishing",
      "social-engineering",
      "cybersecurity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q041-SIM",
    "pairId": "P236-Q041",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What is phishing conducted through SMS text messages commonly called?",
    "options": [
      "Smishing",
      "Vishing",
      "Spoof routing",
      "Packet sniffing"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "SMS کے ذریعے کیے جانے والے phishing کو smishing کہا جاتا ہے؛ نام SMS اور phishing کا مجموعہ ہے۔ vishing عموماً voice call کے ذریعے دھوکے کے لیے بولا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q41",
      "referenceUrl": "https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "smishing",
      "sms",
      "phishing"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q042-SRC",
    "pairId": "P236-Q042",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What are macros in Microsoft Excel?",
    "options": [
      "Automated scripts or recorded actions",
      "Cell borders",
      "Chart legends",
      "Worksheet tabs"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Excel macro actions کا ایسا مجموعہ ہے جسے record یا VBA میں لکھ کر بار بار چلایا جا سکتا ہے۔ اس کا مقصد repetitive tasks کو automate کرنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q42, PDF p.9",
      "referenceUrl": "https://support.microsoft.com/en-us/office/quick-start-create-a-macro-741130ca-080d-49f5-9471-1e5fb3d581a8",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "excel",
      "macros",
      "automation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q042-SIM",
    "pairId": "P236-Q042",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which programming language is used to edit recorded Excel macros?",
    "options": [
      "Cascading Style Sheets",
      "Structured Query Language",
      "Visual Basic for Applications",
      "Hypertext Markup Language"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Excel میں recorded macros کا code Visual Basic Editor میں VBA زبان کی صورت دیکھا اور بدلا جا سکتا ہے۔ VBA کا پورا نام Visual Basic for Applications ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q42",
      "referenceUrl": "https://support.microsoft.com/en-us/office/edit-a-macro-ed9e8c3d-58fd-47a1-83eb-bdee680376bb",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "excel",
      "vba",
      "macros"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q043-SRC",
    "pairId": "P236-Q043",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which network model can operate without a central server?",
    "options": [
      "Client-server",
      "Peer-to-peer",
      "Server farm",
      "Mainframe-terminal"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "خالص peer-to-peer network میں ہر node دوسرے peers کے ساتھ براہِ راست resources بانٹ سکتا ہے اور لازمی central server نہیں ہوتا۔ client-server model میں خدمات مرکزی server سے لی جاتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q43, PDF p.9",
      "referenceUrl": "https://learn.microsoft.com/en-us/archive/msdn-magazine/2001/february/net-p2p-writing-peer-to-peer-networked-apps-with-the-microsoft-net-framework",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "peer-to-peer",
      "p2p",
      "network-model"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan uses the word 'topology'; peer-to-peer is more precisely a network architecture or model, so the stem has been corrected."
  },
  {
    "id": "P236-Q043-SIM",
    "pairId": "P236-Q043",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In a peer-to-peer network, a participating computer may act as:",
    "options": [
      "Both client and server",
      "Only a printer",
      "Only a router",
      "Only a passive terminal"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "P2P architecture میں peer دوسرے nodes سے resources مانگ بھی سکتا ہے اور اپنے resources فراہم بھی کر سکتا ہے۔ اسی لیے ایک node client اور server دونوں کردار ادا کر سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q43",
      "referenceUrl": "https://learn.microsoft.com/en-us/archive/msdn-magazine/2001/february/net-p2p-writing-peer-to-peer-networked-apps-with-the-microsoft-net-framework",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "p2p",
      "client",
      "server"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q044-SRC",
    "pairId": "P236-Q044",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "DevOps is formed from which two words?",
    "options": [
      "Development and Operations",
      "Debugging and Operating",
      "Design and Options",
      "Data and Output"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "DevOps لفظ development اور operations کے ملاپ سے بنا ہے اور دونوں ٹیموں کے تعاون، processes اور tools کو یکجا کرتا ہے۔ مقصد software کی مسلسل اور قابلِ اعتماد delivery بہتر کرنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q44, PDF p.9",
      "referenceUrl": "https://learn.microsoft.com/en-us/devops/what-is-devops",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "devops",
      "development",
      "operations"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q044-SIM",
    "pairId": "P236-Q044",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "A central DevOps goal is to improve collaboration between developers and which team?",
    "options": [
      "Graphic printing",
      "Legal transcription",
      "IT operations",
      "Payroll auditing"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "DevOps development اور IT operations کے روایتی فاصلے کو کم کرکے shared responsibility پیدا کرتا ہے۔ اسی تعاون سے build، test، release اور monitoring کا عمل زیادہ مسلسل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q44",
      "referenceUrl": "https://learn.microsoft.com/en-us/devops/what-is-devops",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "devops",
      "collaboration",
      "it-operations"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q045-SRC",
    "pairId": "P236-Q045",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is Microsoft's cloud-storage service?",
    "options": [
      "Google Drive",
      "OneDrive",
      "iCloud",
      "Dropbox"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "OneDrive Microsoft کی cloud-storage service ہے جو files کو online محفوظ اور devices کے درمیان sync کرنے دیتی ہے۔ Google Drive، iCloud اور Dropbox دوسری کمپنیوں کی خدمات ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q45, PDF p.10",
      "referenceUrl": "https://support.microsoft.com/en-us/office/what-is-onedrive-for-work-or-school-187f90af-056f-47c0-9656-cc0ddca7fdc2",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft",
      "onedrive",
      "cloud-storage"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q045-SIM",
    "pairId": "P236-Q045",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which Microsoft 365 feature keeps files synchronized across devices through the cloud?",
    "options": [
      "Notepad",
      "OneDrive",
      "Paint",
      "Device Manager"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "OneDrive files کو cloud میں محفوظ کرکے مختلف devices سے دستیاب اور synchronized رکھتا ہے۔ باقی اختیارات local utilities ہیں اور Microsoft cloud-storage service نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q45",
      "referenceUrl": "https://support.microsoft.com/en-us/office/what-is-onedrive-for-work-or-school-187f90af-056f-47c0-9656-cc0ddca7fdc2",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "onedrive",
      "sync",
      "microsoft-365"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q046-SRC",
    "pairId": "P236-Q046",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol is primarily responsible for reliable data delivery over the Internet?",
    "options": [
      "HTTP",
      "TCP",
      "IP",
      "UDP"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "TCP endpoints کے درمیان reliable، in-order byte stream فراہم کرتا ہے اور گم شدہ segments کی retransmission کر سکتا ہے۔ IP addressing/routing کرتا ہے اور UDP بذاتِ خود delivery guarantee نہیں دیتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q46, PDF p.10",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc9293",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tcp",
      "reliable-delivery",
      "transport-layer"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's typo 'response for' has been corrected to 'responsible for'."
  },
  {
    "id": "P236-Q046-SIM",
    "pairId": "P236-Q046",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which transport protocol is connectionless and does not itself guarantee delivery?",
    "options": [
      "TCP",
      "ARP",
      "HTTPS",
      "UDP"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "UDP datagrams بھیجتا ہے مگر connection establishment، retransmission یا ordered delivery کی ضمانت نہیں دیتا۔ کم overhead کی وجہ سے یہ ان applications میں مفید ہے جہاں speed اہم اور کچھ loss قابلِ قبول ہو۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q46",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc768",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "udp",
      "connectionless",
      "transport-protocol"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q047-SRC",
    "pairId": "P236-Q047",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which Microsoft application was designed for newsletters and desktop publishing?",
    "options": [
      "Word",
      "Publisher",
      "Excel",
      "PowerPoint"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Microsoft Publisher page-layout اور desktop-publishing کاموں، مثلاً newsletters اور brochures، کے لیے بنایا گیا تھا۔ Word عام word processing کے لیے ہے، اگرچہ اس میں بھی سادہ layouts بن سکتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q47, PDF p.10",
      "referenceUrl": "https://support.microsoft.com/en-us/office/create-a-newsletter-using-publisher-2de57cd6-53ba-4501-ae8c-611f377fb8f4",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-publisher",
      "newsletter",
      "desktop-publishing"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q047-SIM",
    "pairId": "P236-Q047",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In Microsoft Publisher, which publication type provides ready-made newsletter layouts?",
    "options": [
      "Slide Shows",
      "Databases",
      "Workbooks",
      "Newsletters"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Publisher میں Newsletters publication type کے تحت newsletter templates اور layout choices ملتی ہیں۔ Workbook Excel اور slide show PowerPoint کی اصطلاحات ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q47",
      "referenceUrl": "https://support.microsoft.com/en-us/office/create-a-newsletter-using-publisher-2de57cd6-53ba-4501-ae8c-611f377fb8f4",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "publisher",
      "newsletters",
      "templates"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q048-SRC",
    "pairId": "P236-Q048",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A 13 m ladder rests with its foot 5 m from a vertical wall. How high up the wall does it reach?",
    "options": [
      "10 m",
      "12 m",
      "15 m",
      "20 m"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "دیوار، زمین اور سیڑھی قائمہ مثلث بناتے ہیں جس میں وتر 13 اور بنیاد 5 میٹر ہے۔ فیثاغورث سے اونچائی √(13²−5²) = √144 = 12 میٹر بنتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q48, PDF p.10",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-8-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pythagorean-theorem",
      "ladder",
      "right-triangle"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q048-SIM",
    "pairId": "P236-Q048",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A 15 m ladder has its foot 9 m from a wall. What vertical height does it reach?",
    "options": [
      "6 m",
      "9 m",
      "12 m",
      "18 m"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قائمہ مثلث میں h² + 9² = 15² ہوگا۔ اس سے h² = 225−81 = 144 اور h = 12 میٹر حاصل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q48",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-8-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "right-triangle",
      "ladder",
      "pythagoras"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q049-SRC",
    "pairId": "P236-Q049",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A circle is inscribed in a square of area 64 cm². What is the circle's area, to two decimal places?",
    "options": [
      "50.27 cm²",
      "54.24 cm²",
      "44.24 cm²",
      "24.27 cm²"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مربع کی ضلع √64 = 8 cm ہے، جو اندرونی دائرے کا diameter بنتی ہے، لہٰذا radius 4 cm ہے۔ دائرے کا رقبہ πr² = 16π ≈ 50.27 cm² ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q49, PDF p.10",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-6-area",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "circle-area",
      "inscribed-circle",
      "square"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The exact area is 16π cm². The printed option 50.27 cm² is the correct two-decimal approximation; using π = 3.14 would instead give 50.24 cm², which is not printed."
  },
  {
    "id": "P236-Q049-SIM",
    "pairId": "P236-Q049",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A circle is inscribed in a square of side 10 cm. What is its exact area?",
    "options": [
      "25π cm²",
      "20π cm²",
      "10π cm²",
      "100π cm²"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اندرونی دائرے کا diameter مربع کی ضلع 10 cm کے برابر ہے، اس لیے radius 5 cm ہے۔ رقبہ πr² = π(5²) = 25π cm² بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q49",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-6-area",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "inscribed-circle",
      "exact-area",
      "pi"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q050-SRC",
    "pairId": "P236-Q050",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Solve 2x² − 3x − 2 = 0.",
    "options": [
      "x = 1, −2",
      "x = −1, 2",
      "x = 3, −1",
      "x = 2, −1/2"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "عبارت کو (2x + 1)(x − 2) میں factor کیا جا سکتا ہے۔ zero-product property سے 2x + 1 = 0 یا x − 2 = 0، لہٰذا roots −1/2 اور 2 ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q50, PDF p.10",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "factoring",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q050-SIM",
    "pairId": "P236-Q050",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What are the roots of 2x² + x − 3 = 0?",
    "options": [
      "x = 3, −1/2",
      "x = −1, 3/2",
      "x = 1, −3/2",
      "x = 2, −3"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "2x² + x − 3 کو (2x + 3)(x − 1) لکھتے ہیں۔ دونوں factors کو صفر کرنے سے x = −3/2 اور x = 1 ملتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q50",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "factorization",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q051-SRC",
    "pairId": "P236-Q051",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A population is 8,000 and 75% attended an event. How many did not attend?",
    "options": [
      "1,500",
      "1,800",
      "2,000",
      "2,500"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اگر 75 فیصد حاضر ہوئے تو غیر حاضر حصہ 100−75 = 25 فیصد ہے۔ 8,000 کا 25 فیصد 0.25 × 8,000 = 2,000 بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q51, PDF p.10",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percentage",
      "attendance",
      "subtraction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q051-SIM",
    "pairId": "P236-Q051",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "If 80% of 3,000 registered candidates attend a test, how many are absent?",
    "options": [
      "400",
      "500",
      "600",
      "800"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "حاضری 80 فیصد ہو تو غیر حاضری 20 فیصد ہے۔ 3,000 × 0.20 = 600، اس لیے 600 امیدوار غیر حاضر ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q51",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percent",
      "attendance",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q052-SRC",
    "pairId": "P236-Q052",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "If x > 0 and y > 0, the point (−x, y) lies in which quadrant?",
    "options": [
      "First",
      "Second",
      "Third",
      "Fourth"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "(−x, y) میں x-coordinate منفی اور y-coordinate مثبت ہے، بشرطیکہ x اور y دونوں مثبت ہوں۔ sign pattern (−,+) دوسرے quadrant کی علامت ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q52, PDF p.10",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/4-1-use-the-rectangular-coordinate-system",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "coordinate-plane",
      "quadrant-ii",
      "signs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed question omits the necessary assumption. The stem now explicitly states x > 0 and y > 0."
  },
  {
    "id": "P236-Q052-SIM",
    "pairId": "P236-Q052",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "If a > 0 and b > 0, in which quadrant does the point (a, −b) lie?",
    "options": [
      "First",
      "Second",
      "Fourth",
      "Third"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نقطہ (a, −b) کا پہلا coordinate مثبت اور دوسرا منفی ہے۔ sign pattern (+,−) چوتھے quadrant کو ظاہر کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q52",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/4-1-use-the-rectangular-coordinate-system",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadrant-iv",
      "coordinates",
      "sign-pattern"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q053-SRC",
    "pairId": "P236-Q053",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "The ratio of sugar to flour is 2:3. If sugar is 18 kg, how much flour is required?",
    "options": [
      "24 kg",
      "25 kg",
      "27 kg",
      "30 kg"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "تناسب 2:3 میں sugar کے دو حصے 18 kg ہیں، اس لیے ایک حصہ 9 kg بنتا ہے۔ flour کے تین حصے 3 × 9 = 27 kg ہوں گے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q53, PDF p.11",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "proportion",
      "recipe"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q053-SIM",
    "pairId": "P236-Q053",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "The ratio of red balls to blue balls is 3:5. If there are 21 red balls, how many blue balls are there?",
    "options": [
      "35",
      "30",
      "28",
      "42"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "تین حصے 21 کے برابر ہیں، لہٰذا ایک حصہ 7 ہے۔ blue balls کے پانچ حصے 5 × 7 = 35 بنتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q53",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "proportion",
      "unit-part"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q054-SRC",
    "pairId": "P236-Q054",
    "kind": "source",
    "categoryId": "english",
    "question": "Which option is the best contextual antonym of 'gumption'?",
    "options": [
      "Courage",
      "Apathy",
      "Intelligence",
      "Weakness"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "gumption کا عام جدید مفہوم initiative، courage یا کام شروع کرنے کی ہمت ہے، جبکہ apathy دلچسپی اور جذبے کی کمی کو کہتے ہیں۔ اس لیے دیے گئے اختیارات میں Apathy سب سے موزوں مخالف لفظ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q54, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/gumption",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gumption",
      "apathy",
      "antonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Apathy is the best contextual opposite among the printed options, although dictionaries list different formal antonyms for gumption's older 'common sense' meaning."
  },
  {
    "id": "P236-Q054-SIM",
    "pairId": "P236-Q054",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to 'gumption' in the phrase 'the gumption to begin'?",
    "options": [
      "Silence",
      "Indifference",
      "Confusion",
      "Initiative"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اس سیاق میں gumption سے مراد کسی مشکل کام کو شروع کرنے کی ہمت اور initiative ہے۔ Indifference یا apathy اس فعال جذبے کے برعکس ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q54",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/gumption",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gumption",
      "initiative",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q055-SRC",
    "pairId": "P236-Q055",
    "kind": "source",
    "categoryId": "english",
    "question": "Which option is closest in meaning to 'termagant'?",
    "options": [
      "Shy person",
      "Vixen",
      "Calm person",
      "Fear"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "termagant ایک جھگڑالو، سخت مزاج عورت کے لیے بولا جاتا ہے اور vixen کا ایک معنی بھی بد مزاج عورت ہے۔ دیے گئے اختیارات میں Vixen قریب ترین synonym ہے، اگرچہ shrew یا virago زیادہ براہِ راست الفاظ ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q55, PDF p.11",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/termagant",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "termagant",
      "vixen",
      "synonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed answer is Vixen. Cambridge directly glosses termagant with 'shrew'; Vixen is retained as the closest available printed choice."
  },
  {
    "id": "P236-Q055-SIM",
    "pairId": "P236-Q055",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is a direct synonym of 'termagant'?",
    "options": [
      "Introvert",
      "Peacemaker",
      "Shrew",
      "Benefactor"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Cambridge Dictionary termagant کو shrew کے مفہوم میں ایک quarrelsome woman کے لیے بیان کرتی ہے۔ لہٰذا Shrew درست براہِ راست synonym ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q55",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/termagant",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "termagant",
      "shrew",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q056-SRC",
    "pairId": "P236-Q056",
    "kind": "source",
    "categoryId": "english",
    "question": "Which word is the antonym of 'malodorous'?",
    "options": [
      "Fragrant",
      "Rotten",
      "Stinking",
      "Smelly"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "malodorous کا مطلب بدبو دار ہے، جبکہ fragrant خوش بو رکھنے والی چیز کو کہتے ہیں۔ Rotten، stinking اور smelly سب ناخوش گوار بو کے مفہوم سے قریب ہیں، اس لیے Fragrant مخالف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q56, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/malodorous",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "malodorous",
      "fragrant",
      "antonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q056-SIM",
    "pairId": "P236-Q056",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is a synonym of 'malodorous'?",
    "options": [
      "Foul-smelling",
      "Perfumed",
      "Odorless",
      "Fresh"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Merriam-Webster کے مطابق malodorous ایسی چیز ہے جس سے bad odor آئے۔ Foul-smelling یہی معنی ادا کرتا ہے، جبکہ باقی اختیارات خوش بو یا بو نہ ہونے کی طرف اشارہ کرتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q56",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/malodorous",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "malodorous",
      "foul-smelling",
      "synonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q057-SRC",
    "pairId": "P236-Q057",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Blind : Eye :: Deaf : ____.",
    "options": [
      "Mouth",
      "Nose",
      "Ear",
      "Hand"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "blindness کا تعلق دیکھنے کی حس اور eye سے ہے، جبکہ deafness کا تعلق hearing اور ear سے ہے۔ اسی عضو اور متعلقہ حسی کمی کے تعلق پر Ear درست جواب بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q57, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/deaf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "blind",
      "deaf"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q057-SIM",
    "pairId": "P236-Q057",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the analogy: Sight : Eye :: Hearing : ____.",
    "options": [
      "Nose",
      "Tongue",
      "Skin",
      "Ear"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "sight کے لیے بنیادی حسی عضو eye ہے اور hearing کے لیے ear۔ اس لیے پہلی نسبت کی طرح دوسری نسبت Hearing : Ear مکمل ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q57",
      "referenceUrl": "https://www.nidcd.nih.gov/health/how-do-we-hear",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "hearing",
      "ear"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q058-SRC",
    "pairId": "P236-Q058",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the synonym analogy: Arid : Parched :: Droughty : ____.",
    "options": [
      "Draft",
      "Earth",
      "Cow",
      "Dry"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "arid اور parched دونوں انتہائی خشک حالت کی طرف اشارہ کرتے ہیں۔ اسی طرح droughty کا بنیادی معنی dry یا drought سے متاثرہ ہے، اس لیے Dry درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q58, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/droughty",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "droughty",
      "dry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q058-SIM",
    "pairId": "P236-Q058",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the synonym analogy: Arid : Dry :: Humid : ____.",
    "options": [
      "Frozen",
      "Barren",
      "Moist",
      "Dusty"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "arid کا قریب ترین سادہ مفہوم dry ہے، جبکہ humid ہوا میں moisture زیادہ ہونے کو کہتے ہیں۔ اس لیے Humid : Moist اسی synonym relationship کو مکمل کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q58",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/humid",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "humid",
      "moist"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q059-SRC",
    "pairId": "P236-Q059",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the printed analogy: Coif : Hair :: ____ : Musical.",
    "options": [
      "Shower",
      "Praise",
      "Close",
      "Score"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "coif بالوں کو ڈھانپنے یا سنوارنے والی cap یا hairstyle ہو سکتی ہے، جبکہ score کسی musical کی لکھی ہوئی موسیقی ہوتی ہے۔ دیے گئے اختیارات میں صرف Score کا musical سے واضح فنی تعلق بنتا ہے، اگرچہ دونوں نسبتیں مکمل طور پر یکساں نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q59, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/coif",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "coif",
      "score"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed analogy is imperfect: a coif covers or arranges hair, whereas a score records or supplies music for a musical. Score is retained as the intended keyed option and the mismatch is disclosed."
  },
  {
    "id": "P236-Q059-SIM",
    "pairId": "P236-Q059",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the analogy: Script : Play :: Score : ____.",
    "options": [
      "Musical",
      "Novel",
      "Painting",
      "Sculpture"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "script کسی play کا تحریری متن ہے، جبکہ score کسی musical کی لکھی یا مرتب موسیقی ہے۔ یوں written plan اور performance work کا تعلق دونوں جوڑوں میں موجود ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q59",
      "referenceUrl": "https://www.britannica.com/art/score-music",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "script",
      "musical-score"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q060-SRC",
    "pairId": "P236-Q060",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the synonym of 'stubborn'.",
    "options": [
      "Flexible",
      "Obstinate",
      "Cheerful",
      "Honest"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "stubborn اور obstinate دونوں کسی رائے یا مقصد پر دلیل کے باوجود اڑے رہنے کے معنی دیتے ہیں۔ Flexible اس کے مخالف مفہوم کے قریب ہے، اس لیے synonym Obstinate ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q60, PDF p.11",
      "referenceUrl": "https://www.merriam-webster.com/thesaurus/stubborn",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "stubborn",
      "obstinate",
      "synonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q060-SIM",
    "pairId": "P236-Q060",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is an antonym of 'obstinate'?",
    "options": [
      "Headstrong",
      "Flexible",
      "Adamant",
      "Unyielding"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "obstinate کا مفہوم اپنی بات سے نہ ہٹنے والا ہے، جبکہ flexible بدلتی دلیل یا صورتِ حال کے مطابق ڈھل سکتا ہے۔ باقی تینوں الفاظ ضد اور نہ جھکنے کے مفہوم سے قریب ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q60",
      "referenceUrl": "https://www.merriam-webster.com/thesaurus/obstinate",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "obstinate",
      "flexible",
      "antonym"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q061-SRC",
    "pairId": "P236-Q061",
    "kind": "source",
    "categoryId": "english",
    "question": "Fill in the blank: He parted ____ his family.",
    "options": [
      "with",
      "to",
      "from",
      "at"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کسی شخص سے جدا ہونے کے معنی میں standard collocation part from someone ہے، لہٰذا 'parted from his family' درست ہے۔ part with عموماً کسی چیز کو چھوڑ دینے یا دے دینے کے معنی دیتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q61, PDF p.11",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/part-from",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "part-from",
      "english-usage"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The book key prints A ('with'), but Cambridge distinguishes 'part from someone' (separate from a person) from 'part with something' (give up a possession). The verified answer is therefore C ('from')."
  },
  {
    "id": "P236-Q061-SIM",
    "pairId": "P236-Q061",
    "kind": "similar",
    "categoryId": "english",
    "question": "Fill in the blank: She refused to part ____ her old letters.",
    "options": [
      "from",
      "with",
      "at",
      "to"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کسی ملکیتی چیز کو چھوڑنے یا دے دینے کے معنی میں part with استعمال ہوتا ہے۔ old letters چیزیں ہیں، اس لیے 'part with her old letters' درست ترکیب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q61",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/part-with",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "part-with",
      "preposition",
      "collocation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q062-SRC",
    "pairId": "P236-Q062",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete John Donne's famous line: 'No man is ____ entire of itself.'",
    "options": [
      "a pond",
      "a sea",
      "a lake",
      "an island"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "John Donne کی Meditation XVII کا معروف جملہ 'No man is an island, entire of itself' ہے۔ اس لیے مناسب article کے ساتھ مکمل جواب an island بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q62, PDF p.11",
      "referenceUrl": "https://www.luminarium.org/sevenlit/donne/meditation17.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "john-donne",
      "island",
      "quotation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan calls this a proverb and has awkward grammar. It is a line from John Donne's prose Meditation XVII, and the wording has been normalized."
  },
  {
    "id": "P236-Q062-SIM",
    "pairId": "P236-Q062",
    "kind": "similar",
    "categoryId": "english",
    "question": "Who wrote the meditation containing the line 'No man is an island'?",
    "options": [
      "Alexander Pope",
      "William Blake",
      "John Milton",
      "John Donne"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "یہ عبارت John Donne کی Devotions upon Emergent Occasions کی Meditation XVII سے ہے۔ اسے اکثر نظم یا کہاوت کہہ دیا جاتا ہے، مگر اصل میں یہ devotional prose کا حصہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q62",
      "referenceUrl": "https://www.luminarium.org/sevenlit/donne/meditation17.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "john-donne",
      "meditation-xvii",
      "literature"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q063-SRC",
    "pairId": "P236-Q063",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best modal for general moral advice: We ____ respect our elders.",
    "options": [
      "must",
      "will",
      "should",
      "shall"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "general advice یا مطلوبہ رویے کے لیے should عام اور موزوں modal ہے، اس لیے 'We should respect our elders' درست امتحانی جواب ہے۔ Must زیادہ سخت ضرورت یا obligation بھی ظاہر کر سکتا ہے، لہٰذا اصل context کے بغیر دونوں ممکن تھے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q63, PDF p.11",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/ought-to",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "should",
      "modal-verb",
      "advice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The original unqualified sentence is semantically ambiguous because 'must' can express strong moral obligation. The stem now explicitly asks for general advice, making 'should' the best answer."
  },
  {
    "id": "P236-Q063-SIM",
    "pairId": "P236-Q063",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the best modal for advice: You ____ consult a doctor if the pain continues.",
    "options": [
      "will",
      "should",
      "can",
      "may"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کسی کو مناسب قدم تجویز کرنے کے لیے should استعمال کیا جاتا ہے۔ یہاں doctor سے مشورہ دینا advice ہے، پیش گوئی یا محض اجازت نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q63",
      "referenceUrl": "https://dictionaryblog.cambridge.org/2017/09/13/i-think-you-should-apologise-giving-advice-and-making-suggestions/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "should",
      "advice",
      "modal"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q064-SRC",
    "pairId": "P236-Q064",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "The book key links a report about Uthman ibn Affan's martyrdom while reciting the Qur'an to which surah?",
    "options": [
      "Surah Al Imran",
      "Surah Al-Ma'idah",
      "Surah An-Nisa",
      "Surah Al-Baqarah"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کتاب کا مطلوبہ جواب سورۃ البقرہ ہے، مگر اس مخصوص روایت کو مستند حقیقت سمجھنا درست نہیں۔ حدیثی تحقیق کے مطابق 'تلاوتِ بقرہ کے دوران شہادت' والا اضافہ موضوع یعنی fabricated ہے، اگرچہ حضرت عثمانؓ کی شہادت کی پیش گوئی دوسری روایات سے ثابت ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q64, PDF p.11",
      "referenceUrl": "https://seekersguidance.org/answers/hadith/is-the-hadith-about-uthmans-martyrdom-while-reciting-quran-authentic/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "uthman-ibn-affan",
      "al-baqarah",
      "hadith-verification"
    ],
    "verificationStatus": "verified-as-disputed",
    "sourceNotes": "The scan duplicates Surah Al Imran as options A and C, so C was replaced by Surah An-Nisa to provide four unique options. More importantly, hadith critics cited by the reference classify the claim about reciting Al-Baqarah at martyrdom as fabricated; the item is framed as what the book key says, not as an authentic event."
  },
  {
    "id": "P236-Q064-SIM",
    "pairId": "P236-Q064",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "How do the cited hadith critics grade the claim that Uthman was martyred while reciting Surah Al-Baqarah?",
    "options": [
      "Mutawatir",
      "Fabricated",
      "Hasan",
      "Sahih"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "امام ذہبی کے حوالے سے اس روایت کے مخصوص حصے کو موضوع اور جھوٹ قرار دیا گیا ہے۔ امتحانی کتاب کی answer key یاد کرنے کے ساتھ روایت کی علمی حیثیت جاننا بھی ضروری ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q64",
      "referenceUrl": "https://seekersguidance.org/answers/hadith/is-the-hadith-about-uthmans-martyrdom-while-reciting-quran-authentic/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hadith-grading",
      "fabricated-report",
      "uthman"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q065-SRC",
    "pairId": "P236-Q065",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "According to Sahih al-Bukhari's account of Khaybar, who received the flag before Allah granted victory?",
    "options": [
      "Umar ibn al-Khattab",
      "Ali ibn Abi Talib",
      "Uthman ibn Affan",
      "Abu Bakr al-Siddiq"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "صحیح بخاری کی روایت میں رسول اللہ ﷺ نے خیبر کے موقع پر جھنڈا حضرت علیؓ کو دیا اور پھر فتح نصیب ہوئی۔ اسی مستند عمومی واقعے کی بنا پر درست جواب Ali ibn Abi Talib ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q65, PDF p.11",
      "referenceUrl": "https://sunnah.com/bukhari:2975",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "khaybar",
      "ali-ibn-abi-talib",
      "sahih-bukhari"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan calls Al-Natah a fort. Historical works usually describe al-Natat as a Khaybar district containing several forts, while the cited sahih hadith establishes Ali's command and victory without naming an 'Al-Natah Fort'. The stem was corrected to the fact directly supported by the primary hadith."
  },
  {
    "id": "P236-Q065-SIM",
    "pairId": "P236-Q065",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "What ailment did Ali ibn Abi Talib have when he joined the Prophet at Khaybar?",
    "options": [
      "A leg wound",
      "A broken arm",
      "Fever",
      "Eye trouble"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "صحیح بخاری میں حضرت علیؓ کے متعلق رمد یعنی آنکھ کی تکلیف کا ذکر ہے۔ اس کے باوجود وہ لشکر سے آ ملے اور انہیں جھنڈا دیا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q65",
      "referenceUrl": "https://sunnah.com/bukhari:2975",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "khaybar",
      "ali",
      "eye-trouble"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q066-SRC",
    "pairId": "P236-Q066",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Shah Wali Allah completed his full Qur'an translation in North India in which language?",
    "options": [
      "Arabic",
      "Sindhi",
      "Persian",
      "English"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "علمی تحقیق کے مطابق شاہ ولی اللہ دہلوی نے 1738 میں قرآن کا مکمل ترجمہ فارسی میں مکمل کیا۔ کتاب کا 'سب سے پہلا' دعویٰ متنازع ہے، اس لیے سوال کو یقینی اور قابلِ تصدیق کارنامے کی صورت میں لکھا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q66, PDF p.11",
      "referenceUrl": "https://www.tandfonline.com/doi/full/10.1080/14781700.2021.1919192",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "shah-wali-allah",
      "persian",
      "quran-translation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed stem claims the Qur'an was first translated in the subcontinent into Persian. Scholarship notes earlier Persian translations and South Asian translation traditions; this version asks the well-attested fact that Shah Wali Allah completed a full Persian translation in 1738."
  },
  {
    "id": "P236-Q066-SIM",
    "pairId": "P236-Q066",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which Delhi scholar completed a full Persian translation of the Qur'an in 1738?",
    "options": [
      "Shah Abdul Qadir",
      "Shah Wali Allah",
      "Sir Syed Ahmad Khan",
      "Allama Iqbal"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "شاہ ولی اللہ دہلوی نے فارسی زبان میں مکمل قرآنی ترجمہ 1151ھ/1738ء میں مکمل کیا۔ ان کے خاندان نے بعد میں برصغیر کی قرآنی اور اردو علمی روایت پر گہرا اثر ڈالا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q66",
      "referenceUrl": "https://www.tandfonline.com/doi/full/10.1080/14781700.2021.1919192",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "shah-wali-allah",
      "1738",
      "persian-translation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q067-SRC",
    "pairId": "P236-Q067",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "What is the Islamic legal term for a contract through which an enslaved person could obtain freedom by agreed payment?",
    "options": [
      "Nadhr",
      "Mukatabat",
      "Jizyah",
      "Waqf"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکاتبت وہ تحریری معاہدہ ہے جس میں غلام مقررہ رقم یا شرائط پوری کرکے آزادی حاصل کرتا تھا۔ قرآن 24:33 میں آزادی کا معاہدہ طلب کرنے والوں کے ساتھ contract کرنے کا ذکر موجود ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q67, PDF p.11",
      "referenceUrl": "https://quran.com/24/33",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mukatabat",
      "emancipation-contract",
      "quran-24-33"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The original Urdu options were transliterated into English and the unclear distractor 'bondwoman' was replaced with the distinct legal term Jizyah."
  },
  {
    "id": "P236-Q067-SIM",
    "pairId": "P236-Q067",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which Qur'anic verse is commonly called the mukataba verse because it mentions an emancipation contract?",
    "options": [
      "2:275",
      "4:3",
      "112:1",
      "24:33"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سورۃ النور کی آیت 24:33 میں مکاتبت یعنی آزادی کے معاہدے کا حکم مذکور ہے۔ اسی وجہ سے علمی لٹریچر اسے mukataba verse کہتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q67",
      "referenceUrl": "https://ramonharvey.com/wp-content/uploads/2019/06/ramon-harvey-slavery-indenture-and-freedom.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quran-24-33",
      "mukataba",
      "surah-an-nur"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q068-SRC",
    "pairId": "P236-Q068",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which of the following was prohibited by Islam?",
    "options": [
      "Usury (riba)",
      "Hajj",
      "Zakat",
      "Fasting"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "قرآن 2:275 واضح کرتا ہے کہ اللہ نے تجارت کو حلال اور ربا کو حرام کیا۔ حج، زکوٰۃ اور روزہ اسلامی عبادات ہیں، اس لیے ممنوع عمل Usury یا riba ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q68, PDF p.11",
      "referenceUrl": "https://quran.com/2/275",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "riba",
      "usury",
      "quran-2-275"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q068-SIM",
    "pairId": "P236-Q068",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which surah contains the statement that trade is permitted and riba is forbidden?",
    "options": [
      "Al-Baqarah",
      "Al-Fatihah",
      "Al-Kawthar",
      "Al-Falaq"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ حکم سورۃ البقرہ کی آیت 275 میں آتا ہے۔ آیت تجارت اور ربا کو ایک جیسا سمجھنے کی تردید کرکے دونوں کا الگ شرعی حکم بیان کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q68",
      "referenceUrl": "https://quran.com/2/275",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "al-baqarah",
      "riba",
      "trade"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q069-SRC",
    "pairId": "P236-Q069",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: بچے بغل میں، ڈھنڈورا ____ میں۔",
    "options": [
      "گھر",
      "گاؤں",
      "شہر",
      "بستی"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مکمل ضرب المثل 'بچے بغل میں، ڈھنڈورا شہر میں' ہے۔ یہ اس وقت بولی جاتی ہے جب مطلوبہ چیز پاس موجود ہو لیکن اسے دور دور تلاش کیا جا رہا ہو۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q69, PDF p.11",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-bagal-men-ladkaa-shahr-men-dhandoraa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ضرب-المثل",
      "شہر",
      "بچے-بغل-میں"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q069-SIM",
    "pairId": "P236-Q069",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What is the correct meaning of the Urdu proverb 'بچے بغل میں، ڈھنڈورا شہر میں'?",
    "options": [
      "شہر میں اعلان کرنا",
      "قریب کی چیز کو دور تلاش کرنا",
      "بچے کو بازار لے جانا",
      "خوشی کی خبر پھیلانا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اس مثل میں چیز خود انسان کے پاس ہے مگر تلاش پورے شہر میں جاری ہے۔ مجازی مفہوم یہی ہے کہ قریب موجود چیز کو بے خبری میں دور ڈھونڈا جائے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q69",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-bagal-men-ladkaa-shahr-men-dhandoraa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "محاورہ",
      "معنی",
      "قریب-کی-چیز"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q070-SRC",
    "pairId": "P236-Q070",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In Urdu grammar, what is a word called that is not derived from another noun or verb?",
    "options": [
      "اسمِ معرفہ",
      "اسمِ جامد",
      "اسمِ مشتق",
      "اسمِ مطلق"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اسمِ جامد بنیادی لفظ ہوتا ہے جو کسی دوسرے لفظ یا فعل سے مشتق نہیں ہوتا۔ اس کے مقابل اسمِ مشتق کسی اصل لفظ یا مصدر سے بنایا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q70, PDF p.11",
      "referenceUrl": "https://norr.numl.edu.pk/repository/filedownload/1072",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اسم-جامد",
      "اردو-قواعد",
      "اسم"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q070-SIM",
    "pairId": "P236-Q070",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which of the following is an example of اسمِ جامد (a primitive noun)?",
    "options": [
      "پتھر",
      "لکھائی",
      "پڑھنے والا",
      "خوب صورتی"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پتھر ایک بنیادی نام ہے جو کسی فعل یا دوسرے اسم سے نہیں بنایا گیا، اس لیے اسمِ جامد ہے۔ لکھائی، پڑھنے والا اور خوب صورتی دوسرے الفاظ سے اخذ شدہ صورتیں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q70",
      "referenceUrl": "https://norr.numl.edu.pk/repository/filedownload/1072",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "اسم-جامد",
      "پتھر",
      "قواعد"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q071-SRC",
    "pairId": "P236-Q071",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: غریب کی جورو سب کی ____۔",
    "options": [
      "بہن",
      "پھوپھی",
      "بھابھی",
      "خالہ"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مشہور ضرب المثل 'غریب کی جورو سب کی بھابھی' ہے۔ اس کا مفہوم یہ ہے کہ کم زور یا غریب شخص پر ہر کوئی حق جتانے اور فائدہ اٹھانے کی کوشش کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q71, PDF p.11",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-gariib-kii-joruu-sab-kii-bhaabii-zabardast-kii-joruu-sab-kii-daadii",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ضرب-المثل",
      "غریب",
      "بھابھی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q071-SIM",
    "pairId": "P236-Q071",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What is the basic meaning of the Urdu proverb 'غریب کی جورو سب کی بھابھی'?",
    "options": [
      "غریب سب سے طاقت ور ہے",
      "رشتے دار ہمیشہ مدد کرتے ہیں",
      "کم زور پر سب کا بس چلتا ہے",
      "دولت سے علم بڑھتا ہے"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہ مثل سماجی کم زوری اور بے اختیاری کی طرف اشارہ کرتی ہے۔ مراد یہ ہے کہ غریب یا کم زور کی چیز پر لوگ بے جا حق جتاتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q71",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-gariib-kii-joruu-sab-kii-bhaabii-zabardast-kii-joruu-sab-kii-daadii",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "مثل",
      "معنی",
      "کم-زور"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q072-SRC",
    "pairId": "P236-Q072",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu sentence: جب میں نے اس سے سو روپے ادھار مانگے تو اس نے ہاتھ ____ کر کے دکھا دیے۔",
    "options": [
      "کھول",
      "پھیلا",
      "بند",
      "جوڑ"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "'ہاتھ جوڑنا' عاجزی، منت سماجت، معذرت یا اپنی کم مائیگی ظاہر کرنے کے لیے بولا جاتا ہے۔ یہاں ادھار دینے سے معذوری ظاہر کرنے کے سیاق میں 'ہاتھ جوڑ' موزوں تکمیل ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q72, PDF p.11",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-haath-jodnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ہاتھ-جوڑنا",
      "محاورہ",
      "جملہ-مکمل"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q072-SIM",
    "pairId": "P236-Q072",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What is one correct meaning of the Urdu idiom 'ہاتھ جوڑنا'?",
    "options": [
      "سامان چھپانا",
      "تیز دوڑنا",
      "منت سماجت کرنا",
      "خط لکھنا"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ریختہ لغت میں ہاتھ جوڑنے کے معانی میں منت، التجا، عاجزی اور معافی مانگنا شامل ہیں۔ اس لیے 'منت سماجت کرنا' درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q72",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-haath-jodnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ہاتھ-جوڑنا",
      "منت",
      "محاورہ"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q073-SRC",
    "pairId": "P236-Q073",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the correct meaning of the Urdu idiom 'ہیرے کی کنی کھانا'?",
    "options": [
      "خود کشی کرنا",
      "امیر ہونا",
      "تعلق بنانا",
      "دھوکا کھانا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ریختہ لغت کے مطابق 'ہیرے کی کنی کھانا' ہیرے کی کرچ کھا کر جان دینے، یعنی خود کشی کرنے کے معنی میں آتا ہے۔ اسے محض دھوکا کھانے یا دولت مند ہونے کے معنی میں استعمال نہیں کیا جاتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q73, PDF p.11",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-hiire?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ہیرے-کی-کنی",
      "محاورہ",
      "خودکشی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q073-SIM",
    "pairId": "P236-Q073",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which Urdu idiom has the same meaning as 'ہیرے کی کنی نگلنا'?",
    "options": [
      "ہیرے کی کنی کھانا",
      "ہاتھ پاؤں پھولنا",
      "آنکھوں میں دھول جھونکنا",
      "دانت کھٹے کرنا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "لغت میں 'ہیرے کی کنی نگلنا' کو 'ہیرے کی کنی کھانا' کی طرف لوٹایا گیا ہے۔ دونوں صورتیں اپنی جان لینے کے اسی قدیم محاوراتی مفہوم کو ظاہر کرتی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q73",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-hiire?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ہیرے-کی-کنی",
      "ہم-معنی",
      "محاورہ"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q074-SRC",
    "pairId": "P236-Q074",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which punctuation mark is used to ask a question in Urdu?",
    "options": [
      "وقفہ",
      "علامتِ استفہام",
      "علامتِ فجائیہ",
      "علامتِ ندائیہ"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سوالیہ یا استفساریہ جملے کے آخر میں علامتِ استفہام لگائی جاتی ہے۔ اردو میں اس کا نشان '؟' ہے، جو قاری کو سوال کا اختتام بتاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q74, PDF p.12",
      "referenceUrl": "https://vatt.gob.pk/pluginfile.php/96/mod_folder/content/0/Public%20Repository/08.%20Books/5.%20Class%20Four/Urdu%204.pdf?forcedownload=1",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "علامت-استفہام",
      "سوال",
      "رموز-اوقاف"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q074-SIM",
    "pairId": "P236-Q074",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which symbol represents علامتِ استفہام (the question mark) in Urdu?",
    "options": [
      "!",
      "؟",
      "،",
      ";"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اردو سوالیہ جملے کے آخر میں دائیں رخ والا نشان '؟' استعمال کرتی ہے۔ '!' تعجب اور '،' سکتہ یا comma کے لیے آتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q74",
      "referenceUrl": "https://vatt.gob.pk/pluginfile.php/96/mod_folder/content/0/Public%20Repository/08.%20Books/5.%20Class%20Four/Urdu%204.pdf?forcedownload=1",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "سوالیہ-نشان",
      "استفہام",
      "اردو"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q075-SRC",
    "pairId": "P236-Q075",
    "kind": "source",
    "categoryId": "urdu",
    "question": "According to the book's convention, how is 'روز' classified in the Urdu compound 'نیم روز'?",
    "options": [
      "سابقہ",
      "فعل",
      "لاحقہ",
      "صفت"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کتابی درجہ بندی میں پہلے جز 'نیم' کے بعد آنے والے جز 'روز' کو لاحقہ قرار دیا گیا ہے۔ عمومی تعریف کے مطابق لاحقہ وہ حرف یا جز ہے جو کسی کلمے کے بعد مل کر نئی ترکیب بنائے، اگرچہ مرکبات کی لسانی تحلیل مختلف بھی ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q75, PDF p.12",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-laahiqa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "لاحقہ",
      "نیم-روز",
      "قواعد"
    ],
    "verificationStatus": "verified-as-book-convention",
    "sourceNotes": "The scan is blurred but appears to ask about روز in نیم روز, and its key marks لاحقہ. This is retained as the book's school-level convention; modern morphological analysis may instead treat نیم as the prefix and روز as the base."
  },
  {
    "id": "P236-Q075-SIM",
    "pairId": "P236-Q075",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In the Urdu word 'بے کار', how is 'بے' classified?",
    "options": [
      "فعل",
      "لاحقہ",
      "سابقہ",
      "ضمیر"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سابقہ وہ جز ہے جو اصل لفظ سے پہلے آکر نیا لفظ یا نیا مفہوم بناتا ہے۔ 'بے کار' میں 'بے' لفظ 'کار' سے پہلے آیا ہے، اس لیے سابقہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q75",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-saabiqa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "سابقہ",
      "بے-کار",
      "لفظ-سازی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q076-SRC",
    "pairId": "P236-Q076",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which punctuation mark is used to divide a long Urdu sentence into shorter parts?",
    "options": [
      "سکتہ",
      "وقفہ",
      "علامتِ استفہام",
      "واوین"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سکتہ یعنی comma (،) جملے کے اندر مختصر ٹھہراؤ اور متعلقہ حصوں کی تقسیم کے لیے استعمال ہوتا ہے۔ وقفہ semicolon (؛) ہے، جبکہ مکمل جملے کے اختتام کی علامت ختمہ (۔) کہلاتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q76, PDF p.12",
      "referenceUrl": "https://udb.gov.pk/kch_is_lughat_k_baray_me.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "سکتہ",
      "رموز-اوقاف",
      "جملہ"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Only A (سکتہ) and B (وقفہ) are visible in the scan. Two plausible, distinct distractors—علامتِ استفہام and واوین—were added to meet the four-option schema."
  },
  {
    "id": "P236-Q076-SIM",
    "pairId": "P236-Q076",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which Urdu punctuation mark normally ends a complete sentence or statement?",
    "options": [
      "سکتہ",
      "ختمہ",
      "وقفہ",
      "واوین"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "جب بات مکمل ہو جائے تو ختمہ یعنی full stop (۔) اختتام کو ظاہر کرتا ہے۔ سکتہ comma (،) اور وقفہ semicolon (؛) ہوتا ہے، اس لیے ان تینوں اصطلاحات کو الگ یاد رکھیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q76",
      "referenceUrl": "https://udb.gov.pk/kch_is_lughat_k_baray_me.php",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ختمہ",
      "جملہ-مکمل",
      "رموز-اوقاف"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q077-SRC",
    "pairId": "P236-Q077",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu literary device first lists several things and then explains their separate relationships?",
    "options": [
      "صنعتِ تجنیس",
      "صنعتِ ایہام",
      "صنعتِ لف و نشر",
      "صنعتِ تضاد"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "لف کے مرحلے میں چند چیزوں کا ذکر اکٹھا کیا جاتا ہے اور نشر میں ان سے متعلق مناسبات کھولی جاتی ہیں۔ اسی ترتیب یا غیر ترتیب والی صنعت کو لف و نشر کہتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q77, PDF p.12",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-laf-o-nashar?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "لف-و-نشر",
      "صنعت",
      "علم-بدیع"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q077-SIM",
    "pairId": "P236-Q077",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What is the form of لف و نشر called when the explanation follows the order of the listed items?",
    "options": [
      "لف و نشرِ مرتب",
      "لف و نشرِ غیر مرتب",
      "صنعتِ تضاد",
      "صنعتِ تلمیح"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جب پہلے بیان کردہ چیزوں کی مناسبات بعد میں اسی ترتیب سے آئیں تو اسے لف و نشرِ مرتب کہتے ہیں۔ ترتیب بدل جائے تو صورت غیر مرتب کہلاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q77",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-laf-o-nashar?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "لف-و-نشر-مرتب",
      "ترتیب",
      "بدیع"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q078-SRC",
    "pairId": "P236-Q078",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the correct meaning of the Urdu proverb 'پڑھے نہ لکھے، نام محمد فاضل'?",
    "options": [
      "قرینے سے مطلب پہچان لینا",
      "بڑے آدمیوں کی بات مان لینا",
      "کچھ نہ جاننے کے باوجود قابل بنے پھرنا",
      "علم بہت، عقل کم ہونا"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہ مثل ایسے شخص کے لیے کہی جاتی ہے جو کسی موضوع کا علم نہ رکھنے کے باوجود خود کو عالم یا قابل ظاہر کرے۔ لفظ 'فاضل' کے معنی learned یا scholar ہونے سے اس میں طنزیہ تضاد پیدا ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 236, Q78, PDF p.12",
      "referenceUrl": "https://urdu.la.utexas.edu/resources/proverbs-and-maxims/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "محمد-فاضل",
      "ضرب-المثل",
      "دکھاوا"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P236-Q078-SIM",
    "pairId": "P236-Q078",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In the proverb 'پڑھے نہ لکھے، نام محمد فاضل', which meaning of 'فاضل' creates the irony?",
    "options": [
      "عالم یا صاحبِ علم",
      "تاجر",
      "مسافر",
      "کاشت کار"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "'فاضل' کا ایک معنی عالم، learned یا صاحبِ فضیلت ہے۔ جب بے علم شخص کا نام فاضل بتایا جائے تو نام اور حقیقت کے فرق سے طنز پیدا ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 236, Q78",
      "referenceUrl": "https://urdu.la.utexas.edu/resources/proverbs-and-maxims/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "فاضل",
      "طنز",
      "کہاوت"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q001-SRC",
    "pairId": "P237-Q001",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Where is the headquarters (seat) of the International Court of Justice?",
    "options": [
      "Geneva",
      "New York",
      "The Hague",
      "Vienna"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "بین الاقوامی عدالتِ انصاف کا مستقل صدر مقام نیدرلینڈز کے شہر دی ہیگ میں پیس پیلس ہے۔ یہ اقوامِ متحدہ کا بنیادی عدالتی ادارہ ہے اور اس کی سرکاری زبانیں انگریزی اور فرانسیسی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q1, PDF p.13",
      "referenceUrl": "https://www.icj-cij.org/court",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "icj",
      "the-hague",
      "un"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q001-SIM",
    "pairId": "P237-Q001",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which are the two official languages of the International Court of Justice?",
    "options": [
      "English and French",
      "English and Spanish",
      "French and Dutch",
      "Arabic and French"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بین الاقوامی عدالتِ انصاف کی دو سرکاری زبانیں انگریزی اور فرانسیسی ہیں۔ عدالت کے پندرہ جج نو سال کی مدت کے لیے منتخب ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.icj-cij.org/court",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "icj",
      "the-hague",
      "un"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q002-SRC",
    "pairId": "P237-Q002",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "On which date did Pakistani forces surrender in Dhaka in 1971, marking Bangladesh's victory?",
    "options": [
      "14 December 1971",
      "15 December 1971",
      "16 December 1971",
      "17 December 1971"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ڈھاکا میں ہتھیار ڈالنے کی تقریب 16 دسمبر 1971 کو ہوئی اور بنگلہ دیش اسی دن یومِ فتح مناتا ہے۔ بنگلہ دیش کی آزادی کی سیاسی و فوجی جدوجہد اس تاریخ سے پہلے کئی ماہ جاری رہی تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q2, PDF p.13",
      "referenceUrl": "https://afd.gov.bd/media/important-occations/victory-day",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bangladesh",
      "1971",
      "victory-day"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source loosely combines the fall of Dhaka and Bangladesh's independence; the website uses the precisely verifiable surrender/Victory Day event."
  },
  {
    "id": "P237-Q002-SIM",
    "pairId": "P237-Q002",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "What does Bangladesh commemorate on Victory Day, observed on 16 December?",
    "options": [
      "Adoption of its constitution",
      "First general election",
      "Joining the United Nations",
      "Surrender in Dhaka at the end of the 1971 war"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بنگلہ دیش کا یومِ فتح 16 دسمبر 1971 کو ڈھاکا میں پاکستانی افواج کے ہتھیار ڈالنے کی یاد میں منایا جاتا ہے۔ سرکاری بنگلہ دیشی حوالہ اسے نو ماہ کی جنگِ آزادی کی فیصلہ کن فتح قرار دیتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://afd.gov.bd/media/important-occations/victory-day",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bangladesh",
      "1971",
      "victory-day"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q003-SRC",
    "pairId": "P237-Q003",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was Pakistan's first civilian Chief Martial Law Administrator?",
    "options": [
      "Liaquat Ali Khan",
      "Ayub Khan",
      "Zulfikar Ali Bhutto",
      "Nawaz Sharif"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ذوالفقار علی بھٹو نے 20 دسمبر 1971 کو صدر اور چیف مارشل لا ایڈمنسٹریٹر کے عہدے سنبھالے۔ وہ اس منصب پر آنے والے پہلے سویلین تھے، اس لیے سوال میں لفظ civilian بنیادی اہمیت رکھتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q3, PDF p.13",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1969-76ve08/d138",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zulfikar-ali-bhutto",
      "martial-law",
      "1971"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says 'Civil Martial Law Administrator'; it is standardized to the historically used title 'civilian Chief Martial Law Administrator'."
  },
  {
    "id": "P237-Q003-SIM",
    "pairId": "P237-Q003",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date did Zulfikar Ali Bhutto assume office as President and Chief Martial Law Administrator?",
    "options": [
      "16 December 1971",
      "18 December 1971",
      "20 December 1971",
      "23 March 1972"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ذوالفقار علی بھٹو نے 20 دسمبر 1971 کو یحییٰ خان کے بعد اقتدار سنبھالا۔ امریکی تاریخی دستاویز بھی اسی تاریخ کو ان کے صدر اور چیف مارشل لا ایڈمنسٹریٹر بننے کی تصدیق کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1969-76ve08/d138",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zulfikar-ali-bhutto",
      "martial-law",
      "1971"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q004-SRC",
    "pairId": "P237-Q004",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who is the Chief Justice of Pakistan as of 22 August 2026?",
    "options": [
      "Qazi Faez Isa",
      "Umar Ata Bandial",
      "Yahya Afridi",
      "Saqib Nisar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "جسٹس یحییٰ آفریدی نے 26 اکتوبر 2024 کو چیف جسٹس آف پاکستان کا عہدہ سنبھالا۔ سپریم کورٹ کی سرکاری فہرست کے مطابق ان کی مقررہ تاریخِ ریٹائرمنٹ 26 اکتوبر 2027 ہے، اس لیے 22 اگست 2026 کے تناظر میں یہی جواب درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q4, PDF p.13",
      "referenceUrl": "https://www.supremecourt.gov.pk/downloads_judgements/all_downloads/List_of_HCJ_and_Honble_Judges_of_Supreme_Court_of_Pakistan.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chief-justice",
      "yahya-afridi",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Current-affairs answer verified for 2026-08-22."
  },
  {
    "id": "P237-Q004-SIM",
    "pairId": "P237-Q004",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On which date did Justice Yahya Afridi assume office as Chief Justice of Pakistan?",
    "options": [
      "26 October 2024",
      "25 October 2023",
      "14 February 2025",
      "26 October 2025"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سپریم کورٹ کی سرکاری فہرست میں جسٹس یحییٰ آفریدی کے بطور چیف جسٹس تقرر کی تاریخ 26 اکتوبر 2024 درج ہے۔ ان کی بطور سپریم کورٹ جج تقرری اس سے پہلے 28 جون 2018 کو ہوئی تھی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.supremecourt.gov.pk/downloads_judgements/all_downloads/List_of_HCJ_and_Honble_Judges_of_Supreme_Court_of_Pakistan.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chief-justice",
      "yahya-afridi",
      "pakistan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q005-SRC",
    "pairId": "P237-Q005",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which Constitution of Pakistan contains the constitutional definition of a Muslim?",
    "options": [
      "Constitution of 1956",
      "Constitution of 1960",
      "Constitution of 1968",
      "Constitution of 1973"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "مسلم اور غیر مسلم کی آئینی تعریف 1973 کے آئین کے آرٹیکل 260 میں شامل ہے۔ یہ تعریف دوسری آئینی ترمیم 1974 کے ذریعے متعلقہ شقوں میں شامل کی گئی تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q5, PDF p.13",
      "referenceUrl": "https://na.gov.pk/uploads/documents/6926e060076ed_467.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution-1973",
      "article-260",
      "definition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q005-SIM",
    "pairId": "P237-Q005",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which Article of Pakistan's Constitution are the definitions of 'Muslim' and 'non-Muslim' provided?",
    "options": [
      "Article 260",
      "Article 2A",
      "Article 1",
      "Article 270"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان کے آئین میں اصطلاحات کی عمومی تعریفیں آرٹیکل 260 میں دی گئی ہیں۔ اسی آرٹیکل میں مسلم اور غیر مسلم کی آئینی تعریف بھی موجود ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://na.gov.pk/uploads/documents/6926e060076ed_467.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution-1973",
      "article-260",
      "definition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q006-SRC",
    "pairId": "P237-Q006",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "How many provinces of Pakistan are named in Article 1 of the 1973 Constitution?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آرٹیکل 1 میں بلوچستان، خیبر پختونخوا، پنجاب اور سندھ چار صوبوں کے طور پر درج ہیں۔ اسلام آباد وفاقی دارالحکومت ہے، اسے صوبہ شمار نہیں کیا جاتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q6, PDF p.13",
      "referenceUrl": "https://na.gov.pk/uploads/documents/6926e060076ed_467.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution",
      "provinces",
      "article-1"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q006-SIM",
    "pairId": "P237-Q006",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which Article of the Constitution describes the Republic and territories of Pakistan?",
    "options": [
      "Article 25",
      "Article 8",
      "Article 1",
      "Article 50"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "آئین کا آرٹیکل 1 ریاست کا نام اور پاکستان کے علاقوں کی ساخت بیان کرتا ہے۔ اسی میں چار صوبے اور اسلام آباد کی وفاقی حیثیت واضح کی گئی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://na.gov.pk/uploads/documents/6926e060076ed_467.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitution",
      "provinces",
      "article-1"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q007-SRC",
    "pairId": "P237-Q007",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "On which date did Pervez Musharraf resign as President of Pakistan?",
    "options": [
      "15 August 2008",
      "16 August 2008",
      "18 August 2008",
      "20 August 2008"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پرویز مشرف نے مواخذے کے دباؤ کے دوران 18 اگست 2008 کو صدارت سے استعفا دیا۔ اس تاریخ کو یاد رکھنے کے لیے سال 2008 اور اگست کے مہینے کو ساتھ جوڑیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q7, PDF p.13",
      "referenceUrl": "https://apnews.com/article/b2fd939ae5643c60d6e702e77626a57b",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pervez-musharraf",
      "president",
      "2008"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q007-SIM",
    "pairId": "P237-Q007",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which President of Pakistan resigned on 18 August 2008?",
    "options": [
      "Rafiq Tarar",
      "Mamnoon Hussain",
      "Asif Ali Zardari",
      "Pervez Musharraf"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "18 اگست 2008 کو استعفا دینے والے صدر پرویز مشرف تھے۔ انہوں نے 1999 میں فوجی اقتدار سنبھالا تھا اور بعد میں صدر بنے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://apnews.com/article/b2fd939ae5643c60d6e702e77626a57b",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pervez-musharraf",
      "president",
      "2008"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q008-SRC",
    "pairId": "P237-Q008",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "On which date was Liaquat Ali Khan assassinated?",
    "options": [
      "16 October 1951",
      "20 October 1951",
      "25 October 1951",
      "27 October 1951"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان کے پہلے وزیر اعظم لیاقت علی خان کو 16 اکتوبر 1951 کو راولپنڈی کے کمپنی باغ میں گولی ماری گئی۔ اس مقام کو بعد میں لیاقت باغ کا نام دیا گیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q8, PDF p.13",
      "referenceUrl": "https://www.nihcr.edu.pk/Latest_English_Journal/4.%20THE%20ASSASSINATION.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "liaquat-ali-khan",
      "assassination",
      "1951"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q008-SIM",
    "pairId": "P237-Q008",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which city was Prime Minister Liaquat Ali Khan assassinated?",
    "options": [
      "Karachi",
      "Lahore",
      "Peshawar",
      "Rawalpindi"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "لیاقت علی خان راولپنڈی کے کمپنی باغ میں ایک جلسے سے خطاب کے دوران شہید ہوئے۔ اسی واقعے کے بعد اس باغ کا نام لیاقت باغ مشہور ہوا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.nihcr.edu.pk/Latest_English_Journal/4.%20THE%20ASSASSINATION.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "liaquat-ali-khan",
      "assassination",
      "1951"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q009-SRC",
    "pairId": "P237-Q009",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who dismissed the government of Prime Minister Khawaja Nazimuddin in 1953?",
    "options": [
      "Ayub Khan",
      "Governor-General Ghulam Muhammad",
      "Iskander Mirza",
      "Yahya Khan"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "گورنر جنرل غلام محمد نے اپریل 1953 میں وزیر اعظم خواجہ ناظم الدین کی حکومت برطرف کی۔ ناظم الدین کو دستور ساز اسمبلی میں اکثریت حاصل ہونے کے باوجود عہدے سے ہٹایا گیا تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q9, PDF p.13",
      "referenceUrl": "https://www.britannica.com/biography/Khwaja-Nazimuddin",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "khawaja-nazimuddin",
      "ghulam-muhammad",
      "dismissal"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q009-SIM",
    "pairId": "P237-Q009",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What office did Ghulam Muhammad hold when he dismissed Khawaja Nazimuddin's ministry?",
    "options": [
      "Prime Minister",
      "Chief Justice",
      "Governor-General",
      "Commander-in-Chief"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "غلام محمد اس وقت پاکستان کے گورنر جنرل تھے۔ اسی آئینی منصب کو استعمال کرتے ہوئے انہوں نے 1953 میں خواجہ ناظم الدین کی وزارت برطرف کی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/biography/Khwaja-Nazimuddin",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "khawaja-nazimuddin",
      "ghulam-muhammad",
      "dismissal"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q010-SRC",
    "pairId": "P237-Q010",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "In which year was the Pakistan-Saudi Strategic Mutual Defense Agreement signed?",
    "options": [
      "2023",
      "2024",
      "2025",
      "2026"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان اور سعودی عرب نے اسٹریٹجک میوچوئل ڈیفنس ایگریمنٹ 17 ستمبر 2025 کو ریاض میں دستخط کیا۔ وزارتِ خارجہ کے مطابق کسی ایک ملک پر جارحیت کو دونوں کے خلاف جارحیت تصور کرنے کا اصول اس معاہدے میں شامل ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q10, PDF p.13",
      "referenceUrl": "https://mofa.gov.pk/press-releases/transcript-of-the-press-briefing-by-the-spokesperson-on-friday-19th-september-2025",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "saudi-arabia",
      "defence-agreement"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Current-affairs fact verified against Pakistan Ministry of Foreign Affairs and dated to the 17 September 2025 signing."
  },
  {
    "id": "P237-Q010-SIM",
    "pairId": "P237-Q010",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On which date was the Pakistan-Saudi Strategic Mutual Defense Agreement signed?",
    "options": [
      "14 August 2025",
      "9 September 2025",
      "15 September 2025",
      "17 September 2025"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "دونوں ملکوں کے رہنماؤں نے 17 ستمبر 2025 کو ریاض میں اس معاہدے پر دستخط کیے۔ یہ جواب 22 اگست 2026 تک دستیاب پاکستانی وزارتِ خارجہ کے سرکاری ریکارڈ پر مبنی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://mofa.gov.pk/press-releases/transcript-of-the-press-briefing-by-the-spokesperson-on-friday-19th-september-2025",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan",
      "saudi-arabia",
      "defence-agreement"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q011-SRC",
    "pairId": "P237-Q011",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "How many Rafale-Marine aircraft did India contract to procure from France in April 2025?",
    "options": [
      "26",
      "36",
      "114",
      "150"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بھارتی وزارتِ دفاع کے سرکاری اعلامیے کے مطابق 28 اپریل 2025 کے بین الحکومتی معاہدے میں 26 رافیل میرین طیارے شامل تھے۔ ان میں 22 سنگل سیٹر اور 4 ٹوئن سیٹر طیارے تھے؛ 114 کا عدد ایک الگ فضائیہ تجویز سے متعلق خبروں میں آیا، اس دستخط شدہ خریداری میں نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q11, PDF p.13",
      "referenceUrl": "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2124851&lang=1&reg=46",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "india",
      "france",
      "rafale-marine"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Corrected against the official Indian government release. The source printed 114 for a vague 'recently ordered' question, but the signed April 2025 France contract was for 26 Rafale-Marine aircraft; original options were 36, 114, 130 and 150."
  },
  {
    "id": "P237-Q011-SIM",
    "pairId": "P237-Q011",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "How many of India's 26 Rafale-Marine aircraft in the April 2025 agreement are single-seaters?",
    "options": [
      "4",
      "18",
      "26",
      "22"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "26 رافیل میرین طیاروں میں 22 سنگل سیٹر اور 4 ٹوئن سیٹر شامل ہیں۔ یہ تقسیم بھارتی پریس انفارمیشن بیورو کے سرکاری اعلامیے میں واضح درج ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2124851&lang=1&reg=46",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "india",
      "france",
      "rafale-marine"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q012-SRC",
    "pairId": "P237-Q012",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Including the 2024 contest, how many United States presidential elections had been held?",
    "options": [
      "58",
      "60",
      "62",
      "70"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "2024 کا امریکی صدارتی انتخاب 60 واں صدارتی انتخاب تھا۔ امریکہ میں یہ انتخاب ہر چار سال بعد ہوتا ہے، اس لیے اگلا انتخاب 2028 میں مقرر ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q12, PDF p.13",
      "referenceUrl": "https://www.congress.gov/118/chrg/CHRG-118hhrg54467/CHRG-118hhrg54467.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-states",
      "presidential-election",
      "2024"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Count is date-scoped through the 2024 election; the next election is scheduled for 2028."
  },
  {
    "id": "P237-Q012-SIM",
    "pairId": "P237-Q012",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "How often is a United States presidential election normally held?",
    "options": [
      "Every two years",
      "Every four years",
      "Every five years",
      "Every six years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "امریکی صدر کا انتخاب معمول کے مطابق ہر چار سال بعد نومبر میں ہوتا ہے۔ سرکاری USA.gov کے مطابق اگلا صدارتی انتخاب 7 نومبر 2028 کو مقرر ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.usa.gov/presidential-election-process",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "united-states",
      "presidential-election",
      "2024"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q013-SRC",
    "pairId": "P237-Q013",
    "kind": "source",
    "categoryId": "geography",
    "question": "The Sulu Sea is a marginal sea of which ocean?",
    "options": [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "بحیرۂ سولو مغربی بحرالکاہل کا ایک حاشیائی سمندر ہے اور جنوب مغربی فلپائن میں واقع ہے۔ یہ بورنیو، پلاوان اور سولو جزائر کے درمیان پھیلا ہوا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q13, PDF p.13",
      "referenceUrl": "https://www.britannica.com/place/Sulu-Sea",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sulu-sea",
      "pacific-ocean",
      "philippines"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q013-SIM",
    "pairId": "P237-Q013",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which sea lies between Palawan, Borneo and the Sulu Archipelago?",
    "options": [
      "Celebes Sea",
      "Java Sea",
      "Andaman Sea",
      "Sulu Sea"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پلاوان، بورنیو اور سولو جزائر کے درمیان موجود سمندر بحیرۂ سولو ہے۔ جغرافیائی طور پر یہ مغربی بحرالکاہل کے سمندری نظام کا حصہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/place/Sulu-Sea",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sulu-sea",
      "pacific-ocean",
      "philippines"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q014-SRC",
    "pairId": "P237-Q014",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which of these glaciers is the longest and lies in the Karakoram range?",
    "options": [
      "Baltoro",
      "Biafo",
      "Siachen",
      "Hispar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دیے گئے چاروں اختیارات میں سیاچن سب سے طویل ہے اور قراقرم میں واقع ہے۔ ناسا اسے زمین کے وسطی عرض البلد کا دوسرا طویل ترین گلیشیئر قرار دیتا ہے، اس لیے اسے مطلقاً دنیا کا سب سے بڑا غیر قطبی گلیشیئر کہنا درست نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q14, PDF p.13",
      "referenceUrl": "https://science.nasa.gov/earth/earth-observatory/siachen-glacier-152572/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "siachen",
      "glacier",
      "karakoram"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed wording calls Siachen the world's largest glacier outside the polar region. NASA describes it more precisely as the second-longest glacier in Earth's midlatitudes, so the website narrows the comparison to the listed Karakoram glaciers."
  },
  {
    "id": "P237-Q014-SIM",
    "pairId": "P237-Q014",
    "kind": "similar",
    "categoryId": "geography",
    "question": "How does NASA rank Siachen Glacier by length among Earth's midlatitude glaciers?",
    "options": [
      "Longest",
      "Second-longest",
      "Third-longest",
      "Fifth-longest"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ناسا کے مطابق سیاچن زمین کے وسطی عرض البلد میں دوسرا طویل ترین گلیشیئر ہے۔ اس کی لمبائی تقریباً 76 کلومیٹر بتائی جاتی ہے اور یہ قراقرم کے بلند پہاڑی خطے میں ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://science.nasa.gov/earth/earth-observatory/siachen-glacier-152572/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "siachen",
      "glacier",
      "karakoram"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q015-SRC",
    "pairId": "P237-Q015",
    "kind": "source",
    "categoryId": "geography",
    "question": "The Alps are located on which continent?",
    "options": [
      "Asia",
      "Africa",
      "Europe",
      "North America"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "الپس یورپ کا بڑا پہاڑی سلسلہ ہے جو کئی ممالک میں پھیلا ہوا ہے۔ فرانس، سوئٹزرلینڈ، اٹلی، آسٹریا اور سلووینیا اس خطے کے نمایاں ممالک ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q15, PDF p.13",
      "referenceUrl": "https://www.britannica.com/place/Alps",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "alps",
      "europe",
      "mountains"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q015-SIM",
    "pairId": "P237-Q015",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which is the highest peak of the Alps?",
    "options": [
      "Mont Blanc",
      "Monte Rosa",
      "Matterhorn",
      "Grossglockner"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مونٹ بلانک الپس کی بلند ترین چوٹی ہے اور فرانس و اٹلی کی سرحد کے قریب واقع ہے۔ میٹرہارن مشہور ضرور ہے لیکن اس کی بلندی مونٹ بلانک سے کم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/place/Alps",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "alps",
      "europe",
      "mountains"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q016-SRC",
    "pairId": "P237-Q016",
    "kind": "source",
    "categoryId": "geography",
    "question": "Tarbela Dam is built on which river?",
    "options": [
      "Jhelum",
      "Indus",
      "Chenab",
      "Kabul"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "تربیلا ڈیم دریائے سندھ پر خیبر پختونخوا میں واقع ہے۔ واپڈا کے مطابق یہ دنیا کے بڑے مٹی بھرائی والے ڈیموں میں شامل ہے اور آبپاشی و بجلی دونوں کے لیے اہم ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q16, PDF p.13",
      "referenceUrl": "https://wapda.gov.pk/?page_id=1986",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tarbela-dam",
      "indus-river",
      "wapda"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q016-SIM",
    "pairId": "P237-Q016",
    "kind": "similar",
    "categoryId": "geography",
    "question": "What type of dam is Tarbela Dam?",
    "options": [
      "Arch dam",
      "Earth-filled dam",
      "Gravity dam",
      "Barrage only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "تربیلا ایک earth-filled یعنی مٹی بھرائی والا ڈیم ہے۔ واپڈا اسے دریائے سندھ پر واقع دنیا کا سب سے بڑا earth-filled ڈیم بیان کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://wapda.gov.pk/?page_id=1986",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tarbela-dam",
      "indus-river",
      "wapda"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q017-SRC",
    "pairId": "P237-Q017",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which traditional irrigation method is especially associated with Balochistan?",
    "options": [
      "Tube well",
      "Canal",
      "Karez",
      "Lift irrigation"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کاریز بلوچستان کا قدیم زیرِ زمین آبپاشی نظام ہے جس میں عمودی کنویں ڈھلوانی سرنگوں سے جڑے ہوتے ہیں۔ پانی عموماً کششِ ثقل سے سطح تک پہنچتا ہے اور پمپ کی ضرورت نہیں رہتی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q17, PDF p.13",
      "referenceUrl": "https://whc.unesco.org/en/tentativelists/6110/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "karez",
      "balochistan",
      "irrigation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source says 'mostly used'; the website uses the more defensible wording 'traditionally associated' because modern irrigation use varies."
  },
  {
    "id": "P237-Q017-SIM",
    "pairId": "P237-Q017",
    "kind": "similar",
    "categoryId": "geography",
    "question": "In a traditional karez system, water is mainly conveyed to the surface by: ",
    "options": [
      "Diesel pumps",
      "Electric turbines",
      "Open concrete canals only",
      "Gravity through sloping tunnels"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کاریز میں زیرِ زمین ڈھلوانی سرنگ پانی کو کششِ ثقل کے ذریعے باہر لاتی ہے۔ عمودی شافٹ تعمیر اور مرمت کے لیے ہوتے ہیں، پانی اٹھانے کے لیے موٹر بنیادی جز نہیں ہوتی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://whc.unesco.org/en/tentativelists/6110/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "karez",
      "balochistan",
      "irrigation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q018-SRC",
    "pairId": "P237-Q018",
    "kind": "source",
    "categoryId": "geography",
    "question": "Nurek Dam is located in which country?",
    "options": [
      "Pakistan",
      "Afghanistan",
      "Tajikistan",
      "Azerbaijan"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نوریک ڈیم تاجکستان میں دوشنبہ سے مشرق کی جانب دریائے وخش پر واقع ہے۔ یہ 300 میٹر بلند embankment dam ہے اور تاجکستان کی بجلی پیداوار میں بنیادی کردار ادا کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q18, PDF p.13",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/239111592834279239/pdf/Environmental-and-Social-Impact-Assessment-Nurek-Hydropower-Rehabilitation-Project-Phase-2-P173804.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nurek-dam",
      "tajikistan",
      "vakhsh-river"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q018-SIM",
    "pairId": "P237-Q018",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Nurek Dam controls which river?",
    "options": [
      "Vakhsh",
      "Panj",
      "Syr Darya",
      "Zeravshan"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "نوریک ڈیم دریائے وخش کو کنٹرول کرتا ہے، جو آگے چل کر پنج کے ساتھ مل کر آمو دریا بناتا ہے۔ عالمی بینک کی دستاویز میں ڈیم کا مقام مغربی تاجکستان بتایا گیا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://documents1.worldbank.org/curated/en/239111592834279239/pdf/Environmental-and-Social-Impact-Assessment-Nurek-Hydropower-Rehabilitation-Project-Phase-2-P173804.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nurek-dam",
      "tajikistan",
      "vakhsh-river"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q019-SRC",
    "pairId": "P237-Q019",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which listed aviation pioneer developed the first successful practical helicopter?",
    "options": [
      "Igor Sikorsky",
      "The Wright brothers",
      "Alexander Graham Bell",
      "Leonardo da Vinci"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ایگور سکورسکی کے VS-300 نے 1939 میں کامیاب پرواز کی اور عملی single-rotor ہیلی کاپٹر کی بنیاد مضبوط کی۔ بعد کا R-4 دنیا کا پہلا بڑے پیمانے پر تیار ہونے والا ہیلی کاپٹر بنا، اگرچہ ہیلی کاپٹر کی ترقی کئی موجدوں کی مشترکہ تاریخ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q19, PDF p.13",
      "referenceUrl": "https://sirismm.si.edu/EADpdfs/NASM.2022.0052.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "helicopter",
      "igor-sikorsky",
      "aviation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The broad word 'inventor' is narrowed because helicopter development involved many earlier experimenters; Sikorsky is credited here with the first successful practical configuration."
  },
  {
    "id": "P237-Q019-SIM",
    "pairId": "P237-Q019",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which Sikorsky model became the world's first mass-produced helicopter?",
    "options": [
      "R-4",
      "VS-300",
      "S-76",
      "CH-53"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سکورسکی R-4 دنیا کا پہلا mass-produced ہیلی کاپٹر تھا اور امریکی فوج نے بھی اسے قبول کیا۔ اس کا prototype XR-4 تھا، جبکہ VS-300 نے عملی ڈیزائن کی راہ ہموار کی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.si.edu/collections/snapshot/sikorsky-xr-4-helicopter",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "helicopter",
      "igor-sikorsky",
      "aviation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q020-SRC",
    "pairId": "P237-Q020",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "What is the rest mass of a photon?",
    "options": [
      "1",
      "0.5",
      "Zero",
      "Infinite"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "فوٹون کی rest mass صفر ہوتی ہے، لیکن اس کے پاس توانائی اور momentum موجود ہوتے ہیں۔ خلا میں فوٹون روشنی کی رفتار سے سفر کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q20, PDF p.13",
      "referenceUrl": "https://science.nasa.gov/wp-content/uploads/2024/04/our-high-energy-universe.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "photon",
      "rest-mass",
      "physics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q020-SIM",
    "pairId": "P237-Q020",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the electric charge of a photon?",
    "options": [
      "Variable",
      "+1 elementary charge",
      "-1 elementary charge",
      "Zero"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "فوٹون برقی طور پر غیر چارج شدہ ذرہ ہے، اس لیے اس کا electric charge صفر ہے۔ ناسا کے تعلیمی حوالہ کے مطابق اس کی rest mass بھی صفر ہے مگر یہ توانائی لے جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://science.nasa.gov/wp-content/uploads/2024/04/our-high-energy-universe.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "photon",
      "rest-mass",
      "physics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q021-SRC",
    "pairId": "P237-Q021",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "In a biochemical reaction, an enzyme acts as a: ",
    "options": [
      "Inhibitor",
      "Reactant",
      "Product",
      "Catalyst"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "انزائم حیاتیاتی catalyst ہوتے ہیں جو reaction کی رفتار بڑھاتے ہیں۔ یہ activation energy کم کرتے ہیں اور عمل کے اختتام پر خود مستقل طور پر خرچ نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q21, PDF p.13",
      "referenceUrl": "https://openstax.org/books/biology/pages/6-5-enzymes",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "enzyme",
      "catalyst",
      "activation-energy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q021-SIM",
    "pairId": "P237-Q021",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What do enzymes lower to speed up biochemical reactions?",
    "options": [
      "Product concentration",
      "Temperature to absolute zero",
      "Activation energy",
      "Atomic number"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "انزائم reaction کے لیے درکار activation energy کو کم کرتے ہیں۔ اس سے reactants کے products میں تبدیل ہونے کی رفتار بڑھ جاتی ہے، مگر reaction کا مجموعی آزاد توانائی فرق نہیں بدلتا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/biology/pages/6-5-enzymes",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "enzyme",
      "catalyst",
      "activation-energy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q022-SRC",
    "pairId": "P237-Q022",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "A genetic disorder caused by an abnormal number or structure of chromosomes is a: ",
    "options": [
      "DNA-free disorder",
      "Plasma disorder",
      "Chromosomal disorder",
      "Nutritional disorder"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کروموسوم کی تعداد یا ساخت میں خرابی chromosomal disorder پیدا کر سکتی ہے۔ جینیاتی بیماریاں صرف کروموسوم سے نہیں بلکہ کسی ایک یا متعدد genes اور DNA sequence کی تبدیلی سے بھی ہو سکتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q22, PDF p.13",
      "referenceUrl": "https://www.genome.gov/about-genomics/fact-sheets/Chromosome-Abnormalities-Fact-Sheet",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chromosome",
      "genetic-disorder",
      "inheritance"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source wording was scientifically unclear. It is rewritten to test the specific printed answer 'Chromosome' without implying that all genetic disorders are chromosomal."
  },
  {
    "id": "P237-Q022-SIM",
    "pairId": "P237-Q022",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Down syndrome is most commonly associated with an extra copy of which chromosome?",
    "options": [
      "Chromosome 7",
      "Chromosome 21",
      "Chromosome 13",
      "X chromosome only"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ڈاؤن سنڈروم میں عموماً کروموسوم 21 کی تین نقول ہوتی ہیں، اسی لیے اسے Trisomy 21 بھی کہتے ہیں۔ نارمل انسانی خلیے میں 23 جوڑے یعنی مجموعی طور پر 46 کروموسوم ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.genome.gov/about-genomics/fact-sheets/Chromosome-Abnormalities-Fact-Sheet",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chromosome",
      "genetic-disorder",
      "inheritance"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q023-SRC",
    "pairId": "P237-Q023",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which part of the brain primarily coordinates body-temperature regulation?",
    "options": [
      "Pituitary gland",
      "Thyroid gland",
      "Hypothalamus",
      "Thalamus"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ہائپوتھیلمس جسمانی درجۂ حرارت کی معلومات جمع کر کے مناسب ردعمل منظم کرتا ہے۔ یہ autonomic nervous system، رویے اور ہارمونل ردعمل کے ذریعے جسم کا اندرونی درجۂ حرارت متوازن رکھتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q23, PDF p.13",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK279126/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hypothalamus",
      "thermoregulation",
      "brain"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q023-SIM",
    "pairId": "P237-Q023",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Besides temperature regulation, which function is also coordinated by the hypothalamus?",
    "options": [
      "Lens focusing",
      "Blood clotting only",
      "Bone formation only",
      "Appetite control"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ہائپوتھیلمس درجۂ حرارت کے ساتھ بھوک، پیاس اور کئی endocrine افعال کو بھی منظم کرتا ہے۔ یہ pituitary gland پر اثر ڈال کر مختلف ہارمونل نظاموں کو مربوط کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK535380/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hypothalamus",
      "thermoregulation",
      "brain"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q024-SRC",
    "pairId": "P237-Q024",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which listed scientist co-discovered neon with Morris Travers?",
    "options": [
      "Isaac Newton",
      "Thomas Edison",
      "William Ramsay",
      "Michael Faraday"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ولیم ریمزے اور مورس ٹریورس نے 1898 میں neon الگ کر کے دریافت کیا۔ اسے صرف ریمزے کی ایجاد کہنا نامکمل ہے کیونکہ دریافت میں ٹریورس بھی شریک تھے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q24, PDF p.13",
      "referenceUrl": "https://periodic-table.rsc.org/element/10/neon",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "neon",
      "william-ramsay",
      "morris-travers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source says 'inventor of Neon gas'; the scientifically accurate wording is co-discoverer, and Morris Travers is acknowledged."
  },
  {
    "id": "P237-Q024-SIM",
    "pairId": "P237-Q024",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "In which year was neon discovered by William Ramsay and Morris Travers?",
    "options": [
      "1894",
      "1904",
      "1898",
      "1910"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ریمسے اور ٹریورس نے neon، krypton اور xenon کی تحقیق کے دوران 1898 میں neon دریافت کیا۔ neon کا نام یونانی لفظ neos یعنی نیا سے اخذ کیا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://periodic-table.rsc.org/element/10/neon",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "neon",
      "william-ramsay",
      "morris-travers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q025-SRC",
    "pairId": "P237-Q025",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "HTML is primarily used to: ",
    "options": [
      "Structure and develop web pages",
      "Manage a relational database",
      "Edit raster graphics",
      "Replace an operating system"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "HTML ویب صفحے کے content اور structure کو بیان کرنے والی markup language ہے۔ صفحے کی ظاہری شکل عموماً CSS اور interactive behavior عموماً JavaScript سے بنایا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q25, PDF p.13",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/HTML",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "html",
      "web-page",
      "markup"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q025-SIM",
    "pairId": "P237-Q025",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which technology is normally used to control the visual presentation of an HTML page?",
    "options": [
      "CSS",
      "SQL",
      "BIOS",
      "FTP"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "HTML مواد کی ساخت بناتا ہے جبکہ CSS رنگ، layout اور visual presentation سنبھالتا ہے۔ JavaScript عام طور پر ویب صفحے کے behavior اور تعامل کے لیے استعمال ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/HTML",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "html",
      "web-page",
      "markup"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q026-SRC",
    "pairId": "P237-Q026",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "In a typical ransomware attack, the victim's files are: ",
    "options": [
      "Permanently deleted in every case",
      "Encrypted",
      "Automatically copied to a printer",
      "Only renamed"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "رینسم ویئر عموماً متاثرہ نظام کی files یا data کو encrypt کر کے ناقابلِ رسائی بناتا ہے۔ حملہ آور decryption یا بحالی کے بدلے تاوان طلب کرتے ہیں، اگرچہ ادائیگی سے بحالی کی ضمانت نہیں ملتی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q26, PDF p.13",
      "referenceUrl": "https://www.cisa.gov/sites/default/files/2023-08/cisa_ransomware.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ransomware",
      "encryption",
      "cybersecurity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q026-SIM",
    "pairId": "P237-Q026",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What do ransomware attackers commonly demand in exchange for attempted data recovery?",
    "options": [
      "A software update",
      "A password change only",
      "A ransom payment",
      "A printer driver"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "رینسم ویئر حملہ آور encrypted data کی بحالی کے بدلے رقم یا cryptocurrency میں تاوان مانگ سکتے ہیں۔ CISA اس کے مقابلے کے لیے backups، patching اور incident response planning کی سفارش کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.cisa.gov/sites/default/files/2023-08/cisa_ransomware.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ransomware",
      "encryption",
      "cybersecurity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q027-SRC",
    "pairId": "P237-Q027",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the main function of Direct Memory Access (DMA)?",
    "options": [
      "Store data permanently",
      "Transfer data between an I/O device and memory with minimal CPU involvement",
      "Print data",
      "Delete data"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "DMA کسی I/O device کو مرکزی memory کے ساتھ data transfer کرنے دیتا ہے اور CPU کو ہر byte خود منتقل نہیں کرنا پڑتا۔ CPU عموماً transfer شروع کرتا ہے اور مکمل ہونے پر اطلاع وصول کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q27, PDF p.13",
      "referenceUrl": "https://docs.kernel.org/core-api/dma-api-howto.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "dma",
      "cpu",
      "memory-transfer"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed option 'Allow data to CPU' is imprecise; the website replaces it with the standard DMA function while retaining option B as correct."
  },
  {
    "id": "P237-Q027-SIM",
    "pairId": "P237-Q027",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "DMA mainly reduces the transfer workload of which component?",
    "options": [
      "Keyboard",
      "Monitor",
      "CPU",
      "Printer cartridge"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "DMA کا بنیادی فائدہ CPU کو مسلسل data movement کے کام سے آزاد کرنا ہے۔ اس دوران processor دوسرے instructions پر کام کر سکتا ہے اور controller transfer سنبھالتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://docs.kernel.org/core-api/dma-api-howto.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "dma",
      "cpu",
      "memory-transfer"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q028-SRC",
    "pairId": "P237-Q028",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Multiprogramming is an operating-system technique that allows: ",
    "options": [
      "More than one program to make progress concurrently",
      "Only one fixed task",
      "No task to execute",
      "Only a single user account"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Multiprogramming میں memory میں متعدد programs رکھے جاتے ہیں اور processor ضرورت کے مطابق ان کے درمیان کام بدلتا ہے۔ جب ایک job انتظار میں ہو تو CPU دوسری job چلا سکتا ہے، جس سے utilization بہتر ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q28, PDF p.13",
      "referenceUrl": "https://www.ibm.com/docs/en/zos-basic-skills?topic=1960s-multiprogramming-multiprocessing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "multiprogramming",
      "operating-system",
      "concurrency"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q028-SIM",
    "pairId": "P237-Q028",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In multiprogramming, what can the processor do when one job is waiting for I/O?",
    "options": [
      "Run another ready job",
      "Shut down permanently",
      "Erase main memory",
      "Disable all interrupts"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "I/O کے انتظار میں موجود job کو عارضی طور پر suspend کر کے processor دوسری ready job پر منتقل ہو سکتا ہے۔ یہی طریقہ CPU کے خالی وقت کو کم کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.ibm.com/docs/en/zos-basic-skills?topic=1960s-multiprogramming-multiprocessing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "multiprogramming",
      "operating-system",
      "concurrency"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q029-SRC",
    "pairId": "P237-Q029",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Database normalization is mainly used to: ",
    "options": [
      "Minimize data redundancy",
      "Delete all data",
      "Increase duplicate data",
      "Copy every record"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Database normalization معلومات کو مناسب related tables میں منظم کر کے غیر ضروری duplication کم کرتی ہے۔ اس سے data integrity بہتر اور update anomalies کا امکان کم ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q29, PDF p.13",
      "referenceUrl": "https://www.ibm.com/think/topics/database-normalization",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "database",
      "normalization",
      "redundancy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q029-SIM",
    "pairId": "P237-Q029",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which problem is database normalization designed to reduce?",
    "options": [
      "Screen brightness",
      "Update anomalies",
      "Network cable length",
      "CPU clock speed"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "غیر منظم اور duplicate data میں ایک ہی حقیقت کئی جگہ بدلنے سے inconsistency پیدا ہو سکتی ہے۔ Normalization tables کو منطقی ساخت دیتی ہے اور ایسی update anomalies کو کم کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.ibm.com/think/topics/database-normalization",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "database",
      "normalization",
      "redundancy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q030-SRC",
    "pairId": "P237-Q030",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which email field hides recipient addresses from the other recipients?",
    "options": [
      "To",
      "Bcc",
      "Cc",
      "Subject"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Bcc field میں شامل recipient کو پیغام ملتا ہے مگر اس کا نام دوسرے recipients کو دکھائی نہیں دیتا۔ To اور Cc میں موجود پتے عموماً باقی وصول کنندگان کو نظر آتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q30, PDF p.14",
      "referenceUrl": "https://support.microsoft.com/en-au/office/show-hide-and-view-the-bcc-blind-carbon-copy-field-in-outlook-for-windows-04304e27-63a2-4276-8884-5077fba0e229",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "email",
      "bcc",
      "privacy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q030-SIM",
    "pairId": "P237-Q030",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What does Bcc stand for in email?",
    "options": [
      "Basic contact copy",
      "Binary carbon code",
      "Blind carbon copy",
      "Backup confidential content"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Bcc کی مکمل شکل Blind Carbon Copy ہے۔ یہ field bulk email میں recipients کی addresses ایک دوسرے سے پوشیدہ رکھنے کے لیے مفید ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://support.microsoft.com/en-au/office/show-hide-and-view-the-bcc-blind-carbon-copy-field-in-outlook-for-windows-04304e27-63a2-4276-8884-5077fba0e229",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "email",
      "bcc",
      "privacy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q031-SRC",
    "pairId": "P237-Q031",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Who created the C programming language?",
    "options": [
      "James Gosling",
      "Dennis Ritchie",
      "Bjarne Stroustrup",
      "Guido van Rossum"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Dennis Ritchie نے Bell Labs میں 1971 سے 1973 کے دوران B زبان کو ترقی دے کر C بنائی اور پہلا compiler لکھا۔ C نے Unix کو مختلف مشینوں پر منتقل کرنے میں اہم کردار ادا کیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q31, PDF p.14",
      "referenceUrl": "https://www.nokia.com/bell-labs/about/dennis-m-ritchie/chist.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "c-language",
      "dennis-ritchie",
      "bell-labs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source option spelling 'Dannis Ritchie' is corrected to 'Dennis Ritchie'."
  },
  {
    "id": "P237-Q031-SIM",
    "pairId": "P237-Q031",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which programming language was the direct predecessor that Dennis Ritchie developed into C?",
    "options": [
      "B",
      "Pascal",
      "FORTRAN",
      "Java"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Ken Thompson کی B زبان نے C کی براہِ راست بنیاد فراہم کی۔ Dennis Ritchie نے B میں data types اور دوسری تبدیلیاں شامل کر کے 1971 تا 1973 C تیار کی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.nokia.com/bell-labs/about/dennis-m-ritchie/chist.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "c-language",
      "dennis-ritchie",
      "bell-labs"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q032-SRC",
    "pairId": "P237-Q032",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which type of primary memory is used for fast, temporary access by a computer?",
    "options": [
      "ROM",
      "HDD",
      "RAM",
      "SSD"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "RAM processor کے زیرِ استعمال programs اور data کو عارضی طور پر رکھتی ہے اور تیز random access دیتی ہے۔ HDD اور SSD secondary storage ہیں، جبکہ RAM عموماً بجلی بند ہونے پر اپنا data کھو دیتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q32, PDF p.14",
      "referenceUrl": "https://www.britannica.com/technology/RAM-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ram",
      "primary-memory",
      "volatile"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q032-SIM",
    "pairId": "P237-Q032",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which memory is normally volatile?",
    "options": [
      "ROM",
      "Flash drive",
      "Optical disc",
      "RAM"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "RAM volatile memory ہے، یعنی power ختم ہونے پر اس میں موجود عارضی data برقرار نہیں رہتا۔ مستقل فائلیں عام طور پر SSD، HDD یا دوسری non-volatile storage میں محفوظ ہوتی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/technology/RAM-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ram",
      "primary-memory",
      "volatile"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q033-SRC",
    "pairId": "P237-Q033",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is a cloud-storage service?",
    "options": [
      "Microsoft Word",
      "Microsoft Excel",
      "Google Drive",
      "Microsoft Paint"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Google Drive ایک cloud-based file storage اور sharing service ہے۔ Word، Excel اور Paint بنیادی طور پر applications ہیں، اگرچہ ان کی files الگ cloud services میں محفوظ کی جا سکتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q33, PDF p.14",
      "referenceUrl": "https://www.google.com/drive/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "google-drive",
      "cloud-storage",
      "files"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q033-SIM",
    "pairId": "P237-Q033",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which Google service is specifically designed for storing and sharing files in the cloud?",
    "options": [
      "Google Translate",
      "Google Maps",
      "Google Drive",
      "Google Calendar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Google Drive documents، تصاویر اور دوسری files کو cloud میں محفوظ اور share کرنے کے لیے بنایا گیا ہے۔ صارف مختلف devices سے اپنے account کے ذریعے ان files تک رسائی حاصل کر سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.google.com/drive/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "google-drive",
      "cloud-storage",
      "files"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q034-SRC",
    "pairId": "P237-Q034",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Who designed the Kenbak-1, recognized by the Computer History Museum as the earliest personal computer?",
    "options": [
      "John Blankenbaker",
      "Bill Gates",
      "Alan Turing",
      "Steve Jobs"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "John Blankenbaker نے Kenbak-1 ڈیزائن کیا، جسے Computer Museum کے مقابلے میں earliest personal computer تسلیم کیا گیا۔ یہ 1971 میں فروخت ہوا، microprocessor سے پہلے بنا اور اس میں 256 bytes memory تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q34, PDF p.14",
      "referenceUrl": "https://www.computerhistory.org/revolution/personal-computers/17/297",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "personal-computer",
      "kenbak-1",
      "john-blankenbaker"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The broad source wording 'inventor of personal computer' is narrowed to the Kenbak-1 recognition because computing-history 'firsts' depend on definitions."
  },
  {
    "id": "P237-Q034-SIM",
    "pairId": "P237-Q034",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What was the name of John Blankenbaker's early personal computer?",
    "options": [
      "Altair 8800",
      "Apple I",
      "Kenbak-1",
      "Micral N"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "John Blankenbaker کے computer کا نام Kenbak-1 تھا۔ Computer History Museum کے مطابق اسے 1971 میں 750 ڈالر میں پیش کیا گیا اور تقریباً 40 units فروخت ہوئے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.computerhistory.org/revolution/personal-computers/17/297",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "personal-computer",
      "kenbak-1",
      "john-blankenbaker"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q035-SRC",
    "pairId": "P237-Q035",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A number is multiplied by 9 and then decreased by 12 to give 72. What is the number?",
    "options": [
      "8",
      "84/9",
      "9",
      "10"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اگر عدد x ہو تو مساوات 9x − 12 = 72 بنے گی۔ دونوں طرف 12 جمع کرنے سے 9x = 84 اور 9 سے تقسیم کرنے پر x = 84/9 یعنی 28/3 حاصل ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q35, PDF p.14",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-2-solve-equations-using-the-division-and-multiplication-properties-of-equality",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "linear-equation",
      "algebra",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q035-SIM",
    "pairId": "P237-Q035",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A number is multiplied by 7 and then increased by 5 to give 54. What is the number?",
    "options": [
      "6",
      "9",
      "8",
      "7"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "مساوات 7x + 5 = 54 ہے۔ پانچ منفی کرنے پر 7x = 49 اور سات سے تقسیم کرنے پر x = 7 آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-2-solve-equations-using-the-division-and-multiplication-properties-of-equality",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "linear-equation",
      "algebra",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q036-SRC",
    "pairId": "P237-Q036",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Simplify (9x² − 6x)/(3x), where x ≠ 0.",
    "options": [
      "2x + 3",
      "3x − 2",
      "x − 3",
      "2x − 3"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اوپر والے اظہار سے 3x مشترک نکالیں: 9x² − 6x = 3x(3x − 2)۔ چونکہ x صفر نہیں ہے، 3x منسوخ ہو کر جواب 3x − 2 رہ جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q36, PDF p.14",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra-2e/pages/7-1-simplify-rational-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rational-expression",
      "simplification",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q036-SIM",
    "pairId": "P237-Q036",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Simplify (8y² + 4y)/(4y), where y ≠ 0.",
    "options": [
      "4y + 1",
      "2y + 1",
      "2y + 4",
      "y + 2"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "8y² + 4y میں سے 4y مشترک لینے پر 4y(2y + 1) بنتا ہے۔ مخرج کا 4y منسوخ کرنے سے 2y + 1 حاصل ہوتا ہے، بشرطیکہ y صفر نہ ہو۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra-2e/pages/7-1-simplify-rational-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rational-expression",
      "simplification",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q037-SRC",
    "pairId": "P237-Q037",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "How many real solutions does 2x² − √5x + 1 = 0 have?",
    "options": [
      "One",
      "Two distinct real solutions",
      "No real solution",
      "Infinitely many"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اس مساوات میں a = 2، b = −√5 اور c = 1 ہیں، لہٰذا discriminant b² − 4ac = 5 − 8 = −3 ہے۔ منفی discriminant کا مطلب ہے کہ کوئی حقیقی حل نہیں، البتہ دو complex solutions موجود ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q37, PDF p.14",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "discriminant",
      "real-roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's option B typo 'Two district solution' is corrected to 'Two distinct real solutions'; the real-number scope is made explicit."
  },
  {
    "id": "P237-Q037-SIM",
    "pairId": "P237-Q037",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "How many real solutions does x² + 4x + 5 = 0 have?",
    "options": [
      "No real solution",
      "Exactly one",
      "Exactly two",
      "Infinitely many"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہاں discriminant 4² − 4(1)(5) = 16 − 20 = −4 ہے۔ چونکہ یہ منفی ہے، مساوات کا کوئی real root نہیں اور دو complex roots ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "discriminant",
      "real-roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q038-SRC",
    "pairId": "P237-Q038",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 1/3 × 3/2 ÷ 1/2.",
    "options": [
      "1/2",
      "1",
      "2/3",
      "3/2"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پہلے 1/3 × 3/2 = 1/2 حاصل ہوتا ہے۔ پھر 1/2 سے تقسیم کا مطلب اس کے reciprocal 2/1 سے ضرب ہے، اس لیے جواب 1 بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q38, PDF p.14",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/4-2-multiply-and-divide-fractions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fractions",
      "multiplication",
      "division"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q038-SIM",
    "pairId": "P237-Q038",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 2/5 × 5/3 ÷ 2/3.",
    "options": [
      "1/2",
      "1",
      "2/3",
      "5/3"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "2/5 × 5/3 کو سادہ کرنے سے 2/3 ملتا ہے۔ اب 2/3 کو 2/3 سے تقسیم کریں تو quotient 1 بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/4-2-multiply-and-divide-fractions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fractions",
      "multiplication",
      "division"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q039-SRC",
    "pairId": "P237-Q039",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "For a tower of fixed height, if the length of its shadow increases, the Sun's angle of elevation: ",
    "options": [
      "Increases",
      "Decreases",
      "Remains the same",
      "Becomes zero in every case"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مقررہ اونچائی h کے لیے tan θ = h/shadow length ہوتا ہے۔ سایہ لمبا ہونے سے ratio کم ہوتا ہے، لہٰذا angle of elevation بھی کم ہو جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q39, PDF p.14",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-2-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trigonometry",
      "shadow",
      "angle-of-elevation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q039-SIM",
    "pairId": "P237-Q039",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "For a pole of fixed height, a shorter shadow indicates that the Sun's angle of elevation is: ",
    "options": [
      "Smaller",
      "Always 0°",
      "Larger",
      "Unrelated to the shadow"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "tan θ اونچائی کو سائے کی لمبائی سے تقسیم کرنے کے برابر ہے۔ سایہ چھوٹا ہو تو یہ ratio بڑھتا ہے اور 0° سے 90° کے درمیان angle θ بھی بڑا ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-2-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trigonometry",
      "shadow",
      "angle-of-elevation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q040-SRC",
    "pairId": "P237-Q040",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "At 24 chocolates per box, how many box-equivalents are needed for 30 chocolates?",
    "options": [
      "3",
      "5",
      "6",
      "1 1/4"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ضروری box-equivalents معلوم کرنے کے لیے 30 کو 24 سے تقسیم کریں۔ 30/24 = 5/4 = 1 1/4، یعنی ایک مکمل ڈبہ اور ایک چوتھائی ڈبے کی گنجائش۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q40, PDF p.14",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "unit-rate",
      "division",
      "boxes"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source wording 'How many boxes made by 30 chocolates' is clarified as a fractional box-equivalent calculation; a practical packing question would require two physical boxes."
  },
  {
    "id": "P237-Q040-SIM",
    "pairId": "P237-Q040",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "At 16 chocolates per box, how many full boxes can be filled with 48 chocolates?",
    "options": [
      "3",
      "2",
      "4",
      "6"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ہر box میں 16 chocolates ہوں تو 48 ÷ 16 = 3 بنتا ہے۔ اس صورت میں تین مکمل boxes بھرے جا سکتے ہیں اور کوئی chocolate باقی نہیں رہتی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "unit-rate",
      "division",
      "boxes"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q041-SRC",
    "pairId": "P237-Q041",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "John ate 20 lb of chicken wings and 15 lb of hot dogs. Kyle ate 20% more wings and 40% more hot dogs. Approximately what percent more total food did Kyle eat?",
    "options": [
      "20%",
      "30%",
      "45%",
      "50%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Kyle نے wings 24 lb اور hot dogs 21 lb کھائے، اس کا total 45 lb ہے۔ John کا total 35 lb تھا، لہٰذا اضافہ 10/35 × 100 ≈ 28.6% ہے جو قریب ترین 30% ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q41, PDF p.15",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percent-increase",
      "weighted-total",
      "food"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q041-SIM",
    "pairId": "P237-Q041",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A total rises from 50 kg to 65 kg. What is the percentage increase?",
    "options": [
      "15%",
      "25%",
      "30%",
      "35%"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اصل مقدار 50 kg اور اضافہ 15 kg ہے۔ Percentage increase = 15/50 × 100 = 30% بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percent-increase",
      "weighted-total",
      "food"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q042-SRC",
    "pairId": "P237-Q042",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "In an exam, 20% of boys and 15% of girls failed. Boys who passed were 70 more than girls who passed, and 90 students failed. How many students appeared?",
    "options": [
      "350",
      "400",
      "450",
      "500"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اگر boys = B اور girls = G ہوں تو 0.20B + 0.15G = 90 اور 0.80B − 0.85G = 70 بنتا ہے۔ دونوں مساوات حل کرنے سے B = 300، G = 200 اور مجموعی تعداد 500 آتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q42, PDF p.15",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/5-4-solve-applications-with-systems-of-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percentages",
      "simultaneous-equations",
      "students"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q042-SIM",
    "pairId": "P237-Q042",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "In a test, 10% of 300 boys and 20% of 200 girls failed. How many students failed in total?",
    "options": [
      "50",
      "60",
      "80",
      "70"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "300 boys کا 10% تیس اور 200 girls کا 20% چالیس ہے۔ دونوں failed groups جمع کرنے سے 30 + 40 = 70 students حاصل ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "percentages",
      "simultaneous-equations",
      "students"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q043-SRC",
    "pairId": "P237-Q043",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Find the volume of a cone with radius 10 cm and height 30 cm.",
    "options": [
      "500π cm³",
      "1000π cm³",
      "2000π cm³",
      "3000π cm³"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مخروط کا حجم V = 1/3 πr²h ہے۔ r = 10 اور h = 30 رکھنے سے V = 1/3 × π × 100 × 30 = 1000π cm³ بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q43, PDF p.15",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cone",
      "volume",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q043-SIM",
    "pairId": "P237-Q043",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the volume of a cone with radius 6 cm and height 12 cm?",
    "options": [
      "72π cm³",
      "144π cm³",
      "108π cm³",
      "432π cm³"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "فارمولے V = 1/3 πr²h میں r = 6 اور h = 12 رکھیں۔ نتیجہ 1/3 × π × 36 × 12 = 144π cm³ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cone",
      "volume",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q044-SRC",
    "pairId": "P237-Q044",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A car travels 30 km in 50 minutes. What is its average speed in km/h?",
    "options": [
      "30 km/h",
      "36 km/h",
      "40 km/h",
      "45 km/h"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "50 minutes کو hours میں بدلیں: 50/60 = 5/6 hour۔ Speed = 30 ÷ (5/6) = 30 × 6/5 = 36 km/h ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q44, PDF p.15",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-5-solve-equations-with-fractions-or-decimals",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "speed",
      "distance",
      "time"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q044-SIM",
    "pairId": "P237-Q044",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A bus covers 45 km in 45 minutes. What is its average speed?",
    "options": [
      "45 km/h",
      "50 km/h",
      "55 km/h",
      "60 km/h"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "45 minutes = 3/4 hour ہوتا ہے۔ Average speed = 45 ÷ 3/4 = 45 × 4/3 = 60 km/h بنتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-5-solve-equations-with-fractions-or-decimals",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "speed",
      "distance",
      "time"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q045-SRC",
    "pairId": "P237-Q045",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Find the distance between the points (0, 5) and (−5, 0).",
    "options": [
      "4",
      "5√2",
      "6",
      "7"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Distance formula کے مطابق d = √[(−5−0)² + (0−5)²] ہے۔ یہ √(25 + 25) = √50 = 5√2 بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q45, PDF p.15",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "distance-formula",
      "coordinates",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q045-SIM",
    "pairId": "P237-Q045",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the distance between (1, 2) and (4, 6)?",
    "options": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "دونوں points کے x-coordinates کا فرق 3 اور y-coordinates کا فرق 4 ہے۔ Distance √(3² + 4²) = √25 = 5 ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "distance-formula",
      "coordinates",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q046-SRC",
    "pairId": "P237-Q046",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "The ratio of rice to wheat is 3:4. If the amount of rice is 21, what is the amount of wheat?",
    "options": [
      "24",
      "26",
      "28",
      "30"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "تین ratio-parts کی قیمت 21 ہے، اس لیے ایک part = 21/3 = 7 ہے۔ Wheat کے چار parts ہیں، لہٰذا 4 × 7 = 28 جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q46, PDF p.16",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "proportion",
      "rice-wheat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q046-SIM",
    "pairId": "P237-Q046",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "The ratio of apples to oranges is 5:7. If there are 25 apples, how many oranges are there?",
    "options": [
      "30",
      "35",
      "32",
      "40"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پانچ parts کی قیمت 25 ہونے سے ایک part = 5 بنتا ہے۔ Oranges سات parts ہیں، اس لیے 7 × 5 = 35 ہوں گے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "proportion",
      "rice-wheat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q047-SRC",
    "pairId": "P237-Q047",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 100^1.5.",
    "options": [
      "100",
      "1000",
      "5000",
      "10000"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "1.5 کو 3/2 لکھا جا سکتا ہے، اس لیے 100^(3/2) = (√100)³ ہے۔ √100 = 10 اور 10³ = 1000، لہٰذا درست جواب 1000 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q47, PDF p.16",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-3-radicals-and-rational-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "radicals",
      "powers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q047-SIM",
    "pairId": "P237-Q047",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 64^(2/3).",
    "options": [
      "8",
      "16",
      "32",
      "128"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "64^(2/3) میں پہلے cube root لیں: ∛64 = 4۔ پھر 4 کا square 16 ہے، اس لیے نتیجہ 16 بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-3-radicals-and-rational-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "radicals",
      "powers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q048-SRC",
    "pairId": "P237-Q048",
    "kind": "source",
    "categoryId": "english",
    "question": "Which word is closest in meaning to ‘picayune’?",
    "options": [
      "Paltry",
      "Rich",
      "Large",
      "Strong"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "’Picayune‘ کا مطلب معمولی، حقیر یا بہت کم اہمیت رکھنے والا ہے۔ ’Paltry‘ بھی معمولی اور کم قدر کے معنی دیتا ہے، اس لیے یہی درست مترادف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q48, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/picayune",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "picayune",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q048-SIM",
    "pairId": "P237-Q048",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to ‘paltry’?",
    "options": [
      "Splendid",
      "Insignificant",
      "Enormous",
      "Powerful"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Paltry‘ ایسی چیز کے لیے آتا ہے جو بہت معمولی یا ناقابلِ قدر ہو۔ ’Insignificant‘ اسی مفہوم کو ظاہر کرتا ہے، جبکہ باقی الفاظ عظمت یا طاقت بتاتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/paltry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "picayune",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q049-SRC",
    "pairId": "P237-Q049",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Outrage : Peeve :: Strive : ____.",
    "options": [
      "Fail",
      "Attempt",
      "Stop",
      "Rest"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Outrage‘ اور ’peeve‘ دونوں ناراض کرنے کے مفہوم میں آ سکتے ہیں۔ اسی طرح ’strive‘ کا مطلب بھرپور کوشش یا attempt کرنا ہے، لہٰذا ’Attempt‘ درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q49, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/strive",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "synonyms",
      "strive"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan reads ‘Outrange’, an apparent typo corrected to ‘Outrage’; the relationship is interpreted as near-synonymy, matching the printed key Attempt."
  },
  {
    "id": "P237-Q049-SIM",
    "pairId": "P237-Q049",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the synonym analogy: Irritate : Annoy :: Endeavor : ____.",
    "options": [
      "Abandon",
      "Attempt",
      "Prevent",
      "Relax"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Irritate‘ اور ’annoy‘ قریب المعنی الفاظ ہیں۔ اسی نسبت سے ’endeavor‘ کا قریب ترین مطلب ’attempt‘ یعنی کوشش کرنا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/endeavor",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "synonyms",
      "strive"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q050-SRC",
    "pairId": "P237-Q050",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Gerrymander : Divide :: Filibuster : ____.",
    "options": [
      "Speak",
      "Delay",
      "Vote",
      "Win"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Gerrymandering انتخابی حدود کو سیاسی فائدے کے لیے تقسیم یا ترتیب دیتا ہے۔ Filibuster قانون سازی پر بحث کو طول دے کر کارروائی یا ووٹ میں تاخیر کرتا ہے، اس لیے ’Delay‘ موزوں جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q50, PDF p.16",
      "referenceUrl": "https://www.senate.gov/about/powers-procedures/filibusters-cloture.htm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "gerrymander",
      "filibuster"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q050-SIM",
    "pairId": "P237-Q050",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which Senate procedure can limit debate and overcome a filibuster?",
    "options": [
      "Impeachment",
      "Cloture",
      "Veto",
      "Adjournment"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "امریکی سینیٹ میں cloture وہ طریقۂ کار ہے جس سے بحث کو محدود کر کے filibuster ختم کیا جا سکتا ہے۔ موجودہ قواعد کے تحت قانون سازی کے اکثر معاملات میں اس کے لیے تین پانچواں حصہ درکار ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.senate.gov/about/powers-procedures/filibusters-cloture.htm",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "gerrymander",
      "filibuster"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q051-SRC",
    "pairId": "P237-Q051",
    "kind": "source",
    "categoryId": "english",
    "question": "He was walking along the pavement when I saw him. What part of speech is ‘when’?",
    "options": [
      "Adverb",
      "Preposition",
      "Conjunction",
      "Pronoun"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہاں ’when‘ دو clauses کو زمانی تعلق کے ساتھ جوڑ رہا ہے۔ ایسا لفظ subordinating conjunction کہلاتا ہے، اس لیے ’Conjunction‘ درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q51, PDF p.16",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/conjunctions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "conjunction",
      "parts-of-speech",
      "when"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source sentence was grammatically inconsistent (‘He is walking … when I saw’); it has been normalized without changing the tested part of speech."
  },
  {
    "id": "P237-Q051-SIM",
    "pairId": "P237-Q051",
    "kind": "similar",
    "categoryId": "english",
    "question": "I stayed indoors because it was raining. What part of speech is ‘because’?",
    "options": [
      "Pronoun",
      "Interjection",
      "Adjective",
      "Conjunction"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "’Because‘ مرکزی clause کو وجہ بتانے والے subordinate clause سے جوڑتا ہے۔ اس کردار میں یہ subordinating conjunction ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/conjunctions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "conjunction",
      "parts-of-speech",
      "when"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q052-SRC",
    "pairId": "P237-Q052",
    "kind": "source",
    "categoryId": "english",
    "question": "He has been sleeping ____ half past nine.",
    "options": [
      "For",
      "Since",
      "From",
      "At"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Since‘ کسی عمل کے آغاز کا مخصوص وقت بتاتا ہے، جیسے half past nine۔ ’For‘ مدت کے ساتھ آتا ہے، مثلاً for two hours، اس لیے یہاں ’Since‘ درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q52, PDF p.16",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/for-or-since",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "since",
      "for",
      "preposition",
      "time"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q052-SIM",
    "pairId": "P237-Q052",
    "kind": "similar",
    "categoryId": "english",
    "question": "They have lived in Lahore ____ five years.",
    "options": [
      "For",
      "At",
      "Since",
      "From"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Five years ایک مدت ہے، آغاز کا نقطہ نہیں۔ مدت کے ساتھ present perfect میں ’for‘ استعمال ہوتا ہے، اس لیے درست جملہ ’for five years‘ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/for-or-since",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "since",
      "for",
      "preposition",
      "time"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q053-SRC",
    "pairId": "P237-Q053",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Chagrin : Criticism :: Sag : ____.",
    "options": [
      "Cringe",
      "Redress",
      "Pressure",
      "Nag"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Analogy کو سبب اور نتیجے کے رشتے کے طور پر پڑھا گیا ہے: criticism سے chagrin یعنی شرمندگی پیدا ہو سکتی ہے۔ اسی طرح pressure یا دباؤ کسی چیز کو sag یعنی جھکا سکتا ہے، لہٰذا ’Pressure‘ جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q53, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/sag",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "cause-effect",
      "sag"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source analogy is unusually phrased; Pressure is retained because it is the printed key and supplies the clearest cause-and-effect relation."
  },
  {
    "id": "P237-Q053-SIM",
    "pairId": "P237-Q053",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which condition is most likely to make a shelf sag?",
    "options": [
      "Bright light",
      "Excessive weight",
      "Fresh paint",
      "Low sound"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Sag کا مطلب وزن یا دباؤ کے باعث درمیان سے نیچے جھکنا ہے۔ شیلف پر حد سے زیادہ وزن ڈالنے سے یہی کیفیت پیدا ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/sag",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "cause-effect",
      "sag"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q054-SRC",
    "pairId": "P237-Q054",
    "kind": "source",
    "categoryId": "english",
    "question": "Which word is closest in meaning to ‘stentorian’?",
    "options": [
      "Soft",
      "Loud",
      "Slow",
      "Weak"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Stentorian‘ خاص طور پر بہت بلند اور گونج دار آواز کے لیے استعمال ہوتا ہے۔ دیے گئے اختیارات میں ’Loud‘ اس کا درست مترادف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q54, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/stentorian",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "stentorian",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q054-SIM",
    "pairId": "P237-Q054",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is an antonym of ‘stentorian’?",
    "options": [
      "Booming",
      "Thunderous",
      "Quiet",
      "Resonant"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Stentorian بلند اور طاقت ور آواز کو کہتے ہیں۔ اس کے برعکس ’quiet‘ دھیمی یا خاموش کیفیت ظاہر کرتا ہے، اس لیے یہی antonym ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/stentorian",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "synonym",
      "stentorian",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q055-SRC",
    "pairId": "P237-Q055",
    "kind": "source",
    "categoryId": "english",
    "question": "She has no match ____ you.",
    "options": [
      "With",
      "To",
      "For",
      "At"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "’Be no match for someone‘ ایک مقررہ انگریزی ترکیب ہے، جس کا مطلب کسی کے مقابلے کے قابل نہ ہونا ہے۔ اسی لیے خالی جگہ میں ’for‘ آئے گا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q55, PDF p.16",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/be-no-match-for",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "match-for",
      "usage"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q055-SIM",
    "pairId": "P237-Q055",
    "kind": "similar",
    "categoryId": "english",
    "question": "The novice was no match ____ the experienced champion.",
    "options": [
      "For",
      "At",
      "With",
      "By"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مقابلے میں کم تر ہونے کے مفہوم کے لیے idiomatic construction ’no match for‘ ہے۔ لہٰذا champion سے پہلے ’for‘ درست preposition ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/be-no-match-for",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "match-for",
      "usage"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q056-SRC",
    "pairId": "P237-Q056",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the proverb: It takes ____ to tango.",
    "options": [
      "One",
      "Two",
      "Three",
      "Four"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل محاورہ ’It takes two to tango‘ ہے۔ اس کا مطلب ہے کہ کسی مشترکہ معاملے یا تنازعے میں عموماً دونوں فریقوں کا کردار ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q56, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/it%20takes%20two%20to%20tango",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "tango",
      "idiom"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q056-SIM",
    "pairId": "P237-Q056",
    "kind": "similar",
    "categoryId": "english",
    "question": "What does the idiom ‘It takes two to tango’ usually imply?",
    "options": [
      "Both parties are involved",
      "One person is always innocent",
      "Dancing requires four people",
      "Success depends only on luck"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ idiom لفظی رقص سے آگے بڑھ کر مشترکہ ذمہ داری کا مفہوم دیتا ہے۔ یعنی صورتِ حال پیدا کرنے یا برقرار رکھنے میں دونوں فریق شامل ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/it%20takes%20two%20to%20tango",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "tango",
      "idiom"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q057-SRC",
    "pairId": "P237-Q057",
    "kind": "source",
    "categoryId": "english",
    "question": "A thick cloud has formed close to the ground. What function does ‘A thick cloud’ perform?",
    "options": [
      "Object",
      "Subject",
      "Verb",
      "Adverb"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’A thick cloud‘ وہ noun phrase ہے جس کے بارے میں جملہ خبر دیتا ہے اور جو فعل ’has formed‘ سے متعلق ہے۔ اس لیے یہ جملے کا subject ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q57, PDF p.16",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/grammar/subject_verb_agreement.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "subject",
      "sentence-structure",
      "noun-phrase"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The fragmented source wording was normalized into one grammatical sentence while preserving the tested phrase and printed answer."
  },
  {
    "id": "P237-Q057-SIM",
    "pairId": "P237-Q057",
    "kind": "similar",
    "categoryId": "english",
    "question": "Bright stars filled the night sky. What function does ‘Bright stars’ perform?",
    "options": [
      "Adverb",
      "Object",
      "Subject",
      "Preposition"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "’Bright stars‘ جملے میں فعل ’filled‘ کرنے والی noun phrase ہے۔ فعل کے انجام دینے والے یا مرکزی موضوع کی حیثیت سے یہ subject ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/grammar/subject_verb_agreement.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "subject",
      "sentence-structure",
      "noun-phrase"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q058-SRC",
    "pairId": "P237-Q058",
    "kind": "source",
    "categoryId": "english",
    "question": "Change into active voice: Let the chair be arranged.",
    "options": [
      "Let someone arrange the chair",
      "Arrange the chair",
      "Someone arranged the chair",
      "The chair was arranged"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Passive imperative ’Let the chair be arranged‘ کا قدرتی active imperative ’Arrange the chair‘ ہے۔ اس میں مخاطب کو براہِ راست حکم دیا گیا ہے اور object ’the chair‘ برقرار رہتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q58, PDF p.16",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/academic_writing/active_and_passive_voice/index.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "active-voice",
      "passive-voice",
      "imperative"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Unclear and ungrammatical distractors in the scan were lightly normalized; the printed correct answer remains Arrange the chair."
  },
  {
    "id": "P237-Q058-SIM",
    "pairId": "P237-Q058",
    "kind": "similar",
    "categoryId": "english",
    "question": "Change into active voice: Let the door be closed.",
    "options": [
      "The door closed",
      "Close the door",
      "The door is closing",
      "Let the door close itself"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Passive command کو active imperative میں بدلنے پر مخاطب implied subject رہتا ہے۔ اس لیے سیدھا حکم ’Close the door‘ درست صورت ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/academic_writing/active_and_passive_voice/index.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "active-voice",
      "passive-voice",
      "imperative"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q059-SRC",
    "pairId": "P237-Q059",
    "kind": "source",
    "categoryId": "english",
    "question": "You cannot teach an old ____ new tricks.",
    "options": [
      "Cat",
      "Fox",
      "Dog",
      "Horse"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مشہور کہاوت ’You can’t teach an old dog new tricks‘ ہے۔ اس سے مراد یہ ہے کہ پختہ عادات رکھنے والے شخص کے طور طریقے بدلنا مشکل ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q59, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/you%20can%27t%20teach%20an%20old%20dog%20new%20tricks",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "old-dog",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The ungrammatical scan wording (‘cannot trained’) was corrected to the standard proverb."
  },
  {
    "id": "P237-Q059-SIM",
    "pairId": "P237-Q059",
    "kind": "similar",
    "categoryId": "english",
    "question": "What is the main meaning of ‘You cannot teach an old dog new tricks’?",
    "options": [
      "Established habits are hard to change",
      "Old animals cannot hear",
      "Learning always ends in childhood",
      "New methods are always inferior"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ کہاوت عمر کا سائنسی قانون بیان نہیں کرتی بلکہ پرانی عادتوں کی مضبوطی پر زور دیتی ہے۔ مطلب یہ ہے کہ دیرینہ طریقوں کو بدلنا عموماً مشکل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/you%20can%27t%20teach%20an%20old%20dog%20new%20tricks",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "old-dog",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q060-SRC",
    "pairId": "P237-Q060",
    "kind": "source",
    "categoryId": "english",
    "question": "Which word is an antonym of ‘demur’?",
    "options": [
      "Refuse",
      "Accept",
      "Delay",
      "Argue"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’Demur‘ کا مطلب اعتراض یا تردد ظاہر کرنا ہے۔ ’Accept‘ کسی بات کو مان لینے کا مفہوم دیتا ہے، اس لیے یہ مناسب antonym ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q60, PDF p.16",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/demur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "demur",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q060-SIM",
    "pairId": "P237-Q060",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to the verb ‘demur’?",
    "options": [
      "Permit",
      "Approve",
      "Welcome",
      "Object"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بطور فعل ’demur‘ کا مطلب اعتراض کرنا یا ہچکچاہٹ ظاہر کرنا ہے۔ ’Object‘ اسی بنیادی مفہوم کا قریب ترین لفظ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/demur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "demur",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q061-SRC",
    "pairId": "P237-Q061",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which wife of Prophet Muhammad (PBUH) was the daughter of al-Harith ibn Abi Dirar of Banu Mustaliq?",
    "options": [
      "Hazrat Juwayriya (RA)",
      "Hazrat Aisha (RA)",
      "Hazrat Hafsa (RA)",
      "Hazrat Zainab (RA)"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "حضرت جویریہ بنت الحارثؓ بنو مصطلق کے سردار الحارث بن ابی ضرار کی بیٹی تھیں۔ غزوۂ بنو مصطلق کے بعد وہ امہات المؤمنین میں شامل ہوئیں، اس لیے درست جواب حضرت جویریہؓ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q61, PDF p.16",
      "referenceUrl": "https://islamicttf.org/assets/biographies/25381084.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "juwayriya",
      "banu-mustaliq",
      "mothers-of-believers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source's awkward wording and spelling ‘Jawairiya’ were normalized to the widely used transliteration Juwayriya."
  },
  {
    "id": "P237-Q061-SIM",
    "pairId": "P237-Q061",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Who was the father of Hazrat Juwayriya bint al-Harith (RA)?",
    "options": [
      "Zayd ibn Harithah",
      "Abu Sufyan ibn Harb",
      "Umar ibn al-Khattab",
      "Al-Harith ibn Abi Dirar"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "حضرت جویریہؓ کے والد الحارث بن ابی ضرار تھے، جو بنو مصطلق کے سردار تھے۔ ان کے نام کا حصہ ’بنت الحارث‘ بھی اسی نسبت کو ظاہر کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://islamicttf.org/assets/biographies/25381084.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "juwayriya",
      "banu-mustaliq",
      "mothers-of-believers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q062-SRC",
    "pairId": "P237-Q062",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "In which city was Hazrat Ali (RA) martyred?",
    "options": [
      "Medina",
      "Makkah",
      "Kufa",
      "Damascus"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "حضرت علیؓ پر کوفہ کی جامع مسجد میں قاتلانہ حملہ ہوا اور وہ 661ء میں وفات پا گئے۔ لہٰذا دیے گئے شہروں میں درست جواب کوفہ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q62, PDF p.16",
      "referenceUrl": "https://www.britannica.com/biography/Ali-Muslim-caliph",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ali-ibn-abi-talib",
      "kufa",
      "martyrdom"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q062-SIM",
    "pairId": "P237-Q062",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Who struck Hazrat Ali (RA) in the fatal attack at Kufa?",
    "options": [
      "Marwan ibn al-Hakam",
      "Abu Sufyan",
      "Amr ibn al-As",
      "Abd al-Rahman ibn Muljam"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "تاریخی روایات کے مطابق عبدالرحمن ابن ملجم نے مسجدِ کوفہ میں حضرت علیؓ پر زہر آلود تلوار سے حملہ کیا۔ اسی زخم کے نتیجے میں حضرت علیؓ کی شہادت ہوئی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/biography/Ali-Muslim-caliph",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ali-ibn-abi-talib",
      "kufa",
      "martyrdom"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q063-SRC",
    "pairId": "P237-Q063",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "What is a Hadith collection arranged according to chapters of fiqh generally called?",
    "options": [
      "Sunan",
      "Musnad",
      "Sahifa",
      "Muwatta"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Sunan کی کتابیں عام طور پر فقہی ابواب کے مطابق مرتب ہوتی ہیں اور احکام سے متعلق احادیث جمع کرتی ہیں۔ سنن ابی داؤد، سنن نسائی، سنن ترمذی اور سنن ابن ماجہ اس طرز کی معروف مثالیں ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q63, PDF p.16",
      "referenceUrl": "https://jurnal.ar-raniry.ac.id/index.php/tafse/article/view/8076",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hadith",
      "sunan",
      "fiqh-chapters"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q063-SIM",
    "pairId": "P237-Q063",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which of the following is a well-known Sunan collection?",
    "options": [
      "Musnad Ahmad",
      "Sunan Abi Dawud",
      "Al-Muwatta",
      "Sahifa Hammam"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سنن ابی داؤد فقہی ابواب پر مرتب معروف Sunan مجموعہ ہے۔ Musnad Ahmad کی بنیادی ترتیب راوی صحابہ کے لحاظ سے ہے، اس لیے وہ یہاں درست انتخاب نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://jurnal.ar-raniry.ac.id/index.php/tafse/article/view/8076",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hadith",
      "sunan",
      "fiqh-chapters"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q064-SRC",
    "pairId": "P237-Q064",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "In which region was the main political centre of the Umayyad Caliphate?",
    "options": [
      "Iraq",
      "Syria",
      "Egypt",
      "Spain"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اموی خلافت کا مرکزی دارالحکومت دمشق تھا، جو شام یعنی Syria میں واقع ہے۔ اگرچہ اموی سلطنت بہت وسیع تھی، اس کا بنیادی سیاسی مرکز شام ہی رہا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q64, PDF p.16",
      "referenceUrl": "https://www.britannica.com/topic/Umayyad-dynasty-Islamic-history",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "umayyad",
      "syria",
      "damascus"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The question is scoped to the main Umayyad Caliphate centred at Damascus, not the later Umayyad emirate and caliphate in al-Andalus."
  },
  {
    "id": "P237-Q064-SIM",
    "pairId": "P237-Q064",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "What was the capital of the Umayyad Caliphate under the Sufyanid and Marwanid caliphs?",
    "options": [
      "Baghdad",
      "Cairo",
      "Cordoba",
      "Damascus"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اموی خلفا نے دمشق کو اپنی سلطنت کا دارالحکومت بنایا تھا۔ بغداد بعد میں عباسی خلافت کا دارالحکومت بنا، جبکہ قرطبہ اندلس کے اموی اقتدار سے وابستہ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.britannica.com/topic/Umayyad-dynasty-Islamic-history",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "umayyad",
      "syria",
      "damascus"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q065-SRC",
    "pairId": "P237-Q065",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Whom did Prophet Muhammad (PBUH) leave in charge of Medina during the expedition of Tabuk?",
    "options": [
      "Hazrat Umar (RA)",
      "Hazrat Ali (RA)",
      "Hazrat Abu Bakr (RA)",
      "Hazrat Uthman (RA)"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "صحیح بخاری کی روایت میں ہے کہ غزوۂ تبوک کے موقع پر رسول اللہ ﷺ نے حضرت علیؓ کو مدینہ میں اپنا قائم مقام چھوڑا۔ اسی موقع پر آپ ﷺ نے حضرت علیؓ سے حضرت ہارونؑ اور حضرت موسیٰؑ والی نسبت کا ذکر فرمایا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q65, PDF p.16",
      "referenceUrl": "https://sunnah.com/bukhari:4416",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tabuk",
      "ali-ibn-abi-talib",
      "medina"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source's grammar was normalized; the scoring fact is the appointment of Hazrat Ali (RA) as deputy in Medina during Tabuk."
  },
  {
    "id": "P237-Q065-SIM",
    "pairId": "P237-Q065",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "During which expedition was Hazrat Ali (RA) left as the Prophet’s deputy in Medina?",
    "options": [
      "Tabuk",
      "Uhud",
      "Badr",
      "Hunayn"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "صحیح بخاری 4416 اس واقعے کو غزوۂ تبوک کے سفر سے جوڑتی ہے۔ حضرت علیؓ کو مدینہ میں اہلِ خانہ اور دیگر ذمہ داریوں کی نگرانی کے لیے چھوڑا گیا تھا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://sunnah.com/bukhari:4416",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tabuk",
      "ali-ibn-abi-talib",
      "medina"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q066-SRC",
    "pairId": "P237-Q066",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "In which Hijri year did the conquest of Makkah take place?",
    "options": [
      "7 AH",
      "8 AH",
      "9 AH",
      "10 AH"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "فتح مکہ رمضان 8 ہجری میں ہوئی، جو تقریباً جنوری 630ء کے مطابق ہے۔ رسول اللہ ﷺ ایک بڑے لشکر کے ساتھ مدینہ سے مکہ کی طرف روانہ ہوئے اور شہر بہت کم خون ریزی کے ساتھ فتح ہوا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q66, PDF p.16",
      "referenceUrl": "https://ignca.gov.in/Asi_data/14534.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "conquest-of-makkah",
      "8-ah",
      "seerah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q066-SIM",
    "pairId": "P237-Q066",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Approximately how many Muslims marched from Medina for the conquest of Makkah in 8 AH?",
    "options": [
      "1,000",
      "3,000",
      "30,000",
      "10,000"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سیرت کے معروف بیان کے مطابق فتح مکہ کے لیے تقریباً دس ہزار افراد کا لشکر مدینہ سے روانہ ہوا۔ یہ واقعہ 8 ہجری میں پیش آیا اور قریش کی مزاحمت بہت محدود رہی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://ignca.gov.in/Asi_data/14534.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "conquest-of-makkah",
      "8-ah",
      "seerah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q067-SRC",
    "pairId": "P237-Q067",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: ڈائن بھی ____ گھر چھوڑ کر کھاتی ہے۔",
    "options": [
      "دس",
      "نو",
      "آٹھ",
      "گیارہ"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مکمل کہاوت ’ڈائن بھی دس گھر چھوڑ کر کھاتی ہے‘ ہے۔ اس کا مفہوم یہ ہے کہ بہت برا شخص بھی عموماً اپنے قریبی ہمسایوں یا آس پاس کے لوگوں کا کچھ لحاظ کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q67, PDF p.16",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-chhod-kar?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "completion",
      "neighbour"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The final verb is blurred in the scan and appears nonstandard; the item has been normalized to the documented proverb while retaining the printed answer دس."
  },
  {
    "id": "P237-Q067-SIM",
    "pairId": "P237-Q067",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: اونچی دکان، ____ پکوان۔",
    "options": [
      "میٹھا",
      "پھیکا",
      "گرم",
      "مہنگا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل ضرب المثل ’اونچی دکان، پھیکا پکوان‘ ہے۔ یہ اس وقت بولی جاتی ہے جب نام، نمود یا شہرت بہت ہو لیکن اصل کام یا معیار کم ہو۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-uunchii-dukaan-phiikaa-pakvaan?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "completion",
      "neighbour"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q068-SRC",
    "pairId": "P237-Q068",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the idiomatic meaning of ہاتھ ملنا?",
    "options": [
      "عزت دینا",
      "تکلیف دینا",
      "افسوس کرنا",
      "بات رد کرنا"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "محاوراتی طور پر ’ہاتھ ملنا‘ کا مطلب افسوس کرنا یا پچھتانا ہے۔ یہ کسی کھوئے ہوئے موقع یا نقصان پر حسرت ظاہر کرنے کے لیے بولا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q68, PDF p.16",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-haath-malnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "haath-malna",
      "meaning"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q068-SIM",
    "pairId": "P237-Q068",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What is the idiomatic meaning of کفِ افسوس ملنا?",
    "options": [
      "پچھتانا",
      "خوشی منانا",
      "دعا دینا",
      "مقابلہ کرنا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "’کفِ افسوس ملنا‘ شدید افسوس اور پچھتاوے کے اظہار کا محاورہ ہے۔ اس میں ہاتھ ملنے کی جسمانی کیفیت حسرت کی علامت بنتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-kaf-e-afsos?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "haath-malna",
      "meaning"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q069-SRC",
    "pairId": "P237-Q069",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In the Urdu expression پانی وانی, how is the word وانی classified?",
    "options": [
      "اسم",
      "مہمل",
      "فعل",
      "کلمہ"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "’پانی‘ بامعنی لفظ ہے جبکہ اس کے ساتھ صوتی مناسبت سے آنے والا ’وانی‘ مستقل معنی نہیں رکھتا۔ اس لیے ’وانی‘ تابعِ مہمل ہے اور دیے گئے اختیارات میں ’مہمل‘ درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q69, PDF p.17",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-paanii-vaanii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "tabe-muhmal",
      "paani-waani"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q069-SIM",
    "pairId": "P237-Q069",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which description best fits the construction پانی وانی?",
    "options": [
      "Two unrelated meaningful nouns",
      "A verb followed by an adjective",
      "A meaningful word followed by a تابعِ مہمل",
      "A proper noun followed by a title"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "تابعِ مہمل میں پہلے ایک بامعنی لفظ آتا ہے اور اس کے بعد صوتی مشابہت والا بے معنی لفظ لگایا جاتا ہے۔ ’پانی وانی‘ میں پانی اصل لفظ اور وانی تابعِ مہمل ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-taabe-e-mohmal?keyword=tauba&lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "tabe-muhmal",
      "paani-waani"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q070-SRC",
    "pairId": "P237-Q070",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In Urdu grammar and naming conventions, محسن الملک is what kind of name?",
    "options": [
      "خطاب",
      "لقب",
      "کنیت",
      "تخلص"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "محسن الملک کا اصل نام سید مہدی علی تھا اور ’محسن الملک‘ انہیں عطا کیا گیا خطاب تھا۔ اسی خطاب سے وہ اس قدر مشہور ہوئے کہ اصل نام پس منظر میں چلا گیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q70, PDF p.17",
      "referenceUrl": "https://www.rekhta.org/authors/mohsinul-mulk/profile?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mohsin-ul-mulk",
      "urdu-grammar",
      "title"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q070-SIM",
    "pairId": "P237-Q070",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In Urdu literary terminology, غالب in the name مرزا غالب is a:",
    "options": [
      "خطاب",
      "کنیت",
      "عرف",
      "تخلص"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "مرزا اسد اللہ خان نے شاعری میں ’غالب‘ کو تخلص کے طور پر اختیار کیا۔ تخلص شاعر کا وہ ادبی نام ہوتا ہے جو اکثر غزل کے مقطع میں بھی آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhta.org/poets/mirza-ghalib/profile?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mohsin-ul-mulk",
      "urdu-grammar",
      "title"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q071-SRC",
    "pairId": "P237-Q071",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu sentence is written correctly?",
    "options": [
      "اسلام و علیکم کے بعد عرض ہے۔",
      "السلام علیکم کے بعد عرض ہے۔",
      "اسلاما علیکم کے بعد عرض ہے۔",
      "اسلام علیکم کے بعد عرض ہے۔"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "درست عربی و اردو املا ’السلام علیکم‘ ہے، جس میں شروع میں الف لام اور ’علیکم‘ ایک لفظ آتا ہے۔ اس لیے ’السلام علیکم کے بعد عرض ہے‘ درست جملہ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q71, PDF p.17",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-assalaamu-alaikum?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-spelling",
      "salaam",
      "sentence-correction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The four options differ only in blurred spellings; they were transcribed from an enlarged scan and checked against the standard expression."
  },
  {
    "id": "P237-Q071-SIM",
    "pairId": "P237-Q071",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which is the correctly written conventional reply to السلام علیکم?",
    "options": [
      "و علیکم اسلام",
      "وعلیکم السلام",
      "وعلیکم اسلام",
      "والیکم السلام"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سلام کا معروف اور درست جواب ’وعلیکم السلام‘ لکھا جاتا ہے۔ اس میں واو کو ’علیکم‘ کے ساتھ اور آخر میں ’السلام‘ درست املا کے ساتھ آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-vaalaikum-assalaam?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-spelling",
      "salaam",
      "sentence-correction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q072-SRC",
    "pairId": "P237-Q072",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu saying: کیا زمانہ تھا، شیر اور بکری ایک ہی ____ پر پانی پیتے تھے۔",
    "options": [
      "دریا",
      "گھاٹ",
      "کنواں",
      "تالاب"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "معروف ترکیب ’شیر اور بکری ایک ہی گھاٹ پر پانی پیتے تھے‘ ہے۔ یہاں ’گھاٹ‘ پانی پینے کی جگہ ہے اور پوری کہاوت امن و عدل کے ایسے دور کی علامت ہے جہاں طاقت ور کمزور کو نقصان نہ پہنچائے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q72, PDF p.17",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-ghaat-kaa-paanii-piinaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "ghaat",
      "justice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Only options A (دریا) and B (گھاٹ) are visible in the scan; plausible options C (کنواں) and D (تالاب) were added for the four-option website format."
  },
  {
    "id": "P237-Q072-SIM",
    "pairId": "P237-Q072",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the expression شیر اور بکری ایک گھاٹ پانی پیتے ہیں imply?",
    "options": [
      "عدل و امن کا دور",
      "قحط کا زمانہ",
      "جنگل کی سیر",
      "پانی کی کمی"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ کہاوت لفظی طور پر جانوروں کے پانی پینے سے زیادہ وسیع مفہوم رکھتی ہے۔ اس سے ایسا عدل و امن مراد ہے جس میں کمزور کو طاقت ور کے ظلم کا خوف نہ ہو۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-ghaat-kaa-paanii-piinaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "ghaat",
      "justice"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q073-SRC",
    "pairId": "P237-Q073",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu idiom: بے پیندے کا ____.",
    "options": [
      "جھکا",
      "پکا",
      "لوٹا",
      "کوئی نہیں"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مکمل محاورہ ’بے پیندے کا لوٹا‘ ہے۔ لوٹے کا پیندا نہ ہو تو وہ ایک جگہ قائم نہیں رہتا، اسی مناسبت سے یہ غیر مستقل مزاج شخص کے لیے بولا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q73, PDF p.17",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-be-pende-kaa-lotaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "be-pende-ka-lota",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The question and options A/B are blurred; the standard documented idiom and the clearly printed key support لوٹا as the verified answer."
  },
  {
    "id": "P237-Q073-SIM",
    "pairId": "P237-Q073",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What kind of person is called بے پیندے کا لوٹا?",
    "options": [
      "غیر مستقل مزاج",
      "بہت بہادر",
      "انتہائی سخی",
      "بہت خاموش"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "’بے پیندے کا لوٹا‘ ایسے شخص کو کہتے ہیں جو اپنی رائے یا وفاداری پر قائم نہ رہے۔ ریختہ بھی اس کے معنی wavering، vacillating اور fickle بیان کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-be-pende-kaa-lotaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "be-pende-ka-lota",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q074-SRC",
    "pairId": "P237-Q074",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu grammatical term denotes a verb construction that negates an action?",
    "options": [
      "فعل نفی",
      "فعل مطلق",
      "فعل امر",
      "فعل ماضی"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جس فعل یا فعلی ترکیب سے کسی کام کے نہ ہونے کا مفہوم نکلے اسے فعلِ نفی کہا جاتا ہے۔ اردو میں ’نہ‘ اور ’نہیں‘ عام طور پر نفی پیدا کرتے ہیں، جبکہ ’مت‘ منفی حکم میں آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q74, PDF p.17",
      "referenceUrl": "https://www.aqa.org.uk/subjects/urdu/gcse/urdu-8648/specification/subject-content/grammar",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "negation",
      "verb"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan is blurred; enlargement confirms option A as فعل نفی rather than the OCR-like reading فعل نہی. The source stem was normalized to state the tested grammar concept explicitly."
  },
  {
    "id": "P237-Q074-SIM",
    "pairId": "P237-Q074",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which verb category is illustrated by the Urdu sentence وہ آج اسکول نہیں گیا؟",
    "options": [
      "فعل امر",
      "فعل نفی",
      "فعل مطلق",
      "فعل مستقبل"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "جملے میں ’نہیں گیا‘ عمل کے واقع نہ ہونے کو ظاہر کرتا ہے۔ اس لیے یہ فعلِ نفی کی مثال ہے، نہ کہ حکم یا مستقبل کی۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.aqa.org.uk/subjects/urdu/gcse/urdu-8648/specification/subject-content/grammar",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "negation",
      "verb"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q075-SRC",
    "pairId": "P237-Q075",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: چیل کے گھونسلے میں ____ کہاں؟",
    "options": [
      "کپاس",
      "گوشت",
      "ماس",
      "کوئی نہیں"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مکمل کہاوت ’چیل کے گھونسلے میں ماس کہاں‘ ہے۔ ’ماس‘ گوشت کے معنی میں ہے اور کہاوت ایسے فضول خرچ شخص کے بارے میں آتی ہے جس کے پاس رقم باقی رہنا دشوار ہو۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q75, PDF p.17",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-chail?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "cheel",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q075-SIM",
    "pairId": "P237-Q075",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does چیل کے گھونسلے میں ماس کہاں suggest?",
    "options": [
      "شکار ہمیشہ آسان ہوتا ہے",
      "محنت سے دولت بڑھتی ہے",
      "مہمان کی عزت کرنی چاہیے",
      "فضول خرچ کے پاس مال نہیں ٹھہرتا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "چیل گوشت فوراً کھا جاتی ہے، اس لیے اس کے گھونسلے میں ماس باقی رہنے کی توقع نہیں۔ مجازی مفہوم یہ ہے کہ مسرف یا فضول خرچ شخص کے پاس مال مشکل سے ٹھہرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-chail?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "cheel",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q076-SRC",
    "pairId": "P237-Q076",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: خدا کی باتیں ____ ہی جانے۔",
    "options": [
      "بندہ",
      "فرشتہ",
      "خدا",
      "کوئی نہیں"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مکمل ضرب المثل ’خدا کی باتیں خدا ہی جانے‘ ہے۔ اس کا مفہوم یہ ہے کہ خدائی راز اور قضا و قدر کی حقیقت مکمل طور پر صرف خدا کو معلوم ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 237, Q76, PDF p.17",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-khudaa-kii-baaten-khudaa-hii-jaane?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "khuda",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P237-Q076-SIM",
    "pairId": "P237-Q076",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which interpretation best matches خدا کی باتیں خدا ہی جانے?",
    "options": [
      "خدائی راز بشر کے علم سے باہر ہیں",
      "ہر راز انسان جان سکتا ہے",
      "صرف فرشتے مستقبل جانتے ہیں",
      "قسمت کا کوئی تصور نہیں"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ کہاوت انسانی علم کی حد اور خدائی مصلحت کی وسعت بیان کرتی ہے۔ یعنی خدا کے بھید اور تقدیر کی پوری حقیقت کسی بشر کے علم میں نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-khudaa-kii-baaten-khudaa-hii-jaane?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "khuda",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q001-SRC",
    "pairId": "P238-Q001",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "In which Pakistani city is the Wazir Khan Mosque located?",
    "options": [
      "Thatta",
      "Karachi",
      "Lahore",
      "Peshawar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مسجد وزیر خان لاہور میں واقع ہے اور یہ مغلیہ دور کی نمایاں عمارت ہے۔ درست جواب لاہور ہے، جبکہ باقی شہروں میں یہ مسجد واقع نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q1, PDF p.18",
      "referenceUrl": "https://auqaf.punjab.gov.pk/wazir-khan-mosque",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mosques",
      "lahore"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q001-SIM",
    "pairId": "P238-Q001",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "In which Pakistani city is the Badshahi Mosque located?",
    "options": [
      "Multan",
      "Lahore",
      "Islamabad",
      "Thatta"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "بادشاہی مسجد لاہور میں مغل بادشاہ اورنگزیب کے عہد میں تعمیر ہوئی۔ اس لیے چاروں اختیارات میں لاہور درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q1",
      "referenceUrl": "https://walledcitylahore.gop.pk/badshahi-mosque/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mosques",
      "lahore"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q002-SRC",
    "pairId": "P238-Q002",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year was Pakistan's first nationwide martial law imposed?",
    "options": [
      "1958",
      "1960",
      "1969",
      "1971"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان میں پہلا ملک گیر مارشل لا 7 اکتوبر 1958 کو نافذ ہوا۔ صدر اسکندر مرزا نے اسے نافذ کیا اور جنرل ایوب خان کو چیف مارشل لا ایڈمنسٹریٹر مقرر کیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q2, PDF p.18",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "martial-law",
      "1958"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source wording attributes imposition directly to Ayub Khan. The National Assembly history records that President Iskander Mirza proclaimed martial law on 7 October 1958 and appointed General Ayub Khan Chief Martial Law Administrator; the year 1958 remains the verified answer."
  },
  {
    "id": "P238-Q002-SIM",
    "pairId": "P238-Q002",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Who proclaimed Pakistan's first nationwide martial law on 7 October 1958?",
    "options": [
      "Ayub Khan",
      "Iskander Mirza",
      "Yahya Khan",
      "Zulfikar Ali Bhutto"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "7 اکتوبر 1958 کو مارشل لا کا اعلان صدر اسکندر مرزا نے کیا تھا۔ ایوب خان کو چیف مارشل لا ایڈمنسٹریٹر بنایا گیا اور وہ بعد میں صدر بنے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q2",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "martial-law",
      "1958"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q003-SRC",
    "pairId": "P238-Q003",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "When was the Tashkent Declaration signed by Pakistan and India?",
    "options": [
      "July 1960",
      "Jan 1966",
      "March 1966",
      "July 1966"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "تاشقند اعلامیہ 10 جنوری 1966 کو بھارت اور پاکستان کے درمیان طے پایا۔ اسی لیے جنوری 1966 والا انتخاب درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q3, PDF p.18",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1964-68v25/d278",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tashkent",
      "1965-war"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q003-SIM",
    "pairId": "P238-Q003",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "The Tashkent Declaration followed which armed conflict?",
    "options": [
      "The 1965 India–Pakistan war",
      "The 1971 India–Pakistan war",
      "The Kargil conflict",
      "The First Kashmir War"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "تاشقند اعلامیہ 1965 کی بھارت پاکستان جنگ کے بعد سوویت ثالثی میں طے پایا۔ اس کا مقصد دونوں ملکوں کے درمیان جنگ کے بعد تعلقات بحال کرنا تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q3",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1964-68v25/d278",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tashkent",
      "1965-war"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q004-SRC",
    "pairId": "P238-Q004",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year did Pakistan join the Non-Aligned Movement?",
    "options": [
      "1979",
      "1981",
      "1985",
      "None of these"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان 1979 میں غیر وابستہ تحریک کا باقاعدہ رکن بنا۔ سیٹو اور سینٹو سے وابستگی ختم ہونے کے بعد اس کی غیر وابستہ تحریک میں شمولیت ممکن ہوئی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q4, PDF p.18",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1977-80v12/d142",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "NAM",
      "CENTO",
      "1979"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q004-SIM",
    "pairId": "P238-Q004",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which year did Pakistan withdraw from CENTO as the alliance collapsed?",
    "options": [
      "1979",
      "1971",
      "1965",
      "1985"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سینٹو 1979 میں ختم ہوا اور پاکستان کی رکنیت بھی اسی سال اختتام کو پہنچی۔ اسی پس منظر میں پاکستان غیر وابستہ تحریک میں شامل ہوا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q4",
      "referenceUrl": "https://history.state.gov/historicaldocuments/frus1977-80v12/d142",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "NAM",
      "CENTO",
      "1979"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q005-SRC",
    "pairId": "P238-Q005",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which city of Punjab is famous for camel-skin art?",
    "options": [
      "Multan",
      "Bahawalpur",
      "Sialkot",
      "Gujranwala"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اونٹ کی کھال سے بننے والے منقش چراغ اور دوسری دست کاریاں ملتان کی شناخت ہیں۔ اس لیے درست جواب ملتان ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q5, PDF p.18",
      "referenceUrl": "https://www.app.com.pk/national/cultural-elegance-camel-skin-lamps-illuminating-homes-worldwide/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "handicrafts",
      "multan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q005-SIM",
    "pairId": "P238-Q005",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which Punjab city is especially associated with blue pottery?",
    "options": [
      "Sialkot",
      "Gujranwala",
      "Jhelum",
      "Multan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ملتان کی نیلی کاشی کاری اور بلیو پاٹری معروف روایتی ہنر ہیں۔ اسی بنا پر ملتان درست انتخاب بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q5",
      "referenceUrl": "https://www.app.com.pk/national/cultural-elegance-camel-skin-lamps-illuminating-homes-worldwide/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "handicrafts",
      "multan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q006-SRC",
    "pairId": "P238-Q006",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was the first foreign minister of Pakistan?",
    "options": [
      "Hamid-ul-Haq",
      "Khawaja Nazimuddin",
      "Sir Muhammad Zafarullah Khan",
      "Muhammad Ali Bogra"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سر محمد ظفراللہ خان پاکستان کے پہلے وزیر خارجہ تھے۔ انہوں نے قیام پاکستان کے فوراً بعد 1947 میں یہ منصب سنبھالا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q6, PDF p.18",
      "referenceUrl": "https://mofa.gov.pk/profiles/sir-mohammad-zafarullah-khan",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "foreign-minister",
      "zafarullah-khan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q006-SIM",
    "pairId": "P238-Q006",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Until which year did Sir Muhammad Zafarullah Khan serve his first term as Pakistan's foreign minister?",
    "options": [
      "1951",
      "1958",
      "1954",
      "1962"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "وزارت خارجہ کے سرکاری تعارف کے مطابق ظفراللہ خان کا پہلا دور 1947 سے 1954 تک تھا۔ لہٰذا 1954 درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q6",
      "referenceUrl": "https://mofa.gov.pk/profiles/sir-mohammad-zafarullah-khan",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "foreign-minister",
      "zafarullah-khan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q007-SRC",
    "pairId": "P238-Q007",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "What is the minimum voting age in Pakistan?",
    "options": [
      "16 years",
      "17 years",
      "18 years",
      "21 years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان میں ووٹر بننے کی کم از کم عمر اٹھارہ سال ہے۔ اس لیے 18 والا انتخاب درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q7, PDF p.18",
      "referenceUrl": "https://na.gov.pk/en/content.php/content.php?id=10",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "voting-age",
      "constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q007-SIM",
    "pairId": "P238-Q007",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What is the minimum age required to be elected President of Pakistan?",
    "options": [
      "30 years",
      "35 years",
      "40 years",
      "45 years"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "آئین پاکستان کے تحت صدر منتخب ہونے کے لیے کم از کم عمر پینتالیس سال ہے۔ ووٹر کی عمر اور صدر کی اہلیت کی عمر الگ الگ شرائط ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q7",
      "referenceUrl": "https://na.gov.pk/en/content.php/content.php?id=10",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "voting-age",
      "constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q008-SRC",
    "pairId": "P238-Q008",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was the first Chief Justice of Pakistan's Federal Constitutional Court?",
    "options": [
      "Justice Yahya Afridi",
      "Justice Qazi Faez Isa",
      "Justice Amin-ud-Din Khan",
      "Justice Munib Akhtar"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "وفاقی آئینی عدالت کے قیام کے بعد جسٹس امین الدین خان اس کے پہلے چیف جسٹس بنے۔ 22 اگست 2026 کو عدالت کی سرکاری ویب سائٹ بھی انہی کا نام درج کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q8, PDF p.18",
      "referenceUrl": "https://fccp.gov.pk/chief-justice",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitutional-court",
      "chief-justice",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "This is a time-sensitive office-holder question. It is verified against the Federal Constitutional Court's official Chief Justice page as accessed on 22 August 2026; spellings in the scan were normalized."
  },
  {
    "id": "P238-Q008-SIM",
    "pairId": "P238-Q008",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "What is the official name of the court first headed by Justice Amin-ud-Din Khan?",
    "options": [
      "Supreme Judicial Court",
      "National Constitutional Tribunal",
      "Federal Constitutional Court",
      "Federal Shariat Court"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سرکاری نام Federal Constitutional Court of Pakistan ہے۔ اسے وفاقی شرعی عدالت یا سپریم کورٹ سے خلط نہیں کرنا چاہیے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q8",
      "referenceUrl": "https://fccp.gov.pk/chief-justice",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "constitutional-court",
      "chief-justice",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q009-SRC",
    "pairId": "P238-Q009",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year did the Kargil conflict occur?",
    "options": [
      "1996",
      "1997",
      "1998",
      "1999"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کارگل تنازع 1999 میں بھارت اور پاکستان کے درمیان ہوا۔ یہ لڑائی کشمیر میں لائن آف کنٹرول کے نزدیک بلند پہاڑی علاقے میں ہوئی تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q9, PDF p.18",
      "referenceUrl": "https://apnews.com/article/c45cae691eea394e80d468918b038edb",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kargil",
      "1999",
      "line-of-control"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q009-SIM",
    "pairId": "P238-Q009",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "The 1999 Kargil conflict was fought mainly near which boundary?",
    "options": [
      "Radcliffe Line",
      "Durand Line",
      "McMahon Line",
      "Line of Control"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کارگل کی لڑائی جموں و کشمیر میں لائن آف کنٹرول کے آس پاس ہوئی۔ اس لیے Line of Control درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q9",
      "referenceUrl": "https://apnews.com/article/c45cae691eea394e80d468918b038edb",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kargil",
      "1999",
      "line-of-control"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q010-SRC",
    "pairId": "P238-Q010",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In which year was the Indus Waters Treaty signed by Pakistan and India?",
    "options": [
      "1956",
      "1958",
      "1960",
      "1966"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سندھ طاس معاہدہ بھارت اور پاکستان نے 1960 میں عالمی بینک کی معاونت سے کیا۔ اس لیے 1960 درست انتخاب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q10, PDF p.18",
      "referenceUrl": "https://www.worldbank.org/en/region/sar/brief/fact-sheet-the-indus-waters-treaty-1960-and-the-role-of-the-world-bank",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "indus-waters-treaty",
      "rivers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q010-SIM",
    "pairId": "P238-Q010",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which three rivers are principally allocated to Pakistan under the Indus Waters Treaty?",
    "options": [
      "Ravi, Beas and Sutlej",
      "Kabul, Swat and Kurram",
      "Ganges, Yamuna and Ravi",
      "Indus, Jhelum and Chenab"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "معاہدے کے تحت مغربی دریا یعنی سندھ، جہلم اور چناب بنیادی طور پر پاکستان کے لیے مختص ہوئے۔ مشرقی دریا راوی، بیاس اور ستلج بھارت کے لیے مختص ہوئے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q10",
      "referenceUrl": "https://www.worldbank.org/en/region/sar/brief/fact-sheet-the-indus-waters-treaty-1960-and-the-role-of-the-world-bank",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "indus-waters-treaty",
      "rivers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q011-SRC",
    "pairId": "P238-Q011",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "What is the minimum age required to be elected a Senator in Pakistan?",
    "options": [
      "25 years",
      "30 years",
      "35 years",
      "45 years"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آئین پاکستان کے مطابق سینیٹ کا رکن بننے کے لیے کم از کم عمر تیس سال ہے۔ قومی اسمبلی کی کم از کم عمر اس سے مختلف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q11, PDF p.18",
      "referenceUrl": "https://na.gov.pk/en/content.php/content.php?id=10",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "eligibility-age"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q011-SIM",
    "pairId": "P238-Q011",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What is the minimum age required to be elected to Pakistan's National Assembly?",
    "options": [
      "18 years",
      "21 years",
      "25 years",
      "30 years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قومی اسمبلی کی رکنیت کے لیے کم از کم عمر پچیس سال مقرر ہے۔ سینیٹ کے لیے یہی حد تیس سال ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q11",
      "referenceUrl": "https://na.gov.pk/en/content.php/content.php?id=10",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "eligibility-age"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q012-SRC",
    "pairId": "P238-Q012",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which is one of the world's busiest artificial waterways for shipping trade?",
    "options": [
      "Panama Canal",
      "Suez Canal",
      "Bosporus Strait",
      "Rhine River"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سوئز نہر دنیا کی اہم ترین اور انتہائی مصروف مصنوعی آبی گزرگاہوں میں شمار ہوتی ہے۔ یہ یورپ اور ایشیا کے درمیان بحری سفر کو بہت مختصر کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q12, PDF p.18",
      "referenceUrl": "https://www.suezcanal.gov.eg/English/About/Pages/WhySuezCanal.aspx",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "suez-canal",
      "shipping"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q012-SIM",
    "pairId": "P238-Q012",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "Which two bodies of water are connected by the Suez Canal?",
    "options": [
      "Atlantic and Pacific oceans",
      "Black Sea and Caspian Sea",
      "Mediterranean Sea and Red Sea",
      "Arabian Sea and Persian Gulf"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سوئز نہر بحیرہ روم کو بحیرہ احمر سے ملاتی ہے۔ اس رابطے کی وجہ سے جہازوں کو افریقہ کے گرد طویل سفر نہیں کرنا پڑتا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q12",
      "referenceUrl": "https://www.suezcanal.gov.eg/English/About/Pages/WhySuezCanal.aspx",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "suez-canal",
      "shipping"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q013-SRC",
    "pairId": "P238-Q013",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was the Deputy Chairman of the Senate of Pakistan on 22 August 2026?",
    "options": [
      "Syed Yousaf Raza Gilani",
      "Mirza Muhammad Afridi",
      "Syedaal Khan Nasar",
      "Sardar Ayaz Sadiq"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "22 اگست 2026 تک پاکستان کی سینیٹ کے ڈپٹی چیئرمین Syedaal Khan Nasar ہیں۔ وہ اپریل 2024 میں اس عہدے کے لیے منتخب ہوئے تھے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q13, PDF p.18",
      "referenceUrl": "https://www.senate.gov.pk/en/profile.php?catid=261&cattitle=Deputy+Chairman&subcatid=360&uid=1020",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "office-holder",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan prints a shortened name in option C and 'Syedal Khan Nasar' in its key. The official Senate profile spells the name 'Syedaal Khan Nasar'; the question is date-qualified to 22 August 2026 because the office-holder can change."
  },
  {
    "id": "P238-Q013-SIM",
    "pairId": "P238-Q013",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Who was serving as Chairman of the Senate of Pakistan on 22 August 2026?",
    "options": [
      "Syed Yousaf Raza Gilani",
      "Syedaal Khan Nasar",
      "Sadiq Sanjrani",
      "Raja Pervaiz Ashraf"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "سینیٹ کی سرکاری پروفائل کے مطابق 22 اگست 2026 کو سید یوسف رضا گیلانی چیئرمین سینیٹ تھے۔ ڈپٹی چیئرمین Syedaal Khan Nasar الگ عہدہ رکھتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q13",
      "referenceUrl": "https://www.senate.gov.pk/en/profile.php?uid=1014",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "senate",
      "office-holder",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q014-SRC",
    "pairId": "P238-Q014",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which objective was officially stated for Exercise Will for Peace 2026?",
    "options": [
      "Improving maritime safety and protecting shipping routes",
      "Preparing a strike against NATO",
      "Training for an attack on the United States",
      "Targeting intelligence facilities"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جنوبی افریقہ کے سرکاری اعلان کے مطابق Exercise Will for Peace 2026 کا مقصد بحری safety، shipping routes کا تحفظ اور شریک بحری افواج کے درمیان تعاون بہتر بنانا تھا۔ کسی ملک یا ادارے پر حملہ اس کا سرکاری مقصد نہیں تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q14, PDF p.18",
      "referenceUrl": "https://www.gov.za/news/media-advisories/government-activities/defence-hosts-exercise-will-peace-2026-9-16-jan-30-dec",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "BRICS-plus",
      "naval-exercise",
      "2026"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The scan vaguely asks which 'upcoming threat' the exercise addressed and keys None of these. Negative evidence is fragile, so the website directly tests the officially stated maritime-safety objective instead."
  },
  {
    "id": "P238-Q014-SIM",
    "pairId": "P238-Q014",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "What was the name of the BRICS+ naval exercise held off South Africa in January 2026?",
    "options": [
      "Will for Peace 2026",
      "Sea Guardians 2026",
      "Ocean Shield 2026",
      "Southern Unity 2026"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جنوری 2026 کی جنوبی افریقہ والی کثیر ملکی بحری مشق کا نام Will for Peace 2026 تھا۔ رپورٹوں میں اس کے مقاصد کو بحری تعاون اور سمندری سلامتی سے جوڑا گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q14",
      "referenceUrl": "https://www.gov.za/news/media-advisories/government-activities/defence-hosts-exercise-will-peace-2026-9-16-jan-30-dec",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "BRICS-plus",
      "naval-exercise",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q015-SRC",
    "pairId": "P238-Q015",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Who was the Prime Minister of Bangladesh on 22 August 2026?",
    "options": [
      "Sheikh Hasina",
      "Khalilur Rahman",
      "Tarique Rahman",
      "Khaleda Zia"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "بنگلہ دیش کے وزیر اعظم کے سرکاری دفتر کی کابینہ فہرست کے مطابق 22 اگست 2026 کو Tarique Rahman وزیر اعظم تھے۔ موجودہ عہدے بدل سکتے ہیں، اس لیے جواب کو تاریخ کے ساتھ یاد رکھنا چاہیے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q15, PDF p.18",
      "referenceUrl": "https://pmo.gov.bd/pages/static-pages/%E0%A6%AE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%B8%E0%A6%AD%E0%A6%BE-7wy8o4-699542d2f5e31263342f13b7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bangladesh",
      "prime-minister",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "This time-sensitive question is date-qualified to 22 August 2026. Bangladesh's official Prime Minister's Office cabinet list, updated in June 2026, identifies Tarique Rahman as Prime Minister."
  },
  {
    "id": "P238-Q015-SIM",
    "pairId": "P238-Q015",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "Which additional portfolio was held by Bangladesh Prime Minister Tarique Rahman on 22 August 2026?",
    "options": [
      "Finance",
      "Foreign Affairs",
      "Defence",
      "Education"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سرکاری کابینہ فہرست میں وزیر اعظم Tarique Rahman کے پاس دفاع کی وزارت بھی درج ہے۔ یہ معلومات 22 اگست 2026 کے تناظر میں درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q15",
      "referenceUrl": "https://pmo.gov.bd/pages/static-pages/%E0%A6%AE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%B8%E0%A6%AD%E0%A6%BE-7wy8o4-699542d2f5e31263342f13b7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bangladesh",
      "prime-minister",
      "2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q016-SRC",
    "pairId": "P238-Q016",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Under the amended State Bank of Pakistan law, what is the term of the SBP Governor?",
    "options": [
      "2 years",
      "3 years",
      "5 years",
      "7 years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اسٹیٹ بینک کے قانون کے تحت گورنر کی مدت پانچ سال ہوتی ہے۔ سرکاری معلومات کے مطابق یہ مدت ایک مرتبہ مزید دی جا سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q16, PDF p.18",
      "referenceUrl": "https://www.sbp.org.pk/Urdu/about/Govr.asp",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "SBP",
      "governor-term"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q016-SIM",
    "pairId": "P238-Q016",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "How many times may an SBP Governor's five-year term be renewed under the amended law?",
    "options": [
      "It cannot be renewed",
      "Twice",
      "Once",
      "Without limit"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "گورنر اسٹیٹ بینک کی پانچ سالہ مدت صرف ایک مرتبہ مزید بڑھائی جا سکتی ہے۔ یوں ایک شخص زیادہ سے زیادہ دو مسلسل مدتیں مکمل کر سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q16",
      "referenceUrl": "https://www.sbp.org.pk/Urdu/about/Govr.asp",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "SBP",
      "governor-term"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q017-SRC",
    "pairId": "P238-Q017",
    "kind": "source",
    "categoryId": "geography",
    "question": "Mazar-e-Sharif is a major city of which country?",
    "options": [
      "Iran",
      "Turkey",
      "Egypt",
      "Afghanistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "مزار شریف شمالی افغانستان کا ایک اہم شہر ہے۔ یہ صوبہ بلخ کا دارالحکومت بھی ہے، اس لیے افغانستان درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q17, PDF p.18",
      "referenceUrl": "https://www.britannica.com/place/Mazar-e-Sharif",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "afghanistan",
      "cities"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q017-SIM",
    "pairId": "P238-Q017",
    "kind": "similar",
    "categoryId": "geography",
    "question": "What is the capital city of Afghanistan?",
    "options": [
      "Herat",
      "Kandahar",
      "Kabul",
      "Mazar-e-Sharif"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کابل افغانستان کا قومی دارالحکومت ہے۔ مزار شریف ایک اہم شہر ہے مگر ملک کا دارالحکومت نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q17",
      "referenceUrl": "https://www.cia.gov/the-world-factbook/countries/afghanistan/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "afghanistan",
      "cities"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q018-SRC",
    "pairId": "P238-Q018",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which precious gemstone is notably found in Gilgit-Baltistan?",
    "options": [
      "Diamond",
      "Ruby",
      "Copper",
      "Gold"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "جیولوجیکل سروے آف پاکستان کے مطابق گلگت بلتستان خصوصاً ہنزہ اور نگر میں یاقوت کے ذخائر پائے جاتے ہیں۔ لہٰذا Ruby درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q18, PDF p.18",
      "referenceUrl": "https://gsp.gov.pk/gb-map/ruby-potential-map-of-gb/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gilgit-baltistan",
      "ruby",
      "minerals"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q018-SIM",
    "pairId": "P238-Q018",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which area of Gilgit-Baltistan is particularly associated with ruby deposits?",
    "options": [
      "Diamer only",
      "Hunza-Nagar",
      "Astore only",
      "Ghanche coast"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سرکاری معدنی نقشے ہنزہ اور نگر کے علاقے میں یاقوت کی موجودگی دکھاتے ہیں۔ اسی وجہ سے Hunza-Nagar درست انتخاب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q18",
      "referenceUrl": "https://gsp.gov.pk/gb-map/ruby-potential-map-of-gb/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gilgit-baltistan",
      "ruby",
      "minerals"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q019-SRC",
    "pairId": "P238-Q019",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which pair of countries borders the Aral Sea?",
    "options": [
      "Kazakhstan and Russia",
      "Iran and Tajikistan",
      "Azerbaijan and Russia",
      "Kazakhstan and Uzbekistan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بحیرہ ارال قازقستان اور ازبکستان کے درمیان واقع ہے۔ اس لیے Kazakhstan–Uzbekistan والی جوڑی درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q19, PDF p.18",
      "referenceUrl": "https://www.britannica.com/place/Aral-Sea",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "aral-sea",
      "central-asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q019-SIM",
    "pairId": "P238-Q019",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which two rivers historically supplied most of the water to the Aral Sea?",
    "options": [
      "Amu Darya and Syr Darya",
      "Indus and Jhelum",
      "Volga and Don",
      "Tigris and Euphrates"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بحیرہ ارال کو بنیادی طور پر آمو دریا اور سیر دریا سے پانی ملتا تھا۔ آب پاشی کے لیے ان دریاؤں کا رخ موڑنے سے سمندر شدید سکڑ گیا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q19",
      "referenceUrl": "https://www.britannica.com/place/Aral-Sea",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "aral-sea",
      "central-asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q020-SRC",
    "pairId": "P238-Q020",
    "kind": "source",
    "categoryId": "geography",
    "question": "What is the capital city of Sierra Leone?",
    "options": [
      "Freetown",
      "Helsinki",
      "Dublin",
      "Accra"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "فری ٹاؤن مغربی افریقی ملک سیرا لیون کا دارالحکومت اور اہم بندرگاہ ہے۔ اس لیے Freetown درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q20, PDF p.18",
      "referenceUrl": "https://www.britannica.com/place/Freetown",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "african-capitals",
      "sierra-leone"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q020-SIM",
    "pairId": "P238-Q020",
    "kind": "similar",
    "categoryId": "geography",
    "question": "What is the capital of Liberia?",
    "options": [
      "Freetown",
      "Monrovia",
      "Accra",
      "Banjul"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "لائبیریا کا دارالحکومت منروویا ہے۔ فری ٹاؤن پڑوسی ملک سیرا لیون کا دارالحکومت ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q20",
      "referenceUrl": "https://www.britannica.com/place/Monrovia",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "african-capitals",
      "sierra-leone"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q021-SRC",
    "pairId": "P238-Q021",
    "kind": "source",
    "categoryId": "geography",
    "question": "What is the highest mountain peak in Canada?",
    "options": [
      "Mount Robson",
      "Mount Saint Elias",
      "Mount McKinley",
      "Mount Logan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ماؤنٹ لوگن کینیڈا کی بلند ترین چوٹی ہے۔ یہ یوکون کے Kluane National Park and Reserve میں واقع ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q21, PDF p.18",
      "referenceUrl": "https://geonames.nrcan.gc.ca/search-place-names/unique?id=KADTU",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "canada",
      "mount-logan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q021-SIM",
    "pairId": "P238-Q021",
    "kind": "similar",
    "categoryId": "geography",
    "question": "In which Canadian territory is Mount Logan located?",
    "options": [
      "Nunavut",
      "Northwest Territories",
      "Alberta",
      "Yukon"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ماؤنٹ لوگن یوکون میں واقع ہے اور کینیڈا کی بلند ترین چوٹی ہے۔ اس لیے Yukon درست انتخاب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q21",
      "referenceUrl": "https://geonames.nrcan.gc.ca/search-place-names/unique?id=KADTU",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "canada",
      "mount-logan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q022-SRC",
    "pairId": "P238-Q022",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which material is most commonly used to make solar photovoltaic cells?",
    "options": [
      "Lithium",
      "Graphite",
      "Silicon",
      "Copper"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "زیادہ تر شمسی فوٹو وولٹائک سیل سیمی کنڈکٹر سلیکون سے بنائے جاتے ہیں۔ روشنی پڑنے پر یہی مادہ برقی رو پیدا کرنے میں مدد دیتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q22, PDF p.18",
      "referenceUrl": "https://www.energy.gov/cmei/systems/solar-photovoltaic-cell-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "solar-cell",
      "silicon"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q022-SIM",
    "pairId": "P238-Q022",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which physical effect enables a solar cell to convert light directly into electricity?",
    "options": [
      "Photoelectric heating",
      "Nuclear fission",
      "Electromagnetic induction",
      "Photovoltaic effect"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "فوٹو وولٹائک اثر کے تحت روشنی سیمی کنڈکٹر میں برقی چارج کو حرکت دیتی ہے۔ اسی براہ راست تبدیلی سے شمسی سیل بجلی پیدا کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q22",
      "referenceUrl": "https://www.energy.gov/cmei/systems/solar-photovoltaic-cell-basics",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "solar-cell",
      "silicon"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q023-SRC",
    "pairId": "P238-Q023",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "What is the smallest planet in our solar system?",
    "options": [
      "Mercury",
      "Pluto",
      "Saturn",
      "Neptune"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مرکری نظام شمسی کا سب سے چھوٹا سیارہ ہے۔ Pluto کو بونا سیارہ قرار دیا جاتا ہے، اس لیے وہ درست انتخاب نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q23, PDF p.18",
      "referenceUrl": "https://science.nasa.gov/mercury/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mercury",
      "solar-system"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan misspells Pluto as 'Plato'; the option has been normalized. Pluto is classified as a dwarf planet, so Mercury is the smallest of the eight planets."
  },
  {
    "id": "P238-Q023-SIM",
    "pairId": "P238-Q023",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Approximately how long does Mercury take to orbit the Sun?",
    "options": [
      "24 Earth days",
      "88 Earth days",
      "225 Earth days",
      "365 Earth days"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مرکری سورج کے گرد تقریباً 88 زمینی دنوں میں ایک چکر مکمل کرتا ہے۔ اس کا سال تمام سیاروں سے مختصر ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q23",
      "referenceUrl": "https://science.nasa.gov/mercury/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mercury",
      "solar-system"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q024-SRC",
    "pairId": "P238-Q024",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which metal is liquid at ordinary room temperature?",
    "options": [
      "Gold",
      "Lead",
      "Mercury",
      "Tin"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مرکری یعنی پارہ عام کمرے کے درجہ حرارت پر مائع دھات ہے۔ سونا، سیسہ اور ٹن اس حالت میں ٹھوس رہتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q24, PDF p.18",
      "referenceUrl": "https://www.usgs.gov/centers/national-minerals-information-center/mercury-statistics-and-information",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "liquid-elements",
      "mercury"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q024-SIM",
    "pairId": "P238-Q024",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which non-metal is liquid at ordinary room temperature?",
    "options": [
      "Iodine",
      "Sulfur",
      "Bromine",
      "Carbon"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "برومین عام درجہ حرارت پر مائع رہنے والا غیر دھاتی عنصر ہے۔ پارہ بھی مائع ہے مگر وہ دھات ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q24",
      "referenceUrl": "https://www.rsc.org/periodic-table/element/35/bromine",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "liquid-elements",
      "mercury"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q025-SRC",
    "pairId": "P238-Q025",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Approximately what percentage of an average adult human body is water?",
    "options": [
      "50%",
      "60%",
      "70%",
      "80%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ایک اوسط بالغ انسانی جسم کا تقریباً ساٹھ فیصد حصہ پانی پر مشتمل ہوتا ہے۔ یہ تناسب عمر، جنس اور جسمانی ساخت کے ساتھ بدل سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q25, PDF p.18",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK541059/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "human-body",
      "water"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q025-SIM",
    "pairId": "P238-Q025",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Approximately what percentage of an infant's body weight may consist of water?",
    "options": [
      "25%",
      "75%",
      "60%",
      "40%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "نوزائیدہ بچوں میں جسمانی پانی کا تناسب تقریباً پچھتر فیصد تک ہو سکتا ہے۔ عمر بڑھنے کے ساتھ یہ تناسب عموماً کم ہو جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q25",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK482447/?report=classic",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "human-body",
      "water"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q026-SRC",
    "pairId": "P238-Q026",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which scientist gave the first accurate account of systemic blood circulation?",
    "options": [
      "Thomas Edison",
      "Robert Boyle",
      "Robert Hooke",
      "William Harvey"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ولیم ہاروے نے خون کی مسلسل گردش اور دل کے پمپ کے کردار کی سائنسی وضاحت پیش کی۔ اسی لیے William Harvey درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q26, PDF p.18",
      "referenceUrl": "https://www.britannica.com/biography/William-Harvey",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "blood-circulation",
      "william-harvey"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q026-SIM",
    "pairId": "P238-Q026",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which organ pumps blood through the human circulatory system?",
    "options": [
      "Liver",
      "Heart",
      "Lung",
      "Kidney"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "دل عضلاتی پمپ کی طرح خون کو شریانوں میں بھیجتا ہے۔ پھر خون جسم سے واپس وریدوں کے ذریعے دل تک آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q26",
      "referenceUrl": "https://www.nhlbi.nih.gov/health/heart/how-heart-works",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "blood-circulation",
      "william-harvey"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q027-SRC",
    "pairId": "P238-Q027",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "What is the approximate audible frequency range for a healthy young human ear?",
    "options": [
      "10 Hz - 10 kHz",
      "20 Hz - 20 kHz",
      "30 Hz - 30 kHz",
      "40 Hz - 40 kHz"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "نوجوان صحت مند انسان کی عمومی سماعت کی حد تقریباً 20 ہرٹز سے 20 کلوہرٹز ہے۔ عمر اور شور کی نمائش کے ساتھ بالائی حد کم ہو سکتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q27, PDF p.18",
      "referenceUrl": "https://stacks.cdc.gov/view/cdc/226371/cdc_226371_DS1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hearing",
      "frequency"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q027-SIM",
    "pairId": "P238-Q027",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the approximate upper frequency limit of normal young human hearing?",
    "options": [
      "2 kHz",
      "10 kHz",
      "20 kHz",
      "200 kHz"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "عام طور پر انسانی سماعت کی بالائی حد 20 کلوہرٹز مانی جاتی ہے۔ اس سے زیادہ تعدد کو الٹرا ساؤنڈ کہا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q27",
      "referenceUrl": "https://stacks.cdc.gov/view/cdc/226371/cdc_226371_DS1.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hearing",
      "frequency"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q028-SRC",
    "pairId": "P238-Q028",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which member of the cat family normally lives and hunts in social groups?",
    "options": [
      "Fox",
      "Tiger",
      "Lion",
      "Leopard"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "شیر بلی کے خاندان کا سب سے زیادہ سماجی رکن ہے اور pride نامی گروہ میں رہتا ہے۔ مادہ شیر اکثر مل کر شکار کرتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q28, PDF p.18",
      "referenceUrl": "https://nationalzoo.si.edu/animals/lion",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "lions",
      "animal-groups"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q028-SIM",
    "pairId": "P238-Q028",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is a social group of lions called?",
    "options": [
      "Pack",
      "Herd",
      "Pride",
      "Flock"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "شیروں کے سماجی گروہ کو pride کہا جاتا ہے۔ یہ ساخت انہیں بچوں کی نگہداشت اور مشترکہ شکار میں مدد دیتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q28",
      "referenceUrl": "https://nationalzoo.si.edu/animals/lion",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "lions",
      "animal-groups"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q029-SRC",
    "pairId": "P238-Q029",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Approximately what percentage of alcohol does rectified spirit contain?",
    "options": [
      "90%",
      "92%",
      "95%",
      "97%"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Rectified spirit عام امتحانی اصطلاح میں تقریباً 95 فیصد ethanol کا مرکب ہے۔ پانی اور ethanol کا azeotrope سادہ کشید سے مزید آسانی سے الگ نہیں ہوتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q29, PDF p.18",
      "referenceUrl": "https://www.spiritsanddistilling.com/dictionary/acref-9780199311132-e-470",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ethanol",
      "rectified-spirit"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q029-SIM",
    "pairId": "P238-Q029",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Why can ordinary fractional distillation not easily produce completely pure ethanol from rectified spirit?",
    "options": [
      "Ethanol freezes immediately",
      "Ethanol decomposes at room temperature",
      "Water becomes a solid",
      "Ethanol and water form an azeotrope"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ethanol اور پانی تقریباً 95.6 فیصد ethanol پر azeotrope بناتے ہیں۔ اس مقام پر بخارات اور مائع کی ترکیب قریب ہونے سے عام کشید مؤثر جدائی نہیں کر پاتی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q29",
      "referenceUrl": "https://www.spiritsanddistilling.com/dictionary/acref-9780199311132-e-470",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ethanol",
      "rectified-spirit"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q030-SRC",
    "pairId": "P238-Q030",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is phishing?",
    "options": [
      "A fraudulent message designed to steal information",
      "Upgrading an operating system",
      "Backing up data",
      "Sorting files"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Phishing ایسا دھوکا ہے جس میں جعلی پیغام یا ای میل کے ذریعے راز، پاس ورڈ یا رقم حاصل کرنے کی کوشش کی جاتی ہے۔ اس لیے fraudulent email قریب ترین درست انتخاب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q30, PDF p.19",
      "referenceUrl": "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "phishing",
      "cybersecurity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q030-SIM",
    "pairId": "P238-Q030",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What is spear phishing?",
    "options": [
      "A broad software update",
      "A method of file compression",
      "A targeted phishing attempt against a specific person or group",
      "A database backup process"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Spear phishing عام phishing کے مقابلے میں کسی خاص شخص یا ادارے کو نشانہ بناتی ہے۔ حملہ آور اعتماد حاصل کرنے کے لیے ذاتی یا تنظیمی معلومات استعمال کر سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q30",
      "referenceUrl": "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "phishing",
      "cybersecurity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q031-SRC",
    "pairId": "P238-Q031",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "In a relational database table, what is a row commonly called?",
    "options": [
      "Record",
      "Field",
      "Header",
      "Range"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Relational database کی میز میں ہر row ایک مکمل record کی نمائندگی کرتی ہے۔ ہر column عموماً اس record کا ایک field یا attribute ہوتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q31, PDF p.19",
      "referenceUrl": "https://support.microsoft.com/en-us/topic/guide-to-table-relationships-30446197-4fbe-457b-b992-2f6fb812b58f",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "database",
      "records-fields"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q031-SIM",
    "pairId": "P238-Q031",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In a relational database table, what is a column commonly called?",
    "options": [
      "Record",
      "Field",
      "Report",
      "Query"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Database table کا column کسی خاص قسم کی قدر، مثلاً نام یا تاریخ، محفوظ کرتا ہے اور اسے field کہا جاتا ہے۔ اس کے برعکس row متعدد fields پر مشتمل record ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q31",
      "referenceUrl": "https://support.microsoft.com/en-us/topic/guide-to-table-relationships-30446197-4fbe-457b-b992-2f6fb812b58f",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "database",
      "records-fields"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q032-SRC",
    "pairId": "P238-Q032",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What did Tim Berners-Lee invent?",
    "options": [
      "Email",
      "Linux",
      "World Wide Web",
      "SpaceX"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Tim Berners-Lee نے CERN میں World Wide Web کی بنیاد رکھی۔ WWW ویب صفحات، URLs اور HTTP کے ذریعے معلومات باہم مربوط کرنے کا نظام ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q32, PDF p.19",
      "referenceUrl": "https://home.cern/science/computing/birth-web",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "world-wide-web",
      "tim-berners-lee"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q032-SIM",
    "pairId": "P238-Q032",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "At which research organization was the World Wide Web invented?",
    "options": [
      "NASA",
      "Bell Labs",
      "CERN",
      "MIT Media Lab"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Tim Berners-Lee نے CERN میں کام کرتے ہوئے 1989 میں ویب کی تجویز پیش کی۔ اس لیے CERN درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q32",
      "referenceUrl": "https://home.cern/science/computing/birth-web",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "world-wide-web",
      "tim-berners-lee"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q033-SRC",
    "pairId": "P238-Q033",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is NOT a characteristic of cloud computing?",
    "options": [
      "Rapid elasticity",
      "Local-only access",
      "Resource pooling",
      "Broad network access"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "NIST کے مطابق broad network access، resource pooling اور rapid elasticity کلاؤڈ کمپیوٹنگ کی بنیادی خصوصیات ہیں۔ Local-only access ان میں شامل نہیں کیونکہ cloud خدمات نیٹ ورک سے دستیاب ہوتی ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q33, PDF p.19",
      "referenceUrl": "https://www.nist.gov/publications/nist-definition-cloud-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cloud-computing",
      "NIST"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q033-SIM",
    "pairId": "P238-Q033",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is an essential characteristic of cloud computing?",
    "options": [
      "Manual provisioning only",
      "Fixed capacity",
      "Local-only access",
      "Measured service"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Measured service کلاؤڈ وسائل کے استعمال کو ناپنے، کنٹرول کرنے اور رپورٹ کرنے کی صلاحیت ہے۔ NIST اسے کلاؤڈ کمپیوٹنگ کی پانچ بنیادی خصوصیات میں شمار کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q33",
      "referenceUrl": "https://www.nist.gov/publications/nist-definition-cloud-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cloud-computing",
      "NIST"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q034-SRC",
    "pairId": "P238-Q034",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which AI application is used to recognize spoken human language?",
    "options": [
      "Data mining",
      "Robotics",
      "Speech recognition",
      "Image processing"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "انسانی آواز کو کمپیوٹر کے لیے متن یا حکم میں تبدیل کرنے والی AI application کو speech recognition کہتے ہیں۔ یہ آواز کے سگنل سے بولے گئے الفاظ کی شناخت کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q34, PDF p.19",
      "referenceUrl": "https://www.ibm.com/think/topics/speech-recognition",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "AI",
      "speech-recognition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q034-SIM",
    "pairId": "P238-Q034",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which branch of AI is central to understanding and processing human language?",
    "options": [
      "Disk formatting",
      "Computer graphics",
      "Spreadsheet analysis",
      "Natural language processing"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Natural language processing کمپیوٹر کو انسانی زبان کا تجزیہ اور فہم کرنے کے طریقے فراہم کرتی ہے۔ جدید speech recognition میں بھی NLP کے طریقے وسیع طور پر استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q34",
      "referenceUrl": "https://www.ibm.com/think/topics/speech-recognition",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "AI",
      "speech-recognition"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q035-SRC",
    "pairId": "P238-Q035",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is an error or defect in a computer program commonly called?",
    "options": [
      "Bug",
      "Chip",
      "CPU",
      "Port"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کمپیوٹر پروگرام یا نظام میں خامی کو عام طور پر bug کہتے ہیں۔ ایسی خامی تلاش کرنے اور درست کرنے کے عمل کو debugging کہا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q35, PDF p.19",
      "referenceUrl": "https://csrc.nist.gov/glossary/term/bug",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "software",
      "bug",
      "debugging"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q035-SIM",
    "pairId": "P238-Q035",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What is the process of locating and correcting software bugs called?",
    "options": [
      "Compiling",
      "Encrypting",
      "Debugging",
      "Formatting"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Debugging میں پروگرام کی خرابی کا سبب تلاش کرکے اسے درست کیا جاتا ہے۔ صرف compilation یا formatting اس عمل کا متبادل نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q35",
      "referenceUrl": "https://csrc.nist.gov/glossary/term/bug",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "software",
      "bug",
      "debugging"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q036-SRC",
    "pairId": "P238-Q036",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which pair of companies is Elon Musk best known for leading?",
    "options": [
      "Meta and WhatsApp",
      "Lenovo and IBM",
      "Motorola and Nokia",
      "SpaceX and Tesla"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Elon Musk Tesla کی قیادت اور SpaceX کی بنیاد رکھنے کے لیے معروف ہیں۔ تاہم 'owner' کہنا قانونی ملکیت کو حد سے زیادہ سادہ بناتا ہے کیونکہ Tesla عوامی حصص والی کمپنی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q36, PDF p.19",
      "referenceUrl": "https://ir.tesla.com/corporate/elon-musk",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "elon-musk",
      "tesla",
      "spacex"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says Elon Musk is the 'owner' of both companies. This has been cleaned to 'best known for leading': Tesla is a public company, while Tesla's official profile identifies Musk as its CEO and as founder/CEO of SpaceX."
  },
  {
    "id": "P238-Q036-SIM",
    "pairId": "P238-Q036",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which executive role did Elon Musk hold at Tesla according to Tesla's corporate profile?",
    "options": [
      "Chief Financial Officer",
      "Chief Auditor",
      "Chief Legal Officer",
      "Chief Executive Officer"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Tesla کی سرکاری کارپوریٹ پروفائل Elon Musk کو Chief Executive Officer درج کرتی ہے۔ وہ SpaceX کے founder اور CEO بھی ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q36",
      "referenceUrl": "https://ir.tesla.com/corporate/elon-musk",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "elon-musk",
      "tesla",
      "spacex"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q037-SRC",
    "pairId": "P238-Q037",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol dynamically assigns IP addresses to devices on a network?",
    "options": [
      "DHCP",
      "FTP",
      "HTTP",
      "SMTP"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "DHCP نیٹ ورک پر آلات کو IP پتے اور دوسری configuration خودکار طور پر دیتا ہے۔ اس لیے dynamic address assignment کے لیے DHCP درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q37, PDF p.19",
      "referenceUrl": "https://www.rfc-editor.org/info/rfc2131/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "DHCP",
      "IP-address"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q037-SIM",
    "pairId": "P238-Q037",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What does DHCP stand for?",
    "options": [
      "Digital Hardware Communication Program",
      "Direct Hypertext Control Process",
      "Distributed Host Connection Port",
      "Dynamic Host Configuration Protocol"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "DHCP کا پورا نام Dynamic Host Configuration Protocol ہے۔ یہ client کو IP address اور متعلقہ نیٹ ورک parameters فراہم کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q37",
      "referenceUrl": "https://www.rfc-editor.org/info/rfc2131/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "DHCP",
      "IP-address"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q038-SRC",
    "pairId": "P238-Q038",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which pair of protocols is associated with sending and retrieving email?",
    "options": [
      "SMTP and POP",
      "POP and FTP",
      "SMTP and FTP",
      "DHCP and HTTP"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Email بھیجنے کے لیے SMTP جبکہ server سے پیغام حاصل کرنے کے لیے POP استعمال ہو سکتا ہے۔ اصل scan میں SMTP کو SMPT لکھا گیا تھا، جسے یہاں درست کیا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q38, PDF p.19",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc5598",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "email",
      "SMTP",
      "POP"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan repeatedly misspells SMTP as 'SMPT'. The website item corrects this transcription error; the printed key still maps to option A."
  },
  {
    "id": "P238-Q038-SIM",
    "pairId": "P238-Q038",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol is primarily used to transfer outgoing email between mail servers?",
    "options": [
      "FTP",
      "SNMP",
      "DHCP",
      "SMTP"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "SMTP ای میل جمع کرانے اور mail servers کے درمیان آگے بھیجنے کا بنیادی protocol ہے۔ POP یا IMAP عموماً صارف کو mailbox سے پیغامات حاصل کرنے دیتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q38",
      "referenceUrl": "https://www.rfc-editor.org/rfc/rfc5598",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "email",
      "SMTP",
      "POP"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q039-SRC",
    "pairId": "P238-Q039",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which PowerPoint view displays the presentation while hiding editing controls?",
    "options": [
      "Normal view",
      "Outline view",
      "Slide Show view",
      "Notes view"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "PowerPoint کا Slide Show view سلائیڈ کو پیش کش کی صورت میں دکھاتا اور editing controls چھپا دیتا ہے۔ اسی لیے Slide Show view درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q39, PDF p.19",
      "referenceUrl": "https://support.microsoft.com/en-us/powerpoint/training/choose-the-right-view-for-the-task-in-powerpoint",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "powerpoint",
      "slide-show"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q039-SIM",
    "pairId": "P238-Q039",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which key starts a PowerPoint slide show from the beginning in desktop PowerPoint?",
    "options": [
      "F5",
      "F1",
      "F7",
      "F12"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "PowerPoint میں F5 دبانے سے slide show پہلی سلائیڈ سے شروع ہوتا ہے۔ Shift+F5 موجودہ سلائیڈ سے پیش کش شروع کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q39",
      "referenceUrl": "https://support.microsoft.com/en-us/powerpoint/training/choose-the-right-view-for-the-task-in-powerpoint",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "powerpoint",
      "slide-show"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q040-SRC",
    "pairId": "P238-Q040",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which statement best describes a Turing machine?",
    "options": [
      "A commercial AI product",
      "A physical modelling package",
      "A general office problem-solving app",
      "An abstract mathematical model of computation"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Turing machine کمپیوٹیشن کا ایک تجریدی ریاضیاتی نمونہ ہے جو الگورتھم اور computability کے مطالعے میں استعمال ہوتا ہے۔ اسے محض AI، modeling software یا عام problem-solving application کہنا درست تعریف نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q40, PDF p.19",
      "referenceUrl": "https://plato.stanford.edu/entries/turing-machine/index.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "turing-machine",
      "computability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's key selects 'All of these' for AI, modeling and problem solving. Standard computability references define a Turing machine as an abstract mathematical model of computation, so the website reconstructs the options while retaining index D and discloses the printed ambiguity."
  },
  {
    "id": "P238-Q040-SIM",
    "pairId": "P238-Q040",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In a Turing machine, what serves as the model's unbounded memory?",
    "options": [
      "A finite register only",
      "A graphics card",
      "An infinite tape divided into cells",
      "A database table"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Turing machine میں cells پر مشتمل تصوراتی tape یادداشت کا کردار ادا کرتی ہے۔ read-write head اس tape پر علامتیں پڑھتا، لکھتا اور حرکت کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q40",
      "referenceUrl": "https://plato.stanford.edu/entries/turing-machine/index.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "turing-machine",
      "computability"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q041-SRC",
    "pairId": "P238-Q041",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is the usual effect of data compression on a file?",
    "options": [
      "It increases file size",
      "It always damages data",
      "It reduces file size",
      "It deletes the file"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Data compression معلومات کو زیادہ مختصر نمائندگی میں محفوظ کرکے file size کم کرتی ہے۔ طریقہ lossless ہو تو اصل data مکمل طور پر واپس حاصل کیا جا سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q41, PDF p.19",
      "referenceUrl": "https://www.ibm.com/think/topics/data-compression",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "data-compression",
      "lossless"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q041-SIM",
    "pairId": "P238-Q041",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which type of compression allows the original data to be reconstructed exactly?",
    "options": [
      "Lossy compression",
      "Lossless compression",
      "Analog compression",
      "Manual compression"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Lossless compression میں decompression کے بعد ہر bit اصل حالت میں واپس آتی ہے۔ اسی لیے text files اور executable data کے لیے یہ طریقہ موزوں ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q41",
      "referenceUrl": "https://www.ibm.com/think/topics/data-compression",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "data-compression",
      "lossless"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q042-SRC",
    "pairId": "P238-Q042",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is NOT an essential characteristic of cloud computing?",
    "options": [
      "On-demand self-service",
      "Resource pooling",
      "Limited network accessibility",
      "Rapid elasticity"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "نیٹ ورک تک رسائی محدود کرنا cloud computing کی بنیادی خصوصیت نہیں۔ NIST کے مطابق broad network access، on-demand self-service، resource pooling، rapid elasticity اور measured service بنیادی خصوصیات ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q42, PDF p.19",
      "referenceUrl": "https://www.nist.gov/publications/nist-definition-cloud-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cloud-computing",
      "essential-characteristics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q042-SIM",
    "pairId": "P238-Q042",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "How many essential characteristics are listed in NIST's definition of cloud computing?",
    "options": [
      "Three",
      "Four",
      "Five",
      "Seven"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "NIST کی تعریف میں کل پانچ essential characteristics بیان کی گئی ہیں۔ ان میں on-demand self-service اور broad network access بھی شامل ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q42",
      "referenceUrl": "https://www.nist.gov/publications/nist-definition-cloud-computing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cloud-computing",
      "essential-characteristics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q043-SRC",
    "pairId": "P238-Q043",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which test checks that recent software changes have not broken existing functionality?",
    "options": [
      "Regression test",
      "Unit test",
      "Integration test",
      "Smoke test"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Regression testing یہ جانچتی ہے کہ نئی تبدیلی سے پہلے سے درست کام کرنے والی خصوصیات خراب تو نہیں ہوئیں۔ اسی لیے پرانے اور نئے رویے کی مطابقت جانچنے کے لیے یہ درست انتخاب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q43, PDF p.19",
      "referenceUrl": "https://glossary.istqb.org/en_US/term/regression-testing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "software-testing",
      "regression"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q043-SIM",
    "pairId": "P238-Q043",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which testing level examines an individual software component in isolation?",
    "options": [
      "Component testing",
      "Acceptance testing",
      "System testing",
      "Regression testing"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Component testing میں الگ module یا unit کو تنہائی میں جانچا جاتا ہے۔ Regression testing کا مقصد تبدیلی کے بعد سابقہ functionality میں خرابی تلاش کرنا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q43",
      "referenceUrl": "https://glossary.istqb.org/en_US/term/component-testing",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "software-testing",
      "regression"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q044-SRC",
    "pairId": "P238-Q044",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which combination is characteristic of many hydrophytes?",
    "options": [
      "Reduced mechanical tissue only",
      "Prominent aerenchyma only",
      "A strongly developed woody system",
      "Reduced mechanical tissue and prominent aerenchyma"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Hydrophytes پانی میں رہنے والے پودے ہیں جن میں mechanical tissue عموماً کم اور ہوا سے بھرے aerenchyma spaces نمایاں ہوتے ہیں۔ اس لیے A اور B دونوں درست adaptations ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q44, PDF p.19",
      "referenceUrl": "https://openstax.org/books/biology-2e/pages/30-4-leaves",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hydrophytes",
      "aerenchyma"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q044-SIM",
    "pairId": "P238-Q044",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the air-space tissue common in many aquatic plants called?",
    "options": [
      "Xylem",
      "Cambium",
      "Aerenchyma",
      "Cork"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Aerenchyma میں بڑے فضائی خلا ہوتے ہیں جو پانی والے ماحول میں گیسوں کی نقل و حرکت اور buoyancy میں مدد دیتے ہیں۔ یہ بہت سے aquatic plants کی معروف adaptation ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q44",
      "referenceUrl": "https://openstax.org/books/biology-2e/pages/30-4-leaves",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hydrophytes",
      "aerenchyma"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q045-SRC",
    "pairId": "P238-Q045",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Complete the series: 7, 13, 21, __, 43, 57.",
    "options": [
      "31",
      "32",
      "35",
      "None of These"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اس سلسلے میں فرق بالترتیب 6، 8، 10، 12 اور 14 بڑھتا ہے۔ 21 میں 10 جمع کرنے سے گم شدہ عدد 31 آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q45, PDF p.19",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/3-4-math-and-logic-puzzles",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "number-series",
      "differences"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q045-SIM",
    "pairId": "P238-Q045",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Find the next term: 3, 8, 15, 24, 35, __.",
    "options": [
      "44",
      "48",
      "46",
      "50"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "فرق 5، 7، 9 اور 11 ہیں، یعنی ہر بار فرق دو بڑھ رہا ہے۔ اگلا فرق 13 ہوگا، لہٰذا 35 جمع 13 برابر 48 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q45",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/3-4-math-and-logic-puzzles",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "number-series",
      "differences"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q046-SRC",
    "pairId": "P238-Q046",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "An equilateral triangle has a perimeter of 60 cm. What is its area?",
    "options": [
      "√3 cm²",
      "100√3 cm²",
      "60√3 cm²",
      "120 cm²"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سوال میں 'equatorial' طباعتی غلطی ہے اور حل equilateral triangle کے مطابق ہے۔ ضلع 20 اور رقبہ (√3/4)×20² یعنی 100√3 مربع سینٹی میٹر بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q46, PDF p.19",
      "referenceUrl": "https://mathworld.wolfram.com/EquilateralTriangle.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "equilateral-triangle",
      "area"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says 'equatorial triangle,' but its worked solution and answer use the equilateral-triangle formula. The website corrects this evident typographical error."
  },
  {
    "id": "P238-Q046-SIM",
    "pairId": "P238-Q046",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the area of an equilateral triangle whose perimeter is 36 cm?",
    "options": [
      "36√3 cm²",
      "24√3 cm²",
      "18√3 cm²",
      "72√3 cm²"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "محیط 36 ہو تو ہر ضلع 12 سینٹی میٹر ہے۔ رقبہ (√3/4)×12² سے 36√3 مربع سینٹی میٹر آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q46",
      "referenceUrl": "https://mathworld.wolfram.com/EquilateralTriangle.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "equilateral-triangle",
      "area"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q047-SRC",
    "pairId": "P238-Q047",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A cube has a volume of 343 m³. What is the area of one face?",
    "options": [
      "43 m²",
      "49 m²",
      "51 m²",
      "57 m²"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکعب کا حجم a³ ہوتا ہے، اس لیے a³=343 سے ضلع 7 میٹر ہے۔ ایک face کا رقبہ a² یعنی 49 مربع میٹر بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q47, PDF p.19",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cube",
      "volume",
      "face-area"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q047-SIM",
    "pairId": "P238-Q047",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A cube has a volume of 512 m³. What is the area of one face?",
    "options": [
      "48 m²",
      "56 m²",
      "72 m²",
      "64 m²"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "512 کا مکعبی جذر 8 ہے، لہٰذا مکعب کا ضلع 8 میٹر ہوگا۔ ایک face کا رقبہ 8² یعنی 64 مربع میٹر ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q47",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cube",
      "volume",
      "face-area"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q048-SRC",
    "pairId": "P238-Q048",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Which value is incorrect in the series 2, 4, 7, 14, 17, 34, 37, 64?",
    "options": [
      "17",
      "64",
      "34",
      "None of These"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "قاعدہ باری باری دو سے ضرب اور پھر 3 جمع کرنا ہے: 2، 4، 7، 14، 17، 34، 37، 74۔ اس لیے آخری 64 غلط ہے اور درست قدر 74 ہونی چاہیے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q48, PDF p.20",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/3-4-math-and-logic-puzzles",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "number-series",
      "incorrect-term"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q048-SIM",
    "pairId": "P238-Q048",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Which term is incorrect in the series 3, 6, 9, 18, 21, 42, 45, 80?",
    "options": [
      "80",
      "42",
      "45",
      "18"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "قاعدہ باری باری ×2 اور +3 ہے، اس لیے 45 کے بعد 90 آنا چاہیے۔ لہٰذا 80 غلط term ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q48",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/3-4-math-and-logic-puzzles",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "number-series",
      "incorrect-term"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q049-SRC",
    "pairId": "P238-Q049",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "The ratio of sugar to water is 5:7. If there are 35 units of sugar, how many units of water are there?",
    "options": [
      "42",
      "49",
      "56",
      "63"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "شکر اور پانی کا تناسب 5:7 ہے، لہٰذا ایک حصہ 35÷5 یعنی 7 ہے۔ پانی کے سات حصے 7×7 یعنی 49 بنتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q49, PDF p.20",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q049-SIM",
    "pairId": "P238-Q049",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "The ratio of boys to girls is 3:5. If there are 24 boys, how many girls are there?",
    "options": [
      "32",
      "36",
      "40",
      "45"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "تین حصے 24 ہوں تو ایک حصہ 8 بنتا ہے۔ لڑکیوں کے پانچ حصے 5×8 یعنی 40 ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q49",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ratio",
      "word-problem"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q050-SRC",
    "pairId": "P238-Q050",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "An arithmetic progression starts at 5 and has common difference 7. What are its first four terms?",
    "options": [
      "4,11,18,24",
      "5,12,19,26",
      "5,13,20,27",
      "5,11,17,24"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Arithmetic progression میں ہر اگلی term کے لیے common difference 7 جمع کیا جاتا ہے۔ یوں پہلی چار terms 5، 12، 19 اور 26 ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q50, PDF p.20",
      "referenceUrl": "https://openstax.org/books/college-algebra/pages/9-2-arithmetic-sequences",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "arithmetic-progression",
      "common-difference"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q050-SIM",
    "pairId": "P238-Q050",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "An arithmetic progression starts at −2 and has common difference 6. What are its first four terms?",
    "options": [
      "2, 8, 14, 20",
      "−2, 6, 12, 18",
      "−2, 4, 10, 16",
      "−6, 0, 6, 12"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پہلی term −2 میں ہر بار 6 جمع کرنے سے 4، 10 اور 16 ملتے ہیں۔ اس لیے −2، 4، 10، 16 درست ترتیب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q50",
      "referenceUrl": "https://openstax.org/books/college-algebra/pages/9-2-arithmetic-sequences",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "arithmetic-progression",
      "common-difference"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q051-SRC",
    "pairId": "P238-Q051",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Find x if 7:8 = 196:x.",
    "options": [
      "224",
      "226",
      "228",
      "232"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "تناسب 7:8 = 196:x کو cross-multiply کرنے سے 7x=1568 بنتا ہے۔ 1568 کو 7 سے تقسیم کرنے پر x=224 آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q51, PDF p.20",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proportion",
      "cross-multiplication"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q051-SIM",
    "pairId": "P238-Q051",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Solve the proportion 5:9 = 45:x.",
    "options": [
      "72",
      "75",
      "90",
      "81"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "5/9 = 45/x میں cross multiplication سے 5x=405 بنتا ہے۔ اس لیے x=81 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q51",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proportion",
      "cross-multiplication"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q052-SRC",
    "pairId": "P238-Q052",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 201 × 199.",
    "options": [
      "2999",
      "3999",
      "39999",
      "None of These"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "201×199 کو (200+1)(200−1) لکھ کر فرقِ مربع کا قاعدہ لگتا ہے۔ نتیجہ 200²−1² یعنی 39,999 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q52, PDF p.20",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/1-2-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mental-math",
      "difference-of-squares"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q052-SIM",
    "pairId": "P238-Q052",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 301 × 299.",
    "options": [
      "89,699",
      "89,899",
      "89,999",
      "90,099"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "301×299 کو (300+1)(300−1) لکھیں۔ فرقِ مربع سے 300²−1 یعنی 89,999 حاصل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q52",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/1-2-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mental-math",
      "difference-of-squares"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q053-SRC",
    "pairId": "P238-Q053",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A ladder makes a 45° angle with a vertical wall, and its foot is 5 m from the wall. How high up the wall does it reach?",
    "options": [
      "10 m",
      "15 m",
      "5 m",
      "45√3m"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دیوار اور زمین عمودی ہیں، اس لیے ladder کا دونوں کے ساتھ زاویہ 45 درجے بنتا ہے۔ tan45°=1 کے باعث اونچائی افقی فاصلے 5 میٹر کے برابر ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q53, PDF p.20",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-8-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "right-triangle",
      "ladder"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q053-SIM",
    "pairId": "P238-Q053",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A ladder makes a 45° angle with the ground and its foot is 8 m from a wall. How high up the wall does it reach?",
    "options": [
      "4 m",
      "8 m",
      "8√2 m",
      "16 m"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "tan45° = height/base = 1 ہوتا ہے۔ base 8 میٹر ہو تو height بھی 8 میٹر بنتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q53",
      "referenceUrl": "https://openstax.org/books/contemporary-mathematics/pages/10-8-right-triangle-trigonometry",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "right-triangle",
      "ladder"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q054-SRC",
    "pairId": "P238-Q054",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "What is the remainder when x⁵¹ + 51 is divided by x + 1?",
    "options": [
      "49",
      "50",
      "51",
      "None of These"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Remainder theorem کے مطابق x+1 سے تقسیم کا باقی f(−1) ہوگا۔ (−1)⁵¹+51 = −1+51 = 50، اس لیے جواب 50 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q54, PDF p.20",
      "referenceUrl": "https://openstax.org/books/algebra-1/pages/6-3-4-dividing-polynomial-functions-and-the-remainder-theorem",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "remainder-theorem",
      "polynomials"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q054-SIM",
    "pairId": "P238-Q054",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the remainder when x³ + 10 is divided by x + 1?",
    "options": [
      "9",
      "0",
      "−9",
      "11"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "x+1 کے لیے x=−1 رکھیں تو f(−1)=−1+10=9 بنتا ہے۔ یہی مطلوبہ remainder ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q54",
      "referenceUrl": "https://openstax.org/books/algebra-1/pages/6-3-4-dividing-polynomial-functions-and-the-remainder-theorem",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "remainder-theorem",
      "polynomials"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q055-SRC",
    "pairId": "P238-Q055",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 3⁰ × 5⁰ × 7⁰.",
    "options": [
      "0",
      "105",
      "35",
      "1"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "صفر کے علاوہ ہر عدد کی صفر power برابر 1 ہوتی ہے۔ لہٰذا 3⁰×5⁰×7⁰ = 1×1×1 = 1 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q55, PDF p.21",
      "referenceUrl": "https://openstax.org/books/algebra-1/pages/5-1-3-using-zero-exponent-property-and-negative-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zero-exponent",
      "powers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q055-SIM",
    "pairId": "P238-Q055",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Evaluate (2 × 11)⁰.",
    "options": [
      "1",
      "0",
      "13",
      "22"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "2×11 برابر 22 ہے اور 22 صفر نہیں۔ zero-exponent rule کے مطابق 22⁰=1 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q55",
      "referenceUrl": "https://openstax.org/books/algebra-1/pages/5-1-3-using-zero-exponent-property-and-negative-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "zero-exponent",
      "powers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q056-SRC",
    "pairId": "P238-Q056",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Three years ago, C was three times D's age. Four years from now, C will be twice D's age. What is C's present age?",
    "options": [
      "20",
      "24",
      "26",
      "28"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "تین سال پہلے C−3 = 3(D−3) اور چار سال بعد C+4 = 2(D+4) ہے۔ دونوں equations حل کرنے سے D=10 اور C=24 سال آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q56, PDF p.21",
      "referenceUrl": "https://openstax.org/books/elementary-algebra/pages/5-4-solve-applications-with-systems-of-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ages",
      "simultaneous-equations"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q056-SIM",
    "pairId": "P238-Q056",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Two years ago, A was three times B's age; four years from now, A will be twice B's age. What is A's present age?",
    "options": [
      "20 years",
      "18 years",
      "16 years",
      "24 years"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "شرائط سے A−2=3(B−2) اور A+4=2(B+4) بنتی ہیں۔ حل کرنے پر B=8 اور A=20 سال ملتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q56",
      "referenceUrl": "https://openstax.org/books/elementary-algebra/pages/5-4-solve-applications-with-systems-of-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ages",
      "simultaneous-equations"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q057-SRC",
    "pairId": "P238-Q057",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Which option is one root of 2x² + 5x − 12 = 0?",
    "options": [
      "2",
      "−3/2",
      "3/2",
      "−1/2"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "2x²+5x−12 کو (2x−3)(x+4) لکھا جا سکتا ہے۔ اس کے roots 3/2 اور −4 ہیں، مگر اصل اختیارات میں صرف 3/2 موجود ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q57, PDF p.21",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The complete solution is x=3/2 or x=−4. The scan offers only 3/2 among its four choices, so the stem is clarified to ask which option is one root; the absent second root is disclosed."
  },
  {
    "id": "P238-Q057-SIM",
    "pairId": "P238-Q057",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the positive root of 3x² − x − 2 = 0?",
    "options": [
      "−1",
      "−2/3",
      "2/3",
      "1"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "3x²−x−2 کو (3x+2)(x−1) لکھتے ہیں۔ roots −2/3 اور 1 ہیں، اس لیے مثبت root 1 ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q57",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q058-SRC",
    "pairId": "P238-Q058",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Which is the perfect-square form of 16x² + 24x + 9?",
    "options": [
      "4x−3",
      "4x+3",
      "(4x+6)²",
      "(4x+3)²"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "16x²+24x+9 میں پہلا اور آخری term بالترتیب (4x)² اور 3² ہیں۔ درمیانی term 2(4x)(3)=24x ہے، اس لیے expression (4x+3)² ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q58, PDF p.21",
      "referenceUrl": "https://openstax.org/books/college-algebra/pages/1-5-factoring-polynomials",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "perfect-square",
      "factorization"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q058-SIM",
    "pairId": "P238-Q058",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Write 9x² − 12x + 4 as a perfect square.",
    "options": [
      "(3x+2)²",
      "(3x−4)²",
      "(9x−2)²",
      "(3x−2)²"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "9x²=(3x)² اور 4=2² ہیں جبکہ middle term −12x = −2(3x)(2) ہے۔ اس لیے مکمل مربع (3x−2)² بنتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q58",
      "referenceUrl": "https://openstax.org/books/college-algebra/pages/1-5-factoring-polynomials",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "perfect-square",
      "factorization"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q059-SRC",
    "pairId": "P238-Q059",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Find the roots of x² − 3x − 10 = 0.",
    "options": [
      "−8, −3",
      "9, 4",
      "4, 6",
      "5, −2"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "x²−3x−10 کو (x−5)(x+2) factor کیا جاتا ہے۔ دونوں factors صفر رکھنے سے roots 5 اور −2 آتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q59, PDF p.21",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "factorization"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q059-SIM",
    "pairId": "P238-Q059",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Find the roots of x² + x − 12 = 0.",
    "options": [
      "4 and −3",
      "3 and −4",
      "6 and −2",
      "12 and −1"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "x²+x−12 کو (x+4)(x−3) لکھتے ہیں۔ اس لیے roots −4 اور 3 ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q59",
      "referenceUrl": "https://openstax.org/books/college-algebra-corequisite-support-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic-equation",
      "factorization"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q060-SRC",
    "pairId": "P238-Q060",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 2³ × 3² − 5².",
    "options": [
      "42",
      "47",
      "49",
      "51"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پہلے powers حل ہوں گی: 2³=8 اور 3²=9، اس لیے حاصل ضرب 72 ہے۔ پھر 5²=25 منہا کرنے سے جواب 47 آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q60, PDF p.21",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/1-2-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "order-of-operations",
      "exponents"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q060-SIM",
    "pairId": "P238-Q060",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Evaluate 3³ + 2⁴ − 5.",
    "options": [
      "32",
      "36",
      "38",
      "42"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "3³=27 اور 2⁴=16 ہے۔ 27+16−5 کرنے سے 38 حاصل ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q60",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/1-2-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "order-of-operations",
      "exponents"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q061-SRC",
    "pairId": "P238-Q061",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the idiom: One hand ____ the other.",
    "options": [
      "hits",
      "pushes",
      "washes",
      "holds"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "درست محاورہ 'One hand washes the other' ہے اور اس میں washes آتا ہے۔ اس کا مفہوم باہمی مدد یا ایک دوسرے کو فائدہ پہنچانا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q61, PDF p.22",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/one%20hand%20washes%20the%20other",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "idiom",
      "proverb"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q061-SIM",
    "pairId": "P238-Q061",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the proverb: Many hands make ____ work.",
    "options": [
      "heavy",
      "slow",
      "light",
      "silent"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "معروف کہاوت 'Many hands make light work' ہے۔ مطلب یہ ہے کہ کئی افراد مل کر کام کریں تو مشکل نسبتاً آسان ہو جاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q61",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/many-hands-make-light-work",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "idiom",
      "proverb"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q062-SRC",
    "pairId": "P238-Q062",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the antonym of 'éclat'.",
    "options": [
      "Fame",
      "Dullness",
      "Splendor",
      "Shine"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Éclat کے معنی چمک، شان یا نمایاں کامیابی ہیں۔ ان معنوں کی ضد dullness یعنی بے رونقی بنتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q62, PDF p.22",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/eclat",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "antonym",
      "eclat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q062-SIM",
    "pairId": "P238-Q062",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to 'éclat'?",
    "options": [
      "Weakness",
      "Silence",
      "Brilliance",
      "Delay"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Éclat کا مفہوم brilliance، splendor یا شاندار کامیابی ہے۔ اس لیے Brilliance درست مترادف ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q62",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/eclat",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "antonym",
      "eclat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q063-SRC",
    "pairId": "P238-Q063",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the synonym of 'lissome'.",
    "options": [
      "Stiff",
      "Heavy",
      "Rough",
      "Supple"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Lissome ایسے جسم یا حرکت کو کہتے ہیں جو آسانی سے مڑ سکے اور خوش انداز ہو۔ Supple اس کا قریب ترین مترادف ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q63, PDF p.22",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/lissome",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "synonym",
      "lissome"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q063-SIM",
    "pairId": "P238-Q063",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the antonym of 'lissome'.",
    "options": [
      "Stiff",
      "Supple",
      "Flexible",
      "Graceful"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Lissome کا مفہوم flexible اور supple ہے۔ اس کے برعکس stiff یعنی اکڑا ہوا اس کا درست متضاد ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q63",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/lissome",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "vocabulary",
      "synonym",
      "lissome"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q064-SRC",
    "pairId": "P238-Q064",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the proverb: A drowning ____ will clutch at a straw.",
    "options": [
      "Child",
      "Man",
      "Person",
      "Boat"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "معیاری کہاوت 'A drowning man will clutch at a straw' ہے۔ اس میں man آتا ہے اور مفہوم یہ ہے کہ سخت مصیبت میں معمولی امید بھی پکڑ لی جاتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q64, PDF p.22",
      "referenceUrl": "https://dictionary.cambridge.org/us/dictionary/english/drowning-man-will-clutch-at-a-straw",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "idiom",
      "proverb",
      "straw"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan uses the non-standard wording 'catches at a straw.' The website uses the established form 'will clutch at a straw' while preserving the tested blank and printed answer Man."
  },
  {
    "id": "P238-Q064-SIM",
    "pairId": "P238-Q064",
    "kind": "similar",
    "categoryId": "english",
    "question": "What does 'a drowning man will clutch at a straw' mean?",
    "options": [
      "Help should never be accepted",
      "A swimmer should avoid rivers",
      "Small objects always float",
      "A desperate person will try even a slight chance of rescue"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "یہ کہاوت شدید مشکل میں موجود شخص کی بے بسی بیان کرتی ہے۔ ایسا شخص بچاؤ کے بہت کمزور امکان کو بھی آزما سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q64",
      "referenceUrl": "https://dictionary.cambridge.org/us/dictionary/english/drowning-man-will-clutch-at-a-straw",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "idiom",
      "proverb",
      "straw"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q065-SRC",
    "pairId": "P238-Q065",
    "kind": "source",
    "categoryId": "english",
    "question": "In the sentence 'The black rose is blooming in the garden,' what part of speech is 'rose'?",
    "options": [
      "Adjective",
      "Verb",
      "Noun",
      "Adverb"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "جملے میں rose ایک پھول کا نام ہے، اس لیے یہ noun ہے۔ Black اس noun کی خصوصیت بیان کرنے والا adjective ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q65, PDF p.22",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/nouns",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "parts-of-speech",
      "noun"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q065-SIM",
    "pairId": "P238-Q065",
    "kind": "similar",
    "categoryId": "english",
    "question": "In the sentence 'The black rose is blooming,' what part of speech is 'black'?",
    "options": [
      "Noun",
      "Verb",
      "Adjective",
      "Adverb"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Black لفظ rose کی رنگ والی صفت بیان کر رہا ہے۔ کسی noun کی کیفیت بتانے والا لفظ adjective ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q65",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/adjectives",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "parts-of-speech",
      "noun"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q066-SRC",
    "pairId": "P238-Q066",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the correct phrase: 'Gwadar, ____, is a beautiful coastal place.'",
    "options": [
      "that I visited last month",
      "where I visited last month",
      "which I visited last month",
      "who I visited last month"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Gwadar کے لیے non-defining relative clause میں which درست ہے کیونکہ یہ جگہ یا چیز کی طرف اشارہ کرتا ہے۔ مکمل جملہ ہوگا: 'Gwadar, which I visited last month, is a beautiful coastal place.'",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q66, PDF p.22",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/relative-pronouns-relative-clauses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "relative-clause",
      "which"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q066-SIM",
    "pairId": "P238-Q066",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the correct relative phrase: 'The teacher, ____ helped me, was very patient.'",
    "options": [
      "who",
      "where",
      "which",
      "whose book"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "انسان کے لیے subject relative pronoun who استعمال ہوتا ہے۔ یہاں teacher نے مدد کی، اس لیے who درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q66",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/relative-pronouns-relative-clauses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "relative-clause",
      "which"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q067-SRC",
    "pairId": "P238-Q067",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: 'He refuses to eat any of the food. He will eat ____.'",
    "options": [
      "Anything",
      "Nothing",
      "Something",
      "Everything"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Refuses to eat any of the food سے واضح ہے کہ وہ کچھ بھی نہیں کھائے گا۔ مثبت grammatical structure میں اس مکمل نفی کو “He will eat nothing” بیان کرتا ہے، اس لیے nothing درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q67, PDF p.22",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/negative-clauses-with-any-anybody-anyone-anything-anywhere",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "negatives",
      "nothing-anything"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed premise merely said that he did not like the food, which does not logically prove that he would eat nothing. The premise is narrowed to an explicit refusal so the keyed answer is unique."
  },
  {
    "id": "P238-Q067-SIM",
    "pairId": "P238-Q067",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the standard negative sentence: 'She did not buy ____.'",
    "options": [
      "nothing",
      "something always",
      "everything",
      "anything"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "معیاری انگریزی میں منفی verb کے ساتھ anything استعمال ہوتا ہے۔ 'did not buy nothing' دوہری نفی بن جاتی ہے اور رسمی معیار میں درست نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q67",
      "referenceUrl": "https://dictionary.cambridge.org/grammar/british-grammar/negative-clauses-with-any-anybody-anyone-anything-anywhere",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "negatives",
      "nothing-anything"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q068-SRC",
    "pairId": "P238-Q068",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: 'He was annoyed ____ her remarks.'",
    "options": [
      "at",
      "on",
      "from",
      "into"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کسی بات، رویے یا remark پر ناراضی کے لیے annoyed at ایک معیاری ترکیب ہے۔ دیے گئے منفرد اختیارات میں صرف “annoyed at her remarks” درست مکمل جملہ بناتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q68, PDF p.22",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/annoyed",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "annoyed"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed choices included by, but both 'annoyed at her remarks' and 'annoyed by her remarks' are valid English. The valid competing distractor was replaced so the keyed answer at is unique."
  },
  {
    "id": "P238-Q068-SIM",
    "pairId": "P238-Q068",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the correct preposition: 'She was annoyed ____ her colleague for arriving late.'",
    "options": [
      "at",
      "on",
      "with",
      "from"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "کسی شخص سے ناراض ہونے کے لیے annoyed with استعمال کیا جاتا ہے۔ اسی لیے colleague کے ساتھ with درست preposition ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q68",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/annoyed",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "annoyed"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q069-SRC",
    "pairId": "P238-Q069",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: 'He visited Skardu in June and has returned. He has ____ to Skardu.'",
    "options": [
      "been",
      "went",
      "gone",
      "go"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "'Has been to Skardu' کا مطلب ہے کہ وہ سکردو گیا اور واپس آ چکا ہے۔ 'Has gone to' عموماً بتاتا ہے کہ شخص ابھی وہاں ہے یا راستے میں ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q69, PDF p.22",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-perfect",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "present-perfect",
      "been-gone"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan merely adds 'He went there in June,' which does not explicitly say whether he returned. The stem is clarified because 'has been to' conventionally denotes a completed visit, whereas 'has gone to' suggests the person is still away."
  },
  {
    "id": "P238-Q069-SIM",
    "pairId": "P238-Q069",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the correct form: 'Ali is not here; he has ____ to Lahore.'",
    "options": [
      "been",
      "go",
      "went",
      "gone"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "چونکہ علی یہاں موجود نہیں، اس لیے has gone مناسب ہے۔ Has been کا مطلب عموماً دورہ کرکے واپس آنا ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q69",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-perfect",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "present-perfect",
      "been-gone"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q070-SRC",
    "pairId": "P238-Q070",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Whoop : Exuberance :: Keen : ____.",
    "options": [
      "Joy",
      "Anger",
      "Mourning",
      "Fear"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Whoop خوشی یا جوش کی بلند آواز ہوسکتی ہے، جبکہ keen بطور فعل سوگ میں بلند آواز سے رونے کو کہتے ہیں۔ اس لیے Exuberance کے مقابل Mourning درست مناسبت ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q70, PDF p.22",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/whoop",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "whoop",
      "keen"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q070-SIM",
    "pairId": "P238-Q070",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the analogy: Giggle : Amusement :: Sob : ____.",
    "options": [
      "Victory",
      "Sorrow",
      "Hunger",
      "Speed"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Giggle عموماً amusement کی آواز ہے جبکہ sob غم یا sorrow سے وابستہ ہے۔ تعلق آواز اور اس کے جذباتی سبب کا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q70",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/sob",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "whoop",
      "keen"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q071-SRC",
    "pairId": "P238-Q071",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Break : Shift :: Minute : ____.",
    "options": [
      "Hour",
      "Day",
      "Minute",
      "Second"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کام کی shift میں break ایک چھوٹا حصہ ہوتا ہے، جیسے hour میں minute ایک حصہ ہے۔ اس لیے Hour درست تکمیل ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q71, PDF p.22",
      "referenceUrl": "https://www.nist.gov/pml/owm/si-units-time",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "part-whole"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q071-SIM",
    "pairId": "P238-Q071",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the analogy: Chapter : Book :: Scene : ____.",
    "options": [
      "Actor",
      "Sentence",
      "Play",
      "Library"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Chapter کتاب کا حصہ ہوتا ہے اور scene ڈرامے یا play کا حصہ ہوتا ہے۔ اسی part-to-whole تعلق سے Play درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q71",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/scene",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "part-whole"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q072-SRC",
    "pairId": "P238-Q072",
    "kind": "source",
    "categoryId": "english",
    "question": "In a clause such as 'the person who called,' what part of speech is 'who'?",
    "options": [
      "Noun",
      "Verb",
      "Relative pronoun",
      "None of These"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Who جب کسی پہلے مذکور شخص کو subordinate clause سے جوڑے تو relative pronoun ہوتا ہے۔ مثال میں 'the person who called' میں who شخص کی طرف لوٹتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q72, PDF p.22",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/relative-pronouns-relative-clauses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "relative-pronoun",
      "who-which"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q072-SIM",
    "pairId": "P238-Q072",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which relative pronoun is normally used for things rather than people?",
    "options": [
      "who",
      "whom",
      "whose",
      "which"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Which اشیا اور غیر انسانی antecedents کے لیے عام relative pronoun ہے۔ Who اور whom بنیادی طور پر اشخاص کے لیے استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q72",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/relative-pronouns-relative-clauses",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "relative-pronoun",
      "who-which"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q073-SRC",
    "pairId": "P238-Q073",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the correctly punctuated direct question.",
    "options": [
      "What is it about cricket that you enjoy.",
      "What is it about cricket that you enjoy?",
      "What is it about cricket that you enjoy!",
      "None of these"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "یہ direct question ہے، اس لیے آخر میں question mark لگتا ہے۔ درست صورت 'What is it about cricket that you enjoy?' ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q73, PDF p.22",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/punctuation/question_marks.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punctuation",
      "question-mark"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q073-SIM",
    "pairId": "P238-Q073",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which punctuation mark normally ends a direct exclamation?",
    "options": [
      "Full stop",
      "Exclamation mark",
      "Question mark",
      "Comma"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "تعجب، زور دار احساس یا پکار کے اختتام پر exclamation mark استعمال ہوسکتا ہے۔ Question mark صرف براہ راست سوال کے لیے ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q73",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/punctuation/question_marks.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punctuation",
      "question-mark"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q074-SRC",
    "pairId": "P238-Q074",
    "kind": "source",
    "categoryId": "english",
    "question": "Which sentence is correctly punctuated?",
    "options": [
      "He was completely exhausted yet, he continued studying for his exam.",
      "He was completely exhausted, when he continued studying for his exam.",
      "He was completely exhausted, yet he continued studying for his exam.",
      "He was completely exhausted, yet, he continued studying for his exam."
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دو independent clauses کو coordinating conjunction yet سے جوڑتے وقت yet سے پہلے comma آتا ہے۔ مکمل declarative sentence کے آخر میں full stop مناسب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q74, PDF p.22",
      "referenceUrl": "https://owl.purdue.edu/owl/graduate_writing/documents/Taming-Commas-Handout.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punctuation",
      "comma",
      "yet"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "In the scan, options A and C are both grammatically possible and differ only because A ends with an exclamation mark while C has no visible terminal mark. The website supplies uniquely distinguishable punctuation distractors and retains the printed key C."
  },
  {
    "id": "P238-Q074-SIM",
    "pairId": "P238-Q074",
    "kind": "similar",
    "categoryId": "english",
    "question": "Choose the correctly punctuated compound sentence.",
    "options": [
      "She was tired yet, she continued.",
      "She was tired, yet she continued.",
      "She was tired yet she, continued.",
      "She was tired, yet, she continued."
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "یہاں yet دو مکمل clauses کو جوڑ رہا ہے، اس لیے اس سے پہلے comma آتا ہے۔ yet کے فوراً بعد اضافی comma درکار نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q74",
      "referenceUrl": "https://owl.purdue.edu/owl/graduate_writing/documents/Taming-Commas-Handout.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "punctuation",
      "comma",
      "yet"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q075-SRC",
    "pairId": "P238-Q075",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which later specialized diwan was responsible for land-tax revenue (kharaj) in early Islamic administration?",
    "options": [
      "Diwan al-Kharaj",
      "Diwan al-Rasa'il",
      "Diwan al-Ata",
      "Bayt al-Hikmah"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Diwan al-Kharaj زمین سے متعلق tax revenue اور مالی وصولیوں کا تخصصی محکمہ تھا۔ حضرت عمر رضی اللہ عنہ کے ابتدائی دیوان میں وظائف اور مستحقین کا register تھا؛ بعد میں مختلف specialized bureaus الگ ہوئے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q75, PDF p.22",
      "referenceUrl": "https://www.iranicaonline.org/articles/divan/divan-ii-government-office/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hazrat-umar",
      "diwan",
      "fiscal-administration"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The printed stem directly attributed Diwan al-Kharaj to Caliph Umar, but historical references distinguish Umar's early stipend register from later specialized bureaus. The website tests the verified later land-tax function while retaining the keyed institution."
  },
  {
    "id": "P238-Q075-SIM",
    "pairId": "P238-Q075",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which early Islamic bureau maintained registers of soldiers and military stipends?",
    "options": [
      "Diwan al-Khatam",
      "Diwan al-Barid",
      "Diwan al-Rasa'il",
      "Diwan al-Jund"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Diwan al-Jund فوجیوں کے اندراج، تنخواہوں اور عطیات سے متعلق فوجی دفتر تھا۔ Diwan al-Kharaj زمین اور مالی محاصل سے متعلق تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q75",
      "referenceUrl": "https://www.iranicaonline.org/articles/divan/divan-ii-government-office/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hazrat-umar",
      "diwan",
      "fiscal-administration"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q076-SRC",
    "pairId": "P238-Q076",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "After the death of Khadijah (RA), whom did Prophet Muhammad (PBUH) marry first?",
    "options": [
      "Safiyyah (RA)",
      "Sawdah (RA)",
      "Hafsah (RA)",
      "Juwayriyyah (RA)"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "حضرت خدیجہ رضی اللہ عنہا کے انتقال کے بعد رسول اللہ ﷺ کا پہلا نکاح حضرت سودہ بنت زمعہ رضی اللہ عنہا سے ہوا۔ اس لیے Hazrat Sawdah درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q76, PDF p.22",
      "referenceUrl": "https://www.dar-alifta.org/ar/ourreligion/details/5144/%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9-%D8%B3%D9%88%D8%AF%D8%A9-%D8%A8%D9%86%D8%AA-%D8%B2%D9%85%D8%B9%D8%A9-%D8%B1%D8%B6%D9%8A-%D8%A7%D9%84%D9%84%D9%87-%D8%B9%D9%86%D9%87%D8%A7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "wives-of-prophet",
      "sawdah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q076-SIM",
    "pairId": "P238-Q076",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Who was the first wife of Prophet Muhammad (PBUH)?",
    "options": [
      "Aishah bint Abi Bakr (RA)",
      "Khadijah bint Khuwaylid (RA)",
      "Hafsah bint Umar (RA)",
      "Sawdah bint Zam'ah (RA)"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "رسول اللہ ﷺ کی پہلی زوجہ حضرت خدیجہ بنت خویلد رضی اللہ عنہا تھیں۔ حضرت سودہ رضی اللہ عنہا سے نکاح حضرت خدیجہ کے انتقال کے بعد ہوا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q76",
      "referenceUrl": "https://www.dar-alifta.org/ar/ourreligion/details/5144/%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9-%D8%B3%D9%88%D8%AF%D8%A9-%D8%A8%D9%86%D8%AA-%D8%B2%D9%85%D8%B9%D8%A9-%D8%B1%D8%B6%D9%8A-%D8%A7%D9%84%D9%84%D9%87-%D8%B9%D9%86%D9%87%D8%A7",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "wives-of-prophet",
      "sawdah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q077-SRC",
    "pairId": "P238-Q077",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "The Incident of Ifk concerned which Mother of the Believers?",
    "options": [
      "Khadijah (RA)",
      "Aishah (RA)",
      "Umm Salamah (RA)",
      "Juwayriyyah (RA)"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "واقعۂ افک حضرت عائشہ رضی اللہ عنہا پر لگائے گئے بہتان سے متعلق تھا۔ سورۃ النور کی آیات 11 سے آگے نے اس الزام کی تردید کی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q77, PDF p.22",
      "referenceUrl": "https://quran.com/24/11",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "incident-of-ifk",
      "aishah",
      "surah-an-nur"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q077-SIM",
    "pairId": "P238-Q077",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "In which Surah are the verses concerning the Incident of Ifk found?",
    "options": [
      "Al-Baqarah",
      "An-Nur",
      "An-Nisa",
      "Al-Ahzab"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "واقعۂ افک سے متعلق آیات سورۃ النور میں ہیں اور آیت 11 سے اس واقعے کا بیان شروع ہوتا ہے۔ اس لیے An-Nur درست جواب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q77",
      "referenceUrl": "https://quran.com/24/11",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "incident-of-ifk",
      "aishah",
      "surah-an-nur"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q078-SRC",
    "pairId": "P238-Q078",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Who presented a coat of chainmail to Prophet Muhammad (PBUH) before the Battle of Badr?",
    "options": [
      "Khalid bin al-Walid (RA)",
      "Zubayr bin al-Awwam (RA)",
      "Ukkashah bin Mihsan (RA)",
      "Sa'd bin Ubadah (RA)"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "معتبر سیرت کے مطابق سعد بن عبادہ رضی اللہ عنہ نے غزوۂ بدر سے پہلے رسول اللہ ﷺ کو زرہ پیش کی۔ اس لیے Sa'd bin Ubadah درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q78, PDF p.22",
      "referenceUrl": "https://www.alislam.org/articles/sad-bin-ubadah/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "battle-of-badr",
      "saad-bin-ubadah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says the armour was given 'during' Badr. The cited biographical account places the gift before the Battle of Badr, so the timing has been corrected without changing the answer."
  },
  {
    "id": "P238-Q078-SIM",
    "pairId": "P238-Q078",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which Companion is described as carrying the standard of the Ansar in battles?",
    "options": [
      "Abu Ubaydah (RA)",
      "Khalid bin al-Walid (RA)",
      "Ukkashah bin Mihsan (RA)",
      "Sa'd bin Ubadah (RA)"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سعد بن عبادہ رضی اللہ عنہ انصار کے نمایاں سردار تھے اور ان کا جھنڈا اٹھانے کا ذکر ملتا ہے۔ اسی لیے پہلا انتخاب درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q78",
      "referenceUrl": "https://www.alislam.org/articles/sad-bin-ubadah/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "battle-of-badr",
      "saad-bin-ubadah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q079-SRC",
    "pairId": "P238-Q079",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which force overthrew the Baghdad-based Abbasid Caliphate in 1258?",
    "options": [
      "Seljuk",
      "Umayyad",
      "Mongols",
      "None of these"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "1258 میں منگول فوج نے بغداد فتح کرکے بغداد میں قائم عباسی خلافت کا خاتمہ کیا۔ اس لیے Mongols درست جواب ہے، اگرچہ انہیں dynasty کہنا کم درست اصطلاح ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q79, PDF p.22",
      "referenceUrl": "https://www.britannica.com/topic/Abbasid-caliphate",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "abbasid-caliphate",
      "mongols",
      "1258"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan asks which 'dynasty' overthrew the Abbasids. 'Mongols' is a people/imperial force rather than a dynasty name, so the stem has been made historically precise while retaining the printed answer."
  },
  {
    "id": "P238-Q079-SIM",
    "pairId": "P238-Q079",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which Mongol leader captured Baghdad in 1258?",
    "options": [
      "Genghis Khan",
      "Babur",
      "Timur",
      "Hulagu Khan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ہلاکو خان کی منگول فوج نے 1258 میں بغداد پر قبضہ کیا۔ اس واقعے سے بغداد کی عباسی خلافت ختم ہوئی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q79",
      "referenceUrl": "https://www.britannica.com/biography/Hulegu",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "abbasid-caliphate",
      "mongols",
      "1258"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q080-SRC",
    "pairId": "P238-Q080",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: 'رات گئی ____ گئی۔'",
    "options": [
      "بات",
      "یاد",
      "شام",
      "رات"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مکمل ضرب المثل 'رات گئی بات گئی' ہے، اس لیے خالی جگہ میں بات آئے گا۔ اس کا مطلب گزری ہوئی بات کو چھوڑ دینا اور دوبارہ نہ چھیڑنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q80, PDF p.22",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-gaii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "رات-گئی-بات-گئی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q080-SIM",
    "pairId": "P238-Q080",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'رات گئی بات گئی' mean?",
    "options": [
      "گزری بات کو بھلا دینا",
      "رات کو سفر کرنا",
      "بات کو لکھ لینا",
      "صبح کا انتظار کرنا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اس ضرب المثل میں ماضی کی بات کو ختم سمجھنے کا مشورہ ہے۔ لہٰذا 'گزری بات کو بھلا دینا' درست مفہوم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q80",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-gaii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "رات-گئی-بات-گئی"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q081-SRC",
    "pairId": "P238-Q081",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the verified Urdu proverb 'کھودا پہاڑ نکلا چوہا' mean?",
    "options": [
      "وقت کا ضیاع",
      "بہت زیادہ منافع ہونا",
      "محنت زیادہ مگر فائدہ کم",
      "خیر خواہ"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ضرب المثل 'کھودا پہاڑ نکلا چوہا' اس موقع پر بولی جاتی ہے جب بہت شور یا محنت کے بعد نتیجہ نہایت معمولی نکلے۔ اس لیے 'محنت زیادہ مگر فائدہ کم' درست مفہوم ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q81, PDF p.22",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-khodaa-2?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "effort-result"
    ],
    "verificationStatus": "verified-reconstructed",
    "sourceNotes": "The scan contains an unattested and likely corrupted expression ('رات بھر میاں صرف ایک بچہ جنایا'). It is replaced with the verified proverb that matches the printed key's meaning rather than teaching corrupted wording."
  },
  {
    "id": "P238-Q081-SIM",
    "pairId": "P238-Q081",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'نو دن چلے اڑھائی کوس' imply?",
    "options": [
      "مشکل کام کی فوری تکمیل",
      "بہت تیز سفر",
      "کم خرچ میں بڑا فائدہ",
      "بہت سست رفتاری اور کاہلی"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "یہ ضرب المثل بہت کم فاصلہ طے کرنے کے لیے بہت زیادہ وقت لگانے پر بولی جاتی ہے۔ اس میں سست رفتاری اور کاہلی پر طنز کیا جاتا ہے، اس لیے پہلا انتخاب درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q81",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-nau-din-chale-adhaaii-kos",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "slow-progress"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q082-SRC",
    "pairId": "P238-Q082",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: 'جھوٹ کے ____ نہیں ہوتے۔'",
    "options": [
      "ہاتھ",
      "پاؤں",
      "کان",
      "پر"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل ضرب المثل 'جھوٹ کے پاؤں نہیں ہوتے' ہے، اس لیے پاؤں درست لفظ ہے۔ مطلب یہ ہے کہ جھوٹ قائم نہیں رہتا اور جلد بے نقاب ہو جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q82, PDF p.22",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-jhuut-ke-paanv-nahiin-hote-1?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "truth-lie"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q082-SIM",
    "pairId": "P238-Q082",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'جھوٹ کے پاؤں نہیں ہوتے' imply?",
    "options": [
      "جھوٹ زیادہ دیر قائم نہیں رہتا",
      "جھوٹ ہمیشہ کامیاب ہوتا ہے",
      "سفر کرنا مشکل ہے",
      "خاموشی بہترین جواب ہے"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "بے بنیاد بات کے پاس قائم رہنے کی قوت نہیں ہوتی۔ اسی لیے یہ ضرب المثل جھوٹ کے جلد ظاہر ہو جانے کا مفہوم دیتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q82",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-jhuut-ke-paanv-nahiin-hote-1?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "truth-lie"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q083-SRC",
    "pairId": "P238-Q083",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom 'ٹسوے بہانا' mean?",
    "options": [
      "سچ مچ کا رونا",
      "جھوٹ موٹ کا رونا",
      "خوشی کے آنسو",
      "آنکھوں میں پانی آنا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "'ٹسوے بہانا' بناوٹی یا جھوٹ موٹ کا رونا ہے۔ یہ محاورہ ایسے آنسوؤں کے لیے آتا ہے جن کے پیچھے حقیقی غم نہ ہو۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q83, PDF p.22",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-bahaanaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "false-tears"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q083-SIM",
    "pairId": "P238-Q083",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which meaning best matches the Urdu expression 'مگرمچھ کے آنسو بہانا'?",
    "options": [
      "سچے غم میں رونا",
      "آنکھ کا علاج کرنا",
      "خوشی سے ہنسنا",
      "بناوٹی افسوس ظاہر کرنا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "مگرمچھ کے آنسو بناوٹی غم اور غیر مخلص افسوس کی علامت ہیں۔ اسی طرح ٹسوے بہانا بھی جھوٹا رونا ظاہر کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q83",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-bahaanaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "false-tears"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q084-SRC",
    "pairId": "P238-Q084",
    "kind": "source",
    "categoryId": "urdu",
    "question": "How many basic constituents, or 'ارکان', does 'استعارہ' have?",
    "options": [
      "دو",
      "چار",
      "تین",
      "پانچ"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "استعارے کے بنیادی ارکان تین مانے جاتے ہیں: مستعار لہ، مستعار منہ اور وجہ جامع۔ اس لیے درست تعداد تین ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q84, PDF p.23",
      "referenceUrl": "https://alhamd.aiu.edu.pk/wp-content/uploads/2022/03/10-urdu-issue-15-m.-afzal.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-rhetoric",
      "istiara"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q084-SIM",
    "pairId": "P238-Q084",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which of the following is NOT one of the three basic constituents of 'استعارہ'?",
    "options": [
      "مستعار لہ",
      "مستعار منہ",
      "حرف تشبیہ",
      "وجہ جامع"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "استعارے کے بنیادی ارکان میں حرف تشبیہ شامل نہیں ہوتا کیونکہ تشبیہ کو صریح لفظ کے بغیر پوشیدہ رکھا جاتا ہے۔ باقی تین اصطلاحات بنیادی ارکان ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q84",
      "referenceUrl": "https://alhamd.aiu.edu.pk/wp-content/uploads/2022/03/10-urdu-issue-15-m.-afzal.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-rhetoric",
      "istiara"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q085-SRC",
    "pairId": "P238-Q085",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom 'پانی پانی کرنا' mean?",
    "options": [
      "نہلانا",
      "پیاس بجھانا",
      "پانی پلانا",
      "شرمندہ کرنا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "'پانی پانی کرنا' کا مطلب کسی کو بہت شرمندہ یا رسوا کرنا ہے۔ پانی پلانا یا نہلانا اس محاوراتی استعمال کا مفہوم نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q85, PDF p.23",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-paanii-paanii-karnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "shame"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan contains the unclear extra phrase 'تکرار کی بات' before repeating the idiom. That fragment is omitted from the cleaned stem; the legible tested idiom and printed answer are retained."
  },
  {
    "id": "P238-Q085-SIM",
    "pairId": "P238-Q085",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu expression 'شرم سے پانی پانی ہونا' mean?",
    "options": [
      "شدید شرمندہ ہونا",
      "بارش میں بھیگنا",
      "بہت پیاس لگنا",
      "بیمار ہو جانا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "شرم سے پانی پانی ہونا شدید شرمندگی کی کیفیت بیان کرتا ہے۔ اس لیے 'شدید شرمندہ ہونا' درست انتخاب ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q85",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-paanii-paanii-karnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "shame"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q086-SRC",
    "pairId": "P238-Q086",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In the Urdu sentence 'وہ بہت رو رہا تھا', what part of speech is 'وہ'?",
    "options": [
      "اسم ضمیر",
      "اسم اشارہ",
      "صفت",
      "فعل"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جملے میں 'وہ' کسی شخص کے نام کی جگہ استعمال ہوا ہے، اس لیے یہ اسم ضمیر ہے۔ یہ فعل یا صفت نہیں کیونکہ نہ کام بتاتا ہے نہ کیفیت۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q86, PDF p.23",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-zamiir?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "pronoun"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q086-SIM",
    "pairId": "P238-Q086",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In Urdu grammar, what type of pronoun is 'میں'?",
    "options": [
      "ضمیر مخاطب",
      "ضمیر متکلم",
      "ضمیر غائب",
      "اسم اشارہ"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "'میں' بولنے والے کے لیے استعمال ہوتا ہے، اس لیے اسے ضمیر متکلم کہتے ہیں۔ 'تم' ضمیر مخاطب اور 'وہ' عموماً ضمیر غائب ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q86",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-zamiir?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "pronoun"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q087-SRC",
    "pairId": "P238-Q087",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom 'جلے پاؤں کی بلی' mean?",
    "options": [
      "آرام کرنے والا شخص",
      "بہت تھکا ہوا شخص",
      "بے چین شخص جو ایک جگہ نہ ٹک سکے",
      "خاموش رہنے والا شخص"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "معیاری محاورہ 'جلے پاؤں کی بلی' ہے اور اس سے مراد بے چین شخص ہے جو ایک جگہ نہ ٹک سکے۔ scan میں 'چلے' غالباً طباعتی یا بصری غلطی ہے؛ دیے گئے جواب کو وسیع اور غیر مخصوص مفہوم میں صاف کیا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q87, PDF p.23",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-jale-paanv-kii-billii?keyword=%2CpUV&lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "restlessness"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The faint scan appears to print 'چلے پاؤں کی بلی'; the standard form is 'جلے پاؤں کی بلی'. Rekhta records both the broad sense of a restless person and usage for a woman who keeps roaming, so option C is normalized to the broader meaning while retaining the keyed index."
  },
  {
    "id": "P238-Q087-SIM",
    "pairId": "P238-Q087",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'گھر کی مرغی دال برابر' mean?",
    "options": [
      "گھر میں کھانا ختم ہونا",
      "اپنی یا آسانی سے دستیاب اچھی چیز کی قدر نہ کرنا",
      "مہمان کی بہت عزت کرنا",
      "محنت سے دولت کمانا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "یہ ضرب المثل بتاتی ہے کہ لوگ اپنے پاس موجود قابل قدر چیز یا شخص کی قدر نہیں کرتے۔ اس لیے پہلا مفہوم درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q87",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-ghar-kii-murgii-daal-baraabar?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "restlessness"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q088-SRC",
    "pairId": "P238-Q088",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu proverb: 'سانجھے کی ہنڈیا چوراہے پر ____۔'",
    "options": [
      "پھوٹے",
      "چلے",
      "پکے",
      "رکے"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مکمل ضرب المثل 'سانجھے کی ہنڈیا چوراہے پر پھوٹے' ہے۔ اس لیے خالی جگہ میں 'پھوٹے' درست لفظ ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q88, PDF p.23",
      "referenceUrl": "https://archive.jasarat.org/fridayspecial/2020/06/19/248766/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "shared-responsibility"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q088-SIM",
    "pairId": "P238-Q088",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb 'سانجھے کی ہنڈیا چوراہے پر پھوٹتی ہے' suggest?",
    "options": [
      "بے ذمہ دار مشترکہ کام اکثر ناکام ہوتا ہے",
      "مشترکہ کام ہمیشہ فوراً کامیاب ہوتا ہے",
      "بازار میں کھانا مفت ملتا ہے",
      "برتن چوراہے پر بیچنا چاہیے"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کہاوت کا مفہوم یہ ہے کہ جس مشترکہ کام کی واضح ذمہ داری نہ ہو وہ بگڑ سکتا ہے۔ اسی لیے پہلا انتخاب درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q88",
      "referenceUrl": "https://archive.jasarat.org/fridayspecial/2020/06/19/248766/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "shared-responsibility"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q089-SRC",
    "pairId": "P238-Q089",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu expression: 'دل پر ____ رکھ کر مشکل فیصلہ کرنا۔'",
    "options": [
      "کانچ",
      "پتھر",
      "ہاتھ",
      "بوجھ"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل محاورہ 'دل پر پتھر رکھنا' ہے۔ اس کا مطلب جذبات یا دکھ دبا کر صبر کے ساتھ سخت فیصلہ کرنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 238, Q89, PDF p.23",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-dil-par-patthar-rakhnaa?lang=hi",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "patience"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P238-Q089-SIM",
    "pairId": "P238-Q089",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom 'دل پر پتھر رکھنا' mean?",
    "options": [
      "بے رحمی سے ہنسنا",
      "فوراً بدلہ لینا",
      "دل کی بیماری چھپانا",
      "غم ضبط کرکے سخت قدم اٹھانا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "یہ محاورہ اندرونی دکھ کے باوجود حوصلہ اور ضبط سے مشکل کام کرنے کے لیے آتا ہے۔ لہٰذا غم ضبط کرکے سخت قدم اٹھانا درست مفہوم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice question — Paper 238, Q89",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-dil-par-patthar-rakhnaa?lang=hi",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "patience"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q001-SRC",
    "pairId": "P239-Q001",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Kyoto is a famous city of which country?",
    "options": [
      "China",
      "Japan",
      "South Korea",
      "Thailand"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کیوٹو جاپان کا ایک تاریخی شہر ہے جس کی شہری تاریخ 794ء میں ہیان کیو کو شاہی دارالحکومت بنانے سے شروع ہوتی ہے۔ کیوٹو سٹی کے سرکاری تعارف کے مطابق یہ جاپان کی ثقافت اور تاریخ کا اہم مرکز ہے، اس لیے درست جواب Japan ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q1, PDF p.24",
      "referenceUrl": "https://www.city.kyoto.lg.jp/sogo/page/0000305427.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kyoto",
      "japan",
      "cities"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q001-SIM",
    "pairId": "P239-Q001",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "In which year was Heian-kyo, the city now known as Kyoto, established as Japan's imperial capital?",
    "options": [
      "710",
      "794",
      "1185",
      "1603"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کیوٹو سٹی کی سرکاری تاریخ کے مطابق ہیان کیو 794ء میں قائم ہوا۔ بعد میں اسی شہر کو کیوٹو کے نام سے شہرت ملی اور یہ ایک ہزار سال سے زیادہ عرصے تک جاپانی شاہی و ثقافتی زندگی کا مرکز رہا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q1",
      "referenceUrl": "https://www.city.kyoto.lg.jp/sogo/page/0000305427.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "kyoto",
      "heian-kyo",
      "794"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q002-SRC",
    "pairId": "P239-Q002",
    "kind": "source",
    "categoryId": "general-knowledge",
    "question": "Which of these buildings holds the record for the tallest twisting tower?",
    "options": [
      "Tokyo Skytree, Japan",
      "Shanghai Tower, China",
      "Canton Tower, China",
      "Burj Khalifa, UAE"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "گنیز ورلڈ ریکارڈز کے مطابق شنگھائی ٹاور دنیا کی بلند ترین twisting building ہے۔ اس کی بلندی 632 میٹر ہے اور اس کے 128 منزلہ ڈھانچے میں زمین سے چھت تک مجموعی طور پر 120 درجے کا گھماؤ آتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q2, PDF p.24",
      "referenceUrl": "https://www.guinnessworldrecords.com/world-records/112047-tallest-twisted-tower",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "shanghai-tower",
      "twisted-tower",
      "world-record"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan says 'longest Spiral Tower'. The website uses Guinness's precise record title, 'tallest twisting building', and standardizes place names."
  },
  {
    "id": "P239-Q002-SIM",
    "pairId": "P239-Q002",
    "kind": "similar",
    "categoryId": "general-knowledge",
    "question": "What is the architectural height of Shanghai Tower?",
    "options": [
      "492 metres",
      "555 metres",
      "828 metres",
      "632 metres"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "کونسل آن ٹال بلڈنگز کے Skyscraper Center کے مطابق شنگھائی ٹاور کی architectural height 632 میٹر، یعنی 2,073 فٹ ہے۔ 492 میٹر شنگھائی ورلڈ فنانشل سینٹر جبکہ 828 میٹر برج خلیفہ کی بلندی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q2",
      "referenceUrl": "https://www.skyscrapercenter.com/building/id/56",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "shanghai-tower",
      "632-metres",
      "skyscrapers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q003-SRC",
    "pairId": "P239-Q003",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "On which date did Pakistan conduct its first nuclear device tests?",
    "options": [
      "11 May 1998",
      "30 May 1998",
      "28 May 1998",
      "25 May 1998"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان نے 28 مئی 1998ء کو چاغی کے پہاڑوں میں اپنے جوہری تجربات کیے۔ اسی تاریخی واقعے کی یاد میں ہر سال 28 مئی کو یومِ تکبیر منایا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q3, PDF p.24",
      "referenceUrl": "https://pid.gov.pk/site/press_detail/32879",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chagai",
      "youm-e-takbeer",
      "28-may-1998"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q003-SIM",
    "pairId": "P239-Q003",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What national day does Pakistan observe on 28 May to commemorate the 1998 nuclear tests?",
    "options": [
      "Defence Day",
      "Pakistan Day",
      "Youm-e-Takbeer",
      "Kashmir Solidarity Day"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "28 مئی کے جوہری تجربات کی یاد میں پاکستان یومِ تکبیر مناتا ہے۔ یہ دن 1998ء میں حاصل ہونے والی جوہری دفاعی صلاحیت سے منسوب ہے، جبکہ یومِ دفاع 6 ستمبر کو منایا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q3",
      "referenceUrl": "https://na.gov.pk/en/pressrelease_detail.php?id=6098",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "youm-e-takbeer",
      "national-days",
      "nuclear-tests"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q004-SRC",
    "pairId": "P239-Q004",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who represented Pakistan as its leader at the first Islamic Summit in Rabat in 1969?",
    "options": [
      "Zulfiqar Ali Bhutto",
      "Ayub Khan",
      "Yahya Khan",
      "Liaquat Ali Khan"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ستمبر 1969ء میں رباط میں ہونے والی پہلی اسلامی سربراہی کانفرنس میں پاکستان کی قیادت صدر جنرل یحییٰ خان نے کی۔ تاریخی تصویری ریکارڈ میں بھی یحییٰ خان کو دیگر شریک سربراہانِ مملکت کے ساتھ دکھایا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q4, PDF p.24",
      "referenceUrl": "https://repository.hsrc.ac.za/handle/20.500.11910/10150",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "oic",
      "rabat-summit",
      "yahya-khan"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q004-SIM",
    "pairId": "P239-Q004",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which city was the first Islamic Summit Conference held in September 1969?",
    "options": [
      "Jeddah",
      "Rabat",
      "Lahore",
      "Cairo"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پہلی اسلامی سربراہی کانفرنس 22 سے 25 ستمبر 1969ء تک مراکش کے دارالحکومت رباط میں ہوئی۔ اس کانفرنس کے فیصلوں نے مستقل اسلامی سیکریٹریٹ اور بعد کے OIC ڈھانچے کی بنیاد بنانے میں مدد دی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q4",
      "referenceUrl": "https://www.oic-oci.org/docdown/?docID=4404&refID=1237",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "first-islamic-summit",
      "rabat",
      "1969"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q005-SRC",
    "pairId": "P239-Q005",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was the second Governor-General of Pakistan?",
    "options": [
      "Muhammad Ali Jinnah",
      "Khawaja Nazimuddin",
      "Malik Ghulam Muhammad",
      "Iskander Mirza"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "قومی اسمبلی کے سرکاری ریکارڈ میں محمد علی جناح کے بعد خواجہ ناظم الدین دوسرے گورنر جنرل درج ہیں۔ ان کی مدت 14 ستمبر 1948ء سے 16 اکتوبر 1951ء تک رہی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q5, PDF p.24",
      "referenceUrl": "https://na.gov.pk/en/print_list.php?type=governers",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "governor-general",
      "khawaja-nazimuddin",
      "pakistan-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q005-SIM",
    "pairId": "P239-Q005",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Who was the third Governor-General of Pakistan?",
    "options": [
      "Khawaja Nazimuddin",
      "Liaquat Ali Khan",
      "Iskander Mirza",
      "Malik Ghulam Muhammad"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "سرکاری فہرست کے مطابق ملک غلام محمد پاکستان کے تیسرے گورنر جنرل تھے۔ وہ 19 اکتوبر 1951ء سے 5 اکتوبر 1955ء تک اس عہدے پر رہے، جس کے بعد اسکندر مرزا آئے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q5",
      "referenceUrl": "https://na.gov.pk/en/print_list.php?type=governers",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "governor-general",
      "ghulam-muhammad",
      "sequence"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q006-SRC",
    "pairId": "P239-Q006",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Whom did Quaid-e-Azam appoint as the first Governor of the State Bank of Pakistan?",
    "options": [
      "Mian Iftikharuddin",
      "Zahid Hussain",
      "Abdul Qadir",
      "Muhammad Shoaib"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اسٹیٹ بینک کے سرکاری ریکارڈ کے مطابق زاہد حسین پاکستان کے مرکزی بینک کے پہلے گورنر تھے۔ اسٹیٹ بینک یکم جولائی 1948ء کو قائداعظم نے باقاعدہ کھولا، جبکہ زاہد حسین نے 10 جون 1948ء سے عہدہ سنبھالا تھا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q6, PDF p.24",
      "referenceUrl": "https://www.sbp.org.pk/museum/mr-zahid-hussain",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "state-bank",
      "zahid-hussain",
      "first-governor"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan incorrectly says 'Governor General of State Bank'. The website repairs the office title to 'Governor of the State Bank of Pakistan'."
  },
  {
    "id": "P239-Q006-SIM",
    "pairId": "P239-Q006",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date was the State Bank of Pakistan formally inaugurated by Quaid-e-Azam?",
    "options": [
      "14 August 1947",
      "10 June 1948",
      "23 March 1956",
      "1 July 1948"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اسٹیٹ بینک کے سرکاری تاریخی بیان کے مطابق قائداعظم محمد علی جناح نے مرکزی بینک کا یکم جولائی 1948ء کو باقاعدہ افتتاح کیا۔ 10 جون 1948ء زاہد حسین کی گورنری کے آغاز کی تاریخ تھی، افتتاح کی نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q6",
      "referenceUrl": "https://www.sbp.org.pk/about/speech/Governors/Mr.Yaseen.Anwar/2011/23-12-2011.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "state-bank",
      "inauguration",
      "1-july-1948"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q007-SRC",
    "pairId": "P239-Q007",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who was President of the United States when Pakistan gained independence in August 1947?",
    "options": [
      "Franklin D. Roosevelt",
      "Harry S. Truman",
      "Dwight D. Eisenhower",
      "John F. Kennedy"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اگست 1947ء میں امریکہ کے صدر ہیری ایس ٹرومین تھے؛ ان کی صدارت 1945ء سے 1953ء تک رہی۔ اسی لیے پاکستان کے قیام کے وقت درست جواب Harry S. Truman ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q7, PDF p.24",
      "referenceUrl": "https://history.state.gov/milestones/1945-1952/truman-doctrine",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "harry-truman",
      "1947",
      "united-states-president"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's 'John F. Kenney' is corrected to 'John F. Kennedy'."
  },
  {
    "id": "P239-Q007-SIM",
    "pairId": "P239-Q007",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which year did President Harry S. Truman announce the policy known as the Truman Doctrine?",
    "options": [
      "1945",
      "1953",
      "1949",
      "1947"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "امریکی محکمہ خارجہ کے تاریخی دفتر کے مطابق ٹرومین نے 12 مارچ 1947ء کو کانگریس سے خطاب میں یہ پالیسی پیش کی۔ اسی نسبت سے اسے Truman Doctrine کہا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q7",
      "referenceUrl": "https://history.state.gov/milestones/1945-1952/truman-doctrine",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "truman-doctrine",
      "1947",
      "us-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q008-SRC",
    "pairId": "P239-Q008",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who wrote the book 'Friends Not Masters: A Political Autobiography'?",
    "options": [
      "Zulfiqar Ali Bhutto",
      "Liaquat Ali Khan",
      "Mohammad Ayub Khan",
      "Iskander Mirza"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ورلڈ کیٹ کے کتابی ریکارڈ کے مطابق Friends Not Masters کے مصنف محمد ایوب خان ہیں۔ یہ سیاسی خودنوشت 1967ء میں Oxford University Press نے شائع کی تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q8, PDF p.24",
      "referenceUrl": "https://search.worldcat.org/title/Friends-not-masters%3A-a-political-autobiography/oclc/5728846",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "friends-not-masters",
      "ayub-khan",
      "books"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q008-SIM",
    "pairId": "P239-Q008",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "In which year was 'Friends Not Masters' first published by Oxford University Press?",
    "options": [
      "1967",
      "1962",
      "1958",
      "1971"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ورلڈ کیٹ کے مطابق کتاب کا اشاعتی سال 1967ء ہے اور ناشر Oxford University Press تھا۔ عنوان کے ساتھ A Political Autobiography بھی درج ہے، جس سے اس کی نوعیت واضح ہوتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q8",
      "referenceUrl": "https://search.worldcat.org/title/Friends-not-masters%3A-a-political-autobiography/oclc/5728846",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "friends-not-masters",
      "1967",
      "bibliography"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q009-SRC",
    "pairId": "P239-Q009",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which agreement was signed by Pakistan and India after the 1971 war?",
    "options": [
      "Tashkent Agreement",
      "Lahore Declaration",
      "Simla Agreement",
      "Agra Declaration"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پاکستان اور بھارت نے 1971ء کی جنگ کے بعد 2 جولائی 1972ء کو شملہ معاہدہ کیا۔ اس پر پاکستان کی طرف سے ذوالفقار علی بھٹو اور بھارت کی طرف سے اندرا گاندھی نے دستخط کیے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q9, PDF p.24",
      "referenceUrl": "https://www.mea.gov.in/bilateral-documents.htm?dtl%2F5541%2FSimla+Agreement-work=Bilateral%2FMultilateral",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "simla-agreement",
      "pakistan-india",
      "1972"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q009-SIM",
    "pairId": "P239-Q009",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "On which date was the Simla Agreement signed?",
    "options": [
      "10 January 1966",
      "21 February 1999",
      "2 July 1972",
      "16 July 2001"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "شملہ معاہدے کے سرکاری متن پر 2 جولائی 1972ء کی تاریخ درج ہے۔ 10 جنوری 1966ء تاشقند اعلامیے جبکہ فروری 1999ء لاہور اعلامیے سے متعلق ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q9",
      "referenceUrl": "https://www.mea.gov.in/bilateral-documents.htm?dtl%2F5541%2FSimla+Agreement-work=Bilateral%2FMultilateral",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "simla-agreement",
      "2-july-1972",
      "dates"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q010-SRC",
    "pairId": "P239-Q010",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Which Constitution of Pakistan established a presidential system of government?",
    "options": [
      "1956 Constitution",
      "1973 Constitution",
      "1962 Constitution",
      "1985 Constitution"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "قومی اسمبلی کی آئینی تاریخ کے مطابق 1962ء کے آئین نے وفاقی ریاست کے ساتھ صدارتی طرزِ حکومت قائم کیا۔ انتظامی اختیار صدر کے منصب میں مرتکز تھا اور کابینہ کے ارکان براہِ راست صدر کو جواب دہ تھے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q10, PDF p.24",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "1962-constitution",
      "presidential-system",
      "pakistan-constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q010-SIM",
    "pairId": "P239-Q010",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Under which Constitution did Pakistan adopt the present federal parliamentary and bicameral system?",
    "options": [
      "1973 Constitution",
      "1962 Constitution",
      "1956 Constitution",
      "Interim Constitution of 1972"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "قومی اسمبلی کے مطابق 1973ء کے آئین نے مرکز میں دو ایوانی پارلیمان قائم کی، جس میں قومی اسمبلی اور سینیٹ شامل ہیں۔ اسی آئین کے تحت پاکستان کا وفاقی پارلیمانی نظام قائم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q10",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "1973-constitution",
      "parliamentary-system",
      "bicameral"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q011-SRC",
    "pairId": "P239-Q011",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "Who introduced the Basic Democracies system in Pakistan?",
    "options": [
      "Liaquat Ali Khan",
      "Yahya Khan",
      "Zia-ul-Haq",
      "Ayub Khan"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بنیادی جمہوریتوں کا نظام صدر ایوب خان نے 1959ء میں متعارف کرایا۔ اس نظام کے Basic Democrats بعد میں اسمبلیوں اور صدر کے انتخاب کے لیے انتخابی کالج کا کردار بھی ادا کرتے تھے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q11, PDF p.24",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "basic-democracies",
      "ayub-khan",
      "1959"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q011-SIM",
    "pairId": "P239-Q011",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "What electoral role did the Basic Democrats perform under the 1962 constitutional system?",
    "options": [
      "They appointed provincial governors",
      "They drafted the annual budget",
      "They directly selected judges",
      "They formed an electoral college"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "1962ء کے نظام میں Basic Democrats کو اسمبلیوں اور صدر کے انتخاب کے لیے electoral college قرار دیا گیا تھا۔ اس وجہ سے قومی سطح کے انتخابات براہِ راست عوامی ووٹ کے بجائے بالواسطہ ہوتے تھے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q11",
      "referenceUrl": "https://na.gov.pk/en/content.php?id=75",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "basic-democrats",
      "electoral-college",
      "indirect-election"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q012-SRC",
    "pairId": "P239-Q012",
    "kind": "source",
    "categoryId": "pakistan-studies",
    "question": "In the conventional Pakistan Studies classification used by the source, Pakistan's national culture is described primarily as:",
    "options": [
      "Western culture",
      "Indian culture",
      "Islamic culture",
      "Persian culture"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اس امتحانی درجہ بندی میں درست جواب Islamic culture ہے کیونکہ پاکستان کا آئینی و نظریاتی تشخص اسلام سے وابستہ ہے۔ تاہم پاکستان کی حقیقی ثقافت متنوع ہے اور اس میں پنجابی، سندھی، پشتون، بلوچ، کشمیری، سرائیکی اور دوسری علاقائی و لسانی روایات بھی شامل ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q12, PDF p.24",
      "referenceUrl": "https://na.gov.pk/uploads/documents/63ea176f52421_610.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "pakistan-culture",
      "islamic-identity",
      "constitutional-context"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed stem 'Pakistan's mostly culture is' is vague and ungrammatical. The website narrows it to the source's conventional exam classification and explicitly acknowledges Pakistan's cultural diversity."
  },
  {
    "id": "P239-Q012-SIM",
    "pairId": "P239-Q012",
    "kind": "similar",
    "categoryId": "pakistan-studies",
    "question": "Which religion is declared the State religion of Pakistan by Article 2 of the Constitution?",
    "options": [
      "Buddhism",
      "Islam",
      "Hinduism",
      "Christianity"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "آئینِ پاکستان کے آرٹیکل 2 کے مطابق اسلام پاکستان کا ریاستی مذہب ہے۔ ساتھ ہی آئین شہریوں اور مذہبی اقلیتوں کے مذہبی حقوق کے لیے بھی دفعات فراہم کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q12",
      "referenceUrl": "https://na.gov.pk/uploads/documents/63ea176f52421_610.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "article-2",
      "state-religion",
      "constitution"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q013-SRC",
    "pairId": "P239-Q013",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "As of 22 August 2026, who is the Director General of Pakistan's Federal Investigation Agency (FIA)?",
    "options": [
      "Sanaullah Abbasi",
      "Dr Usman Anwar",
      "Mohsin Hassan Butt",
      "Ahmad Ishfaq"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "22 اگست 2026ء کے دستیاب سرکاری FIA ریکارڈ کے مطابق ڈاکٹر عثمان انور، PSP، ڈائریکٹر جنرل FIA ہیں۔ سرکاری ویب سائٹ پر ان کا پیغام 4 فروری 2026ء کی تاریخ کے ساتھ اور ان کا عہدہ واضح طور پر درج ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q13, PDF p.24",
      "referenceUrl": "https://fia.gov.pk/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fia",
      "usman-anwar",
      "current-officeholder"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "Time-sensitive wording is date-qualified to 22 August 2026 and the options are standardized to current official spellings."
  },
  {
    "id": "P239-Q013-SIM",
    "pairId": "P239-Q013",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On what date did Dr Usman Anwar's current Director General message appear on the FIA website?",
    "options": [
      "3 January 2026",
      "16 July 2026",
      "22 April 2026",
      "4 February 2026"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "FIA کی سرکاری ویب سائٹ پر ڈاکٹر عثمان انور کا Director General's Message چار فروری 2026ء کی تاریخ کے ساتھ درج ہے۔ 22 اپریل 2026ء FIA ہیڈکوارٹر میں ان کی شرکت والی ایک الگ تقریب کی تاریخ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q13",
      "referenceUrl": "https://fia.gov.pk/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "fia",
      "director-general-message",
      "4-february-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q014-SRC",
    "pairId": "P239-Q014",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "As of 22 August 2026, who is the Chief Justice of the High Court of Balochistan?",
    "options": [
      "Jamal Khan Mandokhail",
      "Justice Muhammad Kamran Khan Malakhail",
      "Naeem Akhtar Afghan",
      "Hashim Khan Kakar"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ہائی کورٹ آف بلوچستان کی سرکاری فہرست کے مطابق جسٹس محمد کامران خان ملاخیل 8 دسمبر 2025ء سے چیف جسٹس ہیں۔ یہ جواب 22 اگست 2026ء کی تاریخ کے لحاظ سے درست ہے کیونکہ عدالتی عہدہ وقت کے ساتھ بدل سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q14, PDF p.24",
      "referenceUrl": "https://bhc.gov.pk/loralai-bench/judges/hon-judges",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "balochistan-high-court",
      "chief-justice",
      "kamran-malakhail"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's surname 'Mulakhail' is corrected to the court's official spelling 'Malakhail', and the stem is date-qualified."
  },
  {
    "id": "P239-Q014-SIM",
    "pairId": "P239-Q014",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On which date did Justice Muhammad Kamran Khan Malakhail take oath as Chief Justice of the High Court of Balochistan?",
    "options": [
      "17 November 2025",
      "8 December 2025",
      "19 January 2026",
      "5 June 2026"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "عدالت کے سرکاری تعارف کے مطابق جسٹس محمد کامران خان ملاخیل نے 8 دسمبر 2025ء کو چیف جسٹس کا حلف اٹھایا۔ 17 نومبر 2025ء ان کے Acting Chief Justice بننے کی تاریخ تھی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q14",
      "referenceUrl": "https://bhc.gov.pk/turbat-bench/judges/chief-justice",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chief-justice",
      "oath",
      "8-december-2025"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q015-SRC",
    "pairId": "P239-Q015",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "How many IMF lending arrangements had Pakistan entered since membership, as reported by the IMF on 22 August 2026?",
    "options": [
      "22",
      "23",
      "24",
      "25"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "IMF کے پاکستان کنٹری پیج پر 22 اگست 2026ء کو Number of Arrangements since membership واضح طور پر 25 درج ہے۔ اس لیے درست جواب 25 ہے؛ محض موجودہ پروگرام کو ترتیبی نمبر دینا غیر واضح اصطلاح ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q15, PDF p.24",
      "referenceUrl": "https://www.imf.org/en/countries/pak",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "imf",
      "pakistan",
      "25-arrangements"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed key selects 24th, but the official IMF country page reports 25 arrangements since Pakistan joined. The ambiguous word 'programme' is replaced with the IMF's measurable term and the verified answer is scored."
  },
  {
    "id": "P239-Q015-SIM",
    "pairId": "P239-Q015",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "On what date did Pakistan become a member of the International Monetary Fund?",
    "options": [
      "11 July 1950",
      "14 August 1947",
      "1 July 1955",
      "23 March 1956"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "IMF کے سرکاری کنٹری پیج کے مطابق پاکستان کی رکنیت کی تاریخ 11 جولائی 1950ء ہے۔ اسی تاریخ سے بعد ہونے والے lending arrangements کی تعداد IMF اپنے اعداد میں شمار کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q15",
      "referenceUrl": "https://www.imf.org/en/countries/pak",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "imf-membership",
      "pakistan",
      "11-july-1950"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q016-SRC",
    "pairId": "P239-Q016",
    "kind": "source",
    "categoryId": "current-affairs",
    "question": "Which President of Azad Jammu and Kashmir died on 31 January 2026?",
    "options": [
      "Sardar Masood Khan",
      "Barrister Sultan Mahmood Chaudhry",
      "Raja Farooq Haider Khan",
      "Sardar Muhammad Ibrahim Khan"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ریڈیو پاکستان کے مطابق آزاد جموں و کشمیر کے صدر بیرسٹر سلطان محمود چوہدری 31 جنوری 2026ء کو اسلام آباد میں طویل علالت کے بعد وفات پا گئے۔ وفات کے وقت ان کی عمر 71 سال تھی۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q16, PDF p.24",
      "referenceUrl": "https://www.radio.gov.pk/31-01-2026/ajk-president-sultan-mahmood-passes-away",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ajk-president",
      "sultan-mahmood-chaudhry",
      "31-january-2026"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source had near-duplicate options B and D for the same person. Option D is replaced with another former AJK president so the website item has four distinct choices."
  },
  {
    "id": "P239-Q016-SIM",
    "pairId": "P239-Q016",
    "kind": "similar",
    "categoryId": "current-affairs",
    "question": "How old was Barrister Sultan Mahmood Chaudhry when he died in January 2026?",
    "options": [
      "71",
      "66",
      "61",
      "76"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ریڈیو پاکستان کی خبر میں بیرسٹر سلطان محمود چوہدری کی عمر وفات کے وقت 71 سال بتائی گئی ہے۔ ان کا انتقال 31 جنوری 2026ء کو اسلام آباد میں ہوا تھا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q16",
      "referenceUrl": "https://www.radio.gov.pk/31-01-2026/ajk-president-sultan-mahmood-passes-away",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sultan-mahmood-chaudhry",
      "age",
      "ajk"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q017-SRC",
    "pairId": "P239-Q017",
    "kind": "source",
    "categoryId": "geography",
    "question": "What is the commonly cited average height range of the Balochistan Plateau?",
    "options": [
      "300–500 metres",
      "1,000–1,500 metres",
      "600–900 metres",
      "1,500–1,800 metres"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ہائر ایجوکیشن کمیشن کے پاکستان اسٹڈیز نصاب میں بلوچستان سطح مرتفع کی اوسط بلندی 600 سے 900 میٹر بیان کی گئی ہے۔ اس خطے میں پہاڑی سلسلے، خشک جھیلیں، بیسن اور صحرائی علاقے بھی شامل ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q17, PDF p.24",
      "referenceUrl": "https://www.hec.gov.pk/english/services/universities/RevisedCurricula/Documents/2011-2012/Education/PakStudies_Sept13.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "balochistan-plateau",
      "elevation",
      "pakistan-geography"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q017-SIM",
    "pairId": "P239-Q017",
    "kind": "similar",
    "categoryId": "geography",
    "question": "The Balochistan Plateau lies mainly west of which two mountain ranges?",
    "options": [
      "Himalaya and Karakoram",
      "Sulaiman and Kirthar",
      "Salt Range and Margalla",
      "Hindu Kush and Safed Koh"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "HEC کے تدریسی متن کے مطابق بلوچستان سطح مرتفع سلیمان اور کیرتھر پہاڑی سلسلوں کے مغرب میں واقع ہے۔ اس کی عمومی اوسط بلندی 600 سے 900 میٹر بیان کی جاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q17",
      "referenceUrl": "https://www.hec.gov.pk/english/services/universities/RevisedCurricula/Documents/2011-2012/Education/PakStudies_Sept13.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "balochistan-plateau",
      "sulaiman-range",
      "kirthar-range"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q018-SRC",
    "pairId": "P239-Q018",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which major mineral deposit is found at Chiniot in Punjab?",
    "options": [
      "Coal",
      "Gold",
      "Iron ore",
      "Copper"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "پنجاب منرل کمپنی کے مطابق چنیوٹ میں بڑا iron ore deposit موجود ہے جس کی exploration اور resource estimation پر کام ہوا ہے۔ منصوبے کا مقصد کان کنی، پراسیسنگ اور اسٹیل سازی کے مربوط نظام کو فروغ دینا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q18, PDF p.24",
      "referenceUrl": "https://pmc.punjab.gov.pk/chiniot_iron_ore_resource_porject",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chiniot",
      "iron-ore",
      "mineral-resources"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q018-SIM",
    "pairId": "P239-Q018",
    "kind": "similar",
    "categoryId": "geography",
    "question": "The Chiniot Iron Ore Resource Project is intended to support which downstream industry?",
    "options": [
      "Textile weaving",
      "Steel manufacturing",
      "Oil refining",
      "Cement packaging"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "چنیوٹ منصوبے میں iron ore mining اور processing کے ساتھ steel mills complex کا business case بھی شامل ہے۔ لہٰذا اس معدنی ذخیرے سے براہِ راست وابستہ downstream industry اسٹیل سازی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q18",
      "referenceUrl": "https://pmc.punjab.gov.pk/chiniot_iron_ore_resource_porject",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "chiniot-project",
      "steel-industry",
      "iron-ore"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q019-SRC",
    "pairId": "P239-Q019",
    "kind": "source",
    "categoryId": "geography",
    "question": "Trimmu Barrage is built on which river?",
    "options": [
      "Indus",
      "Jhelum",
      "Ravi",
      "Chenab"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "SMEC کے منصوبہ ریکارڈ کے مطابق تریموں بیراج ضلع جھنگ، پنجاب میں دریائے چناب پر واقع ایک اہم آبپاشی ڈھانچہ ہے۔ اس کا بنیادی کام پانی کے بہاؤ کو منظم کرنا اور آبپاشی کے لیے پانی موڑنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q19, PDF p.24",
      "referenceUrl": "https://www.smec.com/pg/project/trimmu-barrage-rehabilitation/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trimmu-barrage",
      "chenab-river",
      "irrigation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q019-SIM",
    "pairId": "P239-Q019",
    "kind": "similar",
    "categoryId": "geography",
    "question": "What is the main function of Trimmu Barrage?",
    "options": [
      "To regulate and divert water for irrigation",
      "To generate nuclear power",
      "To operate a seaport",
      "To store drinking water in an underground aquifer"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "تریموں بیراج کا بنیادی مقصد دریائے چناب کے بہاؤ کو کنٹرول کرنا اور نہروں کے لیے آبپاشی کا پانی موڑنا ہے۔ بحالی منصوبے نے سیلابی خطرہ کم کرنے اور وسیع زرعی رقبے کو قابلِ اعتماد پانی دینے میں بھی مدد دی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q19",
      "referenceUrl": "https://www.smec.com/pg/project/trimmu-barrage-rehabilitation/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "trimmu-barrage",
      "irrigation",
      "water-regulation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q020-SRC",
    "pairId": "P239-Q020",
    "kind": "source",
    "categoryId": "geography",
    "question": "Which of the following countries is landlocked and located in South Asia?",
    "options": [
      "Myanmar",
      "Laos",
      "Thailand",
      "Nepal"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "نیپال ایک خشکی سے گھرا جنوبی ایشیائی ملک ہے اور اسے سمندر تک براہِ راست رسائی حاصل نہیں۔ اصل سوال کا لفظ only غلط تھا کیونکہ افغانستان اور بھوٹان بھی جنوبی ایشیا کے landlocked ممالک میں شمار ہوتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q20, PDF p.24",
      "referenceUrl": "https://www.un.org/en/landlocked/about-landlocked-developing-countries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nepal",
      "landlocked",
      "south-asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source's claim that Nepal is the 'only' landlocked country in South Asia is false. The stem is repaired to 'which of the following', and 'Loas' is corrected to 'Laos'."
  },
  {
    "id": "P239-Q020-SIM",
    "pairId": "P239-Q020",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which other South Asian country in the following list is landlocked?",
    "options": [
      "Bangladesh",
      "Bhutan",
      "Maldives",
      "Sri Lanka"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اقوامِ متحدہ کی Landlocked Developing Countries فہرست میں بھوٹان بھی شامل ہے۔ بنگلہ دیش ساحلی ملک ہے جبکہ مالدیپ اور سری لنکا جزیرہ نما ریاستیں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q20",
      "referenceUrl": "https://www.un.org/en/landlocked/about-landlocked-developing-countries",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bhutan",
      "landlocked",
      "south-asia"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q021-SRC",
    "pairId": "P239-Q021",
    "kind": "source",
    "categoryId": "geography",
    "question": "The Makran Coast lies along which sea?",
    "options": [
      "Caspian Sea",
      "Red Sea",
      "Persian Gulf",
      "Arabian Sea"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "پاکستان کا مکران ساحل بحیرۂ عرب کے ساتھ واقع ہے۔ پاکستان محکمہ موسمیات کی سونامی دستاویز بھی Makran Coast کے سامنے Arabian Sea کی گہرائی اور 1945ء کے مکران سونامی کا ذکر کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q21, PDF p.24",
      "referenceUrl": "https://www.pmd.gov.pk/tusanami.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "makran-coast",
      "arabian-sea",
      "pakistan-coast"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q021-SIM",
    "pairId": "P239-Q021",
    "kind": "similar",
    "categoryId": "geography",
    "question": "Which sea forms Pakistan's southern maritime boundary?",
    "options": [
      "Black Sea",
      "Arabian Sea",
      "Mediterranean Sea",
      "Yellow Sea"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "پاکستان کا جنوبی ساحل بحیرۂ عرب پر واقع ہے اور سندھ و بلوچستان کے ساحلی علاقے اسی سمندر سے ملتے ہیں۔ مکران ساحل اس جنوبی ساحلی پٹی کے مغربی حصے میں آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q21",
      "referenceUrl": "https://online.aiou.edu.pk/LIVE_SITE/SoftBooks/6491.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "arabian-sea",
      "pakistan",
      "maritime-boundary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q022-SRC",
    "pairId": "P239-Q022",
    "kind": "source",
    "categoryId": "geography",
    "question": "What is the boundary line between Pakistan and Afghanistan commonly called?",
    "options": [
      "Durand Line",
      "Radcliffe Line",
      "McMahon Line",
      "Hindenburg Line"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "پاکستان اور افغانستان کے درمیان سرحد کو عمومی طور پر Durand Line کہا جاتا ہے۔ یہ نام 1893ء کے معاہدے سے آیا، تاہم افغانستان کی طرف سے اس کی قانونی حیثیت پر تاریخی اختلاف موجود رہا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q22, PDF p.24",
      "referenceUrl": "https://education.nationalgeographic.org/resource/durand-line/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "durand-line",
      "pakistan-afghanistan",
      "boundary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q022-SIM",
    "pairId": "P239-Q022",
    "kind": "similar",
    "categoryId": "geography",
    "question": "The Durand Line is named after which British diplomat?",
    "options": [
      "Cyril Radcliffe",
      "Mortimer Durand",
      "Henry McMahon",
      "Arthur Hindenburg"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Durand Line کا نام سر مورٹیمر ڈیورنڈ کے نام پر ہے، جنہوں نے 1893ء میں افغان امیر عبدالرحمن خان کے ساتھ اس حد کے متعلق مذاکرات کیے۔ اسے Radcliffe Line سے نہ ملائیں، جو 1947ء کی تقسیمِ ہند سے متعلق ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q22",
      "referenceUrl": "https://education.nationalgeographic.org/resource/durand-line/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mortimer-durand",
      "durand-line",
      "1893"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q023-SRC",
    "pairId": "P239-Q023",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which of the following is an established medical use of ultrasound?",
    "options": [
      "Long-distance radio communication",
      "AM radio transmission",
      "Prenatal scanning",
      "Optical-fibre data transfer"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "الٹراساؤنڈ حمل کے دوران رحم میں موجود بچے کی تصویر بنانے اور اس کی نشوونما کا جائزہ لینے کے لیے استعمال ہوتا ہے۔ NHS کے مطابق یہ طریقہ sound waves استعمال کرتا ہے، ionising radiation نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q23, PDF p.24",
      "referenceUrl": "https://www.nhs.uk/pregnancy/your-pregnancy-care/ultrasound-scans/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ultrasound",
      "prenatal-scanning",
      "medical-imaging"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan opens with the unsupported phrase 'used in liquid gold purification'. That distracting claim is removed so the question tests the independently verified medical use."
  },
  {
    "id": "P239-Q023-SIM",
    "pairId": "P239-Q023",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What type of waves does a prenatal ultrasound scan use to form an image?",
    "options": [
      "Gamma rays",
      "X-rays",
      "Sound waves",
      "Ultraviolet rays"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "حمل کا الٹراساؤنڈ بلند تعدد کی sound waves سے تصویر بناتا ہے۔ اس میں X-rays یا دوسری ionising radiation استعمال نہیں ہوتی، اسی لیے اسے معمول کی prenatal imaging میں استعمال کیا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q23",
      "referenceUrl": "https://www.nhs.uk/pregnancy/your-pregnancy-care/ultrasound-scans/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ultrasound",
      "sound-waves",
      "pregnancy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q024-SRC",
    "pairId": "P239-Q024",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Approximately how old is Earth?",
    "options": [
      "1.5 billion years",
      "3.5 billion years",
      "4.5 billion years",
      "10 billion years"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "US Geological Survey کے مطابق زمین کی بہترین سائنسی عمر تقریباً 4.54 ارب سال ہے، اس لیے قریب ترین جواب 4.5 billion years ہے۔ یہ عمر قدیم چٹانوں، معدنی ذرات اور meteorites کی radiometric dating سے اخذ کی گئی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q24, PDF p.24",
      "referenceUrl": "https://pubs.usgs.gov/gip/geotime/age.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "earth-age",
      "4.54-billion-years",
      "geology"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed phrase 'Earth life' is ambiguous and conflicts with the 4.5-billion-year key, which is Earth's age rather than the age of life. The website repairs the stem accordingly."
  },
  {
    "id": "P239-Q024-SIM",
    "pairId": "P239-Q024",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which scientific method is central to estimating Earth's age?",
    "options": [
      "Weather forecasting",
      "Radiometric dating",
      "Ocean-tide counting",
      "Tree-ring counting alone"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "زمین کی عمر معلوم کرنے میں radioactive isotopes کے تناسب پر مبنی radiometric dating بنیادی طریقہ ہے۔ USGS کی وضاحت میں lead اور uranium isotope systems، meteorites اور قدیم zircon grains جیسے شواہد استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q24",
      "referenceUrl": "https://pubs.usgs.gov/gip/geotime/age.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "radiometric-dating",
      "earth-age",
      "isotopes"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q025-SRC",
    "pairId": "P239-Q025",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which is the fastest land animal?",
    "options": [
      "Lion",
      "Cheetah",
      "Horse",
      "Ostrich"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Smithsonian National Zoo کے مطابق cheetah دنیا کا تیز ترین خشکی پر رہنے والا ممالیہ ہے۔ یہ مختصر دوڑ میں تقریباً 96 سے 112 کلومیٹر فی گھنٹہ کی رفتار حاصل کر سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q25, PDF p.24",
      "referenceUrl": "https://nationalzoo.si.edu/animals/cheetah",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cheetah",
      "fastest-land-animal",
      "zoology"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q025-SIM",
    "pairId": "P239-Q025",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "What is the approximate top-speed range reported for a cheetah?",
    "options": [
      "20–30 km/h",
      "45–55 km/h",
      "96–112 km/h",
      "60–70 km/h"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Smithsonian کے مطابق چیتا تقریباً 60 سے 70 miles per hour، یعنی 96 سے 112 km/h تک پہنچ سکتا ہے۔ وہ یہ انتہائی رفتار صرف مختصر فاصلے تک برقرار رکھتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q25",
      "referenceUrl": "https://nationalzoo.si.edu/animals/cheetah",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cheetah-speed",
      "96-112-kmh",
      "animals"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q026-SRC",
    "pairId": "P239-Q026",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "An object weighs 200 N at Earth's surface. What would its weight be at the exact centre of an ideal, spherically symmetric Earth?",
    "options": [
      "66 N",
      "200 N",
      "100 N",
      "0 N"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "زمین کے عین مرکز پر ہر سمت سے آنے والی gravitational pulls ایک دوسرے کو منسوخ کر دیتی ہیں، اس لیے net gravitational force اور وزن صفر ہوگا۔ یہ مثالی نتیجہ زمین کو کروی متناسب جسم فرض کرنے پر مبنی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q26, PDF p.25",
      "referenceUrl": "https://www.pbs.org/wgbh/nova/education/physics/gravity-earths-center.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gravity",
      "earth-centre",
      "zero-weight"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q026-SIM",
    "pairId": "P239-Q026",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Why is the net gravitational force zero at the exact centre of an ideal spherical Earth?",
    "options": [
      "Earth has no mass",
      "Equal pulls act in all directions and cancel",
      "The object loses its mass",
      "Air pressure blocks gravity"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مرکز پر زمین کا مادہ جسم کو تمام سمتوں میں کھینچتا ہے۔ کروی symmetry کی وجہ سے مخالف سمتوں کی قوتیں برابر ہو کر منسوخ ہو جاتی ہیں، لہٰذا net force صفر رہتا ہے؛ جسم کی mass ختم نہیں ہوتی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q26",
      "referenceUrl": "https://www.pbs.org/wgbh/nova/education/physics/gravity-earths-center.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "gravity",
      "symmetry",
      "net-force"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q027-SRC",
    "pairId": "P239-Q027",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Who developed the first cholera vaccine used in humans?",
    "options": [
      "Louis Pasteur",
      "Jaime Ferrán",
      "Edward Jenner",
      "Robert Koch"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "طبی تاریخ کے تحقیقی جائزے کے مطابق Jaime Ferrán نے 1885ء میں پہلا cholera vaccine تیار کیا اور اسے اسپین میں بڑے پیمانے کی ویکسینیشن میں استعمال کیا۔ Pasteur کی fowl cholera vaccine مرغیوں کے لیے تھی، انسانی cholera کے لیے نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q27, PDF p.25",
      "referenceUrl": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4144262/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cholera-vaccine",
      "jaime-ferran",
      "medical-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q027-SIM",
    "pairId": "P239-Q027",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "In which year was Jaime Ferrán's early cholera vaccine used in mass vaccination campaigns in Spain?",
    "options": [
      "1885",
      "1796",
      "1896",
      "1921"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "تحقیقی طبی جائزے کے مطابق Ferrán کی cholera vaccine 1885ء میں اسپین کی mass vaccination campaigns میں استعمال ہوئی۔ 1796ء ایڈورڈ جینر کی smallpox vaccination کے تاریخی تجربے سے منسوب سال ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q27",
      "referenceUrl": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4144262/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "jaime-ferran",
      "1885",
      "vaccination-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q028-SRC",
    "pairId": "P239-Q028",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "Which printed range most reasonably covers the roughly 40–42% efficiency often cited for a diesel engine?",
    "options": [
      "20–25%",
      "25–30%",
      "25–45%",
      "50–60%"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "دیے گئے ranges میں 25–45% وہ واحد انتخاب ہے جس میں تقریباً 40–42% شامل ہے۔ عملی diesel efficiency انجن کے سائز، design اور load سے بدلتی ہے؛ امریکی DOE کے مواد میں جدید diesel engines کے لیے تقریباً 40–50% تک مفید کام میں تبدیلی بھی بیان ہوئی ہے، اس لیے اسے مستقل حد نہ سمجھیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q28, PDF p.25",
      "referenceUrl": "https://www.energy.gov/sites/prod/files/2014/03/f8/deer11_edwards.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "diesel-engine",
      "thermal-efficiency",
      "engine-design"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan asks for a universal 'working efficiency', but no single range applies to every diesel engine. The stem is narrowed to the printed ranges and the explanation supplies the engineering caveat."
  },
  {
    "id": "P239-Q028-SIM",
    "pairId": "P239-Q028",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "According to a U.S. Department of Energy technical primer, about what share of fuel energy can current diesel engines convert into useful work?",
    "options": [
      "10–20%",
      "40–50%",
      "20–30%",
      "70–80%"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "DOE technical primer کے مطابق موجودہ diesel engines تقریباً 40 سے 50 فیصد fuel energy کو useful work میں بدل سکتے ہیں۔ حقیقی قدر انجن کے استعمال، operating point اور design کے مطابق مختلف ہو سکتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q28",
      "referenceUrl": "https://www1.eere.energy.gov/vehiclesandfuels/pdfs/diesel_technical_primer.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "diesel-efficiency",
      "energy-conversion",
      "doe"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q029-SRC",
    "pairId": "P239-Q029",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "One mechanical horsepower is approximately equal to how many watts?",
    "options": [
      "646 W",
      "846 W",
      "746 W",
      "946 W"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "ایک mechanical horsepower تقریباً 745.7 watts کے برابر ہوتا ہے، جسے عام MCQ میں 746 W تک round کیا جاتا ہے۔ horsepower اور metric horsepower کی قدریں قدرے مختلف ہو سکتی ہیں، اس لیے unit context اہم ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q29, PDF p.25",
      "referenceUrl": "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication304a.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "horsepower",
      "watts",
      "unit-conversion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q029-SIM",
    "pairId": "P239-Q029",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Approximately how much power is two mechanical horsepower?",
    "options": [
      "746 W",
      "1,000 W",
      "2,000 W",
      "1,491 W"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "دو mechanical horsepower کے لیے 2 × 745.7 = 1491.4 watts بنتے ہیں۔ قریب ترین مکمل عدد 1,491 W ہے؛ یہ سادہ unit conversion ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q29",
      "referenceUrl": "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication304a.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "horsepower",
      "1491-watts",
      "calculation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q030-SRC",
    "pairId": "P239-Q030",
    "kind": "source",
    "categoryId": "everyday-science",
    "question": "HLA class I molecules are expressed on which cells?",
    "options": [
      "Virtually all nucleated cells",
      "Only B and T lymphocytes",
      "Mature red blood cells only",
      "Platelets only"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "انسانوں میں HLA دراصل MHC نظام کا نام ہے اور class I molecules تقریباً تمام nucleated cells پر پائے جاتے ہیں۔ بالغ red blood cells میں nucleus نہیں ہوتا، اس لیے وہ اہم استثنا ہیں؛ HLA-I کا کام اندرونی peptides کو CD8 T cells کے سامنے پیش کرنا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q30, PDF p.25",
      "referenceUrl": "https://www.ncbi.nlm.nih.gov/books/NBK26926/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hla-class-i",
      "mhc",
      "nucleated-cells"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan appends the incomplete phrase 'HLA stands for' even though its options answer a cell-expression question. The website reconstructs the intended stem and standardizes plurals."
  },
  {
    "id": "P239-Q030-SIM",
    "pairId": "P239-Q030",
    "kind": "similar",
    "categoryId": "everyday-science",
    "question": "Which mature human blood cell normally lacks MHC class I because it has no nucleus?",
    "options": [
      "Neutrophil",
      "B lymphocyte",
      "Monocyte",
      "Red blood cell"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "بالغ سرخ خون کے خلیے nucleus سے محروم ہوتے ہیں اور ان پر MHC class I کی معمول کی expression نہیں ہوتی۔ اس کے برعکس neutrophils، B lymphocytes اور monocytes nucleated cells ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q30",
      "referenceUrl": "https://openstax.org/books/microbiology/pages/18-2-major-histocompatibility-complexes-and-antigen-presenting-cells",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "red-blood-cells",
      "mhc-i",
      "nucleus"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q031-SRC",
    "pairId": "P239-Q031",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Who is commonly credited as the first computer programmer?",
    "options": [
      "Charles Babbage",
      "Alan Turing",
      "Ada Lovelace",
      "Grace Hopper"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Ada Lovelace کو عام طور پر پہلی computer programmer کا اعزاز دیا جاتا ہے کیونکہ ان کے 1843ء کے notes میں Babbage کی Analytical Engine کے لیے مفصل algorithm شامل تھا۔ تاریخی نسبت پر علمی بحث موجود ہے، مگر بنیادی کمپیوٹر MCQs میں accepted answer Ada Lovelace ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q31, PDF p.25",
      "referenceUrl": "https://collection.sciencemuseumgroup.org.uk/people/cp38764/ada-lovelace",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ada-lovelace",
      "first-programmer",
      "computing-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The wording adds 'commonly credited' because historians debate the exact definition of the first program, while Ada Lovelace remains the standard exam answer."
  },
  {
    "id": "P239-Q031-SIM",
    "pairId": "P239-Q031",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Ada Lovelace's famous 1843 notes concerned which proposed machine?",
    "options": [
      "ENIAC",
      "Analytical Engine",
      "UNIVAC I",
      "Altair 8800"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Ada Lovelace نے Luigi Menabrea کے مقالے کا ترجمہ کرتے ہوئے Charles Babbage کی Analytical Engine پر وسیع notes لکھے۔ انہی notes میں عمومی programming کی صلاحیت اور Bernoulli numbers کے algorithm کی تفصیل مشہور ہوئی۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q31",
      "referenceUrl": "https://collection.sciencemuseumgroup.org.uk/people/cp38764/ada-lovelace",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analytical-engine",
      "ada-lovelace",
      "1843"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q032-SRC",
    "pairId": "P239-Q032",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which networking device connects multiple computers and other devices within the same local network?",
    "options": [
      "Printer",
      "Plotter",
      "Switch",
      "Scanner"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Network switch کمپیوٹرز، سرورز اور دوسرے devices کو ایک ہی network میں جوڑتا ہے۔ یہ موصولہ data packets کو مناسب destination port کی طرف بھیجتا ہے، اس لیے printer، plotter یا scanner اس کام کا متبادل نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q32, PDF p.25",
      "referenceUrl": "https://www.cisco.com/site/us/en/learn/topics/networking/what-is-network-switching.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "network-switch",
      "lan",
      "network-devices"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q032-SIM",
    "pairId": "P239-Q032",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which address does an Ethernet switch primarily use to forward a frame to the correct port within a LAN?",
    "options": [
      "Web-page title",
      "Postal address",
      "Email address",
      "MAC address"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Ethernet switch اپنی MAC address table دیکھ کر frame کو درست destination port کی طرف بھیجتا ہے۔ IP addresses بنیادی طور پر routers کے network-to-network routing کام میں استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q32",
      "referenceUrl": "https://www.cisco.com/site/us/en/learn/topics/networking/what-is-an-ethernet-switch.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "mac-address",
      "ethernet-switch",
      "frames"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q033-SRC",
    "pairId": "P239-Q033",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which listed platform is primarily associated with online video sharing and live streaming?",
    "options": [
      "Microsoft PowerPoint",
      "YouTube",
      "Microsoft Excel",
      "Adobe Reader"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "دیے گئے انتخاب میں YouTube وہ platform ہے جو online videos اور live streams کے لیے مخصوص ہے۔ PowerPoint presentations، Excel spreadsheets اور Adobe Reader PDF documents کے لیے استعمال ہوتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q33, PDF p.25",
      "referenceUrl": "https://support.google.com/youtube/answer/2474026?hl=en",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "youtube",
      "video-streaming",
      "platforms"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The subjective phrase 'most common' is replaced with the precise, option-bounded wording 'primarily associated'."
  },
  {
    "id": "P239-Q033-SIM",
    "pairId": "P239-Q033",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What does live streaming on YouTube allow a creator to do?",
    "options": [
      "Edit spreadsheet formulas offline",
      "Broadcast a video feed and interact in real time",
      "Compile an operating system kernel",
      "Print a document without a printer"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "YouTube Help کے مطابق live streaming ویڈیو feed کے ساتھ audience سے real time میں chat اور دوسرے interactions کی سہولت دیتی ہے۔ یہ recorded video upload سے مختلف ہے کیونکہ broadcast وقوع کے وقت دیکھی جا سکتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q33",
      "referenceUrl": "https://support.google.com/youtube/answer/2474026?hl=en",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "youtube-live",
      "real-time",
      "streaming"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q034-SRC",
    "pairId": "P239-Q034",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is an example of non-volatile storage?",
    "options": [
      "RAM",
      "CPU cache",
      "SSD",
      "CPU registers"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "SSD non-volatile solid-state memory، عموماً NAND flash، میں data محفوظ کرتا ہے اور power بند ہونے پر بھی اسے برقرار رکھتا ہے۔ RAM، cache اور registers عمومی طور پر volatile ہوتے ہیں اور بجلی ختم ہونے پر ان کا عارضی data برقرار نہیں رہتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q34, PDF p.25",
      "referenceUrl": "https://www.ibm.com/think/topics/flash-vs-ssd-storage",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ssd",
      "non-volatile",
      "storage"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q034-SIM",
    "pairId": "P239-Q034",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which memory technology is most commonly used for data storage inside an SSD?",
    "options": [
      "NAND flash",
      "Magnetic tape",
      "Paper tape",
      "Vacuum tubes"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جدید SSDs عموماً NAND flash memory استعمال کرتے ہیں۔ NAND flash non-volatile ہے، یعنی power نہ ہونے پر بھی data محفوظ رکھتی ہے، اور اس میں moving mechanical parts نہیں ہوتے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q34",
      "referenceUrl": "https://www.ibm.com/think/topics/nand-flash",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "nand-flash",
      "ssd",
      "memory-technology"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q035-SRC",
    "pairId": "P239-Q035",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which non-volatile memory type is often used to store firmware?",
    "options": [
      "Flash memory",
      "DRAM",
      "CPU cache",
      "SRAM"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Firmware کو power بند ہونے کے بعد بھی محفوظ رہنا ہوتا ہے، اس لیے اسے عموماً non-volatile flash memory یا ROM میں رکھا جاتا ہے۔ Flash memory دوبارہ لکھی جا سکتی ہے، اسی وجہ سے firmware updates ممکن ہوتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q35, PDF p.25",
      "referenceUrl": "https://www.ibm.com/think/topics/firmware",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "flash-memory",
      "firmware",
      "non-volatile"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q035-SIM",
    "pairId": "P239-Q035",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Why is non-volatile memory suitable for storing firmware?",
    "options": [
      "It retains information when power is off",
      "It can only store decimal numbers",
      "It always requires moving parts",
      "It loses data immediately after shutdown"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Non-volatile memory کی بنیادی خصوصیت یہ ہے کہ بجلی بند ہونے پر بھی معلومات برقرار رہتی ہیں۔ Firmware کو startup اور hardware control کے لیے ہر مرتبہ دستیاب ہونا چاہیے، اسی لیے flash یا ROM موزوں ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q35",
      "referenceUrl": "https://www.ibm.com/think/topics/firmware",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "firmware",
      "data-retention",
      "non-volatile-memory"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q036-SRC",
    "pairId": "P239-Q036",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "A storage drive that uses solid-state memory and has no moving parts is called what?",
    "options": [
      "HDD",
      "Optical disc",
      "DVD",
      "SSD"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "SSD کا مطلب solid-state drive ہے اور اس میں data محفوظ کرنے کے لیے electronic solid-state memory استعمال ہوتی ہے۔ HDD کے برعکس SSD میں spinning platters یا mechanical read/write head نہیں ہوتے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q36, PDF p.25",
      "referenceUrl": "https://www.ibm.com/think/topics/solid-state-drives",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "ssd",
      "no-moving-parts",
      "storage-drive"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's vague phrase 'solid memory' is repaired to the standard term 'storage drive that uses solid-state memory'."
  },
  {
    "id": "P239-Q036-SIM",
    "pairId": "P239-Q036",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which component is characteristic of a traditional hard disk drive but absent from an SSD?",
    "options": [
      "File system",
      "NAND flash cell",
      "USB connector",
      "Spinning magnetic platter"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "روایتی HDD میں magnetic platter گھومتا ہے اور mechanical head data پڑھتا یا لکھتا ہے۔ SSD electronic flash memory استعمال کرتا ہے، اس لیے اس میں spinning platter نہیں ہوتا۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q36",
      "referenceUrl": "https://www.ibm.com/think/topics/hard-disk-drive-vs-solid-state-drive",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "hdd",
      "spinning-platter",
      "ssd-comparison"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q037-SRC",
    "pairId": "P239-Q037",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Who invented the World Wide Web?",
    "options": [
      "Tim Berners-Lee",
      "Steve Jobs",
      "Bill Gates",
      "Mark Zuckerberg"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "CERN میں کام کرتے ہوئے Tim Berners-Lee نے 1989ء میں World Wide Web کی تجویز پیش کی۔ انہوں نے بنیادی web technologies اور پہلا web server و browser تیار کرنے میں مرکزی کردار ادا کیا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q37, PDF p.25",
      "referenceUrl": "https://home.cern/science/computing/birth-web",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "world-wide-web",
      "tim-berners-lee",
      "cern"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q037-SIM",
    "pairId": "P239-Q037",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "At which research organization was the World Wide Web invented?",
    "options": [
      "WHO",
      "NASA",
      "UNESCO",
      "CERN"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "World Wide Web کی ایجاد CERN میں ہوئی، جہاں Tim Berners-Lee نے 1989ء میں معلوماتی نظام کی تجویز دی۔ CERN یورپی particle physics research organization ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q37",
      "referenceUrl": "https://home.cern/science/computing/birth-web",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cern",
      "world-wide-web",
      "computing-history"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q038-SRC",
    "pairId": "P239-Q038",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What does HTTPS stand for?",
    "options": [
      "HyperText Transfer Protocol Secure",
      "HyperText Transfer Protocol Service",
      "High Transfer Text Protocol",
      "Hyper Terminal Transfer Protocol"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "HTTPS کا مکمل نام HyperText Transfer Protocol Secure ہے۔ یہ HTTP کا encrypted version ہے اور client و server کے درمیان communication کو TLS کے ذریعے محفوظ کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q38, PDF p.25",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Glossary/HTTPS",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "https",
      "http",
      "web-security"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q038-SIM",
    "pairId": "P239-Q038",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which protocol is used by HTTPS to encrypt communication between a client and a server?",
    "options": [
      "FTP",
      "DHCP",
      "SMTP",
      "TLS"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "HTTPS communication کو encrypt کرنے کے لیے TLS استعمال کرتا ہے۔ FTP فائل منتقلی، SMTP email بھیجنے اور DHCP network configuration دینے کے لیے الگ protocols ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q38",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Glossary/HTTPS",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "tls",
      "https",
      "encryption"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q039-SRC",
    "pairId": "P239-Q039",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What is non-human traffic to a website commonly called?",
    "options": [
      "Human traffic",
      "Organic traffic",
      "Bot traffic",
      "Referral traffic"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Website یا app پر automated software سے آنے والی non-human activity کو bot traffic کہتے ہیں۔ ہر bot نقصان دہ نہیں ہوتا؛ search-engine crawlers مفید ہو سکتے ہیں، جبکہ malicious bots scraping، credential stuffing یا click fraud کر سکتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q39, PDF p.25",
      "referenceUrl": "https://www.cloudflare.com/en-gb/learning/bots/what-is-bot-traffic/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bot-traffic",
      "non-human-traffic",
      "web-analytics"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan calls all fake traffic bot traffic. The website uses the accurate definition: bot traffic is non-human, but it is not necessarily fake or malicious."
  },
  {
    "id": "P239-Q039-SIM",
    "pairId": "P239-Q039",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which of the following is an example of potentially beneficial bot traffic?",
    "options": [
      "A spam bot submitting fake forms",
      "A credential-stuffing attack",
      "Automated click fraud",
      "A search-engine crawler indexing pages"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Search engines کے crawlers صفحات کو index کرنے کے لیے websites پر آتے ہیں اور عموماً مفید bots سمجھے جاتے ہیں۔ Credential stuffing، click fraud اور fake-form submissions malicious یا abusive bot activity کی مثالیں ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q39",
      "referenceUrl": "https://www.cloudflare.com/en-gb/learning/bots/what-is-bot-traffic/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "search-engine-crawler",
      "good-bots",
      "bot-traffic"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q040-SRC",
    "pairId": "P239-Q040",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What are web cookies?",
    "options": [
      "Malware programs",
      "Small pieces of data stored by a browser for a website",
      "Physical hardware components",
      "Computer viruses"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Web cookie ایک چھوٹا data record ہے جسے website browser میں محفوظ کرواتی ہے اور بعد کی requests کے ساتھ واپس بھیجا جا سکتا ہے۔ Cookies sessions، preferences اور دوسری state برقرار رکھنے میں مدد دیتی ہیں، لیکن privacy اور security settings اہم ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q40, PDF p.25",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "cookies",
      "browser",
      "web-data"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q040-SIM",
    "pairId": "P239-Q040",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What does the Secure attribute on a web cookie require?",
    "options": [
      "The cookie must be stored on a USB drive",
      "The cookie can never expire",
      "The cookie is sent only over HTTPS requests",
      "The cookie is visible to every website"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Cookie کا Secure attribute browser کو ہدایت دیتا ہے کہ اسے صرف HTTPS scheme والی requests کے ساتھ بھیجا جائے۔ یہ transport protection بہتر کرتا ہے، مگر حساس cookie کے لیے HttpOnly اور مناسب SameSite controls بھی اہم ہو سکتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q40",
      "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "secure-cookie",
      "https",
      "cookie-attributes"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q041-SRC",
    "pairId": "P239-Q041",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Bluetooth technology is commonly associated with which type of network?",
    "options": [
      "Wide Area Network",
      "Local Area Network",
      "Personal Area Network",
      "Metropolitan Area Network"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Bluetooth مختصر فاصلے پر ذاتی devices کو جوڑنے کے لیے استعمال ہوتا ہے اور اسے Personal Area Network سے منسلک کیا جاتا ہے۔ Bluetooth SIG کا PAN profile دو یا زیادہ Bluetooth-enabled devices کو ad-hoc network بنانے کی وضاحت کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q41, PDF p.25",
      "referenceUrl": "https://www.bluetooth.com/specifications/specs/personal-area-networking-profile-1-0/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bluetooth",
      "pan",
      "personal-area-network"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q041-SIM",
    "pairId": "P239-Q041",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "According to the Bluetooth PAN profile, how many Bluetooth-enabled devices are needed to form an ad-hoc network?",
    "options": [
      "Two or more",
      "Exactly one",
      "At least one hundred",
      "Only wired devices can form it"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Bluetooth Personal Area Networking profile کے مطابق دو یا زیادہ Bluetooth-enabled devices مل کر ad-hoc network بنا سکتے ہیں۔ اس profile میں Network Access Point اور Personal Area Network User جیسے roles بھی بیان کیے گئے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q41",
      "referenceUrl": "https://www.bluetooth.com/specifications/specs/personal-area-networking-profile-1-0/",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bluetooth-pan",
      "ad-hoc-network",
      "devices"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q042-SRC",
    "pairId": "P239-Q042",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "What does B2C stand for in e-commerce?",
    "options": [
      "Business to Business",
      "Business to Consumer",
      "Consumer to Business",
      "Business to Government"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "B2C کا مطلب Business to Consumer ہے، یعنی کاروبار کا اشیا یا خدمات براہِ راست صارف کو فروخت کرنا۔ امریکی Census/Commercial Service material اسے personal consumption کے لیے online retail shopping کے طور پر بیان کرتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q42, PDF p.25",
      "referenceUrl": "https://www.census.gov/foreign-trade/aes/tradesource_jul2021.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "b2c",
      "e-commerce",
      "business-to-consumer"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q042-SIM",
    "pairId": "P239-Q042",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What does B2B stand for in e-commerce?",
    "options": [
      "Buyer to Bank",
      "Browser to Browser",
      "Business to Business",
      "Business to Bureau"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "B2B کا مطلب Business to Business ہے، یعنی ایک کاروبار کا دوسرے کاروبار کو goods، services یا business inputs فروخت کرنا۔ یہ B2C سے مختلف ہے، جہاں آخری صارف خریدار ہوتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q42",
      "referenceUrl": "https://www.census.gov/foreign-trade/aes/tradesource_jul2021.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "b2b",
      "e-commerce",
      "business-to-business"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q043-SRC",
    "pairId": "P239-Q043",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which ribbon path can delete an entire table in desktop Microsoft Word?",
    "options": [
      "Table Layout > Delete > Delete Table",
      "View > Delete",
      "Home > View > Delete",
      "Insert > View > Delete"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Desktop Word میں cursor table کے اندر رکھ کر Table Layout tab کھولا جا سکتا ہے، پھر Delete menu سے Delete Table منتخب کیا جاتا ہے۔ Microsoft کی موجودہ support guidance ایک متبادل طریقہ بھی دیتی ہے: پورا table move handle سے select کرکے Backspace دبائیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q43, PDF p.25",
      "referenceUrl": "https://support.microsoft.com/en-US/accessibility/word/use-a-screen-reader-to-insert-a-table-in-word",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "delete-table",
      "table-layout"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The scan's path 'Layout>Delete>Table' is standardized to the current desktop command wording 'Table Layout > Delete > Delete Table'; Microsoft also documents a Backspace method."
  },
  {
    "id": "P239-Q043-SIM",
    "pairId": "P239-Q043",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "In Microsoft Word, what usually happens if you select only the contents inside a table and press Delete?",
    "options": [
      "The table contents are cleared but rows and columns remain",
      "The entire document closes",
      "The table becomes an image",
      "A new table is inserted"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Microsoft Support کے مطابق table کے اندر موجود information منتخب کرکے Delete دبانے سے content مٹ جاتا ہے، مگر rows، columns اور formatting باقی رہتی ہے۔ پورا table ہٹانے کے لیے Delete Table command یا مکمل table select کرکے Backspace استعمال کیا جا سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original PPSC-style practice item paired with Paper 239, Q43",
      "referenceUrl": "https://support.microsoft.com/en-US/Word/delete-a-table",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "microsoft-word",
      "table-content",
      "delete-key"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q044-SRC",
    "pairId": "P239-Q044",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "A node in a binary tree can have at most how many children?",
    "options": [
      "1",
      "2",
      "3",
      "Unlimited"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "بائنری ٹری میں ہر نوڈ کے زیادہ سے زیادہ دو بچے ہو سکتے ہیں۔ انہیں عموماً بایاں بچہ اور دایاں بچہ کہا جاتا ہے، جبکہ کسی نوڈ کے صفر یا ایک بچہ بھی ہو سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q44, PDF p.25",
      "referenceUrl": "https://xlinux.nist.gov/dads/HTML/binarytree.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "binary-tree",
      "data-structures"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q044-SIM",
    "pairId": "P239-Q044",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "What are the two child subtrees of a binary-tree node conventionally called?",
    "options": [
      "Upper and lower",
      "First and last",
      "Left and right",
      "Parent and sibling"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "بائنری ٹری کی رسمی تعریف میں روٹ کے ساتھ left binary tree اور right binary tree ہوتے ہیں۔ اسی وجہ سے کسی نوڈ کے دو ممکنہ بچوں کو left child اور right child کہا جاتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://xlinux.nist.gov/dads/HTML/binarytree.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "binary-tree",
      "data-structures"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q045-SRC",
    "pairId": "P239-Q045",
    "kind": "source",
    "categoryId": "basic-computer-studies",
    "question": "Which SQL command removes a table definition together with its data?",
    "options": [
      "DROP TABLE",
      "DELETE",
      "TRUNCATE",
      "REMOVE"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "SQL میں DROP TABLE پوری جدول کو اس کی ساخت اور موجود ڈیٹا سمیت ختم کرتا ہے۔ DELETE یا TRUNCATE قطاریں خالی کر سکتے ہیں مگر جدول کی تعریف برقرار رہتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q45, PDF p.25",
      "referenceUrl": "https://www.postgresql.org/docs/current/sql-droptable.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sql",
      "drop-table",
      "database"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q045-SIM",
    "pairId": "P239-Q045",
    "kind": "similar",
    "categoryId": "basic-computer-studies",
    "question": "Which SQL command can quickly empty a table while retaining the table itself?",
    "options": [
      "CREATE TABLE",
      "ALTER TABLE",
      "TRUNCATE",
      "DROP TABLE"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "TRUNCATE جدول کی تمام قطاریں خالی کرتا ہے لیکن خود جدول اور اس کی بنیادی ساخت موجود رہتی ہے۔ PostgreSQL کی دستاویز DROP TABLE کے مقابلے میں DELETE یا TRUNCATE کو اسی مقصد کے لیے بیان کرتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.postgresql.org/docs/current/sql-droptable.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "sql",
      "drop-table",
      "database"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q046-SRC",
    "pairId": "P239-Q046",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best antonym of “droll.”",
    "options": [
      "Funny",
      "Solemn",
      "Witty",
      "Humorous"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Droll کا مطلب عجیب مگر مزاحیہ یا دل چسپ انداز رکھنے والا ہے۔ Solemn سنجیدہ اور غیر مزاحیہ کیفیت کو ظاہر کرتا ہے، اس لیے دیے گئے اختیارات میں یہی بہترین متضاد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q46, PDF p.25",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/droll",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "droll",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q046-SIM",
    "pairId": "P239-Q046",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to “droll”?",
    "options": [
      "Amusing",
      "Grave",
      "Ordinary",
      "Angry"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Droll کے معنی amusing in an odd or unusual way ہیں۔ اس لیے amusing اس کا قریب ترین مترادف ہے، جبکہ grave یا solemn اس کے مخالف مفہوم دیتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/droll",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "droll",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q047-SRC",
    "pairId": "P239-Q047",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the proverb: A burnt child ____ the fire.",
    "options": [
      "Loves",
      "Dreads",
      "Touches",
      "Ignores"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل کہاوت A burnt child dreads the fire ہے۔ اس کا مطلب ہے کہ جو شخص کسی تجربے سے نقصان اٹھا چکا ہو وہ آئندہ اسی خطرے سے زیادہ محتاط رہتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q47, PDF p.25",
      "referenceUrl": "https://en.wiktionary.org/wiki/a_burnt_child_dreads_the_fire",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "burnt-child",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q047-SIM",
    "pairId": "P239-Q047",
    "kind": "similar",
    "categoryId": "english",
    "question": "What does the proverb “A burnt child dreads the fire” imply?",
    "options": [
      "Painful experience produces caution",
      "Failure should be ignored",
      "Children enjoy danger",
      "Fire removes fear"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ کہاوت بتاتی ہے کہ تکلیف دہ تجربہ انسان کو اسی طرح کے خطرے سے ہوشیار کر دیتا ہے۔ اس کا قریب مفہوم once bitten, twice shy ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://en.wiktionary.org/wiki/a_burnt_child_dreads_the_fire",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "burnt-child",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q048-SRC",
    "pairId": "P239-Q048",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Smear : Libel :: Heed : ____.",
    "options": [
      "Ignore",
      "Consider",
      "Forget",
      "Avoid"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Smear اور libel کسی کی شہرت خراب کرنے کے قریب المعنی الفاظ ہیں۔ اسی طرح heed کا مطلب کسی بات پر توجہ دینا یا اسے consider کرنا ہے، لہٰذا Consider درست جواب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q48, PDF p.25",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/heed",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "heed",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q048-SIM",
    "pairId": "P239-Q048",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which verb is closest in meaning to “heed” in the sentence “Heed the warning”?",
    "options": [
      "Disregard",
      "Erase",
      "Notice",
      "Postpone"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Heed کا مطلب کسی نصیحت یا تنبیہ کو توجہ سے سننا اور اس کا لحاظ کرنا ہے۔ Notice دیے گئے اختیارات میں اس معنی کے سب سے قریب ہے، جبکہ disregard اس کا الٹ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/heed",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "heed",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q049-SRC",
    "pairId": "P239-Q049",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best antonym of “malodorous.”",
    "options": [
      "Fragrant",
      "Rotten",
      "Stinking",
      "Smelly"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Malodorous کا مطلب بدبودار یا unpleasant smell والا ہے۔ Fragrant خوشبودار کے معنی دیتا ہے، اس لیے یہ اس کا واضح متضاد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q49, PDF p.25",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/malodorous",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "malodorous",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q049-SIM",
    "pairId": "P239-Q049",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to “malodorous”?",
    "options": [
      "Aromatic",
      "Foul-smelling",
      "Colourless",
      "Silent"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Malodorous ایسی چیز کو کہتے ہیں جس سے ناگوار بو آئے۔ Foul-smelling اسی مفہوم کا براہ راست مترادف ہے، جبکہ aromatic عموماً خوشبو کے لیے آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/malodorous",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "malodorous",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q050-SRC",
    "pairId": "P239-Q050",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the correct sentence.",
    "options": [
      "When have your friends come?",
      "When did your friends came?",
      "When did your friends come?",
      "When your friends have come?"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Past simple سوال میں did کے بعد فعل کی بنیادی شکل استعمال ہوتی ہے۔ اسی لیے did کے ساتھ came نہیں بلکہ come آتا ہے: When did your friends come?",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q50, PDF p.25",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/past-simple",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "past-simple",
      "auxiliary-did",
      "sentence-correction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q050-SIM",
    "pairId": "P239-Q050",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the past-simple question: Did she ____ to the office yesterday?",
    "options": [
      "went",
      "going",
      "gone",
      "go"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Did خود ماضی کی علامت ہے، اس کے بعد main verb کی base form آتی ہے۔ لہٰذا Did she go درست ہے، Did she went نہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/past-simple",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "past-simple",
      "auxiliary-did",
      "sentence-correction"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q051-SRC",
    "pairId": "P239-Q051",
    "kind": "source",
    "categoryId": "english",
    "question": "In reported speech with a past reporting verb, “can” normally changes to ____.",
    "options": [
      "will",
      "shall",
      "could",
      "may"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Reported speech میں ماضی کے reporting verb کے بعد can عموماً could میں backshift ہوتا ہے۔ مثال کے طور پر “I can swim” کو He said that he could swim لکھا جا سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q51, PDF p.25",
      "referenceUrl": "https://africa.teachingenglish.org.uk/classroom/grammar/reported-speech",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "reported-speech",
      "modal-verbs",
      "can-could"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q051-SIM",
    "pairId": "P239-Q051",
    "kind": "similar",
    "categoryId": "english",
    "question": "In the usual backshift of reported speech, “will” changes to which modal?",
    "options": [
      "Could",
      "Would",
      "Should",
      "Might"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ماضی کے reporting verb کے بعد will عموماً would بن جاتا ہے۔ British Council کے مطابق can→could اور will→would عام backshift تبدیلیاں ہیں، اگرچہ مستقل سچائی میں tense بدلنا لازم نہیں ہوتا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://africa.teachingenglish.org.uk/classroom/grammar/reported-speech",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "reported-speech",
      "modal-verbs",
      "can-could"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q052-SRC",
    "pairId": "P239-Q052",
    "kind": "source",
    "categoryId": "english",
    "question": "Despite discussing the issue, he could not ____ with the manager.",
    "options": [
      "get up",
      "get on",
      "get over",
      "get along"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Get along with someone کا مطلب کسی کے ساتھ اچھے تعلقات رکھنا یا نباہ کرنا ہے۔ جملے میں with پہلے سے موجود ہے، اس لیے get along موزوں جواب بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q52, PDF p.25",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/get-along",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "phrasal-verb",
      "get-along",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q052-SIM",
    "pairId": "P239-Q052",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which phrasal verb means “to have a friendly relationship with someone”?",
    "options": [
      "Get along",
      "Get away",
      "Get over",
      "Get through"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Get along کا ایک معروف معنی کسی کے ساتھ دوستانہ تعلق یا اچھا نباہ رکھنا ہے۔ Get over مشکل یا بیماری سے نکلنے، جبکہ get through کسی عمل کو مکمل کرنے کے لیے آ سکتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/get-along",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "phrasal-verb",
      "get-along",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q053-SRC",
    "pairId": "P239-Q053",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the proverb: Charity begins at ____.",
    "options": [
      "School",
      "Home",
      "Work",
      "Church"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "مکمل کہاوت Charity begins at home ہے۔ اس کا مفہوم یہ ہے کہ دوسروں کی مدد سے پہلے اپنے خاندان اور قریب رہنے والوں کی ضروریات کا خیال رکھنا چاہیے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q53, PDF p.25",
      "referenceUrl": "https://dictionary.cambridge.org/us/dictionary/english/charity-begins-at-home",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "charity",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q053-SIM",
    "pairId": "P239-Q053",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which idea is expressed by “Charity begins at home”?",
    "options": [
      "Help distant people only",
      "Never give to charity",
      "Care first for those close to you",
      "Wealth begins at school"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اس کہاوت میں home صرف عمارت نہیں بلکہ اپنے قریبی لوگ اور خاندان بھی مراد ہیں۔ پیغام یہ ہے کہ خیر خواہی اور ذمہ داری کا آغاز اپنے قریب ترین حلقے سے ہونا چاہیے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/us/dictionary/english/charity-begins-at-home",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "proverb",
      "charity",
      "completion"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q054-SRC",
    "pairId": "P239-Q054",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the reconstructed sentence: The old town lay far away; nothing like this had happened to ____ city before.",
    "options": [
      "this",
      "those",
      "that",
      "these"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "That ایک دور موجود واحد اسم کی طرف اشارہ کرتا ہے، اس لیے that city درست ہے۔ Those جمع، جبکہ this اور these نسبتاً قریب چیزوں کے لیے آتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q54, PDF p.25",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/this-that-these-those",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "demonstratives",
      "that",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed sentence is grammatically incomplete ('The city was quite like nothing happened to ____ city'). It was substantively reconstructed to preserve the demonstrative-pronoun test and the printed answer 'that'."
  },
  {
    "id": "P239-Q054-SIM",
    "pairId": "P239-Q054",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the sentence: Look at ____ flowers here beside me.",
    "options": [
      "that",
      "these",
      "this",
      "those"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Flowers جمع ہے اور here قربت ظاہر کرتا ہے، اس لیے these درست demonstrative ہے۔ This واحد قریب، that واحد دور اور those جمع دور کے لیے آتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/this-that-these-those",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "demonstratives",
      "that",
      "grammar"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q055-SRC",
    "pairId": "P239-Q055",
    "kind": "source",
    "categoryId": "english",
    "question": "In the sentence “This table is heavy,” what part of speech is “heavy”?",
    "options": [
      "Verb",
      "Adverb",
      "Noun",
      "Adjective"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Heavy اسم table کی کیفیت بیان کرتا ہے، اس لیے یہ adjective ہے۔ Linking verb is کے بعد آنے والا یہ لفظ predicate adjective کے طور پر subject کی صفت بتاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q55, PDF p.25",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/grammar/parts_of_speech_overview.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "adjective",
      "parts-of-speech",
      "heavy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q055-SIM",
    "pairId": "P239-Q055",
    "kind": "similar",
    "categoryId": "english",
    "question": "In the sentence “The box feels light,” what part of speech is “light”?",
    "options": [
      "Adverb",
      "Pronoun",
      "Adjective",
      "Conjunction"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہاں feels ایک linking verb ہے اور light اسم box کی کیفیت بیان کرتا ہے۔ لہٰذا light اس جملے میں adjective ہے، نہ کہ adverb۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://owl.purdue.edu/owl/general_writing/grammar/parts_of_speech_overview.html",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "adjective",
      "parts-of-speech",
      "heavy"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q056-SRC",
    "pairId": "P239-Q056",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the sentence: Is he a party ____ the crime?",
    "options": [
      "through",
      "to",
      "like",
      "for"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "معروف قانونی اور رسمی collocation be a party to something ہے۔ اس کا مطلب کسی جرم، معاہدے یا منصوبے میں شریک ہونا ہے، اس لیے درست preposition to ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q56, PDF p.26",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/be-party-to",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "party-to",
      "collocation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q056-SIM",
    "pairId": "P239-Q056",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the formal phrase: All signatories are parties ____ the agreement.",
    "options": [
      "to",
      "by",
      "at",
      "with"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "کسی معاہدے میں شامل فریق کو a party to the agreement کہا جاتا ہے۔ جمع صورت میں parties to the agreement وہی مقررہ ترکیب برقرار رکھتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://dictionary.cambridge.org/dictionary/english/be-party-to",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "preposition",
      "party-to",
      "collocation"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q057-SRC",
    "pairId": "P239-Q057",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Folderol : ____ :: Benevolence : Charity.",
    "options": [
      "Cash",
      "Greed",
      "Nonsense",
      "Event"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Folderol کا ایک بنیادی معنی nonsense یعنی بے معنی بات ہے۔ جیسے benevolence اور charity قریب المعنی ہیں، ویسے ہی folderol اور nonsense کا مترادف تعلق بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q57, PDF p.26",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/folderol",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "folderol",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q057-SIM",
    "pairId": "P239-Q057",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which sentence uses “folderol” in its dictionary sense?",
    "options": [
      "The folderol measured ten metres",
      "Ignore that empty folderol",
      "She folderol the door",
      "Folderol means generosity"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Folderol ایک noun ہے جس کے معنی فضول یا بے معنی بات کے ہیں۔ “Empty folderol” اسی مفہوم میں درست استعمال ہے؛ اسے فعل یا پیمائش کی چیز سمجھنا غلط ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/folderol",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "folderol",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q058-SRC",
    "pairId": "P239-Q058",
    "kind": "source",
    "categoryId": "english",
    "question": "Complete the analogy: Glade : ____ :: Castle : Moat.",
    "options": [
      "Woods",
      "Royalty",
      "Water",
      "Greenish"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Glade جنگل یا woods کے درمیان کھلی جگہ ہوتی ہے۔ اسی طرح moat عموماً castle کے گرد موجود حفاظتی کھائی ہوتی ہے، لہٰذا دونوں جوڑوں میں جگہ اور اس کے گرد ماحول کا تعلق ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q58, PDF p.26",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/glade",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "glade",
      "moat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q058-SIM",
    "pairId": "P239-Q058",
    "kind": "similar",
    "categoryId": "english",
    "question": "An oasis is most naturally associated with which surrounding landscape?",
    "options": [
      "Desert",
      "Glacier",
      "Harbour",
      "Volcano"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "جیسے glade جنگل کے اندر کھلی جگہ ہے، oasis صحرا میں پانی اور نباتات والی جگہ ہوتی ہے۔ اس لیے Desert درست surrounding landscape ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/glade",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "analogy",
      "glade",
      "moat"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q059-SRC",
    "pairId": "P239-Q059",
    "kind": "source",
    "categoryId": "english",
    "question": "Choose the best general antonym of “truculent.”",
    "options": [
      "Flattering",
      "Gentle",
      "Facile",
      "Submissive"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Truculent ایسے رویے کو کہتے ہیں جو سخت، جارحانہ یا لڑاکا ہو۔ Gentle نرم اور غیر جارحانہ کیفیت بیان کرتا ہے، اس لیے دیے گئے اختیارات میں یہ بہترین عمومی متضاد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q59, PDF p.26",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/truculent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "truculent",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "'Submissive' can contrast with the defiant sense of truculent, but the printed key selects 'Gentle', the clearest opposite of its general harsh/aggressive sense; the website retains that keyed choice with this caveat."
  },
  {
    "id": "P239-Q059-SIM",
    "pairId": "P239-Q059",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which description best matches a truculent person?",
    "options": [
      "Calmly cooperative",
      "Aggressively defiant",
      "Deeply sleepy",
      "Carefully neutral"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Truculent شخص جارحانہ انداز سے مخالفت یا لڑائی پر آمادہ ہوتا ہے۔ Merriam-Webster اسے notably harsh and aggressive disposition سے جوڑتی ہے، اس لیے aggressively defiant موزوں ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/truculent",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "antonym",
      "truculent",
      "vocabulary"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q060-SRC",
    "pairId": "P239-Q060",
    "kind": "source",
    "categoryId": "english",
    "question": "What part of speech is “honesty” in “Honesty is the best policy”?",
    "options": [
      "Verb",
      "Adjective",
      "Adverb",
      "Noun"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Honesty ایک noun ہے جو سچائی اور دیانت کی مجرد کیفیت کا نام ہے۔ اسی جملے میں یہ grammatical subject بھی ہے، مگر سوال word class یعنی part of speech پوچھ رہا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q60, PDF p.26",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/honesty",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "noun",
      "parts-of-speech",
      "honesty"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source wording made both 'subject' and 'noun' defensible. The website narrows the stem to part of speech so the printed answer 'noun' is uniquely correct."
  },
  {
    "id": "P239-Q060-SIM",
    "pairId": "P239-Q060",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is an abstract noun?",
    "options": [
      "Become",
      "Kind",
      "Kindly",
      "Kindness"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "Kindness کسی محسوس شے کے بجائے ایک کیفیت کا نام ہے، اس لیے یہ abstract noun ہے۔ Kind adjective اور kindly عام طور پر adverb کے طور پر استعمال ہوتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/honesty",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "noun",
      "parts-of-speech",
      "honesty"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q061-SRC",
    "pairId": "P239-Q061",
    "kind": "source",
    "categoryId": "english",
    "question": "We did not like this house at first, but now we ____ living here.",
    "options": [
      "are used to",
      "used to",
      "use to",
      "were used to"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Be used to + noun/gerund کا مطلب کسی حالت کا عادی ہونا ہے۔ Now موجودہ حالت دکھاتا ہے، اس لیے are used to living درست ترکیب ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q61, PDF p.26",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/different-uses-of-used-to",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "used-to",
      "be-used-to",
      "gerund"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q061-SIM",
    "pairId": "P239-Q061",
    "kind": "similar",
    "categoryId": "english",
    "question": "Complete the sentence about a past habit: I ____ walk to school every day.",
    "options": [
      "am used to",
      "used to",
      "use to",
      "was using to"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Used to + base verb ماضی کی ایسی عادت یا حالت بتاتا ہے جو اب جاری نہیں۔ یہاں walk base verb ہے، اس لیے used to walk درست ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/different-uses-of-used-to",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "used-to",
      "be-used-to",
      "gerund"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q062-SRC",
    "pairId": "P239-Q062",
    "kind": "source",
    "categoryId": "english",
    "question": "Which option names courage in the face of danger?",
    "options": [
      "Vice",
      "Valor",
      "Both vice and valor",
      "None of these"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Valor کا مطلب خاص طور پر خطرے یا مشکل کے سامنے بہادری اور جرأت ہے۔ Vice اخلاقی برائی یا بری عادت کو کہتے ہیں، اس لیے دونوں مترادف نہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q62, PDF p.26",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/valor",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "valor",
      "vocabulary",
      "reconstructed-source"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The page-26 image was reinspected: the source literally reads 'Describe Proverb is →' and no missing proverb is visible. Because the stem is unrecoverable, the website transparently reconstructs a directly verifiable vocabulary question around the printed key 'Valor' while retaining all four source choices."
  },
  {
    "id": "P239-Q062-SIM",
    "pairId": "P239-Q062",
    "kind": "similar",
    "categoryId": "english",
    "question": "Which word is closest in meaning to “valor”?",
    "options": [
      "Cowardice",
      "Courage",
      "Vice",
      "Doubt"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Valor اور courage دونوں بہادری کے معنی دیتے ہیں، خصوصاً خطرے کے وقت۔ Cowardice یعنی بزدلی اس کا متضاد مفہوم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.merriam-webster.com/dictionary/valor",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "valor",
      "vocabulary",
      "reconstructed-source"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q063-SRC",
    "pairId": "P239-Q063",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "What is the value of (−1)³⁰⁰?",
    "options": [
      "−1",
      "1",
      "0",
      "300"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "منفی ایک کی جفت قوت ہمیشہ مثبت ایک ہوتی ہے، کیونکہ منفی نشان جوڑوں میں ضرب ہو کر مثبت بن جاتے ہیں۔ 300 جفت عدد ہے، اس لیے (−1)³⁰⁰ = 1۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q63, PDF p.26",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/10-1-integer-and-rational-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "negative-one",
      "parity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q063-SIM",
    "pairId": "P239-Q063",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What is the value of (−1)³⁰¹?",
    "options": [
      "1",
      "−1",
      "0",
      "301"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "منفی ایک کی طاق قوت کا جواب −1 رہتا ہے۔ چونکہ 301 طاق عدد ہے، اس لیے (−1)³⁰¹ = −1۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/10-1-integer-and-rational-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "negative-one",
      "parity"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q064-SRC",
    "pairId": "P239-Q064",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Simplify (m^(1/3) · n^(−2))^(3/5).",
    "options": [
      "m^(1/5) · n^(−6/5)",
      "m^(−1/5) · n^(−6/5)",
      "m^(1/5) · n^(6/5)",
      "m^(1/5) · n^(1/5)"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "Power of a power میں اندر اور باہر کے exponents ضرب ہوتے ہیں۔ m کے لیے (1/3)(3/5)=1/5 اور n کے لیے (−2)(3/5)=−6/5، لہٰذا پہلا جواب درست ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q64, PDF p.26",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/10-2-use-multiplication-properties-of-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "power-of-a-power",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The source has tightly typeset fractional exponents and a malformed distractor. The website normalizes the verified expression and four choices without changing the printed correct result."
  },
  {
    "id": "P239-Q064-SIM",
    "pairId": "P239-Q064",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Simplify (a^(2/3) · b^(−1))³.",
    "options": [
      "a³b⁻¹",
      "a²b³",
      "a^(2/9)b⁻³",
      "a²b⁻³"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "باہر کی قوت 3 کو ہر اندرونی exponent سے ضرب دیں۔ (2/3)×3=2 اور −1×3=−3، اس لیے نتیجہ a²b⁻³ ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/10-2-use-multiplication-properties-of-exponents",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "exponents",
      "power-of-a-power",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q065-SRC",
    "pairId": "P239-Q065",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "In the sequence 2, 6, 18, 54, 162, 486, what is the fourth term from the end?",
    "options": [
      "20",
      "22",
      "19",
      "18"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "ہر اگلی حد پچھلی حد کو 3 سے ضرب دے کر بنتی ہے، اس لیے مکمل فہرست 2، 6، 18، 54، 162، 486 ہے۔ آخر سے 486 پہلی، 162 دوسری، 54 تیسری اور 18 چوتھی حد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q65, PDF p.26",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/13-3-geometric-sequences",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "geometric-sequence",
      "series",
      "ratio"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q065-SIM",
    "pairId": "P239-Q065",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "In the sequence 3, 9, 27, 81, 243, 729, what is the third term from the end?",
    "options": [
      "81",
      "27",
      "243",
      "729"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ geometric sequence ہے جس کا common ratio 3 ہے۔ آخر سے 729 پہلی، 243 دوسری اور 81 تیسری حد بنتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/13-3-geometric-sequences",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "geometric-sequence",
      "series",
      "ratio"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q066-SRC",
    "pairId": "P239-Q066",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "If x = 5 and y = 2, what is x + y?",
    "options": [
      "9",
      "7",
      "10",
      "8"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اظہار x+y میں x کی جگہ 5 اور y کی جگہ 2 رکھیں۔ پھر 5+2=7، اس لیے درست جواب 7 ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q66, PDF p.26",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-2-evaluate-simplify-and-translate-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "substitution",
      "addition",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q066-SIM",
    "pairId": "P239-Q066",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "If a = 9 and b = 4, what is a − b?",
    "options": [
      "3",
      "4",
      "13",
      "5"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "متغیرات کی دی گئی قدریں expression میں رکھیں: a−b = 9−4۔ تفریق کرنے سے جواب 5 آتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-2-evaluate-simplify-and-translate-expressions",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "substitution",
      "addition",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q067-SRC",
    "pairId": "P239-Q067",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A rectangle's height is 6 units more than its width w. What is its perimeter?",
    "options": [
      "4p + 12",
      "4a + 12",
      "4w + 12",
      "4l + 12"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "چوڑائی w ہو تو لمبائی یا height w+6 ہوگی۔ محیط 2w+2(w+6)=2w+2w+12=4w+12 بنتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q67, PDF p.26",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rectangle",
      "perimeter",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q067-SIM",
    "pairId": "P239-Q067",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A rectangle's length is 5 units more than its width w. Which expression gives its perimeter?",
    "options": [
      "2w + 5",
      "4w + 5",
      "w² + 5w",
      "4w + 10"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "لمبائی w+5 اور چوڑائی w ہے۔ محیط 2[(w+5)+w]=2(2w+5)=4w+10 ہوگا۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "rectangle",
      "perimeter",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q068-SRC",
    "pairId": "P239-Q068",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "If the diameter of a circle is 12 cm, what is its radius?",
    "options": [
      "9 cm",
      "6 cm",
      "12 cm",
      "18 cm"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "قطر radius کا دو گنا ہوتا ہے، یعنی d=2r۔ اس لیے r=12÷2=6 cm ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q68, PDF p.26",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "circle",
      "diameter",
      "radius"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q068-SIM",
    "pairId": "P239-Q068",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A circle has a radius of 7 cm. What is its diameter?",
    "options": [
      "14 cm",
      "7 cm",
      "3.5 cm",
      "21 cm"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "قطر نکالنے کے لیے radius کو 2 سے ضرب دیتے ہیں۔ 2×7=14 cm، اس لیے درست جواب 14 cm ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "circle",
      "diameter",
      "radius"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q069-SRC",
    "pairId": "P239-Q069",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Simplify 3x² + xy + √x + 7x².",
    "options": [
      "10x + √25x + xy",
      "10x + √(25x) + xy",
      "10x² + xy + √x",
      "10x² − xy + √x"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "صرف like terms جمع کیے جا سکتے ہیں۔ 3x²+7x²=10x²، جبکہ xy اور √x مختلف نوعیت کی حدود ہیں، اس لیے جواب 10x²+xy+√x ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q69, PDF p.27",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-1-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "like-terms",
      "simplification",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The radical bars in printed distractors A and B are visually ambiguous. The website uses explicit parentheses where needed; the verified correct simplification is unchanged."
  },
  {
    "id": "P239-Q069-SIM",
    "pairId": "P239-Q069",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Simplify 4y² + 3xy + √y + 6y².",
    "options": [
      "10y + 3xy + √y",
      "10y² + 3xy + √y",
      "10y² − 3xy + √y",
      "24y⁴ + 3xy + √y"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "4y² اور 6y² like terms ہیں، اس لیے ان کا مجموعہ 10y² ہے۔ 3xy اور √y کو ان کے ساتھ جمع نہیں کیا جا سکتا، لہٰذا وہ اپنی صورت میں رہتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/elementary-algebra-2e/pages/2-1-use-the-language-of-algebra",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "like-terms",
      "simplification",
      "algebra"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q070-SRC",
    "pairId": "P239-Q070",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "What kind of roots does 2x² + 5x − 6 = 0 have?",
    "options": [
      "Two equal real roots",
      "Two distinct real roots",
      "No roots of any kind",
      "One linear root"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "Discriminant b²−4ac = 5²−4(2)(−6)=25+48=73 ہے۔ چونکہ 73 صفر سے بڑا ہے، مساوات کے دو مختلف حقیقی roots ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q70, PDF p.27",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "discriminant",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q070-SIM",
    "pairId": "P239-Q070",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What kind of roots does x² + 6x + 9 = 0 have?",
    "options": [
      "Two distinct real roots",
      "Two non-real roots",
      "Two equal real roots",
      "No solution"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "اس مساوات کا discriminant 6²−4(1)(9)=36−36=0 ہے۔ صفر discriminant کا مطلب ایک repeated root، یعنی دو برابر حقیقی roots ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "discriminant",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q071-SRC",
    "pairId": "P239-Q071",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "What are the roots of 2x² − 5x − 12 = 0?",
    "options": [
      "4 and −3/2",
      "−4 and 3/2",
      "3/2 and 4",
      "No real roots"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مساوات کو (2x+3)(x−4)=0 لکھا جا سکتا ہے۔ اس سے 2x+3=0 پر x=−3/2 اور x−4=0 پر x=4 ملتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q71, PDF p.27",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "factorization",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed choices label the second root as y, and printed option C repeats the same two roots in reverse order, so the source item is mathematically ambiguous. The website normalizes both values as roots of x and changes that duplicate distractor's sign to make the verified answer unique."
  },
  {
    "id": "P239-Q071-SIM",
    "pairId": "P239-Q071",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "What are the roots of 2x² + x − 3 = 0?",
    "options": [
      "1 and −3/2",
      "−1 and 3/2",
      "3 and −1/2",
      "1 and 3/2"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "2x²+x−3 کو (2x+3)(x−1) میں factor کیا جا سکتا ہے۔ دونوں عوامل کو صفر رکھنے سے roots −3/2 اور 1 ملتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "factorization",
      "roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q072-SRC",
    "pairId": "P239-Q072",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "Which monic quadratic equation has sum of roots −4 and product of roots 3?",
    "options": [
      "x² + 4x + 3 = 0",
      "x² − 4x + 3 = 0",
      "x² + 4x − 3 = 0",
      "x² + 4x + 3 = 1"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اگر roots کا مجموعہ S اور حاصل ضرب P ہو تو monic equation x²−Sx+P=0 ہوتی ہے۔ S=−4 اور P=3 رکھنے سے x²+4x+3=0 ملتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q72, PDF p.27",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "sum-of-roots",
      "product-of-roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q072-SIM",
    "pairId": "P239-Q072",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "Which monic quadratic has sum of roots 5 and product of roots 6?",
    "options": [
      "x² − 5x + 6 = 0",
      "x² + 5x + 6 = 0",
      "x² − 6x + 5 = 0",
      "x² + 6x − 5 = 0"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "فارمولا x²−Sx+P=0 استعمال کریں۔ S=5 اور P=6 رکھنے سے x²−5x+6=0 بنتی ہے، جس کے roots 2 اور 3 ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "quadratic",
      "sum-of-roots",
      "product-of-roots"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q073-SRC",
    "pairId": "P239-Q073",
    "kind": "source",
    "categoryId": "basic-mathematics",
    "question": "A square has a side length of 12 cm. What is its area?",
    "options": [
      "144 cm²",
      "145 cm²",
      "156 cm²",
      "146 cm²"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "مربع کا رقبہ side² ہوتا ہے۔ 12×12=144، اس لیے رقبہ 144 مربع سینٹی میٹر ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q73, PDF p.27",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "square",
      "area",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q073-SIM",
    "pairId": "P239-Q073",
    "kind": "similar",
    "categoryId": "basic-mathematics",
    "question": "A square has a side length of 9 cm. What is its area?",
    "options": [
      "18 cm²",
      "36 cm²",
      "81 cm²",
      "72 cm²"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "Area of a square = side×side۔ 9×9=81، لہٰذا درست جواب 81 cm² ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "square",
      "area",
      "geometry"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q074-SRC",
    "pairId": "P239-Q074",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "The false report of which Companion's martyrdom led to Bay'at al-Ridwan?",
    "options": [
      "Uthman ibn Affan",
      "Abu Bakr al-Siddiq",
      "Salman al-Farsi",
      "Khalid ibn al-Walid"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "حدیبیہ میں حضرت عثمان بن عفانؓ کو مکہ بھیجا گیا تھا اور ان کی شہادت کی غلط خبر پھیلی۔ اسی خبر کے پس منظر میں صحابہؓ نے درخت کے نیچے بیعت کی، جسے بیعتِ رضوان کہا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q74, PDF p.27",
      "referenceUrl": "https://quran.com/en/48%3A18/tafsirs/tazkirul-quran-en",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bayat-al-ridwan",
      "uthman",
      "hudaybiyyah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q074-SIM",
    "pairId": "P239-Q074",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Which Qur'anic verse explicitly mentions the believers pledging allegiance under the tree?",
    "options": [
      "Al-Ikhlas 112:1",
      "Al-Baqarah 2:255",
      "Al-Fath 48:18",
      "At-Tin 95:3"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سورۃ الفتح کی آیت 18 میں درخت کے نیچے بیعت کرنے والے مومنوں سے اللہ کی رضا کا ذکر ہے۔ اسی نسبت سے یہ واقعہ بیعتِ رضوان اور Pledge under the Tree کے نام سے معروف ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://quran.com/en/48%3A18/tafsirs/tazkirul-quran-en",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "bayat-al-ridwan",
      "uthman",
      "hudaybiyyah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q075-SRC",
    "pairId": "P239-Q075",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Mithaq al-Madinah is commonly described in Islamic-studies texts as the world's first ____.",
    "options": [
      "postal letter",
      "written constitutional charter",
      "treaty between Quraysh and Byzantium",
      "military campaign"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "میثاقِ مدینہ ہجرت کے بعد مدینہ کے مختلف گروہوں کے باہمی تعلقات منظم کرنے والی تحریری دستاویز تھی۔ بہت سے اسلامیات کے مراجع اسے پہلا تحریری دستور یا constitutional charter کہتے ہیں، اگرچہ جدید محققین اس کی قانونی درجہ بندی میں مختلف اصطلاحات بھی استعمال کرتے ہیں۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q75, PDF p.27",
      "referenceUrl": "https://academic.oup.com/edited-volume/62249/chapter-abstract/551418473?login=false",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "charter-of-medina",
      "constitution",
      "622-ce"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q075-SIM",
    "pairId": "P239-Q075",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Around which year CE was the Charter of Medina drawn up after the Hijrah?",
    "options": [
      "622 CE",
      "610 CE",
      "632 CE",
      "661 CE"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ہجرتِ مدینہ 622 عیسوی میں ہوئی اور میثاقِ مدینہ اسی ابتدائی مدنی دور سے منسوب ہے۔ Oxford کا تحقیقی حوالہ اسے 622 CE/1 AH کے بعد کی دستاویز قرار دیتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://academic.oup.com/edited-volume/62249/chapter-abstract/551418473?login=false",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "charter-of-medina",
      "constitution",
      "622-ce"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q076-SRC",
    "pairId": "P239-Q076",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which Mother of the Believers married the Prophet Muhammad (PBUH) after the expedition against Banu al-Mustaliq?",
    "options": [
      "Umm Salamah",
      "Juwayriyah bint al-Harith",
      "Maria al-Qibtiyya",
      "Sawdah bint Zam'ah"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "غزوۂ بنی مصطلق کے موقع پر حضرت جویریہ بنت الحارثؓ قیدیوں میں شامل تھیں اور بعد میں رسول اللہ ﷺ کے نکاح میں آئیں۔ صحیح بخاری کی روایت بنی مصطلق کے واقعے اور اسی دن جویریہؓ کے ملنے کا ذکر کرتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q76, PDF p.27",
      "referenceUrl": "https://yaqeeninstitute.org/watch/series/the-firsts/juwayriya-bint-al-harith-ra-a-blessing-to-her-people-the-firsts",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "juwayriyah",
      "banu-mustaliq",
      "mothers-of-believers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q076-SIM",
    "pairId": "P239-Q076",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "Juwayriyah bint al-Harith belonged by birth to which tribe?",
    "options": [
      "Banu Hashim",
      "Banu Thaqif",
      "Banu al-Mustaliq",
      "Banu Tamim"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "حضرت جویریہ بنت الحارثؓ بنی مصطلق کے سردار حارث بن ابی ضرار کی بیٹی تھیں۔ ان کے نکاح کے بعد اس قبیلے کے بہت سے قیدیوں کی رہائی کا واقعہ بھی سیرت میں مذکور ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://yaqeeninstitute.org/watch/series/the-firsts/juwayriya-bint-al-harith-ra-a-blessing-to-her-people-the-firsts",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "juwayriyah",
      "banu-mustaliq",
      "mothers-of-believers"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q077-SRC",
    "pairId": "P239-Q077",
    "kind": "source",
    "categoryId": "islamic-studies",
    "question": "Which pair of places is explicitly invoked in the opening oaths of Surah At-Tin?",
    "options": [
      "Najran and Mount Uhud",
      "Mount Sinai and the secure city of Makkah",
      "Makkah and Madinah",
      "Najran and Palestine"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "سورۃ التین کی ابتدائی آیات میں انجیر، زیتون، طورِ سینین یعنی Mount Sinai اور البلد الامین کا ذکر ہے۔ مفسرین کے مطابق البلد الامین سے مکہ مراد ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q77, PDF p.28",
      "referenceUrl": "https://quran.com/95",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "surah-at-tin",
      "mount-sinai",
      "makkah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The printed Urdu stem calls both items 'cities', but Mount Sinai is a mountain. The website repairs the wording to 'places' while preserving the printed correct pair."
  },
  {
    "id": "P239-Q077-SIM",
    "pairId": "P239-Q077",
    "kind": "similar",
    "categoryId": "islamic-studies",
    "question": "In Surah At-Tin, what does “this secure city” refer to?",
    "options": [
      "Madinah",
      "Jerusalem",
      "Makkah",
      "Damascus"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سورۃ التین 95:3 میں وَهَذَا الْبَلَدِ الْأَمِينِ آیا ہے۔ معروف تفاسیر میں اس محفوظ شہر سے مکہ مراد لیا گیا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://quran.com/95",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "surah-at-tin",
      "mount-sinai",
      "makkah"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q078-SRC",
    "pairId": "P239-Q078",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu proverb بلی کے بھاگوں چھینکا ٹوٹا mean?",
    "options": [
      "متوقع فائدہ",
      "غیر متوقع فائدہ",
      "مسلسل نقصان",
      "محنت کا لازمی صلہ"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "اس ضرب المثل کا مطلب اچانک ایسا فائدہ مل جانا ہے جس کی توقع نہ ہو۔ چھینکا خوراک رکھنے کی لٹکتی جالی تھی؛ اس کے ٹوٹنے سے بلی کو بے کوشش خوراک مل جاتی ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q78, PDF p.28",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-billii-ke-bhaagon-chhiinkaa-tuutaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "unexpected-gain",
      "chhinka"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q078-SIM",
    "pairId": "P239-Q078",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which situation best illustrates بلی کے بھاگوں چھینکا ٹوٹا?",
    "options": [
      "بغیر توقع انعام مل جانا",
      "روزانہ محنت کرنا",
      "جان بوجھ کر نقصان اٹھانا",
      "وعدہ پورا نہ کرنا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "یہ کہاوت اتفاقاً حاصل ہونے والے غیر متوقع فائدے کے لیے بولی جاتی ہے۔ اس لیے بغیر توقع انعام مل جانا اس کی موزوں مثال ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-billii-ke-bhaagon-chhiinkaa-tuutaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "unexpected-gain",
      "chhinka"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q079-SRC",
    "pairId": "P239-Q079",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is the intended meaning of کوّے کے بھی پر نکل آئے?",
    "options": [
      "مصیبت میں آنا",
      "اوقات سے باہر ہونا",
      "خوشحالی میں آنا",
      "خاموش ہو جانا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کسی کے ’پر نکل آنے‘ سے مراد اس میں حد سے بڑھی شوخی، خود سری یا سرکشی پیدا ہونا ہے۔ کوّے کے حوالے سے یہ فقرہ طنزاً ایسے کم حیثیت شخص کے لیے آتا ہے جو اپنی اوقات سے بڑھنے لگے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q79, PDF p.28",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-par-o-baal-nikaalnaa",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "par-nikalna",
      "insolence"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q079-SIM",
    "pairId": "P239-Q079",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In Urdu idiom, کسی کے پر و بال نکلنا most nearly suggests what?",
    "options": [
      "شریر یا خود سر ہو جانا",
      "بیمار پڑ جانا",
      "مال کھو دینا",
      "خاموشی اختیار کرنا"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "ریختہ کے مطابق پر و بال نکالنا ہوش سنبھالنے کے ساتھ شریر ہونے کے معنی میں بھی آتا ہے۔ محاوراتی سیاق میں یہ اکثر بڑھتی ہوئی شوخی یا خود سری کی طرف اشارہ کرتا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-par-o-baal-nikaalnaa",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "par-nikalna",
      "insolence"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q080-SRC",
    "pairId": "P239-Q080",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the Urdu idiom سونے کی چڑیا ہاتھ لگنا mean?",
    "options": [
      "ہاتھ سے کھونا",
      "وقت کی قدر نہ کرنا",
      "قیمتی چیز ہاتھ آنا",
      "خالی ہاتھ رہنا"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "سونے کی چڑیا ہاتھ لگنے سے مراد کوئی بہت قیمتی چیز یا بڑا فائدہ حاصل ہونا ہے۔ بعض قدیم استعمالات میں کسی مال دار شخص کے قابو میں آنے کا مفہوم بھی ملتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q80, PDF p.28",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-sone-kii-chidiyaa-haath-lagnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "golden-bird",
      "valuable-prize"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q080-SIM",
    "pairId": "P239-Q080",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which expression means that a valuable opportunity or prize has been obtained?",
    "options": [
      "دانت کھٹے کرنا",
      "آگ بگولا ہونا",
      "ہاتھ پر ہاتھ دھرنا",
      "سونے کی چڑیا ہاتھ لگنا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "’سونے کی چڑیا ہاتھ لگنا‘ قیمتی چیز یا فائدہ حاصل ہونے کا محاورہ ہے۔ باقی اختیارات بالترتیب غصہ، بے عملی اور شکست دینے کے مختلف مفاہیم رکھتے ہیں۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://rekhtadictionary.com/meaning-of-sone-kii-chidiyaa-haath-lagnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-idiom",
      "golden-bird",
      "valuable-prize"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q081-SRC",
    "pairId": "P239-Q081",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does ڈوبتے کو تنکے کا سہارا mean?",
    "options": [
      "پانی میں ڈوبنا",
      "تنکے سے تیرنا",
      "کنارہ تلاش کرنا",
      "مصیبت میں تھوڑی مدد بھی بہت ہونا"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اس ضرب المثل کا مفہوم ہے کہ شدید مصیبت میں معمولی سی مدد بھی بہت قیمتی محسوس ہوتی ہے۔ لفظی تصویر میں ڈوبتا شخص بچنے کے لیے تنکے تک کو پکڑ لیتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q81, PDF p.28",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-duubte-ko-tinke-kaa-sahaaraa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "small-help",
      "difficulty"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q081-SIM",
    "pairId": "P239-Q081",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "When is the proverb ڈوبتے کو تنکے کا سہارا most appropriate?",
    "options": [
      "جب کامیابی یقینی ہو",
      "جب مشکل میں معمولی مدد ملے",
      "جب کوئی مدد رد کر دے",
      "جب پانی بہت کم ہو"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "یہ کہاوت اس وقت بولی جاتی ہے جب ناامیدی یا مشکل میں تھوڑی سی مدد بھی سہارا بن جائے۔ اس کا زور مدد کی مقدار پر نہیں بلکہ ضرورت کی شدت پر ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-duubte-ko-tinke-kaa-sahaaraa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "small-help",
      "difficulty"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q082-SRC",
    "pairId": "P239-Q082",
    "kind": "source",
    "categoryId": "urdu",
    "question": "In the line اک چراغ تمام شہر میں تنہا رہا, how is چراغ classified in the prescribed school-level convention?",
    "options": [
      "کنایہ",
      "قافیہ",
      "مجاز مرسل",
      "تلمیح"
    ],
    "correctOptionIndex": 0,
    "explanationUrdu": "اس مصرعے میں ’چراغ‘ محض جلنے والا دیا نہیں بلکہ ایک نمایاں یا صاحبِ علم انسان کی طرف بالواسطہ اشارہ کرتا ہے۔ فراہم کردہ کلید اور ایف بی آئی ایس ای کے مماثل تدریسی سوالات کی روایت میں اسے کنایہ شمار کیا گیا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q82, PDF p.28",
      "referenceUrl": "https://fbise.edu.pk/ModelPaper/2024/urdu/Urdu%209th%20MP.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-rhetoric",
      "kinaya",
      "charagh"
    ],
    "verificationStatus": "verified",
    "sourceNotes": "The line and classification can overlap with metaphor in broader literary analysis. For exam consistency, the website follows the printed key and the directly comparable FBISE school-model convention, both of which classify چراغ as کنایہ."
  },
  {
    "id": "P239-Q082-SIM",
    "pairId": "P239-Q082",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In the line ایک روشن دماغ تھا، نہ رہا؛ شہر میں اک چراغ تھا، نہ رہا, which device is identified in the FBISE model-paper convention?",
    "options": [
      "تشبیہ",
      "استعارہ",
      "تلمیح",
      "کنایہ"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "اس شعر میں چراغ سے کسی ممتاز اور روشنی پھیلانے والی شخصیت کی طرف اشارہ ہے۔ ایف بی آئی ایس ای کے ماڈل پیپر میں اس تدریسی مثال کا مطلوب جواب کنایہ دیا گیا ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://fbise.edu.pk/ModelPaper/2024/urdu/Urdu%209th%20MP.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-rhetoric",
      "kinaya",
      "charagh"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q083-SRC",
    "pairId": "P239-Q083",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Which Urdu grammatical term denotes a word showing an action or state in relation to time?",
    "options": [
      "اسم",
      "حرف",
      "فعل",
      "صفت"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "وہ کلمہ جس سے کسی کام کا کرنا یا ہونا زمانے کے تعلق سے معلوم ہو فعل کہلاتا ہے۔ فعل ماضی، حال اور مستقبل کی صورتوں میں وقت کا مفہوم ظاہر کر سکتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q83, PDF p.28",
      "referenceUrl": "https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/UrduA-MS.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "verb",
      "tense"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q083-SIM",
    "pairId": "P239-Q083",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "In the Urdu sentence علی کتاب پڑھتا ہے, which word is the فعل?",
    "options": [
      "علی",
      "کتاب",
      "کوئی نہیں",
      "پڑھتا ہے"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "’پڑھتا ہے‘ کام کے ہونے اور زمانۂ حال کا مفہوم دیتا ہے، اس لیے یہ فعل ہے۔ علی فاعل اور کتاب اس عمل سے متعلق اسم ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/UrduA-MS.pdf",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-grammar",
      "verb",
      "tense"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q084-SRC",
    "pairId": "P239-Q084",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What does the proverb تالی دونوں ہاتھوں سے بجتی ہے mean?",
    "options": [
      "صرف ایک شخص قصوروار ہوتا ہے",
      "ہاتھ خالی رہتے ہیں",
      "جھگڑا دونوں طرف سے ہوتا ہے",
      "ہر جھگڑا فوراً ختم ہوتا ہے"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "تالی کے لیے دو ہاتھ درکار ہوتے ہیں؛ اسی نسبت سے کہاوت کا مطلب ہے کہ محبت یا جھگڑا عموماً دونوں طرف کی شرکت سے پیدا ہوتا ہے۔ دیے گئے سیاق میں مطلوب مفہوم جھگڑے میں دونوں طرف کا حصہ ہونا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q84, PDF p.28",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-taalii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "two-sides",
      "quarrel"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q084-SIM",
    "pairId": "P239-Q084",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which English saying is closest to تالی دونوں ہاتھوں سے بجتی ہے?",
    "options": [
      "Every cloud has a silver lining",
      "Time is money",
      "Practice makes perfect",
      "It takes two to tango"
    ],
    "correctOptionIndex": 3,
    "explanationUrdu": "It takes two to tango بھی کسی معاملے میں دونوں فریقوں کی شرکت یا ذمہ داری ظاہر کرتا ہے۔ اسی لیے یہ اردو کہاوت کا قریب ترین انگریزی متبادل ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-taalii?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "two-sides",
      "quarrel"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q085-SRC",
    "pairId": "P239-Q085",
    "kind": "source",
    "categoryId": "urdu",
    "question": "What is meant by لاتوں کے بھوت باتوں سے نہیں مانتے?",
    "options": [
      "ہر شخص محبت سے مان جاتا ہے",
      "کمزور آدمی حد سے بڑھتا ہے",
      "سرکش لوگ محض نرمی سے نہیں مانتے",
      "بات کرنا ہمیشہ بے فائدہ ہے"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "یہ ضرب المثل ایسے شریر یا سرکش شخص کے بارے میں بولی جاتی ہے جو زبانی نصیحت سے نہ مانے اور جسے سختی درکار ہو۔ اس کا اطلاق ہر شخص یا ہر اختلاف پر نہیں کیا جاتا۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q85, PDF p.28",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-laaton-ke-bhuut-baaton-se-nahiin-maante?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "strictness",
      "stubbornness"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q085-SIM",
    "pairId": "P239-Q085",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "Which situation best fits لاتوں کے بھوت باتوں سے نہیں مانتے?",
    "options": [
      "طالب علم کا پہلی بار سمجھ جانا",
      "سرکش شخص کا بار بار سمجھانے پر بھی نہ ماننا",
      "دوست کا تحفہ دینا",
      "مسافر کا راستہ پوچھنا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "کہاوت کی بنیاد ضد اور سرکشی ہے جسے صرف بات سے دور کرنا ممکن نہ ہو۔ اس لیے بار بار نصیحت کے باوجود نہ ماننے والا شخص موزوں مثال ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-laaton-ke-bhuut-baaton-se-nahiin-maante?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "strictness",
      "stubbornness"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q086-SRC",
    "pairId": "P239-Q086",
    "kind": "source",
    "categoryId": "urdu",
    "question": "Complete the Urdu saying: وقت آنے پر ____ کے بھی پر نکل آئے۔",
    "options": [
      "مکھی",
      "سانپ",
      "چیونٹی",
      "ہرن"
    ],
    "correctOptionIndex": 2,
    "explanationUrdu": "مکمل ترکیب چیونٹی کے پر نکلنا ہے۔ اردو محاورے میں اس سے شامت آنے، زوال قریب ہونے یا کم ظرف شخص کے حد سے بڑھنے کا مفہوم لیا جاتا ہے۔",
    "source": {
      "type": "book",
      "label": "PPSC 110 Edition — Paper 239, Q86, PDF p.28",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-chyuuntii-ke-par-nikalnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "ant-wings",
      "downfall"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  },
  {
    "id": "P239-Q086-SIM",
    "pairId": "P239-Q086",
    "kind": "similar",
    "categoryId": "urdu",
    "question": "What does the idiom چیونٹی کے پر نکلنا usually imply?",
    "options": [
      "بڑی دولت ملنا",
      "شامت یا زوال قریب آنا",
      "علم میں اضافہ ہونا",
      "سفر شروع ہونا"
    ],
    "correctOptionIndex": 1,
    "explanationUrdu": "ریختہ کے مطابق چیونٹی کے پر نکلنے سے شامت یا موت کا وقت قریب آنا مراد ہوتا ہے۔ پس منظر یہ ہے کہ پر نکلنے کے بعد چیونٹی اڑتی ہے اور زیادہ خطرے میں آ جاتی ہے۔",
    "source": {
      "type": "practice",
      "label": "Original similar practice question",
      "referenceUrl": "https://www.rekhtadictionary.com/meaning-of-chyuuntii-ke-par-nikalnaa?lang=ur",
      "accessedOn": "2026-08-22"
    },
    "tags": [
      "urdu-proverb",
      "ant-wings",
      "downfall"
    ],
    "verificationStatus": "verified",
    "sourceNotes": ""
  }
];

  window.PPSC_QUIZ_DATA = {
    version: 2,
    generatedOn: "2026-08-22",
    categories: categories,
    questions: questions
  };
  window.PPSC_CATEGORIES = categories;
  window.PPSC_QUESTIONS = questions;
})();
