/**
 * AudioEngine — Web Audio API game sound system
 * Subtle, game-like sound effects for the simulator.
 */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.muted = false;
        this.volume = 0.35;
        this._initLazy = false;
    }

    _init() {
        if (this._initLazy) return;
        this._initLazy = true;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('[AudioEngine] Web Audio API unavailable.');
        }
    }

    _resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    _tone({ freq, endFreq, type = 'sine', dur = 0.1, vol = 0.2, delay = 0 }) {
        this._init();
        if (this.muted || !this.ctx) return;
        this._resume();
        try {
            const t = this.ctx.currentTime + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + dur + 0.05);
        } catch (_) { /* ignore */ }
    }

    /** Call on any user interaction to unlock AudioContext */
    unlock() { this._init(); this._resume(); }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(
                this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05
            );
        }
    }

    setMuted(b) {
        this.muted = b;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(
                b ? 0 : this.volume, this.ctx.currentTime, 0.05
            );
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    /** Soft ascending arpeggio — simulation start */
    playStart() {
        [0, 1, 2, 3].forEach(i => {
            const f = 300 * Math.pow(1.2, i);
            this._tone({ freq: f, endFreq: f * 1.05, type: 'triangle', dur: 0.18, vol: 0.12, delay: i * 0.09 });
        });
    }

    /** Subtle tap — each footstep */
    playFootstep() {
        const f = 160 + Math.random() * 60;
        this._tone({ freq: f, endFreq: f * 0.6, type: 'sine', dur: 0.035, vol: 0.07 });
    }

    /** Low thud — obstacle bump */
    playBump() {
        this._tone({ freq: 90, endFreq: 40, type: 'square', dur: 0.09, vol: 0.1 });
    }

    /** Victory fanfare — goal reached */
    playGoal() {
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
            this._tone({ freq: f, endFreq: f * 1.01, type: 'triangle', dur: 0.35 - i * 0.04, vol: 0.14, delay: i * 0.1 });
        });
        setTimeout(() => this._tone({ freq: 1500, endFreq: 2800, type: 'sine', dur: 0.55, vol: 0.09 }), 520);
    }

    /** Faint blip — node visited (exploration phase) */
    playVisit() {
        const f = 450 + Math.random() * 250;
        this._tone({ freq: f, endFreq: f * 0.8, type: 'sine', dur: 0.025, vol: 0.025 });
    }
}

export const audioEngine = new AudioEngine();
