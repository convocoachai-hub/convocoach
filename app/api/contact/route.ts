import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const { rateLimit, getClientIP } = await import('@/lib/rateLimit');
    const rl = rateLimit(getClientIP(req.headers), { max: 5, windowSec: 60 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many submissions. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, subject, message } = body;
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    const msg = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ success: true, id: msg._id });
  } catch (error: any) {
    console.error('Contact message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
