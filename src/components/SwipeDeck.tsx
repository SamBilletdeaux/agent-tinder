import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { UserProfile } from '../engine/types';
import { agents } from '../data/agents';
import { roleLabels, stateLabels } from '../data/personas';
import { rankAgents } from '../engine/matching';
import type { MatchResult } from '../engine/matching';
import AgentCard from './AgentCard';
import MatchReveal from './MatchReveal';

const SWIPE_THRESHOLD = 100;
const EXIT_X = 1200;

interface Props {
  profile: UserProfile;
  onFinish: (toolkit: MatchResult[]) => void;
  onSwitchPersona: () => void;
}

function SwipeCard({
  match,
  isTop,
  zIndex,
  stackOffset,
  onSwipe,
}: {
  match: MatchResult;
  isTop: boolean;
  zIndex: number;
  stackOffset: number;
  onSwipe: (dir: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-6, 6]);
  const skipOpacity = useTransform(x, [-120, -40], [1, 0]);
  const addOpacity = useTransform(x, [40, 120], [0, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        y: stackOffset * 8,
        scale: 1 - stackOffset * 0.02,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing', scale: 1.01 }}
    >
      {isTop && (
        <>
          <motion.div
            className="absolute -top-3 left-8 z-10 px-4 py-1.5 rounded-lg bg-red-500 text-white font-semibold text-xs tracking-wide uppercase shadow-lg"
            style={{ opacity: skipOpacity }}
          >
            Skip
          </motion.div>
          <motion.div
            className="absolute -top-3 right-8 z-10 px-4 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold text-xs tracking-wide uppercase shadow-lg"
            style={{ opacity: addOpacity }}
          >
            Add
          </motion.div>
        </>
      )}
      <AgentCard match={match} />
    </motion.div>
  );
}

export default function SwipeDeck({ profile, onFinish, onSwitchPersona }: Props) {
  const ranked = useMemo(() => rankAgents(agents, profile), [profile]);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [toolkit, setToolkit] = useState<MatchResult[]>([]);
  const [matchReveal, setMatchReveal] = useState<MatchResult | null>(null);

  const remaining = ranked.filter((m) => !gone.has(m.agent.id));
  const topMatch = remaining[0] ?? null;

  const handleSwipe = useCallback((dir: 'left' | 'right', match: MatchResult) => {
    setGone((prev) => new Set(prev).add(match.agent.id));
    if (dir === 'right') {
      setToolkit((prev) => [...prev, match]);
      setMatchReveal(match);
    }
  }, []);

  const progress = gone.size;
  const total = ranked.length;
  const allDone = progress >= total;

  const handleLastSwipe = useCallback((dir: 'left' | 'right', match: MatchResult) => {
    handleSwipe(dir, match);
    const newToolkit = dir === 'right' ? [...toolkit, match] : toolkit;
    setTimeout(() => onFinish(newToolkit), 600);
  }, [handleSwipe, toolkit, onFinish]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            {profile.name[0]}
          </div>
          <span className="text-sm font-semibold text-slate-900">{profile.name}</span>
          <span className="text-xs text-slate-400">
            {roleLabels[profile.role]} · {stateLabels[profile.state]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium">{progress} / {total}</span>
          <div className="w-24 h-1 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-slate-900"
              animate={{ width: `${(progress / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <button
            onClick={onSwitchPersona}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Card area — fills all remaining space */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative w-full h-full max-w-3xl max-h-[720px]">
          <AnimatePresence>
            {remaining.slice(0, 3).reverse().map((match, i, arr) => {
              const isTop = i === arr.length - 1;
              const stackOffset = arr.length - 1 - i;
              const isLast = remaining.length === 1;
              return (
                <motion.div
                  key={match.agent.id}
                  className="absolute inset-0"
                  initial={false}
                  exit={{ x: EXIT_X, opacity: 0, transition: { duration: 0.3 } }}
                >
                  <SwipeCard
                    match={match}
                    isTop={isTop}
                    zIndex={i}
                    stackOffset={stackOffset}
                    onSwipe={(dir) =>
                      isLast
                        ? handleLastSwipe(dir, match)
                        : handleSwipe(dir, match)
                    }
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5">✅</div>
                <p className="text-xl text-slate-700 font-semibold mb-1">All agents reviewed</p>
                <p className="text-slate-400 mb-6">{toolkit.length} added to your toolkit</p>
                <button
                  onClick={() => onFinish(toolkit)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors text-sm font-medium cursor-pointer"
                >
                  See Your Toolkit
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action buttons — pinned to bottom */}
      {!allDone && topMatch && (
        <div className="flex items-center justify-center gap-5 pb-6 flex-shrink-0">
          <button
            onClick={() => {
              const isLast = remaining.length === 1;
              isLast ? handleLastSwipe('left', topMatch) : handleSwipe('left', topMatch);
            }}
            className="group w-16 h-16 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-xl hover:border-red-300 hover:text-red-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <span className="group-hover:scale-110 transition-transform">✕</span>
          </button>
          <button
            onClick={() => {
              const isLast = remaining.length === 1;
              isLast ? handleLastSwipe('right', topMatch) : handleSwipe('right', topMatch);
            }}
            className="group w-16 h-16 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-xl hover:border-emerald-300 hover:text-emerald-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <span className="group-hover:scale-110 transition-transform">♥</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {matchReveal && (
          <MatchReveal
            match={matchReveal}
            onDone={() => setMatchReveal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
