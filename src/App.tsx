import { useCallback, useEffect, useState } from 'react';
import { startDocumentMeta } from 'react-cheminfo/core';
import {
  CiteButton,
  EcosystemButton,
  GlossaryProvider,
  NavLink,
  SiteFooter,
  SiteHeader,
  SiteTheme,
} from 'react-cheminfo/ui';

import { ABOUT } from './about.ts';
import { GLOSSARY } from './data/glossary.ts';
import { About } from './pages/About.tsx';
import { Cheatsheet } from './pages/Cheatsheet.tsx';
import { Exercises } from './pages/Exercises.tsx';
import { Glossary } from './pages/Glossary.tsx';
import { Playground } from './pages/Playground.tsx';
import { Tutorial } from './pages/Tutorial.tsx';
import { lastExercise } from './state/lastExercise.ts';
import type { Page } from './state/router.ts';
import { PAGES, parsePath, routePath } from './state/router.ts';
import { PAGE_ROUTES } from './state/routes.ts';
import { isEmbedded } from './state/shareConfig.ts';
import { absoluteUrl, pathWithoutBase, withBase } from './state/site.ts';

/**
 * Keep the tab and the canonical address in step with the page on screen. The
 * build already titles each file it wrote; this is what a move inside the app
 * changes, and what a crawler rendering the page reads afterwards. The origin
 * and the mount come from the page rather than from the build, so a deployment
 * serving this build under another address still describes itself.
 */
function syncDocumentMeta(): void {
  startDocumentMeta({
    site: 'regexp',
    routes: PAGE_ROUTES,
    url: () => pathWithoutBase(globalThis.location.pathname),
    origin: absoluteUrl(''),
  });
}

/**
 * Root application component. Hosts a path-based router that swaps between the
 * pedagogic pages: tutorial, playground, exercises, cheatsheet, glossary.
 * @returns The application root.
 */
export function App() {
  const [route, setRoute] = useState<Page>(
    () => parsePath(pathWithoutBase(globalThis.location.pathname)).page,
  );
  const [embedded] = useState(isEmbedded);

  useEffect(() => {
    // Also on mount: the build titles each file it wrote, but a page reached
    // through the SPA fallback — every address in dev, an unprerendered one in
    // production — otherwise keeps the title of the file that answered.
    syncDocumentMeta();

    function onPopState() {
      setRoute(parsePath(pathWithoutBase(globalThis.location.pathname)).page);
      syncDocumentMeta();
    }
    globalThis.addEventListener('popstate', onPopState);
    return () => {
      globalThis.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleTabChange = useCallback((page: Page) => {
    let target = routePath({ page });
    if (page === 'exercises') {
      const { id } = lastExercise.read().value;
      if (id) target = routePath({ page, exerciseId: id });
    }
    globalThis.history.pushState(null, '', withBase(target));
    setRoute(page);
    syncDocumentMeta();
  }, []);

  return (
    <GlossaryProvider glossary={GLOSSARY}>
      <div className="app-shell">
        <SiteTheme siteId="regexp" />
        <SiteHeader
          siteId="regexp"
          embedded={embedded}
          homeHref={withBase('/tutorial')}
          activeId={route}
          nav={PAGES.map((page) => ({
            id: page.id,
            label: page.label,
            href: routePath({ page: page.id }),
            onSelect: () => handleTabChange(page.id),
          }))}
          actions={
            <>
              <NavLink
                item={{
                  id: 'about',
                  label: 'About',
                  icon: 'info-sign',
                  href: routePath({ page: 'about' }),
                  onSelect: () => handleTabChange('about'),
                }}
                active={route === 'about'}
              />
              {ABOUT.cite ? <CiteButton works={ABOUT.cite} /> : null}
              <NavLink
                item={{
                  id: 'feedback',
                  label: 'Feedback',
                  icon: 'comment',
                  href: 'https://forms.gle/YWQZs7fntJBuv5xM6',
                  external: true,
                  title: 'Share your feedback (2-minute survey)',
                }}
              />
              <NavLink
                item={{
                  id: 'spec',
                  label: 'Spec',
                  icon: 'manual',
                  href: 'https://tc39.es/ecma262/#sec-regexp-regular-expression-objects',
                  external: true,
                  title: 'Official specification — ECMA-262 (TC39)',
                }}
              />
              <EcosystemButton currentSiteId="regexp" />
            </>
          }
        />

        <main className="app-main">
          {route === 'tutorial' && <Tutorial />}
          {route === 'playground' && <Playground />}
          {route === 'exercises' && <Exercises />}
          {route === 'cheatsheet' && <Cheatsheet />}
          {route === 'glossary' && <Glossary />}
          {route === 'about' && <About />}
        </main>
      </div>

      <SiteFooter siteId="regexp" embedded={embedded} />
    </GlossaryProvider>
  );
}
