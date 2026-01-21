import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { WaveInfo } from '@/game/types';
import { WAVE_CONFIG, isBossWave } from '@/game/config';
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
  const nextWave = wave + 1;
  const nextIsBoss = isBossWave(nextWave);
  const currentIsBoss = isBossWave(wave);

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {wave}/{wavesLabel}
          </div>
          <div className="text-xs text-muted-foreground">Волна</div>
          {currentIsBoss && waveInProgress && (
            <div className="text-xs text-destructive font-bold animate-pulse">👑 БОСС!</div>
          )}
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
        <div className={`mb-4 p-2 rounded text-center ${currentIsBoss ? 'bg-destructive/20 border border-destructive/50' : 'bg-muted'}`}>
          <div className="text-sm font-mono">
            {currentIsBoss ? '👑 БОСС' : `👾 ${waveInfo.total}/${waveInfo.spawned}/${waveInfo.alive}`}
          </div>
          {!currentIsBoss && (
            <div className="text-xs text-muted-foreground">всего/появилось/живо</div>
          )}
        </div>
      )}

      {/* Next wave warning */}
      {!waveInProgress && nextIsBoss && (
        <div className="mb-3 p-2 bg-destructive/20 border border-destructive/50 rounded text-center animate-pulse">
          <div className="text-sm font-bold text-destructive">⚠️ СЛЕДУЮЩАЯ ВОЛНА — БОСС! 👑</div>
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
          <Button 
            className={`flex-1 ${nextIsBoss ? 'bg-destructive hover:bg-destructive/90' : ''}`} 
            onClick={onStartWave}
          >
            {nextIsBoss ? '👑 Волна босса!' : '🚀 Следующая волна'}
          </Button>
        )}
        {gameStatus === 'playing' && waveInProgress && (
          <div className={`flex-1 text-center py-2 text-sm animate-pulse ${currentIsBoss ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
            {currentIsBoss ? '⚔️ БОЙ С БОССОМ!' : '⚔️ Бой...'}
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
          <div className="text-xs text-muted-foreground mt-1">Вы дошли до волны {wave}</div>
        </div>
      )}
    </div>
  );
};

