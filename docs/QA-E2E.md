# QA — E2E Test Plan · Bolão Neca & Yomar

**Target environment:** https://bolao-neca-yomar.vercel.app  
**Stack:** Next.js 15 · Supabase (Postgres + Auth) · Vercel  
**Test runner:** Playwright (Chromium only, headless)  
**Date written:** 2026-05-11

---

## 1. Setup

```bash
# Install Playwright + Chromium (no global install needed)
pnpm dlx playwright install chromium

# Install dotenv (needed by playwright.config.ts)
pnpm add -D dotenv @playwright/test

# Run all E2E tests
pnpm dlx playwright test --project=chromium

# Run with visible browser (debugging)
pnpm dlx playwright test --headed

# Show HTML report after run
pnpm dlx playwright show-report
```

### Required environment variable

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Mint test sessions via Admin API |

The public `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already in `.env.local` and are not needed by the test runner directly.

---

## 2. Files created

| File | Role |
|---|---|
| `playwright.config.ts` | Playwright configuration — baseURL, timeout, reporters, Chromium project |
| `tests/e2e/bolao.spec.ts` | All 10 test cases (golden path + auth) |
| `docs/QA-E2E.md` | This document |

---

## 3. Test inventory

### 3.1 Public pages (no auth required)

| # | Route | What is asserted | Risk |
|---|---|---|---|
| 1 | `/` | `<h1>` contains "O Bolão"; link "Entrar agora" points to `/m/login` | HIGH — front door |
| 2 | `/grupos` | All 12 group letters A–L are visible on the page | MEDIUM |
| 3 | `/tabela` | Text "nº 01" and "nº 72" present (first and last match) | MEDIUM |
| 4 | `/regulamento` | `<h2>` contains "As nove" and "regras" | LOW |
| 5 | `/ranking` | At least one ranking row (`1º` / `2º`) **or** empty-state text visible | MEDIUM |
| 6 | `/m/login` | Submit with blank email → stays on `/m/login`; if `?error=` in URL, red error div visible | HIGH |

### 3.2 Authenticated flow (Supabase Admin API)

| # | Route | What is asserted | Risk |
|---|---|---|---|
| 7 | magic-link redirect | After following admin-generated link, browser lands on `/m/palpite` and "Próximos" heading visible | HIGH — core auth |
| 8 | `/m/palpite` | Click "1" button on first match → button background changes from transparent (selected state) | HIGH — core feature |
| 9 | `/admin` (no host flag) | "Não autorizado" text visible | HIGH — access control |
| 10 | `/admin` (host=true via API) | "Não autorizado" absent; admin heading visible; `/ranking` page renders without error | HIGH — admin gate |

---

## 4. Auth strategy

The app uses Supabase magic-link auth (no passwords). E2E tests cannot receive real emails, so we use the **Supabase Management API** (service-role key) to:

1. **Create** a throwaway user (`POST /auth/v1/admin/users` with `email_confirm: true`).
2. **Mint** a magic-link token (`POST /auth/v1/admin/generate_link` with `type: magiclink`) — returns `action_link`.
3. **Navigate** Playwright directly to `action_link`; Supabase exchanges the OTP and sets a session cookie.
4. **Delete** the user after the test run (`DELETE /auth/v1/admin/users/:id`).

This flow is identical to what a real user experiences, without needing a real inbox.

The test user email follows the pattern `pw-test-<timestamp>@bolao-test.local` to avoid collisions on parallel CI runs.

---

## 5. Cleanup

`test.afterAll` in the authenticated suite calls `deleteTestUser(userId)` unconditionally, so no orphaned users accumulate in Supabase Auth even on test failure.

If a run is hard-killed, manual cleanup:

```bash
# List users (requires jq)
curl -s https://sdqgosoavqqyhzizptrx.supabase.co/auth/v1/admin/users \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" | jq '.users[] | select(.email | startswith("pw-test-"))'
```

---

## 6. Flaky-test policy

| Symptom | Likely cause | Mitigation |
|---|---|---|
| Auth test fails on CI first run | Cold Vercel serverless boot (>5 s) | `networkidle` wait + `retries: 2` in config |
| Ranking shows different count each run | DB state changes between runs | Assert `> 0` not exact count |
| Pick button background assertion fails | React transition not flushed | `waitForTimeout(500)` after click (acceptable — no network call to wait for) |
| `/tabela` missing nº 72 | Static data changed | Verify `MATCHES` array in `lib/static-data` has 72 entries |

Quarantine pattern (add to any flaky test):

```typescript
test("flaky: <description>", async ({ page }) => {
  test.fixme(true, "Flaky — issue #XX");
});
```

---

## 7. CI/CD integration (GitHub Actions)

```yaml
# .github/workflows/e2e.yml
name: E2E

on:
  push:
    branches: [main]
  pull_request:

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm dlx playwright install chromium --with-deps
      - run: pnpm dlx playwright test --project=chromium
        env:
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

Add `SUPABASE_SERVICE_ROLE_KEY` as a GitHub repository secret.

---

## 8. Success criteria

| Metric | Target |
|---|---|
| Critical journeys passing | 100% (tests 1–9) |
| Overall pass rate | ≥ 95% across 3 consecutive CI runs |
| Flaky rate | < 5% |
| Total duration | < 3 minutes (Chromium only, headless, prod) |
| Artifacts | HTML report + JUnit XML uploaded on every run |
