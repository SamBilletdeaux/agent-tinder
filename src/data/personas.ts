import type { UserProfile, StateOfReadiness, StateSignalProfile, Role, Fluency, ActionLevel } from '../engine/types';

export const presetPersonas: UserProfile[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'strategy-lead',
    state: 'scouting',
    fluency: 'advanced',
    vibe: "I'm exploring a new pitch opportunity",
    color: '#a855f7',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    role: 'creative-director',
    state: 'making',
    fluency: 'expert',
    vibe: "I'm deep in campaign concepting",
    color: '#ec4899',
  },
  {
    id: 'morgan',
    name: 'Morgan',
    role: 'producer',
    state: 'orchestrating',
    fluency: 'intermediate',
    vibe: "I'm coordinating multi-team delivery",
    color: '#3b82f6',
  },
  {
    id: 'riley',
    name: 'Riley',
    role: 'account-lead',
    state: 'evaluating',
    fluency: 'intermediate',
    vibe: "I'm preparing for a client review",
    color: '#22c55e',
  },
];

export const stateSignalProfiles: Record<StateOfReadiness, StateSignalProfile> = {
  scouting: {
    needs: {
      provocations: 0.9,
      insights: 0.8,
      'learning-moments': 0.5,
    },
    antiNeeds: {
      decisions: 0.8,
      artifacts: 0.75,
    },
  },
  evaluating: {
    needs: {
      insights: 0.9,
      'learning-moments': 0.85,
      decisions: 0.6,
    },
    antiNeeds: {
      provocations: 0.5,
      'mini-machines': 0.4,
    },
  },
  making: {
    needs: {
      artifacts: 0.9,
      provocations: 0.7,
      'mini-machines': 0.5,
    },
    antiNeeds: {
      updates: 0.8,
      decisions: 0.75,
    },
  },
  orchestrating: {
    needs: {
      momentum: 0.9,
      updates: 0.8,
      'mini-machines': 0.7,
      decisions: 0.6,
    },
    antiNeeds: {
      provocations: 0.85,
    },
  },
};

export const roleLabels: Record<Role, string> = {
  'strategy-lead': 'Strategy Lead',
  'creative-director': 'Creative Director',
  'producer': 'Producer',
  'account-lead': 'Account Lead',
};

export const stateLabels: Record<StateOfReadiness, string> = {
  scouting: 'Scouting',
  evaluating: 'Evaluating',
  making: 'Making',
  orchestrating: 'Orchestrating',
};

export const fluencyLabels: Record<Fluency, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const actionLevelLabels: Record<ActionLevel, string> = {
  inform: 'Informs',
  suggest: 'Suggests',
  draft: 'Drafts',
  execute: 'Executes',
};

export const stateColors: Record<StateOfReadiness, string> = {
  scouting: '#a855f7',
  evaluating: '#22c55e',
  making: '#ec4899',
  orchestrating: '#3b82f6',
};

export const antiNeedExplanations: Record<string, Record<string, string>> = {
  scouting: {
    decisions: 'narrows your thinking too early in scouting mode',
    artifacts: 'pushes toward outputs before the landscape is clear',
  },
  evaluating: {
    provocations: 'adds noise when you need clarity for evaluation',
    'mini-machines': 'automates before the direction is validated',
  },
  making: {
    updates: 'breaks creative flow with status noise',
    decisions: 'forces convergence when you should be creating',
  },
  orchestrating: {
    provocations: 'creates turbulence when you\'re orchestrating across workstreams',
  },
};
