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
