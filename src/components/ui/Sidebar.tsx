'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Info, Folder, File, AlertTriangle, Eye, Footprints, ChevronDown, ChevronRight, Volume2, VolumeX, Sun, Moon, Network } from 'lucide-react';
import { FILE_COLOR_MAP } from '@/lib/math/layoutGenerator';

export const Sidebar = () => {
  const repoUrl = useAppStore((state) => state.repoUrl);
  const repoData = useAppStore((state) => state.repoData);
  const error = useAppStore((state) => state.error);
  const viewMode = useAppStore(state => state.viewMode);
  const setViewMode = useAppStore(state => state.setViewMode);
  const weather = useAppStore(state => state.weather);
  const isMuted = useAppStore(state => state.isMuted);
  const toggleMute = useAppStore(state => state.toggleMute);
  const timeOfDay = useAppStore(state => state.timeOfDay);
  const setTimeOfDay = useAppStore(state => state.setTimeOfDay);
  const showDependencies = useAppStore(state => state.showDependencies);
  const toggleDependencies = useAppStore(state => state.toggleDependencies);
  const fetchDependencies = useAppStore(state => state.fetchDependencies);
  const dependencyEdges = useAppStore(state => state.dependencyEdges);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && 'ontouchstart' in window);
  }, []);

  const getStats = () => {
    if (!repoData) return { totalFiles: 0, totalFolders: 0, totalSize: 0, recentCount: 0, issueCount: 0 };
    
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;
    let recentCount = 0;
    let issueCount = 0;

    repoData.forEach((block) => {
      if (block.type === 'blob') {
        totalFiles++;
        totalSize += block.userData.size || 0;
        if (block.userData.metadata?.isRecent) recentCount++;
        if (block.userData.metadata?.hasIssues) issueCount++;
      } else {
        totalFolders++;
      }
    });

    return { totalFiles, totalFolders, totalSize, recentCount, issueCount };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { totalFiles, totalFolders, totalSize, recentCount, issueCount } = getStats();

  const weatherIcon = weather === 'storm' ? '⛈️' : weather === 'clear' ? '☀️' : '🌤️';
  const weatherLabel = weather === 'storm' ? 'CI FAILED' : weather === 'clear' ? 'CI PASSING' : 'UNKNOWN';

  const languageStats = useMemo(() => {
    if (!repoData) return [];
    const sizeByLang: Record<string, number> = {};

    repoData.forEach(block => {
      if (block.type === 'blob' && block.userData.extension) {
        const ext = block.userData.extension;
        sizeByLang[ext] = (sizeByLang[ext] || 0) + (block.userData.size || 0);
      }
    });

    const total = Object.values(sizeByLang).reduce((a, b) => a + b, 0);
    return Object.entries(sizeByLang)
      .map(([ext, size]) => ({
        ext,
        size,
        percentage: total > 0 ? (size / total) * 100 : 0,
        color: FILE_COLOR_MAP[ext]?.color || '#888888',
        label: FILE_COLOR_MAP[ext]?.label || ext.toUpperCase(),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 8); // Top 8 languages
  }, [repoData]);

  const gradient = useMemo(() => {
    let accumulated = 0;
    const stops: string[] = [];
    for (const lang of languageStats) {
      const start = accumulated;
      accumulated += lang.percentage;
      stops.push(`${lang.color} ${start}% ${accumulated}%`);
    }
    return `conic-gradient(${stops.join(', ')})`;
  }, [languageStats]);

  return (
    <div className="absolute bottom-0 md:bottom-auto top-auto md:top-5 left-0 md:left-4 z-20 w-full md:w-72 animate-fade-in-up flex flex-col md:block">
      {/* Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="glass-panel w-full flex items-center justify-between px-4 py-3 cursor-pointer group"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[var(--neon-cyan)] opacity-70" />
          <h2 
            className="font-bold text-sm tracking-wider uppercase neon-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Cityscape
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (dependencyEdges.length === 0) {
                await fetchDependencies();
              } else {
                toggleDependencies();
              }
            }}
            className={`transition-colors p-1 ${showDependencies ? 'text-[var(--neon-cyan)]' : 'text-gray-500 hover:text-[var(--neon-cyan)]'}`}
            title="Toggle Dependency Beams"
          >
            <Network size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTimeOfDay(timeOfDay === 'night' ? 'day' : 'night');
            }}
            className="text-gray-500 hover:text-[var(--neon-cyan)] transition-colors p-1"
          >
            {timeOfDay === 'night' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="text-gray-500 hover:text-[var(--neon-cyan)] transition-colors p-1"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          {isCollapsed ? (
            <ChevronRight size={14} className="text-gray-500 group-hover:text-[var(--neon-cyan)] transition-colors" />
          ) : (
            <ChevronDown size={14} className="text-gray-500 group-hover:text-[var(--neon-cyan)] transition-colors" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="glass-panel mt-2 p-4 space-y-4">
          {error ? (
            <div className="flex items-start gap-2 text-[var(--neon-red)] bg-[rgba(255,59,59,0.08)] p-3 rounded-lg border border-[rgba(255,59,59,0.2)]">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          ) : repoData ? (
            <>
              {/* Repo name */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Repository</p>
                <p className="text-sm font-medium text-gray-200 truncate font-mono" title={repoUrl}>
                  {repoUrl.replace('https://github.com/', '')}
                </p>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="stat-badge">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Folder size={12} />
                    <span className="text-[10px] uppercase tracking-wider">Districts</span>
                  </div>
                  <p className="font-bold text-lg text-gray-100 font-mono">{totalFolders}</p>
                </div>
                
                <div className="stat-badge">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <File size={12} />
                    <span className="text-[10px] uppercase tracking-wider">Buildings</span>
                  </div>
                  <p className="font-bold text-lg text-gray-100 font-mono">{totalFiles}</p>
                </div>
              </div>

              {/* Code size */}
              <div className="stat-badge">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Code Mass</p>
                <p className="font-bold text-gray-100 font-mono">{formatSize(totalSize)}</p>
              </div>

              {/* Language Breakdown */}
              <div className="stat-badge">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Languages</p>
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 shrink-0">
                    <div
                      className="w-full h-full rounded-full"
                      style={{ background: gradient }}
                    />
                    <div className="absolute inset-2 rounded-full bg-[var(--surface-0)]" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    {languageStats.slice(0, 4).map(lang => (
                      <div key={lang.ext} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: lang.color }} />
                        <span className="text-[9px] text-gray-400 font-mono w-7">.{lang.ext}</span>
                        <span className="text-[9px] text-gray-500 ml-auto">{lang.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live indicators */}
              <div className="flex items-center gap-3 text-xs">
                {recentCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                    <span className="text-[var(--neon-cyan)]">{recentCount} hot</span>
                  </div>
                )}
                {issueCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--neon-red)] animate-pulse" />
                    <span className="text-[var(--neon-red)]">{issueCount} PR fires</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span>{weatherIcon}</span>
                  <span className={weather === 'storm' ? 'text-[var(--neon-red)]' : 'text-[var(--neon-green)]'}>{weatherLabel}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">View Mode</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('fly')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'fly' 
                        ? 'neon-btn' 
                        : 'bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Eye size={13} />
                    Fly
                  </button>
                  {!isMobile && (
                    <button 
                      onClick={() => setViewMode('walk')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'walk' 
                          ? 'neon-btn neon-btn-magenta' 
                          : 'bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Footprints size={13} />
                      Walk
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 mt-2 text-center">
                  {viewMode === 'fly' ? 'Orbit & zoom with mouse (pinch on mobile)' : 'WASD to walk, mouse to look'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-600 italic">
              Enter a GitHub URL above to generate its cityscape.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
