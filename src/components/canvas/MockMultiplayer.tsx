'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

// Renders fake avatars (ghosts) wandering the city
export const MockMultiplayer = () => {
  const repoData = useAppStore(state => state.repoData);
  const groupRef = useRef<THREE.Group>(null);

  // Generate 5 random bots
  const bots = useMemo(() => {
    if (!repoData || repoData.length === 0) return [];
    
    return Array.from({ length: 5 }).map((_, i) => {
      // Pick a random target building to walk towards
      const targetBlock = repoData[Math.floor(Math.random() * repoData.length)];
      
      return {
        id: `bot-${i}`,
        position: new THREE.Vector3((Math.random() - 0.5) * 50, 1, (Math.random() - 0.5) * 50),
        target: new THREE.Vector3(targetBlock.x, 1, targetBlock.z),
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        speed: 2 + Math.random() * 2
      };
    });
  }, [repoData]);

  useFrame((state, delta) => {
    if (!groupRef.current || bots.length === 0 || !repoData) return;

    groupRef.current.children.forEach((child, i) => {
      const bot = bots[i];
      if (!bot) return;

      // Move bot towards its target
      const dir = new THREE.Vector3().subVectors(bot.target, bot.position);
      const dist = dir.length();
      
      if (dist > 1) {
        dir.normalize();
        bot.position.addScaledVector(dir, bot.speed * delta);
        child.position.copy(bot.position);
        
        // Make the bot face where it's walking
        const lookTarget = bot.position.clone().add(dir);
        child.lookAt(lookTarget);
      } else {
        // Pick a new target building when arrived
        const newTarget = repoData[Math.floor(Math.random() * repoData.length)];
        bot.target.set(newTarget.x, 1, newTarget.z);
      }
      
      // Floating animation (bobbing up and down)
      child.position.y = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5;
    });
  });

  if (bots.length === 0) return null;

  return (
    <group ref={groupRef}>
      {bots.map((bot) => (
        <group key={bot.id} position={bot.position}>
          {/* Avatar Body */}
          <mesh castShadow position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
            <meshStandardMaterial color={bot.color} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Avatar Head/Eye indicating direction */}
          <mesh position={[0, 1, 0.2]}>
            <boxGeometry args={[0.4, 0.2, 0.4]} />
            <meshStandardMaterial color="black" />
          </mesh>
          {/* Name Tag */}
          <sprite position={[0, 2, 0]} scale={[2, 0.5, 1]}>
            <spriteMaterial color={bot.color} opacity={0.8} transparent />
          </sprite>
        </group>
      ))}
    </group>
  );
};
