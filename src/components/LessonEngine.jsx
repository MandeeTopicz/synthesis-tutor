import { useReducer, useEffect, useCallback, useState } from "react";
import { getClaudeHint } from "../lib/claudeTutor.js";
import LessonHeader from "./LessonHeader.jsx";
import TutorOverlay from "./TutorOverlay.jsx";
import FractionWorkspace from "./FractionWorkspace.jsx";
import CheckQuiz from "./CheckQuiz.jsx";
import { getScriptForLevel, getInitialState, lessonReducer, validateAnswer } from "./lessonReducer.js";

export default function LessonEngine({ selectedAvatar, difficulty, onPhaseChange, onQuizComplete }) {
  const [state, dispatch] = useReducer(
    lessonReducer,
    { selectedAvatar, difficulty },
    getInitialState
  );
  const [feedback, setFeedback] = useState(null);

  const script = getScriptForLevel(state.difficulty);
  const scriptByIdLocal = Object.fromEntries(script.map((n) => [n.id, n]));
  const currentNode = state.currentNodeId ? scriptByIdLocal[state.currentNodeId] : null;

  useEffect(() => {
    onPhaseChange?.(state.phase);
  }, [state.phase, onPhaseChange]);

  const messages = state.messages.filter((m) => m.text !== "");
  const lastTutorMsg = [...messages].reverse().find((m) => m.sender === "tutor");
  const currentMessage = lastTutorMsg?.text ?? "";
  const tutorEmotion = lastTutorMsg?.emotion ?? currentNode?.tutorEmotion ?? "happy";

  const handleAnswer = useCallback(
    async (answer) => {
      if (!currentNode) return;

      if (currentNode.expectsAction === "free_explore") {
        const nextId = currentNode.branches?.advance;
        if (nextId) dispatch({ type: "ADVANCE_NODE", payload: nextId });
        return;
      }

      if (currentNode.expectsAction === "fill_whole" && answer === "check_fill") {
        const correct = validateAnswer(currentNode, answer, state);
        if (correct) {
          setFeedback("correct");
          setTimeout(() => {
            setFeedback(null);
            dispatch({ type: "ADD_MESSAGE", payload: { id: `s-${Date.now()}`, sender: "student", text: "✓ Filled the bar!" } });
            dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.correct });
          }, 1000);
        } else {
          setFeedback("wrong");
          setTimeout(() => setFeedback(null), 2000);
          dispatch({ type: "WRONG_ANSWER" });
          const nextAttemptCount = state.attemptCount + 1;
          if (nextAttemptCount >= 2) {
            dispatch({ type: "RECEIVE_HINT", payload: `Let's keep going! The answer was: ${(currentNode.correctAnswer?.pieces || []).join(", ")}.` });
            dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.incorrect });
          } else {
            dispatch({ type: "SET_HINT_LOADING", payload: true });
            const hint = await getClaudeHint({
              wrongAnswer: "workspace fill",
              correctAnswer: JSON.stringify(currentNode.correctAnswer),
              questionText: currentNode.tutorMessage,
              attemptNumber: nextAttemptCount,
              nodeId: currentNode.id,
            });
            dispatch({ type: "RECEIVE_HINT", payload: hint });
          }
        }
        return;
      }

      const correct = validateAnswer(currentNode, answer, state);
      if (correct) {
        setFeedback("correct");
        setTimeout(() => {
          setFeedback(null);
          dispatch({ type: "ADD_MESSAGE", payload: { id: `s-${Date.now()}`, sender: "student", text: String(answer) } });
          dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.correct });
        }, 1000);
      } else {
        setFeedback("wrong");
        setTimeout(() => setFeedback(null), 2000);
        dispatch({ type: "WRONG_ANSWER" });
        const nextAttemptCount = state.attemptCount + 1;
        if (nextAttemptCount >= 2) {
          dispatch({ type: "RECEIVE_HINT", payload: `Let's keep going! The answer was: ${currentNode.correctAnswer}.` });
          dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.incorrect });
        } else {
          dispatch({ type: "SET_HINT_LOADING", payload: true });
          const hint = await getClaudeHint({
            wrongAnswer: String(answer),
            correctAnswer: String(currentNode.correctAnswer ?? ""),
            questionText: currentNode.tutorMessage,
            attemptNumber: nextAttemptCount,
            nodeId: currentNode.id,
          });
          dispatch({ type: "RECEIVE_HINT", payload: hint });
        }
      }
    },
    [currentNode, state.attemptCount, state.workspacePieces, state.workspaceFills]
  );

  const handlePiecesPlaced = useCallback((payload) => {
    dispatch({ type: "UPDATE_WORKSPACE", payload });
  }, []);

  const handleClearWorkspaceAck = useCallback(() => {}, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <LessonHeader phase={state.phase} />
      {state.phase !== "quiz" && (
        <FractionWorkspace
          onPiecesPlaced={handlePiecesPlaced}
          highlightPiece={state.highlightPiece}
          clearWorkspace={state.clearWorkspaceCounter}
          onClearWorkspaceAck={handleClearWorkspaceAck}
        />
      )}
      {state.phase !== "quiz" && (
        <TutorOverlay
          currentMessage={currentMessage}
          tutorEmotion={tutorEmotion}
          currentNode={currentNode}
          onAnswer={handleAnswer}
          isLoading={state.isLoadingHint}
          feedback={feedback}
        />
      )}
      {state.phase === "quiz" && (
        <CheckQuiz onComplete={onQuizComplete} difficulty={state.difficulty} />
      )}
    </div>
  );
}
