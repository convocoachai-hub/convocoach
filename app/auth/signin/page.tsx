// app/auth/signin/page.tsx
// CREATE this file — custom beautiful Google sign-in page

'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/upload';

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="orb orb-violet w-[600px] h-[600px] -top-48 -left-48 opacity-60" />
      <div className="orb orb-pink w-[400px] h-[400px] -bottom-32 -right-32 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Card */}
        <div className="glass glow-violet rounded-[var(--radius-xl)] p-8 text-center">

          {/* Logo */}
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Welcome to ConvoCoach
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            Sign in to unlock 3 more free analyses
          </p>

          {/* Free tries indicator */}
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 mb-8 border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Free Analyses</span>
              <span className="text-xs text-[var(--violet-bright)]">After login</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                />
              ))}
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-2">3 free analyses waiting for you</p>
          </div>

          {/* Google sign in button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 hover:bg-gray-50"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px' }}
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <p className="text-[var(--text-muted)] text-xs mt-6">
            By continuing, you agree to our Terms of Service.<br />
            No spam. Ever.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-void)]" />}>
      <SignInContent />
    </Suspense>
  );
}