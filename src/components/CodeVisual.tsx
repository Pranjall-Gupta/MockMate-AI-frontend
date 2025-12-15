import { useEffect, useState } from "react";

const CodeVisual = () => {
  const [currentLine, setCurrentLine] = useState(0);

  const codeLines = [
    { type: 'keyword', content: 'public class', extra: ' Solution {' },
    { type: 'comment', content: '    // System Design: Distributed Cache' },
    { type: 'method', content: '    public CacheNode', extra: ' getNode(String key) {' },
    { type: 'normal', content: '        int hash = key.hashCode();' },
    { type: 'normal', content: '        int index = hash % nodeCount;' },
    { type: 'keyword', content: '        return', extra: ' nodes[index];' },
    { type: 'normal', content: '    }' },
    { type: 'normal', content: '}' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % codeLines.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Glow behind */}
      <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
      
      {/* Code Window */}
      <div className="relative glass rounded-xl overflow-hidden animate-float">
        {/* Window Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-4 font-mono">Solution.java</span>
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-sm leading-relaxed">
          {codeLines.map((line, index) => (
            <div 
              key={index}
              className={`transition-all duration-300 ${
                index === currentLine ? 'bg-primary/10 -mx-6 px-6' : ''
              }`}
            >
              <span className="text-muted-foreground/40 mr-4 select-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              {line.type === 'keyword' && (
                <>
                  <span className="text-primary">{line.content}</span>
                  <span className="text-foreground">{line.extra}</span>
                </>
              )}
              {line.type === 'comment' && (
                <span className="text-muted-foreground italic">{line.content}</span>
              )}
              {line.type === 'method' && (
                <>
                  <span className="text-foreground">{line.content}</span>
                  <span className="text-foreground">{line.extra}</span>
                </>
              )}
              {line.type === 'normal' && (
                <span className="text-foreground/80">{line.content}</span>
              )}
            </div>
          ))}
        </div>

        {/* Line indicator */}
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50 font-mono">
          Ln {currentLine + 1}, Col 1
        </div>
      </div>
    </div>
  );
};

export default CodeVisual;
