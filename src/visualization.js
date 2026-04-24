/**
 * Visualization helpers — breadcrumb trail, path glow, sound triggers.
 * The old "agent dot" approach is replaced by CharacterController.
 */
import { audioEngine } from './audio.js';

/**
 * Mark a cell as visited (leaves a breadcrumb trail that fades).
 */
export function visualizeVisited(grid, pos) {
    audioEngine.playVisit();
    const cell = grid.domElements[pos.y]?.[pos.x];
    if (!cell) return;
    if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
        cell.classList.add('breadcrumb');
        // Fade to "visited" after a short delay
        setTimeout(() => {
            cell.classList.remove('breadcrumb');
            cell.classList.add('visited');
        }, 400);
    }
}

/**
 * Highlight a cell as part of the final optimal path (gold glow).
 */
export function visualizePath(grid, pos) {
    audioEngine.playVisit();
    const cell = grid.domElements[pos.y]?.[pos.x];
    if (!cell) return;
    if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
        cell.classList.add('path');
    }
}

/**
 * Backtrack visual for DFS-style algorithms.
 */
export function visualizeBacktrack(grid, pos) {
    const cell = grid.domElements[pos.y]?.[pos.x];
    if (!cell) return;
    if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
        cell.classList.remove('visited', 'breadcrumb');
        cell.classList.add('backtrack');
    }
}

/**
 * Meeting point for Bidirectional search.
 */
export function visualizeMeeting(grid, pos) {
    audioEngine.playGoal();
    const cell = grid.domElements[pos.y]?.[pos.x];
    if (!cell) return;
    if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
        cell.classList.add('meeting');
    }
}

// Legacy stubs — CharacterController handles agent visuals now
export function visualizeAgent() {}
export function clearAgent() {}
export function toggleSound() { return audioEngine.toggleMute(); }
export function playGoalSound() { audioEngine.playGoal(); }
export function playClickSound() { audioEngine.playFootstep(); }
export function playVisitSound() { audioEngine.playVisit(); }
export function playPathSound() {}
