'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { C, EO, WRAP, LABEL, LABEL_DIM } from '@/lib/design';
import { Mail, MessageSquare, Twitter } from 'lucide-react';

function Reveal({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ ...EO, delay }}>
      {children}
    </motion.div>
  );
}

function I({ children, c = C.muted }: { children: React.ReactNode; c?: string }) {
  return <em style={{ fontStyle: 'italic', color: c, fontFamily: 'Georgia, serif' }}>{children}</em>;
}

const HR = () => <div style={{ height: 1, background: C.warm2, margin: 0 }} />;

const CHANNELS = [
  { icon: Mail, title: 'Email us', desc: 'For support, feedback, or partnership inquiries.', detail: 'support@convocoach.ai', href: 'mailto:support@convocoach.ai', color: C.red },
  { icon: Twitter, title: 'Twitter / X', desc: 'Follow us for updates, tips, and behind-the-scenes.', detail: '@convocoach', href: 'https://twitter.com/convocoach', color: '#1DA1F2' },
  { icon: MessageSquare, title: 'Feature requests', desc: 'Have an idea? Tell us what you want built next.', detail: 'feedback@convocoach.ai', href: 'mailto:feedback@convocoach.ai', color: C.amber },
];

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
    width: '100%', padding: '14px 16px', background: `${C.cream}06`,
    border: `1px solid rgba(243,237,226,0.1)`, borderRadius: 12,
    color: C.cream, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 800, color: `${C.cream}35`,
    textTransform: 'uppercase' as const, letterSpacing: '0.1em',
    fontFamily: 'monospace', display: 'block', marginBottom: 8,
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ Hero ═══ */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Contact</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
            }}>
              Let's talk.<br /><I c={C.red}>We actually read these.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Whether it's a bug report, a feature idea, a partnership pitch, or just a "hey, this is cool" — we want to hear from you. We respond to every message within 24 hours.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Contact Channels ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL}>Reach us</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 40,
            }}>
              Pick your channel.
            </h2>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {CHANNELS.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <Reveal key={ch.title} delay={i * 0.06}>
                  <a href={ch.href} style={{ textDecoration: 'none' }} target={ch.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(15,12,9,0.1)' }}
                      style={{
                        background: C.cream, border: `1.5px solid ${C.warm2}`,
                        borderRadius: 20, padding: '26px 24px', height: '100%',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${ch.color}50, transparent)`, borderRadius: '20px 20px 0 0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ch.color}10`, border: `1px solid ${ch.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 18, height: 18, color: ch.color }} />
                        </div>
                        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 800, color: C.ink, margin: 0 }}>{ch.title}</h3>
                      </div>
                      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>{ch.desc}</p>
                      <span style={{ fontSize: 13, fontWeight: 700, color: ch.color, fontFamily: 'monospace' }}>{ch.detail}</span>
                    </motion.div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ Contact Form — ink bg ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>Send a message</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 40,
            }}>
              Or write to us<br /><I c={`${C.cream}35`}>right here.</I>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div style={{ maxWidth: 520 }}>
              {sent ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(90,138,90,0.08)', border: '1px solid rgba(90,138,90,0.2)',
                    borderRadius: 18, padding: '32px 28px', textAlign: 'center',
                  }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>✅</span>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800, color: C.cream, marginBottom: 8 }}>Message sent!</h3>
                  <p style={{ fontSize: 14, color: `${C.cream}50`, lineHeight: 1.6 }}>We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Your name *</label>
                    <input required type="text" name="name" placeholder="Jane Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input required type="email" name="email" placeholder="jane@example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject *</label>
                    <input required type="text" name="subject" placeholder="What's this about?" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea required name="message" rows={5} placeholder="What's on your mind?"
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  {error && <p style={{ fontSize: 13, color: C.red, margin: 0 }}>{error}</p>}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.03, boxShadow: `0 12px 48px ${C.red}30` }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: C.red, color: '#fff', border: 'none', borderRadius: 14,
                      padding: '16px 32px', fontSize: 15, fontWeight: 900, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque', sans-serif", alignSelf: 'flex-start',
                      opacity: loading ? 0.7 : 1,
                    }}>
                    {loading ? 'Sending...' : 'Send Message →'}
                  </motion.button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

