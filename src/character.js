/**
 * CharacterController — CSS-animated walking character rendered as an overlay
 * above the grid. Moves tile-by-tile with direction-aware animation.
 */
import { audioEngine } from './audio.js';

export class CharacterController {
    constructor(gridContainer, gridInstance) {
        this.container = gridContainer;  // the element that wraps the grid
        this.grid = gridInstance;
        this.el = null;
        this.currentPos = null;
        this._build();
    }

    _build() {
        const old = this.container.querySelector('.game-character');
        if (old) old.remove();

        this.el = document.createElement('div');
        this.el.className = 'game-character idle';

        // Ensure container is positioned
        this.container.style.position = 'relative';
        this.container.appendChild(this.el);
        this.el.style.display = 'none';
    }

    /** Get center pixel position of cell (x,y) relative to this.container */
    _cellPx(x, y) {
        const row = this.grid.domElements[y];
        if (!row) return null;
        const cell = row[x];
        if (!cell) return null;

        const containerRect = this.container.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        return {
            cx: cellRect.left - containerRect.left + cellRect.width / 2,
            cy: cellRect.top - containerRect.top + cellRect.height / 2,
            w: cellRect.width,
            h: cellRect.height
        };
    }

    /** Immediately place character at cell (x,y) — no animation */
    place(x, y) {
        this.currentPos = { x, y };
        const p = this._cellPx(x, y);
        if (!p) return;

        const charW = Math.min(p.w * 0.80, 40);
        const charH = Math.min(p.h * 0.80, 48);

        this.el.style.cssText = `
            display: block;
            left: ${p.cx}px;
            top: ${p.cy}px;
            width: ${charW}px;
            height: ${charH}px;
            transition: none;
            transform: translate(-50%, -50%);
            background-image: url('assets/boy_front.png');
        `;
        this._setState('idle');
    }

    /** Animate character moving to cell (x,y), returns Promise */
    moveTo(x, y, ms = 220) {
        return new Promise(resolve => {
            const p = this._cellPx(x, y);
            if (!p) { resolve(); return; }

            // Direction
            if (this.currentPos) {
                const dx = x - this.currentPos.x;
                const dy = y - this.currentPos.y;
                
                this.stepToggle = !this.stepToggle;
                let bgImage = '';
                
                if (dx < 0) {
                    bgImage = 'boy_leftSide.png';
                } else if (dx > 0) {
                    bgImage = 'boy_rightSide.png';
                } else if (dy < 0) {
                    bgImage = this.stepToggle ? 'boy_back_atilt.png' : 'boy_back.png';
                } else if (dy > 0) {
                    bgImage = this.stepToggle ? 'boy_front_atilt.png' : 'boy_front.png';
                }
                
                if (bgImage) {
                    this.el.style.backgroundImage = `url('assets/${bgImage}')`;
                }
                this._setState('walking');
            }

            const charW = Math.min(p.w * 0.90, 48);
            const charH = Math.min(p.h * 0.90, 56);

            this.el.style.transition = `left ${ms}ms cubic-bezier(.4,0,.2,1), top ${ms}ms cubic-bezier(.4,0,.2,1)`;
            this.el.style.left = `${p.cx}px`;
            this.el.style.top = `${p.cy}px`;
            this.el.style.width = `${charW}px`;
            this.el.style.height = `${charH}px`;

            if (this.grid.goalPos) {
                const dist = Math.abs(x - this.grid.goalPos.x) + Math.abs(y - this.grid.goalPos.y);
                const goalCell = this.grid.domElements[this.grid.goalPos.y][this.grid.goalPos.x];
                if (goalCell) {
                    if (dist <= 2) {
                        goalCell.classList.add('glow');
                    } else {
                        goalCell.classList.remove('glow');
                    }
                }
            }

            // Breadcrumb
            if (this.currentPos) {
                const oldP = this._cellPx(this.currentPos.x, this.currentPos.y);
                if (oldP) {
                    const crumb = document.createElement('div');
                    crumb.className = 'breadcrumb-trail';
                    crumb.style.left = `${oldP.cx}px`;
                    crumb.style.top = `${oldP.cy}px`;
                    this.container.appendChild(crumb);
                    setTimeout(() => crumb.remove(), 3000); // matches CSS animation
                }
            }

            audioEngine.playFootstep();
            this.currentPos = { x, y };
            setTimeout(resolve, ms);
        });
    }

    celebrate() {
        this._setState('celebrating');
        if (this.grid.goalPos) {
             const goalCell = this.grid.domElements[this.grid.goalPos.y][this.grid.goalPos.x];
             if (goalCell) {
                 setTimeout(() => {
                     goalCell.classList.remove('glow');
                     goalCell.classList.add('open');
                 }, 300); // 300ms delay for visual feedback before opening
             }
        }
        setTimeout(() => {
            if (this.el) this._setState('idle');
        }, 3200);
    }

    hide() {
        if (this.el) this.el.style.display = 'none';
    }

    reset() {
        this.currentPos = null;
        if (this.el) {
            this.el.style.display = 'none';
            this.el.style.transition = 'none';
            this._setState('idle');
        }
    }

    _setState(cls) {
        if (this.el) this.el.className = `game-character ${cls}`;
    }
}

