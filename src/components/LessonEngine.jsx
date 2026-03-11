import { useReducer, useEffect, useCallback, useState } from "react";
import { lessonScript } from "../data/lessonScript.js";
import { getClaudeHint } from "../lib/claudeTutor.js";
import LessonHeader from "./LessonHeader.jsx";
import TutorOverlay from "./TutorOverlay.jsx";
import AdvanceButton from "./AdvanceButton.jsx";
import FractionWorkspace from "./FractionWorkspace.jsx";
import CheckQuiz from "./CheckQuiz.jsx";

const scriptById = Object.fromEntries(lessonScript.map((n) => [n.id, n]));

const firstNode = lessonScript[0];
function getInitialState(selectedAvatar) {
  const greeting = firstNode.tutorMessage.replace(
    /^Hi!/,
    `Hi ${selectedAvatar || "there"}!`
  );
  return {
    currentNodeId: "node_01",
    phase: "explore",
    messages: [
      {
        id: "msg-node_01-init",
        sender: "tutor",
        text: greeting,
        emotion: firstNode.tutorEmotion,
      },
    ],
    attemptCount: 0,
    workspacePieces: [],
    workspaceFills: false,
    isLoadingHint: false,
    quizScore: 0,
    quizComplete: false,
    highlightPiece: null,
    clearWorkspaceCounter: 0,
  };
}

function lessonReducer(state, action) {
  switch (action.type) {
    case "ADVANCE_NODE": {
      const nextId = action.payload;
      if (nextId === "quiz_start") {
        return {
          ...state,
          phase: "quiz",
          currentNodeId: null,
          attemptCount: 0,
          messages: [],
          clearWorkspaceCounter: state.clearWorkspaceCounter + 1,
        };
      }
      const node = scriptById[nextId];
      const phase = node?.phase ?? state.phase;
      const newMsg = node
        ? { id: `msg-${nextId}-${Date.now()}`, sender: "tutor", text: node.tutorMessage, emotion: node.tutorEmotion }
        : null;
      return {
        ...state,
        currentNodeId: nextId,
        phase,
        messages: newMsg ? [...state.messages, newMsg] : state.messages,
        attemptCount: 0,
        workspacePieces: [],
        workspaceFills: false,
        clearWorkspaceCounter: state.clearWorkspaceCounter + 1,
      };
    }
    case "WRONG_ANSWER":
      return { ...state, attemptCount: state.attemptCount + 1 };
    case "SET_HINT_LOADING":
      return { ...state, isLoadingHint: action.payload };
    case "RECEIVE_HINT":
      return {
        ...state,
        isLoadingHint: false,
        messages:
          action.payload === ""
          ? state.messages
          : [
              ...state.messages,
              { id: `hint-${Date.now()}`, sender: "tutor", text: action.payload, emotion: "encouraging" },
            ],
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspacePieces: action.payload.pieces ?? state.workspacePieces,
        workspaceFills: action.payload.fills ?? state.workspaceFills,
      };
    case "START_QUIZ":
      return { ...state, phase: "quiz" };
    case "QUIZ_ANSWER":
      return { ...state, quizScore: state.quizScore + (action.payload.correct ? 1 : 0) };
    case "QUIZ_COMPLETE":
      return { ...state, quizComplete: true };
    case "SET_HIGHLIGHT_PIECE":
      return { ...state, highlightPiece: action.payload };
    case "CLEAR_WORKSPACE":
      return { ...state, clearWorkspaceCounter: state.clearWorkspaceCounter + 1 };
    default:
      return state;
  }
}

function validateAnswer(node, answer, state) {
  if (!node) return false;
  switch (node.expectsAction) {
    case "free_explore":
      return true;
    case "answer_number": {
      const correct = String(node.correctAnswer ?? "").trim();
      const given = String(answer ?? "").trim();
      return correct === given;
    }
    case "answer_choice":
      return node.correctAnswer === answer;
    case "fill_whole": {
      const expected = node.correctAnswer;
      if (!expected || !expected.pieces || !expected.fills) return false;
      const pieces = state.workspacePieces || [];
      const fills = state.workspaceFills;
      if (!fills) return false;
      const sortedExpected = [...expected.pieces].sort();
      const sortedGot = [...pieces].sort();
      if (sortedExpected.length !== sortedGot.length) return false;
      return sortedExpected.every((p, i) => sortedGot[i] === p);
    }
    default:
      return false;
  }
}

export default function LessonEngine({ selectedAvatar, difficulty, onPhaseChange, onQuizComplete }) {
  const [state, dispatch] = useReducer(
    lessonReducer,
    selectedAvatar,
    getInitialState
  );
  const [feedback, setFeedback] = useState(null);
  const currentNode = state.currentNodeId ? scriptById[state.currentNodeId] : null;

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
          setTimeout(() => setFeedback(null), 600);
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
        setTimeout(() => setFeedback(null), 600);
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

  const isFreeExplore = currentNode?.expectsAction === "free_explore";
  const showAdvanceButton = isFreeExplore;

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
      <FractionWorkspace
        onPiecesPlaced={handlePiecesPlaced}
        highlightPiece={state.highlightPiece}
        clearWorkspace={state.clearWorkspaceCounter}
        onClearWorkspaceAck={handleClearWorkspaceAck}
      />
      <TutorOverlay
        currentMessage={currentMessage}
        tutorEmotion={tutorEmotion}
        currentNode={currentNode}
        onAnswer={handleAnswer}
        isLoading={state.isLoadingHint}
        feedback={feedback}
      />
      {showAdvanceButton && (
        <AdvanceButton onAdvance={() => handleAnswer("next")} />
      )}
      {state.phase === "quiz" && (
        <CheckQuiz onComplete={onQuizComplete} />
      )}
    </div>
  );
}
