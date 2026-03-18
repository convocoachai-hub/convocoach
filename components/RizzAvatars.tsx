'use client';

// components/RizzAvatars.tsx — Brutalist Animated SVG avatars
import { motion } from 'framer-motion';

export type AvatarType = 'cat' | 'dog' | 'fox' | 'robot' | 'panda';

// Neo-Brutalism Palette
const C = {
  cream: '#F3EDE2',
  ink:   '#0F0C09',
  red:   '#D13920',
  yellow:'#FFD84D',
  blue:  '#4F46E5',
  green: '#22C55E',
  pink:  '#FF6FD8',
  white: '#FFFFFF'
};

const float = {
  animate: { y: [0, -4, 0] },
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
};

// ─── Cat (Brutalist) ──────────────────────────────────────────────────────────
function CatAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hard Shadow */}
      <ellipse cx="44" cy="56" rx="22" ry="18" fill={C.ink} />
      <circle cx="44" cy="37" r="20" fill={C.ink} />
      
      {/* Body & Head */}
      <ellipse cx="40" cy="52" rx="22" ry="18" fill={C.yellow} stroke={C.ink} strokeWidth="4" />
      <circle cx="40" cy="33" r="20" fill={C.yellow} stroke={C.ink} strokeWidth="4" />
      
      {/* Sharp Ears */}
      <polygon points="22,20 16,6 30,16" fill={C.yellow} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="58,20 64,6 50,16" fill={C.yellow} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="24,19 19,9 30,17" fill={C.pink} stroke={C.ink} strokeWidth="3" />
      <polygon points="56,19 61,9 50,17" fill={C.pink} stroke={C.ink} strokeWidth="3" />
      
      {/* Deadpan Eyes */}
      <circle cx="32" cy="31" r="4" fill={C.ink} />
      <circle cx="48" cy="31" r="4" fill={C.ink} />
      
      {/* Triangle Nose */}
      <polygon points="38,38 42,38 40,41" fill={C.red} />
      
      {/* Thick Whiskers */}
      <line x1="16" y1="36" x2="26" y2="38" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="42" x2="25" y2="41" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <line x1="54" y1="38" x2="64" y2="36" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <line x1="55" y1="41" x2="66" y2="42" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}

// ─── Dog (Brutalist) ──────────────────────────────────────────────────────────
function DogAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hard Shadow */}
      <ellipse cx="44" cy="58" rx="22" ry="16" fill={C.ink} />
      <circle cx="44" cy="38" r="20" fill={C.ink} />

      {/* Body & Head */}
      <ellipse cx="40" cy="54" rx="22" ry="16" fill={C.blue} stroke={C.ink} strokeWidth="4" />
      <circle cx="40" cy="34" r="20" fill={C.blue} stroke={C.ink} strokeWidth="4" />

      {/* Snout Box */}
      <ellipse cx="40" cy="42" rx="12" ry="9" fill={C.cream} stroke={C.ink} strokeWidth="3" />
      <ellipse cx="40" cy="38" rx="4" ry="3" fill={C.ink} />

      {/* Blocky Tongue */}
      <motion.path d="M 37 45 V 50 A 3 3 0 0 0 43 50 V 45 Z" fill={C.red} stroke={C.ink} strokeWidth="3" 
        animate={{ scaleY: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ transformOrigin: '40px 45px' }}
      />

      {/* Happy Squint Eyes */}
      <path d="M 30 28 Q 33 25 36 28" stroke={C.ink} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 44 28 Q 47 25 50 28" stroke={C.ink} strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Floppy Ears */}
      <motion.ellipse cx="18" cy="36" rx="8" ry="16" fill={C.blue} stroke={C.ink} strokeWidth="4"
        animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: '18px 20px' }}
      />
      <motion.ellipse cx="62" cy="36" rx="8" ry="16" fill={C.blue} stroke={C.ink} strokeWidth="4"
        animate={{ rotate: [5, -5, 5] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: '62px 20px' }}
      />
    </motion.svg>
  );
}

