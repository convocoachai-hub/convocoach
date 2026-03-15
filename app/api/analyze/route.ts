// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import ChatAnalysis from '@/models/ChatAnalysis';
import User from '@/models/User';
import { cookies } from 'next/headers';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ANON_COOKIE = 'cc_a1';
const FREE_MAX    = 5;  // signed-in free users get 5 analyses

// ─── CRITICAL: Sanitize control characters inside JSON strings ────────────────
// The AI sometimes returns JSON with literal newlines/tabs inside string values
// which makes JSON.parse throw "Bad control character in string literal".
// This walks the string char-by-char and escapes control chars only inside strings.
function sanitizeJSON(str: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escaped = true;
      result += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString && code < 0x20) {
      switch (code) {
        case 0x08: result += '\\b'; break;
        case 0x09: result += '\\t'; break;
        case 0x0A: result += '\\n'; break;
        case 0x0C: result += '\\f'; break;
        case 0x0D: result += '\\r'; break;
        default:   result += `\\u${code.toString(16).padStart(4, '0')}`; break;
      }
      continue;
    }

    result += ch;
  }

  return result;
}

// ─── Robust JSON extraction + parse ──────────────────────────────────────────
function parseAIResponse(raw: string): Record<string, unknown> | null {
  // 1. Strip markdown code fences
  let cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  // 2. Extract the outermost JSON object
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  let jsonStr = cleaned.slice(start, end + 1);

  // 3. Sanitize control characters inside string values
  jsonStr = sanitizeJSON(jsonStr);

  try {
    return JSON.parse(jsonStr);
  } catch (firstErr) {
    // 4. Last resort: strip remaining control chars outside strings
    try {
      const fallback = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      return JSON.parse(fallback);
    } catch {
      console.error('[Analyze] JSON parse failed. First error:', firstErr);
      console.error('[Analyze] Raw snippet:', raw.slice(0, 600));
      return null;
    }
  }
}

// ─── Context descriptors ──────────────────────────────────────────────────────
const CONTEXT_PROMPTS: Record<string, string> = {
  dating:        'Romantic / dating conversation. Analyze for attraction, flirting quality, romantic momentum, connection-building, and chemistry.',
  situationship: 'Situationship / undefined talking stage. Analyze mixed signals, ambiguity, push-pull dynamics, emotional availability.',
  office:        'Professional / workplace communication. Analyze clarity, tone, assertiveness, professional impact. Do NOT apply romantic framing.',
  friendship:    'Friendship dynamic. Analyze warmth, reciprocity, support quality, and whether the dynamic is balanced.',
  networking:    'Professional networking. Analyze value proposition, tone, clarity of ask, and rapport-building quality.',
  family:        'Family conversation. Analyze emotional warmth, care communication, and tension handling.',
  reconnecting:  'Reconnecting after a gap. Analyze re-engagement strategy, natural vs forced warmth, and rapport rebuilding.',
};

const LANGUAGE_HINTS: Record<string, string> = {
  auto: 'Auto-detect from the conversation text. Analyze in that language context. Keep all JSON keys in English.',
  en:   'English.',
  hi:   'Hindi / Hinglish — mixed Hindi + English transliteration is normal.',
  es:   'Spanish.',
  fr:   'French.',
  pt:   'Portuguese.',
  ar:   'Arabic.',
  ja:   'Japanese — note keigo vs casual register.',
  ko:   'Korean — note honorific levels.',
  de:   'German.',
  tr:   'Turkish.',
  ru:   'Russian.',
  it:   'Italian.',
  zh:   'Chinese.',
  id:   'Indonesian.',
};

// ─── Speaker side hint ────────────────────────────────────────────────────────
function speakerHint(side: string): string {
  if (side === 'right') return `
SPEAKER IDENTIFICATION — USER CONFIRMED:
The person who wants this analysis has confirmed their messages are on the RIGHT side (blue/filled bubbles).
- RIGHT side bubbles = USER (label as "User" in extractedText)
- LEFT side bubbles  = THE OTHER PERSON (label as "Them" in extractedText)
This is 100% confirmed. Do NOT mix them up.`;

  if (side === 'left') return `
SPEAKER IDENTIFICATION — USER CONFIRMED:
The person who wants this analysis has confirmed their messages are on the LEFT side.
- LEFT side bubbles  = USER (label as "User" in extractedText)
- RIGHT side bubbles = THE OTHER PERSON (label as "Them" in extractedText)
This is 100% confirmed. Do NOT mix them up.`;

  return `
SPEAKER IDENTIFICATION — AUTO-DETECT:
Determine who is the "User" vs "Them" from visual cues:
- Blue/filled/right-aligned bubbles are almost always the User in WhatsApp, iMessage, Instagram, Tinder
- "Delivered" / "Read" / checkmarks appear under the User's own messages
- The other person's name/avatar appears at the top of the screen or next to their bubbles
Make a definitive call and record it in "whoIsUser".`;
}

