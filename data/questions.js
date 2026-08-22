(function () {
  "use strict";

  /**
   * Category and question data for the PPSC practice app.
   *
   * To add a question, copy one of the objects in `questions` and keep:
   * - a unique `id`
   * - a `categoryId` that matches a category below
   * - exactly four options
   * - a zero-based `correctOptionIndex` (A = 0, B = 1, C = 2, D = 3)
   * - an Urdu explanation and an Urdu rationale for every option
   */
  var categories = [
    {
      id: "general-knowledge",
      name: "General Knowledge",
      shortLabel: "GK",
      description: "World facts, organizations, personalities and important events."
    },
    {
      id: "pakistan-studies",
      name: "Pakistan Studies",
      shortLabel: "PK",
      description: "History, constitution, culture and geography of Pakistan."
    },
    {
      id: "current-affairs",
      name: "Current Affairs",
      shortLabel: "CA",
      description: "Important national and international developments."
    },
    {
      id: "islamic-studies",
      name: "Islamic Studies",
      shortLabel: "IS",
      description: "Core Islamic history, beliefs and general knowledge."
    },
    {
      id: "geography",
      name: "Geography",
      shortLabel: "GEO",
      description: "Countries, physical features, maps and world geography."
    },
    {
      id: "basic-mathematics",
      name: "Basic Mathematics",
      shortLabel: "MATH",
      description: "Arithmetic, percentages, ratios and everyday calculations."
    },
    {
      id: "english",
      name: "English",
      shortLabel: "ENG",
      description: "Grammar, vocabulary, sentence correction and comprehension."
    },
    {
      id: "urdu",
      name: "Urdu",
      shortLabel: "UR",
      description: "Urdu grammar, vocabulary, literature and comprehension."
    },
    {
      id: "everyday-science",
      name: "Everyday Science",
      shortLabel: "SCI",
      description: "Daily-life concepts from biology, chemistry and physics."
    },
    {
      id: "basic-computer-studies",
      name: "Basic Computer Studies",
      shortLabel: "IT",
      description: "Computer fundamentals, internet and Microsoft Office basics."
    }
  ];

  var questions = [
    {
      id: "GEO-SRC-0001",
      categoryId: "geography",
      question: "Which is the smallest Muslim-majority country in the world by land area?",
      options: [
        {
          label: "A",
          text: "Brunei",
          rationaleUrdu: "برونائی ایک چھوٹا ملک ضرور ہے، لیکن اس کا خشکی کا رقبہ مالدیپ سے کہیں زیادہ ہے۔"
        },
        {
          label: "B",
          text: "Bahrain",
          rationaleUrdu: "بحرین رقبے کے لحاظ سے چھوٹا خلیجی ملک ہے، مگر اس کا خشکی کا رقبہ بھی مالدیپ سے زیادہ ہے۔"
        },
        {
          label: "C",
          text: "Maldives",
          rationaleUrdu: "مالدیپ کا خشکی کا رقبہ تقریباً 298 مربع کلومیٹر ہے، اس لیے یہ مسلم اکثریتی ممالک میں سب سے چھوٹا ہے۔"
        },
        {
          label: "D",
          text: "Qatar",
          rationaleUrdu: "قطر ایک نسبتاً چھوٹا ملک ہے، لیکن اس کا رقبہ مالدیپ سے بہت زیادہ ہے۔"
        }
      ],
      correctOptionIndex: 2,
      explanationUrdu: "اس سوال میں ’سب سے چھوٹا‘ سے مراد خشکی کا رقبہ ہے۔ مالدیپ کا خشکی کا رقبہ تقریباً 298 مربع کلومیٹر ہے، اس لیے دیے گئے مسلم اکثریتی ممالک میں درست جواب مالدیپ ہے۔ یاد رکھیں: ایشیا اور مسلم اکثریتی ممالک میں سب سے چھوٹا مالدیپ ہے، جبکہ پوری دنیا کی سب سے چھوٹی خود مختار ریاست ویٹیکن سٹی ہے۔",
      source: {
        type: "book",
        label: "PPSC 110 Edition — page 1, question 1",
        referenceUrl: "https://mdvmission.gov.mv/un/articles/geography-19"
      },
      tags: ["countries", "area", "asia"]
    },
    {
      id: "GEO-0001",
      categoryId: "geography",
      question: "Which is the smallest sovereign state in the world by territory?",
      options: [
        {
          label: "A",
          text: "Monaco",
          rationaleUrdu: "موناکو دنیا کی دوسری سب سے چھوٹی خود مختار ریاست ہے، پہلی نہیں۔"
        },
        {
          label: "B",
          text: "Nauru",
          rationaleUrdu: "ناؤرو ایک بہت چھوٹی جزیرہ ریاست ہے، لیکن ویٹیکن سٹی سے بڑی ہے۔"
        },
        {
          label: "C",
          text: "Vatican City",
          rationaleUrdu: "ویٹیکن سٹی رقبے کے لحاظ سے دنیا کی سب سے چھوٹی خود مختار ریاست ہے۔"
        },
        {
          label: "D",
          text: "San Marino",
          rationaleUrdu: "سان مارینو ایک چھوٹی یورپی ریاست ہے، مگر اس کا رقبہ ویٹیکن سٹی سے زیادہ ہے۔"
        }
      ],
      correctOptionIndex: 2,
      explanationUrdu: "ویٹیکن سٹی رقبے کے لحاظ سے دنیا کی سب سے چھوٹی خود مختار ریاست ہے۔ اسے مالدیپ کے ساتھ خلط نہ کریں: مالدیپ ایشیا اور مسلم اکثریتی ممالک میں سب سے چھوٹا ہے، مگر پوری دنیا میں ویٹیکن سٹی سب سے چھوٹی ریاست ہے۔",
      source: {
        type: "practice",
        label: "Similar practice question",
        referenceUrl: "https://www.vaticanstate.va/en/state-and-government/history/vatican-city-today.html"
      },
      tags: ["countries", "area", "world"]
    }
  ];

  window.PPSC_QUIZ_DATA = {
    version: 1,
    categories: categories,
    questions: questions
  };

  // Convenient aliases for simple static pages and browser-console inspection.
  window.PPSC_CATEGORIES = categories;
  window.PPSC_QUESTIONS = questions;
})();
