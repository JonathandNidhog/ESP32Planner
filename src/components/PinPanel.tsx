import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";

interface PinPanelProps {
  library: ComponentDefinition[];
  boardPins: ESP32Pin[];
  components: PlacedComponent[];
  connections: Connection[];
  messages: string[];
}

export default function PinPanel({ library, boardPins, components, connections, messages }: PinPanelProps) {
  return (
    <section className="panel-section pin-panel">
      <h2>引脚分配</h2>
      {connections.length === 0 ? (
        <p className="hint">添加组件后点击“自动连接全部组件”。</p>
      ) : (
        <div className="pin-table">
          {connections.map((connection) => {
            const component = components.find((item) => item.id === connection.componentId);
            const definition = library.find((item) => item.type === component?.type);
            const componentPin = definition?.pins.find((pin) => pin.id === connection.componentPinId);
            const espPin = boardPins.find((pin) => pin.id === connection.esp32PinId);
            return (
              <div className="pin-row" key={connection.id}>
                <span className="wire-dot" style={{ background: connection.color }} />
                <span>{definition?.name || connection.componentId}.{componentPin?.label || connection.componentPinId}</span>
                <strong>{espPin?.label || connection.esp32PinId}</strong>
              </div>
            );
          })}
        </div>
      )}
      <h2>检查消息</h2>
      <ul className="message-list">
        {messages.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
      </ul>
    </section>
  );
}
