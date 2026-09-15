/**
 * What this site says about itself, read by the shared About page.
 *
 * The prose is content, never markup: the page draws it, so every About of the
 * family holds the same sections in the same order and one voice.
 */

import type { AboutContent } from 'react-cheminfo/core';
import { PLATFORM_WORK, TEACHING_WORK } from 'react-cheminfo/core';

export const ABOUT: AboutContent = {
  siteId: 'regexp',
  what: 'Type a pattern and see what it matches, in a guided tutorial, a free playground and a set of graded exercises.',
  can: [
    'Follow 13 tutorial steps, from a literal match to lookahead and named groups.',
    'Test a pattern live: matches, capture groups, flags and search-and-replace.',
    'Read the pattern back as a railroad diagram.',
    'Solve 19 exercises, each checked against cases that must match and cases that must not.',
    'Print the cheatsheet, or look one of 19 terms up in the glossary.',
  ],
  paragraphs: [
    'The live tester and its railroad diagram sit at the centre of the site, and the tutorial, the graded exercises, the cheatsheet and the glossary are built around them.',
    'Every pattern runs in your browser through the JavaScript RegExp engine, so nothing you type is sent anywhere.',
  ],
  people: [{ name: 'Luc Patiny' }],
  providedBy: ['epfl'],
  credits: ['blueprint', 'react-cheminfo', 'react', 'vite'],
  cite: [PLATFORM_WORK, TEACHING_WORK],
};
