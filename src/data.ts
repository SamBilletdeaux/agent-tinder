import type { UserProfile } from './engine/types';
import { agents } from './data/agents';
import { rankAgents, type MatchResult } from './engine/matching';
import { roleLabels, stateLabels, actionLevelLabels } from './data/personas';

export const PERSONAS: {
  id: string;
  name: string;
  icon: string;
  roles: string[];
  description: string;
  profile: UserProfile;
}[] = [
  {
    id: 'alex',
    name: 'Alex',
    icon: '🔭',
    roles: ['Strategy Lead', 'Scouting'],
    description: "\"I'm exploring a new pitch opportunity\"",
    profile: {
      id: 'alex',
      name: 'Alex',
      role: 'strategy-lead',
      state: 'scouting',
      fluency: 'advanced',
      vibe: "I'm exploring a new pitch opportunity",
      color: '#a855f7',
    },
  },
  {
    id: 'jordan',
    name: 'Jordan',
    icon: '🎨',
    roles: ['Creative Director', 'Making'],
    description: "\"I'm deep in campaign concepting\"",
    profile: {
      id: 'jordan',
      name: 'Jordan',
      role: 'creative-director',
      state: 'making',
      fluency: 'expert',
      vibe: "I'm deep in campaign concepting",
      color: '#ec4899',
    },
  },
  {
    id: 'morgan',
    name: 'Morgan',
    icon: '🎼',
    roles: ['Producer', 'Orchestrating'],
    description: "\"I'm coordinating multi-team delivery\"",
    profile: {
      id: 'morgan',
      name: 'Morgan',
      role: 'producer',
      state: 'orchestrating',
      fluency: 'intermediate',
      vibe: "I'm coordinating multi-team delivery",
      color: '#3b82f6',
    },
  },
  {
    id: 'riley',
    name: 'Riley',
    icon: '🔍',
    roles: ['Account Lead', 'Evaluating'],
    description: "\"I'm preparing for a client review\"",
    profile: {
      id: 'riley',
      name: 'Riley',
      role: 'account-lead',
      state: 'evaluating',
      fluency: 'intermediate',
      vibe: "I'm preparing for a client review",
      color: '#22c55e',
    },
  },
];

// Generate matches for a given persona using the real matching engine
export function getMatchesForPersona(personaId: string): MatchResult[] {
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
  return rankAgents(agents, persona.profile);
}

// Convert a MatchResult to the flat shape Cursor's SwipeCard expects
export function toCardData(m: MatchResult) {
  const pct = Math.round(m.totalScore * 100);
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
  };
}

// Pre-computed type for the card data shape
export type CardData = ReturnType<typeof toCardData>;
