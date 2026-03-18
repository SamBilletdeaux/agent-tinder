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

  const needScores = agent.primarySignals.map(
    (s) => stateProfile.needs[s] ?? 0
  );
  const maxNeed = Math.max(...needScores, 0);
  const avgNeed = needScores.length > 0
    ? needScores.reduce((a, b) => a + b, 0) / needScores.length
    : 0;
  const needScore = maxNeed * 0.6 + avgNeed * 0.4;

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
    return Math.max(0, 1 - (agentMinIdx - userIdx) * 0.4);
  }
  const diff = userIdx - agentMinIdx;
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.9;
  return 0.75;
}

function calcActionOrientation(agent: Agent): number {
  return actionScores[agent.actionLevel];
}

function calcWorkingStyleMatch(agent: Agent, profile: UserProfile): number {
  const statePrefs: Record<string, Record<string, number>> = {
    scouting: { autonomous: 0.4, collaborative: 0.8, 'on-demand': 0.9, continuous: 0.7 },
    evaluating: { autonomous: 0.5, collaborative: 0.7, 'on-demand': 0.8, continuous: 0.6 },
    making: { autonomous: 0.6, collaborative: 0.9, 'on-demand': 0.7, continuous: 0.4 },
    orchestrating: { autonomous: 0.9, collaborative: 0.6, 'on-demand': 0.5, continuous: 0.8 },
  };
  return statePrefs[profile.state]?.[agent.workingStyle] ?? 0.5;
}

