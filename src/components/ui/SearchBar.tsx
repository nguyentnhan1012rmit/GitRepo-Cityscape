'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Search, Loader2, Zap } from 'lucide-react';

export const SearchBar = () => {
  const [input, setInput] = useState('https://github.com/facebook/react');
  const fetchData = useAppStore((state) => state.fetchData);
  const isLoading = useAppStore((state) => state.isLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input && !isLoading) {
      fetchData(input);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="absolute top-5 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4"
    >
      <div className="glass-panel flex items-center h-12 overflow-hidden">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-full text-[var(--neon-cyan)] opacity-60">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>
        
        {/* Input */}
        <input
          className="h-full flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 font-mono tracking-wide pr-2"
          type="text"
          id="repo-search"
          placeholder="https://github.com/owner/repo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="neon-btn h-full rounded-none rounded-r-[11px] flex items-center gap-2 border-l-0 px-5"
        >
          <Zap size={14} />
          <span>{isLoading ? 'BUILDING' : 'RENDER'}</span>
        </button>
      </div>
    </form>
  );
};
