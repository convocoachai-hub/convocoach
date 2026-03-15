'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import logoImg from '@/app/logo.png'; // Assuming you want your custom logo here too

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream:   '#F3EDE2',
  ink:     '#0F0C09',
  red:     '#D13920',
  warm1:   '#E8E0D2',
  warm2:   '#D4CBBA',
  muted:   '#8A8074',
  mutedLt: '#BFB8AC',
};

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
  { icon: Twitter,  href: '#', label: 'Twitter'  },
  { icon: Github,   href: '#', label: 'GitHub'   },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail,     href: '#', label: 'Email'    },
];

export default function Footer() {
  const pathname = usePathname();
  // Hide footer on full-screen app experiences
  if (pathname === '/practice' || pathname === '/upload') return null;

  const year = new Date().getFullYear();

  return (
    <footer className="w-full overflow-hidden" style={{ background: C.ink, borderTop: `1px solid rgba(243,237,226,0.07)`, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LINKS + BRAND GRID ────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid rgba(243,237,226,0.07)` }}>
        {/* 🔥 FIXED: Tailwind Grid classes handle the responsive layout perfectly without hydration errors */}
        <div className="max-w-[1120px] mx-auto py-14 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 lg:gap-16">

          {/* Brand blurb */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center mb-5" style={{ textDecoration: 'none' }}>
              <Image 
                src={logoImg} 
                alt="ConvoCoach Logo" 
                width={140} 
                height={32} 
                className="h-7 w-auto object-contain brightness-0 invert" // Inverts dark logo to white for dark footer
              />
            </Link>

            <p style={{ fontSize: 13.5, color: `${C.cream}40`, lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>
              AI conversation intelligence for dating, work, friendships, and everything in between.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 20 }}>
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <motion.a key={label} href={href} aria-label={label}
                  whileHover={{ y: -2, background: `${C.cream}12` }}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${C.cream}06`, border: `1px solid rgba(243,237,226,0.1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', transition: 'background 0.2s',
                  }}>
                  <Icon style={{ width: 16, height: 16, color: `${C.cream}45` }} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="flex flex-col">
              <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: `${C.cream}30`, marginBottom: 20 }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: 0 }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{ textDecoration: 'none' }}>
                      <motion.span
                        whileHover={{ x: 3, color: C.cream }}
                        style={{
                          display: 'inline-block', fontSize: 14, color: `${C.cream}50`,
                          fontWeight: 500, transition: 'color 0.2s', fontFamily: "'DM Sans', sans-serif",
                        }}>
                        {label}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────────────── */}
      <div className="max-w-[1120px] mx-auto py-6 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p style={{ fontSize: 12, color: `${C.cream}22`, margin: 0 }}>
          © {year} ConvoCoach. All rights reserved.
        </p>

        {/* Red decorative line + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 2, background: C.red, borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: `${C.cream}22`, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            Built for people who refuse to be ignored.
          </span>
        </div>
      </div>

      {/* ── LARGE WATERMARK TEXT ──────────────────────────────────── */}
      <div style={{ overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', paddingBottom: 0 }}>
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 'clamp(60px, 14vw, 180px)', // Slightly reduced minimum size so it fits on small phones
          fontWeight: 900, letterSpacing: '-0.06em',
          color: `${C.cream}04`,
          lineHeight: 0.85,
          paddingLeft: 20,
          whiteSpace: 'nowrap',
        }}>
          ConvoCoach
        </div>
      </div>
    </footer>
  );
}