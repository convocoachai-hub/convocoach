'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload, Brain, MessageSquare, CreditCard, LayoutDashboard, User, LogOut, Menu, X, Home } from 'lucide-react';
import logoImg from '@/app/logo.png'; // Matches your footer logo import

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  cream:   '#F3EDE2',
  ink:     '#0F0C09',
  red:     '#D13920',
  warm1:   '#E8E0D2',
  warm2:   '#D4CBBA',
  muted:   '#8A8074',
  mutedLt: '#BFB8AC',
};

const NAV_LINKS = [
  { href: '/upload',   label: 'Analyze',  icon: Upload },
  { href: '/practice', label: 'Practice', icon: Brain },
  { href: '/examples', label: 'Examples', icon: MessageSquare },
  { href: '/upgrade',  label: 'Pricing',  icon: CreditCard },
];

const EO = { duration: 0.55, ease: [0.16, 1, 0.3, 1] } as const;

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Is this a "light" page (cream bg) or dark page?
  const isLightPage = pathname === '/' || pathname === '/upgrade';

  return (
    <>
      <style>{`
        .nav-link-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${C.red}; display: block;
          margin: 0 auto; margin-top: 3px;
          opacity: 0; transform: scale(0);
          transition: all 0.2s ease;
        }
        .nav-link-active .nav-link-dot { opacity: 1; transform: scale(1); }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP NAVBAR
      ══════════════════════════════════════════════════════════════ */}
      <nav
        className="hidden md:flex items-center justify-between px-9 sticky top-0 z-40 w-full transition-shadow duration-300"
        style={{
          height: 68,
          background: isLightPage ? `${C.cream}E8` : `${C.ink}E8`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isLightPage ? C.warm2 : 'rgba(243,237,226,0.07)'}`,
          boxShadow: scrolled
            ? isLightPage
              ? '0 4px 24px rgba(15,12,9,0.08)'
              : '0 4px 24px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        {/* ── Logo ── */}
        <Link href="/" className="z-10 block">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="flex items-center">
            <Image 
              src={logoImg} 
              alt="ConvoCoach Logo" 
              width={160} 
              height={36} 
              className="h-8 w-auto object-contain"
              priority
            />
          </motion.div>
        </Link>

        {/* ── Center nav links (With Premium Hover Effects) ── */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={isActive ? 'nav-link-active' : ''} style={{ textDecoration: 'none' }}>
                <motion.div 
                  whileHover={{ 
                    backgroundColor: isLightPage ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
                    scale: 1.02
                  }} 
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
                    background: isActive ? (isLightPage ? C.warm1 : 'rgba(243,237,226,0.08)') : 'transparent',
                    border: `1px solid ${isActive ? (isLightPage ? C.warm2 : 'rgba(243,237,226,0.1)') : 'transparent'}`,
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon style={{
                      width: 15, height: 15,
                      color: isActive ? (isLightPage ? C.ink : C.cream) : (isLightPage ? C.muted : `${C.cream}60`),
                      transition: 'color 0.2s',
                    }} />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: isActive ? 700 : 500,
                      color: isActive ? (isLightPage ? C.ink : C.cream) : (isLightPage ? C.muted : `${C.cream}60`),
                      transition: 'color 0.2s',
                    }}>{link.label}</span>
                  </div>
                  <div className="nav-link-dot" />
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* ── Right: CTA + auth ── */}
        <div className="flex items-center gap-4 z-10">
          <Link href="/upgrade" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 6px 24px ${C.red}40` }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: C.red, color: '#fff', border: 'none', borderRadius: 12,
                padding: '10px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '0.02em',
                boxShadow: `0 2px 12px ${C.red}25`, transition: 'box-shadow 0.2s'
              }}>
              Upgrade →
            </motion.button>
          </Link>

          {session ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', padding: 2, cursor: 'pointer',
                  border: `2px solid ${isLightPage ? C.warm2 : 'rgba(243,237,226,0.12)'}`,
                  background: 'none', transition: 'border-color 0.2s',
                }}>
                {session.user?.image ? (
                  <Image src={session.user.image} alt={session.user.name || 'User'}
                    width={36} height={36}
                    style={{ borderRadius: '50%', display: 'block' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isLightPage ? C.warm1 : 'rgba(243,237,226,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 16, height: 16, color: isLightPage ? C.muted : `${C.cream}60` }} />
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={EO}
                    style={{
                      position: 'absolute', right: 0, marginTop: 12, width: 240,
                      background: C.cream, border: `1.5px solid ${C.warm2}`,
                      borderRadius: 18, overflow: 'hidden',
                      boxShadow: '0 12px 48px rgba(15,12,9,0.15), 0 2px 8px rgba(15,12,9,0.08)',
                      zIndex: 50,
                    }}>
                    <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.warm2}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.user?.name}
                      </p>
                      <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
                        {session.user?.email}
                      </p>
                    </div>

                    <div style={{ padding: '8px' }}>
                      <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} style={{ textDecoration: 'none' }}>
                        <motion.div whileHover={{ background: C.warm1 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', transition: 'background 0.15s' }}>
                          <LayoutDashboard style={{ width: 16, height: 16, color: C.muted, flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>Dashboard</span>
                        </motion.div>
                      </Link>

                      <div style={{ height: 1, background: C.warm2, margin: '6px 0' }} />

                      <motion.button whileHover={{ background: `${C.red}15` }}
                        onClick={() => { setIsDropdownOpen(false); signOut(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                          borderRadius: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
                          background: 'none', border: 'none', transition: 'background 0.15s',
                        }}>
                        <LogOut style={{ width: 16, height: 16, color: C.red, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.red, fontFamily: "'DM Sans', sans-serif" }}>Sign out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.03, backgroundColor: isLightPage ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.97 }}
              onClick={() => signIn('google')}
              style={{
                background: 'transparent', border: `1.5px solid ${isLightPage ? C.warm2 : 'rgba(243,237,226,0.15)'}`,
                borderRadius: 12, padding: '9px 20px', fontSize: 14, fontWeight: 600,
                color: isLightPage ? C.ink : C.cream, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}>
              Sign in
            </motion.button>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE TOP BAR (Fixed Stacking Bug)
      ══════════════════════════════════════════════════════════════ */}
      <nav
        className="flex md:hidden items-center justify-between px-5 sticky top-0 z-40 w-full transition-shadow duration-300"
        style={{
          height: 64,
          background: isLightPage ? `${C.cream}F0` : `${C.ink}F0`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isLightPage ? C.warm2 : 'rgba(243,237,226,0.07)'}`,
          boxShadow: scrolled ? '0 2px 16px rgba(15,12,9,0.08)' : 'none',
        }}>
        
        {/* Mobile Logo */}
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block">
          <Image 
            src={logoImg} 
            alt="ConvoCoach Logo" 
            width={130} 
            height={28} 
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/upgrade" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ background: C.red, color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 8, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '0.04em' }}>
              PRO
            </div>
          </Link>
          <motion.button whileTap={{ scale: 0.93 }}
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, background: isLightPage ? C.warm1 : 'rgba(243,237,226,0.07)',
              border: `1px solid ${isLightPage ? C.warm2 : 'rgba(243,237,226,0.1)'}`,
              cursor: 'pointer',
            }}>
            <Menu style={{ width: 20, height: 20, color: isLightPage ? C.ink : C.cream }} />
          </motion.button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,9,0.55)', backdropFilter: 'blur(4px)', zIndex: 50 }}
              className="md:hidden" />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              style={{
                position: 'fixed', top: 0, right: 0, height: '100dvh',
                width: '85vw', maxWidth: 320,
                background: C.cream, borderLeft: `1.5px solid ${C.warm2}`,
                zIndex: 51, display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 48px rgba(15,12,9,0.18)',
              }}
              className="md:hidden">

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.warm2}` }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', color: C.red }}>
                  Menu
                </span>
                <motion.button whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: C.warm1, border: `1px solid ${C.warm2}`, cursor: 'pointer' }}>
                  <X style={{ width: 18, height: 18, color: C.ink }} />
                </motion.button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ x: 4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 14, background: pathname === '/' ? C.warm1 : 'transparent',
                      border: `1px solid ${pathname === '/' ? C.warm2 : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}>
                    <Home style={{ width: 20, height: 20, color: pathname === '/' ? C.ink : C.muted, flexShrink: 0 }} />
                    <span style={{ fontSize: 16, fontWeight: pathname === '/' ? 700 : 500, color: pathname === '/' ? C.ink : C.muted, fontFamily: "'DM Sans', sans-serif" }}>Home</span>
                    {pathname === '/' && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'block' }} />}
                  </motion.div>
                </Link>

                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div whileHover={{ x: 4 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                          borderRadius: 14, background: isActive ? C.warm1 : 'transparent',
                          border: `1px solid ${isActive ? C.warm2 : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}>
                        <link.icon style={{ width: 20, height: 20, color: isActive ? C.ink : C.muted, flexShrink: 0 }} />
                        <span style={{ fontSize: 16, fontWeight: isActive ? 700 : 500, color: isActive ? C.ink : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                        {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'block' }} />}
                      </motion.div>
                    </Link>
                  );
                })}

                <div style={{ height: 1, background: C.warm2, margin: '12px 4px' }} />

                <Link href="/upgrade" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '16px', borderRadius: 14, background: C.ink, cursor: 'pointer',
                    }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Upgrade to Premium</span>
                    <span style={{ fontSize: 14, color: C.red, fontWeight: 900 }}>→</span>
                  </motion.div>
                </Link>
              </div>

              <div style={{ padding: '20px 16px', borderTop: `1px solid ${C.warm2}`, background: C.warm1 }}>
                {session ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="" width={44} height={44}
                          style={{ borderRadius: '50%', border: `1.5px solid ${C.warm2}`, display: 'block' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.warm2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User style={{ width: 20, height: 20, color: C.muted }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</div>
                      </div>
                    </div>

                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: C.cream, border: `1px solid ${C.warm2}`, borderRadius: 12, cursor: 'pointer' }}>
                        <LayoutDashboard style={{ width: 18, height: 18, color: C.muted }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>My Dashboard</span>
                      </motion.div>
                    </Link>

                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: '14px 16px', background: `${C.red}10`, border: `1px solid ${C.red}25`,
                        borderRadius: 12, cursor: 'pointer', width: '100%',
                      }}>
                      <LogOut style={{ width: 16, height: 16, color: C.red }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.red, fontFamily: "'DM Sans', sans-serif" }}>Sign out</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setIsMobileMenuOpen(false); signIn('google'); }}
                    style={{
                      width: '100%', background: C.ink, color: C.cream, border: 'none',
                      borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                    Sign in to your account
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}