import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RuntimePlayerConfig, RuntimeUpgradeConfig, configStore } from '@/game/configStore';
import { Coins, Heart, ArrowUpCircle, TrendingUp, Target, Zap, DollarSign } from 'lucide-react';

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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Player Settings */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-500" />
            </div>
            Стартовые параметры
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Starting Gold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Стартовое золото
              </Label>
              <span className="text-lg font-bold text-yellow-500">{playerConfig.startingGold} 💰</span>
            </div>
            <Slider
              value={[playerConfig.startingGold]}
              onValueChange={([v]) => handlePlayerChange('startingGold', v)}
              min={50}
              max={1000}
              step={10}
            />
            <Input
              type="number"
              value={playerConfig.startingGold}
              onChange={(e) => handlePlayerChange('startingGold', Number(e.target.value))}
              className="mt-2 h-9"
              min={50}
            />
          </div>

          {/* Starting Lives */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Стартовые жизни
              </Label>
              <span className="text-lg font-bold text-red-500">{playerConfig.startingLives} ❤️</span>
            </div>
            <Slider
              value={[playerConfig.startingLives]}
              onValueChange={([v]) => handlePlayerChange('startingLives', v)}
              min={1}
              max={100}
              step={1}
            />
            <Input
              type="number"
              value={playerConfig.startingLives}
              onChange={(e) => handlePlayerChange('startingLives', Number(e.target.value))}
              className="mt-2 h-9"
              min={1}
            />
          </div>

          {/* Quick Presets */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <Label className="text-xs text-muted-foreground mb-2 block">Быстрые пресеты</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handlePlayerChange('startingGold', 100);
                  handlePlayerChange('startingLives', 10);
                }}
                className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs transition-colors"
              >
                😈 Сложно
              </button>
              <button
                onClick={() => {
                  handlePlayerChange('startingGold', 180);
                  handlePlayerChange('startingLives', 20);
                }}
                className="p-2 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-xs transition-colors"
              >
                ⚖️ Норма
              </button>
              <button
                onClick={() => {
                  handlePlayerChange('startingGold', 500);
                  handlePlayerChange('startingLives', 50);
                }}
                className="p-2 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-xs transition-colors"
              >
                🌴 Легко
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Settings */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-blue-500" />
            </div>
            Улучшения башен
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Макс. уровень
              </Label>
              <span className="text-lg font-bold text-primary">{upgradeConfig.maxLevel}</span>
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
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                Урон за уровень
              </Label>
              <span className="text-lg font-bold text-red-500">×{upgradeConfig.damageMultiplier.toFixed(2)}</span>
            </div>
            <Slider
              value={[upgradeConfig.damageMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('damageMultiplier', v / 100)}
              min={100}
              max={300}
              step={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              +{Math.round((upgradeConfig.damageMultiplier - 1) * 100)}% за каждый уровень
            </p>
          </div>

          {/* Range Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Дальность за уровень
              </Label>
              <span className="text-lg font-bold text-blue-500">×{upgradeConfig.rangeMultiplier.toFixed(2)}</span>
            </div>
            <Slider
              value={[upgradeConfig.rangeMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('rangeMultiplier', v / 100)}
              min={100}
              max={200}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              +{Math.round((upgradeConfig.rangeMultiplier - 1) * 100)}% за каждый уровень
            </p>
          </div>

          {/* Fire Rate Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                Скорострельность за уровень
              </Label>
              <span className="text-lg font-bold text-green-500">×{upgradeConfig.fireRateMultiplier.toFixed(2)}</span>
            </div>
            <Slider
              value={[upgradeConfig.fireRateMultiplier * 100]}
              onValueChange={([v]) => handleUpgradeChange('fireRateMultiplier', v / 100)}
              min={100}
              max={200}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              +{Math.round((upgradeConfig.fireRateMultiplier - 1) * 100)}% за каждый уровень
            </p>
          </div>

          {/* Sell Value Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                Процент при продаже
              </Label>
              <span className="text-lg font-bold text-yellow-500">{Math.round(upgradeConfig.sellValueMultiplier * 100)}%</span>
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
