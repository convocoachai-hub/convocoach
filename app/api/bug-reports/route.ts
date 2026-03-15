import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BugReport from '@/models/BugReport';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const { rateLimit, getClientIP } = await import('@/lib/rateLimit');
    const rl = rateLimit(getClientIP(req.headers), { max: 5, windowSec: 60 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many submissions. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, page, description, screenshotUrl } = body;

    if (!email || !page || !description) {
      return NextResponse.json({ error: 'Email, page, and description are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    const report = await BugReport.create({
      email: email.trim(),
      page: page.trim(),
      description: description.trim(),
      screenshotUrl: screenshotUrl?.trim() || undefined,
    });

    return NextResponse.json({ success: true, id: report._id });
  } catch (error: any) {
    console.error('Bug report error:', error);
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
  }
}
