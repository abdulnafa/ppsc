# PPSC MCQ Preparation

A category-wise PPSC General Ability practice website for GitHub Pages. Question rendering stays in the browser, while Firebase Google Authentication and Cloud Firestore keep the approved user's study progress synchronized across devices.

## Study Tools

The categories page has one **Study Tools** accordion, initially collapsed. Open it to find **Start Paper Here**, **Years Wise Topics**, **Pakistan Dams & Rivers**, **Pakistan Provinces**, **Oceans & Seas**, **Pakistan Constitution Articles**, **Prime Ministers**, **Presidents**, **Organizations** and **World MCQ Map**, each with a short description. The eleven subject categories remain outside the box. The accordion supports mouse, touch, Enter and Space; returning from a tool keeps it open during that visit. New cross-category tools should be added inside `#study-tools-options` rather than as standalone homepage cards. This layout does not change practice, guest/login behavior or saved progress.

## Per-category Preview & Continue

Each category now shows a **Preview & Continue** panel for its unfinished sessions, and the home category card shows that saves exist. Learn and Quiz are saved independently; Important, Difficult, Wrong Quiz and Basic Computer source selections have distinct saves too. Each mode/filter combination retains its latest inclusive range. Preview displays the saved question and progress without revealing its answer or altering score/queue; Continue restores the exact range, question position, shuffled choices, checked/unchecked answers and Learn reveal state. Starting a new range deliberately replaces only that same combination. Completing one session removes only that save, not other categories/modes.

`ppsc-prep:category-sessions:v1` stores the archive alongside the existing active-session slot, so the homepage Continue still works as before. The existing active save is copied on upgrade; sessions already overwritten before this feature cannot be recovered. Signed-in archives use the same offline/cloud conflict protection and guest archives stay in the separate guest namespace. Older three-slot cloud backups remain compatible; a missing archive is not treated as a deletion, while an explicit empty archive represents completed work. Invalid archives are preserved without silently overwriting them. If browser storage is full/unavailable, the panel warns that new category saves are only in memory.

## Current Affairs supplement — 21 October 2026

The subsequent **October-news batch adds 20 MCQs (10 distinct related pairs)** about confirmed announcements/events in **1–21 October 2026**: Current Affairs **650 → 670**, total bank **11,932 → 11,952**. Its sources are `work/current-affairs-october-2026-pakistan.json` and `work/current-affairs-october-2026-world.json`, with duplicate/source review in `work/current-affairs-october-2026-audit.json`. This is a selected important-news batch, not exhaustive coverage of the month. Each answer has independent corroboration, explicit event dates and Urdu translation/explanation. Research topics include Pakistan's UN/IMF/IAEA developments and the October Nobel announcements. Conditional IMF funding and the incoming 2027 chairmanship are not described as completed disbursements or an already-started term.

The complete **11,932-question published prefix** is additionally SHA-256 pinned, including the earlier 40-question supplement. An ongoing Current Affairs session retains its original 650-question eligible pool, selected range, current question, options, answers and score; Queue/Important cadence, counts and archived sessions remain unchanged. The new items are Current Affairs positions **651–670** in new full-range/range-selected sessions. `node tools/category-progress-browser-smoke.js --baseline=11932` exercises an actual before/after bank refresh near the old category's end, with desktop/mobile screenshots. No New/Unread tab is introduced by this batch.

The newspaper-source audit is recorded in the parent workspace's `project_context.md` (outside this Git repository). Dawn was the most frequently referenced newspaper among the earlier 650 MCQs, but verification links do not establish which newspapers PPSC paper setters used.

### Earlier supplement (retained unchanged)

40 newly researched, date-qualified MCQs (20 distinct related pairs) are appended to the bank: **Current Affairs 610 → 650; total 11,892 → 11,932**. The source is `work/current-affairs-20261021.json`; matching/review scope is recorded in `work/current-affairs-20261021-audit.json`. Each new answer has at least two named authoritative references, Urdu question text and explanation. This is a bounded addition, not a claim that every historical Current Affairs answer has been reverified for today. Historical date-qualified questions keep their original context.

The complete original 11,892 objects, order and Important/repeat evidence are protected by a pinned SHA-256. No existing MCQ was rewritten or renumbered. New sessions and Quick Notes can include the additions; an ongoing session keeps its original question pool, answers and position. Existing Queue counts are preserved; after a one-time round-order shuffle, the pending order is saved across reloads. New questions are not falsely labelled repeated/Important without evidence. `node tools/current-affairs-smoke.js` checks this contract; `node tools/category-progress-smoke.js` tests all 22 category/mode combinations and the append-only save migration. `node tools/category-progress-browser-smoke.js` exercises the actual preview, resume, completion, guest and responsive UI flows.

## Presidents

The **Presidents** reading tool contains 45 names: 13 Pakistan Presidents, 2 acting-only office-holders during vacancies, and 30 selected foreign Presidents across 17 countries. It includes 58 primary/official sources, checked on 21 October 2026. Repeat terms belong to one person, not duplicate person counts. A regular President's initial acting phase is explained inside that person's entry; the acting list is not a list of every temporary substitute during foreign visits. Governor-General and Prime Minister offices are distinguished from President. Source differences, oath versus election dates, year-only precision and date-qualified current offices are explicitly explained.

