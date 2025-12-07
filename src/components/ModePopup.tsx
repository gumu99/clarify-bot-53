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
    gradient: 'from-emerald-500/20 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'important' as GenerationMode,
    label: 'Important Topics',
    description: '6-10 critical topics with full explanations',
    icon: Star,
    gradient: 'from-amber-500/20 to-transparent',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'mcqs' as GenerationMode,
    label: 'MCQs',
    description: 'Multiple choice questions',
    icon: HelpCircle,
    gradient: 'from-violet-500/20 to-transparent',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    id: 'summarise' as GenerationMode,
    label: 'Summarise Notes',
    description: '2-3 line summaries (1:1 ratio)',
    icon: FileCheck,
    gradient: 'from-sky-500/20 to-transparent',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-400',
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
        className="w-80 p-3 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl animate-scale-in rounded-2xl"
        side="top"
        align="start"
        sideOffset={12}
      >
        <div className="space-y-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group
                bg-gradient-to-r ${m.gradient}
                ${mode === m.id 
                  ? 'ring-1 ring-white/20 bg-white/5' 
                  : 'hover:bg-white/5'
                }`}
            >
              <div className={`p-2.5 rounded-xl ${m.iconBg} ${m.iconColor} transition-transform group-hover:scale-110`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </div>
              {mode === m.id && (
                <div className="w-2 h-2 rounded-full bg-white/60" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ModePopup;
