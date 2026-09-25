'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { InstancedBuildings } from './InstancedBuildings';
import { Player } from './Player';
import { SmokeParticles } from './SmokeParticles';
import { MockMultiplayer } from './MockMultiplayer';
import { CinematicCamera } from './CinematicCamera';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';

const WeatherSystem = () => {
  const weather = useAppStore(state => state.weather);
  const lightningRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (weather === 'storm' && lightningRef.current) {
      if (Math.random() > 0.98) {
        lightningRef.current.intensity = 50 + Math.random() * 100;
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 100);
      }
    }
  });

  if (weather === 'storm') {
    return (
      <>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.1} />
        <pointLight ref={lightningRef} position={[0, 100, 0]} intensity={0} color="#aaddff" distance={300} decay={2} />
        <directionalLight castShadow position={[50, 100, 50]} intensity={0.2} color="#445566" />
        <Environment preset="night" />
      </>
    );
  }

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <ambientLight intensity={0.4} />
      <directionalLight 
        castShadow 
        position={[50, 100, 50]} 
        intensity={1.5} 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <Sky sunPosition={[50, 100, 50]} distance={400000} inclination={0} azimuth={0.25} />
      <Environment preset="city" />
    </>
  );
};

export const CityScene = () => {
  const viewMode = useAppStore(state => state.viewMode);
  const isCinematic = useAppStore(state => state.isCinematic);

  return (
    <div className="w-full h-full relative">
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <Canvas
          camera={{ position: [0, 50, 100], fov: 45 }}
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
        <WeatherSystem />
        
        <Physics gravity={[0, -30, 0]}>
          <InstancedBuildings />
          <SmokeParticles />
          <MockMultiplayer />
          
          <RigidBody type="fixed" position={[0, -0.5, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[1000, 1, 1000]} />
              <meshStandardMaterial color="#1a1a2e" />
            </mesh>
          </RigidBody>

          {viewMode === 'walk' && <Player />}
        </Physics>

        <CinematicCamera />

        {viewMode === 'fly' && !isCinematic && (
          <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
            minDistance={10}
            maxDistance={300}
          />
        )}
      </Canvas>
      </KeyboardControls>
    </div>
  );
};
