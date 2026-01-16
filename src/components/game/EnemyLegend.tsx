import React from 'react';
import { ENEMY_CONFIGS, EnemyType } from '@/game/types';

export const EnemyLegend: React.FC = () => {
  const enemies: EnemyType[] = ['simple', 'fat', 'thin', 'double'];

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-bold mb-3 text-foreground">Враги</h3>
      <div className="space-y-2 text-xs">
        {enemies.map((type) => {
          const config = ENEMY_CONFIGS[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-foreground font-medium">{config.name}</span>
              <span className="text-muted-foreground">
                {config.hp}HP, {config.speed}px/s
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          🔴 Боссы на 5, 10, 15, 20 волнах
        </p>
        <p className="text-xs text-muted-foreground">
          HP ×40, скорость ×0.25, награда ×20
        </p>
      </div>
    </div>
  );
};
