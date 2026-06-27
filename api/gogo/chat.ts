import { generateText } from 'ai';

export const maxDuration = 30;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}

export async function POST(req: Request) {
  try {
    console.log({
      GOOGLE_API_KEY_EXISTS: !!process.env.GOOGLE_API_KEY,
      GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
      GOOGLE_APPLICATION_CREDENTIALS_EXISTS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    if (!process.env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Gemini API key not configured' }, 500);
    }

    const { message, history, language } = await req.json();

    if (!message) {
      return jsonResponse({ error: 'Missing required field: message' }, 400);
    }

    const { google } = await import('@ai-sdk/google');

    const promptParts = [];
    if (language) {
      promptParts.push(`Please reply in ${language}.`);
    }
    if (Array.isArray(history) && history.length) {
      promptParts.push(
        history
          .map((turn: { role: string; content: string }) => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}`)
          .join('\n'),
      );
    }
    promptParts.push(`User: ${message}`);

    const prompt = promptParts.join('\n\n');

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    return jsonResponse({ text });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return jsonResponse(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}
