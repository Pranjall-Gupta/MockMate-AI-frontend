import { useState, useRef } from "react";
import { Send, Bot, ArrowLeft, Mic, Square } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  type: "user" | "ai";
  content: string;
}

const Interview = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  // --- VOICE RECORDING START ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleVoiceUpload(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  // --- VOICE RECORDING STOP ---
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- SEND AUDIO TO BACKEND ---
  const handleVoiceUpload = async (audioBlob: Blob) => {
    setIsLoading(true);
    // Add a temporary "Uploading audio..." message
    setMessages(prev => [...prev, { type: "user", content: "🎤 (Audio sent...)" }]);

    const formData = new FormData();
    // Rename file to 'recording.webm' so Java recognizes it
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("question", messages[messages.length - 1].content); // Context for AI

    try {
      // NOTE: We use the /submit endpoint for Audio
      const response = await fetch("http://localhost:8081/api/interview/submit", {
        method: "POST",
        body: formData, // No JSON headers for file upload!
      });

      const data = await response.json();
      
      // Update the last user message with the actual Transcribed Text
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { type: "user", content: "🎤 " + data.transcript };
        return [...newMsgs, { type: "ai", content: data.feedback }];
      });

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
            <div key={index} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "ai" && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Bot size={16} /></div>}
                <div className={`p-4 rounded-xl max-w-[80%] text-sm leading-relaxed ${
                    msg.type === "user" ? "bg-white text-black" : "bg-[#1a1a1a] border border-white/10 text-gray-200"
                }`}>
                    {msg.content}
                </div>
            </div>
        ))}
        {isLoading && <div className="text-gray-500 text-sm ml-12">Thinking...</div>}
      </main>

      <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto flex gap-3">
            {/* RECORD BUTTON */}
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