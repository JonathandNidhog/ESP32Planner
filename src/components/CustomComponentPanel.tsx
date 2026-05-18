import { useEffect, useState } from "react";
import type { ComponentDefinition } from "../models/types";

interface CustomComponentPanelProps {
  customComponents: ComponentDefinition[];
  onAddCustomComponent: (definition: ComponentDefinition) => void;
  onClearCustomComponents: () => void;
}

const CUSTOM_LIBRARY_KEY = "esp32-local-planner-custom-component-library";

const exampleDefinition: ComponentDefinition = {
  type: "custom-bme280",
  name: "BME280 环境传感器",
  category: "自定义",
  description: "示例：I2C 温湿度气压传感器模块。你给具体型号后，我可以上网查 pinout 后生成这种 JSON。",
  color: "#10b981",
  footprint: { cols: 6, rows: 4 },
  visual: { kind: "sensor", label: "BME" },
  source: "example",
  pins: [
    { id: "vcc", label: "VCC", required: ["power-3v3"], role: "power", note: "3.3V 供电" },
    { id: "gnd", label: "GND", required: ["ground"], role: "ground", note: "接地" },
    { id: "scl", label: "SCL", required: ["i2c-scl"], role: "signal", note: "I2C 时钟" },
    { id: "sda", label: "SDA", required: ["i2c-sda"], role: "signal", note: "I2C 数据" }
  ]
};

function validateDefinition(value: unknown): ComponentDefinition {
  const definition = value as ComponentDefinition;
  if (!definition || typeof definition !== "object") throw new Error("不是有效对象");
  if (!definition.type || !definition.name || !Array.isArray(definition.pins)) throw new Error("缺少 type/name/pins 字段");
  if (!definition.footprint?.cols || !definition.footprint?.rows) throw new Error("缺少 footprint.cols/rows");
  return {
    ...definition,
    category: definition.category || "自定义",
    color: definition.color || "#64748b",
    visual: definition.visual || { kind: "generic", label: definition.name.slice(0, 4).toUpperCase() }
  };
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CustomComponentPanel({ customComponents, onAddCustomComponent, onClearCustomComponents }: CustomComponentPanelProps) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("输入或粘贴 ComponentDefinition JSON。导入后会随项目自动保存，也可以单独保存到本机组件库。");

  useEffect(() => {
    localStorage.setItem(CUSTOM_LIBRARY_KEY, JSON.stringify(customComponents));
  }, [customComponents]);

  function importDefinitions(value: unknown) {
    const values = Array.isArray(value) ? value : [value];
    const definitions = values.map(validateDefinition);
    definitions.forEach(onAddCustomComponent);
    return definitions.length;
  }

  function importJson() {
    try {
      const parsed = JSON.parse(text);
      const count = importDefinitions(parsed);
      setMessage(`已导入并保存自定义组件：${count} 个`);
    } catch (error) {
      setMessage(`导入失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function saveToLocalLibrary() {
    localStorage.setItem(CUSTOM_LIBRARY_KEY, JSON.stringify(customComponents));
    setMessage(`已保存到本机组件库：${customComponents.length} 个。下次打开可点“恢复本机组件库”。`);
  }

  function restoreLocalLibrary() {
    try {
      const raw = localStorage.getItem(CUSTOM_LIBRARY_KEY);
      if (!raw) {
        setMessage("本机组件库为空，还没有保存过自定义组件。");
        return;
      }
      const count = importDefinitions(JSON.parse(raw));
      setMessage(`已从本机组件库恢复：${count} 个`);
    } catch (error) {
      setMessage(`恢复失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function exportCustomLibrary() {
    downloadJson("esp32-custom-components.json", customComponents);
    setMessage(`已导出自定义组件库：${customComponents.length} 个`);
  }

  return (
    <section className="panel-section">
      <h2>型号组件导入</h2>
      <p className="hint">本地网页不直接爬网页。你给型号，我联网查数据后可生成这里可导入的 JSON。支持单个组件对象或组件数组。</p>
      <textarea className="json-editor" value={text} onChange={(event) => setText(event.target.value)} />
      <div className="button-row">
        <button onClick={() => setText(JSON.stringify(exampleDefinition, null, 2))}>填入示例</button>
        <button className="primary" onClick={importJson}>导入并保存</button>
        <button onClick={saveToLocalLibrary}>保存本机组件库</button>
        <button onClick={restoreLocalLibrary}>恢复本机组件库</button>
        <button onClick={exportCustomLibrary}>导出组件库</button>
        <button className="danger" onClick={onClearCustomComponents}>清空自定义</button>
      </div>
      <p className="hint">{message}</p>
      <div className="custom-count">当前自定义组件：{customComponents.length}</div>
    </section>
  );
}
