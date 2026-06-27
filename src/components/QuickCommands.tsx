import { Command, HelpCircle, MessageSquareCode, Sparkles, Languages, BookOpen } from "lucide-react";

interface QuickCommandsProps {
  onSelectCommand: (text: string) => void;
  disabled: boolean;
}

export function QuickCommands({ onSelectCommand, disabled }: QuickCommandsProps) {
  const commands = [
    {
      text: "Who made you?",
      desc: "Triggers GOGO's creator spotlight bio",
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
    },
    {
      text: "Explain what GOGO stands for",
      desc: "System acronym definition",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    {
      text: "बोला, आपण मराठीत बोलू शकता का?",
      desc: "Test fluent Marathi speaking",
      icon: <Languages className="w-4 h-4 text-emerald-400" />,
    },
    {
      text: "क्या आप हिंदी में बात कर सकती हैं?",
      desc: "Test warm Hindi conversing",
      icon: <Languages className="w-4 h-4 text-teal-400" />,
    },
    {
      text: "Give me a quick coding productivity tip",
      desc: "A developer motivational thought",
      icon: <MessageSquareCode className="w-4 h-4 text-cyan-400" />,
    },
    {
      text: "Tell me a very brief zen story",
      desc: "Narrative voice test",
      icon: <BookOpen className="w-4 h-4 text-pink-400" />,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center space-x-2 pb-1.5 border-b border-white/5">
        <Command className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">
          Quick Actions & Prompts
        </h4>
      </div>

      {/* Grid of buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {commands.map((cmd, idx) => (
          <button
            key={idx}
            id={`quick-cmd-${idx}`}
            onClick={() => onSelectCommand(cmd.text)}
            disabled={disabled}
            className={`flex items-start text-left p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/10 backdrop-blur-md transition-all group focus:outline-none ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="p-2 bg-black/30 border border-white/5 rounded-lg mr-3 group-hover:scale-105 transition-transform shrink-0">
              {cmd.icon}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white font-sans tracking-tight">{cmd.text}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-normal">{cmd.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
