import { useReducer, useEffect, useCallback, useState, useRef } from "react";
import { getClaudeHint } from "../lib/claudeTutor.js";
import { speakWithCartesia, stopSpeaking } from "../lib/cartesiaTTS.js";
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
  const [animationCue, setAnimationCue] = useState(null);

  const script = getScriptForLevel(state.difficulty);
  const learnerTier = { "1-2": "early", "3": "mid", "4": "mid", "5-6": "upper" }[state.difficulty] ?? "mid";
  const scriptByIdLocal = Object.fromEntries(script.map((n) => [n.id, n]));
  const currentNode = state.currentNodeId ? scriptByIdLocal[state.currentNodeId] : null;

  useEffect(() => {
    onPhaseChange?.(state.phase);
  }, [state.phase, onPhaseChange]);

  const spokenNodeRef = useRef(null);

  useEffect(() => {
    if (learnerTier !== "early") return;
    if (!currentNode?.tutorMessage) return;
    if (spokenNodeRef.current === currentNode.id) return;

    const spokenText = currentNode.tutorMessage
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27BF}]/gu, "")
      .trim()
      .replace(/^Hi!?\s*/i, "Okay! ");

    const nodeId = currentNode.id;
    const timer = setTimeout(() => {
      spokenNodeRef.current = nodeId;
      speakWithCartesia(spokenText);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentNode?.id, learnerTier]);

  // Auto-advance: for nodes with autoAdvance flag, advance after a delay
  useEffect(() => {
    if (!currentNode?.autoAdvance) return;
    if (currentNode.expectsAction !== "free_explore") return;
    const nextId = currentNode.branches?.advance;
    if (!nextId) return;

    // Estimate audio duration: ~130ms per word + 500ms buffer
    const wordCount = (currentNode.tutorMessage || "").split(/\s+/).length;
    const delay = Math.max(3000, wordCount * 130 + 1000);

    const timer = setTimeout(() => {
      dispatch({ type: "ADVANCE_NODE", payload: nextId });
    }, delay);
    return () => clearTimeout(timer);
  }, [currentNode?.id]);

  const messages = state.messages.filter((m) => m.text !== "" && m.text != null);
  const lastTutorMsg = [...messages].reverse().find((m) => m.sender === "tutor");
  const hintData = lastTutorMsg?.text;
  const hintText = (typeof hintData === "object" && hintData?.isAudio) ? null : (typeof hintData === "object" ? hintData?.speech : hintData) ?? "";
  const currentMessage = hintText ?? "";
  const tutorEmotion = lastTutorMsg?.emotion ?? currentNode?.tutorEmotion ?? "happy";

  const handleAnswer = useCallback(
    async (answer) => {
      if (!currentNode) return;
      stopSpeaking();

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
          dispatch({ type: "SET_HINT_LOADING", payload: true });
          const placedDesc = (state.workspacePieces || []).join(", ") || "no pieces placed";
          const hint = await getClaudeHint({
            wrongAnswer: `Placed pieces: ${placedDesc}`,
            correctAnswer: JSON.stringify(currentNode.correctAnswer),
            questionText: currentNode.tutorMessage,
            attemptNumber: nextAttemptCount,
            nodeId: currentNode.id,
            tier: learnerTier,
          });
          dispatch({ type: "RECEIVE_HINT", payload: hint });
          if (hint?.isAudio && hint?.speech) {
            speakWithCartesia(hint.speech);
            setAnimationCue(hint.animationCue ?? "look");
            setTimeout(() => setAnimationCue(null), 2000);
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
        dispatch({ type: "SET_HINT_LOADING", payload: true });
        const hint = await getClaudeHint({
          wrongAnswer: String(answer),
          correctAnswer: String(currentNode.correctAnswer ?? ""),
          questionText: currentNode.tutorMessage,
          attemptNumber: nextAttemptCount,
          nodeId: currentNode.id,
          tier: learnerTier,
        });
        dispatch({ type: "RECEIVE_HINT", payload: hint });
        if (hint?.isAudio && hint?.speech) {
          speakWithCartesia(hint.speech);
          setAnimationCue(hint.animationCue ?? "look");
          setTimeout(() => setAnimationCue(null), 2000);
        }
      }
    },
    [currentNode, state.attemptCount, state.workspacePieces, state.workspaceFills, learnerTier]
  );

  const handlePiecesPlaced = useCallback((payload) => {
    dispatch({ type: "UPDATE_WORKSPACE", payload });
  }, []);

  const handleClearWorkspaceAck = useCallback(() => {}, []);

  const handleReplay = useCallback(() => {
    if (!currentNode?.tutorMessage) return;
    const spokenText = currentNode.tutorMessage
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27BF}]/gu, "")
      .trim();
    speakWithCartesia(spokenText);
  }, [currentNode]);

  const PIECE_LABELS = { whole: "1's", half: "1/2's", third: "1/3's", fourth: "1/4's", sixth: "1/6's", eighth: "1/8's" };
  const WORD_NUMS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
  const taskHint = (() => {
    if (!currentNode) return null;
    const { expectsAction, correctAnswer } = currentNode;
    if (expectsAction === "fill_whole" && correctAnswer?.pieces?.length) {
      const counts = {};
      correctAnswer.pieces.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
      const parts = Object.entries(counts).map(([piece, n]) => `${WORD_NUMS[n] || n} ${PIECE_LABELS[piece] || piece}`);
      return `Make a whole using ${parts.join(" and ")}`;
    }
    if (expectsAction === "answer_number") return currentNode.hint || null;
    if (expectsAction === "answer_choice") return currentNode.hint || null;
    if (expectsAction === "free_explore" && !currentNode.autoAdvance) return "Drag the pieces around and explore!";
    return null;
  })();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        minWidth: "100%",
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
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
          animationCue={animationCue}
        />
      )}
      {state.phase !== "quiz" && (
        <TutorOverlay
          currentMessage={currentMessage}
          tutorEmotion={tutorEmotion}
          currentNode={currentNode}
          onAnswer={handleAnswer}
          onReplay={handleReplay}
          taskHint={taskHint}
          isLoading={state.isLoadingHint}
          feedback={feedback}
          learnerTier={learnerTier}
        />
      )}
      {state.phase === "quiz" && (
        <CheckQuiz onComplete={onQuizComplete} difficulty={state.difficulty} learnerTier={learnerTier} />
      )}
    </div>
  );
}
