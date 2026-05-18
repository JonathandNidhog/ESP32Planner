import type { ESP32Pin, PinCapability } from "../models/types";

const inputOnlyGpios = new Set([34, 35, 36, 39]);
const lowPriorityWarningKeywords = ["启动", "UART0", "板载"];

export function pinSupports(pin: ESP32Pin, required: PinCapability[]): boolean {
  return required.some((capability) => pin.capabilities.includes(capability));
}

export function isOutputUnsafe(pin: ESP32Pin, required: PinCapability[]): boolean {
  const needsOutput = required.includes("digital") || required.includes("pwm") || required.includes("i2c-sda") || required.includes("i2c-scl");
  return needsOutput && pin.gpio !== undefined && inputOnlyGpios.has(pin.gpio);
}

export function getPinScore(pin: ESP32Pin, required: PinCapability[]): number {
  let score = 100;

  if (required.includes("i2c-sda") && pin.id === "gpio21") score += 50;
  if (required.includes("i2c-scl") && pin.id === "gpio22") score += 50;
  if (required.includes("ground") && pin.capabilities.includes("ground")) score += 20;
  if (required.includes("power-3v3") && pin.capabilities.includes("power-3v3")) score += 20;
  if (required.includes("power-5v") && pin.capabilities.includes("power-5v")) score += 20;
  if (pin.warnings?.some((warning) => lowPriorityWarningKeywords.some((keyword) => warning.includes(keyword)))) score -= 30;
  if (isOutputUnsafe(pin, required)) score -= 1000;

  return score;
}

export function describePinWarning(pin: ESP32Pin): string | undefined {
  if (!pin.warnings?.length) return undefined;
  return `${pin.label}: ${pin.warnings.join("；")}`;
}
