// app/api/analyze/route.ts
// Deep 10-layer conversation analysis — screenshot (vision) or plain text

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import connectToDatabase from '@/lib/mongodb';
import ChatAnalysis from '@/models/ChatAnalysis';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Context descriptors ───────────────────────────────────────────────────────
const CONTEXT_PROMPTS: Record<string, string> = {
  dating:        'Romantic / dating conversation. Analyze for attraction, flirting quality, romantic momentum, and connection-building.',
  situationship: 'Situationship / undefined talking stage. Analyze for mixed signals, ambiguity, push-pull dynamics, emotional availability.',
  office:        'Professional / workplace. Analyze communication clarity, tone, assertiveness, and professional impact. Ignore romantic signals.',
  friendship:    'Friendship dynamic. Analyze warmth, reciprocity, support quality, and whether the dynamic is balanced or one-sided.',
  networking:    'Professional networking. Analyze value proposition, tone, clarity of ask, and rapport-building quality.',
  family:        'Family conversation. Analyze emotional warmth, care communication, and tension handling.',
  reconnecting:  'Reconnecting after a gap. Analyze re-engagement strategy, natural vs forced warmth, and rapport rebuilding.',
};

// ─── Language hints ────────────────────────────────────────────────────────────
const LANGUAGE_HINTS: Record<string, string> = {
  auto: 'Auto-detect language from the text. Analyze in that language context; return all analysis keys in English.',
  en:   'English.',
  hi:   'Hindi / Hinglish. Indian chats mix Hindi, English, and transliterated Hindi freely — read all of it.',
  es:   'Spanish.',
  fr:   'French.',
  pt:   'Portuguese (Brazilian or European).',
  ar:   'Arabic (RTL). Note cultural communication norms carefully.',
  ja:   'Japanese. Keigo vs casual registers matter — note what register is being used.',
  ko:   'Korean. Honorific levels signal relationship closeness.',
  de:   'German.',
  tr:   'Turkish.',
  ru:   'Russian.',
  it:   'Italian.',
  zh:   'Chinese (Simplified or Traditional).',
  id:   'Indonesian / Bahasa.',
};

