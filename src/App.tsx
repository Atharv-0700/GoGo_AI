import { useState, useEffect } from "react";
import { Message, VoiceSettings, LanguageOption, SUPPORTED_LANGUAGES } from "./types";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";
import { GogoCore } from "./components/GogoCore";
import { SettingsPanel } from "./components/SettingsPanel";
import { CreatorPanel } from "./components/CreatorPanel";
import { ConversationLog } from "./components/ConversationLog";
import { QuickCommands } from "./components/QuickCommands";
import { Heart, Send, Mic, MicOff, RefreshCw, Cpu, Volume2, ShieldCheck, MessageSquare, Menu, X } from "lucide-react";

export default function App() {
  // Global settings state
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gogo_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fallback to default
        }
      }
    }
    return {
      ttsProvider: "browser",
      browserVoiceURI: "",
      browserRate: 1.0,
      browserPitch: 1.0,
      elevenLabsKey: "",
      elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL", // Bella
      continuousListening: false,
      wakeWordEnabled: false,
      volume: 1.0,
    };
  });

  // Save settings on changes
  useEffect(() => {
    localStorage.setItem("gogo_settings", JSON.stringify(settings));
  }, [settings]);

  // Current selected locale language state
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);

  // Message history log
  const [messages, setMessages] = useState<Message[]>([]);

  // Text input box state (for manual typing backup)
  const [typedInput, setTypedInput] = useState("");

  // Mobile drawer panel open/close state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Server API/Key validation status
  const [serverStatus, setServerStatus] = useState<"connecting" | "healthy" | "error">("connecting");
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Initialize GOGO on mount and check health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setServerStatus("healthy");
        } else {
          setServerStatus("error");
          setApiErrorMsg("Backend responded with an error.");
        }
      } catch (e) {
        setServerStatus("error");
        setApiErrorMsg("Unable to connect to the GOGO backend server.");
      }
    };
    checkHealth();

    // Warm starting greet from GOGO
    const initialGreet: Message = {
      id: "initial-greet",
      role: "assistant",
      text: "Hello! I am GOGO, your personal AI companion created by Atharva Gogawale. I can listen, understand, and converse naturally with you in over 100 languages. Click my core button above to speak, or type below!",
      timestamp: new Date(),
    };
    setMessages([initialGreet]);
  }, []);

  // Update central voice settings
  const handleUpdateSettings = (updated: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  // Submit actual user question to GOGO and handle response
  const submitToGogo = async (text: string) => {
    if (!text.trim()) return;

    // 1. Create and add user query bubble
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    
    // Append to messages list
    setMessages((prev) => [...prev, userMsg]);
    setGogoState("thinking");

    try {
      // Get conversation history formatted for backend (last 10 messages for context)
      const formattedHistory = messages
        .slice(-10)
        .map((msg) => ({ role: msg.role, content: msg.text }));

      // Fetch GOGO's text output from server
      const response = await fetch("/api/gogo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: formattedHistory,
          language: currentLanguage.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch response.");
      }

      const data = await response.json();
      const assistantResponseText = data.text;

      // 2. Create and add assistant response bubble
      const gogoMsg: Message = {
        id: `gogo-${Date.now()}`,
        role: "assistant",
        text: assistantResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, gogoMsg]);

      // 3. Play voice synthesizer
      await speakText(assistantResponseText);

    } catch (e: any) {
      console.error("GOGO interaction failed:", e);
      const errorMsg: Message = {
        id: `gogo-error-${Date.now()}`,
        role: "assistant",
        text: `I encountered an issue: ${e.message}. Please verify that your Gemini API Key is saved in Settings > Secrets and your internet connection is active.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setGogoState("error");
    }
  };

  // Connect voice hook
  const {
    isSupported,
    permissionGranted,
    gogoState,
    setGogoState,
    transcript,
    error: voiceError,
    isMuted,
    setIsMuted,
    browserVoices,
    speakText,
    cancelSpeaking,
    startListening,
    stopListening,
  } = useVoiceAssistant(settings, currentLanguage, submitToGogo);

  // Trigger manual speech playback on history bubble
  const handleReplayVoice = async (text: string) => {
    await speakText(text);
  };

  // Triggered when clicking center orb
  const handleCoreActivationClick = () => {
    if (gogoState === "speaking") {
      // Tap to interrupt GOGO speaking
      cancelSpeaking();
    } else if (gogoState === "listening") {
      // Tap to pause recording
      stopListening();
    } else if (gogoState === "idle" || gogoState === "error") {
      // Tap to wake up GOGO and start catching microphone
      startListening();
    }
  };

  // Form text box submission
  const handleTextFormSubmit = (e: any) => {
    e.preventDefault();
    if (!typedInput.trim() || gogoState === "thinking") return;
    
    const textToSend = typedInput;
    setTypedInput("");
    
    // Stop any ongoing speech or microphone recording during text submission
    cancelSpeaking();
    stopListening();
    
    submitToGogo(textToSend);
  };

  // Send a quick predefined command
  const handleTriggerQuickAction = (text: string) => {
    cancelSpeaking();
    stopListening();
    submitToGogo(text);
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased relative">
      {/* Immersive UI Atmospheric Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Analog/Film Grain noise overlay from design */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />

      {/* Top Navigation Bar from Design */}
      <nav className="z-30 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-[#08090a]/85 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse shrink-0"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-slate-300">GOGO SYSTEM ACTIVE</span>
              <span className="text-[9px] font-mono font-bold bg-cyan-950/40 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/20">
                v2.5
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Generative Omni Guidance Operator</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs font-mono text-cyan-400/80">GEMINI_FLASH_2.5_PROTOCOL</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Latent Space: Connected</span>
          </div>
          {/* Hamburger button for mobile and tablet */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-2.5 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 flex items-center justify-center w-11 h-11 cursor-pointer transition-all shrink-0"
            title="Open Control Panel"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Responsive Layout Splitter */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Hand Column: Settings & Details (lg:span-4) - Hidden on Mobile/Tablet and only shown as inline sidebar on Desktop */}
        <div className="hidden lg:flex lg:col-span-4 space-y-6 flex-col justify-start">
          {/* Creator Profile */}
          <CreatorPanel />

          {/* Settings Dashboard */}
          <SettingsPanel
            settings={settings}
            onChangeSettings={handleUpdateSettings}
            browserVoices={browserVoices}
            currentLanguage={currentLanguage}
            onChangeLanguage={setCurrentLanguage}
          />
        </div>

        {/* Center/Right Combined: GOGO Core Stage & Log (lg:span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-6 justify-between w-full max-w-full">
          
          {/* Main Visual Core Stage Panel */}
          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[420px] backdrop-blur-xl">
            {/* Top right corner decorative system coordinate label */}
            <div className="absolute top-4 right-5 text-[9px] font-mono text-slate-500 tracking-widest uppercase hidden sm:block">
              Locale: {currentLanguage.code} / Voice: {settings.ttsProvider.toUpperCase()}
            </div>

            {/* Error notifications bar if mic/voice has problems */}
            {(voiceError || apiErrorMsg) && (
              <div className="w-full max-w-md bg-rose-950/20 border border-rose-900/40 text-rose-200 text-xs px-4 py-3 rounded-xl flex items-start gap-2 mb-4">
                <span className="shrink-0 font-bold font-mono">⚠️</span>
                <p className="font-mono leading-relaxed">{voiceError || apiErrorMsg}</p>
              </div>
            )}

            {/* Core Activation Orb */}
            <GogoCore
              state={gogoState}
              transcript={transcript}
              onMicClick={handleCoreActivationClick}
              isMuted={isMuted}
            />

            {/* GOGO status / control bar */}
            <div className="flex items-center space-x-4 mt-6 z-10">
              <button
                id="mic-mute-btn"
                onClick={() => setIsMuted((prev) => !prev)}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                  isMuted
                    ? "bg-rose-950/30 text-rose-400 border-rose-900/50 hover:bg-rose-950/50"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                id="cancel-speaking-btn"
                onClick={cancelSpeaking}
                disabled={gogoState !== "speaking"}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${
                  gogoState === "speaking"
                    ? "bg-amber-950/30 text-amber-400 border-amber-900/50 hover:bg-amber-950/50 cursor-pointer"
                    : "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                }`}
                title="Mute / Stop GOGO's active speech"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                id="reset-chat-btn"
                onClick={() => {
                  cancelSpeaking();
                  stopListening();
                  setMessages([
                    {
                      id: "greet-reset",
                      role: "assistant",
                      text: "Conversation context cleared! Let's start fresh. Speak up or ask me anything.",
                      timestamp: new Date(),
                    },
                  ]);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Reset Conversation History"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick predefined commands container */}
          <QuickCommands onSelectCommand={handleTriggerQuickAction} disabled={gogoState === "thinking"} />

          {/* Scrolling Transcript Log Container */}
          <div className="flex flex-col space-y-3 flex-1 min-w-0">
            <div className="flex items-center space-x-2 pb-1 border-b border-white/5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">
                Interactive Transcript & Logs
              </h4>
            </div>

            <ConversationLog
              messages={messages}
              onSpeakMessage={handleReplayVoice}
              isGogoSpeaking={gogoState === "speaking"}
            />
          </div>

          {/* Keyboard Manual Input Chat Bar (Silent Backup Mode) */}
          <form
            onSubmit={handleTextFormSubmit}
            className="flex items-center space-x-3 bg-white/[0.02] border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-xl backdrop-blur-xl"
          >
            <input
              id="typed-input-field"
              type="text"
              placeholder={
                gogoState === "thinking"
                  ? "GOGO is thinking..."
                  : "Type in Hindi, Marathi, English..."
              }
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              disabled={gogoState === "thinking"}
              className="flex-1 bg-black/40 border border-white/5 text-slate-200 placeholder-slate-500 rounded-lg py-2.5 px-3.5 sm:px-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all min-w-0"
            />
            <button
              id="send-text-btn"
              type="submit"
              disabled={!typedInput.trim() || gogoState === "thinking"}
              className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold transition-all shrink-0 ${
                !typedInput.trim() || gogoState === "thinking"
                  ? "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                  : "bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer"
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Sliding Drawer for Mobile / Tablet Systems Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Back overlay */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Side Drawer Body */}
          <div className="relative w-full max-w-[340px] bg-[#08090a] border-l border-white/10 h-full p-5 sm:p-6 overflow-y-auto flex flex-col space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] ml-auto z-10 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-cyan-400">System Dashboard</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-all shrink-0"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              <CreatorPanel />
              <SettingsPanel
                settings={settings}
                onChangeSettings={handleUpdateSettings}
                browserVoices={browserVoices}
                currentLanguage={currentLanguage}
                onChangeLanguage={setCurrentLanguage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Safety / Compliance footer */}
      <footer className="bg-black/30 border-t border-white/5 py-5 px-6 mt-12 text-center text-xs text-slate-500 font-mono space-y-1 z-10 relative">
        <div className="flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>GOGO Security Profile: Server-Side AI protocols loaded.</span>
        </div>
        <p className="text-[10px] text-slate-600 tracking-wider">
          Created for Atharva Gogawale. All rights reserved &copy; 2026 GOGO Operator Corp.
        </p>
      </footer>
    </div>
  );
}
