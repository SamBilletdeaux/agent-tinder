import { useEffect } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react'
import { cn } from '../utils'
import type { CardData } from '../data'

interface SwipeCardProps {
  match: CardData
  onSwipe: (direction: 'left' | 'right') => void
}

const sectionHeader =
  'text-muted-foreground text-[var(--text-caption)] font-[family:var(--font-aeonik)] font-bold tracking-[0.2em] uppercase m-0'

export function SwipeCard({ match, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const controls = useAnimation()

  useEffect(() => {
    controls.start({ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } })
  }, [controls])

  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  const handleDragEnd = async (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('left')
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  const scoreColor = match.score >= 70 ? 'text-secondary' : match.score >= 50 ? 'text-accent' : 'text-destructive'
  const barColor = match.score >= 70 ? 'bg-secondary' : match.score >= 50 ? 'bg-accent' : 'bg-destructive'

  return (
    <motion.div
      className="absolute inset-0 bg-card text-card-foreground rounded-[var(--radius-card)] shadow-[var(--elevation-sm)] border border-border flex flex-col overflow-hidden font-[family:var(--font-beausite)]"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: 0.95, opacity: 0, x: 0 }}
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
      whileTap={{ cursor: 'grabbing' }}
      dragElastic={0.8}
    >
      {/* Accent bar */}
      <div className={cn('h-2 w-full', barColor)} />

      <div className="p-8 flex-1 flex flex-col gap-6 select-none overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-[var(--radius-card)] bg-input-background flex items-center justify-center text-[var(--text-h2)] shadow-sm border border-border">
              {match.icon}
            </div>
            <div className="flex flex-col">
              <h2 className="text-[var(--text-h2)] font-bold m-0 font-[family:var(--font-beausite)] tracking-tight">
                {match.name}
              </h2>
              <span className="text-[var(--text-h4)] text-muted-foreground font-[family:var(--font-beausite)]">
                {match.subtitle}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <div className={cn('text-[var(--text-h1)] font-bold leading-none font-[family:var(--font-aeonik)] tracking-tighter', scoreColor)}>
              {match.score}<span className="text-[var(--text-h3)] font-normal">%</span>
            </div>
            <div className="text-[var(--text-caption)] font-[family:var(--font-aeonik)] font-bold tracking-[0.2em] uppercase text-muted-foreground mt-1">
              {match.matchLevel}
            </div>
          </div>
        </div>

        {/* Anti-need callout */}
        {match.isAntiNeedCapped && match.antiNeedWarning && (
          <div className="px-5 py-4 rounded-[var(--radius-card)] bg-accent/10 border border-accent/20 flex items-start gap-3">
            <span className="text-accent text-lg mt-0.5">⚠</span>
            <p className="text-[var(--text-base)] m-0 text-accent-foreground/80">{match.antiNeedWarning}</p>
          </div>
        )}

        {/* What it does */}
        <p className="text-[var(--text-base)] m-0 font-[family:var(--font-beausite)] text-muted-foreground">
          {match.description}
        </p>

        {/* Why this matters for you */}
        <div className="px-5 py-4 rounded-[var(--radius-card)] bg-input-background border-l-[3px] border-l-primary">
          <h3 className={cn(sectionHeader, 'mb-2')}>Why this matters for you</h3>
          <p className="text-[var(--text-base)] m-0 font-[family:var(--font-beausite)] text-foreground">
            {match.projectRelevance}
          </p>
        </div>

        {/* Example output */}
        <div>
          <h3 className={cn(sectionHeader, 'mb-2')}>Example Output</h3>
          <div className="px-5 py-4 rounded-[var(--radius-badge)] bg-input-background text-[var(--text-base)] font-[family:var(--font-beausite)] text-foreground italic">
            "{match.exampleOutput}"
          </div>
        </div>

        {/* Data sources + signal tags */}
        <div className="flex gap-8">
          <div className="flex-1">
            <h3 className={cn(sectionHeader, 'mb-2')}>Data Sources</h3>
            <div className="flex gap-2 flex-wrap">
              {match.dataSources.map((ds) => (
                <span key={ds} className="bg-input-background text-foreground border border-border px-3 py-1 rounded-[var(--radius-badge)] text-[var(--text-caption)] font-medium font-[family:var(--font-aeonik)]">
                  {ds}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className={cn(sectionHeader, 'mb-2')}>Signals</h3>
            <div className="flex gap-2 flex-wrap">
              {match.tags.map((tag) => (
                <span key={tag} className="bg-input-background text-foreground border border-border px-3 py-1 rounded-[var(--radius-badge)] text-[var(--text-caption)] font-medium font-[family:var(--font-aeonik)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div>
          <h3 className={cn(sectionHeader, 'mb-2')}>Limitations</h3>
          <p className="text-[var(--text-caption)] m-0 font-[family:var(--font-beausite)] text-muted-foreground">
            {match.limitations}
          </p>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className={cn(sectionHeader, 'mb-3')}>Score Breakdown</h3>
          <div className="flex flex-col gap-3 mt-2">
            {Object.entries(match.breakdown).map(([label, value]) => {
              const isLow = value < 50
              return (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[var(--text-caption)] font-[family:var(--font-aeonik)]">
                    <span className="text-muted-foreground font-medium">
                      {label} <span className="opacity-50">({value}%)</span>
                    </span>
                    <span className={cn('font-bold', isLow ? 'text-destructive' : 'text-secondary')}>{value}%</span>
                  </div>
                  <div className="h-2 w-full bg-input-background rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', isLow ? 'bg-destructive' : 'bg-secondary')}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-[var(--text-caption)] font-[family:var(--font-aeonik)] text-muted-foreground mt-6">
            <div className="flex gap-2">
              <span className="font-bold">{match.footer.informs}</span>
            </div>
            <div>{match.footer.metrics}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 px-8 flex justify-between bg-card text-muted-foreground font-[family:var(--font-beausite)] text-[var(--text-base)]">
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer focus:outline-none font-[family:var(--font-aeonik)] font-medium text-[var(--text-cta)]"
          onClick={() => onSwipe('left')}
        >
          &larr; Skip
        </button>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer focus:outline-none font-[family:var(--font-aeonik)] font-medium text-[var(--text-cta)]"
          onClick={() => onSwipe('right')}
        >
          Add to toolkit &rarr;
        </button>
      </div>
    </motion.div>
  )
}
