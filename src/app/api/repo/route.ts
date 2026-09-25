import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const sha = searchParams.get('sha');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo parameters' }, { status: 400 });
  }

  try {
    // If no SHA is provided, we first need to get the default branch to find the SHA
    let targetSha = sha;
    
    if (!targetSha) {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''}`,
          Accept: 'application/vnd.github.v3+json',
        },
        // We can cache the default branch lookup for 1 hour too
        next: { revalidate: 3600 }
      });
      
      if (!repoRes.ok) throw new Error('Failed to fetch repo info');
      const repoData = await repoRes.json();
      targetSha = repoData.default_branch;
    }

    // Fetch the git tree using Next.js powerful data cache
    // This effectively acts like Redis: the result is cached on the server for 3600 seconds (1 hour).
    // Subsequent users loading the same repository will instantly get the cached response,
    // bypassing the GitHub API entirely and protecting our rate limits!
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${targetSha}?recursive=1`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!treeRes.ok) {
      if (treeRes.status === 403) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 403 });
      if (treeRes.status === 404) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      throw new Error('Failed to fetch tree');
    }

    const treeData = await treeRes.json();

    return NextResponse.json({ tree: treeData.tree, truncated: treeData.truncated, sha: targetSha });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
