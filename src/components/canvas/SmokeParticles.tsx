'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

export const SmokeParticles = () => {
  const repoData = useAppStore(state => state.repoData);
  const pointsRef = useRef<THREE.Points>(null);

  // Find all blocks with issues
  const issueBlocks = useMemo(() => {
    if (!repoData) return [];
    return repoData.filter(block => block.userData.metadata?.hasIssues);
  }, [repoData]);

  const particlesCount = issueBlocks.length * 20; // 20 particles per issue block
  
  const [buffers, setBuffers] = useState<{ positions: Float32Array; velocities: Float32Array } | null>(null);

  useEffect(() => {
    if (particlesCount === 0) {
      setBuffers(null);
      return;
    }
    
    const pos = new Float32Array(particlesCount * 3);
    const vel = new Float32Array(particlesCount * 3);
    
    let i = 0;
    issueBlocks.forEach(block => {
      for (let p = 0; p < 20; p++) {
        // Random position on top of the block
        pos[i * 3] = block.x + (Math.random() - 0.5) * block.width;
        pos[i * 3 + 1] = block.height + Math.random() * 2;
        pos[i * 3 + 2] = block.z + (Math.random() - 0.5) * block.depth;
        
        // Upward velocity
        vel[i * 3] = (Math.random() - 0.5) * 0.5;
        vel[i * 3 + 1] = 1 + Math.random();
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        i++;
      }
    });
    
    setBuffers({ positions: pos, velocities: vel });
  }, [issueBlocks, particlesCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current || issueBlocks.length === 0 || !buffers) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const pos = posAttr.array as Float32Array;
    
    let i = 0;
    issueBlocks.forEach(block => {
      for (let p = 0; p < 20; p++) {
        const idx = i * 3;
        // Move particle up
        pos[idx] += buffers.velocities[idx] * delta;
        pos[idx + 1] += buffers.velocities[idx + 1] * delta;
        pos[idx + 2] += buffers.velocities[idx + 2] * delta;
        
        // Reset if too high
        if (pos[idx + 1] > block.height + 10) {
          pos[idx] = block.x + (Math.random() - 0.5) * block.width;
          pos[idx + 1] = block.height;
          pos[idx + 2] = block.z + (Math.random() - 0.5) * block.depth;
        }
        i++;
      }
    });
    
    posAttr.needsUpdate = true;
  });

  if (issueBlocks.length === 0 || !buffers) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-expect-error - R3F typings for bufferAttribute are overly strict */}
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={buffers.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color="#ff4444"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
