import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FeatureRequest from '@/models/FeatureRequest';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const { rateLimit, getClientIP } = await import('@/lib/rateLimit');
    const rl = rateLimit(getClientIP(req.headers), { max: 5, windowSec: 60 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many submissions. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, idea, description } = body;

    if (!email || !idea || !description) {
      return NextResponse.json({ error: 'Email, idea, and description are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    const request = await FeatureRequest.create({
      email: email.trim(),
      idea: idea.trim(),
      description: description.trim(),
    });

    return NextResponse.json({ success: true, id: request._id });
  } catch (error: any) {
    console.error('Feature request error:', error);
    return NextResponse.json({ error: 'Failed to submit feature request' }, { status: 500 });
  }
}
