import React from 'react';
import { Enemy, ENEMY_CONFIGS } from '@/game/types';

interface EnemyRendererProps {
  enemies: Enemy[];
}

export const EnemyRenderer: React.FC<EnemyRendererProps> = ({ enemies }) => {
  return (
    <g>
      {enemies.map((enemy) => {
        const config = ENEMY_CONFIGS[enemy.type];
        const size = enemy.type === 'fat' ? 24 : enemy.type === 'thin' ? 12 : 16;
        const healthPercent = enemy.hp / enemy.maxHp;
        
        return (
          <g key={enemy.id}>
            {/* Enemy body */}
            <circle
              cx={enemy.x}
              cy={enemy.y}
              r={size}
              fill={config.color}
              stroke="#000"
              strokeWidth={2}
            />
            
            {/* Health bar background */}
            <rect
              x={enemy.x - 15}
              y={enemy.y - size - 10}
              width={30}
              height={4}
              fill="#333"
              rx={2}
            />
            
            {/* Health bar */}
            <rect
              x={enemy.x - 15}
              y={enemy.y - size - 10}
              width={30 * healthPercent}
              height={4}
              fill={healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444'}
              rx={2}
            />
          </g>
        );
      })}
    </g>
  );
};
