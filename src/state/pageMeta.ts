import { EXERCISES } from '../data/exercises.ts';

import type { Route } from './router.ts';
import { parsePath, routePath } from './router.ts';

export const SITE_NAME = 'regexp.cheminfo.org';
export const SITE_URL = 'https://regexp.cheminfo.org';

export interface PageMeta {
  /** What the tab, the search result and the shared card are titled. */
  title: string;
  /** The line under the title in a search result and a shared card. */
  description: string;
  /** The address this page is indexed under. */
  canonicalPath: string;
}

/**
 * The title, the description and the canonical address of a page. The build
 * writes one file per address from this, and the page keeps its tab in step
 * with it as the visitor moves.
 * @param route - The page, and the exercise when it is on one.
 * @returns What that page is called and what it is about.
 */
export function pageMetaFor(route: Route): PageMeta {
  const canonicalPath = routePath(route);

  switch (route.page) {
    case 'playground': {
      return {
        title: 'Regular expression playground — test a pattern live',
        description:
          'Write a regular expression and watch it match, capture and replace as you type, with a railroad diagram of the pattern and every JavaScript flag one click away.',
        canonicalPath,
      };
    }
    case 'exercises': {
      const exercise = EXERCISES.find((item) => item.id === route.exerciseId);
      return exercise
        ? {
            title: `${exercise.title} — regular expression exercise`,
            description: `${stripMarkers(exercise.description)} Write the pattern, watch the test cases light up, and take a hint when you are stuck.`,
            canonicalPath,
          }
        : {
            title: 'Regular expression exercises — write the pattern yourself',
            description:
              'Graded regular expression challenges, from a literal match to lookahead and named groups. Each one is checked against test cases that must match and test cases that must not.',
            canonicalPath,
          };
    }
    case 'cheatsheet': {
      return {
        title: 'Regular expression cheatsheet',
        description:
          'Every construct of JavaScript regular expressions in one printable table — character classes, quantifiers, anchors, groups, lookaround and flags — each with an example.',
        canonicalPath,
      };
    }
    case 'glossary': {
      return {
        title: 'Regular expression glossary',
        description:
          'The words regular expressions are explained in — greedy, lazy, anchor, capture group, lookahead, backreference — each defined in one paragraph with an example.',
        canonicalPath,
      };
    }
    case 'about': {
      return {
        title: 'About, and what to cite',
        description:
          'What this tool is, who made it, the specification it follows, and the work to cite when it helped.',
        canonicalPath,
      };
    }
    case 'tutorial': {
      return {
        title: 'Learn regular expressions — a live, guided tutorial',
        description:
          'Learn regular expressions step by step in a live playground: literals, character classes, quantifiers, anchors, groups, lookaround and search-and-replace, each one editable as you read it.',
        canonicalPath,
      };
    }
    // no default
  }
}

/**
 * The address of a page, and what it is called. The sitemap lists these, and
 * the build writes one file per entry.
 * @returns Every page of the site, the home page first.
 */
export function everyPage(): PageMeta[] {
  const routes: Route[] = [
    { page: 'tutorial' },
    { page: 'playground' },
    { page: 'exercises' },
    { page: 'cheatsheet' },
    { page: 'glossary' },
    { page: 'about' },
    ...EXERCISES.map((exercise) => ({
      page: 'exercises' as const,
      exerciseId: exercise.id,
    })),
  ];
  return routes.map((route) => pageMetaFor(route));
}

/**
 * What the tab says on the page currently open.
 * @param pathname - The path of the address.
 * @returns The title, site name included.
 */
export function documentTitle(pathname: string): string {
  return `${pageMetaFor(parsePath(pathname)).title} — ${SITE_NAME}`;
}

// An exercise description carries `[[term]]` markers for the glossary tooltips;
// a search result is plain text.
function stripMarkers(text: string): string {
  return text.replaceAll(/\[\[(?<term>[^\]]+)\]\]/g, '$<term>');
}
