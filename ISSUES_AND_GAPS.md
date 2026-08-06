# CCSA Zora - Issues & Gaps Report

**Report Date:** August 5, 2025  
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 🔴 CRITICAL ISSUES (Blocking Development)

### Issue #1: Missing Environment Configuration Files
**Severity:** 🔴 CRITICAL  
**Impact:** Cannot start any development servers  
**Files Missing:**
- `apps/web/.env.local`
- `apps/mobile/.env.local`

**Resolution:**
```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/mobile/.env.example apps/mobile/.env.local
```
**Estimated Effort:** 2 minutes

---

### Issue #2: Neon PostgreSQL Database Not Provisioned
**Severity:** 🔴 CRITICAL  
**Impact:** All data persistence is broken; no FIMS data, no audit trails  
**Current State:** Only configuration scripts exist  
**Missing:**
- No Neon account created
- No PostgreSQL database
- No connection strings obtained
- No migrations applied
- No demo data seeded

**Dependencies:**
- Neon account + project creation
- Getting pooled & direct connection strings
- Environment variable configuration
- Running migration suite

**Resolution Steps:**
1. Create Neon account (neon.tech)
2. Create project `ccsa-zora-production` in Frankfurt
3. Enable PostGIS extension
4. Get connection strings
5. Update `.env.local` and root `.env.example`
6. Run `pnpm db:migrate`

**Estimated Effort:** 30 minutes + database setup time (10-20 min)

---

### Issue #3: Supabase Project Not Configured
**Severity:** 🔴 CRITICAL  
**Impact:** Authentication broken; evidence storage unavailable  
**Current State:** Only configuration examples in `.env.example`  
**Missing:**
- No Supabase project created
- No API keys/URLs obtained
- No storage bucket created
- No authentication providers enabled
- No RLS policies applied

**Dependencies:**
- Supabase account creation
- Project configuration
- Storage bucket setup
- Auth provider setup

**Resolution Steps:**
1. Create Supabase account (supabase.com)
2. Create new project
3. Get API URL and keys from Settings → API
4. Create `mrv-evidence` storage bucket (private)
5. Enable Auth providers (email/password at minimum)
6. Add to `.env.local` files (web + mobile)
7. Run RLS setup: `pnpm db:rls:supabase`

**Estimated Effort:** 30 minutes

---

### Issue #4: Database Schema Not Deployed to Development Database
**Severity:** 🔴 CRITICAL  
**Impact:** No tables, no functions, no data model  
**Current State:** Drizzle schema files exist but not applied  
**Missing:**
- PostGIS extension not enabled
- Drizzle migrations not applied
- Security functions not created
- API functions not created
- Demo data not seeded

**Resolution:**
```powershell
pnpm db:prepare      # Create extensions
pnpm db:migrate      # Apply migrations
pnpm db:harden       # Add security
pnpm db:api          # Create functions
pnpm db:seed:demo    # Optional seed
```

**Estimated Effort:** 10 minutes (after DB provisioned)

---

## 🟠 HIGH PRIORITY ISSUES

### Issue #5: API Service Not Fully Implemented
**Severity:** 🟠 HIGH  
**Impact:** Advisory features, model inference not available  
**Files:** `apps/kgml-api/app/`  

**Status Breakdown:**
- ✅ FastAPI setup and health endpoints working
- ⚠️ `advisory.py` implementation status unclear
- ⚠️ `model.py` carbon inference needs testing
- ❌ No API documentation (OpenAPI)
- ❌ Test coverage unknown

**Missing:**
- Complete advisory service implementation
- Model version tracking
- Confidence/uncertainty calculations
- Reasoning trace generation
- Comprehensive API tests

**Resolution:**
1. Review and complete `advisory.py`
2. Test `model.py` inference logic
3. Add pytest test suite
4. Generate OpenAPI documentation
5. Verify KGML contract compliance

**Estimated Effort:** 2-3 days

---

### Issue #6: Web Dashboard Not Implemented
**Severity:** 🟠 HIGH  
**Impact:** Users cannot access institutional features  
**Files:** `apps/web/src/features/dashboard/`

