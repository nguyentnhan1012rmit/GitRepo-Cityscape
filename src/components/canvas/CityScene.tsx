'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, KeyboardControls, Stars } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { InstancedBuildings } from './InstancedBuildings';
import { Player } from './Player';
import { SmokeParticles } from './SmokeParticles';
import { MultiplayerSystem } from './MultiplayerSystem';
import { CinematicCamera } from './CinematicCamera';
import { CityAudio } from './CityAudio';
import { HighlightRing } from './HighlightRing';
import { HeatmapGround } from './HeatmapGround';
import { DependencyBeams } from './DependencyBeams';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';

// Conditionally import XR only in HTTPS contexts
const useIsSecureContext = () => {
  const [isSecure, setIsSecure] = useState(false);
  useEffect(() => {
    setIsSecure(typeof window !== 'undefined' && window.isSecureContext);
  }, []);
  return isSecure;
};

const WeatherSystem = () => {
  const weather = useAppStore(state => state.weather);
  const lightningRef = useRef<THREE.PointLight>(null);

  const timeOfDay = useAppStore(state => state.timeOfDay);

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
        <Stars radius={300} depth={100} count={2000} factor={4} saturation={0} fade speed={2} />
        <Environment preset="night" />
      </>
    );
  }

  if (timeOfDay === 'day') {
    return (
      <>
        <color attach="background" args={['#87ceeb']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
        <Sky sunPosition={[50, 100, 50]} />
        <Environment preset="city" />
      </>
    );
  }

  return (
    <>
      <color attach="background" args={['#0a0a1e']} />
      <ambientLight intensity={0.3} />
      <directionalLight 
        castShadow 
        position={[50, 100, 50]} 
        intensity={1.2} 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {/* Neon city glow lights */}
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#00f0ff" distance={200} decay={2} />
      <pointLight position={[-50, 20, -50]} intensity={0.3} color="#ff00e5" distance={150} decay={2} />
      <pointLight position={[50, 20, 50]} intensity={0.3} color="#4e7cff" distance={150} decay={2} />
      <Stars radius={300} depth={100} count={3000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
    </>
  );
};



const CameraController = () => {
  const cameraTarget = useAppStore(state => state.cameraTarget);
  const viewMode = useAppStore(state => state.viewMode);
  const isCinematic = useAppStore(state => state.isCinematic);

  useFrame((state) => {
    if (!cameraTarget || viewMode !== 'fly' || isCinematic) return;
    const target = new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    state.camera.position.lerp(target, 0.03);
    state.camera.lookAt(cameraTarget.x, 0, cameraTarget.z - 30);
  });

  return null;
};

export const CityScene = () => {
  const viewMode = useAppStore(state => state.viewMode);
  const isCinematic = useAppStore(state => state.isCinematic);
  const isSecure = useIsSecureContext();

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
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
        >
          <CityAudio />
          <WeatherSystem />
          
          <Physics gravity={[0, -30, 0]}>
            <InstancedBuildings />
            <SmokeParticles />
            <MultiplayerSystem />
            <HeatmapGround />
            <DependencyBeams />
            {viewMode === 'walk' && <Player />}
            <HighlightRing />
          </Physics>

          <CinematicCamera />
          <CameraController />

          {viewMode === 'fly' && !isCinematic && (
            <OrbitControls 
              makeDefault 
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={10}
              maxDistance={300}
              enableDamping
              dampingFactor={0.05}
            />
          )}
        </Canvas>
      </KeyboardControls>
    </div>
  );
};
