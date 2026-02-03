import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameConfig, configStore } from '@/game/configStore';
import { TowerType, EnemyType } from '@/game/config';
import { TowerConfigPanel } from './TowerConfigPanel';
import { EnemyConfigPanel } from './EnemyConfigPanel';
import { WaveConfigPanel } from './WaveConfigPanel';
import { GeneralConfigPanel } from './GeneralConfigPanel';
import { Download, Upload, RotateCcw, Play, Settings, Swords, Users, Waves, Sliders } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onStartGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onStartGame }) => {
  const config = useGameConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('towers');

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

  const towerTypes = Object.keys(config.towers) as TowerType[];
  const enemyTypes = Object.keys(config.enemies) as EnemyType[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Tower Defense</h1>
              <p className="text-xs text-muted-foreground">Панель управления</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleImport} className="hidden sm:flex">
              <Upload className="w-4 h-4 mr-1" />
              Импорт
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
              <Download className="w-4 h-4 mr-1" />
              Экспорт
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="hidden sm:flex">
              <RotateCcw className="w-4 h-4 mr-1" />
              Сброс
            </Button>
            <Button onClick={onStartGame} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Play className="w-4 h-4 mr-1" />
              Играть
            </Button>
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="sm:hidden px-4 pb-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport} className="flex-1">
            <Upload className="w-4 h-4 mr-1" />
            Импорт
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
            <Download className="w-4 h-4 mr-1" />
            Экспорт
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-1" />
            Сброс
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{towerTypes.length}</p>
                  <p className="text-xs text-muted-foreground">Башен</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{enemyTypes.length}</p>
                  <p className="text-xs text-muted-foreground">Врагов</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{config.player.startingGold}</p>
                  <p className="text-xs text-muted-foreground">Стартовое золото</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">∞</p>
                  <p className="text-xs text-muted-foreground">Волн</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-12 mb-4">
            <TabsTrigger value="towers" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline">Башни</span>
            </TabsTrigger>
            <TabsTrigger value="enemies" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Враги</span>
            </TabsTrigger>
            <TabsTrigger value="waves" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Waves className="w-4 h-4" />
              <span className="hidden sm:inline">Волны</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Общее</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="towers" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                {towerTypes.map((type) => (
                  <TowerConfigPanel key={type} type={type} config={config.towers[type]} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="enemies" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                {enemyTypes.map((type) => (
                  <EnemyConfigPanel key={type} type={type} config={config.enemies[type]} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="waves" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)]">
              <WaveConfigPanel
                waveConfig={config.wave}
                bossConfig={config.boss}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="general" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)]">
              <GeneralConfigPanel
                playerConfig={config.player}
                upgradeConfig={config.upgrade}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
