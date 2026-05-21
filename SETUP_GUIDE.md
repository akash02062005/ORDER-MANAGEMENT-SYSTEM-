# OrderStream - Complete Setup Guide

This guide walks you through setting up all API keys, services, and configurations needed to run the OrderStream Order Management System with all features working end-to-end.

## Prerequisites

- Java 17+ (for Spring Boot backend)
- Node.js 18+ (for React frontend)
- MongoDB (local or Atlas)
- Git

## Quick Start

```bash
# 1. Start MongoDB (if local)
mongod

# 2. Start Backend
cd backend
# Edit .env with your API keys (see sections below)
mvn spring-boot:run

# 3. Start Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 1. Email Service (OTP & Magic Links)

### Option A: Resend API (Recommended - Free, No SMTP)

1. Go to https://resend.com/signup and create a free account
2. Go to https://resend.com/api-keys
3. Click "Create API Key" and copy the key
4. In `backend/.env`, set:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
5. For testing, the default sender `onboarding@resend.dev` works (sends to your own email only)
6. For production, add your domain at https://resend.com/domains to send to any email

**Free tier**: 100 emails/day, 3000 emails/month

### Option B: Gmail SMTP (Alternative)

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Generate an App Password for "Mail"
5. In `backend/.env`, set:
   ```
   SPRING_MAIL_USERNAME=your-gmail@gmail.com
   SPRING_MAIL_PASSWORD=your-16-char-app-password
   ```

---

## 2. Google OAuth2

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add Authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
5. Add Authorized JavaScript origin: `http://localhost:5173`
6. Copy Client ID and Client Secret
7. In `backend/.env`, set:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   ```

---

## 3. GitHub OAuth2

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set:
   - Application name: `OrderStream`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
4. Click "Register application"
5. Copy Client ID, then generate and copy Client Secret
6. In `backend/.env`, set:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

---

## 4. Stripe (USD / International Payments)

1. Go to https://dashboard.stripe.com/register and create an account
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your **Publishable key** (pk_test_...) and **Secret key** (sk_test_...)
4. In `backend/.env`, set:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

### Stripe Webhook (for payment confirmations):

5. Go to https://dashboard.stripe.com/test/webhooks
6. Click "Add endpoint"
7. Set Endpoint URL: `http://localhost:8080/api/payments/stripe/webhook`
   - For local development, use Stripe CLI: `stripe listen --forward-to localhost:8080/api/payments/stripe/webhook`
8. Select events: `checkout.session.completed`, `checkout.session.expired`
9. Copy the Webhook Signing Secret (whsec_...)
10. In `backend/.env`, set:
    ```
    STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
    ```

---

## 5. Razorpay (INR / India Payments)

1. Go to https://dashboard.razorpay.com/signup and create an account
2. Go to Settings > API Keys
3. Click "Generate Test Key"
4. Copy Key ID (rzp_test_...) and Key Secret
5. In `backend/.env`, set:
   ```
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

### Razorpay Webhook:

6. Go to Settings > Webhooks
7. Click "Add New Webhook"
8. Set Webhook URL: `http://localhost:8080/api/payments/razorpay/webhook`
9. Select events: `payment.captured`, `order.paid`
10. Set and copy the Webhook Secret
11. In `backend/.env`, set:
    ```
    RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
    ```

---

## 6. MongoDB

### Local MongoDB:
```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod
```

The default connection string in `.env` is:
```
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/order_management
```

### MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. In `backend/.env`, set:
   ```
   SPRING_DATA_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/order_management
   ```

---

## 7. Verify Everything Works

After setting up all the keys, restart the backend:

```bash
cd backend
mvn spring-boot:run
```

Then test each feature:

1. **Registration**: Register a new user - you should receive an OTP email
2. **Login**: Login with the registered user
3. **OAuth**: Click "Continue with Google" or "Continue with GitHub"
4. **Magic Link**: Enter email and click "Send magic link" - check your inbox
5. **Dashboard**: Should show real data from your MongoDB
6. **Orders/Products/Customers**: Create, edit, delete items
7. **Billing**: Select a plan and complete payment via Stripe (USD) or Razorpay (INR)
8. **Settings**: Update profile, change password

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not sending | Set `RESEND_API_KEY` in `.env` |
| OAuth error page | Check Google/GitHub Client ID and Secret. Verify redirect URIs match exactly. |
| Payment fails | Ensure Stripe/Razorpay keys are set. Use test mode keys for development. |
| MongoDB connection refused | Make sure MongoDB is running: `mongod` |
| CORS errors | Backend must be on port 8080, frontend on 5173 |
| JWT errors | Ensure `JWT_SECRET` is at least 32 characters |

---

## Default Test Accounts (seeded on first run)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ROLE_ADMIN |
| manager | manager123 | ROLE_MANAGER |
| demo | demo123 | ROLE_CUSTOMER |

## Stripe Test Card Numbers

| Card | Number |
|------|--------|
| Visa | 4242 4242 4242 4242 |
| Mastercard | 5555 5555 5555 4444 |
| Use any future expiry date and any 3-digit CVC |

## Razorpay Test Details

| Method | Details |
|--------|---------|
| Card | 4111 1111 1111 1111 |
| UPI | success@razorpay |
| Net Banking | Select any bank, use OTP: 1234 |
