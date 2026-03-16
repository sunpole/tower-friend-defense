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

export const TowerInfo: React.FC<TowerInfoProps> = ({ tower, gold, onUpgrade, onSell, onDeselect }) => {
  const runtimeConfig = useGameConfig();
  const config = runtimeConfig.towers[tower.type];
  const stats = getTowerStats(tower);
  const upgradeCost = getUpgradeCost(tower);
  const sellValue = getSellValue(tower);
  const canUpgrade = tower.level < runtimeConfig.upgrade.maxLevel && gold >= upgradeCost;

  return (
    <div className="bg-card p-2 sm:p-3 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-foreground">
          {config?.icon} {config?.name} <span className="text-muted-foreground">Ур.{tower.level}</span>
        </h3>
        <Button variant="ghost" size="sm" onClick={onDeselect} className="h-6 w-6 p-0">✕</Button>
      </div>

      <div className="grid grid-cols-3 gap-1 text-[11px] mb-2">
        <div className="text-center p-1 bg-muted/30 rounded">
          <div className="font-bold">{stats.damage}</div>
          <div className="text-muted-foreground">⚔️ Урон</div>
        </div>
        <div className="text-center p-1 bg-muted/30 rounded">
          <div className="font-bold">{stats.range}</div>
          <div className="text-muted-foreground">🎯 Дальн.</div>
        </div>
        <div className="text-center p-1 bg-muted/30 rounded">
          <div className="font-bold">{stats.fireRate.toFixed(1)}/с</div>
          <div className="text-muted-foreground">⚡ Скор.</div>
        </div>
      </div>

      <div className="flex gap-1">
        {tower.level < runtimeConfig.upgrade.maxLevel && (
          <Button className="flex-1 h-7 text-xs" onClick={onUpgrade} disabled={!canUpgrade}>
            ⬆️ {upgradeCost}💰
          </Button>
        )}
        <Button variant="destructive" className="h-7 text-xs" onClick={onSell}>
          💰{sellValue}
        </Button>
      </div>
    </div>
  );
};
