'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const Tooltip3D = () => {
  const hoveredBlock = useAppStore((state) => state.hoveredBlock);
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

  if (!hoveredBlock) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="absolute z-20 pointer-events-none bg-black/80 text-white p-3 rounded-lg shadow-xl backdrop-blur-sm border border-white/10"
      style={{
        left: `${mousePos.x + 15}px`,
        top: `${mousePos.y + 15}px`,
        transform: 'translate(0, 0)', // basic offset
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="font-bold text-sm truncate max-w-xs" style={{ color: hoveredBlock.color }}>
          {hoveredBlock.name}
        </p>
        <p className="text-xs text-gray-300 font-mono opacity-80 max-w-xs truncate">
          {hoveredBlock.id}
        </p>
        <div className="flex gap-4 mt-2 pt-2 border-t border-white/20">
          <span className="text-xs font-semibold capitalize bg-white/10 px-2 py-0.5 rounded">
            {hoveredBlock.type}
          </span>
          {hoveredBlock.userData.size !== undefined && (
             <span className="text-xs text-gray-300">
               Size: <strong className="text-white">{formatSize(hoveredBlock.userData.size)}</strong>
             </span>
          )}
        </div>
      </div>
    </div>
  );
};