`prime-ministers.js` now provides isolated Presidents and Prime Ministers instances: filters, loaded data, references and open names remain independent. The Presidents bundle loads only when its card opens. This is read-only study content, with no canonical question, scoring, queue, session, popup, guest/login or cloud changes.

Author sources in `data/pakistan-presidents.json` and `data/world-presidents.json`, then run `node tools/build-presidents.js`. Use `--check` for deterministic output, schema/date/source/canonical-ID checks and deployment coverage. `node tools/presidents-browser-smoke.js` checks Home → Study Tools → Presidents → Back → Continue, filters, lazy-load retry, native keyboard, responsive/dark rendering, guest isolation and independent Prime Ministers state. Editorial source review is still required when updating facts.

## Prime Ministers

The read-only **Prime Ministers** tool includes **20 regular Pakistani PMs**, **8 caretakers**, and **27 selected foreign PMs across 13 countries**, with 67 reference sources checked on 21 October 2026. Pakistan entries follow first appointment, grouping a person's repeat tenures under one name; this is not official prime-minister numbering. Dates remain visible before expanding the Roman Urdu summary, exam facts and sources. World entries are selected historical/MCQ-related figures plus clearly identified broader revision facts, not an exhaustive or live list of every country's current leader. Current tenures are date-qualified; source differences and election-versus-oath dates are noted explicitly. Year-only ranges retain the source's precision.

Search names, countries, years and facts, filter the three sections, or close all entries. `prime-ministers.js` loads `data/prime-ministers.js` only on opening the tool and renders facts on expansion. It never writes quiz, queue, learning, guest/owner storage or cloud state, and adds no new quiz questions or popups.

Author content in `data/pakistan-prime-ministers.json` and `data/world-prime-ministers.json`. Run `node tools/build-prime-ministers.js` to generate the bundle, or `node tools/build-prime-ministers.js --check` to check deterministic output, dates, sources, canonical MCQ links and deployment coverage. `node tools/prime-ministers-browser-smoke.js` checks the full Home → Study Tools → Prime Ministers → Back → Continue flow, lazy-load retry, filters/search, keyboard, mobile/dark mode, guest isolation and unchanged saved practice. Automated validation does not replace editorial source checking.

## Pakistan Constitution Articles

This read-only library groups **102 existing MCQ references into 35 topics** by Article and subject: State/language/definitions, fundamental rights, Parliament/institutions, courts/judiciary and historical provisions. Expand a topic to read its short Roman Urdu summary, canonical question/answer, original category/MCQ number, source context and official references. Plain numbers or `Article 25` search exact Article numbers (not 251); text searches include question and correct-answer text. Historical provisions, especially the 1956 Constitution and pre-2025 court jurisdiction, are explicitly labelled instead of presented as current law. The library is selected exam revision, not a complete Constitution or legal advice.

The shared read-only renderer in `water-topics.js` creates separate Water and Articles instances: filters, loaded bundles and open accordions never leak between them. `data/pakistan-articles-topics.js` is fetched only when Articles opens; unopened bodies are lazy-rendered. Neither library writes progress or changes questions, queues, scores, popups, guest/login or cloud behavior.

Author content in `data/pakistan-articles-foundations.json` and `data/pakistan-articles-institutions.json`; run `node tools/build-pakistan-articles-topics.js` to regenerate or add `--check` for deterministic data, ID/source/schema checks and deployment coverage. Summaries use official constitutional texts with historical qualifications; original canonical wording is preserved with visible notes where needed, including Article 25(2)'s older wording. `node tools/articles-topics-browser-smoke.js` verifies the rendered question/answer mapping, article search, filters, separate Water/Articles state, retry, keyboard, responsive layouts, guest access and saved-progress preservation.

## Pakistan Dams & Rivers

The read-only water library groups **116 existing MCQ references into 43 topics**: dams/reservoirs, rivers/water geography, barrages/headworks/canals, and water treaties/institutions. Search by topic, question or answer; filter by section; open a topic to read a short Roman Urdu introduction, canonical questions and correct answers, original category/MCQ numbers, answer context and primary-source links. The selection includes Pakistan-related Indus treaty projects in India, explicitly labelled as Indian projects; unrelated foreign dams and rivers are excluded. This is a curated reading aid, not an exhaustive list of possible exam questions or a live project-status feed.

`water-topics.js` loads `data/pakistan-water-topics.js` only when opened; topic bodies render on expansion. The library does not add or change canonical questions, IDs, scoring, queue counts, sessions, guest/owner storage or cloud sync. No automatic popup is added. Existing time qualifiers remain; Warsak commissioning dates and the inherited Baglihar answer-option wording have explicit reading notes rather than silent bank changes.

