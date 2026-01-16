import React from 'react';
import { Projectile, Tower, TOWER_CONFIGS } from '@/game/types';

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
          return (
            <line
              key={projectile.id}
              x1={projectile.x}
              y1={projectile.y}
              x2={projectile.x + (projectile.targetX - projectile.x) * 0.3}
              y2={projectile.y + (projectile.targetY - projectile.y) * 0.3}
              stroke={color}
              strokeWidth={2}
              opacity={0.8}
            />
          );
        }

        // Bullet
        return (
          <circle
            key={projectile.id}
            cx={projectile.x}
            cy={projectile.y}
            r={4}
            fill={color}
          />
        );
      })}
    </g>
  );
};
