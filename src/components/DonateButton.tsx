import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DonateButton: React.FC = () => {
  const upiId = 'gumu642@okicici';
  const upiLink = `upi://pay?pa=${upiId}&pn=AI%20Notes%20Generator&cu=INR`;

  const handleDonate = () => {
    window.location.href = upiLink;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="btn-neon rounded-xl h-10 w-10 glass border border-border/50 hover:bg-muted/50 group"
          title="Donate"
        >
          <Heart className="w-4 h-4 text-neon-pink group-hover:scale-110 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border/50 max-w-sm animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">Support This Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your support helps keep this tool free for everyone!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-xl glass border border-border/50">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">UPI ID</p>
            <p className="text-lg font-mono text-neon-purple">{upiId}</p>
          </div>
          <Button
            onClick={handleDonate}
            className="w-full btn-neon rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white border-0 h-12"
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate via UPI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonateButton;
