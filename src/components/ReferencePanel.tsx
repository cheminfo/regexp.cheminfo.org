import { Card, H4, Tooltip } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import type { ReferenceItem } from '../data/reference.ts';
import { REFERENCE_SECTIONS } from '../data/reference.ts';

import { SyntaxTooltip } from './SyntaxTooltip.tsx';

/**
 * Render the regex cheatsheet — a grid of categorised reference cards.
 * Every item that carries `detail` + `example` shows a rich dark tooltip
 * on hover, using the same component as the flag toggle buttons.
 * @returns The cheatsheet card.
 */
export function ReferencePanel() {
  return (
    <Card elevation={1} aria-label="Regular expression cheatsheet">
      <H4>Cheatsheet</H4>
      <div className="reference-grid">
        {REFERENCE_SECTIONS.map((section) => (
          <div key={section.title}>
            <H4 style={{ marginTop: 4, marginBottom: 8, color: '#0e5a91' }}>
              {section.title}
            </H4>
            <table className="reference-table">
              <tbody>
                {section.items.map((item) => (
                  <ReferenceRow key={item.syntax} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReferenceRow({ item }: { item: ReferenceItem }) {
  const hasRichTooltip = Boolean(item.detail && item.example && item.name);
  const syntaxCell = <code>{item.syntax}</code>;

  if (!hasRichTooltip) {
    return (
      <tr>
        <td>{syntaxCell}</td>
        <td>{item.description}</td>
      </tr>
    );
  }

  const tooltipContent = (
    <SyntaxTooltip
      content={{
        syntax: item.syntax,
        name: item.name ?? item.syntax,
        tag: item.tag,
        summary: item.description,
        detail: item.detail ?? '',
        example: item.example ?? { pattern: '', input: '', note: '' },
      }}
    />
  );

  const wrap = (child: ReactNode) => (
    <Tooltip
      content={tooltipContent}
      placement="right"
      hoverOpenDelay={150}
      popoverClassName="syntax-tooltip-popover"
    >
      {child}
    </Tooltip>
  );

  return (
    <tr className="reference-row-interactive">
      <td>{wrap(<span className="reference-syntax">{syntaxCell}</span>)}</td>
      <td>
        {wrap(
          <span className="reference-description">{item.description}</span>,
        )}
      </td>
    </tr>
  );
}
