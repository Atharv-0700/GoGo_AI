import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return jsonResponse(
        {
          error:
            'Google AI credentials are not configured. Please set GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS in Vercel environment variables.',
        },
        500,
      );
    }

    const { message, history, language } = await req.json();

    if (!message) {
      return jsonResponse({ error: 'Missing required field: message' }, 400);
    }

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
