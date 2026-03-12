# PRD Task List — Synthesis Tutor Clone

Status as of review. Check off = implemented; empty = not done or partial.

---

## 1. Project & Tech Stack

- [x] **1.1** Single-lesson, web-based fraction equivalence tutor (ages 7–11)
- [x] **1.2** React 18 + Vite
- [x] **1.3** Tailwind CSS v3
- [x] **1.4** Manipulative: SVG + Pointer Events API (no canvas library)
- [x] **1.5** Lesson: useReducer state machine, JSON-driven script
- [x] **1.6** AI: Anthropic Claude API (`claude-haiku-4-5-20251001`) for wrong-answer hints only
- [ ] **1.7** Deployment: Vercel via `vercel` CLI
- [x] **1.8** API key: `import.meta.env.VITE_ANTHROPIC_API_KEY` in `.env`, never hardcoded

---

## 2. File Structure

PRD specifies exact structure. Current state:

- [x] **2.1** `.env` (create locally), `.env.example`, `.gitignore` includes `.env`, `node_modules`, `dist`
- [x] **2.2** `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `README.md`, `public/`
- [x] **2.3** `src/main.jsx`, `src/App.jsx`, `src/index.css`
- [x] **2.4** `src/data/lessonScript.js` — full lesson JSON (all 20 nodes + quizQuestions)
- [x] **2.5** `src/lib/claudeTutor.js` — Claude API utility
- [x] **2.6** `src/components/FractionBar.jsx`
- [x] **2.7** `src/components/FractionWorkspace.jsx`
- [ ] **2.8** `src/components/TutorChat.jsx` — PRD names this; app has `TutorOverlay.jsx` (chat + overlay combined)
- [x] **2.9** `src/components/LessonEngine.jsx`
- [x] **2.10** `src/components/CheckQuiz.jsx`

**Extra files not in PRD:** `LandingPage.jsx`, `LessonHeader.jsx`, `AdvanceButton.jsx`, `TutorOverlay.jsx` (replaces TutorChat in practice).

---

## 3. Design System

### 3.1 Color Palette

- [x] **3.1.1** `FRACTION_COLORS` — whole, half, third, fourth, sixth, eighth (Indigo, Coral, Emerald, Sky Blue, Violet, Rose)
- [ ] **3.1.2** App UI colors per PRD (slate-50 bg, white chat, etc.) — app uses a **dark theme** in places (workspace, quiz, overlay); PRD specifies light UI. Align or document as intentional.

### 3.2 Typography

- [x] **3.2.1** Google Fonts in `index.html`: Nunito + Inter
- [x] **3.2.2** Tutor/headings: `font-family: 'Nunito', sans-serif`
- [x] **3.2.3** UI/chat: `font-family: 'Inter', sans-serif`
- [x] **3.2.4** Fraction labels on pieces: Nunito bold, white

### 3.3 Layout — Split Screen

- [ ] **3.3.1** Header: "Fraction Explorers 🍕" + progress bar; **56px fixed** height
- [ ] **3.3.2** Main: Tutor chat **35% width**, Fraction workspace **65% width** (exact PRD split)
- [ ] **3.3.3** iPad 768px–1024px: side-by-side, **min 320px** per panel
- [ ] **3.3.4** Both panels independently scrollable

*Current layout: full-screen lesson with overlay chat and full-width workspace; no explicit 35/65 split.*

### 3.4 Animations

- [x] **3.4.1** Tutor messages: fade-in + slight translateY (e.g. `tutor-message-fade`, `message-fade-in` in CSS)
- [x] **3.4.2** Fraction pieces: `transition: transform 150ms ease, box-shadow 150ms ease` on drag
- [x] **3.4.3** Correct answer: green flash + checkmark in chat/overlay
- [x] **3.4.4** Wrong answer: gentle shake on piece/feedback (`@keyframes shake`)
- [x] **3.4.5** Lesson completion: confetti (`canvas-confetti`), fires when quiz score ≥ 4

---

## 4. Component Specifications

### 4.1 App.jsx

- [ ] **4.1.1** State: `lessonPhase` ('explore' | 'learn' | 'quiz' | 'complete'), `workspaceState` (e.g. placedPieces) — *App has `gameState` (landing/playing), `lessonPhase`, etc.; flow differs (Landing → LessonEngine).*
- [x] **4.1.2** Layout: header + main (TutorChat + FractionWorkspace); CheckQuiz as overlay when phase === 'quiz'
- [x] **4.1.3** Quiz completion leads back to landing / completion flow

### 4.2 lessonScript.js

- [x] **4.2.1** All 20 nodes with correct shape (id, phase, tutorMessage, tutorEmotion, expectsAction, correctAnswer, hint, branches)
- [x] **4.2.2** Action types used: free_explore, fill_whole, answer_number, answer_choice
- [x] **4.2.3** quizQuestions array: 5 questions (multiple_choice, fill_blank, true_false), showBars where specified

*PRD also lists find_equivalent, compare_visual — not used in the 20 nodes.*

### 4.3 claudeTutor.js

- [x] **4.3.1** `getClaudeHint({ wrongAnswer, correctAnswer, questionText, attemptNumber, nodeId })`
- [x] **4.3.2** System prompt: Mia, 1–2 sentences, attempt 1 = hint not answer, attempt 2 = more direct
- [x] **4.3.3** Model: `claude-haiku-4-5-20251001`, max_tokens 150
- [x] **4.3.4** API key from `import.meta.env.VITE_ANTHROPIC_API_KEY`; fallback string on error

### 4.4 FractionBar.jsx

- [x] **4.4.1** Props: fraction, width, height, draggable, inTray, onDragStart, onDragEnd, isPlaced, (onSplit), x, y
- [x] **4.4.2** SVG: rect (fill, rx 6) + text (label), Nunito bold white
- [x] **4.4.3** Pointer Events: setPointerCapture, offset, translate on move, onDragEnd with final position + offsetX/offsetY
- [x] **4.4.4** Visual states: default, dragging (scale 1.05 + shadow), placed (drop-shadow), cursor grab
- [x] **4.4.5** touch-action: none on draggable

### 4.5 FractionWorkspace.jsx

- [x] **4.5.1** State: placedPieces (id, fraction, x, y, width); reference bar = 1 whole at top
- [x] **4.5.2** Layout: reference row → drop zone (with “One Whole” guide line + ticks) → clear → piece tray
- [x] **4.5.3** Piece widths = (1/denom) × whole width; tray: whole, half, third, fourth, sixth, eighth
- [x] **4.5.4** Events from engine: highlight_piece, clear_workspace (counter), check_fill via onPiecesPlaced
- [x] **4.5.5** Events to engine: onPiecesPlaced({ pieces, fills }) — fills = sum to one whole (no alignment requirement)
- [x] **4.5.6** Drop uses grab offset so pieces don’t jump on release

### 4.6 TutorChat / TutorOverlay

- [x] **4.6.1** Messages list (tutor left, student right); current tutor message + emotion
- [x] **4.6.2** Avatar with emotion (happy, excited, thinking, encouraging) — CSS-only
- [x] **4.6.3** Input by expectsAction: free_explore → “Next”; fill_whole → “Check my answer”; answer_number → number input + Submit; answer_choice → choice buttons
- [x] **4.6.4** Loading: “...” or similar while Claude hint loading
- [ ] **4.6.5** PRD: TutorChat as 35% panel with scrollable messages; current: TutorOverlay floating over workspace. Layout differs.

### 4.7 LessonEngine.jsx

- [x] **4.7.1** useReducer: currentNodeId, phase, messages, attemptCount, workspacePieces, workspaceFills, isLoadingHint, quizScore, quizComplete, highlightPiece, clearWorkspaceCounter
- [x] **4.7.2** Actions: ADVANCE_NODE, WRONG_ANSWER, SET_HINT_LOADING, RECEIVE_HINT, ADD_MESSAGE, UPDATE_WORKSPACE, START_QUIZ, QUIZ_ANSWER, QUIZ_COMPLETE, SET_HIGHLIGHT_PIECE, CLEAR_WORKSPACE
- [x] **4.7.3** Validation: free_explore ✓; answer_number (trim string); answer_choice (exact match); fill_whole (pieces order-insensitive + fills)
- [x] **4.7.4** Wrong-answer flow: WRONG_ANSWER → if attemptCount < 2 call getClaudeHint → RECEIVE_HINT; if ≥ 2 show reveal + advance to branches.incorrect
- [x] **4.7.5** Quiz: phase === 'quiz' → render CheckQuiz only; workspace + overlay hidden

### 4.8 CheckQuiz.jsx

- [x] **4.8.1** Full overlay over workspace; one question at a time
- [x] **4.8.2** Progress: “Question X of 5” + dots
- [x] **4.8.3** showBars: true → fraction bars for choices where applicable
- [x] **4.8.4** Correct: green flash, checkmark, advance after delay
- [x] **4.8.5** Wrong: red flash, shake, “Try again!”; one retry then reveal answer
- [x] **4.8.6** Completion: ≥4 correct → “You crushed it!” + confetti; ≤3 → “Good try!” / review (score shown)
- [x] **4.8.7** canvas-confetti imported and fired on success (score ≥ 4)

---

## 5. Environment & HTML

- [x] **5.1** `.env` with `VITE_ANTHROPIC_API_KEY`
- [x] **5.2** `.env.example` with placeholder
- [x] **5.3** `index.html`: charset, viewport (max-scale=1.0), title, Google Fonts, root + main.jsx

---

## 6. npm & Build

- [x] **6.1** `npm install canvas-confetti` (in package.json)

---

## 7. iPad / Accessibility

- [ ] **7.1** Touch targets minimum 44×44px
- [x] **7.2** Pointer Events (not mouse-only) for drag
- [ ] **7.3** No hover-only interactions; tap works
- [ ] **7.4** No fixed widths that break below 768px
- [ ] **7.5** Tested in Safari on iPad (or simulator)
- [x] **7.6** touch-action: none on draggables; viewport maximum-scale=1.0

---

## 8. README

- [ ] **8.1** PRD template: title, setup (clone, npm install, .env, npm run dev), deploy (vercel --prod), Technical Approach (architecture, manipulative, AI, lesson design). *Current README is default Vite template.*

---

## 9. Definition of Done (PRD §12)

- [x] **9.1** Lesson runs end-to-end: explore → learn → quiz → completion
- [x] **9.2** Fraction pieces drag and drop (desktop + touch)
- [x] **9.3** Tutor: correct → celebration; wrong → Claude hint
- [x] **9.4** Quiz renders, scores, completes
- [x] **9.5** Confetti on lesson completion (≥4/5)
- [ ] **9.6** Deployed to public Vercel URL
- [ ] **9.7** Tested in Safari on iPad (or simulator)
- [ ] **9.8** No console errors in production build
- [ ] **9.9** README complete per PRD

---

## Summary: What’s Left to Discuss

1. **Layout** — PRD wants 35% chat / 65% workspace with 56px header. Current design is full-screen workspace with floating tutor overlay. Keep current or refactor to split panel?
2. **Design system** — PRD specifies light UI (slate-50, white chat). App uses dark theme in workspace/quiz. Standardize on PRD palette or keep dark and document?
3. **File naming** — PRD: `TutorChat.jsx`. App: `TutorOverlay.jsx` (and LandingPage, LessonHeader, AdvanceButton). Rename/merge to match PRD or leave as is?
4. **README** — Replace with PRD template (Fraction Explorers, setup, deploy, technical approach).
5. **Deploy & test** — Vercel deploy, Safari/iPad test, production build check.
6. **Polish** — 44px touch targets, no hover-only, responsive 768px/320px minimums if aligning to PRD layout.

If you tell me your priorities (e.g. “ship as-is” vs “strict PRD compliance”), we can turn the unchecked items into a short ordered todo list next.
