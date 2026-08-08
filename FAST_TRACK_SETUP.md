# CCSA Zora - FAST TRACK EXECUTION PLAN

## Get Everything Running TODAY 🚀

**Date Created:** August 5, 2025  
**Goal:** Launch functional MVP with core features working  
**Timeline:** 8-10 hours (compressed from 30+ days)  
**Strategy:** Ruthless prioritization + parallel execution

---

## 🎯 TODAY'S MISSION

By end of today:

- ✅ Local development environment working
- ✅ All three dev servers running
- ✅ Database schema applied
- ✅ Authentication flow functional
- ✅ Basic dashboard visible
- ✅ Mobile app boots without errors

**What WE'RE NOT doing today:**

- ❌ Complete feature implementation (features are 60% complete, that's OK)
- ❌ Comprehensive testing (we'll add later)
- ❌ GitHub Actions CI/CD (deploy manually for now)
- ❌ Mobile app stores (EAS build for dev only)

---

## 🚨 CRITICAL PATH - MUST DO FIRST (2-3 hours)

### Phase 0: Setup Environment (30 minutes)

**STEP 0.1: Create `.env.local` Files**

```powershell
# This file already exists in editor, just needs values
# Check: apps/web/.env.local
# Check: apps/mobile/.env.local
```

**STEP 0.2: Generate Random Secrets (5 minutes)**

```powershell
# Run 3 times to get 3 different 48-char secrets
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"

# Store results as:
# Secret 1 → KGML_SERVICE_KEY
# Secret 2 → IOT_INGEST_SECRET
# Secret 3 → ACCESS_REQUEST_HASH_SALT
```

**STEP 0.3: Install All Dependencies (15 minutes)**

```powershell
cd c:\projects\ccsa-aiv2
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm install --frozen-lockfile

# Setup Python API
uv --directory apps/kgml-api sync --dev --frozen
```

✅ **Status Check:**

```powershell
pnpm validate:structure    # Should pass
pnpm typecheck            # Should have 0 errors
```

---

### Phase 1: Database Setup (1 hour 30 minutes)

**STEP 1.1: Neon Quick Setup (15 minutes)**

**What you need:**

1. Neon account (https://console.neon.tech/sign_up)
2. Create project: `ccsa-zora-dev` in **Frankfurt (eu-central-1)**
3. Copy connection strings

**From Neon dashboard:**

- Go to "Connection strings"
- Copy **POOLED** connection string → `DATABASE_URL` in `apps/web/.env.local`
- Copy **DIRECT** connection string → `DATABASE_URL_UNPOOLED` in root `.env.example`

**Example format:**

```
DATABASE_URL=postgresql://zora_app:PASSWORD@ep-XXX-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:PASSWORD@ep-XXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

**STEP 1.2: Supabase Quick Setup (20 minutes)**

**What you need:**

1. Supabase account (https://supabase.com/sign_up)
2. Create new project

**From Supabase dashboard:**

- Settings → API
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**Storage Bucket:**

- Go to Storage → Create new bucket
- Name: `mrv-evidence`
- Set to **Private**

**Add to both files:**

```
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# apps/mobile/.env.local (same values)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

---

**STEP 1.3: Run Database Migrations (45 minutes)**

```powershell
# Terminal in project root
cd c:\projects\ccsa-aiv2

# First, enable extensions
pnpm db:prepare
# ⏱️ Wait for completion (~2 min)

# Apply all migrations
pnpm db:migrate
# ⏱️ Wait for completion (~3 min)

# Add security functions
pnpm db:harden
# ⏱️ Wait (~1 min)

# Add Neon hardening
pnpm db:security
# ⏱️ Wait (~1 min)

# Create API functions
pnpm db:api
# ⏱️ Wait (~1 min)

# Optional: Seed demo data (adds sample farms)
pnpm db:seed:demo
# ⏱️ Wait (~2 min)

# Verify everything
pnpm db:verify
# Should show: ✅ Production ready
```

✅ **Verification:**

```powershell
# Open database studio
pnpm db:studio
# Should see tables in sidebar
```

---

## 🚀 PARALLEL EXECUTION - Run These in Separate Terminals (5 hours)

Now that database is running, start all 3 servers in parallel.

### Terminal 1: FastAPI Service

```powershell
pnpm dev:api
# Expected output:
# ✓ Uvicorn running on http://localhost:8000
# Test: curl http://localhost:8000/health
# Expected: {"status": "ok", "service": "CCSA Zora Intelligence API", "model_version": "0.1.0"}
```

**If it fails:**

```powershell
# Check if port is in use
netstat -ano | findstr :8000

# Or run directly with verbose output
cd apps/kgml-api
uv run uvicorn app.main:app --reload --port 8000 --log-level debug
```

---

### Terminal 2: Next.js Web App

```powershell
pnpm dev:web
# Expected output:
# ▲ Next.js 16.2.12
# - Local: http://localhost:3000

# Test endpoints:
# http://localhost:3000                    (public landing)
# http://localhost:3000/login             (auth page)
# http://localhost:3000/dashboard         (protected - will redirect to login)
```

**If it fails with prisma error:**

```powershell
# This is expected - we use Drizzle, not Prisma
# The error about "npx prisma generate" is from left-over config
# Just ignore it and use drizzle commands

# If Next won't start, try:
cd apps/web
rm -r .next
pnpm dev
```

---

### Terminal 3: Expo Mobile App

```powershell
pnpm dev:mobile
# Expected output:
# › Metro waiting on http://localhost:8081

# Then open Expo Go on your phone/simulator and scan QR code
# OR press 'a' for Android simulator or 'i' for iOS simulator
```

**If it fails:**

```powershell
# Make sure Expo cache is clear
pnpm --filter @ccsa-zora/mobile exec expo start --clear

# For physical device, make sure you're on same WiFi
# Update EXPO_PUBLIC_API_URL to your machine's LAN IP
```

---

## ✅ QUICK VALIDATION CHECKLIST

After starting all 3 servers, verify:

- [ ] **API Health**

  ```powershell
  curl http://localhost:8000/health
  # Response: {"status": "ok", ...}
  ```

- [ ] **API Readiness**

  ```powershell
  curl http://localhost:8000/ready
  # Response: {"ready": true, ...}
  ```

- [ ] **Web App Loads**
  - Open http://localhost:3000
  - Should see Zora landing page
  - Click "Login" - should show login form
  - (Don't login yet, just verify page loads)

- [ ] **Mobile App Boots**
  - Expo Go app should show Zora
  - Should see home screen or login
  - No red error screen

- [ ] **Database Connected**
  ```powershell
  pnpm db:studio
  # Should open Drizzle Studio with all tables visible
  ```

---

## 🔧 QUICK WINS - Low Effort, High Value (1-2 hours)

### Win #1: Add ESLint + Prettier (20 minutes)

**Why:** Code consistency, catch errors early

```powershell
cd c:\projects\ccsa-aiv2

# Install eslint for TypeScript
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier

# Create .eslintrc.json in root
```

**Create file:** `.eslintrc.json`

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Create file:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Add to root `package.json`:**

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  }
}
```

---

### Win #2: Add Pre-commit Hooks (15 minutes)

**Why:** Prevent broken code from being committed

```powershell
# Install husky and lint-staged
pnpm add -D husky lint-staged

# Setup husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"
```

**Add to root `package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": "eslint --fix",
    "*.{ts,tsx,json,md}": "prettier --write"
  }
}
```

---

### Win #3: Document Critical Paths (15 minutes)

Create [API_QUICK_REFERENCE.md](http://API_QUICK_REFERENCE.md):

```markdown
# API Quick Reference

