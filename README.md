# PPSC MCQ Preparation

A category-wise PPSC General Ability practice website for GitHub Pages. Question rendering stays in the browser, while Firebase Google Authentication and Cloud Firestore keep the approved user's study progress synchronized across devices.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 1,295 source-present MCQs extracted from `IBES CAPSULE Computer 2025`; 207 semantic repeats were excluded and 1,088 unique MCQs were retained. Printed Q254 is absent from the supplied scan and was not fabricated.
- Basic Computer Studies can be narrowed to **All Basic Computer** (2,554), the 1,088 retained **Initial PDF — Original MCQs**, the 1,088 generated **Initial PDF — Related Practice** questions, or 378 **Other Papers** questions (189 source + 189 related). The source choice also scopes Important counts, Difficult practice, Study Notes search/results, and Learn/Quiz range numbering; every filtered list keeps canonical data order and normal Quiz scoring. Other categories and the random Custom Paper flow remain unchanged.
- The current partial release of `Advanced PPSC MCQs Papers, Volume 2` contains 4,169 independently verified, retained source MCQs and 4,169 original researched related questions. Work on the remaining supplied scan continues in restart-safe batches; unresolved and unreviewed records are excluded from the website.
- **5,706 retained source MCQs + 5,706 original researched PPSC-style related questions = 11,412 website questions.**
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- Non-Urdu subjects show English question stems and options with a readable Urdu translation below each question. The Urdu category shows its question and all four answer choices directly in Urdu with right-to-left typography.
- A Learn mode that preselects and highlights the correct answer immediately.
- A Quiz mode with instant Correct/Incorrect feedback after an answer is submitted.
- A persistent spaced-retry queue now gives each newly answered category Quiz MCQ a confirmation cycle. A correct answer creates one required confirmation only when that MCQ is not already waiting; a wrong answer creates five reviews or adds exactly five to its existing count. A correct main Quiz answer never decrements, resets or duplicates an already queued item—the count changes only inside Review Queue practice. An always-visible header **Queue** button shows the total finite reviews remaining and opens dedicated all-subject practice from every protected screen; the category screen's larger **Review Queue** card shows the same unique-question and remaining-review totals. Dedicated practice continuously selects the waiting MCQ with the highest remaining count. Equal highest counts are shuffled, with the previous MCQ avoided when another equal-priority choice exists; a unique highest-count MCQ can repeat immediately until its count falls. Every exact count, active attempt and tie remainder survives refreshes and device changes.
- Every category Learn or Quiz session, including Difficult Learn/Quiz, can present due finite reviews from the full queue regardless of which category or Basic Computer source created them. A global randomized cadence leaves five or six newly completed main Learn/Quiz questions between finite review prompts; when several MCQs are due, the highest remaining-count due MCQ is selected first. Equal highest counts are shuffled and avoid the previous review when possible. Learn consumes pending reviews but never creates confirmation items. Custom Paper never inserts or automatically shows either finite or permanent reviews, although its header Queue button remains available.
- Separate **Permanent Important Practice** draws from Important MCQs across all categories—not just the category currently open—and appears after a saved random interval of 10–20 completed main Learn/Quiz questions. Its shuffled deck avoids an immediate repeat when another Important MCQ is available. Correct and wrong Important-practice answers both leave finite Review Queue questions and counts completely unchanged, so the Important pool never grows, finishes or disappears.
- Finishing a category Learn or Quiz session opens Results without forcing the retry queue to finish. Any remaining reviews stay saved for the dedicated **Review Queue** flow or a later Learn/Quiz session in any category; **Later** can postpone an embedded review without changing the main session's progress or score.
- A **Start Paper Here** flow builds a 100-MCQ paper from any selected combination of categories, using random questions and shuffled options.
- Custom papers award 1 mark per correct answer and deduct 0.25 per wrong answer; the final Correct and Wrong totals open filtered answer-review lists.
- Learn and Quiz open an inclusive **Starting question / Ending question** selector before the session begins. The default range covers the full active list, or you can enter any valid whole-number range such as 2–50.
- An evidence-based **Important repeated MCQs** filter uses verified deduplication records and displays how many times each marked fact occurred.
- Every one of the 11 categories has a **Study Notes** mode. Its Quick Notes list keeps the exact stable MCQ order and shows each question’s visible number, a short recall cue, the exact question, and its exact correct answer. Search and Important-only filtering cover the whole category, while notes render 100 at a time for low-end phones.
- Every category also has a separate **Detailed Learning** library with four to six structured reference lists. It expands the people, dates, places, organizations, formulas and other themes behind the MCQs into searchable topic panels, so the learner can prepare related facts that are not limited to the current question bank. Urdu-category lists remain in Urdu with right-to-left presentation.
- General Knowledge Quick Notes also offer **Detailed GK Stories**, the existing library that turns 708 fully evidenced GK pairs into connected Urdu fact cards. It supports search, nine topic filters and an Important-only view, while progressively rendering 40 cards at a time.
- Learn and category Quiz sessions always follow the stable selected-list source/data order. Quiz safely reshuffles ordinary answer choices without changing the correct answer. Questions whose choices refer to fixed labels such as “Both A and B” or “All of the above” retain their canonical A–D order so their meaning stays correct.
- Previous and Next navigation lets you revisit earlier questions; Quiz restores each pending or submitted answer, its feedback, shuffled options, and score without counting an answer twice.
- A compact Continue card restores the exact active Learn, Quiz, Difficult, or Custom Paper session after a refresh or browser restart, including its selected inclusive range, selected categories, progress, option order, answer history, submitted feedback, and score.
- A persistent, always-visible **Mark as difficult** checkbox below every question, plus category-wise Difficult Learn and Difficult Quiz sessions containing only marked questions.
- A focused question screen without Answer explained, View details, related-history or research-source panels.

