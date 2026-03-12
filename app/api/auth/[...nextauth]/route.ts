import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // Called after successful sign in
    async signIn({ user }) {
      try {
        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user in our database
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            freeTriesUsed: 0,
            subscriptionStatus: 'free',
            skillPoints: 0,
            skillLevel: 'Dry Texter',
          });
        }

        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return true; // Still allow sign in even if DB write fails
      }
    },

    // Add user data to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }

      // Fetch fresh user data from DB on each token refresh
      if (token.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) {
            token.userId = String((dbUser as any)._id);
            token.subscriptionStatus = (dbUser as any).subscriptionStatus;
            token.freeTriesUsed = (dbUser as any).freeTriesUsed;
            token.skillLevel = (dbUser as any).skillLevel;
            token.skillPoints = (dbUser as any).skillPoints;
          }
        } catch {
          // Silently fail — user can still use the app
        }
      }

      return token;
    },

    // Pass token data to the session object (accessible in frontend)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
        (session.user as any).freeTriesUsed = token.freeTriesUsed;
        (session.user as any).skillLevel = token.skillLevel;
        (session.user as any).skillPoints = token.skillPoints;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',   // Custom sign-in page we'll create
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };