import type { MatchResult } from '../engine/types';
import MatchBreakdown from './MatchBreakdown';

interface Props {
  match: MatchResult;
}

const sectionHeader = {
  fontFamily: 'var(--font-ui)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.25em',
  color: 'var(--muted-fg)',
  textTransform: 'uppercase' as const,
  fontWeight: 700,
};

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

      <div className="flex-1 p-10 flex flex-col gap-6 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
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
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h4)', color: 'var(--muted-fg)' }}>
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
            <div className="font-bold mt-1" style={{ ...sectionHeader, letterSpacing: '0.2em' }}>
              {accent.label}
            </div>
          </div>
        </div>

        {/* Anti-need callout */}
        {isAntiNeedCapped && (
          <div
            className="px-5 py-4 flex items-start gap-3"
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

        {/* What it does */}
        <div>
          <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--muted-fg)' }}>
            {agent.description}
          </p>
        </div>

        {/* Why it matters for you */}
        <div
          className="px-5 py-4"
          style={{
            background: 'var(--input-bg)',
            borderRadius: 'var(--radius-card)',
            borderLeft: `3px solid ${accent.bar}`,
          }}
        >
          <h3 className="m-0 mb-2" style={sectionHeader}>Why this matters for you</h3>
          <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--fg)' }}>
            {match.projectRelevance}
          </p>
        </div>

        {/* Example output */}
        <div>
          <h3 className="m-0 mb-2" style={sectionHeader}>Example Output</h3>
          <div
            className="px-5 py-4"
            style={{
              background: 'var(--input-bg)',
              borderRadius: 'var(--radius-badge)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--fg)',
              fontStyle: 'italic',
            }}
          >
            "{agent.exampleOutput}"
          </div>
        </div>

        {/* Data sources + signals */}
        <div className="flex gap-8">
          <div className="flex-1">
            <h3 className="m-0 mb-2" style={sectionHeader}>Data Sources</h3>
            <div className="flex gap-2 flex-wrap">
              {agent.dataSources.map((ds) => (
                <span
                  key={ds}
                  className="font-medium"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-caption)',
                    background: 'var(--input-bg)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-badge)',
                  }}
                >
                  {ds}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="m-0 mb-2" style={sectionHeader}>Signals</h3>
            <div className="flex gap-2 flex-wrap">
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
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-badge)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div>
          <h3 className="m-0 mb-2" style={sectionHeader}>Limitations</h3>
          <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--muted-fg)' }}>
            {agent.limitations}
          </p>
        </div>

        {/* Score Breakdown */}
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
