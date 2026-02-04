import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const EnemyConfigPanel: React.FC<EnemyConfigPanelProps> = ({ type, config }) => {
  const gameConfig = useGameConfig();
  const enemyTypes = Object.keys(gameConfig.enemies);

  const handleChange = (field: keyof EnemyConfig, value: string | number | undefined) => {
    const numericFields = ['hp', 'speed', 'reward', 'spawnCount'];
    let finalValue: string | number | undefined = value;

    if (numericFields.includes(field) && value !== undefined) {
      finalValue = Number(value);
    }

    configStore.updateEnemy(type, { [field]: finalValue });
  };

  const handleDelete = () => {
    const defaultTypes = ['simple', 'fat', 'thin', 'double', 'ghost', 'armored'];
    if (defaultTypes.includes(type)) {
      toast.error('Нельзя удалить стандартного врага');
      return;
    }
    configStore.deleteEnemy(type);
    toast.success(`Враг "${config.name}" удалён`);
  };

  const isCustom = !['simple', 'fat', 'thin', 'double', 'ghost', 'armored'].includes(type);

  return (
    <Card className="relative overflow-hidden border hover:border-primary/50 transition-colors">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: config.color }}
      />
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: config.color }}
          >
            {type.charAt(0).toUpperCase()}
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
        {/* Core Stats - Compact */}
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <Label className="text-[10px] text-muted-foreground">❤️ HP</Label>
            <Input
              type="number"
              value={config.hp}
              onChange={(e) => handleChange('hp', e.target.value)}
              className="h-7 text-xs"
              min={1}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">🏃 Скор.</Label>
            <Input
              type="number"
              value={config.speed}
              onChange={(e) => handleChange('speed', e.target.value)}
              className="h-7 text-xs"
              min={1}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">💰 Нагр.</Label>
            <Input
              type="number"
              value={config.reward}
              onChange={(e) => handleChange('reward', e.target.value)}
              className="h-7 text-xs"
              min={1}
            />
          </div>
        </div>

        {/* Color */}
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={config.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-7 h-7 rounded border border-border cursor-pointer flex-shrink-0"
          />
          <Input
            value={config.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="h-7 text-xs flex-1 font-mono"
          />
        </div>

        {/* Spawn on Death - Compact */}
        <div className="p-2 bg-muted/50 rounded border border-border">
          <Label className="text-[10px] text-muted-foreground mb-1 block">💥 При смерти</Label>
          <div className="grid grid-cols-2 gap-1.5">
            <Select
              value={config.spawnOnDeath || 'none'}
              onValueChange={(v) => handleChange('spawnOnDeath', v === 'none' ? undefined : v)}
            >
              <SelectTrigger className="h-7 text-xs">
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
            <Input
              type="number"
              value={config.spawnCount || 0}
              onChange={(e) => handleChange('spawnCount', e.target.value)}
              className="h-7 text-xs"
              min={0}
              max={10}
              disabled={!config.spawnOnDeath}
              placeholder="Кол-во"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
