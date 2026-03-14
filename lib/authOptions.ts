// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/signin' },

  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDatabase();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email || '',           // Added fallback
            name: user.name || 'Unknown',      // Added fallback
            image: user.image || '',           // Added fallback
            subscriptionStatus: 'free',
            freeTriesUsed: 0,
            analysisCount: 0,
            skillPoints: 0,
          } as any); // Added 'as any' to bypass schema strictness
        }
      } catch (e) {
        console.error('[Auth] signIn error:', e);
      }
      return true;
    },

    async jwt({ token, user }) {
      // ✅ ALWAYS recompute isAdmin from env on every token refresh
      // This means it works even on existing sessions and when ADMIN_EMAILS changes
      const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);
      
      const emailToCheck = (token.email ?? user?.email ?? '') as string;
      token.isAdmin = adminEmails.includes(emailToCheck);

      // On first sign-in only: fetch userId and subscription from DB
      if (user?.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email }).lean() as any;
          if (dbUser) {
            token.userId = String(dbUser._id);
            token.subscriptionStatus = dbUser.subscriptionStatus ?? 'free';
            token.freeTriesUsed = dbUser.freeTriesUsed ?? 0;
          }
        } catch (e) {
          console.error('[Auth] jwt db error:', e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).subscriptionStatus = token.subscriptionStatus as string ?? 'free';
        (session.user as any).freeTriesUsed = token.freeTriesUsed as number ?? 0;
        (session.user as any).isAdmin = token.isAdmin as boolean ?? false;
      }
      return session;
    },
  },
};