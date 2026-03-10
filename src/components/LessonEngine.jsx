import { useReducer, useEffect, useCallback } from "react";
import { lessonScript } from "../data/lessonScript.js";
import { getClaudeHint } from "../lib/claudeTutor.js";
import TutorChat from "./TutorChat.jsx";
import FractionWorkspace from "./FractionWorkspace.jsx";
import CheckQuiz from "./CheckQuiz.jsx";

const scriptById = Object.fromEntries(lessonScript.map((n) => [n.id, n]));

const initialState = {
  currentNodeId: "node_01",
  phase: "explore",
  messages: [],
  attemptCount: 0,
  workspacePieces: [],
  workspaceFills: false,
  isLoadingHint: false,
  quizScore: 0,
  quizComplete: false,
  highlightPiece: null,
  clearWorkspaceCounter: 0,
};

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

export default function LessonEngine({ onPhaseChange, onQuizComplete }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState);
  const currentNode = state.currentNodeId ? scriptById[state.currentNodeId] : null;

  useEffect(() => {
    onPhaseChange?.(state.phase);
  }, [state.phase, onPhaseChange]);

  useEffect(() => {
    if ((state.phase === "explore" || state.phase === "learn") && state.currentNodeId && state.messages.length === 0) {
      const node = scriptById[state.currentNodeId];
      if (node?.tutorMessage) {
        dispatch({
          type: "ADD_MESSAGE",
          payload: { id: `msg-${state.currentNodeId}`, sender: "tutor", text: node.tutorMessage, emotion: node.tutorEmotion },
        });
      }
    }
  }, [state.currentNodeId, state.phase, state.messages.length]);

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
          dispatch({ type: "ADD_MESSAGE", payload: { id: `s-${Date.now()}`, sender: "student", text: "✓ Filled the bar!" } });
          dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.correct });
        } else {
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
        dispatch({ type: "ADD_MESSAGE", payload: { id: `s-${Date.now()}`, sender: "student", text: String(answer) } });
        dispatch({ type: "ADVANCE_NODE", payload: currentNode.branches?.correct });
      } else {
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

  const messages = state.messages.filter((m) => m.text !== "");

  return (
    <>
      <div className="flex-shrink-0 w-[35%] min-w-[320px] flex flex-col overflow-hidden border-r border-slate-200">
        <TutorChat
          messages={messages}
          onStudentAnswer={handleAnswer}
          currentNode={currentNode}
          isLoading={state.isLoadingHint}
        />
      </div>
      <div className="flex-1 min-w-[320px] min-h-0 flex flex-col overflow-hidden relative">
        <FractionWorkspace
          onPiecesPlaced={handlePiecesPlaced}
          highlightPiece={state.highlightPiece}
          clearWorkspace={state.clearWorkspaceCounter}
          onClearWorkspaceAck={handleClearWorkspaceAck}
        />
        {state.phase === "quiz" && (
          <CheckQuiz onComplete={onQuizComplete} />
        )}
      </div>
    </>
  );
}
