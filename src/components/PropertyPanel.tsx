import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";

interface PropertyPanelProps {
  component?: PlacedComponent;
  library: ComponentDefinition[];
  connections: Connection[];
  boardPins: ESP32Pin[];
  onDelete: (id: string) => void;
  onRotate: (id: string) => void;
}

export default function PropertyPanel({ component, library, connections, boardPins, onDelete, onRotate }: PropertyPanelProps) {
  if (!component) {
    return (
      <section className="panel-section">
        <h2>属性</h2>
        <p className="hint">选择一个组件查看属性。点击画布空白处取消选择。</p>
      </section>
    );
  }

  const definition = library.find((item) => item.type === component.type);

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
        <button className="danger" onClick={() => onDelete(component.id)}>删除组件</button>
      </div>
      {definition && (
        <>
          <p className="hint">{definition.description}</p>
          <div className="pin-detail-list">
            {definition.pins.map((pin) => {
              const connection = connections.find((item) => item.componentId === component.id && item.componentPinId === pin.id);
              const espPin = boardPins.find((item) => item.id === connection?.esp32PinId);
              return (
                <div className="pin-detail" key={pin.id}>
                  <strong>{pin.label}</strong>
                  <span>{pin.note || pin.required.join("/")}</span>
                  <em>{espPin ? `→ ${espPin.label}` : "未连接"}</em>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
