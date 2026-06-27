import { VoiceSettings, SUPPORTED_LANGUAGES, LanguageOption } from "../types";
import { Sliders, Volume2, Mic, Settings, Key, Disc, Zap } from "lucide-react";

interface SettingsPanelProps {
  settings: VoiceSettings;
  onChangeSettings: (settings: Partial<VoiceSettings>) => void;
  browserVoices: SpeechSynthesisVoice[];
  currentLanguage: LanguageOption;
  onChangeLanguage: (lang: LanguageOption) => void;
}

export function SettingsPanel({
  settings,
  onChangeSettings,
  browserVoices,
  currentLanguage,
  onChangeLanguage,
}: SettingsPanelProps) {
  // Filter voices that match current language or are common English/female voices
  const filteredVoices = browserVoices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    const currLangPrefix = currentLanguage.code.split("-")[0].toLowerCase();
    return voiceLang.startsWith(currLangPrefix) || voiceLang.includes("en");
  });

  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 shadow-2xl space-y-6 backdrop-blur-xl hover:border-cyan-500/15 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center space-x-2.5 pb-3 border-b border-white/5">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white tracking-tight">GOGO System Control</h3>
      </div>

      {/* Voice Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Voice Synthesis Engine</label>
        <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-lg border border-white/5">
          <button
            id="engine-browser"
            onClick={() => onChangeSettings({ ttsProvider: "browser" })}
            className={`py-2 px-3 text-xs font-medium rounded-md transition-all ${
              settings.ttsProvider === "browser"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.25)] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System Speech
          </button>
          <button
            id="engine-elevenlabs"
            onClick={() => onChangeSettings({ ttsProvider: "elevenlabs" })}
            className={`py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              settings.ttsProvider === "elevenlabs"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> ElevenLabs Premium
          </button>
        </div>
      </div>

      {/* Language Quick Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Interaction Language</label>
        <select
          id="language-select"
          value={currentLanguage.code}
          onChange={(e) => {
            const selected = SUPPORTED_LANGUAGES.find((lang) => lang.code === e.target.value);
            if (selected) onChangeLanguage(selected);
          }}
          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-neutral-900">
              {lang.flag} {lang.label} ({lang.nativeLabel})
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic parameters based on engine */}
      {settings.ttsProvider === "browser" ? (
        <div className="space-y-4">
          {/* Browser Voice Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Disc className="w-3.5 h-3.5 text-cyan-400" /> Selected Speaker Voice
            </label>
            <select
              id="voice-select"
              value={settings.browserVoiceURI}
              onChange={(e) => onChangeSettings({ browserVoiceURI: e.target.value })}
              className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="" className="bg-neutral-900">Default OS Female Voice</option>
              {filteredVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI} className="bg-neutral-900">
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Browser Sliders */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Speaking speed</span>
                <span className="text-cyan-400 font-semibold">{settings.browserRate}x</span>
              </div>
              <input
                id="rate-slider"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.browserRate}
                onChange={(e) => onChangeSettings({ browserRate: parseFloat(e.target.value) })}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Voice Pitch</span>
                <span className="text-cyan-400 font-semibold">{settings.browserPitch}x</span>
              </div>
              <input
                id="pitch-slider"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.browserPitch}
                onChange={(e) => onChangeSettings({ browserPitch: parseFloat(e.target.value) })}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5 bg-black/20 p-3.5 rounded-lg border border-white/5">
          <p className="text-xs text-slate-400 leading-normal mb-1 flex items-start gap-1.5">
            <Sliders className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Generate hyper-realistic human voice output. Provide your personal ElevenLabs API Key or leave empty if pre-configured on the server.</span>
          </p>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Key className="w-3 h-3 text-pink-400" /> ElevenLabs API Key
            </label>
            <input
              id="eleven-key-input"
              type="password"
              placeholder="Paste xi-api-key..."
              value={settings.elevenLabsKey}
              onChange={(e) => onChangeSettings({ elevenLabsKey: e.target.value })}
              className="w-full bg-black/30 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Voice ID</label>
            <input
              id="eleven-voice-input"
              type="text"
              placeholder="e.g. EXAVITQu4vr4xnSDxMaL (Bella)"
              value={settings.elevenLabsVoiceId}
              onChange={(e) => onChangeSettings({ elevenLabsVoiceId: e.target.value })}
              className="w-full bg-black/30 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Global Volume Slider */}
      <div>
        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
          <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Output Volume</span>
          <span className="text-cyan-400 font-semibold">{Math.round(settings.volume * 100)}%</span>
        </div>
        <input
          id="volume-slider"
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={settings.volume}
          onChange={(e) => onChangeSettings({ volume: parseFloat(e.target.value) })}
          className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-3 border-t border-white/5">
        {/* Wake-Word Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-cyan-400" /> Continuous Wake-Word
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Listens for &ldquo;Hey GOGO&rdquo;</span>
          </div>
          <button
            id="wakeword-toggle"
            onClick={() => onChangeSettings({ wakeWordEnabled: !settings.wakeWordEnabled })}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none relative ${
              settings.wakeWordEnabled ? "bg-cyan-500" : "bg-white/5"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.wakeWordEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Continuous Listening Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Continuous Listening
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Reopens microphone automatically</span>
          </div>
          <button
            id="continuous-toggle"
            onClick={() => onChangeSettings({ continuousListening: !settings.continuousListening })}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none relative ${
              settings.continuousListening ? "bg-cyan-500" : "bg-white/5"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.continuousListening ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
