/**
 * Depth-Limited Search (DLS)
 * 
 * A recursive DFS that stops expanding beyond `depthLimit`.
 * Returns { visitedOrder, path } where path is empty if goal not found within limit.
 */
export function runDLS(grid, startNode, goalNode, depthLimit) {
    const visitedOrder = [];
    const parentMap = new Map();
    let goalFound = false;

    // We use a visited set PER CALL so IDS can re-explore at each depth limit.
    // For a single DLS call, we still avoid revisiting the same node in the
    // current path using a `pathSet` (to avoid infinite cycles on the same branch).
    function dls(node, depth, pathSet) {
        if (goalFound) return;

        const key = `${node.x},${node.y}`;

        // Add to visited order for visualization
        visitedOrder.push(node);

        // Goal check
        if (node.x === goalNode.x && node.y === goalNode.y) {
            goalFound = true;
            return;
        }

        // Depth cutoff
        if (depth >= depthLimit) return;

        const neighbors = grid.getNeighbors(node.x, node.y);

        for (const neighbor of neighbors) {
            const nKey = `${neighbor.x},${neighbor.y}`;

            // Skip nodes already on the current DFS path (cycle prevention)
            if (pathSet.has(nKey)) continue;

            // Only record parent the first time we discover a node
            if (!parentMap.has(nKey)) {
                parentMap.set(nKey, node);
            }

            pathSet.add(nKey);
            dls(neighbor, depth + 1, pathSet);
            pathSet.delete(nKey);

            if (goalFound) return;
        }
    }

    const startKey = `${startNode.x},${startNode.y}`;
    const pathSet = new Set([startKey]);
    dls(startNode, 0, pathSet);

    // Path reconstruction
    let path = [];
    if (goalFound) {
        let curr = goalNode;
        while (curr) {
            path.push(curr);
            const key = `${curr.x},${curr.y}`;
            curr = parentMap.get(key);
        }
        path.reverse();
    }

    return { visitedOrder, path };
}
