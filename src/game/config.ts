/**
 * ============================================================
 * GAME CONFIGURATION v2.1
 * ============================================================
 * 
 * Этот файл содержит всю конфигурацию игры Tower Defense.
 * Вы можете добавлять новых врагов, башни, настраивать волны и параметры.
 * 
 * ВЕРСИИ:
 * - v1.0: Базовая игра (4 типа врагов, 4 типа башен, 20 волн)
 * - v2.0: Расширенная конфигурация с поддержкой кастомизации
 * - v2.1: Добавлены новые враги/башни, улучшенный UX
 * 
 * ============================================================
 */

// ============================================================
// GAME VERSION
// ============================================================
export const GAME_VERSION = '2.1';

// ============================================================
// GRID SETTINGS
// ============================================================
export const GRID_CONFIG = {
  /** Размер сетки (NxN клеток) */
  size: 10,
  /** Размер одной клетки в пикселях */
  cellSize: 60,
  /** Начальная позиция врагов (левая сторона) */
  startCell: { x: 0, y: 4 },
  /** Конечная позиция врагов (правая сторона) */
  endCell: { x: 9, y: 5 },
};

// ============================================================
// PATHFINDING SETTINGS
// ============================================================
export const PATHFINDING_CONFIG = {
  /** Всегда 8 направлений */
  use8Directions: true,
  /** Стоимость диагонального движения (обычно √2 ≈ 1.414) */
  diagonalCost: 1.414,
  /** Стоимость прямого движения */
  straightCost: 1,
};

// ============================================================
// PLAYER SETTINGS
// ============================================================
export const PLAYER_CONFIG = {
  /** Начальное количество золота */
  startingGold: 100,
  /** Начальное количество жизней */
  startingLives: 20,
};

// ============================================================
// WAVE SETTINGS
// ============================================================
export const WAVE_CONFIG = {
  /** Общее количество волн (Infinity = бесконечно) */
  totalWaves: Infinity,
  /** Интервал боссов (каждые N волн) */
  bossWaveInterval: 5,
  /** Базовое количество врагов на волне */
  baseEnemiesPerWave: 5,
  /** Задержка между спавном врагов (секунды) */
  spawnInterval: 0.8,
  /**
   * Функция для расчета количества врагов на волне
   */
  getEnemiesCount: (wave: number): number => {
    return WAVE_CONFIG.baseEnemiesPerWave + wave + Math.floor(wave / 5);
  },
};

// ============================================================
// BOSS MODIFIERS
// ============================================================
export const BOSS_CONFIG = {
  /** Множитель HP для босса */
  hpMultiplier: 50,
  /** Множитель скорости для босса (0.3 = на 70% медленнее) */
  speedMultiplier: 0.3,
  /** Множитель награды для босса */
  rewardMultiplier: 25,
};

// ============================================================
// ENEMY TYPES
// ============================================================
/** Типы врагов */
export type EnemyType = 'simple' | 'fat' | 'thin' | 'double' | 'ghost' | 'armored';

export interface EnemyConfig {
  /** Название врага */
  name: string;
  /** Описание врага */
  description: string;
  /** Здоровье */
  hp: number;
  /** Скорость (пикселей в секунду) */
  speed: number;
  /** Награда за убийство */
  reward: number;
  /** Цвет для отображения */
  color: string;
  /** Тип врага, который появляется при смерти */
  spawnOnDeath?: EnemyType;
  /** Сколько врагов появляется при смерти */
  spawnCount?: number;
}

/**
 * КОНФИГУРАЦИЯ ВРАГОВ
 */
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  simple: {
    name: 'Простой',
    description: 'Стандартный враг со средними характеристиками',
    hp: 180,
    speed: 50,
    reward: 10,
    color: '#ef4444',
  },
  fat: {
    name: 'Жирный',
    description: 'Медленный, но очень живучий танк',
    hp: 800,
    speed: 28,
    reward: 40,
    color: '#7c3aed',
  },
  thin: {
    name: 'Худой',
    description: 'Очень быстрый, но хрупкий враг',
    hp: 60,
    speed: 100,
    reward: 8,
    color: '#22c55e',
  },
  double: {
    name: 'Двойка',
    description: 'При смерти создает двух меньших врагов',
    hp: 250,
    speed: 40,
    reward: 25,
    color: '#f59e0b',
    spawnOnDeath: 'simple',
    spawnCount: 2,
  },
  ghost: {
    name: 'Призрак',
    description: 'Невидимый, появляется рядом с выходом',
    hp: 120,
    speed: 70,
    reward: 15,
    color: '#94a3b8',
  },
  armored: {
    name: 'Бронированный',
    description: 'Очень медленный, но невероятно крепкий',
    hp: 1500,
    speed: 20,
    reward: 60,
    color: '#475569',
  },
};

// ============================================================
// TOWER TYPES
// ============================================================
/** Типы башен */
export type TowerType = 'sniper' | 'knight' | 'laser' | 'fountain' | 'cannon' | 'frost';

/** Типы снарядов */
export type ProjectileType = 'bullet' | 'line' | 'aoe';

export interface TowerConfig {
  /** Название башни */
  name: string;
  /** Описание башни */
  description: string;
  /** Урон за выстрел */
  damage: number;
  /** Дальность стрельбы (пикселей) */
  range: number;
  /** Скорострельность (выстрелов в секунду) */
  fireRate: number;
  /** Скорость снаряда (пикселей в секунду) */
  projectileSpeed: number;
  /** Стоимость покупки */
  cost: number;
  /** Цвет для отображения */
  color: string;
  /** Тип снаряда */
  projectileType: ProjectileType;
  /** Иконка (эмодзи) */
  icon: string;
}