// Persona-specific relevance — connects the agent to what the user is actually doing
const projectRelevanceMap: Record<string, Record<string, string>> = {
  'culture-scout': {
    'strategy-lead:scouting': 'While scouting new opportunities, Culture Scout gives you a real-time read on what\'s moving in culture — so your pitch is grounded in what\'s next, not what\'s already peaked.',
    'creative-director:making': 'During campaign concepting, cultural signals help you validate that your creative direction taps into something real, not just something you and the team think is clever.',
    'account-lead:evaluating': 'Preparing for client review? Culture Scout surfaces trends that strengthen your strategic rationale with data the client hasn\'t seen yet.',
    'producer:orchestrating': 'Cultural monitoring isn\'t your core need during delivery — but knowing about shifts that could impact campaign reception helps you flag risks early.',
  },
  'brief-architect': {
    'strategy-lead:scouting': 'You\'re exploring opportunities, not writing briefs yet — but Brief Architect can quickly scaffold a brief to test whether a strategic direction is viable enough to pitch.',
    'creative-director:making': 'When you\'re deep in concepting, a well-structured brief is your north star. Brief Architect ensures the brief captures everything your creative team needs to stay on track.',
    'account-lead:evaluating': 'Client review prep is faster when briefs are consistent and thorough. Brief Architect pulls in performance learnings that strengthen your rationale.',
    'producer:orchestrating': 'During delivery, Brief Architect helps you quickly generate briefs for new workstreams that spin up mid-campaign.',
  },
  'velocity-tracker': {
    'producer:orchestrating': 'This is your command center. Velocity Tracker gives you real-time visibility into which workstreams are healthy and which need intervention — before anyone tells you there\'s a problem.',
    'account-lead:evaluating': 'Before a client review, knowing the true status of every deliverable lets you get ahead of bad news instead of being surprised by it.',
    'strategy-lead:scouting': 'When you\'re in exploration mode, delivery tracking is noise — you need space to think, not status updates.',
    'creative-director:making': 'During deep creative work, delivery metrics are the last thing you need in your field of vision. This agent would actively distract you.',
  },
  'brand-guardian': {
    'account-lead:evaluating': 'Before presenting to the client, Brand Guardian catches the embarrassing stuff — logo misuse, off-palette colors, missing disclaimers — that erodes trust.',
    'producer:orchestrating': 'During multi-asset delivery, automated compliance checks prevent costly rework cycles that blow your timeline.',
    'creative-director:making': 'While creating, compliance checking feels like a buzzkill — but running it on drafts prevents heartbreak when your favorite concept gets killed in legal review.',
    'strategy-lead:scouting': 'You\'re exploring territories, not shipping assets. Brand Guardian is more useful later in the process when work is ready for review.',
  },
  'performance-oracle': {
    'account-lead:evaluating': 'This is your secret weapon for QBRs. Performance Oracle finds the story in the data that justifies your recommendations and earns client confidence.',
    'strategy-lead:scouting': 'Past performance patterns reveal which types of campaigns and channels are working — critical context when evaluating new opportunities.',
    'creative-director:making': 'Performance data can inform creative direction, but during deep making mode, you need to trust your instincts first and validate with data second.',
    'producer:orchestrating': 'During delivery, performance signals help you make real-time optimization decisions about where to double down.',
  },
  'budget-rebalancer': {
    'producer:orchestrating': 'During campaign delivery, Budget Rebalancer is your always-on optimization engine — shifting spend toward what\'s working within guardrails you set.',
    'account-lead:evaluating': 'Before client review, showing proactive budget optimization with clear rationale builds trust and demonstrates strategic value.',
    'strategy-lead:scouting': 'Budget optimization is a downstream concern when you\'re scouting — you need to validate the opportunity before optimizing the spend.',
    'creative-director:making': 'Budget mechanics are outside your domain during creative development. Let the producers and account leads handle this one.',
  },
  'creative-catalyst': {
    'creative-director:making': 'This is your brainstorm partner that never gets tired. Creative Catalyst generates unexpected concept territories that push your thinking beyond your team\'s usual instincts.',
    'strategy-lead:scouting': 'Even in early exploration, having provocative creative territories helps you sell the vision of what a strategic direction could become.',
    'account-lead:evaluating': 'Creative concepts aren\'t your core deliverable for client review — but having provocative ideas ready shows strategic depth.',
    'producer:orchestrating': 'During delivery, creative ideation is mostly done. Creative Catalyst is most valuable earlier in the process.',
  },
  'flow-guardian': {
    'creative-director:making': 'Your creative flow is sacred. Flow Guardian shields your deep work time from the meeting creep and notification noise that kills concentration.',
    'strategy-lead:scouting': 'Scouting requires expansive thinking — Flow Guardian protects that headspace by batching interruptions and handling routine coordination.',
    'producer:orchestrating': 'When you\'re orchestrating, you need to be responsive to your team — over-aggressive notification batching could slow you down.',
    'account-lead:evaluating': 'During evaluation and prep, focus time matters — but you also need to stay responsive to client communications.',
  },
  'research-engine': {
    'strategy-lead:scouting': 'Research Engine is your force multiplier for new business. It delivers competitive landscapes and market analysis overnight that would take your team days to assemble.',
    'creative-director:making': 'During concepting, targeted research helps validate creative intuitions with evidence — "is this trend real?" answered in minutes, not days.',
    'account-lead:evaluating': 'Client review prep is stronger when backed by fresh research. Research Engine fills knowledge gaps before you walk into the room.',
    'producer:orchestrating': 'Deep research isn\'t your primary need during delivery — but quick factual lookups and competitive checks can be useful.',
  },
  'insight-codifier': {
    'account-lead:evaluating': 'Before a client review, Insight Codifier surfaces relevant learnings from past campaigns — giving you ammunition that demonstrates your team learns and improves.',
    'strategy-lead:scouting': 'When evaluating new opportunities, past learnings help you avoid repeating mistakes and build on what\'s worked before.',
    'creative-director:making': 'During creative development, past insights can anchor or constrain your thinking — useful as a reference, but don\'t let it replace creative instinct.',
    'producer:orchestrating': 'During delivery, codified learnings help you make better optimization decisions based on what\'s worked in similar campaigns.',
  },
  'client-whisperer': {
    'account-lead:evaluating': 'This is built for you. Client Whisperer translates vague feedback into actionable direction, reducing revision cycles and strengthening your client relationship.',
    'creative-director:making': 'When client feedback derails creative momentum, Client Whisperer decodes what they actually want — so you can respond strategically, not reactively.',
    'strategy-lead:scouting': 'During scouting, understanding client communication patterns helps you anticipate what kind of strategic direction will resonate.',
    'producer:orchestrating': 'During delivery, clear client communication reduces scope creep and misaligned expectations — Client Whisperer helps prevent surprises.',
  },
  'campaign-composer': {
    'producer:orchestrating': 'Campaign Composer is your production planning superpower — it turns an approved concept into a complete asset matrix, timeline, and resource plan that would take you a full day to build manually.',
    'creative-director:making': 'During concepting, thinking about production plans is premature. But once direction is locked, Campaign Composer helps you see how concepts translate to a full campaign system.',
    'strategy-lead:scouting': 'You\'re still exploring — campaign production planning comes much later. This agent is most useful once a direction is approved.',
    'account-lead:evaluating': 'Before client review, having a draft production plan shows operational readiness — the client sees that their idea can actually get built.',
  },
};

function generateProjectRelevance(agent: Agent, profile: UserProfile): string {
  const key = `${profile.role}:${profile.state}`;
  const agentMap = projectRelevanceMap[agent.id];
  if (agentMap?.[key]) return agentMap[key];

  // Fallback: generate a generic relevance statement
  const state = stateLabels[profile.state].toLowerCase();
  const role = roleLabels[profile.role];
  const signals = agent.primarySignals.join(' and ');

  if (agent.roleAffinity[profile.role] >= 0.7) {
    return `As a ${role} in ${state} mode, ${agent.name}'s focus on ${signals} aligns well with your current workflow.`;
  }
  return `${agent.name} produces ${signals} — which has some relevance to your ${state} workflow, though it's not tailored to ${role}s specifically.`;
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

  const projectRelevance = generateProjectRelevance(agent, profile);

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
    projectRelevance,
    antiNeedWarning,
    isAntiNeedCapped,
  };
}

export type { MatchResult };

export function rankAgents(agents: Agent[], profile: UserProfile): MatchResult[] {
  const results = agents.map((a) => calculateMatch(a, profile));

  results.sort((a, b) => b.totalScore - a.totalScore);

  if (results.length >= 4) {
    const best = results[0];
    const worst = results[results.length - 1];
    const rest = results.slice(1, -1);

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
