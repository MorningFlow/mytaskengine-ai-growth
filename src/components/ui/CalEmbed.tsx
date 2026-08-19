'use client'
import { useEffect } from 'react'

export default function CalEmbed() {
  useEffect(() => {
    (function (C, A, L) {
      let p = function (a: any, ar: any) {
        a.q.push(ar)
      }
      let d = C.document
      C.Cal =
        C.Cal ||
        function () {
          let cal = C.Cal
          let ar = arguments
          if (!cal.loaded) {
            cal.ns = {}
            cal.q = cal.q || []
            d.head.appendChild(d.createElement('script')).src = A
            cal.loaded = true
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments)
            }
            const namespace = ar[1]
            api.q = api.q || []
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api
              p(cal.ns[namespace], ar)
              p(cal, ['initNamespace', namespace])
            } else p(cal, ar)
            return
          }
          p(cal, ar)
        }
    })(window as any, 'https://app.cal.com/embed/embed.js', 'init')

    const Cal = (window as any).Cal
    if (Cal) {
      Cal('init', '30min', { origin: 'https://app.cal.com' })
      Cal.ns['30min']('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#0F1720' },
          dark: { 'cal-brand': '#0F1720' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
      // Preload the booking modal data to reduce loading time on click
      Cal.ns['30min']('preload', {
        calLink: 'mytaskengine/30min',
      })
    }
  }, [])

  return null
}