// ─── Build prompt ─────────────────────────────────────────────────────────────
function buildPrompt(context: string, language: string, roastMode: boolean, userSide: string): string {
  const ctxNote  = CONTEXT_PROMPTS[context]  ?? CONTEXT_PROMPTS.dating;
  const langNote = LANGUAGE_HINTS[language]  ?? LANGUAGE_HINTS.auto;
  const sideNote = speakerHint(userSide);

  return `You are an elite conversation analyst combining expertise in behavioral psychology, attachment theory, and communication dynamics. Produce a premium-quality 10-layer deep analysis that would genuinely change how someone understands their conversations.

CRITICAL QUALITY STANDARDS:
- ALWAYS cite specific messages from the conversation as evidence. Never make claims without pointing to what was actually said.
- Be brutally specific. Instead of "they seem interested", say exactly WHICH messages show interest and WHY those specific words/patterns indicate it.
- Detect subtle signals most people miss: response timing patterns, question types (open vs closed), emotional investment asymmetry, mirroring language, topic escalation/de-escalation.
- For mistakes and missed opportunities, explain the PSYCHOLOGICAL mechanism — WHY does double-texting reduce perceived value? WHY does matching their energy level matter?
- Write rewrites that are genuinely better — not just different. Each rewrite should demonstrate a specific communication principle.
- Strategy advice must be immediately actionable and specific to THIS conversation, not generic dating tips.

LANGUAGE: ${langNote}
CONTEXT: ${ctxNote}
${roastMode ? 'ROAST MODE ENABLED: Be brutally honest and darkly funny. Reference specific real messages by quoting them. Your roast must be so specific that it could only apply to THIS conversation. End with one genuinely actionable tip despite the roast.' : ''}

${sideNote}

━━━ WHAT TO COMPLETELY IGNORE ━━━
Never analyze or quote any of these UI elements — they are noise:
• Timestamps and date separators (e.g. "Today 2:34 PM", "Yesterday", "Monday")
• Read receipts and delivery status ("Delivered", "Seen", "✓✓", "Read")
• App notification banners
• Status bar content (signal bars, battery, clock)
• Profile pictures, avatars, contact names at screen top
• "typing..." or "online" indicators
• Reaction emoji overlays on messages
• Message status icons (single/double ticks)
• App navigation chrome (back buttons, menu icons, etc.)

━━━ EXTRACT ONLY ━━━
• The actual text content from message bubbles
• Who sent each message (User vs Them)

━━━ IMPORTANT JSON RULES ━━━
- Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside JSON.
- All string values must use proper JSON escaping: use \\n for newlines, \\t for tabs, \\" for quotes INSIDE strings.
- Do NOT include literal newline characters inside JSON string values.

{
  "extractedText": "Full transcript. Use literal \\n to separate messages, like: User: hey\\nThem: hi\\nUser: how are you. Include ALL messages in order. Never include timestamps or read receipts.",
  "detectedLanguage": "<ISO 639-1 code, e.g. en>",
  "whoIsUser": "<which side you identified as the user, e.g. 'right-aligned blue bubbles'>",

  "layer1_diagnosis": {
    "summary": "<3-5 sentence diagnosis: emotional tone, who is investing more, current stage, where it's headed if nothing changes.>",
    "stage": "<one of: early_interest | flirting | escalating | neutral | fading | reconnecting | professional | platonic>",
    "verdict": "<one punchy sentence verdict on overall conversation quality>"
  },

  "layer2_scores": {
    "attraction":             { "score": <0-10 float>, "explanation": "<2-3 sentences citing actual signals>" },
    "interestLevel":          { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "engagement":             { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "curiosity":              { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "confidence":             { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "humor":                  { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "emotionalConnection":    { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "conversationalMomentum": { "score": <0-10 float>, "explanation": "<2-3 sentences>" }
  },

  "layer3_psychSignals": [
    {
      "signal": "<signal name, e.g. 'Mirroring', 'Anxiety Texting', 'Breadcrumbing'>",
      "detected": <true|false>,
      "evidence": "<exact quote or close paraphrase from the conversation — NOT a timestamp>",
      "meaning": "<what this reveals about the dynamic, 2 sentences>"
    }
  ],

  "layer4_powerDynamics": {
    "whoHoldsPower": "<'user' | 'them' | 'balanced'>",
    "whoIsChasing": "<'user' | 'them' | 'neither'>",
    "whoIsLeading": "<'user' | 'them' | 'switching'>",
    "analysis": "<3-4 sentences explaining the power balance and what creates it.>",
    "rebalanceTip": "<One specific actionable thing the user can do right now to shift the balance>"
  },

  "layer5_mistakes": [
    {
      "mistake": "<short mistake title>",
      "whatHappened": "<what the user actually said or did, quoted if possible>",
      "whyItHurts": "<psychological reason why this weakens attraction or rapport>",
      "severity": "<'low' | 'medium' | 'high'>"
    }
  ],

  "layer6_missedOpportunities": [
    {
      "moment": "<what was actually said at this moment — must be a real message, not a timestamp>",
      "whatWasMissed": "<the opportunity that existed at that moment>",
      "betterResponse": "<concrete, specific better reply that would have worked>"
    }
  ],

  "layer7_rewrites": {
    "originalMessage": "<the user's most recent OR weakest message — quote it exactly>",
    "playful":   { "message": "<rewritten playful version>",   "why": "<why this version works better, 1-2 sentences>" },
    "confident": { "message": "<rewritten confident version>", "why": "<why this version works better, 1-2 sentences>" },
    "curious":   { "message": "<rewritten curious version>",   "why": "<why this version works better, 1-2 sentences>" }
  },

  "layer8_attractionSignals": [
    {
      "signal": "<signal name>",
      "type": "<'positive' | 'negative' | 'neutral'>",
      "evidence": "<where in the conversation this appeared — a real message snippet>",
      "interpretation": "<what this means for the interaction, 1-2 sentences>"
    }
  ],

  "layer9_nextMoves": {
    "playful":   { "message": "<specific message to send>", "intent": "<what this achieves>" },
    "curious":   { "message": "<specific message to send>", "intent": "<what this achieves>" },
    "confident": { "message": "<specific message to send>", "intent": "<what this achieves>" }
  },

  "layer10_strategy": {
    "primaryAdvice": "<2-3 sentences of the single most important strategic advice for THIS specific conversation>",
    "doThis":        "<single most important action to take next>",
    "avoidThis":     "<single most important thing to avoid doing>",
    "urgency":       "<one of: push_forward | slow_down | flirt_more | change_topic | disengage | maintain>",
    "longTermRead":  "<honest assessment of whether this connection has real potential>"
  },

  "conversationPersonalityType": {
    "type": "<one of: 'Playful' | 'Logical' | 'Flirty' | 'Awkward' | 'Dry' | 'Interview-style'>",
    "description": "<1-2 sentences explaining WHY the user's texting style falls into this category, citing specific examples>",
    "emoji": "<single emoji that represents this style>"
  },

  "redFlags": [
    {
      "pattern": "<name of the red flag pattern, e.g. 'Breadcrumbing', 'Ghosting Signals', 'Love Bombing', 'Mixed Signals', 'Low Investment'>",
      "evidence": "<exact quote or specific behavior from the conversation that shows this pattern>",
      "severity": "<'low' | 'medium' | 'high'>",
      "advice": "<1-2 sentences of actionable advice on how to respond to this red flag>"
    }
  ],

  "overallScore":          <float 0.0–10.0, weighted average of layer2 scores>,
  "interestLevel":         <integer 0–100, how interested THE OTHER PERSON seems>,
  "attractionProbability": <integer 0–100>,
  "conversationMomentum":  "<'escalating' | 'neutral' | 'dying'>",
  "emotionalTone":         "<'positive' | 'neutral' | 'negative' | 'mixed'>",
  "replyEnergyMatch":      "<'matched' | 'low' | 'high'>",
  "contextFit":            "<one sentence: how well the conversation fits the stated context>",
  ${roastMode ? '"roastText": "<3-4 sentence roast that references actual specific messages — be specific, not generic>",' : ''}
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

Tags — pick all that apply from:
["one-sided","balanced","flirty","dead-convo","good-banter","overthinking","under-investing","great-opener","missed-spark","needs-confidence","needs-humor","needs-questions","too-eager","too-passive","chemistry-detected","friendship-zone","professional","reconnecting-well","reconnecting-badly","strong-start","weak-close","left-on-read-risk","good-momentum"]`;
}

