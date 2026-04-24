export const CELL_TYPES = {
    EMPTY: 'EMPTY',
    START: 'START',
    GOAL: 'GOAL',
    OBSTACLE: 'OBSTACLE',
    WEIGHT: 'WEIGHT'
};

// We use CSS background images for start, goal, and obstacles now.
import { SPRITE_CONFIG } from './spriteConfig.js';

export class Grid {
    constructor(containerId, width = 15, height = 15, onChange = null) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.cells = [];
        this.domElements = [];
        this.startPos = null;
        this.goalPos = null;
        this.drawMode = CELL_TYPES.OBSTACLE;
        this.isMouseDown = false;
        this.onChange = onChange;
        this.movementMode = 4;

        this.init();
        this.setupEvents();
    }

    init() {
        this.cells = Array.from({ length: this.height }, () =>
            Array(this.width).fill(CELL_TYPES.EMPTY)
        );
        this.domElements = Array.from({ length: this.height }, () =>
            Array(this.width).fill(null)
        );
        this.startPos = null;
        this.goalPos = null;
        this.render();
        this.triggerChange();
    }

    resize(width, height) {
        this.width = parseInt(width);
        this.height = parseInt(height);
        this.init();
    }

    setMovementMode(mode) {
        this.movementMode = parseInt(mode);
    }

    render() {
        this.container.innerHTML = '';

        const gridEl = document.createElement('div');
        gridEl.className = 'grid';
        gridEl.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
        gridEl.style.gridTemplateRows    = `repeat(${this.height}, 1fr)`;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                let tileName = 'center';
                let transform = '';

                if (y === 0 && x === 0) {
                    tileName = 'top_left';
                } else if (y === 0 && x === this.width - 1) {
                    tileName = 'top_right';
                } else if (y === this.height - 1 && x === this.width - 1) {
                    tileName = 'right_bottom';
                } else if (y === this.height - 1 && x === 0) {
                    tileName = 'right_bottom';
                    transform = 'scaleX(-1)';
                } else if (y === 0) {
                    tileName = 'left_right';
                    transform = 'rotate(90deg)';
                } else if (y === this.height - 1) {
                    tileName = 'left_right';
                    transform = 'rotate(90deg)';
                } else if (x === 0) {
                    tileName = 'left_right';
                } else if (x === this.width - 1) {
                    tileName = 'left_right';
                }

                cell.style.setProperty('--tile-bg', `url('assets/${tileName}.jpg')`);
                if (transform) {
                    cell.style.setProperty('--tile-transform', transform);
                }

                gridEl.appendChild(cell);
                this.domElements[y][x] = cell;
            }
        }

        this.container.appendChild(gridEl);

        this.updateDOM();
    }

    setupEvents() {
        this.container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.cell')) {
                this.isMouseDown = true;
                this.handleCellInteraction(e.target.closest('.cell'));
            }
        });

        this.container.addEventListener('mouseover', (e) => {
            if (this.isMouseDown && e.target.closest('.cell')) {
                this.handleCellInteraction(e.target.closest('.cell'));
            }
        });

        document.addEventListener('mouseup', () => { this.isMouseDown = false; });
    }

    handleCellInteraction(cellElement) {
        const x = parseInt(cellElement.dataset.x);
        const y = parseInt(cellElement.dataset.y);

        if (this.drawMode === CELL_TYPES.START) {
            if (this.startPos) this.cells[this.startPos.y][this.startPos.x] = CELL_TYPES.EMPTY;
            this.startPos = { x, y };
            if (this.goalPos?.x === x && this.goalPos?.y === y) this.goalPos = null;
        } else if (this.drawMode === CELL_TYPES.GOAL) {
            if (this.goalPos) this.cells[this.goalPos.y][this.goalPos.x] = CELL_TYPES.EMPTY;
            this.goalPos = { x, y };
            if (this.startPos?.x === x && this.startPos?.y === y) this.startPos = null;
        } else {
            if (this.startPos?.x === x && this.startPos?.y === y) this.startPos = null;
            if (this.goalPos?.x === x  && this.goalPos?.y === y)  this.goalPos  = null;
        }

        this.cells[y][x] = this.drawMode;
        this.updateDOM();
        this.triggerChange();
    }

    updateDOM() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const type   = this.cells[y][x];
                const el     = this.domElements[y][x];
                const isStart = this.startPos?.x === x && this.startPos?.y === y;
                const isGoal  = this.goalPos?.x  === x && this.goalPos?.y  === y;

                // Reset
                el.className   = 'cell';
                el.innerHTML   = '';

                if (isStart || type === CELL_TYPES.START) {
                    el.classList.add('start');
                } else if (isGoal || type === CELL_TYPES.GOAL) {
                    el.classList.add('goal');
                } else if (type === CELL_TYPES.OBSTACLE) {
                    el.classList.add('obstacle');
                    // Pseudo-random stable tree variant
                    const variant = ((x * 13) + (y * 7)) % 4 + 1;
                    el.classList.add(`tree-${variant}`);
                    
                    // Add slight random scale and rotation for realism
                    const d = SPRITE_CONFIG.dimensions;
                    const minScale = d.treeScaleMin;
                    const maxScale = d.treeScaleMax;
                    const scale = minScale + ((((x * y + x) % 20) / 100) * (maxScale - minScale) / 0.19);
                    const rotSpan = d.treeRotateMaxDeg - d.treeRotateMinDeg;
                    const rot = d.treeRotateMinDeg + (((x * 17 + y * 23) % 7) / 6) * rotSpan;
                    el.style.setProperty('--tree-scale', scale);
                    el.style.setProperty('--tree-rot', `${rot}deg`);
                } else if (type === CELL_TYPES.WEIGHT) {
                    el.classList.add('weight');
                    el.textContent = '5';
                }
            }
        }
    }

    clearPaths() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const el = this.domElements[y][x];
                el.classList.remove('visited', 'path', 'agent', 'backtrack',
                                    'meeting', 'breadcrumb', 'path-glow');
            }
        }
    }

    setDrawMode(mode) { this.drawMode = mode; }

    getNeighbors(x, y) {
        const neighbors = [];
        const dirs4 = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        const dirs8 = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];
        const dirs = this.movementMode === 8 ? [...dirs4, ...dirs8] : dirs4;

        for (const { dx, dy } of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                const ct = this.cells[ny][nx];
                if (ct !== CELL_TYPES.OBSTACLE) {
                    const isDiag  = dx !== 0 && dy !== 0;
                    const base    = isDiag ? 1.414 : 1;
                    const cost    = ct === CELL_TYPES.WEIGHT ? base * 5 : base;
                    neighbors.push({ x: nx, y: ny, cost });
                }
            }
        }
        return neighbors;
    }

    triggerChange() { if (this.onChange) this.onChange(this.serialize()); }

    serialize() {
        return {
            width:    this.width,
            height:   this.height,
            cells:    this.cells.map(r => [...r]),
            startPos: this.startPos ? { ...this.startPos } : null,
            goalPos:  this.goalPos  ? { ...this.goalPos  } : null
        };
    }

    load(state) {
        if (!state) return;
        this.width    = state.width;
        this.height   = state.height;
        this.cells    = state.cells.map(r => [...r]);
        this.startPos = state.startPos ? { ...state.startPos } : null;
        this.goalPos  = state.goalPos  ? { ...state.goalPos  } : null;
        this.render();
    }
}
