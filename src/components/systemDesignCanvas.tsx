import { useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Brain } from "lucide-react";

interface SystemDesignCanvasProps {
  challenge: string;
}

const SystemDesignCanvas = ({ challenge }: SystemDesignCanvasProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper: Convert Blob to Base64 (AI needs string format)
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAnalyze = async () => {
    if (!excalidrawAPI) return;

    setIsAnalyzing(true);
    setFeedback(""); // Clear previous feedback
    
    try {
        // 1. Take a "Screenshot" of the canvas
        const blob = await exportToBlob({
            elements: excalidrawAPI.getSceneElements(),
            mimeType: "image/jpeg",
            appState: {
                ...excalidrawAPI.getAppState(),
                exportWithDarkMode: true, // Make sure AI sees the dark mode version
            },
            files: excalidrawAPI.getFiles(),
        });

        // 2. Convert to Base64 string
        const base64Image = await blobToBase64(blob);
        
        // Log it to check if it worked (Open Console F12)
        console.log("Captured Architecture Image:", base64Image.substring(0, 50) + "...");

        // 3. Send to Java Backend
        const response = await fetch("http://localhost:8081/api/interview/analyze-design", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // We strip the "data:image/jpeg;base64," prefix and include the challenge context
            body: JSON.stringify({ 
                image: base64Image.split(",")[1],
                context: challenge 
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        setFeedback(data.feedback || "No feedback received.");

    } catch (error) {
        console.error("Error capturing canvas:", error);
        setFeedback("Error: Could not connect to AI. Is the backend running?");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full w-full relative border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
        
       {/* THE ANALYZE BUTTON */}
       <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            <Brain size={18} />
            {isAnalyzing ? "Scanning Board..." : "Analyze Architecture"}
          </button>
       </div>

       {/* FEEDBACK OVERLAY */}
        {feedback && (
          <div className="absolute bottom-6 left-6 right-6 z-20 
                          bg-[#121212]/80 backdrop-blur-xl 
                          border border-gold/30 rounded-2xl 
                          shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] 
                          animate-slide-up animate-gold-pulse
                          max-h-[45vh] overflow-y-auto p-8">
            
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <Brain size={24} className="text-gold-light" />
                </div>
                <h4 className="text-gold-light font-serif text-xl tracking-[0.2em] uppercase">
                  Architectural Insight
                </h4>
              </div>
              <button 
                onClick={() => setFeedback("")} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              {feedback.split('\n').map((line, index) => {
                const cleanLine = line.replace("SECTION:", "").trim();
                
                // Detection for Gold Header keywords
                if (line.startsWith("SECTION:") || /^(Pros|Cons|Recommendations|Security|Scalability):/i.test(line)) {
                  return (
                    <h5 key={index} className="text-gold font-bold text-sm uppercase tracking-tighter mt-6 first:mt-0">
                      {cleanLine}
                    </h5>
                  );
                }

                // Detection for Bullet Points
                if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
                  return (
                    <div key={index} className="flex gap-3 text-gray-300 text-sm leading-relaxed ml-2">
                      <span className="text-gold-light/50 mt-1.5">•</span>
                      <p>{line.trim().substring(1).trim()}</p>
                    </div>
                  );
                }

                // Standard Text
                return (
                  <p key={index} className="text-gray-400 text-sm leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        )}

       <Excalidraw 
          theme="dark" 
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
              appState: { viewBackgroundColor: "#121212", currentItemStrokeColor: "#ffffff" }
          }}
       />
    </div>
  );
};

export default SystemDesignCanvas;