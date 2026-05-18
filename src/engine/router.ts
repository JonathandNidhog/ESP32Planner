import type { Connection, ESP32Pin, PerfboardConfig, PlacedComponent, Point } from "../models/types";

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

export function getEsp32PinPoint(pinId: string, pins: ESP32Pin[], boardPosition: Point = defaultBoardPosition): Point {
  const pin = pins.find((item) => item.id === pinId);
  if (!pin) return { x: boardPosition.x + boardMetrics.espW / 2, y: boardPosition.y };
  const y = boardPosition.y + 32 + pin.index * boardMetrics.pinPitch;
  const x = pin.side === "left" ? boardPosition.x : boardPosition.x + boardMetrics.espW;
  return { x, y };
}

export function getComponentPinPoint(component: PlacedComponent, pinIndex: number, totalPins: number): Point {
  const y = component.y + ((pinIndex + 1) * boardMetrics.componentH) / (totalPins + 1);
  return { x: component.x, y };
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
  boardPosition: Point = defaultBoardPosition
) {
  return {
    from: getEsp32PinPoint(connection.esp32PinId, boardPins, boardPosition),
    to: getComponentPinPoint(component, pinIndex, pinCount)
  };
}

export function clampToPerfboard(col: number, row: number, footprint: { cols: number; rows: number }, perfboard: PerfboardConfig) {
  return {
    col: Math.max(0, Math.min(col, Math.max(0, perfboard.cols - footprint.cols))),
    row: Math.max(0, Math.min(row, Math.max(0, perfboard.rows - footprint.rows)))
  };
}
