import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, Settings, LayoutDashboard, FileText, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = ({ onRoadmapClick, onFeaturesClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user: userData, login: handleSignIn, logout: handleSignOut } = useAuth();

  const navLinks = [
    { name: "Features", onClick: onFeaturesClick },
    { name: "Roadmap", onClick: onRoadmapClick },
    { name: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between border-white/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
        <a href="/" className="font-serif text-lg font-semibold tracking-wide text-foreground hover:text-yellow-500 transition-colors">
          MOCKMATE
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                if (link.onClick) link.onClick();
                else if (link.href) window.location.href = link.href;
              }}
              className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors duration-300 font-medium"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn && userData ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center outline-none focus:outline-none select-none">
                    <img 
                      src={userData.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                      alt="Profile" 
                      className="w-9 h-9 rounded-full border border-yellow-500/40 hover:border-yellow-500 hover:scale-105 active:scale-95 transition-all cursor-pointer bg-[#0f0f0f]"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-[#0c0c0c]/95 border-white/10 backdrop-blur-xl rounded-2xl p-2 text-white shadow-2xl animate-in fade-in-50 zoom-in-95" align="end">
                  <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Mock Terminal
                  </DropdownMenuLabel>
                  <div className="px-3 py-2 border-b border-white/5 mb-2">
                    <p className="text-sm font-bold text-white truncate">{userData.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{userData.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="hover:bg-white/5 rounded-xl cursor-pointer">
                    <Link to="/interview" className="flex items-center gap-3 px-3 py-2.5 text-xs text-gray-300 hover:text-white transition-colors">
                      <LayoutDashboard size={14} className="text-yellow-500" />
                      <span>Interview Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 rounded-xl cursor-pointer">
                    <Link to="/resume" className="flex items-center gap-3 px-3 py-2.5 text-xs text-gray-300 hover:text-white transition-colors">
                      <FileText size={14} className="text-yellow-500" />
                      <span>Resume Roaster</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 rounded-xl cursor-pointer">
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-xs text-gray-300 hover:text-white transition-colors">
                      <Settings size={14} className="text-yellow-500" />
                      <span>Settings & Persona</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem onSelect={() => handleSignOut()} className="hover:bg-red-500/10 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 transition-colors w-full">
                      <LogOut size={14} />
                      <span>Sign Out Terminal</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleSignIn} variant="outline" size="sm" className="rounded-full px-6 font-bold border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass rounded-2xl mt-2 p-6 animate-in slide-in-from-top-2 duration-300 shadow-2xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  setIsOpen(false);
                  if (link.onClick) link.onClick();
                  else if (link.href) window.location.href = link.href;
                }}
                className="text-muted-foreground hover:text-yellow-500 transition-colors duration-300 py-2 border-b border-white/5 text-sm font-medium text-left w-full"
              >
                {link.name}
              </button>
            ))}
            
            {isLoggedIn && userData ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 border-b border-white/5">
                  <img src={userData.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{userData.name}</span>
                    <span className="text-[10px] text-muted-foreground">{userData.email}</span>
                  </div>
                </div>
                <Link to="/interview" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-yellow-500 py-2 border-b border-white/5 text-sm font-medium transition-colors">
                  <LayoutDashboard size={14} className="text-yellow-500" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-yellow-500 py-2 border-b border-white/5 text-sm font-medium transition-colors">
                  <Settings size={14} className="text-yellow-500" />
                  <span>Settings & Persona</span>
                </Link>
                <button onClick={() => { setIsOpen(false); handleSignOut(); }} className="flex items-center gap-2 text-red-400 hover:text-red-300 py-3 text-sm font-medium transition-colors text-left w-full">
                  <LogOut size={14} />
                  <span>Sign Out Terminal</span>
                </button>
              </>
            ) : (
              <Button onClick={handleSignIn} variant="outline" className="mt-4 rounded-full w-full font-sans py-6 border-yellow-500/50">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;