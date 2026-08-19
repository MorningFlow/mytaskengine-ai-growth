import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | MyTaskEngine',
  description: 'Terms and conditions governing the use of MyTaskEngine services.',
}

const EFFECTIVE = 'August 19, 2026'

export default function TermsOfService() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16C784', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 32 }}>
          ← Back to MyTaskEngine
        </Link>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16C784', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
            Legal
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 52px)', color: '#0D1117', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'var(--font-body)' }}>
            Effective date: {EFFECTIVE} &nbsp;·&nbsp; Last updated: {EFFECTIVE}
          </p>
        </div>

        <div className="legal-body">

          <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the MyTaskEngine website at <strong>mytaskengine.com</strong> and any AI systems, automation services, or digital products (&ldquo;Services&rdquo;) provided by MyTaskEngine (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing the website or booking a consultation, you agree to these Terms.</p>

          <h2>1. About Our Services</h2>
          <p>MyTaskEngine is an AI automation agency. We design, build, and deploy AI-powered business systems including AI receptionists, lead management automations, reputation management systems, DM automation, and custom web and mobile applications. All engagements begin with a free, no-obligation 30-minute audit call.</p>

          <h2>2. The Free Audit Call</h2>
          <p>The free 30-minute audit call (&ldquo;Audit&rdquo;) is a no-commitment consultation. Booking an Audit does not create a contract, obligation to purchase, or any binding engagement. We reserve the right to limit the number of Audits available per week. We may decline to proceed with an engagement if we determine the fit is not suitable — and we will tell you that honestly on the call.</p>

          <h2>3. Paid Engagements</h2>
          <p>All paid work is governed by a separate written agreement (proposal or contract) agreed upon between MyTaskEngine and the client before work begins. These Terms apply in the absence of, or in addition to, any such specific agreement.</p>

          <h3>3.1 Payments</h3>
          <p>Fees for projects and retainers are specified in individual proposals. Unless otherwise agreed in writing:</p>
          <ul>
            <li>Projects are typically structured with a deposit (50%) due before work begins and the balance due upon delivery or a milestone agreed in writing.</li>
            <li>Invoices are due within 14 days of issue.</li>
            <li>Late payments may attract interest of 2% per month on overdue balances.</li>
            <li>We accept payments via bank transfer, UPI, or other methods agreed in writing.</li>
            <li>Prices are quoted in Indian Rupees (INR) or US Dollars (USD) as stated in each proposal. Where applicable, GST will be charged in addition to quoted fees.</li>
          </ul>

          <h3>3.2 Cancellation and Refunds</h3>
          <ul>
            <li><strong>Before work begins:</strong> If you cancel a project before any work has commenced, any deposit paid will be refunded in full within 14 days.</li>
            <li><strong>After work has begun:</strong> If you cancel a project after work has commenced, you are liable for the cost of work completed to the date of cancellation. Any deposit paid will be applied against this amount. Any remaining balance will be refunded, or any shortfall will be invoiced.</li>
            <li><strong>Retainers:</strong> Retainer agreements may be cancelled with 30 days&rsquo; written notice. Fees paid for services already delivered are non-refundable.</li>
            <li><strong>Dissatisfaction:</strong> If you are not satisfied with delivered work, please contact us at <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a>. We will make reasonable efforts to address concerns. Refunds for completed and delivered work are at our sole discretion.</li>
          </ul>

          <h2>4. AI Tools on This Website</h2>
          <p>This website includes two interactive AI tools for demonstration purposes:</p>
          <ul>
            <li><strong>AI Chat Assistant (&ldquo;Aria&rdquo;):</strong> A text-based AI chat widget that answers questions about our services. Powered by an n8n automation workflow.</li>
            <li><strong>AI Receptionist Voice Demo (&ldquo;Talk to Aria&rdquo;):</strong> A live 1-minute voice AI demo. Requires microphone access. Powered by Deepgram&rsquo;s Voice Agent technology. Limited to approximately 1 minute per session for demonstration purposes.</li>
          </ul>
          <p>These tools are provided for informational and demonstration purposes only. They are not a substitute for professional advice. Responses generated by these tools may be incomplete, inaccurate, or unsuitable for your specific situation.</p>

          <h2>5. Disclaimer of Warranties</h2>
          <p>THE WEBSITE AND ALL DEMO TOOLS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          <p>We do not warrant that:</p>
          <ul>
            <li>The website will be uninterrupted, error-free, or free of viruses;</li>
            <li>AI-generated responses (chat or voice) will be accurate, complete, or suitable for any particular purpose;</li>
            <li>Results or revenue improvements described on this website (including ROI calculator projections) will be achieved by any specific client.</li>
          </ul>

          <h2>6. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MYTASKENGINE AND ITS DIRECTORS, EMPLOYEES, AND CONTRACTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE WEBSITE OR SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR OUR SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 3 MONTHS PRECEDING THE CLAIM, OR INR 10,000 (WHICHEVER IS GREATER).</p>

          <h2>7. Intellectual Property</h2>
          <h3>7.1 Our Content</h3>
          <p>All content on this website — including text, graphics, logos, video, and code — is owned by or licensed to MyTaskEngine. You may not reproduce, distribute, or create derivative works without our written permission.</p>

          <h3>7.2 Client Deliverables</h3>
          <p>Upon receipt of full payment for a project, intellectual property rights in the custom deliverables (e.g., custom-built automations, websites, or applications) transfer to the client, except for:</p>
          <ul>
            <li>Any third-party tools, libraries, or platforms incorporated in the deliverable (which remain subject to their respective licences);</li>
            <li>Any pre-existing proprietary frameworks, templates, or methodologies of MyTaskEngine, which are licensed (not transferred) to the client for their use in the delivered project.</li>
          </ul>

          <h2>8. Acceptable Use</h2>
          <p>You agree not to use this website or our AI tools to:</p>
          <ul>
            <li>Submit false, misleading, or malicious content;</li>
            <li>Attempt to extract, reverse-engineer, or circumvent our AI systems&rsquo; instructions or safety measures;</li>
            <li>Engage in harassment, abuse, or illegal activity;</li>
            <li>Overload our systems with automated requests or spam;</li>
            <li>Impersonate any person or entity;</li>
            <li>Violate any applicable law or regulation.</li>
          </ul>
          <p>We reserve the right to block access without notice for violations of these terms.</p>

          <h2>9. Third-Party Services</h2>
          <p>This website integrates with third-party platforms (Cal.com, Deepgram, n8n, Vercel). Your use of these integrations is also subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or conduct of these third-party services.</p>

          <h2>10. Governing Law</h2>
          <p>These Terms are governed by the laws of <strong>India</strong>. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in India. If you are a consumer in the EU/UK, you retain any mandatory legal protections afforded by your local consumer law.</p>

          <h2>11. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date above. Your continued use of the website after changes take effect constitutes acceptance of the revised Terms.</p>

          <h2>12. Contact</h2>
          <p>For any legal or contractual queries:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a></li>
          </ul>

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
      `}</style>
    </main>
  )
}
