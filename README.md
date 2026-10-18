# PPSC MCQ Preparation

A category-wise PPSC General Ability practice website for GitHub Pages. Question rendering stays in the browser, while Firebase Google Authentication and Cloud Firestore keep the approved user's study progress synchronized across devices.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 1,295 source-present MCQs extracted from `IBES CAPSULE Computer 2025`; 207 semantic repeats were excluded and 1,088 unique MCQs were retained. Printed Q254 is absent from the supplied scan and was not fabricated.
- Basic Computer Studies can be narrowed to **All Basic Computer** (2,564), the 1,088 retained **Initial PDF — Original MCQs**, the 1,088 generated **Initial PDF — Related Practice** questions, or 388 **Other Papers** questions (194 source + 194 related, including the WGI additions). The source choice also scopes Important counts, Difficult practice, Study Notes search/results, and Learn/Quiz range numbering; every filtered list keeps canonical data order and normal Quiz scoring. Other categories and the random Custom Paper flow remain unchanged.
- The current partial release of `Advanced PPSC MCQs Papers, Volume 2` contains 4,169 independently verified, retained source MCQs and 4,169 original researched related questions. Work on the remaining supplied scan continues in restart-safe batches; unresolved and unreviewed records are excluded from the website.
- **5,946 retained source MCQs + 5,946 original researched PPSC-style related questions = 11,892 website questions.**
- The current WGI release covers source items **1–450**. All 450 items have a verified keep, duplicate-skip, or reject decision; 240 retained source items contribute 240 independently researched related questions, for 480 website MCQs. The supplied PDF's full **671-item extraction and audit** remain intact for later work; items 451–671 are not part of this release.
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- Non-Urdu subjects show English question stems and options with a readable Urdu translation below each question. The Urdu category shows its question and all four answer choices directly in Urdu with right-to-left typography.
- An accessible Light/Dark appearance control is available on both the Google sign-in screen and the protected app header. The selected theme is applied before the page paints, stays saved in that browser, follows the device colour preference until a choice is made, and keeps all notes, forms, quiz states, dialogs and result panels readable.
- A two-stage Learn mode that starts every answer unmarked. **Show Answer**, Space, Enter or Right Arrow reveals and highlights the correct option without moving; the next activation advances. Hidden/revealed state survives Continue, refresh and device sync, while previously revealed questions stay revealed when revisited.
- A keyboard-ready Quiz mode with instant Correct/Incorrect feedback: arrow keys select an option, Enter checks it, and after feedback Space, Enter or Right Arrow continues. The same controls work in category Queue practice and the finite Queue/Permanent Important review popups.
- A persistent spaced-retry queue gives each newly answered category Quiz MCQ a confirmation cycle. The earlier one-time five-review baseline is kept only as saved-state history; this change does not reset existing entries or their counts. A correct Queue review removes one remaining repetition; a wrong answer adds two. A correct main Quiz answer never decrements, resets, or duplicates an already queued item—the count changes only in Queue practice. The former all-subject header button, all-subject category card, and 3 / 5 / 10 repeat-gap control are removed. Each category has its own **Queue** option that opens a full question screen, like Quiz, rather than a popup. The Queue remains one offline-first saved record shared across categories, so mobile/laptop sync retains the existing counts and in-flight review.
- Every category Learn or Quiz session, including Difficult Learn/Quiz, presents only two popup types: finite Queue and Permanent Important reviews from that category. The in-session Queue chip also counts only that category. Basic Computer source choices share one Basic Computer Queue. One saved clock alternates the popup types after every ten regular Learn/Quiz MCQs: Queue at 10, Important at 20, Queue at 30, Important at 40, and so on. Popup answers do not count toward this clock. Each opening consumes only its own turn; the other type waits for ten more regular MCQs. If the scheduled type has no questions in the active category, that turn is skipped without substituting a different popup. Queue follows saved insertion order: each question gets one turn per round before any remaining repetitions repeat, and a wrong answer's extra two repetitions wait for a later round. Counts and legacy cooldown dates cannot move a question ahead of the next pending turn. Learn consumes pending reviews but never creates confirmation items. Custom Paper never inserts or automatically shows either review lane.
- **Permanent Important Practice** draws only from Important MCQs in the category currently being learned or quizzed. Each category keeps its own shuffled Important entries within the saved deck, avoiding an immediate repeat when another eligible MCQ is available. Correct and wrong Important-practice answers both leave finite Review Queue questions and counts unchanged. In both popup types, a correct answer followed by **Next MCQ** continues to another question of the same type; a wrong answer followed by **Continue** returns to the regular Learn/Quiz session. A finite Queue chain ends when that category has no reviews left. The former Global Sequential popup is retired; existing finite Queue and Important progress is preserved.
- Finishing a category Learn or Quiz session opens Results without forcing the finite retry queue or Permanent Important lane to finish. If its final regular question reaches a popup checkpoint, that turn is consumed without opening a popup. Any remaining finite reviews stay saved for that category's full-screen **Queue** mode or a later Learn/Quiz session; **Later** can postpone an embedded finite or Important review without changing the main session's progress or score. Correct-answer chains, wrong answers, **Later**, and full-screen Queue practice do not move the next alternating popup checkpoint.
- A **Start Paper Here** flow builds a 100-MCQ paper from any selected combination of categories, using random questions and shuffled options.
- Custom papers award 1 mark per correct answer and deduct 0.25 per wrong answer; the final Correct and Wrong totals open filtered answer-review lists.
- Learn and Quiz open an inclusive **Starting question / Ending question** selector before the session begins. The default range covers the full active list, or you can enter any valid whole-number range such as 2–50.
- An evidence-based **Important repeated MCQs** filter uses verified deduplication records and displays how many times each marked fact occurred.
- Every one of the 11 categories has a **Study Notes** mode. Its Quick Notes list keeps the exact stable MCQ order and shows each question’s visible number, a short recall cue, the exact question, and its exact correct answer. Search and Important-only filtering cover the whole category, while notes render 100 at a time for low-end phones.
- Every category also has a separate **Detailed Learning** library with four to six structured reference lists. It expands the people, dates, places, organizations, formulas and other themes behind the MCQs into searchable topic panels, so the learner can prepare related facts that are not limited to the current question bank. Urdu-category lists remain in Urdu with right-to-left presentation.
- General Knowledge Quick Notes also offer **Detailed GK Stories**, the existing library that turns 776 fully evidenced GK pairs into connected Urdu fact cards. It supports search, nine topic filters and an Important-only view, while progressively rendering 40 cards at a time.
- Learn and category Quiz sessions always follow the stable selected-list source/data order. Quiz safely reshuffles ordinary answer choices without changing the correct answer. Questions whose choices refer to fixed labels such as “Both A and B” or “All of the above” retain their canonical A–D order so their meaning stays correct.
- Previous and Next navigation lets you revisit earlier questions; Quiz restores each pending or submitted answer, its feedback, shuffled options, and score without counting an answer twice.
- A compact Continue card restores the exact active Learn, Quiz, Difficult, or Custom Paper session after a refresh or browser restart, including its selected inclusive range, selected categories, progress, option order, answer history, submitted feedback, and score.
- A persistent, always-visible **Mark as difficult** checkbox below every question, plus category-wise Difficult Learn and Difficult Quiz sessions containing only marked questions.
- A focused question screen without Answer explained, View details, related-history or research-source panels.

