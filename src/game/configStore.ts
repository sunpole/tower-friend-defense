/**
 * Game Configuration Store
 * Manages runtime game configuration with import/export
 */

import {
  EnemyType,
  TowerType,
  EnemyConfig,
  TowerConfig,
  ENEMY_CONFIGS as DEFAULT_ENEMY_CONFIGS,
  TOWER_CONFIGS as DEFAULT_TOWER_CONFIGS,
  WAVE_CONFIG as DEFAULT_WAVE_CONFIG,
  PLAYER_CONFIG as DEFAULT_PLAYER_CONFIG,
  BOSS_CONFIG as DEFAULT_BOSS_CONFIG,
  UPGRADE_CONFIG as DEFAULT_UPGRADE_CONFIG,
  GRID_CONFIG as DEFAULT_GRID_CONFIG,
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
  enemies: Record<EnemyType, EnemyConfig>;
  towers: Record<TowerType, TowerConfig>;
  wave: RuntimeWaveConfig;
  player: RuntimePlayerConfig;
  boss: RuntimeBossConfig;
  upgrade: RuntimeUpgradeConfig;
}

// Create deep clones of default configs
const createDefaultConfig = (): GameConfigState => ({
  enemies: JSON.parse(JSON.stringify(DEFAULT_ENEMY_CONFIGS)),
  towers: JSON.parse(JSON.stringify(DEFAULT_TOWER_CONFIGS)),
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

// Current runtime config
let currentConfig: GameConfigState = createDefaultConfig();

// Subscribers for config changes
type ConfigSubscriber = (config: GameConfigState) => void;
const subscribers: Set<ConfigSubscriber> = new Set();

export const configStore = {
  /** Get current config */
  getConfig: (): GameConfigState => currentConfig,

  /** Update entire config */
  setConfig: (config: GameConfigState) => {
    currentConfig = JSON.parse(JSON.stringify(config));
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update a specific enemy */
  updateEnemy: (type: EnemyType, updates: Partial<EnemyConfig>) => {
    currentConfig.enemies[type] = { ...currentConfig.enemies[type], ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update a specific tower */
  updateTower: (type: TowerType, updates: Partial<TowerConfig>) => {
    currentConfig.towers[type] = { ...currentConfig.towers[type], ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update wave config */
  updateWave: (updates: Partial<RuntimeWaveConfig>) => {
    currentConfig.wave = { ...currentConfig.wave, ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update player config */
  updatePlayer: (updates: Partial<RuntimePlayerConfig>) => {
    currentConfig.player = { ...currentConfig.player, ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update boss config */
  updateBoss: (updates: Partial<RuntimeBossConfig>) => {
    currentConfig.boss = { ...currentConfig.boss, ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Update upgrade config */
  updateUpgrade: (updates: Partial<RuntimeUpgradeConfig>) => {
    currentConfig.upgrade = { ...currentConfig.upgrade, ...updates };
    subscribers.forEach((fn) => fn(currentConfig));
  },

  /** Reset to default config */
  resetToDefaults: () => {
    currentConfig = createDefaultConfig();
    subscribers.forEach((fn) => fn(currentConfig));
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
      currentConfig = parsed;
      subscribers.forEach((fn) => fn(currentConfig));
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
};

// React hook for using config
import { useState, useEffect } from 'react';

export function useGameConfig(): GameConfigState {
  const [config, setConfig] = useState<GameConfigState>(configStore.getConfig());

  useEffect(() => {
    return configStore.subscribe(setConfig);
  }, []);

  return config;
}
