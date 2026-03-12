import { lessonScriptByLevel } from "../data/lessonScript.js";

export function getScriptForLevel(level) {
  return lessonScriptByLevel[level] || lessonScriptByLevel["4"];
}

export function getInitialState({ selectedAvatar, difficulty }) {
  const script = getScriptForLevel(difficulty);
  const firstNode = script[0];
  const greeting = firstNode.tutorMessage.replace(
    /^Hi!/,
    `Hi ${selectedAvatar || "there"}!`
  );
  return {
    currentNodeId: "node_01",
    phase: "explore",
    difficulty,
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

export function lessonReducer(state, action) {
  const script = getScriptForLevel(state.difficulty);
  const scriptById = Object.fromEntries(script.map((n) => [n.id, n]));

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

export function validateAnswer(node, answer, state) {
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
