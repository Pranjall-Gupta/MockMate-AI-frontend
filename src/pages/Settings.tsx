import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Cpu, 
  Terminal, 
  Sparkles,
  Check,
  LogOut,
  RefreshCw
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
}

const PRESET_PERSONAS: Persona[] = [
  {
    id: "ninja",
    name: "Code Ninja",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ninja&backgroundColor=b6e3f4",
    role: "Technical DSA Specialist",
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(16,185,129,0.15)",
    description: "Master of algorithms, recursion, and stealth optimization."
  },
  {
    id: "architect",
    name: "Systems Architect",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=architect&backgroundColor=ffdf00",
    role: "High-Scalability Design Specialist",
    color: "from-amber-500 to-yellow-600",
    borderColor: "border-yellow-500/30",
    glowColor: "rgba(245,158,11,0.15)",
    description: "Conquers distributed databases, message queues, and load balancers."
  },
  {
    id: "sleuth",
    name: "DB Sleuth",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=sleuth&backgroundColor=c0aede",
    role: "Database & Query Inspector",
    color: "from-indigo-500 to-purple-600",
    borderColor: "border-purple-500/30",
    glowColor: "rgba(99,102,241,0.15)",
    description: "Sniffs out slow SQL queries, deadlocks, and missing indexes."
  },
  {
    id: "ai",
    name: "AI Explorer",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=explorer&backgroundColor=d1c4e9",
    role: "LLM & Neural Network Engineer",
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/30",
    glowColor: "rgba(6,182,212,0.15)",
    description: "Harnesses transformer models, embeddings, and prompt vectors."
  }
];