Content lives in `data/pakistan-water-dams.json` and `data/pakistan-water-rivers.json`. Run `node tools/build-pakistan-water-topics.js` to regenerate or add `--check` to validate references, schema, duplicate MCQ IDs, canonical IDs, deterministic output and deployed assets. These checks do not replace editorial fact checking. `node tools/water-topics-browser-smoke.js` tests search, filters, source-answer fidelity, lazy-load retry, keyboard, responsive layouts, progress preservation and guest access with the existing native Chrome harness.

## Pakistan Provinces

The **Pakistan Provinces** Study Tool groups 58 verified revision topics under Punjab, Sindh, Khyber Pakhtunkhwa and Balochistan. Each province has native-accordion sections for mountains/plateaus, rivers, barrages/headworks/dams and lakes/wetlands. Open an entry for its short Roman Urdu note, official source, and any explicitly linked existing MCQs with correct answers. Entries without a direct bank MCQ are labelled extra revision, not claimed as past questions. Shared rivers, ranges and Hub Dam have province-specific notes. Gilgit-Baltistan, Azad Kashmir and Islamabad Capital Territory are not assigned to the four provinces.

`pakistan-provinces.js` fetches `data/pakistan-provinces-geography.json` only on first opening and reuses it thereafter. The view is read-only: no questions, answer keys, quiz sequence, queue counts or saved progress change. Run `node tools/validate-pakistan-provinces.js` for schema, province assignment guards, HTTPS source and canonical MCQ-ID checks, plus `node tools/pakistan-provinces-browser-smoke.js` for navigation, search, sources, answer rendering, desktop/mobile dark mode, lazy loading and saved-progress preservation. Editorial source review remains necessary when the list is expanded.

## Oceans & Seas

The read-only **Oceans & Seas** Study Tool groups existing marine-geography MCQs into oceans, seas and their related waterways and phenomena. Each native accordion topic has a short Roman Urdu explanation, a reference source and its explicitly linked bank questions with correct answers. Verified geography without a direct bank question is labelled **Extra revision**, and wrong answer options are not treated as question evidence. Search across topic names, questions and answers; filter topics with saved MCQs versus extra revision; or open the existing World MCQ Map directly in its oceans/seas layer.

`ocean-topics.js` fetches `data/ocean-topics.json` only on first opening and reuses it thereafter. Neither it nor the map shortcut writes quiz, queue, learning or cloud progress. Run `node tools/validate-ocean-topics.js` for schema, HTTPS sources and canonical MCQ-ID checks, and `node tools/ocean-topics-browser-smoke.js` for the rendered flow, mobile/dark layout, linked answers, filters, source links and unchanged saved progress. Editorial source review is still needed for future additions.

## Years Wise Topics

The category screen's **Study Tools** box includes the **Years Wise Topics** reading library. Its existing 914 topics have concise Roman Urdu explanations, paraphrased from their existing linked MCQ evidence, rather than a new encyclopedia or additional questions. Relevant background and distinctions are included where the source material supports them. Only one year accordion stays open: opening another closes the previous year, including with Enter/Space. Nested MCQ references remain independent. Search by year, name or explanation phrase, filter by category/calendar, or close all years. Each topic includes a collapsed MCQ reference showing its canonical category question number, question and correct answer, plus the existing explanation-source links where available.

When the same explicit source/similar-question pair already supports topics in different years, **Isi topic ki juri hui tareekhein** displays those entries chronologically (for example dynasty start/end or birth/death). This does not infer relationships from shared words, invent missing dates, or convert AH to CE. The brief explanations reuse existing evidence; they are not a fresh independent web verification of every historical claim.

This is a manually curated collection of historical/event topics grounded in the current question bank, **not an exhaustive index of every date in all MCQs**. Repeated questions can share one topic. Hypothetical maths/grammar dates, quantities, software version numbers, wrong-option dates and mere “as of” metadata are not treated as historical events. Only years with topics are shown. BCE years run oldest-first, followed by ascending CE years; AH/Hijri years have their own explicitly separate calendar section without guessed conversions. The library does not invent events for empty years or unknown publication dates.

The controller is `years-topics.js`; the generated `data/year-topics.js` is fetched only on first opening, with a retry option on failure. Topic bodies render only when their accordion opens. Original topics are authored in `data/year-topics-world.json`, `data/year-topics-pakistan.json` and `data/year-topics-other.json`; companion `data/year-explanations-{world,pakistan,other}.json` files contain explanations and their canonical evidence IDs. `data/year-topics-merges.json` identifies editorial same-event merges across categories without losing MCQ references. Run `node tools/build-year-topics.js` after editing, and `node tools/build-year-topics.js --check` to validate the generated bundle, linked MCQ IDs, explanation coverage, year evidence, ordering and deployment assets. `node tools/year-explanations-smoke.js` also locks the original topic IDs, dates, summaries, ordering and links, and validates explicit-pair chronology. These mechanical checks do not replace editorial fact checking.

This read-only view neither changes the canonical question bank nor writes learning, quiz, Wrong Quiz, Queue, Important, local-storage or cloud progress. Returning to categories retains the normal Continue option. The existing theme applies to both desktop and mobile. Run `node tools/year-topics-browser-smoke.js` for the new page's lazy-load failure/retry, filters, keyboard accordion, 1366px/320px layout and saved-progress checks.

