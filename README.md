# ESP32 Local Planner

本项目是一个本地 ESP32 万能板/洞洞板规划工具，支持在画布中规划开发板、模块、传感器、显示屏、音频、电源和连接器等元器件的布局与引脚连接。

## 功能

- Vite + React + TypeScript 本地应用
- Electron Windows 桌面便携版
- ESP32 开发板选择、拖动、旋转、吸附孔位
- 元器件添加、拖动、旋转、吸附孔位
- SVG 画布缩放和平移视口
- 自动分配 ESP32 引脚并绘制连线
- 支持点击任意两个引脚进行手动连线，支持 ESP32-组件和组件-组件连接
- GND、电源和信号类型会严格校验，连错会提示错误
- 支持单独删除组件和单独删除连线
- 多条线会自动错开走线，减少重叠
- 订单截图中常用模块库：ESP32-C6 LCD、ESP32-S3-N16R8、TFT 屏、MPU6050、PS2 摇杆、功放、喇叭、锂电/充电/升压、WS2812、MicroSD、PogoPin、Type-C 测试板、微型步进电机等
- JSON 导入/导出
- Arduino 风格代码静态检查

## 开发运行

```bash
npm install
npm run dev
```

## Web 构建

```bash
npm run build
npm run preview
```

## 桌面版运行/打包

```bash
npm run desktop
npm run package:win
```

Windows 便携版会输出到：

```text
release/ESP32 Local Planner 0.1.0.exe
```

## 说明

这是一个视觉规划工具，不做真实电路仿真或固件执行。实际接线时仍需确认电压、电流、启动绑带脚、板载外设占用和模块 datasheet。
