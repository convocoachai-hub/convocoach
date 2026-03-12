// app/api/coach/route.ts
// AI Live Message Coach — paste what you're about to send, get instant feedback

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const COACH_SYSTEM = `You are an elite conversation coach with deep expertise in psychology, dating dynamics, and communication.

The user is about to send a message. They will give you:
1. The recent conversation history (context)
2. The message they are about to send

Your job: give them a SHORT, sharp, honest verdict — like a trusted friend who's brutally honest.

RESPONSE FORMAT (return only valid JSON, no markdown):
{
  "verdict": "<one of: 'send_it' | 'needs_work' | 'dont_send'>",
  "verdictLabel": "<short punchy label like 'Good energy' | 'Too eager' | 'Way too long' | 'Missing spark' | 'Solid' | 'Too needy' | 'Kills momentum'>",
  "analysis": "<2-3 sentences MAX. Direct, specific, honest. What's wrong or right about this message.>",
  "improvedVersion": "<a better version of the message. Keep it natural, not try-hard. If original is fine, still provide a slightly sharpened version.>",
  "whyItsBetter": "<1-2 sentences explaining what makes the improved version work better>",
  "quickTips": ["<tip 1, max 8 words>", "<tip 2, max 8 words>"],
  "energyLevel": "<'too_high' | 'just_right' | 'too_low'>",
  "flags": ["<flag if applicable, e.g.: 'too_long' | 'needy' | 'no_hook' | 'dry' | 'generic' | 'good_humor' | 'good_question' | 'builds_tension' | 'kills_tension' | 'tryhard' | 'confident' | 'vulnerable' | 'strong_close'>"]
}

Be direct. No sugarcoating. If their message is terrible, say so clearly and fix it.
If it's genuinely good, say so and still refine it slightly.
Keep improved version short — 1-2 sentences max unless context demands more.`;

export async function POST(request: NextRequest) {
  try {
    const { draftMessage, conversationHistory, context } = await request.json();

    if (!draftMessage?.trim()) {
      return NextResponse.json({ error: 'No message to coach.' }, { status: 400 });
    }

    const userPrompt = `CONVERSATION CONTEXT:
${conversationHistory ? conversationHistory.slice(-2000) : 'No context provided.'}

MESSAGE ABOUT TO SEND:
"${draftMessage.trim()}"

Context type: ${context || 'dating'}

Give me your honest verdict.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: COACH_SYSTEM },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw     = completion.choices[0]?.message?.content?.trim() ?? '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      return NextResponse.json({ error: 'Could not parse coaching response.' }, { status: 422 });
    }

    const result = JSON.parse(match[0]);
    return NextResponse.json({ success: true, ...result });

  } catch (err: any) {
    console.error('[Coach API]:', err);
    return NextResponse.json({ error: err?.message || 'Coach failed.' }, { status: 500 });
  }
}