'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const Timeline = () => {
  const commits = useAppStore((state) => state.timelineCommits);
  const currentIndex = useAppStore((state) => state.currentCommitIndex);
  const setTimeMachineIndex = useAppStore((state) => state.setTimeMachineIndex);
  const isLoading = useAppStore((state) => state.isLoading);

  if (!commits || commits.length === 0) return null;

  // We want the oldest commit on the left (index commits.length - 1) 
  // and the newest commit on the right (index 0).
  // So the slider ranges from 0 to length - 1, but we invert it for the array.
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const invertedIndex = commits.length - 1 - val;
    setTimeMachineIndex(invertedIndex);
  };

  const currentCommit = commits[currentIndex];
  const sliderValue = commits.length - 1 - currentIndex;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-3xl px-4">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Time Machine
              {isLoading && <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">Traveling...</span>}
            </h3>
            <p className="text-sm text-gray-500 font-mono mt-1">
              {currentCommit?.sha.substring(0, 7)} — {currentCommit?.message.split('\n')[0]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-semibold text-gray-700">
              {currentCommit?.date ? new Date(currentCommit.date).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={commits.length - 1}
          step={1}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={isLoading}
        />
        
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
          <span>Past</span>
          <span>Present</span>
        </div>
      </div>
    </div>
  );
};
