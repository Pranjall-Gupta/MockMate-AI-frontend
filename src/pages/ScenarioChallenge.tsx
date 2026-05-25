import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Flame, HardHat, Code2, CheckCircle2, 
  RotateCw, Lightbulb, XCircle, AlertTriangle, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
interface ScenarioData {
  title: string;
  description: string;
  codeSnippet?: string;
  question: string;
  options?: string[]; 
  correctOption?: string;
  explanation: string;
}

const ScenarioChallenge = () => {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");

  const generateScenario = async (role: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentRole(role);
    setScenario(null); 
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswer("");

    try {
      const response = await api.post("/interview/scenario", { role: role });
      const parsedScenario = typeof response.data.scenario === 'string'
        ? JSON.parse(response.data.scenario)
        : response.data.scenario;
      setScenario(parsedScenario);
    } catch (err) {
      setError("AI is currently overloaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentRole(null);
    setScenario(null);
    setError(null);
    setShowResult(false);
  };

  const handleOptionClick = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
  };

  const getTheme = () => {
    switch (currentRole) {
        case "firefighter": // BURGUNDY & RUBY
        return { 
            color: "text-red-400", 
            border: "border-red-500/30", 
            cardBorder: "border-red-500/20",
            bgGradient: "from-[#1a0505] via-[#050505] to-[#050505]", // Immersive Burgundy
            cardBg: "bg-red-950/10",
            glow: "bg-red-600/10", 
            icon: <Flame className="text-red-500" /> 
        };
        case "architect": // NAVY & MIDNIGHT
        return { 
            color: "text-blue-400", 
            border: "border-blue-500/30", 
            cardBorder: "border-blue-500/20",
            bgGradient: "from-[#050b1a] via-[#050505] to-[#050505]", // Immersive Navy
            cardBg: "bg-blue-950/10",
            glow: "bg-blue-600/10", 
            icon: <HardHat className="text-blue-500" /> 
        };
        case "reviewer": // EMERALD & FOREST
        return { 
            color: "text-emerald-400", 
            border: "border-emerald-500/30", 
            cardBorder: "border-emerald-500/20",
            bgGradient: "from-[#051a0b] via-[#050505] to-[#050505]", // Immersive Emerald
            cardBg: "bg-emerald-950/10",
            glow: "bg-emerald-600/10", 
            icon: <Code2 className="text-emerald-500" /> 
        };
        default:
        return { 
            color: "text-primary", 
            border: "border-white/10", 
            cardBorder: "border-white/10",
            bgGradient: "from-[#050505] via-[#050505] to-[#050505]",
            cardBg: "bg-white/5",
            glow: "bg-primary/10", 
            icon: <Sparkles /> 
        };
    }
  };
  const theme = getTheme();

  return (
    <div className={`relative min-h-screen transition-colors duration-1000 bg-gradient-to-b ${theme.bgGradient} text-foreground font-sans selection:bg-primary/30 overflow-x-hidden`}>
      
      {/* TEXTURE OVERLAY (Mimics high-end paper/fabric) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* HEADER */}
        <div className="w-full flex items-center justify-between mb-12 animate-fade-in">
          <Link to="/" className="group flex items-center gap-3 text-muted-foreground hover:text-white transition-all">
              <div className="p-2 rounded-full glass border border-white/5 group-hover:bg-white/10">
                <ArrowLeft size={16} />
              </div>
              <span className="text-[9px] font-black tracking-[0.3em] uppercase">Return to Terminal</span>
          </Link>
          <div className="flex flex-col items-end">
            <span className="font-serif text-2xl tracking-tight text-gradient-gold">MOCKMATE</span>
            <span className="text-[9px] tracking-[0.3em] text-muted-foreground/60 uppercase">Incubation Labs</span>
          </div>
        </div>

        {/* --- STATE 1: LOBBY --- */}
        {!currentRole && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
            {[
              { id: "firefighter", title: "Production Firefighter", desc: "Critical systems are failing. Analyze logs and deploy a fix.", icon: <Flame />, color: "hover:border-red-500/40 hover:shadow-red-500/5", bg: "hover:bg-red-500/5" },
              { id: "architect", title: "Cloud Architect", desc: "Optimize complex deployments for cost and high availability.", icon: <HardHat />, color: "hover:border-blue-500/40 hover:shadow-blue-500/5", bg: "hover:bg-blue-500/5" },
              { id: "reviewer", title: "Code Reviewer", desc: "Scan logic flows for vulnerabilities and junior dev errors.", icon: <Code2 />, color: "hover:border-emerald-500/40 hover:shadow-emerald-500/5", bg: "hover:bg-emerald-500/5" }
            ].map((role, i) => (
              <button 
                key={role.id}
                onClick={() => generateScenario(role.id)} 
                className={`group relative p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-500 text-left hover:-translate-y-2 ${role.color} ${role.bg} opacity-0 animate-fade-in-up shadow-2xl`}
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                    {role.icon}
                </div>
                <h2 className="text-xl font-serif font-medium text-white mb-3 tracking-tight group-hover:text-gradient-gold transition-colors">{role.title}</h2>
                <p className="text-gray-500 text-xs leading-relaxed leading-relaxed">{role.desc}</p>
                <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </button>
            ))}
          </div>
        )}

        {/* --- STATE 2: LOADING --- */}
        {/* --- STATE 2: LOADING (Immersive Particles) --- */}
        {/* --- STATE 2: LOADING (Role-Specific Immersive Effects) --- */}
        {isLoading && (
        <div className="flex flex-col items-center justify-center h-[55vh] space-y-8 relative overflow-hidden w-full">
            {/* Particle System */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => {
                let content = null;
                let colorClass = "";

                if (currentRole === "firefighter") {
                    // Sparks: Orange Embers
                    colorClass = "w-1 h-1 bg-orange-500 shadow-[0_0_8px_#f97316] rounded-full";
                } else if (currentRole === "architect") {
                    // Data Bits: Blue Binary
                    colorClass = "text-blue-400/80 font-mono text-[10px]";
                    content = Math.random() > 0.5 ? "0" : "1";
                } else {
                    // Reviewer: Emerald Code Fragments
                    colorClass = "text-emerald-400/80 font-mono text-[10px]";
                    const fragments = ["{ }", ";", "</>", "[]", "=>"];
                    content = fragments[Math.floor(Math.random() * fragments.length)];
                }

                return (
                    <div
                    key={i}
                    className={`absolute animate-particle opacity-0 flex items-center justify-center ${colorClass}`}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1.5 + Math.random() * 2}s`
                    }}
                    >
                    {content}
                    </div>
                );
                })}
            </div>

            <div className="relative">
                {/* Role-Colored Spinner */}
                <div className={`w-20 h-20 rounded-full border-[1px] border-white/5 ${
                    currentRole === 'reviewer' ? 'border-t-emerald-500' : 
                    currentRole === 'firefighter' ? 'border-t-red-500' : 'border-t-blue-500'
                } animate-spin`} />
                <Sparkles className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse ${
                    currentRole === 'reviewer' ? 'text-emerald-500' : 'text-yellow-500'
                }`} size={24} />
            </div>
            
            <div className="text-center z-10 px-4">
                <h2 className="text-3xl font-serif text-gradient-gold tracking-tight">
                {currentRole === "firefighter" && "Extinguishing Logs..."}
                {currentRole === "architect" && "compiling_intel.sh"}
                {currentRole === "reviewer" && "scanning_vulnerabilities..."}
                </h2>
                <p className="text-muted-foreground text-[10px] tracking-[0.4em] mt-4 uppercase font-black opacity-40">
                Syncing with AI Logic Core
                </p>
            </div>
        </div>
        )}
        {/* --- STATE 3: ERROR CARD --- */}
        {error && !isLoading && (
          <div className="w-full max-w-md mx-auto mt-10 bg-black/40 border border-red-500/20 rounded-[2rem] p-8 text-center backdrop-blur-xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
            
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/5">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            
            <h3 className="text-white font-serif text-lg mb-2">Simulation Failure</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              {error}
              <br />
              <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                Reason: The AI model generated an invalid format or could not connect. Check your Spring Boot environment variables (<code className="text-yellow-500 font-bold select-all">AZURE_OPENAI_KEY</code>).
              </span>
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleCancel} 
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
              >
                Lobby
              </button>
              <button 
                onClick={() => currentRole && generateScenario(currentRole)} 
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* --- STATE 4: GAMEPLAY (The Immersive Card) --- */}
        {scenario && !isLoading && !error && (
          <div className={`w-full max-w-2xl ${theme.cardBg} backdrop-blur-3xl border ${theme.cardBorder} rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-fade-in-up relative overflow-hidden`}>
            
            {/* GOLDEN FILAMENT EDGE (Inspired by image_97cd9b) */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent blur-[1px]" />

            {/* Header Badge */}
            <div className="flex items-center justify-between mb-10">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border ${theme.border} ${theme.color} text-[9px] font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                    {theme.icon}
                    <span>{currentRole} ACTIVE</span>
                </div>
                <button onClick={handleCancel} className="text-muted-foreground/40 hover:text-red-400 text-[9px] tracking-[0.2em] transition-all uppercase font-black">
                    Abandon
                </button>
            </div>

            <h2 className="text-3xl font-serif font-medium text-white mb-6 leading-tight tracking-tight">
              {scenario.title}
            </h2>
            
            <p className="text-gray-400 text-base mb-10 leading-relaxed font-sans italic border-l-2 border-yellow-500/40 pl-6">
                "{scenario.description}"
            </p>

            {scenario.codeSnippet && scenario.codeSnippet !== "N/A" && (
                <div className="relative group mb-10">
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-yellow-500/20 to-white/5 rounded-2xl blur-[1px] opacity-40" />
                  <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 font-mono text-xs text-blue-300/80 overflow-x-auto leading-6 shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)]">
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <span className="text-[8px] tracking-widest text-muted-foreground uppercase font-black">System_Log_Source</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
                        </div>
                      </div>
                      <pre>{scenario.codeSnippet}</pre>
                  </div>
                </div>
            )}

            <div className="space-y-8">
                <h3 className="text-lg text-white font-medium tracking-tight flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-yellow-500/40" />
                  {scenario.question}
                </h3>

                {scenario.options ? (
                    <div className="grid grid-cols-1 gap-4">
                        {scenario.options.map((opt, idx) => {
                            // PERSISTENT GOLD BOUNDARY LOGIC
                            let btnStyle = "bg-white/[0.03] border-yellow-600/20 text-gray-400 hover:border-yellow-500 hover:bg-yellow-500/5 hover:text-white";
                            
                            if (showResult) {
                                if (opt === scenario.correctOption) {
                                    btnStyle = "bg-green-500/10 border-green-500/60 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                                } else if (opt === selectedOption) {
                                    btnStyle = "bg-red-500/10 border-red-500/60 text-red-400";
                                } else {
                                    btnStyle = "opacity-20 border-white/5 grayscale pointer-events-none";
                                }
                            }

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleOptionClick(opt)}
                                    disabled={showResult} 
                                    className={`p-5 rounded-xl border text-left transition-all duration-500 flex items-center justify-between group shadow-xl ${btnStyle}`}
                                >
                                    <span className="font-medium text-sm tracking-wide">{opt}</span>
                                    {showResult && opt === scenario.correctOption && <CheckCircle2 className="text-green-500 animate-in zoom-in" size={20} />}
                                    {showResult && opt === selectedOption && opt !== scenario.correctOption && <XCircle className="text-red-400 animate-in zoom-in" size={20} />}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea 
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your strategic deployment fix..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white h-32 focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-muted-foreground/30 text-sm"
                        />
                        <Button 
                            variant="hero"
                            className="w-full rounded-2xl py-6 text-lg font-bold group"
                            onClick={() => setShowResult(true)}
                        >
                            Deploy Solution
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}

                {showResult && (
                    <div className="relative mt-12 animate-in slide-in-from-top-4 duration-700">
                        <div className="absolute inset-0 bg-yellow-500/5 blur-3xl rounded-full" />
                        <div className="relative bg-black/40 border border-yellow-500/20 rounded-[2rem] p-8 shadow-2xl">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 h-fit">
                                  <Lightbulb size={24} />
                                </div>
                                <div>
                                    <h4 className="text-gradient-gold font-serif text-xl mb-2 tracking-tight">Technical Post-Mortem</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed italic font-light tracking-wide leading-relaxed">
                                      {scenario.explanation}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => generateScenario(currentRole!)} 
                                className="mt-8 flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white text-[10px] font-black tracking-[0.4em] uppercase transition-all group"
                            >
                                <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" /> 
                                Request New Intel
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Footer Tip */}
        <div className="mt-20 flex items-center gap-6 text-[9px] tracking-[0.4em] text-muted-foreground/30 uppercase font-black">
          <div className="w-12 h-[1px] bg-white/5" />
          <span>Neural Link Established</span>
          <div className="w-12 h-[1px] bg-white/5" />
        </div>
      </div>
    </div>
  );
};

export default ScenarioChallenge;