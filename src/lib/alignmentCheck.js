const DENOMINATORS = {
  whole: 1,
  half: 2,
  third: 3,
  fourth: 4,
  sixth: 6,
  eighth: 8,
};

/**
 * Check if placed pieces sum to one whole AND are arranged horizontally.
 * @param {Array<{fraction: string, x: number, y: number, width: number}>} localPlaced
 * @param {number} wholeWidth - pixel width of one whole bar
 * @param {number} pieceHeight - pixel height of a piece
 * @returns {{ sumsToWhole: boolean, isHorizontal: boolean, fills: boolean }}
 */
export function checkFillsWhole(localPlaced, wholeWidth, pieceHeight) {
  const sumsToWhole =
    localPlaced.length > 0 &&
    Math.abs(
      localPlaced.reduce(
        (sum, { fraction }) => sum + 1 / (DENOMINATORS[fraction] ?? 1),
        0
      ) - 1
    ) < 0.01;

  let isHorizontal = false;
  if (sumsToWhole && localPlaced.length > 0) {
    const yTolerance = pieceHeight * 0.6;
    const gapTolerance = wholeWidth * 0.08;
    const sorted = [...localPlaced].sort((a, b) => a.x - b.x);
    const avgY = sorted.reduce((s, p) => s + p.y, 0) / sorted.length;
    const allAlignedY = sorted.every((p) => Math.abs(p.y - avgY) <= yTolerance);

    let allAdjacent = true;
    for (let i = 1; i < sorted.length; i++) {
      const prevRight = sorted[i - 1].x + sorted[i - 1].width;
      const gap = sorted[i].x - prevRight;
      if (gap > gapTolerance || gap < -gapTolerance) {
        allAdjacent = false;
        break;
      }
    }
    isHorizontal = allAlignedY && allAdjacent;
  }

  const fills = sumsToWhole && isHorizontal;
  return { sumsToWhole, isHorizontal, fills };
}
