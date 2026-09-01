# PPSC MCQ Preparation

A dependency-free, category-wise practice website for the PPSC General Ability test. It is designed for GitHub Pages and runs entirely in the browser.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 1,295 source-present MCQs extracted from `IBES CAPSULE Computer 2025`; 207 semantic repeats were excluded and 1,088 unique MCQs were retained. Printed Q254 is absent from the supplied scan and was not fabricated.
- The current partial release of `Advanced PPSC MCQs Papers, Volume 2` contains 4,169 independently verified, retained source MCQs and 4,169 original researched related questions. Work on the remaining supplied scan continues in restart-safe batches; unresolved and unreviewed records are excluded from the website.
- **5,706 retained source MCQs + 5,706 original researched PPSC-style related questions = 11,412 website questions.**
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- English question stems and four answer options, with a readable Urdu translation directly below every question.
- A Learn mode that preselects and highlights the correct answer immediately.
- A Quiz mode with instant Correct/Incorrect feedback after an answer is submitted.
- Every category is divided into fixed 50-question Parts (with a shorter final Part), while **All Questions** remains available.
- An evidence-based **Important repeated MCQs** filter uses verified deduplication records and displays how many times each marked fact occurred.
- Learn always follows the stable source/data order; Quiz creates a fresh question order and reshuffles its four options without changing the correct answer.
- Previous and Next navigation lets you revisit earlier questions; Quiz restores each pending or submitted answer, its feedback, shuffled options, and score without counting an answer twice.
- A compact Continue card restores the exact active Learn, Quiz, or Difficult session after a refresh or browser restart, including selected Part/Important scope, progress, Quiz option order, answer history, submitted feedback, and score.
- A persistent, always-visible **Mark as difficult** checkbox below every question, plus category-wise Difficult Learn and Difficult Quiz sessions containing only marked questions.
- A focused question screen without Answer explained, View details, related-history or research-source panels.

The flow is: choose a category → choose a 50-question Part (or All Questions) → optionally limit it to Important repeated MCQs → choose Learn, Quiz or Difficult. Difficult opens its own Learn/Quiz choice and uses only marked questions inside the selected Part/filter. Learn mode preselects the correct answer and keeps the source/data order. After a learning session, **Start Quiz** opens the same Part/filter and full or difficult-only scope in scored Quiz mode. Quiz gives instant Correct/Incorrect feedback, creates a fresh question and option order, and remaps the correct answer safely.

Difficult marks and the compact active-session checkpoint are stored in that browser and device using local storage. They survive normal reloads and visits; clearing the site's browser data removes them. Completed sessions are removed from Continue automatically.

## Project structure

```text
ppsc-project/
├── .github/workflows/pages.yml  # GitHub Pages deployment
├── data/questions.js            # Generated browser question bank
├── data/release-repeat-evidence.json # Pinned repeat evidence for that release
├── tools/                       # Build and validation scripts
├── work/                        # Verified source/enrichment JSON
├── index.html                   # Website markup
├── styles.css                   # Responsive design
├── app.js                       # Quiz behaviour
└── README.md
```

`data/questions.js`, `data/release-repeat-evidence.json`, and the Markdown banks in the parent folder are generated outputs. The verified enrichment JSON and `question-translations-ur*.json` files under `work/` are the source of truth.

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
node tools/validate-site-data.js --expected=11412 --verify-work-repeat-evidence
node tools/browser-smoke.js
```

The strict repeat-evidence flag belongs to a deliberate question-bank rebuild, after the source validators and builder are clean. GitHub Pages deployment validates the committed question bank against its pinned, hashed release-evidence snapshot without coupling it to newer restart-safe work-in-progress decision files.

The browser smoke test requires local Chrome or Edge. It exercises Learn, Quiz and Difficult practice at mobile width, including Previous/Next answer restoration, stable Learn order, shuffled Quiz questions/options, answer remapping, the Learn-complete **Start Quiz** transition, the always-visible persistent mark/unmark control, and exact Continue restoration for answer history, pending selections, submitted feedback, score, Difficult scope, corrupt/stale storage recovery, and completed-session clearing.

The build script validates all six `PPSC 110 Edition` papers, all 1,088 retained IBES pairs, and every currently retained ADV2E102 pair before including it. It balances only the generated similar-question answer positions and creates:

- `data/questions.js` with the complete website bank.
- `data/release-repeat-evidence.json` with the exact hashed decision evidence used by that release.
- `..\ppsc_mcqs.md` with all similar practice questions.
- Eleven category Markdown files in the parent folder.

The original PDF option order is never rearranged.

## Add future user-supplied MCQs

Add each new user question and its independently researched similar question as one adjacent pair in `work/custom-questions.json`. Use IDs such as `USR-Q0001-SRC` and `USR-Q0001-SIM`, with the shared `pairId` `USR-Q0001`.

Each pair must:

- Use an existing `categoryId`.
- Contain exactly four options and a zero-based `correctOptionIndex` (`0` = A through `3` = D).
- Use `kind: "source"` with `source.type: "user"` for the supplied MCQ.
- Use `kind: "similar"` with `source.type: "practice"` for the original related MCQ.
- Include a useful Urdu explanation and a direct researched `referenceUrl` for both items.
- Include a clear `questionUrdu` translation for both English question stems; the four options remain in English.
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

The workflow at `.github/workflows/pages.yml` publishes the required site files, `data/questions.js`, and the two local font assets; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