## World MCQ Map

Study Tools includes a zoomable world map with readable country labels that reveal more names as you zoom, a searchable country/region list above the map, category filtering, hover/tap previews and a paginated list of linked MCQs with their correct answers. Selecting a country also shows a focused country map and available major-city markers above its MCQs. A north-up compass guide explains the cardinal and diagonal directions. Verified country-direction MCQs offer **Map par samjhein**: an optional inset with the countries highlighted, a direction arrow, and a short Roman Urdu explanation. **Sirf direction MCQs** filters the selected country's linked-question list; it does not affect the map counts or any study session. These inset lessons are deliberately keyed to checked MCQ IDs rather than guessing from words like “South Korea” or incorrect answer options; other direction MCQs can still use the compass guide. The map's local Natural Earth 1:50m country/area boundary data loads only when the tool is opened; city data loads when a country is selected. City markers are illustrative rather than exhaustive, and borders are not authoritative. The MCQ matcher uses names in the question and correct answer, including curated city aliases; wrong answer options are never treated as evidence. Matching is intentionally conservative, so some location-related questions without an explicit recognized place may not appear. New question-bank entries are matched automatically when the map opens. This read-only tool does not change quiz, queue or saved progress.

The map asset is generated by `node tools/build-world-map-data.js path/to/original.geojson` from the pinned public-domain Natural Earth source listed in that script. The city overlay is generated by `node tools/build-world-city-data.js path/to/ne_50m_populated_places.geojson` from the pinned Natural Earth source listed there. Run `node tools/validate-world-map-data.js` and `node tools/validate-world-city-data.js` to check both committed assets before publishing.

The **Map topic** selector also has oceans/seas, mountains/glaciers, rivers/canals and barrages/dams. These four layers load only when selected and use curated feature names, source links and representative map points from `data/world-physical-terrain.json` and `data/world-physical-water.json`. The optional `assets/maps/world-physical-geometry.json` adds 31 genuine Natural Earth 1:50m marine outlines and river centerlines; features unavailable in that source remain point-only. A selected shape or marker shows source notes and linked MCQs; a separate "without a verified map pin" list keeps related questions visible where an exact location is not established. Names in the stem and correct answer, plus reviewed stable MCQ IDs, create links; wrong options do not. Broad ocean/range labels and river/canal points are not precise boundaries or complete courses. Use `node tools/validate-world-physical-data.js` to check the committed layer data and links. The geometry can be reproduced with `node tools/build-world-physical-geometry.js` from pinned public-domain Natural Earth source files. These layers are read-only and leave quiz, queue and saved progress unchanged.

## Practice popup control

**Practice popups** in the category Learn/Quiz session header switches both automatic Queue and Important reviews on or off, including Difficult Learn/Quiz. It defaults to On for existing saves. Off pauses the remaining popup interval without changing the next review type, queue counts, or round order. Ordinary Quiz answers still enter the queue, and full-screen category Queue Practice remains available.

The preference is saved with the existing offline-first queue record and uses its normal cloud sync. Re-enabling resumes the paused interval. Any already checked embedded review is settled once before it is dismissed, preventing a stale popup from rewinding the main session. Custom Paper does not show this control because it never opens automatic practice popups.

## Wrong Quiz

Each category now has a **Wrong Quiz** option, also available on category Quiz results. Wrong answers from ordinary and Difficult category quizzes are saved immediately in a separate list. Each new Wrong Quiz round shuffles the remaining mistakes; a correct answer removes that MCQ from the live list, while a wrong answer keeps it there once. After the round, **Next Wrong Quiz Round** uses only the remaining list. When none remain, the page confirms completion and disables the retry button.

The list is category-specific and respects the selected Basic Computer source. It ignores Important-only filtering so that non-Important mistakes are not hidden. It is independent of the finite Queue: normal +2 wrong-answer and confirmation-review behavior, shuffled one-turn-per-MCQ Queue rounds, and the Practice popups preference still apply. Learn, Custom Paper, Queue Practice and Important popups do not add to or clear Wrong Quiz.

Wrong IDs share the existing offline-first cloud-synced progress record; no prior Queue entries are removed or reclassified. An active Wrong Quiz keeps its original question set, checked answers, options, score and position across Continue/refresh even as correct answers leave the live wrong list. The next round uses the updated list. Checked mistakes from a pre-feature in-progress category quiz are captured when that quiz reaches Results. Past completed quizzes cannot be reconstructed from the Queue, which also contains correct-answer confirmations.

## Question bank

