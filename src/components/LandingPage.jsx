const AVATARS = [
  { id: "Sunny", color: "#FCD34D", name: "Sunny" },
  { id: "River", color: "#60A5FA", name: "River" },
  { id: "Sage", color: "#6EE7B7", name: "Sage" },
  { id: "Blaze", color: "#FB923C", name: "Blaze" },
];

const DIFFICULTIES = [
  {
    id: "explorer",
    icon: "🗺️",
    title: "Explorer",
    description: "Take your time, get hints",
    selectedBg: "#FEF3EB",
    selectedBorder: "#E8681A",
  },
  {
    id: "adventurer",
    icon: "⚔️",
    title: "Adventurer",
    description: "A bit more challenge",
    selectedBg: "#EEF4FB",
    selectedBorder: "#1E3A5F",
  },
];

export default function LandingPage({ selectedAvatar, setSelectedAvatar, difficulty, setDifficulty, onStart }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 50%, #F0F7EE 100%)",
      }}
    >
      <div
        className="w-full max-w-[600px] rounded-2xl bg-white p-12 shadow-lg"
        style={{
          padding: 48,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
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
                  color: "#1E3A5F",
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
              color: "#64748B",
            }}
          >
            A math adventure with Mia your guide
          </p>
        </div>

        {/* Avatar selection */}
        <div className="mb-10">
          <label
            className="block mb-4 font-bold uppercase"
            style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, color: "#1E3A5F", letterSpacing: "0.1em" }}
          >
            Choose your explorer
          </label>
          <div className="flex justify-center gap-6">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className="flex flex-col items-center transition-all duration-200 ease-out"
                style={{
                  transform: selectedAvatar === avatar.id ? "scale(1.1)" : "scale(1)",
                  outline: "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative transition-all duration-200"
                  style={{
                    backgroundColor: avatar.color,
                    border:
                      selectedAvatar === avatar.id
                        ? "3px solid #E8681A"
                        : "2px solid #E2E8F0",
                    boxSizing: "border-box",
                  }}
                >
                  <svg viewBox="0 0 72 72" className="w-full h-full" style={{ overflow: "visible" }}>
                    <circle cx="26" cy="28" r="4" fill="#1E293B" />
                    <circle cx="46" cy="28" r="4" fill="#1E293B" />
                    <path
                      d="M 22 42 Q 36 52 50 42"
                      stroke="#1E293B"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span
                  className="mt-2"
                  style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#1E3A5F" }}
                >
                  {avatar.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selection */}
        <div className="mb-10">
          <label
            className="block mb-4 font-bold uppercase"
            style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, color: "#1E3A5F", letterSpacing: "0.1em" }}
          >
            Pick your level
          </label>
          <div className="flex gap-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className="flex-1 flex flex-col items-center text-center rounded-xl border-2 transition-all duration-200"
                style={{
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: difficulty === d.id ? d.selectedBg : "white",
                  borderColor: difficulty === d.id ? d.selectedBorder : "#E5E7EB",
                  cursor: "pointer",
                }}
              >
                <span className="block mb-2" style={{ fontSize: 36 }}>{d.icon}</span>
                <span
                  className="font-bold block mb-1"
                  style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, color: "#1E3A5F" }}
                >
                  {d.title}
                </span>
                <span
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B" }}
                >
                  {d.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            height: 56,
            fontSize: 20,
            fontFamily: "'Nunito', sans-serif",
            backgroundColor: "#E8681A",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#D4580F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#E8681A";
          }}
        >
          Start Your Adventure! 🚀
        </button>
      </div>
    </div>
  );
}
