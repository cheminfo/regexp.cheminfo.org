export interface SyntaxTooltipExample {
  /** A regex literal (or fragment) showing the syntax in use. */
  pattern: string;
  /** Sample input text to run the pattern against. */
  input: string;
  /** Natural-language note describing what the example demonstrates. */
  note: string;
}

export interface SyntaxTooltipContent {
  /** The syntax / key shown in the highlighted yellow chip on the left. */
  syntax: string;
  /** Friendly name of the construct (e.g. "Word boundary", "ignoreCase"). */
  name: string;
  /** Optional grey label aligned right (e.g. "RegExp.prototype.unicode"). */
  tag?: string;
  /** One-line headline summary. */
  summary: string;
  /** Longer prose explanation. */
  detail: string;
  /** Concrete usage example. */
  example: SyntaxTooltipExample;
}

/**
 * Render the dark rich tooltip body used across the app for regex
 * constructs (flags, character classes, anchors, etc.). Pair with a
 * BlueprintJS `<Tooltip popoverClassName="syntax-tooltip-popover">`.
 * @param props - The structured content to display.
 * @param props.content - The tooltip payload (syntax, summary, example, …).
 * @returns The tooltip body.
 */
export function SyntaxTooltip({ content }: { content: SyntaxTooltipContent }) {
  return (
    <div className="syntax-tooltip">
      <div className="syntax-tooltip-header">
        <code className="syntax-tooltip-key">{content.syntax}</code>
        <span className="syntax-tooltip-name">{content.name}</span>
        {content.tag && (
          <code className="syntax-tooltip-tag">{content.tag}</code>
        )}
      </div>
      <div className="syntax-tooltip-summary">{content.summary}</div>
      <div className="syntax-tooltip-detail">{content.detail}</div>
      <div className="syntax-tooltip-example">
        <div className="syntax-tooltip-example-row">
          <span className="syntax-tooltip-example-label">Pattern</span>
          <code>{content.example.pattern}</code>
        </div>
        <div className="syntax-tooltip-example-row">
          <span className="syntax-tooltip-example-label">Input</span>
          <code>{content.example.input}</code>
        </div>
        <div className="syntax-tooltip-example-note">
          {content.example.note}
        </div>
      </div>
    </div>
  );
}
