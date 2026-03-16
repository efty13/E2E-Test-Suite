/**
 * Talent Profile Management — manuel UI gezinti testi
 * Her interaktif akışı adım adım test eder, screenshot alır.
 */
import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({ headless: false, launchOptions: { slowMo: 500 } });

const SS = (name: string) =>
  path.join('screenshots', 'profile', `${name}.png`);

// Test görseli: 1×1 kırmızı piksel PNG (base64)
// setInputFiles için gerçek bir dosya oluşturuyoruz
const TEST_IMAGE_PATH = path.join('/tmp', 'test-profile-photo.png');
const RED_1PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

test.beforeAll(() => {
  fs.mkdirSync(path.join('screenshots', 'profile'), { recursive: true });
  fs.writeFileSync(TEST_IMAGE_PATH, RED_1PX_PNG);
});

// ─── Yardımcı: localStorage temizle ──────────────────────────────────────────
async function clearStorage(page: Page) {
  await page.goto('/talents');
  await page.evaluate(() => localStorage.removeItem('talent-profiles'));
  await page.reload();
}

// ─── Yardımcı: profil formu doldur ───────────────────────────────────────────
async function fillProfileForm(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    height?: string;
    weight?: string;
    eyeColor?: string;
    hairColor?: string;
    withPhoto?: boolean;
  },
) {
  await page.getByTestId('profile-first-name-input').fill(data.firstName);
  await page.getByTestId('profile-last-name-input').fill(data.lastName);
  if (data.height)    await page.getByTestId('profile-height-input').fill(data.height);
  if (data.weight)    await page.getByTestId('profile-weight-input').fill(data.weight);
  if (data.eyeColor)  await page.getByTestId('profile-eye-color-input').fill(data.eyeColor);
  if (data.hairColor) await page.getByTestId('profile-hair-color-input').fill(data.hairColor);
  if (data.withPhoto) {
    await page.getByTestId('profile-photo-input').setInputFiles(TEST_IMAGE_PATH);
    await expect(page.getByTestId('profile-photo-preview')).toBeVisible();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════

test('01 — /talents boş state görünümü', async ({ page }) => {
  await clearStorage(page);
  await expect(page.getByTestId('profile-page')).toBeVisible();
  await expect(page.getByTestId('profile-new-button')).toBeVisible();
  await page.screenshot({ path: SS('01-list-empty'), fullPage: true });
});

test('02 — Yeni Profil butonuna tıklayınca form sayfası açılır', async ({ page }) => {
  await clearStorage(page);
  await page.getByTestId('profile-new-button').click();
  await expect(page).toHaveURL('/talents/new');
  await expect(page.getByTestId('profile-form')).toBeVisible();
  await page.screenshot({ path: SS('02-form-empty'), fullPage: true });
});

test('03 — Boş formda Kaydet → validation hatası, sayfada kalır', async ({ page }) => {
  await page.goto('/talents/new');
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-form-error')).toBeVisible();
  await expect(page).toHaveURL('/talents/new');
  await page.screenshot({ path: SS('03-form-validation-error'), fullPage: true });
});

test('04 — Form doldurulur, Kaydet → detay sayfasına yönlendirilir', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');

  await fillProfileForm(page, {
    firstName: 'Zeynep',
    lastName: 'Arslan',
    height: '172',
    weight: '58',
    eyeColor: 'Yeşil',
    hairColor: 'Koyu Kahve',
  });

  await page.screenshot({ path: SS('04a-form-filled'), fullPage: true });
  await page.getByTestId('profile-save-button').click();

  await expect(page).toHaveURL(/\/talents\/\d+$/);
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  await page.screenshot({ path: SS('04b-after-save-detail'), fullPage: true });
});

test('05 — Detay sayfasında tüm alanlar doğru görünür', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, {
    firstName: 'Zeynep',
    lastName: 'Arslan',
    height: '172',
    weight: '58',
    eyeColor: 'Yeşil',
    hairColor: 'Koyu Kahve',
  });
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  await expect(page.getByTestId('profile-detail-first-name')).toHaveText('Zeynep');
  await expect(page.getByTestId('profile-detail-last-name')).toHaveText('Arslan');
  await expect(page.getByTestId('profile-detail-height')).toContainText('172');
  await expect(page.getByTestId('profile-detail-weight')).toContainText('58');
  await expect(page.getByTestId('profile-detail-eye-color')).toHaveText('Yeşil');
  await expect(page.getByTestId('profile-detail-hair-color')).toHaveText('Koyu Kahve');

  await page.screenshot({ path: SS('05-detail-fields-verified'), fullPage: true });
});

test('06 — Profil fotoğrafı yüklenir, preview img render edilir', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');

  await fillProfileForm(page, {
    firstName: 'Photo',
    lastName: 'Test',
    withPhoto: true,
  });

  // Preview img görünür ve src dolu
  const preview = page.getByTestId('profile-photo-preview');
  await expect(preview).toBeVisible();
  const src = await preview.getAttribute('src');
  expect(src).toMatch(/^data:image\//);

  await page.screenshot({ path: SS('06a-photo-preview'), fullPage: true });

  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  // Detay sayfasında da fotoğraf görünür
  await expect(page.getByTestId('profile-detail-photo')).toBeVisible();
  await page.screenshot({ path: SS('06b-detail-with-photo'), fullPage: true });
});

