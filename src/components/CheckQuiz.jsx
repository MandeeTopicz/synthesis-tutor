import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { quizQuestions } from "../data/lessonScript.js";
import FractionBar from "./FractionBar.jsx";

const BAR_WIDTH = 120;
const BAR_HEIGHT = 48;
const TOTAL_QUESTIONS = quizQuestions.length;

function choiceToBars(choice, questionId) {
  if (questionId === "q1") {
    if (choice === "1/4") return [{ fraction: "fourth", count: 1 }];
    if (choice === "2/4") return [{ fraction: "fourth", count: 2 }];
    if (choice === "3/4") return [{ fraction: "fourth", count: 3 }];
  }
  if (questionId === "q4") {
    const n = parseInt(choice, 10);
    if (!isNaN(n)) return [{ fraction: "eighth", count: n }];
  }
  return [];
}

const choiceBtnBase = {
  width: "min(400px, 80vw)",
  padding: "16px 24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  color: "white",
  fontSize: 16,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  transition: "all 200ms ease",
};

export default function CheckQuiz({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastWrong, setLastWrong] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [fillBlankValue, setFillBlankValue] = useState("");
  const [trueFalseValue, setTrueFalseValue] = useState(null);
  const [questionResults, setQuestionResults] = useState(() => Array(TOTAL_QUESTIONS).fill(null));
  const [hoverChoice, setHoverChoice] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  const q = quizQuestions[currentIndex];
  const isLast = currentIndex === quizQuestions.length - 1;

  useEffect(() => {
    if (lastCorrect) {
      setQuestionResults((prev) => {
        const next = [...prev];
        next[currentIndex] = "correct";
        return next;
      });
      const t = setTimeout(() => {
        setLastCorrect(false);
        if (isLast) {
          setFinalScore(score + 1);
          setFinished(true);
          const capped = Math.min(score + 1, TOTAL_QUESTIONS);
          if (capped >= 4) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
          setCurrentIndex((i) => i + 1);
          setRetryUsed(false);
          setAnswerRevealed(false);
          setSelectedChoice(null);
          setFillBlankValue("");
          setTrueFalseValue(null);
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [lastCorrect, isLast, currentIndex, score]);

  const hasCompleted = useRef(false);
  const isProcessingAnswer = useRef(false);

  const handleBackToHome = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    const cappedScore = Math.min(finalScore ?? score, TOTAL_QUESTIONS);
    onComplete?.(cappedScore);
  };

  const handleSubmit = () => {
    if (!q) return;
    if (isProcessingAnswer.current) return;
    isProcessingAnswer.current = true;
    setTimeout(() => { isProcessingAnswer.current = false; }, 500);
    let correct = false;
    if (q.type === "multiple_choice") {
      correct = selectedChoice === q.correctAnswer;
    } else if (q.type === "fill_blank") {
      correct = String(fillBlankValue).trim() === String(q.correctAnswer).trim();
    } else if (q.type === "true_false") {
      correct = trueFalseValue === q.correctAnswer;
    }
    if (correct) {
      setScore((s) => s + 1);
      setLastCorrect(true);
    } else {
      setQuestionResults((prev) => {
        const next = [...prev];
        next[currentIndex] = "wrong";
        return next;
      });
      if (!retryUsed) {
        setRetryUsed(true);
        setLastWrong(true);
        setTimeout(() => setLastWrong(false), 600);
      } else {
        setAnswerRevealed(true);
        setLastWrong(true);
        setTimeout(() => setLastWrong(false), 600);
        setTimeout(() => {
          if (isLast) {
            setFinalScore(score);
            setFinished(true);
          } else {
            setCurrentIndex((i) => i + 1);
            setRetryUsed(false);
            setAnswerRevealed(false);
            setSelectedChoice(null);
            setFillBlankValue("");
            setTrueFalseValue(null);
          }
        }, 1500);
      }
    }
  };

  if (finished) {
    const displayScore = Math.min(finalScore ?? score, TOTAL_QUESTIONS);
    const starCount = displayScore >= 4 ? 3 : displayScore === 3 ? 2 : 1;
    console.log("final score for stars:", finalScore ?? score);
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 36, fontWeight: 700, color: "white", marginBottom: 12 }}>
            Amazing work!
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            You got {displayScore} out of {TOTAL_QUESTIONS} correct.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 40,
                  color: i <= starCount ? "#F59E0B" : "rgba(255,255,255,0.2)",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleBackToHome}
            style={{
              background: "linear-gradient(135deg, #E8681A, #F97316)",
              color: "white",
              borderRadius: 14,
              padding: "14px 48px",
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              boxShadow: "0 4px 20px rgba(232,104,26,0.4)",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const canSubmit =
    q.type === "multiple_choice" ? selectedChoice != null :
    q.type === "fill_blank" ? fillBlankValue.trim() !== "" :
    q.type === "true_false" ? trueFalseValue != null : false;

  const getChoiceStyle = (choice) => {
    const selected = selectedChoice === choice;
    const isCorrect = answerRevealed && choice === q.correctAnswer;
    const isWrong = answerRevealed && selected && choice !== q.correctAnswer;
    if (isCorrect) return { ...choiceBtnBase, background: "rgba(16,185,129,0.2)", border: "1px solid #10B981" };
    if (isWrong) return { ...choiceBtnBase, background: "rgba(239,68,68,0.2)", border: "1px solid #EF4444" };
    if (selected) return { ...choiceBtnBase, background: "rgba(232,104,26,0.2)", border: "1px solid #E8681A" };
    return { ...choiceBtnBase, background: hoverChoice === choice ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)", transform: hoverChoice === choice ? "translateY(-1px)" : undefined };
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #E8681A 0%, #F97316 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 18, fontWeight: 900, color: "white" }}>S</span>
          </div>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 700, color: "white" }}>
            Fraction Explorers
          </span>
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          Question {currentIndex + 1} of {TOTAL_QUESTIONS}
        </span>
      </header>

      {/* Question card — floating, no background */}
      <div
        style={{
          maxWidth: 560,
          width: "90vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          {q.question}
        </p>

        {q.type === "multiple_choice" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
            {q.choices.map((choice) => {
              const bars = q.showBars ? choiceToBars(choice, q.id) : [];
              const denom = bars[0]?.fraction === "fourth" ? 4 : 8;
              const pieceW = bars[0] ? BAR_WIDTH / denom : 0;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => !answerRevealed && setSelectedChoice(choice)}
                  onMouseEnter={() => setHoverChoice(choice)}
                  onMouseLeave={() => setHoverChoice(null)}
                  style={{
                    ...getChoiceStyle(choice),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {q.showBars && bars[0] && (
                    <div style={{ display: "flex", width: BAR_WIDTH, height: BAR_HEIGHT, borderRadius: 8, overflow: "hidden" }}>
                      {Array.from({ length: bars[0].count }).map((_, i) => (
                        <FractionBar
                          key={i}
                          fraction={bars[0].fraction}
                          width={pieceW}
                          height={BAR_HEIGHT}
                          draggable={false}
                          inTray={false}
                        />
                      ))}
                    </div>
                  )}
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === "fill_blank" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {q.prompt && (
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                {q.prompt}
              </p>
            )}
            <input
              type="text"
              value={fillBlankValue}
              onChange={(e) => setFillBlankValue(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "14px 20px",
                color: "white",
                fontSize: 18,
                textAlign: "center",
                width: 120,
                fontFamily: "'Inter', sans-serif",
              }}
              placeholder="?"
            />
          </div>
        )}

        {q.type === "true_false" && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["true", "false"].map((val) => {
              const label = val === "true" ? "True" : "False";
              const selected = trueFalseValue === val;
              const isCorrect = answerRevealed && val === q.correctAnswer;
              const isWrong = answerRevealed && selected && val !== q.correctAnswer;
              let style = { ...choiceBtnBase };
              if (isCorrect) style = { ...style, background: "rgba(16,185,129,0.2)", border: "1px solid #10B981" };
              else if (isWrong) style = { ...style, background: "rgba(239,68,68,0.2)", border: "1px solid #EF4444" };
              else if (selected) style = { ...style, background: "rgba(232,104,26,0.2)", border: "1px solid #E8681A" };
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => !answerRevealed && setTrueFalseValue(val)}
                  style={style}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background: "linear-gradient(135deg, #E8681A, #F97316)",
            color: "white",
            borderRadius: 14,
            padding: "14px 48px",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            boxShadow: "0 4px 20px rgba(232,104,26,0.4)",
            marginTop: 24,
            cursor: canSubmit ? "pointer" : "default",
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {retryUsed && !answerRevealed ? "Try again" : "Submit"}
        </button>

        {lastCorrect && (
          <p style={{ color: "#10B981", fontSize: 18, fontWeight: 700, textAlign: "center", marginTop: 16 }}>
            ✓ Correct!
          </p>
        )}
        {lastWrong && !answerRevealed && retryUsed && (
          <p style={{ color: "#EF4444", fontSize: 18, fontWeight: 700, textAlign: "center", marginTop: 16 }}>
            ✗ Try again
          </p>
        )}
        {answerRevealed && (
          <p style={{ color: "#10B981", fontSize: 18, fontWeight: 700, textAlign: "center", marginTop: 16 }}>
            The correct answer was: {q.correctAnswer}
          </p>
        )}
      </div>

      {/* Progress dots — bottom center */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {quizQuestions.map((_, i) => {
          const result = questionResults[i];
          const isCurrent = i === currentIndex;
          let bg = "rgba(255,255,255,0.2)";
          if (result === "correct") bg = "#10B981";
          else if (result === "wrong") bg = "#EF4444";
          else if (isCurrent) bg = "#E8681A";
          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: bg,
                transform: isCurrent ? "scale(1.3)" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
