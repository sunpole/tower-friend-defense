import React from 'react';
import { Enemy } from '@/game/types';
import { configStore } from '@/game/configStore';

interface PathVisualizerProps {
  enemies: Enemy[];
  showPath: boolean;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({ enemies, showPath }) => {
  if (!showPath || enemies.length === 0) return null;

  return (
    <g className="path-visualizer" style={{ pointerEvents: 'none' }}>
      {enemies.map((enemy) => {
        if (!enemy.path || enemy.path.length === 0) return null;

        // Get remaining path from current pathIndex
        const remaining = enemy.path.slice(enemy.pathIndex);
        if (remaining.length === 0) return null;

        // Build points: current position + remaining waypoints
        const points = [{ x: enemy.x, y: enemy.y }, ...remaining];
        if (points.length < 2) return null;

        const pathString = points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ');

        const pathColor = configStore.getConfig().enemies[enemy.type]?.color || '#ef4444';

        return (
          <g key={`path-${enemy.id}`}>
            {/* Outer glow */}
            <path
              d={pathString}
              fill="none"
              stroke={pathColor}
              strokeWidth={10}
              strokeOpacity={0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main path line */}
            <path
              d={pathString}
              fill="none"
              stroke={pathColor}
              strokeWidth={2}
              strokeOpacity={0.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
            />
            {/* Waypoint dots */}
            {remaining.map((p, index) => (
              <circle
                key={`waypoint-${enemy.id}-${index}`}
                cx={p.x}
                cy={p.y}
                r={2}
                fill={pathColor}
                fillOpacity={0.5}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};