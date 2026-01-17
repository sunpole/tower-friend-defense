import React from 'react';
import { Projectile, Tower } from '@/game/types';
import { TOWER_CONFIGS, VISUAL_CONFIG } from '@/game/config';

interface ProjectileRendererProps {
  projectiles: Projectile[];
  towers: Tower[];
}

export const ProjectileRenderer: React.FC<ProjectileRendererProps> = ({
  projectiles,
  towers,
}) => {
  return (
    <g>
      {projectiles.map((projectile) => {
        const tower = towers.find((t) => t.id === projectile.towerId);
        const color = tower ? TOWER_CONFIGS[tower.type].color : '#fff';

        if (projectile.type === 'aoe') {
          return (
            <circle
              key={projectile.id}
              cx={projectile.x}
              cy={projectile.y}
              r={projectile.radius || 0}
              fill="none"
              stroke={color}
              strokeWidth={3}
              opacity={1 - (projectile.radius || 0) / (projectile.maxRadius || 1)}
            />
          );
        }

        if (projectile.type === 'line') {
          // Calculate age for fading
          const age = Date.now() - (projectile.createdAt || Date.now());
          const laserDurationMs = VISUAL_CONFIG.laserDuration * 1000;
          const opacity = Math.max(0, 1 - age / laserDurationMs);
          
          return (
            <g key={projectile.id}>
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
                filter="blur(2px)"
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
            key={projectile.id}
            cx={projectile.x}
            cy={projectile.y}
            r={VISUAL_CONFIG.bulletSize}
            fill={color}
          />
        );
      })}
    </g>
  );
};
