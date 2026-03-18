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

const dimensionWeights: Record<string, string> = {
  signalAlignment: '35%',
  roleRelevance: '25%',
  fluencyMatch: '15%',
  actionOrientation: '15%',
  workingStyle: '10%',
};

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-500 font-medium">{label} <span className="text-slate-300">({weight})</span></span>
        <span className="font-mono font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function MatchBreakdown({ match }: Props) {
  const { agent, dimensions } = match;

  return (
    <div className="pt-5 border-t border-slate-100">
      <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-3">Score Breakdown</div>
      <div>
        {Object.entries(dimensions).map(([key, value]) => (
          <ScoreBar
            key={key}
            label={dimensionLabels[key]}
            score={value}
            weight={dimensionWeights[key]}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
          {actionLevelLabels[agent.actionLevel]}
        </span>
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
          {agent.workingStyle}
        </span>
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100">
          {agent.groundedIn}
        </span>
      </div>

      {match.antiNeedWarning && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Anti-need protection:</span> {match.antiNeedWarning}
          </p>
        </div>
      )}
    </div>
  );
}
