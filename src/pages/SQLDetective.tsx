import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Search, Terminal, AlertCircle, CheckCircle2, Loader2, Play, Lightbulb, Eye, X } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface MysteryData {
  title: string;
  schema: any;
  mission: any;
  hint1: string;
  hint2: string;
  solution: string;
}

interface GradeResult {
  status: "Success" | "Failed";
  feedback: string;
}

const SQLDetective = () => {
  const [mystery, setMystery] = useState<MysteryData | null>(null);
  const [userQuery, setUserQuery] = useState("SELECT * FROM ...");
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);

  // Challenge States
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => { loadMystery(); }, []);

  const loadMystery = async () => {
    setIsLoading(true);
    setError(null);
    setShowHint1(false);
    setShowHint2(false);
    setShowSolution(false);
    setAttempts(0);
    setGrade(null);
    setUserQuery("SELECT * FROM ...");
    try {
      const response = await fetch("http://localhost:8081/api/interview/sql/mystery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "Medium" }),
      });
      const data = await response.json();
      const parsedData = typeof data.mystery === 'string' ? JSON.parse(data.mystery) : data.mystery;
      setMystery(parsedData);
    } catch (e) { 
        console.error(e); 
        setError("The database signal is weak. Try reconnecting.");
    } finally { setIsLoading(false); }
  };

  const handleSolve = async () => {
    if (!mystery) return;
    setIsGrading(true);
    try {
      const response = await fetch("http://localhost:8081/api/interview/sql/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mission: mystery.mission, 
          query: userQuery,
          solution: mystery.solution 
        }),
      });
      const data = await response.json();
      const result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      
      setGrade(result);

      // --- FIXED ATTEMPTS LOGIC ---
      if (result.status === "Failed") {
        setAttempts(prev => prev + 1);
      } else {
        setAttempts(0); 
      }
    } catch (e) { 
      console.error(e);
    } finally { 
      setIsGrading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-foreground font-sans flex flex-col overflow-hidden relative">
      
      {/* DATA PREVIEW MODAL */}
      {showHint2 && mystery && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121212] border border-purple-500/30 w-full max-w-3xl rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-purple-500/10">
              <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest">
                <Eye size={16} /> Evidence Preview (Sample Rows)
              </div>
              <button onClick={() => setShowHint2(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-auto custom-scrollbar bg-black/40">
              <div className="font-mono text-xs text-purple-200/90 leading-relaxed">
                {Array.isArray(mystery.hint2) ? (
                  <div className="border border-purple-500/20 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-purple-500/10 border-b border-purple-500/20">
                          {Object.keys(mystery.hint2[0]).map((key) => (
                            <th key={key} className="p-2 text-purple-400 uppercase tracking-tighter border-r border-purple-500/10 last:border-0">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mystery.hint2.map((row, i) => (
                          <tr key={i} className="border-b border-purple-500/10 last:border-0 hover:bg-white/5 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="p-2 border-r border-purple-500/10 last:border-0 text-cyan-300/80">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {typeof mystery.hint2 === 'object' ? JSON.stringify(mystery.hint2, null, 2) : mystery.hint2}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full flex items-center justify-between p-4 border-b border-white/5 bg-black/50 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Abort Mission</span>
        </Link>
        <div className="flex items-center gap-2">
          <Search className="text-purple-500" size={18} />
          <span className="font-serif text-lg tracking-wider text-purple-500 uppercase">SQL Detective</span>
        </div>
        <div className="w-20" />
      </header>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
          <h2 className="text-white font-serif text-xl tracking-widest animate-pulse uppercase">Decrypting Case Files...</h2>
        </div>
      )}

      {!isLoading && mystery && (
        <main className="flex-1 overflow-hidden p-2">
          <PanelGroup direction="horizontal">
            
            {/* COLUMN 1: CONTROL CENTER */}
            <Panel defaultSize={25} minSize={20}>
              <section className="h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar p-2">
                <div className="bg-[#0A0A0A] border border-purple-500/20 rounded-xl p-5 shadow-2xl shadow-purple-500/5">
                  <div className="text-[10px] text-purple-500 font-bold uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Active Case
                  </div>
                  <h2 className="text-lg font-bold text-white mb-3 leading-tight underline decoration-purple-500/50 underline-offset-4">{mystery.title}</h2>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {typeof mystery.mission === 'object' ? JSON.stringify(mystery.mission) : mystery.mission}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setShowHint1(!showHint1)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-[10px] font-bold transition-all uppercase ${showHint1 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <Lightbulb size={14} /> {showHint1 ? "Hide Clue" : "Tactical Hint"}
                  </button>
                  {showHint1 && (
                    <div className="p-3 bg-yellow-500/5 border-l-2 border-yellow-500 text-[11px] text-yellow-100/70 italic animate-in slide-in-from-left-2">
                      {mystery.hint1}
                    </div>
                  )}
                  <button onClick={() => setShowHint2(true)} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-[10px] font-bold uppercase hover:border-purple-500/50 transition-all">
                    <Eye size={14} /> Preview Table Data
                  </button>
                </div>

                {/* ACTION AREA - ONE SINGLE BLOCK */}
                <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/5">
                  
                  {attempts >= 5 && (
                    <div className="animate-in slide-in-from-bottom-2 mb-2">
                        <button 
                            onClick={() => setShowSolution(!showSolution)}
                            className="w-full bg-purple-600/20 border border-purple-500 text-purple-400 font-bold py-2 rounded-lg text-[10px] uppercase hover:bg-purple-600/30 transition-all mb-2"
                        >
                            {showSolution ? "Hide Classified Solution" : "Reveal Case Solution"}
                        </button>
                        {showSolution && (
                            <div className="p-3 bg-black/60 border border-purple-500/30 rounded-lg">
                                <div className="text-[9px] text-purple-500 font-bold uppercase mb-1 tracking-tighter">Classified Intel:</div>
                                <code className="text-[10px] text-purple-200/80 font-mono break-all leading-tight block whitespace-pre-wrap">
                                    {mystery.solution}
                                </code>
                            </div>
                        )}
                    </div>
                  )}

                  <button onClick={handleSolve} disabled={isGrading} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                    {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    RUN ANALYSIS
                  </button>
                  <button onClick={loadMystery} className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl text-xs uppercase hover:bg-white/10 transition-colors">
                    New Case
                  </button>
                </div>
              </section>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-purple-500/50 transition-colors mx-1 rounded-full cursor-col-resize" />

            {/* COLUMN 2: WORKSPACE */}
            <Panel defaultSize={50} minSize={30}>
              <section className="h-full flex flex-col p-2 overflow-hidden">
                <div className="flex-1 bg-black border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
                  <div className="bg-[#0F0F0F] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                      <span className="ml-2 text-[10px] text-gray-600 font-mono tracking-widest uppercase">investigation.sql</span>
                    </div>
                    
                  </div>
                  <textarea 
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="flex-1 bg-transparent p-6 font-mono text-sm text-purple-300 focus:outline-none resize-none leading-relaxed selection:bg-purple-500/20"
                    spellCheck={false}
                  />
                  {grade && (
                    <div className={`p-4 m-4 rounded-xl border animate-in slide-in-from-bottom-4 ${grade.status === 'Success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <h3 className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${grade.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                        {grade.status === 'Success' ? 'Case Solved' : 'Stalled'}
                      </h3>
                      <p className="text-gray-300 text-[11px] leading-relaxed">{grade.feedback}</p>
                    </div>
                  )}
                </div>
              </section>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-purple-500/50 transition-colors mx-1 rounded-full cursor-col-resize" />

            {/* COLUMN 3: SCHEMA REFERENCE */}
            <Panel defaultSize={25} minSize={20}>
              <section className="h-full flex flex-col p-2 overflow-hidden">
                <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 flex flex-col overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-2 text-purple-400/80 text-[10px] font-bold uppercase tracking-widest mb-4 shrink-0">
                    <Database size={14} /> Schema Reference
                  </div>


                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 p-4 rounded-lg border border-purple-500/10">
                    <div className="font-mono text-[12px] leading-relaxed selection:bg-cyan-500/30">
                      {typeof mystery.schema === 'string' ? (
                        mystery.schema.split('\n').map((line, i) => {
                          const highlightedLine = line
                            .replace(/\b(CREATE TABLE|PRIMARY KEY|INTEGER|TEXT|DATE|VARCHAR|REFERENCES)\b/g, '<span class="text-purple-400">$1</span>')
                            .replace(/\b([a-zA-Z_]+)(?=\s+\b(INTEGER|TEXT|DATE|VARCHAR)\b)/g, '<span class="text-cyan-300">$1</span>');
                          return (
                            <div key={i} className="whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                          );
                        })
                      ) : (
                        <pre className="text-cyan-400/90 whitespace-pre-wrap">{JSON.stringify(mystery.schema, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </Panel>

          </PanelGroup>
        </main>
      )}
    </div>
  );
};

export default SQLDetective;