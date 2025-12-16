import { useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Brain } from "lucide-react";

const SystemDesignCanvas = () => {
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
            // We strip the "data:image/jpeg;base64," prefix because Java expects just the code
            body: JSON.stringify({ 
                image: base64Image.split(",")[1] 
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
         <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#1a1a1a] border border-white/20 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-10 max-h-[40vh] overflow-y-auto">
            <h4 className="text-gold text-sm font-bold mb-1">🤖 AI Feedback:</h4>
            <p className="text-gray-200 text-sm whitespace-pre-wrap">{feedback}</p>
            <button onClick={() => setFeedback("")} className="absolute top-2 right-2 text-gray-500 hover:text-white">✕</button>
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