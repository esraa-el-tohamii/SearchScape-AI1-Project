export type CellType = 'empty' | 'wall' | 'start' | 'goal' | 'visited' | 'path' | 'exploring';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  heuristic: number;
  totalCost: number;
  parent: Cell | null;
  visitOrder: number;
}

export interface PathfindingResult {
  path: Cell[];
  visitedOrder: Cell[];
  nodesExplored: number;
  pathLength: number;
  executionTime: number;
}

export type Algorithm = 'bfs' | 'dfs' | 'ucs' | 'dls' | 'ids' | 'bidirectional' | 'greedy' | 'astar';
export type MovementMode = '4-directional' | '8-directional';

const DIRECTIONS_4 = [
  [-1, 0], [1, 0], [0, -1], [0, 1]
];

const DIRECTIONS_8 = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

function getNeighbors(
  grid: Cell[][],
  cell: Cell,
  mode: MovementMode
): Cell[] {
  const directions = mode === '4-directional' ? DIRECTIONS_4 : DIRECTIONS_8;
  const neighbors: Cell[] = [];
  
  for (const [dr, dc] of directions) {
    const newRow = cell.row + dr;
    const newCol = cell.col + dc;
    
    if (
      newRow >= 0 && newRow < grid.length &&
      newCol >= 0 && newCol < grid[0].length &&
      grid[newRow][newCol].type !== 'wall'
    ) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  
  return neighbors;
}

function heuristic(a: Cell, b: Cell, mode: MovementMode): number {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);

  if (mode === '8-directional') {
    // Octile distance keeps A* admissible with diagonal movement cost.
    const diagonal = Math.min(rowDiff, colDiff);
    const straight = Math.max(rowDiff, colDiff) - diagonal;
    return diagonal * 1.414 + straight;
  }

  return rowDiff + colDiff;
}

function reconstructPath(endCell: Cell): Cell[] {
  const path: Cell[] = [];
  let current: Cell | null = endCell;
  
  while (current) {
    path.unshift(current);
    current = current.parent;
  }
  
  return path;
}

