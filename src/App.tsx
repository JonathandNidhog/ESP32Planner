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
import { validateConnection } from "./engine/connectionValidator";
import { boardMetrics, defaultBoardPosition } from "./engine/router";
import { clearSavedProject, loadProject, saveProject } from "./io/projectIO";
import type { ComponentDefinition, Connection, ConnectionEndpoint, PerfboardConfig, PlacedComponent, Point, ProjectState, Rotation } from "./models/types";

const maxPerfboardCols = 220;
const maxPerfboardRows = 160;
const defaultPerfboard: PerfboardConfig = { cols: 36, rows: 26, cellSize: 18 };

function makeDefaultProject(): ProjectState {
  return {
    name: "esp32-perfboard-plan",
    boardId: defaultBoardId,
    boardPosition: defaultBoardPosition,
    boardRotation: 0,
    perfboard: defaultPerfboard,
    components: [],
    customComponents: [],
    connections: [],
    messages: ["从左侧添加元器件，然后点击自动连接，或点击两个引脚手动连线。"],
    codeTest: ""
  };
}

function migrateConnection(connection: Partial<Connection>): Connection | undefined {
  if (connection.from && connection.to && connection.id && connection.color && connection.status) {
    return connection as Connection;
  }
  if (connection.componentId && connection.componentPinId && connection.esp32PinId) {
    return {
      id: connection.id || `legacy-${connection.componentId}-${connection.componentPinId}-${connection.esp32PinId}`,
      from: { kind: "esp32", pinId: connection.esp32PinId },
      to: { kind: "component", componentId: connection.componentId, pinId: connection.componentPinId },
      color: connection.color || "#2563eb",
      status: connection.warning ? "warning" : "ok",
      message: connection.warning,
      warning: connection.warning
    };
  }
  return undefined;
}

function normalizeProject(project?: Partial<ProjectState>): ProjectState {
  const migratedConnections = (project?.connections || []).map((connection) => migrateConnection(connection)).filter(Boolean) as Connection[];
  return {
    ...makeDefaultProject(),
    ...project,
    boardId: project?.boardId || defaultBoardId,
    boardPosition: { ...defaultBoardPosition, ...(project?.boardPosition || {}) },
    boardRotation: project?.boardRotation || 0,
    perfboard: { ...defaultPerfboard, ...(project?.perfboard || {}) },
    customComponents: project?.customComponents || [],
    connections: migratedConnections,
    selectedConnectionId: undefined,
    messages: project?.messages || ["从左侧添加元器件，然后点击自动连接，或点击两个引脚手动连线。"],
    codeTest: project?.codeTest || ""
  };
}

function createComponent(type: string, index: number, perfboard: PerfboardConfig): PlacedComponent {
  const col = Math.min(perfboard.cols - 2, 3 + (index % 4) * 8);
  const row = Math.min(perfboard.rows - 2, 3 + Math.floor(index / 4) * 6);
  return createComponentAt(type, index, perfboard, col, row);
}

function createComponentAt(type: string, index: number, perfboard: PerfboardConfig, col: number, row: number): PlacedComponent {
  const boardCol = Math.max(0, Math.min(col, perfboard.cols - 1));
  const boardRow = Math.max(0, Math.min(row, perfboard.rows - 1));
  return {
    id: `${type}-${Date.now().toString(36)}-${index}`,
    type,
    boardCol,
    boardRow,
    x: boardMetrics.gridX + boardCol * perfboard.cellSize,
    y: boardMetrics.gridY + boardRow * perfboard.cellSize,
    rotation: 0,
    attrs: {}
  };
}

function endpointId(endpoint: ConnectionEndpoint) {
  return `${endpoint.kind}-${endpoint.componentId || "board"}-${endpoint.pinId}`;
}

