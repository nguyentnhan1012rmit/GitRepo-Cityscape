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
      // Small delay to prevent fetching when just sweeping across many buildings quickly
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

  return (
    <div 
      className="absolute z-20 pointer-events-none bg-black/85 text-white p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 w-64"
      style={{
        left: `${mousePos.x + 15}px`,
        top: `${mousePos.y + 15}px`,
        transform: 'translate(0, 0)', // basic offset
      }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="font-bold text-[15px] truncate" style={{ color: meta?.isRecent ? '#00ffcc' : hoveredBlock.color }}>
          {hoveredBlock.name}
        </p>
        <p className="text-xs text-gray-400 font-mono opacity-90 truncate pb-2 border-b border-white/10">
          {hoveredBlock.id}
        </p>
        
        {meta && (
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Mayor (Author)</span>
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">{meta.author}</span>
            </div>
            {meta.lastCommitDate && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Last Modified</span>
                <span className="text-xs text-gray-300">{new Date(meta.lastCommitDate).toLocaleDateString()}</span>
              </div>
            )}
            {meta.isRecent && (
              <div className="mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="text-xs text-teal-400 font-bold tracking-wide">HOT FILE (RECENT)</span>
              </div>
            )}
          </div>
        )}

        {!meta && hoveredBlock.type === 'blob' && (
           <p className="text-xs text-gray-500 italic animate-pulse mt-1">Fetching metadata...</p>
        )}

        <div className="flex gap-4 mt-2 pt-2 border-t border-white/20">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-gray-300">
            {hoveredBlock.type}
          </span>
          {hoveredBlock.userData.size !== undefined && (
             <span className="text-xs text-gray-400 font-medium">
               Size: <strong className="text-white">{formatSize(hoveredBlock.userData.size)}</strong>
             </span>
          )}
        </div>
      </div>
    </div>
  );
};
