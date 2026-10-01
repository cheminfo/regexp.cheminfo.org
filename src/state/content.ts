/**
 * What each address says in the HTML the server hands out, above the crawl path.
 *
 * All 25 addresses used to ship the same body — this site's menu — so a crawler
 * was handed one text for the playground and for every exercise, and told by the
 * title alone that they were different pages. Read by the build and by nothing
 * else: `vite.config.ts` calls it once per route, so none of this reaches the
 * bundle a browser downloads.
 *
 * An exercise page says what it asks and never the answer: the pattern the
 * reader is to write is not put in the HTML of the question.
 */

import type { PageContent, RouteMeta } from 'react-cheminfo/core';
import { plainProse } from 'react-cheminfo/core';

import { EXERCISES } from '../data/exercises.ts';

/** The pages the header lists, each in its own words. */
const PAGES: Record<string, PageContent> = {
  '/': {
    heading: 'Write a regular expression and watch it match',
    paragraphs: [
      'Type a pattern and a sample text, and every match is highlighted as you type, with the capture groups broken out beside it. The flags are buttons, and a pattern that does not compile says why instead of silently matching nothing.',
      'A regular expression is a small language for describing text: literals, character classes, quantifiers, anchors, groups and alternation. Everything here is about learning to read and write one.',
    ],
  },
  '/playground': {
    heading: 'A regular expression, live on your own text',
    paragraphs: [
      'Paste the text you actually have to parse, write the pattern against it, and read the matches and the capture groups as you go. Nothing is sent anywhere — the engine is the one already in your browser.',
    ],
  },
  '/exercises': {
    heading: 'Write the pattern, and be marked on it',
    paragraphs: [
      'Each exercise gives the strings a pattern must match and the strings it must not, so over-matching fails as loudly as not matching. Hints run from a nudge to almost the answer, and the answer itself is always one click away.',
    ],
  },
  '/cheatsheet': {
    heading: 'Every construct of the notation, on one page',
    paragraphs: [
      'Character classes, quantifiers, anchors, groups, back-references, look-around and the flags — each row with a pattern, a sample input and what it matches. It prints on one or two pages.',
    ],
  },
  '/glossary': {
    heading: 'The words, each with a pattern that shows it',
    paragraphs: [
      'Every term the tutorials and the exercises use, defined with a runnable example rather than a definition alone — a word boundary is easier to learn from watching it refuse to match inside a word.',
    ],
  },
  '/about': {
    heading: 'What this tool is, and what it runs on',
    paragraphs: [
      'What you can do here, which regular-expression engine it uses — your browser’s own, so what you see is what your code will do — and the specification to read when the answer has to be exact.',
    ],
  },
};

/**
 * What one address says for itself.
 *
 * Read by `cheminfoPrerender` once per route at build time.
 * @param route - The address being written.
 * @returns Its text — authored for a page the header lists, the exercise's own
 * question for an exercise, and otherwise the name and sentence the route
 * carries.
 */
export function pageContent(route: RouteMeta): PageContent {
  const authored = PAGES[route.path];
  if (authored !== undefined) return authored;

  const exercise = exerciseContent(route.path);
  if (exercise !== undefined) return exercise;

  return { heading: route.title, paragraphs: [route.description] };
}

/** One exercise: what it asks, and how it is marked. Never the answer. */
function exerciseContent(path: string): PageContent | undefined {
  const prefix = '/exercises/';
  if (!path.startsWith(prefix)) return undefined;
  const id = decodeURIComponent(path.slice(prefix.length));
  if (id === '' || id.includes('/')) return undefined;
  const exercise = EXERCISES.find((candidate) => candidate.id === id);
  if (exercise === undefined) return undefined;

  const hints = exercise.hints.length;
  return {
    heading: exercise.title,
    paragraphs: [
      plainProse(exercise.description),
      `A ${exercise.level} exercise. Your pattern is run against every test case — the strings it must match and the strings it must not — and each one reports what it got against what was expected${hints === 0 ? '.' : `, with ${hints} hint${hints === 1 ? '' : 's'} if you want them.`}`,
    ],
  };
}
