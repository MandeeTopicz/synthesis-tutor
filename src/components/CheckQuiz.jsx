import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { quizQuestions } from "../data/lessonScript.js";
import FractionBar from "./FractionBar.jsx";

const BAR_WIDTH = 120;
const BAR_HEIGHT = 40;
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

  const q = quizQuestions[currentIndex];
  const isLast = currentIndex === quizQuestions.length - 1;

  useEffect(() => {
    if (lastCorrect) {
      const t = setTimeout(() => {
        setLastCorrect(false);
        if (isLast) {
          setFinished(true);
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
  }, [lastCorrect, isLast]);

  const completedRef = useRef(false);
  const isProcessingAnswer = useRef(false);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      const cappedScore = Math.min(score, TOTAL_QUESTIONS);
      onComplete?.(cappedScore);
      if (cappedScore >= 4) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    }
  }, [finished, score, onComplete]);

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
    const displayScore = Math.min(score, TOTAL_QUESTIONS);
    return (
      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 rounded-lg">
        <p className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {displayScore >= 4 ? "🏆 Lesson Complete!" : "Great effort!"}
        </p>
        <p className="text-lg text-[#64748B]">
          You got {displayScore} out of {TOTAL_QUESTIONS} correct.
        </p>
      </div>
    );
  }

  if (!q) return null;

  const canSubmit =
    q.type === "multiple_choice" ? selectedChoice != null :
    q.type === "fill_blank" ? fillBlankValue.trim() !== "" :
    q.type === "true_false" ? trueFalseValue != null : false;

  return (
    <div className="absolute inset-0 bg-white/95 flex flex-col p-6 overflow-auto rounded-lg">
      <div className="flex justify-center gap-1 mb-4">
        {quizQuestions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-[#E8681A]" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className="text-sm text-slate-500 mb-1">
        Question {currentIndex + 1} of {quizQuestions.length}
      </p>
      <p className="text-lg font-semibold text-[#1E293B] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        {q.question}
      </p>

      {q.showBars && q.choices && (
        <div className="flex flex-wrap gap-6 mb-4">
          {q.choices.map((choice) => {
            const bars = choiceToBars(choice, q.id);
            const pieceWidth = bars[0] ? BAR_WIDTH / (bars[0].fraction === "fourth" ? 4 : 8) * (bars[0].fraction === "fourth" ? 1 : 1) : BAR_WIDTH / 4;
            const denom = bars[0]?.fraction === "fourth" ? 4 : 8;
            const pieceW = BAR_WIDTH / denom;
            return (
              <div key={choice} className="flex items-center gap-2">
                <div className="flex" style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
                  {bars[0] && Array.from({ length: bars[0].count }).map((_, i) => (
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
                <span className="text-sm text-slate-600">{choice}</span>
              </div>
            );
          })}
        </div>
      )}

      {q.type === "multiple_choice" && (
        <div className="space-y-2 mb-4">
          {q.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setSelectedChoice(choice)}
              className={`w-full text-left py-3 px-4 rounded-xl border-2 transition ${selectedChoice === choice ? "border-[#E8681A] bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              {choice}
            </button>
          ))}
        </div>
      )}
      {q.type === "fill_blank" && (
        <div className="mb-4">
          {q.prompt && <p className="text-slate-600 mb-2">{q.prompt}</p>}
          <input
            type="text"
            value={fillBlankValue}
            onChange={(e) => setFillBlankValue(e.target.value)}
            className="border-2 border-slate-200 rounded-xl px-4 py-3 w-full max-w-xs"
            placeholder="?"
          />
        </div>
      )}
      {q.type === "true_false" && (
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setTrueFalseValue("true")}
            className={`py-3 px-6 rounded-xl border-2 ${trueFalseValue === "true" ? "border-[#E8681A] bg-orange-50" : "border-slate-200"}`}
          >
            True
          </button>
          <button
            type="button"
            onClick={() => setTrueFalseValue("false")}
            className={`py-3 px-6 rounded-xl border-2 ${trueFalseValue === "false" ? "border-[#E8681A] bg-orange-50" : "border-slate-200"}`}
          >
            False
          </button>
        </div>
      )}

      {lastWrong && !answerRevealed && retryUsed && (
        <p className="text-red-600 font-medium mb-2">Try again!</p>
      )}
      {answerRevealed && (
        <p className="text-green-600 font-medium mb-2">
          The correct answer was: {q.correctAnswer}
        </p>
      )}

      <div className={`mt-auto pt-4 ${lastWrong ? "animate-shake" : ""}`}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#E8681A" }}
        >
          {retryUsed && !answerRevealed ? "Try again" : "Submit"}
        </button>
      </div>
    </div>
  );
}
