# MASTER SYSTEM ARCHITECTURE & IMPLEMENTATION ROADMAP
**Project Name:** GitRepo Cityscape
**Target Agent:** Antigravity IDE (hoặc các AI Developer Agents tương đương)
**Version:** 2.0 (Enterprise-Ready Spec)

---

## PHẦN 0: CHỈ THỊ THỰC THI CHO AI AGENT (AGENT INSTRUCTIONS)

1. **Strict Types:** Mọi file phải dùng TypeScript. Không dùng `any`. Định nghĩa toàn bộ interfaces tại `src/types/index.ts`.
2. **Step-by-step:** Triển khai theo từng bước trong Lộ trình. Tuyệt đối không nhảy cóc sang logic 3D nếu Data Layer chưa hoàn thiện.
3. **Performance First:** 
   - Render 3D BẮT BUỘC dùng `THREE.InstancedMesh`. Không dùng mảng các `<mesh>` rời rạc trong vòng lặp.
   - Các phép tính toán tọa độ (Treemap, Math) phải đưa ra khỏi render loop của React (không dùng trong `useFrame` nếu không cần thiết). có thể dùng `useMemo`.
4. **Clean Code:** Tách biệt rõ 3 tầng: API Fetching -> Data Transform -> 3D Rendering.

---

## PHẦN 1: TECH STACK & DEPENDENCIES

### 1.1. Core Tech Stack
* **Framework:** Next.js (App Router, React 18+).
* **Language:** TypeScript.
* **3D Engine:** `three`, `@react-three/fiber` (R3F), `@react-three/drei`.
* **Data Visualization:** `d3-hierarchy` (Squarified Treemap).
* **State Management:** `zustand` (Quản lý Global state: Github url, loading, error, hover node).
* **Styling & UI:** Tailwind CSS, `lucide-react`, `framer-motion`.

### 1.2. Lệnh khởi tạo & Cài đặt (Terminal Commands)
```bash
npx create-next-app@latest cityscape --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd cityscape
npm install three @react-three/fiber @react-three/drei d3-hierarchy zustand octokit framer-motion lucide-react clsx tailwind-merge
npm install -D @types/three @types/d3-hierarchy
```

---

## PHẦN 2: DATA MODELS & STATE MANAGEMENT (ZUSTAND)

### 2.1. TypeScript Interfaces (`src/types/index.ts`)
```typescript
// Dữ liệu thô từ GitHub API
export interface GitNode {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number; // tree sẽ không có size, cần tính tổng từ các blob
  url: string;
}

// Cấu trúc phân cấp sau khi parse (dùng cho d3-hierarchy)
export interface HierarchyNode {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  size: number;
  children?: HierarchyNode[];
}

// Dữ liệu Tòa nhà 3D cuối cùng để render
export interface BuildingBlock {
  id: string; // path của file
  name: string;
  type: 'tree' | 'blob';
  x: number;
  y: number; // vị trí Y
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  userData: object; // chứa metadata như size, extension
}
```

### 2.2. Global State (`src/store/useAppStore.ts`)
Agent cần tạo một Zustand store bao gồm:
* `repoUrl`: string
* `repoData`: BuildingBlock[] | null
* `isLoading`: boolean
* `error`: string | null
* `hoveredBlock`: BuildingBlock | null
* `actions`: `fetchRepoData(url)`, `setHoveredBlock(block)`

---

## PHẦN 3: CORE LOGIC CẦN TRIỂN KHAI

