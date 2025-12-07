import React, { useRef, useEffect } from 'react';
import { Plus, Send, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ModePopup, { GenerationMode } from './ModePopup';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (file: File) => void;
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  isLoading: boolean;
  isExtracting: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSubmit,
  onFileUpload,
  mode,
  onModeChange,
  isLoading,
  isExtracting,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isExtracting && input.trim()) {
        onSubmit();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const modeLabels: Record<GenerationMode, string> = {
    normal: 'Notes',
    important: 'Important',
    mcqs: 'MCQs',
    summarise: 'Summary',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
      <div className="blur-gradient-bottom absolute inset-0 h-32 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-end gap-2 p-3 rounded-2xl bg-card/95 backdrop-blur-sm border border-border shadow-lg">
          <ModePopup mode={mode} onModeChange={onModeChange}>
            <Button
              variant="ghost"
              size="icon"
              className="btn-neon shrink-0 rounded-full hover:bg-muted"
              title="Select mode"
            >
              <Plus className="w-5 h-5 text-neon-purple" />
            </Button>
          </ModePopup>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="btn-neon shrink-0 rounded-full hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            title="Upload file"
          >
            {isExtracting ? (
              <Loader2 className="w-5 h-5 text-neon-purple animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-neon-green" />
            )}
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter your topic for ${modeLabels[mode]}...`}
              className="min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground pr-2"
              rows={1}
            />
          </div>

          <Button
            onClick={onSubmit}
            disabled={isLoading || isExtracting || !input.trim()}
            className="btn-neon shrink-0 rounded-full bg-neon-purple hover:bg-neon-purple/90 text-white"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-card/50">
            Mode: <span className="text-neon-purple">{modeLabels[mode]}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
