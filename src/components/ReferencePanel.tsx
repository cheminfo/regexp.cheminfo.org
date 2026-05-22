import { Card, H4 } from '@blueprintjs/core';

import { REFERENCE_SECTIONS } from '../data/reference.ts';

/**
 * Render the regex cheatsheet — a grid of categorised reference cards.
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
                  <tr key={item.syntax}>
                    <td>
                      <code>{item.syntax}</code>
                    </td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Card>
  );
}
