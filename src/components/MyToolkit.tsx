import { motion } from 'framer-motion';
import type { UserProfile } from '../engine/types';
import type { MatchResult } from '../engine/matching';
import { roleLabels, stateLabels } from '../data/personas';

interface Props {
  profile: UserProfile;
  toolkit: MatchResult[];
  onSwitchPersona: () => void;
}

function groupByBestState(toolkit: MatchResult[]): Record<string, MatchResult[]> {
  const groups: Record<string, MatchResult[]> = {};
  for (const match of toolkit) {
    const tier = match.totalScore >= 0.7 ? 'Core Agents' : match.totalScore >= 0.45 ? 'Support Agents' : 'Situational';
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push(match);
  }
  return groups;
}

export default function MyToolkit({ profile, toolkit, onSwitchPersona }: Props) {
  const grouped = groupByBestState(toolkit);

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {profile.name}'s Toolkit
        </h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {roleLabels[profile.role]}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {stateLabels[profile.state]}
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          {toolkit.length === 0
            ? "You didn't select any agents. Try a different persona?"
            : `${toolkit.length} agents selected for your current workflow.`
          }
        </p>
      </motion.div>

      {Object.entries(grouped).map(([groupName, matches], gi) => (
        <motion.div
          key={groupName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.15 }}
          className="mb-6"
        >
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {groupName}
          </h2>
          <div className="space-y-2">
            {matches.sort((a, b) => b.totalScore - a.totalScore).map((match, i) => {
              const pct = Math.round(match.totalScore * 100);
              const scoreColor = match.isAntiNeedCapped
                ? '#d97706'
                : pct >= 70 ? '#059669' : pct >= 45 ? '#d97706' : '#dc2626';

              return (
                <motion.div
                  key={match.agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.15 + i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl card-surface border border-slate-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {match.agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-900">{match.agent.name}</h3>
                      {match.isAntiNeedCapped && (
                        <span className="text-xs text-amber-600">⚠</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{match.agent.tagline}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold" style={{ color: scoreColor }}>
                      {pct}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 space-y-3"
      >
        <button
          onClick={onSwitchPersona}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors font-medium cursor-pointer"
        >
          Switch Persona — See Different Results
        </button>
        <p className="text-xs text-slate-400">
          Same agents, different person = completely different toolkit
        </p>
      </motion.div>
    </div>
  );
}
