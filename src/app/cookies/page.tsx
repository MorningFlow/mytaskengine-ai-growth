import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy | MyTaskEngine',
  description: 'What cookies and storage technologies MyTaskEngine uses and how to manage them.',
}

const EFFECTIVE = 'August 19, 2026'

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'var(--font-body)' }}>
            Effective date: {EFFECTIVE} &nbsp;·&nbsp; Last updated: {EFFECTIVE}
          </p>
        </div>

        <div className="legal-body">

          <p>This Cookie Policy explains what cookies and similar storage technologies MyTaskEngine uses on <strong>mytaskengine.com</strong>, what they do, and how you can control them.</p>

          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files that a website stores on your device when you visit. They are widely used to make websites work, remember your preferences, and provide information to website owners. <strong>SessionStorage</strong> is a browser-native storage mechanism similar to cookies but that is automatically cleared when you close a browser tab — it is not transmitted to any server on its own.</p>

          <h2>2. What We Use</h2>

          <h3>2.1 Strictly Necessary (No Consent Required)</h3>
          <div style={{ overflowX: 'auto', margin: '16px 0 24px' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>mte_chat_session</code></td>
                  <td>sessionStorage</td>
                  <td>Stores a random session ID to maintain chat conversation context within your current browser tab.</td>
                  <td>When the tab is closed</td>
                </tr>
                <tr>
                  <td><code>mte_cookie_consent</code></td>
                  <td>localStorage</td>
                  <td>Stores your cookie consent preference so we don&rsquo;t ask again on repeat visits.</td>
                  <td>Until manually cleared</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>These are <strong>first-party</strong> storage items set directly by our website. They contain no personally identifiable information. <code>mte_chat_session</code> holds only a random UUID. Neither is a traditional cookie — they are stored in browser storage APIs and are never sent to a third party.</p>

          <h3>2.2 Functional Cookies (Require Consent)</h3>
          <div style={{ overflowX: 'auto', margin: '16px 0 24px' }}>
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Set When</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cal.com</td>
                  <td>Powers the &ldquo;Book Free Audit&rdquo; scheduling widget. Cal.com may set cookies to manage the booking session, remember your timezone, and maintain state in the booking modal.</td>
                  <td>Only after you accept cookies via our consent banner</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Cal.com&rsquo;s cookies are set by a third-party script loaded from <code>app.cal.com</code>. For full details of what Cal.com stores, see their <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>

          <h3>2.3 No Analytics or Advertising Cookies</h3>
          <p>We do <strong>not</strong> use Google Analytics, Meta Pixel, or any other advertising or behavioural tracking technology on this website. No data is collected for retargeting, profiling, or advertising purposes.</p>

          <h2>3. Voice Demo (Deepgram)</h2>
          <p>When you use the &ldquo;Talk to Aria&rdquo; voice demo, your browser establishes a real-time WebSocket connection to Deepgram&rsquo;s servers. This connection does not use cookies. It processes your voice audio in real time and disconnects when the demo ends. Deepgram does not set any cookies on our website. For more information, see <a href="https://deepgram.com/privacy" target="_blank" rel="noopener noreferrer">Deepgram&rsquo;s Privacy Policy</a>.</p>

          <h2>4. Managing Your Preferences</h2>
          <p>You can manage your cookie choices in several ways:</p>
          <ul>
            <li><strong>Our consent banner:</strong> When you first visit the site, you can accept or decline non-essential cookies. You can reset this preference at any time by clearing your browser&rsquo;s local storage for this site.</li>
            <li><strong>Browser settings:</strong> Most browsers allow you to view and delete cookies and local storage. Refer to your browser&rsquo;s help documentation.</li>
            <li><strong>Opting out of Cal.com:</strong> If you decline cookies, the booking widget will not load. You can still reach us directly at <a href="mailto:hello@mytaskengine.com">hello@mytaskengine.com</a> to arrange a consultation.</li>
          </ul>
          <p>Note: Disabling strictly necessary storage (sessionStorage) may affect the chat widget&rsquo;s ability to maintain conversation context, but will not prevent the site from functioning.</p>

          <h2>5. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects when changes were last made. Continued use of the site constitutes acceptance of the updated policy.</p>

          <h2>6. Contact</h2>
          <p>For questions about our use of cookies or storage technologies:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:hello@mytaskengine.com">hello@mytaskengine.com</a></li>
          </ul>
          <p>Also see our <Link href="/privacy">Privacy Policy</Link> for broader information on how we handle your data.</p>

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
        .legal-body code { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1px 6px; font-size: 13px; font-family: monospace; }
        .legal-body table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .legal-body th { text-align: left; padding: 10px 14px; background: #F9FAFB; border: 1px solid #E5E7EB; font-weight: 600; color: #0D1117; }
        .legal-body td { padding: 10px 14px; border: 1px solid #E5E7EB; vertical-align: top; }
      `}</style>
    </main>
  )
}
