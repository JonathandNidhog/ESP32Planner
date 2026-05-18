import { boardMetrics, clampToPerfboard, getComponentSize } from "../../engine/router";
import type { ComponentDefinition, PerfboardConfig, PlacedComponent } from "../../models/types";

interface ComponentNodeProps {
  component: PlacedComponent;
  definition?: ComponentDefinition;
  perfboard: PerfboardConfig;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number, col: number, row: number) => void;
}

function VisualGlyph({ kind, color, width, height, label }: { kind: string; color: string; width: number; height: number; label: string }) {
  const cx = width * 0.58;
  const cy = height * 0.5;

  if (kind === "led") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={17} fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth={2} />
        <path d={`M${cx - 10},${cy + 10} L${cx},${cy - 10} L${cx + 10},${cy + 10} Z`} fill="white" opacity={0.92} />
        <path d={`M${cx - 18},${cy - 18} l-10,-10 M${cx + 5},${cy - 20} l8,-13`} stroke="white" strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  }

  if (kind === "resistor") {
    return (
      <g>
        <line x1={width * 0.34} y1={cy} x2={width * 0.82} y2={cy} stroke="white" strokeWidth={3} />
        <rect x={width * 0.43} y={cy - 11} width={46} height={22} rx={8} fill="rgba(255,255,255,0.9)" />
        {[0, 1, 2].map((i) => <rect key={i} x={width * 0.46 + i * 12} y={cy - 11} width={4} height={22} fill={color} />)}
      </g>
    );
  }

  if (kind === "display") {
    return (
      <g>
        <rect x={width * 0.38} y={cy - 22} width={70} height={44} rx={5} fill="#0f172a" stroke="white" strokeWidth={2} />
        <rect x={width * 0.43} y={cy - 13} width={48} height={24} rx={3} fill="#67e8f9" opacity={0.78} />
      </g>
    );
  }

  if (kind === "key-switch") {
    return (
      <g>
        <rect x={cx - 24} y={cy - 24} width={48} height={48} rx={8} fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth={2} />
        <path d={`M${cx - 14},${cy} H${cx + 14} M${cx},${cy - 14} V${cy + 14}`} stroke="white" strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  }

  if (kind === "sensor" || kind === "module") {
    return (
      <g>
        <rect x={cx - 33} y={cy - 24} width={66} height={48} rx={7} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth={2} />
        <circle cx={cx - 20} cy={cy - 12} r={5} fill="white" opacity={0.9} />
        <circle cx={cx + 20} cy={cy + 12} r={5} fill="white" opacity={0.9} />
        <rect x={cx - 12} y={cy - 9} width={24} height={18} rx={3} fill="white" opacity={0.82} />
      </g>
    );
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={24} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth={2} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}>{label}</text>
    </g>
  );
}

export default function ComponentNode({ component, definition, perfboard, selected, onSelect, onMove }: ComponentNodeProps) {
  if (!definition) return null;

  const { width, height } = getComponentSize(definition.footprint);
  const center = { x: width / 2, y: height / 2 };

  function onPointerDown(event: React.PointerEvent<SVGGElement>) {
    event.stopPropagation();
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg || !definition) return;
    onSelect(component.id);
    event.currentTarget.setPointerCapture(event.pointerId);

    const start = svg.createSVGPoint();
    start.x = event.clientX;
    start.y = event.clientY;
    const transformedStart = start.matrixTransform(svg.getScreenCTM()?.inverse());
    const offsetX = transformedStart.x - component.x;
    const offsetY = transformedStart.y - component.y;

    const move = (moveEvent: PointerEvent) => {
      const point = svg.createSVGPoint();
      point.x = moveEvent.clientX;
      point.y = moveEvent.clientY;
      const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
      const rawCol = Math.round((transformed.x - offsetX - boardMetrics.gridX) / perfboard.cellSize);
      const rawRow = Math.round((transformed.y - offsetY - boardMetrics.gridY) / perfboard.cellSize);
      const snapped = clampToPerfboard(rawCol, rawRow, definition.footprint, perfboard);
      const x = boardMetrics.gridX + snapped.col * perfboard.cellSize;
      const y = boardMetrics.gridY + snapped.row * perfboard.cellSize;
      onMove(component.id, x, y, snapped.col, snapped.row);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <g
      className={`component-node ${selected ? "selected" : ""}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation}, ${center.x}, ${center.y})`}
      onPointerDown={onPointerDown}
    >
      <rect width={width} height={height} rx={12} fill={definition.color} opacity={0.96} stroke={selected ? "#facc15" : "#0f172a"} strokeWidth={selected ? 3 : 1.5} />
      <rect x={8} y={8} width={width - 16} height={height - 16} rx={9} fill="rgba(255,255,255,0.12)" />
      <text x={width / 2} y={20} textAnchor="middle" fill="white" fontSize={13} fontWeight={800}>
        {definition.name}
      </text>
      <VisualGlyph kind={definition.visual?.kind || "generic"} color={definition.color} width={width} height={height} label={definition.visual?.label || definition.name} />
      <text x={width / 2} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.86)" fontSize={10}>
        {definition.footprint.cols}x{definition.footprint.rows} holes · {component.rotation}°
      </text>
      {definition.pins.map((pin, index) => {
        const y = ((index + 1) * height) / (definition.pins.length + 1);
        return (
          <g key={pin.id}>
            <circle cx={0} cy={y} r={6} fill="#fff" stroke="#111827" strokeWidth={1.2} />
            <rect x={8} y={y - 9} width={Math.max(34, pin.label.length * 8 + 10)} height={18} rx={5} fill="rgba(15,23,42,0.68)" />
            <text x={14} y={y + 4} fill="white" fontSize={11} fontWeight={700}>
              {pin.label}
            </text>
            <title>{pin.note || pin.required.join("/")}</title>
          </g>
        );
      })}
    </g>
  );
}
