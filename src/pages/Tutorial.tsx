import {
  Callout,
  Card,
  FormGroup,
  H4,
  InputGroup,
  TextArea,
} from '@blueprintjs/core';
import { useMemo, useState } from 'react';
import { GlossaryText, HelpIcon, TutorialStepStrip } from 'react-cheminfo/ui';

import { HighlightedText } from '../components/HighlightedText.tsx';
import { MatchDetails } from '../components/MatchDetails.tsx';
import { RegexDiagram } from '../components/RegexDiagram.tsx';
import { RegexInput } from '../components/RegexInput.tsx';
import { ReplaceOutput } from '../components/ReplaceOutput.tsx';
import type { TutorialStep } from '../data/tutorial.ts';
import {
  TRY_IT_HELP,
  TUTORIAL_LEVEL_LABELS,
  TUTORIAL_STEPS,
} from '../data/tutorial.ts';
import { applyReplace, compileRegex, findMatches } from '../regex/compile.ts';

const FIRST_STEP: TutorialStep = TUTORIAL_STEPS[0] ?? {
  title: '',
  description: '',
  pattern: '',
  flags: '',
  text: '',
  level: 'beginner',
};

/**
 * Renders the guided tutorial: a series of preloaded regex examples the
 * student can edit live, each annotated with a one-paragraph explanation
 * (with hoverable glossary terms) and a railroad diagram. Steps are grouped
 * in three color-coded levels: basics (green), search & replace (yellow)
 * and advanced (pink).
 * @returns The tutorial page.
 */
export function Tutorial() {
  const [stepIndex, setStepIndex] = useState(0);
  const [pattern, setPattern] = useState(FIRST_STEP.pattern);
  const [flags, setFlags] = useState(FIRST_STEP.flags);
  const [text, setText] = useState(FIRST_STEP.text);
  const [replacement, setReplacement] = useState(FIRST_STEP.replacement ?? '');

  const compiled = useMemo(
    () => compileRegex(pattern, flags),
    [pattern, flags],
  );
  const result = useMemo(
    () => findMatches(compiled.regex, text),
    [compiled.regex, text],
  );

  const currentStep = TUTORIAL_STEPS[stepIndex] ?? FIRST_STEP;
  const isReplaceStep = currentStep.replacement !== undefined;
  const replaced = useMemo(
    () =>
      isReplaceStep ? applyReplace(compiled.regex, text, replacement) : '',
    [isReplaceStep, compiled.regex, text, replacement],
  );

  function goToStep(index: number) {
    const target = TUTORIAL_STEPS[index];
    if (!target) return;
    setStepIndex(index);
    setPattern(target.pattern);
    setFlags(target.flags);
    setText(target.text);
    setReplacement(target.replacement ?? '');
  }

  return (
    <div className="section-stack">
      <Card elevation={1}>
        <H4>Guided tour</H4>
        <p style={{ marginTop: 0, color: '#5c7080' }}>
          Walk through the lessons step by step. Each step preloads a regex
          (and, when relevant, a replacement) — feel free to edit anything to
          experiment. Hover the underlined terms in the explanation for
          examples.
        </p>
        <div style={{ marginTop: 12 }}>
          <TutorialStepStrip
            steps={TUTORIAL_STEPS}
            activeIndex={stepIndex}
            onSelect={goToStep}
            levelLabels={TUTORIAL_LEVEL_LABELS}
          />
        </div>
      </Card>

      <Callout intent="primary" icon="info-sign" title={currentStep.title}>
        <GlossaryText text={currentStep.description} />
      </Callout>

      <div className="split">
        <div className="section-stack">
          <Card elevation={1}>
            <div className="card-heading">
              <H4 style={{ margin: 0 }}>Try it</H4>
              <HelpIcon
                content={{
                  title: TRY_IT_HELP.title,
                  body: (
                    <>
                      <div>{TRY_IT_HELP.summary}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                        {TRY_IT_HELP.flags.map((flag) => (
                          <li key={flag.key}>
                            <code>{flag.key}</code> — {flag.note}
                          </li>
                        ))}
                      </ul>
                    </>
                  ),
                }}
                size={14}
                placement="right"
              />
            </div>
            <RegexInput
              pattern={pattern}
              flags={flags}
              error={compiled.error}
              onPatternChange={setPattern}
              onFlagsChange={setFlags}
            />
            {isReplaceStep && (
              <FormGroup
                label="Replace with"
                style={{ marginTop: 12 }}
                helperText="$& = whole match, $1 / $2 / … = numbered groups, $<name> = named groups."
              >
                <InputGroup
                  value={replacement}
                  onChange={(event) => {
                    setReplacement(event.target.value);
                  }}
                  placeholder="$1, $&, $<name>, …"
                  fill
                />
              </FormGroup>
            )}
            <div style={{ marginTop: 12 }}>
              <TextArea
                className="test-text"
                style={{ minHeight: 140 }}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                }}
                fill
                autoResize={false}
                spellCheck={false}
              />
            </div>
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
            <H4>Matches</H4>
            <HighlightedText segments={result.segments} count={result.count} />
            {isReplaceStep && result.matches.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <H4 style={{ fontSize: 13, color: '#5c7080' }}>
                  Capture groups
                </H4>
                <MatchDetails matches={result.matches} />
              </div>
            )}
            {isReplaceStep && (
              <div style={{ marginTop: 14 }}>
                <H4 style={{ fontSize: 13, color: '#5c7080' }}>
                  After replacement
                </H4>
                <ReplaceOutput text={replaced} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
