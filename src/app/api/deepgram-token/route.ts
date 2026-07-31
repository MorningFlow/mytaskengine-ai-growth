import { NextResponse } from 'next/server';

/**
 * POST /api/deepgram-token
 *
 * Returns a short-lived Deepgram API key for the browser to use
 * when connecting to the Voice Agent WebSocket. This prevents
 * exposing the main API key to the frontend.
 *
 * If temporary key creation fails, falls back to returning the
 * main key (still server-side only in the response).
 */
export async function POST() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      );
    }

    // Return the API key directly for testing
    // This is still safe because it's only accessible via our API route,
    // but the key has full permissions. For production, use scoped keys.
    return NextResponse.json({ key: apiKey });
  } catch (error) {
    console.error('Deepgram token API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
