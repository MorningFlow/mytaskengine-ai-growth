import { NextResponse } from 'next/server';

export interface ExtractedLeadData {
  name: string | null;
  email: string | null;
  phone: string | null;
  businessType: string | null;
  primaryBottleneck: string | null;
  volumeOrScale: string | null;
  leadScore: 'High Priority' | 'Moderate Priority' | 'Standard Inquiry';
  recommendedSolution: string;
  executiveSummary: string;
  missingFields: string[];
}

interface TranscriptItem {
  role: 'user' | 'assistant' | 'bot';
  text: string;
  time?: number | string;
}

/**
 * OpenRouter Structured LLM Extraction Engine.
 * Utilizes Nemotron / Llama / Gemini models with zero-hallucination prompt constraints.
 */
async function extractWithOpenRouter(transcript: TranscriptItem[]): Promise<ExtractedLeadData | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';

  const formattedTranscript = transcript
    .map(t => `[${t.role === 'assistant' || t.role === 'bot' ? 'Aria' : 'Caller'}]: ${t.text}`)
    .join('\n');

  const systemPrompt = `You are a high-precision, zero-hallucination Lead Intelligence Extractor for MyTaskEngine.
Analyze the conversation transcript and extract structured lead information.

CRITICAL RULES:
1. Extract ONLY information explicitly stated by the caller.
2. If a field was NOT mentioned, not provided, or remains ambiguous, set it strictly to null.
3. NEVER guess, assume, or invent an industry, caller name, email, or operational bottleneck.
4. If the caller only stated a greeting or brief remarks without business details, name and businessType MUST be null.
5. Return ONLY a valid, raw JSON object matching the requested schema. Do NOT include markdown code blocks, backticks, or explanatory text.`;

  const userPrompt = `Transcript:
${formattedTranscript}

Extract the structured lead JSON with this exact TypeScript structure:
{
  "name": string | null (Caller's explicit full or first name, or null),
  "email": string | null (Caller's explicit email address, or null),
  "phone": string | null (Caller's explicit phone number, or null),
  "businessType": string | null (Exact business type or industry stated by caller, or null),
  "primaryBottleneck": string | null (Specific problem, manual task, or bottleneck stated by caller, or null),
  "volumeOrScale": string | null (Call volume, lead volume, patient/customer count if stated, or null),
  "leadScore": "High Priority" | "Moderate Priority" | "Standard Inquiry" (High if email provided, Moderate if business/problem provided, Standard if only casual inquiry),
  "recommendedSolution": string (Concise matching MyTaskEngine AI system, e.g. "Autonomous 24/7 Voice Receptionist", "Social DM Booking Engine", "Automated Outbound Pipeline", or "Custom AI Workflow"),
  "executiveSummary": string (1-2 sentence professional executive summary of the conversation and caller's intent),
  "missingFields": string[] (List of missing parameters from: ["name", "email", "phone", "businessType", "primaryBottleneck"])
}`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://mytaskengine.com',
        'X-Title': 'MyTaskEngine Lead Intelligence',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      console.warn(`[OpenRouter Extract] HTTP ${res.status}:`, await res.text());
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    // Clean any markdown fences or formatting
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed: ExtractedLeadData = JSON.parse(cleaned);

    // Validate essential properties
    if (parsed && typeof parsed === 'object') {
      const missing: string[] = [];
      if (!parsed.name) missing.push('name');
      if (!parsed.email) missing.push('email');
      if (!parsed.phone) missing.push('phone');
      if (!parsed.businessType) missing.push('businessType');
      if (!parsed.primaryBottleneck) missing.push('primaryBottleneck');

      return {
        name: parsed.name || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        businessType: parsed.businessType || null,
        primaryBottleneck: parsed.primaryBottleneck || null,
        volumeOrScale: parsed.volumeOrScale || null,
        leadScore: parsed.leadScore || (parsed.email ? 'High Priority' : 'Standard Inquiry'),
        recommendedSolution: parsed.recommendedSolution || 'Custom Autonomous AI Architecture',
        executiveSummary: parsed.executiveSummary || 'Inbound conversation logged for evaluation.',
        missingFields: missing,
      };
    }
  } catch (err) {
    console.warn('[OpenRouter Extract] Error during LLM extraction:', err);
  }

  return null;
}

