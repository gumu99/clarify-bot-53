import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, Info, Heart } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "@/assets/logo.png";

const Index = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

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

  const stripHtmlAndFormat = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let text = '';
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent?.trim();
        if (content) {
          text += content + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        if (element.tagName === 'P' && element.style.color === 'rgb(34, 197, 94)') {
          text += '\n\n' + element.textContent?.trim() + '\n';
        } else if (element.tagName === 'DIV' || element.tagName === 'P') {
          if (element.children.length === 0) {
            text += element.textContent?.trim() + '\n';
          }
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
          text += '\n';
        } else if (element.tagName === 'LI') {
          text += '• ' + element.textContent?.trim() + '\n';
        } else if (element.tagName === 'STRONG') {
          text += '\n' + element.textContent?.trim() + '\n';
        }
        
        Array.from(element.childNodes).forEach(processNode);
      }
    };
    
    Array.from(temp.childNodes).forEach(processNode);
    return text.trim().replace(/\n{3,}/g, '\n\n');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 pt-8 pb-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <img src={logo} alt="AI Logo" className="h-16 w-auto" />
          <div className="flex gap-2 flex-wrap justify-center">
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

        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Try my other creations here:{" "}
            <a 
              href="https://whatsapp.com/channel/0029VbBa1Es2ER6mgaO0Am2V"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WhatsApp Channel
            </a>
          </p>
        </div>

        <Card className="p-6 mb-6 bg-card/50 border-border/50">
          <label className="block text-sm font-medium mb-2">
            Enter text, notes, or concepts to explain:
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text, paragraphs, or concepts here..."
            className="min-h-[200px] mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white placeholder:text-pink-100 border-none rounded-lg"
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
          <Card 
            className={`p-6 bg-card border-border transition-all duration-300 ${
              isLoading ? "animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.5)]" : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold">Generated Explanation</h2>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (outputRef.current) {
                      const cleanText = outputRef.current.innerText;
                      navigator.clipboard.writeText(cleanText);
                      toast.success("Copied to clipboard!");
                    }
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!outputRef.current) return;
                    
                    try {
                      toast.info("Generating PDF...");
                      
                      const canvas = await html2canvas(outputRef.current, {
                        backgroundColor: "#000000",
                        scale: 2,
                        logging: false,
                      });
                      
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF({
                        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                        unit: "px",
                        format: [canvas.width, canvas.height],
                      });
                      
                      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
                      pdf.save("explanation.pdf");
                      toast.success("Downloaded as PDF successfully!");
                    } catch (error) {
                      console.error("Error generating PDF:", error);
                      toast.error("Failed to generate PDF");
                    }
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
            <div className="prose prose-invert max-w-none break-words">
              <div 
                ref={outputRef}
                dangerouslySetInnerHTML={{ __html: output }}
                className="[&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-2 [&_strong]:font-semibold"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
