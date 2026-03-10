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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const elRef = useRef(null);

  const position = inTray ? { x: 0, y: 0 } : isDragging ? dragPosition : { x, y };

  const colors = FRACTION_COLORS[fraction] ?? FRACTION_COLORS.whole;

  const handlePointerDown = (e) => {
    if (!draggable || !onDragStart) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart?.({ id, fraction, x: rect.left, y: rect.top, width, height });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !elRef.current) return;
    const rect = elRef.current.getBoundingClientRect();
    const parent = elRef.current.parentElement?.getBoundingClientRect();
    if (!parent) return;
    setDragPosition({
      x: e.clientX - parent.left - dragOffset.x,
      y: e.clientY - parent.top - dragOffset.y,
    });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd({
        id,
        fraction,
        x: dragPosition.x,
        y: dragPosition.y,
        width,
        height,
        clientX: e.clientX,
        clientY: e.clientY,
      });
    }
  };

  const transform = inTray
    ? undefined
    : `translate(${position.x}px, ${position.y}px)`;
  const scale = isDragging ? 1.05 : 1;
  const boxShadow = isDragging
    ? "0 8px 16px rgba(0,0,0,0.2)"
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
        position: inTray ? "relative" : "absolute",
        left: inTray ? 0 : 0,
        top: inTray ? 0 : 0,
        transform: transform ? `${transform} scale(${scale})` : `scale(${scale})`,
        transition: isDragging ? "none" : "transform 150ms ease, box-shadow 150ms ease",
        boxShadow,
        cursor: draggable ? "grab" : "default",
        touchAction: "none",
        outline: isPlaced ? "2px solid rgba(30, 58, 95, 0.4)" : "none",
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
        />
        <text
          fill={colors.text}
          textAnchor="middle"
          dominantBaseline="central"
          x={width / 2}
          y={height / 2}
          style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: Math.min(20, width / 3) }}
        >
          {colors.label}
        </text>
      </svg>
    </div>
  );
}

export { FRACTION_COLORS };
