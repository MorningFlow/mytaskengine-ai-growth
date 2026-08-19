import { NextResponse } from 'next/server';

/**
 * POST /api/deepgram-token
 *
 * Creates a short-lived (60-second) Deepgram key and returns it to the browser.
 * The browser uses this to open the Voice Agent WebSocket for the demo.
 *
 * The master DEEPGRAM_API_KEY is NEVER returned to the client.
 * Set DEEPGRAM_PROJECT_ID in your environment to skip the /v1/projects fetch.
 */
export async function POST() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Voice demo not configured' }, { status: 500 });
    }

    // ── Step 1: Resolve project ID ───────────────────────────────────────────
    let projectId = process.env.DEEPGRAM_PROJECT_ID ?? '';

    if (!projectId) {
      const projectsRes = await fetch('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${apiKey}` },
        cache: 'no-store',
      });
      if (!projectsRes.ok) {
        console.error('Deepgram /v1/projects failed:', projectsRes.status);
        return NextResponse.json({ error: 'Failed to initialise voice demo' }, { status: 502 });
      }
      const { projects } = await projectsRes.json();
      projectId = projects?.[0]?.project_id ?? '';
      if (!projectId) {
        return NextResponse.json({ error: 'No Deepgram project found' }, { status: 500 });
      }
    }

    // ── Step 2: Create a short-lived key (60 s TTL) ──────────────────────────
    const keyRes = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: 'mte-voice-demo-temp',
          scopes: ['usage:write'],
          time_to_live_in_seconds: 60,
        }),
        cache: 'no-store',
      },
    );

    if (!keyRes.ok) {
      const errText = await keyRes.text();
      console.error('Deepgram key creation failed:', keyRes.status, errText);
      return NextResponse.json({ error: 'Failed to generate voice token' }, { status: 502 });
    }

    const { key } = await keyRes.json();
    return NextResponse.json({ key });
  } catch (error) {
    console.error('Deepgram token API error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}

