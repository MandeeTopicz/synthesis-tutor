import { useRef, useState } from "react";

const FRACTION_COLORS = {
  whole: { bg: "#4F46E5", text: "#FFFFFF", label: "1" },
  half: { bg: "#F97316", text: "#FFFFFF", label: "1/2" },
  third: { bg: "#10B981", text: "#FFFFFF", label: "1/3" },
  fourth: { bg: "#0EA5E9", text: "#FFFFFF", label: "1/4" },
  sixth: { bg: "#8B5CF6", text: "#FFFFFF", label: "1/6" },
  eighth: { bg: "#F43F5E", text: "#FFFFFF", label: "1/8" },
};

export default function FractionBar({
  fraction,
  width,
  height = 48,
  draggable = true,
  inTray = false,
  isPlaced = false,
  onDragStart,
  onDragEnd,
  onSplit,
  x = 0,
  y = 0,
  id,
  style = {},
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const elRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const position = isDragging ? dragPosition : inTray ? { x: 0, y: 0 } : { x, y };

  const colors = FRACTION_COLORS[fraction] ?? FRACTION_COLORS.whole;

  const handlePointerDown = (e) => {
    if (!draggable || !onDragStart) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    hasMovedRef.current = false;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart?.({ id, fraction, x: rect.left, y: rect.top, width, height });
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !elRef.current) return;
    if (!hasMovedRef.current) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }
    if (inTray) {
      // Fixed positioning: use viewport coordinates directly
      setDragPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    } else {
      const parent = elRef.current.parentElement?.getBoundingClientRect();
      if (!parent) return;
      setDragPosition({
        x: e.clientX - parent.left - dragOffsetRef.current.x,
        y: e.clientY - parent.top - dragOffsetRef.current.y,
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const didMove = hasMovedRef.current;
    setIsDragging(false);
    if (didMove && onDragEnd) {
      onDragEnd({
        id,
        fraction,
        x: dragPosition.x,
        y: dragPosition.y,
        width,
        height,
        clientX: e.clientX,
        clientY: e.clientY,
        offsetX: dragOffsetRef.current.x,
        offsetY: dragOffsetRef.current.y,
      });
    }
  };

  const transform = (inTray && !isDragging)
    ? undefined
    : `translate(${position.x}px, ${position.y}px)`;
  const scale = isDragging ? 1.05 : 1;
  const pieceBoxShadow = `0 2px 8px ${colors.bg}66`;
  const pieceFilter = isPlaced && !inTray
    ? `drop-shadow(0 4px 8px ${colors.bg}44)`
    : "none";

  return (
    <div
      ref={elRef}
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={(e) => {
        if (e.buttons === 0) handlePointerUp(e);
      }}
      onClick={onSplit && !draggable ? onSplit : undefined}
      style={{
        position: (inTray && !isDragging) ? "relative" : isDragging && inTray ? "fixed" : "absolute",
        left: 0,
        top: 0,
        transform: transform ? `${transform} scale(${scale})` : `scale(${scale})`,
        transition: isDragging ? "none" : "transform 150ms ease, box-shadow 150ms ease",
        boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.3)" : pieceBoxShadow,
        filter: pieceFilter,
        zIndex: isDragging ? 9999 : undefined,
        cursor: draggable ? "grab" : "default",
        touchAction: "none",
        borderRadius: 6,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ display: "block", pointerEvents: "none" }}
      >
        <rect
          fill={colors.bg}
          rx="6"
          width="100%"
          height="100%"
          stroke={colors.bg + "AA"}
          strokeWidth="1"
        />
        <text
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          x={width / 2}
          y={height / 2}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: Math.min(22, width / 2.8),
          }}
        >
          {colors.label}
        </text>
      </svg>
    </div>
  );
}

export { FRACTION_COLORS };
