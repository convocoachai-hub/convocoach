// utils/skillLevel.ts
// Calculates a user's skill level based on their total points.

export interface SkillInfo {
  level: string;
  pointsRequired: number;
  nextLevel: string | null;
  pointsToNext: number | null;
  color: string;
  emoji: string;
}

// The 4 skill levels and how many points needed to reach them
const SKILL_LEVELS = [
  { name: 'Dry Texter', minPoints: 0, color: '#6B7280', emoji: '💤' },
  { name: 'Beginner Flirter', minPoints: 50, color: '#3B82F6', emoji: '😏' },
  { name: 'Smooth Conversationalist', minPoints: 150, color: '#8B5CF6', emoji: '✨' },
  { name: 'Elite Charmer', minPoints: 300, color: '#F59E0B', emoji: '👑' },
];

export function getSkillInfo(totalPoints: number): SkillInfo {
  // Find which level the user is currently at
  let currentLevelIndex = 0;
  for (let i = SKILL_LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= SKILL_LEVELS[i].minPoints) {
      currentLevelIndex = i;
      break;
    }
  }

  const currentLevel = SKILL_LEVELS[currentLevelIndex];
  const nextLevel = SKILL_LEVELS[currentLevelIndex + 1] || null;

  return {
    level: currentLevel.name,
    pointsRequired: currentLevel.minPoints,
    nextLevel: nextLevel ? nextLevel.name : null,
    pointsToNext: nextLevel ? nextLevel.minPoints - totalPoints : null,
    color: currentLevel.color,
    emoji: currentLevel.emoji,
  };
}

// Convert a conversation score (0-10) into skill points
export function scoreToPoints(score: number): number {
  // Higher scores give more points
  if (score >= 9) return 20;
  if (score >= 7) return 15;
  if (score >= 5) return 10;
  if (score >= 3) return 5;
  return 2;
}