import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Deletion Request | MyTaskEngine',
  description: 'How to request the deletion of your personal data from MyTaskEngine.',
}

export default function DataDeletion() {
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
            Data Privacy
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 52px)', color: '#0D1117', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16 }}>
            Data Deletion Request
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            We respect your privacy and your right to control your personal data. Follow the instructions below to request the deletion of your data from our systems.
          </p>
        </div>

        <div className="legal-body">

          <h2>How to Request Data Deletion</h2>
          <p>
            If you wish to have your personal data permanently removed from our servers and third-party sub-processors, you can submit a Data Deletion Request via email.
          </p>
          
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, margin: '24px 0' }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Submit a Request</h3>
            <p style={{ margin: '12px 0 0' }}>Send an email to our Data Privacy team:</p>
            <p style={{ margin: '8px 0 16px', fontWeight: 600, fontSize: 18 }}>
              <a href="mailto:taskengin3@gmail.com?subject=Data%20Deletion%20Request">taskengin3@gmail.com</a>
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
              <strong>Subject:</strong> Data Deletion Request<br />
              <strong>Body:</strong> Please state clearly that you would like your personal data to be deleted. If you booked a call, please include the email address used for the booking so we can locate your records.
            </p>
          </div>

          <h2>What Happens Next?</h2>
          <ul>
            <li><strong>Verification:</strong> We may ask you to verify your identity to ensure we do not delete data on behalf of an unauthorized person.</li>
            <li><strong>Processing Time:</strong> We will process your request and confirm deletion within 30 days of receiving your email.</li>
            <li><strong>Scope of Deletion:</strong> We will securely erase your personal data from our active systems, including chat logs and booking records. We will also instruct our relevant sub-processors (like Cal.com) to delete your data where applicable.</li>
            <li><strong>Exceptions:</strong> Please note that we may be legally required to retain certain administrative data (such as proof of a commercial transaction or consent records) for a specified period, as permitted by law.</li>
          </ul>

          <h2>Questions?</h2>
          <p>
            If you have any questions about how we handle your data, please review our full <Link href="/privacy">Privacy Policy</Link> or contact us at <a href="mailto:taskengin3@gmail.com">taskengin3@gmail.com</a>.
          </p>

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
