import { Tooltip } from '@blueprintjs/core';
import { Fragment } from 'react';

import type { GlossaryEntry } from '../data/glossary.ts';
import { GLOSSARY } from '../data/glossary.ts';

const TERM_MARKER = /\[\[(?<term>[^\]]+)\]\]/g;

interface GlossaryDescriptionProps {
  description: string;
}

/**
 * Render a description string and turn `[[term]]` markers that have a
 * matching {@link GLOSSARY} entry into hoverable, tooltipped chips. Unknown
 * markers fall back to their inner text.
 * @param props - The description to render.
 * @param props.description - Text that may contain `[[term]]` markers.
 * @returns Inline React nodes.
 */
export function GlossaryDescription({ description }: GlossaryDescriptionProps) {
  const parts = description.split(TERM_MARKER);
  return (
    <>
      {parts.map((part, idx) => {
        const key = `${idx}:${part}`;
        if (idx % 2 === 0) return <Fragment key={key}>{part}</Fragment>;
        const entry = GLOSSARY[part.toLowerCase()];
        if (!entry) return <Fragment key={key}>{part}</Fragment>;
        return (
          <Tooltip
            key={key}
            content={<GlossaryEntryTooltip entry={entry} />}
            popoverClassName="glossary-popover"
          >
            <span className="glossary-term">{part}</span>
          </Tooltip>
        );
      })}
    </>
  );
}

/**
 * Render the body of a glossary or "Try it" tooltip — title, summary, then a
 * list of examples each showing the pattern in monospace plus an optional
 * sample text and note.
 * @param props - The entry to render.
 * @param props.entry - Glossary entry to display.
 * @returns Tooltip body markup.
 */
export function GlossaryEntryTooltip({ entry }: { entry: GlossaryEntry }) {
  return (
    <div className="glossary-tooltip">
      <div className="glossary-tooltip__title">{entry.title}</div>
      <div className="glossary-tooltip__summary">{entry.summary}</div>
      {entry.examples.length > 0 && (
        <ul className="glossary-tooltip__examples">
          {entry.examples.map((example) => (
            <li key={`${example.pattern}::${example.text ?? ''}`}>
              <code>/{example.pattern}/</code>
              {example.text !== undefined && (
                <>
                  {' on '}
                  <code>{JSON.stringify(example.text)}</code>
                </>
              )}
              {example.note && (
                <div className="glossary-tooltip__note">{example.note}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
