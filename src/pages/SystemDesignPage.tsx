import { useState } from "react";
import { ArrowLeft, LayoutGrid, MessageSquare, Database, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import SystemDesignCanvas from "../components/systemDesignCanvas";

const CHALLENGES = [
  { id: "general", label: "Blank Canvas", icon: <LayoutGrid size={16} /> },
  { id: "messenger", label: "WhatsApp Clone", icon: <MessageSquare size={16} /> },
  { id: "facebook", label: "Facebook Feed", icon: <Database size={16} /> },
  { id: "ecommerce", label: "Amazon Flash Sale", icon: <ShoppingBag size={16} /> },
];

const SystemDesignPage = () => {
  const [activeChallenge, setActiveChallenge] = useState("general");

  return (
    <div className="h-screen bg-[#0a0a0a] text-foreground font-sans flex flex-col">
      <header className="border-b border-white/10 p-4 shrink-0 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft size={16} /> <span className="text-sm font-medium tracking-widest uppercase">EXIT</span>
            </Link>
            
            {/* CHALLENGE SELECTOR */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChallenge(c.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeChallenge === c.id 
                    ? "bg-gold text-black shadow-[0_0_15px_rgba(201,162,39,0.4)]" 
                    : "text-gray-400 hover:text-white"
                  }`}
                >
                  {c.icon}
                  {c.label}
                </button>
              ))}
            </div>

            <span className="font-serif text-lg tracking-widest text-gold-light hidden md:block">
              SYSTEM DESIGN BOARD
            </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-2">
         {/* Pass the activeChallenge to the Canvas component */}
         <SystemDesignCanvas challenge={activeChallenge} />
      </div>
    </div>
  );
};

export default SystemDesignPage;