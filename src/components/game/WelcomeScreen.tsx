import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  WAVE_CONFIG,
  UPGRADE_CONFIG,
  BOSS_CONFIG,
  PLAYER_CONFIG,
  GAME_VERSION,
  getTowerStatsForLevel,
  TowerType,
  EnemyType,
} from '@/game/config';

interface WelcomeScreenProps {
  onStartGame: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame }) => {
  const towerTypes = Object.keys(TOWER_CONFIGS) as TowerType[];
  const enemyTypes = Object.keys(ENEMY_CONFIGS) as EnemyType[];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 text-center border-b border-border">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            🏰 Tower Defense
          </h1>
          <p className="text-muted-foreground">Версия {GAME_VERSION}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Защитите базу от волн врагов! Стройте башни, создавая лабиринт.
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <Tabs defaultValue="towers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="towers">🏗️ Башни</TabsTrigger>
              <TabsTrigger value="enemies">👾 Враги</TabsTrigger>
              <TabsTrigger value="waves">🌊 Волны</TabsTrigger>
            </TabsList>

            {/* Towers Tab */}
            <TabsContent value="towers">
              <ScrollArea className="h-[350px] sm:h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>💰 Стартовое золото: <span className="text-primary font-bold">{PLAYER_CONFIG.startingGold}</span></p>
                    <p>🔧 Макс. уровень: <span className="text-primary font-bold">{UPGRADE_CONFIG.maxLevel}</span></p>
                    <p>💵 Продажа: <span className="text-primary font-bold">{Math.round(UPGRADE_CONFIG.getSellValueMultiplier * 100)}%</span> от вложенного</p>
                  </div>

                  {towerTypes.map((type) => {
                    const config = TOWER_CONFIGS[type];
                    return (
                      <div key={type} className="bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: config.color + '30' }}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{config.name}</h3>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                          <div className="ml-auto text-right">
                            <span className="text-primary font-bold">{config.cost} 💰</span>
                          </div>
                        </div>

                        {/* Level stats */}
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          <div className="text-muted-foreground font-medium">Ур.</div>
                          <div className="text-muted-foreground font-medium">Урон</div>
                          <div className="text-muted-foreground font-medium">Дальн.</div>
                          <div className="text-muted-foreground font-medium">Скор.</div>
                          <div className="text-muted-foreground font-medium">Цена ⬆️</div>
                          
                          {[1, 2, 3, 4, 5].map((level) => {
                            const stats = getTowerStatsForLevel(type, level);
                            const upgradeCost = level < 5 ? UPGRADE_CONFIG.getUpgradeCost(config.cost, level) : '-';
                            return (
                              <React.Fragment key={level}>
                                <div className="text-foreground font-bold">{level}</div>
                                <div className="text-red-400">{stats.damage}</div>
                                <div className="text-blue-400">{stats.range}</div>
                                <div className="text-green-400">{stats.fireRate.toFixed(1)}</div>
                                <div className="text-yellow-400">{upgradeCost}</div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Enemies Tab */}
            <TabsContent value="enemies">
              <ScrollArea className="h-[350px] sm:h-[400px] pr-4">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="font-bold text-destructive mb-1">⚠️ Боссы (каждые {WAVE_CONFIG.bossWaveInterval} волн):</p>
                    <p>• HP ×{BOSS_CONFIG.hpMultiplier} | Скорость ×{BOSS_CONFIG.speedMultiplier} | Награда ×{BOSS_CONFIG.rewardMultiplier}</p>
                    <p className="mt-1">• В волне босса — только босс!</p>
                  </div>

                  {enemyTypes.map((type) => {
                    const config = ENEMY_CONFIGS[type];
                    return (
                      <div key={type} className="bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: config.color }}
                          >
                            {type.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{config.name}</h3>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-background/50 rounded p-2 text-center">
                            <div className="text-red-400 font-bold">{config.hp}</div>
                            <div className="text-xs text-muted-foreground">HP</div>
                          </div>
                          <div className="bg-background/50 rounded p-2 text-center">
                            <div className="text-blue-400 font-bold">{config.speed}</div>
                            <div className="text-xs text-muted-foreground">Скорость</div>
                          </div>
                          <div className="bg-background/50 rounded p-2 text-center">
                            <div className="text-yellow-400 font-bold">{config.reward} 💰</div>
                            <div className="text-xs text-muted-foreground">Награда</div>
                          </div>
                        </div>

                        {config.spawnOnDeath && (
                          <div className="mt-2 text-xs text-orange-400 bg-orange-400/10 rounded p-2">
                            💥 При смерти: {config.spawnCount}× {ENEMY_CONFIGS[config.spawnOnDeath].name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Waves Tab */}
            <TabsContent value="waves">
              <ScrollArea className="h-[350px] sm:h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-bold text-foreground mb-3">📊 Формирование волн</h3>
                    <div className="space-y-2 text-sm">
                      <p>• <span className="text-primary">Бесконечные волны</span> — играйте сколько хотите!</p>
                      <p>• Враги на волне: <span className="text-primary font-mono">{WAVE_CONFIG.baseEnemiesPerWave} + номер_волны + волна/5</span></p>
                      <p>• Новые типы врагов появляются каждые 3 волны</p>
                      <p>• Интервал спавна: <span className="text-primary">{WAVE_CONFIG.spawnInterval}с</span></p>
                    </div>
                  </div>

                  <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
                    <h3 className="font-bold text-destructive mb-3">👑 Волны боссов</h3>
                    <div className="space-y-2 text-sm">
                      <p>• Каждая <span className="text-destructive font-bold">{WAVE_CONFIG.bossWaveInterval}-я</span> волна — волна босса</p>
                      <p>• В волне босса появляется <span className="text-destructive font-bold">только 1 босс</span></p>
                      <p>• Босс: HP ×{BOSS_CONFIG.hpMultiplier}, медленнее, но награда ×{BOSS_CONFIG.rewardMultiplier}</p>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                    <h3 className="font-bold text-orange-400 mb-3">📈 Сложность после 20 волны</h3>
                    <div className="space-y-2 text-sm">
                      <p>• HP врагов: <span className="text-orange-400 font-bold">+15%</span> за каждую волну</p>
                      <p>• Скорость врагов: <span className="text-orange-400 font-bold">+5%</span> за каждую волну</p>
                      <p>• Это накопительный эффект!</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-bold text-foreground mb-3">🎮 Примеры волн</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[1, 5, 10, 15, 20, 25].map((wave) => {
                        const isBoss = wave % WAVE_CONFIG.bossWaveInterval === 0;
                        const count = isBoss ? 1 : WAVE_CONFIG.getEnemiesCount(wave);
                        return (
                          <div
                            key={wave}
                            className={`p-2 rounded ${
                              isBoss ? 'bg-destructive/20 border border-destructive/50' : 'bg-background/50'
                            }`}
                          >
                            <span className="font-bold">Волна {wave}:</span>{' '}
                            {isBoss ? (
                              <span className="text-destructive">👑 БОСС</span>
                            ) : (
                              <span>{count} врагов</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
          <Button
            onClick={onStartGame}
            size="lg"
            className="w-full text-lg font-bold"
          >
            🎮 Начать игру
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            ❤️ {PLAYER_CONFIG.startingLives} жизней • 💰 {PLAYER_CONFIG.startingGold} золота
          </p>
        </div>
      </div>
    </div>
  );
};
