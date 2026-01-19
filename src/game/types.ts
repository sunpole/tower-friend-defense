// Game Types - основные интерфейсы игры
// Конфигурация находится в config.ts

import {
  GRID_CONFIG,
  ENEMY_CONFIGS,
  TOWER_CONFIGS,
  UPGRADE_CONFIG,
  WAVE_CONFIG,
  PLAYER_CONFIG,
  EnemyType,
  TowerType,
  ProjectileType,
} from './config';

// Re-export types from config
export type { EnemyType, TowerType, ProjectileType };

export interface Position {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  isBlocked: boolean;
  tower: Tower | null;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  x: number;
  y: number;
  path: Position[];
  pathIndex: number;
  reward: number;
  spawnOnDeath?: EnemyType;
  spawnCount?: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  level: number;
  cooldown: number;
  damage: number;
  range: number;
  fireRate: number;
  projectileSpeed: number;
}

export interface Projectile {
  id: string;
  type: ProjectileType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  towerId: string;
  enemyId?: string;
  radius?: number;
  maxRadius?: number;
  createdAt?: number; // For laser animation timing
}

export interface WaveInfo {
  total: number;
  spawned: number;
  alive: number;
}

export interface GameState {
  grid: GridCell[][];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  wave: number;
  lives: number;
  gold: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
  waveInProgress: boolean;
  enemiesSpawned: number;
  enemiesToSpawn: number;
  spawnTimer: number;
  startCell: Position;
  endCell: Position;
  showPathfinding: boolean;
  waveInfo: WaveInfo;
}

// Re-export config values for backward compatibility
export const GRID_SIZE = GRID_CONFIG.size;
export const CELL_SIZE = GRID_CONFIG.cellSize;
export const TOTAL_WAVES = WAVE_CONFIG.totalWaves;
export const BOSS_WAVE_INTERVAL = WAVE_CONFIG.bossWaveInterval;
export const STARTING_GOLD = PLAYER_CONFIG.startingGold;
export const STARTING_LIVES = PLAYER_CONFIG.startingLives;

// Re-export configs
export { ENEMY_CONFIGS, TOWER_CONFIGS };

export const UPGRADE_MULTIPLIERS = {
  damage: UPGRADE_CONFIG.damageMultiplier,
  range: UPGRADE_CONFIG.rangeMultiplier,
  fireRate: UPGRADE_CONFIG.fireRateMultiplier,
};

// Legacy type for config
export interface EnemyConfigLegacy {
  hp: number;
  speed: number;
  reward: number;
  color: string;
  name: string;
  spawnOnDeath?: EnemyType;
}

export interface TowerConfigLegacy {
  damage: number;
  range: number;
  fireRate: number;
  projectileSpeed: number;
  cost: number;
  color: string;
  name: string;
  projectileType: ProjectileType;
}
