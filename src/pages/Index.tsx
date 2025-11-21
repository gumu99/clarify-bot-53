import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, Info, Heart } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const Index = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateNotes = async () => {
    if (!input.trim()) {
      toast.error("Please enter some content to explain");
      return;
    }

    setIsLoading(true);
    setOutput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ input }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate notes");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setOutput((prev) => prev + content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast.success("Explanation generated successfully!");
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Professional Explainer AI</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const upiUrl = "upi://pay?pa=gumu642@okicici&pn=AI%20Notes%20Generator&cu=INR";
                window.open(upiUrl, '_blank');
                toast.success("Opening payment app...");
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
            <Link to="/about">
              <Button variant="outline" size="sm">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-6 mb-6 bg-card border-border">
          <label className="block text-sm font-medium mb-2">
            Enter text, notes, or concepts to explain:
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text, paragraphs, or concepts here..."
            className="min-h-[200px] mb-4 bg-background border-border text-foreground"
          />
          <Button
            onClick={generateNotes}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Explanation...
              </>
            ) : (
              "Generate Professional Explanation"
            )}
          </Button>
        </Card>

        {output && (
          <Card className="p-6 bg-card border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Generated Explanation</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pdf = new jsPDF();
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const margin = 15;
                    const maxWidth = pageWidth - 2 * margin;
                    
                    // Split text into lines that fit the page width
                    const lines = pdf.splitTextToSize(output, maxWidth);
                    
                    let yPosition = 20;
                    const lineHeight = 7;
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    lines.forEach((line: string) => {
                      if (yPosition > pageHeight - 20) {
                        pdf.addPage();
                        yPosition = 20;
                      }
                      pdf.text(line, margin, yPosition);
                      yPosition += lineHeight;
                    });
                    
                    pdf.save("explanation.pdf");
                    toast.success("Downloaded as PDF successfully!");
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none break-words whitespace-pre-wrap overflow-wrap-anywhere">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