**Status Breakdown:**
- ✅ Route created (`/dashboard`)
- ❌ Layout scaffolded but incomplete
- ❌ Analytics visualization missing
- ❌ Farm records display missing
- ❌ FIMS integration missing
- ❌ Map visualization missing

**Missing Modules:**
- Dashboard overview/KPIs
- Field vitality indicators
- Extension reach analytics
- MRV readiness dashboard
- Sensor health monitoring
- Climate exposure dashboard
- Evidence management UI

**Resolution:**
1. Complete dashboard layout
2. Implement Recharts visualizations
3. Connect to database queries
4. Integrate MapLibre for spatial view
5. Add FIMS context display

**Estimated Effort:** 3-5 days

---

### Issue #7: Mobile Advisory Chat Not Implemented
**Severity:** 🟠 HIGH  
**Impact:** Farmers cannot ask questions; core feature missing  
**Files:** `apps/mobile/app/assistant.tsx`

**Status Breakdown:**
- ✅ Route created
- ❌ Chat UI not implemented
- ❌ Voice input not integrated
- ❌ API integration missing
- ❌ Conversation history missing
- ❌ Evidence attachment missing

**Missing Components:**
- Message list UI
- Input field with voice button
- API request handling
- Streaming response handling
- Voice-to-text integration
- Text-to-speech output
- Evidence attachment UI

**Resolution:**
1. Build chat UI with React Native
2. Integrate voice input (expo-audio)
3. Connect to advisory API
4. Implement streaming responses
5. Add speech output (expo-speech)
6. Handle conversation history

**Estimated Effort:** 3-4 days

---

### Issue #8: Field Scouting Form Not Implemented
**Severity:** 🟠 HIGH  
**Impact:** Users cannot record field observations; core feature missing  
**Files:** `apps/mobile/app/scouting/new.tsx`

**Status Breakdown:**
- ✅ Route created
- ❌ Form UI not implemented
- ❌ Camera integration incomplete
- ❌ GPS attachment missing
- ❌ Sync mechanism not implemented

**Missing Features:**
- Form fields for observation data
- Photo capture integration (expo-camera)
- GPS location capture (expo-location)
- Media attachment preview
- Offline SQLite storage
- Sync queue management
- Conflict resolution UI

**Resolution:**
1. Design scouting form schema
2. Build React Native form UI
3. Integrate camera (photo capture)
4. Integrate GPS location
5. Implement SQLite outbox
6. Add sync mechanism
7. Implement conflict handling

**Estimated Effort:** 4-5 days

---

### Issue #9: Mobile Offline Sync Not Implemented
**Severity:** 🟠 HIGH  
**Impact:** Mobile app cannot persist data offline; sync broken  
**Files:** `apps/mobile/src/features/field-scouting/`

**Status Breakdown:**
- ✅ Expo SQLite configured
- ✅ Outbox pattern documented
- ❌ No sync implementation
- ❌ No conflict resolution
- ❌ No media integrity checking

**Missing Components:**
- SQLite schema for observations
- Outbox envelope implementation
- Pull cursor tracking
- Sync retry logic
- Media hash verification
- Conflict detection/display
- Backoff strategy

**Resolution:**
1. Define SQLite schema
2. Implement outbox pattern
3. Create sync service
4. Add media hash verification
5. Implement conflict UI
6. Add retry/backoff logic

**Estimated Effort:** 4-5 days

---

### Issue #10: Authentication Flow Not Complete
**Severity:** 🟠 HIGH  
**Impact:** Users cannot log in; blocking all authenticated features  
**Files:** Multiple - `apps/web/app/login/`, `apps/mobile/app/login.tsx`

**Status Breakdown:**
- ✅ Supabase client configured
- ✅ Auth SDK installed
- ❌ Login UI not implemented
- ❌ Session management incomplete
- ❌ Token refresh not implemented
- ❌ Protected routes not implemented

**Missing Components:**
- Login form UI
- Password reset flow
- MFA setup (TOTP)
- Token persistence
- Token refresh logic
- Route protection (web)
- Route protection (mobile)
- Logout flow

