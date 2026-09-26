import * as d3 from 'd3-hierarchy';
import { HierarchyNode, BuildingBlock } from '@/types';

const TOTAL_WIDTH = 100;
const TOTAL_DEPTH = 100;
const HEIGHT_SCALE_FACTOR = 1.5;

const getFileColor = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '#3178c6'; // Blue
    case 'js':
    case 'jsx':
      return '#f7df1e'; // Yellow
    case 'json':
      return '#000000'; // Black
    case 'css':
    case 'scss':
      return '#1572b6'; // Dark blue
    case 'html':
      return '#e34f26'; // Orange
    case 'md':
      return '#ffffff'; // White
    case 'py':
      return '#3776ab'; // Python Blue
    case 'rs':
      return '#dea584'; // Rust
    case 'go':
      return '#00add8'; // Go cyan
    default:
      return '#888888'; // Grey for unknown
  }
};

export const generateLayout = (rootNode: HierarchyNode): BuildingBlock[] => {
  // Create D3 Hierarchy
  const hierarchy = d3
    .hierarchy(rootNode)
    .sum((d) => (d.type === 'blob' ? d.size : 0)) // d3 uses the leaf sizes to compute area
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  // Initialize Treemap
  const treemap = d3
    .treemap<HierarchyNode>()
    .size([TOTAL_WIDTH, TOTAL_DEPTH])
    .paddingInner(1)
    .paddingOuter(2)
    .round(true);

  // Apply Treemap layout
  const rootTree = treemap(hierarchy);

  const blocks: BuildingBlock[] = [];

  // Traverse and convert to 3D Blocks
  rootTree.each((node) => {
    // Skip the absolute root if you want, but it's a folder, let's keep it as the floor
    
    const width = node.x1 - node.x0;
    const depth = node.y1 - node.y0;
    
    // D3 coordinates are top-left based (2D). 
    // Three.js coordinates are center-based (3D).
    const x = node.x0 + width / 2 - TOTAL_WIDTH / 2;
    const z = node.y0 + depth / 2 - TOTAL_DEPTH / 2;
    
    let height = 0.5; // Default for folders
    let y = 0; // Ground level for folders
    let color = '#333333'; // Default folder color

    if (node.data.type === 'blob') {
      // Calculate height based on log of size, ensuring minimum height
      height = Math.max(1, Math.log(node.data.size > 0 ? node.data.size : 1) * HEIGHT_SCALE_FACTOR);
      y = 0; // It will be shifted up by height/2 in the instanced mesh logic
      color = getFileColor(node.data.name);
    }

    blocks.push({
      id: node.data.path || 'root',
      name: node.data.name,
      type: node.data.type,
      x,
      y,
      z,
      width,
      depth,
      height,
      color,
      userData: {
        path: node.data.path,
        size: node.data.size,
        extension: node.data.type === 'blob' ? node.data.name.split('.').pop() : undefined,
      },
    });
  });

  return blocks;
};
