import {
  Enemy,
  Tower,
  Projectile,
  Position,
  CELL_SIZE,
  WaveInfo,
} from './types';
import { 
  ENEMY_CONFIGS, 
  TOWER_CONFIGS, 
  UPGRADE_CONFIG,
  BOSS_CONFIG,
  VISUAL_CONFIG,
  generateWaveEnemies,
  EnemyType,
} from './config';
import { findPath } from './pathfinding';

let idCounter = 0;
function generateId(): string {
  return `id_${++idCounter}`;
}

export function gridToPixel(gridPos: number): number {
  return gridPos * CELL_SIZE + CELL_SIZE / 2;
}

export function pixelToGrid(pixel: number): number {
  return Math.floor(pixel / CELL_SIZE);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function createEnemy(
  type: EnemyType,
  startCell: Position,
  grid: any[][],
  endCell: Position,
  isBoss: boolean = false,
  wave: number = 1
): Enemy | null {
  const config = ENEMY_CONFIGS[type];
  const path = findPath(grid, startCell, endCell, true);

  if (!path) return null;

  // Difficulty scaling: after wave 20 enemies ramp harder
  // HP scales more aggressively (+15% per wave after 20)
  const over20 = Math.max(0, wave - 20);
  const hpScale = 1 + over20 * 0.15;
  const speedScale = 1 + over20 * 0.05;

  // Base wave scaling (before wave 20)
  const baseWaveScale = 1 + (Math.min(wave, 20) - 1) * 0.08;

  const hpMultiplier = (isBoss ? BOSS_CONFIG.hpMultiplier : 1) * hpScale * baseWaveScale;
  const speedMultiplier = (isBoss ? BOSS_CONFIG.speedMultiplier : 1) * speedScale;
  const rewardMultiplier = isBoss ? BOSS_CONFIG.rewardMultiplier : 1;

  return {
    id: generateId(),
    type,
    hp: Math.round(config.hp * hpMultiplier),
    maxHp: Math.round(config.hp * hpMultiplier),
    speed: config.speed * speedMultiplier,
    x: gridToPixel(startCell.x),
    y: gridToPixel(startCell.y),
    path: path.map((p) => ({ x: gridToPixel(p.x), y: gridToPixel(p.y) })),
    pathIndex: 0,
    reward: Math.round(config.reward * rewardMultiplier),
    spawnOnDeath: isBoss ? undefined : config.spawnOnDeath, // Bosses don't spawn
    spawnCount: config.spawnCount,
    isBoss,
  };
}

export function updateEnemies(
  enemies: Enemy[],
  deltaTime: number,
  grid: any[][],
  endCell: Position
): { updatedEnemies: Enemy[]; reachedEnd: Enemy[] } {
  const updatedEnemies: Enemy[] = [];
  const reachedEnd: Enemy[] = [];

  for (const enemy of enemies) {
    if (enemy.pathIndex >= enemy.path.length) {
      reachedEnd.push(enemy);
      continue;
    }

    const target = enemy.path[enemy.pathIndex];
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveDistance = enemy.speed * deltaTime;

    if (dist <= moveDistance) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.pathIndex++;
    } else {
      enemy.x += (dx / dist) * moveDistance;
      enemy.y += (dy / dist) * moveDistance;
    }

    if (enemy.pathIndex >= enemy.path.length) {
      reachedEnd.push(enemy);
    } else {
      updatedEnemies.push(enemy);
    }
  }

  return { updatedEnemies, reachedEnd };
}

/**
 * Recalculate paths for all enemies when grid changes (tower placed/sold)
 * Uses pixel-perfect continuation to prevent backtracking
 */
