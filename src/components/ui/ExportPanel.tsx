'use client';

import React from 'react';
import { Camera, Download, Video } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { exportCityToOBJ, takeHighResScreenshot } from '@/lib/utils/export3D';

export const ExportPanel = () => {
  const repoData = useAppStore(state => state.repoData);
  const isCinematic = useAppStore(state => state.isCinematic);
  const toggleCinematic = useAppStore(state => state.toggleCinematic);

  if (!repoData || repoData.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button 
        onClick={toggleCinematic}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors border ${isCinematic ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-gray-50 backdrop-blur-md'}`}
      >
        <Video size={18} />
        {isCinematic ? 'Stop Cinematic Mode' : 'Cinematic Auto-Fly'}
      </button>

      <button 
        onClick={takeHighResScreenshot}
        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg font-semibold shadow-lg transition-colors"
      >
        <Camera size={18} />
        4K Screenshot
      </button>

      <button 
        onClick={() => exportCityToOBJ(repoData)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 rounded-lg font-semibold shadow-lg transition-colors"
      >
        <Download size={18} />
        Export 3D Model (.OBJ)
      </button>
    </div>
  );
};
