/**
 * Breadth-First Search (BFS)
 *
 * Explores the grid level by level (FIFO queue).
 * Guaranteed to find the shortest path (in terms of number of steps) on an unweighted grid.
 */
export function runBFS(grid, startNode, goalNode) {
    const queue       = [startNode];
    const visited     = new Set();
    const parentMap   = new Map();
    const visitedOrder = [];

    const startKey = `${startNode.x},${startNode.y}`;
    visited.add(startKey);
    parentMap.set(startKey, null); // root has no parent
    visitedOrder.push(startNode);

    let goalFound = false;

    while (queue.length > 0) {
        const current    = queue.shift();
        const currentKey = `${current.x},${current.y}`;

        if (current.x === goalNode.x && current.y === goalNode.y) {
            goalFound = true;
            break;
        }

        for (const neighbor of grid.getNeighbors(current.x, current.y)) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                parentMap.set(neighborKey, current);
                queue.push(neighbor);
                visitedOrder.push(neighbor);
            }
        }
    }

    // Path reconstruction
    let path = [];
    if (goalFound) {
        let curr = goalNode;
        while (curr !== null && curr !== undefined) {
            path.push(curr);
            curr = parentMap.get(`${curr.x},${curr.y}`);
        }
        path.reverse();
    }

    return { visitedOrder, path };
}
