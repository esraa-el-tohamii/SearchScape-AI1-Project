'use client';

import { memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Cell } from '@/lib/pathfinding';

interface GridProps {
  grid: Cell[][];
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  isMouseDown: boolean;
  visitedCells: Set<string>;
  pathCells: Set<string>;
  exploringCell: string | null;
  playerPos: { row: number; col: number };
  playerDirection: 'up' | 'down' | 'left' | 'right';
  playerFrame: number;
  treasureOpened: boolean;
}

// Directional sprite map
function getPlayerSprite(direction: string, frame: number): string {
  if (frame === 0) {
    switch (direction) {
      case 'up':    return '/boy_back.png';
      case 'left':  return '/boy_leftSide.png';
      case 'right': return '/boy_rightSide.png';
      default:      return '/boy_front.png';
    }
  } else {
    switch (direction) {
      case 'up':    return '/boy_back_atilt.png';
      case 'left':  return '/boy_leftSide.png';
      case 'right': return '/boy_rightSide.png';
      default:      return '/boy_front_atilt.png';
    }
  }
}

const TREE_IMAGES = ['/tree1.png', '/tree2.png', '/tree3.png', '/tree4.png'];

// Returns the tile image + optional CSS transform for a cell based on its grid position
function getCellTile(row: number, col: number, rows: number, cols: number): { src: string; transform?: string } {
  const isTop = row === 0;
  const isBottom = row === rows - 1;
  const isLeft = col === 0;
  const isRight = col === cols - 1;

  // Four corners
  if (isTop && isLeft)     return { src: '/top_left.jpg' };
  if (isTop && isRight)    return { src: '/top_right.jpg' };
  if (isBottom && isRight)  return { src: '/right_bottom.jpg' };
  if (isBottom && isLeft)   return { src: '/right_bottom.jpg', transform: 'scaleX(-1)' };

  // Four edges
  if (isTop)    return { src: '/left_right.jpg', transform: 'rotate(90deg)' };
  if (isBottom) return { src: '/left_right.jpg', transform: 'rotate(-90deg)' };
  if (isLeft)   return { src: '/left_right.jpg' };
  if (isRight)  return { src: '/left_right.jpg', transform: 'scaleX(-1)' };

  // Interior
  return { src: '/center.jpg' };
}

