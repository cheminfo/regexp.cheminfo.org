import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  FormGroup,
  H4,
  Icon,
  InputGroup,
  TextArea,
  Tooltip,
} from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import {
  GlossaryDescription,
  GlossaryEntryTooltip,
} from '../components/GlossaryTooltip.tsx';
import { HighlightedText } from '../components/HighlightedText.tsx';
import { MatchDetails } from '../components/MatchDetails.tsx';
import { RegexDiagram } from '../components/RegexDiagram.tsx';
import { RegexInput } from '../components/RegexInput.tsx';
import type { TutorialStep } from '../data/tutorial.ts';
import {
  TRY_IT_HELP,
  TUTORIAL_LEVELS,
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
        <div className="tutorial-levels">
          {TUTORIAL_LEVELS.map((meta) => {
            const stepsForLevel = TUTORIAL_STEPS.map((step, idx) => ({
              step,
              idx,
            })).filter(({ step }) => step.level === meta.level);
            return (
              <div
                key={meta.level}
                className="tutorial-level"
                style={{ background: meta.background }}
              >
                <span className="tutorial-level-label">{meta.label}</span>
                <div className="tutorial-level-buttons">
                  {stepsForLevel.map(({ step, idx }) => {
                    const isActive = idx === stepIndex;
                    return (
                      <Button
                        key={step.title}
                        size="small"
                        onClick={() => {
                          goToStep(idx);
                        }}
                        title={step.title}
                        style={{
                          background: isActive
                            ? meta.activeBackground
                            : 'white',
                          fontWeight: isActive ? 700 : 500,
                          border: isActive
                            ? '1px solid #5c7080'
                            : '1px solid #d3d8de',
                        }}
                        text={String(idx + 1)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <ButtonGroup>
            <Button
              icon="arrow-left"
              onClick={() => {
                goToStep(stepIndex - 1);
              }}
              disabled={stepIndex === 0}
              text="Previous"
            />
            <Button
              endIcon="arrow-right"
              intent="primary"
              onClick={() => {
                goToStep(stepIndex + 1);
              }}
              disabled={stepIndex >= TUTORIAL_STEPS.length - 1}
              text="Next"
            />
          </ButtonGroup>
        </div>
      </Card>

      <Callout intent="primary" icon="info-sign" title={currentStep.title}>
        <GlossaryDescription description={currentStep.description} />
      </Callout>

      <div className="split">
        <div className="section-stack">
          <Card elevation={1}>
            <div className="card-heading">
              <H4 style={{ margin: 0 }}>Try it</H4>
              <Tooltip
                content={<GlossaryEntryTooltip entry={TRY_IT_HELP} />}
                popoverClassName="glossary-popover"
                placement="right"
              >
                <Icon
                  icon="help"
                  size={14}
                  aria-label="How to use the playground"
                />
              </Tooltip>
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
                <pre className="replace-output">{replaced}</pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
