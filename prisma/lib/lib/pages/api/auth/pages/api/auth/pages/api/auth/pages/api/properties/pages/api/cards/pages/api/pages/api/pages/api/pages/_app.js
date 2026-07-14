import { createElement as h } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return h(Component, pageProps);
}