**Resolution:**
1. Build login UI (web + mobile)
2. Implement Supabase auth methods
3. Store tokens in secure storage (mobile)
4. Implement token refresh
5. Add protected routes
6. Implement MFA flow
7. Add logout functionality

**Estimated Effort:** 2-3 days

---

## 🟡 MEDIUM PRIORITY ISSUES

### Issue #11: No Test Coverage
**Severity:** 🟡 MEDIUM  
**Impact:** Code quality not verified; bugs not caught early  

**Status Breakdown:**
- ❌ No web component tests
- ❌ No mobile integration tests
- ⚠️ API tests exist but untested
- ✅ TypeScript type checking enabled
- ✅ Python MyPy checking enabled

**Missing:**
- Jest/Vitest setup for web
- React Testing Library tests
- Integration tests (mobile)
- E2E tests
- API endpoint tests
- Database query tests

**Resolution:**
1. Setup Jest for web app
2. Add React Testing Library
3. Write component tests (web)
4. Setup testing-library/react-native
5. Write integration tests (mobile)
6. Complete API pytest suite
7. Add E2E test suite

**Estimated Effort:** 3-4 days (ongoing)

---

### Issue #12: GitHub Actions Workflows Empty
**Severity:** 🟡 MEDIUM  
**Impact:** No CI/CD pipeline; manual deployments required  

**Status Breakdown:**
- ✅ `.github/workflows/` directory exists
- ❌ No workflow files
- ✅ Dependabot configured

**Missing Workflows:**
- Pull request validation
- TypeScript type checking
- API tests execution
- Linting/formatting checks
- Build verification
- Automated deployment to staging
- Production deployment workflow
- Security scanning

**Resolution:**
1. Create lint-check.yml workflow
2. Create test.yml workflow
3. Create build.yml workflow
4. Create deploy-staging.yml workflow
5. Create deploy-production.yml workflow
6. Configure branch protection rules

**Estimated Effort:** 1-2 days

---

### Issue #13: Map Features Not Implemented
**Severity:** 🟡 MEDIUM  
**Impact:** Spatial features limited; GIS advantage lost  

**Status Breakdown:**
- ✅ MapLibre GL configured (web)
- ✅ React Native Maps configured (mobile)
- ✅ Deck.gl configured (web)
- ✅ PostGIS ready
- ❌ No map UI implemented
- ❌ No spatial queries
- ❌ No visualization

**Missing Features:**
- Farm boundary visualization
- Field layer rendering
- Hotspot/problem area mapping
- Sensor location display
- Visit tracking/history
- Spatial search
- GeoJSON import/export
- Polygon drawing tools

**Resolution:**
1. Implement map wrapper component
2. Add farm boundary display
3. Add field visualization
4. Implement spatial queries
5. Add sensor markers
6. Implement drawing tools
7. Add spatial filtering

**Estimated Effort:** 3-4 days

---

### Issue #14: No Documentation for Developers
**Severity:** 🟡 MEDIUM  
**Impact:** Onboarding difficult; knowledge gaps  

**Missing Documentation:**
- API endpoint documentation
- Mobile development guide
- Database schema documentation
- Contributing guidelines
- Architecture decision records
- Testing strategy
- Deployment procedures (per-app)
- Troubleshooting guide

**Resolution:**
1. Generate OpenAPI docs for API
2. Write mobile dev guide
3. Document database schema
4. Create CONTRIBUTING.md
5. Write ADRs for major decisions
6. Document testing strategy
7. Write deployment guides

**Estimated Effort:** 1-2 days

---

### Issue #15: No ESLint/Prettier Configuration
**Severity:** 🟡 MEDIUM  
**Impact:** Code style inconsistent; formatting issues  

**Status Breakdown:**
- ✅ TypeScript strict mode enabled
- ❌ No ESLint configuration
- ❌ No Prettier configuration
- ❌ No pre-commit hooks

**Missing:**
- ESLint configuration (.eslintrc)
- Prettier configuration (.prettierrc)
- Pre-commit hooks (husky)
- Lint-staged configuration
- IDE settings (.vscode/settings.json)

**Resolution:**
1. Setup ESLint with TypeScript rules
2. Setup Prettier
3. Configure husky pre-commit hooks
4. Add lint-staged
5. Add VS Code settings

