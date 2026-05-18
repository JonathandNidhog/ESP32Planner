import { boardMetrics, getBoardHeight, snapPointToPerfboard } from "../../engine/router";
import type { ConnectionEndpoint, ESP32BoardDefinition, PerfboardConfig, Point, Rotation } from "../../models/types";

interface ESP32BoardProps {
  board: ESP32BoardDefinition;
  usedPinIds: Set<string>;
  position: Point;
  rotation: Rotation;
  selected: boolean;
  viewWidth: number;
  viewHeight: number;
  perfboard: PerfboardConfig;
  manualWireStart?: ConnectionEndpoint;
  onSelect: () => void;
  onMove: (position: Point) => void;
  onPinClick: (endpoint: ConnectionEndpoint) => void;
}

export default function ESP32Board({
  board,
  usedPinIds,
  position,
  rotation,
  selected,
  viewWidth,
  viewHeight,
  perfboard,
  manualWireStart,
  onSelect,
  onMove,
  onPinClick
}: ESP32BoardProps) {
  const { espW, pinPitch } = boardMetrics;
  const espH = getBoardHeight(board.pins);
  const center = { x: espW / 2, y: espH / 2 };

  function onPointerDown(event: React.PointerEvent<SVGGElement>) {
    event.stopPropagation();
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    onSelect();
    event.currentTarget.setPointerCapture(event.pointerId);

    const start = svg.createSVGPoint();
    start.x = event.clientX;
    start.y = event.clientY;
    const transformedStart = start.matrixTransform(svg.getScreenCTM()?.inverse());
    const offsetX = transformedStart.x - position.x;
    const offsetY = transformedStart.y - position.y;

    const move = (moveEvent: PointerEvent) => {
      const point = svg.createSVGPoint();
      point.x = moveEvent.clientX;
      point.y = moveEvent.clientY;
      const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
      const snapped = snapPointToPerfboard({ x: transformed.x - offsetX, y: transformed.y - offsetY }, perfboard);
      const nextX = Math.max(20, Math.min(snapped.x, viewWidth - espW - 20));
      const nextY = Math.max(20, Math.min(snapped.y, viewHeight - espH - 20));
      onMove({ x: Math.round(nextX), y: Math.round(nextY) });
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
      className={`esp32-board ${selected ? "selected" : ""}`}
      transform={`translate(${position.x}, ${position.y}) rotate(${rotation}, ${center.x}, ${center.y})`}
      onPointerDown={onPointerDown}
    >
      <rect width={espW} height={espH} rx={18} fill="#0f172a" stroke={selected ? "#facc15" : "#1e293b"} strokeWidth={selected ? 4 : 3} />
      <rect x={48} y={28} width={espW - 96} height={78} rx={10} fill="#334155" stroke="#64748b" />
      <rect x={72} y={48} width={espW - 144} height={36} rx={6} fill="#94a3b8" />
      <text x={espW / 2} y={128} textAnchor="middle" fill="#e2e8f0" fontSize={17} fontWeight={700}>
        {board.shortName}
      </text>
      <text x={espW / 2} y={152} textAnchor="middle" fill="#94a3b8" fontSize={11}>
        {board.pins.length}-pin planning model · {rotation}°
      </text>
      <text x={espW / 2} y={espH - 16} textAnchor="middle" fill="#facc15" fontSize={11} fontWeight={800}>
        拖动吸附孔位 · 点击引脚手动连线
      </text>

      {board.pins.map((pin) => {
        const y = 32 + pin.index * pinPitch;
        const pinX = pin.side === "left" ? 0 : espW;
        const labelX = pin.side === "left" ? 22 : espW - 22;
        const anchor = pin.side === "left" ? "start" : "end";
        const used = usedPinIds.has(pin.id);
        const isPower = pin.capabilities.some((cap) => cap.startsWith("power"));
        const isGround = pin.capabilities.includes("ground");
        const fill = used ? "#facc15" : isPower ? "#ef4444" : isGround ? "#475569" : "#38bdf8";
        const endpoint: ConnectionEndpoint = { kind: "esp32", pinId: pin.id };
        const drafting = manualWireStart?.kind === "esp32" && manualWireStart.pinId === pin.id;

        return (
          <g
            key={pin.id}
            className="pin-anchor"
            onPointerDown={(event) => {
              event.stopPropagation();
              onPinClick(endpoint);
            }}
          >
            <circle cx={pinX} cy={y} r={drafting ? 10 : 8} fill={drafting ? "#facc15" : fill} stroke="#f8fafc" strokeWidth={1.5}>
              <title>{pin.warnings?.join("；") || pin.capabilities.join(" / ")}</title>
            </circle>
            <text x={labelX} y={y + 4} textAnchor={anchor} fill="#e2e8f0" fontSize={11}>
              {pin.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