The standard flow is: choose a category → for Basic Computer Studies optionally choose its question source → optionally limit it to **Important repeated MCQs** → choose Learn, Quiz, Queue, Difficult, Study Notes, or Detailed Learning. **Queue** opens that category's saved reviews on a full question screen; it does not combine other categories or open a review popup. Its question turns follow saved first-added order and cycle through the category before repeating remaining turns. Learn and Quiz first show an inclusive Starting/Ending range; the range is applied after the source, Important, or Difficult filter, so 2–4 always means items 2, 3, and 4 of the active list. Blank, decimal, zero, reversed, and out-of-range values are rejected without replacing the current resumable session. Learn and Quiz keep the selected items in source/data order; Quiz may still shuffle ordinary answer choices and preserves the existing answer and scoring behaviour. Difficult opens its own Learn/Quiz choice and range selector using only marked questions from the selected source. **Start Quiz** after Learn and **Restart** retain the chosen range while the eligible list is unchanged; if Difficult marks change that list, the safe range chooser opens again instead of silently substituting questions. The editable question number above the progress bar still jumps within the active session. **Study Notes** opens the selected source's Quick Notes list for Basic Computer Studies and the complete category list elsewhere; General Knowledge additionally links to **Detailed GK Stories**. **Detailed Learning** opens the selected category's broader reference library with topic filters and a text search, without changing quiz progress or saved queue state. **Start Paper Here** remains a separate, random exact 100-question mixed paper and does not use the source or range selector.

