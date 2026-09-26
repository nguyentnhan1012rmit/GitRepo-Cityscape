import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden selection:bg-[var(--neon-cyan)] selection:text-black">
      <Hero />
      <Features />
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5">
        <p>Built with Next.js, Three.js, and Rapier Physics</p>
      </footer>
    </main>
  );
}
