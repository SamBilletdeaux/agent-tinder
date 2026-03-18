export type SignalType =
  | 'provocations'
  | 'insights'
  | 'decisions'
  | 'learning-moments'
  | 'artifacts'
  | 'momentum'
  | 'updates'
  | 'mini-machines';

export type StateOfReadiness = 'scouting' | 'evaluating' | 'making' | 'orchestrating';

export type Role = 'strategy-lead' | 'creative-director' | 'producer' | 'account-lead';

export type Fluency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ActionLevel = 'inform' | 'suggest' | 'draft' | 'execute';

export type WorkingStyle = 'autonomous' | 'collaborative' | 'on-demand' | 'continuous';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  primarySignals: SignalType[];
  actionLevel: ActionLevel;
  workingStyle: WorkingStyle;
  groundedIn: string;
  roleAffinity: Record<Role, number>; // 0-1
  fluencyMin: Fluency;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  state: StateOfReadiness;
  fluency: Fluency;
  vibe: string;
  color: string;
}

export interface MatchResult {
  agent: Agent;
  totalScore: number;
  dimensions: {
    signalAlignment: number;
    roleRelevance: number;
    fluencyMatch: number;
    actionOrientation: number;
    workingStyle: number;
  };
  explanation: string;
  antiNeedWarning: string | null;
  isAntiNeedCapped: boolean;
}

// Signal needs/anti-needs per state
export interface StateSignalProfile {
  needs: Partial<Record<SignalType, number>>;
  antiNeeds: Partial<Record<SignalType, number>>;
}
