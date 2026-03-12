import { useEffect, useState } from "react";

const AVATARS = [
  {
    id: "Sunny",
    name: "Sunny",
    background: "linear-gradient(145deg, #1a1a2e, #16213e)",
    accent: "#F59E0B",
    skin: "#FCD34D",
    stroke: "#F59E0B",
    eyes: "#92400E",
  },
  {
    id: "River",
    name: "River",
    background: "linear-gradient(145deg, #0f172a, #1e293b)",
    accent: "#3B82F6",
    skin: "#93C5FD",
    stroke: "#3B82F6",
    eyes: "#1E3A5F",
  },
  {
    id: "Sage",
    name: "Sage",
    background: "linear-gradient(145deg, #0d1f1a, #1a2e25)",
    accent: "#10B981",
    skin: "#6EE7B7",
    stroke: "#10B981",
    eyes: "#065F46",
  },
  {
    id: "Blaze",
    name: "Blaze",
    background: "linear-gradient(145deg, #1f0d0a, #2e1a14)",
    accent: "#F97316",
    skin: "#FCA5A5",
    stroke: "#F97316",
    eyes: "#7F1D1D",
  },
];

const GRADE_LEVELS = [
  {
    id: "1-2",
    grade: "1st–2nd grade",
    title: "Introductory",
    description: "Intro to fractions",
    selectedBorder: "#F59E0B",
    selectedBg: "rgba(245,158,11,0.1)",
  },
  {
    id: "3",
    grade: "3rd grade",
    title: "Fraction sense",
    description: "Understanding and sense-making",
    selectedBorder: "#10B981",
    selectedBg: "rgba(16,185,129,0.1)",
  },
  {
    id: "4",
    grade: "4th grade",
    title: "Equivalence & comparison",
    description: "Equivalent fractions, comparing",
    selectedBorder: "#3B82F6",
    selectedBg: "rgba(59,130,246,0.1)",
  },
  {
    id: "5-6",
    grade: "5th–6th grade",
    title: "Operations",
    description: "Adding, subtracting & more",
    selectedBorder: "#8B5CF6",
    selectedBg: "rgba(139,92,246,0.1)",
  },
];

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div
        style={{
          width: 32,
          height: 2,
          marginTop: 6,
          background: "linear-gradient(90deg, #E8681A, #F97316)",
          borderRadius: 1,
        }}
      />
    </div>
  );
}

export default function LandingPage({ selectedAvatar, setSelectedAvatar, difficulty, setDifficulty, onStart }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        minHeight: "100dvh",
        height: isMobile ? "100dvh" : undefined,
        minWidth: "100%",
        width: "100%",
        overflow: "hidden",
        padding: isMobile ? 12 : 24,
        boxSizing: "border-box",
        background: "var(--app-bg, linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%))",
      }}
    >
      <div
        className="w-full max-w-[580px] rounded-[28px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
          padding: isMobile ? 24 : 48,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          maxHeight: isMobile ? "calc(100dvh - 24px)" : undefined,
          overflowY: isMobile ? "auto" : undefined,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header / Logo */}
        <div className="text-center mb-10">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(135deg, #E8681A 0%, #F97316 100%)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(232, 104, 26, 0.35)",
                transform: "rotate(-4deg)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-1px",
                  transform: "rotate(4deg)",
                  display: "block",
                }}
              >
                S
              </span>
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#E8681A",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Superbuilders
              </div>
              <div
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                }}
              >
                Fraction Explorers
              </div>
            </div>
          </div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            A math adventure with Mia your guide
          </p>
        </div>

        {/* Avatar selection */}
        <div className="mb-10">
          <SectionLabel>Choose your explorer</SectionLabel>
          <div className="flex gap-3" style={{ gap: 12 }}>
            {AVATARS.map((avatar) => {
              const selected = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className="flex-1 flex flex-col overflow-hidden"
                  style={{
                    borderRadius: 18,
                    cursor: "pointer",
                    transition: "all 220ms ease",
                    outline: "none",
                    border: selected ? `2px solid ${avatar.accent}` : "2px solid rgba(255,255,255,0.08)",
                    boxShadow: selected
                      ? `0 0 0 1px ${avatar.accent}, 0 0 24px ${avatar.accent}99, 0 8px 32px rgba(0,0,0,0.4)`
                      : "0 4px 16px rgba(0,0,0,0.3)",
                    transform: selected ? "translateY(-4px) scale(1.03)" : "translateY(0) scale(1)",
                    background: avatar.background,
                  }}
                >
                  <div style={{ position: "relative", flex: 1, minHeight: 80 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        paddingTop: 8,
                      }}
                    >
                      <svg
                        viewBox="0 0 64 64"
                        width={62}
                        height={62}
                        style={{ overflow: "visible" }}
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill={avatar.skin}
                          stroke={avatar.stroke}
                          strokeWidth="2"
                        />
                        <circle
                          cx="24"
                          cy="28"
                          r="3.5"
                          fill={avatar.eyes}
                        />
                        <circle
                          cx="40"
                          cy="28"
                          r="3.5"
                          fill={avatar.eyes}
                        />
                        {selected && (
                          <>
                            <circle cx="25" cy="27" r="1.5" fill="white" opacity="0.6" />
                            <circle cx="41" cy="27" r="1.5" fill="white" opacity="0.6" />
                          </>
                        )}
                        <path
                          d="M 20 41 Q 32 52 44 41"
                          stroke={avatar.eyes}
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    style={{
                      background: selected ? `${avatar.accent}20` : "rgba(255,255,255,0.04)",
                      borderTop: `1px solid ${selected ? `${avatar.accent}40` : "rgba(255,255,255,0.06)"}`,
                      padding: 8,
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 13,
                        fontWeight: 800,
                        color: selected ? avatar.accent : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {avatar.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade level selection */}
        <div className="mb-10">
          <SectionLabel>Pick your level</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {GRADE_LEVELS.map((level) => {
              const selected = difficulty === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setDifficulty(level.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    padding: 16,
                    borderRadius: 14,
                    background: selected ? level.selectedBg : "rgba(255,255,255,0.04)",
                    border: `2px solid ${selected ? level.selectedBorder : "rgba(255,255,255,0.08)"}`,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    transform: selected ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: selected ? `0 4px 16px ${level.selectedBorder}33` : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: selected ? level.selectedBorder : "rgba(255,255,255,0.4)",
                      letterSpacing: "0.5px",
                      marginBottom: 4,
                    }}
                  >
                    {level.grade}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1.3,
                    }}
                  >
                    {level.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            height: 54,
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            background: "linear-gradient(135deg, #E8681A, #F97316)",
            border: "none",
            borderRadius: 14,
            boxShadow: "0 4px 24px rgba(232,104,26,0.45)",
          }}
        >
          Start Your Adventure! 🚀
        </button>

        {/* Footer */}
        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Powered by Superbuilders × AI
        </p>
      </div>
    </div>
  );
}
