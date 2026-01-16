import React, { useState, useCallback, useRef } from 'react';
import {
  GameState,
  GridCell,
  Tower,
  TowerType,
  GRID_SIZE,
  CELL_SIZE,
  TOWER_CONFIGS,
  STARTING_GOLD,
  STARTING_LIVES,
  TOTAL_WAVES,
  EnemyType,
} from '@/game/types';
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
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, isBlocked: false, tower: null });
    }
    grid.push(row);
  }
  return grid;
};

const START_CELL = { x: 0, y: 4 };
const END_CELL = { x: 9, y: 5 };

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
  startCell: START_CELL,
  endCell: END_CELL,
});

let towerIdCounter = 0;

export const TowerDefenseGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [canPlace, setCanPlace] = useState(false);
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
                enemyConfig.isBoss
              );
              if (enemy) {
                newState.enemies = [...newState.enemies, enemy];
              }
            }
            newState.enemiesSpawned++;
            newState.spawnTimer = 1; // 1 second between spawns
          }
        }

        // Check wave complete
        if (
          newState.waveInProgress &&
          newState.enemiesSpawned >= newState.enemiesToSpawn &&
          newState.enemies.length === 0
        ) {
          newState.waveInProgress = false;
          
          if (newState.wave >= TOTAL_WAVES) {
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

        return newState;
      });
    },
    []
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

          if (!canPlaceTower(prev.grid, x, y, prev.startCell, prev.endCell)) {
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
    []
  );

  const handleCellHover = useCallback(
    (x: number, y: number) => {
      setHoveredCell({ x, y });
      if (gameState.selectedTowerType) {
        const canPlace = canPlaceTower(
          gameState.grid,
          x,
          y,
          gameState.startCell,
          gameState.endCell
        );
        setCanPlace(canPlace);
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
      const updatedEnemies = recalculateEnemyPaths(prev.enemies, newGrid, prev.endCell);

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
      if (prev.waveInProgress || prev.wave >= TOTAL_WAVES) return prev;

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

  const gridPixelSize = GRID_SIZE * CELL_SIZE;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-foreground mb-4">
          🏰 Tower Defense
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
              onStartWave={handleStartWave}
              onPause={handlePause}
              onNewGame={handleNewGame}
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
