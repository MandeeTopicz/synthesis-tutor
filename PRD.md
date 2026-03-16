# PRD: Synthesis Tutor Clone — Fraction Equivalence Lesson
**Version:** 1.0 | **Stack:** Vite + React + Tailwind | **Deploy:** Vercel | **Due:** 24 hours

---

## 1. Project Overview

Build a single-lesson, web-based math tutor that teaches **fraction equivalence** to elementary-age students (ages 7–11). The app replicates the Synthesis Tutor experience: a conversational tutor paired with an interactive digital manipulative. The lesson must feel like exploration, not homework.

**This is a hiring partner demo. Polish and AI integration matter as much as functionality.**

---

## 2. Tech Stack (Do Not Deviate)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite | Already scaffolded |
| Styling | Tailwind CSS v3 | Already installed |
| Manipulative | SVG + Pointer Events API | No canvas library |
| Lesson Engine | useReducer state machine | JSON-driven script |
| AI | Anthropic Claude API (`claude-haiku-4-5-20251001`) | Wrong-answer hints only |
| Deployment | Vercel | via `vercel` CLI |
| API Key | `import.meta.env.VITE_ANTHROPIC_API_KEY` | `.env` file, never hardcoded |

---

## 3. File Structure

Create exactly this structure. Do not add files not listed here.

```
synthesis-tutor/
├── .env                          # VITE_ANTHROPIC_API_KEY=sk-ant-...
├── .env.example                  # VITE_ANTHROPIC_API_KEY=your_key_here
├── .gitignore                    # includes .env
├── index.html
├── vite.config.js
├── tailwind.config.js            # already configured
├── postcss.config.js             # already configured
├── README.md
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx                   # root layout, owns lessonState
    ├── index.css                 # tailwind directives only
    ├── data/
    │   └── lessonScript.js       # full lesson JSON — all 20 nodes
    ├── lib/
    │   └── claudeTutor.js        # Claude API utility function
    └── components/
        ├── TutorChat.jsx         # chat UI, avatar, messages, input
        ├── LessonEngine.jsx      # state machine, connects script to UI
        ├── FractionWorkspace.jsx # manipulative container + tray
        ├── FractionBar.jsx       # single draggable SVG fraction piece
        └── CheckQuiz.jsx         # end-of-lesson quiz (3-5 problems)
```

---

## 4. Design System

### 4.1 Color Palette

```js
// Fraction piece colors — one per denominator, consistent everywhere
const FRACTION_COLORS = {
  whole: { bg: "#4F46E5", text: "#FFFFFF", label: "1" },      // Indigo
  half:  { bg: "#F97316", text: "#FFFFFF", label: "1/2" },    // Coral
  third: { bg: "#10B981", text: "#FFFFFF", label: "1/3" },    // Emerald
  fourth:{ bg: "#0EA5E9", text: "#FFFFFF", label: "1/4" },    // Sky Blue
  sixth: { bg: "#8B5CF6", text: "#FFFFFF", label: "1/6" },    // Violet
  eighth:{ bg: "#F43F5E", text: "#FFFFFF", label: "1/8" },    // Rose
};

// App UI colors
const UI = {
  bgApp:       "#F8FAFC",   // slate-50, overall background
  bgChat:      "#FFFFFF",   // white chat panel
  bgWorkspace: "#F1F5F9",   // slate-100 workspace panel
  tutorBubble: "#EFF6FF",   // blue-50
  studentBubble: "#F0FDF4", // green-50
  brandBlue:   "#1E3A5F",   // headings, tutor name
  accentOrange:"#E8681A",   // CTA buttons, highlights
  textPrimary: "#1E293B",   // slate-800
  textSecondary:"#64748B",  // slate-500
  correct:     "#16A34A",   // green-600
  incorrect:   "#DC2626",   // red-600
};
```

### 4.2 Typography

