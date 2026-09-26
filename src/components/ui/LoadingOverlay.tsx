'use client';

import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Surveying repository terrain...',
  'Laying district foundations...',
  'Constructing file skyscrapers...',
  'Wiring neon grid network...',
  'Calibrating height sensors...',
  'Deploying ghost residents...',
  'Analyzing code density...',
  'Rendering skyline geometry...',
];

export const LoadingOverlay = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    const progInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8, 95));
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a14]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-cyan)] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[var(--neon-magenta)] border-l-[var(--neon-magenta)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🏗️</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-400 tracking-wide font-mono transition-opacity duration-300">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
