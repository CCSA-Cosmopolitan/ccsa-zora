# CCSA Zora - Quick Start Checklist

## 🚨 CRITICAL BLOCKERS (Do These First)

- [ ] **Environment Files**
  ```powershell
  Copy-Item apps/web/.env.example apps/web/.env.local
  Copy-Item apps/mobile/.env.example apps/mobile/.env.local
  ```

- [ ] **Neon Database Setup**
  - [ ] Create account: https://console.neon.tech
  - [ ] Create project `ccsa-zora-production` in eu-central-1
  - [ ] Copy **pooled connection string** → `DATABASE_URL` in `.env.local`
  - [ ] Copy **direct connection string** → `DATABASE_URL_UNPOOLED` in root `.env.local`

- [ ] **Supabase Project Setup**
  - [ ] Create account: https://supabase.com
  - [ ] Create new project
  - [ ] Go to Settings → API → Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] Copy **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Copy **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Create storage bucket named `mrv-evidence` (private)
  - [ ] Update both web and mobile `.env.local` files

---

## 📋 Initial Setup

```powershell
# 1. Install dependencies
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm install --frozen-lockfile

# 2. Setup Python environment for API
uv --directory apps/kgml-api sync --dev --frozen

# 3. Generate random secrets (run 3 times, store in password manager)
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
# Use values for: KGML_SERVICE_KEY, IOT_INGEST_SECRET, ACCESS_REQUEST_HASH_SALT

# 4. Validate structure
pnpm validate:structure
pnpm typecheck
```

---

## 🗄️ Database Setup (After Neon/env configured)

```powershell
# Run in order:
pnpm db:prepare          # Enable PostGIS, pgcrypto
pnpm db:generate         # Generate new migrations (if needed)
pnpm db:migrate          # Apply migrations
pnpm db:harden           # Add immutable record protection
pnpm db:security         # Apply Neon security settings
pnpm db:api              # Create API functions
pnpm db:seed:demo        # Optional: seed demo data
pnpm db:verify           # Verify production readiness
```

---

## 🚀 Local Development

**Terminal 1 - FastAPI:**
```powershell
pnpm dev:api
# API runs on http://localhost:8000
# Health check: curl http://localhost:8000/health
```

**Terminal 2 - Next.js Web:**
```powershell
pnpm dev:web
# Web runs on http://localhost:3000
# Dashboard: http://localhost:3000/dashboard
```

**Terminal 3 - Expo Mobile:**
```powershell
pnpm dev:mobile
# Starts Expo dev server
# Use Expo Go app or local simulator
```

---

## 🧪 Validation & Testing

```powershell
# Type checking
pnpm typecheck

# API tests
pnpm test:api

# Validate production environment (after setting prod vars)
pnpm validate:production-env

# Smoke tests (after production deploy)
pnpm smoke:production
```

---

## 📊 Environment Variables Status

### ✅ CONFIGURED
- `ZORA_ENV` = development (in .env.example)
- `ZORA_DEMO_MODE` = true (in .env.example)
- `KGML_API_URL` = http://127.0.0.1:8000 (default)

### ❌ NEEDS CONFIGURATION
- `DATABASE_URL` (Neon pooled)
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase)
- `KGML_SERVICE_KEY` (32+ random chars)
- `IOT_INGEST_SECRET` (32+ random chars)

### 📱 Mobile-Specific
- `EXPO_PUBLIC_API_URL` = http://192.168.1.10:3000 (LAN address)
- `EXPO_PUBLIC_SUPABASE_URL` (Same as web)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Same as web)

---

## 📁 Project Structure at a Glance

```
✅ apps/web/              Next.js Command Centre
✅ apps/mobile/           Expo React Native App
✅ apps/kgml-api/         FastAPI Intelligence Service
✅ packages/db/           Drizzle ORM + Migrations
✅ packages/ui/           shadcn/ui Components
✅ packages/api-client/   Isomorphic API Client
✅ packages/utils/        Shared Utilities
✅ scripts/               Utility Scripts
✅ docs/                  Documentation
⚠️ .env.local files       MISSING (need to create)
❌ GitHub Actions         Incomplete (workflows/ empty)
```

---

## 🎯 Feature Status

| Feature | Status | Work Required |
|---------|--------|---------------|
| User Auth | 🟡 | Complete Supabase setup |
| Advisory Chat | 🟡 | Finish UI + API integration |
| Field Scouting | 🟡 | Complete form + sync |
| Farm Mapping | 🟡 | Implement map features |
| Dashboard Analytics | 🟡 | Implement charts |
| Offline Sync | 🟡 | Implement SQLite sync |
| Mobile Camera | ✅ | Expo camera configured |
| Mobile GPS | ✅ | Expo location configured |
| Mobile Audio | ✅ | Expo audio/speech configured |

---

## 🔒 Security Checklist

- ✅ HTTPS headers configured
- ✅ CORS restricted
- ✅ Camera/mic/geo permissions scoped
- ✅ Database RLS ready
- ✅ Auth token flow ready
- ✅ HMAC IoT verification ready
- ❌ Production secrets not set in Vercel yet
- ❌ No rate limiting configured yet

---

## 🚀 Deployment Preparation

### Before Vercel Deployment:
- [ ] All environment variables configured locally
- [ ] Database migrations applied successfully
- [ ] API tests passing
- [ ] Web app builds successfully: `pnpm build`
- [ ] Mobile export successful: `pnpm --filter @ccsa-zora/mobile exec expo export`

### Vercel Setup:
- [ ] Create Vercel account
- [ ] Create two projects: `ccsa-zora-web` and `ccsa-zora-api`
- [ ] Link GitHub repository
- [ ] Add environment variables to both projects
- [ ] Enable deployments

### Mobile/EAS Setup:
- [ ] Create Expo account
- [ ] Create Apple Developer account (for iOS)
- [ ] Create Google Play Developer account (for Android)
- [ ] Configure EAS credentials: `eas credentials`

---

## 📞 Support Resources

- **Neon Docs:** https://neon.tech/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Expo Docs:** https://docs.expo.dev
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Drizzle Docs:** https://orm.drizzle.team

---

## ⚠️ Common Issues & Solutions

### Issue: `DATABASE_URL` not found
**Solution:** Copy `.env.example` to `.env.local` and add Neon connection string

### Issue: Supabase API 401 errors
**Solution:** Verify API keys in environment variables match Supabase project settings

### Issue: Expo development server fails
**Solution:** Ensure `EXPO_PUBLIC_API_URL` points to reachable dev server

### Issue: Database migration fails
**Solution:** Verify `DATABASE_URL_UNPOOLED` is the direct (non-pooled) Neon URL

### Issue: Mobile camera not working
**Solution:** Grant camera permissions in app settings, ensure `expo-camera` is installed

---

## 📝 Next Steps (24-48 hours)

1. ✅ Copy this checklist
2. ✅ Create Neon account and database
3. ✅ Create Supabase project
4. ✅ Configure all environment variables
5. ✅ Run database migrations
6. ✅ Start all three dev servers
7. ✅ Test basic authentication flow
8. ✅ Verify API connectivity

---

**Last Updated:** August 5, 2025  
**Project:** CCSA Zora v0.1.0