```html
<!-- In index.html <head> -->
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

- **Tutor name / headings:** `font-family: 'Nunito', sans-serif` — bold, rounded, kid-friendly
- **UI text / chat:** `font-family: 'Inter', sans-serif` — clean, readable
- **Fraction labels on pieces:** `Nunito` bold, white

### 4.3 Layout — Split Screen

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: "Fraction Explorers 🍕" + progress bar          │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   TUTOR CHAT         │   FRACTION WORKSPACE             │
│   (35% width)        │   (65% width)                   │
│                      │                                  │
│   - Avatar           │   - Reference row (1 whole)      │
│   - Chat bubbles     │   - Free workspace               │
│   - Input / buttons  │   - Piece tray at bottom         │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

- On iPad (768px–1024px): side-by-side maintained, minimum 320px each panel
- Both panels independently scrollable
- Header height: 56px fixed

### 4.4 Animations

- Tutor messages: fade-in + slight translateY (0px → appear), staggered word reveal NOT required — bubble-by-bubble is fine
- Fraction pieces: `transition: transform 150ms ease, box-shadow 150ms ease` on drag lift
- Correct answer: green flash + checkmark emoji in chat
- Wrong answer: gentle shake on the piece (`@keyframes shake`)
- Lesson completion: confetti burst (use `canvas-confetti` npm package)

---

## 5. Component Specifications

### 5.1 `App.jsx`

**Responsibilities:** Root layout, owns `lessonPhase` state, renders header + split layout.

```jsx
// State owned here:
const [lessonPhase, setLessonPhase] = useState('explore'); // 'explore' | 'learn' | 'quiz' | 'complete'
const [workspaceState, setWorkspaceState] = useState({ placedPieces: [] });

// Layout:
// header (fixed top)
// main (flex row)
//   └─ TutorChat (flex-shrink-0, w-[35%])
//   └─ FractionWorkspace (flex-1)
// CheckQuiz renders as overlay when lessonPhase === 'quiz'
```

---

### 5.2 `data/lessonScript.js`

**The complete lesson. This is the most important file — get it right.**

```js
// Node shape:
{
  id: "node_01",
  phase: "explore",                    // "explore" | "learn" | "quiz"
  tutorMessage: "string",              // what the tutor says
  tutorEmotion: "happy",               // "happy" | "thinking" | "excited" | "encouraging"
  expectsAction: "free_explore",       // see action types below
  correctAnswer: null,                 // string | number | null
  hint: "string",                      // static fallback hint (Claude overrides this)
  branches: {
    correct: "node_03",                // next node id on correct
    incorrect: "node_02_retry",        // next node id on incorrect (after Claude hint)
    advance: "node_03"                 // for free_explore nodes, manual advance
  }
}

