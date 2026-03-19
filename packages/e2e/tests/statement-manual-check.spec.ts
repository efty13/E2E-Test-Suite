import { test, expect } from '@playwright/test';

test.describe('Statement Page – Manual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statement');
  });

  // ────────────────────────────────────────────────
  // 1. Sayfa açılıyor mu?
  // ────────────────────────────────────────────────
  test('1 – sayfa açılıyor', async ({ page }) => {
    const root = page.getByTestId('statement-page');
    await expect(root).toBeVisible();
    console.log('✅ 1 PASS – statement-page görünür');
  });

  // ────────────────────────────────────────────────
  // 2. En az 3 booking item var mı?
  // ────────────────────────────────────────────────
  test('2 – en az 3 booking item görünüyor', async ({ page }) => {
    const items = page.getByTestId('statement-booking-item');
    await expect(items).toHaveCount(3);
    console.log('✅ 2 PASS – 3 booking item var');
  });

  // ────────────────────────────────────────────────
  // 3. Her booking fee görünür ve sayısal mı?
  // ────────────────────────────────────────────────
  test('3 – her booking fee okunabilir ve sayısal', async ({ page }) => {
    const fees = page.getByTestId('statement-booking-fee');
    const count = await fees.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const text = (await fees.nth(i).textContent()) ?? '';
      const value = parseFloat(text.trim());
      expect(isNaN(value)).toBe(false);
      expect(value).toBeGreaterThan(0);
      console.log(`  booking[${i}] fee = ${value}`);
    }
    console.log('✅ 3 PASS – tüm fee değerleri sayısal');
  });

  // ────────────────────────────────────────────────
  // 4. Expense formu görünüyor mu?
  // ────────────────────────────────────────────────
  test('4 – expense formu görünüyor', async ({ page }) => {
    await expect(page.getByTestId('statement-expense-form')).toBeVisible();
    await expect(page.getByTestId('statement-expense-description-input')).toBeVisible();
    await expect(page.getByTestId('statement-expense-amount-input')).toBeVisible();
    await expect(page.getByTestId('statement-expenseadd-button')).toBeVisible();
    console.log('✅ 4 PASS – expense formu ve alanları görünür');
  });

  // ────────────────────────────────────────────────
  // 5 & 6. Yeni expense eklenebiliyor mu, listede görünüyor mu?
  // ────────────────────────────────────────────────
  test('5 & 6 – expense eklenebiliyor ve listede görünüyor', async ({ page }) => {
    await page.getByTestId('statement-expense-description-input').fill('Studio Rental');
    await page.getByTestId('statement-expense-amount-input').fill('300');
    await page.getByTestId('statement-expenseadd-button').click();

    const expenseList = page.getByTestId('statement-expense-list');
    await expect(expenseList).toBeVisible();

    const items = page.getByTestId('statement-expense-item');
    await expect(items).toHaveCount(1);

    const label = page.getByTestId('statement-expense-label').first();
    const amount = page.getByTestId('statement-expense-amount').first();

    await expect(label).toHaveText('Studio Rental');
    const amountText = (await amount.textContent()) ?? '';
    expect(parseFloat(amountText.trim())).toBe(300);
    console.log('✅ 5 & 6 PASS – expense eklendi ve listede görünüyor');
  });

  // ────────────────────────────────────────────────
  // 7. Varsayılan komisyon oranı %20 mi?
  // ────────────────────────────────────────────────
  test('7 – varsayılan komisyon oranı %20', async ({ page }) => {
    const input = page.getByTestId('statement-commission-rate-input');
    await expect(input).toHaveValue('20');
    console.log('✅ 7 PASS – varsayılan komisyon %20');
  });

  // ────────────────────────────────────────────────
  // 8. Toplam gelir (totalFees) doğru mu?
  //    1000 + 2000 + 1500 = 4500
  // ────────────────────────────────────────────────
  test('8 – totalFees doğru (beklenen: 4500)', async ({ page }) => {
    const el = page.getByTestId('statement-total-fees');
    await expect(el).toBeVisible();
    const text = (await el.textContent()) ?? '';
    const value = parseFloat(text.trim());
    expect(value).toBe(4500);
    console.log(`✅ 8 PASS – totalFees = ${value}`);
  });

  // ────────────────────────────────────────────────
  // 9. Expense eklendikçe totalExpenses güncelleniyor mu?
  // ────────────────────────────────────────────────
  test('9 – totalExpenses expense eklendikçe güncelleniyor', async ({ page }) => {
    const el = page.getByTestId('statement-total-expenses');

    // Başlangıçta 0
    await expect(el).toHaveText('0');

    // İlk expense: 300
    await page.getByTestId('statement-expense-description-input').fill('Expense A');
    await page.getByTestId('statement-expense-amount-input').fill('300');
    await page.getByTestId('statement-expenseadd-button').click();
    await expect(el).toHaveText('300');

    // İkinci expense: 200
    await page.getByTestId('statement-expense-description-input').fill('Expense B');
    await page.getByTestId('statement-expense-amount-input').fill('200');
    await page.getByTestId('statement-expenseadd-button').click();
    await expect(el).toHaveText('500');

    console.log(`✅ 9 PASS – totalExpenses: 0 → 300 → 500`);
  });

  // ────────────────────────────────────────────────
  // 10. Komisyon oranı değişince komisyon tutarı güncelleniyor mu?
  //     totalFees=4500, %20 → 900, %25 → 1125, %15 → 675
  // ────────────────────────────────────────────────
  test('10 – komisyon oranı değişince commission güncelleniyor', async ({ page }) => {
    const rateInput = page.getByTestId('statement-commission-rate-input');
    const commEl = page.getByTestId('statement-commission-total');

    // %20 (default)
    const at20 = parseFloat(((await commEl.textContent()) ?? '').trim());
    expect(at20).toBe(900);
    console.log(`  %20 → commission = ${at20}`);

    // %25
    await rateInput.fill('25');
    await rateInput.dispatchEvent('input');
    await page.waitForTimeout(100);
    const at25 = parseFloat(((await commEl.textContent()) ?? '').trim());
    expect(at25).toBe(1125);
    console.log(`  %25 → commission = ${at25}`);

    // %15
    await rateInput.fill('15');
    await rateInput.dispatchEvent('input');
    await page.waitForTimeout(100);
    const at15 = parseFloat(((await commEl.textContent()) ?? '').trim());
    expect(at15).toBe(675);
    console.log(`  %15 → commission = ${at15}`);

    console.log('✅ 10 PASS – komisyon oranı değişince commission güncelleniyor');
  });

  // ────────────────────────────────────────────────
  // 11. Net tutar doğru hesaplanıyor mu?
  //     totalFees=4500, expense=0, %20 → net = 4500 - 0 - 900 = 3600
  // ────────────────────────────────────────────────
  test('11 – netAmount doğru hesaplanıyor (beklenen: 3600)', async ({ page }) => {
    const el = page.getByTestId('statement-net-amount');
    const value = parseFloat(((await el.textContent()) ?? '').trim());
    expect(value).toBe(3600);
    console.log(`✅ 11 PASS – netAmount = ${value}`);
  });

  // ────────────────────────────────────────────────
  // 12. %25 ve %15'te net tutar tutarlı mı?
  //     %25 → net = 4500 - 0 - 1125 = 3375
  //     %15 → net = 4500 - 0 - 675  = 3825
  // ────────────────────────────────────────────────
  test('12 – %25 ve %15 oranlarında netAmount tutarlı', async ({ page }) => {
    const rateInput = page.getByTestId('statement-commission-rate-input');
    const netEl = page.getByTestId('statement-net-amount');

    // %25
    await rateInput.fill('25');
    await rateInput.dispatchEvent('input');
    await page.waitForTimeout(100);
    const at25 = parseFloat(((await netEl.textContent()) ?? '').trim());
    expect(at25).toBe(3375);
    console.log(`  %25 → net = ${at25} (beklenen: 3375)`);

    // %15
    await rateInput.fill('15');
    await rateInput.dispatchEvent('input');
    await page.waitForTimeout(100);
    const at15 = parseFloat(((await netEl.textContent()) ?? '').trim());
    expect(at15).toBe(3825);
    console.log(`  %15 → net = ${at15} (beklenen: 3825)`);

    console.log('✅ 12 PASS – %25 ve %15 oranlarında netAmount tutarlı');
  });
});