test('07 — Detaydan Geri dönünce profil listede görünür', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, { firstName: 'Zeynep', lastName: 'Arslan' });
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  await page.getByTestId('profile-back-button').click();

  await expect(page).toHaveURL('/talents');
  await expect(page.getByTestId('profile-page')).toBeVisible();
  await expect(
    page.getByTestId('profile-card').filter({ hasText: 'Zeynep Arslan' }),
  ).toBeVisible();

  await page.screenshot({ path: SS('07-back-to-list-with-profile'), fullPage: true });
});

test('08 — Listeden profile kartına tıklanınca detay sayfası açılır', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, { firstName: 'Zeynep', lastName: 'Arslan' });
  await page.getByTestId('profile-save-button').click();
  await page.getByTestId('profile-back-button').click();
  await expect(page.getByTestId('profile-page')).toBeVisible();

  await page.getByTestId('profile-card').filter({ hasText: 'Zeynep Arslan' }).click();

  await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  await expect(page).toHaveURL(/\/talents\/\d+$/);
  await page.screenshot({ path: SS('08-list-click-to-detail'), fullPage: true });
});

test('09 — Profil düzenlenir ve güncel hali detayda görünür', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, {
    firstName: 'Zeynep',
    lastName: 'Arslan',
    height: '172',
    eyeColor: 'Yeşil',
  });
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  // Düzenle butonuna tıkla
  await page.getByTestId('profile-edit-button').click();
  await expect(page).toHaveURL(/\/talents\/\d+\/edit$/);
  await expect(page.getByTestId('profile-form')).toBeVisible();
  await page.screenshot({ path: SS('09a-edit-form-prefilled'), fullPage: true });

  // Alanları güncelle
  await page.getByTestId('profile-first-name-input').fill('Zeynep');
  await page.getByTestId('profile-last-name-input').fill('Arslan');
  await page.getByTestId('profile-height-input').fill('175');
  await page.getByTestId('profile-hair-color-input').fill('Siyah');

  await page.getByTestId('profile-save-button').click();

  await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  await expect(page.getByTestId('profile-detail-height')).toContainText('175');
  await expect(page.getByTestId('profile-detail-hair-color')).toHaveText('Siyah');

  await page.screenshot({ path: SS('09b-after-edit-detail'), fullPage: true });
});

test('10 — Profil silinir, listeye döner ve profil artık yok', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, { firstName: 'Silinecek', lastName: 'Profil' });
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  await page.screenshot({ path: SS('10a-before-delete'), fullPage: true });

  await page.getByTestId('profile-delete-button').click();

  await expect(page).toHaveURL('/talents');
  await expect(page.getByTestId('profile-page')).toBeVisible();
  await expect(
    page.getByTestId('profile-card').filter({ hasText: 'Silinecek Profil' }),
  ).not.toBeVisible();

  await page.screenshot({ path: SS('10b-after-delete-list'), fullPage: true });
});

test('11 — localStorage persistence: sayfa yenileme sonrası veriler korunur', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await fillProfileForm(page, {
    firstName: 'Kalıcı',
    lastName: 'Veri',
    height: '168',
    eyeColor: 'Mavi',
  });
  await page.getByTestId('profile-save-button').click();
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();

  // Detay URL'ini kaydet, sayfayı yenile
  const url = page.url();
  await page.reload();

  // Yenileme sonrası aynı profil hâlâ görünür
  await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  await expect(page.getByTestId('profile-detail-first-name')).toHaveText('Kalıcı');
  await expect(page.getByTestId('profile-detail-last-name')).toHaveText('Veri');
  await expect(page.getByTestId('profile-detail-height')).toContainText('168');
  await expect(page.getByTestId('profile-detail-eye-color')).toHaveText('Mavi');

  await page.screenshot({ path: SS('11-after-reload-persisted'), fullPage: true });
  expect(page.url()).toBe(url);
});

test('12 — İptal butonu yeni profil formundan listeye geri döner', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/talents/new');
  await expect(page.getByTestId('profile-form')).toBeVisible();

  await page.getByTestId('profile-cancel-button').click();

  await expect(page).toHaveURL('/talents');
  await expect(page.getByTestId('profile-page')).toBeVisible();
  await page.screenshot({ path: SS('12-cancel-back-to-list'), fullPage: true });
});

test('13 — Çoklu profil eklenir, listede hepsi görünür', async ({ page }) => {
  await clearStorage(page);

  const profiles = [
    { firstName: 'Ayşe', lastName: 'Kaya', height: '168' },
    { firstName: 'James', lastName: 'Whitfield', height: '182' },
    { firstName: 'Sofia', lastName: 'Ferreira', height: '170' },
  ];

  for (const p of profiles) {
    await page.goto('/talents/new');
    await fillProfileForm(page, p);
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  }

  await page.goto('/talents');
  await expect(page.getByTestId('profile-card')).toHaveCount(3);

  for (const p of profiles) {
    await expect(
      page.getByTestId('profile-card').filter({ hasText: `${p.firstName} ${p.lastName}` }),
    ).toBeVisible();
  }

  await page.screenshot({ path: SS('13-multi-profile-list'), fullPage: true });
});
