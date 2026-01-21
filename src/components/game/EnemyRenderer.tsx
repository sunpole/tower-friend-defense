import React, { memo } from 'react';
import { Enemy } from '@/game/types';
import { ENEMY_CONFIGS, BOSS_CONFIG } from '@/game/config';

interface EnemyRendererProps {
  enemies: Enemy[];
}

const EnemySprite = memo<{ enemy: Enemy }>(({ enemy }) => {
  const config = ENEMY_CONFIGS[enemy.type];
  
  // Base size calculation
  let baseSize = enemy.type === 'fat' || enemy.type === 'armored' 
    ? 24 
    : enemy.type === 'thin' || enemy.type === 'ghost' 
      ? 12 
      : 16;
  
  // Bosses are much bigger!
  const size = enemy.isBoss ? baseSize * BOSS_CONFIG.sizeMultiplier : baseSize;
  const healthPercent = enemy.hp / enemy.maxHp;

  return (
    <g>
      {/* Boss glow effect */}
      {enemy.isBoss && (
        <>
          <circle
            cx={enemy.x}
            cy={enemy.y}
            r={size + 12}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={3}
            opacity={0.6}
            className="animate-pulse"
          />
          <circle
            cx={enemy.x}
            cy={enemy.y}
            r={size + 6}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            opacity={0.8}
          />
        </>
      )}

      {/* Enemy body */}
      <circle
        cx={enemy.x}
        cy={enemy.y}
        r={size}
        fill={config.color}
        stroke={enemy.isBoss ? '#fbbf24' : '#000'}
        strokeWidth={enemy.isBoss ? 4 : 2}
        opacity={enemy.type === 'ghost' ? 0.6 : 1}
      />

      {/* Boss crown */}
      {enemy.isBoss && (
        <text
          x={enemy.x}
          y={enemy.y - size - 8}
          textAnchor="middle"
          fontSize={20}
        >
          👑
        </text>
      )}

      {/* Health bar background */}
      <rect
        x={enemy.x - (enemy.isBoss ? 25 : 15)}
        y={enemy.y - size - (enemy.isBoss ? 25 : 10)}
        width={enemy.isBoss ? 50 : 30}
        height={enemy.isBoss ? 6 : 4}
        fill="#333"
        rx={2}
      />

      {/* Health bar */}
      <rect
        x={enemy.x - (enemy.isBoss ? 25 : 15)}
        y={enemy.y - size - (enemy.isBoss ? 25 : 10)}
        width={(enemy.isBoss ? 50 : 30) * healthPercent}
        height={enemy.isBoss ? 6 : 4}
        fill={healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444'}
        rx={2}
      />

      {/* Boss HP text */}
      {enemy.isBoss && (
        <text
          x={enemy.x}
          y={enemy.y + 5}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill="white"
        >
          {Math.ceil(enemy.hp)}
        </text>
      )}
    </g>
  );
});

EnemySprite.displayName = 'EnemySprite';

export const EnemyRenderer: React.FC<EnemyRendererProps> = memo(({ enemies }) => {
  // Sort enemies so bosses render on top
  const sortedEnemies = [...enemies].sort((a, b) => (a.isBoss ? 1 : 0) - (b.isBoss ? 1 : 0));
  
  return (
    <g>
      {sortedEnemies.map((enemy) => (
        <EnemySprite key={enemy.id} enemy={enemy} />
      ))}
    </g>
  );
});