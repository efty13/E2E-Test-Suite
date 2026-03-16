import { test } from '@playwright/test';

test.describe('save() debug — create vs edit', () => {
  const logs: string[] = [];

  test.beforeEach(({ page }) => {
    page.on('console', (msg) => {
      if (msg.text().includes('BookingModal')) logs.push(msg.text());
    });
  });

  test('CREATE mode — save() field values', async ({ page }) => {
    await page.goto('/bookings');
    await page.getByTestId('booking-new-button').click();

    await page.getByTestId('booking-model-select').selectOption('Alice Martin');
    await page.getByTestId('booking-client-select').selectOption('Vogue Paris');
    await page.getByTestId('booking-date-input').fill('2026-09-20');
    await page.getByTestId('booking-time-input').fill('11:30');
    await page.getByTestId('booking-notes-input').fill('create-debug-test');

    logs.length = 0;
    await page.getByTestId('booking-save-button').click();
    await page.waitForTimeout(300);

    console.log('\n=== CREATE mode save() logs ===');
    logs.forEach((l) => console.log(l));
  });

  test('EDIT mode — save() field values (seed booking #1)', async ({ page }) => {
    await page.goto('/bookings/1');
    await page.getByTestId('booking-edit-button').click();

    // Değerleri değiştirmeden doğrudan kaydet
    logs.length = 0;
    await page.getByTestId('booking-save-button').click();
    await page.waitForTimeout(300);

    console.log('\n=== EDIT mode save() logs (unchanged) ===');
    logs.forEach((l) => console.log(l));
  });
});
