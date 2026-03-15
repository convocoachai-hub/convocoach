'use client';

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

const HR = () => <div style={{ height: 1, background: C.warm2, margin: 0 }} />;

const SERVICES = [
  { name: 'API', desc: 'Core application and authentication', status: 'operational', uptime: '99.98%' },
  { name: 'Analysis Engine', desc: 'AI-powered conversation analysis pipeline', status: 'operational', uptime: '99.95%' },
  { name: 'Database', desc: 'MongoDB Atlas cluster', status: 'operational', uptime: '99.99%' },
  { name: 'OCR Service', desc: 'Screenshot text extraction', status: 'operational', uptime: '99.90%' },
  { name: 'Practice Mode', desc: 'AI personality chat system', status: 'operational', uptime: '99.92%' },
  { name: 'Payment System', desc: 'Razorpay payment processing', status: 'operational', uptime: '99.99%' },
];

const statusColors: Record<string, string> = {
  operational: '#5A8A5A',
  degraded: C.amber,
  outage: C.red,
};

export default function StatusPage() {
  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 48 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>System status</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Status
            </h1>

            {/* Overall status banner */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{
                background: allOperational ? 'rgba(90,138,90,0.08)' : `${C.red}08`,
                border: `1.5px solid ${allOperational ? 'rgba(90,138,90,0.25)' : `${C.red}25`}`,
                borderRadius: 18, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 14, maxWidth: 440,
              }}>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 12, height: 12, borderRadius: '50%', background: allOperational ? '#5A8A5A' : C.red, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, color: allOperational ? '#3d6e3d' : C.red }}>
                  {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: 'monospace' }}>
                  Last checked: just now
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <HR />

      <section>
        <div style={WRAP} className="section-pad">
          <div style={{ maxWidth: 640 }}>
            {SERVICES.map((service, i) => {
              const color = statusColors[service.status] || C.muted;
              return (
                <Reveal key={service.name} delay={i * 0.04}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '20px 0', borderBottom: `1px solid ${C.warm2}`, flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{service.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{service.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: 'monospace' }}>{service.uptime}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, color, background: `${color}12`,
                        border: `1px solid ${color}25`, borderRadius: 999, padding: '4px 10px',
                        textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontFamily: 'monospace',
                      }}>{service.status}</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <HR />

      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ maxWidth: 480 }}>
              <span style={{ ...LABEL, color: `${C.cream}35` }}>Incident history</span>
              <p style={{ fontSize: 15, color: `${C.cream}50`, lineHeight: 1.75, marginBottom: 20 }}>
                No incidents reported in the last 90 days. We monitor all systems 24/7 and aim for 99.9% uptime across all services.
              </p>
              <p style={{ fontSize: 13, color: `${C.cream}30`, lineHeight: 1.6 }}>
                If you're experiencing issues that don't appear here, please <a href="/report-bug" style={{ color: C.red, textDecoration: 'underline' }}>report a bug</a> and we'll investigate.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
