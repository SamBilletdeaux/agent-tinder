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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold mb-5 tracking-widest uppercase">
          The Machine
        </div>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-2">
          Agent Match
        </h1>
        <p className="text-slate-400 text-base">Who are you today?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mb-8">
        {presetPersonas.map((persona, i) => (
          <motion.button
            key={persona.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(persona)}
            className="group text-left px-6 py-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                {stateIcons[persona.state]}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">{persona.name}</div>
                <div className="flex gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100">
                    {roleLabels[persona.role]}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100">
                    {stateLabels[persona.state]}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed">"{persona.vibe}"</p>
          </motion.button>
        ))}
      </div>

      {!showCustom ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowCustom(true)}
          className="text-slate-400 hover:text-slate-600 transition-colors text-sm cursor-pointer"
        >
          or build your own profile →
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200/80"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <h3 className="text-base font-semibold text-slate-900 mb-4">Build Your Profile</h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wider">Role</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as Role)}
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                >
                  {(Object.entries(roleLabels) as [Role, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wider">State</label>
                <select
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value as StateOfReadiness)}
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                >
                  {(Object.entries(stateLabels) as [StateOfReadiness, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wider">Fluency</label>
                <select
                  value={customFluency}
                  onChange={(e) => setCustomFluency(e.target.value as Fluency)}
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                >
                  {(Object.entries(fluencyLabels) as [Fluency, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCustomSubmit}
              disabled={!customName.trim()}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            >
              Start Matching
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
