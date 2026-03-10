import { useState, useCallback } from "react";
import LessonEngine from "./components/LessonEngine.jsx";

export default function App() {
  const [lessonPhase, setLessonPhase] = useState("explore");
  const [quizScore, setQuizScore] = useState(0);

  const handlePhaseChange = useCallback((phase) => {
    setLessonPhase(phase);
  }, []);

  const handleQuizComplete = useCallback((score) => {
    setQuizScore(score);
    setLessonPhase("complete");
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F8FAFC", minWidth: 768 }}
    >
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white"
        style={{ height: 56 }}
      >
        <h1
          className="text-xl font-bold text-[#1E3A5F]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Fraction Explorers 🍕
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {lessonPhase === "explore" && "Explore"}
            {lessonPhase === "learn" && "Learn"}
            {lessonPhase === "quiz" && "Quiz"}
            {lessonPhase === "complete" && "Complete"}
          </span>
        </div>
      </header>

      {lessonPhase === "complete" ? (
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#1E3A5F] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              🏆 Amazing work!
            </p>
            <p className="text-lg text-slate-600">
              You got {quizScore} out of 5 correct.
            </p>
            {quizScore >= 4 && <p className="mt-2 text-green-600 font-medium">Lesson complete!</p>}
          </div>
        </main>
      ) : (
        <main className="flex-1 flex min-h-0" style={{ minHeight: 0 }}>
          <LessonEngine
            onPhaseChange={handlePhaseChange}
            onQuizComplete={handleQuizComplete}
          />
        </main>
      )}
    </div>
  );
}
