import React from 'react';
import { TowerType, TOWER_CONFIGS } from '@/game/types';
import { Button } from '@/components/ui/button';

interface TowerShopProps {
  gold: number;
  selectedTowerType: TowerType | null;
  onSelectTower: (type: TowerType | null) => void;
}

export const TowerShop: React.FC<TowerShopProps> = ({
  gold,
  selectedTowerType,
  onSelectTower,
}) => {
  const towerTypes: TowerType[] = ['sniper', 'knight', 'laser', 'fountain'];

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-bold mb-3 text-foreground">Магазин башен</h3>
      <div className="grid grid-cols-2 gap-2">
        {towerTypes.map((type) => {
          const config = TOWER_CONFIGS[type];
          const canAfford = gold >= config.cost;
          const isSelected = selectedTowerType === type;

          return (
            <Button
              key={type}
              variant={isSelected ? 'default' : 'outline'}
              className={`flex flex-col h-auto py-2 ${
                !canAfford ? 'opacity-50' : ''
              }`}
              style={{
                borderColor: isSelected ? config.color : undefined,
                backgroundColor: isSelected ? config.color : undefined,
              }}
              onClick={() => onSelectTower(isSelected ? null : type)}
              disabled={!canAfford}
            >
              <span className="text-lg">
                {type === 'sniper' && '🎯'}
                {type === 'knight' && '⚔️'}
                {type === 'laser' && '⚡'}
                {type === 'fountain' && '💧'}
              </span>
              <span className="text-xs font-bold">{config.name}</span>
              <span className="text-xs text-muted-foreground">💰 {config.cost}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>🎯 Снайпер: дальний, быстрый</p>
        <p>⚔️ Рыцарь: ближний бой, сильный</p>
        <p>⚡ Лазер: очень быстрый, слабый</p>
        <p>💧 Фонтан: AOE урон вокруг</p>
      </div>
    </div>
  );
};
