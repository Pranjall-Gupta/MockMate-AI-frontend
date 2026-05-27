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

  // --- AI Reactive Avatar State & Audio Wave ---
  const [avatarState, setAvatarState] = useState<"IDLE" | "LISTENING" | "THINKING" | "SPEAKING">("IDLE");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setAvatarState("THINKING");
    } else if (isRecording) {
      setAvatarState("LISTENING");
    } else if (isSpeaking) {
      setAvatarState("SPEAKING");
    } else {
      setAvatarState("IDLE");
    }
  }, [isLoading, isRecording, isSpeaking]);

  const drawWave = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      animationFrameIdRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FACC15";
      ctx.beginPath();
      
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

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
        setIsSpeaking(false);
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
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onpause = () => setIsSpeaking(false);
      audio.play().catch(e => {
        console.warn("Autoplay blocked or playback interrupted:", e);
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error("Failed to play speech:", error);
      setIsSpeaking(false);
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
      const tone = localStorage.getItem("mockmate-ai-tone") || "Socratic Inquirer";
      const difficultySetting = localStorage.getItem("mockmate-ai-difficulty") || "L5: Senior Engineer";
      
      const response = await api.post("/interview/chat", updatedMessages, {
        headers: {
          "X-MockMate-Tone": tone,
          "X-MockMate-Difficulty": difficultySetting
        }
      });
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

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setTimeout(() => {
        drawWave();
      }, 100);
    } catch (audioErr) {
      console.warn("Failed to initialize AudioContext for visualizer:", audioErr);
    } 
    
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
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;

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
        const tone = localStorage.getItem("mockmate-ai-tone") || "Socratic Inquirer";
        const difficultySetting = localStorage.getItem("mockmate-ai-difficulty") || "L5: Senior Engineer";

        const response = await api.post("/interview/submit-hybrid", {
            transcript,
            duration,
            pauseDuration: roundedSilence,
            clarityScore: Math.round(avgClarity), 
            history: messages.map(m => ({ type: m.type, content: m.content }))
        }, {
            headers: {
                "X-MockMate-Tone": tone,
                "X-MockMate-Difficulty": difficultySetting
            }
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
      
      {/* 0. LOCAL CYBERNETIC ANIMATIONS SHEET */}
      <style>{`
        @keyframes equalizer1 {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.8); }
        }
        @keyframes equalizer2 {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.4); }
        }
        @keyframes equalizer3 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(2.2); }
        }
        .animate-equalizer-1 {
          animation: equalizer1 0.6s ease-in-out infinite;
          transform-origin: 50% 50px;
        }
        .animate-equalizer-2 {
          animation: equalizer2 0.5s ease-in-out infinite;
          transform-origin: 50% 50px;
        }
        .animate-equalizer-3 {
          animation: equalizer3 0.7s ease-in-out infinite;
          transform-origin: 50% 50px;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .animate-reverse-spin {
          animation: spin 15s linear infinite reverse;
        }
      `}</style>
      
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

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col h-full overflow-hidden">
        {/* Integrated Floating Cybernetic Hologram Core (Centered at the top of the chat panel) */}
        <div className="flex flex-col items-center justify-center mb-6 pb-4 border-b border-white/5 shrink-0 bg-[#0c0c0c]/40 backdrop-blur-md py-3 px-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 w-full justify-between">
            {/* Status Info */}
            <div className="flex items-center gap-3">
              {/* Spinning outer ring and reactive inner core */}
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <div className={`absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin-slow ${avatarState === "THINKING" ? "border-primary/60 scale-105" : ""}`} style={{ animationDuration: "12s" }} />
                <div className={`absolute inset-1 rounded-full border border-primary/10 animate-reverse-spin ${avatarState === "SPEAKING" ? "scale-95 border-yellow-500/30" : ""}`} style={{ animationDuration: "8s" }} />
                <div className="absolute inset-2 rounded-full bg-black/40 border border-white/5 flex items-center justify-center shadow-inner">
                  <svg className="w-full h-full p-1" viewBox="0 0 100 100">
                    {avatarState === "IDLE" && (
                      <circle cx="50" cy="50" r="16" className="fill-primary/20 stroke-primary stroke-[2] animate-pulse" />
                    )}
                    {avatarState === "LISTENING" && (
                      <>
                        <circle cx="50" cy="50" r="10" className="fill-none stroke-red-500 stroke-[1.5] animate-ping" />
                        <circle cx="50" cy="50" r="20" className="fill-none stroke-red-500/50 stroke-[1] animate-pulse" />
                      </>
                    )}
                    {avatarState === "THINKING" && (
                      <path d="M 30,50 A 20,20 0 1,1 70,50" className="fill-none stroke-yellow-500 stroke-[3] stroke-linecap-round animate-spin" />
                    )}
                    {avatarState === "SPEAKING" && (
                      <g className="stroke-yellow-500 stroke-[3] stroke-linecap-round">
                        <line x1="30" y1="50" x2="30" y2="40" className="animate-equalizer-1" />
                        <line x1="40" y1="50" x2="40" y2="35" className="animate-equalizer-2" />
                        <line x1="50" y1="50" x2="50" y2="25" className="animate-equalizer-3" />
                        <line x1="60" y1="50" x2="60" y2="35" className="animate-equalizer-2" />
                        <line x1="70" y1="50" x2="70" y2="40" className="animate-equalizer-1" />
                      </g>
                    )}
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-primary/70 font-bold uppercase tracking-[0.25em] font-mono">
                  AI Logic Core Status
                </span>
                <span className={`text-xs font-serif font-bold uppercase tracking-widest ${avatarState === "SPEAKING" ? "text-yellow-500 animate-pulse" : avatarState === "LISTENING" ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {avatarState === "IDLE" && "Core Idle: Ready"}
                  {avatarState === "LISTENING" && "Capture: Listening"}
                  {avatarState === "THINKING" && "Logic: Processing"}
                  {avatarState === "SPEAKING" && "Voice: Transmitting"}
                </span>
              </div>
            </div>

            {/* Micro details */}
            <p className="hidden md:block text-[10px] text-muted-foreground max-w-[280px] text-right leading-relaxed font-mono">
              {avatarState === "IDLE" && "System is standing by. Speak or choose a suggestion to begin."}
              {avatarState === "LISTENING" && "Receiving voice stream. Speak clearly into your mic device."}
              {avatarState === "THINKING" && "Analyzing technical answers and soft-skill metrics in the cloud."}
              {avatarState === "SPEAKING" && "Synthesizing vocal response models through local audio channels."}
            </p>
          </div>
        </div>

        {/* Chat messages panel */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar gap-6">
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
        </div>
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
                {isRecording ? (
                  <button 
                    onClick={stopRecording} 
                    className="relative w-14 h-14 bg-red-950/20 border border-red-500/50 rounded-2xl overflow-hidden hover:bg-red-900/30 transition-all flex items-center justify-center group cursor-pointer shrink-0"
                    title="Stop Recording"
                  >
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full pointer-events-none" 
                      width={56} 
                      height={56} 
                    />
                    <Square size={14} className="text-red-500 relative z-10 animate-pulse group-hover:scale-110 transition-transform" fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    onClick={startRecording} 
                    className="p-4 rounded-2xl bg-card text-foreground border border-border hover:border-primary/50 hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0"
                    title="Start Recording"
                  >
                    <Mic size={20} />
                  </button>
                )}
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