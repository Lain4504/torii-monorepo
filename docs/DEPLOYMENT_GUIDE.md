# 🚀 Deployment Guide - Torii Nihongo

This guide provides step-by-step instructions for deploying the Torii Nihongo ecosystem, including the Backend Microservices, AI Voice Agent, Web Frontends, and Mobile Application.

---

## 2.2 Deployment

### 2.2.1 Infrastructure & Environment
**Step 1: Start Infrastructure**
Use Docker Compose to launch the core services (Database, NATS, Redis, LiveKit):
```bash
docker compose up -d
```

**Step 2: Database Synchronization**
Apply the Prisma schema to your PostgreSQL instance:
```bash
cd apps/server
npx prisma generate
npx prisma db push
```

**Step 3: Environment Variables**
Ensure you have the following `.env` files configured:
- `torii-monorepo/.env` (For Backend & Infrastructure)
- `torii-monorepo/apps/voice-agent/.env` (Specifically for AI Voice Agent)
- `torri-mobile/.env` (For Flutter app API endpoints)

---

### 2.2.2 Shared Packages
Before running the applications, you must build the shared protocols and schemas:
```bash
# Run from the root directory
pnpm --filter @workspace/schemas run build
pnpm --filter @workspace/protocol run generate
pnpm --filter @workspace/protocol run build
```

---

### 2.2.3 Backend & AI Services

#### 🗼 NestJS Microservices (Gateway & Services)
- **Development:** Run `pnpm dev` from the root to start the entire system using TurboRepo.
- **Production (VPS):**
  ```bash
  docker compose pull
  docker compose up -d
  docker image prune -f
  ```

#### 🎙 AI Voice Agent (Gemini Live)
> [!IMPORTANT]
> The Voice Agent handles real-time AI communication and runs as a separate service.

- **Development:** 
  1. `cd apps/voice-agent`
  2. `cp .env.example .env` (Add your `LIVEKIT_URL`, `API_KEY`, and `GOOGLE_API_KEY`)
  3. `pnpm dev` (Usually started automatically by `turbo dev` in root)
- **Production:** Controlled via `docker-compose.yml` under the `voice-agent` service. It uses `network_mode: host` to ensure low-latency WebRTC connectivity.

---

### 2.2.4 Web Frontends (web-learner & web-admin)
Torii Nihongo frontends are optimized for deployment on **Vercel**:

**Step 1: Project Import**
- Import the repository to Vercel.
- **Root Directory:**
  - For Student App: `apps/web-learner`
  - For Admin Panel: `apps/web-admin`

**Step 2: Configuration**
- Set `Framework Preset` to **Next.js** (for learner) or **Vite** (for admin).
- Add all required Environment Variables (API URLs, LiveKit URLs).

**Step 3: Deploy**
- Trigger the build and verify the deployment URL.

---

### 2.2.5 Meet WebRTC (LiveKit SSL & Renewal)
To ensure WebRTC works over HTTPS, follow these steps for the VPS:

**Step 1: SSL Setup**
Run the script to sync certificates to the LiveKit format:
```bash
chmod +x scripts/update-livekit-certs.sh
./scripts/update-livekit-certs.sh
```

**Step 2: Auto-Renewal (Certbot Hook)**
Add an automatic hook to update LiveKit whenever certificates are renewed:
- Open `/etc/letsencrypt/renewal/api.torii.sbs.conf`
- Add under `[renewalparams]`:
  `renew_hook = /path/to/torii-monorepo/scripts/update-livekit-certs.sh`

---

### 2.2.6 Mobile Application (Flutter)
**Step 1: Setup Environment**
Ensure the Flutter SDK is installed and `pubspec.yaml` dependencies are fetched:
```bash
cd torri-mobile
flutter pub get
```

**Step 2: Build for Production**
- **Android:** `flutter build apk --release`
- **iOS:** `flutter build ios --release` (Requires macOS and Xcode)

**Step 3: Distribution**
- Distribute via Firebase App Distribution, Google Play Console, or App Store Connect.