### 3.1. Tầng API (GitHub Fetcher)
* **Endpoint:** `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
* **Xử lý:** Lọc bỏ mảng tĩnh các đường dẫn rác: `node_modules`, `.git`, `.github`, `dist`, `build`, `package-lock.json`, `yarn.lock`.
* **Cảnh báo Rate Limit:** Bắt lỗi 403 từ GitHub API, hiển thị UI yêu cầu user nhập Personal Access Token (PAT).

### 3.2. Tầng Toán học & Bố cục (Treemap Layout)
* Chuyển mảng phẳng (`GitNode[]`) thành cây (`HierarchyNode`). Các thư mục (tree) phải được tính `size` bằng tổng `size` của tất cả file (blob) bên trong nó.
* Khởi tạo `d3.treemap()`:
  * Kích thước tổng sa bàn (vd: `[100, 100]`).
  * Padding: Thêm padding giữa các node để tách biệt các quận (thư mục).
* **Quy đổi tọa độ D3 (2D) sang Three.js (3D):**
  D3 trả về `x0, y0, x1, y1` tính từ góc trên bên trái. Three.js tính từ tâm (0,0,0).
  * `Width = x1 - x0`
  * `Depth = y1 - y0`
  * `X = x0 + Width / 2 - Tổng_Chiều_Rộng / 2`
  * `Z = y0 + Depth / 2 - Tổng_Chiều_Sâu / 2`
  * `Height` = Nếu là blob, `Math.max(1, Math.log(size) * SCALE_FACTOR)`. Nếu là tree, `height = 0.5` (mặt đất/sàn nhà).

### 3.3. Tầng Render 3D (InstancedMesh)
* Agent BẮT BUỘC dùng `THREE.InstancedMesh`.
* Setup `InstancedMesh(geometry, material, count)`.
* Dùng vòng lặp duyệt qua mảng `BuildingBlock[]`, sử dụng một `THREE.Object3D` ẩn (dummy) để tính toán ma trận:
  ```javascript
  const dummy = new THREE.Object3D();
  blocks.forEach((block, i) => {
     dummy.position.set(block.x, block.height / 2, block.z); // Y nâng lên nửa height
     dummy.scale.set(block.width, block.height, block.depth);
     dummy.updateMatrix();
     instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
     // Đổi màu theo extension file
     color.set(block.color); 
     instancedMeshRef.current.setColorAt(i, color);
  });
  instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  instancedMeshRef.current.instanceColor.needsUpdate = true;
  ```

---

## PHẦN 4: CẤU TRÚC COMPONENT CHUẨN (React Tree)

```text
src/
├── app/
│   ├── page.tsx (Chứa layout chính: Sidebar + Canvas)
│   └── layout.tsx
├── components/
│   ├── canvas/
│   │   ├── CityScene.tsx (Canvas, Camera, Lights, Controls)
│   │   ├── InstancedBuildings.tsx (Render logic InstancedMesh)
│   │   └── Effects.tsx (Post-processing: Bloom, SSAO)
│   ├── ui/
│   │   ├── SearchBar.tsx (Nhập URL GitHub)
│   │   ├── Sidebar.tsx (Hiển thị thống kê repo)
│   │   └── Tooltip3D.tsx (HUD hiện thông tin khi hover)
├── lib/
│   ├── api/github.ts (Gọi fetch)
│   ├── parsers/buildHierarchy.ts (Flat array -> Nested tree)
│   └── math/layoutGenerator.ts (D3 treemap -> 3D Building Blocks)
└── store/
    └── useAppStore.ts (Zustand)
```

---

## PHẦN 5: LỘ TRÌNH TRIỂN KHAI PHÁT TRIỂN (LONG-TERM PHASES)

### Phase 1: MVP & Core Visualization (Nền tảng khởi chạy)
* [ ] Setup cấu trúc dự án Next.js & UI cơ bản.
* [ ] Xây dựng GitHub API fetcher và xử lý logic lọc file rác.
* [ ] Cấu hình thuật toán biến đổi D3 Treemap xuất ra Block3D struct.
* [ ] Setup R3F Canvas, Orthographic/Perspective Camera.
* [ ] Triển khai `InstancedMesh` render 10,000+ files không tụt FPS.
* [ ] Gán logic màu sắc: File thư mục (màu xám đậm/sàn), File Code (Xanh/Vàng tùy ngôn ngữ).
* [ ] Tương tác: Thêm `OrbitControls`, Hover Raycaster làm sáng viền và hiện Tooltip thông tin cơ bản.

### Phase 2: Metadata & Smart Data Mapping (Thành phố thông minh)
* [ ] Tích hợp API Git Blame: Lấy số liệu tác giả. Tô màu các tòa nhà theo "Thị trưởng" (Người viết nhiều dòng code nhất trong file đó).
* [ ] Chỉ số "Sức khỏe" (Code Age & Recency): File mới sửa (sáng đèn Neon), file lâu năm không đụng (Material sẫm màu, tối tăm).
* [ ] File Complexity: (Nếu được) Phân tích AST để bóp méo hình dáng tòa nhà (Tòa nhà có cấu trúc lồi lõm nếu code quá phức tạp).

### Phase 3: The Time Machine (Môi trường động)
* [ ] UI Thanh trượt Timeline ở dưới đáy màn hình.
* [ ] Cập nhật API để fetch lịch sử Tree theo từng Commit/Tháng.
* [ ] Animations: Kéo thanh trượt -> Các tòa nhà cũ sụp xuống, tòa nhà mới mọc lên qua hiệu ứng Tweening (Framer Motion 3D / GSAP).
* [ ] Weather System: Nối với API GitHub Actions. Build Pass (Trời trong, Sun light), Build Fail (Trời tối, Sấm chớp - PointLights nhấp nháy ngẫu nhiên).

### Phase 4: Multiplayer & Metaverse (Tương tác thời gian thực)
* [ ] Chế độ First-Person View (FPV): Sử dụng `PointerLockControls`, thêm vật lý (Rapier) để user đi bộ dưới lòng đường giữa các tòa nhà.
* [ ] Tích hợp WebSocket (Supabase/Socket.io): Hiển thị Avatar/Con trỏ của những người dùng khác đang xem cùng một Repo.
* [ ] Hệ thống Issue Tracker: Gắn Particle System (Khói, Lửa) lên đỉnh các tòa nhà chứa file đang có Issue/Bug mở.

### Phase 5: Export & Physical Form
* [ ] Nút Export Screenshot 4K độ phân giải cao.
* [ ] Chế độ Cinematic Auto-Flycam: Camera tự động bay quanh sa bàn.
* [ ] Export ra file STL/OBJ sử dụng `THREE.OBJExporter` để hỗ trợ In 3D vật lý (loại bỏ các chi tiết thừa, gộp mesh).