import { useState, useEffect, useRef } from "react";
import { Send, Bot, ArrowLeft, Mic, Square, Lightbulb, Award, Flame, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoiceMetricsCard, { VoiceMetrics } from "@/components/VoiceMetricsCard";
import api from "@/lib/api";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

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
  const [liveTranscript, setLiveTranscript] = useState(""); 
  const streamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Session State ---
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<{q: string, s: number}[]>([]);
  const [streak, setStreak] = useState(0);
  const transcriptRef = useRef("");
  const MAX_QUESTIONS = 5; 
  const [suggestions, setSuggestions] = useState<string[]>(["Java", "DSA", "System Design"]);
  const [messages, setMessages] = useState<Message[]>([
    { type: "ai", content: "Welcome to the Assessment Center. To begin, please choose a core topic." }
  ]);
  const azureTokenCustom = useRef<{token: string, region: string} | null>(null);

  const totalSilenceRef = useRef<number>(0);
  const lastActiveTimeRef = useRef<number>(0);
  const clarityScoresRef = useRef<number[]>([]);

  // --- Voice Feedback State & Helpers ---
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem("mockmate-voice-enabled") === "true");
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const cleanTextForSpeech = (text: string): string => {
    // 1. Strip "Score: X/10" at the very top
    let cleaned = text.replace(/Score:\s*\d+\/10/gi, "").trim();
    // 2. Strip section markers to make the voice flow naturally
    cleaned = cleaned.replace(/\b(Logic|Next question|Feedback|Ideal Answer):\s*/gi, "");
    // 3. Remove markdown markers
    cleaned = cleaned.replace(/[*#_`~]/g, "");
    // 4. Convert newlines to sentence pauses
    cleaned = cleaned.replace(/\n+/g, ". ");
    return cleaned.trim();
  };

  const playSpeech = async (text: string, force = false) => {
    if (!voiceEnabled && !force) return;
    try {
      // Interrupt any current audio playback to avoid voice overlap
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      const response = await api.get(`/interview/speak`, {
        params: { text: cleaned },
        responseType: 'blob'
      });

      const blobUrl = URL.createObjectURL(response.data);
      const audio = new Audio(blobUrl);
      activeAudioRef.current = audio;
      audio.play().catch(e => console.warn("Autoplay blocked or playback interrupted:", e));
    } catch (error) {
      console.error("Failed to play speech:", error);
    }
  };

  const handleOpenReport = async () => {
    setShowReport(true);
    // Only save if there is actual history (at least 1 question graded) and not already saved
    if (sessionHistory.length > 0 && !sessionSaved) {
      try {
        const avgScore = sessionHistory.reduce((acc, curr) => acc + curr.s, 0) / sessionHistory.length;
        await api.post("/interview/session/save", {
          topic: selectedTopic || "General",
          difficulty: difficulty || "Medium",
          averageScore: parseFloat(avgScore.toFixed(2)),
          messages: messages.map(m => ({ type: m.type, content: m.content }))
        });
        setSessionSaved(true);
      } catch (error) {
        console.error("Failed to persist session to MongoDB Atlas:", error);
      }
    }
  };


  useEffect(() => {
      // Pre-fetch token so it's ready when they hit the Mic
      api.get("/interview/token").then(res => {
          azureTokenCustom.current = res.data;
      });
  }, []);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
    };
  }, []);

  const extractScore = (text: string): number => {
    const match = text.match(/Score:\s*(\d+)\/10/i);
    return match ? parseInt(match[1]) : 0;
  };

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim()) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    if (!selectedTopic && ["java", "dsa", "system design"].includes(textToSend.toLowerCase())) {
        setSelectedTopic(textToSend);
        
        // Create Specialized suggestions
        let dynamicSubs = ["Easy Mode", "Hard Mode", "Adaptive Mode"];
        if (textToSend.toLowerCase() === "java") dynamicSubs.unshift("JVM & Memory", "Concurrency");
        if (textToSend.toLowerCase() === "dsa") dynamicSubs.unshift("Complexity Analysis", "Data Structure Selection");
        if (textToSend.toLowerCase() === "system design") dynamicSubs.unshift("High Availability", "Scalability Patterns");

        setSuggestions(dynamicSubs);
        setMessages(prev => [
            ...prev, 
            { type: "user", content: textToSend }, 
            { type: "ai", content: `Excellent. Select your difficulty for ${textToSend}, or pick a specific focus area to start deep.` }
        ]);
        setInput("");
        return; 
    }
    const isStartingSelection = suggestions.includes(textToSend) || textToSend.toLowerCase().includes("mode");

    if(selectedTopic && !sessionStarted && isStartingSelection) {
      setDifficulty(textToSend);
      setSessionStarted(true);
    }

    const rawQuestion = messages.slice().reverse().find(m => m.type === "ai")?.content || "Technical Question";
    const currentQuestion = rawQuestion.split(/Next question:|Next question/i).pop()?.trim() || rawQuestion;

    const userMessage: Message = { type: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/interview/chat", updatedMessages);
      const score = extractScore(response.data.content);

      processTurn(response.data.content, score, currentQuestion);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setMessages(prev => [...prev, { type: "ai", content: "Connection error. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const processTurn = (aiContent: string, score: number, currentQuestion: string, metrics?: VoiceMetrics) => {
    if (score >= 7) setStreak(prev => prev + 1);
    else if (score > 0) setStreak(0);
    let nextCount = questionCount;
    if (score > 0) {
        setSessionHistory(prev => [...prev, { q: currentQuestion, s: score }]);
        setQuestionCount(prev =>{
            nextCount = prev + 1; 
            return nextCount;
        });
    }
    setMessages(prev => [...prev, { type: "ai", content: aiContent, score, metrics }]);
    setSuggestions(nextCount >= MAX_QUESTIONS - 1 ? ["Generate Final Report", "Change Topic"] : ["Next Question", "Give me a Hint", "Change Topic"]);
    
    // Play the AI's question/response out loud
    playSpeech(aiContent);
  };

const startRecording = async () => {
  try {
    // Interrupt any currently playing AI audio so it doesn't feed back into the mic
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream; 
    
    const token = azureTokenCustom.current?.token;
    const region = azureTokenCustom.current?.region;
    
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token!, region!);
    speechConfig.speechRecognitionLanguage = "en-US";
    
    // --- CRITICAL: UNLOCK DETAILED METRICS ---
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;
    // This helps prevent Azure from automatically cleaning up "ums" and "uhs"
    speechConfig.setServiceProperty("speechServiceResponse_PostProcessingOption", "TrueText", 1000 as any);

    const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(stream);
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    // Reset trackers
    totalSilenceRef.current = 0;
    lastActiveTimeRef.current = Date.now();
    clarityScoresRef.current = [];
    let finalizedText = ""; 

    recognizer.recognizing = (s, e) => {
      // Track Silence: If the gap since last activity > 1s, start counting it
      const now = Date.now();
      const gap = (now - lastActiveTimeRef.current) / 1000;
      if (gap > 1.2) {
        totalSilenceRef.current += gap;
      }
      lastActiveTimeRef.current = now;

      const current = (finalizedText + " " + e.result.text).trim();
      setLiveTranscript(current);
      transcriptRef.current = current;
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        // --- CAPTURE CLARITY (Confidence Score) ---
        const json = JSON.parse(e.result.json);
        if (json.NBest && json.NBest[0]) {
           // Azure confidence is 0.0 to 1.0, we store it for averaging
           clarityScoresRef.current.push(json.NBest[0].Confidence * 100);
        }

        finalizedText += " " + e.result.text;
        transcriptRef.current = finalizedText.trim();
        setLiveTranscript(finalizedText.trim());
      }
    };

    recognizer.startContinuousRecognitionAsync(() => {
      setIsRecording(true);
      setRecordingStart(Date.now());
    });
  } catch (err) { console.error(err); }
};

const stopRecording = () => {
  if (recognizerRef.current) {
    const finalGap = (Date.now() - lastActiveTimeRef.current) / 1000;
    if (finalGap > 1.2) {
      totalSilenceRef.current += finalGap;
    }
    const finalSpeech = transcriptRef.current.trim();
    console.log("Captured at stop:", finalSpeech);

    recognizerRef.current.stopContinuousRecognitionAsync(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setIsRecording(false);
      setLiveTranscript("");
      handleSpeechSubmission(finalSpeech); // Submit the captured text

      recognizerRef.current?.close();
      recognizerRef.current = null;
    });
  }
};

  const handleSpeechSubmission = async (transcript: string) => {
    if (!transcript.trim()) {
        console.warn("Empty transcript. Ignoring.");
        return;
    }
    setIsLoading(true);
    const rawQuestion = messages.slice().reverse().find(m => m.type === "ai")?.content || "Technical Question";
    const currentQuestion = rawQuestion.split(/Next question:|Next question/i).pop()?.trim() || rawQuestion;
    const duration = (Date.now() - recordingStart) / 1000;
    const roundedSilence = parseFloat(totalSilenceRef.current.toFixed(3));
    const avgClarity = clarityScoresRef.current.length > 0 
      ? clarityScoresRef.current.reduce((a, b) => a + b) / clarityScoresRef.current.length 
      : 0;
    setMessages(prev => [...prev, { type: "user", content: "🎤 " + transcript }]);

    try {
        console.log("Submitting to /submit-hybrid...");
        const response = await api.post("/interview/submit-hybrid", {
            transcript,
            duration,
            pauseDuration: roundedSilence,
            clarityScore: Math.round(avgClarity), 
            history: messages.map(m => ({ type: m.type, content: m.content }))
        });

        const { feedback, metrics } = response.data;
        const score = extractScore(feedback);
        
        processTurn(feedback, score,currentQuestion, metrics);
    } catch (error) {
        console.error("Submission to backend failed:", error);
    } finally { setIsLoading(false); }
  };

  const formatAIResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
      const match = line.match(/^([A-Za-z\s]+:)(.*)/);
      if (match) return <p key={index} className="mb-2"><strong className="text-primary font-bold">{match[1]}</strong>{match[2]}</p>;
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  // --- REPORT CARD UI (Now being used) ---
  const ReportCard = () => {
    const avgScore = sessionHistory.length > 0 ? (sessionHistory.reduce((acc, curr) => acc + curr.s, 0) / sessionHistory.length).toFixed(1) : 0;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-card border border-primary/20 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                    <div><h2 className="font-serif text-3xl text-gradient-gold mb-2 uppercase">Session Report</h2><p className="text-muted-foreground text-sm">Reviewing performance in {selectedTopic}.</p></div>
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center"><span className="block text-[10px] uppercase font-bold text-primary tracking-widest">Avg Rating</span><span className="text-3xl font-serif text-primary">{avgScore}/10</span></div>
                </div>
                <div className="space-y-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {sessionHistory.map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5"><div className="flex justify-between mb-2"><span className="text-[10px] font-bold text-primary uppercase">Case {i+1}</span><span className="text-xs font-bold text-primary">{item.s}/10</span></div><p className="text-xs text-foreground/70 truncate mb-3">{item.q}</p><div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${item.s * 10}%` }} /></div></div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => window.location.reload()} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">Reset</button>
                    <button onClick={() => navigate("/")} className="p-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest">Exit</button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
      {showReport && <ReportCard />}
      
      <header className="border-b border-border p-4 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={handleOpenReport} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">EXIT</span>
          </button>
          <div className="flex items-center gap-6">
              {streak > 0 && <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5"><Flame size={14} className="text-primary" /><span className="text-[10px] font-bold text-primary uppercase">{streak} Streak</span></div>}
              {sessionStarted && <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full"><span className="text-[10px] text-primary font-bold uppercase">{difficulty}</span> <span className="text-[10px] text-primary/70 font-mono">Q: {questionCount}/{MAX_QUESTIONS}</span></div>}
              <span className="font-serif text-lg tracking-[0.2em] uppercase text-gradient-gold">MockMate</span>
          </div>
          <button 
            onClick={() => {
              const nextVal = !voiceEnabled;
              if (voiceEnabled) {
                if (activeAudioRef.current) {
                  activeAudioRef.current.pause();
                  activeAudioRef.current = null;
                }
              }
              setVoiceEnabled(nextVal);
              localStorage.setItem("mockmate-voice-enabled", String(nextVal));
            }} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10"
            title={voiceEnabled ? "Mute Voice Feedback" : "Unmute Voice Feedback"}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"} group/bubble`}>
              {msg.type === "ai" && <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Bot size={16} className="text-primary" /></div>}
              <div className="relative flex items-center gap-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.type === "user" ? "bg-primary text-primary-foreground font-medium shadow-lg" : "bg-card border border-border text-foreground shadow-sm"}`}>
                  {msg.type === "ai" ? formatAIResponse(msg.content) : msg.content}
                </div>
                {msg.type === "ai" && (
                  <button 
                    onClick={() => playSpeech(msg.content, true)}
                    className="p-2 opacity-0 group-hover/bubble:opacity-100 hover:text-primary hover:bg-white/5 transition-all duration-300 text-muted-foreground self-center shrink-0 rounded-full"
                    title="Read Out Loud"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {msg.metrics && <div className="w-full max-w-[85%] ml-11"><VoiceMetricsCard metrics={msg.metrics} /></div>}
          </div>
        ))}
        
        {isRecording && (
            <div className="flex justify-end animate-in fade-in slide-in-from-right-2">
                <div className="bg-primary/20 border border-primary/30 p-4 rounded-2xl text-sm italic text-foreground/80 max-w-[85%]">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        {liveTranscript.length > 0 ? liveTranscript : "Listening..."}
                    </span>
                </div>
            </div>
        )}
        {isLoading && <div className="text-primary/50 text-[10px] font-mono ml-12 animate-pulse uppercase tracking-widest">Processing Intelligence...</div>}
      </main>

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
            {!isLoading && !isRecording && input.length === 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} onClick={() => suggestion === "Generate Final Report" ? handleOpenReport() : handleSend(suggestion)} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center gap-2">
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