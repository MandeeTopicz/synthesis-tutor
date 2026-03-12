export default function LessonHeader({ phase = "explore" }) {
  const phaseLabels = { explore: "Explore", learn: "Learn", quiz: "Quiz", complete: "Complete" };
  const phaseIndex = { explore: 0, learn: 1, quiz: 2, complete: 3 };
  const currentIdx = phaseIndex[phase] ?? 0;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: isMobile ? "max(env(safe-area-inset-top, 0px), 20px)" : "env(safe-area-inset-top, 0px)",
        height: 56,
        boxSizing: "content-box",
        zIndex: 200,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: isMobile ? 12 : 16,
        paddingRight: isMobile ? 12 : 16,
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, minWidth: 0, flex: "1 1 auto" }}>
        <div
          style={{
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            flexShrink: 0,
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
              fontSize: isMobile ? 16 : 18,
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
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Fraction Explorers
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, flexShrink: 0 }}>
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
            fontSize: isMobile ? 11 : 12,
            borderRadius: 20,
            padding: isMobile ? "3px 8px" : "4px 12px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {phaseLabels[phase] ?? "Explore"}
        </span>
      </div>
    </header>
  );
}
