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
import { generateMaze } from './maze.js';
import { audioEngine } from './audio.js';

export function setupUI(grid1) {
    const algoInput = document.getElementById('algo-select');
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active', 'active-informed', 'active-uninformed'));
            const target = e.currentTarget;
            target.classList.add('active');
            
            // Add specific glow color class based on parent grid
            if (target.closest('#informed-grid')) {
                target.classList.add('active-informed');
            } else {
                target.classList.add('active-uninformed');
            }
            
            const algoId = target.getAttribute('data-algo');
            if (algoInput) {
                algoInput.value = algoId;
            }
            
            // Show params if needed
            const showHeuristic = (algoId === 'astar' || algoId === 'greedy');
            const showDepth = (algoId === 'dls');
            
            const paramSec = document.getElementById('algo-params-section');
            if (paramSec) paramSec.style.display = (showHeuristic || showDepth) ? 'flex' : 'none';
            
            const hParam = document.getElementById('param-heuristic');
            if (hParam) hParam.style.display = showHeuristic ? 'flex' : 'none';
            
            const dParam = document.getElementById('param-depth');
            if (dParam) dParam.style.display = showDepth ? 'flex' : 'none';
            
            const tooltip = document.getElementById('algo-desc');
            if (tooltip) {
                const mapNames = {
                    bfs: "Breadth-First Search", dfs: "Depth-First Search", ucs: "Dijkstra's (UCS)",
                    dls: "Depth-Limited Search", ids: "Iterative Deepening Search", bidirectional: "Bidirectional Search",
                    greedy: "Greedy Search", astar: "A-Star Algorithm"
                };
                tooltip.textContent = mapNames[algoId] || algoId;
            }
            
            const metricsName = document.querySelector('#metrics-container-1 .algorithm-value');
            if (metricsName) metricsName.textContent = target.textContent;
        });
    });

    // Draw Tools
    document.querySelectorAll('.draw-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.draw-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            
            const mode = target.getAttribute('data-draw');
            grid1.setDrawMode(CELL_TYPES[mode]);
        });
    });

    // Movement (4 vs 8)
    document.querySelectorAll('.move-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.move-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const mode = parseInt(e.currentTarget.getAttribute('data-move'));
            grid1.setMovementMode(mode);
        });
    });

    // Grid Size Slider
    const sizeSlider = document.getElementById('grid-size-slider');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            document.getElementById('grid-size-val').textContent = `${size}x${size}`;
        });
        sizeSlider.addEventListener('change', (e) => {
            const size = e.target.value;
            grid1.resize(size, size);
        });
    }

    // Speed Slider
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            let text = "Medium";
            if (e.target.value < 33) text = "Slow";
            else if (e.target.value > 66) text = "Fast";
            document.getElementById('speed-val').textContent = text;
        });
    }

    // Generate Maze
    const mazeBtn = document.getElementById('btn-maze');
    if (mazeBtn) {
        mazeBtn.addEventListener('click', () => {
            generateMaze(grid1);
        });
    }

    // Reset Grids
    document.getElementById('btn-reset').addEventListener('click', () => {
        grid1.init();
        resetMetrics('1');
        const oldChar = document.querySelector('.game-character');
        if (oldChar) oldChar.remove();
    });

    // Sound controls
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
        btnSound.addEventListener('click', () => {
            const isMuted = audioEngine.toggleMute();
            btnSound.innerHTML = isMuted ? '🔇' : '🔊';
        });
    }

    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            audioEngine.setVolume(e.target.value / 100);
        });
    }
}

function getTooltipText(algoId) {
    const texts = {
        bfs: "Explores all neighbor nodes at the present depth before moving on.",
        dfs: "Explores as far as possible along each branch before backtracking.",
        ucs: "Finds the path with the lowest cumulative cost (Dijkstra's).",
        astar: "Uses heuristics to guide search efficiently towards the goal.",
        greedy: "Always chooses the path that appears closest to the goal.",
        dls: "DFS but bounded by a maximum depth limit.",
        ids: "Repeats DLS with increasing depth limits until goal is found.",
        bidirectional: "Runs two simultaneous searches from start and goal."
    };
    return texts[algoId] || "";
}

function resetMetrics(idSuffix) {
    document.querySelector(`#metrics-container-${idSuffix} .path-value`).textContent = '—';
    document.querySelector(`#metrics-container-${idSuffix} .nodes-value`).textContent = '—';
    document.querySelector(`#metrics-container-${idSuffix} .time-value`).textContent = '—';
    
    const panel = document.getElementById(`metrics-panel-${idSuffix}`);
    if (panel) {
        panel.querySelector('.m-path-val').textContent = '0';
        panel.querySelector('.m-nodes-val').textContent = '0';
        panel.querySelector('.m-time-val').textContent = '0ms';
    }
}

export function updateMetricsUI(idSuffix, metrics) {
    document.querySelector(`#metrics-container-${idSuffix} .path-value`).textContent = metrics.pathLength;
    document.querySelector(`#metrics-container-${idSuffix} .nodes-value`).textContent = metrics.nodesExplored;
    document.querySelector(`#metrics-container-${idSuffix} .time-value`).textContent = `${metrics.time}ms`;
}

export function getAlgorithmFunction(idSuffix) {
    let algoId = 'bfs';
    if (idSuffix === '1') {
        const algoSelect = document.getElementById('algo-select');
        if (algoSelect) algoId = algoSelect.value;
    }
    
    if (algoId === 'bfs') return runBFS;
    if (algoId === 'dfs') return runDFS;
    if (algoId === 'ucs') return runUCS;
    if (algoId === 'ids') return runIDS;
    if (algoId === 'bidirectional') return runBidirectional;
    
    if (algoId === 'astar') {
        const hValue = document.getElementById('heuristic1').value;
        const hFunc = hValue === 'euclidean' ? euclidean : manhattan;
        return (g, s, t) => runAStar(g, s, t, hFunc);
    }
    
    if (algoId === 'dls') {
        const limit = parseInt(document.getElementById('depth1').value) || 10;
        return (g, s, t) => runDLS(g, s, t, limit);
    }

    if (algoId === 'greedy') {
        const hValue = document.getElementById('heuristic1').value;
        const hFunc = hValue === 'euclidean' ? euclidean : manhattan;
        return (g, s, t) => runGreedy(g, s, t, hFunc);
    }

    return runBFS;
}

export function setControlsEnabled(enabled) {
    const interactables = document.querySelectorAll('button:not(#btn-pause):not(#btn-stop):not(#btn-compare-close):not(.nav-btn):not(#btn-step-next):not(#btn-step-resume), select, input');
    interactables.forEach(el => {
        if (el.id !== 'btn-sound' && el.id !== 'volume-slider' && el.id !== 'step-toggle') {
            el.disabled = !enabled;
        }
    });
    
    const statusBadge = document.getElementById('status-badge');
    const gw1 = document.querySelector('#instance-1 .grid-wrapper');

    if (gw1) {
        gw1.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    if (!enabled) {
        statusBadge.classList.remove('ready');
        statusBadge.innerHTML = `<span class="status-dot-small" style="background:var(--accent-yellow)"></span> RUNNING`;
        statusBadge.style.color = 'var(--accent-yellow)';
        if (gw1) gw1.classList.add('running');
    } else {
        statusBadge.classList.add('ready');
        statusBadge.innerHTML = `<span class="status-dot-small"></span> READY`;
        statusBadge.style.color = '';
        if (gw1) gw1.classList.remove('running');
    }
}

export function exportReport(results) {
    const payload = {
        exportedAt: new Date().toISOString(),
        ...results
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `searchscape-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
