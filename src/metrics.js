/**
 * Metrics — update the UI stats panel with count-up animations.
 */

/**
 * Animate a number counting up to `target` in the given DOM element.
 */
function countUp(el, target, suffix = '', duration = 800) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/**
 * Update the metrics panel for a given grid/panel instance.
 * @param {object} grid      — Grid instance
 * @param {Array}  visited   — Visited nodes array
 * @param {Array}  path      — Final path array
 * @param {number} timeMs    — Execution time in ms
 * @param {string} prefix    — Panel prefix id (e.g. '1')
 */
export function updateMetrics(grid, visited, path, timeMs, prefix) {
    const pathLen  = path ? Math.max(0, path.length - 1) : 0;
    const explored = visited ? visited.length : 0;
    const ms       = parseFloat(timeMs.toFixed(2));

    const panel = document.getElementById(`metrics-panel-${prefix}`);
    if (panel) {
        panel.style.display = 'flex';
        const pathEl  = panel.querySelector('.m-path-val');
        const nodeEl  = panel.querySelector('.m-nodes-val');
        const timeEl  = panel.querySelector('.m-time-val');

        countUp(pathEl,  pathLen,  '', 700);
        countUp(nodeEl,  explored, '', 900);
        // Time displayed as fixed float
        if (timeEl) {
            const t0 = performance.now();
            function animTime(now) {
                const p = Math.min((now - t0) / 700, 1);
                const e = 1 - Math.pow(1 - p, 3);
                timeEl.textContent = (ms * e).toFixed(2) + 'ms';
                if (p < 1) requestAnimationFrame(animTime);
            }
            requestAnimationFrame(animTime);
        }
    }

    // Also update topbar metric cards
    const pathCard  = document.querySelector(`#metrics-container-${prefix} .path-value`);
    const nodesCard = document.querySelector(`#metrics-container-${prefix} .nodes-value`);
    const timeCard  = document.querySelector(`#metrics-container-${prefix} .time-value`);

    countUp(pathCard,  pathLen,  '', 700);
    countUp(nodesCard, explored, '', 900);
    if (timeCard) {
        const t0 = performance.now();
        function animT(now) {
            const p = Math.min((now - t0) / 700, 1);
            const e = 1 - Math.pow(1 - p, 3);
            timeCard.textContent = (ms * e).toFixed(2) + 'ms';
            if (p < 1) requestAnimationFrame(animT);
        }
        requestAnimationFrame(animT);
    }
}
