import React, { memo } from 'react';
import { Enemy } from '@/game/types';
import { ENEMY_CONFIGS } from '@/game/config';

interface EnemyRendererProps {
  enemies: Enemy[];
}

const EnemySprite = memo<{ enemy: Enemy }>(({ enemy }) => {
  const config = ENEMY_CONFIGS[enemy.type];
  const size = enemy.type === 'fat' || enemy.type === 'armored' 
    ? 24 
    : enemy.type === 'thin' || enemy.type === 'ghost' 
      ? 12 
      : 16;
  const healthPercent = enemy.hp / enemy.maxHp;

  return (
    <g>
      {/* Enemy body */}
      <circle
        cx={enemy.x}
        cy={enemy.y}
        r={size}
        fill={config.color}
        stroke="#000"
        strokeWidth={2}
        opacity={enemy.type === 'ghost' ? 0.6 : 1}
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
});

EnemySprite.displayName = 'EnemySprite';

export const EnemyRenderer: React.FC<EnemyRendererProps> = memo(({ enemies }) => {
  return (
    <g>
      {enemies.map((enemy) => (
        <EnemySprite key={enemy.id} enemy={enemy} />
      ))}
    </g>
  );
});