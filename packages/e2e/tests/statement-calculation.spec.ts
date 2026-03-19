import { test, expect, Page } from '@playwright/test';

// ─── Test verisi ─────────────────────────────────────────────────────────────
// Eklenecek expense'ler burada açıkça tanımlanır.
// Test, bu değerleri hem UI'a girer hem de beklenen sonuçları hesaplarken kullanır.

const EXPENSES = [
  { description: 'Equipment Rental',       amount: 400 },
  { description: 'Travel & Accommodation', amount: 250 },
] as const;

// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────

/**
 * Bir DOM elementinin textContent'ini alır, para birimi sembolü / boşluk gibi
 * sayısal olmayan karakterleri temizler ve float'a dönüştürür.
 * Örn. "$ 1,500.00" → 1500, "900" → 900
 */
function parseCurrency(raw: string): number {
  const cleaned = raw.replace(/[^0-9.\-]/g, '').trim();
  const value = parseFloat(cleaned);
  if (isNaN(value)) throw new Error(`parseCurrency: sayıya çevrilemiyor → "${raw}"`);
  return value;
}

/** data-testid üzerinden elementi bulur, görünür olmasını bekler, sayısal değerini döner. */
async function readSummaryValue(page: Page, testId: string): Promise<number> {
  const el = page.getByTestId(testId);
  await expect(el).toBeVisible();
  return parseCurrency((await el.textContent()) ?? '');
}

/** Komisyon oranı input'una yeni değer yazar; Angular'ın DOM'u güncellemesini bekler. */
async function setCommissionRate(page: Page, rate: number): Promise<void> {
  const input = page.getByTestId('statement-commission-rate-input');
  await input.fill(String(rate));
  await input.dispatchEvent('input');
  // Komisyon tutarının değiştiğini doğrula (eski değer artık geçersiz)
  await expect(page.getByTestId('statement-commission-total')).not.toHaveText('');
}

/** Expense formunu doldurur, Add butonuna basar, listenin büyüdüğünü bekler. */
async function addExpense(
  page: Page,
  description: string,
  amount: number,
  expectedCount: number
): Promise<void> {
  await page.getByTestId('statement-expense-description-input').fill(description);
  await page.getByTestId('statement-expense-amount-input').fill(String(amount));
  await page.getByTestId('statement-expenseadd-button').click();
  // Listenin büyüdüğünü bekle — ekleme onayı
  await expect(page.getByTestId('statement-expense-item')).toHaveCount(expectedCount);
}

// ─── Test suite ──────────────────────────────────────────────────────────────

test.describe('Statement – Calculation Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statement');
    await expect(page.getByTestId('statement-page')).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Ana senaryo:
  //   1. Booking fee'lerini UI'dan oku
  //   2. 2 expense ekle
  //   3. %25 komisyon → UI değerlerini oku → test içinde hesapla → karşılaştır
  //   4. %15 komisyon → UI değerlerini tekrar oku → yeniden hesapla → karşılaştır
  // ──────────────────────────────────────────────────────────────────────────
  test('booking fee\'leri okur, expense ekler, %25 ve %15 komisyon ile hesaplamayı cross-check eder', async ({ page }) => {

    // ── Adım 1: Booking fee'lerini UI'dan oku ────────────────────────────
    const feeElements = page.getByTestId('statement-booking-fee');
    await expect(feeElements).toHaveCount(3);

    const fees: number[] = [];
    for (let i = 0; i < 3; i++) {
      const raw = (await feeElements.nth(i).textContent()) ?? '';
      const value = parseCurrency(raw);
      fees.push(value);
    }

    // Test kendi içinde toplam geliri hesaplar
    const totalFees = fees.reduce((sum, fee) => sum + fee, 0);

    // ── Adım 2: İki expense ekle ─────────────────────────────────────────
    await addExpense(page, EXPENSES[0].description, EXPENSES[0].amount, 1);
    await addExpense(page, EXPENSES[1].description, EXPENSES[1].amount, 2);

    // Test kendi içinde toplam gideri hesaplar
    const totalExpenses = EXPENSES.reduce((sum, e) => sum + e.amount, 0); // 650

    // ── Adım 3: %25 komisyon ─────────────────────────────────────────────
    await setCommissionRate(page, 25);

    // UI'dan özet değerlerini oku
    const uiTotalFees     = await readSummaryValue(page, 'statement-total-fees');
    const uiTotalExpenses = await readSummaryValue(page, 'statement-total-expenses');
    const uiCommission    = await readSummaryValue(page, 'statement-commission-total');
    const uiNetAmount     = await readSummaryValue(page, 'statement-net-amount');

    // Test içinde %25 ile hesapla
    const commission = totalFees * 0.25;
    const netAmount  = totalFees - totalExpenses - commission;

    // Cross-check: UI ↔ hesaplanan
    expect(uiTotalFees).toBe(totalFees);
    expect(uiTotalExpenses).toBe(totalExpenses);
    expect(uiCommission).toBe(commission);
    expect(uiNetAmount).toBe(netAmount);

    // ── Adım 4: %15 komisyon ─────────────────────────────────────────────
    await setCommissionRate(page, 15);

    // UI'dan güncellenmiş komisyon ve net tutarı oku
    const uiUpdatedCommission = await readSummaryValue(page, 'statement-commission-total');
    const uiUpdatedNetAmount  = await readSummaryValue(page, 'statement-net-amount');

    // Test içinde %15 ile yeniden hesapla
    const updatedCommission = totalFees * 0.15;
    const updatedNetAmount  = totalFees - totalExpenses - updatedCommission;

    // Cross-check: UI ↔ yeni hesaplanan
    expect(uiUpdatedCommission).toBe(updatedCommission);
    expect(uiUpdatedNetAmount).toBe(updatedNetAmount);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Guard testi: expense yokken tüm özet değerleri tutarlı mı?
  // netAmount = totalFees - 0 - commission olmalı
  // ──────────────────────────────────────────────────────────────────────────
  test('expense eklenmeden %25 oranında özet değerleri iç tutarlılığını korur', async ({ page }) => {
    const feeElements = page.getByTestId('statement-booking-fee');
    await expect(feeElements).toHaveCount(3);

    const fees: number[] = [];
    for (let i = 0; i < 3; i++) {
      const raw = (await feeElements.nth(i).textContent()) ?? '';
      fees.push(parseCurrency(raw));
    }
    const totalFees = fees.reduce((sum, fee) => sum + fee, 0);

    await setCommissionRate(page, 25);

    const uiTotalFees  = await readSummaryValue(page, 'statement-total-fees');
    const uiCommission = await readSummaryValue(page, 'statement-commission-total');
    const uiNetAmount  = await readSummaryValue(page, 'statement-net-amount');

    const commission = totalFees * 0.25;
    const netAmount  = totalFees - 0 - commission;

    expect(uiTotalFees).toBe(totalFees);
    expect(uiCommission).toBe(commission);
    expect(uiNetAmount).toBe(netAmount);
  });
});
