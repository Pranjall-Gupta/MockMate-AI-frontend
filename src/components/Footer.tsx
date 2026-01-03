import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowRight, 
  Github as GithubIcon, 
  X as XIcon, 
  Linkedin, 
  Code2, 
  Terminal,
  Sparkles,
  Eye,
  Cpu,
  Mic,
  Layout,
  FileText,
  Database,
  Search,
  ShieldCheck,
  Zap
} from "lucide-react";

const XIconBranded = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    aria-hidden="true" 
    className={className} 
    fill="currentColor"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.311 17.404z" />
  </svg>
);

const Footer = ({ roadmapState, featuresState, systemState }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the props instead of local state
  const isRoadmapModalOpen = roadmapState.isOpen;
  const setIsRoadmapModalOpen = roadmapState.setIsOpen;
  
  const isFeaturesModalOpen = featuresState.isOpen;
  const setIsFeaturesModalOpen = featuresState.setIsOpen;

  const isSystemModalOpen = systemState.isOpen;
  const setIsSystemModalOpen = systemState.setIsOpen;

  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // This stops the page from refreshing!
    
    if (!email) return;
    setIsLoading(true);

    try {
      // Use port 8081 as per your application.properties
      const response = await fetch("http://localhost:8081/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Welcome to the inner circle!", {
          description: "You've been added to the MockMate AI waitlist.",
          style: { background: "#0F172A", color: "#FACC15", border: "1px solid #FACC1533" }
        });
        setEmail(""); // Clear the input on success
      } else {
        const errorMsg = await response.text();
        toast.error(errorMsg || "Already on the list!");
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: "Please ensure your Spring Boot backend is running on port 8081."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinks = {
    Product: [
      { name: "Features", href: "#", isFeaturesPopup: true },
      { name: "Roadmap", href: "#", isRoadmapPopup: true }, // Updated to trigger popup
      { name: "Waitlist", href: "#waitlist", isWaitlistLink: true }
    ],
    Resources: [
      { name: "Documentation", href: "https://github.com/Pranjall-Gupta/MockMate-AI#readme" },
      { name: "System Design", href: "#", isSystemPopup: true },
      { name: "API Reference", href: "#",isApiPopup: true } 
    ],
    Developer: [
      { name: "Main Portfolio", href: "https://pranjalgupta.dev" },
      { name: "LinkedIn", href: "https://www.linkedin.com/in/pranjal-gupta-4367052a0/" },
      { name: "LeetCode", href: "https://leetcode.com/u/Pranjal__Gupta/" }
    ]
  };

  // Missing array that was causing your error
  const milestones = [
    {
      phase: "Phase 1",
      title: "Foundation",
      status: "Completed",
      items: ["GPT-4o Integration", "Azure Speech Engine", "Excalidraw Support"],
    },
    {
      phase: "Phase 2",
      title: "Advanced Intelligence",
      status: "In Progress",
      items: ["Voice Sentiment Analysis", "JWT Security Layer", "Live Evaluation"],
    },
    {
      phase: "Phase 3",
      title: "Ecosystem Expansion",
      status: "Planned",
      items: ["Mobile App (React Native)", "Community Scenarios", "Enterprise Portal"],
    }
  ];

  const features = [
    {
      title: "Interview Simulator",
      desc: "Simulate high-pressure technical interviews with real-time voice interaction. \nPowered by Azure AI Speech and GPT-4o for dynamic, context-aware feedback.",
      tech: "Azure AI Speech, GPT-4o, Spring Boot",
      icon: <Mic size={14} className="text-yellow-500" />
    },
    {
      title: "System Design",
      desc: "Architectural blueprint evaluation using structural reasoning and pattern analysis. \nUtilizes Excalidraw integration and GPT-4o to critique high-level system flows.",
      tech: "Excalidraw, GPT-4o, React Logic",
      icon: <Layout size={14} className="text-yellow-500" />
    },
    {
      title: "Resume Roaster",
      desc: "Direct analysis of professional profiles to identify skill gaps and roasting points. \nUses Azure AI Foundry and GPT-4o to provide sharp, technical resume critiques.",
      tech: "Azure AI Foundry, Text Analysis, GPT-4o",
      icon: <FileText size={14} className="text-yellow-500" />
    },
    {
      title: "SQL Detective",
      desc: "Deep-dive into query optimization and complex database troubleshooting challenges. \nEmploys AI-driven logic to identify inefficient joins and schema vulnerabilities.",
      tech: "SQL Scripting, AI Query Logic, MongoDB",
      icon: <Search size={14} className="text-yellow-500" />
    },
    {
      title: "150+ Java & Azure Scenarios",
      desc: "Advanced modules including Production Firefighter, Cloud Architect, and Code Reviewer. \nAnalyze failing logs and optimize cloud deployments for cost and high availability.",
      tech: "Azure SDK, Java 21, GPT-4o Orchestration",
      icon: <ShieldCheck size={14} className="text-yellow-500" />
    },
    {
      title: "Waitlist & Persistence",
      desc: "Secure management of user waitlist entries and session state persistence in the cloud. \nBacked by MongoDB Atlas and Java 21 to ensure scalable and reliable data storage.",
      tech: "MongoDB Atlas, Spring Boot, Java 21",
      icon: <Database size={14} className="text-yellow-500" />
    }
  ];

  const apiEndpoints = [
  // --- Waitlist & User Management ---
  {
    method: "POST",
    path: "/api/waitlist/join",
    desc: "Registers a new user email to the MongoDB Atlas waitlist cluster.",
    payload: "{ 'email': 'string' }"
  },

  // --- Algorithm Arena (Coding Challenges) ---
  {
    method: "GET",
    path: "/api/arena/generate",
    desc: "Fetches a new AI-generated Java coding challenge, including test cases, hints, and solutions.",
    payload: "N/A"
  },
  {
    method: "POST",
    path: "/api/arena/evaluate",
    desc: "Sends the user's code and problem context to the AI judge for grading and performance analysis.",
    payload: "{ 'code': 'string', 'problemContext': 'string' }"
  },

  // --- AI Interview & Voice Experience ---
  {
    method: "POST",
    path: "/api/interview/chat",
    desc: "Handles real-time technical chat turns, extracting scores and providing adaptive follow-ups.",
    payload: "{ 'history': 'Array', 'userInput': 'string' }"
  },
  {
    method: "POST",
    path: "/api/interview/submit",
    desc: "Processes voice recordings (WAV) for speech-to-text, tone analysis, and soft-skill metrics.",
    payload: "FormData (AudioBlob)"
  },
  {
    method: "POST",
    path: "/api/ai/interview/start",
    desc: "Initializes a GPT-4o session and triggers Azure Speech synthesis.",
    payload: "{ 'scenarioId': 'string' }"
  },

  // --- Resume Roaster & Drills ---
  {
    method: "POST",
    path: "/api/interview/resume",
    desc: "Matches resume text against a JD to provide a score, roast, and missing keyword analysis.",
    payload: "{ 'resume': 'string', 'jobDescription': 'string' }"
  },
  {
    method: "POST",
    path: "/api/interview/evaluate-answer",
    desc: "Grades a user's verbal/textual response to specific 'hard questions' from their resume.",
    payload: "{ 'question': 'string', 'answer': 'string' }"
  },

  // --- System Design & Scenario Challenges ---
  {
    method: "GET",
    path: "/api/arena/disaster",
    desc: "Generates a live architectural disaster scenario requiring immediate mitigation.",
    payload: "{ 'challenge': 'string' }"
  },
  {
    method: "POST",
    path: "/api/interview/scenario",
    desc: "Generates role-based technical lead scenarios (Architect, Firefighter, Reviewer).",
    payload: "{ 'role': 'string' }"
  },

  // --- SQL Detective ---
  {
    method: "POST",
    path: "/api/interview/sql/mystery",
    desc: "Generates a dynamic SQL 'Murder Mystery' challenge with custom schema.",
    payload: "{ 'difficulty': 'string' }"
  },
  {
    method: "POST",
    path: "/api/interview/sql/solve",
    desc: "Validates user-written SQL queries against hidden case data for logical success.",
    payload: "{ 'query': 'string', 'solution': 'string' }"
  }
];

  return (
    <footer id="about" className="relative pt-24 pb-12 px-4 border-t border-border/30 bg-background overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div id="waitlist-form" className="text-center mb-24">
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6 text-white">
            Join the <span className="text-gradient-gold">Waitlist</span>
          </h2>
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto glass p-2 rounded-full border-white/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your professional email"
              className="w-full sm:flex-1 bg-transparent outline-none py-3 px-6 text-foreground placeholder:text-muted-foreground/50 transition-colors"
            />
            <Button type="submit" variant="hero" disabled={isLoading} className="rounded-full group whitespace-nowrap px-8">
              {isLoading?"Joining...":"Get Early Access"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        </div>

        <div className="text-center mb-16">
          <h3 className="font-serif text-6xl md:text-8xl lg:text-9xl font-medium text-muted-foreground/10 tracking-[0.1em] select-none uppercase">MOCKMATE</h3>
          <div className="mt-[-2rem] md:mt-[-4rem] flex flex-col items-center gap-2">
            <p className="text-[12px] font-sans tracking-[0.4em] text-muted-foreground/60 uppercase">
              Developed by-<span className="text-gradient-gold font-bold">Pranjal Gupta</span>
            </p>
          </div>
          <br></br><br></br>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-16 px-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col items-start">
              <h4 className="text-[10px] font-bold text-foreground mb-6 uppercase tracking-[0.2em] border-b border-yellow-500/30 pb-1">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => {
                        if (link.isSystemPopup) setIsSystemModalOpen(true);
                        else if (link.isFeaturesPopup) setIsFeaturesModalOpen(true);
                        else if (link.isRoadmapPopup) setIsRoadmapModalOpen(true);
                        else if (link.isWaitlistLink) {
                          document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                        }
                        else if (link.isApiPopup) setIsApiModalOpen(true);
                        else window.open(link.href, "_blank");
                      }}
                      className="text-sm text-muted-foreground hover:text-yellow-500 transition-all duration-300 flex items-center gap-2 group text-left"
                    >
                      <span className="w-0 h-[1px] bg-yellow-500/50 transition-all duration-300 group-hover:w-3" />
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ... Bottom Bar Socials ... */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 md:mb-0 group">
            <div className="p-2 glass rounded-lg border-yellow-500/10 group-hover:border-yellow-500/30 transition-all">
              <Terminal className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">© 2025 MockMate AI • Built with Spring Boot & React</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="https://github.com/Pranjall-Gupta" target="_blank" className="text-muted-foreground hover:text-yellow-500 transition-all hover:-translate-y-1"><GithubIcon className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/pranjal-gupta-4367052a0/" target="_blank" className="text-muted-foreground hover:text-yellow-500 transition-all hover:-translate-y-1"><Linkedin className="w-5 h-5" /></a>
            <a href="https://x.com/_pranjal__gupta" target="_blank" className="text-muted-foreground hover:text-yellow-500 transition-all hover:-translate-y-1">
              <XIconBranded className="w-4 h-4" /> {/* Slightly smaller as the brand mark is wide */}
            </a>
            <a href="https://leetcode.com/u/Pranjal__Gupta/" target="_blank" className="text-muted-foreground hover:text-yellow-500 transition-all hover:-translate-y-1"><Code2 className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      {/* --- ROADMAP MODAL --- */}
      {isRoadmapModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" onClick={() => setIsRoadmapModalOpen(false)}>
          <div className="relative w-full max-w-2xl glass rounded-2xl border border-yellow-500/30 bg-blue-900/10 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80">Inspector: Development_Roadmap.log</span>
              </div>
              <button onClick={() => setIsRoadmapModalOpen(false)} className="p-1 hover:bg-yellow-500/20 rounded-md transition-colors"><XIcon size={14} className="text-yellow-500/60" /></button>
            </div>
            <div className="p-8 space-y-8 bg-black/40">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-8 border-l border-yellow-500/20">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-white">{m.phase}: {m.title}</h5>
                    <span className="text-[9px] font-mono text-yellow-500/50 uppercase">{m.status}</span>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    {m.items.map((item, idx) => (
                      <li key={idx} className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-500/30 rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-yellow-500/5 border-t border-yellow-500/20 flex justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">Projected Scale-up Path</p>
            </div>
          </div>
        </div>
      )}
      {/* --- SYSTEM DESIGN MODAL (INSPECTOR STYLE) --- */}
      {isSystemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" onClick={() => setIsSystemModalOpen(false)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] glass rounded-2xl border border-yellow-500/30 bg-blue-900/10 shadow-[0_0_30px_rgba(212,175,55,0.15),inset_0_0_20px_rgba(212,175,55,0.05)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80">Inspector: System_Design.png</span>
              </div>
              <button onClick={() => setIsSystemModalOpen(false)} className="p-1 hover:bg-yellow-500/20 rounded-md transition-colors group">
                <XIcon size={14} className="text-yellow-500/60 group-hover:text-yellow-500" />
              </button>
            </div>
            <div className="flex-1 p-2 bg-black/60 flex items-center justify-center overflow-hidden">
              <img src="/system-architecture.png" alt="Architecture" className="w-full h-full object-contain" />
            </div>
            <div className="px-4 py-2 bg-yellow-500/5 border-t border-yellow-500/20 flex justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">System Architecture</p>
            </div>
          </div>
        </div>
      )}

      {/* --- FEATURES MODAL (INSPECTOR STYLE) --- */}
      {isFeaturesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" onClick={() => setIsFeaturesModalOpen(false)}>
          <div className="relative w-full max-w-2xl glass rounded-2xl border border-yellow-500/30 bg-blue-900/10 shadow-[0_0_30px_rgba(212,175,55,0.15),inset_0_0_20px_rgba(212,175,55,0.05)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2">
                <Eye size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80">Inspector: Platform_Features.log</span>
              </div>
              <button onClick={() => setIsFeaturesModalOpen(false)} className="p-1 hover:bg-yellow-500/20 rounded-md transition-colors group">
                <XIcon size={14} className="text-yellow-500/60 group-hover:text-yellow-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 bg-black/40 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 group p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-yellow-500/10">
                  <div className="shrink-0 p-2 glass h-fit rounded-lg border-yellow-500/20">{f.icon}</div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">{f.title}</h5>
                    <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed whitespace-pre-line">{f.desc}</p>
                    <div className="flex items-center gap-2">
                      <Cpu size={10} className="text-yellow-500/50" />
                      <span className="text-[9px] font-mono text-yellow-500/60 uppercase">{f.tech}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-yellow-500/5 border-t border-yellow-500/20 flex justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">Technical Stack</p>
            </div>
          </div>
        </div>
      )}
      {/* --- API REFERENCE MODAL --- */}
      {isApiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" onClick={() => setIsApiModalOpen(false)}>
          <div className="relative w-full max-w-2xl glass rounded-2xl border border-yellow-500/30 bg-blue-900/10 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80">Inspector: API_Endpoints.json</span>
              </div>
              <button onClick={() => setIsApiModalOpen(false)} className="p-1 hover:bg-yellow-500/20 rounded-md transition-colors"><XIcon size={14} className="text-yellow-500/60" /></button>
            </div>
            <div className="p-6 space-y-4 bg-black/40 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {apiEndpoints.map((api, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 group hover:border-yellow-500/20 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">{api.method}</span>
                    <code className="text-[11px] text-white font-mono">{api.path}</code>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{api.desc}</p>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/40 font-bold">Payload Structure:</span>
                    <code className="text-[10px] p-2 bg-black/40 rounded border border-white/5 text-yellow-500/80">{api.payload}</code>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-yellow-500/5 border-t border-yellow-500/20 flex justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">Internal MockMate Microservices</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;