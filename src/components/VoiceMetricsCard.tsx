import { Activity, Mic, Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface VoiceMetrics {
  wpm: number;          // Pace (Words Per Minute)
  fillers: number;      // Count of "umms", "uhs"
  pauseDuration: number;// Seconds of silence
  tone: "Confident" | "Neutral" | "Anxious" | "Monotone";
  clarityScore: number; // 0-100
  feedback: string;
}

const VoiceMetricsCard = ({ metrics }: { metrics: VoiceMetrics }) => {
  // Helpers for visual styling
  const getPaceLabel = (wpm: number) => {
    if (wpm < 110) return { text: "Too Slow", color: "text-blue-400" };
    if (wpm > 160) return { text: "Too Fast", color: "text-orange-400" };
    return { text: "Perfect Pace", color: "text-green-400" };
  };

  const paceStyle = getPaceLabel(metrics.wpm);

  return (
    <div className="mt-4 p-6 rounded-xl border border-white/10 bg-[#0F0F0F] backdrop-blur-md animate-in slide-in-from-bottom-5">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h3 className="font-serif text-xl tracking-wide flex items-center gap-2">
           <Mic className="w-5 h-5 text-primary" /> Speech Analysis
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
             metrics.tone === "Confident" ? "border-green-500/50 text-green-400 bg-green-500/10" : 
             metrics.tone === "Anxious" ? "border-red-500/50 text-red-400 bg-red-500/10" : 
             "border-gray-500/50 text-gray-400"
        }`}>
            Tone: {metrics.tone}
        </span>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         
         {/* 1. PACE (WPM) */}
         <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Clock size={14} /> Pace
            </div>
            <div className="text-2xl font-bold text-white">{metrics.wpm} <span className="text-xs font-normal">wpm</span></div>
            <div className={`text-xs ${paceStyle.color} font-medium mt-1`}>{paceStyle.text}</div>
         </div>

         {/* 2. FILLERS */}
         <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <AlertTriangle size={14} /> Fillers
            </div>
            <div className="text-2xl font-bold text-white">{metrics.fillers}</div>
            <div className="text-xs text-gray-500 mt-1">"um, like, uh"</div>
         </div>

         {/* 3. PAUSES */}
         <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Activity size={14} /> Silence
            </div>
            <div className="text-2xl font-bold text-white">{metrics.pauseDuration}s</div>
            <div className="text-xs text-gray-500 mt-1">Total pauses</div>
         </div>

         {/* 4. CLARITY SCORE */}
         <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Zap size={14} /> Clarity
            </div>
            <div className="text-2xl font-bold text-white">{metrics.clarityScore}%</div>
            
            {/* Tiny Progress Bar */}
            <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${metrics.clarityScore}%` }}></div>
            </div>
         </div>
      </div>

      {/* FEEDBACK TEXT */}
      <div className="flex gap-3 bg-primary/5 border border-primary/20 p-4 rounded-lg">
         <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
         <p className="text-sm text-gray-300 leading-relaxed">
            {metrics.feedback}
         </p>
      </div>

    </div>
  );
};

export default VoiceMetricsCard;