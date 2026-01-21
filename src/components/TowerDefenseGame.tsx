import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  GameState,
  GridCell,
  Tower,
  CELL_SIZE,
  STARTING_GOLD,
  STARTING_LIVES,
  WaveInfo,
} from '@/game/types';
import {
  GRID_CONFIG,
  TOWER_CONFIGS,
  WAVE_CONFIG,
  VISUAL_CONFIG,
  UPGRADE_CONFIG,
  TowerType,
  EnemyType,
  isBossWave,
} from '@/game/config';
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
import { WelcomeScreen } from './game/WelcomeScreen';

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

const createInitialState = (): GameState => ({
  grid: createInitialGrid(),
  towers: [],
  enemies: [],
  projectiles: [],
  wave: 0,
  lives: STARTING_LIVES,
  gold: STARTING_GOLD,
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
});

let towerIdCounter = 0;

export const TowerDefenseGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [canPlace, setCanPlace] = useState(false);
  const [showEnemyPath, setShowEnemyPath] = useState(VISUAL_CONFIG.showEnemyPath);
  const [autoWave, setAutoWave] = useState(false);
  const waveEnemiesRef = useRef<{ type: EnemyType; isBoss: boolean }[]>([]);
  const prevLivesRef = useRef(STARTING_LIVES);
  const prevEnemyCountRef = useRef(0);

  // Track game state changes for audio
  useEffect(() => {
    if (gameState.lives < prevLivesRef.current) {
      audioManager.playLifeLost();
    }
    prevLivesRef.current = gameState.lives;

    if (gameState.enemies.length < prevEnemyCountRef.current && prevEnemyCountRef.current > 0) {
      audioManager.playEnemyDeath();
    }
    prevEnemyCountRef.current = gameState.enemies.length;

    if (gameState.gameStatus === 'victory') {
      audioManager.playVictory();
      audioManager.stopMusic();
    } else if (gameState.gameStatus === 'defeat') {
      audioManager.playDefeat();
      audioManager.stopMusic();
    }
  }, [gameState.lives, gameState.enemies.length, gameState.gameStatus]);

  const gameLoop = useCallback(
    (deltaTime: number) => {
      setGameState((prev) => {
        if (prev.gameStatus !== 'playing') return prev;

        let newState = { ...prev };

        // Spawn enemies
        if (newState.waveInProgress && newState.enemiesSpawned < newState.enemiesToSpawn) {
          newState.spawnTimer -= deltaTime;
          if (newState.spawnTimer <= 0) {
            const enemyConfig = waveEnemiesRef.current[newState.enemiesSpawned];
            if (enemyConfig) {
              const enemy = createEnemy(
                enemyConfig.type,
                newState.startCell,
                newState.grid,
                newState.endCell,
                enemyConfig.isBoss,
                newState.wave
              );
              if (enemy) {
                newState.enemies = [...newState.enemies, enemy];
              }
            }
            newState.enemiesSpawned++;
            newState.spawnTimer = WAVE_CONFIG.spawnInterval;
          }
        }

        // Update wave info
        newState.waveInfo = {
          total: newState.enemiesToSpawn,
          spawned: newState.enemiesSpawned,
          alive: newState.enemies.length,
        };

        // Check wave complete
        if (
          newState.waveInProgress &&
          newState.enemiesSpawned >= newState.enemiesToSpawn &&
          newState.enemies.length === 0
        ) {
          newState.waveInProgress = false;
          audioManager.playWaveComplete();

          // Auto-start next wave if enabled
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

        // Update enemies
        const { updatedEnemies, reachedEnd } = updateEnemies(
          newState.enemies,
          deltaTime,
          newState.grid,
          newState.endCell
        );
        newState.enemies = updatedEnemies;

        // Handle enemies reaching end
        if (reachedEnd.length > 0) {
          newState.lives -= reachedEnd.length;
          if (newState.lives <= 0) {
            newState.gameStatus = 'defeat';
          }
        }

        // Update towers
        const { updatedTowers, newProjectiles } = updateTowers(
          newState.towers,
          newState.enemies,
          newState.projectiles,
          deltaTime
        );
        newState.towers = updatedTowers;
        newState.projectiles = [...newState.projectiles, ...newProjectiles];

        // Update projectiles
        const projectileResult = updateProjectiles(
          newState.projectiles,
          newState.enemies,
          deltaTime
        );
        newState.projectiles = projectileResult.updatedProjectiles;
        newState.enemies = [...projectileResult.updatedEnemies, ...projectileResult.newEnemies];
        newState.gold += projectileResult.goldEarned;

        // Update wave info after combat
        newState.waveInfo.alive = newState.enemies.length;

        return newState;
      });
    },
    [autoWave]
  );

  useGameLoop(gameLoop, gameState.gameStatus === 'playing');

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setGameState((prev) => {
        if (prev.gameStatus !== 'playing' && prev.gameStatus !== 'paused') return prev;

        const cell = prev.grid[y][x];

        // If clicking on an existing tower
        if (cell.tower) {
          return {
            ...prev,
            selectedTower: cell.tower,
            selectedTowerType: null,
          };
        }

        // If placing a new tower
        if (prev.selectedTowerType) {
          const config = TOWER_CONFIGS[prev.selectedTowerType];
          if (prev.gold < config.cost) return prev;

          if (!canPlaceTower(prev.grid, x, y, prev.startCell, prev.endCell, true)) {
            return prev;
          }

          const newTower: Tower = {
            id: `tower_${++towerIdCounter}`,
            type: prev.selectedTowerType,
            x: gridToPixel(x),
            y: gridToPixel(y),
            gridX: x,
            gridY: y,
            level: 1,
            cooldown: 0,
            damage: config.damage,
            range: config.range,
            fireRate: config.fireRate,
            projectileSpeed: config.projectileSpeed,
          };

          const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
          newGrid[y][x].isBlocked = true;
          newGrid[y][x].tower = newTower;

          // Recalculate paths for existing enemies
          const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell);

          audioManager.playTowerPlace();

          // KEEP tower in hand after placement!
          return {
            ...prev,
            grid: newGrid,
            towers: [...prev.towers, newTower],
            enemies: updatedEnemies,
            gold: prev.gold - config.cost,
          };
        }

        // Deselect tower info
        return { ...prev, selectedTower: null };
      });
    },
    []
  );

  const handleCellHover = useCallback(
    (x: number, y: number) => {
      setHoveredCell({ x, y });
      if (gameState.selectedTowerType) {
        const canPlaceResult = canPlaceTower(
          gameState.grid,
          x,
          y,
          gameState.startCell,
          gameState.endCell,
          true
        );
        setCanPlace(canPlaceResult);
      }
    },
    [gameState.selectedTowerType, gameState.grid, gameState.startCell, gameState.endCell]
  );

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleSelectTowerType = useCallback((type: TowerType | null) => {
    setGameState((prev) => ({
      ...prev,
      selectedTowerType: type,
      selectedTower: null,
    }));
    audioManager.playClick();
  }, []);

  // Clear hand (deselect tower type)
  const handleClearHand = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      selectedTowerType: null,
    }));
    audioManager.playClick();
  }, []);

  const handleTowerClick = useCallback((tower: Tower) => {
    setGameState((prev) => ({
      ...prev,
      selectedTower: tower,
      selectedTowerType: null,
    }));
  }, []);

  const handleUpgrade = useCallback(() => {
    setGameState((prev) => {
      if (!prev.selectedTower || prev.selectedTower.level >= UPGRADE_CONFIG.maxLevel) return prev;

      const upgradeCost = getUpgradeCost(prev.selectedTower);
      if (prev.gold < upgradeCost) return prev;

      const updatedTower = {
        ...prev.selectedTower,
        level: prev.selectedTower.level + 1,
      };

      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      newGrid[updatedTower.gridY][updatedTower.gridX].tower = updatedTower;

      audioManager.playTowerUpgrade();

      return {
        ...prev,
        towers: prev.towers.map((t) => (t.id === updatedTower.id ? updatedTower : t)),
        grid: newGrid,
        gold: prev.gold - upgradeCost,
        selectedTower: updatedTower,
      };
    });
  }, []);

  const handleSell = useCallback(() => {
    setGameState((prev) => {
      if (!prev.selectedTower) return prev;

      const sellValue = getSellValue(prev.selectedTower);
      const tower = prev.selectedTower;

      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      newGrid[tower.gridY][tower.gridX].isBlocked = false;
      newGrid[tower.gridY][tower.gridX].tower = null;

      // Recalculate paths for existing enemies
      const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell);

      audioManager.playTowerSell();

      return {
        ...prev,
        towers: prev.towers.filter((t) => t.id !== tower.id),
        grid: newGrid,
        enemies: updatedEnemies,
        gold: prev.gold + sellValue,
        selectedTower: null,
      };
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

      return {
        ...prev,
        wave: newWave,
        waveInProgress: true,
        enemiesSpawned: 0,
        enemiesToSpawn: enemies.length,
        spawnTimer: 0,
        waveInfo: {
          total: enemies.length,
          spawned: 0,
          alive: 0,
        },
      };
    });
  }, []);

  const handlePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameStatus: prev.gameStatus === 'paused' ? 'playing' : 'paused',
    }));
  }, []);

  const handleNewGame = useCallback(() => {
    const newState = createInitialState();
    newState.gameStatus = 'menu'; // Return to menu
    setGameState(newState);
    waveEnemiesRef.current = [];
    towerIdCounter = 0;
    audioManager.stopMusic();
    prevLivesRef.current = STARTING_LIVES;
    prevEnemyCountRef.current = 0;
  }, []);

  const handleStartGame = useCallback(() => {
    const newState = createInitialState();
    newState.gameStatus = 'playing';
    setGameState(newState);
    waveEnemiesRef.current = [];
    towerIdCounter = 0;
    audioManager.stopMusic();
    prevLivesRef.current = STARTING_LIVES;
    prevEnemyCountRef.current = 0;
  }, []);

  const handleToggleShowPath = useCallback(() => {
    setShowEnemyPath((prev) => !prev);
    audioManager.playClick();
  }, []);

  // Handle click outside grid to clear hand
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (e.target === e.currentTarget) {
      handleClearHand();
    }
  }, [handleClearHand]);

  const gridPixelSize = GRID_CONFIG.size * CELL_SIZE;

  // Check if player can afford selected tower
  const canAffordSelected = gameState.selectedTowerType
    ? gameState.gold >= TOWER_CONFIGS[gameState.selectedTowerType].cost
    : true;

  // Calculate responsive scale for mobile
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxWidth = Math.min(containerWidth - 16, gridPixelSize);
        setScale(maxWidth / gridPixelSize);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [gridPixelSize]);

  // Show welcome screen for menu status
  if (gameState.gameStatus === 'menu') {
    return <WelcomeScreen onStartGame={handleStartGame} />;
  }

  const nextWaveIsBoss = isBossWave(gameState.wave + 1);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 game-container">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-foreground mb-2 sm:mb-4">
          🏰 Tower Defense v2.1
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
          {/* Left sidebar - collapsible on mobile */}
          <div className="lg:w-64 space-y-2 sm:space-y-4 order-2 lg:order-1">
            <GameHUD
              wave={gameState.wave}
              lives={gameState.lives}
              gold={gameState.gold}
              waveInProgress={gameState.waveInProgress}
              gameStatus={gameState.gameStatus}
              waveInfo={gameState.waveInfo}
              showEnemyPath={showEnemyPath}
              autoWave={autoWave}
              onStartWave={handleStartWave}
              onPause={handlePause}
              onNewGame={handleNewGame}
              onToggleShowPath={handleToggleShowPath}
              onToggleAutoWave={() => {
                setAutoWave((v) => !v);
                audioManager.playClick();
              }}
            />
            <div className="hidden sm:block">
              <TowerShop
                gold={gameState.gold}
                selectedTowerType={gameState.selectedTowerType}
                onSelectTower={handleSelectTowerType}
              />
            </div>
            <div className="hidden lg:block">
              <AudioControls />
            </div>
          </div>

          {/* Game canvas - first on mobile */}
          <div className="flex-1 flex flex-col items-center order-1 lg:order-2" ref={containerRef}>
            <svg
              width={gridPixelSize * scale}
              height={gridPixelSize * scale}
              viewBox={`0 0 ${gridPixelSize} ${gridPixelSize}`}
              className={`border-2 rounded-lg bg-card touch-none ${
                gameState.selectedTowerType && !canAffordSelected
                  ? 'border-destructive'
                  : 'border-border'
              }`}
              style={{
                cursor: gameState.selectedTowerType
                  ? canAffordSelected
                    ? 'crosshair'
                    : 'not-allowed'
                  : 'default',
              }}
              onClick={handleSvgClick}
              onTouchEnd={handleSvgClick}
            >
              <GameGrid
                grid={gameState.grid}
                startCell={gameState.startCell}
                endCell={gameState.endCell}
                hoveredCell={hoveredCell}
                canPlace={canPlace && gameState.selectedTowerType !== null && canAffordSelected}
                onCellClick={handleCellClick}
                onCellHover={handleCellHover}
                onCellLeave={handleCellLeave}
              />
              <PathVisualizer enemies={gameState.enemies} showPath={showEnemyPath} />
              <TowerRenderer
                towers={gameState.towers}
                selectedTower={gameState.selectedTower}
                onTowerClick={handleTowerClick}
              />
              <EnemyRenderer enemies={gameState.enemies} />
              <ProjectileRenderer
                projectiles={gameState.projectiles}
                towers={gameState.towers}
              />
            </svg>

            {/* Mobile tower shop - below game */}
            <div className="sm:hidden w-full mt-2">
              <TowerShop
                gold={gameState.gold}
                selectedTowerType={gameState.selectedTowerType}
                onSelectTower={handleSelectTowerType}
              />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:w-64 space-y-2 sm:space-y-4 order-3">
            {gameState.selectedTower ? (
              <TowerInfo
                tower={gameState.selectedTower}
                gold={gameState.gold}
                onUpgrade={handleUpgrade}
                onSell={handleSell}
                onDeselect={() =>
                  setGameState((prev) => ({ ...prev, selectedTower: null }))
                }
              />
            ) : (
              <div className="bg-card p-3 sm:p-4 rounded-lg border border-border text-center text-muted-foreground text-sm">
                Выберите башню
              </div>
            )}
            <div className="hidden sm:block">
              <EnemyLegend />
            </div>
            <div className="lg:hidden">
              <AudioControls />
            </div>
          </div>
        </div>

        <div className="mt-2 sm:mt-4 text-center text-xs text-muted-foreground">
          <p>🟢 Старт | 🔴 Финиш</p>
        </div>
      </div>

      <DebugConsole gameState={gameState} />
    </div>
  );
};
