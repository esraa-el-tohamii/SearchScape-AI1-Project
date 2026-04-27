/**
 * ParticleSystem — canvas-based particle burst for goal reached.
 */
export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animId = null;
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width || 600;
        this.canvas.height = rect.height || 600;
    }

    /**
     * Trigger a burst at pixel coords (px, py) relative to canvas.
     * @param {number} px
     * @param {number} py
     */
    burst(px, py) {
        const COLORS = [
            '#FFD700', '#FFA500', '#FF6B35',
            '#00FFA3', '#7C3AED', '#60A5FA',
            '#F472B6', '#FBBF24'
        ];

        for (let i = 0; i < 36; i++) {
            const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.3;
            const speed = 1.8 + Math.random() * 4.5;
            this.particles.push({
                x: px, y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                life: 1.0,
                decay: 0.016 + Math.random() * 0.018,
                size: 4 + Math.random() * 6,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rot: Math.random() * Math.PI * 2,
                rotSpd: (Math.random() - 0.5) * 0.18,
                star: Math.random() > 0.5
            });
        }
        if (!this.animId) this._loop();
    }

    _drawStar(ctx, cx, cy, r, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
            ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            ctx.lineTo(cx + Math.cos(a2) * r * 0.4, cy + Math.sin(a2) * r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => p.life > 0);

        for (const p of this.particles) {
            const alpha = Math.max(0, p.life);
            if (p.star) {
                this._drawStar(this.ctx, p.x, p.y, p.size, p.color, alpha);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot);
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.ctx.restore();
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.18; // gravity
            p.vx *= 0.98;
            p.life -= p.decay;
            p.rot += p.rotSpd;
            p.size *= 0.985;
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(() => this._loop());
        } else {
            this.animId = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}
