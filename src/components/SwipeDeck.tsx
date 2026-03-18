import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import type { UserProfile } from '../engine/types';
import { agents } from '../data/agents';
import { roleLabels, stateLabels } from '../data/personas';
import { rankAgents } from '../engine/matching';
import type { MatchResult } from '../engine/matching';
import AgentCard from './AgentCard';
import MatchReveal from './MatchReveal';

const SWIPE_THRESHOLD = 100;

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
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('left');
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        y: stackOffset * 8,
        scale: 1 - stackOffset * 0.02,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
    >
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-6 py-4 z-10 sticky top-0 flex-shrink-0"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchPersona}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer transition-opacity hover:opacity-80"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-fg)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-base)',
              border: 'none',
            }}
          >
            {profile.name[0]}
          </button>
          <div className="flex items-baseline gap-2">
            <span className="font-bold" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>
              {profile.name}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', color: 'var(--muted-fg)' }}>
              {roleLabels[profile.role]} · {stateLabels[profile.state]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="font-bold"
            style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', color: 'var(--muted-fg)' }}
          >
            {progress} / {total}
          </span>
          <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(progress / total) * 100}%`, background: 'var(--fg)' }}
            />
          </div>
        </div>
      </header>

      {/* Main — card fills remaining space */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-0">
        <div className="w-full max-w-2xl h-[650px] relative">
          <AnimatePresence>
            {remaining.slice(0, 3).reverse().map((match, i, arr) => {
              const isTop = i === arr.length - 1;
              const stackOffset = arr.length - 1 - i;
              const isLast = remaining.length === 1;
              return (
                <SwipeCard
                  key={match.agent.id}
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
                <div
                  className="w-20 h-20 flex items-center justify-center text-3xl mx-auto mb-5"
                  style={{ background: 'var(--input-bg)', borderRadius: 'var(--radius-card)' }}
                >
                  ✅
                </div>
                <p className="font-semibold text-xl mb-1">All agents reviewed</p>
                <p className="mb-6" style={{ color: 'var(--muted-fg)' }}>{toolkit.length} added to your toolkit</p>
                <button
                  onClick={() => onFinish(toolkit)}
                  className="px-6 py-3 font-medium cursor-pointer"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-fg)',
                    borderRadius: 'var(--radius-button)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-base)',
                    border: 'none',
                  }}
                >
                  See Your Toolkit
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        {!allDone && topMatch && (
          <div className="flex items-center gap-6 mt-8 z-10">
            <button
              onClick={() => {
                const isLast = remaining.length === 1;
                isLast ? handleLastSwipe('left', topMatch) : handleSwipe('left', topMatch);
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:border-red-400 hover:text-red-500"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--muted-fg)',
              }}
              aria-label="Skip"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <button
              onClick={() => {
                const isLast = remaining.length === 1;
                isLast ? handleLastSwipe('right', topMatch) : handleSwipe('right', topMatch);
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--muted-fg)',
              }}
              aria-label="Add to toolkit"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        )}
      </main>

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
