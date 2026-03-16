import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RuntimeWaveConfig, RuntimeBossConfig, configStore } from '@/game/configStore';

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
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Wave Settings */}
      <div className="rounded-lg border border-border bg-card/80 p-3 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">🌊 Настройки волн</h3>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Базовое кол-во врагов</Label>
            <span className="text-xs font-bold text-primary">{waveConfig.baseEnemiesPerWave}</span>
          </div>
          <Slider value={[waveConfig.baseEnemiesPerWave]} onValueChange={([v]) => handleWaveChange('baseEnemiesPerWave', v)} min={1} max={20} step={1} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Интервал боссов</Label>
            <span className="text-xs font-bold text-primary">каждые {waveConfig.bossWaveInterval}</span>
          </div>
          <Slider value={[waveConfig.bossWaveInterval]} onValueChange={([v]) => handleWaveChange('bossWaveInterval', v)} min={3} max={15} step={1} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Интервал спавна</Label>
            <span className="text-xs font-bold text-primary">{waveConfig.spawnInterval.toFixed(1)}с</span>
          </div>
          <Slider value={[waveConfig.spawnInterval * 10]} onValueChange={([v]) => handleWaveChange('spawnInterval', v / 10)} min={1} max={30} step={1} />
        </div>

        {/* Preview */}
        <div className="p-2 bg-muted/30 rounded border border-border/50">
          <Label className="text-[10px] text-muted-foreground mb-1 block">Примеры волн</Label>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {[1, 5, 10, 15, 20].map((wave) => {
              const isBoss = wave % waveConfig.bossWaveInterval === 0;
              const count = waveConfig.baseEnemiesPerWave + wave + Math.floor(wave / 5);
              return (
                <span key={wave} className={`px-1.5 py-0.5 rounded ${isBoss ? 'bg-yellow-500/20 text-yellow-400' : 'bg-muted/50 text-muted-foreground'}`}>
                  #{wave}: {isBoss ? '👑' : count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Boss Settings */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">👑 Настройки боссов</h3>

        {[
          { label: '❤️ HP множитель', value: bossConfig.hpMultiplier, field: 'hpMultiplier' as const, min: 5, max: 200, step: 5 },
          { label: '🏃 Скорость', value: bossConfig.speedMultiplier, field: 'speedMultiplier' as const, min: 0.05, max: 1, step: 0.05, format: (v: number) => `×${v.toFixed(2)}`, sliderMin: 5, sliderMax: 100, sliderStep: 5, fromSlider: (v: number) => v / 100 },
          { label: '💰 Награда', value: bossConfig.rewardMultiplier, field: 'rewardMultiplier' as const, min: 2, max: 100, step: 1 },
          { label: '📏 Размер', value: bossConfig.sizeMultiplier, field: 'sizeMultiplier' as const, min: 1, max: 5, step: 0.1, format: (v: number) => `×${v.toFixed(1)}`, sliderMin: 10, sliderMax: 50, sliderStep: 1, fromSlider: (v: number) => v / 10 },
        ].map(({ label, value, field, min, max, step, format, sliderMin, sliderMax, sliderStep, fromSlider }) => (
          <div key={field}>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">{label}</Label>
              {format ? (
                <span className="text-xs font-bold text-yellow-400">{format(value)}</span>
              ) : (
                <Input type="number" value={value} onChange={(e) => handleBossChange(field, Number(e.target.value))}
                  className="w-14 h-5 text-[11px] text-right px-1" min={min} />
              )}
            </div>
            <Slider
              value={[fromSlider ? value * (sliderMax! / max) : value]}
              onValueChange={([v]) => handleBossChange(field, fromSlider ? fromSlider(v) : v)}
              min={sliderMin ?? min} max={sliderMax ?? max} step={sliderStep ?? step}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
