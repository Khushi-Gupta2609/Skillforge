import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LearningData {
  date: string;
  hours: number;
  goals: number;
  roadmapSteps: number;
}

interface LearningChartProps {
  data: LearningData[];
}

export const LearningChart: React.FC<LearningChartProps> = ({ data }) => {
  const maxHours = Math.max(...data.map(d => d.hours));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  const points = data.map((item, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
    const y = chartHeight - padding - (item.hours / maxHours) * (chartHeight - 2 * padding);
    return { x, y, ...item };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+12% this week</span>
        </div>
      </div>

      <div className="mb-4">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = chartHeight - padding - (i / 4) * (chartHeight - 2 * padding);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  className="dark:stroke-gray-600"
                />
                <text
                  x={padding - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {Math.round((i / 4) * maxHours)}h
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaData}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(139, 92, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(139, 92, 246)"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${point.date}: ${point.hours} hours`}</title>
            </circle>
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {point.date}
            </text>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.reduce((sum, d) => sum + d.hours, 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.reduce((sum, d) => sum + d.goals, 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Goals Set</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.reduce((sum, d) => sum + d.roadmapSteps, 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Steps Completed</div>
        </div>
      </div>
    </div>
  );
};