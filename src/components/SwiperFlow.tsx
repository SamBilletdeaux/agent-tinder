import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence } from 'motion/react'
import { PERSONAS, getMatchesForPersona, toCardData, type CardData } from '../data'
import { MatchModal } from './MatchModal'
import { SwipeCard } from './SwipeCard'
import { ThemeToggle } from './ThemeToggle'

export function SwiperFlow() {
  const { personaId } = useParams()
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0]

  const matches = useMemo(() => {
    return getMatchesForPersona(persona.id).map(toCardData)
  }, [persona.id])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchData, setMatchData] = useState<CardData | null>(null)

  const currentMatch = matches[currentIndex]

  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentMatch?.score > 50) {
      setMatchData(currentMatch)
      return
    }
    nextCard()
  }

  const closeMatchModal = () => {
    setMatchData(null)
    nextCard()
  }

  const allDone = currentIndex >= matches.length

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden font-[family:var(--font-beausite)]">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[var(--text-base)] font-[family:var(--font-aeonik)] hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {persona.name[0]}
          </Link>
          <div className="flex items-baseline gap-2">
            <span className="font-[family:var(--font-beausite)] text-[var(--text-base)] font-bold">{persona.name}</span>
            <span className="text-muted-foreground text-[var(--text-caption)] font-[family:var(--font-aeonik)]">
              {persona.roles.join(' · ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-[var(--text-caption)] font-[family:var(--font-aeonik)] font-bold">
            {currentIndex} / {matches.length}
          </span>
          <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${(currentIndex / matches.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden h-full">
        <div className="w-full max-w-2xl aspect-[3/4] sm:aspect-auto sm:h-[650px] relative">
          <AnimatePresence>
            {currentMatch && <SwipeCard key={currentMatch.id} match={currentMatch} onSwipe={handleSwipe} />}
          </AnimatePresence>

          {allDone && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-input-background rounded-[var(--radius-card)] flex items-center justify-center text-[var(--text-h2)] mx-auto mb-5 shadow-sm border border-border">
                  ✅
                </div>
                <h2 className="text-[var(--text-h2)] font-bold m-0 mb-2">All agents reviewed!</h2>
                <p className="text-muted-foreground text-[var(--text-base)] m-0 mb-6">
                  {matches.length} agents evaluated for {persona.name}
                </p>
                <Link
                  to="/"
                  className="inline-block bg-primary text-primary-foreground text-[var(--text-base)] font-medium py-3 px-6 rounded-[var(--radius-button)] font-[family:var(--font-aeonik)] hover:bg-primary/90 transition-colors"
                >
                  Try Another Persona
                </Link>
              </div>
            </div>
          )}
        </div>

        {!allDone && (
          <div className="flex items-center gap-6 mt-8 z-10">
            <button
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
              aria-label="Skip"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
              aria-label="Add to toolkit"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>{matchData && <MatchModal match={matchData} onClose={closeMatchModal} />}</AnimatePresence>
    </div>
  )
}
