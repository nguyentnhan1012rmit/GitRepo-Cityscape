import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

export const HighlightRing = () => {
  const selectedBlock = useAppStore(state => state.selectedBlock);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current || !selectedBlock) return;
    ringRef.current.rotation.z += 0.02;
    // Pulse scale
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    ringRef.current.scale.setScalar(scale);
  });

  if (!selectedBlock) return null;

  const radius = Math.max(selectedBlock.width, selectedBlock.depth) * 0.8;

  return (
    <mesh
      ref={ringRef}
      position={[selectedBlock.x, selectedBlock.height + 0.5, selectedBlock.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <torusGeometry args={[radius, 0.15, 16, 64]} />
      <meshBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};
