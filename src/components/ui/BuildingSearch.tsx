'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const BuildingSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const repoData = useAppStore(state => state.repoData);
  const selectBlock = useAppStore(state => state.selectBlock);

  const results = useMemo(() => {
    if (!query || !repoData) return [];
    const lower = query.toLowerCase();
    return repoData
      .filter(b => b.type === 'blob' && b.name.toLowerCase().includes(lower))
      .slice(0, 10);
  }, [query, repoData]);

  if (!repoData) return null;

  return (
    <div className="relative">
      <div className="flex items-center glass-panel h-14 md:h-12 px-3 focus-within:border-[var(--neon-cyan)] transition-colors">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search files..."
          className="bg-transparent border-none outline-none text-white w-48 font-mono placeholder:text-gray-600"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-panel overflow-hidden z-50">
          {results.map((result) => (
            <div
              key={result.id}
              className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between"
              onClick={() => {
                selectBlock(result);
                setIsOpen(false);
                setQuery('');
              }}
            >
              <span className="text-xs text-gray-300 font-mono truncate">{result.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
