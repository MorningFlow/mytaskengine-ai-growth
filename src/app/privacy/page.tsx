import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | MyTaskEngine',
  description: 'How MyTaskEngine collects, uses, and protects your personal information.',
}

const EFFECTIVE = 'August 19, 2026'

export default function PrivacyPolicy() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16C784', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 32 }}>
          ← Back to MyTaskEngine
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16C784', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
            Legal
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 52px)', color: '#0D1117', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'var(--font-body)' }}>
            Effective date: {EFFECTIVE} &nbsp;·&nbsp; Last updated: {EFFECTIVE}
          </p>
        </div>

        <div className="legal-body">

          <p>MyTaskEngine (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website at <strong>mytaskengine.com</strong>. This Privacy Policy explains what personal information we collect when you visit our website or interact with our AI-powered tools, how we use it, who we share it with, and what rights you have.</p>

          <p>We are committed to complying with India&rsquo;s <strong>Digital Personal Data Protection Act 2023 (DPDPA)</strong> and, to the extent applicable, the European Union&rsquo;s <strong>General Data Protection Regulation (GDPR)</strong>.</p>

          <h2>1. Who We Are</h2>
          <p>MyTaskEngine is an AI automation agency that builds and deploys AI systems for growth-focused business owners. Our contact details:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a></li>
            <li><strong>Website:</strong> mytaskengine.com</li>
            <li><strong>Location:</strong> India</li>
          </ul>
          <p>For privacy-related requests — including data access, correction, or deletion — contact us at the email above.</p>

          <h2>2. What Data We Collect and Why</h2>

          <h3>2.1 AI Chat Messages</h3>
          <p>When you type a message in our AI chat assistant (the green floating button labelled &ldquo;Aria&rdquo;), your message text is sent to our server and forwarded to an automated workflow running on <strong>n8n</strong> (our AI processing platform) to generate a reply. We also assign you a <strong>session ID</strong> — a randomly generated identifier stored in your browser&rsquo;s <code>sessionStorage</code> — to maintain context within a single browser tab. This session ID is deleted automatically when you close the tab.</p>
          <p><strong>Purpose:</strong> To answer your questions about our services and qualify potential engagements.</p>

          <h3>2.2 Voice Audio</h3>
          <p>When you use our &ldquo;Talk to Aria&rdquo; AI Receptionist Demo, your browser requests access to your microphone. With your permission, your voice audio is captured and streamed in real-time to <strong>Deepgram, Inc.</strong> (our voice AI provider) for speech recognition and AI agent processing. Deepgram processes the audio to generate live transcripts and agent responses. We do not receive or store a recording of your voice on our servers. Deepgram&rsquo;s default configuration does not retain audio after processing.</p>
          <p><strong>Purpose:</strong> To demonstrate our AI Receptionist product capability to prospective clients.</p>

          <h3>2.3 Booking Information</h3>
          <p>When you book a free 30-minute audit call via the &ldquo;Book Free Audit&rdquo; buttons on our site, you are using the <strong>Cal.com</strong> scheduling platform. Cal.com collects your name, email address, phone number (optional), and your chosen appointment slot. This data is stored and managed by Cal.com under their own privacy policy. We receive a copy of your booking details to conduct the call.</p>
          <p><strong>Purpose:</strong> To schedule and conduct a business consultation.</p>

          <h3>2.4 Technical and Server Data</h3>
          <p>Our web hosting provider (<strong>Vercel</strong>) and our API routes automatically collect standard server-side information including your <strong>IP address</strong>, browser type, operating system, referring URL, and timestamps when you make requests to our website or APIs (including the chat and voice demo endpoints). This data is used for security, performance monitoring, and abuse prevention.</p>
          <p><strong>Purpose:</strong> Website operation, security, and fraud prevention.</p>

          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To respond to your enquiries and provide our services</li>
            <li>To conduct and follow up on your booked consultation calls</li>
            <li>To operate, maintain, and improve our AI demo tools</li>
            <li>To detect and prevent abuse of our AI chat and voice interfaces</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to any third party. We do not use your data for advertising profiling.</p>

          <h2>4. Sub-processors (Third-Party Services)</h2>
          <p>We use the following third-party services that may process personal data on our behalf:</p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Location</th>
                  <th>Privacy Policy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cal.com</td>
                  <td>Appointment booking</td>
                  <td>USA</td>
                  <td><a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer">cal.com/privacy</a></td>
                </tr>
                <tr>
                  <td>Deepgram, Inc.</td>
                  <td>Voice AI (speech recognition)</td>
                  <td>USA</td>
                  <td><a href="https://deepgram.com/privacy" target="_blank" rel="noopener noreferrer">deepgram.com/privacy</a></td>
                </tr>
                <tr>
                  <td>n8n</td>
                  <td>AI chat automation workflow</td>
                  <td>Cloud (EU/USA)</td>
                  <td><a href="https://n8n.io/legal/privacy" target="_blank" rel="noopener noreferrer">n8n.io/legal/privacy</a></td>
                </tr>
                <tr>
                  <td>Vercel, Inc.</td>
                  <td>Web hosting and CDN</td>
                  <td>USA</td>
                  <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>5. International Data Transfers</h2>
          <p>Our sub-processors (Deepgram, Cal.com, Vercel) are based in the United States. If you are located in the European Economic Area (EEA), United Kingdom, or another jurisdiction with data transfer restrictions, your personal data may be transferred internationally. We rely on standard contractual clauses and the sub-processors&rsquo; own compliance frameworks (e.g., EU-U.S. Data Privacy Framework) for such transfers.</p>

          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Session IDs:</strong> Deleted automatically when your browser tab is closed.</li>
            <li><strong>Chat messages:</strong> Retained on our n8n workflow for up to 90 days for support quality purposes, then deleted.</li>
            <li><strong>Voice audio:</strong> Not retained by us. Deepgram&rsquo;s default setting does not store audio after processing.</li>
            <li><strong>Booking data:</strong> Retained by Cal.com per their policy; we retain a copy of booking details for 2 years for business records.</li>
            <li><strong>Server logs:</strong> Retained by Vercel for up to 30 days.</li>
          </ul>

          <h2>7. Cookies and Tracking</h2>
          <p>We use <strong>sessionStorage</strong> (not a cookie) to store your chat session ID — this is cleared when the tab is closed and is never shared with third parties.</p>
          <p>When you consent to cookies, we load the <strong>Cal.com embed script</strong>, which may set functional cookies to manage the booking widget. No advertising or tracking cookies are used on this website.</p>
          <p>See our <Link href="/cookies">Cookie Policy</Link> for full details.</p>

          <h2>8. Your Rights</h2>
          <p>Depending on your location, you have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Ask us to correct inaccurate data.</li>
            <li><strong>Deletion:</strong> Ask us to delete your personal data (subject to legal retention obligations).</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Withdraw consent:</strong> Where we rely on consent, you can withdraw it at any time (this does not affect prior processing).</li>
          </ul>
          <p>To exercise any right, email <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a>. We will respond within 30 days.</p>

          <h2>9. Children&rsquo;s Privacy</h2>
          <p>Our services are intended for business owners and professionals. We do not knowingly collect personal data from individuals under 18 years of age. If we become aware that we have collected data from a minor, we will delete it promptly.</p>

          <h2>10. Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your personal data, including HTTPS encryption for all data in transit, access controls on our internal systems, and using reputable third-party infrastructure providers with their own security certifications.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page. For material changes, we will post a notice on our website. Your continued use of the site after changes constitutes acceptance of the updated policy.</p>

          <h2>12. Contact Us</h2>
          <p>For any questions, concerns, or requests related to this Privacy Policy or your personal data:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a></li>
            <li><strong>Website:</strong> <Link href="/">mytaskengine.com</Link></li>
          </ul>
          <p>Under India&rsquo;s DPDPA, you may also file a complaint with the <strong>Data Protection Board of India</strong> if you believe we have violated your data rights.</p>

        </div>
      </div>

      <style>{`
        .legal-body { font-family: var(--font-body); color: #374151; font-size: 15px; line-height: 1.8; }
        .legal-body p { margin: 0 0 20px; }
        .legal-body h2 { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: #0D1117; margin: 48px 0 16px; letter-spacing: -0.01em; padding-top: 16px; border-top: 1px solid #F3F4F6; }
        .legal-body h3 { font-family: var(--font-display); font-weight: 600; font-size: 17px; color: #0D1117; margin: 28px 0 12px; }
        .legal-body ul { margin: 0 0 20px; padding-left: 24px; }
        .legal-body li { margin-bottom: 8px; }
        .legal-body a { color: #16C784; text-decoration: underline; text-underline-offset: 3px; }
        .legal-body a:hover { opacity: 0.8; }
        .legal-body strong { color: #0D1117; font-weight: 600; }
        .legal-body code { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1px 6px; font-size: 13px; }
        .legal-body table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .legal-body th { text-align: left; padding: 10px 14px; background: #F9FAFB; border: 1px solid #E5E7EB; font-weight: 600; color: #0D1117; }
        .legal-body td { padding: 10px 14px; border: 1px solid #E5E7EB; vertical-align: top; }
      `}</style>
    </main>
  )
}
