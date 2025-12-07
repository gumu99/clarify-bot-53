import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative text-center py-12 md:py-16 px-4 overflow-hidden">
      {/* Glow behind title */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--neon-purple) / 0.15) 0%, transparent 50%)',
        }}
      />
      
      {/* Main Title */}
      <h1 
        className="relative text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-4 animate-text-flicker tracking-tight"
        style={{
          textShadow: '0 0 10px hsl(270 100% 75% / 0.2), 0 0 20px hsl(270 100% 75% / 0.1)'
        }}
      >
        AI NOTES GENERATOR
      </h1>
      
      {/* Subtitle */}
      <p className="relative text-muted-foreground text-sm md:text-base tracking-widest uppercase">
        <span className="inline-block mx-2 text-neon-green">Student</span>
        <span className="text-border">•</span>
        <span className="inline-block mx-2 text-neon-purple">Developer</span>
        <span className="text-border">•</span>
        <span className="inline-block mx-2 text-neon-pink">Builder</span>
      </p>
      
      {/* Decorative dot */}
      <div className="relative mt-6 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
      </div>
    </header>
  );
};

export default Header;
