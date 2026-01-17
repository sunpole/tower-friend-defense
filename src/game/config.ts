/**
 * ============================================================
 * GAME CONFIGURATION v2.0
 * ============================================================
 * 
 * Этот файл содержит всю конфигурацию игры Tower Defense.
 * Вы можете добавлять новых врагов, башни, настраивать волны и параметры.
 * 
 * ВЕРСИИ:
 * - v1.0: Базовая игра (4 типа врагов, 4 типа башен, 20 волн)
 * - v2.0: Расширенная конфигурация с поддержкой кастомизации
 * 
 * ============================================================
 */

// ============================================================
// GAME VERSION
// ============================================================
export const GAME_VERSION = '2.0';

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
  /** Использовать 8 направлений (true) или 4 направления (false) */
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
  /** Общее количество волн */
  totalWaves: 20,
  /** Интервал боссов (каждые N волн) */
  bossWaveInterval: 5,
  /** Базовое количество врагов на волне */
  baseEnemiesPerWave: 5,
  /** Задержка между спавном врагов (секунды) */
  spawnInterval: 1,
  /** 
   * Функция для расчета количества врагов на волне
   * По умолчанию: 5 + номер волны
   */
  getEnemiesCount: (wave: number): number => {
    return WAVE_CONFIG.baseEnemiesPerWave + wave;
  },
};

// ============================================================
// BOSS MODIFIERS
// ============================================================
export const BOSS_CONFIG = {
  /** Множитель HP для босса */
  hpMultiplier: 40,
  /** Множитель скорости для босса (0.25 = на 75% медленнее) */
  speedMultiplier: 0.25,
  /** Множитель награды для босса */
  rewardMultiplier: 20,
};

// ============================================================
// ENEMY TYPES
// ============================================================
/** Типы врагов - добавляйте новые типы здесь */
export type EnemyType = 'simple' | 'fat' | 'thin' | 'double';

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
 * 
 * Добавляйте новых врагов в этот объект.
 * Не забудьте добавить тип в EnemyType выше.
 */
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  simple: {
    name: 'Простой',
    description: 'Стандартный враг со средними характеристиками',
    hp: 100,
    speed: 10,
    reward: 10,
    color: '#ef4444',
  },
  fat: {
    name: 'Жирный',
    description: 'Медленный, но очень живучий танк',
    hp: 400,
    speed: 2,
    reward: 30,
    color: '#7c3aed',
  },
  thin: {
    name: 'Худой',
    description: 'Очень быстрый, но хрупкий враг',
    hp: 20,
    speed: 40,
    reward: 5,
    color: '#22c55e',
  },
  double: {
    name: 'Двойка',
    description: 'При смерти создает еще одного такого же врага',
    hp: 120,
    speed: 5,
    reward: 15,
    color: '#f59e0b',
    spawnOnDeath: 'double',
    spawnCount: 1,
  },
};

// ============================================================
// TOWER TYPES
// ============================================================
/** Типы башен - добавляйте новые типы здесь */
export type TowerType = 'sniper' | 'knight' | 'laser' | 'fountain';

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
 * 
 * Добавляйте новые башни в этот объект.
 * Не забудьте добавить тип в TowerType выше.
 */
export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  sniper: {
    name: 'Снайпер',
    description: 'Дальнобойная башня с высоким уроном, но медленной перезарядкой',
    damage: 12,
    range: 300,
    fireRate: 2, // 0.5 sec reload
    projectileSpeed: 600,
    cost: 50,
    color: '#3b82f6',
    projectileType: 'bullet',
    icon: '🎯',
  },
  knight: {
    name: 'Рыцарь',
    description: 'Ближний бой с высоким уроном, но малой дальностью',
    damage: 20,
    range: 100,
    fireRate: 1.33, // 0.75 sec reload
    projectileSpeed: 300,
    cost: 40,
    color: '#8b5cf6',
    projectileType: 'bullet',
    icon: '⚔️',
  },
  laser: {
    name: 'Лазер',
    description: 'Непрерывный луч с низким уроном, но высокой скоростью атаки',
    damage: 5,
    range: 200,
    fireRate: 10, // 0.1 sec reload (fixed from 100)
    projectileSpeed: 1000,
    cost: 80,
    color: '#ef4444',
    projectileType: 'line',
    icon: '⚡',
  },
  fountain: {
    name: 'Фонтан',
    description: 'Волна урона по области вокруг башни',
    damage: 10,
    range: 80,
    fireRate: 2.5, // 0.4 sec reload
    projectileSpeed: 200,
    cost: 60,
    color: '#06b6d4',
    projectileType: 'aoe',
    icon: '💧',
  },
};

// ============================================================
// UPGRADE SETTINGS
// ============================================================
export const UPGRADE_CONFIG = {
  /** Максимальный уровень башни */
  maxLevel: 3,
  /** Множитель урона за уровень */
  damageMultiplier: 1.9,
  /** Множитель дальности за уровень */
  rangeMultiplier: 1.25,
  /** Множитель скорострельности за уровень */
  fireRateMultiplier: 1.2,
  /** 
   * Функция расчета стоимости улучшения
   * По умолчанию: базовая_стоимость * уровень * 0.75
   */
  getUpgradeCost: (baseCost: number, currentLevel: number): number => {
    return Math.round(baseCost * currentLevel * 0.75);
  },
  /** 
   * Функция расчета стоимости продажи
   * По умолчанию: 60% от вложенных средств
   */
  getSellValueMultiplier: 0.6,
};

// ============================================================
// WAVE COMPOSITION
// ============================================================
/**
 * Настройка состава волн
 * 
 * Вы можете определить точный состав каждой волны или использовать
 * функцию генерации для автоматического создания.
 */
export interface WaveDefinition {
  /** Список типов врагов для волны */
  enemies: EnemyType[];
  /** Индексы боссов (какой по счету враг будет боссом) */
  bossIndices?: number[];
}

/**
 * Генератор состава волны по умолчанию
 * Используется, если для волны не определен точный состав
 */
export function generateWaveEnemies(wave: number): { type: EnemyType; isBoss: boolean }[] {
  const enemies: { type: EnemyType; isBoss: boolean }[] = [];
  const count = WAVE_CONFIG.getEnemiesCount(wave);
  const isBossWave = wave % WAVE_CONFIG.bossWaveInterval === 0;

  const types: EnemyType[] = Object.keys(ENEMY_CONFIGS) as EnemyType[];
  
  for (let i = 0; i < count; i++) {
    const isBoss = isBossWave && i === count - 1; // Последний враг на волне боссов - босс
    const typeIndex = Math.floor(Math.random() * Math.min(wave, types.length));
    enemies.push({ type: types[typeIndex], isBoss });
  }

  return enemies;
}

// ============================================================
// VISUAL SETTINGS
// ============================================================
export const VISUAL_CONFIG = {
  /** Продолжительность анимации лазера (секунды) */
  laserDuration: 0.15,
  /** Ширина линии лазера */
  laserWidth: 3,
  /** Размер снаряда */
  bulletSize: 4,
  /** Показывать путь врагов */
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
