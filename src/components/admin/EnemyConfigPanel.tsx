import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnemyType, EnemyConfig, ENEMY_CONFIGS } from '@/game/config';
import { configStore, useGameConfig } from '@/game/configStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnemyConfigPanelProps {
  type: EnemyType;
  config: EnemyConfig;
}

export const EnemyConfigPanel: React.FC<EnemyConfigPanelProps> = ({ type, config }) => {
  const gameConfig = useGameConfig();
  const enemyTypes = Object.keys(gameConfig.enemies) as EnemyType[];

  const handleChange = (field: keyof EnemyConfig, value: string | number | undefined) => {
    const numericFields = ['hp', 'speed', 'reward', 'spawnCount'];
    let finalValue: string | number | undefined = value;

    if (numericFields.includes(field) && value !== undefined) {
      finalValue = Number(value);
    }

    configStore.updateEnemy(type, { [field]: finalValue });
  };

  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: config.color }}
      />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: config.color, boxShadow: `0 4px 12px ${config.color}60` }}
          >
            {type.charAt(0).toUpperCase()}
          </div>
          <div>
            <Input
              value={config.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="font-bold text-lg h-8 px-2 bg-transparent border-transparent hover:border-border focus:border-primary"
            />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{type}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <Label className="text-xs text-muted-foreground">Описание</Label>
          <Input
            value={config.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="mt-1 h-9 text-sm"
          />
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-red-500">❤️</span> HP
            </Label>
            <Input
              type="number"
              value={config.hp}
              onChange={(e) => handleChange('hp', e.target.value)}
              className="mt-1 h-9"
              min={1}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-blue-500">🏃</span> Скорость
            </Label>
            <Input
              type="number"
              value={config.speed}
              onChange={(e) => handleChange('speed', e.target.value)}
              className="mt-1 h-9"
              min={1}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-yellow-500">💰</span> Награда
            </Label>
            <Input
              type="number"
              value={config.reward}
              onChange={(e) => handleChange('reward', e.target.value)}
              className="mt-1 h-9"
              min={1}
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <Label className="text-xs text-muted-foreground">Цвет</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={config.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-9 h-9 rounded border border-border cursor-pointer"
            />
            <Input
              value={config.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="h-9 flex-1 font-mono text-xs"
            />
          </div>
        </div>

        {/* Spawn on Death */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-3">
          <Label className="text-xs text-muted-foreground font-medium">💥 При смерти</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Спавнит врага</Label>
              <Select
                value={config.spawnOnDeath || 'none'}
                onValueChange={(v) => handleChange('spawnOnDeath', v === 'none' ? undefined : v)}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue placeholder="Нет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {enemyTypes.map((et) => (
                    <SelectItem key={et} value={et}>
                      {gameConfig.enemies[et].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Количество</Label>
              <Input
                type="number"
                value={config.spawnCount || 0}
                onChange={(e) => handleChange('spawnCount', e.target.value)}
                className="mt-1 h-9"
                min={0}
                max={10}
                disabled={!config.spawnOnDeath}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
