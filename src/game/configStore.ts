/**
 * Game Configuration Store
 * Manages runtime game configuration with import/export and localStorage persistence
 */

import {
  EnemyConfig,
  TowerConfig,
  ENEMY_CONFIGS as DEFAULT_ENEMY_CONFIGS,
  TOWER_CONFIGS as DEFAULT_TOWER_CONFIGS,
  WAVE_CONFIG as DEFAULT_WAVE_CONFIG,
  PLAYER_CONFIG as DEFAULT_PLAYER_CONFIG,
  BOSS_CONFIG as DEFAULT_BOSS_CONFIG,
  UPGRADE_CONFIG as DEFAULT_UPGRADE_CONFIG,
} from './config';

export interface RuntimeWaveConfig {
  bossWaveInterval: number;
  baseEnemiesPerWave: number;
  spawnInterval: number;
}

export interface RuntimePlayerConfig {
  startingGold: number;
  startingLives: number;
}

export interface RuntimeBossConfig {
  hpMultiplier: number;
  speedMultiplier: number;
  rewardMultiplier: number;
  sizeMultiplier: number;
}

export interface RuntimeUpgradeConfig {
  maxLevel: number;
  damageMultiplier: number;
  rangeMultiplier: number;
  fireRateMultiplier: number;
  sellValueMultiplier: number;
}

export interface GameConfigState {
  enemies: Record<string, EnemyConfig>;
  towers: Record<string, TowerConfig>;
  wave: RuntimeWaveConfig;
  player: RuntimePlayerConfig;
  boss: RuntimeBossConfig;
  upgrade: RuntimeUpgradeConfig;
}

const STORAGE_KEY = 'tower-defense-config';

const cloneConfig = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const mergeConfig = (config: Partial<GameConfigState>): GameConfigState => {
  const defaults = createDefaultConfig();
  return {
    enemies: { ...defaults.enemies, ...(config.enemies ?? {}) },
    towers: { ...defaults.towers, ...(config.towers ?? {}) },
    wave: { ...defaults.wave, ...(config.wave ?? {}) },
    player: { ...defaults.player, ...(config.player ?? {}) },
    boss: { ...defaults.boss, ...(config.boss ?? {}) },
    upgrade: { ...defaults.upgrade, ...(config.upgrade ?? {}) },
  };
};

// Create deep clones of default configs
const createDefaultConfig = (): GameConfigState => ({
  enemies: cloneConfig(DEFAULT_ENEMY_CONFIGS),
  towers: cloneConfig(DEFAULT_TOWER_CONFIGS),
  wave: {
    bossWaveInterval: DEFAULT_WAVE_CONFIG.bossWaveInterval,
    baseEnemiesPerWave: DEFAULT_WAVE_CONFIG.baseEnemiesPerWave,
    spawnInterval: DEFAULT_WAVE_CONFIG.spawnInterval,
  },
  player: {
    startingGold: DEFAULT_PLAYER_CONFIG.startingGold,
    startingLives: DEFAULT_PLAYER_CONFIG.startingLives,
  },
  boss: {
    hpMultiplier: DEFAULT_BOSS_CONFIG.hpMultiplier,
    speedMultiplier: DEFAULT_BOSS_CONFIG.speedMultiplier,
    rewardMultiplier: DEFAULT_BOSS_CONFIG.rewardMultiplier,
    sizeMultiplier: DEFAULT_BOSS_CONFIG.sizeMultiplier,
  },
  upgrade: {
    maxLevel: DEFAULT_UPGRADE_CONFIG.maxLevel,
    damageMultiplier: DEFAULT_UPGRADE_CONFIG.damageMultiplier,
    rangeMultiplier: DEFAULT_UPGRADE_CONFIG.rangeMultiplier,
    fireRateMultiplier: DEFAULT_UPGRADE_CONFIG.fireRateMultiplier,
    sellValueMultiplier: DEFAULT_UPGRADE_CONFIG.getSellValueMultiplier,
  },
});

// Load config from localStorage or use defaults
const loadConfigFromStorage = (): GameConfigState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return mergeConfig(parsed);
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error);
  }
  return createDefaultConfig();
};

// Current runtime config
let currentConfig: GameConfigState = loadConfigFromStorage();

// Subscribers for config changes
type ConfigSubscriber = (config: GameConfigState) => void;
const subscribers: Set<ConfigSubscriber> = new Set();

// Notify all subscribers
const notifySubscribers = () => {
  const snapshot = cloneConfig(currentConfig);
  subscribers.forEach((fn) => fn(snapshot));
};

// Save to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
  } catch (error) {
    console.warn('Failed to save config to localStorage:', error);
  }
};

