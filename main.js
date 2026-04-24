import { Grid } from './src/grid.js';
import { runSimulation, CancellationToken } from './src/simulation.js';
import { setupUI, getAlgorithmFunction, setControlsEnabled, exportReport } from './src/ui.js';
import { runComparison } from './src/compare.js';
import { ParticleSystem } from './src/particles.js';
import { SPRITE_CONFIG } from './src/spriteConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const base = SPRITE_CONFIG.folder;
    const c = SPRITE_CONFIG.character;
    const g = SPRITE_CONFIG.goal;
    const t = SPRITE_CONFIG.obstacles.trees;
    root.style.setProperty('--sprite-boy-front', `url('${base}/${c.idleFront}')`);
    root.style.setProperty('--sprite-treasure-closed', `url('${base}/${g.closed}')`);
    root.style.setProperty('--sprite-treasure-closed-atilt', `url('${base}/${g.closedAtilt}')`);
    root.style.setProperty('--sprite-treasure-bright', `url('${base}/${g.bright}')`);
    root.style.setProperty('--sprite-treasure-opened', `url('${base}/${g.opened}')`);
    root.style.setProperty('--sprite-tree-1', `url('${base}/${t[0] || 'tree1.png'}')`);
    root.style.setProperty('--sprite-tree-2', `url('${base}/${t[1] || 'tree2.png'}')`);
    root.style.setProperty('--sprite-tree-3', `url('${base}/${t[2] || 'tree3.png'}')`);
    root.style.setProperty('--sprite-tree-4', `url('${base}/${t[3] || 'tree4.png'}')`);

    const grid1 = new Grid('grid-container-1', 15, 15);
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        window.__particleSystem = new ParticleSystem(particleCanvas);
    }

    setupUI(grid1);

    let lastResults = null;
    let currentToken = null; // tracks the active simulation's cancellation token

    const btnStart = document.getElementById('btn-start');
    const btnStop  = document.getElementById('btn-stop');

    /** Show/hide start vs stop buttons and lock/unlock controls */
    function setSimulationRunning(running) {
        if (running) {
            btnStart.style.display = 'none';
            btnStop.style.display  = 'flex';
        } else {
            btnStart.style.display = 'flex';
            btnStop.style.display  = 'none';
        }
        setControlsEnabled(!running);
        // Keep Stop always clickable while running
        if (running) btnStop.disabled = false;
    }

    btnStart.addEventListener('click', async () => {
        if (!grid1.startPos || !grid1.goalPos) {
            alert("Please set both Start and Goal positions on the grid.");
            return;
        }

        // Create a fresh cancellation token for this run
        currentToken = new CancellationToken();

        setSimulationRunning(true);

        const algoFunc1  = getAlgorithmFunction('1');
        const algoName1  = document.getElementById('algo-select').value;

        // Step Mode Logic
        const stepToggle = document.getElementById('step-toggle');
        if (stepToggle && stepToggle.checked) {
            currentToken.stepMode = true;
            currentToken.pause();
            document.getElementById('step-controls').style.display = 'flex';
        } else {
            currentToken.stepMode = false;
        }

        try {
            const res1 = await runSimulation(
                grid1, grid1.startPos, grid1.goalPos,
                algoFunc1, algoName1, '1',
                currentToken
            );

            // Only store results if the run completed (not cancelled)
            if (res1) {
                lastResults = {
                    timestamp: new Date().toISOString(),
                    gridSize: { width: grid1.width, height: grid1.height },
                    runs: [{ id: 1, algorithm: algoName1, metrics: res1 }]
                };
            }
        } catch (err) {
            console.error('Simulation failed:', err);
            alert('Simulation failed. Please try again.');
        } finally {
            setSimulationRunning(false);
            if (document.getElementById('step-controls')) {
                document.getElementById('step-controls').style.display = 'none';
            }
            currentToken = null;
        }
    });

    btnStop.addEventListener('click', () => {
        if (currentToken) {
            currentToken.cancel();
        }
    });

    // Compare Button triggers the Report Overlay
    document.getElementById('btn-compare').addEventListener('click', () => {
        document.getElementById('report-overlay').style.display = 'flex';
        runComparison(grid1);
    });

    document.getElementById('btn-close-report')?.addEventListener('click', () => {
        document.getElementById('report-overlay').style.display = 'none';
    });

    // Step mode handlers
    document.getElementById('step-toggle')?.addEventListener('change', (e) => {
        if (currentToken) {
            currentToken.stepMode = e.target.checked;
            if (e.target.checked) {
                currentToken.pause();
                document.getElementById('step-controls').style.display = 'flex';
            } else {
                currentToken.resume();
                document.getElementById('step-controls').style.display = 'none';
            }
        }
    });

    document.getElementById('btn-step-next')?.addEventListener('click', () => {
        if (currentToken && currentToken.paused) {
            currentToken.resume();
        }
    });

    document.getElementById('btn-step-resume')?.addEventListener('click', () => {
        const toggle = document.getElementById('step-toggle');
        if (toggle) toggle.checked = false;
        document.getElementById('step-controls').style.display = 'none';
        if (currentToken) {
            currentToken.stepMode = false;
            currentToken.resume();
        }
    });

    document.getElementById('btn-export')?.addEventListener('click', () => {
        if (!lastResults) {
            alert("Please run a simulation first to export results.");
            return;
        }
        exportReport(lastResults);
    });

    document.getElementById('btn-save')?.addEventListener('click', () => {
        const state = grid1.serialize();
        localStorage.setItem('searchscape_grid', JSON.stringify(state));
        alert("Grid saved successfully.");
    });

    document.getElementById('btn-load')?.addEventListener('click', () => {
        const saved = localStorage.getItem('searchscape_grid');
        if (saved) {
            const state = JSON.parse(saved);
            grid1.load(state);
        } else {
            alert("No saved grid found.");
        }
    });
});
