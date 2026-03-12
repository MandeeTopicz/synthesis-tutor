import { describe, it, expect } from "vitest";
import {
  getScriptForLevel,
  getInitialState,
  lessonReducer,
  validateAnswer,
} from "../lessonReducer.js";

describe("getScriptForLevel", () => {
  it("returns script for valid levels", () => {
    expect(getScriptForLevel("1-2").length).toBeGreaterThan(0);
    expect(getScriptForLevel("3").length).toBeGreaterThan(0);
    expect(getScriptForLevel("4").length).toBeGreaterThan(0);
    expect(getScriptForLevel("5-6").length).toBeGreaterThan(0);
  });

  it("falls back to grade 4 for unknown levels", () => {
    const fallback = getScriptForLevel("unknown");
    expect(fallback).toBe(getScriptForLevel("4"));
  });
});

describe("getInitialState", () => {
  it("returns correct defaults", () => {
    const state = getInitialState({ selectedAvatar: "Sunny", difficulty: "4" });
    expect(state.currentNodeId).toBe("node_01");
    expect(state.phase).toBe("explore");
    expect(state.difficulty).toBe("4");
    expect(state.attemptCount).toBe(0);
    expect(state.quizScore).toBe(0);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].sender).toBe("tutor");
  });

  it("inserts avatar name into greeting", () => {
    const state = getInitialState({ selectedAvatar: "River", difficulty: "1-2" });
    expect(state.messages[0].text).toContain("River");
  });

  it("uses 'there' when no avatar provided", () => {
    const state = getInitialState({ selectedAvatar: "", difficulty: "3" });
    expect(state.messages[0].text).toContain("there");
  });
});

describe("lessonReducer", () => {
  const baseState = getInitialState({ selectedAvatar: "Sunny", difficulty: "4" });

  it("ADVANCE_NODE updates currentNodeId and appends message", () => {
    const next = lessonReducer(baseState, { type: "ADVANCE_NODE", payload: "node_02" });
    expect(next.currentNodeId).toBe("node_02");
    expect(next.messages.length).toBeGreaterThan(baseState.messages.length);
    expect(next.attemptCount).toBe(0);
    expect(next.workspacePieces).toEqual([]);
  });

  it("ADVANCE_NODE to quiz_start sets phase to quiz", () => {
    const next = lessonReducer(baseState, { type: "ADVANCE_NODE", payload: "quiz_start" });
    expect(next.phase).toBe("quiz");
    expect(next.currentNodeId).toBeNull();
    expect(next.messages).toEqual([]);
  });

  it("WRONG_ANSWER increments attemptCount", () => {
    let state = baseState;
    state = lessonReducer(state, { type: "WRONG_ANSWER" });
    expect(state.attemptCount).toBe(1);
    state = lessonReducer(state, { type: "WRONG_ANSWER" });
    expect(state.attemptCount).toBe(2);
  });

  it("SET_HINT_LOADING toggles isLoadingHint", () => {
    const next = lessonReducer(baseState, { type: "SET_HINT_LOADING", payload: true });
    expect(next.isLoadingHint).toBe(true);
    const off = lessonReducer(next, { type: "SET_HINT_LOADING", payload: false });
    expect(off.isLoadingHint).toBe(false);
  });

  it("RECEIVE_HINT adds message and clears loading", () => {
    const loading = { ...baseState, isLoadingHint: true };
    const next = lessonReducer(loading, { type: "RECEIVE_HINT", payload: "Try this!" });
    expect(next.isLoadingHint).toBe(false);
    expect(next.messages.length).toBe(baseState.messages.length + 1);
    expect(next.messages.at(-1).text).toBe("Try this!");
  });

  it("RECEIVE_HINT with empty string does not add message", () => {
    const next = lessonReducer(baseState, { type: "RECEIVE_HINT", payload: "" });
    expect(next.messages.length).toBe(baseState.messages.length);
  });

  it("UPDATE_WORKSPACE sets pieces and fills", () => {
    const next = lessonReducer(baseState, {
      type: "UPDATE_WORKSPACE",
      payload: { pieces: ["half", "half"], fills: true },
    });
    expect(next.workspacePieces).toEqual(["half", "half"]);
    expect(next.workspaceFills).toBe(true);
  });

  it("QUIZ_ANSWER increments score only on correct", () => {
    let state = baseState;
    state = lessonReducer(state, { type: "QUIZ_ANSWER", payload: { correct: true } });
    expect(state.quizScore).toBe(1);
    state = lessonReducer(state, { type: "QUIZ_ANSWER", payload: { correct: false } });
    expect(state.quizScore).toBe(1);
  });

  it("QUIZ_COMPLETE sets quizComplete", () => {
    const next = lessonReducer(baseState, { type: "QUIZ_COMPLETE" });
    expect(next.quizComplete).toBe(true);
  });

  it("unknown action returns state unchanged", () => {
    const next = lessonReducer(baseState, { type: "UNKNOWN_ACTION" });
    expect(next).toBe(baseState);
  });
});

describe("validateAnswer", () => {
  it("returns false for null node", () => {
    expect(validateAnswer(null, "anything", {})).toBe(false);
  });

  it("free_explore always returns true", () => {
    const node = { expectsAction: "free_explore" };
    expect(validateAnswer(node, null, {})).toBe(true);
  });

  it("answer_number: correct match", () => {
    const node = { expectsAction: "answer_number", correctAnswer: "2" };
    expect(validateAnswer(node, "2", {})).toBe(true);
  });

  it("answer_number: whitespace tolerance", () => {
    const node = { expectsAction: "answer_number", correctAnswer: "2" };
    expect(validateAnswer(node, " 2 ", {})).toBe(true);
  });

  it("answer_number: wrong answer", () => {
    const node = { expectsAction: "answer_number", correctAnswer: "2" };
    expect(validateAnswer(node, "3", {})).toBe(false);
  });

  it("answer_choice: exact match", () => {
    const node = { expectsAction: "answer_choice", correctAnswer: "equivalent fractions" };
    expect(validateAnswer(node, "equivalent fractions", {})).toBe(true);
  });

  it("answer_choice: case sensitive", () => {
    const node = { expectsAction: "answer_choice", correctAnswer: "equivalent fractions" };
    expect(validateAnswer(node, "Equivalent Fractions", {})).toBe(false);
  });

  it("fill_whole: correct pieces and fills true", () => {
    const node = {
      expectsAction: "fill_whole",
      correctAnswer: { pieces: ["half", "fourth", "fourth"], fills: true },
    };
    const state = {
      workspacePieces: ["fourth", "half", "fourth"],
      workspaceFills: true,
    };
    expect(validateAnswer(node, "check_fill", state)).toBe(true);
  });

  it("fill_whole: correct pieces but fills false (not aligned)", () => {
    const node = {
      expectsAction: "fill_whole",
      correctAnswer: { pieces: ["half", "half"], fills: true },
    };
    const state = {
      workspacePieces: ["half", "half"],
      workspaceFills: false,
    };
    expect(validateAnswer(node, "check_fill", state)).toBe(false);
  });

  it("fill_whole: wrong pieces", () => {
    const node = {
      expectsAction: "fill_whole",
      correctAnswer: { pieces: ["half", "half"], fills: true },
    };
    const state = {
      workspacePieces: ["third", "third", "third"],
      workspaceFills: true,
    };
    expect(validateAnswer(node, "check_fill", state)).toBe(false);
  });

  it("unknown expectsAction returns false", () => {
    const node = { expectsAction: "unknown_type", correctAnswer: "x" };
    expect(validateAnswer(node, "x", {})).toBe(false);
  });
});
