/**
 * Bolão Neca & Yomar — E2E golden-path suite
 * Target: https://bolao-neca-yomar.vercel.app
 *
 * Auth strategy: Supabase Admin API
 *   POST /auth/v1/admin/users        → create test user
 *   POST /auth/v1/admin/generate_link → mint magic-link (type=magiclink)
 *   DELETE /auth/v1/admin/users/:id  → cleanup
 *
 * Run: pnpm dlx playwright test --project=chromium
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = "https://bolao-neca-yomar.vercel.app";
const SUPABASE_URL = "https://sdqgosoavqqyhzizptrx.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TEST_EMAIL = `pw-test-${Date.now()}@bolao-test.local`;

// ── Supabase Admin helpers ────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      ...(options.headers ?? {}),
    },
  });
}

async function createTestUser(email: string): Promise<AdminUser> {
  const res = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      email_confirm: true,
      password: `Pw!${Math.random().toString(36).slice(2)}`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createTestUser failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  return { id: data.id, email: data.email };
}

async function generateMagicLink(email: string): Promise<string> {
  const res = await adminFetch("/auth/v1/admin/generate_link", {
    method: "POST",
    body: JSON.stringify({ type: "magiclink", email }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`generateMagicLink failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  // Supabase returns action_link (full redirect URL) or properties.action_link
  const link: string =
    data.action_link ??
    data.properties?.action_link ??
    data.data?.action_link ??
    "";
  if (!link) throw new Error(`No action_link in response: ${JSON.stringify(data)}`);
  return link;
}

async function setHostFlag(userId: string, isHost: boolean): Promise<void> {
  const res = await adminFetch(`/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ host: isHost }),
    headers: { Prefer: "return=minimal" },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.text();
    throw new Error(`setHostFlag failed ${res.status}: ${body}`);
  }
}

async function deleteTestUser(userId: string): Promise<void> {
  await adminFetch(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
}

// ── Shared state across tests that need auth ──────────────────────────────────

let testUser: AdminUser | null = null;

// ── Public page tests (no auth) ───────────────────────────────────────────────

test.describe("Public pages — golden path", () => {
  test("1. / — title 'O Bolão' and CTA 'Entrar agora' visible", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/bolão/i, { ignoreCase: true });

    // h1 contains "O Bolão"
    const h1 = page.locator("h1").filter({ hasText: "O Bolão" });
    await expect(h1).toBeVisible();

    // CTA button/link
    const cta = page.getByRole("link", { name: /entrar agora/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/m/login");
  });

  test("2. /grupos — 12 group cards (Grupo A … Grupo L)", async ({ page }) => {
    await page.goto("/grupos");

    // Each card shows "Grupo" label + a letter — count containers
    // Cards render a span with the group letter (A-L) styled next to "Grupo" text
    const groupHeaders = page.locator("text=Grupo").filter({ hasNotText: "Grupo A" });

    // Simpler: count elements that contain "Grupo" next to a single uppercase letter
    // The DOM pattern is: span "Grupo" + span with the letter, inside a card div
    const cards = page.locator('[class*="border"][class*="flex-col"]').filter({
      has: page.locator('span:text-matches("^[A-L]$")'),
    });

    // Fall back to counting occurrences of "Grupo " + letter pattern
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    for (const letter of letters) {
      // Each card has a visually prominent letter rendered alone in a span
      await expect(
        page.locator(`span.font-cond`).filter({ hasText: new RegExp(`^${letter}$`) }).first()
      ).toBeVisible();
    }

    // Confirm heading text
    await expect(page.getByText("Quem joga com quem")).toBeVisible();
  });

  test("3. /tabela — 'Nº 01' and 'Nº 72' present", async ({ page }) => {
    await page.goto("/tabela");

    // Game IDs are rendered as "nº 01" / "nº 72" (case-insensitive via font-mono)
    await expect(page.getByText(/nº 01/i).first()).toBeVisible();
    await expect(page.getByText(/nº 72/i).first()).toBeVisible();
  });

  test("4. /regulamento — 'As nove regras' heading present", async ({ page }) => {
    await page.goto("/regulamento");

    // h2 contains "As nove" + "regras"
    await expect(page.locator("h2").filter({ hasText: /as nove/i })).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: /regras/i })).toBeVisible();
  });

  test("5. /ranking — shows ranking row or empty state", async ({ page }) => {
    await page.goto("/ranking");

    // Either empty-state text or at least one ranking row (1º, 2º…)
    const hasRows = await page.locator("text=/[1-9]º/").count();
    const hasEmpty =
      (await page.getByText(/sem palpiteiros/i).count()) +
      (await page.getByText(/ainda sem palpiteiros/i).count());

    expect(hasRows + hasEmpty).toBeGreaterThan(0);
  });

  test("6. /m/login — empty email submit shows error or redirects with ?error=", async ({
    page,
  }) => {
    await page.goto("/m/login");

    // Try to submit without email — HTML5 required fires client-side, but
    // if JS bypasses it the server redirects with ?error=
    // Trigger native form validation first
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Attempt submit with blank value via JS to bypass HTML5 required
    await emailInput.fill("");
    await page.evaluate(() => {
      const form = document.querySelector("form") as HTMLFormElement;
      // Remove required attribute to test server-side path
      const input = form.querySelector('input[name="email"]') as HTMLInputElement;
      input.removeAttribute("required");
    });
    await page.locator('button[type="submit"]').click();

    // After submit: either browser validation prevents it (stays on /m/login)
    // OR server redirects back with ?error= query param
    await page.waitForURL(/\/(m\/login|\?error=)/, { timeout: 15_000 });

    const url = page.url();
    const onLoginPage = url.includes("/m/login");
    expect(onLoginPage).toBe(true);

    // If error param present, error div should be visible
    if (url.includes("error=")) {
      await expect(page.locator(".text-red-700").first()).toBeVisible();
    }
  });
});

// ── Authenticated tests ───────────────────────────────────────────────────────

test.describe("Authenticated user flow", () => {
  let userId: string;
  let authedContext: BrowserContext;
  let authedPage: Page;

  test.beforeAll(async ({ browser }) => {
    if (!SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY not set — cannot run auth tests");
    }

    // Create test user
    testUser = await createTestUser(TEST_EMAIL);
    userId = testUser.id;

    // Mint magic link
    const magicLink = await generateMagicLink(TEST_EMAIL);

    // Navigate to magic link in a fresh browser context
    authedContext = await browser.newContext({
      baseURL: BASE_URL,
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    authedPage = await authedContext.newPage();

    // Follow the magic link — Supabase exchanges the token and redirects
    await authedPage.goto(magicLink, { waitUntil: "networkidle" });

    // After auth exchange, we should land on /m/palpite
    await authedPage.waitForURL(/\/(m\/palpite|m\/login)/, { timeout: 30_000 });
  });

  test.afterAll(async () => {
    if (userId) await deleteTestUser(userId);
    await authedPage?.close();
    await authedContext?.close();
  });

  test("7. magic-link session — lands on /m/palpite and shows cartela", async () => {
    const url = authedPage.url();
    expect(url).toContain("/m/palpite");

    // Page should show the cartela heading
    await expect(authedPage.getByText(/próximos/i).first()).toBeVisible();
  });

  test("8. /m/palpite — click '1' on first match, button shows selected state", async () => {
    await authedPage.goto(`${BASE_URL}/m/palpite`);
    await authedPage.waitForLoadState("networkidle");

    // Pick buttons are labelled "1", "X", "2" — grab first "1" button
    const pickButtons = authedPage.locator("button").filter({ hasText: /^1$/ });
    const firstPickOne = pickButtons.first();
    await expect(firstPickOne).toBeVisible();

    // Click it
    await firstPickOne.click();

    // After click the button background changes to the group colour (non-transparent)
    // We assert the inline style has a non-empty background (not "transparent")
    await authedPage.waitForTimeout(500); // brief wait for React state
    const bg = await firstPickOne.evaluate((el) => (el as HTMLElement).style.background);
    expect(bg).not.toBe("transparent");
    expect(bg).not.toBe("");
  });

  test("9. /admin without host=true — shows 'Não autorizado'", async () => {
    await authedPage.goto(`${BASE_URL}/admin`);
    await expect(authedPage.getByText(/não autorizado/i)).toBeVisible();
  });

  test("10. promote to host, /admin accessible, ranking reflects", async () => {
    // Promote test user to host
    await setHostFlag(userId, true);

    // Reload /admin
    await authedPage.goto(`${BASE_URL}/admin`);
    await authedPage.waitForLoadState("networkidle");

    // Should NOT see "Não autorizado"
    const notAuthorized = await authedPage.getByText(/não autorizado/i).count();
    expect(notAuthorized).toBe(0);

    // Admin page header
    await expect(authedPage.getByText(/administração/i).first()).toBeVisible();

    // Verify /ranking loads without error (user is now in DB)
    await authedPage.goto(`${BASE_URL}/ranking`);
    await authedPage.waitForLoadState("networkidle");

    // Page should render ranking structure
    await expect(authedPage.locator("main")).toBeVisible();

    // Demote back for cleanup correctness
    await setHostFlag(userId, false);
  });
});
