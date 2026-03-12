// lib/adminAuth.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

export interface AdminSession {
  email: string;
  name: string;
  userId: string;
}

export async function requireAdmin(): Promise<
  { session: AdminSession; error?: never } |
  { error: NextResponse; session?: never }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }

  return {
    session: {
      email: session.user.email,
      name: session.user.name ?? '',
      userId: (session.user as any).id ?? '',
    },
  };
}