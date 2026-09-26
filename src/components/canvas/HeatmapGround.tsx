import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { useAppStore } from '@/store/useAppStore';

const TOTAL_WIDTH = 400;
const TOTAL_DEPTH = 400;

export const HeatmapGround = () => {
  const repoData = useAppStore(state => state.repoData);
  const timeOfDay = useAppStore(state => state.timeOfDay);

  const texture = useMemo(() => {
    if (!repoData) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const baseColor = timeOfDay === 'day' ? '#e0e0e0' : '#0a0a1e';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    const mapX = (x: number) => ((x + TOTAL_WIDTH / 2) / TOTAL_WIDTH) * 1024;
    const mapY = (z: number) => ((z + TOTAL_DEPTH / 2) / TOTAL_DEPTH) * 1024;
    const mapW = (w: number) => (w / TOTAL_WIDTH) * 1024;
    const mapH = (d: number) => (d / TOTAL_DEPTH) * 1024;

    // Aggregate heat per folder
    const folderHeat: Record<string, number> = {};
    repoData.forEach(block => {
      if (block.type === 'blob' && block.userData.metadata?.isRecent) {
        const parts = block.id.split('/');
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += (currentPath ? '/' : '') + parts[i];
          folderHeat[currentPath] = (folderHeat[currentPath] || 0) + 1;
        }
      }
    });

    let maxHeat = 1;
    Object.values(folderHeat).forEach(h => { if (h > maxHeat) maxHeat = h; });

    // Draw folders
    repoData.forEach(block => {
      if (block.type === 'tree') {
        const heat = folderHeat[block.id] || 0;
        if (heat > 0) {
          const intensity = Math.min(1, heat / maxHeat);
          // Interpolate from Black/Transparent (cold) to Red (hot)
          const r = Math.floor(intensity * 255);
          const g = 0; 
          const b = 0;
          
          // Make cold areas more transparent, hot areas more solid
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.8})`;
          
          const px = mapX(block.x - block.width / 2);
          const py = mapY(block.z - block.depth / 2);
          const pw = mapW(block.width);
          const ph = mapH(block.depth);
          
          ctx.fillRect(px, py, pw, ph);
        }
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [repoData, timeOfDay]);

  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      {/* Heatmap Overlay (sized exactly to the city) */}
      <mesh receiveShadow position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TOTAL_WIDTH, TOTAL_DEPTH]} />
        <meshStandardMaterial 
          color="#ffffff"
          map={texture || undefined}
          roughness={timeOfDay === 'day' ? 0.8 : 0.9}
          metalness={timeOfDay === 'day' ? 0.2 : 0.1}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
      
      {/* Main infinite ground */}
      <mesh receiveShadow>
        <boxGeometry args={[1500, 1, 1500]} />
        <meshStandardMaterial 
          color={timeOfDay === 'day' ? '#e0e0e0' : '#0a0a1e'} 
          roughness={timeOfDay === 'day' ? 0.8 : 0.9}
          metalness={timeOfDay === 'day' ? 0.2 : 0.1}
        />
      </mesh>
      {/* Grid lines on ground */}
      <gridHelper 
        args={[400, 80, timeOfDay === 'day' ? '#cccccc' : '#0a2a3a', timeOfDay === 'day' ? '#dddddd' : '#0a1a2a']} 
        position={[0, 0.52, 0]}
      />
    </RigidBody>
  );
};
