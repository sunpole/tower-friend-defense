import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { WaveInfo } from '@/game/types';
import { WAVE_CONFIG } from '@/game/config';
import { Eye, EyeOff } from 'lucide-react';

interface GameHUDProps {
  wave: number;
  lives: number;
  gold: number;
  waveInProgress: boolean;
  gameStatus: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';
  waveInfo: WaveInfo;
  show8Direction: boolean;
  showEnemyPath: boolean;
  onStartWave: () => void;
  onPause: () => void;
  onNewGame: () => void;
  onTogglePathfinding: () => void;
  onToggleShowPath: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  wave,
  lives,
  gold,
  waveInProgress,
  gameStatus,
  waveInfo,
  show8Direction,
  showEnemyPath,
  onStartWave,
  onPause,
  onNewGame,
  onTogglePathfinding,
  onToggleShowPath,
}) => {
  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{wave}/{WAVE_CONFIG.totalWaves}</div>
          <div className="text-xs text-muted-foreground">Волна</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">❤️ {lives}</div>
          <div className="text-xs text-muted-foreground">Жизни</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">💰 {gold}</div>
          <div className="text-xs text-muted-foreground">Золото</div>
        </div>
      </div>

      {/* Wave Info */}
      {waveInProgress && (
        <div className="mb-4 p-2 bg-muted rounded text-center">
          <div className="text-sm font-mono">
            👾 {waveInfo.total}/{waveInfo.spawned}/{waveInfo.alive}
          </div>
          <div className="text-xs text-muted-foreground">
            всего/появилось/живо
          </div>
        </div>
      )}

      {/* Path Toggle */}
      <div className="mb-3 flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {showEnemyPath ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Путь врагов
        </span>
        <Switch
          checked={showEnemyPath}
          onCheckedChange={onToggleShowPath}
        />
      </div>

      {/* Pathfinding Toggle */}
      <div className="mb-4 flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs text-muted-foreground">
          Поиск: {show8Direction ? '8 сторон' : '4 стороны'}
        </span>
        <Switch
          checked={show8Direction}
          onCheckedChange={onTogglePathfinding}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {gameStatus === 'playing' && !waveInProgress && wave < WAVE_CONFIG.totalWaves && (
          <Button className="flex-1" onClick={onStartWave}>
            🚀 Волна {wave + 1}
          </Button>
        )}
        {gameStatus === 'playing' && waveInProgress && (
          <div className="flex-1 text-center py-2 text-muted-foreground text-sm animate-pulse">
            ⚔️ Бой...
          </div>
        )}
        {gameStatus === 'playing' && (
          <Button variant="outline" size="icon" onClick={onPause}>
            ⏸️
          </Button>
        )}
        {gameStatus === 'paused' && (
          <Button className="flex-1" onClick={onPause}>
            ▶️ Продолжить
          </Button>
        )}
        <Button variant="secondary" size="icon" onClick={onNewGame}>
          🔄
        </Button>
      </div>

      {gameStatus === 'victory' && (
        <div className="mt-4 p-4 bg-green-500/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-500">🎉 ПОБЕДА!</div>
          <div className="text-sm text-muted-foreground">Все волны пройдены!</div>
        </div>
      )}

      {gameStatus === 'defeat' && (
        <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-500">💀 ПОРАЖЕНИЕ</div>
          <div className="text-sm text-muted-foreground">Враги прорвались!</div>
        </div>
      )}
    </div>
  );
};
