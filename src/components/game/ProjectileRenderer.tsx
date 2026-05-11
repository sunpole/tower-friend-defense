import React, { memo } from 'react';
import { Projectile, Tower } from '@/game/types';
import { VISUAL_CONFIG } from '@/game/config';
import { configStore } from '@/game/configStore';

interface ProjectileRendererProps {
  projectiles: Projectile[];
  towers: Tower[];
}

const ProjectileSprite = memo<{ projectile: Projectile; color: string }>(
  ({ projectile, color }) => {
    if (projectile.type === 'aoe') {
      const opacity = 1 - (projectile.radius || 0) / (projectile.maxRadius || 1);
      return (
        <circle
          cx={projectile.x}
          cy={projectile.y}
          r={projectile.radius || 0}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={opacity}
        />
      );
    }

    if (projectile.type === 'line') {
      const age = Date.now() - (projectile.createdAt || Date.now());
      const laserDurationMs = VISUAL_CONFIG.laserDuration * 1000;
      const opacity = Math.max(0, 1 - age / laserDurationMs);

      return (
        <g>
          {/* Main laser beam */}
          <line
            x1={projectile.x}
            y1={projectile.y}
            x2={projectile.targetX}
            y2={projectile.targetY}
            stroke={color}
            strokeWidth={VISUAL_CONFIG.laserWidth}
            opacity={opacity * 0.9}
            strokeLinecap="round"
          />
          {/* Glow effect */}
          <line
            x1={projectile.x}
            y1={projectile.y}
            x2={projectile.targetX}
            y2={projectile.targetY}
            stroke={color}
            strokeWidth={VISUAL_CONFIG.laserWidth + 4}
            opacity={opacity * 0.3}
            strokeLinecap="round"
          />
          {/* Hit indicator */}
          <circle
            cx={projectile.targetX}
            cy={projectile.targetY}
            r={6 * opacity}
            fill={color}
            opacity={opacity * 0.8}
          />
        </g>
      );
    }

    // Bullet
    return (
      <circle
        cx={projectile.x}
        cy={projectile.y}
        r={VISUAL_CONFIG.bulletSize}
        fill={color}
      />
    );
  }
);

ProjectileSprite.displayName = 'ProjectileSprite';

export const ProjectileRenderer: React.FC<ProjectileRendererProps> = memo(({
  projectiles,
  towers,
}) => {
  return (
    <g>
      {projectiles.map((projectile) => {
        const tower = towers.find((t) => t.id === projectile.towerId);
        const color = tower ? configStore.getConfig().towers[tower.type]?.color ?? '#fff' : '#fff';
        return (
          <ProjectileSprite
            key={projectile.id}
            projectile={projectile}
            color={color}
          />
        );
      })}
    </g>
  );
});