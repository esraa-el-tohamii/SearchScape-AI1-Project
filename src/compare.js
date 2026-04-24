import { CELL_TYPES } from './grid.js';
import { runBFS } from './algorithms/bfs.js';
import { runDFS } from './algorithms/dfs.js';
import { runUCS } from './algorithms/ucs.js';
import { runAStar } from './algorithms/astar.js';
import { runDLS } from './algorithms/dls.js';
import { runIDS } from './algorithms/ids.js';
import { runBidirectional } from './algorithms/bidirectional.js';
import { runGreedy } from './algorithms/greedy.js';
import { manhattan, euclidean } from './heuristics.js';

const ALGORITHMS = [
    { id: 'bfs', name: 'Breadth-First Search', run: runBFS, colorClass: 'card-blue' },
    { id: 'dfs', name: 'Depth-First Search', run: runDFS, colorClass: 'card-pink' },
    { id: 'ucs', name: "Dijkstra's Algorithm (UCS)", run: runUCS, colorClass: 'card-teal' },
    { id: 'astar', name: 'A* Algorithm', run: (g, s, t) => runAStar(g, s, t, manhattan), colorClass: 'card-green' },
    { id: 'greedy', name: 'Greedy Best-First', run: (g, s, t) => runGreedy(g, s, t, manhattan), colorClass: 'card-purple' },
    { id: 'dls', name: 'Depth-Limited Search', run: (g, s, t) => runDLS(g, s, t, 30), colorClass: 'card-orange' },
    { id: 'ids', name: 'Iterative Deepening', run: runIDS, colorClass: 'card-indigo' },
    { id: 'bidirectional', name: 'Bidirectional Search', run: runBidirectional, colorClass: 'card-cyan' }
];

export async function runComparison(grid) {
    const compareContainer = document.getElementById('compare-grid');
    compareContainer.innerHTML = ''; // clear

    if (!grid.startPos || !grid.goalPos) {
        alert("Please set a Start and Goal position before comparing.");
        return;
    }

    const results = [];

    // Run all algorithms instantly to gather metrics
    for (const algo of ALGORITHMS) {
        const startTime = performance.now();
        // Deep clone grid state for each algorithm to prevent mutation
        const gridClone = cloneGrid(grid);
        const res = algo.run(gridClone, gridClone.startPos, gridClone.goalPos);
        const endTime = performance.now();
        
        if (res) {
            results.push({
                ...algo,
                pathLength: res.path ? Math.max(0, res.path.length - 1) : 0,
                nodesExplored: res.visitedOrder.length,
                time: parseFloat((endTime - startTime).toFixed(2)),
                path: res.path,
                visitedOrder: res.visitedOrder
            });
        }
    }

    if (results.length === 0) return;

    // Find bests
    const minPath = Math.min(...results.filter(r => r.pathLength > 0).map(r => r.pathLength));
    const minNodes = Math.min(...results.map(r => r.nodesExplored));
    const minTime = Math.min(...results.map(r => r.time));

    // Render cards
    for (const res of results) {
        const isBestPath = res.pathLength > 0 && res.pathLength === minPath;
        const isBestNodes = res.nodesExplored === minNodes;
        const isBestTime = res.time === minTime;
        
        const isOverallWinner = isBestPath && isBestTime; // Simple heuristic for trophy

        const card = document.createElement('div');
        card.className = `compare-card ${res.colorClass} ${isOverallWinner ? 'winner' : ''}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${res.name}</h3>
                ${isOverallWinner ? '<div class="trophy-icon">🏆</div>' : ''}
            </div>

            <div class="card-metrics">
                <div class="c-metric">
                    <span class="c-icon">🛣️</span>
                    <span>Path:</span>
                    <span class="c-val">${res.pathLength} ${isBestPath ? '<span class="star">★</span>' : ''}</span>
                </div>
                <div class="c-metric">
                    <span class="c-icon">🔍</span>
                    <span>Explored:</span>
                    <span class="c-val">${res.nodesExplored} ${isBestNodes ? '<span class="star">★</span>' : ''}</span>
                </div>
                <div class="c-metric">
                    <span class="c-icon">⏱️</span>
                    <span>Time:</span>
                    <span class="c-val">${res.time.toFixed(2)}ms ${isBestTime ? '<span class="star">★</span>' : ''}</span>
                </div>
            </div>
            
            <div class="mini-sim-container">
                <canvas id="mini-canvas-${res.id}" class="mini-canvas"></canvas>
            </div>
        `;
        compareContainer.appendChild(card);
        
        // Draw Mini Simulation
        drawMiniSimulation(`mini-canvas-${res.id}`, grid, res.visitedOrder, res.path);
    }
}

