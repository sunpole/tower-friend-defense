import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RuntimeWaveConfig, RuntimeBossConfig, configStore } from '@/game/configStore';
import { Waves, Crown } from 'lucide-react';

interface WaveConfigPanelProps {
  waveConfig: RuntimeWaveConfig;
  bossConfig: RuntimeBossConfig;
}

export const WaveConfigPanel: React.FC<WaveConfigPanelProps> = ({ waveConfig, bossConfig }) => {
  const handleWaveChange = (field: keyof RuntimeWaveConfig, value: number) => {
    configStore.updateWave({ [field]: value });
  };

  const handleBossChange = (field: keyof RuntimeBossConfig, value: number) => {
    configStore.updateBoss({ [field]: value });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Wave Settings */}
      <Card className="border hover:border-primary/50 transition-colors">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Waves className="w-4 h-4 text-purple-500" />
            </div>
            Настройки волн
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Base Enemies */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Базовое кол-во врагов</Label>
              <span className="text-sm font-bold text-primary">{waveConfig.baseEnemiesPerWave}</span>
            </div>
            <Slider
              value={[waveConfig.baseEnemiesPerWave]}
              onValueChange={([v]) => handleWaveChange('baseEnemiesPerWave', v)}
              min={1}
              max={20}
              step={1}
            />
          </div>

          {/* Boss Wave Interval */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Интервал боссов</Label>
              <span className="text-sm font-bold text-primary">Каждые {waveConfig.bossWaveInterval}</span>
            </div>
            <Slider
              value={[waveConfig.bossWaveInterval]}
              onValueChange={([v]) => handleWaveChange('bossWaveInterval', v)}
              min={3}
              max={15}
              step={1}
            />
          </div>

          {/* Spawn Interval */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Интервал спавна (сек)</Label>
              <span className="text-sm font-bold text-primary">{waveConfig.spawnInterval.toFixed(1)}с</span>
            </div>
            <Slider
              value={[waveConfig.spawnInterval * 10]}
              onValueChange={([v]) => handleWaveChange('spawnInterval', v / 10)}
              min={1}
              max={30}
              step={1}
            />
          </div>

          {/* Wave Examples */}
          <div className="p-2 bg-muted/50 rounded border border-border">
            <Label className="text-[10px] text-muted-foreground mb-1 block">Примеры волн</Label>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {[1, 5, 10, 15, 20].map((wave) => {
                const isBoss = wave % waveConfig.bossWaveInterval === 0;
                const count = waveConfig.baseEnemiesPerWave + wave + Math.floor(wave / 5);
                return (
                  <span
                    key={wave}
                    className={`px-1.5 py-0.5 rounded ${isBoss ? 'bg-yellow-500/30 text-yellow-500' : 'bg-muted'}`}
                  >
                    #{wave}: {isBoss ? '👑' : `${count}`}
                  </span>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boss Settings */}
      <Card className="border hover:border-primary/50 transition-colors bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
            Настройки боссов
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* HP Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">❤️ HP</Label>
              <Input
                type="number"
                value={bossConfig.hpMultiplier}
                onChange={(e) => handleBossChange('hpMultiplier', Number(e.target.value))}
                className="w-16 h-6 text-xs text-right"
                min={5}
              />
            </div>
            <Slider
              value={[bossConfig.hpMultiplier]}
              onValueChange={([v]) => handleBossChange('hpMultiplier', v)}
              min={5}
              max={200}
              step={5}
            />
          </div>

          {/* Speed Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">🏃 Скорость</Label>
              <span className="text-sm font-bold text-blue-500">×{bossConfig.speedMultiplier.toFixed(2)}</span>
            </div>
            <Slider
              value={[bossConfig.speedMultiplier * 100]}
              onValueChange={([v]) => handleBossChange('speedMultiplier', v / 100)}
              min={5}
              max={100}
              step={5}
            />
          </div>

          {/* Reward Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">💰 Награда</Label>
              <span className="text-sm font-bold text-yellow-500">×{bossConfig.rewardMultiplier}</span>
            </div>
            <Slider
              value={[bossConfig.rewardMultiplier]}
              onValueChange={([v]) => handleBossChange('rewardMultiplier', v)}
              min={2}
              max={100}
              step={1}
            />
          </div>

          {/* Size Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">📏 Размер</Label>
              <span className="text-sm font-bold text-purple-500">×{bossConfig.sizeMultiplier.toFixed(1)}</span>
            </div>
            <Slider
              value={[bossConfig.sizeMultiplier * 10]}
              onValueChange={([v]) => handleBossChange('sizeMultiplier', v / 10)}
              min={10}
              max={50}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
