import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, HardHat, Code2, CheckCircle2, RotateCw, Lightbulb, XCircle, AlertTriangle } from "lucide-react";

// Updated Data Structure
interface ScenarioData {
  title: string;
  description: string;
  codeSnippet?: string;
  question: string;
  options?: string[]; 
  correctOption?: string; // The exact string of the correct answer
  explanation: string;    // The 2-line justification
}

const ScenarioChallenge = () => {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // New Error State

  // Quiz State
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState(""); // For Text Input modes

  // 1. GENERATE SCENARIO
  const generateScenario = async (role: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentRole(role);
    setScenario(null); 
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswer("");

    try {
      const response = await fetch("http://localhost:8081/api/interview/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role }),
      });
      
      if (!response.ok) throw new Error("Server busy");
      
      const data = await response.json();
      const parsedScenario = JSON.parse(data.scenario);
      setScenario(parsedScenario);
    } catch (err) {
      console.error(err);
      setError("AI is currently overloaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CANCEL INCIDENT (Fixes the overlapping UI issue)
  const handleCancel = () => {
    setCurrentRole(null);
    setScenario(null);
    setError(null);
    setShowResult(false);
  };

  // 3. HANDLE OPTION CLICK (For Multiple Choice)
  const handleOptionClick = (option: string) => {
    if (showResult) return; // Prevent changing answer
    setSelectedOption(option);
    setShowResult(true);
  };

  // 4. THEME HELPER
  const getTheme = () => {
    switch (currentRole) {
        case "firefighter": return { color: "text-orange-500", border: "border-orange-500/50", bg: "bg-orange-500/10", icon: <Flame /> };
        case "architect": return { color: "text-blue-500", border: "border-blue-500/50", bg: "bg-blue-500/10", icon: <HardHat /> };
        case "reviewer": return { color: "text-green-500", border: "border-green-500/50", bg: "bg-green-500/10", icon: <Code2 /> };
        default: return { color: "text-white", border: "border-white", bg: "bg-gray-800", icon: null };
    }
  };
  const theme = getTheme();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={16} /> <span className="text-sm font-medium">EXIT</span>
        </Link>
        <span className="font-serif text-lg tracking-wide">MOCKMATE SCENARIOS</span>
      </div>

      {/* --- STATE 1: LOBBY (Only show if no role selected) --- */}
      {!currentRole && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10 animate-in fade-in">
            {/* CARDS... (Same as before) */}
            <button onClick={() => generateScenario("firefighter")} className="group p-8 rounded-2xl bg-[#121212] border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left">
                <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                    <Flame size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Production Firefighter</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Disaster has struck. Logs are red. Can you fix the crash?</p>
            </button>
            <button onClick={() => generateScenario("architect")} className="group p-8 rounded-2xl bg-[#121212] border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                    <HardHat size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Cloud Architect</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Design scalable Azure systems. Balance cost and availability.</p>
            </button>
            <button onClick={() => generateScenario("reviewer")} className="group p-8 rounded-2xl bg-[#121212] border border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left">
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                    <Code2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Code Reviewer</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Spot hidden bugs in Junior Developer code.</p>
            </button>
        </div>
      )}

      {/* --- STATE 2: LOADING --- */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[50vh] animate-pulse">
             <div className={`w-12 h-12 rounded-full border-4 border-t-transparent ${theme.color.replace('text', 'border')} animate-spin mb-4`}></div>
             <h2 className="text-xl font-serif">Generating Incident...</h2>
             <p className="text-gray-500 text-sm">Reviewing system logs...</p>
        </div>
      )}

      {/* --- STATE 3: ERROR (New Retry UI) --- */}
      {error && !isLoading && (
        <div className="text-center bg-[#121212] border border-red-500/30 p-8 rounded-2xl max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connection Lost</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
                <button onClick={handleCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Back to Lobby</button>
                <button onClick={() => generateScenario(currentRole!)} className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200">Retry</button>
            </div>
        </div>
      )}

      {/* --- STATE 4: GAMEPLAY --- */}
      {scenario && !isLoading && !error && (
         <div className={`w-full max-w-3xl bg-[#121212] border ${theme.border} rounded-2xl p-6 md:p-10 shadow-2xl animate-in zoom-in-95`}>
            
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${theme.bg} ${theme.color} border ${theme.border}`}>
                    {theme.icon}
                    <span className="font-bold uppercase tracking-wider text-sm">{currentRole} MODE</span>
                </div>
                {/* FIX: Explicitly call handleCancel to clear state */}
                <button onClick={handleCancel} className="text-gray-500 hover:text-white text-sm">
                    Cancel Incident
                </button>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">{scenario.title}</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed border-l-2 border-white/10 pl-4">
                {scenario.description}
            </p>

            {/* FIX: Hide Code Block if N/A or empty */}
            {scenario.codeSnippet && scenario.codeSnippet !== "N/A" && (
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-blue-300 mb-8 overflow-x-auto">
                    <pre>{scenario.codeSnippet}</pre>
                </div>
            )}

            <div className="space-y-6">
                <h3 className="text-yellow-400 font-medium text-xl">{scenario.question}</h3>

                {/* --- OPTIONS LOGIC --- */}
                {scenario.options ? (
                    <div className="grid grid-cols-1 gap-3">
                        {scenario.options.map((opt, idx) => {
                            // LOGIC: Determine Color
                            let btnClass = "border-white/10 bg-white/5 hover:bg-white/10"; // Default
                            
                            if (showResult) {
                                if (opt === scenario.correctOption) {
                                    btnClass = "border-green-500 bg-green-500/20 text-white"; // Correct
                                } else if (opt === selectedOption && opt !== scenario.correctOption) {
                                    btnClass = "border-red-500 bg-red-500/20 text-white"; // Wrong Selection
                                } else {
                                    btnClass = "border-white/5 opacity-50"; // Unselected
                                }
                            }

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleOptionClick(opt)}
                                    disabled={showResult} 
                                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${btnClass}`}
                                >
                                    <span>{opt}</span>
                                    {showResult && opt === scenario.correctOption && <CheckCircle2 className="text-green-500" size={20} />}
                                    {showResult && opt === selectedOption && opt !== scenario.correctOption && <XCircle className="text-red-500" size={20} />}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    /* Text Input Mode */
                    <div className="space-y-4">
                        <textarea 
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your solution..."
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white h-32"
                        />
                        <button 
                            onClick={() => setShowResult(true)}
                            className="w-full bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200"
                        >
                            Deploy Fix
                        </button>
                    </div>
                )}

                {/* --- FEEDBACK AREA --- */}
                {showResult && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2 mt-6">
                        <div className="flex gap-3 mb-2">
                            <Lightbulb className="text-yellow-400 w-6 h-6 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white mb-1">Analysis</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{scenario.explanation}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => generateScenario(currentRole!)} 
                            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-all"
                        >
                            <RotateCw size={18} /> Generate New Incident
                        </button>
                    </div>
                )}
            </div>
         </div>
      )}

      {/* Footer Tip */}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-500">
        <Lightbulb size={14} />
        <span>Pro Tip: Every click generates a brand new, AI-created disaster.</span>
      </div>
    </div>
  );
};

export default ScenarioChallenge;