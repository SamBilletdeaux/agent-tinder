import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchResult } from '../engine/types';

interface Props {
  match: MatchResult;
  onDone: () => void;
}

const confettiColors = ['#E04A00', '#FF6D24', '#A2D728', '#737373', '#FFAFAD', '#171717'];

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

  const scoreColor = pct >= 70 ? 'var(--secondary)' : pct >= 45 ? 'var(--accent)' : 'var(--destructive)';

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
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(250,250,250,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => { setShow(false); setTimeout(onDone, 300); }}
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md p-8 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--elevation-sm)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent bar */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(to right, var(--primary), var(--accent), var(--secondary))' }}
            />

            <div
              className="w-16 h-16 flex items-center justify-center mb-6"
              style={{
                background: 'var(--input-bg)',
                borderRadius: 'var(--radius-card)',
                fontSize: 'var(--text-h2)',
                border: '1px solid var(--border)',
              }}
            >
              {match.agent.emoji}
            </div>

            <h2
              className="font-bold m-0 mb-2"
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-h2)' }}
            >
              It's a Match!
            </h2>

            <div
              className="font-bold leading-none mb-6"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-h1)', color: scoreColor }}
            >
              {pct}%
            </div>

            <p className="m-0 mb-8" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--muted-fg)' }}>
              {match.explanation}
            </p>

            <button
              onClick={() => { setShow(false); setTimeout(onDone, 300); }}
              className="w-full py-3 font-medium cursor-pointer"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-fg)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius-button)',
                border: 'none',
              }}
            >
              Keep Swiping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
