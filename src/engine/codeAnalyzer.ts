import type { CodeIssue, ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";
import { describeEndpoint } from "./connectionValidator";

function resolveToken(token: string, constants: Map<string, number>): number | undefined {
  const trimmed = token.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return constants.get(trimmed);
}

export function analyzeArduinoCode(
  code: string,
  boardPins: ESP32Pin[],
  connections: Connection[],
  components: PlacedComponent[],
  library: ComponentDefinition[]
): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const constants = new Map<string, number>();
  const connectedGpios = new Map<number, string[]>();

  for (const connection of connections) {
    const endpoints = [connection.from, connection.to];
    const boardEndpoint = endpoints.find((endpoint) => endpoint.kind === "esp32");
    const otherEndpoint = endpoints.find((endpoint) => endpoint !== boardEndpoint);
    const pin = boardPins.find((item) => item.id === boardEndpoint?.pinId);
    if (pin?.gpio === undefined || !otherEndpoint) continue;
    const label = describeEndpoint(otherEndpoint, boardPins, components, library);
    connectedGpios.set(pin.gpio, [...(connectedGpios.get(pin.gpio) || []), label]);
  }

  for (const match of code.matchAll(/#define\s+([A-Za-z_][A-Za-z0-9_]*)\s+(\d+)/g)) {
    constants.set(match[1], Number(match[2]));
  }
  for (const match of code.matchAll(/(?:const\s+)?(?:int|uint8_t|byte)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\d+)\s*;/g)) {
    constants.set(match[1], Number(match[2]));
  }

  const used = new Map<number, Set<string>>();
  const addUse = (gpio: number, use: string) => {
    used.set(gpio, new Set([...(used.get(gpio) || []), use]));
  };

  for (const match of code.matchAll(/pinMode\s*\(\s*([A-Za-z_][A-Za-z0-9_]*|\d+)\s*,\s*(INPUT_PULLUP|INPUT_PULLDOWN|INPUT|OUTPUT)\s*\)/g)) {
    const gpio = resolveToken(match[1], constants);
    if (gpio !== undefined) addUse(gpio, `pinMode ${match[2]}`);
  }
  for (const match of code.matchAll(/digitalWrite\s*\(\s*([A-Za-z_][A-Za-z0-9_]*|\d+)/g)) {
    const gpio = resolveToken(match[1], constants);
    if (gpio !== undefined) addUse(gpio, "digitalWrite 输出");
  }
  for (const match of code.matchAll(/digitalRead\s*\(\s*([A-Za-z_][A-Za-z0-9_]*|\d+)/g)) {
    const gpio = resolveToken(match[1], constants);
    if (gpio !== undefined) addUse(gpio, "digitalRead 输入");
  }
  for (const match of code.matchAll(/analogRead\s*\(\s*([A-Za-z_][A-Za-z0-9_]*|\d+)/g)) {
    const gpio = resolveToken(match[1], constants);
    if (gpio !== undefined) addUse(gpio, "analogRead ADC");
  }
  for (const match of code.matchAll(/Wire\.begin\s*\(\s*([A-Za-z_][A-Za-z0-9_]*|\d+)\s*,\s*([A-Za-z_][A-Za-z0-9_]*|\d+)\s*\)/g)) {
    const sda = resolveToken(match[1], constants);
    const scl = resolveToken(match[2], constants);
    if (sda !== undefined) addUse(sda, "Wire.begin SDA");
    if (scl !== undefined) addUse(scl, "Wire.begin SCL");
  }

  if (used.size === 0) {
    return [{ severity: "warning", message: "未解析到 GPIO 使用。支持 #define、const int、pinMode、digitalWrite、digitalRead、analogRead、Wire.begin。" }];
  }

  for (const [gpio, usages] of used) {
    const pin = boardPins.find((item) => item.gpio === gpio);
    if (!pin) {
      issues.push({ severity: "error", message: `代码使用 GPIO${gpio}，但当前 ESP32 板型没有该引脚。` });
      continue;
    }

    const connected = connectedGpios.get(gpio);
    if (!connected) {
      issues.push({ severity: "warning", message: `代码使用 GPIO${gpio} (${[...usages].join("、")})，但规划中没有元件连接到它。` });
    } else {
      issues.push({ severity: "ok", message: `GPIO${gpio} 已连接：${connected.join("、")}；代码用途：${[...usages].join("、")}` });
    }

    const useText = [...usages].join(" ");
    if (useText.includes("OUTPUT") || useText.includes("digitalWrite")) {
      if (pin.warnings?.some((warning) => warning.includes("仅输入"))) {
        issues.push({ severity: "error", message: `GPIO${gpio} 是仅输入脚，但代码中作为输出使用。` });
      }
    }

    if (useText.includes("analogRead") && !pin.capabilities.includes("analog")) {
      issues.push({ severity: "error", message: `GPIO${gpio} 不在当前板型的 ADC 能力列表中，不建议 analogRead。` });
    }

    if (pin.warnings?.length) {
      issues.push({ severity: "warning", message: `GPIO${gpio} 提醒：${pin.warnings.join("；")}` });
    }
  }

  return issues;
}
