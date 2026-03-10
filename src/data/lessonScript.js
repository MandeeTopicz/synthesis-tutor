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
    showBars: true,
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
