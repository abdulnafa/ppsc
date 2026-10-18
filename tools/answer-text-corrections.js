"use strict";

// Reviewed 2026-10-18. Only option D's wording changes; IDs, stems, order and
// correct indices stay fixed. Original extraction and WGI baseline audits stay
// untouched. Keep this explicit list so historical hash checks remain strict.
const corrections = [
  { id: "ADV2E102-U0003-Q015-SRC", answer: "Sir Cyril Radcliffe" },
  { id: "ADV2E102-U0036-Q036-SRC", answer: "1919" },
  { id: "ADV2E102-U0043-Q089-SRC", answer: "Talib Ansari", answerUrdu: "طالب انصاری" },
  { id: "ADV2E102-U0045-Q056-SRC", answer: "Nasal (supraorbital) salt glands" },
  { id: "ADV2E102-U0045-Q081-SRC", answer: "چوتھے مصرعے کو", answerUrdu: "چوتھے مصرعے کو", oldAnswer: "ان میں سے کوئی نہیں" },
  { id: "ADV2E102-U0045-Q098-SRC", answer: "Al-Baqarah" },
  { id: "ADV2E102-U0131-Q003-SRC", answer: "1914" }
];

function isNoneOfTheseAnswer(option) {
  const text = String(option && typeof option === "object" ? option.text : option || "")
    .normalize("NFKC").replace(/[.'"،۔!?؟()]/g, "").replace(/\s+/g, " ").trim();
  return /^(?:none|non) of (?:the )?(?:these|above|below|them|following)(?: (?:options|answers|choices))?$/i.test(text)
    || /^(?:ان|مندرجہ بالا|مذکورہ بالا) میں سے کوئی نہیں$/u.test(text);
}

function restoreLegacyAnswerOptions(questions) {
  const byId = new Map(corrections.map((correction) => [correction.id, correction]));
  const seen = new Set();
  const restored = questions.map((question) => {
    const correction = byId.get(question.id);
    if (!correction) return question;
    if (seen.has(question.id) || question.correctOptionIndex !== 3
      || !Array.isArray(question.options) || question.options.length !== 4
      || question.options[3] !== correction.answer
      || (correction.answerUrdu && (!Array.isArray(question.optionsUrdu)
        || question.optionsUrdu[3] !== correction.answerUrdu))) {
      throw new Error(`${question.id}: explicit-answer correction differs from the reviewed same-slot edit`);
    }
    seen.add(question.id);
    const copy = { ...question, options: question.options.slice() };
    copy.options[3] = correction.oldAnswer || "None of these";
    if (correction.answerUrdu) {
      copy.optionsUrdu = question.optionsUrdu.slice();
      copy.optionsUrdu[3] = "ان میں سے کوئی نہیں";
    }
    return copy;
  });
  if (seen.size !== corrections.length) throw new Error("Explicit-answer correction baseline is missing a reviewed question");
  return restored;
}

module.exports = { corrections, isNoneOfTheseAnswer, restoreLegacyAnswerOptions };