// ─── The 10-layer deep analysis prompt ────────────────────────────────────────
function buildAnalysisPrompt(context: string, language: string, roastMode: boolean): string {
  const ctxNote  = CONTEXT_PROMPTS[context] ?? CONTEXT_PROMPTS.dating;
  const langNote = LANGUAGE_HINTS[language] ?? LANGUAGE_HINTS.auto;

  return `You are an expert conversation analyst, dating psychologist, and behavioral communication coach. You are producing a deep, premium-quality report that delivers real psychological insight — not a surface-level summary.

LANGUAGE: ${langNote}
CONTEXT: ${ctxNote}
${roastMode ? 'ROAST MODE: Be brutally honest and darkly funny. Reference specific messages. End with one real tip.' : ''}

READING INSTRUCTIONS (for screenshots):
- Identify which side is the USER (right/blue bubbles) and which is THE OTHER PERSON (left/grey)
- Read every single message carefully. Do not skip any.
- Note reply speed if timestamps are visible
- Note message length ratios — they signal investment

Produce a detailed JSON report covering all 10 layers below.
Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

{
  "extractedText": "<Full verbatim transcript. Format: 'User: message\\nThem: message'. Include ALL messages.>",
  "detectedLanguage": "<ISO 639-1 code>",

  "layer1_diagnosis": {
    "summary": "<3-5 sentence powerful diagnosis: emotional tone, who is investing more, current stage of the interaction (early interest / flirting / neutral / fading / escalating / platonic etc.), and where this conversation is headed if nothing changes.>",
    "stage": "<one of: early_interest | flirting | escalating | neutral | fading | reconnecting | professional | platonic>",
    "verdict": "<one punchy sentence verdict on the overall conversation quality>"
  },

  "layer2_scores": {
    "attraction":           { "score": <0-10 float>, "explanation": "<2-3 sentences explaining WHY this score, citing actual signals>" },
    "interestLevel":        { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "engagement":           { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "curiosity":            { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "confidence":           { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "humor":                { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "emotionalConnection":  { "score": <0-10 float>, "explanation": "<2-3 sentences>" },
    "conversationalMomentum":{ "score": <0-10 float>, "explanation": "<2-3 sentences>" }
  },

  "layer3_psychSignals": [
    {
      "signal": "<signal name, e.g. 'Polite friendliness without warmth'>",
      "detected": <true|false>,
      "evidence": "<exact quote or paraphrase of the moment this appeared>",
      "meaning": "<what this reveals about the other person's mindset, 2 sentences>"
    }
  ],

  "layer4_powerDynamics": {
    "whoHoldsPower": "<'user' | 'them' | 'balanced'>",
    "whoIsChasing": "<'user' | 'them' | 'neither'>",
    "whoIsLeading": "<'user' | 'them' | 'switching'>",
    "analysis": "<3-4 sentences explaining the power balance. Be direct and specific about what's creating the imbalance.>",
    "rebalanceTip": "<One specific thing the user can do to shift the power balance>"
  },

  "layer5_mistakes": [
    {
      "mistake": "<mistake title>",
      "whatHappened": "<what the user actually said/did>",
      "whyItHurts": "<why this weakens attraction or connection, psychologically>",
      "severity": "<'low'|'medium'|'high'>"
    }
  ],

  "layer6_missedOpportunities": [
    {
      "moment": "<what was said at this moment>",
      "whatWasMissed": "<what opportunity was available here>",
      "betterResponse": "<concrete example of a better reply that would have worked>"
    }
  ],

  "layer7_rewrites": {
    "originalMessage": "<the user's most recent or weakest message>",
    "playful":   { "message": "<rewritten playful version>",   "why": "<why this works better>" },
    "confident": { "message": "<rewritten confident version>", "why": "<why this works better>" },
    "curious":   { "message": "<rewritten curious version>",   "why": "<why this works better>" }
  },

  "layer8_attractionSignals": [
    {
      "signal": "<signal name>",
      "type": "<'positive'|'negative'|'neutral'>",
      "evidence": "<where in the conversation this appeared>",
      "interpretation": "<what this signal means for the interaction>"
    }
  ],

  "layer9_nextMoves": {
    "playful":   { "message": "<what to send>", "intent": "<what this achieves>" },
    "curious":   { "message": "<what to send>", "intent": "<what this achieves>" },
    "confident": { "message": "<what to send>", "intent": "<what this achieves>" }
  },

  "layer10_strategy": {
    "primaryAdvice": "<2-3 sentences of the most important strategic advice for THIS specific conversation>",
    "doThis": "<the single most important thing to do next>",
    "avoidThis": "<the single most important thing to avoid>",
    "urgency": "<'push_forward'|'slow_down'|'flirt_more'|'change_topic'|'disengage'|'maintain'>",
    "longTermRead": "<honest assessment of whether this connection has potential and why>"
  },

  "overallScore":         <float 0.0-10.0, weighted average>,
  "interestLevel":        <integer 0-100, how interested THE OTHER PERSON seems>,
  "attractionProbability":<integer 0-100>,
  "conversationMomentum": "<'escalating'|'neutral'|'dying'>",
  "emotionalTone":        "<'positive'|'neutral'|'negative'|'mixed'>",
  "replyEnergyMatch":     "<'matched'|'low'|'high'>",
  "contextFit":           "<brief note on how well this conversation fits the ${context} context>",
  ${roastMode ? '"roastText": "<3-4 sentence roast, specific to what actually happened in this conversation>",' : ''}
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

For tags, choose from: ["one-sided", "balanced", "flirty", "dead-convo", "good-banter", "overthinking", "under-investing", "great-opener", "missed-spark", "needs-confidence", "needs-humor", "needs-questions", "too-eager", "too-passive", "chemistry-detected", "friendship-zone", "professional", "reconnecting-well", "reconnecting-badly", "strong-start", "weak-close"]`;
}

