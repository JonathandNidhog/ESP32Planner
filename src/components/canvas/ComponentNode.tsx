import { boardMetrics, clampToPerfboard, getComponentSize } from "../../engine/router";
import type { ComponentDefinition, ConnectionEndpoint, PerfboardConfig, PlacedComponent } from "../../models/types";

interface ComponentNodeProps {
  component: PlacedComponent;
  definition?: ComponentDefinition;
  perfboard: PerfboardConfig;
  selected: boolean;
  manualWireStart?: ConnectionEndpoint;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number, col: number, row: number) => void;
  onPinClick: (endpoint: ConnectionEndpoint) => void;
  onPinHover: (text?: string, event?: React.PointerEvent<SVGGElement>) => void;
}

function upright(rotation: number, x: number, y: number) {
  return rotation === 0 ? undefined : `rotate(${-rotation}, ${x}, ${y})`;
}

function VisualGlyph({ component, definition, width, height }: { component: PlacedComponent; definition: ComponentDefinition; width: number; height: number }) {
  const kind = definition.visual?.kind || "generic";
  const label = definition.visual?.label || definition.name;
  const color = definition.color;
  const cx = width * 0.58;
  const cy = height * 0.5;
  const pressed = Boolean(component.attrs?.pressed);
  const angle = Number(component.attrs?.angle || 0);
  const joyX = Number(component.attrs?.joyX || 0);
  const joyY = Number(component.attrs?.joyY || 0);

  if (kind === "button") {
    return (
      <g>
        <rect x={cx - 26} y={cy - 18} width={52} height={36} rx={10} fill="#111827" opacity={0.38} />
        <circle cx={cx} cy={cy + (pressed ? 4 : 0)} r={22} fill={pressed ? "#ef4444" : "#f8fafc"} stroke="white" strokeWidth={3} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fontWeight={900} fill={pressed ? "white" : color} transform={upright(component.rotation, cx, cy + 5)}>BTN</text>
      </g>
    );
  }

  if (kind === "potentiometer") {
    const knobX = cx + Math.cos((angle * Math.PI) / 180) * 15;
    const knobY = cy + Math.sin((angle * Math.PI) / 180) * 15;
    return (
      <g>
        <rect x={cx - 30} y={cy - 22} width={60} height={44} rx={7} fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={22} fill="#334155" stroke="white" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={knobX} y2={knobY} stroke="#facc15" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }

  if (kind === "joystick") {
    return (
      <g>
        <rect x={cx - 34} y={cy - 28} width={68} height={56} rx={8} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={25} fill="#1f2937" opacity={0.55} />
        <circle cx={cx + joyX} cy={cy + joyY} r={18} fill="#111827" stroke="#f8fafc" strokeWidth={3} />
      </g>
    );
  }

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

  if (kind === "display" || kind === "tft") {
    return (
      <g>
        <rect x={width * 0.34} y={cy - 31} width={82} height={62} rx={5} fill="#0f172a" stroke="white" strokeWidth={2} />
        <rect x={width * 0.39} y={cy - 21} width={58} height={40} rx={3} fill="#67e8f9" opacity={0.82} />
        <text x={width * 0.47} y={cy + 5} textAnchor="middle" fill="#0f172a" fontSize={10} fontWeight={900} transform={upright(component.rotation, width * 0.47, cy + 5)}>{label}</text>
      </g>
    );
  }

  if (kind === "speaker") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={28} fill="#111827" opacity={0.55} stroke="white" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={15} fill="rgba(255,255,255,0.38)" />
      </g>
    );
  }

  if (kind === "battery") {
    return (
      <g>
        <rect x={cx - 44} y={cy - 18} width={82} height={36} rx={7} fill="#fbbf24" stroke="white" strokeWidth={2} />
        <rect x={cx + 40} y={cy - 9} width={8} height={18} rx={2} fill="white" />
        <text x={cx - 4} y={cy + 5} textAnchor="middle" fill="#78350f" fontSize={12} fontWeight={900} transform={upright(component.rotation, cx - 4, cy + 5)}>3.7V</text>
      </g>
    );
  }

  if (kind === "charger" || kind === "usb-c" || kind === "pogo") {
    return (
      <g>
        <rect x={cx - 34} y={cy - 24} width={68} height={48} rx={7} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth={2} />
        <rect x={cx - 18} y={cy - 7} width={36} height={14} rx={4} fill="white" opacity={0.86} />
        <text x={cx} y={cy + 24} textAnchor="middle" fill="white" fontSize={10} fontWeight={900} transform={upright(component.rotation, cx, cy + 24)}>{label}</text>
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

  return (
    <g>
      <rect x={cx - 33} y={cy - 24} width={66} height={48} rx={7} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth={2} />
      <circle cx={cx - 20} cy={cy - 12} r={5} fill="white" opacity={0.9} />
      <circle cx={cx + 20} cy={cy + 12} r={5} fill="white" opacity={0.9} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight={800} transform={upright(component.rotation, cx, cy + 5)}>{label}</text>
    </g>
  );
}

function describeComponentPin(definition: ComponentDefinition, pin: ComponentDefinition["pins"][number]) {
  const role = pin.role === "power" ? "电源脚" : pin.role === "ground" ? "地线脚" : "信号脚";
  const caps = pin.required.join(" / ");
  return `${definition.name} - ${pin.label}\n${role}，需要连接：${caps}\n${pin.note || "用于该模块的对应功能接口。"}`;
}

export default function ComponentNode({ component, definition, perfboard, selected, manualWireStart, onSelect, onMove, onPinClick, onPinHover }: ComponentNodeProps) {
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
      <text x={width / 2} y={20} textAnchor="middle" fill="white" fontSize={13} fontWeight={800} transform={upright(component.rotation, width / 2, 20)}>
        {definition.name}
      </text>
      <VisualGlyph component={component} definition={definition} width={width} height={height} />
      <text x={width / 2} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.86)" fontSize={10} transform={upright(component.rotation, width / 2, height - 10)}>
        {definition.footprint.cols}x{definition.footprint.rows} holes · {component.rotation}°
      </text>
      {definition.pins.map((pin, index) => {
        const y = ((index + 1) * height) / (definition.pins.length + 1);
        const endpoint: ConnectionEndpoint = { kind: "component", componentId: component.id, pinId: pin.id };
        const drafting = manualWireStart?.kind === "component" && manualWireStart.componentId === component.id && manualWireStart.pinId === pin.id;
        const hoverText = describeComponentPin(definition, pin);
        return (
          <g
            key={pin.id}
            className="pin-anchor"
            onPointerDown={(event) => {
              event.stopPropagation();
              onPinClick(endpoint);
            }}
            onPointerEnter={(event) => onPinHover(hoverText, event)}
            onPointerMove={(event) => onPinHover(hoverText, event)}
            onPointerLeave={() => onPinHover(undefined)}
          >
            <circle cx={0} cy={y} r={7} fill={drafting ? "#facc15" : "#fff"} stroke="#111827" strokeWidth={1.4} />
            <rect x={8} y={y - 9} width={Math.max(34, pin.label.length * 8 + 10)} height={18} rx={5} fill="rgba(15,23,42,0.68)" />
            <text x={14} y={y + 4} fill="white" fontSize={11} fontWeight={700} transform={upright(component.rotation, 14, y + 4)}>
              {pin.label}
            </text>
            <title>{hoverText}</title>
          </g>
        );
      })}
    </g>
  );
}
