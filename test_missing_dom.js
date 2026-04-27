const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const jsFiles = [
    'main.js', 'src/grid.js', 'src/ui.js', 'src/simulation.js', 
    'src/compare.js', 'src/metrics.js', 'src/character.js',
    'src/audio.js', 'src/visualization.js'
];

jsFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    
    // Check getElementById
    const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = idRegex.exec(content)) !== null) {
        const id = match[1];
        if (!id.includes('${') && !html.includes('id=\"' + id + '\"') && !html.includes("id='" + id + "'")) {
            console.log('Missing ID in HTML:', id, 'from', file);
        }
    }

    // Check querySelector
    const qsRegex = /querySelector\(['"]([^'"]+)['"]\)/g;
    while ((match = qsRegex.exec(content)) !== null) {
        const sel = match[1];
        if (sel.startsWith('#') && !sel.includes('${')) {
            const id = sel.split(' ')[0].substring(1);
            if (!html.includes('id=\"' + id + '\"') && !html.includes("id='" + id + "'")) {
                console.log('Missing Selector ID in HTML:', sel, 'from', file);
            }
        }
    }
});
