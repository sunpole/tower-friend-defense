import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { configStore } from '@/game/configStore';
import { EnemyConfig, TowerConfig, ProjectileType } from '@/game/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'tower' | 'enemy';
}

export const CreateTypeDialog: React.FC<CreateTypeDialogProps> = ({
  open,
  onOpenChange,
  type,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  
  // Tower fields
  const [damage, setDamage] = useState(30);
  const [range, setRange] = useState(150);
  const [fireRate, setFireRate] = useState(1);
  const [projectileSpeed, setProjectileSpeed] = useState(400);
  const [cost, setCost] = useState(50);
  const [towerColor, setTowerColor] = useState('#60a5fa');
  const [projectileType, setProjectileType] = useState<ProjectileType>('bullet');
  const [icon, setIcon] = useState('🏰');
  
  // Enemy fields
  const [hp, setHp] = useState(100);
  const [speed, setSpeed] = useState(50);
  const [reward, setReward] = useState(10);
  const [enemyColor, setEnemyColor] = useState('#ef4444');

  const handleCreate = () => {
    const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!cleanId || !name) {
      toast.error('Заполните ID и название');
      return;
    }

    if (type === 'tower') {
      const towerConfig: TowerConfig = {
        name,
        description: `Кастомная башня: ${name}`,
        damage,
        range,
        fireRate,
        projectileSpeed,
        cost,
        color: towerColor,
        projectileType,
        icon,
      };
      
      const success = configStore.addTower(cleanId, towerConfig);
      if (success) {
        toast.success(`Башня "${name}" создана!`);
        resetForm();
        onOpenChange(false);
      } else {
        toast.error(`Башня с ID "${cleanId}" уже существует`);
      }
    } else {
      const enemyConfig: EnemyConfig = {
        name,
        description: `Кастомный враг: ${name}`,
        hp,
        speed,
        reward,
        color: enemyColor,
      };
      
      const success = configStore.addEnemy(cleanId, enemyConfig);
      if (success) {
        toast.success(`Враг "${name}" создан!`);
        resetForm();
        onOpenChange(false);
      } else {
        toast.error(`Враг с ID "${cleanId}" уже существует`);
      }
    }
  };

  const resetForm = () => {
    setId('');
    setName('');
    setDamage(30);
    setRange(150);
    setFireRate(1);
    setProjectileSpeed(400);
    setCost(50);
    setTowerColor('#60a5fa');
    setProjectileType('bullet');
    setIcon('🏰');
    setHp(100);
    setSpeed(50);
    setReward(10);
    setEnemyColor('#ef4444');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'tower' ? '🏰 Новая башня' : '👾 Новый враг'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Common fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">ID (латиница)</Label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="myunit"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Название</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Моя башня"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {type === 'tower' ? (
            <>
              {/* Tower specific fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">⚔️ Урон</Label>
                  <Input
                    type="number"
                    value={damage}
                    onChange={(e) => setDamage(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs">🎯 Дальность</Label>
                  <Input
                    type="number"
                    value={range}
                    onChange={(e) => setRange(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={30}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">⚡ Скорострельность</Label>
                  <Input
                    type="number"
                    value={fireRate}
                    onChange={(e) => setFireRate(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={0.1}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="text-xs">🚀 Скорость снаряда</Label>
                  <Input
                    type="number"
                    value={projectileSpeed}
                    onChange={(e) => setProjectileSpeed(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">💰 Стоимость</Label>
                  <Input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={10}
                  />
                </div>
                <div>
                  <Label className="text-xs">Тип атаки</Label>
                  <Select value={projectileType} onValueChange={(v) => setProjectileType(v as ProjectileType)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullet">🔵 Пуля</SelectItem>
                      <SelectItem value="line">⚡ Лазер</SelectItem>
                      <SelectItem value="aoe">💥 АОЕ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Цвет</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={towerColor}
                      onChange={(e) => setTowerColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={towerColor}
                      onChange={(e) => setTowerColor(e.target.value)}
                      className="h-8 text-sm flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Иконка (emoji)</Label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="h-8 text-sm text-center text-xl"
                    maxLength={4}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Enemy specific fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">❤️ HP</Label>
                  <Input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs">🏃 Скорость</Label>
                  <Input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs">💰 Награда</Label>
                  <Input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="h-8 text-sm"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Цвет</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={enemyColor}
                    onChange={(e) => setEnemyColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={enemyColor}
                    onChange={(e) => setEnemyColor(e.target.value)}
                    className="h-8 text-sm flex-1 font-mono"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
