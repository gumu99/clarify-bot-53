import React from 'react';
import { Info, Sparkles, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AboutDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="btn-neon rounded-xl h-10 w-10 glass border border-border/50 hover:bg-muted/50 group"
          title="About"
        >
          <Info className="w-4 h-4 text-neon-purple group-hover:scale-110 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border/50 max-w-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">About This Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Creator Info */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-neon-purple/20 to-transparent border border-neon-purple/20">
              <Sparkles className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">The Creator</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Built by a 2nd Year CSE (AI/ML) student at Brainware University.
                This tool was born from the need for better study materials.
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-neon-green/20 to-transparent border border-neon-green/20">
              <Zap className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Purpose</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate comprehensive notes, identify important topics, create MCQs, 
                or summarize content - all powered by advanced AI.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-neon-pink/20 to-transparent border border-neon-pink/20">
              <Code className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Gemini 2.5', 'Lovable Cloud'].map((tech) => (
                  <span 
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-lg glass text-muted-foreground border border-border/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-glow-pulse" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <p className="text-xs text-center text-muted-foreground/70">
            Made with passion for students, by a student
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
