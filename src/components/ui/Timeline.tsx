'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Clock, GitCommit, User } from 'lucide-react';

export const Timeline = () => {
  const commits = useAppStore((state) => state.timelineCommits);
  const currentIndex = useAppStore((state) => state.currentCommitIndex);
  const setTimeMachineIndex = useAppStore((state) => state.setTimeMachineIndex);
  const isLoading = useAppStore((state) => state.isLoading);

  if (!commits || commits.length === 0) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const invertedIndex = commits.length - 1 - val;
    setTimeMachineIndex(invertedIndex);
  };

  const currentCommit = commits[currentIndex];
  const sliderValue = commits.length - 1 - currentIndex;

  return (
    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-3xl px-4 animate-fade-in-up">
      <div className="glass-panel p-4 scanline-bg">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-[var(--neon-cyan)]" />
                <h3 
                  className="font-bold text-xs uppercase tracking-widest neon-text"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Time Machine
                </h3>
                {isLoading && (
                  <span className="text-[10px] font-medium bg-[rgba(0,240,255,0.1)] text-[var(--neon-cyan)] px-2 py-0.5 rounded-full animate-pulse border border-[rgba(0,240,255,0.2)]">
                    TRAVELING
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <GitCommit size={12} className="text-gray-500" />
                <span className="text-[var(--neon-amber)]">{currentCommit?.sha.substring(0, 7)}</span>
                <span className="text-gray-600">—</span>
                <span className="truncate max-w-sm">{currentCommit?.message.split('\n')[0]}</span>
              </div>
            </div>
            <div className="text-right">
              {currentCommit?.author && (
                <div className="flex items-center gap-1.5 text-gray-500 mb-0.5 justify-end">
                  <User size={10} />
                  <span className="text-[10px] font-mono">{currentCommit.author}</span>
                </div>
              )}
              <p className="text-xs font-mono text-gray-300">
                {currentCommit?.date ? new Date(currentCommit.date).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={commits.length - 1}
            step={1}
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={isLoading}
            className="w-full"
          />
          
          {/* Labels */}
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Past</span>
            <span className="text-[10px] text-gray-600 font-mono">
              {sliderValue + 1} / {commits.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--neon-cyan)]">Present</span>
          </div>
        </div>
      </div>
    </div>
  );
};
