import { test, expect } from '@playwright/test';

// Seed datada olmayan bir tarih + saat kombinasyonu kullanıyoruz
// ki ilk booking başarıyla oluşsun.
const BOOKING = {
  model: 'Alice Martin',
  client: 'Vogue Paris',
  date: '2026-11-05',
  time: '14:00',
  notes: 'conflict-test-ilk',
};

const BOOKING_DUPLICATE = {
  model: 'Alice Martin',     // aynı model
  client: 'H&M Studio',     // farklı client — yine de conflict sayılmalı
  date: '2026-11-05',       // aynı tarih
  time: '14:00',            // aynı saat
  notes: 'conflict-test-ikinci',
};

const BOOKING_DIFFERENT_TIME = {
  model: 'Alice Martin',    // aynı model
  client: 'Nike Creative',
  date: '2026-11-05',       // aynı tarih
  time: '16:00',            // farklı saat → izin verilmeli
  notes: 'conflict-test-farkli-saat',
};

// Listedeki Türkçe tarih formatı (booking-list.component'in ürettiği)
const EXPECTED_DATE = '5 Kasım 2026';

async function fillAndSave(
  page: import('@playwright/test').Page,
  booking: typeof BOOKING,
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

test.describe('Double Booking Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByTestId('booking-page')).toBeVisible();
  });

  // ─── Test 1: İlk booking başarıyla oluşturulur ───────────────────────────

  test('ilk booking başarıyla oluşturulur', async ({ page }) => {
    await fillAndSave(page, BOOKING);

    // Modal kapanmalı
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Listede görünmeli — benzersiz tarihle filtrele (seed datada bu tarih yok)
    await expect(
      page.getByTestId('booking-list-item').filter({ hasText: EXPECTED_DATE }),
    ).toBeVisible();
  });

  // ─── Test 2: Aynı model + tarih + saat → conflict hatası ─────────────────

  test('aynı model + tarih + saat ile ikinci booking oluşturulamaz ve hata gösterilir', async ({ page }) => {
    // Önce ilk booking'i oluştur
    await fillAndSave(page, BOOKING);
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Başlangıçta kaç booking-list-item var?
    const countBefore = await page.getByTestId('booking-list-item').count();

    // Aynı model + tarih + saat, farklı client ile ikinci deneme
    await fillAndSave(page, BOOKING_DUPLICATE);

    // Modal açık kalmalı (conflict → kapanmaz)
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // Conflict hata mesajı görünmeli
    await expect(page.getByTestId('booking-conflict-error')).toBeVisible();
    await expect(page.getByTestId('booking-conflict-error')).toContainText(
      'Bu model için seçilen tarih ve saatte zaten bir booking var.',
    );

    // Listeye yeni kayıt eklenmemiş olmalı
    await page.getByTestId('booking-cancel-button').click();
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();
    await expect(page.getByTestId('booking-list-item')).toHaveCount(countBefore);
  });

  // ─── Test 3: Conflict sonrası alan değişikliği hatayı sıfırlar ───────────

  test('conflict hatası alan değiştirilince temizlenir', async ({ page }) => {
    // İlk booking oluştur
    await fillAndSave(page, BOOKING);
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Çakışan ikinci deneme
    await fillAndSave(page, BOOKING_DUPLICATE);
    await expect(page.getByTestId('booking-conflict-error')).toBeVisible();

    // Tarih alanını değiştir → hata gitmeli
    await page.getByTestId('booking-date-input').fill('2026-12-01');
    await expect(page.getByTestId('booking-conflict-error')).not.toBeVisible();
  });

  // ─── Test 4: Aynı model, farklı saat → izin verilir ─────────────────────

  test('aynı model + aynı tarih ama farklı saat ile booking oluşturulabilir', async ({ page }) => {
    // İlk booking oluştur
    await fillAndSave(page, BOOKING);
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Farklı saatte ikinci booking
    await fillAndSave(page, BOOKING_DIFFERENT_TIME);

    // Modal kapanmalı (conflict yok)
    await expect(page.getByTestId('booking-modal')).not.toBeVisible();

    // Conflict hatası gösterilmemeli
    await expect(page.getByTestId('booking-conflict-error')).not.toBeVisible();

    // Her iki booking listede görünmeli — EXPECTED_DATE (5 Kasım 2026) ile filtrele
    // Seed datadaki Alice Martin farklı tarihte (10 Nisan 2026) → çakışmaz
    const items = page.getByTestId('booking-list-item').filter({ hasText: EXPECTED_DATE });
    await expect(items).toHaveCount(2);
  });
});
