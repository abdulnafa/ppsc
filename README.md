# PPSC MCQ Preparation

A lightweight, no-build practice website for the PPSC General Ability syllabus. Questions and answer choices are written in English, while the answer details are explained in Urdu.

## What the website does

- Lets the learner choose a syllabus category before starting.
- Shows one multiple-choice question with four options at a time.
- Checks the selected option and clearly reports whether it is correct or incorrect.
- Reveals the correct answer and an Urdu explanation after submission.
- Provides detailed Urdu reasoning for the available options.
- Runs entirely in the browser; there is no account, database, package installation, or build step.

## Project structure

```text
ppsc-project/
├── .github/workflows/pages.yml  # Automatic GitHub Pages deployment
├── data/questions.js            # Categories and MCQ data
├── index.html                   # Website markup
├── styles.css                   # Responsive visual design
├── app.js                       # Quiz behaviour
└── README.md
```

## Preview locally

The website does not use `fetch()` or a build tool, so it can be opened directly:

In PowerShell:

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
Start-Process .\index.html
```

You can also double-click `index.html` in File Explorer. GitHub Pages will serve the same files over HTTPS after deployment.

## Add a category

All quiz content lives in `data/questions.js`. Add a category to the `categories` array inside `window.PPSC_QUIZ_DATA`:

```js
{
  id: "geography",
  name: "Geography",
  shortLabel: "GEO",
  description: "Countries, capitals, landforms and world geography."
}
```

The category `id` must be unique. Use the same value in every related question's `categoryId`. Keep `shortLabel` brief because it is used in compact parts of the interface.

## Add an MCQ

Add each new item to the `questions` array inside `window.PPSC_QUIZ_DATA`:

```js
{
  id: "GEO-SRC-0001",
  categoryId: "geography",
  question: "Which is the smallest Muslim country by land area?",
  options: [
    {
      label: "A",
      text: "Brunei",
      rationaleUrdu: "برونائی ایک چھوٹا ملک ہے، لیکن یہ درست جواب نہیں۔"
    },
    {
      label: "B",
      text: "Bahrain",
      rationaleUrdu: "بحرین کا رقبہ مالدیپ سے زیادہ ہے۔"
    },
    {
      label: "C",
      text: "Maldives",
      rationaleUrdu: "مالدیپ خشکی کے رقبے کے لحاظ سے سب سے چھوٹا مسلم ملک ہے۔"
    },
    {
      label: "D",
      text: "Qatar",
      rationaleUrdu: "قطر کا رقبہ مالدیپ سے زیادہ ہے۔"
    }
  ],
  correctOptionIndex: 2,
  explanationUrdu: "مالدیپ کا خشکی کا رقبہ تقریباً 298 مربع کلومیٹر ہے، اس لیے دیے گئے ممالک میں یہ درست جواب ہے۔",
  source: {
    type: "book",
    label: "PPSC 110 Edition, p.1 Q.1",
    referenceUrl: "https://example.com/direct-source-page"
  },
  tags: ["countries", "area"]
}
```

Data rules:

- Keep `id` unique across all questions.
- Write the question and four option texts in English.
- Supply exactly four options labelled `A`, `B`, `C`, and `D`.
- Write `rationaleUrdu` and `explanationUrdu` in Urdu.
- `correctOptionIndex` is zero-based: `0` = A, `1` = B, `2` = C, `3` = D.
- Use an existing `categoryId`, written exactly as it appears in `categories`.
- Record provenance in `source`: use a clear `type` such as `"book"`, `"web"`, or `"practice"`; add a readable `label`; and put a direct verification link in `referenceUrl` when available.
- Preserve commas, quotes, brackets, and braces because this is JavaScript data.

The file publishes the complete object as `window.PPSC_QUIZ_DATA` with `version`, `categories`, and `questions` fields. It also exposes `window.PPSC_CATEGORIES` and `window.PPSC_QUESTIONS` as convenient aliases. Add content to the local `categories` and `questions` arrays rather than replacing these global assignments.

After editing, refresh the local preview and test both a correct and an incorrect choice. Open the browser's developer console if the page does not load; a missing comma or quote in `questions.js` will usually be reported there.

## First push to GitHub

The target repository is <https://github.com/abdulnafa/ppsc>. It is currently intended to receive the contents of this `ppsc-project` folder as its repository root.

Run these exact commands in PowerShell:

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
git init
git add .
git commit -m "Initial PPSC preparation website"
git branch -M main
git remote add origin https://github.com/abdulnafa/ppsc.git
git push -u origin main
```

If Git says that a remote named `origin` already exists, replace only the `git remote add origin ...` command with:

```powershell
git remote set-url origin https://github.com/abdulnafa/ppsc.git
```

GitHub may ask you to sign in. Do not put a GitHub password or access token in this project.

## Publish with GitHub Pages

This repository includes `.github/workflows/pages.yml`, so pushes to `main` can deploy the static site without a build command.

After the first push:

1. Open <https://github.com/abdulnafa/ppsc>.
2. Select **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the repository's **Actions** tab and wait for **Deploy static site to GitHub Pages** to complete.
5. Visit <https://abdulnafa.github.io/ppsc/>.

The initial deployment can take a few minutes. If the repository is private, GitHub Pages availability depends on the account plan. See GitHub's official guides for [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Push future MCQ updates

After adding or correcting questions, run:

```powershell
cd "D:\My documents\PPSC\codex\ppsc-project"
git add .
git commit -m "Add new PPSC MCQs"
git push
```

Every push to `main` starts a new Pages deployment automatically. Check the **Actions** tab if the live site does not update.
