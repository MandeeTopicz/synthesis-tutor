import { describe, it, expect } from "vitest";
import { checkFillsWhole } from "../alignmentCheck.js";

const WHOLE_WIDTH = 600;
const PIECE_HEIGHT = 48;

function makePiece(fraction, x, y, width) {
  return { fraction, x, y, width };
}

describe("checkFillsWhole", () => {
  it("empty array → fills false", () => {
    const result = checkFillsWhole([], WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(false);
    expect(result.sumsToWhole).toBe(false);
  });

  it("two halves perfectly aligned → fills true", () => {
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300, 100, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.sumsToWhole).toBe(true);
    expect(result.isHorizontal).toBe(true);
    expect(result.fills).toBe(true);
  });

  it("four fourths perfectly aligned → fills true", () => {
    const pieces = [
      makePiece("fourth", 0, 50, 150),
      makePiece("fourth", 150, 50, 150),
      makePiece("fourth", 300, 50, 150),
      makePiece("fourth", 450, 50, 150),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });

  it("mixed pieces (half + two fourths) aligned → fills true", () => {
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("fourth", 300, 100, 150),
      makePiece("fourth", 450, 100, 150),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });

  it("pieces sum to less than whole → fills false", () => {
    const pieces = [makePiece("half", 0, 100, 300)];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.sumsToWhole).toBe(false);
    expect(result.fills).toBe(false);
  });

  it("pieces sum to more than whole → fills false", () => {
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300, 100, 300),
      makePiece("fourth", 600, 100, 150),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.sumsToWhole).toBe(false);
    expect(result.fills).toBe(false);
  });

  it("correct pieces but Y offset beyond tolerance → fills false", () => {
    // With 2 pieces, avgY is midpoint. Each piece must be within 60% of pieceHeight from avgY.
    // So total spread between pieces must exceed 2 * 0.6 * pieceHeight = 57.6px for PIECE_HEIGHT=48.
    const bigDrift = PIECE_HEIGHT * 1.3; // each piece will be 0.65 * pieceHeight from avg → exceeds 0.6
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300, 100 + bigDrift, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.sumsToWhole).toBe(true);
    expect(result.isHorizontal).toBe(false);
    expect(result.fills).toBe(false);
  });

  it("slight Y drift within tolerance → fills true", () => {
    const smallDrift = PIECE_HEIGHT * 0.5; // within 60% tolerance
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300, 100 + smallDrift, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });

  it("correct pieces but large gap between them → fills false", () => {
    const bigGap = WHOLE_WIDTH * 0.1; // beyond 8% tolerance
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300 + bigGap, 100, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.sumsToWhole).toBe(true);
    expect(result.isHorizontal).toBe(false);
    expect(result.fills).toBe(false);
  });

  it("small gap within tolerance → fills true", () => {
    const smallGap = WHOLE_WIDTH * 0.05; // within 8% tolerance
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300 + smallGap, 100, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });

  it("overlapping pieces beyond tolerance → fills false", () => {
    const bigOverlap = WHOLE_WIDTH * 0.1; // beyond 8% tolerance
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300 - bigOverlap, 100, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.isHorizontal).toBe(false);
    expect(result.fills).toBe(false);
  });

  it("small overlap within tolerance → fills true", () => {
    const smallOverlap = WHOLE_WIDTH * 0.05; // within 8% tolerance
    const pieces = [
      makePiece("half", 0, 100, 300),
      makePiece("half", 300 - smallOverlap, 100, 300),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });

  it("pieces out of order by x position are still sorted correctly", () => {
    const pieces = [
      makePiece("fourth", 450, 50, 150),
      makePiece("fourth", 0, 50, 150),
      makePiece("fourth", 300, 50, 150),
      makePiece("fourth", 150, 50, 150),
    ];
    const result = checkFillsWhole(pieces, WHOLE_WIDTH, PIECE_HEIGHT);
    expect(result.fills).toBe(true);
  });
});
