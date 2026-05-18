import { useEffect, useMemo, useState } from "react";
import BoardSettingsPanel from "./components/BoardSettingsPanel";
import CodeTestPanel from "./components/CodeTestPanel";
import ComponentLibrary from "./components/ComponentLibrary";
import CustomComponentPanel from "./components/CustomComponentPanel";
import PinPanel from "./components/PinPanel";
import PropertyPanel from "./components/PropertyPanel";
import Toolbar from "./components/Toolbar";
import CircuitCanvas from "./components/canvas/CircuitCanvas";
import { componentLibrary } from "./data/componentLibrary";
import { defaultBoardId, getBoardDefinition } from "./data/esp32Boards";
import { autoAssignPins } from "./engine/autoAssign";
import { boardMetrics, defaultBoardPosition } from "./engine/router";
import { clearSavedProject, loadProject, saveProject } from "./io/projectIO";
import type { ComponentDefinition, PerfboardConfig, PlacedComponent, ProjectState, Rotation } from "./models/types";

const defaultPerfboard: PerfboardConfig = { cols: 36, rows: 26, cellSize: 18 };

function makeDefaultProject(): ProjectState {
  return {
    name: "esp32-perfboard-plan",
    boardId: defaultBoardId,
    boardPosition: defaultBoardPosition,
    perfboard: defaultPerfboard,
    components: [],
    customComponents: [],
    connections: [],
    messages: ["从左侧添加元器件，然后点击自动连接。"],
    codeTest: ""
  };
}

function normalizeProject(project?: Partial<ProjectState>): ProjectState {
  return {
    ...makeDefaultProject(),
    ...project,
    boardId: project?.boardId || defaultBoardId,
    boardPosition: { ...defaultBoardPosition, ...(project?.boardPosition || {}) },
    perfboard: { ...defaultPerfboard, ...(project?.perfboard || {}) },
    customComponents: project?.customComponents || [],
    messages: project?.messages || ["从左侧添加元器件，然后点击自动连接。"],
    codeTest: project?.codeTest || ""
  };
}

function createComponent(type: string, index: number, perfboard: PerfboardConfig): PlacedComponent {
  const col = Math.min(perfboard.cols - 2, 3 + (index % 4) * 8);
  const row = Math.min(perfboard.rows - 2, 3 + Math.floor(index / 4) * 6);
  return {
    id: `${type}-${Date.now().toString(36)}-${index}`,
    type,
    boardCol: Math.max(0, col),
    boardRow: Math.max(0, row),
    x: boardMetrics.gridX + Math.max(0, col) * perfboard.cellSize,
    y: boardMetrics.gridY + Math.max(0, row) * perfboard.cellSize,
    rotation: 0
  };
}

