import { test, expect } from '@playwright/test';

// ─── Test verisi ──────────────────────────────────────────────────────────────
// Seed datada bu tarih + saat kombinasyonu yok → izolasyon garantili.

const FIRST_BOOKING = {
  model: 'Alice Martin',
  client: 'Vogue Paris',
  date: '2026-03-15',
  time: '10:00',
  notes: 'ilk booking',
};

const DUPLICATE_BOOKING = {
  model: 'Alice Martin',     // aynı model   ← conflict koşulu
  client: 'H&M Studio',     // farklı client — iş kuralı gereği hâlâ conflict
  date: '2026-03-15',       // aynı tarih    ← conflict koşulu
  time: '10:00',            // aynı saat     ← conflict koşulu
  notes: 'cakisma denemesi',
};

const DIFFERENT_TIME_BOOKING = {
  model: 'Alice Martin',    // aynı model
  client: 'Nike Creative',
  date: '2026-03-15',       // aynı tarih
  time: '14:00',            // farklı saat → conflict olmamalı
  notes: 'farkli saat testi',
};

const DIFFERENT_MODEL_BOOKING = {
  model: 'Kenji Tanaka',    // farklı model → conflict olmamalı
  client: 'Gucci',
  date: '2026-03-15',       // aynı tarih
  time: '10:00',            // aynı saat
  notes: 'farkli model testi',
};

// Listedeki Türkçe tarih formatı: new Date('2026-03-15') → '15 Mart 2026'
const EXPECTED_DATE = '15 Mart 2026';

// ─── Yardımcı: modal açıp formu doldur, Kaydet'e bas ─────────────────────────
async function openModalAndSubmit(
  page: import('@playwright/test').Page,
  booking: typeof FIRST_BOOKING,
) {
  await page.getByTestId('booking-new-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();

  await page.getByTestId('booking-model-select').selectOption(booking.model);
  await page.getByTestId('booking-client-select').selectOption(booking.client);
  await page.getByTestId('booking-date-input').fill(booking.date);
  await page.getByTestId('booking-time-input').fill(booking.time);
  await page.getByTestId('booking-notes-input').fill(booking.notes);

  await page.getByTestId('booking-save-button').click();
}

// ─── Test grubu ───────────────────────────────────────────────────────────────

test.describe('Double Booking Prevention — Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByTestId('booking-page')).toBeVisible();
  });

  // ─── Ana senaryo: conflict engellenir ──────────────────────────────────────
  test('aynı model + aynı tarih + aynı saat ile ikinci booking engellenir', async ({ page }) => {
    // 1. İlk booking'i oluştur
    await openModalAndSubmit(page, FIRST_BOOKING);

    // 2. Modal kapanmalı — ilk booking başarılı
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // 3. İlk booking listede görünür
    const firstItem = page
      .getByTestId('booking-list-item')
      .filter({ hasText: EXPECTED_DATE })
      .filter({ hasText: FIRST_BOOKING.model });
    await expect(firstItem).toBeVisible();

    // 4. Mevcut item sayısını kaydet
    const countBefore = await page.getByTestId('booking-list-item').count();

    // 5. Conflict booking'i oluşturmayı dene (aynı model + tarih + saat, farklı client)
    await openModalAndSubmit(page, DUPLICATE_BOOKING);

    // 6. Modal AÇIK KALMALI — kayıt engellendi
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // 7. Conflict hata mesajı görünür
    await expect(page.getByTestId('booking-conflict-error')).toBeVisible();

    // 8. Hata mesajı içeriği doğru
    await expect(page.getByTestId('booking-conflict-error')).toHaveText(
      'Bu model için seçilen tarih ve saatte zaten bir booking var.',
    );

    // 9. Modali kapat
    await page.getByTestId('booking-cancel-button').click();
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // 10. Booking list item sayısı artmamış
    const countAfter = await page.getByTestId('booking-list-item').count();
    expect(countAfter).toBe(countBefore);

    // 11. Conflict booking'in client'ı listede görünmüyor
    // (aynı model + tarih kombinasyonuyla ancak farklı client olan kayıt eklenmemeli)
    const conflictItem = page
      .getByTestId('booking-list-item')
      .filter({ hasText: DUPLICATE_BOOKING.client })
      .filter({ hasText: EXPECTED_DATE });
    await expect(conflictItem).not.toBeVisible();
  });

  // ─── Ek senaryo 1: aynı model + farklı saat → izin verilir ───────────────
  test('aynı model + aynı tarih + farklı saat ile booking oluşturulabilir', async ({ page }) => {
    // İlk booking
    await openModalAndSubmit(page, FIRST_BOOKING);
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    const countBefore = await page.getByTestId('booking-list-item').count();

    // Farklı saatte ikinci booking
    await openModalAndSubmit(page, DIFFERENT_TIME_BOOKING);

    // Modal kapanmalı — conflict yok
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Conflict hatası görünmemeli
    await expect(page.getByTestId('booking-conflict-error')).not.toBeVisible();

    // Liste bir kayıt artmış olmalı
    const countAfter = await page.getByTestId('booking-list-item').count();
    expect(countAfter).toBe(countBefore + 1);

    // Her iki booking de listede görünür
    const itemsOnDate = page
      .getByTestId('booking-list-item')
      .filter({ hasText: EXPECTED_DATE })
      .filter({ hasText: FIRST_BOOKING.model });
    await expect(itemsOnDate).toHaveCount(2);
  });

  // ─── Ek senaryo 2: farklı model + aynı saat → izin verilir ───────────────
  test('farklı model + aynı tarih + aynı saat ile booking oluşturulabilir', async ({ page }) => {
    // İlk booking
    await openModalAndSubmit(page, FIRST_BOOKING);
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    const countBefore = await page.getByTestId('booking-list-item').count();

    // Farklı modelde ikinci booking (aynı tarih + saat)
    await openModalAndSubmit(page, DIFFERENT_MODEL_BOOKING);

    // Modal kapanmalı — conflict yok
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Conflict hatası görünmemeli
    await expect(page.getByTestId('booking-conflict-error')).not.toBeVisible();

    // Liste bir kayıt artmış olmalı
    const countAfter = await page.getByTestId('booking-list-item').count();
    expect(countAfter).toBe(countBefore + 1);

    // İkinci model listede görünür
    const differentModelItem = page
      .getByTestId('booking-list-item')
      .filter({ hasText: DIFFERENT_MODEL_BOOKING.model })
      .filter({ hasText: EXPECTED_DATE });
    await expect(differentModelItem).toBeVisible();
  });
});
