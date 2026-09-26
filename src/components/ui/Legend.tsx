'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FILE_COLOR_MAP } from '@/lib/math/layoutGenerator';
import { Palette } from 'lucide-react';

export const Legend = () => {
  const repoData = useAppStore(state => state.repoData);

  // Only show extensions that exist in the current city
  const activeExtensions = useMemo(() => {
    if (!repoData) return [];
    const exts = new Set<string>();
    repoData.forEach(block => {
      if (block.userData.extension) exts.add(block.userData.extension);
    });
    return Array.from(exts)
      .filter(ext => FILE_COLOR_MAP[ext])
      .sort();
  }, [repoData]);

  if (!repoData || activeExtensions.length === 0) return null;

  return (
    <div className="absolute bottom-5 left-4 z-20 glass-panel p-3 max-h-64 overflow-y-auto w-64">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
        <Palette size={12} className="text-[var(--neon-cyan)]" />
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
          Building Colors
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {activeExtensions.map(ext => (
          <div key={ext} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm border border-white/10 shrink-0"
              style={{ backgroundColor: FILE_COLOR_MAP[ext].color }}
            />
            <span className="text-[10px] text-gray-400 font-mono w-10">.{ext}</span>
            <span className="text-[10px] text-gray-600 truncate">
              {FILE_COLOR_MAP[ext].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
