export type GogoState = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  spoken?: boolean;
}

export interface VoiceSettings {
  ttsProvider: "browser" | "elevenlabs";
  browserVoiceURI: string;
  browserRate: number;
  browserPitch: number;
  elevenLabsKey: string;
  elevenLabsVoiceId: string;
  continuousListening: boolean;
  wakeWordEnabled: boolean;
  volume: number;
}

export interface LanguageOption {
  code: string;       // BCP 47 code (e.g. 'en-US', 'mr-IN', 'hi-IN')
  label: string;      // English label
  nativeLabel: string;// Native script label
  flag: string;       // Emoji or text flag representation
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en-US", label: "English (US)", nativeLabel: "English", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "es-ES", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "ja-JP", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", label: "Chinese", nativeLabel: "简体中文", flag: "🇨🇳" },
  { code: "it-IT", label: "Italian", nativeLabel: "Italiano", flag: "🇮🇹" },
];
