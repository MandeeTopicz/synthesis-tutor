export default function AdvanceButton({ onAdvance }) {
  return (
    <button
      type="button"
      onClick={onAdvance}
      className="advance-btn"
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #E8681A, #F97316)",
        boxShadow: "0 4px 20px rgba(232,104,26,0.5)",
        border: "none",
        color: "white",
        fontSize: 24,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      →
    </button>
  );
}
