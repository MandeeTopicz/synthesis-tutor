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

  const computeFill = useCallback(
    (pieces) => {
      if (!pieces.length) return false;
      const total = pieces.reduce((sum, { fraction }) => sum + 1 / (DENOMINATORS[fraction] ?? 1), 0);
      return Math.abs(total - 1) < 0.01;
    },
    []
  );

  const notifyPlaced = useCallback(
    (pieces) => {
      const fills = computeFill(pieces);
      onPiecesPlaced?.({ pieces: pieces.map((p) => p.fraction), fills });
    },
    [onPiecesPlaced, computeFill]
  );

  const handleDragStart = (info) => {
    dragRef.current = info;
  };

  const handleDragEnd = (info) => {
    if (!dragRef.current) return;
    const zone = dropZoneRef.current || containerRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const dropX = info.clientX != null ? info.clientX - rect.left : info.x;
    const dropY = info.clientY != null ? info.clientY - rect.top : info.y;
    const inZone = dropX >= 0 && dropX <= rect.width && dropY >= 0 && dropY <= rect.height;
    if (inZone) {
      const w = getPieceWidth(dragRef.current.fraction);
      const newPiece = {
        id: `placed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fraction: dragRef.current.fraction,
        x: Math.max(0, dropX - w / 2),
        y: Math.max(0, dropY - pieceHeight / 2),
        width: w,
      };
      setLocalPlaced((prev) => {
        const next = [...prev, newPiece];
        notifyPlaced(next);
        return next;
      });
    }
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full min-h-0 bg-[#F1F5F9]"
      style={{ minWidth: 0 }}
    >
      {/* Reference row — 1 whole bar at top */}
      <div className="flex-shrink-0 p-2 flex items-center justify-center">
        <div className="relative" style={{ width: wholeWidth, height: pieceHeight }}>
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

      {/* Drop zone — workspace area */}
      <div
        ref={dropZoneRef}
        className="flex-1 relative overflow-hidden min-h-[120px]"
        style={{ touchAction: "none" }}
      >
        {localPlaced.map((p) => (
          <FractionBar
            key={p.id}
            id={p.id}
            fraction={p.fraction}
            width={p.width}
            height={pieceHeight}
            x={p.x}
            y={p.y}
            draggable={true}
            inTray={false}
            isPlaced={true}
            onDragStart={handleDragStart}
            onDragEnd={(info) => {
              setLocalPlaced((prev) => prev.filter((x) => x.id !== p.id));
              handleDragEnd(info);
            }}
          />
        ))}
      </div>

      {/* Piece tray */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 flex flex-wrap gap-4 justify-center items-end">
        {TRAY_FRACTIONS.map((fraction) => {
          const w = getPieceWidth(fraction);
          const isHighlight = highlightPiece === fraction;
          return (
            <div
              key={fraction}
              className="flex flex-col items-center gap-1"
              style={{
                outline: isHighlight ? "3px solid #E8681A" : "none",
                borderRadius: 8,
                padding: 4,
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
                className="text-xs font-medium text-slate-600"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {FRACTION_COLORS[fraction]?.label ?? fraction}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
