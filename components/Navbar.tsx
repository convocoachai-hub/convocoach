'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload, Brain, LayoutDashboard, User, LogOut, Menu, X, ChevronDown, Star } from 'lucide-react';
import logoImg from '@/app/logo.png';
import { isPremium } from '@/lib/premiumUtils';

// ─── DESIGN TOKENS (matches Neo-Brutalism × Memphis system) ──────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF4D4D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  black:     '#0D0D0D',
  white:     '#FFFFFF',
  bgCream:   '#FFF7E6',
  warm1:     '#F0E8D8',
  warm2:     '#E0D4C0',
  muted:     '#777',
  shadow:    '4px 4px 0px #0D0D0D',
  shadowSm:  '3px 3px 0px #0D0D0D',
  border:    '3px solid #0D0D0D',
  borderThin:'2px solid #0D0D0D',
};

const SNAP = { duration: 0.15, ease: [0.2, 0, 0.2, 1] } as const;

const MEGA_LINKS = {
  Features: [
    { label: 'Analyze Chat',       href: '/upload'             },
    { label: 'Practice Mode',      href: '/practice'           },
    { label: 'Examples',           href: '/examples'           },
    { label: 'Pricing',            href: '/upgrade'            },
    { label: 'Conversation Score', href: '/conversation-score' },
    { label: 'Roast Mode',         href: '/roast-mode'         },
  ],
  Resources: [
    { label: 'Dating Psychology',    href: '/resources/dating-psychology'    },
    { label: 'Texting Guides',       href: '/resources/texting-guides'       },
    { label: 'Attraction Signals',   href: '/resources/attraction-signals'   },
    { label: 'Flirting Over Text',   href: '/resources/flirting-over-text'   },
    { label: 'Stop Dry Texting',     href: '/resources/stop-dry-texting'     },
    { label: 'Conversation Examples',href: '/resources/conversation-examples'},
  ],
  Support: [
    { label: 'Help Center',      href: '/help-center'      },
    { label: 'FAQ',              href: '/faq'              },
    { label: 'Report a Bug',     href: '/report-bug'       },
    { label: 'Feature Requests', href: '/feature-requests' },
    { label: 'System Status',    href: '/status'           },
  ],
  Company: [
    { label: 'About Us',       href: '/about'         },
    { label: 'Contact',        href: '/contact'       },
    { label: 'Privacy Policy', href: '/privacy'       },
    { label: 'Terms',          href: '/terms'         },
    { label: 'Cookie Policy',  href: '/cookie-policy' },
  ],
};

type Cat = keyof typeof MEGA_LINKS;
const CATS: Cat[] = ['Features', 'Resources', 'Support', 'Company'];

