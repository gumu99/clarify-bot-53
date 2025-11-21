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

        <Card className="p-8 bg-card border-border space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">Student • Developer • Builder</p>
            <h1 className="text-4xl font-bold">Built by a Student,<br />For Students</h1>
            <p className="text-lg text-muted-foreground">"Why pay for premium when you can build it yourself?" 🎯</p>
          </div>

          {/* The Origin Story */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">The Origin Story</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>Hi there! 👋 I'm a second-year Computer Science & Engineering (AI/ML) student at Brainware University.</p>
              <p>Like many students, I love music. Unlike many students, I got fed up with Spotify's constant premium prompts. So naturally, I did what any developer would do—I built my own solution. 🎵</p>
              <p>But why stop there? I realized students need more than just music. They need powerful tools to study smarter, not harder. That's when this AI-powered note generator was born.</p>
            </div>
          </section>

          {/* Why I Built This */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Why I Built This</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>Traditional note-taking is slow. Reading through textbooks is overwhelming. And let's be honest—most of us leave studying until the last minute. 😅</p>
              <p>This AI note generator transforms any study material into comprehensive, structured notes in seconds. It's like having a personal tutor who never gets tired and explains everything in detail.</p>
              <p>From biology to computer science, from physics to humanities—if you can paste it, we can transform it into study gold. ✨</p>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Tech Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">React</h3>
                <p className="text-sm text-muted-foreground">UI framework for smooth interactions</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">TypeScript</h3>
                <p className="text-sm text-muted-foreground">Type-safe code for reliability</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">Tailwind CSS</h3>
                <p className="text-sm text-muted-foreground">Beautiful, responsive design</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">AI Models</h3>
                <p className="text-sm text-muted-foreground">Powered by Gemini 2.5-Flash</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">Lovable Cloud</h3>
                <p className="text-sm text-muted-foreground">Serverless backend infrastructure</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-1">Markdown</h3>
                <p className="text-sm text-muted-foreground">Rich text formatting for notes</p>
              </div>
            </div>
          </section>

          {/* Quote */}
          <div className="text-center py-6 border-y border-border">
            <p className="text-lg italic text-muted-foreground">"The best way to learn is to build something you wish existed."</p>
            <p className="text-sm text-muted-foreground mt-2">— Every developer ever</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-sm text-muted-foreground">2nd Year CSE Student</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-3xl mb-2">🎵</div>
              <p className="text-sm text-muted-foreground">Music Player Builder</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-sm text-muted-foreground">AI/ML Enthusiast</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-6">
            <p className="text-muted-foreground">Built with 💙 by a student who refused to pay for premium</p>
            <p className="text-sm text-muted-foreground">Keep learning. Keep building. Keep growing. 🚀</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
