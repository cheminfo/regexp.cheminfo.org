import { Tag } from '@blueprintjs/core';

import type { MatchSegment } from '../types.ts';

interface Props {
  segments: MatchSegment[];
  count: number;
}

/**
 * Render the test text with regex matches highlighted in yellow.
 * Zero-width matches are rendered as small caret-like markers.
 * @param props - The segmented text and match count.
 * @param props.segments - Alternating match / non-match segments to render.
 * @param props.count - Total number of matches in the text.
 * @returns The highlighted text block plus a match summary tag.
 */
export function HighlightedText({ segments, count }: Props) {
  const isEmpty =
    segments.length === 0 ||
    (segments.length === 1 &&
      !segments[0]?.isMatch &&
      segments[0]?.text === '');

  if (isEmpty) {
    return (
      <>
        <div className="highlight-output">
          <span className="empty-string">
            Type some text above to see matches.
          </span>
        </div>
        <div className="match-summary">
          <Tag minimal>0 matches</Tag>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="highlight-output" aria-live="polite">
        {segments.map((segment, idx) => {
          const key = `${idx}-${segment.text}-${String(segment.isMatch)}`;
          if (!segment.isMatch) {
            return <span key={key}>{segment.text}</span>;
          }
          if (segment.text === '') {
            return (
              <mark key={key} className="empty" title="Zero-width match" />
            );
          }
          return (
            <mark key={key} title={`Match #${(segment.matchIndex ?? 0) + 1}`}>
              {segment.text}
            </mark>
          );
        })}
      </div>
      <div className="match-summary">
        <Tag intent={count > 0 ? 'success' : 'none'} minimal>
          {count} match{count === 1 ? '' : 'es'}
        </Tag>
      </div>
    </>
  );
}
