# Deploying OrderStream to Render

This guide walks you through hosting both the Spring Boot backend and the React (Vite) frontend on **Render**, with **MongoDB Atlas** as the database (Render doesn't host MongoDB itself).

Architecture on Render:

```
[ Vite static site ]  --HTTPS-->  [ Spring Boot web service ]  --SRV-->  [ MongoDB Atlas ]
       (frontend)                        (backend)                            (DB)
```

---

## Prerequisites

1. A **GitHub** (or GitLab/Bitbucket) account — push this repo there.
2. A **Render** account: https://dashboard.render.com (sign up free).
3. A **MongoDB Atlas** account: https://www.mongodb.com/cloud/atlas (free M0 cluster is fine).
4. API keys ready: `RESEND_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

---

## Step 1 — Create a MongoDB Atlas cluster

1. Sign in to Atlas, create a free **M0** cluster (any region close to your Render region; Render free tier defaults to Oregon).
2. **Database Access** -> add a database user (username + strong password). Save these.
3. **Network Access** -> **Add IP Address** -> **Allow access from anywhere** (`0.0.0.0/0`). Required because Render's outbound IPs change on the free plan.
4. **Connect -> Drivers** -> copy the SRV connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/order_management?retryWrites=true&w=majority
   ```
   Replace `<user>`, `<password>`, and add `/order_management` before the `?` so Spring uses the right DB name.

Keep this URI handy — it becomes `SPRING_DATA_MONGODB_URI` on Render.

---

## Step 2 — Tiny code change so CORS works in production

Right now `backend/src/main/java/com/project/security/SecurityConfig.java` hardcodes the allowed origins to `localhost`. Make it read from an environment variable so Render's frontend URL is accepted.

Change this block:

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"));
```

to:

```java
String frontend = System.getenv().getOrDefault("APP_FRONTEND_URL", "http://localhost:5173");
configuration.setAllowedOrigins(Arrays.asList(
    frontend,
    "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"));
```

Commit the change. (Local dev still works because the localhost origins remain in the list.)

---

## Step 3 — Push the repo to GitHub

```bash
cd "D:/projects akash_s/order-management-system"
git add .
git commit -m "Add Render deployment config (Dockerfile, render.yaml, _redirects)"
git push origin main
```

The repo already has a sensible `.gitignore` (excludes `.env`, `node_modules`, `target/`), so secrets won't be pushed.

---

## Step 4 — Deploy the backend (Spring Boot) as a Web Service

You have two options. **Option A (Blueprint)** is the quickest because the included `render.yaml` defines both services.

### Option A — One-click Blueprint (recommended)

1. In Render dashboard: **New +** -> **Blueprint**.
2. Connect your GitHub repo. Render detects `render.yaml`.
3. Click **Apply**. Render creates both `orderstream-backend` and `orderstream-frontend`.
4. Fill in the environment variables marked `sync: false` (see Step 6 below) and click **Save, Rerun**.

### Option B — Manual setup (if you prefer the UI)

1. **New +** -> **Web Service** -> connect your repo.
2. Settings:
   - **Name**: `orderstream-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (uses the `Dockerfile` we added).
   - **Plan**: Free.
   - **Health Check Path**: `/` (or any 200 endpoint you have).
3. Add the environment variables from Step 6.
4. **Create Web Service**. First build takes ~5–8 minutes (Maven downloads dependencies).

Once it's live you'll get a URL like `https://orderstream-backend.onrender.com`. Test it:
```
https://orderstream-backend.onrender.com/api/...   # any public endpoint
```

---

## Step 5 — Deploy the frontend (Vite) as a Static Site

### Option A (Blueprint) — already created in Step 4.

### Option B — Manual

1. **New +** -> **Static Site** -> same repo.
2. Settings:
   - **Name**: `orderstream-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
3. Under **Redirects/Rewrites** add:
   - Source: `/*`  Destination: `/index.html`  Action: `Rewrite`
   (Or rely on the `public/_redirects` file we added.)
4. Add env vars:
   - `VITE_API_BASE_URL` = `https://orderstream-backend.onrender.com/api`
   - `VITE_WS_URL` = `wss://orderstream-backend.onrender.com/ws`
5. **Create Static Site**.

After it's live you'll get a URL like `https://orderstream-frontend.onrender.com`.

---

## Step 6 — Environment variables reference

Paste these on the **backend** service (Settings -> Environment):

| Key | Value |
| --- | --- |
| `SPRING_DATA_MONGODB_URI` | Your Atlas SRV string from Step 1 |
| `JWT_SECRET` | Long random string, 32+ chars (Render can generate) |
| `JWT_EXPIRATION` | `86400000` |
| `RESEND_API_KEY` | From https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | `OrderStream <onboarding@resend.dev>` |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | (Optional) |
| `APP_MAGIC_LINK_SECRET` | Long random string |
| `APP_FRONTEND_URL` | `https://orderstream-frontend.onrender.com` |

Paste these on the **frontend** static site:

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://orderstream-backend.onrender.com/api` |
| `VITE_WS_URL` | `wss://orderstream-backend.onrender.com/ws` |

After setting `APP_FRONTEND_URL` on the backend, click **Manual Deploy -> Deploy latest commit** so CORS picks it up.

---

## Step 7 — Wire the two together (post-deploy checklist)

1. Open the frontend URL, open browser DevTools -> Network tab.
2. Try a login. The request should go to `https://orderstream-backend.onrender.com/api/...` and return 200.
3. If you see a **CORS error**, double-check `APP_FRONTEND_URL` on the backend matches the static site URL exactly (no trailing slash) and that you redeployed.
4. If you see **502 / cold start** delays — that's the Render free tier spinning the backend back up after 15 min of inactivity. First request after idle takes ~30s. Upgrade to a paid plan to remove this, or use a free uptime pinger.

---

## Step 8 — Razorpay webhooks (optional)

If you're using Razorpay webhooks, in the Razorpay dashboard set the webhook URL to:
```
https://orderstream-backend.onrender.com/api/payments/webhook
```
(adjust the path to whatever your controller exposes) and copy the secret into `RAZORPAY_WEBHOOK_SECRET`.

---

## Files added for this deployment

- `backend/Dockerfile` — multi-stage Maven build -> slim JRE runtime.
- `backend/.dockerignore` — keeps the image small.
- `frontend/public/_redirects` — makes React Router work on Render Static Sites.
- `render.yaml` — Blueprint that defines both services in one file.

---

## Common gotchas

| Symptom | Fix |
| --- | --- |
| Build fails: "no JAR found" | Ensure `pom.xml` is at `backend/pom.xml` and the Root Directory is `backend`. |
| `MongoSocketOpenException` | Atlas Network Access doesn't include `0.0.0.0/0`, or username/password wrong in the SRV URI. |
| CORS blocked in browser | `APP_FRONTEND_URL` mismatch — must equal the static site origin exactly. Redeploy backend after changing. |
| Frontend loads but API calls 404 | `VITE_API_BASE_URL` missing the `/api` suffix, or the variable wasn't set **before** the build (Vite bakes env vars in at build time — re-trigger a deploy after changing). |
| WebSocket fails | Use `wss://` (not `ws://`) when the backend is on HTTPS. |
| Backend keeps sleeping | Render free plan sleeps after 15 min idle. Upgrade plan or use https://uptimerobot.com to ping `/`. |
| Out-of-memory on free tier | Free instance has 512 MB. Add `JAVA_OPTS=-Xmx400m` env var, or upgrade the plan. |
