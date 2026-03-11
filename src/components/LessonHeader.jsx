export default function LessonHeader({ phase = "explore" }) {
  const phaseLabels = { explore: "Explore", learn: "Learn", quiz: "Quiz", complete: "Complete" };
  const phaseIndex = { explore: 0, learn: 1, quiz: 2, complete: 3 };
  const currentIdx = phaseIndex[phase] ?? 0;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 200,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #E8681A 0%, #F97316 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 18,
              fontWeight: 900,
              color: "white",
            }}
          >
            S
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "white",
          }}
        >
          Fraction Explorers
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i <= currentIdx ? "#E8681A" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
        <span
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            borderRadius: 20,
            padding: "4px 12px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {phaseLabels[phase] ?? "Explore"}
        </span>
      </div>
    </header>
  );
}
