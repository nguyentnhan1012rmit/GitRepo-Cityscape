import { create } from 'zustand';
import { BuildingBlock } from '@/types';
import { fetchRepoData } from '@/lib/api/github';
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
}

export const useAppStore = create<AppState>((set) => ({
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
      const buildingBlocks = generateLayout(hierarchy);
      
      set({ repoData: buildingBlocks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch repository data', isLoading: false });
    }
  },
}));
