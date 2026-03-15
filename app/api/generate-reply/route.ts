// app/api/generate-reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // ── Auth check — premium only ────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: 'auth_required', message: 'Sign in to generate smart replies.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const dbUser = await User.findById(userId).lean() as any;
    const isPaid = dbUser?.subscriptionStatus === 'paid' || dbUser?.subscriptionStatus === 'lifetime';

    if (!isPaid) {
      return NextResponse.json(
        { error: 'premium_required', message: 'Smart reply generation is a Premium feature.' },
        { status: 402 }
      );
    }

    // ── Parse request ────────────────────────────────────────────────────
    const { conversationText, context, analysisScore } = await request.json();

    if (!conversationText) {
      return NextResponse.json({ error: 'No conversation text provided.' }, { status: 400 });
    }

    const prompt = `You are a conversational coach. Based on this ${context || 'dating'} conversation, generate 3 smart reply suggestions.

CONVERSATION:
${conversationText}

${analysisScore ? `The conversation scored ${analysisScore}/10.` : ''}

Generate exactly 3 reply options with different tones. Return ONLY valid JSON:

{
  "replies": [
    {
      "tone": "playful",
      "message": "<a playful, light-hearted response that keeps things fun>",
      "why": "<1 sentence explaining why this works>"
    },
    {
      "tone": "confident",
      "message": "<a self-assured response that shows value>",
      "why": "<1 sentence explaining why this works>"
    },
    {
      "tone": "curious",
      "message": "<a genuinely curious response that deepens connection>",
      "why": "<1 sentence explaining why this works>"
    }
  ]
}

Rules:
- Each reply must be 1-3 sentences max
- Be specific to THIS conversation, not generic
- Match the language/style of the conversation
- Be natural and human-sounding`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw);

    return NextResponse.json({ success: true, ...parsed });
  } catch (e: any) {
    console.error('[generate-reply] Error:', e);
    return NextResponse.json(
      { error: 'Failed to generate replies', message: e.message },
      { status: 500 }
    );
  }
}
