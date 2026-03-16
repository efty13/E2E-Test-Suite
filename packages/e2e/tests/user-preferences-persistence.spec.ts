import { test, expect, Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function clearAndOpen(page: Page): Promise<void> {
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

// ─── Test ─────────────────────────────────────────────────────────────────────

test.describe('User Preferences — localStorage Persistence Regression', () => {

  test.beforeEach(async ({ page }) => {
    await clearAndOpen(page);
  });

  test('tercihler değiştirilir, reload sonrası UI ve localStorage tutarlı kalır', async ({ page }) => {

    // ── BÖLÜM 1: Değişiklikleri yap ──────────────────────────────────────────

    // 2. Temayı koyu yap
    await page.getByTestId('settings-theme-dark').click();

    // 3. Dili İngilizce yap
    await page.getByTestId('settings-language-select').selectOption('en');

    // 4. Bildirimleri kapat (email + push varsayılan açık, sms kapalı)
    await page.getByTestId('settings-notif-email-toggle').click();
    await page.getByTestId('settings-notif-push-toggle').click();
    // SMS zaten kapalı — dokunmuyoruz

    // ── BÖLÜM 2: Reload öncesi UI doğrulama ──────────────────────────────────

    // 5a. Tema: koyu aktif, açık pasif
    await expect(page.getByTestId('settings-theme-dark'))
      .toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-theme-light'))
      .toHaveAttribute('aria-pressed', 'false');

    // 5b. Dil: English seçili
    await expect(page.getByTestId('settings-language-select'))
      .toHaveValue('en');

    // 5c. Tüm bildirimler kapalı
    await expect(page.getByTestId('settings-notif-email-toggle'))
      .toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-notif-push-toggle'))
      .toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-notif-sms-toggle'))
      .toHaveAttribute('aria-checked', 'false');

    // ── BÖLÜM 3: Reload öncesi localStorage doğrulama ────────────────────────

    const beforeReload = await readStorage(page);

    expect(beforeReload).not.toBeNull();
    expect(beforeReload.theme).toBe('dark');
    expect(beforeReload.language).toBe('en');
    expect(beforeReload.notifications.email).toBe(false);
    expect(beforeReload.notifications.push).toBe(false);
    expect(beforeReload.notifications.sms).toBe(false);

    // ── BÖLÜM 4: Reload ──────────────────────────────────────────────────────

    // 6. Sayfayı yenile
    await page.reload();
    await expect(page.getByTestId('settings-page')).toBeVisible();

    // ── BÖLÜM 5: Reload sonrası UI doğrulama ─────────────────────────────────

    // 7a. Tema hâlâ koyu
    await expect(page.getByTestId('settings-theme-dark'))
      .toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('settings-theme-light'))
      .toHaveAttribute('aria-pressed', 'false');

    // 7b. Dil hâlâ İngilizce
    await expect(page.getByTestId('settings-language-select'))
      .toHaveValue('en');

    // 7c. Bildirimler hâlâ kapalı
    await expect(page.getByTestId('settings-notif-email-toggle'))
      .toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-notif-push-toggle'))
      .toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-notif-sms-toggle'))
      .toHaveAttribute('aria-checked', 'false');

    // ── BÖLÜM 6: Reload sonrası localStorage ↔ UI tutarlılık doğrulama ───────

    // 8. Raw localStorage verisini oku
    const afterReload = await readStorage(page);

    // 9. localStorage ↔ UI eşleşmesi
    expect(afterReload.theme).toBe('dark');
    const uiTheme = await page.getByTestId('settings-theme-dark').getAttribute('aria-pressed');
    expect(uiTheme).toBe('true');
    expect(afterReload.theme === 'dark' && uiTheme === 'true').toBe(true);

    expect(afterReload.language).toBe('en');
    const uiLang = await page.getByTestId('settings-language-select').inputValue();
    expect(uiLang).toBe('en');
    expect(afterReload.language === uiLang).toBe(true);

    expect(afterReload.notifications.email).toBe(false);
    const uiEmail = await page.getByTestId('settings-notif-email-toggle').getAttribute('aria-checked');
    expect(uiEmail).toBe('false');
    expect(String(afterReload.notifications.email) === uiEmail).toBe(true);

    expect(afterReload.notifications.push).toBe(false);
    const uiPush = await page.getByTestId('settings-notif-push-toggle').getAttribute('aria-checked');
    expect(uiPush).toBe('false');
    expect(String(afterReload.notifications.push) === uiPush).toBe(true);

    expect(afterReload.notifications.sms).toBe(false);
    const uiSms = await page.getByTestId('settings-notif-sms-toggle').getAttribute('aria-checked');
    expect(uiSms).toBe('false');
    expect(String(afterReload.notifications.sms) === uiSms).toBe(true);
  });
});
