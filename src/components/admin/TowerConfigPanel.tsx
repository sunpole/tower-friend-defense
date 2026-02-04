import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TowerConfig, ProjectileType } from '@/game/config';
import { configStore } from '@/game/configStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TowerConfigPanelProps {
  type: string;
  config: TowerConfig;
}

export const TowerConfigPanel: React.FC<TowerConfigPanelProps> = ({ type, config }) => {
  const handleChange = (field: keyof TowerConfig, value: string | number) => {
    const numericFields = ['damage', 'range', 'fireRate', 'projectileSpeed', 'cost'];
    const finalValue = numericFields.includes(field) ? Number(value) : value;
    configStore.updateTower(type, { [field]: finalValue });
  };

  const handleDelete = () => {
    const defaultTypes = ['sniper', 'knight', 'laser', 'fountain', 'cannon', 'frost'];
    if (defaultTypes.includes(type)) {
      toast.error('Нельзя удалить стандартную башню');
      return;
    }
    configStore.deleteTower(type);
    toast.success(`Башня "${config.name}" удалена`);
  };

  const isCustom = !['sniper', 'knight', 'laser', 'fountain', 'cannon', 'frost'].includes(type);
  const projectileTypes: ProjectileType[] = ['bullet', 'line', 'aoe'];

  return (
    <Card className="relative overflow-hidden border hover:border-primary/50 transition-colors">
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundColor: config.color }}
      />
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: config.color + '30' }}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={config.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="font-bold text-sm h-6 px-1 bg-transparent border-transparent hover:border-border focus:border-primary"
            />
            <span className="text-[10px] text-muted-foreground uppercase">{type}</span>
          </div>
          {isCustom && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDelete}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-4 gap-1.5">
          <div>
            <Label className="text-[10px] text-muted-foreground">⚔️ Урон</Label>
            <Input
              type="number"
              value={config.damage}
              onChange={(e) => handleChange('damage', e.target.value)}
              className="h-7 text-xs"
              min={1}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">🎯 Дальн.</Label>
            <Input
              type="number"
              value={config.range}
              onChange={(e) => handleChange('range', e.target.value)}
              className="h-7 text-xs"
              min={30}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">⚡ Скор.</Label>
            <Input
              type="number"
              value={config.fireRate}
              onChange={(e) => handleChange('fireRate', e.target.value)}
              className="h-7 text-xs"
              min={0.1}
              step={0.1}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">💰 Цена</Label>
            <Input
              type="number"
              value={config.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
              className="h-7 text-xs"
              min={10}
            />
          </div>
        </div>

        {/* Type, Color, Icon */}
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <Label className="text-[10px] text-muted-foreground">Тип атаки</Label>
            <Select
              value={config.projectileType}
              onValueChange={(v) => handleChange('projectileType', v)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectileTypes.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {pt === 'bullet' ? '🔵' : pt === 'line' ? '⚡' : '💥'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Цвет</Label>
            <input
              type="color"
              value={config.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-7 rounded border border-border cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Иконка</Label>
            <Input
              value={config.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              className="h-7 text-center text-base"
              maxLength={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
