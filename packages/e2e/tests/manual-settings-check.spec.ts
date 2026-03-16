import { test, expect, Page } from '@playwright/test';

test.use({ headless: false, launchOptions: { slowMo: 400 } });

const SS = (name: string) => `screenshots/settings/${name}.png`;

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

async function clearAndOpen(page: Page) {
  await page.goto('/settings');
  await page.evaluate(() => localStorage.removeItem('user-preferences'));
  await page.reload();
  await expect(page.getByTestId('settings-page')).toBeVisible();
}

async function readStorage(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('user-preferences');
    return raw ? JSON.parse(raw) : null;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Settings — 11-Madde Kontrol Listesi', () => {

  // ── 1. Ayarlar sayfası açılıyor mu ─────────────────────────────────────────
  test('01 — Ayarlar sayfası açılır', async ({ page }) => {
    await clearAndOpen(page);

    await expect(page.getByTestId('settings-page')).toBeVisible();
    await expect(page).toHaveURL('/settings');
    await page.screenshot({ path: SS('01-page-opens'), fullPage: true });
  });

  // ── 2. Tema seçimi çalışıyor mu ────────────────────────────────────────────
  test('02 — Tema seçimi çalışır', async ({ page }) => {
    await clearAndOpen(page);

    // Başlangıç: light aktif
    await expect(page.getByTestId('settings-theme-light')).toHaveAttribute('aria-pressed', 'true');

    // Dark'a geç
    await page.getByTestId('settings-theme-dark').click();
    await expect(page.getByTestId('settings-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-theme-light')).toHaveAttribute('aria-pressed', 'false');

    // Light'a geri geç
    await page.getByTestId('settings-theme-light').click();
    await expect(page.getByTestId('settings-theme-light')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-theme-dark')).toHaveAttribute('aria-pressed', 'false');

    await page.screenshot({ path: SS('02-theme-toggle-works'), fullPage: true });
  });

  // ── 3. Dil seçimi çalışıyor mu ─────────────────────────────────────────────
  test('03 — Dil seçimi çalışır', async ({ page }) => {
    await clearAndOpen(page);

    await expect(page.getByTestId('settings-language-select')).toHaveValue('tr');

    await page.getByTestId('settings-language-select').selectOption('en');
    await expect(page.getByTestId('settings-language-select')).toHaveValue('en');

    await page.getByTestId('settings-language-select').selectOption('tr');
    await expect(page.getByTestId('settings-language-select')).toHaveValue('tr');

    await page.screenshot({ path: SS('03-language-toggle-works'), fullPage: true });
  });

  // ── 4. Bildirim toggle'ları çalışıyor mu ───────────────────────────────────
  test('04 — Bildirim toggle\'ları çalışır', async ({ page }) => {
    await clearAndOpen(page);

    // Email: true → false → true
    await expect(page.getByTestId('settings-notif-email-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('settings-notif-email-toggle').click();
    await expect(page.getByTestId('settings-notif-email-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('settings-notif-email-toggle').click();
    await expect(page.getByTestId('settings-notif-email-toggle')).toHaveAttribute('aria-checked', 'true');

    // Push: true → false
    await page.getByTestId('settings-notif-push-toggle').click();
    await expect(page.getByTestId('settings-notif-push-toggle')).toHaveAttribute('aria-checked', 'false');

    // SMS: false → true
    await page.getByTestId('settings-notif-sms-toggle').click();
    await expect(page.getByTestId('settings-notif-sms-toggle')).toHaveAttribute('aria-checked', 'true');

    await page.screenshot({ path: SS('04-notification-toggles-work'), fullPage: true });
  });

  // ── 5. Tema "koyu" seçilince UI yansıtıyor mu ──────────────────────────────
  test('05 — Koyu tema seçilince UI bunu yansıtır', async ({ page }) => {
    await clearAndOpen(page);

    await page.getByTestId('settings-theme-dark').click();

    // Koyu butonu seçili görünüyor (aria-pressed + Aktif rozeti)
    await expect(page.getByTestId('settings-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-theme-light')).toHaveAttribute('aria-pressed', 'false');

    // "Aktif" rozeti koyu butonun içinde görünür
    const darkBtn = page.getByTestId('settings-theme-dark');
    await expect(darkBtn.getByTestId('settings-theme-active-label')).toBeVisible();
    await expect(darkBtn.getByTestId('settings-theme-active-label')).toHaveText('Aktif');

    // Açık butonunda "Aktif" rozeti YOK
    const lightBtn = page.getByTestId('settings-theme-light');
    await expect(lightBtn.getByTestId('settings-theme-active-label')).not.toBeVisible();

    await page.screenshot({ path: SS('05-dark-theme-ui-reflects'), fullPage: true });
  });

  // ── 6. Dil "English" seçilince UI yansıtıyor mu ────────────────────────────
  test('06 — English seçilince UI bunu yansıtır', async ({ page }) => {
    await clearAndOpen(page);

    await page.getByTestId('settings-language-select').selectOption('en');

    await expect(page.getByTestId('settings-language-select')).toHaveValue('en');

    // Select'in görünen metni "English" olmalı
    const selectedText = await page.getByTestId('settings-language-select').evaluate(
      (el: HTMLSelectElement) => el.options[el.selectedIndex].text,
    );
    expect(selectedText).toBe('English');

    await page.screenshot({ path: SS('06-english-ui-reflects'), fullPage: true });
  });

  // ── 7. Bildirimler kapatılınca UI yansıtıyor mu ────────────────────────────
  test('07 — Bildirim kapatılınca toggle UI\'ı yansıtır', async ({ page }) => {
    await clearAndOpen(page);

    // Email kapat
    await page.getByTestId('settings-notif-email-toggle').click();
    await expect(page.getByTestId('settings-notif-email-toggle')).toHaveAttribute('aria-checked', 'false');

    // Push kapat
    await page.getByTestId('settings-notif-push-toggle').click();
    await expect(page.getByTestId('settings-notif-push-toggle')).toHaveAttribute('aria-checked', 'false');

    // SMS zaten kapalı
    await expect(page.getByTestId('settings-notif-sms-toggle')).toHaveAttribute('aria-checked', 'false');

    await page.screenshot({ path: SS('07-notifications-off-ui-reflects'), fullPage: true });
  });

  // ── 8. localStorage gerçekten güncelleniyor mu ─────────────────────────────
  test('08 — Her değişiklik localStorage\'a yazılır', async ({ page }) => {
    await clearAndOpen(page);

    // Başta localStorage null (temizlendi)
    const initial = await readStorage(page);
    expect(initial).toBeNull();

    // Tema dark yap
    await page.getByTestId('settings-theme-dark').click();
    const afterTheme = await readStorage(page);
    expect(afterTheme).not.toBeNull();
    expect(afterTheme.theme).toBe('dark');

    // Dil en yap
    await page.getByTestId('settings-language-select').selectOption('en');
    const afterLang = await readStorage(page);
    expect(afterLang.language).toBe('en');

    // SMS aç
    await page.getByTestId('settings-notif-sms-toggle').click();
    const afterSms = await readStorage(page);
    expect(afterSms.notifications.sms).toBe(true);

    // Email kapat
    await page.getByTestId('settings-notif-email-toggle').click();
    const afterEmail = await readStorage(page);
    expect(afterEmail.notifications.email).toBe(false);

    await page.screenshot({ path: SS('08-localstorage-updates'), fullPage: true });
  });

  // ── 9. Sayfa yenilenince seçimler korunuyor mu ─────────────────────────────
  test('09 — Sayfa yenilenince tüm seçimler korunur', async ({ page }) => {
    await clearAndOpen(page);

    // Değiştir
    await page.getByTestId('settings-theme-dark').click();
    await page.getByTestId('settings-language-select').selectOption('en');
    await page.getByTestId('settings-notif-sms-toggle').click();
    await page.getByTestId('settings-notif-email-toggle').click();

    // Yenile
    await page.reload();
    await expect(page.getByTestId('settings-page')).toBeVisible();

    // Hepsi korundu mu?
    await expect(page.getByTestId('settings-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-language-select')).toHaveValue('en');
    await expect(page.getByTestId('settings-notif-sms-toggle')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('settings-notif-email-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-notif-push-toggle')).toHaveAttribute('aria-checked', 'true');

    await page.screenshot({ path: SS('09-persists-after-reload'), fullPage: true });
  });

  // ── 10. Uygulama yeniden açılınca localStorage'dan state restore ediliyor mu
  test('10 — Yeni sekme açılınca localStorage\'dan state restore edilir', async ({ page, context }) => {
    // Mevcut sayfada ayarları yap
    await clearAndOpen(page);
    await page.getByTestId('settings-theme-dark').click();
    await page.getByTestId('settings-language-select').selectOption('en');
    await page.getByTestId('settings-notif-sms-toggle').click();

    // LocalStorage değerlerini doğrula
    const stored = await readStorage(page);
    expect(stored.theme).toBe('dark');
    expect(stored.language).toBe('en');
    expect(stored.notifications.sms).toBe(true);

    // Yeni sekme aç (aynı origin → aynı localStorage)
    const newPage = await context.newPage();
    await newPage.goto('/settings');
    await expect(newPage.getByTestId('settings-page')).toBeVisible();

    // Yeni sekmede state restore edildi mi?
    await expect(newPage.getByTestId('settings-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    await expect(newPage.getByTestId('settings-language-select')).toHaveValue('en');
    await expect(newPage.getByTestId('settings-notif-sms-toggle')).toHaveAttribute('aria-checked', 'true');

    await newPage.screenshot({ path: SS('10-restored-in-new-tab'), fullPage: true });
    await newPage.close();
  });

  // ── 11. UI state ile localStorage birbiriyle tutarlı mı ───────────────────
  test('11 — UI state ve localStorage her zaman tutarlı', async ({ page }) => {
    await clearAndOpen(page);

    // Adım 1: Dark tema → UI ve storage eşleşiyor mu?
    await page.getByTestId('settings-theme-dark').click();
    let storage = await readStorage(page);
    let uiDarkPressed = await page.getByTestId('settings-theme-dark').getAttribute('aria-pressed');
    expect(uiDarkPressed).toBe('true');
    expect(storage.theme).toBe('dark');

    // Adım 2: English → UI ve storage eşleşiyor mu?
    await page.getByTestId('settings-language-select').selectOption('en');
    storage = await readStorage(page);
    const uiLangValue = await page.getByTestId('settings-language-select').inputValue();
    expect(uiLangValue).toBe('en');
    expect(storage.language).toBe('en');

    // Adım 3: SMS aç → UI ve storage eşleşiyor mu?
    await page.getByTestId('settings-notif-sms-toggle').click();
    storage = await readStorage(page);
    const uiSmsChecked = await page.getByTestId('settings-notif-sms-toggle').getAttribute('aria-checked');
    expect(uiSmsChecked).toBe('true');
    expect(storage.notifications.sms).toBe(true);

    // Adım 4: Reset → UI ve storage eşleşiyor mu?
    await page.getByTestId('settings-reset-button').click();
    storage = await readStorage(page);
    const uiThemeAfterReset = await page.getByTestId('settings-theme-light').getAttribute('aria-pressed');
    const uiLangAfterReset  = await page.getByTestId('settings-language-select').inputValue();
    const uiSmsAfterReset   = await page.getByTestId('settings-notif-sms-toggle').getAttribute('aria-checked');
    expect(uiThemeAfterReset).toBe('true');
    expect(storage.theme).toBe('light');
    expect(uiLangAfterReset).toBe('tr');
    expect(storage.language).toBe('tr');
    expect(uiSmsAfterReset).toBe('false');
    expect(storage.notifications.sms).toBe(false);

    await page.screenshot({ path: SS('11-ui-storage-consistent'), fullPage: true });
  });

});
