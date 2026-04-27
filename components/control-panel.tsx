'use client';

import { Play, Square, RotateCcw, GitCompare, Pencil, Eraser, MapPin, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Algorithm, MovementMode } from '@/lib/pathfinding';

export type DrawMode = 'wall' | 'erase' | 'start' | 'goal';

interface ControlPanelProps {
  algorithm: Algorithm;
  setAlgorithm: (algo: Algorithm) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  movementMode: MovementMode;
  setMovementMode: (mode: MovementMode) => void;
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
  depthLimit: number;
  setDepthLimit: (limit: number) => void;
  onStart: () => void;
  onStop: () => void;
  onCompare: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const uninformedAlgorithms: { value: Algorithm; label: string; description: string }[] = [
  { value: 'bfs', label: 'BFS', description: 'Breadth-First Search' },
  { value: 'dfs', label: 'DFS', description: 'Depth-First Search' },
  { value: 'ucs', label: 'UCS', description: 'Uniform Cost Search' },
  { value: 'dls', label: 'DLS', description: 'Depth-Limited Search' },
  { value: 'ids', label: 'IDS', description: 'Iterative Deepening' },
  { value: 'bidirectional', label: 'Bi-Dir', description: 'Bidirectional Search' }
];

const informedAlgorithms: { value: Algorithm; label: string; description: string }[] = [
  { value: 'greedy', label: 'Greedy', description: 'Greedy Best-First' },
  { value: 'astar', label: 'A*', description: 'A-Star Algorithm' }
];

const allAlgorithms = [...uninformedAlgorithms, ...informedAlgorithms];

const drawTools: { value: DrawMode; label: string; icon: typeof Pencil }[] = [
  { value: 'wall', label: 'Draw Walls', icon: Pencil },
  { value: 'erase', label: 'Erase', icon: Eraser },
  { value: 'start', label: 'Set Start', icon: MapPin },
  { value: 'goal', label: 'Set Goal', icon: Target }
];

export function ControlPanel({
  algorithm,
  setAlgorithm,
  gridSize,
  setGridSize,
  speed,
  setSpeed,
  movementMode,
  setMovementMode,
  drawMode,
  setDrawMode,
  depthLimit,
  setDepthLimit,
  onStart,
  onStop,
  onCompare,
  onReset,
  isRunning
}: ControlPanelProps) {
  const showDepthLimit = algorithm === 'dls' || algorithm === 'ids';
  return (
    <div className="w-72 h-full glass-panel p-4 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground tracking-wider">
          <span className="text-neon-blue">PATH</span>
          <span className="text-neon-cyan">FINDER</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">AI Simulation Engine</p>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Uninformed Search
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {uninformedAlgorithms.map((algo) => (
            <button
              key={algo.value}
              onClick={() => setAlgorithm(algo.value)}
              disabled={isRunning}
              className={cn(
                'neon-button px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                'border border-border/50',
                algorithm === algo.value
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-neon-blue/50',
                isRunning && 'opacity-50 cursor-not-allowed'
              )}
            >
              {algo.label}
            </button>
          ))}
        </div>
        
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider pt-2 block">
          Informed Search
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {informedAlgorithms.map((algo) => (
            <button
              key={algo.value}
              onClick={() => setAlgorithm(algo.value)}
              disabled={isRunning}
              className={cn(
                'neon-button px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                'border border-border/50',
                algorithm === algo.value
                  ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-neon-green/50',
                isRunning && 'opacity-50 cursor-not-allowed'
              )}
            >
              {algo.label}
            </button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {allAlgorithms.find(a => a.value === algorithm)?.description}
        </p>
      </div>
      
      {/* Depth Limit Input - Only shown for DLS/IDS */}
      {showDepthLimit && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Depth Limit
            </label>
            <span className="text-sm text-neon-cyan font-mono">{depthLimit}</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={depthLimit}
            onChange={(e) => setDepthLimit(parseInt(e.target.value))}
            disabled={isRunning}
            className={cn(
              'w-full h-2 rounded-lg appearance-none cursor-pointer',
              'bg-secondary accent-neon-cyan',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan',
              '[&::-webkit-slider-thumb]:shadow-[0_0_10px_#22d3ee]',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>
      )}

      {/* Grid Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Grid Size
          </label>
          <span className="text-sm text-neon-cyan font-mono">{gridSize}x{gridSize}</span>
        </div>
        <input
          type="range"
          min="10"
          max="40"
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          disabled={isRunning}
          className={cn(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-secondary accent-neon-blue',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_#3b82f6]',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            isRunning && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      {/* Speed Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Speed
          </label>
          <span className="text-sm text-neon-cyan font-mono">
            {speed < 33 ? 'Slow' : speed < 66 ? 'Medium' : 'Fast'}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          disabled={isRunning}
          className={cn(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-secondary accent-neon-purple',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-purple',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_#a855f7]',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            isRunning && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      {/* Movement Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Movement
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMovementMode('4-directional')}
            disabled={isRunning}
            className={cn(
              'neon-button px-3 py-2 rounded-xl text-xs font-medium transition-all',
              'border border-border/50',
              movementMode === '4-directional'
                ? 'bg-neon-purple/20 text-neon-purple border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-neon-purple/50',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            4-Direction
          </button>
          <button
            onClick={() => setMovementMode('8-directional')}
            disabled={isRunning}
            className={cn(
              'neon-button px-3 py-2 rounded-xl text-xs font-medium transition-all',
              'border border-border/50',
              movementMode === '8-directional'
                ? 'bg-neon-purple/20 text-neon-purple border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-neon-purple/50',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            8-Direction
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {isRunning ? (
          <button
            onClick={onStop}
            className={cn(
              'neon-button w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider',
              'flex items-center justify-center gap-2',
              'bg-neon-pink/20 text-neon-pink border-2 border-neon-pink',
              'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
              'hover:bg-neon-pink/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]',
              'animate-pulse'
            )}
          >
            <Square className="w-4 h-4" />
            Stop Simulation
          </button>
        ) : (
          <button
            onClick={onStart}
            className={cn(
              'neon-button w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider',
              'flex items-center justify-center gap-2',
              'bg-neon-blue/20 text-neon-blue border-2 border-neon-blue',
              'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
              'hover:bg-neon-blue/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]'
            )}
          >
            <Play className="w-4 h-4" />
            Start Simulation
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCompare}
            disabled={isRunning}
            className={cn(
              'neon-button py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider',
              'flex items-center justify-center gap-1.5',
              'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan',
              'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
              'hover:bg-neon-cyan/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare
          </button>
          <button
            onClick={onReset}
            disabled={isRunning}
            className={cn(
              'neon-button py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider',
              'flex items-center justify-center gap-1.5',
              'bg-neon-pink/20 text-neon-pink border border-neon-pink',
              'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
              'hover:bg-neon-pink/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
              isRunning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Draw Tools */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Draw Tools
        </label>
        <div className="grid grid-cols-2 gap-2">
          {drawTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.value}
                onClick={() => setDrawMode(tool.value)}
                disabled={isRunning}
                className={cn(
                  'neon-button px-2 py-2 rounded-xl text-xs font-medium transition-all',
                  'flex items-center justify-center gap-1.5',
                  'border border-border/50',
                  drawMode === tool.value
                    ? tool.value === 'start'
                      ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : tool.value === 'goal'
                        ? 'bg-neon-pink/20 text-neon-pink border-neon-pink shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50',
                  isRunning && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
