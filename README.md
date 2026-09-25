# 🏙️ GitRepo Cityscape

GitRepo Cityscape is an interactive, 3D data visualization tool that transforms any GitHub repository into a living, breathing cyberpunk-style city. 

By analyzing the repository's Git Tree, commit history, and GitHub Actions, the application procedurally generates a 3D metropolis where folders are districts, files are skyscrapers, and code complexity determines building shapes.

![GitRepo Cityscape](https://img.shields.io/badge/Status-Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-blue?logo=tailwind-css)

---

## ✨ Key Features

* **Procedural Generation (Phase 1):** Instantly converts any public GitHub repository into a 3D city using Squarified Treemap algorithms (D3) and highly-performant `InstancedMesh` rendering in WebGL.
* **Smart Data Mapping (Phase 2):** 
  * 🔴 **Neon Cyan:** Files that were recently modified.
  * 🌑 **Darkened Buildings:** Legacy code that hasn't been touched in a long time.
  * 👤 **Git Blame:** Hover over any building to instantly see the primary author and last commit date.
* **The Time Machine (Phase 3):** Drag the timeline slider to travel back through the commit history. Watch old buildings collapse and new ones sprout up through smooth tweening animations.
* **Weather System (Phase 3):** Syncs with GitHub Actions. If the latest CI/CD build fails, a thunderstorm rolls over the city!
* **Metaverse & FPV (Phase 4):** Switch to Walk Mode (First-Person View) to drop down to street level and use WASD to explore your code on foot, complete with real Rapier physics. Ghost avatars roam the city, representing other contributors.
* **Issue Tracker Smoke (Phase 4):** Buildings emitting red smoke/fire indicate that the file is currently being modified in an Open Pull Request.
* **Export & 3D Printing (Phase 5):** 
  * 🎥 **Cinematic Auto-Fly:** Automatic camera orbiting for presentations.
  * 📸 **4K Screenshot:** Capture high-res WebGL buffers.
  * 🖨️ **OBJ Export:** Download the entire city as an `.obj` 3D model for Blender rendering or 3D printing.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+
* A GitHub Personal Access Token (PAT) to avoid severe API rate limits.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your GitHub token:
```env
NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the city!

---

## 🛠️ Tech Stack

* **Frontend Framework:** Next.js (App Router, React)
* **3D Engine:** Three.js, `@react-three/fiber`, `@react-three/drei`
* **Physics:** `@react-three/rapier`
* **Data Visualization Algorithms:** `d3-hierarchy`
* **State Management:** `zustand`
* **API:** `octokit` (GitHub API)
* **Styling:** Tailwind CSS

---

## 🔮 Roadmap to "Perfection" (Future Enhancements)

While the core MVP is fully complete, here are the highly recommended steps to turn this project into an enterprise-grade masterpiece:

1. **Web Workers for Heavy Calculation:** Move the D3 Treemap generation and GitHub API parsing into a Web Worker. Currently, rendering a massive repository like `facebook/react` or `torvalds/linux` might cause a brief UI freeze. Offloading this to a background thread will ensure a buttery smooth 60FPS experience at all times.
2. **Server-Side Caching (Redis):** Add a Next.js API route combined with Redis. Instead of having the client directly query the GitHub API, the server fetches it and caches the Treemap layout. This completely eliminates rate limiting if multiple people visit the same repository city.
3. **Web Audio API (Soundscapes):** Add spatial audio. When in Walk Mode, you should hear the wind howling between skyscrapers, low hums near massive files, and thunder crashes during failed build storms.
4. **WebXR (Virtual Reality):** Swap the `PointerLockControls` with `@react-three/xr`. This would allow users to put on a Meta Quest headset and physically walk inside their codebase in Virtual Reality.
5. **True Multiplayer (Supabase Realtime):** Replace the Mock "Ghost Avatars" with actual WebSockets (using Supabase, Socket.io, or Liveblocks). Enable proximity voice chat so developers can walk up to a buggy file and talk to each other about how to fix it!
