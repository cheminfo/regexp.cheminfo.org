import { ReferencePanel } from '../components/ReferencePanel.tsx';

/**
 * The cheatsheet page. Shows the full regex reference.
 * @returns The cheatsheet page.
 */
export function Cheatsheet() {
  return (
    <div className="section-stack cheatsheet-page">
      <ReferencePanel />
    </div>
  );
}
