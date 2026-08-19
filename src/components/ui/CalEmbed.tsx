'use client'
import { useEffect, useRef } from 'react'
import { CONSENT_EVENT, getStoredConsent, type ConsentValue } from '@/components/ui/CookieConsent'

/**
 * Loads and initialises the Cal.com embed script ONLY after the user has
 * accepted cookies. Listens for the mte:consent-update custom event so that
 * consent given on the same page load is handled immediately.
 */
export default function CalEmbed() {
  const loaded = useRef(false)

  function initCal() {
    if (loaded.current) return
    loaded.current = true

    ;(function (C: any, A: string, L: string) {
      const p = (a: any, ar: any) => { a.q.push(ar) }
      const d = C.document
      C.Cal =
        C.Cal ||
        function (...args: any[]) {
          const cal = C.Cal
          if (!cal.loaded) {
            cal.ns = {}
            cal.q = cal.q || []
            d.head.appendChild(d.createElement('script')).src = A
            cal.loaded = true
          }
          if (args[0] === L) {
            const api: any = (...a: any[]) => { p(api, a) }
            const namespace = args[1]
            api.q = api.q || []
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api
              p(cal.ns[namespace], args)
              p(cal, ['initNamespace', namespace])
            } else {
              p(cal, args)
            }
            return
          }
          p(cal, args)
        }
    })(window, 'https://app.cal.com/embed/embed.js', 'init')

    const Cal = (window as any).Cal
    if (Cal) {
      Cal('init', '30min', { origin: 'https://app.cal.com' })
      Cal.ns['30min']('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#0F1720' },
          dark:  { 'cal-brand': '#0F1720' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
      Cal.ns['30min']('preload', { calLink: 'mytaskengine/30min' })
    }
  }

  useEffect(() => {
    // Returning visitor — consent already stored
    if (getStoredConsent() === 'accepted') {
      initCal()
      return
    }

    // First visit — wait for the banner decision
    const handler = (e: Event) => {
      if ((e as CustomEvent<ConsentValue>).detail === 'accepted') {
        initCal()
      }
    }
    window.addEventListener(CONSENT_EVENT, handler)
    return () => window.removeEventListener(CONSENT_EVENT, handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
