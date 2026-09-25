'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { InstancedBuildings } from './InstancedBuildings';
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
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 45 }}
        shadows
      >
        <WeatherSystem />
        <InstancedBuildings />

        <OrbitControls 
          makeDefault 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
          minDistance={10}
          maxDistance={300}
        />
      </Canvas>
    </div>
  );
};