Difficult marks, the compact active-session checkpoint, the finite spaced-retry queue, and Permanent Important cadence/deck are saved locally first and synchronized to the approved user's private Cloud Firestore area after Google sign-in. They survive normal reloads and can continue on another signed-in device. Continue restores a Basic Computer session's exact source choice; older saved sessions safely migrate to **All Basic Computer**. Completed sessions are removed from Continue automatically, while unfinished finite reviews remain pending across reloads and visits and can be completed from the relevant category's **Queue** mode or during a later Learn/Quiz session in that category. In-flight finite and Permanent Important popup attempts restore safely in their own category; a manual Queue answer likewise remains saved. An old in-flight Sequential attempt is dismissed without adding or removing Queue reviews. Learn never creates confirmation entries, and Custom Paper never auto-inserts or auto-opens review practice. Review answers never alter the current Learn/Quiz question number, visited/answer history, or score.

Question-bank changes use fail-closed migration. A save from the approved 11,412-question release is accepted only behind an exact prefix fingerprint. The 2026-10-18 release additionally approves seven same-slot answer-text corrections from the previous 11,892-question bank: correct "None of these" answers now name Sir Cyril Radcliffe, 1919, Talib Ansari, nasal (supraorbital) salt glands, the fourth rubai line, Al-Baqarah and 1914. Urdu display answers and explanations are updated too. The correct indices, IDs, question order and counts do not change. Genuine "None" meaning zero and incorrect distractors remain untouched. Original PDF extractions and the historical WGI audit remain intact; validators reconstruct only these seven explicit replacements before comparing the original baseline fingerprint.

Active Learn/Quiz/Paper question IDs, range, answers, score and current position stay frozen, so new MCQs are not injected into practice already in progress. A validated frozen-pool origin is retained across subsequent saves/reloads; older already-migrated pools are recovered only when they exactly match an approved prefix. Historical Important-only selections additionally use pinned category/source-specific pool fingerprints, because WGI repeat evidence marked some existing questions Important after that older release. Finite Queue counts, pending answers, Important timing and saved round/deck entries are preserved. Retired Sequential cursor fields remain readable for legacy compatibility, but no longer open popups. Rewritten current-bank snapshots are saved locally and sent through the normal cloud-sync notification path. Unknown signatures and unapproved changes inside protected prefixes remain rejected.

The finite Queue count baseline was a one-time earlier migration: each item present then was set to exactly 5, and a saved version marker prevents future refreshes or devices from applying that reset again. This release preserves every current question ID and remaining count. The cadence-version-4 migration creates one alternating checkpoint ten regular MCQs after the saved practice position, once only. Queue is first unless an embedded popup is already in progress; that popup and its answer are preserved, and the next scheduled type is the opposite one. Saved round positions and category decks remain intact. The checkpoint and next type survive refresh and cloud restore; missing new clock fields are repaired even if an older client retained the version marker. Legacy individual clocks remain compatibility mirrors, while repeat-gap, cooldown and recent-question fields stay readable without determining popup timing or Queue order. New wrong Quiz or finite Queue answers add 2 and each correct Queue review removes 1. A checked review saved under the old `+5` rule keeps that pending atomic outcome after refresh.

