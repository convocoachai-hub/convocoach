'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, MessageSquare, Twitter, Bug, HelpCircle, CreditCard } from 'lucide-react';

// ─── DESIGN TOKENS — Neo-Brutalism × Memphis ─────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF4D4D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  black:     '#0D0D0D',
  white:     '#FFFFFF',
  bgCream:   '#FFF7E6',
  bgBlue:    '#EAF0FF',
  bgYellow:  '#FFFBEA',
  bgPink:    '#FFF0FA',
  bgGreen:   '#EDFFF5',
  shadow:    '6px 6px 0px #0D0D0D',
  shadowLg:  '8px 8px 0px #0D0D0D',
  shadowSm:  '4px 4px 0px #0D0D0D',
  border:    '3px solid #0D0D0D',
  borderThin:'2px solid #0D0D0D',
};

const SNAP = { duration: 0.18, ease: [0.2, 0, 0.2, 1] } as const;

// ─── GEOMETRIC DECORATORS ─────────────────────────────────────────────────────
const Dot = ({ size = 10, color = C.yellow, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, border: `2px solid ${C.black}`, flexShrink: 0, ...style }} />
);
const Squiggle = ({ color = C.yellow, style = {} }) => (
  <svg width="48" height="16" viewBox="0 0 48 16" fill="none" style={style}>
    <path d="M2 8 C8 2, 14 14, 20 8 S32 2, 38 8 S44 14, 46 8" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);
const Star = ({ size = 20, color = C.yellow, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={style}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);
const Triangle = ({ size = 18, color = C.red, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={style}>
    <polygon points="9,2 17,16 1,16" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

// ─── REVEAL & LABEL ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.22, delay, ease: [0.2, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Label({ text, color = C.yellow }: { text: string; color?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <div style={{ width: 12, height: 12, background: color, border: C.border, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", color: C.black }}>
        {text}
      </span>
    </div>
  );
}

function Badge({ text, color = C.yellow, textColor = C.black, rotate = -2 }: { text: string; color?: string; textColor?: string; rotate?: number }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: textColor,
      border: C.borderThin, borderRadius: 8, padding: '4px 10px',
      fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif", transform: `rotate(${rotate}deg)`,
      boxShadow: C.shadowSm, flexShrink: 0,
    }}>{text}</span>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CHANNELS = [
  { icon: Mail, title: 'Email Support', desc: 'Direct line to our team. We aim to reply within 24 hours.', detail: 'support@convocoach.xyz', href: 'mailto:support@convocoach.xyz', color: C.red, bg: '#FFF0F0' },
  { icon: Twitter, title: 'Twitter / X', desc: 'DMs are open. Tag us in your wildest AI roast results.', detail: '@convocoach', href: 'https://twitter.com/convocoach', color: '#1DA1F2', bg: '#E8F5FE' },
  { icon: MessageSquare, title: 'Feature Requests', desc: 'Want a specific AI persona? Tell us what to build next.', detail: 'feedback@convocoach.xyz', href: 'mailto:feedback@convocoach.xyz', color: C.blue, bg: C.bgBlue },
];

