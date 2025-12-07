import React from 'react';
import { History, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import DonateButton from './DonateButton';
import AboutDialog from './AboutDialog';

const FloatingHeader: React.FC = () => {
  const { isScrolled } = useScrollProgress();

  const iconScale = isScrolled ? 'scale-90' : 'scale-100';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 transition-all duration-300 ${iconScale}`}>
      <Button
        variant="ghost"
        size="icon"
        className="btn-neon rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted"
        title="History"
      >
        <History className="w-5 h-5 text-neon-purple" />
      </Button>
      
      <DonateButton />
      
      <AboutDialog />
    </div>
  );
};

export default FloatingHeader;
