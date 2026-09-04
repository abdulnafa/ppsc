# PPSC MCQ Preparation

A dependency-free, category-wise practice website for the PPSC General Ability test. It is designed for GitHub Pages and runs entirely in the browser.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 1,295 source-present MCQs extracted from `IBES CAPSULE Computer 2025`; 207 semantic repeats were excluded and 1,088 unique MCQs were retained. Printed Q254 is absent from the supplied scan and was not fabricated.
- The current partial release of `Advanced PPSC MCQs Papers, Volume 2` contains 4,169 independently verified, retained source MCQs and 4,169 original researched related questions. Work on the remaining supplied scan continues in restart-safe batches; unresolved and unreviewed records are excluded from the website.
- **5,706 retained source MCQs + 5,706 original researched PPSC-style related questions = 11,412 website questions.**
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- Non-Urdu subjects show English question stems and options with a readable Urdu translation below each question. The Urdu category shows its question and all four answer choices directly in Urdu with right-to-left typography.
- A Learn mode that preselects and highlights the correct answer immediately.
- A Quiz mode with instant Correct/Incorrect feedback after an answer is submitted.
- A **Start Paper Here** flow builds a 100-MCQ paper from any selected combination of categories, using random questions and shuffled options.
- Custom papers award 1 mark per correct answer and deduct 0.25 per wrong answer; the final Correct and Wrong totals open filtered answer-review lists.
- Learn and Quiz open an inclusive **Starting question / Ending question** selector before the session begins. The default range covers the full active list, or you can enter any valid whole-number range such as 2–50.
- An evidence-based **Important repeated MCQs** filter uses verified deduplication records and displays how many times each marked fact occurred.
- Every one of the 11 categories has a **Study Notes** mode. Its Quick Notes list keeps the exact stable MCQ order and shows each question’s visible number, a short recall cue, the exact question, and its exact correct answer. Search and Important-only filtering cover the whole category, while notes render 100 at a time for low-end phones.
- General Knowledge Quick Notes also offer **Detailed GK Stories**, the existing library that turns 708 fully evidenced GK pairs into connected Urdu fact cards. It supports search, nine topic filters and an Important-only view, while progressively rendering 40 cards at a time.
- Learn always follows the stable source/data order; Quiz creates a fresh question order and safely reshuffles ordinary options without changing the correct answer. Questions whose choices refer to fixed labels such as “Both A and B” or “All of the above” retain their canonical A–D order so their meaning stays correct.
- Previous and Next navigation lets you revisit earlier questions; Quiz restores each pending or submitted answer, its feedback, shuffled options, and score without counting an answer twice.
- A compact Continue card restores the exact active Learn, Quiz, Difficult, or Custom Paper session after a refresh or browser restart, including its selected inclusive range, selected categories, progress, option order, answer history, submitted feedback, and score.
- A persistent, always-visible **Mark as difficult** checkbox below every question, plus category-wise Difficult Learn and Difficult Quiz sessions containing only marked questions.
- A focused question screen without Answer explained, View details, related-history or research-source panels.

The standard flow is: choose a category → optionally limit it to **Important repeated MCQs** → choose Learn, Quiz, Difficult, or Study Notes. Learn and Quiz first show an inclusive Starting/Ending range; the range is applied after the Important or Difficult filter, so 2–4 always means items 2, 3, and 4 of the active list. Blank, decimal, zero, reversed, and out-of-range values are rejected without replacing the current resumable session. Learn keeps the selected items in source/data order; Quiz shuffles the same selected items and preserves the existing answer and scoring behaviour. Difficult opens its own Learn/Quiz choice and range selector using only marked questions. **Start Quiz** after Learn and **Restart** retain the chosen range while the eligible list is unchanged; if Difficult marks change that list, the safe range chooser opens again instead of silently substituting questions. The editable question number above the progress bar still jumps within the active session. **Study Notes** opens that category’s complete Quick Notes list, and General Knowledge additionally links to **Detailed GK Stories**. **Start Paper Here** remains a separate, exact 100-question mixed paper and does not use the range selector.

Difficult marks and the compact active-session checkpoint are stored in that browser and device using local storage. They survive normal reloads and visits; clearing the site's browser data removes them. Completed sessions are removed from Continue automatically.

## Project structure

```text
ppsc-project/
├── .github/workflows/pages.yml  # GitHub Pages deployment
├── data/questions.js            # Generated browser question bank
├── data/gk-study-notes.js       # Generated, evidence-bound GK reading cards
├── data/release-repeat-evidence.json # Pinned repeat evidence for that release
├── tools/                       # Build and validation scripts
├── work/                        # Verified source/enrichment JSON
├── index.html                   # Website markup
├── styles.css                   # Responsive design
├── app.js                       # Quiz behaviour
└── README.md
```

`data/questions.js`, `data/gk-study-notes.js`, `data/release-repeat-evidence.json`, and the Markdown banks in the parent folder are generated outputs. The verified enrichment JSON, `question-translations-ur*.json`, and `urdu-category-display-*.json` files under `work/` are the source of truth.

