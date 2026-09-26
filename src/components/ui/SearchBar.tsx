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
          className="group relative h-full px-6 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/5 overflow-hidden"
          style={{
            background: isLoading 
              ? 'linear-gradient(135deg, #1a3a5c, #0a2a4a)' 
              : 'linear-gradient(135deg, #00c8ff, #0066ff)',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            borderRadius: '0 11px 11px 0',
            boxShadow: isLoading 
              ? 'none' 
              : '0 0 20px rgba(0, 200, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Hover shimmer effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
          <Zap size={14} className={isLoading ? 'animate-spin' : 'group-hover:scale-125 transition-transform duration-200'} />
          <span className="relative">{isLoading ? 'BUILDING' : 'RENDER'}</span>
        </button>
      </div>
    </form>
  );
};
