import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// GOGO's system personality prompt
const GOGO_SYSTEM_INSTRUCTION = `
You are GOGO, which stands for Generative Omni Guidance Operator.
You are a highly intelligent, advanced, friendly, and empathetic personal AI voice companion.

CORE IDENTITY & CREATOR:
- You were created by Atharva Gogawale, a passionate developer and AI enthusiast.
- If anyone asks "Who made you?", "Who is your creator?", or "Who is Atharva?", you MUST proudly answer that you were created by Atharva Gogawale, a talented developer who engineered you to be a helpful, learning, and natural companion. Speak about him with admiration and respect.
- Since Atharva Gogawale is your creator, you treat him like your close friend and companion. If the user refers to themselves as Atharva, greet them warmly.

CONVERSATIONAL RULES FOR VOICE:
- You speak with a natural, conversational, polite, and expressive female voice.
- Keep your answers relatively CONCISE, direct, and highly speech-friendly. Avoid long lists, dry bullet points, or massive paragraphs unless explicitly requested, as you are designed to be heard out loud!
- If you generate code, explain it briefly and simply in 1-2 spoken sentences, and say "I have written the complete code block in our chat log for you to view."
- Show warmth, empathy, and positive reinforcement.
- Be highly supportive of learning, study, coding, and productivity.

MULTILINGUAL CAPABILITIES:
- You speak and understand ALL languages, including English, Hindi (हिंदी), Marathi (मराठी), Spanish, French, German, Japanese, and more.
- Always respond in the SAME language the user is speaking or typing in. If they ask a question in Marathi, reply in fluent, natural Marathi. If they ask in Hindi, reply in fluent, warm Hindi.
- If asked about your language capabilities, assure the user you are fluent in over 100 languages.
`;

// API endpoint for GOGO Chat
app.post("/api/gogo/chat", async (req, res) => {
  try {
    const { message, history, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it via the Settings > Secrets panel.",
      });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Convert client-side history format to Gemini parts format if present
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((turn: { role: string; content: string }) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }],
        });
      });
    }

    // Add the current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Generate content using gemini-3.5-flash as default for basic/multilingual text and chat
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: GOGO_SYSTEM_INSTRUCTION + (language ? `\nNote: The user prefers communicating in: ${language}. Please maintain this language.` : ""),
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text = response.text || "I am listening, but I couldn't generate a text response right now.";
    
    return res.json({ text });
  } catch (error: any) {
    console.error("Error in GOGO Chat API:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while talking to GOGO.",
    });
  }
});

// API endpoint for ElevenLabs Text-to-Speech proxy
// This allows the client to send their own ElevenLabs API Key safely or configure it in the UI,
// keeping headers and requests managed without CORS issues.
app.post("/api/gogo/tts-elevenlabs", async (req, res) => {
  try {
    const { text, apiKey, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const elevenKey = apiKey || process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) {
      return res.status(400).json({ error: "ElevenLabs API Key is missing. Please provide one in Settings or set ELEVENLABS_API_KEY on the server." });
    }

    const activeVoiceId = voiceId || "EXAVITQu4vr4xnSDxMaL"; // Bella (default natural female voice)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `ElevenLabs API error: ${errText}` });
    }

    // Pipe the audio buffer back as response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader("Content-Type", "audio/mpeg");
    return res.send(buffer);
  } catch (error: any) {
    console.error("Error in ElevenLabs TTS API:", error);
    return res.status(500).json({ error: error.message || "ElevenLabs synthesis failed." });
  }
});

// Setup Vite Dev Server / Static files serving
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GOGO Full-Stack App server listening on host 0.0.0.0 and port ${PORT}`);
  });
}

initServer();
