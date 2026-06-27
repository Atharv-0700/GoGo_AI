import { Award, Code2, Globe, Heart, HeartHandshake, Laptop, Terminal } from "lucide-react";

export function CreatorPanel() {
  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 shadow-2xl relative overflow-hidden group backdrop-blur-xl hover:border-cyan-500/15 transition-all duration-300">
      {/* Decorative radial lighting in background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />

      {/* Title */}
      <div className="flex items-center space-x-2.5 pb-3 border-b border-white/5 mb-4">
        <Award className="w-5 h-5 text-cyan-400 animate-pulse" />
        <h3 className="font-semibold text-white tracking-tight">Origin & Creator Core</h3>
      </div>

      {/* Developer Profile card */}
      <div className="flex items-start space-x-4">
        {/* Mock Avatar */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-neutral-900 flex items-center justify-center text-cyan-400 text-2xl font-bold font-mono shadow-md shrink-0 border border-cyan-500/30">
          AG
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-sans tracking-tight">Atharva Gogawale</h4>
          <p className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">Lead AI Systems Architect</p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            An innovative developer and AI enthusiast passionate about human-computer interaction, continuous learning, and multi-language agent communication frameworks.
          </p>
        </div>
      </div>

      {/* Creator Specs / Technical Info */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-white/5 text-xs">
        <h5 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">GOGO Specifications</h5>
        
        <div className="flex items-center justify-between py-1 bg-white/[0.01] px-2.5 rounded border border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" /> System Name
          </span>
          <span className="text-slate-200 font-medium">GOGO (G.O.G.O.)</span>
        </div>

        <div className="flex items-center justify-between py-1 bg-white/[0.01] px-2.5 rounded border border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Full Definition
          </span>
          <span className="text-slate-200 font-medium text-[11px]">Generative Omni Guidance Operator</span>
        </div>

        <div className="flex items-center justify-between py-1 bg-white/[0.01] px-2.5 rounded border border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" /> Brain Core
          </span>
          <span className="text-slate-200 font-medium font-mono text-[11px]">Gemini 3.5 Flash (Latest)</span>
        </div>

        <div className="flex items-center justify-between py-1 bg-white/[0.01] px-2.5 rounded border border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Dialect Capacity
          </span>
          <span className="text-slate-200 font-medium">100+ Active Languages</span>
        </div>
      </div>

      {/* Quote/Mission */}
      <div className="mt-5 p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/25">
        <p className="text-[11px] italic text-slate-300 leading-relaxed flex items-start gap-1.5">
          <HeartHandshake className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>&ldquo;GOGO is more than a chatbot. It is an intelligent digital companion created by Atharva Gogawale to make everyday life easier, smarter, and more productive.&rdquo;</span>
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>ESTD. JUNE 2026</span>
        <span className="flex items-center gap-1 text-slate-400">
          Made with <Heart className="w-3 h-3 text-cyan-500 fill-cyan-500 animate-pulse" /> for Atharva
        </span>
      </div>
    </div>
  );
}
