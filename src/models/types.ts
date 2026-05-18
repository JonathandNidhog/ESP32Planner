export type PinCapability =
  | "power-3v3"
  | "power-5v"
  | "ground"
  | "digital"
  | "analog"
  | "i2c-sda"
  | "i2c-scl"
  | "pwm"
  | "uart";

export type PinRole = "power" | "ground" | "signal";
export type ComponentCategory = "基础" | "传感器" | "显示" | "执行器" | "模块" | "输入" | "自定义";
export type Rotation = 0 | 90 | 180 | 270;
export type VisualKind = "led" | "resistor" | "button" | "sensor" | "display" | "actuator" | "module" | "key-switch" | "generic";

export interface Point {
  x: number;
  y: number;
}

export interface ESP32Pin {
  id: string;
  label: string;
  gpio?: number;
  side: "left" | "right";
  index: number;
  capabilities: PinCapability[];
  warnings?: string[];
}

export interface ESP32BoardDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  pins: ESP32Pin[];
}

export interface ComponentPinDefinition {
  id: string;
  label: string;
  required: PinCapability[];
  role: PinRole;
  note?: string;
}

export interface ComponentVisual {
  kind: VisualKind;
  label?: string;
  image?: string;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  description: string;
  pins: ComponentPinDefinition[];
  footprint: { cols: number; rows: number };
  color: string;
  visual?: ComponentVisual;
  source?: string;
}

export interface PlacedComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  boardCol: number;
  boardRow: number;
  rotation: Rotation;
  attrs?: Record<string, string | number | boolean>;
}

export interface Connection {
  id: string;
  componentId: string;
  componentPinId: string;
  esp32PinId: string;
  color: string;
  warning?: string;
}

export interface PerfboardConfig {
  cols: number;
  rows: number;
  cellSize: number;
}

export interface ProjectState {
  name: string;
  boardId: string;
  boardPosition: Point;
  boardRotation: Rotation;
  perfboard: PerfboardConfig;
  components: PlacedComponent[];
  customComponents: ComponentDefinition[];
  connections: Connection[];
  selectedComponentId?: string;
  messages: string[];
  codeTest?: string;
}

export interface AssignmentResult {
  connections: Connection[];
  messages: string[];
}

export interface CodeIssue {
  severity: "ok" | "warning" | "error";
  message: string;
}
