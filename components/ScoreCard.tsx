'use client';

import { motion } from 'framer-motion';

// ─── DESIGN TOKENS — Neo-Brutalism ───────────────────────────────────────────
const C = {
  cream:     '#F3EDE2',
  ink:       '#0F0C09',
  warm1:     '#E8E0D2',
  shadow:    '4px 4px 0px #0F0C09',
  shadowLg:  '8px 8px 0px #0F0C09',
  border:    '3px solid #0F0C09',
  borderThin:'2px solid #0F0C09',
};

interface ScoreCardProps {
  label: string;
  value: number;
  maxValue: number;
  suffix?: string;
  color: string; // Pass a hex code here (e.g., C.red or '#D13920')
  bg?: string;   // Optional background color (defaults to white)
}

export default function ScoreCard({ 
  label, 
  value, 
  maxValue, 
  suffix = '', 
  color, 
  bg = '#FFFFFF' 
}: ScoreCardProps) {
  // SVG Math
  const size = 120;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  
  // Cap percentage between 0 and 100
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: C.shadowLg }}
      transition={{ duration: 0.2 }}
      style={{
        background: bg,
        border: C.border,
        borderRadius: 24,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: C.shadow,
        width: '100%',
      }}
    >
      {/* Circular Progress */}
      <div style={{ position: 'relative', width: size, height: size, marginBottom: 20 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={C.warm1} strokeWidth={strokeWidth}
          />
          {/* Animated Progress Track */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </svg>
        
        {/* Score Number inside the ring */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: 28, fontWeight: 900, color: C.ink, 
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1, letterSpacing: '-0.02em' 
          }}>
            {value}{suffix}
          </span>
        </div>
      </div>

      {/* Label */}
      <span style={{ 
        fontSize: 12, fontWeight: 900, color: C.ink, 
        textTransform: 'uppercase', letterSpacing: '0.1em', 
        fontFamily: "'DM Sans', sans-serif", textAlign: 'center' 
      }}>
        {label}
      </span>
    </motion.div>
  );
}