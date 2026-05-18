import { connectionPath, getConnectionAnchor, routeConnection } from "../../engine/router";
import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent, Point, Rotation } from "../../models/types";

interface WireLayerProps {
  components: PlacedComponent[];
  connections: Connection[];
  library: ComponentDefinition[];
  boardPins: ESP32Pin[];
  boardPosition: Point;
  boardRotation: Rotation;
  selectedConnectionId?: string;
  onSelectConnection: (id: string) => void;
  onAddWaypoint: (id: string, point: Point) => void;
  onMoveWaypoint: (id: string, index: number, point: Point) => void;
}

interface Segment {
  a: Point;
  b: Point;
}

function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(svg.getScreenCTM()?.inverse());
}

function isHorizontal(segment: Segment) {
  return Math.abs(segment.a.y - segment.b.y) < 0.01;
}

function isVertical(segment: Segment) {
  return Math.abs(segment.a.x - segment.b.x) < 0.01;
}

function between(value: number, a: number, b: number) {
  return value > Math.min(a, b) + 8 && value < Math.max(a, b) - 8;
}

function segmentIntersections(segment: Segment, previous: Segment[]): Point[] {
  const intersections: Point[] = [];
  for (const other of previous) {
    if (isHorizontal(segment) && isVertical(other)) {
      const x = other.a.x;
      const y = segment.a.y;
      if (between(x, segment.a.x, segment.b.x) && between(y, other.a.y, other.b.y)) intersections.push({ x, y });
    } else if (isVertical(segment) && isHorizontal(other)) {
      const x = segment.a.x;
      const y = other.a.y;
      if (between(y, segment.a.y, segment.b.y) && between(x, other.a.x, other.b.x)) intersections.push({ x, y });
    }
  }
  return intersections.sort((p1, p2) => Math.hypot(p1.x - segment.a.x, p1.y - segment.a.y) - Math.hypot(p2.x - segment.a.x, p2.y - segment.a.y));
}

function bridgePath(points: Point[], previousSegments: Segment[]) {
  if (points.length === 0) return "";
  const bridgeRadius = 7;
  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const segment = { a: points[i], b: points[i + 1] };
    const intersections = segmentIntersections(segment, previousSegments);
    const dx = Math.sign(segment.b.x - segment.a.x);
    const dy = Math.sign(segment.b.y - segment.a.y);

    for (const point of intersections) {
      if (isHorizontal(segment) && dx !== 0) {
        path += ` L${point.x - dx * bridgeRadius},${point.y}`;
        path += ` Q${point.x},${point.y - bridgeRadius * 1.6} ${point.x + dx * bridgeRadius},${point.y}`;
      } else if (isVertical(segment) && dy !== 0) {
        path += ` L${point.x},${point.y - dy * bridgeRadius}`;
        path += ` Q${point.x + bridgeRadius * 1.6},${point.y} ${point.x},${point.y + dy * bridgeRadius}`;
      }
    }
    path += ` L${segment.b.x},${segment.b.y}`;
  }

  return path;
}

function collectSegments(points: Point[]) {
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    segments.push({ a: points[i], b: points[i + 1] });
  }
  return segments;
}

function buildRoute(connection: Connection, from: Point, to: Point, index: number) {
  if (connection.waypoints?.length) return [from, ...connection.waypoints, to];
  return routeConnection(from, to, index);
}

export default function WireLayer({
  components,
  connections,
  library,
  boardPins,
  boardPosition,
  boardRotation,
  selectedConnectionId,
  onSelectConnection,
  onAddWaypoint,
  onMoveWaypoint
}: WireLayerProps) {
  const previousSegments: Segment[] = [];

  return (
    <g className="wire-layer">
      {connections.map((connection, index) => {
        const anchors = getConnectionAnchor(connection, boardPins, boardPosition, boardRotation, components, library);
        const points = buildRoute(connection, anchors.from, anchors.to, index);
        const selected = selectedConnectionId === connection.id;
        const path = bridgePath(points, previousSegments) || connectionPath(points);
        previousSegments.push(...collectSegments(points));
        return (
          <g key={connection.id}>
            <path
              d={path}
              fill="none"
              stroke={connection.status === "error" ? "#dc2626" : connection.color}
              strokeWidth={selected ? 5 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={connection.status === "error" ? 0.95 : 0.82}
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelectConnection(connection.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                const svg = event.currentTarget.ownerSVGElement;
                if (!svg) return;
                onAddWaypoint(connection.id, svgPoint(svg, event.clientX, event.clientY));
              }}
            >
              <title>{connection.message || connection.warning || connection.id}</title>
            </path>
            {selected && connection.waypoints?.map((point, waypointIndex) => (
              <circle
                key={`${connection.id}-waypoint-${waypointIndex}`}
                className="wire-waypoint"
                cx={point.x}
                cy={point.y}
                r={7}
                fill="#facc15"
                stroke="#92400e"
                strokeWidth={2}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  const svg = event.currentTarget.ownerSVGElement;
                  if (!svg) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const move = (moveEvent: PointerEvent) => onMoveWaypoint(connection.id, waypointIndex, svgPoint(svg, moveEvent.clientX, moveEvent.clientY));
                  const up = () => {
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                  };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
              >
                <title>拖动固定点整理线的位置</title>
              </circle>
            ))}
          </g>
        );
      })}
    </g>
  );
}
