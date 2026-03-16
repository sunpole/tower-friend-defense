import React from 'react';
import { TowerType } from '@/game/types';
import { useGameConfig } from '@/game/configStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TowerShopProps {
  gold: number;
  selectedTowerType: TowerType | null;
  onSelectTower: (type: TowerType | null) => void;
}

export const TowerShop: React.FC<TowerShopProps> = ({ gold, selectedTowerType, onSelectTower }) => {
  const runtimeConfig = useGameConfig();
  const towerTypes = Object.keys(runtimeConfig.towers) as TowerType[];
  const canAffordSelected = selectedTowerType ? gold >= runtimeConfig.towers[selectedTowerType].cost : true;

  return (
    <div className="bg-card p-2 sm:p-3 rounded-lg border border-border">
      <h3 className="text-xs sm:text-sm font-bold mb-2 text-foreground">Магазин</h3>
      <div className="grid grid-cols-3 sm:grid-cols-2 gap-1">
        {towerTypes.map((type) => {
          const config = runtimeConfig.towers[type];
          const canAfford = gold >= config.cost;
          const isSelected = selectedTowerType === type;
          return (
            <Button key={type} variant={isSelected ? 'default' : 'outline'}
              className={`flex flex-col h-auto py-1.5 px-1 text-[10px] ${!canAfford ? 'opacity-40' : ''}`}
              style={{ borderColor: isSelected ? config.color : undefined, backgroundColor: isSelected ? config.color : undefined }}
              onClick={() => onSelectTower(isSelected ? null : type)} disabled={!canAfford}>
              <span className="text-base leading-none">{config.icon}</span>
              <span className="font-bold truncate w-full text-center">{config.name}</span>
              <span className="text-muted-foreground">💰{config.cost}</span>
            </Button>
          );
        })}
      </div>

      {selectedTowerType && (
        <div className={`mt-2 p-1.5 rounded border flex items-center justify-between text-xs ${canAffordSelected ? 'bg-primary/20 border-primary/50' : 'bg-destructive/20 border-destructive/50 animate-pulse'}`}>
          <span>{runtimeConfig.towers[selectedTowerType].icon} {canAffordSelected ? 'В руке' : 'Нет золота!'}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onSelectTower(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
