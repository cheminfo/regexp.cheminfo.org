import type { MatchInfo } from '../types.ts';

interface Props {
  matches: MatchInfo[];
}

const MAX_DISPLAYED = 20;

/**
 * Render every match with the value of each replacement token (`$&`, `` $` ``,
 * `$'`, numbered `$1…`, named `$<name>`). Helps users see exactly what each
 * group captured when debugging a regex.
 * @param props - The list of matches produced by `findMatches`.
 * @param props.matches - Matches with prefix, suffix, numbered and named groups.
 * @returns A list of per-match capture tables, or `null` if there are no matches.
 */
export function MatchDetails({ matches }: Props) {
  if (matches.length === 0) return null;

  const displayed = matches.slice(0, MAX_DISPLAYED);
  const overflow = matches.length - displayed.length;

  return (
    <div className="match-details">
      {displayed.map((match, idx) => (
        // eslint-disable-next-line react/no-array-index-key -- match position is stable for a given (regex, text) pair
        <MatchCard key={`${idx}-${match.index}`} match={match} index={idx} />
      ))}
      {overflow > 0 && (
        <div className="match-details-overflow">
          … {overflow} more match{overflow === 1 ? '' : 'es'} not shown.
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, index }: { match: MatchInfo; index: number }) {
  const namedEntries = match.namedGroups
    ? Object.entries(match.namedGroups)
    : [];

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className="match-card-title">Match #{index + 1}</span>
        <span className="match-card-position">at index {match.index}</span>
      </div>
      <table className="match-card-table">
        <tbody>
          <Row token="$&" label="whole match" value={match.value} />
          <Row token="$`" label="before" value={match.prefix} />
          <Row token="$'" label="after" value={match.suffix} />
          {match.groups.map((group, groupIdx) => {
            const groupNumber = groupIdx + 1;
            return (
              <Row
                key={`g-${groupNumber}`}
                token={`$${groupNumber}`}
                label={`group ${groupNumber}`}
                value={group}
              />
            );
          })}
          {namedEntries.map(([name, value]) => (
            <Row
              key={`n-${name}`}
              token={`$<${name}>`}
              label="named"
              value={value}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  token,
  label,
  value,
}: {
  token: string;
  label: string;
  value: string | undefined;
}) {
  return (
    <tr>
      <td className="match-card-token">
        <code>{token}</code>
      </td>
      <td className="match-card-label">{label}</td>
      <td className="match-card-value">
        {value === undefined ? (
          <span className="match-card-undefined">undefined</span>
        ) : value === '' ? (
          <span className="match-card-empty">(empty)</span>
        ) : (
          <code>{value}</code>
        )}
      </td>
    </tr>
  );
}
