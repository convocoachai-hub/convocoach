// app/examples/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// ─── EXAMPLE DATA ────────────────────────────────────────────────────────────
interface ExamplePage {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  emoji: string;
  color: string;
  heroSubtitle: string;
  sections: Array<{
    heading: string;
    body: string;
    example?: { user: string; them: string; analysis: string };
  }>;
  cta: string;
  relatedSlugs: string[];
}

const EXAMPLES: Record<string, ExamplePage> = {
  'flirty-texting': {
    title: 'Flirty Texting Examples',
    description: 'Learn how to flirt over text with real conversation examples analyzed by AI.',
    metaTitle: 'Flirty Texting Examples — ConvoCoach AI Analysis',
    metaDescription: 'Master the art of flirty texting with AI-analyzed examples. Learn what works, what doesn\'t, and how to build attraction through text conversations.',
    emoji: '😏',
    color: '#A0426E',
    heroSubtitle: 'Real flirty conversations analyzed by AI — learn what creates attraction over text.',
    sections: [
      {
        heading: 'What Makes Texting Flirty?',
        body: 'Flirty texting is about creating playful tension. It uses teasing, callback humor, open loops, and subtle sexual undertones without being explicit. The best flirty texters make the other person smile, think about them, and anticipate the next message.',
        example: {
          user: 'You know what, I was going to invite you but then I remembered you have terrible taste in coffee ☕',
          them: 'Excuse me?? My taste is impeccable. You clearly need someone to educate you 😤',
          analysis: 'This opener creates playful tension through a false takeaway and light teasing, which immediately makes the other person engage defensively (in a fun way). The "terrible taste" callback creates an inside joke foundation.',
        },
      },
      {
        heading: 'The Push-Pull Dynamic',
        body: 'The most effective flirty texts use push-pull — giving attention then playfully withdrawing it. This creates emotional spikes that build attraction much faster than just being nice or agreeable.',
        example: {
          user: 'Okay I\'ll admit, your playlist was actually pretty good. Don\'t let it go to your head though 😌',
          them: 'Too late, it already has 💁‍♀️ what else do you secretly like about me?',
          analysis: 'The compliment-then-withdrawal pattern (push-pull) creates a playful dynamic. By saying "don\'t let it go to your head," you show confidence and keep them working for your full approval — which is highly attractive.',
        },
      },
      {
        heading: 'Using Humor to Build Connection',
        body: 'Humor is the #1 tool in flirty texting. Self-deprecating humor shows confidence, callback humor creates intimacy, and absurd hypotheticals create fun shared moments.',
      },
      {
        heading: 'Common Flirting Mistakes',
        body: 'Over-complimenting too early, being too available, double-texting when they haven\'t replied, and making every message explicitly romantic. Subtlety is what makes flirting fun — the best conversations are 80% normal and 20% electric.',
      },
    ],
    cta: 'Upload your flirty conversation to get a detailed AI analysis with attraction scores, power dynamics, and specific improvement tips.',
    relatedSlugs: ['high-attraction', 'dry-texting', 'ghosting'],
  },

  'dry-texting': {
    title: 'Dry Texting: Signs & How to Fix It',
    description: 'Recognize dry texting patterns and learn AI-backed strategies to revive dying conversations.',
    metaTitle: 'Dry Texting: What It Means & How to Fix It — ConvoCoach',
    metaDescription: 'Is your conversation dying? Learn the signs of dry texting, why it happens, and proven AI-analyzed strategies to turn boring conversations into engaging ones.',
    emoji: '🏜️',
    color: '#B87A10',
    heroSubtitle: 'Why conversations go flat — and the exact texting patterns that fix it.',
    sections: [
      {
        heading: 'What Is Dry Texting?',
        body: 'Dry texting is when someone consistently sends short, low-effort responses that don\'t move the conversation forward. Typical signs include: one-word answers ("k", "yeah", "lol"), no questions asked back, delayed responses with zero enthusiasm, and emoji-only replies.',
        example: {
          user: 'Hey! How was your weekend? Did you end up going to that concert?',
          them: 'Yeah it was good',
          analysis: 'This is textbook dry texting — a closed response with no reciprocal question or emotional engagement. The lack of detail signals low investment. ConvoCoach would flag this as "dying momentum" with an interest score below 30%.',
        },
      },
      {
        heading: 'Why People Dry Text',
        body: 'Dry texting isn\'t always about disinterest. It can signal: they\'re genuinely busy, they don\'t know what to say, the conversation topic isn\'t engaging them, they\'re testing to see if you\'ll chase, or yes — they\'re losing interest. Context matters enormously.',
      },
      {
        heading: 'How to Save a Dry Conversation',
        body: 'Stop asking yes/no questions. Use "would you rather" scenarios, share something unexpected about your day, reference something they\'re passionate about, or use a callback to a previous conversation. If nothing works after 2-3 attempts, pull back — sometimes silence creates more curiosity than another message.',
        example: {
          user: 'Okay so random — I just saw someone walking a ferret on a leash downtown and I immediately thought of you. Don\'t ask me why 😂',
          them: 'WAIT WHAT 😂😂 why does that remind you of me?? I need answers',
          analysis: 'This message breaks the dry texting cycle by creating an attention spike. The randomness, humor, and open loop ("don\'t ask me why") make it impossible to respond with just "lol." This is what ConvoCoach calls a "momentum reversal" moment.',
        },
      },
      {
        heading: 'When to Walk Away',
        body: 'If someone consistently dry texts after 3+ genuine attempts to create engaging conversation, it\'s a signal to pull back. Your time and emotional energy are valuable — ConvoCoach helps you identify this pattern early so you can focus on connections that are actually going somewhere.',
      },
    ],
    cta: 'Paste your dry conversation into ConvoCoach to find out if there\'s hope — or if it\'s time to move on.',
    relatedSlugs: ['ghosting', 'flirty-texting', 'high-attraction'],
  },

  'ghosting': {
    title: 'Ghosting: Signs, Psychology & Recovery',
    description: 'Understand ghosting patterns with AI analysis — detect early signs and learn how to respond.',
    metaTitle: 'Ghosting: Signs, Psychology & How to Respond — ConvoCoach',
    metaDescription: 'Am I being ghosted? Understand the psychology of ghosting, spot early warning signs with AI conversation analysis, and learn the best response strategies.',
    emoji: '👻',
    color: '#8A8074',
    heroSubtitle: 'The psychology behind ghosting — and what your conversations reveal.',
    sections: [
      {
        heading: 'What Is Ghosting?',
        body: 'Ghosting is when someone suddenly stops all communication without explanation. Unlike slow-fading (gradually reducing contact), ghosting is an abrupt cut — mid-conversation, mid-plans, mid-connection. It\'s one of the most psychologically jarring dating experiences.',
      },
      {
        heading: 'Early Warning Signs (That AI Can Detect)',
        body: 'Before someone ghosts, their texting patterns usually change: reply times increase dramatically, message length drops, they stop asking questions, initiations become one-sided, and emotional depth disappears. ConvoCoach\'s AI can detect these shifts in your conversations.',
        example: {
          user: 'So are we still on for Saturday? I was thinking that new Thai place 🍜',
          them: 'hmm maybe, I\'ll let you know',
          analysis: 'Red flag detected: "maybe" + "I\'ll let you know" is a non-commitment pattern. ConvoCoach would flag "ghosting risk" and show declining interest scores. The lack of counter-suggestion indicates disengagement.',
        },
      },
      {
        heading: 'How to Respond to Ghosting',
        body: 'The healthiest response is one calm, direct message — then move on. Something like "Hey, seems like you\'re not interested anymore and that\'s okay. Take care." This shows emotional maturity and self-respect. Never send multiple messages, plead, or get angry.',
      },
      {
        heading: 'Preventing the Ghost',
        body: 'While you can\'t control someone else\'s behavior, you can reduce ghosting risk by: maintaining balanced investment (don\'t over-text), creating genuine emotional connection early, avoiding interview-style conversations, and paying attention to reciprocity levels.',
      },
    ],
    cta: 'Upload your conversation to see if you\'re being ghosted — ConvoCoach detects early warning signs before they become obvious.',
    relatedSlugs: ['dry-texting', 'flirty-texting', 'high-attraction'],
  },

  'high-attraction': {
    title: 'High Attraction Conversations: What They Look Like',
    description: 'Real examples of high-attraction text conversations with AI scoring and analysis.',
    metaTitle: 'High Attraction Texting: Examples & Patterns — ConvoCoach',
    metaDescription: 'What does a high-attraction conversation actually look like? See real AI-scored examples of texts that create chemistry, build tension, and maintain interest.',
    emoji: '🔥',
    color: '#D13920',
    heroSubtitle: 'What a 9/10 conversation actually looks like — analyzed by AI.',
    sections: [
      {
        heading: 'Anatomy of a High-Attraction Conversation',
        body: 'High-attraction conversations share common patterns: balanced initiation, playful teasing, vulnerability mixed with humor, future planning, inside jokes, and escalating emotional depth. The key is that BOTH people are investing equally.',
        example: {
          user: 'I can\'t believe you\'ve never tried mango sticky rice. This is genuinely concerning 😂',
          them: 'Okay okay you win, take me somewhere that has it and I\'ll try it. But if I don\'t like it you owe me coffee for life ☕',
          analysis: 'ConvoCoach would score this 8.5+/10. Both sides are playful, the conversation naturally creates a date opportunity, there\'s callback humor, and the "coffee for life" is a future-projection signal indicating high interest.',
        },
      },
      {
        heading: 'The Mirror Effect',
        body: 'In high-attraction conversations, people naturally mirror each other\'s texting style — similar message lengths, matching emoji usage, response times, and energy levels. When ConvoCoach detects mirroring, it\'s one of the strongest positive psychological signals.',
      },
      {
        heading: 'Escalation Without Desperation',
        body: 'The best conversations escalate gradually. They move from surface-level topics to shared values, from jokes to genuine vulnerability, from texting to making plans. Each step feels natural, not forced.',
        example: {
          user: 'Okay serious question — what\'s the most spontaneous thing you\'ve ever done?',
          them: 'Bought a one-way ticket to Lisbon with like 2 days notice 😅 I still can\'t believe I did that. What about you?',
          analysis: 'This shows healthy escalation — the question invites vulnerability without being too intimate too soon. Their enthusiastic response plus "what about you?" shows genuine interest and reciprocity. ConvoCoach would flag positive signals: vulnerability sharing, reciprocal questioning, and emotional depth.',
        },
      },
      {
        heading: 'What High Scores Actually Mean',
        body: 'A ConvoCoach score of 8+ means: strong mutual interest detected, healthy power balance, good emotional depth, no major red flags, and high momentum. Scores of 9+ are rare and usually indicate genuine chemistry that extends beyond texting.',
      },
    ],
    cta: 'Find out how your conversations score — upload a chat to get your AI-powered attraction analysis.',
    relatedSlugs: ['flirty-texting', 'dry-texting', 'ghosting'],
  },
};

