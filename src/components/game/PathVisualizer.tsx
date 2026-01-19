import React from 'react';
import { Enemy } from '@/game/types';

interface PathVisualizerProps {
  enemies: Enemy[];
  showPath: boolean;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({ enemies, showPath }) => {
  if (!showPath) return null;

  return (
    <g className="path-visualizer" style={{ pointerEvents: 'none' }}>
      {enemies.map((enemy) => {
        if (!enemy.path || enemy.path.length === 0) return null;

        // enemy.path already contains PIXEL coordinates.
        const remaining = enemy.path.slice(enemy.pathIndex);
        if (remaining.length < 1) return null;

        const points = [{ x: enemy.x, y: enemy.y }, ...remaining];
        if (points.length < 2) return null;

        const pathString = points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ');

        const pathColor =
          enemy.type === 'simple'
            ? '#ef4444'
            : enemy.type === 'fat'
              ? '#7c3aed'
              : enemy.type === 'thin'
                ? '#22c55e'
                : '#f59e0b';

        return (
          <g key={`path-${enemy.id}`}>
            <path
              d={pathString}
              fill="none"
              stroke={pathColor}
              strokeWidth={8}
              strokeOpacity={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathString}
              fill="none"
              stroke={pathColor}
              strokeWidth={2}
              strokeOpacity={0.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
            {points.slice(1).map((p, index) => (
              <circle
                key={`waypoint-${enemy.id}-${index}`}
                cx={p.x}
                cy={p.y}
                r={3}
                fill={pathColor}
                fillOpacity={0.4}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};