If the internet disconnects while the unlocked app is open, Learn, Quiz, Difficult marks, category Queue changes and Important practice continue saving in browser storage and the header shows **Saved locally**. When the connection returns, the browser and cloud revisions are compared automatically: local-only changes upload, cloud-only changes restore, and changes made independently on both devices stop for an explicit conflict choice instead of overwriting either copy. A completely fresh offline load remains locked until Firebase can verify the Google account again; reconnect once to continue from the browser copy.

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

Detailed GK Stories do not generate new historical claims. Each card preserves the exact Urdu explanations, correct answers, sources, structured references and temporal scope of one verified General Knowledge source/similar pair. The strict release includes 776 pairs (1,552 questions); 18 older pairs (36 questions) remain available for MCQ practice and Quick Notes but are deliberately excluded from Detailed GK Stories until they receive the same two-reference and temporal metadata.

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
node tools/validate-wgi.js --complete
node tools/build-question-bank.js
node tools/build-gk-study-notes.js
node --check data/detailed-learning.js
node tools/validate-site-data.js --expected=11892 --verify-work-repeat-evidence
node tools/answer-text-migration-smoke.js
node tools/cloud-sync-smoke.js
node tools/browser-smoke.js
```

The strict repeat-evidence flag belongs to a deliberate question-bank rebuild, after the source validators and builder are clean. GitHub Pages deployment validates the committed question bank against its pinned, hashed release-evidence snapshot without coupling it to newer restart-safe work-in-progress decision files.

The browser smoke test requires local Chrome or Edge. It covers category Learn, Quiz, Queue, Difficult, Study Notes and Detailed Learning, plus Custom Paper on desktop and mobile. Existing coverage checks inclusive ranges, answers and score restoration, question/option ordering, the 100-question paper and negative marking, Basic Computer source partitions, Urdu rendering, keyboard controls, notes, and safe Continue/cloud-sync migrations. Queue coverage checks that the old all-subject controls are absent, each category opens only its own full-screen Queue, embedded Queue and Important popups remain category-only, and the retired Sequential popup stays off. It checks alternating ten-regular-MCQ checkpoints, skipped empty and result-boundary turns, insertion-order Queue rounds, correct-answer popup chains, wrong-answer return, +2 wrong / −1 correct Queue counts, atomic Check-versus-Continue saves, and preservation of unrelated categories' reviews across reloads. Legacy Queue state fields and counts remain compatible with offline-first cloud sync.

The question-bank build script validates all six `PPSC 110 Edition` papers, all 1,088 retained IBES pairs, and every currently retained ADV2E102 pair before including it. It balances only the generated similar-question answer positions and creates:

- `data/questions.js` with the complete website bank.
- `data/release-repeat-evidence.json` with the exact hashed decision evidence used by that release.
- `..\ppsc_mcqs.md` with all similar practice questions.
- Eleven category Markdown files in the parent folder.

The dedicated `tools/build-gk-study-notes.js` command then reads the committed question-bank asset and creates `data/gk-study-notes.js` with the strict 776-card library and its explicit 18-pair exclusion evidence.

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
git add -- "README.md" "app.js" "firebase-sync.js" "index.html" "tools/browser-smoke.js" "tools/cloud-sync-smoke.js" "tools/validate-site-data.js"
git commit -m "Rotate global MCQs across categories"
git push origin main
git status --short
```

Always stage the named files only; do not use `git add .`, because unrelated local tools may be present. Do not save a GitHub password, personal access token, Google password, or Firebase service-account key in the project.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` validates the question bank, Detailed Learning library and cloud-sync migration contract, then publishes the required app, Firebase client, question data, both notes libraries, Detailed Learning data, and local font assets. Firestore rules are versioned in this repository but are published separately in the Firebase console; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
