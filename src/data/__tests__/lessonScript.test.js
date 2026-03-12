import { describe, it, expect } from "vitest";
import { lessonScriptByLevel, quizQuestionsByLevel } from "../lessonScript.js";

const GRADE_BANDS = ["1-2", "3", "4", "5-6"];
const VALID_PHASES = ["explore", "learn"];
const VALID_ACTIONS = ["free_explore", "answer_number", "answer_choice", "fill_whole"];
const VALID_QUIZ_TYPES = ["multiple_choice", "fill_blank", "true_false"];

describe("lessonScriptByLevel", () => {
  it("exports all 4 grade bands", () => {
    for (const band of GRADE_BANDS) {
      expect(lessonScriptByLevel[band]).toBeDefined();
      expect(lessonScriptByLevel[band].length).toBeGreaterThan(0);
    }
  });

  describe.each(GRADE_BANDS)("grade band %s", (band) => {
    const script = lessonScriptByLevel[band];

    it("starts with node_01", () => {
      expect(script[0].id).toBe("node_01");
    });

    it("every node has required fields", () => {
      for (const node of script) {
        expect(node.id).toBeTruthy();
        expect(VALID_PHASES).toContain(node.phase);
        expect(node.tutorMessage).toBeTruthy();
        expect(node.tutorEmotion).toBeTruthy();
        expect(VALID_ACTIONS).toContain(node.expectsAction);
        expect(node.branches).toBeDefined();
      }
    });

    it("has no duplicate node IDs", () => {
      const ids = script.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("every branch target resolves to an existing node or quiz_start", () => {
      const ids = new Set(script.map((n) => n.id));
      ids.add("quiz_start");
      for (const node of script) {
        for (const [key, target] of Object.entries(node.branches)) {
          expect(ids.has(target)).toBe(true);
        }
      }
    });

    it("quiz_start is reachable from node_01", () => {
      const nodeMap = Object.fromEntries(script.map((n) => [n.id, n]));
      const visited = new Set();
      const queue = ["node_01"];
      let reachesQuiz = false;

      while (queue.length > 0) {
        const id = queue.shift();
        if (id === "quiz_start") {
          reachesQuiz = true;
          break;
        }
        if (visited.has(id)) continue;
        visited.add(id);
        const node = nodeMap[id];
        if (!node) continue;
        for (const target of Object.values(node.branches)) {
          queue.push(target);
        }
      }
      expect(reachesQuiz).toBe(true);
    });

    it("question nodes have non-null correctAnswer", () => {
      for (const node of script) {
        if (node.expectsAction !== "free_explore") {
          expect(node.correctAnswer).not.toBeNull();
        }
      }
    });

    it("answer_choice nodes have choices containing correctAnswer", () => {
      for (const node of script) {
        if (node.expectsAction === "answer_choice") {
          expect(node.choices).toBeDefined();
          expect(node.choices).toContain(node.correctAnswer);
        }
      }
    });
  });
});

describe("quizQuestionsByLevel", () => {
  it("exports all 4 grade bands", () => {
    for (const band of GRADE_BANDS) {
      expect(quizQuestionsByLevel[band]).toBeDefined();
      expect(quizQuestionsByLevel[band].length).toBeGreaterThan(0);
    }
  });

  describe.each(GRADE_BANDS)("grade band %s", (band) => {
    const questions = quizQuestionsByLevel[band];

    it("every question has required fields", () => {
      for (const q of questions) {
        expect(q.id).toBeTruthy();
        expect(VALID_QUIZ_TYPES).toContain(q.type);
        expect(q.question).toBeTruthy();
        expect(q.correctAnswer).toBeDefined();
      }
    });

    it("multiple_choice questions have choices containing correctAnswer", () => {
      for (const q of questions) {
        if (q.type === "multiple_choice") {
          expect(q.choices).toBeDefined();
          expect(q.choices.length).toBeGreaterThanOrEqual(2);
          expect(q.choices).toContain(q.correctAnswer);
        }
      }
    });

    it("true_false questions have valid correctAnswer", () => {
      for (const q of questions) {
        if (q.type === "true_false") {
          expect(["true", "false"]).toContain(q.correctAnswer);
        }
      }
    });

    it("has no duplicate question IDs", () => {
      const ids = questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
