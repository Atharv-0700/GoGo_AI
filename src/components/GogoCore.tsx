import { motion } from "motion/react";
import { Mic, Volume2, Sparkles, AlertCircle, Headphones } from "lucide-react";
import { GogoState } from "../types";

interface GogoCoreProps {
  state: GogoState;
  transcript: string;
  onMicClick: () => void;
  isMuted: boolean;
}

export function GogoCore({ state, transcript, onMicClick, isMuted }: GogoCoreProps) {
  // State visual configuration aligned with Immersive UI cyan-accented design
  const stateConfig = {
    idle: {
      color: "from-cyan-950/30 via-slate-900/40 to-neutral-900/20",
      shadow: "shadow-[0_0_40px_rgba(34,211,238,0.15)]",
      glowRingColor: "border-cyan-500/10",
      text: "GOGO is ready",
      subtext: "Click or say \"Hey GOGO\" to talk",
      icon: <Headphones className="w-8 h-8 text-cyan-400" />,
    },
    listening: {
      color: "from-cyan-500/20 via-cyan-400/10 to-transparent",
      shadow: "shadow-[0_0_60px_rgba(34,211,238,0.35)]",
      glowRingColor: "border-cyan-400/30",
      text: "Listening closely...",
      subtext: "Speak your mind now",
      icon: <Mic className="w-8 h-8 text-cyan-300 animate-pulse" />,
    },
    thinking: {
      color: "from-purple-500/20 via-indigo-400/10 to-transparent",
      shadow: "shadow-[0_0_60px_rgba(168,85,247,0.3)]",
      glowRingColor: "border-purple-500/30",
      text: "Formulating answer...",
      subtext: "GOGO is thinking",
      icon: <Sparkles className="w-8 h-8 text-purple-300 animate-spin" style={{ animationDuration: "3s" }} />,
    },
    speaking: {
      color: "from-pink-500/20 via-orange-400/10 to-transparent",
      shadow: "shadow-[0_0_60px_rgba(236,72,153,0.3)]",
      glowRingColor: "border-pink-500/30",
      text: "Responding verbally...",
      subtext: "Listening paused",
      icon: <Volume2 className="w-8 h-8 text-pink-300 animate-bounce" style={{ animationDuration: "1.5s" }} />,
    },
    error: {
      color: "from-red-600/20 via-rose-500/10 to-transparent",
      shadow: "shadow-[0_0_40px_rgba(220,38,38,0.3)]",
      glowRingColor: "border-red-500/20",
      text: "System Error",
      subtext: "Check settings or connection",
      icon: <AlertCircle className="w-8 h-8 text-red-400" />,
    },
  };

  const current = stateConfig[state] || stateConfig.idle;

  return (
    <div className="flex flex-col items-center justify-center py-10 relative select-none w-full">
      {/* Immersive UI Atmospheric Background Glows */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Dynamic central visual pulse */}
        <motion.div
          animate={{
            scale: state === "listening" ? [1, 1.3, 1] : state === "speaking" ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: state === "listening" ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: state === "thinking" ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl"
        />
      </div>

      {/* Main Core Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Outer Orbit / Border Rings */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Immersive UI layering concentric rings */}
          <div className="absolute w-80 h-80 border border-cyan-500/5 rounded-full pointer-events-none"></div>
          <div className={`absolute w-72 h-72 border ${current.glowRingColor} rounded-full transition-colors duration-500 pointer-events-none`}></div>
          <div className="absolute w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>

          {/* Dotted rotate ring */}
          <motion.div
            animate={{
              rotate: state === "thinking" ? 360 : 0,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-72 h-72 rounded-full border border-dashed border-white/10 pointer-events-none"
          />

          {/* Core Interactive Button Sphere */}
          <motion.button
            id="gogo-activation-sphere"
            onClick={onMicClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-52 h-52 rounded-full bg-gradient-to-br ${current.color} ${current.shadow} backdrop-blur-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 border border-white/10 group overflow-hidden relative`}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

            {/* Glowing active circle inner */}
            {state === "listening" && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20" />
              </span>
            )}

            {/* Icon & Label */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
              <motion.div
                animate={
                  state === "speaking"
                    ? { y: [0, -4, 0] }
                    : state === "listening"
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                {current.icon}
              </motion.div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400/90 uppercase font-semibold mt-1">
                {isMuted ? "MUTED" : state.toUpperCase()}
              </span>
            </div>
          </motion.button>

          {/* Mini waveform viz when speaking or listening */}
          {(state === "listening" || state === "speaking") && (
            <div className="absolute -bottom-2 flex space-x-1.5 h-10 items-end justify-center w-auto z-20 bg-[#08090a]/90 px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
              {[...Array(9)].map((_, i) => {
                const heights = {
                  listening: [12, 28, 20, 36, 22, 32, 16, 24, 10],
                  speaking: [8, 22, 34, 14, 38, 24, 30, 10, 6],
                };
                const activeHeight = state === "listening" ? heights.listening[i] : heights.speaking[i];
                
                return (
                  <motion.div
                    key={i}
                    animate={{
                      height: [6, activeHeight, 6],
                    }}
                    transition={{
                      duration: 0.5 + i * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`w-1 rounded-full ${
                      state === "listening" ? "bg-cyan-400" : "bg-pink-400"
                    }`}
                    style={{ height: "6px" }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* State Information Display */}
        <div className="text-center mt-6 z-10">
          <h2 className="text-2xl font-light tracking-tight text-white flex items-center justify-center gap-2">
            {state === "listening" ? (
              <>
                Listening<span className="text-cyan-400">.</span>
              </>
            ) : state === "speaking" ? (
              <>
                Speaking<span className="text-pink-400">.</span>
              </>
            ) : state === "thinking" ? (
              <>
                Thinking<span className="text-purple-400">.</span>
              </>
            ) : (
              <>
                GOGO<span className="text-cyan-400">.</span>
              </>
            )}
            {state === "listening" && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-[0.15em] uppercase mt-1">{current.subtext}</p>
        </div>

        {/* Real-time speech transcription display */}
        {state === "listening" && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-md bg-white/5 border border-white/10 px-6 py-3 rounded-full flex items-center space-x-4 backdrop-blur-xl"
          >
            <span className="text-cyan-400 text-xs font-bold font-mono tracking-widest uppercase shrink-0">TRANSCRIPT</span>
            <div className="h-4 w-px bg-white/10"></div>
            <p className="text-slate-300 italic font-sans text-sm leading-relaxed truncate max-w-xs">
              &ldquo;{transcript}&rdquo;
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
