# PPSC MCQ Preparation

A dependency-free, category-wise practice website for the PPSC General Ability test. It is designed for GitHub Pages and runs entirely in the browser.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 449 original, researched PPSC-style questions—one related question for every source MCQ.
- 898 website questions in total.
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- English question stems and four answer options. Urdu subject items keep essential Urdu test text under an English instruction.
- Urdu answer explanations, visible after either a correct or incorrect attempt.
- A Learn mode that reveals the correct answer, explanation and a short Urdu memory scene immediately.
- A direct research/evidence link and any necessary source correction note in the detail panel.

The flow is: choose a category → choose Learn or Quiz. Learn mode shows the answer, Urdu explanation and memory scene immediately; Quiz mode keeps option checking, feedback and scoring.

## Project structure

```text
ppsc-project/
├── .github/workflows/pages.yml  # GitHub Pages deployment
├── data/questions.js            # Generated browser question bank
├── tools/                       # Build and validation scripts
├── work/                        # Verified source/enrichment JSON
├── index.html                   # Website markup
├── styles.css                   # Responsive design
├── app.js                       # Quiz behaviour
└── README.md
```

`data/questions.js` and the Markdown banks in the parent folder are generated outputs. The verified JSON files under `work/` are the source of truth.

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
node tools/build-question-bank.js
node tools/validate-site-data.js --expected=898
node tools/browser-smoke.js
```

The browser smoke test requires local Chrome or Edge. It exercises both Learn and Quiz at mobile width, including mode selection, pre-revealed learning answers, memory scenes, wrong/correct quiz feedback, evidence links, Next, and completion.

The build script validates all six PDF papers, balances only the generated similar-question answer positions, and creates:

- `data/questions.js` with the complete website bank.
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
- Record the verification date as `source.accessedOn` in `YYYY-MM-DD` format.

After adding a pair, run the validation and build commands again. For a bank larger than 898, update the `--expected` value or omit that argument.

## Push this update

The repository is already initialized on branch `main`, with `origin` set to `https://github.com/abdulnafa/ppsc.git`.

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
git add .
git commit -m "Add complete researched PPSC MCQ bank"
git push
```

Do not save a GitHub password or personal access token in the project.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes the required site files, `data/questions.js`, and the two local font assets; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
