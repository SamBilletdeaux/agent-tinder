import { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserProfile, Role, StateOfReadiness, Fluency } from '../engine/types';
import { presetPersonas, roleLabels, stateLabels, fluencyLabels } from '../data/personas';

interface Props {
  onSelect: (profile: UserProfile) => void;
}

const stateIcons: Record<StateOfReadiness, string> = {
  scouting: '🔭',
  evaluating: '🔍',
  making: '🎨',
  orchestrating: '🎼',
};

export default function PersonaSelect({ onSelect }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customRole, setCustomRole] = useState<Role>('strategy-lead');
  const [customState, setCustomState] = useState<StateOfReadiness>('scouting');
  const [customFluency, setCustomFluency] = useState<Fluency>('intermediate');
  const [customName, setCustomName] = useState('');

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    onSelect({
      id: 'custom',
      name: customName.trim(),
      role: customRole,
      state: customState,
      fluency: customFluency,
      vibe: `Custom profile: ${roleLabels[customRole]} in ${stateLabels[customState]} mode`,
      color: '#64748b',
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-body)' }}
    >
      <div className="max-w-4xl w-full flex flex-col items-center gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="px-3 py-1 rounded-full font-bold uppercase"
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-caption)',
              letterSpacing: '0.2em',
            }}
          >
            The Machine
          </div>
          <h1
            className="font-bold text-center tracking-tight m-0"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h1)' }}
          >
            Agent Match
          </h1>
          <h3
            className="m-0"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h3)', color: 'var(--muted-fg)' }}
          >
            Who are you today?
          </h3>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          {presetPersonas.map((persona, i) => (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(persona)}
              className="group flex flex-col p-6 cursor-pointer text-left transition-colors"
              style={{
                background: 'var(--card)',
                color: 'var(--card-fg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--input-bg)', fontSize: 'var(--text-h3)' }}
                >
                  {stateIcons[persona.state]}
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="font-medium m-0"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h4)' }}
                  >
                    {persona.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[roleLabels[persona.role], stateLabels[persona.state]].map((role) => (
                      <span
                        key={role}
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
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="m-0" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--muted-fg)' }}>
                "{persona.vibe}"
              </p>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        {!showCustom ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1 cursor-pointer transition-colors font-medium"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-cta)',
              color: 'var(--muted-fg)',
              background: 'none',
              border: 'none',
            }}
          >
            or build your own profile →
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-md w-full p-6"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <h3
              className="font-medium mb-4 m-0"
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h4)' }}
            >
              Build Your Profile
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-3"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-button)',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
              />

              <div className="grid grid-cols-3 gap-3">
                {([
                  ['Role', customRole, (v: string) => setCustomRole(v as Role), roleLabels],
                  ['State', customState, (v: string) => setCustomState(v as StateOfReadiness), stateLabels],
                  ['Fluency', customFluency, (v: string) => setCustomFluency(v as Fluency), fluencyLabels],
                ] as const).map(([label, value, setter, labels]) => (
                  <div key={label}>
                    <label
                      className="block mb-1.5"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'var(--text-caption)',
                        letterSpacing: '0.15em',
                        color: 'var(--muted-fg)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-3 py-2"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-button)',
                        color: 'var(--fg)',
                        outline: 'none',
                      }}
                    >
                      {Object.entries(labels).map(([k, v]) => (
                        <option key={k} value={k}>{v as string}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customName.trim()}
                className="w-full py-3 font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-base)',
                  borderRadius: 'var(--radius-button)',
                  border: 'none',
                }}
              >
                Start Matching
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
