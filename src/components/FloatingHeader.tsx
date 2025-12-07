import React from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import DonateButton from './DonateButton';
import AboutDialog from './AboutDialog';

const FloatingHeader: React.FC = () => {
  const { scrollProgress } = useScrollProgress();
  
  // Scale and blur based on scroll (scrollProgress is 0-100)
  const normalizedProgress = scrollProgress / 100;
  const scale = Math.max(0.85, 1 - normalizedProgress * 0.15);
  const blur = normalizedProgress * 2;
  const opacity = Math.max(0.7, 1 - normalizedProgress * 0.3);

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex items-center gap-3 transition-all duration-300"
      style={{
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity,
      }}
    >
      <DonateButton />
      <AboutDialog />
    </div>
  );
};

export default FloatingHeader;
