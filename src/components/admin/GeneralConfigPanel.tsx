import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RuntimePlayerConfig, RuntimeUpgradeConfig, configStore } from '@/game/configStore';

interface GeneralConfigPanelProps {
  playerConfig: RuntimePlayerConfig;
  upgradeConfig: RuntimeUpgradeConfig;
}

export const GeneralConfigPanel: React.FC<GeneralConfigPanelProps> = ({ playerConfig, upgradeConfig }) => {
  const handlePlayerChange = (field: keyof RuntimePlayerConfig, value: number) => {
    configStore.updatePlayer({ [field]: value });
  };
  const handleUpgradeChange = (field: keyof RuntimeUpgradeConfig, value: number) => {
    configStore.updateUpgrade({ [field]: value });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Player */}
      <div className="rounded-lg border border-border bg-card/80 p-3 space-y-3">
        <h3 className="text-sm font-bold">💰 Стартовые параметры</h3>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Золото</Label>
            <Input type="number" value={playerConfig.startingGold} onChange={(e) => handlePlayerChange('startingGold', Number(e.target.value))}
              className="w-16 h-5 text-[11px] text-right px-1" min={50} />
          </div>
          <Slider value={[playerConfig.startingGold]} onValueChange={([v]) => handlePlayerChange('startingGold', v)} min={50} max={1000} step={10} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Жизни</Label>
            <Input type="number" value={playerConfig.startingLives} onChange={(e) => handlePlayerChange('startingLives', Number(e.target.value))}
              className="w-16 h-5 text-[11px] text-right px-1" min={1} />
          </div>
          <Slider value={[playerConfig.startingLives]} onValueChange={([v]) => handlePlayerChange('startingLives', v)} min={1} max={100} step={1} />
        </div>

        {/* Presets */}
        <div className="flex gap-1">
          {[
            { label: '😈 Хард', gold: 100, lives: 10, cls: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20' },
            { label: '⚖️ Норма', gold: 180, lives: 20, cls: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' },
            { label: '🌴 Изи', gold: 500, lives: 50, cls: 'bg-primary/10 border-primary/30 hover:bg-primary/20' },
          ].map(({ label, gold, lives, cls }) => (
            <button key={label} onClick={() => { handlePlayerChange('startingGold', gold); handlePlayerChange('startingLives', lives); }}
              className={`flex-1 py-1 rounded border text-[10px] transition-colors ${cls}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upgrades */}
      <div className="rounded-lg border border-border bg-card/80 p-3 space-y-3">
        <h3 className="text-sm font-bold">⬆️ Улучшения башен</h3>

        {[
          { label: 'Макс. уровень', value: upgradeConfig.maxLevel, field: 'maxLevel' as const, min: 1, max: 10, step: 1, display: String(upgradeConfig.maxLevel) },
          { label: '⚔️ Урон/ур.', value: upgradeConfig.damageMultiplier, field: 'damageMultiplier' as const, min: 1, max: 3, step: 0.05, display: `+${Math.round((upgradeConfig.damageMultiplier - 1) * 100)}%`, sliderMin: 100, sliderMax: 300, sliderStep: 5, fromSlider: (v: number) => v / 100 },
          { label: '🎯 Дальн./ур.', value: upgradeConfig.rangeMultiplier, field: 'rangeMultiplier' as const, min: 1, max: 2, step: 0.01, display: `+${Math.round((upgradeConfig.rangeMultiplier - 1) * 100)}%`, sliderMin: 100, sliderMax: 200, sliderStep: 1, fromSlider: (v: number) => v / 100 },
          { label: '⚡ Скор./ур.', value: upgradeConfig.fireRateMultiplier, field: 'fireRateMultiplier' as const, min: 1, max: 2, step: 0.01, display: `+${Math.round((upgradeConfig.fireRateMultiplier - 1) * 100)}%`, sliderMin: 100, sliderMax: 200, sliderStep: 1, fromSlider: (v: number) => v / 100 },
          { label: '💰 Продажа', value: upgradeConfig.sellValueMultiplier, field: 'sellValueMultiplier' as const, min: 0.1, max: 1, step: 0.05, display: `${Math.round(upgradeConfig.sellValueMultiplier * 100)}%`, sliderMin: 10, sliderMax: 100, sliderStep: 5, fromSlider: (v: number) => v / 100 },
        ].map(({ label, value, field, min, max, step, display, sliderMin, sliderMax, sliderStep, fromSlider }) => (
          <div key={field}>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">{label}</Label>
              <span className="text-xs font-bold text-primary">{display}</span>
            </div>
            <Slider
              value={[fromSlider ? value * (sliderMax! / max) : value]}
              onValueChange={([v]) => handleUpgradeChange(field, fromSlider ? fromSlider(v) : v)}
              min={sliderMin ?? min} max={sliderMax ?? max} step={sliderStep ?? step}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
