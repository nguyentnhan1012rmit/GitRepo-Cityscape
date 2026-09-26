'use client';
import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchFileContent } from '@/lib/api/github';
import { X, FileCode } from 'lucide-react';

export const CodePreview = () => {
  const inspectedBlock = useAppStore(state => state.inspectedBlock);
  const inspectBlock = useAppStore(state => state.inspectBlock);
  const repoUrl = useAppStore(state => state.repoUrl);
  const timelineCommits = useAppStore(state => state.timelineCommits);
  const currentCommitIndex = useAppStore(state => state.currentCommitIndex);
  
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inspectedBlock && inspectedBlock.type === 'blob') {
      setIsLoading(true);
      const sha = timelineCommits[currentCommitIndex]?.sha;
      fetchFileContent(repoUrl, inspectedBlock.id, sha).then(content => {
        setCode(content);
        setIsLoading(false);
      });
    } else {
      setCode(null);
    }
  }, [inspectedBlock, repoUrl, currentCommitIndex, timelineCommits]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') inspectBlock(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectBlock]);

  if (!inspectedBlock || inspectedBlock.type !== 'blob') return null;

  return (
    <div className="absolute top-20 right-4 w-[400px] glass-panel z-50 flex flex-col max-h-[70vh] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2 overflow-hidden pr-4">
          <FileCode size={16} className="text-[var(--neon-cyan)] shrink-0" />
          <h3 className="text-sm font-mono text-gray-200 truncate">{inspectedBlock.name}</h3>
        </div>
        <button 
          onClick={() => inspectBlock(null)}
          className="text-gray-500 hover:text-[var(--neon-cyan)] transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#050510]/80 backdrop-blur-md">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="text-gray-500 text-sm animate-pulse">Fetching source code...</span>
          </div>
        ) : code ? (
          <pre className="text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto">
            <code>
              {code.split('\n').slice(0, 100).join('\n')}
              {code.split('\n').length > 100 && '\n\n... (file truncated to 100 lines) ...'}
            </code>
          </pre>
        ) : (
          <div className="text-gray-500 text-sm py-4 text-center">Failed to load content</div>
        )}
      </div>
      <div className="px-4 py-2 text-[10px] text-gray-500 font-mono border-t border-white/5 flex justify-between bg-black/20">
        <span className="truncate max-w-[200px]" title={inspectedBlock.id}>{inspectedBlock.id}</span>
        <span>{(inspectedBlock.userData.size || 0).toLocaleString()} bytes</span>
      </div>
    </div>
  );
};