**Estimated Effort:** 2-3 hours

---

## 🟢 LOW PRIORITY ISSUES

### Issue #16: Weather Integration Missing
**Severity:** 🟢 LOW  
**Impact:** Weather-based recommendations unavailable  
**Status:** Not yet implemented (Phase 2)  
**Effort:** 2-3 days

---

### Issue #17: Sensor Integration Missing
**Severity:** 🟢 LOW  
**Impact:** IoT data ingestion unavailable  
**Status:** Not yet implemented (Phase 2)  
**Effort:** 3-4 days

---

### Issue #18: Export/Reporting Missing
**Severity:** 🟢 LOW  
**Impact:** Evidence export unavailable  
**Status:** Not yet implemented (Phase 2)  
**Effort:** 2-3 days

---

### Issue #19: Mobile Build Not Generated
**Severity:** 🟢 LOW  
**Impact:** Cannot test on device; distribution not ready  
**Status:** Build directories exist but not current  
**Effort:** 1-2 hours (after features done)

---

### Issue #20: No Rate Limiting
**Severity:** 🟢 LOW  
**Impact:** API vulnerable to abuse in production  
**Status:** Not configured  
**Effort:** 1 day (after production deployment)

---

## Summary: Issues by Category

### Infrastructure (3 issues)
| Issue | Severity | Effort |
|-------|----------|--------|
| Missing `.env.local` files | 🔴 | 2 min |
| Neon database not provisioned | 🔴 | 30 min |
| Supabase not configured | 🔴 | 30 min |

### Feature Implementation (7 issues)
| Issue | Severity | Effort |
|-------|----------|--------|
| API service incomplete | 🟠 | 2-3 days |
| Dashboard not implemented | 🟠 | 3-5 days |
| Advisory chat not implemented | 🟠 | 3-4 days |
| Field scouting not implemented | 🟠 | 4-5 days |
| Offline sync not implemented | 🟠 | 4-5 days |
| Authentication incomplete | 🟠 | 2-3 days |
| Map features not implemented | 🟡 | 3-4 days |

### Code Quality (5 issues)
| Issue | Severity | Effort |
|-------|----------|--------|
| No test coverage | 🟡 | 3-4 days |
| GitHub Actions empty | 🟡 | 1-2 days |
| No ESLint/Prettier | 🟡 | 2-3 hours |
| No developer docs | 🟡 | 1-2 days |
| Missing phase 2 features | 🟢 | 5-6 days |

---

## Recommended Timeline

### **Week 1: Foundation (Critical Issues)**
- Day 1: Setup Neon + Supabase (1 day)
- Day 1-2: Database migrations + seed data (0.5 day)
- Day 2-3: Complete authentication flow (2 days)
- Day 3-4: Complete advisory chat (2 days)

**Blockers Cleared:** Development can progress

### **Week 2: Core Features**
- Day 1-2: Field scouting form (2 days)
- Day 2-3: Offline sync implementation (2 days)
- Day 4-5: Dashboard basics (1.5 days)

**Status:** MVP features working

### **Week 3: Polish & Testing**
- Day 1-2: Test coverage (2 days)
- Day 2-3: Map features (2 days)
- Day 4: Bug fixes + optimization

**Status:** Ready for alpha testing

### **Week 4: Deployment & Phase 2**
- Day 1-2: GitHub Actions CI/CD (1.5 days)
- Day 2-3: Production deployment prep (1.5 days)
- Day 3-4: Weather integration (Phase 2)

---

## Effort Summary

| Category | Low | Medium | High | Critical | Total |
|----------|-----|--------|------|----------|-------|
| Infrastructure | - | - | - | 3 | **3** |
| Features | - | 1 | 6 | - | **7** |
| Quality | 1 | 4 | - | - | **5** |
| Phase 2 | 5 | - | - | - | **5** |
| **TOTAL** | **6** | **5** | **6** | **3** | **20** |

**Critical Path (Blocking):** 1.5 days (after infra setup: 1 day)  
**Total MVP Effort:** ~30-35 developer-days

---

**Last Updated:** August 5, 2025  
**Project:** CCSA Zora v0.1.0
