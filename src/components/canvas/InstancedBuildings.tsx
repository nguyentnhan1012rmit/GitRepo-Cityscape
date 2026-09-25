'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

export const InstancedBuildings = () => {
  const repoData = useAppStore((state) => state.repoData);
  const setHoveredBlock = useAppStore((state) => state.setHoveredBlock);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Use a dummy object to calculate matrix math
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!repoData || !instancedMeshRef.current) return;

    const mesh = instancedMeshRef.current;

    repoData.forEach((block, i) => {
      dummy.position.set(block.x, block.height / 2, block.z);
      dummy.scale.set(block.width, block.height, block.depth);
      dummy.updateMatrix();
      
      mesh.setMatrixAt(i, dummy.matrix);

      // Handle color
      const meta = block.userData.metadata;
      
      if (meta?.isRecent) {
        // Hot file: bright neon cyan/green
        color.set('#00ffcc');
      } else if (meta && !meta.isRecent) {
        // Lazily fetched old file: make it darker/aged
        const baseColor = new THREE.Color(block.color);
        color.set(baseColor.multiplyScalar(0.4)); // Darken by 60%
      } else {
        // Standard un-fetched file
        color.set(block.color);
      }
      
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [repoData, dummy, color]);

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
