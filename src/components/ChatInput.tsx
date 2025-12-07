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
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Bottom blur gradient */}
      <div className="blur-gradient-bottom absolute inset-0 h-40 -top-20 pointer-events-none" />
      
      <div className="relative px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          {/* Input Container */}
          <div 
            className={`input-glow rounded-2xl p-2 transition-all duration-300 bg-card border border-border`}
          >
            <div className="flex items-end gap-2">
              {/* Mode Select Button */}
              <ModePopup mode={mode} onModeChange={onModeChange}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="btn-neon shrink-0 rounded-xl h-11 w-11 bg-muted/50 hover:bg-muted border border-border/50"
                  title="Select mode"
                >
                  <Plus className="w-5 h-5 text-foreground" />
                </Button>
              </ModePopup>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Upload Button */}
              <Button
                variant="ghost"
                size="icon"
                className="btn-neon shrink-0 rounded-xl h-11 w-11 bg-muted/50 hover:bg-muted border border-border/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                title="Upload file"
              >
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 text-gpt-blue animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-foreground" />
                )}
              </Button>

              {/* Textarea */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Enter your topic for ${modeLabels[mode]}...`}
                  className="min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground pr-2 py-3"
                  rows={1}
                />
              </div>

              {/* Submit Button - Tiny */}
              <button
                onClick={onSubmit}
                disabled={isLoading || isExtracting || !input.trim()}
                className="shrink-0 rounded-full h-5 w-5 bg-gpt-blue hover:bg-gpt-blue/80 disabled:bg-muted disabled:opacity-50 flex items-center justify-center transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-white" />
                ) : (
                  <Send className="w-2.5 h-2.5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">
              Mode: <span className="text-foreground">{modeLabels[mode]}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
