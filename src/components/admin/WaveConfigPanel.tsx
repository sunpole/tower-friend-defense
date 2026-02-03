import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RuntimeWaveConfig, RuntimeBossConfig, configStore } from '@/game/configStore';
import { Waves, Crown, Clock, Users } from 'lucide-react';

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

  // Calculate example wave compositions
  const getWaveEnemies = (wave: number) => {
    return waveConfig.baseEnemiesPerWave + wave + Math.floor(wave / 5);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Wave Settings */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Waves className="w-5 h-5 text-purple-500" />
            </div>
            Настройки волн
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Enemies */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Базовое кол-во врагов
              </Label>
              <span className="text-lg font-bold text-primary">{waveConfig.baseEnemiesPerWave}</span>
            </div>
            <Slider
              value={[waveConfig.baseEnemiesPerWave]}
              onValueChange={([v]) => handleWaveChange('baseEnemiesPerWave', v)}
              min={1}
              max={20}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Формула: {waveConfig.baseEnemiesPerWave} + волна + волна/5
            </p>
          </div>

          {/* Boss Wave Interval */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-muted-foreground" />
                Интервал боссов
              </Label>
              <span className="text-lg font-bold text-primary">Каждые {waveConfig.bossWaveInterval}</span>
            </div>
            <Slider
              value={[waveConfig.bossWaveInterval]}
              onValueChange={([v]) => handleWaveChange('bossWaveInterval', v)}
              min={3}
              max={15}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Босс-волны: {[...Array(5)].map((_, i) => (i + 1) * waveConfig.bossWaveInterval).join(', ')}...
            </p>
          </div>

          {/* Spawn Interval */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Интервал спавна (сек)
              </Label>
              <span className="text-lg font-bold text-primary">{waveConfig.spawnInterval.toFixed(1)}с</span>
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
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <Label className="text-xs text-muted-foreground mb-2 block">Примеры волн</Label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[1, 5, 10, 15, 20, 25].map((wave) => {
                const isBoss = wave % waveConfig.bossWaveInterval === 0;
                return (
                  <div
                    key={wave}
                    className={`p-2 rounded text-center ${
                      isBoss ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-background'
                    }`}
                  >
                    <span className="font-bold">#{wave}</span>
                    <br />
                    {isBoss ? '👑 Босс' : `${getWaveEnemies(wave)} шт`}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boss Settings */}
      <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            Настройки боссов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* HP Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">❤️ Множитель HP</Label>
              <span className="text-lg font-bold text-red-500">×{bossConfig.hpMultiplier}</span>
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
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">🏃 Множитель скорости</Label>
              <span className="text-lg font-bold text-blue-500">×{bossConfig.speedMultiplier.toFixed(2)}</span>
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
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">💰 Множитель награды</Label>
              <span className="text-lg font-bold text-yellow-500">×{bossConfig.rewardMultiplier}</span>
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
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">📏 Множитель размера</Label>
              <span className="text-lg font-bold text-purple-500">×{bossConfig.sizeMultiplier.toFixed(1)}</span>
            </div>
            <Slider
              value={[bossConfig.sizeMultiplier * 10]}
              onValueChange={([v]) => handleBossChange('sizeMultiplier', v / 10)}
              min={10}
              max={50}
              step={1}
            />
          </div>

          {/* Boss Preview */}
          <div className="p-4 bg-background/50 rounded-lg border border-yellow-500/30 text-center">
            <p className="text-xs text-muted-foreground mb-2">Пример босса (простой враг)</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-1" />
                <span className="text-xs">Обычный</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-center">
                <div
                  className="rounded-full bg-red-500 mx-auto mb-1 ring-4 ring-yellow-400/50"
                  style={{
                    width: 24 * bossConfig.sizeMultiplier,
                    height: 24 * bossConfig.sizeMultiplier,
                  }}
                >
                  <span className="text-lg">👑</span>
                </div>
                <span className="text-xs">Босс</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
