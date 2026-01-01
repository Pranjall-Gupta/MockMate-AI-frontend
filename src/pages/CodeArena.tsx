import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Timer, Send, ArrowRight, Code2, Loader2, Sparkles, ChevronDown, Lightbulb, Lock ,Cpu,Layers,XIcon} from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const CodeArena = () => {
  const [question, setQuestion] = useState<any>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMoreExamples, setShowMoreExamples] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [activeSolutionIdx, setActiveSolutionIdx] = useState(0);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Initialize timer by calculating elapsed time from localStorage immediately
  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem("arena-start-time");
    if (saved) {
      const elapsed = Math.floor((Date.now() - parseInt(saved)) / 1000);
      return elapsed > 0 ? elapsed : 0;
    }
    return 0;
  });

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch("http://localhost:8081/api/arena/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problemContext: question.description,
        }),
      });
      const data = await res.json();
      const result = JSON.parse(data.evaluation);
      setEvaluation(result);

      if (result.isCorrect) {
        toast.success("Accepted!", { description: "All test cases passed." });
      } else {
        toast.error("Solution Failed", { description: "Check feedback for logic errors." });
      }
    } catch (err) {
      toast.error("Evaluation Error", { description: "The judge is offline." });
    } finally {
      setIsEvaluating(false);
    }
  };

  const fetchNewQuestion = async () => {
    setLoading(true);
    setEvaluation(null);
    // Reset timer in localStorage for a new challenge
    const startTime = Date.now().toString();
    localStorage.setItem("arena-start-time", startTime);
    setTimer(0);

    try {
      const res = await fetch("http://localhost:8081/api/arena/generate");
      const data = await res.json();
      const parsed = JSON.parse(data.question);
      setQuestion(parsed);
      setCode(parsed.starterCode);
    } catch (err) {
      toast.error("AI is recharging.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!question) {
      fetchNewQuestion();
    }
  }, []);

  // Robust Effect: Syncs with system clock every second to survive tab hibernation
  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = localStorage.getItem("arena-start-time");
      if (startTime) {
        const actualElapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        setTimer(actualElapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 overflow-x-hidden">
      {/* FLOATER HEADER */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className="glass flex items-center justify-between px-10 py-4 rounded-full border-white/5 shadow-2xl">
          <div className="flex items-center gap-3">
            <Code2 className="text-primary" size={20} />
            <span className="font-serif text-lg tracking-tight">Algorithm Arena</span>
          </div>

          <div className="bg-black/60 px-6 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-inner">
            {/* Pulsing threshold at 15 mins (900s) */}
            <Timer size={16} className={`${timer > 900 ? "text-yellow-500" : "text-primary"} animate-pulse`} />
            <span className="font-mono font-bold text-sm">
              {Math.floor(timer / 3600)}:{String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </span>
          </div>

          <Button 
            onClick={fetchNewQuestion} 
            variant="ghost" 
            className="rounded-full hover:bg-white/10 hover:text-white gap-2 text-muted-foreground transition-colors"
          >
            Skip Challenge <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT AREA WITH ADJUSTABLE PANELS */}
      <div className="max-w-[1600px] mx-auto px-6 h-[calc(100vh-140px)]">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL: PROBLEM */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full pr-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
              <h1 className="text-3xl font-serif mb-2">{question.title}</h1>
              <div className="flex gap-2 mb-6">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">JAVA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-muted-foreground uppercase">
                  {question.difficulty}
                </span>
              </div>

              <div className="glass p-6 rounded-2xl border-white/5 mb-6">
                <p className="text-muted-foreground leading-relaxed text-sm mb-8">{question.description}</p>

                {/* EXAMPLES SECTION */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Example Cases</h3>
                  {(showMoreExamples ? question.examples : question.examples.slice(0, 3)).map((ex: any, i: number) => (
                    <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[11px]">
                      <div className="text-primary/60 mb-1">
                        Input: <span className="text-white">{ex.input}</span>
                      </div>
                      <div className="text-primary/60">
                        Output: <span className="text-white">{ex.output}</span>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-white hover:bg-white/5"
                    onClick={() => setShowMoreExamples(!showMoreExamples)}
                  >
                    {showMoreExamples ? "Show Less" : `View ${question.examples.length - 3} More Examples`}{" "}
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </div>
              </div>

              {/* HINTS SECTION (15 MINS) */}
              <div className="space-y-3 pb-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground">Strategic Hints</h3>
                  {timer < 900 && <span className="text-[9px] text-yellow-500/50 italic">Available in {15 - Math.floor(timer / 60)}m</span>}
                </div>
                {timer >= 900 ? (
                  <div className="space-y-2">
                    {question.hints.map((h: string, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-yellow-200/70 flex gap-3 animate-in fade-in duration-500"
                      >
                        <Lightbulb size={14} className="shrink-0 text-yellow-500" /> {h}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-muted-foreground/30 text-xs gap-2">
                    <Lock size={12} /> Hints are locked
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-transparent hover:bg-primary/20 transition-colors cursor-col-resize mx-2 rounded-full" />

          {/* RIGHT PANEL: EDITOR & RESULTS */}
          <Panel defaultSize={60}>
            <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
              <div className="flex-1 min-h-[400px] glass rounded-3xl border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
                <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">Solution.java</span>
                  <div className="flex gap-4">
                    {/* Solutions unlocked after 30 mins (1800s) */}
                    {timer >= 1800 && (
                      <button onClick={() => setIsSolutionOpen(true)} className="text-[10px] text-primary hover:underline uppercase font-bold animate-pulse">
                        View Solutions
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  className="flex-1 bg-transparent p-8 font-mono text-sm text-white outline-none resize-none leading-relaxed selection:bg-primary/30"
                  value={code}
                  spellCheck={false}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              {/* EVALUATION RESULTS PANEL */}
              {evaluation && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div
                    className={`p-6 rounded-2xl border ${
                      evaluation.isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-sm font-bold uppercase tracking-widest ${evaluation.isCorrect ? "text-green-500" : "text-red-500"}`}>
                        {evaluation.isCorrect ? "Accepted" : "Logic Error"}
                      </h3>
                      <div className="flex gap-4 font-mono text-[10px]">
                        <span className="text-white/60">
                          TC: <span className="text-primary">{evaluation.timeComplexity}</span>
                        </span>
                        <span className="text-white/60">
                          SC: <span className="text-primary">{evaluation.spaceComplexity}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed italic">"{evaluation.feedback}"</p>
                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-bold text-primary uppercase mb-2">Alternative Approaches</h4>
                      <p className="text-xs text-white/80 leading-relaxed">{evaluation.alternatives}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="h-14 shrink-0 rounded-2xl text-lg font-serif shadow-primary/20 shadow-lg hover:scale-[1.01] transition-all bg-[#C4A484] text-black hover:bg-[#b08e6b]"
              >
                {isEvaluating ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <>
                    Submit Solution <Send size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* SOLUTIONS POP-UP */}
      {/* --- SOLUTIONS MODAL (INSPECTOR STYLE) --- */}
      {isSolutionOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsSolutionOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] glass rounded-3xl border border-primary/30 bg-[#0a0a0a] shadow-[0_0_50px_rgba(196,164,132,0.1)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Inspector Tabs Logic */}
            <div className="flex items-end px-6 pt-4 bg-white/5 border-b border-primary/20">
              <div className="flex gap-[2px]">
                {question.solutions.map((sol: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveSolutionIdx(i)}
                    className={`relative px-6 py-2 rounded-t-xl transition-all text-[10px] font-bold uppercase tracking-widest
                      ${activeSolutionIdx === i 
                        ? "bg-[#121212] text-primary border-t border-x border-primary/30" 
                        : "bg-transparent text-muted-foreground hover:bg-white/5"}`}
                  >
                    {/* The signature curved corners logic */}
                    {activeSolutionIdx === i && (
                      <>
                        <div className="absolute -left-[10px] bottom-0 w-[10px] h-[10px] bg-[#121212] [mask-image:radial-gradient(circle_at_0_0,transparent_10px,#000_10px)]" />
                        <div className="absolute -right-[10px] bottom-0 w-[10px] h-[10px] bg-[#121212] [mask-image:radial-gradient(circle_at_100%_0,transparent_10px,#000_10px)]" />
                      </>
                    )}
                    {sol.type}
                  </button>
                ))}
              </div>
              
              {/* Top Right Close */}
              <button 
                onClick={() => setIsSolutionOpen(false)}
                className="ml-auto mb-2 p-1.5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Main Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#121212]">
              {/* Logic Explanation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <h2 className="text-xl font-serif text-primary">
                    {question.solutions[activeSolutionIdx].type} Strategy
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                  {question.solutions[activeSolutionIdx].logic}
                </p>
              </div>

              {/* Code Block Container */}
              <div className="relative group">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-mono text-primary/40 uppercase bg-black/40 px-2 py-1 rounded">Read Only</span>
                </div>
                <div className="bg-black/60 rounded-2xl border border-white/5 p-6 font-mono text-sm overflow-x-auto shadow-inner">
                  <pre className="text-primary/90 leading-relaxed">
                    <code>{question.solutions[activeSolutionIdx].code}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer Info Bar */}
            <div className="px-6 py-3 bg-primary/5 border-t border-primary/20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-primary/60" />
                  <span className="text-[9px] font-mono text-primary/60 uppercase">Algorithm: {question.solutions[activeSolutionIdx].type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={12} className="text-primary/60" />
                  <span className="text-[9px] font-mono text-primary/60 uppercase">Language: Java</span>
                </div>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">Ref: Solution_Library.bin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeArena;