import { Code2,Timer, PenTool, Layers, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Database } from "lucide-react";
const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm text-primary font-medium tracking-widest uppercase">Features</span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mt-4">
            Precision-Engineered
            <br />
            <span className="text-muted-foreground">For Excellence</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border/50 rounded-xl overflow-hidden">
          
          {/* Card 1 - Algorithm Arena (Replaces Voice Analysis) */}
          <Link to="/code-arena" className="lg:col-span-2 lg:row-span-2 block group cursor-pointer h-full">
            <div className="bento-card flex flex-col justify-between min-h-[300px] lg:min-h-[400px] h-full transition-all group-hover:border-primary/50">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <Timer className="w-3 h-3 text-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-tighter">Live Contest Mode</span>
                  </div>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-medium mb-3">
                  Algorithm Arena
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Face dynamic, AI-generated Medium and Hard coding challenges. 
                  Race against the clock and receive instant evaluation on logic, 
                  time complexity ($O(n)$), and edge-case handling.
                </p>
              </div>

              {/* Terminal / Code Editor Visual */}
              <div className="mt-8 rounded-lg bg-black/60 border border-white/5 p-4 font-mono text-[11px] overflow-hidden relative group-hover:bg-black/80 transition-colors">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-blue-400">public class Solution &#123;</p>
                  <p className="text-purple-400 pl-4">public int lengthOfLongestSubstring(String s) &#123;</p>
                  <p className="text-white pl-8">Set&lt;Character&gt; set = new HashSet&lt;&gt;();</p>
                  <p className="text-white pl-8">int res = 0, left = 0;</p>
                  <p className="text-green-500/60 pl-8">// AI Prompting: Optimize for O(n) using Sliding Window</p>
                  <p className="text-white pl-8">for (int r = 0; r &lt; s.length(); r++) &#123; ... &#125;</p>
                  <p className="text-purple-400 pl-4">&#125;</p>
                  <p className="text-blue-400">&#125;</p>
                </div>
                {/* Visual Timer Badge */}
                <div className="absolute bottom-4 right-4 bg-primary/20 backdrop-blur-md px-3 py-1 rounded border border-primary/30 text-primary font-bold">
                  23:41.08
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2 - Tall (System Design Canvas) -> LINKED */}
          <Link to="/system-design" className="lg:row-span-2 block h-full group">
            <div className="bento-card flex flex-col min-h-[300px] h-full transition-colors group-hover:border-primary/50 cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">
                System Design Canvas
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Interactive whiteboard for architecting distributed systems with 
                real-time AI validation.
              </p>

              {/* Mini Canvas Visual */}
              <div className="flex-1 bg-secondary/50 rounded-lg p-4 border border-border/50">
                <div className="w-full h-full relative">
                  <div className="absolute top-2 left-2 w-16 h-8 border border-primary/50 rounded flex items-center justify-center text-[10px] text-primary">
                    API Gateway
                  </div>
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-12 h-8 border border-muted-foreground/30 rounded flex items-center justify-center text-[10px] text-muted-foreground">
                    LB
                  </div>
                  <div className="absolute bottom-2 left-4 w-14 h-8 border border-muted-foreground/30 rounded flex items-center justify-center text-[10px] text-muted-foreground">
                    Service A
                  </div>
                  <div className="absolute bottom-2 right-4 w-14 h-8 border border-muted-foreground/30 rounded flex items-center justify-center text-[10px] text-muted-foreground">
                    Service B
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="30%" x2="50%" y2="50%" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="50%" y1="60%" x2="30%" y2="80%" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="50%" y1="60%" x2="70%" y2="80%" stroke="hsl(var(--border))" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3 - Small */}
          <Link to="/scenarios" className="bento-card min-h-[180px] group cursor-pointer block hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">
              150+ Azure & Java Scenarios
            </h3>
            <p className="text-muted-foreground text-sm">
              Industry-relevant questions curated by FAANG engineers.
            </p>
          </Link>

          {/* Card 4 - Small (NEW: SQL Gym) */}
          <Link to="/sql-detective" className="bento-card min-h-[180px] group cursor-pointer block hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">
              SQL Performance Gym
            </h3>
            <p className="text-muted-foreground text-sm">
              Optimize slow queries, fix indexing, and master schema design.
            </p>
          </Link>
          
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
