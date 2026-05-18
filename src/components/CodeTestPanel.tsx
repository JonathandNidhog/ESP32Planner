import { analyzeArduinoCode } from "../engine/codeAnalyzer";
import type { ComponentDefinition, Connection, ESP32Pin, PlacedComponent } from "../models/types";

interface CodeTestPanelProps {
  code: string;
  boardPins: ESP32Pin[];
  components: PlacedComponent[];
  connections: Connection[];
  library: ComponentDefinition[];
  onCodeChange: (code: string) => void;
}

const sample = `#define LED_PIN 23
const int SDA_PIN = 21;
const int SCL_PIN = 22;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Wire.begin(SDA_PIN, SCL_PIN);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
}`;

export default function CodeTestPanel({ code, boardPins, components, connections, library, onCodeChange }: CodeTestPanelProps) {
  const issues = analyzeArduinoCode(code, boardPins, connections, components, library);

  return (
    <section className="panel-section">
      <h2>代码测试</h2>
      <p className="hint">静态检查 Arduino 风格代码里的 GPIO 使用是否与当前接线一致，不执行真实固件。</p>
      <textarea
        className="code-editor"
        value={code}
        placeholder={sample}
        onChange={(event) => onCodeChange(event.target.value)}
      />
      <div className="button-row">
        <button onClick={() => onCodeChange(sample)}>填入示例</button>
        <button onClick={() => onCodeChange("")}>清空代码</button>
      </div>
      <div className="code-issues">
        {issues.map((issue, index) => (
          <div key={`${issue.message}-${index}`} className={`code-issue ${issue.severity}`}>
            <strong>{issue.severity === "ok" ? "OK" : issue.severity === "error" ? "错误" : "警告"}</strong>
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