const FAQS = [
  { icon: HelpCircle, q: 'How fast does support respond?', a: 'We are a small team, but we read every single message. Expect a human response within 24 hours on weekdays.' },
  { icon: CreditCard, q: 'How do I manage my subscription?', a: 'You can cancel, upgrade, or manage your billing directly from your Dashboard settings. No need to email us to cancel.' },
  { icon: Bug, q: 'How do I report a bug?', a: 'Use the form below. Please include what device you are using and what you were doing when the glitch happened. We squash bugs fast.' },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) setSent(true);
      else setError(json.error || 'Something went wrong');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '16px', background: C.white,
    border: C.border, borderRadius: 12,
    color: C.black, fontSize: 15, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box',
    boxShadow: C.shadowSm, transition: 'box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 900, color: C.black,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontFamily: "'DM Sans', sans-serif", display: 'block', marginBottom: 8,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; width: 100%; background: ${C.bgCream}; }
        
        .contact-input:focus { box-shadow: ${C.shadowLg} !important; border-color: ${C.blue} !important; }
        
        @media (max-width: 640px) {
          .section-pad { padding: 48px 20px !important; }
          .channel-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      <div style={{ background: C.bgCream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO — yellow background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', background: C.yellow, borderBottom: C.border, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.white} style={{ position: 'absolute', top: '15%', right: '10%' }} />
            <Triangle size={24} color={C.blue} style={{ position: 'absolute', bottom: '20%', left: '5%' }} />
            <Squiggle color={C.red} style={{ position: 'absolute', bottom: '10%', right: '20%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="Contact & Support" color={C.red} />
              <h1 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 9vw, 76px)',
                fontWeight: 900, color: C.black, letterSpacing: '-0.04em',
                lineHeight: 1.15, marginBottom: 24, wordBreak: 'break-word',
              }}>
                Talk to the humans<br />
                <span style={{ background: C.black, color: C.yellow, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  building the AI.
                </span>
              </h1>
              <p style={{ fontSize: 16, color: '#333', lineHeight: 1.7, maxWidth: 560, fontWeight: 600 }}>
                We don’t use chatbots for our customer support. Whether it's a bug report, a feature request, or an account question, you'll get a real answer from the core team.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            CHANNELS — grid
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="Reach Us" color={C.blue} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 40 }}>
                Pick your channel.
              </h2>
            </Reveal>

            <div className="channel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {CHANNELS.map((ch, i) => {
                const Icon = ch.icon;
                return (
                  <Reveal key={ch.title} delay={i * 0.06}>
                    <a href={ch.href} style={{ textDecoration: 'none' }} target={ch.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      <motion.div
                        whileHover={{ y: -4, boxShadow: C.shadowLg }}
                        transition={SNAP}
                        style={{
                          background: ch.bg, border: C.border,
                          borderRadius: 18, padding: '24px', height: '100%',
                          cursor: 'pointer', boxShadow: C.shadow,
                          display: 'flex', flexDirection: 'column',
                          borderTop: `6px solid ${ch.color}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.white, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadowSm, flexShrink: 0 }}>
                            <Icon style={{ width: 22, height: 22, color: ch.color }} />
                          </div>
                          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 900, color: C.black, margin: 0 }}>{ch.title}</h3>
                        </div>
                        <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 16, fontWeight: 500, flex: 1 }}>{ch.desc}</p>
                        <Badge text={ch.detail} color={C.white} textColor={ch.color} rotate={0} />
                      </motion.div>
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FORM & FAQ SPLIT
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
              
              {/* Left — Form */}
              <div>
                <Reveal>
                  <Label text="Direct Message" color={C.green} />
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 32 }}>
                    Drop us a line.
                  </h2>
                </Reveal>
                
                <Reveal delay={0.1}>
                  {sent ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: C.bgGreen, border: C.border, borderRadius: 16, padding: '32px 24px', textAlign: 'center', boxShadow: C.shadow }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
                      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 900, color: C.black, marginBottom: 8 }}>Message received!</h3>
                      <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, fontWeight: 500 }}>Thanks for reaching out. We will get back to you at the email provided within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <label style={labelStyle}>Your Name</label>
                        <input required type="text" name="name" placeholder="John Doe" className="contact-input" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address</label>
                        <input required type="email" name="email" placeholder="john@example.com" className="contact-input" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Subject</label>
                        <input required type="text" name="subject" placeholder="What's this about?" className="contact-input" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Message</label>
                        <textarea required name="message" rows={5} placeholder="Tell us everything..." className="contact-input" style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                      
                      {error && (
                        <div style={{ padding: '12px 16px', background: '#FFF0F0', border: C.borderThin, borderRadius: 10, color: C.red, fontSize: 14, fontWeight: 700 }}>
                          ⚠ {error}
                        </div>
                      )}
                      
                      <motion.button type="submit" disabled={loading}
                        whileHover={!loading ? { y: -3, boxShadow: C.shadowLg } : {}}
                        whileTap={!loading ? { y: 1, boxShadow: '2px 2px 0px #0D0D0D' } : {}}
                        transition={SNAP}
                        style={{
                          background: C.blue, color: C.white, border: C.border, borderRadius: 12,
                          padding: '16px 32px', fontSize: 16, fontWeight: 900, cursor: loading ? 'default' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif", alignSelf: 'flex-start',
                          boxShadow: C.shadow, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                        {loading ? 'Sending...' : 'Send Message →'}
                      </motion.button>
                    </form>
                  )}
                </Reveal>
              </div>

              {/* Right — Support FAQ (AEO Fuel) */}
              <div>
                <Reveal delay={0.2}>
                  <Label text="Fast Answers" color={C.pink} />
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 24 }}>
                    Before you hit send.
                  </h2>
                  <p style={{ fontSize: 15, color: '#555', marginBottom: 32, lineHeight: 1.6, fontWeight: 500 }}>
                    We love hearing from you, but we might have already answered your question. Here are the most common support requests.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {FAQS.map((faq, i) => (
                      <motion.div key={i} whileHover={{ x: 4 }} transition={SNAP}
                        style={{ background: C.bgCream, border: C.borderThin, borderRadius: 14, padding: '20px 24px', boxShadow: C.shadowSm }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <faq.icon style={{ width: 18, height: 18, color: C.pink }} />
                          <h3 style={{ fontSize: 15, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{faq.q}</h3>
                        </div>
                        <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{faq.a}</p>
                      </motion.div>
                    ))}
                  </div>
                </Reveal>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}