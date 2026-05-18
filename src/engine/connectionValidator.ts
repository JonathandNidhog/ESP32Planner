import type { ComponentDefinition, ConnectionEndpoint, ESP32Pin, PinCapability, PinRole, PlacedComponent } from "../models/types";

interface ResolvedEndpoint {
  endpoint: ConnectionEndpoint;
  label: string;
  role: PinRole;
  capabilities: PinCapability[];
  pinId: string;
}

const signalCapabilities: PinCapability[] = ["digital", "analog", "i2c-sda", "i2c-scl", "pwm", "uart"];
const powerCapabilities: PinCapability[] = ["power-3v3", "power-5v"];

export const connectionColor = {
  power: "#ef4444",
  ground: "#111827",
  signal: "#2563eb",
  error: "#dc2626"
} as const;

function endpointKey(endpoint: ConnectionEndpoint) {
  return `${endpoint.kind}:${endpoint.componentId || "board"}:${endpoint.pinId}`;
}

function inferBoardPinRole(pin: ESP32Pin): PinRole {
  if (pin.capabilities.includes("ground")) return "ground";
  if (pin.capabilities.some((capability) => powerCapabilities.includes(capability))) return "power";
  return "signal";
}

export function resolveEndpoint(
  endpoint: ConnectionEndpoint,
  boardPins: ESP32Pin[],
  components: PlacedComponent[],
  library: ComponentDefinition[]
): ResolvedEndpoint | undefined {
  if (endpoint.kind === "esp32") {
    const pin = boardPins.find((item) => item.id === endpoint.pinId);
    if (!pin) return undefined;
    return {
      endpoint,
      label: pin.label,
      role: inferBoardPinRole(pin),
      capabilities: pin.capabilities,
      pinId: pin.id
    };
  }

  const component = components.find((item) => item.id === endpoint.componentId);
  const definition = library.find((item) => item.type === component?.type);
  const pin = definition?.pins.find((item) => item.id === endpoint.pinId);
  if (!component || !definition || !pin) return undefined;

  return {
    endpoint,
    label: `${definition.name}.${pin.label}`,
    role: pin.role,
    capabilities: pin.required,
    pinId: pin.id
  };
}

function hasAny(a: PinCapability[], b: PinCapability[]) {
  return a.some((item) => b.includes(item));
}

function intersect(a: PinCapability[], b: PinCapability[]) {
  return a.filter((item) => b.includes(item));
}

function isPowerCompatible(a: ResolvedEndpoint, b: ResolvedEndpoint) {
  const aPower = intersect(a.capabilities, powerCapabilities);
  const bPower = intersect(b.capabilities, powerCapabilities);
  if (aPower.length === 0 || bPower.length === 0) return false;
  return aPower.some((capability) => bPower.includes(capability));
}

function isSignalCompatible(a: ResolvedEndpoint, b: ResolvedEndpoint) {
  const aSignal = intersect(a.capabilities, signalCapabilities);
  const bSignal = intersect(b.capabilities, signalCapabilities);
  if (aSignal.length === 0 || bSignal.length === 0) return false;
  if (hasAny(aSignal, bSignal)) return true;
  return aSignal.includes("digital") || bSignal.includes("digital");
}

export function validateConnection(
  from: ConnectionEndpoint,
  to: ConnectionEndpoint,
  boardPins: ESP32Pin[],
  components: PlacedComponent[],
  library: ComponentDefinition[]
): { ok: boolean; severity: "ok" | "warning" | "error"; color: string; message: string } {
  if (endpointKey(from) === endpointKey(to)) {
    return { ok: false, severity: "error", color: connectionColor.error, message: "不能把一个引脚连接到它自己。" };
  }

  const a = resolveEndpoint(from, boardPins, components, library);
  const b = resolveEndpoint(to, boardPins, components, library);
  if (!a || !b) {
    return { ok: false, severity: "error", color: connectionColor.error, message: "找不到连接端点，可能是组件或引脚已删除。" };
  }

  if (a.role === "ground" || b.role === "ground") {
    if (a.role === "ground" && b.role === "ground") {
      return { ok: true, severity: "ok", color: connectionColor.ground, message: `${a.label} 已连接到 ${b.label}` };
    }
    return { ok: false, severity: "error", color: connectionColor.error, message: `GND 只能连接 GND：${a.label} ↔ ${b.label} 不兼容。` };
  }

  if (a.role === "power" || b.role === "power") {
    if (a.role === "power" && b.role === "power" && isPowerCompatible(a, b)) {
      return { ok: true, severity: "ok", color: connectionColor.power, message: `${a.label} 已连接到 ${b.label}` };
    }
    return { ok: false, severity: "error", color: connectionColor.error, message: `电源脚只能接匹配电源：${a.label} ↔ ${b.label} 不兼容。` };
  }

  if (isSignalCompatible(a, b)) {
    return { ok: true, severity: "ok", color: connectionColor.signal, message: `${a.label} 已连接到 ${b.label}` };
  }

  return { ok: false, severity: "error", color: connectionColor.error, message: `信号类型不兼容：${a.label} ↔ ${b.label}。` };
}

export function describeEndpoint(
  endpoint: ConnectionEndpoint,
  boardPins: ESP32Pin[],
  components: PlacedComponent[],
  library: ComponentDefinition[]
) {
  return resolveEndpoint(endpoint, boardPins, components, library)?.label || `${endpoint.kind}:${endpoint.pinId}`;
}
