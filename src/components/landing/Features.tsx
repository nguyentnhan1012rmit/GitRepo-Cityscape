'use client';
import React from 'react';
import { motion } from 'framer-motion';

const features = [
  { icon: '🏗️', title: 'Procedural Generation', desc: 'D3 Squarified Treemaps generate city layouts' },
  { icon: '⏳', title: 'Time Machine', desc: 'Scrub through commit history and watch the city evolve' },
  { icon: '⛈️', title: 'Weather System', desc: 'Failed CI/CD builds trigger thunderstorms' },
  { icon: '👤', title: 'Walk Mode', desc: 'Drop to street level and explore with WASD' },
  { icon: '🔥', title: 'Live Status', desc: 'Hot files glow cyan, PR fires emit smoke' },
  { icon: '📸', title: 'Export', desc: 'Screenshot in 4K or download as .OBJ for 3D printing' },
];

export const Features = () => {
  return (
    <section className="py-24 relative z-10 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 font-mono text-[var(--neon-cyan)]">System Architecture</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Advanced visualization techniques mapping abstract code to physical dimensions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors border border-white/5"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
