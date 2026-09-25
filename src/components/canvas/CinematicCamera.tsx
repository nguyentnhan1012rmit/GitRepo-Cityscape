'use client';

import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';

export const CinematicCamera = () => {
  const isCinematic = useAppStore(state => state.isCinematic);
  const repoData = useAppStore(state => state.repoData);

  useFrame((state, delta) => {
    if (!isCinematic || !repoData || repoData.length === 0) return;
    
    // Auto-fly around the center of the scene
    const time = state.clock.elapsedTime * 0.1; // slow rotation
    const radius = 120;
    
    // Calculate new position
    const x = Math.sin(time) * radius;
    const z = Math.cos(time) * radius;
    const y = 30 + Math.sin(time * 2) * 10; // bob up and down slightly
    
    state.camera.position.lerp(new THREE.Vector3(x, y, z), 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
