import React from 'react';
import { Tower, CELL_SIZE, TOWER_CONFIGS } from '@/game/types';
import { getTowerStats } from '@/game/gameLogic';

interface TowerRendererProps {
  towers: Tower[];
  selectedTower: Tower | null;
  onTowerClick: (tower: Tower) => void;
}

export const TowerRenderer: React.FC<TowerRendererProps> = ({
  towers,
  selectedTower,
  onTowerClick,
}) => {
  return (
    <g>
      {towers.map((tower) => {
        const config = TOWER_CONFIGS[tower.type];
        const stats = getTowerStats(tower);
        const isSelected = selectedTower?.id === tower.id;
        const size = CELL_SIZE * 0.7;
        
        return (
          <g key={tower.id}>
            {/* Range indicator for selected tower */}
            {isSelected && (
              <circle
                cx={tower.x}
                cy={tower.y}
                r={stats.range}
                fill="rgba(255, 255, 255, 0.1)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={2}
                strokeDasharray="5,5"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Tower body */}
            <rect
              x={tower.x - size / 2}
              y={tower.y - size / 2}
              width={size}
              height={size}
              fill={config.color}
              stroke={isSelected ? '#fff' : '#000'}
              strokeWidth={isSelected ? 3 : 2}
              rx={4}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onTowerClick(tower);
              }}
            />
            
            {/* Level indicator */}
            {tower.level > 1 && (
              <text
                x={tower.x}
                y={tower.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize={14}
                fontWeight="bold"
              >
                {tower.level}
              </text>
            )}
            
            {/* Type icon */}
            <text
              x={tower.x}
              y={tower.level > 1 ? tower.y - 8 : tower.y + 5}
              textAnchor="middle"
              fill="#fff"
              fontSize={16}
            >
              {tower.type === 'sniper' && '🎯'}
              {tower.type === 'knight' && '⚔️'}
              {tower.type === 'laser' && '⚡'}
              {tower.type === 'fountain' && '💧'}
            </text>
          </g>
        );
      })}
    </g>
  );
};
