import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  GameState,
  GridCell,
  Tower,
  CELL_SIZE,
  WaveInfo,
} from '@/game/types';
import {
  GRID_CONFIG,
  TOWER_CONFIGS,
  VISUAL_CONFIG,
  TowerType,
  EnemyType,
} from '@/game/config';
import { configStore, useGameConfig } from '@/game/configStore';
import { canPlaceTower } from '@/game/pathfinding';
import {
  createEnemy,
  updateEnemies,
  updateTowers,
  updateProjectiles,
  getWaveEnemies,
  getUpgradeCost,
  getSellValue,
  gridToPixel,
  recalculateEnemyPaths,
  createInitialWaveInfo,
  isBossWaveFromConfig,
} from '@/game/gameLogic';
import { useGameLoop } from '@/game/useGameLoop';
import { audioManager } from '@/game/audioManager';
import { Button } from '@/components/ui/button';
import { GameGrid } from './game/GameGrid';
import { TowerRenderer } from './game/TowerRenderer';
import { EnemyRenderer } from './game/EnemyRenderer';
import { ProjectileRenderer } from './game/ProjectileRenderer';
import { PathVisualizer } from './game/PathVisualizer';
import { TowerShop } from './game/TowerShop';
import { TowerInfo } from './game/TowerInfo';
import { GameHUD } from './game/GameHUD';
import { EnemyLegend } from './game/EnemyLegend';
import { AudioControls } from './game/AudioControls';
import { DebugConsole } from './game/DebugConsole';
import { AdminDashboard } from './admin/AdminDashboard';

const createInitialGrid = (): GridCell[][] => {
  const grid: GridCell[][] = [];
  for (let y = 0; y < GRID_CONFIG.size; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_CONFIG.size; x++) {
      row.push({ x, y, isBlocked: false, tower: null });
    }
    grid.push(row);
  }
  return grid;
};

const createInitialState = (): GameState => {
  const playerConfig = configStore.getConfig().player;
  return {
    grid: createInitialGrid(),
    towers: [],
    enemies: [],
    projectiles: [],
    wave: 0,
    lives: playerConfig.startingLives,
    gold: playerConfig.startingGold,
    gameStatus: 'menu',
    selectedTowerType: null,
    selectedTower: null,
    waveInProgress: false,
    enemiesSpawned: 0,
    enemiesToSpawn: 0,
    spawnTimer: 0,
    startCell: GRID_CONFIG.startCell,
    endCell: GRID_CONFIG.endCell,
    showPathfinding: true,
    waveInfo: createInitialWaveInfo(),
  };
};

let towerIdCounter = 0;

