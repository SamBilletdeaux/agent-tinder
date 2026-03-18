import { motion } from 'motion/react'
import type { CardData } from '../data'
import { cn } from '../utils'

interface MatchModalProps {
  match: CardData
  onClose: () => void
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-[family:var(--font-beausite)]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-card text-card-foreground border border-border p-8 rounded-[var(--radius-card)] shadow-[var(--elevation-sm)] flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="w-16 h-16 bg-input-background rounded-[var(--radius-card)] flex items-center justify-center text-[var(--text-h2)] mb-6 shadow-sm border border-border">
          {match.icon}
        </div>

        <h2 className="text-[var(--text-h2)] font-bold m-0 font-[family:var(--font-beausite)] mb-2">It's a Match!</h2>

        <div
          className={cn(
            'text-[var(--text-h1)] font-bold leading-none font-[family:var(--font-aeonik)] mb-6',
            match.score >= 70 ? 'text-secondary' : match.score >= 50 ? 'text-accent' : 'text-destructive',
          )}
        >
          {match.score}%
        </div>

        <p className="text-[var(--text-base)] text-muted-foreground font-[family:var(--font-beausite)] m-0 mb-8">
          {match.explanation}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-primary text-primary-foreground text-[var(--text-base)] font-medium py-3 rounded-[var(--radius-button)] font-[family:var(--font-aeonik)] hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  )
}
