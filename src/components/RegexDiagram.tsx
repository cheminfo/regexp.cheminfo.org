import { useEffect, useRef, useState } from 'react';
import { render as renderRegex } from 'regexper';

interface Props {
  pattern: string;
  flags: string;
  error: string | null;
}

// `regexper`'s `render(expression, container)` lazily injects the
// `#svg-container-base` template that the Parser setter reads from.
// `new Parser(container)` directly would skip that init and throw
// `Cannot read properties of null (reading 'innerHTML')`. We also rely on
// it returning a Promise with a `.cancel()` method (its `.d.ts` says
// `void`, the implementation actually returns a cancellable Promise).
type RegexperJob = Promise<{ warnings: string[] }> & { cancel: () => void };

/**
 * Render the regex as a railroad diagram using the `regexper` library
 * (same renderer as regexper.com). The diagram is rebuilt whenever the
 * pattern or flags change; in-flight renders are cancelled to avoid
 * stale output overwriting the latest one.
 * @param props - The pattern, flags and current compile error.
 * @param props.pattern - The regex source to visualise.
 * @param props.flags - The active flag string.
 * @param props.error - Compile error, or `null` if the regex parses.
 * @returns The diagram component.
 */
export function RegexDiagram({ pattern, flags, error }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pattern === '' || error) return;

    container.replaceChildren();
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-adjust-state-on-prop-change -- clear stale async error before kicking off a new render
    setRenderError(null);

    const job = renderRegex(
      `/${pattern}/${flags}`,
      container,
    ) as unknown as RegexperJob;
    let cancelled = false;
    job.catch((error_: unknown) => {
      if (cancelled) return;
      const message = error_ instanceof Error ? error_.message : String(error_);
      if (message === 'Render cancelled') return;
      setRenderError(message);
    });

    return () => {
      cancelled = true;
      job.cancel();
    };
  }, [pattern, flags, error]);

  if (pattern === '') {
    return (
      <div className="viz-diagram">
        <div className="viz-empty">
          Type a regular expression to see its diagram.
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="viz-diagram">
        <div className="viz-empty">
          The regex is not valid yet, fix the error to see the diagram.
        </div>
      </div>
    );
  }
  if (renderError) {
    return (
      <div className="viz-diagram">
        <div className="viz-empty">Could not render diagram: {renderError}</div>
      </div>
    );
  }

  return <div ref={containerRef} className="viz-diagram" />;
}
