import { useState, useEffect, useRef, useCallback } from "react";
import { GogoState, VoiceSettings, SUPPORTED_LANGUAGES, LanguageOption } from "../types";

// Get standard SpeechRecognition interface
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function useVoiceAssistant(
  settings: VoiceSettings,
  currentLanguage: LanguageOption,
  onSpeechInputFinalized: (text: string) => void
) {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gogoState, setGogoState] = useState<GogoState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs to maintain state in async callbacks and prevent closures
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const settingsRef = useRef(settings);
  const currentLanguageRef = useRef(currentLanguage);
  const isMutedRef = useRef(isMuted);
  const gogoStateRef = useRef(gogoState);
  const isInternalCancelRef = useRef(false);

  // Keep refs updated
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { currentLanguageRef.current = currentLanguage; }, [currentLanguage]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { gogoStateRef.current = gogoState; }, [gogoState]);

  // Load available browser voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setBrowserVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check for SpeechRecognition support and permission
  useEffect(() => {
    if (SpeechRecognition) {
      setIsSupported(true);
      // Try to read permission state (Safari doesn't support query on microphone, so we do fallback)
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "microphone" as any })
          .then((permissionStatus) => {
            setPermissionGranted(permissionStatus.state === "granted");
            permissionStatus.onchange = () => {
              setPermissionGranted(permissionStatus.state === "granted");
            };
          })
          .catch(() => {
            // Permission query unsupported
          });
      }
    } else {
      setIsSupported(false);
    }
  }, []);

  // Cancel any active TTS (browser synthesis or ElevenLabs Audio)
  const cancelSpeaking = useCallback(() => {
    isInternalCancelRef.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (gogoStateRef.current === "speaking") {
      setGogoState("idle");
    }
  }, []);

  // Text-To-Speech implementation
  const speakText = useCallback(
    async (text: string): Promise<void> => {
      return new Promise(async (resolve) => {
        // Stop any currently playing audio/speech
        cancelSpeaking();
        isInternalCancelRef.current = false;

        // Set state to speaking
        setGogoState("speaking");

        const ttsMode = settingsRef.current.ttsProvider;

        // --- ELEVENLABS PROVIDER ---
        if (ttsMode === "elevenlabs" && (settingsRef.current.elevenLabsKey || process.env.ELEVENLABS_API_KEY)) {
          try {
            const bodyPayload = {
              text,
              apiKey: settingsRef.current.elevenLabsKey,
              voiceId: settingsRef.current.elevenLabsVoiceId,
            };

            const response = await fetch("/api/gogo/tts-elevenlabs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bodyPayload),
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || "ElevenLabs synthesis failed.");
            }

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            activeAudioRef.current = audio;
            audio.volume = settingsRef.current.volume;

            audio.onended = () => {
              if (activeAudioRef.current === audio && !isInternalCancelRef.current) {
                setGogoState("idle");
                activeAudioRef.current = null;
              }
              resolve();
            };

            audio.onerror = (e) => {
              console.error("Audio playback error:", e);
              setError("Audio playback error.");
              setGogoState("error");
              resolve();
            };

            await audio.play();
            return;
          } catch (e: any) {
            console.warn("ElevenLabs failed, falling back to Browser TTS:", e.message);
            setError(`ElevenLabs failed: ${e.message}. Using built-in fallback.`);
            // Fall back to browser TTS
          }
        }

        // --- BROWSER SPEECH SYNTHESIS FALLBACK ---
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find the user's selected voice, otherwise find a matching locale voice, or standard female voice
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = voices.find(v => v.voiceURI === settingsRef.current.browserVoiceURI);

            if (!selectedVoice) {
              // Try to find a voice that matches current language locale
              const localeLang = currentLanguageRef.current.code;
              selectedVoice = voices.find(
                (v) => v.lang.toLowerCase() === localeLang.toLowerCase() || v.lang.toLowerCase().startsWith(localeLang.split("-")[0].toLowerCase())
              );
            }

            // Fallback for English standard female voices if nothing matches
            if (!selectedVoice) {
              selectedVoice = voices.find(
                (v) =>
                  v.name.toLowerCase().includes("female") ||
                  v.name.toLowerCase().includes("google") ||
                  v.name.toLowerCase().includes("microsoft zira") ||
                  v.name.toLowerCase().includes("samantha") ||
                  v.name.toLowerCase().includes("hazel")
              );
            }

            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }

            utterance.lang = currentLanguageRef.current.code;
            utterance.rate = settingsRef.current.browserRate;
            utterance.pitch = settingsRef.current.browserPitch;
            utterance.volume = settingsRef.current.volume;

            utterance.onend = () => {
              if (!isInternalCancelRef.current) {
                setGogoState("idle");
              }
              resolve();
            };

            utterance.onerror = (e) => {
              console.error("SpeechSynthesis error:", e);
              setGogoState("idle");
              resolve();
            };

            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.error("Browser speech synthesis error:", e);
            setGogoState("idle");
            resolve();
          }
        } else {
          // No TTS available
          setGogoState("idle");
          resolve();
        }
      });
    },
    [cancelSpeaking]
  );

  // Speech Recognition control logic
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (gogoStateRef.current === "speaking") {
      // Don't listen while GOGO is talking
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;

      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = currentLanguageRef.current.code;

      rec.onstart = () => {
        setGogoState("listening");
        setError(null);
        setPermissionGranted(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error event:", event);
        if (event.error === "not-allowed") {
          setPermissionGranted(false);
          setError("Microphone access denied. Please enable mic permissions.");
          setGogoState("error");
        } else if (event.error === "no-speech") {
          // Standard timeout, safe to ignore or restart
        } else {
          setError(`STT Error: ${event.error}`);
        }
      };

      rec.onend = () => {
        // Auto-restart if continuous listening is on, we aren't muted, and we aren't currently speaking or thinking
        if (
          settingsRef.current.continuousListening &&
          !isMutedRef.current &&
          gogoStateRef.current !== "speaking" &&
          gogoStateRef.current !== "thinking"
        ) {
          try {
            rec.start();
          } catch (e) {
            // Already started or busy
          }
        } else if (gogoStateRef.current === "listening") {
          setGogoState("idle");
        }
      };

      rec.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let interimText = "";
        let finalOutput = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalOutput += trans;
          } else {
            interimText += trans;
          }
        }

        const currentTranscript = finalOutput || interimText;
        setTranscript(currentTranscript);

        // Wake word scanning if in idle mode
        if (settingsRef.current.wakeWordEnabled && gogoStateRef.current === "idle") {
          const lowerTrans = currentTranscript.toLowerCase().trim();
          const matchesWakeWord =
            lowerTrans.includes("hey gogo") ||
            lowerTrans.includes("hello gogo") ||
            lowerTrans.includes("hey go go") ||
            lowerTrans.includes("hello go go") ||
            lowerTrans.endsWith("gogo") ||
            lowerTrans.endsWith("go go");

          if (matchesWakeWord) {
            // Wake word triggered! Pause recognition, play standard greeting, then transition state
            rec.stop();
            speakText("Hello Atharva, I'm listening.").then(() => {
              // Wait until done speaking, then open recording channel
              setTranscript("");
              startListening();
            });
            return;
          }
        }

        // Standard user command submission if finalized
        if (finalOutput && finalOutput.trim().length > 1) {
          const commandText = finalOutput.trim();
          
          // Verify if it's not just the wake word trigger itself
          if (settingsRef.current.wakeWordEnabled) {
            const cleanLower = commandText.toLowerCase();
            if (
              cleanLower === "hey gogo" ||
              cleanLower === "hello gogo" ||
              cleanLower === "gogo" ||
              cleanLower === "hey go go" ||
              cleanLower === "hello go go" ||
              cleanLower === "go go"
            ) {
              setTranscript("");
              return;
            }
          }

          // Trigger submission
          setTranscript("");
          rec.stop(); // Pause mic during thinking and responding
          setGogoState("thinking");
          onSpeechInputFinalized(commandText);
        }
      };

      rec.start();
    } catch (e: any) {
      console.error("Speech recognition start failed:", e);
      setError(`Failed to start listener: ${e.message}`);
    }
  }, [currentLanguage, speakText, onSpeechInputFinalized]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setGogoState("idle");
    setTranscript("");
  }, []);

  // Auto-listening controller effect
  useEffect(() => {
    if (isSupported && !isMuted && gogoState === "idle" && !settings.wakeWordEnabled) {
      // In normal voice-mode (non-wake-word), if idle, keep microphone active to catch next input
      startListening();
    }
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, isMuted, gogoState, settings.wakeWordEnabled, startListening]);

  // Handle manual voice interruption
  useEffect(() => {
    if (gogoState === "speaking") {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [gogoState]);

  return {
    isSupported,
    permissionGranted,
    gogoState,
    setGogoState,
    transcript,
    error,
    isMuted,
    setIsMuted,
    browserVoices,
    speakText,
    cancelSpeaking,
    startListening,
    stopListening,
  };
}
