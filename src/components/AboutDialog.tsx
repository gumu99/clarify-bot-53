import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          className="btn-neon rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted"
          title="About"
        >
          <Info className="w-5 h-5 text-neon-green" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-neon-green">About AI Notes Generator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm text-muted-foreground">
          <p>
            Hi! I'm a second-year Computer Science & Engineering (AI/ML) student at Brainware University.
          </p>
          <p>
            I built this AI-powered note generator to help students like me study more efficiently. 
            Whether you need detailed notes, important topics for quick revision, or MCQs for practice, 
            this tool has got you covered.
          </p>
          <div className="pt-4 border-t border-border">
            <p className="font-semibold text-neon-purple mb-2">Tech Stack:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>React + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>OpenAI GPT-4o & GPT-4o-mini</li>
              <li>Lovable Cloud (Supabase)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
