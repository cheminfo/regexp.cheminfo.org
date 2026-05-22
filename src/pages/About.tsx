import { AnchorButton, Callout, Card, Code, H4, H5 } from '@blueprintjs/core';
import type React from 'react';

const LEGACY_VIEW_URL =
  'https://www.cheminfo.org/?viewURL=https%3A%2F%2Fcouch.cheminfo.org%2Fcheminfo-public%2F65f84b002399eb79ec0f8bf145113d71%2Fview.json&loadversion=true&fillsearch=RegExp+explorer';

const preStyle: React.CSSProperties = {
  margin: '8px 0',
  padding: 10,
  background: '#f5f8fa',
  border: '1px solid #d3d8de',
  borderRadius: 3,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: 'pre',
  overflowX: 'auto',
};

/**
 * About page. Tells the visitor who is behind the site, what legacy tool it
 * replaces, and where to find the source.
 * @returns The about page.
 */
export function About() {
  return (
    <div className="section-stack">
      <Card elevation={1}>
        <H4>About this site</H4>
        <p>
          <strong>regexp.cheminfo.org</strong> is an interactive pedagogic tool
          to learn regular expressions, with a guided tutorial, a live
          playground, a self-paced exercises module with hints and instant
          validation, and a complete cheatsheet.
        </p>
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '16px 0',
          }}
        >
          <span>This website is provided by Luc Patiny from</span>
          <a
            href="https://www.epfl.ch"
            target="_blank"
            rel="noreferrer"
            aria-label="EPFL"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <img
              src="/epfl-logo.svg"
              alt="EPFL"
              height={28}
              style={{ display: 'block' }}
            />
          </a>
        </p>
      </Card>

      <Card elevation={1}>
        <H4>Replaces the cheminfo &ldquo;RegExp explorer&rdquo; visualizer</H4>
        <p>
          This site is the modern, standalone replacement for the legacy
          &ldquo;RegExp explorer&rdquo; view embedded inside the cheminfo
          visualizer. It keeps the live tester and diagram from the original and
          adds the guided tutorial, the exercise module with hints and instant
          validation, and the printable cheatsheet.
        </p>
        <div
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}
        >
          <AnchorButton
            icon="history"
            href={LEGACY_VIEW_URL}
            target="_blank"
            rel="noreferrer"
            text="Open the legacy visualizer view"
          />
          <AnchorButton
            icon="globe"
            href="https://regexp.cheminfo.org"
            target="_blank"
            rel="noreferrer"
            text="regexp.cheminfo.org"
          />
        </div>
      </Card>

      <Card elevation={1}>
        <H4>Beyond JavaScript &mdash; regex is everywhere</H4>
        <p>
          This site uses the <strong>JavaScript</strong> regex engine (the one
          built into every browser, via the <Code>RegExp</Code> constructor).
          That is what the playground, the tutorial and the exercise checker all
          run against. The good news: almost everything you learn here transfers
          directly to other tools &mdash; the basic syntax for character
          classes, quantifiers, anchors and groups is the same across the
          &ldquo;PCRE-like&rdquo; family. Below are quick pointers for three
          flavours you will encounter constantly in real work.
        </p>

        <Callout
          intent="warning"
          icon="info-sign"
          title="Dialects differ in the details"
          style={{ marginTop: 8 }}
        >
          Lookbehind, named groups, Unicode escapes, possessive quantifiers, and
          shorthand classes like <Code>\d</Code> / <Code>\w</Code> are
          <em> not </em>universal. Always check the dialect of the tool you are
          using before assuming a feature is available.
        </Callout>

        <H5 style={{ marginTop: 16 }}>
          <Code>grep</Code> &mdash; search files on the command line
        </H5>
        <p style={{ marginTop: 4 }}>
          By default <Code>grep</Code> uses <em>Basic Regular Expressions</em>
          (BRE), where <Code>+</Code>, <Code>?</Code> and <Code>{'{n,m}'}</Code>
          must be escaped. Always reach for <Code>-E</Code> (extended) or
          <Code>-P</Code> (Perl-compatible &mdash; required for <Code>\d</Code>,{' '}
          <Code>\w</Code>, lookarounds&hellip;). Add <Code>-n</Code> to print
          line numbers, <Code>-o</Code> to print only the matched portion,{' '}
          <Code>-r</Code> to recurse.
        </p>
        <pre style={preStyle}>
          {String.raw`# find ISO dates in every .log file under the current dir
grep -rnE '[0-9]{4}-[0-9]{2}-[0-9]{2}' .

# only the matched values, using PCRE shorthand classes
grep -roP '\d{4}-\d{2}-\d{2}' .

# lines that DO NOT contain "ERROR"
grep -v 'ERROR' app.log`}
        </pre>
        <p>
          Tip:{' '}
          <a
            href="https://github.com/BurntSushi/ripgrep"
            target="_blank"
            rel="noreferrer"
          >
            ripgrep
          </a>{' '}
          (<Code>rg</Code>) is a modern, much faster alternative that uses the
          Rust regex engine &mdash; same flavour as grep&nbsp;<Code>-P</Code>{' '}
          for the most part.
        </p>

        <H5 style={{ marginTop: 16 }}>
          <Code>sed</Code> &mdash; stream-edit text
        </H5>
        <p style={{ marginTop: 4 }}>
          <Code>sed</Code> shines at <em>replacement</em>. Use <Code>-E</Code>{' '}
          for extended regex, single quotes around the expression on Unix
          shells, and back-references with <Code>\1</Code> / <Code>\2</Code> (
          <em>not</em> <Code>$1</Code> like in JavaScript). The <Code>g</Code>{' '}
          flag after the closing slash means &ldquo;every match on the
          line&rdquo;.
        </p>
        <pre style={preStyle}>
          {String.raw`# swap "first last" into "last, first" in place
sed -E -i 's/^([A-Za-z]+) ([A-Za-z]+)$/\2, \1/' names.txt

# delete blank lines
sed -E '/^\s*$/d' file.txt

# uppercase a hex colour
echo '#abcdef' | sed -E 's/.*/\U&/'`}
        </pre>
        <p>
          <strong>macOS caveat:</strong> BSD <Code>sed -i</Code> requires an
          explicit backup suffix (use <Code>{`sed -i ''`}</Code> for none), and
          some GNU extensions like <Code>\U</Code> are unavailable &mdash;
          install <Code>gsed</Code> via Homebrew if you need GNU behaviour.
        </p>

        <H5 style={{ marginTop: 16 }}>
          Python &mdash; the <Code>re</Code> module
        </H5>
        <p style={{ marginTop: 4 }}>
          Python&apos;s standard <Code>re</Code> module is very close to
          JavaScript but a bit richer (named groups, verbose mode, full
          lookbehind). Always pass patterns as <strong>raw strings</strong> (
          <Code>r&quot;...&quot;</Code>) so backslashes are not eaten by Python
          before <Code>re</Code> sees them.
        </p>
        <pre style={preStyle}>
          {String.raw`import re

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
""", re.VERBOSE)`}
        </pre>
        <p>
          For heavy work, the third-party{' '}
          <a
            href="https://github.com/mrabarnett/mrab-regex"
            target="_blank"
            rel="noreferrer"
          >
            <Code>regex</Code>
          </a>{' '}
          module is a drop-in replacement with variable-width lookbehind, fuzzy
          matching, and Unicode properties.
        </p>
      </Card>

      <Card elevation={1}>
        <H4>Source and license</H4>
        <p>
          Released under the{' '}
          <a
            href="https://github.com/cheminfo/regexp.cheminfo.org/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT licence
          </a>
          . Issues, suggestions and pull requests are welcome on GitHub.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <AnchorButton
            icon="git-repo"
            href="https://github.com/cheminfo/regexp.cheminfo.org"
            target="_blank"
            rel="noreferrer"
            text="Source on GitHub"
          />
          <AnchorButton
            icon="issue"
            href="https://github.com/cheminfo/regexp.cheminfo.org/issues"
            target="_blank"
            rel="noreferrer"
            text="Report an issue"
          />
        </div>
      </Card>
    </div>
  );
}
