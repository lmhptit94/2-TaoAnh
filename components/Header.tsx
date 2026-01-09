
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-serif tracking-widest luxury-gradient bg-clip-text text-transparent uppercase font-bold">
            LuxeRenovate AI
          </h1>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-1">
            Cinematic Architectural Transformation
          </p>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-white/60">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
            Phase I: Raw
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
            Phase II: Craft
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
            Phase III: Luxe
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
