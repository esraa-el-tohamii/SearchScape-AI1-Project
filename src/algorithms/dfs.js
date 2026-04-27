/**
 * Depth-First Search (DFS)
 *
 * Explores as deep as possible along each branch before backtracking (LIFO stack).
 * NOT guaranteed to find the shortest path, but will find *a* path if one exists.
 */
export function runDFS(grid, startNode, goalNode) {
    // Stack entries: { node, parent }
    const stack        = [{ node: startNode, parent: null }];
    const visited      = new Set();
    const parentMap    = new Map();
    const visitedOrder = [];

    let goalFound = false;

    while (stack.length > 0) {
        const { node: current, parent } = stack.pop();
        const currentKey = `${current.x},${current.y}`;

        if (visited.has(currentKey)) continue; // already processed
        visited.add(currentKey);
        visitedOrder.push(current);
        parentMap.set(currentKey, parent); // null for start node

        if (current.x === goalNode.x && current.y === goalNode.y) {
            goalFound = true;
            break;
        }

        const neighbors = grid.getNeighbors(current.x, current.y);

        // Push in reverse order so the first neighbor is explored first (LIFO)
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const nb  = neighbors[i];
            const key = `${nb.x},${nb.y}`;
            if (!visited.has(key)) {
                stack.push({ node: nb, parent: current });
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
