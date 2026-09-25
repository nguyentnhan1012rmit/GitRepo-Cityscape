'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '@/store/useAppStore';

export const InstancedBuildings = () => {
  const repoData = useAppStore((state) => state.repoData);
  const setHoveredBlock = useAppStore((state) => state.setHoveredBlock);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Store current animated states for each building
  const currentStates = useRef<Map<string, { x: number, y: number, z: number, w: number, h: number, d: number, color: THREE.Color, targetColor: THREE.Color }>>(new Map());

  // Setup/Teardown and logic to figure out targets
  useEffect(() => {
    if (!repoData || !instancedMeshRef.current) return;
    
    // We update target states in the map
    const newKeys = new Set<string>();
    
    repoData.forEach((block) => {
      newKeys.add(block.id);
      let targetColorValue = block.color;
      
      const meta = block.userData.metadata;
      if (meta?.isRecent) targetColorValue = '#00ffcc';
      else if (meta && !meta.isRecent) {
        const base = new THREE.Color(block.color);
        targetColorValue = '#' + base.multiplyScalar(0.4).getHexString();
      }

      if (!currentStates.current.has(block.id)) {
        // New block, starts at height 0 (sụp xuống / mọc lên)
        currentStates.current.set(block.id, {
          x: block.x, y: 0, z: block.z,
          w: block.width, h: 0.01, d: block.depth,
          color: new THREE.Color(targetColorValue),
          targetColor: new THREE.Color(targetColorValue)
        });
      } else {
        // Existing block, update target color but keep current transform to lerp
        const state = currentStates.current.get(block.id)!;
        state.targetColor.set(targetColorValue);
      }
    });

    // For blocks that are removed in this commit, we could animate them down to 0, 
    // but InstancedMesh instance count changes dynamically. 
    // For simplicity, we just filter currentStates to only include newKeys.
    const nextStates = new Map();
    repoData.forEach(b => nextStates.set(b.id, currentStates.current.get(b.id)!));
    currentStates.current = nextStates;
    
  }, [repoData]);

  useFrame((state, delta) => {
    if (!repoData || !instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;
    let needsUpdate = false;

    // A factor for lerping, adjusting for frame delta
    const lerpFactor = 1 - Math.exp(-10 * delta);

    repoData.forEach((block, i) => {
      const stateObj = currentStates.current.get(block.id);
      if (!stateObj) return;

      // Lerp transform
      stateObj.x = THREE.MathUtils.lerp(stateObj.x, block.x, lerpFactor);
      stateObj.z = THREE.MathUtils.lerp(stateObj.z, block.z, lerpFactor);
      stateObj.w = THREE.MathUtils.lerp(stateObj.w, block.width, lerpFactor);
      stateObj.d = THREE.MathUtils.lerp(stateObj.d, block.depth, lerpFactor);
      stateObj.h = THREE.MathUtils.lerp(stateObj.h, block.height, lerpFactor);
      
      // Lerp color
      stateObj.color.lerp(stateObj.targetColor, lerpFactor);

      dummy.position.set(stateObj.x, stateObj.h / 2, stateObj.z);
      dummy.scale.set(stateObj.w, stateObj.h, stateObj.d);
      dummy.updateMatrix();
      
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, stateObj.color);
      needsUpdate = true;
    });

    if (needsUpdate) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  if (!repoData || repoData.length === 0) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, repoData.length]}
      castShadow
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) {
          const block = repoData[e.instanceId];
          setHoveredBlock(block);
        }
      }}
      onPointerOut={() => {
        setHoveredBlock(null);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
};