- 449 source MCQs transcribed from the supplied `PPSC 110 Edition` scan.
- 1,295 source-present MCQs extracted from `IBES CAPSULE Computer 2025`; 207 semantic repeats were excluded and 1,088 unique MCQs were retained. Printed Q254 is absent from the supplied scan and was not fabricated.
- Basic Computer Studies can be narrowed to **All Basic Computer** (2,564), the 1,088 retained **Initial PDF — Original MCQs**, the 1,088 generated **Initial PDF — Related Practice** questions, or 388 **Other Papers** questions (194 source + 194 related, including the WGI additions). The source choice also scopes Important counts, Difficult practice, Study Notes search/results, and Learn/Quiz range numbering; each selected range is shuffled for a new session without changing normal Quiz scoring. Other categories and the random Custom Paper flow remain unchanged.
- The current partial release of `Advanced PPSC MCQs Papers, Volume 2` contains 4,169 independently verified, retained source MCQs and 4,169 original researched related questions. Work on the remaining supplied scan continues in restart-safe batches; unresolved and unreviewed records are excluded from the website.
- **11,952 website questions:** the original 5,946 source/related pairs (11,892 MCQs), plus 30 independently researched Current Affairs pairs (60 MCQs).
- The current WGI release covers source items **1–450**. All 450 items have a verified keep, duplicate-skip, or reject decision; 240 retained source items contribute 240 independently researched related questions, for 480 website MCQs. The supplied PDF's full **671-item extraction and audit** remain intact for later work; items 451–671 are not part of this release.
- 10 advertised syllabus subjects, plus a separate **Finance, Taxation & Job-related** category for questions found in the supplied papers but outside that syllabus.
- Non-Urdu subjects show English question stems and options with a readable Urdu translation below each question. The Urdu category shows its question and all four answer choices directly in Urdu with right-to-left typography.
- An accessible Light/Dark appearance control is available on both the Google sign-in screen and the protected app header. The selected theme is applied before the page paints, stays saved in that browser, follows the device colour preference until a choice is made, and keeps all notes, forms, quiz states, dialogs and result panels readable.
- A two-stage Learn mode that starts every answer unmarked. **Show Answer**, Space, Enter or Right Arrow reveals and highlights the correct option without moving; the next activation advances. Hidden/revealed state survives Continue, refresh and device sync, while previously revealed questions stay revealed when revisited.
- A keyboard-ready Quiz mode with instant Correct/Incorrect feedback: arrow keys select an option, Enter checks it, and after feedback Space, Enter or Right Arrow continues. The same controls work in category Queue practice and the finite Queue/Permanent Important review popups.
- A persistent spaced-retry queue gives each newly answered category Quiz MCQ a confirmation cycle. The earlier one-time five-review baseline is kept only as saved-state history; this change does not reset existing entries or their counts. A correct Queue review removes one remaining repetition; a wrong answer adds two. A correct main Quiz answer never decrements, resets, or duplicates an already queued item—the count changes only in Queue practice. The former all-subject header button, all-subject category card, and 3 / 5 / 10 repeat-gap control are removed. Each category has its own **Queue** option that opens a full question screen, like Quiz, rather than a popup. The Queue remains one offline-first saved record shared across categories, so mobile/laptop sync retains the existing counts and in-flight review.
- Every category Learn or Quiz session, including Difficult Learn/Quiz, presents only two popup types: finite Queue and Permanent Important reviews from that category. The in-session Queue chip also counts only that category. Basic Computer source choices share one Basic Computer Queue. One saved clock alternates the popup types after every ten regular Learn/Quiz MCQs: Queue at 10, Important at 20, Queue at 30, Important at 40, and so on. Popup answers do not count toward this clock. Each opening consumes only its own turn; the other type waits for ten more regular MCQs. If the scheduled type has no questions in the active category, that turn is skipped without substituting a different popup. Queue uses a saved shuffled order for each category round: every pending question gets one turn before its remaining repetitions repeat, and a wrong answer's extra two repetitions wait for a later round. Counts and legacy cooldown dates cannot move a question ahead of the next pending turn. Learn consumes pending reviews but never creates confirmation items. Custom Paper never inserts or automatically shows either review lane.
- **Permanent Important Practice** draws only from Important MCQs in the category currently being learned or quizzed. Each category keeps its own shuffled Important entries within the saved deck, avoiding an immediate repeat when another eligible MCQ is available. Correct and wrong Important-practice answers both leave finite Review Queue questions and counts unchanged. In both popup types, a correct answer followed by **Next MCQ** continues to another question of the same type; a wrong answer followed by **Continue** returns to the regular Learn/Quiz session. A finite Queue chain ends when that category has no reviews left. The former Global Sequential popup is retired; existing finite Queue and Important progress is preserved.
- Finishing a category Learn or Quiz session opens Results without forcing the finite retry queue or Permanent Important lane to finish. If its final regular question reaches a popup checkpoint, that turn is consumed without opening a popup. Any remaining finite reviews stay saved for that category's full-screen **Queue** mode or a later Learn/Quiz session; **Later** can postpone an embedded finite or Important review without changing the main session's progress or score. Correct-answer chains, wrong answers, **Later**, and full-screen Queue practice do not move the next alternating popup checkpoint.
- A **Start Paper Here** flow builds a 100-MCQ paper from any selected combination of categories, using random questions and shuffled options.
- Custom papers award 1 mark per correct answer and deduct 0.25 per wrong answer; the final Correct and Wrong totals open filtered answer-review lists.
- Learn and Quiz open an inclusive **Starting question / Ending question** selector before the session begins. The default range covers the full active list, or you can enter any valid whole-number range such as 2–50.
- An evidence-based **Important repeated MCQs** filter uses verified deduplication records and displays how many times each marked fact occurred.
- Every one of the 11 categories has a **Study Notes** mode. Its Quick Notes list keeps the exact stable MCQ order and shows each question’s visible number, a short recall cue, the exact question, and its exact correct answer. Search and Important-only filtering cover the whole category, while notes render 100 at a time for low-end phones.
- Every category also has a separate **Detailed Learning** library with four to six structured reference lists. It expands the people, dates, places, organizations, formulas and other themes behind the MCQs into searchable topic panels, so the learner can prepare related facts that are not limited to the current question bank. Urdu-category lists remain in Urdu with right-to-left presentation.
- General Knowledge Quick Notes also offer **Detailed GK Stories**, the existing library that turns 776 fully evidenced GK pairs into connected Urdu fact cards. It supports search, nine topic filters and an Important-only view, while progressively rendering 40 cards at a time.
- Each new Learn, category Quiz, Difficult, and Wrong Quiz run shuffles the selected MCQ order. Continue/refresh restores the saved order and position rather than reshuffling mid-session. Quiz safely reshuffles ordinary answer choices without changing the correct answer. Questions whose choices refer to fixed labels such as “Both A and B” or “All of the above” retain their canonical A–D option order so their meaning stays correct.
- Previous and Next navigation lets you revisit earlier questions; Quiz restores each pending or submitted answer, its feedback, shuffled options, and score without counting an answer twice.
- A compact Continue card restores the exact active Learn, Quiz, Difficult, or Custom Paper session after a refresh or browser restart, including its selected inclusive range, selected categories, progress, option order, answer history, submitted feedback, and score.
- A persistent, always-visible **Mark as difficult** checkbox below every question, plus category-wise Difficult Learn and Difficult Quiz sessions containing only marked questions.
- A focused question screen without Answer explained, View details, related-history or research-source panels.

