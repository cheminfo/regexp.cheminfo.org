import { Icon, Tab, Tabs } from '@blueprintjs/core';
import { useCallback, useEffect, useState } from 'react';

import { About } from './pages/About.tsx';
import { Cheatsheet } from './pages/Cheatsheet.tsx';
import { Exercises } from './pages/Exercises.tsx';
import { Glossary } from './pages/Glossary.tsx';
import { Playground } from './pages/Playground.tsx';
import { Tutorial } from './pages/Tutorial.tsx';

type Route =
  | 'tutorial'
  | 'playground'
  | 'exercises'
  | 'cheatsheet'
  | 'glossary'
  | 'about';

const ROUTES: Array<{ id: Route; label: string }> = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'playground', label: 'Playground' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'cheatsheet', label: 'Cheatsheet' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'about', label: 'About' },
];

const VALID_ROUTES = new Set<string>(ROUTES.map((r) => r.id));

const LAST_EXERCISE_KEY = 'regexp-cheminfo:active-exercise:v1';

function parseHash(hash: string): Route {
  const [first] = hash.replace(/^#\/?/, '').split('/');
  if (first && VALID_ROUTES.has(first)) {
    return first as Route;
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
    let target = `#/${tabId}`;
    if (tabId === 'exercises') {
      const lastExercise = globalThis.localStorage.getItem(LAST_EXERCISE_KEY);
      if (lastExercise) {
        target = `#/exercises/${encodeURIComponent(lastExercise)}`;
      }
    }
    globalThis.history.pushState(null, '', target);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
          <a
            href="https://github.com/cheminfo/regexp.cheminfo.org"
            target="_blank"
            rel="noreferrer"
            title="Source on GitHub"
            aria-label="Source on GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#5c7080',
              textDecoration: 'none',
            }}
          >
            <svg
              role="img"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width={22}
              height={22}
              fill="currentColor"
            >
              <path d="M12 .5C5.73.5.99 5.24.99 11.51c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.46-2.44-.28-5.01-1.22-5.01-5.42 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.12.88-.24 1.82-.36 2.76-.36s1.88.12 2.76.36c2.1-1.41 3.02-1.12 3.02-1.12.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.21-2.57 5.14-5.02 5.41.39.34.74 1 .74 2.02 0 1.46-.01 2.64-.01 3 0 .29.2.64.76.53 4.37-1.46 7.51-5.58 7.51-10.43C23.01 5.24 18.27.5 12 .5z" />
            </svg>
          </a>
        </div>
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
        {route === 'glossary' && <Glossary />}
        {route === 'about' && <About />}
      </div>
    </div>
  );
}
