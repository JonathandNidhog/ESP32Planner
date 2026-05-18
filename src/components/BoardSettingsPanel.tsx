import { esp32Boards } from "../data/esp32Boards";
import type { PerfboardConfig, Rotation } from "../models/types";

interface BoardSettingsPanelProps {
  boardId: string;
  boardRotation: Rotation;
  perfboard: PerfboardConfig;
  onBoardChange: (boardId: string) => void;
  onBoardRotate: () => void;
  onPerfboardChange: (config: PerfboardConfig) => void;
}

const maxCols = 220;
const maxRows = 160;

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export default function BoardSettingsPanel({ boardId, boardRotation, perfboard, onBoardChange, onBoardRotate, onPerfboardChange }: BoardSettingsPanelProps) {
  const selectedBoard = esp32Boards.find((board) => board.id === boardId) || esp32Boards[0];

  function updatePerfboard(partial: Partial<PerfboardConfig>) {
    onPerfboardChange({
      cols: clampNumber(partial.cols ?? perfboard.cols, 8, maxCols),
      rows: clampNumber(partial.rows ?? perfboard.rows, 8, maxRows),
      cellSize: clampNumber(partial.cellSize ?? perfboard.cellSize, 12, 26)
    });
  }

  return (
    <section className="panel-section">
      <h2>板卡 / 万能板</h2>
      <label className="field-label">
        ESP32 型号
        <select value={boardId} onChange={(event) => onBoardChange(event.target.value)}>
          {esp32Boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
        </select>
      </label>
      <p className="hint">{selectedBoard.description}</p>
      <div className="button-row">
        <button onClick={onBoardRotate}>旋转开发板 90°</button>
        <span className="custom-count">开发板 {boardRotation}°</span>
      </div>
      <div className="settings-grid">
        <label>
          列数 / 最大 {maxCols}
          <input type="number" min={8} max={maxCols} value={perfboard.cols} onChange={(event) => updatePerfboard({ cols: Number(event.target.value) })} />
        </label>
        <label>
          行数 / 最大 {maxRows}
          <input type="number" min={8} max={maxRows} value={perfboard.rows} onChange={(event) => updatePerfboard({ rows: Number(event.target.value) })} />
        </label>
        <label>
          显示孔距
          <input type="number" min={12} max={26} value={perfboard.cellSize} onChange={(event) => updatePerfboard({ cellSize: Number(event.target.value) })} />
        </label>
      </div>
      <p className="hint">也可以直接拖动画布中万能板的右边缘、下边缘或右下角来调整行列数。</p>
    </section>
  );
}
