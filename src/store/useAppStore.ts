import { create } from 'zustand';
import { BuildingBlock, FileMetadata } from '@/types';
import { fetchRepoData, fetchRecentCommitsFiles, fetchFileMetadata } from '@/lib/api/github';

const generateLayoutWithWorker = (gitNodes: any[]): Promise<BuildingBlock[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../lib/workers/layoutWorker.ts', import.meta.url));
    worker.onmessage = (e) => {
      if (e.data.success) resolve(e.data.buildingBlocks);
      else reject(new Error(e.data.error));
      worker.terminate();
    };
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
    worker.postMessage({ gitNodes });
  });
};

interface AppState {
  repoUrl: string;
  repoData: BuildingBlock[] | null;
  isLoading: boolean;
  error: string | null;
  hoveredBlock: BuildingBlock | null;
  
  // Phase 3 states
  timelineCommits: { sha: string; message: string; date?: string; author?: string }[];
  currentCommitIndex: number;
  weather: 'clear' | 'storm' | 'unknown';
  
  isReplaying: boolean;
  replaySpeed: number;
  startReplay: () => void;
  stopReplay: () => void;
  setReplaySpeed: (speed: number) => void;

  dependencyEdges: { source: BuildingBlock; target: BuildingBlock }[];
  showDependencies: boolean;
  toggleDependencies: () => void;
  fetchDependencies: () => Promise<void>;

  summaryCache: Record<string, string>;
  fetchSummary: (block: BuildingBlock) => Promise<void>;

  // Phase 4 states
  viewMode: 'fly' | 'walk';
  setViewMode: (mode: 'fly' | 'walk') => void;

  // Phase 5 states
  isCinematic: boolean;
  toggleCinematic: () => void;

  selectedBlock: BuildingBlock | null;
  cameraTarget: { x: number; y: number; z: number } | null;
  selectBlock: (block: BuildingBlock | null) => void;

  isMuted: boolean;
  toggleMute: () => void;

  inspectedBlock: BuildingBlock | null;
  inspectBlock: (block: BuildingBlock | null) => void;

  timeOfDay: 'night' | 'day';
  setTimeOfDay: (t: 'night' | 'day') => void;

