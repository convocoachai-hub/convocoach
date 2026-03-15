'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { C, EO, WRAP, LABEL } from '@/lib/design';

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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', background: `${C.cream}06`,
  border: `1px solid rgba(243,237,226,0.1)`, borderRadius: 12,
  color: C.cream, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, color: `${C.cream}35`,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontFamily: 'monospace', display: 'block', marginBottom: 8,
};

export default function FeatureRequestsPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      idea: (form.elements.namedItem('idea') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/feature-requests', {
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

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>💡 Support</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Request a feature.
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Have an idea for something we should build? We read every request and prioritize based on community demand.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ maxWidth: 520 }}>
              {sent ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(90,138,90,0.08)', border: '1px solid rgba(90,138,90,0.2)', borderRadius: 18, padding: '32px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>💡</span>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800, color: C.cream, marginBottom: 8 }}>Feature request submitted!</h3>
                  <p style={{ fontSize: 14, color: `${C.cream}50`, lineHeight: 1.6 }}>We'll review your idea and add it to our roadmap if it aligns with our vision. Thanks for the input!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Your email *</label>
                    <input required type="email" name="email" placeholder="you@example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Feature idea (one line) *</label>
                    <input required type="text" name="idea" placeholder="e.g. Group chat analysis, Tinder opener generator" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Describe the feature *</label>
                    <textarea required name="description" rows={5} placeholder="What should it do? Why would it be useful?"
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  {error && <p style={{ fontSize: 13, color: C.red, margin: 0 }}>{error}</p>}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.03, boxShadow: `0 12px 48px ${C.red}30` }}
                    whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 14, padding: '16px 32px', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Submitting...' : 'Submit Feature Request →'}
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
