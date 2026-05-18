import { boardMetrics } from "../../engine/router";
import type { PerfboardConfig } from "../../models/types";

interface PerfboardGridProps {
  perfboard: PerfboardConfig;
}

export default function PerfboardGrid({ perfboard }: PerfboardGridProps) {
  const { gridX, gridY } = boardMetrics;
  const width = perfboard.cols * perfboard.cellSize;
  const height = perfboard.rows * perfboard.cellSize;

  return (
    <g className="perfboard-grid">
      <rect x={gridX - 14} y={gridY - 14} width={width + 28} height={height + 28} rx={18} fill="#f8fafc" stroke="#cbd5e1" />
      {Array.from({ length: perfboard.rows }).map((_, row) =>
        Array.from({ length: perfboard.cols }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            cx={gridX + col * perfboard.cellSize}
            cy={gridY + row * perfboard.cellSize}
            r={Math.max(2.2, perfboard.cellSize * 0.18)}
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth={0.6}
          />
        ))
      )}
      <text x={gridX} y={gridY - 24} className="canvas-label">
        万能板规划区 - {perfboard.cols} x {perfboard.rows}，组件拖动会吸附孔位
      </text>
    </g>
  );
}