export function recalculateEnemyPaths(
  enemies: Enemy[],
  grid: any[][],
  endCell: Position
): Enemy[] {
  return enemies.map((enemy) => {
    const currentGridX = pixelToGrid(enemy.x);
    const currentGridY = pixelToGrid(enemy.y);

    const gridPath = findPath(grid, { x: currentGridX, y: currentGridY }, endCell, true);

    if (gridPath && gridPath.length > 0) {
      // Build pixel path starting from current position
      const pixelPath = gridPath.map((p) => ({ x: gridToPixel(p.x), y: gridToPixel(p.y) }));
      
      // Start from current pixel position, then continue to next waypoint
      // Skip the first waypoint if enemy is already close to current cell center
      const currentCellCenter = { x: gridToPixel(currentGridX), y: gridToPixel(currentGridY) };
      const distToCenter = distance(enemy.x, enemy.y, currentCellCenter.x, currentCellCenter.y);
      
      let newPath: Position[];
      if (distToCenter < CELL_SIZE * 0.3 && pixelPath.length > 1) {
        // Close to center, skip to next waypoint
        newPath = [{ x: enemy.x, y: enemy.y }, ...pixelPath.slice(1)];
      } else {
        // Not close, include current cell center as first waypoint
        newPath = [{ x: enemy.x, y: enemy.y }, ...pixelPath];
      }

      return {
        ...enemy,
        path: newPath,
        pathIndex: 1, // Start moving to next waypoint
      };
    }

    return enemy;
  });
}

export function getTowerStats(tower: Tower): { damage: number; range: number; fireRate: number } {
  const baseConfig = TOWER_CONFIGS[tower.type];
  const levelMultiplier = tower.level - 1;
  
  return {
    damage: Math.round(baseConfig.damage * Math.pow(UPGRADE_CONFIG.damageMultiplier, levelMultiplier)),
    range: Math.round(baseConfig.range * Math.pow(UPGRADE_CONFIG.rangeMultiplier, levelMultiplier)),
    fireRate: baseConfig.fireRate * Math.pow(UPGRADE_CONFIG.fireRateMultiplier, levelMultiplier),
  };
}

export function updateTowers(
  towers: Tower[],
  enemies: Enemy[],
  projectiles: Projectile[],
  deltaTime: number
): { updatedTowers: Tower[]; newProjectiles: Projectile[] } {
  const newProjectiles: Projectile[] = [];
  const updatedTowers = towers.map((tower) => {
    const stats = getTowerStats(tower);
    const updatedTower = { ...tower };
    
    updatedTower.cooldown = Math.max(0, tower.cooldown - deltaTime);

    if (updatedTower.cooldown <= 0) {
      // Find target in range
      const target = enemies.find((enemy) => {
        const dist = distance(tower.x, tower.y, enemy.x, enemy.y);
        return dist <= stats.range;
      });

      if (target) {
        const config = TOWER_CONFIGS[tower.type];
        
        if (config.projectileType === 'aoe') {
          // AOE wave
          newProjectiles.push({
            id: generateId(),
            type: 'aoe',
            x: tower.x,
            y: tower.y,
            targetX: tower.x,
            targetY: tower.y,
            speed: config.projectileSpeed,
            damage: stats.damage,
            towerId: tower.id,
            radius: 0,
            maxRadius: stats.range,
            createdAt: Date.now(),
          });
        } else {
          // Bullet or line
          newProjectiles.push({
            id: generateId(),
            type: config.projectileType,
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            speed: config.projectileSpeed,
            damage: stats.damage,
            towerId: tower.id,
            enemyId: target.id,
            createdAt: Date.now(),
          });
        }

        updatedTower.cooldown = 1 / stats.fireRate;
      }
    }

    return updatedTower;
  });

  return { updatedTowers, newProjectiles };
}

