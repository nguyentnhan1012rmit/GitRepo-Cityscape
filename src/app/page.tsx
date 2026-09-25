import { CityScene } from '@/components/canvas/CityScene';
import { SearchBar } from '@/components/ui/SearchBar';
import { Sidebar } from '@/components/ui/Sidebar';
import { Tooltip3D } from '@/components/ui/Tooltip3D';
import { Timeline } from '@/components/ui/Timeline';
import { ExportPanel } from '@/components/ui/ExportPanel';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* UI Layer */}
      <SearchBar />
      <Sidebar />
      <Tooltip3D />
      <Timeline />
      <ExportPanel />
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 w-full h-full">
        <CityScene />
      </div>
    </main>
  );
}
