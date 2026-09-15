import type { ShareVocabulary } from 'react-cheminfo/core';
import { parseShareConfig } from 'react-cheminfo/core';

/**
 * What a link to this site can say beyond the page it opens. No part of a page
 * is hideable yet, so only `?embed` changes what is drawn.
 */
export const SHARE_VOCABULARY: ShareVocabulary = { parts: [] };

/**
 * Whether the page is framed by another site, such as a course page, in which
 * case the header and the footer are left out and the tool takes the frame.
 * @returns True when the address asks for embed mode.
 */
export function isEmbedded(): boolean {
  return parseShareConfig(globalThis.location?.search ?? '', SHARE_VOCABULARY)
    .embed;
}
