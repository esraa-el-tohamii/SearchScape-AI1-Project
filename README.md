# 🧠 SearchScape | Algorithm Learning Game

SearchScape is an interactive, game-based web application designed to visualize and teach pathfinding algorithms in a dynamic and engaging way.

It transforms abstract AI concepts into a real-time simulation where a character navigates a grid to reach a goal while avoiding obstacles.

---

## 🎯 Project Purpose

The goal of this project is to help students understand how different search algorithms work by:

* Visualizing their behavior step-by-step
* Comparing performance across algorithms
* Interacting with a customizable grid environment

---

## 🧩 PEAS Description (AI Agent Model)

| Component       | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| Performance | Path Length, Nodes Explored, Execution Time |
| Environment | Grid-based environment with obstacles       |
| Actuators   | Agent movement and visualization            |
| Sensors     | Grid state, node detection                  |

---

## 🧠 ODESDA Analysis

| Element                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| Observability          | Fully Observable                                          |
| Determinism            | Deterministic                                             |
| Episodic / Sequential  | Sequential                                                |
| Static / Dynamic       | Static                                                    |
| Discrete / Continuous  | Discrete                                                  |
| Agent Type             | Single-Agent                                              |

---

## 🎮 Features

* 🎯 Multiple pathfinding algorithms:

  * BFS
  * DFS
  * UCS (equivalent to Dijkstra)
  * DLS
  * IDS
  * Bidirectional Search
  * Greedy Best-First Search
  * A*

* 🧍 Character-based visualization

* 🌳 Interactive obstacle drawing

* ⚡️ Real-time animation

* 📊 Algorithm comparison panel

* 🎨 Cyberpunk / Neon UI

---

## 🧱 Tech Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui + Radix UI

---

## 📂 Project Structure
```
app/                # App Router
components/         # UI and main visualizer
components/ui/      # Reusable shadcn components
lib/                # Pathfinding algorithms logic
hooks/              # Custom React hooks
public/             # Runtime assets
assets/             # Source assets
```
---

## 🚀 Installation & Running

### Using npm

```bash id="2m3v7k"
npm install
npm run dev
```
---

### Using pnpm

```bash id="6s8t1n"
npm install -g pnpm 
pnpm -v 
pnpm i 
pnpm dev
```
---

### Open in browser
```
http://localhost:3000
```
---

## ▶️ How to Use

1. Select the Start Node (character)
2. Select the Goal Node (treasure)
3. Draw obstacles (trees)
4. Choose an algorithm
5. Run the simulation

---

## 📊 Algorithms Comparison

The application provides a comparison view including:

* Path length
* Explored nodes
* Execution time
* Efficiency

---

## 🌍 Live Demo

🔗 Live Demo:
*https://searchscape1.netlify.app/*

---

## 📌 Future Improvements

* Add Dijkstra explicitly in UI
* Save/load grid state
* Add sound effects
* Improve mobile responsiveness

---

## 👩‍💻 Author

Developed as an educational AI visualization project.

---

## ⭐️ Support

If you like this project, consider giving it a star ⭐️ on GitHub!
