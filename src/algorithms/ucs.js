import { PriorityQueue } from '../utils/priorityQueue.js';

/**
 * Uniform Cost Search (UCS)
 *
 * Dijkstra-style search — expands the node with the lowest cumulative path cost g(n).
 * Guaranteed to find the optimal (lowest-cost) path, even with weighted cells.
 */
export function runUCS(grid, startNode, goalNode) {
    const pq           = new PriorityQueue();
    const visited      = new Set();
    const costSoFar    = new Map(); // best known cost from start to each node
    const parentMap    = new Map();
    const visitedOrder = [];

    const startKey = `${startNode.x},${startNode.y}`;
    costSoFar.set(startKey, 0);
    parentMap.set(startKey, null);
    pq.enqueue(startNode, 0);

    let goalFound = false;

    while (!pq.isEmpty()) {
        const current    = pq.dequeue();
        const currentKey = `${current.x},${current.y}`;

        if (visited.has(currentKey)) continue; // stale PQ entry
        visited.add(currentKey);
        visitedOrder.push(current);

        if (current.x === goalNode.x && current.y === goalNode.y) {
            goalFound = true;
            break;
        }

        const currentCost = costSoFar.get(currentKey);

        for (const neighbor of grid.getNeighbors(current.x, current.y)) {
            const nKey    = `${neighbor.x},${neighbor.y}`;
            const newCost = currentCost + neighbor.cost;

            if (!costSoFar.has(nKey) || newCost < costSoFar.get(nKey)) {
                costSoFar.set(nKey, newCost);
                parentMap.set(nKey, current);
                pq.enqueue(neighbor, newCost);
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
