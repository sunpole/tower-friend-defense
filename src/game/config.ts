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
  /** Общее количество волн (Infinity = бесконечно) */
  totalWaves: Infinity,
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
    hp: 150,
    speed: 45,
    reward: 10,
    color: '#ef4444',
  },
  fat: {
    name: 'Жирный',
    description: 'Медленный, но очень живучий танк',
    hp: 600,
    speed: 25,
    reward: 35,
    color: '#7c3aed',
  },
  thin: {
    name: 'Худой',
    description: 'Очень быстрый, но хрупкий враг',
    hp: 50,
    speed: 90,
    reward: 8,
    color: '#22c55e',
  },
  double: {
    name: 'Двойка',
    description: 'При смерти создает двух меньших врагов',
    hp: 200,
    speed: 35,
    reward: 20,
    color: '#f59e0b',
    spawnOnDeath: 'simple',
    spawnCount: 2,
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
    description: 'Дальнобойная башня с высоким уроном и критическими ударами',
    damage: 45,
    range: 280,
    fireRate: 0.8,
    projectileSpeed: 800,
    cost: 80,
    color: '#3b82f6',
    projectileType: 'bullet',
    icon: '🎯',
    /** Специальная механика: шанс крита 25%, урон x3 */
  },
  knight: {
    name: 'Рыцарь',
    description: 'Ближний бой с оглушением врагов',
    damage: 35,
    range: 90,
    fireRate: 1.5,
    projectileSpeed: 400,
    cost: 50,
    color: '#8b5cf6',
    projectileType: 'bullet',
    icon: '⚔️',
    /** Специальная механика: замедляет врагов на 20% на 1 сек */
  },
  laser: {
    name: 'Лазер',
    description: 'Непрерывный луч, наносящий урон со временем',
    damage: 8,
    range: 180,
    fireRate: 8,
    projectileSpeed: 9999,
    cost: 100,
    color: '#ef4444',
    projectileType: 'line',
    icon: '⚡',
    /** Специальная механика: урон увеличивается на 5% за каждый тик */
  },
  fountain: {
    name: 'Фонтан',
    description: 'Волна урона по области, замедляет всех врагов',
    damage: 20,
    range: 100,
    fireRate: 1.2,
    projectileSpeed: 300,
    cost: 70,
    color: '#06b6d4',
    projectileType: 'aoe',
    icon: '💧',
    /** Специальная механика: замедляет всех в области на 30% */
  },
};

// ============================================================
// UPGRADE SETTINGS
// ============================================================
export const UPGRADE_CONFIG = {
  /** Максимальный уровень башни */
  maxLevel: 5,
  /** Множитель урона за уровень */
  damageMultiplier: 1.6,
  /** Множитель дальности за уровень */
  rangeMultiplier: 1.15,
  /** Множитель скорострельности за уровень */
  fireRateMultiplier: 1.25,
  /** 
   * Функция расчета стоимости улучшения
   * Прогрессивная стоимость: каждый уровень дороже
   */
  getUpgradeCost: (baseCost: number, currentLevel: number): number => {
    return Math.round(baseCost * Math.pow(1.5, currentLevel - 1));
  },
  /** 
   * Функция расчета стоимости продажи
   * 70% от вложенных средств
   */
  getSellValueMultiplier: 0.7,
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
  laserDuration: 0.12,
  /** Ширина линии лазера */
  laserWidth: 4,
  /** Размер снаряда */
  bulletSize: 5,
  /** Показывать путь врагов по умолчанию */
  showEnemyPath: true,
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
