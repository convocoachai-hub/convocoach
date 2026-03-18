'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import logoImg from '@/app/logo.png'; 

// ─── DESIGN TOKENS (Neo-Brutalism × Memphis) ──────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF3D3D',
  blue:      '#4338CA',
  green:     '#16A34A',
  pink:      '#EC4899',
  black:     '#0A0A0A',
  white:     '#FFFFFF',
  bgCream:   '#FAF6EE',
  shadow:    '4px 4px 0px #0A0A0A',
  shadowSm:  '2px 2px 0px #0A0A0A',
  border:    '3px solid #0A0A0A',
  borderThin:'1.5px solid #0A0A0A',
};

const SNAP = { duration: 0.15, ease: [0.2, 0, 0.2, 1] } as const;

// Decorative Geometric Shapes
const Star = ({ size = 20, color = C.yellow, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={style}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

const FOOTER_LINKS = {
  Features: [
    { label: 'Analyze Chat',        href: '/upload'   },
    { label: 'Practice Mode',       href: '/practice' },
    { label: 'Examples',            href: '/examples' },
    { label: 'Pricing',             href: '/upgrade'  },
    { label: 'Conversation Score',  href: '/conversation-score' },
    { label: 'Roast Mode',          href: '/roast-mode' },
  ],
  Resources: [
    { label: 'Dating Psychology',     href: '/resources/dating-psychology' },
    { label: 'Texting Guides',        href: '/resources/texting-guides' },
    { label: 'Attraction Signals',    href: '/resources/attraction-signals' },
    { label: 'Flirting Over Text',    href: '/resources/flirting-over-text' },
    { label: 'Stop Dry Texting',      href: '/resources/stop-dry-texting' },
    { label: 'Conversation Examples', href: '/resources/conversation-examples' },
  ],
  Support: [
    { label: 'Help Center',       href: '/help-center' },
    { label: 'FAQ',                href: '/faq' },
    { label: 'Report a Bug',      href: '/report-bug' },
    { label: 'Feature Requests',  href: '/feature-requests' },
    { label: 'System Status',     href: '/status' },
  ],
  Company: [
    { label: 'About Us',       href: '/about' },
    { label: 'Contact',        href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms',          href: '/terms' },
    { label: 'Cookie Policy',  href: '/cookie-policy' },
  ],
};

const SOCIAL = [
  { icon: Twitter,  href: '#', label: 'Twitter',  hover: C.blue },
  { icon: Github,   href: '#', label: 'GitHub',   hover: C.pink },
  { icon: Linkedin, href: '#', label: 'LinkedIn', hover: C.blue },
  { icon: Mail,     href: '#', label: 'Email',    hover: C.red  },
];

const CAT_COLORS: Record<string, string> = {
  Features:  C.red,
  Resources: C.blue,
  Support:   C.green,
  Company:   C.yellow,
};

export default function Footer() {
  const pathname = usePathname();
  // Hide footer on full-screen app experiences
  if (pathname === '/practice' || pathname === '/upload') return null;

  const year = new Date().getFullYear();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
      `}} />
      
      <footer style={{ 
        background: C.bgCream, 
        borderTop: C.border, 
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Noise Texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '180px', opacity: 0.03, mixBlendMode: 'multiply',
        }} />

        {/* ── LINKS + BRAND GRID ────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 1, borderBottom: C.border }}>
          <div className="max-w-[1120px] mx-auto py-16 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">

            {/* Brand blurb (Takes up 2 columns on desktop) */}
            <div className="flex flex-col md:col-span-2 pr-0 md:pr-12">
              <Link href="/" style={{ textDecoration: 'none', width: 'fit-content' }}>
                <motion.div 
                  whileHover={{ y: -2, boxShadow: C.shadow }} 
                  transition={SNAP}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: C.yellow, border: C.border, borderRadius: 10,
                    padding: '8px 14px', boxShadow: C.shadowSm, marginBottom: 24,
                    width: 'fit-content'
                  }}>
                  <Image src={logoImg} alt="ConvoCoach Logo" width={120} height={24} style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
                </motion.div>
              </Link>

              <p style={{ fontSize: 14.5, color: '#444', lineHeight: 1.7, fontWeight: 500, marginBottom: 28, maxWidth: 320 }}>
                AI conversation intelligence for dating, work, friendships, and everything in between. Never send a blind text again.
              </p>

              {/* Socials */}
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                {SOCIAL.map(({ icon: Icon, href, label, hover }) => (
                  <motion.a key={label} href={href} aria-label={label}
                    whileHover={{ y: -3, boxShadow: C.shadow, backgroundColor: hover }}
                    whileTap={{ y: 0, boxShadow: C.shadowSm }}
                    transition={SNAP}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: C.white, border: C.border,
                      boxShadow: C.shadowSm,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none', color: C.black,
                    }}>
                    <Icon style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => {
              const accent = CAT_COLORS[title];
              return (
                <div key={title} className="flex flex-col">
                  {/* Brutalist Category Badge */}
                  <div style={{ 
                    display: 'inline-block', background: accent, color: accent === C.yellow ? C.black : C.white, 
                    border: C.borderThin, borderRadius: 6, padding: '3px 10px', 
                    fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', 
                    boxShadow: C.shadowSm, marginBottom: 20, width: 'fit-content',
                    transform: 'rotate(-2deg)'
                  }}>
                    {title}
                  </div>
                  
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: 0 }}>
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link href={href} style={{ textDecoration: 'none' }}>
                          <motion.span
                            whileHover={{ x: 4, color: accent === C.yellow ? '#B8860B' : accent }}
                            transition={SNAP}
                            style={{
                              display: 'inline-block', fontSize: 14, color: C.black,
                              fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                            }}>
                            {label}
                          </motion.span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM BAR ────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 1, background: C.white }}>
          <div className="max-w-[1120px] mx-auto py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p style={{ fontSize: 13, color: '#666', fontWeight: 600, margin: 0 }}>
              © {year} ConvoCoach. All rights reserved.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, border: C.borderThin }} />
              <span style={{ fontSize: 12.5, color: C.black, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Built for people who refuse to be ignored.
              </span>
            </div>
          </div>
        </div>

        {/* ── LARGE WATERMARK TEXT ──────────────────────────────────── */}
        <div style={{ 
          position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none', userSelect: 'none', zIndex: 0, width: '100%', textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(60px, 15vw, 220px)', 
            fontWeight: 900, letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: `2px rgba(10,10,10,0.04)`,
            lineHeight: 0.75,
            whiteSpace: 'nowrap',
          }}>
            CONVOCOACH
          </div>
        </div>
        
        {/* Decorative Stars */}
        <div style={{ position: 'absolute', top: 30, right: '5%', zIndex: 0, opacity: 0.5 }}>
          <Star size={32} color={C.yellow} />
        </div>
        <div style={{ position: 'absolute', bottom: 120, left: '2%', zIndex: 0, opacity: 0.3, transform: 'rotate(15deg)' }}>
          <Star size={24} color={C.blue} />
        </div>
      </footer>
    </>
  );
}