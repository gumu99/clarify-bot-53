import React, { useMemo } from 'react';

const BackgroundEffects: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 10,
      size: 2 + Math.random() * 3,
      color: ['particle-green', 'particle-purple', 'particle-pink'][Math.floor(Math.random() * 3)],
    }));
  }, []);

  return (
    <>
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.color}`}
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
      
      {/* Corner Glow Effects */}
      <div 
        className="fixed top-0 left-0 w-96 h-96 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at top left, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)',
        }}
      />
      <div 
        className="fixed top-0 right-0 w-96 h-96 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at top right, hsl(var(--neon-green) / 0.06) 0%, transparent 60%)',
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-96 h-96 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at bottom left, hsl(var(--neon-pink) / 0.06) 0%, transparent 60%)',
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at bottom right, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)',
        }}
      />
    </>
  );
};

export default BackgroundEffects;