The standard flow is: choose a category → for Basic Computer Studies optionally choose its question source → optionally limit it to **Important repeated MCQs** → choose Learn, Quiz, Queue, Difficult, Study Notes, or Detailed Learning. **Queue** opens that category's saved reviews on a full question screen; it does not combine other categories or open a review popup. Its question turns use a saved shuffle for the current round and cycle through the category before repeating remaining turns. Learn and Quiz first show an inclusive Starting/Ending range; the range is applied after the source, Important, or Difficult filter, so 2–4 always means items 2, 3, and 4 of the active list before those three MCQs are shuffled for the new session. Blank, decimal, zero, reversed, and out-of-range values are rejected without replacing the current resumable session. Quiz may still shuffle ordinary answer choices and preserves the existing answer and scoring behaviour. Difficult opens its own Learn/Quiz choice and range selector using only marked questions from the selected source. **Start Quiz** after Learn and **Restart** retain the chosen range while the eligible list is unchanged, then shuffle a new run; if Difficult marks change that list, the safe range chooser opens again instead of silently substituting questions. The editable question number above the progress bar still jumps within the active session. **Study Notes** opens the selected source's Quick Notes list for Basic Computer Studies and the complete category list elsewhere; General Knowledge additionally links to **Detailed GK Stories**. **Detailed Learning** opens the selected category's broader reference library with topic filters and a text search, without changing quiz progress or saved queue state. **Start Paper Here** remains a separate, random exact 100-question mixed paper and does not use the source or range selector.

Difficult marks, the compact active-session checkpoint, the finite spaced-retry queue, and Permanent Important cadence/deck are saved locally first and synchronized to the approved user's private Cloud Firestore area after Google sign-in. They survive normal reloads and can continue on another signed-in device. Continue restores a Basic Computer session's exact source choice; older saved sessions safely migrate to **All Basic Computer**. Completed sessions are removed from Continue automatically, while unfinished finite reviews remain pending across reloads and visits and can be completed from the relevant category's **Queue** mode or during a later Learn/Quiz session in that category. In-flight finite and Permanent Important popup attempts restore safely in their own category; a manual Queue answer likewise remains saved. An old in-flight Sequential attempt is dismissed without adding or removing Queue reviews. Learn never creates confirmation entries, and Custom Paper never auto-inserts or auto-opens review practice. Review answers never alter the current Learn/Quiz question number, visited/answer history, or score.

Question-bank changes use fail-closed migration. A save from the approved 11,412-question release is accepted only behind an exact prefix fingerprint. The 2026-10-18 release additionally approves seven same-slot answer-text corrections from the previous 11,892-question bank: correct "None of these" answers now name Sir Cyril Radcliffe, 1919, Talib Ansari, nasal (supraorbital) salt glands, the fourth rubai line, Al-Baqarah and 1914. Urdu display answers and explanations are updated too. The correct indices, IDs, question order and counts do not change. Genuine "None" meaning zero and incorrect distractors remain untouched. Original PDF extractions and the historical WGI audit remain intact; validators reconstruct only these seven explicit replacements before comparing the original baseline fingerprint.

