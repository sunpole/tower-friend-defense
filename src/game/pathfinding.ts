// A* Pathfinding Algorithm

import { Position, GridCell, GRID_SIZE } from './types';

interface AStarNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to end)
  f: number; // Total cost (g + h)
  parent: AStarNode | null;
}

function heuristic(a: Position, b: Position): number {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node: AStarNode, grid: GridCell[][]): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  for (const dir of directions) {
    const newX = node.x + dir.x;
    const newY = node.y + dir.y;

    if (
      newX >= 0 &&
      newX < GRID_SIZE &&
      newY >= 0 &&
      newY < GRID_SIZE &&
      !grid[newY][newX].isBlocked
    ) {
      neighbors.push({ x: newX, y: newY });
    }
  }

  return neighbors;
}

export function findPath(
  grid: GridCell[][],
  start: Position,
  end: Position
): Position[] | null {
  const openList: AStarNode[] = [];
  const closedSet = new Set<string>();

  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
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
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
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
  end: Position
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
  const path = findPath(tempGrid, start, end);
  return path !== null;
}
