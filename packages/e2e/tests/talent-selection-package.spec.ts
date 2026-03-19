/**
 * Multi-selection and cross-view validation
 *
 * Senaryo:
 *   Talent listesinde label text'e göre belirli talentlar seçilir,
 *   toolbar sayısı doğrulanır, "Paket Oluştur" ile package sayfasına
 *   geçilir ve seçilen / seçilmeyen talentların doğru render edildiği
 *   cross-view olarak doğrulanır.
 */

import { test, expect, type Locator } from '@playwright/test';

// ─── Sabit test verisi ──────────────────────────────────────────────────────

const allTalents = [
  'Ayşe Yılmaz',
  'Mehmet Kara',
  'Zeynep Demir',
  'Can Öztürk',
  'Elif Aksoy',
  'Burak Çelik',
];

const selectedTalents = ['Ayşe Yılmaz', 'Zeynep Demir', 'Burak Çelik'];

const unselectedTalents = allTalents.filter(
  (name) => !selectedTalents.includes(name),
);

// ─── Yardımcı: checkbox'ın bağlı olduğu label text'ini oku ─────────────────

async function getLabelOf(checkbox: Locator): Promise<string> {
  // DOM yapısı:  <label>  ← parent card
  //                <input data-testid="talent-checkbox" />
  //                <span  data-testid="talent-label">İsim</span>
  //              </label>
  // locator('..') → <label> card'ına çıkar
  const text = await checkbox
    .locator('..')
    .getByTestId('talent-label')
    .textContent();
  return text?.trim() ?? '';
}

// ─── Yardımcı: selectedTalents içindekileri label text'e göre seç ───────────

async function selectByLabel(
  page: import('@playwright/test').Page,
  targets: string[],
): Promise<void> {
  const checkboxes = await page.getByTestId('talent-checkbox').all();

  for (const checkbox of checkboxes) {
    const label = await getLabelOf(checkbox);
    if (targets.includes(label)) {
      await checkbox.click();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANA TEST
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Multi-selection and cross-view validation', () => {
  test(
    'Seçilen talentlar toolbar sayısı, route değişimi ve package kartları üzerinden doğrulanır',
    async ({ page }) => {
      // ── 1. Talent listesi sayfasına git ──────────────────────────────────
      await page.goto('/portfolio');
      await expect(page.getByTestId('talent-page')).toBeVisible();

      // ── 2. Tüm checkbox'ları getByTestId ile al ───────────────────────────
      const checkboxes = page.getByTestId('talent-checkbox');
      await expect(checkboxes).toHaveCount(allTalents.length);

      // ── 3. Label text'e göre yalnızca selectedTalents'ı seç ──────────────
      await selectByLabel(page, selectedTalents);

      // Seçilen checkbox'ların gerçekten checked olduğunu doğrula
      const allCheckboxes = await checkboxes.all();
      for (const cb of allCheckboxes) {
        const label = await getLabelOf(cb);
        if (selectedTalents.includes(label)) {
          await expect(cb).toBeChecked();
        } else {
          await expect(cb).not.toBeChecked();
        }
      }

      // ── 4. Toolbar'daki seçim sayısı = selectedTalents.length ────────────
      const countEl = page.getByTestId('talent-selected-count');
      await expect(countEl).toContainText(String(selectedTalents.length));

      // ── 5. "Paket Oluştur" butonuna tıkla ────────────────────────────────
      const createBtn = page.getByTestId('talent-create-package-button');
      await expect(createBtn).toBeEnabled();
      await createBtn.click();

      // ── 6. Portfolio Package sayfasına yönlendirildiğini doğrula ─────────
      await expect(page).toHaveURL('/portfolio/package');
      await expect(page.getByTestId('package-page')).toBeVisible();

      // ── 7. Seçilen talentların card olarak render edildiğini doğrula ──────
      const cards = page.getByTestId('package-card');
      await expect(cards).toHaveCount(selectedTalents.length);

      // ── 8. Package card isimlerinin selectedTalents ile eşleştiğini doğrula
      const packageLabels = await page
        .getByTestId('package-talent-label')
        .allTextContents();
      const packageNames = packageLabels.map((t) => t.trim());

      // Sıra farklı olabilir → set karşılaştırması
      expect(packageNames.sort()).toEqual([...selectedTalents].sort());

      // Her seçilen talent için bireysel kart kontrolü
      for (const name of selectedTalents) {
        const card = cards.filter({ hasText: name });
        await expect(card).toBeVisible();
        await expect(card.getByTestId('package-talent-label')).toHaveText(name);
        await expect(card.getByTestId('package-talent-photo')).toBeVisible();
      }

      // ── 9. Seçilmeyen talentların görünmediğini doğrula ──────────────────
      for (const name of unselectedTalents) {
        const absentCard = cards.filter({ hasText: name });
        await expect(absentCard).toHaveCount(0);
      }
    },
  );
});
