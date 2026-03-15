// app/api/rizz-feedback/summary/route.ts — AI perception summary
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import RizzFeedback from '@/models/RizzFeedback';
import User from '@/models/User';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const userId = String(dbUser._id);

    const feedback = await RizzFeedback.find({ targetUserId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean() as any[];

    if (feedback.length < 3) {
      return NextResponse.json({
        success: true,
        hasEnoughData: false,
        summary: null,
      });
    }

    const messages = feedback
      .filter(f => f.message?.trim())
      .map(f => `- "${f.message.trim()}"`)
      .slice(0, 20)
      .join('\n');

    const avgFlirting   = (feedback.reduce((a: number, f: any) => a + f.flirtingScore, 0) / feedback.length).toFixed(1);
    const avgHumor      = (feedback.reduce((a: number, f: any) => a + f.humorScore, 0) / feedback.length).toFixed(1);
    const avgConfidence = (feedback.reduce((a: number, f: any) => a + f.confidenceScore, 0) / feedback.length).toFixed(1);
    const avgDryText    = (feedback.reduce((a: number, f: any) => a + f.dryTextScore, 0) / feedback.length).toFixed(1);
    const avgOverall    = (feedback.reduce((a: number, f: any) => a + f.overallScore, 0) / feedback.length).toFixed(1);

    const prompt = `You are analyzing anonymous social feedback about someone's texting personality.

Trait scores (1–10 scale, ${feedback.length} responses):
- Flirting ability: ${avgFlirting}/10
- Humor: ${avgHumor}/10
- Confidence: ${avgConfidence}/10
- Dry texting risk: ${avgDryText}/10 (higher = more dry)
- Overall Rizz: ${avgOverall}/10

${messages ? `Anonymous written feedback from raters:\n${messages}\n` : 'No written feedback provided.'}

Based on this data, provide a concise social perception analysis. Respond in this exact JSON format:
{
  "strength": "One sentence about their biggest strength as a texter",
  "weakness": "One sentence about their main weakness",
  "tip": "One actionable specific tip to improve their texting"
}

Be direct, analytical, and professional. No filler phrases. No "Great job!" energy. Think like a data-driven social coach.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ success: true, hasEnoughData: true, summary: null });
    }

    const summary = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      hasEnoughData: true,
      totalResponses: feedback.length,
      summary: {
        strength: summary.strength || '',
        weakness: summary.weakness || '',
        tip: summary.tip || '',
      },
    });
  } catch (error) {
    console.error('Rizz summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
