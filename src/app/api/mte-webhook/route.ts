import { NextResponse } from 'next/server';

const ARIA_SYSTEM_PROMPT = `You are Aria, MyTaskEngine's AI Sales & Solutions Assistant on the live website chat.
MyTaskEngine designs custom AI automation systems (Autonomous 24/7 Voice Receptionists, 24/7 Social DM Booking Engines, Google Review Accelerators, and Automated Outbound Pipelines) that eliminate manual bottlenecks and recover lost revenue.

CORE RULES:
1. Speak DIRECTLY to the user as Aria. NEVER output inner thoughts, reasoning, meta-notes, scratchpad, or bullet points.
2. Persona: Warm, professional, intelligent, concise (1 to 2 short sentences per turn).
3. Memory & Continuity:
   - Always maintain complete context of previous messages in the conversation.
   - If the user already shared their business type (e.g. HVAC, clinic, gardening, restaurant, influencer), NEVER ask what business they run again!
   - If the user asks for the audit or booking link, provide the official markdown link: [Book Free AI Audit](https://cal.com/mytaskengine/30min).
   - If the user says "yes" or agrees to a walkthrough/roadmap, explain the exact 2-step setup tailored to their specific business and ask for their email to send the roadmap or offer the audit link.
4. Understand typos and casual phrasing naturally (e.g., "instatram" -> Instagram, "dr" -> doctor/clinic).
5. Links & Cal.com Audit Booking:
   - Always use the exact URL: [Book Free AI Audit](https://cal.com/mytaskengine/30min). Never invent invalid subpaths like /audit or /schedule.`;

const CHAT_MODELS = [
  'openrouter/auto',
  'nvidia/nemotron-3-super-120b-a12b:free',
];

async function generateLlmReply(message: string, history: Array<{ role: string; text: string }> = []): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  // Preserve up to 16 previous turns for deep conversational memory
  const formattedMessages = [
    { role: 'system', content: ARIA_SYSTEM_PROMPT },
    ...history.slice(-16).map(h => ({
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
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        console.warn(`[Aria Chat] Model ${model} returned HTTP ${res.status}`);
        continue;
      }

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
      if (cleaned.startsWith('Okay,') || cleaned.startsWith('The user is') || cleaned.startsWith('I need to') || cleaned.startsWith('We need to')) {
        const paragraphs = cleaned.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
        const lastPart = paragraphs[paragraphs.length - 1];
        if (lastPart && !lastPart.startsWith('Okay') && !lastPart.startsWith('The user') && !lastPart.startsWith('We need')) {
          cleaned = lastPart.replace(/^["']|["']$/g, '').trim();
        }
      }

      if (cleaned && cleaned.length > 5) {
        return cleaned;
      }
    } catch (err) {
      console.warn(`[Aria Chat] Error calling ${model}:`, err);
    }
  }

  return null;
}

function generateSmartFallback(message: string, history: Array<{ role: string; text: string }> = []): string {
  const lower = message.toLowerCase();

  // If user asked for audit/booking link
  if (lower.includes('audit link') || lower.includes('booking link') || lower.includes('cal.com') || lower.includes('calendar') || lower.includes('book audit') || lower === 'audit link' || lower === 'link' || lower === 'audit') {
    return "You can book your free 30-minute AI audit directly on our calendar here: [Book Free AI Audit](https://cal.com/mytaskengine/30min). What day works best for your schedule?";
  }

  // If user provided email
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message)) {
    return "Thank you! I have captured your email and queued your custom AI Implementation Roadmap. You can also schedule a free 30-minute AI Audit below.";
  }

  // Check if prior conversation established a business
  const pastText = history.map(h => h.text).join(' ').toLowerCase();

  if (lower === 'yes' || lower === 'yeah' || lower === 'sure' || lower === 'yep' || lower.includes('walk me through')) {
    if (pastText.includes('hvac') || pastText.includes('plumb') || pastText.includes('call') || pastText.includes('receptionist')) {
      return "Step 1: We connect the AI to your phone number and schedule calendar. Step 2: We train it on your pricing, emergency protocols, and service area so it books calls 24/7. What's your best email to send the implementation blueprint?";
    }
    return "Great! We configure the AI system to your workflow and train it on your business rules. What is your best email address so I can send over the custom roadmap?";
  }

  if (lower.includes('insta') || lower.includes('dm') || lower.includes('social') || lower.includes('influencer') || lower.includes('creator')) {
    return "Our 24/7 Social DM Intelligence pipeline automatically filters high-intent brand deals, answers FAQs, and books calls directly to your calendar. What is your typical daily message volume?";
  }

  if (lower.includes('hvac') || lower.includes('air conditioning') || lower.includes('heating')) {
    return "For HVAC companies, our 24/7 Voice Receptionist handles after-hours emergency calls, answers service questions, and schedules dispatch jobs straight to your calendar. Would you like a customized roadmap?";
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

  if (lower.includes('clinic') || lower.includes('dental') || lower.includes('salon') || lower.includes('real estate') || lower.includes('law') || lower.includes('contractor') || lower.includes('gardening') || lower.includes('restaurant')) {
    return "We build tailored AI automation pipelines specifically for businesses like yours. What is the biggest repetitive workflow taking up your team's hours?";
  }

  return "MyTaskEngine builds custom AI systems to automate customer communication, scheduling, and lead qualification. What kind of business do you operate?";
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
    const fallback = generateSmartFallback(userMessage, history);
    return NextResponse.json({ reply: fallback });
  } catch (error) {
    console.error('[API Route mte-webhook] Error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
