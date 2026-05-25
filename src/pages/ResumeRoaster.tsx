import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Flame, 
  XCircle, 
  Brain 
} from "lucide-react";
import GoldenGauge from "../components/GoldenGauge";

interface ResumeAnalysis {
  score: number;
  roast: string;
  redFlags: string[];
  missingKeywords: string[];
  bulletPointFixes: string[];
  hardQuestions: string[];
}

const ResumeRoaster = () => {
  const { isLoggedIn } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState(""); 
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"roast" | "history">("roast");
  
  // EVALUATION STATES
  const [practiceQuestion, setPracticeQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{grade: number, feedback: string, idealAnswer: string} | null>(null);

  const fetchHistory = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get("/interview/resume/history");
      setHistory(response.data || []);
    } catch (err) {
      console.error("Failed to load resume roast history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
        const response = await api.post("/interview/resume", { 
            resume: resumeText, 
            jobDescription: jdText 
        });
        
        const data = response.data;
        
        let rawJson = data.analysis;
        if (rawJson.includes("```json")) {
            rawJson = rawJson.replace(/```json|```/g, "").trim();
        }
        
        setAnalysis(JSON.parse(rawJson));
        fetchHistory();
    } catch (error) {
        alert("Roaster is offline or returned invalid data.");
    } finally {
        setIsLoading(false);
    }
  };

  const submitEvaluation = async () => {
    if (!userAnswer.trim() || !practiceQuestion) return;
    setIsEvaluating(true);
    try {
        const response = await api.post("/interview/evaluate-answer", { 
            question: practiceQuestion, 
            answer: userAnswer 
        });
        
        const data = response.data;
        
        // SAFE PARSING
        let rawJson = data.evaluation;
        if (rawJson.includes("```json")) {
            rawJson = rawJson.replace(/```json|```/g, "").trim();
        }
        setEvalResult(JSON.parse(rawJson));
    } catch (err) { 
        alert("Evaluation failed. Backend error."); 
    } finally { 
        setIsEvaluating(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      
      {/* DRILL MODAL */}
      <AnimatePresence>
        {practiceQuestion && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#121212] border border-blue-500/30 w-full max-w-2xl rounded-[2rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={() => { setPracticeQuestion(null); setEvalResult(null); setUserAnswer(""); }} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                <div className="flex items-center gap-3 mb-6 text-blue-400">
                    <Brain size={24} />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Technical Drill</h2>
                </div>
                <p className="text-xl font-serif text-white mb-8 leading-relaxed italic">"{practiceQuestion}"</p>
                
                {!evalResult ? (
                    <div className="space-y-4">
                        <textarea 
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:border-blue-500/50 transition-all outline-none resize-none font-mono"
                            placeholder="Explain your approach..."
                        />
                        <button 
                            disabled={isEvaluating || !userAnswer.trim()}
                            onClick={submitEvaluation}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-lg"
                        >
                            {isEvaluating ? "Analyzing..." : "Submit for Evaluation"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <div>
                                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-1">Interview Grade</p>
                                <p className="text-3xl font-bold text-white">{evalResult.grade}/10</p>
                            </div>
                            <div className="text-2xl">{evalResult.grade >= 7 ? "✅" : "⚠️"}</div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gold uppercase tracking-widest">Feedback</h3>
                            <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl">{evalResult.feedback}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Ideal Answer</h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-green-500/30 pl-4">{evalResult.idealAnswer}</p>
                        </div>
                        <button onClick={() => { setEvalResult(null); setUserAnswer(""); }} className="w-full bg-white/5 text-gray-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Try Again</button>
                    </div>
                )}
            </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-6xl flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={16} /> <span className="text-[10px] font-bold tracking-widest uppercase">BACK TO HQ</span>
        </Link>
        <div className="flex items-center gap-2 text-red-500">
            <Flame size={20} fill="currentColor" />
            <span className="font-serif text-xl tracking-[0.3em] uppercase">Resume Roaster</span>
        </div>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl">
        <div className="lg:col-span-5 space-y-6">
          {isLoggedIn && (
            <div className="flex gap-2 p-1.5 bg-[#121212]/80 border border-white/5 rounded-2xl shadow-xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab("roast")}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none outline-none ${
                  activeTab === "roast" 
                    ? "bg-white text-black shadow-lg" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Flame size={12} />
                Roast Area
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none outline-none ${
                  activeTab === "history" 
                    ? "bg-white text-black shadow-lg" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <FileText size={12} />
                Past Roasts ({history.length})
              </button>
            </div>
          )}

          {activeTab === "roast" ? (
            <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-4 text-gold">
                    <FileText size={18} />
                    <h2 className="text-xs font-bold uppercase tracking-widest">Resume Content</h2>
                </div>
                <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste Resume Text..."
                    className="w-full h-64 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 focus:outline-none focus:border-gold/30 transition-all font-mono leading-relaxed mb-6 custom-scrollbar"
                />
                <div className="flex items-center gap-2 mb-4 text-gold">
                    <Target size={18} />
                    <h2 className="text-xs font-bold uppercase tracking-widest">Target Job Description</h2>
                </div>
                <textarea 
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste JD..."
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 focus:outline-none focus:border-gold/30 transition-all font-mono leading-relaxed custom-scrollbar"
                />
                <button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !resumeText}
                    className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-bold hover:bg-gold transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                    {isLoading ? "Roasting..." : <>Ignite Roaster <Flame size={16} /></>}
                </button>
            </div>
          ) : (
            <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in duration-300 space-y-4 max-h-[630px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-4 text-gold">
                <FileText size={18} />
                <h2 className="text-xs font-bold uppercase tracking-widest">Historical Roasts</h2>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-xs italic">No past roasts discovered in your terminal logs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((audit) => {
                    const formattedDate = new Date(audit.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    
                    // Extract a clean role or title from job description or fallback to "General Roast"
                    const roleTitle = audit.jobDescription 
                      ? audit.jobDescription.split("\n")[0].trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "") || "General Resume Roast"
                      : "General Resume Roast";
                    
                    return (
                      <button
                        key={audit.id}
                        onClick={() => {
                          setResumeText(audit.resumeText || "");
                          setJdText(audit.jobDescription || "");
                          setAnalysis({
                            score: audit.score || 0,
                            roast: audit.roast || "",
                            redFlags: audit.redFlags || [],
                            missingKeywords: audit.missingKeywords || [],
                            bulletPointFixes: audit.bulletPointFixes || [],
                            hardQuestions: audit.hardQuestions || []
                          });
                          setActiveTab("roast");
                        }}
                        className="w-full text-left p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-yellow-500/30 hover:bg-white/[0.03] transition-all group flex flex-col gap-2 relative overflow-hidden"
                      >
                        {/* Filament gold edge on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                            {formattedDate}
                          </span>
                          <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                            Score: {audit.score}/10
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white group-hover:text-yellow-500 transition-colors line-clamp-1">
                          {roleTitle}
                        </h3>
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed italic">
                          "{audit.roast}"
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
            {!analysis ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-white/5 rounded-[2rem] bg-[#121212]/50">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="font-serif tracking-widest uppercase text-[10px]">Awaiting Data</p>
                </div>
            ) : (
                <div className="animate-in slide-in-from-right-8 duration-500 space-y-6 pb-12">
                    <div className="relative p-8 bg-red-500/5 border border-red-500/20 rounded-[2rem] italic text-red-200 text-sm leading-relaxed shadow-2xl">
                        <div className="absolute -top-3 left-8 flex items-center gap-2">
                            <span className="bg-red-600 text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter">AI ROAST ACTIVE 🔥</span>
                        </div>
                        "{analysis.roast}"
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-xl">
                            <GoldenGauge score={analysis.score} label="JD Match Rate" />
                        </div>
                        <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-xl">
                             <h3 className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <XCircle size={14} /> Red Flags
                             </h3>
                             <ul className="space-y-3">
                                {(analysis.redFlags ?? []).map((flag, i) => (
                                    <li key={i} className="text-[11px] text-gray-400 flex gap-2 leading-tight">
                                        <span className="text-red-500 font-bold">!</span> {flag}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-xl">
                        <h3 className="text-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <AlertTriangle size={14} /> Skills to Add
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.missingKeywords ?? []).map(kw => (
                                <span key={kw} className="px-3 py-1.5 bg-gold/5 border border-gold/20 text-gold-light rounded-xl text-[10px] font-bold">{kw}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-xl">
                        <h3 className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Lightbulb size={14} /> Impactful Rewrites
                        </h3>
                        <div className="space-y-4">
                            {(analysis.bulletPointFixes ?? []).map((fix, i) => (
                                <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] text-gray-300 italic">"{fix}"</div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-xl">
                        <h3 className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Target size={14} /> Interrogation Questions
                        </h3>
                        <div className="space-y-4">
                            {(analysis.hardQuestions ?? []).map((q, i) => (
                                <div key={i} className="group relative bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:border-blue-500/30 transition-all">
                                    <p className="text-[11px] text-gray-300 leading-relaxed pr-12">"{q}"</p>
                                    <button 
                                      onClick={() => setPracticeQuestion(q)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-500/10 text-blue-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Brain size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeRoaster;