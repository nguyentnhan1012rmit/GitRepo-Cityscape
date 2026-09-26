'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

const SPEED = 20;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player = () => {
  const ref = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();

  const repoUrl = useAppStore(state => state.repoUrl);
  const [playerId] = useState(() => Math.random().toString(36).substring(7));
  const rotationRef = useRef<THREE.Euler>(new THREE.Euler());

  useEffect(() => {
    if (!repoUrl || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    
    const channelName = `repo-${repoUrl.replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const channel = supabase.channel(channelName);
    channel.subscribe();

    const interval = setInterval(() => {
      if (!ref.current) return;
      const pos = ref.current.translation();
      const rot = rotationRef.current;
      
      channel.send({
        type: 'broadcast',
        event: 'movement',
        payload: {
          id: playerId,
          position: [pos.x, pos.y, pos.z],
          rotation: [rot.x, rot.y, rot.z],
        },
      });
    }, 1000 / 15);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [repoUrl, playerId]);

  useFrame((state) => {
    if (!ref.current) return;
    
    const { forward, backward, left, right } = get() as Record<string, boolean>;
    const moveZ = Number(backward) - Number(forward);
    const moveX = Number(left) - Number(right);
    
    frontVector.set(0, 0, moveZ);
    sideVector.set(moveX, 0, 0);
    
    const rotation = state.camera.rotation;
    rotationRef.current.copy(rotation);
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(rotation);

    ref.current.setLinvel({ x: direction.x, y: 0, z: direction.z }, true);

    const pos = ref.current.translation();
    state.camera.position.set(pos.x, pos.y + 2, pos.z);
  });

  return (
    <>
      <PointerLockControls />
      <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 5, 0]} enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="hotpink" transparent opacity={0} />
        </mesh>
      </RigidBody>
    </>
  );
};
