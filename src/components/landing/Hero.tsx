'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/50 via-transparent to-[#0a0a14]" />
      
      <div className="relative z-10 text-center max-w-4xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="text-6xl inline-block mb-6">🏙️</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold neon-text mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your Code.<br/>As a City.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Transform any GitHub repository into a living, breathing cyberpunk metropolis. 
          Folders become districts. Files become skyscrapers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            href="/?repo=facebook/react"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--neon-cyan)] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300"
          >
            Explore a City <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
