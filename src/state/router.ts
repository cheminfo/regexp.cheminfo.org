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

/** Every page, in the order the header lists them. */
export const PAGES: ReadonlyArray<{ id: Page; label: string }> = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'playground', label: 'Playground' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'cheatsheet', label: 'Cheatsheet' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'about', label: 'About' },
];

const PAGE_IDS = new Set<string>(PAGES.map((page) => page.id));

/**
 * Where the address points. Routing is path based through the History API, so
 * every page is an address a crawler can fetch and a teacher can hand out — a
 * `#` is dropped by half the tools that pass links around, and the server never
 * sees it.
 * @param pathname - The path of the address, e.g. `/exercises/word-boundary`.
 * @returns The page it opens, and the exercise when it names one.
 */
export function parsePath(pathname: string): Route {
  const [, first, second] = pathname.split('/');
  if (!first || !PAGE_IDS.has(first)) return { page: 'tutorial' };
  const page = first as Page;
  if (page !== 'exercises' || !second) return { page };
  return { page, exerciseId: safeDecode(second) };
}

/**
 * The address of a route, as the header writes it and the sitemap lists it.
 * The tutorial is the home page rather than a page beside it, so the site has
 * one address for it instead of two holding the same thing.
 * @param route - The page, and the exercise when it is on one.
 * @returns The path, starting with a slash.
 */
export function routePath(route: Route): string {
  if (route.page === 'tutorial') return '/';
  if (route.page === 'exercises' && route.exerciseId) {
    return `/exercises/${encodeURIComponent(route.exerciseId)}`;
  }
  return `/${route.page}`;
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
  const trimmed = hash.replace(/^#\/?/, '');
  if (!trimmed) return null;
  const [first, second] = trimmed.split('/');
  if (!first || !PAGE_IDS.has(first)) return null;
  return routePath({
    page: first as Page,
    exerciseId: second ? safeDecode(second) : undefined,
  });
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // A malformed escape in a link somebody retyped: the raw text is closer to
    // what they meant than throwing the page away.
    return value;
  }
}
