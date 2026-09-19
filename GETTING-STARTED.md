# Getting Started with Akademie

Welcome to **Akademie** — an interactive, local-first web development academy that runs entirely on your own machine.

Here, you learn by doing: you read concise theory, predict what code will output before executing it, write code directly in an integrated browser editor with real-time test feedback, and tackle production-grade projects inside VS Code. Everything you master is continuously reinforced by an integrated Spaced Repetition System (SRS) that returns over days and weeks until the patterns become second nature.

---

## Launching the Platform

Open your terminal in the `akademie` directory and run:

```bash
./start.sh
```

Then open your browser and navigate to:

👉 **[http://localhost:4300](http://localhost:4300)**

### Helpful Notes
- **First Launch & Updates**: When running for the first time (or after updating the codebase), Vite will build the client bundle and compile runtime vendor libraries. This only takes a few seconds.
- **Stopping**: Press `Ctrl+C` in your terminal. All progress, metrics, and code drafts remain safely persisted.
- **Port Conflict?** If port 4300 is already in use, launch on another port:
  ```bash
  PORT=4301 ./start.sh
  ```
  and visit `http://localhost:4301`.
- **Requirements**: Node.js version 22.0.0 or newer.

---

## 8 Principles for Effective Learning

Passive reading and mindless copy-pasting give the illusion of competence, but knowledge fades within days. To build durable engineering skill, follow these eight proven learning principles:

1. **Start Every Day with Spaced Repetition**  
   Click **Repetition** (*Opakování*) in the top navigation bar and complete your daily queue (capped at 20 items, typically 5–15 minutes) before diving into new material. Always answer from memory without flipping back to the theory.

2. **Predict First, Run Second**  
   Before running a live demo or clicking **Check** on your code, mentally predict the exact outcome. Formulating a hypothesis primes your brain for active learning; discovering *why* a prediction was wrong is where the deepest mental connections form.

3. **Engage in 10–15 Minutes of Productive Struggle**  
   When a test fails, resist the urge to open hints immediately. Read the error diagnostic carefully, log values using `console.log`, and review the lesson text. If you remain stuck, open **only the first hint** and try again before requesting further assistance.

4. **Replay Blind After Viewing Solutions**  
   If you must inspect the reference solution, click **Reset Step** and re-implement the solution from scratch without looking. The system will also schedule that step for review tomorrow so you can solidify it independently.

5. **Explain in Your Own Words**  
   In *"Explain in your own words"* checkpoints, write complete, articulate sentences as if explaining the concept to a colleague or a tech lead during a job interview. These explanations are saved to your personal notes for future interview prep.

6. **Embrace Unguided Labs**  
   Labs are intentionally unguided to test whether you can synthesize what you learned. Always fill out the **Before You Begin** planning section (restate requirements in your own words and draft a step-by-step approach) before touching code.

7. **Build Personal Projects in Parallel**  
   Immediately apply new skills to a personal project outside the curriculum (e.g., a portfolio site, an interactive tool, or a hobby app). The curriculum builds the foundation; your personal projects build lasting confidence.

8. **Treat AI as a Tutor, Never as a Ghostwriter**  
   Use LLMs to clarify difficult concepts, quiz your understanding, or provide conceptual guidance without code. Write all exercise code yourself — otherwise, only the AI learns.

---

## How the Curriculum Works

On the home page, you'll find the course syllabus organized into:
**Parts &rarr; Sections &rarr; Modules &rarr; Steps**

Use the **By Parts / Recommended Track** toggle to alternate between CSS layouts and JavaScript logic in a balanced progression. Nothing is locked: you can explore any section, module, or step at any time. Clicking **Start** or **Continue** automatically takes you to your next incomplete step.

### Module Types

| Module | What You Do |
|---|---|
| **Lesson** | Read interactive theory with live sandboxes, code predictions, memory diagrams, and checkpoint questions. |
| **Workshop** | Build a real feature step by step. Each step begins with starter scaffolding so upstream errors never break downstream progress. Scaffolding is progressively removed as you advance. |
| **Lab** | An unguided real-world challenge — only specifications, user stories, and test requirements. |
| **Quiz** | Conceptual questions and code-reading comprehension drills. Retake as many times as needed. |
| **Project** | A substantial multi-file project developed locally in VS Code with automated disk testing. |

Every Section overview page also provides:
- **After this section you will know** — concrete competencies and learning outcomes mapped to specific modules.
- **Cheat Sheet** — a high-density, printable reference sheet.
- **Section Glossary** — key architectural and language terms.

---

## Interactive Learning Features

### Rich Lessons
- **What do you think? (Pre-tests)**: Priming questions before new topics. These are not graded; they spark curiosity and activate prior knowledge.
- **Code Predictions**: Predict the output of a code snippet before the execution result is revealed. Afterwards, experiment freely in the sandbox.
- **Interactive Live Demos**: Tweak code and observe instant DOM updates. Many demos feature UI sliders and toggles alongside the live CSS declarations they produce.
- **Side-by-Side Comparisons**: Two code variations rendered adjacent to one another to highlight nuanced differences.
- **Memory Model Visualizations**: Step through code execution to visualize how stack variables and heap references point to memory objects.
- **Checkpoint Questions**: Formative questions placed throughout the lesson. The validator accommodates minor whitespace, quotes, and trailing semicolons.
- **Curated Callouts**: Distinct visual callout boxes:
  - **Remember** — Essential core takeaways.
  - **Watch Out / Pitfall** — Common bugs, browser quirks, and how to spot them.
  - **Tip** — Pro developer shortcuts and performance advice.
  - **Note** — Background context and specifications.
- **Glossary Tooltips**: Dotted underlined terms open concise definitions with direct links to official MDN documentation.

### Questions & Confidence Calibration
- Before submitting an answer in quizzes or checkpoints, select **"I'm confident"** or **"I'm guessing"**.
- Your section dashboard tracks your accuracy calibration. If you answer incorrectly with high confidence, the item is immediately placed in tomorrow's review queue.
- Incorrect answers do not immediately reveal the correct solution; instead, you receive tailored feedback explaining *why* your selection was incorrect so you can try again.

### The Code Workspace
- **Three-Pane Layout**:
  - **Left**: Task brief, user stories, and test assertions.
  - **Center**: CodeMirror 6 editor with file tabs and syntax highlighting.
  - **Right**: Live responsive preview pane and interactive console (for pure JS, the console sits directly below the editor).
- **Editable Code Horizon**: An illuminated band highlights the specific lines you need to edit (`--edit--`). Preceding and subsequent boilerplate code is cleanly collapsed (click to expand).
- **Run Tests (`Ctrl+Enter`)**: Executes the assertion suite. Passing tests turn green; failing tests display clear diagnostics in plain language explaining what was expected versus what your code produced.
- **Syntax Error Detection & Jump**: If your code cannot parse, the editor underlines the error and provides a **Jump to Line** button.
- **Infinite Loop Guard**: Accidentally write `while (true)`? Akademie's Acorn AST loop guard halts the runaway execution and informs you safely without crashing your browser tab.
- **Device Viewport Switcher**: Toggle preview dimensions: **Test Width**, **Tablet (768px)**, **Mobile (375px)**, or expand into **Full Panel**. Click **New Tab** to inspect the live DOM using your browser's native DevTools.
- **Node.js Runtime & HTTP Client**: In backend modules, the preview pane transforms into a live server terminal. Click **Run** to launch your script or server, and use the integrated **HTTP Client** to dispatch `GET`, `POST`, `PUT`, or `DELETE` requests with custom headers and JSON payloads.

### Diverse Step Types
- **Standard Step**: Write or complete code according to specifications.
- **Bug Fix (`kind: debug`)**: Fix flawed code authored by a "colleague". Follow a structured 4-step debugging methodology and strive for minimal diffs.
- **Parsons Problems / Line Sorting (`kind: parsons`)**: Assemble pre-written code lines into the correct sequence and indentation using the keyboard (`Enter` to move, `Up`/`Down` arrows to reorder, `Tab` to indent).
- **Recall Without Hints (`kind: recall`)**: Reinforce previous concepts without hand-holding.
- **Tool Selection (`kind: choose`)**: Choose the appropriate data structure or method independently.
- **Explain in Your Own Words (`kind: explain`)**: Write a short synthesis explaining why your solution works, then self-evaluate against an expert checklist.

---

## When You Get Stuck

1. **Tiered Hints**: Click **"I need a hint"** to reveal guidance one level at a time:
   - Level 1: Conceptual overview and links to relevant lesson sections.
   - Level 2: The exact method, CSS property, or syntax required.
   - Level 3: A concrete structural example demonstrating the pattern with different data.
2. **Visual Diff Comparison**: After exhausting hints, click **Compare with solution** to view a visual diff between your code and the reference implementation. Steps completed with diff assistance are flagged and scheduled for independent review tomorrow.
3. **"How the Author Solved It"**: After passing a step, explore alternative approaches under **Author's Solution** to see different idiomatic patterns.
4. **"I Couldn't Do This Again"**: If you solved a step but feel you haven't truly internalized it, click this button to add it to your Spaced Repetition queue for tomorrow.

---

## Spaced Repetition (SRS)

The **Repetition** (*Opakování*) item in the top navigation displays the count of items due for review today.

The review engine blends:
- Checkpoint questions from completed lessons.
- Quiz comprehension questions.
- Section flashcards (predicting output, writing declarations, interview questions).
- Whole workshop steps to write again from scratch.
- Key self-explanation points.

Items you answer correctly graduate to progressively wider intervals (**1 &rarr; 3 &rarr; 7 &rarr; 16 &rarr; 35 &rarr; 90 days**). Incorrect items reset to 1 day. If you've completely mastered an item, select **"I know this, don't show again"** to permanently retire it.

---

## Notes & "I Don't Understand"

- Press `N` (or click **Note** in the toolbar) to open your personal markdown notebook for the active section.
- **Quote Difficult Paragraphs**: Unsure about a particular paragraph in a lesson? Hover over it (or highlight a phrase) and click the **`?`** icon on the left. The exact quotation and anchor link are saved to your notes so you can annotate your question.
- All notes are stored as standard Markdown files in `data/poznamky/<section>.md`, making them easily readable and editable in VS Code.

---

## Keyboard Shortcuts

Press `?` anywhere in the app to display the keyboard shortcuts modal:

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Run tests on current code; if already passed, advance to next step |
| `Alt+&larr;` / `Alt+&rarr;` | Navigate to previous / next workshop step (or module) |
| `N` | Open personal notes for the current section |
| `?` | Show keyboard shortcuts reference |
| `Esc` | Close open modal, panel, or overlay |

*(Letter shortcuts are inactive while typing inside code editors or text fields.)*

---

## Working on Projects in VS Code

For larger, realistic multi-file projects:

1. Click **Start Project** on the project page. The project files are scaffolded into:
   ```
   moje-projekty/<section-slug>--<project-slug>/
   ```
2. The browser displays the exact directory path and a handy command to launch your local editor:
   ```bash
   code moje-projekty/<section-slug>--<project-slug>
   ```
3. Edit your files in VS Code, install packages, and test locally.
4. Return to the browser and click **Check**. The test runner reads your files directly from disk, verifies your code against the specification, and displays the results.
5. The `moje-projekty/` directory is strictly your own and is ignored by Git.

---

## Progress Storage & Resetting

All user data lives inside the `data/` directory:

| File / Directory | Purpose |
|---|---|
| `data/progress.json` | Completed steps, quiz scores, and saved code drafts |
| `data/pokusy.json` | Attempt logs, failed checks, and hint unlock history |
| `data/opakovani.json` | Spaced Repetition queue and review intervals |
| `data/jistota.json` | Confidence calibration telemetry |
| `data/nastaveni.json` | User preferences (theme mode, viewport widths) |
| `data/poznamky/` | Personal markdown notes organized by section |
| `moje-projekty/` | Your personal VS Code workspaces |

### How to Reset

- **Reset a Single Step**: Click **Reset Step** inside the workspace.
- **Retake a Quiz**: Click **Retake Quiz**.
- **Restart a VS Code Project**: Delete (or rename) the project folder inside `moje-projekty/` and click **Start Project** again.
- **Start the Entire Course From Scratch**:
  1. Stop the server (`Ctrl+C`).
  2. Delete `data/progress.json`, `data/pokusy.json`, and `data/opakovani.json`.
  3. Restart with `./start.sh`. *(Your notes in `data/poznamky/` and your projects in `moje-projekty/` will remain intact!)*

---

## For Content Authors & Contributors

Curriculum content resides in `content/` as Markdown and JSON.

- **[docs/kontrakt.md](docs/kontrakt.md)** — Formal specification for step blocks, frontmatter, assert APIs, and test harnesses.
- **[docs/styl-obsahu.md](docs/styl-obsahu.md)** — Pedagogical guidelines for authoring lessons, workshops, hints, and explanations.
- **[docs/platforma.md](docs/platforma.md)** — Architectural reference detailing extension points, UI slots, and event buses.
- **Automated Verification**:
  ```bash
  npm run overit                     # Verify entire curriculum
  npm run overit -- content/css-grid # Verify a single section
  npm test                           # Run platform test suite
  ```
