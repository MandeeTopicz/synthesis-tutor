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
          background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
        }}
      >
        <div className="text-center p-8">
          <p
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Nunito', sans-serif", color: "white" }}
          >
            🏆 Amazing work!
          </p>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            You got {quizScore} out of 5 correct.
          </p>
          {quizScore >= 4 && (
            <p className="mt-2 font-medium" style={{ color: "#10B981" }}>
              Lesson complete!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <LessonEngine
      selectedAvatar={selectedAvatar}
      difficulty={difficulty}
      onPhaseChange={handlePhaseChange}
      onQuizComplete={handleQuizComplete}
    />
  );
}
