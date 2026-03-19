/**
 * Manuel portfolio akış testi — 12 madde sırasıyla kontrol edilir.
 * Her adımda screenshot alınır.
 */
import { test, expect } from '@playwright/test';

const SS = (name: string) => `screenshots/portfolio/${name}.png`;

test.use({ headless: false, launchOptions: { slowMo: 500 } });

test.beforeAll(async ({}, testInfo) => {
  // screenshot klasörü yoksa playwright otomatik oluşturuyor
  testInfo.setTimeout(120_000);
});

// ─── 1. Talent listesi sayfası açılıyor mu ───────────────────────────────────
test('01 · Talent listesi sayfası açılır', async ({ page }) => {
  await page.goto('/portfolio');
  await expect(page.getByTestId('talent-page')).toBeVisible();
  await page.screenshot({ path: SS('01-talent-page-opens'), fullPage: true });
});

// ─── 2. En az 6 talent card'ı görünüyor mu ───────────────────────────────────
test('02 · En az 6 talent card görünür', async ({ page }) => {
  await page.goto('/portfolio');
  const checkboxes = page.getByTestId('talent-checkbox');
  await expect(checkboxes).toHaveCount(6);
  await page.screenshot({ path: SS('02-six-talent-cards'), fullPage: true });
});

// ─── 3. Her card'da checkbox var mı ──────────────────────────────────────────
test('03 · Her card içinde checkbox var', async ({ page }) => {
  await page.goto('/portfolio');
  const checkboxes = await page.getByTestId('talent-checkbox').all();
  for (const cb of checkboxes) {
    await expect(cb).toBeVisible();
  }
  await page.screenshot({ path: SS('03-checkboxes-visible'), fullPage: true });
});

// ─── 4. Checkbox'lar aynı testid ile alınabiliyor mu ─────────────────────────
test('04 · Tüm checkbox\'lar talent-checkbox testid ile alınır', async ({ page }) => {
  await page.goto('/portfolio');
  const all = page.getByTestId('talent-checkbox');
  await expect(all).toHaveCount(6);
  await page.screenshot({ path: SS('04-same-testid'), fullPage: true });
});

// ─── 5. talent-label'lar görünüyor mu ────────────────────────────────────────
test('05 · Her card içinde talent-label görünür', async ({ page }) => {
  await page.goto('/portfolio');
  const labels = await page.getByTestId('talent-label').all();
  expect(labels.length).toBe(6);
  for (const lbl of labels) {
    await expect(lbl).toBeVisible();
    const text = await lbl.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  }
  await page.screenshot({ path: SS('05-talent-labels'), fullPage: true });
});

// ─── 6. 3 farklı talent seçilebiliyor mu ─────────────────────────────────────
test('06 · 3 talent seçilebilir (checkbox + parent label DOM)', async ({ page }) => {
  await page.goto('/portfolio');
  const checkboxes = await page.getByTestId('talent-checkbox').all();

  // Checkbox → parent label → talent-label okuma
  const names: string[] = [];
  for (const cb of checkboxes) {
    const label = await cb.locator('..').getByTestId('talent-label').textContent();
    names.push(label?.trim() ?? '');
  }

  // İlk 3 talent'ı seç
  await checkboxes[0].click();
  await checkboxes[1].click();
  await checkboxes[2].click();

  expect(names[0]).toBeTruthy();
  expect(names[1]).toBeTruthy();
  expect(names[2]).toBeTruthy();

  await page.screenshot({ path: SS('06-three-selected'), fullPage: true });

  // Seçili olduklarını doğrula
  await expect(checkboxes[0]).toBeChecked();
  await expect(checkboxes[1]).toBeChecked();
  await expect(checkboxes[2]).toBeChecked();
  await expect(checkboxes[3]).not.toBeChecked();
});

