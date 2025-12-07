import React, { useRef } from 'react';
import { Copy, Download, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface OutputDisplayProps {
  output: string;
  isLoading: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading }) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!outputRef.current) return;
    
    const text = outputRef.current.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!outputRef.current) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 6;
    const contentWidth = pageWidth - 2 * margin;

    // Black background
    pdf.setFillColor(5, 5, 5);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    let y = margin;

    // Title
    pdf.setTextColor(0, 255, 128);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI NOTES GENERATOR', pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Content
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const text = outputRef.current.innerText;
    const lines = text.split('\n');

    for (const line of lines) {
      if (y > pageHeight - margin - 15) {
        pdf.addPage();
        pdf.setFillColor(5, 5, 5);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        y = margin;
      }

      if (line.startsWith('# ') || line.match(/^[A-Z\s]+:$/)) {
        pdf.setTextColor(0, 255, 128);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
      } else if (line.startsWith('## ') || line.match(/^\*\*.*\*\*$/)) {
        pdf.setTextColor(255, 105, 180);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
      } else if (line.startsWith('### ')) {
        pdf.setTextColor(187, 134, 252);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
      }

      const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      const wrappedLines = pdf.splitTextToSize(cleanLine, contentWidth);

      for (const wrappedLine of wrappedLines) {
        if (y > pageHeight - margin - 15) {
          pdf.addPage();
          pdf.setFillColor(5, 5, 5);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          y = margin;
        }
        pdf.text(wrappedLine, margin, y);
        y += lineHeight;
      }
    }

    // Footer
    const footerY = pageHeight - 8;
    pdf.setTextColor(187, 134, 252);
    pdf.setFontSize(8);
    pdf.text('Made with AI Notes Generator', pageWidth / 2, footerY, { align: 'center' });

    pdf.save('ai-notes.pdf');
    toast.success('PDF downloaded!');
  };

  if (!output && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative inline-block">
            <div 
              className="absolute inset-0 blur-2xl"
              style={{
                background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.3) 0%, transparent 70%)',
              }}
            />
            <Sparkles className="w-12 h-12 text-neon-purple relative animate-float" />
          </div>
          <p className="text-lg text-muted-foreground">Enter a topic to generate notes</p>
          <p className="text-sm text-muted-foreground/60">Choose a mode using the + button</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 pb-48 pt-4">
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Action Buttons */}
        {output && (
          <div className="flex gap-3 mb-6 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="btn-neon glass border-border/50 hover:bg-muted/50 rounded-xl px-4"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-neon-green" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="btn-neon glass border-border/50 hover:bg-muted/50 rounded-xl px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        )}

        {/* Output Container */}
        <div
          ref={outputRef}
          className={`notes-output glass rounded-2xl p-6 md:p-8 transition-all duration-300 ${
            isLoading 
              ? 'animate-border-glow border-2 border-neon-purple/50' 
              : 'border border-border/50'
          }`}
        >
          {isLoading && !output && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Generating...</span>
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: output || '' }} />
          {isLoading && output && (
            <span className="typing-indicator" />
          )}
        </div>

        {output && (
          <p className="text-xs text-muted-foreground/50 text-center mt-6">
            PDF download works on PC only
          </p>
        )}
      </div>
    </div>
  );
};

export default OutputDisplay;
