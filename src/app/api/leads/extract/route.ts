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
 * Intelligent rule-based & heuristic fallback extraction engine.
 * Ensures robust, zero-latency extraction even in offline or unkeyed environments.
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
    // Spoken email pattern like "john dot doe at gmail dot com"
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
      const forbidden = ['a', 'the', 'an', 'calling', 'interested', 'running', 'looking', 'here', 'just', 'owner'];
      if (!forbidden.includes(candidate.toLowerCase())) {
        name = candidate;
        break;
      }
    }
  }

  // 4. Business Type & Industry
  let businessType: string | null = null;
  const industryKeywords: Record<string, string[]> = {
    'Dental & Medical Clinic': ['dental', 'dentist', 'clinic', 'doctor', 'physio', 'chiro', 'healthcare', 'medical', 'hospital', 'patient'],
    'Salon, Spa & Aesthetics': ['salon', 'spa', 'barber', 'hair', 'nails', 'beauty', 'aesthetic', 'lash', 'massage'],
    'Real Estate & Property': ['real estate', 'realtor', 'property', 'broker', 'mortgage', 'listing', 'agent', 'apartments'],
    'Home Services & Contracting': ['plumber', 'plumbing', 'electrician', 'roofing', 'hvac', 'contractor', 'landscaping', 'cleaning', 'painting'],
    'Auto Care & Repair': ['auto', 'tire', 'garage', 'mechanic', 'car wash', 'dealership', 'collision'],
    'Law Firm & Professional Services': ['law firm', 'lawyer', 'attorney', 'legal', 'accounting', 'cpa', 'consulting', 'financial'],
    'Fitness & Wellness Studio': ['gym', 'fitness', 'crossfit', 'yoga', 'trainer', 'pilates', 'studio'],
    'E-Commerce & Digital Brand': ['ecommerce', 'e-commerce', 'shopify', 'store', 'brand', 'online store', 'dtc'],
    'Hospitality & Restaurant': ['restaurant', 'cafe', 'bar', 'hotel', 'catering', 'venue'],
  };

  const lowerUserText = fullUserText.toLowerCase();
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(k => lowerUserText.includes(k))) {
      businessType = industry;
      break;
    }
  }

  if (!businessType) {
    const businessMatch = fullUserText.match(/(?:run an?|own an?|have an?|work at an?|manage an?|we are an?)\s+([a-zA-Z\s]{3,25})/i);
    if (businessMatch && businessMatch[1]) {
      businessType = businessMatch[1].trim();
    }
  }

  // 5. Primary Bottleneck / Pain Point
  let primaryBottleneck: string | null = null;
  const bottleneckKeywords: Record<string, string> = {
    'Missed Inbound Calls & After-Hours Loss': 'Losing potential clients to voicemail outside business hours and peak reception times.',
    'Instagram DM & Social Lead Friction': 'Staff spending excessive manual hours responding to DMs and converting chat inquiries.',
    'Sub-Optimal Review Volume & Reputation': 'High customer volume without an automated mechanism to capture 5-star Google reviews.',
    'Slow Inbound Lead Response Latency': 'Inquiries go cold due to delays in manual outreach and follow-up sequences.',
    'Manual Scheduling & High No-Show Rate': 'Time lost managing bookings manually without automated reminders and calendar sync.',
    'Inconsistent Outbound Pipeline Growth': 'Lack of automated, deliverability-optimized outbound lead generation systems.',
  };

  if (lowerUserText.includes('call') || lowerUserText.includes('phone') || lowerUserText.includes('voicemail') || lowerUserText.includes('receptionist') || lowerUserText.includes('after hours')) {
    primaryBottleneck = bottleneckKeywords['Missed Inbound Calls & After-Hours Loss'];
  } else if (lowerUserText.includes('instagram') || lowerUserText.includes('dm') || lowerUserText.includes('message') || lowerUserText.includes('social media')) {
    primaryBottleneck = bottleneckKeywords['Instagram DM & Social Lead Friction'];
  } else if (lowerUserText.includes('review') || lowerUserText.includes('google') || lowerUserText.includes('reputation') || lowerUserText.includes('rating')) {
    primaryBottleneck = bottleneckKeywords['Sub-Optimal Review Volume & Reputation'];
  } else if (lowerUserText.includes('outbound') || lowerUserText.includes('cold email') || lowerUserText.includes('leads') || lowerUserText.includes('pipeline')) {
    primaryBottleneck = bottleneckKeywords['Inconsistent Outbound Pipeline Growth'];
  } else if (lowerUserText.includes('book') || lowerUserText.includes('schedule') || lowerUserText.includes('calendar') || lowerUserText.includes('no-show')) {
    primaryBottleneck = bottleneckKeywords['Manual Scheduling & High No-Show Rate'];
  } else if (lowerUserText.length > 20) {
    primaryBottleneck = fullUserText.slice(0, 160) + '...';
  } else {
    primaryBottleneck = 'Manual workflow friction across lead response and scheduling.';
  }

  // 6. Volume or Scale
  let volumeOrScale: string | null = null;
  const volumeMatch = fullUserText.match(/(\d+[\s\w-]+(?:calls|leads|inquiries|patients|clients|customers|per week|per day|per month|a week|a day|a month))/i);
  if (volumeMatch) {
    volumeOrScale = volumeMatch[1].trim();
  }

  // 7. Recommended Solution
  let recommendedSolution = 'Custom Autonomous AI Workflow Architecture';
  if (primaryBottleneck.includes('Calls') || primaryBottleneck.includes('receptionist') || (businessType && ['Dental & Medical Clinic', 'Salon, Spa & Aesthetics', 'Auto Care & Repair', 'Law Firm & Professional Services'].includes(businessType))) {
    recommendedSolution = 'Autonomous Voice Receptionist & Smart Calendar Booking Integration';
  } else if (primaryBottleneck.includes('Instagram') || primaryBottleneck.includes('DM')) {
    recommendedSolution = '24/7 Social DM Intelligence & Direct Calendar Conversion Pipeline';
  } else if (primaryBottleneck.includes('Review')) {
    recommendedSolution = 'Automated Review Capture & Post-Service Google Reputation Engine';
  } else if (primaryBottleneck.includes('Outbound')) {
    recommendedSolution = 'Automated Outbound Acquisition & Deliverability Pipeline';
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
    ? `${name} from a ${businessType} business is evaluating automated AI infrastructure to resolve: ${primaryBottleneck.toLowerCase()}`
    : businessType
    ? `Prospective ${businessType} operator looking to deploy AI automation for: ${primaryBottleneck.toLowerCase()}`
    : `Inbound prospect inquiring about AI solutions to streamline operational response times and eliminate booking bottlenecks.`;

  // 10. Missing Fields
  const missingFields: string[] = [];
  if (!name) missingFields.push('name');
  if (!email) missingFields.push('email');
  if (!businessType) missingFields.push('businessType');

  return {
    name,
    email,
    phone,
    businessType: businessType || 'General Enterprise / Service Provider',
    primaryBottleneck,
    volumeOrScale: volumeOrScale || 'Estimated 20–50 interactions weekly',
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
        { error: 'Invalid or empty transcript array provided.' },
        { status: 400 }
      );
    }

    const extracted = extractHeuristically(transcript);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error('Lead extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract lead parameters.' },
      { status: 500 }
    );
  }
}
