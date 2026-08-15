export interface BrandMarkProps {
  /**
   * Edge of the square the mark is drawn in, in pixels.
   * @default 26
   */
  size?: number;
}

/**
 * The mark: the smallest pattern that matches anything, set in the site's two
 * colours. The subject is the notation itself, so the mark is the notation
 * rather than a picture of it, and two elements is all it takes — which is what
 * keeps it legible at 16 px.
 *
 * Kept in step with `public/favicon.svg`, which is the same geometry written
 * out with literal colours because a file served on its own cannot read the
 * page's custom properties.
 * @param props - The mark size.
 * @param props.size - Edge of the square the mark is drawn in, in pixels.
 * @returns The mark, as an inline SVG.
 */
export function BrandMark(props: BrandMarkProps) {
  const { size = 26 } = props;

  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="12" fill="var(--brand)" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="34"
        fontWeight="700"
        fill="var(--brand-alt)"
      >
        .*
      </text>
    </svg>
  );
}

export interface WordmarkProps {
  /**
   * Extra class names, for sizing or spacing at the place it is used.
   * @default undefined
   */
  className?: string;
}

/**
 * The name, in the two colours this site owns — the way chemcalc.org writes
 * `ChemCalc`. Always lowercase, and always the whole address minus the `.org`,
 * because the address is the name here.
 *
 * The mark's yellow reaches about 1.3:1 on white, far too little for text, so
 * the second half is set in a darkened one of the same hue.
 * @param props - The wordmark options.
 * @param props.className - Extra class names, for sizing or spacing.
 * @returns The site name, in its two colours.
 */
export function Wordmark(props: WordmarkProps) {
  const { className } = props;

  return (
    <span className={className ? `wordmark ${className}` : 'wordmark'}>
      <span className="wordmark__lead">regexp</span>
      <span className="wordmark__dot">.</span>
      <span className="wordmark__alt">cheminfo</span>
    </span>
  );
}
