export const SPRITE_CONFIG = {
    folder: 'assets',
    character: {
        idleFront: 'boy_front.png',
        moveLeft: 'boy_leftSide.png',
        moveRight: 'boy_rightSide.png',
        moveUpA: 'boy_back_atilt.png',
        moveUpB: 'boy_back.png',
        moveDownA: 'boy_front_atilt.png',
        moveDownB: 'boy_front.png'
    },
    goal: {
        closed: 'treasure_closed.png',
        closedAtilt: 'treasure_closed_atilt.png',
        bright: 'treasure_bright.png',
        opened: 'treasure_opened.png'
    },
    obstacles: {
        trees: ['tree1.png', 'tree2.png', 'tree3.png', 'tree4.png']
    },
    dimensions: {
        // Character size is relative to the current grid cell.
        placeScale: 0.92,
        walkScale: 0.96,
        // Obstacle randomization range.
        treeScaleMin: 0.9,
        treeScaleMax: 1.09,
        treeRotateMinDeg: -3,
        treeRotateMaxDeg: 3
    }
};
