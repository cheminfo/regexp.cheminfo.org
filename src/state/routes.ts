/**
 * Every address the site answers, with the name and the sentence it is indexed
 * under.
 *
 * One table, read by three things: the build, which writes an HTML file per
 * entry and the sitemap listing them; the head injector; and the running app,
 * which retitles the tab after an in-app move. A page missing from here is a
 * page a search engine only ever sees as the home page.
 *
 * The machinery that reads it is `react-cheminfo/core` and
 * `react-cheminfo/vite`; what belongs to this site is the prose below, and the
 * exercises, which are addresses of their own so a teacher can hand out one.
 */

import type { RouteMeta } from 'react-cheminfo/core';

import { EXERCISES } from '../data/exercises.ts';

/**
 * The pages of the site, in the order the header lists them.
 *
 * These are also the addresses the crawl path lists: it is a menu, so it names
 * the exercises rather than each of the hundred and more addresses under them.
 * `short` is the name it links them under and `note` says what each is for.
 */
export const SITE_PAGES: readonly RouteMeta[] = [
  {
    path: '/',
    title: 'Learn regular expressions — a live, guided tutorial',
    description:
      'Learn regular expressions step by step in a live playground: character classes, quantifiers, anchors, groups, lookaround and search-and-replace.',
    short: 'Tutorial',
    note: 'the notation, one step at a time',
  },
  {
    path: '/playground',
    title: 'Regular expression playground — test a pattern live',
    description:
      'Write a regular expression and watch it match, capture and replace as you type, with a railroad diagram of the pattern and every JavaScript flag one click away.',
    short: 'Playground',
    note: 'test a pattern live',
  },
  {
    path: '/exercises',
    // An exercise this version no longer knows is still an exercise: it is
    // indexed under the exercises page rather than under the home page.
    prefix: true,
    title: 'Regular expression exercises — write the pattern yourself',
    description:
      'Graded regular expression challenges, from a literal match to lookahead and named groups, each checked against cases that must match and cases that must not.',
    short: 'Exercises',
    note: 'write the pattern yourself',
  },
  {
    path: '/cheatsheet',
    title: 'Regular expression cheatsheet',
    description:
      'Every JavaScript regular expression construct in one printable table — character classes, quantifiers, anchors, groups, lookaround and flags — with examples.',
    short: 'Cheatsheet',
    note: 'every construct in a table',
  },
  {
    path: '/glossary',
    title: 'Regular expression glossary',
    description:
      'The words regular expressions are explained in — greedy, lazy, anchor, capture group, lookahead, backreference — each defined in one paragraph with an example.',
    short: 'Glossary',
    note: 'the words they are explained in',
  },
  {
    path: '/about',
    title: 'About this tool, and regex beyond JavaScript',
    description:
      'What this regular expression tutorial is, who provides it, the cheminfo RegExp explorer it replaces, and how the patterns carry over to grep, sed and Python.',
    short: 'About',
    note: 'and regex beyond JavaScript',
  },
];

/** The pages of the site, then one address per exercise. */
export const PAGE_ROUTES: readonly RouteMeta[] = [
  ...SITE_PAGES,
  ...EXERCISES.map((exercise) => ({
    path: `/exercises/${encodeURIComponent(exercise.id)}`,
    // The suffix is short on purpose: the site name is appended after it, and
    // the longest exercise name still has to leave a title a result can show
    // whole.
    title: `${exercise.title} — regex exercise`,
    description: exercise.metaDescription,
  })),
];
