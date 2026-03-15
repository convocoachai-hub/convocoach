import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── Pricing per currency (amounts in smallest unit) ──────────────────────────
const PRICING: Record<string, { monthly: number; yearly: number; lifetime: number }> = {
  INR: { monthly: 9900,    yearly: 100000,   lifetime: 399900    },
  USD: { monthly: 199,     yearly: 1999,     lifetime: 6999      },
  EUR: { monthly: 189,     yearly: 1899,     lifetime: 6499      },
  GBP: { monthly: 159,     yearly: 1599,     lifetime: 5499      },
  CAD: { monthly: 269,     yearly: 2699,     lifetime: 9499      },
  AUD: { monthly: 299,     yearly: 2999,     lifetime: 10999     },
  JPY: { monthly: 299,     yearly: 2999,     lifetime: 10999     }, // ¥299
  BRL: { monthly: 999,     yearly: 9999,     lifetime: 34999     },
  MXN: { monthly: 3499,    yearly: 34999,    lifetime: 119900    },
  TRY: { monthly: 6499,    yearly: 64999,    lifetime: 229900    },
  AED: { monthly: 729,     yearly: 7299,     lifetime: 25999     },
};

const VALID_PLANS = ['monthly', 'yearly', 'lifetime'] as const;
type PlanType = typeof VALID_PLANS[number];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in to upgrade' }, { status: 401 });
    }

    const body = await req.json();
    const currency = (body.currency || 'USD').toUpperCase();
    const planType: PlanType = VALID_PLANS.includes(body.planType) ? body.planType : 'monthly';

    const pricing = PRICING[currency] || PRICING['USD'];
    const amount = pricing[planType];

    const planLabels: Record<PlanType, string> = {
      monthly: 'ConvoCoach Premium — Monthly',
      yearly: 'ConvoCoach Premium — Yearly',
      lifetime: 'ConvoCoach Lifetime + Support Pack',
    };

    const order = await razorpay.orders.create({
      amount,
      currency: currency === 'JPY' ? 'JPY' : currency, // JPY already in whole units
      receipt: `cc_${planType}_${Date.now()}`,
      notes: {
        planType,
        email: session.user.email,
        name: session.user.name || '',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planType,
      description: planLabels[planType],
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
