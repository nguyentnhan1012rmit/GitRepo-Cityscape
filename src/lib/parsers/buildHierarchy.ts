import { GitNode, HierarchyNode } from '@/types';

export const buildHierarchy = (nodes: GitNode[]): HierarchyNode => {
  const root: HierarchyNode = {
    name: 'root',
    path: '',
    type: 'tree',
    size: 0,
    children: [],
  };

  const map = new Map<string, HierarchyNode>();
  map.set('', root);

  // First, create all nodes and put them in the map
  nodes.forEach((node) => {
    const name = node.path.split('/').pop() || node.path;
    const hierarchyNode: HierarchyNode = {
      name,
      path: node.path,
      type: node.type,
      size: node.size || 0,
    };
    
    if (node.type === 'tree') {
      hierarchyNode.children = [];
    }

    map.set(node.path, hierarchyNode);
  });

  // Then, build the tree structure
  nodes.forEach((node) => {
    const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
    const parent = map.get(parentPath);
    const child = map.get(node.path);

    if (parent && parent.children && child) {
      parent.children.push(child);
    }
  });

  // Finally, recursively compute size for trees
  const computeSize = (node: HierarchyNode): number => {
    if (node.type === 'blob') {
      return node.size;
    }
    
    let totalSize = 0;
    if (node.children) {
      node.children.forEach((child) => {
        totalSize += computeSize(child);
      });
    }
    
    node.size = totalSize;
    return totalSize;
  };

  computeSize(root);

  return root;
};
