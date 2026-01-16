import React, { useState, useEffect } from 'react';
import { GameState } from '@/game/types';

interface DebugConsoleProps {
  gameState: GameState;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ gameState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const newLog = `[${new Date().toLocaleTimeString()}] Wave: ${gameState.wave}, Enemies: ${gameState.enemies.length}, Towers: ${gameState.towers.length}, Gold: ${gameState.gold}`;
    setLogs((prev) => [...prev.slice(-50), newLog]);
  }, [gameState.wave, gameState.enemies.length, gameState.towers.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 bg-black/90 text-green-400 font-mono text-xs p-4 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-bold">Debug Console (F12 to toggle)</span>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-400">
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4 border-b border-green-800 pb-2">
        <div>
          <p>Status: {gameState.gameStatus}</p>
          <p>Wave: {gameState.wave}/20</p>
          <p>Lives: {gameState.lives}</p>
          <p>Gold: {gameState.gold}</p>
        </div>
        <div>
          <p>Enemies: {gameState.enemies.length}</p>
          <p>To Spawn: {gameState.enemiesToSpawn - gameState.enemiesSpawned}</p>
          <p>Towers: {gameState.towers.length}</p>
          <p>Projectiles: {gameState.projectiles.length}</p>
        </div>
        <div>
          <p>Wave Active: {gameState.waveInProgress ? 'Yes' : 'No'}</p>
          <p>Selected Tower: {gameState.selectedTower?.type || 'None'}</p>
          <p>Selected Type: {gameState.selectedTowerType || 'None'}</p>
        </div>
      </div>

      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};