/**
 * КОНФИГУРАЦИЯ БАШЕН
 */
export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  sniper: {
    name: 'Снайпер',
    description: 'Дальнобойная башня с высоким уроном',
    damage: 55,
    range: 300,
    fireRate: 0.7,
    projectileSpeed: 900,
    cost: 80,
    color: '#3b82f6',
    projectileType: 'bullet',
    icon: '🎯',
  },
  knight: {
    name: 'Рыцарь',
    description: 'Ближний бой, быстрые атаки',
    damage: 40,
    range: 90,
    fireRate: 1.8,
    projectileSpeed: 500,
    cost: 50,
    color: '#8b5cf6',
    projectileType: 'bullet',
    icon: '⚔️',
  },
  laser: {
    name: 'Лазер',
    description: 'Непрерывный луч, быстрый урон',
    damage: 10,
    range: 200,
    fireRate: 10,
    projectileSpeed: 9999,
    cost: 100,
    color: '#ef4444',
    projectileType: 'line',
    icon: '⚡',
  },
  fountain: {
    name: 'Фонтан',
    description: 'Волна урона по области',
    damage: 25,
    range: 110,
    fireRate: 1.4,
    projectileSpeed: 350,
    cost: 70,
    color: '#06b6d4',
    projectileType: 'aoe',
    icon: '💧',
  },
  cannon: {
    name: 'Пушка',
    description: 'Огромный урон, медленная атака',
    damage: 150,
    range: 180,
    fireRate: 0.35,
    projectileSpeed: 400,
    cost: 120,
    color: '#78350f',
    projectileType: 'bullet',
    icon: '💥',
  },
  frost: {
    name: 'Мороз',
    description: 'Замедляет врагов в области',
    damage: 15,
    range: 130,
    fireRate: 0.8,
    projectileSpeed: 250,
    cost: 90,
    color: '#67e8f9',
    projectileType: 'aoe',
    icon: '❄️',
  },
};

// ============================================================
// UPGRADE SETTINGS
// ============================================================
export const UPGRADE_CONFIG = {
  /** Максимальный уровень башни */
  maxLevel: 5,
  /** Множитель урона за уровень */
  damageMultiplier: 1.5,
  /** Множитель дальности за уровень */
  rangeMultiplier: 1.12,
  /** Множитель скорострельности за уровень */
  fireRateMultiplier: 1.2,
  /** 
   * Функция расчета стоимости улучшения
   */
  getUpgradeCost: (baseCost: number, currentLevel: number): number => {
    return Math.round(baseCost * Math.pow(1.4, currentLevel - 1));
  },
  /** 
   * Множитель стоимости продажи (70%)
   */
  getSellValueMultiplier: 0.7,
};

// ============================================================
// WAVE COMPOSITION
// ============================================================
export interface WaveDefinition {
  enemies: EnemyType[];
  bossIndices?: number[];
}

/**
 * Генератор состава волны
 */
export function generateWaveEnemies(wave: number): { type: EnemyType; isBoss: boolean }[] {
  const enemies: { type: EnemyType; isBoss: boolean }[] = [];
  const count = WAVE_CONFIG.getEnemiesCount(wave);
  const isBossWave = wave % WAVE_CONFIG.bossWaveInterval === 0;

  const allTypes: EnemyType[] = Object.keys(ENEMY_CONFIGS) as EnemyType[];
  // Unlock enemy types gradually
  const unlockedTypes = allTypes.slice(0, Math.min(2 + Math.floor(wave / 3), allTypes.length));
  
  for (let i = 0; i < count; i++) {
    const isBoss = isBossWave && i === count - 1;
    const typeIndex = Math.floor(Math.random() * unlockedTypes.length);
    enemies.push({ type: unlockedTypes[typeIndex], isBoss });
  }

  return enemies;
}

// ============================================================
// VISUAL SETTINGS
// ============================================================
export const VISUAL_CONFIG = {
  /** Продолжительность анимации лазера (секунды) */
  laserDuration: 0.1,
  /** Ширина линии лазера */
  laserWidth: 4,
  /** Размер снаряда */
  bulletSize: 6,
  /** Показывать путь врагов по умолчанию */
  showEnemyPath: false,
};

// ============================================================
// DEBUG SETTINGS
// ============================================================
export const DEBUG_CONFIG = {
  /** Включить консоль отладки по F12 */
  enableDebugConsole: true,
  /** Логировать события в консоль браузера */
  logEvents: false,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Получить все доступные типы врагов */
export function getEnemyTypes(): EnemyType[] {
  return Object.keys(ENEMY_CONFIGS) as EnemyType[];
}

/** Получить все доступные типы башен */
export function getTowerTypes(): TowerType[] {
  return Object.keys(TOWER_CONFIGS) as TowerType[];
}

/** Проверить, является ли волна волной босса */
export function isBossWave(wave: number): boolean {
  return wave % WAVE_CONFIG.bossWaveInterval === 0;
}

/** Получить статистику башни с учетом уровня */
export function getTowerStatsForLevel(
  type: TowerType,
  level: number
): { damage: number; range: number; fireRate: number } {
  const config = TOWER_CONFIGS[type];
  const levelMultiplier = level - 1;
  
  return {
    damage: Math.round(config.damage * Math.pow(UPGRADE_CONFIG.damageMultiplier, levelMultiplier)),
    range: Math.round(config.range * Math.pow(UPGRADE_CONFIG.rangeMultiplier, levelMultiplier)),
    fireRate: config.fireRate * Math.pow(UPGRADE_CONFIG.fireRateMultiplier, levelMultiplier),
  };
}