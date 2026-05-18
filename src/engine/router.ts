import type { Connection, ESP32Pin, PerfboardConfig, PlacedComponent, Point, Rotation } from "../models/types";

export const boardMetrics = {
  espX: 80,
  espY: 90,
  espW: 190,
  pinPitch: 26,
  componentW: 120,
  componentH: 70,
  gridX: 340,
  gridY: 80,
  gridCell: 18
};

export function getBoardHeight(pins: ESP32Pin[]): number {
  const maxIndex = Math.max(...pins.map((pin) => pin.index), 14);
  return 64 + maxIndex * boardMetrics.pinPitch + 38;
}

export const defaultBoardPosition: Point = { x: boardMetrics.espX, y: boardMetrics.espY };

export function rotatePoint(point: Point, center: Point, rotation: Rotation): Point {
  const normalized = ((rotation % 360) + 360) % 360;
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  if (normalized === 90) return { x: center.x - dy, y: center.y + dx };
  if (normalized === 180) return { x: center.x - dx, y: center.y - dy };
  if (normalized === 270) return { x: center.x + dy, y: center.y - dx };
  return point;
}

export function snapPointToPerfboard(point: Point, perfboard: PerfboardConfig): Point {
  const col = Math.round((point.x - boardMetrics.gridX) / perfboard.cellSize);
  const row = Math.round((point.y - boardMetrics.gridY) / perfboard.cellSize);
  return {
    x: boardMetrics.gridX + col * perfboard.cellSize,
    y: boardMetrics.gridY + row * perfboard.cellSize
  };
}

export function getEsp32PinPoint(
  pinId: string,
  pins: ESP32Pin[],
  boardPosition: Point = defaultBoardPosition,
  boardRotation: Rotation = 0
): Point {
  const pin = pins.find((item) => item.id === pinId);
  const espH = getBoardHeight(pins);
  const fallback = { x: boardPosition.x + boardMetrics.espW / 2, y: boardPosition.y };
  if (!pin) return fallback;

  const localY = 32 + pin.index * boardMetrics.pinPitch;
  const localX = pin.side === "left" ? 0 : boardMetrics.espW;
  const worldPoint = { x: boardPosition.x + localX, y: boardPosition.y + localY };
  return rotatePoint(worldPoint, { x: boardPosition.x + boardMetrics.espW / 2, y: boardPosition.y + espH / 2 }, boardRotation);
}

export function getComponentSize(footprint: { cols: number; rows: number }) {
  return {
    width: Math.max(boardMetrics.componentW, footprint.cols * boardMetrics.gridCell),
    height: Math.max(boardMetrics.componentH, footprint.rows * boardMetrics.gridCell)
  };
}

export function getComponentPinPoint(
  component: PlacedComponent,
  pinIndex: number,
  totalPins: number,
  footprint?: { cols: number; rows: number }
): Point {
  const size = footprint ? getComponentSize(footprint) : { width: boardMetrics.componentW, height: boardMetrics.componentH };
  const local = {
    x: component.x,
    y: component.y + ((pinIndex + 1) * size.height) / (totalPins + 1)
  };
  return rotatePoint(local, { x: component.x + size.width / 2, y: component.y + size.height / 2 }, component.rotation);
}

export function routeConnection(from: Point, to: Point): Point[] {
  const midX = Math.round((from.x + to.x) / 2);
  return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to];
}

export function connectionPath(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

export function getConnectionAnchor(
  connection: Connection,
  component: PlacedComponent,
  pinIndex: number,
  pinCount: number,
  boardPins: ESP32Pin[],
  boardPosition: Point = defaultBoardPosition,
  boardRotation: Rotation = 0,
  footprint?: { cols: number; rows: number }
) {
  return {
    from: getEsp32PinPoint(connection.esp32PinId, boardPins, boardPosition, boardRotation),
    to: getComponentPinPoint(component, pinIndex, pinCount, footprint)
  };
}

export function clampToPerfboard(col: number, row: number, footprint: { cols: number; rows: number }, perfboard: PerfboardConfig) {
  return {
    col: Math.max(0, Math.min(col, Math.max(0, perfboard.cols - footprint.cols))),
    row: Math.max(0, Math.min(row, Math.max(0, perfboard.rows - footprint.rows)))
  };
}
