// components/ScoreCard.tsx
// Displays a score with a circular progress ring.

interface ScoreCardProps {
  label: string;
  value: number;
  maxValue: number;
  suffix: string;
  color: string;
}

export default function ScoreCard({ label, value, maxValue, suffix, color }: ScoreCardProps) {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDash = (percentage / 100) * circumference;

  return (
    <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-3xl p-6 text-center">
      <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
        {/* Background circle */}
        <svg className="absolute" width="112" height="112" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="#1e1e3f"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className={color}
          />
        </svg>
        {/* Score number */}
        <span className={`text-2xl font-bold relative ${color}`}>
          {value}{suffix}
        </span>
      </div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
    </div>
  );
}