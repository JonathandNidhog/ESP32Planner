import type { ComponentDefinition, Connection, ESP32BoardDefinition, PerfboardConfig, PlacedComponent, Point } from "../../models/types";
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
  selectedComponentId?: string;
  selectedBoard: boolean;
  onSelectComponent: (id?: string) => void;
  onSelectBoard: () => void;
  onMoveComponent: (id: string, x: number, y: number, col: number, row: number) => void;
  onMoveBoard: (position: Point) => void;
}

export default function CircuitCanvas({
  board,
  perfboard,
  library,
  components,
  connections,
  boardPosition,
  selectedComponentId,
  selectedBoard,
  onSelectComponent,
  onSelectBoard,
  onMoveComponent,
  onMoveBoard
}: CircuitCanvasProps) {
  const usedPinIds = new Set(connections.map((connection) => connection.esp32PinId));
  const viewWidth = Math.max(1120, 380 + perfboard.cols * perfboard.cellSize + 90);
  const viewHeight = Math.max(640, 110 + perfboard.rows * perfboard.cellSize + 70);

  return (
    <div className="canvas-shell">
      <svg className="circuit-canvas" viewBox={`0 0 ${viewWidth} ${viewHeight}`} onPointerDown={() => onSelectComponent(undefined)}>
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>
        <rect width={viewWidth} height={viewHeight} fill="#e5edf7" />
        <PerfboardGrid perfboard={perfboard} />
        <WireLayer components={components} connections={connections} library={library} boardPins={board.pins} boardPosition={boardPosition} />
        <ESP32Board
          board={board}
          usedPinIds={usedPinIds}
          position={boardPosition}
          selected={selectedBoard}
          viewWidth={viewWidth}
          viewHeight={viewHeight}
          onSelect={onSelectBoard}
          onMove={onMoveBoard}
        />
        {components.map((component) => (
          <ComponentNode
            key={component.id}
            component={component}
            definition={library.find((item) => item.type === component.type)}
            perfboard={perfboard}
            selected={selectedComponentId === component.id}
            onSelect={onSelectComponent}
            onMove={onMoveComponent}
          />
        ))}
      </svg>
    </div>
  );
}
