import { useEffect, useState } from "react";

const emotionStyles = {
  happy: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal", ring: "#F59E0B" },
  excited: { smile: "M 18 30 Q 32 40 46 30", eyes: "raised", ring: "#F97316" },
  thinking: { smile: "M 22 34 Q 32 30 42 34", eyes: "brow", ring: "#3B82F6" },
  encouraging: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal", tilt: 3, ring: "#10B981" },
};

export default function TutorOverlay({
  currentMessage = "",
  tutorEmotion = "happy",
  currentNode,
  onAnswer,
  isLoading = false,
  feedback = null,
}) {
  const [hoverChoice, setHoverChoice] = useState(null);
  const [numberInput, setNumberInput] = useState("");

  useEffect(() => {
    setNumberInput("");
  }, [currentNode?.id]);

  const emotion = tutorEmotion;
  const style = emotionStyles[emotion] ?? emotionStyles.happy;

  const needsInput =
    currentNode?.expectsAction !== "free_explore" &&
    currentNode?.expectsAction != null;

  const displayText = isLoading && feedback !== "wrong" ? "..." : currentMessage;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isNarrowPhone = typeof window !== "undefined" && window.innerWidth < 400;

  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 72 : 80,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(600px, 90vw)",
        maxWidth: isMobile ? "94vw" : undefined,
        zIndex: 100,
      }}
    >
      {/* Tutor message — floating, no card */}
      <div
        className={feedback === "wrong" ? "animate-shake" : ""}
        style={{ position: "relative", textAlign: "center" }}
      >
        {feedback === "correct" && (
          <div
            style={{
              color: "#10B981",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              marginBottom: 12,
            }}
          >
            ✓ Correct!
          </div>
        )}
        {feedback === "wrong" && (
          <div
            style={{
              color: "#EF4444",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              marginBottom: 12,
            }}
          >
            ✗ Incorrect
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 6 : 8,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1E3A5F, #2D5A8E)",
                border: `2px solid ${style.ring}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: style.tilt ? `rotate(${style.tilt}deg)` : undefined,
              }}
            >
            <svg viewBox="0 0 64 64" width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} style={{ overflow: "visible" }}>
              <circle cx="32" cy="32" r="28" fill="#1E3A5F" />
              {style.eyes === "normal" && (
                <>
                  <circle cx="24" cy="28" r="3" fill="white" />
                  <circle cx="40" cy="28" r="3" fill="white" />
                </>
              )}
              {style.eyes === "raised" && (
                <>
                  <circle cx="24" cy="26" r="3" fill="white" />
                  <circle cx="40" cy="26" r="3" fill="white" />
                  <path d="M 20 24 Q 24 22 28 24" stroke="white" strokeWidth="1.5" fill="none" />
                  <path d="M 36 24 Q 40 22 44 24" stroke="white" strokeWidth="1.5" fill="none" />
                </>
              )}
              {style.eyes === "brow" && (
                <>
                  <circle cx="24" cy="28" r="3" fill="white" />
                  <circle cx="40" cy="28" r="3" fill="white" />
                  <path d="M 18 26 Q 24 24 30 26" stroke="white" strokeWidth="1.5" fill="none" />
                  <path d="M 34 24 Q 40 26 46 24" stroke="white" strokeWidth="1.5" fill="none" />
                </>
              )}
              <path d={style.smile} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            </div>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 700,
                color: "#E8681A",
              }}
            >
              Mia
            </span>
          </div>
          <p
            key={displayText}
            className={`tutor-message-fade ${isLoading && feedback !== "wrong" ? "loading-dots" : ""}`}
            style={{
              color: isLoading && feedback !== "wrong" ? "#E8681A" : "white",
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? 15 : 18,
              fontWeight: 500,
              lineHeight: isMobile ? 1.5 : 1.7,
              textAlign: "center",
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              maxWidth: 560,
              margin: "0 auto",
              paddingLeft: isNarrowPhone ? 8 : 0,
              paddingRight: isNarrowPhone ? 8 : 0,
            }}
          >
            {displayText}
          </p>
        </div>
      </div>

      {/* Input area — same spot for Next (free_explore), Check my answer (fill_whole), etc. */}
      {(needsInput || currentNode?.expectsAction === "free_explore") && (
        <div
          style={{
            marginTop: isMobile ? 10 : 20,
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? 8 : 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {currentNode?.expectsAction === "free_explore" && (
            <button
              type="button"
              onClick={() => onAnswer?.("next")}
              style={{
                padding: isMobile ? "10px 24px" : "12px 32px",
                fontSize: isMobile ? 13 : 15,
                fontWeight: 700,
                background: "linear-gradient(135deg, #E8681A, #F97316)",
                color: "white",
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 16px rgba(232,104,26,0.4)",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          )}

          {currentNode?.expectsAction === "answer_number" && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="Your answer"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = String(numberInput).trim();
                    if (v) onAnswer?.(v);
                  }
                }}
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: 12,
                  fontFamily: "'Inter', sans-serif",
                  minWidth: 120,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = String(numberInput).trim();
                  if (v) {
                    onAnswer?.(v);
                    setNumberInput("");
                  }
                }}
                style={{
                  padding: "12px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #E8681A, #F97316)",
                  color: "white",
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 16px rgba(232,104,26,0.4)",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          )}

          {currentNode?.expectsAction === "answer_choice" && currentNode.choices?.length > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {currentNode.choices.map((choice) => {
                const isHover = hoverChoice === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => onAnswer?.(choice)}
                    onMouseEnter={() => setHoverChoice(choice)}
                    onMouseLeave={() => setHoverChoice(null)}
                    style={{
                      padding: isMobile ? "8px 16px" : "12px 24px",
                      fontSize: isMobile ? 13 : 15,
                      fontWeight: 600,
                      minWidth: isMobile ? 80 : 120,
                      background: isHover ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      borderRadius: 12,
                      cursor: "pointer",
                      transform: isHover ? "translateY(-1px)" : undefined,
                      transition: "all 200ms ease",
                    }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          )}

          {currentNode?.expectsAction === "fill_whole" && (
            <button
              type="button"
              onClick={() => onAnswer?.("check_fill")}
              style={{
                padding: isMobile ? "10px 24px" : "12px 32px",
                fontSize: isMobile ? 13 : 15,
                fontWeight: 700,
                background: "linear-gradient(135deg, #E8681A, #F97316)",
                color: "white",
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 16px rgba(232,104,26,0.4)",
                cursor: "pointer",
              }}
            >
              Check my answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