export default function App() {
  const [project, setProject] = useState<ProjectState>(() => normalizeProject(loadProject()));
  const [selectedBoard, setSelectedBoard] = useState(false);

  const currentBoard = useMemo(() => getBoardDefinition(project.boardId), [project.boardId]);
  const fullLibrary = useMemo(() => [...componentLibrary, ...project.customComponents], [project.customComponents]);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const selectedComponent = useMemo(
    () => project.components.find((item) => item.id === project.selectedComponentId),
    [project.components, project.selectedComponentId]
  );

  function addComponent(type: string) {
    const definition = fullLibrary.find((item) => item.type === type);
    setProject((current) => ({
      ...current,
      components: [...current.components, createComponent(type, current.components.length, current.perfboard)],
      messages: [`已添加：${definition?.name || type}。可拖到万能板孔位上，再执行自动连接。`, ...current.messages].slice(0, 8)
    }));
  }

  function moveComponent(id: string, x: number, y: number, col: number, row: number) {
    setProject((current) => ({
      ...current,
      components: current.components.map((component) =>
        component.id === id ? { ...component, x, y, boardCol: col, boardRow: row } : component
      )
    }));
  }

  function moveBoard(position: ProjectState["boardPosition"]) {
    setProject((current) => ({
      ...current,
      boardPosition: position
    }));
  }

  function deleteComponent(id: string) {
    setProject((current) => ({
      ...current,
      components: current.components.filter((component) => component.id !== id),
      connections: current.connections.filter((connection) => connection.componentId !== id),
      selectedComponentId: undefined,
      messages: [`已删除组件：${id}`, ...current.messages].slice(0, 8)
    }));
  }

  function rotateComponent(id: string) {
    const rotations: Rotation[] = [0, 90, 180, 270];
    setProject((current) => ({
      ...current,
      components: current.components.map((component) => {
        if (component.id !== id) return component;
        const nextIndex = (rotations.indexOf(component.rotation) + 1) % rotations.length;
        return { ...component, rotation: rotations[nextIndex] };
      })
    }));
  }

  function autoAssign() {
    const result = autoAssignPins(project.components, currentBoard.pins, project.customComponents, []);
    setProject((current) => ({
      ...current,
      connections: result.connections,
      messages: result.messages
    }));
  }

  function clearProject() {
    clearSavedProject();
    setProject(makeDefaultProject());
  }

  function importProject(imported: ProjectState) {
    setProject({
      ...normalizeProject(imported),
      selectedComponentId: undefined,
      messages: ["JSON 项目导入完成。", ...(imported.messages || [])].slice(0, 8)
    });
  }

  function changeBoard(boardId: string) {
    setProject((current) => ({
      ...current,
      boardId,
      connections: [],
      messages: [`已切换板型：${getBoardDefinition(boardId).name}。请重新自动连接。`, ...current.messages].slice(0, 8)
    }));
  }

  function changePerfboard(perfboard: PerfboardConfig) {
    setProject((current) => ({
      ...current,
      perfboard,
      components: current.components.map((component) => ({
        ...component,
        boardCol: Math.min(component.boardCol, perfboard.cols - 1),
        boardRow: Math.min(component.boardRow, perfboard.rows - 1),
        x: boardMetrics.gridX + Math.min(component.boardCol, perfboard.cols - 1) * perfboard.cellSize,
        y: boardMetrics.gridY + Math.min(component.boardRow, perfboard.rows - 1) * perfboard.cellSize
      }))
    }));
  }

  function addCustomComponent(definition: ComponentDefinition) {
    setProject((current) => ({
      ...current,
      customComponents: [
        ...current.customComponents.filter((item) => item.type !== definition.type),
        { ...definition, category: definition.category || "自定义" }
      ],
      messages: [`已加入自定义组件：${definition.name}`, ...current.messages].slice(0, 8)
    }));
  }

  return (
    <div className="app-shell">
      <Toolbar project={project} onAutoAssign={autoAssign} onClear={clearProject} onImport={importProject} />
      <main className="workspace">
        <ComponentLibrary library={fullLibrary} onAdd={addComponent} />
        <CircuitCanvas
          board={currentBoard}
          perfboard={project.perfboard}
          library={fullLibrary}
          components={project.components}
          connections={project.connections}
          boardPosition={project.boardPosition}
          selectedComponentId={project.selectedComponentId}
          selectedBoard={selectedBoard}
          onSelectComponent={(id) => {
            setSelectedBoard(false);
            setProject((current) => ({ ...current, selectedComponentId: id }));
          }}
          onSelectBoard={() => {
            setSelectedBoard(true);
            setProject((current) => ({ ...current, selectedComponentId: undefined }));
          }}
          onMoveComponent={moveComponent}
          onMoveBoard={moveBoard}
        />
        <aside className="panel inspector">
          <BoardSettingsPanel
            boardId={project.boardId}
            perfboard={project.perfboard}
            onBoardChange={changeBoard}
            onPerfboardChange={changePerfboard}
          />
          <PropertyPanel
            component={selectedComponent}
            library={fullLibrary}
            connections={project.connections}
            boardPins={currentBoard.pins}
            onDelete={deleteComponent}
            onRotate={rotateComponent}
          />
          <PinPanel
            library={fullLibrary}
            boardPins={currentBoard.pins}
            components={project.components}
            connections={project.connections}
            messages={project.messages}
          />
          <CodeTestPanel
            code={project.codeTest || ""}
            boardPins={currentBoard.pins}
            components={project.components}
            connections={project.connections}
            library={fullLibrary}
            onCodeChange={(code) => setProject((current) => ({ ...current, codeTest: code }))}
          />
          <CustomComponentPanel
            customComponents={project.customComponents}
            onAddCustomComponent={addCustomComponent}
            onClearCustomComponents={() => setProject((current) => ({ ...current, customComponents: [], messages: ["已清空自定义组件。", ...current.messages].slice(0, 8) }))}
          />
        </aside>
      </main>
    </div>
  );
}
