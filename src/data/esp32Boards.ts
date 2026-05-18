import type { ESP32BoardDefinition, ESP32Pin } from "../models/types";

const devkit30Pins: ESP32Pin[] = [
  { id: "3v3-a", label: "3V3", side: "left", index: 0, capabilities: ["power-3v3"] },
  { id: "en", label: "EN", side: "left", index: 1, capabilities: [], warnings: ["复位脚，不建议接普通元件"] },
  { id: "gpio36", label: "GPIO36", gpio: 36, side: "left", index: 2, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio39", label: "GPIO39", gpio: 39, side: "left", index: 3, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio34", label: "GPIO34", gpio: 34, side: "left", index: 4, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio35", label: "GPIO35", gpio: 35, side: "left", index: 5, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio32", label: "GPIO32", gpio: 32, side: "left", index: 6, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio33", label: "GPIO33", gpio: 33, side: "left", index: 7, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio25", label: "GPIO25", gpio: 25, side: "left", index: 8, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio26", label: "GPIO26", gpio: 26, side: "left", index: 9, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio27", label: "GPIO27", gpio: 27, side: "left", index: 10, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio14", label: "GPIO14", gpio: 14, side: "left", index: 11, capabilities: ["digital", "pwm"] },
  { id: "gpio12", label: "GPIO12", gpio: 12, side: "left", index: 12, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚，谨慎外接上拉/下拉"] },
  { id: "gnd-a", label: "GND", side: "left", index: 13, capabilities: ["ground"] },
  { id: "vin", label: "VIN/5V", side: "left", index: 14, capabilities: ["power-5v"] },

  { id: "gpio23", label: "GPIO23", gpio: 23, side: "right", index: 0, capabilities: ["digital", "pwm"] },
  { id: "gpio22", label: "GPIO22", gpio: 22, side: "right", index: 1, capabilities: ["digital", "pwm", "i2c-scl"] },
  { id: "gpio1", label: "TX0", gpio: 1, side: "right", index: 2, capabilities: ["digital", "uart"], warnings: ["UART0 调试口"] },
  { id: "gpio3", label: "RX0", gpio: 3, side: "right", index: 3, capabilities: ["digital", "uart"], warnings: ["UART0 调试口"] },
  { id: "gpio21", label: "GPIO21", gpio: 21, side: "right", index: 4, capabilities: ["digital", "pwm", "i2c-sda"] },
  { id: "gnd-b", label: "GND", side: "right", index: 5, capabilities: ["ground"] },
  { id: "gpio19", label: "GPIO19", gpio: 19, side: "right", index: 6, capabilities: ["digital", "pwm"] },
  { id: "gpio18", label: "GPIO18", gpio: 18, side: "right", index: 7, capabilities: ["digital", "pwm"] },
  { id: "gpio5", label: "GPIO5", gpio: 5, side: "right", index: 8, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio17", label: "GPIO17", gpio: 17, side: "right", index: 9, capabilities: ["digital", "pwm"] },
  { id: "gpio16", label: "GPIO16", gpio: 16, side: "right", index: 10, capabilities: ["digital", "pwm"] },
  { id: "gpio4", label: "GPIO4", gpio: 4, side: "right", index: 11, capabilities: ["analog", "digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio2", label: "GPIO2", gpio: 2, side: "right", index: 12, capabilities: ["analog", "digital", "pwm"], warnings: ["板载 LED/启动绑带脚"] },
  { id: "gpio15", label: "GPIO15", gpio: 15, side: "right", index: 13, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gnd-c", label: "GND", side: "right", index: 14, capabilities: ["ground"] }
];

const devkit38Left: ESP32Pin[] = [
  { id: "3v3-a", label: "3V3", side: "left", index: 0, capabilities: ["power-3v3"] },
  { id: "en", label: "EN", side: "left", index: 1, capabilities: [], warnings: ["复位脚"] },
  { id: "gpio36", label: "GPIO36", gpio: 36, side: "left", index: 2, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio39", label: "GPIO39", gpio: 39, side: "left", index: 3, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio34", label: "GPIO34", gpio: 34, side: "left", index: 4, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio35", label: "GPIO35", gpio: 35, side: "left", index: 5, capabilities: ["analog", "digital"], warnings: ["仅输入"] },
  { id: "gpio32", label: "GPIO32", gpio: 32, side: "left", index: 6, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio33", label: "GPIO33", gpio: 33, side: "left", index: 7, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio25", label: "GPIO25", gpio: 25, side: "left", index: 8, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio26", label: "GPIO26", gpio: 26, side: "left", index: 9, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio27", label: "GPIO27", gpio: 27, side: "left", index: 10, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio14", label: "GPIO14", gpio: 14, side: "left", index: 11, capabilities: ["digital", "pwm"] },
  { id: "gpio12", label: "GPIO12", gpio: 12, side: "left", index: 12, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gnd-a", label: "GND", side: "left", index: 13, capabilities: ["ground"] },
  { id: "gpio13", label: "GPIO13", gpio: 13, side: "left", index: 14, capabilities: ["digital", "pwm"] },
  { id: "gpio9", label: "GPIO9", gpio: 9, side: "left", index: 15, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] },
  { id: "gpio10", label: "GPIO10", gpio: 10, side: "left", index: 16, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] },
  { id: "gpio11", label: "GPIO11", gpio: 11, side: "left", index: 17, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] },
  { id: "vin", label: "VIN/5V", side: "left", index: 18, capabilities: ["power-5v"] }
];

const devkit38Right: ESP32Pin[] = [
  { id: "gnd-b", label: "GND", side: "right", index: 0, capabilities: ["ground"] },
  { id: "gpio23", label: "GPIO23", gpio: 23, side: "right", index: 1, capabilities: ["digital", "pwm"] },
  { id: "gpio22", label: "GPIO22", gpio: 22, side: "right", index: 2, capabilities: ["digital", "pwm", "i2c-scl"] },
  { id: "gpio1", label: "TX0", gpio: 1, side: "right", index: 3, capabilities: ["digital", "uart"], warnings: ["UART0 调试口"] },
  { id: "gpio3", label: "RX0", gpio: 3, side: "right", index: 4, capabilities: ["digital", "uart"], warnings: ["UART0 调试口"] },
  { id: "gpio21", label: "GPIO21", gpio: 21, side: "right", index: 5, capabilities: ["digital", "pwm", "i2c-sda"] },
  { id: "gnd-c", label: "GND", side: "right", index: 6, capabilities: ["ground"] },
  { id: "gpio19", label: "GPIO19", gpio: 19, side: "right", index: 7, capabilities: ["digital", "pwm"] },
  { id: "gpio18", label: "GPIO18", gpio: 18, side: "right", index: 8, capabilities: ["digital", "pwm"] },
  { id: "gpio5", label: "GPIO5", gpio: 5, side: "right", index: 9, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio17", label: "GPIO17", gpio: 17, side: "right", index: 10, capabilities: ["digital", "pwm"] },
  { id: "gpio16", label: "GPIO16", gpio: 16, side: "right", index: 11, capabilities: ["digital", "pwm"] },
  { id: "gpio4", label: "GPIO4", gpio: 4, side: "right", index: 12, capabilities: ["analog", "digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio0", label: "GPIO0", gpio: 0, side: "right", index: 13, capabilities: ["digital", "pwm"], warnings: ["启动/下载模式绑带脚"] },
  { id: "gpio2", label: "GPIO2", gpio: 2, side: "right", index: 14, capabilities: ["analog", "digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio15", label: "GPIO15", gpio: 15, side: "right", index: 15, capabilities: ["digital", "pwm"], warnings: ["启动绑带脚"] },
  { id: "gpio8", label: "GPIO8", gpio: 8, side: "right", index: 16, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] },
  { id: "gpio7", label: "GPIO7", gpio: 7, side: "right", index: 17, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] },
  { id: "gpio6", label: "GPIO6", gpio: 6, side: "right", index: 18, capabilities: ["digital"], warnings: ["部分模块连接 Flash，谨慎使用"] }
];

const c3Pins: ESP32Pin[] = [
  { id: "3v3-a", label: "3V3", side: "left", index: 0, capabilities: ["power-3v3"] },
  { id: "gnd-a", label: "GND", side: "left", index: 1, capabilities: ["ground"] },
  { id: "gpio0", label: "GPIO0", gpio: 0, side: "left", index: 2, capabilities: ["analog", "digital", "pwm"], warnings: ["启动相关脚，谨慎使用"] },
  { id: "gpio1", label: "GPIO1", gpio: 1, side: "left", index: 3, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio2", label: "GPIO2", gpio: 2, side: "left", index: 4, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio3", label: "GPIO3", gpio: 3, side: "left", index: 5, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio4", label: "GPIO4", gpio: 4, side: "left", index: 6, capabilities: ["analog", "digital", "pwm", "i2c-sda"] },
  { id: "gpio5", label: "GPIO5", gpio: 5, side: "left", index: 7, capabilities: ["analog", "digital", "pwm", "i2c-scl"] },
  { id: "gpio6", label: "GPIO6", gpio: 6, side: "left", index: 8, capabilities: ["digital", "pwm"] },
  { id: "gpio7", label: "GPIO7", gpio: 7, side: "left", index: 9, capabilities: ["digital", "pwm"] },

  { id: "5v", label: "5V", side: "right", index: 0, capabilities: ["power-5v"] },
  { id: "gnd-b", label: "GND", side: "right", index: 1, capabilities: ["ground"] },
  { id: "gpio8", label: "GPIO8", gpio: 8, side: "right", index: 2, capabilities: ["digital", "pwm"], warnings: ["启动相关脚"] },
  { id: "gpio9", label: "GPIO9", gpio: 9, side: "right", index: 3, capabilities: ["digital", "pwm"], warnings: ["BOOT 按键常用脚"] },
  { id: "gpio10", label: "GPIO10", gpio: 10, side: "right", index: 4, capabilities: ["digital", "pwm"] },
  { id: "gpio18", label: "GPIO18", gpio: 18, side: "right", index: 5, capabilities: ["digital", "pwm", "uart"] },
  { id: "gpio19", label: "GPIO19", gpio: 19, side: "right", index: 6, capabilities: ["digital", "pwm", "uart"] },
  { id: "gpio20", label: "GPIO20", gpio: 20, side: "right", index: 7, capabilities: ["digital", "uart"] },
  { id: "gpio21", label: "GPIO21", gpio: 21, side: "right", index: 8, capabilities: ["digital", "uart"] },
  { id: "en", label: "EN", side: "right", index: 9, capabilities: [], warnings: ["复位脚"] }
];

const c6LcdPins: ESP32Pin[] = [
  { id: "3v3-a", label: "3V3", side: "left", index: 0, capabilities: ["power-3v3"] },
  { id: "gnd-a", label: "GND", side: "left", index: 1, capabilities: ["ground"] },
  { id: "gpio0", label: "GPIO0", gpio: 0, side: "left", index: 2, capabilities: ["analog", "digital", "pwm"], warnings: ["启动/下载相关脚，谨慎使用"] },
  { id: "gpio1", label: "GPIO1", gpio: 1, side: "left", index: 3, capabilities: ["analog", "digital", "pwm", "i2c-sda"] },
  { id: "gpio2", label: "GPIO2", gpio: 2, side: "left", index: 4, capabilities: ["analog", "digital", "pwm", "i2c-scl"] },
  { id: "gpio3", label: "GPIO3", gpio: 3, side: "left", index: 5, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio4", label: "GPIO4/SD_CS", gpio: 4, side: "left", index: 6, capabilities: ["digital", "pwm"], warnings: ["板载 MicroSD CS"] },
  { id: "gpio5", label: "GPIO5/SD_MISO", gpio: 5, side: "left", index: 7, capabilities: ["digital", "pwm"], warnings: ["板载 MicroSD MISO"] },
  { id: "gpio6", label: "GPIO6/MOSI", gpio: 6, side: "left", index: 8, capabilities: ["digital", "pwm"], warnings: ["板载 LCD/SD 共用 MOSI"] },
  { id: "gpio7", label: "GPIO7/SCLK", gpio: 7, side: "left", index: 9, capabilities: ["digital", "pwm"], warnings: ["板载 LCD/SD 共用 SCLK"] },
  { id: "gpio8", label: "GPIO8/RGB", gpio: 8, side: "left", index: 10, capabilities: ["digital", "pwm"], warnings: ["板载 RGB 灯珠"] },
  { id: "gpio10", label: "GPIO10", gpio: 10, side: "left", index: 11, capabilities: ["digital", "pwm"] },

  { id: "5v", label: "5V", side: "right", index: 0, capabilities: ["power-5v"] },
  { id: "gnd-b", label: "GND", side: "right", index: 1, capabilities: ["ground"] },
  { id: "gpio11", label: "GPIO11", gpio: 11, side: "right", index: 2, capabilities: ["digital", "pwm"] },
  { id: "gpio14", label: "GPIO14/LCD_CS", gpio: 14, side: "right", index: 3, capabilities: ["digital", "pwm"], warnings: ["板载 LCD CS"] },
  { id: "gpio15", label: "GPIO15/LCD_DC", gpio: 15, side: "right", index: 4, capabilities: ["digital", "pwm"], warnings: ["板载 LCD DC"] },
  { id: "gpio18", label: "GPIO18", gpio: 18, side: "right", index: 5, capabilities: ["digital", "pwm", "uart"] },
  { id: "gpio19", label: "GPIO19", gpio: 19, side: "right", index: 6, capabilities: ["digital", "pwm", "uart"] },
  { id: "gpio20", label: "GPIO20", gpio: 20, side: "right", index: 7, capabilities: ["digital", "pwm"] },
  { id: "gpio21", label: "GPIO21/LCD_RST", gpio: 21, side: "right", index: 8, capabilities: ["digital", "pwm"], warnings: ["板载 LCD RST"] },
  { id: "gpio22", label: "GPIO22/LCD_BL", gpio: 22, side: "right", index: 9, capabilities: ["digital", "pwm"], warnings: ["板载 LCD 背光"] },
  { id: "gpio23", label: "GPIO23", gpio: 23, side: "right", index: 10, capabilities: ["digital", "pwm"] },
  { id: "en", label: "EN", side: "right", index: 11, capabilities: [], warnings: ["复位脚"] }
];

const s3DevkitPins: ESP32Pin[] = [
  { id: "3v3-a", label: "3V3", side: "left", index: 0, capabilities: ["power-3v3"] },
  { id: "3v3-b", label: "3V3", side: "left", index: 1, capabilities: ["power-3v3"] },
  { id: "en", label: "RST/EN", side: "left", index: 2, capabilities: [], warnings: ["复位脚"] },
  { id: "gpio4", label: "GPIO4", gpio: 4, side: "left", index: 3, capabilities: ["analog", "digital", "pwm", "i2c-sda"] },
  { id: "gpio5", label: "GPIO5", gpio: 5, side: "left", index: 4, capabilities: ["analog", "digital", "pwm", "i2c-scl"] },
  { id: "gpio6", label: "GPIO6", gpio: 6, side: "left", index: 5, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio7", label: "GPIO7", gpio: 7, side: "left", index: 6, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio15", label: "GPIO15", gpio: 15, side: "left", index: 7, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio16", label: "GPIO16", gpio: 16, side: "left", index: 8, capabilities: ["digital", "pwm"] },
  { id: "gpio17", label: "GPIO17", gpio: 17, side: "left", index: 9, capabilities: ["digital", "pwm"] },
  { id: "gpio18", label: "GPIO18", gpio: 18, side: "left", index: 10, capabilities: ["digital", "pwm"] },
  { id: "gpio8", label: "GPIO8", gpio: 8, side: "left", index: 11, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio3", label: "GPIO3", gpio: 3, side: "left", index: 12, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio46", label: "GPIO46", gpio: 46, side: "left", index: 13, capabilities: ["digital"], warnings: ["输入/启动相关脚，谨慎使用"] },
  { id: "gpio9", label: "GPIO9", gpio: 9, side: "left", index: 14, capabilities: ["digital", "pwm"] },
  { id: "gpio10", label: "GPIO10", gpio: 10, side: "left", index: 15, capabilities: ["digital", "pwm"] },
  { id: "gpio11", label: "GPIO11", gpio: 11, side: "left", index: 16, capabilities: ["digital", "pwm"] },
  { id: "gpio12", label: "GPIO12", gpio: 12, side: "left", index: 17, capabilities: ["digital", "pwm"] },
  { id: "gpio13", label: "GPIO13", gpio: 13, side: "left", index: 18, capabilities: ["digital", "pwm"] },
  { id: "gpio14", label: "GPIO14", gpio: 14, side: "left", index: 19, capabilities: ["digital", "pwm"] },
  { id: "5v", label: "5V", side: "left", index: 20, capabilities: ["power-5v"] },
  { id: "gnd-a", label: "GND", side: "left", index: 21, capabilities: ["ground"] },

  { id: "gnd-b", label: "GND", side: "right", index: 0, capabilities: ["ground"] },
  { id: "gpio43", label: "TX/GPIO43", gpio: 43, side: "right", index: 1, capabilities: ["digital", "uart"] },
  { id: "gpio44", label: "RX/GPIO44", gpio: 44, side: "right", index: 2, capabilities: ["digital", "uart"] },
  { id: "gpio1", label: "GPIO1", gpio: 1, side: "right", index: 3, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio2", label: "GPIO2", gpio: 2, side: "right", index: 4, capabilities: ["analog", "digital", "pwm"] },
  { id: "gpio42", label: "GPIO42", gpio: 42, side: "right", index: 5, capabilities: ["digital", "pwm"] },
  { id: "gpio41", label: "GPIO41", gpio: 41, side: "right", index: 6, capabilities: ["digital", "pwm"] },
  { id: "gpio40", label: "GPIO40", gpio: 40, side: "right", index: 7, capabilities: ["digital", "pwm"] },
  { id: "gpio39", label: "GPIO39", gpio: 39, side: "right", index: 8, capabilities: ["digital", "pwm"] },
  { id: "gpio38", label: "GPIO38", gpio: 38, side: "right", index: 9, capabilities: ["digital", "pwm"] },
  { id: "gpio37", label: "GPIO37", gpio: 37, side: "right", index: 10, capabilities: ["digital", "pwm"] },
  { id: "gpio36", label: "GPIO36", gpio: 36, side: "right", index: 11, capabilities: ["digital", "pwm"] },
  { id: "gpio35", label: "GPIO35", gpio: 35, side: "right", index: 12, capabilities: ["digital", "pwm"] },
  { id: "gpio0", label: "GPIO0", gpio: 0, side: "right", index: 13, capabilities: ["analog", "digital", "pwm"], warnings: ["BOOT/下载模式脚"] },
  { id: "gpio45", label: "GPIO45", gpio: 45, side: "right", index: 14, capabilities: ["digital"], warnings: ["启动相关脚，谨慎使用"] },
  { id: "gpio48", label: "GPIO48/RGB", gpio: 48, side: "right", index: 15, capabilities: ["digital", "pwm"], warnings: ["板载 RGB LED"] },
  { id: "gpio47", label: "GPIO47", gpio: 47, side: "right", index: 16, capabilities: ["digital", "pwm"] },
  { id: "gpio21", label: "GPIO21", gpio: 21, side: "right", index: 17, capabilities: ["digital", "pwm"] },
  { id: "gpio20", label: "GPIO20/USB+", gpio: 20, side: "right", index: 18, capabilities: ["analog", "digital", "pwm"], warnings: ["USB D+，用 USB 时避免占用"] },
  { id: "gpio19", label: "GPIO19/USB-", gpio: 19, side: "right", index: 19, capabilities: ["analog", "digital", "pwm"], warnings: ["USB D-，用 USB 时避免占用"] },
  { id: "gnd-c", label: "GND", side: "right", index: 20, capabilities: ["ground"] },
  { id: "gnd-d", label: "GND", side: "right", index: 21, capabilities: ["ground"] }
];

export const esp32Boards: ESP32BoardDefinition[] = [
  {
    id: "esp32-devkit-v1-30",
    name: "ESP32 DevKit V1 30-pin",
    shortName: "ESP32 30P",
    description: "常见窄版 ESP32 DevKit，适合多数入门模块规划。",
    pins: devkit30Pins
  },
  {
    id: "esp32-devkit-v1-38",
    name: "ESP32 DevKit V1 38-pin",
    shortName: "ESP32 38P",
    description: "常见宽版 38-pin 开发板，暴露更多 GPIO，部分 Flash 相关脚谨慎使用。",
    pins: [...devkit38Left, ...devkit38Right]
  },
  {
    id: "esp32-c3-devkitm",
    name: "ESP32-C3 DevKitM",
    shortName: "ESP32-C3",
    description: "RISC-V ESP32-C3 开发板基础规划模型，默认 I2C 使用 GPIO4/GPIO5。",
    pins: c3Pins
  },
  {
    id: "esp32-c6-lcd-147",
    name: "ESP32-C6 1.47寸 LCD 开发板",
    shortName: "C6-LCD 1.47",
    description: "订单中的 ESP32-C6 1.47 寸 LCD 屏开发板。按 Waveshare/微雪公开资料标记板载 LCD、RGB 与 MicroSD 占用脚。",
    pins: c6LcdPins
  },
  {
    id: "esp32-s3-devkitc1-n16r8",
    name: "ESP32-S3-N16R8 DevKitC-1",
    shortName: "ESP32-S3 N16R8",
    description: "订单中的 ESP32-S3-N16R8 核心板/DevKitC-1 类开发板，按 Espressif DevKitC-1 44-pin 排针建模。",
    pins: s3DevkitPins
  }
];

export function getBoardDefinition(boardId: string): ESP32BoardDefinition {
  return esp32Boards.find((board) => board.id === boardId) || esp32Boards[0];
}

export const defaultBoardId = esp32Boards[0].id;
export const esp32Pins = esp32Boards[0].pins;
