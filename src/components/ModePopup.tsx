import React from 'react';
import { FileText, Star, HelpCircle, FileCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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
    color: 'text-neon-green',
  },
  {
    id: 'important' as GenerationMode,
    label: 'Important Topics',
    description: '6-10 critical topics with full explanations',
    icon: Star,
    color: 'text-neon-pink',
  },
  {
    id: 'mcqs' as GenerationMode,
    label: 'MCQs',
    description: 'Multiple choice questions',
    icon: HelpCircle,
    color: 'text-neon-purple',
  },
  {
    id: 'summarise' as GenerationMode,
    label: 'Summarise Notes',
    description: '2-3 line summaries (1:1 ratio)',
    icon: FileCheck,
    color: 'text-neon-blue',
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
        className="w-72 p-2 bg-card border-border"
        side="top"
        align="start"
      >
        <div className="space-y-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted ${
                mode === m.id ? 'bg-muted border border-neon-purple/50' : ''
              }`}
            >
              <m.icon className={`w-5 h-5 mt-0.5 ${m.color}`} />
              <div className="text-left">
                <p className={`font-medium ${m.color}`}>{m.label}</p>
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
