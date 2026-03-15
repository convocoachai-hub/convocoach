'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload, Brain, LayoutDashboard, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import logoImg from '@/app/logo.png';

const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
};

const MEGA_LINKS = {
  Features: [
    { label: 'Analyze Chat', href: '/upload' },
    { label: 'Practice Mode', href: '/practice' },
    { label: 'Examples', href: '/examples' },
    { label: 'Pricing', href: '/upgrade' },
    { label: 'Conversation Score', href: '/conversation-score' },
    { label: 'Roast Mode', href: '/roast-mode' },
  ],
  Resources: [
    { label: 'Dating Psychology', href: '/resources/dating-psychology' },
    { label: 'Texting Guides', href: '/resources/texting-guides' },
    { label: 'Attraction Signals', href: '/resources/attraction-signals' },
    { label: 'Flirting Over Text', href: '/resources/flirting-over-text' },
    { label: 'Stop Dry Texting', href: '/resources/stop-dry-texting' },
    { label: 'Conversation Examples', href: '/resources/conversation-examples' },
  ],
  Support: [
    { label: 'Help Center', href: '/help-center' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Report a Bug', href: '/report-bug' },
    { label: 'Feature Requests', href: '/feature-requests' },
    { label: 'System Status', href: '/status' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

type Cat = keyof typeof MEGA_LINKS;
const CATS: Cat[] = ['Features', 'Resources', 'Support', 'Company'];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<Cat | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => {
      setScrolled(prev => {
        const isScrolled = window.scrollY > 12;
        return prev !== isScrolled ? isScrolled : prev; // Only update if it actually changed
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const lightPaths = ['/', '/upgrade', '/help-center', '/about', '/contact', '/privacy', '/terms', '/conversation-score', '/roast-mode', '/faq', '/report-bug', '/feature-requests', '/status', '/cookie-policy'];
  const isLight = lightPaths.includes(pathname) || pathname.startsWith('/resources');
  const txt = isLight ? C.ink : C.cream;
  const dim = isLight ? C.muted : `${C.cream}55`;
  const border = isLight ? C.warm2 : 'rgba(243,237,226,0.07)';

  const catHasActive = (cat: Cat) => MEGA_LINKS[cat].some(l => pathname === l.href || pathname.startsWith(l.href + '/'));

  return (
    <>
      {/* ═══ TOP BAR (both desktop & mobile) ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40, width: '100%',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 3vw, 36px)',
        background: isLight ? `${C.cream}E8` : `${C.ink}E8`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${border}`,
        boxShadow: scrolled ? (isLight ? '0 4px 20px rgba(15,12,9,0.07)' : '0 4px 20px rgba(0,0,0,0.35)') : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, display: 'block', lineHeight: 0 }}>
          <Image src={logoImg} alt="ConvoCoach" width={130} height={28} style={{ height: 26, width: 'auto', objectFit: 'contain' }} priority />
        </Link>

        {/* Center — quick links (desktop only) */}
        <div className="hidden md:flex" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', alignItems: 'center', gap: 4 }}>
          {[
            { href: '/upload', label: 'Analyze', icon: Upload },
            { href: '/practice', label: 'Practice', icon: Brain },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 10,
                  background: active ? (isLight ? C.warm1 : 'rgba(243,237,226,0.08)') : 'transparent',
                  border: `1px solid ${active ? border : 'transparent'}`,
                  transition: 'all 0.15s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon style={{ width: 15, height: 15, color: active ? txt : dim, transition: 'color 0.15s' }} />
                  <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? txt : dim, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s' }}>{label}</span>
                  {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.red, marginLeft: 2 }} />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Upgrade (desktop) */}
         <Link href="/upgrade" className="hidden md:block" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${C.red}40` }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: C.red, color: '#fff', border: 'none', borderRadius: 10,
                padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                boxShadow: `0 2px 10px ${C.red}25`,
              }}
            >Upgrade →</motion.button>
          </Link>

          {/* PRO badge (mobile) */}
          <Link href="/upgrade" className="md:hidden" style={{ textDecoration: 'none' }}>
            <div style={{ background: C.red, color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 7, fontFamily: "'Bricolage Grotesque', sans-serif" }}>PRO</div>
          </Link>

          {/* Auth avatar (desktop) */}
          {session && (
            <Link href="/dashboard" className="hidden md:block" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                borderRadius: '50%', padding: 2, border: `2px solid ${border}`,
                transition: 'border-color 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.red}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}
              >
                {session.user?.image ? (
                  <Image src={session.user.image} alt="" width={32} height={32} style={{ borderRadius: '50%', display: 'block' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isLight ? C.warm1 : 'rgba(243,237,226,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 14, height: 14, color: dim }} />
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Sign in (desktop, not logged in) */}
          {!session && (
            <button className="hidden md:block" onClick={() => signIn('google')}
              style={{
                background: 'transparent', border: `1.5px solid ${border}`,
                borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 600,
                color: txt, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Sign in</button>
          )}

          {/* Hamburger — always visible */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, background: isLight ? C.warm1 : 'rgba(243,237,226,0.07)',
              border: `1px solid ${border}`, cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLight ? C.warm2 : 'rgba(243,237,226,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = isLight ? C.warm1 : 'rgba(243,237,226,0.07)'}
          >
            <Menu style={{ width: 18, height: 18, color: txt }} />
          </button>
        </div>
      </nav>

      {/* ═══ SIDE DRAWER (unified for desktop + mobile) ═══ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,9,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 50, cursor: 'pointer', willChange: 'opacity' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} // Snappy, premium slide-in
              style={{
                position: 'fixed', top: 0, right: 0, height: '100dvh',
                width: 'clamp(280px, 85vw, 360px)',
                background: C.cream, borderLeft: `1px solid ${C.warm2}`,
                zIndex: 51, display: 'flex', flexDirection: 'column',
                boxShadow: '-4px 0 30px rgba(15,12,9,0.12)',
              }}
            >
              {/* ── Header ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.warm2}`, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', color: C.red }}>Menu</span>
                <button onClick={() => setDrawerOpen(false)}
                  style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: C.warm1, border: `1px solid ${C.warm2}`, cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.warm2}
                  onMouseLeave={e => e.currentTarget.style.background = C.warm1}
                >
                  <X style={{ width: 16, height: 16, color: C.ink }} />
                </button>
              </div>

              {/* ── Scrollable body ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>

                {/* Primary CTAs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[
                    { href: '/upload', label: 'Analyze', sub: 'Upload chat', icon: Upload },
                    { href: '/practice', label: 'Practice', sub: 'Train with AI', icon: Brain },
                  ].map(({ href, label, sub, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link key={href} href={href} onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14,
                          background: active ? C.ink : C.warm1, border: `1px solid ${active ? C.ink : C.warm2}`,
                          transition: 'all 0.15s', cursor: 'pointer',
                        }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.warm2; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = C.warm1; }}
                        >
                          <Icon style={{ width: 17, height: 17, color: active ? C.cream : C.red, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.cream : C.ink, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
                            <div style={{ fontSize: 10, color: active ? `${C.cream}60` : C.muted }}>{sub}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div style={{ height: 1, background: C.warm2, margin: '0 4px 6px' }} />

                {/* Category sections — collapsible */}
                {CATS.map(cat => {
                  const isExp = expanded === cat;
                  const hasActive = catHasActive(cat);
                  return (
                    <div key={cat} style={{ marginBottom: 1 }}>
                      <button
                        onClick={() => setExpanded(isExp ? null : cat)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                          background: isExp ? C.warm1 : 'transparent',
                          border: 'none', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = `${C.warm1}80`; }}
                        onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: hasActive ? 700 : 600, color: hasActive ? C.ink : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{cat}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {hasActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />}
                          <ChevronDown style={{
                            width: 14, height: 14, color: C.muted,
                            transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'rotate(0)',
                          }} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden', paddingLeft: 8 }}
                          >
                            {MEGA_LINKS[cat].map(link => {
                              const active = pathname === link.href;
                              return (
                                <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
                                  <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 14px', borderRadius: 9,
                                    background: active ? `${C.red}08` : 'transparent',
                                    transition: 'background 0.12s', cursor: 'pointer',
                                  }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = `${C.warm1}80`; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? `${C.red}08` : 'transparent'; }}
                                  >
                                    <span style={{ fontSize: 13, fontWeight: active ? 650 : 450, color: active ? C.ink : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                                    {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.red }} />}
                                  </div>
                                </Link>
                              );
                            })}
                            <div style={{ height: 4 }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div style={{ height: 1, background: C.warm2, margin: '8px 4px 10px' }} />

                {/* Upgrade CTA */}
                <Link href="/upgrade" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12, background: C.ink, cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Upgrade to Premium</span>
                    <span style={{ fontSize: 13, color: C.red, fontWeight: 900 }}>→</span>
                  </div>
                </Link>
              </div>

              {/* ── Auth footer ── */}
              <div style={{ padding: '16px 14px', borderTop: `1px solid ${C.warm2}`, background: C.warm1, flexShrink: 0 }}>
                {session ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="" width={40} height={40} style={{ borderRadius: '50%', border: `1.5px solid ${C.warm2}`, display: 'block' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.warm2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User style={{ width: 18, height: 18, color: C.muted }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href="/dashboard" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px',
                          background: C.cream, border: `1px solid ${C.warm2}`, borderRadius: 10, cursor: 'pointer',
                          transition: 'background 0.12s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = C.warm2}
                          onMouseLeave={e => e.currentTarget.style.background = C.cream}
                        >
                          <LayoutDashboard style={{ width: 14, height: 14, color: C.muted }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Dashboard</span>
                        </div>
                      </Link>
                      <button onClick={() => { setDrawerOpen(false); signOut(); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '11px 16px', background: `${C.red}08`, border: `1px solid ${C.red}20`,
                          borderRadius: 10, cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${C.red}15`}
                        onMouseLeave={e => e.currentTarget.style.background = `${C.red}08`}
                      >
                        <LogOut style={{ width: 14, height: 14, color: C.red }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setDrawerOpen(false); signIn('google'); }}
                    style={{
                      width: '100%', background: C.ink, color: C.cream, border: 'none',
                      borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >Sign in</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}