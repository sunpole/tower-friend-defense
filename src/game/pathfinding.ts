// A* Pathfinding Algorithm with 8-directional support

import { Position, GridCell } from './types';
import { GRID_CONFIG, PATHFINDING_CONFIG } from './config';

interface AStarNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to end)
  f: number; // Total cost (g + h)
  parent: AStarNode | null;
}

function heuristic(a: Position, b: Position, use8Directions: boolean): number {
  if (use8Directions) {
    // Chebyshev distance for 8-directional movement
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.max(dx, dy) + (PATHFINDING_CONFIG.diagonalCost - 1) * Math.min(dx, dy);
  }
  // Manhattan distance for 4-directional movement
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(
  node: AStarNode, 
  grid: GridCell[][], 
  use8Directions: boolean
): { pos: Position; cost: number }[] {
  const neighbors: { pos: Position; cost: number }[] = [];
  
  // 4-directional moves (straight)
  const straightDirections = [
    { x: 0, y: -1 },  // up
    { x: 0, y: 1 },   // down
    { x: -1, y: 0 },  // left
    { x: 1, y: 0 },   // right
  ];
  
  // 8-directional includes diagonals
  const diagonalDirections = [
    { x: -1, y: -1 }, // top-left
    { x: 1, y: -1 },  // top-right
    { x: -1, y: 1 },  // bottom-left
    { x: 1, y: 1 },   // bottom-right
  ];

  const gridSize = GRID_CONFIG.size;

  // Add straight directions
  for (const dir of straightDirections) {
    const newX = node.x + dir.x;
    const newY = node.y + dir.y;

    if (
      newX >= 0 &&
      newX < gridSize &&
      newY >= 0 &&
      newY < gridSize &&
      !grid[newY][newX].isBlocked
    ) {
      neighbors.push({ 
        pos: { x: newX, y: newY }, 
        cost: PATHFINDING_CONFIG.straightCost 
      });
    }
  }

  // Add diagonal directions if 8-directional is enabled
  if (use8Directions) {
    for (const dir of diagonalDirections) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;

      if (
        newX >= 0 &&
        newX < gridSize &&
        newY >= 0 &&
        newY < gridSize &&
        !grid[newY][newX].isBlocked
      ) {
        // Check if we can move diagonally (both adjacent cells must be passable)
        const adj1 = grid[node.y][newX];
        const adj2 = grid[newY][node.x];
        
        if (!adj1.isBlocked && !adj2.isBlocked) {
          neighbors.push({ 
            pos: { x: newX, y: newY }, 
            cost: PATHFINDING_CONFIG.diagonalCost 
          });
        }
      }
    }
  }

  return neighbors;
}

export function findPath(
  grid: GridCell[][],
  start: Position,
  end: Position,
  use8Directions: boolean = PATHFINDING_CONFIG.use8Directions
): Position[] | null {
  const openList: AStarNode[] = [];
  const closedSet = new Set<string>();

  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end, use8Directions),
    f: heuristic(start, end, use8Directions),
    parent: null,
  };

  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f score
    let lowestIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = openList[lowestIndex];

    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      const path: Position[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    // Move current from open to closed
    openList.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);

    // Check neighbors
    const neighbors = getNeighbors(current, grid, use8Directions);
    for (const { pos: neighbor, cost } of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;

      const g = current.g + cost;
      const h = heuristic(neighbor, end, use8Directions);
      const f = g + h;

      const existingNode = openList.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openList.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  return null; // No path found
}

export function canPlaceTower(
  grid: GridCell[][],
  x: number,
  y: number,
  start: Position,
  end: Position,
  use8Directions: boolean = PATHFINDING_CONFIG.use8Directions
): boolean {
  // Check if cell is already blocked or is start/end
  if (grid[y][x].isBlocked) return false;
  if (x === start.x && y === start.y) return false;
  if (x === end.x && y === end.y) return false;

  // Create a temporary grid with the tower placed
  const tempGrid = grid.map((row) =>
    row.map((cell) => ({ ...cell }))
  );
  tempGrid[y][x].isBlocked = true;

  // Check if path still exists
  const path = findPath(tempGrid, start, end, use8Directions);
  return path !== null;
}
