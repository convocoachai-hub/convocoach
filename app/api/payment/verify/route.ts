import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = await request.json();

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectToDatabase();

    // Set subscription status and expiry based on plan type
    let subscriptionStatus: 'paid' | 'lifetime' = 'paid';
    let subscriptionExpiry: Date;

    switch (planType) {
      case 'lifetime':
        subscriptionStatus = 'lifetime';
        subscriptionExpiry = new Date('2099-12-31'); // effectively never expires
        break;
      case 'yearly':
        subscriptionStatus = 'paid';
        subscriptionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        subscriptionStatus = 'paid';
        subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        break;
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        subscriptionStatus,
        subscriptionExpiry,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        planType: planType || 'monthly',
      }
    );

    return NextResponse.json({ success: true, planType, subscriptionStatus });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}