import { Button, Card, H4, H5 } from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import type { GlossaryEntry } from '../data/glossary.ts';
import { GLOSSARY } from '../data/glossary.ts';

interface GlossaryRow {
  key: string;
  entry: GlossaryEntry;
}

/**
 * The glossary page. Surfaces every entry from {@link GLOSSARY} as a
 * printable, searchable list — the same content that powers the
 * `[[term]]` tooltips in tutorial and exercise descriptions.
 * @returns The glossary page.
 */
export function Glossary() {
  const [query, setQuery] = useState('');

  const allRows = useMemo<GlossaryRow[]>(
    () =>
      Object.entries(GLOSSARY)
        .map(([key, entry]) => ({ key, entry }))
        .toSorted((a, b) => a.entry.title.localeCompare(b.entry.title)),
    [],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return allRows;
    return allRows.filter(({ key, entry }) => {
      if (key.includes(needle)) return true;
      if (entry.title.toLowerCase().includes(needle)) return true;
      if (entry.summary.toLowerCase().includes(needle)) return true;
      return entry.examples.some(
        (example) =>
          example.pattern.toLowerCase().includes(needle) ||
          (example.note ?? '').toLowerCase().includes(needle),
      );
    });
  }, [allRows, query]);

  return (
    <div className="section-stack glossary-page">
      <div className="glossary-toolbar no-print">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder="Filter terms…"
          aria-label="Filter glossary terms"
          className="glossary-search bp6-input"
        />
        <Button
          icon="print"
          intent="primary"
          onClick={() => globalThis.print()}
        >
          Print
        </Button>
      </div>
      <Card elevation={1} aria-label="Regular expression glossary">
        <H4>Glossary</H4>
        <p style={{ marginTop: 0, color: '#5c7080' }}>
          Every term that appears underlined in the tutorial and exercise
          descriptions is defined here. Each entry shows a short summary and one
          or more concrete examples.
        </p>
        {rows.length === 0 ? (
          <div className="glossary-empty">
            No glossary entry matches &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="glossary-grid">
            {rows.map(({ key, entry }) => (
              <GlossaryCard key={key} entry={entry} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <article className="glossary-card">
      <H5 className="glossary-card__title">{entry.title}</H5>
      <p className="glossary-card__summary">{entry.summary}</p>
      {entry.examples.length > 0 && (
        <ul className="glossary-card__examples">
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
                <div className="glossary-card__note">{example.note}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
