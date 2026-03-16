import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnemyConfig } from '@/game/config';
import { configStore, useGameConfig } from '@/game/configStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EnemyConfigPanelProps {
  type: string;
  config: EnemyConfig;
}

const DEFAULT_TYPES = ['simple', 'fat', 'thin', 'double', 'ghost', 'armored'];

export const EnemyConfigPanel: React.FC<EnemyConfigPanelProps> = ({ type, config }) => {
  const gameConfig = useGameConfig();
  const enemyTypes = Object.keys(gameConfig.enemies);

  const handleChange = (field: keyof EnemyConfig, value: string | number | undefined) => {
    const numericFields = ['hp', 'speed', 'reward', 'spawnCount'];
    let finalValue: string | number | undefined = value;
    if (numericFields.includes(field) && value !== undefined) finalValue = Number(value);
    configStore.updateEnemy(type, { [field]: finalValue });
  };

  const handleDelete = () => {
    if (DEFAULT_TYPES.includes(type)) { toast.error('Нельзя удалить стандартного врага'); return; }
    configStore.deleteEnemy(type);
    toast.success(`Враг "${config.name}" удалён`);
  };

  const isCustom = !DEFAULT_TYPES.includes(type);

  return (
    <div className="relative rounded-lg border border-border bg-card/80 p-2.5 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: config.color }}>
          {type.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <Input value={config.name} onChange={(e) => handleChange('name', e.target.value)}
            className="font-bold text-xs h-5 px-1 bg-transparent border-transparent hover:border-border focus:border-primary" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{type}</span>
        </div>
        {isCustom && (
          <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0" onClick={handleDelete}>
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1">
        {[
          { label: '❤️ HP', field: 'hp' as const, val: config.hp, min: 1 },
          { label: '🏃 Скор.', field: 'speed' as const, val: config.speed, min: 1 },
          { label: '💰 Нагр.', field: 'reward' as const, val: config.reward, min: 1 },
        ].map(({ label, field, val, min }) => (
          <div key={field}>
            <Label className="text-[9px] text-muted-foreground">{label}</Label>
            <Input type="number" value={val} onChange={(e) => handleChange(field, e.target.value)}
              className="h-6 text-[11px] px-1" min={min} />
          </div>
        ))}
      </div>

      {/* Color + Spawn */}
      <div className="flex gap-1.5 mt-1 items-end">
        <div className="w-8 flex-shrink-0">
          <Label className="text-[9px] text-muted-foreground">🎨</Label>
          <input type="color" value={config.color} onChange={(e) => handleChange('color', e.target.value)}
            className="w-full h-6 rounded border border-border cursor-pointer bg-transparent" />
        </div>
        <div className="flex-1">
          <Label className="text-[9px] text-muted-foreground">💥 Спавн</Label>
          <Select value={config.spawnOnDeath || 'none'} onValueChange={(v) => handleChange('spawnOnDeath', v === 'none' ? undefined : v)}>
            <SelectTrigger className="h-6 text-[11px]"><SelectValue placeholder="Нет" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">Нет</SelectItem>
              {enemyTypes.map((et) => (
                <SelectItem key={et} value={et} className="text-xs">{gameConfig.enemies[et].name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-10 flex-shrink-0">
          <Label className="text-[9px] text-muted-foreground">×</Label>
          <Input type="number" value={config.spawnCount || 0} onChange={(e) => handleChange('spawnCount', e.target.value)}
            className="h-6 text-[11px] px-1" min={0} max={10} disabled={!config.spawnOnDeath} />
        </div>
      </div>
    </div>
  );
};
