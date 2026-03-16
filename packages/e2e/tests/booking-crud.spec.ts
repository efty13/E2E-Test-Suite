import { test, expect } from '@playwright/test';

// Sabit test verisi.
// Tarih (2026-09-20) seed datada yok → listede ayırt etmek için benzersiz.
// Notes metni ek güvence sağlar (detay sayfasında doğrulanır).
const BOOKING = {
  model: 'Alice Martin',
  client: 'Vogue Paris',
  date: '2026-09-20',
  time: '11:30',
  notes: 'SMOKE-TEST-BOOKING-001',
};

const EXPECTED_DATE = '20 Eylül 2026';

// Booking'i form üzerinden oluşturan yardımcı fonksiyon.
// İki testte de aynı adımlar tekrarlanıyor, okunabilirlik için çıkarıldı.
async function createBooking(page: import('@playwright/test').Page) {
  await page.getByTestId('booking-new-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();

  await page.getByTestId('booking-model-select').selectOption(BOOKING.model);
  await page.getByTestId('booking-client-select').selectOption(BOOKING.client);
  await page.getByTestId('booking-date-input').fill(BOOKING.date);
  await page.getByTestId('booking-time-input').fill(BOOKING.time);
  await page.getByTestId('booking-notes-input').fill(BOOKING.notes);

  await page.getByTestId('booking-save-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();
}

test.describe('Booking CRUD — happy path smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByTestId('booking-page')).toBeVisible();
  });

  // ─── Test 1: Yeni booking oluşturma ve listede doğrulama ──────────────────

  test('yeni booking oluşturulur ve listede görünür', async ({ page }) => {
    await createBooking(page);

    // Seed datada Alice Martin / 2026-04-10 var; bizimki 2026-09-20 → EXPECTED_DATE ile ayırt ediyoruz
    const targetItem = page
      .getByTestId('booking-list-item')
      .filter({ hasText: EXPECTED_DATE });

    await expect(targetItem).toBeVisible();
    await expect(targetItem).toContainText(BOOKING.model);
    await expect(targetItem).toContainText(BOOKING.client);
    await expect(targetItem).toContainText(EXPECTED_DATE);
  });

  // ─── Test 2: Detay sayfası ve geri dönüş ─────────────────────────────────

  test('booking detayı doğru gösterilir ve geri dönünce liste korunur', async ({ page }) => {
    await createBooking(page);

    // Liste item'ını benzersiz tarih ile bul
    const targetItem = page
      .getByTestId('booking-list-item')
      .filter({ hasText: EXPECTED_DATE });

    await targetItem.click();

    // Detay sayfasına gidildi
    await expect(page.getByTestId('booking-detail-page')).toBeVisible();
    await expect(page).toHaveURL(/\/bookings\/\d+/);

    // Tüm alanlar formda girilenlerle eşleşiyor
    await expect(page.getByTestId('booking-detail-model')).toHaveText(BOOKING.model);
    await expect(page.getByTestId('booking-detail-client')).toHaveText(BOOKING.client);
    await expect(page.getByTestId('booking-detail-date')).toHaveText(EXPECTED_DATE);
    await expect(page.getByTestId('booking-detail-time')).toHaveText(BOOKING.time);
    await expect(page.getByTestId('booking-detail-notes')).toHaveText(BOOKING.notes);

    // Geri dön
    await page.getByTestId('booking-back-button').click();

    // Liste sayfasına döndük ve booking hâlâ görünür
    await expect(page.getByTestId('booking-page')).toBeVisible();
    await expect(page).toHaveURL('/bookings');
    await expect(
      page.getByTestId('booking-list-item').filter({ hasText: EXPECTED_DATE }),
    ).toBeVisible();
  });
});
