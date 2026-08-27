import { NextResponse } from 'next/server';

export interface LeadSubmissionPayload {
  source: 'voice_receptionist_demo' | 'website_chat_assistant';
  sessionId: string;
  lead: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    businessType?: string | null;
    primaryBottleneck?: string | null;
    volumeOrScale?: string | null;
    leadScore?: string;
    recommendedSolution?: string;
    executiveSummary?: string;
  };
  transcript?: Array<{ role: string; text: string; time?: number | string }>;
  timestamp?: string;
}

export async function POST(req: Request) {
  try {
    const payload: LeadSubmissionPayload = await req.json();
    const { source, sessionId, lead, transcript, timestamp = new Date().toISOString() } = payload;

    if (!lead) {
      return NextResponse.json({ error: 'Lead data is required.' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    let n8nSuccess = false;

    // 1. Forward lead data to n8n Webhook for automated CRM/Email/Database dispatch
    if (n8nWebhookUrl) {
      try {
        const n8nRes = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'lead_captured',
            source,
            sessionId,
            lead,
            transcript,
            timestamp,
            notificationTarget: 'taskengin3@gmail.com',
          }),
        });
        n8nSuccess = n8nRes.ok;
      } catch (webhookErr) {
        console.warn('[Leads API] n8n forwarding error:', webhookErr);
      }
    }

    // 2. Structured log for server observability
    console.log('[Leads API] Captured Lead:', {
      source,
      name: lead.name || 'Anonymous',
      email: lead.email || 'None',
      phone: lead.phone || 'None',
      businessType: lead.businessType,
      leadScore: lead.leadScore,
      bottleneck: lead.primaryBottleneck,
      n8nForwarded: n8nSuccess,
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead captured and queued successfully.',
      n8nForwarded: n8nSuccess,
      leadId: `lead_${Date.now()}`,
    });
  } catch (error) {
    console.error('[Leads API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process lead submission.' },
      { status: 500 }
    );
  }
}
