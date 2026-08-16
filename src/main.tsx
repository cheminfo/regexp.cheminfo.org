// eslint-disable-next-line import/no-unassigned-import -- must evaluate before regexper is imported (see file header)
import './regexperPolyfill.ts';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './styles/global.css';

import { FocusStyleManager } from '@blueprintjs/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { adoptLegacyHashAddress } from './state/router.ts';

FocusStyleManager.onlyShowFocusOnTabs();

// A link written while this site routed by the hash still opens: the address it
// meant is put in the bar before anything reads the address.
adoptLegacyHashAddress();

const container = document.querySelector('#root');
if (!container) {
  throw new Error('Root container #root not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
