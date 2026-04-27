import { visualizeVisited, visualizePath, visualizeBacktrack, visualizeMeeting } from './visualization.js';
import { updateMetrics } from './metrics.js';
import { CharacterController } from './character.js';
import { audioEngine } from './audio.js';

/**
 * Simple cancellation token — call .cancel() to abort an active simulation.
 */
export class CancellationToken {
    constructor() {
        this.cancelled = false;
        this._pauseResolve = null;
        this.paused = false;
    }
    cancel() {
        this.cancelled = true;
        if (this._pauseResolve) this._pauseResolve();
    }
    pause()  { this.paused = true; }
    resume() {
        this.paused = false;
        if (this._pauseResolve) {
            this._pauseResolve();
            this._pauseResolve = null;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitIfPaused(token) {
    if (!token) return;
    while (token.paused && !token.cancelled) {
        await new Promise(resolve => {
            token._pauseResolve = resolve;
        });
        token._pauseResolve = null;
        if (token.stepMode && !token.cancelled) {
            token.paused = true;
            break;
        }
    }
}

function getDelay() {
    const slider = document.getElementById('speed-slider');
    const val = slider ? parseInt(slider.value) : 50;
    // 1 → 300ms (slowest),  100 → 20ms (fastest)
    return Math.round(300 - (val - 1) * (280 / 99));
}

/**
 * Run the full simulation with a walking character.
 * @param {Grid}   grid
 * @param {{x,y}}  startNode
 * @param {{x,y}}  goalNode
 * @param {Function} algorithmFunction
 * @param {string}   algoName
 * @param {string}   panelPrefix
 * @param {CancellationToken|null} token
 */
export async function runSimulation(
    grid, startNode, goalNode, algorithmFunction,
    algoName, panelPrefix, token = null
) {
    grid.clearPaths();

    // ── Run algorithm synchronously ──────────────────────────────────────
    const startTime = performance.now();
    const result = algorithmFunction(grid, startNode, goalNode);
    const endTime = performance.now();
    const execMs = endTime - startTime;

    if (!result) return null;
    const { visitedOrder, path, meetingNode } = result;

    // ── Set up character ──────────────────────────────────────────────────
    // Find or create the character overlay container (the grid's parent wrapper)
    const gridWrapper = document.getElementById('grid-arena') || grid.container;
    const char = new CharacterController(grid.container, grid);
    char.place(startNode.x, startNode.y);

    audioEngine.playStart();
    await sleep(350);

    const isCancelled = () => token && token.cancelled;

    // ── Phase 1: Exploration walk ─────────────────────────────────────────
    const isDFSBehavior = ['dfs', 'dls', 'ids'].includes(algoName);
    let prevNode = startNode;

    for (const node of visitedOrder) {
        if (isCancelled()) { char.hide(); return null; }
        await waitIfPaused(token);

        if (node.x === startNode.x && node.y === startNode.y) {
            prevNode = node;
            continue;
        }

        const delay = getDelay();

        // DFS backtrack detection
        if (isDFSBehavior && prevNode) {
            const dist = Math.abs(node.x - prevNode.x) + Math.abs(node.y - prevNode.y);
            if (dist > 1) {
                visualizeBacktrack(grid, prevNode);
            }
        }

        // Mark previous cell as breadcrumb/visited BEFORE moving
        if (prevNode.x !== startNode.x || prevNode.y !== startNode.y) {
            visualizeVisited(grid, prevNode);
        }

        if (node.x === goalNode.x && node.y === goalNode.y) {
            await char.moveTo(node.x, node.y, Math.max(delay, 120));
            break;
        }

        await char.moveTo(node.x, node.y, Math.max(delay, 80));
        if (isCancelled()) { char.hide(); return null; }

        prevNode = node;
    }

    if (isCancelled()) { char.hide(); return null; }

    // Bidirectional meeting node
    if (meetingNode) {
        visualizeMeeting(grid, meetingNode);
        await sleep(getDelay() * 3);
        if (isCancelled()) { char.hide(); return null; }
    }

    // ── Phase 2: Walk optimal path with glow ─────────────────────────────
    if (path && path.length > 0) {
        // Return to start for path walk (teleport silently)
        char.place(startNode.x, startNode.y);
        await sleep(200);

        for (const node of path) {
            if (isCancelled()) { char.hide(); return null; }
            await waitIfPaused(token);

            if (node.x === startNode.x && node.y === startNode.y) continue;

            if (node.x !== goalNode.x || node.y !== goalNode.y) {
                visualizePath(grid, node);
                // Add glow class
                const cell = grid.domElements[node.y]?.[node.x];
                if (cell) cell.classList.add('path-glow');
            }

            const delay = getDelay();
            await char.moveTo(node.x, node.y, Math.max(delay, 100));
        }
    }

    if (isCancelled()) { char.hide(); return null; }

    // ── Phase 3: Celebrate! ───────────────────────────────────────────────
    char.celebrate();
    audioEngine.playGoal();

    // Fire particle burst at goal cell
    const goalCellPx = char._cellPx(goalNode.x, goalNode.y);
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas && goalCellPx && window.__particleSystem) {
        const canvasRect = particleCanvas.getBoundingClientRect();
        const containerRect = grid.container.getBoundingClientRect();
        // Convert from grid-relative to canvas-relative coordinates
        const px = goalCellPx.cx + containerRect.left - canvasRect.left;
        const py = goalCellPx.cy + containerRect.top  - canvasRect.top;
        window.__particleSystem.burst(px, py);
    }

    // ── Update metrics ────────────────────────────────────────────────────
    updateMetrics(grid, visitedOrder, path || [], execMs, panelPrefix);

    return {
        nodesExplored:  visitedOrder.length,
        pathLength:     path ? Math.max(0, path.length - 1) : 0,
        executionTimeMs: execMs
    };
}