Quick Notes are rendered directly from the canonical question bank: every row preserves the question’s stable category order and displays the same answer selected by its canonical correct-option index. Urdu-category prompts and answers stay in Urdu with right-to-left typography. Quick Notes do not change quiz order, scoring, difficult marks, or resumable-session storage.

Detailed GK Stories do not generate new historical claims. Each card preserves the exact Urdu explanations, correct answers, sources, structured references and temporal scope of one verified General Knowledge source/similar pair. The strict release includes 708 pairs (1,416 questions); 18 older pairs (36 questions) remain available for MCQ practice and Quick Notes but are deliberately excluded from Detailed GK Stories until they receive the same two-reference and temporal metadata.

## Preview locally

The website has no package-install or build dependency. Inter and Noto Nastaliq Urdu are self-hosted in `assets/fonts/`, so the typography also works without a font CDN. Open `index.html` directly, or run:

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
Start-Process .\index.html
```

## Validate and rebuild

Run from the project folder:

```powershell
node tools/validate-extractions.js
node tools/validate-enriched.js
node tools/validate-ibes-verification.js --complete
node tools/validate-ibes-final.js --complete
node tools/audit-ibes-similar-duplicates.js
node tools/validate-adv2e102-extraction.js
node tools/validate-adv2e102-verification.js
node tools/validate-adv2e102-dedup.js
node tools/validate-adv2e102-enriched.js
node tools/build-question-bank.js
node tools/build-gk-study-notes.js
node tools/validate-site-data.js --expected=11412 --verify-work-repeat-evidence
node tools/browser-smoke.js
```

The strict repeat-evidence flag belongs to a deliberate question-bank rebuild, after the source validators and builder are clean. GitHub Pages deployment validates the committed question bank against its pinned, hashed release-evidence snapshot without coupling it to newer restart-safe work-in-progress decision files.

The browser smoke test requires local Chrome or Edge. It exercises all four category modes (Learn, Quiz, Difficult and Study Notes) plus Custom Paper at mobile width. Coverage includes exact inclusive range selection, invalid-range protection, Important/Difficult filtered ranges, Previous/Next answer restoration, stable Learn order, shuffled questions/options, answer remapping, 100-question paper construction, negative marking, Correct/Wrong review lists, range-preserving Restart and **Start Quiz**, changed-Difficult-list protection, the persistent mark/unmark control, v7 Continue restoration, v6 full-session migration, corrupt/stale or tampered-pool storage recovery, and completed-session clearing. It also covers all-category Quick Notes order and answers, visible stable question numbers, 100-row progressive loading, search, Clear, Important filtering, Urdu RTL rendering, mobile overflow, focus return, the nested Detailed GK Stories flow, and the guarantee that reading notes leaves local storage unchanged.

The question-bank build script validates all six `PPSC 110 Edition` papers, all 1,088 retained IBES pairs, and every currently retained ADV2E102 pair before including it. It balances only the generated similar-question answer positions and creates:

- `data/questions.js` with the complete website bank.
- `data/release-repeat-evidence.json` with the exact hashed decision evidence used by that release.
- `..\ppsc_mcqs.md` with all similar practice questions.
- Eleven category Markdown files in the parent folder.

The dedicated `tools/build-gk-study-notes.js` command then reads the committed question-bank asset and creates `data/gk-study-notes.js` with the strict 708-card library and its explicit 18-pair exclusion evidence.

The original PDF option order is never rearranged.

## Add future user-supplied MCQs

Add each new user question and its independently researched similar question as one adjacent pair in `work/custom-questions.json`. Use IDs such as `USR-Q0001-SRC` and `USR-Q0001-SIM`, with the shared `pairId` `USR-Q0001`.

Each pair must:

- Use an existing `categoryId`.
- Contain exactly four options and a zero-based `correctOptionIndex` (`0` = A through `3` = D).
- Use `kind: "source"` with `source.type: "user"` for the supplied MCQ.
- Use `kind: "similar"` with `source.type: "practice"` for the original related MCQ.
- Include a useful Urdu explanation and a direct researched `referenceUrl` for both items.
- Include a clear `questionUrdu` translation for both English question stems. If an item belongs to the Urdu category, also add its aligned four-choice Urdu display record so the website can render the complete MCQ in Urdu without changing its canonical answer index.
- Record the verification date as `source.accessedOn` in `YYYY-MM-DD` format.
- Be closely related and keep the paired question's explanation and evidence link verified in the research data.

Explanations, source notes and evidence links remain in the verified data for research and validation, but the website does not display per-question explanation, history or source-detail panels.

After adding a pair, run the validation and build commands again. For a bank larger than 11,412, update the `--expected` value or omit that argument.

## Push this update

The repository is already initialized on branch `main`, with `origin` set to `https://github.com/abdulnafa/ppsc.git`.

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
git add .
git commit -m "Publish first verified Advanced PPSC batch"
git push
```

Do not save a GitHub password or personal access token in the project.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes the required site files, `data/questions.js`, `data/gk-study-notes.js`, and the two local font assets; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
