import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Search, AlertTriangle, Lightbulb, Target } from "lucide-react";

interface ResumeAnalysis {
  score: number;
  missingKeywords: string[];
  bulletPointFixes: string[];
  hardQuestions: string[];
}

const ResumeRoaster = () => {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("http://localhost:8081/api/interview/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText }),
      });
      const data = await response.json();
      setAnalysis(JSON.parse(data.analysis));
    } catch (error) {
      alert("Analysis failed. Backend offline?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={16} /> <span className="text-sm font-medium">EXIT ROASTER</span>
        </Link>
        <span className="font-serif text-lg tracking-wide text-red-400">RESUME ROASTER 🔥</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* LEFT: INPUT AREA */}
        <div className="space-y-4">
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="text-primary" /> Paste Resume
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    Copy-paste your resume content here. Don't worry about formatting, we just read the text.
                </p>
                <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="John Doe \nSenior Java Developer..."
                    className="w-full h-96 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-primary/50 resize-none font-mono leading-relaxed"
                />
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={isLoading || !resumeText}
                className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? "Roasting..." : <>Analyze My Resume <Search size={18} /></>}
            </button>
        </div>

        {/* RIGHT: ANALYSIS DASHBOARD */}
        <div className="flex flex-col gap-6">
            {!analysis ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-white/5 rounded-2xl bg-[#121212]">
                    <Target size={48} className="mb-4 opacity-50" />
                    <p>Ready to critique.</p>
                </div>
            ) : (
                // Result State
                <div className="animate-in slide-in-from-right-4 space-y-6">
                    
                    {/* Score Card */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider">ATS Score</h3>
                            <div className={`text-4xl font-bold ${analysis.score >= 80 ? "text-green-400" : analysis.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                {analysis.score}/100
                            </div>
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-white/10 flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} /> Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map(kw => (
                                <span key={kw} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full text-sm">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Fixes */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                            <Lightbulb size={18} /> Suggested Bullets
                        </h3>
                        <ul className="space-y-3">
                            {analysis.bulletPointFixes.map((fix, i) => (
                                <li key={i} className="text-sm text-gray-300 flex gap-3">
                                    <span className="text-yellow-500 font-bold">•</span>
                                    {fix}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Interview Prep */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                            <Target size={18} /> Prepare for these Questions
                        </h3>
                        <ul className="space-y-3">
                            {analysis.hardQuestions.map((q, i) => (
                                <li key={i} className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                    " {q} "
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ResumeRoaster;