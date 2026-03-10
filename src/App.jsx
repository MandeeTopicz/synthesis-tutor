import { useState, useCallback } from "react";
import LandingPage from "./components/LandingPage.jsx";
import LessonEngine from "./components/LessonEngine.jsx";

export default function App() {
  const [gameState, setGameState] = useState("landing");
  const [selectedAvatar, setSelectedAvatar] = useState("Sunny");
  const [difficulty, setDifficulty] = useState("explorer");
  const [lessonPhase, setLessonPhase] = useState("explore");
  const [quizScore, setQuizScore] = useState(0);

  const handlePhaseChange = useCallback((phase) => {
    setLessonPhase(phase);
  }, []);

  const handleQuizComplete = useCallback((score) => {
    setQuizScore(score);
    setLessonPhase("complete");
    setGameState("complete");
  }, []);

  if (gameState === "landing") {
    return (
      <LandingPage
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={() => setGameState("playing")}
      />
    );
  }

  if (gameState === "complete") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 50%, #F0F7EE 100%)",
        }}
      >
        <div className="text-center p-8">
          <p
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Nunito', sans-serif", color: "#1E3A5F" }}
          >
            🏆 Amazing work!
          </p>
          <p className="text-lg text-slate-600">You got {quizScore} out of 5 correct.</p>
          {quizScore >= 4 && (
            <p className="mt-2 text-green-600 font-medium">Lesson complete!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ backgroundColor: "#F8FAFC", minWidth: 768, height: "100vh" }}
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

      <main
        className="flex flex-1 min-h-0 overflow-hidden"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <LessonEngine
          selectedAvatar={selectedAvatar}
          difficulty={difficulty}
          onPhaseChange={handlePhaseChange}
          onQuizComplete={handleQuizComplete}
        />
      </main>
    </div>
  );
}