The standard flow is: choose a category → for Basic Computer Studies optionally choose its question source → optionally limit it to **Important repeated MCQs** → choose Learn, Quiz, Difficult, Study Notes, or Detailed Learning. The separate **Review Queue** card beside the paper entry and the persistent header **Queue** button both start highest-count-first practice across every queued subject without first choosing a category. Learn and Quiz first show an inclusive Starting/Ending range; the range is applied after the source, Important, or Difficult filter, so 2–4 always means items 2, 3, and 4 of the active list. Blank, decimal, zero, reversed, and out-of-range values are rejected without replacing the current resumable session. Learn and Quiz keep the selected items in source/data order; Quiz may still shuffle ordinary answer choices and preserves the existing answer and scoring behaviour. Difficult opens its own Learn/Quiz choice and range selector using only marked questions from the selected source. **Start Quiz** after Learn and **Restart** retain the chosen range while the eligible list is unchanged; if Difficult marks change that list, the safe range chooser opens again instead of silently substituting questions. The editable question number above the progress bar still jumps within the active session. **Study Notes** opens the selected source's Quick Notes list for Basic Computer Studies and the complete category list elsewhere; General Knowledge additionally links to **Detailed GK Stories**. **Detailed Learning** opens the selected category's broader reference library with topic filters and a text search, without changing quiz progress or saved queue state. **Start Paper Here** remains a separate, random exact 100-question mixed paper and does not use the source or range selector.

Difficult marks, the compact active-session checkpoint, the finite spaced-retry queue, and the Permanent Important cadence/deck are saved locally first and synchronized to the approved user's private Cloud Firestore area after Google sign-in. They survive normal reloads and can continue on another signed-in device. Continue restores a Basic Computer session's exact source choice; older saved sessions safely migrate to **All Basic Computer**. Completed sessions are removed from Continue automatically, while unfinished finite reviews remain pending across reloads and visits and can be completed from the header **Queue**, the category-screen **Review Queue**, or during any later category Learn/Quiz session. In-flight finite and Permanent Important attempts restore safely. Learn never creates confirmation entries, and Custom Paper never auto-inserts or auto-opens either review type. Review answers never alter the current Learn/Quiz question number, visited/answer history, or score.

Existing saved retry counts are never reset during the first cloud migration. The correct-answer confirmation rule applies only to Quiz answers submitted after this release; old correct-answer history is not scanned or retroactively queued. The `+5` rule applies only when an MCQ is answered incorrectly in a new Quiz or finite queue review; a previously saved item continues from its exact stored remaining count.

If the internet disconnects while the unlocked app is open, Learn, Quiz, Difficult marks, and review-queue changes continue saving in browser storage and the header shows **Saved locally**. When the connection returns, the browser and cloud revisions are compared automatically: local-only changes upload, cloud-only changes restore, and changes made independently on both devices stop for an explicit conflict choice instead of overwriting either copy. A completely fresh offline load remains locked until Firebase can verify the Google account again; reconnect once to continue from the browser copy.

## Google sign-in and first-device migration

Production access is gated by Firebase Google Authentication and restricted to `developerabdulnafa@gmail.com` in both the client and `firestore.rules`. Local `file://`, `localhost`, and `127.0.0.1` previews intentionally use development mode so the offline browser tests still run.

The first cloud migration must be performed on the mobile browser that already contains the saved session and retry queue:

