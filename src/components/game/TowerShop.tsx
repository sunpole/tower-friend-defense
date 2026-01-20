import React from 'react';
import { TowerType, TOWER_CONFIGS } from '@/game/types';
import { getTowerTypes } from '@/game/config';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  const towerTypes = getTowerTypes();

  // Check if player can afford the selected tower
  const canAffordSelected = selectedTowerType 
    ? gold >= TOWER_CONFIGS[selectedTowerType].cost 
    : true;

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
              <span className="text-lg">{config.icon}</span>
              <span className="text-xs font-bold">{config.name}</span>
              <span className="text-xs text-muted-foreground">💰 {config.cost}</span>
            </Button>
          );
        })}
      </div>

      {/* Selected tower indicator with clear button */}
      {selectedTowerType && (
        <div 
          className={`mt-3 p-2 rounded border flex items-center justify-between ${
            canAffordSelected 
              ? 'bg-primary/20 border-primary' 
              : 'bg-destructive/20 border-destructive animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{TOWER_CONFIGS[selectedTowerType].icon}</span>
            <span className="text-sm font-medium">
              {canAffordSelected ? 'В руке' : 'Нет золота!'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onSelectTower(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>🎯 Снайпер: дальний, точный</p>
        <p>⚔️ Рыцарь: ближний бой</p>
        <p>⚡ Лазер: быстрый урон</p>
        <p>💧 Фонтан: AOE вокруг</p>
        <p>💥 Пушка: огромный урон</p>
        <p>❄️ Мороз: замедление</p>
      </div>
    </div>
  );
};