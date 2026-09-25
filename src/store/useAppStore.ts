import { create } from 'zustand';
import { BuildingBlock, FileMetadata } from '@/types';
import { fetchRepoData, fetchRecentCommitsFiles, fetchFileMetadata } from '@/lib/api/github';
import { buildHierarchy } from '@/lib/parsers/buildHierarchy';
import { generateLayout } from '@/lib/math/layoutGenerator';

interface AppState {
  repoUrl: string;
  repoData: BuildingBlock[] | null;
  isLoading: boolean;
  error: string | null;
  hoveredBlock: BuildingBlock | null;
  setHoveredBlock: (block: BuildingBlock | null) => void;
  fetchData: (url: string) => Promise<void>;
  fetchMetadataForBlock: (block: BuildingBlock) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  repoUrl: '',
  repoData: null,
  isLoading: false,
  error: null,
  hoveredBlock: null,

  setHoveredBlock: (block) => set({ hoveredBlock: block }),

  fetchData: async (url: string) => {
    set({ isLoading: true, error: null, repoUrl: url, hoveredBlock: null, repoData: null });
    
    try {
      // 1. Fetch from GitHub API
      const gitNodes = await fetchRepoData(url);
      
      // 2. Build Tree Hierarchy
      const hierarchy = buildHierarchy(gitNodes);
      
      // 3. Generate 3D Layout using D3 Treemap
      let buildingBlocks = generateLayout(hierarchy);

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
      
      set({ repoData: buildingBlocks, isLoading: false });
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
  }
}));