export const TowerDefenseGame: React.FC = () => {
  const runtimeConfig = useGameConfig();
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [canPlace, setCanPlace] = useState(false);
  const [showEnemyPath, setShowEnemyPath] = useState(VISUAL_CONFIG.showEnemyPath);
  const [autoWave, setAutoWave] = useState(false);
  const waveEnemiesRef = useRef<{ type: EnemyType; isBoss: boolean }[]>([]);
  const prevLivesRef = useRef(runtimeConfig.player.startingLives);
  const prevEnemyCountRef = useRef(0);

  const lastDeathSoundRef = useRef(0);
  useEffect(() => {
    if (gameState.lives < prevLivesRef.current) audioManager.playLifeLost();
    prevLivesRef.current = gameState.lives;
    // Throttle enemy death sounds to avoid frame hitches from many simultaneous Web Audio calls
    if (gameState.enemies.length < prevEnemyCountRef.current && prevEnemyCountRef.current > 0) {
      const now = performance.now();
      if (now - lastDeathSoundRef.current > 80) {
        audioManager.playEnemyDeath();
        lastDeathSoundRef.current = now;
      }
    }
    prevEnemyCountRef.current = gameState.enemies.length;
    if (gameState.gameStatus === 'victory') { audioManager.playVictory(); audioManager.stopMusic(); }
    else if (gameState.gameStatus === 'defeat') { audioManager.playDefeat(); audioManager.stopMusic(); }
  }, [gameState.lives, gameState.enemies.length, gameState.gameStatus]);

  const gameLoop = useCallback(
    (deltaTime: number) => {
      setGameState((prev) => {
        if (prev.gameStatus !== 'playing') return prev;
        let newState = { ...prev };
        const currentWaveConfig = configStore.getConfig().wave;

        // Spawn enemies
        if (newState.waveInProgress && newState.enemiesSpawned < newState.enemiesToSpawn) {
          newState.spawnTimer -= deltaTime;
          if (newState.spawnTimer <= 0) {
            const enemyConfig = waveEnemiesRef.current[newState.enemiesSpawned];
            if (enemyConfig) {
              const enemy = createEnemy(enemyConfig.type, newState.startCell, newState.grid, newState.endCell, enemyConfig.isBoss, newState.wave);
              if (enemy) newState.enemies = [...newState.enemies, enemy];
            }
            newState.enemiesSpawned++;
            newState.spawnTimer = currentWaveConfig.spawnInterval;
          }
        }

        newState.waveInfo = { total: newState.enemiesToSpawn, spawned: newState.enemiesSpawned, alive: newState.enemies.length };

        // Check wave complete
        if (newState.waveInProgress && newState.enemiesSpawned >= newState.enemiesToSpawn && newState.enemies.length === 0) {
          newState.waveInProgress = false;
          audioManager.playWaveComplete();
          if (autoWave) {
            const nextWave = newState.wave + 1;
            const enemies = getWaveEnemies(nextWave);
            waveEnemiesRef.current = enemies;
            audioManager.playWaveStart();
            newState.wave = nextWave;
            newState.waveInProgress = true;
            newState.enemiesSpawned = 0;
            newState.enemiesToSpawn = enemies.length;
            newState.spawnTimer = 0;
            newState.waveInfo = { total: enemies.length, spawned: 0, alive: 0 };
          }
        }

        const { updatedEnemies, reachedEnd } = updateEnemies(newState.enemies, deltaTime, newState.grid, newState.endCell);
        newState.enemies = updatedEnemies;
        if (reachedEnd.length > 0) {
          newState.lives -= reachedEnd.length;
          if (newState.lives <= 0) newState.gameStatus = 'defeat';
        }

        const { updatedTowers, newProjectiles } = updateTowers(newState.towers, newState.enemies, newState.projectiles, deltaTime);
        newState.towers = updatedTowers;
        newState.projectiles = [...newState.projectiles, ...newProjectiles];

        const projectileResult = updateProjectiles(newState.projectiles, newState.enemies, deltaTime);
        newState.projectiles = projectileResult.updatedProjectiles;
        newState.enemies = [...projectileResult.updatedEnemies, ...projectileResult.newEnemies];
        newState.gold += projectileResult.goldEarned;
        newState.waveInfo.alive = newState.enemies.length;

        return newState;
      });
    },
    [autoWave]
  );

  useGameLoop(gameLoop, gameState.gameStatus === 'playing');

  const handleCellClick = useCallback((x: number, y: number) => {
    setGameState((prev) => {
      if (prev.gameStatus !== 'playing' && prev.gameStatus !== 'paused') return prev;
      const cell = prev.grid[y][x];
      if (cell.tower) return { ...prev, selectedTower: cell.tower, selectedTowerType: null };
      if (prev.selectedTowerType) {
        const config = runtimeConfig.towers[prev.selectedTowerType] || TOWER_CONFIGS[prev.selectedTowerType];
        if (prev.gold < config.cost) return prev;
        if (!canPlaceTower(prev.grid, x, y, prev.startCell, prev.endCell, true)) return prev;
        const newTower: Tower = {
          id: `tower_${++towerIdCounter}`, type: prev.selectedTowerType,
          x: gridToPixel(x), y: gridToPixel(y), gridX: x, gridY: y, level: 1, cooldown: 0,
          damage: config.damage, range: config.range, fireRate: config.fireRate, projectileSpeed: config.projectileSpeed,
        };
        const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
        newGrid[y][x].isBlocked = true;
        newGrid[y][x].tower = newTower;
        const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell);
        audioManager.playTowerPlace();
        return { ...prev, grid: newGrid, towers: [...prev.towers, newTower], enemies: updatedEnemies, gold: prev.gold - config.cost };
      }
      return { ...prev, selectedTower: null };
    });
  }, [runtimeConfig]);

  const handleCellHover = useCallback((x: number, y: number) => {
    setHoveredCell({ x, y });
    if (gameState.selectedTowerType) {
      setCanPlace(canPlaceTower(gameState.grid, x, y, gameState.startCell, gameState.endCell, true));
    }
  }, [gameState.selectedTowerType, gameState.grid, gameState.startCell, gameState.endCell]);

  const handleCellLeave = useCallback(() => setHoveredCell(null), []);

  const handleSelectTowerType = useCallback((type: TowerType | null) => {
    setGameState((prev) => ({ ...prev, selectedTowerType: type, selectedTower: null }));
    audioManager.playClick();
  }, []);

  const handleClearHand = useCallback(() => {
    setGameState((prev) => ({ ...prev, selectedTowerType: null }));
    audioManager.playClick();
  }, []);

  const handleTowerClick = useCallback((tower: Tower) => {
    setGameState((prev) => ({ ...prev, selectedTower: tower, selectedTowerType: null }));
  }, []);

  const handleUpgrade = useCallback(() => {
    setGameState((prev) => {
      if (!prev.selectedTower || prev.selectedTower.level >= runtimeConfig.upgrade.maxLevel) return prev;
      const upgradeCost = getUpgradeCost(prev.selectedTower);
      if (prev.gold < upgradeCost) return prev;
      const updatedTower = { ...prev.selectedTower, level: prev.selectedTower.level + 1 };
      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      newGrid[updatedTower.gridY][updatedTower.gridX].tower = updatedTower;
      audioManager.playTowerUpgrade();
      return { ...prev, towers: prev.towers.map((t) => (t.id === updatedTower.id ? updatedTower : t)), grid: newGrid, gold: prev.gold - upgradeCost, selectedTower: updatedTower };
    });
  }, [runtimeConfig]);

  const handleSell = useCallback(() => {
    setGameState((prev) => {
      if (!prev.selectedTower) return prev;
      const sellValue = getSellValue(prev.selectedTower);
      const tower = prev.selectedTower;
      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      newGrid[tower.gridY][tower.gridX].isBlocked = false;
      newGrid[tower.gridY][tower.gridX].tower = null;
      const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell);
      audioManager.playTowerSell();
      return { ...prev, towers: prev.towers.filter((t) => t.id !== tower.id), grid: newGrid, enemies: updatedEnemies, gold: prev.gold + sellValue, selectedTower: null };
    });
  }, []);

  const handleStartWave = useCallback(() => {
    setGameState((prev) => {
      if (prev.waveInProgress) return prev;
      const newWave = prev.wave + 1;
      const enemies = getWaveEnemies(newWave);
      waveEnemiesRef.current = enemies;
      audioManager.playWaveStart();
      audioManager.startMusic();
      return { ...prev, wave: newWave, waveInProgress: true, enemiesSpawned: 0, enemiesToSpawn: enemies.length, spawnTimer: 0, waveInfo: { total: enemies.length, spawned: 0, alive: 0 } };
    });
  }, []);

  const handlePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, gameStatus: prev.gameStatus === 'paused' ? 'playing' : 'paused' }));
  }, []);

  const handleNewGame = useCallback(() => {
    const newState = createInitialState();
    newState.gameStatus = 'menu';
    setGameState(newState);
    waveEnemiesRef.current = [];
    towerIdCounter = 0;
    audioManager.stopMusic();
  }, []);

  const handleStartGame = useCallback(() => {
    const newState = createInitialState();
    newState.gameStatus = 'playing';
    setGameState(newState);
    waveEnemiesRef.current = [];
    towerIdCounter = 0;
    audioManager.stopMusic();
  }, []);

  const handleToggleShowPath = useCallback(() => { setShowEnemyPath((prev) => !prev); audioManager.playClick(); }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (e.target === e.currentTarget) handleClearHand();
  }, [handleClearHand]);

  const gridPixelSize = GRID_CONFIG.size * CELL_SIZE;

  const canAffordSelected = gameState.selectedTowerType
    ? gameState.gold >= (runtimeConfig.towers[gameState.selectedTowerType]?.cost || TOWER_CONFIGS[gameState.selectedTowerType]?.cost || 0)
    : true;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxWidth = Math.min(containerWidth - 8, gridPixelSize);
        setScale(maxWidth / gridPixelSize);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [gridPixelSize]);

  if (gameState.gameStatus === 'menu') {
    return <AdminDashboard onStartGame={handleStartGame} />;
  }

  const nextWaveIsBoss = isBossWaveFromConfig(gameState.wave + 1);

  return (
    <div className="h-[100dvh] flex flex-col bg-background game-container overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 sm:px-4 py-1 border-b border-border">
        <h1 className="text-sm sm:text-lg font-bold text-foreground">🏰 Tower Defense</h1>
        <Button variant="ghost" size="sm" onClick={handleNewGame} className="h-7 text-xs text-muted-foreground hover:text-foreground">
          ← Меню
        </Button>
      </div>

      {/* Game content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-1 sm:gap-2 p-1 sm:p-2 overflow-hidden">
        {/* Left sidebar */}
        <div className="lg:w-56 xl:w-64 flex-shrink-0 order-2 lg:order-1 overflow-y-auto scrollbar-thin space-y-1 sm:space-y-2">
          <GameHUD
            wave={gameState.wave} lives={gameState.lives} gold={gameState.gold}
            waveInProgress={gameState.waveInProgress} gameStatus={gameState.gameStatus}
            waveInfo={gameState.waveInfo} showEnemyPath={showEnemyPath} autoWave={autoWave}
            onStartWave={handleStartWave} onPause={handlePause} onNewGame={handleNewGame}
            onToggleShowPath={handleToggleShowPath}
            onToggleAutoWave={() => { setAutoWave((v) => !v); audioManager.playClick(); }}
          />
          <div className="hidden sm:block">
            <TowerShop gold={gameState.gold} selectedTowerType={gameState.selectedTowerType} onSelectTower={handleSelectTowerType} />
          </div>
          <div className="hidden lg:block"><AudioControls /></div>
        </div>

        {/* Game canvas */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 min-h-0" ref={containerRef}>
          <svg
            width={gridPixelSize * scale}
            height={gridPixelSize * scale}
            viewBox={`0 0 ${gridPixelSize} ${gridPixelSize}`}
            className={`border-2 rounded-lg bg-card touch-none max-h-full ${gameState.selectedTowerType && !canAffordSelected ? 'border-destructive' : 'border-border'}`}
            style={{ cursor: gameState.selectedTowerType ? (canAffordSelected ? 'crosshair' : 'not-allowed') : 'default' }}
            onClick={handleSvgClick} onTouchEnd={handleSvgClick}
          >
            <GameGrid grid={gameState.grid} startCell={gameState.startCell} endCell={gameState.endCell}
              hoveredCell={hoveredCell} canPlace={canPlace && gameState.selectedTowerType !== null && canAffordSelected}
              onCellClick={handleCellClick} onCellHover={handleCellHover} onCellLeave={handleCellLeave} />
            <PathVisualizer enemies={gameState.enemies} showPath={showEnemyPath} />
            <TowerRenderer towers={gameState.towers} selectedTower={gameState.selectedTower} onTowerClick={handleTowerClick} />
            <EnemyRenderer enemies={gameState.enemies} />
            <ProjectileRenderer projectiles={gameState.projectiles} towers={gameState.towers} />
          </svg>
          {/* Mobile tower shop */}
          <div className="sm:hidden w-full mt-1 overflow-x-auto">
            <TowerShop gold={gameState.gold} selectedTowerType={gameState.selectedTowerType} onSelectTower={handleSelectTowerType} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:w-56 xl:w-64 flex-shrink-0 order-3 overflow-y-auto scrollbar-thin space-y-1 sm:space-y-2">
          {gameState.selectedTower ? (
            <TowerInfo tower={gameState.selectedTower} gold={gameState.gold} onUpgrade={handleUpgrade} onSell={handleSell}
              onDeselect={() => setGameState((prev) => ({ ...prev, selectedTower: null }))} />
          ) : (
            <div className="bg-card p-2 sm:p-3 rounded-lg border border-border text-center text-muted-foreground text-xs">
              Нажмите на башню для информации
            </div>
          )}
          <div className="hidden sm:block"><EnemyLegend /></div>
          <div className="lg:hidden"><AudioControls /></div>
        </div>
      </div>

      <DebugConsole gameState={gameState} />
    </div>
  );
};
