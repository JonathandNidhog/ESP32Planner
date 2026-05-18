import { componentLibrary } from "../data/componentLibrary";
import type { AssignmentResult, ComponentDefinition, Connection, ConnectionEndpoint, ESP32Pin, PlacedComponent } from "../models/types";
import { describePinWarning, getPinScore, isOutputUnsafe, pinSupports } from "./compatibility";
import { validateConnection } from "./connectionValidator";

const reusablePinPrefixes = ["gnd", "3v3", "vin", "5v"];

function isReusablePin(pinId: string) {
  return reusablePinPrefixes.some((prefix) => pinId.startsWith(prefix));
}

function isEsp32EndpointUsed(connections: Connection[], pinId: string) {
  return connections.some(
    (connection) =>
      !isReusablePin(pinId) &&
      ((connection.from.kind === "esp32" && connection.from.pinId === pinId) || (connection.to.kind === "esp32" && connection.to.pinId === pinId))
  );
}

export function autoAssignPins(
  components: PlacedComponent[],
  boardPins: ESP32Pin[],
  customComponents: ComponentDefinition[] = [],
  existingConnections: Connection[] = []
): AssignmentResult {
  const library = [...componentLibrary, ...customComponents];
  const nextConnections: Connection[] = [...existingConnections];
  const messages: string[] = [];

  for (const component of components) {
    const definition = library.find((item) => item.type === component.type);
    if (!definition) {
      messages.push(`未找到组件定义：${component.type}`);
      continue;
    }

    for (const componentPin of definition.pins) {
      const componentEndpoint: ConnectionEndpoint = { kind: "component", componentId: component.id, pinId: componentPin.id };
      const alreadyConnected = nextConnections.some(
        (connection) =>
          (connection.from.kind === "component" && connection.from.componentId === component.id && connection.from.pinId === componentPin.id) ||
          (connection.to.kind === "component" && connection.to.componentId === component.id && connection.to.pinId === componentPin.id)
      );
      if (alreadyConnected) continue;

      const candidates = boardPins
        .filter((pin) => pinSupports(pin, componentPin.required, componentPin.role))
        .filter((pin) => componentPin.role === "power" || componentPin.role === "ground" || !isEsp32EndpointUsed(nextConnections, pin.id))
        .filter((pin) => !isOutputUnsafe(pin, componentPin.required))
        .sort((a, b) => getPinScore(b, componentPin.required) - getPinScore(a, componentPin.required));

      const selected = candidates.find((pin) =>
        validateConnection({ kind: "esp32", pinId: pin.id }, componentEndpoint, boardPins, components, library).ok
      );

      if (!selected) {
        messages.push(`${definition.name}.${componentPin.label} 没有可用引脚，需求：${componentPin.required.join("/")}`);
        continue;
      }

      const validation = validateConnection({ kind: "esp32", pinId: selected.id }, componentEndpoint, boardPins, components, library);
      const warning = describePinWarning(selected);
      if (warning) {
        messages.push(`${definition.name}.${componentPin.label} 使用 ${warning}`);
      }

      nextConnections.push({
        id: `auto-${component.id}-${componentPin.id}-${selected.id}`,
        from: { kind: "esp32", pinId: selected.id },
        to: componentEndpoint,
        color: validation.color,
        status: validation.severity,
        message: warning || validation.message,
        warning
      });
    }
  }

  if (messages.length === 0) {
    messages.push("自动连接完成：未发现冲突。GND/电源/信号已按严格规则匹配，制作用真实硬件前仍建议复核电压和限流。");
  }

  return { connections: nextConnections, messages };
}
