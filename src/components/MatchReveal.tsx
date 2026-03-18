import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchResult } from '../engine/types';

interface Props {
  match: MatchResult;
  onDone: () => void;
}

const confettiColors = ['#059669', '#0d9488', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: confettiColors[i % confettiColors.length],
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function MatchReveal({ match, onDone }: Props) {
  const [show, setShow] = useState(true);
  const pct = Math.round(match.totalScore * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 300);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => { setShow(false); setTimeout(onDone, 300); }}
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center p-8 max-w-sm rounded-2xl bg-white shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
              {match.agent.emoji}
            </div>
            <h2 className="text-2xl font-bold mb-1 text-slate-900">
              It's a Match!
            </h2>
            <p className="text-3xl font-bold text-emerald-600 mb-3">{pct}%</p>
            <p className="text-slate-500 text-sm leading-relaxed">{match.explanation}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