// ─── Points formula ───────────────────────────────────────────────────────────
function scoreToPoints(score: number): number {
  if (score >= 9.5) return 30;
  if (score >= 9.0) return 25;
  if (score >= 8.0) return 20;
  if (score >= 7.0) return 14;
  if (score >= 6.0) return 9;
  if (score >= 5.0) return 5;
  if (score >= 4.0) return 3;
  return 1;
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────────
    const { rateLimit, getClientIP } = await import('@/lib/rateLimit');
    const ip = getClientIP(request.headers);
    const rl = rateLimit(ip, { max: 10, windowSec: 60 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.', retryAfter: rl.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }

    // ── Auth & paywall ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const userId  = (session?.user as any)?.id ?? null;

    if (!userId) {
      const cookieStore = await cookies();
      const used = cookieStore.get(ANON_COOKIE)?.value === '1';
      if (used) {
        return NextResponse.json(
          { error: 'paywall', premiumRequired: true, requiresAuth: true, message: 'Create a free account to unlock 5 more analyses and deeper insights.' },
          { status: 402 }
        );
      }
    } else {
      await connectToDatabase();
      const dbUser = await User.findById(userId).lean() as any;
      if (dbUser) {
        const isPaid = dbUser.subscriptionStatus === 'paid' || dbUser.subscriptionStatus === 'lifetime';
        if (!isPaid && (dbUser.freeTriesUsed ?? 0) >= FREE_MAX) {
          return NextResponse.json(
            { error: 'paywall', premiumRequired: true, requiresUpgrade: true, message: `You've used all ${FREE_MAX} free analyses. Upgrade to Premium for unlimited analysis and full conversation intelligence.` },
            { status: 402 }
          );
        }
      }
    }

    // ── Parse form data ─────────────────────────────────────────────────────
    const formData  = await request.formData();
    const image     = formData.get('image')     as File   | null;
    const inputText = formData.get('text')      as string | null;
    const context   = (formData.get('context')  as string) || 'dating';
    const language  = (formData.get('language') as string) || 'auto';
    const roastMode = formData.get('roastMode') === 'true';
    const userSide  = (formData.get('userSide') as string) || 'auto';

    if (!image && !inputText?.trim()) {
      return NextResponse.json({ error: 'Provide an image or paste conversation text.' }, { status: 400 });
    }

    const prompt = buildPrompt(context, language, roastMode, userSide);
    let raw = '';

    // ── AI call: vision (screenshot) vs text ────────────────────────────────
    if (image) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(image.type)) {
        return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP screenshot.' }, { status: 400 });
      }
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
      }

      const bytes  = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mtype  = image.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      try {
        const completion = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mtype};base64,${base64}` } },
              { type: 'text',      text: prompt },
            ],
          }],
          temperature: 0.10,
          max_tokens:  3500,
        });
        raw = completion.choices[0]?.message?.content?.trim() ?? '';
      } catch (visionErr: any) {
        // Fallback to maverick on rate-limit or overload
        if (visionErr?.status === 429 || visionErr?.status === 503) {
          const fallback = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${mtype};base64,${base64}` } },
                { type: 'text',      text: prompt },
              ],
            }],
            temperature: 0.10,
            max_tokens:  3000,
          });
          raw = fallback.choices[0]?.message?.content?.trim() ?? '';
        } else {
          throw visionErr;
        }
      }
    } else {
      // Text-only path
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user',   content: `Analyze this conversation carefully:\n\n${inputText!.slice(0, 8000)}` },
        ],
        temperature: 0.10,
        max_tokens:  3500,
      });
      raw = completion.choices[0]?.message?.content?.trim() ?? '';
    }

    // ── Parse AI response ───────────────────────────────────────────────────
    const parsed = parseAIResponse(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not parse analysis. Try a clearer screenshot or more complete text.' },
        { status: 422 }
      );
    }

    // ── Shape & clamp the result ────────────────────────────────────────────
    const clamp   = (v: any, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number(v) || 0));
    const clampSc = (v: any) => clamp(v, 0, 10);
    const sObj    = (o: any): { score: number; explanation: string } =>
      o ? { score: clampSc(o.score), explanation: String(o.explanation || '') }
        : { score: 5, explanation: '' };

    const result = {
      extractedText:    String(parsed.extractedText || inputText || ''),
      detectedLanguage: String(parsed.detectedLanguage || language),
      whoIsUser:        String(parsed.whoIsUser || ''),

      layer1_diagnosis: {
        summary: String((parsed.layer1_diagnosis as any)?.summary || ''),
        stage:   String((parsed.layer1_diagnosis as any)?.stage   || 'neutral'),
        verdict: String((parsed.layer1_diagnosis as any)?.verdict || ''),
      },

      layer2_scores: {
        attraction:             sObj((parsed.layer2_scores as any)?.attraction),
        interestLevel:          sObj((parsed.layer2_scores as any)?.interestLevel),
        engagement:             sObj((parsed.layer2_scores as any)?.engagement),
        curiosity:              sObj((parsed.layer2_scores as any)?.curiosity),
        confidence:             sObj((parsed.layer2_scores as any)?.confidence),
        humor:                  sObj((parsed.layer2_scores as any)?.humor),
        emotionalConnection:    sObj((parsed.layer2_scores as any)?.emotionalConnection),
        conversationalMomentum: sObj((parsed.layer2_scores as any)?.conversationalMomentum),
      },

      layer3_psychSignals: Array.isArray(parsed.layer3_psychSignals)
        ? (parsed.layer3_psychSignals as any[]).slice(0, 8)
        : [],

      layer4_powerDynamics: (parsed.layer4_powerDynamics as any) || {},

      layer5_mistakes: Array.isArray(parsed.layer5_mistakes)
        ? (parsed.layer5_mistakes as any[]).slice(0, 6)
        : [],

      layer6_missedOpportunities: Array.isArray(parsed.layer6_missedOpportunities)
        ? (parsed.layer6_missedOpportunities as any[]).slice(0, 5)
        : [],

      layer7_rewrites:          (parsed.layer7_rewrites as any)        || {},
      layer8_attractionSignals: Array.isArray(parsed.layer8_attractionSignals)
        ? (parsed.layer8_attractionSignals as any[]).slice(0, 8)
        : [],
      layer9_nextMoves:  (parsed.layer9_nextMoves as any)  || {},
      layer10_strategy:  (parsed.layer10_strategy as any)  || {},

      overallScore:          clampSc(parsed.overallScore),
      interestLevel:         clamp(parsed.interestLevel,         0, 100),
      attractionProbability: clamp(parsed.attractionProbability, 0, 100),

      conversationMomentum: ['escalating', 'neutral', 'dying'].includes(parsed.conversationMomentum as string)
        ? (parsed.conversationMomentum as string)
        : 'neutral',

      emotionalTone: ['positive', 'neutral', 'negative', 'mixed'].includes(parsed.emotionalTone as string)
        ? (parsed.emotionalTone as string)
        : 'neutral',

      replyEnergyMatch: ['matched', 'low', 'high'].includes(parsed.replyEnergyMatch as string)
        ? (parsed.replyEnergyMatch as string)
        : 'matched',

      contextFit: String(parsed.contextFit || ''),
      tags:       Array.isArray(parsed.tags) ? (parsed.tags as string[]).slice(0, 8) : [],
      roastMode,
      roastText:  roastMode ? String(parsed.roastText || '') : undefined,
      context,
      inputMode:  image ? 'screenshot' : 'text',
    };

    // ── Persist & update counters ─────────────────────────────────────────────
    let savedId: string | null = null;

    if (userId) {
      try {
        await connectToDatabase();
        
        // Add "as any" here to stop TS from complaining about "context"
        const doc = await ChatAnalysis.create({
          userId,
          conversationScore:     result.overallScore,
          interestLevel:         result.interestLevel,
          attractionProbability: result.attractionProbability,
          conversationMomentum:  result.conversationMomentum,
          emotionalTone:         result.emotionalTone,
          roastMode,
          roastText:             result.roastText,
          extractedText:         result.extractedText,
          context,
          inputMode:             result.inputMode,
          fullAnalysis:          result, // Added this so it saves your 10-layer data!
        } as any); 

        // Wrap doc in (doc as any) so TS knows _id exists
        savedId = (doc as any)._id.toString();

        const pts = scoreToPoints(result.overallScore);
        await User.findByIdAndUpdate(userId, {
          $inc: {
            freeTriesUsed:  1,
            analysisCount:  1,
            skillPoints:    pts,
          },
        });
      } catch (dbErr) {
        console.error('[Analyze DB] Non-fatal save error:', dbErr);
      }
    }

    // ── Build response; set anon cookie if needed ────────────────────────────
    const response = NextResponse.json({ success: true, id: savedId, ...result });

    if (!userId) {
      response.cookies.set(ANON_COOKIE, '1', {
        maxAge:   60 * 60 * 24 * 90, // 90 days
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
      });
    }

    return response;

  } catch (err: any) {
    console.error('[Analyze API] Fatal:', err);
    return NextResponse.json({ error: err?.message || 'Analysis failed.' }, { status: 500 });
  }
}