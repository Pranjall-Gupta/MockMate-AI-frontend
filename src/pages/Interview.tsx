import { useState, useEffect, useRef } from "react";
import { Send, Bot, ArrowLeft, Mic, Square, Volume2, VolumeX, RotateCw, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import VoiceMetricsCard, { VoiceMetrics } from "@/components/VoiceMetricsCard";

interface Message {
  type: "user" | "ai";
  content: string;
  metrics?: VoiceMetrics;
}

const Interview = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStart, setRecordingStart] = useState<number>(0);
  const [isTTSMapping, setIsTTSMapping] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>(["Java", "DSA", "System Design"]);

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { type: "ai", content: "Hello! I am MockMate. Choose a topic to begin your technical assessment." }
  ]);

  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0; 
      audioPlayerRef.current.src = "";       
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
      stopMicrophoneHardware();
    };
  }, []);

  const stopMicrophoneHardware = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim()) return;

    stopAllAudio();
    const userMessage: Message = { type: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Update suggestions based on state
    if (["java", "dsa", "system design"].includes(textToSend.toLowerCase())) {
        setSuggestions(["Next Question", "Change Topic", "Give me a Hint"]);
    } else if (textToSend.toLowerCase() === "change topic") {
        setSuggestions(["Java", "DSA", "System Design"]);
    }

    try {
      const response = await fetch("http://localhost:8081/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // SENDING THE FULL HISTORY FOR MEMORY
        body: JSON.stringify(updatedMessages),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { type: "ai", content: data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: "ai", content: "Error connecting to MockMate." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    stopAllAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new RecordRTC(stream, {
        type: 'audio', mimeType: 'audio/wav', recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1, desiredSampRate: 16000,
      });
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
        stopMicrophoneHardware();
        handleVoiceUpload(audioBlob);
      });
    }
  };

  const handleVoiceUpload = async (audioBlob: Blob) => {
    const durationSeconds = (Date.now() - recordingStart) / 1000;
    setIsLoading(true);
    setMessages(prev => [...prev, { type: "user", content: "🎤 (Processing...)" }]);
    
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("question", messages[messages.length - 1].content);
    formData.append("duration", durationSeconds.toString());

    try {
      const response = await fetch("http://localhost:8081/api/interview/submit", { method: "POST", body: formData });
      const data = await response.json();
      
      let finalMetrics: VoiceMetrics | undefined;
      if (data.metrics) {
        const aiData = JSON.parse(data.metrics.aiJson);
        finalMetrics = {
          wpm: data.metrics.wpm, fillers: data.metrics.fillers, pauseDuration: data.metrics.pauseDuration,
          tone: aiData.tone, clarityScore: aiData.clarityScore, feedback: aiData.feedback
        };
      }

      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { type: "user", content: "🎤 " + data.transcript };
        return [...newMsgs, { type: "ai", content: data.feedback, metrics: finalMetrics }];
      });

      if (data.audio && isTTSMapping) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = `data:audio/mp3;base64,${data.audio}`;
          audioPlayerRef.current.play();
        }
      }
    } catch (error) { setMessages(prev => [...prev, { type: "ai", content: "Voice processing error." }]); }
    finally { setIsLoading(false); }
  };

  const formatAIResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
      const match = line.match(/^([A-Za-z\s]+:)(.*)/);
      if (match) {
        return <p key={index} className="mb-2"><strong className="text-primary font-bold">{match[1]}</strong>{match[2]}</p>;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <audio ref={audioPlayerRef} hidden />
      <header className="border-b border-border p-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">EXIT</span>
          </Link>
          <span className="font-serif text-lg tracking-[0.2em] uppercase text-gradient-gold">MockMate</span>
          
          <button onClick={() => { stopAllAudio(); setIsTTSMapping(!isTTSMapping); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isTTSMapping ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {isTTSMapping ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="text-[10px] font-bold uppercase">{isTTSMapping ? "Audio On" : "Muted"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.type === "ai" && <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Bot size={16} className="text-primary" /></div>}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.type === "user" ? "bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/10" : "bg-card border border-border text-foreground"
              }`}>
                {msg.type === "ai" ? formatAIResponse(msg.content) : msg.content}
              </div>
            </div>
            {msg.metrics && <div className="w-full max-w-[85%] ml-11"><VoiceMetricsCard metrics={msg.metrics} /></div>}
          </div>
        ))}
        {isLoading && <div className="text-primary/50 text-[10px] font-mono ml-12 animate-pulse uppercase tracking-widest">Analyzing Intel...</div>}
      </main>

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
            {!isLoading && !isRecording && input.length === 0 && (
                <div className="flex gap-2 mb-4 animate-in slide-in-from-bottom-2 overflow-x-auto no-scrollbar pb-1">
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} onClick={() => handleSend(suggestion)}
                            className="whitespace-nowrap px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-all flex items-center gap-2"
                        >
                            <Lightbulb size={12} /> {suggestion}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex gap-3 relative">
                <button onClick={isRecording ? stopRecording : startRecording}
                    className={`p-4 rounded-2xl transition-all ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-card text-foreground border border-border hover:border-primary/50"
                    }`}
                >
                    {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                </button>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading || isRecording}
                    placeholder={isRecording ? "Listening..." : "Type or choose a suggestion..."}
                    className="flex-1 bg-card border border-border rounded-2xl px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
                <button onClick={() => handleSend()} disabled={isLoading || isRecording || !input.trim()}
                    className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-20"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;