import { useRef } from "react";
import type { ProjectState } from "../models/types";
import { downloadProject, readProjectFile } from "../io/projectIO";

interface ToolbarProps {
  project: ProjectState;
  manualWireStartActive: boolean;
  onAutoAssign: () => void;
  onClear: () => void;
  onCancelManualWire: () => void;
  onImport: (project: ProjectState) => void;
}

export default function Toolbar({ project, manualWireStartActive, onAutoAssign, onClear, onCancelManualWire, onImport }: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    const imported = await readProjectFile(file);
    onImport(imported);
  }

  return (
    <header className="toolbar">
      <div>
        <div className="app-title">ESP32 本地模拟器 / 万能板规划器</div>
        <div className="app-subtitle">首版聚焦引脚规划、自动连线、洞洞板布局，不做真实 CPU 仿真</div>
      </div>
      <div className="toolbar-actions">
        <button className="primary" onClick={onAutoAssign}>自动连接全部组件</button>
        {manualWireStartActive && <button onClick={onCancelManualWire}>取消手动连线</button>}
        <button onClick={() => downloadProject(project)}>导出 JSON</button>
        <button onClick={() => inputRef.current?.click()}>导入 JSON</button>
        <button className="danger" onClick={onClear}>清空</button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="application/json,.json"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>
    </header>
  );
}
