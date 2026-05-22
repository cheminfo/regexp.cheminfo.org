import type { CompiledRegex, MatchResult, MatchSegment } from '../types.ts';

const MAX_MATCHES = 5000;

/**
 * Compile a user-provided regular expression safely.
 * @param pattern - The regular expression source.
 * @param flags - The regular expression flags.
 * @returns The compiled `RegExp` or a human-readable error message.
 */
export function compileRegex(pattern: string, flags: string): CompiledRegex {
  if (pattern === '') {
    return { regex: null, error: null };
  }
  try {
    return { regex: new RegExp(pattern, flags), error: null };
  } catch (error) {
    return {
      regex: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run a regex against a text and produce a list of segments suitable for
 * highlighting. The function handles both global and non-global regexes,
 * detects zero-width matches and guards against runaway loops.
 * @param regex - The compiled regex (or `null`).
 * @param text - The text to scan.
 * @returns The segmented text plus the list of raw matches.
 */
export function findMatches(regex: RegExp | null, text: string): MatchResult {
  if (!regex || text === '') {
    return {
      segments: [{ text, isMatch: false }],
      count: 0,
      matches: [],
    };
  }

  const isGlobal = regex.global || regex.sticky;
  const scanRegex = isGlobal
    ? regex
    : new RegExp(regex.source, `${regex.flags}g`);
  scanRegex.lastIndex = 0;

  const matches: MatchResult['matches'] = [];
  const segments: MatchSegment[] = [];
  let lastIndex = 0;
  let safety = 0;
  let execResult = scanRegex.exec(text);

  while (execResult !== null) {
    safety += 1;
    if (safety > MAX_MATCHES) break;

    const start = execResult.index;
    const end = start + execResult[0].length;

    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), isMatch: false });
    }
    segments.push({
      text: execResult[0],
      isMatch: true,
      matchIndex: matches.length,
    });
    matches.push({
      value: execResult[0],
      index: start,
      prefix: text.slice(0, start),
      suffix: text.slice(end),
      groups: execResult.slice(1),
      namedGroups: execResult.groups ? { ...execResult.groups } : null,
    });

    lastIndex = end;

    if (execResult[0].length === 0) {
      scanRegex.lastIndex += 1;
      lastIndex = Math.max(lastIndex, scanRegex.lastIndex);
    }

    if (!isGlobal) break;
    execResult = scanRegex.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return { segments, count: matches.length, matches };
}

/**
 * Apply a regex-based replacement.
 * @param regex - The compiled regex (or `null`).
 * @param text - The original text.
 * @param replacement - The replacement string ($1, $2, $& syntax supported).
 * @returns The replaced text, or the original text if the regex is invalid.
 */
export function applyReplace(
  regex: RegExp | null,
  text: string,
  replacement: string,
): string {
  if (!regex) return text;
  try {
    return text.replace(regex, replacement);
  } catch {
    return text;
  }
}
