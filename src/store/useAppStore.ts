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

  // Phase 4 states
  viewMode: 'fly' | 'walk';
  setViewMode: (mode: 'fly' | 'walk') => void;

  // Phase 5 states
  isCinematic: boolean;
  toggleCinematic: () => void;

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

  viewMode: 'fly',
  setViewMode: (mode) => set({ viewMode: mode, isCinematic: false }), // disable cinematic on view switch

  isCinematic: false,
  toggleCinematic: () => set(state => ({ isCinematic: !state.isCinematic, viewMode: 'fly' })), // switch to fly mode when cinematic

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
        weather: 'clear' // Reset weather on new repo
      });

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