// ─── STATIC PARAMS ────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(EXAMPLES).map(slug => ({ slug }));
}

// ─── METADATA ─────────────────────────────────────────────────────────────────
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = EXAMPLES[params.slug];
  if (!page) return { title: 'Example Not Found — ConvoCoach' };
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: 'article',
    },
  };
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
};

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function ExamplePage({ params }: { params: { slug: string } }) {
  const page = EXAMPLES[params.slug];
  if (!page) notFound();

  const relatedPages = page.relatedSlugs
    .map(slug => ({ slug, page: EXAMPLES[slug] }))
    .filter(r => r.page);

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 28px) 100px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: C.muted, marginBottom: 32 }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/examples" style={{ color: C.muted, textDecoration: 'none' }}>Examples</Link>
          <span>›</span>
          <span style={{ color: C.ink }}>{page.title}</span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>{page.emoji}</span>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 16 }}>
            {page.title}
          </h1>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.75, maxWidth: 560 }}>
            {page.heroSubtitle}
          </p>
        </div>

        {/* Sections */}
        {page.sections.map((section, i) => (
          <section key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em', marginBottom: 14 }}>
              {section.heading}
            </h2>
            <p style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.85, marginBottom: section.example ? 20 : 0 }}>
              {section.body}
            </p>

            {section.example && (
              <div style={{ background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: 16, padding: '20px 22px', marginTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {/* User bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: C.ink, color: C.cream, borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '80%', fontSize: 14.5, lineHeight: 1.65 }}>
                      {section.example.user}
                    </div>
                  </div>
                  {/* Their bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ background: C.cream, border: `1px solid ${C.warm2}`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', maxWidth: '80%', fontSize: 14.5, lineHeight: 1.65, color: C.ink }}>
                      {section.example.them}
                    </div>
                  </div>
                </div>
                {/* Analysis */}
                <div style={{ borderTop: `1px solid ${C.warm2}`, paddingTop: 14 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${page.color}12`, border: `1px solid ${page.color}25`, borderRadius: 8, padding: '4px 10px', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: page.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Analysis</span>
                  </div>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>
                    {section.example.analysis}
                  </p>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* CTA */}
        <div style={{ background: C.ink, borderRadius: 22, padding: 'clamp(28px, 5vw, 44px)', marginBottom: 48, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${page.color}18, transparent 65%)`, pointerEvents: 'none' }} />
          <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 900, color: C.cream, letterSpacing: '-0.02em', marginBottom: 12, position: 'relative' }}>
            Try It Yourself
          </h3>
          <p style={{ fontSize: 15, color: `${C.cream}70`, lineHeight: 1.75, marginBottom: 24, maxWidth: 480, position: 'relative' }}>
            {page.cta}
          </p>
          <Link href="/upload" style={{ textDecoration: 'none' }}>
            <button style={{ background: C.cream, color: C.ink, border: 'none', borderRadius: 13, padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", position: 'relative' }}>
              Analyze My Chat →
            </button>
          </Link>
        </div>

        {/* Related */}
        {relatedPages.length > 0 && (
          <div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 16 }}>
              Related Examples
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {relatedPages.map(r => (
                <Link key={r.slug} href={`/examples/${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: 14, padding: '18px 20px', transition: 'border-color 0.2s' }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{r.page.emoji}</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 4 }}>
                      {r.page.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                      {r.page.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: page.metaTitle,
            description: page.metaDescription,
            author: { '@type': 'Organization', name: 'ConvoCoach' },
            publisher: { '@type': 'Organization', name: 'ConvoCoach' },
          }),
        }}
      />
    </div>
  );
}
