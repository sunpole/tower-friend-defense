import React from 'react';
import { Button } from '@/components/ui/button';
import { TOTAL_WAVES } from '@/game/types';

interface GameHUDProps {
  wave: number;
  lives: number;
  gold: number;
  waveInProgress: boolean;
  gameStatus: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';
  onStartWave: () => void;
  onPause: () => void;
  onNewGame: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  wave,
  lives,
  gold,
  waveInProgress,
  gameStatus,
  onStartWave,
  onPause,
  onNewGame,
}) => {
  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{wave}/{TOTAL_WAVES}</div>
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

      <div className="flex gap-2">
        {gameStatus === 'playing' && !waveInProgress && wave < TOTAL_WAVES && (
          <Button className="flex-1" onClick={onStartWave}>
            Начать волну {wave + 1}
          </Button>
        )}
        {gameStatus === 'playing' && waveInProgress && (
          <div className="flex-1 text-center py-2 text-muted-foreground">
            Волна в процессе...
          </div>
        )}
        {gameStatus === 'playing' && (
          <Button variant="outline" onClick={onPause}>
            ⏸️
          </Button>
        )}
        {gameStatus === 'paused' && (
          <Button className="flex-1" onClick={onPause}>
            ▶️ Продолжить
          </Button>
        )}
        <Button variant="secondary" onClick={onNewGame}>
          🔄 Новая игра
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
