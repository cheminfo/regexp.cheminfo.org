import { Button } from '@blueprintjs/core';

import { ReferencePanel } from '../components/ReferencePanel.tsx';

/**
 * The cheatsheet page. Shows the full regex reference plus a print button.
 * @returns The cheatsheet page.
 */
export function Cheatsheet() {
  return (
    <div className="section-stack cheatsheet-page">
      <div className="cheatsheet-toolbar no-print">
        <Button
          icon="print"
          intent="primary"
          onClick={() => globalThis.print()}
        >
          Print
        </Button>
      </div>
      <ReferencePanel />
    </div>
  );
}
