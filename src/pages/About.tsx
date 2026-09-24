import { Code } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { AboutPage, AboutSection, CodeBlock } from 'react-cheminfo/ui';

import { ABOUT } from '../about.ts';

/**
 * The About page: the shared record every site of the family shows, plus the
 * one section that belongs to this one — what carries over to the tools a
 * reader will meet a regular expression in next.
 * @returns The page.
 */
export function About(): ReactElement {
  return (
    <AboutPage content={ABOUT}>
      <BeyondJavaScript />
    </AboutPage>
  );
}

function BeyondJavaScript(): ReactElement {
  return (
    <AboutSection title="Beyond JavaScript" className="about-beyond-javascript">
      <p style={FIRST_PARAGRAPH_STYLE}>
        Character classes, quantifiers, anchors and groups are written the same
        way across the PCRE-like family, so most of what you write here runs
        elsewhere unchanged. Lookbehind, named groups, Unicode escapes,
        possessive quantifiers and the shorthand classes <Code>\d</Code> and{' '}
        <Code>\w</Code> are not universal: check the dialect of the tool before
        assuming one is there.
      </p>

      <h3 style={HEADING_STYLE}>
        <Code>grep</Code> — search files on the command line
      </h3>
      <p style={PARAGRAPH_STYLE}>
        <Code>grep</Code> reads Basic Regular Expressions by default, where{' '}
        <Code>+</Code>, <Code>?</Code> and <Code>{'{n,m}'}</Code> have to be
        escaped. Pass <Code>-E</Code> for extended syntax, or <Code>-P</Code>{' '}
        for Perl-compatible — the one that has <Code>\d</Code>, <Code>\w</Code>{' '}
        and lookarounds. Add <Code>-n</Code> for line numbers, <Code>-o</Code>{' '}
        to print the matched portion alone, <Code>-r</Code> to recurse.
      </p>
      <CodeBlock
        code={GREP_COMMANDS}
        tone="muted"
        copyable
        className="about-command"
      />
      <p style={PARAGRAPH_STYLE}>
        <ExternalLink href="https://github.com/BurntSushi/ripgrep">
          ripgrep
        </ExternalLink>{' '}
        (<Code>rg</Code>) is a faster alternative running the Rust regex engine,
        which reads much like <Code>grep -P</Code>.
      </p>

      <h3 style={HEADING_STYLE}>
        <Code>sed</Code> — stream-edit text
      </h3>
      <p style={PARAGRAPH_STYLE}>
        <Code>sed</Code> replaces. Pass <Code>-E</Code> for extended syntax,
        quote the expression with single quotes on a Unix shell, and write
        back-references as <Code>\1</Code> and <Code>\2</Code> rather than
        JavaScript&rsquo;s <Code>$1</Code>. The <Code>g</Code> after the closing
        slash means every match on the line, not just the first.
      </p>
      <CodeBlock
        code={SED_COMMANDS}
        tone="muted"
        copyable
        className="about-command"
      />
      <p style={PARAGRAPH_STYLE}>
        On macOS, BSD <Code>sed -i</Code> wants a backup suffix — write{' '}
        <Code>{`sed -i ''`}</Code> for none — and GNU extensions such as{' '}
        <Code>\U</Code> are missing. Install <Code>gsed</Code> from Homebrew for
        GNU behaviour.
      </p>

      <h3 style={HEADING_STYLE}>
        Python — the <Code>re</Code> module
      </h3>
      <p style={PARAGRAPH_STYLE}>
        Python&rsquo;s <Code>re</Code> is close to JavaScript and a little
        richer: named groups, verbose mode, full lookbehind. Write every pattern
        as a raw string, <Code>r&quot;...&quot;</Code>, or Python eats the
        backslashes before <Code>re</Code> sees them.
      </p>
      <CodeBlock
        code={PYTHON_EXAMPLE}
        tone="muted"
        copyable
        className="about-command"
      />
      <p style={PARAGRAPH_STYLE}>
        The third-party{' '}
        <ExternalLink href="https://github.com/mrabarnett/mrab-regex">
          regex
        </ExternalLink>{' '}
        module drops in for <Code>re</Code> and adds variable-width lookbehind,
        fuzzy matching and Unicode properties.
      </p>
    </AboutSection>
  );
}

function ExternalLink(props: { href: string; children: string }): ReactElement {
  const { href, children } = props;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: 'var(--accent)' }}
    >
      {children}
    </a>
  );
}

const FIRST_PARAGRAPH_STYLE = { margin: 0 } as const satisfies CSSProperties;

const PARAGRAPH_STYLE = { margin: '8px 0 0' } as const satisfies CSSProperties;

const HEADING_STYLE = {
  margin: '16px 0 0',
  fontSize: 14,
  fontWeight: 600,
} as const satisfies CSSProperties;

const GREP_COMMANDS = String.raw`# find ISO dates in every .log file under the current dir
grep -rnE '[0-9]{4}-[0-9]{2}-[0-9]{2}' .

# only the matched values, using PCRE shorthand classes
grep -roP '\d{4}-\d{2}-\d{2}' .

# lines that DO NOT contain "ERROR"
grep -v 'ERROR' app.log`;

const SED_COMMANDS = String.raw`# swap "first last" into "last, first" in place
sed -E -i 's/^([A-Za-z]+) ([A-Za-z]+)$/\2, \1/' names.txt

# delete blank lines
sed -E '/^\s*$/d' file.txt

# uppercase a hex colour
echo '#abcdef' | sed -E 's/.*/\U&/'`;

const PYTHON_EXAMPLE = String.raw`import re

# Every digit run in a string
re.findall(r"\d+", "Room 42, floor 7")           # -> ['42', '7']

# Named groups
m = re.match(r"(?P<year>\d{4})-(?P<month>\d{2})", "2026-05")
m.group("year"), m.group("month")                  # -> ('2026', '05')

# Replace, with a backreference
re.sub(r"\b(\w+) \1\b", r"\1", "the the cat")  # -> 'the cat'

# Verbose / commented patterns
pattern = re.compile(r"""
    \b           # word boundary
    \d{4}        # year
    -
    \d{2}        # month
""", re.VERBOSE)`;
