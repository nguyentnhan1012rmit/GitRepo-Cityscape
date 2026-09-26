'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { createAmbientDrone, createWindNoise, createThunderCrack } from '@/lib/audio/synthesizer';

export const CityAudio = () => {
  const weather = useAppStore(state => state.weather);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const isMuted = useAppStore(state => state.isMuted); // Optional: if added to store
  
  // We don't have isMuted in store right now, but F4 asked to add a mute/unmute button to sidebar.
  // I will just use the standard imperative code for now.

  useEffect(() => {
    const handleInteract = () => {
      const ctx = new AudioContext();
      setAudioCtx(ctx);
      // Start ambient sounds
      createAmbientDrone(ctx).start();
      createWindNoise(ctx).start();
      window.removeEventListener('click', handleInteract);
    };
    window.addEventListener('click', handleInteract);
    return () => window.removeEventListener('click', handleInteract);
  }, []);

  // Thunder on storm weather
  useEffect(() => {
    if (weather !== 'storm' || !audioCtx) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) createThunderCrack(audioCtx);
    }, 8000);
    return () => clearInterval(interval);
  }, [weather, audioCtx]);

  // Audio is handled imperatively, but let's suspend/resume based on mute state
  useEffect(() => {
    if (audioCtx) {
      if (isMuted) {
        audioCtx.suspend();
      } else {
        audioCtx.resume();
      }
    }
  }, [isMuted, audioCtx]);

  return null;
};