1. Deploy this release without clearing mobile browser data.
2. Open the existing `https://abdulnafa.github.io/ppsc/` address on that same mobile browser.
3. Sign in with the approved Google account.
4. Choose **Upload this device's progress**, then wait until the header says **Synced**.
5. Open the site on the laptop, sign in with the same account, and choose the cloud copy if a choice is shown.
6. Confirm Continue and the review count on both devices before clearing any browser data.

An empty new device cannot create or replace the first cloud copy. The first import must come from the browser that contains actual progress. If local and cloud records later differ, the gate remains closed until the user explicitly chooses which copy to keep; the copy being replaced is first retained in a local safety backup. The app automatically creates the required Firestore documents, so no collection needs to be entered manually in the Data tab.

The Firebase web configuration is public by design; access control comes from Authentication and the deployed Firestore rules. The login gate protects normal app access and Firestore progress, but GitHub Pages is static hosting, so its question-bank asset itself is still publicly downloadable. Protecting the static question files as private content would require a later move to authenticated server-side hosting.

## Project structure

```text
ppsc-project/
├── firebase-config.js            # Public Firebase web configuration
├── firebase-sync.js              # Google sign-in and progress synchronization
├── firestore.rules               # Owner-only Firestore access rules
├── .github/workflows/pages.yml  # GitHub Pages deployment
├── data/questions.js            # Generated browser question bank
├── data/gk-study-notes.js       # Generated, evidence-bound GK reading cards
├── data/detailed-learning.js     # Category-wide structured reference libraries
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

Detailed Learning is a separate, read-only reference layer rather than another MCQ mode. Its lists deliberately extend beyond facts already asked in the bank, keep related records together for easier recall, label time-sensitive material with an as-of/reverification date where needed, and do not write to local progress or Firestore.

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
node --check data/detailed-learning.js
node tools/validate-site-data.js --expected=11412 --verify-work-repeat-evidence
node tools/cloud-sync-smoke.js
node tools/browser-smoke.js
```

The strict repeat-evidence flag belongs to a deliberate question-bank rebuild, after the source validators and builder are clean. GitHub Pages deployment validates the committed question bank against its pinned, hashed release-evidence snapshot without coupling it to newer restart-safe work-in-progress decision files.

The browser smoke test requires local Chrome or Edge. It exercises all five category modes (Learn, Quiz, Difficult, Study Notes and Detailed Learning) plus Custom Paper at mobile width. Coverage includes exact inclusive range selection, invalid-range protection, Important/Difficult filtered ranges, Previous/Next answer restoration, stable Learn/category-Quiz question order, shuffled ordinary answer choices, answer remapping, random 100-question paper construction, negative marking, Correct/Wrong review lists, range-preserving Restart and **Start Quiz**, changed-Difficult-list protection, the persistent mark/unmark control, v8 Continue restoration, v7/v6 migration to the all-source scope, invalid/tampered-source recovery, corrupt/stale or tampered-pool storage recovery, and completed-session clearing. It pins all four Basic Computer source counts and labels, filtered Quick Notes search/order, Learn/Quiz/Important/Difficult range pools, unchanged answer scoring, persisted source selection, and cross-category/source retry continuity. It verifies correct Quiz `→ 1` confirmation, unchanged duplicate-main-correct counts, wrong confirmation `1 → 6`, Check-versus-Continue atomicity, exact legacy counts, five-or-six-question finite cadence, continuously recalculated highest-count priority, shuffled equal-count ties, and dedicated attempt restoration. It also verifies the all-category Permanent Important deck, inclusive 10–20 cadence, no immediate saved-deck repeat, correct/wrong queue-count invariance, and submitted-attempt restoration after reload. Custom Paper suppression, Learn non-creation, Urdu/position-dependent rendering, mobile focus/overflow, Quick Notes, Detailed GK Stories and Detailed Learning remain covered.

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
cd "D:\PPSC\codex\ppsc-project"
git add -- ".github/workflows/pages.yml" "README.md" "app.js" "index.html" "styles.css" "data/detailed-learning.js" "tools/browser-smoke.js" "tools/validate-site-data.js"
git commit -m "Add category detailed learning libraries"
git push origin main
git status --short
```

Always stage the named files only; do not use `git add .`, because unrelated local tools may be present. Do not save a GitHub password, personal access token, Google password, or Firebase service-account key in the project.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` validates the question bank, Detailed Learning library and cloud-sync migration contract, then publishes the required app, Firebase client, question data, both notes libraries, Detailed Learning data, and local font assets. Firestore rules are versioned in this repository but are published separately in the Firebase console; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
