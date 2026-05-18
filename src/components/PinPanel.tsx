import { describeEndpoint } from "../engine/connectionValidator";
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
        <p className="hint">添加组件后点击“自动连接全部组件”，也可以点击任意两个引脚手动连线。</p>
      ) : (
        <div className="pin-table">
          {connections.map((connection) => (
            <div className={`pin-row ${connection.status}`} key={connection.id}>
              <span className="wire-dot" style={{ background: connection.status === "error" ? "#dc2626" : connection.color }} />
              <span>{describeEndpoint(connection.from, boardPins, components, library)}</span>
              <strong>→ {describeEndpoint(connection.to, boardPins, components, library)}</strong>
            </div>
          ))}
        </div>
      )}
      <h2>检查消息</h2>
      <ul className="message-list">
        {messages.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
      </ul>
    </section>
  );
}