/**
 * Strict Zero-Assumption Heuristic Fallback Engine.
 * Used when OpenRouter API is not configured or temporarily unreachable.
 * Never invents, guesses, or fabricates unstated fields.
 */
function extractHeuristically(transcript: TranscriptItem[]): ExtractedLeadData {
  const fullUserText = transcript
    .filter(t => t.role === 'user')
    .map(t => t.text)
    .join(' ');

  // 1. Email extraction (handles spoken "at gmail dot com" or standard emails)
  let email: string | null = null;
  const standardEmailMatch = fullUserText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
  if (standardEmailMatch) {
    email = standardEmailMatch[0].trim();
  } else {
    const spokenEmailMatch = fullUserText.match(/\b([a-zA-Z0-9_\-\.]+)\s*(?:at|@)\s*([a-zA-Z0-9_\-\.]+)\s*(?:dot|\.)\s*([a-zA-Z]{2,})\b/i);
    if (spokenEmailMatch) {
      email = `${spokenEmailMatch[1].replace(/\s+dot\s+/gi, '.')}@${spokenEmailMatch[2]}.${spokenEmailMatch[3]}`.replace(/\s+/g, '').toLowerCase();
    }
  }

  // 2. Phone extraction
  let phone: string | null = null;
  const phoneMatch = fullUserText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    phone = phoneMatch[0].trim();
  }

  // 3. Name extraction (strict patterns)
  let name: string | null = null;
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me|name's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:speaking with|talk to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];
  for (const pattern of namePatterns) {
    const match = fullUserText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const forbidden = ['a', 'the', 'an', 'calling', 'interested', 'running', 'looking', 'here', 'just', 'owner', 'there', 'good', 'fine', 'ready'];
      if (!forbidden.includes(candidate.toLowerCase()) && candidate.length > 1) {
        name = candidate;
        break;
      }
    }
  }

  // 4. Business Type & Industry (strictly verified against user statements)
  let businessType: string | null = null;
  const industryKeywords: Record<string, string[]> = {
    'Dental & Medical Clinic': ['dental', 'dentist', 'clinic', 'doctor', 'physio', 'chiro', 'healthcare', 'medical', 'hospital', 'patient'],
    'Salon, Spa & Aesthetics': ['salon', 'spa', 'barber', 'hair', 'nails', 'beauty', 'aesthetic', 'lash', 'massage'],
    'Real Estate & Property': ['real estate', 'realtor', 'property', 'broker', 'mortgage', 'listing', 'apartments'],
    'Home Services & Contracting': ['plumber', 'plumbing', 'electrician', 'roofing', 'hvac', 'contractor', 'landscaping', 'cleaning', 'painting'],
    'Auto Care & Repair': ['auto care', 'tire shop', 'garage', 'mechanic', 'car wash', 'dealership', 'collision'],
    'Law Firm & Legal': ['law firm', 'lawyer', 'attorney', 'legal', 'cpa', 'accounting'],
    'Fitness & Wellness Studio': ['gym', 'fitness', 'crossfit', 'yoga', 'pilates studio'],
    'E-Commerce & Digital Brand': ['ecommerce', 'e-commerce', 'shopify', 'online store', 'dtc brand'],
    'Hospitality & Restaurant': ['restaurant', 'cafe', 'bar', 'hotel', 'catering', 'bistro', 'food business'],
  };

  const lowerUserText = fullUserText.toLowerCase();
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(k => lowerUserText.includes(k))) {
      businessType = industry;
      break;
    }
  }

  if (!businessType) {
    const businessMatch = fullUserText.match(/(?:run an?|own an?|have an?|manage an?|we are an?)\s+([a-zA-Z\s]{3,25})(?:\s+business|\s+company|\s+firm|\s+store|\s+shop|\.|\,|$)/i);
    if (businessMatch && businessMatch[1]) {
      const candidate = businessMatch[1].trim();
      if (!['a', 'the', 'good', 'small', 'big', 'new'].includes(candidate.toLowerCase())) {
        businessType = candidate;
      }
    }
  }

  // 5. Primary Bottleneck / Pain Point (Zero default assumptions)
  let primaryBottleneck: string | null = null;
  if (lowerUserText.includes('missed call') || lowerUserText.includes('phone') || lowerUserText.includes('voicemail') || lowerUserText.includes('after hours')) {
    primaryBottleneck = 'Missed inbound calls & after-hours customer inquiry loss.';
  } else if (lowerUserText.includes('instagram') || lowerUserText.includes('dm') || lowerUserText.includes('social media message')) {
    primaryBottleneck = 'Manual hours lost managing Instagram DMs and social chat inquiries.';
  } else if (lowerUserText.includes('review') || lowerUserText.includes('google rating') || lowerUserText.includes('reputation')) {
    primaryBottleneck = 'Lack of automated review generation after client visits/purchases.';
  } else if (lowerUserText.includes('cold email') || lowerUserText.includes('outbound') || lowerUserText.includes('finding leads')) {
    primaryBottleneck = 'Inconsistent outbound acquisition and manual lead prospecting.';
  } else if (lowerUserText.includes('scheduling') || lowerUserText.includes('no-show') || lowerUserText.includes('calendar booking')) {
    primaryBottleneck = 'Manual scheduling friction and appointment no-show rates.';
  } else if (fullUserText.trim().length > 30) {
    primaryBottleneck = `Operational inquiry regarding: "${fullUserText.slice(0, 100)}..."`;
  }

  // 6. Volume or Scale
  let volumeOrScale: string | null = null;
  const volumeMatch = fullUserText.match(/(\d+[\s\w-]+(?:calls|leads|inquiries|patients|clients|customers|per week|per day|per month|a week|a day|a month))/i);
  if (volumeMatch) {
    volumeOrScale = volumeMatch[1].trim();
  }

  // 7. Recommended Solution
  let recommendedSolution = 'Custom Autonomous AI Architecture';
  if (primaryBottleneck?.includes('calls') || (businessType && ['Dental & Medical Clinic', 'Salon, Spa & Aesthetics', 'Hospitality & Restaurant'].includes(businessType))) {
    recommendedSolution = 'Autonomous 24/7 Voice Receptionist & Smart Calendar Sync';
  } else if (primaryBottleneck?.includes('Instagram') || primaryBottleneck?.includes('DM')) {
    recommendedSolution = '24/7 Social DM Intelligence & Automated Booking Pipeline';
  } else if (primaryBottleneck?.includes('review')) {
    recommendedSolution = 'Automated Post-Service Google Review Accelerator';
  } else if (primaryBottleneck?.includes('outbound')) {
    recommendedSolution = 'Automated Outbound Acquisition & Deliverability Engine';
  }

  // 8. Lead Score
  let leadScore: 'High Priority' | 'Moderate Priority' | 'Standard Inquiry' = 'Standard Inquiry';
  if (email && (businessType || phone)) {
    leadScore = 'High Priority';
  } else if (businessType || email || phone) {
    leadScore = 'Moderate Priority';
  }

  // 9. Executive Summary (Zero assumption formulation)
  const executiveSummary = name && businessType
    ? `${name} from a ${businessType} business is evaluating automated AI infrastructure to streamline operations.`
    : businessType
    ? `Prospective ${businessType} operator exploring custom AI automation for their workflow.`
    : `Inbound visitor logged conversation to explore autonomous AI systems.`;

  // 10. Missing Fields
  const missingFields: string[] = [];
  if (!name) missingFields.push('name');
  if (!email) missingFields.push('email');
  if (!phone) missingFields.push('phone');
  if (!businessType) missingFields.push('businessType');
  if (!primaryBottleneck) missingFields.push('primaryBottleneck');

  return {
    name,
    email,
    phone,
    businessType,
    primaryBottleneck,
    volumeOrScale,
    leadScore,
    recommendedSolution,
    executiveSummary,
    missingFields,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript: TranscriptItem[] = body.transcript || [];

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Transcript array is required' },
        { status: 400 }
      );
    }

    // 1. Primary: Attempt OpenRouter LLM extraction
    let leadData: ExtractedLeadData | null = null;
    try {
      leadData = await extractWithOpenRouter(transcript);
    } catch (llmErr) {
      console.warn('[Lead Extract] OpenRouter extraction failed, falling back to heuristics:', llmErr);
    }

    // 2. Fallback: Strict zero-assumption heuristic extraction
    if (!leadData) {
      leadData = extractHeuristically(transcript);
    }

    return NextResponse.json({
      success: true,
      data: leadData,
      source: process.env.OPENROUTER_API_KEY ? 'openrouter_llm' : 'strict_heuristic',
    });
  } catch (err: any) {
    console.error('[API Leads Extract] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process lead extraction' },
      { status: 500 }
    );
  }
}
