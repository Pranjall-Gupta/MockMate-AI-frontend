import { useState, useImperativeHandle, forwardRef } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Brain, RefreshCcw } from "lucide-react";
import GoldenGauge from "./GoldenGauge";
import api from "@/lib/api";

interface SystemDesignCanvasProps {
  challenge: string;
  hideUI?: boolean;
}

const SystemDesignCanvas = forwardRef(({ challenge, hideUI = false }: SystemDesignCanvasProps, ref) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState({ scalability: 0, security: 0, resilience: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    setPreviewImage(null);
    
    try {
      const blob = await exportToBlob({
        elements: excalidrawAPI.getSceneElements(),
        mimeType: "image/jpeg",
        quality: 0.4,
        appState: { ...excalidrawAPI.getAppState(), exportWithDarkMode: true },
        files: excalidrawAPI.getFiles(),
      });

      const base64Image = await blobToBase64(blob);
      setPreviewImage(base64Image);
      const response = await api.post("/interview/analyze-design", { 
          image: base64Image.split(",")[1],
          context: challenge 
      });

      // Since 'api' (axios) returns the data directly:
      const rawFeedback = response.data.analysis; // Target the specific key
      if (!rawFeedback) throw new Error("No analysis received from AI");
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

  const createNode = (id: string, type: "rectangle" | "ellipse", x: number, y: number, width: number, height: number, label: string) => {
    const seed = Math.floor(Math.random() * 100000);
    const elementNode = {
      id: id,
      type: type,
      x: x,
      y: y,
      width: width,
      height: height,
      strokeColor: "#FACC15",
      backgroundColor: "rgba(250,204,21,0.03)",
      fillStyle: "solid",
      strokeWidth: 1.5,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      seed: seed,
      version: 1,
      versionNonce: seed + 1,
      isDeleted: false,
      groupIds: [],
      boundElements: [{ type: "text", id: id + "-text" }],
      updated: Date.now(),
      link: null,
      locked: false,
    };

    const textNode = {
      id: id + "-text",
      type: "text",
      x: x + 10,
      y: y + height / 2 - 8,
      width: width - 20,
      height: 20,
      strokeColor: "#ffffff",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      seed: seed + 2,
      version: 1,
      versionNonce: seed + 3,
      isDeleted: false,
      groupIds: [],
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      text: label,
      fontSize: 12,
      fontFamily: 3,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: id,
      originalText: label,
    };

    return [elementNode, textNode];
  };

  const createArrow = (id: string, startNodeId: string, endNodeId: string, startX: number, startY: number, endX: number, endY: number) => {
    const seed = Math.floor(Math.random() * 100000);
    const width = Math.abs(endX - startX) || 1;
    const height = Math.abs(endY - startY) || 1;
    return {
      id: id,
      type: "arrow",
      x: startX,
      y: startY,
      width: width,
      height: height,
      strokeColor: "rgba(255,255,255,0.4)",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1.5,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      seed: seed,
      version: 1,
      versionNonce: seed + 1,
      isDeleted: false,
      groupIds: [],
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      points: [
        [0, 0],
        [endX - startX, endY - startY],
      ],
      lastCommittedPoint: null,
      startBinding: { elementId: startNodeId, focus: 0.1, gap: 4 },
      endBinding: { elementId: endNodeId, focus: 0.1, gap: 4 },
      startArrowhead: null,
      endArrowhead: "arrow",
    };
  };

  // Expose triggers to the SystemDesignPage
  useImperativeHandle(ref, () => ({
    triggerAnalyze: handleAnalyze,
    loadTemplate: (type: string) => {
      if (!excalidrawAPI) return;
      
      const elements: any[] = [];
      
      if (type === "three-tier") {
        elements.push(...createNode("users", "ellipse", 50, 150, 100, 50, "Client Users"));
        elements.push(...createNode("lb", "rectangle", 200, 145, 120, 60, "Load Balancer"));
        elements.push(...createNode("webA", "rectangle", 380, 80, 130, 60, "Web Server A"));
        elements.push(...createNode("webB", "rectangle", 380, 220, 130, 60, "Web Server B"));
        elements.push(...createNode("redis", "ellipse", 570, 50, 120, 60, "Redis Cache"));
        elements.push(...createNode("dbPri", "rectangle", 570, 145, 130, 60, "Primary MySQL"));
        elements.push(...createNode("dbRep", "rectangle", 570, 240, 130, 60, "Replica MySQL"));
        
        elements.push(createArrow("a1", "users", "lb", 150, 175, 200, 175));
        elements.push(createArrow("a2", "lb", "webA", 320, 175, 380, 110));
        elements.push(createArrow("a3", "lb", "webB", 320, 175, 380, 250));
        elements.push(createArrow("a4", "webA", "redis", 510, 110, 570, 80));
        elements.push(createArrow("a5", "webA", "dbPri", 510, 110, 570, 175));
        elements.push(createArrow("a6", "webB", "dbPri", 510, 250, 570, 175));
        elements.push(createArrow("a7", "dbPri", "dbRep", 635, 205, 635, 240));
      } else if (type === "kafka") {
        elements.push(...createNode("users", "ellipse", 50, 150, 100, 50, "Client Users"));
        elements.push(...createNode("producer", "rectangle", 200, 145, 130, 60, "API Producer"));
        elements.push(...createNode("broker1", "rectangle", 400, 80, 130, 60, "Kafka Broker 1"));
        elements.push(...createNode("broker2", "rectangle", 400, 220, 130, 60, "Kafka Broker 2"));
        elements.push(...createNode("consumer", "rectangle", 590, 145, 140, 60, "Event Consumer"));
        elements.push(...createNode("storage", "rectangle", 790, 145, 130, 60, "MongoDB Storage"));
        
        elements.push(createArrow("a1", "users", "producer", 150, 175, 200, 175));
        elements.push(createArrow("a2", "producer", "broker1", 330, 175, 400, 110));
        elements.push(createArrow("a3", "producer", "broker2", 330, 175, 400, 250));
        elements.push(createArrow("a4", "broker1", "consumer", 530, 110, 590, 175));
        elements.push(createArrow("a5", "broker2", "consumer", 530, 250, 590, 175));
        elements.push(createArrow("a6", "consumer", "storage", 730, 175, 790, 175));
      } else if (type === "cdn") {
        elements.push(...createNode("users", "ellipse", 50, 150, 100, 50, "Client Users"));
        elements.push(...createNode("dns", "ellipse", 200, 50, 120, 60, "Edge DNS Router"));
        elements.push(...createNode("cdn", "rectangle", 200, 220, 130, 60, "Edge CDN Server"));
        elements.push(...createNode("origin", "rectangle", 420, 220, 140, 60, "Origin Web Server"));
        elements.push(...createNode("db", "rectangle", 620, 220, 130, 60, "Origin Database"));
        
        elements.push(createArrow("a1", "users", "dns", 100, 150, 200, 80));
        elements.push(createArrow("a2", "users", "cdn", 100, 175, 200, 250));
        elements.push(createArrow("a3", "cdn", "origin", 330, 250, 420, 250));
        elements.push(createArrow("a4", "origin", "db", 560, 250, 620, 250));
      }
      
      excalidrawAPI.updateScene({
        elements,
        appState: {
          ...excalidrawAPI.getAppState(),
          viewBackgroundColor: "#121212",
          currentItemStrokeColor: "#ffffff",
          theme: "dark"
        }
      });
      
      // Auto-fit and center the template elements in the user's viewport safely
      setTimeout(() => {
        try {
          const activeElements = excalidrawAPI.getSceneElements().filter((el: any) => !el.isDeleted);
          if (activeElements.length > 0) {
            excalidrawAPI.scrollToContent(activeElements, {
              fitToViewport: true,
              animate: true
            });
          }
        } catch (err) {
          console.warn("Failed to scroll to content:", err);
        }
      }, 150);
    }
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-6">
            {/* Diagram Snapshot Preview */}
            {previewImage && (
              <div className="md:col-span-5 flex flex-col gap-3">
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Evaluated System Snapshot
                </span>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 p-2 shadow-inner group">
                  <div className="absolute inset-0 bg-yellow-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <img 
                    src={previewImage} 
                    alt="Evaluated System Design" 
                    className="w-full h-auto rounded-xl object-contain max-h-[300px] border border-white/5" 
                  />
                  <div className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono text-gray-400">
                    Audit ID: MM-{Math.floor(1000 + Math.random() * 9000)}
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 italic text-center font-mono">
                  Snapshot image submitted to MockMate AI Core for high-level architectural auditing.
                </p>
              </div>
            )}

            {/* Analysis Text Audit Details */}
            <div className={`${previewImage ? 'md:col-span-7' : 'md:col-span-12'} space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar`}>
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