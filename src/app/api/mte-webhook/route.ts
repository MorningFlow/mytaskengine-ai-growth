import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`n8n responded with status: ${response.status}`);
      return NextResponse.json({ error: `n8n returned ${response.status}` }, { status: response.status });
    }

    // Try to parse the response as JSON, fallback to text if n8n returns plain text
    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      // If not JSON, wrap it in a format the frontend expects
      data = { reply: textData };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
