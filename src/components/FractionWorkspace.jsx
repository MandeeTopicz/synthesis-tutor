import { useRef, useState, useEffect, useCallback } from "react";
import FractionBar, { FRACTION_COLORS } from "./FractionBar.jsx";
import { checkFillsWhole } from "../lib/alignmentCheck.js";

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
const TICK_FRACTIONS = [1 / 2, 1 / 3, 1 / 4, 1 / 6, 1 / 8];
const GUIDE_Y = 24;

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

  const isMobile = workspaceWidth < 768;
  // Tile size: large (48px) on full screen / wide viewport; shrink only when narrow or minimized
  const useSmallTiles = workspaceWidth < 600;
  const wholeWidth = Math.min(workspaceWidth, MAX_BAR_WIDTH);
  const pieceHeight = useSmallTiles ? 32 : 48;

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
    const { fills } = checkFillsWhole(localPlaced, wholeWidth, pieceHeight);
    onPiecesPlaced?.({ pieces: localPlaced.map((p) => p.fraction), fills: !!fills });
  }, [localPlaced, onPiecesPlaced, pieceHeight, wholeWidth]);

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
      const pieceHeightVal = pieceHeight;
      const offsetX = info.offsetX ?? pieceWidth / 2;
      const offsetY = info.offsetY ?? pieceHeightVal / 2;
      const x = localX - offsetX;
      const y = localY - offsetY;
      const newPiece = { id: Date.now(), fraction, x, y, width: pieceWidth };
      setLocalPlaced((prev) => [...prev, newPiece]);
    }
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      style={{
        paddingTop: 0,
        boxSizing: "border-box",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* Drop zone — marginTop clears nav + TutorOverlay; contains guide line, reference bar, placed pieces */}
      <div
        ref={dropZoneRef}
        style={{
          flex: 1,
          position: "relative",
          marginTop: 72,
          touchAction: "none",
          minHeight: 200,
          overflow: "visible",
        }}
      >
        {/* One-whole alignment guide line at GUIDE_Y */}
        <div
          style={{
            position: "absolute",
            top: GUIDE_Y + "px",
            left: "50%",
            transform: "translateX(-50%)",
            width: wholeWidth,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: -14,
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            One Whole
          </span>
          {TICK_FRACTIONS.map((frac, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: wholeWidth * frac - 0.5,
                top: -4,
                width: 1,
                height: 8,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            top: GUIDE_Y + 4 + "px",
            left: "50%",
            transform: "translateX(-50%)",
            width: wholeWidth,
            height: pieceHeight,
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.35,
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

        {localPlaced.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x + "px",
              top: p.y + "px",
              width: p.width + "px",
              height: pieceHeight + "px",
              zIndex: 1,
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
          padding: isMobile ? "4px 12px 0" : "8px 24px 0",
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
          padding: isMobile ? "6px 8px 10px" : "12px 24px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: isMobile ? 6 : 12,
          alignItems: "flex-end",
        }}
      >
        {TRAY_FRACTIONS.map((fraction) => {
          const w = getPieceWidth(fraction);
          const isHighlight = highlightPiece === fraction;
          const labels = TRAY_LABELS[fraction] ?? { notation: fraction, word: fraction };
          const slotPad = isMobile ? 4 : 8;
          const slotWidth = Math.max(w + slotPad * 2, isMobile ? 48 : 80);
          return (
            <div
              key={fraction}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isMobile ? 2 : 4,
                width: slotWidth,
                outline: isHighlight ? "3px solid #E8681A" : "none",
                borderRadius: isMobile ? 6 : 10,
                padding: isMobile ? 4 : 8,
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
                  fontSize: isMobile ? 9 : 11,
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                  marginTop: isMobile ? 1 : 4,
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
