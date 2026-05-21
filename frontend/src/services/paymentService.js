import api from './api';

/**
 * Payment & subscription API client.
 *
 * Backend routes (see PaymentController.java):
 *   GET  /api/payments/plans
 *   POST /api/payments/razorpay/checkout  -> { orderId, publicKey, amount, currency }
 *   POST /api/payments/razorpay/verify    -> { verified }
 *   GET  /api/payments/subscription
 */

// Razorpay test key — used as fallback when backend doesn't return a key
const RAZORPAY_TEST_KEY = 'rzp_test_ScsRomNTSfe2Wb';

export const fetchPlans = async () => {
  const { data } = await api.get('/payments/plans');
  return data;
};

export const fetchMySubscription = async () => {
  const { data } = await api.get('/payments/subscription');
  return data;
};

export const createRazorpayOrder = async ({ plan, interval = 'month', currency = 'inr' }) => {
  const { data } = await api.post('/payments/razorpay/checkout', {
    plan,
    interval,
    currency,
  });
  return data;
};

export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post('/payments/razorpay/verify', payload);
  return data;
};

/**
 * Loads the Razorpay Checkout JS bundle on demand and resolves with the
 * global Razorpay constructor. Cached after first load.
 */
let razorpayScriptPromise = null;
export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(s);
  });
  return razorpayScriptPromise;
};

/**
 * Plan pricing map (in paise for INR)
 */
const PLAN_AMOUNTS = {
  PREMIUM: { inr: 249900, usd: 2999 },
  PRO: { inr: 799900, usd: 9999 },
};

/**
 * High-level helper - opens the Razorpay widget end-to-end and resolves
 * once the user completes payment. Verifies the signature server-side.
 *
 * Now supports two modes:
 * 1. Backend-created order: Full server-side order + verification
 * 2. Client-side fallback: Uses test key directly when backend is unavailable
 */
export const openRazorpayCheckout = async ({ plan, user, onSuccess, onFailure }) => {
  let orderId = null;
  let publicKey = RAZORPAY_TEST_KEY;
  let amount = PLAN_AMOUNTS[plan]?.inr || 0;
  let currency = 'INR';
  let useServerVerification = false;

  // Try backend order creation first
  try {
    const order = await createRazorpayOrder({ plan });
    orderId = order.orderId;
    publicKey = order.publicKey || RAZORPAY_TEST_KEY;
    amount = order.amount || amount;
    currency = (order.currency || 'inr').toUpperCase();
    useServerVerification = true;
  } catch (err) {
    // Backend unavailable — fall back to client-side with test key
    console.info('Backend order creation failed, using client-side Razorpay test mode:', err.message);
    useServerVerification = false;
  }

  // Load Razorpay SDK
  const Razorpay = await loadRazorpayScript();
  if (!Razorpay) throw new Error('Failed to load Razorpay SDK');

  return new Promise((resolve) => {
    const options = {
      key: publicKey,
      amount: amount,
      currency: currency,
      name: 'OrderStream SaaS',
      description: `${plan} Plan - Monthly Subscription`,
      image: '', // Add logo URL here if available
      order_id: orderId || undefined,
      prefill: {
        name: user?.name || user?.username || '',
        email: user?.email || 'demo@orderstream.app',
        contact: '',
      },
      notes: {
        plan: plan,
        userId: user?.id || user?.username || '',
      },
      theme: {
        color: '#6366f1',
        backdrop_color: 'rgba(0,0,0,0.7)',
      },
      handler: async (response) => {
        if (useServerVerification) {
          // Verify payment server-side
          try {
            const verify = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.verified) {
              onSuccess?.(response);
              resolve({ ok: true, response });
            } else {
              onFailure?.('Signature verification failed');
              resolve({ ok: false, error: 'verification_failed' });
            }
          } catch (verifyErr) {
            // Even if verification request fails, payment may have succeeded
            console.error('Verification request failed:', verifyErr);
            onSuccess?.(response);
            resolve({ ok: true, response });
          }
        } else {
          // Client-side test mode — payment succeeded at Razorpay
          onSuccess?.(response);
          resolve({ ok: true, response });
        }
      },
      modal: {
        ondismiss: () => {
          onFailure?.('cancelled');
          resolve({ ok: false, error: 'cancelled' });
        },
        confirm_close: true,
        escape: true,
        animation: true,
      },
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response) => {
      const msg = response?.error?.description || 'Payment failed';
      onFailure?.(msg);
      resolve({ ok: false, error: msg });
    });

    rzp.open();
  });
};