Active Learn/Quiz/Paper question IDs, range, answers, score and current position stay frozen, so new MCQs are not injected into practice already in progress. A validated frozen-pool origin is retained across subsequent saves/reloads; older already-migrated pools are recovered only when they exactly match an approved prefix. Historical Important-only selections additionally use pinned category/source-specific pool fingerprints, because WGI repeat evidence marked some existing questions Important after that older release. Finite Queue counts, pending answers, Important timing and saved round/deck entries are preserved. Retired Sequential cursor fields remain readable for legacy compatibility, but no longer open popups. Rewritten current-bank snapshots are saved locally and sent through the normal cloud-sync notification path. Unknown signatures and unapproved changes inside protected prefixes remain rejected.

The finite Queue count baseline was a one-time earlier migration: each item present then was set to exactly 5, and a saved version marker prevents future refreshes or devices from applying that reset again. This release preserves every current question ID and remaining count. The cadence-version-4 migration creates one alternating checkpoint ten regular MCQs after the saved practice position, once only. Queue is first unless an embedded popup is already in progress; that popup and its answer are preserved, and the next scheduled type is the opposite one. Existing pending Queue IDs are shuffled once on upgrade; subsequent round orders are shuffled and saved, while counts and any active review answer remain intact. The checkpoint and next type survive refresh and cloud restore; missing new clock fields are repaired even if an older client retained the version marker. Legacy individual clocks remain compatibility mirrors, while repeat-gap, cooldown and recent-question fields stay readable without determining popup timing or Queue order. New wrong Quiz or finite Queue answers add 2 and each correct Queue review removes 1. A checked review saved under the old `+5` rule keeps that pending atomic outcome after refresh.

If the internet disconnects while the signed-in app is open, Learn, Quiz, Difficult marks, category Queue changes and Important practice continue saving in browser storage and the header shows **Saved locally**. When the connection returns, the browser and cloud revisions are compared automatically: local-only changes upload, cloud-only changes restore, and changes made independently on both devices stop for an explicit conflict choice instead of overwriting either copy. A fresh signed-in load still needs Firebase to verify the Google account; guest practice does not need Firebase once the app assets have loaded.

## Continue without login

The access screen offers **Continue without login** on any device, including incognito windows. Guest mode supports the same categories, Learn, Quiz, Wrong Quiz, Queue, Important popups, notes and Years Wise Topics. Its header says **Guest · local only**; the banner explains that there is no cross-device cloud sync and closing an incognito session clears its storage.

Guest practice uses separate `ppsc-prep:guest:*` local-storage slots for the active session, per-category session archive, retry queue (including Wrong Quiz and popup preferences), and difficult marks. It never reads, replaces or uploads the owner's existing progress. The tab remembers its guest choice in `sessionStorage`, so refresh can continue guest practice without loading the Firebase SDK. Guest practice can still run in memory if browser storage is unavailable, but then it cannot promise resume.

The guest header's **Sign in** button returns to the access screen using a full reload, leaving both namespaces intact. Guest progress is not automatically imported into an account. If an owner session was previously open before an external sign-out, entering guest also requires a reload so the old in-memory owner session cannot leak into guest practice. Guest mode does not create a Firebase anonymous user or relax Firestore rules.

`node tools/cloud-sync-smoke.js` checks namespace isolation, SDK/auth races and existing cloud behavior. `node tools/guest-browser-smoke.js` checks the production access gate, guest Learn/Quiz/Continue, separate progress, unavailable Firebase, refresh and responsive layouts using an isolated local Chrome profile.

## Google sign-in and first-device migration

Private cloud access is gated by Firebase Google Authentication and restricted to `developerabdulnafa@gmail.com` in both the client and `firestore.rules`. Practice content is also available through the separate guest option. Local `file://`, `localhost`, and `127.0.0.1` previews intentionally use development mode so the offline browser tests still run.

The first cloud migration must be performed on the mobile browser that already contains the saved session and retry queue:

1. Deploy this release without clearing mobile browser data.
2. Open the existing `https://abdulnafa.github.io/ppsc/` address on that same mobile browser.
3. Sign in with the approved Google account.
4. Choose **Upload this device's progress**, then wait until the header says **Synced**.
5. Open the site on the laptop, sign in with the same account, and choose the cloud copy if a choice is shown.
6. Confirm Continue and the review count on both devices before clearing any browser data.

An empty new device cannot create or replace the first cloud copy. The first import must come from the browser that contains actual progress. If local and cloud records later differ, the gate remains closed until the user explicitly chooses which copy to keep; the copy being replaced is first retained in a local safety backup. The app automatically creates the required Firestore documents, so no collection needs to be entered manually in the Data tab.

