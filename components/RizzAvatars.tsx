'use client';

// components/RizzAvatars.tsx — Animated SVG avatars for Rizz Link pages
import { motion } from 'framer-motion';

export type AvatarType = 'cat' | 'dog' | 'fox' | 'robot' | 'panda';

const float = {
  animate: { y: [0, -6, 0] },
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

// ─── Cat ──────────────────────────────────────────────────────────────────────
function CatAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Body */}
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#2A2A3E" />
      {/* Head */}
      <circle cx="40" cy="33" r="20" fill="#2A2A3E" />
      {/* Ears */}
      <polygon points="22,20 16,6 30,16" fill="#2A2A3E" />
      <polygon points="58,20 64,6 50,16" fill="#2A2A3E" />
      <polygon points="24,19 19,9 30,17" fill="#FF5B3A" opacity="0.7" />
      <polygon points="56,19 61,9 50,17" fill="#FF5B3A" opacity="0.7" />
      {/* Eyes */}
      <motion.ellipse cx="33" cy="33" rx="3.5" ry="4"
        fill="#4DEBA1"
        animate={{ ry: [4, 0.8, 4] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      />
      <motion.ellipse cx="47" cy="33" rx="3.5" ry="4"
        fill="#4DEBA1"
        animate={{ ry: [4, 0.8, 4] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      />
      {/* Nose */}
      <ellipse cx="40" cy="39" rx="2" ry="1.5" fill="#FF5B3A" />
      {/* Whiskers */}
      <line x1="20" y1="39" x2="36" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="20" y1="42" x2="36" y2="41" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="44" y1="40" x2="60" y2="39" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="44" y1="41" x2="60" y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Tail */}
      <motion.path d="M 62 58 Q 75 50 70 38"
        stroke="#2A2A3E" strokeWidth="5" strokeLinecap="round" fill="none"
        animate={{ d: ['M 62 58 Q 75 50 70 38', 'M 62 58 Q 78 52 73 40', 'M 62 58 Q 75 50 70 38'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

// ─── Dog ──────────────────────────────────────────────────────────────────────
function DogAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="54" rx="22" ry="16" fill="#3B2F2F" />
      <circle cx="40" cy="34" r="20" fill="#3B2F2F" />
      {/* Floppy ears */}
      <motion.ellipse cx="22" cy="34" rx="7" ry="14" fill="#2A1F1F"
        animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '22px 24px' }}
      />
      <motion.ellipse cx="58" cy="34" rx="7" ry="14" fill="#2A1F1F"
        animate={{ rotate: [5, -5, 5] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '58px 24px' }}
      />
      {/* Eyes */}
      <motion.circle cx="33" cy="32" r="4" fill="#7B6CF6"
        animate={{ r: [4, 1, 4] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
      />
      <motion.circle cx="47" cy="32" r="4" fill="#7B6CF6"
        animate={{ r: [4, 1, 4] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
      />
      {/* Nose */}
      <ellipse cx="40" cy="40" rx="4" ry="3" fill="#111" />
      <ellipse cx="38.5" cy="39" rx="1" ry="0.8" fill="rgba(255,255,255,0.3)" />
      {/* Tongue */}
      <motion.ellipse cx="40" cy="46" rx="5" ry="4" fill="#FF5B3A"
        animate={{ scaleY: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.svg>
  );
}

// ─── Fox ──────────────────────────────────────────────────────────────────────
function FoxAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="54" rx="20" ry="15" fill="#E8610A" />
      <circle cx="40" cy="34" r="20" fill="#E8610A" />
      {/* Pointed ears */}
      <polygon points="22,22 14,4 32,18" fill="#E8610A" />
      <polygon points="58,22 66,4 48,18" fill="#E8610A" />
      <polygon points="23,21 17,8 31,19" fill="#F5C842" opacity="0.8" />
      <polygon points="57,21 63,8 49,19" fill="#F5C842" opacity="0.8" />
      {/* White face mask */}
      <ellipse cx="40" cy="39" rx="13" ry="11" fill="#F5E6D0" />
      {/* Eyes */}
      <motion.ellipse cx="33" cy="33" rx="3" ry="4" fill="#2A1800"
        animate={{ ry: [4, 0.6, 4] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5 }}
      />
      <motion.ellipse cx="47" cy="33" rx="3" ry="4" fill="#2A1800"
        animate={{ ry: [4, 0.6, 4] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5 }}
      />
      <circle cx="34" cy="32" r="1" fill="white" />
      <circle cx="48" cy="32" r="1" fill="white" />
      {/* Nose */}
      <ellipse cx="40" cy="39" rx="2.5" ry="2" fill="#2A1800" />
      {/* Bushy tail */}
      <motion.path d="M 60 56 Q 76 46 68 28 Q 80 32 75 20"
        stroke="#E8610A" strokeWidth="6" strokeLinecap="round" fill="none"
        animate={{ d: ['M 60 56 Q 76 46 68 28 Q 80 32 75 20', 'M 60 56 Q 78 48 70 30 Q 82 34 77 22', 'M 60 56 Q 76 46 68 28 Q 80 32 75 20'] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
}

// ─── Robot ────────────────────────────────────────────────────────────────────
function RobotAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Body */}
      <rect x="22" y="48" width="36" height="22" rx="4" fill="#1E1E2E" stroke="#7B6CF6" strokeWidth="1" />
      {/* Head */}
      <rect x="18" y="18" width="44" height="36" rx="6" fill="#1E1E2E" stroke="#7B6CF6" strokeWidth="1.5" />
      {/* Antenna */}
      <line x1="40" y1="18" x2="40" y2="10" stroke="#7B6CF6" strokeWidth="2" />
      <motion.circle cx="40" cy="8" r="3" fill="#7B6CF6"
        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
      />
      {/* Eyes — LED screens */}
      <motion.rect x="24" y="26" width="12" height="10" rx="2" fill="#4DEBA1"
        animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.rect x="44" y="26" width="12" height="10" rx="2" fill="#4DEBA1"
        animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Pupils */}
      <motion.circle cx="30" cy="31" r="2.5" fill="#111"
        animate={{ cx: [30, 32, 30, 28, 30] }} transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.circle cx="50" cy="31" r="2.5" fill="#111"
        animate={{ cx: [50, 52, 50, 48, 50] }} transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Mouth panel */}
      <rect x="27" y="42" width="26" height="6" rx="2" fill="#0A0A15" stroke="#7B6CF670" strokeWidth="1" />
      <motion.rect x="29" y="44" width="4" height="2" rx="1" fill="#FF5B3A"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
      />
      <motion.rect x="35" y="44" width="4" height="2" rx="1" fill="#F5C842"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
      />
      <motion.rect x="41" y="44" width="4" height="2" rx="1" fill="#4DEBA1"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
      />
      {/* Side bolts */}
      <circle cx="18" cy="30" r="2" fill="#7B6CF6" opacity="0.5" />
      <circle cx="62" cy="30" r="2" fill="#7B6CF6" opacity="0.5" />
    </motion.svg>
  );
}

// ─── Panda ────────────────────────────────────────────────────────────────────
function PandaAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="54" rx="22" ry="16" fill="white" />
      <circle cx="40" cy="33" r="20" fill="white" />
      {/* Ears */}
      <circle cx="22" cy="18" r="9" fill="#111" />
      <circle cx="58" cy="18" r="9" fill="#111" />
      <circle cx="22" cy="18" r="5" fill="#222" />
      <circle cx="58" cy="18" r="5" fill="#222" />
      {/* Eye patches */}
      <ellipse cx="32" cy="32" rx="7" ry="6" fill="#111" />
      <ellipse cx="48" cy="32" rx="7" ry="6" fill="#111" />
      {/* Eyes */}
      <motion.circle cx="32" cy="33" r="3.5" fill="#4DEBA1"
        animate={{ r: [3.5, 0.8, 3.5] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
      <motion.circle cx="48" cy="33" r="3.5" fill="#4DEBA1"
        animate={{ r: [3.5, 0.8, 3.5] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
      {/* Nose */}
      <ellipse cx="40" cy="39" rx="3" ry="2.5" fill="#111" />
      {/* Mouth */}
      <path d="M 36 43 Q 40 47 44 43" stroke="#ccc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Bamboo */}
      <motion.g animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '68px 65px' }}>
        <rect x="64" y="50" width="4" height="20" rx="2" fill="#4DEBA1" opacity="0.7" />
        <line x1="64" y1="56" x2="68" y2="56" stroke="#3BC885" strokeWidth="1" />
        <line x1="64" y1="62" x2="68" y2="62" stroke="#3BC885" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
const AVATAR_MAP: Record<AvatarType, (size: number) => JSX.Element> = {
  cat:   size => <CatAvatar size={size} />,
  dog:   size => <DogAvatar size={size} />,
  fox:   size => <FoxAvatar size={size} />,
  robot: size => <RobotAvatar size={size} />,
  panda: size => <PandaAvatar size={size} />,
};

export const AVATAR_LABELS: Record<AvatarType, string> = {
  cat: '🐱 Cat', dog: '🐶 Dog', fox: '🦊 Fox', robot: '🤖 Robot', panda: '🐼 Panda',
};

export const AVATARS: AvatarType[] = ['cat', 'dog', 'fox', 'robot', 'panda'];

export function RizzAvatar({ type = 'cat', size = 80 }: { type?: AvatarType | string; size?: number }) {
  const render = AVATAR_MAP[type as AvatarType] ?? AVATAR_MAP.cat;
  return render(size);
}
