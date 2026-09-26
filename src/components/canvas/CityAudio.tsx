'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PositionalAudio } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';

// A valid silent WAV file encoded in base64 to prevent AudioLoader from crashing
const SILENT_MP3 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

const SERVER_HUM = SILENT_MP3;
const WIND = SILENT_MP3;
const THUNDER = SILENT_MP3;

export const CityAudio = () => {
  const repoData = useAppStore(state => state.repoData);
  const weather = useAppStore(state => state.weather);
  const [hasInteracted, setHasInteracted] = useState(false);
  const thunderRef = useRef<any>(null);

  // Browser autoplay policy requires user interaction before playing audio
  useEffect(() => {
    const handleInteract = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('keydown', handleInteract);
    };
    window.addEventListener('click', handleInteract);
    window.addEventListener('keydown', handleInteract);
    return () => {
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('keydown', handleInteract);
    };
  }, []);

  // Find the top 3 largest buildings to attach the server hum
  const massiveBuildings = React.useMemo(() => {
    if (!repoData) return [];
    return [...repoData]
      .filter(b => b.type === 'blob')
      .sort((a, b) => (b.userData.size || 0) - (a.userData.size || 0))
      .slice(0, 3);
  }, [repoData]);

  // Thunder trigger
  useEffect(() => {
    if (weather === 'storm' && hasInteracted && thunderRef.current) {
      const triggerThunder = () => {
        if (Math.random() > 0.7 && !thunderRef.current.isPlaying) {
          thunderRef.current.play();
        }
      };
      const interval = setInterval(triggerThunder, 10000); // Random thunder every 10s
      return () => clearInterval(interval);
    }
  }, [weather, hasInteracted]);

  if (!hasInteracted) return null;

  return (
    <group>
      {/* Ambient Wind (Far away, global) */}
      <PositionalAudio url={WIND} distance={100} loop autoplay />
      
      {/* Thunder (Global) */}
      <PositionalAudio ref={thunderRef} url={THUNDER} distance={500} loop={false} />

      {/* Positional Server Hum for Massive Files */}
      {massiveBuildings.map((building) => (
        <group key={building.id} position={[building.x, building.height / 2, building.z]}>
          <PositionalAudio 
            url={SERVER_HUM} 
            distance={20} // Drops off quickly
            loop 
            autoplay 
          />
        </group>
      ))}
    </group>
  );
};
