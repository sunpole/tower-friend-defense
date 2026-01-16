import React from 'react';
import { GridCell, CELL_SIZE, Position } from '@/game/types';

interface GameGridProps {
  grid: GridCell[][];
  startCell: Position;
  endCell: Position;
  hoveredCell: Position | null;
  canPlace: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellHover: (x: number, y: number) => void;
  onCellLeave: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  startCell,
  endCell,
  hoveredCell,
  canPlace,
  onCellClick,
  onCellHover,
  onCellLeave,
}) => {
  return (
    <g>
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const isStart = x === startCell.x && y === startCell.y;
          const isEnd = x === endCell.x && y === endCell.y;
          const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
          
          let fill = '#1a1a2e';
          if (isStart) fill = '#22c55e';
          else if (isEnd) fill = '#ef4444';
          else if (isHovered) {
            fill = canPlace ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
          }

          return (
            <rect
              key={`${x}-${y}`}
              x={x * CELL_SIZE}
              y={y * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={fill}
              stroke="#2d2d44"
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
              onClick={() => onCellClick(x, y)}
              onMouseEnter={() => onCellHover(x, y)}
              onMouseLeave={onCellLeave}
            />
          );
        })
      )}
    </g>
  );
};
