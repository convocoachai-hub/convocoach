import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import BugReport from '@/models/BugReport';
import FeatureRequest from '@/models/FeatureRequest';
import ContactMessage from '@/models/ContactMessage';

const ADMIN_EMAILS = [process.env.ADMIN_EMAIL || ''];

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'contact';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  await connectToDatabase();

  let Model: any;
  if (type === 'bugs') Model = BugReport;
  else if (type === 'features') Model = FeatureRequest;
  else Model = ContactMessage;

  const total = await Model.countDocuments();
  const items = await Model.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { id, type, action } = body;

  if (!id || !type || !action) {
    return NextResponse.json({ error: 'Missing id, type, or action' }, { status: 400 });
  }

  await connectToDatabase();

  let Model: any;
  if (type === 'bugs') Model = BugReport;
  else if (type === 'features') Model = FeatureRequest;
  else Model = ContactMessage;

  if (action === 'resolve') {
    await Model.findByIdAndUpdate(id, { status: 'resolved' });
    return NextResponse.json({ success: true, message: 'Marked as resolved' });
  }

  if (action === 'delete') {
    await Model.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Deleted' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
