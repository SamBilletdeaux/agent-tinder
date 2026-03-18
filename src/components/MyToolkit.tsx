import { motion } from 'framer-motion';
import type { UserProfile } from '../engine/types';
import type { MatchResult } from '../engine/matching';
import { roleLabels, stateLabels } from '../data/personas';

interface Props {
  profile: UserProfile;
  toolkit: MatchResult[];
  onSwitchPersona: () => void;
}

function groupByTier(toolkit: MatchResult[]): Record<string, MatchResult[]> {
  const groups: Record<string, MatchResult[]> = {};
  for (const match of toolkit) {
    const tier = match.totalScore >= 0.7 ? 'Core Agents' : match.totalScore >= 0.45 ? 'Support Agents' : 'Situational';
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push(match);
  }
  return groups;
}

export default function MyToolkit({ profile, toolkit, onSwitchPersona }: Props) {
  const grouped = groupByTier(toolkit);

  return (
    <div
      className="min-h-screen px-4 py-8 max-w-2xl mx-auto"
      style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-body)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1
          className="font-bold m-0 mb-2"
          style={{ fontSize: 'var(--text-h2)', fontFamily: 'var(--font-body)' }}
        >
          {profile.name}'s Toolkit
        </h1>
        <div className="flex items-center justify-center gap-2 mb-3">
          {[roleLabels[profile.role], stateLabels[profile.state]].map((label) => (
            <span
              key={label}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-caption)',
                background: 'var(--muted)',
                color: 'var(--muted-fg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-badge)',
                opacity: 0.6,
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="m-0" style={{ color: 'var(--muted-fg)', fontSize: 'var(--text-base)' }}>
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
          className="mb-8"
        >
          <h3
            className="font-bold mb-3 m-0"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-caption)',
              letterSpacing: '0.2em',
              color: 'var(--muted-fg)',
              textTransform: 'uppercase',
            }}
          >
            {groupName}
          </h3>
          <div className="flex flex-col gap-3">
            {matches.sort((a, b) => b.totalScore - a.totalScore).map((match, i) => {
              const pct = Math.round(match.totalScore * 100);
              const scoreColor = match.isAntiNeedCapped
                ? 'var(--accent)'
                : pct >= 70 ? 'var(--secondary)' : pct >= 45 ? 'var(--accent)' : 'var(--destructive)';

              return (
                <motion.div
                  key={match.agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.15 + i * 0.05 }}
                  className="flex items-center gap-4 p-4"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: 'var(--input-bg)',
                      borderRadius: 'var(--radius-badge)',
                    }}
                  >
                    {match.agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="font-semibold m-0"
                        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}
                      >
                        {match.agent.name}
                      </h4>
                      {match.isAntiNeedCapped && (
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--accent)' }}>⚠</span>
                      )}
                    </div>
                    <p
                      className="m-0 truncate"
                      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--muted-fg)' }}
                    >
                      {match.agent.tagline}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="font-bold"
                      style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-h4)', color: scoreColor }}
                    >
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
        className="text-center mt-10 space-y-3"
      >
        <button
          onClick={onSwitchPersona}
          className="px-6 py-3 font-medium cursor-pointer"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-fg)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-button)',
            border: 'none',
          }}
        >
          Switch Persona — See Different Results
        </button>
        <p className="m-0" style={{ fontSize: 'var(--text-caption)', color: 'var(--muted-fg)' }}>
          Same agents, different person = completely different toolkit
        </p>
      </motion.div>
    </div>
  );
}