// ─── Fox (Brutalist) ──────────────────────────────────────────────────────────
function FoxAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hard Shadow */}
      <ellipse cx="44" cy="58" rx="20" ry="15" fill={C.ink} />
      <circle cx="44" cy="38" r="20" fill={C.ink} />

      {/* Body & Head */}
      <ellipse cx="40" cy="54" rx="20" ry="15" fill={C.red} stroke={C.ink} strokeWidth="4" />
      <circle cx="40" cy="34" r="20" fill={C.red} stroke={C.ink} strokeWidth="4" />

      {/* Sharp Mask */}
      <polygon points="20,34 40,50 60,34 40,24" fill={C.cream} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      
      {/* Dot Nose */}
      <circle cx="40" cy="48" r="3" fill={C.ink} />

      {/* Slit Eyes */}
      <line x1="28" y1="32" x2="34" y2="34" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <line x1="46" y1="34" x2="52" y2="32" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />

      {/* Pointed Ears */}
      <polygon points="22,22 14,4 32,18" fill={C.red} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="58,22 66,4 48,18" fill={C.red} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ─── Robot (Brutalist) ────────────────────────────────────────────────────────
function RobotAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hard Shadow */}
      <rect x="22" y="22" width="44" height="36" rx="4" fill={C.ink} />

      {/* Box Head */}
      <rect x="18" y="18" width="44" height="36" rx="4" fill={C.white} stroke={C.ink} strokeWidth="4" />

      {/* Antenna */}
      <line x1="40" y1="18" x2="40" y2="6" stroke={C.ink} strokeWidth="4" />
      <motion.circle cx="40" cy="6" r="4" fill={C.yellow} stroke={C.ink} strokeWidth="3"
        animate={{ fill: [C.yellow, C.red, C.yellow] }} transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Screen Eyes */}
      <rect x="26" y="26" width="10" height="8" fill={C.green} stroke={C.ink} strokeWidth="3" />
      <rect x="44" y="26" width="10" height="8" fill={C.green} stroke={C.ink} strokeWidth="3" />

      {/* Grid Mouth */}
      <rect x="28" y="42" width="24" height="6" fill={C.pink} stroke={C.ink} strokeWidth="3" />
      <line x1="34" y1="42" x2="34" y2="48" stroke={C.ink} strokeWidth="3" />
      <line x1="40" y1="42" x2="40" y2="48" stroke={C.ink} strokeWidth="3" />
      <line x1="46" y1="42" x2="46" y2="48" stroke={C.ink} strokeWidth="3" />

      {/* Side Bolts */}
      <rect x="12" y="32" width="6" height="8" fill={C.yellow} stroke={C.ink} strokeWidth="3" />
      <rect x="62" y="32" width="6" height="8" fill={C.yellow} stroke={C.ink} strokeWidth="3" />
    </motion.svg>
  );
}

// ─── Panda (Brutalist) ────────────────────────────────────────────────────────
function PandaAvatar({ size }: { size: number }) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hard Shadow */}
      <ellipse cx="44" cy="58" rx="22" ry="16" fill={C.ink} />
      <circle cx="44" cy="37" r="20" fill={C.ink} />

      {/* Black Ears */}
      <circle cx="22" cy="18" r="8" fill={C.ink} />
      <circle cx="58" cy="18" r="8" fill={C.ink} />

      {/* Body & Head */}
      <ellipse cx="40" cy="54" rx="22" ry="16" fill={C.cream} stroke={C.ink} strokeWidth="4" />
      <circle cx="40" cy="33" r="20" fill={C.cream} stroke={C.ink} strokeWidth="4" />

      {/* Geometric Patches */}
      <polygon points="26,26 36,28 32,38 22,34" fill={C.ink} strokeLinejoin="round" />
      <polygon points="54,26 44,28 48,38 58,34" fill={C.ink} strokeLinejoin="round" />

      {/* Dot Eyes */}
      <circle cx="30" cy="31" r="2" fill={C.white} />
      <circle cx="50" cy="31" r="2" fill={C.white} />

      {/* Sharp Nose */}
      <polygon points="38,40 42,40 40,43" fill={C.ink} />

      {/* Blocky Bamboo */}
      <motion.g animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: '64px 56px' }}>
        <rect x="60" y="44" width="8" height="24" fill={C.green} stroke={C.ink} strokeWidth="3" transform="rotate(-15 64 56)" />
        <line x1="58" y1="52" x2="68" y2="49" stroke={C.ink} strokeWidth="3" />
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