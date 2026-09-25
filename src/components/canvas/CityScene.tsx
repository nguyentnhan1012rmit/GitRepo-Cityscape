'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { InstancedBuildings } from './InstancedBuildings';

export const CityScene = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 45 }}
        shadows
      >
        <color attach="background" args={['#1a1a2e']} />
        
        {/* Environment & Lighting */}
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
