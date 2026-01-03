import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { ArrowLeft, LayoutGrid, MessageSquare, Database, ShoppingBag, Terminal, AlertTriangle, X, Brain, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import api from "@/lib/api";
import SystemDesignCanvas from "../components/systemDesignCanvas";
import ArchitectSolutionModal from "../components/ArchitectSolutionModal";

const CHALLENGES = [
  { id: "general", label: "Blank Canvas", icon: <LayoutGrid size={16} /> },
  { id: "messenger", label: "WhatsApp Clone", icon: <MessageSquare size={16} /> },
  { id: "facebook", label: "Facebook Feed", icon: <Database size={16} /> },
  { id: "ecommerce", label: "Amazon Flash Sale", icon: <ShoppingBag size={16} /> },
];

const SystemDesignPage = () => {
  const canvasRef = useRef<any>(null);
  const [activeChallenge, setActiveChallenge] = useState("general");
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [activeDisaster, setActiveDisaster] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state for transition

  const startInterview = async () => {
    setIsLoading(true); // Start loading animation
    try {
      const response = await api.get(`/interview/generate-disaster?challenge=${activeChallenge}`);
      const data = response.data;
      
      // Artificial delay to make the transition feel intentional and smooth
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      setActiveDisaster(data);
      setIsMockMode(true);
    } catch (err) {
      console.error("Failed to start interview", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden">
      
      {/* LOADING OVERLAY - Smooth Fade */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-gold font-serif tracking-[0.3em] uppercase animate-pulse">Initializing Incident...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-white/10 p-4 shrink-0 bg-[#0a0a0a] z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">EXIT</span>
            </Link>
            
            <button 
              onClick={() => setIsSolutionOpen(true)}
              className="px-4 py-1.5 border border-gold/30 rounded-full text-[10px] font-bold text-gold hover:bg-gold/10 transition-all uppercase tracking-widest"
            >
              Audit Checklist
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isMockMode && (
              <motion.div 
                key="selector"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex bg-white/5 p-1 rounded-full border border-white/10"
              >
                {CHALLENGES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChallenge(c.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeChallenge === c.id ? "bg-gold text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
             {!isMockMode && (
               <button 
                onClick={startInterview}
                className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
               >
                 Start Mock Interview
               </button>
             )}
             <span className="font-serif text-lg tracking-widest text-gold-light hidden md:block uppercase">System Design Board</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-2 relative">
        <AnimatePresence mode="wait">
          {!isMockMode ? (
            /* STANDARD VIEW - Fade Out / Slide Down */
            <motion.div 
              key="standard-canvas"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <SystemDesignCanvas challenge={activeChallenge} hideUI={false} />
            </motion.div>
          ) : (
            /* MOCK MODE - Slide Up / Scale In */
            <motion.div 
              key="mock-layout"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="h-full w-full"
            >
              <PanelGroup direction="horizontal" className="gap-3">
                {/* COLUMN 1: DISASTER BRIEFING */}
                <Panel defaultSize={25} minSize={20}>
                  <div className="h-full bg-red-950/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
                      <AlertTriangle size={14} /> Critical Incident
                    </div>
                    <h2 className="text-xl font-serif text-white border-b border-red-500/10 pb-4 tracking-tight">
                      {activeDisaster?.title}
                    </h2>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium">{activeDisaster?.scenario}</p>
                    <div className="mt-auto space-y-3">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-red-200 text-[10px] uppercase font-bold mb-1 tracking-tighter">Impact Analysis</p>
                        <p className="text-red-100 text-[11px] leading-tight font-medium">{activeDisaster?.impact}</p>
                      </div>
                      <div className="p-4 bg-gold/10 border border-gold/20 rounded-2xl">
                        <p className="text-gold text-[10px] uppercase font-bold mb-1 tracking-tighter">Mission Objective</p>
                        <p className="text-gold-light text-[11px] leading-tight font-bold italic">
                          {activeDisaster?.mission}
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="w-1 hover:bg-white/20 transition-colors bg-white/5 rounded-full mx-1" />

                {/* COLUMN 2: CANVAS */}
                <Panel defaultSize={50} minSize={30}>
                  <SystemDesignCanvas ref={canvasRef} challenge={activeChallenge} hideUI={true} />
                </Panel>

                <PanelResizeHandle className="w-1 hover:bg-white/20 transition-colors bg-white/5 rounded-full mx-1" />

                {/* COLUMN 3: CONTROLS */}
                <Panel defaultSize={25} minSize={20}>
                  <div className="h-full bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl">
                    <div className="text-[10px] text-gold font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <Terminal size={14} /> Control Terminal
                    </div>
                    
                    <button 
                      onClick={() => canvasRef.current?.triggerAnalyze()}
                      className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-gray-200 shadow-xl uppercase tracking-widest text-xs active:scale-95"
                    >
                      <Brain size={18} /> Analyze Fix
                    </button>

                    <button 
                      onClick={() => setIsMockMode(false)}
                      className="w-full bg-red-500/20 border border-red-500/30 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all uppercase tracking-widest text-[10px] active:scale-95"
                    >
                      <X size={14} /> Stop Interview
                    </button>

                    <div className="mt-auto p-5 bg-black/40 rounded-2xl border border-white/5 text-center">
                       <p className="text-[10px] text-gray-500 italic leading-relaxed font-medium">
                         "The architecture must evolve to survive. Implement the mission objective in the center panel."
                       </p>
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ArchitectSolutionModal 
        isOpen={isSolutionOpen} 
        onClose={() => setIsSolutionOpen(false)} 
        challenge={activeChallenge} 
      />
    </div>
  );
};

export default SystemDesignPage;