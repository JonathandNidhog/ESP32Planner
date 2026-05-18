import { boardMetrics } from "../../engine/router";
import type { PerfboardConfig } from "../../models/types";

interface PerfboardGridProps {
  perfboard: PerfboardConfig;
  onResize: (cols: number, rows: number) => void;
}

const maxCols = 220;
const maxRows = 160;
const minCols = 8;
const minRows = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function PerfboardGrid({ perfboard, onResize }: PerfboardGridProps) {
  const { gridX, gridY } = boardMetrics;
  const width = perfboard.cols * perfboard.cellSize;
  const height = perfboard.rows * perfboard.cellSize;

  function pointerToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svg.getScreenCTM()?.inverse());
  }

  function startResize(event: React.PointerEvent<SVGElement>, mode: "cols" | "rows" | "both") {
    event.stopPropagation();
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    const move = (moveEvent: PointerEvent) => {
      const point = pointerToSvg(svg, moveEvent.clientX, moveEvent.clientY);
      const nextCols = mode === "rows" ? perfboard.cols : clamp(Math.round((point.x - gridX) / perfboard.cellSize) + 1, minCols, maxCols);
      const nextRows = mode === "cols" ? perfboard.rows : clamp(Math.round((point.y - gridY) / perfboard.cellSize) + 1, minRows, maxRows);
      onResize(nextCols, nextRows);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

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
        万能板规划区 - {perfboard.cols} x {perfboard.rows}，右/下边缘可拖动调整行列
      </text>
      <g className="perfboard-resize-handle" onPointerDown={(event) => startResize(event, "cols")}>
        <rect x={gridX + width + 8} y={gridY - 8} width={16} height={height + 16} rx={8} fill="#2563eb" opacity={0.16} />
        <text x={gridX + width + 16} y={gridY + height / 2} textAnchor="middle" fill="#2563eb" fontSize={12} fontWeight={900} transform={`rotate(90, ${gridX + width + 16}, ${gridY + height / 2})`}>拖动改列数</text>
      </g>
      <g className="perfboard-resize-handle" onPointerDown={(event) => startResize(event, "rows")}>
        <rect x={gridX - 8} y={gridY + height + 8} width={width + 16} height={16} rx={8} fill="#2563eb" opacity={0.16} />
        <text x={gridX + width / 2} y={gridY + height + 21} textAnchor="middle" fill="#2563eb" fontSize={12} fontWeight={900}>拖动改行数</text>
      </g>
      <g className="perfboard-resize-corner" onPointerDown={(event) => startResize(event, "both")}>
        <rect x={gridX + width + 6} y={gridY + height + 6} width={22} height={22} rx={7} fill="#2563eb" opacity={0.85} />
        <path d={`M${gridX + width + 12},${gridY + height + 23} L${gridX + width + 23},${gridY + height + 12}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
}
