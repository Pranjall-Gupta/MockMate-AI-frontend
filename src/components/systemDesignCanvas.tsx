import { useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Brain, AlertTriangle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenGauge from "./GoldenGauge";

interface SystemDesignCanvasProps {
  challenge: string;
}

// --- SUB-COMPONENT: DISASTER PANEL ---
const DisasterPanel = ({ disaster, onRedraw }: { disaster: any; onRedraw: () => void }) => (
  <motion.div 
    initial={{ x: -300, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    className="absolute top-24 left-6 z-30 w-80 bg-[#121212]/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
  >
    <div className="flex items-center gap-2 text-red-500 mb-4">
      <AlertTriangle size={22} />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Disaster</span>
    </div>
    
    <h3 className="text-white font-bold text-sm mb-2">{disaster.title}</h3>
    <p className="text-gray-400 text-xs leading-relaxed mb-4">{disaster.scenario}</p>
    
    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
      <p className="text-red-200 text-[10px] leading-tight font-medium">IMPACT: {disaster.impact}</p>
    </div>

    <button 
      onClick={onRedraw}
      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-200 transition-all shadow-lg"
    >
      <RefreshCcw size={14} /> Redraw to Fix
    </button>
  </motion.div>
);

const SystemDesignCanvas = ({ challenge }: SystemDesignCanvasProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [activeDisaster, setActiveDisaster] = useState<any>(null);
  const [scores, setScores] = useState({ scalability: 0, security: 0, resilience: 0 });

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const triggerDisaster = async () => {
    try {
        const response = await fetch(`http://localhost:8081/api/interview/generate-disaster?challenge=${challenge}`);
        if (!response.ok) throw new Error("Failed to fetch disaster");
        const data = await response.json();
        setActiveDisaster(data);
    } catch (err) {
        console.error("Disaster Error:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!excalidrawAPI) return;
    setIsAnalyzing(true);
    setFeedback(""); 
    setScores({ scalability: 0, security: 0, resilience: 0 }); 
    
    try {
        const blob = await exportToBlob({
            elements: excalidrawAPI.getSceneElements(),
            mimeType: "image/jpeg",
            appState: { ...excalidrawAPI.getAppState(), exportWithDarkMode: true },
            files: excalidrawAPI.getFiles(),
        });

        const base64Image = await blobToBase64(blob);
        const response = await fetch("http://localhost:8081/api/interview/analyze-design", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                image: base64Image.split(",")[1],
                context: challenge,
                isDisasterActive: isMockMode && activeDisaster ? true : false,
                disasterContext: activeDisaster?.title || ""
            }),
        });

        const data = await response.json();
        const rawFeedback = data.feedback || "";
        setFeedback(rawFeedback);

        const scoreRegex = /SCORE:\s*Scalability:\s*(\d+),\s*Security:\s*(\d+),\s*Resilience:\s*(\d+)/i;
        const scoreMatch = rawFeedback.match(scoreRegex);

        if (scoreMatch) {
            setScores({
                scalability: parseInt(scoreMatch[1]),
                security: parseInt(scoreMatch[2]),
                resilience: parseInt(scoreMatch[3])
            });
        }
    } catch (error) {
        setFeedback("Error: Could not connect to AI.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full w-full relative border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
        
       {/* VERTICAL ACTION STACK - Enhanced Button Sizes */}
       <div className="absolute top-14 right-4 z-[20] flex flex-col items-end gap-3">
            
            {/* 1. ANALYZE ARCHITECTURE - Increased Padding/Size */}
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl text-sm font-bold shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-gray-200 transition-all disabled:opacity-50 w-fit"
            >
                {isAnalyzing ? (
                    <RefreshCcw size={18} className="animate-spin" />
                ) : (
                    <Brain size={18} />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Architecture"}
            </button>

            {/* 2. MOCK INTERVIEW MODE - Increased Padding/Size */}
            <button 
                onClick={() => {
                    const nextMode = !isMockMode;
                    setIsMockMode(nextMode);
                    if (nextMode) {
                        triggerDisaster();
                    } else {
                        setActiveDisaster(null);
                    }
                }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-bold border transition-all shadow-xl uppercase tracking-widest w-fit ${
                    isMockMode 
                    ? "bg-red-500/20 border-red-500 text-red-500 shadow-red-500/20" 
                    : "bg-[#1a1a1a] border-white/10 text-white hover:bg-white/5"
                }`}
            >
                <AlertTriangle size={16} />
                {isMockMode ? "Stop Interview" : "Mock Interview Mode"}
            </button>
        </div>

        {/* DISASTER PANEL */}
        <AnimatePresence>
            {isMockMode && activeDisaster && (
                <DisasterPanel disaster={activeDisaster} onRedraw={handleAnalyze} />
            )}
        </AnimatePresence>

        {/* FEEDBACK OVERLAY */}
        {feedback && (
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#121212]/90 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-slide-up animate-gold-pulse max-h-[60vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <Brain size={24} className="text-gold-light" />
                </div>
                <h4 className="text-gold-light font-serif text-xl tracking-[0.2em] uppercase">Architectural Insight</h4>
              </div>
              <button onClick={() => setFeedback("")} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="flex justify-around items-center py-6 mb-8 bg-white/5 rounded-xl border border-white/5">
                <GoldenGauge score={scores.scalability} label="Scalability" />
                <GoldenGauge score={scores.security} label="Security" />
                <GoldenGauge score={scores.resilience} label="Resilience" />
            </div>

            <div className="space-y-4">
              {feedback.split('\n').map((line, index) => {
                if (line.startsWith("SCORE:")) return null;
                if (line.startsWith("SECTION:")) return <h5 key={index} className="text-gold font-bold text-sm uppercase tracking-[0.2em] mt-8 mb-2 border-b border-gold/10 pb-1">{line.replace("SECTION:", "").trim()}</h5>;
                if (line.startsWith("SUBHEAD:") || line.includes("**")) return <p key={index} className="text-gold-light font-bold text-sm mt-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.8)]" /> {line.replace("SUBHEAD:", "").replace(/\*\*/g, "").trim()}</p>;
                if (line.trim() && !line.startsWith("•") && !line.startsWith("-")) return <p key={index} className="text-gray-400 text-sm leading-relaxed ml-6 mb-2">{line.trim()}</p>;
                if (line.trim().startsWith("•") || line.trim().startsWith("-")) return <div key={index} className="flex gap-3 text-gray-300 text-sm leading-relaxed ml-10 mb-1"><span className="text-gold/40 mt-1.5">○</span><p>{line.trim().replace(/^[•-]\s*/, "")}</p></div>;
                return null;
              })}
            </div>
          </div>
        )}

       <Excalidraw 
          theme="dark" 
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{ appState: { viewBackgroundColor: "#121212", currentItemStrokeColor: "#ffffff" } }}
       />
    </div>
  );
};

export default SystemDesignCanvas;