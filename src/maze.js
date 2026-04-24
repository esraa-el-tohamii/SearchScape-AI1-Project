/**
 * Maze Generator — Recursive backtracking (perfect maze).
 * Returns a Grid instance with walls carved out.
 */
export function generateMaze(grid) {
    const { width, height } = grid;
    const CELL = { EMPTY: 'EMPTY', OBSTACLE: 'OBSTACLE', START: 'START', GOAL: 'GOAL' };

    // Fill everything with walls
    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
            grid.cells[y][x] = CELL.OBSTACLE;

    // Work on odd cells only (for corridor between walls)
    const visited = new Set();

    function carve(cx, cy) {
        visited.add(`${cx},${cy}`);
        grid.cells[cy][cx] = CELL.EMPTY;

        const dirs = shuffle([
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ]);

        for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            const key = `${nx},${ny}`;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(key)) {
                // Remove the wall between current and neighbor
                const wx = cx + dx / 2;
                const wy = cy + dy / 2;
                grid.cells[wy][wx] = CELL.EMPTY;
                carve(nx, ny);
            }
        }
    }

    // Start carving from (1,1)
    carve(1, 1);

    // Place start in top-left open area, goal in bottom-right
    const startX = 1, startY = 1;
    const goalX = width % 2 === 0 ? width - 2 : width - 2;
    const goalY = height % 2 === 0 ? height - 2 : height - 2;

    grid.cells[startY][startX] = CELL.START;
    grid.cells[goalY][goalX] = CELL.GOAL;
    grid.startPos = { x: startX, y: startY };
    grid.goalPos = { x: goalX, y: goalY };

    grid.render();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
