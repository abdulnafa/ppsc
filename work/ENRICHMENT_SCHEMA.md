# Enriched question batch schema

Each `enriched-paper-NNN.json` file is a UTF-8 JSON array. It contains exactly two website questions for every source MCQ: the verified source question and one original similar practice question.

```json
{
  "id": "P234-Q001-SRC",
  "pairId": "P234-Q001",
  "kind": "source",
  "categoryId": "general-knowledge",
  "question": "English question text",
  "options": ["A text", "B text", "C text", "D text"],
  "correctOptionIndex": 2,
  "explanationUrdu": "مختصر مگر مکمل اردو وضاحت۔",
  "source": {
    "type": "book",
    "label": "PPSC 110 Edition — Paper 234, Q1, PDF p.1",
    "referenceUrl": "https://authoritative.example/page",
    "accessedOn": "2026-08-22"
  },
  "tags": ["topic"],
  "verificationStatus": "verified",
  "sourceNotes": "Optional transcription or outdated-answer note"
}
```

The paired practice item uses the same `pairId`, `kind: "similar"`, an ID ending in `-SIM`, and `source.type: "practice"`. Its wording and four-option set must be original, while its fact or rule must be independently verifiable.

Allowed category IDs:

- `general-knowledge`
- `pakistan-studies`
- `current-affairs`
- `islamic-studies`
- `geography`
- `basic-mathematics`
- `english`
- `urdu`
- `everyday-science`
- `basic-computer-studies`
- `job-related-finance-taxation`

Quality rules:

- Keep questions and options in English. For Urdu-language testing, use an English instruction with the essential Urdu word, phrase, proverb, or options preserved in Urdu script where translation would destroy the skill being tested.
- Keep exactly four non-empty options and a zero-based correct index.
- If the scan itself has fewer than four visible options, add plausible distractors for the website and disclose this in `sourceNotes`.
- Do not silently endorse a demonstrably incorrect or outdated printed key. Explain the conflict and use the verified answer for scoring.
- Current-affairs explanations must state the relevant date/context when the answer can change.
- `referenceUrl` must be a real authoritative or reputable page used to verify the explanation, not a search-results URL.
- Urdu explanations should normally be 2–4 useful sentences. Option-by-option rationales are optional.
