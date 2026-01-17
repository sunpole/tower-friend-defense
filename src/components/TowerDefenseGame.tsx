import React, { useState, useCallback, useRef } from 'react';
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
  PATHFINDING_CONFIG,
  TowerType,
  EnemyType,
} from '@/game/config';
import { findPath, canPlaceTower } from '@/game/pathfinding';
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
import { GameGrid } from './game/GameGrid';
import { TowerRenderer } from './game/TowerRenderer';
import { EnemyRenderer } from './game/EnemyRenderer';
import { ProjectileRenderer } from './game/ProjectileRenderer';
import { TowerShop } from './game/TowerShop';
import { TowerInfo } from './game/TowerInfo';
import { GameHUD } from './game/GameHUD';
import { EnemyLegend } from './game/EnemyLegend';
import { DebugConsole } from './game/DebugConsole';

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
  gameStatus: 'playing',
  selectedTowerType: null,
  selectedTower: null,
  waveInProgress: false,
  enemiesSpawned: 0,
  enemiesToSpawn: 0,
  spawnTimer: 0,
  startCell: GRID_CONFIG.startCell,
  endCell: GRID_CONFIG.endCell,
  showPathfinding: PATHFINDING_CONFIG.use8Directions,
  waveInfo: createInitialWaveInfo(),
});

let towerIdCounter = 0;

export const TowerDefenseGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [canPlace, setCanPlace] = useState(false);
  const [show8DirectionPath, setShow8DirectionPath] = useState(PATHFINDING_CONFIG.use8Directions);
  const waveEnemiesRef = useRef<{ type: EnemyType; isBoss: boolean }[]>([]);

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
                show8DirectionPath
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
          
          if (newState.wave >= WAVE_CONFIG.totalWaves) {
            newState.gameStatus = 'victory';
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
    [show8DirectionPath]
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

          if (!canPlaceTower(prev.grid, x, y, prev.startCell, prev.endCell, show8DirectionPath)) {
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
          const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell, show8DirectionPath);

          return {
            ...prev,
            grid: newGrid,
            towers: [...prev.towers, newTower],
            enemies: updatedEnemies,
            gold: prev.gold - config.cost,
            selectedTowerType: null,
          };
        }

        // Deselect
        return { ...prev, selectedTower: null };
      });
    },
    [show8DirectionPath]
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
          show8DirectionPath
        );
        setCanPlace(canPlaceResult);
      }
    },
    [gameState.selectedTowerType, gameState.grid, gameState.startCell, gameState.endCell, show8DirectionPath]
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
      if (!prev.selectedTower || prev.selectedTower.level >= 3) return prev;

      const upgradeCost = getUpgradeCost(prev.selectedTower);
      if (prev.gold < upgradeCost) return prev;

      const updatedTower = {
        ...prev.selectedTower,
        level: prev.selectedTower.level + 1,
      };

      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      newGrid[updatedTower.gridY][updatedTower.gridX].tower = updatedTower;

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
      const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell, show8DirectionPath);

      return {
        ...prev,
        towers: prev.towers.filter((t) => t.id !== tower.id),
        grid: newGrid,
        enemies: updatedEnemies,
        gold: prev.gold + sellValue,
        selectedTower: null,
      };
    });
  }, [show8DirectionPath]);

  const handleStartWave = useCallback(() => {
    setGameState((prev) => {
      if (prev.waveInProgress || prev.wave >= WAVE_CONFIG.totalWaves) return prev;

      const newWave = prev.wave + 1;
      const enemies = getWaveEnemies(newWave);
      waveEnemiesRef.current = enemies;

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
    setGameState(createInitialState());
    waveEnemiesRef.current = [];
    towerIdCounter = 0;
  }, []);

  const handleTogglePathfinding = useCallback(() => {
    setShow8DirectionPath((prev) => !prev);
    // Recalculate paths for all enemies when toggle changes
    setGameState((prev) => ({
      ...prev,
      showPathfinding: !show8DirectionPath,
      enemies: recalculateEnemyPaths(prev.enemies, prev.grid, prev.endCell, !show8DirectionPath),
    }));
  }, [show8DirectionPath]);

  const gridPixelSize = GRID_CONFIG.size * CELL_SIZE;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-foreground mb-4">
          🏰 Tower Defense v2.0
        </h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left sidebar */}
          <div className="lg:w-64 space-y-4">
            <GameHUD
              wave={gameState.wave}
              lives={gameState.lives}
              gold={gameState.gold}
              waveInProgress={gameState.waveInProgress}
              gameStatus={gameState.gameStatus}
              waveInfo={gameState.waveInfo}
              show8Direction={show8DirectionPath}
              onStartWave={handleStartWave}
              onPause={handlePause}
              onNewGame={handleNewGame}
              onTogglePathfinding={handleTogglePathfinding}
            />
            <TowerShop
              gold={gameState.gold}
              selectedTowerType={gameState.selectedTowerType}
              onSelectTower={handleSelectTowerType}
            />
          </div>

          {/* Game canvas */}
          <div className="flex-1 flex justify-center">
            <svg
              width={gridPixelSize}
              height={gridPixelSize}
              className="border-2 border-border rounded-lg bg-card"
            >
              <GameGrid
                grid={gameState.grid}
                startCell={gameState.startCell}
                endCell={gameState.endCell}
                hoveredCell={hoveredCell}
                canPlace={canPlace && gameState.selectedTowerType !== null}
                onCellClick={handleCellClick}
                onCellHover={handleCellHover}
                onCellLeave={handleCellLeave}
              />
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
          </div>

          {/* Right sidebar */}
          <div className="lg:w-64 space-y-4">
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
              <div className="bg-card p-4 rounded-lg border border-border text-center text-muted-foreground">
                Выберите башню для информации
              </div>
            )}
            <EnemyLegend />
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>🟢 Старт | 🔴 Финиш | Враги идут слева направо</p>
          <p>Нажмите F12 для консоли отладки</p>
        </div>
      </div>

      <DebugConsole gameState={gameState} />
    </div>
  );
};
