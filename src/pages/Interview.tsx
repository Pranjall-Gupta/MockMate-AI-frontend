import { useState, useRef } from "react";
import { Send, Bot, ArrowLeft, Mic, Square } from "lucide-react";
import { Link } from "react-router-dom";
import RecordRTC, { StereoAudioRecorder } from "recordrtc"; // <--- IMPORT THIS
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
  
  // Ref for the Recorder instance
  const recorderRef = useRef<RecordRTC | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { type: "ai", content: "Hello! I am MockMate. Choose a topic: Java, DSA, or System Design." }
  ]);

  // --- TEXT SEND ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { type: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput(""); 
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }), 
      });
      const data = await response.json(); 
      setMessages(prev => [...prev, { type: "ai", content: data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: "ai", content: "Error: Could not connect to Backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- VOICE RECORDING START (Using RecordRTC for WAV) ---
  const startRecording = async () => {
    try {
      setRecordingStart(Date.now());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configure RecordRTC to create a standard WAV file
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1, // Mono is better for speech recognition
        desiredSampRate: 16000,   // Azure prefers 16kHz
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  // --- VOICE RECORDING STOP ---
  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      setIsRecording(false);
      
      recorderRef.current.stopRecording(() => {
        const audioBlob = recorderRef.current!.getBlob();
        
        // Optional: Debug - Play it locally to ensure mic worked
        // const audio = new Audio(URL.createObjectURL(audioBlob));
        // audio.play();

        handleVoiceUpload(audioBlob);
      });
    }
  };

  // --- SEND AUDIO TO BACKEND ---
  const handleVoiceUpload = async (audioBlob: Blob) => {
    const durationSeconds = (Date.now() - recordingStart) / 1000;

    setIsLoading(true);
    setMessages(prev => [...prev, { type: "user", content: "🎤 (Processing Speech...)" }]);

    const formData = new FormData();
    // Use .wav extension now!
    formData.append("audio", audioBlob, "recording.wav"); 
    
    const lastAiMessage = messages.slice().reverse().find(m => m.type === "ai")?.content || "Introduce yourself";
    formData.append("question", lastAiMessage);
    formData.append("duration", durationSeconds.toString());
    
    try {
      const response = await fetch("http://localhost:8081/api/interview/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      // Parse Metrics
      let finalMetrics: VoiceMetrics | undefined = undefined;
      if (data.metrics) {
         try {
            const aiData = JSON.parse(data.metrics.aiJson);
            finalMetrics = {
                wpm: data.metrics.wpm,
                fillers: data.metrics.fillers,
                pauseDuration: data.metrics.pauseDuration,
                tone: aiData.tone || "Neutral",
                clarityScore: aiData.clarityScore || 0,
                feedback: aiData.feedback || "No feedback generated."
            };
         } catch (e) {
            console.error("Error parsing AI JSON:", e);
         }
      }

      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { type: "user", content: "🎤 " + data.transcript };
        
        return [...newMsgs, { 
            type: "ai", 
            content: data.feedback,
            metrics: finalMetrics
        }];
      });

      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { type: "ai", content: "Error processing audio." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans flex flex-col">
      <header className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft size={16} /> <span className="text-sm font-medium">EXIT</span>
            </Link>
            <span className="font-serif text-lg tracking-wide">MOCKMATE</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-4 overflow-y-auto">
        {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.type === "ai" && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Bot size={16} /></div>}
                    <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                        msg.type === "user" ? "bg-white text-black" : "bg-[#1a1a1a] border border-white/10 text-gray-200"
                    }`}>
                        {msg.content}
                    </div>
                </div>
                {msg.metrics && (
                    <div className="w-full max-w-[85%] ml-11"> 
                        <VoiceMetricsCard metrics={msg.metrics} />
                    </div>
                )}
            </div>
        ))}
        {isLoading && <div className="text-gray-500 text-sm ml-12">Thinking...</div>}
      </main>

      <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto flex gap-3">
            <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-all ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#1a1a1a] text-white border border-white/10 hover:bg-white/10"
                }`}
            >
                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
            </button>

            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading || isRecording}
                placeholder={isRecording ? "Listening..." : "Type or record your answer..."}
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-white/30"
            />
            <button 
                onClick={handleSend} 
                disabled={isLoading || isRecording}
                className="bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;