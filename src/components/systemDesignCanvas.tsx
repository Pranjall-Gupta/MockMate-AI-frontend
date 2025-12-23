import { useState, useImperativeHandle, forwardRef } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Brain, RefreshCcw } from "lucide-react";
import GoldenGauge from "./GoldenGauge";

interface SystemDesignCanvasProps {
  challenge: string;
  hideUI?: boolean;
}

const SystemDesignCanvas = forwardRef(({ challenge, hideUI = false }: SystemDesignCanvasProps, ref) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState({ scalability: 0, security: 0, resilience: 0 });

  // Helper: Convert Blob to Base64 for AI processing
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Main analysis logic triggered either internally or by the parent page
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
          context: challenge 
        }),
      });

      const data = await response.json();
      const rawFeedback = data.feedback || "";
      setFeedback(rawFeedback);

      // Score extraction using regex
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

  // Expose analysis trigger to the SystemDesignPage
  useImperativeHandle(ref, () => ({
    triggerAnalyze: handleAnalyze
  }));

  return (
    <div className="h-full w-full relative border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
      
      {/* 1. PRIMARY ACTION BUTTON - Only visible when not in Mock Mode */}
      {!hideUI && (
        <div className="absolute top-14 right-4 z-[20]">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl text-sm font-bold shadow-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCcw size={18} className="animate-spin" /> : <Brain size={18} />}
            {isAnalyzing ? "Analyzing..." : "Analyze Architecture"}
          </button>
        </div>
      )}

      {/* 2. FEEDBACK OVERLAY */}
      {feedback && (
        <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#121212]/90 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto p-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-4">
            <div className="flex items-center gap-3">
              <Brain size={24} className="text-gold-light" />
              <h4 className="text-gold-light font-serif text-xl tracking-widest uppercase">Architectural Insight</h4>
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
              if (line.startsWith("SECTION:")) return <h5 key={index} className="text-gold font-bold text-sm uppercase tracking-widest mt-8 border-b border-gold/10 pb-1">{line.replace("SECTION:", "").trim()}</h5>;
              if (line.startsWith("SUBHEAD:") || line.includes("**")) return <p key={index} className="text-gold-light font-bold text-sm mt-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> {line.replace("SUBHEAD:", "").replace(/\*\*/g, "").trim()}</p>;
              if (line.trim() && !line.startsWith("•") && !line.startsWith("-")) return <p key={index} className="text-gray-400 text-sm ml-6 mb-2">{line.trim()}</p>;
              if (line.trim().startsWith("•") || line.trim().startsWith("-")) return <div key={index} className="flex gap-3 text-gray-300 text-sm ml-10 mb-1"><span className="text-gold/40">○</span><p>{line.trim().replace(/^[•-]\s*/, "")}</p></div>;
              return null;
            })}
          </div>
        </div>
      )}

      {/* 3. EXCALIDRAW CANVAS */}
      <Excalidraw 
        theme="dark" 
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{ appState: { viewBackgroundColor: "#121212", currentItemStrokeColor: "#ffffff" } }}
      />
    </div>
  );
});

export default SystemDesignCanvas;