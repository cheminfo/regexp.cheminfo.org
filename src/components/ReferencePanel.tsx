import { Card, H4 } from '@blueprintjs/core';
import { ReferenceGrid } from 'react-cheminfo/ui';

import { REFERENCE_SECTIONS } from '../data/reference.ts';

/**
 * Render the regex cheatsheet — a grid of categorised reference blocks.
 * Every row that carries a tooltip shows the same rich dark popover as the
 * flag toggle buttons.
 * @returns The cheatsheet card.
 */
export function ReferencePanel() {
  return (
    <Card elevation={1} aria-label="Regular expression cheatsheet">
      <H4>Cheatsheet</H4>
      <ReferenceGrid sections={REFERENCE_SECTIONS} minColumnWidth={260} />
    </Card>
  );
}
