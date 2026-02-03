import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TowerType, TowerConfig, ProjectileType } from '@/game/config';
import { configStore } from '@/game/configStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TowerConfigPanelProps {
  type: TowerType;
  config: TowerConfig;
}

export const TowerConfigPanel: React.FC<TowerConfigPanelProps> = ({ type, config }) => {
  const handleChange = (field: keyof TowerConfig, value: string | number) => {
    const numericFields = ['damage', 'range', 'fireRate', 'projectileSpeed', 'cost'];
    const finalValue = numericFields.includes(field) ? Number(value) : value;
    configStore.updateTower(type, { [field]: finalValue });
  };

  const projectileTypes: ProjectileType[] = ['bullet', 'line', 'aoe'];

  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundColor: config.color }}
      />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{ backgroundColor: config.color + '30', boxShadow: `0 4px 12px ${config.color}40` }}
          >
            {config.icon}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-red-500">⚔️</span> Урон
            </Label>
            <Input
              type="number"
              value={config.damage}
              onChange={(e) => handleChange('damage', e.target.value)}
              className="mt-1 h-9"
              min={1}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-blue-500">🎯</span> Дальность
            </Label>
            <Input
              type="number"
              value={config.range}
              onChange={(e) => handleChange('range', e.target.value)}
              className="mt-1 h-9"
              min={30}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-500">⚡</span> Скорострельность
            </Label>
            <Input
              type="number"
              value={config.fireRate}
              onChange={(e) => handleChange('fireRate', e.target.value)}
              className="mt-1 h-9"
              min={0.1}
              step={0.1}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-purple-500">🚀</span> Скорость снаряда
            </Label>
            <Input
              type="number"
              value={config.projectileSpeed}
              onChange={(e) => handleChange('projectileSpeed', e.target.value)}
              className="mt-1 h-9"
              min={50}
            />
          </div>
        </div>

        {/* Cost and Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-yellow-500">💰</span> Стоимость
            </Label>
            <Input
              type="number"
              value={config.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
              className="mt-1 h-9"
              min={10}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Тип атаки</Label>
            <Select
              value={config.projectileType}
              onValueChange={(v) => handleChange('projectileType', v)}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectileTypes.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {pt === 'bullet' ? '🔵 Пуля' : pt === 'line' ? '⚡ Лазер' : '💥 АОЕ'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Color and Icon */}
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <Label className="text-xs text-muted-foreground">Иконка (emoji)</Label>
            <Input
              value={config.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              className="mt-1 h-9 text-center text-xl"
              maxLength={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