const Settings = () => {
  const { user: userData, checkAuth, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.name || "");
      setAvatarUrl(userData.avatarUrl || "");
      
      // Auto-detect if one of the personas matches the current avatarUrl
      const matched = PRESET_PERSONAS.find(p => p.avatarUrl === userData.avatarUrl);
      if (matched) {
        setActivePersona(matched.id);
      }
    }
  }, [userData]);

  const selectPersona = (persona: Persona) => {
    setActivePersona(persona.id);
    setDisplayName(persona.name);
    setAvatarUrl(persona.avatarUrl);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Display Name cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.put("/user/update", {
        name: displayName,
        avatarUrl: avatarUrl
      });

      // Refresh authentication context to update UI immediately
      await checkAuth();

      toast({
        title: "Profile Synchronized",
        description: "Your cybernetic mock identity has been successfully updated.",
        className: "bg-[#121212] border-yellow-500/30 text-white"
      });
    } catch (err) {
      toast({
        title: "Synchronization Failed",
        description: "Could not persist changes to MockMate servers.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentPersona = PRESET_PERSONAS.find(p => p.id === activePersona);

  return (
    <div className="min-h-screen bg-[#070707] text-foreground font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-[10px] font-bold tracking-widest uppercase">BACK TO HQ</span>
        </Link>
        <div className="flex items-center gap-2 text-yellow-500">
          <Cpu size={20} className="animate-spin duration-3000" />
          <span className="font-serif text-xl tracking-[0.3em] uppercase text-gradient-gold">Terminal Settings</span>
        </div>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl relative z-10">
        {/* Left Column: Customization Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            {/* Top Filament Accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            
            <div className="flex items-center gap-3 mb-6 text-yellow-500">
              <Shield size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Mock Identity Credentials</h2>
            </div>

            <div className="space-y-6">
              {/* Display Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                <Input 
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    // Clear persona active selection if it doesn't match name anymore
                    if (currentPersona && e.target.value !== currentPersona.name) {
                      setActivePersona(null);
                    }
                  }}
                  placeholder="Enter Display Name..."
                  className="bg-black/40 border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:border-yellow-500/30 transition-all outline-none"
                />
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile Avatar URL</label>
                <Input 
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    // Clear persona active selection if it doesn't match URL anymore
                    if (currentPersona && e.target.value !== currentPersona.avatarUrl) {
                      setActivePersona(null);
                    }
                  }}
                  placeholder="Paste Avatar Image URL..."
                  className="bg-black/40 border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:border-yellow-500/30 transition-all outline-none font-mono"
                />
              </div>

              {/* Update Button */}
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                variant="hero"
                className="w-full py-6 rounded-2xl font-bold uppercase tracking-widest text-xs h-14 hover:scale-[1.01] transition-all shadow-lg mt-4"
              >
                {isSaving ? "Synchronizing..." : "Update Terminal Profile"}
              </Button>
            </div>
          </div>

          {/* Preset Persona Switcher */}
          <div className="glass border border-white/5 rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 text-yellow-500">
              <Sparkles size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Select Mock Persona</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_PERSONAS.map((persona) => {
                const isSelected = activePersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => selectPersona(persona)}
                    className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected 
                        ? `${persona.borderColor} bg-white/[0.03] shadow-lg` 
                        : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.01]"
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 20px ${persona.glowColor}` : "none"
                    }}
                  >
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-yellow-500/10 text-yellow-500 p-1.5 rounded-full border border-yellow-500/20">
                        <Check size={10} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-3">
                      <img 
                        src={persona.avatarUrl} 
                        alt={persona.name} 
                        className="w-12 h-12 rounded-xl border border-white/10"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">
                          {persona.name}
                        </h3>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">
                          {persona.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {persona.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Profile Preview badge */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="glass border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Top Filament Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

            <div className="flex items-center gap-2 mb-8 self-start text-yellow-500">
              <Terminal size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Mock ID Card</h2>
            </div>

            {/* Profile badge graphics */}
            <div className="w-full relative bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-inner overflow-hidden mb-6">
              {/* Sci-fi radar ring graphic */}
              <div className="absolute -top-16 -right-16 w-36 h-36 border border-yellow-500/5 rounded-full" />
              <div className="absolute -top-12 -right-12 w-28 h-28 border border-yellow-500/5 rounded-full" />

              <div className="relative w-28 h-28 mb-4">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-[2px] animate-pulse" />
                <img 
                  src={avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                  alt="Profile Preview" 
                  className="w-full h-full rounded-full border-2 border-yellow-500/40 relative z-10 bg-[#0f0f0f]"
                />
              </div>

              <h3 className="font-serif text-lg font-bold text-white tracking-wide mb-1 text-center truncate w-full">
                {displayName || "Awaiting Name"}
              </h3>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 mb-6">
                <User size={10} />
                <span className="text-[9px] uppercase font-bold tracking-widest">
                  {currentPersona ? currentPersona.role : "General Developer"}
                </span>
              </div>

              {/* Holographic scanner details */}
              <div className="w-full space-y-3 pt-6 border-t border-white/5 text-[10px] text-muted-foreground font-mono">
                <div className="flex justify-between">
                  <span>EMAIL LINK:</span>
                  <span className="text-white select-all">{userData?.email || "n/a"}</span>
                </div>
                <div className="flex justify-between">
                  <span>MATE STATUS:</span>
                  <span className="text-emerald-400 font-bold uppercase">Online / Sync</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURE NODE:</span>
                  <span className="text-yellow-500 truncate w-32 text-right">
                    {userData?.id || "anonymous"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              This Cyber ID badge acts as your authentication passport across MockMate. Customizing details allows you to simulate mock interview scenarios with specific personas.
            </p>
          </div>

          {/* Danger Zone / session control */}
          <div className="glass border border-red-500/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-start mt-6 w-full animate-in fade-in duration-500">
            {/* Top Filament Accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />

            <div className="flex items-center gap-2 mb-4 text-red-500">
              <LogOut size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono">Terminal Security Control</h2>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed mb-6">
              Manage your current active terminal session. Switching accounts or signing out will safely terminate your synchronized MongoDB cloud connection.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => logout()}
                className="py-4 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut size={12} />
                Sign Out
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const redirectUri = window.location.origin + "/?action=login";
                  logout(redirectUri);
                }}
                className="py-4 border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/5 text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} />
                Switch Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