export function bfs(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const queue: Cell[] = [start];
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  visited.add(`${start.row},${start.col}`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        neighbor.parent = current;
        queue.push(neighbor);
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

export function dfs(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const stack: Cell[] = [start];
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    const neighbors = getNeighbors(grid, current, mode);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        neighbor.parent = current;
        stack.push(neighbor);
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

// Uniform Cost Search (UCS) - uses path cost only
export function ucs(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  // Reset distances
  for (const row of grid) {
    for (const cell of row) {
      cell.distance = Infinity;
      cell.parent = null;
    }
  }
  
  start.distance = 0;
  const queue: Cell[] = [start];
  
  while (queue.length > 0) {
    // Sort by distance (path cost) - priority queue behavior
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        const isDiagonal = Math.abs(current.row - neighbor.row) + Math.abs(current.col - neighbor.col) === 2;
        const cost = isDiagonal ? 1.414 : 1;
        const newDist = current.distance + cost;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

// Depth-Limited Search (DLS)
export function dls(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode,
  depthLimit: number = 50
): PathfindingResult {
  const startTime = performance.now();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  let found = false;
  let foundPath: Cell[] = [];

  function dlsRecursive(
    current: Cell,
    depth: number,
    visited: Set<string>
  ): boolean {
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) return false;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      foundPath = reconstructPath(current);
      return true;
    }
    
    if (depth >= depthLimit) {
      visited.delete(key);
      return false;
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        neighbor.parent = current;
        if (dlsRecursive(neighbor, depth + 1, visited)) {
          return true;
        }
      }
    }
    
    visited.delete(key);
    return false;
  }

  // Reset parents
  for (const row of grid) {
    for (const cell of row) {
      cell.parent = null;
    }
  }

  found = dlsRecursive(start, 0, new Set());
  
  return {
    path: found ? foundPath : [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: found ? foundPath.length : 0,
    executionTime: performance.now() - startTime
  };
}

// Iterative Deepening Search (IDS)
export function ids(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode,
  maxDepth: number = 100
): PathfindingResult {
  const startTime = performance.now();
  const allVisitedOrder: Cell[] = [];
  
  for (let depth = 0; depth <= maxDepth; depth++) {
    // Reset grid state for each iteration
    for (const row of grid) {
      for (const cell of row) {
        cell.parent = null;
        cell.visitOrder = -1;
      }
    }
    
    const result = dls(grid, start, goal, mode, depth);
    
    // Add unique visited cells
    for (const cell of result.visitedOrder) {
      const key = `${cell.row},${cell.col}`;
      if (!allVisitedOrder.some(c => `${c.row},${c.col}` === key)) {
        allVisitedOrder.push(cell);
      }
    }
    
    if (result.path.length > 0) {
      return {
        path: result.path,
        visitedOrder: allVisitedOrder,
        nodesExplored: allVisitedOrder.length,
        pathLength: result.pathLength,
        executionTime: performance.now() - startTime
      };
    }
  }
  
  return {
    path: [],
    visitedOrder: allVisitedOrder,
    nodesExplored: allVisitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

// Bidirectional Search
export function bidirectional(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  // Reset grid
  for (const row of grid) {
    for (const cell of row) {
      cell.parent = null;
    }
  }
  
  // Two queues and visited sets
  const queueStart: Cell[] = [start];
  const queueGoal: Cell[] = [goal];
  const visitedStart = new Map<string, Cell>();
  const visitedGoal = new Map<string, Cell>();
  const parentStart = new Map<string, Cell | null>();
  const parentGoal = new Map<string, Cell | null>();
  
  visitedStart.set(`${start.row},${start.col}`, start);
  visitedGoal.set(`${goal.row},${goal.col}`, goal);
  parentStart.set(`${start.row},${start.col}`, null);
  parentGoal.set(`${goal.row},${goal.col}`, null);
  
  let meetingCell: Cell | null = null;
  
  while (queueStart.length > 0 && queueGoal.length > 0) {
    // Expand from start
    if (queueStart.length > 0) {
      const current = queueStart.shift()!;
      const key = `${current.row},${current.col}`;
      current.visitOrder = visitOrder++;
      
      if (current.type !== 'start' && current.type !== 'goal') {
        visitedOrder.push(current);
      }
      
      // Check if meets goal search
      if (visitedGoal.has(key)) {
        meetingCell = current;
        break;
      }
      
      for (const neighbor of getNeighbors(grid, current, mode)) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (!visitedStart.has(neighborKey)) {
          visitedStart.set(neighborKey, neighbor);
          parentStart.set(neighborKey, current);
          queueStart.push(neighbor);
        }
      }
    }
    
    // Expand from goal
    if (queueGoal.length > 0) {
      const current = queueGoal.shift()!;
      const key = `${current.row},${current.col}`;
      current.visitOrder = visitOrder++;
      
      if (current.type !== 'start' && current.type !== 'goal') {
        visitedOrder.push(current);
      }
      
      // Check if meets start search
      if (visitedStart.has(key)) {
        meetingCell = current;
        break;
      }
      
      for (const neighbor of getNeighbors(grid, current, mode)) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (!visitedGoal.has(neighborKey)) {
          visitedGoal.set(neighborKey, neighbor);
          parentGoal.set(neighborKey, current);
          queueGoal.push(neighbor);
        }
      }
    }
  }
  
  if (meetingCell) {
    // Reconstruct path from start to meeting point
    const pathFromStart: Cell[] = [];
    let current: Cell | null = meetingCell;
    const meetKey = `${meetingCell.row},${meetingCell.col}`;
    
    // Build path from meeting to start
    let key = meetKey;
    while (parentStart.has(key) && parentStart.get(key) !== null) {
      pathFromStart.unshift(grid[parseInt(key.split(',')[0])][parseInt(key.split(',')[1])]);
      const parent = parentStart.get(key)!;
      key = `${parent.row},${parent.col}`;
    }
    pathFromStart.unshift(start);
    
    // Build path from meeting to goal
    const pathFromGoal: Cell[] = [];
    key = meetKey;
    while (parentGoal.has(key) && parentGoal.get(key) !== null) {
      const parent = parentGoal.get(key)!;
      key = `${parent.row},${parent.col}`;
      pathFromGoal.push(grid[parseInt(key.split(',')[0])][parseInt(key.split(',')[1])]);
    }
    
    const fullPath = [...pathFromStart, ...pathFromGoal];
    
    return {
      path: fullPath,
      visitedOrder,
      nodesExplored: visitedOrder.length,
      pathLength: fullPath.length,
      executionTime: performance.now() - startTime
    };
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

// Greedy Best-First Search
export function greedy(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  // Reset heuristics
  for (const row of grid) {
    for (const cell of row) {
      cell.heuristic = heuristic(cell, goal, mode);
      cell.parent = null;
    }
  }
  
  const queue: Cell[] = [start];
  
  while (queue.length > 0) {
    // Sort by heuristic only (greedy)
    queue.sort((a, b) => a.heuristic - b.heuristic);
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        neighbor.parent = current;
        queue.push(neighbor);
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

// MinHeap for priority queue operations
class MinHeap {
  private heap: Cell[] = [];
  private getKey: (cell: Cell) => number;

  constructor(getKey: (cell: Cell) => number) {
    this.getKey = getKey;
  }

  push(cell: Cell) {
    this.heap.push(cell);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): Cell | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.getKey(this.heap[index]) >= this.getKey(this.heap[parentIndex])) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.getKey(this.heap[leftChild]) < this.getKey(this.heap[smallest])) {
        smallest = leftChild;
      }
      if (rightChild < length && this.getKey(this.heap[rightChild]) < this.getKey(this.heap[smallest])) {
        smallest = rightChild;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Calculate movement cost (diagonal = sqrt(2) ≈ 1.414)
function getMovementCost(from: Cell, to: Cell): number {
  const isDiagonal = Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 2;
  return isDiagonal ? 1.414 : 1;
}

export function dijkstra(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  // Reset distances
  for (const row of grid) {
    for (const cell of row) {
      cell.distance = Infinity;
      cell.parent = null;
    }
  }
  
  start.distance = 0;
  const priorityQueue = new MinHeap((cell) => cell.distance);
  priorityQueue.push(start);
  
  while (!priorityQueue.isEmpty()) {
    const current = priorityQueue.pop()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        const moveCost = getMovementCost(current, neighbor);
        const newDist = current.distance + moveCost;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.parent = current;
          priorityQueue.push(neighbor);
        }
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

export function astar(
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode
): PathfindingResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const visitedOrder: Cell[] = [];
  let visitOrder = 0;
  
  // Reset costs
  for (const row of grid) {
    for (const cell of row) {
      cell.distance = Infinity; // gCost
      cell.heuristic = heuristic(cell, goal, mode);
      cell.totalCost = Infinity; // fCost = gCost + hCost
      cell.parent = null;
    }
  }
  
  start.distance = 0;
  start.totalCost = start.heuristic;
  const openSet = new MinHeap((cell) => cell.totalCost);
  openSet.push(start);
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    current.visitOrder = visitOrder++;
    
    if (current.type !== 'start' && current.type !== 'goal') {
      visitedOrder.push(current);
    }
    
    if (current.row === goal.row && current.col === goal.col) {
      const path = reconstructPath(current);
      return {
        path,
        visitedOrder,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTime: performance.now() - startTime
      };
    }
    
    for (const neighbor of getNeighbors(grid, current, mode)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        const moveCost = getMovementCost(current, neighbor);
        const newGCost = current.distance + moveCost;
        if (newGCost < neighbor.distance) {
          neighbor.distance = newGCost;
          neighbor.totalCost = newGCost + neighbor.heuristic;
          neighbor.parent = current;
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTime: performance.now() - startTime
  };
}

export function runAlgorithm(
  algorithm: Algorithm,
  grid: Cell[][],
  start: Cell,
  goal: Cell,
  mode: MovementMode,
  depthLimit: number = 50
): PathfindingResult {
  // Deep clone the grid to avoid mutations
  const clonedGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      parent: null,
      distance: Infinity,
      heuristic: 0,
      totalCost: Infinity,
      visitOrder: -1
    }))
  );
  
  const clonedStart = clonedGrid[start.row][start.col];
  const clonedGoal = clonedGrid[goal.row][goal.col];
  
  switch (algorithm) {
    case 'bfs':
      return bfs(clonedGrid, clonedStart, clonedGoal, mode);
    case 'dfs':
      return dfs(clonedGrid, clonedStart, clonedGoal, mode);
    case 'ucs':
      return ucs(clonedGrid, clonedStart, clonedGoal, mode);
    case 'dls':
      return dls(clonedGrid, clonedStart, clonedGoal, mode, depthLimit);
    case 'ids':
      return ids(clonedGrid, clonedStart, clonedGoal, mode, depthLimit);
    case 'bidirectional':
      return bidirectional(clonedGrid, clonedStart, clonedGoal, mode);
    case 'greedy':
      return greedy(clonedGrid, clonedStart, clonedGoal, mode);
    case 'astar':
      return astar(clonedGrid, clonedStart, clonedGoal, mode);
    default:
      return bfs(clonedGrid, clonedStart, clonedGoal, mode);
  }
}

export function createGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      type: 'empty' as CellType,
      distance: Infinity,
      heuristic: 0,
      totalCost: Infinity,
      parent: null,
      visitOrder: -1
    }))
  );
}
