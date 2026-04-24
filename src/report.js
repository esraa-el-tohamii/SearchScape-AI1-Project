import { runBFS } from './algorithms/bfs.js';
import { runDFS } from './algorithms/dfs.js';
import { runUCS } from './algorithms/ucs.js';
import { runAStar } from './algorithms/astar.js';
import { runDLS } from './algorithms/dls.js';
import { runIDS } from './algorithms/ids.js';
import { runBidirectional } from './algorithms/bidirectional.js';
import { manhattan } from './heuristics.js';
import { CELL_TYPES } from './grid.js';
import { setControlsEnabled } from './ui.js';

export function runComparison(grid) {
    if (!grid.startPos || !grid.goalPos) {
        alert("Please set Start and Goal to run comparison.");
        return;
    }

    setControlsEnabled(false);

    // Give UI a moment to update before running heavy synchronous tasks
    setTimeout(() => {
        const algorithms = [
            { name: 'BFS', func: runBFS, optimal: true },
            { name: 'DFS', func: runDFS, optimal: false },
            { name: 'UCS', func: runUCS, optimal: true },
            { name: 'A*', func: (g, s, t) => runAStar(g, s, t, manhattan), optimal: true },
            { name: 'DLS', func: (g, s, t) => runDLS(g, s, t, 10), optimal: false },
            { name: 'IDS', func: runIDS, optimal: true },
            { name: 'Bi-Dir', func: runBidirectional, optimal: true }
        ];

        const results = [];

        algorithms.forEach(algo => {
            const t0 = performance.now();
            const res = algo.func(grid, grid.startPos, grid.goalPos);
            const t1 = performance.now();

            let pathLen = 0;
            let cost = 0;
            if (res && res.path && res.path.length > 0) {
                pathLen = res.path.length - 1;
                for (let i = 1; i < res.path.length; i++) {
                    const n = res.path[i];
                    cost += (grid.cells[n.y][n.x] === CELL_TYPES.WEIGHT) ? 5 : 1;
                }
            }

            results.push({
                name: algo.name,
                optimal: algo.optimal,
                time: t1 - t0,
                nodes: res ? res.visitedOrder.length : 0,
                pathLength: pathLen,
                cost: cost
            });
        });

        renderReport(results);
    }, 50);
}

function renderReport(results) {
    document.getElementById('report-overlay').style.display = 'flex';

    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    
    // Render Table
    results.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.pathLength || 'N/A'}</td>
            <td>${r.time.toFixed(2)}</td>
            <td>${r.nodes}</td>
            <td>${r.cost || 'N/A'}</td>
            <td style="color:${r.optimal ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight:bold;">${r.optimal ? 'Yes' : 'No'}</td>
        `;
        tbody.appendChild(tr);
    });

    // Generate Insights
    const successfulResults = results.filter(r => r.pathLength > 0);
    const fastest = [...successfulResults].sort((a,b) => a.time - b.time)[0] || results[0];
    const leastNodes = [...successfulResults].sort((a,b) => a.nodes - b.nodes)[0] || results[0];

    document.getElementById('report-analysis').innerHTML = `
        <h3>Analysis Insights:</h3>
        <ul>
            <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <strong>Fastest Algorithm:</strong> ${fastest.name} (${fastest.time.toFixed(2)} ms)
            </li>
            <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-purple)" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path></svg>
                <strong>Least Nodes Explored:</strong> ${leastNodes.name} (${leastNodes.nodes} nodes)
            </li>
            <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <strong>Optimality:</strong> BFS, UCS, and A* guarantee shortest path cost. DFS may find longer paths.
            </li>
        </ul>
    `;

    // Render Charts
    const maxNodes = Math.max(...results.map(r => r.nodes)) || 1;
    const maxTime = Math.max(...results.map(r => r.time)) || 1;

    const chartNodes = document.getElementById('chart-nodes');
    const chartTime = document.getElementById('chart-time');
    chartNodes.innerHTML = '';
    chartTime.innerHTML = '';

    results.forEach(r => {
        // Nodes explored chart
        const hNode = (r.nodes / maxNodes) * 140; // max height approx 140px
        const barN = document.createElement('div');
        barN.className = 'chart-bar';
        barN.style.height = `${Math.max(hNode, 2)}px`;
        barN.style.background = 'rgba(157, 78, 221, 0.6)';
        barN.style.borderTop = '2px solid var(--accent-purple)';
        barN.innerHTML = `
            <span class="chart-bar-value">${r.nodes}</span>
            <span class="chart-bar-label">${r.name.split(' ')[0]}</span>
        `;
        chartNodes.appendChild(barN);

        // Time chart
        const hTime = (r.time / maxTime) * 140;
        const barT = document.createElement('div');
        barT.className = 'chart-bar';
        barT.style.height = `${Math.max(hTime, 2)}px`;
        barT.style.background = 'rgba(58, 134, 255, 0.6)';
        barT.style.borderTop = '2px solid var(--accent-blue)';
        barT.innerHTML = `
            <span class="chart-bar-value">${r.time.toFixed(1)}</span>
            <span class="chart-bar-label">${r.name.split(' ')[0]}</span>
        `;
        chartTime.appendChild(barT);
    });
}
