import { useState } from "react";
import type { ComponentDefinition, Connection, ConnectionEndpoint, ESP32BoardDefinition, PerfboardConfig, PlacedComponent, Point, Rotation } from "../../models/types";
import ComponentNode from "./ComponentNode";
import ESP32Board from "./ESP32Board";
import PerfboardGrid from "./PerfboardGrid";
import WireLayer from "./WireLayer";

interface CircuitCanvasProps {
  board: ESP32BoardDefinition;
  perfboard: PerfboardConfig;
  library: ComponentDefinition[];
  components: PlacedComponent[];
  connections: Connection[];
  boardPosition: Point;
  boardRotation: Rotation;
  selectedComponentId?: string;
  selectedBoard: boolean;
  selectedConnectionId?: string;
  manualWireStart?: ConnectionEndpoint;
  onSelectComponent: (id?: string) => void;
  onSelectBoard: () => void;
  onSelectConnection: (id?: string) => void;
  onMoveComponent: (id: string, x: number, y: number, col: number, row: number) => void;
  onMoveBoard: (position: Point) => void;
  onPinClick: (endpoint: ConnectionEndpoint) => void;
}

const minZoom = 0.45;
const maxZoom = 2.4;

export default function CircuitCanvas({
  board,
  perfboard,
  library,
  components,
  connections,
  boardPosition,
  boardRotation,
  selectedComponentId,
  selectedBoard,
  selectedConnectionId,
  manualWireStart,
  onSelectComponent,
  onSelectBoard,
  onSelectConnection,
  onMoveComponent,
  onMoveBoard,
  onPinClick
}: CircuitCanvasProps) {
  const usedPinIds = new Set(
    connections.flatMap((connection) => [connection.from, connection.to]).filter((endpoint) => endpoint.kind === "esp32").map((endpoint) => endpoint.pinId)
  );
  const worldWidth = Math.max(1120, 380 + perfboard.cols * perfboard.cellSize + 260);
  const worldHeight = Math.max(720, 110 + perfboard.rows * perfboard.cellSize + 240);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [pinTooltip, setPinTooltip] = useState<{ text: string; x: number; y: number } | undefined>();
  const viewWidth = worldWidth / viewport.zoom;
  const viewHeight = worldHeight / viewport.zoom;

  function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svg.getScreenCTM()?.inverse());
  }

  function updatePinTooltip(text?: string, event?: React.PointerEvent<SVGGElement>) {
    if (!text || !event) {
      setPinTooltip(undefined);
      return;
    }
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setPinTooltip({ text, x: event.clientX - rect.left + 16, y: event.clientY - rect.top + 16 });
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const svg = event.currentTarget;
    const before = svgPoint(svg, event.clientX, event.clientY);
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.88;
    const nextZoom = Math.max(minZoom, Math.min(maxZoom, viewport.zoom * zoomFactor));
    const nextViewWidth = worldWidth / nextZoom;
    const nextViewHeight = worldHeight / nextZoom;
    const ratioX = (before.x - viewport.x) / viewWidth;
    const ratioY = (before.y - viewport.y) / viewHeight;
    setViewport({
      zoom: nextZoom,
      x: Math.max(0, Math.min(before.x - ratioX * nextViewWidth, Math.max(0, worldWidth - nextViewWidth))),
      y: Math.max(0, Math.min(before.y - ratioY * nextViewHeight, Math.max(0, worldHeight - nextViewHeight)))
    });
  }

  function handleCanvasPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.target !== event.currentTarget && !(event.target as Element).classList.contains("canvas-background")) return;
    onSelectComponent(undefined);
    onSelectConnection(undefined);
    const svg = event.currentTarget;
    const start = svgPoint(svg, event.clientX, event.clientY);
    const startViewport = { ...viewport };

    const move = (moveEvent: PointerEvent) => {
      const current = svgPoint(svg, moveEvent.clientX, moveEvent.clientY);
      const nextX = Math.max(0, Math.min(startViewport.x - (current.x - start.x), Math.max(0, worldWidth - viewWidth)));
      const nextY = Math.max(0, Math.min(startViewport.y - (current.y - start.y), Math.max(0, worldHeight - viewHeight)));
      setViewport((old) => ({ ...old, x: nextX, y: nextY }));
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function resetViewport() {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }

  return (
    <div className="canvas-shell">
      <div className="viewport-toolbar">
        <span>缩放 {Math.round(viewport.zoom * 100)}%</span>
        <button onClick={() => setViewport((current) => ({ ...current, zoom: Math.min(maxZoom, current.zoom * 1.15) }))}>放大</button>
        <button onClick={() => setViewport((current) => ({ ...current, zoom: Math.max(minZoom, current.zoom * 0.85) }))}>缩小</button>
        <button onClick={resetViewport}>重置视口</button>
        {manualWireStart && <span className="wire-draft-label">选择终点</span>}
      </div>
      {pinTooltip && (
        <div className="pin-tooltip" style={{ left: pinTooltip.x, top: pinTooltip.y }}>
          {pinTooltip.text.split("\n").map((line) => <div key={line}>{line}</div>)}
        </div>
      )}
      <svg
        className="circuit-canvas"
        viewBox={`${viewport.x} ${viewport.y} ${viewWidth} ${viewHeight}`}
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
      >
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>
        <rect className="canvas-background" width={worldWidth} height={worldHeight} fill="#e5edf7" />
        <PerfboardGrid perfboard={perfboard} />
        <WireLayer
          components={components}
          connections={connections}
          library={library}
          boardPins={board.pins}
          boardPosition={boardPosition}
          boardRotation={boardRotation}
          selectedConnectionId={selectedConnectionId}
          onSelectConnection={(id) => {
            onSelectComponent(undefined);
            onSelectConnection(id);
          }}
        />
        <ESP32Board
          board={board}
          usedPinIds={usedPinIds}
          position={boardPosition}
          rotation={boardRotation}
          selected={selectedBoard}
          viewWidth={worldWidth}
          viewHeight={worldHeight}
          perfboard={perfboard}
          manualWireStart={manualWireStart}
          onSelect={onSelectBoard}
          onMove={onMoveBoard}
          onPinClick={onPinClick}
          onPinHover={updatePinTooltip}
        />
        {components.map((component) => (
          <ComponentNode
            key={component.id}
            component={component}
            definition={library.find((item) => item.type === component.type)}
            perfboard={perfboard}
            selected={selectedComponentId === component.id}
            manualWireStart={manualWireStart}
            onSelect={onSelectComponent}
            onMove={onMoveComponent}
            onPinClick={onPinClick}
            onPinHover={updatePinTooltip}
          />
        ))}
      </svg>
    </div>
  );
}
