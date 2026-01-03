import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Search, Terminal, AlertCircle, Award, Loader2, Play, Lightbulb, Eye, X } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import api from "@/lib/api";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
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
      const response = await api.post("/interview/sql/mystery", { difficulty: "Medium" });
      const data = response.data;
      const parsedData = typeof data.mystery === 'string' ? JSON.parse(data.mystery) : data.mystery;
      setMystery(parsedData);
    } catch (e) { 
        setError("The database signal is weak. Try reconnecting.");
    } finally { setIsLoading(false); }
  };

  const handleSolve = async () => {
    if (!mystery) return;
    setIsGrading(true);
    try {
      const response = await api.post("/interview/sql/solve", { 
          mission: mystery.mission, 
          query: userQuery,
          solution: mystery.solution 
      });
      const data = response.data;
      const result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      setGrade(result);
      if (result.status === "Failed") setAttempts(prev => prev + 1);
      else setAttempts(0);
    } catch (e) { console.error(e); } 
    finally { setIsGrading(false); }
  };

  return (
    // UPDATED: Dark Navy background base
    <div className="h-screen bg-slate-950 text-blue-100 font-sans flex flex-col overflow-hidden relative selection:bg-primary/30 selection:text-white">
      
      {/* DATA PREVIEW MODAL (Dark Glass) */}
      {showHint2 && mystery && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-blue-950/80 border border-primary/30 w-full max-w-3xl rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-[0.2em]">
                <Eye size={16} /> Evidence Preview
              </div>
              <button onClick={() => setShowHint2(false)} className="text-blue-300 hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-auto custom-scrollbar">
              <div className="font-mono text-xs leading-relaxed">
                {Array.isArray(mystery.hint2) ? (
                  <div className="border border-primary/20 rounded-xl overflow-hidden bg-black/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-primary/10 border-b border-primary/20">
                          {Object.keys(mystery.hint2[0]).map((key) => (
                            <th key={key} className="p-3 text-primary text-[10px] uppercase tracking-widest font-bold">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mystery.hint2.map((row, i) => (
                          <tr key={i} className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="p-3 text-blue-200/80 font-mono text-[11px] border-r border-primary/5 last:border-0">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap p-4 bg-black/40 rounded-xl border border-primary/20 text-blue-200">
                    {typeof mystery.hint2 === 'object' ? JSON.stringify(mystery.hint2, null, 2) : mystery.hint2}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER (Darkened) */}
      <header className="w-full flex items-center justify-between p-4 border-b border-blue-900/50 bg-slate-900/80 backdrop-blur-md shrink-0 z-20 shadow-sm shadow-black/20">
        <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-primary transition-colors">
          <ArrowLeft size={16} /> <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Abort Mission</span>
        </Link>
        <div className="flex items-center gap-2">
          <Search className="text-primary" size={18} />
          {/* Kept the gold gradient text as it pops against the dark header */}
          <span className="font-serif text-lg tracking-[0.3em] text-gradient-gold uppercase">SQL Detective</span>
        </div>
        <div className="w-20" />
      </header>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <h2 className="text-primary font-serif text-xl tracking-[0.4em] animate-pulse uppercase">Decrypting Case Files</h2>
        </div>
      )}

      {!isLoading && mystery && (
        // UPDATED: Main background with a subtle top-down blue gradient blend
        <main className="flex-1 overflow-hidden p-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
          <PanelGroup direction="horizontal" className="gap-3">
            
            {/* COLUMN 1: CASE BRIEFING (Dark Navy Glass) */}
            <Panel defaultSize={25} minSize={20}>
              <section className="h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="bg-blue-950/40 border border-primary/20 rounded-3xl p-6 shadow-lg shadow-blue-900/20 backdrop-blur-md">
                  <div className="text-[10px] text-primary font-bold uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={12} /> Active Case
                  </div>
                  <h2 className="text-xl font-serif text-white mb-4 leading-tight border-b border-primary/10 pb-4">{mystery.title}</h2>
                  <p className="text-blue-200/90 text-xs leading-relaxed font-medium">
                    {typeof mystery.mission === 'object' ? JSON.stringify(mystery.mission) : mystery.mission}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => setShowHint1(!showHint1)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-[10px] font-bold transition-all uppercase tracking-widest ${showHint1 ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-blue-900/30 border-primary/10 text-blue-300 hover:border-primary/40 hover:bg-blue-900/50'}`}>
                    <Lightbulb size={14} /> {showHint1 ? "Hide Clue" : "Request Intelligence"}
                  </button>
                  {showHint1 && (
                    <div className="p-4 bg-primary/5 border-l-2 border-primary text-[11px] text-blue-100 italic animate-in slide-in-from-left-2 rounded-r-xl">
                      {mystery.hint1}
                    </div>
                  )}
                  <button onClick={() => setShowHint2(true)} className="flex items-center gap-3 p-4 rounded-2xl border border-primary/10 bg-blue-900/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest hover:border-primary/40 hover:bg-blue-900/50 transition-all">
                    <Eye size={14} /> Inspect Database
                  </button>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-4">
                  {attempts >= 3 && (
                    <div className="animate-in slide-in-from-bottom-2">
                        <button 
                            onClick={() => setShowSolution(!showSolution)}
                            className="w-full bg-primary/10 border border-primary/30 text-primary font-bold py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all mb-2"
                        >
                            {showSolution ? "Close Classified Solution" : "Reveal Solution"}
                        </button>
                        {showSolution && (
                            <div className="p-4 bg-black/60 border border-primary/20 rounded-2xl">
                                <code className="text-[10px] text-primary/90 font-mono break-all leading-tight block whitespace-pre-wrap">
                                    {mystery.solution}
                                </code>
                            </div>
                        )}
                    </div>
                  )}

                  <button onClick={handleSolve} disabled={isGrading} className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">
                    {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    Execute Query
                  </button>
                  <button onClick={loadMystery} className="w-full bg-blue-900/30 border border-primary/10 text-primary font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-colors">
                    New Investigation
                  </button>
                </div>
              </section>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-primary/50 transition-colors rounded-full bg-blue-900/50" />

            {/* COLUMN 2: SQL TERMINAL (Darker, Deeper Blue/Black) */}
            <Panel defaultSize={50} minSize={30}>
              <section className="h-full flex flex-col overflow-hidden">
                {/* UPDATED: Deeper background for the terminal feel */}
                <div className="flex-1 bg-[#0A0E17] backdrop-blur-md border border-primary/30 rounded-[2rem] flex flex-col overflow-hidden relative shadow-2xl shadow-blue-900/10">
                  <div className="bg-blue-950/50 px-6 py-3 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" />
                      <span className="ml-2 text-[10px] text-primary/70 font-mono tracking-[0.3em] uppercase">query_editor.sql</span>
                    </div>
                  </div>
                  <textarea 
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    // UPDATED: Text color is brighter for contrast against dark bg
                    className="flex-1 bg-transparent p-8 font-mono text-sm text-blue-100 focus:outline-none resize-none leading-relaxed caret-primary selection:bg-primary/30"
                    spellCheck={false}
                  />
                  {grade && (
                    <div className={`p-5 m-6 rounded-2xl border animate-in slide-in-from-bottom-4 shadow-xl backdrop-blur-md ${grade.status === 'Success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {grade.status === 'Success' ? <Award className="text-green-400" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
                        <h3 className={`font-bold uppercase tracking-[0.2em] text-[10px] ${grade.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                          {grade.status === 'Success' ? 'Case Resolved' : 'Analysis Failed'}
                        </h3>
                      </div>
                      <p className="text-white/90 text-[11px] leading-relaxed ml-6 font-medium">{grade.feedback}</p>
                    </div>
                  )}
                </div>
              </section>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-primary/50 transition-colors rounded-full bg-blue-900/50" />

            {/* COLUMN 3: SCHEMA REFERENCE (Dark Navy Glass) */}
            <Panel defaultSize={25} minSize={20}>
              <section className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 bg-blue-950/40 backdrop-blur-md border border-primary/20 rounded-3xl p-6 flex flex-col overflow-hidden shadow-lg shadow-blue-900/20">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-6 shrink-0">
                    <Database size={14} /> Schema Blueprint
                  </div>

                  {/* UPDATED: Inner container background and text colors */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/30 p-5 rounded-2xl border border-primary/10">
                    <div className="font-mono text-[11px] leading-loose">
                      {typeof mystery.schema === 'string' ? (
                        mystery.schema.split('\n').map((line, i) => {
                          // UPDATED: Syntax highlighting for dark mode
                          const highlightedLine = line
                            .replace(/\b(CREATE TABLE|PRIMARY KEY|INTEGER|TEXT|DATE|VARCHAR|REFERENCES)\b/g, '<span class="text-primary font-bold">$1</span>')
                            .replace(/\b([a-zA-Z_]+)(?=\s+\b(INTEGER|TEXT|DATE|VARCHAR)\b)/g, '<span class="text-blue-200/90">$1</span>');
                          return (
                            <div key={i} className="whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                          );
                        })
                      ) : (
                        <pre className="text-primary/70 whitespace-pre-wrap">{JSON.stringify(mystery.schema, null, 2)}</pre>
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