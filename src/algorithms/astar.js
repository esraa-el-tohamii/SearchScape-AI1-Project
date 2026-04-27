import { PriorityQueue } from '../utils/priorityQueue.js';

/**
 * A* Search Algorithm
 *
 * Explores nodes in order of f(n) = g(n) + h(n), where:
 *   g(n) = cost from start to n along the best known path
 *   h(n) = heuristic estimate of cost from n to goal
 *
 * With an admissible heuristic, A* always finds the optimal (lowest-cost) path.
 */
export function runAStar(grid, startNode, goalNode, heuristicFunc) {
    const pq           = new PriorityQueue();
    const visited      = new Set();
    const gScore       = new Map(); // best known cost from start to each node
    const parentMap    = new Map();
    const visitedOrder = [];

    const startKey = `${startNode.x},${startNode.y}`;
    gScore.set(startKey, 0);
    parentMap.set(startKey, null);
    pq.enqueue(startNode, heuristicFunc(startNode, goalNode)); // f = 0 + h

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

        const currentG = gScore.get(currentKey);

        for (const neighbor of grid.getNeighbors(current.x, current.y)) {
            const nKey          = `${neighbor.x},${neighbor.y}`;
            const tentativeG    = currentG + neighbor.cost;

            if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
                gScore.set(nKey, tentativeG);
                parentMap.set(nKey, current);
                const fScore = tentativeG + heuristicFunc(neighbor, goalNode);
                pq.enqueue(neighbor, fScore);
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
