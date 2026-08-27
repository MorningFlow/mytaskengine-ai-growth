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

const FALLBACK_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
];

/**
 * OpenRouter Structured LLM Extraction Engine.
 * Utilizes multi-model failover with zero-hallucination prompt constraints.
 */
async function extractWithOpenRouter(transcript: TranscriptItem[]): Promise<ExtractedLeadData | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const preferredModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];

  const formattedTranscript = transcript
    .map(t => `[${t.role === 'assistant' || t.role === 'bot' ? 'Aria' : 'Caller'}]: ${t.text}`)
    .join('\n');

  const systemPrompt = `You are a high-precision, zero-hallucination Lead Intelligence Extractor for MyTaskEngine.
Analyze the conversation transcript between Aria (AI Assistant) and the Caller, and extract structured business intelligence.

CRITICAL RULES:
1. Extract ONLY information explicitly stated by the caller.
2. If a field was NOT mentioned, not provided, or remains ambiguous, set it strictly to null.
3. NEVER guess or invent contact information, caller name, or email.
4. For industry and bottlenecks, synthesize what the caller described into clear, professional business terminology (e.g. "I'm a social media influencer" -> businessType: "Social Media & Content Creation", primaryBottleneck: "Managing brand partnerships, sponsor outreach, and high-volume DM inquiries").
5. Return ONLY a valid, raw JSON object matching the requested schema. Do NOT include markdown code blocks, backticks, or explanatory text.`;

  const userPrompt = `Conversation Transcript:
${formattedTranscript}

Extract the structured lead JSON with this exact TypeScript structure:
{
  "name": string | null (Caller's explicit name, or null if unstated),
  "email": string | null (Caller's explicit email, or null if unstated),
  "phone": string | null (Caller's explicit phone number, or null if unstated),
  "businessType": string | null (Exact business type or industry stated by caller, e.g. "Social Media & Content Creation", "Dental Clinic", "E-Commerce", or null if not stated),
  "primaryBottleneck": string | null (Synthesized professional description of their operational challenge, manual tasks, or inquiry, or null if unstated),
  "volumeOrScale": string | null (Follower count, call volume, customer count, or scale mentioned, or null if unstated),
  "leadScore": "High Priority" | "Moderate Priority" | "Standard Inquiry" (High if email provided, Moderate if business/problem provided, Standard if only casual inquiry),
  "recommendedSolution": string (Matching MyTaskEngine AI system, e.g. "24/7 Social DM Intelligence & Brand Deal Pipeline", "Autonomous 24/7 Voice Receptionist", "Automated Outbound Acquisition Engine", or "Custom Autonomous AI Architecture"),
  "executiveSummary": string (1-2 sentence professional executive summary of the caller's profile and inquiry),
  "missingFields": string[] (List of missing parameters from: ["name", "email", "phone", "businessType", "primaryBottleneck"])
}`;

  for (const model of modelsToTry) {
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
        console.warn(`[OpenRouter Extract] Model ${model} returned HTTP ${res.status}, trying next model...`);
        continue;
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: ExtractedLeadData = JSON.parse(cleaned);

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
      console.warn(`[OpenRouter Extract] Error on model ${model}:`, err);
    }
  }

  return null;
}

/**
 * Intelligent Semantic Heuristic Parser.
 * Handles comprehensive industry and bottleneck mapping when LLM API is unavailable.
 */
