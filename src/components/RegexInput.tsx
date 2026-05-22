import { Button, InputGroup, Tooltip } from '@blueprintjs/core';

import type { FlagDescriptor, FlagKey } from '../types.ts';

const FLAGS: FlagDescriptor[] = [
  {
    key: 'g',
    name: 'global',
    property: 'global',
    description: 'Find all matches in the input',
    detail:
      'Without g, methods like String.prototype.match() return only the first match. With g, match() returns every occurrence, replace() rewrites them all, and stateful methods (exec, test) advance lastIndex on each call.',
    example: {
      pattern: '/cat/g',
      input: 'cat and cat',
      note: 'matches both "cat" occurrences (count = 2). Without g, only the first is returned.',
    },
  },
  {
    key: 'i',
    name: 'ignoreCase',
    property: 'ignoreCase',
    description: 'Case-insensitive matching',
    detail:
      'Letters in the pattern match both upper- and lower-case versions in the input. Combined with the u flag, case-folding follows the full Unicode rules (e.g. ß ↔ SS).',
    example: {
      pattern: '/cat/i',
      input: 'The Cat sat on the MAT',
      note: 'matches "Cat" (and would match "CAT", "cAt", …).',
    },
  },
  {
    key: 'm',
    name: 'multiline',
    property: 'multiline',
    description: '^ and $ anchor to each line',
    detail:
      'Treats the input as multiple lines separated by line terminators. The anchors ^ and $ then match at the start/end of every line instead of only at the start/end of the whole string. The . metacharacter is unaffected — use the s flag for that.',
    example: {
      pattern: '/^cat/gm',
      input: 'cat\nand cat\ncat again',
      note: 'matches "cat" at the start of line 1 and line 3, but not the "cat" in the middle of line 2.',
    },
  },
  {
    key: 's',
    name: 'dotAll',
    property: 'dotAll',
    description: '. matches newline characters',
    detail: String.raw`By default the dot . matches any character except line terminators (\n, \r, U+2028, U+2029). With s, the dot matches those too — useful when scanning blocks of text that may span multiple lines.`,
    example: {
      pattern: String.raw`/<p>.*<\/p>/s`,
      input: '<p>line one\nline two</p>',
      note: 'matches the whole paragraph including the newline. Without s, the match would fail.',
    },
  },
  {
    key: 'u',
    name: 'unicode',
    property: 'unicode',
    description: 'Full Unicode mode',
    detail: String.raw`Treats the pattern as a sequence of Unicode code points rather than UTF-16 code units. Enables \u{1F600}-style code-point escapes, the \p{…} / \P{…} Unicode property classes, surrogate-pair-aware matching, and stricter syntax (lone backslashes and unknown escapes throw).`,
    example: {
      pattern: String.raw`/\p{Letter}+/gu`,
      input: 'café 你好 🐱',
      note: String.raw`matches "café" and "你好" as letters across scripts. \p{…} requires u (or v).`,
    },
  },
  {
    key: 'y',
    name: 'sticky',
    property: 'sticky',
    description: 'Anchor matches at lastIndex',
    detail:
      'A sticky regex only matches at the exact position given by regex.lastIndex, never further along the string. After a successful match, lastIndex advances to the end of the match — ideal for hand-written tokenizers/lexers that walk the input one token at a time.',
    example: {
      pattern: '/foo/y',
      input: '  foo',
      note: 'fails at position 0 because the input starts with spaces; would succeed only if lastIndex is set to 2.',
    },
  },
];

interface Props {
  pattern: string;
  flags: string;
  error: string | null;
  onPatternChange: (value: string) => void;
  onFlagsChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Render the regex input bar (slash-delimited pattern and flag input) plus a
 * row of toggle buttons for the six standard flags.
 * @param props - The pattern, flags, compile error and change handlers.
 * @param props.pattern - Current regex source.
 * @param props.flags - Current flag string.
 * @param props.error - Compile error, or `null` if the regex parses.
 * @param props.onPatternChange - Called when the pattern input changes.
 * @param props.onFlagsChange - Called when the flag input changes.
 * @param props.placeholder - Placeholder shown when the pattern is empty.
 * @returns The regex input bar.
 */
export function RegexInput({
  pattern,
  flags,
  error,
  onPatternChange,
  onFlagsChange,
  placeholder,
}: Props) {
  function toggleFlag(flag: FlagKey) {
    if (flags.includes(flag)) {
      onFlagsChange(flags.replaceAll(flag, ''));
    } else {
      onFlagsChange(flags + flag);
    }
  }

  return (
    <div>
      <div className="regex-line">
        <span className="delim">/</span>
        <div className="pattern-wrapper">
          <InputGroup
            value={pattern}
            onChange={(event) => {
              onPatternChange(event.target.value);
            }}
            placeholder={placeholder ?? 'Type your regular expression…'}
            intent={error ? 'danger' : 'none'}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Regular expression pattern"
            fill
          />
        </div>
        <span className="delim right">/</span>
        <div className="flags-wrapper">
          <InputGroup
            value={flags}
            onChange={(event) => {
              onFlagsChange(event.target.value);
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Regular expression flags"
            fill
          />
        </div>
      </div>
      {error && <div className="regex-error">⚠ {error}</div>}
      <div className="flag-toggles" role="group" aria-label="Toggle flags">
        {FLAGS.map((flag) => {
          const active = flags.includes(flag.key);
          return (
            <Tooltip
              key={flag.key}
              content={<FlagTooltipContent flag={flag} />}
              placement="bottom"
              hoverOpenDelay={150}
              popoverClassName="flag-tooltip-popover"
            >
              <Button
                size="small"
                active={active}
                intent={active ? 'primary' : 'none'}
                onClick={() => {
                  toggleFlag(flag.key);
                }}
                text={`${flag.key} · ${flag.name}`}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render the rich body shown when hovering a flag toggle button: headline,
 * detailed explanation, and a concrete example.
 * @param props - The flag descriptor to render.
 * @param props.flag - The flag whose metadata is displayed.
 * @returns The tooltip body.
 */
function FlagTooltipContent({ flag }: { flag: FlagDescriptor }) {
  return (
    <div className="flag-tooltip">
      <div className="flag-tooltip-header">
        <code className="flag-tooltip-key">{flag.key}</code>
        <span className="flag-tooltip-name">{flag.name}</span>
        <code className="flag-tooltip-property">
          RegExp.prototype.{flag.property}
        </code>
      </div>
      <div className="flag-tooltip-summary">{flag.description}</div>
      <div className="flag-tooltip-detail">{flag.detail}</div>
      <div className="flag-tooltip-example">
        <div className="flag-tooltip-example-row">
          <span className="flag-tooltip-example-label">Pattern</span>
          <code>{flag.example.pattern}</code>
        </div>
        <div className="flag-tooltip-example-row">
          <span className="flag-tooltip-example-label">Input</span>
          <code>{flag.example.input}</code>
        </div>
        <div className="flag-tooltip-example-note">{flag.example.note}</div>
      </div>
    </div>
  );
}
