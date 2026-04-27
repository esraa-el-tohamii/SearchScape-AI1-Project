/**
 * Bidirectional BFS
 *
 * Expands simultaneously from start and goal.
 * When the two frontiers meet, reconstructs the full path through the meeting node.
 */
export function runBidirectional(grid, startNode, goalNode) {
    const startKey = `${startNode.x},${startNode.y}`;
    const goalKey  = `${goalNode.x},${goalNode.y}`;

    // Handle trivial case
    if (startKey === goalKey) {
        return { visitedOrder: [startNode], path: [startNode], meetingNode: null };
    }

    // Each Map stores: nodeKey → parent node (null means this node is the BFS root)
    const visitedStart = new Map(); // BFS from start; root = startNode
    const visitedGoal  = new Map(); // BFS from goal;  root = goalNode

    visitedStart.set(startKey, null);
    visitedGoal.set(goalKey,  null);

    const qStart = [startNode];
    const qGoal  = [goalNode];

    const visitedOrder = [startNode, goalNode];
    let meetingNode = null;

    while (qStart.length > 0 && qGoal.length > 0) {

        // ── Expand one node from the start frontier ──────────────────────────
        const currStart = qStart.shift();
        for (const nb of grid.getNeighbors(currStart.x, currStart.y)) {
            const nKey = `${nb.x},${nb.y}`;
            if (!visitedStart.has(nKey)) {
                visitedStart.set(nKey, currStart);   // parent is currStart
                qStart.push(nb);
                visitedOrder.push(nb);
                if (visitedGoal.has(nKey)) { meetingNode = nb; break; }
            }
        }
        if (meetingNode) break;

        // ── Expand one node from the goal frontier ───────────────────────────
        const currGoal = qGoal.shift();
        for (const nb of grid.getNeighbors(currGoal.x, currGoal.y)) {
            const nKey = `${nb.x},${nb.y}`;
            if (!visitedGoal.has(nKey)) {
                visitedGoal.set(nKey, currGoal);     // parent is currGoal
                qGoal.push(nb);
                visitedOrder.push(nb);
                if (visitedStart.has(nKey)) { meetingNode = nb; break; }
            }
        }
        if (meetingNode) break;
    }

    let path = [];
    if (meetingNode) {
        /*
         * Reconstruct path in two halves:
         *
         * Start-side:  meetingNode → ... → startNode  (follow visitedStart parents)
         *   → reverse → startNode → ... → meetingNode
         *
         * Goal-side:   meetingNode → ... → goalNode   (follow visitedGoal parents)
         *   This half is already in meeting→goal direction, no reverse needed.
         *
         * Final path = [startNode, ..., meetingNode, ..., goalNode]
         */

        // Half 1: start → meetingNode
        const half1 = [];
        let cur = meetingNode;
        while (cur !== null && cur !== undefined) {
            half1.push(cur);
            cur = visitedStart.get(`${cur.x},${cur.y}`);
        }
        half1.reverse(); // now [startNode, ..., meetingNode]

        // Half 2: parent-of-meetingNode-on-goal-side → ... → goalNode
        const half2 = [];
        cur = visitedGoal.get(`${meetingNode.x},${meetingNode.y}`);
        while (cur !== null && cur !== undefined) {
            half2.push(cur);
            cur = visitedGoal.get(`${cur.x},${cur.y}`);
        }
        // half2 is [meeting_goal_parent, ..., goalNode]
        // visitedGoal parent chain goes TOWARD goalNode (the BFS root of goal-side),
        // so the last element of half2 is goalNode. Correct order already.

        path = [...half1, ...half2];
    }

    return { visitedOrder, path, meetingNode };
}