## Health Check

GET /health
→ {"status": "ok", ...}

## Advisory

POST /api/advisory
Body: { question: "...", context: {...} }
→ { answer: "...", confidence: 0.85, ... }

## Test Data

GET /api/demo/farm
→ Returns demo farm records
```

---

### Win #4: Setup GitHub Branch Protection (10 minutes)

**In GitHub Settings → Branches:**

- Require status checks to pass (once we add CI)
- Require code reviews
- Protect main branch

---

## ⚠️ KNOWN ISSUES & QUICK FIXES

### Issue: Prisma Error on Next.js Start

**Error:** `npx prisma generate`
**Fix:** We use Drizzle, not Prisma. This is safe to ignore. The app still works.
**Resolution:** Remove Prisma reference (optional, not urgent)

### Issue: Supabase Auth Not Working

**Error:** 401/403 on API calls
**Fix:** Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct (check Supabase dashboard)

### Issue: Mobile Camera Permission Denied

**Error:** "Camera permission not granted"
**Fix:** Go to phone settings → Apps → CCSA Zora → Permissions → Camera → Allow

### Issue: Database Connection Timeout

**Error:** "timeout connecting to database"
**Fix:**

1. Check internet connection
2. Verify Neon project is active (not suspended)
3. Verify DATABASE_URL in .env.local is correct
4. Try: `psql <DATABASE_URL>` to test connection

### Issue: Port Already in Use

**Error:** "Port 3000/8000/8081 is already in use"
**Fix:**

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill the process (use PID from above)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 pnpm dev:web
```

---

## 📋 DEFERRED (Not Today, But Important)

### This Week:

- [ ] Complete authentication flow (currently scaffolded)
- [ ] Implement advisory chat properly
- [ ] Add field scouting form
- [ ] Offline sync mechanism

### Next Week:

- [ ] Comprehensive test coverage
- [ ] GitHub Actions CI/CD
- [ ] Mobile build & signing
- [ ] Production deployment prep

### Later (Phase 2):

- [ ] Weather integration
- [ ] Sensor data ingestion
- [ ] Export/reporting features
- [ ] Advanced analytics