export const configStore = {
  /** Get current config */
  getConfig: (): GameConfigState => currentConfig,

  /** Update entire config */
  setConfig: (config: GameConfigState) => {
    currentConfig = mergeConfig(config);
    saveToStorage();
    notifySubscribers();
  },

  /** Update a specific enemy */
  updateEnemy: (type: string, updates: Partial<EnemyConfig>) => {
    if (!currentConfig.enemies[type]) {
      console.warn(`Enemy type ${type} not found`);
      return;
    }
    currentConfig = {
      ...currentConfig,
      enemies: {
        ...currentConfig.enemies,
        [type]: { ...currentConfig.enemies[type], ...updates },
      },
    };
    saveToStorage();
    notifySubscribers();
  },

  /** Update a specific tower */
  updateTower: (type: string, updates: Partial<TowerConfig>) => {
    if (!currentConfig.towers[type]) {
      console.warn(`Tower type ${type} not found`);
      return;
    }
    currentConfig = {
      ...currentConfig,
      towers: {
        ...currentConfig.towers,
        [type]: { ...currentConfig.towers[type], ...updates },
      },
    };
    saveToStorage();
    notifySubscribers();
  },

  /** Add a new enemy type */
  addEnemy: (type: string, config: EnemyConfig) => {
    if (currentConfig.enemies[type]) {
      console.warn(`Enemy type ${type} already exists`);
      return false;
    }
    currentConfig = { ...currentConfig, enemies: { ...currentConfig.enemies, [type]: cloneConfig(config) } };
    saveToStorage();
    notifySubscribers();
    return true;
  },

  /** Add a new tower type */
  addTower: (type: string, config: TowerConfig) => {
    if (currentConfig.towers[type]) {
      console.warn(`Tower type ${type} already exists`);
      return false;
    }
    currentConfig = { ...currentConfig, towers: { ...currentConfig.towers, [type]: cloneConfig(config) } };
    saveToStorage();
    notifySubscribers();
    return true;
  },

  /** Delete an enemy type */
  deleteEnemy: (type: string) => {
    if (!currentConfig.enemies[type]) return false;
    const { [type]: _deletedEnemy, ...remainingEnemies } = currentConfig.enemies;
    currentConfig = {
      ...currentConfig,
      enemies: remainingEnemies,
    };
    saveToStorage();
    notifySubscribers();
    return true;
  },

  /** Delete a tower type */
  deleteTower: (type: string) => {
    if (!currentConfig.towers[type]) return false;
    const { [type]: _deletedTower, ...remainingTowers } = currentConfig.towers;
    currentConfig = {
      ...currentConfig,
      towers: remainingTowers,
    };
    saveToStorage();
    notifySubscribers();
    return true;
  },

  /** Update wave config */
  updateWave: (updates: Partial<RuntimeWaveConfig>) => {
    currentConfig = { ...currentConfig, wave: { ...currentConfig.wave, ...updates } };
    saveToStorage();
    notifySubscribers();
  },

  /** Update player config */
  updatePlayer: (updates: Partial<RuntimePlayerConfig>) => {
    currentConfig = { ...currentConfig, player: { ...currentConfig.player, ...updates } };
    saveToStorage();
    notifySubscribers();
  },

  /** Update boss config */
  updateBoss: (updates: Partial<RuntimeBossConfig>) => {
    currentConfig = { ...currentConfig, boss: { ...currentConfig.boss, ...updates } };
    saveToStorage();
    notifySubscribers();
  },

  /** Update upgrade config */
  updateUpgrade: (updates: Partial<RuntimeUpgradeConfig>) => {
    currentConfig = { ...currentConfig, upgrade: { ...currentConfig.upgrade, ...updates } };
    saveToStorage();
    notifySubscribers();
  },

  /** Reset to default config */
  resetToDefaults: () => {
    currentConfig = createDefaultConfig();
    localStorage.removeItem(STORAGE_KEY);
    notifySubscribers();
  },

  /** Export config as JSON string */
  exportConfig: (): string => {
    return JSON.stringify(currentConfig, null, 2);
  },

  /** Import config from JSON string */
  importConfig: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      // Validate structure
      if (!parsed.enemies || !parsed.towers || !parsed.wave || !parsed.player || !parsed.boss || !parsed.upgrade) {
        throw new Error('Invalid config structure');
      }
      currentConfig = mergeConfig(parsed);
      saveToStorage();
      notifySubscribers();
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  },

  /** Subscribe to config changes */
  subscribe: (fn: ConfigSubscriber): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },

  /** Get list of all enemy types */
  getEnemyTypes: (): string[] => Object.keys(currentConfig.enemies),

  /** Get list of all tower types */
  getTowerTypes: (): string[] => Object.keys(currentConfig.towers),
};

// React hook for using config
import { useState, useEffect } from 'react';

export function useGameConfig(): GameConfigState {
  const [config, setConfig] = useState<GameConfigState>(() => cloneConfig(configStore.getConfig()));

  useEffect(() => {
    return configStore.subscribe(setConfig);
  }, []);

  return config;
}
