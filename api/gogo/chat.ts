import { streamText } from 'ai';

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

    const messages = [
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message },
    ];

    if (language) {
      messages.unshift({
        role: 'system',
        content: `Please reply in ${language}.`,
      });
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages,
    });

    return result.toTextStreamResponse();
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
