import * as React from "react";

export interface RevenueChartProps {
  data: number[];
  height?: number;
  dark?: boolean;
}

/**
 * Minimal SVG line + area chart in champagne gold.
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  height = 160,
  dark = false,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 520;
  const h = height;
  const pad = 18;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts: [number, number][] = data.map((v, i) => [
    pad + i * stepX,
    h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2),
  ]);
  const path = pts
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(" ");
  const last = pts[pts.length - 1];
  const area = `${path} L${last[0]},${h - pad} L${pad},${h - pad} Z`;
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(28,35,51,0.07)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8965A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#B8965A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          x2={w - pad}
          y1={pad + f * (h - pad * 2)}
          y2={pad + f * (h - pad * 2)}
          stroke={grid}
          strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill="url(#goldArea)" />
      <path d={path} fill="none" stroke="#B8965A" strokeWidth={2} />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={i === pts.length - 1 ? 5 : 0}
          fill="#B8965A"
          stroke={dark ? "#2C3E5C" : "#FFFFFF"}
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
};
