import { describeEndpoint } from "../engine/connectionValidator";
import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";

interface PropertyPanelProps {
  component?: PlacedComponent;
  selectedConnection?: Connection;
  components: PlacedComponent[];
  library: ComponentDefinition[];
  connections: Connection[];
  boardPins: ESP32Pin[];
  onDelete: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onRotate: (id: string) => void;
  onInteract: (id: string) => void;
}

export default function PropertyPanel({
  component,
  selectedConnection,
  components,
  library,
  connections,
  boardPins,
  onDelete,
  onDeleteConnection,
  onRotate,
  onInteract
}: PropertyPanelProps) {
  if (selectedConnection) {
    return (
      <section className="panel-section">
        <h2>连线属性</h2>
        <div className="property-grid">
          <span>起点</span><strong>{describeEndpoint(selectedConnection.from, boardPins, components, library)}</strong>
          <span>终点</span><strong>{describeEndpoint(selectedConnection.to, boardPins, components, library)}</strong>
          <span>状态</span><strong>{selectedConnection.status}</strong>
          <span>类型</span><strong>{selectedConnection.manual ? "手动" : "自动"}</strong>
        </div>
        <p className="hint">{selectedConnection.message || selectedConnection.warning || "连线正常。"}</p>
        <div className="button-row">
          <button className="danger" onClick={() => onDeleteConnection(selectedConnection.id)}>删除这条线</button>
        </div>
      </section>
    );
  }

  if (!component) {
    return (
      <section className="panel-section">
        <h2>属性</h2>
        <p className="hint">选择一个组件或连线查看属性。点击画布空白处取消选择。</p>
      </section>
    );
  }

  const definition = library.find((item) => item.type === component.type);
  const canInteract = ["button", "potentiometer", "joystick", "key-switch"].includes(definition?.visual?.kind || "");

  return (
    <section className="panel-section">
      <h2>属性</h2>
      <div className="property-grid">
        <span>实例</span><strong>{component.id}</strong>
        <span>类型</span><strong>{definition?.name || component.type}</strong>
        <span>孔位</span><strong>C{component.boardCol}, R{component.boardRow}</strong>
        <span>占用</span><strong>{definition?.footprint.cols} x {definition?.footprint.rows}</strong>
        <span>旋转</span><strong>{component.rotation}°</strong>
      </div>
      <div className="button-row">
        <button onClick={() => onRotate(component.id)}>旋转 90°</button>
        {canInteract && <button onClick={() => onInteract(component.id)}>交互/切换状态</button>}
        <button className="danger" onClick={() => onDelete(component.id)}>删除组件</button>
      </div>
      {definition && (
        <>
          <p className="hint">{definition.description}</p>
          <div className="pin-detail-list">
            {definition.pins.map((pin) => {
              const connection = connections.find(
                (item) =>
                  (item.from.kind === "component" && item.from.componentId === component.id && item.from.pinId === pin.id) ||
                  (item.to.kind === "component" && item.to.componentId === component.id && item.to.pinId === pin.id)
              );
              const other = connection
                ? connection.from.kind === "component" && connection.from.componentId === component.id && connection.from.pinId === pin.id
                  ? connection.to
                  : connection.from
                : undefined;
              return (
                <div className="pin-detail" key={pin.id}>
                  <strong>{pin.label}</strong>
                  <span>{pin.note || pin.required.join("/")}</span>
                  <em>{other ? `→ ${describeEndpoint(other, boardPins, components, library)}` : "未连接"}</em>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
