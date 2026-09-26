'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

interface PeerData {
  position: [number, number, number];
  rotation: [number, number, number]; // Y rotation
  lastUpdate: number;
}

export const MultiplayerSystem = () => {
  const repoUrl = useAppStore(state => state.repoUrl);
  const [peers, setPeers] = useState<Record<string, PeerData>>({});
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (!repoUrl || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    
    // Use a URL-safe channel name
    const channelName = `repo-${repoUrl.replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const channel = supabase.channel(channelName);
    
    channel.on('broadcast', { event: 'movement' }, ({ payload }) => {
      setPeers((prev) => ({
        ...prev,
        [payload.id]: {
          position: payload.position,
          rotation: payload.rotation || [0, 0, 0],
          lastUpdate: Date.now()
        }
      }));
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [repoUrl]);

  // Clean up stale peers (e.g. no update for 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPeers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          if (now - next[key].lastUpdate > 5000) {
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Lerp child positions towards peer target positions
    Object.keys(peers).forEach((id) => {
      const peer = peers[id];
      const child = groupRef.current?.children.find(c => c.userData.id === id);
      if (child) {
        const targetPosition = new THREE.Vector3(...peer.position);
        child.position.lerp(targetPosition, 0.2); // Smooth interpolation
        
        // Also lerp rotation if we want to
        const targetRotation = new THREE.Euler(...peer.rotation);
        const currentQuat = child.quaternion.clone();
        const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
        currentQuat.slerp(targetQuat, 0.2);
        child.quaternion.copy(currentQuat);
      }
    });
  });

  if (Object.keys(peers).length === 0) return null;

  return (
    <group ref={groupRef}>
      {Object.entries(peers).map(([id, peer], index) => {
        // Generate a consistent color based on peer ID
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = new THREE.Color().setHSL((hash % 360) / 360, 0.8, 0.6);
        
        return (
          <group key={id} userData={{ id }} position={new THREE.Vector3(...peer.position)}>
            {/* Avatar Body */}
            <mesh castShadow position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
              <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Avatar Head/Eye indicating direction */}
            <mesh position={[0, 1, 0.2]}>
              <boxGeometry args={[0.4, 0.2, 0.4]} />
              <meshStandardMaterial color="black" />
            </mesh>
            {/* Name Tag */}
            <sprite position={[0, 2, 0]} scale={[2, 0.5, 1]}>
              <spriteMaterial color={color} opacity={0.8} transparent />
            </sprite>
          </group>
        );
      })}
    </group>
  );
};
