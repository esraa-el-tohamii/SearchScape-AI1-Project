export const EXPLANATIONS = {
    bfs: {
        title: 'Breadth-First Search (BFS)',
        description: 'Explores all neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.',
        time: 'O(V + E)',
        space: 'O(V)',
        pros: 'Guarantees the shortest path on unweighted grids.',
        cons: 'Consumes a lot of memory as it stores all nodes of a level.'
    },
    dfs: {
        title: 'Depth-First Search (DFS)',
        description: 'Explores as far as possible along each branch before backtracking.',
        time: 'O(V + E)',
        space: 'O(V)',
        pros: 'Memory efficient. Good if the goal is far away and deep.',
        cons: 'Not guaranteed to find the shortest path. Can get stuck in deep paths.'
    },
    ucs: {
        title: 'Uniform Cost Search (UCS)',
        description: 'Expands the node with the lowest path cost so far. Equivalent to Dijkstra on unweighted graphs.',
        time: 'O(V + E log V)',
        space: 'O(V)',
        pros: 'Guarantees the lowest cost path on weighted grids.',
        cons: 'Explores equally in all directions, which can be slow.'
    },
    astar: {
        title: 'A* Search',
        description: 'Uses a heuristic to guide the search towards the goal while considering path cost.',
        time: 'O(E)',
        space: 'O(V)',
        pros: 'Optimal and complete. Extremely fast with a good heuristic.',
        cons: 'Heuristic must be admissible (never overestimate). Memory intensive.'
    },
    dls: {
        title: 'Depth-Limited Search (DLS)',
        description: 'DFS with a predefined depth limit to avoid infinite loops.',
        time: 'O(b^l) (b=branching factor, l=limit)',
        space: 'O(l)',
        pros: 'Solves the infinite path problem of DFS.',
        cons: 'Incomplete if limit is less than actual goal depth.'
    },
    ids: {
        title: 'Iterative Deepening Search (IDS)',
        description: 'Repeatedly runs DLS with increasing depth limits until the goal is found.',
        time: 'O(b^d) (d=depth of goal)',
        space: 'O(d)',
        pros: 'Combines BFS completeness/optimality with DFS memory efficiency.',
        cons: 'Recomputes upper levels multiple times (though practically minor).'
    },
    bidirectional: {
        title: 'Bidirectional Search',
        description: 'Runs two simultaneous searches: one from start, one from goal, stopping when they meet.',
        time: 'O(b^(d/2))',
        space: 'O(b^(d/2))',
        pros: 'Dramatically reduces search time and space compared to unidirectional search.',
        cons: 'Implementation is complex. Needs to know the exact goal state.'
    }
};

export function renderExplanation(algoValue, containerId) {
    const container = document.getElementById(containerId);
    const data = EXPLANATIONS[algoValue];
    if (!data || !container) return;

    container.innerHTML = `
        <div class="explanation-card">
            <h4>${data.title}</h4>
            <p>${data.description}</p>
            <ul>
                <li><strong>Time Complexity:</strong> ${data.time}</li>
                <li><strong>Space Complexity:</strong> ${data.space}</li>
                <li><strong>Pros:</strong> ${data.pros}</li>
                <li><strong>Cons:</strong> ${data.cons}</li>
            </ul>
        </div>
    `;
}
