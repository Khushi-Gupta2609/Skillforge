import React from 'react';

interface SkillData {
  skill: string;
  level: number;
  maxLevel: number;
}

interface SkillRadarChartProps {
  skills: SkillData[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ skills }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // Create points for each skill
  const skillPoints = skills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const skillRadius = (skill.level / skill.maxLevel) * radius;
    const x = center + skillRadius * Math.cos(angle);
    const y = center + skillRadius * Math.sin(angle);
    return { x, y, skill: skill.skill, level: skill.level };
  });

  // Create grid lines
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const levelRadius = (level / levels) * radius;
    const points = skills.map((_, index) => {
      const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    
    gridLines.push(
      <polygon
        key={level}
        points={points}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
        className="dark:stroke-gray-600"
      />
    );
  }

  // Create axis lines
  const axisLines = skills.map((_, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
        className="dark:stroke-gray-600"
      />
    );
  });

  // Create skill labels
  const skillLabels = skills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    
    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
      >
        {skill.skill}
      </text>
    );
  });

  // Create skill polygon
  const skillPolygonPoints = skillPoints.map(point => `${point.x},${point.y}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skill Assessment</h3>
      
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid lines */}
          {gridLines}
          
          {/* Axis lines */}
          {axisLines}
          
          {/* Skill polygon */}
          <polygon
            points={skillPolygonPoints}
            fill="rgba(139, 92, 246, 0.2)"
            stroke="rgb(139, 92, 246)"
            strokeWidth="2"
          />
          
          {/* Skill points */}
          {skillPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(139, 92, 246)"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${point.skill}: ${point.level}/10`}</title>
            </circle>
          ))}
          
          {/* Skill labels */}
          {skillLabels}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">{skill.skill}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {skill.level}/{skill.maxLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};