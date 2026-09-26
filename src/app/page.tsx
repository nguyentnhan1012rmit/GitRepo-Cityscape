'use client';

import dynamic from 'next/dynamic';

const CityScene = dynamic(() => import('@/components/canvas/CityScene').then(mod => mod.CityScene), { ssr: false });
import { SearchBar } from '@/components/ui/SearchBar';
import { BuildingSearch } from '@/components/ui/BuildingSearch';
import { Sidebar } from '@/components/ui/Sidebar';
import { Tooltip3D } from '@/components/ui/Tooltip3D';
import { Timeline } from '@/components/ui/Timeline';
import { ExportPanel } from '@/components/ui/ExportPanel';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Legend } from '@/components/ui/Legend';
import { CodePreview } from '@/components/ui/CodePreview';
import { Minimap } from '@/components/ui/Minimap';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const isLoading = useAppStore(state => state.isLoading);
  const repoData = useAppStore(state => state.repoData);
  const fetchData = useAppStore(state => state.fetchData);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    if (repoParam && !repoData) {
      const url = repoParam.startsWith('http') ? repoParam : `https://github.com/${repoParam}`;
      fetchData(url);
    } else if (!repoParam && !repoData && !isLoading) {
      router.push('/landing');
    }
  }, [repoData, isLoading, fetchData, router]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a14]">
      {/* 3D Canvas Layer (below everything) */}
      <div className="absolute inset-0 w-full h-full">
        <CityScene />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto absolute top-5 left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center gap-4 z-30 w-full max-w-4xl px-4">
          <SearchBar />
          <BuildingSearch />
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
        <div className="pointer-events-auto">
          <Legend />
        </div>
        <div className="pointer-events-auto">
          <CodePreview />
        </div>
        <div className="pointer-events-auto">
          <Minimap />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </main>
  );
}
