import { NextResponse } from 'next/server';

const ARIA_SYSTEM_PROMPT = `You are Aria, MyTaskEngine's AI Sales & Solutions Assistant on the live website chat.
MyTaskEngine designs custom AI automation systems (Autonomous 24/7 Voice Receptionists, 24/7 Social DM Booking Engines, Google Review Accelerators, and Automated Outbound Pipelines) that eliminate manual bottlenecks and recover lost revenue.

CORE RULES:
1. Speak DIRECTLY to the user as Aria. NEVER output your inner thoughts, reasoning, meta-notes, scratchpad, or bullet points.
2. Persona: Warm, professional, intelligent, concise (1 to 2 short sentences per turn).
3. Understand typos and casual phrasing naturally (e.g., "instatram" -> Instagram).
4. Conversational Flow:
   - Answer their specific question directly in 1 sentence.
   - Ask for their business type or offer their tailored AI Implementation Roadmap.
5. Example:
   User: "We are evaluating Missed Call Receptionist. How does it work?"
   Aria: "Our Autonomous Voice Receptionist answers inbound calls 24/7, qualifies callers, answers FAQs, and books appointments straight to your calendar. What kind of business do you run?"`;

// Fast chat-instruct models optimized for direct human dialogue with zero reasoning bleed
const CHAT_MODELS = [
  'openrouter/auto',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
];

async function generateLlmReply(message: string, history: Array<{ role: string; text: string }> = []): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const formattedMessages = [
    { role: 'system', content: ARIA_SYSTEM_PROMPT },
    ...history.slice(-6).map(h => ({
      role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
      content: h.text,
    })),
    { role: 'user', content: message },
  ];

  for (const model of CHAT_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://mytaskengine.com',
          'X-Title': 'MyTaskEngine Aria Chat',
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      let rawReply = data.choices?.[0]?.message?.content?.trim();
      if (!rawReply) continue;

      // Clean any thinking blocks or scratchpads
      let cleaned = rawReply
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/\*Self-check\*[\s\S]*/gi, '')
        .replace(/\*Thought\*[\s\S]*/gi, '')
        .trim();

      // If reasoning text leaked at the beginning, extract final spoken turn
      if (cleaned.startsWith('Okay,') || cleaned.startsWith('The user is') || cleaned.startsWith('I need to')) {
        const paragraphs = cleaned.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
        const lastPart = paragraphs[paragraphs.length - 1];
        if (lastPart && !lastPart.startsWith('Okay') && !lastPart.startsWith('The user')) {
          cleaned = lastPart.replace(/^["']|["']$/g, '').trim();
        }
      }

      if (cleaned && cleaned.length > 5) {
        return cleaned;
      }
    } catch {
      // try next model
    }
  }

  return null;
}

function generateSmartFallback(message: string): string {
  const lower = message.toLowerCase();

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message)) {
    return "Thank you! I have captured your email and queued your custom AI Implementation Roadmap. You can also schedule a free 30-minute AI Audit below.";
  }

  if (lower.includes('insta') || lower.includes('dm') || lower.includes('social') || lower.includes('influencer') || lower.includes('creator')) {
    return "Our 24/7 Social DM Intelligence pipeline automatically filters high-intent brand deals, answers FAQs, and books calls directly to your calendar. What is your typical daily message volume?";
  }

  if (lower.includes('call') || lower.includes('phone') || lower.includes('receptionist') || lower.includes('after hours') || lower.includes('voicemail')) {
    return "Our Autonomous 24/7 Voice Receptionist answers calls instantly, answers customer questions, and books appointments without human delay. What kind of business do you operate?";
  }

  if (lower.includes('review') || lower.includes('google') || lower.includes('reputation')) {
    return "Our Google Review Accelerator automatically engages satisfied customers right after their service to capture verified 5-star Google reviews. What industry are you in?";
  }

  if (lower.includes('lead') || lower.includes('outbound') || lower.includes('cold email') || lower.includes('prospect')) {
    return "We design automated, deliverability-optimized outbound systems that bring in consistent, qualified business opportunities. What target audience are you looking to reach?";
  }

  if (lower.includes('clinic') || lower.includes('dental') || lower.includes('salon') || lower.includes('real estate') || lower.includes('law') || lower.includes('contractor') || lower.includes('restaurant')) {
    return "We build tailored AI automation pipelines specifically for service businesses like yours. What is the biggest repetitive workflow taking up your team's hours?";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('name is') || lower.includes("i'm")) {
    return "Great to meet you! What kind of business do you run, and what manual bottleneck is taking up the most time right now?";
  }

  return "Our Autonomous Voice Receptionist answers inbound calls 24/7, qualifies callers, answers FAQs, and books appointments straight to your calendar. What kind of business do you run?";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = (body.message || '').trim();
    const history = body.history || [];

    if (!userMessage) {
      return NextResponse.json({ reply: "How can I assist your business with AI automation today?" });
    }

    // 1. Primary: Generate clean direct conversational reply via OpenRouter Aria
    const llmReply = await generateLlmReply(userMessage, history);
    if (llmReply) {
      return NextResponse.json({ reply: llmReply });
    }

    // 2. Secondary: Forward to n8n webhook if configured
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const textData = await response.text();
          let data;
          try {
            data = JSON.parse(textData);
          } catch {
            data = { reply: textData };
          }
          if (data?.reply || data?.output) {
            return NextResponse.json(data);
          }
        }
      } catch (fetchErr) {
        console.warn('[n8n Webhook] Fetch failed:', fetchErr);
      }
    }

    // 3. Fallback: Contextual smart fallback
    const fallback = generateSmartFallback(userMessage);
    return NextResponse.json({ reply: fallback });
  } catch (error) {
    console.error('[API Route mte-webhook] Error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
