import { useState, useEffect, useRef } from "react";
import { Send, Bot, ArrowLeft, Mic, Square, RotateCw, Lightbulb, Award, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import VoiceMetricsCard, { VoiceMetrics } from "@/components/VoiceMetricsCard";
import api from "@/lib/api";

interface Message {
  type: "user" | "ai";
  content: string;
  metrics?: VoiceMetrics;
  score?: number; 
}

const Interview = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStart, setRecordingStart] = useState<number>(0);
  
  // --- REFS (Now safely inside the component) ---
  const abortControllerRef = useRef<AbortController | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Session State ---
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<{q: string, s: number}[]>([]);
  const [streak, setStreak] = useState(0);

  const MAX_QUESTIONS = 5; 
  const [suggestions, setSuggestions] = useState<string[]>(["Java", "DSA", "System Design"]);

  const [messages, setMessages] = useState<Message[]>([
    { type: "ai", content: "Welcome to the Assessment Center. To begin, please choose a core topic." }
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const extractScore = (text: string): number => {
    const match = text.match(/Score:\s*(\d+)\/10/i);
    return match ? parseInt(match[1]) : 0;
  };

  const startInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
        handleSend("I'm struggling to frame my thoughts. Can you give me a structural hint?");
    }, 120000); 
  };

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim()) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    if (timerRef.current) clearTimeout(timerRef.current);

    // Topic/Difficulty Logic
    if (!selectedTopic && ["java", "dsa", "system design"].includes(textToSend.toLowerCase())) {
        setSelectedTopic(textToSend);
        setSuggestions(["Easy Mode", "Medium Mode", "Hard Mode", "Adaptive Mode"]);
        setMessages(prev => [...prev, { type: "user", content: textToSend }, { type: "ai", content: `Excellent. Select your difficulty for ${textToSend}.` }]);
        setInput("");
        return; 
    }
    if (selectedTopic && !sessionStarted && (textToSend.toLowerCase().includes("mode") || textToSend.toLowerCase().includes("adaptive"))) {
        setDifficulty(textToSend);
        setSessionStarted(true);
    }

    // --- IMPROVED QUESTION CAPTURE ---
    const rawQuestion = messages.slice().reverse().find(m => m.type === "ai")?.content || "Technical Question";
    // This regex removes the previous score/feedback from the question for a clean report
    const currentQuestion = rawQuestion.split(/Next question:|Next question/i).pop()?.trim() || rawQuestion;

    const userMessage: Message = { type: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/interview/chat", updatedMessages);
      const score = extractScore(response.data.content);
      
      if (score > 0) {
        setSessionHistory(prev => [...prev, { q: currentQuestion, s: score }]);
        setQuestionCount(prev => prev + 1);
      }

      processTurn(response.data.content, score);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setMessages(prev => [...prev, { type: "ai", content: "The connection flickered. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const processTurn = (aiContent: string, score: number, metrics?: VoiceMetrics) => {
    if (score >= 7) setStreak(prev => prev + 1);
    else if (score > 0) setStreak(0);

    setMessages(prev => [...prev, { type: "ai", content: aiContent, score, metrics }]);

    if (questionCount >= MAX_QUESTIONS - 1 && score > 0) {
      setSuggestions(["Generate Final Report", "Change Topic"]);
    } else {
      setSuggestions(["Next Question", "Give me a Hint", "Change Topic"]);
      startInactivityTimer();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new RecordRTC(stream, { type: 'audio', mimeType: 'audio/wav', recorderType: StereoAudioRecorder, numberOfAudioChannels: 1, desiredSampRate: 16000 });
      recorder.startRecording();
      recorderRef.current = recorder;
      setRecordingStart(Date.now());
      setIsRecording(true);
    } catch (err) { alert("Mic access denied."); }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      setIsRecording(false);
      recorderRef.current.stopRecording(() => {
        const audioBlob = recorderRef.current!.getBlob();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        handleVoiceUpload(audioBlob);
      });
    }
  };

  const handleVoiceUpload = async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
        setMessages(prev => [...prev, { type: "ai", content: "I couldn't hear anything. Please check your microphone." }]);
        return;
    }
    
    setIsLoading(true);
    setMessages(prev => [...prev, { type: "user", content: "🎤 (Processing Speech...)" }]);
    
    // --- IMPROVED QUESTION CAPTURE ---
    const rawQuestion = messages.slice().reverse().find(m => m.type === "ai")?.content || "Technical Question";
    const currentQuestion = rawQuestion.split(/Next question:|Next question/i).pop()?.trim() || rawQuestion;

    const cleanedHistory = messages.map(msg => ({ type: msg.type, content: msg.content }));
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("duration", ((Date.now() - recordingStart) / 1000).toString());
    formData.append("history", JSON.stringify(cleanedHistory));

    try {
      // Changed from fetch to api.post
      const response = await api.post("/interview/submit", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = response.data;
      
      let finalMetrics: VoiceMetrics | undefined;
      if (data.metrics) {
          finalMetrics = {
              wpm: data.metrics.wpm,
              fillers: data.metrics.fillers,
              pauseDuration: data.metrics.pauseDuration || 0,
              tone: data.metrics.tone,
              clarityScore: data.metrics.clarityScore,
              feedback: data.metrics.feedback
          };
      }

      const score = extractScore(data.feedback);
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { type: "user", content: "🎤 " + data.transcript };
        return [...newMsgs, { type: "ai", content: data.feedback, score, metrics: finalMetrics }];
      });

      if (score > 0) {
        setSessionHistory(prev => [...prev, { q: currentQuestion, s: score }]); 
        setQuestionCount(prev => prev + 1);
      }
      
      setSuggestions(["Next Question", "Give me a Hint", "Change Topic"]);
      startInactivityTimer();
    } catch (error) {
      setMessages(prev => [...prev, { type: "ai", content: "Voice processing failed. Please retry." }]);
    } finally { setIsLoading(false); }
  };

  const formatAIResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
      const match = line.match(/^([A-Za-z\s]+:)(.*)/);
      if (match) return <p key={index} className="mb-2"><strong className="text-primary font-bold">{match[1]}</strong>{match[2]}</p>;
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  // --- REPORT CARD UI ---
  const ReportCard = () => {
    const avgScore = sessionHistory.length > 0 ? (sessionHistory.reduce((acc, curr) => acc + curr.s, 0) / sessionHistory.length).toFixed(1) : 0;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-card border border-primary/20 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                    <div><h2 className="font-serif text-3xl text-gradient-gold mb-2 uppercase">Session Report</h2><p className="text-muted-foreground text-sm">Reviewing your performance in {selectedTopic}.</p></div>
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center"><span className="block text-[10px] uppercase font-bold text-primary tracking-widest">Avg Rating</span><span className="text-3xl font-serif text-primary">{avgScore}/10</span></div>
                </div>
                <div className="space-y-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {sessionHistory.map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5"><div className="flex justify-between mb-2"><span className="text-[10px] font-bold text-primary uppercase">Case {i+1}</span><span className="text-xs font-bold text-primary">{item.s}/10</span></div><p className="text-xs text-foreground/70 truncate mb-3">{item.q}</p><div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${item.s * 10}%` }} /></div></div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4"><button onClick={() => window.location.reload()} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10">Reset</button><button onClick={() => navigate("/")} className="p-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest">Exit</button></div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
      {showReport && <ReportCard />}
      <header className="border-b border-border p-4 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => setShowReport(true)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"><ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">EXIT</span></button>
          <div className="flex items-center gap-6">
              {streak > 0 && <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 transition-all duration-500" style={{ boxShadow: `0 0 ${Math.min(streak * 8, 30)}px rgba(212, 175, 55, 0.4)` }}><Flame size={14} className={streak >= 3 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-primary"} /><span className="text-[10px] font-bold text-primary uppercase">{streak} Streak</span></div>}
              {sessionStarted && <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full"><span className="text-[10px] text-primary font-bold uppercase">{difficulty}</span><div className="w-1 h-1 rounded-full bg-primary animate-pulse" /><span className="text-[10px] text-primary/70 font-mono">Q: {questionCount}/{MAX_QUESTIONS}</span></div>}
              <span className="font-serif text-lg tracking-[0.2em] uppercase text-gradient-gold">MockMate</span>
          </div>
          <div className="w-8" /> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.type === "ai" && <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Bot size={16} className="text-primary" /></div>}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.type === "user" ? "bg-primary text-primary-foreground font-medium shadow-lg" : "bg-card border border-border text-foreground shadow-sm"}`}>
                {msg.type === "ai" ? formatAIResponse(msg.content) : msg.content}
              </div>
            </div>
            {msg.metrics && <div className="w-full max-w-[85%] ml-11 animate-in slide-in-from-left-2"><VoiceMetricsCard metrics={msg.metrics} /></div>}
          </div>
        ))}
        {isLoading && <div className="text-primary/50 text-[10px] font-mono ml-12 animate-pulse tracking-widest uppercase">Analyzing Intelligence...</div>}
      </main>

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
            {!isLoading && !isRecording && input.length === 0 && (
                <div className="flex gap-2 mb-4 animate-in slide-in-from-bottom-2 overflow-x-auto no-scrollbar pb-1">
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} onClick={() => suggestion === "Generate Final Report" ? setShowReport(true) : handleSend(suggestion)} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center gap-2">
                            {suggestion.includes("Report") ? <Award size={12} /> : <Lightbulb size={12} />} {suggestion}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex gap-3 relative">
                <button onClick={isRecording ? stopRecording : startRecording} className={`p-4 rounded-2xl transition-all shadow-lg ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-card text-foreground border border-border hover:border-primary/50"}`}>
                    {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                </button>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={isLoading || isRecording} placeholder={isRecording ? "Listening..." : "Type your response..."} className="flex-1 bg-card border border-border rounded-2xl px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all shadow-sm" />
                <button onClick={() => handleSend()} disabled={isLoading || isRecording || !input.trim()} className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-20 shadow-lg shadow-primary/20">
                    <Send size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;