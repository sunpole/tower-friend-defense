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
  showEnemyPath: boolean;
  autoWave: boolean;
  onStartWave: () => void;
  onPause: () => void;
  onNewGame: () => void;
  onToggleShowPath: () => void;
  onToggleAutoWave: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  wave,
  lives,
  gold,
  waveInProgress,
  gameStatus,
  waveInfo,
  showEnemyPath,
  autoWave,
  onStartWave,
  onPause,
  onNewGame,
  onToggleShowPath,
  onToggleAutoWave,
}) => {
  const wavesLabel = WAVE_CONFIG.totalWaves === Infinity ? '∞' : String(WAVE_CONFIG.totalWaves);

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {wave}/{wavesLabel}
          </div>
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
          <div className="text-sm font-mono">👾 {waveInfo.total}/{waveInfo.spawned}/{waveInfo.alive}</div>
          <div className="text-xs text-muted-foreground">всего/появилось/живо</div>
        </div>
      )}

      {/* Path Toggle */}
      <div className="mb-3 flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {showEnemyPath ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Путь врагов
        </span>
        <Switch checked={showEnemyPath} onCheckedChange={onToggleShowPath} />
      </div>

      {/* Auto wave */}
      <div className="mb-4 flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs text-muted-foreground">Автоволна</span>
        <Switch checked={autoWave} onCheckedChange={onToggleAutoWave} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {gameStatus === 'playing' && !waveInProgress && (
          <Button className="flex-1" onClick={onStartWave}>
            🚀 Следующая волна
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

      {gameStatus === 'defeat' && (
        <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-500">💀 ПОРАЖЕНИЕ</div>
          <div className="text-sm text-muted-foreground">Враги прорвались!</div>
        </div>
      )}
    </div>
  );
};

