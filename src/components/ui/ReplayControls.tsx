'use client';
import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause } from 'lucide-react';

export const ReplayControls = () => {
  const isReplaying = useAppStore(state => state.isReplaying);
  const replaySpeed = useAppStore(state => state.replaySpeed);
  const startReplay = useAppStore(state => state.startReplay);
  const stopReplay = useAppStore(state => state.stopReplay);
  const setReplaySpeed = useAppStore(state => state.setReplaySpeed);
  const currentCommitIndex = useAppStore(state => state.currentCommitIndex);
  const setTimeMachineIndex = useAppStore(state => state.setTimeMachineIndex);
  const isLoading = useAppStore(state => state.isLoading);
  const timelineCommits = useAppStore(state => state.timelineCommits);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isReplaying) {
      if (currentCommitIndex === 0) {
        // We reached the present (index 0 is latest)
        stopReplay();
        return;
      }

      if (isLoading) return; // Wait for loading to finish

      // Calculate interval based on speed: 1x = 5s, 2x = 2.5s, 5x = 1s
      const interval = 5000 / replaySpeed;

      timeoutRef.current = setTimeout(() => {
        setTimeMachineIndex(currentCommitIndex - 1);
      }, interval);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isReplaying, currentCommitIndex, isLoading, replaySpeed, setTimeMachineIndex, stopReplay]);

  if (timelineCommits.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
      <button 
        onClick={isReplaying ? stopReplay : startReplay}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-[var(--neon-cyan)] transition-colors"
      >
        {isReplaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <select 
        value={replaySpeed} 
        onChange={(e) => setReplaySpeed(Number(e.target.value))}
        className="bg-transparent text-gray-300 text-xs outline-none cursor-pointer pr-1"
        disabled={isReplaying}
      >
        <option value={1} className="bg-gray-900">1x</option>
        <option value={2} className="bg-gray-900">2x</option>
        <option value={5} className="bg-gray-900">5x</option>
      </select>
    </div>
  );
};