// ─── 7. Toolbar seçim sayısı doğru güncelleniyor mu ──────────────────────────
test('07 · Toolbar seçim sayısı güncellenir', async ({ page }) => {
  await page.goto('/portfolio');
  const count = page.getByTestId('talent-selected-count');
  const checkboxes = await page.getByTestId('talent-checkbox').all();

  await expect(count).toContainText('0');

  await checkboxes[0].click();
  await expect(count).toContainText('1');

  await checkboxes[1].click();
  await expect(count).toContainText('2');

  await checkboxes[2].click();
  await expect(count).toContainText('3');

  await page.screenshot({ path: SS('07-toolbar-count-3'), fullPage: true });
});

// ─── 8. "Paket Oluştur" butonu çalışıyor mu ───────────────────────────────────
test('08 · Paket Oluştur butonu 0 seçimde disabled, seçim sonrası aktif', async ({ page }) => {
  await page.goto('/portfolio');
  const btn = page.getByTestId('talent-create-package-button');

  // 0 seçim → disabled
  await expect(btn).toBeDisabled();
  await page.screenshot({ path: SS('08a-button-disabled'), fullPage: true });

  // Bir talent seç → aktif
  await page.getByTestId('talent-checkbox').first().click();
  await expect(btn).toBeEnabled();
  await page.screenshot({ path: SS('08b-button-enabled'), fullPage: true });
});

// ─── 9. Portfolio Package sayfasına yönleniyor mu ─────────────────────────────
test('09 · Paket Oluştur → /portfolio/package sayfasına gider', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByTestId('talent-checkbox').first().click();
  await page.getByTestId('talent-create-package-button').click();
  await expect(page).toHaveURL('/portfolio/package');
  await expect(page.getByTestId('package-page')).toBeVisible();
  await page.screenshot({ path: SS('09-navigated-to-package'), fullPage: true });
});

// ─── 10. Seçilen talentlar package sayfasında card olarak görünüyor mu ─────────
test('10 · Seçilen talentlar package kartı olarak görünür', async ({ page }) => {
  await page.goto('/portfolio');
  const checkboxes = await page.getByTestId('talent-checkbox').all();

  // Ayşe Yılmaz, Mehmet Kara, Zeynep Demir → ilk 3
  await checkboxes[0].click();
  await checkboxes[1].click();
  await checkboxes[2].click();

  await page.getByTestId('talent-create-package-button').click();
  await expect(page).toHaveURL('/portfolio/package');

  const cards = page.getByTestId('package-card');
  await expect(cards).toHaveCount(3);
  await page.screenshot({ path: SS('10-package-has-3-cards'), fullPage: true });
});

// ─── 11. Her package card'ında isim ve foto var mı ────────────────────────────
test('11 · Package card\'larında label ve photo var', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByTestId('talent-checkbox').first().click();
  await page.getByTestId('talent-create-package-button').click();

  const card = page.getByTestId('package-card').first();
  await expect(card.getByTestId('package-talent-label')).toBeVisible();
  await expect(card.getByTestId('package-talent-photo')).toBeVisible();
  await page.screenshot({ path: SS('11-card-has-label-and-photo'), fullPage: true });
});

// ─── 12. Seçilmeyen talentlar package sayfasında görünmüyor mu ────────────────
test('12 · Seçilmeyen talentlar package sayfasında görünmez', async ({ page }) => {
  await page.goto('/portfolio');
  const checkboxes = await page.getByTestId('talent-checkbox').all();

  // Sadece ilk 2'yi seç (4, 5, 6 numara seçilmemeli)
  await checkboxes[0].click();
  await checkboxes[1].click();

  // 3. ve sonraki checkbox'lar seçili değil
  await expect(checkboxes[2]).not.toBeChecked();
  await expect(checkboxes[3]).not.toBeChecked();
  await expect(checkboxes[4]).not.toBeChecked();
  await expect(checkboxes[5]).not.toBeChecked();

  await page.getByTestId('talent-create-package-button').click();
  await expect(page).toHaveURL('/portfolio/package');

  // Sadece 2 kart görünmeli
  const cards = page.getByTestId('package-card');
  await expect(cards).toHaveCount(2);

  // Seçilenlerin adlarını oku ve doğrula
  const labels = await page.getByTestId('package-talent-label').allTextContents();
  expect(labels).toHaveLength(2);

  await page.screenshot({ path: SS('12-unselected-not-shown'), fullPage: true });
});
