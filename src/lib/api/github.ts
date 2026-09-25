import { Octokit } from 'octokit';
import { GitNode } from '@/types';

// Ignore list
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

const isIgnored = (path: string): boolean => {
  return IGNORED_PATHS.some((ignored) => path === ignored || path.startsWith(`${ignored}/`));
};

export const fetchRepoData = async (repoUrl: string): Promise<GitNode[]> => {
  // Parse URL: https://github.com/owner/repo
  const urlParts = repoUrl.replace('https://github.com/', '').split('/');
  if (urlParts.length < 2) {
    throw new Error('Invalid GitHub repository URL.');
  }

  const owner = urlParts[0];
  const repo = urlParts[1].replace('.git', '');
  
  // Note: in a real app, you might want a way to input PAT from UI. 
  // For now, we will just use unauthenticated requests unless process.env.GITHUB_TOKEN is provided.
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN || undefined,
  });

  try {
    // 1. Get default branch
    const repoInfo = await octokit.rest.repos.get({
      owner,
      repo,
    });
    const defaultBranch = repoInfo.data.default_branch;

    // 2. Fetch the git tree recursively
    const treeData = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: '1',
    });

    if (treeData.data.truncated) {
      console.warn('The repository tree is too large and was truncated by GitHub API.');
    }

    // 3. Filter and map data
    const nodes: GitNode[] = treeData.data.tree
      .filter((node) => node.path && !isIgnored(node.path))
      .map((node) => ({
        path: node.path as string,
        mode: node.mode as string,
        type: node.type as 'tree' | 'blob',
        sha: node.sha as string,
        size: node.size,
        url: node.url as string,
      }));

    return nodes;
  } catch (error: any) {
    if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a Personal Access Token.');
    }
    if (error.status === 404) {
      throw new Error('Repository not found. Make sure it is public or you have access.');
    }
    throw new Error(error.message || 'Error fetching repository data.');
  }
};