function extractHeuristically(transcript: TranscriptItem[]): ExtractedLeadData {
  const fullUserText = transcript
    .filter(t => t.role === 'user')
    .map(t => t.text)
    .join(' ');

  const lowerUserText = fullUserText.toLowerCase();

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

  // 3. Name extraction
  let name: string | null = null;
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me|name's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:speaking with|talk to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];
  for (const pattern of namePatterns) {
    const match = fullUserText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const forbidden = ['a', 'the', 'an', 'calling', 'interested', 'running', 'looking', 'here', 'just', 'owner', 'there', 'good', 'fine', 'ready', 'social', 'media', 'influencer'];
      if (!forbidden.includes(candidate.toLowerCase()) && candidate.length > 1) {
        name = candidate;
        break;
      }
    }
  }

  // 4. Comprehensive Industry Classification
  let businessType: string | null = null;
  const industryKeywords: Record<string, string[]> = {
    'Social Media & Creator Economy': ['influencer', 'creator', 'social media', 'youtube', 'content creator', 'tiktok', 'instagrammer', 'podcast', 'streamer'],
    'Dental & Medical Clinic': ['dental', 'dentist', 'clinic', 'doctor', 'physio', 'chiro', 'healthcare', 'medical', 'hospital', 'patient'],
    'Salon, Spa & Aesthetics': ['salon', 'spa', 'barber', 'hair', 'nails', 'beauty', 'aesthetic', 'lash', 'massage'],
    'Real Estate & Property': ['real estate', 'realtor', 'property', 'broker', 'mortgage', 'listing', 'apartments'],
    'Home Services & Contracting': ['plumber', 'plumbing', 'electrician', 'roofing', 'hvac', 'contractor', 'landscaping', 'cleaning', 'painting'],
    'Auto Care & Repair': ['auto care', 'tire shop', 'garage', 'mechanic', 'car wash', 'dealership', 'collision'],
    'Marketing Agency & Creative': ['agency', 'marketing', 'media firm', 'creative agency', 'seo agency', 'ad agency'],
    'Law Firm & Professional Services': ['law firm', 'lawyer', 'attorney', 'legal', 'cpa', 'accounting', 'consulting'],
    'Fitness & Wellness Studio': ['gym', 'fitness', 'crossfit', 'yoga', 'pilates studio', 'personal trainer'],
    'E-Commerce & Digital Brand': ['ecommerce', 'e-commerce', 'shopify', 'online store', 'dtc brand', 'dropshipping'],
    'Hospitality & Restaurant': ['restaurant', 'cafe', 'bar', 'hotel', 'catering', 'bistro', 'food business'],
  };

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

  // 5. Professional Synthesized Bottleneck Analysis
  let primaryBottleneck: string | null = null;
  if (lowerUserText.includes('influencer') || lowerUserText.includes('social media') || lowerUserText.includes('creator') || lowerUserText.includes('instagram')) {
    primaryBottleneck = 'Managing high-volume sponsorship outreach, brand collaboration inquiries, and social DM conversion.';
  } else if (lowerUserText.includes('missed call') || lowerUserText.includes('phone') || lowerUserText.includes('voicemail') || lowerUserText.includes('after hours') || lowerUserText.includes('receptionist')) {
    primaryBottleneck = 'Losing prospective clients and revenue to voicemail outside business hours and during peak reception times.';
  } else if (lowerUserText.includes('dm') || lowerUserText.includes('message') || lowerUserText.includes('chat')) {
    primaryBottleneck = 'Staff spending excessive manual hours responding to inbound DMs and qualifying social leads.';
  } else if (lowerUserText.includes('review') || lowerUserText.includes('google rating') || lowerUserText.includes('reputation')) {
    primaryBottleneck = 'Lack of an automated pipeline to capture 5-star Google reviews from satisfied clients after service.';
  } else if (lowerUserText.includes('cold email') || lowerUserText.includes('outbound') || lowerUserText.includes('finding leads') || lowerUserText.includes('pipeline')) {
    primaryBottleneck = 'Inconsistent B2B outbound pipeline and time-consuming manual lead prospecting.';
  } else if (lowerUserText.includes('scheduling') || lowerUserText.includes('no-show') || lowerUserText.includes('calendar booking') || lowerUserText.includes('appointments')) {
    primaryBottleneck = 'Manual appointment scheduling friction and revenue lost to patient/client no-shows.';
  } else if (fullUserText.trim().length > 20) {
    primaryBottleneck = 'Evaluating autonomous AI automation to streamline manual workflows and accelerate lead response times.';
  }

  // 6. Volume or Scale
  let volumeOrScale: string | null = null;
  const volumeMatch = fullUserText.match(/(\d+[\s\w-]+(?:calls|leads|inquiries|patients|clients|customers|followers|subscribers|per week|per day|per month|a week|a day|a month))/i);
  if (volumeMatch) {
    volumeOrScale = volumeMatch[1].trim();
  }

  // 7. Recommended Solution
  let recommendedSolution = 'Custom Autonomous AI Workflow Architecture';
  if (businessType === 'Social Media & Creator Economy' || lowerUserText.includes('influencer') || lowerUserText.includes('instagram')) {
    recommendedSolution = '24/7 Social DM Intelligence & Brand Sponsorship Conversion Pipeline';
  } else if (primaryBottleneck?.includes('voicemail') || primaryBottleneck?.includes('calls') || (businessType && ['Dental & Medical Clinic', 'Salon, Spa & Aesthetics', 'Hospitality & Restaurant', 'Home Services & Contracting'].includes(businessType))) {
    recommendedSolution = 'Autonomous 24/7 Voice Receptionist & Smart Calendar Sync';
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

  // 9. Executive Summary
  const executiveSummary = name && businessType
    ? `${name} from ${businessType} is exploring custom AI automation to streamline ${primaryBottleneck ? primaryBottleneck.toLowerCase() : 'operational workflows'}.`
    : businessType
    ? `Prospective ${businessType} operator looking to deploy autonomous AI systems to eliminate operational friction.`
    : `Inbound prospect inquiring about tailored AI infrastructure to automate routine workflows.`;

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

    // 2. Fallback: Refined semantic heuristic extraction
    if (!leadData) {
      leadData = extractHeuristically(transcript);
    }

    return NextResponse.json({
      success: true,
      data: leadData,
      source: process.env.OPENROUTER_API_KEY ? 'openrouter_llm' : 'semantic_heuristic',
    });
  } catch (err: any) {
    console.error('[API Leads Extract] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process lead extraction' },
      { status: 500 }
    );
  }
}
