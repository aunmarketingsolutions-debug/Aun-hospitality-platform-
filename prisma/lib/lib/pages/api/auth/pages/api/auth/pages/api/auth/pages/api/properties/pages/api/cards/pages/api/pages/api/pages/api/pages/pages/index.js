import Head from 'next/head';
import Script from 'next/script';
import { createElement as h, useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return h(
    'div',
    null,
    h(
      Head,
      null,
      h('title', null, 'AUN Marketing Solutions'),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }),
      h('meta', { name: 'description', content: 'AUN Marketing Solutions — Hospitality Membership Platform' }),
      h('link', { rel: 'manifest', href: '/manifest.json' }),
      h('meta', { name: 'theme-color', content: '#121110' }),
      h('link', { rel: 'icon', href: '/icons/icon-192.png' }),
      h('link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }),
      h('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }),
      h('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }),
      h('meta', { name: 'apple-mobile-web-app-title', content: 'AUN' })
    ),
    h(
      'div',
      { className: 'shell', id: 'shell' },
      h(
        'div',
        { className: 'topbar' },
        h(
          'div',
          { className: 'brand' },
          h(
            'div',
            { className: 'brand-mark' },
            h(
              'svg',
              { viewBox: '0 0 24 24', fill: 'none' },
              h('path', {
                d: 'M12 3L21 20H3L12 3Z',
                stroke: '#EFEAE2',
                strokeWidth: '2',
                strokeLinejoin: 'round',
              })
            )
          ),
          h('span', { className: 'brand-word' }, 'AUN')
        ),
        h('div', { className: 'role-pill', id: 'rolePill' }, 'Sign in')
      ),
      h('div', { className: 'switcher', id: 'roleSwitcher' }),
      h('main', { id: 'mainArea' }),
      h('div', { className: 'bottomnav', id: 'bottomNav' })
    ),
    h('div', { id: 'modalRoot' }),
    h('div', { className: 'toast', id: 'toast' }),
    h(Script, { src: '/app.js', strategy: 'afterInteractive' })
  );
}
