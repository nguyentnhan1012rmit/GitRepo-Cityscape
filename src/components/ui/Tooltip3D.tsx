'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const Tooltip3D = () => {
  const hoveredBlock = useAppStore((state) => state.hoveredBlock);
  const fetchMetadataForBlock = useAppStore((state) => state.fetchMetadataForBlock);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (hoveredBlock && hoveredBlock.type === 'blob' && !hoveredBlock.userData.metadata) {
      const timer = setTimeout(() => {
        fetchMetadataForBlock(hoveredBlock);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hoveredBlock, fetchMetadataForBlock]);

  if (!hoveredBlock) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const meta = hoveredBlock.userData.metadata;

  // Clamp tooltip position to avoid going off-screen
  const tooltipWidth = 280;
  const tooltipHeight = 200;
  const x = Math.min(mousePos.x + 15, window.innerWidth - tooltipWidth - 20);
  const y = Math.min(mousePos.y + 15, window.innerHeight - tooltipHeight - 20);

  return (
    <div 
      className="absolute z-50 pointer-events-none glass-panel p-4 w-[280px] scanline-bg"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        borderColor: meta?.isRecent ? 'rgba(0, 240, 255, 0.4)' : meta?.hasIssues ? 'rgba(255, 59, 59, 0.4)' : undefined,
      }}
    >
      <div className="flex flex-col gap-2 relative z-10">
        {/* File name */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{hoveredBlock.type === 'tree' ? '📁' : '🏢'}</span>
          <p 
            className="font-bold text-sm truncate" 
            style={{ 
              color: meta?.isRecent ? 'var(--neon-cyan)' : meta?.hasIssues ? 'var(--neon-red)' : hoveredBlock.color,
              textShadow: meta?.isRecent ? '0 0 8px rgba(0,240,255,0.4)' : 'none'
            }}
          >
            {hoveredBlock.name}
          </p>
        </div>

        {/* Path */}
        <p className="text-[10px] text-gray-500 font-mono truncate pb-2 border-b border-white/5">
          {hoveredBlock.id}
        </p>
        
        {/* Git blame info */}
        {meta && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mayor</span>
              <span className="text-xs font-semibold text-gray-200 truncate max-w-[140px] font-mono">{meta.author}</span>
            </div>
            {meta.lastCommitDate && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last Touch</span>
                <span className="text-xs text-gray-400 font-mono">{new Date(meta.lastCommitDate).toLocaleDateString()}</span>
              </div>
            )}
            {meta.isRecent && (
              <div className="mt-1 flex items-center gap-2 bg-[rgba(0,240,255,0.08)] px-2 py-1 rounded-md border border-[rgba(0,240,255,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                <span className="text-[10px] text-[var(--neon-cyan)] font-bold tracking-widest uppercase">HOT FILE</span>
              </div>
            )}
            {meta.hasIssues && (
              <div className="mt-1 flex items-center gap-2 bg-[rgba(255,59,59,0.08)] px-2 py-1 rounded-md border border-[rgba(255,59,59,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-red)] animate-pulse" />
                <span className="text-[10px] text-[var(--neon-red)] font-bold tracking-widest uppercase">OPEN PR</span>
              </div>
            )}
          </div>
        )}

        {!meta && hoveredBlock.type === 'blob' && (
          <p className="text-[10px] text-gray-600 italic animate-pulse mt-1 font-mono">Scanning metadata...</p>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
            {hoveredBlock.type === 'tree' ? 'DISTRICT' : 'BUILDING'}
          </span>
          {hoveredBlock.userData.size !== undefined && (
            <span className="text-[10px] text-gray-500 font-mono">
              {formatSize(hoveredBlock.userData.size)}
            </span>
          )}
          {hoveredBlock.userData.extension && (
            <span className="text-[10px] text-[var(--neon-blue)] font-mono">
              .{hoveredBlock.userData.extension}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
