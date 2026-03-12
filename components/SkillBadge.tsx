// components/SkillBadge.tsx
// Shows the user's current skill level with a progress bar.

interface SkillInfo {
  level: string;
  nextLevel: string | null;
  pointsToNext: number | null;
  emoji: string;
  color: string;
}

interface SkillBadgeProps {
  skillInfo: SkillInfo;
  totalPoints: number;
}

export default function SkillBadge({ skillInfo, totalPoints }: SkillBadgeProps) {
  // Calculate progress percentage toward next level
  const progressPercent = skillInfo.pointsToNext
    ? Math.max(0, Math.min(100, 100 - (skillInfo.pointsToNext / (totalPoints + skillInfo.pointsToNext)) * 100))
    : 100;

  return (
    <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-3xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{skillInfo.emoji}</div>
        <div>
          <p className="text-gray-400 text-sm">Current Level</p>
          <h2 className="text-2xl font-bold text-white">{skillInfo.level}</h2>
          <p className="text-purple-400 text-sm">{totalPoints} points total</p>
        </div>
      </div>

      {skillInfo.nextLevel && (
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to {skillInfo.nextLevel}</span>
            <span>{skillInfo.pointsToNext} points needed</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {!skillInfo.nextLevel && (
        <div className="text-center text-yellow-400 font-semibold mt-2">
          👑 You have reached the highest level!
        </div>
      )}
    </div>
  );
}