  setHoveredBlock: (block: BuildingBlock | null) => void;
  fetchData: (url: string) => Promise<void>;
  fetchMetadataForBlock: (block: BuildingBlock) => Promise<void>;
  setTimeMachineIndex: (index: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  repoUrl: '',
  repoData: null,
  isLoading: false,
  error: null,
  hoveredBlock: null,

  timelineCommits: [],
  currentCommitIndex: 0,
  weather: 'clear',

  isReplaying: false,
  replaySpeed: 1,
  startReplay: () => {
    const { timelineCommits } = get();
    if (timelineCommits.length === 0) return;
    set({
      isReplaying: true,
      currentCommitIndex: timelineCommits.length - 1 // Start from oldest
    });
  },
  stopReplay: () => set({ isReplaying: false }),
  setReplaySpeed: (speed) => set({ replaySpeed: speed }),

  dependencyEdges: [],
  showDependencies: false,
  toggleDependencies: () => set(state => ({ showDependencies: !state.showDependencies })),
  fetchDependencies: async () => {
    const { repoUrl, repoData, timelineCommits, currentCommitIndex } = get();
    if (!repoData) return;

    set({ showDependencies: true });

    // Limit to top 20 JS/TS files by size to prevent rate limiting / massive lag
    const jsFiles = repoData
      .filter(b => b.type === 'blob' && (b.id.endsWith('.js') || b.id.endsWith('.jsx') || b.id.endsWith('.ts') || b.id.endsWith('.tsx')))
      .sort((a, b) => (b.userData.size || 0) - (a.userData.size || 0))
      .slice(0, 30);

    if (jsFiles.length === 0) return;

    const { fetchFileContent } = await import('@/lib/api/github');
    const { extractImports } = await import('@/lib/parsers/importResolver');
    const sha = timelineCommits[currentCommitIndex]?.sha;
    
    const edges: { source: BuildingBlock; target: BuildingBlock }[] = [];

    // Promise.all to fetch them in parallel
    await Promise.all(jsFiles.map(async (sourceBlock) => {
      const code = await fetchFileContent(repoUrl, sourceBlock.id, sha);
      if (!code) return;

      const imports = extractImports(code, sourceBlock.id);
      
      imports.forEach(importPath => {
        // Find matching block (importPath usually lacks extension)
        const targetBlock = repoData.find(b => 
          b.type === 'blob' && 
          b.id.startsWith(importPath) && 
          (b.id === importPath + '.ts' || b.id === importPath + '.tsx' || b.id === importPath + '.js' || b.id === importPath + '.jsx' || b.id === importPath + '/index.ts' || b.id === importPath + '/index.js')
        );
        if (targetBlock) {
          edges.push({ source: sourceBlock, target: targetBlock });
        }
      });
    }));

    set({ dependencyEdges: edges });
  },

  summaryCache: {},
  fetchSummary: async (block: BuildingBlock) => {
    const { repoUrl, summaryCache, timelineCommits, currentCommitIndex } = get();
    if (block.type !== 'blob' || summaryCache[block.id]) return;

    // Set a temporary "Loading" state so we don't refetch
    set(state => ({ summaryCache: { ...state.summaryCache, [block.id]: '...' } }));

    try {
      const sha = timelineCommits[currentCommitIndex]?.sha;
      const { fetchFileContent } = await import('@/lib/api/github');
      const code = await fetchFileContent(repoUrl, block.id, sha);
      if (!code) throw new Error('No code found');

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename: block.id }),
      });
      const data = await res.json();
      set(state => ({ summaryCache: { ...state.summaryCache, [block.id]: data.summary } }));
    } catch (e) {
      set(state => ({ summaryCache: { ...state.summaryCache, [block.id]: 'Failed to generate summary.' } }));
    }
  },

  viewMode: 'fly',
  setViewMode: (mode) => set({ viewMode: mode, isCinematic: false }), // disable cinematic on view switch

  isCinematic: false,
  toggleCinematic: () => set(state => ({ isCinematic: !state.isCinematic, viewMode: 'fly' })), // switch to fly mode when cinematic

  selectedBlock: null,
  cameraTarget: null,
  selectBlock: (block) => {
    if (block) {
      set({
        selectedBlock: block,
        cameraTarget: { x: block.x, y: block.height + 10, z: block.z + 30 }
      });
    } else {
      set({ selectedBlock: null, cameraTarget: null });
    }
  },

  isMuted: false,
  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),

  inspectedBlock: null,
  inspectBlock: (block) => set({ inspectedBlock: block }),

  timeOfDay: 'night',
  setTimeOfDay: (t) => set({ timeOfDay: t }),

  setHoveredBlock: (block) => set({ hoveredBlock: block }),

  fetchData: async (url: string) => {
    set({ isLoading: true, error: null, repoUrl: url, hoveredBlock: null, repoData: null });
    
    try {
      // 1. Fetch from GitHub API
      const gitNodes = await fetchRepoData(url);
      
      // 2 & 3. Build Hierarchy and Generate Layout via Web Worker
      let buildingBlocks = await generateLayoutWithWorker(gitNodes);

      // 4. Fetch recent commits to mark "Neon" hot files
      // Do this non-blockingly or blockingly? Let's do it blockingly for MVP
      const recentFiles = await fetchRecentCommitsFiles(url, 15); // Last 15 commits

      buildingBlocks = buildingBlocks.map(block => {
        if (block.type === 'blob' && recentFiles[block.id]) {
          return {
            ...block,
            userData: {
              ...block.userData,
              metadata: recentFiles[block.id]
            }
          };
        }
        return block;
      });
      
      set({ 
        repoData: buildingBlocks, 
        isLoading: false,
        weather: 'clear', // Reset weather on new repo
        dependencyEdges: [],
        showDependencies: false,
        summaryCache: {}
      });

      if (typeof window !== 'undefined') {
        const shortUrl = url.replace('https://github.com/', '');
        window.history.replaceState(null, '', `/?repo=${shortUrl}`);
      }

      // Lazy load timeline history and issues
      import('@/lib/api/github').then(({ fetchCommitHistory, fetchOpenPRFiles }) => {
        // 1. Timeline
        fetchCommitHistory(url, 30).then((commits) => {
          set({ timelineCommits: commits, currentCommitIndex: 0 });
        });
        
        // 2. Open PRs (Issues)
        fetchOpenPRFiles(url).then((issueFiles) => {
          if (issueFiles.size > 0) {
            set((state) => {
              if (!state.repoData) return state;
              const newData = state.repoData.map(block => {
                if (issueFiles.has(block.id)) {
                  return { ...block, userData: { ...block.userData, metadata: { ...block.userData.metadata, hasIssues: true } } };
                }
                return block;
              });
              return { repoData: newData };
            });
          }
        });
      });

    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch repository data', isLoading: false });
    }
  },

  fetchMetadataForBlock: async (block: BuildingBlock) => {
    // If it already has metadata, don't fetch again
    if (block.userData.metadata || block.type === 'tree') return;

    const { repoUrl, repoData } = get();
    const metadata = await fetchFileMetadata(repoUrl, block.id);
    
    if (metadata && repoData) {
      const newData = repoData.map(b => 
        b.id === block.id 
          ? { ...b, userData: { ...b.userData, metadata } } 
          : b
      );
      set({ repoData: newData });
      
      // Also update hovered block if it's the current one
      const currentHover = get().hoveredBlock;
      if (currentHover && currentHover.id === block.id) {
        set({ hoveredBlock: newData.find(b => b.id === block.id) || null });
      }
    }
  },

  setTimeMachineIndex: async (index: number) => {
    const { timelineCommits, repoUrl } = get();
    if (!timelineCommits[index]) return;
    
    set({ currentCommitIndex: index, isLoading: true });
    
    const targetCommit = timelineCommits[index];
    const { fetchTreeBySha, fetchWorkflowStatus } = await import('@/lib/api/github');
    
    try {
      const gitNodes = await fetchTreeBySha(repoUrl, targetCommit.sha);
      let buildingBlocks = await generateLayoutWithWorker(gitNodes);
      
      const status = await fetchWorkflowStatus(repoUrl, targetCommit.sha);
      const weather = status === 'failure' ? 'storm' : (status === 'success' ? 'clear' : 'unknown');
      
      set({ repoData: buildingBlocks, weather, isLoading: false });
    } catch (e) {
      console.warn("Time machine failed:", e);
      set({ isLoading: false });
    }
  }
}));
