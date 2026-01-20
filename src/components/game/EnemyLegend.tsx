import React from 'react';
import { ENEMY_CONFIGS, getEnemyTypes } from '@/game/config';

export const EnemyLegend: React.FC = () => {
  const enemyTypes = getEnemyTypes();

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-bold mb-3 text-foreground">Типы врагов</h3>
      <div className="space-y-2">
        {enemyTypes.map((type) => {
          const config = ENEMY_CONFIGS[type];
          return (
            <div key={type} className="flex items-start gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: config.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{config.name}</div>
                <div className="text-xs text-muted-foreground">
                  ❤️{config.hp} ⚡{config.speed} 💰{config.reward}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};