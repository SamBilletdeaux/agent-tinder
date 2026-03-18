import type { MatchResult } from '../engine/types';
import MatchBreakdown from './MatchBreakdown';

interface Props {
  match: MatchResult;
}

export default function AgentCard({ match }: Props) {
  const { agent, totalScore, isAntiNeedCapped } = match;
  const pct = Math.round(totalScore * 100);

  const accent = isAntiNeedCapped
    ? { bar: '#f59e0b', text: '#92400e', label: 'Anti-need' }
    : pct >= 70
      ? { bar: '#10b981', text: '#065f46', label: 'Strong match' }
      : pct >= 45
        ? { bar: '#f59e0b', text: '#92400e', label: 'Moderate' }
        : { bar: '#ef4444', text: '#991b1b', label: 'Low match' };

  return (
    <div
      className="h-full flex flex-col rounded-2xl bg-white overflow-hidden select-none border border-slate-200/80"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {/* Accent bar */}
      <div className="h-1.5 flex-shrink-0" style={{ background: accent.bar }} />

      <div className="flex-1 px-10 pt-10 pb-8 flex flex-col">
        {/* Header: emoji + name + score */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-5xl flex-shrink-0">
              {agent.emoji}
            </div>
            <div>
              <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{agent.name}</h3>
              <p className="text-base text-slate-400 mt-1">{agent.tagline}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-6">
            <div className="text-5xl font-bold tracking-tight" style={{ color: accent.bar }}>
              {pct}
              <span className="text-2xl font-semibold">%</span>
            </div>
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: accent.text }}>
              {accent.label}
            </span>
          </div>
        </div>

        {/* Anti-need callout */}
        {isAntiNeedCapped && (
          <div className="mb-6 px-5 py-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
            <span className="text-amber-500 text-lg mt-0.5">⚠</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              Score capped — some signals conflict with your current state.
            </p>
          </div>
        )}

        {/* Explanation */}
        <p className="text-base text-slate-500 leading-relaxed mb-6">{match.explanation}</p>

        {/* Signal pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {agent.primarySignals.map((s) => (
            <span
              key={s}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-600 border border-slate-100"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Score breakdown — always visible, fills remaining space */}
        <div className="flex-1">
          <MatchBreakdown match={match} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-10 py-4 bg-slate-50/80 border-t border-slate-100 text-sm font-medium text-slate-400 flex-shrink-0">
        <span>← Skip</span>
        <span>Add to toolkit →</span>
      </div>
    </div>
  );
}
