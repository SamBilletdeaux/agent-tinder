import { agents } from './data/agents'
import { actionLevelLabels, roleLabels, stateLabels, presetPersonas } from './data/personas'
import { rankAgents, type MatchResult } from './engine/matching'
import type { StateOfReadiness, UserProfile } from './engine/types'

type PersonaCard = {
  id: string
  name: string
  icon: string
  roles: string[]
  description: string
  profile: UserProfile
}

const stateIcons: Record<StateOfReadiness, string> = {
  scouting: '🔭',
  evaluating: '🔍',
  making: '🎨',
  orchestrating: '🎼',
}

export const PERSONAS: PersonaCard[] = presetPersonas.map((profile) => ({
  id: profile.id,
  name: profile.name,
  icon: stateIcons[profile.state],
  roles: [roleLabels[profile.role], stateLabels[profile.state]],
  description: `"${profile.vibe}"`,
  profile,
}))

// Generate matches for a given persona using the real matching engine
export function getMatchesForPersona(personaId: string): MatchResult[] {
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0]
  return rankAgents(agents, persona.profile)
}

// Convert a MatchResult to the flat shape Cursor's SwipeCard expects
export function toCardData(m: MatchResult) {
  const pct = Math.round(m.totalScore * 100)
  return {
    id: m.agent.id,
    name: m.agent.name,
    icon: m.agent.emoji,
    subtitle: m.agent.tagline,
    score: pct,
    matchLevel: m.isAntiNeedCapped
      ? 'ANTI-NEED'
      : pct >= 70
        ? 'STRONG MATCH'
        : pct >= 45
          ? 'MODERATE'
          : 'LOW MATCH',
    description: m.agent.description,
    explanation: m.explanation,
    projectRelevance: m.projectRelevance,
    exampleOutput: m.agent.exampleOutput,
    dataSources: m.agent.dataSources,
    useCases: m.agent.useCases,
    limitations: m.agent.limitations,
    tags: m.agent.primarySignals as string[],
    breakdown: {
      'Signal Alignment': Math.round(m.dimensions.signalAlignment * 100),
      'Role Relevance': Math.round(m.dimensions.roleRelevance * 100),
      'Fluency Match': Math.round(m.dimensions.fluencyMatch * 100),
      'Action Level': Math.round(m.dimensions.actionOrientation * 100),
      'Working Style': Math.round(m.dimensions.workingStyle * 100),
    },
    footer: {
      informs: actionLevelLabels[m.agent.actionLevel],
      metrics: `${m.agent.workingStyle} · ${m.agent.groundedIn}`,
    },
    antiNeedWarning: m.antiNeedWarning,
    isAntiNeedCapped: m.isAntiNeedCapped,
  }
}

// Pre-computed type for the card data shape
export type CardData = ReturnType<typeof toCardData>