// Action types:
// "free_explore"    — no answer expected, student explores freely, "Next" button shown
// "fill_whole"      — student must fill reference bar with specific pieces
// "answer_number"   — student types or selects a number
// "answer_choice"   — student selects from 2-3 options shown as buttons
// "find_equivalent" — student must find a piece equivalent to a shown fraction
// "compare_visual"  — student places two fractions to compare them
```

**Write all 20 nodes below. This IS the lesson:**

```js
export const lessonScript = [
  // ── PHASE 1: EXPLORE (nodes 1-4) ──────────────────────────────────

  {
    id: "node_01",
    phase: "explore",
    tutorMessage: "Hi! I'm Mia, your math guide today 👋 Welcome to the Fraction Workshop! You can see some colorful fraction pieces on the right. Go ahead and drag them around — there's no right or wrong here. Just explore and see what you notice!",
    tutorEmotion: "excited",
    expectsAction: "free_explore",
    correctAnswer: null,
    hint: null,
    branches: { advance: "node_02" }
  },
  {
    id: "node_02",
    phase: "explore",
    tutorMessage: "Nice exploring! 🎉 I see you checking out the pieces. Can you drag exactly TWO of the orange pieces (the 1/2 pieces) into the workspace and line them up side by side?",
    tutorEmotion: "happy",
    expectsAction: "fill_whole",
    correctAnswer: { pieces: ["half", "half"], fills: true },
    hint: "Try dragging two of the orange 1/2 pieces from the tray at the bottom!",
    branches: { correct: "node_03", incorrect: "node_02_retry" }
  },
  {
    id: "node_02_retry",
    phase: "explore",
    tutorMessage: "Almost! I need exactly two of the orange 1/2 pieces lined up. The orange ones say '1/2' on them — can you find them in the tray?",
    tutorEmotion: "encouraging",
    expectsAction: "fill_whole",
    correctAnswer: { pieces: ["half", "half"], fills: true },
    hint: "Look for the orange pieces in the tray at the bottom. Drag two of them up!",
    branches: { correct: "node_03", incorrect: "node_03" }
  },
  {
    id: "node_03",
    phase: "explore",
    tutorMessage: "Yes!! 🎊 Look at that — two 1/2 pieces fit PERFECTLY to make one whole bar! That means 2 halves = 1 whole. Pretty cool, right?",
    tutorEmotion: "excited",
    expectsAction: "free_explore",
    correctAnswer: null,
    hint: null,
    branches: { advance: "node_04" }
  },
  {
    id: "node_04",
    phase: "explore",
    tutorMessage: "Now try this: Can you fill the whole bar using only the BLUE pieces (those are the 1/4 pieces)? How many do you need?",
    tutorEmotion: "thinking",
    expectsAction: "fill_whole",
    correctAnswer: { pieces: ["fourth","fourth","fourth","fourth"], fills: true },
    hint: "You'll need more than 2! Try adding blue 1/4 pieces one at a time until the bar is full.",
    branches: { correct: "node_05", incorrect: "node_04_retry" }
  },
  {
    id: "node_04_retry",
    phase: "explore",
    tutorMessage: "Not quite yet — the bar isn't completely filled. Keep adding blue 1/4 pieces until there are no gaps!",
    tutorEmotion: "encouraging",
    expectsAction: "fill_whole",
    correctAnswer: { pieces: ["fourth","fourth","fourth","fourth"], fills: true },
    hint: "Count how many blue pieces fit — keep going until the whole bar is covered!",
    branches: { correct: "node_05", incorrect: "node_05" }
  },

  // ── PHASE 2: LEARN (nodes 5-14) ───────────────────────────────────

  {
    id: "node_05",
    phase: "learn",
    tutorMessage: "Fantastic! It takes FOUR blue 1/4 pieces to fill the whole bar. So 4/4 = 1 whole! 🧠 Now here's the big question — how many 1/4 pieces do you think would equal one 1/2 piece?",
    tutorEmotion: "thinking",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "Try placing 1/4 pieces next to a 1/2 piece in the workspace and see when they match!",
    branches: { correct: "node_06", incorrect: "node_05_retry" }
  },
  {
    id: "node_05_retry",
    phase: "learn",
    tutorMessage: "Good try! Let's use the pieces to check. Place one orange 1/2 piece in the workspace, then start adding blue 1/4 pieces next to it. Stop when they're the same length. How many did you need?",
    tutorEmotion: "encouraging",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "Look at how the lengths compare — when do the blue pieces match the orange piece exactly?",
    branches: { correct: "node_06", incorrect: "node_06" }
  },
  {
    id: "node_06",
    phase: "learn",
    tutorMessage: "EXACTLY RIGHT! 🌟 Two 1/4 pieces = one 1/2 piece. That means 2/4 is the SAME as 1/2. These are called EQUIVALENT FRACTIONS — different numbers, same value. Can you say that back to me? What are fractions that are different but equal called?",
    tutorEmotion: "excited",
    expectsAction: "answer_choice",
    correctAnswer: "equivalent fractions",
    choices: ["equivalent fractions", "equal numbers", "fraction twins"],
    hint: "It starts with 'equivalent' — I just told you! 😄",
    branches: { correct: "node_07", incorrect: "node_06_retry" }
  },
  {
    id: "node_06_retry",
    phase: "learn",
    tutorMessage: "So close! Fractions that look different but have the same value are called EQUIVALENT fractions. Like how 2/4 and 1/2 are the same size. Got it?",
    tutorEmotion: "encouraging",
    expectsAction: "answer_choice",
    correctAnswer: "equivalent fractions",
    choices: ["equivalent fractions", "equal numbers", "fraction twins"],
    hint: "The word we're looking for is 'equivalent' — which answer has that word?",
    branches: { correct: "node_07", incorrect: "node_07" }
  },
  {
    id: "node_07",
    phase: "learn",
    tutorMessage: "Perfect! 🎯 Now let's find more equivalent fractions. Take a look at the 1/3 piece (that's the green one). How many 1/6 pieces do you think will equal one 1/3 piece?",
    tutorEmotion: "thinking",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "Try placing the green 1/3 piece and then adding purple 1/6 pieces next to it!",
    branches: { correct: "node_08", incorrect: "node_07_retry" }
  },
  {
    id: "node_07_retry",
    phase: "learn",
    tutorMessage: "Try it with the pieces! Place a green 1/3 piece in the workspace and add purple 1/6 pieces next to it until they match.",
    tutorEmotion: "encouraging",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "Keep adding 1/6 pieces until the length matches the 1/3 piece exactly.",
    branches: { correct: "node_08", incorrect: "node_08" }
  },
  {
    id: "node_08",
    phase: "learn",
    tutorMessage: "Yes! 2/6 = 1/3 — they're equivalent! 🟢 Let's keep going. How many 1/8 pieces equal one 1/4 piece?",
    tutorEmotion: "happy",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "Use the pieces to check! Place a blue 1/4 piece and add pink 1/8 pieces.",
    branches: { correct: "node_09", incorrect: "node_08_retry" }
  },
  {
    id: "node_08_retry",
    phase: "learn",
    tutorMessage: "Try it with the pieces! A blue 1/4 piece and some pink 1/8 pieces — how many 1/8 pieces line up to match the 1/4 piece?",
    tutorEmotion: "encouraging",
    expectsAction: "answer_number",
    correctAnswer: "2",
    hint: "How many pink 1/8 pieces fit inside one blue 1/4 piece?",
    branches: { correct: "node_09", incorrect: "node_09" }
  },
  {
    id: "node_09",
    phase: "learn",
    tutorMessage: "You're on fire! 🔥 2/8 = 1/4. Do you notice a pattern? Every time we found an equivalent fraction, what happened to the number of pieces?",
    tutorEmotion: "thinking",
    expectsAction: "answer_choice",
    correctAnswer: "it doubled",
    choices: ["it doubled", "it stayed the same", "it tripled"],
    hint: "1/2 needed 2 pieces of 1/4... 1/3 needed 2 pieces of 1/6... what did the number of pieces do?",
    branches: { correct: "node_10", incorrect: "node_09_retry" }
  },
  {
    id: "node_09_retry",
    phase: "learn",
    tutorMessage: "Let's count together: 1 half needed 2 fourths. 1 third needed 2 sixths. 1 fourth needed 2 eighths. What happened each time?",
    tutorEmotion: "encouraging",
    expectsAction: "answer_choice",
    correctAnswer: "it doubled",
    choices: ["it doubled", "it stayed the same", "it tripled"],
    hint: "1 piece became 2 pieces every time — what do we call that?",
    branches: { correct: "node_10", incorrect: "node_10" }
  },
  {
    id: "node_10",
    phase: "learn",
    tutorMessage: "Brilliant! The number doubled each time! That's because when you split each piece in half, you need twice as many pieces to cover the same space. You just figured out one of the big secrets of equivalent fractions! 🏆 Ready for the final challenge?",
    tutorEmotion: "excited",
    expectsAction: "free_explore",
    correctAnswer: null,
    hint: null,
    branches: { advance: "node_quiz_intro" }
  },
  {
    id: "node_quiz_intro",
    phase: "learn",
    tutorMessage: "Amazing work today! 🌟 You've learned what equivalent fractions are and how to find them using the pieces. Now let's see what you remember! I have 5 quick questions for you. You need to get 4 right to complete the lesson. You've totally got this! 💪",
    tutorEmotion: "excited",
    expectsAction: "free_explore",
    correctAnswer: null,
    hint: null,
    branches: { advance: "quiz_start" }
  }
];