The Firebase web configuration is public by design; access control for cloud progress comes from Authentication and the deployed Firestore rules. Guest mode exposes practice content, not the owner's cloud progress. GitHub Pages is static hosting, so the question-bank asset is publicly downloadable. Protecting the static question files as private content would require authenticated server-side hosting. Browser-local data is not encrypted; use incognito or a trusted browser on shared devices.

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
node tools/build-question-bank.js --site-only
node tools/build-gk-study-notes.js
node --check data/detailed-learning.js
node tools/validate-site-data.js --expected=11952 --verify-work-repeat-evidence
node tools/current-affairs-smoke.js
node tools/category-progress-smoke.js
node tools/category-progress-browser-smoke.js
node tools/answer-text-migration-smoke.js
node tools/popup-preference-smoke.js
node tools/wrong-quiz-smoke.js
node tools/build-year-topics.js --check
node tools/year-explanations-smoke.js
node tools/year-topics-browser-smoke.js
node tools/cloud-sync-smoke.js
node tools/browser-smoke.js
```

The strict repeat-evidence flag belongs to a deliberate question-bank rebuild, after the source validators and builder are clean. GitHub Pages deployment validates the committed question bank against its pinned, hashed release-evidence snapshot without coupling it to newer restart-safe work-in-progress decision files.

The popup-preference smoke test verifies backward-compatible defaults, paused countdowns, saved shuffled Queue rounds/counts, exactly-once handling of checked reviews, and independent full-screen Queue Practice. Browser coverage additionally checks the On/Off control in Learn and Quiz, refresh/category changes, keyboard safety, and mobile light/dark layouts; cloud tests check cross-device and offline preference round-trips.

The browser smoke test requires local Chrome or Edge. It covers category Learn, Quiz, Queue, Difficult, Study Notes and Detailed Learning, plus Custom Paper on desktop and mobile. Existing coverage checks inclusive ranges, answers and score restoration, question/option ordering, the 100-question paper and negative marking, Basic Computer source partitions, Urdu rendering, keyboard controls, notes, and safe Continue/cloud-sync migrations. Queue coverage checks that the old all-subject controls are absent, each category opens only its own full-screen Queue, embedded Queue and Important popups remain category-only, and the retired Sequential popup stays off. It checks alternating ten-regular-MCQ checkpoints, skipped empty and result-boundary turns, shuffled saved Queue rounds, correct-answer popup chains, wrong-answer return, +2 wrong / −1 correct Queue counts, atomic Check-versus-Continue saves, and preservation of unrelated categories' reviews across reloads. Legacy Queue state fields and counts remain compatible with offline-first cloud sync.

The question-bank build script validates all six `PPSC 110 Edition` papers, all 1,088 retained IBES pairs, and every currently retained ADV2E102 pair before including it. It balances only the generated similar-question answer positions and creates:

- `data/questions.js` with the complete website bank.
- `data/release-repeat-evidence.json` with the exact hashed decision evidence used by that release.
- `..\ppsc_mcqs.md` with all similar practice questions.
- Eleven category Markdown files in the parent folder.

The dedicated `tools/build-gk-study-notes.js` command then reads the committed question-bank asset and creates `data/gk-study-notes.js` with the strict 776-card library and its explicit 18-pair exclusion evidence.

Use `--site-only` to avoid rewriting the parent-folder Markdown exports, or `--check` to verify committed assets without writing them. The original PDF option order is never rearranged.

## Add future user-supplied MCQs

Add each new user question and its independently researched similar question as one adjacent pair in a new append-only source batch. Register that batch AFTER all already published supplements in `tools/build-question-bank.js`; `custom-questions.json` currently loads before these supplements, so inserting there would violate the protected prefix. IDs `USR-Q0001` through `USR-Q0030` are reserved for the 21 October 2026 supplements; start future pairs at an unused ID such as `USR-Q0031-SRC` and `USR-Q0031-SIM`, with the shared `pairId` `USR-Q0031`.

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

After adding a pair, run the validation and build commands again. A new release must deliberately update the pinned append-only release contract and resume-migration tests; changing only a count is not sufficient. Preserve all existing IDs, question contents and ordering, then update the expected total from 11,952.

## Push this update

The repository is already initialized on branch `main`, with `origin` set to `https://github.com/abdulnafa/ppsc.git`.

```powershell
cd "D:\PPSC\codex\ppsc-project"
git add -- .github/workflows/pages.yml README.md app.js index.html
git add -- data/questions.js data/gk-study-notes.js data/release-repeat-evidence.json
git add -- tools/build-question-bank.js
git add -- tools/category-progress-smoke.js tools/category-progress-browser-smoke.js tools/current-affairs-common.js tools/current-affairs-smoke.js
git add -- work/current-affairs-october-2026-pakistan.json work/current-affairs-october-2026-world.json work/current-affairs-october-2026-audit.json
git commit -m "Append October current affairs without resetting ongoing practice"
git push origin main
git status --short
```

Always stage the named files only; do not use `git add .`, because unrelated local tools may be present. Do not save a GitHub password, personal access token, Google password, or Firebase service-account key in the project.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` validates the question bank, Detailed Learning library and cloud-sync migration contract, then publishes the required app, Firebase client, question data, both notes libraries, Detailed Learning data, and local font assets. Firestore rules are versioned in this repository but are published separately in the Firebase console; internal research/work files are not included in the deployed artifact.

In the repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`. The expected site URL is:

<https://abdulnafa.github.io/ppsc/>

See GitHub's official guide to [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