// Deep clone of grid object specifically for algorithmic evaluation
function cloneGrid(grid) {
    const cloned = {
        width: grid.width,
        height: grid.height,
        cells: grid.cells.map(row => [...row]),
        startPos: grid.startPos ? { ...grid.startPos } : null,
        goalPos: grid.goalPos ? { ...grid.goalPos } : null,
        movementMode: grid.movementMode
    };

    cloned.getNeighbors = function (x, y) {
        const neighbors = [];
        const dirs4 = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        const dirs8 = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];
        const dirs = this.movementMode === 8 ? [...dirs4, ...dirs8] : dirs4;

        for (const { dx, dy } of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                const ct = this.cells[ny][nx];
                if (ct !== CELL_TYPES.OBSTACLE) {
                    const isDiag = dx !== 0 && dy !== 0;
                    const base = isDiag ? 1.414 : 1;
                    const cost = ct === CELL_TYPES.WEIGHT ? base * 5 : base;
                    neighbors.push({ x: nx, y: ny, cost });
                }
            }
        }
        return neighbors;
    };

    return cloned;
}

// Draw static miniature representation of the result
function drawMiniSimulation(canvasId, grid, visited, path) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cw = canvas.parentElement.clientWidth;
    const ch = 100; // Fixed height for mini canvas
    
    canvas.width = cw;
    canvas.height = ch;
    
    const cellW = cw / grid.width;
    const cellH = ch / grid.height;
    
    ctx.clearRect(0, 0, cw, ch);
    
    // Draw grid
    for(let y=0; y<grid.height; y++) {
        for(let x=0; x<grid.width; x++) {
            const ct = grid.cells[y][x];
            if(ct === CELL_TYPES.OBSTACLE) {
                ctx.fillStyle = '#2d9a47'; // tree green
                ctx.fillRect(x*cellW, y*cellH, cellW, cellH);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(x*cellW, y*cellH, cellW, cellH);
            }
        }
    }
    
    // Draw Visited
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    if (visited) {
        for(const v of visited) {
            ctx.fillRect(v.x*cellW, v.y*cellH, cellW, cellH);
        }
    }
    
    // Draw Path
    if (path) {
        ctx.beginPath();
        for(let i=0; i<path.length; i++) {
            const p = path[i];
            const cx = p.x * cellW + cellW/2;
            const cy = p.y * cellH + cellH/2;
            if(i===0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = '#FFD700'; // Gold
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw Start & Goal
    if (grid.startPos) {
        ctx.fillStyle = '#4facfe'; // start blue
        ctx.beginPath();
        ctx.arc(grid.startPos.x*cellW + cellW/2, grid.startPos.y*cellH + cellH/2, Math.min(cellW, cellH)*0.4, 0, Math.PI*2);
        ctx.fill();
    }
    if (grid.goalPos) {
        ctx.fillStyle = '#FFD700'; // goal gold
        ctx.beginPath();
        ctx.arc(grid.goalPos.x*cellW + cellW/2, grid.goalPos.y*cellH + cellH/2, Math.min(cellW, cellH)*0.4, 0, Math.PI*2);
        ctx.fill();
    }
}
