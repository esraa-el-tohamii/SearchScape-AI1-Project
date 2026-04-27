'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Grid } from './grid';
import { ControlPanel, type DrawMode } from './control-panel';
import { StatsBar } from './stats-bar';
import { CompareModal } from './compare-modal';
import {
  createGrid,
  runAlgorithm,
  type Cell,
  type Algorithm,
  type MovementMode,
  type PathfindingResult
} from '@/lib/pathfinding';

const DEFAULT_GRID_SIZE = 20;
const DEFAULT_START = { row: 5, col: 5 };
const DEFAULT_GOAL = { row: 14, col: 14 };

export function PathfinderVisualizer() {
  // Grid state
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const g = createGrid(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE);
    g[DEFAULT_START.row][DEFAULT_START.col].type = 'start';
    g[DEFAULT_GOAL.row][DEFAULT_GOAL.col].type = 'goal';
    return g;
  });
  
  // Algorithm settings
  const [algorithm, setAlgorithm] = useState<Algorithm>('astar');
  const [movementMode, setMovementMode] = useState<MovementMode>('4-directional');
  const [speed, setSpeed] = useState(50);
  const [depthLimit, setDepthLimit] = useState(50);
  
  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>('wall');
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  // Visualization state
  const [isRunning, setIsRunning] = useState(false);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [pathCells, setPathCells] = useState<Set<string>>(new Set());
  const [exploringCell, setExploringCell] = useState<string | null>(null);
  
  // Player animation state
  const [playerPos, setPlayerPos] = useState({ row: DEFAULT_START.row, col: DEFAULT_START.col });
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [playerFrame, setPlayerFrame] = useState(0);
  const [treasureOpened, setTreasureOpened] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pathLength: 0,
    nodesExplored: 0,
    executionTime: 0
  });
  
  // Compare modal
  const [showCompare, setShowCompare] = useState(false);
  const [compareResults, setCompareResults] = useState<Partial<Record<Algorithm, PathfindingResult>>>({});

  // Animation refs
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Find start and goal cells
  const findSpecialCells = useCallback(() => {
    let start: Cell | null = null;
    let goal: Cell | null = null;
    
    for (const row of grid) {
      for (const cell of row) {
        if (cell.type === 'start') start = cell;
        if (cell.type === 'goal') goal = cell;
      }
    }
    
    return { start, goal };
  }, [grid]);

  // Handle grid size change
  const handleGridSizeChange = useCallback((newSize: number) => {
    setGridSize(newSize);
    const newGrid = createGrid(newSize, newSize);
    
    // Place start and goal proportionally
    const startRow = Math.floor(newSize * 0.25);
    const startCol = Math.floor(newSize * 0.25);
    const goalRow = Math.floor(newSize * 0.75);
    const goalCol = Math.floor(newSize * 0.75);
    
    newGrid[startRow][startCol].type = 'start';
    newGrid[goalRow][goalCol].type = 'goal';
    
    setGrid(newGrid);
    setVisitedCells(new Set());
    setPathCells(new Set());
    setStats({ pathLength: 0, nodesExplored: 0, executionTime: 0 });
    setPlayerPos({ row: startRow, col: startCol });
    setPlayerDirection('down');
    setPlayerFrame(0);
  }, []);

  // Handle cell interactions
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isRunning) return;
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => r.map(c => ({ ...c })));
      const cell = newGrid[row][col];
      
      // Clear visualization
      setVisitedCells(new Set());
      setPathCells(new Set());
      
      switch (drawMode) {
        case 'wall':
          if (cell.type === 'empty') {
            cell.type = 'wall';
          }
          break;
        case 'erase':
          if (cell.type === 'wall' || cell.type === 'visited' || cell.type === 'path') {
            cell.type = 'empty';
          }
          break;
        case 'start':
          // Remove old start
          for (const r of newGrid) {
            for (const c of r) {
              if (c.type === 'start') c.type = 'empty';
            }
          }
          if (cell.type !== 'goal') {
            cell.type = 'start';
            setPlayerPos({ row, col });
            setPlayerDirection('down');
            setPlayerFrame(0);
            setTreasureOpened(false);
          }
          break;
        case 'goal':
          // Remove old goal
          for (const r of newGrid) {
            for (const c of r) {
              if (c.type === 'goal') c.type = 'empty';
            }
          }
          if (cell.type !== 'start') {
            cell.type = 'goal';
          }
          break;
      }
      
      return newGrid;
    });
  }, [drawMode, isRunning]);

  const handleCellDrag = useCallback((row: number, col: number) => {
    if (isRunning) return;
    if (drawMode === 'wall' || drawMode === 'erase') {
      handleCellClick(row, col);
    }
  }, [handleCellClick, drawMode, isRunning]);

  // Cancellation ref
  const cancelRef = useRef(false);

  // Run visualization
  const runVisualization = useCallback(async () => {
    const { start, goal } = findSpecialCells();
    if (!start || !goal) return;
    
    cancelRef.current = false;
    setIsRunning(true);
    setVisitedCells(new Set());
    setPathCells(new Set());
    setExploringCell(null);

    // Reset player to start
    setPlayerPos({ row: start.row, col: start.col });
    setPlayerDirection('down');
    setPlayerFrame(0);
    setTreasureOpened(false);
    
    // Run algorithm
    const result = runAlgorithm(algorithm, grid, start, goal, movementMode, depthLimit);
    
    // Calculate animation delay based on speed (1-100 scale)
    // Speed 1 = 150ms delay, Speed 100 = 1ms delay
    const baseDelay = Math.max(1, 150 - (speed * 1.49));
    
    // Animate visited cells step by step — player bobs in place
    for (let i = 0; i < result.visitedOrder.length; i++) {
      if (cancelRef.current) {
        setIsRunning(false);
        return;
      }
      
      const cell = result.visitedOrder[i];
      const key = `${cell.row},${cell.col}`;
      
      await new Promise<void>(resolve => {
        animationRef.current = setTimeout(() => {
          setExploringCell(key);
          setVisitedCells(prev => new Set([...prev, key]));
          // Toggle run frame every 3 steps → running-in-place animation
          if (i % 3 === 0) setPlayerFrame(f => (f + 1) % 2);
          resolve();
        }, baseDelay);
      });
    }
    
    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }
    
    setExploringCell(null);
    
    // Animate path — player walks along the found path with directional sprites
    const pathDelay = Math.max(30, 80 - (speed * 0.5));
    if (result.path.length > 0) {
      let prevPos = { row: start.row, col: start.col };

      for (let i = 0; i < result.path.length; i++) {
        if (cancelRef.current) {
          setIsRunning(false);
          return;
        }
        
        const cell = result.path[i];
        const key = `${cell.row},${cell.col}`;

        // Calculate movement direction
        const dr = cell.row - prevPos.row;
        const dc = cell.col - prevPos.col;
        let dir: 'up' | 'down' | 'left' | 'right' = 'down';
        if (dr < 0) dir = 'up';
        else if (dr > 0) dir = 'down';
        else if (dc < 0) dir = 'left';
        else if (dc > 0) dir = 'right';

        const newPos = { row: cell.row, col: cell.col };
        
        await new Promise<void>(resolve => {
          animationRef.current = setTimeout(() => {
            setPlayerPos(newPos);
            setPlayerDirection(dir);
            setPlayerFrame(f => (f + 1) % 2);
            setPathCells(prev => new Set([...prev, key]));
            resolve();
          }, pathDelay);
        });

        prevPos = newPos;
      }
    }
    
    // Open the treasure chest when player reaches the goal!
    if (result.path.length > 0) {
      setTreasureOpened(true);
    }

    setStats({
      pathLength: result.pathLength,
      nodesExplored: result.nodesExplored,
      executionTime: result.executionTime
    });
    setCompareResults(prev => ({ ...prev, [algorithm]: result }));
    
    setIsRunning(false);
  }, [algorithm, grid, movementMode, speed, findSpecialCells]);

  // Stop visualization
  const stopVisualization = useCallback(() => {
    cancelRef.current = true;
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsRunning(false);
    setExploringCell(null);
    setPlayerFrame(0);
    setTreasureOpened(false);
  }, []);

  // Open compare modal
  const compareAlgorithms = useCallback(() => {
    setShowCompare(true);
  }, []);

  // Reset grid
  const resetGrid = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    setIsRunning(false);
    handleGridSizeChange(gridSize);
    setCompareResults({});
    setShowCompare(false);
  }, [gridSize, handleGridSizeChange]);

  // Mouse event handlers
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="h-screen w-screen flex overflow-hidden bg-background"
      onMouseDown={() => setIsMouseDown(true)}
    >
      {/* Control Panel */}
      <ControlPanel
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        gridSize={gridSize}
        setGridSize={handleGridSizeChange}
        speed={speed}
        setSpeed={setSpeed}
        movementMode={movementMode}
        setMovementMode={setMovementMode}
        drawMode={drawMode}
        setDrawMode={setDrawMode}
        depthLimit={depthLimit}
        setDepthLimit={setDepthLimit}
        onStart={runVisualization}
        onStop={stopVisualization}
        onCompare={compareAlgorithms}
        onReset={resetGrid}
        isRunning={isRunning}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stats Bar */}
        <StatsBar
          algorithm={algorithm}
          pathLength={stats.pathLength}
          nodesExplored={stats.nodesExplored}
          executionTime={stats.executionTime}
          isRunning={isRunning}
        />
        
        {/* Grid */}
        <div className="flex-1 min-h-0">
          <Grid
            grid={grid}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            isMouseDown={isMouseDown}
            visitedCells={visitedCells}
            pathCells={pathCells}
            exploringCell={exploringCell}
            playerPos={playerPos}
            playerDirection={playerDirection}
            playerFrame={playerFrame}
            treasureOpened={treasureOpened}
          />
        </div>
      </div>
      
      {/* Compare Modal */}
      <CompareModal
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        results={compareResults}
      />
    </div>
  );
}
