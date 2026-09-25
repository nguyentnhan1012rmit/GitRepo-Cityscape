'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const SPEED = 20;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player = () => {
  const ref = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();

  useFrame((state) => {
    if (!ref.current) return;
    
    const { forward, backward, left, right } = get() as any;
    
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(state.camera.rotation);

    // Apply movement
    ref.current.setLinvel({ x: direction.x, y: 0, z: direction.z }, true);

    // Sync camera to rigid body position
    const pos = ref.current.translation();
    state.camera.position.set(pos.x, pos.y + 2, pos.z); // Player height is 2
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
