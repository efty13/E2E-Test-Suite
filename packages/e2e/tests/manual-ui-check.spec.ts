/**
 * Manuel UI gezinti testi — her interaktif elementi tek tek test eder,
 * her adımda screenshot alır.
 * Kalıcı bir test değil; UI review için çalıştırılır.
 */
import { test, expect } from '@playwright/test';

test.use({ headless: false, launchOptions: { slowMo: 600 } });

test('Nav: kullanıcılar sayfası açılır', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/users');
  await page.screenshot({ path: 'screenshots/01-users-page.png', fullPage: true });
});

test('Nav: talents sayfası açılır', async ({ page }) => {
  await page.goto('/talents');
  await page.screenshot({ path: 'screenshots/02-talents-page.png', fullPage: true });
});

test('Bookings: liste sayfası — seed data görünür', async ({ page }) => {
  await page.goto('/bookings');
  await expect(page.getByTestId('booking-page')).toBeVisible();
  await page.screenshot({ path: 'screenshots/03-booking-list.png', fullPage: true });
});

test('Bookings: Yeni Booking butonu modal açar', async ({ page }) => {
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();
  await page.screenshot({ path: 'screenshots/04-modal-empty.png', fullPage: true });
});

test('Bookings: boş formda Kaydet → validation hatası', async ({ page }) => {
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();
  await page.getByTestId('booking-save-button').click();
  await page.screenshot({ path: 'screenshots/05-modal-validation-error.png', fullPage: true });
});

test('Bookings: İptal butonu modali kapatır', async ({ page }) => {
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();
  await page.getByTestId('booking-cancel-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();
  await page.screenshot({ path: 'screenshots/06-modal-closed-by-cancel.png', fullPage: true });
});

test('Bookings: backdrop tıklaması modali kapatır', async ({ page }) => {
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();
  // Backdrop: fixed inset-0 z-40 — modal dışına tıkla
  await page.mouse.click(10, 10);
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();
  await page.screenshot({ path: 'screenshots/07-modal-closed-by-backdrop.png', fullPage: true });
});

test('Bookings: form doldur ve kaydet → listede görünür', async ({ page }) => {
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();

  await page.getByTestId('booking-model-select').selectOption('James Whitfield');
  await page.screenshot({ path: 'screenshots/08a-model-selected.png', fullPage: true });

  await page.getByTestId('booking-client-select').selectOption('Zara Campaign');
  await page.screenshot({ path: 'screenshots/08b-client-selected.png', fullPage: true });

  await page.getByTestId('booking-date-input').fill('2026-08-15');
  await page.getByTestId('booking-time-input').fill('09:00');
  await page.getByTestId('booking-notes-input').fill('Manuel UI testi — başarılı kayıt');
  await page.screenshot({ path: 'screenshots/08c-form-filled.png', fullPage: true });

  await page.getByTestId('booking-save-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();
  await page.screenshot({ path: 'screenshots/08d-after-save-list.png', fullPage: true });

  await expect(
    page.getByTestId('booking-list-item').filter({ hasText: '15 Ağustos 2026' }),
  ).toBeVisible();
});

test('Bookings: detay sayfası — tüm alanlar doğru', async ({ page }) => {
  await page.goto('/bookings/1');
  await expect(page.getByTestId('booking-detail-page')).toBeVisible();
  await page.screenshot({ path: 'screenshots/09a-detail-page.png', fullPage: true });

  await expect(page.getByTestId('booking-detail-model')).toBeVisible();
  await expect(page.getByTestId('booking-detail-client')).toBeVisible();
  await expect(page.getByTestId('booking-detail-date')).toBeVisible();
  await expect(page.getByTestId('booking-detail-time')).toBeVisible();
});

test('Bookings: detay → geri dön → liste', async ({ page }) => {
  await page.goto('/bookings/1');
  await page.getByTestId('booking-back-button').click();
  await expect(page).toHaveURL('/bookings');
  await page.screenshot({ path: 'screenshots/10-back-to-list.png', fullPage: true });
});

test('Bookings: detay → edit modal açılır ve değişiklik kaydedilir', async ({ page }) => {
  await page.goto('/bookings/1');
  await page.getByTestId('booking-edit-button').click();
  await expect(page.getByTestId('booking-modal')).toBeVisible();
  await page.screenshot({ path: 'screenshots/11a-edit-modal-open.png', fullPage: true });

  // Notu güncelle
  await page.getByTestId('booking-notes-input').fill('Manuel UI edit testi — güncellendi');
  await page.getByTestId('booking-save-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();
  await page.screenshot({ path: 'screenshots/11b-after-edit-save.png', fullPage: true });
});

test('Bookings: detay → delete → listeye döner ve kayıt yok', async ({ page }) => {
  // Önce yeni bir kayıt oluştur, onu sil (seed datayı bozmamak için)
  await page.goto('/bookings');
  await page.getByTestId('booking-new-button').click();
  await page.getByTestId('booking-model-select').selectOption('Amara Osei');
  await page.getByTestId('booking-client-select').selectOption("L'Oréal Paris");
  await page.getByTestId('booking-date-input').fill('2026-12-31');
  await page.getByTestId('booking-time-input').fill('23:00');
  await page.getByTestId('booking-save-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();

  // Oluşturulan kaydın detayına git
  await page.getByTestId('booking-list-item').filter({ hasText: '31 Aralık 2026' }).click();
  await expect(page.getByTestId('booking-detail-page')).toBeVisible();
  await page.screenshot({ path: 'screenshots/12a-before-delete.png', fullPage: true });

  await page.getByTestId('booking-delete-button').click();
  await page.screenshot({ path: 'screenshots/12b-after-delete.png', fullPage: true });

  await expect(page).toHaveURL('/bookings');
  await expect(
    page.getByTestId('booking-list-item').filter({ hasText: '31 Aralık 2026' }),
  ).not.toBeVisible();
});

test('Double Booking: conflict hatası gösterilir ve modal açık kalır', async ({ page }) => {
  await page.goto('/bookings');

  // İlk booking
  await page.getByTestId('booking-new-button').click();
  await page.getByTestId('booking-model-select').selectOption('Lukas Hoffmann');
  await page.getByTestId('booking-client-select').selectOption('Gucci');
  await page.getByTestId('booking-date-input').fill('2026-10-10');
  await page.getByTestId('booking-time-input').fill('11:00');
  await page.getByTestId('booking-save-button').click();
  await expect(page.getByTestId('booking-modal')).not.toBeVisible();

  // Çakışan ikinci booking
  await page.getByTestId('booking-new-button').click();
  await page.getByTestId('booking-model-select').selectOption('Lukas Hoffmann');
  await page.getByTestId('booking-client-select').selectOption('H&M Studio');
  await page.getByTestId('booking-date-input').fill('2026-10-10');
  await page.getByTestId('booking-time-input').fill('11:00');
  await page.getByTestId('booking-save-button').click();

  await expect(page.getByTestId('booking-modal')).toBeVisible();
  await expect(page.getByTestId('booking-conflict-error')).toBeVisible();
  await page.screenshot({ path: 'screenshots/13-conflict-error.png', fullPage: true });
});
