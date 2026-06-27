import { useEffect, useRef } from "react";
import { Message } from "../types";
import { User, Volume2, Calendar, Sparkles } from "lucide-react";

interface ConversationLogProps {
  messages: Message[];
  onSpeakMessage: (text: string) => void;
  isGogoSpeaking: boolean;
}

export function ConversationLog({ messages, onSpeakMessage, isGogoSpeaking }: ConversationLogProps) {
  const containerEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when a new message arrives
  useEffect(() => {
    if (containerEndRef.current) {
      containerEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // A light, solid parser for rendering GOGO's markdown text nicely in React 19 without third-party library conflicts
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      // Toggle code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeContent.join("\n");
          codeContent = [];
          return (
            <div key={idx} className="my-2 bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto relative">
              <span className="absolute top-1.5 right-2 text-[9px] uppercase tracking-wider text-slate-500 font-mono">Source Code</span>
              <pre><code>{codeText}</code></pre>
            </div>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Render bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const bulletText = line.trim().substring(2);
        return (
          <ul key={idx} className="list-disc list-inside ml-3 text-slate-300 text-sm leading-relaxed my-1 font-sans">
            <li>{renderInlineStyles(bulletText)}</li>
          </ul>
        );
      }

      // Render ordered lists
      const numberMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numberMatch) {
        return (
          <ol key={idx} className="list-decimal list-inside ml-3 text-slate-300 text-sm leading-relaxed my-1 font-sans">
            <li>{renderInlineStyles(numberMatch[2])}</li>
          </ol>
        );
      }

      // Normal paragraphs
      if (line.trim() === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-slate-200 text-sm leading-relaxed my-1.5 font-sans">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to parse bold (**bold**) and inline code (`code`)
  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="font-mono text-xs bg-black/40 px-1 py-0.5 rounded text-cyan-300 border border-white/5">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-xl border border-white/5 min-h-[250px] backdrop-blur-xl">
        <div className="w-12 h-12 rounded-full bg-black/30 border border-white/5 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-white font-sans">Start the Conversation</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          GOGO is waiting. Use the quick actions, type in a question, or click her core and speak naturally in Marathi, Hindi, English, Spanish or any language!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden min-h-[300px] max-h-[500px] backdrop-blur-xl">
      {/* Scrollable chat body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}
          >
            {/* GOGO Avatar */}
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-950 via-slate-900 to-neutral-900 flex items-center justify-center text-cyan-400 text-[10px] font-bold font-mono tracking-wider border border-cyan-500/30 shrink-0 shadow-md">
                G
              </div>
            )}

            {/* Bubble wrapper */}
            <div className={`max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Actual Message Box */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-lg ${
                  msg.role === "user"
                    ? "bg-cyan-500 text-black font-medium rounded-tr-none shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "bg-white/[0.02] border border-white/5 text-slate-100 rounded-tl-none backdrop-blur-md"
                }`}
              >
                {/* User Content plain / GOGO content rendered */}
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>{renderMessageContent(msg.text)}</div>
                )}
              </div>

              {/* Message metadata / Speech trigger */}
              <div className="flex items-center space-x-2 mt-1.5 px-1 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.role === "assistant" && (
                  <>
                    <span>•</span>
                    <button
                      id={`replay-${msg.id}`}
                      onClick={() => onSpeakMessage(msg.text)}
                      disabled={isGogoSpeaking}
                      className={`flex items-center gap-1 hover:text-cyan-400 font-semibold focus:outline-none transition-colors ${
                        isGogoSpeaking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400" /> Replay Voice
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-slate-300 shrink-0 shadow-md">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {/* Scroll anchor */}
        <div ref={containerEndRef} />
      </div>
    </div>
  );
}
