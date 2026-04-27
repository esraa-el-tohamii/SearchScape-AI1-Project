'use client';

import { Route, Layers, Clock, Compass, Brain, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Algorithm } from '@/lib/pathfinding';

const algorithmLabels: Record<Algorithm, string> = {
  bfs: 'BFS',
  dfs: 'DFS',
  ucs: 'UCS',
  dls: 'DLS',
  ids: 'IDS',
  bidirectional: 'Bi-Dir',
  greedy: 'Greedy',
  astar: 'A*'
};

interface StatsBarProps {
  algorithm: Algorithm;
  pathLength: number;
  nodesExplored: number;
  executionTime: number;
  isRunning: boolean;
}

interface StatCardProps {
  icon: typeof Route;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'cyan' | 'green';
  isActive?: boolean;
}

const colorClasses = {
  blue: {
    icon: 'text-neon-blue',
    border: 'border-neon-blue/30',
    shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]'
  },
  purple: {
    icon: 'text-neon-purple',
    border: 'border-neon-purple/30',
    shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
  },
  cyan: {
    icon: 'text-neon-cyan',
    border: 'border-neon-cyan/30',
    shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]'
  },
  green: {
    icon: 'text-neon-green',
    border: 'border-neon-green/30',
    shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]'
  }
};

function StatCard({ icon: Icon, label, value, color, isActive }: StatCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div
      className={cn(
        'glass-panel px-4 py-3 rounded-xl flex items-center gap-3',
        'border transition-all duration-300',
        colors.border,
        isActive ? colors.glow : colors.shadow
      )}
    >
      <div className={cn('p-2 rounded-lg bg-secondary/50', isActive && 'animate-pulse')}>
        <Icon className={cn('w-5 h-5', colors.icon)} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className={cn(
          'text-lg font-bold font-mono',
          colors.icon
        )}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function StatsBar({
  algorithm,
  pathLength,
  nodesExplored,
  executionTime,
  isRunning
}: StatsBarProps) {
  const isCompleted = pathLength > 0 && !isRunning;
  
  return (
    <div className="h-20 glass-panel flex items-center justify-between px-6 border-b border-neon-blue/20">
      {/* Left section - Logo/Title */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue/30 to-neon-cyan/20 flex items-center justify-center',
            'border border-neon-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
            isRunning && 'animate-pulse'
          )}>
            <Compass className={cn(
              'w-6 h-6 text-neon-cyan',
              isRunning && 'animate-spin'
            )} style={{ animationDuration: '3s' }} />
          </div>
          {isRunning && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_#22c55e]" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider">
            <span className="text-neon-blue">Search</span>
            <span className="text-neon-cyan">Scape</span>
          </h1>
          <p className="text-xs text-muted-foreground tracking-wide">
            AI Search Visualizer
          </p>
        </div>
      </div>

      {/* Center section - Stats */}
      <div className="flex items-center gap-3">
        <StatCard
          icon={Brain}
          label="Algorithm"
          value={algorithmLabels[algorithm]}
          color="green"
          isActive={isRunning}
        />
        <StatCard
          icon={Route}
          label="Path Length"
          value={pathLength || '—'}
          color="cyan"
          isActive={pathLength > 0}
        />
        <StatCard
          icon={Layers}
          label="Nodes Explored"
          value={nodesExplored || '—'}
          color="purple"
          isActive={nodesExplored > 0}
        />
        <StatCard
          icon={Clock}
          label="Time"
          value={executionTime > 0 ? `${executionTime.toFixed(2)}ms` : '—'}
          color="blue"
          isActive={executionTime > 0}
        />
      </div>

      {/* Right section - Status */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'px-4 py-2 rounded-xl flex items-center gap-2 border',
          isRunning 
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : isCompleted
              ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
              : 'bg-secondary/50 border-border/50 text-muted-foreground'
        )}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <div className={cn(
              'w-2 h-2 rounded-full',
              isRunning ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground'
            )} />
          )}
          <span className="text-sm font-medium uppercase tracking-wider">
            {isRunning ? 'Searching...' : isCompleted ? 'Completed' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
