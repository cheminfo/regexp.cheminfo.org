import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  H4,
  InputGroup,
  TextArea,
} from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import { HighlightedText } from '../components/HighlightedText.tsx';
import { MatchDetails } from '../components/MatchDetails.tsx';
import { RegexDiagram } from '../components/RegexDiagram.tsx';
import { RegexInput } from '../components/RegexInput.tsx';
import { applyReplace, compileRegex, findMatches } from '../regex/compile.ts';

const DEFAULT_TEXT = `Lorem ipsum dolor sit asd. amet, consectetur adipiscing elit.
Integer nec odio. Praesent libero. Sed cursus ante dapibus
diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed
augue semper porta. Mauris massa. Vestibulum lacinia arcu
eget nulla. Class aptent taciti sociosqu ad litora torquent
per conubia nostra, per inceptos himenaeos. Curabitur
sodales ligula in libero. Sed dignissim lacinia nunc.
Curabitur tortor. Pellentesque nibh. Aenean quam.`;

/**
 * The interactive playground. Lets the student write any regex, toggle the
 * flags, paste any text and see matches highlighted in real time alongside
 * the railroad diagram and an optional replace preview.
 * @returns The playground page.
 */
export function Playground() {
  const [pattern, setPattern] = useState(String.raw`\b\w{4,}\b`);
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState(DEFAULT_TEXT);
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const compiled = useMemo(
    () => compileRegex(pattern, flags),
    [pattern, flags],
  );
  const matchResult = useMemo(
    () => findMatches(compiled.regex, text),
    [compiled.regex, text],
  );
  const replaced = useMemo(
    () => applyReplace(compiled.regex, text, replacement),
    [compiled.regex, text, replacement],
  );

  return (
    <div className="section-stack">
      <div className="split">
        <div className="section-stack">
          <Card elevation={1}>
            <H4>Your regular expression</H4>
            <RegexInput
              pattern={pattern}
              flags={flags}
              error={compiled.error}
              onPatternChange={setPattern}
              onFlagsChange={setFlags}
              placeholder="\\b\\w+\\b"
            />
            <div style={{ marginTop: 12 }}>
              <ButtonGroup>
                <Button
                  icon="swap-horizontal"
                  intent={showReplace ? 'primary' : 'none'}
                  onClick={() => {
                    setShowReplace((v) => !v);
                  }}
                  text={showReplace ? 'Hide replace' : 'Show replace'}
                />
                <Button
                  icon="reset"
                  onClick={() => {
                    setText(DEFAULT_TEXT);
                  }}
                  text="Reset sample text"
                />
              </ButtonGroup>
            </div>
            {showReplace && (
              <FormGroup
                label="Replace with"
                style={{ marginTop: 12 }}
                helperText="Use $& for the whole match, $1 / $2 / … for groups."
              >
                <InputGroup
                  value={replacement}
                  onChange={(event) => {
                    setReplacement(event.target.value);
                  }}
                  placeholder="$1, $&, …"
                  fill
                />
              </FormGroup>
            )}
          </Card>

          <Card elevation={1}>
            <H4>Text to test against</H4>
            <TextArea
              className="test-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
              }}
              fill
              autoResize={false}
              spellCheck={false}
            />
          </Card>
        </div>

        <div className="section-stack">
          <Card elevation={1}>
            <H4>Diagram</H4>
            <RegexDiagram
              pattern={pattern}
              flags={flags}
              error={compiled.error}
            />
          </Card>
          <Card elevation={1}>
            <H4>Matching result</H4>
            <HighlightedText
              segments={matchResult.segments}
              count={matchResult.count}
            />
            {showReplace && matchResult.matches.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <H4 style={{ fontSize: 13, color: '#5c7080' }}>
                  Capture groups
                </H4>
                <MatchDetails matches={matchResult.matches} />
              </div>
            )}
            {showReplace && (
              <div style={{ marginTop: 14 }}>
                <H4 style={{ fontSize: 13, color: '#5c7080' }}>
                  After replacement
                </H4>
                <pre
                  style={{
                    margin: 0,
                    padding: 10,
                    background: '#f5f8fa',
                    border: '1px solid #d3d8de',
                    borderRadius: 3,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {replaced}
                </pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
