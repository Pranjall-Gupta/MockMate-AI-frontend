import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import CodeVisual from "./CodeVisual";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/50" />
      
      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">AI-Powered Technical Interviews</span>
        </div>

        {/* Main Headline */}
        <h1 
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.1] tracking-tight mb-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          WHERE PREPARATION
          <br />
          <span className="text-gradient-gold">MEETS PERFECTION.</span>
        </h1>

        {/* Subheadline */}
        <p 
          className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Master your System Design and DSA interviews with the world's 
          most sophisticated AI evaluator.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          {/* Primary Button */}
          <Link to="/interview">
            <Button variant="hero" size="xl" className="rounded-full group">
              Start Your Interview
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          {/* Secondary Button: ROAST MY RESUME (Glass + Gold Theme) */}
          <Link to="/resume">
             <Button variant="glass" size="xl" className="rounded-full group hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all">
                <Flame className="w-5 h-5 text-yellow-500 group-hover:fill-yellow-500/20 transition-colors" />
                <span className="ml-2 group-hover:text-yellow-500 transition-colors">Roast My Resume</span>
             </Button>
          </Link>
        </div>

        {/* Floating Code Visual */}
        <div 
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <CodeVisual />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
