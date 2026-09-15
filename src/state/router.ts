import {
  createTabRouter,
  pathFromLegacyHash as legacyHashPath,
} from 'react-cheminfo/core';

import { withBase } from './site.ts';

export type Page =
  'tutorial' | 'playground' | 'exercises' | 'cheatsheet' | 'glossary' | 'about';

export interface Route {
  page: Page;
  /**
   * The exercise being worked on, when the page is the exercises.
   * @default undefined
   */
  exerciseId?: string;
}

/**
 * The pages the header lists on the left, in the order it lists them. About is
 * not among them: it is about the site rather than a place in the tool, so it
 * sits with the utilities on the right.
 */
export const PAGES: ReadonlyArray<{ id: Page; label: string }> = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'playground', label: 'Playground' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'cheatsheet', label: 'Cheatsheet' },
  { id: 'glossary', label: 'Glossary' },
];

/**
 * Routing is path based through the History API, so every page is an address a
 * crawler can fetch and a teacher can hand out — a `#` is dropped by half the
 * tools that pass links around, and the server never sees it.
 *
 * The mount path is not given here: the addresses this writes are the site's
 * own, and `withBase` moves them under the mount at the one place they reach
 * the browser.
 */
const ROUTER = createTabRouter<Page>({
  home: 'tutorial',
  tabs: [
    'tutorial',
    'playground',
    { id: 'exercises', takesId: true },
    'cheatsheet',
    'glossary',
    'about',
  ],
});

/**
 * Where the address points.
 * @param pathname - The path of the address, e.g. `/exercises/word-boundary`.
 * @returns The page it opens, and the exercise when it names one.
 */
export function parsePath(pathname: string): Route {
  const { tab, id } = ROUTER.parse(pathname);
  return id === null ? { page: tab } : { page: tab, exerciseId: id };
}

/**
 * The address of a route, as the header writes it and the sitemap lists it.
 * The tutorial is the home page rather than a page beside it, so the site has
 * one address for it instead of two holding the same thing.
 * @param route - The page, and the exercise when it is on one.
 * @returns The path, starting with a slash.
 */
export function routePath(route: Route): string {
  return ROUTER.format({ tab: route.page, id: route.exerciseId ?? null });
}

/**
 * Put the address a legacy hash link meant in the bar, before anything reads
 * it. Called once, at startup, so nothing downstream has to know the site ever
 * routed by the hash.
 */
export function adoptLegacyHashAddress(): void {
  const path = pathFromLegacyHash(globalThis.location?.hash ?? '');
  if (path) globalThis.history.replaceState(null, '', withBase(path));
}

/**
 * The address a link written before this site routed by path points at. Those
 * links are in course pages and in bookmarks, so they are answered rather than
 * dropped.
 * @param hash - The fragment of the address, e.g. `#/exercises/anchors`.
 * @returns The path it means, or null when the fragment is not one of ours.
 */
export function pathFromLegacyHash(hash: string): string | null {
  const legacy = legacyHashPath(hash);
  if (legacy === null) return null;
  const [, first] = (legacy.split('?', 1)[0] ?? '').split('/', 2);
  if (first === undefined || !ROUTER.isTab(first)) return null;
  return routePath(parsePath(legacy));
}
