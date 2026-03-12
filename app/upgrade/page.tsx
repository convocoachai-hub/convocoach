'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, Lock, Zap, ShieldCheck, Crown } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── 1. GLOBAL PRICING CONFIGURATION ────────────────────────────────────
// We map the ~ $1.99 USD price to localized equivalents to increase conversions.
const PRICES: Record<string, { amount: number; symbol: string; text: string }> = {
  INR: { amount: 99, symbol: '₹', text: '99' },
  USD: { amount: 1.99, symbol: '$', text: '1.99' },
  EUR: { amount: 1.99, symbol: '€', text: '1.99' },
  GBP: { amount: 1.79, symbol: '£', text: '1.79' },
  CAD: { amount: 2.69, symbol: '$', text: '2.69' },
  AUD: { amount: 2.99, symbol: '$', text: '2.99' },
  JPY: { amount: 300, symbol: '¥', text: '300' },
  SGD: { amount: 2.69, symbol: '$', text: '2.69' },
  AED: { amount: 7.30, symbol: 'د.إ', text: '7.30' },
  BRL: { amount: 9.90, symbol: 'R$', text: '9.90' },
  MXN: { amount: 34, symbol: '$', text: '34' }
};

const PERKS = [
  'Unlimited chat analyses',
  'Attraction Probability score',
  'Missed Opportunity detector',
  'Conversation Momentum meter',
  'Reply Energy analysis',
  'Psychological texting insights',
  'All AI practice personalities',
  'Expert difficulty mode'
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State for our checkout
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<string>('USD'); // Default fallback

  // ─── 2. AUTO REGION DETECTION ─────────────────────────────────────────
  // This runs once when the page loads to detect where the user is from.
  useEffect(() => {
    try {
      // Gets a string like "en-US" or "en-IN"
      const locale = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase();
      
      if (locale.includes('IN')) setCurrency('INR');
      else if (locale.includes('GB')) setCurrency('GBP');
      else if (locale.includes('CA')) setCurrency('CAD');
      else if (locale.includes('AU')) setCurrency('AUD');
      else if (locale.includes('JP')) setCurrency('JPY');
      else if (locale.includes('SG')) setCurrency('SGD');
      else if (locale.includes('AE')) setCurrency('AED');
      else if (locale.includes('BR')) setCurrency('BRL');
      else if (locale.includes('MX')) setCurrency('MXN');
      else if (
        locale.includes('FR') || locale.includes('DE') || 
        locale.includes('IT') || locale.includes('ES') || 
        locale.includes('EU')
      ) {
        setCurrency('EUR');
      } else {
        setCurrency('USD');
      }
    } catch (error) {
      console.error("Could not detect region, falling back to USD");
      setCurrency('USD');
    }
  }, []);

  const currentPrice = PRICES[currency] || PRICES['USD'];

  // ─── 3. RAZORPAY PAYMENT LOGIC ────────────────────────────────────────
  const handlePayment = async () => {
    if (!session?.user) {
      signIn('google', { callbackUrl: '/upgrade' });
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      // 2. Create order on your backend
      // We pass the auto-detected currency to your API so Razorpay bills them correctly
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }), 
      });
      const order = await orderRes.json();

      if (!order.orderId) throw new Error('Failed to create order');

      // 3. Open Razorpay checkout modal
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ConvoCoach',
        description: 'Unlimited Conversation Intelligence',
        order_id: order.orderId,
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: { color: '#8b5cf6' }, // Matches our violet-500 accent
        handler: async (response: any) => {
          // 4. Verify payment on success
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            router.push('/payment-success');
          }
        },
      };

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── 4. UI RENDER ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-violet-500/30 overflow-hidden relative pb-32">
      
      {/* Subtle Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-6 pt-24 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 ring-1 ring-violet-500/20 rounded-full px-4 py-1.5 mb-6 text-violet-400">
              <Crown className="w-4 h-4" />
              <span className="text-[13px] font-semibold uppercase tracking-widest">Premium Access</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-white mb-6 tracking-tight leading-tight">
              Upgrade Your<br />Conversation Skills.
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              Analyze conversations, detect attraction signals, and fix your texting mistakes instantly with our full AI suite.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-[900px] mx-auto">
          
          {/* LEFT: VALUE STACK */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Stop guessing. Start knowing.</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5 opacity-50">
                  <span className="text-zinc-400">Dating Coach Session</span>
                  <span className="text-zinc-500 line-through decoration-zinc-600">$50 / hr</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5 opacity-50">
                  <span className="text-zinc-400">Psychology Course</span>
                  <span className="text-zinc-500 line-through decoration-zinc-600">$100</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5 opacity-50">
                  <span className="text-zinc-400">Standard AI Text Analyzers</span>
                  <span className="text-zinc-500 line-through decoration-zinc-600">$20 / month</span>
                </div>
                <div className="flex justify-between items-center py-4 text-lg">
                  <span className="font-medium text-white">ConvoCoach Premium</span>
                  <span className="font-semibold text-violet-400">{currentPrice.symbol}{currentPrice.text} / month</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] ring-1 ring-white/5 rounded-2xl p-6">
              <h3 className="text-[15px] font-medium text-white mb-4">What happens when you upgrade?</h3>
              <p className="text-[14px] text-zinc-400 leading-relaxed">
                You immediately unlock the <strong>Missed Opportunity Detector</strong> and <strong>Attraction Probability Score</strong>. Every screenshot you upload will be analyzed with our most advanced psychological models without any limits.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: MAIN PRICING CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0B0B0B] ring-1 ring-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500" />
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2 text-orange-400">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-[12px] font-bold uppercase tracking-widest">Launch Price</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-semibold text-white tracking-tight">{currentPrice.symbol}{currentPrice.text}</span>
                <span className="text-zinc-500 font-medium">/ month</span>
              </div>
              <p className="text-[14px] text-zinc-400">Cancel anytime. No hidden fees.</p>
            </div>

            <ul className="space-y-4 mb-10">
              {PERKS.map((perk, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-zinc-300">
                  <Check className="w-5 h-5 text-violet-400 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-4 rounded-xl text-[15px] hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                session ? 'Start Premium →' : 'Sign in to Start →'
              )}
            </motion.button>

            {/* Trust Elements */}
            <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/5 pt-6">
              <div className="flex items-center justify-center gap-6 text-[12px] text-zinc-500 font-medium w-full">
                <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Checkout</div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Cancel Anytime</div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}