import React from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import DonateButton from './DonateButton';
import AboutDialog from './AboutDialog';

const FloatingHeader: React.FC = () => {
  const { isScrolled } = useScrollProgress();

  const iconScale = isScrolled ? 'scale-90' : 'scale-100';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 transition-all duration-300 ${iconScale}`}>
      <DonateButton />
      <AboutDialog />
    </div>
  );
};

export default FloatingHeader;
