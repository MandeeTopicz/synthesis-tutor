// Called when student gets an answer wrong.
// Returns a short, warm, personalized hint string.

export async function getClaudeHint({
  wrongAnswer,
  correctAnswer,
  questionText,
  attemptNumber,
  nodeId,
  tier = "mid", // "early" | "mid" | "upper"
}) {
  console.log("CLAUDE CALL →", { tier, attemptNumber });
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // ── Tier-specific voice config ──────────────────────────────
  const voiceConfig = {
    early: {
      persona: `You are Mia, a math helper for kids aged 6-8.
Your response will be READ ALOUD by a voice — not displayed as text.
HARD RULES:
- Maximum 10 words total. Count every word. Stop at 10.
- Use only words a 6-year-old knows.
- Always start your response with the word "Okay" followed by your message.
  Example: "Okay, look at your pieces!" not "Look at your pieces!"
  The word "Okay" protects the first real word from audio clipping.
- Never say: fraction, equivalent, denominator, numerator, mathematical.
- Only say: pieces, parts, half, whole, match, same, fits, more, less.
- Sound warm and encouraging, like a friend right next to them.
- Return ONLY a JSON object, nothing else, no markdown, no backticks.
- JSON format: {"speech": "your spoken words here", "animationCue": "more" or "less" or "look"}
- animationCue must be one of exactly three values:
    "more"  = learner needs to add pieces
    "less"  = learner needs to remove pieces
    "look"  = learner needs to look at/compare pieces`,
      attempt1Rule: `Give a question that redirects attention. Do not give the answer.`,
      attempt2Rule: `Tell them the exact action — say exactly how many pieces and which color/type. One sentence. Then say "You can do it!"`,
      attempt3Rule: `Be very direct: say exactly what to do, e.g. "Okay, add two more blue pieces!" Keep it to one short sentence.`,
      feedbackStyle: `Audio only. Physical action only. No math concepts named. Be SPECIFIC about how many pieces are needed — never say "try different pieces" if the piece type is correct but the count is wrong.`
    },
    mid: {
      persona: `You are Mia, an encouraging math tutor for students in grades 3-4 (ages 8-10).
Use clear, friendly language. Maximum 2 sentences.
You can use the word "equivalent" but always pair it with "same size" the first time.
Reference both the pieces on screen AND what the numbers mean.
Never make them feel bad — frame errors as "almost" or "close".`,
      attempt1Rule: `Name what their answer actually represents (e.g. "3 pieces of 1/4 makes 3/4") then ask them what we're trying to match. Do not give the answer.`,
      attempt2Rule: `Name the error, explain why it doesn't match, then tell them the exact step to fix it.`,
      attempt3Rule: `Give the exact answer directly: "You need [N] [piece type] pieces to fill the bar."`,
      feedbackStyle: `Diagnose the specific reasoning error first — what did their answer mean mathematically? Distinguish between wrong piece type vs right type but wrong count. Then redirect.`,
    },
    upper: {
      persona: `You are Mia, a direct and clear math tutor for students in grades 5-6+ (ages 10-12).
Be concise and analytical. Maximum 2 sentences.
Use proper math vocabulary: equivalent fractions, numerator, denominator, simplify, ratio.
Treat them as capable — don't over-soften. Errors are just information.
Connect the error to the underlying rule, not just the visual.`,
      attempt1Rule: `State exactly what their answer represents mathematically, then ask them to identify the rule that's being violated. No answer given.`,
      attempt2Rule: `Name the misconception precisely, state the correct relationship using math vocabulary, then give the answer.`,
      attempt3Rule: `Give the answer directly with a brief explanation of why.`,
      feedbackStyle: `Lead with the mathematical principle being violated. The fraction bar is a tool to verify the rule, not the primary reference.`,
    },
  };

  const voice = voiceConfig[tier] ?? voiceConfig.mid;

  const attemptRule = attemptNumber === 1 ? voice.attempt1Rule
    : attemptNumber === 2 ? voice.attempt2Rule
    : voice.attempt3Rule;

  const systemPrompt = `${voice.persona}

PROCESS FEEDBACK RULES — follow these exactly:
This is attempt ${attemptNumber}.
${attemptRule}

Feedback approach: ${voice.feedbackStyle}

CRITICAL: Never skip straight to the answer on attempt 1.
CRITICAL: Never just say "try again" — always diagnose what went wrong first.
CRITICAL: Always reference something concrete the student can see or do on screen.
CRITICAL: Do not use the word "incorrect" or "wrong" — reframe errors as information.`;

  const userMessage = `The student is working on this problem: "${questionText}"

Their answer was: "${wrongAnswer}"
The correct answer is: "${correctAnswer}"
Attempt number: ${attemptNumber}

Diagnose their specific error — tell them what pieces they need instead of what they placed. Respond as Mia.`;

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
    const rawText = data.content?.[0]?.text ?? "";

    if (tier === "early") {
      try {
        // Strip markdown fences if present
        const cleaned = rawText.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
          speech: parsed.speech ?? fallback(tier),
          animationCue: parsed.animationCue ?? "look",
          isAudio: true,
        };
      } catch {
        // If JSON fails but there's text, use it as speech directly
        if (rawText && rawText.length > 5) {
          return {
            speech: rawText.replace(/[{}"]/g, "").trim().slice(0, 80),
            animationCue: "look",
            isAudio: true,
          };
        }
        return {
          speech: fallback(tier),
          animationCue: "look",
          isAudio: true,
        };
      }
    }

    return rawText || fallback(tier);
  } catch (err) {
    console.error("Claude API error:", err);
    if (tier === "early") {
      return {
        speech: fallback(tier),
        animationCue: "look",
        isAudio: true,
      };
    }
    return fallback(tier);
  }
}

// Tier-aware fallbacks if API fails
function fallback(tier) {
  if (tier === "early") return "Okay, try different pieces! Check the hint above.";
  if (tier === "upper") return "Check the relationship between numerator and denominator.";
  return "Those aren't quite the right pieces — check the hint above and try again!";
}
