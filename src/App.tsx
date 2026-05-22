import { Icon, Tab, Tabs } from '@blueprintjs/core';
import { useCallback, useEffect, useState } from 'react';

import { Cheatsheet } from './pages/Cheatsheet.tsx';
import { Exercises } from './pages/Exercises.tsx';
import { Playground } from './pages/Playground.tsx';
import { Tutorial } from './pages/Tutorial.tsx';

type Route = 'tutorial' | 'playground' | 'exercises' | 'cheatsheet';

const ROUTES: Array<{ id: Route; label: string }> = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'playground', label: 'Playground' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'cheatsheet', label: 'Cheatsheet' },
];

const VALID_ROUTES = new Set<string>(ROUTES.map((r) => r.id));

function parseHash(hash: string): Route {
  const trimmed = hash.replace(/^#\/?/, '');
  if (VALID_ROUTES.has(trimmed)) {
    return trimmed as Route;
  }
  return 'tutorial';
}

/**
 * Root application component. Hosts a hash-based router that swaps between
 * the four pedagogic pages: tutorial, playground, exercises, cheatsheet.
 * @returns The application root.
 */
export function App() {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(globalThis.location.hash),
  );

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash(globalThis.location.hash));
    }
    globalThis.addEventListener('hashchange', onHashChange);
    return () => {
      globalThis.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    globalThis.history.pushState(null, '', `#/${tabId}`);
    setRoute(tabId as Route);
  }, []);

  return (
    <div
      style={{ maxWidth: 1400, margin: '0 auto', padding: 16 }}
      className="app-shell"
    >
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span className="logo">/.*/</span>
          RegExp Playground
        </h1>
        <a
          href="https://tc39.es/ecma262/#sec-regexp-regular-expression-objects"
          target="_blank"
          rel="noreferrer"
          title="Official specification — ECMA-262 (TC39)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#5c7080',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Icon icon="manual" size={16} />
          ECMA-262 Spec
        </a>
      </div>

      <div
        className="no-print"
        style={{ display: 'flex', alignItems: 'center', gap: 24 }}
      >
        <Tabs id="main-tabs" selectedTabId={route} onChange={handleTabChange}>
          {ROUTES.map((r) => (
            <Tab key={r.id} id={r.id} title={r.label} />
          ))}
        </Tabs>
      </div>

      <div style={{ marginTop: 16 }}>
        {route === 'tutorial' && <Tutorial />}
        {route === 'playground' && <Playground />}
        {route === 'exercises' && <Exercises />}
        {route === 'cheatsheet' && <Cheatsheet />}
      </div>

      <footer
        className="no-print"
        style={{
          textAlign: 'center',
          padding: 16,
          color: '#5c7080',
          fontSize: 12,
          marginTop: 24,
        }}
      >
        Provided by{' '}
        <a href="https://github.com/lpatiny" target="_blank" rel="noreferrer">
          Luc Patiny
        </a>
        . Inspired by the cheminfo RegExp explorer.{' '}
        <a
          href="https://github.com/cheminfo/regexp.cheminfo.org"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
        .
      </footer>
    </div>
  );
}
