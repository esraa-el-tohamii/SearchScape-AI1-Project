'use client';

import { X, Trophy, Route, Layers, Clock, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Algorithm, PathfindingResult } from '@/lib/pathfinding';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Partial<Record<Algorithm, PathfindingResult>>;
}

const algorithmNames: Record<Algorithm, string> = {
  bfs: 'BFS',
  dfs: 'DFS',
  ucs: 'UCS',
  dls: 'DLS',
  ids: 'IDS',
  bidirectional: 'Bi-Dir',
  greedy: 'Greedy',
  astar: 'A*'
};

const algorithmColors: Record<Algorithm, { bg: string; text: string; border: string; glow: string }> = {
  bfs: {
    bg: 'bg-neon-blue/20',
    text: 'text-neon-blue',
    border: 'border-neon-blue',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]'
  },
  dfs: {
    bg: 'bg-neon-purple/20',
    text: 'text-neon-purple',
    border: 'border-neon-purple',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
  },
  ucs: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
  },
  dls: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]'
  },
  ids: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]'
  },
  bidirectional: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-400',
    border: 'border-pink-500',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]'
  },
  greedy: {
    bg: 'bg-lime-500/20',
    text: 'text-lime-400',
    border: 'border-lime-500',
    glow: 'shadow-[0_0_20px_rgba(132,204,22,0.4)]'
  },
  astar: {
    bg: 'bg-neon-green/20',
    text: 'text-neon-green',
    border: 'border-neon-green',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]'
  }
};

export function CompareModal({ isOpen, onClose, results }: CompareModalProps) {
  if (!isOpen) return null;

  const filteredResults = Object.entries(results).filter(
    ([, result]) => result !== undefined
  ) as [Algorithm, PathfindingResult][];

  const getBestAlgorithm = (metric: 'pathLength' | 'nodesExplored' | 'executionTime') => {
    if (filteredResults.length === 0) return null;
    
    if (metric === 'pathLength') {
      return filteredResults.reduce((best, current) =>
        current[1].pathLength < best[1].pathLength ? current : best
      )[0];
    }
    
    return filteredResults.reduce((best, current) =>
      current[1][metric] < best[1][metric] ? current : best
    )[0];
  };

  const bestPath = getBestAlgorithm('pathLength');
  const bestExplored = getBestAlgorithm('nodesExplored');
  const bestTime = getBestAlgorithm('executionTime');

  // Calculate efficiency (path length / nodes explored ratio)
  const getEfficiency = (result: PathfindingResult) => {
    if (result.nodesExplored === 0) return 0;
    return (result.pathLength / result.nodesExplored) * 100;
  };

  const getBestEfficiency = () => {
    if (filteredResults.length === 0) return null;
    return filteredResults.reduce((best, current) =>
      getEfficiency(current[1]) > getEfficiency(best[1]) ? current : best
    )[0];
  };

  const bestEfficiency = getBestEfficiency();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-panel rounded-2xl p-6 max-w-5xl w-full mx-4 border border-neon-blue/30 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              <span className="text-neon-blue">Algorithm</span>{' '}
              <span className="text-neon-cyan">Comparison</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Performance metrics across all algorithms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Results Grid */}
        {filteredResults.length === 0 ? (
          <div className="w-full h-[60vh] flex items-center justify-center text-muted-foreground text-lg">
            No algorithms have been run yet
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
          {filteredResults.map(([algo, result]) => {
            const colors = algorithmColors[algo];
            const isWinner = bestPath === algo || bestExplored === algo || bestTime === algo;
            
            return (
              <div
                key={algo}
                className={cn(
                  'rounded-xl p-4 border transition-all',
                  colors.bg,
                  colors.border,
                  isWinner && colors.glow
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn('font-bold text-lg', colors.text)}>
                    {algorithmNames[algo]}
                  </h3>
                  {isWinner && (
                    <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                  )}
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Route className={cn('w-4 h-4', colors.text)} />
                      <span className="text-sm text-muted-foreground">Path:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        bestPath === algo ? 'text-neon-green' : colors.text
                      )}>
                        {result.pathLength}
                        {bestPath === algo && <span className="text-xs ml-1">★</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className={cn('w-4 h-4', colors.text)} />
                      <span className="text-sm text-muted-foreground">Explored:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        bestExplored === algo ? 'text-neon-green' : colors.text
                      )}>
                        {result.nodesExplored}
                        {bestExplored === algo && <span className="text-xs ml-1">★</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={cn('w-4 h-4', colors.text)} />
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        bestTime === algo ? 'text-neon-green' : colors.text
                      )}>
                        {result.executionTime.toFixed(2)}ms
                        {bestTime === algo && <span className="text-xs ml-1">★</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className={cn('w-4 h-4', colors.text)} />
                      <span className="text-sm text-muted-foreground">Efficiency:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        bestEfficiency === algo ? 'text-neon-green' : colors.text
                      )}>
                        {getEfficiency(result).toFixed(1)}%
                        {bestEfficiency === algo && <span className="text-xs ml-1">★</span>}
                      </span>
                    </div>
                    {/* Progress bar showing efficiency visually */}
                    <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all duration-500', 
                          algo === 'bfs' && 'bg-neon-blue',
                          algo === 'dfs' && 'bg-neon-purple',
                          algo === 'ucs' && 'bg-amber-500',
                          algo === 'dls' && 'bg-rose-500',
                          algo === 'ids' && 'bg-orange-500',
                          algo === 'bidirectional' && 'bg-pink-500',
                          algo === 'greedy' && 'bg-lime-500',
                          algo === 'astar' && 'bg-neon-green'
                        )}
                        style={{ width: `${Math.min(getEfficiency(result), 100)}%` }}
                      />
                    </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Winner in category</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-neon-green">★</span>
            <span>Best score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