// ─── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData();
    const image     = formData.get('image')     as File   | null;
    const inputText = formData.get('text')      as string | null;
    const context   = (formData.get('context')  as string) || 'dating';
    const language  = (formData.get('language') as string) || 'auto';
    const roastMode = formData.get('roastMode') === 'true';
    const userId    = formData.get('userId')    as string | null;

    if (!image && !inputText?.trim()) {
      return NextResponse.json({ error: 'Provide an image or paste conversation text.' }, { status: 400 });
    }

    const prompt = buildAnalysisPrompt(context, language, roastMode);
    let raw = '';

    // ── Branch: vision vs text ─────────────────────────────────────────────
    if (image) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(image.type)) {
        return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP screenshot.' }, { status: 400 });
      }
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
      }

      const bytes     = await image.arrayBuffer();
      const base64    = Buffer.from(bytes).toString('base64');
      const mediaType = image.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      try {
        const completion = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
              { type: 'text', text: prompt },
            ],
          }],
          temperature: 0.15,
          max_tokens: 3000,
        });
        raw = completion.choices[0]?.message?.content?.trim() ?? '';
      } catch (visionErr: any) {
        if (visionErr?.status === 429 || visionErr?.status === 503) {
          const completion = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
                { type: 'text', text: prompt },
              ],
            }],
            temperature: 0.15,
            max_tokens: 2500,
          });
          raw = completion.choices[0]?.message?.content?.trim() ?? '';
        } else throw visionErr;
      }

    } else {
      // Text-only path — use a text model
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user',   content: `Analyze this conversation:\n\n${inputText!.slice(0, 6000)}` },
        ],
        temperature: 0.15,
        max_tokens: 3000,
      });
      raw = completion.choices[0]?.message?.content?.trim() ?? '';
    }

    // ── Parse JSON ─────────────────────────────────────────────────────────
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('[Analyze] No JSON in response:', raw.slice(0, 400));
      return NextResponse.json({ error: 'Could not parse analysis. Try a clearer screenshot or more complete text.' }, { status: 422 });
    }

    const parsed = JSON.parse(match[0]);

    // ── Clamp helpers ──────────────────────────────────────────────────────
    const clamp  = (v: any, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number(v) || 0));
    const clampScore = (v: any) => clamp(v, 0, 10);
    const sanitizeScoreObj = (obj: any) => obj
      ? { score: clampScore(obj.score), explanation: String(obj.explanation || '') }
      : { score: 5, explanation: '' };

    const result = {
      extractedText:         String(parsed.extractedText || inputText || ''),
      detectedLanguage:      String(parsed.detectedLanguage || language),

      layer1_diagnosis:      {
        summary: String(parsed.layer1_diagnosis?.summary || ''),
        stage:   String(parsed.layer1_diagnosis?.stage   || 'neutral'),
        verdict: String(parsed.layer1_diagnosis?.verdict || ''),
      },

      layer2_scores: {
        attraction:            sanitizeScoreObj(parsed.layer2_scores?.attraction),
        interestLevel:         sanitizeScoreObj(parsed.layer2_scores?.interestLevel),
        engagement:            sanitizeScoreObj(parsed.layer2_scores?.engagement),
        curiosity:             sanitizeScoreObj(parsed.layer2_scores?.curiosity),
        confidence:            sanitizeScoreObj(parsed.layer2_scores?.confidence),
        humor:                 sanitizeScoreObj(parsed.layer2_scores?.humor),
        emotionalConnection:   sanitizeScoreObj(parsed.layer2_scores?.emotionalConnection),
        conversationalMomentum:sanitizeScoreObj(parsed.layer2_scores?.conversationalMomentum),
      },

      layer3_psychSignals:    Array.isArray(parsed.layer3_psychSignals)    ? parsed.layer3_psychSignals.slice(0, 8)    : [],
      layer4_powerDynamics:   parsed.layer4_powerDynamics   || {},
      layer5_mistakes:        Array.isArray(parsed.layer5_mistakes)        ? parsed.layer5_mistakes.slice(0, 6)        : [],
      layer6_missedOpportunities: Array.isArray(parsed.layer6_missedOpportunities) ? parsed.layer6_missedOpportunities.slice(0, 5) : [],
      layer7_rewrites:        parsed.layer7_rewrites        || {},
      layer8_attractionSignals: Array.isArray(parsed.layer8_attractionSignals) ? parsed.layer8_attractionSignals.slice(0, 8) : [],
      layer9_nextMoves:       parsed.layer9_nextMoves       || {},
      layer10_strategy:       parsed.layer10_strategy       || {},

      // Top-level compat fields
      overallScore:           clampScore(parsed.overallScore),
      interestLevel:          clamp(parsed.interestLevel, 0, 100),
      attractionProbability:  clamp(parsed.attractionProbability, 0, 100),
      conversationMomentum:   ['escalating','neutral','dying'].includes(parsed.conversationMomentum) ? parsed.conversationMomentum : 'neutral',
      emotionalTone:          ['positive','neutral','negative','mixed'].includes(parsed.emotionalTone) ? parsed.emotionalTone : 'neutral',
      replyEnergyMatch:       ['matched','low','high'].includes(parsed.replyEnergyMatch) ? parsed.replyEnergyMatch : 'matched',
      contextFit:             String(parsed.contextFit || ''),
      tags:                   Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
      roastMode,
      roastText:              roastMode ? (parsed.roastText || '') : undefined,
      context,
      inputMode:              image ? 'screenshot' : 'text',
    };

    // ── Persist ────────────────────────────────────────────────────────────
    let savedId: string | null = null;
    try {
      await connectToDatabase();
      const doc = await ChatAnalysis.create({
        userId:    userId || undefined,
        conversationScore:     result.overallScore,
        interestLevel:         result.interestLevel,
        attractionProbability: result.attractionProbability,
        conversationMomentum:  result.conversationMomentum,
        emotionalTone:         result.emotionalTone,
        roastMode,
        roastText:             result.roastText,
        extractedText:         result.extractedText,
        fullAnalysis:          result,   // store full deep result
      });
      savedId = doc._id.toString();
    } catch (dbErr) {
      console.error('[Analyze DB] Non-fatal:', dbErr);
    }

    return NextResponse.json({ success: true, id: savedId, ...result });

  } catch (err: any) {
    console.error('[Analyze API] Fatal:', err);
    return NextResponse.json({ error: err?.message || 'Analysis failed.' }, { status: 500 });
  }
}