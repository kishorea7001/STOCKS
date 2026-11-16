'use client';

import React from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';

interface DataPoint {
  day: string;
  value: number;
}

const chartData: DataPoint[] = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 75 },
  { day: 'Wed', value: 95 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 50 },
  { day: 'Sat', value: 62 },
  { day: 'Sun', value: 88 },
];

/**
 * Generates a smooth cubic bezier SVG curve through data points
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Control points using Catmull-Rom to cubic Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 5.5;
    const cp1y = p1.y + (p2.y - p0.y) / 5.5;
    const cp2x = p2.x - (p3.x - p1.x) / 5.5;
    const cp2y = p2.y - (p3.y - p1.y) / 5.5;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export function DashboardOverviewCard({ className = '' }: { className?: string }) {
  // Chart dimensions inside SVG viewBox: 0 0 700 220
  const svgWidth = 700;
  const startX = 55;
  const endX = 665;
  const baselineY = 175; // y for 0
  const midY = 100;      // y for 50
  const topY = 25;       // y for 100
  const chartHeightRange = baselineY - topY; // 150px

  const stepX = (endX - startX) / (chartData.length - 1);

  // Compute (x, y) coordinates for each point
  const points = chartData.map((d, index) => {
    const x = startX + index * stepX;
    const y = baselineY - (d.value / 100) * chartHeightRange;
    return { x, y, ...d };
  });

  const smoothCurve = generateSmoothPath(points);
  const areaPath = `${smoothCurve} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

  return (
    <section aria-label="Dashboard Overview" className={className}>
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] p-6 md:p-7">
        {/* Header: Blue bar-chart icon, Title, Right-side dropdown */}
        <div className="flex items-center justify-between pb-4 md:pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h3>
          </div>

          {/* Right side dropdown: This Month ▼ */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs md:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>This Month</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Smooth Line Chart Container */}
        <div className="w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${svgWidth} 220`}
            className="w-full h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Light blue filled gradient underneath the line */}
              <linearGradient
                id="overview-area-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.0" />
              </linearGradient>

              {/* Soft glow for data points */}
              <filter id="point-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="2"
                  floodColor="#2563EB"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            {/* Subtle Grid Lines at 100, 50, 0 */}
            <line
              x1={startX}
              y1={topY}
              x2={endX}
              y2={topY}
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            <line
              x1={startX}
              y1={midY}
              x2={endX}
              y2={midY}
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            <line
              x1={startX}
              y1={baselineY}
              x2={endX}
              y2={baselineY}
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />

            {/* Y-Axis Labels: 100, 50, 0 */}
            <text
              x="38"
              y={topY + 4}
              textAnchor="end"
              className="text-[11.5px] font-medium fill-slate-400 select-none"
            >
              100
            </text>
            <text
              x="38"
              y={midY + 4}
              textAnchor="end"
              className="text-[11.5px] font-medium fill-slate-400 select-none"
            >
              50
            </text>
            <text
              x="38"
              y={baselineY + 4}
              textAnchor="end"
              className="text-[11.5px] font-medium fill-slate-400 select-none"
            >
              0
            </text>

            {/* Filled Area Underneath Curve */}
            <path d={areaPath} fill="url(#overview-area-gradient)" />

            {/* Smooth Curved Blue Line */}
            <path
              d={smoothCurve}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Blue Data Points & X-Axis Labels */}
            {points.map((pt, i) => (
              <g key={i}>
                {/* Outer subtle glow circle on hover */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="url(#point-glow)"
                  className="transition-transform duration-200 hover:scale-125 cursor-pointer"
                />

                {/* X-Axis Day Label: Mon | Tue | Wed | Thu | Fri | Sat | Sun */}
                <text
                  x={pt.x}
                  y="204"
                  textAnchor="middle"
                  className="text-[12px] font-medium fill-slate-500 select-none"
                >
                  {pt.day}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

export default DashboardOverviewCard;
