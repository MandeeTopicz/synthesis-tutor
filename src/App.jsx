import { useState, useCallback } from "react";
import LandingPage from "./components/LandingPage.jsx";
import LessonEngine from "./components/LessonEngine.jsx";

export default function App() {
  const [gameState, setGameState] = useState("landing");
  const [selectedAvatar, setSelectedAvatar] = useState("Sunny");
  const [difficulty, setDifficulty] = useState("explorer");
  const [lessonPhase, setLessonPhase] = useState("explore");

  const handlePhaseChange = useCallback((phase) => {
    setLessonPhase(phase);
  }, []);

  const handleQuizComplete = useCallback(() => {
    setGameState("landing");
    setSelectedAvatar("Sunny");
    setDifficulty("explorer");
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

  return (
    <LessonEngine
      selectedAvatar={selectedAvatar}
      difficulty={difficulty}
      onPhaseChange={handlePhaseChange}
      onQuizComplete={handleQuizComplete}
    />
  );
}
