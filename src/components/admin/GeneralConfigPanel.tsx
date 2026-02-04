import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RuntimePlayerConfig, RuntimeUpgradeConfig, configStore } from '@/game/configStore';
import { Coins, ArrowUpCircle } from 'lucide-react';

interface GeneralConfigPanelProps {
  playerConfig: RuntimePlayerConfig;
  upgradeConfig: RuntimeUpgradeConfig;
}

export const GeneralConfigPanel: React.FC<GeneralConfigPanelProps> = ({
  playerConfig,
  upgradeConfig,
}) => {
  const handlePlayerChange = (field: keyof RuntimePlayerConfig, value: number) => {
    configStore.updatePlayer({ [field]: value });
  };

  const handleUpgradeChange = (field: keyof RuntimeUpgradeConfig, value: number) => {
    configStore.updateUpgrade({ [field]: value });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Player Settings */}
      <Card className="border hover:border-primary/50 transition-colors">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-green-500" />
            </div>
            Стартовые параметры
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Starting Gold */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">💰 Золото</Label>
              <Input
                type="number"
                value={playerConfig.startingGold}
                onChange={(e) => handlePlayerChange('startingGold', Number(e.target.value))}
                className="w-20 h-6 text-xs text-right"
                min={50}
              />
            </div>
            <Slider
              value={[playerConfig.startingGold]}
              onValueChange={([v]) => handlePlayerChange('startingGold', v)}
              min={50}
              max={1000}
              step={10}
            />
          </div>

          {/* Starting Lives */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">❤️ Жизни</Label>
              <Input
                type="number"
                value={playerConfig.startingLives}
                onChange={(e) => handlePlayerChange('startingLives', Number(e.target.value))}
                className="w-20 h-6 text-xs text-right"
                min={1}
              />
            </div>
            <Slider
              value={[playerConfig.startingLives]}
              onValueChange={([v]) => handlePlayerChange('startingLives', v)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          {/* Quick Presets */}
          <div className="flex gap-1">
            <button
              onClick={() => {
                handlePlayerChange('startingGold', 100);
                handlePlayerChange('startingLives', 10);
              }}
              className="flex-1 p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[10px] transition-colors"
            >
              😈 Сложно
            </button>
            <button
              onClick={() => {
                handlePlayerChange('startingGold', 180);
                handlePlayerChange('startingLives', 20);
              }}
              className="flex-1 p-1.5 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-[10px] transition-colors"
            >
              ⚖️ Норма
            </button>
            <button
              onClick={() => {
                handlePlayerChange('startingGold', 500);
                handlePlayerChange('startingLives', 50);
              }}
              className="flex-1 p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-[10px] transition-colors"
            >
              🌴 Легко
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Settings */}
      <Card className="border hover:border-primary/50 transition-colors">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4 text-blue-500" />
            </div>
            Улучшения башен
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Max Level */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Макс. уровень</Label>
              <span className="text-sm font-bold text-primary">{upgradeConfig.maxLevel}</span>
            </div>
            <Slider
              value={[upgradeConfig.maxLevel]}
              onValueChange={([v]) => handleUpgradeChange('maxLevel', v)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Damage Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">⚔️ Урон/уровень</Label>
              <span className="text-sm font-bold text-red-500">+{Math.round((upgradeConfig.damageMultiplier - 1) * 100)}%</span>
            </div>
            <Slider
              value={[upgradeConfig.damageMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('damageMultiplier', v / 100)}
              min={100}
              max={300}
              step={5}
            />
          </div>

          {/* Range Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">🎯 Дальность/уровень</Label>
              <span className="text-sm font-bold text-blue-500">+{Math.round((upgradeConfig.rangeMultiplier - 1) * 100)}%</span>
            </div>
            <Slider
              value={[upgradeConfig.rangeMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('rangeMultiplier', v / 100)}
              min={100}
              max={200}
              step={1}
            />
          </div>

          {/* Fire Rate Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">⚡ Скорострельность/уровень</Label>
              <span className="text-sm font-bold text-green-500">+{Math.round((upgradeConfig.fireRateMultiplier - 1) * 100)}%</span>
            </div>
            <Slider
              value={[upgradeConfig.fireRateMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('fireRateMultiplier', v / 100)}
              min={100}
              max={200}
              step={1}
            />
          </div>

          {/* Sell Value */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">💰 Продажа</Label>
              <span className="text-sm font-bold text-yellow-500">{Math.round(upgradeConfig.sellValueMultiplier * 100)}%</span>
            </div>
            <Slider
              value={[upgradeConfig.sellValueMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('sellValueMultiplier', v / 100)}
              min={10}
              max={100}
              step={5}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
