export const extractImports = (code: string, filePath: string): string[] => {
  const IMPORT_REGEX = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
  const imports: string[] = [];
  let match;
  while ((match = IMPORT_REGEX.exec(code)) !== null) {
    const importPath = match[1];
    // Only resolve relative imports (skip node_modules)
    if (importPath.startsWith('.')) {
      const resolved = resolveRelativePath(filePath, importPath);
      imports.push(resolved);
    }
  }
  return imports;
};

const resolveRelativePath = (from: string, to: string): string => {
  const fromDir = from.substring(0, from.lastIndexOf('/'));
  const parts = fromDir ? fromDir.split('/') : [];
  const toParts = to.split('/');

  for (const part of toParts) {
    if (part === '..') parts.pop();
    else if (part !== '.') parts.push(part);
  }

  // Extensions might be missing in imports (e.g. import './App' instead of './App.tsx')
  // We'll return the base path without extension and try to match it later.
  return parts.join('/');
};
