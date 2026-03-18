import { motion } from 'framer-motion';
import type { MatchResult } from '../engine/types';
import { actionLevelLabels } from '../data/personas';

interface Props {
  match: MatchResult;
}

const dimensionLabels: Record<string, string> = {
  signalAlignment: 'Signal Alignment',
  roleRelevance: 'Role Relevance',
  fluencyMatch: 'Fluency Match',
  actionOrientation: 'Action Level',
  workingStyle: 'Working Style',
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score * 100);
  const isLow = pct < 50;
  const barColor = isLow ? 'var(--destructive)' : 'var(--secondary)';
  const textColor = isLow ? 'var(--destructive)' : 'var(--secondary)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)' }}>
        <span className="font-medium" style={{ color: 'var(--muted-fg)' }}>
          {label} <span style={{ opacity: 0.5 }}>({pct}%)</span>
        </span>
        <span className="font-bold" style={{ color: textColor }}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export default function MatchBreakdown({ match }: Props) {
  const { agent, dimensions } = match;

  return (
    <div className="mt-4 flex-1">
      <h3
        className="font-bold mb-4 m-0"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-caption)',
          letterSpacing: '0.25em',
          color: 'var(--muted-fg)',
          textTransform: 'uppercase',
        }}
      >
        Score Breakdown
      </h3>

      <div className="flex flex-col gap-4 mt-3">
        {Object.entries(dimensions).map(([key, value]) => (
          <ScoreBar
            key={key}
            label={dimensionLabels[key]}
            score={value}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-4 mt-8"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-caption)',
          color: 'var(--muted-fg)',
        }}
      >
        <div className="flex gap-2">
          <span className="font-bold">{actionLevelLabels[agent.actionLevel]}</span>
          <span>{agent.workingStyle}</span>
        </div>
        <div>{agent.groundedIn}</div>
      </div>

      {match.antiNeedWarning && (
        <div
          className="mt-6 px-5 py-4"
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: '#9a3412' }}>
            <span className="font-bold">Anti-need protection:</span> {match.antiNeedWarning}
          </p>
        </div>
      )}
    </div>
  );
}
