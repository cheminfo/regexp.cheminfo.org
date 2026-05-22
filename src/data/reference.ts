export interface ReferenceItem {
  syntax: string;
  description: string;
}

export interface ReferenceSection {
  title: string;
  items: ReferenceItem[];
}

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  {
    title: 'Basics',
    items: [
      { syntax: '.', description: 'Any character except newline' },
      { syntax: 'a', description: 'The character a' },
      { syntax: 'ab', description: 'The string ab' },
      { syntax: 'a|b', description: 'a or b' },
      { syntax: 'a*', description: '0 or more a' },
      { syntax: '\\', description: 'Escape a special character' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { syntax: '*', description: '0 or more (greedy)' },
      { syntax: '+', description: '1 or more' },
      { syntax: '?', description: '0 or 1 (optional)' },
      { syntax: '{n}', description: 'Exactly n times' },
      { syntax: '{n,m}', description: 'Between n and m times' },
      { syntax: '{n,}', description: 'n or more times' },
      { syntax: '*?', description: 'Lazy: as few as possible' },
    ],
  },
  {
    title: 'Character classes',
    items: [
      { syntax: '[abc]', description: 'a, b or c' },
      { syntax: '[^abc]', description: 'Not a, not b, not c' },
      { syntax: '[a-z]', description: 'Any lowercase letter' },
      { syntax: String.raw`\d`, description: 'Any digit (0-9)' },
      { syntax: String.raw`\D`, description: 'Any non-digit' },
      { syntax: String.raw`\w`, description: 'Word character: [A-Za-z0-9_]' },
      { syntax: String.raw`\W`, description: 'Non-word character' },
      { syntax: String.raw`\s`, description: 'Whitespace' },
      { syntax: String.raw`\S`, description: 'Non-whitespace' },
    ],
  },
  {
    title: 'Anchors & boundaries',
    items: [
      { syntax: '^', description: 'Start of string (or line with m flag)' },
      { syntax: '$', description: 'End of string (or line with m flag)' },
      { syntax: String.raw`\b`, description: 'Word boundary' },
      { syntax: String.raw`\B`, description: 'Non-word boundary' },
    ],
  },
  {
    title: 'Groups & references',
    items: [
      { syntax: '(...)', description: 'Capturing group' },
      { syntax: '(?:...)', description: 'Non-capturing group' },
      { syntax: '(?<name>...)', description: 'Named capturing group' },
      { syntax: String.raw`\1`, description: 'Reference to group 1' },
      { syntax: String.raw`\k<name>`, description: 'Reference to named group' },
    ],
  },
  {
    title: 'Look-around',
    items: [
      { syntax: '(?=...)', description: 'Positive lookahead' },
      { syntax: '(?!...)', description: 'Negative lookahead' },
      { syntax: '(?<=...)', description: 'Positive lookbehind' },
      { syntax: '(?<!...)', description: 'Negative lookbehind' },
    ],
  },
  {
    title: 'Special characters',
    items: [
      { syntax: String.raw`\n`, description: 'Newline' },
      { syntax: String.raw`\r`, description: 'Carriage return' },
      { syntax: String.raw`\t`, description: 'Tab' },
      { syntax: String.raw`\0`, description: 'Null character' },
      { syntax: String.raw`\uYYYY`, description: 'Unicode code point (hex)' },
      { syntax: String.raw`\xYY`, description: 'Hex character (2 digits)' },
    ],
  },
  {
    title: 'Flags',
    items: [
      { syntax: 'g', description: 'Global — find all matches' },
      { syntax: 'i', description: 'Ignore case' },
      { syntax: 'm', description: '^ and $ match each line' },
      { syntax: 's', description: '. matches newlines (dotAll)' },
      { syntax: 'u', description: 'Full Unicode' },
      { syntax: 'y', description: 'Sticky — match at lastIndex' },
    ],
  },
  {
    title: 'Replacement specials',
    items: [
      { syntax: '$&', description: 'Insert the entire match' },
      { syntax: '$1, $2, …', description: 'Insert captured group n' },
      { syntax: '$`', description: 'Insert preceding string' },
      { syntax: "$'", description: 'Insert following string' },
      { syntax: '$$', description: 'Insert a literal $' },
    ],
  },
];
