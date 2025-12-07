import React, { useMemo } from 'react';

const BackgroundEffects: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 20 + Math.random() * 15,
      size: 2 + Math.random() * 2,
      color: ['particle-purple', 'particle-pink'][Math.floor(Math.random() * 2)],
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
    </>
  );
};

export default BackgroundEffects;
