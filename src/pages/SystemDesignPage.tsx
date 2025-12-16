import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SystemDesignCanvas from "../components/systemDesignCanvas";

const SystemDesignPage = () => {
  return (
    <div className="h-screen bg-[#0a0a0a] text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft size={16} /> <span className="text-sm font-medium">EXIT CANVAS</span>
            </Link>
            <span className="font-serif text-lg tracking-wide">SYSTEM DESIGN BOARD</span>
        </div>
      </header>

      {/* The Whiteboard Area */}
      <div className="flex-1 overflow-hidden p-2">
         <SystemDesignCanvas />
      </div>
    </div>
  );
};

export default SystemDesignPage;