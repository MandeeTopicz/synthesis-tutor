import { useRef, useState, useEffect, useCallback } from "react";
import FractionBar, { FRACTION_COLORS } from "./FractionBar.jsx";

const TRAY_FRACTIONS = ["whole", "half", "third", "fourth", "sixth", "eighth"];
const DENOMINATORS = {
  whole: 1,
  half: 2,
  third: 3,
  fourth: 4,
  sixth: 6,
  eighth: 8,
};
const TRAY_LABELS = {
  whole: { notation: "1", word: "One" },
  half: { notation: "1/2", word: "Half" },
  third: { notation: "1/3", word: "Third" },
  fourth: { notation: "1/4", word: "Fourth" },
  sixth: { notation: "1/6", word: "Sixth" },
  eighth: { notation: "1/8", word: "Eighth" },
};
const MAX_BAR_WIDTH = 600;

export default function FractionWorkspace({
  placedPieces,
  onPiecesPlaced,
  highlightPiece = null,
  clearWorkspace: clearWorkspaceCommand = false,
  onClearWorkspaceAck,
  workspaceWidth: externalWidth,
}) {
  const containerRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(externalWidth || Math.min(400, MAX_BAR_WIDTH));
  const [localPlaced, setLocalPlaced] = useState([]);
  const dragRef = useRef(null);
  const isProcessingDrop = useRef(false);

  const wholeWidth = Math.min(workspaceWidth, MAX_BAR_WIDTH);
  const pieceHeight = 48;

  useEffect(() => {
    if (externalWidth) setWorkspaceWidth(externalWidth);
  }, [externalWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWorkspaceWidth(Math.min(w, MAX_BAR_WIDTH));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const prevClearRef = useRef(0);
  useEffect(() => {
    if (typeof clearWorkspaceCommand === "number" && clearWorkspaceCommand > prevClearRef.current) {
      prevClearRef.current = clearWorkspaceCommand;
      setLocalPlaced([]);
      onClearWorkspaceAck?.();
    }
  }, [clearWorkspaceCommand, onClearWorkspaceAck]);

  const getPieceWidth = (fraction) => {
    const denom = DENOMINATORS[fraction] ?? 1;
    return (1 / denom) * wholeWidth;
  };

  useEffect(() => {
    const fills =
      localPlaced.length > 0 &&
      Math.abs(localPlaced.reduce((sum, { fraction }) => sum + 1 / (DENOMINATORS[fraction] ?? 1), 0) - 1) < 0.01;
    onPiecesPlaced?.({ pieces: localPlaced.map((p) => p.fraction), fills: !!fills });
  }, [localPlaced, onPiecesPlaced]);

  const handleDragStart = (info) => {
    dragRef.current = info;
  };

  const handleDragEnd = (info) => {
    if (isProcessingDrop.current) return;
    isProcessingDrop.current = true;
    setTimeout(() => { isProcessingDrop.current = false; }, 100);

    if (!dragRef.current) return;
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    const rect = dropZone.getBoundingClientRect();
    const clientX = info.clientX;
    const clientY = info.clientY;
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const inZone = localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;
    if (inZone) {
      const fraction = dragRef.current.fraction;
      const pieceWidth = wholeWidth / DENOMINATORS[fraction];
      const pieceHeightVal = 48;
      const x = localX - pieceWidth / 2;
      const y = localY - pieceHeightVal / 2;
      const newPiece = { id: Date.now(), fraction, x, y, width: pieceWidth };
      setLocalPlaced((prev) => [...prev, newPiece]);
    }
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      {/* Reference bar — centered, below overlay area to avoid grey text showing through */}
      <div
        style={{
          flex: "0 0 30%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 24px",
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 8,
          }}
        >
          1 whole
        </span>
        <div
          style={{
            width: wholeWidth,
            height: pieceHeight,
          }}
        >
          <FractionBar
            fraction="whole"
            width={wholeWidth}
            height={pieceHeight}
            draggable={false}
            inTray={false}
            isPlaced={false}
          />
        </div>
      </div>

      {/* Drop zone — fills middle, transparent */}
      <div
        ref={dropZoneRef}
        style={{
          flex: 1,
          position: "relative",
          touchAction: "none",
          minHeight: 120,
          overflow: "hidden",
        }}
      >
        {localPlaced.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x + "px",
              top: p.y + "px",
              width: p.width + "px",
              height: pieceHeight + "px",
            }}
          >
            <FractionBar
              id={p.id}
              fraction={p.fraction}
              width={p.width}
              height={pieceHeight}
              x={0}
              y={0}
              draggable={true}
              inTray={false}
              isPlaced={true}
              onDragStart={handleDragStart}
              onDragEnd={(info) => {
                setLocalPlaced((prev) => prev.filter((x) => x.id !== p.id));
                handleDragEnd(info);
              }}
            />
          </div>
        ))}
      </div>

      {/* Clear button — left above tray */}
      <div
        style={{
          flexShrink: 0,
          padding: "8px 24px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <button
          type="button"
          onClick={() => setLocalPlaced([])}
          className="clear-workspace-btn"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            borderRadius: 8,
            padding: "6px 12px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Clear workspace
        </button>
      </div>

      {/* Piece tray — single centered row */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        {TRAY_FRACTIONS.map((fraction) => {
          const w = getPieceWidth(fraction);
          const isHighlight = highlightPiece === fraction;
          const labels = TRAY_LABELS[fraction] ?? { notation: fraction, word: fraction };
          const slotWidth = fraction === "whole" ? wholeWidth + 32 : wholeWidth / 2;
          return (
            <div
              key={fraction}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: slotWidth,
                outline: isHighlight ? "3px solid #E8681A" : "none",
                borderRadius: 10,
                padding: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ width: w, height: pieceHeight }}>
                <FractionBar
                  id={`tray-${fraction}`}
                  fraction={fraction}
                  width={w}
                  height={pieceHeight}
                  draggable={true}
                  inTray={true}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                {labels.word}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
