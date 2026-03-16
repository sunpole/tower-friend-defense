import React from 'react';
import { useGameConfig } from '@/game/configStore';
import { EnemyType } from '@/game/config';

export const EnemyLegend: React.FC = () => {
  const runtimeConfig = useGameConfig();
  const enemyTypes = Object.keys(runtimeConfig.enemies) as EnemyType[];

  return (
    <div className="bg-card p-2 sm:p-3 rounded-lg border border-border">
      <h3 className="text-xs sm:text-sm font-bold mb-1.5 text-foreground">Враги</h3>
      <div className="space-y-1">
        {enemyTypes.map((type) => {
          const config = runtimeConfig.enemies[type];
          return (
            <div key={type} className="flex items-center gap-1.5 text-[10px]">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />
              <span className="font-medium text-foreground flex-shrink-0">{config.name}</span>
              <span className="text-muted-foreground ml-auto">❤️{config.hp} ⚡{config.speed} 💰{config.reward}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
