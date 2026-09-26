'use client';

import React from 'react';
import { Camera, Download, Video, VideoOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { exportCityToOBJ, takeHighResScreenshot } from '@/lib/utils/export3D';

export const ExportPanel = () => {
  const repoData = useAppStore(state => state.repoData);
  const isCinematic = useAppStore(state => state.isCinematic);
  const toggleCinematic = useAppStore(state => state.toggleCinematic);

  if (!repoData || repoData.length === 0) return null;

  return (
    <div className="absolute top-5 right-4 z-20 flex flex-col gap-2 animate-fade-in-up">
      <button 
        onClick={toggleCinematic}
        className={`neon-btn flex items-center gap-2 text-xs ${isCinematic ? 'neon-btn-magenta pulse-glow' : ''}`}
      >
        {isCinematic ? <VideoOff size={14} /> : <Video size={14} />}
        {isCinematic ? 'STOP CINEMATIC' : 'CINEMATIC FLY'}
      </button>

      <button 
        onClick={takeHighResScreenshot}
        className="neon-btn flex items-center gap-2 text-xs"
      >
        <Camera size={14} />
        4K SCREENSHOT
      </button>

      <button 
        onClick={() => exportCityToOBJ(repoData)}
        className="neon-btn neon-btn-magenta flex items-center gap-2 text-xs"
      >
        <Download size={14} />
        EXPORT .OBJ
      </button>
    </div>
  );
};
