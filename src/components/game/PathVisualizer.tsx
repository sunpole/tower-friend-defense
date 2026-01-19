import React from 'react';
import { Position, Enemy, CELL_SIZE } from '@/game/types';

interface PathVisualizerProps {
  enemies: Enemy[];
  showPath: boolean;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({ enemies, showPath }) => {
  if (!showPath) return null;

  return (
    <g className="path-visualizer">
      {enemies.map((enemy) => {
        if (!enemy.path || enemy.path.length === 0) return null;

        // Create path points from current position to end
        const pathPoints = enemy.path.slice(enemy.pathIndex);
        if (pathPoints.length < 2) return null;

        // Generate path string for SVG
        const pathString = pathPoints
          .map((point, index) => {
            const x = point.x * CELL_SIZE + CELL_SIZE / 2;
            const y = point.y * CELL_SIZE + CELL_SIZE / 2;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ');

        // Get enemy color for path
        const pathColor = enemy.type === 'simple' ? '#ef4444' :
                          enemy.type === 'fat' ? '#7c3aed' :
                          enemy.type === 'thin' ? '#22c55e' :
                          '#f59e0b';

        return (
          <g key={`path-${enemy.id}`}>
            {/* Path background (glow effect) */}
            <path
              d={pathString}
              fill="none"
              stroke={pathColor}
              strokeWidth={8}
              strokeOpacity={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main path line */}
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
            {/* Path waypoints */}
            {pathPoints.slice(1).map((point, index) => (
              <circle
                key={`waypoint-${enemy.id}-${index}`}
                cx={point.x * CELL_SIZE + CELL_SIZE / 2}
                cy={point.y * CELL_SIZE + CELL_SIZE / 2}
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
