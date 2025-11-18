import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 bg-card border-border">
          <h1 className="text-4xl font-bold mb-6">About Professional Explainer AI</h1>
          
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">What is this?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Professional Explainer AI is a powerful tool designed to transform complex text,
                notes, and concepts into clear, structured, and deeply understandable explanations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">How it works</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Simply paste any content you want explained, and our AI will generate:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>A simple explanation for beginners</li>
                <li>Detailed professional analysis</li>
                <li>Breakdown of complex terms</li>
                <li>Real-world examples</li>
                <li>Why the topic matters</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Clean, professional formatting</li>
                <li>Beginner-friendly explanations</li>
                <li>Real-time streaming responses</li>
                <li>Comprehensive coverage of topics</li>
                <li>Beautiful markdown formatting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Perfect for</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Students studying complex topics</li>
                <li>Professionals learning new concepts</li>
                <li>Anyone wanting clearer understanding</li>
                <li>Breaking down technical jargon</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
