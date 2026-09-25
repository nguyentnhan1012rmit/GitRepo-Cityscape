# GitRepo Cityscape v3.0: The Perfection Roadmap

This document outlines the architectural blueprints and implementation steps for upgrading GitRepo Cityscape to a highly scalable, immersive, and enterprise-grade Metaverse application.

---

## 🚀 Phase 6: Extreme Performance (Web Workers)
Currently, calculating the D3 Treemap layout for repositories with over 5,000 files blocks the React main thread, causing temporary UI freezes.

**Goal:** Offload heavy math to a background thread.
**Libraries:** Native Web Worker API (or `comlink` for easier typings).

### Implementation Steps:
1. **Create the Worker:** Create `src/lib/workers/layoutWorker.ts`. Move the `buildHierarchy` and `generateLayout` functions into this file.
2. **Setup Listener:** In the worker, listen for `self.onmessage` containing the raw `GitNode[]` array, run the layout generation, and `postMessage` the final `BuildingBlock[]` back.
3. **Update Store:** In `src/store/useAppStore.ts`, instantiate the worker (`new Worker(new URL('@/lib/workers/layoutWorker.ts', import.meta.url))`). Send the data to the worker and await the response before setting `repoData`.

---

## 💾 Phase 7: Rate-Limit Immunity (Redis Caching)
Relying on client-side GitHub API calls drains Personal Access Tokens quickly. 

**Goal:** Cache repository trees server-side so subsequent visitors load the city instantly without hitting GitHub.
**Libraries:** `@upstash/redis` (Serverless Redis) or `ioredis`.

### Implementation Steps:
1. **Create API Route:** Create a Next.js API route at `src/app/api/repo/route.ts`.
2. **Server-Side Fetch:** Move the Octokit `getTree` logic from the frontend to this API route.
3. **Redis Integration:** Before fetching from GitHub, check Redis: `redis.get(repoPath)`. If it exists, return it. If not, fetch from GitHub, stringify it, and `redis.setex(repoPath, 3600, data)` (Cache for 1 hour).
4. **Client Update:** Modify `src/lib/api/github.ts` to call your new `/api/repo?url=...` instead of hitting GitHub directly.

---

## 🎧 Phase 8: Immersive Soundscapes (Spatial Audio)
A silent city feels lifeless. We need ambient noise that changes based on location and weather.

**Goal:** Implement 3D spatial audio.
**Libraries:** Native Web Audio API via `@react-three/drei`'s `<PositionalAudio>`.

### Implementation Steps:
1. **Asset Loading:** Procure MP3/OGG files for wind, server hums, and thunder.
2. **Weather Sounds:** In `WeatherSystem` (`CityScene.tsx`), trigger a Thunder audio clip randomly whenever the lighting flashes.
3. **Building Hums:** Attach a `<PositionalAudio loop url="/server-hum.mp3" distance={5} />` to large building blocks (e.g., blocks where `size > 100000`). When in Walk Mode, walking near massive files will emit a deep humming sound.

---

## 🥽 Phase 9: Virtual Reality (WebXR)
Take the First-Person View to the next level by allowing users to physically step into their code.

**Goal:** Full Meta Quest / WebVR support.
**Libraries:** `@react-three/xr`.

### Implementation Steps:
1. **Wrap Canvas:** Wrap your `<Canvas>` with `<XR>` and add a `<VRButton>` to the UI.
2. **Controllers:** Add `<Controllers />` and `<Hands />` inside the scene.
3. **Movement:** Implement Teleportation or smooth locomotion using `useXR`. Swap out the current `PointerLockControls` for XR controls when a VR session is active.

---

## 🌐 Phase 10: True Metaverse (Supabase Realtime)
Replace the Mock AI bots with real human collaborators.

**Goal:** Sync real-time positions and rotations of all developers currently viewing the same repository.
**Libraries:** `@supabase/supabase-js` (Specifically the Broadcast / Realtime features).

### Implementation Steps:
1. **Supabase Setup:** Create a Supabase project and enable Realtime Channels.
2. **Broadcast Loop:** In `Player.tsx`, add a `setInterval` (approx 15 ticks per second) that reads the player's current XYZ position and Y-rotation, and broadcasts it to a Supabase Channel named `repo-${repoName}`.
3. **Receive & Render:** Create a `<MultiplayerSystem>` component that subscribes to the channel. It maintains a state of active peers and their coordinates.
4. **Lerp Avatars:** Render `<Avatar>` components for each peer. Use `useFrame` to smoothly lerp (interpolate) their positions between network updates so they don't stutter.
