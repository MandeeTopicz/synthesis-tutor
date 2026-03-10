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

  const phaseLabels = { explore: "Explore", learn: "Learn", quiz: "Quiz", complete: "Complete" };
  const phaseIndex = { explore: 0, learn: 1, quiz: 2, complete: 3 };
  const currentIdx = phaseIndex[lessonPhase] ?? 0;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
        minWidth: 768,
        height: "100vh",
      }}
    >
      <header
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{
          height: 56,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Fraction Explorers 🍕
        </h1>
        <div className="flex items-center gap-3">
          <div
            style={{
              display: "flex",
              gap: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i <= currentIdx ? "#E8681A" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              borderRadius: 20,
              padding: "4px 12px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {phaseLabels[lessonPhase] ?? "Explore"}
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
