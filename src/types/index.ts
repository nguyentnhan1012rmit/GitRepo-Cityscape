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

export interface FileMetadata {
  lastCommitDate?: string;
  author?: string;
  isRecent?: boolean; // True if edited in the last X commits
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
    metadata?: FileMetadata;
    [key: string]: any;
  };
}
