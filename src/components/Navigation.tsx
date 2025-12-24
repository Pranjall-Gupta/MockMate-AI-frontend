import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = ({ onRoadmapClick, onFeaturesClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", onClick: onFeaturesClick },
    { name: "Roadmap", onClick: onRoadmapClick },
    { name: "About", href: "#about" },
  ];
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between border-white/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
        <a href="/" className="font-serif text-lg font-semibold tracking-wide text-foreground hover:text-yellow-500 transition-colors">
          MOCKMATE
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.onClick || (() => window.location.href = link.href)}
              className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors duration-300 font-medium"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:block">
          <Link to="/interview">
             <Button variant="hero" size="sm" className="rounded-full px-6 font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
               Start Interview
             </Button>
          </Link>
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
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-yellow-500 transition-colors duration-300 py-2 border-b border-white/5 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link to="/interview" onClick={() => setIsOpen(false)}>
              <Button variant="hero" className="mt-4 rounded-full w-full font-sans py-6">
                Start Interview
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;