import { useEffect, useState } from "react";
import { Circle, Minus, X } from "lucide-react";

const DemoPreview = () => {
  const [displayedMessages, setDisplayedMessages] = useState<number>(0);

  const messages = [
    {
      type: "user",
      content: "How would you design a HashMap in Java with O(1) lookup?",
    },
    {
      type: "ai",
      content: "Great question! A HashMap achieves O(1) average-case lookup through hash-based indexing. Let me walk you through the key components:",
    },
    {
      type: "ai-code",
      content: `class MyHashMap<K, V> {
    private Entry<K,V>[] buckets;
    
    public V get(K key) {
        int index = hash(key) % buckets.length;
        return buckets[index].getValue();
    }
}`,
    },
    {
      type: "ai",
      content: "The hash function converts keys to array indices. Would you like me to explain collision handling strategies next?",
    },
  ];

  useEffect(() => {
    if (displayedMessages < messages.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [displayedMessages, messages.length]);

  return (
    <section id="demo" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm text-primary font-medium tracking-widest uppercase">
            Live Demo
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mt-4">
            Experience the
            <br />
            <span className="text-muted-foreground">Intelligence</span>
          </h2>
        </div>

        {/* Terminal Window */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-110" />

          <div className="relative glass-strong rounded-xl overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-destructive/60 fill-current" />
                <Circle className="w-3 h-3 text-primary/60 fill-current" />
                <Circle className="w-3 h-3 text-green-500/60 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                MockMate AI — Interview Session
              </span>
              <div className="flex items-center gap-2 text-muted-foreground/50">
                <Minus className="w-4 h-4" />
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-6 space-y-6 min-h-[400px]">
              {messages.slice(0, displayedMessages).map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 animate-fade-in ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.type !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-serif text-primary">AI</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      msg.type === "user"
                        ? "bg-primary/10 border border-primary/20"
                        : msg.type === "ai-code"
                        ? "bg-secondary/50 border border-border/50 font-mono text-sm"
                        : "bg-card border border-border/50"
                    } rounded-lg p-4`}
                  >
                    {msg.type === "ai-code" ? (
                      <pre className="text-foreground/80 whitespace-pre-wrap">
                        {msg.content}
                      </pre>
                    ) : (
                      <p className="text-foreground/90 leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                  </div>
                  {msg.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-muted-foreground">You</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {displayedMessages < messages.length && (
                <div className="flex gap-4 items-center animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-serif text-primary">AI</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreview;