export function updateProjectiles(
  projectiles: Projectile[],
  enemies: Enemy[],
  deltaTime: number
): { updatedProjectiles: Projectile[]; updatedEnemies: Enemy[]; goldEarned: number; newEnemies: Enemy[] } {
  const updatedProjectiles: Projectile[] = [];
  let updatedEnemies = [...enemies];
  let goldEarned = 0;
  const newEnemies: Enemy[] = [];
  const hitEnemies = new Set<string>();

  for (const projectile of projectiles) {
    if (projectile.type === 'aoe') {
      // Expand AOE
      const newRadius = (projectile.radius || 0) + projectile.speed * deltaTime;
      
      if (newRadius < (projectile.maxRadius || 0)) {
        // Damage enemies in the ring
        updatedEnemies = updatedEnemies.map((enemy) => {
          const dist = distance(projectile.x, projectile.y, enemy.x, enemy.y);
          const prevRadius = projectile.radius || 0;
          
          if (dist >= prevRadius && dist <= newRadius && !hitEnemies.has(`${projectile.id}-${enemy.id}`)) {
            hitEnemies.add(`${projectile.id}-${enemy.id}`);
            return { ...enemy, hp: enemy.hp - projectile.damage };
          }
          return enemy;
        });

        updatedProjectiles.push({ ...projectile, radius: newRadius });
      }
    } else if (projectile.type === 'line') {
      // Laser - instant hit but visible for a short time
      const age = Date.now() - (projectile.createdAt || Date.now());
      const laserDurationMs = VISUAL_CONFIG.laserDuration * 1000;
      
      if (age < laserDurationMs) {
        // Still visible
        updatedProjectiles.push(projectile);
        
        // Only deal damage on first frame
        if (age < 20) {
          const targetEnemy = updatedEnemies.find((e) => e.id === projectile.enemyId);
          if (targetEnemy) {
            targetEnemy.hp -= projectile.damage;
          }
        }
      }
    } else {
      // Bullet - move towards target
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = projectile.speed * deltaTime;

      if (dist <= moveDistance || dist < 5) {
        // Hit target
        const targetEnemy = updatedEnemies.find((e) => e.id === projectile.enemyId);
        if (targetEnemy) {
          targetEnemy.hp -= projectile.damage;
        }
      } else {
        projectile.x += (dx / dist) * moveDistance;
        projectile.y += (dy / dist) * moveDistance;
        updatedProjectiles.push(projectile);
      }
    }
  }

  // Check for dead enemies
  const aliveEnemies: Enemy[] = [];
  for (const enemy of updatedEnemies) {
    if (enemy.hp <= 0) {
      goldEarned += enemy.reward;

      // Spawn enemies on death (e.g. "double")
      if (enemy.spawnOnDeath && !enemy.id.includes('_spawned')) {
        const spawnType = enemy.spawnOnDeath;
        const spawnConfig = ENEMY_CONFIGS[spawnType];
        const count = Math.max(1, enemy.spawnCount ?? spawnConfig.spawnCount ?? 1);

        for (let i = 0; i < count; i++) {
          newEnemies.push({
            ...enemy,
            id: `${enemy.id}_spawned_${i}`,
            type: spawnType,
            hp: spawnConfig.hp,
            maxHp: spawnConfig.hp,
            speed: spawnConfig.speed,
            reward: spawnConfig.reward,
            spawnOnDeath: spawnConfig.spawnOnDeath,
            spawnCount: spawnConfig.spawnCount,
          });
        }
      }
    } else {
      aliveEnemies.push(enemy);
    }
  }

  return {
    updatedProjectiles,
    updatedEnemies: aliveEnemies,
    goldEarned,
    newEnemies,
  };
}

export function getWaveEnemies(wave: number): { type: EnemyType; isBoss: boolean }[] {
  return generateWaveEnemies(wave);
}

export function getUpgradeCost(tower: Tower): number {
  const baseCost = TOWER_CONFIGS[tower.type].cost;
  return UPGRADE_CONFIG.getUpgradeCost(baseCost, tower.level);
}

export function getSellValue(tower: Tower): number {
  const baseCost = TOWER_CONFIGS[tower.type].cost;
  let totalInvested = baseCost;
  for (let i = 1; i < tower.level; i++) {
    totalInvested += UPGRADE_CONFIG.getUpgradeCost(baseCost, i);
  }
  return Math.round(totalInvested * UPGRADE_CONFIG.getSellValueMultiplier);
}

export function createInitialWaveInfo(): WaveInfo {
  return {
    total: 0,
    spawned: 0,
    alive: 0,
  };
}