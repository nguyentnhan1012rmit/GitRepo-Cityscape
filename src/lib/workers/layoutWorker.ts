import { buildHierarchy } from '../parsers/buildHierarchy';
import { generateLayout } from '../math/layoutGenerator';
import { GitNode } from '@/types';

self.onmessage = (event: MessageEvent<{ gitNodes: GitNode[] }>) => {
  try {
    const { gitNodes } = event.data;
    
    // 1. Parse flat array into nested tree
    const hierarchy = buildHierarchy(gitNodes);
    
    // 2. Generate 3D Building Blocks via D3 Treemap
    const buildingBlocks = generateLayout(hierarchy);
    
    // Send the processed blocks back to the main thread
    self.postMessage({ success: true, buildingBlocks });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
