import { useEffect, useRef, useState } from "react";

const emotionStyles = {
  happy: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal", ring: "#F59E0B" },
  excited: { smile: "M 18 30 Q 32 40 46 30", eyes: "raised", ring: "#F97316" },
  thinking: { smile: "M 22 34 Q 32 30 42 34", eyes: "brow", ring: "#3B82F6" },
  encouraging: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal", tilt: 3, ring: "#10B981" },
};

export default function TutorChat({
  messages = [],
  onStudentAnswer,
  currentNode,
  isLoading = false,
}) {
  const scrollRef = useRef(null);
  const [numberInput, setNumberInput] = useState("");
  const [hoverChoice, setHoverChoice] = useState(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setNumberInput("");
  }, [currentNode?.id]);

  const emotion = currentNode?.tutorEmotion ?? "happy";
  const style = emotionStyles[emotion] ?? emotionStyles.happy;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.03)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Tutor avatar */}
      <div className="flex-shrink-0 flex items-center gap-2 p-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, #1E3A5F, #2D5A8E)",
            border: `2px solid ${style.ring}`,
            boxShadow: "0 4px 16px rgba(30,58,95,0.5), 0 0 16px " + style.ring + "66",
            transform: style.tilt ? `rotate(${style.tilt}deg)` : undefined,
          }}
        >
          <svg viewBox="0 0 64 64" className="w-8 h-8" style={{ overflow: "visible" }}>
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
          className="font-bold"
          style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#E8681A" }}
        >
          Mia
        </span>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, index) => (
          <div
            key={`msg-${msg.id}-${index}`}
            className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-2"
              style={{
                background: msg.sender === "tutor"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(232,104,26,0.15)",
                border: msg.sender === "tutor"
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(232,104,26,0.3)",
                color: msg.sender === "tutor" ? "rgba(255,255,255,0.9)" : "white",
                borderRadius: msg.sender === "tutor"
                  ? "4px 18px 18px 18px"
                  : "18px 4px 18px 18px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "4px 18px 18px 18px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span className="loading-dots">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 p-3"
        style={{
          background: "rgba(0,0,0,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {currentNode?.expectsAction === "free_explore" && (
          <button
            type="button"
            onClick={() => onStudentAnswer?.("next")}
            className="w-full py-3 px-4 rounded-[10px] font-bold text-white transition"
            style={{
              background: "linear-gradient(135deg, #E8681A, #F97316)",
              boxShadow: "0 4px 16px rgba(232,104,26,0.35)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Next →
          </button>
        )}
        {currentNode?.expectsAction === "answer_number" && (
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Your answer"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              className="flex-1 rounded-[10px] px-3 py-2.5"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                padding: "10px 14px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = String(numberInput).trim();
                  if (v !== "") {
                    onStudentAnswer?.(v);
                    setNumberInput("");
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const v = String(numberInput).trim();
                if (v !== "") {
                  onStudentAnswer?.(v);
                  setNumberInput("");
                }
              }}
              className="shrink-0 py-2.5 px-4 rounded-[10px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #E8681A, #F97316)",
                boxShadow: "0 4px 16px rgba(232,104,26,0.35)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Submit
            </button>
          </div>
        )}
        {currentNode?.expectsAction === "answer_choice" && currentNode.choices?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentNode.choices.map((choice) => {
              const isHover = hoverChoice === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => onStudentAnswer?.(choice)}
                  onMouseEnter={() => setHoverChoice(choice)}
                  onMouseLeave={() => setHoverChoice(null)}
                  className="py-2.5 px-4 rounded-[10px] font-medium transition"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: isHover ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isHover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)"}`,
                    color: "rgba(255,255,255,0.8)",
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
            onClick={() => onStudentAnswer?.("check_fill")}
            className="w-full py-3 px-4 rounded-[10px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #E8681A, #F97316)",
              boxShadow: "0 4px 16px rgba(232,104,26,0.35)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Check my answer
          </button>
        )}
      </div>
    </div>
  );
}
