import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameConfig, configStore } from '@/game/configStore';
import { TowerConfigPanel } from './TowerConfigPanel';
import { EnemyConfigPanel } from './EnemyConfigPanel';
import { WaveConfigPanel } from './WaveConfigPanel';
import { GeneralConfigPanel } from './GeneralConfigPanel';
import { CreateTypeDialog } from './CreateTypeDialog';
import { Download, Upload, RotateCcw, Play, Swords, Users, Waves, Sliders, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onStartGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onStartGame }) => {
  const config = useGameConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('towers');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'tower' | 'enemy'>('tower');

  const handleExport = () => {
    const jsonStr = configStore.exportConfig();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tower-defense-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Конфигурация экспортирована!');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = configStore.importConfig(content);
      if (success) {
        toast.success('Конфигурация импортирована!');
      } else {
        toast.error('Ошибка импорта: неверный формат файла');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    configStore.resetToDefaults();
    toast.success('Настройки сброшены по умолчанию');
  };

  const handleCreateNew = (type: 'tower' | 'enemy') => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const towerTypes = Object.keys(config.towers);
  const enemyTypes = Object.keys(config.enemies);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Header - Compact */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Swords className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">Tower Defense</h1>
              <p className="text-[10px] text-muted-foreground">Панель управления</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleImport} className="h-7 px-2 text-xs">
              <Upload className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Импорт</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-7 px-2 text-xs">
              <Download className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
              <RotateCcw className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Сброс</span>
            </Button>
            <Button onClick={onStartGame} size="sm" className="h-7 px-3 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Play className="w-3 h-3 mr-1" />
              Играть
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Row - Compact */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-blue-500" />
              <span className="font-bold">{towerTypes.length}</span> башен
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-red-500" />
              <span className="font-bold">{enemyTypes.length}</span> врагов
            </span>
            <span className="flex items-center gap-1">
              💰 <span className="font-bold">{config.player.startingGold}</span>
            </span>
            <span className="flex items-center gap-1">
              ❤️ <span className="font-bold">{config.player.startingLives}</span>
            </span>
          </div>
          <span className="text-muted-foreground">Авто-сохранение ✓</span>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-hidden p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 w-full grid grid-cols-4 h-8 mb-2">
            <TabsTrigger value="towers" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Swords className="w-3 h-3 mr-1" />
              Башни
            </TabsTrigger>
            <TabsTrigger value="enemies" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-3 h-3 mr-1" />
              Враги
            </TabsTrigger>
            <TabsTrigger value="waves" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Waves className="w-3 h-3 mr-1" />
              Волны
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sliders className="w-3 h-3 mr-1" />
              Общее
            </TabsTrigger>
          </TabsList>

          <TabsContent value="towers" className="flex-1 mt-0 overflow-auto">
            <div className="mb-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleCreateNew('tower')}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Новая башня
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {towerTypes.map((type) => (
                <TowerConfigPanel key={type} type={type} config={config.towers[type]} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enemies" className="flex-1 mt-0 overflow-auto">
            <div className="mb-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleCreateNew('enemy')}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Новый враг
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {enemyTypes.map((type) => (
                <EnemyConfigPanel key={type} type={type} config={config.enemies[type]} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="waves" className="flex-1 mt-0 overflow-auto">
            <WaveConfigPanel
              waveConfig={config.wave}
              bossConfig={config.boss}
            />
          </TabsContent>

          <TabsContent value="general" className="flex-1 mt-0 overflow-auto">
            <GeneralConfigPanel
              playerConfig={config.player}
              upgradeConfig={config.upgrade}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CreateTypeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        type={createType}
      />
    </div>
  );
};
