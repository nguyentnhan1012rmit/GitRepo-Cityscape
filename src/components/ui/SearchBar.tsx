'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Search } from 'lucide-react';

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
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4"
    >
      <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden shadow-md">
        <div className="grid place-items-center h-full w-12 text-gray-300">
          <Search size={20} />
        </div>
        
        <input
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent"
          type="text"
          id="search"
          placeholder="https://github.com/owner/repo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg h-full transition-colors disabled:bg-blue-400"
        >
          {isLoading ? 'Building...' : 'Render'}
        </button>
      </div>
    </form>
  );
};