// Accent color per category
const CAT_COLOR: Record<Cat, string> = {
  Features:  C.red,
  Resources: C.blue,
  Support:   C.green,
  Company:   C.yellow,
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<Cat | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Check if user is premium
  const isPaid = isPremium(session);

  // Optimized Scroll Listener (fixes the lag)
  useEffect(() => {
    let ticking = false;
    const fn = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const catHasActive = (cat: Cat) =>
    MEGA_LINKS[cat].some(l => pathname === l.href || pathname.startsWith(l.href + '/'));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        .nb-nav-link:hover { background: #F0E8D8 !important; }
        .nb-pill-active { background: #0D0D0D !important; color: #FFF !important; }
        .nb-sign-in:hover { background: #F0E8D8 !important; }
        .nb-hamburger:hover { background: #E0D4C0 !important; transform: translateY(-2px); box-shadow: 4px 4px 0 #0D0D0D !important; }
        .nb-close:hover { background: #FFD84D !important; }
        .nb-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 6px 6px 0 #0D0D0D !important; }
        
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}} />

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40, width: '100%',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(14px, 3vw, 32px)',
        background: C.bgCream,
        borderBottom: scrolled ? C.border : C.borderThin,
        boxShadow: scrolled ? C.shadow : 'none',
        transition: 'box-shadow 0.15s, border 0.15s',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ flexShrink: 0, lineHeight: 0, textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: C.yellow, border: C.border, borderRadius: 10,
            padding: '6px 12px', boxShadow: C.shadowSm,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = C.shadowSm; }}
          >
            <Image src={logoImg} alt="ConvoCoach" width={110} height={22} style={{ height: 22, width: 'auto', objectFit: 'contain' }} priority />
          </div>
        </Link>

        {/* ── Center quick links (desktop) ── */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 6,
        }} className="hide-on-mobile">
          {[
            { href: '/upload',   label: 'Analyze',  icon: Upload, color: C.red  },
            { href: '/practice', label: 'Practice', icon: Brain,  color: C.blue },
          ].map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10,
                    background: active ? C.black : C.white,
                    border: C.border,
                    boxShadow: active ? C.shadow : C.shadowSm,
                    cursor: 'pointer',
                  }}>
                  <Icon style={{ width: 15, height: 15, color: active ? C.white : color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: active ? C.white : C.black }}>
                    {label}
                  </span>
                  {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.yellow, border: '1.5px solid rgba(0,0,0,0.2)' }} />}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

         {/* Upgrade / Premium Badge (desktop) */}
          {!isPaid ? (
            <Link href="/upgrade" className="hidden md:block" style={{ textDecoration: 'none' }}>
              <motion.button className="nb-upgrade-btn"
                whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 1, boxShadow: C.shadowSm }} transition={SNAP}
                style={{
                  background: C.red, color: C.white, border: C.border, borderRadius: 10,
                  padding: '8px 18px', fontSize: 13, fontWeight: 900, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow,
                }}>
                Upgrade →
              </motion.button>
            </Link>
          ) : (
            <div className="hidden md:flex" style={{
              alignItems: 'center', gap: 7, background: C.black, color: C.yellow,
              border: C.border, borderRadius: 10, padding: '8px 16px', fontSize: 13,
              fontWeight: 900, fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadowSm, cursor: 'default'
            }}>
              <Star style={{ width: 18, height: 18, color: C.yellow, fill: C.yellow, strokeWidth: 2.5 }} /> Premium
            </div>
          )}

          {/* PRO / Premium Badge (mobile) */}
          {!isPaid ? (
            <Link href="/upgrade" className="md:hidden" style={{ textDecoration: 'none' }}>
              <div style={{
                background: C.red, color: C.white, fontSize: 11, fontWeight: 900,
                padding: '5px 12px', borderRadius: 8, border: C.border, boxShadow: C.shadowSm,
              }}>PRO</div>
            </Link>
          ) : (
            <div className="flex md:hidden" style={{
              alignItems: 'center', justifyContent: 'center',
              background: C.black, color: C.yellow,
              padding: '6px 10px', borderRadius: 8, border: C.border, boxShadow: C.shadowSm
            }}>
              <Star style={{ width: 16, height: 16, color: C.yellow, fill: C.yellow, strokeWidth: 2.5 }} />
            </div>
          )}

          {/* Auth avatar (desktop) */}
          {session && (
            <Link href="/dashboard" className="hidden md:block" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <motion.div whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                style={{
                  borderRadius: '50%', border: C.border, overflow: 'hidden',
                  boxShadow: C.shadowSm, cursor: 'pointer',
                }}>
                {session.user?.image ? (
                  <Image src={session.user.image} alt="" width={36} height={36} style={{ display: 'block' }} />
                ) : (
                  <div style={{ width: 36, height: 36, background: C.warm1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 15, height: 15, color: C.muted }} />
                  </div>
                )}
              </motion.div>
            </Link>
          )}

          {/* Sign in (desktop, not logged in) */}
          {!session && (
            <button className="nb-sign-in hidden md:block" onClick={() => signIn('google')}
              style={{
                background: C.white, border: C.border, borderRadius: 10,
                padding: '8px 16px', fontSize: 13, fontWeight: 700, color: C.black,
                cursor: 'pointer', boxShadow: C.shadowSm,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = C.shadowSm; }}
            >Sign in</button>
          )}

          {/* Hamburger */}
          <button className="nb-hamburger"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, background: C.yellow, border: C.border, cursor: 'pointer',
              boxShadow: C.shadowSm, transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
            <Menu style={{ width: 18, height: 18, color: C.black }} />
          </button>
        </div>
      </nav>

      {/* ═══ SIDE DRAWER ═══ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,13,0.55)', zIndex: 50, cursor: 'pointer' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 0, right: 0, height: '100dvh',
                width: 'clamp(280px, 88vw, 360px)',
                background: C.bgCream,
                borderLeft: C.border,
                zIndex: 51, display: 'flex', flexDirection: 'column',
                boxShadow: '-6px 0 0px #0D0D0D',
                fontFamily: "'DM Sans', sans-serif",
              }}>

              {/* ── Drawer header ── */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: C.border, flexShrink: 0,
                background: C.yellow,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, background: C.red, border: C.borderThin, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.black }}>
                    Navigation
                  </span>
                </div>
                <button className="nb-close"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 9, background: C.white, border: C.border,
                    cursor: 'pointer', boxShadow: C.shadowSm, transition: 'background 0.12s, transform 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'rotate(90deg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  <X style={{ width: 16, height: 16, color: C.black }} />
                </button>
              </div>

              {/* ── Scrollable body ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>

                {/* Primary CTAs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[
                    { href: '/upload',   label: 'Analyze',  sub: 'Upload chat',  icon: Upload, color: C.red  },
                    { href: '/practice', label: 'Practice', sub: 'Train with AI', icon: Brain,  color: C.blue },
                  ].map(({ href, label, sub, icon: Icon, color }) => {
                    const active = pathname === href;
                    return (
                      <Link key={href} href={href} onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                        <motion.div whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 9, padding: '13px 12px', borderRadius: 12,
                            background: active ? C.black : C.white,
                            border: C.border,
                            boxShadow: active ? C.shadow : C.shadowSm,
                            cursor: 'pointer',
                          }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? color + '30' : color + '15', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: 15, height: 15, color }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: active ? C.white : C.black }}>{label}</div>
                            <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.5)' : C.muted }}>{sub}</div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div style={{ height: 3, background: C.black, borderRadius: 2, margin: '0 4px 12px' }} />

                {/* Category accordion */}
                {CATS.map(cat => {
                  const isExp = expanded === cat;
                  const hasActive = catHasActive(cat);
                  const accent = CAT_COLOR[cat];
                  return (
                    <div key={cat} style={{ marginBottom: 4 }}>
                      <button
                        onClick={() => setExpanded(isExp ? null : cat)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                          background: isExp ? C.white : 'transparent',
                          border: isExp ? C.border : '2px solid transparent',
                          boxShadow: isExp ? C.shadowSm : 'none',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = C.white; }}
                        onMouseLeave={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, border: '1.5px solid #0D0D0D', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: hasActive ? 900 : 700, color: C.black }}>{cat}</span>
                          {hasActive && <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.red, border: '1.5px solid #0D0D0D' }} />}
                        </div>
                        <ChevronDown style={{
                          width: 15, height: 15, color: C.black,
                          transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'rotate(0)',
                        }} />
                      </button>

                      <AnimatePresence>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden', paddingLeft: 6, paddingTop: 4 }}
                          >
                            {MEGA_LINKS[cat].map(link => {
                              const active = pathname === link.href;
                              return (
                                <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
                                  <motion.div whileHover={{ x: 3 }} transition={SNAP}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                      padding: '9px 14px', borderRadius: 9,
                                      background: active ? accent : 'transparent',
                                      border: active ? C.borderThin : '2px solid transparent',
                                      boxShadow: active ? C.shadowSm : 'none',
                                      transition: 'background 0.12s',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = C.white; }}
                                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                  >
                                    <span style={{ fontSize: 13, fontWeight: active ? 800 : 500, color: active ? (accent === C.yellow ? C.black : C.white) : C.black }}>
                                      {link.label}
                                    </span>
                                    {active && <span style={{ fontSize: 12, color: accent === C.yellow ? C.black : C.white }}>→</span>}
                                  </motion.div>
                                </Link>
                              );
                            })}
                            <div style={{ height: 6 }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Divider */}
                <div style={{ height: 3, background: C.black, borderRadius: 2, margin: '10px 4px 12px' }} />

                {/* Upgrade CTA / Premium Status Indicator */}
                {!isPaid ? (
                  <Link href="/upgrade" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px', borderRadius: 12,
                        background: C.red, border: C.border, boxShadow: C.shadowSm,
                        cursor: 'pointer',
                      }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: C.white }}>Upgrade to Premium</span>
                      <span style={{ fontSize: 16, color: C.yellow }}>→</span>
                    </motion.div>
                  </Link>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12,
                    background: C.bgCream, border: `2px dashed ${C.black}`,
                  }}>
                    <Star style={{ width: 16, height: 16, color: C.yellow, fill: C.yellow }} />
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.black }}>Premium Member</span>
                  </div>
                )}
              </div>

              {/* ── Auth footer ── */}
              <div style={{ padding: '14px 14px', borderTop: C.border, background: C.yellow, flexShrink: 0 }}>
                {session ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: C.white, border: C.border, borderRadius: 12, boxShadow: C.shadowSm }}>
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="" width={38} height={38} style={{ borderRadius: '50%', border: C.borderThin, display: 'block', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.warm1, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User style={{ width: 17, height: 17, color: C.muted }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.black, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href="/dashboard" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                        <motion.div whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px',
                            background: C.white, border: C.border, borderRadius: 10, cursor: 'pointer', boxShadow: C.shadowSm,
                          }}>
                          <LayoutDashboard style={{ width: 14, height: 14, color: C.blue }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.black }}>Dashboard</span>
                        </motion.div>
                      </Link>
                      <motion.button whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                        onClick={() => { setDrawerOpen(false); signOut(); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '11px 16px', background: C.red, border: C.border,
                          borderRadius: 10, cursor: 'pointer', boxShadow: C.shadowSm,
                        }}>
                        <LogOut style={{ width: 14, height: 14, color: C.white }} />
                        <span style={{ fontSize: 13, fontWeight: 900, color: C.white }}>Out</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button whileHover={{ y: -2, boxShadow: C.shadow }} whileTap={{ y: 0 }} transition={SNAP}
                    onClick={() => { setDrawerOpen(false); signIn('google'); }}
                    style={{
                      width: '100%', background: C.black, color: C.white, border: C.border,
                      borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 900,
                      cursor: 'pointer', boxShadow: C.shadowSm,
                    }}>
                    Sign in with Google
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