const GridCell = memo(function GridCell({
  cell,
  onClick,
  onMouseEnter,
  isVisited,
  isPath,
  isExploring,
  visitDelay,
  pathDelay,
  treeImageIndex,
  isPlayerHere,
  playerDirection,
  playerFrame,
  treasureOpened,
  tileSrc,
  tileTransform,
}: {
  cell: Cell;
  onClick: () => void;
  onMouseEnter: () => void;
  isVisited: boolean;
  isPath: boolean;
  isExploring: boolean;
  visitDelay: number;
  pathDelay: number;
  treeImageIndex: number;
  isPlayerHere: boolean;
  playerDirection: 'up' | 'down' | 'left' | 'right';
  playerFrame: number;
  treasureOpened: boolean;
  tileSrc: string;
  tileTransform?: string;
}) {
  return (
    <div
      className="grid-cell w-full h-full relative overflow-hidden transition-all duration-150 hover:brightness-110"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        backgroundImage: `url(${tileSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: tileTransform || 'none',
      }}
    >
      {/* Layer 1: State overlay (visited / path / exploring) */}
      {isPath && (
        <div
          className="absolute inset-0 z-1 animate-path-trace"
          style={{
            background: 'rgba(34, 211, 238, 0.45)',
            boxShadow: '0 0 15px #22d3ee, 0 0 30px #22d3ee, inset 0 0 10px rgba(34,211,238,0.3)',
            animationDelay: pathDelay > 0 ? `${pathDelay}ms` : undefined,
          }}
        />
      )}
      {isExploring && !isPath && (
        <div
          className="absolute inset-0 z-1"
          style={{
            background: 'rgba(34, 211, 238, 0.5)',
            boxShadow: '0 0 20px #22d3ee',
            transform: 'scale(1.05)',
          }}
        />
      )}
      {isVisited && !isPath && !isExploring && (
        <div
          className="absolute inset-0 z-1 animate-wave-expand"
          style={{
            background: 'rgba(168, 85, 247, 0.35)',
            boxShadow: '0 0 8px #a855f7',
            animationDelay: visitDelay > 0 ? `${visitDelay}ms` : undefined,
          }}
        />
      )}

      {/* Layer 2: Content — player, treasure, trees */}
      {/* Player sprite — directional, follows playerPos */}
      {isPlayerHere && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="relative w-full h-full">
            <Image
              src={getPlayerSprite(playerDirection, playerFrame)}
              alt="Player"
              fill
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 8px #22c55e) drop-shadow(0 0 16px #22c55e)' }}
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-neon-green/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
      )}
      {/* Start marker — subtle green ring when player has moved away */}
      {cell.type === 'start' && !isPlayerHere && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-3/5 h-3/5 rounded-full border-2 border-neon-green/50 shadow-[0_0_10px_#22c55e]" />
        </div>
      )}
      {/* Treasure Image (Goal) */}
      {cell.type === 'goal' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-full h-full">
            <Image
              src={treasureOpened ? '/treasure_opened.png' : '/treasure_closed.png'}
              alt="Treasure"
              fill
              className={cn('object-contain transition-all duration-500', treasureOpened && 'scale-110')}
              style={{ filter: treasureOpened
                ? 'drop-shadow(0 0 14px #fde047) drop-shadow(0 0 28px #facc15) drop-shadow(0 0 42px #f59e0b)'
                : 'drop-shadow(0 0 10px #facc15) drop-shadow(0 0 20px #f59e0b)'
              }}
            />
          </div>
          {/* Golden sparkle ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4/5 h-4/5 border-2 border-amber-400/60 rounded-lg animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      )}
      {/* Tree Image (Wall) */}
      {cell.type === 'wall' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-full h-full">
            <Image
              src={TREE_IMAGES[treeImageIndex]}
              alt="Tree"
              fill
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export function Grid({
  grid,
  onCellClick,
  onCellDrag,
  isMouseDown,
  visitedCells,
  pathCells,
  exploringCell,
  playerPos,
  playerDirection,
  playerFrame,
  treasureOpened,
}: GridProps) {
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isMouseDown) {
      onCellDrag(row, col);
    }
  }, [isMouseDown, onCellDrag]);

  // Calculate animation delays
  const visitedArray = Array.from(visitedCells);
  const pathArray = Array.from(pathCells);

  // Pre-compute stable random tree indices for wall cells
  const treeIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    grid.forEach((row, ri) => row.forEach((cell, ci) => {
      if (cell.type === 'wall') {
        indices[`${ri},${ci}`] = (ri * 31 + ci * 17) % 4;
      }
    }));
    return indices;
  }, [grid]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Scan line effect overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div 
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
          style={{
            animation: 'scan-line 4s linear infinite'
          }}
        />
      </div>
      
      {/* Grid container — each cell has its own tile background */}
      <div 
        className="grid gap-0 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 1}, 1fr)`,
          gridTemplateRows: `repeat(${grid.length || 1}, 1fr)`,
          aspectRatio: '1',
          width: 'min(calc(100vw - 320px - 48px), calc(100vh - 80px - 48px))',
          height: 'min(calc(100vw - 320px - 48px), calc(100vh - 80px - 48px))',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isVisited = visitedCells.has(key);
            const isPath = pathCells.has(key);
            const isExploring = exploringCell === key;
            
            const visitIndex = visitedArray.indexOf(key);
            const pathIndex = pathArray.indexOf(key);
            
            const totalRows = grid.length;
            const totalCols = grid[0]?.length || 1;
            const tile = getCellTile(rowIndex, colIndex, totalRows, totalCols);

            return (
              <GridCell
                key={key}
                cell={cell}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                isVisited={isVisited}
                isPath={isPath}
                isExploring={isExploring}
                visitDelay={visitIndex >= 0 ? visitIndex * 20 : 0}
                pathDelay={pathIndex >= 0 ? pathIndex * 50 : 0}
                treeImageIndex={treeIndices[key] ?? 0}
                isPlayerHere={playerPos.row === rowIndex && playerPos.col === colIndex}
                playerDirection={playerDirection}
                playerFrame={playerFrame}
                treasureOpened={treasureOpened}
                tileSrc={tile.src}
                tileTransform={tile.transform}
              />
            );
          })
        )}
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-neon-blue/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-blue/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-neon-blue/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-neon-blue/50" />
    </div>
  );
}
