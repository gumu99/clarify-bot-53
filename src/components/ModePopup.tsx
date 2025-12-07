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
  },
  {
    id: 'important' as GenerationMode,
    label: 'Important Topics',
    description: '6-10 critical topics with full explanations',
    icon: Star,
  },
  {
    id: 'mcqs' as GenerationMode,
    label: 'MCQs',
    description: 'Multiple choice questions',
    icon: HelpCircle,
  },
  {
    id: 'summarise' as GenerationMode,
    label: 'Summarise Notes',
    description: '2-3 line summaries (1:1 ratio)',
    icon: FileCheck,
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
        className="w-72 p-2 bg-card border-border animate-scale-in"
        side="top"
        align="start"
        sideOffset={12}
      >
        <div className="space-y-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`mode-card w-full flex items-start gap-3 p-3 rounded-xl
                ${mode === m.id 
                  ? 'bg-muted' 
                  : 'hover:bg-muted/50'
                }`}
            >
              <m.icon className="w-5 h-5 text-foreground mt-0.5" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ModePopup;
