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
}

export default function WireLayer({
  components,
  connections,
  library,
  boardPins,
  boardPosition,
  boardRotation,
  selectedConnectionId,
  onSelectConnection
}: WireLayerProps) {
  return (
    <g className="wire-layer">
      {connections.map((connection, index) => {
        const anchors = getConnectionAnchor(connection, boardPins, boardPosition, boardRotation, components, library);
        const points = routeConnection(anchors.from, anchors.to, index);
        const selected = selectedConnectionId === connection.id;
        return (
          <path
            key={connection.id}
            d={connectionPath(points)}
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
          >
            <title>{connection.message || connection.warning || connection.id}</title>
          </path>
        );
      })}
    </g>
  );
}
