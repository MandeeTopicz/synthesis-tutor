import { useEffect, useRef, useState } from "react";

const emotionStyles = {
  happy: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal" },
  excited: { smile: "M 18 30 Q 32 40 46 30", eyes: "raised" },
  thinking: { smile: "M 22 34 Q 32 30 42 34", eyes: "brow" },
  encouraging: { smile: "M 20 32 Q 32 38 44 32", eyes: "normal", tilt: 3 },
};

export default function TutorChat({
  messages = [],
  onStudentAnswer,
  currentNode,
  isLoading = false,
}) {
  const scrollRef = useRef(null);
  const [numberInput, setNumberInput] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setNumberInput("");
  }, [currentNode?.id]);

  const emotion = currentNode?.tutorEmotion ?? "happy";
  const style = emotionStyles[emotion] ?? emotionStyles.happy;

  return (
    <div className="flex flex-col h-full bg-white min-h-0" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Tutor avatar */}
      <div className="flex-shrink-0 flex items-center gap-2 p-3 border-b border-slate-100">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative"
          style={{
            background: "#1E3A5F",
            transform: style.tilt ? `rotate(${style.tilt}deg)` : undefined,
          }}
        >
          <svg viewBox="0 0 64 64" className="w-8 h-8" style={{ overflow: "visible" }}>
            <circle cx="32" cy="32" r="28" fill="white" />
            {style.eyes === "normal" && (
              <>
                <circle cx="24" cy="28" r="3" fill="#1E3A5F" />
                <circle cx="40" cy="28" r="3" fill="#1E3A5F" />
              </>
            )}
            {style.eyes === "raised" && (
              <>
                <circle cx="24" cy="26" r="3" fill="#1E3A5F" />
                <circle cx="40" cy="26" r="3" fill="#1E3A5F" />
                <path d="M 20 24 Q 24 22 28 24" stroke="#1E3A5F" strokeWidth="1.5" fill="none" />
                <path d="M 36 24 Q 40 22 44 24" stroke="#1E3A5F" strokeWidth="1.5" fill="none" />
              </>
            )}
            {style.eyes === "brow" && (
              <>
                <circle cx="24" cy="28" r="3" fill="#1E3A5F" />
                <circle cx="40" cy="28" r="3" fill="#1E3A5F" />
                <path d="M 18 26 Q 24 24 30 26" stroke="#1E3A5F" strokeWidth="1.5" fill="none" />
                <path d="M 34 24 Q 40 26 46 24" stroke="#1E3A5F" strokeWidth="1.5" fill="none" />
              </>
            )}
            <path d={style.smile} stroke="#1E3A5F" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-bold text-[#1E3A5F]" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Mia
        </span>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2 shadow-sm"
              style={{
                backgroundColor: msg.sender === "tutor" ? "#EFF6FF" : "#F0FDF4",
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
              className="rounded-2xl px-4 py-2 shadow-sm bg-[#EFF6FF] animate-pulse"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="inline-block w-6">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-3 border-t border-slate-100">
        {currentNode?.expectsAction === "free_explore" && (
          <button
            type="button"
            onClick={() => onStudentAnswer?.("next")}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white transition opacity-90 hover:opacity-100"
            style={{ backgroundColor: "#E8681A", fontFamily: "'Inter', sans-serif" }}
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
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B]"
              style={{ fontFamily: "'Inter', sans-serif" }}
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
              className="py-3 px-4 rounded-xl font-semibold text-white shrink-0"
              style={{ backgroundColor: "#E8681A", fontFamily: "'Inter', sans-serif" }}
            >
              Submit
            </button>
          </div>
        )}
        {currentNode?.expectsAction === "answer_choice" && currentNode.choices?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentNode.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onStudentAnswer?.(choice)}
                className="py-2.5 px-4 rounded-xl font-medium border-2 border-slate-200 hover:border-[#E8681A] hover:bg-orange-50 text-[#1E293B] transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {choice}
              </button>
            ))}
          </div>
        )}
        {currentNode?.expectsAction === "fill_whole" && (
          <button
            type="button"
            onClick={() => onStudentAnswer?.("check_fill")}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#E8681A", fontFamily: "'Inter', sans-serif" }}
          >
            Check my answer
          </button>
        )}
      </div>
    </div>
  );
}
