// components/DisasterPanel.tsx
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Disaster {
  title: string;
  scenario: string;
  impact: string;
}

export const DisasterPanel = ({ disaster, onRedraw }: { disaster: Disaster; onRedraw: () => void }) => (
  // Change the motion.div class to stay on the left so it doesn't block the buttons
    <motion.div 
    initial={{ x: -300, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }}
    className="absolute top-24 left-6 z-30 w-80 bg-[#121212]/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
    >
    <div className="flex items-center gap-2 text-red-500 mb-4">
      <AlertTriangle size={20} />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Disaster</span>
    </div>
    
    <h3 className="text-white font-bold text-sm mb-2">{disaster.title}</h3>
    <p className="text-gray-400 text-xs leading-relaxed mb-4">{disaster.scenario}</p>
    
    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
      <p className="text-red-200 text-[10px] leading-tight font-medium">IMPACT: {disaster.impact}</p>
    </div>

    <button 
      onClick={onRedraw}
      className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
    >
      <RefreshCcw size={14} /> Redraw to Fix
    </button>
  </motion.div>
);