---

## 🎬 EXECUTION SCRIPT (Copy & Paste This)

**Save as: `FAST_TRACK_SETUP.ps1`**

```powershell
$ErrorActionPreference = "Stop"

Write-Host "🚀 CCSA Zora Fast Track Setup" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Phase 0: Setup
Write-Host "Phase 0: Dependency Installation" -ForegroundColor Cyan
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm install --frozen-lockfile
uv --directory apps/kgml-api sync --dev --frozen
Write-Host "✓ Dependencies installed`n" -ForegroundColor Green

# Phase 1: Database Setup
Write-Host "Phase 1: Database Preparation" -ForegroundColor Cyan
Write-Host "⚠️  Make sure DATABASE_URL and DATABASE_URL_UNPOOLED are in .env files!" -ForegroundColor Yellow
Read-Host "Press Enter to continue..."

pnpm db:prepare
pnpm db:migrate
pnpm db:harden
pnpm db:security
pnpm db:api
pnpm db:seed:demo
pnpm db:verify
Write-Host "✓ Database ready`n" -ForegroundColor Green

# Phase 2: Validation
Write-Host "Phase 2: Validation" -ForegroundColor Cyan
pnpm validate:structure
pnpm typecheck
Write-Host "✓ Validation passed`n" -ForegroundColor Green

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "Next: Start three dev servers in separate terminals:" -ForegroundColor Yellow
Write-Host "  Terminal 1: pnpm dev:api" -ForegroundColor Yellow
Write-Host "  Terminal 2: pnpm dev:web" -ForegroundColor Yellow
Write-Host "  Terminal 3: pnpm dev:mobile" -ForegroundColor Yellow
```

---

## ⏱️ TIME BREAKDOWN

| Phase          | Duration       | What                         |
| -------------- | -------------- | ---------------------------- |
| 0: Setup       | 30 min         | Dependencies + secrets       |
| 1: Database    | 1 hour 30 min  | Neon + Supabase + migrations |
| 2: Validation  | 10 min         | Type checks + structure      |
| 3: Dev Servers | 5-10 min       | Start all 3 in parallel      |
| 4: Quick Wins  | 60 min         | ESLint, pre-commit, docs     |
| **TOTAL**      | **~3.5 hours** | **Environment ready**        |

---

## 🎯 SUCCESS CRITERIA

By 2 PM today, you should have:

- ✅ All 3 servers running without errors
- ✅ Database tables created and seeded
- ✅ Web app accessible at http://localhost:3000
- ✅ Mobile app boots without crashing
- ✅ API responding to requests
- ✅ Can navigate between pages (even if features incomplete)
- ✅ No blocking errors in console

**Features don't need to be perfect today - they just need to not crash.**

---

## 🆘 GETTING STUCK?

**Problem:** Something doesn't work
**Solution:**

1. Check the KNOWN ISSUES section above
2. Run the service directly with verbose logging:
   ```powershell
   # For API
   cd apps/kgml-api
   uv run uvicorn app.main:app --reload --log-level debug

   # For Web
   cd apps/web
   pnpm dev --debug

   # For Mobile
   pnpm --filter @ccsa-zora/mobile exec expo start --clear
   ```
3. Check the AUDIT_REPORT.md and ISSUES_AND_GAPS.md for context

---

## 📞 REMEMBER

- **You're not alone** - This is a complex project, incomplete features are expected
- **Today is about ENV setup + servers running** - Not feature completeness
- **Done is better than perfect** - Get it running, refine later
- **Document as you go** - Add notes to this file for others

---

## 📊 CURRENT PROJECT STATE

| Component         | Ready? | Notes                                 |
| ----------------- | ------ | ------------------------------------- |
| Project Structure | ✅     | Excellent                             |
| Dependencies      | ✅     | All specified                         |
| Database Schema   | ✅     | Ready to apply                        |
| API Service       | 🟡     | Scaffolded, needs polish              |
| Web App           | 🟡     | Routes ready, features incomplete     |
| Mobile App        | 🟡     | Navigation ready, features incomplete |
| Authentication    | 🟡     | SDK ready, UI incomplete              |
| Testing           | ❌     | Will add later                        |
| CI/CD             | ❌     | Will add later                        |

---

## 🚀 LAUNCH SEQUENCE

```powershell
# Terminal 1 - Root directory
pnpm dev:api                    # Watch for: "Uvicorn running"

# Terminal 2 - Root directory
pnpm dev:web                    # Watch for: "Ready in"

# Terminal 3 - Root directory
pnpm dev:mobile                 # Watch for: "Metro waiting"

# Then:
# 1. Open http://localhost:3000 in browser
# 2. Open Expo Go and scan QR code
# 3. Verify both load without errors
# 4. Try clicking around (features may not work, that's OK)
```

---

**Last Updated:** August 5, 2025  
**Target Completion:** TODAY 🎯  
**Team:** You + AI working together

Good luck! 🚀
