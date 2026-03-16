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
    a.download = `td-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Конфигурация экспортирована!');
  };

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = configStore.importConfig(event.target?.result as string);
      toast[success ? 'success' : 'error'](
        success ? 'Конфигурация импортирована!' : 'Ошибка: неверный формат'
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    configStore.resetToDefaults();
    toast.success('Настройки сброшены');
  };

  const handleCreateNew = (type: 'tower' | 'enemy') => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const towerTypes = Object.keys(config.towers);
  const enemyTypes = Object.keys(config.enemies);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-3 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
              <Swords className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-sm font-bold text-foreground">Tower Defense</h1>
              <p className="text-[10px] text-muted-foreground">Game Config</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <Button variant="ghost" size="sm" onClick={handleImport} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Upload className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Импорт</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Download className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Сброс</span>
            </Button>
            <Button
              onClick={onStartGame}
              size="sm"
              className="h-7 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground ml-1"
            >
              <Play className="w-3 h-3 mr-1" />
              Играть
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="flex-shrink-0 px-3 py-1 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4">
            <span><Swords className="w-3 h-3 inline text-blue-400 mr-0.5" /><b className="text-foreground">{towerTypes.length}</b> башен</span>
            <span><Users className="w-3 h-3 inline text-red-400 mr-0.5" /><b className="text-foreground">{enemyTypes.length}</b> врагов</span>
            <span className="hidden sm:inline">💰 <b className="text-foreground">{config.player.startingGold}</b></span>
            <span className="hidden sm:inline">❤️ <b className="text-foreground">{config.player.startingLives}</b></span>
          </div>
          <span className="text-primary text-[10px]">● localStorage</span>
        </div>
      </div>

      {/* Main Tabs */}
      <main className="flex-1 min-h-0 flex flex-col p-2 sm:p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="flex-shrink-0 w-full grid grid-cols-4 h-8 mb-2 bg-muted/50">
            <TabsTrigger value="towers" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Swords className="w-3 h-3" />
              <span className="hidden xs:inline">Башни</span>
            </TabsTrigger>
            <TabsTrigger value="enemies" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Users className="w-3 h-3" />
              <span className="hidden xs:inline">Враги</span>
            </TabsTrigger>
            <TabsTrigger value="waves" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Waves className="w-3 h-3" />
              <span className="hidden xs:inline">Волны</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Sliders className="w-3 h-3" />
              <span className="hidden xs:inline">Общее</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <TabsContent value="towers" className="mt-0 h-full">
              <div className="mb-2">
                <Button size="sm" variant="outline" onClick={() => handleCreateNew('tower')} className="h-6 text-[11px] px-2">
                  <Plus className="w-3 h-3 mr-1" /> Новая башня
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {towerTypes.map((type) => (
                  <TowerConfigPanel key={type} type={type} config={config.towers[type]} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="enemies" className="mt-0 h-full">
              <div className="mb-2">
                <Button size="sm" variant="outline" onClick={() => handleCreateNew('enemy')} className="h-6 text-[11px] px-2">
                  <Plus className="w-3 h-3 mr-1" /> Новый враг
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {enemyTypes.map((type) => (
                  <EnemyConfigPanel key={type} type={type} config={config.enemies[type]} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="waves" className="mt-0">
              <WaveConfigPanel waveConfig={config.wave} bossConfig={config.boss} />
            </TabsContent>

            <TabsContent value="general" className="mt-0">
              <GeneralConfigPanel playerConfig={config.player} upgradeConfig={config.upgrade} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <CreateTypeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} type={createType} />
    </div>
  );
};
