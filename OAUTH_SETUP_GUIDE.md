# OAuth Setup Guide — Google & GitHub Login

This guide walks you through setting up **real** Google and GitHub OAuth2 login for OrderStream.

---

## 1. Google OAuth2 Setup

### Step 1: Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Create a new project (or select an existing one)

### Step 2: Enable OAuth Consent Screen
- Navigate to **APIs & Services > OAuth consent screen**
- Choose **External** user type
- Fill in:
  - App name: `OrderStream`
  - User support email: your email
  - Authorized domains: `localhost` (for dev), your production domain later
  - Developer contact: your email
- Click **Save and Continue**
- Under **Scopes**, add: `email`, `profile`, `openid`
- Save and continue through the rest

### Step 3: Create OAuth2 Credentials
- Go to **APIs & Services > Credentials**
- Click **Create Credentials > OAuth Client ID**
- Application type: **Web application**
- Name: `OrderStream Web`
- **Authorized redirect URIs** — add:
  ```
  http://localhost:8080/login/oauth2/code/google
  ```
  (This is the Spring Boot callback URL)
- Click **Create**
- Copy the **Client ID** and **Client Secret**

### Step 4: Configure in your app
Add to your `backend/.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

---

## 2. GitHub OAuth2 Setup

### Step 1: Go to GitHub Developer Settings
- Visit: https://github.com/settings/developers
- Click **New OAuth App**

### Step 2: Register the Application
- Application name: `OrderStream`
- Homepage URL: `http://localhost:5173`
- Authorization callback URL:
  ```
  http://localhost:8080/login/oauth2/code/github
  ```
- Click **Register Application**

### Step 3: Get Credentials
- On the app page, you'll see your **Client ID**
- Click **Generate a new client secret** and copy it immediately

### Step 4: Configure in your app
Add to your `backend/.env` file:
```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

---

## 3. Complete .env File

Here's a complete example `.env` file for the backend:

```env
# Database
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/order_management

# JWT
JWT_SECRET=your-secure-random-jwt-secret-at-least-32-chars
JWT_EXPIRATION=86400000

# Email (Gmail SMTP)
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password

# Google OAuth2
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# GitHub OAuth2
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxx

# App
APP_FRONTEND_URL=http://localhost:5173
APP_MAGIC_LINK_SECRET=a-random-secure-string-for-magic-links
```

---

## 4. How the OAuth Flow Works

1. User clicks **"Continue with Google"** or **"Continue with GitHub"** on the login page
2. Frontend redirects to: `http://localhost:8080/oauth2/authorization/google` (or `github`)
3. Spring Security redirects user to Google/GitHub consent screen
4. User authorizes the app
5. Google/GitHub redirects back to: `http://localhost:8080/login/oauth2/code/google`
6. Spring Boot's `CustomOAuth2UserService` processes the user data and creates/updates the user in MongoDB
7. `OAuth2SuccessHandler` generates a JWT token and redirects to: `http://localhost:5173/login?token=JWT_TOKEN`
8. The React frontend picks up the token from the URL, stores it, fetches the user profile, and redirects to the dashboard

---

## 5. Production Deployment Notes

When deploying to production:

1. Update `APP_FRONTEND_URL` to your production frontend URL
2. Update OAuth redirect URIs in Google Cloud Console and GitHub to use your production backend URL
3. Use a strong, random `JWT_SECRET` (at least 256 bits)
4. Enable HTTPS on both frontend and backend
5. Update CORS origins in `SecurityConfig.java` to include your production domain
6. Use a proper Gmail App Password (not your account password) for SMTP

---

## 6. Testing the Flow

1. Start MongoDB: `mongod`
2. Start the backend: `cd backend && mvn spring-boot:run`
3. Start the frontend: `cd frontend && npm run dev`
4. Visit `http://localhost:5173/login`
5. Click "Continue with Google" or "Continue with GitHub"
6. You should be redirected to the real Google/GitHub consent screen
7. After authorizing, you'll be redirected back and logged in automatically

---

## Troubleshooting

**"redirect_uri_mismatch" error:**
- Ensure the redirect URI in Google/GitHub matches exactly: `http://localhost:8080/login/oauth2/code/google` (or `github`)

**"Access denied" or 401 after redirect:**
- Check that your Client ID and Secret are correct in the `.env` file
- Restart the Spring Boot server after changing `.env`

**User not created in MongoDB:**
- Check the Spring Boot logs for errors in `CustomOAuth2UserService`
- Ensure MongoDB is running and accessible

**GitHub email is null:**
- Some GitHub users have private emails. The app handles this by generating an email from their username (e.g., `username@github.com`)
