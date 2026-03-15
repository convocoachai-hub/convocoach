// app/api/og/route.tsx — Dynamic Open Graph image generation
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'ConvoCoach';
  const subtitle = searchParams.get('subtitle') || 'AI-powered conversation analysis';
  const score = searchParams.get('score') || null;
  const type = searchParams.get('type') || 'default'; // default | result | practice

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #0F0C09 0%, #1a1410 50%, #0F0C09 100%)',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(209,57,32,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,122,16,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#D13920',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#F3EDE2',
                letterSpacing: '-0.02em',
              }}
            >
              ConvoCoach
            </span>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(243,237,226,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            {type === 'result' ? 'Analysis Result' : type === 'practice' ? 'Practice Mode' : 'convocoach.ai'}
          </span>
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          {score && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: '#D13920',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'rgba(243,237,226,0.4)',
                }}
              >
                / 10
              </span>
            </div>
          )}
          <h1
            style={{
              fontSize: score ? 36 : 56,
              fontWeight: 900,
              color: '#F3EDE2',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 700,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(243,237,226,0.45)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 550,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              height: 3,
              flex: 1,
              background: 'linear-gradient(90deg, #D13920, rgba(209,57,32,0.1))',
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(243,237,226,0.3)',
            }}
          >
            AI Conversation Intelligence
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
