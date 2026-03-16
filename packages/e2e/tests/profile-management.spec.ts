import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// ─── Test görseli ─────────────────────────────────────────────────────────────
// setInputFiles için /tmp'ye gerçek bir PNG dosyası yazıyoruz.
// 1×1 kırmızı piksel PNG — minimal ama geçerli bir görsel.
const TEST_IMAGE_PATH = path.join('/tmp', 'pw-talent-photo.png');
const RED_1PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

test.beforeAll(() => {
  fs.writeFileSync(TEST_IMAGE_PATH, RED_1PX_PNG);
});

// ─── Sabit test verisi ────────────────────────────────────────────────────────
const PROFILE = {
  firstName:  'Ceren',
  lastName:   'Yıldız',
  height:     '170',
  weight:     '56',
  eyeColor:   'Ela',
  hairColor:  'Kumral',
};

const UPDATED = {
  hairColor: 'Siyah',
  weight:    '60',
};

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

/** Her test için temiz bir slate: localStorage sıfırla, listeye git. */
async function resetState(page: Page): Promise<void> {
  await page.goto('/talents');
  await page.evaluate(() => localStorage.removeItem('talent-profiles'));
  await page.reload();
  await expect(page.getByTestId('profile-page')).toBeVisible();
}

/** Profil formunu tamamen doldur (fotoğraf hariç). */
async function fillForm(
  page: Page,
  data: Partial<typeof PROFILE>,
): Promise<void> {
  if (data.firstName !== undefined)
    await page.getByTestId('profile-first-name-input').fill(data.firstName);
  if (data.lastName !== undefined)
    await page.getByTestId('profile-last-name-input').fill(data.lastName);
  if (data.height !== undefined)
    await page.getByTestId('profile-height-input').fill(data.height);
  if (data.weight !== undefined)
    await page.getByTestId('profile-weight-input').fill(data.weight);
  if (data.eyeColor !== undefined)
    await page.getByTestId('profile-eye-color-input').fill(data.eyeColor);
  if (data.hairColor !== undefined)
    await page.getByTestId('profile-hair-color-input').fill(data.hairColor);
}

// ─── Test grubu ───────────────────────────────────────────────────────────────

