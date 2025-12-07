import React, { useRef } from 'react';
import { Copy, Download, Check } from 'lucide-react';
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
    pdf.setFillColor(13, 13, 13);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    let y = margin;

    // Title
    pdf.setTextColor(0, 255, 128); // Neon green
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
        pdf.setFillColor(13, 13, 13);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        y = margin;
      }

      // Check for headers
      if (line.startsWith('# ') || line.match(/^[A-Z\s]+:$/)) {
        pdf.setTextColor(0, 255, 128); // Neon green for headers
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
      } else if (line.startsWith('## ') || line.match(/^\*\*.*\*\*$/)) {
        pdf.setTextColor(255, 105, 180); // Neon pink for subheaders
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
      } else if (line.startsWith('### ')) {
        pdf.setTextColor(187, 134, 252); // Neon purple for h3
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
          pdf.setFillColor(13, 13, 13);
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
    pdf.text('Made with note-genesis-pro.lovable.app', pageWidth / 2, footerY, { align: 'center' });

    pdf.save('ai-notes.pdf');
    toast.success('PDF downloaded!');
  };

  if (!output && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Enter a topic to generate notes</p>
          <p className="text-sm">Choose a mode using the + button</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 pb-40 pt-4">
      <div className="max-w-3xl mx-auto">
        {output && (
          <div className="flex gap-2 mb-4 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="btn-neon border-border hover:bg-muted"
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
              className="btn-neon border-border hover:bg-muted"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        )}

        <div
          ref={outputRef}
          className={`notes-output rounded-xl p-6 bg-card/50 border ${
            isLoading ? 'border-neon-purple animate-border-glow' : 'border-border'
          }`}
          dangerouslySetInnerHTML={{ __html: output || '' }}
        />

        {output && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            PDF download works on PC only — may not work on mobile devices.
          </p>
        )}
      </div>
    </div>
  );
};

export default OutputDisplay;
