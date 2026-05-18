import type { ComponentDefinition } from "../models/types";

export const componentLibrary: ComponentDefinition[] = [
  {
    type: "led",
    name: "LED",
    category: "基础",
    description: "普通发光二极管，建议串联限流电阻。",
    color: "#ef4444",
    footprint: { cols: 2, rows: 3 },
    visual: { kind: "led", label: "LED" },
    pins: [
      { id: "anode", label: "A/+", required: ["digital", "pwm"], role: "signal", note: "阳极，接 GPIO 输出，建议串联限流电阻" },
      { id: "cathode", label: "K/-", required: ["ground"], role: "ground", note: "阴极，接 GND" }
    ]
  },
  {
    type: "resistor",
    name: "电阻",
    category: "基础",
    description: "通用电阻，用于限流、分压、上拉/下拉。",
    color: "#f59e0b",
    footprint: { cols: 4, rows: 1 },
    visual: { kind: "resistor", label: "R" },
    pins: [
      { id: "a", label: "1", required: ["digital", "analog", "power-3v3", "power-5v"], role: "signal", note: "电阻一端" },
      { id: "b", label: "2", required: ["digital", "analog", "ground"], role: "signal", note: "电阻另一端" }
    ]
  },
  {
    type: "button",
    name: "按钮",
    category: "基础",
    description: "轻触按钮，常用于数字输入。",
    color: "#38bdf8",
    footprint: { cols: 4, rows: 4 },
    visual: { kind: "button", label: "BTN" },
    pins: [
      { id: "signal", label: "SIG", required: ["digital"], role: "signal", note: "按键信号输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "potentiometer",
    name: "电位器",
    category: "基础",
    description: "三脚电位器，输出模拟电压。",
    color: "#a855f7",
    footprint: { cols: 4, rows: 4 },
    visual: { kind: "potentiometer", label: "POT" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "供电正极" },
      { id: "out", label: "OUT", required: ["analog"], role: "signal", note: "模拟输出，接 ADC" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "dht22",
    name: "DHT22",
    category: "传感器",
    description: "温湿度传感器，单总线数字信号。",
    color: "#22c55e",
    footprint: { cols: 4, rows: 5 },
    visual: { kind: "sensor", label: "DHT" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "3.3V 供电" },
      { id: "data", label: "DATA", required: ["digital"], role: "signal", note: "单总线数据脚" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "hcsr04",
    name: "HC-SR04",
    category: "传感器",
    description: "超声波测距模块。Echo 输出 5V 时真实硬件需分压。",
    color: "#06b6d4",
    footprint: { cols: 8, rows: 4 },
    visual: { kind: "sensor", label: "SONAR" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-5v"], role: "power", note: "5V 供电" },
      { id: "trig", label: "TRIG", required: ["digital"], role: "signal", note: "触发信号输出" },
      { id: "echo", label: "ECHO", required: ["digital"], role: "signal", note: "回波信号输入，真实硬件建议分压" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "oled-i2c",
    name: "OLED I2C",
    category: "显示",
    description: "SSD1306 128x64 OLED，I2C 接口。",
    color: "#6366f1",
    footprint: { cols: 11, rows: 5 },
    visual: { kind: "display", label: "OLED" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "3.3V 供电" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "scl", label: "SCL", required: ["i2c-scl"], role: "signal", note: "I2C 时钟" },
      { id: "sda", label: "SDA", required: ["i2c-sda"], role: "signal", note: "I2C 数据" }
    ]
  },
  {
    type: "mpu6050",
    name: "MPU6050 陀螺仪",
    category: "传感器",
    description: "六轴陀螺仪/加速度计模块，I2C 接口，常用地址 0x68。",
    color: "#14b8a6",
    footprint: { cols: 6, rows: 5 },
    visual: { kind: "sensor", label: "MPU" },
    source: "MPU6050 常规模块 pinout：VCC/GND/SCL/SDA/INT",
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "建议 3.3V 供电，部分模块可 5V" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "scl", label: "SCL", required: ["i2c-scl"], role: "signal", note: "I2C 时钟" },
      { id: "sda", label: "SDA", required: ["i2c-sda"], role: "signal", note: "I2C 数据" },
      { id: "int", label: "INT", required: ["digital"], role: "signal", note: "中断输出，可选连接" }
    ]
  },
  {
    type: "buzzer",
    name: "蜂鸣器",
    category: "执行器",
    description: "有源/无源蜂鸣器，PWM 可控制音调。",
    color: "#eab308",
    footprint: { cols: 3, rows: 3 },
    visual: { kind: "actuator", label: "BZ" },
    pins: [
      { id: "sig", label: "SIG", required: ["pwm", "digital"], role: "signal", note: "控制信号/PWM" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "servo",
    name: "舵机",
    category: "执行器",
    description: "三线舵机，信号脚使用 PWM。",
    color: "#f97316",
    footprint: { cols: 5, rows: 3 },
    visual: { kind: "actuator", label: "SERVO" },
    pins: [
      { id: "vcc", label: "5V", required: ["power-5v"], role: "power", note: "舵机电源，真实硬件建议独立供电" },
      { id: "sig", label: "SIG", required: ["pwm", "digital"], role: "signal", note: "PWM 控制信号" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "与 ESP32 共地" }
    ]
  },
  {
    type: "ws2812",
    name: "WS2812",
    category: "执行器",
    description: "可编程 RGB LED，单线数字控制。",
    color: "#ec4899",
    footprint: { cols: 4, rows: 4 },
    visual: { kind: "led", label: "RGB" },
    pins: [
      { id: "vcc", label: "5V", required: ["power-5v", "power-3v3"], role: "power", note: "常用 5V 供电" },
      { id: "din", label: "DIN", required: ["digital"], role: "signal", note: "数据输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "relay",
    name: "继电器模块",
    category: "模块",
    description: "常见单路继电器模块。",
    color: "#64748b",
    footprint: { cols: 7, rows: 5 },
    visual: { kind: "module", label: "RELAY" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-5v"], role: "power", note: "模块供电" },
      { id: "in", label: "IN", required: ["digital"], role: "signal", note: "控制输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "ldr-module",
    name: "光敏模块",
    category: "传感器",
    description: "光敏电阻模块，模拟输出。",
    color: "#84cc16",
    footprint: { cols: 5, rows: 4 },
    visual: { kind: "sensor", label: "LDR" },
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "3.3V 供电" },
      { id: "ao", label: "AO", required: ["analog"], role: "signal", note: "模拟量输出" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "mx-key-switch",
    name: "机械键盘轴",
    category: "输入",
    description: "MX 兼容机械键盘轴，两脚开关。可用于单键或键盘矩阵规划。",
    color: "#0ea5e9",
    footprint: { cols: 6, rows: 6 },
    visual: { kind: "key-switch", label: "MX" },
    pins: [
      { id: "row", label: "ROW", required: ["digital"], role: "signal", note: "矩阵行/信号输入" },
      { id: "col", label: "COL", required: ["digital", "ground"], role: "signal", note: "矩阵列/另一端，可接 GPIO 或 GND" }
    ]
  },
  {
    type: "tft-spi-st7735-18",
    name: "1.8寸 TFT SPI 屏",
    category: "显示",
    description: "1.8 寸 ST7735/ST7789 类 SPI 彩色液晶屏，适合 ESP32 图形界面测试。",
    color: "#2563eb",
    footprint: { cols: 14, rows: 18 },
    visual: { kind: "tft", label: "1.8TFT" },
    source: "订单截图：1.8/1.44/2.4/2.8 寸 TFT 彩色液晶 SPI 串口屏。SPI 脚位按常见模块建模。",
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3", "power-5v"], role: "power", note: "模块供电，优先按实际板载稳压选择 3.3V/5V" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "sck", label: "SCK", required: ["digital"], role: "signal", note: "SPI 时钟" },
      { id: "mosi", label: "MOSI", required: ["digital"], role: "signal", note: "SPI 数据输入" },
      { id: "cs", label: "CS", required: ["digital"], role: "signal", note: "片选" },
      { id: "dc", label: "DC", required: ["digital"], role: "signal", note: "数据/命令选择" },
      { id: "rst", label: "RST", required: ["digital"], role: "signal", note: "复位脚，可接 GPIO 或上拉" },
      { id: "bl", label: "BL", required: ["pwm", "digital", "power-3v3"], role: "signal", note: "背光控制，需调光时接 PWM" }
    ]
  },
  {
    type: "tft-spi-st7789-225",
    name: "2.25寸 ST7789 屏",
    category: "显示",
    description: "2.25 寸 ST7789 SPI 彩屏，8 针蓝板排针版本。",
    color: "#0f766e",
    footprint: { cols: 15, rows: 23 },
    visual: { kind: "tft", label: "2.25" },
    source: "订单截图：2.25 寸 TFT 液晶显示屏 ST7789 模块 LCD 全视角 SPI 彩屏 8 针蓝板。",
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "常见 3.3V 供电" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "sck", label: "SCL/SCK", required: ["digital"], role: "signal", note: "SPI 时钟" },
      { id: "mosi", label: "SDA", required: ["digital"], role: "signal", note: "SPI MOSI" },
      { id: "cs", label: "CS", required: ["digital"], role: "signal", note: "片选" },
      { id: "dc", label: "DC", required: ["digital"], role: "signal", note: "数据/命令选择" },
      { id: "rst", label: "RST", required: ["digital"], role: "signal", note: "复位" },
      { id: "bl", label: "BL", required: ["pwm", "digital", "power-3v3"], role: "signal", note: "背光" }
    ]
  },
  {
    type: "joystick-ps2-5pin",
    name: "PS2 双轴摇杆",
    category: "输入",
    description: "双轴按键摇杆模块，X/Y 为模拟输入，按压为数字输入。",
    color: "#7c3aed",
    footprint: { cols: 11, rows: 11 },
    visual: { kind: "joystick", label: "JOY" },
    source: "订单截图：双轴按键摇杆 PS2 游戏摇杆控制杆传感器，5/9 针版本按常见 VCC/GND/VRX/VRY/SW 建模。",
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "建议 3.3V，避免模拟输出超过 ESP32 ADC 范围" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "vrx", label: "VRX", required: ["analog"], role: "signal", note: "X 轴模拟量" },
      { id: "vry", label: "VRY", required: ["analog"], role: "signal", note: "Y 轴模拟量" },
      { id: "sw", label: "SW", required: ["digital"], role: "signal", note: "按压开关" }
    ]
  },
  {
    type: "pam8403-amplifier",
    name: "PAM8403 功放板",
    category: "模块",
    description: "2x3W D 类小功放模块，用于驱动小喇叭，音频输入可来自 DAC/PWM/外部音频。",
    color: "#db2777",
    footprint: { cols: 7, rows: 5 },
    visual: { kind: "module", label: "AMP" },
    source: "订单截图：PAM8403 微型数字功放板 2*3W，2.5-5V USB 供电。",
    pins: [
      { id: "vcc", label: "5V", required: ["power-5v"], role: "power", note: "2.5-5V 供电，驱动喇叭建议 5V" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "与 ESP32 共地" },
      { id: "lin", label: "L-IN", required: ["pwm", "analog", "digital"], role: "signal", note: "左声道输入；ESP32 可用 PWM/I2S DAC 外围方案" },
      { id: "rin", label: "R-IN", required: ["pwm", "analog", "digital"], role: "signal", note: "右声道输入" }
    ]
  },
  {
    type: "lmd2718-ns4168-audio",
    name: "LMD2718+NS4168 音频模块",
    category: "模块",
    description: "ESP32 常用数字音频功放模块，可接小喇叭，按 I2S 控制线建模。",
    color: "#9333ea",
    footprint: { cols: 7, rows: 5 },
    visual: { kind: "module", label: "I2S" },
    source: "订单截图：小智 DIY LMD2718+NS4168 音频模块，焊接/带喇叭版本。",
    pins: [
      { id: "vin", label: "VIN", required: ["power-5v", "power-3v3"], role: "power", note: "按模块丝印供电" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "bclk", label: "BCLK", required: ["digital"], role: "signal", note: "I2S 位时钟" },
      { id: "lrc", label: "LRC", required: ["digital"], role: "signal", note: "I2S 左右声道时钟/WS" },
      { id: "din", label: "DIN", required: ["digital"], role: "signal", note: "I2S 数据输入" }
    ]
  },
  {
    type: "speaker-2828-4ohm",
    name: "2828 4Ω 喇叭",
    category: "执行器",
    description: "2828 腔体小喇叭，建议通过 PAM8403/NS4168 等功放驱动，不要直接接 ESP32。",
    color: "#ea580c",
    footprint: { cols: 12, rows: 12 },
    visual: { kind: "speaker", label: "SPK" },
    source: "订单截图：2828 腔体喇叭 4 欧 2 瓦。",
    pins: [
      { id: "plus", label: "SPK+", required: ["pwm", "digital"], role: "signal", note: "接功放输出正端；直连 ESP32 仅作规划占位" },
      { id: "minus", label: "SPK-", required: ["ground", "digital"], role: "signal", note: "接功放输出负端/桥接输出" }
    ]
  },
  {
    type: "tp4056-typec-charger",
    name: "TP4056 Type-C 充电板",
    category: "模块",
    description: "锂电池充电保护模块，Type-C 输入，BAT 接单节锂电池。",
    color: "#0284c7",
    footprint: { cols: 10, rows: 7 },
    visual: { kind: "charger", label: "CHG" },
    source: "订单截图：TP4056 锂电池充电保护模块 TYPE-C USB 接口，10 个装。",
    pins: [
      { id: "in5v", label: "IN+", required: ["power-5v"], role: "power", note: "Type-C/USB 5V 输入" },
      { id: "ingnd", label: "IN-", required: ["ground"], role: "ground", note: "输入地" },
      { id: "batp", label: "BAT+", required: ["power-3v3", "power-5v"], role: "power", note: "锂电正极，不能直接当 5V 使用" },
      { id: "batn", label: "BAT-", required: ["ground"], role: "ground", note: "锂电负极" }
    ]
  },
  {
    type: "lipo-903090-3200mah",
    name: "3.7V 锂电池 3200mAh",
    category: "模块",
    description: "单节 3.7V 聚合物锂电池，通常配合 TP4056 与升压/稳压模块使用。",
    color: "#f59e0b",
    footprint: { cols: 36, rows: 13 },
    visual: { kind: "battery", label: "BAT" },
    source: "订单截图：3.7V 聚合物锂电池 503450/903090 3200mAh。",
    pins: [
      { id: "batp", label: "BAT+", required: ["power-3v3", "power-5v"], role: "power", note: "电池正极，真实电压约 3.0-4.2V" },
      { id: "batn", label: "BAT-", required: ["ground"], role: "ground", note: "电池负极" }
    ]
  },
  {
    type: "boost-5v-3a",
    name: "3.7V转5V升压模块",
    category: "模块",
    description: "迷你 DC 升压模块，把单节锂电升到 5V，适合给屏幕/功放/灯带供电。",
    color: "#16a34a",
    footprint: { cols: 6, rows: 4 },
    visual: { kind: "module", label: "5V↑" },
    source: "订单截图：迷你 DC 升压模块 5V3A 高效 3.7V 锂电池升压电路板电源。",
    pins: [
      { id: "vin", label: "VIN", required: ["power-3v3", "power-5v"], role: "power", note: "接锂电正极输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "输入/输出共地" },
      { id: "vout", label: "5VOUT", required: ["power-5v"], role: "power", note: "5V 输出" }
    ]
  },
  {
    type: "ws2812b-8-strip",
    name: "WS2812B 8位灯条",
    category: "执行器",
    description: "8 位可编程 RGB 灯条，单线控制，常用 5V 供电。",
    color: "#f43f5e",
    footprint: { cols: 9, rows: 2 },
    visual: { kind: "led", label: "8RGB" },
    source: "订单截图：5V 可编程 RGB 灯板 LED 条形灯 WS2812B 七彩 8 位灯带。",
    pins: [
      { id: "vcc", label: "5V", required: ["power-5v"], role: "power", note: "5V 供电" },
      { id: "din", label: "DIN", required: ["digital"], role: "signal", note: "数据输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "ws2812-5050-module",
    name: "WS2812 5050 RGB模块",
    category: "执行器",
    description: "单颗 5050 RGB LED 模块，内置驱动，可串联。",
    color: "#ec4899",
    footprint: { cols: 4, rows: 3 },
    visual: { kind: "led", label: "5050" },
    source: "订单截图：WS2812 5050 RGB LED 内置驱动彩灯模块 + 线。",
    pins: [
      { id: "vcc", label: "5V", required: ["power-5v", "power-3v3"], role: "power", note: "常用 5V 供电" },
      { id: "din", label: "DIN", required: ["digital"], role: "signal", note: "数据输入" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" }
    ]
  },
  {
    type: "micro-sd-module",
    name: "MicroSD/TF 卡模块",
    category: "模块",
    description: "TF/MicroSD 卡 SPI 接口模块，用于日志、图片或音频文件存储。",
    color: "#dc2626",
    footprint: { cols: 7, rows: 5 },
    visual: { kind: "module", label: "SD" },
    source: "订单截图：SanDisk TF 卡；ESP32-C6 LCD 板也带 Micro SD 卡槽。这里按外接 SPI TF 模块建模。",
    pins: [
      { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "优先 3.3V" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
      { id: "sck", label: "SCK", required: ["digital"], role: "signal", note: "SPI 时钟" },
      { id: "mosi", label: "MOSI", required: ["digital"], role: "signal", note: "主机输出" },
      { id: "miso", label: "MISO", required: ["digital"], role: "signal", note: "主机输入" },
      { id: "cs", label: "CS", required: ["digital"], role: "signal", note: "片选" }
    ]
  },
  {
    type: "pogo-4p-connector",
    name: "4P 磁吸 PogoPin",
    category: "模块",
    description: "4P 磁吸连接器公母座，可作为电源/信号可拆连接。",
    color: "#64748b",
    footprint: { cols: 5, rows: 2 },
    visual: { kind: "pogo", label: "4P" },
    source: "订单截图：磁吸连接器 pogopin 公母座，4P-2.5PH 带耳/超薄版本。",
    pins: [
      { id: "p1", label: "P1", required: ["power-5v", "power-3v3", "digital"], role: "signal", note: "按实际线序定义" },
      { id: "p2", label: "P2", required: ["ground", "digital"], role: "signal", note: "按实际线序定义" },
      { id: "p3", label: "P3", required: ["digital", "i2c-sda"], role: "signal", note: "可作信号线" },
      { id: "p4", label: "P4", required: ["digital", "i2c-scl"], role: "signal", note: "可作信号线" }
    ]
  },
  {
    type: "usb-c-breakout-16p",
    name: "Type-C 母座测试板",
    category: "模块",
    description: "USB-C 母座转 2.54 测试板，用于把 VBUS/GND/USB 数据线引出。",
    color: "#0891b2",
    footprint: { cols: 6, rows: 5 },
    visual: { kind: "usb-c", label: "USB-C" },
    source: "订单截图：TYPE-C 母座测试板双面正反插 USB3.1 16P 转 2.54。",
    pins: [
      { id: "vbus", label: "VBUS", required: ["power-5v"], role: "power", note: "USB 5V" },
      { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "USB 地" },
      { id: "dp", label: "D+", required: ["digital"], role: "signal", note: "USB D+，仅作布线占位" },
      { id: "dm", label: "D-", required: ["digital"], role: "signal", note: "USB D-，仅作布线占位" }
    ]
  },
  {
    type: "micro-stepper-5mm",
    name: "5mm 微型步进电机",
    category: "执行器",
    description: "二相四线微型滑台/升降步进电机，实际需要电机驱动芯片，不建议直接接 ESP32。",
    color: "#475569",
    footprint: { cols: 8, rows: 4 },
    visual: { kind: "actuator", label: "STEP" },
    source: "订单截图：微型二相四线行星减速步进电机，电机外径 5MM。",
    pins: [
      { id: "a1", label: "A1", required: ["digital"], role: "signal", note: "线圈 A，经驱动器连接" },
      { id: "a2", label: "A2", required: ["digital"], role: "signal", note: "线圈 A，经驱动器连接" },
      { id: "b1", label: "B1", required: ["digital"], role: "signal", note: "线圈 B，经驱动器连接" },
      { id: "b2", label: "B2", required: ["digital"], role: "signal", note: "线圈 B，经驱动器连接" }
    ]
  }
];
