import { NextResponse } from 'next/server';

function generateFallbackReply(message: string): string {
  const lower = message.toLowerCase();

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message)) {
    return "Thank you! I have captured your contact information and prepared a tailored AI Implementation Roadmap. You can view the extracted parameters below or schedule your free 30-minute AI Audit.";
  }

  if (lower.includes('call') || lower.includes('phone') || lower.includes('receptionist') || lower.includes('after hours')) {
    return "Our Autonomous Voice Receptionist answers inbound calls 24/7, handles FAQs, qualifies callers, and books directly into your calendar. What type of business do you operate?";
  }

  if (lower.includes('instagram') || lower.includes('dm') || lower.includes('social')) {
    return "Our 24/7 DM Assistant converts Instagram inquiries into booked calendar appointments in your exact brand tone. What is your current monthly inquiry volume?";
  }

  if (lower.includes('review') || lower.includes('google') || lower.includes('reputation')) {
    return "Our Google Review Accelerator filters customer sentiment and automatically routes 5-star experiences straight to Google Reviews after every transaction. What industry is your business in?";
  }

  if (lower.includes('outbound') || lower.includes('lead') || lower.includes('cold email')) {
    return "We design automated, deliverability-optimized outbound acquisition systems that generate consistent, qualified B2B opportunities. What is your target audience?";
  }

  if (lower.includes('clinic') || lower.includes('dental') || lower.includes('salon') || lower.includes('real estate') || lower.includes('law') || lower.includes('contractor')) {
    return "We build tailored AI automation pipelines specifically for service businesses like yours. What is the single biggest operational bottleneck eating your team's time?";
  }

  return "MyTaskEngine builds custom AI systems to automate lead response, voice bookings, and client follow-ups. What kind of business do you run, and what workflow would you like to automate?";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      const fallback = generateFallbackReply(body.message || '');
      return NextResponse.json({ reply: fallback });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.warn(`n8n responded with status: ${response.status}. Using conversational fallback.`);
        const fallback = generateFallbackReply(body.message || '');
        return NextResponse.json({ reply: fallback });
      }

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch {
        data = { reply: textData };
      }

      return NextResponse.json(data);
    } catch (fetchErr) {
      console.warn('n8n fetch failed. Using conversational fallback:', fetchErr);
      const fallback = generateFallbackReply(body.message || '');
      return NextResponse.json({ reply: fallback });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
