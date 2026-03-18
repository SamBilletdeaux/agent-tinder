import type {
  Agent,
  UserProfile,
  MatchResult,
  SignalType,
  Fluency,
  ActionLevel,
} from './types';
import { stateSignalProfiles, roleLabels, stateLabels, antiNeedExplanations } from '../data/personas';

const WEIGHTS = {
  signalAlignment: 0.35,
  roleRelevance: 0.25,
  fluencyMatch: 0.15,
  actionOrientation: 0.15,
  workingStyle: 0.10,
};

const ANTI_NEED_CAP_THRESHOLD = 0.7;
const ANTI_NEED_SCORE_CAP = 0.40;

const fluencyOrder: Fluency[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const actionScores: Record<ActionLevel, number> = {
  inform: 0.3,
  suggest: 0.55,
  draft: 0.75,
  execute: 1.0,
};

function calcSignalAlignment(agent: Agent, profile: UserProfile): {
  score: number;
  maxAntiNeed: number;
  antiNeedSignal: SignalType | null;
} {
  const stateProfile = stateSignalProfiles[profile.state];

  // Need score: how well agent signals match state needs
  const needScores = agent.primarySignals.map(
    (s) => stateProfile.needs[s] ?? 0
  );
  const maxNeed = Math.max(...needScores, 0);
  const avgNeed = needScores.length > 0
    ? needScores.reduce((a, b) => a + b, 0) / needScores.length
    : 0;
  const needScore = maxNeed * 0.6 + avgNeed * 0.4;

  // Anti-need penalty
  const antiNeedScores = agent.primarySignals.map(
    (s) => ({ signal: s, score: stateProfile.antiNeeds[s] ?? 0 })
  );
  const maxAntiNeedEntry = antiNeedScores.reduce(
    (max, entry) => (entry.score > max.score ? entry : max),
    { signal: null as SignalType | null, score: 0 }
  );

  const antiNeedPenalty = maxAntiNeedEntry.score;
  const score = needScore * (1 - antiNeedPenalty * 0.8);

  return {
    score: Math.max(0, Math.min(1, score)),
    maxAntiNeed: antiNeedPenalty,
    antiNeedSignal: antiNeedPenalty > 0.3 ? maxAntiNeedEntry.signal : null,
  };
}

function calcRoleRelevance(agent: Agent, profile: UserProfile): number {
  return agent.roleAffinity[profile.role] ?? 0.5;
}

function calcFluencyMatch(agent: Agent, profile: UserProfile): number {
  const userIdx = fluencyOrder.indexOf(profile.fluency);
  const agentMinIdx = fluencyOrder.indexOf(agent.fluencyMin);
  if (userIdx < agentMinIdx) {
    // User below agent's minimum — penalty
    return Math.max(0, 1 - (agentMinIdx - userIdx) * 0.4);
  }
  // User meets or exceeds — slight bonus for exact match, good for above
  const diff = userIdx - agentMinIdx;
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.9;
  return 0.75;
}

function calcActionOrientation(agent: Agent): number {
  return actionScores[agent.actionLevel];
}

function calcWorkingStyleMatch(agent: Agent, profile: UserProfile): number {
  // State-based working style preference
  const statePrefs: Record<string, Record<string, number>> = {
    scouting: { autonomous: 0.4, collaborative: 0.8, 'on-demand': 0.9, continuous: 0.7 },
    evaluating: { autonomous: 0.5, collaborative: 0.7, 'on-demand': 0.8, continuous: 0.6 },
    making: { autonomous: 0.6, collaborative: 0.9, 'on-demand': 0.7, continuous: 0.4 },
    orchestrating: { autonomous: 0.9, collaborative: 0.6, 'on-demand': 0.5, continuous: 0.8 },
  };
  return statePrefs[profile.state]?.[agent.workingStyle] ?? 0.5;
}

function generateExplanation(
  agent: Agent,
  profile: UserProfile,
  totalScore: number,
  antiNeedSignal: SignalType | null,
  isAntiNeedCapped: boolean,
): { explanation: string; antiNeedWarning: string | null } {
  const state = stateLabels[profile.state].toLowerCase();
  const role = roleLabels[profile.role];
  const signalList = agent.primarySignals.join(' and ');

  let antiNeedWarning: string | null = null;
  if (isAntiNeedCapped && antiNeedSignal) {
    const reason = antiNeedExplanations[profile.state]?.[antiNeedSignal]
      ?? `produces ${antiNeedSignal} that conflict with ${state} mode`;
    antiNeedWarning = `${agent.name} produces ${antiNeedSignal} \u2014 which ${reason}.`;
  }

  let explanation: string;
  if (totalScore >= 0.75) {
    explanation = `${agent.name} produces exactly the signals you need in ${state} mode \u2014 ${signalList}. Built for ${role}s like you.`;
  } else if (totalScore >= 0.55) {
    explanation = `Solid match. ${agent.name} brings ${signalList} to your ${state} workflow. Not your top pick, but dependable.`;
  } else if (totalScore >= 0.35) {
    if (isAntiNeedCapped) {
      explanation = `Score capped by anti-need protection. ${agent.name} is capable, but its signals conflict with your current state.`;
    } else {
      explanation = `${agent.name} has some relevance to ${state} mode, but there are better fits for your workflow right now.`;
    }
  } else {
    explanation = `${agent.name} isn't aligned with what a ${role} needs in ${state} mode. The signals don't match.`;
  }

  return { explanation, antiNeedWarning };
}

export function calculateMatch(agent: Agent, profile: UserProfile): MatchResult {
  const signal = calcSignalAlignment(agent, profile);
  const roleRelevance = calcRoleRelevance(agent, profile);
  const fluencyMatch = calcFluencyMatch(agent, profile);
  const actionOrientation = calcActionOrientation(agent);
  const workingStyle = calcWorkingStyleMatch(agent, profile);

  let totalScore =
    signal.score * WEIGHTS.signalAlignment +
    roleRelevance * WEIGHTS.roleRelevance +
    fluencyMatch * WEIGHTS.fluencyMatch +
    actionOrientation * WEIGHTS.actionOrientation +
    workingStyle * WEIGHTS.workingStyle;

  const isAntiNeedCapped = signal.maxAntiNeed > ANTI_NEED_CAP_THRESHOLD && totalScore > ANTI_NEED_SCORE_CAP;
  if (signal.maxAntiNeed > ANTI_NEED_CAP_THRESHOLD) {
    totalScore = Math.min(totalScore, ANTI_NEED_SCORE_CAP);
  }

  const { explanation, antiNeedWarning } = generateExplanation(
    agent,
    profile,
    totalScore,
    signal.antiNeedSignal,
    isAntiNeedCapped,
  );

  return {
    agent,
    totalScore,
    dimensions: {
      signalAlignment: signal.score,
      roleRelevance,
      fluencyMatch,
      actionOrientation,
      workingStyle,
    },
    explanation,
    antiNeedWarning,
    isAntiNeedCapped,
  };
}

export type { MatchResult };

export function rankAgents(agents: Agent[], profile: UserProfile): MatchResult[] {
  const results = agents.map((a) => calculateMatch(a, profile));

  // Demo pacing: hook (best) → contrast (worst) → strong → weak → surprise
  results.sort((a, b) => b.totalScore - a.totalScore);

  // Reorder for demo pacing
  if (results.length >= 4) {
    const best = results[0];
    const worst = results[results.length - 1];
    const rest = results.slice(1, -1);

    // Interleave: strong, weak, strong, weak...
    const strong = rest.filter((r) => r.totalScore >= 0.5);
    const weak = rest.filter((r) => r.totalScore < 0.5);

    const interleaved: MatchResult[] = [best, worst];
    let si = 0, wi = 0;
    while (si < strong.length || wi < weak.length) {
      if (si < strong.length) interleaved.push(strong[si++]);
      if (wi < weak.length) interleaved.push(weak[wi++]);
    }

    return interleaved;
  }

  return results;
}
