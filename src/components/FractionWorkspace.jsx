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
  const [workspaceWidth, setWorkspaceWidth] = useState(externalWidth || 400);
  const [localPlaced, setLocalPlaced] = useState([]);
  const dragRef = useRef(null);
  const isProcessingDrop = useRef(false);

  const wholeWidth = workspaceWidth;
  const pieceHeight = 48;
  const refRowHeight = pieceHeight + 16;

  useEffect(() => {
    if (externalWidth) setWorkspaceWidth(externalWidth);
  }, [externalWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWorkspaceWidth(w);
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
    console.log("dropZone element:", dropZoneRef.current);
    console.log("dropZone children count:", dropZoneRef.current?.children?.length);
  }, [localPlaced]);

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
      const pieceWidth = workspaceWidth / DENOMINATORS[fraction];
      const pieceHeightVal = 48;
      const x = localX - pieceWidth / 2;
      const y = localY - pieceHeightVal / 2;
      console.log("clientX:", clientX, "clientY:", clientY);
      console.log("rectLeft:", rect.left, "rectTop:", rect.top);
      console.log("localX:", localX, "localY:", localY);
      console.log("final x:", x, "final y:", y);
      const newPiece = { id: Date.now(), fraction, x, y, width: pieceWidth };
      setLocalPlaced((prev) => [...prev, newPiece]);
    }
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full min-h-0"
      style={{ minWidth: 0, background: "rgba(0,0,0,0.15)" }}
    >
      {/* Reference row — 1 whole bar at top */}
      <div className="flex-shrink-0 p-4 flex flex-col items-center gap-2">
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          1 whole
        </span>
        <div
          style={{
            width: wholeWidth + 32,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
          }}
        >
          <div className="relative" style={{ width: wholeWidth, height: pieceHeight, margin: "0 auto" }}>
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
      </div>

      {/* Drop zone — direct parent of placed pieces, position: relative only */}
      <div
        ref={dropZoneRef}
        className="flex-1 overflow-hidden mx-4 mb-2"
        style={{
          position: "relative",
          padding: 0,
          margin: "0 16px 8px",
          touchAction: "none",
          minHeight: 160,
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.1)",
          borderRadius: 12,
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

      {/* Piece tray */}
      <div
        className="flex-shrink-0 flex flex-col p-4"
        style={{
          background: "rgba(0,0,0,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 16px",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Piece tray
          </span>
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
        <div
          className="flex flex-wrap gap-4 justify-center items-end"
        >
          {TRAY_FRACTIONS.map((fraction) => {
            const w = getPieceWidth(fraction);
            const isHighlight = highlightPiece === fraction;
            return (
              <div
                key={fraction}
                className="flex flex-col items-center gap-1"
                style={{
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
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {FRACTION_COLORS[fraction]?.label ?? fraction}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
