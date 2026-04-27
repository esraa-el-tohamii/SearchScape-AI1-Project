import { runDLS } from './dls.js';

/**
 * Iterative Deepening Search (IDS)
 *
 * Repeatedly calls DLS with increasing depth limits (0, 1, 2, …).
 * Combines the space efficiency of DFS with the completeness/optimality of BFS.
 * The accumulated visitedOrder shows the iterative deepening process visually.
 */
export function runIDS(grid, startNode, goalNode) {
    const totalVisitedOrder = [];
    let path = [];

    // Maximum sensible depth: total number of cells
    const MAX_DEPTH = grid.width * grid.height;

    for (let limit = 0; limit <= MAX_DEPTH; limit++) {
        const result = runDLS(grid, startNode, goalNode, limit);

        // Accumulate visited order to visualize iterative deepening
        totalVisitedOrder.push(...result.visitedOrder);

        if (result.path && result.path.length > 0) {
            path = result.path;
            break;
        }

        // If nothing was visited at all (empty grid / disconnected), stop early
        if (result.visitedOrder.length === 0) break;
    }

    return { visitedOrder: totalVisitedOrder, path };
}
