import { getConnectionAnchor, routeConnection, connectionPath } from "../../engine/router";
import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent, Point, Rotation } from "../../models/types";

interface WireLayerProps {
  components: PlacedComponent[];
  connections: Connection[];
  library: ComponentDefinition[];
  boardPins: ESP32Pin[];
  boardPosition: Point;
  boardRotation: Rotation;
}

export default function WireLayer({ components, connections, library, boardPins, boardPosition, boardRotation }: WireLayerProps) {
  return (
    <g className="wire-layer">
      {connections.map((connection) => {
        const component = components.find((item) => item.id === connection.componentId);
        const definition = library.find((item) => item.type === component?.type);
        if (!component || !definition) return null;
        const pinIndex = definition.pins.findIndex((pin) => pin.id === connection.componentPinId);
        const anchors = getConnectionAnchor(
          connection,
          component,
          Math.max(0, pinIndex),
          definition.pins.length,
          boardPins,
          boardPosition,
          boardRotation,
          definition.footprint
        );
        const points = routeConnection(anchors.from, anchors.to);
        return (
          <path
            key={connection.id}
            d={connectionPath(points)}
            fill="none"
            stroke={connection.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.82}
          >
            <title>{connection.warning || connection.id}</title>
          </path>
        );
      })}
    </g>
  );
}
