# 🧠 SearchScape AI Pathfinding Simulator

An interactive grid-based simulation that visualizes how different AI pathfinding algorithms explore a map to find the shortest path between a start node and a goal node.

---

## 🚀 Overview

SearchScape is an educational visualization tool designed to help understand how search algorithms operate in real-time.

### 🧩 Core Idea

* 🧍 A character represents the Start Node (Agent)
* 🎯 A treasure chest represents the Goal Node
* 🌳 Obstacles (trees) block movement
* 🤖 Algorithms explore the grid step-by-step to find a path

---

## 🎮 Features

* 🎥 Real-time pathfinding visualization
* 🤖 Multiple AI algorithms (BFS, DFS, A*)
* 🎭 Animated character movement
* 🧩 Grid-based environment simulation
* 📊 Metrics & performance tracking
* ✨ Particle / visual effects system
* 🧱 Modular vanilla JavaScript architecture

---

## 🛠 Tech Stack

* HTML5 – Structure
* CSS3 – Styling & layout
* JavaScript (ES6) – Core logic
* DOM Manipulation – Rendering system

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

## 🧪 Run Locally

### 🚀 Option 1: Open Directly

bash id="run1"
index.html

---

### ⚡️ Option 2: VS Code Live Server (Recommended)

1. Right-click on index.html
2. Click "Open with Live Server"

💡 *Why Live Server?*

* Prevents CORS issues
* Supports JS modules correctly
* Auto reload on changes

---

## ⚙️ How It Works

text id="flow"
grid.js          → builds the grid system  
simulation.js    → controls the main loop  
algorithms/      → pathfinding logic  
visualization.js → animates exploration step-by-step  
character.js     → updates agent movement & direction  
metrics.js       → tracks performance data  

---

## 🧠 Supported Algorithms

* 🔵 Breadth First Search (BFS) – guarantees shortest path
* 🟣 Depth First Search (DFS) – faster but not optimal
* 🟡 A*** – heuristic-based, most efficient
* ⚙️ **Custom Comparison Mode

---

## 📊 Features Breakdown

* ⏱️ Real-time simulation speed control
* 📍 Start / Goal placement system
* 🚧 Dynamic obstacle handling
* 📈 Performance metrics *(nodes visited, path length)*
* 🎨 Sprite-based animation system

---

## 🔮 Future Improvements

* 📱 Mobile responsiveness
* ➕ More pathfinding algorithms
* 🎛 Better UI dashboard
* 💾 Save / load maps
* 📊 Advanced analytics panel

---

## 👩‍💻 Author

Developed by SearchScape Team

---

## 📜 License

This project is open-source under the MIT License
