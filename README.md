# Fraction Explorers — Synthesis Tutor Clone

A web-based fraction equivalence lesson for elementary students,
built as a Synthesis Tutor clone for the Superbuilders hiring challenge.

Live Demo: https://synthesis-tutor.vercel.app

---

## What It Does

Students drag colorful fraction pieces onto a workspace to explore
equivalence (e.g. 2 halves = 1 whole, 4 fourths = 1 whole).
A friendly AI tutor named Mia guides them through a scripted lesson,
gives wrong-answer hints powered by Claude, and ends with a 5-question quiz.

---

## Tech Stack & Why

| Technology | Decision |
|---|---|
| Vite + React 18 | Fast static deploy, no backend needed |
| Tailwind CSS | Rapid iteration, responsive without media query sprawl |
| SVG + Pointer Events API | Crisp at all resolutions, single code path for touch + mouse |
| useReducer state machine | Mirrors Synthesis scripted lesson architecture |
| Claude Haiku API | Wrong-answer hints only — AI where it adds value, not everywhere |
| Vercel | Git push = instant deploy |
| canvas-confetti | Quiz completion celebration |

---

## Key Product Decisions

Scripted lesson + selective AI: The lesson flow is deterministic
(20 nodes, JSON-driven). Claude Haiku is called only on wrong answers
to generate contextual hints. This keeps the experience reliable and
fast for kids while using AI where it genuinely helps.

Dark game aesthetic: Chose an immersive dark theme over a standard
light UI to increase engagement for elementary students. Inspired by
games kids already love.

Alignment-aware validation: Placing the right pieces is not enough —
students must line them up along the guide line. This reinforces the
visual understanding of equivalence, not just counting.

---

## Setup

1. Clone the repo
   git clone https://github.com/MandeeTopicz/synthesis-tutor.git
   cd synthesis-tutor
   npm install

2. Create a .env file in the project root:
   VITE_ANTHROPIC_API_KEY=your_api_key_here

3. Run locally:
   npm run dev
   Open http://localhost:5173

---

## Deploy

   npm run build
   vercel --prod

Set VITE_ANTHROPIC_API_KEY in Vercel project environment variables.

---

## Architecture

src/
  data/lessonScript.js       20 lesson nodes, 5 quiz questions
  lib/claudeTutor.js         Claude Haiku API call for hints
  lib/alignmentCheck.js      Spatial validation for piece placement
  components/
    LandingPage.jsx          Avatar + difficulty selection
    LessonEngine.jsx         useReducer state machine
    FractionWorkspace.jsx    Drag-and-drop manipulative
    FractionBar.jsx          SVG fraction piece
    TutorOverlay.jsx         Floating Mia avatar + message
    CheckQuiz.jsx            End-of-lesson quiz
    LessonHeader.jsx         Progress header

---

## Evaluation

- Lesson flow: explore → learn equivalence → compare → quiz
- Quiz: 5 questions, pass = 4/5 correct, triggers confetti
- Claude hints: contextual, grade-appropriate, never gives answer directly
- Touch + mouse: iPad Safari and desktop Chrome

---

Built by Mandee Topicz · Gauntlet AI G4 · March 2026
