import { esp32Boards } from "../data/esp32Boards";
import type { PerfboardConfig } from "../models/types";

interface BoardSettingsPanelProps {
  boardId: string;
  perfboard: PerfboardConfig;
  onBoardChange: (boardId: string) => void;
  onPerfboardChange: (config: PerfboardConfig) => void;
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export default function BoardSettingsPanel({ boardId, perfboard, onBoardChange, onPerfboardChange }: BoardSettingsPanelProps) {
  const selectedBoard = esp32Boards.find((board) => board.id === boardId) || esp32Boards[0];

  function updatePerfboard(partial: Partial<PerfboardConfig>) {
    onPerfboardChange({
      cols: clampNumber(partial.cols ?? perfboard.cols, 8, 80),
      rows: clampNumber(partial.rows ?? perfboard.rows, 8, 60),
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
      <div className="settings-grid">
        <label>
          列数
          <input type="number" min={8} max={80} value={perfboard.cols} onChange={(event) => updatePerfboard({ cols: Number(event.target.value) })} />
        </label>
        <label>
          行数
          <input type="number" min={8} max={60} value={perfboard.rows} onChange={(event) => updatePerfboard({ rows: Number(event.target.value) })} />
        </label>
        <label>
          显示孔距
          <input type="number" min={12} max={26} value={perfboard.cellSize} onChange={(event) => updatePerfboard({ cellSize: Number(event.target.value) })} />
        </label>
      </div>
    </section>
  );
}
