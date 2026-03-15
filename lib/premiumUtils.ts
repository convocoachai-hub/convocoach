// ─── Premium Tier System ───────────────────────────────────────────────────
// Centralized premium logic shared by client and API routes

export type UserTier = 'anonymous' | 'free' | 'premium';

export function getUserTier(session: any): UserTier {
  if (!session?.user) return 'anonymous';
  // NextAuth stores custom fields on session.user (see authOptions.ts callback)
  const status = (session.user as any)?.subscriptionStatus
    ?? (session as any)?.subscriptionStatus
    ?? 'free';
  if (status === 'paid' || status === 'lifetime') return 'premium';
  return 'free';
}

export function isPremium(session: any): boolean {
  return getUserTier(session) === 'premium';
}

// ─── Feature Limits ────────────────────────────────────────────────────────

export const LIMITS = {
  // Chat Analysis
  ANON_ANALYSIS: 2,       // anonymous users
  FREE_ANALYSIS: 5,       // signed-in free users
  PREMIUM_ANALYSIS: Infinity,

  // Practice Mode — messages per session
  ANON_PRACTICE_MSG: 5,
  FREE_PRACTICE_MSG: 25,
  PREMIUM_PRACTICE_MSG: Infinity,

  // AI Live Coach — draft checks per analysis
  FREE_COACH_CHECKS: 3,
  PREMIUM_COACH_CHECKS: Infinity,
} as const;

// ─── Practice Mode Character Access ────────────────────────────────────────

// IDs from ALL_CHARS in practice/page.tsx
export const ANON_CHARACTERS = new Set([
  'mia_warm',        // Dating female — easy
  'noah_playful',    // Dating male — easy
]);

export const FREE_CHARACTERS = new Set([
  // Dating (2 per implied group)
  'mia_warm', 'zara_banter',
  // Professional
  'sam_interviewer', 'alex_tough_client',
  // Social
  'jamie_new_friend', 'river_reconnect',
  // Dating male
  'noah_playful', 'leo_confident',
]);

// Premium: all characters unlocked (no filter needed)

// ─── Difficulty Access ─────────────────────────────────────────────────────

export const ANON_DIFFICULTIES = new Set(['easy']);
export const FREE_DIFFICULTIES  = new Set(['easy', 'normal']);
// Premium: all difficulties (easy, normal, hard)

// ─── Helper: get limits for a tier ─────────────────────────────────────────

export function getAnalysisLimit(tier: UserTier): number {
  if (tier === 'anonymous') return LIMITS.ANON_ANALYSIS;
  if (tier === 'free') return LIMITS.FREE_ANALYSIS;
  return LIMITS.PREMIUM_ANALYSIS;
}

export function getPracticeMsgLimit(tier: UserTier): number {
  if (tier === 'anonymous') return LIMITS.ANON_PRACTICE_MSG;
  if (tier === 'free') return LIMITS.FREE_PRACTICE_MSG;
  return LIMITS.PREMIUM_PRACTICE_MSG;
}

export function getCoachCheckLimit(tier: UserTier): number {
  if (tier === 'free' || tier === 'anonymous') return LIMITS.FREE_COACH_CHECKS;
  return LIMITS.PREMIUM_COACH_CHECKS;
}

export function isCharacterAvailable(charId: string, tier: UserTier): boolean {
  if (tier === 'premium') return true;
  if (tier === 'anonymous') return ANON_CHARACTERS.has(charId);
  return FREE_CHARACTERS.has(charId);
}

export function isDifficultyAvailable(diff: string, tier: UserTier): boolean {
  if (tier === 'premium') return true;
  if (tier === 'anonymous') return ANON_DIFFICULTIES.has(diff);
  return FREE_DIFFICULTIES.has(diff);
}

// ─── Results Page — Layer Visibility ───────────────────────────────────────

export const PREMIUM_RESULTS_LAYERS = {
  // Free users see these (always visible)
  FREE: ['layer1_diagnosis', 'layer2_scores'] as const,
  // Free users get partial access to these
  FREE_PARTIAL: {
    layer5_mistakes: 1,        // show 1 mistake
    layer6_missedOpportunities: 1,  // show 1 missed opp
    layer7_rewrites: 1,        // show 1 rewrite style
  },
  // Premium-only layers (fully locked for free)
  PREMIUM_ONLY: [
    'layer3_psychSignals',
    'layer4_powerDynamics',
    'layer8_attractionSignals',
    'layer10_strategy',
  ] as const,
};
