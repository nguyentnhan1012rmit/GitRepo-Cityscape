'use client';

import dynamic from 'next/dynamic';

const CityScene = dynamic(() => import('@/components/canvas/CityScene').then(mod => mod.CityScene), { ssr: false });
import { SearchBar } from '@/components/ui/SearchBar';
import { Sidebar } from '@/components/ui/Sidebar';
import { Tooltip3D } from '@/components/ui/Tooltip3D';
import { Timeline } from '@/components/ui/Timeline';
import { ExportPanel } from '@/components/ui/ExportPanel';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const isLoading = useAppStore(state => state.isLoading);
  const repoData = useAppStore(state => state.repoData);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a14]">
      {/* 3D Canvas Layer (below everything) */}
      <div className="absolute inset-0 w-full h-full">
        <CityScene />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar />
        </div>
        <div className="pointer-events-auto">
          <Sidebar />
        </div>
        <div className="pointer-events-auto">
          <ExportPanel />
        </div>
        <Tooltip3D />
        <div className="pointer-events-auto">
          <Timeline />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Empty state overlay (shown when no data and not loading) */}
      {!repoData && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none cyber-grid">
          <div className="text-center animate-fade-in-up">
            <div className="mb-6">
              <span className="text-6xl">🏙️</span>
            </div>
            <h1 
              className="text-3xl font-bold neon-text mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              GitRepo Cityscape
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Enter a GitHub repository URL above to transform its codebase into a living, 
              breathing cyberpunk city. Folders become districts. Files become skyscrapers.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
