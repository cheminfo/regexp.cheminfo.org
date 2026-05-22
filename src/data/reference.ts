import type { SyntaxTooltipExample } from '../components/SyntaxTooltip.tsx';

import { FLAGS } from './flags.ts';

export interface ReferenceItem {
  /** Token shown in the table's left cell (e.g. `\d`, `(?:...)`, `g`). */
  syntax: string;
  /** Short description shown in the table's right cell. */
  description: string;
  /**
   * Friendly name shown as the tooltip headline (e.g. "Digit class").
   * When omitted, no rich tooltip is shown for the row.
   * @default undefined
   */
  name?: string;
  /**
   * Optional grey label rendered top-right of the tooltip header — useful for
   * pointing at the underlying API (`RegExp.prototype.global`) or a category.
   * @default undefined
   */
  tag?: string;
  /**
   * Longer explanation displayed under the summary. Required for the rich
   * tooltip to render. Pair with `example`.
   * @default undefined
   */
  detail?: string;
  /**
   * Concrete usage example. Required alongside `detail` for the rich tooltip.
   * @default undefined
   */
  example?: SyntaxTooltipExample;
}

export interface ReferenceSection {
  title: string;
  items: ReferenceItem[];
}

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  {
    title: 'Basics',
    items: [
      {
        syntax: '.',
        description: 'Any character except newline',
        name: 'Wildcard',
        tag: 'Metacharacter',
        detail: String.raw`Matches exactly one code unit that is not a line terminator (\n, \r, U+2028, U+2029). To also match newlines, add the s (dotAll) flag. Inside a character class [.] it loses its special meaning and matches a literal dot.`,
        example: {
          pattern: '/c.t/g',
          input: 'cat cot cut c\nt',
          note: String.raw`matches "cat", "cot" and "cut" but not "c\nt" (no s flag).`,
        },
      },
      {
        syntax: 'a',
        description: 'The character a',
        name: 'Literal character',
        tag: 'Atom',
        detail: String.raw`A non-special character matches itself. Most letters, digits and many punctuation marks are literals. Characters with special meaning (. * + ? ( ) [ ] { } | ^ $ \) must be escaped with a backslash to be matched literally.`,
        example: {
          pattern: '/a/g',
          input: 'banana',
          note: 'matches each of the three "a" characters in "banana".',
        },
      },
      {
        syntax: 'ab',
        description: 'The string ab',
        name: 'Concatenation',
        tag: 'Sequence',
        detail:
          'Two atoms written next to each other must match in order, with no characters between them. Concatenation is implicit — there is no separator — and binds tighter than alternation (a|bc means a OR bc, not (ab)|(ac)).',
        example: {
          pattern: '/ab/g',
          input: 'abc cab abba',
          note: 'matches "ab" in "abc" and the first two characters of "abba".',
        },
      },
      {
        syntax: 'a|b',
        description: 'a or b',
        name: 'Alternation',
        tag: 'Disjunction',
        detail:
          'Tries the left alternative first; if it fails to match at this position, tries the right one. Alternation has the lowest precedence in regex syntax — wrap branches in (?:…) when you need a smaller scope, e.g. cat|dog vs c(?:at|ow).',
        example: {
          pattern: '/cat|dog/g',
          input: 'a cat met a dog',
          note: 'matches "cat" and "dog". Without grouping, cat|dog is c-a-t OR d-o-g.',
        },
      },
      {
        syntax: 'a*',
        description: '0 or more a',
        name: 'Kleene star',
        tag: 'Quantifier',
        detail:
          'Repeats the preceding atom zero or more times, greedily. Because zero repetitions is acceptable, a* always matches at any position — even on an empty string. Combine with anchors or non-empty atoms to avoid trivial matches.',
        example: {
          pattern: '/ba*/g',
          input: 'b ba baa baaa',
          note: 'matches "b", "ba", "baa" and "baaa" — the longest run of a after each b.',
        },
      },
      {
        syntax: '\\',
        description: 'Escape a special character',
        name: 'Backslash escape',
        tag: 'Metacharacter',
        detail: String.raw`Removes the special meaning from the next character, so \. matches a literal dot, \\ matches a backslash, and \( matches an open parenthesis. In front of an ordinary letter the backslash usually introduces an escape sequence (\d, \w, \b, …); under the u/v flag, unknown letter escapes throw.`,
        example: {
          pattern: String.raw`/3\.14/`,
          input: 'π ≈ 3.14',
          note: 'matches the literal "3.14". Without the backslash, "." would match any character.',
        },
      },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      {
        syntax: '*',
        description: '0 or more (greedy)',
        name: 'Zero or more',
        tag: 'Greedy quantifier',
        detail:
          'Matches the preceding atom zero or more times, consuming as many characters as possible while still letting the rest of the pattern succeed. Combine with a lazy modifier (*?) when you want the shortest match instead.',
        example: {
          pattern: '/a.*b/',
          input: 'a---b---a---b',
          note: 'matches "a---b---a---b" — the dot-star greedily consumes everything up to the last "b".',
        },
      },
      {
        syntax: '+',
        description: '1 or more',
        name: 'One or more',
        tag: 'Greedy quantifier',
        detail: String.raw`Same as * but requires at least one repetition. Useful when an empty match would be meaningless, e.g. \d+ to match a run of digits.`,
        example: {
          pattern: String.raw`/\d+/g`,
          input: 'abc 123 def 4567',
          note: 'matches "123" and "4567" — each maximal run of digits.',
        },
      },
      {
        syntax: '?',
        description: '0 or 1 (optional)',
        name: 'Optional',
        tag: 'Quantifier',
        detail:
          'Marks the preceding atom as optional. After another quantifier (*?, +?, ??), it switches the quantifier to lazy mode (match as few characters as possible).',
        example: {
          pattern: '/colou?r/g',
          input: 'color and colour',
          note: 'matches both "color" and "colour" thanks to the optional "u".',
        },
      },
      {
        syntax: '{n}',
        description: 'Exactly n times',
        name: 'Exact repetition',
        tag: 'Quantifier',
        detail:
          'Matches the preceding atom exactly n times. Equivalent to writing the atom n times in a row, but much more readable for large n.',
        example: {
          pattern: String.raw`/\d{4}/g`,
          input: 'year 2026, code 42',
          note: 'matches "2026" (four digits) but not "42" (only two).',
        },
      },
      {
        syntax: '{n,m}',
        description: 'Between n and m times',
        name: 'Bounded repetition',
        tag: 'Quantifier',
        detail:
          'Matches the preceding atom at least n and at most m times, greedily. Append ? for a lazy variant ({n,m}?).',
        example: {
          pattern: String.raw`/\d{2,4}/g`,
          input: '1 22 333 4444 55555',
          note: 'matches "22", "333", "4444" and "5555" — between 2 and 4 digits, greedy.',
        },
      },
      {
        syntax: '{n,}',
        description: 'n or more times',
        name: 'Open-ended repetition',
        tag: 'Quantifier',
        detail:
          'Matches the preceding atom at least n times, with no upper bound. Behaves like {n,∞}, greedy by default; the lazy form is {n,}?.',
        example: {
          pattern: String.raw`/\d{3,}/g`,
          input: '1 22 333 4444',
          note: 'matches "333" and "4444" — runs of 3 or more digits.',
        },
      },
      {
        syntax: '*?',
        description: 'Lazy: as few as possible',
        name: 'Lazy quantifier',
        tag: 'Non-greedy',
        detail:
          'Appending ? to any quantifier (*?, +?, ??, {n,m}?) switches it to lazy: the engine matches as little as possible, expanding only when the rest of the pattern cannot otherwise succeed. Crucial for "shortest match" scenarios like extracting tag bodies.',
        example: {
          pattern: '/a.*?b/',
          input: 'a---b---a---b',
          note: 'matches just "a---b" (shortest), whereas greedy /a.*b/ would consume the whole string.',
        },
      },
    ],
  },
  {
    title: 'Character classes',
    items: [
      {
        syntax: '[abc]',
        description: 'a, b or c',
        name: 'Character set',
        tag: 'Character class',
        detail: String.raw`Matches a single character that is one of the listed characters. Most metacharacters lose their special meaning inside [...] — only ], \, ^ (when first) and - (between characters) are special.`,
        example: {
          pattern: '/[aeiou]/g',
          input: 'regular expression',
          note: 'matches each vowel in the input — "e", "u", "a", "e", "e", "i", "o".',
        },
      },
      {
        syntax: '[^abc]',
        description: 'Not a, not b, not c',
        name: 'Negated character set',
        tag: 'Character class',
        detail:
          'A leading ^ inside the brackets negates the set: it matches any single character that is NOT listed. Note that the negation still requires a character to be present — it does not match an empty position.',
        example: {
          pattern: '/[^aeiou ]/g',
          input: 'regular expression',
          note: 'matches every non-vowel, non-space character: r, g, l, r, x, p, r, s, s, n.',
        },
      },
      {
        syntax: '[a-z]',
        description: 'Any lowercase letter',
        name: 'Character range',
        tag: 'Character class',
        detail:
          'A hyphen between two characters inside [...] defines an inclusive range by code-point order. Combine multiple ranges and individual characters freely, e.g. [A-Za-z0-9_].',
        example: {
          pattern: '/[a-f]/g',
          input: 'face of feed',
          note: 'matches every lowercase letter from a to f: f, a, c, e, f, f, e, e, d.',
        },
      },
      {
        syntax: String.raw`\d`,
        description: 'Any digit (0-9)',
        name: 'Digit class',
        tag: 'Predefined class',
        detail: String.raw`Shorthand for [0-9]. Always limited to ASCII digits, even with the u flag (use \p{Number} for digits from any script).`,
        example: {
          pattern: String.raw`/\d+/g`,
          input: 'order 42 of 1000 items',
          note: 'matches "42" and "1000".',
        },
      },
      {
        syntax: String.raw`\D`,
        description: 'Any non-digit',
        name: 'Non-digit class',
        tag: 'Predefined class',
        detail:
          'Shorthand for [^0-9]. Matches any single character that is not an ASCII digit, including letters, punctuation, whitespace and Unicode characters.',
        example: {
          pattern: String.raw`/\D+/g`,
          input: 'abc 123 def',
          note: 'matches "abc ", " " and " def" — the non-digit runs around the numbers.',
        },
      },
      {
        syntax: String.raw`\w`,
        description: 'Word character: [A-Za-z0-9_]',
        name: 'Word character',
        tag: 'Predefined class',
        detail: String.raw`Shorthand for [A-Za-z0-9_]. Despite the name it is ASCII-only — accented letters and non-Latin scripts do not match, even with the u flag (use \p{L} for that).`,
        example: {
          pattern: String.raw`/\w+/g`,
          input: 'snake_case and kebab-case',
          note: 'matches "snake_case", "and", "kebab" and "case" (the hyphen breaks the word).',
        },
      },
      {
        syntax: String.raw`\W`,
        description: 'Non-word character',
        name: 'Non-word character',
        tag: 'Predefined class',
        detail: String.raw`The complement of \w. Matches anything that is not an ASCII letter, digit or underscore — useful for splitting on punctuation and whitespace.`,
        example: {
          pattern: String.raw`/\W+/g`,
          input: 'hello, world!',
          note: 'matches ", " and "!" — the runs of punctuation and whitespace.',
        },
      },
      {
        syntax: String.raw`\s`,
        description: 'Whitespace',
        name: 'Whitespace class',
        tag: 'Predefined class',
        detail: String.raw`Matches any Unicode whitespace character — spaces, tabs (\t), newlines (\n, \r), form feeds (\f), vertical tabs (\v), no-break spaces (U+00A0), and other Zs/line/paragraph separators.`,
        example: {
          pattern: String.raw`/\s+/g`,
          input: 'two   words\tand\nmore',
          note: 'matches each run of whitespace — three spaces, a tab, and a newline.',
        },
      },
      {
        syntax: String.raw`\S`,
        description: 'Non-whitespace',
        name: 'Non-whitespace class',
        tag: 'Predefined class',
        detail: String.raw`The complement of \s — any character that is not whitespace. Often used to tokenise by greedily grabbing "anything but spaces".`,
        example: {
          pattern: String.raw`/\S+/g`,
          input: '  foo  bar  baz  ',
          note: 'matches "foo", "bar" and "baz" — runs of non-whitespace.',
        },
      },
    ],
  },
  {
    title: 'Anchors & boundaries',
    items: [
      {
        syntax: '^',
        description: 'Start of string (or line with m flag)',
        name: 'Start anchor',
        tag: 'Zero-width',
        detail:
          'Matches the position before the first character of the input. With the m (multiline) flag it also matches immediately after every line terminator, anchoring to the start of each line.',
        example: {
          pattern: '/^cat/gm',
          input: 'cat one\ndog\ncat two',
          note: 'matches "cat" at the start of line 1 and line 3 (m flag enables line anchoring).',
        },
      },
      {
        syntax: '$',
        description: 'End of string (or line with m flag)',
        name: 'End anchor',
        tag: 'Zero-width',
        detail:
          'Matches the position after the last character of the input. With the m flag it also matches immediately before every line terminator, anchoring to the end of each line.',
        example: {
          pattern: String.raw`/\d+$/gm`,
          input: 'order 42\nitem 7\ndone',
          note: 'matches "42" and "7" — digits at the end of a line.',
        },
      },
      {
        syntax: String.raw`\b`,
        description: 'Word boundary',
        name: 'Word boundary',
        tag: 'Zero-width',
        detail: String.raw`Matches the position between a word character (\w) and a non-word character (\W), at either edge of the string, or at any transition between the two. Useful to match whole words and avoid matching inside larger words.`,
        example: {
          pattern: String.raw`/\bcat\b/g`,
          input: 'cat cats scatter',
          note: 'matches the standalone "cat" only — not the "cat" inside "cats" or "scatter".',
        },
      },
      {
        syntax: String.raw`\B`,
        description: 'Non-word boundary',
        name: 'Non-word boundary',
        tag: 'Zero-width',
        detail: String.raw`The complement of \b — matches at every position that is NOT a word boundary, i.e. between two word characters or between two non-word characters.`,
        example: {
          pattern: String.raw`/\Bcat\B/g`,
          input: 'cat cats scatter',
          note: 'matches "cat" inside "scatter" (surrounded by letters), but not the standalone "cat".',
        },
      },
    ],
  },
  {
    title: 'Groups & references',
    items: [
      {
        syntax: '(...)',
        description: 'Capturing group',
        name: 'Capturing group',
        tag: 'Group',
        detail:
          'Groups the contained pattern so a quantifier applies to it as a unit, and captures the matched substring for later use as $1, $2, … in replacements or `match[1]`, `match[2]`, … in JS code. Numbered left-to-right by opening parenthesis.',
        example: {
          pattern: String.raw`/(\w+)@(\w+)/`,
          input: 'mail: alice@example',
          note: 'captures group 1 = "alice", group 2 = "example".',
        },
      },
      {
        syntax: '(?:...)',
        description: 'Non-capturing group',
        name: 'Non-capturing group',
        tag: 'Group',
        detail:
          'Groups a sub-pattern without allocating a capture slot. Use it whenever you need grouping for a quantifier or alternation but do not care about extracting the match — cheaper and keeps capture indices clean.',
        example: {
          pattern: '/(?:cat|dog)s?/g',
          input: 'cats and dogs',
          note: 'matches "cats" and "dogs"; no capture group is created.',
        },
      },
      {
        syntax: '(?<name>...)',
        description: 'Named capturing group',
        name: 'Named capture',
        tag: 'Group',
        detail:
          'Like (...), but also assigns a name accessible as `match.groups.name` and via $<name> in replacement strings. Names must be valid identifiers and unique within the pattern.',
        example: {
          pattern: String.raw`/(?<year>\d{4})-(?<month>\d{2})/`,
          input: '2026-05',
          note: 'captures groups.year = "2026", groups.month = "05".',
        },
      },
      {
        syntax: String.raw`\1`,
        description: 'Reference to group 1',
        name: 'Backreference',
        tag: 'Reference',
        detail: String.raw`Inside the pattern, \N matches the same text previously captured by group N. Indispensable for finding repeated or paired content (duplicate words, balanced quotes, …).`,
        example: {
          pattern: String.raw`/(\w+) \1/`,
          input: 'the the cat',
          note: 'matches "the the" — the doubled word.',
        },
      },
      {
        syntax: String.raw`\k<name>`,
        description: 'Reference to named group',
        name: 'Named backreference',
        tag: 'Reference',
        detail: String.raw`The named-group equivalent of \1: re-uses the text captured by the named group earlier in the pattern.`,
        example: {
          pattern: String.raw`/<(?<tag>\w+)>.*<\/\k<tag>>/`,
          input: '<b>bold</b>',
          note: 'matches because the closing tag name equals the captured opening one.',
        },
      },
    ],
  },
  {
    title: 'Look-around',
    items: [
      {
        syntax: '(?=...)',
        description: 'Positive lookahead',
        name: 'Lookahead',
        tag: 'Zero-width assertion',
        detail:
          'Succeeds at a position if the inner pattern matches starting there, but consumes no characters. Use it to assert what must follow without including it in the match.',
        example: {
          pattern: String.raw`/\d+(?=\s*USD)/g`,
          input: '20 EUR and 30 USD and 40 USD',
          note: 'matches "30" and "40" — digits followed by " USD". The "USD" itself is not part of the match.',
        },
      },
      {
        syntax: '(?!...)',
        description: 'Negative lookahead',
        name: 'Negative lookahead',
        tag: 'Zero-width assertion',
        detail:
          'Succeeds at a position if the inner pattern does NOT match there. Useful for "match X unless followed by Y" constraints.',
        example: {
          pattern: String.raw`/\d+(?!\s*USD)/g`,
          input: '20 EUR 30 USD 40',
          note: 'matches "20" and "40" — numbers not followed by " USD" ("30" is skipped).',
        },
      },
      {
        syntax: '(?<=...)',
        description: 'Positive lookbehind',
        name: 'Lookbehind',
        tag: 'Zero-width assertion',
        detail:
          'Succeeds if the inner pattern matches just before the current position. The text matched by the lookbehind is not included in the overall match.',
        example: {
          pattern: String.raw`/(?<=\$)\d+/g`,
          input: 'price $20 vs €30',
          note: 'matches "20" — the digits preceded by a "$" sign.',
        },
      },
      {
        syntax: '(?<!...)',
        description: 'Negative lookbehind',
        name: 'Negative lookbehind',
        tag: 'Zero-width assertion',
        detail:
          'Succeeds if the inner pattern does NOT match just before the current position. The mirror of (?<=…).',
        example: {
          pattern: String.raw`/(?<!\$)\d+/g`,
          input: 'price $20 vs €30',
          note: 'matches "30" — digits not preceded by a "$" sign.',
        },
      },
    ],
  },
  {
    title: 'Special characters',
    items: [
      {
        syntax: String.raw`\n`,
        description: 'Newline',
        name: 'Line feed',
        tag: 'Escape sequence',
        detail: String.raw`Matches the line feed character (U+000A). The most common line terminator on Unix and inside JavaScript strings; combined with \r ("\r\n") on Windows.`,
        example: {
          pattern: String.raw`/line\nbreak/`,
          input: 'line\nbreak',
          note: 'matches the two words across a literal newline.',
        },
      },
      {
        syntax: String.raw`\r`,
        description: 'Carriage return',
        name: 'Carriage return',
        tag: 'Escape sequence',
        detail: String.raw`Matches the carriage return character (U+000D). Typically appears as part of "\r\n" line endings produced on Windows.`,
        example: {
          pattern: String.raw`/\r\n/g`,
          input: 'win\r\nline\r\nendings',
          note: 'matches each Windows-style line ending in the input.',
        },
      },
      {
        syntax: String.raw`\t`,
        description: 'Tab',
        name: 'Horizontal tab',
        tag: 'Escape sequence',
        detail:
          'Matches the horizontal tab character (U+0009). Often used when tokenising TSV (tab-separated values) or stripping leading indentation.',
        example: {
          pattern: String.raw`/\t+/g`,
          input: 'col1\tcol2\t\tcol3',
          note: 'matches each run of tab characters separating the columns.',
        },
      },
      {
        syntax: String.raw`\0`,
        description: 'Null character',
        name: 'NUL',
        tag: 'Escape sequence',
        detail: String.raw`Matches the null character (U+0000). Only valid when not followed by an ASCII digit — \01 would be parsed as a backreference or octal escape depending on context.`,
        example: {
          pattern: String.raw`/foo\0bar/`,
          input: 'foo bar',
          note: 'matches "foo", a NUL byte, then "bar".',
        },
      },
      {
        syntax: String.raw`\uYYYY`,
        description: 'Unicode code point (hex)',
        name: 'Unicode escape',
        tag: 'Escape sequence',
        detail: String.raw`Matches the character at code-point U+YYYY (exactly four hex digits). Under the u flag you can also write \u{1F600} with one to six hex digits to address any code point including astral-plane characters.`,
        example: {
          pattern: String.raw`/é/g`,
          input: 'café',
          note: 'matches the "é" — U+00E9 — even when the source uses the escape rather than the literal letter.',
        },
      },
      {
        syntax: String.raw`\xYY`,
        description: 'Hex character (2 digits)',
        name: 'Hex escape',
        tag: 'Escape sequence',
        detail: String.raw`Matches the character at code-point U+00YY (exactly two hex digits). Equivalent to \u00YY but shorter — useful for low-ASCII control characters.`,
        example: {
          pattern: String.raw`/\x41/`,
          input: 'A is for Apple',
          note: 'matches the uppercase "A" (0x41 in ASCII).',
        },
      },
    ],
  },
  {
    title: 'Flags',
    items: FLAGS.map((flag) => ({
      syntax: flag.key,
      description: flag.description,
      name: flag.name,
      tag: `RegExp.prototype.${flag.property}`,
      detail: flag.detail,
      example: flag.example,
    })),
  },
  {
    title: 'Replacement specials',
    items: [
      {
        syntax: '$&',
        description: 'Insert the entire match',
        name: 'Whole match',
        tag: 'Replacement token',
        detail:
          'In the replacement string of String.prototype.replace / replaceAll, $& is substituted with the full text that the regex matched. Equivalent to "$0" in some other regex flavours but not in JavaScript.',
        example: {
          pattern: String.raw`"cat dog".replace(/\w+/g, "<$&>")`,
          input: 'cat dog',
          note: 'produces "<cat> <dog>" — each match wrapped in angle brackets.',
        },
      },
      {
        syntax: '$1, $2, …',
        description: 'Insert captured group n',
        name: 'Group reference',
        tag: 'Replacement token',
        detail:
          'In the replacement string, $N is substituted with the text captured by group N (1-indexed by opening parenthesis). Out-of-range references are left as the literal text "$N".',
        example: {
          pattern: String.raw`"John Doe".replace(/(\w+) (\w+)/, "$2 $1")`,
          input: 'John Doe',
          note: 'swaps first and last name, producing "Doe John".',
        },
      },
      {
        syntax: '$`',
        description: 'Insert preceding string',
        name: 'Prefix',
        tag: 'Replacement token',
        detail:
          'Expands to the portion of the input that appears BEFORE the current match. Useful when you want the replacement to echo back the prefix.',
        example: {
          pattern: '"foo-bar".replace(/-/, "$`")',
          input: 'foo-bar',
          note: 'replaces the dash with the prefix "foo", producing "foofoobar".',
        },
      },
      {
        syntax: "$'",
        description: 'Insert following string',
        name: 'Suffix',
        tag: 'Replacement token',
        detail:
          'Expands to the portion of the input that appears AFTER the current match. The mirror of $`.',
        example: {
          pattern: String.raw`"foo-bar".replace(/-/, "$'")`,
          input: 'foo-bar',
          note: 'replaces the dash with the suffix "bar", producing "foobarbar".',
        },
      },
      {
        syntax: '$$',
        description: 'Insert a literal $',
        name: 'Dollar literal',
        tag: 'Replacement token',
        detail:
          'Because $ has special meaning in the replacement string, "$$" is the only way to insert a literal dollar sign. Plain "$" followed by anything other than & 1-9 ` \' < or $ is also treated literally, but "$$" is the safe, explicit form.',
        example: {
          pattern: String.raw`"100".replace(/\d+/, "$$$&")`,
          input: '100',
          note: 'produces "$100" — a literal dollar sign followed by the matched number.',
        },
      },
    ],
  },
];
