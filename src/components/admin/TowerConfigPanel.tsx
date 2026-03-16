import React from 'react';
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

const DEFAULT_TYPES = ['sniper', 'knight', 'laser', 'fountain', 'cannon', 'frost'];

export const TowerConfigPanel: React.FC<TowerConfigPanelProps> = ({ type, config }) => {
  const handleChange = (field: keyof TowerConfig, value: string | number) => {
    const numericFields = ['damage', 'range', 'fireRate', 'projectileSpeed', 'cost'];
    configStore.updateTower(type, { [field]: numericFields.includes(field) ? Number(value) : value });
  };

  const handleDelete = () => {
    if (DEFAULT_TYPES.includes(type)) { toast.error('Нельзя удалить стандартную башню'); return; }
    configStore.deleteTower(type);
    toast.success(`Башня "${config.name}" удалена`);
  };

  const isCustom = !DEFAULT_TYPES.includes(type);
  const projectileTypes: ProjectileType[] = ['bullet', 'line', 'aoe'];

  return (
    <div className="relative rounded-lg border border-border bg-card/80 p-2.5 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: config.color + '30' }}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={config.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="font-bold text-xs h-5 px-1 bg-transparent border-transparent hover:border-border focus:border-primary"
          />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{type}</span>
        </div>
        {isCustom && (
          <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0" onClick={handleDelete}>
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1">
        {[
          { label: '⚔️', field: 'damage' as const, val: config.damage, min: 1 },
          { label: '🎯', field: 'range' as const, val: config.range, min: 30 },
          { label: '⚡', field: 'fireRate' as const, val: config.fireRate, min: 0.1, step: 0.1 },
          { label: '💰', field: 'cost' as const, val: config.cost, min: 10 },
        ].map(({ label, field, val, min, step }) => (
          <div key={field}>
            <Label className="text-[9px] text-muted-foreground">{label}</Label>
            <Input
              type="number"
              value={val}
              onChange={(e) => handleChange(field, e.target.value)}
              className="h-6 text-[11px] px-1"
              min={min}
              step={step}
            />
          </div>
        ))}
      </div>

      {/* Type, Color, Icon */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <div>
          <Label className="text-[9px] text-muted-foreground">Тип</Label>
          <Select value={config.projectileType} onValueChange={(v) => handleChange('projectileType', v)}>
            <SelectTrigger className="h-6 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projectileTypes.map((pt) => (
                <SelectItem key={pt} value={pt} className="text-xs">
                  {pt === 'bullet' ? '🔵 Пуля' : pt === 'line' ? '⚡ Лазер' : '💥 АОЕ'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[9px] text-muted-foreground">Цвет</Label>
          <input type="color" value={config.color} onChange={(e) => handleChange('color', e.target.value)}
            className="w-full h-6 rounded border border-border cursor-pointer bg-transparent" />
        </div>
        <div>
          <Label className="text-[9px] text-muted-foreground">Иконка</Label>
          <Input value={config.icon} onChange={(e) => handleChange('icon', e.target.value)}
            className="h-6 text-center text-sm" maxLength={4} />
        </div>
      </div>
    </div>
  );
};
