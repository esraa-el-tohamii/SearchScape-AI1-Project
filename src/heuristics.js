/**
 * Computes Manhattan distance between two nodes.
 * Used for grids where diagonal movement is not allowed.
 */
export function manhattan(nodeA, nodeB) {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

/**
 * Computes Euclidean distance (straight line) between two nodes.
 */
export function euclidean(nodeA, nodeB) {
    return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
}
