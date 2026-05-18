import { componentLibrary } from "../data/componentLibrary";
import type { AssignmentResult, ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";
import { describePinWarning, getPinScore, isOutputUnsafe, pinSupports } from "./compatibility";

const roleColor = {
  power: "#ef4444",
  ground: "#111827",
  signal: "#2563eb"
} as const;

const reusablePinPrefixes = ["gnd", "3v3", "vin", "5v"];

function isReusablePin(pinId: string) {
  return reusablePinPrefixes.some((prefix) => pinId.startsWith(prefix));
}

export function autoAssignPins(
  components: PlacedComponent[],
  boardPins: ESP32Pin[],
  customComponents: ComponentDefinition[] = [],
  existingConnections: Connection[] = []
): AssignmentResult {
  const library = [...componentLibrary, ...customComponents];
  const nextConnections: Connection[] = [];
  const messages: string[] = [];
  const occupiedSignalPins = new Set(
    existingConnections
      .filter((connection) => !isReusablePin(connection.esp32PinId))
      .map((connection) => connection.esp32PinId)
  );

  for (const component of components) {
    const definition = library.find((item) => item.type === component.type);
    if (!definition) {
      messages.push(`未找到组件定义：${component.type}`);
      continue;
    }

    for (const componentPin of definition.pins) {
      const old = existingConnections.find(
        (connection) => connection.componentId === component.id && connection.componentPinId === componentPin.id
      );
      if (old) {
        nextConnections.push(old);
        continue;
      }

      const candidates = boardPins
        .filter((pin) => pinSupports(pin, componentPin.required))
        .filter((pin) => componentPin.role === "power" || componentPin.role === "ground" || !occupiedSignalPins.has(pin.id))
        .filter((pin) => !isOutputUnsafe(pin, componentPin.required))
        .sort((a, b) => getPinScore(b, componentPin.required) - getPinScore(a, componentPin.required));

      const selected = candidates[0];
      if (!selected) {
        messages.push(`${definition.name}.${componentPin.label} 没有可用引脚，需求：${componentPin.required.join("/")}`);
        continue;
      }

      if (componentPin.role === "signal" && !isReusablePin(selected.id)) {
        occupiedSignalPins.add(selected.id);
      }

      const warning = describePinWarning(selected);
      if (warning) {
        messages.push(`${definition.name}.${componentPin.label} 使用 ${warning}`);
      }

      nextConnections.push({
        id: `${component.id}-${componentPin.id}-${selected.id}`,
        componentId: component.id,
        componentPinId: componentPin.id,
        esp32PinId: selected.id,
        color: roleColor[componentPin.role],
        warning
      });
    }
  }

  if (messages.length === 0) {
    messages.push("自动连接完成：未发现冲突。特殊启动脚和 UART0 已降低优先级。制作用真实硬件前仍建议复核电压和限流。");
  }

  return { connections: nextConnections, messages };
}
