import type { MatchResult } from '../engine/types';
import MatchBreakdown from './MatchBreakdown';

interface Props {
  match: MatchResult;
}

export default function AgentCard({ match }: Props) {
  const { agent, totalScore, isAntiNeedCapped } = match;
  const pct = Math.round(totalScore * 100);

  const accent = isAntiNeedCapped
    ? { bar: 'var(--accent)', text: 'var(--accent)', label: 'ANTI-NEED' }
    : pct >= 70
      ? { bar: 'var(--secondary)', text: 'var(--secondary)', label: 'STRONG MATCH' }
      : pct >= 45
        ? { bar: 'var(--accent)', text: 'var(--accent)', label: 'MODERATE' }
        : { bar: 'var(--destructive)', text: 'var(--destructive)', label: 'LOW MATCH' };

  return (
    <div
      className="h-full flex flex-col overflow-hidden select-none"
      style={{
        background: 'var(--card)',
        color: 'var(--card-fg)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--elevation-sm)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-2 w-full flex-shrink-0" style={{ background: accent.bar }} />

      <div className="flex-1 p-10 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex gap-5">
            <div
              className="w-16 h-16 flex items-center justify-center text-4xl flex-shrink-0 shadow-sm"
              style={{
                background: 'var(--input-bg)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
              }}
            >
              {agent.emoji}
            </div>
            <div className="flex flex-col">
              <h2
                className="font-bold tracking-tight m-0"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h2)' }}
              >
                {agent.name}
              </h2>
              <span
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h4)', color: 'var(--muted-fg)' }}
              >
                {agent.tagline}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className="font-bold leading-none tracking-tighter"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-h1)', color: accent.text }}
            >
              {pct}<span style={{ fontSize: 'var(--text-h3)', fontWeight: 400 }}>%</span>
            </div>
            <div
              className="font-bold mt-1"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-caption)',
                letterSpacing: '0.25em',
                color: 'var(--muted-fg)',
              }}
            >
              {accent.label}
            </div>
          </div>
        </div>

        {/* Anti-need callout */}
        {isAntiNeedCapped && (
          <div
            className="mb-8 px-5 py-4 flex items-start gap-3"
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <span className="text-lg mt-0.5" style={{ color: 'var(--accent)' }}>⚠</span>
            <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: '#9a3412' }}>
              Score capped — some signals conflict with your current state.
            </p>
          </div>
        )}

        {/* Description */}
        <p className="m-0 mb-6" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--muted-fg)' }}>
          {match.explanation}
        </p>

        {/* Tags */}
        <div className="flex gap-3 flex-wrap mb-8">
          {agent.primarySignals.map((s) => (
            <span
              key={s}
              className="font-medium"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-caption)',
                background: 'var(--input-bg)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-badge)',
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Score Breakdown — always visible */}
        <MatchBreakdown match={match} />
      </div>

      {/* Footer */}
      <div
        className="flex justify-between px-10 py-5 flex-shrink-0"
        style={{
          background: 'var(--card)',
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-cta)',
          color: 'var(--muted-fg)',
          fontWeight: 500,
        }}
      >
        <button
          className="flex items-center gap-1 cursor-pointer transition-colors"
          style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-cta)', fontWeight: 500 }}
        >
          ← Skip
        </button>
        <button
          className="flex items-center gap-1 cursor-pointer transition-colors"
          style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-cta)', fontWeight: 500 }}
        >
          Add to toolkit →
        </button>
      </div>
    </div>
  );
}
