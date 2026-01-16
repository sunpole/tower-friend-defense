// Game Types

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
  speed: number; // pixels per second
  x: number;
  y: number;
  path: Position[];
  pathIndex: number;
  reward: number;
  spawnOnDeath?: EnemyType; // For "двойка" type
}

export type EnemyType = 'simple' | 'fat' | 'thin' | 'double';

export interface EnemyConfig {
  hp: number;
  speed: number;
  reward: number;
  color: string;
  name: string;
  spawnOnDeath?: EnemyType;
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
  fireRate: number; // shots per second
  projectileSpeed: number;
}

export type TowerType = 'sniper' | 'knight' | 'laser' | 'fountain';

export interface TowerConfig {
  damage: number;
  range: number;
  fireRate: number;
  projectileSpeed: number;
  cost: number;
  color: string;
  name: string;
  projectileType: 'bullet' | 'line' | 'aoe';
}

export interface Projectile {
  id: string;
  type: 'bullet' | 'line' | 'aoe';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  towerId: string;
  enemyId?: string;
  radius?: number; // for AOE
  maxRadius?: number; // for AOE
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
}

export const GRID_SIZE = 10;
export const CELL_SIZE = 60;

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  simple: { hp: 100, speed: 10, reward: 10, color: '#ef4444', name: 'Простой' },
  fat: { hp: 400, speed: 2, reward: 30, color: '#7c3aed', name: 'Жирный' },
  thin: { hp: 20, speed: 40, reward: 5, color: '#22c55e', name: 'Худой' },
  double: { hp: 120, speed: 5, reward: 15, color: '#f59e0b', name: 'Двойка', spawnOnDeath: 'double' },
};

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  sniper: {
    damage: 12,
    range: 300,
    fireRate: 2, // 0.5 sec reload
    projectileSpeed: 600,
    cost: 50,
    color: '#3b82f6',
    name: 'Снайпер',
    projectileType: 'bullet',
  },
  knight: {
    damage: 20,
    range: 100,
    fireRate: 1.33, // 0.75 sec reload
    projectileSpeed: 300,
    cost: 40,
    color: '#8b5cf6',
    name: 'Рыцарь',
    projectileType: 'bullet',
  },
  laser: {
    damage: 2,
    range: 200,
    fireRate: 100, // 0.01 sec reload
    projectileSpeed: 9600,
    cost: 80,
    color: '#ef4444',
    name: 'Лазер',
    projectileType: 'line',
  },
  fountain: {
    damage: 10,
    range: 80,
    fireRate: 2.5, // 0.4 sec reload
    projectileSpeed: 200,
    cost: 60,
    color: '#06b6d4',
    name: 'Фонтан',
    projectileType: 'aoe',
  },
};

export const UPGRADE_MULTIPLIERS = {
  damage: 1.9,
  range: 1.25,
  fireRate: 1.2,
};

export const TOTAL_WAVES = 20;
export const BOSS_WAVE_INTERVAL = 5;
export const STARTING_GOLD = 100;
export const STARTING_LIVES = 20;
