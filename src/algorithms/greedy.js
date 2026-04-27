import { PriorityQueue } from '../utils/priorityQueue.js';

/**
 * Greedy Best-First Search
 *
 * Expands the node with the lowest heuristic value h(n) (estimated distance to goal).
 * It is NOT guaranteed to find the shortest path — it greedily chases the goal.
 * Uses a visited set so each node is processed at most once.
 */
export function runGreedy(grid, startNode, goalNode, heuristicFunc) {
    const pq          = new PriorityQueue();
    const visited     = new Set();
    const parentMap   = new Map();
    const visitedOrder = [];

    const startKey = `${startNode.x},${startNode.y}`;
    pq.enqueue(startNode, heuristicFunc(startNode, goalNode));
    // Mark start parent as null (no parent)
    parentMap.set(startKey, null);

    let goalFound = false;

    while (!pq.isEmpty()) {
        const current    = pq.dequeue();
        const currentKey = `${current.x},${current.y}`;

        if (visited.has(currentKey)) continue; // stale entry in PQ
        visited.add(currentKey);
        visitedOrder.push(current);

        if (current.x === goalNode.x && current.y === goalNode.y) {
            goalFound = true;
            break;
        }

        for (const neighbor of grid.getNeighbors(current.x, current.y)) {
            const nKey = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(nKey)) {
                // Always update parent with the first time we discover this node
                // (Greedy doesn't re-explore, so first discovery wins)
                if (!parentMap.has(nKey)) {
                    parentMap.set(nKey, current);
                }
                pq.enqueue(neighbor, heuristicFunc(neighbor, goalNode));
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
