import React from 'react';
import { FileText, Star, HelpCircle, FileCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type GenerationMode = 'normal' | 'important' | 'mcqs' | 'summarise';

interface ModePopupProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  children: React.ReactNode;
}

const modes = [
  {
    id: 'normal' as GenerationMode,
    label: 'Normal Notes',
    description: 'Full detailed academic notes',
    icon: FileText,
    gradient: 'from-neon-green/20 to-transparent',
    iconColor: 'text-neon-green',
    glowColor: 'hsl(var(--neon-green))',
  },
  {
    id: 'important' as GenerationMode,
    label: 'Important Topics',
    description: '6-10 critical topics with full explanations',
    icon: Star,
    gradient: 'from-neon-pink/20 to-transparent',
    iconColor: 'text-neon-pink',
    glowColor: 'hsl(var(--neon-pink))',
  },
  {
    id: 'mcqs' as GenerationMode,
    label: 'MCQs',
    description: 'Multiple choice questions',
    icon: HelpCircle,
    gradient: 'from-neon-purple/20 to-transparent',
    iconColor: 'text-neon-purple',
    glowColor: 'hsl(var(--neon-purple))',
  },
  {
    id: 'summarise' as GenerationMode,
    label: 'Summarise Notes',
    description: '2-3 line summaries (1:1 ratio)',
    icon: FileCheck,
    gradient: 'from-neon-cyan/20 to-transparent',
    iconColor: 'text-neon-cyan',
    glowColor: 'hsl(var(--neon-cyan))',
  },
];

const ModePopup: React.FC<ModePopupProps> = ({ mode, onModeChange, children }) => {
  const [open, setOpen] = React.useState(false);

  const handleModeSelect = (selectedMode: GenerationMode) => {
    onModeChange(selectedMode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-3 glass-strong border-border/50 animate-scale-in"
        side="top"
        align="start"
        sideOffset={12}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Select Mode
          </p>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`mode-card w-full flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r ${m.gradient} 
                ${mode === m.id 
                  ? 'ring-1 ring-neon-purple/50 bg-muted/50' 
                  : 'hover:bg-muted/30'
                }`}
            >
              <div 
                className={`p-2 rounded-lg bg-card/80 ${m.iconColor}`}
                style={{ boxShadow: `0 0 15px ${m.glowColor}40` }}
              >
                <m.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${m.iconColor}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </div>
              {mode === m.id && (
                <div className="w-2 h-2 rounded-full bg-neon-purple animate-glow-pulse mt-2" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ModePopup;
