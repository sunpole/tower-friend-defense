import React from 'react';
import { Tower } from '@/game/types';
import { useGameConfig } from '@/game/configStore';
import { getTowerStats, getUpgradeCost, getSellValue } from '@/game/gameLogic';
import { Button } from '@/components/ui/button';

interface TowerInfoProps {
  tower: Tower;
  gold: number;
  onUpgrade: () => void;
  onSell: () => void;
  onDeselect: () => void;
}

export const TowerInfo: React.FC<TowerInfoProps> = ({
  tower,
  gold,
  onUpgrade,
  onSell,
  onDeselect,
}) => {
  const runtimeConfig = useGameConfig();
  const config = runtimeConfig.towers[tower.type];
  const stats = getTowerStats(tower);
  const upgradeCost = getUpgradeCost(tower);
  const sellValue = getSellValue(tower);
  const canUpgrade = tower.level < runtimeConfig.upgrade.maxLevel && gold >= upgradeCost;

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-foreground">
          {config.name} (Ур. {tower.level})
        </h3>
        <Button variant="ghost" size="sm" onClick={onDeselect}>
          ✕
        </Button>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Урон:</span>
          <span className="text-foreground font-medium">{stats.damage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Дальность:</span>
          <span className="text-foreground font-medium">{stats.range}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Скорость:</span>
          <span className="text-foreground font-medium">
            {stats.fireRate.toFixed(1)}/с
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {tower.level < runtimeConfig.upgrade.maxLevel && (
          <Button
            className="flex-1"
            onClick={onUpgrade}
            disabled={!canUpgrade}
          >
            Улучшить (💰{upgradeCost})
          </Button>
        )}
        <Button variant="destructive" onClick={onSell}>
          Продать (💰{sellValue})
        </Button>
      </div>
    </div>
  );
};
