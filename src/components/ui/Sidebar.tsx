'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Info, Folder, File, AlertTriangle } from 'lucide-react';

export const Sidebar = () => {
  const repoUrl = useAppStore((state) => state.repoUrl);
  const repoData = useAppStore((state) => state.repoData);
  const error = useAppStore((state) => state.error);

  const getStats = () => {
    if (!repoData) return { totalFiles: 0, totalFolders: 0, totalSize: 0 };
    
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;

    repoData.forEach((block) => {
      if (block.type === 'blob') {
        totalFiles++;
        totalSize += block.userData.size || 0;
      } else {
        totalFolders++;
      }
    });

    return { totalFiles, totalFolders, totalSize };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { totalFiles, totalFolders, totalSize } = getStats();
  const viewMode = useAppStore(state => state.viewMode);
  const setViewMode = useAppStore(state => state.setViewMode);

  return (
    <div className="absolute top-4 left-4 z-10 w-64 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 text-indigo-600 mb-4 pb-2 border-b border-gray-200">
        <Info size={20} />
        <h2 className="font-bold text-lg">Cityscape Stats</h2>
      </div>

      {error ? (
        <div className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : repoData ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Repository</p>
            <p className="text-sm font-medium text-gray-800 truncate" title={repoUrl}>
              {repoUrl.replace('https://github.com/', '')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <Folder size={14} />
                <span className="text-xs">Folders</span>
              </div>
              <p className="font-bold text-gray-800">{totalFolders}</p>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <File size={14} />
                <span className="text-xs">Files</span>
              </div>
              <p className="font-bold text-gray-800">{totalFiles}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded-lg">
             <div className="flex items-center gap-1 text-gray-500 mb-1">
                <span className="text-xs">Total Code Size</span>
              </div>
              <p className="font-bold text-gray-800">{formatSize(totalSize)}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={() => setViewMode(viewMode === 'fly' ? 'walk' : 'fly')}
              className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition font-semibold py-2 rounded-lg text-sm flex justify-center items-center gap-2"
            >
              {viewMode === 'fly' ? 'Switch to Walk Mode (FPV)' : 'Switch to Fly Mode'}
            </button>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              {viewMode === 'fly' ? 'Use mouse to orbit and zoom.' : 'Use WASD to move and mouse to look around.'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Enter a GitHub URL to render its cityscape.
        </p>
      )}
    </div>
  );
};
