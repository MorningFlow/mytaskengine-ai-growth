import { NextResponse } from 'next/server';

/**
 * POST /api/deepgram-token
 *
 * Returns the Deepgram API key to the browser for the Voice Agent Demo.
 * 
 * NOTE: This currently returns the master DEEPGRAM_API_KEY because the provided
 * key in .env.local lacks the 'keys:write' scope required to generate short-lived 
 * temporary keys via the Deepgram Management API. 
 * 
 * To improve security before public launch, upgrade your Deepgram key permissions
 * to include 'keys:write', and this route can be updated to generate 60s TTL keys.
 */
export async function POST() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Voice demo not configured' }, { status: 500 });
    }

    return NextResponse.json({ key: apiKey });
  } catch (error) {
    console.error('Deepgram token API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve token' }, { status: 500 });
  }
}