// ── QUIZ QUESTIONS (separate array, used by CheckQuiz.jsx) ──────────
export const quizQuestions = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "Which fraction is equivalent to 1/2?",
    choices: ["1/4", "2/4", "3/4"],
    correctAnswer: "2/4",
    showBars: true,   // render visual fraction bars with the choices
  },
  {
    id: "q2",
    type: "fill_blank",
    question: "1/3 = ?/6",
    prompt: "How many sixths equal one third?",
    correctAnswer: "2",
  },
  {
    id: "q3",
    type: "true_false",
    question: "True or False: 3/4 = 6/8",
    correctAnswer: "true",
    hint: "Try placing 3 blue pieces and 6 pink pieces in the workspace!",
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "How many 1/8 pieces equal 1/4?",
    choices: ["1", "2", "4"],
    correctAnswer: "2",
    showBars: true,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: "Which pair shows equivalent fractions?",
    choices: ["1/2 and 1/4", "2/4 and 1/2", "1/3 and 1/4"],
    correctAnswer: "2/4 and 1/2",
    showBars: false,
  }
];
```

---

### 5.3 `lib/claudeTutor.js`

```js
// Called when student gets an answer wrong.
// Returns a short, warm, personalized hint string.

export async function getClaudeHint({ wrongAnswer, correctAnswer, questionText, attemptNumber, nodeId }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const systemPrompt = `You are Mia, a warm and patient math tutor teaching fraction equivalence to a child aged 7-11. 
Speak simply and encouragingly. Never make the student feel bad for a wrong answer.
Keep your response to 1-2 short sentences maximum.
On attempt 1: give a gentle hint using a question — do NOT give the answer directly. Reference the fraction bars they can see on screen.
On attempt 2: be more direct and guide them to the answer step by step.
Always be warm, never condescending.`;

  const userMessage = `The student is working on: "${questionText}"
Their wrong answer was: "${wrongAnswer}"
The correct answer is: "${correctAnswer}"
This is attempt number: ${attemptNumber}
Give them a helpful hint.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text ?? "Hmm, let's try using the fraction pieces to check!";
  } catch (err) {
    console.error("Claude API error:", err);
    return "Let's try using the fraction pieces to double-check!";
  }
}
```

---

### 5.4 `components/FractionBar.jsx`

**Single draggable fraction piece. SVG-based.**

```jsx
// Props:
// - fraction: "whole" | "half" | "third" | "fourth" | "sixth" | "eighth"
// - width: number (px) — calculated from fraction value × workspace width
// - height: number (px) — fixed at 48px
// - draggable: boolean
// - inTray: boolean — true when sitting in the piece tray
// - onDragStart, onDragEnd: handlers
// - isPlaced: boolean — true when dropped in workspace
// - onSplit: () => void — called when user taps to split

// The bar renders as:
// <svg width={width} height={height}>
//   <rect fill={FRACTION_COLORS[fraction].bg} rx="6" width="100%" height="100%" />
//   <text fill="white" textAnchor="middle" dominantBaseline="central">
//     {FRACTION_COLORS[fraction].label}
//   </text>
// </svg>

// Drag behavior:
// - Use Pointer Events (onPointerDown, onPointerMove, onPointerUp)
// - On pointerdown: setPointerCapture, record offset
// - On pointermove: update position via transform: translate()
// - On pointerup: release capture, call onDrop with final position
// - Touch and mouse both handled automatically by Pointer Events

// Visual states:
// - Default: flat, colored
// - Dragging: slight scale(1.05) + drop-shadow
// - Placed in workspace: slight inner border to show it's placed
// - Hover (desktop): cursor: grab
```

---

### 5.5 `components/FractionWorkspace.jsx`

**The interactive manipulative container.**

```jsx
// State:
// - placedPieces: array of { id, fraction, x, y, width }
// - referenceBar: always shows "whole" at top as the reference

// Layout (top to bottom):
// 1. Reference row — 1 whole bar at top (not draggable, just visual reference)
// 2. Workspace area — free drop zone, pieces can be placed anywhere
// 3. Snap row — optional row that shows "alignment guide" at the whole bar width
// 4. Piece tray — horizontal strip at bottom with one of each fraction type

// The workspace width = 100% of the panel
// The "whole" reference bar defines the unit width
// Each fraction's pixel width = (1/denominator) × whole_width

// Piece tray contains: whole, half, third, fourth, sixth, eighth
// Each tray slot shows the piece + its label below

// Events the workspace listens for from LessonEngine:
// - "highlight_piece" (fraction) — visually highlight a specific piece type in tray
// - "clear_workspace" — remove all placed pieces
// - "check_fill" — verify if the workspace row is correctly filled

// Events the workspace emits up to LessonEngine:
// - "pieces_placed" ({ pieces: ["half", "half"], fills: boolean })
// - "answer_submitted" (value)
```

---

### 5.6 `components/TutorChat.jsx`

**The conversational interface.**

```jsx
// Props:
// - messages: array of { id, sender: "tutor"|"student", text, emotion }
// - onStudentAnswer: (answer) => void
// - currentNode: lesson node object
// - isLoading: boolean — true while Claude API is in-flight

// Layout:
// - Tutor avatar (top of panel) — simple CSS illustration
//   Circle head, two dot eyes, smile. Color: brandBlue background, white face.
//   Shows different expressions via CSS based on tutorEmotion.
// - Message list (scrollable, grows downward)
//   - Tutor bubbles: left-aligned, light blue bg, Mia avatar thumbnail
//   - Student bubbles: right-aligned, light green bg
// - Input area (fixed at bottom of chat panel):
//   - For "answer_number": number input + Submit button
//   - For "answer_choice": 2-3 choice buttons rendered inline
//   - For "free_explore": single "Next →" button
//   - For "fill_whole": "Check my answer" button (reads workspace state)
// - Loading state: animated "..." bubble while Claude is thinking

// Tutor avatar emotions (CSS-only, no images):
// happy: smile curve, normal eyes
// excited: wider smile, raised eyebrows (taller eye arcs)
// thinking: slight frown curve, one eyebrow raised
// encouraging: warm smile, slightly tilted head (CSS rotate on avatar)
```

---

### 5.7 `components/LessonEngine.jsx`

**The brain. Connects script → UI → Claude.**

```jsx
// This component is the orchestrator. It does NOT render UI directly.
// It uses useReducer to walk the lesson script.

// State shape:
const initialState = {
  currentNodeId: "node_01",
  phase: "explore",           // "explore" | "learn" | "quiz" | "complete"
  messages: [],               // full chat history
  attemptCount: 0,            // resets on each new node
  workspacePieces: [],        // synced from FractionWorkspace
  isLoadingHint: false,       // true while Claude API is in-flight
  quizScore: 0,               // increments on correct quiz answers
  quizComplete: false,
};

// Reducer actions:
// ADVANCE_NODE — move to next node (on correct answer or free_explore)
// WRONG_ANSWER — increment attemptCount, trigger Claude hint fetch
// SET_HINT_LOADING — toggle loading bubble
// RECEIVE_HINT — add Claude's hint as tutor message
// SUBMIT_ANSWER — validate against currentNode.correctAnswer
// UPDATE_WORKSPACE — sync placed pieces from FractionWorkspace
// START_QUIZ — transition phase to "quiz"
// QUIZ_ANSWER — handle quiz question correct/incorrect

// Answer validation:
// "answer_number": normalize to string, trim, compare
// "answer_choice": exact string match
// "fill_whole": check pieces array matches correctAnswer.pieces (order-insensitive) AND fills === true
// "free_explore": always treated as correct (just advance)
// "find_equivalent": check placed pieces match expected equivalence

// Flow for wrong answer:
// 1. Dispatch WRONG_ANSWER
// 2. If attemptCount < 2: call getClaudeHint(), dispatch RECEIVE_HINT
// 3. If attemptCount >= 2: show correctAnswer reveal + "Let's keep going!", advance to branches.incorrect
```

---

### 5.8 `components/CheckQuiz.jsx`

**End-of-lesson assessment.**

```jsx
// Renders as full overlay over the workspace panel (not the chat)
// The tutor chat remains visible and continues to respond

// Flow:
// - Shows one question at a time
// - Progress indicator: "Question 2 of 5" + filled dots
// - Visual fraction bars rendered for showBars: true questions
// - Correct: green flash, checkmark, advance after 1 second
// - Wrong: red flash, gentle shake, "Try again!" — ONE retry allowed, then reveal answer
// - After all 5 questions: show score

// Completion conditions:
// - 4 or 5 correct: "🏆 You crushed it! Lesson complete!" — trigger confetti
// - 3 or fewer correct: "Good try! Let's review..." — show review mode (not required for MVP, just show score)

// Import canvas-confetti for the completion celebration:
// npm install canvas-confetti
// import confetti from 'canvas-confetti'
// confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
```

---

## 6. Environment Setup

**`.env` file (create this, never commit):**
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

**`.env.example` (commit this):**
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

**`.gitignore` — make sure it includes:**
```
.env
node_modules
dist
```

---

## 7. `index.html` — Required Head Tags

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>Fraction Explorers — Math Tutor</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 8. Additional npm Package

```bash
npm install canvas-confetti
```

---

## 9. Build Order for Cursor

Build components in this exact order to avoid import errors:

1. `src/index.css` — Tailwind directives
2. `index.html` — add Google Fonts
3. `data/lessonScript.js` — full lesson data (provided above, copy exactly)
4. `lib/claudeTutor.js` — Claude API utility
5. `components/FractionBar.jsx` — SVG piece, no dependencies
6. `components/FractionWorkspace.jsx` — depends on FractionBar
7. `components/TutorChat.jsx` — chat UI, no component dependencies
8. `components/LessonEngine.jsx` — depends on claudeTutor, lessonScript
9. `components/CheckQuiz.jsx` — depends on lessonScript (quizQuestions)
10. `App.jsx` — assembles everything
11. `main.jsx` — entry point

---

## 10. iPad-Specific Requirements

- All touch targets minimum **44×44px** (Apple HIG)
- Use **Pointer Events API** (not mouse events) for all drag interactions
- No hover-only interactions — everything must work with tap
- No fixed widths that break below 768px
- Test in Safari on iPad (webkit has quirks with pointer capture)
- Set `touch-action: none` on draggable elements to prevent scroll conflict
- Viewport meta tag must include `maximum-scale=1.0` to prevent zoom on input focus

---

## 11. README Template

```md
# Fraction Explorers — Synthesis Tutor Clone

A conversational AI math tutor teaching fraction equivalence to elementary students. Built as a 1-week challenge for Gauntlet AI G4.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and add your Anthropic API key
4. `npm run dev`

## Deploy

`vercel --prod`

## Technical Approach

**Architecture:** Single-page React app (Vite) with a JSON-driven lesson state machine.

**Manipulative:** SVG-based fraction bars with Pointer Events API for touch + mouse drag. No canvas library — keeps the bundle lean and rendering crisp at all iPad resolutions.

**AI Integration:** Scripted lesson flow for reliability + Claude API (`claude-haiku-4-5-20251001`) for wrong-answer hints. The lesson always progresses correctly; Claude adds personalized coaching in the moments that matter. Estimated cost: < $0.001 per student per lesson.

**Lesson Design:** Three phases — Explore (free play), Learn (guided discovery), Check (assessment). Student must score 4/5 to complete.
```

---

## 12. Definition of Done

The app is complete when:

- [ ] Lesson runs end-to-end: explore → learn → quiz → completion screen
- [ ] Fraction pieces drag and drop on both desktop mouse and iPad touch
- [ ] Tutor responds to correct answers with celebration, wrong answers with Claude hint
- [ ] Quiz renders, scores, and completes correctly
- [ ] Confetti fires on lesson completion
- [ ] App is deployed to a public Vercel URL
- [ ] Tested in Safari on iPad (or iPad simulator)
- [ ] No console errors in production build
- [ ] README is complete

---

*PRD v1.0 — Synthesis Tutor Clone — Gauntlet AI G4 — Mandee*