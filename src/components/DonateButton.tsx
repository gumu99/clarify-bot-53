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
    window.open(upiLink, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="btn-neon rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted"
          title="Donate"
        >
          <Heart className="w-5 h-5 text-neon-pink" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-neon-green">Support This Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your support helps keep this tool free for everyone!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <p className="text-sm text-muted-foreground mb-2">UPI ID:</p>
            <p className="text-lg font-mono text-neon-purple">{upiId}</p>
          </div>
          <Button
            onClick={handleDonate}
            className="w-full btn-neon bg-gradient-to-r from-neon-purple to-neon-pink text-white"
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
