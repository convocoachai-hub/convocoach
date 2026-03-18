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
  let cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  let jsonStr = cleaned.slice(start, end + 1);
  jsonStr = sanitizeJSON(jsonStr);

  try {
    return JSON.parse(jsonStr);
  } catch (firstErr) {
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
- RIGHT side bubbles = USER (label as "User" in extractedText)
- LEFT side bubbles  = THE OTHER PERSON (label as "Them" in extractedText)
This is 100% confirmed. Do NOT mix them up.`;

  if (side === 'left') return `
SPEAKER IDENTIFICATION — USER CONFIRMED:
- LEFT side bubbles  = USER (label as "User" in extractedText)
- RIGHT side bubbles = THE OTHER PERSON (label as "Them" in extractedText)
This is 100% confirmed. Do NOT mix them up.`;

  return `
SPEAKER IDENTIFICATION — AUTO-DETECT:
Determine who is the "User" vs "Them" from visual cues:
- Blue/filled/right-aligned bubbles are almost always the User.
Make a definitive call and record it in "whoIsUser".`;
}

// ─── Build prompt ─────────────────────────────────────────────────────────────
function buildPrompt(context: string, language: string, roastMode: boolean, userSide: string, imageCount: number): string {
  const ctxNote  = CONTEXT_PROMPTS[context]  ?? CONTEXT_PROMPTS.dating;
  const langNote = LANGUAGE_HINTS[language]  ?? LANGUAGE_HINTS.auto;
  const sideNote = speakerHint(userSide);

  const multiImageRules = imageCount > 1 ? `
━━━ MULTIPLE SCREENSHOTS DETECTED (${imageCount}) ━━━
You have been provided with ${imageCount} screenshots representing ONE continuous conversation. 
1. Read them in chronological order.
2. OVERLAPS: Screenshots often overlap. If you see the exact same messages at the bottom of one image and the top of the next, DO NOT duplicate them.
3. Treat the entire sequence as a single unified timeline.
` : '';

  return `You are an elite conversation analyst combining expertise in behavioral psychology, attachment theory, and communication dynamics. Produce a premium-quality 10-layer deep analysis.

CRITICAL QUALITY STANDARDS:
- ALWAYS cite specific messages from the conversation as evidence.
- Detect subtle signals most people miss: response timing, question types, emotional investment asymmetry, topic escalation.
- For mistakes/missed opportunities, explain the PSYCHOLOGICAL mechanism.
- Strategy advice must be immediately actionable for THIS specific conversation.

LANGUAGE: ${langNote}
CONTEXT: ${ctxNote}
${roastMode ? 'ROAST MODE ENABLED: Be brutally honest and darkly funny. Reference specific real messages by quoting them. Your roast must be so specific that it could only apply to THIS conversation.' : ''}

${sideNote}
${multiImageRules}

━━━ WHAT TO COMPLETELY IGNORE ━━━
Never analyze or extract timestamps, battery icons, network bars, read receipts, or typing indicators.

━━━ EXTRACT ONLY ━━━
• The actual text content from message bubbles (combine them seamlessly across screenshots if there are overlaps).
• Who sent each message (User vs Them).

━━━ IMPORTANT JSON RULES ━━━
- Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside JSON.
- All string values must use proper JSON escaping: use \\n for newlines, \\t for tabs, \\" for quotes INSIDE strings.

{
  "extractedText": "Full transcript. Use literal \\n to separate messages, like: User: hey\\nThem: hi. Include ALL messages in order. Never include timestamps.",
  "detectedLanguage": "<ISO code>",
  "whoIsUser": "<which side you identified as the user>",

  "layer1_diagnosis": {
    "summary": "<3-5 sentence diagnosis: emotional tone, who is investing more, current stage>",
    "stage": "<one of: early_interest | flirting | escalating | neutral | fading | reconnecting | professional | platonic>",
    "verdict": "<one punchy sentence verdict>"
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
      "signal": "<signal name, e.g. 'Mirroring', 'Breadcrumbing'>",
      "detected": <true|false>,
      "evidence": "<exact quote from the conversation>",
      "meaning": "<what this reveals about the dynamic, 2 sentences>"
    }
  ],

  "layer4_powerDynamics": {
    "whoHoldsPower": "<'user' | 'them' | 'balanced'>",
    "whoIsChasing": "<'user' | 'them' | 'neither'>",
    "whoIsLeading": "<'user' | 'them' | 'switching'>",
    "analysis": "<3-4 sentences explaining the power balance.>",
    "rebalanceTip": "<One specific actionable thing the user can do right now to shift the balance>"
  },

  "layer5_mistakes": [
    {
      "mistake": "<short mistake title>",
      "whatHappened": "<what the user actually said or did>",
      "whyItHurts": "<psychological reason why this weakens attraction or rapport>",
      "severity": "<'low' | 'medium' | 'high'>"
    }
  ],

  "layer6_missedOpportunities": [
    {
      "moment": "<what was actually said at this moment>",
      "whatWasMissed": "<the opportunity that existed at that moment>",
      "betterResponse": "<concrete, specific better reply>"
    }
  ],

  "layer7_rewrites": {
    "originalMessage": "<the user's most recent OR weakest message>",
    "playful":   { "message": "<rewritten playful version>",   "why": "<why this works better>" },
    "confident": { "message": "<rewritten confident version>", "why": "<why this works better>" },
    "curious":   { "message": "<rewritten curious version>",   "why": "<why this works better>" }
  },

  "layer8_attractionSignals": [
    {
      "signal": "<signal name>",
      "type": "<'positive' | 'negative' | 'neutral'>",
      "evidence": "<quote from chat>",
      "interpretation": "<what this means>"
    }
  ],

  "layer9_nextMoves": {
    "playful":   { "message": "<specific message to send>", "intent": "<what this achieves>" },
    "curious":   { "message": "<specific message to send>", "intent": "<what this achieves>" },
    "confident": { "message": "<specific message to send>", "intent": "<what this achieves>" }
  },

  "layer10_strategy": {
    "primaryAdvice": "<2-3 sentences of strategic advice>",
    "doThis":        "<action to take next>",
    "avoidThis":     "<thing to avoid>",
    "urgency":       "<one of: push_forward | slow_down | flirt_more | change_topic | disengage | maintain>",
    "longTermRead":  "<honest assessment of potential>"
  },

  "conversationPersonalityType": {
    "type": "<one of: 'Playful' | 'Logical' | 'Flirty' | 'Awkward' | 'Dry' | 'Interview-style'>",
    "description": "<1-2 sentences explaining WHY>",
    "emoji": "<single emoji>"
  },

  "redFlags": [
    {
      "pattern": "<name of red flag>",
      "evidence": "<exact quote>",
      "severity": "<'low' | 'medium' | 'high'>",
      "advice": "<actionable advice>"
    }
  ],

  "overallScore":          <float 0.0–10.0>,
  "interestLevel":         <integer 0–100>,
  "attractionProbability": <integer 0–100>,
  "conversationMomentum":  "<'escalating' | 'neutral' | 'dying'>",
  "emotionalTone":         "<'positive' | 'neutral' | 'negative' | 'mixed'>",
  "replyEnergyMatch":      "<'matched' | 'low' | 'high'>",
  "contextFit":            "<one sentence: how well the conversation fits the stated context>",
  ${roastMode ? '"roastText": "<3-4 sentence roast that references actual specific messages>",' : ''}
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}`;
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
    // GRAB ALL IMAGES (Up to 4)
    const images    = formData.getAll('image')  as File[];
    const inputText = formData.get('text')      as string | null;
    const context   = (formData.get('context')  as string) || 'dating';
    const language  = (formData.get('language') as string) || 'auto';
    const roastMode = formData.get('roastMode') === 'true';
    const userSide  = (formData.get('userSide') as string) || 'auto';

    if (images.length === 0 && !inputText?.trim()) {
      return NextResponse.json({ error: 'Provide at least one image or paste conversation text.' }, { status: 400 });
    }

    const prompt = buildPrompt(context, language, roastMode, userSide, images.length);
    let raw = '';

    // ── AI call: vision (multiple screenshots) vs text ──────────────────────
    if (images.length > 0) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      
      const contentBlocks: any[] = [];
      
      for (const img of images) {
        if (!allowed.includes(img.type)) {
          return NextResponse.json({ error: 'Upload JPG, PNG, or WebP screenshots only.' }, { status: 400 });
        }
        if (img.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'One of the images is too large. Max 10MB per image.' }, { status: 400 });
        }

        const bytes  = await img.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const mtype  = img.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
        
        // Add each image to the AI prompt block
        contentBlocks.push({
          type: 'image_url',
          image_url: { url: `data:${mtype};base64,${base64}` }
        });
      }

      // Add the final text prompt at the end
      contentBlocks.push({ type: 'text', text: prompt });

      try {
        // Updated to Groq's absolute best Vision model for superior intelligence and tracking across images
        const completion = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: contentBlocks }],
          temperature: 0.10,
          max_tokens:  4500, // Increased to support larger 4-image responses
        });
        raw = completion.choices[0]?.message?.content?.trim() ?? '';
      } catch (visionErr: any) {
        // Fallback to the 11b vision model on rate-limit or overload
        if (visionErr?.status === 429 || visionErr?.status === 503) {
          const fallback = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            messages: [{ role: 'user', content: contentBlocks }],
            temperature: 0.10,
            max_tokens:  4000,
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
      inputMode:  images.length > 0 ? 'screenshot' : 'text',
    };

    // ── Persist & update counters ─────────────────────────────────────────────
    let savedId: string | null = null;

    if (userId) {
      try {
        await connectToDatabase();
        
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
          fullAnalysis:          result, 
        } as any); 

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

    const response = NextResponse.json({ success: true, id: savedId, ...result });

    if (!userId) {
      response.cookies.set(ANON_COOKIE, '1', {
        maxAge:   60 * 60 * 24 * 90, 
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