test.describe('Profile Management + Photo Upload — Complex E2E', () => {
  test.beforeEach(async ({ page }) => {
    await resetState(page);
  });

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║ TEST 1 — Eksik alan validasyonu                                         ║
  // ╚══════════════════════════════════════════════════════════════════════════╝
  test('Soyad boş bırakılınca kayıt gerçekleşmez, hata mesajı gösterilir', async ({ page }) => {
    // 1. Yeni profil formuna git
    await page.getByTestId('profile-new-button').click();
    await expect(page).toHaveURL('/talents/new');
    await expect(page.getByTestId('profile-form')).toBeVisible();

    // 2. Ad ve diğer alanları doldur — soyad KASITLI boş bırakılıyor
    await page.getByTestId('profile-first-name-input').fill(PROFILE.firstName);
    await page.getByTestId('profile-height-input').fill(PROFILE.height);
    await page.getByTestId('profile-eye-color-input').fill(PROFILE.eyeColor);

    // 3. Kaydet'e bas
    await page.getByTestId('profile-save-button').click();

    // ✔ Hata mesajı görünür
    await expect(page.getByTestId('profile-form-error')).toBeVisible();
    await expect(page.getByTestId('profile-form-error')).toContainText(
      'Ad ve Soyad alanları zorunludur',
    );

    // ✔ Hâlâ form sayfasındayız — yönlendirme olmadı
    await expect(page).toHaveURL('/talents/new');

    // ✔ Listeye gidince kayıt eklenmemiş
    await page.goto('/talents');
    await expect(page.getByTestId('profile-page')).toBeVisible();
    await expect(page.getByTestId('profile-card')).toHaveCount(0);
  });

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║ TEST 2 — Profil oluşturma + fotoğraf yükleme + liste doğrulama          ║
  // ╚══════════════════════════════════════════════════════════════════════════╝
  test('Tüm alanlar + fotoğraf ile profil oluşturulur ve listede görünür', async ({ page }) => {
    // 1. Yeni profil formuna git
    await page.getByTestId('profile-new-button').click();
    await expect(page).toHaveURL('/talents/new');
    await expect(page.getByTestId('profile-form')).toBeVisible();

    // 2. Formu doldur
    await fillForm(page, PROFILE);

    // 3. Fotoğraf yükle — setInputFiles ile
    await page.getByTestId('profile-photo-input').setInputFiles(TEST_IMAGE_PATH);

    // 4. Fotoğraf preview'i doğrula
    //    - img elementi render edildi
    //    - src data URL formatında (base64 file read başarılı)
    await expect(page.getByTestId('profile-photo-preview')).toBeVisible();
    const previewSrc = await page.getByTestId('profile-photo-preview').getAttribute('src');
    expect(previewSrc).toMatch(/^data:image\//);

    // 5. Profili kaydet
    await page.getByTestId('profile-save-button').click();

    // ✔ Detay sayfasına yönlendirildi
    await expect(page).toHaveURL(/\/talents\/\d+$/);
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // 6. Listeye dön
    await page.getByTestId('profile-back-button').click();
    await expect(page).toHaveURL('/talents');
    await expect(page.getByTestId('profile-page')).toBeVisible();

    // ✔ Listede tam olarak 1 kart var
    await expect(page.getByTestId('profile-card')).toHaveCount(1);

    // ✔ Kart doğru ismi gösteriyor
    const labels = await page.getByTestId('profile-label').allTextContents();
    expect(labels).toHaveLength(1);
    expect(labels[0]).toContain(PROFILE.firstName);
    expect(labels[0]).toContain(PROFILE.lastName);

    // 7. Karta tıklayınca detay sayfasına gidiliyor
    await page.getByTestId('profile-card').first().click();
    await expect(page).toHaveURL(/\/talents\/\d+$/);
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();
  });

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║ TEST 3 — Detay sayfasında tüm alan doğrulaması                          ║
  // ╚══════════════════════════════════════════════════════════════════════════╝
  test('Profil detay sayfasında tüm alanlar kayıtlı değerlerle eşleşir', async ({ page }) => {
    // Önkoşul: profil + fotoğraf ile oluştur
    await page.getByTestId('profile-new-button').click();
    await fillForm(page, PROFILE);
    await page.getByTestId('profile-photo-input').setInputFiles(TEST_IMAGE_PATH);
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // Listeden tıklayarak da aynı detay açılıyor mu diye doğrula
    await page.getByTestId('profile-back-button').click();
    await expect(page.getByTestId('profile-card')).toHaveCount(1);
    await page.getByTestId('profile-card').first().click();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // ✔ Her alan form'da girilen değerle birebir eşleşiyor
    await expect(page.getByTestId('profile-detail-first-name')).toHaveText(PROFILE.firstName);
    await expect(page.getByTestId('profile-detail-last-name')).toHaveText(PROFILE.lastName);
    await expect(page.getByTestId('profile-detail-height')).toContainText(PROFILE.height);
    await expect(page.getByTestId('profile-detail-weight')).toContainText(PROFILE.weight);
    await expect(page.getByTestId('profile-detail-eye-color')).toHaveText(PROFILE.eyeColor);
    await expect(page.getByTestId('profile-detail-hair-color')).toHaveText(PROFILE.hairColor);

    // ✔ Fotoğraf detay sayfasında da görünür ve tag'i img
    const detailPhoto = page.getByTestId('profile-detail-photo');
    await expect(detailPhoto).toBeVisible();
    const tagName = await detailPhoto.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('img');

    // ✔ URL pattern'i doğru
    await expect(page).toHaveURL(/\/talents\/\d+$/);
  });

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║ TEST 4 — Profil düzenleme + localStorage persistence                    ║
  // ╚══════════════════════════════════════════════════════════════════════════╝
  test('Düzenlenen alan kaydedilir ve sayfa yenilemesi sonrası persist eder', async ({ page }) => {
    // Önkoşul: profil oluştur
    await page.getByTestId('profile-new-button').click();
    await fillForm(page, PROFILE);
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // 11. Düzenle butonuna tıkla
    await page.getByTestId('profile-edit-button').click();
    await expect(page).toHaveURL(/\/talents\/\d+\/edit$/);
    await expect(page.getByTestId('profile-form')).toBeVisible();

    // ✔ Edit form'u orijinal değerlerle geldi (saç rengi)
    const hairInput = page.getByTestId('profile-hair-color-input');
    await expect(hairInput).toHaveValue(PROFILE.hairColor);

    // 12. İki alanı güncelle: saç rengi + kilo
    await page.getByTestId('profile-hair-color-input').fill(UPDATED.hairColor);
    await page.getByTestId('profile-weight-input').fill(UPDATED.weight);

    // Kaydet
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // ✔ Detay güncel değerleri gösteriyor
    await expect(page.getByTestId('profile-detail-hair-color')).toHaveText(UPDATED.hairColor);
    await expect(page.getByTestId('profile-detail-weight')).toContainText(UPDATED.weight);

    // ✔ Değiştirilmeyen alanlar bozulmadı
    await expect(page.getByTestId('profile-detail-first-name')).toHaveText(PROFILE.firstName);
    await expect(page.getByTestId('profile-detail-eye-color')).toHaveText(PROFILE.eyeColor);

    // 13. Sayfayı yenile (localStorage'dan yeniden yükle)
    await page.reload();
    await expect(page.getByTestId('profile-detail-page')).toBeVisible();

    // 14. Düzenlenen alanlar persist etti
    await expect(page.getByTestId('profile-detail-hair-color')).toHaveText(UPDATED.hairColor);
    await expect(page.getByTestId('profile-detail-weight')).toContainText(UPDATED.weight);

    // ✔ Diğer alanlar da sağlam
    await expect(page.getByTestId('profile-detail-first-name')).toHaveText(PROFILE.firstName);
    await expect(page.getByTestId('profile-detail-last-name')).toHaveText(PROFILE.lastName);
    await expect(page.getByTestId('profile-detail-height')).toContainText(PROFILE.height);
    await expect(page.getByTestId('profile-detail-eye-color')).toHaveText(PROFILE.eyeColor);
  });
});
