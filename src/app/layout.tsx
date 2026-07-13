import type { Metadata } from 'next'
import { bricolage, jakarta } from './fonts'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CalEmbed from '@/components/ui/CalEmbed'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://mytaskengine.com'),
  title: 'MyTaskEngine | AI Systems for Growth-Focused Business Owners',
  description: 'You run the business. The systems run the busywork, from the DMs and bookings to the follow-up and the 5-star reviews that used to slip through the cracks.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'MyTaskEngine | The Engine Room',
    description: 'Your AI-powered business automation partner.',
    url: 'https://mytaskengine.com',
    siteName: 'MyTaskEngine',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-body)', background: 'var(--color-white)', color: 'var(--color-ink)' }}>
        <CalEmbed />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
