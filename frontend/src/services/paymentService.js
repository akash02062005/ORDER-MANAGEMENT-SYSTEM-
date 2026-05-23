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

// Optional client-side fallback key for when the user wants a UI-only demo with NO real
// backend order (e.g. plain Razorpay sandbox). Set VITE_RAZORPAY_KEY_ID at build time.
// We deliberately do NOT ship a hardcoded key — opening Razorpay with someone else's
// dead key was the source of the "Oops! Something went wrong" popup.
const RAZORPAY_KEY_FROM_ENV = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

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
 * Translate any backend / network error into something a human can act on.
 */
const explainCheckoutError = (err) => {
  const status = err?.response?.status;
  const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
  if (status === 401) {
    return 'You must be signed in to start a payment. Please log in and try again.';
  }
  if (status === 502) {
    return 'Razorpay is not configured on the server. Ask the admin to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.';
  }
  if (status === 404) {
    return 'Payment endpoint not found — backend is reachable but missing the payments controller.';
  }
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return 'Cannot reach the payment server. Check VITE_API_BASE_URL on the frontend and that the backend is running.';
  }
  if (serverMsg) return `Payment server error: ${serverMsg}`;
  return err?.message || 'Failed to start payment. Please try again.';
};

/**
 * Plan pricing map (in paise for INR). Only used as a safety net to label
 * the Razorpay modal — actual amount always comes from the backend order.
 */
const PLAN_AMOUNTS = {
  PREMIUM: { inr: 249900, usd: 2999 },
  PRO: { inr: 799900, usd: 9999 },
};

/**
 * High-level helper - opens the Razorpay widget end-to-end and resolves
 * once the user completes payment. Verifies the signature server-side.
 *
 * IMPORTANT: We now REQUIRE a backend-created order. Opening Razorpay
 * with a random key and no order_id is what causes the "Oops! Something
 * went wrong" popup. If backend order creation fails we surface the real
 * reason to the caller instead of pretending to work.
 *
 * `onFailure(message)` will be invoked with the actionable error string.
 */
export const openRazorpayCheckout = async ({ plan, user, onSuccess, onFailure }) => {
  let orderId;
  let publicKey;
  let amount;
  let currency = 'INR';

  // 1. Always try to create the order on the backend first.
  try {
    const order = await createRazorpayOrder({ plan });
    orderId = order.orderId;
    publicKey = order.publicKey || RAZORPAY_KEY_FROM_ENV;
    amount = order.amount;
    currency = (order.currency || 'inr').toUpperCase();
  } catch (err) {
    const msg = explainCheckoutError(err);
    console.error('Razorpay order creation failed:', msg, err);
    onFailure?.(msg);
    return { ok: false, error: msg };
  }

  // 2. Sanity-check the response. If the backend forgot to return the key, fall back to env;
  //    but if neither is set, fail loudly — do NOT open Razorpay with garbage.
  if (!orderId) {
    const msg = 'Server did not return a Razorpay order id. Check backend logs.';
    onFailure?.(msg);
    return { ok: false, error: msg };
  }
  if (!publicKey) {
    const msg = 'Razorpay key is missing. Set RAZORPAY_KEY_ID on the backend (preferred) or VITE_RAZORPAY_KEY_ID on the frontend.';
    onFailure?.(msg);
    return { ok: false, error: msg };
  }
  if (!amount) {
    amount = PLAN_AMOUNTS[plan]?.inr || 0;
  }

  // 3. Load Razorpay SDK.
  let Razorpay;
  try {
    Razorpay = await loadRazorpayScript();
  } catch (e) {
    const msg = 'Failed to load Razorpay SDK. Check your internet connection or ad-blocker.';
    onFailure?.(msg);
    return { ok: false, error: msg };
  }
  if (!Razorpay) {
    const msg = 'Razorpay SDK unavailable.';
    onFailure?.(msg);
    return { ok: false, error: msg };
  }

  return new Promise((resolve) => {
    const options = {
      key: publicKey,
      amount,
      currency,
      name: 'OrderStream SaaS',
      description: `${plan} Plan - Monthly Subscription`,
      image: '',
      order_id: orderId, // REQUIRED — never undefined now.
      prefill: {
        name: user?.name || user?.username || '',
        email: user?.email || '',
        contact: '',
      },
      notes: {
        plan,
        userId: user?.id || user?.username || '',
      },
      theme: {
        color: '#6366f1',
        backdrop_color: 'rgba(0,0,0,0.7)',
      },
      handler: async (response) => {
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
            const msg = 'Payment signature verification failed. Money (if any) will be refunded automatically by Razorpay.';
            onFailure?.(msg);
            resolve({ ok: false, error: msg });
          }
        } catch (verifyErr) {
          // Verification HTTP call failed — payment likely succeeded but we couldn't confirm.
          console.error('Verification request failed:', verifyErr);
          const msg = 'Payment captured but server verification failed. Please contact support with the order id: ' + orderId;
          onFailure?.(msg);
          resolve({ ok: false, error: msg });
        }
      },
      modal: {
        ondismiss: () => {
          onFailure?.('Payment cancelled');
          resolve({ ok: false, error: 'cancelled' });
        },
        confirm_close: true,
        escape: true,
        animation: true,
      },
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response) => {
      const reason = response?.error?.description
        || response?.error?.reason
        || 'Payment failed at the gateway';
      console.error('Razorpay payment.failed:', response?.error);
      onFailure?.(reason);
      resolve({ ok: false, error: reason });
    });

    rzp.open();
  });
};
