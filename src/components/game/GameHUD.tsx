import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { WaveInfo } from '@/game/types';
import { isBossWaveFromConfig } from '@/game/gameLogic';
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
  wave, lives, gold, waveInProgress, gameStatus, waveInfo,
  showEnemyPath, autoWave, onStartWave, onPause, onNewGame,
  onToggleShowPath, onToggleAutoWave,
}) => {
  const nextIsBoss = isBossWaveFromConfig(wave + 1);
  const currentIsBoss = isBossWaveFromConfig(wave);

  return (
    <div className="bg-card p-2 sm:p-3 rounded-lg border border-border">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-foreground">{wave}</div>
          <div className="text-[10px] text-muted-foreground">Волна</div>
          {currentIsBoss && waveInProgress && (
            <div className="text-[10px] text-destructive font-bold animate-pulse">👑 БОСС</div>
          )}
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-red-400">❤️ {lives}</div>
          <div className="text-[10px] text-muted-foreground">Жизни</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-yellow-400">💰 {gold}</div>
          <div className="text-[10px] text-muted-foreground">Золото</div>
        </div>
      </div>

      {/* Wave progress */}
      {waveInProgress && (
        <div className={`mb-2 p-1.5 rounded text-center text-xs ${currentIsBoss ? 'bg-destructive/20 border border-destructive/40' : 'bg-muted/50'}`}>
          {currentIsBoss ? '👑 БОЙ С БОССОМ!' : `👾 ${waveInfo.spawned}/${waveInfo.total} | живых: ${waveInfo.alive}`}
        </div>
      )}

      {/* Boss warning */}
      {!waveInProgress && nextIsBoss && (
        <div className="mb-2 p-1.5 bg-destructive/20 border border-destructive/40 rounded text-center animate-pulse">
          <div className="text-xs font-bold text-destructive">⚠️ Следующая — БОСС! 👑</div>
        </div>
      )}

      {/* Toggles */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 flex items-center justify-between p-1.5 bg-muted/30 rounded text-[10px]">
          <span className="text-muted-foreground flex items-center gap-1">
            {showEnemyPath ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Путь
          </span>
          <Switch checked={showEnemyPath} onCheckedChange={onToggleShowPath} className="scale-75" />
        </div>
        <div className="flex-1 flex items-center justify-between p-1.5 bg-muted/30 rounded text-[10px]">
          <span className="text-muted-foreground">Авто</span>
          <Switch checked={autoWave} onCheckedChange={onToggleAutoWave} className="scale-75" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        {gameStatus === 'playing' && !waveInProgress && (
          <Button className={`flex-1 h-8 text-xs ${nextIsBoss ? 'bg-destructive hover:bg-destructive/90' : ''}`} onClick={onStartWave}>
            {nextIsBoss ? '👑 Босс!' : '🚀 Волна'}
          </Button>
        )}
        {gameStatus === 'playing' && waveInProgress && (
          <div className={`flex-1 text-center py-1.5 text-xs animate-pulse ${currentIsBoss ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
            ⚔️ {currentIsBoss ? 'БОСС!' : 'Бой...'}
          </div>
        )}
        {gameStatus === 'playing' && (
          <Button variant="outline" size="icon" onClick={onPause} className="h-8 w-8">⏸️</Button>
        )}
        {gameStatus === 'paused' && (
          <Button className="flex-1 h-8 text-xs" onClick={onPause}>▶️ Продолжить</Button>
        )}
        <Button variant="secondary" size="icon" onClick={onNewGame} className="h-8 w-8">🔄</Button>
      </div>

      {/* Game over */}
      {gameStatus === 'defeat' && (
        <div className="mt-2 p-3 bg-destructive/20 rounded text-center">
          <div className="text-xl font-bold text-destructive">💀 ПОРАЖЕНИЕ</div>
          <div className="text-xs text-muted-foreground">Волна {wave}</div>
        </div>
      )}
    </div>
  );
};