export default function App() {
  const [project, setProject] = useState<ProjectState>(() => normalizeProject(loadProject()));
  const [selectedBoard, setSelectedBoard] = useState(false);
  const [manualWireStart, setManualWireStart] = useState<ConnectionEndpoint | undefined>();

  const currentBoard = useMemo(() => getBoardDefinition(project.boardId), [project.boardId]);
  const fullLibrary = useMemo(() => [...componentLibrary, ...project.customComponents], [project.customComponents]);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const selectedComponent = useMemo(
    () => project.components.find((item) => item.id === project.selectedComponentId),
    [project.components, project.selectedComponentId]
  );

  const selectedConnection = useMemo(
    () => project.connections.find((item) => item.id === project.selectedConnectionId),
    [project.connections, project.selectedConnectionId]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (editing || (event.key !== "Delete" && event.key !== "Backspace")) return;

      if (project.selectedConnectionId) {
        event.preventDefault();
        deleteConnection(project.selectedConnectionId);
        return;
      }

      if (project.selectedComponentId) {
        event.preventDefault();
        deleteComponent(project.selectedComponentId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project.selectedComponentId, project.selectedConnectionId]);

  function addComponent(type: string) {
    const definition = fullLibrary.find((item) => item.type === type);
    setProject((current) => ({
      ...current,
      components: [...current.components, createComponent(type, current.components.length, current.perfboard)],
      messages: [`已添加：${definition?.name || type}。可拖到万能板孔位上，再执行自动连接或手动连线。`, ...current.messages].slice(0, 8)
    }));
  }

  function addComponentAt(type: string, col: number, row: number) {
    const definition = fullLibrary.find((item) => item.type === type);
    setProject((current) => ({
      ...current,
      components: [...current.components, createComponentAt(type, current.components.length, current.perfboard, col, row)],
      messages: [`已在 C${col}, R${row} 添加：${definition?.name || type}。`, ...current.messages].slice(0, 8)
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

  function rotateBoard() {
    const rotations: Rotation[] = [0, 90, 180, 270];
    setProject((current) => {
      const nextIndex = (rotations.indexOf(current.boardRotation) + 1) % rotations.length;
      return {
        ...current,
        boardRotation: rotations[nextIndex],
        messages: [`开发板已旋转到 ${rotations[nextIndex]}°。`, ...current.messages].slice(0, 8)
      };
    });
  }

  function deleteComponent(id: string) {
    setProject((current) => ({
      ...current,
      components: current.components.filter((component) => component.id !== id),
      connections: current.connections.filter(
        (connection) => connection.from.componentId !== id && connection.to.componentId !== id
      ),
      selectedComponentId: undefined,
      selectedConnectionId: undefined,
      messages: [`已删除组件：${id}`, ...current.messages].slice(0, 8)
    }));
  }

  function deleteConnection(id: string) {
    setProject((current) => ({
      ...current,
      connections: current.connections.filter((connection) => connection.id !== id),
      selectedConnectionId: undefined,
      messages: [`已删除连线：${id}`, ...current.messages].slice(0, 8)
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

  function interactComponent(id: string) {
    setProject((current) => ({
      ...current,
      components: current.components.map((component) => {
        if (component.id !== id) return component;
        const definition = fullLibrary.find((item) => item.type === component.type);
        const kind = definition?.visual?.kind;
        if (kind === "button" || kind === "key-switch") {
          return { ...component, attrs: { ...component.attrs, pressed: !component.attrs?.pressed } };
        }
        if (kind === "potentiometer") {
          return { ...component, attrs: { ...component.attrs, angle: (Number(component.attrs?.angle || 0) + 45) % 360 } };
        }
        if (kind === "joystick") {
          const currentX = Number(component.attrs?.joyX || 0);
          const nextX = currentX >= 14 ? -14 : currentX + 14;
          return { ...component, attrs: { ...component.attrs, joyX: nextX, joyY: nextX === 0 ? 0 : 8 } };
        }
        return component;
      })
    }));
  }

  function autoAssign() {
    const result = autoAssignPins(project.components, currentBoard.pins, project.customComponents, project.connections.filter((item) => item.manual));
    setProject((current) => ({
      ...current,
      connections: result.connections,
      selectedConnectionId: undefined,
      messages: result.messages
    }));
  }

  function addWaypoint(connectionId: string, point: Point) {
    setProject((current) => ({
      ...current,
      connections: current.connections.map((connection) =>
        connection.id === connectionId
          ? { ...connection, waypoints: [...(connection.waypoints || []), { x: Math.round(point.x), y: Math.round(point.y) }] }
          : connection
      ),
      selectedConnectionId: connectionId,
      messages: ["已添加线固定点，可拖动黄色圆点整理线的位置。", ...current.messages].slice(0, 8)
    }));
  }

  function moveWaypoint(connectionId: string, index: number, point: Point) {
    setProject((current) => ({
      ...current,
      connections: current.connections.map((connection) => {
        if (connection.id !== connectionId) return connection;
        const waypoints = [...(connection.waypoints || [])];
        waypoints[index] = { x: Math.round(point.x), y: Math.round(point.y) };
        return { ...connection, waypoints };
      })
    }));
  }

  function handlePinClick(endpoint: ConnectionEndpoint) {
    if (!manualWireStart) {
      setManualWireStart(endpoint);
      setProject((current) => ({
        ...current,
        messages: [`已选择起点：${endpoint.kind === "esp32" ? endpoint.pinId : `${endpoint.componentId}.${endpoint.pinId}`}，请点击终点。`, ...current.messages].slice(0, 8)
      }));
      return;
    }

    const validation = validateConnection(manualWireStart, endpoint, currentBoard.pins, project.components, fullLibrary);
    if (!validation.ok) {
      setManualWireStart(undefined);
      setProject((current) => ({
        ...current,
        messages: [`手动连线失败：${validation.message}`, ...current.messages].slice(0, 8)
      }));
      return;
    }

    const connection: Connection = {
      id: `manual-${endpointId(manualWireStart)}-${endpointId(endpoint)}-${Date.now().toString(36)}`,
      from: manualWireStart,
      to: endpoint,
      color: validation.color,
      status: validation.severity,
      message: validation.message,
      manual: true
    };

    setManualWireStart(undefined);
    setProject((current) => ({
      ...current,
      connections: [...current.connections, connection],
      selectedConnectionId: connection.id,
      selectedComponentId: undefined,
      messages: [`手动连线完成：${validation.message}`, ...current.messages].slice(0, 8)
    }));
  }

  function clearProject() {
    clearSavedProject();
    setManualWireStart(undefined);
    setProject(makeDefaultProject());
  }

  function importProject(imported: ProjectState) {
    setManualWireStart(undefined);
    setProject({
      ...normalizeProject(imported),
      selectedComponentId: undefined,
      selectedConnectionId: undefined,
      messages: ["JSON 项目导入完成。", ...(imported.messages || [])].slice(0, 8)
    });
  }

  function changeBoard(boardId: string) {
    setProject((current) => ({
      ...current,
      boardId,
      connections: [],
      selectedConnectionId: undefined,
      messages: [`已切换板型：${getBoardDefinition(boardId).name}。请重新自动连接。`, ...current.messages].slice(0, 8)
    }));
  }

  function changePerfboard(perfboard: PerfboardConfig) {
    const nextPerfboard = {
      cols: Math.max(8, Math.min(maxPerfboardCols, perfboard.cols)),
      rows: Math.max(8, Math.min(maxPerfboardRows, perfboard.rows)),
      cellSize: Math.max(12, Math.min(26, perfboard.cellSize))
    };

    setProject((current) => ({
      ...current,
      perfboard: nextPerfboard,
      components: current.components.map((component) => ({
        ...component,
        boardCol: Math.min(component.boardCol, nextPerfboard.cols - 1),
        boardRow: Math.min(component.boardRow, nextPerfboard.rows - 1),
        x: boardMetrics.gridX + Math.min(component.boardCol, nextPerfboard.cols - 1) * nextPerfboard.cellSize,
        y: boardMetrics.gridY + Math.min(component.boardRow, nextPerfboard.rows - 1) * nextPerfboard.cellSize
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
      <Toolbar
        project={project}
        manualWireStartActive={Boolean(manualWireStart)}
        onAutoAssign={autoAssign}
        onClear={clearProject}
        onCancelManualWire={() => setManualWireStart(undefined)}
        onImport={importProject}
      />
      <main className="workspace">
        <ComponentLibrary library={fullLibrary} onAdd={addComponent} />
        <CircuitCanvas
          board={currentBoard}
          perfboard={project.perfboard}
          library={fullLibrary}
          components={project.components}
          connections={project.connections}
          boardPosition={project.boardPosition}
          boardRotation={project.boardRotation}
          selectedComponentId={project.selectedComponentId}
          selectedBoard={selectedBoard}
          selectedConnectionId={project.selectedConnectionId}
          manualWireStart={manualWireStart}
          onSelectComponent={(id) => {
            setSelectedBoard(false);
            setProject((current) => ({ ...current, selectedComponentId: id, selectedConnectionId: undefined }));
          }}
          onSelectBoard={() => {
            setSelectedBoard(true);
            setProject((current) => ({ ...current, selectedComponentId: undefined, selectedConnectionId: undefined }));
          }}
          onSelectConnection={(id) => {
            setSelectedBoard(false);
            setProject((current) => ({ ...current, selectedConnectionId: id, selectedComponentId: undefined }));
          }}
          onMoveComponent={moveComponent}
          onMoveBoard={moveBoard}
          onPinClick={handlePinClick}
          onAddComponentAt={addComponentAt}
          onPerfboardResize={(cols, rows) => changePerfboard({ ...project.perfboard, cols, rows })}
          onAddWaypoint={addWaypoint}
          onMoveWaypoint={moveWaypoint}
        />
        <aside className="panel inspector">
          <BoardSettingsPanel
            boardId={project.boardId}
            boardRotation={project.boardRotation}
            perfboard={project.perfboard}
            onBoardChange={changeBoard}
            onBoardRotate={rotateBoard}
            onPerfboardChange={changePerfboard}
          />
          <PropertyPanel
            component={selectedComponent}
            selectedConnection={selectedConnection}
            components={project.components}
            library={fullLibrary}
            connections={project.connections}
            boardPins={currentBoard.pins}
            onDelete={deleteComponent}
            onDeleteConnection={deleteConnection}
            onRotate={rotateComponent}
            onInteract={interactComponent}
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
