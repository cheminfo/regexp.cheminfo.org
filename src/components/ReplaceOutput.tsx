import type { ReactElement } from 'react';
import { ClickToCopy } from 'react-cheminfo/ui';

interface Props {
  text: string;
}

/**
 * The text a search-and-replace leaves behind, as one click-to-copy block.
 * It is the result a visitor came for, so a click puts it on the clipboard.
 * @param props - The replaced text.
 * @param props.text - The output of `text.replace(regex, replacement)`.
 * @returns The replacement output block.
 */
export function ReplaceOutput({ text }: Props): ReactElement {
  return (
    <ClickToCopy
      as="div"
      className="replace-output"
      label="replaced text"
      value={text}
      disabled={text === ''}
    >
      <pre>{text}</pre>
    </ClickToCopy>
  );
}
