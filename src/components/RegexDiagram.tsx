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
  const pendingRenderRef = useRef<Promise<void>>(Promise.resolve());
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (pattern === '' || error) {
      container.replaceChildren();
      return;
    }

    let cancelled = false;
    let job: RegexperJob | null = null;

    // Chain through any in-flight cancelled render so its DOM writes finish
    // before we clear the container and start a new one. Without this, in
    // React StrictMode the first run's `render()` resolves *after* cancel
    // and stamps stale `<g>` nodes into the SVG the second run just created.
    const previous = pendingRenderRef.current;
    const current = previous.then(async () => {
      if (cancelled) return;
      container.replaceChildren();
      setRenderError(null);
      job = renderRegex(
        `/${pattern}/${flags}`,
        container,
      ) as unknown as RegexperJob;
      try {
        await job;
      } catch (error_: unknown) {
        if (cancelled) return;
        const message =
          error_ instanceof Error ? error_.message : String(error_);
        if (message === 'Render cancelled') return;
        setRenderError(message);
      }
    });
    pendingRenderRef.current = current;

    return () => {
      cancelled = true;
      job?.cancel();
    };
  }, [pattern, flags, error]);

  let message: string | null = null;
  if (pattern === '') {
    message = 'Type a regular expression to see its diagram.';
  } else if (error) {
    message = 'The regex is not valid yet, fix the error to see the diagram.';
  } else if (renderError) {
    message = `Could not render diagram: ${renderError}`;
  }

  return (
    <div className="viz-diagram">
      <div ref={containerRef} />
      {message !== null && <div className="viz-empty">{message}</div>}
    </div>
  );
}
