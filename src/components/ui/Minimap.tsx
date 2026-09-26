'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const MINIMAP_SIZE = 160;
const WORLD_SIZE = 400; // matches TOTAL_WIDTH from layoutGenerator

export const Minimap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repoData = useAppStore(state => state.repoData);
  const cameraTarget = useAppStore(state => state.cameraTarget);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !repoData) return;

    // Clear background
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MINIMAP_SIZE / 2, 0);
    ctx.lineTo(MINIMAP_SIZE / 2, MINIMAP_SIZE);
    ctx.moveTo(0, MINIMAP_SIZE / 2);
    ctx.lineTo(MINIMAP_SIZE, MINIMAP_SIZE / 2);
    ctx.stroke();

    // Draw buildings
    repoData.forEach(block => {
      if (block.type !== 'blob') return;
      const mx = ((block.x + WORLD_SIZE / 2) / WORLD_SIZE) * MINIMAP_SIZE;
      const mz = ((block.z + WORLD_SIZE / 2) / WORLD_SIZE) * MINIMAP_SIZE;
      
      // Scale dot size by building size, minimum 1px, max 3px
      const size = Math.max(1, Math.min(3, block.width * 2));
      
      ctx.fillStyle = block.color;
      ctx.fillRect(mx - size/2, mz - size/2, size, size);
    });

    // Draw camera target (if one exists)
    if (cameraTarget) {
      const cx = ((cameraTarget.x + WORLD_SIZE / 2) / WORLD_SIZE) * MINIMAP_SIZE;
      const cz = ((cameraTarget.z + WORLD_SIZE / 2) / WORLD_SIZE) * MINIMAP_SIZE;
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cz, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [repoData, cameraTarget]);

  if (!repoData || repoData.length === 0) return null;

  return (
    <div className="absolute bottom-5 right-4 z-20 glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl hidden md:block">
      <div className="bg-black/40 text-[10px] text-gray-500 font-mono px-2 py-1 uppercase tracking-widest text-center border-b border-white/10">
        Radar
      </div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
        className="block"
      />
    </div>
  );
};
