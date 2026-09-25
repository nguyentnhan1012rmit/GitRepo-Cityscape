export interface GitNode {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface HierarchyNode {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  size: number;
  children?: HierarchyNode[];
}

export interface BuildingBlock {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  userData: {
    size?: number;
    extension?: string;
    [key: string]: any;
  };
}
