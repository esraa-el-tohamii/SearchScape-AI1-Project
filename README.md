# 🧠 SearchScape AI Pathfinding Simulator

An interactive grid-based simulation that visualizes how different AI pathfinding algorithms explore a map to find the shortest path between a start node and a goal node.

---

## 🚀 Overview

SearchScape is an educational AI visualization tool that demonstrates how search algorithms work in real time.

### 🧩 Core Idea
- 🧍 A character represents the start node (agent)
- 🎯 A treasure chest represents the goal node
- 🌳 Obstacles (trees) block movement
- 🤖 Algorithms explore the grid step-by-step

---

## 🎮 Features

- Real-time pathfinding visualization
- Multiple AI algorithms (BFS, DFS, heuristics, etc.)
- Animated character movement
- Grid-based environment simulation
- Metrics & performance tracking
- Particle / visual effects system
- Modular vanilla JavaScript architecture

---

## 🛠 Tech Stack

- HTML5 – Structure
- CSS3 – Styling & layout
- JavaScript (ES6) – Core logic
- DOM Manipulation – Rendering system

---

## 📁 Project Structure


assets/ # Images, sprites, visual assets

src/
├── algorithms/ # Pathfinding algorithms
├── data/ # Grid/data models
├── utils/ # Helper functions
├── audio.js # Sound system
├── character.js # Player/agent logic
├── compare.js # Algorithm comparison logic
├── grid.js # Grid generation & rendering
├── heuristics.js # Heuristic functions (A*)
├── maze.js # Maze generation
├── metrics.js # Performance tracking
├── particles.js # Visual effects
├── report.js # Results/report system
├── simulation.js # Main simulation controller
├── spriteConfig.js # Sprite mapping/config
├── ui.js # UI controls
├── visualization.js # Animation & rendering logic

index.html # Main entry point
main.js # App bootstrap
style.css # Global styling


---

## ▶️ How to Run

### 1. Open project folder
Just open the folder in VS Code or any editor.

### 2. Run locally
You can use Live Server OR open directly:

```bash
index.html

OR with VS Code Live Server:

Right click index.html
Click "Open with Live Server"
⚙️ How It Works
grid.js builds the grid system
simulation.js controls the main loop
Algorithms in /algorithms explore nodes
visualization.js animates movement step-by-step
character.js updates agent direction & movement
metrics.js tracks performance data
🧠 Algorithms Supported
Breadth First Search (BFS)
Depth First Search (DFS)
A* Search (Heuristics-based)
Custom comparison mode
📊 Features Breakdown
⏱️ Real-time simulation speed control
📍 Start / Goal placement system
🚧 Dynamic obstacle handling
📈 Performance metrics (nodes visited, path length)
🎨 Sprite-based animation system
🔮 Future Improvements
Mobile responsiveness
More pathfinding algorithms
Better UI dashboard
Save/load maps
Advanced analytics panel
👩‍💻 Author

Developed by SearchScape Team

📜 License

This project is open-source (MIT License).
