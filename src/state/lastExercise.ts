import { persistBucket } from 'react-cheminfo/core';

/**
 * The exercise the student last had open, so the Exercises tab reopens where
 * they left off rather than at the first challenge.
 *
 * Best effort: a page framed in a course may have no storage at all, and a
 * student who loses this only loses a shortcut.
 */
export const lastExercise = persistBucket<{ id: string }>({
  key: 'regexp-cheminfo:active-exercise',
  version: 1,
  defaults: { id: '' },
});
