'use client';
import { useEffect } from 'react';

/**
 * Universal Cal.com Modal & Fallback Opener.
 * Opens the native Cal popup modal if loaded, or safely opens in a new tab.
 */
export function openCalModal(calLink = 'mytaskengine/30min', namespace = '30min') {
  if (typeof window === 'undefined') return;

  const Cal = (window as any).Cal;
  if (Cal && Cal.ns && Cal.ns[namespace]) {
    try {
      Cal.ns[namespace]('modal', {
        calLink,
        config: { layout: 'month_view', theme: 'dark' },
      });
      return;
    } catch (e) {
      console.warn('[CalEmbed] Modal trigger fallback:', e);
    }
  }

  // Guaranteed fallback: open in new tab
  window.open(`https://cal.com/${calLink}`, '_blank', 'noopener,noreferrer');
}

export default function CalEmbed() {
  useEffect(() => {
    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            const script = d.createElement('script');
            script.src = A;
            script.async = true;
            d.head.appendChild(script);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ['initNamespace', namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window as any, 'https://app.cal.com/embed/embed.js', 'init');

    const Cal = (window as any).Cal;
    if (Cal) {
      Cal('init', '30min', { origin: 'https://app.cal.com' });
      Cal.ns['30min']('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#16C784' },
          dark: { 'cal-brand': '#16C784' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
      Cal.ns['30min']('preload', {
        calLink: 'mytaskengine/30min',
      });
    }
  }, []);

  return null;
}
