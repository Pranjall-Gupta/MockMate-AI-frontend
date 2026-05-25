import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogIn, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-serif tracking-[0.2em] text-[10px] uppercase animate-pulse">Securing Terminal Link...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
        {/* Decorative Grid texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />
        
        {/* Glow behind terminal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="glass rounded-[2rem] p-10 border border-primary/20 max-w-md w-full text-center shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-500">
          {/* Golden filament accent edge */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent blur-[1px]" />
          
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
            <Lock className="text-primary w-6 h-6 animate-pulse" />
          </div>
          
          <h2 className="font-serif text-2xl text-gradient-gold mb-3 uppercase tracking-widest">Classified Terminal</h2>
          <p className="text-muted-foreground text-xs leading-relaxed mb-8">
            Access to this technical intelligence arena is restricted. Please authenticate via Google to synchronize your interview stats and resume roasts.
          </p>
          
          <Button 
            onClick={login} 
            variant="hero" 
            size="lg" 
            className="w-full rounded-2xl font-bold tracking-widest uppercase text-xs h-14 hover:scale-[1.01] transition-transform shadow-lg shadow-primary/10"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Authenticate with Google
          </Button>
          
          <a 
            href="/" 
            className="block text-center text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground hover:text-white mt-6 transition-colors"
          >
            Return to Space HQ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
