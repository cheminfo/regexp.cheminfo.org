import { Button, InputGroup, Tooltip } from '@blueprintjs/core';

import { FLAGS } from '../data/flags.ts';
import type { FlagKey } from '../types.ts';

import { SyntaxTooltip } from './SyntaxTooltip.tsx';

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
              content={
                <SyntaxTooltip
                  content={{
                    syntax: flag.key,
                    name: flag.name,
                    tag: `RegExp.prototype.${flag.property}`,
                    summary: flag.description,
                    detail: flag.detail,
                    example: flag.example,
                  }}
                />
              }
              placement="bottom"
              hoverOpenDelay={150}
              popoverClassName="syntax-tooltip-popover"
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
